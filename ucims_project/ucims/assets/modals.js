/* ════════════════════════════════════════════════════
   modals.js — All Modal Handlers
   UCIMS · University of Southeastern Philippines Clinic
   ════════════════════════════════════════════════════
   Modals covered:
     Triage        — openTriage(), saveTriage()
     View Patient  — openViewPatient()
     Services      — openServices(), svcTab(),
                     saveMedicine(), saveMedCert(), saveDoc()
     Exam          — openExam(), examTab(), saveFindings(),
                     saveOrders(), addRx(), finalizeConsultation()
     Edit Record   — openEditRecord(), saveEditRecord()
   ════════════════════════════════════════════════════ */

//  MODALS
// ══════════════════════════════════════════════════════
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function openTriage(qnum) {
  const entry = queue.find(q=>q.queueNum==qnum);
  if (!entry) return;
  activeTriagePatientId = qnum;
  document.getElementById('modal-triage-patient-name').textContent = `Patient: ${entry.name} — #${entry.queueNum} — ${entry.purpose}`;
  const t = entry.triage || {};
  ['bp','hr','temp','rr','o2','weight','height','complaint','notes'].forEach(f=>{
    const el = document.getElementById('tr-'+f);
    if (el) el.value = t[f]||'';
  });
  if (t.priority) document.getElementById('tr-priority').value = t.priority;
  openModal('modal-triage');
}

function saveTriage() {
  const entry = queue.find(q=>q.queueNum==activeTriagePatientId);
  if (!entry) return;
  entry.triage = {
    bp: document.getElementById('tr-bp').value,
    hr: document.getElementById('tr-hr').value,
    temp: document.getElementById('tr-temp').value,
    rr: document.getElementById('tr-rr').value,
    o2: document.getElementById('tr-o2').value,
    weight: document.getElementById('tr-weight').value,
    height: document.getElementById('tr-height').value,
    complaint: document.getElementById('tr-complaint').value,
    notes: document.getElementById('tr-notes').value,
    priority: document.getElementById('tr-priority').value
  };
  entry.triaged = true;
  entry.status = 'triaged';
  saveData();
  closeModal('modal-triage');
  staffNav('queue');
}

function endorseToDoctor(qnum) {
  const entry = queue.find(q=>q.queueNum==qnum);
  if (!entry) return;
  entry.endorsed = true;
  entry.status = 'with-doctor';
  saveData();
  staffNav('queue');
}

function openViewPatient(qnum) {
  const entry = queue.find(q=>q.queueNum==qnum);
  if (!entry) return;
  const u = users.find(u=>u.id===entry.patientId);
  const d = u?.demographics || {};
  const m = u?.medical || {};
  let html = `
    <div style="display:flex; gap:14px; align-items:flex-start; margin-bottom:18px; background:#f4f2ee; padding:14px; border-radius:8px;">
      <div style="font-family:'DM Serif Display',serif; font-size:2.5rem; width:60px; height:60px; background:var(--accent); color:#fff; display:flex; align-items:center; justify-content:center; border-radius:50%;">${entry.name[0]}</div>
      <div><div style="font-weight:600; font-size:1.1rem;">${entry.name}</div>
        <div class="text-muted">${entry.patientId} · ${entry.purpose}</div>
        <div class="mt8">${getStatusBadge(entry.status)}</div>
      </div>
    </div>`;

  if (u) {
    html += `
      <div style="font-weight:600; margin-bottom:8px;">Demographic Information</div>
      <div class="field-row3" style="font-size:.875rem; margin-bottom:14px;">
        <div><div class="text-muted">DOB</div><div>${d.dob||'—'}</div></div>
        <div><div class="text-muted">Sex</div><div>${d.sex||'—'}</div></div>
        <div><div class="text-muted">Blood Type</div><div>${d.blood||'—'}</div></div>
      </div>
      <div class="field-row" style="font-size:.875rem; margin-bottom:14px;">
        <div><div class="text-muted">Allergies</div><div>${m.allergies||'None'}</div></div>
        <div><div class="text-muted">Medications</div><div>${m.meds||'None'}</div></div>
      </div>
    `;
  } else {
    html += `<div class="alert alert-warn">Walk-in patient — no registered profile found.</div>`;
  }

  if (entry.triage?.bp) {
    html += `
      <hr class="divider">
      <div style="font-weight:600; margin-bottom:8px;">Triage Vitals</div>
      <div class="field-row3" style="font-size:.875rem;">
        <div><div class="text-muted">BP</div><div>${entry.triage.bp}</div></div>
        <div><div class="text-muted">HR</div><div>${entry.triage.hr} bpm</div></div>
        <div><div class="text-muted">Temp</div><div>${entry.triage.temp}°C</div></div>
        <div><div class="text-muted">RR</div><div>${entry.triage.rr}</div></div>
        <div><div class="text-muted">O2 Sat</div><div>${entry.triage.o2}%</div></div>
        <div><div class="text-muted">Weight</div><div>${entry.triage.weight} kg</div></div>
      </div>
      <div style="margin-top:10px; font-size:.875rem;"><div class="text-muted">Chief Complaint</div><div>${entry.triage.complaint||'—'}</div></div>
      <div style="margin-top:6px; font-size:.875rem;"><div class="text-muted">Initial Assessment</div><div>${entry.triage.notes||'—'}</div></div>
    `;
  }

  if (entry.exam?.diagnosis) {
    html += `
      <hr class="divider">
      <div style="font-weight:600; margin-bottom:8px;">Doctor's Examination</div>
      <div style="font-size:.875rem;"><div class="text-muted">Diagnosis</div><div>${entry.exam.diagnosis||'—'}</div></div>
    `;
  }

  document.getElementById('modal-view-content').innerHTML = html;
  openModal('modal-view-patient');
}

