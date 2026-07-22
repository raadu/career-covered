import { describe, it, expect, beforeEach } from 'vitest';
import coverLetterReducer, {
  restoreSessionStorage,
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
  type SavedTemplate,
  type CoverLetterState,
} from 'store/coverLetterSlice';

const createBlankState = (overrides?: Partial<CoverLetterState>): CoverLetterState => ({
  template: '',
  jobDescription: '',
  generatedLetter: '',
  apiKey: '',
  model: 'llama-3.3-70b-versatile',
  isTemplateExpanded: true,
  isJobDescExpanded: true,
  isGenerating: false,
  customization: {
    limitWords: false,
    wordCount: 400,
    minimalChanges: false,
    sameLanguage: false,
  },
  generationCount: 0,
  savedTemplates: [],
  activeTemplateId: null,
  ...overrides,
});

const makeTemplate = (id: string, name: string, content: string): SavedTemplate => ({
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
      const state = coverLetterReducer(createBlankState(), setTemplate('Hello World'));
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
      const state = coverLetterReducer(createBlankState(), setJobDescription('Engineer role'));
      expect(state.jobDescription).toBe('Engineer role');
    });
  });

  describe('setGeneratedLetter', () => {
    it('updates generated letter', () => {
      const state = coverLetterReducer(createBlankState(), setGeneratedLetter('Dear Sir...'));
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
      const state = coverLetterReducer(createBlankState(), setApiKey('gsk-mykey'));
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

  describe('setModel', () => {
    it('updates model', () => {
      const state = coverLetterReducer(createBlankState(), setModel('mixtral-8x7b'));
      expect(state.model).toBe('mixtral-8x7b');
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
      const state = coverLetterReducer(createBlankState(), setIsGenerating(true));
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
      const state = coverLetterReducer(createBlankState(), clearGeneratedLetter());
      expect(state.generatedLetter).toBe('');
    });
  });

  describe('setCustomization', () => {
    it('updates customization options', () => {
      const state = coverLetterReducer(
        createBlankState(),
        setCustomization({ limitWords: true, wordCount: 500, minimalChanges: true, sameLanguage: true }),
      );
      expect(state.customization.limitWords).toBe(true);
      expect(state.customization.wordCount).toBe(500);
      expect(state.customization.minimalChanges).toBe(true);
      expect(state.customization.sameLanguage).toBe(true);
    });

    it('persists to localStorage', () => {
      coverLetterReducer(
        createBlankState(),
        setCustomization({ limitWords: true, wordCount: 300, minimalChanges: false, sameLanguage: true }),
      );
      expect(localStorage.getItem('cl_limitWords')).toBe('true');
      expect(localStorage.getItem('cl_wordCount')).toBe('300');
      expect(localStorage.getItem('cl_minimalChanges')).toBe('false');
      expect(localStorage.getItem('cl_sameLanguage')).toBe('true');
    });

    it('resets customization to defaults', () => {
      const state = coverLetterReducer(
        createBlankState({ customization: { limitWords: true, wordCount: 500, minimalChanges: true, sameLanguage: true } }),
        setCustomization({ limitWords: false, wordCount: 400, minimalChanges: false, sameLanguage: false }),
      );
      expect(state.customization).toEqual({
        limitWords: false,
        wordCount: 400,
        minimalChanges: false,
        sameLanguage: false,
      });
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

  describe('addTemplate', () => {
    it('adds a template from current template content', () => {
      const state = coverLetterReducer(
        createBlankState({ template: 'My cover letter content' }),
        addTemplate(),
      );
      expect(state.savedTemplates).toHaveLength(1);
      expect(state.savedTemplates[0].content).toBe('My cover letter content');
      expect(state.savedTemplates[0].name).toBe('Template 1');
      expect(state.activeTemplateId).toBe(state.savedTemplates[0].id);
    });

    it('does nothing when template content is empty', () => {
      const state = coverLetterReducer(
        createBlankState({ template: '   ' }),
        addTemplate(),
      );
      expect(state.savedTemplates).toHaveLength(0);
      expect(state.activeTemplateId).toBeNull();
    });

    it('does nothing when template content is empty string', () => {
      const state = coverLetterReducer(
        createBlankState({ template: '' }),
        addTemplate(),
      );
      expect(state.savedTemplates).toHaveLength(0);
    });

    it('assigns sequential template names', () => {
      const afterFirst = coverLetterReducer(
        createBlankState({ template: 'First' }),
        addTemplate(),
      );
      expect(afterFirst.savedTemplates[0].name).toBe('Template 1');

      const afterSecond = coverLetterReducer(
        { ...afterFirst, template: 'Second' },
        addTemplate(),
      );
      expect(afterSecond.savedTemplates).toHaveLength(2);
      expect(afterSecond.savedTemplates[1].name).toBe('Template 2');
    });

    it('FIFO replaces oldest when at 3 templates', () => {
      const threeTemplates: SavedTemplate[] = [tpl1, tpl2, tpl3];
      const state = coverLetterReducer(
        createBlankState({ template: 'Fourth content', savedTemplates: threeTemplates, activeTemplateId: 'id-3' }),
        addTemplate(),
      );

      expect(state.savedTemplates).toHaveLength(3);
      expect(state.savedTemplates.find((t) => t.id === 'id-1')).toBeUndefined();
      expect(state.savedTemplates[2].content).toBe('Fourth content');
      expect(state.activeTemplateId).toBe(state.savedTemplates[2].id);
    });

    it('persists activeTemplateId to localStorage', () => {
      coverLetterReducer(createBlankState({ template: 'New' }), addTemplate());
      const stored = localStorage.getItem('cl_active_template_id');
      expect(stored).toBeTruthy();
    });
  });

  describe('removeTemplate', () => {
    it('removes a template by id', () => {
      const state = coverLetterReducer(
        createBlankState({ savedTemplates: [tpl1, tpl2], activeTemplateId: 'id-1' }),
        removeTemplate('id-1'),
      );
      expect(state.savedTemplates).toHaveLength(1);
      expect(state.savedTemplates[0].id).toBe('id-2');
    });

    it('re-selects first remaining template when active is removed', () => {
      const state = coverLetterReducer(
        createBlankState({ savedTemplates: [tpl1, tpl2, tpl3], activeTemplateId: 'id-2' }),
        removeTemplate('id-2'),
      );
      expect(state.activeTemplateId).toBe('id-1');
      expect(state.template).toBe('Content 1');
    });

    it('clears active and template when last template removed', () => {
      const state = coverLetterReducer(
        createBlankState({ savedTemplates: [tpl1], activeTemplateId: 'id-1', template: 'Content 1' }),
        removeTemplate('id-1'),
      );
      expect(state.savedTemplates).toHaveLength(0);
      expect(state.activeTemplateId).toBeNull();
      expect(state.template).toBe('');
    });

    it('does not change active when non-active template removed', () => {
      const state = coverLetterReducer(
        createBlankState({ savedTemplates: [tpl1, tpl2], activeTemplateId: 'id-2' }),
        removeTemplate('id-1'),
      );
      expect(state.activeTemplateId).toBe('id-2');
      expect(state.template).toBe('');
    });

    it('is a no-op when id does not exist', () => {
      const state = coverLetterReducer(
        createBlankState({ savedTemplates: [tpl1], activeTemplateId: 'id-1' }),
        removeTemplate('non-existent'),
      );
      expect(state.savedTemplates).toHaveLength(1);
      expect(state.activeTemplateId).toBe('id-1');
    });

    it('removes localStorage key when no templates remain', () => {
      localStorage.setItem('cl_active_template_id', 'id-1');
      coverLetterReducer(
        createBlankState({ savedTemplates: [tpl1], activeTemplateId: 'id-1' }),
        removeTemplate('id-1'),
      );
      expect(localStorage.getItem('cl_active_template_id')).toBeNull();
    });
  });

  describe('renameTemplate', () => {
    it('renames an existing template', () => {
      const state = coverLetterReducer(
        createBlankState({ savedTemplates: [tpl1, tpl2] }),
        renameTemplate({ id: 'id-1', name: 'Renamed' }),
      );
      const renamed = state.savedTemplates.find((t) => t.id === 'id-1');
      expect(renamed?.name).toBe('Renamed');
    });

    it('does not affect other templates', () => {
      const state = coverLetterReducer(
        createBlankState({ savedTemplates: [tpl1, tpl2] }),
        renameTemplate({ id: 'id-1', name: 'Renamed' }),
      );
      const unchanged = state.savedTemplates.find((t) => t.id === 'id-2');
      expect(unchanged?.name).toBe('Template 2');
    });

    it('is a no-op when id does not exist', () => {
      const state = coverLetterReducer(
        createBlankState({ savedTemplates: [tpl1] }),
        renameTemplate({ id: 'ghost', name: 'Ghost' }),
      );
      expect(state.savedTemplates[0].name).toBe('Template 1');
    });
  });

  describe('selectTemplate', () => {
    it('sets active template and populates editor content', () => {
      const state = coverLetterReducer(
        createBlankState({ savedTemplates: [tpl1, tpl2], activeTemplateId: 'id-2' }),
        selectTemplate('id-1'),
      );
      expect(state.activeTemplateId).toBe('id-1');
      expect(state.template).toBe('Content 1');
      expect(state.isTemplateExpanded).toBe(true);
    });

    it('is a no-op when id does not exist in savedTemplates', () => {
      const state = coverLetterReducer(
        createBlankState({ savedTemplates: [tpl1], activeTemplateId: 'id-1', template: 'Existing' }),
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
        createBlankState({ savedTemplates: [tpl1], activeTemplateId: null, isTemplateExpanded: false }),
        selectTemplate('id-1'),
      );
      expect(state.isTemplateExpanded).toBe(true);
    });
  });

  describe('initial state', () => {
    it('returns valid initial state shape', () => {
      const created = coverLetterReducer(undefined, { type: '@@INIT' });
      expect(created).toHaveProperty('template');
      expect(created).toHaveProperty('jobDescription');
      expect(created).toHaveProperty('generatedLetter');
      expect(created).toHaveProperty('apiKey');
      expect(created).toHaveProperty('model');
      expect(created).toHaveProperty('isTemplateExpanded');
      expect(created).toHaveProperty('isJobDescExpanded');
      expect(created).toHaveProperty('isGenerating');
      expect(created).toHaveProperty('customization');
      expect(created).toHaveProperty('generationCount');
      expect(created).toHaveProperty('savedTemplates');
      expect(created).toHaveProperty('activeTemplateId');
      expect(Array.isArray(created.savedTemplates)).toBe(true);
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
