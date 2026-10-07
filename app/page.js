"use client";
import { useState } from "react";

const FIELD_W = 420;
const FIELD_H = 400;

const BASES = {
  home:   { x: 210, y: 345 },
  first:  { x: 320, y: 250 },
  second: { x: 210, y: 155 },
  third:  { x: 100, y: 250 },
};

const POSITIONS = {
  pitcher:   { x: 210, y: 220, label: "P" },
  catcher:   { x: 210, y: 368, label: "C" },
  first_b:   { x: 340, y: 235, label: "1B" },
  second_b:  { x: 280, y: 185, label: "2B" },
  shortstop: { x: 145, y: 185, label: "SS" },
  third_b:   { x: 82,  y: 235, label: "3B" },
  left_f:    { x: 95,  y: 100, label: "LF" },
  center_f:  { x: 210, y: 70,  label: "CF" },
  right_f:   { x: 325, y: 100, label: "RF" },
};

const BASE_RUNNER_COLORS = { first: "#ff6b35", second: "#ffd700", third: "#ff4466" };

const SCENARIOS = [
  "Runner on 2nd and 3rd, fly ball to left field — what does the 2nd baseman do?",
  "Bases loaded, ground ball to shortstop — who covers 2nd?",
  "Runner on 1st, bunt down 3rd base line — what does the 1st baseman do?",
  "Runner on 1st, fly ball to right field — what does the runner do?",
  "No runners, ground ball to 3rd — where does the throw go?",
  "Runner on 2nd, single to right — does the runner score?",
];

function parseRunners(text) {
  const runners = {};
  if (/runner[s]? on (first|1st)/i.test(text)) runners.first = true;
  if (/runner[s]? on (second|2nd)/i.test(text)) runners.second = true;
  if (/runner[s]? on (third|3rd)/i.test(text)) runners.third = true;
  if (/bases loaded/i.test(text)) { runners.first = true; runners.second = true; runners.third = true; }
  return runners;
}

