// Patches react-native-bare-kit to gracefully handle missing TurboModule
// in release builds. The BareKitPackage.getModule() returns null, causing
// a NullPointerException when React Native tries to initialize it.
// Fix: remove BareKit from the module info map so RN never tries to create it.
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

// 2. Patch BareKitPackage.java to not register the BareKit module at all.
// This prevents React Native from trying to call getModule("BareKit") which
// returns null and causes a NullPointerException.
const javaFile = path.join(baseDir, 'android', 'src', 'main', 'java', 'to', 'holepunch', 'bare', 'kit', 'react', 'BareKitPackage.java');
if (fs.existsSync(javaFile)) {
  let content = fs.readFileSync(javaFile, 'utf-8');
  if (!content.includes('__patched_empty_map')) {
    // Replace the getReactModuleInfoProvider to return an empty map
    // so RN never tries to instantiate BareKit
    content = content.replace(
      /return \(\) -> \{[\s\S]*?return map;[\s\S]*?\};/,
      'return () -> { return new java.util.HashMap<>(); }; // __patched_empty_map'
    );
    fs.writeFileSync(javaFile, content);
    console.log('[patch-bare-kit] Patched BareKitPackage.java: empty module info map');
  } else {
    console.log('[patch-bare-kit] BareKitPackage.java already patched');
  }
} else {
  console.log('[patch-bare-kit] BareKitPackage.java not found');
}

// 3. Patch index.js to throw a catchable Error when NativeBareKit is null
const indexFile = path.join(baseDir, 'index.js');
if (fs.existsSync(indexFile)) {
  let content = fs.readFileSync(indexFile, 'utf-8');
  if (!content.includes('__bareKitPatched')) {
    const oldRequire = "const { default: NativeBareKit } = require('./specs/NativeBareKit')";
    const newRequire = "const { default: NativeBareKit } = require('./specs/NativeBareKit')\n// __bareKitPatched\nif (!NativeBareKit) { throw new Error('BareKit TurboModule not available in this build'); }";
    if (content.includes(oldRequire)) {
      content = content.replace(oldRequire, newRequire);
      fs.writeFileSync(indexFile, content);
      console.log('[patch-bare-kit] Patched index.js with null guard');
    } else {
      console.log('[patch-bare-kit] Could not find require line in index.js');
    }
  } else {
    console.log('[patch-bare-kit] index.js already patched');
  }
} else {
  console.log('[patch-bare-kit] index.js not found');
}

console.log('[patch-bare-kit] Done');
