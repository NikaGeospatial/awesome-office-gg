import { defineConfig } from "astro/config";

// Deployed to GitHub Pages, served from the custom domain below (set in the repo's
// Pages settings; DNS is managed at the registrar). A custom domain serves the
// site from its root, so no `base` path.
export default defineConfig({
  site: "https://officegamehour.com",
  output: "static",
  trailingSlash: "ignore",
  build: { format: "directory" },
});
