(() => {
 const grid=document.getElementById('app-grid');
 const search=document.getElementById('app-search');
 const label=document.getElementById('result-label');
 const empty=document.getElementById('empty-state');
 const tabs=[...document.querySelectorAll('.platform-tab')];
 const chips=[...document.querySelectorAll('.category-chip')];
 const menu=document.querySelector('.menu-toggle');
 const nav=document.querySelector('.desktop-nav');
 let platform='android',category='all',query='',apps=[],loadSequence=0;

 function escapeHtml(value){
  return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 }
 function safeUrl(value){
  try{const url=new URL(value,location.href);return ['https:','http:'].includes(url.protocol)?url.href:'#'}
  catch{return '#'}
 }
 function platformIcon(value){
  return value==='android'
   ? '<svg class="platform-brand-icon toolbar-platform-icon android-brand-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7.2 8.2 5.5 5.4m13 0-1.7 2.8M4.8 13.1c0-4 3.2-7.1 7.2-7.1s7.2 3.1 7.2 7.1H4.8Zm1.1.2v4.1a1.5 1.5 0 0 0 1.5 1.5h9.2a1.5 1.5 0 0 0 1.5-1.5v-4.1M3.4 13.2v4.1m17.2-4.1v4.1M9 9.5h.01M15 9.5h.01"/></svg>'
   : '<svg class="platform-brand-icon toolbar-platform-icon windows-brand-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m3 5.2 8-1.1v7.2H3V5.2Zm10-1.4 8-1.1v8.6h-8V3.8ZM3 13h8v7.2l-8-1.1V13Zm10 0h8v8.6l-8-1.1V13Z"/></svg>';
 }
 function render(){
  const filtered=apps.filter(app=>
   app.platform===platform&&
   (category==='all'||app.category===category)&&
   (app.name+' '+app.description+' '+app.category).toLowerCase().includes(query)
  );
  label.innerHTML=platformIcon(platform)+' '+(platform==='android'?'ANDROID':'WINDOWS')+' APPLICATIONS · '+filtered.length;
  grid.innerHTML=filtered.map(app=>
   '<article class="app-card"><div class="app-icon" aria-hidden="true">'+escapeHtml(app.icon||'AF')+'</div>'+
   '<div class="app-info"><h3>'+escapeHtml(app.name)+'</h3><p>'+escapeHtml(app.description)+'</p>'+
   '<div class="app-meta"><span class="app-version">'+escapeHtml(app.version||'')+'</span><span class="app-category">'+escapeHtml(app.category)+'</span></div>'+
   '<div class="app-actions">'+(app.detailUrl?'<a class="app-link" href="'+safeUrl(app.detailUrl)+'">View details →</a>':'')+
   '<a class="app-source-link" href="'+safeUrl(app.url)+'" target="_blank" rel="noopener noreferrer">GitHub ↗</a></div></div></article>'
  ).join('');
  empty.hidden=filtered.length!==0;
  if(!filtered.length) empty.textContent='No apps match your search yet. Try another keyword.';
 }
 async function loadPlatform(nextPlatform){
  const sequence=++loadSequence;
  apps=[];
  label.textContent=(nextPlatform==='android'?'ANDROID':'WINDOWS')+' APPLICATIONS · LOADING';
  grid.innerHTML='';
  empty.hidden=false;
  empty.textContent='Loading applications...';
  try{
   const result=await window.AppsRepository.loadApps(nextPlatform);
   if(sequence!==loadSequence)return;
   platform=nextPlatform;
   apps=result;
   render();
  }catch(error){
   if(sequence!==loadSequence)return;
   apps=[];
   label.textContent=(nextPlatform==='android'?'ANDROID':'WINDOWS')+' APPLICATIONS · ERROR';
   empty.hidden=false;
   empty.textContent='Applications could not be loaded. Please refresh the page to try again.';
   console.error('AppsFeature catalogue:',error);
  }
 }
 function selectPlatform(nextPlatform,focus=false){
  tabs.forEach(tab=>{
   const selected=tab.dataset.platform===nextPlatform;
   tab.classList.toggle('selected',selected);
   tab.setAttribute('aria-selected',String(selected));
   tab.tabIndex=selected?0:-1;
   if(focus&&selected)tab.focus();
  });
  const selectedTab=tabs.find(tab=>tab.dataset.platform===nextPlatform);
  if(selectedTab)grid.setAttribute('aria-labelledby',selectedTab.id);
  category='all';
  chips.forEach(chip=>{
   const selected=chip.dataset.category==='all';
   chip.classList.toggle('active',selected);
   chip.setAttribute('aria-pressed',String(selected));
  });
  loadPlatform(nextPlatform);
 }
 tabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>selectPlatform(tab.dataset.platform));
  tab.addEventListener('keydown',event=>{
   let next=index;
   if(event.key==='ArrowRight')next=(index+1)%tabs.length;
   else if(event.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;
   else if(event.key==='Home')next=0;
   else if(event.key==='End')next=tabs.length-1;
   else return;
   event.preventDefault();
   selectPlatform(tabs[next].dataset.platform,true);
  });
 });
 chips.forEach(chip=>chip.addEventListener('click',()=>{
  category=chip.dataset.category;
  chips.forEach(item=>{
   const selected=item===chip;
   item.classList.toggle('active',selected);
   item.setAttribute('aria-pressed',String(selected));
  });
  render();
 }));
 search.addEventListener('input',event=>{
  query=event.target.value.trim().toLowerCase();
  render();
 });
 function closeMenu(){
  nav.classList.remove('open');
  menu.setAttribute('aria-expanded','false');
  menu.setAttribute('aria-label','Open navigation menu');
 }
 menu.addEventListener('click',()=>{
  const open=nav.classList.toggle('open');
  menu.setAttribute('aria-expanded',String(open));
  menu.setAttribute('aria-label',open?'Close navigation menu':'Open navigation menu');
 });
 nav.querySelectorAll('a').forEach(anchor=>anchor.addEventListener('click',closeMenu));
 document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu()});
 document.getElementById('year').textContent=new Date().getFullYear();
 chips.forEach(chip=>chip.setAttribute('aria-pressed',String(chip.dataset.category==='all')));
 grid.setAttribute('aria-labelledby','platform-android-tab');
 loadPlatform(platform);
})();
