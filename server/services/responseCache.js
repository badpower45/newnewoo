const cacheStore = new Map();
const inflight = new Map();

const MAX_ENTRIES = 500;

export const CacheTTL = {
  SHORT: 60 * 1000,      // 1 minute
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 30 * 60 * 1000   // 30 minutes
};

const now = () => Date.now();

const pruneIfNeeded = () => {
  if (cacheStore.size <= MAX_ENTRIES) return;
  const oldestKey = cacheStore.keys().next().value;
  if (oldestKey) {
    cacheStore.delete(oldestKey);
  }
};

const isValid = (entry) => entry && entry.expiresAt > now();

const get = (key) => {
  const entry = cacheStore.get(key);
  if (!isValid(entry)) {
    cacheStore.delete(key);
    return null;
  }
  return entry.value;
};

const set = (key, value, ttlMs) => {
  cacheStore.set(key, {
    value,
    expiresAt: now() + (ttlMs || CacheTTL.MEDIUM)
  });
  pruneIfNeeded();
};

const getOrSet = async (key, ttlMs, fetcher) => {
  const cached = get(key);
  if (cached) return cached;

  if (inflight.has(key)) {
    return inflight.get(key);
  }

  const pending = (async () => {
    const value = await fetcher();
    set(key, value, ttlMs);
    return value;
  })();

  inflight.set(key, pending);

  try {
    return await pending;
  } finally {
    inflight.delete(key);
  }
};

const del = (key) => {
  cacheStore.delete(key);
};

const clear = () => {
  cacheStore.clear();
  inflight.clear();
};

export const responseCache = {
  get,
  set,
  getOrSet,
  del,
  clear
};
