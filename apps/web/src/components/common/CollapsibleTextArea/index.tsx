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
        className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-blue-100/50 dark:hover:border-blue-800/50"
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
