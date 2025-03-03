const path = require('path');

module.exports = function override(config, env) {
  // Modify the output path to include the manifest.json file
  if (env === 'production') {
    config.output.path = path.resolve(__dirname, 'build');
  }
  return config;
};