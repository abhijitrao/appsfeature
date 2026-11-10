import { reply, fail, isAuthenticated, CATALOGUE_PATHS, github, REPO, resolveBranch } from "../_lib/admin.js";
export async function onRequestGet({ request, env }) {
  if (!await isAuthenticated(request, env)) return fail("Authentication required.", 401);
  let branch;
  try { branch = resolveBranch(new URL(request.url).searchParams.get("branch")); }
  catch (error) { return fail(error.message, 400); }
  try {
    const files = {};
    for (const path of CATALOGUE_PATHS) {
      const item = await github("/repos/" + REPO + "/contents/" + path + "?ref=" + branch, env);
      const binary = atob(item.content.replace(/\n/g, ""));
      const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
      files[path] = JSON.parse(new TextDecoder().decode(bytes));
    }
    return reply({ branch, files });
  } catch (error) { return fail(error.message, 502); }
}
