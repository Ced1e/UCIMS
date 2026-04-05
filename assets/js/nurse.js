/* nurse.js — Nurse interface */

function nurseNav(sec){
  ['queue','records','services','daily-records','log'].forEach(s=>{
    const el=document.getElementById('nn-'+s); if(el) el.classList.toggle('active',s===sec);
  });
  const m=document.getElementById('nurse-main');
  if(sec==='queue')          renderNurseQueue(m);
  if(sec==='records')        renderNurseRecords(m);
  if(sec==='services')       renderNurseServices(m);
  if(sec==='daily-records')  renderNurseDailyRecords(m);
  if(sec==='log')            renderDailyLog('nurse-main');
}

function visitBadge(q){
  const map={checkup:'<span class="badge b-maroon"><i class="bi bi-clipboard2-pulse"></i> Check-up</span>',medicine:'<span class="badge b-gold"><i class="bi bi-capsule"></i> Medicine Req.</span>','follow-up':'<span class="badge b-blue"><i class="bi bi-arrow-repeat"></i> Follow-up</span>',medcert:'<span class="badge b-green"><i class="bi bi-file-earmark-medical"></i> Med Cert</span>'};
  return map[q.purposeType]||`<span class="badge b-gray">${q.purpose}</span>`;
}

function renderNurseQueue(m){
  let waiting  = queue.filter(q=>!q.finalized);
  const doneToday= queue.filter(q=>q.finalized);

  // FIX: Sort queue by triage priority (Red -> Yellow -> Green -> Untriaged)
  waiting.sort((a, b) => {
    const pMap = { 'red': 1, 'yellow': 2, 'green': 3 };
    const pA = a.triage?.priority ? pMap[a.triage.priority] : 4;
    const pB = b.triage?.priority ? pMap[b.triage.priority] : 4;
    if (pA !== pB) return pA - pB;
    return a.queueNum - b.queueNum; 
  });

  m.innerHTML=`
    <div class="page-header"><h1>Queue Monitoring</h1><p>Real-time patient queue — ${waiting.length} patient(s) currently waiting.</p></div>

    <div class="stats-row">
      <div class="stat-card"><div class="stat-num">${queue.filter(q=>q.status==='waiting').length}</div><div class="stat-label">Waiting</div></div>
      <div class="stat-card stat-green"><div class="stat-num">${doneToday.length}</div><div class="stat-label">Done Today</div></div>
    </div>

    <div class="card-title" style="margin-bottom:10px;">Queue List</div>
    ${!waiting.length?`<div class="empty-state"><div class="ei"><i class="bi bi-check2-circle text-muted" style="opacity: 0.5;"></i></div><p>Queue is clear. All patients attended to.</p></div>`:''}
    ${waiting.map(q=>{
      const pc=q.triage?.priority==='red'?'border-left:4px solid #C0392B;background:#fdf0ef':q.triage?.priority==='yellow'?'border-left:4px solid var(--gold);background:#fefaed':'';
      return `<div class="queue-item" style="${pc}">
        <div class="queue-num">#${q.queueNum}</div>
        <div class="queue-info">
          <div class="queue-name">${q.name}</div>
          <div class="flex gap6 mt4" style="flex-wrap:wrap;">
            ${visitBadge(q)}
            ${statusBadge(q.status)}
            ${q.triage?.priority?priorityBadge(q.triage.priority):''}
          </div>
          <div class="queue-detail mt4">Arrived: ${q.time}${q.triage?.complaint?' · "'+q.triage.complaint+'"':''}</div>
        </div>
        <div class="queue-actions">
          <button class="btn btn-outline btn-sm" onclick="openTriageModal(${q.queueNum})">
            ${q.triaged?'<i class="bi bi-pencil"></i> Edit Triage':'<i class="bi bi-clipboard2-pulse"></i> Triage'}
          </button>
          ${q.triaged?`<button class="btn btn-outline btn-sm" onclick="viewTriageModal(${q.queueNum})"><i class="bi bi-eye"></i> Triage</button>`:''}
          ${q.triaged&&!q.endorsed?`<button class="btn btn-outline btn-sm" onclick="endorsePatient(${q.queueNum})"><i class="bi bi-arrow-right-circle"></i> Endorse</button>`:''}
          ${q.endorsed?`<button class="btn btn-outline btn-sm" style="color:var(--blue);" onclick="undoEndorse(${q.queueNum})"><i class="bi bi-arrow-counterclockwise"></i> Undo Endorse</button>`:''}
          <button class="btn btn-outline btn-sm" onclick="openViewModal(${q.queueNum})"><i class="bi bi-file-medical"></i> Record</button>
          <button class="btn btn-outline btn-sm" style="color:var(--text-muted);" onclick="cancelFromQueue(${q.queueNum})" title="Cancel & remove from queue"><i class="bi bi-x-circle"></i> Cancel</button>
        </div>
      </div>`;}).join('')}`;
}

