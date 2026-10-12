import { PublicDataResponse, AdminDataResponse, Property, SiteSettings } from './types';

function getAdminHeaders(token: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-admin-token': token,
    'Authorization': `Bearer ${token}`
  };
}

export const api = {
  // Fetch initial public data (settings, categories, properties) with instant fresh data
  async getPublicData(userTrxId?: string | null, isInstantRefresh: boolean = false): Promise<PublicDataResponse> {
    const params = new URLSearchParams();
    if (userTrxId) params.set('trxId', userTrxId);
    params.set('_t', String(Date.now()));
    if (isInstantRefresh) {
      params.set('instant', 'true');
    }
    const queryStr = `?${params.toString()}`;

    const headers: Record<string, string> = { 
      'Accept': 'application/json',
      'Cache-Control': 'no-cache, no-store'
    };
    if (userTrxId) {
      headers['x-user-trx'] = userTrxId;
    }
    if (isInstantRefresh) {
      headers['x-instant-refresh'] = 'true';
    }

    const res = await fetch(`/api/data${queryStr}`, { 
      headers,
      cache: 'no-store'
    });
    if (!res.ok) throw new Error('সার্ভার থেকে তথ্য লোড করা যায়নি');
    return res.json();
  },

  // Check TrxID status
  async checkTrx(trxId: string): Promise<{ found: boolean; status: 'Pending' | 'Approved' | 'Rejected' | 'NotFound' }> {
    const res = await fetch(`/api/orders/check/${encodeURIComponent(trxId.trim().toUpperCase())}?_t=${Date.now()}`, {
      cache: 'no-store'
    });
    if (!res.ok) throw new Error('স্ট্যাটাস চেক করা ব্যর্থ হয়েছে');
    return res.json();
  },

  // Submit payment TrxID
  async submitOrder(data: { phone: string; trxId: string; propertyId?: number; propertyTitle?: string }) {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'অর্ডার সাবমিট করতে সমস্যা হয়েছে');
    return result;
  },

  // Submit 5-star rating & review for property
  async submitReview(propertyId: number, data: { rating: number; comment: string; author: string }) {
    const res = await fetch(`/api/properties/${propertyId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'রিভিউ সংরক্ষণ করা যায়নি');
    return result;
  },

  // Admin login
  async adminLogin(password: string): Promise<{ success: boolean; token?: string; error?: string }> {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'পাসওয়ার্ড ভুল হয়েছে!');
    return result;
  },

  // Admin fetch full dashboard data with cache busting
  async getAdminData(token: string): Promise<AdminDataResponse> {
    const res = await fetch(`/api/admin/data?_t=${Date.now()}`, {
      headers: getAdminHeaders(token),
      cache: 'no-store'
    });
    if (res.status === 401) {
      throw new Error('UNAUTHORIZED_TOKEN');
    }
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || 'অ্যাডমিন ডেটা লোড ব্যর্থ হয়েছে');
    }
    return res.json();
  },

  // Update site settings
  async updateSettings(token: string, settings: Partial<SiteSettings>) {
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: getAdminHeaders(token),
      body: JSON.stringify(settings)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'সেটিংস আপডেট হয়নি');
    return result;
  },

  // Change admin password
  async changePassword(token: string, currentPass: string, newPass: string) {
    const res = await fetch('/api/admin/password', {
      method: 'POST',
      headers: getAdminHeaders(token),
      body: JSON.stringify({ currentPass, newPass })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'পাসওয়ার্ড পরিবর্তন হয়নি');
    return result;
  },

  // Add category
  async addCategory(token: string, name: string) {
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: getAdminHeaders(token),
      body: JSON.stringify({ name })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'ক্যাটাগরি যোগ করা যায়নি');
    return result;
  },

  // Delete category
  async deleteCategory(token: string, name: string) {
    const res = await fetch(`/api/admin/categories/${encodeURIComponent(name)}`, {
      method: 'DELETE',
      headers: getAdminHeaders(token)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'ক্যাটাগরি মোছা যায়নি');
    return result;
  },

  // Add property
  async addProperty(token: string, property: Omit<Property, 'id'>) {
    const res = await fetch('/api/admin/properties', {
      method: 'POST',
      headers: getAdminHeaders(token),
      body: JSON.stringify(property)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'বাসার তথ্য সংরক্ষণ করা যায়নি');
    return result;
  },

  // Update property
  async updateProperty(token: string, id: number, property: Partial<Property>) {
    const res = await fetch(`/api/admin/properties/${id}`, {
      method: 'PUT',
      headers: getAdminHeaders(token),
      body: JSON.stringify(property)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'বাসার তথ্য আপডেট করা যায়নি');
    return result;
  },

  // Delete property
  async deleteProperty(token: string, id: number) {
    const res = await fetch(`/api/admin/properties/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders(token)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'বাসার তথ্য মোছা যায়নি');
    return result;
  },

  // Update order status
  async updateOrderStatus(token: string, orderId: string, status: 'Pending' | 'Approved' | 'Rejected') {
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: getAdminHeaders(token),
      body: JSON.stringify({ status })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'অর্ডার স্ট্যাটাস আপডেট করা যায়নি');
    return result;
  },

  // Delete order
  async deleteOrder(token: string, orderId: string) {
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'DELETE',
      headers: getAdminHeaders(token)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'অর্ডার মোছা যায়নি');
    return result;
  }
};
