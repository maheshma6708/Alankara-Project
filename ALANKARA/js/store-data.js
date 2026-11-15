/**
 * ALANKARA JEWELLERY STORE - CENTRAL DATA STORE & STORAGE ENGINE
 * Handles default inventory, antique jewels, terracotta collections, orders, settings, and LocalStorage persistence.
 */
const SUPABASE_URL = 'https://fcprlmotnmzncznigxgc.supabase.co'; // Replace with your URL
const SUPABASE_ANON_KEY = 'sb_publishable_SwLG2xkn88bu8eKy0DWodw_yUNupSuA'; // Replace with your Anon Key

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ALANKARA_STORAGE_KEYS = {
  PRODUCTS: 'alankara_products_v2',
  ORDERS: 'alankara_orders_v2',
  SETTINGS: 'alankara_settings_v2',
  CART: 'alankara_cart_v2',
  WISHLIST: 'alankara_wishlist_v2',
  ADMIN_AUTH: 'alankara_admin_auth_v2',
  CATEGORIES: 'alankara_categories_v2'
};

// Default Store Configuration with Contact Number: 9446814687
const DEFAULT_SETTINGS = {
  storeName: "ALANKARA",
  storeTagline: "Antique Heritage • Terracotta Clay Art • 916 Hallmarked Jewellery",
  contactPhone: "+91 94468 14687",
  whatsappNumber: "919446814687", // Customer orders & payment confirmation destination
  contactEmail: "care@alankarajewels.com",
  storeAddress: "Alankara Heritage Vault, 45 Jewellers Street, Commercial Zone, MG Road, Bangalore - 560001",
  upiId: "maheshmaakgardens@okhdfcbank", // Merchant UPI / GPay ID
  merchantName: "ALANKARA JEWELLERS",
  gold22kRate: 7150, // Per gram INR
  gold24kRate: 7800,
  silverRate: 92,
  announcement: "âœ¨ Grand Festive Mahotsav: Special Terracotta & Antique Jewellery Sale! Flat 20% OFF + Zero Delivery Fee! âœ¨",
  festivalBanner: {
    title: "Diwali, Antique & Terracotta Mahotsav 2026",
    subtitle: "Celebrate timeless beauty with handcrafted Terracotta clay sets, 22K Antique temple heirlooms & anti-tarnish jewels.",
    code: "ALANKARA20",
    discountPercent: 20
  },
  adminUsername: "admin",
  adminPasswordHash: "admin123" // default credentials for admin access
};

// Categories (Including Antique, Terracotta, and Anti-Tarnish)
const CATEGORIES = [
  { id: 'all', name: 'All Jewellery', icon: 'fas fa-gem' },
  { id: 'terracotta', name: 'Terracotta Jewellery', icon: 'fas fa-palette' },
  { id: 'antique', name: 'Antique Heritage Jewels', icon: 'fas fa-chess-queen' },
  { id: 'anti_tarnish', name: 'Anti-Tarnish Daily Wear', icon: 'fas fa-shield-alt' },
  { id: 'necklaces', name: 'Necklaces & Chokers', icon: 'fas fa-necklace' },
  { id: 'earrings', name: 'Earrings & Jhumkas', icon: 'fas fa-certificate' },
  { id: 'bangles', name: 'Bangles & Kadas', icon: 'fas fa-circle-notch' },
  { id: 'rings', name: 'Rings & Solitaires', icon: 'fas fa-ring' },
  { id: 'bridal', name: 'Royal Bridal Sets', icon: 'fas fa-crown' },
  { id: 'mangalsutras', name: 'Mangalsutras & Pendants', icon: 'fas fa-heart' },
  { id: 'silver', name: '925 Silver Articles', icon: 'fas fa-coins' }
];

