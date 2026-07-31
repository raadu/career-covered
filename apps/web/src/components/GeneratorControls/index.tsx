import { useState } from 'react';
import { Link } from 'react-router-dom';
import { showToast } from 'components/common/Toast';
import { useDispatch, useSelector } from 'react-redux';
import { buildCoverLetterPrompt } from 'utils/promptUtils';
import { DEFAULT_MODEL } from 'utils/AIModelUtils';
import type { RootState } from 'store';
import { setApiKey, setGeneratedLetter, setAllCollapsed, setCustomization, incrementGenerationCount } from 'store/coverLetterSlice';
import { useGenerateCoverLetterMutation } from 'store/apiSlice';
import OnboardingModal from 'components/Modals/OnboardingModal';
import CustomizeModal, { type CustomizationOptions, type CustomizeModalSavePayload } from 'components/Modals/CustomizeModal';
import ApiKeySection from './ApiKeySection';
import ControlActions from './ControlActions';
import GenerateAction from './GenerateAction';

const GeneratorControls = () => {
    const dispatch = useDispatch();
    const { apiKey, jobDescription, template, generatedLetter, customization, generationCount, activeTemplateId } = useSelector((state: RootState) => state.coverLetter);
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

    const isFilterOn = !!(customization?.limitWords || customization?.minimalChanges || customization?.sameLanguage);

    const handleGenerate = async (optionsOverride?: CustomizationOptions, customPrompt?: string) => {
        // If they have created more than 4 cover letters and don't have their own key, they are blocked
        if (generationCount > 4 && !apiKey) {
            setIsEditing(true);
            return;
        }

        if (!jobDescription) return;

        const activeCustomization = optionsOverride || customization;
        const wordCountLimit = activeCustomization?.limitWords ? activeCustomization.wordCount : null;

        // Construct prompt
        const prompt = buildCoverLetterPrompt(
            jobDescription,
            template,
            wordCountLimit,
            activeCustomization?.minimalChanges,
            activeCustomization?.sameLanguage,
            customPrompt
        );

        try {
            dispatch(setAllCollapsed()); // Collapse inputs for better view
            const result = await generate({ 
                prompt, 
                model: DEFAULT_MODEL,
                ...(apiKey && { userApiKey: apiKey }),
            }).unwrap();
            dispatch(setGeneratedLetter(result));
            dispatch(incrementGenerationCount());
            showToast("Cover letter generated successfully!", { type: 'success' });

            if (isAuthenticated) {
                fetch('/api/cover-letters', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        templateId: activeTemplateId || undefined,
                        jobDescription,
                        generatedText: result,
                        model: DEFAULT_MODEL,
                        wordLimit: activeCustomization?.limitWords ? activeCustomization.wordCount : undefined,
                        minimalChanges: activeCustomization?.minimalChanges || undefined,
                        sameLanguage: activeCustomization?.sameLanguage || undefined,
                    }),
                }).then((res) => {
                    if (res.ok) {
                        showToast(
                            <span>Generated cover letter is saved. You can <Link to="/cover-letter/previous" className="underline font-semibold">check here</Link>.</span>,
                            { type: 'success', duration: 2000 }
                        );
                    } else {
                        showToast('Failed to save cover letter', { type: 'error' });
                    }
                }).catch(() => {
                    showToast('Failed to save cover letter', { type: 'error' });
                });
            }
        } catch (err) {
            console.error('Generation failed', err);
            showToast("Failed to generate cover letter. Please try again.", { type: 'error' });
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 flex flex-col items-start gap-2">
            
            <div className="flex flex-col lg:flex-row w-full gap-3 lg:items-center justify-between">
                <ApiKeySection 
                    apiKey={apiKey}
                    setApiKey={(val) => dispatch(setApiKey(val))}
                    showKeyInput={showKeyInput}
                    setShowKeyInput={setIsEditing}
                    setShowHelpModal={setShowHelpModal}
                />

                <div className="flex flex-col sm:flex-row w-full lg:w-auto items-stretch lg:items-center gap-1.5">
                    <ControlActions 
                        isFilterOn={isFilterOn}
                        setShowCustomizeModal={setShowCustomizeModal}
                    />

                    <GenerateAction 
                        isLoading={isLoading}
                        hasJobDescription={!!jobDescription}
                        hasGeneratedLetter={!!generatedLetter}
                        onGenerate={() => handleGenerate()}
                        error={error}
                    />
                </div>
            </div>

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
