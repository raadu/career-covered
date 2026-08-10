import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Pagination from 'components/common/DataTable/Pagination';
import Checkbox from 'views/TemplatesView/Checkbox';
import ResumeTableRow from './ResumeTableRow';
import { useReorderDnd } from './useReorderDnd';
import type { Resume } from './types';

interface ResumeTableProps {
  resumes: Resume[];
  busyId: string | null;
  selectedIds: Set<string>;
  allSelected: boolean;
  someSelected: boolean;
  onToggleSelectAll: () => void;
  onToggleSelect: (id: string) => void;
  onReorder: (newOrder: Resume[]) => void;
  onRename: (id: string, name: string) => void;
  onPreview: (id: string) => void;
  onDownload: (id: string) => void;
  onReplace: (id: string, file: File) => void;
  onDelete: (id: string) => void;
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const COLUMN_COUNT = 6;
const PAGE_SIZE_OPTIONS = [5, 10, 20];
const headerCellClasses =
  'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700';

const ResumeTable = ({
  resumes,
  busyId,
  selectedIds,
  allSelected,
  someSelected,
  onToggleSelectAll,
  onToggleSelect,
  onReorder,
  onRename,
  onPreview,
  onDownload,
  onReplace,
  onDelete,
  pageIndex,
  pageSize,
  pageCount,
  total,
  onPageChange,
  onPageSizeChange,
}: ResumeTableProps) => {
  const { handleDragEnd } = useReorderDnd(resumes, onReorder);
  const selectAllIndeterminate = someSelected && !allSelected;

  const tableBody =
    resumes.length === 0 ? (
      <tbody>
        <tr>
          <td
            colSpan={COLUMN_COUNT}
            className="px-4 py-12 text-center text-sm text-gray-400 dark:text-gray-500"
          >
            No resumes yet. Upload one to get started.
          </td>
        </tr>
      </tbody>
    ) : (
      <SortableContext
        items={resumes.map((r) => r.id)}
        strategy={verticalListSortingStrategy}
      >
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {resumes.map((resume) => (
            <ResumeTableRow
              key={resume.id}
              resume={resume}
              isBusy={busyId === resume.id}
              isSelected={selectedIds.has(resume.id)}
              onToggleSelect={() => onToggleSelect(resume.id)}
              onRename={(name) => onRename(resume.id, name)}
              onPreview={() => onPreview(resume.id)}
              onDownload={() => onDownload(resume.id)}
              onReplace={(file) => onReplace(resume.id, file)}
              onDelete={() => onDelete(resume.id)}
            />
          ))}
        </tbody>
      </SortableContext>
    );

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="overflow-x-auto">
        <div className="border border-gray-200 dark:border-gray-700 rounded-sm overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={headerCellClasses}>
                  <Checkbox
                    checked={allSelected}
                    indeterminate={selectAllIndeterminate}
                    onChange={onToggleSelectAll}
                    id="select-all-resumes"
                  />
                </th>
                {['Name', 'Size', 'Created', 'Last Updated', 'Action'].map(
                  (label) => (
                    <th key={label} className={headerCellClasses}>
                      {label}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            {tableBody}
          </table>

          <Pagination
            pageCount={pageCount}
            pageIndex={pageIndex}
            pageSize={pageSize}
            total={total}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
          />
        </div>
      </div>
    </DndContext>
  );
};

export default ResumeTable;
