const fs = require('fs');

const filePath = 'c:/Users/DEEPAK/saaral/src/components/home/CustomerTransformations.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update interface
const oldInterface = `interface Transformation {
  id: string;
  customer: string;
  location: string;
  duration: string;
  product: string;
  productHref: string;`;

const newInterface = `interface Transformation {
  id: string;
  customer: string;
  location: string;
  duration: string;
  product: string;
  productHref: string;
  product1Label: string;`;

content = content.replace(oldInterface, newInterface);

// 2. Update TRANSFORMATIONS items (with normal line endings support)
const oldChitra = `customer: "Chitra",
    location: "Chennai, Tamil Nadu",
    duration: "6 weeks",
    product: "Skin Whitening Cream + Redwine Face Wash",
    productHref: "/products/saaral-skin-whitening-cream-15g",
    productHref2: "/products/redwine-facewash",
    product2Label: "Redwine Face Wash",`;

const newChitra = `customer: "Chitra",
    location: "Chennai, Tamil Nadu",
    duration: "6 weeks",
    product: "Skin Whitening Cream + Redwine Face Wash",
    productHref: "/products/saaral-skin-whitening-cream-15g",
    product1Label: "Whitening Cream",
    productHref2: "/products/redwine-facewash",
    product2Label: "Redwine Wash",`;

content = content.replace(oldChitra.replace(/\r?\n/g, '\r\n'), newChitra.replace(/\r?\n/g, '\r\n'));
content = content.replace(oldChitra.replace(/\r?\n/g, '\n'), newChitra.replace(/\r?\n/g, '\n'));

const oldKavitha = `customer: "Kavitha",
    location: "Madurai, Tamil Nadu",
    duration: "10 weeks",
    product: "Anti Aging & Pigmentation Cream + Butterfly Pea Face Wash",
    productHref: "/products/saaral-anti-aging-pigmentation-cream-15g",
    productHref2: "/products/butterfly-pea-facewash-sangoo-poo",
    product2Label: "Butterfly Pea Face Wash",`;

const newKavitha = `customer: "Kavitha",
    location: "Madurai, Tamil Nadu",
    duration: "10 weeks",
    product: "Anti Aging & Pigmentation Cream + Butterfly Pea Face Wash",
    productHref: "/products/saaral-anti-aging-pigmentation-cream-15g",
    product1Label: "Anti-Aging Cream",
    productHref2: "/products/butterfly-pea-facewash-sangoo-poo",
    product2Label: "Sangupoo Wash",`;

content = content.replace(oldKavitha.replace(/\r?\n/g, '\r\n'), newKavitha.replace(/\r?\n/g, '\r\n'));
content = content.replace(oldKavitha.replace(/\r?\n/g, '\n'), newKavitha.replace(/\r?\n/g, '\n'));

const oldPrema = `customer: "Prema",
    location: "Thirupathi, Andhra Pradesh",
    duration: "8 weeks",
    product: "Skin Whitening Cream + Anti Aging & Pigmentation Cream",
    productHref: "/products/saaral-skin-whitening-cream-15g",
    productHref2: "/products/saaral-anti-aging-pigmentation-cream-15g",
    product2Label: "Anti Aging Cream",`;

const newPrema = `customer: "Prema",
    location: "Thirupathi, Andhra Pradesh",
    duration: "8 weeks",
    product: "Skin Whitening Cream + Anti Aging & Pigmentation Cream",
    productHref: "/products/saaral-skin-whitening-cream-15g",
    product1Label: "Whitening Cream",
    productHref2: "/products/saaral-anti-aging-pigmentation-cream-15g",
    product2Label: "Anti-Aging Cream",`;

content = content.replace(oldPrema.replace(/\r?\n/g, '\r\n'), newPrema.replace(/\r?\n/g, '\r\n'));
content = content.replace(oldPrema.replace(/\r?\n/g, '\n'), newPrema.replace(/\r?\n/g, '\n'));