function endorsePatient(qnum){
  const e=queue.find(q=>q.queueNum==qnum);
  if(!e){ toast('Queue entry not found.','error'); return; }
  if(!e.triaged){ toast('Please complete triage before endorsing.','error'); return; }
  e.endorsed=true; e.status='with-doctor'; saveData();
  toast(`${e.name} endorsed to the doctor.`);
  nurseNav('queue');
}

function undoEndorse(qnum){
  const e=queue.find(q=>q.queueNum==qnum);
  if(!e) return;
  if(!confirm(`Undo endorsement for ${e.name}?`)) return;
  e.endorsed=false; e.status='triaged'; saveData();
  toast(`Endorsement undone for ${e.name}.`, 'info');
  nurseNav('queue');
}

function cancelFromQueue(qnum){
  const e=queue.find(q=>q.queueNum==qnum);
  if(!e) return;
  if(!confirm(`Cancel ${e.name} (#${e.queueNum}) from the queue?`)) return;
  queue=queue.filter(q=>q.queueNum!==qnum); saveData();
  toast(`${e.name} removed from queue.`,'info');
  nurseNav('queue');
}

function viewTriageModal(qnum){
  const e=queue.find(q=>q.queueNum==qnum); if(!e) return;
  const t=e.triage||{};
  document.getElementById('view-modal-content').innerHTML=`
    <div class="profile-head" style="margin-bottom:16px;">
      <div class="profile-avatar">${e.name[0]}</div>
      <div><div class="profile-name">${e.name}</div>
      <div class="profile-meta">#${e.queueNum} · ${e.purpose} · Arrived ${e.time}</div></div>
    </div>
    <div class="card-title" style="font-size:.9rem;">Triage Assessment (View Only)</div>
    ${t.bp?`
      <div class="grid3 mb8">
        ${[['BP',t.bp],['HR',t.hr+' bpm'],['Temp',t.temp+'°C'],['RR',t.rr+' br/min'],['O₂',t.o2+'%'],['Wt/Ht',t.weight+'kg/'+t.height+'cm']].map(([l,v])=>`
          <div style="background:#f9f8f6;padding:10px 12px;border-radius:7px;"><div class="text-xs text-muted">${l}</div><div class="fw6 text-sm mt4">${v||'—'}</div></div>`).join('')}
      </div>
      <div class="info-grid">
        <div class="info-item"><div class="info-lbl">Chief Complaint</div><div class="info-val">${t.complaint||'—'}</div></div>
        <div class="info-item"><div class="info-lbl">Initial Assessment</div><div class="info-val">${t.notes||'—'}</div></div>
      </div>
      <div class="mt8">${priorityBadge(t.priority)}</div>`
    :`<p class="text-muted text-sm">No triage recorded yet.</p>`}`;
  openModal('modal-view');
}

const COLLEGES=['College of Engineering','College of Arts and Sciences','College of Economics','College of Education','College of Business Administration','College of Information and Computing','College of Technology'];
const YEAR_LEVELS=['1st Year','2nd Year','3rd Year','4th Year'];

function renderNurseRecords(m){
  m.innerHTML=`
    <div class="page-header"><h1>Record Management</h1><p>Search, filter, and manage permanent patient records.</p></div>
    <div class="tabs" id="rec-tabs">
      <button class="tab active" onclick="recTab('search',this)"><i class="bi bi-search"></i> Search & Filter</button>
      <button class="tab" onclick="recTab('retention',this)"><i class="bi bi-folder2-open"></i> Record Retention</button>
      <button class="tab" onclick="recTab('deletion',this)"><i class="bi bi-trash"></i> Record Deletion</button>
    </div>
    <div id="rec-panel"></div>`;
  recTab('search', document.querySelector('#rec-tabs .tab'));
}

