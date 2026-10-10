# EaglerChest

**Website: <https://eaglerchest.pages.dev/>**

141 original Eaglercraft (EaglerForge) mods in `.js` form, in `Mods/` (3.18 MB), collected from
57 GitHub repositories. Mod APIs: ModAPI 125, PluginAPI 10, DOM/game script 6.

**These are the authors' own files, taken directly from their repositories.** Every one was
re-downloaded from its source URL and compared by sha256 - all 141 are identical byte for byte.
Nothing was edited, minified, merged, renamed inside, re-licensed or rewritten. The copyright of
every mod stays entirely with its author, and every mod links back to the repository it came from
in `SOURCES.md` and `MODS.csv`.

Load a mod with the EaglerForge Injector
(<https://eaglerforge.github.io/EaglerForgeInjector/>): open an EaglercraftX 1.8 client, then
**Mods** -> **Upload** (pick a `.js` from `Mods/`) or **Add New** (paste a URL). Some older mods
use `PluginAPI` (EaglerForge-old / Eagler Reborn) instead of `ModAPI`.

## Layout

| Path | Contents |
|---|---|
| `Mods/` | the 141 mod `.js` files - nothing else inside |
| `licenses/` | 9 licence texts, verbatim copies of what the owners published |
| `SOURCES.md` | every mod: author, version, size, **original repository**, path in repo, sha256, licence |
| `MODS.csv` | the same as a table, plus a **direct link to the original file** per mod |
| `mods_root.json` | the same as JSON |
| `pipeline/` | the scripts that collected the mods, each documented in `pipeline/README.md` |

Check any file yourself: `sha256sum "Mods/<file>.js"` against `sha256_full` in `MODS.csv`, or open
that mod's `direct_link` - the content must be exactly the same.

## Credits

None of this was written by us. The mods are the work of **57 repository owners** and the developers
named inside the files themselves, in each mod's own `ModAPI.meta.credits()`. Everything here rests
on **lax1dude** and **ayunami2000** for Eaglercraft, and on **ZXMushroom63**, **radmanplays**,
**TheIdiotPlays** and **elijahcg314** for the EaglerForge `ModAPI` loader most of these mods are
written against.

Most mods in this collection: ZXMushroom63 17, radmanplays 16, wxnnvs 7, themanofhelp 6,
AstralisLLC 5, OeildeLynx31 4, FLQMCDev 4 - and 14 files that carry no credit line.

Every mod is credited in `SOURCES.md` and `MODS.csv` whether or not its licence requires it.
No advertising, no affiliate links, no analytics or tracking, no paywall, no donation button, and
nothing here implies endorsement by any author, by the EaglerForge team, by Mojang or by Microsoft.
Any author who wants a mod removed, credited differently, or a licence corrected gets it done
immediately on request.

## Licence

**EaglerChest - this repository and website - has no licence of its own.** There is no MIT, no GPL,
no Apache, nothing. We claim no rights over this collection and grant none.

Whether a mod is licensed - and under what terms - belongs entirely to **the owner of that mod**.
**49 mods** come with a licence, reproduced verbatim in `licenses/`. **92 mods** come from
repositories that publish none, which means all rights reserved by their authors.

Two licence files are worth reading before you rely on them:

* `EaglerForge-MIT-with-conditions.txt` (35 mods) is headed "MIT License" but adds four conditions:
  non-commercial only, no advertising, no user tracking or data collection for monetisation, no
  implied endorsement, attribution required.
* `All-Rights-Reserved-Rasu-Eaglercraft-Mods.txt` (1 mod) is written in Japanese. It allows personal
  use and reading the source, and forbids redistribution, modified versions, reuse, misattribution
  and commercial use without prior permission - contact Discord `@rasutopi`.

So redistributing those 97 mods any further needs their owners' permission. That is their call,
not ours.
