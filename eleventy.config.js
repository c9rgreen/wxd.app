import eleventyNavigationPlugin from "@11ty/eleventy-navigation";

export default function (eleventyConfig) {
  // Configure Liquid
  eleventyConfig.setLiquidOptions({
    dynamicPartials: true,
    strictFilters: true,
  });

  // Navigation plugin
  eleventyConfig.addPlugin(eleventyNavigationPlugin);

  // Assets
  eleventyConfig.addPassthroughCopy("assets");

  // Sanitize.css
  eleventyConfig.addPassthroughCopy({
    "node_modules/sanitize.css/sanitize.css": "assets/styles/sanitize.css",
    "node_modules/sanitize.css/system-ui.css": "assets/styles/system-ui.css",
    "node_modules/sanitize.css/typography.css": "assets/styles/typography.css",
    "node_modules/sanitize.css/ui-monospace.css":
      "assets/styles/ui-monospace.css",
  });

  // DayJS
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

  // LeafletJS
  eleventyConfig.addPassthroughCopy({
    "node_modules/leaflet/dist/leaflet.js": "assets/scripts/leaflet.js",
  });
  eleventyConfig.addPassthroughCopy({
    "node_modules/leaflet/dist/leaflet.js.map": "assets/scripts/leaflet.js.map",
  });
  eleventyConfig.addPassthroughCopy({
    "node_modules/leaflet/dist/leaflet.css": "assets/styles/leaflet.css",
  });

  // Weather Offices
  eleventyConfig.addPassthroughCopy({
    "_data/offices.json": "assets/data/offices.json",
  });

  // Icons and more
  eleventyConfig.addPassthroughCopy({ "_header/**/*": "/" });
}
