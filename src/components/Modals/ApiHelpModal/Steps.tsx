interface StepsProps {
  providerName: string;
}

const Steps = ({ providerName }: StepsProps) => {
  return (
    <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
      <h4 className="font-semibold text-blue-900 mb-2">Steps to secure your key:</h4>
      <ol className="list-decimal list-inside space-y-2 text-blue-800/80">
        <li>Visit the {providerName} developer console.</li>
        <li>Create a free account or sign in.</li>
        <li>Navigate to the API Keys section.</li>
        <li>Generate a new secret key and copy it.</li>
        <li>Paste the key into the input field here.</li>
      </ol>
    </div>
  );
};

export default Steps;
