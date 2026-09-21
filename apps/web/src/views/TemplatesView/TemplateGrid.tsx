import TemplateCard from './TemplateCard';
import type { Template } from './types';

interface TemplateGridProps {
  templates: Template[];
  onEdit: (tpl: Template) => void;
  onDelete: (id: string) => void;
}

const TemplateGrid = ({ templates, onEdit, onDelete }: TemplateGridProps) => {
  if (templates.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-neutral-400 dark:text-neutral-500">
        No templates yet. Create one to get started.
      </p>
    );
  }

  return (
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
  );
};

export default TemplateGrid;
