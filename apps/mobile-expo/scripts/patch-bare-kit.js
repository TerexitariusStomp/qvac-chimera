// Patches react-native-bare-kit to gracefully handle missing TurboModule
// in release builds. Without this, TurboModuleRegistry.getEnforcing('BareKit')
// throws a JavascriptException that crashes the app.
const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..', 'node_modules', 'react-native-bare-kit');

// 1. Patch NativeBareKit.ts: getEnforcing -> get (returns null instead of throwing)
const specsFile = path.join(baseDir, 'specs', 'NativeBareKit.ts');
if (fs.existsSync(specsFile)) {
  let content = fs.readFileSync(specsFile, 'utf-8');
  if (content.includes('getEnforcing')) {
    content = content.replace('TurboModuleRegistry.getEnforcing', 'TurboModuleRegistry.get');
    fs.writeFileSync(specsFile, content);
    console.log('[patch-bare-kit] Patched NativeBareKit.ts: getEnforcing -> get');
  } else {
    console.log('[patch-bare-kit] NativeBareKit.ts already patched or no getEnforcing found');
  }
} else {
  console.log('[patch-bare-kit] NativeBareKit.ts not found');
}

// 2. Don't patch index.js — when NativeBareKit is null, calling methods on it
// will throw a TypeError (catchable by JS try/catch) rather than a
// JavascriptException (which crashes the app). This is sufficient for
// App.js's try/catch to handle the missing module gracefully.

console.log('[patch-bare-kit] Done');
