import MainHeader from 'components/MainHeader';
import TemplateInput from 'components/TemplateInput';
import JobDescriptionInput from 'components/JobDescriptionInput';
import GeneratorControls from 'components/GeneratorControls';
import ResultDisplay from 'components/ResultDisplay';
import ResumeSelector from 'components/ResumeSelector';
import { useSelectedResume } from 'hooks/useSelectedResume';
import { useElementHeight } from 'hooks/useElementHeight';

const HomeView = () => {
  const [selectedResumeId, setSelectedResumeId] = useSelectedResume();
  const [templateBoxRef, templateBoxHeight] =
    useElementHeight<HTMLDivElement>();

  return (
    <div className="space-y-2 pb-2">
      <MainHeader />

      <div className="space-y-2">
        {/* Mobile: Job Description (required) before Template/Resume (optional).
            Desktop: reset to source order — the grid's own side-by-side split
            is unaffected either way. */}
        <div className="flex flex-col gap-2">
          <div className="order-2 lg:order-1 grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-2 lg:gap-x-2 lg:gap-y-1 items-start">
            <TemplateInput boxRef={templateBoxRef} />
            <ResumeSelector
              selectedResumeId={selectedResumeId}
              onSelectResume={setSelectedResumeId}
              maxHeight={templateBoxHeight}
            />
          </div>

          <div className="order-1 lg:order-2">
            <JobDescriptionInput />
          </div>
        </div>

        <div className="pt-1">
          <GeneratorControls selectedResumeId={selectedResumeId} />
        </div>

        <ResultDisplay />
      </div>
    </div>
  );
};

export default HomeView;
