/* ════════════════════════════════════════════════════
   shared.js — Page Routing, Logo Wiring & Daily Log
   UCIMS · University of Southeastern Philippines Clinic
   ════════════════════════════════════════════════════
   Functions:
     showPage(id)
     setLoginRole(r)
     logout()
     wireLogo()
     getStatusBadge(status)
     renderDailyLog(role, main)
   ════════════════════════════════════════════════════ */

//  PAGE ROUTING
// ══════════════════════════════════════════════════════
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function setLoginRole(r) {
  loginRole = r;
  document.querySelectorAll('.auth-tab').forEach((t,i) => t.classList.toggle('active', ['patient','staff','doctor'][i] === r));
}

function logout() {
  currentUser = null;
  showPage('page-login');
}

function goToSignup() {
  signupStep = 1;
  renderSignupStep();
  showPage('page-signup');
}

// ══════════════════════════════════════════════════════
