import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { FaChevronDown } from 'react-icons/fa';

const faqItems = [
  {
    question: 'Do I need to login or signup?',
    answer:
      'You can initially use the app without logging in or signing up. Your first 5 cover letters use our built in API key for free. After that you can add your own free Groq API key. Go to console.groq.com and create a free account. Generate an API key and paste it into the app using the Add Custom API Key button. You can login or signup to use extra features like saving templates, cover letters and resumes.',
  },
  {
    question: 'Will I be charged with my credit card?',
    answer:
      'No. Career Covered is completely free. We never ask for your credit card or any payment details. If you use your own Groq API key from the Groq free tier then that is also free. There are currently no hidden fees or paid plans.',
  },
  {
    question: 'How many cover letters can I create for free?',
    answer:
      'You will get 5 free cover letters with no signup. After that you can add your own free Groq API key for unlimited use. Groq offers a generous free tier so you can keep generating cover letters at no cost.',
  },
  {
    question: 'What is a Groq API key and why do I need one?',
    answer:
      'A Groq API key is a free token that lets Career Covered generate cover letters using Groq AI. After your first 5 free uses you need your own key. Get one free at console.groq.com. Create an account and generate a key. Then paste it into the app.',
  },
  {
    question: 'Can I customize the tone and style of my cover letter?',
    answer:
      'Yes. Click the Customize button to choose a writing style. You can pick Minimal Balanced or Full. You can also set a word or character limit. Add your own custom instructions too. The AI follows your preferences while matching the job description.',
  },
  {
    question: 'How do I export my cover letter?',
    answer:
      'Click the Copy button to copy the text to your clipboard. Use the PDF or Word button to download your cover letter. You can edit the text in the built in editor before exporting.',
  },
  {
    question: 'What templates can I use?',
    answer:
      'You can paste your own cover letter template. Cover letter template is the common cover letter that you already wrote by The AI keeps your voice and style while adapting it to the job. Save multiple templates and switch between them easily. You can rename or delete templates anytime.',
  },
];

const FaqView = () => {
  const [openItems, setOpenItems] = useState(() =>
    faqItems.map((_, i) => i < 5),
  );

  const toggleItem = (index: number) => {
    setOpenItems((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  return (
    <>
      <Helmet>
        <title>FAQ | Career Covered — Free AI Cover Letter Generator</title>
        <meta
          name="description"
          content="Frequently asked questions about Career Covered's free AI cover letter generator. Learn about Groq API keys, data security, exports, templates, and more."
        />
        <link rel="canonical" href="https://careercovered.com/#/faq" />
        <meta
          property="og:title"
          content="FAQ | Career Covered — Free AI Cover Letter Generator"
        />
        <meta
          property="og:description"
          content="Frequently asked questions about Career Covered's free AI cover letter generator. Learn about Groq API keys, data security, exports, templates, and more."
        />
        <meta property="og:url" content="https://careercovered.com/#/faq" />
        <meta
          name="twitter:title"
          content="FAQ | Career Covered — Free AI Cover Letter Generator"
        />
        <meta
          name="twitter:description"
          content="Frequently asked questions about Career Covered's free AI cover letter generator. Learn about Groq API keys, data security, exports, templates, and more."
        />
      </Helmet>

      <div className="max-w-5xl mx-auto py-6 md:py-12 px-4 sm:px-6">
        <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 p-5 sm:p-8 md:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-4 text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-lg leading-relaxed max-w-xl mx-auto">
              Everything you need to know about Career Covered. Can't find what
              you're looking for?{' '}
              <Link
                to="/support"
                className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                Get in touch
              </Link>
              .
            </p>
          </div>

          <div
            className="divide-y divide-gray-100 dark:divide-gray-700/50"
            itemScope
            itemType="https://schema.org/FAQPage"
          >
            {faqItems.map((item, index) => {
              const isOpen = openItems[index];

              return (
                <div
                  key={index}
                  className="py-1"
                  itemScope
                  itemProp="mainEntity"
                  itemType="https://schema.org/Question"
                >
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full flex items-center justify-between gap-4 py-4 text-left group cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span
                      itemProp="name"
                      className="text-[15px] md:text-base font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 leading-snug"
                    >
                      {item.question}
                    </span>
                    <FaChevronDown
                      className={`shrink-0 text-gray-400 dark:text-gray-500 transition-all duration-500 ${
                        isOpen
                          ? 'rotate-180 text-blue-500 dark:text-blue-400'
                          : ''
                      }`}
                      size={14}
                    />
                  </button>

                  <div
                    className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${
                      isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                    itemScope
                    itemProp="acceptedAnswer"
                    itemType="https://schema.org/Answer"
                  >
                    <div className="overflow-hidden min-h-0">
                      <p
                        itemProp="text"
                        className="text-gray-600 dark:text-gray-300 leading-relaxed text-[15px] pb-4 pr-0 sm:pr-8"
                      >
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default FaqView;
