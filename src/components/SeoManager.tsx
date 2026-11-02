import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MarkdownPageManager } from '../services/markdownManager';

export const SeoManager: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const rawPath = location.pathname;
    const cleanPath = rawPath === '/' ? '/' : rawPath.replace(/\/+$/, '');
    const canonicalUrl = `https://www.sokapredictions.com${cleanPath === '/' ? '/' : cleanPath}`;

    // 1. Manage Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // 2. Fetch matching markdown page data
    const pageData = MarkdownPageManager.getPageByPath(rawPath);

    const baseTitle = pageData?.frontmatter?.title || pageData?.frontmatter?.displayTitle || 'Free Soka Prediction And Today Football Betting Tips';
    const cleanTitle = baseTitle.replace(/\s*\|\s*SOKAPREDICTIONS/gi, '').trim();
    document.title = cleanTitle;

    const description = pageData?.frontmatter?.description || 'Get Accurate Soka Predictions and football betting predictions right now. Top Sure Soccer Bet Wins from Experts.';

    // 3. Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // 4. Update OpenGraph Tags
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
