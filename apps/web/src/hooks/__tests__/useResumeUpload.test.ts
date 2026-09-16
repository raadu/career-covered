import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { useResumeUpload } from '../useResumeUpload';

const mockShowToast = vi.hoisted(() => vi.fn());
vi.mock('components/common/Toast', () => ({ showToast: mockShowToast }));

const pdfFile = (name = 'resume.pdf', size = 1024) => {
  const file = new File(['%PDF-1.4'], name, { type: 'application/pdf' });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('useResumeUpload', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    mockShowToast.mockClear();
  });

  it('rejects a non-PDF file without calling fetch', async () => {
    vi.stubGlobal('fetch', vi.fn());
    const onUploaded = vi.fn();
    const { result } = renderHook(() => useResumeUpload(onUploaded));

    const notAPdf = new File(['hello'], 'notes.txt', { type: 'text/plain' });
    await act(async () => {
      await result.current.uploadResume(notAPdf, 0);
    });

    expect(fetch).not.toHaveBeenCalled();
    expect(mockShowToast).toHaveBeenCalledWith(
      'Only PDF files are supported',
      expect.objectContaining({ type: 'error' }),
    );
  });

  it('rejects a file over the size limit without calling fetch', async () => {
    vi.stubGlobal('fetch', vi.fn());
    const { result } = renderHook(() => useResumeUpload(vi.fn()));

    await act(async () => {
      await result.current.uploadResume(
        pdfFile('big.pdf', 11 * 1024 * 1024),
        0,
      );
    });

    expect(fetch).not.toHaveBeenCalled();
    expect(mockShowToast).toHaveBeenCalledWith(
      'File exceeds the 10MB size limit',
      expect.objectContaining({ type: 'error' }),
    );
  });

  it('accepts a file exactly at the 10MB size limit', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ id: 'r1' }),
    }));
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useResumeUpload(vi.fn()));

    await act(async () => {
      await result.current.uploadResume(
        pdfFile('exact.pdf', 10 * 1024 * 1024),
        0,
      );
    });

    expect(fetchMock).toHaveBeenCalled();
    expect(mockShowToast).not.toHaveBeenCalledWith(
      'File exceeds the 10MB size limit',
      expect.anything(),
    );
  });

  it('allows the upload when currentCount is exactly one below the cap', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ id: 'r1' }),
    }));
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useResumeUpload(vi.fn()));

    await act(async () => {
      await result.current.uploadResume(pdfFile(), 7);
    });

    expect(fetchMock).toHaveBeenCalled();
    expect(mockShowToast).not.toHaveBeenCalledWith(
      expect.stringContaining('maximum 8 resumes'),
      expect.anything(),
    );
  });

  it('shows the max-resumes toast and skips upload when at the cap', async () => {
    vi.stubGlobal('fetch', vi.fn());
    const { result } = renderHook(() => useResumeUpload(vi.fn()));

    await act(async () => {
      await result.current.uploadResume(pdfFile(), 8);
    });

    expect(fetch).not.toHaveBeenCalled();
    expect(mockShowToast).toHaveBeenCalledWith(
      'You can only upload maximum 8 resumes. Please delete one resume to upload.',
      expect.objectContaining({ type: 'error', duration: 4000 }),
    );
  });

  it('notifyMaxResumesReached shows the same toast directly', () => {
    const { result } = renderHook(() => useResumeUpload(vi.fn()));

    act(() => result.current.notifyMaxResumesReached());

    expect(mockShowToast).toHaveBeenCalledWith(
      'You can only upload maximum 8 resumes. Please delete one resume to upload.',
      expect.objectContaining({ type: 'error', duration: 4000 }),
    );
  });

  it('uploads a valid file and calls onUploaded on success', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ id: 'r1' }),
    }));
    vi.stubGlobal('fetch', fetchMock);
    const onUploaded = vi.fn();
    const { result } = renderHook(() => useResumeUpload(onUploaded));

    await act(async () => {
      await result.current.uploadResume(pdfFile(), 2);
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/resumes',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(onUploaded).toHaveBeenCalledTimes(1);
    expect(mockShowToast).toHaveBeenCalledWith(
      'Resume uploaded',
      expect.objectContaining({ duration: 2000 }),
    );
  });

  it('sets isUploading while the request is in flight', async () => {
    let resolveFetch!: (value: unknown) => void;
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });
    vi.stubGlobal(
      'fetch',
      vi.fn(() => fetchPromise),
    );
    const { result } = renderHook(() => useResumeUpload(vi.fn()));

    let uploadPromise!: Promise<void>;
    act(() => {
      uploadPromise = result.current.uploadResume(pdfFile(), 0);
    });
    await waitFor(() => expect(result.current.isUploading).toBe(true));

    resolveFetch({ ok: true, json: async () => ({ id: 'r1' }) });
    await act(async () => {
      await uploadPromise;
    });
    expect(result.current.isUploading).toBe(false);
  });

  it('shows an error toast and does not call onUploaded when the request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        json: async () => ({ message: 'Server exploded' }),
      })),
    );
    const onUploaded = vi.fn();
    const { result } = renderHook(() => useResumeUpload(onUploaded));

    await act(async () => {
      await result.current.uploadResume(pdfFile(), 0);
    });

    expect(onUploaded).not.toHaveBeenCalled();
    expect(mockShowToast).toHaveBeenCalledWith(
      'Server exploded',
      expect.objectContaining({ type: 'error' }),
    );
  });

  it('falls back to a generic error message when the error response body is not valid JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        json: async () => {
          throw new SyntaxError('Unexpected end of JSON input');
        },
      })),
    );
    const onUploaded = vi.fn();
    const { result } = renderHook(() => useResumeUpload(onUploaded));

    await act(async () => {
      await result.current.uploadResume(pdfFile(), 0);
    });

    expect(onUploaded).not.toHaveBeenCalled();
    expect(mockShowToast).toHaveBeenCalledWith(
      'Failed to upload resume',
      expect.objectContaining({ type: 'error' }),
    );
  });

  it('shows an error toast when the network request itself throws', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch');
      }),
    );
    const onUploaded = vi.fn();
    const { result } = renderHook(() => useResumeUpload(onUploaded));

    await act(async () => {
      await result.current.uploadResume(pdfFile(), 0);
    });

    expect(onUploaded).not.toHaveBeenCalled();
    expect(mockShowToast).toHaveBeenCalledWith(
      'Failed to fetch',
      expect.objectContaining({ type: 'error' }),
    );
  });
});
