import { execSync } from 'child_process';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

const getLatestGitCommitTime = () => {
  try {
    return execSync('git log -1 --format=%ci', { cwd: __dirname })
      .toString()
      .trim()
      .replace(/\s[+-]\d{4}$/, '');
  } catch {
    return new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
  }
};

const getLatestGitCommitHash = () => {
  try {
    return execSync('git log -1 --format=%H', { cwd: __dirname }).toString().trim();
  } catch {
    return 'local-dev';
  }
};

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const appVersion = {
    commitTime: getLatestGitCommitTime(),
    commitHash: getLatestGitCommitHash(),
  };

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'app-version-manifest',
        configureServer(server) {
          server.middlewares.use('/version.json', (_req, res) => {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify(appVersion));
          });
        },
        generateBundle() {
          this.emitFile({
            type: 'asset',
            fileName: 'version.json',
            source: JSON.stringify(appVersion, null, 2),
          });
        },
      },
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      __APP_GIT_COMMIT_TIME__: JSON.stringify(getLatestGitCommitTime()),
      __APP_GIT_COMMIT_HASH__: JSON.stringify(getLatestGitCommitHash()),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
