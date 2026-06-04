import { FaLinkedin, FaGoogle } from 'react-icons/fa';

const SupportView = () => {
  const linkedinUrl = import.meta.env.VITE_LINKEDIN_URL || 'https://www.linkedin.com/in/raiyadraad';
  const formUrl = import.meta.env.VITE_SUPPORT_FORM_URL || 'https://forms.gle/jC1UexnKXfP7yHVy9';

  return (
    <div className="max-w-3xl mx-auto py-6 md:py-12 px-4 sm:px-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 sm:p-8 md:p-12 text-center space-y-8 sm:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="space-y-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
            I'm always here to help you!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-lg leading-relaxed max-w-xl mx-auto">
            If you experience any issues with the application, you can always contact me on my LinkedIn.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 pr-4 sm:pr-8 bg-blue-50 hover:bg-blue-600 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 group-hover:bg-white rounded-full flex items-center justify-center text-white group-hover:text-blue-600 transition-colors shadow-lg">
              <FaLinkedin size={20} className="sm:w-6 sm:h-6" />
            </div>
            <span className="font-bold text-blue-900 group-hover:text-white text-sm sm:text-lg">Connect on LinkedIn</span>
          </a>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-100 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white dark:bg-gray-800 px-4 text-sm text-gray-300 dark:text-gray-500 font-medium italic">or help me improve</span>
          </div>
        </div>

        <div className="space-y-8">
          <p className="text-gray-600 dark:text-gray-300 font-medium">
            You can also suggest new features and report bugs anonymously.
          </p>
          
          <a
            href={formUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex flex-col items-center gap-2 sm:gap-3 p-4 sm:p-6 rounded-2xl sm:rounded-3xl hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-300"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white border-2 border-orange-100 group-hover:border-orange-500 text-orange-500 rounded-full flex items-center justify-center transition-all duration-300 group-hover:rotate-12 shadow-sm group-hover:shadow-md">
              <FaGoogle size={24} className="sm:w-7 sm:h-7" />
            </div>
            <span className="text-[11px] sm:text-sm font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">Feedback Form</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default SupportView;
