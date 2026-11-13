const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('index.html', 'utf8');

// Extract script content
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) {
  console.error('No <script> tag found!');
  process.exit(1);
}

const scriptCode = scriptMatch[1];
try {
  new vm.Script(scriptCode);
  console.log('Script syntax check: PASSED (no syntax errors)');
} catch (err) {
  console.error('Script syntax error:', err);
  process.exit(1);
}

// Extract style content
const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
if (!styleMatch) {
  console.error('No <style> tag found!');
  process.exit(1);
}
console.log('Style block found: length =', styleMatch[1].length);
