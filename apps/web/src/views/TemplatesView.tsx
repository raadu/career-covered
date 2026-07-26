import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { type ColumnDef } from '@tanstack/react-table';
import { FaPencilAlt, FaTrash, FaPlus } from 'react-icons/fa';
import type { RootState } from 'store';
import DataTable from 'components/common/DataTable';
import CommonButton from 'components/common/CommonButton';
import ConfirmModal from 'components/common/ConfirmModal';
import { showToast } from 'components/common/Toast';

interface Template {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse {
  data: Template[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const TemplatesView = () => {
  const { isAuthenticated, isLoading: authLoading } = useSelector((state: RootState) => state.auth);

  const [data, setData] = useState<Template[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createContent, setCreateContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [editName, setEditName] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(null);

  const fetchPage = useCallback(async (p: number, size?: number) => {
    setIsLoading(true);
    const limit = size ?? pageSize;
    try {
      const res = await fetch(`/api/templates?page=${p}&limit=${limit}&sortByUpdateTime=true`);
      if (!res.ok) throw new Error('Failed to fetch templates');
      const json: PaginatedResponse = await res.json();
      setData(json.data);
      setTotal(json.total);
      setPage(json.page);
      setTotalPages(json.totalPages);
    } catch {
      showToast('Failed to load templates', { type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPage(1);
    }
  }, [isAuthenticated, fetchPage]);

  const handlePageChange = (p: number) => {
    fetchPage(p + 1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    fetchPage(1, size);
  };

  const handleCreate = async () => {
    if (!createName.trim() || !createContent.trim()) return;
    setIsCreating(true);
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: createName.trim(), content: createContent.trim() }),
      });
      if (!res.ok) throw new Error('Failed to create template');
      showToast('New template added', { duration: 2000 });
      setIsCreateOpen(false);
      setCreateName('');
      setCreateContent('');
      fetchPage(1);
    } catch {
      showToast('Failed to create template', { type: 'error' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleEdit = (tpl: Template) => {
    setEditingTemplate(tpl);
    setEditName(tpl.name);
    setEditContent(tpl.content);
  };

  const handleUpdate = async () => {
    if (!editingTemplate || !editName.trim() || !editContent.trim()) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/templates/${editingTemplate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim(), content: editContent.trim() }),
      });
      if (!res.ok) throw new Error('Failed to update template');
      showToast('Template updated', { duration: 2000 });
      setEditingTemplate(null);
      setEditName('');
      setEditContent('');
      fetchPage(page);
    } catch {
      showToast('Failed to update template', { type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTemplateId) return;
    try {
      const res = await fetch(`/api/templates/${deletingTemplateId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete template');
      showToast('Template has been removed', { duration: 2000 });
      setDeletingTemplateId(null);
      const newTotal = total - 1;
      const newTotalPages = Math.ceil(newTotal / pageSize);
      const targetPage = page > newTotalPages && newTotalPages > 0 ? newTotalPages : page;
      fetchPage(targetPage);
    } catch {
      showToast('Failed to delete template', { type: 'error' });
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  const columns: ColumnDef<Template>[] = [
    {
      header: 'Name',
      accessorKey: 'name',
      cell: ({ getValue }) => (
        <span className="truncate overflow-hidden text-ellipsis whitespace-nowrap max-w-[180px] font-semibold text-gray-900 dark:text-gray-100 block">
          {getValue<string>()}
        </span>
      ),
    },
    {
      header: 'Content',
      accessorKey: 'content',
      cell: ({ row }) => (
        <span
          className="truncate overflow-hidden text-ellipsis whitespace-nowrap max-w-[300px] text-gray-500 dark:text-gray-400 block cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          onClick={() => handleEdit(row.original)}
          title="Click to edit"
        >
          {row.original.content}
        </span>
      ),
    },
    {
      header: 'Last Updated',
      accessorKey: 'updatedAt',
      cell: ({ getValue }) => (
        <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDate(getValue<string>())}</span>
      ),
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }) => (
        <div className="border border-gray-200 dark:border-gray-600 rounded px-2 py-1 flex items-center gap-1 w-fit">
          <button
            onClick={() => handleEdit(row.original)}
            className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-sm transition-colors"
            title="Edit Template"
          >
            <FaPencilAlt size={12} />
          </button>
          <div className="w-px h-4 bg-gray-200 dark:bg-gray-600" />
          <button
            onClick={() => setDeletingTemplateId(row.original.id)}
            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-sm transition-colors"
            title="Delete Template"
          >
            <FaTrash size={12} />
          </button>
        </div>
      ),
    },
  ];

  if (authLoading) return null;
  if (!isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="py-6 md:py-8 px-1 sm:px-2">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
            Cover Letter Templates
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            You have {total} {total === 1 ? 'template' : 'templates'}
          </p>
        </div>
        <CommonButton
          variant="dark"
          icon={<FaPlus size={12} />}
          onClick={() => setIsCreateOpen(true)}
        >
          New Template
        </CommonButton>
      </div>

      <DataTable
        columns={columns}
        data={data}
        pageCount={totalPages}
        pageIndex={page - 1}
        pageSize={pageSize}
        total={total}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        isLoading={isLoading}
        emptyMessage="No templates yet. Create one to get started."
      />

      {isCreateOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => { if (!isCreating) setIsCreateOpen(false); }}
        >
          <div
            className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-sm shadow-xl border border-gray-200 dark:border-gray-700 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Add a New Template</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">Template Name</label>
                <input
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="Fullstack Developer Template"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">Template Content</label>
                <textarea
                  value={createContent}
                  onChange={(e) => setCreateContent(e.target.value)}
                  placeholder="Write or paste down your cover letter template. This template will say your name, a little bit about yourself and maybe your Linkedin URL. These information from the template will be used to create a personalized cover letter for you."
                  rows={6}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <CommonButton
                variant="secondary"
                onClick={() => setIsCreateOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </CommonButton>
              <CommonButton
                variant="dark"
                onClick={handleCreate}
                isLoading={isCreating}
                disabled={!createName.trim() || !createContent.trim()}
              >
                Create
              </CommonButton>
            </div>
          </div>
        </div>
      )}

      {editingTemplate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => { if (!isUpdating) setEditingTemplate(null); }}
        >
          <div
            className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-sm shadow-xl border border-gray-200 dark:border-gray-700 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Edit Template</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">Name</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">Content</label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <CommonButton
                variant="secondary"
                onClick={() => setEditingTemplate(null)}
                disabled={isUpdating}
              >
                Cancel
              </CommonButton>
              <CommonButton
                variant="dark"
                onClick={handleUpdate}
                isLoading={isUpdating}
                disabled={!editName.trim() || !editContent.trim()}
              >
                Save
              </CommonButton>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deletingTemplateId !== null}
        title="Delete template"
        message="Do you really want to delete it?"
        confirmLabel="Sure!"
        cancelLabel="Nope"
        onConfirm={handleDelete}
        onCancel={() => setDeletingTemplateId(null)}
      />
    </div>
  );
};

export default TemplatesView;
