import { h } from 'https://esm.sh/preact@10.29.0';
import { useState } from 'https://esm.sh/preact@10.29.0/hooks';
import { html } from 'https://esm.sh/htm@3.1.1/preact?external=preact';
import { currentPlanWeek, PLAN } from '../utils.js';

export function PlanScreen(props) {
  const currentWk = currentPlanWeek(props.strSessions || []);
  const [selWk, setSelWk] = useState(currentWk);
  const planRow = PLAN[selWk - 1] || PLAN[0];

  return html`
    <div class="screen-inner p-4">
      <div class="font-mono text-cyan-400 text-2xl mb-4">12-WEEK MESOCYCLE</div>
      <div class="text-xs text-slate-400 mb-6">CURRENT WEEK ${currentWk}</div>
      
      <div class="grid grid-cols-6 gap-2 mb-8">
        ${PLAN.map((p, i) => html`
          <button onclick=${() => setSelWk(p.wk || i+1)} 
            class="p-3 text-xs font-mono rounded-2xl border ${selWk === (p.wk || i+1) ? 'border-cyan-400 bg-slate-900' : 'border-slate-700'}">
            W${p.wk || i+1}
          </button>
        `)}
      </div>

      <div class="bg-slate-950 border border-cyan-400/30 rounded-3xl p-6">
        <div class="font-bold text-lg">Week ${selWk} — ${planRow.phase || 'Training'}</div>
        <div class="mt-6 space-y-4 text-sm">
          ${['mon','tue','wed','thu','fri','sat','sun'].map(day => html`
            <div class="flex justify-between py-2 border-b border-slate-800">
              <span class="font-mono uppercase">${day}</span>
              <span>${planRow[day] || 'Rest'}</span>
            </div>
          `)}
        </div>
      </div>
    </div>`;
}
