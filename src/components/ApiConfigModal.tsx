import React, { useState, useEffect } from 'react';
import { getApiBaseUrl, setApiBaseUrl, DEFAULT_API_BASE_URL, CheerplexApiService } from '../services/api';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEndpointChanged: () => void;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({
  isOpen,
  onClose,
  onEndpointChanged,
}) => {
  const [url, setUrl] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    payload?: any;
    pingMs?: number;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUrl(getApiBaseUrl());
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    const start = performance.now();

    try {
      setApiBaseUrl(url);
      const health = await CheerplexApiService.getHealth();
      const elapsed = Math.round(performance.now() - start);

      setTestResult({
        success: true,
        message: 'Successfully reached Cheerplex PHP API!',
        payload: health,
        pingMs: elapsed,
      });
      onEndpointChanged();
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Could not reach PHP API. Make sure CORS headers are enabled.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleReset = () => {
    setUrl(DEFAULT_API_BASE_URL);
    setApiBaseUrl(DEFAULT_API_BASE_URL);
    onEndpointChanged();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-200">
        <div className="p-4 px-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i className="fas fa-server text-[#8D0E83] text-lg"></i>
            <h3 className="text-base font-bold text-gray-900 m-0">
              Cheerplex PHP Backend Connection
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition"
          >
            <i className="fas fa-times text-sm"></i>
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-gray-600 leading-relaxed">
            Data is consumed from the standalone PHP REST API as defined in{' '}
            <a
              href="https://github.com/kimkimani/cheerplex"
              target="_blank"
              rel="noreferrer"
              className="text-[#8D0E83] font-bold underline"
            >
              kimkimani/cheerplex
            </a>
            . You can connect to the live remote API or your own local PHP/cPanel instance.
          </p>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              PHP API Base URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://cheerplex.co.ke/soka_king/api"
              className="w-full text-xs font-mono px-3 py-2 border border-gray-300 rounded-lg focus:border-[#8D0E83] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTest}
              disabled={isTesting}
              className="px-4 py-2 bg-[#8D0E83] hover:bg-[#630A5C] text-white text-xs font-bold rounded-lg transition flex items-center gap-2 shadow-xs cursor-pointer"
            >
              {isTesting ? (
                <>
                  <i className="fas fa-spinner fa-spin text-xs"></i>
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-bolt text-xs"></i>
                  <span>Test Connection</span>
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              className="px-3 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-lg transition"
            >
              Restore Default
            </button>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-xl text-xs border ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}
            >
              <div className="font-bold flex items-center justify-between mb-1">
                <span>{testResult.message}</span>
                {testResult.pingMs !== undefined && (
                  <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-emerald-300 text-emerald-800">
                    {testResult.pingMs} ms
                  </span>
                )}
              </div>
              {testResult.payload && (
                <pre className="mt-2 text-[10px] bg-white/80 p-2 rounded border border-emerald-200 overflow-x-auto font-mono text-gray-800">
                  {JSON.stringify(testResult.payload, null, 2)}
                </pre>
              )}
            </div>
          )}

          <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 text-[11px] text-gray-600">
            <strong>Supported Endpoints:</strong>
            <ul className="list-disc list-inside mt-1 space-y-0.5 font-mono text-[10px] text-gray-700">
              <li>GET /api/predictions?category=...</li>
              <li>POST /api/predictions/vote</li>
              <li>GET /api/jackpots &amp; /api/jackpots/:id</li>
              <li>GET /api/vip-packages</li>
              <li>GET /api/odds-packs</li>
              <li>POST /api/mpesa/stkpush</li>
            </ul>
          </div>
        </div>

        <div className="p-4 px-5 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#8D0E83] text-white font-bold text-xs rounded-lg hover:bg-[#630A5C] transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
