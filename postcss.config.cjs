// postcss.config.cjs

const { default: purgeCss } = require("@fullhuman/postcss-purgecss");
module.exports = {
  plugins: [
    process.env.NODE_ENV === "production"
      ? purgeCss({
          content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
          safelist: {
            standard: ["body", "html"],
            deep: [/ant-.*/, /rc-.*/],
          },
          defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
        })
      : undefined,
  ],
};
