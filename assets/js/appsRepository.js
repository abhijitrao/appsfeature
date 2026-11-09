(() => {
  const BASE_PATH = 'assets/data';
  let categoriesPromise;
  const platformCache = new Map();

  async function fetchJson(path) {
    const response = await fetch(path, { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error('Unable to load ' + path + ' (' + response.status + ')');
    }
    return response.json();
  }

  async function getCategories() {
    if (!categoriesPromise) {
      categoriesPromise = fetchJson(BASE_PATH + '/common/categories.json')
        .then(items => {
          if (!Array.isArray(items)) throw new Error('Invalid categories.json format');
          return items;
        })
        .catch(error => {
          categoriesPromise = null;
          throw error;
        });
    }
    return categoriesPromise;
  }

  async function loadApps(platform) {
    if (!['android', 'windows'].includes(platform)) {
      throw new Error('Unsupported platform: ' + platform);
    }
    if (platformCache.has(platform)) return platformCache.get(platform);

    const request = (async () => {
      const categories = await getCategories();
      const groups = await Promise.all(categories.map(category =>
        fetchJson(BASE_PATH + '/' + platform + '/' + category.file)
      ));
      const apps = groups.flat();
      if (!apps.every(app => app && app.platform === platform && app.id && app.name)) {
        throw new Error('Invalid app entry in ' + platform + ' catalogue');
      }
      return apps;
    })();

    platformCache.set(platform, request);
    try {
      return await request;
    } catch (error) {
      platformCache.delete(platform);
      throw error;
    }
  }

  window.AppsRepository = Object.freeze({ loadApps });
})();
