import { reply, fail, isAuthenticated, sameOrigin, CATALOGUE_PATHS, validateCatalogue, github, REPO, resolveBranch } from "../_lib/admin.js";
export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return fail("Request origin rejected.", 403);
  if (!await isAuthenticated(request, env)) return fail("Authentication required.", 401);
  const length = Number(request.headers.get("Content-Length") || 0);
  if (length > 200000) return fail("Request is too large.", 413);
  let body;
  try { body = await request.json(); } catch (_) { return fail("Invalid JSON request."); }
  if (!body || typeof body.files !== "object" || Array.isArray(body.files)) return fail("No catalogue changes supplied.");
  let branch;
  try { branch = resolveBranch(body.branch); } catch (error) { return fail(error.message, 400); }
  const entries = Object.entries(body.files);
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
    const tree = await github("/repos/" + REPO + "/git/trees", env, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        base_tree: parent.tree.sha,
        tree: entries.map(([path, data]) => ({
          path, mode: "100644", type: "blob", content: JSON.stringify(data, null, 2) + "\n"
        }))
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
    return reply({ ok: true, branch, commit: commit.sha, files: entries.map(([path]) => path) });
  } catch (error) { return fail(error.message, 502); }
}
