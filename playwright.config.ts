import { defineConfig, devices } from "@playwright/test";
import path from "node:path";
process.env.PLAYWRIGHT_BROWSERS_PATH ||= path.resolve(".cache/playwright");
export default defineConfig({
  testDir: "tests/browser",
  workers: 1,
  use: { baseURL: "http://127.0.0.1:4173", trace: "retain-on-failure" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    {
      name: "webkit",
      use: {
        ...devices["iPad (gen 7)"],
        viewport: { width: 1180, height: 820 },
      },
    },
  ],
  webServer: {
    command: "npm run test:preview",
    port: 4173,
    reuseExistingServer: false,
    timeout: 60000,
  },
});
