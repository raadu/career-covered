import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { type RootState } from 'store';
import { fetchCurrentUser } from 'store/authSlice';
import { showToast } from 'components/common/Toast';
import { EMOJI_SERIOUS } from 'utils/emojiUtils';
import Sidebar from 'layout/Sidebar';
import Footer from 'layout/Footer';
import OnboardingModal from 'components/Modals/OnboardingModal';
import AuthModal from 'components/Modals/AuthModal';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch<any>();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => {
    const saved = localStorage.getItem('cl_sidebar_expanded');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  useEffect(() => {
    dispatch(fetchCurrentUser())
      .unwrap()
      .then(() => {
        if (sessionStorage.getItem('google_oauth_redirect')) {
          sessionStorage.removeItem('google_oauth_redirect');
          showToast(`Welcome! Let's be serious about your job hunt ${EMOJI_SERIOUS}`, {
            type: 'success',
            duration: 4000,
          });
        }
      });
  }, [dispatch]);

  const handleToggle = () => {
    const newState = !isSidebarExpanded;
    setIsSidebarExpanded(newState);
    localStorage.setItem('cl_sidebar_expanded', JSON.stringify(newState));
  };

  const { apiKey, generationCount } = useSelector((state: RootState) => state.coverLetter);
  const location = useLocation();
  const isPublicPage = location.pathname.includes('/support') || location.pathname.includes('/faq');

  const shouldShowOnboarding = !apiKey && generationCount > 4 && !isPublicPage;

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50 dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 overflow-hidden">
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
      <AuthModal />
    </div>
  );
};

export default Layout;

