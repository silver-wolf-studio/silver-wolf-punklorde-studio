'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { BadgeCheck, Code2, Cpu, Download, Eye, Gamepad2, Layers3, Send, Sparkles, Terminal, Trash2, Wifi, X } from 'lucide-react';

type Message = { role: 'user' | 'assistant'; content: string };
const welcome: Message = { role: 'assistant', content: 'Koneksi tersambung. Firewall lu lumayan rapuh, Player. Mau nge-debug side-quest apa hari ini?' };

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([welcome]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pagePrompt, setPagePrompt] = useState('Landing page untuk kedai kopi modern bernama Kopi Senja, nuansa hangat dan minimalis.');
  const [pageHtml, setPageHtml] = useState('');
  const [building, setBuilding] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editingCode, setEditingCode] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);
  useEffect(() => { try { const saved = window.localStorage.getItem('silver-wolf-history'); const parsed = saved ? JSON.parse(saved) as Message[] : null; if (Array.isArray(parsed) && parsed.length) setMessages(parsed); } finally { setHistoryLoaded(true); } }, []);
  useEffect(() => { if (historyLoaded) window.localStorage.setItem('silver-wolf-history', JSON.stringify(messages)); }, [messages, historyLoaded]);
  useEffect(() => { if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => undefined); }, []);

  async function sendMessage(event: FormEvent) {
    event.preventDefault(); const text = input.trim(); if (!text || loading) return;
    const next = [...messages, { role: 'user' as const, content: text }]; setMessages(next); setInput(''); setLoading(true);
    try { const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: next }) }); const data = await response.json() as { answer?: string; error?: string }; if (!response.ok) throw new Error(data.error); setMessages((current) => [...current, { role: 'assistant', content: data.answer ?? 'Output kena glitch kosong. Coba lagi, Player.' }]); }
    catch (error) { setMessages((current) => [...current, { role: 'assistant', content: error instanceof Error ? error.message : 'Server lagi ngelag. Coba lagi, Player.' }]); }
    finally { setLoading(false); }
  }

  async function buildPage(event: FormEvent) {
    event.preventDefault(); if (!pagePrompt.trim() || building) return; setBuilding(true);
    try { const response = await fetch('/api/page', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ brief: pagePrompt }) }); const data = await response.json() as { html?: string; error?: string; note?: string }; if (!response.ok || !data.html) throw new Error(data.error); setPageHtml(data.html); if (data.note) setMessages((current) => [...current, { role: 'assistant', content: data.note ?? '' }]); setEditingCode(false); setPreviewOpen(true); }
    catch (error) { setMessages((current) => [...current, { role: 'assistant', content: error instanceof Error ? error.message : 'Generator kena glitch. Coba lagi, Player.' }]); }
    finally { setBuilding(false); }
  }

  function downloadPage() { const blob = new Blob([pageHtml], { type: 'text/html;charset=utf-8' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'silver-wolf-page.html'; link.click(); URL.revokeObjectURL(url); }
  function startTemplate(text: string) { setPagePrompt(text); setShowWelcome(false); }

  return <main className="app-shell">
    <div className="grid-noise" />
    <section className="chat-window" aria-label="Silver Wolf Studio">
      <header className="topbar"><div className="identity"><div className="avatar"><Cpu size={22} /></div><div><h1>SILVER WOLF STUDIO</h1><p><span className="status-dot" />LOCAL AI · PUNKLORDE NODE</p></div></div><div className="top-actions"><span className="secure-pill"><BadgeCheck size={14} /> PRIVATE LOCAL</span><button className="clear-button" onClick={() => { setMessages([welcome]); window.localStorage.removeItem('silver-wolf-history'); }}><Trash2 size={16} /> RESET</button></div></header>
      <div className="workspace">
        <aside className="character-panel"><div className="character-glow" /><img src="/assets/silver-wolf-reference.jpg" alt="Silver Wolf visual reference supplied by the user" /><div className="character-copy"><p>PUNKLORDE // 99</p><h2>READY TO<br />BUILD.</h2><span><span className="status-dot" /> LOCAL CORE ONLINE</span></div><div className="character-stat"><Layers3 size={16} /> WEB QUESTS<br /><strong>{pageHtml ? '01 ACTIVE' : 'NO BUILD YET'}</strong></div></aside>
        <section className="chat-area"><div className="signal-row"><Wifi size={14} /> encrypted link established <span>LV. 99 HACKER</span></div><div className="messages">{messages.map((message, index) => <article className={`message ${message.role}`} key={`${message.role}-${index}`}><span className="message-label">{message.role === 'assistant' ? 'SW_01' : 'PLAYER'}</span><p>{message.content}</p></article>)}{loading && <article className="message assistant typing"><span className="message-label">SW_01</span><p>menyusup ke data<span className="dots">...</span></p></article>}<div ref={bottomRef} /></div><form className="composer" onSubmit={sendMessage}><Terminal size={20} /><input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ketik quest lu di sini..." aria-label="Pesan untuk Silver Wolf" /><button type="submit" disabled={loading || !input.trim()} aria-label="Kirim pesan"><Send size={19} /></button></form></section>
        <aside className="builder-panel"><p className="panel-kicker">SIDE-QUEST 02</p><h2><Code2 size={18} /> WEB BUILDER</h2><p className="panel-copy">Tulis brief halaman. AI nyusun copy dan warna, engine lokal langsung merakit HTML yang bisa lu edit.</p><form onSubmit={buildPage}><textarea value={pagePrompt} onChange={(e) => setPagePrompt(e.target.value)} aria-label="Brief halaman web" maxLength={800} /><button className="build-button" type="submit" disabled={building || !pagePrompt.trim()}><Sparkles size={16} /> {building ? 'BUILDING...' : 'BUAT HALAMAN'}</button></form>{pageHtml && <><button className="preview-button" onClick={() => { setEditingCode(false); setPreviewOpen(true); }}><Eye size={16} /> BUKA PREVIEW</button><button className="preview-button" onClick={downloadPage}><Download size={16} /> DOWNLOAD HTML</button></>}<div className="local-note"><span className="status-dot" /> Model jalan lokal<br /><small>Mode cepat: AI bikin arah konten, template lokal merakit halaman tanpa aset Internet.</small></div></aside>
      </div>
    </section>
    {showWelcome && <div className="welcome-overlay"><section className="welcome-card"><div className="welcome-copy"><span className="panel-kicker">SYSTEM OVERRIDE // COMPLETE</span><h2>WELCOME,<br /><em>PLAYER.</em></h2><p>Gue udah masuk ke side-quest lu. Chat, rancang, dan buat halaman web—semuanya jalan dari perangkat lu sendiri.</p><button className="enter-button" onClick={() => setShowWelcome(false)}><Gamepad2 size={18} /> MASUK KE STUDIO</button><div className="welcome-templates"><button onClick={() => startTemplate('Bantu gue bikin landing page untuk bisnis kecil. Mulai dari struktur halaman dan warna.')}>LANDING PAGE</button><button onClick={() => startTemplate('Bantu gue bikin halaman portofolio pribadi. Mulai dari struktur halaman dan warna.')}>PORTOFOLIO</button></div></div><img src="/assets/silver-wolf-reference.jpg" alt="Silver Wolf visual reference supplied by the user" /></section></div>}
    {previewOpen && <div className="preview-overlay" role="dialog" aria-modal="true"><section className="preview-window"><header><div><span className="panel-kicker">GENERATED PAGE</span><h2>{editingCode ? 'Edit Kode Halaman' : 'Preview Web Lu'}</h2></div><div className="preview-actions"><button className="clear-button" onClick={() => setEditingCode((value) => !value)}>{editingCode ? <Eye size={17} /> : <Code2 size={17} />}{editingCode ? ' PREVIEW' : ' EDIT KODE'}</button><button className="clear-button" onClick={downloadPage}><Download size={17} /> DOWNLOAD</button><button className="clear-button" onClick={() => setPreviewOpen(false)}><X size={17} /> TUTUP</button></div></header>{editingCode ? <textarea className="code-editor" value={pageHtml} onChange={(e) => setPageHtml(e.target.value)} spellCheck={false} aria-label="Kode HTML halaman" /> : <iframe title="Preview halaman hasil generator" sandbox="" srcDoc={pageHtml} />}</section></div>}
  </main>;
}
