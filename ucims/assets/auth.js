/* Authentication Functions */
function setLoginRole(role) {
    loginRole = role;
    document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
}

function doLogin() {
    const id = document.getElementById('login-id').value.trim();
    const pass = document.getElementById('login-pass').value;
    const user = users.find(u => u.id === id && u.pass === pass && u.role === loginRole);
    if (!user) {
        document.getElementById('login-error').textContent = 'Invalid credentials or role mismatch.';
        document.getElementById('login-error').style.display = 'block';
        return;
    }
    currentUser = user;
    document.getElementById('login-error').style.display = 'none';
    if (loginRole === 'patient') showPage('page-patient-visit');
    else if (loginRole === 'staff') showPage('page-staff');
    else if (loginRole === 'doctor') showPage('page-doctor');
    else if (loginRole === 'admin') showPage('page-admin');
    updatePageNames();
}

function goToSignup() {
    signupStep = 1;
    showPage('page-signup');
    renderSignupStep();
}

function renderSignupStep() {
    const steps = document.getElementById('signup-dots');
    steps.innerHTML = '';
    for (let i = 1; i <= TOTAL_SIGNUP_STEPS; i++) {
        const dot = document.createElement('div');
        dot.className = 'signup-step-dot' + (i < signupStep ? ' done' : i === signupStep ? '' : '');
        steps.appendChild(dot);
    }
    document.getElementById('signup-step-label').textContent = `Step ${signupStep} of ${TOTAL_SIGNUP_STEPS}`;
    for (let i = 1; i <= TOTAL_SIGNUP_STEPS; i++)
        document.getElementById(`su-step-${i}`).style.display = i === signupStep ? 'block' : 'none';
}

function suNext() {
    if (signupStep === TOTAL_SIGNUP_STEPS) doSignup();
    else {
        signupStep++;
        renderSignupStep();
    }
}

function suBack() {
    if (signupStep > 1) {
        signupStep--;
        renderSignupStep();
    }
}

function doSignup() {
    const newUser = {
        id: document.getElementById('su-newid').value,
        pass: document.getElementById('su-newpass').value,
        role: 'patient',
        name: document.getElementById('su-fname').value + ' ' + document.getElementById('su-lname').value,
        patientId: document.getElementById('su-newid').value,
        demographics: {
            fname: document.getElementById('su-fname').value,
            lname: document.getElementById('su-lname').value,
            dob: document.getElementById('su-dob').value,
            sex: document.getElementById('su-sex').value,
            civil: document.getElementById('su-civil').value,
            blood: document.getElementById('su-blood').value,
            address: document.getElementById('su-address').value,
            contact: document.getElementById('su-contact').value,
            email: document.getElementById('su-email').value
        },
        medical: {
            allergies: document.getElementById('su-allergies').value,
            meds: document.getElementById('su-meds').value,
            history: document.getElementById('su-history').value
        },
        permanent: {
            studid: document.getElementById('su-studid').value,
            pattype: document.getElementById('su-pattype').value
        },
        visits: []
    };
    users.push(newUser);
    saveData();
    alert('Registration successful! You can now login.');
    showPage('page-login');
    signupStep = 1;
}

function logout() {
    currentUser = null;
    showPage('page-login');
    document.getElementById('login-id').value = '';
    document.getElementById('login-pass').value = '';
}