/**
 * Global ITU-R digital maps resampled to uniform lat/lon grids
 * (see scripts/build_itu_grids.py). Grid row 0 = +90°, col 0 = −180°.
 */
export interface GridMeta {
  file: string;
  res: number;
  nlat: number;
  nlon: number;
  scale: number;
  description: string;
}

export type GridName =
  | 'r001' | 'h0' | 'lred_0.1' | 'lred_1' | 'lred_5' | 'rho_50' | 'v_50' | 'nwet_50' | 'topo';

export class Grid {
  constructor(public meta: GridMeta, private data: Uint16Array) {}
  /** Bilinear interpolation at lat [deg], lon [deg]. */
  at(lat: number, lon: number): number {
    const { res, nlat, nlon, scale } = this.meta;
    let L = ((lon + 180) % 360 + 360) % 360; // 0..360
    const x = L / res;
    const y = (90 - Math.max(-90, Math.min(90, lat))) / res;
    const j0 = Math.min(nlon - 2, Math.floor(x));
    const i0 = Math.min(nlat - 2, Math.floor(y));
    const tx = x - j0, ty = y - i0;
    const d = this.data;
    const v00 = d[i0 * nlon + j0], v01 = d[i0 * nlon + j0 + 1];
    const v10 = d[(i0 + 1) * nlon + j0], v11 = d[(i0 + 1) * nlon + j0 + 1];
    return ((1 - ty) * ((1 - tx) * v00 + tx * v01) + ty * ((1 - tx) * v10 + tx * v11)) * scale;
  }
}

export class ItuGrids {
  grids = new Map<GridName, Grid>();
  get ready() { return this.grids.size > 0; }
  set(name: GridName, meta: GridMeta, buf: ArrayBuffer) {
    this.grids.set(name, new Grid(meta, new Uint16Array(buf)));
  }
  get(name: GridName): Grid | undefined { return this.grids.get(name); }
}

/** Process-wide singleton used by the propagation models. */
export const ituGrids = new ItuGrids();

/** Browser loader: fetches all grids listed in the manifest. */
export async function loadItuGrids(baseUrl: string): Promise<void> {
  const manifest: Record<GridName, GridMeta> = await (await fetch(`${baseUrl}manifest.json`)).json();
  await Promise.all(
    (Object.keys(manifest) as GridName[]).map(async (name) => {
      const meta = manifest[name];
      const buf = await (await fetch(`${baseUrl}${meta.file}`)).arrayBuffer();
      ituGrids.set(name, meta, buf);
    }),
  );
}
