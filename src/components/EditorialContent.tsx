import React from 'react';
import { FaqAccordion } from './FaqAccordion';
import { MarkdownArticleBlock } from './MarkdownArticleBlock';
import { MarkdownPageManager } from '../services/markdownManager';

export const EditorialContent: React.FC = () => {
  const homePage = MarkdownPageManager.getPageByPath('/');
  const faqs = homePage?.faqs || [];

  return (
    <div className="space-y-6 mb-10">
      {/* Dynamic Editorial Content in One Block Section with H2 to H3 hierarchy */}
      <MarkdownArticleBlock pageData={homePage} />

      {/* Interactive FAQ Section loaded directly from home.md */}
      {faqs.length > 0 && (
        <FaqAccordion
          faqs={faqs}
          title={homePage?.frontmatter.faqTitle || homePage?.faqTitle || "Soka Predictions - Frequently Asked Questions"}
          subtitle={homePage?.frontmatter.faqSubtitle || homePage?.faqSubtitle}
        />
      )}
    </div>
  );
};
