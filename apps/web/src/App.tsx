import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { useDispatch } from 'react-redux';
import Layout from 'layout/Layout';
import MainHeader from 'components/MainHeader';
import TemplateInput from 'components/TemplateInput';
import JobDescriptionInput from 'components/JobDescriptionInput';
import GeneratorControls from 'components/GeneratorControls';
import ResultDisplay from 'components/ResultDisplay';
import SupportView from 'views/SupportView';
import FaqView from 'views/FaqView';
import TemplatesView from 'views/TemplatesView';
import ogImage from 'assets/og-image.png';
import { fetchCurrentUser } from 'store/authSlice';
import type { AppDispatch } from 'store';

const App = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  return (
    <Layout>
      <Helmet>
        <title>Career Covered | Create free cover letters in 2 seconds</title>
        <meta name="description" content="100% free cover letters. No payments needed. Create cover letters in 2 seconds. Cover letters based on job description and your template." />
        <link rel="canonical" href="https://careercovered.com/" />
        
        {/* Open Graph / Facebook / LinkedIn */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://careercovered.com/" />
        <meta property="og:title" content="Career Covered | Free AI Cover Letter Generator" />
        <meta property="og:description" content="Generate professional, tailored cover letters in seconds for free. No account required, no hidden costs." />
        <meta property="og:image" content={`https://careercovered.com${ogImage}`} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://careercovered.com/" />
        <meta name="twitter:title" content="Career Covered | Free AI Cover Letter Generator" />
        <meta name="twitter:description" content="Generate professional, tailored cover letters in seconds for free. No account required, no hidden costs." />
        <meta name="twitter:image" content={`https://careercovered.com${ogImage}`} />
      </Helmet>
      <Toaster position="bottom-right" />
      <Routes>
        <Route path="/faq" element={<FaqView />} />
        <Route path="/support" element={<SupportView />} />
        <Route path="/cover-letter/templates" element={<TemplatesView />} />
        <Route path="/" element={
          <div className="space-y-2 pb-2">
            <MainHeader />
            
            <div className="space-y-2">
                <TemplateInput />
                <JobDescriptionInput />
                
                <div className="pt-1">
                    <GeneratorControls />
                </div>

                <ResultDisplay />
            </div>
          </div>
        } />
      </Routes>
    </Layout>
  );
}

export default App;
