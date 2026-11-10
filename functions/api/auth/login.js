import { reply, fail, createSession, sessionCookie, sameOrigin } from "../../_lib/admin.js";
export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return fail("Request origin rejected.", 403);
  if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET || !env.GITHUB_TOKEN) return fail("Admin backend secrets are not configured yet.", 503);
  let body;
  try { body = await request.json(); } catch (_) { return fail("Invalid request body."); }
  const supplied = typeof body.password === "string" ? body.password : "";
  const expected = env.ADMIN_PASSWORD;
  let diff = supplied.length ^ expected.length;
  const size = Math.max(supplied.length, expected.length);
  for (let i = 0; i < size; i++) diff |= (supplied.charCodeAt(i) || 0) ^ (expected.charCodeAt(i) || 0);
  if (diff !== 0) return fail("Incorrect admin password.", 401);
  const session = await createSession(env);
  return reply({ ok: true }, 200, { "set-cookie": sessionCookie(session) });
}
