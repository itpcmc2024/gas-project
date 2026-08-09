(() => {
  const STORAGE_KEY = 'gas-project-by-kimhan.projects.v1';
  const DEFAULTS = Array.isArray(window.DEFAULT_PROJECTS) ? window.DEFAULT_PROJECTS : [];
  let projects = loadProjects();

  const $ = (id) => document.getElementById(id);
  const grid = $('projectGrid');
  const count = $('projectCount');
  const modal = $('managerModal');
  const form = $('projectForm');
  const editIndex = $('editIndex');
  const nameInput = $('projectName');
  const urlInput = $('projectUrl');
  const iconInput = $('projectIcon');
  const descInput = $('projectDesc');
  const managerList = $('managerList');
  const cancelEditBtn = $('cancelEditBtn');
  const saveProjectBtn = $('saveProjectBtn');

  function clone(value){ return JSON.parse(JSON.stringify(value)); }

  function loadProjects(){
    try{
      const saved = localStorage.getItem(STORAGE_KEY);
      if(saved){
        const parsed = JSON.parse(saved);
        if(Array.isArray(parsed)) return parsed;
      }
    }catch(e){ console.warn('Cannot load saved projects', e); }
    return clone(DEFAULTS);
  }

  function persist(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }

  function esc(value=''){
    return String(value).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  }

  function safeUrl(value){
    try{
      const u = new URL(value);
      return ['http:','https:'].includes(u.protocol) ? u.href : '#';
    }catch{ return '#'; }
  }

  function render(){
    count.textContent = `${projects.length} Project${projects.length === 1 ? '' : 's'}`;
    if(!projects.length){
      grid.innerHTML = '<div class="empty-state">ยังไม่มีโปรเจกต์ กด “จัดการโปรเจกต์” เพื่อเพิ่มการ์ดใหม่</div>';
      return;
    }
    grid.innerHTML = projects.map(p => `
      <article class="project-card">
        <div class="card-icon" aria-hidden="true">${esc(p.icon || '✨')}</div>
        <h3>${esc(p.name)}</h3>
        <p>${esc(p.description || 'เปิดใช้งานโปรเจกต์')}</p>
        <a class="open-link" href="${esc(safeUrl(p.url))}" target="_blank" rel="noopener noreferrer">เปิดระบบ <span aria-hidden="true">↗</span></a>
      </article>
    `).join('');
  }

  function renderManager(){
    managerList.innerHTML = projects.map((p,i) => `
      <div class="manager-row">
        <div class="manager-row-icon">${esc(p.icon || '✨')}</div>
        <div>
          <strong>${esc(p.name)}</strong>
          <small>${esc(p.url)}</small>
        </div>
        <div class="row-actions">
          <button type="button" data-edit="${i}">✏️ แก้ไข</button>
          <button type="button" class="delete" data-delete="${i}">🗑️ ลบ</button>
        </div>
      </div>
    `).join('') || '<div class="empty-state">ยังไม่มีโปรเจกต์</div>';
  }

  function openManager(){ renderManager(); modal.hidden = false; document.body.style.overflow='hidden'; }
  function closeManager(){ modal.hidden = true; document.body.style.overflow=''; resetForm(); }

  function resetForm(){
    form.reset(); editIndex.value='';
    saveProjectBtn.textContent='＋ เพิ่มการ์ด';
    cancelEditBtn.hidden=true;
  }

  function showToast(message){
    const t=$('toast'); t.textContent=message; t.classList.add('show');
    clearTimeout(showToast.timer); showToast.timer=setTimeout(()=>t.classList.remove('show'),2200);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const item = {
      name:nameInput.value.trim(),
      url:urlInput.value.trim(),
      icon:iconInput.value.trim() || '✨',
      description:descInput.value.trim() || 'เปิดใช้งานโปรเจกต์'
    };
    if(safeUrl(item.url)==='#'){ showToast('ลิงก์ไม่ถูกต้อง'); return; }
    const idx = editIndex.value === '' ? -1 : Number(editIndex.value);
    if(idx >= 0){ projects[idx]=item; showToast('แก้ไขการ์ดแล้ว'); }
    else{ projects.push(item); showToast('เพิ่มการ์ดแล้ว'); }
    persist(); render(); renderManager(); resetForm();
  });

  managerList.addEventListener('click', (e) => {
    const edit = e.target.closest('[data-edit]');
    const del = e.target.closest('[data-delete]');
    if(edit){
      const i=Number(edit.dataset.edit), p=projects[i];
      editIndex.value=i; nameInput.value=p.name; urlInput.value=p.url; iconInput.value=p.icon||''; descInput.value=p.description||'';
      saveProjectBtn.textContent='💾 บันทึกการแก้ไข'; cancelEditBtn.hidden=false; nameInput.focus();
    }
    if(del){
      const i=Number(del.dataset.delete);
      if(confirm(`ลบการ์ด “${projects[i]?.name || ''}” ใช่หรือไม่?`)){
        projects.splice(i,1); persist(); render(); renderManager(); resetForm(); showToast('ลบการ์ดแล้ว');
      }
    }
  });

  $('openManagerBtn').addEventListener('click', openManager);
  $('closeManagerBtn').addEventListener('click', closeManager);
  cancelEditBtn.addEventListener('click', resetForm);
  modal.addEventListener('click', (e)=>{ if(e.target===modal) closeManager(); });
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && !modal.hidden) closeManager(); });

  $('resetBtn').addEventListener('click', ()=>{
    if(confirm('คืนค่ารายการโปรเจกต์เริ่มต้นทั้งหมดใช่หรือไม่?')){
      projects=clone(DEFAULTS); persist(); render(); renderManager(); resetForm(); showToast('คืนค่าเริ่มต้นแล้ว');
    }
  });

  $('exportBtn').addEventListener('click', ()=>{
    const blob=new Blob([JSON.stringify(projects,null,2)],{type:'application/json'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='gas-projects.json'; a.click(); URL.revokeObjectURL(a.href);
    showToast('Export JSON แล้ว');
  });

  $('importInput').addEventListener('change', async (e)=>{
    const file=e.target.files?.[0]; if(!file) return;
    try{
      const data=JSON.parse(await file.text());
      if(!Array.isArray(data)) throw new Error('invalid');
      projects=data.map(p=>({name:String(p.name||''),url:String(p.url||''),icon:String(p.icon||'✨'),description:String(p.description||'')})).filter(p=>p.name && safeUrl(p.url)!=='#');
      persist(); render(); renderManager(); resetForm(); showToast('Import สำเร็จ');
    }catch{ alert('ไฟล์ JSON ไม่ถูกต้อง'); }
    e.target.value='';
  });

  $('copyConfigBtn').addEventListener('click', async ()=>{
    const code = `// GAS Project By Kimhan\nwindow.DEFAULT_PROJECTS = ${JSON.stringify(projects,null,2)};\n`;
    try{ await navigator.clipboard.writeText(code); showToast('คัดลอก projects.js แล้ว'); }
    catch{
      const ta=document.createElement('textarea'); ta.value=code; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); showToast('คัดลอก projects.js แล้ว');
    }
  });

  render();
})();
