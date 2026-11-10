import { reply, clearSessionCookie, sameOrigin } from "../../_lib/admin.js";
export async function onRequestPost({ request }) {
  if (!sameOrigin(request)) return new Response("Forbidden", { status: 403 });
  return reply({ ok: true }, 200, { "set-cookie": clearSessionCookie() });
}
