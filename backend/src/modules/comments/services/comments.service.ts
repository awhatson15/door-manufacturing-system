import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment, CommentStatus } from '../entities/comment.entity';
import { Order } from '../../orders/entities/order.entity';
import { User } from '../../users/entities/user.entity';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { QueryCommentDto } from '../dto/query-comment.dto';
import { HistoryService } from '../../history/services/history.service';
import { HistoryAction, HistoryEntityType } from '../../history/entities/history.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly historyService: HistoryService,
  ) {}

  /**
   * Создание нового комментария
   */
  async create(createCommentDto: CreateCommentDto, currentUserId: string): Promise<Comment> {
    const { orderId, content, type, parentId } = createCommentDto;

    // Проверяем существование заявки
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Заявка не найдена');
    }

    // Получаем пользователя
    const author = await this.userRepository.findOne({ where: { id: currentUserId } });
    if (!author) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Проверяем родительский комментарий, если указан
    let parent: Comment | undefined;
    if (parentId) {
      parent = await this.commentRepository.findOne({ where: { id: parentId } });
      if (!parent) {
        throw new NotFoundException('Родительский комментарий не найден');
      }
      if (parent.order.id !== orderId) {
        throw new BadRequestException('Родительский комментарий принадлежит другой заявке');
      }
    }

    // Создаем комментарий
    const comment = this.commentRepository.create({
      content,
      type: type || ('internal' as any),
      status: CommentStatus.ACTIVE,
      order,
      author,
      parentId,
      isPinned: false,
      isEdited: false,
      replyCount: 0,
    } as any);

    const savedComment = await this.commentRepository.save(comment) as unknown as Comment;

    // Увеличиваем счетчик ответов в родительском комментарии
    if (parent) {
      parent.replyCount += 1;
      await this.commentRepository.save(parent);
    }

    // Обновляем счетчик комментариев в заявке
    order.commentsCount += 1;
    await this.orderRepository.save(order);

    // Записываем в историю
    await this.historyService.recordAction(
      currentUserId,
      HistoryAction.COMMENT_ADD,
      HistoryEntityType.ORDER,
      order.id,
      null,
      {
        commentType: savedComment.type,
        isReply: !!parentId,
      },
      `Добавлен ${savedComment.typeText.toLowerCase()} комментарий`,
    );

    return savedComment;
  }

  /**
   * Получение списка комментариев с фильтрацией
   */
  async findAll(queryDto: QueryCommentDto): Promise<Comment[]> {
    const { orderId, authorId, type, status } = queryDto;

    const queryBuilder = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.order', 'order')
      .leftJoinAndSelect('comment.author', 'author')
      .leftJoinAndSelect('comment.replies', 'replies')
      .leftJoinAndSelect('comment.files', 'files')
      .orderBy('comment.isPinned', 'DESC')
      .addOrderBy('comment.createdAt', 'ASC');

    if (orderId) {
      queryBuilder.andWhere('comment.order.id = :orderId', { orderId });
    }

    if (authorId) {
      queryBuilder.andWhere('comment.author.id = :authorId', { authorId });
    }

    if (type) {
      queryBuilder.andWhere('comment.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('comment.status = :status', { status });
    } else {
      // По умолчанию показываем только активные
      queryBuilder.andWhere('comment.status = :status', { status: CommentStatus.ACTIVE });
    }

    // Показываем только корневые комментарии (без родителя)
    queryBuilder.andWhere('comment.parentId IS NULL');

    return await queryBuilder.getMany();
  }

  /**
   * Получение комментария по ID
   */
  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['order', 'author', 'replies', 'replies.author', 'files'],
    });

    if (!comment) {
      throw new NotFoundException('Комментарий не найден');
    }

    return comment;
  }

  /**
   * Обновление комментария
   */
  async update(
    id: string,
    updateCommentDto: UpdateCommentDto,
    currentUserId: string,
  ): Promise<Comment> {
    const comment = await this.findOne(id);

    // Проверяем, что пользователь является автором комментария
    if (comment.author.id !== currentUserId) {
      throw new ForbiddenException('Вы не можете редактировать чужой комментарий');
    }

    const { content, editReason, isPinned } = updateCommentDto;

    comment.content = content;
    comment.isEdited = true;
    comment.editedAt = new Date();
    if (editReason) {
      comment.editReason = editReason;
    }
    if (isPinned !== undefined) {
      comment.isPinned = isPinned;
    }

    const updatedComment = await this.commentRepository.save(comment);

    // Записываем в историю
    await this.historyService.recordAction(
      currentUserId,
      HistoryAction.COMMENT_EDIT,
      HistoryEntityType.ORDER,
      comment.order.id,
      null,
      { editReason },
      `Отредактирован комментарий`,
    );

    return updatedComment;
  }

  /**
   * Удаление комментария (мягкое удаление)
   */
  async remove(id: string, currentUserId: string): Promise<void> {
    const comment = await this.findOne(id);

    // Проверяем, что пользователь является автором комментария
    if (comment.author.id !== currentUserId) {
      throw new ForbiddenException('Вы не можете удалить чужой комментарий');
    }

    // Мягкое удаление
    comment.status = CommentStatus.DELETED;
    comment.content = '[Комментарий удален]';
    await this.commentRepository.save(comment);

    // Обновляем счетчик комментариев в заявке
    const order = comment.order;
    if (order.commentsCount > 0) {
      order.commentsCount -= 1;
      await this.orderRepository.save(order);
    }

    // Уменьшаем счетчик ответов в родительском комментарии
    if (comment.parentId) {
      const parent = await this.commentRepository.findOne({ where: { id: comment.parentId } });
      if (parent && parent.replyCount > 0) {
        parent.replyCount -= 1;
        await this.commentRepository.save(parent);
      }
    }

    // Записываем в историю
    await this.historyService.recordAction(
      currentUserId,
      HistoryAction.COMMENT_DELETE,
      HistoryEntityType.ORDER,
      comment.order.id,
      null,
      null,
      `Удален комментарий`,
    );
  }

  /**
   * Закрепление/открепление комментария
   */
  async togglePin(id: string, currentUserId: string): Promise<Comment> {
    const comment = await this.findOne(id);

    comment.isPinned = !comment.isPinned;
    const updatedComment = await this.commentRepository.save(comment);

    // Записываем в историю
    await this.historyService.recordAction(
      currentUserId,
      HistoryAction.UPDATE,
      HistoryEntityType.ORDER,
      comment.order.id,
      { isPinned: !comment.isPinned },
      { isPinned: comment.isPinned },
      comment.isPinned ? 'Комментарий закреплен' : 'Комментарий откреплен',
    );

    return updatedComment;
  }

  /**
   * Получение количества комментариев по заявке
   */
  async getCountByOrder(orderId: string): Promise<number> {
    return await this.commentRepository.count({
      where: {
        order: { id: orderId },
        status: CommentStatus.ACTIVE,
      },
    });
  }
}
