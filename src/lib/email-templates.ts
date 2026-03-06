// Naija Original — branded HTML email templates

const baseStyle = `
  body { margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Inter', Arial, sans-serif; }
  .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; }
  .header { background: #1a7a3d; padding: 32px 24px; text-align: center; }
  .header h1 { color: #ffffff; font-size: 22px; margin: 0; font-weight: 800; letter-spacing: -0.5px; }
  .header p { color: rgba(255,255,255,0.8); font-size: 13px; margin: 8px 0 0; }
  .body { padding: 32px 24px; }
  .body h2 { color: #141414; font-size: 20px; font-weight: 700; margin: 0 0 8px; }
  .body p { color: #737373; font-size: 14px; line-height: 1.6; margin: 0 0 16px; }
  .btn { display: inline-block; background: #1a7a3d; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 12px; font-weight: 700; font-size: 14px; }
  .footer { background: #141414; padding: 24px; text-align: center; }
  .footer p { color: rgba(255,255,255,0.5); font-size: 12px; margin: 0; }
  .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
  .detail-label { color: #737373; }
  .detail-value { color: #141414; font-weight: 600; }
  .total-row { border-top: 2px solid #141414; padding-top: 12px; margin-top: 8px; }
`;

function wrap(content: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${baseStyle}</style></head><body><div class="container">${content}</div></body></html>`;
}

const header = `<div class="header"><h1>🇳🇬 Naija Original</h1><p>Authentic Nigerian Fashion & Lifestyle</p></div>`;
const footer = `<div class="footer"><p>© ${new Date().getFullYear()} Naija Original. All rights reserved.</p><p style="margin-top:8px"><a href="https://naijaoriginal.lovable.app" style="color:rgba(255,255,255,0.7);text-decoration:none;">naijaoriginal.lovable.app</a></p></div>`;

export function orderConfirmationEmail(data: {
  orderNumber: string;
  customerName: string;
  total: number;
  items: { name: string; quantity: number; price: number }[];
}): string {
  const itemsHtml = data.items
    .map(
      (item) =>
        `<div class="detail-row"><span class="detail-label">${item.name} × ${item.quantity}</span><span class="detail-value">₦${item.price.toLocaleString()}</span></div>`
    )
    .join("");

  return wrap(`
    ${header}
    <div class="body">
      <h2>Order Confirmed! 🎉</h2>
      <p>Hey ${data.customerName || "there"}, your order don land! We dey prepare am for you right now.</p>
      <p style="font-size:13px;color:#1a7a3d;font-weight:600;">Order #${data.orderNumber}</p>
      <div style="margin:20px 0;">
        ${itemsHtml}
        <div class="detail-row total-row">
          <span class="detail-label" style="font-weight:700;color:#141414;">Total</span>
          <span class="detail-value" style="font-size:16px;">₦${data.total.toLocaleString()}</span>
        </div>
      </div>
      <p>Wetin go happen next:</p>
      <p>✅ We go verify your payment<br>📦 We go prepare your order with care<br>🚚 Shipping confirmation go reach your email<br>📱 Scan your QR code when e arrive!</p>
      <div style="text-align:center;margin:24px 0;">
        <a href="https://naijaoriginal.lovable.app/orders" class="btn">View My Orders</a>
      </div>
    </div>
    ${footer}
  `);
}

export function reviewApprovedEmail(data: {
  customerName: string;
  productName: string;
}): string {
  return wrap(`
    ${header}
    <div class="body">
      <h2>Your Review is Live! ⭐</h2>
      <p>Hey ${data.customerName || "there"}, great news! Your review for <strong>"${data.productName}"</strong> don get approved and everybody fit see am now.</p>
      <p>Thank you for sharing your experience with the Naija Original family! 🙌</p>
      <div style="text-align:center;margin:24px 0;">
        <a href="https://naijaoriginal.lovable.app/shop" class="btn">Continue Shopping</a>
      </div>
    </div>
    ${footer}
  `);
}

export function welcomeEmail(data: { customerName: string }): string {
  return wrap(`
    ${header}
    <div class="body">
      <h2>Welcome to the Family! 🇳🇬</h2>
      <p>Hey ${data.customerName || "there"}, you don join the Naija Original movement! We dey happy to have you.</p>
      <p>Naija Original na your go-to for authentic Nigerian fashion and lifestyle products. Every piece dey tell a story of Nigerian culture and creativity.</p>
      <div style="text-align:center;margin:24px 0;">
        <a href="https://naijaoriginal.lovable.app/shop" class="btn">Start Shopping 🔥</a>
      </div>
    </div>
    ${footer}
  `);
}

export function newsletterWelcomeEmail(data: { name?: string }): string {
  return wrap(`
    ${header}
    <div class="body">
      <h2>You're In! 🔥</h2>
      <p>Hey ${data.name || "there"}, welcome to the Naija Original insider list!</p>
      <p>You go be the first to know about:</p>
      <p>🆕 New product drops<br>💰 Exclusive discounts and offers<br>🎨 Culture updates and stories<br>🏷️ Limited edition alerts</p>
      <p>No spam — just the real gist. We promise!</p>
      <div style="text-align:center;margin:24px 0;">
        <a href="https://naijaoriginal.lovable.app/shop" class="btn">Shop Now</a>
      </div>
    </div>
    ${footer}
  `);
}
