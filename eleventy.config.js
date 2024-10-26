import eleventy from "@11ty/eleventy";

export default function (eleventyConfig) {
  // Configure Liquid
  eleventyConfig.setLiquidOptions({
    dynamicPartials: true,
    strictFilters: true,
  });

  // Styles
  eleventyConfig.addPassthroughCopy("assets/styles/main.css");

  eleventyConfig.addPassthroughCopy({
    "node_modules/sanitize.css/sanitize.css": "assets/styles/sanitize.css",
    "node_modules/sanitize.css/system-ui.css": "assets/styles/system-ui.css",
    "node_modules/sanitize.css/typography.css": "assets/styles/typography.css",
    "node_modules/sanitize.css/ui-monospace.css":
      "assets/styles/ui-monospace.css",
  });

  // Scripts
  eleventyConfig.addPassthroughCopy("assets/scripts/main.js");
  eleventyConfig.addPassthroughCopy({
    "node_modules/dayjs/dayjs.min.js": "assets/scripts/dayjs.min.js",
  });
  eleventyConfig.addPassthroughCopy({
    "node_modules/dayjs/plugin/utc.js": "assets/scripts/utc.js",
  });
  eleventyConfig.addPassthroughCopy({
    "node_modules/dayjs/plugin/timezone.js": "assets/scripts/timezone.js",
  });
  eleventyConfig.addPassthroughCopy({
    "node_modules/dayjs/plugin/customParseFormat.js":
      "assets/scripts/customParseFormat.js",
  });
}
