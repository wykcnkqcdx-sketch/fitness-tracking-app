import { h } from 'https://esm.sh/preact@10.29.0';
import { useState, useEffect } from 'https://esm.sh/preact@10.29.0/hooks';
import { html } from 'https://esm.sh/htm@3.1.1/preact';
import { hrCol, zoneName, hrZoneFrom, todayISO, fmtLabel, uid, calcVol, calcTotalVol, topWt, epley, currentPlanWeek, PLAN, EXERCISE_LIB, CARDIO_TYPES, EFFORT_LBL } from '../utils.js';
import { dbGetAll, dbPut, dbDelete, queueSync, drainSyncQueue, getSyncConfig, setSyncConfig } from '../store.js';

export function BodyMap(props){
  var selected=props.selected;
  var onSelect=props.onSelect;
  function isActive(part){return selected.has(part);}
  return html`
    <svg width="100%" height="380" viewBox="0 0 320 400" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto;max-width:280px">
      <!-- Silhouette -->
      <ellipse cx="160" cy="55" rx="32" ry="34" fill="var(--bg3)"/>
      <rect x="124" y="95" width="72" height="95" rx="14" fill="var(--bg3)"/>
      <line x1="130" y1="108" x2="78" y2="180" stroke="var(--bg3)" stroke-width="26" stroke-linecap="round"/>
      <line x1="190" y1="108" x2="242" y2="180" stroke="var(--bg3)" stroke-width="26" stroke-linecap="round"/>
      <rect x="124" y="185" width="72" height="25" rx="6" fill="var(--bg3)"/>
      <line x1="138" y1="210" x2="118" y2="320" stroke="var(--bg3)" stroke-width="28" stroke-linecap="round"/>
      <line x1="182" y1="210" x2="202" y2="320" stroke="var(--bg3)" stroke-width="28" stroke-linecap="round"/>
      <line x1="118" y1="320" x2="112" y2="375" stroke="var(--bg3)" stroke-width="22" stroke-linecap="round"/>
      <line x1="202" y1="320" x2="208" y2="375" stroke="var(--bg3)" stroke-width="22" stroke-linecap="round"/>
      
      <!-- Clickable target zones -->
      <circle onclick=${()=>onSelect('shoulders')} cx="128" cy="108" r="16" class="body-part ${isActive('shoulders')?'active':''}" fill="rgba(0,180,255,0.08)" stroke="rgba(0,180,255,0.5)" stroke-width="2"/>
      <circle onclick=${()=>onSelect('shoulders')} cx="192" cy="108" r="16" class="body-part ${isActive('shoulders')?'active':''}" fill="rgba(0,180,255,0.08)" stroke="rgba(0,180,255,0.5)" stroke-width="2"/>
      <circle onclick=${()=>onSelect('chest')} cx="160" cy="125" r="22" class="body-part ${isActive('chest')?'active':''}" fill="rgba(0,180,255,0.08)" stroke="rgba(0,180,255,0.5)" stroke-width="2"/>
      <circle onclick=${()=>onSelect('arms')} cx="90" cy="155" r="16" class="body-part ${isActive('arms')?'active':''}" fill="rgba(0,180,255,0.08)" stroke="rgba(0,180,255,0.5)" stroke-width="2"/>
      <circle onclick=${()=>onSelect('arms')} cx="230" cy="155" r="16" class="body-part ${isActive('arms')?'active':''}" fill="rgba(0,180,255,0.08)" stroke="rgba(0,180,255,0.5)" stroke-width="2"/>
      <circle onclick=${()=>onSelect('core')} cx="160" cy="175" r="20" class="body-part ${isActive('core')?'active':''}" fill="rgba(0,180,255,0.08)" stroke="rgba(0,180,255,0.5)" stroke-width="2"/>
      <circle onclick=${()=>onSelect('back')} cx="160" cy="145" r="18" class="body-part ${isActive('back')?'active':''}" fill="rgba(0,180,255,0.05)" stroke="rgba(0,180,255,0.3)" stroke-width="2" stroke-dasharray="3,3"/>
      <circle onclick=${()=>onSelect('glutes')} cx="160" cy="205" r="16" class="body-part ${isActive('glutes')?'active':''}" fill="rgba(0,180,255,0.05)" stroke="rgba(0,180,255,0.3)" stroke-width="2" stroke-dasharray="3,3"/>
      <circle onclick=${()=>onSelect('quads')} cx="130" cy="260" r="16" class="body-part ${isActive('quads')?'active':''}" fill="rgba(0,180,255,0.08)" stroke="rgba(0,180,255,0.5)" stroke-width="2"/>
      <circle onclick=${()=>onSelect('quads')} cx="190" cy="260" r="16" class="body-part ${isActive('quads')?'active':''}" fill="rgba(0,180,255,0.08)" stroke="rgba(0,180,255,0.5)" stroke-width="2"/>
      <circle onclick=${()=>onSelect('calves')} cx="113" cy="350" r="12" class="body-part ${isActive('calves')?'active':''}" fill="rgba(0,180,255,0.08)" stroke="rgba(0,180,255,0.5)" stroke-width="2"/>
      <circle onclick=${()=>onSelect('calves')} cx="207" cy="350" r="12" class="body-part ${isActive('calves')?'active':''}" fill="rgba(0,180,255,0.08)" stroke="rgba(0,180,255,0.5)" stroke-width="2"/>
    </svg>`;
}

export function LineChart({ data, labels, color = 'var(--blue)' }){
  if(!data||!data.length)return html`<div style="color:var(--mu);text-align:center;padding:40px;font-size:12px">No data yet</div>`;
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 600, h = 160, pad = 30;
  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1 || 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  }).join(' ');
  return html`
    <svg viewBox="0 0 ${w} ${h}" style="width:100%;height:180px">
      <polyline points=${points} fill="none" stroke=${color} stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      ${data.map((v, i) => {
        const x = pad + (i / (data.length - 1 || 1)) * (w - pad * 2);
        const y = h - pad - ((v - min) / range) * (h - pad * 2);
        return html`<circle cx=${x} cy=${y} r="5" fill=${color}/>`;
      })}
      ${labels.map((l, i) => {
        const x = pad + (i / (labels.length - 1 || 1)) * (w - pad * 2);
        return html`<text x=${x} y=${h-8} text-anchor="middle" fill="var(--mu)" font-size="11">${l}</text>`;
      })}
    </svg>`;
}

