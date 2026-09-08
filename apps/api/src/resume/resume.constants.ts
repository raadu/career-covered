// Hard, strictly-enforced ceiling on the *uploaded* file, checked again
// after compression in case the compressed result is still too large.
export const MAX_RESUME_BYTES = 10 * 1024 * 1024;

export const MAX_RESUMES_PER_USER = 8;
