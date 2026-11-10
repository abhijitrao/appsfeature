import { reply, clearSessionCookie, sameOrigin, revokeSession } from "../../_lib/admin.js";
export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return new Response("Forbidden", { status: 403 });
  try { await revokeSession(request, env); }
  catch (_) { return reply({ error: "Could not revoke the admin session. Please retry." }, 503); }
  return reply({ ok: true }, 200, { "set-cookie": clearSessionCookie() });
}
