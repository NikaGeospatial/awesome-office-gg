import { defineConfig } from "astro/config";

// Deployed to GitHub Pages at https://nikageospatial.github.io/awesome-office-gg/
export default defineConfig({
  site: "https://nikageospatial.github.io",
  base: "/awesome-office-gg",
  output: "static",
  trailingSlash: "ignore",
  build: { format: "directory" },
});
