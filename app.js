const STORE = 'little-dose-v1';
const WEEK = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const QUOTES = [
  'Small steps still move you forward.', 'You deserve the same care you give to others.',
  'A gentle day is still a good day.', 'Progress can be quiet and still be real.',
  'You are allowed to begin again, as often as you need.', 'One kind choice for yourself is enough for now.',
  'Rest is part of the journey, too.', 'You do not have to do everything at once.',
  'Your pace is a perfectly good pace.', 'There is strength in showing up for yourself.',
  'Little by little, a little becomes a lot.', 'You have made it through every hard day so far.',
  'You can be proud of the effort no one else sees.', 'Today is a fresh page, not a test.',
  'Taking care of yourself is a way forward.', 'Give yourself room to grow slowly.',
  'You are doing better than you think.', 'A pause can be part of progress.',
  'Let today be simple. That is enough.', 'You can take the next step when you are ready.',
  'Your worth is not measured by your productivity.', 'Tiny routines can hold a lot of care.',
  'You are allowed to make this easier for yourself.', 'There is no perfect way to have a day.',
  'Celebrate the ordinary things you did for yourself.', 'Be patient with the person you are becoming.',
  'A softer approach can still be a strong one.', 'You belong in your own list of priorities.',
  'Every small act of care counts.', 'You do not need to earn a moment of rest.',
  'Keep going gently; you are getting there.', 'Today, doing your best can look different.',
  'You can start from right where you are.', 'You have permission to take things one at a time.',
  'A little progress is still progress worth noticing.', 'You are more than what you finish today.',
  'Make space for a little kindness toward yourself.', 'Slow days can still take you somewhere.',
  'You are allowed to have both hard moments and hope.', 'The way you care for yourself matters.',
  'Small promises to yourself build trust.', 'You can meet this moment as it is.',
  'A good life is made of ordinary, cared-for days.', 'You are worthy of patience, especially from yourself.',
  'Keep the next step small enough to take.', 'Your effort matters, even when it feels invisible.',
  'There is room for joy in an imperfect day.', 'You can choose kindness over pressure today.'
];
let state = loadState();
let filter = 'all';
let view = 'today';
let toastTimer;
const $ = id => document.getElementById(id);

