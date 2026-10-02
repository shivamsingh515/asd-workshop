const cache = new Map();
const TTL_MS = 60000;

function cacheMiddleware(req, res, next) {
  if (req.method !== 'GET') {
    return next();
  }

  const key = req.originalUrl;
  const now = Date.now();
  const entry = cache.get(key);

  if (entry) {
    if (now - entry.createdAt < TTL_MS) {
      const ageSeconds = Math.floor((now - entry.createdAt) / 1000);
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Cache-Age', String(ageSeconds));
      if (typeof entry.body === 'string') {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        return res.status(entry.status).send(entry.body);
      }
      return res.status(entry.status).json(entry.body);
    }
    cache.delete(key);
  }

  res.setHeader('X-Cache', 'MISS');

  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);
  let captured = false;

  res.json = function (body) {
    if (!captured && res.statusCode === 200) {
      captured = true;
      cache.set(key, {
        body,
        status: res.statusCode,
        createdAt: Date.now()
      });
    }
    return originalJson(body);
  };

  res.send = function (body) {
    if (!captured && res.statusCode === 200) {
      captured = true;
      let parsedBody = body;
      if (typeof body === 'string') {
        try {
          parsedBody = JSON.parse(body);
        } catch {
          parsedBody = body;
        }
      }
      cache.set(key, {
        body: parsedBody,
        status: res.statusCode,
        createdAt: Date.now()
      });
    }
    return originalSend(body);
  };

  next();
}

function invalidateCache(req, res, next) {
  res.on('finish', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      cache.clear();
    }
  });
  next();
}

module.exports = {
  cacheMiddleware,
  invalidateCache,
  cache
};

