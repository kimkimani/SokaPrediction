import React from 'react';

interface ApiLoadingStateProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export const ApiLoadingState: React.FC<ApiLoadingStateProps> = ({
  title = 'Loading verified match predictions...',
  subtitle = 'Retrieving odds and statistical form picks from API',
  className = '',
}) => {
  return (
    <div className={`text-center py-16 text-gray-400 ${className}`}>
      <i className="fas fa-spinner fa-spin text-3xl text-[#8D0E83] mb-3 block"></i>
      <p className="text-xs font-bold text-gray-700">{title}</p>
      {subtitle && <p className="text-[11px] text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
};
