# AppsFeature — Product & Delivery Plan

## Vision
AppsFeature is a lightweight, modern showcase for independently developed Android applications and Windows software. It should communicate product quality, make each app easy to discover, and provide clear project and download links.

## Product principles
- Brand-led visual design based on the supplied AppsFeature logo; preserve its original shape and colors.
- Android and Windows are separate first-class platform tabs.
- Fast, responsive, accessible, and usable on mobile and desktop.
- Static-first: no PHP runtime, server, or database.
- App catalogue data stays version-controlled in `assets/js/apps.js`.
- Do not publish unverified download URLs or invent app versions, features, ratings, or release dates.

## Site structure
1. Home — brand introduction, featured collection, platform entry points.
2. Android — Android app listing and details.
3. Windows — Windows software listing and details.
4. Developer — Abhijit Rao profile, experience, skills, projects, and public contact links.
5. Contact — public collaboration/contact route.

The current iteration presents Android and Windows as separate tabs on the home page, includes a featured developer section, and provides a dedicated `developer.html` profile page. Dedicated platform and app detail pages can be added as the catalogue grows.

## Visual direction
- Use the supplied logo as the source of truth for brand colors and geometry.
- Dark graphite/black surfaces, logo-derived accent colors, restrained metallic details.
- Use custom graphics and subtle motion where they improve clarity; avoid heavy effects and large assets.
- Keep logo artwork unmodified. Store the approved source asset under `assets/images/`.

## Technology and hosting
- HTML, CSS, and vanilla JavaScript.
- Catalogue data in `assets/js/apps.js`.
- GitHub Pages with GitHub Actions deployment.
- Custom domain: `appsfeature.com`.
- No database or server-side application code.

## App catalogue workflow
Add or update entries in the appropriate platform/category JSON file under `assets/data/`. Each entry should include:
- `id`, `name`, `platform` (`android` or `windows`), `category`, `version`, `description`, `icon`, `status`, and `url`.
- Only use real, tested project/download URLs and accurate release information.
- Add screenshots and app artwork only when supplied or approved. Screenshot filenames live in each app's optional `screenshots` array; image files stay together in `assets/images/screenshots/`.

## Delivery milestones
- [x] Create repository and initial static site.
- [x] Add responsive visual foundation, platform tabs, catalogue search/filter, developer profile, and Pages workflow.
- [x] Add project plan and contributor/agent guidance.
- [x] Add a dedicated developer profile page and connect it to homepage navigation.
- [x] Integrate the approved original logo asset in the header, footer, and favicon.
- [x] Improve keyboard navigation, tab semantics, screen-reader states, and mobile-menu accessibility.
- [x] Integrate the approved logo and align header/footer branding with the supplied artwork.
- [ ] Enable GitHub Pages using GitHub Actions and verify deployment.
- [ ] Configure `appsfeature.com` DNS and GitHub Pages custom domain/HTTPS.
- [x] Add Website Privacy Policy and Terms & Conditions pages and footer navigation.
- [ ] Verify mobile/desktop layouts, navigation, search, and all outbound links.
- [x] Add dedicated DroidShare WiFi and Network Simulator detail pages using verified repository documentation and clear implementation status.
- [x] Keep `abhijitrao/appsfeature` as the permanent source repository; no fork is required.

- [x] Create a dedicated transparent favicon asset; preserve the approved logo geometry, proportions, and colors, and keep the existing header/footer logo unchanged.
- [x] Reference the dedicated favicon consistently across every HTML page. Browser-tab rendering remains pending final deployment verification.

## Acceptance checklist
- Android and Windows tabs switch independently and announce selected state accessibly.
- Search and category filters work on both platforms.
- No PHP, database, API key, or server dependency exists.
- No placeholder download link is presented as a working download.
- All images have useful alternative text and are optimized.
- Deployment succeeds from a push to `main`.
- Custom domain serves HTTPS after DNS propagation.


## Modular JSON catalogue architecture
- [x] Keep Android and Windows catalogue data in separate platform folders.
- [x] Split catalogue entries by category so each JSON file stays focused.
- [x] Keep shared category metadata in `assets/data/common/categories.json`.
- [x] Add `assets/js/appsRepository.js` to load and cache platform/category JSON files.
- [x] Update the homepage catalogue to load data asynchronously from the repository module.
- [x] Remove the legacy JavaScript catalogue data file after migration.
- [ ] Verify platform switching, category filters, search, empty states, and GitHub Pages fetch paths at the final testing stage.

### Catalogue layout
```text
assets/
├── data/
│   ├── android/
│   │   ├── apps.json
│   │   ├── utilities.json
│   │   └── developer-tools.json
│   ├── windows/
│   │   ├── apps.json
│   │   ├── utilities.json
│   │   └── developer-tools.json
│   └── common/
│       └── categories.json
└── js/
    ├── appsRepository.js
    └── main.js
```

The `apps.json` file in each platform folder is reserved for general applications that do not belong to a specialised category. Empty categories use an empty JSON array. Category IDs remain stable and match the existing homepage filter values.

 
 ## Optional app screenshots
 - [x] Add an optional `screenshots` filename array to app catalogue entries.
 - [x] Keep screenshot files in one shared `assets/images/screenshots/` directory; JSON stores filenames only.
 - [x] Add a reusable detail-page gallery that supports multiple screenshots and a larger preview.
 - [x] Hide the entire gallery when the screenshot list is missing or empty.
 - [ ] Add supplied/approved screenshot images and verify the gallery at final website testing.
 
 Screenshot filenames must be unique across apps (for example, `droidshare-wifi-1.png` and `network-simulator-1.png`). Supported formats: PNG, JPG/JPEG and WebP.
 