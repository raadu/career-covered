// Mirrors apps/api/src/resume/resume.constants.ts — kept as client-side
// constants purely for fast UI feedback; the server re-validates both
// regardless, since neither of these is trustworthy coming from the client.
export const MAX_RESUMES = 8;
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_RESUMES_MESSAGE =
  'You can only upload maximum 8 resumes. Please delete one resume to upload.';