export function StrengthForm(props){
  var init = props.initialData || {};
  var initBlocks = init.blocks || [{name:'',sets:[{weight:'',reps:''},{weight:'',reps:''},{weight:'',reps:''}]}];
  var ds=useState(init.date || todayISO());var date=ds[0];var setDate=ds[1];
  var ws=useState(init.warmup || '');var warmup=ws[0];var setWarmup=ws[1];
  var bs=useState(initBlocks);var blocks=bs[0];var setBlocks=bs[1];
  var sv=useState(false);var saving=sv[0];var setSaving=sv[1];
  var es=useState('');var err=es[0];var setErr=es[1];

  var pmS=useState(false);var showPm=pmS[0];var setShowPm=pmS[1];
  var pmwS=useState('');var pmW=pmwS[0];var setPmW=pmwS[1];
  var pmbS=useState(20);var pmB=pmbS[0];var setPmB=pmbS[1];

  var pmPlates = [];
  var pmRem = 0;
  if(pmW && Number(pmW) > pmB) {
    var targetSide = (Number(pmW) - pmB) / 2;
    var avail = [25, 20, 15, 10, 5, 2.5, 1.25];
    avail.forEach(function(p){
      while(targetSide >= p - 0.01) { // tolerance for floating point math
        pmPlates.push(p);
        targetSide -= p;
      }
    });
    pmRem = targetSide > 0.01 ? targetSide * 2 : 0;
  }

  function addBlock(){setBlocks(function(p){return p.concat([{name:'',target:'',sets:[{weight:'',reps:''}]}]);});}
  function removeBlock(bi){if(confirm('Delete this exercise?'))setBlocks(function(p){return p.filter(function(_,i){return i!==bi;});});}
  function addSet(bi){setBlocks(function(p){return p.map(function(b,i){if(i!==bi)return b;var ls=b.sets[b.sets.length-1]||{weight:'',reps:''};return Object.assign({},b,{sets:b.sets.concat([{weight:ls.weight,reps:ls.reps}])});});});}
  function removeSet(bi,si){if(confirm('Delete this set?'))setBlocks(function(p){return p.map(function(b,i){if(i!==bi)return b;return Object.assign({},b,{sets:b.sets.filter(function(_,j){return j!==si;})});});});}
  function updName(bi,v){setBlocks(function(p){return p.map(function(b,i){if(i!==bi)return b;return Object.assign({},b,{name:v});});});}
  function updTarget(bi,v){setBlocks(function(p){return p.map(function(b,i){if(i!==bi)return b;return Object.assign({},b,{target:v});});});}
  function updSet(bi,si,f,v){setBlocks(function(p){return p.map(function(b,i){if(i!==bi)return b;var ns=b.sets.map(function(s,j){if(j!==si)return s;var n=Object.assign({},s);n[f]=v;return n;});return Object.assign({},b,{sets:ns});});});}
  function moveBlock(bi,dir){if(bi+dir<0||bi+dir>=blocks.length)return;setBlocks(function(p){var n=p.slice();var t=n[bi];n[bi]=n[bi+dir];n[bi+dir]=t;return n;});}
  function moveSet(bi,si,dir){setBlocks(function(p){return p.map(function(b,i){if(i!==bi)return b;if(si+dir<0||si+dir>=b.sets.length)return b;var ns=b.sets.slice();var t=ns[si];ns[si]=ns[si+dir];ns[si+dir]=t;return Object.assign({},b,{sets:ns});});});}

  function save(){
    setErr('');
    if(!date){setErr('Date required');return;}
    var cleaned=blocks.filter(function(b){return b.name.trim();}).map(function(b){
      return{name:b.name.trim(),target:(b.target||'').trim(),sets:b.sets.filter(function(s){return s.reps!=='';}).map(function(s){
        return{weight:s.weight===''?null:parseFloat(s.weight)||null,reps:isNaN(Number(s.reps))?s.reps:Number(s.reps)};
      })};
    }).filter(function(b){return b.sets.length>0;});
    if(!cleaned.length){setErr('Add at least one set');return;}
    var sess={id:init.id || uid(),date:date,label:fmtLabel(date),warmup:warmup.trim(),blocks:cleaned};
    
    if(init.id){
      var oldVol=calcTotalVol(init);
      var newVol=calcTotalVol(sess);
      if(oldVol>0&&newVol<oldVol*0.8){
        if(!confirm('Total volume dropped significantly ('+oldVol.toLocaleString()+'kg → '+newVol.toLocaleString()+'kg). Save changes?'))return;
      }
    }
    
    setSaving(true);
    props.onSave(sess).catch(function(){setErr('Save failed');setSaving(false);});
  }

  return html`<div class="card" style="padding:16px;margin-bottom:16px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
      <span style="font-size:14px;font-weight:700;color:var(--blue)">${init.id?'Edit':'New'} Strength Session</span>
      <div style="display:flex;gap:8px">
        <button class="btn-sm btn-ghost" style="padding:4px 8px;font-size:14px" onclick=${()=>setShowPm(!showPm)}>🧮</button>
        <button class="btn-sm btn-ghost" onclick=${props.onCancel}>Cancel</button>
      </div>
    </div>
    ${showPm?html`
      <div style="background:var(--bg);border:1px solid var(--bd);border-radius:12px;padding:12px;margin-bottom:12px">
        <div style="font-size:12px;font-weight:700;margin-bottom:10px;color:var(--blue)">Plate Calculator</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
          <div><label class="lbl">Target kg</label><input type="number" class="inp" value=${pmW} oninput=${(e)=>setPmW(e.target.value)} placeholder="100"/></div>
          <div><label class="lbl">Bar kg</label><input type="number" class="inp" value=${pmB} oninput=${(e)=>setPmB(Number(e.target.value))}/></div>
        </div>
        ${pmW?html`
          <div style="padding-top:10px;border-top:1px solid var(--bd)">
            <div style="font-size:11px;color:var(--mu);margin-bottom:6px">Load on EACH side:</div>
            <div style="display:flex;flex-wrap:wrap;gap:4px">
              ${pmPlates.length?pmPlates.map(function(p){return html`<div style="background:var(--blue);color:#fff;font-weight:800;font-size:12px;padding:4px 8px;border-radius:4px">${p}</div>`;}):html`<div style="font-size:12px;color:var(--mu)">Bar only</div>`}
            </div>
            ${pmRem>0?html`<div style="font-size:10px;color:var(--orange);margin-top:6px">Note: ${pmRem.toFixed(2)}kg short of target.</div>`:null}
          </div>
        `:null}
      </div>
    `:null}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
      <div><label class="lbl">Date</label><input type="date" class="inp" value=${date} onchange=${(e)=>setDate(e.target.value)}/></div>
      <div><label class="lbl">Warm-up</label><input type="text" class="inp" value=${warmup} oninput=${(e)=>setWarmup(e.target.value)} placeholder="Row 5 min"/></div>
    </div>
    ${blocks.map(function(block,bi){return html`
      <div style="background:var(--bg);border:1px solid var(--bd);border-radius:12px;padding:12px;margin-bottom:10px">
        <div style="display:flex;gap:8px;margin-bottom:10px;align-items:center">
          <select class="inp" style="flex:1" value=${block.name} onchange=${(e)=>updName(bi,e.target.value)}>
            <option value="">— Select exercise —</option>
            ${Object.keys(EXERCISE_LIB).map(function(cat){return html`<optgroup label=${cat}>${EXERCISE_LIB[cat].map(function(ex){return html`<option value=${ex}>${ex}</option>`;})}</optgroup>`;})}
            <option value=${block.name&&!Object.values(EXERCISE_LIB).flat().includes(block.name)?block.name:''} selected=${block.name&&!Object.values(EXERCISE_LIB).flat().includes(block.name)}>${block.name&&!Object.values(EXERCISE_LIB).flat().includes(block.name)?block.name:''}</option>
          </select>
          <div style="display:flex;gap:2px">
            <button class="btn-sm btn-ghost" style="padding:4px 8px" onclick=${()=>moveBlock(bi,-1)} disabled=${bi===0}>↑</button>
            <button class="btn-sm btn-ghost" style="padding:4px 8px" onclick=${()=>moveBlock(bi,1)} disabled=${bi===blocks.length-1}>↓</button>
            <button class="btn-sm" style="background:rgba(248,113,113,0.15);color:var(--red);margin-left:4px" onclick=${()=>removeBlock(bi)}>×</button>
          </div>
        </div>
        <input type="text" class="inp" style="margin-bottom:8px" value=${block.name} oninput=${(e)=>updName(bi,e.target.value)} placeholder="Or type custom exercise name"/>
        <input type="text" class="inp" style="margin-bottom:8px;font-size:12px;padding:8px 14px" value=${block.target||''} oninput=${(e)=>updTarget(bi,e.target.value)} placeholder="Target RPE / RIR / Notes (optional)"/>
        ${block.sets.map(function(set,si){return html`
          <div style="display:grid;grid-template-columns:24px 1fr 1fr 50px 28px;gap:6px;margin-bottom:6px;align-items:center">
            <div style="color:var(--mu);font-size:12px;text-align:center">${si+1}</div>
            <input type="number" class="inp" value=${set.weight} oninput=${(e)=>updSet(bi,si,'weight',e.target.value)} placeholder="kg"/>
            <input type="text" class="inp" value=${set.reps} oninput=${(e)=>updSet(bi,si,'reps',e.target.value)} placeholder="reps"/>
            <div style="display:flex;gap:2px">
              <button class="btn-sm btn-ghost" style="padding:4px 6px" onclick=${()=>moveSet(bi,si,-1)} disabled=${si===0}>↑</button>
              <button class="btn-sm btn-ghost" style="padding:4px 6px" onclick=${()=>moveSet(bi,si,1)} disabled=${si===block.sets.length-1}>↓</button>
            </div>
            <button class="btn-sm btn-ghost" onclick=${()=>removeSet(bi,si)}>−</button>
          </div>`;})}
        <button class="btn-sm btn-ghost" style="margin-top:6px" onclick=${()=>addSet(bi)}>+ Set</button>
      </div>`;})}
    <button class="btn btn-outline" style="margin-bottom:12px" onclick=${addBlock}>+ Add Exercise</button>
    ${err?html`<div class="err">${err}</div>`:null}
    <button class="btn btn-primary" onclick=${save} disabled=${saving}>${saving?'Saving...':'Save Session'}</button>
  </div>`;
}

export function CardioForm(props){
  var init = props.initialData || {};
  var ds=useState(init.date || todayISO());var cd=ds[0];var setCd=ds[1];
  var ts=useState(init.type || 'Run');var ct=ts[0];var setCt=ts[1];
  var durs=useState(init.duration || '');var cDur=durs[0];var setCDur=durs[1];
  var dists=useState(init.distanceKm || '');var cDist=dists[0];var setCDist=dists[1];
  var ahrs=useState(init.avgHR || '');var cAvgHR=ahrs[0];var setCAvgHR=ahrs[1];
  var mhrs=useState(init.maxHR || '');var cMaxHR=mhrs[0];var setCMaxHR=mhrs[1];
  var elevs=useState(init.elevationM !== undefined ? init.elevationM : '');var cElev=elevs[0];var setCElev=elevs[1];
  var kcals=useState(init.totalKcal || '');var cKcal=kcals[0];var setCKcal=kcals[1];
  var effs=useState(init.effortScore || 5);var cEff=effs[0];var setCEff=effs[1];
  var notesS=useState(init.notes || '');var cNotes=notesS[0];var setCNotes=notesS[1];
  var spS=useState(init.splits || []);var splits=spS[0];var setSplits=spS[1];
  var sv=useState(false);var saving=sv[0];var setSaving=sv[1];
  var es=useState('');var err=es[0];var setErr=es[1];

  function addSplit(){setSplits(function(p){return p.concat([{km:p.length+1,time:'',pace:'',hr:''}]);});}
  function removeSplit(idx){if(confirm('Delete this split?'))setSplits(function(p){return p.filter(function(_,i){return i!==idx;}).map(function(s,i){var ns=Object.assign({},s);ns.km=i+1;return ns;});});}
  function updSplit(idx,f,v){setSplits(function(p){return p.map(function(s,i){if(i!==idx)return s;var ns=Object.assign({},s);ns[f]=v;return ns;});});}
  function moveSplit(idx,dir){if(idx+dir<0||idx+dir>=splits.length)return;setSplits(function(p){var n=p.slice();var t=n[idx];n[idx]=n[idx+dir];n[idx+dir]=t;return n.map(function(s,i){var ns=Object.assign({},s);ns.km=i+1;return ns;});});}

  function save(){
    setErr('');
    if(!cd){setErr('Date required');return;}
    if(!cDur){setErr('Duration required');return;}
    var distNum=parseFloat(cDist)||0,hrNum=parseInt(cAvgHR)||0;
    setSaving(true);
    var cleanedSplits=splits.filter(function(s){return s.time||s.pace||s.hr;}).map(function(s,i){
      return {km:i+1,time:s.time||'-',pace:s.pace||'-',hr:parseInt(s.hr)||0};
    });
    var sess={id:init.id || uid(),date:cd,label:fmtLabel(cd),type:ct,duration:cDur,distanceKm:distNum,elevationM:parseInt(cElev)||0,avgPace:'-',avgHR:hrNum,maxHR:parseInt(cMaxHR)||0,activeKcal:parseInt(cKcal)||0,totalKcal:parseInt(cKcal)||0,effortScore:cEff,effortLabel:EFFORT_LBL[cEff]||'Moderate',hrZone:hrZoneFrom(hrNum),notes:cNotes.trim(),splits:cleanedSplits};
    props.onSave(sess).catch(function(){setErr('Save failed');setSaving(false);});
  }

  return html`<div class="card" style="padding:16px;margin-bottom:16px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
      <span style="font-size:14px;font-weight:700;color:var(--blue)">${init.id?'Edit':'New'} Cardio Session</span>
      <button class="btn-sm btn-ghost" onclick=${props.onCancel}>Cancel</button>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
      <div><label class="lbl">Date</label><input type="date" class="inp" value=${cd} onchange=${(e)=>setCd(e.target.value)}/></div>
      <div><label class="lbl">Type</label><select class="inp" value=${ct} onchange=${(e)=>setCt(e.target.value)}>${CARDIO_TYPES.map(function(t){return html`<option value=${t}>${t}</option>`;})}</select></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px">
      <div><label class="lbl">Time</label><input type="text" class="inp" value=${cDur} oninput=${(e)=>setCDur(e.target.value)} placeholder="45:31"/></div>
      <div><label class="lbl">km</label><input type="number" class="inp" value=${cDist} oninput=${(e)=>setCDist(e.target.value)} placeholder="7.21"/></div>
      <div><label class="lbl">Elev m</label><input type="number" class="inp" value=${cElev} oninput=${(e)=>setCElev(e.target.value)} placeholder="62"/></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px">
      <div><label class="lbl">Avg HR</label><input type="number" class="inp" value=${cAvgHR} oninput=${(e)=>setCAvgHR(e.target.value)} placeholder="145"/></div>
      <div><label class="lbl">Max HR</label><input type="number" class="inp" value=${cMaxHR} oninput=${(e)=>setCMaxHR(e.target.value)} placeholder="162"/></div>
      <div><label class="lbl">kcal</label><input type="number" class="inp" value=${cKcal} oninput=${(e)=>setCKcal(e.target.value)} placeholder="612"/></div>
    </div>
    <div style="margin-bottom:14px">
      <label class="lbl">Effort ${cEff}/10 — ${EFFORT_LBL[cEff]}</label>
      <input type="range" min="1" max="10" value=${cEff} onchange=${(e)=>setCEff(Number(e.target.value))}/>
    </div>
    <div style="margin-bottom:14px">
      <label class="lbl">Notes (optional)</label>
      <input type="text" class="inp" value=${cNotes} oninput=${(e)=>setCNotes(e.target.value)} placeholder="How did it feel?"/>
    </div>
    
    <div style="background:var(--bg);border:1px solid var(--bd);border-radius:12px;padding:12px;margin-bottom:14px">
      <label class="lbl">Splits</label>
      ${splits.map(function(sp,i){return html`<div style="display:grid;grid-template-columns:24px 1fr 1fr 1fr 50px 28px;gap:6px;align-items:center;margin-bottom:6px">
        <div style="font-size:12px;color:var(--mu);text-align:center">${sp.km}</div>
        <input type="text" class="inp" value=${sp.time} oninput=${(e)=>updSplit(i,'time',e.target.value)} placeholder="Time"/>
        <input type="text" class="inp" value=${sp.pace} oninput=${(e)=>updSplit(i,'pace',e.target.value)} placeholder="Pace"/>
        <input type="number" class="inp" value=${sp.hr} oninput=${(e)=>updSplit(i,'hr',e.target.value)} placeholder="HR"/>
        <div style="display:flex;gap:2px">
          <button class="btn-sm btn-ghost" style="padding:4px 6px" onclick=${()=>moveSplit(i,-1)} disabled=${i===0}>↑</button>
          <button class="btn-sm btn-ghost" style="padding:4px 6px" onclick=${()=>moveSplit(i,1)} disabled=${i===splits.length-1}>↓</button>
        </div>
        <button class="btn-sm btn-ghost" style="color:var(--red);padding:4px" onclick=${()=>removeSplit(i)}>×</button>
      </div>`;})}
      <button class="btn-sm btn-ghost" style="margin-top:6px" onclick=${addSplit}>+ Add Split</button>
    </div>
    
    ${err?html`<div class="err">${err}</div>`:null}
    <button class="btn btn-primary" onclick=${save} disabled=${saving}>${saving?'Saving...':'Save Session'}</button>
  </div>`;
}

