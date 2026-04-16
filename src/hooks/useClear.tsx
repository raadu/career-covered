import { type MouseEvent } from "react";

export const useClear = () => {
  const handleClear = (onClear: () => void, e?: MouseEvent) => {
    if (e) e.stopPropagation();
    onClear();
  };

  return { handleClear };
};
