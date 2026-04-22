import { h } from 'https://esm.sh/preact@10.29.0';
import { useState } from 'https://esm.sh/preact@10.29.0/hooks';
import { html } from 'https://esm.sh/htm@3.1.1/preact?external=preact';
import { CardioForm } from './CardioForm.js';
import { dbPut, queueSync, drainSyncQueue } from '../store.js';

export function CardioScreen(props) {
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);

  const saveSession = (sess) => {
    return dbPut('cardio', sess)
      .then(() => queueSync('logCardio', sess))
      .then(() => drainSyncQueue());
  };

  return html`
    <div class="screen-inner p-4">
      ${showForm 
        ? html`<${CardioForm} initialData=${editData} onSave=${saveSession} onCancel=${() => {setShowForm(false); setEditData(null);}} />`
        : html`<button onclick=${() => {setEditData(null); setShowForm(true);}} class="w-full py-5 bg-gradient-to-r from-cyan-400 to-fuchsia-400 text-black font-bold rounded-3xl mb-6">+ LOG CARDIO SESSION</button>`
      }
    </div>`;
}
