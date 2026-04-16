const Content = () => {
  return (
    <div className="p-5 text-sm text-gray-600 space-y-4">
      <p>
        <strong>This application does not store any of your data.</strong>
      </p>
      <p>
        There are no backend services or databases connected to this application. All data, including your job descriptions, templates, and generated cover letters, are stored temporarily in your local browser's memory.
      </p>
      <p>
        Any settings you configure are saved exclusively in your browser's local storage and are sent directly where needed. We cannot access them.
      </p>
      <p className="text-xs text-gray-500 italic mt-4">
        You maintain full control over your data.
      </p>
    </div>
  );
};

export default Content;
