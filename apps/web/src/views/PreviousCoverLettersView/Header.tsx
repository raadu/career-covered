import { FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import CommonButton from 'components/common/CommonButton';

interface HeaderProps {
  total: number;
}

const Header = ({ total }: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
          Previously created cover letters
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          You have {total} saved cover letter{total !== 1 ? 's' : ''}
        </p>
      </div>
      <CommonButton
        variant="dark"
        icon={<FaPlus size={12} />}
        onClick={() => navigate('/')}
      >
        Create New
      </CommonButton>
    </div>
  );
};

export default Header;
