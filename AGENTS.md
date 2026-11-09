# Agent Instructions — AppsFeature

## Project purpose
Maintain AppsFeature as a polished, static app showcase for Android and Windows products.

## Required brand direction
- The user supplied an AppsFeature logo. Treat that artwork as the brand authority.
- Preserve the logo's original shape, proportions, and colors. Do not redraw, recolor, crop, or distort it.
- Derive UI accents from the actual logo; do not assume a generic Android-green palette overrides the logo.
- Keep the design modern, premium, legible, and restrained. Graphics should support the content, not compete with it.

## Architecture constraints
- Static site only: HTML, CSS, and vanilla JavaScript.
- No PHP, backend server, database, runtime API, build framework, or secrets.
- Keep app catalogue entries in `assets/js/apps.js`.
- Keep styles in `assets/css/style.css` and behavior in `assets/js/main.js`.
- Preserve GitHub Pages deployment through `.github/workflows/pages.yml`.

## Platform experience
- Android and Windows must remain separate, clearly labelled platform tabs.
- Search, category filters, and app results must reflect the selected platform.
- Do not mix platform listings or show a Windows app in Android results (or vice versa).
- Ensure keyboard navigation, visible focus, semantic headings, and responsive behavior.

## Content integrity
- Never invent app descriptions, versions, release dates, screenshots, ratings, download links, or capabilities.
- Use only project URLs and download URLs that are supplied or verified.
- Mark unreleased entries clearly; do not label a repository link as a direct APK download.
- Developer profile facts must be accurate and limited to information the user has provided or approved.

## Editing workflow
1. Inspect the current files before changing them.
2. Make focused, consistent changes; avoid replacing working sections unnecessarily.
3. Keep paths relative so the site works on GitHub Pages and a custom domain.
4. Update `README.md` and `PLAN.md` when setup or project behavior changes.
5. Check links, JavaScript syntax, and responsive behavior where possible.
6. Never claim deployment or domain setup succeeded without verifying the GitHub Actions/Pages result.

## Asset handling
- Store approved brand assets under `assets/images/`.
- Optimize image size while preserving quality and aspect ratio.
- Use descriptive filenames and meaningful `alt` text.
- Do not use unrelated stock imagery as a substitute for the supplied logo.

## GitHub workflow
- Work on the repository's default `main` branch unless the user requests otherwise.
- Use descriptive commit messages.
- Do not force-push, delete user content, or change repository visibility/settings without explicit approval.
