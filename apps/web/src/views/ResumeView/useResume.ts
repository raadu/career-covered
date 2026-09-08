import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from 'store';
import { showToast } from 'components/common/Toast';
import { useResumeUpload } from 'hooks/useResumeUpload';
import { MAX_FILE_BYTES } from 'utils/resumeConstants';
import type { Resume } from './types';

async function extractErrorMessage(
  res: Response,
  fallback: string,
): Promise<string> {
  const body = await res.json().catch(() => null);
  return (body?.message as string | undefined) || fallback;
}

export function useResume() {
  const { isAuthenticated, isLoading: authLoading } = useSelector(
    (state: RootState) => state.auth,
  );

  const [data, setData] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);

  // List view only — Grid view has no pagination/selection concept.
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const pageCount = Math.max(1, Math.ceil(data.length / pageSize));
  const pagedData = data.slice(
    pageIndex * pageSize,
    pageIndex * pageSize + pageSize,
  );

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBatchConfirm, setShowBatchConfirm] = useState(false);

  const fetchResumes = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/resumes');
      if (!res.ok) throw new Error('Failed to fetch resumes');
      const json: Resume[] = await res.json();
      setData(json);
    } catch {
      showToast('Failed to load resumes', { type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchResumes();
  }, [isAuthenticated, fetchResumes]);

  // Clamp back onto the last valid page if it shrinks out from under us
  // (e.g. deleting the only resume on the last page).
  useEffect(() => {
    if (pageIndex > 0 && pageIndex >= pageCount) {
      setPageIndex(pageCount - 1);
    }
  }, [pageIndex, pageCount]);

  // Selection is page-scoped, same as the Templates/PreviousCoverLetters
  // tables (whose selection resets on every page change too, just as a
  // side effect of those pages being server-refetched — here it's explicit
  // since resumes are all fetched at once).
  useEffect(() => {
    setSelectedIds(new Set());
  }, [data, pageIndex]);

  const {
    uploadResume: uploadResumeFile,
    isUploading,
    notifyMaxResumesReached,
  } = useResumeUpload(fetchResumes);
  const uploadResume = (file: File) => uploadResumeFile(file, data.length);

  const replaceResume = async (id: string, file: File) => {
    if (file.type !== 'application/pdf') {
      showToast('Only PDF files are supported', { type: 'error' });
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      showToast('File exceeds the 10MB size limit', { type: 'error' });
      return;
    }

    setBusyId(id);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`/api/resumes/${id}/replace`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        throw new Error(
          await extractErrorMessage(res, 'Failed to replace resume'),
        );
      }
      showToast('Resume replaced', { duration: 2000 });
      await fetchResumes();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to replace resume',
        {
          type: 'error',
        },
      );
    } finally {
      setBusyId(null);
    }
  };

  const renameResume = async (id: string, name: string) => {
    const previous = data;
    setData((prev) => prev.map((r) => (r.id === id ? { ...r, name } : r)));
    try {
      const res = await fetch(`/api/resumes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error('Failed to rename resume');
    } catch {
      setData(previous);
      showToast('Failed to rename resume', { type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    const id = deletingId;
    try {
      const res = await fetch(`/api/resumes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete resume');
      showToast('Resume deleted', { duration: 2000 });
      setDeletingId(null);
      setData((prev) => prev.filter((r) => r.id !== id));
    } catch {
      showToast('Failed to delete resume', { type: 'error' });
    }
  };

  const reorderResumes = async (newOrder: Resume[]) => {
    const previous = data;
    setData(newOrder);
    try {
      const res = await fetch('/api/resumes/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: newOrder.map((r) => r.id) }),
      });
      if (!res.ok) throw new Error('Failed to reorder resumes');
      const json: Resume[] = await res.json();
      setData(json);
    } catch {
      setData(previous);
      showToast('Failed to reorder resumes', { type: 'error' });
    }
  };

  // Dragging only ever reorders within the visible page (rows on other
  // pages aren't in the DOM to drag to/from), so the reordered page slice
  // is merged back into its original position in the full list before
  // being sent to the server as the authoritative new order.
  const reorderPagedResumes = (newPagedOrder: Resume[]) => {
    const start = pageIndex * pageSize;
    const newFullOrder = [
      ...data.slice(0, start),
      ...newPagedOrder,
      ...data.slice(start + newPagedOrder.length),
    ];
    reorderResumes(newFullOrder);
  };

  const allSelected =
    pagedData.length > 0 && pagedData.every((r) => selectedIds.has(r.id));
  const someSelected = pagedData.some((r) => selectedIds.has(r.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pagedData.map((r) => r.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBatchDelete = async () => {
    try {
      const res = await fetch('/api/resumes/batch', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      if (!res.ok) throw new Error('Failed to delete resumes');
      showToast(
        `${selectedIds.size} resume${selectedIds.size > 1 ? 's' : ''} removed`,
        { duration: 2000 },
      );
      setShowBatchConfirm(false);
      setSelectedIds(new Set());
      await fetchResumes();
    } catch {
      showToast('Failed to delete resumes', { type: 'error' });
    }
  };

  const handlePageChange = (page: number) => setPageIndex(page);
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageIndex(0);
  };

  return {
    authLoading,
    isAuthenticated,
    data,
    isLoading,
    isUploading,
    busyId,
    deletingId,
    setDeletingId,
    previewId,
    setPreviewId,
    uploadResume,
    replaceResume,
    renameResume,
    handleDelete,
    reorderResumes,
    notifyMaxResumesReached,
    pagedData,
    pageIndex,
    pageSize,
    pageCount,
    handlePageChange,
    handlePageSizeChange,
    reorderPagedResumes,
    selectedIds,
    allSelected,
    someSelected,
    toggleSelectAll,
    toggleSelect,
    clearSelection,
    showBatchConfirm,
    setShowBatchConfirm,
    handleBatchDelete,
  };
}
