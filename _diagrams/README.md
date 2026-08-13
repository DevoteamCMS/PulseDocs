# Diagram sources

Source for diagrams that are generated rather than drawn by hand. This directory
is not published - Jekyll ignores directories whose names begin with an
underscore - so nothing here appears on the site.

## Allocation scenarios

The four scenario diagrams on the Asset Ownership page share their geometry, so
they are generated from one script. Editing a single SVG by hand would drift it
out of line with the other three.

```bash
node _diagrams/generate-allocation-scenarios.mjs
```

Writes `assets/images/asset-ownership/scenario-*.svg`. To change a scenario, edit
its entry in the `scenarios` array and re-run. Requires Node; no dependencies.

## The other diagrams

`ownership-model.svg` and `pulse-ecosystem/ecosystem-tiers.svg` are hand-written
SVG, edited directly. They share the palette and type of the generated ones:

| Meaning | Fill | Stroke |
| --- | --- | --- |
| Accent - the pivot of a diagram, and direct allocation | `#fdf1f3` | `#c8102e` |
| Neutral box | `#f7f5f9` / `#eef2f7` | `#cfc9d6` / `#96a8c0` |
| Inherited, or a secondary surface | `#f0edf2` | `#a79fb2` |
| Body text | `#26313f` | |
| Muted text | `#7a7385` | |

Two things to preserve when editing any of them:

- **Paint an opaque background.** A transparent SVG loses every label that sits
  outside a filled box when the file is viewed on a dark background.
- **Only use arrowheads for a real direction of flow.** Containment - a
  subscription holding a resource group - is a plain line.

To check a change, render it to an image without a browser window:

```bash
chrome --headless=new --screenshot=out.png --window-size=1120,540 \
  file:///absolute/path/to/diagram.svg
```
