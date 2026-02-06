import { useSelector } from 'react-redux';
import { FaCopy, FaCheck } from 'react-icons/fa';
import { type RootState } from '../store/store';
import { useState } from 'react';

const ResultDisplay = () => {
    const { generatedLetter } = useSelector((state: RootState) => state.coverLetter);
    const [copied, setCopied] = useState(false);

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
                <div className="prose max-w-none text-gray-800 whitespace-pre-wrap font-serif leading-relaxed">
                    {generatedLetter}
                </div>
            </div>
        </div>
    );
};

export default ResultDisplay;
