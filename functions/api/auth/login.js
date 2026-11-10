import { reply, fail, createSession, sessionCookie, sameOrigin, loginAttemptKey } from "../../_lib/admin.js";
const MAX_ATTEMPTS = 5;
const WINDOW_SECONDS = 15 * 60;

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return fail("Request origin rejected.", 403);
  if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET || !env.GITHUB_TOKEN || !env.ADMIN_SECURITY) {
    return fail("Admin backend secrets or security storage are not configured yet.", 503);
  }
  const length = Number(request.headers.get("Content-Length") || 0);
  if (length > 4096) return fail("Request is too large.", 413);
  let body;
  try { body = await request.json(); } catch (_) { return fail("Invalid request body."); }
  const supplied = typeof body.password === "string" ? body.password : "";
  if (supplied.length > 1024) return fail("Invalid admin password.", 401);

  const key = await loginAttemptKey(request);
  const current = await env.ADMIN_SECURITY.get(key);
  let attempts = 0;
  if (current) {
    try { attempts = Math.max(0, Number(JSON.parse(current).count) || 0); } catch (_) {}
  }
  if (attempts >= MAX_ATTEMPTS) {
    return fail("Too many failed login attempts. Try again after 15 minutes.", 429, { "retry-after": String(WINDOW_SECONDS) });
  }

  const expected = env.ADMIN_PASSWORD;
  let diff = supplied.length ^ expected.length;
  const size = Math.max(supplied.length, expected.length);
  for (let i = 0; i < size; i++) diff |= (supplied.charCodeAt(i) || 0) ^ (expected.charCodeAt(i) || 0);
  if (diff !== 0) {
    attempts += 1;
    await env.ADMIN_SECURITY.put(key, JSON.stringify({ count: attempts }), { expirationTtl: WINDOW_SECONDS });
    if (attempts >= MAX_ATTEMPTS) {
      return fail("Too many failed login attempts. Try again after 15 minutes.", 429, { "retry-after": String(WINDOW_SECONDS) });
    }
    return fail("Incorrect admin password. " + (MAX_ATTEMPTS - attempts) + " attempts remaining before temporary lockout.", 401);
  }

  await env.ADMIN_SECURITY.delete(key);
  const session = await createSession(env);
  return reply({ ok: true }, 200, { "set-cookie": sessionCookie(session) });
}