// Special Festival Collections
const FESTIVAL_CATEGORIES = [
  { id: 'diwali', name: 'Diwali Lakshmi Shubh Collection', tag: 'Diwali Special', badge: 'Diwali Special', color: '#D4AF37' },
  { id: 'wedding', name: 'Royal Wedding & Antique Trousseau', tag: 'Wedding Collection', badge: 'Bridal Grandeur', color: '#E53935' },
  { id: 'akshaya', name: 'Akshaya Tritiya Gold Sovereigns', tag: 'Akshaya Tritiya', badge: 'Pure Prosperity', color: '#FFB300' },
  { id: 'navratri', name: 'Navratri Terracotta & Polki Glitz', tag: 'Navratri Special', badge: 'Festive Glitz', color: '#8E24AA' },
  { id: 'temple', name: 'Sacred Antique Temple Heirlooms', tag: 'Temple Heritage', badge: 'Divine Heritage', color: '#B71C1C' }
];

// Rich Seed Products
const DEFAULT_PRODUCTS = [
  // --- TERRACOTTA JEWELLERY CATEGORY ---
  {
    id: 'AL-TC-201',
    title: 'Aaradhya Handcrafted Terracotta Peacock Temple Set',
    category: 'terracotta',
    festival: 'diwali',
    purity: 'Organic Kiln-Fired Natural Clay',
    grossWeight: '120.00 g',
    netWeight: '120.00 g',
    price: 3499,
    offerPrice: 2299,
    discount: 34,
    stock: 15,
    isFestiveSpecial: true,
    isOffer: true,
    isBestseller: true,
    description: 'Eco-friendly, baked natural terracotta clay statement necklace with matching grand double-bell jhumkas. Hand-painted in auspicious royal crimson and antique gold water-resistant lacquer, depicting divine dancing peacocks.',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80'
    ],
    dimensions: 'Adjustable Handwoven Cotton Dori | Jhumka Length: 6.5 cm',
    certification: '100% Natural Organic Clay • Handcrafted by Master Artisans'
  },
  {
    id: 'AL-TC-202',
    title: 'Mrittika Earth Hand-Painted Terracotta Jhumkas',
    category: 'terracotta',
    festival: 'navratri',
    purity: 'Baked Natural Clay',
    grossWeight: '38.00 g',
    netWeight: '38.00 g',
    price: 1299,
    offerPrice: 799,
    discount: 38,
    stock: 25,
    isFestiveSpecial: true,
    isOffer: true,
    isBestseller: true,
    description: 'Ultra-lightweight bell-shaped baked terracotta jhumkas hand-painted with intricate floral dots in earthy terracotta, turmeric gold, and indigo blue. Hypoallergenic ear studs.',
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80',
    dimensions: 'Length: 5.5 cm | Bell Diameter: 2.8 cm',
    certification: 'Eco-Friendly Terracotta • Skin Safe'
  },
  {
    id: 'AL-TC-203',
    title: 'Varnika Floral Terracotta Choker & Bangle Ensemble',
    category: 'terracotta',
    festival: 'wedding',
    purity: 'Kiln-Fired Terracotta Clay',
    grossWeight: '145.00 g',
    netWeight: '145.00 g',
    price: 4500,
    offerPrice: 2999,
    discount: 33,
    stock: 10,
    isFestiveSpecial: true,
    isOffer: true,
    isBestseller: false,
    description: 'Traditional folk art terracotta choker necklace adorned with hand-sculpted clay lotus florets and paired with a broad terracotta carved wrist cuff. Sealed with waterproof glossy protective coat.',
    image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=80',
    dimensions: 'Choker Width: 2 inches | Bangle Size: 2-6 (Adjustable Open Cuff)',
    certification: 'Artisanal Terracotta • Hand-Molded'
  },

  // --- ANTIQUE JEWELLERY CATEGORY ---
  {
    id: 'AL-AQ-204',
    title: 'Rajkumari Matte Finish Antique Gold Hasli Choker',
    category: 'antique',
    festival: 'wedding',
    purity: '22K Antique Gold (916)',
    grossWeight: '52.40 g',
    netWeight: '51.20 g',
    price: 420000,
    offerPrice: 375000,
    discount: 11,
    stock: 4,
    isFestiveSpecial: true,
    isOffer: true,
    isBestseller: true,
    description: 'Pure 22K antique matte gold choker featuring deep nakshi carvings of celestial deities, bordered with uncut polki and suspended south sea pearl droplets. BIS 916 Hallmarked.',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1611591475103-4fa1b7765a7f?auto=format&fit=crop&w=800&q=80'
    ],
    dimensions: 'Choker Diameter: 4.6 inches with adjustable velvet silk dori',
    certification: 'BIS Hallmarked 916 Gold • Certified Antique Finish'
  },
  {
    id: 'AL-AQ-205',
    title: 'Chola Dynasty Antique Lakshmi Kasu Mala Long Haar',
    category: 'antique',
    festival: 'diwali',
    purity: '22K Antique Gold (916)',
    grossWeight: '68.50 g',
    netWeight: '68.50 g',
    price: 545000,
    offerPrice: 489000,
    discount: 10,
    stock: 3,
    isFestiveSpecial: true,
    isOffer: true,
    isBestseller: true,
    description: 'Opulent antique gold long necklace featuring 45 embossed sacred Goddess Lakshmi gold coins, with an antique ruby-encrusted temple pendant. A timeless bridal heirloom.',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
    dimensions: 'Length: 26 inches | Pendant: 2.8 inches',
    certification: 'BIS Hallmarked 916 Gold • Antique Heritage Guaranteed'
  },
  {
    id: 'AL-AQ-208',
    title: 'Gajraj Antique Temple Kada Pair',
    category: 'antique',
    festival: 'temple',
    purity: '22K Antique Gold (916)',
    grossWeight: '58.00 g',
    netWeight: '58.00 g',
    price: 465000,
    offerPrice: 418000,
    discount: 10,
    stock: 3,
    isFestiveSpecial: true,
    isOffer: true,
    isBestseller: true,
    description: 'Masterpiece nakshi carved pair of royal elephant-head (Gajraj) kadas in 22K yellow gold with matte antique finish and cabochon ruby eyes.',
    image: 'https://images.unsplash.com/photo-1611591475103-4fa1b7765a7f?auto=format&fit=crop&w=800&q=80',
    dimensions: 'Size: 2-6 with secure screw lock',
    certification: 'BIS Hallmarked 916 Gold'
  },

  // --- ANTI-TARNISH DAILY WEAR CATEGORY ---
  {
    id: 'AL-AT-206',
    title: 'Celeste Anti-Tarnish 18K Gold Plated Clover Suite',
    category: 'anti_tarnish',
    festival: 'none',
    purity: '18K PVD Gold Anti-Tarnish',
    grossWeight: '18.50 g',
    netWeight: '18.50 g',
    price: 4999,
    offerPrice: 2899,
    discount: 42,
    stock: 20,
    isFestiveSpecial: false,
    isOffer: true,
    isBestseller: true,
    description: '100% Waterproof, Sweatproof, Hypoallergenic 18K PVD gold coated surgical steel four-leaf onyx clover necklace and matching bracelet. Never tarnishes or turns skin green.',
    image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=80',
    dimensions: 'Necklace: 16+2 inches | Bracelet: 6.5+1.5 inches',
    certification: 'Lifetime Anti-Tarnish Guarantee • Waterproof Certified'
  },
  {
    id: 'AL-AT-207',
    title: 'Aura Waterproof Anti-Tarnish Liquid Snake Chain & Hoops',
    category: 'anti_tarnish',
    festival: 'none',
    purity: '18K PVD Anti-Tarnish Steel',
    grossWeight: '22.00 g',
    netWeight: '22.00 g',
    price: 3499,
    offerPrice: 1999,
    discount: 43,
    stock: 18,
    isFestiveSpecial: false,
    isOffer: true,
    isBestseller: true,
    description: 'Silky flat herringbone liquid chain with matching chunky tear-drop waterproof earrings. Safe for perfume, showers, workouts, and swimming.',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
    dimensions: 'Chain Width: 4 mm, Length: 18 inches',
    certification: 'Waterproof & Sweatproof Guaranteed'
  },

  // --- GOLD & DIAMOND CLASSICS ---
  {
    id: 'AL-NK-101',
    title: 'Padmavati Royal 22K Gold Choker',
    category: 'necklaces',
    festival: 'wedding',
    purity: '22K Gold (916)',
    grossWeight: '42.50 g',
    netWeight: '41.20 g',
    price: 335000,
    offerPrice: 299000,
    discount: 11,
    stock: 5,
    isFestiveSpecial: true,
    isOffer: true,
    isBestseller: true,
    description: 'An exquisite handcrafted heirloom choker inspired by Rajasthani royal courts, featuring antique matte gold polish, certified Burmese rubies, and freshwater pearl droplet accents. BIS 916 Hallmarked.',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    dimensions: 'Choker Width: 2.2 inches | Adjustable handwoven silk dori',
    certification: 'BIS Hallmarked 916 Gold • Certified Authenticity'
  },
  {
    id: 'AL-JH-102',
    title: 'Mayura Kundan Meenakari Jhumkas',
    category: 'earrings',
    festival: 'diwali',
    purity: '22K Gold (916)',
    grossWeight: '22.80 g',
    netWeight: '21.50 g',
    price: 184000,
    offerPrice: 162000,
    discount: 12,
    stock: 8,
    isFestiveSpecial: true,
    isOffer: true,
    isBestseller: true,
    description: 'Glorious double-tiered bell jhumkas with hand-painted royal blue and green Meenakari peacock crest, studded with uncut polki and dancing south-sea pearls.',
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80',
    dimensions: 'Length: 7.2 cm | Push back clasp with secure screw lock',
    certification: 'BIS Hallmarked 916 Gold'
  },
  {
    id: 'AL-RG-104',
    title: 'Kohinoor Bloom 18K Solitaire Diamond Ring',
    category: 'rings',
    festival: 'wedding',
    purity: '18K Diamond (VVS-EF)',
    grossWeight: '6.40 g',
    netWeight: '6.15 g',
    price: 145000,
    offerPrice: 128000,
    discount: 12,
    stock: 7,
    isFestiveSpecial: false,
    isOffer: true,
    isBestseller: true,
    description: 'Dazzling 1.10 Carat brilliant-cut certified VVS-EF solitaire framed in a halo of micropavÃ© diamonds on a tapering 18K rose-gold band.',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
    dimensions: 'Ring Size: 14 (Complimentary resizing available)',
    certification: 'IGI Diamond Certified • BIS Hallmarked 18K Gold'
  },
  {
    id: 'AL-BR-106',
    title: 'Maharani Complete Bridal Heritage Trousseau',
    category: 'bridal',
    festival: 'wedding',
    purity: '22K Gold & Uncut Polki',
    grossWeight: '148.50 g',
    netWeight: '142.00 g',
    price: 1190000,
    offerPrice: 1045000,
    discount: 12,
    stock: 2,
    isFestiveSpecial: true,
    isOffer: true,
    isBestseller: true,
    description: 'A grand royal bridal set consisting of a Grand Choker, Matching Chandbali Earrings, Intricate Maang Tikka, and Haathphool. A true legacy investment.',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
    dimensions: 'Full Wedding Set (Choker, Earrings, Maang Tikka)',
    certification: 'BIS Hallmarked 916 Gold • Velvet Storage Vault Box Included'
  },
  {
    id: 'AL-SL-109',
    title: 'Aadya 925 Sterling Silver Royal Puja Thali Set',
    category: 'silver',
    festival: 'diwali',
    purity: '925 Sterling Silver',
    grossWeight: '380.00 g',
    netWeight: '380.00 g',
    price: 42500,
    offerPrice: 38500,
    discount: 9,
    stock: 12,
    isFestiveSpecial: true,
    isOffer: true,
    isBestseller: true,
    description: 'Heavy gauge 92.5% pure silver ornate engraving puja plate with Diya, Agarbatti stand, Bell, and Chandan Katori. Ideal for Diwali Lakshmi Puja and auspicious gifting.',
    image: 'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=800&q=80',
    dimensions: 'Plate Diameter: 10.5 inches | Weight: 380 grams',
    certification: '925 Sterling Silver Hallmarked'
  }
];

