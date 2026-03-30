/* admin.js — Admin interface */

function adminNav(sec) {
  ['accounts','auth','validation'].forEach(s=>{
    const el=document.getElementById('an-'+s); if(el) el.classList.toggle('active',s===sec);
  });
  const m=document.getElementById('admin-main');
  if(sec==='accounts')   renderAdminAccounts(m);
  if(sec==='auth')       renderAdminAuth(m);
  if(sec==='validation') renderAdminValidation(m);
}

function renderAdminAccounts(m) {
  const staff=users.filter(u=>u.role!=='patient');
  m.innerHTML=`
    <div class="page-header"><h1>Account Creation & Management</h1><p>Manage staff accounts — nurses, doctors, and administrators.</p></div>
    <div class="stats-row">
      <div class="stat-card"><div class="stat-num">${users.filter(u=>u.role==='nurse').length}</div><div class="stat-label">Nurses</div></div>
      <div class="stat-card stat-gold"><div class="stat-num">${users.filter(u=>u.role==='doctor').length}</div><div class="stat-label">Doctors</div></div>
      <div class="stat-card stat-blue"><div class="stat-num">${users.filter(u=>u.role==='admin').length}</div><div class="stat-label">Admins</div></div>
      <div class="stat-card stat-green"><div class="stat-num">${users.filter(u=>u.role==='patient').length}</div><div class="stat-label">Patients</div></div>
    </div>
    <div class="grid2">
      <div class="card card-accent">
        <div class="card-title">Create Staff Account</div>
        <div class="field"><label>Full Name</label><input id="ac-name" placeholder="Full name"></div>
        <div class="field"><label>Role</label>
          <select id="ac-role"><option value="nurse">Nurse</option><option value="doctor">Doctor</option><option value="admin">Admin</option></select>
        </div>
        <div class="field"><label>Department / Specialization</label><input id="ac-dept" placeholder="e.g. University Clinic / General Medicine"></div>
        <div class="field"><label>Login ID</label><input id="ac-id" placeholder="e.g. N-002"></div>
        <div class="field"><label>Password</label><input type="password" id="ac-pass" placeholder="Min. 6 characters"></div>
        <button class="btn btn-primary w100" onclick="createStaffAccount()"><i class="bi bi-person-plus"></i> Create Account</button>
      </div>
      <div class="card">
        <div class="card-title">Staff Accounts</div>
        <div class="table-wrap"><table>
          <thead><tr><th>ID</th><th>Name</th><th>Role</th><th>Actions</th></tr></thead>
          <tbody id="staff-table">
            ${renderStaffTable(staff)}
          </tbody>
        </table></div>
      </div>
    </div>`;
}

function renderStaffTable(staff) {
  return staff.map(u=>`
    <tr>
      <td class="text-xs">${u.id}</td>
      <td><div class="fw6">${u.name}</div><div class="text-xs text-muted">${u.dept||u.specialization||''}</div></td>
      <td><span class="badge ${u.role==='doctor'?'b-maroon':u.role==='admin'?'b-blue':'b-green'}">${u.role}</span></td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="resetPw('${u.id}')"><i class="bi bi-key"></i> Reset PW</button>
        ${u.role!=='admin'?`<button class="btn btn-danger btn-sm" onclick="deactivateAccount('${u.id}')"><i class="bi bi-person-x"></i> Deactivate</button>`:''}
      </td>
    </tr>`).join('');
}

function createStaffAccount() {
  const name=val('ac-name').trim(), role=val('ac-role'), dept=val('ac-dept').trim();
  const id=val('ac-id').trim(), pw=val('ac-pass').trim();
  const weak = ['password','123456','pass','abcdef','aeaeaea'];
  if(!name||!id||pw.length<6){toast('Please fill all fields. Password min 6 chars.','error');return;}
  if(weak.includes(pw.toLowerCase())){toast('Choose a stronger password (avoid weak suggestions like aeaeaea).','error');return;}
  if(users.find(u=>u.id===id)){toast('That Login ID already exists.','error');return;}
  users.push({id,pass:pw,role,name,dept,specialization:dept});
  saveData();
  toast(`Account for ${name} (${role}) created successfully.`);
  renderAdminAccounts(document.getElementById('admin-main'));
}

function resetPw(uid) {
  const u=users.find(x=>x.id===uid); if(!u) return;
  const np=prompt(`Enter new password for ${u.name}:`);
  const weak = ['password','123456','pass','abcdef','aeaeaea'];
  if(!np||np.length<6){toast('Password must be at least 6 characters.','error');return;}
  if(weak.includes(np.toLowerCase())){toast('Choose a stronger password (avoid weak suggestions like aeaeaea).','error');return;}
  u.pass=np; saveData();
  toast(`Password for ${u.name} has been reset.`);
}

function deactivateAccount(uid) {
  if(!confirm('Deactivate this account? The user will no longer be able to log in.')) return;
  users=users.filter(u=>u.id!==uid); saveData();
  toast('Account deactivated.');
  renderAdminAccounts(document.getElementById('admin-main'));
}

