import React from 'react';
import { Link } from 'react-router-dom';

interface PageNotFoundProps {
  path?: string;
}

export const PageNotFound: React.FC<PageNotFoundProps> = ({ path }) => {
  return (
    <div className="py-16 text-center bg-gray-50 rounded-2xl border border-gray-200 p-8 my-6">
      <i className="fas fa-file-alt text-4xl text-[#8D0E83] mb-3 block"></i>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Page Not Found</h2>
      <p className="text-xs text-gray-500 mb-4 max-w-md mx-auto">
        No active markdown file in <code>src/content/pages/</code> matches the path &quot;{path || window.location.pathname}&quot;.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Link
          to="/"
          className="px-4 py-2 bg-[#8D0E83] text-white text-xs font-bold rounded-lg hover:bg-[#630A5C] transition"
        >
          Go to Home
        </Link>
        <Link
          to="/free-sure-tips-and-predictions"
          className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-100 transition"
        >
          Explore Predictions
        </Link>
      </div>
    </div>
  );
};
