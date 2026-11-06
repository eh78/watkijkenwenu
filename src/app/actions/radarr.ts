"use server";

import {
  clearCookieConfig,
  getRadarrConfig,
  isUiSetupEnabled,
  saveCookieConfig,
  withDefaults,
} from "@/lib/integrations/radarr-config";
import {
  RadarrError,
  addMovie,
  getMovieState,
  inspectRadarr,
  normalizeRadarrUrl,
  type RadarrMovieState,
  type RadarrQualityProfile,
  type RadarrRootFolder,
} from "@/lib/integrations/radarr";

type Fail = { ok: false; error: string };

const fail = (e: unknown): Fail => {
  if (e instanceof RadarrError) return { ok: false, error: e.message };
  console.error(e);
  return { ok: false, error: "Er ging iets mis bij het verbinden met Radarr." };
};

const isTmdbId = (id: unknown): id is number => Number.isInteger(id) && (id as number) > 0;

// ---------------------------------------------------------------------------
// Instellingen
// ---------------------------------------------------------------------------

export interface RadarrSettingsView {
  source: "env" | "cookie" | null;
  uiSetupEnabled: boolean;
  url: string;
  hasApiKey: boolean;
  qualityProfileId: number;
  rootFolderPath: string;
  searchOnAdd: boolean;
}

/** Huidige instellingen, zonder de API-sleutel zelf. */
export async function getRadarrSettings(): Promise<RadarrSettingsView> {
  const current = await getRadarrConfig();
  return {
    source: current?.source ?? null,
    uiSetupEnabled: isUiSetupEnabled(),
    url: current?.config.url ?? "",
    hasApiKey: Boolean(current?.config.apiKey),
    qualityProfileId: current?.config.qualityProfileId ?? 0,
    rootFolderPath: current?.config.rootFolderPath ?? "",
    searchOnAdd: current?.config.searchOnAdd ?? true,
  };
}

export type RadarrTestResult =
  | { ok: true; version: string; qualityProfiles: RadarrQualityProfile[]; rootFolders: RadarrRootFolder[] }
  | Fail;

/**
 * Bepaalt welke API-sleutel gebruikt wordt: de ingevoerde, of (als het veld leeg
 * is) de al opgeslagen sleutel, zodat je die niet opnieuw hoeft te plakken.
 */
async function resolveApiKey(apiKey: string) {
  if (apiKey.trim()) return apiKey.trim();
  const current = await getRadarrConfig();
  if (current?.source === "cookie") return current.config.apiKey;
  throw new RadarrError("Vul de API-sleutel in.");
}

export async function testRadarrConnection(input: { url: string; apiKey: string }): Promise<RadarrTestResult> {
  if (!isUiSetupEnabled()) return { ok: false, error: "Instellen via de website staat uit op deze server." };
  try {
    const url = normalizeRadarrUrl(String(input.url ?? ""));
    const apiKey = await resolveApiKey(String(input.apiKey ?? ""));
    return { ok: true, ...(await inspectRadarr({ url, apiKey })) };
  } catch (e) {
    return fail(e);
  }
}

export async function saveRadarrSettings(input: {
  url: string;
  apiKey: string;
  qualityProfileId: number;
  rootFolderPath: string;
  searchOnAdd: boolean;
}): Promise<{ ok: true } | Fail> {
  if (!isUiSetupEnabled()) return { ok: false, error: "Instellen via de website staat uit op deze server." };
  try {
    const url = normalizeRadarrUrl(String(input.url ?? ""));
    const apiKey = await resolveApiKey(String(input.apiKey ?? ""));
    // Opnieuw valideren tegen Radarr zelf, zodat er nooit een kapotte configuratie wordt opgeslagen.
    const info = await inspectRadarr({ url, apiKey });
    if (!info.qualityProfiles.some((p) => p.id === Number(input.qualityProfileId))) {
      return { ok: false, error: "Kies een kwaliteitsprofiel." };
    }
    if (!info.rootFolders.some((f) => f.path === input.rootFolderPath)) {
      return { ok: false, error: "Kies een map." };
    }
    await saveCookieConfig({
      url,
      apiKey,
      qualityProfileId: Number(input.qualityProfileId),
      rootFolderPath: input.rootFolderPath,
      searchOnAdd: Boolean(input.searchOnAdd),
    });
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function removeRadarrSettings(): Promise<{ ok: true }> {
  await clearCookieConfig();
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Filmpagina
// ---------------------------------------------------------------------------

export type RadarrMovieStatus =
  | { configured: false; canSetup: boolean }
  | { configured: true; ok: true; state: RadarrMovieState; link: string | null }
  | ({ configured: true } & Fail);

export async function getRadarrMovieStatus(tmdbId: number): Promise<RadarrMovieStatus> {
  const current = await getRadarrConfig();
  if (!current) return { configured: false, canSetup: isUiSetupEnabled() };
  if (!isTmdbId(tmdbId)) return { configured: true, ok: false, error: "Ongeldige film." };
  try {
    return { configured: true, ok: true, ...(await getMovieState(current.config, tmdbId)) };
  } catch (e) {
    return { configured: true, ...fail(e) };
  }
}

export async function addMovieToRadarr(tmdbId: number): Promise<{ ok: true; link: string; searching: boolean } | Fail> {
  const current = await getRadarrConfig();
  if (!current) return { ok: false, error: "Radarr is nog niet ingesteld." };
  if (!isTmdbId(tmdbId)) return { ok: false, error: "Ongeldige film." };
  try {
    const config = await withDefaults(current.config);
    const { link } = await addMovie(config, tmdbId);
    return { ok: true, link, searching: config.searchOnAdd };
  } catch (e) {
    return fail(e);
  }
}
