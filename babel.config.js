module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      '@babel/plugin-transform-export-namespace-from',
    ],
    env: {
      production: {
        plugins: ['react-native-paper/babel'],
      },
    },
    overrides: [
      {
        test: './node_modules/zustand',
        plugins: [
          ['@babel/plugin-transform-modules-commonjs', { strictMode: false }],
        ],
      },
    ],
  };
};
