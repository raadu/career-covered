import { useState, type ChangeEvent } from 'react';
import Header from './Header';
import WordLimitSection from './WordLimitSection';
import MinimalChangesSection from './MinimalChangesSection';
import CustomPromptSection from './CustomPromptSection';
import SameLanguageSection from './SameLanguageSection';
import Footer from './Footer';

export interface CustomizationOptions {
  limitWords: boolean;
  wordCount: number;
  minimalChanges: boolean;
  sameLanguage: boolean;
}

export interface CustomizeModalSavePayload {
  options: CustomizationOptions;
  customPrompt: string;
}

interface CustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOptions: CustomizationOptions;
  onSave: (payload: CustomizeModalSavePayload) => void;
  hasTemplate: boolean;
}

const CustomizeModal = ({ isOpen, onClose, initialOptions, onSave, hasTemplate }: CustomizeModalProps) => {
  const [limitWords, setLimitWords] = useState<boolean>(initialOptions.limitWords);
  const [wordCountStr, setWordCountStr] = useState<string>(String(initialOptions.wordCount));
  const [minimalChanges, setMinimalChanges] = useState<boolean>(initialOptions.minimalChanges);
  const [sameLanguage, setSameLanguage] = useState<boolean>(initialOptions.sameLanguage);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [error, setError] = useState<string>('');


  const handleWordCountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setWordCountStr(val);
    if (error) setError('');
  };
  const handleReset = () => {
    setLimitWords(false);
    setWordCountStr('400');
    setMinimalChanges(false);
    setSameLanguage(false);
    setCustomPrompt('');
    setError('');
  };

  const handleSave = () => {
    const trimmedCustomPrompt = customPrompt.trim();

    if (limitWords) {
      const finalWordCount = parseInt(wordCountStr, 10);
      if (isNaN(finalWordCount) || finalWordCount < 50 || finalWordCount > 1000) {
        setError("Numbers should be between 50 - 1000");
        return;
      }
      onSave({
        options: {
          limitWords,
          wordCount: finalWordCount,
          minimalChanges,
          sameLanguage
        },
        customPrompt: trimmedCustomPrompt
      });
    } else {
      setError('');
      onSave({
        options: {
          limitWords,
          wordCount: parseInt(wordCountStr, 10) || 400,
          minimalChanges,
          sameLanguage
        },
        customPrompt: trimmedCustomPrompt
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md transition-all overscroll-none"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/20"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <Header onClose={onClose} />
        
        <div className="p-5 space-y-6">
          <WordLimitSection 
            limitWords={limitWords}
            setLimitWords={setLimitWords}
            wordCountStr={wordCountStr}
            onWordCountChange={handleWordCountChange}
            error={error}
          />

          <MinimalChangesSection 
            hasTemplate={hasTemplate}
            minimalChanges={minimalChanges}
            onToggle={() => setMinimalChanges(!minimalChanges)}
          />

          <SameLanguageSection
            sameLanguage={sameLanguage}
            onToggle={() => setSameLanguage(!sameLanguage)}
          />

          <CustomPromptSection 
            customPrompt={customPrompt}
            setCustomPrompt={setCustomPrompt}
          />
        </div>

        <Footer onSave={handleSave} onReset={handleReset} />
      </div>
    </div>
  );
};

export default CustomizeModal;
