/* doctor.js — Doctor interface */

function docNav(sec){
  ['consult','history'].forEach(s=>{
    const el=document.getElementById('dn-'+s); if(el) el.classList.toggle('active',s===sec);
  });
  const m=document.getElementById('doctor-main');
  if(sec==='consult') renderDocConsult(m);
  if(sec==='history') renderDocHistory(m);
}

function renderDocConsult(m){
  const endorsed  = queue.filter(q=>q.endorsed&&!q.finalized);
  const finToday  = queue.filter(q=>q.finalized);

  m.innerHTML=`
    <div class="page-header"><h1>Active Consultations</h1><p>Patients endorsed by nursing staff for physician review.</p></div>

    <div class="stats-row">
      <div class="stat-card"><div class="stat-num">${endorsed.length}</div><div class="stat-label">Endorsed to Doctor</div></div>
      <div class="stat-card stat-green"><div class="stat-num">${finToday.length}</div><div class="stat-label">Finalized Today</div></div>
    </div>

    ${!endorsed.length?`<div class="empty-state"><div class="ei"><i class="bi bi-clipboard-x text-muted" style="opacity: 0.5;"></i></div><p>No endorsed patients at this time.<br>Patients appear here after the nurse completes triage and endorses them.</p></div>`:''}
    ${endorsed.map(q=>`
      <div class="queue-item">
        <div class="queue-num">#${q.queueNum}</div>
        <div class="queue-info">
          <div class="queue-name">${q.name}</div>
          <div class="flex gap6 mt4">${visitBadge(q)}${q.exam?.diagnosis?`<span class="badge b-blue"><i class="bi bi-check-circle"></i> Exam Done</span>`:`<span class="badge b-yellow"><i class="bi bi-hourglass"></i> Awaiting Exam</span>`}</div>
          <div class="queue-detail mt4">Arrived: ${q.time}${q.triage?.bp?' · BP: <b>'+q.triage.bp+'</b> · HR: <b>'+q.triage.hr+'bpm</b>':''}</div>
          ${q.triage?.complaint?`<div class="queue-detail" style="font-style:italic;">"${q.triage.complaint}"</div>`:''}
        </div>
        <div class="queue-actions">
          <button class="btn btn-outline btn-sm" onclick="openExamModal(${q.queueNum})"><i class="bi bi-stethoscope"></i> ${q.exam?.diagnosis?'Review Exam':'Begin Exam'}</button>
          <button class="btn btn-outline btn-sm" onclick="openDocViewRecord(${q.queueNum})"><i class="bi bi-file-medical"></i> View Record</button>
        </div>
      </div>`).join('')}`;
}

function openDocViewRecord(qnum){
  const e=queue.find(q=>q.queueNum==qnum); if(!e) return;
  const u=users.find(x=>x.id===e.patientId);
  if(!u){ toast('No registered profile found for this patient.','info'); return; }
  openPatRecord(u.id);
}

function renderDocHistory(m){
  const done=queue.filter(q=>q.finalized);
  m.innerHTML=`
    <div class="page-header"><h1>Examination History</h1><p>Completed consultations — view summaries of finalized examinations.</p></div>
    ${!done.length?`<div class="empty-state"><div class="ei"><i class="bi bi-clock-history text-muted" style="opacity: 0.5;"></i></div><p>No completed consultations yet today.</p></div>`:`
    <div class="card">
      <div class="table-wrap"><table>
        <thead><tr><th>#</th><th>Patient</th><th>Visit Type</th><th>Diagnosis</th><th>Time</th><th>Summary</th></tr></thead>
        <tbody>${done.map(q=>`
          <tr>
            <td><span class="num-badge">${q.queueNum}</span></td>
            <td><div class="fw6">${q.name}</div><div class="text-xs text-muted">${q.patientId}</div></td>
            <td>${visitBadge(q)}</td>
            <td>${q.exam?.diagnosis||'—'}</td>
            <td>${q.time}</td>
            <td><button class="btn btn-outline btn-sm" onclick="openExamSummaryModal(${q.queueNum})"><i class="bi bi-eye"></i> View Summary</button></td>
          </tr>`).join('')}
        </tbody></table></div>
    </div>`}`;
}

function openExamSummaryModal(qnum){
  openVisitSummaryModal(qnum);
}

