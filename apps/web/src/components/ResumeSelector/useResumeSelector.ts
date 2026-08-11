import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from 'store';
import { showToast } from 'components/common/Toast';
import { useResumeUpload } from 'hooks/useResumeUpload';
import type { Resume } from 'views/ResumeView/types';

export function useResumeSelector(
  selectedResumeId: string | null,
  onSelectResume: (id: string | null) => void,
) {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const fetchResumes = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/resumes');
      if (!res.ok) throw new Error('Failed to fetch resumes');
      const json: Resume[] = await res.json();
      setResumes(json);
    } catch {
      showToast('Failed to load resumes', { type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchResumes();
  }, [isAuthenticated, fetchResumes]);

  // Self-heals a stale selection (e.g. the resume was deleted from the
  // Resume management page in another tab) rather than silently sending
  // no resume context at generate-time with no explanation.
  useEffect(() => {
    if (
      !isLoading &&
      selectedResumeId &&
      !resumes.some((r) => r.id === selectedResumeId)
    ) {
      onSelectResume(null);
    }
  }, [isLoading, resumes, selectedResumeId, onSelectResume]);

  const {
    uploadResume: uploadResumeFile,
    isUploading,
    notifyMaxResumesReached,
  } = useResumeUpload(fetchResumes);
  const uploadResume = (file: File) => uploadResumeFile(file, resumes.length);

  const toggleSelect = (id: string) => {
    onSelectResume(selectedResumeId === id ? null : id);
  };

  return {
    resumes,
    isUploading,
    previewId,
    setPreviewId,
    uploadResume,
    notifyMaxResumesReached,
    toggleSelect,
  };
}
