# 👑 ALANKARA - Luxury Jewellery E-Commerce & Vault Management Platform

> **Divine Elegance • Pure BIS 916 Hallmarked Jewellery • Festive Specials**

ALANKARA is an end-to-end, high-performance, and visually captivating luxury jewellery shopping website and administrative control system tailored for Indian fine jewellery, pure gold, polki diamonds, temple heirlooms, and festive collections.

---

## 🌟 Key Features Overview

### 🛍️ 1. Customer Shopping Portal (`index.html`)
- **Royal Luxury Visual Aesthetic**: Designed with rich Obsidian, Imperial Gold gradients, warm ivory pearls, and responsive typography (`Cinzel`, `Playfair Display`, `Plus Jakarta Sans`).
- **Live Metal Rates Ticker**: Real-time display of today's 22K Gold, 24K Gold, and 925 Silver rates per gram.
- **Special Festival Collections**:
  - *Diwali Lakshmi Shubh Collection* (Auspicious Goddess Lakshmi coins, Kasu malas, temple chokers).
  - *Royal Wedding Trousseau* (Grand Padmavati chokers, Kundan haar, bridal trousseau).
  - *Akshaya Tritiya Sovereigns* (Pure prosperity gold & silver bars, rings).
  - *Navratri Kundan & Polki Glitz* (Chandbalis, dancing jhumkas).
  - *Sacred Antique Temple Heirlooms* (Gajraj nakshi kadas, hasli chokers).
- **Core Jewellery Categories**:
  - **Terracotta Jewellery (Handmade Kiln-Fired Organic Clay Art)**
  - **Antique Heritage Jewels (Temple Nakshi & 22K Matte Gold)**
  - **Anti-Tarnish Daily Wear (18K PVD Waterproof Luxury)**
  - Necklaces & Chokers
  - Earrings & Jhumkas
  - Bangles & Kadas
  - Rings & Solitaires
  - Royal Bridal Sets
  - Mangalsutras & Pendants
  - 925 Sterling Silver Articles
- **Live Interactive Filters & Search**:
  - Instant text search across designs, purity, and descriptions.
  - Filter by category tab or festive special pill.
  - Filter by metal purity (22K Gold, Certified Diamond, 925 Silver).
  - Sort by Price (Low to High, High to Low) and Discounts.
  - "Special Offers Only" toggle.
- **"Simply Order" / 1-Click Fast Checkout**:
  - Seamless 2-step checkout without cumbersome account registrations.
  - Delivery information collection with WhatsApp phone validation.
  - Festive promo code support (e.g. `ALANKARA20` for instant savings).
- **UPI (Google Pay) Payment System**:
  - Displays Merchant UPI ID with instant 1-click clipboard copy.
  - Dynamic **Canvas-rendered UPI QR Code** with embedded order ID, merchant name, and total payable amount.
  - Deep-link button: **"Tap to Open Google Pay App"** for direct mobile app payment.
  - Customer input for 12-digit UPI UTR reference number or screenshot upload.
- **WhatsApp Order & Payment Confirmation Flow**:
  - One-click button: **"Confirm Payment & Send Slip on WhatsApp"**.
  - Automatically compiles a clean, formatted receipt slip with Order ID, customer address, purchased jewellery items, total amount paid, and transaction UTR.
  - Directly opens WhatsApp chat with the store vault manager.
- **Live Order Tracking ("track the product")**:
  - Search by Order ID (e.g. `AL-9842`) or Phone Number.
  - Visual 5-stage progress timeline:
    1. Order Placed
    2. UPI Payment Verification (verified by Admin)
    3. Hallmarking & Velvet Security Vault Packing
    4. Dispatched with Insured Courier (Blue Dart, BVC Logistics with AWB Tracking)
    5. Delivered & Inspected
  - Instant "Chat with Vault Specialist about this order" button.
- **Jewellery Bag & Slide Drawer**:
  - Real-time quantity adjustment, badge counters, and bag subtotal.
- **Offline & Low-Bandwidth Resilience**:
  - Built-in dynamic SVG vector jewellery artwork fallback engine (`js/svg-jewels.js`), ensuring stunning visuals even when offline.

---

### 🛡️ 2. Admin Control Panel (`admin.html`)
- **Secure Authentication Gate**:
  - Accessible strictly via username and password.
  - Default credentials:
    - **Username:** `admin`
    - **Password:** `admin123`
  - Option to update password anytime in Settings.
