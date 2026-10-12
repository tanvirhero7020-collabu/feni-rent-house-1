import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { SiteSettings } from '../types';

interface FloatingWhatsAppProps {
  settings: SiteSettings;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ settings }) => {
  const [showTooltip, setShowTooltip] = useState(true);

  const rawPhone = settings.waLink || settings.helpPhone || '01812345678';
  const cleanNumber = rawPhone.replace(/[^\d]/g, '');
  const formattedNumber = cleanNumber.startsWith('88') ? cleanNumber : `88${cleanNumber}`;
  const prefilledMessage = encodeURIComponent('আসসালামু আলাইকুম, আমি Feni House Rent পোর্টাল থেকে বাসা সম্পর্কে জানতে যোগাযোগ করছি।');
  const whatsappUrl = `https://wa.me/${formattedNumber}?text=${prefilledMessage}`;

  return (
    <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40 flex items-end flex-col gap-2 pointer-events-none select-none">
      {/* Speech Bubble / Tooltip */}
      {showTooltip && (
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md text-slate-800 text-xs font-bold py-1.5 px-3 rounded-2xl shadow-xl border border-emerald-200/80 flex items-center gap-2 animate-bounce max-w-[210px] sm:max-w-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping flex-shrink-0" />
          <span className="truncate">বাসা খুঁজতে সাহায্য লাগবে?</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="text-slate-400 hover:text-slate-600 ml-1 text-sm font-black p-0.5 cursor-pointer"
            aria-label="Close tooltip"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Floating Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="pointer-events-auto group relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-full shadow-2xl transition-all duration-300 hover:shadow-emerald-500/40 cursor-pointer border-2 border-white"
      >
        {/* Pulsating online halo */}
        <span className="absolute -inset-1 rounded-full bg-emerald-400/40 animate-pulse pointer-events-none" />
        <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 fill-current relative z-10 transition-transform group-hover:scale-110" />
        {/* Online Indicator Badge */}
        <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full z-20" />
      </a>
    </div>
  );
};