// Seed Orders for Demo & Admin Testing with contact 9446814687
const DEFAULT_ORDERS = [
  {
    orderId: 'AL-9842',
    date: '2026-11-14T18:45:00',
    customer: {
      name: 'Priya Sundaram',
      phone: '+91 94468 14687',
      email: 'priya.sundaram@gmail.com',
      address: 'Flat 402, Lotus Orchid, Indiranagar 100ft Road',
      city: 'Bengaluru',
      pincode: '560038'
    },
    items: [
      {
        id: 'AL-TC-201',
        title: 'Aaradhya Handcrafted Terracotta Peacock Temple Set',
        price: 2299,
        quantity: 1,
        purity: 'Natural Terracotta Clay',
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'
      }
    ],
    subtotal: 2299,
    discountCode: 'ALANKARA20',
    discountAmount: 230,
    totalAmount: 2069,
    paymentMethod: 'UPI (HDFC Bank)',
    upiIdUsed: 'maheshmaakgardens@okhdfcbank',
    upiRef: '431872910482',
    paymentStatus: 'Pending Verification',
    orderStatus: 'Payment Pending',
    courierName: 'Blue Dart Insured Vault',
    trackingNumber: '',
    notes: 'Customer shared GPay screenshot on WhatsApp (+91 94468 14687). Awaiting admin confirmation.'
  },
  {
    orderId: 'AL-9841',
    date: '2026-11-13T14:15:00',
    customer: {
      name: 'Rajesh Mehra',
      phone: '+91 98201 54321',
      email: 'rajesh.mehra@hotmail.com',
      address: 'Villa 18, Royal Palms Estate, Whitefield',
      city: 'Bengaluru',
      pincode: '560066'
    },
    items: [
      {
        id: 'AL-AQ-204',
        title: 'Rajkumari Matte Finish Antique Gold Hasli Choker',
        price: 375000,
        quantity: 1,
        purity: '22K Antique Gold (916)',
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80'
      }
    ],
    subtotal: 375000,
    discountCode: 'ALANKARA20',
    discountAmount: 18750,
    totalAmount: 356250,
    paymentMethod: 'UPI (HDFC Bank)',
    upiIdUsed: 'maheshmaakgardens@okhdfcbank',
    upiRef: '431765291840',
    paymentStatus: 'Paid / Confirmed',
    orderStatus: 'Shipped',
    courierName: 'BVC Secure Logistics',
    trackingNumber: 'BVC-BLR-984210',
    notes: 'Payment verified with HDFC Current Account. Shipped with tamper-proof security seals.'
  }
];