function openExamModal(qnum, startTab){
  const e=queue.find(q=>q.queueNum==qnum); if(!e) return;
  activeQ=qnum;
  const ex=e.exam||{};
  document.getElementById('exam-modal-patient').innerHTML=`<b>${e.name}</b> · Queue #${e.queueNum} · ${e.visitLabel||e.purpose}`;
  populateTriageReview(e);
  ['general','heent','chest','cardio','abdomen','extremities','neuro','diagnosis','icd'].forEach(f=>setVal('ex-'+f,ex[f]||''));
  setVal('ex-instructions',ex.instructions||'');
  setVal('ex-final-notes',ex.finalNotes||'');
  document.querySelectorAll('.lab-chk').forEach(cb=>{cb.checked=(ex.labs||[]).includes(cb.value);});
  setVal('ex-lab-other','');
  rxCount=0;
  const rxl=document.getElementById('rx-list'); if(rxl) rxl.innerHTML='';
  (ex.rx||[]).forEach(r=>addRx(r));
  examModalTab(startTab||'triage-review');
  openModal('modal-exam');
}

function populateTriageReview(e){
  const t=e.triage||{};
  const el=document.getElementById('triage-review-content');
  if(!el) return;
  if(t.bp){
    el.innerHTML=`
      <div class="alert alert-info text-sm mb8"><i class="bi bi-info-circle"></i> Nurse-recorded vital signs. <b>View only — cannot be modified.</b></div>
      <div class="grid3 mb8">
        ${[['Blood Pressure',t.bp],['Heart Rate',t.hr+' bpm'],['Temperature',t.temp+'°C'],['Resp. Rate',t.rr+' br/min'],['O₂ Saturation',t.o2+'%'],['Weight / Height',t.weight+'kg / '+t.height+'cm']].map(([l,v])=>`
          <div style="background:#f9f8f6;padding:10px 12px;border-radius:7px;"><div class="text-xs text-muted">${l}</div><div class="fw6 text-sm mt4">${v||'—'}</div></div>`).join('')}
      </div>
      <div class="info-grid">
        <div class="info-item"><div class="info-lbl">Chief Complaint</div><div class="info-val">${t.complaint||'—'}</div></div>
        <div class="info-item"><div class="info-lbl">Nurse Assessment</div><div class="info-val">${t.notes||'—'}</div></div>
      </div>
      <div class="mt8">${priorityBadge(t.priority)}</div>`;
  } else {
    el.innerHTML=`<div class="alert alert-warn text-sm"><i class="bi bi-exclamation-triangle"></i> No triage data recorded yet for this patient.</div>`;
  }
}

function examModalTab(t){
  ['triage-review','diagnosis','prescriptions','finalize'].forEach(x=>{
    const el=document.getElementById('emt-'+x); if(el) el.classList.toggle('active',x===t);
  });
  document.querySelectorAll('#exam-tabs .tab').forEach((el,i)=>
    el.classList.toggle('active',['triage-review','diagnosis','prescriptions','finalize'][i]===t));
  if(t==='finalize') renderFinalizeSummary();
}

function renderFinalizeSummary(){
  const e=queue.find(q=>q.queueNum==activeQ); if(!e) return;
  const ex=e.exam||{}, t=e.triage||{};
  const el=document.getElementById('finalize-summary'); if(!el) return;
  el.innerHTML=`
    <div style="background:#f9f8f6;border-radius:8px;padding:16px 18px;margin-bottom:14px;">
      <div class="text-xs fw6 text-muted" style="text-transform:uppercase;letter-spacing:.5px;margin-bottom:12px;">Consultation Summary</div>
      <div class="grid2 text-sm" style="gap:10px;">
        <div><span class="text-muted">Patient:</span> <b>${e.name}</b></div>
        <div><span class="text-muted">Visit Type:</span> ${e.visitLabel||e.purpose}</div>
        <div><span class="text-muted">Chief Complaint:</span> ${t.complaint||'—'}</div>
        <div><span class="text-muted">Diagnosis:</span> <b>${ex.diagnosis||'Not entered'}</b>${ex.icd?' ('+ex.icd+')':''}</div>
        <div><span class="text-muted">Lab Requests:</span> ${(ex.labs||[]).join(', ')||'None'}</div>
        <div><span class="text-muted">Prescriptions:</span> ${(ex.rx||[]).filter(r=>r.drug).map(r=>r.drug+' '+r.dose).join(', ')||'None'}</div>
      </div>
      ${ex.instructions?`<div class="text-sm mt8"><span class="text-muted">Instructions:</span> ${ex.instructions}</div>`:''}
    </div>`;
}

