import React from 'react';
import { FaFileAlt, FaUserShield } from 'react-icons/fa';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${
          isExpanded ? 'w-56' : 'w-16'
        } bg-white border-r border-gray-200 hidden md:flex flex-col transition-all duration-300 ease-in-out relative`}
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between h-16" title="Career Covered">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white p-1.5 rounded-lg shrink-0 shadow-lg shadow-cyan-500/30">
              <FaUserShield size={16} />
            </div>
            <h1 
                className={`text-lg font-extrabold bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 bg-clip-text text-transparent whitespace-nowrap overflow-hidden transition-all duration-300 ${
                    isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'
                }`}
            >
              Career Covered
            </h1>
          </div>
        </div>
        
        <nav className="flex-1 p-3 space-y-2">
          <div 
            className="p-2.5 bg-gradient-to-r from-cyan-50 to-blue-50 text-blue-900 border border-blue-100 hover:border-blue-200 rounded-lg flex items-center gap-3 font-medium cursor-pointer overflow-hidden justify-center transition-all shadow-sm"
            title="Cover Generator"
            style={{ justifyContent: isExpanded ? 'flex-start' : 'center' }}
          >
            <FaFileAlt className="shrink-0 text-cyan-600" size={16} />
            <span className={`transition-opacity duration-300 text-sm ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                Cover Generator
            </span>
          </div>
        </nav>

        {/* Minimal Toggle Button */}
        <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-10 w-full text-blue-300 hover:text-cyan-600 border-t border-gray-100 flex items-center justify-center hover:bg-cyan-50 transition-colors"
        >
            {isExpanded ? (
                <span className="text-xs font-bold">«</span>
            ) : (
                <span className="text-xs font-bold">»</span>
            )}
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header (Visible only on small screens) */}
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
           <div className="flex items-center gap-2" title="Career Covered">
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white p-1.5 rounded-lg shadow-lg shadow-cyan-500/30">
                <FaUserShield size={16} />
              </div>
              <span className="font-extrabold text-lg bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">Career Covered</span>
           </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto flex flex-col p-4 md:p-2">
          <div className="flex-1 w-full px-4 py-2">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default Layout;