function recTab(t,el){
  document.querySelectorAll('#rec-tabs .tab').forEach(x=>x.classList.remove('active'));
  if(el) el.classList.add('active');
  const p=document.getElementById('rec-panel'); if(!p) return;
  const pts=users.filter(u=>u.role==='patient');

  if(t==='search'){
    p.innerHTML=`
      <div class="card">
        <div class="card-title">Search & Filter Patient Records</div>
        <div class="search-bar">
          <input class="search-input" id="rec-q" placeholder="Search by name or ID..." oninput="filterRecs()">
          <select class="filter-sel" id="rec-college" onchange="filterRecs()">
            <option value="">All Colleges</option>
            ${COLLEGES.map(c=>`<option>${c}</option>`).join('')}
          </select>
          <select class="filter-sel" id="rec-year" onchange="filterRecs()">
            <option value="">All Year Levels</option>
            ${YEAR_LEVELS.map(y=>`<option>${y}</option>`).join('')}
          </select>
          <select class="filter-sel" id="rec-ptype" onchange="filterRecs()">
            <option value="">All Types</option>
            <option>Student</option>
            <option>Staff</option>
          </select>
        </div>
        <div id="rec-table">${renderRecTable(pts)}</div>
      </div>`;
  } else if(t==='retention'){
    p.innerHTML=`
      <div class="card">
        <div class="card-title">Record Retention</div>
        <div class="alert alert-info text-sm mb8"><i class="bi bi-info-circle"></i> Records retained minimum 10 years per DOH Administrative Order No. 2012-0012.</div>
        <div class="tabs" style="margin-bottom:14px;" id="ret-tabs">
          <button class="tab active" onclick="retSubTab('visits',this)">Visit History</button>
          <button class="tab" onclick="retSubTab('permanent',this)">Permanent Patient Records</button>
        </div>
        <div id="ret-content">${renderVisitHistory()}</div>
      </div>`;
  } else {
    p.innerHTML=`
      <div class="card">
        <div class="card-title">Record Deletion</div>
        <div class="alert alert-danger text-sm mb8"><i class="bi bi-exclamation-triangle"></i> Irreversible. Requires authorization and compliance with RA 10173 (Data Privacy Act).</div>
        <div class="field"><label>Select Patient</label>
          <select id="del-pid"><option value="">— Select patient —</option>
            ${pts.map(u=>`<option value="${u.id}">${u.name} (${u.id})</option>`).join('')}
          </select>
        </div>
        <div class="field"><label>Reason for Deletion</label><textarea placeholder="Legal basis and justification..."></textarea></div>
        <div class="field"><label>Authorization Code</label><input type="password" placeholder="Supervisor authorization code"></div>
        <button class="btn btn-danger" onclick="toast('Deletion request submitted for administrator review.','info')">Submit Deletion Request</button>
      </div>`;
  }
}

function retSubTab(t,el){
  document.querySelectorAll('#ret-tabs .tab').forEach(x=>x.classList.remove('active'));
  if(el) el.classList.add('active');
  const c=document.getElementById('ret-content'); if(!c) return;
  if(t==='visits') c.innerHTML=renderVisitHistory();
  else c.innerHTML=renderPermanentRecords();
}

function renderVisitHistory(){
  if(!dailyLog.length) return `<div class="empty-state"><div class="ei"><i class="bi bi-clipboard-x text-muted" style="opacity: 0.5;"></i></div><p>No visit history on record yet.</p></div>`;
  return `<div class="table-wrap"><table>
    <thead><tr><th>Date</th><th>Patient</th><th>Purpose</th><th>Diagnosis</th><th>Doctor</th></tr></thead>
    <tbody>${dailyLog.map(l=>`<tr>
      <td class="text-xs">${l.date}</td>
      <td><div class="fw6">${l.name}</div><div class="text-xs text-muted">${l.patientId}</div></td>
      <td>${l.purpose}</td><td>${l.diagnosis||'—'}</td><td>${l.doctor||'—'}</td>
    </tr>`).join('')}</tbody></table></div>`;
}

