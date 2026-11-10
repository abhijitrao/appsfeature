(() => {
  const $ = id => document.getElementById(id);
  const authScreen = $("auth-screen"), dashboard = $("dashboard-screen");
  const loginForm = $("login-form"), password = $("admin-password"), authError = $("auth-error");
  const sidebar = $("sidebar"), search = $("record-search"), tbody = $("records-body"), header = $("records-header");
  const refreshButton = $("refresh-button"), footerCount = document.querySelector(".table-footer > span:first-child");
  const editor = $("editor-dialog"), editorForm = $("editor-form"), fields = $("editor-fields");
  const review = $("review-dialog"), reviewFiles = $("review-files");
  const sources = ["assets/data/android/apps.json","assets/data/android/utilities.json","assets/data/android/developer-tools.json","assets/data/windows/apps.json","assets/data/windows/utilities.json","assets/data/windows/developer-tools.json"];
  const titles = {
    overview:["Overview","A quick view of your application catalogue and content.","Catalogue snapshot","All catalogue entries."],
    categories:["Categories","Manage the groups used to organise applications.","Catalogue categories","Categories from categories.json."],
    android:["Android catalogue","Applications and tools published for Android.","Android records","Android JSON catalogue."],
    windows:["Windows catalogue","Desktop applications and developer tools.","Windows records","Windows JSON catalogue."]
  };
  let files = {}, original = {}, dirty = new Set(), currentView = "overview", editing = null, editorKind = "record", authenticated = false, pendingCommit = false, selectedBranch = "main";

  function message(el, text) { el.textContent = text; el.hidden = false; }
  async function api(path, options = {}) {
    const response = await fetch(path, { credentials:"same-origin", cache:"no-store", ...options,
      headers:{ ...(options.body ? {"content-type":"application/json"} : {}), ...(options.headers || {}) } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Request failed (" + response.status + ").");
    return data;
  }
  function showDashboard() {
    authScreen.hidden = true; dashboard.hidden = false; document.body.classList.add("dashboard-active");
    document.querySelector(".preview-notice")?.remove();
    loadCatalogue();
  }
  function showLogin() {
    dashboard.hidden = true; authScreen.hidden = false; document.body.classList.remove("dashboard-active");
    authenticated = false; password.value = ""; authError.hidden = true;
  }
  loginForm.addEventListener("submit", async event => {
    event.preventDefault(); authError.hidden = true;
    try {
      await api("/api/auth/login", {method:"POST",body:JSON.stringify({password:password.value})});
      authenticated = true; showDashboard();
    } catch (error) { message(authError,error.message); }
  });
  $("preview-dashboard").addEventListener("click", () => {
    authenticated = false; showDashboard();
    $("add-record").disabled = true;
    document.querySelector(".preview-notice")?.remove();
    const notice = document.createElement("div"); notice.className="preview-notice";
    notice.innerHTML = "<span>ⓘ</span><div><strong>Read-only preview</strong><small>Sign in with the configured admin password to enable editing and GitHub commits.</small></div>";
    document.querySelector(".dashboard-main").insertBefore(notice,document.querySelector(".page-content"));
  });
  $("toggle-password").addEventListener("click", () => {
    const reveal=password.type==="password"; password.type=reveal?"text":"password";
    $("toggle-password").setAttribute("aria-label",reveal?"Hide password":"Show password");
  });
  $("logout-button").addEventListener("click", async () => {
    if (authenticated) { try { await api("/api/auth/logout",{method:"POST"}); } catch (_) {} }
    showLogin();
  });
  $("mobile-menu").addEventListener("click",()=>sidebar.classList.toggle("open"));
  $("current-year").textContent=new Date().getFullYear();
  $("branch-select").value=selectedBranch;
  $("sidebar-branch").textContent=selectedBranch;

  function categoryList(){return files["assets/data/common/categories.json"] || [];}
  function allRecords(){return sources.flatMap(path => (files[path]||[]).map((r,index)=>({...r,_path:path,_index:index})));}
  function categoryFor(record){return categoryList().find(c=>c.id===record.category)?.label || record.category || "—";}
  function setStats(){
    const all=allRecords(), android=all.filter(r=>r.platform==="android").length, windows=all.length-android;
    $("stat-total").textContent=all.length;$("stat-categories").textContent=categoryList().length;
    $("stat-android").textContent=android;$("stat-windows").textContent=windows;
    $("nav-category-count").textContent=categoryList().length;$("nav-android-count").textContent=android;$("nav-windows-count").textContent=windows;
  }
  function td(row,value){const el=document.createElement("td");el.textContent=value??"—";row.append(el);return el;}
  function actionButton(label,action,kind){const b=document.createElement("button");b.type="button";b.className="row-action "+(kind||"");b.textContent=label;b.addEventListener("click",action);return b;}
  function render(){
    const cfg=titles[currentView];$("page-title").textContent=cfg[0];$("breadcrumb-current").textContent=cfg[0];
    $("page-description").textContent=cfg[1];$("table-title").textContent=cfg[2];$("table-description").textContent=cfg[3];
    document.querySelectorAll("[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===currentView));
    const isCat=currentView==="categories";
    header.replaceChildren(...(isCat?["CATEGORY","CATEGORY ID","JSON FILE","RECORDS","ACTIONS"]:["APPLICATION","PLATFORM","CATEGORY","VERSION / STATUS","ACTIONS"]).map(t=>{const th=document.createElement("th");th.textContent=t;return th;}));
    const q=search.value.trim().toLowerCase();
    const list=isCat?categoryList().map(c=>({...c,_kind:"category"})):allRecords().filter(r=>currentView==="overview"||r.platform===currentView);
    const shown=list.filter(x=>JSON.stringify(x).toLowerCase().includes(q));tbody.replaceChildren();
    shown.forEach(item=>{
      const tr=document.createElement("tr");
      if(isCat){
        td(tr,item.label);td(tr,item.id);td(tr,item.file);
        td(tr,allRecords().filter(r=>r.category===item.id).length);
      } else {
        const name=td(tr,"");const wrap=document.createElement("div");wrap.className="record-name";
        const av=document.createElement("span");av.className="record-avatar"+(item.platform==="windows"?" windows-avatar":"");av.textContent=(item.icon||item.name||"A").slice(0,2);
        const info=document.createElement("span"),strong=document.createElement("strong"),small=document.createElement("small");
        strong.textContent=item.name||"Untitled";small.textContent=item.id||"";info.append(strong,small);wrap.append(av,info);name.append(wrap);
        const p=td(tr,item.platform==="windows"?"Windows":"Android");p.className="platform-tag "+(item.platform==="windows"?"windows-tag":"android-tag");
        td(tr,categoryFor(item));td(tr,[item.version,item.status].filter(Boolean).join(" / ")||"—");
      }
      const actions=td(tr,"");actions.className="row-actions";
      if(authenticated){
        actions.append(actionButton("Edit",()=>openEditor(isCat?"category":"record",item)));
        actions.append(actionButton("Delete",()=>removeItem(isCat?"category":"record",item),"danger"));
      } else actions.textContent="Read only";
      tbody.append(tr);
    });
    if(!shown.length){const tr=document.createElement("tr"),cell=document.createElement("td");cell.colSpan=5;cell.textContent="No matching entries.";cell.style.textAlign="center";cell.style.padding="28px";tr.append(cell);tbody.append(tr);}
    footerCount.textContent=isCat?("Showing "+shown.length+" of "+list.length+" categories"):("Showing "+shown.length+" of "+list.length+" records");
    $("add-record").disabled=!authenticated;
    $("review-changes-button").disabled=!authenticated || dirty.size===0;
    $("pending-change-count").textContent=dirty.size;
    $("add-record").textContent=isCat?"＋ Add category":"＋ Add record";
    setStats();
  }
  async function loadCatalogue(){
    refreshButton.disabled=true;refreshButton.textContent="↻ Loading…";
    try{
      if(authenticated){
        const result=await api("/api/catalogue?branch="+encodeURIComponent(selectedBranch));files=result.files;
      } else {
        const paths=["assets/data/common/categories.json",...sources];
        const result=await Promise.all(paths.map(async p=>{const r=await fetch(p+"?v="+Date.now(),{cache:"no-store"});if(!r.ok)throw new Error("Could not load "+p);return [p,await r.json()];}));
        files=Object.fromEntries(result);
      }
      original=JSON.parse(JSON.stringify(files));dirty.clear();render();
    }catch(error){tbody.replaceChildren();const tr=document.createElement("tr"),tdx=document.createElement("td");tdx.colSpan=5;tdx.textContent="Catalogue load failed: "+error.message;tdx.style.padding="24px";tr.append(tdx);tbody.append(tr);}
    finally{refreshButton.disabled=false;refreshButton.textContent="↻ Refresh";}
  }
  function inputField(label,name,value,type="text",required=false){
    const wrap=document.createElement("label");wrap.className="editor-field";const cap=document.createElement("span");cap.textContent=label;
    let control;
    if(type==="textarea"){control=document.createElement("textarea");control.rows=3;}else if(type==="select"){control=document.createElement("select");}
    else{control=document.createElement("input");control.type=type;}
    control.name=name;control.value=value??"";control.required=required;control.className="editor-input";
    wrap.append(cap,control);return wrap;
  }
  function openEditor(kind,item=null){
    editorKind=kind;editing=item?{...item}:null;fields.replaceChildren();$("editor-error").hidden=true;
    $("editor-title").textContent=(item?"Edit ":"Add ")+(kind==="category"?"category":"record");
    if(kind==="category"){
      const idField=inputField("Category ID","id",item?.id||"", "text",true);
      const fileField=inputField("JSON filename","file",item?.file||"","text",true);
      if(item){idField.querySelector("input").disabled=true;fileField.querySelector("input").disabled=true;}
      fields.append(idField,inputField("Display label","label",item?.label||"","text",true),fileField);
    }else{
      const platform=item?.platform||(currentView==="windows"?"windows":"android");
      const catWrap=inputField("Category","category",item?.category||categoryList()[0]?.id||"","select",true);
      const select=catWrap.querySelector("select");categoryList().forEach(c=>{const o=document.createElement("option");o.value=c.id;o.textContent=c.label;select.append(o);});
      const platformWrap=inputField("Platform","platform",platform,"select",true);
      ["android","windows"].forEach(v=>{const o=document.createElement("option");o.value=v;o.textContent=v==="android"?"Android":"Windows";platformWrap.querySelector("select").append(o);});
      platformWrap.querySelector("select").value=platform;
      select.value=item?.category||categoryList()[0]?.id||"";
      fields.append(inputField("Application ID (unique)","id",item?.id||"","text",true),inputField("Application name","name",item?.name||"","text",true),platformWrap,catWrap,
        inputField("Version","version",item?.version||""),inputField("Status","status",item?.status||"In development"),inputField("Icon text","icon",item?.icon||""),
        inputField("Description","description",item?.description||"","textarea"),inputField("Details page URL","detailUrl",item?.detailUrl||""),inputField("Project / download URL","url",item?.url||""),
        inputField("Screenshots (comma-separated filenames)","screenshots",(item?.screenshots||[]).join(", ")));
    }
    editor.showModal();
  }
  function markDirty(path){dirty.add(path);}
  function removeItem(kind,item){
    const label=kind==="category"?item.label:item.name;
    if(!window.confirm("Delete "+label+"? This change will be reviewed before it is committed."))return;
    if(kind==="category"){
      if(allRecords().some(r=>r.category===item.id)){window.alert("This category still has records. Move or delete those records first.");return;}
      files["assets/data/common/categories.json"]=categoryList().filter(c=>c.id!==item.id);markDirty("assets/data/common/categories.json");
    }else{
      files[item._path]=(files[item._path]||[]).filter((_,i)=>i!==item._index);markDirty(item._path);
    }
    render();
  }
  editorForm.addEventListener("submit",event=>{
    event.preventDefault();const data=Object.fromEntries(new FormData(editorForm).entries());
    try{
      if(editorKind==="category"){
        const list=[...categoryList()];if(!/^[a-z0-9-]+$/.test(data.id))throw new Error("Category ID may contain lowercase letters, numbers and hyphens only.");
        if(list.some(c=>c.id===data.id&&(!editing||editing.id!==data.id)))throw new Error("Category ID already exists.");
        const next={id:data.id,label:data.label.trim(),file:data.file.trim()};
        const index=editing?list.findIndex(c=>c.id===editing.id):-1;if(index>=0)list[index]=next;else list.push(next);
        files["assets/data/common/categories.json"]=list;markDirty("assets/data/common/categories.json");
      }else{
        const platform=data.platform,cat=categoryList().find(c=>c.id===data.category);if(!cat)throw new Error("Select a valid category.");
        const path="assets/data/"+platform+"/"+cat.file;
        const next={id:data.id.trim(),name:data.name.trim(),platform,category:data.category,version:data.version.trim(),description:data.description.trim(),icon:data.icon.trim(),status:data.status.trim(),detailUrl:data.detailUrl.trim(),url:data.url.trim(),screenshots:data.screenshots.split(",").map(s=>s.trim()).filter(Boolean)};
        if(!next.id||!next.name)throw new Error("ID and name are required.");
        const list=[...(files[path]||[])];
        if(list.some(r=>r.id===next.id&&(!editing||editing.id!==next.id||editing._path!==path)))throw new Error("This ID already exists in the selected JSON file.");
        if(editing){const old=files[editing._path]||[];files[editing._path]=old.filter((_,i)=>i!==editing._index);markDirty(editing._path);}
        const updated=files[path]||[];const index=editing&&editing._path===path?editing._index:-1;
        if(index>=0){updated.splice(index,0,next);}else updated.push(next);
        files[path]=updated;markDirty(path);
      }
      editor.close();render();
    }catch(error){message($("editor-error"),error.message);}
  });
  function showReview(){
    if(!dirty.size)return;
    $("review-branch").textContent=selectedBranch;
    reviewFiles.replaceChildren();
    [...dirty].forEach(path=>{const li=document.createElement("li");li.innerHTML="<strong></strong><small></small>";li.querySelector("strong").textContent=path;li.querySelector("small").textContent=(original[path]||[]).length+" → "+(files[path]||[]).length+" entries";reviewFiles.append(li);});
    $("review-error").hidden=true;review.showModal();
  }
  async function commitChanges(){
    $("confirm-commit").disabled=true;$("confirm-commit").textContent="Committing…";
    try{
      const payload={branch:selectedBranch,files:Object.fromEntries([...dirty].map(path=>[path,files[path]])),message:$("commit-message").value};
      const result=await api("/api/commit",{method:"POST",body:JSON.stringify(payload)});
      review.close();window.alert("Committed successfully to "+result.branch+". Commit: "+result.commit.slice(0,7));
      await loadCatalogue();
    }catch(error){message($("review-error"),error.message);}
    finally{$("confirm-commit").disabled=false;$("confirm-commit").textContent="Confirm & commit";}
  }
  $("add-record").addEventListener("click",()=>openEditor(currentView==="categories"?"category":"record"));
  $("editor-close").addEventListener("click",()=>editor.close());$("editor-cancel").addEventListener("click",()=>editor.close());
  $("review-close").addEventListener("click",()=>review.close());$("review-cancel").addEventListener("click",()=>review.close());
  $("confirm-commit").addEventListener("click",commitChanges);
  $("review-changes-button").addEventListener("click",showReview);
  $("branch-select").addEventListener("change", async event=>{
    const next=event.target.value;
    if(dirty.size && !window.confirm("Discard uncommitted local changes and switch to "+next+"?")){event.target.value=selectedBranch;return;}
    selectedBranch=next;
    $("sidebar-branch").textContent=selectedBranch;
    $("branch-select").disabled=true;
    await loadCatalogue();
    $("branch-select").disabled=false;
  });
  $("refresh-button").addEventListener("click",loadCatalogue);search.addEventListener("input",render);
  document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>{currentView=b.dataset.view;search.value="";render();sidebar.classList.remove("open");}));
  render();
  api("/api/auth/me").then(()=>{authenticated=true;showDashboard();}).catch(()=>{});
})();
