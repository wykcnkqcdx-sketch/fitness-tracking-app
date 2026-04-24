import { h, render } from 'https://esm.sh/preact@10.29.0';
import { useState, useEffect } from 'https://esm.sh/preact@10.29.0/hooks';
import { html } from 'https://esm.sh/htm@3.1.1/preact';

import { dbGetAll, dbPut, drainSyncQueue } from './store.js';
import { SEED_STR, SEED_CAR } from './utils.js';

// Import everything from the single components.js file
import { 
  HomeScreen, StrengthScreen, CardioScreen, PlanScreen, 
  ProgressScreen, BodyScreen, SyncScreen, Nav, RestTimer 
} from './components/components.js';

function App() {
  const [tab, setTab] = useState('home');
  const [strSessions, setStrSessions] = useState([]);
  const [carSessions, setCarSessions] = useState([]);
  const [ready, setReady] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

  useEffect(() => {
    // DB init + seed data + auto sync (your original logic)
    let strL = [], carL = [];
    const p1 = dbGetAll('strength').then(d => strL = d).catch(() => strL = []);
    const p2 = dbGetAll('cardio').then(d => carL = d).catch(() => carL = []);

    Promise.all([p1, p2]).then(() => {
      if (!strL.length) strL = SEED_STR.slice();
      if (!carL.length) carL = SEED_CAR.slice();
      const sortF = (a,b) => a.date < b.date ? 1 : -1;
      setStrSessions(strL.sort(sortF));
      setCarSessions(carL.sort(sortF));
      setReady(true);
    }).catch(err => {
      console.error(err);
      setReady(true);
    });
  }, []);

  if (!ready) {
    return html`<div class="h-full flex items-center justify-center bg-[#03070b] text-[#00f3ff] font-mono">LOADING TACTICAL CORE...</div>`;
  }

  return html`
    <div class="h-full flex flex-col bg-[#03070b]">
      ${tab === 'home' ? html`<${HomeScreen} strSessions=${strSessions} carSessions=${carSessions}/>` : null}
      ${tab === 'strength' ? html`<${StrengthScreen} strSessions=${strSessions} setSessions=${setStrSessions}/>` : null}
      ${tab === 'cardio' ? html`<${CardioScreen} carSessions=${carSessions} setSessions=${setCarSessions}/>` : null}
      ${tab === 'plan' ? html`<${PlanScreen} strSessions=${strSessions} carSessions=${carSessions} setStrSessions=${setStrSessions} setCarSessions=${setCarSessions}/>` : null}
      ${tab === 'progress' ? html`<${ProgressScreen} strSessions=${strSessions} carSessions=${carSessions}/>` : null}
      ${tab === 'body' ? html`<${BodyScreen}/>` : null}
      ${tab === 'sync' ? html`<${SyncScreen}/>` : null}

      <${RestTimer}/>
      <${Nav} tab=${tab} setTab=${setTab}/>
    </div>`;
}

render(html`<${App}/>`, document.getElementById('app'));
