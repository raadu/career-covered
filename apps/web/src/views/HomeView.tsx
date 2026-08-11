import MainHeader from 'components/MainHeader';
import TemplateInput from 'components/TemplateInput';
import JobDescriptionInput from 'components/JobDescriptionInput';
import GeneratorControls from 'components/GeneratorControls';
import ResultDisplay from 'components/ResultDisplay';
import ResumeSelector from 'components/ResumeSelector';
import { useSelectedResume } from 'hooks/useSelectedResume';

const HomeView = () => {
  const [selectedResumeId, setSelectedResumeId] = useSelectedResume();

  return (
    <div className="space-y-2 pb-2">
      <MainHeader />

      <div className="space-y-2">
        <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-2">
          <TemplateInput />
          <ResumeSelector
            selectedResumeId={selectedResumeId}
            onSelectResume={setSelectedResumeId}
          />
        </div>

        <JobDescriptionInput />

        <div className="pt-1">
          <GeneratorControls selectedResumeId={selectedResumeId} />
        </div>

        <ResultDisplay />
      </div>
    </div>
  );
};

export default HomeView;
