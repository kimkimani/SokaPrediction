import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MarkdownPageManager } from '../services/markdownManager';

export const SeoManager: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const rawPath = location.pathname;
    const cleanPath = rawPath === '/' ? '/' : rawPath.replace(/\/+$/, '');
    // 1. Fetch matching markdown page data
    const pageData = MarkdownPageManager.getPageByPath(rawPath);

    // 2. Determine Title (stripping | SOKAPREDICTIONS)
    const baseTitle = pageData?.frontmatter?.title || pageData?.frontmatter?.displayTitle || 'Free Soka Prediction Today and Football Soka Tips';
    const cleanTitle = baseTitle
      .replace(/\s*\|\s*SOKAPREDICTIONS\b/gi, '')
      .replace(/\s*\|\s*SokaPredictions\b/gi, '')
      .trim();
    document.title = cleanTitle;

    // 3. Determine Canonical URL (favoring the markdown page's canonical link)
    const officialPath = pageData?.frontmatter?.link || cleanPath;
    const finalCleanPath = officialPath === '/' ? '/' : officialPath.replace(/\/+$/, '');
    const canonicalUrl = `https://www.sokapredictions.com${finalCleanPath === '/' ? '/' : finalCleanPath}`;

    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // 4. Determine Description
    const description = pageData?.frontmatter?.description || 'Get Accurate Today and Daily Soka football Predictions and betting tips Right Now. Don\'t waste time on low quality soka tips. Check SOKAPREDICTIONS for Top Soccer tips.';

    // Manage Meta Description (deduplicating if any duplicate exists)
    const metaDescs = Array.from(document.querySelectorAll('meta[name="description"]'));
    if (metaDescs.length === 0) {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      meta.setAttribute('content', description);
      document.head.appendChild(meta);
    } else {
      metaDescs[0].setAttribute('content', description);
      for (let i = 1; i < metaDescs.length; i++) {
        metaDescs[i].remove();
      }
    }

    // 5. Determine Keywords
    const keywords = pageData?.frontmatter?.keywords || (pageData?.frontmatter?.tags ? pageData.frontmatter.tags.join(', ') : 'soka prediction, soka prediction today, soka prediction today football, soka tip, soka tips today, soka prediction tips');

    // Manage Meta Keywords (deduplicating if any duplicate exists)
    const metaKeywords = Array.from(document.querySelectorAll('meta[name="keywords"]'));
    if (metaKeywords.length === 0) {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'keywords');
      meta.setAttribute('content', keywords);
      document.head.appendChild(meta);
    } else {
      metaKeywords[0].setAttribute('content', keywords);
      for (let i = 1; i < metaKeywords.length; i++) {
        metaKeywords[i].remove();
      }
    }

    // 6. Update OpenGraph Tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', cleanTitle);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', canonicalUrl);

    let twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute('content', cleanTitle);

    let twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute('content', description);
  }, [location.pathname]);

  return null;
};
