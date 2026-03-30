/* modals.js — Triage + Services modal handlers + DOMContentLoaded init */

/* ════════════════════════════════════
   TRIAGE MODAL
════════════════════════════════════ */
function openTriageModal(qnum){
  const e=queue.find(q=>q.queueNum==qnum); if(!e) return;
  activeQ=qnum;
  document.getElementById('triage-patient').innerHTML=`<b>${e.name}</b> · #${e.queueNum} · ${e.visitLabel||e.purpose}`;
  const t=e.triage||{};
  ['bp','hr','temp','rr','o2','weight','height','complaint','notes'].forEach(f=>setVal('tr-'+f,t[f]||''));
  setVal('tr-priority',t.priority||'green');
  openModal('modal-triage');
}

function saveTriage(){
  const e=queue.find(q=>q.queueNum==activeQ); if(!e) return;
  if(!val('tr-bp').trim())         { toast('Blood pressure is required.','error'); return; }
  if(!val('tr-complaint').trim())  { toast('Chief complaint is required.','error'); return; }
  e.triage={bp:val('tr-bp'),hr:val('tr-hr'),temp:val('tr-temp'),rr:val('tr-rr'),o2:val('tr-o2'),weight:val('tr-weight'),height:val('tr-height'),complaint:val('tr-complaint'),notes:val('tr-notes'),priority:val('tr-priority')};
  e.triaged=true; e.status='triaged';
  saveData(); closeModal('modal-triage');
  toast(`Triage for ${e.name} saved.`);
  nurseNav('queue');
}

/* ════════════════════════════════════
   SERVICES MODAL (Medicine + Certificate only)
════════════════════════════════════ */
function openServicesModal(qnum){
  const e=queue.find(q=>q.queueNum==qnum); if(!e) return;
  activeQ=qnum;
  document.getElementById('svc-patient').innerHTML=`<b>${e.name}</b> · #${e.queueNum} · ${e.visitLabel||e.purpose}`;
  ['svc-med-name','svc-med-dose','svc-med-qty','svc-med-instr','svc-med-by','svc-cert-diag','svc-cert-by'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.value='';
  });
  svcTabSwitch('medicine');
  renderSvcList(e);
  openModal('modal-services');
}

function svcTabSwitch(t){
  ['medicine','certificate'].forEach(x=>{
    const el=document.getElementById('st-'+x); if(el) el.classList.toggle('active',x===t);
  });
  document.querySelectorAll('#svc-tabs .tab').forEach((el,i)=>
    el.classList.toggle('active',['medicine','certificate'][i]===t));
}

function saveMedicine(){
  const e=queue.find(q=>q.queueNum==activeQ); if(!e) return;
  const name=val('svc-med-name').trim();
  if(!name){ toast('Enter medicine name.','error'); return; }
  if(!e.services) e.services=[];
  e.services.push({type:'medicine',name,dose:val('svc-med-dose'),qty:val('svc-med-qty'),instr:val('svc-med-instr'),by:val('svc-med-by'),time:nowTime()});
  saveData(); toast('Medicine issuance recorded.');
  ['svc-med-name','svc-med-dose','svc-med-qty','svc-med-instr','svc-med-by'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.value='';
  });
  renderSvcList(e);
}

function saveCert(){
  const e=queue.find(q=>q.queueNum==activeQ); if(!e) return;
  if(!e.services) e.services=[];
  e.services.push({type:'certificate',certType:val('svc-cert-type'),diag:val('svc-cert-diag'),dateFrom:val('svc-cert-from'),dateTo:val('svc-cert-to'),by:val('svc-cert-by'),time:nowTime()});
  saveData(); toast('Medical certificate issued.');
  renderSvcList(e);
}

function renderSvcList(e){
  const el=document.getElementById('svc-issued-list'); if(!el) return;
  if(!(e.services||[]).length){ el.innerHTML='<div class="text-muted text-sm mt8">No services issued yet.</div>'; return; }
  el.innerHTML=`<div class="text-xs fw6 text-muted mt8 mb4" style="text-transform:uppercase;letter-spacing:.5px;">Issued Services</div>
    ${e.services.map(s=>s.type==='medicine'
      ?`<div style="background:#f9f8f6;padding:8px 12px;border-radius:7px;margin-bottom:5px;font-size:.845rem;"><i class="bi bi-capsule" style="color:var(--maroon);"></i> <b>${s.name}</b> ${s.dose} — ${s.qty} · ${s.instr} · by ${s.by} at ${s.time}</div>`
      :`<div style="background:#f9f8f6;padding:8px 12px;border-radius:7px;margin-bottom:5px;font-size:.845rem;"><i class="bi bi-file-earmark-medical" style="color:var(--blue);"></i> <b>${s.certType}</b> — ${s.diag||''} · by ${s.by} at ${s.time}</div>`
    ).join('')}`;
}

/* ════════════════════════════════════
   INIT
════════════════════════════════════ */
document.addEventListener('DOMContentLoaded',()=>{
  wireLogo();
  renderSU();
  document.getElementById('login-staffpw')?.addEventListener('keydown',e=>{ if(e.key==='Enter') doLogin(); });
  document.getElementById('login-idnum')?.addEventListener('keydown',e=>{ if(e.key==='Enter') doLogin(); });
  document.querySelectorAll('.modal-overlay').forEach(ov=>{
    ov.addEventListener('click',e=>{ if(e.target===ov) ov.classList.remove('open'); });
  });
});