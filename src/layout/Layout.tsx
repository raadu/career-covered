import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { type RootState } from 'store';
import Sidebar from 'layout/Sidebar';
import Footer from 'layout/Footer';
import OnboardingModal from 'components/Modals/OnboardingModal';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => {
    const saved = localStorage.getItem('cl_sidebar_expanded');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  const handleToggle = () => {
    const newState = !isSidebarExpanded;
    setIsSidebarExpanded(newState);
    localStorage.setItem('cl_sidebar_expanded', JSON.stringify(newState));
  };

  const { apiKey, generationCount } = useSelector((state: RootState) => state.coverLetter);
  const location = useLocation();
  const isSupportPage = location.pathname.includes('/support');

  const shouldShowOnboarding = !apiKey && generationCount > 4 && !isSupportPage;

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      <Sidebar 
        isExpanded={isSidebarExpanded} 
        onToggle={handleToggle} 
      />
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* Main Content Area with Padding */}
          <div className="flex-1 p-2 md:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto w-full">
              {children}
            </div>
          </div>
          {/* Footer */}
          <Footer />
        </div>
      </main>

      <OnboardingModal 
        isOpen={shouldShowOnboarding} 
        onComplete={() => {}} 
      />
    </div>
  );
};

export default Layout;
