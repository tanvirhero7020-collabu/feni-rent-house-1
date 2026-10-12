import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import compression from 'compression';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DB_FILE = path.join(__dirname, 'data', 'db.json');

// Enable Gzip/Brotli compression for all HTTP responses
app.use(compression({
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

// Robust CORS & Security Headers
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-admin-token, x-user-trx, x-instant-refresh');
  res.header('X-Content-Type-Options', 'nosniff');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Middleware for parsing JSON with generous payload limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database Types
export interface Review {
  id: string;
  propertyId: number;
  rating: number;
  comment: string;
  author: string;
  date: string;
  timestamp: number;
}

export interface Property {
  id: number;
  title: string;
  category: string;
  location: string;
  exactAddress: string;
  price: number;
  sqft: number;
  beds: number;
  baths: number;
  ownerName: string;
  ownerPhone: string;
  image: string;
  isAvailable?: boolean;
  featured?: boolean;
  createdAt?: string;
  reviews?: Review[];
  avgRating?: number;
  reviewCount?: number;
}

export interface Order {
  id: string;
  phone: string;
  method: string;
  trxId: string;
  amount: number;
  propertyId?: number;
  propertyTitle?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  date: string;
  timestamp: number;
}

export interface Settings {
  unlockFee: number;
  bkashNumber: string;
  adminPass: string;
  address: string;
  helpPhone: string;
  email: string;
  fbLink: string;
  waLink: string;
  ytLink: string;
  tgLink: string;
  websiteUrl?: string;
}

export interface DB {
  settings: Settings;
  categories: string[];
  properties: Property[];
  orders: Order[];
  reviews: Review[];
}

const defaultDB: DB = {
  settings: {
    unlockFee: 100,
    bkashNumber: '01812-345678',
    adminPass: '123456',
    address: 'ট্রাঙ্ক রোড, ফেনী সদর, ফেনী',
    helpPhone: '01812-345678',
    email: 'support@fenihouserent.com',
    fbLink: 'https://facebook.com',
    waLink: '01812345678',
    ytLink: 'https://youtube.com',
    tgLink: 'https://telegram.org',
    websiteUrl: process.env.APP_URL || ''
  },
  categories: ['Family House', 'Apartment', 'Single Room', 'Bachelor Mess', 'Flat', 'Sublet / Room'],
  properties: [
    {
      id: 101,
      title: '৩ রুমের আধুনিক ড্রয়িং ডাইনিং সহ ফ্যামিলি ফ্ল্যাট',
      category: 'Family House',
      location: 'Feni Sadar',
      exactAddress: 'বাড়ি নং ১২, রোড ৩, মাস্টারপাড়া, ফেনী সদর',
      price: 14500,
      sqft: 1350,
      beds: 3,
      baths: 2,
      ownerName: 'হাজী আবদুর রহমান',
      ownerPhone: '01711-234567',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      isAvailable: true,
      featured: true,
      createdAt: '2026-10-10'
    }
  ],
  orders: [],
  reviews: []
};

// Database Engine & Fast In-Memory Lookup Indexes
let db: DB = defaultDB;
let dbVersion = Date.now();
const orderTrxIndex = new Map<string, Order>();
const orderIdIndex = new Map<string, Order>();
const propertyIdIndex = new Map<number, Property>();

function rebuildIndexes(): void {
  orderTrxIndex.clear();
  orderIdIndex.clear();
  propertyIdIndex.clear();
  if (Array.isArray(db.orders)) {
    for (const order of db.orders) {
      if (order && order.trxId) {
        orderTrxIndex.set(order.trxId.toUpperCase(), order);
      }
      if (order && order.id) {
        orderIdIndex.set(order.id, order);
      }
    }
  }
  if (Array.isArray(db.properties)) {
    for (const prop of db.properties) {
      if (prop && prop.id) {
        propertyIdIndex.set(prop.id, prop);
      }
    }
  }
}

function loadDatabase(): void {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      db = {
        settings: { ...defaultDB.settings, ...(parsed.settings || {}) },
        categories: Array.isArray(parsed.categories) ? parsed.categories : defaultDB.categories,
        properties: Array.isArray(parsed.properties) ? parsed.properties : defaultDB.properties,
        orders: Array.isArray(parsed.orders) ? parsed.orders : [],
        reviews: Array.isArray(parsed.reviews) ? parsed.reviews : []
      };
    } else {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultDB, null, 2), 'utf-8');
      db = defaultDB;
    }
  } catch (err) {
    console.error('[DB] Failed to load database file, recovering safely:', err);
    db = defaultDB;
  }
  rebuildIndexes();
}