export function HomeScreen(props){
  var str=props.strSessions,car=props.carSessions;
  var planWk=currentPlanWeek(str);
  var planRow=PLAN[planWk-1]||PLAN[0];
  var dow=['sun','mon','tue','wed','thu','fri','sat'][new Date().getDay()];
  var todayPrescription=planRow[dow]||'Rest';
  var lastStr=str.length?str[0]:null;
  var lastCar=car.length?car[0]:null;
  var weekVol=str.filter(function(s){var d=new Date(s.date+'T12:00:00'),now=new Date();return (now-d)<7*24*60*60*1000;}).reduce(function(a,s){return a+calcTotalVol(s);},0);
  var weekKm=car.filter(function(s){var d=new Date(s.date+'T12:00:00'),now=new Date();return(now-d)<7*24*60*60*1000;}).reduce(function(a,s){return a+s.distanceKm;},0);
  var bodyState=useState(new Set());var selBody=bodyState[0];var setSelBody=bodyState[1];
  function toggleBody(part){setSelBody(function(p){var n=new Set(p);if(n.has(part))n.delete(part);else n.add(part);return n;});}
  var qCount=useState(0);var queueN=qCount[0];var setQueueN=qCount[1];
  useEffect(function(){dbGetAll('syncQueue').then(function(q){setQueueN(q.length);});},[]);
  var syncCfg=getSyncConfig();

  var initMac={"cals":2500,"pro":180,"carbs":250,"fat":75};
  try { initMac=JSON.parse(localStorage.getItem('ww_macros')||'{"cals":2500,"pro":180,"carbs":250,"fat":75}'); } catch(e) {}
  var macEditS=useState(false);var macEdit=macEditS[0];var setMacEdit=macEditS[1];
  var macS=useState(initMac);var mac=macS[0];var setMac=macS[1];
  function saveMacros(){
    try { localStorage.setItem('ww_macros', JSON.stringify(mac)); } catch(e) {}
    setMacEdit(false);
  }

  function bodyRec(){
    if(selBody.size===0)return 'Tap body parts for today\'s targeted exercises';
    var recs=[];
    if(selBody.has('chest')||selBody.has('arms'))recs.push('Bench Press');
    if(selBody.has('shoulders'))recs.push('Military Press');
    if(selBody.has('back'))recs.push('Bent Over Row, Deadlift');
    if(selBody.has('core'))recs.push('Plank, Hanging Leg Raise');
    if(selBody.has('glutes')||selBody.has('quads'))recs.push('Bulgarian Split Squat');
    if(selBody.has('calves'))recs.push('Calf Raises');
    return recs.length?recs.join(' · '):'No specific exercises for this area today';
  }

  return html`<div class="screen"><div class="screen-inner">
    <div class="card-hero">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
        <div>
          <div style="font-size:10px;color:var(--blue);text-transform:uppercase;letter-spacing:0.15em;font-weight:700;margin-bottom:4px">WEEK ${planWk} OF 12 · ${planRow.phase}</div>
          <div style="font-size:22px;font-weight:800;letter-spacing:-0.02em">${todayPrescription}</div>
          <div style="font-size:12px;color:var(--mu2);margin-top:2px">${planRow.note}</div>
        </div>
        <div style="font-size:28px">🔥</div>
      </div>
      <div class="pbar-bg" style="margin-top:12px"><div class="pbar" style="width:${(planWk/12)*100}%;background:linear-gradient(90deg,var(--blue),#00e0ff)"></div></div>
      <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--mu);margin-top:6px"><span>Start</span><span>${planWk}/12 weeks</span><span>Test</span></div>
    </div>

    ${queueN>0&&syncCfg.url?html`
      <div style="background:rgba(251,146,60,0.12);border:1px solid rgba(251,146,60,0.3);border-radius:12px;padding:10px 14px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:12px;color:var(--orange);font-weight:600">☁ ${queueN} session${queueN>1?'s':''} waiting to sync</span>
        <button class="btn-sm" style="background:var(--orange);color:#000" onclick=${()=>{drainSyncQueue().then(function(){dbGetAll('syncQueue').then(function(q){setQueueN(q.length);});});}}>Sync</button>
      </div>`:null}

    <div class="stat-grid">
      <div class="stat"><div class="stat-val" style="color:var(--blue)">${weekVol?weekVol.toLocaleString():'0'}</div><div class="stat-lbl">kg · week</div></div>
      <div class="stat"><div class="stat-val" style="color:var(--green)">${weekKm.toFixed(1)}</div><div class="stat-lbl">km · week</div></div>
      <div class="stat"><div class="stat-val" style="color:var(--gold)">${str.length+car.length}</div><div class="stat-lbl">sessions</div></div>
    </div>

    <div class="card" style="padding:16px;margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <span style="font-size:13px;font-weight:700">Daily Nutrition Targets</span>
        <button class="btn-sm btn-ghost" onclick=${()=>macEdit?saveMacros():setMacEdit(true)}>${macEdit?'Save':'Edit'}</button>
      </div>
      ${macEdit?html`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div><label class="lbl">Kcal</label><input type="number" class="inp" value=${mac.cals} oninput=${(e)=>setMac(Object.assign({},mac,{cals:e.target.value}))}/></div>
        <div><label class="lbl">Protein (g)</label><input type="number" class="inp" value=${mac.pro} oninput=${(e)=>setMac(Object.assign({},mac,{pro:e.target.value}))}/></div>
        <div><label class="lbl">Carbs (g)</label><input type="number" class="inp" value=${mac.carbs} oninput=${(e)=>setMac(Object.assign({},mac,{carbs:e.target.value}))}/></div>
        <div><label class="lbl">Fat (g)</label><input type="number" class="inp" value=${mac.fat} oninput=${(e)=>setMac(Object.assign({},mac,{fat:e.target.value}))}/></div>
      </div>`:html`<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;text-align:center">
        <div><div style="font-size:18px;font-weight:800;color:var(--blue)">${mac.cals}</div><div style="font-size:10px;color:var(--mu);text-transform:uppercase;margin-top:4px">Kcal</div></div>
        <div><div style="font-size:18px;font-weight:800;color:var(--green)">${mac.pro}</div><div style="font-size:10px;color:var(--mu);text-transform:uppercase;margin-top:4px">Pro</div></div>
        <div><div style="font-size:18px;font-weight:800;color:var(--gold)">${mac.carbs}</div><div style="font-size:10px;color:var(--mu);text-transform:uppercase;margin-top:4px">Carb</div></div>
        <div><div style="font-size:18px;font-weight:800;color:var(--orange)">${mac.fat}</div><div style="font-size:10px;color:var(--mu);text-transform:uppercase;margin-top:4px">Fat</div></div>
      </div>`}
    </div>

    <span class="section-lbl">Focus Areas</span>
    <div class="body-map">
      <${BodyMap} selected=${selBody} onSelect=${toggleBody}/>
      <div style="text-align:center;font-size:12px;color:var(--mu2);margin-top:8px;min-height:32px;padding:0 10px">${bodyRec()}</div>
    </div>

    ${lastStr?html`<div class="card">
      <div class="card-hdr"><span class="card-title">Last Strength</span><span style="font-size:11px;color:var(--mu)">${lastStr.label}</span></div>
      <div style="padding:14px 16px;display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-size:13px;color:var(--tx);font-weight:600">${lastStr.blocks.length} exercises</div>
          <div style="font-size:11px;color:var(--mu)">${lastStr.blocks.reduce(function(a,b){return a+b.sets.length;},0)} sets</div>
        </div>
        <div style="font-size:20px;font-weight:800;color:var(--blue)">${calcTotalVol(lastStr).toLocaleString()} <span style="font-size:11px;color:var(--mu)">kg</span></div>
      </div>
    </div>`:null}

    ${lastCar?html`<div class="card">
      <div class="card-hdr"><span class="card-title">Last Cardio</span><span style="font-size:11px;color:var(--mu)">${lastCar.label}</span></div>
      <div style="padding:14px 16px;display:flex;justify-content:space-between;align-items:center">
        <div>
          <span class="pill" style="background:${hrCol(lastCar.avgHR)}22;color:${hrCol(lastCar.avgHR)};border:1px solid ${hrCol(lastCar.avgHR)}66">Z${lastCar.hrZone}</span>
          <span style="font-size:12px;color:var(--mu2)">${lastCar.type}</span>
        </div>
        <div style="text-align:right">
          <div style="font-size:15px;font-weight:700;color:var(--blue)">${lastCar.duration}</div>
          <div style="font-size:11px;color:var(--mu)">${lastCar.avgHR} bpm · ${lastCar.distanceKm}km</div>
        </div>
      </div>
    </div>`:null}

    <span class="section-lbl" style="margin-top:16px">This Week</span>
    <div class="card">
      ${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(function(day,i){
        var keys=['mon','tue','wed','thu','fri','sat','sun'];
        var pres=planRow[keys[i]]||'Rest';
        var isToday=i===((new Date().getDay()+6)%7);
        return html`<div style="padding:11px 16px;border-bottom:1px solid var(--bd);display:flex;justify-content:space-between;align-items:center;background:${isToday?'rgba(0,180,255,0.06)':'transparent'}">
          <span style="font-size:12px;color:${isToday?'var(--blue)':'var(--mu)'};font-weight:${isToday?'700':'500'};width:40px">${day}${isToday?' •':''}</span>
          <span style="font-size:12px;color:${pres==='Rest'?'var(--mu)':'var(--tx)'};font-weight:500">${pres}</span>
        </div>`;
      })}
    </div>
  </div></div>`;
}

