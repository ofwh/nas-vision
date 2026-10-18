const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const iconsDir = path.join(root, 'public/static/icons');
const output = path.join(root, 'constants/icons.ts');

const files = fs
  .readdirSync(iconsDir)
  .filter((file) => file.endsWith('.png') && fs.statSync(path.join(iconsDir, file)).isFile())
  .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

const lines = files.map((file) => `  '/static/icons/${file}',`);

const content = `/** public/static/icons 下的内置图标，改动目录后重新生成。 */
export const APP_ICONS: readonly string[] = [
${lines.join('\n')}
];
`;

fs.writeFileSync(output, content);
console.log(`已更新 ${path.relative(root, output)}，共 ${files.length} 个图标`);
