# AppsFeature

A modern static app showcase for Android applications and Windows software, with a dedicated developer profile.

## Stack
- HTML, CSS and vanilla JavaScript
- App catalogue in `assets/js/apps.js` (no PHP or database)
- GitHub Pages deployment via GitHub Actions

## Site pages
- `index.html` — homepage, Android/Windows catalogue tabs, and featured developer introduction.
- `developer.html` — detailed developer profile.

## Add an application
Edit `assets/js/apps.js` and add an object to `window.APPSFEATURE_APPS`.

Fields: `id`, `name`, `platform` (`android` or `windows`), `category` (`utility` or `developer`), `version`, `description`, `icon`, `status`, and `url`.

## Preview
Open `index.html` in a browser or run `python -m http.server 8000`.

## Deployment
The workflow in `.github/workflows/pages.yml` publishes the repository root to GitHub Pages whenever changes are pushed to `main`. In repository Settings → Pages, select **GitHub Actions** as the build and deployment source.

Custom domain: configure `appsfeature.com` in Settings → Pages and add the DNS records GitHub provides at your domain registrar.

## Branding
The approved AppsFeature logo is stored at `assets/images/appsfeature-logo.png` and used in the site header, footer, and favicon. The displayed asset is an optimized 256px copy; the original uploaded artwork remains unchanged in concept, shape, and colors.
