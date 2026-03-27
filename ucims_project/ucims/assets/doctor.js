/* ════════════════════════════════════════════════════
   doctor.js — Medical Doctor Dashboard
   UCIMS · University of Southeastern Philippines Clinic
   ════════════════════════════════════════════════════
   Functions:
     docNav(section)
     renderDocConsult(main)
     renderDocExam(main)
     renderDocOrders(main)
     renderDocApprovals(main)
     finalizePatient(qnum)
   ════════════════════════════════════════════════════ */

//  DOCTOR DASHBOARD
// ══════════════════════════════════════════════════════
function docNav(section) {
  ['consult','exam','orders','approvals','dailylog'].forEach(s => {
    const el = document.getElementById('dn-'+s);
    if (el) el.classList.toggle('active', s === section);
  });
  const main = document.getElementById('doctor-main');
  const map = {
    consult: renderDocConsult, exam: renderDocExam,
    orders: renderDocOrders, approvals: renderDocApprovals,
    dailylog: renderDailyLog.bind(null,'doctor')
  };
  if (map[section]) map[section](main);
}

function renderDocConsult(main) {
  const endorsed = queue.filter(q => q.endorsed && !q.finalized);
  main.innerHTML = `
    <div class="page-header">
      <h1>Active Consultations</h1>
      <p>${endorsed.length} patient(s) endorsed to you by the nursing staff.</p>
    </div>
    <div class="stats-row">
      <div class="stat-card"><div class="stat-num">${endorsed.length}</div><div class="stat-label">Endorsed to Doctor</div></div>
      <div class="stat-card"><div class="stat-num">${queue.filter(q=>q.finalized).length}</div><div class="stat-label">Finalized Today</div></div>
    </div>
    ${endorsed.length === 0 ? '<div class="card"><div class="text-muted">No endorsed patients at this time.</div></div>' : ''}
    ${endorsed.map(q=>`
      <div class="queue-item">
        <div class="queue-num">#${q.queueNum}</div>
        <div class="queue-info">
          <div class="queue-name">${q.name}</div>
          <div class="queue-detail">${q.purpose} · Arrived ${q.time}</div>
          ${q.triage?.bp ? `<div class="queue-detail mt8">BP: ${q.triage.bp} · HR: ${q.triage.hr}bpm · Temp: ${q.triage.temp}°C · CC: ${q.triage.complaint}</div>` : ''}
        </div>
        <div class="queue-actions">
          <button class="btn btn-primary btn-sm" onclick="openExam('${q.queueNum}')">🔬 Begin Exam</button>
          <button class="btn btn-secondary btn-sm" onclick="openViewPatient('${q.queueNum}')">View Record</button>
        </div>
      </div>
    `).join('')}
  `;
}

function renderDocExam(main) {
  const endorsed = queue.filter(q => q.endorsed && !q.finalized);
  main.innerHTML = `
    <div class="page-header"><h1>Medical Examination</h1></div>
    ${endorsed.length === 0 ? '<div class="card"><div class="text-muted">No patients awaiting examination.</div></div>' : ''}
    ${endorsed.map(q=>`
      <div class="queue-item">
        <div class="queue-num">#${q.queueNum}</div>
        <div class="queue-info">
          <div class="queue-name">${q.name}</div>
          <div class="queue-detail">${q.purpose}</div>
          ${q.exam?.diagnosis ? `<div class="mt8"><span class="badge badge-blue">Exam recorded</span></div>` : ''}
        </div>
        <button class="btn btn-primary btn-sm" onclick="openExam('${q.queueNum}')">Open Examination</button>
      </div>
    `).join('')}
  `;
}