function renderPermanentRecords(){
  const pts=users.filter(u=>u.role==='patient');
  if(!pts.length) return `<div class="empty-state"><div class="ei"><i class="bi bi-person-x text-muted" style="opacity: 0.5;"></i></div><p>No registered patients yet.</p></div>`;
  return `<div class="table-wrap"><table>
    <thead><tr><th>ID</th><th>Name</th><th>Type</th><th>College</th><th>Year Level</th><th>Actions</th></tr></thead>
    <tbody>${pts.map(u=>`<tr>
      <td class="text-xs">${u.patientId||u.id}</td>
      <td><div class="fw6">${u.name}</div><div class="text-xs text-muted">${u.demographics?.email||''}</div></td>
      <td>${u.permanent?.pattype||'—'}</td>
      <td class="text-xs">${u.permanent?.dept||'—'}</td>
      <td>${u.permanent?.yearsec||'—'}</td>
      <td><button class="btn btn-outline btn-sm" onclick="openPatRecord('${u.id}')"><i class="bi bi-file-medical"></i> View Record</button></td>
    </tr>`).join('')}</tbody></table></div>`;
}

function filterRecs(){
  const q=val('rec-q').toLowerCase();
  const col=val('rec-college');
  const yr=val('rec-year');
  const pt=val('rec-ptype');
  let list=users.filter(u=>u.role==='patient');
  if(q)   list=list.filter(u=>u.name.toLowerCase().includes(q)||u.id.toLowerCase().includes(q));
  if(col) list=list.filter(u=>u.permanent?.dept===col);
  if(yr)  list=list.filter(u=>u.permanent?.yearsec===yr);
  if(pt)  list=list.filter(u=>u.permanent?.pattype===pt);
  const el=document.getElementById('rec-table'); if(el) el.innerHTML=renderRecTable(list);
}

function renderRecTable(list){
  if(!list.length) return `<div class="empty-state"><div class="ei"><i class="bi bi-search text-muted" style="opacity: 0.5;"></i></div><p>No records found.</p></div>`;
  return `<div class="table-wrap"><table>
    <thead><tr><th>ID</th><th>Name</th><th>Type</th><th>College/Dept</th><th>Year Level</th><th>Last Visit</th><th>Actions</th></tr></thead>
    <tbody>${list.map(u=>{
      const logs=dailyLog.filter(l=>l.patientId===u.id);
      return `<tr>
        <td class="text-xs">${u.patientId||u.id}</td>
        <td><div class="fw6">${u.name}</div><div class="text-xs text-muted">${u.demographics?.email||''}</div></td>
        <td>${u.permanent?.pattype||'—'}</td>
        <td class="text-xs">${u.permanent?.dept||'—'}</td>
        <td>${u.permanent?.yearsec||'—'}</td>
        <td class="text-xs">${logs.length?logs[logs.length-1].date:'No visits'}</td>
        <td><button class="btn btn-outline btn-sm" onclick="openPatRecord('${u.id}')"><i class="bi bi-eye"></i> View</button></td>
      </tr>`;}).join('')}
    </tbody></table></div>`;
}

function openPatRecord(uid){
  const u=users.find(x=>x.id===uid); if(!u) return;
  const d=u.demographics||{}, med=u.medical||{}, p=u.permanent||{};
  const ifv=(l,v)=>`<div class="info-item"><div class="info-lbl">${l}</div><div class="info-val">${v||'—'}</div></div>`;
  document.getElementById('view-modal-content').innerHTML=`
    <div class="profile-head" style="margin-bottom:16px;">
      <div class="profile-avatar">${u.name[0]}</div>
      <div><div class="profile-name">${u.name}</div><div class="profile-meta">${u.id} · ${p.pattype||'Patient'} · ${p.dept||'—'}</div></div>
    </div>
    <div class="tabs" id="pr-tabs">
      <button class="tab active" onclick="prTab('demo',this)">Demographics</button>
      <button class="tab" onclick="prTab('medical',this)">Medical History</button>
      <button class="tab" onclick="prTab('permanent',this)">Permanent Record</button>
    </div>
    <div id="prt-demo" class="tab-panel active">
      <div class="info-grid3 mb8">${ifv('DOB',d.dob)}${ifv('Sex',d.sex)}${ifv('Blood Type',d.blood)}${ifv('Civil Status',d.civil)}${ifv('Contact',d.contact)}${ifv('Email',d.email)}</div>
      <div class="info-grid">${ifv('Address',d.address)}${ifv('Emergency Contact',`${d.emname||'—'} (${d.emrel||'—'}) ${d.emcontact||''}`)}</div>
    </div>
    <div id="prt-medical" class="tab-panel">
      <div class="info-grid">${ifv('Known Allergies',med.allergies)}${ifv('Current Medications',med.meds)}${ifv('Past Conditions/Surgeries',med.history)}${ifv('Family Medical History',med.family)}${ifv('Immunizations',med.immuniz)}${ifv('Lifestyle',med.lifestyle)}</div>
    </div>
    <div id="prt-permanent" class="tab-panel">
      <div class="info-grid3">${ifv('Student/Employee ID',p.studid)}${ifv('Patient Type',p.pattype)}${ifv('College/Department',p.dept)}${ifv('Year Level',p.yearsec)}${ifv('PhilHealth/HMO',p.philhealth)}${ifv('Primary Physician',p.pcp)}</div>
    </div>`;
  openModal('modal-view');
}

