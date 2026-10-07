"use client";
import { useState } from "react";

const FIELD_W = 420;
const FIELD_H = 400;

// The diamond is a true square: every base is BASE_PX away from home
// along 45° lines, so the foul lines always run straight through 1st and 3rd.
const HOME = { x: 210, y: 345 };
const BASE_PX = 100;     // home-to-first distance (in SVG pixels, along each axis)
const FENCE_R = 280;     // home-to-outfield-fence distance (along the foul lines)
const FOUL_LEN = 210;    // how far the foul lines run toward the field edge

const BASES = {
  home:   { x: HOME.x,           y: HOME.y },
  first:  { x: HOME.x + BASE_PX, y: HOME.y - BASE_PX },
  second: { x: HOME.x,           y: HOME.y - BASE_PX * 2 },
  third:  { x: HOME.x - BASE_PX, y: HOME.y - BASE_PX },
};

const FOUL_LEFT  = { x: HOME.x - FOUL_LEN, y: HOME.y - FOUL_LEN };
const FOUL_RIGHT = { x: HOME.x + FOUL_LEN, y: HOME.y - FOUL_LEN };
const FENCE_OFF  = FENCE_R * Math.SQRT1_2;
const MOUND = { x: HOME.x, y: HOME.y - 95 };

const POSITIONS = {
  pitcher:   { x: 210, y: 240, label: "P" },
  catcher:   { x: 210, y: 368, label: "C" },
  first_b:   { x: 330, y: 228, label: "1B" },
  second_b:  { x: 265, y: 180, label: "2B" },
  shortstop: { x: 155, y: 180, label: "SS" },
  third_b:   { x: 90,  y: 228, label: "3B" },
  left_f:    { x: 115, y: 125, label: "LF" },
  center_f:  { x: 210, y: 95,  label: "CF" },
  right_f:   { x: 305, y: 125, label: "RF" },
};

const POSITION_NAMES = {
  pitcher: "Pitcher", catcher: "Catcher", first_b: "First Base", second_b: "Second Base",
  shortstop: "Shortstop", third_b: "Third Base", left_f: "Left Field", center_f: "Center Field", right_f: "Right Field",
};
const YOU_COLOR = "#ffd700";

const BASE_RUNNER_COLORS = { first: "#ff6b35", second: "#ffd700", third: "#ff4466" };

// Situations only — Coach Bot answers them for whatever position the player picked
const SCENARIOS = [
  "No runners, ground ball to shortstop",
  "Runner on 1st, ground ball to second base",
  "Bases loaded, ground ball to shortstop",
  "Runner on 2nd and 3rd, fly ball to left field",
  "Runner on 1st, bunt down the 3rd base line",
  "Runner on 2nd, single to right field",
];

function parseRunners(text) {
  const runners = {};
  if (/runner[s]? on (first|1st)/i.test(text)) runners.first = true;
  if (/runner[s]? on (second|2nd)/i.test(text)) runners.second = true;
  if (/runner[s]? on (third|3rd)/i.test(text)) runners.third = true;
  if (/bases loaded/i.test(text)) { runners.first = true; runners.second = true; runners.third = true; }
  return runners;
}

