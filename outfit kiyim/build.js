const fs = require('fs');
const path = require('path');

const ASSET_BASE = 'https://reel-ref-try-the-look.vercel.app/assets/';

function readText(filename) {
  return fs.readFileSync(filename, 'utf8').replace(/^\uFEFF/, '');
}

// 1. Read catalog and rewrite images
const rawCatalog = JSON.parse(readText('native-catalog.json'));
const inlinedCatalog = {
  ...rawCatalog,
  looks: rawCatalog.looks.map(look => ({
    ...look,
    image: look.image.replace(/^assets\//, ASSET_BASE)
  })),
  items: rawCatalog.items.map(item => ({
    ...item,
    image: item.image.replace(/^assets\//, ASSET_BASE)
  }))
};

// 2. Read Inter font base64
const interB64 = readText('inter-600.b64').trim();

// 3. Process CSS
let css = readText('reference-style.css');
// Replace @font-face url with base64 data URI
css = css.replace(/url\(['"]?assets\/inter-600\.woff2['"]?\)/g, `url('data:font/woff2;base64,${interB64}')`);
// Any other assets/ in CSS? Replace if not already absolute
css = css.replace(/(?<!https:\/\/reel-ref-try-the-look\.vercel\.app\/)assets\//g, ASSET_BASE);

// 4. Process JavaScript
let js = readText('reference-app.js');

// Replace fetch('native-catalog.json') with inlined catalog
const oldFetchPattern = /const catalogPromise = fetch\('native-catalog\.json'\)\.then\(response => \{[\s\S]*?return response\.json\(\);[\s\S]*?\}\)\.then\(data => \{/;
const replacement = `const inlinedCatalog = ${JSON.stringify(inlinedCatalog)};\n  const catalogPromise = Promise.resolve(inlinedCatalog).then(data => {`;

if (!oldFetchPattern.test(js)) {
  console.error("Could not find fetch pattern in reference-app.js");
  process.exit(1);
}
js = js.replace(oldFetchPattern, replacement);

// Remove serviceWorker registration
js = js.replace(/if\s*\('serviceWorker'\s*in\s*navigator\)[\s\S]*?register\(['"]\.\/sw\.js['"]\)[\s\S]*?;\s*$/m, '');

// 5. Process HTML
let html = readText('reference.html');

// First replace all relative assets/ in HTML with ASSET_BASE
html = html.replace(/(?<!https:\/\/reel-ref-try-the-look\.vercel\.app\/)assets\//g, ASSET_BASE);

// Replace <link rel="stylesheet" href="style.css"> with <style>...</style>
html = html.replace('<link rel="stylesheet" href="style.css">', `<style>\n${css}\n</style>`);

// Replace <script src="app.js" defer></script> with <script>...</script>
html = html.replace('<script src="app.js" defer></script>', `<script>\n${js}\n</script>`);

// Clean up any double URLs just in case
html = html.replace(/https:\/\/reel-ref-try-the-look\.vercel\.app\/https:\/\/reel-ref-try-the-look\.vercel\.app\//g, 'https://reel-ref-try-the-look.vercel.app/');

// Write to index.html
fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully generated index.html. Total bytes:', fs.statSync('index.html').size);
