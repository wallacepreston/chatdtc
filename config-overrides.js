const { override, addBabelPreset } = require('customize-cra');

module.exports = override(
  addBabelPreset('@babel/preset-env', {
    targets: {
      browsers: [
        'last 2 versions',
        'ie >= 11',
        'Safari >= 15.2',
      ],
    },
  }),
);
