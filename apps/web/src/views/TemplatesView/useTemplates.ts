import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from 'store';
import { showToast } from 'components/common/Toast';
import { sanitize } from 'utils/sanitizeUtils';
import type { Template, PaginatedResponse } from './types';

const sanitizeInput = (value: string) => sanitize(value).trim();

export function useTemplates() {
  const { isAuthenticated, isLoading: authLoading } = useSelector(
    (state: RootState) => state.auth,
  );

  const [data, setData] = useState<Template[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBatchConfirm, setShowBatchConfirm] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createContent, setCreateContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [editName, setEditName] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(
    null,
  );

  const fetchPage = useCallback(
    async (p: number, size?: number) => {
      setIsLoading(true);
      const limit = size ?? pageSize;
      try {
        const res = await fetch(
          `/api/templates?page=${p}&limit=${limit}&sortByUpdateTime=true`,
        );
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
    },
    [pageSize],
  );

  useEffect(() => {
    if (isAuthenticated) fetchPage(1);
  }, [isAuthenticated, fetchPage]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [data]);

  const allSelected =
    data.length > 0 && data.every((t) => selectedIds.has(t.id));
  const someSelected = data.some((t) => selectedIds.has(t.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.map((t) => t.id)));
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handlePageChange = (p: number) => fetchPage(p + 1);
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    fetchPage(1, size);
  };

  const handleCreate = async () => {
    const safeName = sanitizeInput(createName);
    const safeContent = sanitizeInput(createContent);
    if (!safeName || !safeContent) return;

    setIsCreating(true);
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: safeName, content: safeContent }),
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

  const openEditModal = (tpl: Template) => {
    setEditingTemplate(tpl);
    setEditName(tpl.name);
    setEditContent(tpl.content);
  };

  const handleUpdate = async () => {
    const safeName = sanitizeInput(editName);
    const safeContent = sanitizeInput(editContent);
    if (!editingTemplate || !safeName || !safeContent) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/templates/${editingTemplate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: safeName, content: safeContent }),
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
      const res = await fetch(`/api/templates/${deletingTemplateId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete template');
      showToast('Template has been removed', { duration: 2000 });
      setDeletingTemplateId(null);
      const newTotal = total - 1;
      const newTotalPages = Math.ceil(newTotal / pageSize);
      const targetPage =
        page > newTotalPages && newTotalPages > 0 ? newTotalPages : page;
      fetchPage(targetPage);
    } catch {
      showToast('Failed to delete template', { type: 'error' });
    }
  };

  const handleBatchDelete = async () => {
    try {
      const res = await fetch('/api/templates/batch', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      if (!res.ok) throw new Error('Failed to delete templates');
      showToast(
        `${selectedIds.size} template${selectedIds.size > 1 ? 's' : ''} removed`,
        { duration: 2000 },
      );
      setShowBatchConfirm(false);
      setSelectedIds(new Set());
      const newTotal = total - selectedIds.size;
      const newTotalPages = Math.ceil(newTotal / pageSize);
      const targetPage =
        page > newTotalPages && newTotalPages > 0 ? newTotalPages : page;
      fetchPage(targetPage);
    } catch {
      showToast('Failed to delete templates', { type: 'error' });
    }
  };

  return {
    authLoading,
    isAuthenticated,
    data,
    total,
    page,
    totalPages,
    pageSize,
    isLoading,
    selectedIds,
    allSelected,
    someSelected,
    showBatchConfirm,
    setShowBatchConfirm,
    isCreateOpen,
    setIsCreateOpen,
    createName,
    setCreateName,
    createContent,
    setCreateContent,
    isCreating,
    editingTemplate,
    setEditingTemplate,
    editName,
    setEditName,
    editContent,
    setEditContent,
    isUpdating,
    deletingTemplateId,
    setDeletingTemplateId,
    toggleSelectAll,
    clearSelection,
    toggleSelect,
    handlePageChange,
    handlePageSizeChange,
    handleCreate,
    openEditModal,
    handleUpdate,
    handleDelete,
    handleBatchDelete,
  };
}
