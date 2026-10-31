import React, { useState, useEffect } from 'react';
import { CheerplexApiService } from '../services/api';

interface SelectedPackage {
  name: string;
  amount: number;
  id: string;
  slug: string;
  type: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage: SelectedPackage | null;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  selectedPackage,
}) => {
  const [phone, setPhone] = useState('');
  const [accountName, setAccountName] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: 'info' | 'success' | 'error' | 'warning';
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPhone('');
      setAccountName('');
      setStatusMessage(null);
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen || !selectedPackage) return null;

  // Validation function for Kenyan Safaricom / Airtel phone numbers
  const validateKenyanPhone = (input: string) => {
    const cleaned = input.replace(/\s+/g, '');
    const regex = /^(07\d{8}|01\d{8}|7\d{8}|1\d{8}|\+2547\d{8}|\+2541\d{8}|2547\d{8}|2541\d{8})$/;
    return regex.test(cleaned);
  };

  const formatKenyanPhone = (input: string) => {
    let cleaned = input.replace(/\s+/g, '');
    if (cleaned.startsWith('0')) {
      return '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('+254')) {
      return cleaned.substring(1);
    } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
      return '254' + cleaned;
    }
    return cleaned;
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone.trim()) {
      setStatusMessage({
        type: 'warning',
        text: 'Please enter your M-Pesa phone number.',
      });
      return;
    }

    if (!validateKenyanPhone(phone)) {
      setStatusMessage({
        type: 'warning',
        text: 'Please enter a valid Kenyan phone number (e.g. 0712345678 or 0112345678).',
      });
      return;
    }

    if (!accountName.trim()) {
      setStatusMessage({
        type: 'warning',
        text: 'Please enter your account name (e.g. John Doe).',
      });
      return;
    }

    setLoading(true);
    setStatusMessage({
      type: 'info',
      text: 'Initiating M-Pesa STK Push to ' + phone + '...',
    });

    try {
      const formattedPhone = formatKenyanPhone(phone);
      const res = await CheerplexApiService.initiateMpesaPayment({
        phone: formattedPhone,
        account_name: accountName.trim(),
        amount: selectedPackage.amount,
        package: selectedPackage.name,
        package_id: selectedPackage.id,
        package_slug: selectedPackage.slug,
        package_type: selectedPackage.type,
      });

      if (res && (res.status === 1 || res.status === true)) {
        setStatusMessage({
          type: 'success',
          text: `STK Push prompt sent successfully to ${phone}! Please enter your M-Pesa PIN on your phone to complete payment. Your tips will be dispatched via SMS & WhatsApp within 5 minutes.`,
        });
        setTimeout(() => {
          onClose();
        }, 5000);
      } else {
        setStatusMessage({
          type: 'error',
          text: res.message || 'Payment initiation failed. Please check your number or pay manually using Paybill below.',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Could not connect to payment gateway. Please use the manual Paybill steps below.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 px-5 border-b border-gray-200 bg-gray-50">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#8D0E83] tracking-wider">
              M-Pesa Express Checkout
            </span>
            <h3 className="text-base font-bold text-gray-900 m-0">
              {selectedPackage.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center transition"
            aria-label="Close"
          >
            <i className="fas fa-times text-sm"></i>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5">
          <p className="text-xs text-gray-600 mb-4 leading-relaxed">
            {selectedPackage.type === 'jackpot'
              ? 'You will receive all 17 jackpot selections with double-chance combinations immediately after confirmation.'
              : selectedPackage.type === 'odds'
              ? 'You will receive the curated sure odds shortlist via SMS/Telegram immediately after payment.'
              : 'You will receive VIP access with full predictions, daily banker slips, and jackpot slips.'}
          </p>

          <form onSubmit={handlePay} className="space-y-3.5 mb-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Your M-Pesa Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07XX XXX XXX or 01XX XXX XXX"
                className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:border-[#8D0E83] focus:ring-1 focus:ring-[#8D0E83] focus:outline-none transition"
                required
              />
              <small className="text-[11px] text-gray-400 mt-0.5 block">
                Format: 07XXXXXXXX (Safaricom / Airtel Money)
              </small>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Account Name / Your Name
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:border-[#8D0E83] focus:ring-1 focus:ring-[#8D0E83] focus:outline-none transition"
                required
              />
              <small className="text-[11px] text-gray-400 mt-0.5 block">
                Used to verify your transaction on the M-Pesa ledger
              </small>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#8D0E83] hover:bg-[#630A5C] text-white font-bold text-sm rounded-lg transition flex items-center justify-center gap-2 shadow-md disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin text-sm"></i>
                  <span>Initiating STK Push...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-lock text-xs"></i>
                  <span>Pay KES {selectedPackage.amount} with M-Pesa</span>
                </>
              )}
            </button>
          </form>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-lg text-xs font-medium mb-4 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : statusMessage.type === 'error'
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : statusMessage.type === 'warning'
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          {/* Manual Paybill Instructions */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-xs">
            <div className="font-bold text-gray-900 mb-2 flex items-center gap-1.5">
              <i className="fas fa-mobile-alt text-emerald-600"></i>
              <span>Manual M-Pesa PayBill Option</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-gray-600 text-[11px]">
              <li>Go to M-Pesa on your phone</li>
              <li>Select <strong>Lipa na M-Pesa</strong> → <strong>Pay Bill</strong></li>
              <li>
                Enter Business No: <strong className="text-gray-900">123456</strong>
              </li>
              <li>
                Enter Account No: <strong className="text-gray-900">{accountName || 'Your Name'}</strong>
              </li>
              <li>
                Enter Amount: <strong className="text-emerald-700 font-bold">KES {selectedPackage.amount}</strong>
              </li>
              <li>Enter your M-Pesa PIN and Confirm</li>
            </ol>
            <p className="text-[10px] text-gray-400 mt-2">
              Tips will be automatically dispatched to your phone number once transaction settles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
