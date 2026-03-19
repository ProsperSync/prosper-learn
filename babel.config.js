module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@': './src',
            '@/lib': './src/lib',
            '@/components': './src/components',
            '@/services': './src/services',
            '@/hooks': './src/hooks',
            '@/store': './src/store',
          },
        },
      ],
    ],
  };
};