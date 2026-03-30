/* shared.js — routing, helpers, daily log */

function wireLogo(){
  document.querySelectorAll('.logo-img').forEach(el=>{ el.src=LOGO; });
}
function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const el=document.getElementById(id); if(el) el.classList.add('active');
  window.scrollTo(0,0);
}
function openModal(id){ const el=document.getElementById(id); if(el) el.classList.add('open'); }
function closeModal(id){ const el=document.getElementById(id); if(el) el.classList.remove('open'); }

function toast(msg,type='success'){
  document.getElementById('_toast')?.remove();
  const t=document.createElement('div');
  t.id='_toast'; t.className=`toast toast-${type}`; t.textContent=msg;
  document.body.appendChild(t);
  setTimeout(()=>{ t.style.opacity='0'; t.style.transition='opacity .4s'; setTimeout(()=>t.remove(),400); },3000);
}

function statusBadge(s){
  const m={
    waiting:'<span class="badge b-yellow"><i class="bi bi-hourglass-split"></i> Waiting</span>',
    triaged:'<span class="badge b-blue"><i class="bi bi-clipboard-check"></i> Triaged</span>',
    'with-doctor':'<span class="badge b-blue"><i class="bi bi-person-badge"></i> With Doctor</span>',
    done:'<span class="badge b-green"><i class="bi bi-check-circle"></i> Done</span>'
  };
  return m[s]||`<span class="badge b-gray">${s}</span>`;
}
function priorityBadge(p){
  const m={
    'red':'<span class="badge b-red"><i class="bi bi-exclamation-octagon-fill"></i> Immediate</span>',
    'yellow':'<span class="badge b-yellow"><i class="bi bi-exclamation-triangle-fill"></i> Urgent</span>',
    'green':'<span class="badge b-green"><i class="bi bi-check-circle-fill"></i> Non-urgent</span>'
  };
  return m[p]||'';
}
function nowTime(){ return new Date().toTimeString().slice(0,5); }

// Generates YYYY-MM-DD reliably based on local time
function todayStr(){ 
  const d = new Date(); 
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().split('T')[0]; 
}

function val(id){ return document.getElementById(id)?.value||''; }
function setVal(id,v){ const el=document.getElementById(id); if(el) el.value=v||''; }

/* ════════════════════════════════════
   DAILY PATIENT LOG (Calendar Filter specific)
════════════════════════════════════ */
function renderDailyLog(containerId){
  const m=document.getElementById(containerId); if(!m) return;
  const today=todayStr();

  m.innerHTML=`
    <div class="page-header">
      <h1>Daily Patient Log</h1>
      <p>All finalized consultations. Select a specific date from the calendar to view records.</p>
    </div>
    <div class="card">
      <div class="flex-between mb8" style="flex-wrap:wrap;gap:10px;">
        <div class="card-title mb0">Log Entries</div>
        <div class="flex gap10" style="flex-wrap:wrap;align-items:center;">
          <input type="date" id="log-date-filter" class="search-input" style="min-width:160px;padding:8px 12px;" onchange="filterLogTable()" value="${today}">
          <input class="search-input" style="min-width:180px;padding:8px 12px;" id="log-search" placeholder="Search patient..." oninput="filterLogTable()">
          <button class="btn btn-outline btn-sm" onclick="clearLogFilters()"><i class="bi bi-x-circle"></i> Clear</button>
        </div>
      </div>
      <div id="log-tbody"></div>
    </div>`;
    filterLogTable();
}

function clearLogFilters(){
  document.getElementById('log-date-filter').value = '';
  document.getElementById('log-search').value = '';
  filterLogTable();
}

function filterLogTable(){
  const q=(val('log-search')||'').toLowerCase();
  const d=val('log-date-filter');
  
  let list=dailyLog;
  if(d) list=list.filter(l=>l.date===d);
  if(q) list=list.filter(l=>l.name.toLowerCase().includes(q)||l.patientId.toLowerCase().includes(q)||l.purpose.toLowerCase().includes(q));
  
  const el=document.getElementById('log-tbody'); 
  if(el) el.innerHTML=renderLogTable(list);
}

function renderLogTable(logs){
  if(!logs.length) return `<div class="empty-state"><div class="ei"><i class="bi bi-clipboard-x text-muted" style="opacity: 0.5;"></i></div><p>No records found for this date.</p></div>`;
  return `<div class="table-wrap"><table>
    <thead><tr><th>#</th><th>Patient</th><th>Visit Type</th><th>Arrival</th><th>Diagnosis</th><th>Doctor</th><th>Date</th><th>Status</th></tr></thead>
    <tbody>${logs.map(l=>`<tr>
      <td><span class="num-badge">${l.queueNum}</span></td>
      <td><div class="fw6">${l.name}</div><div class="text-xs text-muted">${l.patientId}</div></td>
      <td>${l.visitLabel||l.purpose}</td>
      <td>${l.time}</td>
      <td>${l.diagnosis||'—'}</td>
      <td>${l.doctor||'—'}</td>
      <td class="text-xs">${l.date}</td>
      <td><span class="badge b-green"><i class="bi bi-check-circle"></i> Finalized</span></td>
    </tr>`).join('')}
    </tbody></table></div>`;
}