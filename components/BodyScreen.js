import { h } from 'https://esm.sh/preact@10.29.0';
import { useState } from 'https://esm.sh/preact@10.29.0/hooks';
import { html } from 'https://esm.sh/htm@3.1.1/preact?external=preact';
import { BodyMap } from './BodyMap.js';

export function BodyScreen(props) {
  const [selBody, setSelBody] = useState(new Set());

  const toggleBody = (part) => setSelBody(p => {
    const n = new Set(p);
    n.has(part) ? n.delete(part) : n.add(part);
    return n;
  });

  return html`
    <div class="screen-inner p-4">
      <div class="font-mono text-cyan-400 text-2xl mb-6">BODY COMPOSITION</div>
      
      <div class="bg-slate-950 border border-cyan-400/30 rounded-3xl p-6">
        <div class="text-sm font-mono text-cyan-400 mb-4">TARGET AREAS</div>
        <${BodyMap} selected=${selBody} onSelect=${toggleBody} />
      </div>

      <div class="mt-8 text-center text-xs font-mono text-slate-400">
        TAP BODY PARTS TO SEE RECOMMENDED EXERCISES
      </div>
    </div>`;
}