function Field({ runners, highlights, ballPos, myPos, onPickPosition }) {
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
      <path d={`M ${HOME.x - FENCE_OFF} ${HOME.y - FENCE_OFF} A ${FENCE_R} ${FENCE_R} 0 0 1 ${HOME.x + FENCE_OFF} ${HOME.y - FENCE_OFF}`} fill="none" stroke="#a07840" strokeWidth={18} opacity={0.5} />
      <polygon points={`${BASES.home.x},${BASES.home.y} ${BASES.first.x},${BASES.first.y} ${BASES.second.x},${BASES.second.y} ${BASES.third.x},${BASES.third.y}`} fill="url(#ig)" opacity={0.75} />
      <line x1={BASES.home.x} y1={BASES.home.y} x2={FOUL_LEFT.x} y2={FOUL_LEFT.y} stroke="#c8a86b" strokeWidth={1.5} opacity={0.6} strokeDasharray="6,4" />
      <line x1={BASES.home.x} y1={BASES.home.y} x2={FOUL_RIGHT.x} y2={FOUL_RIGHT.y} stroke="#c8a86b" strokeWidth={1.5} opacity={0.6} strokeDasharray="6,4" />
      <circle cx={MOUND.x} cy={MOUND.y} r={18} fill="#b87f3a" opacity={0.7} />
      <circle cx={MOUND.x} cy={MOUND.y} r={5} fill="#c8a86b" />
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
        const isMe = key === myPos;
        const lit = !isMe && highlights && highlights[key];
        const fill = isMe ? YOU_COLOR : lit ? "#00ffcc" : "#4db8ff";
        return (
          <g key={key} onClick={onPickPosition ? () => onPickPosition(key) : undefined}
            style={{ cursor: onPickPosition ? "pointer" : "default" }}>
            {(lit || isMe) && <circle cx={pos.x} cy={pos.y} r={14} fill={fill} opacity={0.2}><animate attributeName="r" values="12;20;12" dur="1.2s" repeatCount="indefinite" /></circle>}
            <circle cx={pos.x} cy={pos.y} r={isMe ? 11 : 9} fill={fill} stroke={isMe ? "#fff" : "#0a0a0a"} strokeWidth={isMe ? 2 : 1.5} />
            <text x={pos.x} y={pos.y+4} textAnchor="middle" fontSize={7} fill="#0a0a0a" fontFamily="monospace" fontWeight="bold">{pos.label}</text>
            {isMe && (
              <g>
                <rect x={pos.x-17} y={pos.y-30} width={34} height={13} rx={3} fill={YOU_COLOR} />
                <text x={pos.x} y={pos.y-20.5} textAnchor="middle" fontSize={7} fill="#0a0a0a" fontFamily="monospace" fontWeight="bold">YOU</text>
              </g>
            )}
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
      {highlights && highlights.youArrow && (() => {
        const a = highlights.youArrow;
        return (
          <g>
            <defs>
              <marker id="youA" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                <path d="M0,0 L0,7 L7,3.5 z" fill={YOU_COLOR} />
              </marker>
            </defs>
            <line x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke={YOU_COLOR} strokeWidth={3.5} markerEnd="url(#youA)" />
          </g>
        );
      })()}
      <rect x={0} y={0} width={FIELD_W} height={FIELD_H} fill="url(#sl)" pointerEvents="none" />
      <rect x={0} y={0} width={FIELD_W} height={FIELD_H} fill="url(#vg)" pointerEvents="none" />
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
  const [myPos, setMyPos] = useState(null); // which position the visitor plays

  const pickPosition = (key) => {
    setMyPos(key);
    setResponse(null);
    setHighlights(null);
    setBallPos(null);
    setRunners({});
  };

  const handleAsk = async (text, posOverride) => {
    const q = text || scenario;
    const pos = posOverride || myPos;
    if (!q.trim() || !pos) return;
    setLoading(true);
    setResponse(null);
    setHighlights(null);
    setBallPos(null);
    setRunners(parseRunners(q));

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: q, position: pos }),
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
        setHighlights({ ...parsed.highlights, arrows: parsed.arrows || [], youArrow: parsed.youArrow || null });
        if (parsed.ballLandX && parsed.ballLandY) setBallPos({ x: parsed.ballLandX, y: parsed.ballLandY });
        setResponse({ text: explanation, tip: parsed.tip });
      } else {
        setResponse({ text: explanation || fullText, tip: null });
      }
      setHistory(h => [{ q, pos }, ...h].slice(0, 5));
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
        .pbtn{background:#0a1512;border:1px solid #00ffcc44;color:#00ffcc;font-family:'Press Start 2P',monospace;font-size:7px;padding:10px 4px;cursor:pointer;border-radius:4px;transition:all .15s;line-height:1.6}
        .pbtn:hover{background:#ffd70022;border-color:#ffd700;color:#ffd700}
        .cbtn{background:transparent;border:1px solid #ffd70066;color:#ffd700;font-family:'Press Start 2P',monospace;font-size:6px;padding:6px 8px;cursor:pointer;border-radius:4px}
        .cbtn:hover{background:#ffd70022}
        .tinput{width:100%;background:#060e0c;border:1px solid #00ffcc22;border-radius:4px;color:#00ffcc;font-family:'Press Start 2P',monospace;font-size:8px;padding:10px;resize:none;height:80px;outline:none;line-height:1.8}
      `}</style>

      <div className="crt" style={{ textAlign:"center", marginBottom:24 }}>
        <div style={{ fontSize:11, color:"#ff6b35", letterSpacing:3, marginBottom:6 }}>⚾ PEE-WEE BASEBALL ⚾</div>
        <div style={{ fontSize:20, color:"#00ffcc", letterSpacing:2 }}>COACH BOT</div>
        <div style={{ fontSize:7, color:"#00ffcc66", marginTop:8, letterSpacing:2 }}>{myPos ? "INSERT SCENARIO TO CONTINUE" : "PICK YOUR POSITION TO START"} <span className="blink">▮</span></div>
      </div>

      <div style={{ display:"flex", gap:20, width:"100%", alignItems:"flex-start", flexWrap:"wrap", justifyContent:"center" }}>
        <div style={{ flex:`2 1 ${FIELD_W}px`, minWidth:0, maxWidth:`max(${FIELD_W}px, calc((100vh - 170px) * ${FIELD_W / FIELD_H}))` }}>
          <div style={{ border:"2px solid #00ffcc33", borderRadius:14, overflow:"hidden", boxShadow:"0 0 40px rgba(0,255,204,.1)" }}>
            <Field runners={runners} highlights={highlights} ballPos={ballPos} myPos={myPos} onPickPosition={myPos ? null : pickPosition} />
          </div>
          <div style={{ marginTop:10, display:"flex", gap:14, flexWrap:"wrap", justifyContent:"center" }}>
            {[[YOU_COLOR,"You"],["#4db8ff","Fielder"],["#00ffcc","Key Player"],["#ff6b35","Runner"],["#f5f5f5","Ball"]].map(([c,l]) => (
              <div key={l} style={{ display:"flex", alignItems:"center", gap:5 }}>
                <div style={{ width:10, height:10, borderRadius:"50%", background:c }} />
                <span style={{ fontSize:6, color:"#00ffcc88" }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex:1, minWidth:260, display:"flex", flexDirection:"column", gap:14 }}>
          {!myPos && (
            <div className="slide-up" style={{ background:"#0d1a16", border:"1px solid #ffd70066", borderRadius:8, padding:14 }}>
              <div style={{ fontSize:9, color:YOU_COLOR, marginBottom:6 }}>⚾ WHAT POSITION DO YOU PLAY?</div>
              <div style={{ fontSize:6, color:"#00ffcc88", marginBottom:12, lineHeight:1.8 }}>Tap a button, or tap your spot on the field.</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:6 }}>
                {Object.keys(POSITIONS).map(key => (
                  <button key={key} className="pbtn" onClick={() => pickPosition(key)}>
                    {POSITIONS[key].label}<br /><span style={{ fontSize:5, opacity:0.7 }}>{POSITION_NAMES[key]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {myPos && (<>
          <div style={{ background:"#0d1a16", border:"1px solid #ffd70066", borderRadius:8, padding:"10px 14px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
            <span style={{ fontSize:8, color:YOU_COLOR }}>⭐ PLAYING: {POSITION_NAMES[myPos].toUpperCase()}</span>
            <button className="cbtn" onClick={() => pickPosition(null)}>CHANGE</button>
          </div>

          <div style={{ background:"#0d1a16", border:"1px solid #00ffcc33", borderRadius:8, padding:14 }}>
            <div style={{ fontSize:7, color:"#00ffcc88", marginBottom:8 }}>▶ ENTER SCENARIO</div>
            <textarea className="tinput" value={scenario} onChange={e => setScenario(e.target.value)}
              onKeyDown={e => { if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();handleAsk();} }}
              placeholder={`e.g. Runner on 2nd, fly ball to center — what do I do at ${POSITION_NAMES[myPos].toLowerCase()}?`} />
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
          </>)}
        </div>
      </div>

      {history.length > 0 && (
        <div style={{ width:"100%", marginTop:20 }}>
          <div style={{ fontSize:7, color:"#00ffcc33", marginBottom:8 }}>── RECENT PLAYS ──</div>
          {history.map((h,i) => (
            <div key={i} style={{ background:"#0d1a16", border:"1px solid #00ffcc15", borderRadius:6, padding:"8px 12px", marginBottom:6, cursor:"pointer" }}
              onClick={() => { if (h.pos !== myPos) setMyPos(h.pos); handleAsk(h.q, h.pos); }}
              onMouseEnter={e => e.currentTarget.style.borderColor="#00ffcc44"}
              onMouseLeave={e => e.currentTarget.style.borderColor="#00ffcc15"}>
              <div style={{ fontSize:7, color:"#00ffcc55" }}>▶ [{POSITIONS[h.pos].label}] {h.q}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop:30, fontSize:6, color:"#00ffcc22", letterSpacing:2 }}>© COACH BOT v1.0 — FOR PEE-WEE COACHES EVERYWHERE</div>
    </main>
  );
}
