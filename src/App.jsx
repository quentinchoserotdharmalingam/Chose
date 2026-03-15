import { useState, useRef, useEffect } from "react";
import { extractPdfText, analyzeText, proposePdf, generatePage, modifyPage, getSuggestions } from "./api.js";

// ── UTILS ──
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── COLORS ──
const K = {
  bg: "#fafbfc", w: "#fff", a: "#f3f4f6", b: "#e5e7eb",
  t: "#111827", s: "#6b7280", m: "#9ca3af",
  c: "#6366f1", d: "#4f46e5", l: "#e0e7ff",
  ok: "#059669", er: "#dc2626",
};

const PALETTE = ["#6366f1", "#059669", "#d97706", "#dc2626", "#0891b2", "#7c3aed"];

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
  const [color, setColor] = useState("#6366f1");
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
        d.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;padding:16px;font-family:system-ui,sans-serif;background:#f8f9fa;}</style></head><body>${html}</body></html>`);
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

      // Step 1: Mistral OCR extracts text client-side
      const extractedText = await extractPdfText(file);
      if (abortRef.current) return;

      // Step 2: Analyze + Propose IN PARALLEL (both use Haiku = fast)
      const [sd, proposeResult] = await Promise.all([
        analyzeText(extractedText),
        proposePdf(extractedText),
      ]);
      if (abortRef.current) return;

      // Fast reveal (~1s total)
      if (sd.c) setCompany(sd.c);
      if (sd.s) setSummary(sd.s);
      setFacts(sd.f || []);
      await sleep(300);
      if (abortRef.current) return;

      setPhase(3);

      // Proposals already loaded in parallel
      const pd = proposeResult;
      setProps((pd.p || []).map((p, i) => ({ ...p, id: `p${i}` })));
      setPhase(4);
      setStep("proposals");
    } catch (e) {
      if (!abortRef.current) { setErr(e.message); setStep("upload"); setPhase(0); }
    }
  };

  // ── GENERATE: via backend ──
  const generate = async () => {
    if (sel.size === 0) return;
    setStep("generating"); setSugs([]); setHtml(""); setPct(0);
    setGenPhase("Construction du hero…"); setErr("");
    abortRef.current = false;

    // Smooth progress 0->95% over ~15s
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
      setGenPhase("Terminé !");
      setHtml(result.html);

      setHist([
        { role: "user", content: `${docContext}\n\nConsigne: ${context_str}\n\nGénère la page complète.` },
        { role: "assistant", content: result.html },
      ]);
      setMsgs([{ role: "assistant", text: "Page générée ! Tu peux l’ajuster ci-dessous." }]);

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
      setSugs(["Rends le ton plus chaleureux", "Mets les chiffres plus en avant", "Ajoute une FAQ en bas de page", "Réorganise les sections"]);
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

  const rst = () => {
    abortRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    setStep("upload"); setSel(new Set()); setFile(null); setFname("");
    setHtml(""); setMsgs([]); setHist([]); setErr("");
    setDraft(""); setTab("preview"); setSugs([]); setCompany("");
    setColor("#6366f1"); setSummary(""); setFacts([]); setProps([]);
    setPct(0); setPhase(0); setGenPhase("");
  };

  // ── RENDER ──
  return (
    <div style={{ height: "100vh", background: K.bg, color: K.t, fontFamily: "'DM Sans',system-ui,sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes pu{0%,100%{opacity:.45}50%{opacity:1}}
@keyframes pop{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
@keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:${K.b};border-radius:3px}
textarea::placeholder,input::placeholder{color:${K.m}}input,textarea,button{font-family:inherit}`}</style>

      {/* HEADER */}
      <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${K.b}`, background: K.w, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg,${K.c},${K.d})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: K.w }}>H</div>
          <span style={{ fontSize: 15, fontWeight: 700 }}>PageGen</span>
          <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 10, background: K.l, color: K.c }}>proto</span>
        </div>
        {!["upload", "analyzing", "generating"].includes(step) && (
          <button onClick={rst} style={{ fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 8, border: `1px solid ${K.b}`, background: K.w, color: K.t, cursor: "pointer" }}>{"↩"} Nouveau</button>
        )}
      </div>

      {/* UPLOAD */}
      {step === "upload" && (
        <div style={{ flex: 1, overflow: "auto", padding: "20px 16px", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 40 }}>
          <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{"✨"}</div>
            <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Transforme ton PDF</h1>
            <p style={{ fontSize: 13, color: K.s, lineHeight: 1.5, marginBottom: 20 }}>L'IA analysera ton document et proposera 6 pages adaptées.</p>
            <div onClick={() => fRef.current?.click()} style={{ border: `2px dashed ${file ? K.c : K.b}`, borderRadius: 14, padding: "28px 16px", cursor: "pointer", background: file ? K.l + "40" : K.w, marginBottom: 12 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{"📄"}</div>
              <div style={{ fontSize: 14, color: file ? K.c : K.s, fontWeight: file ? 600 : 400 }}>{file ? "Fichier prêt ✓" : "Choisis ton PDF"}</div>
              {fname && <div style={{ marginTop: 8, padding: "5px 10px", borderRadius: 6, background: K.a, fontSize: 11, color: K.c, display: "inline-block", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{"📎"} {fname}</div>}
              <input ref={fRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={pick} />
            </div>
            {err && <div style={{ marginBottom: 12, padding: "10px", borderRadius: 8, background: "#fef2f2", border: `1px solid ${K.er}`, color: K.er, fontSize: 13 }}>{err}</div>}
            <button disabled={!file} onClick={analyze} style={{ width: "100%", padding: "15px", borderRadius: 12, border: "none", background: file ? `linear-gradient(135deg,${K.c},${K.d})` : K.a, color: file ? K.w : K.m, fontSize: 15, fontWeight: 700, cursor: file ? "pointer" : "not-allowed", boxShadow: file ? "0 4px 14px rgba(99,102,241,0.3)" : "none" }}>{"🔍"} Analyser le PDF</button>
          </div>
        </div>
      )}

      {/* ANALYZING */}
      {step === "analyzing" && (
        <div style={{ flex: 1, overflow: "auto", padding: "24px 16px" }}>
          <div style={{ maxWidth: 400, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, border: `3px solid ${K.b}`, borderTopColor: K.c, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
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
                      width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                      background: s.ok ? K.ok : (active ? K.c : K.b),
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, color: K.w, fontWeight: 700,
                      ...(active ? { animation: "pu 2.5s ease infinite" } : {}),
                    }}>{s.ok ? "✓" : (i + 1)}</div>
                    <span style={{ fontSize: 13, color: s.ok ? K.ok : (active ? K.t : K.m), fontWeight: active ? 600 : 400 }}>{s.l}</span>
                  </div>
                );
              })}
            </div>
            {(summary || company || facts.length > 0) && (
              <div style={{ padding: "16px", borderRadius: 14, background: K.w, border: `1px solid ${K.b}`, animation: "fu 0.4s ease" }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: K.m, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>{"📄"} Document analysé</div>
                {(company || summary) && (
                  <div style={{ marginBottom: facts.length > 0 ? 12 : 0, animation: "fu 0.3s ease" }}>
                    {company && <div style={{ fontSize: 15, fontWeight: 700, color: K.c, marginBottom: 4, animation: "pop 0.3s ease" }}>{company}</div>}
                    {summary && <div style={{ fontSize: 13, color: K.t, lineHeight: 1.5 }}>{summary}</div>}
                  </div>
                )}
                {facts.length > 0 && (
                  <>
                    <div style={{ fontSize: 10, fontWeight: 600, color: K.m, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Points clés identifiés</div>
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

      {/* PROPOSALS */}
      {step === "proposals" && (
        <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
          <div style={{ maxWidth: 460, margin: "0 auto" }}>
            <div style={{ padding: "12px 14px", borderRadius: 12, background: K.l, marginBottom: 12, animation: "fu 0.3s" }}>
              {company && <div style={{ fontSize: 14, fontWeight: 700, color: K.c, marginBottom: 2 }}>{company}</div>}
              <div style={{ fontSize: 13, color: K.t, lineHeight: 1.5 }}>{summary}</div>
              {facts.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6 }}>
                  {facts.map((f, i) => <span key={i} style={{ padding: "3px 8px", borderRadius: 16, fontSize: 10, fontWeight: 600, background: K.w, color: K.c }}>{f}</span>)}
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 12, padding: "6px 10px", borderRadius: 8, background: K.w, border: `1px solid ${K.b}` }}>
              <span style={{ fontSize: 11, color: K.s, fontWeight: 600 }}>Couleur :</span>
              {PALETTE.map((c) => (
                <div key={c} onClick={() => setColor(c)} style={{ width: 22, height: 22, borderRadius: 5, background: c, cursor: "pointer", border: color === c ? "2.5px solid #111" : "2px solid transparent" }} />
              ))}
            </div>
            {err && <div style={{ marginBottom: 12, padding: "10px", borderRadius: 8, background: "#fef2f2", border: `1px solid ${K.er}`, color: K.er, fontSize: 13 }}>{err}</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {props.map((pr, idx) => {
                const on = sel.has(pr.id);
                return (
                  <button key={pr.id} onClick={() => tog(pr.id)} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px", borderRadius: 12, border: on ? `2px solid ${K.c}` : `1.5px solid ${K.b}`, background: on ? K.l + "60" : K.w, cursor: "pointer", textAlign: "left", animation: `fu ${0.1 + idx * 0.06}s ease` }}>
                    <div style={{ width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 2, border: on ? `2px solid ${K.c}` : `2px solid ${K.b}`, background: on ? K.c : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: K.w, fontWeight: 700 }}>{on && "✓"}</div>
                    <div style={{ fontSize: 20, flexShrink: 0 }}>{pr.i}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{pr.t}</div>
                      <div style={{ fontSize: 11, color: K.s, lineHeight: 1.5 }}>{pr.d}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            <button disabled={sel.size === 0} onClick={generate} style={{ marginTop: 14, width: "100%", padding: "15px", borderRadius: 12, border: "none", background: sel.size > 0 ? `linear-gradient(135deg,${K.c},${K.d})` : K.a, color: sel.size > 0 ? K.w : K.m, fontSize: 15, fontWeight: 700, cursor: sel.size > 0 ? "pointer" : "not-allowed", boxShadow: sel.size > 0 ? "0 4px 14px rgba(99,102,241,0.3)" : "none" }}>
              {sel.size === 0 ? "Sélectionne au moins 1" : sel.size === 1 ? "✨ Générer" : `✨ Fusionner (${sel.size})`}
            </button>
          </div>
        </div>
      )}

      {/* GENERATING */}
      {step === "generating" && (
        <div style={{ flex: 1, overflow: "auto", padding: "20px 16px", background: K.a }}>
          <div style={{ maxWidth: 420, margin: "0 auto" }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{genPhase}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: K.c }}>{pct}%</span>
              </div>
              <div style={{ height: 5, borderRadius: 3, background: K.b, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${K.c}, ${K.d})`, width: `${pct}%`, transition: "width 0.4s ease" }} />
              </div>
            </div>
            <div style={{ padding: "14px", borderRadius: 12, background: K.w, border: `1px solid ${K.b}`, marginBottom: 12, animation: "fu 0.3s" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: K.m, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>{"🎨"} Page en cours de création</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {props.filter((p) => sel.has(p.id)).map((p) => (
                  <div key={p.id} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 18 }}>{p.i}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{p.t}</div>
                      <div style={{ fontSize: 11, color: K.s, lineHeight: 1.4 }}>{p.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {(company || facts.length > 0) && (
              <div style={{ padding: "12px 14px", borderRadius: 12, background: K.w, border: `1px solid ${K.b}`, marginBottom: 12, animation: "fu 0.4s" }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: K.m, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>{"📄"} Source</div>
                {company && <div style={{ fontSize: 13, fontWeight: 600, color: K.c, marginBottom: 4 }}>{company}</div>}
                {facts.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {facts.map((f, i) => <span key={i} style={{ padding: "3px 8px", borderRadius: 16, fontSize: 10, fontWeight: 600, background: K.l, color: K.c }}>{f}</span>)}
                  </div>
                )}
              </div>
            )}
            <div style={{ borderRadius: 12, overflow: "hidden", border: `1px solid ${K.b}`, background: K.w, animation: "fu 0.5s" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: K.m, padding: "8px 12px", borderBottom: `1px solid ${K.b}`, textTransform: "uppercase", letterSpacing: "0.04em" }}>Aperçu</div>
              <div style={{ height: 80, background: `linear-gradient(135deg, ${color}22, ${color}44)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: "60%", height: 16, borderRadius: 8, background: `linear-gradient(90deg, ${K.b}, ${K.a}, ${K.b})`, backgroundSize: "400px 100%", animation: pct > 10 ? "shimmer 1.8s ease infinite" : "none" }} />
              </div>
              <div style={{ padding: "12px" }}>
                {[0, 1].map((i) => (
                  <div key={i} style={{ marginBottom: 10, opacity: pct > (i + 1) * 25 ? 1 : 0.3, transition: "opacity 1s ease" }}>
                    <div style={{ width: i === 0 ? "40%" : "35%", height: 10, borderRadius: 5, marginBottom: 8, background: `linear-gradient(90deg, ${K.b}, ${K.a}, ${K.b})`, backgroundSize: "400px 100%", animation: pct > (i + 1) * 25 ? "shimmer 1.8s ease infinite" : "none" }} />
                    <div style={{ display: "flex", gap: 8 }}>
                      {[0, 1, 2].map((j) => (
                        <div key={j} style={{ flex: 1, height: 40, borderRadius: 8, background: `linear-gradient(90deg, ${K.a}, ${K.b}33, ${K.a})`, backgroundSize: "400px 100%", animation: pct > (i + 1) * 25 + 10 ? "shimmer 1.8s ease infinite" : "none" }} />
                      ))}
                    </div>
                  </div>
                ))}
                <div style={{ width: "50%", height: 8, borderRadius: 4, margin: "8px auto 4px", opacity: pct > 75 ? 1 : 0.2, transition: "opacity 1s ease", background: `linear-gradient(90deg, ${K.b}, ${K.a}, ${K.b})`, backgroundSize: "400px 100%", animation: pct > 75 ? "shimmer 1.8s ease infinite" : "none" }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RESULT */}
      {step === "result" && (<>
        <div style={{ display: "flex", borderBottom: `1px solid ${K.b}`, background: K.w, flexShrink: 0 }}>
          {[{ id: "preview", l: "👁 Aperçu" }, { id: "chat", l: "💬 Ajuster" }, { id: "code", l: "</> HTML" }].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "11px 4px", border: "none", background: "transparent", color: tab === t.id ? K.c : K.m, fontSize: 13, fontWeight: tab === t.id ? 700 : 500, cursor: "pointer", borderBottom: tab === t.id ? `2px solid ${K.c}` : "2px solid transparent" }}>{t.l}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, padding: "7px 12px", borderBottom: `1px solid ${K.b}`, background: K.w, flexShrink: 0, alignItems: "center" }}>
          <div style={{ flex: 1, fontSize: 11, color: K.s, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {props.filter((p) => sel.has(p.id)).map((p) => p.i + " " + p.t).join(" + ")}
          </div>
          <button onClick={() => { setStep("proposals"); setHtml(""); setMsgs([]); setSugs([]); setPct(0); setDraft(""); setErr(""); }} style={{ padding: "6px 9px", borderRadius: 7, border: `1px solid ${K.b}`, background: K.w, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>{"🔄"}</button>
          <button onClick={cp} style={{ padding: "6px 11px", borderRadius: 7, border: "none", background: copied ? K.ok : K.c, color: K.w, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>{copied ? "✓" : "📋 Copier"}</button>
        </div>
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {tab === "preview" && (
            <div style={{ flex: 1, overflow: "auto", background: "#eef0f2" }}>
              <iframe ref={iRef} style={{ width: "100%", height: "100%", border: "none", minHeight: 600 }} sandbox="allow-same-origin allow-scripts" title="Aperçu" />
            </div>
          )}
          {tab === "chat" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ flex: 1, overflow: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                {msgs.map((m, i) => (
                  <div key={i} style={{ padding: "9px 12px", borderRadius: 11, fontSize: 13, lineHeight: 1.5, maxWidth: "85%", alignSelf: m.role === "user" ? "flex-end" : "flex-start", background: m.role === "user" ? K.c : K.a, color: m.role === "user" ? K.w : K.t, border: m.role === "user" ? "none" : `1px solid ${K.b}`, wordBreak: "break-word", animation: "fu 0.2s" }}>{m.text}</div>
                ))}
                {busy && <div style={{ padding: "9px 12px", borderRadius: 11, fontSize: 13, alignSelf: "flex-start", background: K.a, border: `1px solid ${K.b}`, color: K.m, animation: "pu 2.5s ease infinite" }}>Modification…</div>}
                {sugs.length > 0 && !busy && (
                  <div style={{ alignSelf: "flex-start", maxWidth: "95%", animation: "fu 0.3s" }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: K.m, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 5 }}>{"💡"} Suggestions</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {sugs.map((s, i) => (
                        <button key={i} onClick={() => setDraft(s)} style={{ padding: "8px 11px", borderRadius: 9, border: `1px solid ${K.b}`, background: K.w, color: K.t, fontSize: 12, cursor: "pointer", textAlign: "left", lineHeight: 1.4 }}>{s}</button>
                      ))}
                    </div>
                  </div>
                )}
                {loadS && !busy && sugs.length === 0 && <div style={{ fontSize: 11, color: K.m, animation: "pu 2.5s ease infinite" }}>Suggestions…</div>}
                <div ref={eRef} />
              </div>
              <div style={{ padding: "10px 12px", borderTop: `1px solid ${K.b}`, display: "flex", gap: 8, flexShrink: 0, background: K.w }}>
                <textarea rows={2} style={{ flex: 1, padding: "10px", borderRadius: 10, border: `1px solid ${draft ? K.c : K.b}`, color: K.t, fontSize: 14, outline: "none", resize: "none", lineHeight: 1.4, background: draft ? K.l + "40" : K.w }} placeholder="Sélectionne une suggestion ou écris…" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} />
                <button disabled={busy || !draft.trim()} onClick={send} style={{ padding: "10px 15px", borderRadius: 10, border: "none", background: (busy || !draft.trim()) ? K.a : K.c, color: (busy || !draft.trim()) ? K.m : K.w, fontSize: 16, cursor: (busy || !draft.trim()) ? "not-allowed" : "pointer", flexShrink: 0, alignSelf: "flex-end" }}>{"➤"}</button>
              </div>
            </div>
          )}
          {tab === "code" && (
            <div style={{ flex: 1, overflow: "auto", padding: 12, background: K.a }}>
              <pre style={{ background: K.w, border: `1px solid ${K.b}`, borderRadius: 10, padding: 12, fontSize: 11, lineHeight: 1.5, color: K.s, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{html}</pre>
            </div>
          )}
        </div>
      </>)}
    </div>
  );
}
