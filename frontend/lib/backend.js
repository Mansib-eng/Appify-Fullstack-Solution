const BACKEND_URL = process.env.BACKEND_URL?.replace(/\/$/, "");

if (!BACKEND_URL) {
  console.warn("BACKEND_URL is not set. Add it to your environment variables.");
}

export async function callBackend(path, options = {}) {
  const url = `${BACKEND_URL}${path}`;
  return fetch(url, {
    ...options,
    cache: "no-store",
  });
}

export async function callBackendWithToken(path, token, options = {}) {
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const url = `${BACKEND_URL}${path}`;
  return fetch(url, {
    ...options,
    headers,
    cache: "no-store",
  });
}