import { useState, type MouseEvent } from "react";
import toast from "react-hot-toast";
import { LuCircleCheck } from "react-icons/lu";

interface UseCopyOptions {
  duration?: number;
  onSuccess?: () => void;
}

export const useCopy = (options: UseCopyOptions = {}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (value: string, label: string = "Text", e?: MouseEvent) => {
    if (e) e.stopPropagation();

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
    setCopied(true);
    
    toast.success(`${label} copied!`, {
      icon: <LuCircleCheck className="text-emerald-400" size={18} />,
      duration: options.duration || 3000,
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

    if (options.onSuccess) options.onSuccess();

    setTimeout(() => setCopied(false), 2000);
  };

  return { copied, handleCopy };
};
