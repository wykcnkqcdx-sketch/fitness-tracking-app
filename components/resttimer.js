import { h } from 'https://esm.sh/preact@10.29.0';
import { useState, useEffect } from 'https://esm.sh/preact@10.29.0/hooks';
import { html } from 'https://esm.sh/htm@3.1.1/preact?external=preact';

export function RestTimer() {
  const [secs, setSecs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [visible, setVisible] = useState(false);
  const [startTime, setStartTime] = useState(0);

  useEffect(() => {
    let id;
    if (isRunning) id = setInterval(() => setSecs(Math.floor((Date.now() - startTime)/1000)), 200);
    return () => clearInterval(id);
  }, [isRunning, startTime]);

  const toggle = () => isRunning ? setIsRunning(false) : (setStartTime(Date.now() - secs*1000), setIsRunning(true));
  const reset = () => { setIsRunning(false); setSecs(0); };
  const fmt = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  if (!visible) return html`<button onclick=${()=>setVisible(true)} class="fixed bottom-24 right-6 w-14 h-14 bg-slate-900 border-2 border-cyan-400 text-cyan-400 rounded-2xl text-3xl z-50 shadow-[0_0_15px_#00f3ff]">⏱️</button>`;

  return html`
    <div class="fixed bottom-24 right-6 bg-slate-900/95 border border-cyan-400 rounded-3xl px-6 py-3 flex items-center gap-5 z-50 shadow-[0_0_20px_#00f3ff]">
      <div class="font-mono text-2xl font-bold text-cyan-400 tabular-nums">${fmt(secs)}</div>
      <div class="flex gap-5 border-l border-cyan-400/30 pl-5">
        <button onclick=${toggle} class="text-3xl">${isRunning ? '⏸' : '▶'}</button>
        <button onclick=${reset} class="text-3xl">🔄</button>
        <button onclick=${()=>{reset();setVisible(false);}} class="text-3xl text-slate-400">✕</button>
      </div>
    </div>`;
}
