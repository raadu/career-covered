import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaBolt, FaKey } from 'react-icons/fa';
import type { RootState } from '../store/store';
import { setApiKey, setGeneratedLetter, setAllCollapsed, setModel } from '../store/coverLetterSlice';
import { useGenerateCoverLetterMutation } from '../store/apiSlice';
import ModelSelector from './ModelSelector';

const GeneratorControls = () => {
    const dispatch = useDispatch();
    const { apiKey, jobDescription, template, model } = useSelector((state: RootState) => state.coverLetter);
    const [generate, { isLoading, error }] = useGenerateCoverLetterMutation();
    const [showKeyInput, setShowKeyInput] = useState(!apiKey);

    const handleGenerate = async () => {
        if (!apiKey) {
            setShowKeyInput(true);
            return;
        }
        if (!jobDescription) return;

        // Construct prompt
        const prompt = `
You are an expert career consultant.
Task: Write a professional cover letter.
Context:
- Job Description:
${jobDescription}

${template ? `- User's Background/Style (Adapt this): \n${template}` : '- User has not provided a template. Use standard professional format.'}

Rules:
1. Keep it concise (under 400 words).
2. Match the tone of the company/industry.
3. Highlight 3-4 key matches between User Template skills and Job Description requirements.
4. Output strictly the cover letter text. No preamble.
        `;

        try {
            dispatch(setAllCollapsed()); // Collapse inputs for better view
            const result = await generate({ apiKey, prompt, model: model || 'llama-3.3-70b-versatile' }).unwrap();
            dispatch(setGeneratedLetter(result));
        } catch (err) {
            console.error('Generation failed', err);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-start gap-4">
            
            <div className="flex flex-col md:flex-row w-full gap-4 items-center justify-between">
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
                                placeholder="Enter Groq API Key"
                                className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                             />
                         </div>
                         <button 
                            onClick={() => setShowKeyInput(false)}
                            className="text-gray-500 hover:text-gray-700 text-sm"
                         >
                            Done
                         </button>
                    </div>
                ) : (
                     <button 
                        onClick={() => setShowKeyInput(true)}
                        className="text-xs text-gray-500 flex items-center gap-1 hover:text-blue-600 transition-colors"
                     >
                        <FaKey size={10} />
                        Update API Key
                     </button>
                )}
            </div>

            <div className="w-full md:w-auto">
                <ModelSelector 
                    selectedModel={model} 
                    onModelChange={(val) => dispatch(setModel(val))} 
                />
            </div>

            {/* Generate Button */}
            <div className="w-full md:w-auto flex flex-col items-end">
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !jobDescription}
                    className={`
                        flex items-center gap-2 px-8 py-3 rounded-lg font-bold text-white shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0
                        ${isLoading || !jobDescription 
                            ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                            : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:from-cyan-600 hover:to-violet-700 shadow-cyan-500/30'
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
                           Generate Cover Letter
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