function Field({ runners, highlights, ballPos }) {
  return (
    <svg viewBox={`0 0 ${FIELD_W} ${FIELD_H}`} style={{ display: "block", width: "100%", height: "auto", borderRadius: 12 }}>
      <defs>
        <radialGradient id="gg" cx="50%" cy="55%" r="60%">
          <stop offset="0%" stopColor="#1a4a1a" /><stop offset="100%" stopColor="#0d2e0d" />
        </radialGradient>
        <radialGradient id="ig" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c4883a" /><stop offset="100%" stopColor="#9e6a28" />
        </radialGradient>
        <pattern id="sl" x="0" y="0" width="2" height="4" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="2" height="2" fill="rgba(0,0,0,0.06)" />
        </pattern>
        <radialGradient id="vg" cx="50%" cy="50%" r="70%">
          <stop offset="60%" stopColor="transparent" /><stop offset="100%" stopColor="rgba(0,0,0,0.45)" />
        </radialGradient>
      </defs>
      <rect x={0} y={0} width={FIELD_W} height={FIELD_H} fill="url(#gg)" />
      {[...Array(8)].map((_, i) => <rect key={i} x={0} y={i*50} width={FIELD_W} height={25} fill="rgba(255,255,255,0.025)" />)}
      <path d="M 30 390 Q 210 10 390 390" fill="none" stroke="#a07840" strokeWidth={18} opacity={0.5} />
      <polygon points={`${BASES.home.x},${BASES.home.y} ${BASES.first.x},${BASES.first.y} ${BASES.second.x},${BASES.second.y} ${BASES.third.x},${BASES.third.y}`} fill="url(#ig)" opacity={0.75} />
      <line x1={BASES.home.x} y1={BASES.home.y} x2={30} y2={30} stroke="#c8a86b" strokeWidth={1.5} opacity={0.6} strokeDasharray="6,4" />
      <line x1={BASES.home.x} y1={BASES.home.y} x2={390} y2={30} stroke="#c8a86b" strokeWidth={1.5} opacity={0.6} strokeDasharray="6,4" />
      <circle cx={210} cy={230} r={18} fill="#b87f3a" opacity={0.7} />
      <circle cx={210} cy={230} r={5} fill="#c8a86b" />
      {[[BASES.home,BASES.first],[BASES.first,BASES.second],[BASES.second,BASES.third],[BASES.third,BASES.home]].map(([a,b],i) => (
        <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#c8a86b" strokeWidth={2} opacity={0.6} />
      ))}
      {Object.entries(BASES).map(([key, pos]) => {
        const hasRunner = runners[key];
        return (
          <g key={key}>
            <rect x={pos.x-8} y={pos.y-8} width={16} height={16}
              fill={hasRunner ? BASE_RUNNER_COLORS[key]||"#fffacd" : "#fffacd"}
              stroke={hasRunner?"#fff":"#c8a86b"} strokeWidth={hasRunner?2:1}
              transform={`rotate(45,${pos.x},${pos.y})`} />
            {hasRunner && (
              <circle cx={pos.x} cy={pos.y} r={18} fill="none" stroke={BASE_RUNNER_COLORS[key]||"#fff"} strokeWidth={1.5} opacity={0.5}>
                <animate attributeName="r" values="14;22;14" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0.1;0.5" dur="1.5s" repeatCount="indefinite" />
              </circle>
            )}
          </g>
        );
      })}
      {Object.entries(POSITIONS).map(([key, pos]) => {
        const lit = highlights && highlights[key];
        return (
          <g key={key}>
            {lit && <circle cx={pos.x} cy={pos.y} r={14} fill="#00ffcc" opacity={0.18}><animate attributeName="r" values="12;20;12" dur="1.2s" repeatCount="indefinite" /></circle>}
            <circle cx={pos.x} cy={pos.y} r={9} fill={lit?"#00ffcc":"#4db8ff"} stroke="#0a0a0a" strokeWidth={1.5} />
            <text x={pos.x} y={pos.y+4} textAnchor="middle" fontSize={7} fill="#0a0a0a" fontFamily="monospace" fontWeight="bold">{pos.label}</text>
          </g>
        );
      })}
      <circle cx={BASES.home.x+14} cy={BASES.home.y-4} r={9} fill="#ff9f43" stroke="#0a0a0a" strokeWidth={1.5} />
      <text x={BASES.home.x+14} y={BASES.home.y} textAnchor="middle" fontSize={7} fill="#0a0a0a" fontFamily="monospace" fontWeight="bold">B</text>
      {ballPos && (
        <g>
          <circle cx={ballPos.x} cy={ballPos.y} r={6} fill="#f5f5f5" stroke="#ccc" strokeWidth={1} />
          <circle cx={ballPos.x} cy={ballPos.y} r={10} fill="none" stroke="#f5f5f5" strokeWidth={1} opacity={0.4}>
            <animate attributeName="r" values="7;14;7" dur="0.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0;0.4" dur="0.8s" repeatCount="indefinite" />
          </circle>
        </g>
      )}
      {highlights && (highlights.arrows||[]).map((arrow, i) => (
        <g key={i}>
          <defs>
            <marker id={`a${i}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="#00ffcc" />
            </marker>
          </defs>
          <line x1={arrow.x1} y1={arrow.y1} x2={arrow.x2} y2={arrow.y2}
            stroke="#00ffcc" strokeWidth={2} strokeDasharray="6,3" markerEnd={`url(#a${i})`} opacity={0.85} />
        </g>
      ))}
      <rect x={0} y={0} width={FIELD_W} height={FIELD_H} fill="url(#sl)" />
      <rect x={0} y={0} width={FIELD_W} height={FIELD_H} fill="url(#vg)" />
    </svg>
  );
}

export default function Home() {
  const [scenario, setScenario] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [runners, setRunners] = useState({});
  const [highlights, setHighlights] = useState(null);
  const [ballPos, setBallPos] = useState(null);
  const [history, setHistory] = useState([]);

  const handleAsk = async (text) => {
    const q = text || scenario;
    if (!q.trim()) return;
    setLoading(true);
    setResponse(null);
    setHighlights(null);
    setBallPos(null);
    setRunners(parseRunners(q));

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Server error");

      const fullText = data.response || "";
      let parsed = null;
      const jsonTagMatch = fullText.match(/<json>([\s\S]*?)<\/json>/);
      if (jsonTagMatch) { try { parsed = JSON.parse(jsonTagMatch[1].trim()); } catch(e) {} }
      if (!parsed) {
        const jsonBlockMatch = fullText.match(/```json\s*([\s\S]*?)```/);
        if (jsonBlockMatch) { try { parsed = JSON.parse(jsonBlockMatch[1].trim()); } catch(e) {} }
      }
      const explanation = fullText.replace(/<json>[\s\S]*?<\/json>/, "").replace(/```json[\s\S]*?```/, "").trim();

      if (parsed) {
        setHighlights({ ...parsed.highlights, arrows: parsed.arrows || [] });
        if (parsed.ballLandX && parsed.ballLandY) setBallPos({ x: parsed.ballLandX, y: parsed.ballLandY });
        setResponse({ text: explanation, tip: parsed.tip });
      } else {
        setResponse({ text: explanation || fullText, tip: null });
      }
      setHistory(h => [{ q }, ...h].slice(0, 5));
    } catch(e) {
      setResponse({ text: `⚠️ ${e.message}`, tip: null });
    }
    setLoading(false);
    setScenario("");
  };

  return (
    <main style={{ minHeight:"100vh", background:"#0a0a12", fontFamily:"'Press Start 2P',monospace", color:"#00ffcc", display:"flex", flexDirection:"column", alignItems:"center", padding:"20px 12px 40px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        *{box-sizing:border-box}
        ::placeholder{color:#2a6655}
        @keyframes flicker{0%,100%{opacity:1}92%{opacity:1}93%{opacity:.85}94%{opacity:1}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .crt{animation:flicker 4s infinite}
        .blink{animation:blink 1s infinite}
        .slide-up{animation:slideUp .4s ease-out}
        .sbtn{background:transparent;border:1px solid #00ffcc44;color:#00ffcc99;font-family:'Press Start 2P',monospace;font-size:8px;padding:8px 10px;cursor:pointer;border-radius:4px;text-align:left;transition:all .2s;line-height:1.6;width:100%}
        .sbtn:hover{background:#00ffcc18;border-color:#00ffcc;color:#00ffcc}
        .abtn{background:#00ffcc;border:none;color:#0a0a12;font-family:'Press Start 2P',monospace;font-size:10px;padding:14px 24px;cursor:pointer;border-radius:4px;transition:all .15s;width:100%;margin-top:10px}
        .abtn:hover{background:#66ffe8}
        .abtn:disabled{background:#1a3a32;color:#00ffcc44;cursor:not-allowed}
        .tinput{width:100%;background:#060e0c;border:1px solid #00ffcc22;border-radius:4px;color:#00ffcc;font-family:'Press Start 2P',monospace;font-size:8px;padding:10px;resize:none;height:80px;outline:none;line-height:1.8}
      `}</style>

      <div className="crt" style={{ textAlign:"center", marginBottom:24 }}>
        <div style={{ fontSize:11, color:"#ff6b35", letterSpacing:3, marginBottom:6 }}>⚾ PEE-WEE BASEBALL ⚾</div>
        <div style={{ fontSize:20, color:"#00ffcc", letterSpacing:2 }}>COACH BOT</div>
        <div style={{ fontSize:7, color:"#00ffcc66", marginTop:8, letterSpacing:2 }}>INSERT SCENARIO TO CONTINUE <span className="blink">▮</span></div>
      </div>

      <div style={{ display:"flex", gap:20, width:"100%", alignItems:"flex-start", flexWrap:"wrap", justifyContent:"center" }}>
        <div style={{ flex:`2 1 ${FIELD_W}px`, minWidth:0, maxWidth:`max(${FIELD_W}px, calc((100vh - 170px) * ${FIELD_W / FIELD_H}))` }}>
          <div style={{ border:"2px solid #00ffcc33", borderRadius:14, overflow:"hidden", boxShadow:"0 0 40px rgba(0,255,204,.1)" }}>
            <Field runners={runners} highlights={highlights} ballPos={ballPos} />
          </div>
          <div style={{ marginTop:10, display:"flex", gap:14, flexWrap:"wrap", justifyContent:"center" }}>
            {[["#4db8ff","Fielder"],["#00ffcc","Key Player"],["#ffd700","Runner"],["#f5f5f5","Ball"]].map(([c,l]) => (
              <div key={l} style={{ display:"flex", alignItems:"center", gap:5 }}>
                <div style={{ width:10, height:10, borderRadius:"50%", background:c }} />
                <span style={{ fontSize:6, color:"#00ffcc88" }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex:1, minWidth:260, display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ background:"#0d1a16", border:"1px solid #00ffcc33", borderRadius:8, padding:14 }}>
            <div style={{ fontSize:7, color:"#00ffcc88", marginBottom:8 }}>▶ ENTER SCENARIO</div>
            <textarea className="tinput" value={scenario} onChange={e => setScenario(e.target.value)}
              onKeyDown={e => { if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();handleAsk();} }}
              placeholder="e.g. Runner on 2nd, fly ball to center — what does the shortstop do?" />
            <button className="abtn" disabled={loading||!scenario.trim()} onClick={() => handleAsk()}>
              {loading ? "THINKING..." : "ASK COACH BOT ▶"}
            </button>
          </div>

          {(loading || response) && (
            <div className="slide-up" style={{ background:"#0d1a16", border:"1px solid #00ffcc55", borderRadius:8, padding:14 }}>
              <div style={{ fontSize:7, color:"#00ffcc88", marginBottom:10 }}>📣 COACH SAYS:</div>
              {loading ? (
                <div style={{ fontSize:7, color:"#00ffcc66", lineHeight:2 }}><span className="blink">▮</span> LOADING PLAY...</div>
              ) : (
                <>
                  <p style={{ fontSize:8, lineHeight:2, color:"#e0fff8", margin:0 }}>{response.text}</p>
                  {response.tip && (
                    <div style={{ background:"#ff6b3522", border:"1px solid #ff6b3566", borderRadius:4, padding:"8px 10px", marginTop:10 }}>
                      <span style={{ fontSize:7, color:"#ff6b35" }}>💡 TIP: </span>
                      <span style={{ fontSize:7, color:"#ffcab0", lineHeight:2 }}>{response.tip}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <div style={{ background:"#0d1a16", border:"1px solid #00ffcc22", borderRadius:8, padding:14 }}>
            <div style={{ fontSize:7, color:"#00ffcc88", marginBottom:10 }}>⚡ QUICK PLAYS</div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {SCENARIOS.map((s,i) => <button key={i} className="sbtn" onClick={() => handleAsk(s)}>{s}</button>)}
            </div>
          </div>
        </div>
      </div>

      {history.length > 0 && (
        <div style={{ width:"100%", marginTop:20 }}>
          <div style={{ fontSize:7, color:"#00ffcc33", marginBottom:8 }}>── RECENT PLAYS ──</div>
          {history.map((h,i) => (
            <div key={i} style={{ background:"#0d1a16", border:"1px solid #00ffcc15", borderRadius:6, padding:"8px 12px", marginBottom:6, cursor:"pointer" }}
              onClick={() => handleAsk(h.q)}
              onMouseEnter={e => e.currentTarget.style.borderColor="#00ffcc44"}
              onMouseLeave={e => e.currentTarget.style.borderColor="#00ffcc15"}>
              <div style={{ fontSize:7, color:"#00ffcc55" }}>▶ {h.q}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop:30, fontSize:6, color:"#00ffcc22", letterSpacing:2 }}>© COACH BOT v1.0 — FOR PEE-WEE COACHES EVERYWHERE</div>
    </main>
  );
}