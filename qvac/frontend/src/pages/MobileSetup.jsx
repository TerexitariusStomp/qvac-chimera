import { useState, useEffect } from 'react';
import { Terminal, Shield, Cpu, Wifi, Copy, Check, Zap, Smartphone } from 'lucide-react';

const ANDROID_SCRIPT = `pkg update -y
pkg install nodejs git -y
termux-setup-storage
cd ~
if [ ! -d "qvac-chimera" ]; then
  git clone https://github.com/TerexitariusStomp/qvac-chimera.git
fi
cd qvac-chimera/qvac
npm install
cd frontend && npm install && npm run build && cd ..
export MACHINE_OWNER_EVM=0xYOUR_ADDRESS
export APP_ID=protocol-default
node src/index.js`;

export function MobileSetup() {
  const [platform, setPlatform] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    if (/Android/i.test(ua)) setPlatform('android');
    else if (/iPhone|iPad|iPod/i.test(ua)) setPlatform('ios');
    else setPlatform('other');
  }, []);

  const copy = () => {
    navigator.clipboard.writeText(ANDROID_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (platform === 'ios') {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-cyan-400/10 flex items-center justify-center mx-auto mb-4">
            <Cpu size={24} className="text-cyan-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">iOS — @qvac/sdk via Expo</h2>
          <p className="text-white/40 text-sm max-w-lg mx-auto leading-relaxed">
            The official QVAC SDK runs natively on iOS 17+ through Expo and React Native.
            It uses llama.cpp with Metal GPU acceleration inside the iOS app sandbox.
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-green-400/10 bg-green-400/5 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={14} className="text-green-400" />
              <span className="text-green-300 text-sm font-medium">Hardened by default</span>
            </div>
            <p className="text-white/30 text-xs leading-relaxed">
              The iOS app sandbox IS a hardened container: separate process namespace, filesystem isolation,
              no root access, and code signing required. The QVAC SDK runs inference inside this sandbox
              with no escape to the host system.
            </p>
          </div>

          <div className="rounded-xl border border-white/8 bg-black/30 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={14} className="text-cyan-400" />
              <span className="text-cyan-300 text-sm font-medium">How it works</span>
            </div>
            <ol className="text-white/30 text-xs space-y-2 list-decimal pl-4">
              <li>Install Expo Go or build the native app</li>
              <li>The app bundles @qvac/sdk which loads a GGUF model</li>
              <li>Inference runs on Apple Neural Engine via llama.cpp Metal backend</li>
              <li>P2P networking uses Bare runtime (Holepunch) — handles UDP inside the sandbox</li>
              <li>Tasks arrive, inference runs locally, results go back to the network</li>
            </ol>
          </div>

          <div className="rounded-xl border border-purple-400/10 bg-purple-400/5 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Smartphone size={14} className="text-purple-400" />
              <span className="text-purple-300 text-sm font-medium">Quick start</span>
            </div>
            <pre className="text-[11px] text-green-400 font-mono bg-black/40 p-3 rounded overflow-x-auto mt-2">
{`npx create-expo-app chimera-mobile
cd chimera-mobile
npm install @qvac/sdk bare-rpc react-native-bare-kit
npx expo install expo-file-system expo-build-properties expo-device

# Add to app.json plugins:
# ["expo-build-properties", {"android": {"minSdkVersion": 29}}]
# "@qvac/sdk/expo-plugin"

npx expo prebuild
npx expo run:ios --device`}
            </pre>
          </div>

          <div className="rounded-xl border border-amber-400/10 bg-amber-400/5 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Wifi size={14} className="text-amber-400" />
              <span className="text-amber-300 text-sm font-medium">Limitations</span>
            </div>
            <ul className="text-white/30 text-xs space-y-1 list-disc pl-4">
              <li>Background execution still limited by iOS (~30s in background)</li>
              <li>Physical device required — simulator not supported (llama.cpp limitation)</li>
              <li>For 24/7 earning, use desktop relay + iPhone when app is open</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (platform === 'other') {
    return (
      <div className="max-w-xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Open this page on your phone</h2>
        <p className="text-white/40 text-sm">
          Platform-specific setup instructions appear automatically for Android and iOS.
        </p>
      </div>
    );
  }

  // Android
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-xl bg-green-400/10 flex items-center justify-center mx-auto mb-4">
          <Shield size={24} className="text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Android — @qvac/sdk via Expo</h2>
        <p className="text-white/40 text-sm max-w-lg mx-auto leading-relaxed">
          The official QVAC SDK runs on Android 12+ via Expo and React Native.
          It uses llama.cpp with Vulkan GPU acceleration inside the Android app sandbox.
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-green-400/10 bg-green-400/5 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={14} className="text-green-400" />
            <span className="text-green-300 text-sm font-medium">Hardened by default</span>
          </div>
          <p className="text-white/30 text-xs leading-relaxed">
            Android apps run in a sandboxed process with SELinux enforcement, isolated storage,
            and no root access. The QVAC SDK runs inference inside this sandbox with no escape.
          </p>
        </div>

        <div className="rounded-xl border border-white/8 bg-black/30 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} className="text-cyan-400" />
            <span className="text-cyan-300 text-sm font-medium">Quick start</span>
          </div>
          <pre className="text-[11px] text-green-400 font-mono bg-black/40 p-3 rounded overflow-x-auto">
{`npx create-expo-app chimera-mobile
cd chimera-mobile
npm install @qvac/sdk bare-rpc react-native-bare-kit
npx expo install expo-file-system expo-build-properties expo-device

# Add to app.json plugins:
# ["expo-build-properties", {"android": {"minSdkVersion": 29}}]
# "@qvac/sdk/expo-plugin"

npx expo prebuild
npx expo run:android --device`}
          </pre>
        </div>

        <div className="rounded-xl border border-white/8 bg-black/30 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Terminal size={14} className="text-amber-400" />
            <span className="text-amber-300 text-sm font-medium">Alternative: Termux</span>
          </div>
          <p className="text-white/30 text-xs leading-relaxed mb-2">
            For full Node.js runtime access, you can also run the QVAC SDK inside Termux:
          </p>
          <div className="relative">
            <pre className="text-[11px] text-green-400 font-mono bg-black/50 p-3 rounded overflow-x-auto leading-relaxed">
{ANDROID_SCRIPT}
            </pre>
            <button
              onClick={copy}
              className="absolute top-2 right-2 px-2 py-1 rounded bg-white/10 text-white/60 text-xs hover:bg-white/15 transition-colors flex items-center gap-1"
            >
              {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
