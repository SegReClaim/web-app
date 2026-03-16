# SegReClaim Web App — Setup Guide

## ⚡ Quick Start

### 1. Clone & Navigate
```bash
cd d:\SegReClaim\web\rvm-web
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Add Firebase Config

Go to the [Firebase Console](https://console.firebase.google.com/) → **Project: segreclaim-10c2b** → **Project Settings** → **Your Apps** → **Web App**.

Copy the config values and paste them into `.env.local` (already created for you):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=segreclaim-10c2b.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=segreclaim-10c2b
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=segreclaim-10c2b.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=12345...
NEXT_PUBLIC_FIREBASE_APP_ID=1:12345:web:abc...
```

### 4. Enable Google Sign-In in Firebase

Firebase Console → **Authentication** → **Sign-in method** → **Google** → Enable.

Add `localhost` to **Authorized domains** (it's usually there by default).

### 5. Add Firestore Indexes

The `transactions` and `vouchers` queries need composite indexes.
Run this from the `SegReClaim-web` directory:

```bash
cd d:\SegReClaim\web\SegReClaim-web
firebase deploy --only firestore:indexes
```

### 6. Run the Dev Server

```bash
cd d:\SegReClaim\web\rvm-web
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗺️ Page Map

| Route | Description |
|-------|-------------|
| `/` | Redirects to `/dashboard` or `/login` |
| `/login` | Google Sign-In |
| `/dashboard` | Points, impact, recent deposits, quick actions |
| `/rewards` | Partner rewards catalogue |
| `/vouchers` | Voucher wallet |
| `/profile` | Lifetime stats, streak, sign-out |
| `/link?session=TOKEN` | QR scan landing — links user to machine session |

---

## 🔐 Middleware & Auth

Route protection is handled by `middleware.ts`. The client sets a
`segreclaim_authed` cookie after login. Actual data security is enforced
by Firebase Security Rules (in `SegReClaim-web/firestore.rules`).

To set the auth cookie after login, add this to `AuthContext.tsx` (or a
wrapper component) after confirming `user` is non-null:

```ts
document.cookie = "segreclaim_authed=1; path=/; max-age=2592000; SameSite=Lax";
```
And clear it on sign-out:
```ts
document.cookie = "segreclaim_authed=; path=/; max-age=0";
```

---

## 📁 Folder Structure

```
rvm-web/
  app/
    layout.tsx          Root layout (AuthProvider + Navbar + Inter font)
    page.tsx            Auth-aware redirect
    login/page.tsx
    dashboard/page.tsx
    rewards/page.tsx
    vouchers/page.tsx
    profile/page.tsx
    link/
      page.tsx          Suspense shell
      LinkPageInner.tsx QR scan logic + real-time points
  components/
    ui/                 PointsBadge, WasteTypePill, SkeletonCard, EmptyState
    layout/             Navbar, PageWrapper
    cards/              TransactionCard, VoucherCard, RewardCard, PartnerCard
  context/
    AuthContext.tsx     Real-time auth + Firestore user doc
  lib/
    firebase.ts         Firebase init & exports
    firestore.ts        All Firestore queries
    utils.ts            formatDate, formatPoints, calculateCO2, animateCounter…
  types/
    index.ts            TypeScript interfaces for all Firestore documents
  middleware.ts
  .env.local            Firebase config keys (fill in values)
```

---

## 🌱 Seed Data

Seed data for partners, machines, and transactions is in
`d:\SegReClaim\web\SegReClaim-web\seed.js`.

To populate Firestore for local testing:
```bash
cd d:\SegReClaim\web\SegReClaim-web
node seed.js
```

---

## 📦 Production Build

```bash
npm run build
npm start
```

Or deploy to Vercel/Firebase Hosting by configuring the hosting target in
`d:\SegReClaim\web\SegReClaim-web\firebase.json`.
