import React from "react";
import toast from "react-hot-toast";
import TextAreaHeader from "./TextAreaHeader";
import TextAreaBody from "./TextAreaBody";
import { LuCircleCheck } from "react-icons/lu";

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
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!value) {
      toast.error("Nothing to copy!", {
        style: {
          borderRadius: "12px",
          background: "#1e293b",
          color: "#f8fafc",
          padding: "12px 16px",
          fontSize: "13px",
        },
      });
      return;
    }
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied!`, {
      icon: <LuCircleCheck className="text-emerald-400" size={18} />,
      duration: 3000,
      position: "bottom-center",
      style: {
        borderRadius: "16px",
        background: "rgba(15, 23, 42, 0.95)",
        backdropFilter: "blur(8px)",
        color: "#f8fafc",
        padding: "10px 16px",
        fontSize: "14px",
        fontWeight: "500",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
      },
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-blue-100/50">
      <TextAreaHeader
        label={label}
        value={value}
        required={required}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
        handleCopy={handleCopy}
        onClear={onClear}
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