function renderDocOrders(main) {
  const endorsed = queue.filter(q => q.endorsed && !q.finalized);
  main.innerHTML = `
    <div class="page-header"><h1>Orders & Prescriptions</h1></div>
    ${endorsed.map(q=>`
      <div class="queue-item">
        <div class="queue-num">#${q.queueNum}</div>
        <div class="queue-info">
          <div class="queue-name">${q.name}</div>
          <div class="queue-detail">${q.purpose}</div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="openExam('${q.queueNum}', 'orders')">📝 Orders</button>
      </div>
    `).join('')}
    ${endorsed.length===0?'<div class="card"><div class="text-muted">No active orders pending.</div></div>':''}
  `;
}

function renderDocApprovals(main) {
  const toApprove = queue.filter(q => q.endorsed && q.exam?.diagnosis && !q.finalized);
  main.innerHTML = `
    <div class="page-header"><h1>Approvals – Finalize Clinical Findings</h1></div>
    ${toApprove.length === 0 ? '<div class="card"><div class="text-muted">No consultations pending finalization. Complete examination first.</div></div>' : ''}
    ${toApprove.map(q=>`
      <div class="card">
        <div class="flex-between" style="margin-bottom:12px;">
          <div>
            <div style="font-weight:600; font-size:1rem;">${q.name} <span class="inline-badge" style="margin-left:4px;">#${q.queueNum}</span></div>
            <div class="text-muted">${q.purpose}</div>
          </div>
          <span class="badge badge-yellow">Pending Finalization</span>
        </div>
        <div style="font-size:.875rem;"><b>Diagnosis:</b> ${q.exam?.diagnosis||'—'}</div>
        <div style="font-size:.875rem; margin-top:4px;"><b>Chief Complaint:</b> ${q.triage?.complaint||'—'}</div>
        <div class="btn-row" style="margin-top:14px;">
          <button class="btn btn-secondary btn-sm" onclick="openExam('${q.queueNum}', 'finalize')">Review Details</button>
          <button class="btn btn-green" onclick="finalizePatient('${q.queueNum}')">✅ Finalize & Approve</button>
        </div>
      </div>
    `).join('')}
  `;
}

// ══════════════════════════════════════════════════════
//  DAILY LOG (shared)
// ══════════════════════════════════════════════════════
function renderDailyLog(role, main) {
  const today = new Date().toLocaleDateString();
  const todayLogs = dailyLog.filter(l => l.date === today);
  main.innerHTML = `
    <div class="page-header">
      <h1>Daily Patient Log</h1>
      <p>All finalized consultations for ${today}. Total: ${todayLogs.length}</p>
    </div>
    <div class="stats-row">
      <div class="stat-card"><div class="stat-num">${todayLogs.length}</div><div class="stat-label">Total Patients</div></div>
      <div class="stat-card"><div class="stat-num">${todayLogs.filter(l=>l.purpose==='Consultation').length}</div><div class="stat-label">Consultations</div></div>
      <div class="stat-card"><div class="stat-num">${todayLogs.filter(l=>l.purpose==='OJT Clearance').length}</div><div class="stat-label">OJT Clearances</div></div>
      <div class="stat-card"><div class="stat-num">${todayLogs.filter(l=>l.purpose==='Medical Certificate Request').length}</div><div class="stat-label">Med Cert Requests</div></div>
    </div>
    <div class="card">
      ${todayLogs.length === 0 ? '<div class="text-muted">No finalized consultations logged today yet.</div>' : `
        <table>
          <thead><tr><th>#</th><th>Patient</th><th>Purpose</th><th>Arrival</th><th>Diagnosis</th><th>Doctor</th><th>Status</th></tr></thead>
          <tbody>
            ${todayLogs.map(l=>`
              <tr>
                <td>${l.queueNum}</td>
                <td><div style="font-weight:500;">${l.name}</div><div class="text-muted" style="font-size:.75rem;">${l.patientId}</div></td>
                <td>${l.purpose}</td>
                <td>${l.time}</td>
                <td>${l.diagnosis||'—'}</td>
                <td>${l.doctor||'—'}</td>
                <td><span class="badge badge-green">Finalized</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `}
    </div>
  `;
}

// ══════════════════════════════════════════════════════
