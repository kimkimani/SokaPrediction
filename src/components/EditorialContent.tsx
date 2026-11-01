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
          <h2 className="text-xl md:text-2xl font-black text-gray-900 border-b pb-3 border-gray-100">
            Stop Guessing. Start Winning. Soka Predictions is your #1 Source for tips and Predictions
          </h2>

          <p>
            SOKAPREDICTIONS is very sure you are tired of predictions that fail you. Tips that exhaust you and losing bets disguised as SURE BETs and SURE WINs. Let your quest for consistent yet reliable, and accurately analysed football tips end right here, right now. We are Soka Predictions and winning is our business. At SOKAPREDICTIONS, we don&apos;t just offer you tips; we deliver a winning strategy.
          </p>

          <p>
            The world is changing, and that&apos;s not stopping. That&apos;s why we are using advanced sports statistical modeling and deep football domain expertise to give a fresh breath to football Predictions. Our mission is simple: to let you maximize your returns and minimize your risks with only sure bet soka predictions and tips.
          </p>


          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
            <strong>Disclaimer:</strong> Predictions involve financial risk. Please be responsible. SOKAPREDICTIONS is an analytical sports tipping service and does not guarantee winnings. Users must be 18+. Practice disciplined bankroll management at all times.
          </div>
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
