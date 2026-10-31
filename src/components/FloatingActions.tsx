import React from 'react';

interface FloatingActionsProps {
  onOpenApiConfig?: () => void;
}

export const FloatingActions: React.FC<FloatingActionsProps> = () => {
  return (
    <div
      className="floating-actions fixed bottom-20 lg:bottom-6 right-2 sm:right-3 xl:right-2.5 2xl:right-6 z-40 flex flex-col items-center gap-2"
      aria-label="Contact options"
    >
      <a
        href="https://wa.me/254740841375?text=Hi%2C%20I%20need%20help%20with%20SokaPredictions"
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center text-base shadow-lg hover:scale-110 transition-transform duration-200"
        title="WhatsApp VIP Support (+254 740 841 375)"
        aria-label="WhatsApp Support"
      >
        <i className="fab fa-whatsapp"></i>
      </a>

      <a
        href="https://t.me/sokapredictions"
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 rounded-full bg-[#0088cc] text-white flex items-center justify-center text-sm shadow-lg hover:scale-110 transition-transform duration-200"
        title="Telegram VIP Channel (@sokapredictions)"
        aria-label="Telegram Channel"
      >
        <i className="fab fa-telegram"></i>
      </a>

      <a
        href="tel:+254740841375"
        className="w-10 h-10 rounded-full bg-[#8D0E83] text-white hidden sm:flex items-center justify-center text-xs shadow-lg hover:scale-110 transition-transform duration-200"
        title="Call Hotline: 0740 841 375"
        aria-label="Call Hotline"
      >
        <i className="fas fa-phone"></i>
      </a>
    </div>
  );
};
