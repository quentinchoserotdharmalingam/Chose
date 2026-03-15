/**
 * Base CSS injected into the iframe for generated pages.
 * The LLM only generates HTML with these utility classes — no inline CSS needed.
 */
export const PAGE_CSS = `
/* Reset & Base */
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter','Segoe UI',system-ui,-apple-system,sans-serif;color:#1e1e2e;background:#f5f5f7;line-height:1.7;padding:0;margin:0;-webkit-font-smoothing:antialiased}

/* Layout */
.page{max-width:720px;margin:0 auto;padding:28px 20px}
.section{margin-bottom:40px}
.grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.flex-row{display:flex;gap:14px;align-items:center;flex-wrap:wrap}
.flex-col{display:flex;flex-direction:column;gap:16px}
.center{text-align:center}
.span-2{grid-column:span 2}

/* ───── HERO ───── */
.hero{padding:48px 28px;border-radius:24px;margin-bottom:8px;text-align:center;position:relative;overflow:hidden}
.hero h1{font-size:28px;font-weight:800;margin-bottom:10px;line-height:1.15;letter-spacing:-0.03em}
.hero p{font-size:15px;opacity:0.9;max-width:440px;margin:0 auto;line-height:1.6}
.hero .chip{margin-top:14px}
.hero-gradient{background:linear-gradient(135deg,var(--c1),var(--c2));color:#fff;box-shadow:0 12px 40px -8px rgba(0,0,0,0.18)}
.hero-light{background:var(--c-light);color:var(--c1)}
.hero-dark{background:linear-gradient(160deg,#0f0f1a 0%,#1a1a3e 50%,#2a1a4e 100%);color:#fff;box-shadow:0 12px 40px -8px rgba(0,0,0,0.25)}
.hero-dark p{color:rgba(255,255,255,0.7)}
.hero-accent{background:var(--c1);color:#fff;box-shadow:0 12px 40px -8px color-mix(in srgb,var(--c1) 40%,transparent)}

/* ───── BANNER (full-width colored section) ───── */
.banner{padding:32px 24px;border-radius:20px}
.banner-gradient{background:linear-gradient(135deg,var(--c1),var(--c2));color:#fff}
.banner-light{background:var(--c-light);color:var(--c1)}
.banner-dark{background:linear-gradient(160deg,#0f0f1a,#1a1a3e);color:#fff}
.banner h2{color:inherit;margin-bottom:8px}
.banner p{color:inherit;opacity:0.85}
.banner-dark p{color:rgba(255,255,255,0.7)}
.banner .chip-group{margin-top:16px}

/* ───── TYPOGRAPHY ───── */
h1{font-size:24px;font-weight:800;margin-bottom:12px;letter-spacing:-0.03em}
h2{font-size:18px;font-weight:700;margin-bottom:16px;color:#1e1e2e;letter-spacing:-0.02em}
h3{font-size:15px;font-weight:600;margin-bottom:6px}
p{font-size:14px;color:#555;margin-bottom:4px;line-height:1.65}
.subtitle{font-size:13px;color:#888;font-weight:500;line-height:1.6}
.label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#aaa;margin-bottom:6px;margin-top:4px}
.big-number{font-size:38px;font-weight:800;line-height:1;letter-spacing:-0.04em;background:linear-gradient(135deg,var(--c1),var(--c2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.big-emoji{font-size:36px;margin-bottom:8px;display:block}
.highlight{color:var(--c1);font-weight:700}
.section-header{display:flex;align-items:center;gap:12px;margin-bottom:20px}
.section-header .icon-circle{flex-shrink:0}
.section-header h2{margin-bottom:0}

/* ───── STAT CARD (chiffre clé) ───── */
.stat{background:#fff;border-radius:16px;padding:24px 16px;text-align:center;border:1px solid #eee;position:relative;overflow:hidden}
.stat::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,var(--c1),var(--c2))}
.stat .big-number{margin-bottom:8px}
.stat .label{margin-top:2px;margin-bottom:0}
.stat-flat{background:var(--c-light);border:none;border-radius:16px;padding:24px 16px;text-align:center;position:relative;overflow:hidden}
.stat-flat::before{display:none}
.stat-flat .big-number{background:none;-webkit-text-fill-color:var(--c1);color:var(--c1)}
.stat-flat .label{margin-top:2px;margin-bottom:0}

/* ───── CARDS ───── */
.card{background:#fff;border-radius:16px;padding:22px;border:1px solid #eee;position:relative}
.card-accent{background:var(--c-light);border-radius:16px;padding:22px;border:none}
.card-dark{background:linear-gradient(160deg,#0f0f1a,#1a1a3e);border-radius:16px;padding:22px;color:#fff}
.card-dark p,.card-dark .subtitle,.card-dark .label{color:rgba(255,255,255,0.65)}
.card-dark h2,.card-dark h3{color:#fff}
.card-outline{background:#fff;border-radius:16px;padding:22px;border:2px solid var(--c1)}
.card-left-accent{background:#fff;border-radius:16px;padding:22px;border:1px solid #eee;border-left:4px solid var(--c1)}
.card-gradient{background:linear-gradient(135deg,var(--c1),var(--c2));border-radius:16px;padding:22px;color:#fff}
.card-gradient p,.card-gradient .label{color:rgba(255,255,255,0.8)}
.card-gradient .big-number{background:none;-webkit-text-fill-color:#fff}

/* Card internal spacing */
.card h3,.card-accent h3,.card-dark h3,.card-outline h3,.card-left-accent h3,.card-gradient h3{margin-bottom:8px}
.card .big-emoji,.card-accent .big-emoji,.card-dark .big-emoji,.stat .big-emoji{margin-bottom:12px}

/* ───── CHIPS / TAGS ───── */
.chip{display:inline-block;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:600;background:var(--c-light);color:var(--c1)}
.chip-white{background:rgba(255,255,255,0.2);color:#fff}
.chip-outline{background:transparent;border:1.5px solid var(--c1);color:var(--c1)}
.chip-dark{background:#1e1e2e;color:#fff}
.chip-sm{padding:3px 10px;font-size:11px;border-radius:12px}
.chip-group{display:flex;flex-wrap:wrap;gap:10px}

/* ───── STEPS (numbered process) ───── */
.steps{counter-reset:step}
.step{counter-increment:step;padding-left:48px;position:relative;margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid #f0f0f0}
.step:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0}
.step::before{content:counter(step);position:absolute;left:0;top:0;width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,var(--c1),var(--c2));color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;box-shadow:0 4px 12px -2px color-mix(in srgb,var(--c1) 35%,transparent)}
.step h3{margin-bottom:6px}
.step p{margin-bottom:0;color:#666}

/* ───── CHECK-LIST ───── */
.check-list{padding:0}
.check-list li{padding:12px 0 12px 36px;position:relative;list-style:none;font-size:14px;line-height:1.5;border-bottom:1px solid #f5f5f5}
.check-list li:last-child{border-bottom:none}
.check-list li::before{content:"✓";position:absolute;left:0;top:12px;width:24px;height:24px;border-radius:8px;background:linear-gradient(135deg,var(--c1),var(--c2));color:#fff;font-weight:700;font-size:11px;display:flex;align-items:center;justify-content:center}
.check-list li strong{color:#1e1e2e}

/* ───── DIVIDER ───── */
.divider{height:1px;background:#eee;margin:36px 0}
.divider-accent{height:3px;width:48px;background:linear-gradient(90deg,var(--c1),var(--c2));border-radius:2px;margin:28px 0}
.divider-accent.center{margin-left:auto;margin-right:auto}

/* ───── FOOTER ───── */
.footer{text-align:center;padding:28px 0 8px;font-size:12px;color:#bbb;border-top:1px solid #eee;margin-top:32px}

/* ───── QUOTE ───── */
.quote{border-left:4px solid var(--c1);padding:24px 28px;background:var(--c-light);border-radius:0 16px 16px 0;font-style:italic;color:#444;font-size:16px;line-height:1.7}
.quote-lg{font-size:18px;padding:32px;text-align:center;border-left:none;border-radius:20px;background:var(--c-light)}
.quote-author{display:block;font-style:normal;font-weight:600;font-size:13px;color:var(--c1);margin-top:12px}

/* ───── ICON CIRCLE ───── */
.icon-circle{width:48px;height:48px;border-radius:14px;background:var(--c-light);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0}
.icon-circle-sm{width:36px;height:36px;border-radius:10px;font-size:16px}
.icon-circle-gradient{background:linear-gradient(135deg,var(--c1),var(--c2))}
.icon-circle-dark{background:#1e1e2e}

/* ───── CALLOUT (highlight box) ───── */
.callout{padding:24px 28px;border-radius:16px;display:flex;gap:16px;align-items:flex-start}
.callout-info{background:var(--c-light);border:1px solid color-mix(in srgb,var(--c1) 20%,transparent)}
.callout-dark{background:linear-gradient(160deg,#0f0f1a,#1a1a3e);color:#fff}
.callout-dark p{color:rgba(255,255,255,0.7)}
.callout .big-emoji{margin-bottom:0;font-size:28px;flex-shrink:0}

/* ───── PROGRESS BAR ───── */
.progress{height:8px;border-radius:4px;background:#eee;overflow:hidden}
.progress-fill{height:100%;border-radius:4px;background:linear-gradient(90deg,var(--c1),var(--c2))}

/* ───── RESPONSIVE ───── */
@media(max-width:500px){
  .page{padding:20px 16px}
  .section{margin-bottom:32px}
  .grid-2{grid-template-columns:repeat(2,1fr);gap:12px}
  .grid-3{grid-template-columns:repeat(2,1fr);gap:12px}
  .hero{padding:36px 20px;border-radius:20px}
  .hero h1{font-size:24px}
  h1{font-size:21px}
  .big-number{font-size:30px}
  .big-emoji{font-size:30px}
  .card,.card-accent,.card-dark,.card-outline,.card-left-accent,.card-gradient{padding:18px 16px}
  .stat,.stat-flat{padding:20px 14px}
  .banner{padding:26px 20px;border-radius:16px}
  .span-2{grid-column:span 1}
  .quote{padding:18px 20px;font-size:15px}
  .quote-lg{font-size:16px;padding:24px}
  .callout{padding:18px 20px;gap:12px}
  .step{padding-left:44px}
}
@media(max-width:360px){
  .grid-2,.grid-3{grid-template-columns:1fr}
}

/* ───── ANIMATIONS ───── */
@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
.section{animation:fadeUp 0.5s ease both}
.section:nth-child(2){animation-delay:0.06s}
.section:nth-child(3){animation-delay:0.12s}
.section:nth-child(4){animation-delay:0.18s}
.section:nth-child(5){animation-delay:0.24s}
.section:nth-child(6){animation-delay:0.3s}
.section:nth-child(7){animation-delay:0.36s}
.section:nth-child(8){animation-delay:0.42s}
`;
