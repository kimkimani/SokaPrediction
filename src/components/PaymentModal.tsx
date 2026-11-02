import React, { useState, useEffect } from 'react';

/*
 * =========================================================================
 * PREVIOUS AUTOMATED M-PESA STK PUSH IMPLEMENTATION (COMMENTED OUT AS REQUESTED)
 * Can be reinstated when automated STK Push gateway is active.
 * =========================================================================
 *
 * import { CheerplexApiService } from '../services/api';
 *
 * const handlePayOld = async (e: React.FormEvent) => {
 *   e.preventDefault();
 *   if (!phone.trim()) {
 *     setStatusMessage({ type: 'warning', text: 'Please enter your M-Pesa phone number.' });
 *     return;
 *   }
 *   if (!validateKenyanPhone(phone)) {
 *     setStatusMessage({ type: 'warning', text: 'Please enter a valid Kenyan phone number (e.g. 0712345678 or 0112345678).' });
 *     return;
 *   }
 *   if (!accountName.trim()) {
 *     setStatusMessage({ type: 'warning', text: 'Please enter your account name (e.g. John Doe).' });
 *     return;
 *   }
 *   setLoading(true);
 *   setStatusMessage({ type: 'info', text: 'Initiating M-Pesa STK Push to ' + phone + '...' });
 *   try {
 *     const formattedPhone = formatKenyanPhone(phone);
 *     const res = await CheerplexApiService.initiateMpesaPayment({
 *       phone: formattedPhone,
 *       account_name: accountName.trim(),
 *       amount: selectedPackage.amount,
 *       package: selectedPackage.name,
 *       package_id: selectedPackage.id,
 *       package_slug: selectedPackage.slug,
 *       package_type: selectedPackage.type,
 *     });
 *     if (res && (res.status === 1 || res.status === true)) {
 *       setStatusMessage({
 *         type: 'success',
 *         text: `STK Push prompt sent successfully to ${phone}! Please enter your M-Pesa PIN on your phone to complete payment. Your tips will be dispatched via SMS & WhatsApp within 5 minutes.`,
 *       });
 *       setTimeout(() => { onClose(); }, 5000);
 *     } else {
 *       setStatusMessage({
 *         type: 'error',
 *         text: res.message || 'Payment initiation failed. Please check your number or pay manually using Paybill below.',
 *       });
 *     }
 *   } catch (err: any) {
 *     setStatusMessage({
 *       type: 'error',
 *       text: err?.message || 'Could not connect to payment gateway. Please use the manual Paybill steps below.',
 *     });
 *   } finally {
 *     setLoading(false);
 *   }
 * };
 * =========================================================================
 */

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
  // Pochi la Biashara official merchant number
  const POCHI_PHONE = '0740841375';
  const POCHI_PHONE_DISPLAY = '0740 841 375';
  const POCHI_NAME = 'SOKA PREDICTIONS / VIP DESK';

  // State management
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCopiedPhone(false);
      setCopiedAmount(false);
    }
  }, [isOpen]);

  if (!isOpen || !selectedPackage) return null;

  // Copy helper with fallback
  const handleCopy = (text: string, type: 'phone' | 'amount') => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        console.error('Copy fallback failed', err);
      }
      document.body.removeChild(textArea);
    }

    if (type === 'phone') {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2500);
    } else {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2500);
    }
  };

  // WhatsApp VIP direct link
  const whatsAppMessage = `Hello Soka Predictions VIP Desk,\n\nI am paying KES ${selectedPackage.amount} for "${selectedPackage.name}" via Pochi la Biashara to ${POCHI_PHONE_DISPLAY}.\n\nPlease send my VIP tips. Thank you!`;
  const whatsAppLink = `https://wa.me/254740841375?text=${encodeURIComponent(whatsAppMessage)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-200">
        {/* Header - Solid Brand Purple Color (#8D0E83) without gradients */}
        <div className="sticky top-0 z-10 bg-[#8D0E83] text-white p-4 sm:p-5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 text-white flex items-center justify-center text-lg shadow-xs">
              <i className="fas fa-wallet"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-extrabold tracking-wider bg-white/20 px-2 py-0.5 rounded text-white">
                  Lipa na M-Pesa
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-purple-200">
                  Pochi la Biashara
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold leading-tight text-white m-0 mt-0.5">
                {selectedPackage.name}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close modal"
          >
            <i className="fas fa-times text-sm"></i>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Price & Package Summary Banner - Website Colors */}
          <div className="flex items-center justify-between p-3.5 bg-purple-50 border border-purple-200 rounded-xl">
            <div>
              <span className="text-xs text-purple-900 font-semibold block">Total Amount</span>
              <span className="text-xl sm:text-2xl font-black text-[#8D0E83]">
                KES {selectedPackage.amount}
              </span>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#8D0E83] bg-white border border-purple-200 px-2.5 py-1 rounded-full">
                <i className="fas fa-bolt text-[10px]"></i> Instant SMS &amp; WhatsApp
              </span>
              <p className="text-[10px] text-gray-500 mt-1 m-0">Dispatched in 2 - 5 mins</p>
            </div>
          </div>

          {/* Pochi la Biashara Instructions */}
          <div className="border border-gray-200 rounded-xl bg-gray-50 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <h4 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2 m-0">
                <span className="w-5 h-5 rounded-full bg-[#8D0E83] text-white text-[11px] flex items-center justify-center font-bold">
                  <i className="fas fa-check text-[9px]"></i>
                </span>
                How to Pay via Pochi la Biashara
              </h4>
              <span className="text-[10px] font-semibold text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-200">
                Dial *334# or M-PESA App
              </span>
            </div>

            <ol className="space-y-2 text-xs text-gray-700 leading-relaxed list-decimal list-inside pl-0.5">
              <li>
                Go to <strong>M-PESA</strong> on your SIM toolkit or dial{' '}
                <strong className="text-gray-900 font-bold">*334#</strong>
              </li>
              <li>
                Select <strong>Lipa na M-PESA</strong> → Select <strong>Pochi la Biashara</strong>
              </li>
              <li>
                Select <strong>Send Money</strong>
              </li>
              <li>
                Enter Phone No: <strong className="text-gray-900">{POCHI_PHONE_DISPLAY}</strong>
              </li>
              <li>
                Enter Amount: <strong className="text-[#8D0E83] font-bold">KES {selectedPackage.amount}</strong>
              </li>
              <li>
                Enter your <strong>M-PESA PIN</strong> and press Send
              </li>
            </ol>

            {/* Account Details with 1-Click Copy Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {/* Phone Number Field */}
              <div className="bg-white border border-purple-200 hover:border-[#8D0E83] rounded-xl p-3 transition shadow-xs">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                  Pochi Phone Number
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-base sm:text-lg font-black text-gray-900 tracking-wider">
                    {POCHI_PHONE_DISPLAY}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(POCHI_PHONE, 'phone')}
                    className={`text-xs px-2.5 py-1 rounded-md font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      copiedPhone
                        ? 'bg-[#8D0E83] text-white'
                        : 'bg-purple-50 text-[#8D0E83] hover:bg-purple-100 border border-purple-200'
                    }`}
                  >
                    <i className={`fas ${copiedPhone ? 'fa-check' : 'fa-copy'}`}></i>
                    <span>{copiedPhone ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Amount Field */}
              <div className="bg-white border border-purple-200 hover:border-[#8D0E83] rounded-xl p-3 transition shadow-xs">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                  Exact Amount (KES)
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-base sm:text-lg font-black text-[#8D0E83]">
                    {selectedPackage.amount}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(String(selectedPackage.amount), 'amount')}
                    className={`text-xs px-2.5 py-1 rounded-md font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      copiedAmount
                        ? 'bg-[#8D0E83] text-white'
                        : 'bg-purple-50 text-[#8D0E83] hover:bg-purple-100 border border-purple-200'
                    }`}
                  >
                    <i className={`fas ${copiedAmount ? 'fa-check' : 'fa-copy'}`}></i>
                    <span>{copiedAmount ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <span className="text-[10px] text-gray-500 mt-1 block">
                  Enter your <strong>M-Pesa PIN</strong> to pay
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Note */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 space-y-1">
            <div className="font-bold text-gray-900 flex items-center gap-1.5">
              <i className="fas fa-check-circle text-[#8D0E83]"></i>
              <span>Instant VIP Tips Delivery</span>
            </div>
            <p className="text-[11px] text-gray-600 m-0 leading-relaxed">
              Once you enter your M-Pesa PIN and send, your payment is registered immediately on the Pochi ledger. Tips are dispatched to your paying phone number via SMS and WhatsApp within <strong>2 to 5 minutes</strong>.
            </p>
          </div>

          {/* Direct WhatsApp Contact Button & Close */}
          <div className="space-y-2 pt-1">
            <a
              href={whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 bg-[#8D0E83] hover:bg-[#720b6a] text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-sm text-center cursor-pointer"
            >
              <i className="fab fa-whatsapp text-lg"></i>
              <span>Chat with VIP Support on WhatsApp</span>
            </a>

            <div className="flex items-center justify-between pt-1 text-xs text-gray-600">
              <div className="flex items-center gap-1.5">
                <i className="fas fa-phone-alt text-[#8D0E83] text-[11px]"></i>
                <span>Helpline: <strong className="text-gray-900">{POCHI_PHONE_DISPLAY}</strong></span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-bold text-gray-500 hover:text-gray-900 px-3 py-1 rounded hover:bg-gray-100 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
