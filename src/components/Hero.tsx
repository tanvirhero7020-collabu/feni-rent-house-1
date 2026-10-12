import React from 'react';
import { Search, Filter } from 'lucide-react';
import { SiteSettings } from '../types';

interface HeroProps {
  settings: SiteSettings;
  categories: string[];
  totalProperties: number;
  selectedLocation: string;
  selectedCategory: string;
  selectedAvailability: string;
  searchQuery: string;
  onLocationChange: (loc: string) => void;
  onCategoryChange: (cat: string) => void;
  onAvailabilityChange: (avail: string) => void;
  onSearchQueryChange: (query: string) => void;
  onFilterSubmit: () => void;
}

const FENI_LOCATIONS = [
  { value: 'All', label: 'সকল এলাকা (All Locations)' },
  { value: 'Feni Sadar', label: 'ফেনী সদর (Feni Sadar)' },
  { value: 'Daganbhuiyan', label: 'দাগনভূঞা (Daganbhuiyan)' },
  { value: 'Sonagazi', label: 'সোনাগাজী (Sonagazi)' },
  { value: 'Parshuram', label: 'পরশুরাম (Parshuram)' },
  { value: 'Chhagalnaiya', label: 'ছাগলনাইয়া (Chhagalnaiya)' },
  { value: 'Fulgazi', label: 'ফুলগাজী (Fulgazi)' }
];

export const Hero: React.FC<HeroProps> = ({
  settings,
  categories,
  totalProperties,
  selectedLocation,
  selectedCategory,
  selectedAvailability,
  searchQuery,
  onLocationChange,
  onCategoryChange,
  onAvailabilityChange,
  onSearchQueryChange,
  onFilterSubmit
}) => {
  return (
    <section id="home" className="relative overflow-hidden text-white bg-[#0B2545] py-8 sm:py-14 lg:py-20 px-3 sm:px-6 lg:px-8">
      {/* Background with luxury property photo and deep navy overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-25 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=75')`
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#07182D]/95 via-[#0B2545]/90 to-[#0B2545] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Text & Stats */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center sm:text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-500/15 text-emerald-300 px-3 sm:px-4 py-1.5 rounded-full border border-emerald-500/30 text-xs sm:text-sm font-semibold backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>ফেনীর বিশ্বস্ত বাসা ও ফ্ল্যাট টু-লেট পোর্টাল</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black leading-snug tracking-tight text-white">
              ফেনীতে আপনার পছন্দের বাসা <br className="hidden sm:inline" />
              <span className="text-emerald-400 inline-block mt-1 sm:mt-0">খুঁজে নিন সহজে ও নিরাপদে</span>
            </h1>

            {/* Description */}
            <p className="text-xs sm:text-base text-slate-200 max-w-xl mx-auto sm:mx-0 leading-relaxed font-normal">
              দালালমুক্ত ও সরাসরি মালিকের সাথে যোগাযোগের সুবিধা। মাত্র{' '}
              <strong className="text-emerald-400 font-black text-sm sm:text-lg underline decoration-emerald-500/50">
                ৳ {settings.unlockFee}
              </strong>{' '}
              ফি পরিশোধ করে ভেরিফাইড মালিকের ফোন নম্বর ও সঠিক ঠিকানা আনলক করুন।
            </p>

            {/* Stats Metrics */}
            <div className="pt-2 sm:pt-4 grid grid-cols-3 gap-2 sm:gap-4 border-t border-white/10 text-center sm:text-left">
              <div className="bg-white/5 sm:bg-transparent p-2 sm:p-0 rounded-xl backdrop-blur-xs">
                <h3 className="text-lg xs:text-xl sm:text-3xl font-black text-emerald-400">
                  {totalProperties}+
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-300 font-medium">যাচাইকৃত বাসা</p>
              </div>
              <div className="bg-white/5 sm:bg-transparent p-2 sm:p-0 rounded-xl backdrop-blur-xs">
                <h3 className="text-lg xs:text-xl sm:text-3xl font-black text-emerald-400">১০০%</h3>
                <p className="text-[11px] sm:text-xs text-slate-300 font-medium">সরাসরি মালিক</p>
              </div>
              <div className="bg-white/5 sm:bg-transparent p-2 sm:p-0 rounded-xl backdrop-blur-xs">
                <h3 className="text-lg xs:text-xl sm:text-3xl font-black text-pink-400">bKash</h3>
                <p className="text-[11px] sm:text-xs text-slate-300 font-medium">নিরাপদ পেমেন্ট</p>
              </div>
            </div>
          </div>

          {/* Right Column: Search & Filter Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-slate-800 shadow-2xl border border-white/20">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Filter className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-[#0B2545]">বাসা খুঁজুন</h3>
                </div>
                <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-md text-[11px] font-bold">
                  তাৎক্ষণিক ফিল্টার
                </span>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onFilterSubmit();
                }}
                className="space-y-3 sm:space-y-4"
              >
                {/* Search Text */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">কীওয়ার্ড বা এলাকা</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchQueryChange(e.target.value)}
                    placeholder="যেমন: ট্রাঙ্ক রোড, মাস্টারপাড়া, ৩ রুম..."
                    className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none font-medium text-sm text-slate-800"
                  />
                </div>

                {/* Location Select */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">উপজেলা / এলাকা</label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => onLocationChange(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none font-medium text-sm text-slate-800 cursor-pointer"
                  >
                    {FENI_LOCATIONS.map((loc) => (
                      <option key={loc.value} value={loc.value}>
                        {loc.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Select */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">বাসার ধরন</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => onCategoryChange(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none font-medium text-sm text-slate-800 cursor-pointer"
                  >
                    <option value="All">সকল ক্যাটাগরি (All Categories)</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Availability Filter Option */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">লভ্যতা (Availability)</label>
                  <select
                    value={selectedAvailability}
                    onChange={(e) => onAvailabilityChange(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none font-medium text-sm text-slate-800 cursor-pointer"
                  >
                    <option value="All">সব বাসা (সকল স্ট্যাটাস)</option>
                    <option value="Available">শুধুমাত্র খালি বাসা (Available)</option>
                    <option value="Booked">ভাড়া হয়ে গেছে (Booked)</option>
                  </select>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full min-h-[44px] py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 text-xs sm:text-sm cursor-pointer"
                >
                  <Search className="w-4 h-4 mr-1" />
                  <span>বাসা খুঁজুন</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
