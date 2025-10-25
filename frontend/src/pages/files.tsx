import { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { filesApi, FileEntity } from '@/api/files';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  DocumentIcon,
  PhotoIcon,
  DocumentChartBarIcon,
  FolderIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

const FilesPage: NextPage = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [files, setFiles] = useState<FileEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('');
  const [totalFiles, setTotalFiles] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await filesApi.findAll({
        page: currentPage,
        limit: pageSize,
        search: searchQuery || undefined,
        type: typeFilter || undefined,
        visibility: visibilityFilter || undefined,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      });
      setFiles(response.data);
      setTotalFiles(response.total);
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке файлов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchFiles();
    }
  }, [isAuthenticated, currentPage, typeFilter, visibilityFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchFiles();
  };

  const handleDownload = async (file: FileEntity) => {
    try {
      await filesApi.download(file.id, file.originalName);
      toast.success('Файл загружен');
    } catch (error) {
      toast.error('Ошибка при скачивании файла');
    }
  };

  const handleDelete = async (file: FileEntity) => {
    if (!confirm(`Вы уверены, что хотите удалить файл "${file.originalName}"?`)) {
      return;
    }

    try {
      await filesApi.remove(file.id);
      toast.success('Файл удален');
      fetchFiles();
    } catch (error) {
      toast.error('Ошибка при удалении файла');
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'IMAGE':
        return <PhotoIcon className="w-5 h-5 text-purple-600" />;
      case 'DRAWING':
        return <DocumentChartBarIcon className="w-5 h-5 text-blue-600" />;
      case 'DOCUMENT':
        return <DocumentIcon className="w-5 h-5 text-gray-600" />;
      default:
        return <FolderIcon className="w-5 h-5 text-orange-600" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const styles = {
      DOCUMENT: 'bg-gray-100 text-gray-800',
      IMAGE: 'bg-purple-100 text-purple-800',
      DRAWING: 'bg-blue-100 text-blue-800',
      OTHER: 'bg-orange-100 text-orange-800',
    };
    const labels = {
      DOCUMENT: 'Документ',
      IMAGE: 'Изображение',
      DRAWING: 'Чертеж',
      OTHER: 'Другое',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[type as keyof typeof styles]}`}>
        {labels[type as keyof typeof labels]}
      </span>
    );
  };

  const getVisibilityBadge = (visibility: string) => {
    const styles = {
      PUBLIC: 'bg-green-100 text-green-800',
      PRIVATE: 'bg-red-100 text-red-800',
      INTERNAL: 'bg-yellow-100 text-yellow-800',
    };
    const labels = {
      PUBLIC: 'Публичный',
      PRIVATE: 'Приватный',
      INTERNAL: 'Внутренний',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[visibility as keyof typeof styles]}`}>
        {labels[visibility as keyof typeof labels]}
      </span>
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Файлы - Система учёта заявок</title>
      </Head>

      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Файлы</h1>
              <p className="text-sm text-gray-600 mt-1">
                Управление загруженными файлами и документами
              </p>
            </div>
            <button
              onClick={() => toast.success('Функция загрузки файлов в разработке')}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Загрузить файл
            </button>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Поиск по названию файла..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Искать
                </button>
              </form>

              <div className="flex gap-2">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Все типы</option>
                  <option value="DOCUMENT">Документы</option>
                  <option value="IMAGE">Изображения</option>
                  <option value="DRAWING">Чертежи</option>
                  <option value="OTHER">Другое</option>
                </select>

                <select
                  value={visibilityFilter}
                  onChange={(e) => setVisibilityFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Все файлы</option>
                  <option value="PUBLIC">Публичные</option>
                  <option value="PRIVATE">Приватные</option>
                  <option value="INTERNAL">Внутренние</option>
                </select>

                <button
                  onClick={fetchFiles}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Обновить"
                >
                  <ArrowPathIcon className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Files List */}
          <div className="bg-white rounded-lg shadow">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-red-600">{error}</p>
                <button
                  onClick={fetchFiles}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Попробовать снова
                </button>
              </div>
            ) : files.length === 0 ? (
              <div className="p-8 text-center">
                <FolderIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Файлов не найдено</p>
                <button
                  onClick={() => toast.success('Функция загрузки файлов в разработке')}
                  className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Загрузить первый файл
                </button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Файл
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Размер
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Тип
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Видимость
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Заявка
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Загружено
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Загружено от
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Действия
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {files.map((file) => (
                        <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getFileIcon(file.type)}
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">
                                  {file.originalName}
                                </p>
                                {file.description && (
                                  <p className="text-xs text-gray-500">{file.description}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatFileSize(file.size)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getTypeBadge(file.type)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getVisibilityBadge(file.visibility)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {file.order ? (
                              <Link
                                href={`/orders/${file.order.id}`}
                                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                {file.order.orderNumber}
                              </Link>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatDate(file.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {file.uploadedBy?.name || 'Неизвестно'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDownload(file)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Скачать"
                              >
                                <ArrowDownTrayIcon className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(file)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Удалить"
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalFiles > pageSize && (
                  <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Показано {(currentPage - 1) * pageSize + 1}-
                      {Math.min(currentPage * pageSize, totalFiles)} из {totalFiles} файлов
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Назад
                      </button>
                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(Math.ceil(totalFiles / pageSize), prev + 1)
                          )
                        }
                        disabled={currentPage >= Math.ceil(totalFiles / pageSize)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Вперед
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default FilesPage;
