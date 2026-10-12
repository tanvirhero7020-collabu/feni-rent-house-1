import React, { useState, useEffect } from 'react';
import { Home, Lock, Unlock, Menu, X, ShieldCheck, PhoneCall, Building2, Sparkles, MessageCircle, RefreshCw } from 'lucide-react';
import { SiteSettings, AutoRefreshInterval } from '../types';
import { RefreshControls } from './RefreshControls';

interface HeaderProps {
  settings: SiteSettings;
  isUnlocked: boolean;
  onOpenUnlockModal: () => void;
  onOpenAdmin: () => void;
  currentView: 'public' | 'admin';
  onSwitchView: (view: 'public' | 'admin') => void;
  isRefreshing: boolean;
  lastRefreshedAt: number | null;
  autoRefreshInterval: AutoRefreshInterval;
  onInstantRefresh: () => void;
  onSetAutoRefreshInterval: (interval: AutoRefreshInterval) => void;
  totalListingsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  isUnlocked,
  onOpenUnlockModal,
  onOpenAdmin,
  currentView,
  onSwitchView,
  isRefreshing,
  lastRefreshedAt,
  autoRefreshInterval,
  onInstantRefresh,
  onSetAutoRefreshInterval,
  totalListingsCount
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const closeMenu = () => setMobileMenuOpen(false);

