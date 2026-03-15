/**
 * Base CSS injected into the iframe for generated pages.
 * The LLM only generates HTML with these utility classes — no inline CSS needed.
 * This makes generation faster (fewer tokens) and more consistent.
 */
export const PAGE_CSS = `
/* Reset & Base */
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter','Segoe UI',system-ui,-apple-system,sans-serif;color:#1a1a2e;background:#f8f9fa;line-height:1.7;padding:0;margin:0;-webkit-font-smoothing:antialiased}

/* Layout */
.page{max-width:720px;margin:0 auto;padding:24px 20px}
.section{margin-bottom:32px}
.grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.flex-row{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
.flex-col{display:flex;flex-direction:column;gap:12px}
.center{text-align:center}
.gap-sm{gap:8px}
.gap-lg{gap:20px}

/* Hero variants */
.hero{padding:44px 28px;border-radius:20px;margin-bottom:28px;text-align:center;position:relative;overflow:hidden}
.hero h1{font-size:28px;font-weight:800;margin-bottom:10px;line-height:1.2;letter-spacing:-0.02em}
.hero p{font-size:15px;opacity:0.9;max-width:480px;margin:0 auto;line-height:1.6}
.hero-gradient{background:linear-gradient(135deg,var(--c1),var(--c2));color:#fff;box-shadow:0 8px 32px rgba(0,0,0,0.12)}
.hero-light{background:var(--c-light);color:var(--c1);border:1px solid rgba(0,0,0,0.04)}
.hero-dark{background:linear-gradient(135deg,#1a1a2e,#2d2b55);color:#fff;box-shadow:0 8px 32px rgba(0,0,0,0.18)}
.hero-accent{background:var(--c1);color:#fff;box-shadow:0 8px 32px color-mix(in srgb, var(--c1) 30%, transparent)}

/* Typography */
h1{font-size:24px;font-weight:800;margin-bottom:10px;letter-spacing:-0.02em}
h2{font-size:19px;font-weight:700;margin-bottom:12px;color:#1a1a2e;letter-spacing:-0.01em}
h3{font-size:15px;font-weight:600;margin-bottom:6px}
p{font-size:14px;color:#4a4a6a;margin-bottom:6px;line-height:1.7}
.subtitle{font-size:13px;color:#6b7280;font-weight:500;line-height:1.6}
.label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#9ca3af;margin-bottom:8px}
.big-number{font-size:36px;font-weight:800;line-height:1;letter-spacing:-0.03em;color:var(--c1)}
.big-emoji{font-size:40px;margin-bottom:10px;display:block}
.highlight{color:var(--c1);font-weight:700}

/* Cards */
.card{background:#fff;border-radius:16px;padding:20px;border:1px solid #e5e7eb;transition:box-shadow 0.2s ease}
.card:hover{box-shadow:0 4px 16px rgba(0,0,0,0.06)}
.card-accent{background:var(--c-light);border-radius:16px;padding:20px;border:none}
.card-dark{background:linear-gradient(135deg,#1a1a2e,#2d2b55);border-radius:16px;padding:20px;color:#fff}
.card-dark p,.card-dark .subtitle{color:rgba(255,255,255,0.75)}
.card-dark h2,.card-dark h3{color:#fff}
.card-outline{background:transparent;border-radius:16px;padding:20px;border:2px solid var(--c1)}
.card-glass{background:rgba(255,255,255,0.7);backdrop-filter:blur(10px);border-radius:16px;padding:20px;border:1px solid rgba(255,255,255,0.3)}

/* Chips / Tags */
.chip{display:inline-block;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:600;background:var(--c-light);color:var(--c1)}
.chip-white{background:rgba(255,255,255,0.2);color:#fff}
.chip-outline{background:transparent;border:1.5px solid var(--c1);color:var(--c1)}
.chip-sm{padding:3px 10px;font-size:11px}

/* Lists */
.steps{counter-reset:step}
.step{counter-increment:step;padding-left:40px;position:relative;margin-bottom:16px}
.step::before{content:counter(step);position:absolute;left:0;top:0;width:28px;height:28px;border-radius:50%;background:var(--c1);color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;box-shadow:0 2px 8px color-mix(in srgb, var(--c1) 30%, transparent)}
.step h3{margin-bottom:4px}
.step p{margin-bottom:0}
.check-list{padding:0}
.check-list li{padding:8px 0 8px 32px;position:relative;list-style:none;font-size:14px;line-height:1.6}
.check-list li::before{content:"✓";position:absolute;left:0;top:8px;width:22px;height:22px;border-radius:50%;background:var(--c-light);color:var(--c1);font-weight:700;font-size:12px;display:flex;align-items:center;justify-content:center}

/* Divider */
.divider{height:1px;background:#e5e7eb;margin:28px 0}
.divider-accent{height:3px;width:48px;background:linear-gradient(90deg,var(--c1),var(--c2));border-radius:2px;margin:20px 0}
.divider-accent.center{margin-left:auto;margin-right:auto}

/* Footer */
.footer{text-align:center;padding:24px 0;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb;margin-top:24px}

/* Quote */
.quote{border-left:4px solid var(--c1);padding:16px 20px;background:var(--c-light);border-radius:0 12px 12px 0;font-style:italic;color:#4a4a6a;font-size:15px;line-height:1.7;position:relative}
.quote-author{display:block;font-style:normal;font-weight:600;font-size:13px;color:var(--c1);margin-top:8px}

/* Badge / Icon circle */
.icon-circle{width:48px;height:48px;border-radius:50%;background:var(--c-light);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0}
.icon-circle-sm{width:36px;height:36px;font-size:16px}

/* Progress bar */
.progress{height:8px;border-radius:4px;background:#e5e7eb;overflow:hidden}
.progress-fill{height:100%;border-radius:4px;background:linear-gradient(90deg,var(--c1),var(--c2))}

/* Responsive */
@media(max-width:500px){
  .grid-2,.grid-3{grid-template-columns:1fr}
  .hero{padding:32px 18px;border-radius:16px}
  .hero h1{font-size:22px}
  h1{font-size:20px}
  .big-number{font-size:28px}
  .big-emoji{font-size:32px}
  .card,.card-accent,.card-dark,.card-outline,.card-glass{padding:16px}
}

/* Animations */
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
.section{animation:fadeUp 0.5s ease both}
.section:nth-child(2){animation-delay:0.08s}
.section:nth-child(3){animation-delay:0.16s}
.section:nth-child(4){animation-delay:0.24s}
.section:nth-child(5){animation-delay:0.32s}
.section:nth-child(6){animation-delay:0.4s}
.section:nth-child(7){animation-delay:0.48s}
`;
