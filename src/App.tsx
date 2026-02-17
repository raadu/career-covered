import Layout from './layout/Layout';
import TemplateInput from './components/TemplateInput';
import JobDescriptionInput from './components/JobDescriptionInput';
import GeneratorControls from './components/GeneratorControls';
import ResultDisplay from './components/ResultDisplay';

function App() {
  return (
    <Layout>
      <div className="space-y-4 pb-4">
        <header className="mb-6 md:mb-8">
           <h2 className="text-xl font-bold text-gray-800 tracking-tight">Create Cover Letter</h2>
           <p className="text-gray-500 text-md">
             Paste your template and the job description to generate a tailored cover letter in seconds.
           </p>
        </header>
        
        <div className="space-y-4">
            <TemplateInput />
            <JobDescriptionInput />
            
            <div className="pt-2">
                <GeneratorControls />
            </div>

            <ResultDisplay />
        </div>
      </div>
    </Layout>
  );
}

export default App;
