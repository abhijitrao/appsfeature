# AppsFeature

Canonical source repository: [abhijitrao/appsfeature](https://github.com/abhijitrao/appsfeature). The separate `appsfeature` GitHub account is not used for hosting; the public brand website is served from the custom domain `appsfeature.com`.

A modern static app showcase for Android applications and Windows software, with a dedicated developer profile.

## Stack
- HTML, CSS and vanilla JavaScript
- App catalogue in `assets/js/apps.js` (no PHP or database)
- GitHub Pages deployment via GitHub Actions

## Site pages
- `index.html` — homepage, Android/Windows catalogue tabs, and featured developer introduction.
- `developer.html` — detailed developer profile.
- `privacy.html` — Website privacy policy.
- `terms.html` — Website terms and conditions.
- `droidshare-wifi.html` — DroidShare WiFi project overview and implementation status.
- `network-simulator.html` — Network Simulator features, version and limitations.

## App detail pages
The current catalogue entries link to dedicated static product pages. Keep product descriptions, implementation status, version details and download links aligned with each project's source repository. Do not advertise workflow artifacts as permanent direct download URLs.

## Add an application
Edit `assets/js/apps.js` and add an object to `window.APPSFEATURE_APPS`.

Fields: `id`, `name`, `platform` (`android` or `windows`), `category` (`utility` or `developer`), `version`, `description`, `icon`, `status`, and `url`.

## Preview
Open `index.html` in a browser or run `python -m http.server 8000`.

## Deployment
The workflow in `.github/workflows/pages.yml` publishes the repository root to GitHub Pages whenever changes are pushed to `main`. In repository Settings → Pages, select **GitHub Actions** as the build and deployment source.

Custom domain: configure `appsfeature.com` in Settings → Pages and add the DNS records GitHub provides at your domain registrar.

## Legal pages
The Privacy Policy and Terms & Conditions apply to the AppsFeature website. Individual applications may require separate, product-specific privacy notices and licences. Review these pages before changing the Website's data collection or external services.

## Branding
The approved AppsFeature logo is stored at `assets/images/appsfeature-logo.png` and used in the site header, footer, and favicon. The displayed asset is an optimized 256px copy; the original uploaded artwork remains unchanged in concept, shape, and colors.


## Custom domain DNS
The repository includes a `CNAME` file for `appsfeature.com`. In GoDaddy DNS, use:
- Apex/root (`@`): A records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
- `www`: CNAME to `abhijitrao.github.io`.
Remove conflicting A/AAAA/CNAME records for these same hostnames. After DNS is saved, enable **Enforce HTTPS** in GitHub Pages when it becomes available. DNS changes and certificate issuance can take time.
