/* patient.js — Patient interface */
let selPurpose=null, selPurposeType=null, selVisitLabel=null;

function patNav(sec){
  document.querySelectorAll('#page-patient .sidebar a').forEach(a=>a.classList.remove('active'));
  const idx={visit:0,queue:1};
  const links=document.querySelectorAll('#page-patient .sidebar a');
  if(links[idx[sec]]) links[idx[sec]].classList.add('active');
  const m=document.getElementById('pat-main');
  if(sec==='visit') renderPurposeSelect(m);
  if(sec==='queue') renderPatQueue(m);
}

function renderPurposeSelect(m){
  selPurpose=null; selPurposeType=null; selVisitLabel=null;
  const inQ=queue.find(q=>q.patientId===currentUser.id&&!q.finalized);
  if(inQ){ renderQueueTicket(m,inQ); return; }

  m.innerHTML=`
    <div class="page-header">
      <h1>Visit Purpose Selection</h1>
      <p>Choose the type of service you need for your visit today.</p>
    </div>
    <div class="steps" style="max-width:800px;">
      <div class="step active">1 · Select Purpose</div>
      <div class="step">2 · Details / Queue</div>
      <div class="step">3 · Queue Status</div>
    </div>
    <div style="max-width:800px;display:grid;grid-template-columns:1fr 1fr;gap:16px;">
      <div class="purpose-card" id="pcard-consult" onclick="selectMainPurpose('consult')">
        <div style="width:52px;height:52px;border-radius:12px;background:#f5e0e0;display:flex;align-items:center;justify-content:center;font-size:1.6rem;margin-bottom:14px;color:var(--maroon);"><i class="bi bi-heart-pulse"></i></div>
        <div style="font-weight:700;font-size:1rem;margin-bottom:5px;color:var(--maroon);">Consultation</div>
        <div style="font-size:.8rem;color:var(--text-muted);line-height:1.5;">Visit the clinic for a check-up, medicine request, or follow-up consultation.</div>
        <div class="pc-chk" style="display:none;position:absolute;top:12px;right:12px;background:var(--maroon);color:#fff;border-radius:50%;width:22px;height:22px;font-size:.7rem;line-height:22px;text-align:center;font-weight:700;"><i class="bi bi-check"></i></div>
      </div>
      <div class="purpose-card med-hover" id="pcard-medcert" onclick="selectMainPurpose('medcert')">
        <div style="width:52px;height:52px;border-radius:12px;background:#e8edf6;display:flex;align-items:center;justify-content:center;font-size:1.6rem;margin-bottom:14px;color:var(--blue);"><i class="bi bi-file-earmark-medical"></i></div>
        <div style="font-weight:700;font-size:1rem;margin-bottom:5px;color:var(--blue);">Medical Certificate Request</div>
        <div style="font-size:.8rem;color:var(--text-muted);line-height:1.5;">Request an official medical certificate. Fill out a form and join the queue.</div>
        <div class="pc-chk" style="display:none;position:absolute;top:12px;right:12px;background:var(--blue);color:#fff;border-radius:50%;width:22px;height:22px;font-size:.7rem;line-height:22px;text-align:center;font-weight:700;"><i class="bi bi-check"></i></div>
      </div>
    </div>`;
}

function selectMainPurpose(type){
  document.querySelectorAll('.purpose-card').forEach(c=>{
    c.classList.remove('active-consult', 'active-medcert');
    c.querySelector('.pc-chk').style.display='none';
  });
  const card=document.getElementById('pcard-'+type);
  if(type==='consult'){
    card.classList.add('active-consult');
    card.querySelector('.pc-chk').style.display='block';
    setTimeout(()=>renderConsultSubOptions(document.getElementById('pat-main')),50);
  } else {
    card.classList.add('active-medcert');
    card.querySelector('.pc-chk').style.display='block';
    setTimeout(()=>renderMedCertForm(document.getElementById('pat-main')),50);
  }
}

