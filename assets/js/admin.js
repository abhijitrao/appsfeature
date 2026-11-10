(() => {
  const authScreen = document.getElementById('auth-screen');
  const dashboard = document.getElementById('dashboard-screen');
  const loginForm = document.getElementById('login-form');
  const password = document.getElementById('admin-password');
  const authError = document.getElementById('auth-error');
  const togglePassword = document.getElementById('toggle-password');
  const logoutButton = document.getElementById('logout-button');
  const sidebar = document.getElementById('sidebar');
  const mobileMenu = document.getElementById('mobile-menu');
  const search = document.getElementById('record-search');
  const tbody = document.getElementById('records-body');
  const header = document.getElementById('records-header');
  const navItems = [...document.querySelectorAll('[data-view]')];
  const title = document.getElementById('page-title');
  const description = document.getElementById('page-description');
  const breadcrumb = document.getElementById('breadcrumb-current');
  const tableTitle = document.getElementById('table-title');
  const tableDescription = document.getElementById('table-description');
  const refreshButton = document.getElementById('refresh-button');
  const footerCount = document.querySelector('.table-footer > span:first-child');

  const views = {
    overview: ['Overview', 'A quick view of your application catalogue and content.', 'Catalogue snapshot', 'Live entries loaded from the website JSON files.'],
    categories: ['Categories', 'Review the groups used to organise your application catalogue.', 'Catalogue categories', 'Categories and their record counts from categories.json.'],
    android: ['Android catalogue', 'Applications and tools published for Android.', 'Android records', 'Live records loaded from the Android JSON catalogue.'],
    windows: ['Windows catalogue', 'Desktop applications and developer tools.', 'Windows records', 'Live records loaded from the Windows JSON catalogue.']
  };
  const headers = {
    records: ['APPLICATION', 'PLATFORM', 'CATEGORY', 'VERSION / STATUS', 'DETAILS'],
    categories: ['CATEGORY', 'CATEGORY ID', 'JSON FILE', 'RECORDS', 'PLATFORM FILES']
  };
  const sources = [
    ['android', 'apps', 'assets/data/android/apps.json'],
    ['android', 'utilities', 'assets/data/android/utilities.json'],
    ['android', 'developer-tools', 'assets/data/android/developer-tools.json'],
    ['windows', 'apps', 'assets/data/windows/apps.json'],
    ['windows', 'utilities', 'assets/data/windows/utilities.json'],
    ['windows', 'developer-tools', 'assets/data/windows/developer-tools.json']
  ];
  let categories = [];
  let records = [];
  let currentView = 'overview';
  let loaded = false;

  function showDashboard() {
    authScreen.hidden = true;
    dashboard.hidden = false;
    document.body.classList.add('dashboard-active');
    if (!loaded) loadCatalogue();
  }
  function showLogin() {
    dashboard.hidden = true;
    authScreen.hidden = false;
    document.body.classList.remove('dashboard-active');
    password.value = '';
    authError.hidden = true;
    password.focus();
  }
  loginForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!password.value.trim()) {
      authError.textContent = 'Please enter your admin password.';
      authError.hidden = false;
      password.focus();
      return;
    }
    authError.textContent = 'Secure sign-in is not connected yet. This screen is a UI preview only.';
    authError.hidden = false;
    password.select();
  });
  document.getElementById('preview-dashboard').addEventListener('click', showDashboard);
  togglePassword.addEventListener('click', () => {
    const reveal = password.type === 'password';
    password.type = reveal ? 'text' : 'password';
    togglePassword.setAttribute('aria-label', reveal ? 'Hide password' : 'Show password');
  });
  logoutButton.addEventListener('click', showLogin);
  mobileMenu.addEventListener('click', () => sidebar.classList.toggle('open'));
  document.getElementById('current-year').textContent = new Date().getFullYear();

  function safeUrl(value) {
    try {
      const url = new URL(value, window.location.origin);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch (_) { return ''; }
  }
  function cell(row, value) {
    const td = document.createElement('td');
    td.textContent = value == null || value === '' ? '—' : String(value);
    row.appendChild(td);
    return td;
  }
  function renderRecord(record) {
    const tr = document.createElement('tr');
    const nameCell = document.createElement('td');
    const nameWrap = document.createElement('div');
    nameWrap.className = 'record-name';
    const avatar = document.createElement('span');
    avatar.className = 'record-avatar' + (record.platform === 'windows' ? ' windows-avatar' : '');
    avatar.textContent = (record.icon || record.name || 'A').slice(0, 2);
    const nameInfo = document.createElement('span');
    const strong = document.createElement('strong');
    strong.textContent = record.name || 'Untitled record';
    const small = document.createElement('small');
    small.textContent = record.id || '';
    nameInfo.append(strong, small);
    nameWrap.append(avatar, nameInfo);
    nameCell.appendChild(nameWrap);
    tr.appendChild(nameCell);
    const platform = document.createElement('td');
    const platformTag = document.createElement('span');
    platformTag.className = 'platform-tag ' + (record.platform === 'windows' ? 'windows-tag' : 'android-tag');
    platformTag.textContent = record.platform === 'windows' ? 'Windows' : 'Android';
    platform.appendChild(platformTag);
    tr.appendChild(platform);
    cell(tr, record.categoryLabel || record.category);
    const status = document.createElement('td');
    const statusTag = document.createElement('span');
    statusTag.className = 'status-tag ' + (/development|beta|testing/i.test(record.status || '') ? 'in-progress' : 'published');
    statusTag.textContent = [record.version, record.status].filter(Boolean).join(' / ') || '—';
    status.appendChild(statusTag);
    tr.appendChild(status);
    const details = document.createElement('td');
    const url = safeUrl(record.url);
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Open ↗';
      details.appendChild(link);
    } else {
      details.textContent = '—';
    }
    tr.appendChild(details);
    return tr;
  }
  function renderCategory(category) {
    const tr = document.createElement('tr');
    cell(tr, category.label);
    cell(tr, category.id);
    cell(tr, category.file);
    const count = records.filter(record => record.category === category.id).length;
    cell(tr, count);
    cell(tr, 'Android + Windows');
    return tr;
  }
  function updateStats() {
    const androidCount = records.filter(record => record.platform === 'android').length;
    const windowsCount = records.filter(record => record.platform === 'windows').length;
    document.getElementById('stat-total').textContent = records.length;
    document.getElementById('stat-categories').textContent = categories.length;
    document.getElementById('stat-android').textContent = androidCount;
    document.getElementById('stat-windows').textContent = windowsCount;
    document.getElementById('nav-category-count').textContent = categories.length;
    document.getElementById('nav-android-count').textContent = androidCount;
    document.getElementById('nav-windows-count').textContent = windowsCount;
  }
  function renderView() {
    const config = views[currentView] || views.overview;
    title.textContent = config[0];
    breadcrumb.textContent = config[0];
    description.textContent = config[1];
    tableTitle.textContent = config[2];
    tableDescription.textContent = config[3];
    navItems.forEach(item => item.classList.toggle('active', item.dataset.view === currentView));
    header.replaceChildren(...(currentView === 'categories' ? headers.categories : headers.records).map(label => {
      const th = document.createElement('th');
      th.textContent = label;
      return th;
    }));
    const query = (search.value || '').trim().toLowerCase();
    const visibleItems = currentView === 'categories'
      ? categories.filter(item => JSON.stringify(item).toLowerCase().includes(query))
      : records.filter(item => (currentView === 'overview' || item.platform === currentView)
          && JSON.stringify(item).toLowerCase().includes(query));
    tbody.replaceChildren();
    visibleItems.forEach(item => tbody.appendChild(currentView === 'categories' ? renderCategory(item) : renderRecord(item)));
    if (!visibleItems.length) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 5;
      td.textContent = loaded ? 'No matching records found.' : 'Loading catalogue…';
      td.style.textAlign = 'center';
      td.style.padding = '28px';
      tr.appendChild(td);
      tbody.appendChild(tr);
    }
    footerCount.textContent = currentView === 'categories'
      ? `Showing ${visibleItems.length} of ${categories.length} categories`
      : `Showing ${visibleItems.length} of ${(currentView === 'overview' ? records.length : records.filter(item => item.platform === currentView).length)} records`;
  }
  async function loadCatalogue() {
    refreshButton.disabled = true;
    refreshButton.textContent = '↻ Loading…';
    try {
      const [categoryResponse, ...responses] = await Promise.all([
        fetch('assets/data/common/categories.json', { cache: 'no-store' }),
        ...sources.map(([, , path]) => fetch(path, { cache: 'no-store' }))
      ]);
      if (!categoryResponse.ok) throw new Error('Could not load categories.json (' + categoryResponse.status + ').');
      const categoryData = await categoryResponse.json();
      const arrays = await Promise.all(responses.map(async (response, index) => {
        if (!response.ok) throw new Error('Could not load ' + sources[index][2] + ' (' + response.status + ').');
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error(sources[index][2] + ' must contain a JSON array.');
        return data.map(record => ({ ...record, platform: sources[index][0], sourceCategory: sources[index][1] }));
      }));
      if (!Array.isArray(categoryData)) throw new Error('categories.json must contain a JSON array.');
      categories = categoryData;
      const labels = new Map(categories.map(category => [category.id, category.label]));
      records = arrays.flat().map(record => ({ ...record, categoryLabel: labels.get(record.category) || record.category }));
      loaded = true;
      updateStats();
      renderView();
    } catch (error) {
      loaded = false;
      tbody.replaceChildren();
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 5;
      td.textContent = 'Catalogue could not be loaded: ' + error.message;
      td.style.color = '#ffaaaa';
      td.style.padding = '24px';
      tr.appendChild(td);
      tbody.appendChild(tr);
      footerCount.textContent = 'Catalogue data unavailable';
    } finally {
      refreshButton.disabled = false;
      refreshButton.textContent = '↻ Refresh';
    }
  }
  navItems.forEach(item => item.addEventListener('click', () => {
    currentView = item.dataset.view || 'overview';
    search.value = '';
    renderView();
    sidebar.classList.remove('open');
  }));
  search.addEventListener('input', renderView);
  refreshButton.addEventListener('click', loadCatalogue);
  document.getElementById('add-record').addEventListener('click', () => {
    // Editing stays disabled until authenticated Worker endpoints are connected.
  });
  renderView();
})();