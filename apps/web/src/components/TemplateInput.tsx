import { useDispatch, useSelector } from 'react-redux';
import { type RootState } from 'store';
import {
  setTemplate,
  toggleTemplateExpanded,
  addTemplate,
  selectTemplate,
  removeTemplate,
  renameTemplate,
} from 'store/coverLetterSlice';
import CollapsibleTextArea from 'components/common/CollapsibleTextArea';
import TemplateSelector from 'components/TemplateSelector';

const TemplateInput = () => {
  const dispatch = useDispatch();
  const {
    template,
    isTemplateExpanded,
    savedTemplates,
    activeTemplateId,
  } = useSelector((state: RootState) => state.coverLetter);

  return (
    <div className="space-y-1">
      <TemplateSelector
        templates={savedTemplates}
        activeId={activeTemplateId}
        onSelect={(id) => dispatch(selectTemplate(id))}
        onRename={(id, name) => dispatch(renameTemplate({ id, name }))}
        onRemove={(id) => dispatch(removeTemplate(id))}
      />
      <CollapsibleTextArea
        label="Your Cover Letter Template"
        value={template}
        onChange={(val) => dispatch(setTemplate(val))}
        isExpanded={isTemplateExpanded}
        onToggleExpand={() => dispatch(toggleTemplateExpanded())}
        onClear={() => dispatch(setTemplate(''))}
        onAddTemplate={() => dispatch(addTemplate())}
        placeholder="Paste your existing cover letter here. We'll largely keep your tone and structure but adapt it to the job."
      />
    </div>
  );
};

export default TemplateInput;
