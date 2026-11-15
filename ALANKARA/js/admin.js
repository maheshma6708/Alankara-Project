/**
 * ALANKARA LUXURY JEWELLERY - ADMIN CONTROL PANEL ENGINE
 * Complete Admin Management: Auth, Product/Design CRUD, Order & Payment Verification,
 * Inventory Controls, Store Customization, CSV Reports, and Printable Invoices.
 */

document.addEventListener('DOMContentLoaded', function() {
  AlankaraAdmin.init();
});

const AlankaraAdmin = {
  products: [],
  orders: [],
  settings: {},
  activeTab: 'dashboard',
  orderFilter: 'all',
  editingProductId: null,

 init: async function() {
    await this.loadData();
    this.checkAuth();
    this.bindEvents();
  },

loadData: async function() {
    this.settings = await AlankaraDB.getSettings();
    this.products = await AlankaraDB.getProducts();
    this.orders = await AlankaraDB.getOrders();
  },

  // 1. AUTHENTICATION GATE ("admin can access only through the username and password")
  checkAuth: function() {
    const isLogged = AlankaraDB.isAdminLoggedIn();
    const authOverlay = document.getElementById('authOverlay');
    if (!authOverlay) return;

    if (isLogged) {
      authOverlay.style.display = 'none';
      this.renderCurrentView();
    } else {
      authOverlay.style.display = 'flex';
    }
  },

  login: function(username, password) {
    const errorAlert = document.getElementById('authErrorAlert');
    const validUser = this.settings.adminUsername || 'admin';
    const validPass = this.settings.adminPasswordHash || 'admin123';

    if (username.trim() === validUser && password === validPass) {
      AlankaraDB.setAdminLoggedIn(true);
      if (errorAlert) errorAlert.style.display = 'none';
      document.getElementById('authOverlay').style.display = 'none';
      this.renderCurrentView();
      this.showToast('âœ… Welcome to ALANKARA Vault & Store Control Panel!', 'success');
    } else {
      if (errorAlert) {
        errorAlert.textContent = 'âŒ Invalid Admin Username or Password. Please check credentials.';
        errorAlert.style.display = 'block';
      }
    }
  },

  logout: function() {
    AlankaraDB.setAdminLoggedIn(false);
    location.reload();
  },

  // Mobile Sidebar Drawer Toggle
  toggleSidebar: function(forceState) {
    const sidebar = document.getElementById('adminSidebar');
    const backdrop = document.getElementById('adminSidebarBackdrop');
    if (!sidebar) return;
    const isOpen = sidebar.classList.contains('open');
    const shouldOpen = forceState !== undefined ? forceState : !isOpen;

    if (shouldOpen) {
      sidebar.classList.add('open');
      if (backdrop) backdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    } else {
      sidebar.classList.remove('open');
      if (backdrop) backdrop.classList.remove('open');
      document.body.style.overflow = '';
    }
  },

  // Password Management Methods
  openPasswordModal: function() {
    const modal = document.getElementById('adminPasswordModal');
    if (!modal) return;
    document.getElementById('pwdCurrent').value = '';
    document.getElementById('pwdNew').value = '';
    document.getElementById('pwdConfirm').value = '';
    const alertBox = document.getElementById('pwdModalAlert');
    if (alertBox) {
      alertBox.style.display = 'none';
      alertBox.innerHTML = '';
    }
    modal.classList.add('open');
    this.toggleSidebar(false);
  },

  togglePasswordVisibility: function(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isPass = input.type === 'password';
    input.type = isPass ? 'text' : 'password';
    const icon = btn.querySelector('i');
    if (icon) {
      icon.className = isPass ? 'fas fa-eye-slash' : 'fas fa-eye';
    }
  },

  submitPasswordChange: function() {
    const currentInput = document.getElementById('pwdCurrent').value.trim();
    const newInput = document.getElementById('pwdNew').value.trim();
    const confirmInput = document.getElementById('pwdConfirm').value.trim();
    const alertBox = document.getElementById('pwdModalAlert');

    const validPass = this.settings.adminPasswordHash || 'admin123';

    if (currentInput !== validPass) {
      if (alertBox) {
        alertBox.style.display = 'block';
        alertBox.style.background = '#FFEBEE';
        alertBox.style.color = '#C62828';
        alertBox.style.border = '1px solid #EF9A9A';
        alertBox.innerHTML = '<i class="fas fa-exclamation-circle"></i> Current password does not match!';
      }
      return;
    }

    if (!newInput || newInput.length < 4) {
      if (alertBox) {
        alertBox.style.display = 'block';
        alertBox.style.background = '#FFEBEE';
        alertBox.style.color = '#C62828';
        alertBox.style.border = '1px solid #EF9A9A';
        alertBox.innerHTML = '<i class="fas fa-exclamation-circle"></i> New password must be at least 4 characters!';
      }
      return;
    }

    if (newInput !== confirmInput) {
      if (alertBox) {
        alertBox.style.display = 'block';
        alertBox.style.background = '#FFEBEE';
        alertBox.style.color = '#C62828';
        alertBox.style.border = '1px solid #EF9A9A';
        alertBox.innerHTML = '<i class="fas fa-exclamation-circle"></i> New password and confirmation do not match!';
      }
      return;
    }

    // Save new password
    this.settings.adminPasswordHash = newInput;
    AlankaraDB.saveSettings(this.settings);

    this.closeModal('adminPasswordModal');
    this.showToast(`ðŸ” Admin password updated to "${newInput}" successfully!`, 'success');
  },

  // 2. VIEW SWITCHING & RENDERING
  switchTab: function(tabName) {
    this.activeTab = tabName;
    document.querySelectorAll('.sidebar-menu a').forEach(a => a.classList.remove('active'));
    document.querySelectorAll('.admin-tab-panel').forEach(p => p.classList.remove('active'));

    const activeLink = document.querySelector(`.sidebar-menu a[data-tab="${tabName}"]`);
    const activePanel = document.getElementById(`panel-${tabName}`);

    if (activeLink) activeLink.classList.add('active');
    if (activePanel) activePanel.classList.add('active');

    const pageTitle = document.getElementById('adminPageTitle');
    if (pageTitle) {
      const titles = {
        dashboard: '<i class="fas fa-tachometer-alt"></i> Executive Dashboard',
        orders: '<i class="fas fa-receipt"></i> Orders & UPI Payment Reconciliation',
        products: '<i class="fas fa-gem"></i> Jewellery Catalog & Designs',
        inventory: '<i class="fas fa-boxes"></i> Vault Stock & Inventory Management',
        customize: '<i class="fas fa-sliders-h"></i> Storefront Customization & Live Metal Rates',
        reports: '<i class="fas fa-file-invoice-dollar"></i> Reports & Data Exports'
      };
      pageTitle.innerHTML = titles[tabName] || 'Dashboard';
    }

    // Close mobile sidebar if open
    this.toggleSidebar(false);

    this.renderCurrentView();
  },

 renderCurrentView: async function() {
    await this.loadData();
    switch (this.activeTab) {
      case 'dashboard': this.renderDashboard(); break;
      case 'orders': this.renderOrders(); break;
      case 'products': this.renderProducts(); break;
      case 'inventory': this.renderInventory(); break;
      case 'customize': this.renderCustomization(); break;
      case 'reports': this.renderReports(); break;
    }
  },

  // 3. DASHBOARD METRICS & RECENT ORDERS
  renderDashboard: function() {
    const totalRev = this.orders
      .filter(o => o.paymentStatus === 'Paid / Confirmed')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const pendingOrders = this.orders.filter(o => o.paymentStatus === 'Pending Verification').length;
    const lowStock = this.products.filter(p => p.stock <= 3).length;

    const elRev = document.getElementById('dashMetricRevenue');
    const elOrders = document.getElementById('dashMetricOrders');
    const elPending = document.getElementById('dashMetricPending');
    const elLowStock = document.getElementById('dashMetricLowStock');

    if (elRev) elRev.textContent = AlankaraDB.formatINR(totalRev);
    if (elOrders) elOrders.textContent = this.orders.length;
    if (elPending) elPending.textContent = pendingOrders;
    if (elLowStock) elLowStock.textContent = `${lowStock} items`;

    // Render Recent 5 Orders Table
    const tbody = document.getElementById('dashRecentOrdersTable');
    if (!tbody) return;

    const recent = this.orders.slice(0, 5);
    if (recent.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--admin-text-muted);">No orders placed yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = recent.map(o => {
      const isPending = o.paymentStatus === 'Pending Verification';
      return `
        <tr>
          <td><strong style="font-family: var(--admin-font-serif);">${o.orderId}</strong></td>
          <td>${o.customer.name}<br><small style="color: var(--admin-text-muted);">${o.customer.phone}</small></td>
          <td><strong>${AlankaraDB.formatINR(o.totalAmount)}</strong></td>
          <td><span style="font-family: monospace; font-size: 0.85rem;">${o.upiRef || 'Awaiting'}</span></td>
          <td>
            <span class="badge-status ${isPending ? 'status-pending' : 'status-verified'}">
              ${o.paymentStatus}
            </span>
          </td>
          <td>
            ${isPending ? `
              <button class="btn-action-sm btn-verify-payment" onclick="AlankaraAdmin.confirmPayment('${o.orderId}')">
                <i class="fas fa-check"></i> Confirm Payment
              </button>
            ` : ''}
            <button class="btn-action-sm btn-edit-action" onclick="AlankaraAdmin.viewInvoice('${o.orderId}')">
              <i class="fas fa-file-invoice"></i> Invoice
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  // 4. ORDERS & PAYMENT VERIFICATION ("conform the payments, from customer")
  renderOrders: function() {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    let filtered = this.orders;
    if (this.orderFilter !== 'all') {
      if (this.orderFilter === 'pending') {
        filtered = this.orders.filter(o => o.paymentStatus === 'Pending Verification');
      } else if (this.orderFilter === 'verified') {
        filtered = this.orders.filter(o => o.paymentStatus === 'Paid / Confirmed');
      } else if (this.orderFilter === 'shipped') {
        filtered = this.orders.filter(o => o.orderStatus === 'Shipped');
      } else if (this.orderFilter === 'delivered') {
        filtered = this.orders.filter(o => o.orderStatus === 'Delivered');
      }
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 2rem;">No orders found in this filter category.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(o => {
      const isPending = o.paymentStatus === 'Pending Verification';
      const isShipped = o.orderStatus === 'Shipped';
      const isDelivered = o.orderStatus === 'Delivered';

      return `
        <tr>
          <td>
            <strong style="font-family: var(--admin-font-serif); font-size: 1rem; color: #120B08;">${o.orderId}</strong>
            <br><small style="color: var(--admin-text-muted);">${new Date(o.date).toLocaleDateString('en-IN')}</small>
          </td>
          <td>
            <strong>${o.customer.name}</strong><br>
            <a href="https://wa.me/${o.customer.phone.replace(/\D/g, '')}" target="_blank" style="color: #0F6B4C; font-size: 0.85rem; font-weight: 600;">
              <i class="fab fa-whatsapp"></i> ${o.customer.phone}
            </a><br>
            <small style="color: var(--admin-text-muted);">${o.customer.city || ''}</small>
          </td>
          <td>
            <div style="font-size: 0.85rem;">
              ${o.items.map(i => `${i.title} (x${i.quantity})`).join('<br>')}
            </div>
          </td>
          <td>
            <strong style="font-size: 1.05rem;">${AlankaraDB.formatINR(o.totalAmount)}</strong>
            <br><small style="color: #666;">${o.paymentMethod}</small>
          </td>
          <td>
            <span style="font-family: monospace; font-weight: 700; color: #1A73E8; background: #E8F0FE; padding: 2px 6px; border-radius: 4px; font-size: 0.85rem;">
              ${o.upiRef || 'No UTR'}
            </span>
          </td>
          <td>
            <span class="badge-status ${isPending ? 'status-pending' : 'status-verified'}">
              <i class="fas ${isPending ? 'fa-clock' : 'fa-check-circle'}"></i>
              ${o.paymentStatus}
            </span>
          </td>
          <td>
            <select class="form-select" style="font-size: 0.8rem; padding: 0.3rem 0.5rem;" onchange="AlankaraAdmin.updateOrderStatus('${o.orderId}', this.value)">
              <option value="Payment Pending" ${o.orderStatus === 'Payment Pending' ? 'selected' : ''}>Payment Pending</option>
              <option value="Confirmed" ${o.orderStatus === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
              <option value="Processing" ${o.orderStatus === 'Processing' ? 'selected' : ''}>Processing</option>
              <option value="Shipped" ${o.orderStatus === 'Shipped' ? 'selected' : ''}>Shipped</option>
              <option value="Delivered" ${o.orderStatus === 'Delivered' ? 'selected' : ''}>Delivered</option>
              <option value="Cancelled" ${o.orderStatus === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </td>
          <td>
            <div style="display: flex; flex-direction: column; gap: 0.3rem;">
              ${isPending ? `
                <button class="btn-action-sm btn-verify-payment" onclick="AlankaraAdmin.confirmPayment('${o.orderId}')">
                  <i class="fas fa-check-circle"></i> Confirm Payment
                </button>
              ` : `
                <button class="btn-action-sm" style="background: #E8F5E9; color: #2E7D32;" onclick="AlankaraAdmin.sendWhatsAppConfirmationSlip('${o.orderId}')">
                  <i class="fab fa-whatsapp"></i> Send Slip
                </button>
              `}
              <button class="btn-action-sm btn-edit-action" onclick="AlankaraAdmin.viewInvoice('${o.orderId}')">
                <i class="fas fa-print"></i> Tax Invoice
              </button>
              <button class="btn-action-sm" style="background: #E3F2FD; color: #1565C0;" onclick="AlankaraAdmin.editDispatchInfo('${o.orderId}')">
                <i class="fas fa-truck"></i> Courier / AWB
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  // Confirm Payment Action
  confirmPayment: function(orderId) {
    const o = AlankaraDB.getOrderById(orderId);
    if (!o) return;

    if (confirm(`Confirm UPI (GPay) payment of ${AlankaraDB.formatINR(o.totalAmount)} from ${o.customer.name} (UTR: ${o.upiRef || 'N/A'})?`)) {
      AlankaraDB.updateOrder(orderId, {
        paymentStatus: 'Paid / Confirmed',
        orderStatus: o.orderStatus === 'Payment Pending' ? 'Confirmed' : o.orderStatus,
        notes: `Payment confirmed by Admin on ${new Date().toLocaleString('en-IN')}`
      });

      this.renderOrders();
      this.renderDashboard();
      this.showToast(`âœ… Payment for ${orderId} has been Confirmed!`, 'success');

      // Prompt to message customer via WhatsApp
      if (confirm(`Would you like to send an instant WhatsApp Payment Confirmation to ${o.customer.name}?`)) {
        this.sendWhatsAppConfirmationSlip(orderId);
      }
    }
  },

  // WhatsApp Notification from Admin to Customer
  sendWhatsAppConfirmationSlip: function(orderId) {
    const o = AlankaraDB.getOrderById(orderId);
    if (!o) return;

    const phoneClean = o.customer.phone.replace(/\D/g, '');
    const text = 
`ðŸ‘‘ *ALANKARA JEWELLERS - PAYMENT VERIFIED & ORDER CONFIRMED* ðŸ‘‘
--------------------------------------------------
Dear ${o.customer.name},
Namaste! We are pleased to inform you that your UPI payment has been *VERIFIED & CONFIRMED*.

*Order ID:* ${o.orderId}
*Total Paid:* ${AlankaraDB.formatINR(o.totalAmount)}
*Payment Status:* Paid / Confirmed (UPI GPay)
*UTR Reference:* ${o.upiRef || 'Verified'}

Your precious jewellery is currently undergoing final BIS Hallmarking verification and being sealed into an insured velvet security vault box.

You can track your live shipment anytime on our website using your Order ID: *${o.orderId}*.

Warm Regards,
Vault Management Team
*ALANKARA JEWELLERS*`;

    window.open(`https://wa.me/${phoneClean}?text=${encodeURIComponent(text)}`, '_blank');
  },

  // Update Status
  updateOrderStatus: function(orderId, newStatus) {
    AlankaraDB.updateOrder(orderId, { orderStatus: newStatus });
    this.showToast(`Updated ${orderId} status to "${newStatus}"`, 'info');
  },

  // Edit Courier & AWB
  editDispatchInfo: function(orderId) {
    const o = AlankaraDB.getOrderById(orderId);
    if (!o) return;

    const courier = prompt("Enter Courier Name (e.g., Blue Dart Insured, BVC Logistics):", o.courierName || 'Blue Dart Insured Vault');
    if (courier === null) return;
    const awb = prompt("Enter Courier Tracking / AWB Number:", o.trackingNumber || '');
    if (awb === null) return;

    AlankaraDB.updateOrder(orderId, {
      courierName: courier,
      trackingNumber: awb,
      orderStatus: 'Shipped'
    });

    this.renderOrders();
    this.showToast(`ðŸ“¦ Dispatch info saved! Marked order ${orderId} as Shipped.`, 'success');
  },

  // 5. JEWELLERY DESIGNS & CATALOG CRUD ("add designs")
  renderProducts: function() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    if (this.products.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 2rem;">No products found in catalog.</td></tr>`;
      return;
    }

    tbody.innerHTML = this.products.map(p => {
      const fallback = JewelVisuals.getFallbackImage(p.category, p.title, p.purity);
      return `
        <tr>
          <td>
            <img src="${p.image}" alt="${p.title}" class="table-img-thumb"
                 onerror="this.onerror=null; this.src='${fallback}';">
          </td>
          <td>
            <strong style="color: #120B08;">${p.title}</strong><br>
            <small style="color: #8A6208; font-weight: 600;">ID: ${p.id}</small>
          </td>
          <td>
            <span style="text-transform: capitalize; font-weight: 600;">${p.category}</span><br>
            <small style="color: var(--admin-ruby); font-weight: 700;">${p.festival || 'General'}</small>
          </td>
          <td>
            <span style="font-weight: 700; color: #0F6B4C;">${p.purity}</span><br>
            <small>Wt: ${p.grossWeight || 'N/A'}</small>
          </td>
          <td>
            <strong style="font-size: 1rem;">${AlankaraDB.formatINR(p.offerPrice)}</strong>
            ${p.price > p.offerPrice ? `<br><small style="text-decoration: line-through; color: #888;">${AlankaraDB.formatINR(p.price)}</small>` : ''}
          </td>
          <td>
            <span style="font-weight: 700; color: ${p.stock <= 3 ? 'var(--admin-ruby)' : 'var(--admin-emerald)'};">
              ${p.stock} units
            </span>
          </td>
          <td>
            ${p.isFestiveSpecial ? '<span class="badge-status status-verified" style="font-size: 0.7rem;">Festive</span>' : ''}
            ${p.isBestseller ? '<span class="badge-status status-shipped" style="font-size: 0.7rem;">Bestseller</span>' : ''}
          </td>
          <td>
            <button class="btn-action-sm btn-edit-action" onclick="AlankaraAdmin.openProductModal('${p.id}')">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn-action-sm btn-delete-action" onclick="AlankaraAdmin.deleteProduct('${p.id}')">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  openProductModal: function(productId = null) {
    this.editingProductId = productId;
    const modal = document.getElementById('productFormModal');
    const titleEl = document.getElementById('productFormTitle');
    if (!modal) return;

    if (productId) {
      const p = AlankaraDB.getProductById(productId);
      if (!p) return;
      if (titleEl) titleEl.textContent = 'Edit Jewellery Design';
      document.getElementById('prodId').value = p.id;
      document.getElementById('prodTitle').value = p.title;
      document.getElementById('prodCategory').value = p.category;
      document.getElementById('prodFestival').value = p.festival || 'none';
      document.getElementById('prodPurity').value = p.purity;
      document.getElementById('prodGrossWeight').value = p.grossWeight || '';
      document.getElementById('prodNetWeight').value = p.netWeight || '';
      document.getElementById('prodPrice').value = p.price;
      document.getElementById('prodOfferPrice').value = p.offerPrice;
      document.getElementById('prodStock').value = p.stock;
      document.getElementById('prodImage').value = p.image;
      document.getElementById('prodDescription').value = p.description || '';
      document.getElementById('prodDimensions').value = p.dimensions || '';
      document.getElementById('prodIsFestive').checked = !!p.isFestiveSpecial;
      document.getElementById('prodIsBestseller').checked = !!p.isBestseller;
    } else {
      if (titleEl) titleEl.textContent = 'Add New Jewellery Design';
      document.getElementById('prodId').value = 'AL-' + Math.floor(100 + Math.random() * 900);
      document.getElementById('prodTitle').value = '';
      document.getElementById('prodCategory').value = 'necklaces';
      document.getElementById('prodFestival').value = 'diwali';
      document.getElementById('prodPurity').value = '22K Gold (916)';
      document.getElementById('prodGrossWeight').value = '25.00 g';
      document.getElementById('prodNetWeight').value = '24.50 g';
      document.getElementById('prodPrice').value = 180000;
      document.getElementById('prodOfferPrice').value = 162000;
      document.getElementById('prodStock').value = 5;
      document.getElementById('prodImage').value = '';
      document.getElementById('prodDescription').value = '';
      document.getElementById('prodDimensions').value = '';
      document.getElementById('prodIsFestive').checked = true;
      document.getElementById('prodIsBestseller').checked = false;
    }

    modal.classList.add('open');
  },

  saveProductForm: function() {
    const id = document.getElementById('prodId').value.trim();
    const title = document.getElementById('prodTitle').value.trim();
    const category = document.getElementById('prodCategory').value;
    const festival = document.getElementById('prodFestival').value;
    const purity = document.getElementById('prodPurity').value;
    const grossWeight = document.getElementById('prodGrossWeight').value.trim();
    const netWeight = document.getElementById('prodNetWeight').value.trim();
    const price = Number(document.getElementById('prodPrice').value) || 0;
    const offerPrice = Number(document.getElementById('prodOfferPrice').value) || price;
    const stock = Number(document.getElementById('prodStock').value) || 0;
    let image = document.getElementById('prodImage').value.trim();
    const description = document.getElementById('prodDescription').value.trim();
    const dimensions = document.getElementById('prodDimensions').value.trim();
    const isFestiveSpecial = document.getElementById('prodIsFestive').checked;
    const isBestseller = document.getElementById('prodIsBestseller').checked;

    if (!title) {
      this.showToast('Please enter a jewellery design title!', 'error');
      return;
    }

    if (!image) {
      // Use fallback SVG
      image = JewelVisuals.getFallbackImage(category, title, purity);
    }

    const discount = price > offerPrice ? Math.round(((price - offerPrice) / price) * 100) : 0;

    const newProduct = {
      id: id,
      title: title,
      category: category,
      festival: festival,
      purity: purity,
      grossWeight: grossWeight,
      netWeight: netWeight,
      price: price,
      offerPrice: offerPrice,
      discount: discount,
      stock: stock,
      image: image,
      description: description,
      dimensions: dimensions,
      isFestiveSpecial: isFestiveSpecial,
      isBestseller: isBestseller,
      isOffer: discount > 0,
      certification: purity.includes('925') ? '925 Sterling Silver' : (purity.includes('Diamond') ? 'IGI Certified Diamond' : 'BIS 916 Hallmarked Gold')
    };

    let prods = AlankaraDB.getProducts();
    if (this.editingProductId) {
      const idx = prods.findIndex(p => p.id === this.editingProductId);
      if (idx !== -1) prods[idx] = newProduct;
    } else {
      prods.unshift(newProduct);
    }

    AlankaraDB.saveProducts(prods);
    this.products = prods;
    this.closeModal('productFormModal');
    this.renderProducts();
    this.renderInventory();
    this.showToast(`âœ¨ Jewellery design "${title}" saved successfully!`, 'success');
  },

  deleteProduct: function(productId) {
    if (confirm(`Are you sure you want to delete design "${productId}" from catalog?`)) {
      let prods = AlankaraDB.getProducts().filter(p => p.id !== productId);
      AlankaraDB.saveProducts(prods);
      this.products = prods;
      this.renderProducts();
      this.renderInventory();
      this.showToast(`Design ${productId} removed from catalog.`, 'info');
    }
  },

  // 6. INVENTORY MANAGEMENT ("inventory management")
  renderInventory: function() {
    const tbody = document.getElementById('inventoryTableBody');
    if (!tbody) return;

    tbody.innerHTML = this.products.map(p => {
      const isLow = p.stock <= 3;
      const isOut = p.stock <= 0;
      return `
        <tr>
          <td><strong style="color: #120B08;">${p.title}</strong></td>
          <td><span style="font-weight: 600;">${p.purity}</span></td>
          <td>${p.grossWeight || 'N/A'}</td>
          <td>
            <strong style="font-size: 1.1rem; color: ${isOut ? 'var(--admin-ruby)' : (isLow ? '#E65100' : 'var(--admin-emerald)')};">
              ${p.stock}
            </strong>
          </td>
          <td>
            <span class="badge-status ${isOut ? 'status-cancelled' : (isLow ? 'status-pending' : 'status-verified')}">
              ${isOut ? 'Out of Stock' : (isLow ? 'Low Vault Stock' : 'Optimal')}
            </span>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <button class="btn-action-sm btn-edit-action" onclick="AlankaraAdmin.adjustStock('${p.id}', -1)">-1</button>
              <button class="btn-action-sm btn-edit-action" onclick="AlankaraAdmin.adjustStock('${p.id}', 1)">+1</button>
              <button class="btn-action-sm btn-action-sm" style="background: #E8F5E9; color: #2E7D32;" onclick="AlankaraAdmin.adjustStock('${p.id}', 5)">+5</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  adjustStock: function(productId, delta) {
    let prods = AlankaraDB.getProducts();
    const p = prods.find(item => item.id === productId);
    if (p) {
      p.stock = Math.max(0, p.stock + delta);
      AlankaraDB.saveProducts(prods);
      this.products = prods;
      this.renderInventory();
      this.showToast(`Updated stock for ${p.title}: ${p.stock} units`, 'info');
    }
  },

  // 7. WEBSITE CUSTOMIZATION ("customize the website")
  renderCustomization: function() {
    const s = this.settings;
    document.getElementById('settStoreName').value = s.storeName || 'ALANKARA';
    document.getElementById('settStoreTagline').value = s.storeTagline || '';
    document.getElementById('settWhatsapp').value = s.whatsappNumber || '';
    document.getElementById('settPhone').value = s.contactPhone || '';
    document.getElementById('settEmail').value = s.contactEmail || '';
    document.getElementById('settAddress').value = s.storeAddress || '';
    document.getElementById('settUpiId').value = s.upiId || 'maheshmaakgardens@okhdfcbank';
    document.getElementById('settMerchantName').value = s.merchantName || 'ALANKARA JEWELLERS';
    document.getElementById('settGold22').value = s.gold22kRate || 7150;
    document.getElementById('settGold24').value = s.gold24kRate || 7800;
    document.getElementById('settSilver').value = s.silverRate || 92;
    document.getElementById('settAnnouncement').value = s.announcement || '';
    document.getElementById('settBannerTitle').value = s.festivalBanner?.title || '';
    document.getElementById('settBannerSub').value = s.festivalBanner?.subtitle || '';
    document.getElementById('settBannerCode').value = s.festivalBanner?.code || '';
  },

  saveCustomization: function() {
    const updated = {
      ...this.settings,
      storeName: document.getElementById('settStoreName').value.trim(),
      storeTagline: document.getElementById('settStoreTagline').value.trim(),
      whatsappNumber: document.getElementById('settWhatsapp').value.trim().replace(/\D/g, ''),
      contactPhone: document.getElementById('settPhone').value.trim(),
      contactEmail: document.getElementById('settEmail').value.trim(),
      storeAddress: document.getElementById('settAddress').value.trim(),
      upiId: document.getElementById('settUpiId').value.trim(),
      merchantName: document.getElementById('settMerchantName').value.trim(),
      gold22kRate: Number(document.getElementById('settGold22').value) || 7150,
      gold24kRate: Number(document.getElementById('settGold24').value) || 7800,
      silverRate: Number(document.getElementById('settSilver').value) || 92,
      announcement: document.getElementById('settAnnouncement').value.trim(),
      festivalBanner: {
        title: document.getElementById('settBannerTitle').value.trim(),
        subtitle: document.getElementById('settBannerSub').value.trim(),
        code: document.getElementById('settBannerCode').value.trim(),
        discountPercent: 20
      }
    };

    // Password change check
    const newPass = document.getElementById('settNewPassword').value.trim();
    if (newPass) {
      updated.adminPasswordHash = newPass;
      document.getElementById('settNewPassword').value = '';
    }

    AlankaraDB.saveSettings(updated);
    this.settings = updated;
    this.showToast('âœ… Storefront settings, Live Metal Rates & UPI Config updated!', 'success');
  },

  // 8. REPORTS & EXPORTS ("take report (downloaded format)")
  renderReports: function() {
    const totalOrders = this.orders.length;
    const totalSales = this.orders.filter(o => o.paymentStatus === 'Paid / Confirmed').reduce((s, o) => s + o.totalAmount, 0);
    const totalItemsStocked = this.products.reduce((s, p) => s + p.stock, 0);

    const elSales = document.getElementById('reportTotalSales');
    const elOrders = document.getElementById('reportTotalOrders');
    const elStock = document.getElementById('reportTotalStock');

    if (elSales) elSales.textContent = AlankaraDB.formatINR(totalSales);
    if (elOrders) elOrders.textContent = totalOrders;
    if (elStock) elStock.textContent = `${totalItemsStocked} Pieces`;
  },

  // Download Orders Report CSV
  downloadOrdersCSV: function() {
    const headers = [
      'Order ID',
      'Date',
      'Customer Name',
      'Customer Phone',
      'Customer Email',
      'Delivery Address',
      'City',
      'Pincode',
      'Items Ordered',
      'Subtotal (INR)',
      'Discount Code',
      'Discount (INR)',
      'Total Amount Paid (INR)',
      'Payment Method',
      'UPI ID Paid To',
      'UPI Reference UTR',
      'Payment Verification Status',
      'Order Fulfillment Status',
      'Courier Name',
      'Courier Tracking Number',
      'Notes'
    ];

    const rows = this.orders.map(o => {
      const itemsStr = o.items.map(i => `${i.title} (${i.purity}) x${i.quantity}`).join(' | ');
      return [
        o.orderId,
        new Date(o.date).toLocaleDateString('en-IN'),
        `"${o.customer.name.replace(/"/g, '""')}"`,
        `"${o.customer.phone}"`,
        `"${o.customer.email || ''}"`,
        `"${(o.customer.address || '').replace(/"/g, '""')}"`,
        `"${o.customer.city || ''}"`,
        `"${o.customer.pincode || ''}"`,
        `"${itemsStr.replace(/"/g, '""')}"`,
        o.subtotal,
        `"${o.discountCode || ''}"`,
        o.discountAmount || 0,
        o.totalAmount,
        `"${o.paymentMethod}"`,
        `"${o.upiIdUsed || ''}"`,
        `"${o.upiRef || ''}"`,
        `"${o.paymentStatus}"`,
        `"${o.orderStatus}"`,
        `"${o.courierName || ''}"`,
        `"${o.trackingNumber || ''}"`,
        `"${(o.notes || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ALANKARA_Sales_Orders_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.showToast('ðŸ“¥ Downloaded Sales & Orders CSV Report!', 'success');
  },

  // Download Inventory Valuation CSV
  downloadInventoryCSV: function() {
    const headers = [
      'Product ID',
      'Jewellery Title',
      'Category',
      'Festival Tag',
      'Metal Purity',
      'Gross Weight',
      'Net Weight',
      'Price (INR)',
      'Offer Price (INR)',
      'Stock Quantity',
      'Total Vault Valuation (INR)',
      'Certification'
    ];

    const rows = this.products.map(p => {
      const val = p.offerPrice * p.stock;
      return [
        p.id,
        `"${p.title.replace(/"/g, '""')}"`,
        p.category,
        `"${p.festival || ''}"`,
        `"${p.purity}"`,
        `"${p.grossWeight || ''}"`,
        `"${p.netWeight || ''}"`,
        p.price,
        p.offerPrice,
        p.stock,
        val,
        `"${p.certification || 'BIS Hallmarked'}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ALANKARA_Inventory_Valuation_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.showToast('ðŸ“¥ Downloaded Inventory Valuation CSV Report!', 'success');
  },

  // 9. TAX INVOICE & RECEIPT MODAL (PRINTABLE PDF-READY)
  viewInvoice: function(orderId) {
    const o = AlankaraDB.getOrderById(orderId);
    if (!o) return;

    const modal = document.getElementById('invoiceModal');
    const container = document.getElementById('invoicePrintContainer');
    if (!modal || !container) return;

    const isVerified = o.paymentStatus === 'Paid / Confirmed';

    container.innerHTML = `
      <div class="invoice-print-area">
        <div class="invoice-header">
          <div>
            <div class="invoice-brand">ALANKARA</div>
            <div style="font-size: 0.8rem; letter-spacing: 2px; text-transform: uppercase; color: #8A6208;">
              Divine Heritage • Certified 916 Hallmarked Jewellery
            </div>
            <div style="font-size: 0.8rem; color: #555; margin-top: 0.35rem;">
              ${this.settings.storeAddress}<br>
              Phone: ${this.settings.contactPhone} | Email: ${this.settings.contactEmail}
            </div>
          </div>
          <div style="text-align: right;">
            <h2 style="font-family: var(--admin-font-serif); font-size: 1.5rem; margin-bottom: 0.25rem;">GST TAX INVOICE</h2>
            <div style="font-size: 0.85rem; font-weight: 700;">Invoice No: INV-${o.orderId}</div>
            <div style="font-size: 0.85rem; color: #555;">Date: ${new Date(o.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <div style="font-size: 0.8rem; color: #555;">GSTIN: 29AABCU9603R1ZM</div>
          </div>
        </div>

        <div class="upi-ref-banner">
          <div>
            <i class="fas ${isVerified ? 'fa-check-circle' : 'fa-clock'}" style="color: ${isVerified ? '#2E7D32' : '#E65100'};"></i>
            <strong>Payment Method:</strong> ${o.paymentMethod} • <strong>Status:</strong> ${o.paymentStatus}
          </div>
          <div>
            <strong>UPI UTR Ref:</strong> <span style="font-family: monospace;">${o.upiRef || 'Verified'}</span>
          </div>
        </div>

        <div class="invoice-meta-grid">
          <div>
            <h4 style="font-size: 0.85rem; text-transform: uppercase; color: #888; margin-bottom: 0.35rem;">Billed & Shipped To:</h4>
            <div style="font-size: 1rem; font-weight: 700;">${o.customer.name}</div>
            <div style="font-size: 0.85rem; color: #444; line-height: 1.5;">
              ${o.customer.address}<br>
              ${o.customer.city} - ${o.customer.pincode}<br>
              Mobile: ${o.customer.phone}<br>
              Email: ${o.customer.email || 'N/A'}
            </div>
          </div>

          <div>
            <h4 style="font-size: 0.85rem; text-transform: uppercase; color: #888; margin-bottom: 0.35rem;">Logistics & Courier Details:</h4>
            <div style="font-size: 0.85rem; line-height: 1.5;">
              <strong>Carrier:</strong> ${o.courierName || 'Blue Dart Insured Security Vault'}<br>
              <strong>Tracking / AWB:</strong> ${o.trackingNumber || 'Pending Dispatch'}<br>
              <strong>Insurance:</strong> 100% Comprehensive Transit Vault Cover<br>
              <strong>Hallmark:</strong> Certified BIS 916 / IGI Diamond
            </div>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 1.5rem;">
          <thead>
            <tr style="background: #F7F5EE; border-bottom: 2px solid #D4AF37;">
              <th style="padding: 0.75rem; text-align: left; font-size: 0.8rem;">SN</th>
              <th style="padding: 0.75rem; text-align: left; font-size: 0.8rem;">Description of Ornament</th>
              <th style="padding: 0.75rem; text-align: center; font-size: 0.8rem;">Purity</th>
              <th style="padding: 0.75rem; text-align: center; font-size: 0.8rem;">Qty</th>
              <th style="padding: 0.75rem; text-align: right; font-size: 0.8rem;">Rate (INR)</th>
              <th style="padding: 0.75rem; text-align: right; font-size: 0.8rem;">Amount (INR)</th>
            </tr>
          </thead>
          <tbody>
            ${o.items.map((item, idx) => `
              <tr style="border-bottom: 1px solid #ECE7D8;">
                <td style="padding: 0.75rem; font-size: 0.85rem;">${idx + 1}</td>
                <td style="padding: 0.75rem; font-size: 0.85rem;">
                  <strong>${item.title}</strong>
                  <br><small style="color: #666;">BIS Hallmarked • Serial: ${item.id}</small>
                </td>
                <td style="padding: 0.75rem; text-align: center; font-size: 0.85rem;">${item.purity}</td>
                <td style="padding: 0.75rem; text-align: center; font-size: 0.85rem; font-weight: 700;">${item.quantity}</td>
                <td style="padding: 0.75rem; text-align: right; font-size: 0.85rem;">${AlankaraDB.formatINR(item.price)}</td>
                <td style="padding: 0.75rem; text-align: right; font-size: 0.85rem; font-weight: 700;">${AlankaraDB.formatINR(item.price * item.quantity)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="display: flex; justify-content: flex-end; margin-bottom: 2rem;">
          <div style="width: 320px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.35rem;">
              <span>Subtotal:</span>
              <span>${AlankaraDB.formatINR(o.subtotal)}</span>
            </div>
            ${o.discountAmount > 0 ? `
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #B71C1C; margin-bottom: 0.35rem;">
                <span>Festive Discount (${o.discountCode}):</span>
                <span>- ${AlankaraDB.formatINR(o.discountAmount)}</span>
              </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.35rem;">
              <span>GST (3% on Gold/Jewellery):</span>
              <span>Included</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.35rem;">
              <span>Insured Vault Shipping:</span>
              <span style="color: #0F6B4C;">FREE</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 1.15rem; font-weight: 800; border-top: 2px solid #120B08; padding-top: 0.5rem; margin-top: 0.5rem;">
              <span>Total Paid (INR):</span>
              <span>${AlankaraDB.formatINR(o.totalAmount)}</span>
            </div>
          </div>
        </div>

        <div style="border-top: 1px solid #DDD; padding-top: 1.5rem; display: flex; justify-content: space-between; align-items: flex-end;">
          <div style="font-size: 0.75rem; color: #777; max-width: 440px;">
            * This is a computer-generated tax invoice. All gold jewellery items are BIS 916 hallmarked as per Government of India regulations. 100% lifetime buyback/exchange guarantee as per prevailing store terms.
          </div>
          <div style="text-align: center;">
            <div style="font-family: var(--admin-font-serif); font-weight: 700; color: #8A6208; margin-bottom: 2rem;">ALANKARA VAULT</div>
            <div style="border-top: 1px solid #333; width: 140px; font-size: 0.75rem; font-weight: 700;">Authorized Signatory</div>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('open');
  },

  // Print A5 Invoice via clean popup window (fixes blank page issue)
  printA5Invoice: function() {
    const container = document.getElementById('invoicePrintContainer');
    if (!container) return;

    const invoiceHTML = container.innerHTML;
    const s = this.settings;

    const popup = window.open('', '_blank', 'width=600,height=800,scrollbars=yes');
    if (!popup) {
      this.showToast('⚠️ Popup blocked! Please allow popups for this site and try again.', 'error');
      return;
    }

    popup.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ALANKARA - GST Tax Invoice</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <style>
    @page {
      size: A5 portrait;
      margin: 10mm 12mm;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 0.7rem;
      color: #1A0A00;
      background: #fff;
      width: 148mm;
    }
    .invoice-print-area {
      width: 100%;
      padding: 0;
      background: #fff;
    }
    .invoice-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #D4AF37;
      padding-bottom: 4px;
      margin-bottom: 5px;
    }
    .invoice-brand {
      font-family: Georgia, serif;
      font-size: 1.25rem;
      font-weight: 900;
      letter-spacing: 3px;
      color: #8A6208;
    }
    .invoice-meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 5px;
      margin-bottom: 5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 5px;
      font-size: 0.65rem;
    }
    thead tr {
      background: #F7F5EE;
      border-bottom: 2px solid #D4AF37;
    }
    th, td { padding: 3px 4px; text-align: left; }
    th { font-size: 0.6rem; font-weight: 700; text-transform: uppercase; }
    td { font-size: 0.65rem; border-bottom: 1px solid #ECE7D8; }
    td small { font-size: 0.58rem; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .totals-box {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 5px;
    }
    .totals-inner { width: 185px; }
    .totals-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.65rem;
      margin-bottom: 2px;
    }
    .totals-row.grand {
      font-size: 0.8rem;
      font-weight: 800;
      border-top: 2px solid #120B08;
      padding-top: 3px;
      margin-top: 3px;
    }
    .upi-ref-banner {
      background: #E8F5E9;
      border: 1px solid #A5D6A7;
      padding: 3px 6px;
      border-radius: 3px;
      margin-bottom: 5px;
      display: flex;
      justify-content: space-between;
      font-size: 0.62rem;
    }
    .footer-row {
      border-top: 1px solid #DDD;
      padding-top: 5px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 3px;
    }
    .footer-note {
      font-size: 0.58rem;
      color: #777;
      max-width: 230px;
      line-height: 1.3;
    }
    .signatory-box { text-align: center; }
    .signatory-label {
      font-family: Georgia, serif;
      font-weight: 700;
      color: #8A6208;
      font-size: 0.68rem;
      margin-bottom: 14px;
    }
    .signatory-line {
      border-top: 1px solid #333;
      width: 100px;
      font-size: 0.6rem;
      font-weight: 700;
      padding-top: 2px;
    }
    .discount-row { color: #B71C1C; }
    h4.section-label {
      font-size: 0.6rem;
      text-transform: uppercase;
      color: #888;
      margin-bottom: 2px;
      font-weight: 700;
    }
    .customer-name { font-size: 0.78rem; font-weight: 700; }
    .customer-detail { font-size: 0.65rem; color: #444; line-height: 1.35; }
    /* Override inline styles from admin.js invoice template */
    [style*="font-size: 0.8rem"], [style*="font-size: 0.85rem"],
    [style*="font-size: 1rem"], [style*="font-size: 1.15rem"] {
      font-size: 0.65rem !important;
    }
    [style*="font-size: 1.5rem"] { font-size: 1.1rem !important; }
    [style*="margin-bottom: 2rem"] { margin-bottom: 5px !important; }
    [style*="margin-bottom: 1.5rem"] { margin-bottom: 4px !important; }
    [style*="padding: 0.75rem"] { padding: 3px 4px !important; }
    [style*="gap: 2rem"] { gap: 5px !important; }
    [style*="padding-top: 1.5rem"] { padding-top: 5px !important; }
    [style*="width: 320px"] { width: 185px !important; }
    [style*="margin-bottom: 0.35rem"] { margin-bottom: 2px !important; }
    [style*="padding-top: 0.5rem"] { padding-top: 3px !important; }
    [style*="margin-top: 0.5rem"] { margin-top: 3px !important; }
    [style*="margin-bottom: 0.85rem"] { margin-bottom: 1.25rem !important; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
      * { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  ${invoiceHTML}
  <script>
    // Auto print when loaded
    window.onload = function() {
      setTimeout(function() { window.print(); }, 400);
    };
  <\/script>
</body>
</html>`);
    popup.document.close();
  },

  closeModal: function(modalId) {
    const m = document.getElementById(modalId);
    if (m) m.classList.remove('open');
  },

  showToast: function(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    let container = document.getElementById('adminToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'adminToastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  },

  // 10. EVENTS
  bindEvents: function() {
    // Login form submit
    const authForm = document.getElementById('adminLoginForm');
    if (authForm) {
      authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const u = document.getElementById('adminUsernameInput').value;
        const p = document.getElementById('adminPasswordInput').value;
        this.login(u, p);
      });
    }

    // Sidebar navigation
    document.querySelectorAll('.sidebar-menu a').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = a.dataset.tab;
        if (tab) this.switchTab(tab);
      });
    });

    // Orders Filter dropdown
    const orderFilterSelect = document.getElementById('adminOrderFilterSelect');
    if (orderFilterSelect) {
      orderFilterSelect.addEventListener('change', (e) => {
        this.orderFilter = e.target.value;
        this.renderOrders();
      });
    }

    // Image file upload handler (converts file to base64 DataURL!)
    const fileInput = document.getElementById('prodImageFile');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            document.getElementById('prodImage').value = event.target.result;
            this.showToast('âœ… Image loaded from local computer!', 'success');
          };
          reader.readAsDataURL(file);
        }
      });
    }
    // Modal backdrop click to close
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-backdrop')) {
        e.target.classList.remove('open');
      }
    });

    // Touch swipe gestures for mobile admin sidebar
    let touchStartX = 0;
    let touchEndX = 0;
    document.addEventListener('touchstart', (e) => {
      if (e.changedTouches && e.changedTouches[0]) {
        touchStartX = e.changedTouches[0].screenX;
      }
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      if (e.changedTouches && e.changedTouches[0]) {
        touchEndX = e.changedTouches[0].screenX;
        const deltaX = touchEndX - touchStartX;
        const sidebar = document.getElementById('adminSidebar');
        const isOpen = sidebar && sidebar.classList.contains('open');
        if (deltaX < -45 && isOpen) {
          this.toggleSidebar(false);
        } else if (deltaX > 45 && touchStartX < 40 && !isOpen) {
          if (window.innerWidth <= 1024) {
            this.toggleSidebar(true);
          }
        }
      }
    }, { passive: true });
  }
};

window.AlankaraAdmin = AlankaraAdmin;

