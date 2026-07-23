import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { showToast } from 'components/common/Toast';

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
  isLoadingTemplates: boolean;
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

const { jobDescription: restoredJobDescription, generatedLetter: restoredGeneratedLetter } = restoreSessionStorage();

const initialState: CoverLetterState = {
  template: savedTemplate,
  jobDescription: restoredJobDescription,
  generatedLetter: restoredGeneratedLetter,
  apiKey: savedApiKey,
  model: savedModel,
  isTemplateExpanded: false,
  isJobDescExpanded: true,
  isGenerating: false,
  isLoadingTemplates: false,
  customization: {
    limitWords: localStorage.getItem('cl_limitWords') === 'true',
    wordCount: parseInt(localStorage.getItem('cl_wordCount') || '400', 10),
    minimalChanges: localStorage.getItem('cl_minimalChanges') === 'true',
    sameLanguage: localStorage.getItem('cl_sameLanguage') === 'true',
  },
  generationCount: fallbackCount,
  savedTemplates: [],
  activeTemplateId: null,
};

export const fetchTemplates = createAsyncThunk(
  'coverLetter/fetchTemplates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      return (await response.json()) as SavedTemplate[];
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch templates');
    }
  },
);

export const createTemplate = createAsyncThunk(
  'coverLetter/createTemplate',
  async (data: { name: string; content: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create template');
      return (await response.json()) as SavedTemplate;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to create template');
    }
  },
);

export const updateTemplate = createAsyncThunk(
  'coverLetter/updateTemplate',
  async (data: { id: string; name: string; content: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/templates/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, content: data.content }),
      });
      if (!response.ok) throw new Error('Failed to update template');
      return (await response.json()) as SavedTemplate;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update template');
    }
  },
);

export const deleteTemplate = createAsyncThunk(
  'coverLetter/deleteTemplate',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete template');
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to delete template');
    }
  },
);

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
  extraReducers: (builder) => {
    builder
      .addCase(fetchTemplates.pending, (state) => {
        state.isLoadingTemplates = true;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.savedTemplates = action.payload;
        state.isLoadingTemplates = false;
        const savedId = localStorage.getItem('cl_active_template_id');
        if (savedId) {
          const tpl = action.payload.find((t) => t.id === savedId);
          if (tpl) {
            state.activeTemplateId = savedId;
            state.template = tpl.content;
          } else {
            localStorage.removeItem('cl_active_template_id');
          }
        }
      })
      .addCase(fetchTemplates.rejected, (state) => {
        state.isLoadingTemplates = false;
      })
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.savedTemplates.push(action.payload);
        state.activeTemplateId = action.payload.id;
        state.template = action.payload.content;
        state.isTemplateExpanded = true;
        localStorage.setItem('cl_active_template_id', action.payload.id);
        showToast('New template added', { duration: 2000 });
      })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        const idx = state.savedTemplates.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.savedTemplates[idx] = action.payload;
        showToast('Template updated', { duration: 2000 });
      })
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        const id = action.payload;
        state.savedTemplates = state.savedTemplates.filter((t) => t.id !== id);
        if (state.activeTemplateId === id) {
          state.activeTemplateId = state.savedTemplates.length > 0 ? state.savedTemplates[0].id : null;
          if (state.activeTemplateId) {
            const tpl = state.savedTemplates.find((t) => t.id === state.activeTemplateId);
            if (tpl) state.template = tpl.content;
            localStorage.setItem('cl_active_template_id', state.activeTemplateId);
          } else {
            state.template = '';
            localStorage.removeItem('cl_active_template_id');
          }
        }
        showToast('Template has been removed', { duration: 2000 });
      })
      .addCase('auth/logoutUser/fulfilled', (state) => {
        state.savedTemplates = [];
        state.activeTemplateId = null;
        state.template = '';
        localStorage.removeItem('cl_active_template_id');
        localStorage.removeItem('cl_template');
      });
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
  selectTemplate,
} = coverLetterSlice.actions;

export default coverLetterSlice.reducer;