- **Executive Dashboard**:
  - Key Performance Indicators (KPIs): Total Reconciled Sales (₹), Pending Payment Verifications, Total Orders, Low Stock Alerts.
  - Recent orders stream with 1-click **"Confirm Payment"** shortcut.
- **Order Management & Payment Reconciliation**:
  - Filter by: *All, Pending Verification, Verified / Confirmed, Shipped, Delivered*.
  - View customer name, phone (with 1-click WhatsApp chat link), delivery address, order items, payable total, and customer-entered UPI UTR.
  - **Confirm Payment Action**: 1-click confirmation reconciles the payment, updates the order status to "Confirmed", and offers to send an official confirmation notification slip to the customer's WhatsApp.
  - Dispatch & Courier Management: Assign courier name (e.g., *Blue Dart Insured*, *BVC Logistics*) and enter tracking/AWB numbers.
- **Jewellery Designs & Catalog Manager ("add designs")**:
  - Add, edit, and delete jewellery designs.
  - Specify title, category, festival tags, metal purity (22K Gold 916, 18K Real Diamond, 925 Silver), gross weight, net gold weight, regular price, offer price, stock quantity, description, and sizing.
  - Upload design pictures from your computer (auto-encoded to base64) or paste image URLs.
- **Vault Stock & Inventory Management**:
  - Real-time stock counts with color-coded warnings (Low Vault Stock <= 3 units, Out of Stock).
  - Quick stock increment/decrement controls (`-1`, `+1`, `+5`).
- **Website Customization & Live Rates**:
  - Update Today's Live 22K Gold, 24K Gold, and 925 Silver rates per gram.
  - Customize store name, brand tagline, customer care email, phone, and physical address.
  - Configure Merchant UPI ID (Admin GPay ID) and Merchant Display Name.
  - Configure Support WhatsApp Business number (where orders and payment slips arrive).
  - Customize announcement bar ticker and festive banner headline, subtitle, promo code, and discounts.
- **Downloadable Reports & Invoices ("take report (downloaded format)")**:
  - **Sales & Orders Report (CSV)**: Export all customer orders with customer names, phones, addresses, items, UTR codes, amounts, and dates.
  - **Inventory Valuation Report (CSV)**: Export complete vault catalog with gross weights, purity, prices, and stock valuations.
  - **Printable GST Tax Invoice**: Generate and print official Government-compliant GST Tax Invoices complete with BIS 916 Hallmark seal, itemized ornament breakdown, and authorized signature block.

---

## 🚀 How to Run the Website

You can run ALANKARA using any of the following methods:

### Method 1: Local HTTP Server (Recommended)
1. Double-click `start-server.bat` in the project directory, or in PowerShell run:
   ```powershell
   .\start-server.ps1
   ```
2. Your browser will automatically open:
   - **Storefront Website:** [http://localhost:8080/](http://localhost:8080/)
   - **Admin Control Panel:** [http://localhost:8080/admin.html](http://localhost:8080/admin.html)

### Method 2: Direct File Open
- Simply double-click `index.html` or `admin.html` in any web browser (Chrome, Edge, Firefox, Safari).
- All data, inventory changes, orders, and customizations persist seamlessly in the browser's `localStorage`.

---

## 📞 Contact & WhatsApp Integration
- **Store Phone:** `+91 94468 14687`
- **WhatsApp Destination:** `https://wa.me/919446814687` (Configured across customer checkout, receipt generator, and floating chat)

---

## 🔐 Admin Login Credentials
- **URL:** `admin.html`
- **Username:** `admin`
- **Password:** `admin123`
*(Can be changed anytime inside Admin Panel -> Website Customization)*

---

## 📁 File Structure

```
ALANKARA/
├── index.html          # Customer Storefront (Festive, Catalog, Checkout, UPI, Tracking)
├── admin.html          # Admin Panel (Auth, Orders, Designs, Inventory, Settings, Reports)
├── start-server.bat    # 1-Click Windows batch launcher
├── start-server.ps1    # Pure PowerShell HTTP Server (zero extra installs)
├── css/
│   ├── style.css       # Luxury royal gold design system & responsive layout
│   └── admin.css       # Admin dashboard, tables, metric cards & printable invoice
├── js/
│   ├── store-data.js   # Central database engine, seed products, orders & settings
│   ├── svg-jewels.js   # Dynamic SVG vector jewellery artworks & Canvas UPI QR generator
│   ├── app.js          # Storefront controller (Search, filters, GPay UPI, WhatsApp order flow)
│   └── admin.js        # Admin controller (Auth, payment reconciliation, CRUD, CSV export)
└── README.md           # Documentation and operations manual
```
