import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { showToast } from 'components/common/Toast';
import { createApiThunk } from 'store/createApiThunk';
import {
  getLocalStorageItem,
  setLocalStorageItem,
  removeLocalStorageItem,
} from 'utils/localStorageUtils';
import { AVAILABLE_MODELS, DEFAULT_MODEL } from 'utils/AIModelUtils';

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
  selectedModel: string;
}

export function restoreSessionStorage(): {
  jobDescription: string;
  generatedLetter: string;
} {
  const restoredJobDescription = sessionStorage.getItem('cl_restore_jd') || '';
  const restoredGeneratedLetter = sessionStorage.getItem('cl_restore_gl') || '';
  if (restoredJobDescription) sessionStorage.removeItem('cl_restore_jd');
  if (restoredGeneratedLetter) sessionStorage.removeItem('cl_restore_gl');
  return {
    jobDescription: restoredJobDescription,
    generatedLetter: restoredGeneratedLetter,
  };
}

const savedTemplate = getLocalStorageItem('template') || '';
const savedApiKey = getLocalStorageItem('apiKey') || '';
const fallbackCount = parseInt(
  getLocalStorageItem('generation_count') || '0',
  10,
);
const savedModel = getLocalStorageItem('model');
const initialSelectedModel = AVAILABLE_MODELS.some((m) => m.id === savedModel)
  ? (savedModel as string)
  : DEFAULT_MODEL;

const {
  jobDescription: restoredJobDescription,
  generatedLetter: restoredGeneratedLetter,
} = restoreSessionStorage();

const initialState: CoverLetterState = {
  template: savedTemplate,
  jobDescription: restoredJobDescription,
  generatedLetter: restoredGeneratedLetter,
  apiKey: savedApiKey,
  isTemplateExpanded: false,
  isJobDescExpanded: true,
  isGenerating: false,
  isLoadingTemplates: false,
  customization: {
    limitWords: getLocalStorageItem('limitWords') === 'true',
    wordCount: parseInt(getLocalStorageItem('wordCount') || '400', 10),
    minimalChanges: getLocalStorageItem('minimalChanges') === 'true',
    sameLanguage: getLocalStorageItem('sameLanguage') === 'true',
  },
  generationCount: fallbackCount,
  savedTemplates: [],
  activeTemplateId: null,
  selectedModel: initialSelectedModel,
};

export const fetchTemplates = createApiThunk<SavedTemplate[]>(
  'coverLetter/fetchTemplates',
  async () => {
    const response = await fetch('/api/templates?sortByUpdateTime=true');
    if (!response.ok) throw new Error('Failed to fetch templates');
    return (await response.json()) as SavedTemplate[];
  },
  'Failed to fetch templates',
);

export const createTemplate = createApiThunk<
  SavedTemplate,
  { name: string; content: string }
>(
  'coverLetter/createTemplate',
  async (data) => {
    const response = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create template');
    return (await response.json()) as SavedTemplate;
  },
  'Failed to create template',
);

export const updateTemplate = createApiThunk<
  SavedTemplate,
  { id: string; name: string; content: string }
>(
  'coverLetter/updateTemplate',
  async (data) => {
    const response = await fetch(`/api/templates/${data.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: data.name, content: data.content }),
    });
    if (!response.ok) throw new Error('Failed to update template');
    return (await response.json()) as SavedTemplate;
  },
  'Failed to update template',
);

export const deleteTemplate = createApiThunk<string, string>(
  'coverLetter/deleteTemplate',
  async (id) => {
    const response = await fetch(`/api/templates/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete template');
    return id;
  },
  'Failed to delete template',
);

export const coverLetterSlice = createSlice({
  name: 'coverLetter',
  initialState,
  reducers: {
    setTemplate: (state, action: PayloadAction<string>) => {
      state.template = action.payload;
    },
    clearTemplate: (state) => {
      state.template = '';
      state.activeTemplateId = null;
      setLocalStorageItem('template', '');
      removeLocalStorageItem('active_template_id');
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
    setCustomization: (
      state,
      action: PayloadAction<CoverLetterState['customization']>,
    ) => {
      state.customization = action.payload;
      setLocalStorageItem('limitWords', String(action.payload.limitWords));
      setLocalStorageItem('wordCount', String(action.payload.wordCount));
      setLocalStorageItem(
        'minimalChanges',
        String(action.payload.minimalChanges),
      );
      setLocalStorageItem('sameLanguage', String(action.payload.sameLanguage));
    },
    incrementGenerationCount: (state) => {
      const fallbackCount = parseInt(
        getLocalStorageItem('generation_count') || '0',
        10,
      );
      const newFallbackCount = fallbackCount + 1;
      setLocalStorageItem('generation_count', String(newFallbackCount));
      state.generationCount = newFallbackCount;
    },
    setSelectedModel: (state, action: PayloadAction<string>) => {
      state.selectedModel = action.payload;
      setLocalStorageItem('model', action.payload);
    },
    selectTemplate: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const tpl = state.savedTemplates.find((t) => t.id === id);
      if (tpl) {
        state.activeTemplateId = id;
        state.template = tpl.content;
        state.isTemplateExpanded = true;
        setLocalStorageItem('active_template_id', id);
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
        const savedId = getLocalStorageItem('active_template_id');
        if (savedId) {
          const tpl = action.payload.find((t) => t.id === savedId);
          if (tpl) {
            state.activeTemplateId = savedId;
            state.template = tpl.content;
          } else {
            removeLocalStorageItem('active_template_id');
          }
        }
      })
      .addCase(fetchTemplates.rejected, (state) => {
        state.isLoadingTemplates = false;
      })
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.savedTemplates.unshift(action.payload);
        state.activeTemplateId = action.payload.id;
        state.template = action.payload.content;
        state.isTemplateExpanded = true;
        setLocalStorageItem('active_template_id', action.payload.id);
        showToast('New template added', { duration: 2000 });
      })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        const idx = state.savedTemplates.findIndex(
          (t) => t.id === action.payload.id,
        );
        if (idx !== -1) state.savedTemplates[idx] = action.payload;
        showToast('Template updated', { duration: 2000 });
      })
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        const id = action.payload;
        state.savedTemplates = state.savedTemplates.filter((t) => t.id !== id);
        if (state.activeTemplateId === id) {
          state.activeTemplateId =
            state.savedTemplates.length > 0 ? state.savedTemplates[0].id : null;
          if (state.activeTemplateId) {
            const tpl = state.savedTemplates.find(
              (t) => t.id === state.activeTemplateId,
            );
            if (tpl) state.template = tpl.content;
            setLocalStorageItem('active_template_id', state.activeTemplateId);
          } else {
            state.template = '';
            removeLocalStorageItem('active_template_id');
          }
        }
        showToast('Template has been removed', { duration: 2000 });
      })
      .addCase('auth/logoutUser/fulfilled', (state) => {
        state.savedTemplates = [];
        state.activeTemplateId = null;
        state.template = '';
        removeLocalStorageItem('active_template_id');
        removeLocalStorageItem('template');
      });
  },
});

export const {
  setTemplate,
  setJobDescription,
  setGeneratedLetter,
  setApiKey,
  clearTemplate,
  toggleTemplateExpanded,
  toggleJobDescExpanded,
  setAllCollapsed,
  setIsGenerating,
  clearGeneratedLetter,
  setCustomization,
  incrementGenerationCount,
  selectTemplate,
  setSelectedModel,
} = coverLetterSlice.actions;

export default coverLetterSlice.reducer;