  const getWhatsappUrl = (val: string) => {
    if (!val) return '';
    if (val.startsWith('http')) return val;
    const clean = val.replace(/[^0-9]/g, '');
    return `https://wa.me/${clean.startsWith('88') ? clean : '88' + clean}`;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-2xs border-b border-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20 gap-2">
          {/* Logo Brand */}
          <button
            onClick={() => {
              onSwitchView('public');
              closeMenu();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 sm:gap-2.5 text-left focus:outline-none group flex-shrink-0 cursor-pointer min-w-0"
          >
            <div className="bg-[#0B2545] p-2 sm:p-2.5 rounded-xl text-emerald-400 group-hover:scale-105 transition-transform shadow-xs flex-shrink-0">
              <Home className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="leading-tight truncate">
              <div className="flex items-center gap-1">
                <span className="text-base xs:text-lg sm:text-2xl font-black text-[#0B2545] tracking-tight">Feni</span>
                <span className="text-base xs:text-lg sm:text-2xl font-black text-emerald-600">House rent</span>
              </div>
              <p className="text-[10px] sm:text-xs font-semibold text-emerald-700 hidden sm:block">
                ফেনীর সেরা বাসা ও মেস ভাড়া পোর্টাল
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-5 lg:space-x-6 text-sm font-semibold text-slate-700">
            <button
              onClick={() => {
                onSwitchView('public');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`cursor-pointer transition-colors pb-0.5 ${
                currentView === 'public'
                  ? 'text-emerald-600 font-bold border-b-2 border-emerald-500'
                  : 'hover:text-emerald-600'
              }`}
            >
              মূল পাতা
            </button>
            <button
              onClick={() => {
                onSwitchView('public');
                document.getElementById('recent-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-emerald-600 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>নতুন বাসা</span>
            </button>
            <button
              onClick={() => {
                onSwitchView('public');
                document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-emerald-600 transition-colors cursor-pointer"
            >
              সব তালিকা
            </button>
            <button
              onClick={() => {
                onSwitchView('public');
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-emerald-600 transition-colors cursor-pointer"
            >
              কীভাবে কাজ করে
            </button>
            <button
              onClick={() => {
                onSwitchView('public');
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-emerald-600 transition-colors cursor-pointer"
            >
              যোগাযোগ
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            {/* Instant In-Place Refresh Controls */}
            <RefreshControls
              isRefreshing={isRefreshing}
              lastRefreshedAt={lastRefreshedAt}
              autoRefreshInterval={autoRefreshInterval}
              onInstantRefresh={onInstantRefresh}
              onSetAutoRefreshInterval={onSetAutoRefreshInterval}
              itemCount={totalListingsCount}
            />

            {/* Discreet Admin Lock Button */}
            <button
              onClick={onOpenAdmin}
              title="অ্যাডমিন প্যানেল"
              className={`p-2 rounded-xl transition-all border cursor-pointer ${
                currentView === 'admin'
                  ? 'bg-[#0B2545] text-emerald-400 border-[#0B2545]'
                  : 'text-slate-500 hover:text-[#0B2545] hover:bg-slate-100 border-slate-200'
              }`}
            >
              <Lock className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>

            {/* Unlock Status / Modal Launcher */}
            {isUnlocked ? (
              <div className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-1.5 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="hidden xs:inline">আনলকড</span>
              </div>
            ) : (
              <button
                onClick={onOpenUnlockModal}
                className="px-2.5 sm:px-4 py-2 sm:py-2.5 text-xs font-bold text-white bg-[#D12053] hover:bg-[#b81846] active:scale-95 rounded-xl shadow-xs transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Unlock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>৳ {settings.unlockFee} আনলক</span>
              </button>
            )}

            {/* Responsive Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 lg:hidden text-slate-700 hover:text-[#0B2545] rounded-xl hover:bg-slate-100 active:scale-95 transition-all border border-slate-200 cursor-pointer flex items-center justify-center"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-red-600" /> : <Menu className="w-5 h-5 text-slate-800" />}
            </button>
          </div>
        </div>
      </div>

      {/* FULL MOBILE RESPONSIVE HAMBURGER DRAWER WITH BACKDROP */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-fadeIn">
          {/* Backdrop Overlay */}
          <div 
            onClick={closeMenu}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Slide-out Menu Panel */}
          <div className="absolute top-0 right-0 w-[85%] max-w-sm h-full bg-white shadow-2xl flex flex-col justify-between p-5 overflow-y-auto animate-slideIn">
            <div className="space-y-5">
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="bg-[#0B2545] p-2 rounded-xl text-emerald-400">
                    <Home className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm leading-tight">Feni House rent</h3>
                    <p className="text-[10px] text-emerald-700 font-semibold">ফেনী বাসা ভাড়া পোর্টাল</p>
                  </div>
                </div>
                <button
                  onClick={closeMenu}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Instant Refresh trigger in mobile drawer */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>তাজা তালিকা সিঙ্ক:</span>
                  <button
                    onClick={() => {
                      onInstantRefresh();
                      closeMenu();
                    }}
                    disabled={isRefreshing}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1 shadow-2xs text-[11px]"
                  >
                    <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>{isRefreshing ? 'লোড হচ্ছে...' : 'রিফ্রেশ'}</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">
                  কোন নতুন বাসা পোস্ট হয়েছে কিনা তাত্ক্ষণিকভাবে দেখুন
                </p>
              </div>

              {/* Navigation Items */}
              <div className="space-y-1 text-sm font-bold text-slate-700">
                <button
                  onClick={() => {
                    onSwitchView('public');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    closeMenu();
                  }}
                  className="w-full p-3 rounded-xl hover:bg-emerald-50 text-slate-800 hover:text-emerald-700 flex items-center gap-3 transition-colors text-left"
                >
                  <Home className="w-5 h-5 text-emerald-600" />
                  <span>হোম পেজ</span>
                </button>
                <button
                  onClick={() => {
                    onSwitchView('public');
                    document.getElementById('recent-section')?.scrollIntoView({ behavior: 'smooth' });
                    closeMenu();
                  }}
                  className="w-full p-3 rounded-xl hover:bg-emerald-50 text-slate-800 hover:text-emerald-700 flex items-center gap-3 transition-colors text-left"
                >
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>নতুন যোগ হওয়া বাসা</span>
                </button>
                <button
                  onClick={() => {
                    onSwitchView('public');
                    document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' });
                    closeMenu();
                  }}
                  className="w-full p-3 rounded-xl hover:bg-emerald-50 text-slate-800 hover:text-emerald-700 flex items-center gap-3 transition-colors text-left"
                >
                  <Building2 className="w-5 h-5 text-emerald-600" />
                  <span>সব বাসা ও ফ্ল্যাট</span>
                </button>
                <button
                  onClick={() => {
                    onSwitchView('public');
                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                    closeMenu();
                  }}
                  className="w-full p-3 rounded-xl hover:bg-emerald-50 text-slate-800 hover:text-emerald-700 flex items-center gap-3 transition-colors text-left"
                >
                  <Unlock className="w-5 h-5 text-[#D12053]" />
                  <span>আনলক প্রক্রিয়া</span>
                </button>
                <button
                  onClick={() => {
                    onSwitchView('public');
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                    closeMenu();
                  }}
                  className="w-full p-3 rounded-xl hover:bg-emerald-50 text-slate-800 hover:text-emerald-700 flex items-center gap-3 transition-colors text-left"
                >
                  <PhoneCall className="w-5 h-5 text-blue-600" />
                  <span>সহায়তা ও যোগাযোগ</span>
                </button>
              </div>

              {/* Direct Quick Contact Buttons */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  সরাসরি হেল্পলাইন
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  {settings.helpPhone && (
                    <a
                      href={`tel:${settings.helpPhone}`}
                      className="p-2.5 bg-slate-100 hover:bg-blue-50 text-slate-800 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                      <span>কল করুন</span>
                    </a>
                  )}
                  {settings.waLink && (
                    <a
                      href={getWhatsappUrl(settings.waLink)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Section: Discreet Admin & Status */}
            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  onOpenAdmin();
                  closeMenu();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>অ্যাডমিন প্রবেশদ্বার</span>
                </div>
                <span className="text-[10px] text-slate-400">মালিকদের জন্য</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
