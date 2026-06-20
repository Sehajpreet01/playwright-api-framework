const env = process.env.ENV || 'dev';

// Module-level cache — lives for the lifetime of a Playwright worker process
const tokenCache = new Map(); // key → { token, expiresAt }
const inFlight   = new Map(); // key → Promise<string>

async function fetchToken(request, username, password, cacheKey) {
  const cached = tokenCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) return cached.token;

  if (inFlight.has(cacheKey)) return inFlight.get(cacheKey);

  const promise = (async () => {
    const response = await request.post('/oauth/token', {
      form: { grant_type: 'password', username, password },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    if (!response.ok()) {
      throw new Error(`Login failed for ${username} — status ${response.status()}`);
    }

    const data = await response.json();
    tokenCache.set(cacheKey, {
      token:     data.access_token,
      expiresAt: Date.now() + ((data.expires_in || 3600) - 60) * 1000
    });
    return data.access_token;
  })().finally(() => inFlight.delete(cacheKey));

  inFlight.set(cacheKey, promise);
  return promise;
}

// Super / admin user token — cached per worker, fetched once
export function getAuthToken(request) {
  return fetchToken(
    request,
    process.env[`API_USERNAME_${env}`],
    process.env[`API_PASSWORD_${env}`],
    `super_${env}`
  );
}

// Regular / non-privileged user token — cached separately
export function getNonSuperAuthToken(request) {
  return fetchToken(
    request,
    process.env[`NON_SUPER_USERNAME_${env}`],
    process.env[`NON_SUPER_PASSWORD_${env}`],
    `regular_${env}`
  );
}

// No caching — use for throwaway accounts created and deleted within a test
export async function getTokenForUser(request, username, password) {
  const response = await request.post('/oauth/token', {
    form: { grant_type: 'password', username, password },
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  if (!response.ok()) {
    throw new Error(`Login failed for ${username} — status ${response.status()}`);
  }

  const data = await response.json();
  return data.access_token;
}
