const STORE = 'little-dose-v1';
const WEEK = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const DAY_FULL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
let state = loadState();
let filter = 'all';
let toastTimer;
const $ = id => document.getElementById(id);

function loadState(){try{return JSON.parse(localStorage.getItem(STORE))||{medicines:[],log:{},name:''}}catch{return {medicines:[],log:{},name:''}}}
function save(){localStorage.setItem(STORE,JSON.stringify(state))}
function dateKey(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`}
function mondayIndex(date=new Date()){return (date.getDay()+6)%7}
function isToday(m){return (m.days||[]).includes(mondayIndex())}
function isTaken(id){return Boolean(state.log[dateKey()]?.[id])}
function formatDate(){return new Intl.DateTimeFormat(undefined,{weekday:'short',month:'short',day:'numeric'}).format(new Date())}
function fmtTime(time){if(!time)return '';const [h,m]=time.split(':').map(Number);return new Intl.DateTimeFormat(undefined,{hour:'numeric',minute:'2-digit'}).format(new Date(2000,0,1,h,m))}
function render(){
  $('dateLabel').textContent=formatDate();
  const hour=new Date().getHours(); $('greetingSub').textContent=hour<12?'Let’s make today feel a little easier.':hour<17?'Take today one gentle step at a time.':'A little care for the rest of your day.';
  $('greetingName').textContent=state.name?`, ${state.name}`:'';
  const todays=state.medicines.filter(isToday);const completed=todays.filter(m=>isTaken(m.id)).length;
  $('doneCount').textContent=completed;$('totalCount').textContent=todays.length;$('allCount').textContent=todays.length;
  $('upcomingCount').textContent=todays.filter(m=>!isTaken(m.id)).length;
  $('progressBar').style.width=todays.length?`${Math.round(completed/todays.length*100)}%`:'0%';
  $('progressNote').textContent=todays.length===0?'Add your medicines to start a simple routine.':completed===todays.length?'You’ve taken everything planned for today. Lovely work.':completed?`${todays.length-completed} ${todays.length-completed===1?'medicine':'medicines'} left for today. Take it at your pace.`:'One step at a time. You’ve got this.';
  $('progressFlower').textContent=todays.length&&completed===todays.length?'✿':'✳';
  const list=todays.filter(m=>filter==='all'||(filter==='taken'?isTaken(m.id):!isTaken(m.id))).sort((a,b)=>a.time.localeCompare(b.time));
  $('medList').innerHTML=list.map(m=>`<article class="med-card ${isTaken(m.id)?'taken':''}"><div class="med-symbol" aria-hidden="true">✳</div><div class="med-copy"><div class="med-title">${esc(m.name)}</div><div class="med-details">${esc(m.dose||'Medicine')}${m.note?` · ${esc(m.note)}`:''}</div><div class="med-time"><i class="dot"></i>${fmtTime(m.time)} · ${isTaken(m.id)?'Taken':'Scheduled'}</div></div><div class="card-actions"><button class="check-button" data-take="${m.id}" aria-label="${isTaken(m.id)?'Mark not taken':'Mark taken'}: ${esc(m.name)}">${isTaken(m.id)?'✓':'○'}</button><button class="edit-button" data-edit="${m.id}" aria-label="Edit ${esc(m.name)}">···</button></div></article>`).join('');
  $('emptyState').classList.toggle('hidden',todays.length!==0);
}
function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function showToast(msg){const el=$('toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2400)}
function openForm(m){
  $('medicineForm').reset();$('medicineId').value=m?.id||'';$('formTitle').textContent=m?'Edit medicine':'Add a medicine';$('medName').value=m?.name||'';$('medDose').value=m?.dose||'';$('medNote').value=m?.note||'';$('medTime').value=m?.time||'09:00';
  $('deleteMedicine').classList.toggle('hidden',!m);document.querySelectorAll('.day-chip').forEach(b=>b.classList.toggle('selected',m?(m.days||[]).includes(+b.dataset.day):true));$('medicineDialog').showModal();
}
WEEK.forEach((d,i)=>{const b=document.createElement('button');b.type='button';b.className='day-chip selected';b.dataset.day=i;b.textContent=d;b.setAttribute('aria-pressed','true');b.onclick=()=>{b.classList.toggle('selected');b.setAttribute('aria-pressed',b.classList.contains('selected'))};$('dayPicker').appendChild(b)});
$('addButton').onclick=$('emptyAdd').onclick=()=>openForm();
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());
document.querySelectorAll('.filter').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;document.querySelectorAll('.filter').forEach(x=>x.classList.toggle('active',x===b));render()});
$('medList').addEventListener('click',e=>{
 const take=e.target.closest('[data-take]');if(take){const id=take.dataset.take;state.log[dateKey()]??={};if(state.log[dateKey()][id]){delete state.log[dateKey()][id];showToast('Marked as not taken.')}else{state.log[dateKey()][id]=Date.now();showToast('Marked taken. You did it ✿')}save();render();return}
 const edit=e.target.closest('[data-edit]');if(edit)openForm(state.medicines.find(m=>m.id===edit.dataset.edit));
});
$('medicineForm').addEventListener('submit',e=>{e.preventDefault();const days=[...document.querySelectorAll('.day-chip.selected')].map(b=>+b.dataset.day);if(!days.length){showToast('Choose at least one day.');return}const id=$('medicineId').value||crypto.randomUUID();const medicine={id,name:$('medName').value.trim(),dose:$('medDose').value.trim(),note:$('medNote').value.trim(),time:$('medTime').value,days};const index=state.medicines.findIndex(m=>m.id===id);if(index<0)state.medicines.push(medicine);else state.medicines[index]=medicine;save();$('medicineDialog').close();render();showToast(index<0?'Medicine added to your routine.':'Medicine updated.')});
$('deleteMedicine').onclick=()=>{const id=$('medicineId').value;state.medicines=state.medicines.filter(m=>m.id!==id);for(const key of Object.keys(state.log))delete state.log[key][id];save();$('medicineDialog').close();render();showToast('Medicine removed.')};
$('privacyButton').onclick=$('profileButton').onclick=()=>$('privacyDialog').showModal();
$('notifyButton').onclick=async()=>{if(!('Notification'in window)){showToast('Notifications are not available in this browser.');return}if(!window.isSecureContext){showToast('Open this page from a secure website to enable notifications.');return}try{const result=await Notification.requestPermission();showToast(result==='granted'?'Permission enabled. Scheduled alerts still need a push service.':result==='denied'?'Notifications are blocked in browser settings.':'No notification permission granted.')}catch{showToast('Could not request notification permission.')}};
$('installHelp').onclick=()=>showToast(/iPhone|iPad/.test(navigator.userAgent)?'In Safari: Share → Add to Home Screen.':'Use your browser menu to install or add this page to your Home Screen.');
$('clearData').onclick=()=>{if(confirm('Delete all medicines and taken history from this device?')){state={medicines:[],log:{},name:''};save();render();$('privacyDialog').close();showToast('Your local data was cleared.')}};
render();
if('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./sw.js').catch(()=>{});
