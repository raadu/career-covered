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
      className="peer appearance-none w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-900 checked:bg-cyan-500 checked:border-cyan-500 indeterminate:bg-cyan-500 indeterminate:border-cyan-500 transition-all cursor-pointer"
    />
    <FaCheck
      size={10}
      className="absolute text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
    />
  </label>
);

export default Checkbox;
