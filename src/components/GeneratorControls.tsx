import { useState } from 'react';
import toast from 'react-hot-toast';
import { buildCoverLetterPrompt } from '../utils/promptUtils';
import { useDispatch, useSelector } from 'react-redux';
import { FaBolt, FaKey, FaQuestionCircle, FaSlidersH, FaArrowRight } from 'react-icons/fa';
import type { RootState } from '../store/store';
import { setApiKey, setGeneratedLetter, setAllCollapsed, setModel, setCustomization } from '../store/coverLetterSlice';
import { useGenerateCoverLetterMutation } from '../store/apiSlice';
import ModelSelector from './ModelSelector';
import ApiHelpModal from './ApiHelpModal';
import CustomizeModal, { type CustomizationOptions } from './CustomizeModal';

const PROVIDER_NAME = "Groq";
const PROVIDER_URL = "https://console.groq.com/keys";

const GeneratorControls = () => {
    const dispatch = useDispatch();
    const { apiKey, jobDescription, template, model, generatedLetter, customization } = useSelector((state: RootState) => state.coverLetter);
    const [generate, { isLoading, error }] = useGenerateCoverLetterMutation();
    const [showKeyInput, setShowKeyInput] = useState(!apiKey);
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [showCustomizeModal, setShowCustomizeModal] = useState(false);

    const isFilterOn = customization?.limitWords || customization?.minimalChanges;

    const handleGenerate = async (optionsOverride?: CustomizationOptions) => {
        if (!apiKey) {
            setShowKeyInput(true);
            return;
        }
        if (!jobDescription) return;

        const activeCustomization = optionsOverride || customization;
        const wordCountLimit = activeCustomization?.limitWords ? activeCustomization.wordCount : null;

        // Construct prompt
        const prompt = buildCoverLetterPrompt(jobDescription, template, wordCountLimit);

        try {
            dispatch(setAllCollapsed()); // Collapse inputs for better view
            const result = await generate({ apiKey, prompt, model: model || 'llama-3.3-70b-versatile' }).unwrap();
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
                {/* API Key Section */}
                <div className="flex-1 w-full md:w-auto">
                {showKeyInput ? (
                    <div className="flex items-center gap-2 w-full">
                         <div className="relative flex-1">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaKey className="text-gray-400" />
                             </div>
                             <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => dispatch(setApiKey(e.target.value))}
                                placeholder={`Enter ${PROVIDER_NAME} API Key`}
                                className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                             />
                         </div>
                         <button 
                            onClick={() => setShowHelpModal(true)}
                            className="text-blue-500 hover:text-blue-600 p-1 flex items-center justify-center rounded transition-colors"
                            title="Help with API Key"
                         >
                            <FaQuestionCircle size={14} />
                         </button>
                         <button 
                            onClick={() => setShowKeyInput(false)}
                            className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                         >
                            Done
                         </button>
                    </div>
                ) : (
                     <div className="flex items-center gap-3">
                         <button 
                            onClick={() => setShowKeyInput(true)}
                            className="text-xs text-gray-500 flex items-center gap-1 hover:text-blue-600 transition-colors"
                         >
                            <FaKey size={10} />
                            Update API Key
                         </button>
                         <button
                            onClick={() => setShowHelpModal(true)}
                            className="text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 flex items-center gap-1 rounded uppercase hover:bg-blue-100 transition-colors shadow-sm"
                         >
                            <FaQuestionCircle size={10} /> Help
                         </button>
                     </div>
                )}
            </div>

            <div className="w-full md:w-auto flex flex-wrap items-center justify-end gap-2">
                <div 
                    title="Shows if any custom cover letter filters are applied"
                    className={`flex items-center gap-1.5 px-2.5 h-9 text-xs font-semibold transition-colors cursor-default ${
                        isFilterOn 
                        ? 'text-emerald-600' 
                        : 'text-rose-600'
                    }`}
                >
                    <div className={`w-2 h-2 rounded-full ${isFilterOn ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`}></div>
                    <span>Custom Filter is {isFilterOn ? 'ON' : 'OFF'}</span>
                    <FaArrowRight size={10} className="opacity-70" />
                </div>
                <button
                    onClick={() => setShowCustomizeModal(true)}
                    className="group relative flex items-center gap-1.5 px-3 h-9 text-xs font-semibold rounded-lg border border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 overflow-hidden shadow-sm transition-all"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-60 w-full h-full transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out animate-[shimmer_2s_infinite]"></div>
                    {/* Add fallback pulse on icon so there's always animation */}
                    <FaSlidersH className="animate-pulse" size={12} />
                    <span className="relative z-10">Customize More</span>
                </button>
                <ModelSelector 
                    selectedModel={model} 
                    onModelChange={(val) => dispatch(setModel(val))} 
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
                onSave={(options) => {
                    dispatch(setCustomization(options));
                    setShowCustomizeModal(false);
                    handleGenerate(options);
                }}
            />

            {/* Generate Button */}
            <div className="w-full md:w-auto flex flex-col items-end">
                <button
                    onClick={() => handleGenerate()}
                    disabled={isLoading || !jobDescription}
                    className={`
                        flex items-center justify-center gap-2 px-4 h-9 text-xs rounded-lg font-semibold text-white shadow transition-all transform hover:-translate-y-0.5 active:translate-y-0
                        ${isLoading || !jobDescription 
                            ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                            : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:from-cyan-600 hover:to-violet-700 shadow-cyan-500/20'
                        }
                    `}
                >
                    {isLoading ? (
                        <>
                           <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                           Generating...
                        </>
                    ) : (
                        <>
                           <FaBolt />
                           {generatedLetter ? "Generate Another One" : "Generate Cover Letter"}
                        </>
                    )}
                </button>
                {error && (
                    <p className="text-red-500 text-xs mt-2">
                        Error generating. Check API Key.
                    </p>
                )}
            </div>
            </div>
        </div>
    );
};

export default GeneratorControls;
