import TextAreaHeader from "./TextAreaHeader";
import TextAreaBody from "./TextAreaBody";
import { useCopy } from "components/hooks/useCopy";
import { useClear } from "components/hooks/useClear";

interface CollapsibleTextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  placeholder?: string;
  required?: boolean;
  onClear?: () => void;
}

const CollapsibleTextArea = ({
  label,
  value,
  onChange,
  isExpanded,
  onToggleExpand,
  placeholder,
  required,
  onClear,
}: CollapsibleTextAreaProps) => {
  const { handleCopy } = useCopy();
  const { handleClear } = useClear();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-blue-100/50">
      <TextAreaHeader
        label={label}
        value={value}
        required={required}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
        handleCopy={(e) => handleCopy(value, label, e)}
        onClear={onClear ? (e) => handleClear(onClear, e) : undefined}
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
};

export default CollapsibleTextArea;
