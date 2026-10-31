import React from 'react';
import { FaqAccordion } from './FaqAccordion';
import { MarkdownPageManager } from '../services/markdownManager';

export const AboutView: React.FC = () => {
  const pageData = MarkdownPageManager.getPageByPath('/about');
  const faqs = pageData?.faqs || [];

  return (
    <div className="py-4 max-w-4xl mx-auto space-y-6 text-gray-700 text-sm">
      <div className="bg-[#8D0E83] text-white p-6 rounded-2xl shadow-md">
        <h1 className="text-2xl md:text-3xl font-black m-0 mb-2">
          About SOKA PREDICTIONS
        </h1>
        <p className="text-xs md:text-sm text-purple-100 leading-relaxed">
          The premier data-driven football prediction intelligence platform in Kenya &amp; East Africa.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900">
          Our Computational Prediction Methodology
        </h2>
        <p>
          Unlike amateur tipping blogs that rely on hunch or gut feeling, <strong>SOKA PREDICTIONS</strong> integrates directly with the <strong>Sokaking sports analytics engine</strong>. Our models ingest extensive historical and live match telemetry across more than 40 international leagues.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-100">
            <i className="fas fa-chart-pie text-[#8D0E83] text-xl mb-2 block"></i>
            <h3 className="font-bold text-gray-900 text-sm mb-1">Poisson Distribution</h3>
            <p className="text-xs text-gray-600">
              Evaluates home offensive potency vs away defensive vulnerability to calculate precise goal probabilities.
            </p>
          </div>

          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <i className="fas fa-balance-scale text-emerald-600 text-xl mb-2 block"></i>
            <h3 className="font-bold text-gray-900 text-sm mb-1">Value Discrepancy</h3>
            <p className="text-xs text-gray-600">
              Detects mispriced bookmaker margins where our algorithmic win probability exceeds the implied odds.
            </p>
          </div>

          <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-100">
            <i className="fas fa-shield-alt text-amber-600 text-xl mb-2 block"></i>
            <h3 className="font-bold text-gray-900 text-sm mb-1">Variance Hedging</h3>
            <p className="text-xs text-gray-600">
              Identifies high-variance matches in SportPesa and Betika jackpots and suggests strategic double-chances (1X, X2).
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3">
        <h2 className="text-lg font-bold text-gray-900">
          Responsible Wagering Charter (18+)
        </h2>
        <p className="text-xs text-gray-600 leading-relaxed">
          Sports betting carries financial risk. We strongly emphasize disciplined bankroll management: never wager more than 2% to 5% of your total allocation on any individual match or slip. If gambling stops being enjoyable, step back or seek confidential assistance through responsible gaming resources.
        </p>
      </div>

      {/* About FAQs from about.md */}
      {faqs.length > 0 && (
        <FaqAccordion
          faqs={faqs}
          title={pageData?.frontmatter.faqTitle || "About Soka Predictions - FAQs"}
          subtitle="Key information about our background, statistical engine, and services."
        />
      )}
    </div>
  );
};
