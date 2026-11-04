import React from 'react';
import { Link } from 'react-router-dom';
import { MarkdownPageManager } from '../services/markdownManager';

export const Footer: React.FC = () => {
  // Pull all links dynamically from Markdown files
  const categoryPages = MarkdownPageManager.getCategoryPages();
  const providerPages = MarkdownPageManager.getProviderPages();
  const datePages = MarkdownPageManager.getDatePages();

  return (
    <footer className="footer bg-gray-950 text-gray-400 text-xs pt-12 pb-24 lg:pb-12 border-t border-gray-800" role="contentinfo">
      <div className="max-w-[1260px] 2xl:max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Col 1 */}
          <div>
            <Link to="/" className="logo-brand text-xl mb-3 inline-flex items-center gap-2">
              <img
                src="/assets/brand-emblem.png"
                alt="Soka Predictions Emblem"
                className="w-8 h-8 rounded-lg object-contain shadow-xs flex-shrink-0"
              />
              <span className="text-white">SOKA PREDICTIONS</span>
            </Link>
            <p className="text-gray-400 text-xs leading-relaxed mb-4">
              Your trusted partner for accurate football predictions and betting tips. Data driven by Sokaking sports analytics engine with instant M-Pesa automated dispatch.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-[#8D0E83] text-white flex items-center justify-center transition"
                aria-label="Facebook"
              >
                <i className="fab fa-facebook-f text-xs"></i>
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-[#8D0E83] text-white flex items-center justify-center transition"
                aria-label="Twitter"
              >
                <i className="fab fa-twitter text-xs"></i>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-[#8D0E83] text-white flex items-center justify-center transition"
                aria-label="Instagram"
              >
                <i className="fab fa-instagram text-xs"></i>
              </a>
              <a
                href="https://t.me/sokapredictions"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-[#8D0E83] text-white flex items-center justify-center transition"
                aria-label="Telegram"
              >
                <i className="fab fa-telegram text-xs"></i>
              </a>
            </div>
          </div>

          {/* Col 2: Dynamic Categories & Providers */}
          <div>
            <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-3">
              Predictions &amp; Tipsters
            </h3>
            <ul className="space-y-1.5">
              {providerPages.map((p) => (
                <li key={p.slug}>
                  <Link to={p.frontmatter.link} className="hover:text-white transition">
                    {p.frontmatter.shortTitle || p.frontmatter.displayTitle}
                  </Link>
                </li>
              ))}
              {categoryPages.map((p) => (
                <li key={p.slug}>
                  <Link to={p.frontmatter.link} className="hover:text-white transition">
                    {p.frontmatter.shortTitle || p.frontmatter.displayTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Archives & Trust */}
          <div>
            <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-3">
              Match Archives &amp; Hub
            </h3>
            <ul className="space-y-1.5">
              {MarkdownPageManager.hasPage('/jackpot-predictions') && (
                <li>
                  <Link to="/jackpot-predictions" className="hover:text-white transition">
                    Kenyan Jackpots Hub
                  </Link>
                </li>
              )}
              {MarkdownPageManager.hasPage('/tip-of-the-day') && (
                <li>
                  <Link to="/tip-of-the-day" className="hover:text-white transition">
                    Tip of the Day (Banker)
                  </Link>
                </li>
              )}
              {MarkdownPageManager.hasPage('/vip-packages') && (
                <li>
                  <Link to="/vip-packages" className="hover:text-white transition">
                    VIP Membership Club
                  </Link>
                </li>
              )}
              {datePages.map((p) => (
                <li key={p.slug}>
                  <Link to={p.frontmatter.link} className="hover:text-white transition">
                    {p.frontmatter.shortTitle || p.frontmatter.displayTitle}
                  </Link>
                </li>
              ))}
             
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-3">
              Contact Us (Kenya)
            </h3>
            <div className="space-y-2 text-gray-400">
              <p className="flex items-center gap-2">
                <i className="fas fa-envelope text-[#BB6EB5]"></i>
                <span>support@sokapredictions.com</span>
              </p>
              <p className="flex items-center gap-2">
                <i className="fab fa-whatsapp text-emerald-400"></i>
                <span>+254 740 841 375</span>
              </p>
              <p className="flex items-center gap-2">
                <i className="fab fa-telegram text-cyan-400"></i>
                <span>@sokapredictions</span>
              </p>
              <p className="flex items-center gap-2">
                <i className="fas fa-clock text-amber-400"></i>
                <span>24/7 Match Support</span>
              </p>
              <p className="flex items-center gap-2">
                <i className="fas fa-map-marker-alt text-red-400"></i>
                <span>Nairobi, Kenya (+254)</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-gray-900 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-gray-500">
          <p>&copy; 2026 SOKA PREDICTIONS. Powered by <a href="https://sokaking.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white underline font-semibold">Sokaking</a> Engine.</p>
          <div className="flex items-center gap-2">
            <span className="bg-red-950/70 text-red-400 border border-red-800/40 px-2 py-0.5 rounded font-black text-[10px]">
              18+ ONLY
            </span>
            <span>Gamble Responsibly. Predictions carry inherent variance.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
