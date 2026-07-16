const BASE = "/api";

function getToken() {
  return localStorage.getItem("token");
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
}

export const api = {
  login: (username, password) => request("/auth/login", { method: "POST", body: { username, password }, auth: false }),
  me: () => request("/auth/me"),
  listUsers: () => request("/auth/users"),
  createUser: (payload) => request("/auth/users", { method: "POST", body: payload }),

  listAssets: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/assets${qs ? `?${qs}` : ""}`);
  },
  getStats: () => request("/assets/stats"),
  getAsset: (id) => request(`/assets/${id}`),
  createAsset: (payload) => request("/assets", { method: "POST", body: payload }),
  advanceAsset: (id, note) => request(`/assets/${id}/advance`, { method: "POST", body: { note } }),
  getCertificate: (id) => request(`/assets/${id}/certificate`),
  deleteAsset: (id) => request(`/assets/${id}`, { method: "DELETE" }),
};
