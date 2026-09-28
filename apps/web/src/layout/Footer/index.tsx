const Footer = () => {
  return (
    // Desktop (lg+): 40px, the same as the sidebar's collapse/expand button
    // beside it, so the two bottom bars line up. Smaller screens have no such
    // button and keep 48px.
    <footer className="h-12 lg:h-10 w-full text-[10px] sm:text-xs text-neutral-400 dark:text-neutral-500 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end px-4 sm:px-6 bg-white dark:bg-neutral-900 shrink-0 mt-auto">
      <div>
        Made with <span className="text-danger">❤️</span> by{' '}
        <a
          href="https://raadu.github.io"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-neutral-500 dark:text-neutral-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        >
          Raiyad
        </a>
        .
      </div>
    </footer>
  );
};

export default Footer;
