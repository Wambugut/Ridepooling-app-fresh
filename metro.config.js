// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  // Keep support for fonts & other assets
  config.resolver.assetExts.push('ttf');

  config.resolver = {
    ...config.resolver,
    extraNodeModules: {
      // Explicit resolution for @babel/runtime (sometimes avoids weird ESM bugs)
      '@babel/runtime': require.resolve('@babel/runtime/package.json'),

      // Always resolve react-native-maps to the native package
      // (Web can use @react-google-maps/api directly, no need for teovilla)
      'react-native-maps': require.resolve('react-native-maps'),
    },
    unstable_enablePackageExports: true,
  };

  return config;
})();
