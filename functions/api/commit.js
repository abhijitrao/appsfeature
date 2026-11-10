import { reply, fail, isAuthenticated, sameOrigin, CATALOGUE_PATHS, validateCatalogue, github, REPO, BRANCH } from "../_lib/admin.js";
export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return fail("Request origin rejected.", 403);
  if (!await isAuthenticated(request, env)) return fail("Authentication required.", 401);
  let body;
  try { body = await request.json(); } catch (_) { return fail("Invalid JSON request."); }
  if (!body || typeof body.files !== "object" || Array.isArray(body.files)) return fail("No catalogue changes supplied.");
  const entries = Object.entries(body.files);
  if (!entries.length || entries.length > CATALOGUE_PATHS.length) return fail("Invalid number of changed files.");
  try {
    for (const [path, data] of entries) validateCatalogue(path, data);
    const ref = await github("/repos/" + REPO + "/git/ref/heads/" + BRANCH, env);
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
    await github("/repos/" + REPO + "/git/refs/heads/" + BRANCH, env, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sha: commit.sha, force: false })
    });
    return reply({ ok: true, branch: BRANCH, commit: commit.sha, files: entries.map(([path]) => path) });
  } catch (error) { return fail(error.message, 502); }
}
