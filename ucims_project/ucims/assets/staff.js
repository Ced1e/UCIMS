/* ════════════════════════════════════════════════════
   staff.js — Staff / Nurse Dashboard
   UCIMS · University of Southeastern Philippines Clinic
   ════════════════════════════════════════════════════
   Functions:
     staffNav(section)
     renderStaffQueue(main)
     renderStaffArrivals(main)
     renderStaffTriage(main)
     renderStaffServicesPage(main)
     renderStaffRecords(main)
     recTab(tab, el)
     endorseToDoctor(qnum)
   ════════════════════════════════════════════════════ */

//  STAFF DASHBOARD
// ══════════════════════════════════════════════════════
function staffNav(section) {
  ['queue','arrivals','triage','services','records','dailylog'].forEach(s => {
    const el = document.getElementById('sn-'+s);
    if (el) el.classList.toggle('active', s === section);
  });
  const main = document.getElementById('staff-main');
  const map = {
    queue: renderStaffQueue, arrivals: renderStaffArrivals,
    triage: renderStaffTriage, services: renderStaffServicesPage,
    records: renderStaffRecords, dailylog: renderDailyLog.bind(null,'staff')
  };
  if (map[section]) map[section](main);
}

function renderStaffQueue(main) {
  const waiting = queue.filter(q => !q.finalized);
  main.innerHTML = `
    <div class="page-header">
      <h1>Queue Monitoring</h1>
      <p>Real-time patient queue — ${waiting.length} patient(s) active today.</p>
    </div>
    <div class="stats-row">
      <div class="stat-card"><div class="stat-num">${queue.filter(q=>q.status==='waiting').length}</div><div class="stat-label">Waiting</div></div>
      <div class="stat-card"><div class="stat-num">${queue.filter(q=>q.status==='triaged').length}</div><div class="stat-label">Triaged</div></div>
      <div class="stat-card"><div class="stat-num">${queue.filter(q=>q.status==='with-doctor').length}</div><div class="stat-label">With Doctor</div></div>
      <div class="stat-card"><div class="stat-num">${queue.filter(q=>q.finalized).length}</div><div class="stat-label">Done Today</div></div>
    </div>
    ${waiting.length === 0 ? '<div class="card"><div class="text-muted">Queue is empty. All patients have been attended to.</div></div>' : ''}
    ${waiting.map(q => {
      const priorityColor = q.triage?.priority === 'red' ? '#fde8e6' : q.triage?.priority === 'yellow' ? '#fef3cd' : '';
      return `
      <div class="queue-item" style="${priorityColor ? 'border-left:4px solid '+(q.triage?.priority==='red'?'#c0392b':'#d4820a')+';':''} background:${priorityColor||'white'}">
        <div class="queue-num">#${q.queueNum}</div>
        <div class="queue-info">
          <div class="queue-name">${q.name}</div>
          <div class="queue-detail">${q.purpose} &nbsp;·&nbsp; Arrived ${q.time}</div>
          <div class="mt8">${getStatusBadge(q.status)}</div>
        </div>
        <div class="queue-actions">
          ${!q.triaged ? `<button class="btn btn-primary btn-sm" onclick="openTriage('${q.queueNum}')">🩺 Triage</button>` : ''}
          ${q.triaged && !q.endorsed ? `<button class="btn btn-yellow btn-sm" onclick="endorseToDoctor('${q.queueNum}')">➡ Endorse to Doctor</button>` : ''}
          <button class="btn btn-secondary btn-sm" onclick="openViewPatient('${q.queueNum}')">View</button>
          <button class="btn btn-secondary btn-sm" onclick="openServices('${q.queueNum}')">💊 Services</button>
        </div>
      </div>`;
    }).join('')}
  `;
}

function getStatusBadge(status) {
  const map = {
    'waiting':'<span class="badge badge-yellow">Waiting</span>',
    'triaged':'<span class="badge badge-blue">Triaged</span>',
    'with-doctor':'<span class="badge badge-blue">With Doctor</span>',
    'done':'<span class="badge badge-green">Done</span>'
  };
  return map[status] || `<span class="badge badge-gray">${status}</span>`;
}

