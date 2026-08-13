// Generates the four allocation-scenario diagrams used by the Asset Ownership page.
//
//   node _diagrams/generate-allocation-scenarios.mjs
//
// Output: assets/images/asset-ownership/scenario-*.svg
//
// The four diagrams are near-identical in geometry, so they are generated rather
// than hand-written - editing one by hand would drift it out of line with the
// others. To change a scenario, edit its entry in `scenarios` below and re-run.
//
// Design notes worth keeping:
//   - The outcome is a destination, not a label: a line runs from each cloud level
//     to the Asset Group box it actually lands in. Where a tagged asset does not
//     follow its parent, the lines cross, which shows the problem rather than
//     asserting it.
//   - Colour and dash carry the mechanism (see MECH). The legend lives in the page
//     text, not in the artwork, so it can be edited and translated.
//   - Containment connectors have no arrowheads. They mean "contains", not a
//     direction of flow.
//   - Every diagram paints an opaque background. Without one, labels outside a
//     filled box disappear when the file is viewed on a dark background.

import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const OUT = fileURLToPath(new URL('../assets/images/asset-ownership/', import.meta.url));

const W = 660, H = 250;
const LEVEL_X = 24, LEVEL_W = 200, LEVEL_H = 54;
const ROW_Y = [24, 98, 172];
const GROUP_X = 470, GROUP_W = 166;

const MECH = {
  tag:       { colour: '#3f72a8', dash: null,  label: 'by tag' },
  direct:    { colour: '#c8102e', dash: null,  label: 'direct' },
  inherited: { colour: '#8c8598', dash: '5 4', label: 'inherited' },
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const scenarios = [
  {
    file: 'scenario-1-tag-based',
    title: 'Everything tagged lands in the same group',
    groups: ['AG1'],
    rows: [
      { level: 'Subscription',   tag: 'product:App1', to: 'AG1', via: 'tag' },
      { level: 'Resource group', tag: 'product:App1', to: 'AG1', via: 'tag' },
      { level: 'Asset',          tag: null,           to: 'AG1', via: 'inherited' },
    ],
  },
  {
    file: 'scenario-2-two-applications',
    title: 'A direct allocation overrides the tag, and its children follow',
    groups: ['AG1', 'AG2'],
    rows: [
      { level: 'Subscription',   tag: 'product:App1', to: 'AG1', via: 'tag' },
      { level: 'Resource group', tag: 'product:App1', to: 'AG2', via: 'direct' },
      { level: 'Asset',          tag: null,           to: 'AG2', via: 'inherited' },
    ],
  },
  {
    file: 'scenario-3-split-resource-group',
    title: 'A tagged asset does not follow the group its parent is in',
    groups: ['AG1', 'AG2'],
    rows: [
      { level: 'Subscription',   tag: 'product:App1', to: 'AG1', via: 'tag' },
      { level: 'Resource group', tag: null,           to: 'AG2', via: 'direct' },
      { level: 'Asset',          tag: 'product:App1', to: 'AG1', via: 'tag' },
    ],
  },
  {
    file: 'scenario-4-asset-not-following-parent',
    title: 'The tagged asset stays put while its parents move',
    groups: ['AG1', 'AG2'],
    rows: [
      { level: 'Subscription',   tag: null,           to: 'AG2', via: 'direct' },
      { level: 'Resource group', tag: null,           to: 'AG2', via: 'inherited' },
      { level: 'Asset',          tag: 'product:App1', to: 'AG1', via: 'tag' },
    ],
  },
];

const groupBoxes = (groups) =>
  groups.length === 1
    ? { AG1: { y: 65, h: 120 } }
    : { AG1: { y: 24, h: 94 }, AG2: { y: 132, h: 94 } };

mkdirSync(OUT, { recursive: true });

for (const s of scenarios) {
  const boxes = groupBoxes(s.groups);
  const parts = [];

  parts.push(`<rect width="${W}" height="${H}" fill="#ffffff"/>`);

  parts.push(`<line x1="44" y1="78" x2="44" y2="98" stroke="#cfc9d6" stroke-width="1.4"/>`);
  parts.push(`<line x1="44" y1="152" x2="44" y2="172" stroke="#cfc9d6" stroke-width="1.4"/>`);

  for (const name of s.groups) {
    const b = boxes[name];
    parts.push(
      `<rect x="${GROUP_X}" y="${b.y}" width="${GROUP_W}" height="${b.h}" rx="6" fill="#fdfcfe" stroke="#c8102e" stroke-width="1.5"/>`,
      `<text x="${GROUP_X + GROUP_W / 2}" y="${b.y + b.h / 2 + 6}" font-size="17" font-weight="600" fill="#c8102e" text-anchor="middle">${name}</text>`,
    );
  }

  s.rows.forEach((row, i) => {
    const y = ROW_Y[i];
    const cy = y + LEVEL_H / 2;
    const m = MECH[row.via];
    const target = boxes[row.to];
    const ty = target.y + target.h / 2;

    parts.push(
      `<rect x="${LEVEL_X}" y="${y}" width="${LEVEL_W}" height="${LEVEL_H}" rx="5" fill="#f7f5f9" stroke="#cfc9d6"/>`,
      `<text x="${LEVEL_X + LEVEL_W / 2}" y="${y + 23}" font-size="13" font-weight="500" fill="#26313f" text-anchor="middle">${esc(row.level)}</text>`,
      row.tag
        ? `<text x="${LEVEL_X + LEVEL_W / 2}" y="${y + 41}" font-size="10.5" fill="#6f6880" text-anchor="middle">tag: ${esc(row.tag)}</text>`
        : `<text x="${LEVEL_X + LEVEL_W / 2}" y="${y + 41}" font-size="10.5" fill="#b9b2c0" text-anchor="middle">no tag</text>`,
      `<line x1="${LEVEL_X + LEVEL_W + 4}" y1="${cy}" x2="${GROUP_X - 5}" y2="${ty}" stroke="${m.colour}" stroke-width="1.6"${m.dash ? ` stroke-dasharray="${m.dash}"` : ''} marker-end="url(#head-${row.via})"/>`,
      // Label goes on whichever side of the line has room: a rising line would
      // otherwise run straight through a label placed above it.
      `<text x="${LEVEL_X + LEVEL_W + 12}" y="${ty < cy - 10 ? cy + 16 : cy - 9}" font-size="10.5" font-weight="500" fill="${m.colour}">${m.label}</text>`,
    );
  });

  const markers = Object.entries(MECH)
    .map(
      ([k, m]) =>
        `<marker id="head-${k}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="${m.colour}"/></marker>`,
    )
    .join('\n    ');

  const desc = s.rows
    .map((r) => `${r.level}${r.tag ? ` tagged ${r.tag}` : ' untagged'} ends up in ${r.to} ${MECH[r.via].label}`)
    .join('. ');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-labelledby="t-${s.file} d-${s.file}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif">
  <title id="t-${s.file}">${esc(s.title)}</title>
  <desc id="d-${s.file}">The Azure hierarchy on the left - subscription, resource group, asset - with a line from each to the Asset Group it ends up in. ${esc(desc)}.</desc>
  <defs>
    ${markers}
  </defs>
${parts.map((p) => '  ' + p).join('\n')}
</svg>
`;

  writeFileSync(`${OUT}${s.file}.svg`, svg);
  console.log(`${s.file}.svg  ${svg.length} bytes`);
}
