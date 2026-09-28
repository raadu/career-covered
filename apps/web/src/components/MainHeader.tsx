const MainHeader = () => {
  return (
    // Phones: pt-0.5 leaves 2px above the headline, which -mt-2 would
    // otherwise pull flush against the top bar.
    <header className="-mt-2 pt-0.5 md:pt-0 md:-mt-4 lg:-mt-6 mb-4 md:mb-6 px-1">
      <h1 className="text-xl md:text-2xl font-black text-neutral-800 dark:text-neutral-100 tracking-tight leading-tight">
        Create Free Cover Letters in 2 Seconds
      </h1>
      <p className="text-neutral-500 dark:text-neutral-400 text-xs md:text-sm mt-1">
        Paste your cover letter template and resume to personalize it more.
      </p>
    </header>
  );
};

export default MainHeader;