function saveDiagnosis(){
  const e=queue.find(q=>q.queueNum==activeQ); if(!e) return;
  if(!val('ex-diagnosis').trim()){ toast('Please enter a diagnosis.','error'); return; }
  if(!e.exam) e.exam={};
  ['general','heent','chest','cardio','abdomen','extremities','neuro','diagnosis','icd'].forEach(f=>{ e.exam[f]=val('ex-'+f)||''; });
  saveData(); toast('Diagnosis and findings saved.'); examModalTab('prescriptions');
}

function savePrescriptions(){
  const e=queue.find(q=>q.queueNum==activeQ); if(!e) return;
  if(!e.exam) e.exam={};
  e.exam.labs=Array.from(document.querySelectorAll('.lab-chk:checked')).map(c=>c.value);
  const lo=val('ex-lab-other').trim(); if(lo) e.exam.labs.push(lo);
  e.exam.instructions=val('ex-instructions');
  e.exam.rx=Array.from(document.querySelectorAll('.rx-block')).map(b=>({
    drug:b.querySelector('.rx-drug')?.value||'', dose:b.querySelector('.rx-dose')?.value||'',
    freq:b.querySelector('.rx-freq')?.value||'', route:b.querySelector('.rx-route')?.value||''
  })).filter(r=>r.drug.trim());
  saveData(); toast('Prescriptions saved.'); examModalTab('finalize');
}

function addRx(rx){
  rxCount++;
  const id=rxCount;
  const div=document.createElement('div');
  div.className='rx-block'; div.id='rx-'+id;
  div.innerHTML=`
    <button class="rx-remove" onclick="document.getElementById('rx-${id}').remove()"><i class="bi bi-x"></i></button>
    <div class="field-row">
      <div class="field"><label>Drug Name</label><input class="rx-drug" placeholder="Generic name" value="${rx?.drug||''}"></div>
      <div class="field"><label>Dosage</label><input class="rx-dose" placeholder="e.g. 500mg" value="${rx?.dose||''}"></div>
    </div>
    <div class="field-row">
      <div class="field"><label>Frequency & Duration</label><input class="rx-freq" placeholder="e.g. TID x 7 days" value="${rx?.freq||''}"></div>
      <div class="field"><label>Route</label>
        <select class="rx-route">
          <option ${rx?.route==='Oral'?'selected':''}>Oral</option>
          <option ${rx?.route==='Topical'?'selected':''}>Topical</option>
          <option ${rx?.route==='IV'?'selected':''}>IV</option>
          <option ${rx?.route==='IM'?'selected':''}>IM</option>
          <option ${rx?.route==='Inhaled'?'selected':''}>Inhaled</option>
        </select>
      </div>
    </div>`;
  document.getElementById('rx-list')?.appendChild(div);
}

function finalizeConsult(){
  const e=queue.find(q=>q.queueNum==activeQ); if(!e) return;
  if(!e.exam?.diagnosis){ toast('Please enter a diagnosis before finalizing.','error'); return; }
  e.exam.finalNotes=val('ex-final-notes');
  e.finalized=true; e.status='done';
  dailyLog.push({
    queueNum:e.queueNum, patientId:e.patientId, name:e.name,
    purpose:e.purpose, purposeType:e.purposeType, visitLabel:e.visitLabel||e.purpose,
    time:e.time, date:todayStr(),
    diagnosis:e.exam.diagnosis||'—',
    doctor:currentUser?.name||'Doctor',
    labs:e.exam.labs||[], rx:e.exam.rx||[]
  });
  saveData(); closeModal('modal-exam');
  toast(`Consultation for ${e.name} finalized and added to the Daily Patient Log.`);
  docNav('consult');
}

function visitBadge(q){
  const map={checkup:'<span class="badge b-maroon"><i class="bi bi-clipboard2-pulse"></i> Check-up</span>',medicine:'<span class="badge b-gold"><i class="bi bi-capsule"></i> Medicine Req.</span>','follow-up':'<span class="badge b-blue"><i class="bi bi-arrow-repeat"></i> Follow-up</span>',medcert:'<span class="badge b-green"><i class="bi bi-file-earmark-medical"></i> Med Cert</span>'};
  return map[q.purposeType]||`<span class="badge b-gray">${q.purpose}</span>`;
}