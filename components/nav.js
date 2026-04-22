import { h } from 'https://esm.sh/preact@10.29.0';
import { html } from 'https://esm.sh/htm@3.1.1/preact?external=preact';

export function Nav(props) {
  const tabs = [
    {id: 'home', icon: '🏠', label: 'HOME'},
    {id: 'strength', icon: '💪', label: 'STR'},
    {id: 'cardio', icon: '🏃', label: 'CAR'},
    {id: 'plan', icon: '📋', label: 'PLAN'},
    {id: 'progress', icon: '📈', label: 'STATS'},
    {id: 'body', icon: '⚖️', label: 'BODY'},
    {id: 'sync', icon: '☁️', label: 'SYNC'}
  ];

  return html`
    <nav class="fixed bottom-0 left-0 right-0 bg-slate-950/95 border-t border-cyan-400 backdrop-blur-xl z-50 flex">
      ${tabs.map(t => html`
        <button 
          onclick=${() => props.setTab(t.id)}
          class="flex-1 py-4 flex flex-col items-center ${props.tab === t.id ? 'text-cyan-400' : 'text-slate-400'}">
          <span class="text-3xl">${t.icon}</span>
          <span class="text-[10px] font-mono tracking-widest mt-1">${t.label}</span>
        </button>
      `)}
    </nav>`;
}
