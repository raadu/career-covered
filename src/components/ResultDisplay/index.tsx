import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import { type RootState } from 'store';
import { useState } from 'react';
import { setGeneratedLetter } from 'store/coverLetterSlice';
import { useGenerateCoverLetterMutation } from 'store/apiSlice';
import { DEFAULT_MODEL } from 'utils/AIModelUtils';
import { useCopy } from 'components/hooks/useCopy';

// Modular Components
import ResultHeader from './ResultHeader';
import ResultEditor from './ResultEditor';

const ResultDisplay = () => {
    const dispatch = useDispatch();
    const { generatedLetter, template, apiKey, model } = useSelector((state: RootState) => state.coverLetter);
    const [generate] = useGenerateCoverLetterMutation();
    const { copied, handleCopy } = useCopy();
    
    const [isDownloading, setIsDownloading] = useState<'pdf' | 'word' | null>(null);
    const [extractedName, setExtractedName] = useState<string | null>(null);

    /**
     * Extracts the user's name from the template to use as a filename.
     */
    const extractNameFromTemplate = async (): Promise<string> => {
// ...
        if (extractedName) return extractedName;
        if (!template || !apiKey) return 'Cover_Letter';

        try {
            const prompt = `Identify the sender's Firstname and Lastname from this cover letter template. 
            Return ONLY the name as 'Firstname Lastname'. 
            If not found, return 'NOT_FOUND'. 
            
            Template:
            ${template}`;

            const result = await generate({ 
                apiKey, 
                prompt, 
                model: model || DEFAULT_MODEL 
            }).unwrap();
            
            const name = result?.trim();
            if (name && name !== 'NOT_FOUND' && name.length < 50) {
                const formattedName = name.replace(/\s+/g, '_');
                const fileName = `Cover_Letter_${formattedName}`;
                setExtractedName(fileName);
                return fileName;
            }
        } catch (err) {
            console.error('Name extraction error:', err);
            toast.error("Couldn't identify your name in the template. Using default filename.");
        }
        
        return 'Cover_Letter';
    };

    /**
     * Professionally handles PDF generation and download.
     */
    const handleDownloadPDF = async () => {
        setIsDownloading('pdf');
        try {
            const doc = new jsPDF();
            const pageWidth = 180;
            const marginX = 15;
            const startY = 20;
            const pageHeightLimit = 280;
            const lineSpacing = 7;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);

            const lines: string[] = doc.splitTextToSize(generatedLetter, pageWidth);
            let currentY = startY;

            lines.forEach((line) => {
                if (currentY > pageHeightLimit) { 
                    doc.addPage();
                    currentY = startY;
                }
                doc.text(line, marginX, currentY);
                currentY += lineSpacing;
            });
            
            const fileName = await extractNameFromTemplate();
            doc.save(`${fileName}.pdf`);
        } catch (err) {
            console.error('PDF generation failed', err);
            toast.error("Failed to generate PDF. Please try again.");
        } finally {
            setIsDownloading(null);
        }
    };

    /**
     * Simplifies Word document generation and download.
     */
    const handleDownloadWord = async () => {
        setIsDownloading('word');
        try {
            const lines = generatedLetter.split('\n');
            const paragraphs = lines.map(line => 
                new Paragraph({
                    children: [
                        new TextRun({
                            text: line,
                            font: "Arial",
                            size: 24, // 12pt
                        })
                    ],
                    spacing: { after: 120 } // Add slight spacing between paragraphs
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
        } catch (err) {
            console.error('Word generation failed', err);
            toast.error("Failed to generate Word document.");
        } finally {
            setIsDownloading(null);
        }
    };

    if (!generatedLetter) return null;

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in mb-8">
            <ResultHeader 
                isDownloading={isDownloading}
                handleDownloadPDF={handleDownloadPDF}
                handleDownloadWord={handleDownloadWord}
                handleCopy={() => handleCopy(generatedLetter, "Result")}
                copied={copied}
            />
            
            <ResultEditor 
                value={generatedLetter}
                onChange={(val) => dispatch(setGeneratedLetter(val))}
            />
        </div>
    );
};

export default ResultDisplay;
