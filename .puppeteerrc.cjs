const {join} = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Changes the cache location for Puppeteer so Render caches it during builds
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
