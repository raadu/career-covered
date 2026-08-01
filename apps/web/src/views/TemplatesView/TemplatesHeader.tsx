import { FaPlus } from 'react-icons/fa';
import CommonButton from 'components/common/CommonButton';

interface TemplatesHeaderProps {
  total: number;
  onCreateClick: () => void;
}

const TemplatesHeader = ({ total, onCreateClick }: TemplatesHeaderProps) => (
  <div className="flex items-center justify-between mb-6">
    <div>
      <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
        Cover Letter Templates
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        You have {total} {total === 1 ? 'template' : 'templates'}
      </p>
    </div>
    <CommonButton
      variant="dark"
      icon={<FaPlus size={12} />}
      onClick={onCreateClick}
    >
      New Template
    </CommonButton>
  </div>
);

export default TemplatesHeader;