export function StrengthScreen(props){
  var str=props.strSessions,setSessions=props.setSessions;
  var showForm=useState(false);var sf=showForm[0];var setSf=showForm[1];
  var selId=useState(null);var sid=selId[0];var setSid=selId[1];
  var editD=useState(null);var editData=editD[0];var setEditData=editD[1];
  var selSess=sid?str.find(function(s){return s.id===sid;}):str[0];

  function saveSession(sess){
    return dbPut('strength',sess).then(function(){return queueSync('logStrength',sess);}).then(function(){
      setSessions(function(p){return [sess].concat(p.filter(function(s){return s.id!==sess.id;})).sort(function(a,b){return a.date<b.date?1:-1;});});
      setSid(sess.id);setSf(false);
      drainSyncQueue();
    });
  }

  function deleteSessionAction(id){
    if(!confirm('Delete this session?'))return;
    dbDelete('strength',id).then(function(){return queueSync('deleteSession',{id:id});}).then(function(){
      setSessions(function(p){return p.filter(function(s){return s.id!==id;});});
      setSid(null);
      drainSyncQueue();
    });
  }

  function duplicateSession(sess){
    var dup=JSON.parse(JSON.stringify(sess));
    delete dup.id;
    dup.date=todayISO();
    dup.label=fmtLabel(dup.date);
    setEditData(dup);setSf(true);
  }

  return html`<div class="screen"><div class="screen-inner">
    ${sf?html`<${StrengthForm} initialData=${editData} onSave=${saveSession} onCancel=${()=>{setSf(false);setEditData(null);}}/>`
       :html`<button class="btn btn-primary" style="margin-bottom:16px" onclick=${()=>{setEditData(null);setSf(true);}}>+ Log Strength Session</button>`}
    ${!sf&&selSess?html`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div style="font-size:11px;color:var(--mu);text-transform:uppercase;letter-spacing:0.1em">Viewing: ${selSess.label}</div>
        <div style="display:flex;gap:8px">
          <button class="btn-sm btn-outline" style="padding:4px 8px;border-color:rgba(248,113,113,0.4);color:var(--red)" onclick=${()=>deleteSessionAction(selSess.id)}>Delete</button>
          <button class="btn-sm btn-outline" style="padding:4px 8px" onclick=${()=>duplicateSession(selSess)}>Duplicate</button>
          <button class="btn-sm btn-outline" style="padding:4px 8px" onclick=${()=>{setEditData(selSess);setSf(true);}}>Edit</button>
        </div>
      </div>
      <div class="stat-grid">
        <div class="stat"><div class="stat-val" style="color:var(--blue)">${calcTotalVol(selSess).toLocaleString()}</div><div class="stat-lbl">Vol kg</div></div>
        <div class="stat"><div class="stat-val" style="color:var(--blue)">${selSess.blocks.length}</div><div class="stat-lbl">Exercises</div></div>
        <div class="stat"><div class="stat-val" style="color:var(--blue)">${selSess.blocks.reduce(function(s,b){return s+b.sets.length;},0)}</div><div class="stat-lbl">Sets</div></div>
      </div>
      ${selSess.warmup?html`<div class="tag" style="margin-bottom:12px">🔥 ${selSess.warmup}</div>`:null}
      ${selSess.blocks.map(function(bl){
        var vol=calcVol(bl.sets),top=topWt(bl.sets);
        var topSet=bl.sets.reduce(function(best,s){if(!s.weight||typeof s.reps!=='number')return best;var e=epley(s.weight,s.reps);return(!best||e>best.e1rm)?{e1rm:e,w:s.weight,r:s.reps}:best;},null);
        return html`<div class="card">
          <div class="card-hdr" style="align-items:flex-start">
            <div>
              <div class="card-title" style="color:var(--blue)">${bl.name}</div>
              ${bl.target?html`<div style="font-size:11px;color:var(--mu);margin-top:4px;text-transform:none;letter-spacing:0;font-weight:500">🎯 ${bl.target}</div>`:null}
              ${bl.notes?html`<div style="font-size:11px;color:var(--mu);margin-top:4px;text-transform:none;letter-spacing:0;font-style:italic">📝 ${bl.notes}</div>`:null}
            </div>
            <div style="font-size:11px;color:var(--mu);text-align:right">
              ${top>0?html`<div>${top}kg · ${vol}kg</div>`:null}
              ${topSet?html`<div style="margin-top:2px">e1RM ${topSet.e1rm}</div>`:null}
            </div>
          </div>
          <table class="tbl">
            <thead><tr>
              <th>Set</th>
              ${bl.sets[0]&&bl.sets[0].weight!==null?html`<th>Weight</th>`:null}
              <th>Reps</th><th>Vol</th>
            </tr></thead>
            <tbody>${bl.sets.map(function(s,si){return html`<tr>
              <td style="color:var(--mu)">${si+1}</td>
              ${s.weight!==null?html`<td style="font-weight:700">${s.weight}kg</td>`:null}
              <td>${s.reps}</td>
              <td style="color:var(--blue);font-weight:600">${s.weight&&typeof s.reps==='number'?s.weight*s.reps:'-'}</td>
            </tr>`;})}
            </tbody>
          </table>
        </div>`;
      })}
      <span class="section-lbl" style="margin-top:20px">History (${str.length})</span>
      <div class="card">
        ${str.map(function(s){return html`<div class="row ${sid===s.id?'selected':''}" onclick=${()=>setSid(s.id)}>
          <div>
            <div style="font-size:13px;font-weight:700">${s.label}</div>
            <div style="font-size:11px;color:var(--mu);margin-top:2px">${s.blocks.length} exercises · ${s.blocks.reduce(function(a,b){return a+b.sets.length;},0)} sets</div>
          </div>
          <div style="font-size:13px;color:var(--blue);font-weight:700">${calcTotalVol(s).toLocaleString()} kg</div>
        </div>`;})}
      </div>
    `:null}
    ${!sf&&!selSess?html`<div style="text-align:center;padding:40px;color:var(--mu)">Tap + above to log your first session</div>`:null}
  </div></div>`;
}

export function CardioScreen(props){
  var car=props.carSessions,setSessions=props.setSessions;
  var showForm=useState(false);var sf=showForm[0];var setSf=showForm[1];
  var selId=useState(null);var sid=selId[0];var setSid=selId[1];
  var editD=useState(null);var editData=editD[0];var setEditData=editD[1];
  var selSess=sid?car.find(function(s){return s.id===sid;}):car[0];
  var sortModeS=useState('date');var sortMode=sortModeS[0];var setSortMode=sortModeS[1];

  function saveSession(sess){
    return dbPut('cardio',sess).then(function(){return queueSync('logCardio',sess);}).then(function(){
      setSessions(function(p){return [sess].concat(p.filter(function(s){return s.id!==sess.id;})).sort(function(a,b){return a.date<b.date?1:-1;});});
      setSid(sess.id);setSf(false);
      drainSyncQueue();
    });
  }

  function deleteSessionAction(id){
    if(!confirm('Delete this session?'))return;
    dbDelete('cardio',id).then(function(){return queueSync('deleteSession',{id:id});}).then(function(){
      setSessions(function(p){return p.filter(function(s){return s.id!==id;});});
      setSid(null);
      drainSyncQueue();
    });
  }

  function deleteSplitRow(idx){
    if(!confirm('Delete this split?'))return;
    var updatedSplits = selSess.splits.filter(function(_,i){return i!==idx;}).map(function(s, i) {
        var newSplit = Object.assign({}, s);
        newSplit.km = i + 1;
        return newSplit;
    });
    var updated = Object.assign({}, selSess, {splits: updatedSplits});
    saveSession(updated);
  }

  function duplicateSession(sess){
    var dup=JSON.parse(JSON.stringify(sess));
    delete dup.id;
    dup.date=todayISO();
    dup.label=fmtLabel(dup.date);
    setEditData(dup);setSf(true);
  }

  var displayCar = car.slice().sort(function(a,b){
    if(sortMode==='pace'){
      function getSecs(d){if(!d)return 0;var p=String(d).split(':').map(Number);return p.length===3?p[0]*3600+p[1]*60+p[2]:p.length===2?p[0]*60+p[1]:p[0]||0;}
      var pA=a.distanceKm>0?getSecs(a.duration)/a.distanceKm:Infinity;
      var pB=b.distanceKm>0?getSecs(b.duration)/b.distanceKm:Infinity;
      if(pA!==pB) return pA-pB;
    }
    return a.date<b.date?1:-1;
  });

  return html`<div class="screen"><div class="screen-inner">
    ${sf?html`<${CardioForm} initialData=${editData} onSave=${saveSession} onCancel=${()=>{setSf(false);setEditData(null);}}/>`
       :html`<button class="btn btn-primary" style="margin-bottom:16px" onclick=${()=>{setEditData(null);setSf(true);}}>+ Log Cardio Session</button>`}
    ${!sf&&selSess?html`
      <div style="margin-bottom:14px;display:flex;justify-content:space-between;align-items:center">
        <div>
          <span class="pill" style="background:${hrCol(selSess.avgHR)}22;color:${hrCol(selSess.avgHR)};border:1px solid ${hrCol(selSess.avgHR)}66">Zone ${selSess.hrZone} · ${zoneName(selSess.hrZone)}</span>
          <span class="tag">${selSess.type}</span>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn-sm btn-outline" style="padding:4px 8px;border-color:rgba(248,113,113,0.4);color:var(--red)" onclick=${()=>deleteSessionAction(selSess.id)}>Delete</button>
          <button class="btn-sm btn-outline" style="padding:4px 8px" onclick=${()=>duplicateSession(selSess)}>Duplicate</button>
          <button class="btn-sm btn-outline" style="padding:4px 8px" onclick=${()=>{setEditData(selSess);setSf(true);}}>Edit</button>
        </div>
      </div>
      ${selSess.notes?html`<div style="font-size:12px;color:var(--mu);margin-bottom:12px;font-style:italic">📝 ${selSess.notes}</div>`:null}
      <div class="stat-grid">
        <div class="stat"><div class="stat-val" style="color:var(--blue)">${selSess.distanceKm}</div><div class="stat-lbl">km</div></div>
        <div class="stat"><div class="stat-val" style="color:var(--blue)">${selSess.duration}</div><div class="stat-lbl">Time</div></div>
        <div class="stat"><div class="stat-val" style="color:var(--red)">${selSess.avgHR}</div><div class="stat-lbl">Avg HR</div></div>
      </div>
      <div class="stat-grid">
        <div class="stat"><div class="stat-val" style="color:var(--green)">${selSess.elevationM}m</div><div class="stat-lbl">Elev</div></div>
        <div class="stat"><div class="stat-val" style="color:var(--gold)">${selSess.totalKcal}</div><div class="stat-lbl">kcal</div></div>
        <div class="stat"><div class="stat-val" style="color:var(--blue)">${selSess.effortScore}/10</div><div class="stat-lbl">${selSess.effortLabel}</div></div>
      </div>
      ${selSess.splits&&selSess.splits.length>0?html`<div class="card">
        <div class="card-hdr"><span class="card-title">Splits</span></div>
        <table class="tbl">
          <thead><tr><th>km</th><th>Time</th><th>Pace</th><th>HR</th><th></th></tr></thead>
          <tbody>${selSess.splits.map(function(sp, i){return html`<tr>
            <td style="color:var(--mu)">${sp.km}</td>
            <td style="font-weight:700">${sp.time}</td>
            <td>${sp.pace}</td>
            <td style="color:${hrCol(sp.hr)};font-weight:700">${sp.hr}</td>
            <td style="text-align:right"><button class="btn-sm btn-ghost" style="padding:2px 8px;color:var(--red);font-size:14px" onclick=${()=>deleteSplitRow(i)}>×</button></td>
          </tr>`;})}
          </tbody>
        </table>
      </div>`:null}
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:20px;margin-bottom:8px">
        <span class="section-lbl" style="margin:0">History (${car.length})</span>
        <select class="inp" style="width:auto;padding:4px 8px;font-size:11px;min-height:0" value=${sortMode} onchange=${(e)=>setSortMode(e.target.value)}>
          <option value="date">Date</option>
          <option value="pace">Fastest Pace</option>
        </select>
      </div>
      <div class="card">
        ${displayCar.map(function(s){return html`<div class="row ${sid===s.id?'selected':''}" onclick=${()=>setSid(s.id)}>
          <div>
            <div style="font-size:13px;font-weight:700">${s.label}</div>
            <div style="font-size:11px;color:var(--mu);margin-top:2px">${s.type} · ${s.distanceKm}km · Z${s.hrZone}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:12px;color:var(--blue);font-weight:700">${s.duration}</div>
            <div style="font-size:10px;color:var(--mu)">${s.avgHR} bpm</div>
          </div>
        </div>`;})}
      </div>
    `:null}
    ${!sf&&!selSess?html`<div style="text-align:center;padding:40px;color:var(--mu)">Tap + above to log cardio</div>`:null}
  </div></div>`;
}

