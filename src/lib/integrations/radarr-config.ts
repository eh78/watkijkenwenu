import "server-only";
import { cookies } from "next/headers";
import { inspectRadarr, normalizeRadarrUrl, type RadarrConfig } from "./radarr";

/**
 * Waar de Radarr-instellingen vandaan komen:
 * 1. Environment-variabelen (RADARR_URL + RADARR_API_KEY): voor wie de app zelf host.
 * 2. Een httpOnly-cookie, ingesteld via /instellingen. Per browser; de API-sleutel
 *    is niet leesbaar voor JavaScript en gaat alleen naar de eigen server.
 *
 * Op een publiek gehoste versie: zet RADARR_UI_SETUP=false, zodat bezoekers de
 * server niet naar willekeurige adressen kunnen laten verbinden.
 */
const COOKIE = "wkwn_radarr";
const ONE_YEAR = 60 * 60 * 24 * 365;

export const isUiSetupEnabled = () => process.env.RADARR_UI_SETUP !== "false";

function fromEnv(): RadarrConfig | null {
  const { RADARR_URL, RADARR_API_KEY } = process.env;
  if (!RADARR_URL || !RADARR_API_KEY) return null;
  return {
    url: normalizeRadarrUrl(RADARR_URL),
    apiKey: RADARR_API_KEY,
    // 0 / leeg = automatisch het eerste profiel / de eerste map uit Radarr gebruiken.
    qualityProfileId: Number(process.env.RADARR_QUALITY_PROFILE_ID) || 0,
    rootFolderPath: process.env.RADARR_ROOT_FOLDER ?? "",
    searchOnAdd: process.env.RADARR_SEARCH_ON_ADD !== "false",
  };
}

async function fromCookie(): Promise<RadarrConfig | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  try {
    const c = JSON.parse(raw) as Partial<RadarrConfig>;
    if (!c.url || !c.apiKey) return null;
    return {
      url: c.url,
      apiKey: c.apiKey,
      qualityProfileId: Number(c.qualityProfileId) || 0,
      rootFolderPath: c.rootFolderPath ?? "",
      searchOnAdd: c.searchOnAdd !== false,
    };
  } catch {
    return null;
  }
}

export async function getRadarrConfig(): Promise<{ config: RadarrConfig; source: "env" | "cookie" } | null> {
  const env = fromEnv();
  if (env) return { config: env, source: "env" };
  if (!isUiSetupEnabled()) return null;
  const cookie = await fromCookie();
  return cookie ? { config: cookie, source: "cookie" } : null;
}

/** Vult een ontbrekend kwaliteitsprofiel of map aan met de eerste uit Radarr. */
export async function withDefaults(config: RadarrConfig): Promise<RadarrConfig> {
  if (config.qualityProfileId && config.rootFolderPath) return config;
  const info = await inspectRadarr(config);
  return {
    ...config,
    qualityProfileId: config.qualityProfileId || info.qualityProfiles[0]?.id || 0,
    rootFolderPath: config.rootFolderPath || info.rootFolders[0]?.path || "",
  };
}

export async function saveCookieConfig(config: RadarrConfig) {
  (await cookies()).set(COOKIE, JSON.stringify(config), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_YEAR,
  });
}

export async function clearCookieConfig() {
  (await cookies()).delete(COOKIE);
}
