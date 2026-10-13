"use client";
import { useEffect, useRef, useState } from "react";

const WELCOME = "Hi! Ask me anything about using CoachBot.";
const MAX_QUESTION_LENGTH = 500; // same limit the help route enforces
const FONT = "'Press Start 2P',monospace";

// The assistant ends article answers with a line like: From: "Article title"
function splitSource(text) {
  const match = text.match(/\n+\s*(From: .+)$/);
  if (!match) return { body: text, source: null };
  return { body: text.slice(0, match.index).trim(), source: match[1].trim() };
}

export default function HelpWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ from: "bot", text: WELCOME }]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, loading, open]);

  useEffect(() => {
    if (!open) return;
    // On touch screens, focusing would pop the keyboard up over the window
    if (!window.matchMedia("(pointer: coarse)").matches) inputRef.current?.focus();
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const handleSend = async () => {
    const q = question.trim();
    if (!q || loading) return;
    setMessages(m => [...m, { from: "user", text: q }]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch("/api/help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Server error");
      setMessages(m => [...m, { from: "bot", text: data.answer || "" }]);
    } catch(e) {
      setMessages(m => [...m, { from: "bot", text: `⚠️ ${e.message}` }]);
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        @keyframes hwBlink{0%,100%{opacity:1}50%{opacity:0}}
        .hw-blink{animation:hwBlink 1s infinite}
        .hw-toggle{position:fixed;right:16px;bottom:16px;z-index:1000;background:#00ffcc;border:none;color:#0a0a12;font-family:${FONT};font-size:9px;padding:12px 14px;cursor:pointer;border-radius:4px;box-shadow:0 0 20px rgba(0,255,204,.25);transition:background .15s}
        .hw-toggle:hover{background:#66ffe8}
        .hw-panel{position:fixed;right:16px;bottom:64px;z-index:1000;width:min(340px,calc(100vw - 32px));height:min(440px,calc(100dvh - 84px));display:flex;flex-direction:column;background:#0d1a16;border:1px solid #00ffcc55;border-radius:8px;box-shadow:0 0 40px rgba(0,0,0,.6);font-family:${FONT};color:#00ffcc;box-sizing:border-box;overflow:hidden}
        .hw-panel *{box-sizing:border-box}
        .hw-close{background:transparent;border:1px solid #00ffcc44;color:#00ffcc;font-family:${FONT};font-size:8px;padding:6px 8px;cursor:pointer;border-radius:4px}
        .hw-close:hover{background:#00ffcc18;border-color:#00ffcc}
        .hw-input{flex:1;min-width:0;background:#060e0c;border:1px solid #00ffcc22;border-radius:4px;color:#00ffcc;font-family:${FONT};font-size:8px;padding:10px;outline:none;line-height:1.6}
        .hw-input:focus{border-color:#00ffcc88}
        .hw-input::placeholder{color:#2a6655}
        @media (pointer:coarse){.hw-input{font-size:16px;font-family:ui-monospace,Menlo,monospace;line-height:1.3}}
        .hw-send{background:#00ffcc;border:none;color:#0a0a12;font-family:${FONT};font-size:8px;padding:10px 12px;cursor:pointer;border-radius:4px;transition:background .15s}
        .hw-send:hover{background:#66ffe8}
        .hw-send:disabled{background:#1a3a32;color:#00ffcc44;cursor:not-allowed}
      `}</style>

      {open && (
        <div className="hw-panel" role="dialog" aria-label="Coach Bot help">
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, padding:"10px 12px", borderBottom:"1px solid #00ffcc33" }}>
            <span style={{ fontSize:9, color:"#ffd700" }}>? HELP</span>
            <button className="hw-close" onClick={() => setOpen(false)} aria-label="Close help">✕</button>
          </div>

          <div ref={listRef} aria-live="polite" style={{ flex:1, overflowY:"auto", padding:12, display:"flex", flexDirection:"column", gap:10 }}>
            {messages.map((m, i) => {
              const isUser = m.from === "user";
              const { body, source } = isUser ? { body: m.text, source: null } : splitSource(m.text);
              return (
                <div key={i} style={{ alignSelf: isUser ? "flex-end" : "flex-start", maxWidth:"88%", background: isUser ? "#00ffcc18" : "#060e0c", border:`1px solid ${isUser ? "#00ffcc55" : "#00ffcc22"}`, borderRadius:6, padding:"8px 10px" }}>
                  <div style={{ fontSize:8, lineHeight:1.9, color: isUser ? "#00ffcc" : "#e0fff8", whiteSpace:"pre-wrap", overflowWrap:"anywhere" }}>{body}</div>
                  {source && <div style={{ fontSize:6, lineHeight:1.8, color:"#00ffcc88", marginTop:6, overflowWrap:"anywhere" }}>{source}</div>}
                </div>
              );
            })}
            {loading && (
              <div style={{ alignSelf:"flex-start", fontSize:7, color:"#00ffcc66", lineHeight:2 }}><span className="hw-blink">▮</span> THINKING...</div>
            )}
          </div>

          <form onSubmit={e => { e.preventDefault(); handleSend(); }} style={{ display:"flex", gap:6, padding:10, borderTop:"1px solid #00ffcc33" }}>
            <input ref={inputRef} className="hw-input" value={question} onChange={e => setQuestion(e.target.value)}
              maxLength={MAX_QUESTION_LENGTH} placeholder="Type a question..." aria-label="Your question" />
            <button type="submit" className="hw-send" disabled={loading || !question.trim()}>SEND</button>
          </form>
        </div>
      )}

      <button className="hw-toggle" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        {open ? "✕ CLOSE" : "? HELP"}
      </button>
    </>
  );
}