function prTab(t,el){
  ['demo','medical','permanent'].forEach(x=>{const p=document.getElementById('prt-'+x);if(p)p.classList.remove('active');});
  document.querySelectorAll('#pr-tabs .tab').forEach(x=>x.classList.remove('active'));
  const panel=document.getElementById('prt-'+t); if(panel) panel.classList.add('active');
  if(el) el.classList.add('active');
}

function renderNurseServices(m){
  const eligible=queue.filter(q=>q.triaged||q.purposeType==='medcert');
  m.innerHTML=`
    <div class="page-header"><h1>Services</h1><p>Issue medicines and medical certificates for patients.</p></div>
    ${!eligible.length?`<div class="empty-state"><div class="ei"><i class="bi bi-capsule text-muted" style="opacity: 0.5;"></i></div><p>No triaged patients available yet.</p></div>`:
    `<div class="card">
      <div class="card-title">Select Patient</div>
      <div class="table-wrap"><table>
        <thead><tr><th>#</th><th>Patient</th><th>Visit Type</th><th>Status</th><th>Services</th><th>Action</th></tr></thead>
        <tbody>${eligible.map(q=>`
          <tr>
            <td><span class="num-badge">${q.queueNum}</span></td>
            <td><div class="fw6">${q.name}</div></td>
            <td>${visitBadge(q)}</td>
            <td>${statusBadge(q.status)}</td>
            <td>${(q.services||[]).length?`<span class="badge b-green">${q.services.length} issued</span>`:'<span class="badge b-gray">None</span>'}</td>
            <td><button class="btn btn-primary btn-sm" onclick="openServicesModal(${q.queueNum})"><i class="bi bi-capsule"></i> Manage</button></td>
          </tr>`).join('')}
        </tbody></table></div>
    </div>`}`;
}

function renderNurseDailyRecords(m){
  m.innerHTML=`
    <div class="page-header"><h1>Daily Patient Records</h1><p>Summarized clinic visit records. Click "View" to see the full summary.</p></div>
    <div class="card">
      <div class="flex-between mb8">
        <div class="card-title mb0">Visit Records</div>
        <input class="search-input" style="width:200px;" placeholder="Search patient..." oninput="filterDPR(this.value)">
      </div>
      <div id="dpr-table">${renderDPRTable(queue)}</div>
    </div>`;
}

function filterDPR(q){
  const filtered=queue.filter(x=>x.name.toLowerCase().includes(q.toLowerCase())||String(x.queueNum).includes(q));
  const el=document.getElementById('dpr-table'); if(el) el.innerHTML=renderDPRTable(filtered);
}

function renderDPRTable(list){
  if(!list.length) return `<div class="empty-state"><div class="ei"><i class="bi bi-file-earmark-x text-muted" style="opacity: 0.5;"></i></div><p>No records found.</p></div>`;
  return `<div class="table-wrap"><table>
    <thead><tr><th>#</th><th>Patient</th><th>Visit Type</th><th>Arrival</th><th>Triage</th><th>Doctor</th><th>Status</th><th>Actions</th></tr></thead>
    <tbody>${list.map(q=>`
      <tr>
        <td><span class="num-badge">${q.queueNum}</span></td>
        <td><div class="fw6">${q.name}</div><div class="text-xs text-muted">${q.patientId}</div></td>
        <td>${visitBadge(q)}</td>
        <td>${q.time}</td>
        <td>${q.triaged?`<span class="badge b-green"><i class="bi bi-check"></i> Done</span>`:`<span class="badge b-gray"><i class="bi bi-hourglass"></i> Pending</span>`}</td>
        <td>${q.endorsed?`<span class="badge b-blue"><i class="bi bi-check"></i> Endorsed</span>`:'<span class="badge b-gray">—</span>'}</td>
        <td>${statusBadge(q.status)}</td>
        <td><button class="btn btn-outline btn-sm" onclick="openVisitSummaryModal(${q.queueNum})"><i class="bi bi-eye"></i> View Summary</button></td>
      </tr>`).join('')}
    </tbody></table></div>`;
}

