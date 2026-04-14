import { useState } from 'react';
import type { ReactNode } from 'react';
import Sidebar from 'layout/Sidebar';
import MainContent from 'layout/MainContent';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const onToggle = () => setIsExpanded(!isExpanded);

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      <Sidebar 
        isExpanded={isExpanded} 
        onToggle={onToggle} 
      />
      
      <MainContent>
        {children}
      </MainContent>
    </div>
  );
};

export default Layout;
