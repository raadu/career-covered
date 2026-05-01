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

  const apiKey = useSelector((state: RootState) => state.coverLetter.apiKey);
  const location = useLocation();
  const isSupportPage = location.pathname.includes('/support');

  // The modal should show if:
  // 1. There is no API key
  // 2. AND we are on the base route (not the support page)
  const shouldShowOnboarding = !apiKey && !isSupportPage;

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      <Sidebar 
        isExpanded={isSidebarExpanded} 
        onToggle={handleToggle} 
      />
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto p-2 md:p-6 lg:p-8 flex flex-col">
          <div className="max-w-5xl mx-auto w-full flex-1">
            {children}
          </div>
        </div>
        <Footer />
      </main>

      <OnboardingModal 
        isOpen={shouldShowOnboarding} 
        onComplete={() => {
          // This will be handled by the fact that apiKey will be updated in Redux,
          // causing a re-render and shouldShowOnboarding to become false.
        }} 
      />
    </div>
  );
};

export default Layout;
