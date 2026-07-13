import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  outputDir: "test-results",
  reporter: "line",
  use: {
    baseURL: "http://127.0.0.1:4174",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run dev -- -H 127.0.0.1 -p 4174",
    url: "http://127.0.0.1:4174",
    env: { LOCAL_PREVIEW: "1" },
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
