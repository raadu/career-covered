import { FaCheck } from 'react-icons/fa';

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  id?: string;
  indeterminate?: boolean;
}

const Checkbox = ({ checked, onChange, id, indeterminate }: CheckboxProps) => (
  <label
    htmlFor={id}
    className="relative inline-flex items-center justify-center w-5 h-5 cursor-pointer"
  >
    <input
      id={id}
      type="checkbox"
      checked={checked}
      ref={(el) => {
        if (el && indeterminate !== undefined) el.indeterminate = indeterminate;
      }}
      onChange={onChange}
      className="peer appearance-none w-5 h-5 border-2 border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 checked:bg-brand-600 checked:border-brand-600 indeterminate:bg-brand-600 indeterminate:border-brand-600 transition-all cursor-pointer"
    />
    <FaCheck
      size={10}
      className="absolute text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
    />
  </label>
);

export default Checkbox;
