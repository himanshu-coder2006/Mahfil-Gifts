const UNSAFE_KEYS = ['$where', '$gt', '$gte', '$lt', '$lte', '$ne', '$in', '$nin', '$regex', '$exists', '$and', '$or', '$not', '$nor'];

const isPlainObject = (obj) => obj !== null && typeof obj === 'object' && !Array.isArray(obj);

const sanitize = (value) => {
  if (Array.isArray(value)) {
    return value.map(sanitize);
  }

  if (isPlainObject(value)) {
    const cleaned = {};
    for (const [key, val] of Object.entries(value)) {
      if (UNSAFE_KEYS.includes(key)) {
        continue;
      }
      cleaned[key] = sanitize(val);
    }
    return cleaned;
  }

  return value;
};

export const sanitizeMiddleware = (req, res, next) => {
  if (req.body && isPlainObject(req.body)) {
    req.body = sanitize(req.body);
  }
  if (req.query && isPlainObject(req.query)) {
    req.query = sanitize(req.query);
  }
  if (req.params && isPlainObject(req.params)) {
    req.params = sanitize(req.params);
  }
  next();
};
