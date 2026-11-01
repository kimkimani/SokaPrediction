import React from 'react';
import { FaqAccordion } from './FaqAccordion';
import { MarkdownPageManager } from '../services/markdownManager';

export const EditorialContent: React.FC = () => {
  const homePage = MarkdownPageManager.getPageByPath('/');
  const faqs = homePage?.faqs || [];
  return (

  );
};