function renderAdminAuth(m) {
  m.innerHTML=`
    <div class="page-header"><h1>System Authorization Management</h1><p>Control user roles and access permissions.</p></div>
    <div class="card">
      <div class="card-title">Role Permissions Overview</div>
      <div class="table-wrap"><table>
        <thead><tr><th>Feature</th><th>Patient</th><th>Nurse</th><th>Doctor</th><th>Admin</th></tr></thead>
        <tbody>
          ${[
            ['Patient Registration','<i class="bi bi-check-lg" style="color:var(--green);font-size:1.2rem;"></i>','','','<i class="bi bi-check-lg" style="color:var(--green);font-size:1.2rem;"></i>'],
            ['Queue Entry','<i class="bi bi-check-lg" style="color:var(--green);font-size:1.2rem;"></i>','','',''],
            ['Queue Monitoring','','<i class="bi bi-check-lg" style="color:var(--green);font-size:1.2rem;"></i>','',''],
            ['Triage Assessment','','<i class="bi bi-check-lg" style="color:var(--green);font-size:1.2rem;"></i>','',''],
            ['Record Management','','<i class="bi bi-check-lg" style="color:var(--green);font-size:1.2rem;"></i>','',''],
            ['Certificate Processing','','<i class="bi bi-check-lg" style="color:var(--green);font-size:1.2rem;"></i>','',''],
            ['Daily Patient Log','','<i class="bi bi-check-lg" style="color:var(--green);font-size:1.2rem;"></i>','<i class="bi bi-check-lg" style="color:var(--green);font-size:1.2rem;"></i>','<i class="bi bi-check-lg" style="color:var(--green);font-size:1.2rem;"></i>'],
            ['Medical Examination','','','<i class="bi bi-check-lg" style="color:var(--green);font-size:1.2rem;"></i>',''],
            ['Prescriptions','','','<i class="bi bi-check-lg" style="color:var(--green);font-size:1.2rem;"></i>',''],
            ['Finalization','','','<i class="bi bi-check-lg" style="color:var(--green);font-size:1.2rem;"></i>',''],
            ['Account Creation','','','','<i class="bi bi-check-lg" style="color:var(--green);font-size:1.2rem;"></i>'],
            ['Authorization Control','','','','<i class="bi bi-check-lg" style="color:var(--green);font-size:1.2rem;"></i>'],
            ['Record Validation','','','','<i class="bi bi-check-lg" style="color:var(--green);font-size:1.2rem;"></i>'],
          ].map(r=>`<tr>${r.map((c,i)=>`<td ${i===0?'class="fw6"':'style="text-align:center;"'}>${c}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table></div>
    </div>
    <div class="card">
      <div class="card-title">Modify User Role</div>
      <div class="field-row">
        <div class="field"><label>Select User</label>
          <select id="auth-uid">
            <option value="">— Select —</option>
            ${users.filter(u=>u.role!=='admin').map(u=>`<option value="${u.id}">${u.name} (${u.role})</option>`).join('')}
          </select>
        </div>
        <div class="field"><label>New Role</label>
          <select id="auth-role"><option value="nurse">Nurse</option><option value="doctor">Doctor</option></select>
        </div>
      </div>
      <button class="btn btn-primary" onclick="changeRole()"><i class="bi bi-arrow-repeat"></i> Update Role</button>
    </div>`;
}

function changeRole() {
  const uid=val('auth-uid'), role=val('auth-role');
  if(!uid){toast('Please select a user.','error');return;}
  const u=users.find(x=>x.id===uid); if(!u) return;
  u.role=role; saveData();
  toast(`${u.name}'s role updated to ${role}.`);
}

function renderAdminValidation(m) {
  const total=users.filter(u=>u.role==='patient').length;
  const withDept=users.filter(u=>u.role==='patient'&&u.permanent?.dept).length;
  const withMed=users.filter(u=>u.role==='patient'&&u.medical?.allergies).length;
  m.innerHTML=`
    <div class="page-header"><h1>Record Validation</h1><p>Review and validate system data integrity.</p></div>
    <div class="stats-row">
      <div class="stat-card"><div class="stat-num">${total}</div><div class="stat-label">Total Patients</div></div>
      <div class="stat-card stat-green"><div class="stat-num">${withDept}</div><div class="stat-label">Complete Profiles</div></div>
      <div class="stat-card stat-gold"><div class="stat-num">${total-withDept}</div><div class="stat-label">Incomplete</div></div>
      <div class="stat-card stat-blue"><div class="stat-num">${dailyLog.length}</div><div class="stat-label">Total Log Entries</div></div>
    </div>
    <div class="card">
      <div class="card-title">Patient Record Completeness</div>
      <div class="table-wrap"><table>
        <thead><tr><th>Patient</th><th>Demographics</th><th>Medical History</th><th>Permanent Record</th><th>Overall</th></tr></thead>
        <tbody>
          ${users.filter(u=>u.role==='patient').map(u=>{
            const hasDem=!!(u.demographics?.dob&&u.demographics?.contact);
            const hasMed=!!(u.medical?.allergies);
            const hasPerm=!!(u.permanent?.studid&&u.permanent?.dept);
            const ok=hasDem&&hasMed&&hasPerm;
            const chk=v=>`<td style="text-align:center;">${v?'<span class="badge b-green"><i class="bi bi-check"></i></span>':'<span class="badge b-red"><i class="bi bi-x"></i></span>'}</td>`;
            return `<tr><td><div class="fw6">${u.name}</div><div class="text-xs text-muted">${u.id}</div></td>${chk(hasDem)}${chk(hasMed)}${chk(hasPerm)}<td style="text-align:center;">${ok?'<span class="badge b-green">Complete</span>':'<span class="badge b-yellow">Incomplete</span>'}</td></tr>`;
          }).join('')||'<tr><td colspan="5" class="center text-muted" style="padding:20px;">No patients registered.</td></tr>'}
        </tbody>
      </table></div>
    </div>
    <div class="card">
      <div class="card-title">System Log Summary</div>
      <div class="alert alert-success text-sm"><i class="bi bi-check-circle-fill"></i> All system data validated. ${dailyLog.length} daily log entries on record. ${users.length} total user accounts.</div>
      <button class="btn btn-outline btn-sm" onclick="toast('Validation report generated (demo).','info')"><i class="bi bi-file-earmark-arrow-down"></i> Generate Validation Report</button>
    </div>`;
}