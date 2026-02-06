import React from 'react';
import { FaFileAlt, FaPenNib } from 'react-icons/fa';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
          <div className="bg-blue-600 text-white p-2 rounded-lg">
            <FaPenNib size={20} />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            CoverCraft
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-lg flex items-center gap-3 font-medium">
            <FaFileAlt />
            <span>Generator</span>
          </div>
          {/* Add more nav items here later if needed */}
        </nav>

        <div className="p-4 text-xs text-gray-400 text-center border-t border-gray-100">
          v1.0.0
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header (Visible only on small screens) */}
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                <FaPenNib size={16} />
              </div>
              <span className="font-bold text-lg">CoverCraft</span>
           </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