function openServices(qnum) {
  const entry = queue.find(q=>q.queueNum==qnum);
  if (!entry) return;
  activeServicesPatientId = qnum;
  document.getElementById('modal-services-patient').textContent = `Patient: ${entry.name} — ${entry.purpose}`;
  // reset fields
  ['svc-med-name','svc-med-dose','svc-med-qty','svc-med-instr','svc-med-by',
   'svc-cert-diag','svc-cert-by','svc-doc-desc'].forEach(id => {
    const el = document.getElementById(id); if(el) el.value='';
  });
  renderDocsList(entry);
  openModal('modal-services');
}

function svcTab(tab) {
  ['medicine','medcert','docs'].forEach(t => {
    document.getElementById('svc-'+t)?.classList.toggle('active', t===tab);
  });
  document.querySelectorAll('#svc-tabs .tab').forEach((t,i) => t.classList.toggle('active', ['medicine','medcert','docs'][i]===tab));
}

function saveMedicine() {
  const entry = queue.find(q=>q.queueNum==activeServicesPatientId);
  if (!entry) return;
  entry.services.push({
    type:'medicine', name: document.getElementById('svc-med-name').value,
    dose: document.getElementById('svc-med-dose').value,
    qty: document.getElementById('svc-med-qty').value,
    instr: document.getElementById('svc-med-instr').value,
    by: document.getElementById('svc-med-by').value,
    time: new Date().toLocaleTimeString()
  });
  saveData();
  alert('Medicine issuance recorded.');
}

function saveMedCert() {
  const entry = queue.find(q=>q.queueNum==activeServicesPatientId);
  if (!entry) return;
  entry.services.push({ type:'medcert', certType: document.getElementById('svc-cert-type').value, diag: document.getElementById('svc-cert-diag').value, by: document.getElementById('svc-cert-by').value, time: new Date().toLocaleTimeString() });
  saveData();
  alert('Medical certificate issued.');
}

function saveDoc() {
  const entry = queue.find(q=>q.queueNum==activeServicesPatientId);
  if (!entry) return;
  entry.docs.push({ docType: document.getElementById('svc-doc-type').value, desc: document.getElementById('svc-doc-desc').value, date: document.getElementById('svc-doc-date').value });
  saveData();
  renderDocsList(entry);
}

function renderDocsList(entry) {
  const list = document.getElementById('svc-docs-list');
  if (!list) return;
  if (!entry.docs || entry.docs.length === 0) { list.innerHTML = '<div class="text-muted">No documents archived yet.</div>'; return; }
  list.innerHTML = entry.docs.map(d=>`<div class="rx-block">${d.docType}: ${d.desc} <span class="text-muted">(${d.date})</span></div>`).join('');
}