function renderStaffArrivals(main) {
  main.innerHTML = `
    <div class="page-header"><h1>Patient Arrival Records</h1><p>All patients logged today.</p></div>
    <div class="card">
      <div class="flex-between" style="margin-bottom:14px;">
        <div style="font-size:.85rem; color:var(--muted);">${queue.length} total patient(s) logged</div>
      </div>
      <table>
        <thead><tr><th>#</th><th>Patient</th><th>Purpose</th><th>Arrival</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          ${queue.map(q=>`
            <tr>
              <td><span class="inline-badge">${q.queueNum}</span></td>
              <td><div style="font-weight:500;">${q.name}</div><div class="text-muted" style="font-size:.78rem;">${q.patientId}</div></td>
              <td>${q.purpose}</td>
              <td>${q.time}</td>
              <td>${getStatusBadge(q.status)}</td>
              <td>
                <button class="btn btn-secondary btn-sm" onclick="openEditRecord('${q.queueNum}')">✏ Edit</button>
                <button class="btn btn-secondary btn-sm" onclick="openViewPatient('${q.queueNum}')">View</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderStaffTriage(main) {
  const untriaged = queue.filter(q => !q.triaged && !q.finalized);
  main.innerHTML = `
    <div class="page-header"><h1>Triage Module</h1><p>Enter vital signs and initial assessment for waiting patients.</p></div>
    ${untriaged.length === 0 ? '<div class="card"><div class="text-muted">No patients awaiting triage.</div></div>' : ''}
    ${untriaged.map(q=>`
      <div class="queue-item">
        <div class="queue-num">#${q.queueNum}</div>
        <div class="queue-info">
          <div class="queue-name">${q.name}</div>
          <div class="queue-detail">${q.purpose} · Arrived ${q.time}</div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="openTriage('${q.queueNum}')">🩺 Begin Triage</button>
      </div>
    `).join('')}
  `;
}

function renderStaffServicesPage(main) {
  main.innerHTML = `
    <div class="page-header"><h1>Services & Documents</h1><p>Issue medicines, certificates, and archive documents.</p></div>
    <div class="card">
      <div class="card-title">Select Patient for Services</div>
      <table>
        <thead><tr><th>#</th><th>Patient</th><th>Purpose</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>
          ${queue.filter(q=>q.triaged).map(q=>`
            <tr>
              <td>${q.queueNum}</td>
              <td>${q.name}</td>
              <td>${q.purpose}</td>
              <td>${getStatusBadge(q.status)}</td>
              <td><button class="btn btn-primary btn-sm" onclick="openServices('${q.queueNum}')">💊 Manage Services</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderStaffRecords(main) {
  main.innerHTML = `
    <div class="page-header"><h1>Records Management</h1><p>Manage record retention, archiving, and disposal.</p></div>
    <div class="tabs">
      <div class="tab active" onclick="recTab('retention', this)">📁 Record Retention</div>
      <div class="tab" onclick="recTab('archive', this)">🗄️ Record Archiving</div>
      <div class="tab" onclick="recTab('disposal', this)">🗑️ Record Deletion/Disposal</div>
    </div>
    <div id="rec-panel"></div>
  `;
  recTab('retention', document.querySelector('#staff-main .tab'));
}

function recTab(tab, el) {
  document.querySelectorAll('#staff-main .tab').forEach(t=>t.classList.remove('active'));
  if (el) el.classList.add('active');
  const panel = document.getElementById('rec-panel');
  if (tab === 'retention') {
    panel.innerHTML = `
      <div class="card">
        <div class="card-title">Active Records</div>
        <div class="alert alert-info" style="font-size:.83rem;">Records are retained for a minimum of 10 years per DOH guidelines. All active patient records are listed below.</div>
        <table>
          <thead><tr><th>Patient ID</th><th>Name</th><th>Last Visit</th><th>Retention Status</th></tr></thead>
          <tbody>
            ${users.filter(u=>u.role==='patient').map(u=>`
              <tr>
                <td>${u.patientId||u.id}</td>
                <td>${u.name}</td>
                <td>${dailyLog.filter(l=>l.patientId===u.id).pop()?.date||'—'}</td>
                <td><span class="badge badge-green">Active</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>`;
  } else if (tab === 'archive') {
    panel.innerHTML = `
      <div class="card">
        <div class="card-title">Archive a Record</div>
        <div class="alert alert-warn" style="font-size:.83rem;">Archiving moves a record to read-only status. The record remains accessible but cannot be edited.</div>
        <div class="field"><label>Patient ID to Archive</label><input id="arc-id" placeholder="Enter patient ID"></div>
        <div class="field"><label>Reason for Archiving</label><select><option>Graduated / Left Institution</option><option>Deceased</option><option>Transfer of Records</option><option>Inactive – 5+ Years</option></select></div>
        <button class="btn btn-yellow" onclick="alert('Record archived (demo only).')">Archive Record</button>
      </div>`;
  } else {
    panel.innerHTML = `
      <div class="card">
        <div class="card-title">Record Deletion / Disposal</div>
        <div class="alert" style="background:#fde8e6; border-color:#f5b7b1; color:#7b241c; font-size:.83rem;">⚠ Record disposal is irreversible. This action requires supervisor approval and must comply with institutional data governance policies.</div>
        <div class="field"><label>Patient ID</label><input id="del-id" placeholder="Enter patient ID"></div>
        <div class="field"><label>Reason for Disposal</label><textarea placeholder="Provide legal justification for disposal..."></textarea></div>
        <div class="field"><label>Authorization Code</label><input type="password" placeholder="Supervisor authorization code"></div>
        <button class="btn btn-red" onclick="alert('Disposal request submitted for supervisor review (demo only).')">Submit Disposal Request</button>
      </div>`;
  }
}

// ══════════════════════════════════════════════════════
