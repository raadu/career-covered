import React, { useState } from 'react';
import { useSelector } from 'react-redux';
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

  const [showOnboarding, setShowOnboarding] = useState(() => {
    const visitedBefore = localStorage.getItem('cl_visited_before');
    // If we haven't visited or don't have an API key, start with onboarding open
    return !visitedBefore || !localStorage.getItem('cl_apiKey'); 
  });

  // If apiKey disappears later, ensure onboarding shows up
  const [prevApiKey, setPrevApiKey] = useState(apiKey);
  if (!apiKey && prevApiKey && !showOnboarding) {
    setPrevApiKey(apiKey);
    setShowOnboarding(true);
  } else if (apiKey !== prevApiKey) {
    setPrevApiKey(apiKey);
  }

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
          <Footer />
        </div>
      </main>

      <OnboardingModal 
        isOpen={showOnboarding} 
        onComplete={() => setShowOnboarding(false)} 
      />
    </div>
  );
};

export default Layout;
