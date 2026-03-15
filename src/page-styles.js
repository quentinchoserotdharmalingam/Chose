/**
 * Base CSS injected into the iframe for generated pages.
 * The LLM only generates HTML with these utility classes — no inline CSS needed.
 * This makes generation faster (fewer tokens) and more consistent.
 */
export const PAGE_CSS = `
/* Reset & Base */
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',system-ui,-apple-system,sans-serif;color:#1a1a2e;background:#f8f9fa;line-height:1.6;padding:0;margin:0}

/* Layout */
.page{max-width:750px;margin:0 auto;padding:20px 16px}
.section{margin-bottom:28px}
.grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.flex-row{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
.flex-col{display:flex;flex-direction:column;gap:10px}
.center{text-align:center}

/* Hero variants */
.hero{padding:36px 24px;border-radius:16px;margin-bottom:24px;text-align:center}
.hero h1{font-size:26px;font-weight:800;margin-bottom:8px;line-height:1.2}
.hero p{font-size:15px;opacity:0.85;max-width:500px;margin:0 auto}
.hero-gradient{background:linear-gradient(135deg,var(--c1),var(--c2));color:#fff}
.hero-light{background:var(--c-light);color:var(--c1)}
.hero-dark{background:#1a1a2e;color:#fff}
.hero-accent{background:var(--c1);color:#fff}

/* Typography */
h1{font-size:24px;font-weight:800;margin-bottom:8px}
h2{font-size:18px;font-weight:700;margin-bottom:10px;color:#1a1a2e}
h3{font-size:15px;font-weight:600;margin-bottom:6px}
p{font-size:14px;color:#4a4a6a;margin-bottom:6px}
.subtitle{font-size:13px;color:#6b7280;font-weight:500}
.label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#9ca3af;margin-bottom:6px}
.big-number{font-size:32px;font-weight:800;line-height:1}
.big-emoji{font-size:36px;margin-bottom:8px}

/* Cards */
.card{background:#fff;border-radius:14px;padding:18px;border:1px solid #e5e7eb}
.card-accent{background:var(--c-light);border-radius:14px;padding:18px;border:none}
.card-dark{background:#1a1a2e;border-radius:14px;padding:18px;color:#fff}
.card-outline{background:transparent;border-radius:14px;padding:18px;border:2px solid var(--c1)}

/* Chips / Tags */
.chip{display:inline-block;padding:5px 12px;border-radius:20px;font-size:12px;font-weight:600;background:var(--c-light);color:var(--c1)}
.chip-white{background:rgba(255,255,255,0.2);color:#fff}

/* Lists */
.steps{counter-reset:step}
.step{counter-increment:step;padding-left:36px;position:relative;margin-bottom:14px}
.step::before{content:counter(step);position:absolute;left:0;top:0;width:26px;height:26px;border-radius:50%;background:var(--c1);color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700}
.check-list li{padding:6px 0 6px 28px;position:relative;list-style:none;font-size:14px}
.check-list li::before{content:"✓";position:absolute;left:0;color:var(--c1);font-weight:700}

/* Divider */
.divider{height:1px;background:#e5e7eb;margin:24px 0}
.divider-accent{height:3px;width:40px;background:var(--c1);border-radius:2px;margin:16px 0}

/* Footer */
.footer{text-align:center;padding:20px 0;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb;margin-top:20px}

/* Quote */
.quote{border-left:3px solid var(--c1);padding:12px 16px;background:var(--c-light);border-radius:0 10px 10px 0;font-style:italic;color:#4a4a6a}

/* Responsive */
@media(max-width:500px){
  .grid-2,.grid-3{grid-template-columns:1fr}
  .hero{padding:28px 16px}
  .hero h1{font-size:22px}
  h1{font-size:20px}
  .big-number{font-size:26px}
}

/* Animations */
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.section{animation:fadeUp 0.4s ease both}
.section:nth-child(2){animation-delay:0.1s}
.section:nth-child(3){animation-delay:0.2s}
.section:nth-child(4){animation-delay:0.3s}
.section:nth-child(5){animation-delay:0.4s}
`;
