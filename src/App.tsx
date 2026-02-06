import Layout from './layout/Layout';
import TemplateInput from './components/TemplateInput';
import JobDescriptionInput from './components/JobDescriptionInput';
import GeneratorControls from './components/GeneratorControls';
import ResultDisplay from './components/ResultDisplay';

function App() {
  return (
    <Layout>
      <div className="space-y-6 pb-12">
        <header className="mb-8 md:mb-10">
           <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Create Your Cover Letter</h2>
           <p className="text-gray-500 mt-2 text-lg">
             Paste your template and the job description to generate a tailored cover letter in seconds.
           </p>
        </header>
        
        <div className="space-y-6">
            <TemplateInput />
            <JobDescriptionInput />
            
            <div className="pt-4">
                <GeneratorControls />
            </div>

            <ResultDisplay />
        </div>
      </div>
    </Layout>
  );
}

export default App;
