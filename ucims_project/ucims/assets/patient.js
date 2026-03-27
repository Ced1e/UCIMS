/* ════════════════════════════════════════════════════
   patient.js — Patient Portal
   UCIMS · University of Southeastern Philippines Clinic
   ════════════════════════════════════════════════════
   Functions:
     patNav(section)
     renderPatientVisit(main)
     renderPurposeSelection(main)
     highlightPurpose(purpose)
     goToQueueEntry()
     renderQueueEntry(main, purpose)
     confirmEnterQueue(purpose)
     renderPatientInQueue(main, entry)
     leaveQueue()
     renderPatientProfile(main)
     renderPatientHistory(main)
   ════════════════════════════════════════════════════ */

//  PATIENT PORTAL
// ══════════════════════════════════════════════════════
function patNav(section) {
  document.querySelectorAll('#page-patient-visit .sidebar a').forEach(a => a.classList.remove('active'));
  const idx = {visit:0, profile:1, history:2};
  document.querySelectorAll('#page-patient-visit .sidebar a')[idx[section]]?.classList.add('active');

  const main = document.getElementById('patient-main');
  if (section === 'visit') renderPatientVisit(main);
  else if (section === 'profile') renderPatientProfile(main);
  else if (section === 'history') renderPatientHistory(main);
}

let selectedPurpose = null; // holds chosen purpose before queue entry

function renderPatientVisit(main) {
  // If already in queue, show queue ticket
  const inQueue = queue.find(q => q.patientId === currentUser.id && !q.finalized);
  if (inQueue) {
    renderPatientInQueue(main, inQueue);
    return;
  }
  // Otherwise start at step 1
  renderPurposeSelection(main);
}

function renderPurposeSelection(main) {
  selectedPurpose = null;
  const purposes = [
    {key:'OJT Clearance',              icon:'🎓', desc:'On-the-Job Training medical clearance requirement'},
    {key:'Consultation',               icon:'🩺', desc:'General medical consultation for illness or concern'},
    {key:'Follow-up',                  icon:'🔄', desc:'Follow-up check for a previous consultation or treatment'},
    {key:'Medical Certificate Request',icon:'📄', desc:'Request an official medical certificate document'}
  ];

  main.innerHTML = `
    <div class="page-header">
      <h1>Clinic Visit Logging</h1>
      <p>Complete both steps below to register your visit for today.</p>
    </div>

    <!-- Progress steps -->
    <div class="steps" style="margin-bottom:28px;">
      <div class="step active">1 &nbsp; Select Purpose</div>
      <div class="step">2 &nbsp; Enter Queue</div>
      <div class="step">3 &nbsp; Await Triage</div>
    </div>

    <!-- Step 1 card -->
    <div class="card" style="max-width:680px;">
      <div class="card-title">Step 1 — Visit Purpose Selection</div>
      <p class="text-muted" style="margin-bottom:20px;">Choose the reason for your clinic visit. You can only select one.</p>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px;" id="purpose-grid">
        ${purposes.map(p => `
          <div id="pc-${p.key.replace(/\s+/g,'-')}"
            onclick="highlightPurpose('${p.key}')"
            style="border:2px solid var(--border); border-radius:12px; padding:20px 20px 16px; cursor:pointer; transition:all .2s; position:relative;">
            <div style="font-size:2rem; margin-bottom:10px;">${p.icon}</div>
            <div style="font-weight:600; font-size:.95rem; margin-bottom:4px;">${p.key}</div>
            <div style="font-size:.8rem; color:var(--muted); line-height:1.4;">${p.desc}</div>
            <div class="purpose-check" style="display:none; position:absolute; top:10px; right:12px; background:var(--accent); color:#fff; border-radius:50%; width:22px; height:22px; font-size:.75rem; line-height:22px; text-align:center;">✓</div>
          </div>`).join('')}
      </div>

      <!-- Confirm button — hidden until a purpose is selected -->
      <div id="purpose-confirm-row" style="display:none; margin-top:22px; padding-top:18px; border-top:1px solid var(--border);">
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
          <div>
            <div style="font-size:.78rem; color:var(--muted); text-transform:uppercase; letter-spacing:.5px; margin-bottom:3px;">Selected Purpose</div>
            <div id="purpose-confirm-label" style="font-weight:600; font-size:1rem; color:var(--accent);"></div>
          </div>
          <button class="btn btn-primary" onclick="goToQueueEntry()">Proceed to Queue Entry →</button>
        </div>
      </div>
    </div>
  `;
}

