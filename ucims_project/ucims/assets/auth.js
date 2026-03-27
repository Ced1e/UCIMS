/* ════════════════════════════════════════════════════
   auth.js — Login & Sign-up Wizard
   UCIMS · University of Southeastern Philippines Clinic
   ════════════════════════════════════════════════════
   Functions:
     doLogin()
     goToSignup()
     renderSignupStep()
     suBack()
     suNext()
   ════════════════════════════════════════════════════ */

//  LOGIN
// ══════════════════════════════════════════════════════
function doLogin() {
  const id = document.getElementById('login-id').value.trim();
  const pass = document.getElementById('login-pass').value.trim();
  const err = document.getElementById('login-error');
  const u = users.find(u => u.id === id && u.pass === pass);
  if (!u) { err.style.display='block'; err.textContent='Invalid ID or password.'; return; }
  err.style.display='none';
  currentUser = u;
  if (u.role === 'patient') {
    document.getElementById('patient-topbar-name').textContent = u.name;
    showPage('page-patient-visit');
    patNav('visit');
  } else if (u.role === 'staff') {
    document.getElementById('staff-topbar-name').textContent = u.name;
    showPage('page-staff');
    staffNav('queue');
  } else if (u.role === 'doctor') {
    document.getElementById('doctor-topbar-name').textContent = u.name;
    showPage('page-doctor');
    docNav('consult');
  }
}

// ══════════════════════════════════════════════════════
//  SIGN UP
// ══════════════════════════════════════════════════════
function renderSignupStep() {
  for (let i = 1; i <= TOTAL_SIGNUP_STEPS; i++) {
    const el = document.getElementById('su-step-'+i);
    if (el) el.style.display = (i === signupStep) ? 'block' : 'none';
  }
  // dots
  const dots = document.getElementById('signup-dots');
  dots.innerHTML = '';
  for (let i = 1; i <= TOTAL_SIGNUP_STEPS; i++) {
    const d = document.createElement('div');
    d.className = 'signup-step-dot' + (i <= signupStep ? ' done' : '');
    dots.appendChild(d);
  }
  const labels = ['Demographic Information','Medical History','Permanent Patient Record','Consent & Account Setup'];
  document.getElementById('signup-step-label').textContent = `Step ${signupStep} of ${TOTAL_SIGNUP_STEPS}: ${labels[signupStep-1]}`;
  document.getElementById('su-back-btn').style.display = signupStep > 1 ? 'inline-flex' : 'none';
  document.getElementById('su-next-btn').textContent = signupStep === TOTAL_SIGNUP_STEPS ? '✓ Create Account' : 'Next →';
}

function suBack() { if (signupStep > 1) { signupStep--; renderSignupStep(); } }

function suNext() {
  const err = document.getElementById('signup-error');
  err.style.display = 'none';

  if (signupStep === 1) {
    if (!document.getElementById('su-fname').value || !document.getElementById('su-lname').value) {
      err.style.display='block'; err.textContent='Please enter your first and last name.'; return;
    }
  }
  if (signupStep === TOTAL_SIGNUP_STEPS) {
    if (!document.getElementById('su-consent1').checked || !document.getElementById('su-consent2').checked) {
      err.style.display='block'; err.textContent='Please accept all required consent items.'; return;
    }
    const newId = document.getElementById('su-newid').value.trim();
    const newPass = document.getElementById('su-newpass').value.trim();
    if (!newId || !newPass) { err.style.display='block'; err.textContent='Please set a Login ID and Password.'; return; }
    if (users.find(u => u.id === newId)) { err.style.display='block'; err.textContent='That Login ID is already taken. Choose another.'; return; }

    const newUser = {
      id: newId, pass: newPass, role: 'patient', name: `${document.getElementById('su-fname').value} ${document.getElementById('su-lname').value}`,
      patientId: newId,
      demographics: {
        fname: document.getElementById('su-fname').value, lname: document.getElementById('su-lname').value,
        dob: document.getElementById('su-dob').value, sex: document.getElementById('su-sex').value,
        civil: document.getElementById('su-civil').value, blood: document.getElementById('su-blood').value,
        address: document.getElementById('su-address').value, contact: document.getElementById('su-contact').value,
        email: document.getElementById('su-email').value, emname: document.getElementById('su-emname').value,
        emcontact: document.getElementById('su-emcontact').value, emrel: document.getElementById('su-emrel').value
      },
      medical: {
        allergies: document.getElementById('su-allergies').value, meds: document.getElementById('su-meds').value,
        history: document.getElementById('su-history').value, family: document.getElementById('su-family').value,
        immuniz: document.getElementById('su-immuniz').value, lifestyle: document.getElementById('su-lifestyle').value
      },
      permanent: {
        studid: document.getElementById('su-studid').value, pattype: document.getElementById('su-pattype').value,
        dept: document.getElementById('su-dept').value, yearsec: document.getElementById('su-yearsec').value,
        philhealth: document.getElementById('su-philhealth').value, pcp: document.getElementById('su-pcp').value
      },
      visits: []
    };
    users.push(newUser);
    saveData();
    currentUser = newUser;
    document.getElementById('patient-topbar-name').textContent = newUser.name;
    showPage('page-patient-visit');
    patNav('visit');
    return;
  }
  signupStep++;
  renderSignupStep();
}

// ══════════════════════════════════════════════════════