function openEditRecord(qnum) {
  const entry = queue.find(q=>q.queueNum==qnum);
  if (!entry) return;
  activeEditPatientId = qnum;
  document.getElementById('edit-purpose').value = entry.purpose;
  document.getElementById('edit-arrival').value = entry.time;
  document.getElementById('edit-notes').value = entry.triage?.notes||'';
  openModal('modal-edit-record');
}

function saveEditRecord() {
  const entry = queue.find(q=>q.queueNum==activeEditPatientId);
  if (!entry) return;
  entry.purpose = document.getElementById('edit-purpose').value;
  entry.time = document.getElementById('edit-arrival').value;
  if (!entry.triage) entry.triage = {};
  entry.triage.notes = document.getElementById('edit-notes').value;
  saveData();
  closeModal('modal-edit-record');
  staffNav('arrivals');
}

// ── EXAM MODAL ──
let rxCount = 0;

function openExam(qnum, tab) {
  const entry = queue.find(q=>q.queueNum==qnum);
  if (!entry) return;
  activeExamPatientId = qnum;
  document.getElementById('modal-exam-patient').textContent = `Patient: ${entry.name} — #${entry.queueNum} — ${entry.purpose}`;

  const ex = entry.exam || {};
  ['general','heent','chest','cardio','abdomen','extremities','neuro','diagnosis','icd','instructions','final-notes'].forEach(f=>{
    const el = document.getElementById('ex-'+f); if(el) el.value = ex[f]||'';
  });

  // reset rx
  rxCount = 0;
  document.getElementById('rx-list').innerHTML = '';
  (ex.rx||[]).forEach(rx => addRxEntry(rx));

  // lab checkboxes
  document.querySelectorAll('.lab-check').forEach(cb => {
    cb.checked = (ex.labs||[]).includes(cb.value);
  });

  // switch tabs
  ['findings','orders','finalize'].forEach(t => {
    document.getElementById('exam-'+t)?.classList.remove('active');
    document.querySelectorAll('#modal-exam .tab').forEach((tt,i) => tt.classList.remove('active'));
  });
  const tabName = tab || 'findings';
  document.getElementById('exam-'+tabName)?.classList.add('active');
  const tabIdx = {findings:0, orders:1, finalize:2};
  document.querySelectorAll('#modal-exam .tab')[tabIdx[tabName]]?.classList.add('active');

  // finalize summary
  renderFinalizeSummary(entry);
  openModal('modal-exam');
}

function examTab(tab) {
  ['findings','orders','finalize'].forEach(t => document.getElementById('exam-'+t)?.classList.remove('active'));
  document.querySelectorAll('#modal-exam .tab').forEach(t => t.classList.remove('active'));
  document.getElementById('exam-'+tab)?.classList.add('active');
  const idx = {findings:0, orders:1, finalize:2};
  document.querySelectorAll('#modal-exam .tab')[idx[tab]]?.classList.add('active');
  const entry = queue.find(q=>q.queueNum==activeExamPatientId);
  if (tab === 'finalize' && entry) renderFinalizeSummary(entry);
}

function addRx() { addRxEntry({}); }
function addRxEntry(rx) {
  rxCount++;
  const id = rxCount;
  const div = document.createElement('div');
  div.className = 'rx-block';
  div.id = 'rx-'+id;
  div.innerHTML = `
    <button class="rx-remove" onclick="document.getElementById('rx-${id}').remove()">✕</button>
    <div class="field-row">
      <div class="field"><label>Drug Name</label><input class="rx-drug" placeholder="Generic name" value="${rx.drug||''}"></div>
      <div class="field"><label>Dosage</label><input class="rx-dose" placeholder="e.g. 500mg" value="${rx.dose||''}"></div>
    </div>
    <div class="field-row">
      <div class="field"><label>Frequency</label><input class="rx-freq" placeholder="e.g. TID x 5 days" value="${rx.freq||''}"></div>
      <div class="field"><label>Route</label><input class="rx-route" placeholder="e.g. Oral" value="${rx.route||''}"></div>
    </div>
  `;
  document.getElementById('rx-list').appendChild(div);
}