function highlightPurpose(purpose) {
  selectedPurpose = purpose;
  // Reset all cards
  document.querySelectorAll('#purpose-grid > div').forEach(card => {
    card.style.borderColor = 'var(--border)';
    card.style.background = '';
    card.querySelector('.purpose-check').style.display = 'none';
  });
  // Highlight selected
  const key = purpose.replace(/\s+/g, '-');
  const card = document.getElementById('pc-' + key);
  if (card) {
    card.style.borderColor = 'var(--accent)';
    card.style.background = '#eaf2f8';
    card.querySelector('.purpose-check').style.display = 'block';
  }
  // Show confirm row
  const row = document.getElementById('purpose-confirm-row');
  row.style.display = 'block';
  document.getElementById('purpose-confirm-label').textContent = purpose;
}

function goToQueueEntry(main) {
  if (!selectedPurpose) return;
  const el = document.getElementById('patient-main');
  renderQueueEntry(el, selectedPurpose);
}

function renderQueueEntry(main, purpose) {
  const purposeIcons = {
    'OJT Clearance':'🎓','Consultation':'🩺','Follow-up':'🔄','Medical Certificate Request':'📄'
  };
  const icon = purposeIcons[purpose] || '📋';

  main.innerHTML = `
    <div class="page-header">
      <h1>Clinic Visit Logging</h1>
      <p>Review your visit details and confirm to enter the queue.</p>
    </div>

    <!-- Progress steps -->
    <div class="steps" style="margin-bottom:28px;">
      <div class="step done">1 &nbsp; Select Purpose</div>
      <div class="step active">2 &nbsp; Enter Queue</div>
      <div class="step">3 &nbsp; Await Triage</div>
    </div>

    <!-- Step 2 card -->
    <div class="card" style="max-width:680px;">
      <div class="card-title">Step 2 — Queue Entry</div>
      <p class="text-muted" style="margin-bottom:20px;">Please confirm the details below. Once you enter the queue, the nurse will be notified.</p>

      <!-- Summary box -->
      <div style="background:#f4f8fc; border:1.5px solid #c3daea; border-radius:10px; padding:20px 22px; margin-bottom:22px; display:flex; gap:18px; align-items:center;">
        <div style="font-size:2.8rem; line-height:1;">${icon}</div>
        <div>
          <div style="font-size:.75rem; color:var(--muted); text-transform:uppercase; letter-spacing:.5px; margin-bottom:3px;">Visit Purpose</div>
          <div style="font-weight:700; font-size:1.2rem; color:var(--accent);">${purpose}</div>
          <div style="font-size:.85rem; color:var(--muted); margin-top:4px;">Patient: <b>${currentUser.name}</b> &nbsp;·&nbsp; ID: <b>${currentUser.id}</b></div>
        </div>
      </div>

      <div class="alert alert-info" style="font-size:.85rem; margin-bottom:20px;">
        📌 After entering the queue, proceed to the clinic waiting area. The nurse will call your queue number for triage.
      </div>

      <div style="display:flex; gap:12px; align-items:center;">
        <button class="btn btn-secondary" onclick="renderPurposeSelection(document.getElementById('patient-main'))">← Change Purpose</button>
        <button class="btn btn-green" onclick="confirmEnterQueue('${purpose}')" style="flex:1;">✅ Confirm & Enter Queue</button>
      </div>
    </div>
  `;
}

function confirmEnterQueue(purpose) {
  queueCounter++;
  const now = new Date();
  const timeStr = now.toTimeString().slice(0,5);
  const entry = {
    queueNum: queueCounter,
    patientId: currentUser.id,
    name: currentUser.name,
    purpose: purpose,
    time: timeStr,
    status: 'waiting',
    triaged: false, endorsed: false, finalized: false,
    triage: {}, exam: {}, services: [], docs: []
  };
  queue.push(entry);
  saveData();
  renderPatientInQueue(document.getElementById('patient-main'), entry);
}