export function ProgressScreen(props){
  var str=props.strSessions,car=props.carSessions;
  var bioS=useState([]);var bioEntries=bioS[0];var setBioEntries=bioS[1];
  var viewS=useState('trends');var view=viewS[0];var setView=viewS[1];

  var today=new Date();
  var calDateS=useState(new Date(today.getFullYear(), today.getMonth(), 1));var calDate=calDateS[0];var setCalDate=calDateS[1];
  var selDateS=useState(todayISO());var selDate=selDateS[0];var setSelDate=selDateS[1];

  useEffect(function(){
    dbGetAll('biofeedback').then(function(d){
      setBioEntries(d.sort(function(a,b){return a.date>b.date?1:-1;}));
    }).catch(function(err){ console.error('Failed to load biofeedback:', err); });
  },[]);

  var calY=calDate.getFullYear(), calM=calDate.getMonth();
  var firstDay=(new Date(calY, calM, 1).getDay()+6)%7;
  var daysInM=new Date(calY, calM+1, 0).getDate();
  var calDays=[];
  for(var i=0;i<firstDay;i++) calDays.push(null);
  for(var i=1;i<=daysInM;i++) calDays.push(i);

  var sessMap={};
  str.forEach(function(s){ sessMap[s.date]=sessMap[s.date]||{str:[],car:[]}; sessMap[s.date].str.push(s); });
  car.forEach(function(s){ sessMap[s.date]=sessMap[s.date]||{str:[],car:[]}; sessMap[s.date].car.push(s); });

  function prevMonth(){setCalDate(new Date(calY, calM-1, 1));}
  function nextMonth(){setCalDate(new Date(calY, calM+1, 1));}
  var monthName = calDate.toLocaleDateString('en-GB', {month:'long', year:'numeric'});
  var selSess = sessMap[selDate] || {str:[], car:[]};

  var firstSessionDate = str.length > 0 ? str.slice().sort(function(a,b){return a.date.localeCompare(b.date);})[0].date : '2026-03-30';
  var startDate = new Date(firstSessionDate + 'T12:00:00');
  var weeks={};
  str.forEach(function(s){
    var d=new Date(s.date+'T12:00:00');
    var wk=Math.floor((d-startDate)/(7*24*60*60*1000))+1;
    weeks[wk]=(weeks[wk]||0)+calcTotalVol(s);
  });
  var wkNums=Object.keys(weeks).map(Number).sort(function(a,b){return a-b;});
  var volData=wkNums.map(function(w){return weeks[w];});
  var volLabels=wkNums.map(function(w){return 'W'+w;});

  var keyLifts=['Bench Press','Bent Over Row','Military Press','Deadlift'];
  var selLiftS=useState(keyLifts[0]);var selLift=selLiftS[0];var setSelLift=selLiftS[1];
  var liftWeeks={};
  str.forEach(function(s){
    var d=new Date(s.date+'T12:00:00');
    var wk=Math.floor((d-startDate)/(7*24*60*60*1000))+1;
    var best=0;
    s.blocks.forEach(function(b){
      if(b.name===selLift){
        b.sets.forEach(function(st){
          if(st.weight&&typeof st.reps==='number'){
            var e=epley(st.weight,st.reps);
            if(e>best)best=e;
          }
        });
      }
    });
    if(best>0){
      if(!liftWeeks[wk]||best>liftWeeks[wk]) liftWeeks[wk]=best;
    }
  });
  var liftWkNums=Object.keys(liftWeeks).map(Number).sort(function(a,b){return a-b;});
  var liftData=liftWkNums.map(function(w){return liftWeeks[w];});
  var liftLabels=liftWkNums.map(function(w){return 'W'+w;});

  var topLoads=keyLifts.map(function(lift){
    var max=0;
    str.forEach(function(s){s.blocks.forEach(function(b){if(b.name===lift){var t=topWt(b.sets);if(t>max)max=t;}});});
    return{name:lift,top:max,e1rm:0};
  });
  topLoads.forEach(function(tl){
    var best=0;
    str.forEach(function(s){s.blocks.forEach(function(b){if(b.name===tl.name){b.sets.forEach(function(st){if(st.weight&&typeof st.reps==='number'){var e=epley(st.weight,st.reps);if(e>best)best=e;}});}});});
    tl.e1rm=best;
  });

  var runSessions=car.filter(function(s){return s.type==='Run'});
  var totalKm=car.reduce(function(a,s){return a+s.distanceKm;},0);

  var recentBio = bioEntries.slice(-14);
  var bioData = recentBio.map(function(e){return e.fatigue;});
  var bioLabels = recentBio.map(function(e){return e.date.slice(8)+'/'+e.date.slice(5,7);});
  var bioColor = bioData.length ? (bioData[bioData.length-1] >= 8 ? 'var(--red)' : (bioData[bioData.length-1] >= 5 ? 'var(--orange)' : 'var(--green)')) : 'var(--orange)';

  return html`<div class="screen"><div class="screen-inner">
    <div style="font-size:20px;font-weight:800;letter-spacing:-0.02em;margin-bottom:4px">Your Progress</div>
    <div style="font-size:11px;color:var(--mu);margin-bottom:16px;text-transform:uppercase;letter-spacing:0.12em">Week ${currentPlanWeek(str)} of 12</div>
    <div style="display:flex;gap:6px;background:var(--bg2);border:1px solid var(--bd);border-radius:12px;padding:4px;margin-bottom:16px">
      <button onclick=${()=>setView('trends')} style="flex:1;padding:10px;border:none;border-radius:9px;font-family:inherit;font-weight:700;font-size:12px;cursor:pointer;background:${view==='trends'?'var(--blue)':'transparent'};color:${view==='trends'?'#fff':'var(--mu2)'}">Trends</button>
      <button onclick=${()=>setView('calendar')} style="flex:1;padding:10px;border:none;border-radius:9px;font-family:inherit;font-weight:700;font-size:12px;cursor:pointer;background:${view==='calendar'?'var(--blue)':'transparent'};color:${view==='calendar'?'#fff':'var(--mu2)'}">Calendar</button>
    </div>
    ${view==='trends'?html`
      <div class="card" style="padding:16px;margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <span style="font-size:13px;font-weight:700">Weekly Volume Trend</span>
          <span style="font-size:16px;font-weight:800;color:var(--blue)">${volData.length?volData[volData.length-1].toLocaleString():0} <span style="font-size:10px;color:var(--mu)">kg</span></span>
        </div>
        <${LineChart} data=${volData} labels=${volLabels} color="#00b4ff"/>
      </div>
      <div class="card" style="padding:16px;margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <span style="font-size:13px;font-weight:700">Estimated 1RM Trend</span>
          <select class="inp" style="width:140px;padding:4px 8px;font-size:11px;min-height:0" value=${selLift} onchange=${(e)=>setSelLift(e.target.value)}>
            ${keyLifts.map(function(l){return html`<option value=${l}>${l}</option>`;})}
          </select>
        </div>
        <div style="font-size:16px;font-weight:800;color:var(--green);margin-bottom:6px">${liftData.length?liftData[liftData.length-1]+' kg':''}</div>
        <${LineChart} data=${liftData} labels=${liftLabels} color="var(--green)"/>
      </div>
      <div class="card" style="padding:16px;margin-bottom:12px">
        <div style="font-size:13px;font-weight:700;margin-bottom:12px">Top Loads · Estimated 1RM</div>
        ${topLoads.map(function(tl){
          var pct=tl.e1rm?(tl.top/tl.e1rm)*100:0;
          return html`<div style="margin-bottom:12px">
            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
              <span>${tl.name}</span>
              <span style="color:var(--blue);font-weight:700">${tl.top?tl.top+'kg':'—'}${tl.e1rm?' · e1RM '+tl.e1rm:''}</span>
            </div>
            <div class="pbar-bg"><div class="pbar" style="width:${Math.min(pct,100)}%;background:linear-gradient(90deg,var(--blue),#00e0ff)"></div></div>
          </div>`;
        })}
      </div>
      ${bioData.length?html`<div class="card" style="padding:16px;margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <span style="font-size:13px;font-weight:700">Biofeedback · Fatigue</span>
          <span style="font-size:16px;font-weight:800;color:${bioColor}">${bioData[bioData.length-1]} <span style="font-size:10px;color:var(--mu)">/10</span></span>
        </div>
        <${LineChart} data=${bioData} labels=${bioLabels} color=${bioColor}/>
      </div>`:null}
      <div class="stat-grid">
        <div class="stat"><div class="stat-val" style="color:var(--green)">${totalKm.toFixed(1)}</div><div class="stat-lbl">Total km</div></div>
        <div class="stat"><div class="stat-val" style="color:var(--red)">${runSessions.length}</div><div class="stat-lbl">Runs</div></div>
        <div class="stat"><div class="stat-val" style="color:var(--gold)">${str.length}</div><div class="stat-lbl">Strength</div></div>
      </div>
    `:null}
    ${view==='calendar'?html`
      <div class="card" style="padding:16px;margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <button class="btn-sm btn-ghost" onclick=${prevMonth} style="font-size:14px">◀</button>
          <span style="font-size:14px;font-weight:800">${monthName}</span>
          <button class="btn-sm btn-ghost" onclick=${nextMonth} style="font-size:14px">▶</button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center;margin-bottom:8px">
          ${['M','T','W','T','F','S','S'].map(function(d){return html`<div style="font-size:10px;color:var(--mu);font-weight:700">${d}</div>`;})}
        </div>
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px">
          ${calDays.map(function(d){
            if(!d) return html`<div></div>`;
            var iso = calY + '-' + String(calM+1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
            var isSel = iso === selDate;
            var isToday = iso === todayISO();
            var daySess = sessMap[iso] || {str:[], car:[]};
            return html`<button onclick=${()=>setSelDate(iso)} style="aspect-ratio:1;border:none;border-radius:8px;border:1px solid ${isSel?'var(--blue)':isToday?'var(--bd)':'transparent'};background:${isSel?'rgba(0,180,255,0.1)':isToday?'var(--bg3)':'var(--bg2)'};color:${isToday?'var(--blue)':'var(--tx)'};display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;font-family:inherit;transition:all 0.15s">
              <span style="font-size:13px;font-weight:${isToday||isSel?'800':'500'}">${d}</span>
              <div style="display:flex;gap:3px;margin-top:4px;height:4px;justify-content:center;flex-wrap:wrap">
                ${daySess.str.map(function(){return html`<div style="width:4px;height:4px;border-radius:50%;background:var(--blue)"></div>`;})}
                ${daySess.car.map(function(){return html`<div style="width:4px;height:4px;border-radius:50%;background:var(--green)"></div>`;})}
              </div>
            </button>`;
          })}
        </div>
      </div>
      <div style="margin-bottom:12px">
        <span class="section-lbl">${selDate === todayISO() ? 'Today' : fmtLabel(selDate)}</span>
        ${selSess.str.length===0 && selSess.car.length===0 ? html`<div style="padding:16px;text-align:center;color:var(--mu);font-size:12px;background:var(--bg2);border-radius:12px;border:1px solid var(--bd)">Rest day</div>` : null}
        ${selSess.str.map(function(s){return html`<div class="card" style="padding:14px"><div style="font-size:13px;font-weight:700;color:var(--blue);margin-bottom:4px">💪 ${s.label}</div><div style="font-size:11px;color:var(--mu)">${s.blocks.length} exercises · ${s.blocks.reduce(function(a,b){return a+b.sets.length;},0)} sets · ${calcTotalVol(s).toLocaleString()} kg</div></div>`;})}
        ${selSess.car.map(function(s){return html`<div class="card" style="padding:14px"><div style="font-size:13px;font-weight:700;color:var(--green);margin-bottom:4px">🏃 ${s.type}</div><div style="font-size:11px;color:var(--mu)">${s.duration} · ${s.distanceKm} km · Z${s.hrZone}</div></div>`;})}
      </div>
    `:null}
  </div></div>`;
}

export function PlanScreen(props){
  var str=props.strSessions, car=props.carSessions||[], setStr=props.setStrSessions, setCar=props.setCarSessions;
  var currentWk=currentPlanWeek(str);
  var selWk=useState(currentWk);var sw=selWk[0];var setSw=selWk[1];
  var planRow=PLAN[sw-1]||PLAN[0];
  var blockCol={'B1':'var(--blue)','B2':'var(--blue)','B3':'var(--accent)','DL':'var(--orange)','TST':'var(--green)'};
  var col=blockCol[planRow.block]||'var(--tx)';

  function duplicateWeek(){
    if(!confirm('Copy all logged sessions from Week '+sw+' to Week '+currentWk+'?'))return;
    var sorted=str.slice().sort(function(a,b){return a.date>b.date?1:-1;});
    var firstDateStr=sorted.length?sorted[0].date:todayISO();
    var firstDate=new Date(firstDateStr+'T12:00:00');
    var daysOffset=(currentWk-sw)*7;
    
    function isInWeek(sess,w){
      var d=new Date(sess.date+'T12:00:00');
      var diff=Math.floor((d-firstDate)/(7*24*60*60*1000))+1;
      return diff===w;
    }
    
    var strToCopy=str.filter(function(s){return isInWeek(s,sw);});
    var carToCopy=car.filter(function(s){return isInWeek(s,sw);});
    if(!strToCopy.length&&!carToCopy.length){alert('No sessions found in Week '+sw);return;}
    
    var newStr=[],newCar=[],promises=[];
    function processDup(sess,arr,storeName,syncAction){
      var dup=JSON.parse(JSON.stringify(sess));
      dup.id=uid();
      var d=new Date(dup.date+'T12:00:00');
      d.setDate(d.getDate()+daysOffset);
      dup.date=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
      dup.label=fmtLabel(dup.date);
      arr.push(dup);
      promises.push(dbPut(storeName,dup).then(function(){return queueSync(syncAction,dup);}));
    }
    strToCopy.forEach(function(s){processDup(s,newStr,'strength','logStrength');});
    carToCopy.forEach(function(s){processDup(s,newCar,'cardio','logCardio');});
    
    Promise.all(promises).then(function(){
      if(setStr&&newStr.length)setStr(function(p){return p.concat(newStr).sort(function(a,b){return a.date<b.date?1:-1;});});
      if(setCar&&newCar.length)setCar(function(p){return p.concat(newCar).sort(function(a,b){return a.date<b.date?1:-1;});});
      drainSyncQueue();
      alert('Copied '+(newStr.length+newCar.length)+' sessions to Week '+currentWk);
    });
  }

  return html`<div class="screen"><div class="screen-inner">
    <div style="font-size:20px;font-weight:800;letter-spacing:-0.02em;margin-bottom:4px">12-Week Mesocycle</div>
    <div style="font-size:11px;color:var(--mu);margin-bottom:18px;text-transform:uppercase;letter-spacing:0.12em">Currently on Week ${currentWk}</div>
    <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:6px;margin-bottom:16px">
      ${PLAN.map(function(p){
        var bc=blockCol[p.block]||'var(--tx)';
        var isSel=p.wk===sw,isCur=p.wk===currentWk;
        return html`<button onclick=${()=>setSw(p.wk)} style="padding:10px 0;border:1px solid ${isSel?bc:'var(--bd)'};border-radius:10px;background:${isSel?'rgba(0,180,255,0.1)':isCur?'rgba(0,180,255,0.04)':'var(--bg2)'};color:${isSel?bc:'var(--mu2)'};font-size:11px;font-weight:${isSel?'800':'500'};cursor:pointer;font-family:inherit">
          <div>W${p.wk}</div>
          <div style="font-size:9px;opacity:0.8;margin-top:2px">${p.block}</div>
        </button>`;
      })}
    </div>
    <div class="card" style="border-color:${col}44;margin-bottom:12px">
      <div class="card-hdr" style="background:${col}11">
        <div>
          <div style="font-size:14px;font-weight:800">Week ${sw} · ${planRow.phase}</div>
          <div style="font-size:11px;color:var(--mu);margin-top:2px">${planRow.note}</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          ${sw!==currentWk?html`<button class="btn-sm btn-outline" style="padding:4px 8px" onclick=${duplicateWeek}>Copy to W${currentWk}</button>`:null}
          <span class="pill" style="margin:0;background:${col}22;color:${col};border:1px solid ${col}66">${planRow.block}</span>
        </div>
      </div>
      ${[['Mon',planRow.mon],['Tue',planRow.tue],['Wed',planRow.wed],['Thu',planRow.thu],['Fri',planRow.fri],['Sat',planRow.sat],['Sun',planRow.sun]].map(function(item){
        var isRest=item[1]==='Rest';
        return html`<div style="padding:11px 16px;border-bottom:1px solid var(--bd);display:flex;justify-content:space-between">
          <span style="font-size:12px;color:var(--mu);font-weight:700;width:36px">${item[0]}</span>
          <span style="font-size:12px;color:${isRest?'var(--mu)':'var(--tx)'};flex:1;text-align:right">${item[1]}</span>
        </div>`;
      })}
    </div>
  </div></div>`;
}

export function SyncScreen(props){
  var cfg=getSyncConfig();
  var urlS=useState(cfg.url||'');var url=urlS[0];var setUrl=urlS[1];
  var keyS=useState(cfg.apiKey||'');var key=keyS[0];var setKey=keyS[1];
  var msgS=useState('');var msg=msgS[0];var setMsg=msgS[1];
  var syncingS=useState(false);var syncing=syncingS[0];var setSyncing=syncingS[1];
  var qS=useState(0);var qCount=qS[0];var setQCount=qS[1];

  useEffect(function(){dbGetAll('syncQueue').then(function(q){setQCount(q.length);});},[]);

  function save(){
    setSyncConfig({url:url.trim(),apiKey:key.trim()});
    setMsg('Settings saved');
    setTimeout(function(){setMsg('');},2000);
  }
  function syncNow(){
    if(!url.trim()){setMsg('Enter URL first');return;}
    setSyncing(true);setMsg('Syncing...');
    setSyncConfig({url:url.trim(),apiKey:key.trim()});
    drainSyncQueue(function(done,total){setMsg('Syncing '+done+'/'+total+'...');})
      .then(function(n){return dbGetAll('syncQueue').then(function(q){setQCount(q.length);return n;});})
      .then(function(n){setMsg(n>0?n+' session(s) synced ✓':'Nothing to sync');setSyncing(false);})
      .catch(function(e){setMsg('Failed: '+e.message);setSyncing(false);});
  }
  function seedAll(){
    if(!url.trim()){setMsg('Enter URL first');return;}
    setSyncing(true);setMsg('Queueing all data...');
    setSyncConfig({url:url.trim(),apiKey:key.trim()});
    Promise.all([dbGetAll('bodycomp'), dbGetAll('biofeedback')]).then(function(results){
      var bc=results[0], bio=results[1];
      var all=props.strSessions.map(function(s){return queueSync('logStrength',s);}).concat(props.carSessions.map(function(s){return queueSync('logCardio',s);})).concat(bc.map(function(s){return queueSync('logBodyComp',s);})).concat(bio.map(function(s){return queueSync('logBiofeedback',s);}));
      return Promise.all(all);
    }).then(function(){return drainSyncQueue(function(d,t){setMsg('Syncing '+d+'/'+t+'...');});})
      .then(function(n){setMsg(n+' items sent to Sheets ✓');dbGetAll('syncQueue').then(function(q){setQCount(q.length);});setSyncing(false);})
      .catch(function(e){setMsg('Failed: '+e.message);setSyncing(false);});
  }

  function exportBackup(){
    setMsg('Generating backup...');
    var stores=['strength','cardio','bodycomp','biofeedback','hydration'];
    Promise.all(stores.map(function(s){return dbGetAll(s).then(function(d){return{store:s,data:d};});})).then(function(res){
      var out={exportDate:new Date().toISOString()};
      res.forEach(function(r){out[r.store]=r.data;});
      var blob=new Blob([JSON.stringify(out,null,2)],{type:'application/json'});
      var url=URL.createObjectURL(blob);
      var a=document.createElement('a');
      a.href=url;
      a.download='wemyssworkouts_backup_'+todayISO()+'.json';
      a.click();
      URL.revokeObjectURL(url);
      setMsg('Backup downloaded ✓');
    }).catch(function(e){setMsg('Export failed: '+e.message);});
  }

  function importBackup(){
    var input=document.createElement('input');
    input.type='file';
    input.accept='.json,application/json';
    input.onchange=function(e){
      var file=e.target.files[0];
      if(!file)return;
      setMsg('Restoring backup...');
      var reader=new FileReader();
      reader.onload=function(ev){
        try{
          var data=JSON.parse(ev.target.result);
          var stores=['strength','cardio','bodycomp','biofeedback','hydration'];
          var puts=[];
          stores.forEach(function(s){
            if(Array.isArray(data[s])){
              data[s].forEach(function(item){puts.push(dbPut(s,item));});
            }
          });
          Promise.all(puts).then(function(){
            setMsg('Restored '+puts.length+' items ✓ Reloading...');
            setTimeout(function(){window.location.reload();},1500);
          }).catch(function(err){setMsg('Restore failed: '+err.message);});
        }catch(err){setMsg('Invalid file: '+err.message);}
      };
      reader.readAsText(file);
    };
    input.click();
  }

  var online=navigator.onLine;
  return html`<div class="screen"><div class="screen-inner">
    <div style="font-size:20px;font-weight:800;letter-spacing:-0.02em;margin-bottom:4px">Google Sheets Sync</div>
    <div style="font-size:12px;color:var(--mu);margin-bottom:18px">Every session backs up automatically when online</div>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;padding:12px 14px;background:var(--bg2);border:1px solid var(--bd);border-radius:12px">
      <div class="sync-dot" style="background:${online?'var(--green)':'var(--red)'}"></div>
      <span style="font-size:12px;color:${online?'var(--green)':'var(--red)'};font-weight:600">${online?'Online':'Offline'}</span>
      ${qCount>0?html`<span style="font-size:11px;color:var(--orange);margin-left:auto;font-weight:600">${qCount} pending</span>`:null}
    </div>
    <div style="margin-bottom:12px">
      <label class="lbl">Apps Script URL</label>
      <input type="url" class="inp" value=${url} oninput=${(e)=>setUrl(e.target.value)} placeholder="https://script.google.com/macros/s/..."/>
    </div>
    <div style="margin-bottom:16px">
      <label class="lbl">API Key</label>
      <input type="text" class="inp" value=${key} oninput=${(e)=>setKey(e.target.value)} placeholder="Your secret key"/>
    </div>
    <button class="btn btn-primary" style="margin-bottom:10px" onclick=${save}>Save Settings</button>
    <button class="btn btn-primary" style="margin-bottom:10px;background:${syncing?'var(--bg3)':'linear-gradient(135deg,var(--blue),var(--blue2))'}" onclick=${syncNow} disabled=${syncing}>${syncing?'Syncing...':'Sync Pending'}</button>
    <button class="btn" style="background:var(--bg3);color:var(--mu2);margin-bottom:12px" onclick=${seedAll} disabled=${syncing}>Send All Historical Data</button>
    <button class="btn" style="background:var(--bg3);color:var(--mu2);margin-bottom:12px" onclick=${exportBackup}>Export Local Backup (JSON)</button>
    <button class="btn" style="background:var(--bg3);color:var(--mu2);margin-bottom:12px" onclick=${importBackup}>Import Local Backup (JSON)</button>
    ${msg?html`<div class="success">${msg}</div>`:null}
  </div></div>`;
}

export function BodyScreen(props){
  var subS=useState('comp');var sub=subS[0];var setSub=subS[1];
  var entriesS=useState([]);var entries=entriesS[0];var setEntries=entriesS[1];
  var dateS=useState(todayISO());var date=dateS[0];var setDate=dateS[1];
  var editIdS=useState(null);var editId=editIdS[0];var setEditId=editIdS[1];
  var wS=useState('');var w=wS[0];var setW=wS[1];
  var waistS=useState('');var waist=waistS[0];var setWaist=waistS[1];
  var chestS=useState('');var chest=chestS[0];var setChest=chestS[1];
  var armsS=useState('');var arms=armsS[0];var setArms=armsS[1];
  var bfS=useState('');var bf=bfS[0];var setBf=bfS[1];
  var noteS=useState('');var note=noteS[0];var setNote=noteS[1];
  var saveMsgS=useState('');var saveMsg=saveMsgS[0];var setSaveMsg=saveMsgS[1];
  var preS=useState('');var pre=preS[0];var setPre=preS[1];
  var postS=useState('');var post=postS[0];var setPost=postS[1];
  var fluidS=useState('');var fluid=fluidS[0];var setFluid=fluidS[1];
  var minsS=useState('');var mins=minsS[0];var setMins=minsS[1];

  var bioEntriesS=useState([]);var bioEntries=bioEntriesS[0];var setBioEntries=bioEntriesS[1];
  var bDateS=useState(todayISO());var bDate=bDateS[0];var setBDate=bDateS[1];
  var fatigueS=useState(5);var fatigue=fatigueS[0];var setFatigue=fatigueS[1];
  var bNoteS=useState('');var bNote=bNoteS[0];var setBNote=bNoteS[1];

  useEffect(function(){
    dbGetAll('bodycomp').then(function(d){
      setEntries(d.sort(function(a,b){return a.date<b.date?1:-1;}));
    }).catch(function(err){ console.error('Failed to load bodycomp:', err); });
    dbGetAll('biofeedback').then(function(d){
      setBioEntries(d.sort(function(a,b){return a.date<b.date?1:-1;}));
    }).catch(function(err){ console.error('Failed to load biofeedback:', err); });
  },[]);

  function cancelEdit(){setEditId(null);setDate(todayISO());setW('');setWaist('');setChest('');setArms('');setBf('');setNote('');}
  function editComp(e){setEditId(e.id);setDate(e.date);setW(e.weight);setWaist(e.waist||'');setChest(e.chest||'');setArms(e.arms||'');setBf(e.bf||'');setNote(e.note||'');}
  function deleteComp(e){if(!confirm('Delete this entry?'))return;dbDelete('bodycomp',e.id).then(function(){return queueSync('deleteBodyComp',{id:e.id});}).then(function(){setEntries(function(p){return p.filter(function(x){return x.id!==e.id;});});drainSyncQueue();});}

  function saveComp(){
    setSaveMsg('');
    if(!w){setSaveMsg('Weight required');return;}
    var entry={id:editId||uid(),date:date,label:fmtLabel(date),weight:parseFloat(w)||0,waist:parseFloat(waist)||null,chest:parseFloat(chest)||null,arms:parseFloat(arms)||null,bf:parseFloat(bf)||null,note:note.trim(),ts:Date.now()};
    if(entry.bf){entry.lbm=Math.round((entry.weight*(100-entry.bf)/100)*10)/10;entry.fatMass=Math.round((entry.weight*entry.bf/100)*10)/10;}
    dbPut('bodycomp',entry).then(function(){return queueSync('logBodyComp',entry);}).then(function(){
      setEntries(function(p){return [entry].concat(p.filter(function(x){return x.id!==entry.id;})).sort(function(a,b){return a.date<b.date?1:-1;});});
      cancelEdit();
      setSaveMsg('Saved ✓');
      setTimeout(function(){setSaveMsg('');},2000);
      drainSyncQueue();
    }).catch(function(){setSaveMsg('Save failed');});
  }

  function saveBio(){
    setSaveMsg('');
    var entry={id:uid(), date:bDate, label:fmtLabel(bDate), fatigue:fatigue, note:bNote.trim(), ts:Date.now()};
    dbPut('biofeedback', entry).then(function(){return queueSync('logBiofeedback', entry);}).then(function(){
      setBioEntries(function(p){return [entry].concat(p.filter(function(x){return x.id!==entry.id;})).sort(function(a,b){return a.date<b.date?1:-1;});});
      setBNote(''); setFatigue(5); setBDate(todayISO());
      setSaveMsg('Saved ✓');
      setTimeout(function(){setSaveMsg('');},2000);
      drainSyncQueue();
    }).catch(function(){setSaveMsg('Save failed');});
  }
  function deleteBio(e){
    if(!confirm('Delete this entry?'))return;
    dbDelete('biofeedback', e.id).then(function(){return queueSync('deleteBiofeedback',{id:e.id});}).then(function(){setBioEntries(function(p){return p.filter(function(x){return x.id!==e.id;});});drainSyncQueue();});
  }

  var sweat=null;
  if(pre&&post&&mins){
    var lossKg=parseFloat(pre)-parseFloat(post);
    var fluidL=(parseFloat(fluid)||0)/1000;
    var totalLossL=lossKg+fluidL;
    var hours=parseFloat(mins)/60;
    if(hours>0&&totalLossL>=0){
      var hourlyNum=totalLossL/hours;
      sweat={hourly:hourlyNum.toFixed(2),sodium:Math.round(hourlyNum*700),totalLoss:totalLossL.toFixed(2),pctBw:parseFloat(pre)>0?((lossKg/parseFloat(pre))*100).toFixed(1):0};
    }
  }

  var latest=entries[0];
  var earliest=entries[entries.length-1];
  var weightDrop=null,pctDrop=null,risk='Low',riskColor='var(--green)';
  if(entries.length>=2&&earliest.weight){
    weightDrop=earliest.weight-latest.weight;
    pctDrop=(weightDrop/earliest.weight)*100;
    if(pctDrop>3){risk='High';riskColor='var(--red)';}
    else if(pctDrop>1.5){risk='Moderate';riskColor='var(--orange)';}
  }

  return html`<div class="screen"><div class="screen-inner">
    <div style="font-size:20px;font-weight:800;letter-spacing:-0.02em;margin-bottom:4px">Body</div>
    <div style="display:flex;gap:6px;background:var(--bg2);border:1px solid var(--bd);border-radius:12px;padding:4px;margin-bottom:16px">
      <button onclick=${()=>setSub('comp')} style="flex:1;padding:10px;border:none;border-radius:9px;font-family:inherit;font-weight:700;font-size:12px;cursor:pointer;background:${sub==='comp'?'var(--blue)':'transparent'};color:${sub==='comp'?'#fff':'var(--mu2)'}">Composition</button>
      <button onclick=${()=>setSub('hyd')} style="flex:1;padding:10px;border:none;border-radius:9px;font-family:inherit;font-weight:700;font-size:12px;cursor:pointer;background:${sub==='hyd'?'var(--blue)':'transparent'};color:${sub==='hyd'?'#fff':'var(--mu2)'}">Hydration</button>
      <button onclick=${()=>setSub('bio')} style="flex:1;padding:10px;border:none;border-radius:9px;font-family:inherit;font-weight:700;font-size:12px;cursor:pointer;background:${sub==='bio'?'var(--blue)':'transparent'};color:${sub==='bio'?'#fff':'var(--mu2)'}">Biofeedback</button>
    </div>
    ${sub==='comp'?html`
      ${latest?html`<div class="stat-grid">
        <div class="stat"><div class="stat-val" style="color:var(--blue)">${latest.weight}</div><div class="stat-lbl">kg current</div></div>
        <div class="stat"><div class="stat-val" style="color:${latest.bf?'var(--blue)':'var(--mu)'}">${latest.bf?latest.bf+'%':'—'}</div><div class="stat-lbl">Body fat</div></div>
        <div class="stat"><div class="stat-val" style="color:${latest.lbm?'var(--green)':'var(--mu)'}">${latest.lbm||'—'}</div><div class="stat-lbl">LBM kg</div></div>
      </div>`:null}
      <div class="card" style="padding:16px;margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div style="font-size:13px;font-weight:700">${editId?'Edit measurements':'Log today\'s measurements'}</div>
          ${editId?html`<button class="btn-sm btn-ghost" onclick=${cancelEdit}>Cancel</button>`:null}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px">
          <div><label class="lbl">Date</label><input type="date" class="inp" value=${date} onchange=${(e)=>setDate(e.target.value)}/></div>
          <div><label class="lbl">Weight kg</label><input type="number" step="0.1" class="inp" value=${w} oninput=${(e)=>setW(e.target.value)} placeholder="80.0"/></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
          <div><label class="lbl">Waist cm</label><input type="number" step="0.1" class="inp" value=${waist} oninput=${(e)=>setWaist(e.target.value)} placeholder="82"/></div>
          <div><label class="lbl">BF %</label><input type="number" step="0.1" class="inp" value=${bf} oninput=${(e)=>setBf(e.target.value)} placeholder="14"/></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
          <div><label class="lbl">Chest cm</label><input type="number" step="0.1" class="inp" value=${chest} oninput=${(e)=>setChest(e.target.value)} placeholder="105"/></div>
          <div><label class="lbl">Arms cm</label><input type="number" step="0.1" class="inp" value=${arms} oninput=${(e)=>setArms(e.target.value)} placeholder="38"/></div>
        </div>
        <div style="margin-bottom:12px"><label class="lbl">Notes (optional)</label><input type="text" class="inp" value=${note} oninput=${(e)=>setNote(e.target.value)} placeholder="Morning, fasted, etc."/></div>
        <button class="btn btn-primary" onclick=${saveComp}>${editId?'Save Changes':'Save Entry'}</button>
        ${saveMsg?html`<div class="success" style="margin-top:10px">${saveMsg}</div>`:null}
      </div>
      ${entries.length?html`<span class="section-lbl">History (${entries.length})</span>
      <div class="card">
        ${entries.map(function(e){return html`<div style="padding:12px 14px;border-bottom:1px solid var(--bd)">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <div style="font-size:12px;font-weight:700">${e.label}</div>
            <div style="display:flex;gap:8px">
              <button class="btn-sm btn-outline" style="padding:4px 8px;border-color:rgba(248,113,113,0.4);color:var(--red)" onclick=${()=>deleteComp(e)}>Delete</button>
              <button class="btn-sm btn-outline" style="padding:4px 8px" onclick=${()=>editComp(e)}>Edit</button>
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:flex-end">
            <div style="font-size:10px;color:var(--mu);max-width:70%">${e.waist?'Waist '+e.waist+'cm · ':''}${e.chest?'Chest '+e.chest+'cm · ':''}${e.arms?'Arms '+e.arms+'cm · ':''}${e.bf?'BF '+e.bf+'% · LBM '+e.lbm+'kg':''}${e.note?' · '+e.note:''}</div>
            <div style="font-size:14px;color:var(--blue);font-weight:800">${e.weight}kg</div>
          </div>
        </div>`;})}
      </div>`:null}
    `:null}
    ${sub==='hyd'?html`
      <div class="card" style="padding:16px;margin-bottom:14px">
        <div style="font-size:13px;font-weight:700;margin-bottom:4px">Sweat Rate Calculator</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
          <div><label class="lbl">Pre kg</label><input type="number" step="0.1" class="inp" value=${pre} oninput=${(e)=>setPre(e.target.value)} placeholder="80.0"/></div>
          <div><label class="lbl">Post kg</label><input type="number" step="0.1" class="inp" value=${post} oninput=${(e)=>setPost(e.target.value)} placeholder="79.2"/></div>
          <div><label class="lbl">Fluid ml</label><input type="number" class="inp" value=${fluid} oninput=${(e)=>setFluid(e.target.value)} placeholder="500"/></div>
          <div><label class="lbl">Duration min</label><input type="number" class="inp" value=${mins} oninput=${(e)=>setMins(e.target.value)} placeholder="60"/></div>
        </div>
      </div>
      ${sweat?html`<div class="card-hero" style="margin-bottom:14px">
        <div style="font-size:10px;color:var(--blue);text-transform:uppercase;letter-spacing:0.15em;font-weight:700;margin-bottom:6px">Results</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div><div style="font-size:28px;font-weight:800;color:var(--blue);letter-spacing:-0.02em">${sweat.hourly}<span style="font-size:14px;color:var(--mu);margin-left:4px">L/hr</span></div></div>
          <div><div style="font-size:28px;font-weight:800;color:var(--gold);letter-spacing:-0.02em">${sweat.sodium}<span style="font-size:14px;color:var(--mu);margin-left:4px">mg</span></div></div>
        </div>
      </div>`:null}
    `:null}
    ${sub==='bio'?html`
      <div class="card" style="padding:16px;margin-bottom:14px">
        <div style="font-size:13px;font-weight:700;margin-bottom:12px">Daily Readiness</div>
        <div style="margin-bottom:10px"><label class="lbl">Date</label><input type="date" class="inp" value=${bDate} onchange=${(e)=>setBDate(e.target.value)}/></div>
        <div style="margin-bottom:14px">
          <label class="lbl">Overall Fatigue: ${fatigue}/10</label>
          <input type="range" min="1" max="10" value=${fatigue} onchange=${(e)=>setFatigue(Number(e.target.value))}/>
          <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--mu);margin-top:4px">
            <span>1 - Fresh</span><span>10 - Exhausted</span>
          </div>
        </div>
        <div style="margin-bottom:12px"><label class="lbl">Notes (optional)</label><input type="text" class="inp" value=${bNote} oninput=${(e)=>setBNote(e.target.value)} placeholder="Sleep, soreness, etc."/></div>
        <button class="btn btn-primary" onclick=${saveBio}>Save Biofeedback</button>
        ${saveMsg&&sub==='bio'?html`<div class="success" style="margin-top:10px">${saveMsg}</div>`:null}
      </div>
      ${bioEntries.length?html`<span class="section-lbl">History (${bioEntries.length})</span>
      <div class="card">
        ${bioEntries.map(function(e){return html`<div style="padding:12px 14px;border-bottom:1px solid var(--bd)">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <div style="font-size:12px;font-weight:700">${e.label}</div>
            <button class="btn-sm btn-outline" style="padding:4px 8px;border-color:rgba(248,113,113,0.4);color:var(--red)" onclick=${()=>deleteBio(e)}>Delete</button>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:flex-end">
            <div style="font-size:11px;color:var(--mu);max-width:70%">${e.note||'—'}</div>
            <div style="font-size:14px;color:${e.fatigue>=8?'var(--red)':e.fatigue>=5?'var(--orange)':'var(--green)'};font-weight:800">Fatigue ${e.fatigue}</div>
          </div>
        </div>`;})}
      </div>`:null}
    `:null}
  </div></div>`;
}

