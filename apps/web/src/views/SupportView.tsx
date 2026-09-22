import { FaLinkedin, FaGoogle } from 'react-icons/fa';

const SupportView = () => {
  const linkedinUrl =
    import.meta.env.VITE_LINKEDIN_URL ||
    'https://www.linkedin.com/in/raiyadraad';
  const formUrl =
    import.meta.env.VITE_SUPPORT_FORM_URL ||
    'https://forms.gle/jC1UexnKXfP7yHVy9';

  return (
    <div className="max-w-3xl mx-auto py-6 md:py-12 px-4 sm:px-6">
      <div className="bg-white dark:bg-neutral-900 shadow-sm border border-neutral-200 dark:border-neutral-700 p-5 sm:p-8 md:p-12 text-center space-y-8 sm:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="space-y-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">
            I'm always here to help you!
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm sm:text-lg leading-relaxed max-w-xl mx-auto">
            If you experience any issues with the application, you can always
            contact me on my LinkedIn.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 pr-4 sm:pr-8 bg-brand-50 dark:bg-brand-950 hover:bg-brand-600 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-brand-500/20"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-600 group-hover:bg-white rounded-full flex items-center justify-center text-white group-hover:text-brand-600 transition-colors shadow-lg shrink-0">
              <FaLinkedin size={20} className="sm:w-6 sm:h-6" />
            </div>
            <span className="font-bold text-brand-900 dark:text-brand-200 group-hover:text-white text-sm sm:text-lg">
              Connect on LinkedIn
            </span>
          </a>
        </div>

        <div className="relative">
          <div
            className="absolute inset-0 flex items-center"
            aria-hidden="true"
          >
            <div className="w-full border-t border-neutral-200 dark:border-neutral-700"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white dark:bg-neutral-900 px-4 text-sm text-neutral-400 dark:text-neutral-500 font-medium italic">
              or help me improve
            </span>
          </div>
        </div>

        <div className="space-y-8">
          <p className="text-neutral-600 dark:text-neutral-300 font-medium">
            You can also suggest new features and report bugs anonymously.
          </p>

          <a
            href={formUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex flex-col items-center gap-2 sm:gap-3 p-4 sm:p-6 hover:bg-brand-50 dark:hover:bg-brand-950 transition-all duration-300"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white dark:bg-neutral-900 border-2 border-brand-200 dark:border-brand-800 group-hover:border-brand-500 text-brand-600 dark:text-brand-400 rounded-full flex items-center justify-center transition-all duration-300 group-hover:rotate-12 shadow-sm group-hover:shadow-md">
              <FaGoogle size={24} className="sm:w-7 sm:h-7" />
            </div>
            <span className="text-[11px] sm:text-sm font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              Feedback Form
            </span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default SupportView;
