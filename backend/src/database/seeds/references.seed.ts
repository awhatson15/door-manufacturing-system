import { DataSource } from 'typeorm';
import { DoorType } from '../../modules/references/entities/door-type.entity';
import { RalColor } from '../../modules/references/entities/ral-color.entity';
import { Lock } from '../../modules/references/entities/lock.entity';
import {
  Threshold,
  ThresholdType,
} from '../../modules/references/entities/threshold.entity';
import { CancelReason } from '../../modules/references/entities/cancel-reason.entity';

export async function seedReferences(dataSource: DataSource) {
  await seedDoorTypes(dataSource);
  await seedRalColors(dataSource);
  await seedLocks(dataSource);
  await seedThresholds(dataSource);
  await seedCancelReasons(dataSource);
}

async function seedDoorTypes(dataSource: DataSource) {
  const repository = dataSource.getRepository(DoorType);

  const doorTypesData = [
    {
      name: 'Техническая дверь',
      fireproof: false,
      requiresShieldNumber: false,
      thicknessOuter: 1.5,
      thicknessInner: 1.2,
      description: 'Стандартная техническая дверь для подсобных помещений',
    },
    {
      name: 'Противопожарная дверь EI-30',
      fireproof: true,
      requiresShieldNumber: true,
      thicknessOuter: 2.0,
      thicknessInner: 1.5,
      description: 'Противопожарная дверь с пределом огнестойкости 30 минут',
    },
    {
      name: 'Противопожарная дверь EI-60',
      fireproof: true,
      requiresShieldNumber: true,
      thicknessOuter: 2.5,
      thicknessInner: 2.0,
      description: 'Противопожарная дверь с пределом огнестойкости 60 минут',
    },
    {
      name: 'Входная дверь усиленная',
      fireproof: false,
      requiresShieldNumber: false,
      thicknessOuter: 2.0,
      thicknessInner: 1.5,
      description: 'Усиленная входная дверь для жилых помещений',
    },
    {
      name: 'Тамбурная дверь',
      fireproof: false,
      requiresShieldNumber: false,
      thicknessOuter: 1.5,
      thicknessInner: 1.2,
      description: 'Дверь для тамбура, защита от холода',
    },
  ];

  for (const data of doorTypesData) {
    const existing = await repository.findOne({ where: { name: data.name } });
    if (!existing) {
      const entity = repository.create(data);
      await repository.save(entity);
      console.log(`  ✓ Created door type: ${data.name}`);
    } else {
      console.log(`  ⊘ Door type already exists: ${data.name}`);
    }
  }
}

async function seedRalColors(dataSource: DataSource) {
  const repository = dataSource.getRepository(RalColor);

  const colorsData = [
    {
      code: '8017',
      name: 'Шоколадно-коричневый',
      hex: '#45322E',
      description: 'Популярный темный цвет',
    },
    {
      code: '9003',
      name: 'Сигнально-белый',
      hex: '#F4F4F4',
      description: 'Чистый белый цвет',
    },
    {
      code: '9016',
      name: 'Транспортный белый',
      hex: '#F6F6F6',
      description: 'Белый с кремовым оттенком',
    },
    {
      code: '7004',
      name: 'Сигнально-серый',
      hex: '#969992',
      description: 'Средне-серый',
    },
    {
      code: '7024',
      name: 'Графитовый серый',
      hex: '#474A51',
      description: 'Темно-серый графит',
    },
    {
      code: '6005',
      name: 'Зеленый мох',
      hex: '#2F4538',
      description: 'Темно-зеленый',
    },
    {
      code: '3005',
      name: 'Винно-красный',
      hex: '#5E2129',
      description: 'Бордовый оттенок',
    },
    {
      code: '5002',
      name: 'Ультрамариново-синий',
      hex: '#20214F',
      description: 'Темно-синий',
    },
    {
      code: '1015',
      name: 'Светлая слоновая кость',
      hex: '#E6D690',
      description: 'Бежевый оттенок',
    },
    {
      code: '8019',
      name: 'Серо-коричневый',
      hex: '#403A3A',
      description: 'Темный серо-коричневый',
    },
  ];

  for (const data of colorsData) {
    const existing = await repository.findOne({ where: { code: data.code } });
    if (!existing) {
      const entity = repository.create(data);
      await repository.save(entity);
      console.log(`  ✓ Created RAL color: ${data.code} - ${data.name}`);
    } else {
      console.log(`  ⊘ RAL color already exists: ${data.code}`);
    }
  }
}

