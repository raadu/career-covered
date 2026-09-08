import { useCallback, useState } from 'react';
import { showToast } from 'components/common/Toast';
import {
  MAX_RESUMES,
  MAX_FILE_BYTES,
  MAX_RESUMES_MESSAGE,
} from 'utils/resumeConstants';

async function extractErrorMessage(
  res: Response,
  fallback: string,
): Promise<string> {
  const body = await res.json().catch(() => null);
  return (body?.message as string | undefined) || fallback;
}

function validateFile(file: File): string | null {
  if (file.type !== 'application/pdf') {
    return 'Only PDF files are supported';
  }
  if (file.size > MAX_FILE_BYTES) {
    return 'File exceeds the 10MB size limit';
  }
  return null;
}

// Shared between the Resume management page and the homepage's resume
// selector — both upload against the same endpoint with the same
// validation/cap rules, just react to a successful upload differently
// (full refetch vs. a smaller local list), hence the onUploaded callback.
export function useResumeUpload(onUploaded: () => void) {
  const [isUploading, setIsUploading] = useState(false);

  const notifyMaxResumesReached = useCallback(() => {
    showToast(MAX_RESUMES_MESSAGE, { type: 'error', duration: 4000 });
  }, []);

  const uploadResume = async (file: File, currentCount: number) => {
    if (currentCount >= MAX_RESUMES) {
      notifyMaxResumesReached();
      return;
    }
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
        throw new Error(
          await extractErrorMessage(res, 'Failed to upload resume'),
        );
      }
      showToast('Resume uploaded', { duration: 2000 });
      onUploaded();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to upload resume',
        { type: 'error' },
      );
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadResume, isUploading, notifyMaxResumesReached };
}
