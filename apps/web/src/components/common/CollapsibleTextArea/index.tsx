import { forwardRef } from 'react';
import TextAreaHeader from './TextAreaHeader';
import TextAreaBody from './TextAreaBody';
import { useCopy } from 'hooks/useCopy';
import { useClear } from 'hooks/useClear';

interface CollapsibleTextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  placeholder?: string;
  required?: boolean;
  onClear?: () => void;
  onAddTemplate?: () => void;
}

const CollapsibleTextArea = forwardRef<
  HTMLDivElement,
  CollapsibleTextAreaProps
>(
  (
    {
      label,
      value,
      onChange,
      isExpanded,
      onToggleExpand,
      placeholder,
      required,
      onClear,
      onAddTemplate,
    },
    ref,
  ) => {
    const { handleCopy } = useCopy();
    const { handleClear } = useClear();

    return (
      <div
        ref={ref}
        className="bg-white dark:bg-neutral-900 shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-brand-200 dark:hover:border-brand-800"
      >
        <TextAreaHeader
          label={label}
          value={value}
          required={required}
          isExpanded={isExpanded}
          onToggleExpand={onToggleExpand}
          handleCopy={(e) => handleCopy(value, label, e)}
          onClear={onClear ? () => handleClear(onClear) : undefined}
          onAddTemplate={onAddTemplate}
        />
        <TextAreaBody
          value={value}
          onChange={onChange}
          isExpanded={isExpanded}
          onToggleExpand={onToggleExpand}
          placeholder={placeholder}
        />
      </div>
    );
  },
);

CollapsibleTextArea.displayName = 'CollapsibleTextArea';

export default CollapsibleTextArea;
