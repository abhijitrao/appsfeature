(() => {
 const grid=document.getElementById('app-grid'), search=document.getElementById('app-search'), label=document.getElementById('result-label'), empty=document.getElementById('empty-state');
 const tabs=[...document.querySelectorAll('.platform-tab')],chips=[...document.querySelectorAll('.category-chip')];
 const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('.desktop-nav');
 let platform='android',category='all',query='';
 const apps=window.APPSFEATURE_APPS||[];
 function render(){
  const filtered=apps.filter(a=>a.platform===platform&&(category==='all'||a.category===category)&&((a.name+' '+a.description+' '+a.category).toLowerCase().includes(query)));
  label.textContent=(platform==='android'?'ANDROID':'WINDOWS')+' APPLICATIONS · '+filtered.length;
  grid.innerHTML=filtered.map(a=>'<article class="app-card"><div class="app-icon" aria-hidden="true">'+escapeHtml(a.icon||'AF')+'</div><div class="app-info"><h3>'+escapeHtml(a.name)+'</h3><p>'+escapeHtml(a.description)+'</p><div class="app-meta"><span class="app-version">'+escapeHtml(a.version||'')+'</span><span class="app-category">'+escapeHtml(a.category)+'</span></div><div class="app-actions">'+(a.detailUrl?'<a class="app-link" href="'+safeUrl(a.detailUrl)+'">View details →</a>':'')+'<a class="app-source-link" href="'+safeUrl(a.url)+'" target="_blank" rel="noopener noreferrer">GitHub ↗</a></div></div></article>').join('');
  empty.hidden=filtered.length!==0;
 }
 function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
 function safeUrl(v){try{const u=new URL(v,location.href);return ['https:','http:'].includes(u.protocol)?u.href:'#'}catch{return '#'}}
 function selectPlatform(next,focus=false){
  platform=next;
  tabs.forEach(tab=>{const on=tab.dataset.platform===platform;tab.classList.toggle('selected',on);tab.setAttribute('aria-selected',String(on));tab.tabIndex=on?0:-1;if(focus&&on)tab.focus()});
  grid.setAttribute('aria-labelledby',tabs.find(t=>t.dataset.platform===platform).id);
  category='all';chips.forEach(chip=>{const on=chip.dataset.category==='all';chip.classList.toggle('active',on);chip.setAttribute('aria-pressed',String(on))});
  render();
 }
 tabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>selectPlatform(tab.dataset.platform));
  tab.addEventListener('keydown',e=>{
   let next=index;
   if(e.key==='ArrowRight')next=(index+1)%tabs.length;
   else if(e.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;
   else if(e.key==='Home')next=0;
   else if(e.key==='End')next=tabs.length-1;
   else return;
   e.preventDefault();selectPlatform(tabs[next].dataset.platform,true);
  });
 });
 chips.forEach(chip=>chip.addEventListener('click',()=>{category=chip.dataset.category;chips.forEach(x=>{const on=x===chip;x.classList.toggle('active',on);x.setAttribute('aria-pressed',String(on))});render()}));
 search.addEventListener('input',e=>{query=e.target.value.trim().toLowerCase();render()});
 function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation menu')}
 menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation menu':'Open navigation menu')});
 nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
 document.getElementById('year').textContent=new Date().getFullYear();
 chips.forEach(chip=>chip.setAttribute('aria-pressed',String(chip.dataset.category==='all')));
 grid.setAttribute('aria-labelledby','platform-android-tab');render();
})();