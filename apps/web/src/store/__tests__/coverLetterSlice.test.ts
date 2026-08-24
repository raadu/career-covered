import { describe, it, expect, beforeEach } from 'vitest';
import coverLetterReducer, {
  restoreSessionStorage,
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
  fetchTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  type SavedTemplate,
  type CoverLetterState,
} from 'store/coverLetterSlice';
import { DEFAULT_MODEL } from 'utils/AIModelUtils';

const createBlankState = (
  overrides?: Partial<CoverLetterState>,
): CoverLetterState => ({
  template: '',
  jobDescription: '',
  generatedLetter: '',
  apiKey: '',
  isTemplateExpanded: true,
  isJobDescExpanded: true,
  isGenerating: false,
  isLoadingTemplates: false,
  customization: {
    limitWords: false,
    wordCount: 400,
    limitCharacters: false,
    charCount: 0,
    minimalChanges: false,
    sameLanguage: false,
  },
  generationCount: 0,
  savedTemplates: [],
  activeTemplateId: null,
  selectedModel: DEFAULT_MODEL,
  ...overrides,
});

const makeTemplate = (
  id: string,
  name: string,
  content: string,
): SavedTemplate => ({
  id,
  name,
  content,
});

const tpl1 = makeTemplate('id-1', 'Template 1', 'Content 1');
const tpl2 = makeTemplate('id-2', 'Template 2', 'Content 2');
const tpl3 = makeTemplate('id-3', 'Template 3', 'Content 3');

beforeEach(() => {
  localStorage.clear();
});

