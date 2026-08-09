import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from 'store';
import { showToast } from 'components/common/Toast';
import type { Resume } from './types';
import { MAX_RESUMES, MAX_FILE_BYTES } from './resumeConstants';

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
  const [isUploading, setIsUploading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);

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

  const validateFile = (file: File): string | null => {
    if (data.length >= MAX_RESUMES) {
      return `You can only have up to ${MAX_RESUMES} resumes`;
    }
    if (file.type !== 'application/pdf') {
      return 'Only PDF files are supported';
    }
    if (file.size > MAX_FILE_BYTES) {
      return 'File exceeds the 10MB size limit';
    }
    return null;
  };

  const uploadResume = async (file: File) => {
    const error = validateFile(file);
    if (error) {
      showToast(error, { type: 'error' });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/resumes', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        throw new Error(await extractErrorMessage(res, 'Failed to upload resume'));
      }
      showToast('Resume uploaded', { duration: 2000 });
      await fetchResumes();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to upload resume', {
        type: 'error',
      });
    } finally {
      setIsUploading(false);
    }
  };

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
      showToast(err instanceof Error ? err.message : 'Failed to replace resume', {
        type: 'error',
      });
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
  };
}
