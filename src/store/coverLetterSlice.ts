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
}

const savedTemplate = localStorage.getItem('cl_template') || '';
const savedApiKey = localStorage.getItem('cl_apiKey') || '';
let savedModel = localStorage.getItem('cl_model') || 'llama-3.3-70b-versatile';

// Migration: If user has old Gemini model saved, reset to Groq model
if (savedModel.includes('gemini')) {
    savedModel = 'llama-3.3-70b-versatile';
    localStorage.removeItem('cl_model'); // Clear legacy persistence
}

const initialState: CoverLetterState = {
  template: savedTemplate,
  jobDescription: '',
  generatedLetter: '',
  apiKey: savedApiKey,
  model: savedModel,
  isTemplateExpanded: !savedTemplate, // Auto-collapse if saved
  isJobDescExpanded: true,
  isGenerating: false,
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
  clearGeneratedLetter
} = coverLetterSlice.actions;

export default coverLetterSlice.reducer;
