import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { describe, it, expect } from "vitest";
import { resolveLogosPaths } from "../src/config.js";

describe("resolveLogosPaths", () => {
  it("prefers explicit environment overrides", () => {
    const env = {
      LOGOS_DATA_DIR: "/custom/data",
      LOGOS_CATALOG_DIR: "/custom/catalog",
    };
    const paths = resolveLogosPaths({ platform: "win32", homeDir: "/home/user", env });
    expect(paths).toEqual({ dataDir: "/custom/data", catalogDir: "/custom/catalog" });
  });

  it("detects Windows instance directories from LOCALAPPDATA", () => {
    const root = mkdtempSync(join(tmpdir(), "logos-win-"));
    const localAppData = join(root, "AppData", "Local");
    const instanceId = "abcd1234.w14";
    const dataInstance = join(localAppData, "Logos", "Documents", instanceId);
    const catalogInstance = join(localAppData, "Logos", "Data", instanceId);

    mkdirSync(join(dataInstance, "VisualMarkup"), { recursive: true });
    writeFileSync(join(dataInstance, "VisualMarkup", "visualmarkup.db"), "");
    mkdirSync(join(catalogInstance, "LibraryCatalog"), { recursive: true });
    writeFileSync(join(catalogInstance, "LibraryCatalog", "catalog.db"), "");

    const env = { LOCALAPPDATA: localAppData };
    const paths = resolveLogosPaths({ platform: "win32", homeDir: root, env });

    expect(paths.dataDir).toBe(dataInstance);
    expect(paths.catalogDir).toBe(catalogInstance);

    rmSync(root, { recursive: true, force: true });
  });

  it("falls back to macOS default roots when not on Windows", () => {
    const homeDir = "/Users/tester";
    const paths = resolveLogosPaths({ platform: "darwin", homeDir, env: {} });

    expect(paths.dataDir).toBe(
      join(homeDir, "Library", "Application Support", "Logos4", "Documents", "a3wo155q.w14")
    );
    expect(paths.catalogDir).toBe(
      join(homeDir, "Library", "Application Support", "Logos4", "Data", "a3wo155q.w14")
    );
  });
});
