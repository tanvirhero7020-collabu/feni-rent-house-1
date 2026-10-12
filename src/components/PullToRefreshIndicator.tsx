import React, { useEffect, useState, useRef } from 'react';
import { RefreshCw, ArrowDown } from 'lucide-react';

interface PullToRefreshIndicatorProps {
  onRefresh: () => Promise<void> | void;
  isRefreshing: boolean;
  children: React.ReactNode;
}

export const PullToRefreshIndicator: React.FC<PullToRefreshIndicatorProps> = ({
  onRefresh,
  isRefreshing,
  children
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [canPull, setCanPull] = useState(false);
  const startY = useRef(0);
  const isPulling = useRef(false);
  const THRESHOLD = 70;

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      // Only allow pull-down if window is at the very top
      if (window.scrollY <= 0) {
        startY.current = e.touches[0].clientY;
        setCanPull(true);
      } else {
        setCanPull(false);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!canPull || window.scrollY > 0) {
        if (pullDistance > 0) setPullDistance(0);
        return;
      }
      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;
      if (diff > 0) {
        isPulling.current = true;
        // Dampen the pull effect
        const distance = Math.min(diff * 0.45, 100);
        setPullDistance(distance);
      }
    };

    const handleTouchEnd = () => {
      if (isPulling.current && pullDistance >= THRESHOLD && !isRefreshing) {
        setPullDistance(THRESHOLD);
        onRefresh();
      }
      isPulling.current = false;
      setTimeout(() => {
        setPullDistance(0);
      }, 300);
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [canPull, pullDistance, isRefreshing, onRefresh]);

  const rotation = Math.min((pullDistance / THRESHOLD) * 360, 360);
  const isReady = pullDistance >= THRESHOLD;

  return (
    <div className="relative">
      {/* Mobile Pull-to-refresh drop-down indicator pill */}
      {(pullDistance > 10 || isRefreshing) && (
        <div 
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center transition-all pointer-events-none"
          style={{ transform: `translate(-50%, ${Math.max(0, pullDistance - 20)}px)` }}
        >
          <div className="bg-white text-slate-800 shadow-xl border border-slate-200 px-3.5 py-2 rounded-full flex items-center gap-2 text-xs font-bold backdrop-blur-md">
            {isRefreshing ? (
              <>
                <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
                <span className="text-emerald-700 font-extrabold">তথ্য রিফ্রেশ হচ্ছে...</span>
              </>
            ) : isReady ? (
              <>
                <RefreshCw className="w-4 h-4 text-emerald-600 rotate-180 transition-transform" />
                <span className="text-emerald-700 font-extrabold">ছেড়ে দিন রিফ্রেশ করতে</span>
              </>
            ) : (
              <>
                <ArrowDown 
                  className="w-4 h-4 text-slate-500 transition-transform" 
                  style={{ transform: `rotate(${rotation}deg)` }} 
                />
                <span className="text-slate-600">নিচে টানুন রিফ্রেশের জন্য</span>
              </>
            )}
          </div>
        </div>
      )}
      {children}
    </div>
  );
};
