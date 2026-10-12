import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  Plus, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  Sliders, 
  Key, 
  LogOut, 
  Globe, 
  Phone, 
  Save, 
  Layers, 
  Check, 
  Search,
  Shield,
  AlertTriangle,
  Share2,
  Copy,
  ExternalLink,
  Eye
} from 'lucide-react';
import { AdminDataResponse, Property, SiteSettings } from '../types';
import { api } from '../api';
import { WebsiteShareManager } from './WebsiteShareManager';

interface AdminPanelProps {
  token: string | null;
  onLogin: (token: string) => void;
  onLogout: () => void;
  onSwitchView: (view: 'public' | 'admin') => void;
  showToast: (msg: string) => void;
  onInstantDataRefresh?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  token,
  onLogin,
  onLogout,
  onSwitchView,
  showToast,
  onInstantDataRefresh
}) => {
  // Login form state
  const [loginPass, setLoginPass] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard Data State
  const [adminData, setAdminData] = useState<AdminDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'properties' | 'share' | 'settings' | 'security'>('orders');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Orders filtering & search
  const [orderFilter, setOrderFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  // Property Modal Form State
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState<number | null>(null);
  const [propertyForm, setPropertyForm] = useState({
    title: '',
    category: 'Family House',
    location: 'Feni Sadar',
    exactAddress: '',
    price: 12000,
    sqft: 1200,
    beds: 2,
    baths: 2,
    ownerName: '',
    ownerPhone: '',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    isAvailable: true
  });

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState<SiteSettings>({
    unlockFee: 100,
    bkashNumber: '',
    address: '',
    helpPhone: '',
    email: '',
    fbLink: '',
    waLink: '',
    ytLink: '',
    tgLink: '',
    websiteUrl: ''
  });

  // Security Form State
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');

  // Fetch admin dashboard data with safe error handling
  const loadDashboardData = async (silent = false) => {
    if (!token) return;
    if (!silent) {
      setIsLoading(true);
      setFetchError(null);
    }
    try {
      const data = await api.getAdminData(token);
      setAdminData(data);
      setSettingsForm(data.settings);
      setFetchError(null);
    } catch (err: any) {
      console.error('[Admin] Load error:', err);
      if (err.message === 'UNAUTHORIZED_TOKEN') {
        showToast('সেশন মেয়াদোত্তীর্ণ হয়েছে, আবার লগইন করুন');
        onLogout();
      } else {
        if (!silent) {
          setFetchError(err.message || 'ডেটা লোড করতে সমস্যা হয়েছে');
          showToast(err.message || 'ডেটা লোড করতে সমস্যা হয়েছে');
        }
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  // Auto-refresh orders every 8 seconds when admin is active
  useEffect(() => {
    if (token) {
      loadDashboardData();
      const interval = setInterval(() => {
        loadDashboardData(true);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [token]);

  // Handle Admin Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPass.trim()) return;
    setIsLoggingIn(true);
    try {
      const res = await api.adminLogin(loginPass.trim());
      if (res.success && res.token) {
        onLogin(res.token);
        setLoginPass('');
        showToast('লগইন সফল হয়েছে!');
      }
    } catch (err: any) {
      showToast(err.message || 'লগইন ব্যর্থ হয়েছে!');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Order Approval Actions
  const handleOrderStatus = async (orderId: string, status: 'Approved' | 'Rejected' | 'Pending') => {
    if (!token) return;
    try {
      await api.updateOrderStatus(token, orderId, status);
      const label = status === 'Approved' ? 'অনুমোদিত' : status === 'Rejected' ? 'বাতিল' : 'অপেক্ষমাণ';
      showToast(`স্ট্যাটাস পরিবর্তিত: ${label}`);
      loadDashboardData(true);
      if (onInstantDataRefresh) onInstantDataRefresh();
    } catch (err: any) {
      showToast(err.message || 'স্ট্যাটাস আপডেট ব্যর্থ হয়েছে');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!token || !window.confirm('অর্ডারটি মুছে ফেলতে চান?')) return;
    try {
      await api.deleteOrder(token, orderId);
      showToast('অর্ডার মুছে ফেলা হয়েছে');
      loadDashboardData(true);
      if (onInstantDataRefresh) onInstantDataRefresh();
    } catch (err: any) {
      showToast(err.message || 'অর্ডার মুছতে সমস্যা হয়েছে');
    }
  };

  // Property Management Actions
  const handleOpenAddProperty = () => {
    setEditingPropertyId(null);
    setPropertyForm({
      title: '',
      category: adminData?.categories[0] || 'Family House',
      location: 'Feni Sadar',
      exactAddress: '',
      price: 12000,
      sqft: 1200,
      beds: 2,
      baths: 2,
      ownerName: '',
      ownerPhone: '',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      isAvailable: true
    });
    setIsPropertyModalOpen(true);
  };

  const handleOpenEditProperty = (prop: Property) => {
    setEditingPropertyId(prop.id);
    setPropertyForm({
      title: prop.title,
      category: prop.category,
      location: prop.location,
      exactAddress: prop.exactAddress,
      price: prop.price,
      sqft: prop.sqft,
      beds: prop.beds,
      baths: prop.baths,
      ownerName: prop.ownerName,
      ownerPhone: prop.ownerPhone,
      image: prop.image,
      isAvailable: prop.isAvailable !== false
    });
    setIsPropertyModalOpen(true);
  };

  const handleToggleAvailability = async (prop: Property) => {
    if (!token) return;
    try {
      const newStatus = prop.isAvailable === false ? true : false;
      await api.updateProperty(token, prop.id, { isAvailable: newStatus });
      showToast(newStatus ? 'বাসাটি খালি চিহ্নিত করা হয়েছে (Available)' : 'বাসাটি বুকড চিহ্নিত করা হয়েছে (Booked)');
      loadDashboardData(true);
      if (onInstantDataRefresh) onInstantDataRefresh();
    } catch (err: any) {
      showToast(err.message || 'স্ট্যাটাস আপডেট ব্যর্থ হয়েছে');
    }
  };

  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      if (editingPropertyId) {
        await api.updateProperty(token, editingPropertyId, propertyForm);
        showToast('বাসার তথ্য সফলভাবে আপডেট হয়েছে!');
      } else {
        await api.addProperty(token, propertyForm);
        showToast('নতুন বাসা সফলভাবে যুক্ত হয়েছে!');
      }
      setIsPropertyModalOpen(false);
      loadDashboardData(true);
      if (onInstantDataRefresh) onInstantDataRefresh();
    } catch (err: any) {
      showToast(err.message || 'তথ্য সংরক্ষণ করা যায়নি');
    }
  };

  const handleDeleteProperty = async (id: number) => {
    if (!token || !window.confirm('বাসার বিজ্ঞাপনটি মুছে ফেলতে চান?')) return;
    try {
      await api.deleteProperty(token, id);
      showToast('বাসার বিজ্ঞাপন মুছে ফেলা হয়েছে');
      loadDashboardData(true);
      if (onInstantDataRefresh) onInstantDataRefresh();
    } catch (err: any) {
      showToast(err.message || 'মুছতে সমস্যা হয়েছে');
    }
  };

  // Category Actions
  const handleAddCategory = async () => {
    if (!token) return;
    const catName = window.prompt('নতুন ক্যাটাগরির নাম লিখুন:');
    if (catName && catName.trim()) {
      try {
        await api.addCategory(token, catName.trim());
        showToast('ক্যাটাগরি যুক্ত হয়েছে!');
        loadDashboardData(true);
        if (onInstantDataRefresh) onInstantDataRefresh();
      } catch (err: any) {
        showToast(err.message || 'ক্যাটাগরি যুক্ত করা যায়নি');
      }
    }
  };

  const handleDeleteCategory = async (name: string) => {
    if (!token || !window.confirm(`"${name}" ক্যাটাগরি মুছে ফেলতে চান?`)) return;
    try {
      await api.deleteCategory(token, name);
      showToast('ক্যাটাগরি মোছা হয়েছে');
      loadDashboardData(true);
      if (onInstantDataRefresh) onInstantDataRefresh();
    } catch (err: any) {
      showToast(err.message || 'ক্যাটাগরি মোছা যায়নি');
    }
  };

  // Settings Actions
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await api.updateSettings(token, settingsForm);
      showToast('সেটিংস সফলভাবে সংরক্ষিত হয়েছে!');
      loadDashboardData(true);
      if (onInstantDataRefresh) onInstantDataRefresh();
    } catch (err: any) {
      showToast(err.message || 'সেটিংস সেভ করতে সমস্যা হয়েছে');
    }
  };

  // Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await api.changePassword(token, currentPass, newPass);
      showToast('অ্যাডমিন পাসওয়ার্ড পরিবর্তিত হয়েছে!');
      onLogin(res.newToken);
      setCurrentPass('');
      setNewPass('');
    } catch (err: any) {
      showToast(err.message || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে');
    }
  };

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    if (!adminData?.orders) return [];
    return adminData.orders.filter((order) => {
      const matchStatus = orderFilter === 'All' || order.status === orderFilter;
      const q = orderSearchQuery.trim().toLowerCase();
      const matchSearch = !q || 
        order.phone.toLowerCase().includes(q) || 
        order.trxId.toLowerCase().includes(q) ||
        (order.propertyTitle && order.propertyTitle.toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });
  }, [adminData?.orders, orderFilter, orderSearchQuery]);

  // 1. UNLOGGED VIEW: SECURE PIN FORM
  if (!token) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-3 sm:p-4 bg-slate-100">
        <div className="max-w-md w-full bg-white p-5 sm:p-8 rounded-3xl shadow-xl border border-slate-200">
          <div className="text-center mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#0B2545] text-emerald-400 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 shadow-md">
              <Key className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0B2545]">
              অ্যাডমিন প্যানেল লগইন
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              ফেনী বাসা ভাড়া পোর্টাল অ্যাডমিন নিয়ন্ত্রণ
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                অ্যাডমিন পাসওয়ার্ড / পিন
              </label>
              <input
                type="password"
                required
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="ডিফল্ট পাসওয়ার্ড: 123456"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0B2545] outline-none text-base font-semibold"
              />
              <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-600" />
                <span>সুরক্ষিত অ্যাডমিন সেশন</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 bg-[#0B2545] hover:bg-[#07182D] text-white font-bold rounded-xl transition-all shadow-md text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>যাচাই হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>লগইন করুন</span>
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => onSwitchView('public')}
                className="text-xs font-semibold text-slate-500 hover:text-[#0B2545] underline cursor-pointer"
              >
                পাবলিক ওয়েবসাইটে ফিরে যান
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 2. ERROR STATE WHILE LOADING
  if (fetchError && !adminData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-6 rounded-3xl border border-red-200 text-center space-y-4 shadow-lg">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
          <div>
            <h3 className="font-bold text-slate-900 text-base">ডাটা লোড ত্রুটি</h3>
            <p className="text-xs text-slate-500 mt-1">{fetchError}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => loadDashboardData()}
              className="flex-1 py-2.5 bg-[#0B2545] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>পুনরায় চেষ্টা করুন</span>
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2.5 bg-red-100 text-red-700 text-xs font-bold rounded-xl cursor-pointer"
            >
              লগআউট
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. LOGGED-IN VIEW: FULL DASHBOARD
  const pendingCount = adminData?.stats.pendingOrders || 0;

  return (
    <div className="min-h-screen bg-slate-100 py-3 sm:py-6 px-2 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Top Admin Header Bar */}
        <div className="bg-[#0B2545] text-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] sm:text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                অ্যাডমিন ড্যাশবোর্ড
              </span>
              {pendingCount > 0 && (
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce">
                  {pendingCount} নতুন TrxID যাচাই বাকি
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black mt-1">
              Feni House Rent এডমিন পোর্টাল
            </h1>
            <p className="text-xs text-slate-300">
              বাসা তালিকা, বিকাশ পেমেন্ট অর্ডার ও সাইট সেটিংস নিয়ন্ত্রণ করুন
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto flex-wrap">
            <button
              onClick={() => {
                loadDashboardData();
                showToast('তথ্য রিফ্রেশ হয়েছে!');
              }}
              title="তথ্য রিফ্রেশ করুন"
              className="px-3 py-2 bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>রিফ্রেশ</span>
            </button>
            <button
              onClick={() => setIsShareModalOpen(true)}
              title="কাস্টমারদের সাথে সাইট শেয়ার করুন"
              className="px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>শেয়ার হাব</span>
            </button>
            <button
              onClick={() => onSwitchView('public')}
              className="flex-1 sm:flex-none px-3 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>পাবলিক ওয়েবসাইট</span>
            </button>
            <button
              onClick={onLogout}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">লগআউট</span>
            </button>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">মোট বাসা</p>
              <h3 className="text-lg sm:text-2xl font-black text-[#0B2545] mt-0.5">
                {adminData?.stats.totalListings ?? 0}
              </h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>

          <div className={`p-3.5 sm:p-5 rounded-2xl border shadow-xs flex items-center justify-between transition-all ${
            pendingCount > 0 ? 'bg-amber-50 border-amber-300' : 'bg-white border-slate-200'
          }`}>
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase">পেন্ডিং TrxID</p>
              <h3 className="text-lg sm:text-2xl font-black text-amber-600 mt-0.5">
                {pendingCount}
              </h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">অনুমোদিত পেমেন্ট</p>
              <h3 className="text-lg sm:text-2xl font-black text-emerald-600 mt-0.5">
                {adminData?.stats.approvedOrders ?? 0}
              </h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">মোট আয়</p>
              <h3 className="text-lg sm:text-2xl font-black text-[#D12053] mt-0.5">
                ৳ {(adminData?.stats.totalRevenue ?? 0).toLocaleString()}
              </h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-pink-50 text-[#D12053] flex items-center justify-center">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
        </div>

        {/* PROMINENT LIVE WEBSITE URL & CUSTOMER SHARING CARD */}
        <WebsiteShareManager
          customUrl={settingsForm.websiteUrl}
          onOpenCustomerView={() => onSwitchView('public')}
          showToast={showToast}
          variant="card"
        />

        {/* Responsive Tabs Navigation */}
        <div className="flex overflow-x-auto gap-1.5 p-1 bg-white rounded-2xl border border-slate-200 shadow-xs text-xs font-bold no-scrollbar">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#0B2545] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>পেমেন্ট TrxID যাচাই</span>
            {pendingCount > 0 && (
              <span className="bg-amber-500 text-slate-900 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('properties')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'properties'
                ? 'bg-[#0B2545] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>বাসা বিজ্ঞাপন ব্যবস্থাপনা</span>
          </button>
          <button
            onClick={() => setActiveTab('share')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'share'
                ? 'bg-[#0B2545] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Share2 className="w-4 h-4 text-emerald-400" />
            <span>শেয়ার ও QR কোড</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#0B2545] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Sliders className="w-4 h-4 text-blue-400" />
            <span>সাইট সেটিংস</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'security'
                ? 'bg-[#0B2545] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Key className="w-4 h-4 text-pink-400" />
            <span>পাসওয়ার্ড পরিবর্তন</span>
          </button>
        </div>

        {/* TAB 1: ORDERS / PAYMENT VERIFICATION */}
        {activeTab === 'orders' && (
          <div className="bg-white p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#0B2545] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>গ্রাহকদের বিকাশ পেমেন্ট অর্ডারসমূহ</span>
                </h3>
                <p className="text-xs text-slate-500">
                  গ্রাহকের পাঠানো TrxID বিকাশ অ্যাপের সাথে মিলিয়ে অনুমোদন দিন
                </p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  placeholder="TrxID বা মোবাইল নম্বর..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0B2545]"
                />
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar text-xs font-bold">
              {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((st) => {
                const count = st === 'All'
                  ? adminData?.orders.length ?? 0
                  : adminData?.orders.filter((o) => o.status === st).length ?? 0;
                return (
                  <button
                    key={st}
                    onClick={() => setOrderFilter(st)}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      orderFilter === st
                        ? 'bg-[#0B2545] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{st === 'All' ? 'সকল অর্ডার' : st === 'Pending' ? 'পেন্ডিং' : st === 'Approved' ? 'অনুমোদিত' : 'বাতিল'}</span>
                    <span className="text-[10px] opacity-80">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Clock className="w-10 h-10 mx-auto opacity-40" />
                <p className="text-xs font-semibold">কোনো অর্ডার পাওয়া যায়নি</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                      order.status === 'Pending'
                        ? 'bg-amber-50/70 border-amber-200 shadow-2xs'
                        : order.status === 'Approved'
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-slate-50 border-slate-200 opacity-75'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-black text-xs sm:text-sm text-[#0B2545] bg-white px-2 py-0.5 rounded-md border border-slate-200 select-all">
                          {order.trxId}
                        </span>
                        {order.status === 'Pending' && (
                          <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3" /> যাচাই বাকি
                          </span>
                        )}
                        {order.status === 'Approved' && (
                          <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> অনুমোদিত
                          </span>
                        )}
                        {order.status === 'Rejected' && (
                          <span className="bg-red-100 text-red-900 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-red-600" /> বাতিল
                          </span>
                        )}
                        <span className="text-[11px] font-black text-[#D12053] bg-pink-50 border border-pink-200 px-2 py-0.5 rounded">
                          ৳ {order.amount}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-600 flex-wrap">
                        <span className="font-bold flex items-center gap-1 text-slate-800">
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <a href={`tel:${order.phone}`} className="hover:underline">{order.phone}</a>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500 text-[11px]">{order.date}</span>
                        {order.propertyTitle && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-600 italic line-clamp-1 text-[11px]">
                              {order.propertyTitle}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 self-end md:self-auto pt-1 md:pt-0">
                      {order.status === 'Pending' ? (
                        <>
                          <button
                            onClick={() => handleOrderStatus(order.id, 'Approved')}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>অনুমোদন করুন</span>
                          </button>
                          <button
                            onClick={() => handleOrderStatus(order.id, 'Rejected')}
                            className="px-3 py-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>বাতিল</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleOrderStatus(order.id, 'Pending')}
                          className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
                        >
                          পুনর্বিবেচনা
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PROPERTY LISTINGS MANAGEMENT */}
        {activeTab === 'properties' && (
          <div className="bg-white p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#0B2545] flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                  <span>বাসার তালিকা ব্যবস্থাপনা (Add / Edit / Remove)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  নতুন বাসার তথ্য পোস্ট করুন বা বিদ্যমান বাসার ভাড়া/ছবি এডিট করুন
                </p>
              </div>
              <button
                onClick={handleOpenAddProperty}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন বাসা যোগ করুন</span>
              </button>
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {adminData?.properties.map((prop) => (
                <div
                  key={prop.id}
                  className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="relative h-36 rounded-xl overflow-hidden bg-slate-200">
                      <img
                        src={prop.image}
                        alt={prop.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <span className="absolute bottom-2 left-2 bg-[#0B2545] text-white text-[11px] font-black px-2 py-0.5 rounded-md">
                        ৳ {prop.price.toLocaleString()}
                      </span>
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
                        <span className="bg-white/95 text-slate-900 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                          {prop.category}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                          prop.isAvailable !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {prop.isAvailable !== false ? 'খালি আছে (Available)' : 'বুকড (Booked)'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleAvailability(prop)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                            prop.isAvailable !== false
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200'
                          }`}
                        >
                          {prop.isAvailable !== false ? 'বুকড করুন' : 'খালি করুন'}
                        </button>
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1 leading-snug">{prop.title}</h4>
                      <p className="text-[11px] text-slate-500">{prop.location} • {prop.sqft} sqft</p>
                      <p className="text-[11px] text-emerald-800 font-bold mt-1">
                        মালিক: {prop.ownerName} ({prop.ownerPhone})
                      </p>
                      <p className="text-[10px] text-slate-600 line-clamp-1">{prop.exactAddress}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                    <button
                      onClick={() => handleOpenEditProperty(prop)}
                      className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>এডিট</span>
                    </button>
                    <button
                      onClick={() => handleDeleteProperty(prop.id)}
                      className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs cursor-pointer"
                      title="মুছুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Category manager */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-xs text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#0B2545]" />
                  <span>ক্যাটাগরি সমূহ</span>
                </h4>
                <button
                  onClick={handleAddCategory}
                  className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg cursor-pointer"
                >
                  + নতুন ক্যাটাগরি
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {adminData?.categories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200"
                  >
                    <span>{cat}</span>
                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      className="text-slate-400 hover:text-red-600 ml-1 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: WEBSITE SHARE & CUSTOMER MARKETING HUB */}
        {activeTab === 'share' && (
          <div className="space-y-4">
            <WebsiteShareManager
              customUrl={settingsForm.websiteUrl}
              onOpenCustomerView={() => onSwitchView('public')}
              showToast={showToast}
              variant="card"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Marketing Advice Card */}
              <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    📢
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-[#0B2545]">
                      প্রচার টিপস (Sharing Tips)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      কীভাবে বেশি ভাড়াটিয়া পাবেন
                    </p>
                  </div>
                </div>
                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">১</span>
                    <div>
                      <p className="font-bold text-slate-900">ফেসবুক গ্রুপে শেয়ার করুন</p>
                      <p className="text-[11px] text-slate-500">
                        "Feni House Rent", "Feni Helpline", "ফেনী বাসাবাড়ি ভাড়া" গ্রুপগুলোতে পোস্ট করুন।
                      </p>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">২</span>
                    <div>
                      <p className="font-bold text-slate-900">হোয়াটসঅ্যাপ স্ট্যাটাস দিন</p>
                      <p className="text-[11px] text-slate-500">
                        পরিচিত ফ্রেন্ডলিস্ট ও রিলেটিভদের হোয়াটসঅ্যাপে লিংক পাঠান।
                      </p>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">৩</span>
                    <div>
                      <p className="font-bold text-slate-900">অফিসের নোটিশবোর্ডে QR কোড প্রিন্ট করুন</p>
                      <p className="text-[11px] text-slate-500">
                        যেকোনো দোকানে বা গেটে QR কোড ঝুলিয়ে রাখলে স্ক্যান করে ভিজিট করতে পারবে।
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Journey Info */}
              <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    🔄
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-[#0B2545]">
                      গ্রাহকের অভিজ্ঞতার ধাপ
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      ভাড়াটিয়া কীভাবে সেবা পান
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50/50 text-emerald-900 border border-emerald-100">
                    <span className="font-bold">১ম ধাপ:</span>
                    <span>ওয়েবসাইটে বাসা ব্রাউজ ও ফিল্টার করেন</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50/50 text-blue-900 border border-blue-100">
                    <span className="font-bold">২য় ধাপ:</span>
                    <span>পছন্দের বাসার ছবি ও বিবরণ দেখেন</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-pink-50/50 text-pink-900 border border-pink-100">
                    <span className="font-bold">৩য় ধাপ (৳{settingsForm.unlockFee}):</span>
                    <span>বিকাশ করে TrxID জমা দেন</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50/50 text-amber-900 border border-amber-100">
                    <span className="font-bold">৪র্থ ধাপ:</span>
                    <span>এডমিন অনুমোদন দিলে মালিকের নম্বর দেখতে পান!</span>
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => onSwitchView('public')}
                    className="w-full py-2.5 bg-[#0B2545] hover:bg-[#07182D] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
                  >
                    <Eye className="w-4 h-4 text-emerald-400" />
                    <span>পাবলিক ওয়েবসাইট ভিউ খুলুন</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SITE SETTINGS & BKASH CONFIGURATION */}
        {activeTab === 'settings' && (
          <div className="bg-white p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base sm:text-lg font-black text-[#0B2545] flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-600" />
                <span>সাইট সেটিংস ও বিকাশ কনফিগারেশন</span>
              </h3>
              <p className="text-xs text-slate-500">
                বিকাশ পার্সোনাল নম্বর ও আনলক ফি পরিবর্তন করুন
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    নম্বর আনলক ফি (টাকা)
                  </label>
                  <input
                    type="number"
                    required
                    value={settingsForm.unlockFee}
                    onChange={(e) => setSettingsForm({ ...settingsForm, unlockFee: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-sm text-[#0B2545]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#D12053] mb-1">
                    bKash পার্সোনাল নম্বর (যে নম্বরে টাকা পাঠাবে)
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.bkashNumber}
                    onChange={(e) => setSettingsForm({ ...settingsForm, bkashNumber: e.target.value })}
                    placeholder="যেমন: 01812-345678"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-700 block mb-2">যোগাযোগের তথ্য:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">অফিস ঠিকানা</label>
                    <input
                      type="text"
                      value={settingsForm.address}
                      onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                      placeholder="ট্রাঙ্ক রোড, ফেনী"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">হেল্পলাইন ফোন</label>
                    <input
                      type="text"
                      value={settingsForm.helpPhone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, helpPhone: e.target.value })}
                      placeholder="যেমন: 01812-345678"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">ইমেইল</label>
                    <input
                      type="email"
                      value={settingsForm.email}
                      onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                      placeholder="support@fenihouserent.com"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-emerald-600 mb-1">হোয়াটসঅ্যাপ নম্বর বা লিংক</label>
                    <input
                      type="text"
                      value={settingsForm.waLink}
                      onChange={(e) => setSettingsForm({ ...settingsForm, waLink: e.target.value })}
                      placeholder="01812345678 বা https://wa.me/..."
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-700 block mb-2">সোশ্যাল মিডিয়া লিংক:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-blue-600 mb-1">Facebook পেজ</label>
                    <input
                      type="url"
                      value={settingsForm.fbLink}
                      onChange={(e) => setSettingsForm({ ...settingsForm, fbLink: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-red-600 mb-1">YouTube চ্যানেল</label>
                    <input
                      type="url"
                      value={settingsForm.ytLink}
                      onChange={(e) => setSettingsForm({ ...settingsForm, ytLink: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-sky-500 mb-1">Telegram চ্যানেল</label>
                    <input
                      type="url"
                      value={settingsForm.tgLink}
                      onChange={(e) => setSettingsForm({ ...settingsForm, tgLink: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Public Website URL Configuration */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block font-bold text-emerald-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-emerald-600" />
                    <span>পাবলিক ওয়েবসাইট URL (কাস্টম ডোমেইন)</span>
                  </span>
                  <span className="text-[10px] font-normal text-slate-500">
                    (ঐচ্ছিক)
                  </span>
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  আপনার নিজস্ব ডোমেইন থাকলে এখানে লিখুন, যাতে শেয়ার লিংক ও QR কোডে সেটি দেখায়।
                </p>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={settingsForm.websiteUrl || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, websiteUrl: e.target.value })}
                    placeholder={`যেমন: https://fenihouserent.com`}
                    className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const target = settingsForm.websiteUrl?.trim() || window.location.origin;
                      navigator.clipboard.writeText(target);
                      showToast('লিংক কপি হয়েছে!');
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>কপি</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const target = settingsForm.websiteUrl?.trim() || window.location.origin;
                      window.open(target, '_blank');
                    }}
                    className="px-3 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>ভিজিট</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl shadow-xs transition-all text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <Save className="w-4 h-4" />
                <span>সেটিংস সংরক্ষণ করুন</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: SECURITY & CHANGE PASSWORD */}
        {activeTab === 'security' && (
          <div className="bg-white p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs max-w-lg space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base sm:text-lg font-black text-[#0B2545] flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-500" />
                <span>নিরাপত্তা (পাসওয়ার্ড পরিবর্তন)</span>
              </h3>
              <p className="text-xs text-slate-500">
                নতুন অ্যাডমিন পাসওয়ার্ড বা পিন সেট করুন
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">বর্তমান পাসওয়ার্ড</label>
                <input
                  type="password"
                  required
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="বর্তমান পাসওয়ার্ড দিন"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">নতুন পাসওয়ার্ড</label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="নতুন শক্তিশালী পাসওয়ার্ড দিন"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#0B2545] hover:bg-[#07182D] active:scale-95 text-white font-bold rounded-xl shadow-xs transition-all text-xs cursor-pointer"
              >
                পাসওয়ার্ড পরিবর্তন নিশ্চিত করুন
              </button>
            </form>
          </div>
        )}
      </div>

      {/* PROPERTY ADD/EDIT MODAL */}
      {isPropertyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-6 relative shadow-2xl border border-slate-100 my-auto max-h-[92dvh] overflow-y-auto">
            <button
              onClick={() => setIsPropertyModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 cursor-pointer text-xl"
            >
              ✕
            </button>

            <h3 className="text-base sm:text-lg font-black text-[#0B2545] mb-4 pb-2 border-b border-slate-100">
              {editingPropertyId ? 'বাসার তথ্য এডিট করুন' : 'নতুন বাসা বিজ্ঞাপন দিন'}
            </h3>

            <form onSubmit={handleSaveProperty} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">বাসার শিরোনাম (Title)</label>
                <input
                  type="text"
                  required
                  value={propertyForm.title}
                  onChange={(e) => setPropertyForm({ ...propertyForm, title: e.target.value })}
                  placeholder="যেমন: ৩ রুমের সুন্দর খোলামেলা ফ্যামিলি বাসা"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ক্যাটাগরি</label>
                  <select
                    value={propertyForm.category}
                    onChange={(e) => setPropertyForm({ ...propertyForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    {adminData?.categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">উপজেলা / এলাকা</label>
                  <select
                    value={propertyForm.location}
                    onChange={(e) => setPropertyForm({ ...propertyForm, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="Feni Sadar">ফেনী সদর</option>
                    <option value="Daganbhuiyan">দাগনভূঞা</option>
                    <option value="Sonagazi">সোনাগাজী</option>
                    <option value="Parshuram">পরশুরাম</option>
                    <option value="Chhagalnaiya">ছাগলনাইয়া</option>
                    <option value="Fulgazi">ফুলগাজী</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">সঠিক ঠিকানা ও রোড নম্বর</label>
                <input
                  type="text"
                  required
                  value={propertyForm.exactAddress}
                  onChange={(e) => setPropertyForm({ ...propertyForm, exactAddress: e.target.value })}
                  placeholder="যেমন: বাড়ি নং ১২, রোড ৩, মাস্টারপাড়া, ফেনী সদর"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ভাড়া (টাকা/মাস)</label>
                  <input
                    type="number"
                    required
                    value={propertyForm.price}
                    onChange={(e) => setPropertyForm({ ...propertyForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">আয়তন (Sqft)</label>
                  <input
                    type="number"
                    required
                    value={propertyForm.sqft}
                    onChange={(e) => setPropertyForm({ ...propertyForm, sqft: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">বেডরুম সংখ্যা</label>
                  <input
                    type="number"
                    required
                    value={propertyForm.beds}
                    onChange={(e) => setPropertyForm({ ...propertyForm, beds: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">বাথরুম সংখ্যা</label>
                  <input
                    type="number"
                    required
                    value={propertyForm.baths}
                    onChange={(e) => setPropertyForm({ ...propertyForm, baths: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">মালিকের নাম</label>
                  <input
                    type="text"
                    required
                    value={propertyForm.ownerName}
                    onChange={(e) => setPropertyForm({ ...propertyForm, ownerName: e.target.value })}
                    placeholder="যেমন: হাজী আবদুর রহমান"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">মালিকের মোবাইল</label>
                  <input
                    type="tel"
                    required
                    value={propertyForm.ownerPhone}
                    onChange={(e) => setPropertyForm({ ...propertyForm, ownerPhone: e.target.value })}
                    placeholder="017XXXXXXXX"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Availability Status Selection */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
                <label className="block font-bold text-slate-800 text-xs">লভ্যতা স্ট্যাটাস:</label>
                <div className="flex gap-4 text-xs pt-0.5">
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold text-emerald-800">
                    <input
                      type="radio"
                      name="propAvailability"
                      checked={propertyForm.isAvailable === true}
                      onChange={() => setPropertyForm({ ...propertyForm, isAvailable: true })}
                      className="accent-emerald-600 w-4 h-4 cursor-pointer"
                    />
                    <span>খালি আছে (Available)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold text-red-800">
                    <input
                      type="radio"
                      name="propAvailability"
                      checked={propertyForm.isAvailable === false}
                      onChange={() => setPropertyForm({ ...propertyForm, isAvailable: false })}
                      className="accent-red-600 w-4 h-4 cursor-pointer"
                    />
                    <span>ভাড়া হয়ে গেছে (Booked)</span>
                  </label>
                </div>
              </div>

              {/* Image URL Input with Live Preview Next to It */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">বাসার ছবি URL ও লাইভ প্রিভিউ</label>
                <div className="flex flex-col sm:flex-row gap-3 items-start">
                  <div className="flex-1 w-full space-y-1.5">
                    <input
                      type="url"
                      required
                      value={propertyForm.image}
                      onChange={(e) => setPropertyForm({ ...propertyForm, image: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                    {/* Quick sample image presets */}
                    <div className="flex flex-wrap items-center gap-1 text-[10px]">
                      <span className="text-slate-400 font-bold">নমুনা ছবি:</span>
                      <button
                        type="button"
                        onClick={() => setPropertyForm({ ...propertyForm, image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80' })}
                        className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 cursor-pointer"
                      >
                        ফ্যামিলি ফ্ল্যাট
                      </button>
                      <button
                        type="button"
                        onClick={() => setPropertyForm({ ...propertyForm, image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80' })}
                        className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 cursor-pointer"
                      >
                        আধুনিক অ্যাপার্টমেন্ট
                      </button>
                      <button
                        type="button"
                        onClick={() => setPropertyForm({ ...propertyForm, image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80' })}
                        className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 cursor-pointer"
                      >
                        সিঙ্গেল রুম
                      </button>
                    </div>
                  </div>
                  {/* Live Preview Thumbnail Box */}
                  <div className="w-28 h-20 sm:w-32 sm:h-22 rounded-xl overflow-hidden border-2 border-slate-300 bg-slate-100 relative flex-shrink-0 shadow-2xs">
                    <img
                      src={propertyForm.image}
                      alt="Live Preview"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
                      }}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 bg-black/75 text-white text-[9px] font-bold px-1 rounded backdrop-blur-2xs">
                      প্রিভিউ
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-xs sm:text-sm mt-2 shadow-xs cursor-pointer"
              >
                বিজ্ঞাপন প্রকাশ করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Standalone Website Share Modal Popup */}
      <WebsiteShareManager
        customUrl={settingsForm.websiteUrl}
        onOpenCustomerView={() => onSwitchView('public')}
        showToast={showToast}
        variant="modal"
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
};
