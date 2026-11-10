const BRANCH = "feature-admin";
const REPO = "abhijitrao/appsfeature";
export const CATALOGUE_PATHS = [
  "assets/data/common/categories.json",
  "assets/data/android/apps.json",
  "assets/data/android/utilities.json",
  "assets/data/android/developer-tools.json",
  "assets/data/windows/apps.json",
  "assets/data/windows/utilities.json",
  "assets/data/windows/developer-tools.json"
];
const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function reply(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra }
  });
}
export function fail(message, status = 400) { return reply({ error: message }, status); }
export function cookieValue(request, name) {
  const raw = request.headers.get("Cookie") || "";
  const item = raw.split(";").map(v => v.trim()).find(v => v.startsWith(name + "="));
  return item ? item.slice(name.length + 1) : "";
}
function b64url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function fromB64url(value) {
  const normal = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normal + "=".repeat((4 - normal.length % 4) % 4));
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}
async function hmac(value, secret) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value))));
}
function constantEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
export async function createSession(env) {
  const payload = b64url(encoder.encode(JSON.stringify({ exp: Date.now() + 8 * 60 * 60 * 1000, nonce: crypto.randomUUID() })));
  return payload + "." + await hmac(payload, env.SESSION_SECRET);
}
export async function isAuthenticated(request, env) {
  if (!env.SESSION_SECRET) return false;
  const token = cookieValue(request, "af_admin");
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra || !constantEqual(signature, await hmac(payload, env.SESSION_SECRET))) return false;
  try {
    const session = JSON.parse(decoder.decode(fromB64url(payload)));
    return Number.isFinite(session.exp) && session.exp > Date.now();
  } catch (_) { return false; }
}
export function sessionCookie(value) {
  return "af_admin=" + value + "; Path=/; Max-Age=28800; HttpOnly; Secure; SameSite=Strict";
}
export function clearSessionCookie() {
  return "af_admin=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict";
}
export function sameOrigin(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  try { return new URL(origin).host === new URL(request.url).host; } catch (_) { return false; }
}
export async function github(path, env, options = {}) {
  if (!env.GITHUB_TOKEN) throw new Error("GitHub token is not configured in Cloudflare secrets.");
  const response = await fetch("https://api.github.com" + path, {
    ...options,
    headers: {
      "Authorization": "Bearer " + env.GITHUB_TOKEN,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "AppsFeature-Admin",
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "GitHub API request failed (" + response.status + ").");
  return data;
}
export function validateCatalogue(path, data) {
  if (!CATALOGUE_PATHS.includes(path)) throw new Error("This catalogue file is not allowed.");
  if (!Array.isArray(data)) throw new Error(path + " must contain a JSON array.");
  if (path.endsWith("categories.json")) {
    const ids = new Set();
    for (const item of data) {
      if (!item || typeof item.id !== "string" || typeof item.label !== "string" || typeof item.file !== "string") throw new Error("Each category needs id, label and file.");
      if (ids.has(item.id)) throw new Error("Duplicate category id: " + item.id);
      ids.add(item.id);
    }
    return;
  }
  const ids = new Set();
  for (const item of data) {
    if (!item || typeof item !== "object" || Array.isArray(item)) throw new Error(path + " contains an invalid record.");
    for (const key of ["id", "name", "platform", "category"]) if (typeof item[key] !== "string" || !item[key].trim()) throw new Error(path + ": every record needs " + key + ".");
    const platform = path.includes("/android/") ? "android" : "windows";
    if (item.platform !== platform) throw new Error(path + ": record platform must be " + platform + ".");
    if (ids.has(item.id)) throw new Error(path + ": duplicate record id " + item.id + ".");
    ids.add(item.id);
  }
}
export { BRANCH, REPO };