export function Nav(props){
  var tabs=[
    {id:'home',icon:'🏠',label:'Home'},
    {id:'strength',icon:'💪',label:'Str'},
    {id:'cardio',icon:'🏃',label:'Car'},
    {id:'plan',icon:'📋',label:'Plan'},
    {id:'progress',icon:'📈',label:'Stats'},
    {id:'body',icon:'⚖️',label:'Body'},
    {id:'sync',icon:'☁️',label:'Sync'}
  ];
  var activeIndex = tabs.findIndex(function(t) { return t.id === props.tab; });
  if (activeIndex === -1) activeIndex = 0;

  var indicatorWrapperStyle = {
    position: 'absolute',
    top: '-8px',
    left: '0',
    height: '3px',
    width: 'calc(100% / 7)',
    transform: 'translateX(' + (activeIndex * 100) + '%)',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    pointerEvents: 'none'
  };

  return html`<nav class="nav">
    <div style=${indicatorWrapperStyle}><div style="margin: 0 20%; height: 100%; background: var(--blue); border-radius: 0 0 4px 4px; box-shadow: 0 0 12px var(--blue), 0 2px 6px var(--blue);"></div></div>
    ${tabs.map(function(t){
      var isActive = props.tab===t.id;
      return html`<button class="nav-btn ${isActive?'active':''}" onclick=${()=>props.setTab(t.id)}>
      <span class="nav-icon">${t.icon}</span>
      <span>${t.label}</span>
    </button>`;})}
  </nav>`;
}

