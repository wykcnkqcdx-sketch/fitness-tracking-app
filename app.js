import { h, render } from 'https://esm.sh/preact@10.29.0';
import { useState, useEffect } from 'https://esm.sh/preact@10.29.0/hooks';
import { html } from 'https://esm.sh/htm@3.1.1/preact';

import { dbGetAll, dbPut, drainSyncQueue } from './store.js';
import { SEED_STR, SEED_CAR } from './utils.js';

import {
  HomeScreen, StrengthScreen, CardioScreen, PlanScreen,
  ProgressScreen, BodyScreen, SyncScreen, Nav, RestTimer
} from './components/components.js';

function AppError({ message, detail }) {
  return html`<div style="min-height:100vh;background:#03070b;color:#e2e4ef;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center">
    <div style="max-width:560px;width:100%;border:1px solid rgba(0,243,255,.35);background:rgba(10,18,28,.92);border-radius:12px;padding:20px;box-shadow:0 0 24px rgba(0,243,255,.12)">
      <div style="font-family:ui-monospace,monospace;color:#00f3ff;font-size:13px;letter-spacing:.18em;text-transform:uppercase;margin-bottom:12px">Startup check failed</div>
      <div style="font-size:22px;font-weight:800;margin-bottom:8px">The app hit a loading problem.</div>
      <div style="color:#9fb1c5;font-size:14px;line-height:1.5;margin-bottom:16px">${message || 'Refresh the page. If this stays visible, clear site data for this page and reload.'}</div>
      ${detail ? html`<pre style="white-space:pre-wrap;word-break:break-word;background:#020508;border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:12px;color:#ffb000;font-size:12px;max-height:220px;overflow:auto">${detail}</pre>` : null}
      <button onclick=${() => window.location.reload()} style="margin-top:16px;width:100%;border:0;border-radius:8px;padding:12px 14px;background:#00f3ff;color:#020508;font-weight:800;cursor:pointer">Reload App</button>
    </div>
  </div>`;
}

function App() {
  const [tab, setTab] = useState('home');
  const [strSessions, setStrSessions] = useState([]);
  const [carSessions, setCarSessions] = useState([]);
  const [ready, setReady] = useState(false);
  const [startupError, setStartupError] = useState(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

  useEffect(() => {
    let cancelled = false;
    let strL = [], carL = [];

    const load = async () => {
      try {
        if (navigator.storage && navigator.storage.persist) {
          navigator.storage.persist().catch(() => {});
        }

        strL = await dbGetAll('strength').catch(() => []);
        carL = await dbGetAll('cardio').catch(() => []);

        if (!strL.length) {
          strL = SEED_STR.slice();
          await Promise.all(SEED_STR.map(s => dbPut('strength', s)));
        }
        if (!carL.length) {
          carL = SEED_CAR.slice();
          await Promise.all(SEED_CAR.map(s => dbPut('cardio', s)));
        }

        if (cancelled) return;
        const sortF = (a, b) => a.date < b.date ? 1 : -1;
        setStrSessions(strL.sort(sortF));
        setCarSessions(carL.sort(sortF));
        setReady(true);
      } catch (err) {
        console.error('DB Init Error:', err);
        if (!cancelled) {
          setStartupError(err);
          setReady(true);
        }
      }
    };

    const handleAutoSync = () => {
      drainSyncQueue().then(synced => {
        if (synced > 0) {
          setSyncMsg(synced + ' offline session(s) synced');
          setTimeout(() => setSyncMsg(''), 4000);
        }
      }).catch(err => console.warn('Auto sync failed:', err));
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) handleAutoSync();
    };

    load();
    window.addEventListener('online', handleAutoSync);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelled = true;
      window.removeEventListener('online', handleAutoSync);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register('./sw.js').then(reg => {
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setUpdateAvailable(true);
          }
        });
      });
    }).catch(err => console.warn('Service worker registration failed:', err));
  }, []);

  if (startupError) {
    return html`<${AppError} message="Local workout storage could not start." detail=${startupError.stack || startupError.message || String(startupError)}/>`;
  }

  if (!ready) {
    return html`<div style="height:100vh;display:flex;align-items:center;justify-content:center;background:#03070b;color:#00f3ff;font-family:ui-monospace,monospace;font-size:12px;letter-spacing:.24em">LOADING TACTICAL CORE...</div>`;
  }

  const streak = Math.min(99, strSessions.length + carSessions.length);

  return html`
    <div class="h-full flex flex-col bg-[#03070b]">
      <div class="fixed left-4 right-4 top-[16px] z-50 flex justify-between items-center pointer-events-none">
        <div class="font-mono font-bold text-[#00f3ff] tracking-widest bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-cyan-400/30">WEMYSS<span class="text-fuchsia-400">OS</span></div>
        <div class="flex items-center gap-3 pointer-events-auto bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-400/30">
          <span class="font-bold text-amber-400">${streak}</span>
        </div>
      </div>
      <div style="height: calc(68px + var(--safe-top, 0px));"></div>

      ${tab === 'home' ? html`<${HomeScreen} strSessions=${strSessions} carSessions=${carSessions}/>` : null}
      ${tab === 'strength' ? html`<${StrengthScreen} strSessions=${strSessions} setSessions=${setStrSessions}/>` : null}
      ${tab === 'cardio' ? html`<${CardioScreen} carSessions=${carSessions} setSessions=${setCarSessions}/>` : null}
      ${tab === 'plan' ? html`<${PlanScreen} strSessions=${strSessions} carSessions=${carSessions} setStrSessions=${setStrSessions} setCarSessions=${setCarSessions}/>` : null}
      ${tab === 'progress' ? html`<${ProgressScreen} strSessions=${strSessions} carSessions=${carSessions}/>` : null}
      ${tab === 'body' ? html`<${BodyScreen}/>` : null}
      ${tab === 'sync' ? html`<${SyncScreen} strSessions=${strSessions} carSessions=${carSessions}/>` : null}

      ${updateAvailable ? html`<div class="fixed bottom-[100px] left-4 right-4 bg-slate-900 border border-cyan-400 text-cyan-400 p-4 rounded-2xl flex justify-between items-center z-50">
        UPDATE AVAILABLE
        <button onclick=${() => window.location.reload()} class="bg-cyan-400 text-black px-5 py-2 rounded-xl font-mono text-sm">RELOAD</button>
      </div>` : null}

      ${syncMsg ? html`<div class="fixed bottom-[160px] left-4 right-4 bg-emerald-900 border border-emerald-400 text-emerald-400 p-4 rounded-2xl flex items-center gap-3 z-50">${syncMsg}</div>` : null}

      <${RestTimer}/>
      <${Nav} tab=${tab} setTab=${setTab}/>
    </div>`;
}

function mount() {
  const root = document.getElementById('app');
  if (!root) return;
  try {
    render(html`<${App}/>`, root);
  } catch (err) {
    console.error('Render Error:', err);
    render(html`<${AppError} message="The interface could not render." detail=${err.stack || err.message || String(err)}/>`, root);
  }
}

mount();