function persistToDiskSync(): void {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const tempFile = `${DB_FILE}.tmp.${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const serialized = JSON.stringify(db, null, 2);
    fs.writeFileSync(tempFile, serialized, 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
    dbVersion = Date.now();
  } catch (err) {
    console.error('[DB] Persistence error:', err);
  }
}

function triggerSave(): void {
  rebuildIndexes();
  dbVersion = Date.now();
  cachedSanitizedPublicProps = null;
  persistToDiskSync();
}

// Initial Database Boot
loadDatabase();

// Admin Authentication Helper
function verifyAdmin(req: Request, res: Response, next: NextFunction): void {
  const headerToken = req.headers['x-admin-token'] as string;
  const authHeader = req.headers['authorization'];
  const bearerToken = authHeader ? authHeader.replace(/^Bearer\s+/i, '').trim() : '';
  const queryToken = req.query.token as string;
  const bodyToken = req.body?.token as string;
  const providedToken = (headerToken || bearerToken || queryToken || bodyToken || '').trim();
  const currentSecret = String(db.settings.adminPass || '123456').trim();

  if (!providedToken || providedToken !== currentSecret) {
    res.status(401).json({
      error: 'অননুমোদিত অ্যাক্সেস (Unauthorized - invalid or expired admin token)',
      code: 'UNAUTHORIZED'
    });
    return;
  }
  next();
}

// Health & System status
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: Date.now(), version: dbVersion });
});

// Rate limiting for admin login
const failedLoginAttempts = new Map<string, { count: number; lockedUntil: number }>();

function checkLoginRateLimit(ip: string): { allowed: boolean; waitSeconds?: number } {
  const record = failedLoginAttempts.get(ip);
  if (!record) return { allowed: true };
  const now = Date.now();
  if (record.lockedUntil > now) {
    const waitSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return { allowed: false, waitSeconds };
  }
  if (record.lockedUntil <= now && record.count >= 5) {
    failedLoginAttempts.delete(ip);
    return { allowed: true };
  }
  return { allowed: true };
}

function recordFailedLogin(ip: string): void {
  const now = Date.now();
  const record = failedLoginAttempts.get(ip) || { count: 0, lockedUntil: 0 };
  record.count += 1;
  if (record.count >= 5) {
    record.lockedUntil = now + 5 * 60 * 1000;
  }
  failedLoginAttempts.set(ip, record);
}

function clearFailedLogin(ip: string): void {
  failedLoginAttempts.delete(ip);
}

// Memory cache for sanitized public properties
let cachedSanitizedPublicProps: any[] | null = null;
let cachedSanitizedVersion = 0;

function getSanitizedProperties(isAuthorized: boolean) {
  const allReviews = Array.isArray(db.reviews) ? db.reviews : [];

  if (isAuthorized) {
    return db.properties.map(p => {
      const propReviews = allReviews.filter(r => r.propertyId === p.id);
      const count = propReviews.length;
      const avg = count > 0 
        ? Number((propReviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1))
        : 5.0;
      return {
        ...p,
        reviews: propReviews,
        avgRating: avg,
        reviewCount: count
      };
    });
  }

  if (cachedSanitizedPublicProps && cachedSanitizedVersion === dbVersion) {
    return cachedSanitizedPublicProps;
  }

  const publicProps = db.properties.map(p => {
    const propReviews = allReviews.filter(r => r.propertyId === p.id);
    const count = propReviews.length;
    const avg = count > 0 
      ? Number((propReviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1))
      : 5.0;
    return {
      ...p,
      ownerPhone: '018**-****** (লক করা)',
      exactAddress: `${p.location} (হোল্ডিং ও রোড নম্বর লক করা)`,
      ownerName: 'মালিক (লক করা)',
      reviews: propReviews,
      avgRating: avg,
      reviewCount: count
    };
  });

  cachedSanitizedPublicProps = publicProps;
  cachedSanitizedVersion = dbVersion;
  return publicProps;
}

// Single Fast Bootstrap API with Server-Side Privacy Masking
app.get('/api/data', (req: Request, res: Response) => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const stats = fs.statSync(DB_FILE);
      if (stats.mtimeMs > dbVersion) {
        loadDatabase();
        cachedSanitizedPublicProps = null;
      }
    }
  } catch (err) {
    // ignore
  }

  const queryTrx = String(req.query.trxId || '').trim().toUpperCase();
  const headerTrx = String(req.headers['x-user-trx'] || '').trim().toUpperCase();
  const userTrx = queryTrx || headerTrx;

  let isApprovedUser = false;
  if (userTrx) {
    const order = orderTrxIndex.get(userTrx);
    if (order && order.status === 'Approved') {
      isApprovedUser = true;
    }
  }

  const adminHeader = String(req.headers['x-admin-token'] || req.headers['authorization']?.replace(/^Bearer\s+/i, '') || '').trim();
  const isAdmin = adminHeader && adminHeader === String(db.settings.adminPass || '123456').trim();

  const isAuthorized = isApprovedUser || Boolean(isAdmin);
  const sanitizedProperties = getSanitizedProperties(isAuthorized);
  const { adminPass, ...safeSettings } = db.settings;

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.json({
    settings: safeSettings,
    categories: db.categories,
    properties: sanitizedProperties,
    version: dbVersion,
    timestamp: Date.now(),
    isUnlocked: isAuthorized
  });
});

// Check single TrxID status
app.get('/api/orders/check/:trxId', (req: Request, res: Response) => {
  const rawTrx = req.params.trxId || '';
  const cleanTrx = String(rawTrx).trim().toUpperCase();
  const found = orderTrxIndex.get(cleanTrx);

  if (!found) {
    res.json({ found: false, status: 'NotFound' });
    return;
  }

  res.json({
    found: true,
    status: found.status,
    phone: found.phone,
    amount: found.amount,
    date: found.date
  });
});

// Submit user order / payment TrxID
app.post('/api/orders', (req: Request, res: Response) => {
  try {
    const { phone, trxId, propertyId, propertyTitle } = req.body || {};
    if (!phone || !trxId) {
      res.status(400).json({ error: 'ফোন নম্বর এবং ট্রানজেকশন আইডি (TrxID) আবশ্যক!' });
      return;
    }

    const cleanPhone = String(phone).replace(/[^\d+]/g, '').trim();
    const cleanTrx = String(trxId).trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (cleanPhone.length < 8) {
      res.status(400).json({ error: 'সঠিক মোবাইল নম্বর দিন!' });
      return;
    }
    if (cleanTrx.length < 4) {
      res.status(400).json({ error: 'সঠিক বিকাশ TrxID দিন!' });
      return;
    }

    const existing = orderTrxIndex.get(cleanTrx);
    if (existing) {
      res.json({
        success: true,
        alreadyExisted: true,
        order: existing,
        message: existing.status === 'Approved'
          ? 'এই TrxID ইতিপূর্বে অনুমোদিত হয়েছে!'
          : 'এই TrxID-টি পূর্বে জমা হয়েছে এবং যাচাই প্রক্রিয়াধীন রয়েছে।'
      });
      return;
    }

    const uniqueId = `PAY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: uniqueId,
      phone: cleanPhone,
      method: 'bKash',
      trxId: cleanTrx,
      amount: Number(db.settings.unlockFee) || 100,
      propertyId: propertyId ? Number(propertyId) : undefined,
      propertyTitle: propertyTitle ? String(propertyTitle).slice(0, 150) : undefined,
      status: 'Pending',
      date: new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }),
      timestamp: Date.now()
    };

    if (!Array.isArray(db.orders)) {
      db.orders = [];
    }
    db.orders.unshift(newOrder);
    triggerSave();

    res.status(201).json({
      success: true,
      order: newOrder,
      message: 'আপনার বিকাশ TrxID সফলভাবে জমা হয়েছে। যাচাই চলছে...'
    });
  } catch (err) {
    console.error('[API] Order submission error:', err);
    res.status(500).json({ error: 'সার্ভার ত্রুটি' });
  }
});

