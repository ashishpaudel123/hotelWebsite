// Minimal axios-like shim using global fetch (Node 18+)
async function toJSONSafe(res) {
  const text = await res.text().catch(() => null);
  try {
    return text ? JSON.parse(text) : null;
  } catch (e) {
    return text;
  }
}

async function post(url, data, options = {}) {
  const headers = options.headers || {};
  const body =
    headers["Content-Type"] === "application/json" || typeof data === "object"
      ? JSON.stringify(data)
      : data;
  const res = await fetch(url, { method: "POST", headers, body });
  const json = await toJSONSafe(res);
  return { data: json, status: res.status, headers: res.headers };
}

async function get(url, options = {}) {
  const res = await fetch(url, {
    method: "GET",
    headers: options.headers || {},
  });
  const json = await toJSONSafe(res);
  return { data: json, status: res.status, headers: res.headers };
}

module.exports = { post, get };
