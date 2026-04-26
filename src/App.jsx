import { useState, useEffect } from "react";

const RAMPS = {
  blue:   { fill:"#E6F1FB", stroke:"#185FA5", text:"#0C447C", mid:"#378ADD" },
  teal:   { fill:"#E1F5EE", stroke:"#0F6E56", text:"#085041", mid:"#1D9E75" },
  purple: { fill:"#EEEDFE", stroke:"#534AB7", text:"#3C3489", mid:"#7F77DD" },
  amber:  { fill:"#FAEEDA", stroke:"#854F0B", text:"#633806", mid:"#BA7517" },
  coral:  { fill:"#FAECE7", stroke:"#993C1D", text:"#712B13", mid:"#D85A30" },
  green:  { fill:"#EAF3DE", stroke:"#3B6D11", text:"#27500A", mid:"#639922" },
  gray:   { fill:"#F1EFE8", stroke:"#5F5E5A", text:"#444441", mid:"#888780" },
  pink:   { fill:"#FBEAF0", stroke:"#993556", text:"#72243E", mid:"#D4537E" },
};

const typeToRamp  = t => ({ Service:"blue", Database:"purple", Queue:"amber", Cache:"teal", Gateway:"teal", Frontend:"pink", External:"gray", "Load Balancer":"coral", Storage:"purple", Microservice:"blue", API:"teal" }[t] || "blue");
const nfrToRamp   = c => ({ Performance:"amber", Security:"coral", Scalability:"blue", Reliability:"green", Maintainability:"purple", Usability:"pink" }[c] || "blue");
const patToRamp   = c => ({ Structural:"blue", Behavioral:"green", Integration:"amber", Data:"purple" }[c] || "teal");
const layerToRamp = n => ({ Presentation:"pink", "API Gateway":"teal", "Business Logic":"blue", Data:"purple", Infrastructure:"green" }[n] || "gray");

const SYSTEM = `You are a senior software architect. Analyze the given requirements and return ONLY a JSON object — no markdown, no code fences, no explanation outside the JSON.

Schema:
{
  "functional_requirements":[{"id":"FR1","title":"...","description":"..."}],
  "non_functional_requirements":[{"id":"NFR1","category":"Performance|Security|Scalability|Reliability|Maintainability|Usability","title":"...","description":"..."}],
  "architecture_style":{"name":"...","description":"...","rationale":"..."},
  "layers":[{"name":"Presentation|API Gateway|Business Logic|Data|Infrastructure","order":1,"components":["ExactComponentName"]}],
  "components":[{"id":"c1","name":"...","type":"Service|Database|Queue|Cache|Gateway|Frontend|External|Load Balancer|Storage|Microservice|API","layer":"LayerName","description":"...","responsibilities":["..."],"dependencies":["c2"],"tech_suggestions":["..."]}],
  "connections":[{"from":"c1","to":"c2","label":"...","type":"sync|async|data"}],
  "patterns":[{"name":"...","category":"Structural|Behavioral|Integration|Data","description":"...","applied_to":"..."}],
  "nfr_tags":[{"tag":"...","category":"Performance|Security|Scalability|Reliability|Maintainability|Usability"}],
  "reasoning":{"overall":"...","key_decisions":[{"decision":"...","rationale":"..."}]}
}

Rules: 5–12 components. Names in layers.components must match exactly the name field in components. Use realistic tech. Return ONLY the JSON object.`;

const EXAMPLES = [
  "E-commerce platform for 1M users with product catalog, shopping cart, payment processing, order management, and real-time inventory.",
  "Healthcare patient portal with appointment scheduling, medical records, telemedicine video calls, prescriptions, and HIPAA compliance.",
  "Real-time collaborative code editor (like VS Code Live Share) with 10K concurrent users, conflict resolution, and offline sync.",
];

const TABS = [
  { id:"requirements", label:"Requirements" },
  { id:"style",        label:"Architecture style" },
  { id:"diagram",      label:"Diagram" },
  { id:"components",   label:"Components" },
  { id:"patterns",     label:"Patterns & NFRs" },
  { id:"reasoning",    label:"Reasoning" },
];

