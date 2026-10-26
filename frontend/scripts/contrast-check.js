/* WCAG 2.1 contrast checker for the DSTI theme palette.
 * Usage: node scripts/contrast-check.js
 */
const palette = {
  primary: { 50:'#eef1fb',100:'#dde3f7',200:'#bcc6f0',300:'#93a0e4',400:'#5566d0',500:'#3346b8',600:'#14248c',700:'#000080',800:'#00035f',900:'#000244',950:'#000126' },
  secondary:{ 50:'#fff5ea',100:'#ffebd6',200:'#ffd9af',300:'#ffbe6f',400:'#ff9933',500:'#c47d00',600:'#a46800',700:'#764a00',800:'#4b2d00',900:'#281600',950:'#110700' },
  neutral:{ 50:'#fafafa',100:'#f5f5f5',200:'#e5e5e5',300:'#d9d9d9',400:'#a1a1a1',500:'#737373',600:'#525252',700:'#404040',800:'#262626',900:'#171717',950:'#0a0a0a' },
  danger:{ 500:'#f55e57',600:'#db372d',700:'#b3251e' },
};

const lin = (c) => { c/=255; return c<=0.04045 ? c/12.92 : Math.pow((c+0.055)/1.055,2.4); };
const lum = (hex) => {
  const n = parseInt(hex.slice(1),16);
  return 0.2126*lin((n>>16)&255) + 0.7152*lin((n>>8)&255) + 0.0722*lin(n&255);
};
const ratio = (a,b) => { const [x,y]=[lum(a),lum(b)].sort((m,n)=>n-m); return (x+0.05)/(y+0.05); };
const r = (a,b) => Math.round(ratio(a,b)*100)/100;
const verdict = (v, min) => v>=min ? 'PASS' : 'FAIL';

const WHITE='#ffffff', DARK='#0a0a0a', DARKCARD='#171717';

console.log('=== Text colour on WHITE (need 4.5:1 normal, 3:1 large/UI) ===');
for (const [name, ramp] of Object.entries(palette)) {
  for (const [step, hex] of Object.entries(ramp)) {
    const v = r(hex, WHITE);
    if (v >= 3 && v < 30) console.log(`  ${name}-${step} ${hex}  ${v}:1  ${verdict(v,4.5)} vs 4.5`);
  }
}

console.log('\n=== Text colour on DARK #0a0a0a ===');
for (const [name, ramp] of Object.entries(palette)) {
  for (const [step, hex] of Object.entries(ramp)) {
    const v = r(hex, DARK);
    if (v >= 3 && v < 30) console.log(`  ${name}-${step} ${hex}  ${v}:1  ${verdict(v,4.5)} vs 4.5`);
  }
}

console.log('\n=== White text on coloured buttons/backgrounds ===');
for (const [name, ramp] of Object.entries(palette)) {
  for (const [step, hex] of Object.entries(ramp)) {
    const v = r(WHITE, hex);
    if (v >= 2 && v < 21) console.log(`  white on ${name}-${step} ${hex}  ${v}:1  ${verdict(v,4.5)}`);
  }
}

console.log('\n=== Dark text (#0a0a0a) on coloured backgrounds ===');
for (const [name, ramp] of Object.entries(palette)) {
  for (const [step, hex] of Object.entries(ramp)) {
    const v = r(DARK, hex);
    if (v >= 2 && v < 21) console.log(`  #0a0a0a on ${name}-${step} ${hex}  ${v}:1  ${verdict(v,4.5)}`);
  }
}

console.log('\n=== Specific app pairings ===');
const pairs = [
  ['primary-600 on white (links, .dst-eyebrow)', palette.primary[600], WHITE],
  ['primary-700 on white', palette.primary[700], WHITE],
  ['primary-500 on white (hover)', palette.primary[500], WHITE],
  ['primary-300 on dark (dark-mode link)', palette.primary[300], DARK],
  ['primary-200 on dark (dark-mode link hover)', palette.primary[200], DARK],
  ['white on primary-400 (dark-mode .btn-primary)', WHITE, palette.primary[400]],
  ['primary-400 dark btn vs dark card (boundary 3:1)', palette.primary[400], DARKCARD, 3],
  ['#0a0a0a on secondary-400 saffron (dark btn hover)', DARK, palette.secondary[400]],
  ['#0a0a0a on secondary-500 (chips, CTA)', DARK, palette.secondary[500]],
  ['secondary-600 on white (topbar, labels)', palette.secondary[600], WHITE],
  ['secondary-600 on light-only TopBar', palette.secondary[600], WHITE],
  ['secondary-300 on dark (dark-mode amber accent)', palette.secondary[300], DARK],
  ['secondary-300 on footer dark #171717', palette.secondary[300], DARKCARD],
  ['white on secondary-600 (.btn-secondary)', WHITE, palette.secondary[600]],
  ['white on secondary-700 (hover)', WHITE, palette.secondary[700]],
  ['white on primary-600 (.btn-primary)', WHITE, palette.primary[600]],
  ['white on primary-700 (hover)', WHITE, palette.primary[700]],
  ['focus ring #14248c vs white halo', palette.primary[600], WHITE],
  ['neutral-500 placeholder on white', palette.neutral[500], WHITE],
  ['neutral-600 body text on white', palette.neutral[600], WHITE],
  ['neutral-400 placeholder on dark card #171717', palette.neutral[400], DARKCARD],
  ['secondary-300 on dark-mode card', palette.secondary[300], DARKCARD],
  ['primary-300 on dark-mode card (dark focus ring)', palette.primary[300], DARKCARD],
  ['focus halo #0a0a0a vs dark ring #93a0e4', palette.primary[300], DARK],
  ['danger-400 on dark card (admin sign-out)', palette.danger[400] || '#ff8983', DARKCARD],
  ['neutral-500 placeholder on white (SearchOverlay)', palette.neutral[500], WHITE],
  ['map: navy #000080 vs white', '#000080', WHITE],
  ['map: saffron #c47d00 vs white (marker 3:1)', '#c47d00', WHITE, 3],
  ['map: navy-mid #3346b8 vs white', '#3346b8', WHITE],
  ['map: saffron-dark #8a5100 vs white', '#8a5100', WHITE],
  ['map: navy-light #5566d0 vs white', '#5566d0', WHITE],
];
for (const [label, fg, bg, min = 4.5] of pairs) {
  const v = r(fg, bg);
  console.log(`  ${v}:1  ${verdict(v,min)} (min ${min})  — ${label}`);
}