// Storage Engine
const AlankaraDB = {
  // Initialize or fetch products
  getProducts: function() {
    try {
      const stored = localStorage.getItem(ALANKARA_STORAGE_KEYS.PRODUCTS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch(e) {
      console.warn("Could not read products from localStorage", e);
    }
    this.saveProducts(DEFAULT_PRODUCTS);
    return DEFAULT_PRODUCTS;
  },

  saveProducts: function(products) {
    try {
      localStorage.setItem(ALANKARA_STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch(e) {
      console.error("Failed to save products", e);
    }
  },

  getProductById: function(id) {
    const products = this.getProducts();
    return products.find(p => p.id === id);
  },

  // Orders
  getOrders: function() {
    try {
      const stored = localStorage.getItem(ALANKARA_STORAGE_KEYS.ORDERS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch(e) {
      console.warn("Could not read orders from localStorage", e);
    }
    this.saveOrders(DEFAULT_ORDERS);
    return DEFAULT_ORDERS;
  },

  saveOrders: function(orders) {
    try {
      localStorage.setItem(ALANKARA_STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch(e) {
      console.error("Failed to save orders", e);
    }
  },

  addOrder: function(order) {
    const orders = this.getOrders();
    orders.unshift(order);
    this.saveOrders(orders);
    return order;
  },

  updateOrder: function(orderId, updates) {
    const orders = this.getOrders();
    const idx = orders.findIndex(o => o.orderId === orderId);
    if (idx !== -1) {
      orders[idx] = { ...orders[idx], ...updates };
      this.saveOrders(orders);
      return orders[idx];
    }
    return null;
  },

  getOrderById: function(orderId) {
    const orders = this.getOrders();
    return orders.find(o => o.orderId.toUpperCase() === orderId.trim().toUpperCase());
  },

  // Settings with seamless fallback & auto-update to 9446814687
  getSettings: function() {
    try {
      const stored = localStorage.getItem(ALANKARA_STORAGE_KEYS.SETTINGS);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure new phone number is preserved
        if (!parsed.contactPhone || parsed.contactPhone.includes('98450')) {
          parsed.contactPhone = DEFAULT_SETTINGS.contactPhone;
          parsed.whatsappNumber = DEFAULT_SETTINGS.whatsappNumber;
          this.saveSettings(parsed);
        }
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch(e) {
      console.warn("Could not read settings from localStorage", e);
    }
    this.saveSettings(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  },

  saveSettings: function(settings) {
    try {
      localStorage.setItem(ALANKARA_STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch(e) {
      console.error("Failed to save settings", e);
    }
  },

  // Cart
  getCart: function() {
    try {
      const stored = localStorage.getItem(ALANKARA_STORAGE_KEYS.CART);
      return stored ? JSON.parse(stored) : [];
    } catch(e) {
      return [];
    }
  },

  saveCart: function(cart) {
    try {
      localStorage.setItem(ALANKARA_STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch(e) {}
  },

  clearCart: function() {
    localStorage.removeItem(ALANKARA_STORAGE_KEYS.CART);
  },

  // Formatting helpers
  formatINR: function(num) {
    if (isNaN(num)) return '₹0';
    return '₹' + Number(num).toLocaleString('en-IN');
  },

  generateOrderId: function() {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return 'AL-' + randomNum;
  },

  // Admin session
  isAdminLoggedIn: function() {
    return sessionStorage.getItem(ALANKARA_STORAGE_KEYS.ADMIN_AUTH) === 'true';
  },

  setAdminLoggedIn: function(status) {
    if (status) {
      sessionStorage.setItem(ALANKARA_STORAGE_KEYS.ADMIN_AUTH, 'true');
    } else {
      sessionStorage.removeItem(ALANKARA_STORAGE_KEYS.ADMIN_AUTH);
    }
  },

  // ── CATEGORY MANAGEMENT (Customisable from Admin Panel) ──────────────
  getCategories: function() {
    try {
      const stored = localStorage.getItem(ALANKARA_STORAGE_KEYS.CATEGORIES);
      if (stored) return JSON.parse(stored);
    } catch(e) {}
    // Return default categories and persist them
    this.saveCategories(CATEGORIES);
    return JSON.parse(JSON.stringify(CATEGORIES));
  },

  saveCategories: function(cats) {
    try {
      localStorage.setItem(ALANKARA_STORAGE_KEYS.CATEGORIES, JSON.stringify(cats));
      // Also refresh global reference
      window.ALANKARA_CATEGORIES = cats;
    } catch(e) { console.error('Failed to save categories', e); }
  },

  addCategory: function(cat) {
    const cats = this.getCategories();
    // Avoid duplicate ids
    if (cats.find(c => c.id === cat.id)) return false;
    cats.push(cat);
    this.saveCategories(cats);
    return true;
  },

  updateCategory: function(id, updates) {
    const cats = this.getCategories();
    const idx = cats.findIndex(c => c.id === id);
    if (idx === -1) return false;
    cats[idx] = { ...cats[idx], ...updates };
    this.saveCategories(cats);
    return true;
  },

  removeCategory: function(id) {
    if (id === 'all') return false; // 'all' is protected
    const cats = this.getCategories().filter(c => c.id !== id);
    this.saveCategories(cats);
    return true;
  }
};

// Expose globally for both app.js and admin.js
window.AlankaraDB = AlankaraDB;
window.ALANKARA_CATEGORIES = CATEGORIES;
window.ALANKARA_FESTIVALS = FESTIVAL_CATEGORIES;


