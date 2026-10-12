import React, { useState } from 'react';
import { Star, X, MessageSquare, Send, User } from 'lucide-react';
import { Property, Review } from '../types';
import { api } from '../api';

interface ReviewModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted: (propertyId: number, newReview: Review, avgRating: number, reviewCount: number) => void;
  showToast: (msg: string) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  property,
  isOpen,
  onClose,
  onReviewSubmitted,
  showToast
}) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [author, setAuthor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !property) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      showToast('অনুগ্রহ করে রিভিউ বা মন্তব্য লিখুন!');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.submitReview(property.id, {
        rating,
        comment: comment.trim(),
        author: author.trim() || 'ফেনী ভাড়াটিয়া'
      });
      onReviewSubmitted(property.id, res.review, res.avgRating, res.reviewCount);
      showToast('আপনার রিভিউ সফলভাবে যুক্ত হয়েছে!');
      setComment('');
      setAuthor('');
      onClose();
    } catch (err: any) {
      showToast(err.message || 'রিভিউ জমা দেওয়া যায়নি');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 relative shadow-2xl border border-slate-100 my-auto max-h-[92dvh] overflow-y-auto space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-amber-500 mb-1">
            <Star className="w-5 h-5 fill-current" />
            <span className="text-xs font-black uppercase tracking-wider text-[#0B2545]">
              রেটিং ও রিভিউ দিন
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 line-clamp-1">
            {property.title}
          </h3>
          <p className="text-xs text-slate-500">
            এই বাসা এবং এলাকার পরিবেশ কেমন তা জানিয়ে অন্য ভাড়াটিয়াদের সাহায্য করুন
          </p>
        </div>

        {/* Review Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 text-center">
              স্টার রেটিং নির্বাচন করুন
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                >
                  <Star
                    className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                      (hoverRating || rating) >= star
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-[11px] font-bold text-center text-amber-600 mt-1">
              {rating === 5 ? '৫ স্টার (অসাধারণ বাসা ও পরিবেশ)' :
               rating === 4 ? '৪ স্টার (ভালো বাসা)' :
               rating === 3 ? '৩ স্টার (মোটামুটি মানের)' :
               rating === 2 ? '২ স্টার (কিছু অসুবিধা আছে)' : '১ স্টার (খারাপ অভিজ্ঞতা)'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              আপনার নাম (ঐচ্ছিক)
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="যেমন: তানভীর আহমেদ"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              আপনার অভিজ্ঞতা ও মন্তব্য <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="বাসাটির পানির সুবিধা, গ্যাস, যাতায়াত ও নিরাপত্তা সম্পর্কে লিখুন..."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full min-h-[44px] py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-md text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'জমা হচ্ছে...' : 'রিভিউ সাবমিট করুন'}</span>
          </button>
        </form>

        {/* Existing Reviews List */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <h4 className="font-bold text-xs text-slate-700 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>আগের রিভিউসমূহ ({property.reviews?.length || 0}):</span>
          </h4>
          {(!property.reviews || property.reviews.length === 0) ? (
            <p className="text-xs text-slate-400 italic text-center py-3">
              এখনো কোনো মন্তব্য নেই।
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 no-scrollbar">
              {property.reviews.map((rev) => (
                <div key={rev.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{rev.author}</span>
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 leading-snug text-[11px]">{rev.comment}</p>
                  <p className="text-[10px] text-slate-400 text-right">{rev.date}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