describe('coverLetterSlice', () => {
  describe('setTemplate', () => {
    it('updates template text', () => {
      const state = coverLetterReducer(
        createBlankState(),
        setTemplate('Hello World'),
      );
      expect(state.template).toBe('Hello World');
    });

    it('accepts empty string', () => {
      const state = coverLetterReducer(
        createBlankState({ template: 'existing' }),
        setTemplate(''),
      );
      expect(state.template).toBe('');
    });
  });

  describe('setJobDescription', () => {
    it('updates job description', () => {
      const state = coverLetterReducer(
        createBlankState(),
        setJobDescription('Engineer role'),
      );
      expect(state.jobDescription).toBe('Engineer role');
    });
  });

  describe('clearTemplate', () => {
    it('clears template text and deselects the active template', () => {
      const state = coverLetterReducer(
        createBlankState({
          template: 'Existing template',
          activeTemplateId: 'id-1',
        }),
        clearTemplate(),
      );
      expect(state.template).toBe('');
      expect(state.activeTemplateId).toBeNull();
    });

    it('removes the persisted active template id from localStorage', () => {
      localStorage.setItem('cl_active_template_id', 'id-1');
      localStorage.setItem('cl_template', 'Existing template');
      coverLetterReducer(
        createBlankState({
          template: 'Existing template',
          activeTemplateId: 'id-1',
        }),
        clearTemplate(),
      );
      expect(localStorage.getItem('cl_active_template_id')).toBeNull();
      expect(localStorage.getItem('cl_template')).toBe('');
    });

    it('does not re-select the template on fetch.fulfilled after clearing', () => {
      localStorage.setItem('cl_active_template_id', 'id-1');
      localStorage.setItem('cl_template', 'Existing template');
      coverLetterReducer(
        createBlankState({
          template: 'Existing template',
          activeTemplateId: 'id-1',
        }),
        clearTemplate(),
      );
      const templates = [tpl1, tpl2];
      const action = fetchTemplates.fulfilled(templates, 'req');
      const state = coverLetterReducer(createBlankState(), action);
      expect(state.activeTemplateId).toBeNull();
      expect(state.template).toBe('');
    });
  });

  describe('setGeneratedLetter', () => {
    it('updates generated letter', () => {
      const state = coverLetterReducer(
        createBlankState(),
        setGeneratedLetter('Dear Sir...'),
      );
      expect(state.generatedLetter).toBe('Dear Sir...');
    });

    it('overwrites previous generated letter', () => {
      const state = coverLetterReducer(
        createBlankState({ generatedLetter: 'Old letter' }),
        setGeneratedLetter('New letter'),
      );
      expect(state.generatedLetter).toBe('New letter');
    });
  });

  describe('setApiKey', () => {
    it('updates API key', () => {
      const state = coverLetterReducer(
        createBlankState(),
        setApiKey('gsk-mykey'),
      );
      expect(state.apiKey).toBe('gsk-mykey');
    });

    it('clears API key with empty string', () => {
      const state = coverLetterReducer(
        createBlankState({ apiKey: 'gsk-old' }),
        setApiKey(''),
      );
      expect(state.apiKey).toBe('');
    });
  });

  describe('toggleTemplateExpanded', () => {
    it('toggles from true to false', () => {
      const state = coverLetterReducer(
        createBlankState({ isTemplateExpanded: true }),
        toggleTemplateExpanded(),
      );
      expect(state.isTemplateExpanded).toBe(false);
    });

    it('toggles from false to true', () => {
      const state = coverLetterReducer(
        createBlankState({ isTemplateExpanded: false }),
        toggleTemplateExpanded(),
      );
      expect(state.isTemplateExpanded).toBe(true);
    });
  });

  describe('toggleJobDescExpanded', () => {
    it('toggles job description expansion', () => {
      const state = coverLetterReducer(
        createBlankState({ isJobDescExpanded: true }),
        toggleJobDescExpanded(),
      );
      expect(state.isJobDescExpanded).toBe(false);
    });
  });

  describe('setAllCollapsed', () => {
    it('collapses both expandable sections', () => {
      const state = coverLetterReducer(
        createBlankState({ isTemplateExpanded: true, isJobDescExpanded: true }),
        setAllCollapsed(),
      );
      expect(state.isTemplateExpanded).toBe(false);
      expect(state.isJobDescExpanded).toBe(false);
    });
  });

  describe('setIsGenerating', () => {
    it('sets generating to true', () => {
      const state = coverLetterReducer(
        createBlankState(),
        setIsGenerating(true),
      );
      expect(state.isGenerating).toBe(true);
    });

    it('sets generating to false', () => {
      const state = coverLetterReducer(
        createBlankState({ isGenerating: true }),
        setIsGenerating(false),
      );
      expect(state.isGenerating).toBe(false);
    });
  });

  describe('clearGeneratedLetter', () => {
    it('clears the generated letter', () => {
      const state = coverLetterReducer(
        createBlankState({ generatedLetter: 'Some text' }),
        clearGeneratedLetter(),
      );
      expect(state.generatedLetter).toBe('');
    });

    it('is idempotent when already empty', () => {
      const state = coverLetterReducer(
        createBlankState(),
        clearGeneratedLetter(),
      );
      expect(state.generatedLetter).toBe('');
    });
  });

  describe('setCustomization', () => {
    it('updates customization options', () => {
      const state = coverLetterReducer(
        createBlankState(),
        setCustomization({
          limitWords: true,
          wordCount: 500,
          limitCharacters: false,
          charCount: 0,
          minimalChanges: true,
          sameLanguage: true,
        }),
      );
      expect(state.customization.limitWords).toBe(true);
      expect(state.customization.wordCount).toBe(500);
      expect(state.customization.minimalChanges).toBe(true);
      expect(state.customization.sameLanguage).toBe(true);
    });

    it('updates character-limit options', () => {
      const state = coverLetterReducer(
        createBlankState(),
        setCustomization({
          limitWords: false,
          wordCount: 400,
          limitCharacters: true,
          charCount: 2000,
          minimalChanges: false,
          sameLanguage: false,
        }),
      );
      expect(state.customization.limitCharacters).toBe(true);
      expect(state.customization.charCount).toBe(2000);
    });

    it('persists to localStorage', () => {
      coverLetterReducer(
        createBlankState(),
        setCustomization({
          limitWords: true,
          wordCount: 300,
          limitCharacters: false,
          charCount: 0,
          minimalChanges: false,
          sameLanguage: true,
        }),
      );
      expect(localStorage.getItem('cl_limitWords')).toBe('true');
      expect(localStorage.getItem('cl_wordCount')).toBe('300');
      expect(localStorage.getItem('cl_minimalChanges')).toBe('false');
      expect(localStorage.getItem('cl_sameLanguage')).toBe('true');
    });

    it('persists character-limit options to localStorage', () => {
      coverLetterReducer(
        createBlankState(),
        setCustomization({
          limitWords: false,
          wordCount: 400,
          limitCharacters: true,
          charCount: 1500,
          minimalChanges: false,
          sameLanguage: false,
        }),
      );
      expect(localStorage.getItem('cl_limitCharacters')).toBe('true');
      expect(localStorage.getItem('cl_charCount')).toBe('1500');
    });

    it('resets customization to defaults', () => {
      const state = coverLetterReducer(
        createBlankState({
          customization: {
            limitWords: true,
            wordCount: 500,
            limitCharacters: true,
            charCount: 2000,
            minimalChanges: true,
            sameLanguage: true,
          },
        }),
        setCustomization({
          limitWords: false,
          wordCount: 400,
          limitCharacters: false,
          charCount: 0,
          minimalChanges: false,
          sameLanguage: false,
        }),
      );
      expect(state.customization).toEqual({
        limitWords: false,
        wordCount: 400,
        limitCharacters: false,
        charCount: 0,
        minimalChanges: false,
        sameLanguage: false,
      });
    });
  });

  describe('setSelectedModel', () => {
    it('updates the selected model', () => {
      const state = coverLetterReducer(
        createBlankState(),
        setSelectedModel('openai/gpt-oss-20b'),
      );
      expect(state.selectedModel).toBe('openai/gpt-oss-20b');
    });

    it('persists the choice to localStorage', () => {
      coverLetterReducer(
        createBlankState(),
        setSelectedModel('openai/gpt-oss-20b'),
      );
      expect(localStorage.getItem('cl_model')).toBe('openai/gpt-oss-20b');
    });
  });

  describe('incrementGenerationCount', () => {
    it('increments generation count from localStorage', () => {
      localStorage.setItem('cl_generation_count', '4');
      const state = coverLetterReducer(
        createBlankState(),
        incrementGenerationCount(),
      );
      expect(state.generationCount).toBe(5);
    });

    it('starts from 0 when localStorage is empty', () => {
      const state = coverLetterReducer(
        createBlankState(),
        incrementGenerationCount(),
      );
      expect(state.generationCount).toBe(1);
    });

    it('persists updated count to localStorage', () => {
      localStorage.setItem('cl_generation_count', '3');
      coverLetterReducer(createBlankState(), incrementGenerationCount());
      expect(localStorage.getItem('cl_generation_count')).toBe('4');
    });
  });

  describe('selectTemplate', () => {
    it('sets active template and populates editor content', () => {
      const state = coverLetterReducer(
        createBlankState({
          savedTemplates: [tpl1, tpl2],
          activeTemplateId: 'id-2',
        }),
        selectTemplate('id-1'),
      );
      expect(state.activeTemplateId).toBe('id-1');
      expect(state.template).toBe('Content 1');
      expect(state.isTemplateExpanded).toBe(true);
    });

    it('is a no-op when id does not exist in savedTemplates', () => {
      const state = coverLetterReducer(
        createBlankState({
          savedTemplates: [tpl1],
          activeTemplateId: 'id-1',
          template: 'Existing',
        }),
        selectTemplate('non-existent'),
      );
      expect(state.activeTemplateId).toBe('id-1');
      expect(state.template).toBe('Existing');
    });

    it('persists activeTemplateId to localStorage', () => {
      coverLetterReducer(
        createBlankState({ savedTemplates: [tpl1] }),
        selectTemplate('id-1'),
      );
      expect(localStorage.getItem('cl_active_template_id')).toBe('id-1');
    });

    it('expands the template editor', () => {
      const state = coverLetterReducer(
        createBlankState({
          savedTemplates: [tpl1],
          activeTemplateId: null,
          isTemplateExpanded: false,
        }),
        selectTemplate('id-1'),
      );
      expect(state.isTemplateExpanded).toBe(true);
    });
  });

  describe('fetchTemplates extraReducers', () => {
    it('sets isLoadingTemplates on pending', () => {
      const action = fetchTemplates.pending('req');
      const state = coverLetterReducer(createBlankState(), action);
      expect(state.isLoadingTemplates).toBe(true);
    });

    it('populates savedTemplates on fulfilled', () => {
      const templates = [tpl1, tpl2];
      const action = fetchTemplates.fulfilled(templates, 'req');
      const state = coverLetterReducer(createBlankState(), action);
      expect(state.savedTemplates).toEqual(templates);
      expect(state.isLoadingTemplates).toBe(false);
    });

    it('restores activeTemplateId from localStorage on fetch.fulfilled', () => {
      localStorage.setItem('cl_active_template_id', 'id-1');
      const templates = [tpl1, tpl2];
      const action = fetchTemplates.fulfilled(templates, 'req');
      const state = coverLetterReducer(createBlankState(), action);
      expect(state.activeTemplateId).toBe('id-1');
      expect(state.template).toBe('Content 1');
    });

    it('clears localStorage when saved id no longer exists in fetched list', () => {
      localStorage.setItem('cl_active_template_id', 'id-1');
      const templates = [tpl2];
      const action = fetchTemplates.fulfilled(templates, 'req');
      const state = coverLetterReducer(createBlankState(), action);
      expect(state.savedTemplates).toEqual(templates);
      expect(state.activeTemplateId).toBeNull();
      expect(localStorage.getItem('cl_active_template_id')).toBeNull();
    });

    it('does not restore from localStorage when no saved id exists', () => {
      const templates = [tpl1, tpl2];
      const action = fetchTemplates.fulfilled(templates, 'req');
      const state = coverLetterReducer(createBlankState(), action);
      expect(state.activeTemplateId).toBeNull();
    });

    it('clears isLoadingTemplates on rejected', () => {
      const action = fetchTemplates.rejected(new Error('fail'), 'req');
      const state = coverLetterReducer(
        createBlankState({ isLoadingTemplates: true }),
        action,
      );
      expect(state.isLoadingTemplates).toBe(false);
    });
  });

  describe('createTemplate extraReducers', () => {
    it('appends new template and sets it active on fulfilled', () => {
      const newTpl = makeTemplate('new-id', 'Template 1', 'Fresh content');
      const action = createTemplate.fulfilled(newTpl, 'req', {
        name: 'Template 1',
        content: 'Fresh content',
      });
      const state = coverLetterReducer(createBlankState(), action);
      expect(state.savedTemplates).toEqual([newTpl]);
      expect(state.activeTemplateId).toBe('new-id');
      expect(state.template).toBe('Fresh content');
      expect(state.isTemplateExpanded).toBe(true);
    });

    it('prepends to existing templates', () => {
      const newTpl = makeTemplate('new-id', 'Template 2', 'More content');
      const action = createTemplate.fulfilled(newTpl, 'req', {
        name: 'Template 2',
        content: 'More content',
      });
      const state = coverLetterReducer(
        createBlankState({ savedTemplates: [tpl1], activeTemplateId: 'id-1' }),
        action,
      );
      expect(state.savedTemplates).toHaveLength(2);
      expect(state.savedTemplates[0]).toEqual(newTpl);
      expect(state.activeTemplateId).toBe('new-id');
    });

    it('persists activeTemplateId to localStorage', () => {
      const newTpl = makeTemplate('new-id', 'Template 1', 'Fresh content');
      const action = createTemplate.fulfilled(newTpl, 'req', {
        name: 'Template 1',
        content: 'Fresh content',
      });
      coverLetterReducer(createBlankState(), action);
      expect(localStorage.getItem('cl_active_template_id')).toBe('new-id');
    });
  });

  describe('updateTemplate extraReducers', () => {
    it('replaces the matching template in savedTemplates', () => {
      const updated = makeTemplate('id-1', 'Renamed', 'Content 1');
      const action = updateTemplate.fulfilled(updated, 'req', {
        id: 'id-1',
        name: 'Renamed',
        content: 'Content 1',
      });
      const state = coverLetterReducer(
        createBlankState({
          savedTemplates: [tpl1, tpl2],
          activeTemplateId: 'id-2',
        }),
        action,
      );
      expect(state.savedTemplates[0]).toEqual(updated);
      expect(state.savedTemplates[1]).toEqual(tpl2);
    });

    it('does nothing when id not found in local state', () => {
      const updated = makeTemplate('ghost', 'Ghost', 'Ghost content');
      const action = updateTemplate.fulfilled(updated, 'req', {
        id: 'ghost',
        name: 'Ghost',
        content: 'Ghost content',
      });
      const state = coverLetterReducer(
        createBlankState({ savedTemplates: [tpl1] }),
        action,
      );
      expect(state.savedTemplates).toEqual([tpl1]);
    });
  });

  describe('deleteTemplate extraReducers', () => {
    it('removes template by id', () => {
      const action = deleteTemplate.fulfilled('id-1', 'req', 'id-1');
      const state = coverLetterReducer(
        createBlankState({
          savedTemplates: [tpl1, tpl2],
          activeTemplateId: 'id-2',
        }),
        action,
      );
      expect(state.savedTemplates).toEqual([tpl2]);
    });

    it('re-selects first remaining template when active is deleted', () => {
      const action = deleteTemplate.fulfilled('id-2', 'req', 'id-2');
      const state = coverLetterReducer(
        createBlankState({
          savedTemplates: [tpl1, tpl2, tpl3],
          activeTemplateId: 'id-2',
        }),
        action,
      );
      expect(state.activeTemplateId).toBe('id-1');
      expect(state.template).toBe('Content 1');
      expect(localStorage.getItem('cl_active_template_id')).toBe('id-1');
    });

    it('clears active and template when last template deleted', () => {
      const action = deleteTemplate.fulfilled('id-1', 'req', 'id-1');
      const state = coverLetterReducer(
        createBlankState({
          savedTemplates: [tpl1],
          activeTemplateId: 'id-1',
          template: 'Content 1',
        }),
        action,
      );
      expect(state.savedTemplates).toHaveLength(0);
      expect(state.activeTemplateId).toBeNull();
      expect(state.template).toBe('');
      expect(localStorage.getItem('cl_active_template_id')).toBeNull();
    });

    it('does not change active when non-active template removed', () => {
      const action = deleteTemplate.fulfilled('id-1', 'req', 'id-1');
      const state = coverLetterReducer(
        createBlankState({
          savedTemplates: [tpl1, tpl2],
          activeTemplateId: 'id-2',
        }),
        action,
      );
      expect(state.activeTemplateId).toBe('id-2');
      expect(localStorage.getItem('cl_active_template_id')).toBeNull();
    });

    it('does nothing when id not found in savedTemplates', () => {
      const action = deleteTemplate.fulfilled('ghost', 'req', 'ghost');
      const state = coverLetterReducer(
        createBlankState({ savedTemplates: [tpl1], activeTemplateId: 'id-1' }),
        action,
      );
      expect(state.savedTemplates).toHaveLength(1);
      expect(state.activeTemplateId).toBe('id-1');
    });
  });

  describe('initial state', () => {
    it('returns valid initial state shape', () => {
      const created = coverLetterReducer(undefined, { type: '@@INIT' });
      expect(created).toHaveProperty('template');
      expect(created).toHaveProperty('jobDescription');
      expect(created).toHaveProperty('generatedLetter');
      expect(created).toHaveProperty('apiKey');
      expect(created).toHaveProperty('selectedModel');
      expect(created).toHaveProperty('isTemplateExpanded');
      expect(created).toHaveProperty('isJobDescExpanded');
      expect(created).toHaveProperty('isGenerating');
      expect(created).toHaveProperty('isLoadingTemplates');
      expect(created).toHaveProperty('customization');
      expect(created).toHaveProperty('generationCount');
      expect(created).toHaveProperty('savedTemplates');
      expect(created).toHaveProperty('activeTemplateId');
      expect(Array.isArray(created.savedTemplates)).toBe(true);
    });

    it('savedTemplates starts empty', () => {
      const created = coverLetterReducer(undefined, { type: '@@INIT' });
      expect(created.savedTemplates).toEqual([]);
    });

    it('activeTemplateId starts null', () => {
      const created = coverLetterReducer(undefined, { type: '@@INIT' });
      expect(created.activeTemplateId).toBeNull();
    });

    it('selectedModel defaults to DEFAULT_MODEL when nothing is persisted', () => {
      const created = coverLetterReducer(undefined, { type: '@@INIT' });
      expect(created.selectedModel).toBe(DEFAULT_MODEL);
    });
  });

  describe('restoreSessionStorage', () => {
    beforeEach(() => {
      sessionStorage.clear();
    });

    it('restores jobDescription and generatedLetter from sessionStorage', () => {
      sessionStorage.setItem('cl_restore_jd', 'Restored JD');
      sessionStorage.setItem('cl_restore_gl', 'Restored letter');

      const result = restoreSessionStorage();

      expect(result.jobDescription).toBe('Restored JD');
      expect(result.generatedLetter).toBe('Restored letter');
    });

    it('clears restore keys from sessionStorage after reading', () => {
      sessionStorage.setItem('cl_restore_jd', 'Restored JD');
      sessionStorage.setItem('cl_restore_gl', 'Restored letter');

      restoreSessionStorage();

      expect(sessionStorage.getItem('cl_restore_jd')).toBeNull();
      expect(sessionStorage.getItem('cl_restore_gl')).toBeNull();
    });

    it('returns empty strings when no restore keys in sessionStorage', () => {
      const result = restoreSessionStorage();

      expect(result.jobDescription).toBe('');
      expect(result.generatedLetter).toBe('');
    });
  });
});
