import React from 'react';
import { FaqAccordion } from './FaqAccordion';
import { MarkdownArticleBlock } from './MarkdownArticleBlock';
import { MarkdownPageManager } from '../services/markdownManager';
import { PageNotFound } from './PageNotFound';

export const AboutView: React.FC = () => {
  const pageData = MarkdownPageManager.getPageByPath('/about');

  if (!pageData) {
    return <PageNotFound path="/about" />;
  }

  const { frontmatter, faqs = [] } = pageData;

  return (
    <div className="py-4 max-w-4xl mx-auto space-y-6 text-gray-700 text-sm">
      {/* Hero Header from Front Matter */}
      <div className="bg-[#8D0E83] text-white p-6 rounded-2xl shadow-md">
        {frontmatter.badgeText && (
          <span className="inline-block text-[11px] font-bold tracking-wide bg-white/20 text-white px-2.5 py-0.5 rounded-md mb-2">
            {frontmatter.badgeText}
          </span>
        )}
        <h1 className="text-2xl md:text-3xl font-black m-0 mb-2">
          {frontmatter.displayTitle || frontmatter.title}
        </h1>
        {frontmatter.introParagraph && (
          <p className="text-xs md:text-sm text-purple-100 leading-relaxed">
            {frontmatter.introParagraph}
          </p>
        )}
      </div>

      {/* Editorial Content / Meat of the Article in One Block Section from about.md */}
      <MarkdownArticleBlock pageData={pageData} />

      {/* FAQs from about.md */}
      {faqs.length > 0 && (
        <FaqAccordion
          faqs={faqs}
          title={frontmatter.faqTitle || pageData.faqTitle || "About Soka Predictions - Frequently Asked Questions"}
          subtitle={frontmatter.faqSubtitle || pageData.faqSubtitle}
        />
      )}
    </div>
  );
};
