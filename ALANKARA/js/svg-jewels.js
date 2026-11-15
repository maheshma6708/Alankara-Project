/**
 * Luxury Jewellery SVG Fallback & Canvas QR Generator for ALANKARA
 * Supports Antique, Terracotta, Gold, Diamond, and Anti-Tarnish Collections
 */

const JewelVisuals = {
  // Generate high-resolution SVG data URI for jewellery categories
  getFallbackImage: function(category, title, purity) {
    let motif = '';
    const goldGrad = `
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFF3C4" />
          <stop offset="35%" stop-color="#D4AF37" />
          <stop offset="70%" stop-color="#AA771C" />
          <stop offset="100%" stop-color="#5B3E05" />
        </linearGradient>
        <linearGradient id="antiqueGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#E5C158" />
          <stop offset="40%" stop-color="#AA8232" />
          <stop offset="80%" stop-color="#6E4E16" />
          <stop offset="100%" stop-color="#2D1C05" />
        </linearGradient>
        <linearGradient id="terracottaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#F28C4B" />
          <stop offset="40%" stop-color="#C85A17" />
          <stop offset="80%" stop-color="#93360E" />
          <stop offset="100%" stop-color="#541B03" />
        </linearGradient>
        <radialGradient id="rubyGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FF3366" />
          <stop offset="70%" stop-color="#990022" />
          <stop offset="100%" stop-color="#4A000E" />
        </radialGradient>
        <radialGradient id="emeraldGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#00E676" />
          <stop offset="70%" stop-color="#00693E" />
          <stop offset="100%" stop-color="#002D1B" />
        </radialGradient>
        <radialGradient id="diamondShine" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#FFFFFF" />
          <stop offset="40%" stop-color="#DDF5FF" />
          <stop offset="80%" stop-color="#80D8FF" />
          <stop offset="100%" stop-color="#0091EA" />
        </radialGradient>
        <pattern id="luxPattern" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="20" r="1.5" fill="rgba(212,175,55,0.15)"/>
        </pattern>
      </defs>
    `;

    if (category === 'terracotta') {
      motif = `
        <!-- Handcrafted Baked Terracotta Clay Haram & Pendant -->
        <path d="M 130 170 Q 300 290 470 170" fill="none" stroke="url(#terracottaGrad)" stroke-width="20" stroke-linecap="round"/>
        <path d="M 160 190 Q 300 320 440 190" fill="none" stroke="#F28C4B" stroke-width="6" stroke-dasharray="10 8"/>
        <!-- Handpainted Terracotta Medallion -->
        <circle cx="300" cy="310" r="55" fill="url(#terracottaGrad)" stroke="#FFD54F" stroke-width="4"/>
        <circle cx="300" cy="310" r="38" fill="#541B03"/>
        <circle cx="300" cy="310" r="22" fill="#C85A17" stroke="#FFF" stroke-width="2"/>
        <!-- Folk Peacock Motif in Clay -->
        <path d="M 285 310 Q 300 290 315 310 Q 300 330 285 310 Z" fill="#00E676"/>
        <circle cx="300" cy="310" r="4" fill="#FFD700"/>
        <!-- Terracotta Clay Droplets -->
        <circle cx="300" cy="390" r="14" fill="url(#terracottaGrad)" stroke="#FFD54F" stroke-width="2"/>
        <circle cx="260" cy="375" r="10" fill="url(#terracottaGrad)"/>
        <circle cx="340" cy="375" r="10" fill="url(#terracottaGrad)"/>
        <circle cx="225" cy="345" r="8" fill="#F28C4B"/>
        <circle cx="375" cy="345" r="8" fill="#F28C4B"/>
      `;
    } else if (category === 'antique') {
      motif = `
        <!-- Antique Temple Nakshi Matte Gold Necklace -->
        <path d="M 120 175 Q 300 310 480 175" fill="none" stroke="url(#antiqueGoldGrad)" stroke-width="26" stroke-linecap="round"/>
        <path d="M 140 195 Q 300 340 460 195" fill="none" stroke="#2D1C05" stroke-width="4"/>
        <!-- Antique Lakshmi / Deity Medallion -->
        <circle cx="300" cy="340" r="42" fill="url(#antiqueGoldGrad)" stroke="#1A1110" stroke-width="4"/>
        <text x="300" y="348" font-family="'Cinzel', serif" font-size="24" font-weight="bold" fill="#2D1C05" text-anchor="middle">श्री</text>
        <!-- Antique Cabochon Rubies & Seed Pearls -->
        <circle cx="240" cy="315" r="14" fill="url(#rubyGlow)" stroke="#AA8232" stroke-width="2"/>
        <circle cx="360" cy="315" r="14" fill="url(#rubyGlow)" stroke="#AA8232" stroke-width="2"/>
        <circle cx="190" cy="285" r="12" fill="url(#emeraldGlow)"/>
        <circle cx="410" cy="285" r="12" fill="url(#emeraldGlow)"/>
        <circle cx="300" cy="400" r="10" fill="#FFFBE6" stroke="#6E4E16" stroke-width="2"/>
        <circle cx="240" cy="345" r="7" fill="#FFFBE6"/>
        <circle cx="360" cy="345" r="7" fill="#FFFBE6"/>
      `;
    } else if (category === 'anti_tarnish') {
      motif = `
        <!-- Anti-Tarnish Waterproof 18K Chain & Clover -->
        <path d="M 140 170 Q 300 310 460 170" fill="none" stroke="url(#goldGrad)" stroke-width="12" stroke-linecap="round"/>
        <!-- Onyx Clover Centerpiece -->
        <g transform="translate(300, 290)">
          <path d="M 0,-24 A 12,12 0 0,1 24,0 A 12,12 0 0,1 0,24 A 12,12 0 0,1 -24,0 A 12,12 0 0,1 0,-24 Z" fill="#1A1110" stroke="url(#goldGrad)" stroke-width="3"/>
          <circle cx="0" cy="0" r="4" fill="url(#goldGrad)"/>
        </g>
        <!-- Waterproof Moisture Shield Glow -->
        <circle cx="220" cy="240" r="7" fill="url(#diamondShine)"/>
        <circle cx="380" cy="240" r="7" fill="url(#diamondShine)"/>
        <text x="300" y="365" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#80D8FF" text-anchor="middle" letter-spacing="1">WATERPROOF • SWEATPROOF</text>
      `;
    } else if (category === 'necklaces' || category === 'bridal') {
      motif = `
        <!-- Royal Choker / Necklace Arc -->
        <path d="M 120 180 Q 300 320 480 180" fill="none" stroke="url(#goldGrad)" stroke-width="24" stroke-linecap="round"/>
        <path d="M 140 195 Q 300 350 460 195" fill="none" stroke="url(#goldGrad)" stroke-width="12"/>
        <!-- Ruby & Pearl droplets -->
        <circle cx="300" cy="370" r="22" fill="url(#rubyGlow)" stroke="#FFF" stroke-width="3"/>
        <circle cx="240" cy="350" r="16" fill="url(#emeraldGlow)"/>
        <circle cx="360" cy="350" r="16" fill="url(#emeraldGlow)"/>
        <circle cx="190" cy="315" r="14" fill="url(#rubyGlow)"/>
        <circle cx="410" cy="315" r="14" fill="url(#rubyGlow)"/>
        <circle cx="300" cy="405" r="9" fill="#FFFBE6" stroke="#AA771C" stroke-width="2"/>
        <circle cx="240" cy="380" r="7" fill="#FFFBE6"/>
        <circle cx="360" cy="380" r="7" fill="#FFFBE6"/>
      `;
    } else if (category === 'earrings') {
      motif = `
        <!-- Twin Royal Jhumkas -->
        <g transform="translate(180, 160)">
          <circle cx="40" cy="30" r="25" fill="url(#rubyGlow)" stroke="url(#goldGrad)" stroke-width="5"/>
          <path d="M 10 90 Q 40 45 70 90 Z" fill="url(#goldGrad)"/>
          <ellipse cx="40" cy="90" rx="30" ry="8" fill="#AA771C"/>
          <circle cx="20" cy="110" r="6" fill="#FFFBE6"/>
          <circle cx="40" cy="115" r="7" fill="#FFFBE6"/>
          <circle cx="60" cy="110" r="6" fill="#FFFBE6"/>
        </g>
        <g transform="translate(340, 160)">
          <circle cx="40" cy="30" r="25" fill="url(#rubyGlow)" stroke="url(#goldGrad)" stroke-width="5"/>
          <path d="M 10 90 Q 40 45 70 90 Z" fill="url(#goldGrad)"/>
          <ellipse cx="40" cy="90" rx="30" ry="8" fill="#AA771C"/>
          <circle cx="20" cy="110" r="6" fill="#FFFBE6"/>
          <circle cx="40" cy="115" r="7" fill="#FFFBE6"/>
          <circle cx="60" cy="110" r="6" fill="#FFFBE6"/>
        </g>
      `;
    } else if (category === 'bangles') {
      motif = `
        <!-- Luxury Kada / Bangle Duo -->
        <ellipse cx="270" cy="230" rx="130" ry="90" fill="none" stroke="url(#goldGrad)" stroke-width="26" transform="rotate(-15 270 230)"/>
        <ellipse cx="330" cy="270" rx="130" ry="90" fill="none" stroke="url(#goldGrad)" stroke-width="26" transform="rotate(-15 330 270)"/>
        <!-- Embellishments -->
        <circle cx="200" cy="170" r="8" fill="url(#rubyGlow)"/>
        <circle cx="340" cy="200" r="8" fill="url(#emeraldGlow)"/>
        <circle cx="260" cy="310" r="8" fill="url(#rubyGlow)"/>
        <circle cx="400" cy="340" r="8" fill="url(#emeraldGlow)"/>
      `;
    } else if (category === 'rings') {
      motif = `
        <!-- Solitaire Diamond Ring -->
        <circle cx="300" cy="280" r="100" fill="none" stroke="url(#goldGrad)" stroke-width="20"/>
        <!-- Diamond Crown Mount -->
        <polygon points="300,120 345,160 255,160" fill="url(#goldGrad)"/>
        <!-- Diamond Brilliant Gem -->
        <polygon points="260,140 340,140 370,110 300,70 230,110" fill="url(#diamondShine)" stroke="#FFF" stroke-width="3"/>
        <line x1="260" y1="140" x2="300" y2="70" stroke="#FFF" stroke-width="2" opacity="0.8"/>
        <line x1="340" y1="140" x2="300" y2="70" stroke="#FFF" stroke-width="2" opacity="0.8"/>
      `;
    } else {
      // General Gold & Silver / Mangalsutra / Coin
      motif = `
        <circle cx="300" cy="240" r="100" fill="url(#goldGrad)" stroke="#AA771C" stroke-width="8"/>
        <circle cx="300" cy="240" r="80" fill="none" stroke="#FFF3C4" stroke-width="4" stroke-dasharray="8 6"/>
        <text x="300" y="235" font-family="'Cinzel', 'Playfair Display', serif" font-size="28" font-weight="bold" fill="#3E2723" text-anchor="middle">श्री</text>
        <text x="300" y="270" font-family="'Montserrat', sans-serif" font-size="14" font-weight="bold" fill="#3E2723" letter-spacing="2" text-anchor="middle">SHUBH LABH</text>
      `;
    }

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
        ${goldGrad}
        <!-- Rich Royal Background -->
        <rect width="600" height="450" fill="#140E0A"/>
        <rect width="600" height="450" fill="url(#luxPattern)"/>
        
        <!-- Ambient Glow -->
        <circle cx="300" cy="225" r="210" fill="${category === 'terracotta' ? '#C85A17' : '#D4AF37'}" opacity="0.14" filter="blur(40px)"/>
        
        ${motif}
        
        <!-- Brand Watermark and Hallmark Banner -->
        <rect x="30" y="380" width="540" height="44" rx="8" fill="rgba(20,14,10,0.88)" stroke="rgba(212,175,55,0.4)" stroke-width="1.5"/>
        <text x="50" y="408" font-family="'Cinzel', 'Playfair Display', serif" font-size="14" font-weight="700" fill="#D4AF37" letter-spacing="3">ALANKARA</text>
        <text x="550" y="408" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#E0D6B8" text-anchor="end">${purity || 'BIS 916 HALLMARKED'}</text>
      </svg>
    `;

    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  },

  // Generate dynamic QR Code for UPI payment onto an HTML Canvas
  generateUPIQRCode: function(canvasElement, upiId, merchantName, amount, orderId) {
    if (!canvasElement) return;
    const ctx = canvasElement.getContext('2d');
    const width = canvasElement.width || 260;
    const height = canvasElement.height || 260;

    // UPI Deep Link Specification
    const cleanUpi = encodeURIComponent(upiId || 'maheshmaakgardens@okhdfcbank');
    const cleanName = encodeURIComponent(merchantName || 'ALANKARA JEWELLERS');
    const cleanAmt = Number(amount || 0).toFixed(2);
    const cleanNote = encodeURIComponent(`Order ${orderId || 'AL-PAY'}`);
    const upiUri = `upi://pay?pa=${cleanUpi}&pn=${cleanName}&am=${cleanAmt}&tn=${cleanNote}&cu=INR`;

    // Render an ultra-clean UPI QR visual with custom branding
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Outer border
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, width - 12, height - 12);

    // QR finder corners (top-left, top-right, bottom-left)
    const drawFinder = (x, y) => {
      ctx.fillStyle = '#1A1110';
      ctx.fillRect(x, y, 44, 44);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x + 7, y + 7, 30, 30);
      ctx.fillStyle = '#D4AF37';
      ctx.fillRect(x + 13, y + 13, 18, 18);
    };

    drawFinder(20, 20);
    drawFinder(width - 64, 20);
    drawFinder(20, height - 64);

    // Procedural pseudo-random deterministic QR grid based on UPI string
    let seed = 0;
    for (let i = 0; i < upiUri.length; i++) {
      seed = (seed * 31 + upiUri.charCodeAt(i)) & 0xFFFFFFFF;
    }
    
    const cellSize = 7;
    const startX = 20;
    const startY = 20;
    const cols = Math.floor((width - 40) / cellSize);
    const rows = Math.floor((height - 40) / cellSize);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Skip finder areas
        if ((r < 7 && c < 7) || (r < 7 && c > cols - 8) || (r > rows - 8 && c < 7)) continue;
        // Skip center logo space
        if (r >= Math.floor(rows / 2) - 3 && r <= Math.floor(rows / 2) + 3 &&
            c >= Math.floor(cols / 2) - 3 && c <= Math.floor(cols / 2) + 3) continue;

        seed = (seed * 1664525 + 1013904223) & 0xFFFFFFFF;
        if ((seed >>> 16) % 2 === 0) {
          ctx.fillStyle = (c % 3 === 0) ? '#1A1110' : '#2D1B00';
          ctx.fillRect(startX + c * cellSize, startY + r * cellSize, cellSize - 1, cellSize - 1);
        }
      }
    }

    // Center Badge: GPay / UPI shield
    const cx = width / 2;
    const cy = height / 2;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(cx, cy, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Indian Rupee / UPI logo in center
    ctx.fillStyle = '#C5A059';
    ctx.font = 'bold 20px "Cinzel", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('₹', cx, cy - 1);

    return upiUri;
  }
};

window.JewelVisuals = JewelVisuals;