function Tag({ label, ramp, size }) {
  const r = RAMPS[ramp] || RAMPS.blue;
  return (
    <span style={{ display:"inline-block", background:r.fill, color:r.text, border:`0.5px solid ${r.stroke}`, borderRadius:6, padding: size==="lg" ? "4px 12px" : "2px 8px", fontSize: size==="lg" ? 12 : 11, fontFamily:"var(--font-mono)", whiteSpace:"nowrap" }}>
      {label}
    </span>
  );
}

function SectionLabel({ label }) {
  return <p style={{ margin:"0 0 12px", fontSize:11, color:"var(--color-text-secondary)", fontFamily:"var(--font-mono)", letterSpacing:"0.02em" }}>{label}</p>;
}

function ReqCard({ item, ramp, badge }) {
  const r = RAMPS[ramp] || RAMPS.blue;
  return (
    <div style={{ background:"var(--color-background-primary)", border:"0.5px solid var(--color-border-tertiary)", borderLeft:`2.5px solid ${r.stroke}`, borderRadius:10, padding:"10px 14px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4, gap:8 }}>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <span style={{ fontSize:11, color:r.stroke, fontFamily:"var(--font-mono)", fontWeight:500 }}>{item.id}</span>
          <span style={{ fontSize:13, fontWeight:500 }}>{item.title}</span>
        </div>
        {badge && <Tag label={badge} ramp={ramp} />}
      </div>
      <p style={{ margin:0, fontSize:12, color:"var(--color-text-secondary)", lineHeight:1.65 }}>{item.description}</p>
    </div>
  );
}

function ComponentDetail({ comp, allComps }) {
  const ramp = RAMPS[typeToRamp(comp.type)] || RAMPS.blue;
  const deps = (comp.dependencies || []).map(id => allComps.find(c => c.id === id)?.name || id).filter(Boolean);
  return (
    <div style={{ background:"var(--color-background-primary)", border:`0.5px solid var(--color-border-tertiary)`, borderTop:`2.5px solid ${ramp.stroke}`, borderRadius:12, padding:22 }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:14, gap:12 }}>
        <div>
          <h2 style={{ margin:"0 0 6px", fontSize:20, fontWeight:500 }}>{comp.name}</h2>
          <Tag label={comp.type} ramp={typeToRamp(comp.type)} />
        </div>
        {comp.layer && <span style={{ fontSize:11, color:"var(--color-text-secondary)", fontFamily:"var(--font-mono)", marginTop:2 }}>{comp.layer}</span>}
      </div>
      <p style={{ margin:"0 0 18px", fontSize:14, color:"var(--color-text-secondary)", lineHeight:1.7 }}>{comp.description}</p>

      {comp.responsibilities?.length > 0 && (
        <div style={{ marginBottom:16 }}>
          <SectionLabel label="Responsibilities" />
          {comp.responsibilities.map((r, i) => (
            <div key={i} style={{ display:"flex", gap:8, fontSize:13, color:"var(--color-text-secondary)", marginBottom:5, lineHeight:1.5 }}>
              <span style={{ color:ramp.stroke, flexShrink:0 }}>›</span>{r}
            </div>
          ))}
        </div>
      )}

      {deps.length > 0 && (
        <div style={{ marginBottom:16 }}>
          <SectionLabel label="Depends on" />
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {deps.map((d, i) => (
              <span key={i} style={{ background:"var(--color-background-secondary)", border:"0.5px solid var(--color-border-tertiary)", borderRadius:6, padding:"2px 9px", fontSize:12, fontFamily:"var(--font-mono)" }}>{d}</span>
            ))}
          </div>
        </div>
      )}

      {comp.tech_suggestions?.length > 0 && (
        <div>
          <SectionLabel label="Technology suggestions" />
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {comp.tech_suggestions.map((t, i) => (
              <span key={i} style={{ background:ramp.fill, color:ramp.text, border:`0.5px solid ${ramp.stroke}`, borderRadius:6, padding:"2px 9px", fontSize:12, fontFamily:"var(--font-mono)" }}>{t}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ArchDiagram({ result, onSelectComp, selComp }) {
  if (!result) return null;
  const { components = [], connections = [], layers = [] } = result;

  const W = 700, PAD = 24, LAYER_H = 80, GAP = 32, COMP_W = 120, COMP_H = 48;
  const sorted = [...layers].sort((a, b) => a.order - b.order);

  const positions = {};
  sorted.forEach((layer, li) => {
    const layerY = PAD + li * (LAYER_H + GAP);
    const names = layer.components || [];
    const totalW = names.length * COMP_W + Math.max(0, names.length - 1) * 12;
    const startX = (W - totalW) / 2;
    names.forEach((cName, ci) => {
      const comp = components.find(c => c.name === cName || c.name.toLowerCase() === cName.toLowerCase());
      if (comp) {
        const cx = startX + ci * (COMP_W + 12) + COMP_W / 2;
        const cy = layerY + LAYER_H / 2;
        positions[comp.id] = { x: startX + ci*(COMP_W+12), y: layerY+(LAYER_H-COMP_H)/2, cx, cy };
      }
    });
  });

  const svgH = sorted.length * (LAYER_H + GAP) + PAD * 2;

  return (
    <svg viewBox={`0 0 ${W} ${svgH}`} width="100%" style={{ display:"block" }}>
      <defs>
        {connections.map((conn, i) => {
          const col = conn.type==="async" ? "#BA7517" : conn.type==="data" ? "#7F77DD" : "#378ADD";
          return <marker key={i} id={`ar${i}`} markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill={col}/></marker>;
        })}
      </defs>

      {sorted.map((layer, li) => {
        const lY = PAD + li * (LAYER_H + GAP);
        const r = RAMPS[layerToRamp(layer.name)] || RAMPS.gray;
        return (
          <g key={li}>
            <rect x={8} y={lY} width={W-16} height={LAYER_H} fill={r.fill} stroke={r.stroke} strokeWidth="0.5" rx="8" opacity="0.45"/>
            <text x={18} y={lY+14} fontSize="9" fill={r.text} fontFamily="var(--font-mono)">{layer.name}</text>
          </g>
        );
      })}

      {connections.map((conn, i) => {
        const fc = components.find(c => c.id === conn.from);
        const tc = components.find(c => c.id === conn.to);
        if (!fc || !tc) return null;
        const fp = positions[fc.id], tp = positions[tc.id];
        if (!fp || !tp) return null;
        const sameRow = Math.abs(fp.cy - tp.cy) < 10;
        let x1, y1, x2, y2;
        if (sameRow) {
          x1 = fp.cx < tp.cx ? fp.x + COMP_W : fp.x;
          y1 = fp.cy;
          x2 = tp.cx < fp.cx ? tp.x + COMP_W : tp.x;
          y2 = tp.cy;
        } else {
          x1 = fp.cx; y1 = fp.cy + COMP_H/2;
          x2 = tp.cx; y2 = tp.cy - COMP_H/2;
        }
        const col = conn.type==="async" ? "#BA7517" : conn.type==="data" ? "#7F77DD" : "#378ADD";
        const dash = conn.type==="async" ? "5,3" : conn.type==="data" ? "2,2" : "none";
        const mx=(x1+x2)/2, my=(y1+y2)/2;
        return (
          <g key={i}>
            <path d={`M${x1},${y1} Q${x1},${my} ${x2},${y2}`} fill="none" stroke={col} strokeWidth="1.2" strokeDasharray={dash} markerEnd={`url(#ar${i})`} opacity="0.6"/>
            {conn.label && <text x={mx+4} y={my-3} fontSize="8.5" fill={col} opacity="0.75" fontFamily="var(--font-mono)">{conn.label.length>15?conn.label.slice(0,15)+"…":conn.label}</text>}
          </g>
        );
      })}

      {components.map(comp => {
        const pos = positions[comp.id];
        if (!pos) return null;
        const r = RAMPS[typeToRamp(comp.type)] || RAMPS.blue;
        const isSel = selComp?.id === comp.id;
        return (
          <g key={comp.id} onClick={() => onSelectComp(comp)} style={{ cursor:"pointer" }}>
            <rect x={pos.x} y={pos.y} width={COMP_W} height={COMP_H} fill={r.fill} stroke={isSel ? r.text : r.stroke} strokeWidth={isSel ? 1.5 : 0.5} rx="6"/>
            <rect x={pos.x} y={pos.y} width={COMP_W} height={2.5} fill={r.stroke} rx="4"/>
            <text x={pos.cx} y={pos.y+21} fontSize="10.5" fontWeight="500" fill={r.text} textAnchor="middle" fontFamily="var(--font-sans)">{comp.name.length>16?comp.name.slice(0,16)+"…":comp.name}</text>
            <text x={pos.cx} y={pos.y+35} fontSize="8.5" fill={r.stroke} textAnchor="middle" fontFamily="var(--font-mono)">{comp.type}</text>
          </g>
        );
      })}

      <text x={W-6} y={svgH-6} fontSize="8" fill="#888780" textAnchor="end" fontFamily="var(--font-mono)">
        Click component to inspect · sync — async - - data ···
      </text>
    </svg>
  );
}

export default function App() {
  const [req, setReq]         = useState("");
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [tab, setTab]         = useState("requirements");
  const [selComp, setSelComp] = useState(null);
  const [dots, setDots]       = useState(0);

  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setDots(d => (d+1) % 4), 450);
    return () => clearInterval(t);
  }, [loading]);

  const analyze = async () => {
    if (!req.trim() || loading) return;
    setLoading(true); setError(null); setResult(null); setSelComp(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({ model:"claude-sonnet-4-5", max_tokens:8000, system:SYSTEM, messages:[{ role:"user", content:`Design the software architecture for:\n\n${req}` }] })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || `API error ${res.status}`);
      const text = data.content.filter(b => b.type==="text").map(b => b.text).join("");
      const clean = text.replace(/```json|```/g,"").trim();
      setResult(JSON.parse(clean));
      setTab("requirements");
    } catch(e) {
      setError(e.message || "Analysis failed — please check your requirements and try again.");
    } finally { setLoading(false); }
  };

  const card = { background:"var(--color-background-primary)", border:"0.5px solid var(--color-border-tertiary)", borderRadius:12, padding:"14px 16px" };

  return (
    <div style={{ display:"flex", height:"100vh", fontFamily:"var(--font-sans)", fontSize:14, color:"var(--color-text-primary)", background:"var(--color-background-tertiary)", overflow:"hidden" }}>

      {/* ── Sidebar ── */}
      <aside style={{ width:316, background:"var(--color-background-secondary)", borderRight:"0.5px solid var(--color-border-tertiary)", display:"flex", flexDirection:"column", padding:20, gap:16, overflowY:"auto", flexShrink:0 }}>

        {/* Header */}
        <div style={{ paddingBottom:14, borderBottom:"0.5px solid var(--color-border-tertiary)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="7" fill="#E6F1FB"/>
              <rect x="5" y="7" width="8" height="7" rx="2" fill="#378ADD"/>
              <rect x="15" y="7" width="8" height="7" rx="2" fill="#7F77DD"/>
              <rect x="10" y="16" width="8" height="7" rx="2" fill="#1D9E75"/>
              <line x1="13" y1="14" x2="14" y2="16" stroke="#378ADD" strokeWidth="1"/>
              <line x1="19" y1="14" x2="14" y2="16" stroke="#7F77DD" strokeWidth="1"/>
            </svg>
            <div>
              <h1 style={{ margin:0, fontSize:16, fontWeight:500, lineHeight:1.2 }}>Architecture workbench</h1>
              <p style={{ margin:0, fontSize:11, color:"var(--color-text-secondary)", fontFamily:"var(--font-mono)" }}>powered by Claude</p>
            </div>
          </div>
        </div>

        {/* Input */}
        <div>
          <label style={{ display:"block", fontSize:12, color:"var(--color-text-secondary)", marginBottom:6 }}>System requirements</label>
          <textarea
            value={req}
            onChange={e => setReq(e.target.value)}
            rows={10}
            placeholder={"Describe your system in plain language…\n\nExample: A food delivery platform with real-time order tracking, restaurant management, driver coordination, and payment processing for 500K daily users."}
            style={{ width:"100%", resize:"none", fontFamily:"var(--font-sans)", fontSize:13, lineHeight:1.55 }}
            onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key==="Enter") analyze(); }}
          />
          <p style={{ margin:"4px 0 0", fontSize:11, color:"var(--color-text-secondary)", fontFamily:"var(--font-mono)" }}>⌘ + Enter to analyze</p>
        </div>

        <button onClick={analyze} disabled={loading || !req.trim()} style={{ fontWeight:500, fontSize:14 }}>
          {loading ? `Designing${".".repeat(dots+1)}` : "Design architecture ↗"}
        </button>

        {error && (
          <p style={{ margin:0, fontSize:12, color:"var(--color-text-danger)", background:"var(--color-background-danger)", border:"0.5px solid var(--color-border-danger)", borderRadius:8, padding:"8px 12px", lineHeight:1.5 }}>
            {error}
          </p>
        )}

        {/* Examples */}
        <div>
          <p style={{ margin:"0 0 8px", fontSize:11, color:"var(--color-text-secondary)", fontFamily:"var(--font-mono)" }}>Try an example</p>
          {EXAMPLES.map((ex, i) => (
            <div key={i} onClick={() => setReq(ex)} style={{ ...card, cursor:"pointer", marginBottom:7, fontSize:12, color:"var(--color-text-secondary)", lineHeight:1.55, padding:"9px 12px" }}
              onMouseOver={e => e.currentTarget.style.borderColor="var(--color-border-primary)"}
              onMouseOut={e => e.currentTarget.style.borderColor="var(--color-border-tertiary)"}>
              {ex}
            </div>
          ))}
        </div>

        {/* Stats */}
        {result && (
          <div style={{ paddingTop:12, borderTop:"0.5px solid var(--color-border-tertiary)" }}>
            <p style={{ margin:"0 0 10px", fontSize:11, color:"var(--color-text-secondary)", fontFamily:"var(--font-mono)" }}>Analysis summary</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {[
                { label:"Functional",     val:result.functional_requirements?.length||0,    ramp:"blue" },
                { label:"Non-functional", val:result.non_functional_requirements?.length||0, ramp:"teal" },
                { label:"Components",     val:result.components?.length||0,                  ramp:"purple" },
                { label:"Patterns",       val:result.patterns?.length||0,                    ramp:"green" },
              ].map(s => (
                <div key={s.label} style={{ background:"var(--color-background-tertiary)", borderRadius:8, padding:"10px 12px", textAlign:"center" }}>
                  <div style={{ fontSize:22, fontWeight:500, color:RAMPS[s.ramp].text, lineHeight:1 }}>{s.val}</div>
                  <div style={{ fontSize:11, color:"var(--color-text-secondary)", marginTop:3 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* ── Main ── */}
      <main style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

        {/* Empty state */}
        {!result && !loading && (
          <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, padding:40 }}>
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
              <rect x="4"  y="10" width="20" height="16" rx="4" fill="#E6F1FB" stroke="#185FA5" strokeWidth="0.5"/>
              <rect x="26" y="10" width="20" height="16" rx="4" fill="#EEEDFE" stroke="#534AB7" strokeWidth="0.5"/>
              <rect x="48" y="10" width="20" height="16" rx="4" fill="#E1F5EE" stroke="#0F6E56" strokeWidth="0.5"/>
              <rect x="14" y="38" width="20" height="16" rx="4" fill="#FAEEDA" stroke="#854F0B" strokeWidth="0.5"/>
              <rect x="38" y="38" width="20" height="16" rx="4" fill="#FAECE7" stroke="#993C1D" strokeWidth="0.5"/>
              <rect x="26" y="62" width="20" height="8" rx="3" fill="#EAF3DE" stroke="#3B6D11" strokeWidth="0.5"/>
              <line x1="14" y1="26" x2="24" y2="38" stroke="#378ADD" strokeWidth="0.8" strokeDasharray="2,2"/>
              <line x1="36" y1="26" x2="24" y2="38" stroke="#7F77DD" strokeWidth="0.8" strokeDasharray="2,2"/>
              <line x1="36" y1="26" x2="48" y2="38" stroke="#1D9E75" strokeWidth="0.8" strokeDasharray="2,2"/>
              <line x1="58" y1="26" x2="48" y2="38" stroke="#BA7517" strokeWidth="0.8" strokeDasharray="2,2"/>
              <line x1="24" y1="54" x2="36" y2="62" stroke="#639922" strokeWidth="0.8" strokeDasharray="2,2"/>
              <line x1="48" y1="54" x2="46" y2="62" stroke="#639922" strokeWidth="0.8" strokeDasharray="2,2"/>
            </svg>
            <div style={{ textAlign:"center" }}>
              <p style={{ margin:"0 0 6px", fontSize:16, fontWeight:500 }}>Enter requirements to begin</p>
              <p style={{ margin:0, fontSize:13, color:"var(--color-text-secondary)", maxWidth:380, lineHeight:1.6 }}>
                Claude will analyze your requirements and design a full architecture with diagrams, components, patterns, and reasoning.
              </p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20 }}>
            <div style={{ display:"flex", gap:7 }}>
              {[0,1,2,3].map(i => (
                <div key={i} style={{
                  width:9, height:9, borderRadius:"50%",
                  background: i < dots ? "#378ADD" : "var(--color-border-secondary)",
                  transition:"background 0.3s"
                }}/>
              ))}
            </div>
            <div style={{ textAlign:"center" }}>
              <p style={{ margin:"0 0 4px", fontSize:14, fontWeight:500 }}>Designing architecture{".".repeat(dots+1)}</p>
              <p style={{ margin:0, fontSize:12, color:"var(--color-text-secondary)" }}>Extracting requirements · selecting patterns · mapping components</p>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <>
            {/* Tab bar */}
            <div style={{ display:"flex", borderBottom:"0.5px solid var(--color-border-tertiary)", background:"var(--color-background-secondary)", overflowX:"auto", flexShrink:0 }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  padding:"11px 18px", background:"none", border:"none",
                  borderBottom: tab===t.id ? "2px solid #378ADD" : "2px solid transparent",
                  color: tab===t.id ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                  fontSize:13, cursor:"pointer", fontWeight: tab===t.id ? 500 : 400,
                  whiteSpace:"nowrap", fontFamily:"var(--font-sans)"
                }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ flex:1, overflowY:"auto", padding:24 }}>

              {/* ─ Requirements ─ */}
              {tab==="requirements" && (
                <div style={{ display:"grid", gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr)", gap:24, alignItems:"start" }}>
                  <div>
                    <SectionLabel label="Functional requirements" />
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {result.functional_requirements?.map(fr => <ReqCard key={fr.id} item={fr} ramp="blue"/>)}
                    </div>
                  </div>
                  <div>
                    <SectionLabel label="Non-functional requirements" />
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {result.non_functional_requirements?.map(nfr => <ReqCard key={nfr.id} item={nfr} ramp={nfrToRamp(nfr.category)} badge={nfr.category}/>)}
                    </div>
                  </div>
                </div>
              )}

              {/* ─ Architecture style ─ */}
              {tab==="style" && result.architecture_style && (
                <div style={{ maxWidth:680 }}>
                  <SectionLabel label="Recommended architecture style" />
                  <div style={{ ...card }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                      <div style={{ width:4, height:40, background:"#378ADD", borderRadius:4 }}/>
                      <div>
                        <h2 style={{ margin:0, fontSize:22, fontWeight:500 }}>{result.architecture_style.name}</h2>
                        <Tag label="Recommended" ramp="blue"/>
                      </div>
                    </div>
                    <p style={{ margin:"0 0 18px", color:"var(--color-text-secondary)", lineHeight:1.75, fontSize:14 }}>
                      {result.architecture_style.description}
                    </p>
                    <div style={{ background:"var(--color-background-secondary)", borderRadius:8, padding:"12px 16px" }}>
                      <p style={{ margin:"0 0 6px", fontSize:11, color:"var(--color-text-secondary)", fontFamily:"var(--font-mono)" }}>Why this style</p>
                      <p style={{ margin:0, lineHeight:1.75, fontSize:14 }}>{result.architecture_style.rationale}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ─ Diagram ─ */}
              {tab==="diagram" && (
                <div>
                  <SectionLabel label="Architecture diagram — click any component to inspect it" />
                  <div style={{ ...card, overflowX:"auto", marginBottom:16 }}>
                    <ArchDiagram result={result} selComp={selComp} onSelectComp={c => { setSelComp(c); setTab("components"); }}/>
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {[["Service","blue"],["Database","purple"],["Queue","amber"],["Cache / Gateway","teal"],["Frontend","pink"],["External","gray"],["Load Balancer","coral"]].map(([lbl, ramp]) =>
                      <Tag key={lbl} label={lbl} ramp={ramp}/>
                    )}
                    <span style={{ fontSize:11, color:"var(--color-text-secondary)", marginLeft:8, alignSelf:"center", fontFamily:"var(--font-mono)" }}>sync — · async - - · data ···</span>
                  </div>
                </div>
              )}

              {/* ─ Components ─ */}
              {tab==="components" && (
                <div style={{ display:"grid", gridTemplateColumns:"210px minmax(0,1fr)", gap:18, alignItems:"start" }}>
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    {result.components?.map(comp => {
                      const r = RAMPS[typeToRamp(comp.type)] || RAMPS.blue;
                      const isSel = selComp?.id === comp.id;
                      return (
                        <div key={comp.id} onClick={() => setSelComp(comp)} style={{
                          ...card, cursor:"pointer", padding:"9px 12px",
                          borderColor: isSel ? r.stroke : "var(--color-border-tertiary)",
                          background: isSel ? r.fill : "var(--color-background-primary)",
                          display:"flex", alignItems:"center", gap:10
                        }}>
                          <div style={{ width:8, height:8, borderRadius:"50%", background:r.stroke, flexShrink:0 }}/>
                          <div>
                            <div style={{ fontSize:13, fontWeight:500, color: isSel ? r.text : "var(--color-text-primary)" }}>{comp.name}</div>
                            <div style={{ fontSize:11, color:r.stroke, fontFamily:"var(--font-mono)" }}>{comp.type}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {selComp
                    ? <ComponentDetail comp={selComp} allComps={result.components||[]}/>
                    : <div style={{ ...card, color:"var(--color-text-secondary)", fontSize:13, padding:36, textAlign:"center" }}>Select a component from the list to inspect its details</div>
                  }
                </div>
              )}

              {/* ─ Patterns & NFRs ─ */}
              {tab==="patterns" && (
                <div style={{ display:"flex", flexDirection:"column", gap:28 }}>
                  <div>
                    <SectionLabel label="Architectural patterns" />
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px,1fr))", gap:12 }}>
                      {result.patterns?.map((p, i) => {
                        const r = RAMPS[patToRamp(p.category)] || RAMPS.blue;
                        return (
                          <div key={i} style={{ ...card, borderTop:`2.5px solid ${r.stroke}`, borderRadius:12 }}>
                            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8, gap:8 }}>
                              <h3 style={{ margin:0, fontSize:14, fontWeight:500 }}>{p.name}</h3>
                              <Tag label={p.category} ramp={patToRamp(p.category)}/>
                            </div>
                            <p style={{ margin:"0 0 8px", fontSize:12, color:"var(--color-text-secondary)", lineHeight:1.65 }}>{p.description}</p>
                            <p style={{ margin:0, fontSize:11, color:"var(--color-text-secondary)" }}>
                              Applied to: <span style={{ color:r.text }}>{p.applied_to}</span>
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <SectionLabel label="NFR compliance tags" />
                    <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                      {result.nfr_tags?.map((tag, i) => <Tag key={i} label={tag.tag} ramp={nfrToRamp(tag.category)} size="lg"/>)}
                    </div>
                  </div>
                </div>
              )}

              {/* ─ Reasoning ─ */}
              {tab==="reasoning" && result.reasoning && (
                <div style={{ maxWidth:700 }}>
                  <SectionLabel label="Architectural reasoning" />
                  <div style={{ ...card, marginBottom:20 }}>
                    <p style={{ margin:"0 0 8px", fontSize:11, color:"var(--color-text-secondary)", fontFamily:"var(--font-mono)" }}>Overall rationale</p>
                    <p style={{ margin:0, lineHeight:1.8, fontSize:14 }}>{result.reasoning.overall}</p>
                  </div>
                  <SectionLabel label="Key design decisions" />
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {result.reasoning.key_decisions?.map((d, i) => (
                      <div key={i} style={{ ...card, display:"grid", gridTemplateColumns:"32px minmax(0,1fr)", gap:"0 14px" }}>
                        <div style={{ width:32, height:32, background:"var(--color-background-info)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:500, color:"var(--color-text-info)", gridRow:"span 2", alignSelf:"start", marginTop:2 }}>{i+1}</div>
                        <p style={{ margin:"0 0 4px", fontWeight:500, fontSize:13 }}>{d.decision}</p>
                        <p style={{ margin:0, fontSize:13, color:"var(--color-text-secondary)", lineHeight:1.7 }}>{d.rationale}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </>
        )}
      </main>
    </div>
  );
}
