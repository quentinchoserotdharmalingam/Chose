import { useState, useRef, useEffect } from "react";
import { extractPdfText, analyzeAndPropose, generatePage, modifyPage, getSuggestions } from "./api.js";
import { PAGE_CSS } from "./page-styles.js";

// ── UTILS ──
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── HEYTEAM COLORS ──
const K = {
  bg: "#fafbfc", w: "#fff", a: "#f3f4f6", b: "#e5e7eb",
  t: "#111827", s: "#6b7280", m: "#9ca3af",
  c: "#E8604C", d: "#D4533F", l: "#FEF0ED",
  ok: "#059669", er: "#dc2626",
  sidebar: "#fff", sidebarActive: "#FEF0ED",
  tableHover: "#fafbfc", headerBg: "#f9fafb",
};

const PALETTE = ["#E8604C", "#6366f1", "#059669", "#d97706", "#0891b2", "#7c3aed"];

// ── SAMPLE DATA ──
const SAMPLE_FORMATIONS = [
  { id: 1, nom: "Test EdFlex", parcours: "Onboarding", filtres: "Tous les filtres", type: "Lien" },
  { id: 2, nom: "Lire le chapitre suivant : Comprendr…", parcours: "Programme de sen…", filtres: "Tous les filtres", type: "Fichier" },
  { id: 3, nom: "Lire le chapitre suivant : Bien gérer…", parcours: "Programme de sen…", filtres: "Tous les filtres", type: "Fichier" },
  { id: 4, nom: "Lire le chapitre suivant : LE PHISHING", parcours: "Programme de sen…", filtres: "Tous les filtres", type: "Fichier" },
  { id: 5, nom: "Lire le chapitre suivant : LE RGPD", parcours: "Programme de sen…", filtres: "Tous les filtres", type: "Fichier" },
  { id: 6, nom: "Energie Verte", parcours: "Onboarding", filtres: "Tous les filtres", type: "Lien" },
  { id: 7, nom: "Les règles d'or du développeur Heyteam", parcours: "Onboarding", filtres: "Tech", type: "Lien" },
];

const NAV_ITEMS = [
  { icon: "📄", label: "Documents" },
  { icon: "📚", label: "Formations", active: true },
  { icon: "📋", label: "Questionnaires" },
  { icon: "❓", label: "Quiz" },
  { icon: "📅", label: "Événements" },
  { icon: "💻", label: "Logiciels" },
  { icon: "🖥", label: "Équipements" },
  { icon: "📁", label: "Pièces administratives" },
  { icon: "📧", label: "Emails" },
  { icon: "⚡", label: "Actions" },
  { icon: "🏆", label: "Défis" },
];

// ── TYPE BADGE ──
function TypeBadge({ type }) {
  const colors = {
    "Lien": { bg: "#EFF6FF", color: "#3B82F6" },
    "Fichier": { bg: "#F0FDF4", color: "#22C55E" },
    "Page IA": { bg: K.l, color: K.c },
  };
  const c = colors[type] || { bg: K.a, color: K.s };
  return <span style={{ padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600, background: c.bg, color: c.color }}>{type}</span>;
}

// ── FILTRE BADGE ──
function FiltreBadge({ filtre }) {
  if (filtre === "Tous les filtres") return <span style={{ padding: "4px 10px", borderRadius: 6, fontSize: 12, background: K.a, color: K.s }}>{filtre}</span>;
  return <span style={{ padding: "4px 10px", borderRadius: 6, fontSize: 12, background: "#EDE9FE", color: "#7C3AED", fontWeight: 500 }}>{filtre}</span>;
}

