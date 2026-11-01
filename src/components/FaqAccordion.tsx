import React, { useState, useMemo } from 'react';

export interface FaqItem {
  question: string;
  answer: string;
  answerHtml?: string;
}

interface FaqAccordionProps {
  faqs: FaqItem[];
  title?: string;
  subtitle?: string;
  defaultOpenIndex?: number;
}

export const FaqAccordion: React.FC<FaqAccordionProps> = ({
  faqs,
  title = 'Frequently Asked Questions (FAQ)',
  subtitle,
  defaultOpenIndex = 0,
}) => {
  const [openIndices, setOpenIndices] = useState<number[]>(() => {
    return defaultOpenIndex >= 0 && defaultOpenIndex < faqs.length ? [defaultOpenIndex] : [];
  });

  const toggleIndex = (index: number) => {
    setOpenIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="faq-section bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 md:p-8 shadow-xs my-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 mb-5 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-[#8D0E83] flex items-center justify-center text-sm font-bold">
              <i className="fas fa-question"></i>
            </div>
            <h2 className="text-base sm:text-lg md:text-xl font-black text-gray-900 m-0">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="text-xs text-gray-500 m-0 leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Accordion Items List */}
      <div className="space-y-3">
        {faqs.map((faq, index) => {
            const isOpen = openIndices.includes(index);
            return (
              <div
                key={faq.question || index}
                className={`border rounded-xl transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'border-purple-200 bg-purple-50/20 shadow-2xs'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleIndex(index)}
                  className="w-full px-4 py-3.5 text-left flex items-center justify-between gap-3 cursor-pointer group"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-[#8D0E83] transition">
                    {faq.question}
                  </span>
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center text-xs flex-shrink-0 transition-transform duration-200 ${
                      isOpen
                        ? 'bg-[#8D0E83] text-white rotate-180'
                        : 'bg-gray-100 text-gray-500 group-hover:bg-purple-100 group-hover:text-[#8D0E83]'
                    }`}
                  >
                    <i className="fas fa-chevron-down text-[10px]"></i>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 border-t border-purple-100/60 text-xs text-gray-700 leading-relaxed">
                    {faq.answerHtml ? (
                      <div
                        className="prose max-w-none text-xs text-gray-700 leading-relaxed space-y-1.5 [&>p]:leading-relaxed [&>ul]:list-disc [&>ul]:pl-5"
                        dangerouslySetInnerHTML={{ __html: faq.answerHtml }}
                      />
                    ) : (
                      <p className="m-0 text-xs text-gray-700 leading-relaxed font-normal">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
    </section>
  );
};
