/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Lock, 
  RefreshCw, 
  Zap, 
  Copy,
  Sparkles
} from 'lucide-react';
import { Property, SiteSettings, Review, AutoRefreshInterval } from './types';
import { api } from './api';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { TopFeaturedSlider } from './components/TopFeaturedSlider';
import { RecentlyAddedCarousel } from './components/RecentlyAddedCarousel';
import { PropertyCard } from './components/PropertyCard';
import { UnlockModal } from './components/UnlockModal';
import { ReviewModal } from './components/ReviewModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { AdminPanel } from './components/AdminPanel';
import { Footer } from './components/Footer';
import { PullToRefreshIndicator } from './components/PullToRefreshIndicator';
import { PropertyCardSkeleton } from './components/PropertySkeleton';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { useDynamicHead } from './hooks/useDynamicHead';

export default function App() {
  // Public Data State with Instant Cache-First Bootstrap for Fast Render
  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      const cached = localStorage.getItem('feni_settings_cache');
      if (cached) return JSON.parse(cached);
    } catch {}
    return {
      unlockFee: 100,
      bkashNumber: '01812-345678',
      address: 'ট্রাঙ্ক রোড, ফেনী সদর, ফেনী',
      helpPhone: '01812-345678',
      email: 'support@fenihouserent.com',
      fbLink: 'https://facebook.com',
      waLink: '01812345678',
      ytLink: 'https://youtube.com',
      tgLink: 'https://telegram.org'
    };
  });

  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const cached = localStorage.getItem('feni_categories_cache');
      if (cached) return JSON.parse(cached);
    } catch {}
    return ['Family House', 'Apartment', 'Single Room', 'Bachelor Mess', 'Flat', 'Sublet / Room'];
  });

  const [properties, setProperties] = useState<Property[]>(() => {
    try {
      const cached = localStorage.getItem('feni_properties_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    try {
      const cached = localStorage.getItem('feni_properties_cache');
      return !cached;
    } catch {
      return true;
    }
  });

  // Instant Refresh Mode State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<number | null>(null);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<AutoRefreshInterval>(() => {
    return (localStorage.getItem('feni_auto_refresh') as AutoRefreshInterval) || 'off';
  });
  const [refreshBannerText, setRefreshBannerText] = useState<string | null>(null);

  // Filter State
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAvailability, setSelectedAvailability] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // View Navigation with URL hash sync (#admin / #home)
  const [currentView, setCurrentView] = useState<'public' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const isHashAdmin = window.location.hash.toLowerCase().includes('admin');
      const isPathAdmin = window.location.pathname.toLowerCase().includes('/admin');
      if (isHashAdmin || isPathAdmin) return 'admin';
    }
    return 'public';
  });

  const switchView = (view: 'public' | 'admin') => {
    setCurrentView(view);
    if (view === 'admin') {
      if (window.location.hash !== '#admin') {
        window.history.replaceState(null, '', '#admin');
      }
    } else {
      if (window.location.hash === '#admin') {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const isHashAdmin = window.location.hash.toLowerCase().includes('admin');
      const isPathAdmin = window.location.pathname.toLowerCase().includes('/admin');
      setCurrentView(isHashAdmin || isPathAdmin ? 'admin' : 'public');
    };
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  // Admin Auth State
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('feni_admin_token') || null;
  });

  // User Unlock State
  const [userTrxId, setUserTrxId] = useState<string | null>(() => {
    return localStorage.getItem('feni_user_trx') || null;
  });
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('feni_is_unlocked') === 'true';
  });

  // Modals State
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [targetProperty, setTargetProperty] = useState<Property | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewProperty, setReviewProperty] = useState<Property | null>(null);

  // Property Details View Modal State
  const [selectedPropertyModal, setSelectedPropertyModal] = useState<Property | null>(null);
  const [propertyDetailModalOpen, setPropertyDetailModalOpen] = useState(false);

  // Active Selected Property for Dynamic Document Head & SEO
  const [selectedPropertyForMeta, setSelectedPropertyForMeta] = useState<Property | null>(null);

  const handleOpenPropertyDetail = (prop: Property) => {
    setSelectedPropertyModal(prop);
    setSelectedPropertyForMeta(prop);
    setPropertyDetailModalOpen(true);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('property', String(prop.id));
      window.history.replaceState(null, '', url.toString());
    } catch {}
  };

  const handleClosePropertyDetail = () => {
    setPropertyDetailModalOpen(false);
    setSelectedPropertyModal(null);
    setSelectedPropertyForMeta(null);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('property');
      window.history.replaceState(null, '', url.pathname + (window.location.hash || ''));
    } catch {}
  };

  // Toast Notification State
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMsg(null);
    }, 4000);
  };

  // Instant in-place content reload engine
  const executeInstantReload = useCallback(async (silent = false, userTriggered = false) => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const startTime = Date.now();
      const data = await api.getPublicData(userTrxId, true);
      setSettings(data.settings);
      setCategories(data.categories);
      setProperties(data.properties);
      if (data.isUnlocked !== undefined) {
        setIsUnlocked(data.isUnlocked);
      }
      try {
        localStorage.setItem('feni_properties_cache', JSON.stringify(data.properties));
        localStorage.setItem('feni_categories_cache', JSON.stringify(data.categories));
        localStorage.setItem('feni_settings_cache', JSON.stringify(data.settings));
      } catch {}

      const now = Date.now();
      setLastRefreshedAt(now);
      if (userTriggered || !silent) {
        const elapsed = Math.max(0, now - startTime);
        const msg = `তালিকা আপডেট সম্পন্ন (${data.properties.length}টি বাসা, ${elapsed}ms)`;
        setRefreshBannerText(msg);
        showToast(msg);
        setTimeout(() => setRefreshBannerText(null), 3500);
      }
    } catch (err: any) {
      console.error('[Refresh] Failed to reload content:', err);
      if (userTriggered) {
        showToast('রিফ্রেশ ব্যর্থ হয়েছে');
      }
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, [isRefreshing, userTrxId]);

  // Initial load
  useEffect(() => {
    executeInstantReload(true, false);
  }, []);

  // Update auto refresh setting in localStorage
  const handleSetAutoRefreshInterval = (interval: AutoRefreshInterval) => {
    setAutoRefreshInterval(interval);
    localStorage.setItem('feni_auto_refresh', interval);
    if (interval === 'off') {
      showToast('অটো রিফ্রেশ বন্ধ করা হয়েছে');
    } else {
      showToast(`অটো রিফ্রেশ প্রতি ${interval} পর পর সক্রিয় করা হয়েছে`);
      executeInstantReload(true, false);
    }
  };

  // Recurring Auto-Refresh Interval Timer
  useEffect(() => {
    if (autoRefreshInterval === 'off') return;
    const intervalMap: Record<string, number> = {
      '10s': 10000,
      '20s': 20000,
      '45s': 45000,
      '60s': 60000
    };
    const ms = intervalMap[autoRefreshInterval] || 20000;
    const intervalTimer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        executeInstantReload(true, false);
      }
    }, ms);
    return () => clearInterval(intervalTimer);
  }, [autoRefreshInterval, executeInstantReload]);

  // Keyboard shortcut listener: Press "R" or "Ctrl/Cmd + R"
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl instanceof HTMLInputElement || 
                      activeEl instanceof HTMLTextAreaElement || 
                      activeEl instanceof HTMLSelectElement;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        executeInstantReload(false, true);
        return;
      }
      if (!isInput && e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        executeInstantReload(false, true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [executeInstantReload]);

  // Sync / Verify TrxID status with backend
  useEffect(() => {
    if (!userTrxId || isUnlocked) return;
    let isMounted = true;
    const verifyStatus = async () => {
      try {
        const res = await api.checkTrx(userTrxId);
        if (!isMounted) return;
        if (res.status === 'Approved') {
          setIsUnlocked(true);
          localStorage.setItem('feni_is_unlocked', 'true');
          showToast('অভিনন্দন! আপনার পেমেন্ট অনুমোদিত হয়েছে!');
          executeInstantReload(false, true);
        } else if (res.status === 'Rejected') {
          setIsUnlocked(false);
          localStorage.setItem('feni_is_unlocked', 'false');
        }
      } catch (err) {
        // silent check
      }
    };
    verifyStatus();
    const interval = setInterval(verifyStatus, 6000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [userTrxId, isUnlocked, executeInstantReload]);

  // Handle User Payment Submission
  const handlePaymentSubmitted = (trxId: string, approved: boolean) => {
    setUserTrxId(trxId);
    localStorage.setItem('feni_user_trx', trxId);
    if (approved) {
      setIsUnlocked(true);
      localStorage.setItem('feni_is_unlocked', 'true');
      executeInstantReload(false, true);
    }
  };

  // Deep-linking: Auto-scroll & Highlight when opening a shared property link
  useEffect(() => {
    if (typeof window === 'undefined' || properties.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const propIdParam = params.get('property') || window.location.hash.replace('#property-', '');
    if (propIdParam) {
      const targetId = Number(propIdParam);
      const matched = properties.find((p) => p.id === targetId);
      if (matched) {
        setSelectedPropertyForMeta(matched);
        setSelectedPropertyModal(matched);
        setPropertyDetailModalOpen(true);
      }
      const targetEl = document.getElementById(`property-${targetId}`);
      if (targetEl) {
        setTimeout(() => {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetEl.classList.add('ring-4', 'ring-emerald-500', 'shadow-2xl');
          showToast('শেয়ারকৃত বাসাটি দেখানো হচ্ছে!');
          setTimeout(() => {
            targetEl.classList.remove('ring-4', 'ring-emerald-500');
          }, 4500);
        }, 500);
      }
    }
  }, [properties]);

  // Handle Opening Review Modal
  const handleOpenReviewModal = (property: Property) => {
    setReviewProperty(property);
    setReviewModalOpen(true);
  };

  // Handle Review Submitted Success
  const handleReviewSubmitted = (propertyId: number, newReview: Review, avgRating: number, reviewCount: number) => {
    setProperties((prev) =>
      prev.map((p) => {
        if (p.id === propertyId) {
          const updatedReviews = [newReview, ...(p.reviews || [])];
          return {
            ...p,
            reviews: updatedReviews,
            avgRating,
            reviewCount
          };
        }
        return p;
      })
    );
  };

  // Admin Login / Logout handlers
  const handleAdminLogin = (token: string) => {
    setAdminToken(token);
    localStorage.setItem('feni_admin_token', token);
  };

  const handleAdminLogout = () => {
    setAdminToken(null);
    localStorage.removeItem('feni_admin_token');
    showToast('অ্যাডমিন লগআউট সম্পন্ন');
  };

  // Filtered Properties Logic
  const filteredProperties = properties.filter((prop) => {
    const matchLocation = selectedLocation === 'All' || prop.location === selectedLocation;
    const matchCategory = selectedCategory === 'All' || prop.category === selectedCategory;
    const matchAvailability =
      selectedAvailability === 'All' ||
      (selectedAvailability === 'Available' && prop.isAvailable !== false) ||
      (selectedAvailability === 'Booked' && prop.isAvailable === false);
    const matchQuery =
      !searchQuery.trim() ||
      prop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.exactAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchLocation && matchCategory && matchAvailability && matchQuery;
  });

  // Dynamic Meta Title & Description Generator based on Current View
  useDynamicHead({
    currentView,
    selectedProperty: selectedPropertyForMeta || selectedPropertyModal || targetProperty || reviewProperty,
    selectedCategory,
    selectedLocation,
    searchQuery,
    totalFilteredCount: filteredProperties.length,
    settings
  });

  return (
    <PullToRefreshIndicator 
      onRefresh={() => executeInstantReload(false, true)} 
      isRefreshing={isRefreshing}
    >
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased selection:bg-emerald-500 selection:text-white">
        {/* Top Header with Integrated Instant Refresh Controls */}
        <Header
          settings={settings}
          isUnlocked={isUnlocked}
          onOpenUnlockModal={() => {
            setTargetProperty(null);
            setUnlockModalOpen(true);
          }}
          onOpenAdmin={() => {
            switchView(currentView === 'admin' ? 'public' : 'admin');
          }}
          currentView={currentView}
          onSwitchView={switchView}
          isRefreshing={isRefreshing}
          lastRefreshedAt={lastRefreshedAt}
          autoRefreshInterval={autoRefreshInterval}
          onInstantRefresh={() => executeInstantReload(false, true)}
          onSetAutoRefreshInterval={handleSetAutoRefreshInterval}
          totalListingsCount={properties.length}
        />

        {/* Active Payment Transaction Status Bar */}
        {userTrxId && currentView === 'public' && (
          <div className="bg-[#0B2545] border-b border-emerald-500/30 text-white py-2.5 px-3 sm:px-6 shadow-sm">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-emerald-500/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded-md border border-emerald-500/30 text-[10px] uppercase">
                  আপনার TrxID
                </span>
                <span className="font-mono font-black text-xs sm:text-sm bg-white/10 text-emerald-300 px-2 py-0.5 rounded-lg border border-white/20 select-all tracking-wider">
                  {userTrxId}
                </span>
                {isUnlocked ? (
                  <span className="bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 text-[11px] shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5" /> অনুমোদিত (আনলকড)
                  </span>
                ) : (
                  <span className="bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full flex items-center gap-1 text-[11px] shadow-xs animate-pulse">
                    <RefreshCw className="w-3 h-3 animate-spin" /> যাচাই চলছে...
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 self-end sm:self-auto flex-wrap">
                <button
                  type="button"
                  onClick={async () => {
                    showToast('TrxID যাচাই করা হচ্ছে...');
                    try {
                      const res = await api.checkTrx(userTrxId);
                      if (res.status === 'Approved') {
                        setIsUnlocked(true);
                        localStorage.setItem('feni_is_unlocked', 'true');
                        executeInstantReload(false, true);
                        showToast('অভিনন্দন! আপনার TrxID অনুমোদিত হয়েছে!');
                      } else if (res.status === 'Pending') {
                        showToast('পেমেন্টটি অনুমোদনের অপেক্ষায় রয়েছে');
                      } else {
                        showToast('এই TrxID বাতিল করা হয়েছে');
                      }
                    } catch {
                      showToast('যাচাই করা যায়নি');
                    }
                  }}
                  className="px-2.5 py-1 bg-white/15 hover:bg-white/25 active:scale-95 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>যাচাই</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(userTrxId);
                    showToast('TrxID কপি হয়েছে!');
                  }}
                  className="px-2.5 py-1 bg-white/15 hover:bg-white/25 active:scale-95 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  <span>কপি</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTargetProperty(null);
                    setUnlockModalOpen(true);
                  }}
                  className="px-2.5 py-1 bg-[#D12053] hover:bg-[#b81846] text-white font-bold rounded-lg text-xs cursor-pointer shadow-2xs"
                >
                  নতুন TrxID জমা দিন
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Live Refresh Status Micro-Banner */}
        {refreshBannerText && (
          <div className="bg-emerald-600 text-white text-xs font-bold py-1.5 px-4 text-center shadow-xs flex items-center justify-center gap-2 animate-fadeIn z-30">
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>{refreshBannerText}</span>
          </div>
        )}

        {/* Main View Router */}
        {currentView === 'admin' ? (
          <AdminPanel
            token={adminToken}
            onLogin={handleAdminLogin}
            onLogout={handleAdminLogout}
            onSwitchView={(v) => {
              switchView(v);
              executeInstantReload(false, true);
            }}
            showToast={showToast}
            onInstantDataRefresh={() => executeInstantReload(true, false)}
          />
        ) : (
          <main className="flex-grow">
            {/* 1. Hero Section with Search Filters at the Top */}
            <Hero
              settings={settings}
              categories={categories}
              totalProperties={properties.length}
              selectedLocation={selectedLocation}
              selectedCategory={selectedCategory}
              selectedAvailability={selectedAvailability}
              searchQuery={searchQuery}
              onLocationChange={setSelectedLocation}
              onCategoryChange={setSelectedCategory}
              onAvailabilityChange={setSelectedAvailability}
              onSearchQueryChange={setSearchQuery}
              onFilterSubmit={() => {
                document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* 2. Featured Slider */}
            <TopFeaturedSlider
              properties={properties}
              isUnlocked={isUnlocked}
              settings={settings}
              onUnlockClick={(p) => {
                setTargetProperty(p);
                setUnlockModalOpen(true);
              }}
              onLeaveReviewClick={handleOpenReviewModal}
              showToast={showToast}
              onViewDetails={handleOpenPropertyDetail}
            />

            {/* 3. Recently Added Horizontal Carousel Section */}
            <div id="recent-section">
              <RecentlyAddedCarousel
                properties={properties}
                isUnlocked={isUnlocked}
                settings={settings}
                onUnlockClick={(p) => {
                  setTargetProperty(p);
                  setUnlockModalOpen(true);
                }}
                onLeaveReviewClick={handleOpenReviewModal}
                showToast={showToast}
                onViewDetails={handleOpenPropertyDetail}
              />
            </div>

            {/* 4. Category Chips Bar (Mobile Horizontally Scrollable) */}
            <section className="bg-white border-b border-slate-200/80 py-3 sticky top-16 sm:top-20 z-30 shadow-2xs">
              <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-0.5">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
                      ক্যাটাগরি:
                    </span>
                    <button
                      onClick={() => setSelectedCategory('All')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 cursor-pointer ${
                        selectedCategory === 'All'
                          ? 'bg-[#0B2545] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      সকল বাসা ({properties.length})
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 cursor-pointer ${
                          selectedCategory === cat
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Inline micro quick-refresh button */}
                  <button
                    onClick={() => executeInstantReload(false, true)}
                    disabled={isRefreshing}
                    title="তাৎক্ষণিক রিফ্রেশ (Hotkey: R)"
                    className="flex items-center gap-1 text-[11px] font-extrabold text-slate-500 hover:text-emerald-700 bg-slate-50 hover:bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-slate-200 flex-shrink-0 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 text-emerald-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span className="hidden xs:inline">{isRefreshing ? 'সিঙ্ক হচ্ছে...' : 'রিলোড'}</span>
                  </button>
                </div>
              </div>
            </section>

            {/* 5. Properties Grid Section */}
            <section id="properties" className="py-8 sm:py-14 bg-slate-50">
              <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6">
                {/* Heading & Status Banner */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-black text-[#0B2545] tracking-tight">
                        উপলব্ধ বাসার তালিকা
                      </h2>
                      {isRefreshing && (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-pulse">
                          <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                          <span>সিঙ্ক হচ্ছে</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      মোট {filteredProperties.length}টি বাসার বিজ্ঞাপন দেখানো হচ্ছে
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {isUnlocked ? (
                      <div className="bg-emerald-50 border border-emerald-300 px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-xs">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-900">
                          মালিকের নম্বর আনলক করা আছে
                        </span>
                      </div>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-xs">
                        <Lock className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-bold text-amber-900">
                          নম্বর দেখতে আনলক ফি ৳{settings.unlockFee}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Grid or Empty State */}
                {isLoading && filteredProperties.length === 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <PropertyCardSkeleton key={i} />
                    ))}
                  </div>
                ) : filteredProperties.length === 0 ? (
                  <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-slate-300 p-6">
                    <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h4 className="font-bold text-slate-800 text-base">কোনো বাসা খুঁজে পাওয়া যায়নি</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন অথবা রিফ্রেশ বাটনে ক্লিক করুন
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <button
                        onClick={() => {
                          setSelectedLocation('All');
                          setSelectedCategory('All');
                          setSearchQuery('');
                        }}
                        className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                      >
                        সকল বাসা দেখুন
                      </button>
                      <button
                        onClick={() => executeInstantReload(false, true)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                        <span>রিফ্রেশ</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {filteredProperties.map((prop) => (
                      <PropertyCard
                        key={prop.id}
                        property={prop}
                        isUnlocked={isUnlocked}
                        settings={settings}
                        onUnlockClick={(p) => {
                          setTargetProperty(p);
                          setUnlockModalOpen(true);
                        }}
                        onLeaveReviewClick={handleOpenReviewModal}
                        showToast={showToast}
                        onViewDetails={handleOpenPropertyDetail}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-12 sm:py-16 bg-white border-y border-slate-200/80">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-xl mx-auto mb-10">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    সহজ ৩টি ধাপ
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#0B2545] mt-2 tracking-tight">
                    কীভাবে বাসা আনলক করবেন?
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    দালালমুক্ত ও সরাসরি মালিকের সাথে কথা বলার দ্রুততম প্রক্রিয়া
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Step 1 */}
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200/80 text-center space-y-3 relative hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-[#0B2545] text-emerald-400 font-black rounded-2xl flex items-center justify-center text-xl mx-auto shadow-sm">
                      ১
                    </div>
                    <h3 className="font-bold text-[#0B2545] text-sm sm:text-base">bKash-এ সেন্ড মানি করুন</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      আমাদের নির্ধারিত নম্বরে মাত্র ৳{settings.unlockFee} টাকা বিকাশ সেন্ড মানি করুন।
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200/80 text-center space-y-3 relative hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-[#D12053] text-white font-black rounded-2xl flex items-center justify-center text-xl mx-auto shadow-sm">
                      ২
                    </div>
                    <h3 className="font-bold text-[#0B2545] text-sm sm:text-base">TrxID সাবমিট করুন</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      বিকাশ এসএমএস থেকে প্রাপ্ত Transaction ID (TrxID) ফর্মে লিখে জমা দিন।
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200/80 text-center space-y-3 relative hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-emerald-600 text-white font-black rounded-2xl flex items-center justify-center text-xl mx-auto shadow-sm">
                      ৩
                    </div>
                    <h3 className="font-bold text-[#0B2545] text-sm sm:text-base">নম্বর দেখুন ও কল দিন</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      এডমিন অনুমোদন সাপেক্ষে তৎক্ষণাৎ সরাসরি মালিকের নম্বর ও হোল্ডিং অ্যাড্রেস আনলক হবে।
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </main>
        )}

        {/* Footer */}
        <Footer
          settings={settings}
          onOpenAdmin={() => switchView('admin')}
          onNavigateHome={() => {
            switchView('public');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />

        {/* Selected Property Details Modal */}
        <PropertyDetailModal
          property={selectedPropertyModal}
          isOpen={propertyDetailModalOpen}
          isUnlocked={isUnlocked}
          settings={settings}
          onClose={handleClosePropertyDetail}
          onUnlockClick={(p) => {
            setTargetProperty(p);
            setUnlockModalOpen(true);
          }}
          onLeaveReviewClick={handleOpenReviewModal}
          showToast={showToast}
        />

        {/* Unlock / Payment Modal */}
        <UnlockModal
          isOpen={unlockModalOpen}
          onClose={() => setUnlockModalOpen(false)}
          settings={settings}
          targetProperty={targetProperty}
          onPaymentSubmitted={handlePaymentSubmitted}
          showToast={showToast}
        />

        {/* 5-Star Rating & Comment Modal */}
        <ReviewModal
          property={reviewProperty}
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          onReviewSubmitted={handleReviewSubmitted}
          showToast={showToast}
        />

        {/* Floating WhatsApp Action Button */}
        <FloatingWhatsApp settings={settings} />

        {/* Toast Notification Floating Banner */}
        {toastMsg && (
          <div className="fixed bottom-5 left-4 sm:left-6 z-50 bg-[#0B2545] text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500/30 max-w-md animate-fadeIn">
            <Sparkles className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="text-xs font-semibold leading-snug">{toastMsg}</span>
          </div>
        )}
      </div>
    </PullToRefreshIndicator>
  );
}
