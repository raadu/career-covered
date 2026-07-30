export interface CoverLetterItem {
  id: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  generatedText: string;
  model: string;
  wordLimit: number | null;
  minimalChanges: boolean | null;
  sameLanguage: boolean | null;
  customPrompt: string | null;
  jobMarket: string | null;
  createdAt: string;
  templateId: string | null;
  template: { id: string; name: string } | null;
}

export interface PaginatedResponse {
  data: CoverLetterItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
