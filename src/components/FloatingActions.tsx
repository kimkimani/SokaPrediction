import React from 'react';

interface FloatingActionsProps {
  onOpenApiConfig?: () => void;
}

export const FloatingActions: React.FC<FloatingActionsProps> = () => {
  return (
    <div
      className="floating-actions fixed bottom-20 lg:bottom-8 right-4 sm:right-6 z-40 flex flex-col items-center gap-2.5 pointer-events-auto"
      aria-label="Contact options"
    >
      <a
        href="https://wa.me/254740841375?text=Hi%2C%20I%20need%20help%20with%20SokaPredictions"
        target="_blank"
        rel="noopener noreferrer"
        className="w-11 h-11 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center text-lg shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 border-2 border-white/90"
        title="WhatsApp VIP Support (+254 740 841 375)"
        aria-label="WhatsApp Support"
      >
        <i className="fab fa-whatsapp"></i>
      </a>

      <a
        href="https://t.me/sokapredictions"
        target="_blank"
        rel="noopener noreferrer"
        className="w-11 h-11 rounded-full bg-[#0088cc] hover:bg-[#0077b5] text-white flex items-center justify-center text-base shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 border-2 border-white/90"
        title="Telegram VIP Channel (@sokapredictions)"
        aria-label="Telegram Channel"
      >
        <i className="fab fa-telegram"></i>
      </a>

      <a
        href="tel:+254740841375"
        className="w-11 h-11 rounded-full bg-[#8D0E83] hover:bg-[#6e0a66] text-white flex items-center justify-center text-sm shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 border-2 border-white/90"
        title="Call Helpline: 0740 841 375"
        aria-label="Call Helpline"
      >
        <i className="fas fa-phone"></i>
      </a>
    </div>
  );
};