function renderConsultSubOptions(m){
  m.innerHTML=`
    <div class="page-header">
      <h1>Consultation — Select Type</h1>
      <p>Choose the specific type of consultation for your visit.</p>
    </div>
    <div class="steps" style="max-width:800px;">
      <div class="step done">1 · Select Purpose</div>
      <div class="step active">2 · Consultation Type</div>
      <div class="step">3 · Queue Status</div>
    </div>
    <div style="max-width:800px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">
      ${[
        {type:'checkup',   icon:'<i class="bi bi-clipboard2-pulse"></i>', label:'Check-up',        desc:'General medical check-up and assessment'},
        {type:'medicine',  icon:'<i class="bi bi-capsule"></i>', label:'Medicine Request', desc:'Request for prescribed medicine issuance'},
        {type:'follow-up', icon:'<i class="bi bi-arrow-repeat"></i>', label:'Follow-up',        desc:'Follow-up for a prior consultation or treatment'}
      ].map(o=>`
        <div class="purpose-card" onclick="pickConsult('${o.type}','${o.label}')" id="csub-${o.type}" style="padding:24px 18px;text-align:center;">
          <div style="font-size:2.2rem;margin-bottom:12px;color:var(--maroon);">${o.icon}</div>
          <div style="font-weight:700;font-size:1rem;color:var(--maroon);margin-bottom:6px;">${o.label}</div>
          <div style="font-size:.8rem;color:var(--text-muted);line-height:1.4;">${o.desc}</div>
        </div>`).join('')}
    </div>
    <div style="max-width:800px;margin-top:16px;">
      <button class="btn btn-outline btn-sm" onclick="renderPurposeSelect(document.getElementById('pat-main'))"><i class="bi bi-arrow-left"></i> Back</button>
    </div>`;
}

function pickConsult(type, label){
  selPurpose='Consultation'; selPurposeType=type; selVisitLabel=label;
  renderQueueConfirm(document.getElementById('pat-main'));
}

function renderQueueConfirm(m){
  const icons={checkup:'<i class="bi bi-clipboard2-pulse"></i>',medicine:'<i class="bi bi-capsule"></i>','follow-up':'<i class="bi bi-arrow-repeat"></i>',medcert:'<i class="bi bi-file-earmark-medical"></i>'};
  m.innerHTML=`
    <div class="page-header"><h1>Confirm Queue Entry</h1></div>
    <div class="steps" style="max-width:800px;">
      <div class="step done">1 · Select Purpose</div>
      <div class="step active">2 · Confirm</div>
      <div class="step">3 · Queue Status</div>
    </div>
    <div class="card" style="max-width:800px;">
      <div class="card-title">Visit Details</div>
      <div style="background:#fdf5f5;border:1.5px solid #e8c0c0;border-radius:10px;padding:22px 24px;margin-bottom:18px;display:flex;gap:18px;align-items:center;">
        <div style="font-size:2.8rem;color:var(--maroon);">${icons[selPurposeType]||'<i class="bi bi-hospital"></i>'}</div>
        <div>
          <div style="font-size:.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;">${selPurpose}</div>
          <div style="font-weight:700;font-size:1.2rem;color:var(--maroon);">${selVisitLabel||selPurpose}</div>
          <div style="font-size:.85rem;color:var(--text-muted);margin-top:4px;">${currentUser.name} · ID: ${currentUser.patientId||currentUser.id}</div>
        </div>
      </div>
      <div class="alert alert-info text-sm"><i class="bi bi-info-circle"></i> After confirming, please proceed to the clinic waiting area. The nurse will call your queue number.</div>
      <div class="flex gap10 mt16">
        <button class="btn btn-outline" onclick="renderPurposeSelect(document.getElementById('pat-main'))"><i class="bi bi-arrow-left"></i> Back</button>
        <button class="btn btn-primary w100" onclick="confirmQueue()">Confirm & Enter Queue</button>
      </div>
    </div>`;
}

