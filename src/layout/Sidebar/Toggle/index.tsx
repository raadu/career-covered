interface SidebarToggleProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const SidebarToggle = ({ isExpanded, onToggle }: SidebarToggleProps) => {
  return (
    <button 
        onClick={onToggle}
        className="h-10 w-full text-blue-300 hover:text-cyan-600 border-t border-gray-100 flex items-center justify-center hover:bg-cyan-50 transition-colors"
    >
        {isExpanded ? (
            <span className="text-xs font-bold">«</span>
        ) : (
            <span className="text-xs font-bold">»</span>
        )}
    </button>
  );
};

export default SidebarToggle;
