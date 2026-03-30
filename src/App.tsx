import Layout from './layout/Layout';
import TemplateInput from './components/TemplateInput';
import JobDescriptionInput from './components/JobDescriptionInput';
import GeneratorControls from './components/GeneratorControls';
import ResultDisplay from './components/ResultDisplay';

function App() {
  return (
    <Layout>
      <div className="space-y-2 pb-2">
        <header className="mb-3 md:mb-4">
           <h2 className="text-xl font-bold text-gray-800 tracking-tight">Create Cover Letter</h2>
           <p className="text-gray-500 text-sm">
             Paste your template and the job description to generate a tailored cover letter in seconds.
           </p>
        </header>
        
        <div className="space-y-2">
            <TemplateInput />
            <JobDescriptionInput />
            
            <div className="pt-1">
                <GeneratorControls />
            </div>

            <ResultDisplay />
        </div>
      </div>
    </Layout>
  );
}

export default App;
