const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '../dist');

fs.access(distDir, (err) => {
  if (err && err.code === 'ENOENT') {
    fs.mkdirSync(distDir);
  }
  fs.writeFileSync(
    path.resolve(__dirname, '../dist/config.js'),
    'window.extraConfig = { platform: "PLATFORM_API", ws: "WS_API" }',
  );
});
