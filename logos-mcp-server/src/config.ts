import { existsSync, readdirSync } from "fs";
import { homedir } from "os";
import { join } from "path";

// ─── Logos Data Paths ────────────────────────────────────────────────────────

type Platform = NodeJS.Platform;

interface ResolvePathOptions {
  platform?: Platform;
  homeDir?: string;
  env?: NodeJS.ProcessEnv;
}

const DEFAULT_INSTANCE_ID = "a3wo155q.w14";

function defaultDocumentsRoot(platform: Platform, homeDir: string, env: NodeJS.ProcessEnv): string {
  if (platform === "win32") {
    const localAppData = env.LOCALAPPDATA ?? join(homeDir, "AppData", "Local");
    return join(localAppData, "Logos", "Documents");
  }

  return join(homeDir, "Library", "Application Support", "Logos4", "Documents");
}

function defaultCatalogRoot(platform: Platform, homeDir: string, env: NodeJS.ProcessEnv): string {
  if (platform === "win32") {
    const localAppData = env.LOCALAPPDATA ?? join(homeDir, "AppData", "Local");
    return join(localAppData, "Logos", "Data");
  }

  return join(homeDir, "Library", "Application Support", "Logos4", "Data");
}

function findInstanceDir(root: string, markerSegments: string[]): string | null {
  if (!existsSync(root)) return null;

  const entries = readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(root, entry.name));

  for (const dir of entries) {
    if (existsSync(join(dir, ...markerSegments))) return dir;
  }

  return null;
}

function resolveDefaultInstanceDir(root: string, markerSegments: string[]): string {
  const detected = findInstanceDir(root, markerSegments);
  if (detected) return detected;
  return join(root, DEFAULT_INSTANCE_ID);
}

export function resolveLogosPaths(options: ResolvePathOptions = {}): {
  dataDir: string;
  catalogDir: string;
} {
  const platform = options.platform ?? process.platform;
  const homeDir = options.homeDir ?? homedir();
  const env = options.env ?? process.env;

  const dataRoot = defaultDocumentsRoot(platform, homeDir, env);
  const catalogRoot = defaultCatalogRoot(platform, homeDir, env);

  const dataDir =
    env.LOGOS_DATA_DIR ?? resolveDefaultInstanceDir(dataRoot, ["VisualMarkup", "visualmarkup.db"]);
  const catalogDir =
    env.LOGOS_CATALOG_DIR ?? resolveDefaultInstanceDir(catalogRoot, ["LibraryCatalog", "catalog.db"]);

  return { dataDir, catalogDir };
}

const resolvedPaths = resolveLogosPaths();

export const LOGOS_DATA_DIR = resolvedPaths.dataDir;

// Catalog DB lives under Data/ (not Documents/)
export const LOGOS_CATALOG_DIR = resolvedPaths.catalogDir;

export const DB_PATHS = {
  visualMarkup: join(LOGOS_DATA_DIR, "VisualMarkup", "visualmarkup.db"),
  favorites: join(LOGOS_DATA_DIR, "FavoritesManager", "favorites.db"),
  workflows: join(LOGOS_DATA_DIR, "Workflows", "Workflows.db"),
  readingLists: join(LOGOS_DATA_DIR, "ReadingLists", "ReadingLists.db"),
  shortcuts: join(LOGOS_DATA_DIR, "ShortcutsManager", "shortcuts.db"),
  guides: join(LOGOS_DATA_DIR, "Guides", "guides.db"),
  notes: join(LOGOS_DATA_DIR, "NotesToolManager", "notestool.db"),
  clippings: join(LOGOS_DATA_DIR, "Documents", "Clippings", "Clippings.db"),
  passageLists: join(LOGOS_DATA_DIR, "Documents", "PassageList", "PassageList.db"),
  catalog: join(LOGOS_CATALOG_DIR, "LibraryCatalog", "catalog.db"),
} as const;

// ─── Biblia API ──────────────────────────────────────────────────────────────

export const BIBLIA_API_KEY = process.env.BIBLIA_API_KEY ?? "";
export const BIBLIA_API_BASE = "https://api.biblia.com/v1/bible";
export const DEFAULT_BIBLE = "LEB";

// ─── Logos URL Schemes ───────────────────────────────────────────────────────

export const LOGOS_URL_BASE = "logos4:";

// ─── Server Info ─────────────────────────────────────────────────────────────

export const SERVER_NAME = "logos-bible";
export const SERVER_VERSION = "1.0.0";
