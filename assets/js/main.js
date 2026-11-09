(() => {
 const grid=document.getElementById('app-grid'), search=document.getElementById('app-search'), label=document.getElementById('result-label'), empty=document.getElementById('empty-state');
 let platform='android',category='all',query='';
 const apps=window.APPSFEATURE_APPS||[];
 function render(){
  const filtered=apps.filter(a=>a.platform===platform&&(category==='all'||a.category===category)&&((a.name+' '+a.description+' '+a.category).toLowerCase().includes(query)));
  label.textContent=(platform==='android'?'ANDROID':'WINDOWS')+' APPLICATIONS · '+filtered.length;
  grid.innerHTML=filtered.map(a=>'<article class="app-card"><div class="app-icon">'+escapeHtml(a.icon||'AF')+'</div><div class="app-info"><h3>'+escapeHtml(a.name)+'</h3><p>'+escapeHtml(a.description)+'</p><div class="app-meta"><span class="app-version">'+escapeHtml(a.version||'')+'</span><span class="app-category">'+escapeHtml(a.category)+'</span><a class="app-link" href="'+safeUrl(a.url)+'" target="_blank" rel="noreferrer">'+escapeHtml(a.status||'View project')+' ↗</a></div></div></article>').join('');
  empty.hidden=filtered.length!==0;
 }
 function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
 function safeUrl(v){try{const u=new URL(v,location.href);return ['https:','http:'].includes(u.protocol)?u.href:'#'}catch{return '#'}}
 document.querySelectorAll('.platform-tab').forEach(b=>b.addEventListener('click',()=>{platform=b.dataset.platform;document.querySelectorAll('.platform-tab').forEach(x=>{const on=x===b;x.classList.toggle('selected',on);x.setAttribute('aria-selected',String(on))});category='all';document.querySelectorAll('.category-chip').forEach(x=>x.classList.toggle('active',x.dataset.category==='all'));render()}));
 document.querySelectorAll('.category-chip').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.category;document.querySelectorAll('.category-chip').forEach(x=>x.classList.toggle('active',x===b));render()}));
 search.addEventListener('input',e=>{query=e.target.value.trim().toLowerCase();render()});
 const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('.desktop-nav');menu.addEventListener('click',()=>nav.classList.toggle('open'));nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
 document.getElementById('year').textContent=new Date().getFullYear();render();
})();