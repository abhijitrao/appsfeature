(() => {
  const section = document.querySelector('[data-screenshots]');
  if (!section || !window.AppsRepository) return;

  const platform = section.dataset.platform;
  const appId = section.dataset.appId;
  const basePath = 'assets/images/screenshots/';
  const gallery = section.querySelector('.screenshot-gallery');
  const dialog = section.querySelector('.screenshot-viewer');
  const viewerImage = dialog.querySelector('.screenshot-viewer-image');
  const closeButton = dialog.querySelector('.screenshot-viewer-close');
  const previousButton = dialog.querySelector('.screenshot-viewer-previous');
  const nextButton = dialog.querySelector('.screenshot-viewer-next');
  let images = [];
  let activeIndex = 0;

  function showImage(index) {
    activeIndex = (index + images.length) % images.length;
    const item = images[activeIndex];
    viewerImage.src = item.src;
    viewerImage.alt = item.alt;
    previousButton.hidden = images.length < 2;
    nextButton.hidden = images.length < 2;
  }

  function openViewer(index) {
    showImage(index);
    if (!dialog.open) dialog.showModal();
  }

  function renderScreenshots(app) {
    const filenames = Array.isArray(app.screenshots) ? app.screenshots : [];
    images = filenames
      .filter(name => typeof name === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9._-]*\.(png|jpe?g|webp)$/i.test(name))
      .map((name, index) => ({
        src: basePath + name,
        alt: app.name + ' screenshot ' + (index + 1)
      }));

    if (!images.length) return;

    images.forEach((item, index) => {
      const image = document.createElement('img');
      image.src = item.src;
      image.alt = item.alt;
      image.loading = 'lazy';
      image.addEventListener('error', () => {
        image.closest('.screenshot-card')?.remove();
        if (!gallery.querySelector('.screenshot-card')) section.hidden = true;
      });
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'screenshot-card';
      card.setAttribute('aria-label', 'View ' + item.alt);
      card.addEventListener('click', () => openViewer(index));
      card.append(image);
      gallery.append(card);
    });

    section.hidden = false;
  }

  closeButton.addEventListener('click', () => dialog.close());
  previousButton.addEventListener('click', () => showImage(activeIndex - 1));
  nextButton.addEventListener('click', () => showImage(activeIndex + 1));
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });

  window.AppsRepository.loadApps(platform)
    .then(apps => {
      const app = apps.find(item => item.id === appId);
      if (app) renderScreenshots(app);
    })
    .catch(error => console.error('AppsFeature screenshots:', error));
})();
