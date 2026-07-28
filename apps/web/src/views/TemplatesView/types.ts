export interface Template {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse {
  data: Template[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}