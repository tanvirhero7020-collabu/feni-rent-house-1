import React, { useState } from 'react';
import { MapPin, Bed, Bath, Maximize2, Phone, Unlock, Check, UserCheck, Star, Share2 } from 'lucide-react';
import { Property, SiteSettings } from '../types';

interface PropertyCardProps {
  property: Property;
  isUnlocked: boolean;
  settings: SiteSettings;
  onUnlockClick: (property: Property) => void;
  onLeaveReviewClick?: (property: Property) => void;
  showToast?: (msg: string) => void;
  onViewDetails?: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  isUnlocked,
  settings,
  onUnlockClick,
  onLeaveReviewClick,
  showToast,
  onViewDetails
}) => {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // High-performance optimized image with width limit and WebP/AVIF format
  const getOptimizedImageUrl = (url: string) => {
    if (!url) return 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=480&q=70';
    if (url.includes('images.unsplash.com')) {
      const base = url.split('?')[0];
      return `${base}?auto=format&fit=crop&w=480&q=70`;
    }
    return url;
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=480&q=70';
  const reviewsList = property.reviews || [];
  const reviewCount = property.reviewCount !== undefined ? property.reviewCount : reviewsList.length;
  const ratingScore = property.avgRating !== undefined ? property.avgRating : 5.0;

  // Handle Web Share API with graceful fallback to clipboard
  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const shareUrl = `${currentOrigin}${currentPath}?property=${property.id}#property-${property.id}`;
    
    const shareData = {
      title: `${property.title} | Feni House Rent`,
      text: `ফেনীতে বাসা খুঁজছেন? ${property.title}\nএলাকা: ${property.location}\nভাড়া: ৳${property.price.toLocaleString()} / মাস\n\nবিস্তারিত দেখুন:`,
      url: shareUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        if (showToast) showToast('শেয়ার সম্পন্ন হয়েছে!');
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return; // User canceled the share prompt
        }
      }
    }

    // Clipboard fallback
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const tempInput = document.createElement('input');
        tempInput.value = shareUrl;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
      }
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
      if (showToast) {
        showToast('বাসার লিংক কপি করা হয়েছে!');
      }
    } catch {
      if (showToast) showToast('লিংক কপি করতে ব্যর্থ হয়েছে');
    }
  };

  return (
    <div 
      id={`property-${property.id}`}
      className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group scroll-mt-24"
    >
      <div>
        {/* Image & Badges */}
        <div 
          onClick={() => onViewDetails?.(property)}
          className={`relative h-44 sm:h-52 w-full bg-slate-100 overflow-hidden ${onViewDetails ? 'cursor-pointer' : ''}`}
          title="বিস্তারিত দেখুন"
        >
          {/* Shimmer skeleton while image loads */}
          {!imgLoaded && !imgError && (
            <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-emerald-500 animate-spin opacity-40" />
            </div>
          )}
          <img
            src={imgError ? fallbackImage : getOptimizedImageUrl(property.image)}
            alt={property.title}
            onError={() => setImgError(true)}
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            decoding="async"
          />

          {/* Price Badge */}
          <div className="absolute bottom-2.5 left-2.5 bg-[#0B2545]/95 text-white text-xs sm:text-sm font-black px-2.5 py-1 rounded-lg backdrop-blur-xs shadow-md">
            ৳ {property.price.toLocaleString()} <span className="font-normal text-[10px] sm:text-xs text-slate-300">/ মাস</span>
          </div>

          {/* Share Button (Top Floating Glass Icon) */}
          <button
            type="button"
            onClick={handleShare}
            title="শেয়ার করুন"
            className="absolute bottom-2.5 right-2.5 bg-white/90 hover:bg-white active:scale-90 text-slate-700 hover:text-emerald-600 p-2 rounded-xl shadow-md backdrop-blur-xs transition-all flex items-center gap-1 cursor-pointer z-10"
            aria-label="Share Property"
          >
            {copiedShare ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
            <span className="text-[10px] font-bold text-slate-800 hidden xs:inline">
              {copiedShare ? 'কপি হয়েছে' : 'শেয়ার'}
            </span>
          </button>

          {/* Unlocked / Locked Pill & Availability Pill */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 flex-wrap justify-end">
            {property.isAvailable !== false ? (
              <span className="bg-emerald-600 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
                খালি আছে
              </span>
            ) : (
              <span className="bg-red-600 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
                বুকড হয়ে গেছে
              </span>
            )}
            {isUnlocked ? (
              <span className="bg-emerald-700 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                <Check className="w-3 h-3" /> আনলকড
              </span>
            ) : (
              <span className="bg-amber-600 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                <Unlock className="w-2.5 h-2.5" /> লক করা
              </span>
            )}
          </div>

          {/* Category Chip */}
          <div className="absolute top-2.5 left-2.5">
            <span className="bg-white/95 text-emerald-900 text-[10px] sm:text-xs font-extrabold px-2.5 py-0.5 rounded-md shadow-xs backdrop-blur-xs border border-emerald-100">
              {property.category}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-3.5 sm:p-4 space-y-3">
          {/* Location & Rating row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-[11px] sm:text-xs text-emerald-700 font-bold">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>{property.location}</span>
            </div>
            {/* 5-Star Rating Badge */}
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
              <span>{ratingScore.toFixed(1)}</span>
              <span className="text-slate-400 font-medium">({reviewCount})</span>
            </div>
          </div>

          {/* Title with details trigger */}
          <div className="flex items-start justify-between gap-2">
            <h3 
              onClick={() => onViewDetails?.(property)}
              className={`font-bold text-slate-900 text-sm sm:text-base line-clamp-2 leading-snug transition-colors flex-1 ${
                onViewDetails ? 'cursor-pointer hover:text-emerald-700 hover:underline' : ''
              }`}
              title="বিস্তারিত জানতে ক্লিক করুন"
            >
              {property.title}
            </h3>
          </div>

          {/* Room Specs */}
          <div className="grid grid-cols-3 gap-1 bg-slate-50 p-2 sm:p-2.5 rounded-xl border border-slate-100 text-[11px] sm:text-xs font-semibold text-slate-600 text-center">
            <div className="flex items-center justify-center gap-1">
              <Bed className="w-3.5 h-3.5 text-[#0B2545]" />
              <span>{property.beds} বেড</span>
            </div>
            <div className="flex items-center justify-center gap-1 border-x border-slate-200">
              <Bath className="w-3.5 h-3.5 text-[#0B2545]" />
              <span>{property.baths} বাথ</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <Maximize2 className="w-3.5 h-3.5 text-[#0B2545]" />
              <span>{property.sqft} sqft</span>
            </div>
          </div>

          {/* Owner details: Blurred or Unlocked */}
          {isUnlocked ? (
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs sm:text-sm space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-950 font-bold">
                  <UserCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>মালিক: {property.ownerName}</span>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  যাচাইকৃত
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-900 font-black text-sm sm:text-base">
                <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <a href={`tel:${property.ownerPhone}`} className="hover:underline text-emerald-800">
                  {property.ownerPhone}
                </a>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-tight flex items-start gap-1 pt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                <span>{property.exactAddress}</span>
              </p>
            </div>
          ) : (
            <div className="relative bg-slate-50 border border-dashed border-slate-300 p-3 rounded-xl text-xs overflow-hidden">
              <div className="blur-locked-text space-y-0.5 opacity-60">
                <p className="font-bold text-slate-800">মালিকের নাম ও ফোন নম্বর</p>
                <p className="font-bold text-slate-800">বাসার সঠিক হোল্ডিং ও রোড নম্বর</p>
                <p className="text-slate-500 text-[10px]">ফি পরিশোধ করে সরাসরি যোগাযোগ করুন</p>
              </div>
              <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px] flex items-center justify-center p-2 text-center">
                <p className="text-[11px] sm:text-xs font-bold text-amber-900 leading-tight">
                  🔒 মাত্র ৳ {settings.unlockFee} দিয়ে মালিকের মোবাইল ও সঠিক ঠিকানা দেখুন
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Action Buttons with Touch-Friendly Height */}
      <div className="p-3.5 sm:p-4 pt-0 space-y-2">
        {isUnlocked ? (
          <div className="space-y-2">
            <a
              href={`tel:${property.ownerPhone}`}
              className="w-full min-h-[44px] py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>সরাসরি কল করুন</span>
            </a>
            <div className="grid grid-cols-2 gap-1.5">
              {/* Leave 5-Star Rating / Review Action Button */}
              {onLeaveReviewClick && (
                <button
                  type="button"
                  onClick={() => onLeaveReviewClick(property)}
                  className="min-h-[38px] py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 active:scale-[0.99] text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span>রিভিউ ({reviewCount})</span>
                </button>
              )}
              {/* Share Button in bottom row */}
              <button
                type="button"
                onClick={handleShare}
                className="min-h-[38px] py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 active:scale-[0.99] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedShare ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Share2 className="w-3.5 h-3.5 text-slate-600" />
                )}
                <span>{copiedShare ? 'কপি হয়েছে' : 'শেয়ার'}</span>
              </button>
            </div>
          </div>
        ) : property.isAvailable === false ? (
          <div className="space-y-1.5">
            <div className="w-full min-h-[44px] py-2.5 bg-slate-200 text-slate-600 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-2xs">
              <span>ভাড়া সম্পন্ন (Booked)</span>
            </div>
            <button
              type="button"
              onClick={handleShare}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedShare ? 'কপি হয়েছে' : 'শেয়ার করুন'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            <button
              onClick={() => onUnlockClick(property)}
              className="w-full min-h-[44px] py-2.5 bg-[#D12053] hover:bg-[#b81846] active:scale-[0.99] text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>৳ {settings.unlockFee} দিয়ে আনলক করুন</span>
            </button>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => onViewDetails?.(property)}
                className="py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <span>বিস্তারিত</span>
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedShare ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>{copiedShare ? 'কপি হয়েছে' : 'শেয়ার'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
