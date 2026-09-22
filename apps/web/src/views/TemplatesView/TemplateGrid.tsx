import Pagination from 'components/common/DataTable/Pagination';
import { DEFAULT_PAGE_SIZES } from 'components/common/DataTable/tableColumnMeta';
import TemplateCard from './TemplateCard';
import type { Template } from './types';

interface TemplateGridProps {
  templates: Template[];
  onEdit: (tpl: Template) => void;
  onDelete: (id: string) => void;
  page: number;
  pageSize: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const TemplateGrid = ({
  templates,
  onEdit,
  onDelete,
  page,
  pageSize,
  totalPages,
  total,
  onPageChange,
  onPageSizeChange,
}: TemplateGridProps) => {
  if (templates.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-neutral-400 dark:text-neutral-500">
        No templates yet. Create one to get started.
      </p>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onEdit={() => onEdit(template)}
            onDelete={() => onDelete(template.id)}
          />
        ))}
      </div>

      <div className="mt-3">
        <Pagination
          pageCount={totalPages}
          pageIndex={page - 1}
          pageSize={pageSize}
          total={total}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          pageSizeOptions={DEFAULT_PAGE_SIZES}
        />
      </div>
    </div>
  );
};

export default TemplateGrid;
