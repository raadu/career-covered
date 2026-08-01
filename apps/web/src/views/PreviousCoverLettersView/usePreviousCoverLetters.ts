import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from 'store';
import { showToast } from 'components/common/Toast';
import type { CoverLetterItem, PaginatedResponse } from './types';

export function usePreviousCoverLetters() {
  const { isAuthenticated, isLoading: authLoading } = useSelector(
    (state: RootState) => state.auth,
  );

  const [data, setData] = useState<CoverLetterItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBatchConfirm, setShowBatchConfirm] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPage = useCallback(
    async (p: number, size?: number) => {
      setIsLoading(true);
      const limit = size ?? pageSize;
      try {
        const res = await fetch(`/api/cover-letters?page=${p}&limit=${limit}`);
        if (!res.ok) throw new Error('Failed to fetch cover letters');
        const json: PaginatedResponse = await res.json();
        setData(json.data ?? []);
        setTotal(json.total ?? 0);
        setPage(json.page ?? 1);
        setTotalPages(json.totalPages ?? 0);
      } catch {
        showToast('Failed to load cover letters', { type: 'error' });
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

  const safeData = data ?? [];
  const allSelected =
    safeData.length > 0 && safeData.every((item) => selectedIds.has(item.id));
  const someSelected = safeData.some((item) => selectedIds.has(item.id));

  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(safeData.map((item) => item.id)));
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

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(`/api/cover-letters/${deletingId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete cover letter');
      showToast('Cover letter has been removed', { duration: 2000 });
      setDeletingId(null);
      const newTotal = total - 1;
      const newTotalPages = Math.ceil(newTotal / pageSize);
      const targetPage =
        page > newTotalPages && newTotalPages > 0 ? newTotalPages : page;
      fetchPage(targetPage);
    } catch {
      showToast('Failed to delete cover letter', { type: 'error' });
    }
  };

  const handleBatchDelete = async () => {
    try {
      const res = await fetch('/api/cover-letters/batch', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      if (!res.ok) throw new Error('Failed to delete cover letters');
      showToast(
        `${selectedIds.size} cover letter${selectedIds.size > 1 ? 's' : ''} removed`,
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
      showToast('Failed to delete cover letters', { type: 'error' });
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
    deletingId,
    setDeletingId,
    toggleSelectAll,
    clearSelection,
    toggleSelect,
    handlePageChange,
    handlePageSizeChange,
    handleDelete,
    handleBatchDelete,
  };
}
