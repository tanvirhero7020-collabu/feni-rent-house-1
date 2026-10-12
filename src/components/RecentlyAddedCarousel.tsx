import React, { useRef } from 'react';
import { Sparkles, ChevronLeft, ChevronRight, MapPin, Bed, Bath, Maximize2, Unlock, Phone, Star, Share2 } from 'lucide-react';
import { Property, SiteSettings } from '../types';

interface RecentlyAddedCarouselProps {
  properties: Property[];
  isUnlocked: boolean;
  settings: SiteSettings;
  onUnlockClick: (property: Property) => void;
  onLeaveReviewClick?: (property: Property) => void;
  showToast?: (msg: string) => void;
  onViewDetails?: (property: Property) => void;
}

export const RecentlyAddedCarousel: React.FC<RecentlyAddedCarouselProps> = ({
  properties,
  isUnlocked,
  settings,
  onUnlockClick,
  onLeaveReviewClick,
  showToast,
  onViewDetails
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Take the 6 newest properties
  const recentList = properties.slice(0, 6);
  if (recentList.length === 0) return null;

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const getOptimizedImg = (url: string) => {
    if (!url) return 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=70';
    if (url.includes('images.unsplash.com')) {
      const base = url.split('?')[0];
      return `${base}?auto=format&fit=crop&w=400&q=70`;
    }
    return url;
  };

  return (
    <section className="py-6 sm:py-10 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-4">
        {/* Header Bar with Title & Navigation Arrows */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-800 text-[11px] sm:text-xs font-black px-2.5 py-0.5 rounded-full border border-amber-300 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>সম্প্রতি যোগ করা</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0B2545] tracking-tight">
              নতুন বাসা ও অ্যাপার্টমেন্ট
            </h2>
            <p className="text-xs text-slate-500">
              ফেনী শহরের সর্বশেষ আপডেটেড বাসা ভাড়া বিজ্ঞাপনসমূহ
            </p>
          </div>

          {/* Carousel Arrows */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => handleScroll('left')}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 active:scale-95 flex items-center justify-center text-slate-700 shadow-2xs transition-all cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 active:scale-95 flex items-center justify-center text-slate-700 shadow-2xs transition-all cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Carousel Scroller */}
        <div
          ref={scrollContainerRef}
          className="flex gap-3.5 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-2 -mx-3 px-3 sm:mx-0 sm:px-0"
        >
          {recentList.map((prop, idx) => {
            const ratingScore = prop.avgRating !== undefined ? prop.avgRating : 5.0;
            const revCount = prop.reviewCount !== undefined ? prop.reviewCount : (prop.reviews?.length || 0);

            return (
              <div
                key={prop.id}
                className="w-[260px] xs:w-[290px] sm:w-[320px] flex-shrink-0 snap-start bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Image & Badges */}
                  <div 
                    onClick={() => onViewDetails?.(prop)}
                    className={`relative h-40 sm:h-44 bg-slate-100 overflow-hidden ${onViewDetails ? 'cursor-pointer' : ''}`}
                    title="বিস্তারিত দেখুন"
                  >
                    <img
                      src={getOptimizedImg(prop.image)}
                      alt={prop.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      decoding="async"
                    />
                    {/* Price Tag */}
                    <div className="absolute bottom-2 left-2 bg-[#0B2545]/95 text-white text-xs font-black px-2 py-0.5 rounded-md backdrop-blur-xs">
                      ৳ {prop.price.toLocaleString()} <span className="font-normal text-[10px] text-slate-300">/ মাস</span>
                    </div>
                    {/* New Pill */}
                    <div className="absolute top-2 left-2">
                      <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" /> নতুন #{idx + 1}
                      </span>
                    </div>
                    {/* Category & Availability Pill */}
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      {prop.isAvailable !== false ? (
                        <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs">
                          খালি
                        </span>
                      ) : (
                        <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs">
                          বুকড
                        </span>
                      )}
                      <span className="bg-white/95 text-slate-800 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs backdrop-blur-xs">
                        {prop.category}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-3 sm:p-3.5 space-y-2.5">
                    <div>
                      <div className="flex items-center justify-between gap-1 text-[11px] mb-0.5">
                        <span className="flex items-center gap-1 text-emerald-700 font-bold truncate">
                          <MapPin className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                          <span className="truncate">{prop.location}</span>
                        </span>
                        <span className="flex items-center gap-0.5 text-amber-600 font-bold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 flex-shrink-0">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />
                          <span>{ratingScore.toFixed(1)}</span>
                        </span>
                      </div>
                      <h3 
                        onClick={() => onViewDetails?.(prop)}
                        className={`font-bold text-slate-900 text-xs sm:text-sm line-clamp-1 transition-colors ${
                          onViewDetails ? 'cursor-pointer hover:text-emerald-700 hover:underline' : ''
                        }`}
                        title="বিস্তারিত দেখুন"
                      >
                        {prop.title}
                      </h3>
                    </div>

                    {/* Specs */}
                    <div className="grid grid-cols-3 gap-1 bg-slate-50 p-1.5 rounded-lg border border-slate-100 text-[10px] sm:text-[11px] font-semibold text-slate-600 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Bed className="w-3 h-3 text-[#0B2545]" />
                        <span>{prop.beds} বেড</span>
                      </div>
                      <div className="flex items-center justify-center gap-1 border-x border-slate-200">
                        <Bath className="w-3 h-3 text-[#0B2545]" />
                        <span>{prop.baths} বাথ</span>
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <Maximize2 className="w-3 h-3 text-[#0B2545]" />
                        <span>{prop.sqft} sqft</span>
                      </div>
                    </div>

                    {/* Owner Phone Status */}
                    {isUnlocked ? (
                      <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-0.5">
                        <p className="font-bold text-emerald-950 text-[11px] truncate">মালিক: {prop.ownerName}</p>
                        <a href={`tel:${prop.ownerPhone}`} className="font-extrabold text-emerald-800 text-xs block hover:underline">
                          📞 {prop.ownerPhone}
                        </a>
                      </div>
                    ) : (
                      <div className="relative bg-slate-50 border border-dashed border-slate-200 p-2 rounded-lg text-[11px] overflow-hidden">
                        <div className="blur-locked-text opacity-50">
                          <p className="font-bold">মালিকের মোবাইল নম্বর</p>
                          <p>ঠিকানা ও বাড়িওয়ালার নাম</p>
                        </div>
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center text-center p-1">
                          <span className="text-[10px] font-bold text-amber-900">
                            🔒 ৳ {settings.unlockFee} দিয়ে আনলক করুন
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div className="p-3 sm:p-3.5 pt-0 space-y-1.5">
                  {isUnlocked ? (
                    <>
                      <a
                        href={`tel:${prop.ownerPhone}`}
                        className="w-full min-h-[40px] py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>সরাসরি কল দিন</span>
                      </a>
                      <div className="grid grid-cols-2 gap-1.5">
                        {onLeaveReviewClick && (
                          <button
                            type="button"
                            onClick={() => onLeaveReviewClick(prop)}
                            className="py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          >
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                            <span>রিভিউ ({revCount})</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation();
                            const shareUrl = `${window.location.origin}${window.location.pathname}?property=${prop.id}#property-${prop.id}`;
                            if (navigator.share) {
                              try {
                                await navigator.share({
                                  title: `${prop.title} | Feni House Rent`,
                                  text: `ফেনীতে বাসা খুঁজছেন? ${prop.title}\nএলাকা: ${prop.location}\nভাড়া: ৳${prop.price.toLocaleString()} / মাস\nবিস্তারিত দেখুন:`,
                                  url: shareUrl
                                });
                                if (showToast) showToast('শেয়ার সম্পন্ন হয়েছে!');
                                return;
                              } catch (err: any) {
                                if (err.name === 'AbortError') return;
                              }
                            }
                            try {
                              await navigator.clipboard.writeText(shareUrl);
                              if (showToast) showToast('লিংক কপি করা হয়েছে!');
                            } catch {
                              if (showToast) showToast('লিংক কপি ব্যর্থ হয়েছে');
                            }
                          }}
                          className="py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          title="শেয়ার করুন"
                        >
                          <Share2 className="w-3 h-3 text-slate-600" />
                          <span>শেয়ার</span>
                        </button>
                      </div>
                    </>
                  ) : prop.isAvailable === false ? (
                    <div className="space-y-1">
                      <div className="w-full min-h-[40px] py-2 bg-slate-200 text-slate-600 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-2xs">
                        <span>বুকড হয়ে গেছে</span>
                      </div>
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          const shareUrl = `${window.location.origin}${window.location.pathname}?property=${prop.id}#property-${prop.id}`;
                          if (navigator.share) {
                            try {
                              await navigator.share({
                                title: `${prop.title} | Feni House Rent`,
                                text: `ফেনীতে বাসা খুঁজছেন? ${prop.title}\nএলাকা: ${prop.location}\nভাড়া: ৳${prop.price.toLocaleString()} / মাস\nবিস্তারিত দেখুন:`,
                                url: shareUrl
                              });
                              if (showToast) showToast('শেয়ার সম্পন্ন হয়েছে!');
                              return;
                            } catch (err: any) {
                              if (err.name === 'AbortError') return;
                            }
                          }
                          try {
                            await navigator.clipboard.writeText(shareUrl);
                            if (showToast) showToast('লিংক কপি করা হয়েছে!');
                          } catch {
                            if (showToast) showToast('লিংক কপি ব্যর্থ হয়েছে');
                          }
                        }}
                        className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>শেয়ার করুন</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <button
                        onClick={() => onUnlockClick(prop)}
                        className="w-full min-h-[40px] py-2 bg-[#D12053] hover:bg-[#b81846] active:scale-[0.99] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>৳ {settings.unlockFee} আনলক</span>
                      </button>
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          const shareUrl = `${window.location.origin}${window.location.pathname}?property=${prop.id}#property-${prop.id}`;
                          if (navigator.share) {
                            try {
                              await navigator.share({
                                title: `${prop.title} | Feni House Rent`,
                                text: `ফেনীতে বাসা খুঁজছেন? ${prop.title}\nএলাকা: ${prop.location}\nভাড়া: ৳${prop.price.toLocaleString()} / মাস\nবিস্তারিত দেখুন:`,
                                url: shareUrl
                              });
                              if (showToast) showToast('শেয়ার সম্পন্ন হয়েছে!');
                              return;
                            } catch (err: any) {
                              if (err.name === 'AbortError') return;
                            }
                          }
                          try {
                            await navigator.clipboard.writeText(shareUrl);
                            if (showToast) showToast('লিংক কপি করা হয়েছে!');
                          } catch {
                            if (showToast) showToast('লিংক কপি ব্যর্থ হয়েছে');
                          }
                        }}
                        className="w-full py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>শেয়ার</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
