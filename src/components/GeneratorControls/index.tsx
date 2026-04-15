import { useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { buildCoverLetterPrompt } from 'utils/promptUtils';
import { PROVIDER_NAME, PROVIDER_URL, DEFAULT_MODEL } from 'utils/AIModelUtils';
import type { RootState } from 'store';
import { setApiKey, setGeneratedLetter, setAllCollapsed, setModel, setCustomization } from 'store/coverLetterSlice';
import { useGenerateCoverLetterMutation } from 'store/apiSlice';
import ApiHelpModal from 'components/ApiHelpModal';
import CustomizeModal, { type CustomizationOptions, type CustomizeModalSavePayload } from 'components/CustomizeModal';
import ApiKeySection from './ApiKeySection';
import ControlActions from './ControlActions';
import GenerateAction from './GenerateAction';

const GeneratorControls = () => {
    const dispatch = useDispatch();
    const { apiKey, jobDescription, template, model, generatedLetter, customization } = useSelector((state: RootState) => state.coverLetter);
    const [generate, { isLoading, error }] = useGenerateCoverLetterMutation();
    const [showKeyInput, setShowKeyInput] = useState(!apiKey);
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [showCustomizeModal, setShowCustomizeModal] = useState(false);

    const isFilterOn = !!(customization?.limitWords || customization?.minimalChanges);

    const handleGenerate = async (optionsOverride?: CustomizationOptions, customPrompt?: string) => {
        if (!apiKey) {
            setShowKeyInput(true);
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
            customPrompt
        );

        try {
            dispatch(setAllCollapsed()); // Collapse inputs for better view
            const result = await generate({ 
                apiKey, 
                prompt, 
                model: model || DEFAULT_MODEL 
            }).unwrap();
            dispatch(setGeneratedLetter(result));
            toast.success("Cover letter generated successfully!");
        } catch (err) {
            console.error('Generation failed', err);
            toast.error("Failed to generate cover letter. Please try again.");
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 flex flex-col items-start gap-2">
            
            <div className="flex flex-col md:flex-row w-full gap-3 items-center justify-between">
                <ApiKeySection 
                    apiKey={apiKey}
                    setApiKey={(val) => dispatch(setApiKey(val))}
                    showKeyInput={showKeyInput}
                    setShowKeyInput={setShowKeyInput}
                    setShowHelpModal={setShowHelpModal}
                />

                <ControlActions 
                    isFilterOn={isFilterOn}
                    model={model || DEFAULT_MODEL}
                    setModel={(val) => dispatch(setModel(val))}
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

            <ApiHelpModal 
                isOpen={showHelpModal} 
                onClose={() => setShowHelpModal(false)}
                providerName={PROVIDER_NAME}
                providerUrl={PROVIDER_URL}
            />
            
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
        </div>
    );
};

export default GeneratorControls;
