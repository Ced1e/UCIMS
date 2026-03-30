/* auth.js — Login (2 tabs: Patient / Staff) & Patient Registration */

/* ── Render login fields based on role ── */
function setRole(r) {
  loginRole = r;
  document.querySelectorAll('.role-tab').forEach((t,i)=>
    t.classList.toggle('active', ['patient','staff'][i]===r));

  const patFields   = document.getElementById('login-pat-fields');
  const staffFields = document.getElementById('login-staff-fields');
  const regLink     = document.getElementById('login-register-link');
  if (r === 'patient') {
    patFields.style.display   = 'block';
    staffFields.style.display = 'none';
    regLink.style.display     = 'block';
  } else {
    patFields.style.display   = 'none';
    staffFields.style.display = 'block';
    regLink.style.display     = 'none';
  }
}

function doLogin() {
  const err = document.getElementById('login-error');
  err.style.display = 'none';

  if (loginRole === 'patient') {
    const email = val('login-email').trim().toLowerCase();
    const idNum  = val('login-idnum').trim();
    if (!email || !idNum) { showErr(err,'Please enter your email address and ID number.'); return; }
    // Match: email must match AND patientId/studid must match
    const u = users.find(u => u.role==='patient'
      && (u.email||u.demographics?.email||'').toLowerCase()===email
      && (u.patientId===idNum || u.permanent?.studid===idNum || u.id===idNum));
    if (!u) { showErr(err,'No account found with that email and ID number.'); return; }
    loginSuccess(u);

  } else {
    // Staff: clinicId + password
    const cid = val('login-clinicid').trim();
    const pw  = val('login-staffpw').trim();
    if (!cid || !pw) { showErr(err,'Please enter your Clinic ID and password.'); return; }
    const u = users.find(u => u.role!=='patient' && (u.clinicId===cid||u.id===cid) && u.pass===pw);
    if (!u) { showErr(err,'Invalid Clinic ID or password.'); return; }
    loginSuccess(u);
  }
}

function showErr(el, msg) { el.style.display='block'; el.textContent=msg; }

function loginSuccess(u) {
  currentUser = u;
  wireLogo();
  const roleLabels={patient:'Patient Portal',nurse:'Nurse Interface',doctor:'Doctor Interface',admin:'Admin Interface'};
  ['patient','nurse','doctor','admin'].forEach(r=>{
    const n=document.getElementById(`${r}-tb-name`);
    const rl=document.getElementById(`${r}-tb-role`);
    const av=document.getElementById(`${r}-tb-av`);
    if(n) n.textContent=u.name;
    if(rl) rl.textContent=roleLabels[r]||r;
    if(av) av.textContent=u.name[0].toUpperCase();
  });
  if(u.role==='patient') { showPage('page-patient'); patNav('visit'); }
  else if(u.role==='nurse')  { showPage('page-nurse');  nurseNav('queue'); }
  else if(u.role==='doctor') { showPage('page-doctor'); docNav('consult'); }
  else if(u.role==='admin')  { showPage('page-admin');  adminNav('accounts'); }
}

function logout() {
  currentUser=null;
  ['login-email','login-idnum','login-clinicid','login-staffpw'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.value='';
  });
  document.getElementById('login-error').style.display='none';
  showPage('page-home');
}

function goSignup() {
  signupStep=1; renderSU(); showPage('page-signup');
}

/* ── Sign-up wizard ── */
function renderSU() {
  for(let i=1;i<=SIGNUP_STEPS;i++){
    const el=document.getElementById('su-s'+i);
    if(el) el.style.display=i===signupStep?'block':'none';
  }
  const bar=document.getElementById('su-bar');
  if(bar){
    bar.innerHTML='';
    for(let i=1;i<=SIGNUP_STEPS;i++){
      const d=document.createElement('div');
      d.className='sp-dot '+(i<signupStep?'done':i===signupStep?'active':'');
      bar.appendChild(d);
    }
  }
  const labels=['Demographic Information','Medical History','Permanent Patient Record','Consent & Account Setup'];
  const lbl=document.getElementById('su-step-lbl');
  if(lbl) lbl.textContent=`Step ${signupStep} of ${SIGNUP_STEPS}: ${labels[signupStep-1]}`;
  const back=document.getElementById('su-back');
  const next=document.getElementById('su-next');
  if(back) back.style.display=signupStep>1?'inline-flex':'none';
  if(next) next.textContent=signupStep===SIGNUP_STEPS?'✓ Create Account':'Next →';
}

function suBack(){ if(signupStep>1){signupStep--;renderSU();} }

function suNext(){
  const e=document.getElementById('su-err');
  e.style.display='none';
  const show=msg=>{e.style.display='block';e.textContent=msg;};

  if(signupStep===1){
    if(!val('su-fname').trim()) return show('First name is required.');
    if(!val('su-lname').trim()) return show('Last name is required.');
    if(!val('su-dob'))          return show('Date of birth is required.');
    if(!val('su-sex'))          return show('Please select sex.');
    if(!val('su-email').trim()) return show('Email address is required.');
  }
  if(signupStep===3){
    if(!val('su-studid').trim()) return show('Student/Employee ID is required.');
    if(!val('su-dept'))          return show('Please select your college/department.');
  }
  if(signupStep===SIGNUP_STEPS){
    if(!document.getElementById('su-c1').checked) return show('Please accept the data privacy consent.');
    if(!document.getElementById('su-c2').checked) return show('Please confirm your information is accurate.');
    const newId=val('su-lid').trim();
    const newPw=val('su-lpw').trim();
    const email=val('su-email').trim().toLowerCase();
    if(!newId)        return show('Please set a Login ID.');
    if(newPw.length<6)return show('Password must be at least 6 characters.');
    if(users.find(u=>u.id===newId))    return show('That Login ID is already taken.');
    if(users.find(u=>u.role==='patient'&&(u.email||u.demographics?.email||'').toLowerCase()===email))
      return show('An account with that email already exists.');
    const u={
      id:newId, email:email, pass:newPw, role:'patient',
      name:`${val('su-fname').trim()} ${val('su-lname').trim()}`,
      patientId:newId,
      demographics:{fname:val('su-fname'),lname:val('su-lname'),dob:val('su-dob'),sex:val('su-sex'),civil:val('su-civil'),blood:val('su-blood'),address:val('su-address'),contact:val('su-contact'),email:email,emname:val('su-emname'),emcontact:val('su-emcontact'),emrel:val('su-emrel')},
      medical:{allergies:val('su-allergies'),meds:val('su-meds'),history:val('su-history'),family:val('su-family'),immuniz:val('su-immuniz'),lifestyle:val('su-lifestyle')},
      permanent:{studid:val('su-studid'),pattype:val('su-pattype'),dept:val('su-dept'),yearsec:val('su-yearsec'),philhealth:val('su-philhealth'),pcp:val('su-pcp')},
      visits:[]
    };
    users.push(u); saveData();
    currentUser=u; wireLogo();
    loginSuccess(u);
    toast(`Welcome, ${u.name}! Your account has been created.`);
    return;
  }
  signupStep++; renderSU();
}