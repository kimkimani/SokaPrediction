import React from 'react';
import { MarkdownPageData, MarkdownSection } from '../services/markdownManager';

interface MarkdownArticleBlockProps {
  pageData: MarkdownPageData | null;
  sections?: MarkdownSection[];
  overviewHtml?: string;
  className?: string;
}

export const MarkdownArticleBlock: React.FC<MarkdownArticleBlockProps> = ({
  pageData,
  sections,
  overviewHtml,
  className = '',
}) => {
  const activeOverview = overviewHtml !== undefined ? overviewHtml : pageData?.overviewHtml;
  const allSections = sections || pageData?.sections || [];
  const editorialSections = allSections.filter((s) => s.tag !== 'faq');

  const hasOverview = Boolean(activeOverview && activeOverview.trim());
  if (!hasOverview && editorialSections.length === 0) {
    return null;
  }

  return (
    <article
      className={`bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 md:p-8 shadow-xs my-6 ${className}`}
    >
      <div className="max-w-4xl mx-auto space-y-6 text-gray-700 leading-relaxed text-sm">
        {hasOverview && (
          <div
            className="prose max-w-none text-gray-700 leading-relaxed text-xs md:text-sm space-y-3 [&>p]:leading-relaxed [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1.5 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:space-y-1.5 [&>blockquote]:border-l-4 [&>blockquote]:border-[#8D0E83] [&>blockquote]:bg-purple-50/50 [&>blockquote]:p-3 [&>blockquote]:rounded-r-lg [&>blockquote]:italic [&>blockquote]:text-[#630A5C]"
            dangerouslySetInnerHTML={{ __html: activeOverview! }}
          />
        )}

        {editorialSections.map((sec, idx) => (
          <div
            key={sec.id || idx}
            className="space-y-3 pt-5 first:pt-0 border-t first:border-t-0 border-gray-100"
          >
            <h2 className="text-lg md:text-xl font-black text-gray-900 tracking-tight flex items-center gap-2 m-0 pb-1">
              <span>{sec.title}</span>
            </h2>
            <div
              className="prose max-w-none text-gray-700 leading-relaxed text-xs md:text-sm space-y-3 [&>p]:leading-relaxed [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1.5 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:space-y-1.5 [&>blockquote]:border-l-4 [&>blockquote]:border-[#8D0E83] [&>blockquote]:pl-4 [&>blockquote]:py-2 [&>blockquote]:bg-purple-50/50 [&>blockquote]:rounded-r-lg [&>blockquote]:italic [&>blockquote]:text-[#630A5C] [&>blockquote]:font-semibold [&>h3]:text-sm md:[&>h3]:text-base [&>h3]:font-bold [&>h3]:text-gray-900 [&>h3]:pt-2"
              dangerouslySetInnerHTML={{ __html: sec.htmlContent }}
            />
          </div>
        ))}
      </div>
    </article>
  );
};
