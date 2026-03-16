import { useState, useRef, useEffect } from "react";
import { analyzePdf, proposePdf, generatePage, modifyPage, getSuggestions } from "./api.js";

// ── UTILS ──
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── HEYTEAM DESIGN TOKENS ──
const K = {
  bg: "#FBFBFB", w: "#FFFFFF", a: "#F7F7F7", b: "#F5F4F4",
  b2: "#DDDDDD",
  t: "#272727", s: "#A4A4A4", m: "#A4A4A4",
  c: "#FF6058", d: "#F64A49", l: "#FCEDEC",
  ok: "#53B483", er: "#F34141",
  warn: "#E9A23B", info: "#2563EB",
};

const PALETTE = ["#FF6058", "#53B483", "#E9A23B", "#2563EB", "#7c3aed", "#0891b2"];

const SHADOW = {
  1: "0px 1px 3px 0px rgba(47,43,67,0.10), 0px -1px 0px 0px rgba(47,43,67,0.10) inset",
  2: "0px -1px 0px 0px rgba(47,43,67,0.10) inset, 0px 4px 8px 0px rgba(47,43,67,0.10)",
  3: "0px 6px 12px 0px rgba(47,43,67,0.10)",
  4: "0px 8px 24px 0px rgba(47,43,67,0.10)",
};

const NAV_ITEMS = [
  { icon: "\uD83D\uDCC4", label: "Documents" },
  { icon: "\uD83C\uDF93", label: "Formations" },
  { icon: "\uD83D\uDCCB", label: "Questionnaires" },
  { icon: "\u2753", label: "Quiz" },
  { icon: "\uD83D\uDCC5", label: "\u00C9v\u00E9nements" },
  { icon: "\uD83D\uDCBB", label: "Logiciels" },
  { icon: "\uD83D\uDCE6", label: "\u00C9quipements" },
  { icon: "\uD83D\uDCC2", label: "Pi\u00E8ces administratives" },
  { icon: "\u2709\uFE0F", label: "Emails" },
  { icon: "\u26A1", label: "Actions" },
  { icon: "\uD83C\uDFC6", label: "D\u00E9fis" },
  { icon: "\u2728", label: "Contenu IA", active: true },
];