// Submit 5-star rating & review
app.post('/api/properties/:id/reviews', (req: Request, res: Response) => {
  try {
    const propertyId = Number(req.params.id);
    const { rating, comment, author } = req.body || {};

    const prop = db.properties.find(p => p.id === propertyId);
    if (!prop) {
      res.status(404).json({ error: 'বাসাটি পাওয়া যায়নি!' });
      return;
    }

    const numRating = Math.max(1, Math.min(5, Number(rating) || 5));
    const cleanComment = String(comment || '').trim();
    const cleanAuthor = String(author || '').trim() || 'ফেনী ভাড়াটিয়া';

    if (!cleanComment) {
      res.status(400).json({ error: 'মন্তব্য প্রদান করুন!' });
      return;
    }

    const newReview: Review = {
      id: `REV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      propertyId,
      rating: numRating,
      comment: cleanComment,
      author: cleanAuthor,
      date: new Date().toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      timestamp: Date.now()
    };

    if (!Array.isArray(db.reviews)) {
      db.reviews = [];
    }
    db.reviews.unshift(newReview);
    triggerSave();

    const propReviews = db.reviews.filter(r => r.propertyId === propertyId);
    const avg = Number((propReviews.reduce((sum, r) => sum + r.rating, 0) / propReviews.length).toFixed(1));

    res.status(201).json({
      success: true,
      review: newReview,
      reviews: propReviews,
      avgRating: avg,
      reviewCount: propReviews.length,
      message: 'রিভিউ সফলভাবে গৃহীত হয়েছে'
    });
  } catch (err) {
    console.error('[API] Review submit error:', err);
    res.status(500).json({ error: 'সার্ভার ত্রুটি' });
  }
});

// Admin login verification
app.post('/api/admin/login', async (req: Request, res: Response) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const rateLimit = checkLoginRateLimit(clientIp);

  if (!rateLimit.allowed) {
    res.status(429).json({
      success: false,
      error: `অতিরিক্ত চেষ্টার কারণে ব্লক। দয়া করে ${rateLimit.waitSeconds} সেকেন্ড পর চেষ্টা করুন।`
    });
    return;
  }

  const { password } = req.body || {};
  const currentPass = String(db.settings.adminPass || '123456').trim();

  if (!password || String(password).trim() !== currentPass) {
    recordFailedLogin(clientIp);
    await new Promise((resolve) => setTimeout(resolve, 600));
    res.status(401).json({ success: false, error: 'ভুল পাসওয়ার্ড!' });
    return;
  }

  clearFailedLogin(clientIp);
  res.json({
    success: true,
    token: currentPass,
    message: 'লগইন সফল'
  });
});

// Admin get dashboard data
app.get('/api/admin/data', verifyAdmin, (_req: Request, res: Response) => {
  try {
    const ordersList = Array.isArray(db.orders) ? db.orders : [];
    const propertiesList = Array.isArray(db.properties) ? db.properties : [];

    const totalListings = propertiesList.length;
    const pendingOrders = ordersList.filter(o => o && o.status === 'Pending').length;
    const approvedOrders = ordersList.filter(o => o && o.status === 'Approved').length;
    const rejectedOrders = ordersList.filter(o => o && o.status === 'Rejected').length;
    
    const totalRevenue = ordersList
      .filter(o => o && o.status === 'Approved')
      .reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.json({
      settings: db.settings,
      categories: db.categories || [],
      properties: propertiesList,
      orders: ordersList,
      stats: {
        totalListings,
        pendingOrders,
        approvedOrders,
        rejectedOrders,
        totalRevenue
      },
      version: dbVersion
    });
  } catch (err) {
    console.error('[API] Admin data error:', err);
    res.status(500).json({ error: 'সার্ভার ত্রুটি' });
  }
});

// Update settings
app.post('/api/admin/settings', verifyAdmin, (req: Request, res: Response) => {
  try {
    const s = req.body || {};
    if (s.unlockFee !== undefined) db.settings.unlockFee = Math.max(1, Number(s.unlockFee) || 100);
    if (s.bkashNumber !== undefined) db.settings.bkashNumber = String(s.bkashNumber).trim();
    if (s.address !== undefined) db.settings.address = String(s.address).trim();
    if (s.helpPhone !== undefined) db.settings.helpPhone = String(s.helpPhone).trim();
    if (s.email !== undefined) db.settings.email = String(s.email).trim();
    if (s.fbLink !== undefined) db.settings.fbLink = String(s.fbLink).trim();
    if (s.waLink !== undefined) db.settings.waLink = String(s.waLink).trim();
    if (s.ytLink !== undefined) db.settings.ytLink = String(s.ytLink).trim();
    if (s.tgLink !== undefined) db.settings.tgLink = String(s.tgLink).trim();
    if (s.websiteUrl !== undefined) db.settings.websiteUrl = String(s.websiteUrl).trim();

    triggerSave();
    res.json({ success: true, settings: db.settings });
  } catch (err) {
    console.error('[API] Save settings error:', err);
    res.status(500).json({ error: 'সার্ভার ত্রুটি' });
  }
});

// Change admin password
app.post('/api/admin/password', verifyAdmin, (req: Request, res: Response) => {
  const { currentPass, newPass } = req.body || {};
  const actualPass = String(db.settings.adminPass || '123456').trim();

  if (!currentPass || String(currentPass).trim() !== actualPass) {
    res.status(400).json({ error: 'বর্তমান পাসওয়ার্ড ভুল!' });
    return;
  }
  if (!newPass || String(newPass).trim().length < 4) {
    res.status(400).json({ error: 'নতুন পাসওয়ার্ড ন্যূনতম ৪ অক্ষরের হতে হবে!' });
    return;
  }

  const cleanPass = String(newPass).trim();
  db.settings.adminPass = cleanPass;
  triggerSave();
  res.json({ success: true, newToken: cleanPass, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে' });
});

// Categories
app.post('/api/admin/categories', verifyAdmin, (req: Request, res: Response) => {
  const { name } = req.body || {};
  if (!name || !String(name).trim()) {
    res.status(400).json({ error: 'ক্যাটাগরির নাম দিন!' });
    return;
  }
  const clean = String(name).trim();
  if (!db.categories.includes(clean)) {
    db.categories.push(clean);
    triggerSave();
  }
  res.json({ success: true, categories: db.categories });
});

app.delete('/api/admin/categories/:name', verifyAdmin, (req: Request, res: Response) => {
  const target = decodeURIComponent(req.params.name);
  db.categories = db.categories.filter(c => c !== target);
  triggerSave();
  res.json({ success: true, categories: db.categories });
});

// Properties CRUD
app.post('/api/admin/properties', verifyAdmin, (req: Request, res: Response) => {
  try {
    const p = req.body || {};
    if (!p.title || !p.ownerPhone || !p.exactAddress) {
      res.status(400).json({ error: 'আবশ্যকীয় তথ্য প্রদান করুন!' });
      return;
    }

    const newProperty: Property = {
      id: Date.now(),
      title: String(p.title).trim(),
      category: String(p.category || 'Family House').trim(),
      location: String(p.location || 'Feni Sadar').trim(),
      exactAddress: String(p.exactAddress).trim(),
      price: Math.max(0, Number(p.price) || 0),
      sqft: Math.max(0, Number(p.sqft) || 0),
      beds: Math.max(0, Number(p.beds) || 1),
      baths: Math.max(0, Number(p.baths) || 1),
      ownerName: String(p.ownerName || 'বাড়িওয়ালা').trim(),
      ownerPhone: String(p.ownerPhone).trim(),
      image: String(p.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80').trim(),
      isAvailable: p.isAvailable !== undefined ? Boolean(p.isAvailable) : true,
      featured: Boolean(p.featured),
      createdAt: new Date().toISOString().split('T')[0]
    };

    if (!Array.isArray(db.properties)) {
      db.properties = [];
    }
    db.properties.unshift(newProperty);
    triggerSave();

    res.status(201).json({ success: true, property: newProperty, properties: db.properties });
  } catch (err) {
    console.error('[API] Property add error:', err);
    res.status(500).json({ error: 'সার্ভার ত্রুটি' });
  }
});

app.put('/api/admin/properties/:id', verifyAdmin, (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const p = req.body || {};
    const index = db.properties.findIndex(item => item.id === id);

    if (index === -1) {
      res.status(404).json({ error: 'বাসাটি খুঁজে পাওয়া যায়নি!' });
      return;
    }

    db.properties[index] = {
      ...db.properties[index],
      title: p.title !== undefined ? String(p.title).trim() : db.properties[index].title,
      category: p.category !== undefined ? String(p.category).trim() : db.properties[index].category,
      location: p.location !== undefined ? String(p.location).trim() : db.properties[index].location,
      exactAddress: p.exactAddress !== undefined ? String(p.exactAddress).trim() : db.properties[index].exactAddress,
      price: p.price !== undefined ? Math.max(0, Number(p.price) || 0) : db.properties[index].price,
      sqft: p.sqft !== undefined ? Math.max(0, Number(p.sqft) || 0) : db.properties[index].sqft,
      beds: p.beds !== undefined ? Math.max(0, Number(p.beds) || 0) : db.properties[index].beds,
      baths: p.baths !== undefined ? Math.max(0, Number(p.baths) || 0) : db.properties[index].baths,
      ownerName: p.ownerName !== undefined ? String(p.ownerName).trim() : db.properties[index].ownerName,
      ownerPhone: p.ownerPhone !== undefined ? String(p.ownerPhone).trim() : db.properties[index].ownerPhone,
      image: p.image !== undefined ? String(p.image).trim() : db.properties[index].image,
      isAvailable: p.isAvailable !== undefined ? Boolean(p.isAvailable) : (db.properties[index].isAvailable ?? true),
      featured: p.featured !== undefined ? Boolean(p.featured) : db.properties[index].featured
    };

    triggerSave();
    res.json({ success: true, property: db.properties[index], properties: db.properties });
  } catch (err) {
    console.error('[API] Property update error:', err);
    res.status(500).json({ error: 'সার্ভার ত্রুটি' });
  }
});

app.delete('/api/admin/properties/:id', verifyAdmin, (req: Request, res: Response) => {
  const id = Number(req.params.id);
  db.properties = db.properties.filter(p => p.id !== id);
  triggerSave();
  res.json({ success: true, properties: db.properties });
});

// Order approval/rejection
app.patch('/api/admin/orders/:id', verifyAdmin, (req: Request, res: Response) => {
  const orderId = req.params.id;
  const { status } = req.body || {};
  const order = db.orders.find(o => o.id === orderId);

  if (!order) {
    res.status(404).json({ error: 'অর্ডারটি পাওয়া যায়নি!' });
    return;
  }

  if (['Pending', 'Approved', 'Rejected'].includes(status)) {
    order.status = status;
    triggerSave();
    res.json({ success: true, order, orders: db.orders });
  } else {
    res.status(400).json({ error: 'অবৈধ স্ট্যাটাস!' });
  }
});

app.delete('/api/admin/orders/:id', verifyAdmin, (req: Request, res: Response) => {
  const orderId = req.params.id;
  db.orders = db.orders.filter(o => o.id !== orderId);
  triggerSave();
  res.json({ success: true, orders: db.orders });
});

// Dynamic SEO Head Injection
function injectDynamicHead(html: string, req: Request): string {
  try {
    const origin = (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
    const propId = req.query.property ? Number(req.query.property) : null;
    const category = req.query.category ? String(req.query.category) : null;
    const location = req.query.location ? String(req.query.location) : null;
    const searchQuery = req.query.q ? String(req.query.q) : null;
    const isAdmin = req.path.includes('/admin') || req.path.endsWith('admin');

    let title = 'Feni House Rent - সেরা বাসা ও মেস ভাড়া পোর্টাল';
    let description = 'ফেনী শহরের আবাসিক ও বাণিজ্যিক বাসা ভাড়া, ফ্ল্যাট ও ব্যাচেলর মেস টু-লেট পোর্টাল। সরাসরি মালিকের যোগাযোগ নম্বর।';
    let image = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';
    let canonical = `${origin}${req.path}`;
    let jsonLd: Record<string, any> = {};

    if (isAdmin) {
      title = 'অ্যাডমিন ড্যাশবোর্ড | Feni House Rent';
      description = 'Feni House Rent অ্যাডমিন পোর্টাল - বাসা তালিকা ও পেমেন্ট অর্ডার ব্যবস্থাপনা।';
      canonical = `${origin}/#admin`;
    } else if (propId) {
      const prop = db.properties.find(p => p.id === propId);
      if (prop) {
        const formattedPrice = `৳${prop.price.toLocaleString()}/মাস`;
        title = `${prop.title} (${formattedPrice}) | Feni House Rent`;
        description = `${prop.title} - এলাকা: ${prop.location} (${prop.exactAddress})। ${prop.beds} বেড, ${prop.baths} বাথ, ${prop.sqft} sqft। ভাড়া: ${formattedPrice}`;
        image = prop.image || image;
        canonical = `${origin}/?property=${prop.id}`;
        jsonLd = {
          '@context': 'https://schema.org',
          '@type': 'Apartment',
          'name': prop.title,
          'description': description,
          'image': image,
          'url': canonical,
          'address': {
            '@type': 'PostalAddress',
            'streetAddress': prop.exactAddress,
            'addressLocality': prop.location,
            'addressRegion': 'Feni',
            'addressCountry': 'BD'
          },
          'numberOfRooms': prop.beds,
          'offers': {
            '@type': 'Offer',
            'price': prop.price,
            'priceCurrency': 'BDT',
            'availability': prop.isAvailable !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
          }
        };
      }
    } else if (searchQuery) {
      title = `'${searchQuery}' সম্পর্কিত বাসা ভাড়া | Feni House Rent`;
      description = `ফেনীতে '${searchQuery}' সংক্রান্ত বাসার বিস্তারিত তথ্য ও ভাড়া।`;
      canonical = `${origin}/?q=${encodeURIComponent(searchQuery)}`;
    } else if (category || location) {
      const catText = category || 'বাসা';
      const locText = location ? `${location} এলাকায়` : 'ফেনীতে';
      title = `${catText} ভাড়া ${locText} | Feni House Rent`;
      description = `${locText} পাওয়া যাচ্ছে যাচাইকৃত ${catText}।`;
      canonical = `${origin}/?category=${encodeURIComponent(category || '')}&location=${encodeURIComponent(location || '')}`;
    }

    html = html.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);
    html = html.replace(/<meta\s+name="description"\s+content=".*?"\s*\/?>/i, `<meta name="description" content="${description}" />`);
    html = html.replace(/<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i, `<meta property="og:title" content="${title}" />`);
    html = html.replace(/<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i, `<meta property="og:description" content="${description}" />`);
    html = html.replace(/<meta\s+property="og:image"\s+content=".*?"\s*\/?>/i, `<meta property="og:image" content="${image}" />`);
    html = html.replace(/<meta\s+property="og:url"\s+content=".*?"\s*\/?>/i, `<meta property="og:url" content="${canonical}" />`);
    html = html.replace(/<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:title" content="${title}" />`);
    html = html.replace(/<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:description" content="${description}" />`);
    html = html.replace(/<meta\s+name="twitter:image"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:image" content="${image}" />`);

    if (Object.keys(jsonLd).length > 0) {
      const scriptTag = `<script id="seo-jsonld-schema" type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
      html = html.replace('</head>', `  ${scriptTag}\n  </head>`);
    }

    return html;
  } catch (err) {
    console.error('[SEO] Error injecting dynamic head tags:', err);
    return html;
  }
}

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });

    app.use(async (req, res, next) => {
      if (req.method === 'GET' && req.headers.accept?.includes('text/html') && !req.path.startsWith('/api') && !req.path.includes('.')) {
        try {
          const url = req.originalUrl;
          let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
          template = await vite.transformIndexHtml(url, template);
          template = injectDynamicHead(template, req);
          res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
          return;
        } catch (e) {
          next(e);
          return;
        }
      }
      next();
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath, {
      maxAge: '7d',
      etag: true
    }));

    app.get('*', (req: Request, res: Response) => {
      try {
        let template = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');
        template = injectDynamicHead(template, req);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch {
        res.sendFile(path.join(distPath, 'index.html'));
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] Feni House Rent running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
