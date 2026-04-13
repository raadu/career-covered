import { useSelector, useDispatch } from 'react-redux';
import { FaCopy, FaCheck, FaFilePdf, FaFileWord, FaSpinner } from 'react-icons/fa';
import { type RootState } from '../store/store';
import { useState, useRef, useEffect } from 'react';
import { setGeneratedLetter } from '../store/coverLetterSlice';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import { useGenerateCoverLetterMutation } from '../store/apiSlice';

const ResultDisplay = () => {
    const { generatedLetter, template, apiKey, model } = useSelector((state: RootState) => state.coverLetter);
    const dispatch = useDispatch();
    const [generate] = useGenerateCoverLetterMutation();
    const [copied, setCopied] = useState(false);
    const [isDownloading, setIsDownloading] = useState<'pdf' | 'word' | null>(null);
    const [extractedName, setExtractedName] = useState<string | null>(null);
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

    const extractNameFromTemplate = async (): Promise<string> => {
        if (extractedName) return extractedName;
        if (!template || !apiKey) return 'Cover_Letter';

        try {
            const prompt = `From this cover letter template, strictly find the user's Firstname and Lastname. Return only 'Firstname Lastname'. If not found, return 'NOT_FOUND'. \n\nTemplate:\n${template}`;
            const result = await generate({ apiKey, prompt, model: model || 'llama-3.3-70b-versatile' }).unwrap();
            
            if (result && result.trim() !== 'NOT_FOUND' && result.length < 50) {
                const cleanName = result.trim().replace(/\s+/g, '_');
                const finalName = `Cover_Letter_${cleanName}`;
                setExtractedName(finalName);
                return finalName;
            }
        } catch (err) {
            console.error('Failed to extract name', err);
        }
        
        return 'Cover_Letter';
    };

    const handleDownloadPDF = async () => {
        setIsDownloading('pdf');
        const doc = new jsPDF();
        
        // Arial is not a built-in standard PDF font without external loading, 
        // using Helvetica which is the exact PDF equivalent.
        doc.setFont("helvetica");
        doc.setFontSize(12);

        const lines = doc.splitTextToSize(generatedLetter, 180);
        
        let y = 20;
        for (let i = 0; i < lines.length; i++) {
            if (y > 280) { // Check if near bottom
                doc.addPage();
                y = 20;
            }
            doc.text(lines[i], 15, y);
            y += 7; // Line height
        }
        
        const fileName = await extractNameFromTemplate();
        doc.save(`${fileName}.pdf`);
        setIsDownloading(null);
    };

    const handleDownloadWord = async () => {
        setIsDownloading('word');
        const paragraphs = generatedLetter.split('\n').map(line => 
            new Paragraph({
                children: [
                    new TextRun({
                        text: line,
                        font: "Arial",
                        size: 24, // 24 half-points = 12pt
                    })
                ],
            })
        );
        
        const doc = new Document({
            sections: [{
                properties: {},
                children: paragraphs,
            }]
        });
        
        const blob = await Packer.toBlob(doc);
        const fileName = await extractNameFromTemplate();
        saveAs(blob, `${fileName}.docx`);
        setIsDownloading(null);
    };

    if (!generatedLetter) return null;

    return (
        <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden animate-fade-in">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-blue-100 flex items-center justify-between">
                <h3 className="font-semibold text-blue-900">Generated Cover Letter</h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleDownloadPDF}
                        disabled={!!isDownloading}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all bg-white text-red-600 hover:text-red-700 hover:bg-red-50 shadow-sm border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Download as PDF"
                    >
                        {isDownloading === 'pdf' ? <FaSpinner className="animate-spin" /> : <FaFilePdf />}
                        {isDownloading === 'pdf' ? 'Preparing PDF...' : 'Download as PDF'}
                    </button>
                    <button
                        onClick={handleDownloadWord}
                        disabled={!!isDownloading}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all bg-white text-blue-600 hover:text-blue-700 hover:bg-blue-50 shadow-sm border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Download as WORD"
                    >
                        {isDownloading === 'word' ? <FaSpinner className="animate-spin" /> : <FaFileWord />}
                        {isDownloading === 'word' ? 'Preparing Word...' : 'Download as WORD'}
                    </button>
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
