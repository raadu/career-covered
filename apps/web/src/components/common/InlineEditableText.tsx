import { useEffect, useRef, useState } from 'react';

interface InlineEditableTextProps {
  value: string;
  onCommit: (newValue: string) => void;
  className?: string;
  inputClassName?: string;
  maxLength?: number;
}

// Click the text -> it becomes a focused, selected input -> Enter or blur
// commits (only if non-empty and changed), Escape reverts. No modal.
const InlineEditableText = ({
  value,
  onCommit,
  className,
  inputClassName,
  maxLength,
}: InlineEditableTextProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const commit = () => {
    const trimmed = draft.trim();
    setIsEditing(false);
    if (trimmed && trimmed !== value) {
      onCommit(trimmed);
    } else {
      setDraft(value);
    }
  };

  const cancel = () => {
    setDraft(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        maxLength={maxLength}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
          } else if (e.key === 'Escape') {
            e.preventDefault();
            cancel();
          }
        }}
        className={inputClassName}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className={className}
      title="Click to rename"
    >
      {value}
    </button>
  );
};

export default InlineEditableText;
