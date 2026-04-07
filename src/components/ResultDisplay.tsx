import { useSelector, useDispatch } from 'react-redux';
import { FaCopy, FaCheck } from 'react-icons/fa';
import { type RootState } from '../store/store';
import { useState, useRef, useEffect } from 'react';
import { setGeneratedLetter } from '../store/coverLetterSlice';

const ResultDisplay = () => {
    const { generatedLetter } = useSelector((state: RootState) => state.coverLetter);
    const dispatch = useDispatch();
    const [copied, setCopied] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [generatedLetter]);

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedLetter);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!generatedLetter) return null;

    return (
        <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden animate-fade-in">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-blue-100 flex items-center justify-between">
                <h3 className="font-semibold text-blue-900">Generated Cover Letter</h3>
                <button
                    onClick={handleCopy}
                    className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                        ${copied 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-white text-gray-600 hover:text-blue-600 shadow-sm border border-gray-200'
                        }
                    `}
                >
                    {copied ? <FaCheck /> : <FaCopy />}
                    {copied ? 'Copied!' : 'Copy Text'}
                </button>
            </div>
            <div className="p-8">
                <textarea
                    ref={textareaRef}
                    value={generatedLetter}
                    onChange={(e) => dispatch(setGeneratedLetter(e.target.value))}
                    className="w-full min-h-[400px] border-0 focus:ring-1 focus:ring-blue-100 rounded-lg p-2 text-gray-800 whitespace-pre-wrap font-serif leading-relaxed bg-transparent transition-all outline-none resize-none"
                    spellCheck="false"
                    placeholder="Your generated cover letter will appear here..."
                />
            </div>
            <div className="px-8 pb-4 text-[11px] text-gray-400 italic">
                Tip: You can edit the text above to personalize it further.
            </div>
        </div>
    );
};

export default ResultDisplay;
