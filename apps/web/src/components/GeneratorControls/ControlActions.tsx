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
    <div className="w-full sm:w-auto flex flex-wrap items-center justify-between sm:justify-end gap-1.5">
      <div
        title="Click Customize More to change settings."
        className={`flex items-center gap-1.5 px-2.5 h-9 text-xs font-semibold transition-colors cursor-default ${
          isFilterOn ? 'text-emerald-600' : 'text-rose-600'
        }`}
      >
        <div
          className={`w-2 h-2 rounded-full ${
            isFilterOn
              ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
              : 'bg-rose-500'
          }`}
        ></div>
        <span>Custom Filter is {isFilterOn ? 'ON' : 'OFF'}</span>
        <FaArrowRight size={10} className="opacity-70" />
      </div>

      <CommonButton
        variant="cyan"
        onClick={() => setShowCustomizeModal(true)}
        shimmer
        icon={<FaSlidersH className="animate-pulse" size={12} />}
        title="Customize as you needed."
        className="rounded-none"
      >
        Customize More
      </CommonButton>
    </div>
  );
};

export default ControlActions;
