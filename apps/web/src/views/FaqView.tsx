import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { FaChevronDown } from 'react-icons/fa';

const faqItems = [
  {
    question: 'How do I log in or sign up using Groq?',
    answer:
      'Career Covered does not require any traditional login, signup, or account creation. You can start generating AI-powered cover letters immediately, completely free. For your first 5 cover letters, we provide a built-in Groq API key at no cost. After that, you can add your own free Groq API key to continue generating unlimited cover letters. To get a free key, visit console.groq.com, create an account, generate an API key, and paste it into the app using the "Add Custom API Key" button in the generator controls. The entire process takes under 2 minutes and requires no payment information.',
  },
  {
    question: 'Will I be charged with my credit card?',
    answer:
      'No, absolutely not. Career Covered is 100% free to use with no hidden fees, subscriptions, or paid plans. We never ask for your credit card information or any payment details. If you choose to use your own Groq API key for unlimited generations, Groq provides a generous free tier that also does not require any payment information. There are no trials, no upsells, and no premium features to unlock — everything is completely free forever.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Yes, your data security and privacy are important to us. Your job descriptions and cover letters are sent directly from your browser to Groq\'s API for AI processing — they are never stored on our servers. We do not collect, sell, or share any personal information. All data transmitted between your browser and the API is encrypted using HTTPS. We also use DOMpurify to sanitize all content and protect against XSS attacks. Your templates and preferences are stored locally in your browser only.',
  },
  {
    question: 'How many cover letters can I create for free?',
    answer:
      'You get 5 free cover letters immediately using our built-in API key — no account, signup, or payment needed. After those 5 generations, you can add your own free Groq API key to continue creating unlimited cover letters. Since Groq offers a completely free tier with generous rate limits, you can generate as many cover letters as you need without ever paying a cent. The free tier includes access to powerful AI models like Llama 3 and Mixtral.',
  },
  {
    question: 'What is a Groq API key and why do I need one?',
    answer:
      'A Groq API key is a free access token that enables Career Covered to generate AI-powered cover letters using Groq\'s ultra-fast inference engine. After your first 5 free generations using our shared key, you will need your own key to continue. Getting one is completely free: go to console.groq.com, create a free account, navigate to the API Keys section, and click "Create API Key". Copy the key and paste it into Career Covered. Your key gives you access to cutting-edge language models with blazing-fast response times.',
  },
  {
    question: 'Can I customize the tone and style of my cover letter?',
    answer:
      'Yes, you have full control over the tone, style, and structure of your cover letter. Click the "Customize" button to adjust the writing style — choose from professional, casual, enthusiastic, formal, or persuasive tones. You can also set the desired length, include specific keywords from the job description, and control how closely the letter follows your template. The AI respects your customization preferences while tailoring the content to match the job description you provide.',
  },
  {
    question: 'How do I export my cover letter?',
    answer:
      'Exporting your cover letter is simple. Once generated, you can click the "Copy" button to copy the full text to your clipboard instantly. Use the "Download" button to save your cover letter as a Word document (.docx) or as a PDF file. You can also edit the generated text directly in the built-in editor before exporting, allowing you to make final tweaks and personalize the letter further before saving or sharing it with employers.',
  },
  {
    question: 'What templates can I use?',
    answer:
      'Career Covered offers a variety of professional cover letter templates to choose from, including General, Software Engineer, Design, Marketing, Business, and more. You can also paste your own custom cover letter template — the AI will follow your template\'s structure, format, and style while intelligently tailoring the content to match the job description. This flexibility ensures your cover letter always matches your personal brand and industry standards.',
  },
];

const FaqView = () => {
  const [openItems, setOpenItems] = useState(() => faqItems.map((_, i) => i < 5));

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
        <meta property="og:title" content="FAQ | Career Covered — Free AI Cover Letter Generator" />
        <meta
          property="og:description"
          content="Frequently asked questions about Career Covered's free AI cover letter generator. Learn about Groq API keys, data security, exports, templates, and more."
        />
        <meta property="og:url" content="https://careercovered.com/#/faq" />
        <meta name="twitter:title" content="FAQ | Career Covered — Free AI Cover Letter Generator" />
        <meta
          name="twitter:description"
          content="Frequently asked questions about Career Covered's free AI cover letter generator. Learn about Groq API keys, data security, exports, templates, and more."
        />
      </Helmet>

      <div className="max-w-3xl mx-auto py-6 md:py-12 px-4 sm:px-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 sm:p-8 md:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-4 text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-lg leading-relaxed max-w-xl mx-auto">
              Everything you need to know about Career Covered. Can't find what you're looking for?{' '}
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
                        isOpen ? 'rotate-180 text-blue-500 dark:text-blue-400' : ''
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