function renderPatientInQueue(main, entry) {
  const statusLabels = {
    'waiting': {label:'Waiting for Triage', badge:'badge-yellow'},
    'triaged': {label:'Triaged – Waiting for Doctor', badge:'badge-blue'},
    'with-doctor': {label:'With Doctor', badge:'badge-blue'},
    'done': {label:'Consultation Complete', badge:'badge-green'}
  };
  const s = statusLabels[entry.status] || {label:entry.status, badge:'badge-gray'};
  main.innerHTML = `
    <div class="page-header">
      <h1>You are in the Queue</h1>
      <p>Please wait – the nurse will call your number.</p>
    </div>
    <div class="card" style="text-align:center; padding:40px;">
      <div style="font-size:.85rem; color:var(--muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:8px;">Your Queue Number</div>
      <div style="font-family:'DM Serif Display',serif; font-size:5rem; color:var(--accent); line-height:1;">${entry.queueNum}</div>
      <div style="margin-top:16px;"><span class="badge ${s.badge}" style="font-size:.85rem; padding:6px 16px;">${s.label}</span></div>
      <div style="margin-top:12px; font-size:.85rem; color:var(--muted);">Purpose: <b>${entry.purpose}</b> &nbsp;·&nbsp; Arrived: <b>${entry.time}</b></div>
    </div>
    ${entry.status==='with-doctor' ? `<div class="alert alert-info">The doctor is reviewing your records. Please remain nearby.</div>`:''}
    ${entry.status==='done' ? `
      <div class="alert alert-success">Your consultation is complete. Please collect any prescriptions or documents from the nurse's station. Have a safe trip home!</div>
      <button class="btn btn-secondary" onclick="leaveQueue()">Leave Queue & Return Home</button>
    ` : ''}
    ${entry.triage && entry.triage.bp ? `
      <div class="card card-sm" style="margin-top:0;">
        <div style="font-weight:500; margin-bottom:10px; font-size:.9rem;">📊 Your Vital Signs (Recorded by Nurse)</div>
        <div class="field-row3">
          <div><div class="text-muted" style="font-size:.75rem;">BP</div><div style="font-weight:500;">${entry.triage.bp}</div></div>
          <div><div class="text-muted" style="font-size:.75rem;">Heart Rate</div><div style="font-weight:500;">${entry.triage.hr} bpm</div></div>
          <div><div class="text-muted" style="font-size:.75rem;">Temp</div><div style="font-weight:500;">${entry.triage.temp}°C</div></div>
        </div>
      </div>
    `:''}
  `;
}

function leaveQueue() {
  queue = queue.filter(q => !(q.patientId === currentUser.id && q.finalized));
  saveData();
  patNav('visit');
}

function renderPatientProfile(main) {
  const u = currentUser;
  const d = u.demographics || {};
  main.innerHTML = `
    <div class="page-header"><h1>My Profile</h1><p>Your personal and medical information on file.</p></div>
    <div class="card">
      <div class="card-title">Demographic Information</div>
      <div class="field-row3">
        <div><div class="text-muted" style="font-size:.75rem; text-transform:uppercase; letter-spacing:.5px;">Full Name</div><div style="font-weight:500;">${d.fname||''} ${d.lname||''}</div></div>
        <div><div class="text-muted" style="font-size:.75rem; text-transform:uppercase; letter-spacing:.5px;">Date of Birth</div><div style="font-weight:500;">${d.dob||'—'}</div></div>
        <div><div class="text-muted" style="font-size:.75rem; text-transform:uppercase; letter-spacing:.5px;">Sex / Blood Type</div><div style="font-weight:500;">${d.sex||'—'} / ${d.blood||'—'}</div></div>
      </div>
      <hr class="divider">
      <div class="field-row">
        <div><div class="text-muted" style="font-size:.75rem;">Address</div><div>${d.address||'—'}</div></div>
        <div><div class="text-muted" style="font-size:.75rem;">Contact</div><div>${d.contact||'—'}</div></div>
      </div>
    </div>
    <div class="card">
      <div class="card-title">Medical History</div>
      <div class="field-row">
        <div><div class="text-muted" style="font-size:.75rem;">Allergies</div><div>${u.medical?.allergies||'None stated'}</div></div>
        <div><div class="text-muted" style="font-size:.75rem;">Current Medications</div><div>${u.medical?.meds||'None stated'}</div></div>
      </div>
    </div>
  `;
}

function renderPatientHistory(main) {
  const myFinalized = dailyLog.filter(l => l.patientId === currentUser?.id);
  main.innerHTML = `
    <div class="page-header"><h1>Visit History</h1><p>Your past clinic consultations.</p></div>
    <div class="card">
      ${myFinalized.length === 0 ? '<div class="text-muted">No completed visits on record yet.</div>' : `
        <table>
          <thead><tr><th>Date</th><th>Purpose</th><th>Diagnosis</th><th>Doctor</th></tr></thead>
          <tbody>
            ${myFinalized.map(l=>`
              <tr>
                <td>${l.date}</td>
                <td>${l.purpose}</td>
                <td>${l.diagnosis||'—'}</td>
                <td>${l.doctor||'—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `}
    </div>
  `;
}

// ══════════════════════════════════════════════════════