export function RestTimer(){
  var s=useState(0);var secs=s[0];var setSecs=s[1];
  var r=useState(false);var isRunning=r[0];var setIsRunning=r[1];
  var vis=useState(false);var visible=vis[0];var setVisible=vis[1];
  var stS=useState(0);var startTime=stS[0];var setStartTime=stS[1];

  useEffect(function(){
    var id;
    if(isRunning){
      id=setInterval(function(){setSecs(Math.floor((Date.now()-startTime)/1000));},250);
    }
    return function(){clearInterval(id);};
  },[isRunning, startTime]);

  function toggle(){if(isRunning){setIsRunning(false);}else{setStartTime(Date.now()-(secs*1000));setIsRunning(true);}}
  function reset(){setIsRunning(false);setSecs(0);}
  function fmt(sec){var m=Math.floor(sec/60),s=sec%60;return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');}

  if(!visible){
    return html`<button onclick=${()=>setVisible(true)} style="position:fixed;bottom:calc(90px + var(--safe-bottom));right:16px;background:var(--bg3);border:1px solid var(--bd);border-radius:50%;width:44px;height:44px;box-shadow:0 4px 12px rgba(0,0,0,0.3);z-index:40;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:20px;padding:0;color:var(--tx)">⏱️</button>`;
  }
  return html`<div style="position:fixed;bottom:calc(90px + var(--safe-bottom));right:16px;background:var(--nav-bg);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid var(--bd);border-radius:24px;padding:6px 14px;display:flex;align-items:center;gap:12px;box-shadow:0 8px 24px rgba(0,0,0,0.4);z-index:40">
    <div style="font-size:16px;font-weight:800;font-variant-numeric:tabular-nums;color:${isRunning?'var(--blue)':'var(--mu)'};width:46px;text-align:center;letter-spacing:0.05em">${fmt(secs)}</div>
    <div style="display:flex;gap:14px;border-left:1px solid var(--bd);padding-left:14px">
      <button onclick=${toggle} style="background:transparent;border:none;font-size:18px;cursor:pointer;padding:0;color:var(--tx);display:flex;align-items:center">${isRunning?'⏸':'▶️'}</button>
      <button onclick=${reset} style="background:transparent;border:none;font-size:18px;cursor:pointer;padding:0;color:var(--tx);display:flex;align-items:center">🔄</button>
      <button onclick=${()=>{reset();setVisible(false);}} style="background:transparent;border:none;font-size:18px;cursor:pointer;padding:0;color:var(--mu);display:flex;align-items:center">✖</button>
    </div>
  </div>`;
}
