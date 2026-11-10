import { reply, fail, isAuthenticated, sameOrigin, CATALOGUE_PATHS, validateCatalogue, github, REPO, resolveBranch } from "../_lib/admin.js";
export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return fail("Request origin rejected.", 403);
  if (!await isAuthenticated(request, env)) return fail("Authentication required.", 401);
  const length = Number(request.headers.get("Content-Length") || 0);
  if (length > 9 * 1024 * 1024) return fail("Request is too large.", 413);
  let body;
  try { body = await request.json(); } catch (_) { return fail("Invalid JSON request."); }
  if (!body || typeof body.files !== "object" || Array.isArray(body.files)) return fail("No catalogue changes supplied.");
  let branch;
  try { branch = resolveBranch(body.branch); } catch (error) { return fail(error.message, 400); }
  const entries = Object.entries(body.files);
  const screenshots = Array.isArray(body.screenshots) ? body.screenshots : [];
  if (screenshots.length > 12) return fail("You can upload up to 12 screenshots per commit.", 413);
  let screenshotBytes = 0;
  for (const item of screenshots) {
    if (!item || typeof item.name !== "string" || !/^[a-z0-9][a-z0-9._-]{0,120}\.(png|jpe?g|webp)$/i.test(item.name) || typeof item.base64 !== "string" || !/^[A-Za-z0-9+/]+={0,2}$/.test(item.base64)) return fail("Invalid screenshot upload.", 400);
    screenshotBytes += Math.floor(item.base64.length * 3 / 4);
    if (screenshotBytes > 6 * 1024 * 1024) return fail("Screenshots must total 6 MB or less per commit.", 413);
  }
  if (!entries.length || entries.length > CATALOGUE_PATHS.length) return fail("Invalid number of changed files.");
  try {
    for (const [path, data] of entries) validateCatalogue(path, data);
    const categoriesPath = "assets/data/common/categories.json";
    const categoryResponse = entries.find(([path]) => path === categoriesPath);
    let categories = categoryResponse ? categoryResponse[1] : null;
    if (!categories) {
      const current = await github("/repos/" + REPO + "/contents/" + categoriesPath + "?ref=" + branch, env);
      const binary = atob(current.content.replace(/\\n/g, ""));
      categories = JSON.parse(new TextDecoder().decode(Uint8Array.from(binary, c => c.charCodeAt(0))));
    }
    const categoryIds = new Set(categories.map(category => category.id));
    const categoryFiles = new Map(categories.map(category => [category.id, category.file]));
    for (const [path, data] of entries) {
      if (path === categoriesPath) continue;
      const platform = path.includes("/android/") ? "android" : "windows";
      const expectedFile = path.split("/").pop();
      for (const record of data) {
        if (!categoryIds.has(record.category)) throw new Error("Unknown category ID: " + record.category);
        if (categoryFiles.get(record.category) !== expectedFile) throw new Error("Record category does not match its destination JSON file.");
        if (record.platform !== platform) throw new Error("Record platform does not match its destination JSON file.");
      }
    }
    const ref = await github("/repos/" + REPO + "/git/ref/heads/" + branch, env);
    const parent = await github("/repos/" + REPO + "/git/commits/" + ref.object.sha, env);

    // Compare screenshot references across every catalogue so shared images are never deleted.
    const cataloguePaths = CATALOGUE_PATHS.filter(path => !path.endsWith("/categories.json"));
    const currentCatalogues = await Promise.all(cataloguePaths.map(async path => {
      const response = await github("/repos/" + REPO + "/contents/" + path + "?ref=" + branch, env);
      const binary = atob(response.content.replace(/\\n/g, ""));
      return [path, JSON.parse(new TextDecoder().decode(Uint8Array.from(binary, c => c.charCodeAt(0))))];
    }));
    const mergedCatalogues = new Map(currentCatalogues);
    for (const [path, data] of entries) if (mergedCatalogues.has(path)) mergedCatalogues.set(path, data);

    const collectScreenshotNames = catalogues => {
      const names = new Set();
      for (const records of catalogues.values()) {
        for (const record of records) {
          if (!Array.isArray(record.screenshots)) continue;
          for (const name of record.screenshots) {
            if (typeof name === "string" && /^[a-z0-9][a-z0-9._-]{0,120}\\.(png|jpe?g|webp)$/i.test(name)) names.add(name);
          }
        }
      }
      return names;
    };
    const oldScreenshotNames = collectScreenshotNames(new Map(currentCatalogues));
    const newScreenshotNames = collectScreenshotNames(mergedCatalogues);
    const uploadedNames = new Set(screenshots.map(item => item.name));
    const deletedScreenshotNames = [...oldScreenshotNames].filter(name => !newScreenshotNames.has(name) && !uploadedNames.has(name));

    const imageEntries = [];
    for (const item of screenshots) {
      const blob = await github("/repos/" + REPO + "/git/blobs", env, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: item.base64, encoding: "base64" })
      });
      imageEntries.push({ path: "assets/images/screenshots/" + item.name, mode: "100644", type: "blob", sha: blob.sha });
    }
    const tree = await github("/repos/" + REPO + "/git/trees", env, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        base_tree: parent.tree.sha,
        tree: [
          ...entries.map(([path, data]) => ({
            path, mode: "100644", type: "blob", content: JSON.stringify(data, null, 2) + "\n"
          })),
          ...imageEntries,
          ...deletedScreenshotNames.map(name => ({
            path: "assets/images/screenshots/" + name, mode: "100644", type: "blob", sha: null
          }))
        ]
      })
    });
    const commit = await github("/repos/" + REPO + "/git/commits", env, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: typeof body.message === "string" && body.message.trim() ? body.message.trim().slice(0, 120) : "Update catalogue via AppsFeature Admin", tree: tree.sha, parents: [parent.sha] })
    });
    await github("/repos/" + REPO + "/git/refs/heads/" + branch, env, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sha: commit.sha, force: false })
    });
    return reply({ ok: true, branch, commit: commit.sha, files: [...entries.map(([path]) => path), ...imageEntries.map(item => item.path)], deletedScreenshots: deletedScreenshotNames.map(name => "assets/images/screenshots/" + name) });
  } catch (error) { return fail(error.message, 502); }
}
