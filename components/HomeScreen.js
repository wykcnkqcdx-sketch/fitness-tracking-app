import { h } from 'https://esm.sh/preact@10.29.0';
import { useState, useEffect } from 'https://esm.sh/preact@10.29.0/hooks';
import { html } from 'https://esm.sh/htm@3.1.1/preact?external=preact';
import { currentPlanWeek, PLAN, calcTotalVol, hrCol } from '../utils.js';
import { dbGetAll, drainSyncQueue, getSyncConfig } from '../store.js';
import { BodyMap } from './BodyMap.js';

export function HomeScreen(props) {
  const str = props.strSessions || [];
  const car = props.carSessions || [];
  const planWk = currentPlanWeek(str);
  const planRow = PLAN[planWk - 1] || PLAN[0];
  const todayPrescription = planRow[new Date().toLocaleString('en-US', {weekday:'short'}).toLowerCase()] || 'Rest';

  const weekVol = str.filter(s => (Date.now() - new Date(s.date + 'T12:00:00')) < 7*86400000)
    .reduce((a, s) => a + calcTotalVol(s), 0);

  const weekKm = car.filter(s => (Date.now() - new Date(s.date + 'T12:00:00')) < 7*86400000)
    .reduce((a, s) => a + (s.distanceKm || 0), 0);

  const [selBody, setSelBody] = useState(new Set());
  const toggleBody = (part) => setSelBody(p => {
    const n = new Set(p);
    n.has(part) ? n.delete(part) : n.add(part);
    return n;
  });

  return html`
    <div class="screen-inner p-4">
      <!-- Tactical Hero Card -->
      <div class="bg-slate-950 border border-cyan-400/40 rounded-3xl p-6 mb-6">
        <div class="flex justify-between">
          <div>
            <div class="font-mono text-xs tracking-[2px] text-cyan-400">WEEK ${planWk} • ${planRow.phase || ''}</div>
            <div class="text-4xl font-bold mt-1">${todayPrescription}</div>
          </div>
          <div class="text-5xl">🔥</div>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-3 gap-3 mb-8">
        <div class="bg-slate-900 border border-cyan-400/30 rounded-3xl p-4 text-center">
          <div class="text-3xl font-bold text-cyan-400">${weekVol}</div>
          <div class="text-xs font-mono text-slate-400">KG WEEK</div>
        </div>
        <div class="bg-slate-900 border border-emerald-400/30 rounded-3xl p-4 text-center">
          <div class="text-3xl font-bold text-emerald-400">${weekKm.toFixed(1)}</div>
          <div class="text-xs font-mono text-slate-400">KM WEEK</div>
        </div>
        <div class="bg-slate-900 border border-amber-400/30 rounded-3xl p-4 text-center">
          <div class="text-3xl font-bold text-amber-400">${str.length + car.length}</div>
          <div class="text-xs font-mono text-slate-400">SESSIONS</div>
        </div>
      </div>

      <!-- Focus Areas -->
      <div class="mb-8">
        <div class="text-xs font-mono tracking-widest text-cyan-400 mb-3">FOCUS ZONES</div>
        <div class="bg-slate-900 border border-cyan-400/30 rounded-3xl p-6">
          <${BodyMap} selected=${selBody} onSelect=${toggleBody} />
        </div>
      </div>
    </div>`;
}
