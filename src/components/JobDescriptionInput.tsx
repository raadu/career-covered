import { useDispatch, useSelector } from 'react-redux';
import { type RootState } from '../store/store';
import { setJobDescription, toggleJobDescExpanded } from '../store/coverLetterSlice';
import CollapsibleTextArea from './common/CollapsibleTextArea';

const JobDescriptionInput = () => {
    const dispatch = useDispatch();
    const { jobDescription, isJobDescExpanded } = useSelector((state: RootState) => state.coverLetter);

    return (
        <CollapsibleTextArea
            label="Job Description"
            value={jobDescription}
            onChange={(val) => dispatch(setJobDescription(val))}
            isExpanded={isJobDescExpanded}
            onToggleExpand={() => dispatch(toggleJobDescExpanded())}
            placeholder="Paste the job requirements here. We'll extract keywords and match them to your skills."
            required
        />
    );
};

export default JobDescriptionInput;
