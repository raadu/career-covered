import { useState, type ChangeEvent } from 'react';
import { FaSlidersH } from 'react-icons/fa';
import Modal from 'components/common/Modal';
import CommonButton from 'components/common/CommonButton';
import { ICON_SIZE } from 'components/common/iconSizes';
import WordLimitSection from './WordLimitSection';
import CharacterLimitSection from './CharacterLimitSection';
import WritingStyleSection, {
  type WritingStyle,
} from './WritingStyleSection';
import CustomPromptSection from './CustomPromptSection';
import SameLanguageSection from './SameLanguageSection';

export interface CustomizationOptions {
  limitWords: boolean;
  wordCount: number;
  limitCharacters: boolean;
  charCount: number;
  writingStyle: WritingStyle;
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

const CustomizeModal = ({
  isOpen,
  onClose,
  initialOptions,
  onSave,
  hasTemplate,
}: CustomizeModalProps) => {
  const [limitWords, setLimitWordsState] = useState<boolean>(
    initialOptions.limitWords,
  );
  const [wordCountStr, setWordCountStr] = useState<string>(
    String(initialOptions.wordCount),
  );
  const [limitCharacters, setLimitCharactersState] = useState<boolean>(
    initialOptions.limitCharacters,
  );
  const [charCountStr, setCharCountStr] = useState<string>(
    initialOptions.charCount ? String(initialOptions.charCount) : '',
  );
  const [writingStyle, setWritingStyle] = useState<WritingStyle>(
    initialOptions.writingStyle,
  );
  const [sameLanguage, setSameLanguage] = useState<boolean>(
    initialOptions.sameLanguage,
  );
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Word limit and character limit both constrain output length, so only one
  // can be active at a time — checking either one clears the other.
  const setLimitWords = (val: boolean) => {
    setLimitWordsState(val);
    if (val) setLimitCharactersState(false);
    if (error) setError('');
  };
  const setLimitCharacters = (val: boolean) => {
    setLimitCharactersState(val);
    if (val) setLimitWordsState(false);
    if (error) setError('');
  };

  const handleWordCountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setWordCountStr(val);
    if (error) setError('');
  };
  const handleCharCountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setCharCountStr(val);
    if (error) setError('');
  };
  const handleReset = () => {
    setLimitWordsState(false);
    setWordCountStr('400');
    setLimitCharactersState(false);
    setCharCountStr('');
    setWritingStyle('balanced');
    setSameLanguage(false);
    setCustomPrompt('');
    setError('');
  };

  const handleSave = () => {
    const trimmedCustomPrompt = customPrompt.trim();

    if (limitWords) {
      const finalWordCount = parseInt(wordCountStr, 10);
      if (
        isNaN(finalWordCount) ||
        finalWordCount < 50 ||
        finalWordCount > 1000
      ) {
        setError('Numbers should be between 50 - 1000');
        return;
      }
    }

    if (limitCharacters) {
      const finalCharCount = parseInt(charCountStr, 10);
      if (
        isNaN(finalCharCount) ||
        finalCharCount < 200 ||
        finalCharCount > 5000
      ) {
        setError('Numbers should be between 200 - 5000');
        return;
      }
    }

    setError('');
    onSave({
      options: {
        limitWords,
        wordCount: parseInt(wordCountStr, 10) || 400,
        limitCharacters,
        charCount: parseInt(charCountStr, 10) || 0,
        writingStyle,
        sameLanguage,
      },
      customPrompt: trimmedCustomPrompt,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cover Letter Customization"
      icon={<FaSlidersH size={ICON_SIZE.sm} />}
      footer={
        <>
          <CommonButton variant="ghost" onClick={handleReset}>
            Reset
          </CommonButton>
          <CommonButton variant="primary" onClick={handleSave}>
            Save Options
          </CommonButton>
        </>
      }
    >
      <div className="space-y-3">
        <WordLimitSection
          limitWords={limitWords}
          setLimitWords={setLimitWords}
          wordCountStr={wordCountStr}
          onWordCountChange={handleWordCountChange}
          error={error}
        />

        <CharacterLimitSection
          limitCharacters={limitCharacters}
          setLimitCharacters={setLimitCharacters}
          charCountStr={charCountStr}
          onCharCountChange={handleCharCountChange}
          error={error}
        />

        <WritingStyleSection
          hasTemplate={hasTemplate}
          writingStyle={writingStyle}
          onChange={setWritingStyle}
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
    </Modal>
  );
};

export default CustomizeModal;