// 3. Update the overlay block
const oldOverlay = `          {/* ── Glassmorphism info overlay at the bottom ── */}
          <div
            className="absolute bottom-0 inset-x-0 z-10 pointer-events-none"
            style={{
              background: "linear-gradient(to top, rgba(20,10,6,0.88) 0%, rgba(20,10,6,0.6) 60%, transparent 100%)",
              padding: "32px 16px 14px",
            }}
          >
            {/* Customer name + location */}
            <div className="flex items-end justify-between gap-2 mb-2">
              <div>
                <p
                  className="font-display"
                  style={{ fontSize: "15px", lineHeight: 1.15, letterSpacing: "-0.01em", color: "#fff" }}
                >
                  {item.customer}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "10px",
                    color: "rgba(255,255,255,0.55)",
                    marginTop: "2px",
                    letterSpacing: "0.03em",
                  }}
                >
                  {item.location}
                </p>
              </div>

              {/* Duration badge */}
              <div
                className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "9px",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    color: "rgba(255,255,255,0.8)",
                  }}
                >
                  {item.duration}
                </span>
              </div>
            </div>

            {/* Concerns + CTA row */}
            <div className="flex items-center justify-between gap-2 pointer-events-auto">
              {/* Category tag */}
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "8.5px",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: item.accentColor,
                  background: "rgba(255,255,255,0.92)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.5)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
              >
                {item.tagIcon}
                {item.tagLabel}
              </span>

              {/* Shop buttons — primary + optional secondary product */}
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <Link
                  href={item.productHref}
                  className="group inline-flex items-center gap-1 rounded-full transition-all duration-300 active:scale-95"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "9px",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#fff",
                    background: item.accentColor,
                    padding: "6px 12px",
                    boxShadow: \`0 4px 12px \${item.accentColor}66\`,
                  }}
                >
                  Shop
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 12 12"
                    fill="none"
                    className="group-hover:translate-x-0.5 transition-transform duration-200"
                    aria-hidden="true"
                  >
                    <line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <polyline points="7,3 10,6 7,9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                {item.productHref2 && (
                  <Link
                    href={item.productHref2}
                    className="group inline-flex items-center gap-1 rounded-full transition-all duration-300 active:scale-95"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "9px",
                      fontWeight: 600,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: item.accentColor,
                      background: "rgba(255,255,255,0.92)",
                      border: \`1px solid \${item.accentColor}44\`,
                      padding: "5px 10px",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                    }}
                    aria-label={\`Shop \${item.product2Label}\`}
                  >
                    {item.product2Label}
                  </Link>
                )}
              </div>
            </div>
          </div>`;

const newOverlay = `          {/* ── Glassmorphism info overlay at the bottom ── */}
          <div
            className="absolute bottom-0 inset-x-0 z-10 pointer-events-none"
            style={{
              background: "linear-gradient(to top, rgba(20,10,6,0.92) 0%, rgba(20,10,6,0.65) 60%, transparent 100%)",
              padding: "36px 18px 16px",
            }}
          >
            {/* Customer name + location */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <p
                  className="font-display"
                  style={{ fontSize: "16px", lineHeight: 1.15, letterSpacing: "-0.01em", color: "#fff" }}
                >
                  {item.customer}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "10.5px",
                    color: "rgba(255,255,255,0.55)",
                    marginTop: "2px",
                    letterSpacing: "0.03em",
                  }}
                >
                  {item.location}
                </p>

                {/* Concern Tag - moved here for cleaner and structured layout */}
                <div className="mt-2.5">
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "8px",
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: item.accentColor,
                      background: "rgba(255,255,255,0.92)",
                      border: "1px solid rgba(255,255,255,0.4)",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    {item.tagIcon}
                    {item.tagLabel}
                  </span>
                </div>
              </div>

              {/* Duration badge */}
              <div
                className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  marginTop: "2px",
                }}
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "9px",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    color: "rgba(255,255,255,0.8)",
                  }}
                >
                  {item.duration}
                </span>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex items-center gap-2 pointer-events-auto">
              <Link
                href={item.productHref}
                className="flex-1 group inline-flex items-center justify-center gap-1.5 rounded-full transition-all duration-300 active:scale-95"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "9.5px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#fff",
                  background: item.accentColor,
                  padding: "8px 12px",
                  boxShadow: \`0 4px 12px \${item.accentColor}44\`,
                  textAlign: "center",
                }}
              >
                {item.product1Label}
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 12 12"
                  fill="none"
                  className="group-hover:translate-x-0.5 transition-transform duration-200"
                  aria-hidden="true"
                >
                  <line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <polyline points="7,3 10,6 7,9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              {item.productHref2 && (
                <Link
                  href={item.productHref2}
                  className="flex-1 group inline-flex items-center justify-center gap-1.5 rounded-full transition-all duration-300 active:scale-95"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "9.5px",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: item.accentColor,
                    background: "rgba(255,255,255,0.92)",
                    border: \`1px solid \${item.accentColor}33\`,
                    padding: "8px 12px",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    textAlign: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                  aria-label={\`Shop \${item.product2Label}\`}
                >
                  {item.product2Label}
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 12 12"
                    fill="none"
                    className="group-hover:translate-x-0.5 transition-transform duration-200"
                    aria-hidden="true"
                  >
                    <line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <polyline points="7,3 10,6 7,9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              )}
            </div>
          </div>`;

content = content.replace(oldOverlay.replace(/\r?\n/g, '\r\n'), newOverlay.replace(/\r?\n/g, '\r\n'));
content = content.replace(oldOverlay.replace(/\r?\n/g, '\n'), newOverlay.replace(/\r?\n/g, '\n'));

fs.writeFileSync(filePath, content, 'utf8');
console.log('Update successful!');
