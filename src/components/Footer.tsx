import React from 'react';
import { Home, MapPin, Phone, Mail, MessageCircle, Youtube, Send } from 'lucide-react';
import { SiteSettings } from '../types';

interface FooterProps {
  settings: SiteSettings;
  onOpenAdmin: () => void;
  onNavigateHome: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onOpenAdmin,
  onNavigateHome
}) => {
  const getWhatsappUrl = (val: string) => {
    if (!val) return '';
    if (val.startsWith('http')) return val;
    const clean = val.replace(/[^0-9]/g, '');
    return `https://wa.me/${clean.startsWith('88') ? clean : '88' + clean}`;
  };

  return (
    <footer id="contact" className="bg-[#07182D] text-slate-300 pt-10 sm:pt-14 pb-6 border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Main Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-white/10 text-xs">
          {/* Column 1: Brand Info */}
          <div className="space-y-3">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2 text-left focus:outline-none group cursor-pointer"
            >
              <div className="bg-[#0B2545] border border-emerald-500/30 p-2 rounded-xl text-emerald-400">
                <Home className="w-5 h-5" />
              </div>
              <div className="leading-none">
                <span className="text-lg font-black text-white">Feni </span>
                <span className="text-lg font-black text-emerald-400">House rent</span>
              </div>
            </button>
            <p className="text-slate-400 leading-relaxed text-xs">
              ফেনী শহরের আবাসিক ও বাণিজ্যিক বাসা ভাড়া খোঁজার একমাত্র বিশ্বস্ত ও নিরাপদ প্ল্যাটফর্ম।
            </p>

            {/* Social Icons */}
            <div className="flex items-center space-x-2 pt-2">
              {settings.fbLink && (
                <a
                  href={settings.fbLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-white/10 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center transition-colors"
                  title="Facebook"
                >
                  <span className="font-bold text-xs">f</span>
                </a>
              )}
              {settings.waLink && (
                <a
                  href={getWhatsappUrl(settings.waLink)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-white/10 hover:bg-emerald-600 text-white rounded-lg flex items-center justify-center transition-colors"
                  title="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
              {settings.ytLink && (
                <a
                  href={settings.ytLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-white/10 hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition-colors"
                  title="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {settings.tgLink && (
                <a
                  href={settings.tgLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-white/10 hover:bg-sky-500 text-white rounded-lg flex items-center justify-center transition-colors"
                  title="Telegram"
                >
                  <Send className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-bold text-white text-sm mb-3">গুরুত্বপূর্ণ লিংক</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a href="#home" className="hover:text-emerald-400 transition-colors">
                  হোম পেজ
                </a>
              </li>
              <li>
                <a href="#properties" className="hover:text-emerald-400 transition-colors">
                  বাসা ও মেসের তালিকা
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">
                  পেমেন্ট পদ্ধতি
                </a>
              </li>
              <li>
                <button onClick={onOpenAdmin} className="hover:text-emerald-400 transition-colors text-left cursor-pointer">
                  অ্যাডমিন লগইন
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Services */}
          <div>
            <h4 className="font-bold text-white text-sm mb-3">ক্যাটাগরি সমূহ</h4>
            <ul className="space-y-2 text-slate-400">
              <li>ফ্যামিলি বাসা (Family House)</li>
              <li>ব্যাচেলর মেস (Bachelor Room)</li>
              <li>সিঙ্গেল রুম ও সাবলেট</li>
              <li>বাণিজ্যিক স্পেস ও ফ্ল্যাট</li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div>
            <h4 className="font-bold text-white text-sm mb-3">যোগাযোগ</h4>
            <ul className="space-y-2.5 text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>{settings.address || 'ট্রাঙ্ক রোড, ফেনী সদর, ফেনী'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <a href={`tel:${settings.helpPhone}`} className="hover:underline">
                  {settings.helpPhone || '01812-345678'}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:underline">
                  {settings.email || 'support@fenihouserent.com'}
                </a>
              </li>
            </ul>

            <div className="mt-4 pt-3 border-t border-white/10">
              <p className="text-[11px] font-bold text-slate-400 mb-1.5">অনুমোদিত পেমেন্ট গেটওয়ে:</p>
              <span className="inline-flex items-center gap-1.5 bg-[#D12053] text-white font-extrabold px-3 py-1 rounded-lg text-xs shadow-xs">
                <span className="w-2 h-2 rounded-full bg-white"></span> bKash Personal
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-3">
          <p>© 2026 Feni House Rent. সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex items-center space-x-4">
            <span className="text-slate-600">গোপনীয়তা নীতি</span>
            <span>•</span>
            <button onClick={onOpenAdmin} className="text-slate-500 hover:text-slate-300 cursor-pointer">
              অ্যাডমিন পোর্টাল
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
