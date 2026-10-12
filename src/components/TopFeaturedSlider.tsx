import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Bed, Bath, Maximize2, Sparkles, CheckCircle2, XCircle, Unlock, Phone, Star, Share2 } from 'lucide-react';
import { Property, SiteSettings } from '../types';

interface TopFeaturedSliderProps {
  properties: Property[];
  isUnlocked: boolean;
  settings: SiteSettings;
  onUnlockClick: (property: Property) => void;
  onLeaveReviewClick?: (property: Property) => void;
  showToast?: (msg: string) => void;
  onViewDetails?: (property: Property) => void;
}

export const TopFeaturedSlider: React.FC<TopFeaturedSliderProps> = ({
  properties,
  isUnlocked,
  settings,
  onUnlockClick,
  onLeaveReviewClick,
  showToast,
  onViewDetails
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Take featured properties or first 5 properties
  const sliderItems = properties.length > 0
    ? (properties.filter(p => p.featured).length > 0 ? properties.filter(p => p.featured) : properties.slice(0, 5))
    : [];

  useEffect(() => {
    if (sliderItems.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sliderItems.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [sliderItems.length, isPaused]);

  if (sliderItems.length === 0) return null;

  const currentProp = sliderItems[currentIndex];
  const isAvailable = currentProp.isAvailable !== false;
  const ratingScore = currentProp.avgRating !== undefined ? currentProp.avgRating : 5.0;
  const reviewCount = currentProp.reviewCount !== undefined ? currentProp.reviewCount : (currentProp.reviews?.length || 0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + sliderItems.length) % sliderItems.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % sliderItems.length);
  };

  const getOptimizedImg = (url: string) => {
    if (!url) return 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=75';
    if (url.includes('images.unsplash.com')) {
      const base = url.split('?')[0];
      return `${base}?auto=format&fit=crop&w=900&q=75`;
    }
    return url;
  };

  return (
    <div 
      className="relative w-full overflow-hidden bg-slate-900 border-y border-white/10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Slider Card Container */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[360px] xs:h-[400px] sm:h-[430px] md:h-[470px] bg-slate-950 flex items-end">
          {/* Background Image with Zoom transition */}
          <img
            key={currentProp.id}
            src={getOptimizedImg(currentProp.image)}
            alt={currentProp.title}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out scale-100 hover:scale-105"
            loading="eager"
          />

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-transparent hidden sm:block" />

          {/* Top Tag Bar */}
          <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2 z-20 flex-wrap">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="bg-amber-500 text-slate-950 text-[10px] sm:text-xs font-black px-2.5 sm:px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 uppercase tracking-wide">
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>ফিচার্ড বাসা</span>
              </span>
              {/* Status Badge: Available vs Unavailable */}
              {isAvailable ? (
                <span className="bg-emerald-500 text-white text-[10px] sm:text-xs font-black px-2.5 sm:px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ভাড়া হবে (Available)</span>
                </span>
              ) : (
                <span className="bg-red-600 text-white text-[10px] sm:text-xs font-black px-2.5 sm:px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>ভাড়া সম্পন্ন (Booked)</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {/* Star Rating Badge */}
              <div className="bg-black/60 backdrop-blur-md text-amber-400 text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-xl shadow-md flex items-center gap-1 border border-white/10">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{ratingScore.toFixed(1)}</span>
                <span className="text-white/60">({reviewCount})</span>
              </div>
              <span className="bg-white/90 backdrop-blur-md text-slate-900 text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-xl shadow-md">
                {currentProp.category}
              </span>
            </div>
          </div>

          {/* Bottom Card Content */}
          <div className="relative z-20 p-4 sm:p-8 w-full max-w-3xl space-y-2 sm:space-y-3 text-white">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-400 font-bold flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{currentProp.location}</span>
              </span>
              <span className="text-white/40">•</span>
              <span className="text-emerald-300 font-extrabold text-sm sm:text-base">
                ৳ {currentProp.price.toLocaleString()} / মাস
              </span>
            </div>

            <h2 
              onClick={() => onViewDetails?.(currentProp)}
              className={`text-base xs:text-lg sm:text-2xl lg:text-3xl font-black leading-snug tracking-tight drop-shadow-md line-clamp-2 ${
                onViewDetails ? 'cursor-pointer hover:text-emerald-300 transition-colors' : ''
              }`}
              title="বিস্তারিত দেখতে ক্লিক করুন"
            >
              {currentProp.title}
            </h2>

            {/* Room Specs */}
            <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm font-bold text-slate-200 flex-wrap">
              <span className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/5">
                <Bed className="w-3.5 h-3.5 text-emerald-400" /> {currentProp.beds} বেড
              </span>
              <span className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/5">
                <Bath className="w-3.5 h-3.5 text-emerald-400" /> {currentProp.baths} বাথ
              </span>
              <span className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/5">
                <Maximize2 className="w-3.5 h-3.5 text-emerald-400" /> {currentProp.sqft} sqft
              </span>
            </div>

            {/* Action Call */}
            <div className="pt-2 flex items-center gap-2.5 flex-wrap">
              {isUnlocked ? (
                <>
                  <a
                    href={`tel:${currentProp.ownerPhone}`}
                    className="min-h-[44px] px-4 sm:px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-xs sm:text-sm shadow-lg flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Phone className="w-4 h-4" />
                    <span>কল করুন ({currentProp.ownerPhone})</span>
                  </a>
                  {onLeaveReviewClick && (
                    <button
                      type="button"
                      onClick={() => onLeaveReviewClick(currentProp)}
                      className="min-h-[44px] px-3.5 py-2.5 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl text-xs sm:text-sm backdrop-blur-md flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>রিভিউ দিন</span>
                    </button>
                  )}
                </>
              ) : isAvailable ? (
                <button
                  onClick={() => onUnlockClick(currentProp)}
                  className="min-h-[44px] px-4 sm:px-5 py-2.5 bg-[#D12053] hover:bg-[#b81846] text-white font-black rounded-xl text-xs sm:text-sm shadow-lg flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Unlock className="w-4 h-4" />
                  <span>৳ {settings.unlockFee} দিয়ে মালিকের নম্বর দেখুন</span>
                </button>
              ) : (
                <span className="px-3.5 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold border border-white/10">
                  বাসাটি বুকড হয়ে গেছে
                </span>
              )}

              {/* Details View Button */}
              {onViewDetails && (
                <button
                  type="button"
                  onClick={() => onViewDetails(currentProp)}
                  className="min-h-[44px] px-3.5 py-2.5 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl text-xs sm:text-sm backdrop-blur-md flex items-center gap-1.5 transition-all cursor-pointer"
                  title="বিস্তারিত দেখুন"
                >
                  <span>বিস্তারিত</span>
                </button>
              )}

              {/* Share Button in Featured Card */}
              <button
                type="button"
                onClick={async () => {
                  const shareUrl = `${window.location.origin}${window.location.pathname}?property=${currentProp.id}#property-${currentProp.id}`;
                  if (navigator.share) {
                    try {
                      await navigator.share({
                        title: `${currentProp.title} | Feni House Rent`,
                        text: `ফেনীতে বাসা খুঁজছেন? ${currentProp.title}\nএলাকা: ${currentProp.location}\nভাড়া: ৳${currentProp.price.toLocaleString()} / মাস\nবিস্তারিত দেখুন:`,
                        url: shareUrl
                      });
                      if (showToast) showToast('শেয়ার সম্পন্ন হয়েছে!');
                      return;
                    } catch (e: any) {
                      if (e.name === 'AbortError') return;
                    }
                  }
                  try {
                    await navigator.clipboard.writeText(shareUrl);
                    if (showToast) showToast('লিংক কপি করা হয়েছে!');
                  } catch {
                    if (showToast) showToast('লিংক কপি ব্যর্থ হয়েছে');
                  }
                }}
                className="min-h-[44px] px-3.5 py-2.5 bg-white/15 hover:bg-white/25 active:scale-95 text-white font-bold rounded-xl text-xs sm:text-sm backdrop-blur-md flex items-center gap-1.5 transition-all cursor-pointer"
                title="শেয়ার করুন"
              >
                <Share2 className="w-4 h-4" />
                <span>শেয়ার</span>
              </button>
            </div>
          </div>

          {/* Navigation Arrows */}
          <div className="absolute right-3.5 bottom-3.5 z-20 flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-lg"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={handleNext}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-lg"
              aria-label="Next slide"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Dot Indicators */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
            {sliderItems.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  currentIndex === idx ? 'w-6 bg-emerald-400' : 'w-2 bg-white/40'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
