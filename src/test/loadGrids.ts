import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ituGrids, type GridName, type GridMeta } from '../core/itu/grids';

export function loadGridsFromDisk() {
  if (ituGrids.ready) return;
  const dir = resolve(__dirname, '../../public/itu');
  const manifest = JSON.parse(readFileSync(resolve(dir, 'manifest.json'), 'utf8')) as Record<GridName, GridMeta>;
  for (const name of Object.keys(manifest) as GridName[]) {
    const b = readFileSync(resolve(dir, manifest[name].file));
    ituGrids.set(name, manifest[name], b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
  }
}
