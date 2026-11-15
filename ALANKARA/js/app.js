/**
 * ALANKARA LUXURY JEWELLERY - STOREFRONT APP ENGINE
 * Handles catalog browsing, festival collections, search, live filters,
 * cart drawer, "Simply Order" checkout, UPI (GPay) dynamic QR, and WhatsApp confirmation.
 */

document.addEventListener('DOMContentLoaded', function() {
  AlankaraStore.init();
});

const AlankaraStore = {
  products: [],
  cart: [],
  wishlist: [],
  settings: {},
  activeCategory: 'all',
  activeFestival: 'all',
  activeSort: 'featured',
  activePurity: 'all',
  searchQuery: '',
  offersOnly: false,
  currentOrderingProduct: null, // For single-product "Simply Order"
  currentDiscount: 0,
  appliedPromoCode: '',

  init: function() {
    this.checkDeviceParam();
    this.loadState();
    this.renderTopBar();
    this.renderCategoryNav();
    this.renderFestivePills();
    this.renderProducts();
    this.bindEvents();
    this.updateCartUI();
  },

  checkDeviceParam: function() {
    if (window.location.search.includes('device=phone')) {
      const switcher = document.getElementById('deviceSwitcherBar');
      if (switcher) switcher.style.display = 'none';
      const sim = document.getElementById('mobileSimulatorModal');
      if (sim) sim.remove();
    }
  },

  switchViewMode: function(mode) {
    const simModal = document.getElementById('mobileSimulatorModal');
    const btnDesk = document.getElementById('btnViewDesktop');
    const btnMob = document.getElementById('btnViewMobile');

    if (mode === 'mobile') {
      if (simModal) {
        simModal.classList.add('open');
        const frame = document.getElementById('mobileSimIframe');
        if (frame && (!frame.src || frame.src === 'about:blank' || frame.src.endsWith('#') || frame.getAttribute('src') === '')) {
          frame.src = 'index.html?device=phone';
        }
      }
      if (btnDesk) btnDesk.classList.remove('active');
      if (btnMob) btnMob.classList.add('active');
    } else {
      if (simModal) simModal.classList.remove('open');
      if (btnDesk) btnDesk.classList.add('active');
      if (btnMob) btnMob.classList.remove('active');
    }
  },

  // Mobile Side Navigation Drawer Control
  toggleMobileDrawer: function(forceState) {
    const drawer = document.getElementById('mobileNavDrawer');
    const backdrop = document.getElementById('mobileNavBackdrop');
    if (!drawer) return;
    const isOpen = drawer.classList.contains('open');
    const shouldOpen = forceState !== undefined ? forceState : !isOpen;

    if (shouldOpen) {
      drawer.classList.add('open');
      if (backdrop) backdrop.classList.add('open');
      document.body.style.overflow = 'hidden'; // Prevent background scrolling while drawer is open
    } else {
      drawer.classList.remove('open');
      if (backdrop) backdrop.classList.remove('open');
      document.body.style.overflow = '';
    }
  },

  closeMobileDrawer: function() {
    this.toggleMobileDrawer(false);
  },

  loadState: function() {
    this.settings = AlankaraDB.getSettings();
    this.products = AlankaraDB.getProducts();
    this.cart = AlankaraDB.getCart();
  },

  // 1. Render Announcement & Top Bar
  renderTopBar: function() {
    const announcementEl = document.getElementById('topAnnouncementText');
    if (announcementEl) announcementEl.textContent = this.settings.announcement;

    // Update hero banner if exists
    const heroTitle = document.getElementById('heroBannerTitle');
    const heroSub = document.getElementById('heroBannerSub');
    const heroCode = document.getElementById('heroBannerCode');
    if (heroTitle && this.settings.festivalBanner?.title) heroTitle.textContent = this.settings.festivalBanner.title;
    if (heroSub && this.settings.festivalBanner?.subtitle) heroSub.textContent = this.settings.festivalBanner.subtitle;
    if (heroCode && this.settings.festivalBanner?.code) heroCode.textContent = this.settings.festivalBanner.code;

    // Update store phone & whatsapp everywhere
    const waFloat = document.getElementById('floatingWhatsAppLink');
    if (waFloat) {
      waFloat.href = `https://wa.me/${this.settings.whatsappNumber}?text=${encodeURIComponent('Hello ALANKARA Jewellers! I am interested in your luxury jewellery collection.')}`;
    }
  },

  // 2. Render Category Filters
  renderCategoryNav: function() {
    const navContainer = document.getElementById('categoryTabsContainer');
    if (!navContainer) return;

    let html = '';
    window.ALANKARA_CATEGORIES.forEach(cat => {
      const activeClass = this.activeCategory === cat.id ? 'active' : '';
      html += `
        <button class="cat-tab-btn ${activeClass}" data-category="${cat.id}">
          <i class="${cat.icon}"></i> ${cat.name}
        </button>
      `;
    });
    navContainer.innerHTML = html;
  },

  // 3. Render Festive Special Pills
  renderFestivePills: function() {
    const pillContainer = document.getElementById('festivePillsContainer');
    if (!pillContainer) return;

    let html = `
      <button class="festive-pill ${this.activeFestival === 'all' ? 'active' : ''}" data-festival="all">
        <i class="fas fa-sparkles"></i> All Festive Specials
      </button>
    `;
    window.ALANKARA_FESTIVALS.forEach(f => {
      const activeClass = this.activeFestival === f.id ? 'active' : '';
      html += `
        <button class="festive-pill ${activeClass}" data-festival="${f.id}">
          <i class="fas fa-om"></i> ${f.name}
        </button>
      `;
    });
    pillContainer.innerHTML = html;
  },

  // 4. Filter and Render Products
  getFilteredProducts: function() {
    return this.products.filter(p => {
      // Category filter
      if (this.activeCategory !== 'all' && p.category !== this.activeCategory) return false;
      // Festival filter
      if (this.activeFestival !== 'all' && p.festival !== this.activeFestival) return false;
      // Purity filter
      if (this.activePurity !== 'all') {
        if (!p.purity.toLowerCase().includes(this.activePurity.toLowerCase())) return false;
      }
      // Offers only
      if (this.offersOnly && !p.isOffer) return false;
      // Search query
      if (this.searchQuery.trim() !== '') {
        const q = this.searchQuery.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        const matchPurity = p.purity.toLowerCase().includes(q);
        const matchCat = p.category.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchPurity && !matchCat) return false;
      }
      return true;
    }).sort((a, b) => {
      if (this.activeSort === 'price-asc') return a.offerPrice - b.offerPrice;
      if (this.activeSort === 'price-desc') return b.offerPrice - a.offerPrice;
      if (this.activeSort === 'discount') return b.discount - a.discount;
      // Default: featured/bestseller first
      return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
    });
  },

  renderProducts: function() {
    const grid = document.getElementById('productsGrid');
    const countBadge = document.getElementById('productsCountBadge');
    if (!grid) return;

    const filtered = this.getFilteredProducts();
    if (countBadge) countBadge.textContent = `${filtered.length} Exquisite Designs`;

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem;">
          <i class="fas fa-gem" style="font-size: 3rem; color: #D4AF37; margin-bottom: 1rem;"></i>
          <h3 style="font-family: var(--font-serif); font-size: 1.5rem; margin-bottom: 0.5rem;">No jewellery matches your current filter</h3>
          <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Try selecting a different category or clear the search criteria.</p>
          <button class="btn-primary" onclick="AlankaraStore.resetFilters()">Show All Jewellery</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(p => {
      const fallbackImg = JewelVisuals.getFallbackImage(p.category, p.title, p.purity);
      const stockBadge = p.stock > 3 
        ? `<span class="stock-status stock-in"><i class="fas fa-check-circle"></i> In Stock (${p.stock} units)</span>`
        : (p.stock > 0 
          ? `<span class="stock-status stock-low"><i class="fas fa-exclamation-triangle"></i> Only ${p.stock} left in vault</span>`
          : `<span class="stock-status stock-out"><i class="fas fa-times-circle"></i> Made to Order</span>`);

      let categoryBadge = '';
      if (p.category === 'terracotta') {
        categoryBadge = `<span class="badge-terracotta"><i class="fas fa-palette"></i> Terracotta</span>`;
      } else if (p.category === 'antique') {
        categoryBadge = `<span class="badge-antique"><i class="fas fa-chess-queen"></i> Antique</span>`;
      } else if (p.category === 'anti_tarnish') {
        categoryBadge = `<span class="badge-anti-tarnish"><i class="fas fa-shield-alt"></i> Anti-Tarnish</span>`;
      }

      const festivalTag = p.isFestiveSpecial 
        ? `<span class="badge-festive"><i class="fas fa-sparkles"></i> Festive Special</span>`
        : '';

      return `
        <div class="product-card" data-id="${p.id}">
          <div class="product-img-wrap">
            <div class="card-badges">
              ${categoryBadge}
              ${festivalTag}
              <span class="badge-purity">${p.purity}</span>
            </div>
            ${p.discount > 0 ? `<div class="badge-discount">${p.discount}% OFF</div>` : ''}
            
            <img src="${p.image}" alt="${p.title}" 
                 loading="lazy" 
                 onerror="this.onerror=null; this.src='${fallbackImg}';">
            
            <div class="card-quick-actions">
              <button class="btn-icon-action" title="Quick View" onclick="AlankaraStore.openDetailModal('${p.id}')">
                <i class="fas fa-eye"></i>
              </button>
              <button class="btn-icon-action" title="Share on WhatsApp" onclick="AlankaraStore.shareProductOnWhatsApp('${p.id}')">
                <i class="fab fa-whatsapp" style="color: #25D366;"></i>
              </button>
            </div>
          </div>
          
          <div class="product-content">
            <div class="product-meta">
              <span class="weight-tag"><i class="fas fa-weight-hanging"></i> Gross: ${p.grossWeight || 'N/A'}</span>
              <span><i class="fas fa-shield-alt" style="color: #D4AF37;"></i> BIS 916</span>
            </div>
            
            <h3 class="product-title" onclick="AlankaraStore.openDetailModal('${p.id}')" style="cursor: pointer;">
              ${p.title}
            </h3>
            
            <div class="product-pricing">
              <span class="current-price">${AlankaraDB.formatINR(p.offerPrice)}</span>
              ${p.price > p.offerPrice ? `<span class="original-price">${AlankaraDB.formatINR(p.price)}</span>` : ''}
            </div>

            ${stockBadge}
            
            <div class="card-btn-group">
              <button class="btn-simply-order" onclick="AlankaraStore.startSingleCheckout('${p.id}')">
                <i class="fas fa-bolt"></i> Simply Order
              </button>
              <button class="btn-add-cart" onclick="AlankaraStore.addToCart('${p.id}')">
                <i class="fas fa-shopping-bag"></i> Add to Bag
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  resetFilters: function() {
    this.activeCategory = 'all';
    this.activeFestival = 'all';
    this.activePurity = 'all';
    this.searchQuery = '';
    this.offersOnly = false;
    const searchInput = document.getElementById('headerSearchInput');
    if (searchInput) searchInput.value = '';
    this.renderCategoryNav();
    this.renderFestivePills();
    this.renderProducts();
  },

  // 5. Product Quick View / Detail Modal
  openDetailModal: function(productId) {
    const p = AlankaraDB.getProductById(productId);
    if (!p) return;

    const modal = document.getElementById('productDetailModal');
    const content = document.getElementById('productDetailContent');
    if (!modal || !content) return;

    const fallbackImg = JewelVisuals.getFallbackImage(p.category, p.title, p.purity);
    // Support multiple images: use p.images[] array, or fall back to p.image
    const images = (p.images && p.images.length > 0) ? p.images : [p.image || fallbackImg];

    // Build thumbnail strip HTML
    const thumbsHTML = images.length > 1 ? `
      <div style="display:flex; gap:0.5rem; margin-top:0.6rem; overflow-x:auto; padding-bottom:0.25rem;">
        ${images.map((img, i) => `
          <img src="${img}" alt="View ${i+1}"
            onclick="AlankaraStore.switchDetailImage('${img}', '${fallbackImg}')"
            onerror="this.src='${fallbackImg}'"
            style="width:60px;height:60px;object-fit:cover;border-radius:8px;cursor:pointer;border:2px solid ${i===0?'#D4AF37':'rgba(212,175,55,0.3)'};flex-shrink:0;transition:border-color 0.2s;" />
        `).join('')}
      </div>` : '';

    content.innerHTML = `
      <div class="product-detail-grid">
        <div>
          <div class="modal-detail-img-wrap" style="border-radius:12px;overflow:hidden;border:2px solid rgba(212,175,55,0.4);background:#0E0806;">
            <img id="detailMainImg" src="${images[0]}" alt="${p.title}"
                 style="width:100%;height:360px;object-fit:cover;transition:opacity 0.25s;"
                 onerror="this.onerror=null;this.src='${fallbackImg}';">
          </div>
          ${thumbsHTML}
          <div style="display:flex;gap:0.5rem;margin-top:1rem;">
            <div style="background:#F8F5EE;border:1px solid #E2D9C5;padding:0.5rem;border-radius:6px;font-size:0.75rem;flex:1;text-align:center;">
              <strong>Gross Weight</strong><br>${p.grossWeight || 'N/A'}
            </div>
            <div style="background:#F8F5EE;border:1px solid #E2D9C5;padding:0.5rem;border-radius:6px;font-size:0.75rem;flex:1;text-align:center;">
              <strong>Net Weight</strong><br>${p.netWeight || p.grossWeight || 'N/A'}
            </div>
            <div style="background:#F8F5EE;border:1px solid #E2D9C5;padding:0.5rem;border-radius:6px;font-size:0.75rem;flex:1;text-align:center;">
              <strong>Purity</strong><br>${p.purity}
            </div>
          </div>
        </div>

        <div>
          <div style="margin-bottom:0.5rem;">
            <span class="badge-festive">${p.festival ? p.festival.toUpperCase() + ' SPECIAL' : 'HERITAGE'}</span>
            <span class="badge-purity" style="margin-left:0.5rem;">${p.certification || 'BIS Hallmarked'}</span>
          </div>
          
          <h2 style="font-family:var(--font-serif);font-size:1.6rem;margin-bottom:0.75rem;color:var(--text-dark);">
            ${p.title}
          </h2>

          <div style="display:flex;align-items:baseline;gap:1rem;margin-bottom:1.25rem;">
            <span style="font-size:1.8rem;font-weight:800;color:var(--text-dark);">${AlankaraDB.formatINR(p.offerPrice)}</span>
            ${p.price > p.offerPrice ? `<span style="font-size:1.1rem;color:var(--text-muted);text-decoration:line-through;">${AlankaraDB.formatINR(p.price)}</span>` : ''}
            ${p.discount > 0 ? `<span style="background:var(--gold-gradient);color:#120B08;font-weight:800;padding:0.2rem 0.6rem;border-radius:4px;font-size:0.8rem;">Save ${p.discount}%</span>` : ''}
          </div>

          <p style="color:var(--text-muted);font-size:0.95rem;line-height:1.6;margin-bottom:1.25rem;">
            ${p.description}
          </p>

          <div style="background:#FDFBF7;border:1px solid rgba(212,175,55,0.3);border-radius:8px;padding:0.85rem 1rem;margin-bottom:1.5rem;font-size:0.85rem;">
            <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.35rem;color:#1B4D3E;font-weight:700;">
              <i class="fas fa-certificate"></i> Guaranteed 100% Purity & Hallmark Insured
            </div>
            <div><strong>Dimensions / Fit:</strong> ${p.dimensions || 'Standard Luxury Fit with Extender'}</div>
            <div><strong>Availability:</strong> ${p.stock > 0 ? `${p.stock} ready in vault for immediate dispatch` : 'Custom craft on order'}</div>
          </div>

          <div style="display:flex;gap:1rem;">
            <button class="btn-primary" style="flex:1;" onclick="AlankaraStore.startSingleCheckout('${p.id}'); AlankaraStore.closeModal('productDetailModal');">
              <i class="fas fa-bolt"></i> Simply Order with UPI
            </button>
            <button class="btn-outline-gold" style="color:var(--text-dark);" onclick="AlankaraStore.addToCart('${p.id}'); AlankaraStore.closeModal('productDetailModal');">
              <i class="fas fa-shopping-bag"></i> Add to Bag
            </button>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('open');
  },

  // Switch main detail image (gallery)
  switchDetailImage: function(src, fallback) {
    const img = document.getElementById('detailMainImg');
    if (!img) return;
    img.style.opacity = '0';
    setTimeout(() => {
      img.src = src;
      img.onerror = () => { img.src = fallback; };
      img.style.opacity = '1';
      // Update thumbnail borders
      document.querySelectorAll('.modal-detail-img-wrap + div img').forEach(t => {
        t.style.borderColor = (t.src === src || t.src.endsWith(src)) ? '#D4AF37' : 'rgba(212,175,55,0.3)';
      });
    }, 180);
  },

  // 6. Share on WhatsApp
  shareProductOnWhatsApp: function(productId) {
    const p = AlankaraDB.getProductById(productId);
    if (!p) return;
    const text = `Namaste! Look at this gorgeous ${p.title} (${p.purity}) on ALANKARA: ${AlankaraDB.formatINR(p.offerPrice)}. Inquiries/Ordering: https://wa.me/${this.settings.whatsappNumber}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  },

  // 7. Cart Drawer Management
  addToCart: function(productId) {
    const p = AlankaraDB.getProductById(productId);
    if (!p) return;

    const existing = this.cart.find(item => item.id === productId);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.cart.push({
        id: p.id,
        title: p.title,
        price: p.offerPrice,
        purity: p.purity,
        image: p.image,
        category: p.category,
        quantity: 1
      });
    }

    AlankaraDB.saveCart(this.cart);
    this.updateCartUI();
    this.showToast(`âœ¨ Added "${p.title}" to your Jewellery Bag!`, 'success');
  },

  removeFromCart: function(productId) {
    this.cart = this.cart.filter(item => item.id !== productId);
    AlankaraDB.saveCart(this.cart);
    this.updateCartUI();
    this.renderCartDrawer();
  },

  changeCartQty: function(productId, delta) {
    const item = this.cart.find(i => i.id === productId);
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        this.removeFromCart(productId);
        return;
      }
      AlankaraDB.saveCart(this.cart);
      this.updateCartUI();
      this.renderCartDrawer();
    }
  },

  updateCartUI: function() {
    const totalCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    const badges = document.querySelectorAll('.cart-badge-count');
    badges.forEach(b => b.textContent = totalCount);
  },

  openCartDrawer: function() {
    this.renderCartDrawer();
    document.getElementById('cartDrawer').classList.add('open');
    document.getElementById('cartDrawerBackdrop').classList.add('open');
  },

  closeCartDrawer: function() {
    document.getElementById('cartDrawer').classList.remove('open');
    document.getElementById('cartDrawerBackdrop').classList.remove('open');
  },

  renderCartDrawer: function() {
    const container = document.getElementById('cartDrawerItems');
    const totalEl = document.getElementById('cartDrawerTotal');
    if (!container) return;

    if (this.cart.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem;">
          <i class="fas fa-shopping-bag" style="font-size: 2.5rem; color: #D4AF37; margin-bottom: 1rem;"></i>
          <h4 style="font-family: var(--font-serif); font-size: 1.2rem; margin-bottom: 0.5rem;">Your Bag is Empty</h4>
          <p style="color: var(--text-muted); font-size: 0.85rem;">Discover our festive specials & timeless ornaments.</p>
        </div>
      `;
      if (totalEl) totalEl.textContent = '₹0';
      return;
    }

    let subtotal = 0;
    container.innerHTML = this.cart.map(item => {
      const lineTotal = item.price * item.quantity;
      subtotal += lineTotal;
      const fallback = JewelVisuals.getFallbackImage(item.category || 'necklaces', item.title, item.purity);
      return `
        <div class="cart-item-card">
          <img src="${item.image}" alt="${item.title}" class="cart-item-img"
               onerror="this.onerror=null; this.src='${fallback}';">
          <div class="cart-item-info">
            <h4 class="cart-item-title">${item.title}</h4>
            <div style="font-size: 0.75rem; color: #8A6208; font-weight: 600;">${item.purity}</div>
            <div class="cart-item-price">${AlankaraDB.formatINR(lineTotal)}</div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.4rem;">
              <button style="background: #EFEBE2; width: 22px; height: 22px; border-radius: 4px;" onclick="AlankaraStore.changeCartQty('${item.id}', -1)">-</button>
              <span style="font-weight: 700; font-size: 0.85rem;">${item.quantity}</span>
              <button style="background: #EFEBE2; width: 22px; height: 22px; border-radius: 4px;" onclick="AlankaraStore.changeCartQty('${item.id}', 1)">+</button>
              <button style="color: var(--color-ruby); background: none; font-size: 0.8rem; margin-left: auto;" onclick="AlankaraStore.removeFromCart('${item.id}')">
                <i class="fas fa-trash-alt"></i> Remove
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (totalEl) totalEl.textContent = AlankaraDB.formatINR(subtotal);
  },

  // 8. SIMPLY ORDER & CHECKOUT SYSTEM (WITH UPI GPAY + WHATSAPP CONFIRMATION)
  startSingleCheckout: function(productId) {
    const p = AlankaraDB.getProductById(productId);
    if (!p) return;
    this.currentOrderingProduct = p;
    this.openCheckoutModal([
      {
        id: p.id,
        title: p.title,
        price: p.offerPrice,
        purity: p.purity,
        quantity: 1,
        image: p.image
      }
    ]);
  },

  startCartCheckout: function() {
    if (this.cart.length === 0) {
      this.showToast('Please add items to your bag first!', 'error');
      return;
    }
    this.closeCartDrawer();
    this.currentOrderingProduct = null;
    this.openCheckoutModal(this.cart);
  },

  openCheckoutModal: function(items) {
    this.activeOrderItems = items;
    this.currentDiscount = 0;
    this.appliedPromoCode = '';

    const modal = document.getElementById('checkoutModal');
    if (!modal) return;

    // Reset view to Step 1 (Customer Address)
    this.showCheckoutStep(1);
    this.renderCheckoutSummary();

    modal.classList.add('open');
  },

  renderCheckoutSummary: function() {
    const summaryBox = document.getElementById('checkoutSummaryContent');
    if (!summaryBox) return;

    const subtotal = this.activeOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const finalAmount = Math.max(0, subtotal - this.currentDiscount);

    summaryBox.innerHTML = `
      <div style="font-weight: 700; margin-bottom: 0.6rem; border-bottom: 1px solid rgba(212,175,55,0.3); padding-bottom: 0.4rem;">
        Order Details (${this.activeOrderItems.length} item(s)):
      </div>
      ${this.activeOrderItems.map(item => `
        <div class="summary-item-row">
          <span>${item.title} <strong style="color: #8A6208;">x${item.quantity}</strong></span>
          <span>${AlankaraDB.formatINR(item.price * item.quantity)}</span>
        </div>
      `).join('')}
      
      <div class="summary-item-row" style="margin-top: 0.5rem; color: #0F6B4C;">
        <span><i class="fas fa-shield-alt"></i> Insured Vault Shipping</span>
        <span>FREE (Included)</span>
      </div>

      ${this.currentDiscount > 0 ? `
        <div class="summary-item-row" style="color: var(--color-ruby); font-weight: 700;">
          <span>Festive Discount (${this.appliedPromoCode})</span>
          <span>- ${AlankaraDB.formatINR(this.currentDiscount)}</span>
        </div>
      ` : ''}

      <div class="summary-item-row total-row">
        <span>Total Payable (UPI / GPay):</span>
        <span style="color: #120B08;">${AlankaraDB.formatINR(finalAmount)}</span>
      </div>
    `;

    // Also update Step 2 Amount display
    const step2Amount = document.getElementById('upiPayableAmount');
    if (step2Amount) step2Amount.textContent = AlankaraDB.formatINR(finalAmount);
  },

  applyPromoCode: function() {
    const input = document.getElementById('promoCodeInput');
    const msg = document.getElementById('promoCodeMsg');
    if (!input || !msg) return;

    const code = input.value.trim().toUpperCase();
    const subtotal = this.activeOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (code === 'ALANKARA20' || code === 'FESTIVE20') {
      this.currentDiscount = Math.round(subtotal * 0.10); // 10% instant festive cash off
      this.appliedPromoCode = code;
      msg.textContent = `ðŸŽ‰ Promo ${code} applied! Instant savings of ${AlankaraDB.formatINR(this.currentDiscount)}`;
      msg.style.color = '#0F6B4C';
    } else {
      this.currentDiscount = 0;
      this.appliedPromoCode = '';
      msg.textContent = `Invalid promo code. Use ALANKARA20 for festive discount!`;
      msg.style.color = '#B71C1C';
    }
    this.renderCheckoutSummary();
  },

  showCheckoutStep: function(stepNumber) {
    document.querySelectorAll('.checkout-step-pane').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.step-indicator').forEach(el => el.classList.remove('active'));

    const activePane = document.getElementById(`checkoutStep${stepNumber}`);
    const activeIndicator = document.getElementById(`stepIndicator${stepNumber}`);

    if (activePane) activePane.style.display = 'block';
    if (activeIndicator) activeIndicator.classList.add('active');

    if (stepNumber === 2) {
      // Generate Dynamic QR Code on canvas
      this.setupUPIPaymentScreen();
    }
  },

  proceedToPayment: function() {
    // Validate Step 1 form fields
    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const address = document.getElementById('custAddress').value.trim();
    const pincode = document.getElementById('custPincode').value.trim();

    if (!name || !phone || !address || !pincode) {
      this.showToast('Please fill in your Name, WhatsApp Phone, Address and Pincode.', 'error');
      return;
    }

    if (phone.replace(/\D/g, '').length < 10) {
      this.showToast('Please enter a valid 10-digit WhatsApp phone number.', 'error');
      return;
    }

    this.pendingOrderData = {
      orderId: AlankaraDB.generateOrderId(),
      date: new Date().toISOString(),
      customer: {
        name: name,
        phone: phone,
        email: document.getElementById('custEmail').value.trim(),
        address: address,
        city: document.getElementById('custCity').value.trim() || 'Bengaluru',
        pincode: pincode
      },
      items: this.activeOrderItems,
      subtotal: this.activeOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      discountCode: this.appliedPromoCode,
      discountAmount: this.currentDiscount,
      totalAmount: Math.max(0, this.activeOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) - this.currentDiscount),
      paymentMethod: 'UPI (HDFC Bank)',
      upiIdUsed: this.settings.upiId || 'maheshmaakgardens@okhdfcbank',
      orderStatus: 'Payment Pending',
      paymentStatus: 'Pending Verification'
    };

    // Show step 2 (UPI Screen)
    this.showCheckoutStep(2);
  },

  setupUPIPaymentScreen: function() {
    const upiIdDisplay = document.getElementById('upiIdDisplay');
    const merchantDisplay = document.getElementById('merchantNameDisplay');
    const deepLinkBtn = document.getElementById('gpayDeepLinkBtn');
    const qrContainer = document.getElementById('upiQrCode');

    const upiId = this.settings.upiId || 'maheshmaakgardens@okhdfcbank';
    const merchant = this.settings.merchantName || 'ALANKARA JEWELLERS';
    const amount = this.pendingOrderData.totalAmount;
    const orderId = this.pendingOrderData.orderId;

    if (upiIdDisplay) upiIdDisplay.textContent = upiId;
    if (merchantDisplay) merchantDisplay.textContent = merchant;

    // Build real UPI deep link URI
    const cleanAmt = Number(amount || 0).toFixed(2);
    const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(merchant)}&am=${cleanAmt}&tn=${encodeURIComponent('Order ' + orderId)}&cu=INR`;

    if (deepLinkBtn) deepLinkBtn.href = upiUri;

    // Render real scannable QR code using QRCode.js library
    if (qrContainer && typeof QRCode !== 'undefined') {
      qrContainer.innerHTML = '';
      new QRCode(qrContainer, {
        text: upiUri,
        width: 200,
        height: 200,
        colorDark: '#1A0A00',
        colorLight: '#FFFFFF',
        correctLevel: QRCode.CorrectLevel.M
      });
    }
  },

  copyUpiId: function() {
    const upiId = this.settings.upiId || 'maheshmaakgardens@okhdfcbank';
    navigator.clipboard.writeText(upiId).then(() => {
      this.showToast('âœ… UPI ID copied to clipboard: ' + upiId, 'success');
    }).catch(() => {
      this.showToast('UPI ID: ' + upiId, 'info');
    });
  },

  // WhatsApp Payment Confirmation Trigger
  confirmOrderOnWhatsApp: function() {
    const utrInput = document.getElementById('upiUtrInput');
    const utr = utrInput ? utrInput.value.trim() : '';

    if (!this.pendingOrderData) return;

    this.pendingOrderData.upiRef = utr || 'Awaiting Screenshot';
    this.pendingOrderData.notes = utr ? `Customer provided UTR: ${utr}` : 'Customer will send GPay screenshot directly on WhatsApp';

    // Save order to LocalStorage database!
    AlankaraDB.addOrder(this.pendingOrderData);

    // If ordered from cart, clear cart
    if (!this.currentOrderingProduct) {
      AlankaraDB.clearCart();
      this.cart = [];
      this.updateCartUI();
    }

    // Build Professional WhatsApp Message Slip
    const o = this.pendingOrderData;
    const itemsList = o.items.map(i => `• ${i.title} (${i.purity}) x${i.quantity} = ${AlankaraDB.formatINR(i.price * i.quantity)}`).join('\n');

    const waText = 
`ðŸ‘‘ *ALANKARA JEWELLERY - NEW ORDER PAYMENT CONFIRMATION* ðŸ‘‘
------------------------------------------------
*Order ID:* ${o.orderId}
*Customer Name:* ${o.customer.name}
*Phone:* ${o.customer.phone}
*Address:* ${o.customer.address}, ${o.customer.city} - ${o.customer.pincode}
------------------------------------------------
*ITEMS ORDERED:*
${itemsList}
------------------------------------------------
*Total Payable:* ${AlankaraDB.formatINR(o.totalAmount)}
*Payment Method:* UPI (HDFC Bank)
*UPI ID Paid To:* ${o.upiIdUsed}
*UPI Reference / UTR:* ${o.upiRef}
------------------------------------------------
âœ¨ _I have completed the payment via GPay / UPI. Please verify and confirm my order dispatch with Hallmarking & Insurance._`;

    // Open WhatsApp
    const waUrl = `https://wa.me/${this.settings.whatsappNumber}?text=${encodeURIComponent(waText)}`;
    window.open(waUrl, '_blank');

    // Move to Step 3: Success Screen
    this.showConfirmationScreen(o);
  },

  showConfirmationScreen: function(order) {
    this.showCheckoutStep(3);

    const confBox = document.getElementById('confirmationDetails');
    if (!confBox) return;

    confBox.innerHTML = `
      <div style="text-align: center; margin-bottom: 1.5rem;">
        <div style="width: 70px; height: 70px; border-radius: 50%; background: #E8F5E9; color: #2E7D32; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 1rem;">
          <i class="fas fa-check"></i>
        </div>
        <h3 style="font-family: var(--font-serif); font-size: 1.6rem; color: #120B08; margin-bottom: 0.25rem;">
          Order Placed Successfully!
        </h3>
        <p style="color: var(--text-muted); font-size: 0.9rem;">
          Your order has been logged into our vault system.
        </p>
      </div>

      <div style="background: #FDFBF7; border: 1.5px solid var(--primary-gold); border-radius: 12px; padding: 1.25rem; margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #D4AF37; padding-bottom: 0.75rem; margin-bottom: 0.75rem;">
          <span style="font-weight: 700;">Order Reference ID:</span>
          <span style="font-family: var(--font-serif); font-size: 1.1rem; font-weight: 800; color: #8A6208;">${order.orderId}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.85rem;">
          <span style="color: var(--text-muted);">Total Amount Paid:</span>
          <strong>${AlankaraDB.formatINR(order.totalAmount)} (UPI GPay)</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.85rem;">
          <span style="color: var(--text-muted);">UTR / Reference:</span>
          <strong style="font-family: monospace;">${order.upiRef}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
          <span style="color: var(--text-muted);">Verification Status:</span>
          <span style="background: #FFF3E0; color: #E65100; font-weight: 700; padding: 0.15rem 0.6rem; border-radius: 4px;">
            Awaiting Admin Verification
          </span>
        </div>
      </div>

      <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
        <button class="btn-primary" style="flex: 1;" onclick="AlankaraStore.openTrackingModal('${order.orderId}'); AlankaraStore.closeModal('checkoutModal');">
          <i class="fas fa-truck"></i> Live Track This Order
        </button>
        <button class="btn-outline-gold" style="color: var(--text-dark);" onclick="AlankaraStore.closeModal('checkoutModal')">
          Continue Shopping
        </button>
      </div>
    `;
  },

  // 9. ORDER TRACKING SYSTEM ("track the product")
  openTrackingModal: function(prefillOrderId) {
    const modal = document.getElementById('trackingModal');
    if (!modal) return;

    const input = document.getElementById('trackOrderIdInput');
    if (input && prefillOrderId) {
      input.value = prefillOrderId;
      this.performOrderTrack();
    }

    modal.classList.add('open');
  },

  performOrderTrack: function() {
    const input = document.getElementById('trackOrderIdInput');
    const resultBox = document.getElementById('trackingResultBox');
    if (!input || !resultBox) return;

    const query = input.value.trim().toUpperCase();
    if (!query) {
      this.showToast('Please enter your Order ID (e.g. AL-9842)', 'error');
      return;
    }

    const order = AlankaraDB.getOrderById(query);
    if (!order) {
      resultBox.innerHTML = `
        <div style="background: #FFEBEE; border: 1px solid #FFCDD2; padding: 1.5rem; border-radius: 8px; text-align: center; color: var(--color-ruby);">
          <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
          <h4>No Order Found with ID "${query}"</h4>
          <p style="font-size: 0.85rem; margin-top: 0.35rem; color: #555;">Please double check your Order ID from your receipt or WhatsApp message.</p>
        </div>
      `;
      return;
    }

    // Determine tracking steps progress
    const isPaymentConfirmed = order.paymentStatus === 'Paid / Confirmed';
    const isProcessing = order.orderStatus === 'Processing' || order.orderStatus === 'Shipped' || order.orderStatus === 'Delivered';
    const isShipped = order.orderStatus === 'Shipped' || order.orderStatus === 'Delivered';
    const isDelivered = order.orderStatus === 'Delivered';

    resultBox.innerHTML = `
      <div style="background: #FDFBF7; border: 1.5px solid var(--primary-gold); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; border-bottom: 1px solid #E5DEC9; padding-bottom: 0.75rem;">
          <div>
            <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Tracking Details For</div>
            <div style="font-family: var(--font-serif); font-size: 1.35rem; font-weight: 800; color: #120B08;">${order.orderId}</div>
          </div>
          <div style="text-align: right;">
            <span class="badge-status ${isPaymentConfirmed ? 'status-verified' : 'status-pending'}">
              <i class="fas ${isPaymentConfirmed ? 'fa-check-circle' : 'fa-clock'}"></i>
              Payment: ${order.paymentStatus}
            </span>
          </div>
        </div>

        <div style="font-size: 0.85rem; color: #4A3E38; margin-bottom: 1.25rem;">
          <strong>Recipient:</strong> ${order.customer.name} | ${order.customer.phone}<br>
          <strong>Destination:</strong> ${order.customer.address}, ${order.customer.city} - ${order.customer.pincode}
        </div>

        <!-- Tracking Timeline -->
        <ul class="tracking-timeline">
          <li class="tracking-step done">
            <div class="step-marker"><i class="fas fa-check"></i></div>
            <div class="tracking-content">
              <h5>Order Placed</h5>
              <p>Received on ${new Date(order.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </li>

          <li class="tracking-step ${isPaymentConfirmed ? 'done' : 'active'}">
            <div class="step-marker"><i class="fas ${isPaymentConfirmed ? 'fa-check' : 'fa-hourglass-half'}"></i></div>
            <div class="tracking-content">
              <h5>UPI (GPay) Payment Verification</h5>
              <p>${isPaymentConfirmed ? `Verified by Admin • UTR: ${order.upiRef || 'Matched'}` : `Pending admin bank statement reconciliation (UTR: ${order.upiRef || 'Submitted'})`}</p>
            </div>
          </li>

          <li class="tracking-step ${isProcessing ? 'done' : (isPaymentConfirmed ? 'active' : '')}">
            <div class="step-marker"><i class="fas ${isProcessing ? 'fa-check' : 'fa-gem'}"></i></div>
            <div class="tracking-content">
              <h5>Hallmarking & Luxury Vault Packing</h5>
              <p>BIS 916 purity re-certified, sealed in tamper-proof velvet security vault box</p>
            </div>
          </li>

          <li class="tracking-step ${isShipped ? 'done' : (isProcessing ? 'active' : '')}">
            <div class="step-marker"><i class="fas ${isShipped ? 'fa-check' : 'fa-shipping-fast'}"></i></div>
            <div class="tracking-content">
              <h5>Dispatched with Insured Courier</h5>
              <p>${isShipped ? `Carrier: ${order.courierName || 'Blue Dart Insured'} | AWB: ${order.trackingNumber || 'Available on request'}` : 'Awaiting courier vault pickup'}</p>
            </div>
          </li>

          <li class="tracking-step ${isDelivered ? 'done' : ''}">
            <div class="step-marker"><i class="fas fa-home"></i></div>
            <div class="tracking-content">
              <h5>Delivered & Inspected</h5>
              <p>${isDelivered ? 'Safely handed over to customer with original hallmarked certificate.' : 'Estimated delivery within 2-4 business days.'}</p>
            </div>
          </li>
        </ul>

        <div style="margin-top: 1.5rem; text-align: center;">
          <a href="https://wa.me/${this.settings.whatsappNumber}?text=${encodeURIComponent(`Namaste ALANKARA! I am checking on my Order ID: ${order.orderId}. Can you please share the latest courier update?`)}" 
             target="_blank" class="btn-whatsapp-confirm" style="font-size: 0.9rem; padding: 0.65rem 1.25rem;">
            <i class="fab fa-whatsapp"></i> Chat with Vault Manager about ${order.orderId}
          </a>
        </div>
      </div>
    `;
  },

  closeModal: function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('open');
  },

  showToast: function(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <i class="fas ${type === 'success' ? 'fa-check-circle' : (type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle')}" 
         style="color: ${type === 'success' ? '#0F6B4C' : (type === 'error' ? '#B71C1C' : '#D4AF37')}; font-size: 1.1rem;"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 4000);
  },

  // 10. Event Listeners
  bindEvents: function() {
    // Category tabs
    document.addEventListener('click', (e) => {
      const catBtn = e.target.closest('.cat-tab-btn');
      if (catBtn) {
        this.activeCategory = catBtn.dataset.category;
        this.renderCategoryNav();
        this.renderProducts();
        return;
      }

      // Festive pills
      const festBtn = e.target.closest('.festive-pill');
      if (festBtn) {
        this.activeFestival = festBtn.dataset.festival;
        this.renderFestivePills();
        this.renderProducts();
        return;
      }

      // Backdrop modal close
      if (e.target.classList.contains('modal-backdrop')) {
        e.target.classList.remove('open');
      }
    });

    // Search input
    const searchInput = document.getElementById('headerSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.renderProducts();
      });
    }

    // Sort select
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.activeSort = e.target.value;
        this.renderProducts();
      });
    }

    // Purity filter
    const puritySelect = document.getElementById('puritySelect');
    if (puritySelect) {
      puritySelect.addEventListener('change', (e) => {
        this.activePurity = e.target.value;
        this.renderProducts();
      });
    }

    // Offers only toggle
    const offersToggle = document.getElementById('offersOnlyToggle');
    if (offersToggle) {
      offersToggle.addEventListener('change', (e) => {
        this.offersOnly = e.target.checked;
        this.renderProducts();
      });
    }

    // Mobile Touch Gesture Support
    // 1. Swiping Right to Left closes open Side Drawer or Cart
    // 2. Swiping Left to Right near the screen edge opens the Side Drawer
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    document.addEventListener('touchstart', (e) => {
      if (e.changedTouches && e.changedTouches[0]) {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
      }
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      if (e.changedTouches && e.changedTouches[0]) {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        
        // Horizontal gesture detected (horizontal movement greater than vertical and > 45px)
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 45) {
          const drawer = document.getElementById('mobileNavDrawer');
          const isDrawerOpen = drawer && drawer.classList.contains('open');

          // Swipe right to left (<-)
          if (deltaX < 0) {
            if (isDrawerOpen) {
              this.closeMobileDrawer();
            }
            const cartDrawer = document.getElementById('cartDrawer');
            if (cartDrawer && cartDrawer.classList.contains('open')) {
              this.closeCartDrawer();
            }
          } 
          // Swipe left to right (->) starting near edge (< 45px from left)
          else if (deltaX > 0 && touchStartX < 45 && !isDrawerOpen) {
            if (window.innerWidth <= 768) {
              this.toggleMobileDrawer(true);
            }
          }
        }
      }
    }, { passive: true });
  }
};

window.AlankaraStore = AlankaraStore;

