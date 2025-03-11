// utils/cache.js
const NodeCache = require('node-cache');
const { getImageMetadata } = require('./imageMetadata');

const metadataCache = new NodeCache({ stdTTL: 3600 }); // 1 hour TTL

const getCachedMetadata = async (folderPath) => {
  const cached = metadataCache.get(folderPath);
  return cached || null;
};

const cacheMetadata = async (folderPath, metadata) => {
  metadataCache.set(folderPath, metadata);
};

const clearCache = (folderPath) => {
  metadataCache.del(folderPath);
};

module.exports = {
  getCachedMetadata,
  cacheMetadata,
  clearCache
};