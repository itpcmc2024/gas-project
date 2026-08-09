(() => {
  const STORAGE_KEY = 'gas-project-by-kimhan.projects.v2.1';
  const LEGACY_STORAGE_KEY = 'gas-project-by-kimhan.projects.v2';
  const DEFAULTS = Array.isArray(window.DEFAULT_PROJECTS) ? window.DEFAULT_PROJECTS : [];
  const ALLOWED_COLORS = ['yellow','blue','green','pink','purple','peach'];
  let projects = loadProjects();

  const $ = (id) => document.getElementById(id);
  const grid = $('projectGrid'), pinnedGrid = $('pinnedGrid'), pinnedSection = $('pinnedSection'), count = $('projectCount'), modal = $('managerModal'), form = $('projectForm');
  const editIndex = $('editIndex'), nameInput = $('projectName'), urlInput = $('projectUrl'), descInput = $('projectDesc');
  const iconInput = $('projectIcon'), imageInput = $('projectImage'), colorInput = $('projectColor');
  const emojiFields = $('emojiFields'), imageFields = $('imageFields'), iconPreview = $('iconPreview');
  const managerList = $('managerList'), cancelEditBtn = $('cancelEditBtn'), saveProjectBtn = $('saveProjectBtn'), pinnedInput = $('projectPinned');

  function clone(v){ return JSON.parse(JSON.stringify(v)); }
  function normalizeProject(p={}){
    const iconType = p.iconType === 'image' ? 'image' : 'emoji';
    return {
      name:String(p.name || ''), url:String(p.url || ''), description:String(p.description || 'เปิดใช้งานโปรเจกต์'),
      color:ALLOWED_COLORS.includes(p.color) ? p.color : 'yellow', iconType,
      icon:String(p.icon || '✨'), image:String(p.image || ''), pinned:Boolean(p.pinned)
    };
  }
  function loadProjects(){
    try{
      const saved=localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if(saved){ const parsed=JSON.parse(saved); if(Array.isArray(parsed)) return parsed.map(normalizeProject); }
    }catch(e){ console.warn('Cannot load saved projects',e); }
    return clone(DEFAULTS).map(normalizeProject);
  }
  function persist(){ localStorage.setItem(STORAGE_KEY,JSON.stringify(projects)); }
  function esc(v=''){ return String(v).replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch])); }
  function safeUrl(v){ try{ const u=new URL(v,window.location.href); return ['http:','https:'].includes(u.protocol) ? u.href : '#'; }catch{return '#';} }
  function safeImageSrc(v){
    const raw=String(v||'').trim(); if(!raw) return '';
    if(/^https?:\/\//i.test(raw)) return safeUrl(raw);
    if(/^data:/i.test(raw) || /^javascript:/i.test(raw)) return '';
    return raw.replace(/^\/+/, '');
  }
  function iconMarkup(p, cls='card-icon'){
    if(p.iconType==='image' && safeImageSrc(p.image)) return `<div class="${cls}"><img src="${esc(safeImageSrc(p.image))}" alt="" onerror="this.parentElement.textContent='✨'"></div>`;
    return `<div class="${cls}" aria-hidden="true">${esc(p.icon || '✨')}</div>`;
  }

  function cardMarkup(p, showPin=true){
    return `<article class="project-card" data-color="${esc(p.color)}">${p.pinned && showPin ? '<span class="pin-badge" title="ปักหมุดแล้ว">📌</span>' : ''}${iconMarkup(p)}<h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><a class="open-link" href="${esc(safeUrl(p.url))}" target="_blank" rel="noopener noreferrer">เปิดระบบ <span aria-hidden="true">↗</span></a></article>`;
  }
  function render(){
    count.textContent=`${projects.length} Project${projects.length===1?'':'s'}`;
    if(!projects.length){ pinnedSection.hidden=true; grid.innerHTML='<div class="empty-state">ยังไม่มีโปรเจกต์ กด “จัดการโปรเจกต์” เพื่อเพิ่มการ์ดใหม่</div>'; return; }
    const pinned=projects.filter(p=>p.pinned);
    pinnedSection.hidden=!pinned.length;
    pinnedGrid.innerHTML=pinned.map(p=>cardMarkup(p,false)).join('');
    grid.innerHTML=projects.map(p=>cardMarkup(p,true)).join('');
  }
  function renderManager(){
    managerList.innerHTML=projects.map((p,i)=>`<div class="manager-row">${iconMarkup(p,'manager-row-icon')}<div><strong>${esc(p.name)}</strong><small>${esc(p.url)}</small></div><div class="row-actions"><button type="button" data-edit="${i}">✏️ แก้ไข</button><button type="button" class="delete" data-delete="${i}">🗑️ ลบ</button></div></div>`).join('') || '<div class="empty-state">ยังไม่มีโปรเจกต์</div>';
  }
  function selectedIconMode(){ return document.querySelector('input[name="iconMode"]:checked')?.value || 'emoji'; }
  function setIconMode(mode){
    const actual=mode==='image'?'image':'emoji';
    document.querySelector(`input[name="iconMode"][value="${actual}"]`).checked=true;
    emojiFields.hidden=actual!=='emoji'; imageFields.hidden=actual!=='image'; updateIconPreview();
  }
  function updateIconPreview(){
    if(selectedIconMode()==='image'){
      const src=safeImageSrc(imageInput.value);
      iconPreview.innerHTML=src ? `<img src="${esc(src)}" alt="" onerror="this.parentElement.textContent='✨'">` : '✨';
    }else iconPreview.textContent=iconInput.value.trim() || '✨';
  }
  function openManager(){ renderManager(); modal.hidden=false; document.body.style.overflow='hidden'; }
  function closeManager(){ modal.hidden=true; document.body.style.overflow=''; resetForm(); }
  function resetForm(){ form.reset(); editIndex.value=''; colorInput.value='yellow'; setIconMode('emoji'); saveProjectBtn.textContent='＋ เพิ่มการ์ด'; cancelEditBtn.hidden=true; }
  function showToast(msg){ const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>t.classList.remove('show'),2300); }

  form.addEventListener('submit',e=>{
    e.preventDefault(); const mode=selectedIconMode();
    const item=normalizeProject({name:nameInput.value.trim(),url:urlInput.value.trim(),description:descInput.value.trim()||'เปิดใช้งานโปรเจกต์',color:colorInput.value,iconType:mode,icon:iconInput.value.trim()||'✨',image:imageInput.value.trim(),pinned:pinnedInput.checked});
    if(safeUrl(item.url)==='#'){showToast('ลิงก์โปรเจกต์ไม่ถูกต้อง');return;}
    if(mode==='image' && !safeImageSrc(item.image)){showToast('กรุณาใส่ที่อยู่รูปภาพ');return;}
    const idx=editIndex.value===''?-1:Number(editIndex.value);
    if(idx>=0){projects[idx]=item;showToast('แก้ไขการ์ดแล้ว');}else{projects.push(item);showToast('เพิ่มการ์ดแล้ว');}
    persist();render();renderManager();resetForm();
  });

  managerList.addEventListener('click',e=>{
    const edit=e.target.closest('[data-edit]'),del=e.target.closest('[data-delete]');
    if(edit){const i=Number(edit.dataset.edit),p=projects[i];editIndex.value=i;nameInput.value=p.name;urlInput.value=p.url;descInput.value=p.description||'';colorInput.value=p.color||'yellow';iconInput.value=p.icon||'';imageInput.value=p.image||'';pinnedInput.checked=Boolean(p.pinned);setIconMode(p.iconType);saveProjectBtn.textContent='💾 บันทึกการแก้ไข';cancelEditBtn.hidden=false;nameInput.focus();}
    if(del){const i=Number(del.dataset.delete);if(confirm(`ลบการ์ด “${projects[i]?.name||''}” ใช่หรือไม่?`)){projects.splice(i,1);persist();render();renderManager();resetForm();showToast('ลบการ์ดแล้ว');}}
  });

  document.querySelectorAll('input[name="iconMode"]').forEach(r=>r.addEventListener('change',()=>setIconMode(r.value)));
  iconInput.addEventListener('input',updateIconPreview); imageInput.addEventListener('input',updateIconPreview);
  $('openManagerBtn').addEventListener('click',openManager); $('closeManagerBtn').addEventListener('click',closeManager); cancelEditBtn.addEventListener('click',resetForm);
  modal.addEventListener('click',e=>{if(e.target===modal)closeManager();}); document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)closeManager();});
  $('resetBtn').addEventListener('click',()=>{if(confirm('คืนค่ารายการโปรเจกต์เริ่มต้นทั้งหมดใช่หรือไม่?')){projects=clone(DEFAULTS).map(normalizeProject);persist();render();renderManager();resetForm();showToast('คืนค่าเริ่มต้นแล้ว');}});
  $('copyConfigBtn').addEventListener('click',async()=>{
    const code=`// GAS Project By Kimhan V2.1\n// แก้ไขผ่านเมนู “จัดการโปรเจกต์” แล้วกด “คัดลอก projects.js” เพื่อนำมาวางทับไฟล์นี้ใน GitHub\nwindow.DEFAULT_PROJECTS = ${JSON.stringify(projects,null,2)};\n`;
    try{await navigator.clipboard.writeText(code);showToast('คัดลอก projects.js แล้ว');}
    catch{const ta=document.createElement('textarea');ta.value=code;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();showToast('คัดลอก projects.js แล้ว');}
  });
  function updateClock(){
    const now=new Date();
    const dateFmt=new Intl.DateTimeFormat('th-TH',{weekday:'short',day:'numeric',month:'short',year:'numeric'});
    const timeFmt=new Intl.DateTimeFormat('th-TH',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
    $('currentDate').textContent=dateFmt.format(now);
    $('currentTime').textContent=timeFmt.format(now);
  }
  updateClock(); setInterval(updateClock,1000);
  render(); updateIconPreview();
})();