function renderMedCertForm(m){
  selPurpose='Medical Certificate Request'; selPurposeType='medcert'; selVisitLabel='Med Cert Request';
  m.innerHTML=`
    <div class="page-header"><h1>Medical Certificate Request</h1><p>Fill out the form below, then join the queue.</p></div>
    <div class="steps" style="max-width:800px;">
      <div class="step done">1 · Select Purpose</div>
      <div class="step active">2 · Fill Form</div>
      <div class="step">3 · Queue Status</div>
    </div>
    <div class="card" style="max-width:800px;">
      <div class="card-title">Request Form</div>
      <div class="field"><label>Type of Certificate *</label>
        <select id="mc-type">
          <option>Medical Certificate for School</option>
          <option>Medical Certificate for Employment</option>
          <option>OJT Clearance Certificate</option>
          <option>Sick Leave Certificate</option>
          <option>Return-to-School / Work Certificate</option>
        </select>
      </div>
      <div class="field"><label>Reason / Purpose *</label>
        <textarea id="mc-reason" placeholder="Briefly explain why you need this certificate..."></textarea>
      </div>
      <div class="field-row">
        <div class="field"><label>Date Needed From</label><input type="date" id="mc-from"></div>
        <div class="field"><label>Date Needed To</label><input type="date" id="mc-to"></div>
      </div>
      <div class="field"><label>Additional Notes (optional)</label>
        <input id="mc-notes" placeholder="Any additional information...">
      </div>
      <div class="flex gap10 mt16">
        <button class="btn btn-outline" onclick="renderPurposeSelect(document.getElementById('pat-main'))"><i class="bi bi-arrow-left"></i> Back</button>
        <button class="btn btn-primary w100" onclick="submitMedCert()">Submit & Enter Queue</button>
      </div>
    </div>`;
}

function submitMedCert(){
  if(!val('mc-reason').trim()){ toast('Please provide a reason for your request.','error'); return; }
  confirmQueue({certType:val('mc-type'),reason:val('mc-reason'),dateFrom:val('mc-from'),dateTo:val('mc-to'),notes:val('mc-notes')});
}

function confirmQueue(extra){
  queueCounter++;
  const e={
    queueNum:queueCounter, patientId:currentUser.id, name:currentUser.name,
    purpose:selPurpose, purposeType:selPurposeType, visitLabel:selVisitLabel||selPurpose,
    time:nowTime(), status:'waiting', triaged:false, endorsed:false, finalized:false,
    triage:{}, exam:{}, services:[], medcertData:extra||null
  };
  queue.push(e); saveData();
  renderQueueTicket(document.getElementById('pat-main'),e);
  toast('You have joined the queue. Please wait in the clinic area.');
}

function renderPatQueue(m){
  const e=queue.find(q=>q.patientId===currentUser.id&&!q.finalized)
          ||queue.find(q=>q.patientId===currentUser.id&&q.finalized);
  if(!e){ renderPurposeSelect(m); return; }
  renderQueueTicket(m,e);
}

