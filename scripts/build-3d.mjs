// Собирает 3D-сцену (scene3d/*.ts + three.js) в одну HTML-строку для WebView/iframe.
// Запуск: npm run build:3d
import { build } from 'esbuild';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const res = await build({
  entryPoints: [path.join(root, 'scene3d/scene.ts')],
  bundle: true,
  minify: true,
  format: 'iife',
  target: ['es2020', 'safari15'],
  write: false,
  legalComments: 'none',
});
const js = res.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"><style>html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:transparent;touch-action:none;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}canvas{display:block;width:100%;height:100%;outline:none}</style></head><body><script>${js}</script></body></html>`;
const out = path.join(root, 'src/components/body3d/sceneHtml.ts');
writeFileSync(out, `// Сгенерировано scripts/build-3d.mjs из scene3d/. Не редактировать вручную.\n/* eslint-disable */\nexport const SCENE_HTML: string = ${JSON.stringify(html)};\n`);
console.log(`sceneHtml.ts: ${(html.length / 1024).toFixed(0)} KB`);
