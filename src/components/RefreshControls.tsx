import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Zap, Check, Clock, ChevronDown } from 'lucide-react';
import { AutoRefreshInterval } from '../types';

interface RefreshControlsProps {
  isRefreshing: boolean;
  lastRefreshedAt: number | null;
  autoRefreshInterval: AutoRefreshInterval;
  onInstantRefresh: () => void;
  onSetAutoRefreshInterval: (interval: AutoRefreshInterval) => void;
  itemCount?: number;
}

export const RefreshControls: React.FC<RefreshControlsProps> = ({
  isRefreshing,
  lastRefreshedAt,
  autoRefreshInterval,
  onInstantRefresh,
  onSetAutoRefreshInterval,
  itemCount
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [relativeTime, setRelativeTime] = useState<string>('এইমাত্র');
  const [nextRefreshSeconds, setNextRefreshSeconds] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update relative time label every 5 seconds
  useEffect(() => {
    const updateRelative = () => {
      if (!lastRefreshedAt) {
        setRelativeTime('এইমাত্র');
        return;
      }
      const diffSec = Math.floor((Date.now() - lastRefreshedAt) / 1000);
      if (diffSec < 10) {
        setRelativeTime('এইমাত্র');
      } else if (diffSec < 60) {
        setRelativeTime(`${diffSec} সেকেন্ড আগে`);
      } else {
        const mins = Math.floor(diffSec / 60);
        setRelativeTime(`${mins} মিনিট আগে`);
      }
    };
    updateRelative();
    const timer = setInterval(updateRelative, 5000);
    return () => clearInterval(timer);
  }, [lastRefreshedAt]);

  // Countdown timer for auto-refresh mode
  useEffect(() => {
    if (autoRefreshInterval === 'off') {
      setNextRefreshSeconds(null);
      return;
    }
    const intervalSecMap: Record<string, number> = {
      '10s': 10,
      '20s': 20,
      '45s': 45,
      '60s': 60
    };
    const targetSec = intervalSecMap[autoRefreshInterval] || 20;
    setNextRefreshSeconds(targetSec);

    const ticker = setInterval(() => {
      setNextRefreshSeconds((prev) => {
        if (prev === null || prev <= 1) {
          return targetSec;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(ticker);
  }, [autoRefreshInterval, lastRefreshedAt]);

  const intervalLabels: { key: AutoRefreshInterval; label: string; desc: string }[] = [
    { key: 'off', label: 'বন্ধ (Manual)', desc: 'কীবোর্ডে "R" চেপে রিফ্রেশ করুন' },
    { key: '10s', label: '১০ সেকেন্ড (Fast)', desc: 'নতুন বাসা পোস্টের দ্রুত আপডেট' },
    { key: '20s', label: '২০ সেকেন্ড (Standard)', desc: 'স্মুথ লাইভ সিঙ্ক মোড' },
    { key: '45s', label: '৪৫ সেকেন্ড', desc: 'ডাটা সাশ্রয়ী মোড' },
    { key: '60s', label: '১ মিনিট', desc: 'সাধারণ পর্যবেক্ষণ মোড' }
  ];

  return (
    <div className="relative inline-flex items-center" ref={menuRef}>
      <div className="flex items-center bg-white/95 border border-slate-200/90 rounded-xl shadow-2xs p-0.5 transition-all hover:border-emerald-400">
        {/* Instant Soft Reload Action Button */}
        <button
          onClick={onInstantRefresh}
          disabled={isRefreshing}
          title="তাৎক্ষণিক রিফ্রেশ করুন (শর্টকাট: R)"
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-slate-800 hover:text-emerald-700 hover:bg-emerald-50/70 active:scale-95 rounded-lg transition-all cursor-pointer disabled:opacity-60"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 text-emerald-600 ${
              isRefreshing ? 'animate-spin text-emerald-500' : ''
            }`}
          />
          <span className="hidden xs:inline">
            {isRefreshing ? 'লোড হচ্ছে...' : 'রিফ্রেশ'}
          </span>
          <span className="xs:hidden">
            {isRefreshing ? '...' : 'সিঙ্ক'}
          </span>
          {/* Live indicator dot / countdown if auto-refresh is active */}
          {autoRefreshInterval !== 'off' && nextRefreshSeconds !== null && (
            <span className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-100/90 px-1.5 py-0.2 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{nextRefreshSeconds}s</span>
            </span>
          )}
        </button>

        {/* Divider */}
        <div className="h-4 w-[1px] bg-slate-200 my-auto" />

        {/* Dropdown toggle for Auto-Refresh intervals */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          title="অটো রিফ্রেশ বিরতি নির্ধারণ করুন"
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dropdown Menu for Refresh Mode */}
      {menuOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-fadeIn space-y-2.5">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-black text-slate-900">ইনস্ট্যান্ট রিলোড ইঞ্জিন</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400">রিয়েল-টাইম সিঙ্ক</span>
          </div>

          {/* Current Status banner */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>সর্বশেষ আপডেট: <strong>{relativeTime}</strong></span>
            </div>
            {itemCount !== undefined && (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded">
                {itemCount} বাসা
              </span>
            )}
          </div>

          {/* Options List */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block px-1">
              স্বয়ংক্রিয় রিফ্রেশ সময়
            </label>
            {intervalLabels.map((item) => {
              const isSelected = autoRefreshInterval === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    onSetAutoRefreshInterval(item.key);
                    setMenuOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-xl transition-all flex items-start justify-between gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className={isSelected ? 'text-emerald-700' : 'text-slate-800'}>
                        {item.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      {item.desc}
                    </p>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Shortcut hint */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>শর্টকাট: <kbd className="bg-slate-100 border border-slate-300 px-1 py-0.5 rounded text-slate-600 font-mono font-bold">R</kbd></span>
            <span className="text-emerald-600 font-semibold">ফ্লিকার-মুক্ত সিঙ্ক</span>
          </div>
        </div>
      )}
    </div>
  );
};