function loadState(){
  try {
    const old=JSON.parse(localStorage.getItem(STORE))||{};
    return {medicines:[],log:{},name:'',dailyPlans:{},quoteByDate:{},usedQuotes:[],remindersEnabled:false,remindersSent:{},theme:'dark',...old,
      medicines:Array.isArray(old.medicines)?old.medicines:[],log:old.log||{},dailyPlans:old.dailyPlans||{},quoteByDate:old.quoteByDate||{},usedQuotes:old.usedQuotes||[],remindersSent:old.remindersSent||{},theme:old.theme||'dark'};
  } catch { return {medicines:[],log:{},name:'',dailyPlans:{},quoteByDate:{},usedQuotes:[],remindersEnabled:false,remindersSent:{},theme:'dark'}; }
}
function save(){try{localStorage.setItem(STORE,JSON.stringify(state))}catch{showToast('Storage is full. Export a backup or remove old data.')}}
function dateKey(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`}
function dateFromKey(key){const [y,m,d]=key.split('-').map(Number);return new Date(y,m-1,d)}
function mondayIndex(date=new Date()){return (date.getDay()+6)%7}
function isToday(m){return (m.days||[]).includes(mondayIndex())}
function isTaken(id,key=dateKey()){return Boolean(state.log[key]?.[id])}
function formatDate(date=new Date(),opts={weekday:'long',month:'long',day:'numeric'}){return new Intl.DateTimeFormat(undefined,opts).format(date)}
function fmtTime(time){if(!time)return '';const [h,m]=time.split(':').map(Number);return new Intl.DateTimeFormat(undefined,{hour:'numeric',minute:'2-digit'}).format(new Date(2000,0,1,h,m))}
function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function snapshot(m){return {id:m.id,name:m.name,dose:m.dose||'',note:m.note||'',time:m.time||'09:00'}}
function ensureTodayPlan(){
  const key=dateKey();const todays=state.medicines.filter(isToday);let changed=false;
  if(!todays.length){if(state.dailyPlans[key]&&!Object.keys(state.dailyPlans[key]).length&&!Object.keys(state.log[key]||{}).length){delete state.dailyPlans[key];changed=true}if(changed)save();return}
  state.dailyPlans[key]??={};
  for(const med of todays) if(!state.dailyPlans[key][med.id]){state.dailyPlans[key][med.id]=snapshot(med);changed=true}
  if(changed)save();
}
function dailyQuote(){
  const key=dateKey();if(state.quoteByDate[key])return state.quoteByDate[key];
  let used=new Set(state.usedQuotes);let remaining=QUOTES.map((quote,id)=>({quote,id})).filter(x=>!used.has(x.id));
  if(!remaining.length){used=new Set();state.usedQuotes=[];remaining=QUOTES.map((quote,id)=>({quote,id}))}
  const pick=remaining[Math.floor(Math.random()*remaining.length)];state.quoteByDate[key]=pick.quote;state.usedQuotes.push(pick.id);save();return pick.quote;
}
function greeting(){
  const h=new Date().getHours();
  if(h>=5&&h<12)return ['Good morning','Let’s make today feel a little easier.'];
  if(h>=12&&h<17)return ['Good afternoon','Take today one gentle step at a time.'];
  if(h>=17&&h<21)return ['Good evening','You made it through another day. Take a breath.'];
  return ['Good night','Rest when you can. Tomorrow can wait.'];
}
function setTheme(){
  const dark=state.theme==='dark';document.body.classList.toggle('dark',dark);
  $('themeButton').textContent=dark?'☼':'☾';$('themeButton').setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode');
  $('themeColor').content=dark?'#111715':'#f7f7f2';
}
function setView(next){view=next;$('todayView').classList.toggle('hidden',view!=='today');$('historyView').classList.toggle('hidden',view!=='history');$('todayTab').classList.toggle('active',view==='today');$('historyTab').classList.toggle('active',view==='history');$('todayTab').setAttribute('aria-current',view==='today'?'page':'false');$('historyTab').setAttribute('aria-current',view==='history'?'page':'false');if(view==='history')renderHistory()}
function render(){
  setTheme();ensureTodayPlan();
  $('dateLabel').textContent=new Intl.DateTimeFormat(undefined,{weekday:'short',month:'short',day:'numeric'}).format(new Date());
  const [title,subtitle]=greeting();$('greetingTitle').textContent=title;$('greetingSub').textContent=subtitle;
  $('greetingName').textContent=state.name?`, ${state.name}`:'';$('dailyQuote').textContent=dailyQuote();
  const todays=state.medicines.filter(isToday);const completed=todays.filter(m=>isTaken(m.id)).length;
  $('doneCount').textContent=completed;$('totalCount').textContent=todays.length;$('allCount').textContent=todays.length;
  $('upcomingCount').textContent=todays.filter(m=>!isTaken(m.id)).length;
  $('progressBar').style.width=todays.length?`${Math.round(completed/todays.length*100)}%`:'0%';
  $('progressNote').textContent=todays.length===0?'Add your medicines to start a simple routine.':completed===todays.length?'You’ve taken everything planned for today. Lovely work.':completed?`${todays.length-completed} ${todays.length-completed===1?'medicine':'medicines'} left for today. Take it at your pace.`:'One step at a time. You’ve got this.';
  $('progressFlower').textContent=todays.length&&completed===todays.length?'✿':'✳';
  const list=todays.filter(m=>filter==='all'||(filter==='taken'?isTaken(m.id):!isTaken(m.id))).sort((a,b)=>a.time.localeCompare(b.time));
  $('medList').innerHTML=list.map(m=>`<article class="med-card ${isTaken(m.id)?'taken':''}"><div class="med-symbol" aria-hidden="true">✳</div><div class="med-copy"><div class="med-title">${esc(m.name)}</div><div class="med-details">${esc(m.dose||'Medicine')}${m.note?` · ${esc(m.note)}`:''}</div><div class="med-time"><i class="dot"></i>${fmtTime(m.time)} · ${isTaken(m.id)?'Taken':'Scheduled'}</div></div><div class="card-actions"><button class="check-button" data-take="${esc(m.id)}" aria-label="${isTaken(m.id)?'Mark not taken':'Mark taken'}: ${esc(m.name)}">${isTaken(m.id)?'✓':'○'}</button><button class="edit-button" data-edit="${esc(m.id)}" aria-label="Edit ${esc(m.name)}">···</button></div></article>`).join('');
  $('emptyState').classList.toggle('hidden',todays.length!==0);
  $('historyCount').textContent=Object.keys(state.dailyPlans).filter(k=>k<=dateKey()&&(Object.keys(state.dailyPlans[k]||{}).length||Object.keys(state.log[k]||{}).length)).length;
  if(view==='history')renderHistory();
  checkReminders();
}
function renderHistory(){
  const dates=new Set([...Object.keys(state.dailyPlans),...Object.keys(state.log)]);const ordered=[...dates].filter(k=>k<=dateKey()&&(Object.keys(state.dailyPlans[k]||{}).length||Object.keys(state.log[k]||{}).length)).sort((a,b)=>b.localeCompare(a));
  $('historyList').innerHTML=ordered.map(key=>{
    const plan=state.dailyPlans[key]||{};const log=state.log[key]||{};const items={...plan};
    for(const id of Object.keys(log))if(!items[id]){const med=state.medicines.find(x=>x.id===id);items[id]=med?snapshot(med):{id,name:'Medicine',time:''}}
    const entries=Object.values(items).sort((a,b)=>(a.time||'').localeCompare(b.time||''));const done=entries.filter(m=>Boolean(log[m.id])).length;
    const date=formatDate(dateFromKey(key),{weekday:'long',month:'short',day:'numeric',year:'numeric'});
    const details=entries.length?entries.map(m=>`<div class="history-item"><span class="history-status ${log[m.id]?'':'missed'}">${log[m.id]?'✓':'·'}</span><span class="history-med"><strong>${esc(m.name)}</strong><small>${fmtTime(m.time)}${m.dose?` · ${esc(m.dose)}`:''}</small></span><span>${log[m.id]?'Taken':'Not marked'}</span></div>`).join(''):'<div class="history-empty-day">No medicines were scheduled in this checklist.</div>';
    return `<article class="history-day"><div class="history-day-head"><strong>${esc(date)}</strong><span>${done} of ${entries.length} taken</span></div>${details}</article>`;
  }).join('');
  $('historyEmpty').classList.toggle('hidden',ordered.length>0);
}
function showToast(msg){const el=$('toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2800)}
function openForm(m){
  $('medicineForm').reset();$('medicineId').value=m?.id||'';$('formTitle').textContent=m?'Edit medicine':'Add a medicine';$('medName').value=m?.name||'';$('medDose').value=m?.dose||'';$('medNote').value=m?.note||'';$('medTime').value=m?.time||'09:00';
  $('deleteMedicine').classList.toggle('hidden',!m);document.querySelectorAll('.day-chip').forEach(b=>b.classList.toggle('selected',m?(m.days||[]).includes(+b.dataset.day):true));$('medicineDialog').showModal();
}
WEEK.forEach((d,i)=>{const b=document.createElement('button');b.type='button';b.className='day-chip selected';b.dataset.day=i;b.textContent=d;b.setAttribute('aria-pressed','true');b.onclick=()=>{b.classList.toggle('selected');b.setAttribute('aria-pressed',b.classList.contains('selected'))};$('dayPicker').appendChild(b)});
$('addButton').onclick=$('emptyAdd').onclick=()=>openForm();
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());
document.querySelectorAll('.filter').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;document.querySelectorAll('.filter').forEach(x=>x.classList.toggle('active',x===b));render()});
$('todayTab').onclick=()=>setView('today');$('historyTab').onclick=()=>setView('history');
$('themeButton').onclick=()=>{state.theme=state.theme==='dark'?'light':'dark';save();setTheme()};
$('medList').addEventListener('click',e=>{
  const take=e.target.closest('[data-take]');if(take){const id=take.dataset.take;state.log[dateKey()]??={};if(state.log[dateKey()][id]){delete state.log[dateKey()][id];showToast('Marked as not taken.')}else{state.log[dateKey()][id]=Date.now();showToast('Marked taken. You did it ✿')}save();render();return}
  const edit=e.target.closest('[data-edit]');if(edit)openForm(state.medicines.find(m=>m.id===edit.dataset.edit));
});
$('medicineForm').addEventListener('submit',e=>{e.preventDefault();const days=[...document.querySelectorAll('.day-chip.selected')].map(b=>+b.dataset.day);if(!days.length){showToast('Choose at least one day.');return}const id=$('medicineId').value||crypto.randomUUID();const medicine={id,name:$('medName').value.trim(),dose:$('medDose').value.trim(),note:$('medNote').value.trim(),time:$('medTime').value,days};const index=state.medicines.findIndex(m=>m.id===id);if(index<0)state.medicines.push(medicine);else state.medicines[index]=medicine;save();$('medicineDialog').close();render();showToast(index<0?'Medicine added to your routine.':'Medicine updated.')});
$('deleteMedicine').onclick=()=>{const id=$('medicineId').value;state.medicines=state.medicines.filter(m=>m.id!==id);save();$('medicineDialog').close();render();showToast('Medicine removed. Past checklists are kept.')};
$('privacyButton').onclick=$('profileButton').onclick=()=>$('privacyDialog').showModal();
function downloadBackup(){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`little-dose-backup-${dateKey()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);showToast('Backup downloaded to this device.')}
$('exportButton').onclick=$('exportSettings').onclick=downloadBackup;
$('notifyButton').onclick=async()=>{
  state.remindersEnabled=true;save();
  if('Notification'in window&&window.isSecureContext){try{const permission=await Notification.requestPermission();showToast(permission==='granted'?'Reminders enabled while Little Dose is open.': 'In-app reminders are enabled. Browser notifications are blocked.')}catch{showToast('In-app reminders are enabled while the page stays open.')}}
  else showToast('In-app reminders are enabled while the page stays open.');
  render();
};
function sendDueReminder(m){
  state.remindersSent[dateKey()]??={};if(state.remindersSent[dateKey()][m.id])return;
  state.remindersSent[dateKey()][m.id]=true;save();showToast('It’s time for a planned medicine. Check your list.');
  if('Notification'in window&&Notification.permission==='granted'){
    const options={body:'It’s time for a planned medicine. Check your Little Dose list.',tag:`little-dose-${dateKey()}-${m.id}`,silent:false};
    if('serviceWorker'in navigator)navigator.serviceWorker.ready.then(reg=>reg.showNotification('Little Dose',options)).catch(()=>{});
    else try{new Notification('Little Dose',options)}catch{}
  }
}
function checkReminders(){
  if(!state.remindersEnabled||document.visibilityState!=='visible')return;
  const now=new Date();const current=now.getHours()*60+now.getMinutes();
  for(const med of state.medicines.filter(isToday)){
    const [h,m]=med.time.split(':').map(Number);const due=h*60+m;const late=current-due;
    if(late>=0&&late<=1&&!isTaken(med.id)&&!state.remindersSent[dateKey()]?.[med.id])sendDueReminder(med);
  }
}
$('installHelp').onclick=()=>showToast(/iPhone|iPad/.test(navigator.userAgent)?'In Safari: Share → Add to Home Screen.':'Use your browser menu to install or add this page to your Home Screen.');
$('clearData').onclick=()=>{if(confirm('Delete all medicines and taken history from this device?')){const theme=state.theme;state={medicines:[],log:{},name:'',dailyPlans:{},quoteByDate:{},usedQuotes:[],remindersEnabled:false,remindersSent:{},theme};save();render();$('privacyDialog').close();showToast('Your local data was cleared.')}};
render();
setInterval(()=>{render();checkReminders()},30_000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){render();checkReminders()}});
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
