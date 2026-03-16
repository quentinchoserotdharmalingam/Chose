/**
 * Base CSS injected into the iframe for generated pages.
 * The LLM only generates HTML with these utility classes — no inline CSS needed.
 * This makes generation faster (fewer tokens) and more consistent.
 */
export const PAGE_CSS = `
/* ─── Reset & Base ─── */
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter','Segoe UI',system-ui,-apple-system,sans-serif;color:#1a1a2e;background:#f8f9fa;line-height:1.6;padding:0;margin:0;-webkit-font-smoothing:antialiased}

/* ─── Layout ─── */
.page{max-width:720px;margin:0 auto;padding:24px 20px 32px}
.section{margin-bottom:32px}
.grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.flex-row{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
.flex-col{display:flex;flex-direction:column;gap:12px}
.center{text-align:center}
.gap-sm{gap:8px}
.gap-lg{gap:20px}

/* ─── Hero variants ─── */
.hero{padding:44px 28px;border-radius:20px;margin-bottom:28px;text-align:center;position:relative;overflow:hidden}
.hero h1{font-size:28px;font-weight:800;margin-bottom:10px;line-height:1.15;letter-spacing:-0.02em}
.hero p{font-size:15px;opacity:0.88;max-width:480px;margin:0 auto;line-height:1.6}
.hero .big-emoji{font-size:48px;margin-bottom:14px;display:block}
.hero-gradient{background:linear-gradient(135deg,var(--c1),var(--c2));color:#fff;box-shadow:0 8px 32px color-mix(in srgb,var(--c1) 30%,transparent)}
.hero-light{background:var(--c-light);color:var(--c1)}
.hero-dark{background:linear-gradient(135deg,#1a1a2e,#2d2b55);color:#fff}
.hero-accent{background:var(--c1);color:#fff;box-shadow:0 8px 32px color-mix(in srgb,var(--c1) 25%,transparent)}
.hero-split{display:flex;align-items:center;text-align:left;gap:24px;padding:36px 32px}
.hero-split .hero-text{flex:1}
.hero-split .hero-visual{font-size:64px;flex-shrink:0}

/* ─── Typography ─── */
h1{font-size:24px;font-weight:800;margin-bottom:10px;letter-spacing:-0.02em;line-height:1.2}
h2{font-size:18px;font-weight:700;margin-bottom:12px;color:#1a1a2e;letter-spacing:-0.01em}
h3{font-size:15px;font-weight:600;margin-bottom:6px}
p{font-size:14px;color:#4a4a6a;margin-bottom:6px;line-height:1.65}
.subtitle{font-size:14px;color:#6b7280;font-weight:500;line-height:1.5}
.label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#9ca3af;margin-bottom:8px}
.big-number{font-size:36px;font-weight:800;line-height:1;color:var(--c1);letter-spacing:-0.03em}
.big-emoji{font-size:40px;margin-bottom:10px;display:block}
.highlight{color:var(--c1);font-weight:700}
.text-white{color:#fff}
.text-muted{color:#6b7280}

/* ─── Cards ─── */
.card{background:#fff;border-radius:16px;padding:22px;border:1px solid #e5e7eb;transition:box-shadow 0.2s}
.card:hover{box-shadow:0 4px 20px rgba(0,0,0,0.06)}
.card-accent{background:var(--c-light);border-radius:16px;padding:22px;border:none}
.card-dark{background:linear-gradient(135deg,#1a1a2e,#2d2b55);border-radius:16px;padding:22px;color:#fff}
.card-outline{background:transparent;border-radius:16px;padding:22px;border:2px solid var(--c1)}
.card-glass{background:rgba(255,255,255,0.7);backdrop-filter:blur(10px);border-radius:16px;padding:22px;border:1px solid rgba(255,255,255,0.5);box-shadow:0 4px 16px rgba(0,0,0,0.04)}
.card-elevated{background:#fff;border-radius:16px;padding:22px;border:none;box-shadow:0 4px 24px rgba(0,0,0,0.08)}
.card .big-emoji,.card-accent .big-emoji,.card-dark .big-emoji,.card-elevated .big-emoji{font-size:32px;margin-bottom:10px}
.card h3,.card-accent h3,.card-elevated h3{margin-bottom:8px}
.card p,.card-accent p,.card-elevated p{font-size:13px;line-height:1.55;margin-bottom:0}

/* ─── Stat block ─── */
.stat{text-align:center;padding:8px 0}
.stat .big-number{margin-bottom:6px}
.stat .label{margin-bottom:0;font-size:11px}

/* ─── Chips / Tags ─── */
.chip{display:inline-block;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:600;background:var(--c-light);color:var(--c1)}
.chip-white{background:rgba(255,255,255,0.2);color:#fff}
.chip-outline{background:transparent;border:1.5px solid var(--c1);color:var(--c1)}
.chip-sm{padding:4px 10px;font-size:11px}
.chips{display:flex;flex-wrap:wrap;gap:8px}

/* ─── Lists ─── */
.steps{counter-reset:step}
.step{counter-increment:step;padding-left:42px;position:relative;margin-bottom:18px}
.step::before{content:counter(step);position:absolute;left:0;top:0;width:28px;height:28px;border-radius:50%;background:var(--c1);color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;box-shadow:0 2px 8px color-mix(in srgb,var(--c1) 30%,transparent)}
.step h3{margin-bottom:4px}
.step p{margin-bottom:0}
ul.check-list{list-style:none;padding:0}
.check-list li{padding:8px 0 8px 32px;position:relative;list-style:none;font-size:14px;line-height:1.5}
.check-list li::before{content:"✓";position:absolute;left:0;top:8px;width:22px;height:22px;border-radius:50%;background:var(--c-light);color:var(--c1);font-weight:700;display:flex;align-items:center;justify-content:center;font-size:12px}

/* ─── Icon row (emoji + text) ─── */
.icon-row{display:flex;align-items:flex-start;gap:14px;margin-bottom:14px}
.icon-row .icon{font-size:24px;flex-shrink:0;width:40px;height:40px;display:flex;align-items:center;justify-content:center;background:var(--c-light);border-radius:12px}
.icon-row .icon-text{flex:1}
.icon-row .icon-text h3{margin-bottom:2px}
.icon-row .icon-text p{margin-bottom:0;font-size:13px}

/* ─── Divider ─── */
.divider{height:1px;background:#e5e7eb;margin:28px 0}
.divider-accent{height:3px;width:48px;background:linear-gradient(90deg,var(--c1),var(--c2));border-radius:2px;margin:18px 0}
.divider-accent.center{margin:18px auto}

/* ─── Footer ─── */
.footer{text-align:center;padding:24px 0;font-size:12px;color:#9ca3af;border-top:1px solid #eee;margin-top:24px}

/* ─── Quote ─── */
.quote{border-left:3px solid var(--c1);padding:16px 20px;background:var(--c-light);border-radius:0 14px 14px 0;font-style:italic;color:#4a4a6a;font-size:15px;line-height:1.6}
.quote-author{font-style:normal;font-size:13px;font-weight:600;color:var(--c1);margin-top:8px;display:block}

/* ─── Banner / CTA ─── */
.banner{padding:20px 24px;border-radius:14px;background:linear-gradient(135deg,var(--c1),var(--c2));color:#fff;text-align:center}
.banner h3{color:#fff;margin-bottom:6px;font-size:16px}
.banner p{color:rgba(255,255,255,0.9);margin-bottom:0}

/* ─── Progress / Timeline ─── */
.timeline{position:relative;padding-left:24px;border-left:2px solid var(--c-light)}
.timeline-item{position:relative;margin-bottom:20px;padding-left:16px}
.timeline-item::before{content:"";position:absolute;left:-29px;top:4px;width:12px;height:12px;border-radius:50%;background:var(--c1);border:3px solid var(--c-light)}
.timeline-item:last-child{margin-bottom:0}

/* ─── Responsive ─── */
@media(max-width:500px){
  .grid-2,.grid-3{grid-template-columns:1fr}
  .hero{padding:32px 18px;border-radius:16px}
  .hero h1{font-size:22px}
  .hero-split{flex-direction:column;text-align:center}
  h1{font-size:20px}
  .big-number{font-size:28px}
  .card,.card-accent,.card-dark,.card-outline,.card-glass,.card-elevated{padding:18px}
}

/* ─── Animations ─── */
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
.section{animation:fadeUp 0.5s ease both}
.section:nth-child(2){animation-delay:0.08s}
.section:nth-child(3){animation-delay:0.16s}
.section:nth-child(4){animation-delay:0.24s}
.section:nth-child(5){animation-delay:0.32s}
.section:nth-child(6){animation-delay:0.4s}
.section:nth-child(7){animation-delay:0.48s}

/* ─── Google Fonts (Inter) ─── */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
`;