function openVisitSummaryModal(qnum){
  const e=queue.find(q=>q.queueNum==qnum); if(!e) return;
  const t=e.triage||{}, ex=e.exam||{};
  const ifv=(l,v)=>`<div class="info-item"><div class="info-lbl">${l}</div><div class="info-val">${v||'—'}</div></div>`;
  document.getElementById('view-modal-content').innerHTML=`
    <div class="profile-head" style="margin-bottom:16px;">
      <div class="profile-avatar">${e.name[0]}</div>
      <div><div class="profile-name">${e.name}</div>
      <div class="profile-meta">#${e.queueNum} · ${e.visitLabel||e.purpose} · Arrived ${e.time}</div>
      <div class="mt4 flex gap6">${statusBadge(e.status)}${visitBadge(e)}</div></div>
    </div>
    ${t.bp?`
      <div class="card-title" style="font-size:.88rem;">Triage Vitals</div>
      <div class="grid3 mb8">
        ${[['BP',t.bp],['HR',t.hr+' bpm'],['Temp',t.temp+'°C'],['RR',t.rr+' br/min'],['O₂',t.o2+'%'],['Wt/Ht',t.weight+'kg/'+t.height+'cm']].map(([l,v])=>`
          <div style="background:#f9f8f6;padding:9px 11px;border-radius:7px;"><div class="text-xs text-muted">${l}</div><div class="fw6 text-sm mt4">${v||'—'}</div></div>`).join('')}
      </div>
      <div class="info-grid mb8">${ifv('Chief Complaint',t.complaint)}${ifv('Nurse Assessment',t.notes)}</div>`:''}
    ${ex.diagnosis?`
      <div class="card-title" style="font-size:.88rem;">Physician Findings</div>
      <div class="info-grid mb8">${ifv('Diagnosis',ex.diagnosis+(ex.icd?' ('+ex.icd+')':''))}${ifv('Lab Requests',(ex.labs||[]).join(', ')||'None')}</div>
      ${(ex.rx||[]).filter(r=>r.drug).length?`
        <div class="text-xs fw6 text-muted" style="text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;">Prescriptions</div>
        ${(ex.rx||[]).filter(r=>r.drug).map(r=>`<div style="background:#f9f8f6;padding:8px 12px;border-radius:7px;margin-bottom:5px;font-size:.845rem;"><b>${r.drug}</b> ${r.dose} — ${r.freq} (${r.route})</div>`).join('')}`:''}
      ${ex.instructions?`<div class="info-item mt8">${ifv('Instructions',ex.instructions)}</div>`:''}
      ${ex.finalNotes?`<div class="info-item mt4">${ifv("Doctor's Notes",ex.finalNotes)}</div>`:''}
    `:`<div class="alert alert-info text-sm"><i class="bi bi-info-circle"></i> Examination not yet completed by doctor.</div>`}
    ${(e.services||[]).length?`
      <div class="card-title" style="font-size:.88rem;margin-top:12px;">Services Issued</div>
      ${e.services.map(s=>`<div style="background:#f9f8f6;padding:8px 12px;border-radius:7px;margin-bottom:5px;font-size:.845rem;">${s.type==='medicine'?`<i class="bi bi-capsule"></i> <b>${s.name}</b> ${s.dose} — ${s.qty} (${s.instr})`:`<i class="bi bi-file-earmark-medical"></i> ${s.certType||'Certificate'} — ${s.diag||''}`}</div>`).join('')}`:''}`;
  openModal('modal-view');
}

function openViewModal(qnum){ openPatRecord(queue.find(q=>q.queueNum==qnum)?.patientId||''); }