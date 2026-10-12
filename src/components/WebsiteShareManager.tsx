import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Copy, 
  Check, 
  Share2, 
  QrCode, 
  ExternalLink, 
  MessageCircle, 
  Download, 
  Send, 
  Eye, 
  Printer, 
  Sparkles 
} from 'lucide-react';
import QRCode from 'qrcode';

interface WebsiteShareManagerProps {
  customUrl?: string;
  onOpenCustomerView?: () => void;
  showToast: (msg: string) => void;
  variant?: 'card' | 'modal' | 'compact';
  isOpen?: boolean;
  onClose?: () => void;
}

export const WebsiteShareManager: React.FC<WebsiteShareManagerProps> = ({
  customUrl,
  onOpenCustomerView,
  showToast,
  variant = 'card',
  isOpen = false,
  onClose
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPost, setCopiedPost] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Compute the clean public customer entry URL
  const publicUrl = React.useMemo(() => {
    if (customUrl && customUrl.trim().startsWith('http')) {
      return customUrl.trim();
    }
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      return origin;
    }
    return 'https://fenihouserent.com';
  }, [customUrl]);

  // Generate promotional invitation message in Bengali
  const promoMessage = React.useMemo(() => {
    return `ফেনীতে বাসা বা মেস খুঁজছেন? (Feni House Rent)\nসরাসরি বাড়িওয়ালার সাথে যোগাযোগের সেরা ঠিকানা!\n\nবাসা দেখতে ভিজিট করুন: ${publicUrl}`;
  }, [publicUrl]);

  // Generate QR Code image when URL changes
  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(publicUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#0B2545',
        light: '#FFFFFF'
      }
    })
      .then((url) => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch((err) => console.error('QR code generation error:', err));
    return () => {
      isMounted = false;
    };
  }, [publicUrl]);

  // Copy website URL to clipboard
  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(publicUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = publicUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedLink(true);
      showToast('ওয়েবসাইট লিংক কপি হয়েছে!');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      showToast('লিংক কপি করা যায়নি');
    }
  };

  // Copy promotional post message to clipboard
  const handleCopyPromo = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(promoMessage);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = promoMessage;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedPost(true);
      showToast('বিজ্ঞাপন পোস্ট কপি হয়েছে!');
      setTimeout(() => setCopiedPost(false), 2500);
    } catch {
      showToast('পোস্ট কপি করা যায়নি');
    }
  };

  // Native share sheet (for mobile & desktop supporting Web Share API)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Feni House Rent - সেরা বাসা ও মেস ভাড়া পোর্টাল',
          text: promoMessage,
          url: publicUrl
        });
        showToast('শেয়ার সম্পন্ন হয়েছে!');
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  // Share directly to WhatsApp
  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(promoMessage);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  // Share directly to Facebook
  const handleFacebookShare = () => {
    const encoded = encodeURIComponent(publicUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encoded}`, '_blank');
  };

  // Open the public website
  const handleOpenCustomerWebsite = () => {
    if (onOpenCustomerView) {
      onOpenCustomerView();
    } else {
      window.open(publicUrl, '_blank');
    }
  };

  // Download QR Code as PNG file
  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = 'feni-house-rent-website-qr.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('QR কোড ডাউনলোড সম্পন্ন!');
  };

  // Print QR Code display
  const handlePrintQr = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Feni House Rent - QR Code</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 40px; }
            h1 { color: #0B2545; margin-bottom: 8px; }
            p { color: #64748b; font-size: 16px; margin-bottom: 24px; }
            img { width: 320px; height: 320px; border: 4px solid #0B2545; border-radius: 16px; }
            .url { margin-top: 20px; font-weight: bold; font-size: 18px; color: #0B2545; }
          </style>
        </head>
        <body>
          <h1>Feni House Rent (ফেনী বাসা ভাড়া)</h1>
          <p>মোবাইল ক্যামেরা দিয়ে স্ক্যান করে বাসা খুঁজুন</p>
          <img src="${qrDataUrl}" alt="Website QR Code" />
          <div class="url">${publicUrl}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // QR Code Modal
  const renderQrModal = () => {
    if (!qrModalOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs">
        <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 text-center shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-150">
          <button
            onClick={() => setQrModalOpen(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 cursor-pointer text-xl font-bold"
          >
            ✕
          </button>
          <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="text-base sm:text-lg font-black text-[#0B2545]">
            ওয়েবসাইট ভিজিট QR কোড
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            পোস্টার, ব্যানার বা ভিজিটিং কার্ডে ব্যবহার করার জন্য
          </p>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 inline-block mb-3 shadow-inner">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Website QR Code"
                className="w-56 h-56 mx-auto rounded-xl shadow-xs"
              />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-xs text-slate-400">
                QR তৈরি হচ্ছে...
              </div>
            )}
          </div>
          <p className="text-[11px] font-mono text-slate-600 break-all px-2 mb-4 bg-slate-100 py-1.5 rounded-lg border border-slate-200">
            {publicUrl}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDownloadQr}
              className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ডাউনলোড (PNG)</span>
            </button>
            <button
              onClick={handlePrintQr}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>প্রিন্ট করুন</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // If used as a standalone popup modal
  if (variant === 'modal') {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs">
        <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-100 relative max-h-[92dvh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 cursor-pointer text-xl font-bold"
          >
            ✕
          </button>
          
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#0B2545]">
                ওয়েবসাইট প্রচার ও কাস্টমার শেয়ারিং
              </h3>
              <p className="text-xs text-slate-500">
                ভাড়াটিয়াদের সাথে সরাসরি লিংক বা সোশ্যাল মিডিয়ায় প্রচার করুন
              </p>
            </div>
          </div>

          <div className="space-y-4 mt-4">
            {/* Input & Copy */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                পাবলিক ওয়েবসাইট ঠিকানা (Live URL)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={publicUrl}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-800 outline-none select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                    copiedLink
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#0B2545] hover:bg-[#07182D] text-white'
                  }`}
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'কপি হয়েছে!' : 'কপি করুন'}</span>
                </button>
              </div>
            </div>

            {/* Quick Share Buttons Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={handleWhatsAppShare}
                className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp</span>
              </button>
              <button
                onClick={handleFacebookShare}
                className="py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <Share2 className="w-4 h-4 text-blue-600" />
                <span>Facebook</span>
              </button>
              <button
                onClick={() => setQrModalOpen(true)}
                className="py-2.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <QrCode className="w-4 h-4 text-purple-600" />
                <span>QR কোড</span>
              </button>
              <button
                onClick={handleOpenCustomerWebsite}
                className="py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <ExternalLink className="w-4 h-4 text-amber-600" />
                <span>ওপেন সাইট</span>
              </button>
            </div>

            {/* Ready Promotion Post copy */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>রেডিমেড প্রমোশন পোস্ট (ফেসবুক গ্রুপে শেয়ার করার জন্য)</span>
                </span>
                <button
                  onClick={handleCopyPromo}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    copiedPost
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {copiedPost ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedPost ? 'কপি হয়েছে' : 'পোস্ট কপি'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-600 whitespace-pre-line bg-white p-2.5 rounded-xl border border-slate-200 leading-relaxed">
                {promoMessage}
              </p>
            </div>
          </div>
          {renderQrModal()}
        </div>
      </div>
    );
  }

  // DEFAULT VARIANT: CARD (DISPLAYED IN ADMIN DASHBOARD)
  return (
    <div className="bg-gradient-to-r from-emerald-900/90 via-[#0B2545] to-slate-900 text-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-md border border-emerald-500/20 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Information */}
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              <Globe className="w-3 h-3" /> লাইভ ওয়েবসাইট
            </span>
            <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-400/20">
              ভাড়াটিয়াদের জন্য উন্মুক্ত
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
            <span>কাস্টমারদের সাথে ওয়েবসাইট লিংক শেয়ার করুন</span>
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            এই লিংকটি (URL) ফেসবুক গ্রুপ, হোয়াটসঅ্যাপ বা বন্ধুদের সাথে শেয়ার করে বেশি ভাড়াটিয়া আকর্ষণ করুন।
          </p>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2 flex-wrap self-stretch md:self-auto">
          <button
            onClick={() => setQrModalOpen(true)}
            title="ওয়েবসাইট কিউআর কোড দেখুন"
            className="px-3 py-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-xl text-xs font-bold border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-400" />
            <span>QR কোড</span>
          </button>
          <button
            onClick={handleCopyPromo}
            title="প্রমোশন পোস্ট কপি করুন"
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
              copiedPost
                ? 'bg-emerald-600 text-white'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
            }`}
          >
            {copiedPost ? <Check className="w-3.5 h-3.5 text-white" /> : <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
            <span>{copiedPost ? 'কপি হয়েছে!' : 'পোস্ট কপি'}</span>
          </button>
          <button
            onClick={handleOpenCustomerWebsite}
            title="কাস্টমার ভিউ খুলুন"
            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>সাইট দেখুন</span>
          </button>
        </div>
      </div>

      {/* URL Box & Instant Copy / Share Bar */}
      <div className="mt-3.5 pt-3 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="flex-1 bg-black/40 border border-white/15 rounded-xl px-3 py-2 flex items-center gap-2 text-xs font-mono text-emerald-300 overflow-hidden shadow-inner">
          <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="truncate select-all font-semibold">{publicUrl}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 ${
              copiedLink
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-slate-900 hover:bg-slate-100'
            }`}
          >
            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'কপি হয়েছে!' : 'কপি করুন'}</span>
          </button>
          <button
            onClick={handleWhatsAppShare}
            title="WhatsApp-এ শেয়ার করুন"
            className="p-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center justify-center"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
          <button
            onClick={handleFacebookShare}
            title="Facebook-এ শেয়ার করুন"
            className="p-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center justify-center"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleNativeShare}
            title="অন্যান্য অ্যাপে শেয়ার করুন"
            className="p-2 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {renderQrModal()}
    </div>
  );
};
