import { reply, isAuthenticated } from "../../_lib/admin.js";
export async function onRequestGet({ request, env }) {
  const authenticated = await isAuthenticated(request, env);
  return reply({ authenticated }, authenticated ? 200 : 401);
}
