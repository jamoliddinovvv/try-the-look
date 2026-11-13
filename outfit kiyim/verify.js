const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

// Check 1: Any relative assets/ left?
const relativeAssets = [];
const regex = /(?:src|href|srcset|data-probe|url\()=?['"]?([^'")\s>]+)/g;
let match;
while ((match = regex.exec(html)) !== null) {
  const path = match[1];
  if (path.startsWith('assets/') || path === 'assets') {
    relativeAssets.push({ full: match[0], path });
  }
}
console.log('Relative assets found:', relativeAssets.length);
if (relativeAssets.length) console.log(relativeAssets);

// Check 2: Service worker check
console.log('Service worker in html?', html.includes('serviceWorker') || html.includes('sw.js'));

// Check 3: Inter font data URI check
console.log('Inter font @font-face check:', html.includes('data:font/woff2;base64,'));

// Check 4: Preload model-1 check
console.log('Preload model-1 check:', html.includes('<link rel="preload" as="image" href="https://reel-ref-try-the-look.vercel.app/assets/model-1-640.webp" fetchpriority="high">'));

// Check 5: runway-section custom element check
console.log('customElements.define check:', html.includes("customElements.define('runway-section'"));

// Check 6: Check native-catalog fetch
console.log('Any fetch for native-catalog.json?', html.includes("fetch('native-catalog.json')"));

// Check 7: Check document order
const headerIdx = html.indexOf('<header class="site-header shopify-section-group-header-group">');
const mainIdx = html.indexOf('<main>');
const runwayIdx = html.indexOf('<runway-section');
const bagDialogIdx = html.indexOf('<dialog id="bag-dialog">');
const bagStatusIdx = html.indexOf('<div id="bag-status"');
const scriptIdx = html.indexOf('<script>');

console.log('Order check:', {
  headerIdx,
  mainIdx,
  runwayIdx,
  bagDialogIdx,
  bagStatusIdx,
  scriptIdx,
  isCorrectOrder: (headerIdx < mainIdx && mainIdx < runwayIdx && runwayIdx < bagDialogIdx && bagDialogIdx < bagStatusIdx && bagStatusIdx < scriptIdx)
});

// Check 8: Check tokens
console.log('--rw-c-stage in style:', html.includes('--rw-c-stage: #ffffff'));
console.log('data-feel="balanced":', html.includes('data-feel="balanced"'));
console.log('data-style="ring":', html.includes('data-style="ring"'));
console.log('data-mstyle="classic":', html.includes('data-mstyle="classic"'));

// Check 9: Check looks and models
console.log('All 6 looks present?');
for (let i = 1; i <= 6; i++) {
  const m640 = `https://reel-ref-try-the-look.vercel.app/assets/model-${i}-640.webp`;
  const mOrig = `https://reel-ref-try-the-look.vercel.app/assets/original-look-${i}.webp`;
  console.log(`Look model ${i}: 640=${html.includes(m640)}, orig=${html.includes(mOrig)}`);
}

// Check 10: Check all 8 products
const products = [
  'tatum-5-orbit-copy',
  'tshirt',
  'sweatshirt',
  'tatum-5-orbit',
  'hoodie-black',
  'sweatshirt-plus',
  'hoodie',
  'air-jordan-12-retro-copy'
];
for (const p of products) {
  console.log(`Product ${p} present:`, html.includes(p));
}
