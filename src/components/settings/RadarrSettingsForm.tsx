"use client";

import { useEffect, useState, useTransition } from "react";
import {
  getRadarrSettings,
  removeRadarrSettings,
  saveRadarrSettings,
  testRadarrConnection,
  type RadarrSettingsView,
  type RadarrTestResult,
} from "@/app/actions/radarr";

type Options = Extract<RadarrTestResult, { ok: true }>;

const input =
  "w-full rounded-lg border border-muted/30 bg-bg px-3 py-2 text-fg outline-none placeholder:text-muted/60 focus:border-accent";
const label = "mb-1 block text-sm font-medium";
const btn = "rounded-full px-5 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

const formatBytes = (bytes?: number) => (bytes ? `${(bytes / 1024 ** 4).toFixed(1)} TB vrij` : "");

export function RadarrSettingsForm() {
  const [settings, setSettings] = useState<RadarrSettingsView | null>(null);
  const [url, setUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [options, setOptions] = useState<Options | null>(null);
  const [profileId, setProfileId] = useState(0);
  const [rootFolder, setRootFolder] = useState("");
  const [searchOnAdd, setSearchOnAdd] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [busy, startBusy] = useTransition();

  function applyOptions(result: Options, preferProfile: number, preferFolder: string) {
    setOptions(result);
    setProfileId(result.qualityProfiles.some((p) => p.id === preferProfile) ? preferProfile : (result.qualityProfiles[0]?.id ?? 0));
    setRootFolder(result.rootFolders.some((f) => f.path === preferFolder) ? preferFolder : (result.rootFolders[0]?.path ?? ""));
  }

  // Huidige instellingen laden; bij een opgeslagen koppeling meteen de keuzes ophalen.
  useEffect(() => {
    getRadarrSettings().then(async (s) => {
      setSettings(s);
      setUrl(s.url);
      setSearchOnAdd(s.searchOnAdd);
      if (s.source === "cookie") {
        const result = await testRadarrConnection({ url: s.url, apiKey: "" });
        if (result.ok) applyOptions(result, s.qualityProfileId, s.rootFolderPath);
        else setFeedback({ type: "error", text: result.error });
      }
    });
  }, []);

  function onTest() {
    startBusy(async () => {
      setFeedback(null);
      const result = await testRadarrConnection({ url, apiKey });
      if (!result.ok) {
        setOptions(null);
        setFeedback({ type: "error", text: result.error });
        return;
      }
      applyOptions(result, profileId || settings?.qualityProfileId || 0, rootFolder || settings?.rootFolderPath || "");
      setFeedback({ type: "ok", text: `Verbonden met Radarr ${result.version}. Kies hieronder profiel en map en sla op.` });
    });
  }

  function onSave() {
    startBusy(async () => {
      setFeedback(null);
      const result = await saveRadarrSettings({ url, apiKey, qualityProfileId: profileId, rootFolderPath: rootFolder, searchOnAdd });
      if (!result.ok) {
        setFeedback({ type: "error", text: result.error });
        return;
      }
      setApiKey("");
      setSettings(await getRadarrSettings());
      setFeedback({ type: "ok", text: "Opgeslagen. Op elke filmpagina staat nu een Radarr-knop." });
    });
  }

  function onRemove() {
    startBusy(async () => {
      await removeRadarrSettings();
      setSettings(await getRadarrSettings());
      setUrl("");
      setApiKey("");
      setOptions(null);
      setFeedback({ type: "ok", text: "Koppeling verwijderd." });
    });
  }

  return (
    <section className="mt-8 rounded-2xl border border-muted/20 bg-surface/60 p-6">
      <header className="mb-5">
        <h2 className="text-xl font-semibold">Radarr</h2>
        <p className="mt-1 text-sm text-muted">
          Koppel je eigen Radarr, dan kun je een gekozen film met één klik aan je downloadlijst toevoegen.
        </p>
      </header>

      {!settings ? (
        <div className="h-40 animate-pulse rounded-lg bg-bg/60" />
      ) : settings.source === "env" ? (
        <p className="text-sm">
          Radarr is door de beheerder ingesteld via de server (<code>RADARR_URL</code>), op{" "}
          <span className="font-mono">{settings.url}</span>. Aanpassen kan in de environment-variabelen.
        </p>
      ) : !settings.uiSetupEnabled ? (
        <p className="text-sm text-muted">
          Instellen via de website staat uit op deze server. De beheerder kan Radarr koppelen met de
          environment-variabelen <code>RADARR_URL</code> en <code>RADARR_API_KEY</code>.
        </p>
      ) : (
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (options) onSave();
            else onTest();
          }}
        >
          <div>
            <label htmlFor="radarr-url" className={label}>
              Adres van Radarr
            </label>
            <input
              id="radarr-url"
              className={input}
              placeholder="http://192.168.1.10:7878"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setOptions(null);
              }}
              inputMode="url"
              autoComplete="off"
              required
            />
          </div>

          <div>
            <label htmlFor="radarr-key" className={label}>
              API-sleutel
            </label>
            <input
              id="radarr-key"
              className={`${input} font-mono`}
              type="password"
              placeholder={settings.hasApiKey ? "•••••••• (opgeslagen, laat leeg om te behouden)" : "Radarr → Settings → General → API Key"}
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setOptions(null);
              }}
              autoComplete="off"
              required={!settings.hasApiKey}
            />
          </div>

          {options && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="radarr-profile" className={label}>
                  Kwaliteitsprofiel
                </label>
                <select id="radarr-profile" className={input} value={profileId} onChange={(e) => setProfileId(Number(e.target.value))}>
                  {options.qualityProfiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="radarr-folder" className={label}>
                  Map
                </label>
                <select id="radarr-folder" className={input} value={rootFolder} onChange={(e) => setRootFolder(e.target.value)}>
                  {options.rootFolders.length === 0 && <option value="">Geen mappen ingesteld in Radarr</option>}
                  {options.rootFolders.map((f) => (
                    <option key={f.id} value={f.path}>
                      {f.path} {formatBytes(f.freeSpace) && `(${formatBytes(f.freeSpace)})`}
                    </option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input type="checkbox" checked={searchOnAdd} onChange={(e) => setSearchOnAdd(e.target.checked)} className="size-4 accent-[var(--accent)]" />
                Direct laten zoeken na toevoegen
              </label>
            </div>
          )}

          {feedback && (
            <p role={feedback.type === "error" ? "alert" : "status"} className={`text-sm ${feedback.type === "error" ? "text-accent-2" : "text-accent"}`}>
              {feedback.text}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={onTest} disabled={busy || !url} className={`${btn} border border-muted/40 hover:border-accent`}>
              {busy && !options ? "Testen…" : "Verbinding testen"}
            </button>
            <button type="submit" disabled={busy || !options || !rootFolder} className={`${btn} bg-accent text-bg hover:brightness-110`}>
              Opslaan
            </button>
            {settings.source === "cookie" && (
              <button type="button" onClick={onRemove} disabled={busy} className={`${btn} ml-auto text-muted hover:text-accent-2`}>
                Koppeling verwijderen
              </button>
            )}
          </div>

          <p className="text-xs leading-relaxed text-muted">
            De verbinding loopt via de server van deze app, niet via je browser. Draai je de app op je eigen
            computer, dan werkt een adres in je thuisnetwerk. Een online gehoste versie kan je thuisnetwerk
            meestal niet bereiken. De API-sleutel wordt in een beveiligde cookie in deze browser bewaard.
          </p>
        </form>
      )}
    </section>
  );
}
