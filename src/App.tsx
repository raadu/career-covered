import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from 'layout/Layout';
import MainHeader from 'components/MainHeader';
import TemplateInput from 'components/TemplateInput';
import JobDescriptionInput from 'components/JobDescriptionInput';
import GeneratorControls from 'components/GeneratorControls';
import ResultDisplay from 'components/ResultDisplay';
import SupportView from 'views/SupportView';

const App = () => {
  return (
    <Layout>
      <Toaster position="bottom-right" />
      <Routes>
        <Route path="/support" element={<SupportView />} />
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
