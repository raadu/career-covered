import { FaArrowRight, FaSlidersH } from 'react-icons/fa';
import CommonButton from 'components/common/CommonButton';

interface ControlActionsProps {
  isFilterOn: boolean;
  setShowCustomizeModal: (show: boolean) => void;
}

const ControlActions = ({
  isFilterOn,
  setShowCustomizeModal,
}: ControlActionsProps) => {
  return (
    // Tablet: display:contents — the status and button become the two
    // halves of the parent grid's row 2.
    <div className="w-full sm:w-auto flex flex-wrap items-center justify-between sm:justify-end gap-1.5 md:contents lg:flex">
      <div
        title="Click Customize More to change settings."
        className={`flex items-center gap-1.5 px-2.5 h-9 text-xs font-semibold transition-colors cursor-default md:order-4 md:col-span-3 md:justify-center md:self-center lg:order-none ${
          isFilterOn
            ? 'text-success-fg dark:text-success-fg-dark'
            : 'text-danger-fg dark:text-danger-fg-dark'
        }`}
      >
        <div
          className={`w-2 h-2 rounded-full ${
            isFilterOn ? 'bg-success' : 'bg-danger'
          }`}
        ></div>
        <span>Custom Filter is {isFilterOn ? 'ON' : 'OFF'}</span>
        <FaArrowRight size={10} className="opacity-70" />
      </div>

      <CommonButton
        variant="outline"
        onClick={() => setShowCustomizeModal(true)}
        shimmer
        icon={<FaSlidersH className="animate-pulse" size={12} />}
        title="Customize as you needed."
        className="md:order-5 md:col-span-3 lg:order-none"
      >
        Customize More
      </CommonButton>
    </div>
  );
};

export default ControlActions;
