import React from 'react';
import { FaqAccordion } from './FaqAccordion';
import { MarkdownPageManager } from '../services/markdownManager';

export const EditorialContent: React.FC = () => {
  const homePage = MarkdownPageManager.getPageByPath('/');
  const faqs = homePage?.faqs || [];
  return (
    // <div className="space-y-6 mb-10">
    //   <section className="bg-white border border-gray-200/90 rounded-2xl p-6 md:p-8 shadow-xs">
    //     <div className="max-w-4xl mx-auto space-y-6 text-gray-700 leading-relaxed text-sm">
    //       <h2 className="text-xl md:text-2xl font-black text-gray-900 border-b pb-3 border-gray-100">
    //         Stop Guessing. Start Winning. Soka Predictions is your #1 Source for tips and Predictions
    //       </h2>

    //       <p>
    //         SOKAPREDICTIONS is very sure you are tired of predictions that fail you. Tips that exhaust you and losing bets disguised as SURE BETs and SURE WINs. Let your quest for consistent yet reliable, and accurately analysed football tips end right here, right now. We are Soka Predictions and winning is our business. At SOKAPREDICTIONS, we don&apos;t just offer you tips; we deliver a winning strategy.
    //       </p>

    //       <p>
    //         The world is changing, and that&apos;s not stopping. That&apos;s why we are using advanced sports statistical modeling and deep football domain expertise to give a fresh breath to football Predictions. Our mission is simple: to let you maximize your returns and minimize your risks with only sure bet soka predictions and tips.
    //       </p>

    //       <h3 className="text-lg md:text-xl font-bold text-gray-900 pt-2">
    //         Why SOKAPREDICTIONS is Your Ultimate Partner
    //       </h3>

    //       <p>
    //         Do you really understand how draining it is to spend time analyzing soccer only to lose your prediction? It&apos;s only at SOKA PREDICTIONS that you can separate top tips from the crowd of low-quality predictions. We have an unwavering commitment to quality over quantity. You only need a few Soka Predictions tips to get the value back.
    //       </p>

    //       <ul className="space-y-2 list-disc list-inside text-gray-700 pl-2">
    //         <li>We go beyond the surface to mine football predictions that have high statistical winning rates.</li>
    //         <li>We identify value discrepancies between the true mathematical probability of an outcome and the bookmaker odds.</li>
    //         <li>We don&apos;t limit you. Our soccer tips cover all markets: 1X2, Over/Under 2.5, BTTS/GG, Handicaps, Double chance, HT/FT, and complete Jackpots.</li>
    //       </ul>

    //       <blockquote className="border-l-4 border-[#8D0E83] pl-4 py-2 bg-purple-50/50 rounded-r-lg italic text-[#630A5C] font-semibold text-base">
    //         &quot;Don&apos;t Just Dream of Wins. Achieve Them with Soka Predictions.&quot;
    //       </blockquote>

    //       <h3 className="text-lg md:text-xl font-bold text-gray-900 pt-2">
    //         Our Premium Soka Predictions Packages
    //       </h3>

    //       <p>Choose a package that fits your ambitions. We have:</p>

    //       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
    //         <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
    //           <strong className="text-[#8D0E83] block text-xs uppercase mb-1">Daily Accumulators</strong>
    //           <span className="text-xs text-gray-600">Daily packages of 3.00 - 8.00 combined value odds</span>
    //         </div>
    //         <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
    //           <strong className="text-emerald-700 block text-xs uppercase mb-1">Safe Single Bankers</strong>
    //           <span className="text-xs text-gray-600">Ultra-safe 2+ odds shortlists with 92% win probability</span>
    //         </div>
    //         <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
    //           <strong className="text-amber-700 block text-xs uppercase mb-1">Mega Jackpot Slips</strong>
    //           <span className="text-xs text-gray-600">17-Match coupons with double-chance variance hedges</span>
    //         </div>
    //         <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
    //           <strong className="text-emerald-700 block text-xs uppercase mb-1">Always Free</strong>
    //           <span className="text-xs text-gray-600">Free daily match predictions with 0 hidden fees</span>
    //         </div>
    //       </div>

    //       <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
    //         <strong>Disclaimer:</strong> Predictions involve financial risk. Please be responsible. SOKAPREDICTIONS is an analytical sports tipping service and does not guarantee winnings. Users must be 18+. Practice disciplined bankroll management at all times.
    //       </div>
    //     </div>
    //   </section>

    //   {/* Interactive FAQ Section on Home Page from home.md */}
    //   {faqs.length > 0 && (
    //     <FaqAccordion
    //       faqs={faqs}
    //       title={homePage?.frontmatter.faqTitle || "Soka Predictions - Frequently Asked Questions"}
    //       subtitle="Common questions about our statistical prediction models, kickoff schedules, VIP membership, and M-Pesa automated dispatch."
    //     />
    //   )}
    // </div>
  );
};
