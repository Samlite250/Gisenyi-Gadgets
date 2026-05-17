const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = {
  ...config,
  transformer: {
    ...config.transformer,
    minifierPath: 'metro-minify-terser',
    minifierConfig: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.info', 'console.debug', 'console.warn'],
      },
      mangle: {
        keep_fnames: false,
      },
      output: {
        comments: false,
        ascii_only: true,
      },
    },
  },
};
