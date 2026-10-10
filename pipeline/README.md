# Pipeline

The eight scripts that produced the collection in `Mods/`, in the order they ran.
They are kept for reproducibility and audit; nothing here is needed to use the mods.

Every script reads and writes inside its own directory, so run them from `pipeline/`.
Intermediate data files they produced (raw repository lists, artefact dumps, per-repo scan
logs) were deleted after the final verification to keep the workspace small - re-running the
pipeline regenerates them.

## Order and purpose

| # | Script | What it does | Output |
|---|---|---|---|
| 1 | `harvest.py` | Enumerates GitHub repositories. The search API caps any single query at 1,000 results, so it slices each query recursively by `created:` date range until every slice fits, then paginates it fully. Handles the 10-requests/minute unauthenticated limit with backoff. Resumable: it appends and de-duplicates. | repository metadata list (6,224 repos) |
| 2 | `classify.py` | Scores each repository on how likely it is to hold mods rather than a plain vanilla re-host: +2 per mod keyword (client, mod, hack, shader, texture, pack, launcher, inject, forge, hud, xray, ...), -1 per hosting/server/tutorial keyword, -10 if the repo is empty, -2 for anonymous re-hosts. | the same list with a `_score` field, sorted |
| 3 | `survey.py` | The heavy step. Streams each repository's tarball from `codeload.github.com` (no API quota) and inspects entries one pass, without saving the archive. Classifies every file (`eaglerforge_mod`, `resource_pack`, `shader_pack`, `pack_zip`, `client_build`, or skip), reads `.js` candidates to confirm they really contain `ModAPI`/`PluginAPI`/`EaglerReborn`/userscript markers, and stages the small ones to disk. Skips dependency jars via a library blocklist, and skips `node_modules`, `libs`, `build`, minified and map files. Has per-repo and global byte budgets, a time budget, a worker pool, and a resume log. Modes: `SCAN_MODE=scored` (best candidates first), `SCAN_MODE=small` (long tail), `REPOS_ONLY=a,b,c` (specific repos), `SORT_ASC=1`. | artefact records: repo, path, size, kind, sha, staged file, direct URL |
| 4 | `add_repos.py` | Targeted scanner for repositories the automated passes missed - ones supplied by hand, or found from an author's repository list. Same streaming logic, but it also accepts files with **no extension** (`Barneys Music Player`, `USSR Mod`) and marks them by content instead of filename. Fetches repository metadata from the API for repos that were never harvested. | extra artefact records |
| 5 | `catalog.py` | Turns raw artefacts into a catalogue. Opens every staged file to validate it: a real EaglerForge mod must contain `ModAPI.` plus either `ModAPI.meta` or `ModAPI.hooks/reflect/events`; zips are opened to tell a resource pack (`pack.mcmeta`) from a shader pack (`.fsh`/`.vsh`) from a jar-in-zip; jars are dropped if they match the dependency blocklist; base-game HTML builds are separated from client mods. Extracts each mod's real title, description, credits and version from its `ModAPI.meta.*` calls. De-duplicates by content sha256, falling back to (name, size). | catalogue with tiers and extracted metadata |
| 6 | `fetch.py` | Downloads the catalogue entries that were recorded but never staged, smallest first, through their direct `raw.githubusercontent.com` links, under a byte budget. Then de-duplicates again on real content hashes, because files that were only known by name often turn out to be identical. | every small mod present on local disk |
| 7 | `extract_js2.py` | The `.js`-only gate and the de-duplicator. Accepts a file only if its **content** proves it is a mod, never its filename, so mods called `plugin.js` or `mod.js` survive while loader runtime does not. Rejects: EaglerForgeInjector internals (`core/`, `modloader`, `modgui`, `patches`, `injector`), EaglerForgeBuilder source (`primitives/`, `javascriptGenerator`, `registerBlock(`, `Blockly`, `PRIMITIVES[`), webpack/esbuild client bundles (`css-loader`, `node_modules/`, minified single-line files), compiled output in `build/` or `dist/`, test and mock files, obfuscated `_0x` code, files needing relative `require()`, and files that *define* an API for other mods. De-duplication keeps genuine versions and drops copies: identical sha256, identical code after stripping comments/strings/whitespace (a renamed copy), or >=97% token overlap. Prefers the copy from the repository whose name matches the mod, so attribution points at the original author rather than a fork. Records which other repositories held a copy. | the unique mod set, plus `all_valid.json` (every distinct variant) |
| 8 | `verify_pristine.py` | The integrity gate. Deletes anything the pipeline itself generated (compiled or rewritten files), restores the original components byte-for-byte from upstream, then re-downloads **every** file from its `direct_link` and compares sha256 with what is on disk. Anything that differs is overwritten with the upstream bytes; anything that cannot be verified is removed. | the final set, each file marked `identical_to_source: yes` |

## Notes

* `node --check` (Node 20) was used as the syntax gate: every file in `Mods/` parses.
* Version selection (newest per mod) and the grouping into version families were done by two
  further scripts that have been removed, because their output - the multi-component merges -
  was discarded on request. The rules they used are documented in `../README.md`.
* Rate limits: the unauthenticated GitHub search API allows 10 requests/minute and the core API
  60/hour, shared per IP. Tarball streaming through `codeload.github.com` is not quota-limited,
  which is why step 3 does the bulk of the work.
* Approximately 75 GB of tarball data was streamed in total; nothing was stored except the
  individual mod files.
