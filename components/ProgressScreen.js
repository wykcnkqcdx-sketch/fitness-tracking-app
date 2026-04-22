import { h } from 'https://esm.sh/preact@10.29.0';
import { useState, useEffect } from 'https://esm.sh/preact@10.29.0/hooks';
import { html } from 'https://esm.sh/htm@3.1.1/preact?external=preact';
import { currentPlanWeek, calcTotalVol } from '../utils.js';
import { dbGetAll } from '../store.js';
import { LineChart } from './LineChart.js';   // we'll add this next if needed

export function ProgressScreen(props) {
  const str = props.strSessions || [];
  const car = props.carSessions || [];
  const planWk = currentPlanWeek(str);

  return html`
    <div class="screen-inner p-4">
      <div class="font-mono text-cyan-400 text-2xl mb-2">PROGRESS</div>
      <div class="text-xs text-slate-400 mb-8">WEEK ${planWk} OF 12</div>

      <div class="bg-slate-950 border border-cyan-400/30 rounded-3xl p-6 mb-6">
        <div class="text-sm font-mono text-cyan-400 mb-4">WEEKLY VOLUME TREND</div>
        <${LineChart} data=${[1000, 1200, 1500, 1800, 2100]} labels=${['W1','W2','W3','W4','W5']} color="#00f3ff" />
      </div>

      <div class="grid grid-cols-3 gap-3">
        <div class="bg-slate-900 border border-emerald-400/30 rounded-3xl p-4 text-center">
          <div class="text-3xl font-bold text-emerald-400">${car.reduce((a,s)=>a+(s.distanceKm||0),0).toFixed(1)}</div>
          <div class="text-xs font-mono text-slate-400">TOTAL KM</div>
        </div>
        <div class="bg-slate-900 border border-amber-400/30 rounded-3xl p-4 text-center">
          <div class="text-3xl font-bold text-amber-400">${str.length}</div>
          <div class="text-xs font-mono text-slate-400">STRENGTH</div>
        </div>
        <div class="bg-slate-900 border border-cyan-400/30 rounded-3xl p-4 text-center">
          <div class="text-3xl font-bold text-cyan-400">${str.length + car.length}</div>
          <div class="text-xs font-mono text-slate-400">TOTAL</div>
        </div>
      </div>
    </div>`;
}