// ── MAIN COMPONENT ──
export default function App() {
  // Wizard state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [step, setStep] = useState("upload");
  const [file, setFile] = useState(null);
  const [fname, setFname] = useState("");
  const [summary, setSummary] = useState("");
  const [company, setCompany] = useState("");
  const [facts, setFacts] = useState([]);
  const [ocrText, setOcrText] = useState("");
  const [props, setProps] = useState([]);
  const [sel, setSel] = useState(new Set());
  const [color, setColor] = useState("#E8604C");
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

  // Table state
  const [formations, setFormations] = useState(SAMPLE_FORMATIONS);
  const [search, setSearch] = useState("");

  const eRef = useRef(null);
  const iRef = useRef(null);
  const fRef = useRef(null);
  const timerRef = useRef(null);
  const abortRef = useRef(false);

  useEffect(() => { eRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  useEffect(() => {
    if (iRef.current && html) {
      try {
        const d = iRef.current.contentDocument;
        d.open();
        d.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${PAGE_CSS}</style></head><body>${html}</body></html>`);
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
      setPhase(2);
      const extractedText = await extractPdfText(file);
      if (abortRef.current) return;
      setOcrText(extractedText);

      const apiPromise = analyzeAndPropose(extractedText);

      // While API is working, show a quick preview of OCR content
      const lines = extractedText.split("\n").filter(l => l.trim().length > 3 && !l.includes("![") && !l.match(/^[\s#*\-|>]+$/) && !l.match(/^\s*img-?\d/i));
      const roughTitle = lines[0]?.substring(0, 80) || "Document";
      setCompany(roughTitle);
      await sleep(500);
      setSummary("Analyse IA en cours...");
      await sleep(400);
      // Show first few meaningful lines as "facts" while waiting
      const previewFacts = lines.slice(1, 5).map(l => l.substring(0, 40).trim()).filter(l => l && !l.includes("img"));
      for (let i = 0; i < previewFacts.length; i++) {
        await sleep(250);
        setFacts((prev) => [...prev, previewFacts[i]]);
      }

      const { analysis: sd, proposals: pd } = await apiPromise;
      if (abortRef.current) return;

      if (sd.c) setCompany(sd.c);
      if (sd.s) setSummary(sd.s);
      setFacts(sd.f || []);
      setPhase(3);
      await sleep(300);

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
    setGenPhase("Construction du hero…"); setErr("");
    abortRef.current = false;

    let animPct = 0;
    timerRef.current = setInterval(() => {
      const rem = 96 - animPct;
      if (rem > 50) animPct += 1.0 + Math.random() * 0.8;
      else if (rem > 20) animPct += 0.3 + Math.random() * 0.3;
      else animPct += 0.04 + Math.random() * 0.03;
      animPct = Math.min(animPct, 95.5);
      setPct(Math.round(animPct));
      if (animPct < 25) setGenPhase("Construction du hero…");
      else if (animPct < 55) setGenPhase("Sections principales…");
      else if (animPct < 85) setGenPhase("Finitions…");
      else setGenPhase("Presque prêt…");
    }, 250);

    try {
      const picks = props.filter((x) => sel.has(x.id));
      const context_str = picks.length === 1
        ? picks[0].r
        : `Fusionne ces thèmes en UNE page cohérente: ${picks.map((p) => `${p.t}: ${p.r}`).join(". ")}`;

      const docContext = [
        summary ? `Document: ${summary}` : "",
        company ? `Titre/Entreprise: ${company}` : "",
        facts.length > 0 ? `Points clés: ${facts.join(", ")}` : "",
        ocrText ? `\n\nCONTENU COMPLET DU DOCUMENT :\n${ocrText.substring(0, 6000)}` : "",
      ].filter(Boolean).join(". ");

      const result = await generatePage({ prompt: context_str, context: docContext, company, color });
      if (abortRef.current) return;

      clearInterval(timerRef.current);
      timerRef.current = null;
      setPct(100);
      setGenPhase("Terminé !");
      setHtml(result.html);

      setHist([
        { role: "user", content: `${docContext}\n\nConsigne: ${context_str}\n\nGénère la page complète.` },
        { role: "assistant", content: result.html },
      ]);
      setMsgs([{ role: "assistant", text: "Page générée ! Vous pouvez l'ajuster ci-dessous." }]);

      setTab("preview");
      setStep("result");
      doSugs(result.html);
    } catch (e) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      if (!abortRef.current) { setErr(e.message); setStep("proposals"); }
    }
  };

  // ── SUGGESTIONS ──
  const doSugs = async (h) => {
    setLoadS(true);
    try {
      const result = await getSuggestions(h);
      if (Array.isArray(result.suggestions)) setSugs(result.suggestions.slice(0, 4));
    } catch {
      setSugs(["Rendez le ton plus chaleureux", "Mettez les chiffres plus en avant", "Ajoutez une FAQ en bas de page", "Réorganisez les sections"]);
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
      setMsgs((p) => [...p, { role: "assistant", text: "Modifs appliquées !" }]);
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

  const closeWizard = () => {
    abortRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    // If we have a result, add it to formations
    if (step === "result" && html && company) {
      setFormations(prev => [{ id: Date.now(), nom: company, parcours: "Onboarding", filtres: "Tous les filtres", type: "Page IA" }, ...prev]);
    }
    setWizardOpen(false);
    setStep("upload"); setSel(new Set()); setFile(null); setFname("");
    setHtml(""); setMsgs([]); setHist([]); setErr("");
    setDraft(""); setTab("preview"); setSugs([]); setCompany("");
    setColor("#E8604C"); setSummary(""); setFacts([]); setOcrText(""); setProps([]);
    setPct(0); setPhase(0); setGenPhase("");
  };

  const openWizard = () => {
    setWizardOpen(true);
    setStep("upload");
  };

  const filteredFormations = formations.filter(f =>
    f.nom.toLowerCase().includes(search.toLowerCase()) ||
    f.parcours.toLowerCase().includes(search.toLowerCase())
  );

  // ── RENDER ──
  return (
    <div style={{ height: "100vh", background: K.bg, color: K.t, fontFamily: "'DM Sans',system-ui,-apple-system,sans-serif", display: "flex", overflow: "hidden" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes pu{0%,100%{opacity:.45}50%{opacity:1}}
@keyframes pop{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
@keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
@keyframes slideIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:${K.b};border-radius:3px}
textarea::placeholder,input::placeholder{color:${K.m}}input,textarea,button{font-family:inherit}
tr:hover td{background:${K.tableHover}}`}</style>

      {/* ═══ SIDEBAR ═══ */}
      <div style={{ width: 220, background: K.sidebar, borderRight: `1px solid ${K.b}`, display: "flex", flexDirection: "column", flexShrink: 0, height: "100%" }}>
        {/* Logo */}
        <div style={{ padding: "20px 16px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: K.c, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" fill="white" opacity="0.9"/>
              <path d="M12 6L6 9v6l6 3 6-3V9l-6-3z" fill="white"/>
            </svg>
          </div>
        </div>

        {/* Back link */}
        <div style={{ padding: "8px 16px 16px" }}>
          <div style={{ fontSize: 13, color: K.s, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 14 }}>←</span> Retour au menu
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: "0 8px", overflow: "auto" }}>
          {NAV_ITEMS.map((item) => (
            <div key={item.label} style={{
              padding: "10px 12px", borderRadius: 10, marginBottom: 2, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 10,
              background: item.active ? K.sidebarActive : "transparent",
              color: item.active ? K.c : K.t,
              fontWeight: item.active ? 600 : 400, fontSize: 14,
              transition: "background 0.15s",
            }}>
              <span style={{ fontSize: 16, width: 22, textAlign: "center" }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: "16px", borderTop: `1px solid ${K.b}`, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: K.a, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>👤</div>
          <span style={{ fontSize: 13, fontWeight: 500 }}>Nathaniel</span>
          <span style={{ marginLeft: "auto", fontSize: 12, color: K.m, cursor: "pointer" }}>⌃</span>
        </div>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* ═══ TABLE VIEW (hidden when wizard is open) ═══ */}
        {!wizardOpen && (<>
        {/* Header */}
        <div style={{ padding: "24px 32px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700 }}>Formations</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* Search */}
              <div style={{ position: "relative" }}>
                <input
                  type="text" placeholder="Rechercher" value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ padding: "9px 14px 9px 34px", borderRadius: 10, border: `1px solid ${K.b}`, fontSize: 14, width: 200, outline: "none", background: K.w, color: K.t }}
                />
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: K.m }}>🔍</span>
              </div>
              {/* Filter */}
              <button style={{ width: 38, height: 38, borderRadius: 10, border: `1px solid ${K.b}`, background: K.w, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: K.s }}>⊘</button>
              {/* Add button */}
              <button onClick={openWizard} style={{
                padding: "10px 20px", borderRadius: 10, border: "none",
                background: K.c, color: K.w, fontSize: 14, fontWeight: 600,
                cursor: "pointer", boxShadow: "0 2px 8px rgba(232,96,76,0.25)",
                transition: "transform 0.1s, box-shadow 0.1s",
              }}>Ajouter</button>
            </div>
          </div>

          {/* Results count */}
          <div style={{ fontSize: 14, fontWeight: 600, color: K.t, marginBottom: 0 }}>{filteredFormations.length} résultats</div>
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflow: "auto", padding: "12px 32px 32px" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, background: K.w, borderRadius: 12, overflow: "hidden", border: `1px solid ${K.b}` }}>
            <thead>
              <tr style={{ background: K.headerBg }}>
                {["Nom ↕", "Participants", "Parcours", "Filtres", "Type", "Bloqué", ""].map((h, i) => (
                  <th key={i} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: K.m, textTransform: "uppercase", letterSpacing: "0.03em", borderBottom: `1px solid ${K.b}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredFormations.map((f) => (
                <tr key={f.id} style={{ cursor: "pointer" }}>
                  <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 500, borderBottom: `1px solid ${K.b}`, maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", transition: "background 0.1s" }}>{f.nom}</td>
                  <td style={{ padding: "14px 16px", borderBottom: `1px solid ${K.b}`, transition: "background 0.1s" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: K.a, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: K.m, fontWeight: 600 }}>
                      {f.type === "Page IA" ? "✨" : ""}
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: K.t, borderBottom: `1px solid ${K.b}`, transition: "background 0.1s" }}>
                    {f.parcours === "Onboarding" ? (
                      <span>{f.parcours}</span>
                    ) : (
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ color: K.c }}>🎙</span> {f.parcours}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "14px 16px", borderBottom: `1px solid ${K.b}`, transition: "background 0.1s" }}>
                    <FiltreBadge filtre={f.filtres} />
                  </td>
                  <td style={{ padding: "14px 16px", borderBottom: `1px solid ${K.b}`, transition: "background 0.1s" }}>
                    <TypeBadge type={f.type} />
                  </td>
                  <td style={{ padding: "14px 16px", borderBottom: `1px solid ${K.b}`, transition: "background 0.1s" }}></td>
                  <td style={{ padding: "14px 16px", borderBottom: `1px solid ${K.b}`, textAlign: "center", transition: "background 0.1s" }}>
                    <span style={{ fontSize: 16, color: K.m, cursor: "pointer" }}>⋯</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 20 }}>
            <button style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${K.b}`, background: K.w, cursor: "pointer", fontSize: 14, color: K.m, display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
            {[1, 2, 3].map(n => (
              <button key={n} style={{ width: 32, height: 32, borderRadius: 8, border: n === 1 ? `1px solid ${K.c}` : `1px solid ${K.b}`, background: n === 1 ? K.l : K.w, color: n === 1 ? K.c : K.s, cursor: "pointer", fontSize: 13, fontWeight: n === 1 ? 600 : 400, display: "flex", alignItems: "center", justifyContent: "center" }}>{n}</button>
            ))}
            <button style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${K.b}`, background: K.w, cursor: "pointer", fontSize: 14, color: K.m, display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
          </div>
        </div>
        </>)}

        {/* ═══ WIZARD FULL PAGE ═══ */}
        {wizardOpen && (
          <div style={{
            flex: 1, background: K.w,
            display: "flex", flexDirection: "column",
            overflow: "hidden", animation: "fadeIn 0.2s ease",
          }}>
            {/* Drawer header */}
            <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${K.b}`, flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: K.l, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✨</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: K.t }}>Nouvelle Page IA</div>
                  <div style={{ fontSize: 11, color: K.m }}>
                    {step === "upload" && "Importez un PDF pour commencer"}
                    {step === "analyzing" && "Analyse en cours…"}
                    {step === "proposals" && "Choisissez les sections à générer"}
                    {step === "generating" && "Génération en cours…"}
                    {step === "result" && "Aperçu et ajustements"}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {step === "result" && (
                  <button onClick={cp} style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: copied ? K.ok : K.c, color: K.w, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{copied ? "✓ Copié" : "Copier HTML"}</button>
                )}
                <button onClick={closeWizard} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${K.b}`, background: K.w, cursor: "pointer", fontSize: 16, color: K.s, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
              </div>
            </div>

            {/* ── STEP: UPLOAD ── */}
            {step === "upload" && (
              <div style={{ flex: 1, overflow: "auto", padding: "48px 24px", display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
                <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
                  <div style={{ width: 64, height: 64, borderRadius: 16, background: K.l, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px" }}>📄</div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Transformez votre PDF</h2>
                  <p style={{ fontSize: 14, color: K.s, lineHeight: 1.6, marginBottom: 24 }}>L'IA analysera votre document et proposera 6 pages adaptées</p>

                  <div onClick={() => fRef.current?.click()} style={{
                    border: `2px dashed ${file ? K.c : K.b}`, borderRadius: 16, padding: "32px 20px",
                    cursor: "pointer", background: file ? K.l + "40" : K.bg, marginBottom: 16,
                    transition: "border-color 0.2s, background 0.2s",
                  }}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>{file ? "✅" : "📤"}</div>
                    <div style={{ fontSize: 14, color: file ? K.c : K.s, fontWeight: file ? 600 : 400 }}>
                      {file ? "Fichier prêt" : "Glissez votre PDF ici ou cliquez pour choisir"}
                    </div>
                    {fname && (
                      <div style={{ marginTop: 10, padding: "6px 12px", borderRadius: 8, background: K.w, fontSize: 12, color: K.c, display: "inline-flex", alignItems: "center", gap: 6, border: `1px solid ${K.b}` }}>
                        📎 {fname}
                      </div>
                    )}
                    <input ref={fRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={pick} />
                  </div>

                  {err && <div style={{ marginBottom: 14, padding: "10px 14px", borderRadius: 10, background: "#fef2f2", border: `1px solid ${K.er}`, color: K.er, fontSize: 13, textAlign: "left" }}>{err}</div>}

                  <button disabled={!file} onClick={analyze} style={{
                    width: "100%", padding: "14px", borderRadius: 12, border: "none",
                    background: file ? K.c : K.a, color: file ? K.w : K.m,
                    fontSize: 15, fontWeight: 700, cursor: file ? "pointer" : "not-allowed",
                    boxShadow: file ? "0 4px 14px rgba(232,96,76,0.25)" : "none",
                    transition: "background 0.2s, box-shadow 0.2s",
                  }}>Analyser le PDF</button>
                </div>
              </div>
            )}

            {/* ── STEP: ANALYZING ── */}
            {step === "analyzing" && (
              <div style={{ flex: 1, overflow: "auto", padding: "40px 32px" }}>
                <div style={{ maxWidth: 540, margin: "0 auto" }}>
                  <div style={{ textAlign: "center", marginBottom: 20 }}>
                    <div style={{ width: 40, height: 40, border: `3px solid ${K.b}`, borderTopColor: K.c, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
                    <div style={{ fontSize: 15, fontWeight: 600 }}>Analyse du document…</div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                    {[
                      { l: "Lecture du PDF", ok: phase > 1 },
                      { l: "Identification du contenu", ok: phase > 1 && (!!company || !!summary) },
                      { l: "Extraction des informations clés", ok: facts.length > 0 },
                      { l: "Préparation des propositions", ok: phase > 3 },
                    ].map((s, i) => {
                      const active = !s.ok && (
                        (i === 0 && phase === 1) ||
                        (i === 1 && phase === 2 && !company && !summary) ||
                        (i === 2 && phase === 2 && (!!company || !!summary) && facts.length === 0) ||
                        (i === 3 && phase === 3)
                      );
                      return (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, animation: `fu ${0.15 + i * 0.1}s ease` }}>
                          <div style={{
                            width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                            background: s.ok ? K.ok : (active ? K.c : K.b),
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 11, color: K.w, fontWeight: 700,
                            ...(active ? { animation: "pu 2.5s ease infinite" } : {}),
                          }}>{s.ok ? "✓" : (i + 1)}</div>
                          <span style={{ fontSize: 13, color: s.ok ? K.ok : (active ? K.t : K.m), fontWeight: active ? 600 : 400 }}>{s.l}</span>
                        </div>
                      );
                    })}
                  </div>

                  {(summary || company || facts.length > 0) && (
                    <div style={{ padding: "16px", borderRadius: 14, background: K.bg, border: `1px solid ${K.b}`, animation: "fu 0.4s ease" }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: K.m, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 10 }}>📄 Document analysé</div>
                      {(company || summary) && (
                        <div style={{ marginBottom: facts.length > 0 ? 12 : 0, animation: "fu 0.3s ease" }}>
                          {company && <div style={{ fontSize: 15, fontWeight: 700, color: K.c, marginBottom: 4, animation: "pop 0.3s ease" }}>{company}</div>}
                          {summary && <div style={{ fontSize: 13, color: K.t, lineHeight: 1.55 }}>{summary}</div>}
                        </div>
                      )}
                      {facts.length > 0 && (
                        <>
                          <div style={{ fontSize: 10, fontWeight: 600, color: K.m, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Points clés</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {facts.map((f, i) => (
                              <span key={i} style={{
                                padding: "5px 11px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                                background: [K.l, "#dcfce7", "#fef9c3", "#ffe4e6"][i % 4],
                                color: [K.c, "#166534", "#854d0e", "#be123c"][i % 4],
                                animation: "pop 0.3s ease",
                              }}>{f}</span>
                            ))}
                          </div>
                        </>
                      )}
                      {phase < 4 && phase >= 2 && (
                        <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${K.b}`, display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 12, height: 12, border: `2px solid ${K.b}`, borderTopColor: K.c, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                          <span style={{ fontSize: 11, color: K.m, animation: "pu 2.5s ease infinite" }}>
                            {phase < 3 ? "Analyse en cours…" : "Création de 6 propositions de pages…"}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── STEP: PROPOSALS ── */}
            {step === "proposals" && (
              <div style={{ flex: 1, overflow: "auto", padding: "24px 32px" }}>
                <div style={{ maxWidth: 700, margin: "0 auto" }}>
                  {/* Summary card */}
                  <div style={{ padding: "14px 16px", borderRadius: 12, background: K.l, marginBottom: 14, animation: "fu 0.3s" }}>
                    {company && <div style={{ fontSize: 14, fontWeight: 700, color: K.c, marginBottom: 3 }}>{company}</div>}
                    <div style={{ fontSize: 13, color: K.t, lineHeight: 1.55 }}>{summary}</div>
                    {facts.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
                        {facts.map((f, i) => <span key={i} style={{ padding: "3px 8px", borderRadius: 16, fontSize: 10, fontWeight: 600, background: K.w, color: K.c }}>{f}</span>)}
                      </div>
                    )}
                  </div>

                  {/* Color picker */}
                  <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 14, padding: "8px 12px", borderRadius: 10, background: K.bg, border: `1px solid ${K.b}` }}>
                    <span style={{ fontSize: 12, color: K.s, fontWeight: 600 }}>Couleur :</span>
                    {PALETTE.map((c) => (
                      <div key={c} onClick={() => setColor(c)} style={{ width: 24, height: 24, borderRadius: 6, background: c, cursor: "pointer", border: color === c ? "2.5px solid #111" : "2px solid transparent", transition: "transform 0.1s", transform: color === c ? "scale(1.15)" : "scale(1)" }} />
                    ))}
                  </div>

                  {err && <div style={{ marginBottom: 14, padding: "10px 14px", borderRadius: 10, background: "#fef2f2", border: `1px solid ${K.er}`, color: K.er, fontSize: 13 }}>{err}</div>}

                  {/* Generate button */}
                  <button disabled={sel.size === 0} onClick={generate} style={{
                    marginBottom: 14, width: "100%", padding: "14px", borderRadius: 12, border: "none",
                    background: sel.size > 0 ? K.c : K.a,
                    color: sel.size > 0 ? K.w : K.m, fontSize: 15, fontWeight: 700,
                    cursor: sel.size > 0 ? "pointer" : "not-allowed",
                    boxShadow: sel.size > 0 ? "0 4px 14px rgba(232,96,76,0.25)" : "none",
                    position: "sticky", top: 0, zIndex: 10,
                  }}>
                    {sel.size === 0 ? "Sélectionnez au moins 1" : sel.size === 1 ? "Générer la page" : `Fusionner (${sel.size})`}
                  </button>

                  {/* Proposal cards */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
                    {props.map((pr, idx) => {
                      const on = sel.has(pr.id);
                      return (
                        <button key={pr.id} onClick={() => tog(pr.id)} style={{
                          display: "flex", alignItems: "flex-start", gap: 12, padding: "14px",
                          borderRadius: 12, border: on ? `2px solid ${K.c}` : `1.5px solid ${K.b}`,
                          background: on ? K.l + "60" : K.w, cursor: "pointer", textAlign: "left",
                          animation: `fu ${0.1 + idx * 0.06}s ease`, transition: "border-color 0.15s, background 0.15s",
                        }}>
                          <div style={{
                            width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
                            border: on ? `2px solid ${K.c}` : `2px solid ${K.b}`,
                            background: on ? K.c : "transparent",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 12, color: K.w, fontWeight: 700,
                          }}>{on && "✓"}</div>
                          <div style={{ fontSize: 22, flexShrink: 0 }}>{pr.i}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>{pr.t}</div>
                            <div style={{ fontSize: 12, color: K.s, lineHeight: 1.5 }}>{pr.d}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP: GENERATING ── */}
            {step === "generating" && (
              <div style={{ flex: 1, overflow: "auto", padding: "40px 32px", background: K.bg }}>
                <div style={{ maxWidth: 600, margin: "0 auto" }}>
                  {/* Progress */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{genPhase}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: K.c }}>{pct}%</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 4, background: K.b, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 4, background: K.c, width: `${pct}%`, transition: "width 0.4s ease" }} />
                    </div>
                  </div>

                  {/* Selected proposals */}
                  <div style={{ padding: "16px", borderRadius: 14, background: K.w, border: `1px solid ${K.b}`, marginBottom: 14, animation: "fu 0.3s" }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: K.m, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 10 }}>🎨 Page en cours de création</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {props.filter((p) => sel.has(p.id)).map((p) => (
                        <div key={p.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                          <span style={{ fontSize: 20 }}>{p.i}</span>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{p.t}</div>
                            <div style={{ fontSize: 12, color: K.s, lineHeight: 1.4 }}>{p.d}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Source info */}
                  {(company || facts.length > 0) && (
                    <div style={{ padding: "14px", borderRadius: 14, background: K.w, border: `1px solid ${K.b}`, marginBottom: 14, animation: "fu 0.4s" }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: K.m, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>📄 Source</div>
                      {company && <div style={{ fontSize: 13, fontWeight: 600, color: K.c, marginBottom: 4 }}>{company}</div>}
                      {facts.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                          {facts.map((f, i) => <span key={i} style={{ padding: "3px 8px", borderRadius: 16, fontSize: 10, fontWeight: 600, background: K.l, color: K.c }}>{f}</span>)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Skeleton preview */}
                  <div style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${K.b}`, background: K.w, animation: "fu 0.5s" }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: K.m, padding: "10px 14px", borderBottom: `1px solid ${K.b}`, textTransform: "uppercase", letterSpacing: "0.04em" }}>Aperçu</div>
                    <div style={{ height: 80, background: `linear-gradient(135deg, ${color}22, ${color}44)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: "60%", height: 16, borderRadius: 8, background: `linear-gradient(90deg, ${K.b}, ${K.a}, ${K.b})`, backgroundSize: "400px 100%", animation: pct > 10 ? "shimmer 1.8s ease infinite" : "none" }} />
                    </div>
                    <div style={{ padding: "14px" }}>
                      {[0, 1].map((i) => (
                        <div key={i} style={{ marginBottom: 12, opacity: pct > (i + 1) * 25 ? 1 : 0.3, transition: "opacity 1s ease" }}>
                          <div style={{ width: i === 0 ? "40%" : "35%", height: 10, borderRadius: 5, marginBottom: 8, background: `linear-gradient(90deg, ${K.b}, ${K.a}, ${K.b})`, backgroundSize: "400px 100%", animation: pct > (i + 1) * 25 ? "shimmer 1.8s ease infinite" : "none" }} />
                          <div style={{ display: "flex", gap: 8 }}>
                            {[0, 1, 2].map((j) => (
                              <div key={j} style={{ flex: 1, height: 40, borderRadius: 8, background: `linear-gradient(90deg, ${K.a}, ${K.b}33, ${K.a})`, backgroundSize: "400px 100%", animation: pct > (i + 1) * 25 + 10 ? "shimmer 1.8s ease infinite" : "none" }} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP: RESULT ── */}
            {step === "result" && (<>
              {/* Context bar */}
              <div style={{ display: "flex", gap: 8, padding: "8px 20px", borderBottom: `1px solid ${K.b}`, background: K.bg, flexShrink: 0, alignItems: "center" }}>
                <div style={{ flex: 1, fontSize: 12, color: K.s, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {props.filter((p) => sel.has(p.id)).map((p) => p.i + " " + p.t).join(" + ")}
                </div>
                {/* Tabs inline */}
                <div style={{ display: "flex", gap: 2, background: K.a, borderRadius: 8, padding: 2 }}>
                  {[{ id: "preview", l: "Aperçu" }, { id: "code", l: "HTML" }].map((t) => (
                    <button key={t.id} onClick={() => setTab(t.id)} style={{
                      padding: "6px 14px", border: "none", borderRadius: 6,
                      background: tab === t.id || (tab === "chat" && t.id === "preview") ? K.w : "transparent",
                      color: tab === t.id || (tab === "chat" && t.id === "preview") ? K.t : K.m,
                      fontSize: 12, fontWeight: tab === t.id ? 600 : 500,
                      cursor: "pointer", boxShadow: tab === t.id || (tab === "chat" && t.id === "preview") ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                    }}>{t.l}</button>
                  ))}
                </div>
                <button onClick={() => { setStep("proposals"); setHtml(""); setMsgs([]); setSugs([]); setPct(0); setDraft(""); setErr(""); }} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${K.b}`, background: K.w, fontSize: 12, fontWeight: 500, cursor: "pointer", color: K.s }}>Regénérer</button>
              </div>

              {/* Side-by-side layout: Preview/Code on left, Chat on right */}
              <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>
                {/* Left: Preview or Code */}
                <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  {(tab === "preview" || tab === "chat") && (
                    <div style={{ flex: 1, overflow: "auto", background: "#eef0f2" }}>
                      <iframe ref={iRef} style={{ width: "100%", height: "100%", border: "none", minHeight: 600 }} sandbox="allow-same-origin allow-scripts" title="Aperçu" />
                    </div>
                  )}
                  {tab === "code" && (
                    <div style={{ flex: 1, overflow: "auto", padding: 20, background: K.bg }}>
                      <pre style={{ background: K.w, border: `1px solid ${K.b}`, borderRadius: 12, padding: 16, fontSize: 12, lineHeight: 1.55, color: K.s, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{html}</pre>
                    </div>
                  )}
                </div>

                {/* Right: Chat panel */}
                <div style={{ width: 360, flexShrink: 0, borderLeft: `1px solid ${K.b}`, display: "flex", flexDirection: "column", background: K.w }}>
                  <div style={{ padding: "12px 16px", borderBottom: `1px solid ${K.b}`, flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: K.t }}>Ajuster la page</div>
                    <div style={{ fontSize: 11, color: K.m }}>Demandez des modifications via le chat</div>
                  </div>
                  <div style={{ flex: 1, overflow: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                    {msgs.map((m, i) => (
                      <div key={i} style={{
                        padding: "10px 14px", borderRadius: 12, fontSize: 13, lineHeight: 1.55,
                        maxWidth: "85%", alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                        background: m.role === "user" ? K.c : K.bg,
                        color: m.role === "user" ? K.w : K.t,
                        border: m.role === "user" ? "none" : `1px solid ${K.b}`,
                        wordBreak: "break-word", animation: "fu 0.2s",
                      }}>{m.text}</div>
                    ))}
                    {busy && <div style={{ padding: "10px 14px", borderRadius: 12, fontSize: 13, alignSelf: "flex-start", background: K.bg, border: `1px solid ${K.b}`, color: K.m, animation: "pu 2.5s ease infinite" }}>Modification…</div>}

                    {sugs.length > 0 && !busy && (
                      <div style={{ animation: "fu 0.3s" }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: K.m, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Suggestions</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {sugs.map((s, i) => (
                            <button key={i} onClick={() => { setMsgs((p) => [...p, { role: "user", text: s }]); setSugs([]); modify(s); }} style={{
                              padding: "10px 14px", borderRadius: 12, border: `1px solid ${K.b}`,
                              background: K.w, color: K.t, fontSize: 13, cursor: "pointer",
                              textAlign: "left", lineHeight: 1.5,
                            }}>{s}</button>
                          ))}
                        </div>
                      </div>
                    )}
                    {loadS && !busy && sugs.length === 0 && <div style={{ fontSize: 11, color: K.m, animation: "pu 2.5s ease infinite" }}>Chargement des suggestions…</div>}
                    <div ref={eRef} />
                  </div>

                  <div style={{ padding: "12px 14px", borderTop: `1px solid ${K.b}`, display: "flex", gap: 10, flexShrink: 0, background: K.w }}>
                    <textarea rows={1} style={{
                      flex: 1, padding: "10px 12px", borderRadius: 10,
                      border: `1px solid ${draft ? K.c : K.b}`, color: K.t,
                      fontSize: 14, outline: "none", resize: "none", lineHeight: 1.45,
                      background: draft ? K.l + "40" : K.w,
                      transition: "border-color 0.15s",
                    }} placeholder="Décrivez votre modification…" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} />
                    <button disabled={busy || !draft.trim()} onClick={send} style={{
                      padding: "10px 16px", borderRadius: 10, border: "none",
                      background: (busy || !draft.trim()) ? K.a : K.c,
                      color: (busy || !draft.trim()) ? K.m : K.w,
                      fontSize: 16, cursor: (busy || !draft.trim()) ? "not-allowed" : "pointer",
                      flexShrink: 0, alignSelf: "flex-end",
                    }}>➤</button>
                  </div>
                </div>
              </div>
            </>)}

            {/* Save button for result step */}
            {step === "result" && (
              <div style={{ padding: "12px 20px", borderTop: `1px solid ${K.b}`, background: K.w, flexShrink: 0, display: "flex", gap: 10 }}>
                <button onClick={() => { setStep("proposals"); setHtml(""); setMsgs([]); setSugs([]); setPct(0); setDraft(""); setErr(""); }} style={{ flex: 1, padding: "12px", borderRadius: 10, border: `1px solid ${K.b}`, background: K.w, fontSize: 14, fontWeight: 600, cursor: "pointer", color: K.s }}>Recommencer</button>
                <button onClick={closeWizard} style={{ flex: 2, padding: "12px", borderRadius: 10, border: "none", background: K.c, color: K.w, fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 8px rgba(232,96,76,0.25)" }}>Enregistrer la formation</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
