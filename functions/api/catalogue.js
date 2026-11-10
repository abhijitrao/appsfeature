import { reply, fail, isAuthenticated, CATALOGUE_PATHS, github, REPO, BRANCH } from "../_lib/admin.js";
export async function onRequestGet({ request, env }) {
  if (!await isAuthenticated(request, env)) return fail("Authentication required.", 401);
  try {
    const files = {};
    for (const path of CATALOGUE_PATHS) {
      const item = await github("/repos/" + REPO + "/contents/" + path + "?ref=" + BRANCH, env);
      const binary = atob(item.content.replace(/\n/g, ""));
      const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
      files[path] = JSON.parse(new TextDecoder().decode(bytes));
    }
    return reply({ branch: BRANCH, files });
  } catch (error) { return fail(error.message, 502); }
}
