// Rolling retention cap — a create keeps only the most recent
// MAX_COVER_LETTERS_PER_USER rows for that user, trimming older ones.
export const MAX_COVER_LETTERS_PER_USER = 100;
