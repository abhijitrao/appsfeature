# AppsFeature

A modern static app showcase for Android applications and Windows software.

## Stack
- HTML, CSS and vanilla JavaScript
- App catalogue in `assets/js/apps.js` (no PHP or database)
- GitHub Pages deployment via GitHub Actions

## Add an application
Edit `assets/js/apps.js` and add an object to `window.APPSFEATURE_APPS`.

Fields: `id`, `name`, `platform` (`android` or `windows`), `category` (`utility` or `developer`), `version`, `description`, `icon`, `status`, and `url`.

## Preview
Open `index.html` in a browser or run `python -m http.server 8000`.

## Deployment
The workflow in `.github/workflows/pages.yml` publishes the repository root to GitHub Pages whenever changes are pushed to `main`. In repository Settings → Pages, select **GitHub Actions** as the build and deployment source.

Custom domain: configure `appsfeature.com` in Settings → Pages and add the DNS records GitHub provides at your domain registrar.

## Branding
The current layout uses a temporary text/graphic brand mark. The approved original logo should be added at `assets/images/appsfeature-logo.png` and then wired into the header and footer without changing its artwork or proportions.
