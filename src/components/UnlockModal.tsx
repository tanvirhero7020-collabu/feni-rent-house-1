import React, { useState } from 'react';
import { X, Copy, Check, Send, Phone, KeyRound, AlertCircle, RefreshCw, ShieldCheck, CheckCircle2, HelpCircle } from 'lucide-react';
import { Property, SiteSettings } from '../types';
import { api } from '../api';

interface UnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SiteSettings;
  targetProperty: Property | null;
  onPaymentSubmitted: (trxId: string, isApproved: boolean) => void;
  showToast: (msg: string) => void;
}

interface SubmittedReceipt {
  trxId: string;
  phone: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  date: string;
}

export const UnlockModal: React.FC<UnlockModalProps> = ({
  isOpen,
  onClose,
  settings,
  targetProperty,
  onPaymentSubmitted,
  showToast
}) => {
  const [activeTab, setActiveTab] = useState<'submit' | 'check'>('submit');
  const [phone, setPhone] = useState('');
  const [trxId, setTrxId] = useState('');
  const [checkTrxId, setCheckTrxId] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedReceiptTrx, setCopiedReceiptTrx] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<string | null>(null);
  // Post-submission receipt state so the user sees their TrxID clearly
  const [submittedReceipt, setSubmittedReceipt] = useState<SubmittedReceipt | null>(null);

  if (!isOpen) return null;

  const handleCopyBkash = () => {
    if (!settings.bkashNumber) {
      showToast('বিকাশ নম্বর পাওয়া যায়নি');
      return;
    }
    const cleanNum = settings.bkashNumber.replace(/[^\d+]/g, '');
    navigator.clipboard.writeText(cleanNum);
    setCopied(true);
    showToast('বিকাশ নম্বর কপি করা হয়েছে!');
    setTimeout(() => setCopied(false), 2500);
  };

  // Quick Demo Auto-fill Helper for instant testing
  const handleAutoFillDemo = () => {
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const demoTrx = `BK${randomSuffix}`;
    setPhone('01812345678');
    setTrxId(demoTrx);
    showToast(`টেস্ট TrxID: ${demoTrx} পূরণ করা হয়েছে!`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !trxId.trim()) {
      showToast('ফোন নম্বর এবং TrxID প্রদান করুন!');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.submitOrder({
        phone: phone.trim(),
        trxId: trxId.trim().toUpperCase(),
        propertyId: targetProperty?.id,
        propertyTitle: targetProperty?.title
      });

      const isApproved = res.order?.status === 'Approved';
      const cleanTrx = trxId.trim().toUpperCase();
      
      onPaymentSubmitted(cleanTrx, isApproved);
      showToast(res.message || 'TrxID সফলভাবে জমা হয়েছে!');
      
      // Keep receipt open on screen so user sees their TrxID clearly
      setSubmittedReceipt({
        trxId: cleanTrx,
        phone: phone.trim(),
        amount: Number(settings.unlockFee) || 100,
        status: res.order?.status || 'Pending',
        date: res.order?.date || new Date().toLocaleString()
      });
    } catch (err: any) {
      showToast(err.message || 'সাবমিট করতে সমস্যা হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkTrxId.trim()) {
      showToast('Transaction ID দিন');
      return;
    }
    setIsChecking(true);
    setCheckResult(null);
    try {
      const res = await api.checkTrx(checkTrxId.trim().toUpperCase());
      if (!res.found) {
        setCheckResult('notFound');
        showToast('এই TrxID-এর কোনো পেমেন্ট পাওয়া যায়নি!');
      } else if (res.status === 'Approved') {
        setCheckResult('approved');
        onPaymentSubmitted(checkTrxId.trim().toUpperCase(), true);
        showToast('অভিনন্দন! TrxID অ্যাপ্রুভ হয়েছে!');
      } else if (res.status === 'Pending') {
        setCheckResult('pending');
        showToast('পেমেন্টটি অনুমোদনের অপেক্ষায় রয়েছে');
      } else {
        setCheckResult('rejected');
        showToast('এই TrxID বাতিল করা হয়েছে');
      }
    } catch (err: any) {
      showToast(err.message || 'স্ট্যাটাস চেক ব্যর্থ হয়েছে');
    } finally {
      setIsChecking(false);
    }
  };

  const handleCopyReceiptTrx = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedReceiptTrx(true);
    showToast('TrxID কপি করা হয়েছে!');
    setTimeout(() => setCopiedReceiptTrx(false), 2500);
  };

  const handleResetAndClose = () => {
    setSubmittedReceipt(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 relative shadow-2xl border border-slate-100 my-auto max-h-[92dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer text-xl"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. SUCCESS RECEIPT VIEW (Appears after submission so user sees their TrxID) */}
        {submittedReceipt ? (
          <div className="space-y-4 text-center py-2 animate-fadeIn">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                পেমেন্ট রিসিট
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                TrxID সফলভাবে জমা হয়েছে
              </h3>
              <p className="text-xs text-slate-500">
                এডমিন যাচাই করার সাথে সাথে সকল বাসার তথ্য আনলক হবে
              </p>
            </div>

            {/* TrxID Highlight Box with 1-Click Copy */}
            <div className="bg-slate-50 border-2 border-emerald-300 rounded-2xl p-4 text-left space-y-2.5">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  আপনার Transaction ID (TrxID):
                </span>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <span className="font-mono font-black text-base sm:text-lg text-[#0B2545] tracking-wider select-all">
                    {submittedReceipt.trxId}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyReceiptTrx(submittedReceipt.trxId)}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                  >
                    {copiedReceiptTrx ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedReceiptTrx ? 'কপি হয়েছে' : 'কপি'}</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">প্রেরক মোবাইল:</span>
                  <strong className="text-slate-800">{submittedReceipt.phone}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">ফি এর পরিমাণ:</span>
                  <strong className="text-[#D12053]">৳ {submittedReceipt.amount}</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500">বর্তমান স্ট্যাটাস:</span>
                {submittedReceipt.status === 'Approved' ? (
                  <span className="bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5" /> অনুমোদিত (আনলকড)
                  </span>
                ) : (
                  <span className="bg-amber-100 text-amber-900 font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 text-[11px]">
                    <RefreshCw className="w-3 h-3 animate-spin" /> যাচাই চলছে (অপেক্ষমাণ)
                  </span>
                )}
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed px-2">
              আপনার TrxID সংরক্ষণ করে রাখুন। হোম পেজের উপরের বারে স্ট্যাটাস লাইভ দেখা যাবে।
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={async () => {
                  setIsChecking(true);
                  try {
                    const res = await api.checkTrx(submittedReceipt.trxId);
                    if (res.status === 'Approved') {
                      onPaymentSubmitted(submittedReceipt.trxId, true);
                      setSubmittedReceipt({ ...submittedReceipt, status: 'Approved' });
                      showToast('অভিনন্দন! TrxID অনুমোদিত হয়েছে!');
                    } else {
                      showToast('এখনও যাচাই চলছে, অপেক্ষা করুন');
                    }
                  } catch {
                    showToast('যাচাই করা যায়নি');
                  } finally {
                    setIsChecking(false);
                  }
                }}
                disabled={isChecking}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                <span>স্ট্যাটাস রিফ্রেশ</span>
              </button>
              <button
                type="button"
                onClick={handleResetAndClose}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
              >
                ঠিক আছে
              </button>
            </div>
          </div>
        ) : (
          /* 2. REGULAR SUBMISSION FORM & INSTRUCTIONS */
          <>
            {/* Modal Header */}
            <div className="text-center mb-4 pr-6 pl-6">
              <div className="w-12 h-12 bg-pink-100 text-[#D12053] rounded-2xl flex items-center justify-center text-xl mx-auto mb-2 shadow-2xs">
                <span className="font-extrabold text-sm tracking-tighter">bKash</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-[#0B2545]">
                বাসার মালিকের তথ্য আনলক করুন
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                বিকাশ করে Transaction ID (TrxID) প্রদান করুন
              </p>
            </div>

            {/* Payment Amount & bKash Number Box */}
            <div className="bg-pink-50/80 border border-pink-200/90 p-3.5 rounded-2xl space-y-2.5 mb-4">
              <div className="flex justify-between items-center text-xs font-bold text-[#0B2545]">
                <span>আনলক ফি:</span>
                <span className="text-base font-black text-[#D12053]">
                  ৳ {settings.unlockFee} টাকা
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-pink-200/70">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#D12053]" />
                  <span>bKash Personal:</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-xs sm:text-sm text-[#0B2545] select-all">
                    {settings.bkashNumber || '01812-345678'}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyBkash}
                    className="px-2.5 py-1 bg-[#D12053] hover:bg-[#b81846] text-white text-[11px] font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'কপি হয়েছে' : 'কপি'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Tab Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('submit')}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'submit'
                    ? 'bg-white text-[#0B2545] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                নতুন TrxID জমা দিন
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('check')}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'check'
                    ? 'bg-white text-[#0B2545] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                পূর্বের স্ট্যাটাস দেখুন
              </button>
            </div>

            {/* Tab 1: Submit New TrxID */}
            {activeTab === 'submit' && (
              <form onSubmit={handleSubmit} className="space-y-3">
                {targetProperty && (
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-700">
                    <span className="font-bold text-slate-500 block text-[10px] uppercase">নির্বাচিত বাসা:</span>
                    <span className="font-bold line-clamp-1 text-slate-900">{targetProperty.title}</span>
                  </div>
                )}

                {/* Helpful visual guide on what a TrxID is */}
                <div className="bg-amber-50/80 border border-amber-200/80 p-2.5 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-0.5">
                    <p className="font-bold">TrxID কী?</p>
                    <p className="text-slate-600 leading-snug">
                      বিকাশ সেন্ড মানি করার পর এসএমএস-এ প্রাপ্ত ট্রানজেকশন আইডি (যেমন: <code className="font-mono font-bold text-amber-900 bg-amber-100 px-1 rounded">9K88F4R2E</code>)
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    যে নম্বর থেকে বিকাশ করেছেন <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="যেমন: 018XXXXXXXX"
                    className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none text-sm font-semibold"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      বিকাশ TrxID (Transaction ID) <span className="text-red-500">*</span>
                    </label>
                    {/* Demo auto-fill button for testing */}
                    <button
                      type="button"
                      onClick={handleAutoFillDemo}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
                    >
                      টেস্ট TrxID দিন
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                    placeholder="যেমন: 9K88F4R2E"
                    className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none text-sm font-mono font-bold uppercase text-[#0B2545]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full min-h-[44px] py-3 bg-[#D12053] hover:bg-[#b81846] disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-md text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer mt-1"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>জমা হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>TrxID ভেরিফাই করতে জমা দিন</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-slate-400 text-center pt-1 leading-tight">
                  * TrxID জমা দেওয়ার পর এডমিন প্যানেল থেকে দ্রুত যাচাই করে সক্রিয় করা হয়।
                </p>
              </form>
            )}

            {/* Tab 2: Check Existing TrxID */}
            {activeTab === 'check' && (
              <form onSubmit={handleCheckStatus} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    আপনার পূর্বে জমাকৃত TrxID
                  </label>
                  <input
                    type="text"
                    required
                    value={checkTrxId}
                    onChange={(e) => setCheckTrxId(e.target.value.toUpperCase())}
                    placeholder="যেমন: 9K88F4R2E"
                    className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none text-sm font-mono font-bold uppercase text-[#0B2545]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isChecking}
                  className="w-full min-h-[44px] py-3 bg-[#0B2545] hover:bg-[#07182D] disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-md text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isChecking ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>চেক হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>স্ট্যাটাস চেক করুন</span>
                    </>
                  )}
                </button>

                {checkResult && (
                  <div className="pt-2">
                    {checkResult === 'approved' && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <span>অভিনন্দন! আপনার পেমেন্ট অনুমোদিত। এখন মালিকের নম্বর দেখতে পাচ্ছেন।</span>
                      </div>
                    )}
                    {checkResult === 'pending' && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-semibold flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-amber-600 animate-spin flex-shrink-0" />
                        <span>আপনার পেমেন্টটি এখনও যাচাই করা হচ্ছে। অনুগ্রহ করে একটু অপেক্ষা করুন।</span>
                      </div>
                    )}
                    {checkResult === 'notFound' && (
                      <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        <span>এই TrxID খুঁজে পাওয়া যায়নি। সঠিক TrxID জমা দিন।</span>
                      </div>
                    )}
                    {checkResult === 'rejected' && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-bold flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <span>দুঃখিত, এই TrxID বাতিল করা হয়েছে।</span>
                      </div>
                    )}
                  </div>
                )}
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};
