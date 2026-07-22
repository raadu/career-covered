import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface SavedTemplate {
  id: string;
  name: string;
  content: string;
}

export interface CoverLetterState {
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
    sameLanguage: boolean;
  };
  generationCount: number;
  savedTemplates: SavedTemplate[];
  activeTemplateId: string | null;
}

export function restoreSessionStorage(): { jobDescription: string; generatedLetter: string } {
  const restoredJobDescription = sessionStorage.getItem('cl_restore_jd') || '';
  const restoredGeneratedLetter = sessionStorage.getItem('cl_restore_gl') || '';
  if (restoredJobDescription) sessionStorage.removeItem('cl_restore_jd');
  if (restoredGeneratedLetter) sessionStorage.removeItem('cl_restore_gl');
  return { jobDescription: restoredJobDescription, generatedLetter: restoredGeneratedLetter };
}

const savedTemplate = localStorage.getItem('cl_template') || '';
const savedApiKey = localStorage.getItem('cl_apiKey') || '';
const savedModel = localStorage.getItem('cl_model') || 'llama-3.3-70b-versatile';
const fallbackCount = parseInt(localStorage.getItem('cl_generation_count') || '0', 10);
const savedTemplatesRaw = localStorage.getItem('cl_saved_templates');
const savedTemplates: SavedTemplate[] = savedTemplatesRaw ? JSON.parse(savedTemplatesRaw) : [];
const savedActiveId = localStorage.getItem('cl_active_template_id');
const initialActiveId = savedTemplates.find((t) => t.id === savedActiveId)?.id
  ?? (savedTemplates.length > 0 ? savedTemplates[0].id : null);

const { jobDescription: restoredJobDescription, generatedLetter: restoredGeneratedLetter } = restoreSessionStorage();

const initialState: CoverLetterState = {
  template: initialActiveId
    ? savedTemplates.find((t) => t.id === initialActiveId)!.content
    : savedTemplate,
  jobDescription: restoredJobDescription,
  generatedLetter: restoredGeneratedLetter,
  apiKey: savedApiKey,
  model: savedModel,
  isTemplateExpanded: !savedTemplate && savedTemplates.length === 0,
  isJobDescExpanded: true,
  isGenerating: false,
  customization: {
    limitWords: localStorage.getItem('cl_limitWords') === 'true',
    wordCount: parseInt(localStorage.getItem('cl_wordCount') || '400', 10),
    minimalChanges: localStorage.getItem('cl_minimalChanges') === 'true',
    sameLanguage: localStorage.getItem('cl_sameLanguage') === 'true',
  },
  generationCount: fallbackCount,
  savedTemplates,
  activeTemplateId: initialActiveId,
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
      localStorage.setItem('cl_sameLanguage', String(action.payload.sameLanguage));
    },
    incrementGenerationCount: (state) => {
      const fallbackCount = parseInt(localStorage.getItem('cl_generation_count') || '0', 10);
      const newFallbackCount = fallbackCount + 1;
      localStorage.setItem('cl_generation_count', String(newFallbackCount));
      state.generationCount = newFallbackCount;
    },
    addTemplate: (state) => {
      const content = state.template.trim();
      if (!content) return;

      let updated = [...state.savedTemplates];
      if (updated.length >= 3) {
        updated = updated.slice(1);
      }
      const newTemplate: SavedTemplate = {
        id: crypto.randomUUID(),
        name: `Template ${updated.length + 1}`,
        content,
      };
      updated.push(newTemplate);
      state.savedTemplates = updated;
      state.activeTemplateId = newTemplate.id;
      localStorage.setItem('cl_active_template_id', newTemplate.id);
    },
    removeTemplate: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.savedTemplates = state.savedTemplates.filter((t) => t.id !== id);
      if (state.activeTemplateId === id) {
        state.activeTemplateId = state.savedTemplates.length > 0 ? state.savedTemplates[0].id : null;
        state.template = state.activeTemplateId
          ? state.savedTemplates.find((t) => t.id === state.activeTemplateId)!.content
          : '';
        if (state.activeTemplateId) {
          localStorage.setItem('cl_active_template_id', state.activeTemplateId);
        } else {
          localStorage.removeItem('cl_active_template_id');
        }
      }
    },
    renameTemplate: (state, action: PayloadAction<{ id: string; name: string }>) => {
      const tpl = state.savedTemplates.find((t) => t.id === action.payload.id);
      if (tpl) tpl.name = action.payload.name;
    },
    selectTemplate: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const tpl = state.savedTemplates.find((t) => t.id === id);
      if (tpl) {
        state.activeTemplateId = id;
        state.template = tpl.content;
        state.isTemplateExpanded = true;
        localStorage.setItem('cl_active_template_id', id);
      }
    },
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
  setCustomization,
  incrementGenerationCount,
  addTemplate,
  removeTemplate,
  renameTemplate,
  selectTemplate,
} = coverLetterSlice.actions;

export default coverLetterSlice.reducer;
