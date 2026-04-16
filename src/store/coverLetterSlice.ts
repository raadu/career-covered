import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface CoverLetterState {
  template: string;
  jobDescription: string;
  generatedLetter: string;
  apiKey: string;
  model: string;
  isTemplateExpanded: boolean;
  isJobDescExpanded: boolean;
  isGenerating: boolean;
  customization: {
    limitWords: boolean;
    wordCount: number;
    minimalChanges: boolean;
  };
}

const savedTemplate = localStorage.getItem('cl_template') || '';
const savedApiKey = localStorage.getItem('cl_apiKey') || '';
const savedModel = localStorage.getItem('cl_model') || 'llama-3.3-70b-versatile';


const initialState: CoverLetterState = {
  template: savedTemplate,
  jobDescription: '',
  generatedLetter: '',
  apiKey: savedApiKey,
  model: savedModel,
  isTemplateExpanded: !savedTemplate, // Auto-collapse if saved
  isJobDescExpanded: true,
  isGenerating: false,
  customization: {
    limitWords: localStorage.getItem('cl_limitWords') === 'true',
    wordCount: parseInt(localStorage.getItem('cl_wordCount') || '400', 10),
    minimalChanges: localStorage.getItem('cl_minimalChanges') === 'true',
  },
};

export const coverLetterSlice = createSlice({
  name: 'coverLetter',
  initialState,
  reducers: {
    setTemplate: (state, action: PayloadAction<string>) => {
      state.template = action.payload;
    },
    setJobDescription: (state, action: PayloadAction<string>) => {
      state.jobDescription = action.payload;
    },
    setGeneratedLetter: (state, action: PayloadAction<string>) => {
      state.generatedLetter = action.payload;
    },
    setApiKey: (state, action: PayloadAction<string>) => {
      state.apiKey = action.payload;
    },
    setModel: (state, action: PayloadAction<string>) => {
      state.model = action.payload;
    },
    toggleTemplateExpanded: (state) => {
      state.isTemplateExpanded = !state.isTemplateExpanded;
    },
    toggleJobDescExpanded: (state) => {
      state.isJobDescExpanded = !state.isJobDescExpanded;
    },
    setAllCollapsed: (state) => {
        state.isTemplateExpanded = false;
        state.isJobDescExpanded = false;
    },
    setIsGenerating: (state, action: PayloadAction<boolean>) => {
      state.isGenerating = action.payload;
    },
    clearGeneratedLetter: (state) => {
      state.generatedLetter = '';
    },
    setCustomization: (state, action: PayloadAction<CoverLetterState['customization']>) => {
      state.customization = action.payload;
      localStorage.setItem('cl_limitWords', String(action.payload.limitWords));
      localStorage.setItem('cl_wordCount', String(action.payload.wordCount));
      localStorage.setItem('cl_minimalChanges', String(action.payload.minimalChanges));
    }
  },
});

export const {
  setTemplate,
  setJobDescription,
  setGeneratedLetter,
  setApiKey,
  setModel,
  toggleTemplateExpanded,
  toggleJobDescExpanded,
  setAllCollapsed,
  setIsGenerating,
  clearGeneratedLetter,
  setCustomization
} = coverLetterSlice.actions;

export default coverLetterSlice.reducer;
