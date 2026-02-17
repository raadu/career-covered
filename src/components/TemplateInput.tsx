import { useDispatch, useSelector } from 'react-redux';
import { type RootState } from '../store/store';
import { setTemplate, toggleTemplateExpanded } from '../store/coverLetterSlice';
import CollapsibleTextArea from './common/CollapsibleTextArea';

const TemplateInput = () => {
    const dispatch = useDispatch();
    const { template, isTemplateExpanded } = useSelector((state: RootState) => state.coverLetter);

    return (
        <CollapsibleTextArea
            label="Your Cover Letter Template"
            value={template}
            onChange={(val) => dispatch(setTemplate(val))}
            isExpanded={isTemplateExpanded}
            onToggleExpand={() => dispatch(toggleTemplateExpanded())}
            onClear={() => dispatch(setTemplate(''))}
            placeholder="Paste your existing cover letter here. We'll largely keep your tone and structure but adapt it to the job."
        />
    );
};

export default TemplateInput;
