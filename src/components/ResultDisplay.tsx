import { useSelector, useDispatch } from 'react-redux';
import { FaCopy, FaCheck, FaFilePdf, FaFileWord } from 'react-icons/fa';
import { type RootState } from '../store/store';
import { useState, useRef, useEffect } from 'react';
import { setGeneratedLetter } from '../store/coverLetterSlice';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

const ResultDisplay = () => {
    const { generatedLetter, jobDescription } = useSelector((state: RootState) => state.coverLetter);
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

    const extractEmployerName = (text: string) => {
        if (!text) return null;
        // Simple heuristic to find "Company: Name" or similar in text
        const match = text.match(/(?:Company|Employer)\s*[:\-]\s*([a-zA-Z0-9\s]+)/i);
        if (match && match[1]) {
            return match[1].trim().replace(/\s+/g, '_');
        }
        return null;
    };

    const handleDownloadPDF = () => {
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
        
        const employerName = extractEmployerName(jobDescription) || extractEmployerName(generatedLetter);
        const fileName = employerName ? `cover_letter_${employerName}.pdf` : 'cover_letter.pdf';
        
        doc.save(fileName);
    };

    const handleDownloadWord = async () => {
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
        const employerName = extractEmployerName(jobDescription) || extractEmployerName(generatedLetter);
        const fileName = employerName ? `cover_letter_${employerName}.docx` : 'cover_letter.docx';
        
        saveAs(blob, fileName);
    };

    if (!generatedLetter) return null;

    return (
        <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden animate-fade-in">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-blue-100 flex items-center justify-between">
                <h3 className="font-semibold text-blue-900">Generated Cover Letter</h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleDownloadPDF}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all bg-white text-red-600 hover:text-red-700 hover:bg-red-50 shadow-sm border border-gray-200"
                        title="Download as PDF"
                    >
                        <FaFilePdf />
                        Download as PDF
                    </button>
                    <button
                        onClick={handleDownloadWord}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all bg-white text-blue-600 hover:text-blue-700 hover:bg-blue-50 shadow-sm border border-gray-200"
                        title="Download as WORD"
                    >
                        <FaFileWord />
                        Download as WORD
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