function renderQueueTicket(m,entry){
  const live=queue.find(q=>q.queueNum===entry.queueNum)||entry;
  const sMap={waiting:{lbl:'Waiting for Triage',badge:'b-yellow'},'triaged':{lbl:'Triaged — Awaiting Doctor',badge:'b-blue'},'with-doctor':{lbl:'With the Doctor',badge:'b-blue'},done:{lbl:'Consultation Complete',badge:'b-green'}};
  const s=sMap[live.status]||{lbl:live.status,badge:'b-gray'};
  const purposeLabelColor=live.purposeType==='medcert'?'var(--blue)':'var(--maroon)';
  
  const allWaiting = queue.filter(q => !q.finalized);

  m.innerHTML=`
    <div class="page-header"><h1>Queue Status</h1><p>Your current position in the clinic queue.</p></div>
    <div class="steps" style="max-width:800px;">
      <div class="step done">1 · Select Purpose</div>
      <div class="step done">2 · Entered Queue</div>
      <div class="step ${live.status==='done'?'done':live.status!=='waiting'?'active':'active'}">3 · Queue Status</div>
    </div>
    <div class="card" style="max-width:800px; padding:36px 32px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:20px;">
        <div>
          <div class="text-xs text-muted" style="text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;">Queue Number</div>
          <div style="font-family:'DM Serif Display',serif;font-size:5rem;color:var(--maroon);line-height:1;">${live.queueNum}</div>
          <div class="text-sm text-muted mt8">Time In: <b>${live.time}</b></div>
        </div>
        <div style="text-align:right;">
          <div style="margin:14px 0 12px;"><span class="badge ${s.badge}" style="font-size:.85rem;padding:8px 18px;">${s.lbl}</span></div>
          <div style="display:inline-block;padding:6px 16px;border-radius:20px;font-size:.8rem;font-weight:600;background:#f5e0e0;color:${purposeLabelColor};">${live.visitLabel||live.purpose}</div>
          <br><button class="btn btn-outline btn-sm mt16" onclick="patNav('queue')"><i class="bi bi-arrow-clockwise"></i> Refresh Status</button>
        </div>
      </div>
    </div>
    ${live.status==='done'?`
      <div class="alert alert-success" style="max-width:800px;"><i class="bi bi-check-circle-fill"></i> Your consultation is complete. Please collect prescriptions or documents at the nurse's station. Thank you!</div>
      <div style="max-width:800px;"><button class="btn btn-outline" onclick="leaveQueue()"><i class="bi bi-arrow-left"></i> Done — New Visit</button></div>`:
     live.status==='with-doctor'?`<div class="alert alert-info" style="max-width:800px;"><i class="bi bi-person-badge"></i> The doctor is reviewing your records. Please remain nearby.</div>`:''}
    ${live.triage?.bp?`
      <div class="card card-sm" style="max-width:800px;margin-top:0;">
        <div class="fw6 text-sm mb8" style="color:var(--maroon);"><i class="bi bi-activity"></i> Your Recorded Vital Signs</div>
        <div class="grid3">
          ${[['BP',live.triage.bp],['HR',live.triage.hr+' bpm'],['Temp',live.triage.temp+'°C'],['RR',live.triage.rr+' br/min'],['O₂',live.triage.o2+'%'],['Weight',live.triage.weight+' kg']].map(([l,v])=>`
            <div style="background:#f9f8f6;border-radius:7px;padding:12px 14px;">
              <div class="text-xs text-muted">${l}</div><div class="fw6 text-sm mt4">${v||'—'}</div>
            </div>`).join('')}
        </div>
        <div class="text-sm mt12"><span class="text-muted">Chief Complaint:</span> ${live.triage.complaint||'—'}</div>
      </div>`:''}
      
    <div class="card" style="max-width:800px; margin-top:20px;">
      <div class="card-title" style="font-size: 1.05rem;">Current Clinic Queue</div>
      <div class="text-sm text-muted mb8">See all patients currently in line.</div>
      <div class="table-wrap"><table>
        <thead><tr><th>Queue #</th><th>Status</th></tr></thead>
        <tbody>${allWaiting.map(q=>`
          <tr style="${q.queueNum === live.queueNum ? 'background:#fdf5f5;' : ''}">
            <td style="${q.queueNum === live.queueNum ? 'font-weight:bold; color:var(--maroon);' : ''}">
              <span class="num-badge" style="${q.queueNum === live.queueNum ? 'background:var(--maroon);' : 'background:#888;'}">${q.queueNum}</span> 
              ${q.queueNum === live.queueNum ? ' (You)' : ''}
            </td>
            <td>${statusBadge(q.status)}</td>
          </tr>`).join('')}
        </tbody></table></div>
    </div>
  `;
}

function leaveQueue(){
  queue=queue.filter(q=>!(q.patientId===currentUser.id&&q.finalized));
  saveData(); renderPurposeSelect(document.getElementById('pat-main'));
}