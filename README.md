# 🏡 Feni House Rent (ফেনী বাসা ও মেস ভাড়া)

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

> **ফেনী জেলার সর্বাধুনিক ও নিরাপদ বাসা, মেস ও ফ্ল্যাট ভাড়া খোঁজার পূর্ণাঙ্গ প্ল্যাটফর্ম।**  
> দালালমুক্ত পরিবেশে সরাসরি বাড়িওয়ালার সাথে যোগাযোগের সুযোগ, বিকাশ পেমেন্ট ভেরিফিকেশন, অ্যাডমিন ড্যাশবোর্ড এবং মোবাইল-রেসপনসিভ ইউজার ইন্টারফেস।

---

## 📑 সূচিপত্র (Table of Contents)

- [✨ মূল বৈশিষ্ঠ্যসমূহ (Key Features)](#-মূল-বৈশিষ্ঠ্যসমূহ-key-features)
- [🛠️ ব্যবহৃত প্রযুক্তিসমূহ (Tech Stack)](#️-ব্যবহৃত-প্রযুক্তিসমূহ-tech-stack)
- [📁 ফাইল ও ডিরেক্টরি কাঠামো (Project Structure)](#-ফাইল-ও-ডিরেক্টরি-কাঠামো-project-structure)
- [🚀 লোকাল সেটআপ নির্দেশিকা (Local Setup Guide)](#-লোকাল-সেটআপ-নির্দেশিকা-local-setup-guide)
- [🔐 অ্যাডমিন অ্যাক্সেস ও ডিফল্ট ক্রেডেনশিয়ালস (Admin Portal)](#-অ্যাডমিন-অ্যাক্সেস-ও-ডিফল্ট-ক্রেডেনশিয়ালস-admin-portal)
- [🌐 গিটহাবে আপলোড / পাবলিশ করার নিয়ম (Publish to GitHub)](#-গিটহাবে-আপলোড--পাবলিশ-করার-নিয়ম-publish-to-github)
- [🤝 অবদান রাখার নির্দেশিকা (Contributing Guidelines)](#-অবদান-রাখার-নির্দেশিকা-contributing-guidelines)
- [📜 লাইসেন্স (License)](#-লাইসেন্স-license)

---

## ✨ মূল বৈশিষ্ঠ্যসমূহ (Key Features)

1. **রিয়েল-টাইম প্রপার্টি ব্রাউজিং ও সার্চ ফিল্টার:**
   - ফেনী সদর, দাগনভূঞা, সোনাগাজী, পরশুরাম, ছাগলনাইয়া ও ফুলগাজী উপজেলা অনুযায়ী ফিল্টারিং।
   - ফ্যামিলি বাসা, ব্যাচেলর মেস, সিঙ্গেল রুম, ফ্ল্যাট এবং সাবলেট ক্যাটাগরি।
   - লভ্যতা অনুযায়ী ফিল্টার (`খালি আছে` / `ভাড়া হয়ে গেছে`)।

2. **বিকাশ পেমেন্ট ও TrxID ভেরিফিকেশন ইঞ্জিন:**
   - বাড়িওয়ালার মোবাইল নম্বর ও সঠিক হোল্ডিং ঠিকানা দেখতে মাত্র ৳১০০ (বা অ্যাডমিন নির্ধারিত ফি) বিকাশ ফি প্রদান।
   - TrxID সাবমিশন এবং তাৎক্ষণিক লাইভ স্ট্যাটাস ট্র্যাকিং (`Pending` ➔ `Approved` ➔ `Rejected`)।
   - ১-ক্লিক TrxID কপি এবং রিসিট মেমোরি।

3. **শক্তিশালী অ্যাডমিন ড্যাশবোর্ড (Admin Control Hub):**
   - পেন্ডিং TrxID অর্ডার অনুমোদন ও বাতিলকরণ।
   - নতুন বাসার ছবি, ভাড়া, রুম সাইজ ও বিবরণ পোস্ট বা এডিট করা।
   - বাসার লভ্যতা টগল (`Available` ⟷ `Booked`)।
   - আনলক ফি ও বিকাশ পার্সোনাল নম্বর পরিবর্তন।
   - রিয়েল-টাইম আয় ও মোট অর্ডারের অ্যানালিটিক্স।

4. **ইনস্ট্যান্ট ইন-প্লেস রিলোড (Flicker-Free Instant Reload):**
   - ব্রাউজার রিলোড ছাড়াই ডাটা সিঙ্ক (কীবোর্ড শর্টকাট: `R` চেপে তাৎক্ষণিক রিফ্রেশ)।
   - অটো-রিফ্রেশ মোড (১০ সেকেন্ড, ২০ সেকেন্ড বা ১ মিনিট অন্তর)।
   - মোবাইলের জন্য টাচ পুল-টু-রিফ্রেশ (Pull-to-Refresh)।

5. **প্রমোশন ও কিউআর কোড জেনারেটর (Marketing Hub):**
   - পোস্টার ও ব্যানারের জন্য হাই-রেজ্যুলেশন প্রিন্ট ও ডাউনলোডযোগ্য QR কোড।
   - WhatsApp, Facebook ও Telegram-এ ১-ক্লিকে বাসা শেয়ারিং সুবিধা।

6. **ডাইনামিক এসইও ও মেটাট্যাগ (SEO & Social Sharing):**
   - প্রতিটি বাসার জন্য স্বয়ংক্রিয় OpenGraph ও Twitter Card মেটাট্যাগ।
   - গুগল সার্চ ইঞ্জিনের জন্য Schema.org Apartment JSON-LD স্ট্রাকচার্ড ডাটা।

---

## 🛠️ ব্যবহৃত প্রযুক্তিসমূহ (Tech Stack)

- **Frontend:**
  - [React 19](https://react.dev/) - আধুনিক ইউজার ইন্টারফেস লাইব্রেরি
  - [TypeScript](https://www.typescriptlang.org/) - টাইপ-সেফ কোডবেস
  - [Tailwind CSS v4](https://tailwindcss.com/) - আধুনিক ইউটিলিটি-ফার্স্ট সিএসএস
  - [Lucide Icons](https://lucide.dev/) - প্রিমিয়াম ও হালকা আইকন সেট
- **Backend:**
  - [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/) - শক্তিশালী ব্যাকএন্ড এপিআই সার্ভার
  - [Compression](https://github.com/expressjs/compression) - Gzip/Brotli রেসপন্স কম্প্রেশন
  - [QRCode](https://github.com/soldair/node-qrcode) - ডাইনামিক QR কোড জেনারেটর
- **Database & Storage:**
  - Synchronous Atomic JSON Database (`data/db.json`) ও O(1) মেমরি ইনডেক্সিং
  - Firebase Firestore সমন্বয় সাপোর্ট

---

## 📁 ফাইল ও ডিরেক্টরি কাঠামো (Project Structure)

```text
feni-house-rent/
├── data/
│   └── db.json                    # সার্ভার ডাটাবেস (বাসার তালিকা, সেটিংস ও অর্ডার)
├── src/
│   ├── components/
│   │   ├── AdminPanel.tsx         # অ্যাডমিন ড্যাশবোর্ড ও কন্ট্রোল প্যানেল
│   │   ├── FloatingWhatsApp.tsx   # ফ্লোটিং হোয়াটসঅ্যাপ হেল্প বাটন
│   │   ├── Footer.tsx             # ফুটার ও অফিস যোগাযোগের তথ্য
│   │   ├── Header.tsx             # নেভিগেশন বার ও রিফ্রেশ কন্ট্রোল
│   │   ├── Hero.tsx               # ব্যানার ও সার্চ ফিল্টারিং ফর্ম
│   │   ├── PropertyCard.tsx       # সিঙ্গেল প্রপার্টি কার্ড
│   │   ├── PropertyDetailModal.tsx# পূর্ণাঙ্গ বাসার বিবরণী ও এসইও প্রিভিউ
│   │   ├── PropertySkeleton.tsx   # লোডিং শিমার অ্যানিমেশন
│   │   ├── PullToRefreshIndicator.tsx # মোবাইল পুল-টু-রিফ্রেশ নির্দেশক
│   │   ├── RecentlyAddedCarousel.tsx # সম্প্রতি যোগ করা বাসার ক্যারোসেল
│   │   ├── RefreshControls.tsx    # ইনস্ট্যান্ট রিলোড মেনু ও কাউন্টডাউন
│   │   ├── ReviewModal.tsx        # ৫-স্টার রেটিং ও মন্তব্য মডাল
│   │   ├── TopFeaturedSlider.tsx  # প্রিমিয়াম বাসার অটোমেটিক স্লাইডার
│   │   ├── UnlockModal.tsx        # বিকাশ পেমেন্ট ও TrxID সাবমিট মডাল
│   │   └── WebsiteShareManager.tsx# ওয়েবসাইট শেয়ার ও QR কোড হাব
│   ├── hooks/
│   │   └── useDynamicHead.ts      # ডাইনামিক এসইও ও মেটা ট্যাগ ম্যানেজার
│   ├── api.ts                     # ফ্রন্টএন্ড এপিআই রিকোয়েস্ট ফাংশন
│   ├── App.tsx                    # মূল অ্যাপ্লিকেশন রুট ও স্টেট
│   ├── index.css                  # গ্লোবাল স্টাইলিং ও অ্যানিমেশন
│   ├── main.tsx                   # রিঅ্যাক্ট মাউন্ট পয়েন্ট
│   └── types.ts                   # কমন টাইপস্ক্রিপ্ট ইন্টারফেস
├── index.html                     # এইচটিএমএল এন্ট্রি পয়েন্ট ও ওয়েব ফন্ট
├── server.ts                      # এক্সপ্রেস ফুলস্ট্যাক এপিআই সার্ভার
├── package.json                   # প্রজেক্ট মেটাডাটা ও ডিপেন্ডেন্সি
├── tsconfig.json                  # টাইপস্ক্রিপ্ট কনফিগারেশন
├── vite.config.ts                 # ভিট বিল্ড টুল কনফিগারেশন
└── .env.example                   # এনভায়রনমেন্ট ভেরিয়েবল উদাহরণ
```

---

## 🚀 লোকাল সেটআপ নির্দেশিকা (Local Setup Guide)

### ১. পূর্বশর্ত (Prerequisites)
আপনার কম্পিউটারে নিম্নলিখিত সফটওয়্যার ইনস্টল থাকতে হবে:
- [Node.js](https://nodejs.org/) (ভার্সন ১৮ বা তার পরবর্তী)
- [Git](https://git-scm.com/)
- `npm` অথবা `bun` প্যাকেজ ম্যানেজার

---

### ২. রিপোজিটরি ক্লোন করুন (Clone Repository)
টার্মিনাল বা কমান্ড প্রম্পট খুলুন এবং কমান্ডটি দিন:
```bash
git clone https://github.com/YOUR_USERNAME/feni-house-rent.git
cd feni-house-rent
```

---

### ৩. ডিপেন্ডেন্সি ইনস্টল করুন (Install Dependencies)
```bash
npm install
```

---

### ৪. এনভায়রনমেন্ট ভেরিয়েবল সেটআপ (Environment Setup)
প্রজেক্টের রুটে `.env.example` ফাইলটি কপি করে `.env` তৈরি করুন:
```bash
cp .env.example .env
```
`.env` ফাইলে প্রয়োজনীয় পোর্ট বা ইউআরএল নির্ধারণ করুন:
```env
PORT=3000
APP_URL=http://localhost:3000
```

---

### ৫. ডেভেলপমেন্ট সার্ভার চালু করুন (Run Development Server)
```bash
npm run dev
```
সার্ভার সফলভাবে চালু হলে আপনার ব্রাউজারে প্রবেশ করুন:
👉 **http://localhost:3000**

---

### ৬. প্রোডাকশন বিল্ড তৈরি করুন (Production Build)
```bash
# বিল্ড তৈরি করতে
npm run build

# প্রোডাকশন মোডে চালাতে
npm run start
```

---

## 🔐 অ্যাডমিন অ্যাক্সেস ও ডিফল্ট ক্রেডেনশিয়ালস (Admin Portal)

- **অ্যাডমিন ইউআরএল:** `http://localhost:3000/#admin` (অথবা হোম পেজের তালার আইকনে ক্লিক করুন)
- **ডিফল্ট পাসওয়ার্ড:** `123456`

> 💡 **পাসওয়ার্ড পরিবর্তন:** অ্যাডমিন প্যানেলে লগইন করার পর **"পাসওয়ার্ড পরিবর্তন"** ট্যাবে গিয়ে যেকোনো সময় নতুন পাসওয়ার্ড সেট করতে পারবেন।

---

## 🌐 গিটহাবে আপলোড / পাবলিশ করার নিয়ম (Publish to GitHub)

আপনি যদি আপনার নিজস্ব গিটহাব অ্যাকাউন্টে এই প্রজেক্টটি পাবলিশ করতে চান, নিচের ধাপগুলো অনুসরণ করুন:

### ধাপ ১: গিটহাবে নতুন রিপোজিটরি তৈরি করুন
1. [GitHub.com](https://github.com/)-এ গিয়ে লগইন করুন।
2. ডানদিকের উপরে **`+`** আইকনে ক্লিক করে **"New repository"** নির্বাচন করুন।
3. রিপোজিটরির নাম দিন: `feni-house-rent`
4. রিপোজিটরি **Public** রাখুন এবং *Add a README file*, *.gitignore* আনচেক (Unchecked) রাখুন।
5. **"Create repository"** বাটনে ক্লিক করুন।

### ধাপ ২: লোকাল কোড গিটহাবে পুশ করুন (Push Code)
আপনার প্রোজেক্ট ফোল্ডারে টার্মিনালে নিচের কমান্ডগুলো ক্রমানুসারে চালান:

```bash
# ১. গিট স্ট্যাটাস চেক করুন
git status

# ২. সব ফাইল স্টেজিং এ যুক্ত করুন
git add .

# ৩. প্রথম কমিট তৈরি করুন
git commit -m "feat: initial commit for Feni House Rent platform"

# ৪. মেইন ব্রাঞ্চ নিশ্চিত করুন
git branch -M main

# ৫. আপনার গিটহাব রিমোট অ্যাড করুন (YOUR_USERNAME পরিবর্তন করুন)
git remote add origin https://github.com/YOUR_USERNAME/feni-house-rent.git

# ৬. গিটহাবে পুশ করুন
git push -u origin main
```

> **পরামর্শ:** যদি পার্সোনাল অ্যাক্সেস টোকেন (PAT) চায়, তবে GitHub Settings ➔ Developer Settings ➔ Personal Access Tokens (Classic) থেকে একটি টোকেন তৈরি করে পাসওয়ার্ডের স্থানে ব্যবহার করুন।

---

## 🤝 অবদান রাখার নির্দেশিকা (Contributing Guidelines)

আমরা ওপেন সোর্স অবদানকে আন্তরিকভাবে স্বাগত জানাই! আপনি যদি প্রজেক্টটিতে কোনো নতুন ফিচার যোগ করতে চান বা বাগ ফিক্স করতে চান:

1. **Fork** করুন এই রিপোজিটরিটি।
2. নতুন ফিচার ব্রাঞ্চ তৈরি করুন:
   ```bash
   git checkout -b feature/awesome-feature
   ```
3. পরিবর্তনগুলো কমিট করুন:
   ```bash
   git commit -m "Add: New filter option for rent range"
   ```
4. ব্রাঞ্চে পুশ করুন:
   ```bash
   git push origin feature/awesome-feature
   ```
5. গিটহাবে গিয়ে একটি **Pull Request (PR)** ওপেন করুন।

### কোডিং নিয়মাবলী:
- টাইপস্ক্রিপ্ট টাইপ সুরক্ষা বজায় রাখুন (`npm run lint` চালিয়ে কোনো এরর নেই কিনা নিশ্চিত করুন)।
- ডিজাইন ও ইউআই উপাদানগুলোতে Tailwind CSS ব্যবহার করুন।
- বাংলা ও ইংরেজি টেক্সটের স্পষ্টতা বজায় রাখুন।

---

## 📜 লাইসেন্স (License)

এই প্রজেক্টটি [Apache License 2.0](LICENSE)-এর অধীনে উন্মুক্ত।

---

<div align="center">
  <b>তৈরি করেছেন: তানভীর আহমেদ (Tanvir Ahmed)</b><br>
  📧 ইমেইল: <a href="mailto:tanvirhero2005@gmail.com">tanvirhero2005@gmail.com</a><br>
  📍 ফেনী, বাংলাদেশ
</div>
