import React, { useEffect, useState } from 'react';
import { 
  X, 
  MapPin, 
  Bed, 
  Bath, 
  Maximize2, 
  Phone, 
  Unlock, 
  ShieldCheck, 
  Check, 
  Star, 
  Share2, 
  Wifi, 
  Zap, 
  Car, 
  ShieldAlert, 
  Layers, 
  Flame, 
  Copy,
  Sparkles,
  Globe
} from 'lucide-react';
import { Property, SiteSettings } from '../types';
import { generatePageMetadata } from '../hooks/useDynamicHead';

interface PropertyDetailModalProps {
  property: Property | null;
  isOpen: boolean;
  isUnlocked: boolean;
  settings: SiteSettings;
  onClose: () => void;
  onUnlockClick: (property: Property) => void;
  onLeaveReviewClick?: (property: Property) => void;
  showToast?: (msg: string) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  isOpen,
  isUnlocked,
  settings,
  onClose,
  onUnlockClick,
  onLeaveReviewClick,
  showToast
}) => {
  const [copiedShare, setCopiedShare] = useState(false);
  const [showSeoPreview, setShowSeoPreview] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !property) return null;

  const reviewsList = property.reviews || [];
  const reviewCount = property.reviewCount !== undefined ? property.reviewCount : reviewsList.length;
  const ratingScore = property.avgRating !== undefined ? property.avgRating : 5.0;
  const isAvailable = property.isAvailable !== false;

  // Generate metadata preview
  const liveMetadata = generatePageMetadata({
    currentView: 'public',
    selectedProperty: property,
    selectedCategory: 'All',
    selectedLocation: 'All',
    settings
  });

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?property=${property.id}`;
    const shareData = {
      title: `${property.title} | Feni House Rent`,
      text: `ফেনীতে বাসা খুঁজছেন? ${property.title}\nএলাকা: ${property.location}\nভাড়া: ৳${property.price.toLocaleString()}/ মাস\n\nবিস্তারিত দেখুন:`,
      url: shareUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        if (showToast) showToast('শেয়ার সম্পন্ন হয়েছে!');
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const temp = document.createElement('input');
        temp.value = shareUrl;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
      }
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
      if (showToast) showToast('লিংক কপি করা হয়েছে!');
    } catch {
      if (showToast) showToast('লিংক কপি ব্যর্থ হয়েছে');
    }
  };

  const amenities = [
    { icon: Wifi, label: 'ওয়াইফাই সুবিধা' },
    { icon: Flame, label: 'গ্যাস সংযোগ' },
    { icon: Zap, label: 'বিদ্যুৎ ও জেনারেটর' },
    { icon: Layers, label: 'টাইলস ফ্লোর' },
    { icon: Car, label: 'বাইক পার্কিং' },
    { icon: ShieldAlert, label: '২৪/৭ সিসিটিভি নিরাপত্তা' }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200/80 my-auto text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image Bar */}
        <div className="relative h-56 sm:h-72 w-full bg-slate-900 overflow-hidden rounded-t-3xl">
          <img 
            src={property.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'} 
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition-all cursor-pointer z-10"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badges on Image */}
          <div className="absolute top-3.5 left-3.5 flex items-center gap-2 flex-wrap z-10">
            <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
              {property.category}
            </span>
            {isAvailable ? (
              <span className="bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> খালি আছে (Available)
              </span>
            ) : (
              <span className="bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                ভাড়া সম্পন্ন (Booked)
              </span>
            )}
            {property.featured && (
              <span className="bg-amber-500 text-slate-950 text-xs font-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3 fill-current" /> ফিচার্ড
              </span>
            )}
          </div>

          {/* Title & Price on Image Footer */}
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="text-xl sm:text-2xl font-black text-emerald-400 drop-shadow-md">
                ৳ {property.price.toLocaleString()} <span className="text-xs sm:text-sm font-normal text-slate-200">/ মাস</span>
              </span>
              <div className="flex items-center gap-1 text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-1 rounded-lg backdrop-blur-md">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{ratingScore.toFixed(1)}</span>
                <span>({reviewCount} রিভিউ)</span>
              </div>
            </div>
            <h2 className="text-base sm:text-xl font-black mt-1 leading-snug drop-shadow-md">
              {property.title}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5">
          {/* Location & Specs */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-slate-100">
            <div className="flex items-start gap-1.5 text-xs sm:text-sm text-slate-600">
              <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">{property.location}</span>
                <span className="text-slate-500"> • {property.exactAddress}</span>
              </div>
            </div>
            <button
              onClick={handleShare}
              className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedShare ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">কপি হয়েছে</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>শেয়ার করুন</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3">
              <Bed className="w-5 h-5 text-[#0B2545] mx-auto mb-1" />
              <span className="block text-sm sm:text-base font-black text-slate-900">{property.beds} বেড</span>
              <span className="text-[11px] text-slate-500">বেডরুম</span>
            </div>
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3">
              <Bath className="w-5 h-5 text-[#0B2545] mx-auto mb-1" />
              <span className="block text-sm sm:text-base font-black text-slate-900">{property.baths} বাথ</span>
              <span className="text-[11px] text-slate-500">বাথরুম</span>
            </div>
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3">
              <Maximize2 className="w-5 h-5 text-[#0B2545] mx-auto mb-1" />
              <span className="block text-sm sm:text-base font-black text-slate-900">{property.sqft} sqft</span>
              <span className="text-[11px] text-slate-500">মোট আয়তন</span>
            </div>
          </div>

          {/* Features / Amenities */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
              সুযোগ-সুবিধাসমূহ
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {amenities.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 border border-slate-100">
                    <Icon className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Owner Details Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
              <span>বাড়িওয়ালার তথ্য ও যোগাযোগের মাধ্যম</span>
              {isUnlocked ? (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> আনলকড
                </span>
              ) : (
                <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Unlock className="w-3 h-3" /> লকড (ফি ৳{settings.unlockFee})
                </span>
              )}
            </h4>

            {isUnlocked ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500">মালিকের নাম:</span>
                    <h5 className="font-bold text-slate-900 text-base">{property.ownerName}</h5>
                  </div>
                  <a
                    href={`tel:${property.ownerPhone}`}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                    <span>সরাসরি কল দিন</span>
                  </a>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between">
                  <div className="font-mono font-bold text-emerald-900 text-sm sm:text-base">
                    {property.ownerPhone}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(property.ownerPhone);
                      if (showToast) showToast('নম্বর কপি হয়েছে!');
                    }}
                    className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg cursor-pointer"
                    title="কপি করুন"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-600">
                  <strong className="text-slate-800">সঠিক ঠিকানা:</strong> {property.exactAddress}
                </p>
              </div>
            ) : (
              <div className="text-center py-2 space-y-3">
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  বাড়িওয়ালার সরাসরি ফোন নম্বর ও পূর্ণাঙ্গ সঠিক ঠিকানা দেখতে মাত্র <strong>৳ {settings.unlockFee}</strong> ফি পরিশোধ করুন।
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onUnlockClick(property);
                  }}
                  className="w-full py-3 bg-[#D12053] hover:bg-[#b81846] text-white font-extrabold text-sm rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Unlock className="w-4 h-4" />
                  <span>৳ {settings.unlockFee} বিকাশ করে আনলক করুন</span>
                </button>
              </div>
            )}
          </div>

          {/* User Reviews Section */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                গ্রাহকদের রিভিউ ({reviewCount})
              </h4>
              {onLeaveReviewClick && (
                <button
                  onClick={() => {
                    onClose();
                    onLeaveReviewClick(property);
                  }}
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span>রিভিউ দিন</span>
                </button>
              )}
            </div>

            {reviewsList.length === 0 ? (
              <div className="text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                এখনো কোন রিভিউ জমা পড়েনি। আপনিই প্রথম রিভিউ দিন!
              </div>
            ) : (
              <div className="space-y-2 max-h-44 overflow-y-auto">
                {reviewsList.map((rev) => (
                  <div key={rev.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{rev.author}</span>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600">{rev.comment}</p>
                    <span className="text-[10px] text-slate-400 block">{rev.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SEO & Discoverability Inspector */}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => setShowSeoPreview(!showSeoPreview)}
              className="text-[11px] font-bold text-slate-500 hover:text-emerald-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>{showSeoPreview ? 'সার্চ ইঞ্জিন প্রিভিউ (SEO) লুকান' : 'সার্চ ইঞ্জিন প্রিভিউ (SEO) দেখুন'}</span>
            </button>
            {showSeoPreview && (
              <div className="mt-2.5 p-3.5 bg-slate-900 text-slate-200 rounded-2xl text-xs space-y-2 animate-fadeIn font-mono">
                <div>
                  <span className="text-emerald-400 text-[10px] uppercase font-bold block">Document &lt;title&gt; (Search Result Snippet):</span>
                  <div className="text-white font-sans font-bold text-sm bg-white/10 p-2 rounded-lg mt-0.5">
                    {liveMetadata.title}
                  </div>
                </div>
                <div>
                  <span className="text-emerald-400 text-[10px] uppercase font-bold block">&lt;meta name="description"&gt; (Snippet Summary):</span>
                  <div className="text-slate-300 font-sans text-xs bg-white/10 p-2 rounded-lg mt-0.5">
                    {liveMetadata.description}
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Canonical: <span className="text-emerald-300">{liveMetadata.canonicalUrl}</span></span>
                  <span className="bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded text-[10px]">
                    Schema.org Apartment JSON-LD
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="p-4 bg-slate-50 rounded-b-3xl border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            বন্ধ করুন
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-3.5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedShare ? 'কপি হয়েছে' : 'শেয়ার করুন'}</span>
            </button>
            {isUnlocked ? (
              <a
                href={`tel:${property.ownerPhone}`}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>সরাসরি কল দিন</span>
              </a>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onUnlockClick(property);
                }}
                className="px-5 py-2.5 bg-[#D12053] hover:bg-[#b81846] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>৳ {settings.unlockFee} আনলক</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
