const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = {
  ...config,
  transformer: {
    ...config.transformer,
    minifierPath: 'metro-minify-terser',
    minifierConfig: {
      compress: {
        drop_console: false, // Keep console for debugging
        drop_debugger: true,
      },
      mangle: {
        keep_fnames: true, // Keep function names to prevent crashes
      },
      output: {
        comments: false,
      },
    },
  },
};