// ── MAIN COMPONENT ──
export default function App() {
  const [step, setStep] = useState("upload");
  const [file, setFile] = useState(null);
  const [fname, setFname] = useState("");
  const [summary, setSummary] = useState("");
  const [company, setCompany] = useState("");
  const [facts, setFacts] = useState([]);
  const [props, setProps] = useState([]);
  const [sel, setSel] = useState(new Set());
  const [color, setColor] = useState("#FF6058");
  const [html, setHtml] = useState("");
  const [genPhase, setGenPhase] = useState("");
  const [pct, setPct] = useState(0);
  const [msgs, setMsgs] = useState([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);
  const [hist, setHist] = useState([]);
  const [tab, setTab] = useState("preview");
  const [sugs, setSugs] = useState([]);
  const [loadS, setLoadS] = useState(false);
  const [phase, setPhase] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const eRef = useRef(null);
  const iRef = useRef(null);
  const fRef = useRef(null);
  const timerRef = useRef(null);
  const abortRef = useRef(false);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMobileMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => { eRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  useEffect(() => {
    if (iRef.current && html) {
      try {
        const d = iRef.current.contentDocument;
        d.open();
        d.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;padding:16px;font-family:'Poppins',system-ui,sans-serif;background:#f8f9fa;}</style></head><body>${html}</body></html>`);
        d.close();
      } catch { /* cross-origin */ }
    }
  }, [html, tab, step]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  // ── FILE ──
  const pick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") { setErr("PDF uniquement"); return; }
    setErr(""); setFile(f); setFname(f.name);
  };

  // ── ANALYZE ──
  const analyze = async () => {
    if (!file) return;
    setStep("analyzing"); setErr(""); setPhase(1); setFacts([]);
    setSummary(""); setCompany("");
    abortRef.current = false;

    try {
      await sleep(600);
      if (abortRef.current) return;
      setPhase(2);

      const [analyzeResult, proposeResult] = await Promise.all([
        analyzePdf(file),
        proposePdf(file),
      ]);
      if (abortRef.current) return;

      const sd = analyzeResult;
      if (sd.c) { setCompany(sd.c); await sleep(1200); }
      if (sd.s) { setSummary(sd.s); await sleep(1000); }
      const allFacts = sd.f || [];
      for (let i = 0; i < allFacts.length; i++) {
        await sleep(900 + i * 200);
        setFacts((prev) => [...prev, allFacts[i]]);
      }
      if (abortRef.current) return;

      await sleep(1000);
      setPhase(3);

      const pd = proposeResult;
      setProps((pd.p || []).map((p, i) => ({ ...p, id: `p${i}` })));
      setPhase(4);
      setStep("proposals");
    } catch (e) {
      if (!abortRef.current) { setErr(e.message); setStep("upload"); setPhase(0); }
    }
  };

  // ── GENERATE ──
  const generate = async () => {
    if (sel.size === 0) return;
    setStep("generating"); setSugs([]); setHtml(""); setPct(0);
    setGenPhase("Construction du hero\u2026"); setErr("");
    abortRef.current = false;

    let animPct = 0;
    timerRef.current = setInterval(() => {
      const rem = 96 - animPct;
      if (rem > 50) animPct += 1.0 + Math.random() * 0.8;
      else if (rem > 20) animPct += 0.3 + Math.random() * 0.3;
      else animPct += 0.04 + Math.random() * 0.03;
      animPct = Math.min(animPct, 95.5);
      setPct(Math.round(animPct));
      if (animPct < 25) setGenPhase("Construction du hero\u2026");
      else if (animPct < 55) setGenPhase("Sections principales\u2026");
      else if (animPct < 85) setGenPhase("Finitions\u2026");
      else setGenPhase("Presque pr\u00eat\u2026");
    }, 250);

    try {
      const picks = props.filter((x) => sel.has(x.id));
      const context_str = picks.length === 1
        ? picks[0].r
        : `Fusionne ces th\u00e8mes en UNE page coh\u00e9rente: ${picks.map((p) => `${p.t}: ${p.r}`).join(". ")}`;

      const docContext = [
        summary ? `Document: ${summary}` : "",
        company ? `Titre/Entreprise: ${company}` : "",
        facts.length > 0 ? `Points cl\u00e9s: ${facts.join(", ")}` : "",
      ].filter(Boolean).join(". ");

      const result = await generatePage({
        prompt: context_str,
        context: docContext,
        company,
        color,
      });
      if (abortRef.current) return;

      clearInterval(timerRef.current);
      timerRef.current = null;
      setPct(100);
      setGenPhase("Termin\u00e9 !");
      setHtml(result.html);

      setHist([
        { role: "user", content: `${docContext}\n\nConsigne: ${context_str}\n\nG\u00e9n\u00e8re la page compl\u00e8te.` },
        { role: "assistant", content: result.html },
      ]);
      setMsgs([{ role: "assistant", text: "Page g\u00e9n\u00e9r\u00e9e ! Tu peux l\u2019ajuster ci-dessous." }]);

      await sleep(500);
      setTab("preview");
      setStep("result");
      doSugs(result.html);
    } catch (e) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      if (!abortRef.current) {
        setErr(e.message);
        setStep("proposals");
      }
    }
  };

  // ── SUGGESTIONS ──
  const doSugs = async (h) => {
    setLoadS(true);
    try {
      const result = await getSuggestions(h);
      if (Array.isArray(result.suggestions)) setSugs(result.suggestions.slice(0, 4));
    } catch {
      setSugs(["Rends le ton plus chaleureux", "Mets les chiffres plus en avant", "Ajoute une FAQ en bas de page", "R\u00e9organise les sections"]);
    } finally { setLoadS(false); }
  };

  // ── CHAT MODIFY ──
  const modify = async (msg) => {
    setBusy(true);
    try {
      const result = await modifyPage({ history: hist, message: msg });
      const h = result.html;
      setHtml(h);
      setHist([...hist, { role: "user", content: msg }, { role: "assistant", content: h }]);
      setMsgs((p) => [...p, { role: "assistant", text: "Modifs appliqu\u00e9es !" }]);
      doSugs(h);
    } catch (e) {
      setMsgs((p) => [...p, { role: "assistant", text: `Erreur: ${e.message}` }]);
    } finally { setBusy(false); }
  };

  const send = () => {
    const m = draft.trim();
    if (!m || busy) return;
    setDraft(""); setMsgs((p) => [...p, { role: "user", text: m }]); setSugs([]); modify(m);
  };

  const tog = (id) => setSel((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const cp = () => { navigator.clipboard.writeText(html).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); }); };

  const rst = () => {
    abortRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    setStep("upload"); setSel(new Set()); setFile(null); setFname("");
    setHtml(""); setMsgs([]); setHist([]); setErr("");
    setDraft(""); setTab("preview"); setSugs([]); setCompany("");
    setColor("#FF6058"); setSummary(""); setFacts([]); setProps([]);
    setPct(0); setPhase(0); setGenPhase("");
  };

  const sidebarW = sidebarCollapsed ? 60 : 220;

  // ── RENDER ──
  return (
    <div style={{ height: "100vh", background: K.bg, color: K.t, fontFamily: "'Poppins',sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes pu{0%,100%{opacity:.45}50%{opacity:1}}
@keyframes pop{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
@keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:${K.b2};border-radius:3px}
textarea::placeholder,input::placeholder{color:${K.s}}input,textarea,button{font-family:inherit}`}</style>

      {/* APP SHELL: SIDEBAR + MAIN */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>

        {/* MOBILE OVERLAY */}
        {isMobile && mobileMenuOpen && (
          <div onClick={() => setMobileMenuOpen(false)} style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 90,
            animation: "fu 0.2s ease",
          }} />
        )}

        {/* SIDEBAR */}
        <div style={{
          width: isMobile ? 260 : sidebarW, flexShrink: 0, background: K.w, borderRight: `1px solid ${K.b}`,
          display: "flex", flexDirection: "column", transition: "transform 0.3s ease-in-out, width 0.3s ease-in-out", overflow: "hidden",
          ...(isMobile ? {
            position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 100,
            transform: mobileMenuOpen ? "translateX(0)" : "translateX(-100%)",
            boxShadow: mobileMenuOpen ? SHADOW[4] : "none",
          } : {}),
        }}>
          {/* Logo + collapse icon */}
          <div style={{ padding: "16px 12px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, background: K.c, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 8px rgba(255,96,88,0.25)",
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" fill="#fff" fillOpacity="0.25"/>
                  <path d="M9 11h6M9 14h4M12 2v5" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
            {!isMobile && !sidebarCollapsed && (
              <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{
                width: 28, height: 28, borderRadius: 6, border: `1px solid ${K.b}`,
                background: K.w, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, color: K.s, flexShrink: 0, transition: "all 0.2s",
              }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/><line x1="5" y1="1" x2="5" y2="13" stroke="currentColor" strokeWidth="1.5"/></svg>
              </button>
            )}
            {!isMobile && sidebarCollapsed && (
              <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{
                position: "absolute", left: sidebarW - 14, top: 28, width: 28, height: 28, borderRadius: 6,
                border: `1px solid ${K.b}`, background: K.w, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, color: K.s, zIndex: 10, boxShadow: SHADOW[1],
              }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/><line x1="5" y1="1" x2="5" y2="13" stroke="currentColor" strokeWidth="1.5"/></svg>
              </button>
            )}
            {isMobile && (
              <button onClick={() => setMobileMenuOpen(false)} style={{
                width: 28, height: 28, borderRadius: 6, border: `1px solid ${K.b}`,
                background: K.w, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, color: K.s, flexShrink: 0,
              }}>✕</button>
            )}
          </div>

          {/* Back link */}
          {(!sidebarCollapsed || isMobile) && (
            <div style={{
              padding: "6px 16px 12px", display: "flex", alignItems: "center", gap: 6,
              fontSize: 13, color: K.s, cursor: "pointer", fontWeight: 500,
            }}>
              <span style={{ fontSize: 14 }}>{"\u2190"}</span> Retour au menu
            </div>
          )}

          {/* Nav items */}
          <div style={{ flex: 1, overflow: "auto", padding: "0 8px" }}>
            {NAV_ITEMS.map((item, i) => (
              <div key={i} onClick={() => isMobile && setMobileMenuOpen(false)} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: (sidebarCollapsed && !isMobile) ? "10px 0" : "10px 12px",
                justifyContent: (sidebarCollapsed && !isMobile) ? "center" : "flex-start",
                borderRadius: 8, marginBottom: 2, cursor: "pointer",
                background: item.active ? K.c : "transparent",
                color: item.active ? K.w : K.t,
                fontSize: 13, fontWeight: item.active ? 600 : 500, whiteSpace: "nowrap",
                transition: "all 0.2s ease-in-out",
              }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                {(!sidebarCollapsed || isMobile) && <span>{item.label}</span>}
              </div>
            ))}
          </div>

          {/* User bottom */}
          <div style={{
            padding: "12px 16px", borderTop: `1px solid ${K.b}`,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%", background: "#E8D5F5",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 600, color: "#7c3aed", flexShrink: 0,
            }}>N</div>
            {(!sidebarCollapsed || isMobile) && (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: K.t }}>Nathaniel</div>
                <span style={{ fontSize: 11, color: K.s, cursor: "pointer" }}>{"\u25B4"}</span>
              </div>
            )}
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* TOP BAR */}
          <div style={{
            padding: isMobile ? "12px 16px" : "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
            borderBottom: `1px solid ${K.b}`, background: K.w, flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {isMobile && (
                <button onClick={() => setMobileMenuOpen(true)} style={{
                  width: 36, height: 36, borderRadius: 8, border: `1px solid ${K.b}`,
                  background: K.w, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M3 5h12M3 9h12M3 13h12" stroke={K.t} strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
              <div>
              <h1 style={{ fontSize: isMobile ? 18 : 24, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.5 }}>Contenu IA</h1>
              {step !== "upload" && (
                <div style={{ fontSize: 12, color: K.s, fontWeight: 400 }}>
                  {step === "analyzing" ? "Analyse en cours\u2026" : step === "proposals" ? `${props.length} propositions` : step === "generating" ? "G\u00e9n\u00e9ration\u2026" : "R\u00e9sultat"}
                </div>
              )}
            </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {!["upload", "analyzing", "generating"].includes(step) && (
                <button onClick={rst} style={{
                  fontSize: 13, fontWeight: 500, padding: "8px 16px", borderRadius: 8,
                  border: `1px solid ${K.b2}`, background: K.w, color: K.t, cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                }}>Nouveau</button>
              )}
              {step === "upload" && (
                <button disabled={!file} onClick={analyze} style={{
                  padding: "10px 24px", borderRadius: 100, border: "none",
                  background: file ? K.c : K.a, color: file ? K.w : K.s,
                  fontSize: 13, fontWeight: 600, cursor: file ? "pointer" : "not-allowed",
                  boxShadow: file ? SHADOW[2] : "none",
                  transition: "all 0.3s ease-in-out",
                }}>Analyser</button>
              )}
            </div>
          </div>

          {/* UPLOAD */}
          {step === "upload" && (
            <div style={{ flex: 1, overflow: "auto", padding: isMobile ? "24px 16px" : "40px 24px", display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
              <div style={{ maxWidth: 460, width: "100%", textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{"\u2728"}</div>
                <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 6, letterSpacing: "-0.02em" }}>Transforme ton PDF</h2>
                <p style={{ fontSize: 13, color: K.s, lineHeight: "20px", marginBottom: 24, letterSpacing: "-0.01em" }}>L'IA analysera ton document et proposera 6 pages adapt\u00e9es.</p>
                <div onClick={() => fRef.current?.click()} style={{
                  border: `2px dashed ${file ? K.c : K.b2}`, borderRadius: 12, padding: "32px 16px",
                  cursor: "pointer", background: file ? K.l : K.w, marginBottom: 16,
                  transition: "all 0.3s ease-in-out", boxShadow: file ? SHADOW[1] : "none",
                }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>{"\uD83D\uDCC4"}</div>
                  <div style={{ fontSize: 13, color: file ? K.c : K.s, fontWeight: file ? 600 : 500 }}>{file ? "Fichier pr\u00eat \u2713" : "Choisis ton PDF"}</div>
                  {fname && <div style={{
                    marginTop: 10, padding: "6px 12px", borderRadius: 100, fontSize: 12, fontWeight: 500,
                    background: K.a, color: K.c, display: "inline-block", maxWidth: "100%",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{"\uD83D\uDCCE"} {fname}</div>}
                  <input ref={fRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={pick} />
                </div>
                {err && <div style={{
                  marginBottom: 16, padding: "12px", borderRadius: 8,
                  background: "#FEF2F2", border: `1px solid #F7A1A1`, color: K.er, fontSize: 13,
                }}>{err}</div>}
                <button disabled={!file} onClick={analyze} style={{
                  width: "100%", padding: "14px", borderRadius: 100, border: "none",
                  background: file ? K.c : K.a, color: file ? K.w : K.s,
                  fontSize: 15, fontWeight: 600, cursor: file ? "pointer" : "not-allowed",
                  boxShadow: file ? SHADOW[2] : "none",
                  transition: "all 0.3s ease-in-out",
                }}>Analyser le PDF</button>
              </div>
            </div>
          )}

          {/* ANALYZING */}
          {step === "analyzing" && (
            <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
              <div style={{ maxWidth: 440, margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                  <div style={{
                    width: 40, height: 40, border: `3px solid ${K.b}`, borderTopColor: K.c,
                    borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px",
                  }} />
                  <div style={{ fontSize: 16, fontWeight: 500, letterSpacing: "-0.02em" }}>Analyse du document\u2026</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                  {[
                    { l: "Lecture du PDF", ok: phase > 1 },
                    { l: "Identification du contenu", ok: phase > 1 && (!!company || !!summary) },
                    { l: "Extraction des informations cl\u00e9s", ok: facts.length > 0 },
                    { l: "Pr\u00e9paration des propositions", ok: phase > 3 },
                  ].map((s, i) => {
                    const active = !s.ok && (
                      (i === 0 && phase === 1) ||
                      (i === 1 && phase === 2 && !company && !summary) ||
                      (i === 2 && phase === 2 && (!!company || !!summary) && facts.length === 0) ||
                      (i === 3 && phase === 3)
                    );
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, animation: `fu ${0.15 + i * 0.1}s ease` }}>
                        <div style={{
                          width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                          background: s.ok ? K.ok : (active ? K.c : K.b2),
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11, color: K.w, fontWeight: 600,
                          ...(active ? { animation: "pu 2.5s ease infinite" } : {}),
                        }}>{s.ok ? "\u2713" : (i + 1)}</div>
                        <span style={{ fontSize: 13, color: s.ok ? K.ok : (active ? K.t : K.s), fontWeight: active ? 600 : 500, letterSpacing: "-0.01em" }}>{s.l}</span>
                      </div>
                    );
                  })}
                </div>
                {(summary || company || facts.length > 0) && (
                  <div style={{
                    padding: "20px", borderRadius: 12, background: K.w, border: `1px solid ${K.b}`,
                    animation: "fu 0.4s ease", boxShadow: SHADOW[1],
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: K.s, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 10 }}>Document analys\u00e9</div>
                    {(company || summary) && (
                      <div style={{ marginBottom: facts.length > 0 ? 14 : 0, animation: "fu 0.3s ease" }}>
                        {company && <div style={{ fontSize: 16, fontWeight: 500, color: K.c, marginBottom: 4, animation: "pop 0.3s ease", letterSpacing: "-0.02em" }}>{company}</div>}
                        {summary && <div style={{ fontSize: 13, color: K.t, lineHeight: "20px", letterSpacing: "-0.01em" }}>{summary}</div>}
                      </div>
                    )}
                    {facts.length > 0 && (
                      <>
                        <div style={{ fontSize: 12, fontWeight: 600, color: K.s, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>Points cl\u00e9s identifi\u00e9s</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {facts.map((f, i) => (
                            <span key={i} style={{
                              padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 500,
                              background: [K.l, "#EFFDF6", "#FEFAF5", "#F4F7FE"][i % 4],
                              color: [K.c, "#53B483", "#E9A23B", "#2563EB"][i % 4],
                              animation: "pop 0.3s ease",
                            }}>{f}</span>
                          ))}
                        </div>
                      </>
                    )}
                    {phase < 4 && phase >= 2 && (
                      <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${K.b}`, display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 14, height: 14, border: `2px solid ${K.b2}`, borderTopColor: K.c, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                        <span style={{ fontSize: 12, color: K.s, animation: "pu 2.5s ease infinite" }}>
                          {phase < 3 ? "Analyse en cours\u2026" : "Cr\u00e9ation de 6 propositions de pages\u2026"}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PROPOSALS */}
          {step === "proposals" && (
            <div style={{ flex: 1, overflow: "auto", padding: isMobile ? "16px" : "20px 24px" }}>
              <div style={{ maxWidth: 500, margin: "0 auto" }}>
                <div style={{
                  padding: "16px", borderRadius: 12, background: K.l, marginBottom: 16,
                  animation: "fu 0.3s",
                }}>
                  {company && <div style={{ fontSize: 14, fontWeight: 600, color: K.c, marginBottom: 4 }}>{company}</div>}
                  <div style={{ fontSize: 13, color: K.t, lineHeight: "20px", letterSpacing: "-0.01em" }}>{summary}</div>
                  {facts.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                      {facts.map((f, i) => <span key={i} style={{
                        padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 500,
                        background: K.w, color: K.c,
                      }}>{f}</span>)}
                    </div>
                  )}
                </div>
                <div style={{
                  display: "flex", gap: 8, alignItems: "center", marginBottom: 16,
                  padding: "10px 14px", borderRadius: 8, background: K.w, border: `1px solid ${K.b}`,
                }}>
                  <span style={{ fontSize: 12, color: K.s, fontWeight: 600, letterSpacing: "-0.01em" }}>Couleur :</span>
                  {PALETTE.map((c) => (
                    <div key={c} onClick={() => setColor(c)} style={{
                      width: 24, height: 24, borderRadius: 6, background: c, cursor: "pointer",
                      border: color === c ? `2.5px solid ${K.t}` : "2px solid transparent",
                      transition: "all 0.2s ease-in-out",
                    }} />
                  ))}
                </div>
                {err && <div style={{
                  marginBottom: 16, padding: "12px", borderRadius: 8,
                  background: "#FEF2F2", border: `1px solid #F7A1A1`, color: K.er, fontSize: 13,
                }}>{err}</div>}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {props.map((pr, idx) => {
                    const on = sel.has(pr.id);
                    return (
                      <button key={pr.id} onClick={() => tog(pr.id)} style={{
                        display: "flex", alignItems: "flex-start", gap: 12, padding: "14px",
                        borderRadius: 12, border: on ? `2px solid ${K.c}` : `1px solid ${K.b}`,
                        background: on ? K.l : K.w, cursor: "pointer", textAlign: "left",
                        animation: `fu ${0.1 + idx * 0.06}s ease`, boxShadow: on ? SHADOW[1] : "none",
                        transition: "all 0.2s ease-in-out",
                      }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 2,
                          border: on ? `2px solid ${K.c}` : `2px solid ${K.b2}`,
                          background: on ? K.c : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11, color: K.w, fontWeight: 700,
                          transition: "all 0.2s ease-in-out",
                        }}>{on && "\u2713"}</div>
                        <div style={{ fontSize: 22, flexShrink: 0 }}>{pr.i}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3, letterSpacing: "-0.01em" }}>{pr.t}</div>
                          <div style={{ fontSize: 12, color: K.s, lineHeight: "18px", letterSpacing: "-0.01em" }}>{pr.d}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <button disabled={sel.size === 0} onClick={generate} style={{
                  marginTop: 16, width: "100%", padding: "14px",
                  borderRadius: 100, border: "none",
                  background: sel.size > 0 ? K.c : K.a,
                  color: sel.size > 0 ? K.w : K.s,
                  fontSize: 15, fontWeight: 600, cursor: sel.size > 0 ? "pointer" : "not-allowed",
                  boxShadow: sel.size > 0 ? SHADOW[2] : "none",
                  transition: "all 0.3s ease-in-out",
                }}>
                  {sel.size === 0 ? "S\u00e9lectionne au moins 1" : sel.size === 1 ? "G\u00e9n\u00e9rer" : `Fusionner (${sel.size})`}
                </button>
              </div>
            </div>
          )}

          {/* GENERATING */}
          {step === "generating" && (
            <div style={{ flex: 1, overflow: "auto", padding: "24px", background: K.a }}>
              <div style={{ maxWidth: 460, margin: "0 auto" }}>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: "-0.01em" }}>{genPhase}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: K.c }}>{pct}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 100, background: K.b, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 100, background: K.c,
                      width: `${pct}%`, transition: "width 0.4s ease",
                    }} />
                  </div>
                </div>
                <div style={{
                  padding: "16px", borderRadius: 12, background: K.w, border: `1px solid ${K.b}`,
                  marginBottom: 14, animation: "fu 0.3s", boxShadow: SHADOW[1],
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: K.s, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 10 }}>Page en cours de cr\u00e9ation</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {props.filter((p) => sel.has(p.id)).map((p) => (
                      <div key={p.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <span style={{ fontSize: 20 }}>{p.i}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em" }}>{p.t}</div>
                          <div style={{ fontSize: 12, color: K.s, lineHeight: "18px" }}>{p.d}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {(company || facts.length > 0) && (
                  <div style={{
                    padding: "14px 16px", borderRadius: 12, background: K.w, border: `1px solid ${K.b}`,
                    marginBottom: 14, animation: "fu 0.4s", boxShadow: SHADOW[1],
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: K.s, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>Source</div>
                    {company && <div style={{ fontSize: 13, fontWeight: 600, color: K.c, marginBottom: 6 }}>{company}</div>}
                    {facts.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {facts.map((f, i) => <span key={i} style={{
                          padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 500,
                          background: K.l, color: K.c,
                        }}>{f}</span>)}
                      </div>
                    )}
                  </div>
                )}
                <div style={{
                  borderRadius: 12, overflow: "hidden", border: `1px solid ${K.b}`,
                  background: K.w, animation: "fu 0.5s", boxShadow: SHADOW[1],
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: K.s, padding: "10px 14px", borderBottom: `1px solid ${K.b}`, textTransform: "uppercase", letterSpacing: "0.04em" }}>Aper\u00e7u</div>
                  <div style={{
                    height: 80, background: `linear-gradient(135deg, ${color}22, ${color}44)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <div style={{
                      width: "60%", height: 16, borderRadius: 8,
                      background: `linear-gradient(90deg, ${K.b}, ${K.a}, ${K.b})`,
                      backgroundSize: "400px 100%",
                      animation: pct > 10 ? "shimmer 1.8s ease infinite" : "none",
                    }} />
                  </div>
                  <div style={{ padding: "14px" }}>
                    {[0, 1].map((i) => (
                      <div key={i} style={{ marginBottom: 12, opacity: pct > (i + 1) * 25 ? 1 : 0.3, transition: "opacity 1s ease" }}>
                        <div style={{
                          width: i === 0 ? "40%" : "35%", height: 10, borderRadius: 5, marginBottom: 8,
                          background: `linear-gradient(90deg, ${K.b}, ${K.a}, ${K.b})`,
                          backgroundSize: "400px 100%",
                          animation: pct > (i + 1) * 25 ? "shimmer 1.8s ease infinite" : "none",
                        }} />
                        <div style={{ display: "flex", gap: 8 }}>
                          {[0, 1, 2].map((j) => (
                            <div key={j} style={{
                              flex: 1, height: 44, borderRadius: 8,
                              background: `linear-gradient(90deg, ${K.a}, ${K.b}33, ${K.a})`,
                              backgroundSize: "400px 100%",
                              animation: pct > (i + 1) * 25 + 10 ? "shimmer 1.8s ease infinite" : "none",
                            }} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RESULT */}
          {step === "result" && (<>
            <div style={{ display: "flex", borderBottom: `1px solid ${K.b}`, background: K.w, flexShrink: 0 }}>
              {[{ id: "preview", l: "Aper\u00e7u" }, { id: "chat", l: "Ajuster" }, { id: "code", l: "HTML" }].map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  flex: 1, padding: "12px 4px", border: "none", background: "transparent",
                  color: tab === t.id ? K.c : K.s,
                  fontSize: 13, fontWeight: tab === t.id ? 600 : 500, cursor: "pointer",
                  borderBottom: tab === t.id ? `2px solid ${K.c}` : "2px solid transparent",
                  transition: "all 0.2s ease-in-out", letterSpacing: "-0.01em",
                }}>{t.l}</button>
              ))}
            </div>
            <div style={{
              display: "flex", gap: 8, padding: isMobile ? "8px 12px" : "10px 16px", borderBottom: `1px solid ${K.b}`,
              background: K.w, flexShrink: 0, alignItems: "center", flexWrap: isMobile ? "wrap" : "nowrap",
            }}>
              {!isMobile && <div style={{
                flex: 1, fontSize: 12, color: K.s, fontWeight: 500, overflow: "hidden",
                textOverflow: "ellipsis", whiteSpace: "nowrap", letterSpacing: "-0.01em",
              }}>
                {props.filter((p) => sel.has(p.id)).map((p) => p.i + " " + p.t).join(" + ")}
              </div>}
              <button onClick={() => { setStep("proposals"); setHtml(""); setMsgs([]); setSugs([]); setPct(0); setDraft(""); setErr(""); }} style={{
                padding: "6px 12px", borderRadius: 8, border: `1px solid ${K.b}`,
                background: K.w, fontSize: 12, fontWeight: 500, cursor: "pointer",
                transition: "all 0.2s ease-in-out",
              }}>Modifier</button>
              <button onClick={cp} style={{
                padding: "6px 14px", borderRadius: 100, border: "none",
                background: copied ? K.ok : K.c, color: K.w,
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                transition: "all 0.2s ease-in-out",
              }}>{copied ? "\u2713 Copi\u00e9" : "Copier"}</button>
            </div>
            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              {tab === "preview" && (
                <div style={{ flex: 1, overflow: "auto", background: K.bg }}>
                  <iframe ref={iRef} style={{ width: "100%", height: "100%", border: "none", minHeight: 600 }} sandbox="allow-same-origin allow-scripts" title="Aper\u00e7u" />
                </div>
              )}
              {tab === "chat" && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                  <div style={{ flex: 1, overflow: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                    {msgs.map((m, i) => (
                      <div key={i} style={{
                        padding: "10px 14px", borderRadius: 12, fontSize: 13, lineHeight: "20px",
                        maxWidth: "85%", alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                        background: m.role === "user" ? K.c : K.a,
                        color: m.role === "user" ? K.w : K.t,
                        border: m.role === "user" ? "none" : `1px solid ${K.b}`,
                        wordBreak: "break-word", animation: "fu 0.2s", letterSpacing: "-0.01em",
                      }}>{m.text}</div>
                    ))}
                    {busy && <div style={{
                      padding: "10px 14px", borderRadius: 12, fontSize: 13, alignSelf: "flex-start",
                      background: K.a, border: `1px solid ${K.b}`, color: K.s,
                      animation: "pu 2.5s ease infinite",
                    }}>Modification\u2026</div>}
                    {sugs.length > 0 && !busy && (
                      <div style={{ alignSelf: "flex-start", maxWidth: "95%", animation: "fu 0.3s" }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: K.s, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Suggestions</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {sugs.map((s, i) => (
                            <button key={i} onClick={() => setDraft(s)} style={{
                              padding: "10px 14px", borderRadius: 8, border: `1px solid ${K.b}`,
                              background: K.w, color: K.t, fontSize: 13, cursor: "pointer",
                              textAlign: "left", lineHeight: "20px", letterSpacing: "-0.01em",
                              transition: "all 0.2s ease-in-out",
                            }}>{s}</button>
                          ))}
                        </div>
                      </div>
                    )}
                    {loadS && !busy && sugs.length === 0 && <div style={{ fontSize: 12, color: K.s, animation: "pu 2.5s ease infinite" }}>Suggestions\u2026</div>}
                    <div ref={eRef} />
                  </div>
                  <div style={{ padding: "12px 16px", borderTop: `1px solid ${K.b}`, display: "flex", gap: 10, flexShrink: 0, background: K.w }}>
                    <textarea rows={2} style={{
                      flex: 1, padding: "10px 14px", borderRadius: 8,
                      border: `1px solid ${draft ? K.c : K.b2}`, color: K.t,
                      fontSize: 13, outline: "none", resize: "none", lineHeight: "20px",
                      background: draft ? K.l : K.w, letterSpacing: "-0.01em",
                      transition: "all 0.2s ease-in-out",
                    }} placeholder="S\u00e9lectionne une suggestion ou \u00e9cris\u2026" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} />
                    <button disabled={busy || !draft.trim()} onClick={send} style={{
                      padding: "10px 20px", borderRadius: 100, border: "none",
                      background: (busy || !draft.trim()) ? K.a : K.c,
                      color: (busy || !draft.trim()) ? K.s : K.w,
                      fontSize: 14, fontWeight: 600, cursor: (busy || !draft.trim()) ? "not-allowed" : "pointer",
                      flexShrink: 0, alignSelf: "flex-end",
                      transition: "all 0.2s ease-in-out",
                    }}>Envoyer</button>
                  </div>
                </div>
              )}
              {tab === "code" && (
                <div style={{ flex: 1, overflow: "auto", padding: 16, background: K.a }}>
                  <pre style={{
                    background: K.w, border: `1px solid ${K.b}`, borderRadius: 12,
                    padding: 16, fontSize: 12, lineHeight: "20px", color: K.s,
                    whiteSpace: "pre-wrap", wordBreak: "break-all", boxShadow: SHADOW[1],
                  }}>{html}</pre>
                </div>
              )}
            </div>
          </>)}
        </div>
      </div>
    </div>
  );
}
