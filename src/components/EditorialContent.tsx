import React from 'react';
import { FaqAccordion } from './FaqAccordion';
import { MarkdownPageManager } from '../services/markdownManager';

export const EditorialContent: React.FC = () => {
  const homePage = MarkdownPageManager.getPageByPath('/');
  const faqs = homePage?.faqs || [];
  return (
    <div className="space-y-6 mb-10">
      <section className="bg-white border border-gray-200/90 rounded-2xl p-6 md:p-8 shadow-xs">
        <div className="max-w-4xl mx-auto space-y-6 text-gray-700 leading-relaxed text-sm">

        </div>
      </section>

      {/* Interactive FAQ Section on Home Page from home.md */}
      {faqs.length > 0 && (
        <FaqAccordion
          faqs={faqs}
          title={homePage?.frontmatter.faqTitle || "Soka Predictions - Frequently Asked Questions"}
          subtitle="Common questions about our statistical prediction models, kickoff schedules, VIP membership, and M-Pesa automated dispatch."
        />
      )}
    </div>
  );
};
