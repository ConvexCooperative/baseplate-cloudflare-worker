/** @type {import('@types/babel__core').TransformOptions} */
const config = {
  presets: ["@babel/preset-typescript", ["@babel/preset-env"]],
  env: {
    test: {
      presets: [
        [
          "@babel/preset-typescript",
          {
            modules: false,
          },
        ],
      ],
    },
  },
};

module.exports = config;
