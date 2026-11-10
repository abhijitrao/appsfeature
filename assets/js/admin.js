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
  const rows = [...document.querySelectorAll('#records-body tr')];
  const navItems = [...document.querySelectorAll('[data-view]')];
  const title = document.getElementById('page-title');
  const description = document.getElementById('page-description');
  const breadcrumb = document.getElementById('breadcrumb-current');
  const tableTitle = document.getElementById('table-title');
  const tableDescription = document.getElementById('table-description');

  // This is deliberately a UI preview only. Never treat a browser-side check as authentication.
  const views = {
    overview: ['Overview', 'A quick view of your application catalogue and content.', 'Catalogue snapshot', 'Existing entries currently tracked in the website JSON files.'],
    categories: ['Categories', 'Review the groups used to organise your application catalogue.', 'Category management', 'Category editing will be enabled in the next implementation phase.'],
    android: ['Android catalogue', 'Manage applications and tools published for Android.', 'Android records', 'Android JSON records will be loaded from the repository in Phase 2.'],
    windows: ['Windows catalogue', 'Manage desktop applications and developer tools.', 'Windows records', 'Windows JSON records will be loaded from the repository in Phase 2.']
  };

  function showDashboard() {
    authScreen.hidden = true;
    dashboard.hidden = false;
    document.body.classList.add('dashboard-active');
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

  togglePassword.addEventListener('click', () => {
    const reveal = password.type === 'password';
    password.type = reveal ? 'text' : 'password';
    togglePassword.setAttribute('aria-label', reveal ? 'Hide password' : 'Show password');
  });

  function selectView(view) {
    const config = views[view] || views.overview;
    title.textContent = config[0];
    breadcrumb.textContent = config[0];
    description.textContent = config[1];
    tableTitle.textContent = config[2];
    tableDescription.textContent = config[3];
    navItems.forEach(item => item.classList.toggle('active', item.dataset.view === view));
    if (search) search.value = '';
    rows.forEach(row => { row.hidden = view !== 'overview'; });
    sidebar.classList.remove('open');
  }

  navItems.forEach(item => item.addEventListener('click', () => selectView(item.dataset.view)));
  logoutButton.addEventListener('click', showLogin);
  mobileMenu.addEventListener('click', () => sidebar.classList.toggle('open'));

  search.addEventListener('input', () => {
    const query = search.value.trim().toLowerCase();
    rows.forEach(row => { row.hidden = !row.textContent.toLowerCase().includes(query); });
  });

  document.getElementById('refresh-button').addEventListener('click', event => {
    const button = event.currentTarget;
    button.textContent = '↻ Preview refreshed';
    window.setTimeout(() => { button.textContent = '↻ Refresh'; }, 1400);
  });

  document.getElementById('current-year').textContent = new Date().getFullYear();
  document.getElementById('add-record').addEventListener('click', () => {
    // CRUD is intentionally disabled until the JSON editor phase is implemented.
  });
  selectView('overview');
})();