async function seedLocks(dataSource: DataSource) {
  const repository = dataSource.getRepository(Lock);

  const locksData = [
    {
      model: 'Гардиан 30.01',
      count: 2,
      hasBolt: true,
      hasCylinder: true,
      hasBronenakladka: true,
      description: 'Двухзамковая система с броненакладкой',
    },
    {
      model: 'Kale 257',
      count: 1,
      hasBolt: true,
      hasCylinder: true,
      hasBronenakladka: false,
      description: 'Сувальдный замок Kale',
    },
    {
      model: 'CISA 15.535',
      count: 1,
      hasBolt: false,
      hasCylinder: true,
      hasBronenakladka: true,
      description: 'Врезной цилиндровый замок с броненакладкой',
    },
    {
      model: 'Mottura 52.771',
      count: 2,
      hasBolt: true,
      hasCylinder: true,
      hasBronenakladka: true,
      description: 'Итальянский замок повышенной надежности',
    },
    {
      model: 'Эльбор 1.04.01',
      count: 1,
      hasBolt: true,
      hasCylinder: false,
      hasBronenakladka: false,
      description: 'Российский сувальдный замок',
    },
    {
      model: 'Без замка',
      count: 0,
      hasBolt: false,
      hasCylinder: false,
      hasBronenakladka: false,
      description: 'Дверь без замковой системы (для подготовки под замок заказчика)',
    },
  ];

  for (const data of locksData) {
    const existing = await repository.findOne({ where: { model: data.model } });
    if (!existing) {
      const entity = repository.create(data);
      await repository.save(entity);
      console.log(`  ✓ Created lock: ${data.model}`);
    } else {
      console.log(`  ⊘ Lock already exists: ${data.model}`);
    }
  }
}

async function seedThresholds(dataSource: DataSource) {
  const repository = dataSource.getRepository(Threshold);

  const thresholdsData = [
    {
      type: ThresholdType.WITH_QUARTER,
      heightMm: 40,
      material: 'Сталь',
      description: 'Стандартный порог с четвертью, высота 40мм',
    },
    {
      type: ThresholdType.WITH_QUARTER,
      heightMm: 50,
      material: 'Сталь',
      description: 'Усиленный порог с четвертью, высота 50мм',
    },
    {
      type: ThresholdType.FLAT,
      heightMm: 20,
      material: 'Алюминий',
      description: 'Низкий плоский порог из алюминия',
    },
    {
      type: ThresholdType.FLAT,
      heightMm: 30,
      material: 'Сталь',
      description: 'Средний плоский порог из стали',
    },
    {
      type: ThresholdType.RETRACTABLE,
      heightMm: 50,
      material: 'Алюминий с резиновым уплотнителем',
      description: 'Выдвижной автоматический порог',
    },
    {
      type: ThresholdType.WITHOUT,
      heightMm: null,
      material: null,
      description: 'Без порога (для помещений с ограниченным доступом)',
    },
  ];

  for (const data of thresholdsData) {
    const existing = await repository.findOne({
      where: { type: data.type, heightMm: data.heightMm },
    });
    if (!existing) {
      const entity = repository.create(data);
      await repository.save(entity);
      console.log(`  ✓ Created threshold: ${data.type} - ${data.heightMm}mm`);
    } else {
      console.log(`  ⊘ Threshold already exists: ${data.type} - ${data.heightMm}mm`);
    }
  }
}

async function seedCancelReasons(dataSource: DataSource) {
  const repository = dataSource.getRepository(CancelReason);

  const cancelReasonsData = [
    {
      name: 'Отказ клиента',
      description: 'Клиент отказался от заказа по личным причинам',
    },
    {
      name: 'Несоответствие размеров',
      description: 'Выявлено несоответствие размеров при замерах',
    },
    {
      name: 'Финансовые причины',
      description: 'Клиент не может оплатить заказ',
    },
    {
      name: 'Изменение проекта',
      description: 'Изменился проект строительства/ремонта',
    },
    {
      name: 'Дубликат заявки',
      description: 'Заявка была создана по ошибке (дубль)',
    },
    {
      name: 'Технические ограничения',
      description: 'Невозможно выполнить заказ по техническим причинам',
    },
    {
      name: 'Нет материалов',
      description: 'Необходимые материалы недоступны',
    },
  ];

  for (const data of cancelReasonsData) {
    const existing = await repository.findOne({ where: { name: data.name } });
    if (!existing) {
      const entity = repository.create(data);
      await repository.save(entity);
      console.log(`  ✓ Created cancel reason: ${data.name}`);
    } else {
      console.log(`  ⊘ Cancel reason already exists: ${data.name}`);
    }
  }
}