function saveFindings() {
  const entry = queue.find(q=>q.queueNum==activeExamPatientId);
  if (!entry) return;
  if (!entry.exam) entry.exam = {};
  ['general','heent','chest','cardio','abdomen','extremities','neuro','diagnosis','icd'].forEach(f=>{
    entry.exam[f] = document.getElementById('ex-'+f)?.value||'';
  });
  saveData();
  alert('Physical findings saved.');
  examTab('orders');
}

function saveOrders() {
  const entry = queue.find(q=>q.queueNum==activeExamPatientId);
  if (!entry) return;
  if (!entry.exam) entry.exam = {};
  entry.exam.labs = Array.from(document.querySelectorAll('.lab-check:checked')).map(c=>c.value);
  const labOther = document.getElementById('ex-lab-other')?.value;
  if (labOther) entry.exam.labs.push(labOther);
  entry.exam.instructions = document.getElementById('ex-instructions')?.value||'';

  // collect rx
  const rxBlocks = document.querySelectorAll('.rx-block');
  entry.exam.rx = Array.from(rxBlocks).map(b=>({
    drug: b.querySelector('.rx-drug')?.value||'',
    dose: b.querySelector('.rx-dose')?.value||'',
    freq: b.querySelector('.rx-freq')?.value||'',
    route: b.querySelector('.rx-route')?.value||''
  })).filter(r=>r.drug);

  saveData();
  alert('Orders and prescriptions saved.');
  examTab('finalize');
}

function renderFinalizeSummary(entry) {
  const ex = entry.exam||{};
  const t = entry.triage||{};
  const summary = document.getElementById('finalize-summary');
  if (!summary) return;
  summary.innerHTML = `
    <div class="card card-sm" style="margin-bottom:10px;">
      <div style="font-size:.8rem; font-weight:600; color:var(--muted); margin-bottom:8px; text-transform:uppercase; letter-spacing:.5px;">Summary</div>
      <div style="font-size:.875rem;"><b>Chief Complaint:</b> ${t.complaint||'—'}</div>
      <div style="font-size:.875rem; margin-top:4px;"><b>Diagnosis:</b> ${ex.diagnosis||'Not yet entered'}</div>
      <div style="font-size:.875rem; margin-top:4px;"><b>Labs:</b> ${(ex.labs||[]).join(', ')||'None'}</div>
      <div style="font-size:.875rem; margin-top:4px;"><b>Prescriptions:</b> ${(ex.rx||[]).map(r=>r.drug+' '+r.dose).join(', ')||'None'}</div>
    </div>
  `;
}

function saveConsultFinal() {
  const entry = queue.find(q=>q.queueNum==activeExamPatientId);
  if (!entry) return;
  if (!entry.exam) entry.exam = {};
  entry.exam['final-notes'] = document.getElementById('ex-final-notes')?.value||'';
}

function finalizeConsultation() {
  saveConsultFinal();
  finalizePatient(activeExamPatientId);
  closeModal('modal-exam');
}

function finalizePatient(qnum) {
  const entry = queue.find(q=>q.queueNum==qnum);
  if (!entry) return;
  entry.finalized = true;
  entry.status = 'done';
  // Add to daily log
  dailyLog.push({
    queueNum: entry.queueNum,
    patientId: entry.patientId,
    name: entry.name,
    purpose: entry.purpose,
    time: entry.time,
    date: new Date().toLocaleDateString(),
    diagnosis: entry.exam?.diagnosis||'—',
    doctor: currentUser?.name||'Doctor',
    labs: entry.exam?.labs||[],
    rx: entry.exam?.rx||[]
  });
  saveData();
  alert(`Consultation for ${entry.name} has been finalized and added to the Daily Patient Log.`);
  docNav('consult');
}

// ── Close modals on overlay click ──
document.querySelectorAll('.modal-overlay').forEach(ov => {
  ov.addEventListener('click', e => { if (e.target === ov) ov.classList.remove('open'); });
});

// ── Enter key for login ──
document.getElementById('login-pass').addEventListener('keydown', e => { if (e.key==='Enter') doLogin(); });

// ── Init signup ──
renderSignupStep();
