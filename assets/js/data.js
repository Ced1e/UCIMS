/* data.js */
const DATA_VERSION = 'v8'; 
if (localStorage.getItem('ucims-ver') !== DATA_VERSION) {
  ['ucims-users','ucims-queue','ucims-log','ucims-qc'].forEach(k=>localStorage.removeItem(k));
  localStorage.setItem('ucims-ver', DATA_VERSION);
}

// Points to your uploaded logo file inside an img folder
const LOGO = "assets/img/logo.png"; 

let currentUser=null, loginRole='patient', signupStep=1;
const SIGNUP_STEPS=4;
let activeQ=null, rxCount=0;

/* users — patients log in with email+ID, staff with clinicId+password */
let users = JSON.parse(localStorage.getItem('ucims-users')||'null') || [
  { id:'P-001', email:'maria@usep.edu.ph', pass:'pass', role:'patient', name:'Maria Santos', patientId:'P-001',
    demographics:{fname:'Maria',lname:'Santos',dob:'1999-03-15',sex:'Female',civil:'Single',blood:'O+',address:'123 Rizal St, Davao City',contact:'09171234567',email:'maria@usep.edu.ph',emname:'Pedro Santos',emcontact:'09181234567',emrel:'Father'},
    medical:{allergies:'Aspirin',meds:'None',history:'None',family:'Hypertension (father)',immuniz:'COVID-19, Flu',lifestyle:'Non-smoker'},
    permanent:{studid:'P-001',pattype:'Student',dept:'College of Engineering',yearsec:'3rd Year',philhealth:'N/A',pcp:'N/A'},visits:[]
  },
  { id:'N-001', clinicId:'N-001', pass:'Nurs3!23', role:'nurse',  name:'Nurse Rosalyn Reyes', dept:'University Clinic' },
  { id:'D-001', clinicId:'D-001', pass:'DocT0r!23', role:'doctor', name:'Dr. Jose Cruz', dept:'University Clinic', specialization:'General Medicine' },
  { id:'A-001', clinicId:'A-001', pass:'Adm1n!23', role:'admin',  name:'Admin Maria Lim',  dept:'University Clinic Administration' }
];

let queue        = JSON.parse(localStorage.getItem('ucims-queue')||'[]');
let dailyLog     = JSON.parse(localStorage.getItem('ucims-log')||'[]');
let queueCounter = JSON.parse(localStorage.getItem('ucims-qc')||'0');

if (queue.length === 0) {
  queue = [
    {queueNum:1,patientId:'WALK-001',name:'Jose Reyes',purpose:'Consultation',purposeType:'checkup',visitLabel:'Check-up',time:'08:15',status:'waiting',triaged:false,endorsed:false,finalized:false,triage:{},exam:{},services:[],medcertData:null},
    {queueNum:2,patientId:'WALK-002',name:'Ana Garcia',purpose:'Medical Certificate Request',purposeType:'medcert',visitLabel:'Med Cert',time:'08:42',status:'triaged',triaged:true,endorsed:false,finalized:false,
      triage:{bp:'110/70',hr:'78',temp:'36.5',rr:'18',o2:'98',weight:'55',height:'162',complaint:'Requesting med cert for sick leave',notes:'Alert, afebrile',priority:'green'},
      exam:{},services:[],medcertData:{certType:'Sick Leave Certificate',reason:'Fever and colds for 3 days',dateFrom:'2025-01-15',dateTo:'2025-01-17',notes:''}},
    {queueNum:3,patientId:'WALK-003',name:'Carlos Lim',purpose:'Consultation',purposeType:'follow-up',visitLabel:'Follow-up',time:'09:00',status:'with-doctor',triaged:true,endorsed:true,finalized:false,
      triage:{bp:'130/85',hr:'88',temp:'37.2',rr:'18',o2:'97',weight:'70',height:'172',complaint:'Follow-up for hypertension',notes:'BP slightly elevated',priority:'yellow'},
      exam:{},services:[],medcertData:null}
  ];
  queueCounter=3; saveData();
}

function saveData() {
  localStorage.setItem('ucims-users',JSON.stringify(users));
  localStorage.setItem('ucims-queue',JSON.stringify(queue));
  localStorage.setItem('ucims-log',  JSON.stringify(dailyLog));
  localStorage.setItem('ucims-qc',   JSON.stringify(queueCounter));
}