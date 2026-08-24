import { useState } from 'react';
import { Link } from 'react-router-dom';
import { showToast } from 'components/common/Toast';
import { useSelector } from 'react-redux';
import { buildCoverLetterPrompt } from 'utils/promptUtils';
import { type RootState, useAppDispatch } from 'store';
import {
  setApiKey,
  setGeneratedLetter,
  setAllCollapsed,
  setCustomization,
  incrementGenerationCount,
  setSelectedModel,
} from 'store/coverLetterSlice';
import { useGenerateCoverLetterMutation } from 'store/apiSlice';
import OnboardingModal from 'components/Modals/OnboardingModal';
import CustomizeModal, {
  type CustomizationOptions,
  type CustomizeModalSavePayload,
} from 'components/Modals/CustomizeModal';
import ApiKeySection from './ApiKeySection';
import ControlActions from './ControlActions';
import GenerateAction from './GenerateAction';
import ModelSelect from './ModelSelect';

interface GeneratorControlsProps {
  selectedResumeId?: string | null;
}

async function fetchResumeText(resumeId: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/resumes/${resumeId}/content`);
    if (!res.ok) throw new Error('Failed to load resume');
    const { parsedText } = (await res.json()) as { parsedText: string | null };
    return parsedText;
  } catch {
    showToast('Could not load the selected resume — generating without it', {
      type: 'error',
    });
    return null;
  }
}

const GeneratorControls = ({ selectedResumeId }: GeneratorControlsProps) => {
  const dispatch = useAppDispatch();
  const {
    apiKey,
    jobDescription,
    template,
    generatedLetter,
    customization,
    generationCount,
    activeTemplateId,
    selectedModel,
  } = useSelector((state: RootState) => state.coverLetter);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [generate, { isLoading, error }] = useGenerateCoverLetterMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);

  // Derived state: show input if user explicitly clicked "Update" OR if they exhausted free generations and don't have a key
  const showKeyInput = isEditing || (generationCount > 4 && !apiKey);

  // Reset editing state during render if apiKey becomes available (e.g. from onboarding)
  const [prevApiKey, setPrevApiKey] = useState(apiKey);
  if (apiKey !== prevApiKey) {
    setPrevApiKey(apiKey);
    if (apiKey) setIsEditing(false);
  }

  const isFilterOn = !!(
    customization?.limitWords ||
    customization?.limitCharacters ||
    customization?.minimalChanges ||
    customization?.sameLanguage
  );

  const handleGenerate = async (
    optionsOverride?: CustomizationOptions,
    customPrompt?: string,
  ) => {
    // If they have created more than 4 cover letters and don't have their own key, they are blocked
    if (generationCount > 4 && !apiKey) {
      setIsEditing(true);
      return;
    }

    if (!jobDescription) return;

    const activeCustomization = optionsOverride || customization;
    const wordCountLimit = activeCustomization?.limitWords
      ? activeCustomization.wordCount
      : null;
    const characterCountLimit = activeCustomization?.limitCharacters
      ? activeCustomization.charCount
      : null;

    const resumeText = selectedResumeId
      ? await fetchResumeText(selectedResumeId)
      : null;

    // Construct prompt
    const prompt = buildCoverLetterPrompt(
      jobDescription,
      template,
      wordCountLimit,
      activeCustomization?.minimalChanges,
      activeCustomization?.sameLanguage,
      customPrompt,
      undefined,
      resumeText,
      characterCountLimit,
    );

    try {
      dispatch(setAllCollapsed()); // Collapse inputs for better view
      const result = await generate({
        prompt,
        model: selectedModel,
        ...(apiKey && { userApiKey: apiKey }),
      }).unwrap();
      dispatch(setGeneratedLetter(result));
      dispatch(incrementGenerationCount());
      showToast('Cover letter generated successfully!', { type: 'success' });

      if (isAuthenticated) {
        fetch('/api/cover-letters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            templateId: activeTemplateId || undefined,
            jobDescription,
            generatedText: result,
            model: selectedModel,
            wordLimit: activeCustomization?.limitWords
              ? activeCustomization.wordCount
              : undefined,
            characterLimit: activeCustomization?.limitCharacters
              ? activeCustomization.charCount
              : undefined,
            minimalChanges: activeCustomization?.minimalChanges || undefined,
            sameLanguage: activeCustomization?.sameLanguage || undefined,
          }),
        })
          .then((res) => {
            if (res.ok) {
              showToast(
                <span>
                  Generated cover letter is saved. You can{' '}
                  <Link
                    to="/cover-letter/previous"
                    className="underline font-semibold"
                  >
                    check here
                  </Link>
                  .
                </span>,
                { type: 'success', duration: 2000 },
              );
            } else {
              showToast('Failed to save cover letter', { type: 'error' });
            }
          })
          .catch(() => {
            showToast('Failed to save cover letter', { type: 'error' });
          });
      }
    } catch (err) {
      console.error('Generation failed', err);
      showToast('Failed to generate cover letter. Please try again.', {
        type: 'error',
      });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 p-2 flex flex-col items-start gap-2">
      <div className="flex flex-col lg:flex-row w-full gap-3 lg:items-center justify-between">
        <ApiKeySection
          apiKey={apiKey}
          setApiKey={(val) => dispatch(setApiKey(val))}
          showKeyInput={showKeyInput}
          setShowKeyInput={setIsEditing}
          setShowHelpModal={setShowHelpModal}
        />

        <div className="flex flex-col sm:flex-row w-full lg:w-auto items-stretch lg:items-center gap-1.5">
          <ModelSelect
            selectedModel={selectedModel}
            onChange={(id) => dispatch(setSelectedModel(id))}
          />

          <ControlActions
            isFilterOn={isFilterOn}
            setShowCustomizeModal={setShowCustomizeModal}
          />

          <GenerateAction
            isLoading={isLoading}
            hasJobDescription={!!jobDescription}
            hasGeneratedLetter={!!generatedLetter}
            onGenerate={() => handleGenerate()}
          />
        </div>
      </div>

      {error && (
        <p className="w-full text-center text-red-500 text-xs">
          Error generating. Check API Key.
        </p>
      )}

      <OnboardingModal
        isOpen={showHelpModal}
        onComplete={() => setShowHelpModal(false)}
        onClose={() => setShowHelpModal(false)}
      />

      {showCustomizeModal && (
        <CustomizeModal
          isOpen={showCustomizeModal}
          onClose={() => setShowCustomizeModal(false)}
          initialOptions={customization!}
          hasTemplate={!!template}
          onSave={({ options, customPrompt }: CustomizeModalSavePayload) => {
            dispatch(setCustomization(options));
            setShowCustomizeModal(false);
            handleGenerate(options, customPrompt);
          }}
        />
      )}
    </div>
  );
};

export default GeneratorControls;
