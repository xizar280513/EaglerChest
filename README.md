# 141 Eaglercraft mods (EaglerForge)

All 141 `.js` files live in `Mods/` (3.18 MB), from **57 GitHub repositories**.
Mod APIs: {'ModAPI': 125, 'PluginAPI': 10, 'DOM/game script': 6}.

Load them with the EaglerForge Injector (<https://eaglerforge.github.io/EaglerForgeInjector/>):
open an EaglercraftX 1.8 client, then **Mods** -> **Upload** (pick a `.js` from `Mods/`) or
**Add New** (paste a URL). Some older mods use `PluginAPI` (EaglerForge-old / Eagler Reborn)
instead of `ModAPI`.

## Licence

**This repository and website have no licence of their own.** There is no MIT, no GPL, no Apache,
nothing. We claim no rights over this collection and grant none.

Whether a mod is licensed - and under what terms - belongs entirely to **the owner of that mod**.
Some authors published a licence, most did not. That is their decision, not ours, and it is not
changed by a file appearing here.

| Situation | Mods | Licence text |
|---|---|---|
| The author published a licence | 49 | reproduced in `licenses/`, listed per mod below |
| The author published **no** licence | 92 | none - all rights reserved by that author |

The licence files in `licenses/` are verbatim copies of what each author published, so you can read
the actual terms instead of a summary:

| File | Used by |
|---|---|
| `All-Rights-Reserved-Rasu-Eaglercraft-Mods.txt` | 1 mod - rasutopi/Rasu-Eaglercraft-Mods |
| `All-Rights-Reserved-ShadersReborn.txt` | 1 mod - wxnnvs/ShadersReborn |
| `All-Rights-Reserved.txt` | 3 mods - eaglerforge/EaglerForge-old |
| `Apache-2.0.txt` | 2 mods - radmanplays/EaglerMobile, usejxo/Furnace |
| `EaglerForge-MIT-with-conditions.txt` | 35 mods - eaglerforge/EaglerForgeInjector, jaydenhills-cmd/EaglerForgeInjector, sorapane5111-afk/EaglerForgeInjector |
| `GPL-3.0.txt` | 4 mods - Jxoj/Furnace, OsmiumTeam/ClassicBinds, ZXMushroom63/eagler-controller-support, krunchiekrunch/EaglerForge-chat-jokes |
| `MIT-eagler-touch-1122.txt` | 1 mod - yselvav/eagler-touch-1122 |
| `MIT.txt` | 1 mod - Urbigmumz-dev/Eaglerforge-mod |
| `Public-Domain.txt` | 1 mod - Frichka-true/Eaglercraft-origin-port |

Per-mod licence mapping: the `Licence` column in `SOURCES.md`, or the `license_file` and
`license_terms` columns in `MODS.csv`.

One licence needs a warning because it is not what its title suggests. `EaglerForge-MIT-with-conditions.txt`
is headed "MIT License" but adds four conditions covering 35 mods:
**non-commercial only, no advertising, no user tracking or data collection for monetisation, no
implied endorsement, attribution required.**

`All-Rights-Reserved-Rasu-Eaglercraft-Mods.txt` is written in Japanese. It permits personal use and
reading the source, and forbids redistribution, modified versions, reuse, misattribution and
commercial use without prior permission; the author gives Discord `@rasutopi` as the contact.

## Credit

None of this was written by us. Every file in `Mods/` is a byte-identical copy of what its author
published, and the copyright stays entirely with them - 57 repository owners and the
developers named inside the files themselves (in each mod's own `ModAPI.meta.credits()`).

* **Nothing was modified.** No file was edited, minified, beautified, renamed inside, re-licensed,
  or merged with another. Each of the 141 was re-downloaded from its source and compared by sha256 -
  all 141 match.
* **One mistake, reversed.** A merged and rewritten build of `laser_start_item.js` +
  `laser_end_item.js` was produced during collection and then deleted: combining and rewriting
  someone's code creates something that is no longer their work. Both original components are
  included instead, untouched.
* **Broken code was left broken.** Several mods call APIs that do not exist in EaglerForge
  (`ModAPI.registerMod()`, the `init` and `useitem` events) and five had invalid syntax; those were
  dropped rather than repaired, because fixing them would mean writing code on the authors' behalf.
* **No monetisation.** No advertising, affiliate links, analytics, tracking, paywall or donation
  button.
* **No borrowed authority.** Nothing here implies endorsement by any author, by the EaglerForge
  team, by lax1dude or ayunami2000, by Mojang or by Microsoft.
* **Removal on request, immediately.** Any author who wants a mod taken down, credited differently,
  or a licence correction recorded, gets it done at once.

Because 92 of these mods come from repositories with no licence, and 5 more from
repositories that explicitly reserve all rights, redistributing them further needs their owners'
permission. That is their call to make, not ours.

## Integrity

| Check | Result |
|---|---|
| sha256 of every file vs a fresh download from its source | **141/141 identical** |
| First line of every file vs its source | **141/141 identical** |
| Licence or copyright notices inside the files altered | **none** |
| Duplicate sha256 between files | none |
| Non-`.js` files inside `Mods/` | none |
| Passes `node --check` | 141/141 |

## Versions

One newest version per mod; 69 older versions, duplicate copies and broken files were discarded.
Ranking used to pick the newest: valid syntax > has a version number > highest version number >
newer keywords (remake/plus/v2/v3/withrect/1.12) vs older ones (old/legacy/alpha/beta/test/simple/
discontinued) > most recent repository push > build artefact > largest file.

## Excluded

* **Multi-component mods** - a mod split across several files, a webpack or esbuild bundle,
  `import`/`export`, or a loader for other `.js` files.
* **The EaglercraftX 1.8 client (HTML)** - the game, not a mod. Its own header comment says there is
  no official download link any more and tells you to compile it yourself from
  `gitlab.com/lax1dude/eaglercraftx-1.8` (404 when checked). It is bound by the Mojang/Microsoft
  EULA, and Eaglercraft has received DMCA takedowns. Do not host it.
* **Justin Client v3b13** (third-party Google Drive folder) - unverifiable: the author's repository
  `Murturtle/JustinClient` holds only `version.json` pointing at a `bit.ly` short link. This is the
  distribution pattern used by "RATTED" clients.
* **14 clients flagged by the community as RATTED** (malware).
* **5 mods whose syntax is broken at the source**: `Craft a Saddle Mod`, `healwithspiderhack`,
  `in dev mod`, `let cooldown 0`, `WurstX`.
* Loader/runtime/builder files (`core/`, `primitives/`, `build/`), webpack chunks, mock/test files,
  and client bundles containing `css-loader`.

## Security and privacy

All mods are third-party code from public repositories. They were scanned for malware indicators
(Discord/Slack/Telegram webhooks, pastebin/rentry payloads, `eval(atob(`, `Runtime.exec`, access to
`launcher_profiles.json` or browser credentials): none matched.

Ten mods contact third-party servers when used:

| Mod | Host | Note |
|---|---|---|
| `Furnace.js` | `jfurnace.netlify.app` | "online" mode fetches `mods.json` and icons from the author's server; an offline mode exists |
| `IRCchat.js` | `wss://brick-iron-shift.glitch.me` | WebSocket to the author's Glitch server - chat and username pass through it |
| `AI Player Companion.js` | `api.openai.com` | bring your own key, stored in localStorage |
| `chat utils.js` | `files.catbox.moe` | plays an mp3; contains `webhookURL = 'REPLACE WEBHOOK'` (empty - remove it if you do not want it) |
| `jokes.js` | `icanhazdadjoke.com` | fetches a random joke |
| `Glock.js`, `arbitrary_model.js`, `render_arbitrary_highpolyskin.js` | `pngimg.com`, `base64.guru` | fetch image assets |
| `USSR Mod.js` | `www.marxists.org` | plays an mp3 |
| `emergecy.js` | `classroom.google.com`, `upload.wikimedia.org` | embeds a Google Classroom iframe |
| `unibind.js` | `osmium.minecraft.pe` | notice text only (UniBind moved to OsmiumCore) |
| `burmod1.0.js` | dynamic WebSocket | pings `e.address` from the server list - normal |

Never sign in with a real Microsoft/Mojang account in a third-party client. Many of these mods are
cheats (X-ray, forceop, KillAura) and can get you banned on other people's servers.

## Workspace layout

| Path | Contents |
|---|---|
| `Mods/` | **141 mod `.js` files** - nothing else inside |
| `licenses/` | 9 verbatim licence texts published by the mod owners |
| `README.md` | this document |
| `SOURCES.md` | every mod with its repository, path in repo, author, sha256 and licence |
| `MODS.csv` | the same as a table, plus direct download link, full sha256 and `license_file` |
| `mods_root.json` | full metadata for all 141 mods (used by the scripts) |
| `pipeline/` | the eight scripts that built this collection, each documented in `pipeline/README.md` |

Verify yourself:

```
sha256sum "Mods/<file>.js"    # compare with sha256_full in MODS.csv
```

## How the collection was built

6,224 GitHub repositories were gathered (search terms `eaglercraft`, `eaglercraftx`, `eaglerforge`,
`eaglerrinth`, `eagler`, `fork:true` variants, `ModAPI in:readme`, `eagler mods`, the fork lists of
the four core EaglerForge repositories, and the repositories of the main authors). 3,821 of them were
scanned by streaming their tarballs (~75 GB read) -> 9,400+ artefacts -> 7,200+ `.js` files carrying
a ModAPI/PluginAPI/EaglerReborn marker -> 4,800 valid mods -> 207 unique variants -> **141 final mods**.
