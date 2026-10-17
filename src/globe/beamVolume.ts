import * as Cesium from 'cesium';
import type { Vec3 } from '../core/vec';

const FILL_HEIGHT = 1200; // m above the ellipsoid: keeps the draped footprint off the globe surface
const LINE_HEIGHT = 2500;

export interface BeamVolumeStyle {
  /** Opacity of the cone surface (apex → footprint edge). */
  coneAlpha: number;
  /** Opacity of the footprint fill on the ground. */
  fillAlpha: number;
  /** Opacity / width of the footprint outline. */
  lineAlpha: number;
  lineWidth: number;
  /** Number of edge rays drawn from the apex to the footprint edge. */
  rays: number;
}

/**
 * STK-style sensor volume: a translucent cone from the satellite to the real beam footprint,
 * the footprint draped on the curved Earth (filled + outlined) and a few edge rays.
 * The footprint ring comes from ray-casting the beam edge onto the WGS-84 ellipsoid, so the
 * shape follows the Earth's curvature and stretches correctly at low elevation.
 */
export class BeamVolume {
  private cone: Cesium.Primitive | null = null;
  private fill: Cesium.Primitive | null = null;
  private lines = new Cesium.PolylineCollection();
  private outline: Cesium.Polyline;
  private rayLines: Cesium.Polyline[] = [];
  private color: Cesium.Color;
  private ringKey = '';
  private lastFill = 0;
  private visible = false;

  constructor(private scene: Cesium.Scene, color: Cesium.Color, private style: BeamVolumeStyle) {
    this.color = color;
    scene.primitives.add(this.lines);
    const z = [Cesium.Cartesian3.UNIT_X, Cesium.Cartesian3.UNIT_Y];
    this.outline = this.lines.add({ positions: z, width: style.lineWidth, show: false, material: this.mat(style.lineAlpha) });
    for (let k = 0; k < style.rays; k++) this.rayLines.push(this.lines.add({ positions: z, width: 1.2, show: false, material: this.mat(style.lineAlpha * 0.55) }));
  }

  private mat(alpha: number) {
    return Cesium.Material.fromType('Color', { color: this.color.withAlpha(alpha) });
  }

  /** Large beams (GEO/MEO) get a fainter surface so they don't wash over the view. */
  setAlphas(cone: number, fill: number) {
    if (fill !== this.style.fillAlpha) this.ringKey = '';
    this.style = { ...this.style, coneAlpha: cone, fillAlpha: fill };
  }

  setColor(c: Cesium.Color) {
    if (Cesium.Color.equals(c, this.color)) return;
    this.color = c;
    this.outline.material = this.mat(this.style.lineAlpha);
    for (const r of this.rayLines) r.material = this.mat(this.style.lineAlpha * 0.55);
    this.ringKey = '';
  }

  /**
   * apexKm: satellite ECEF [km]; ring: footprint edge as [lat, lon] (deg), closed or open.
   * opts.cone / opts.footprint toggle the two parts.
   */
  update(apexKm: Vec3, ring: [number, number][], opts: { cone: boolean; footprint: boolean }) {
    if (ring.length < 4 || (!opts.cone && !opts.footprint)) { this.hide(); return; }
    this.visible = true;
    const closed = ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1] ? ring : [...ring, ring[0]];
    const edge = closed.map(([la, lo]) => Cesium.Cartesian3.fromDegrees(lo, la, LINE_HEIGHT));
    const apex = new Cesium.Cartesian3(apexKm[0] * 1000, apexKm[1] * 1000, apexKm[2] * 1000);

    // footprint outline: follows the ground, so it stays on the curved surface
    this.outline.show = opts.footprint;
    if (opts.footprint) this.outline.positions = edge;

    // edge rays from the apex
    const n = closed.length - 1;
    this.rayLines.forEach((r, k) => {
      r.show = opts.cone;
      if (opts.cone) r.positions = [apex, edge[Math.floor((k * n) / this.rayLines.length)]];
    });

    // cone surface: triangle fan apex → edge, rebuilt every frame (cheap: ~100 vertices)
    if (this.cone) this.scene.primitives.remove(this.cone);
    this.cone = null;
    if (opts.cone) this.cone = this.scene.primitives.add(this.fan(apex, edge));

    // draped footprint fill: rebuilt only when the ring moves (or at most ~6 Hz)
    const key = `${closed.length}:${closed[0][0].toFixed(3)},${closed[0][1].toFixed(3)}:${closed[n >> 1][0].toFixed(3)}`;
    const now = performance.now();
    if (!opts.footprint) {
      if (this.fill) { this.scene.primitives.remove(this.fill); this.fill = null; }
      this.ringKey = '';
    } else if (key !== this.ringKey && now - this.lastFill > 160) {
      this.ringKey = key;
      this.lastFill = now;
      if (this.fill) this.scene.primitives.remove(this.fill);
      this.fill = this.scene.primitives.add(new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
          geometry: new Cesium.PolygonGeometry({
            polygonHierarchy: new Cesium.PolygonHierarchy(closed.slice(0, -1).map(([la, lo]) => Cesium.Cartesian3.fromDegrees(lo, la))),
            height: FILL_HEIGHT, granularity: Cesium.Math.toRadians(0.25), arcType: Cesium.ArcType.GEODESIC,
          }),
          attributes: { color: Cesium.ColorGeometryInstanceAttribute.fromColor(this.color.withAlpha(this.style.fillAlpha)) },
        }),
        appearance: new Cesium.PerInstanceColorAppearance({ translucent: true, flat: true }),
        asynchronous: false,
      }));
    }
  }

  private fan(apex: Cesium.Cartesian3, edge: Cesium.Cartesian3[]) {
    const n = edge.length;
    const pos = new Float64Array((n + 1) * 3);
    pos[0] = apex.x; pos[1] = apex.y; pos[2] = apex.z;
    edge.forEach((p, k) => { pos[3 * (k + 1)] = p.x; pos[3 * (k + 1) + 1] = p.y; pos[3 * (k + 1) + 2] = p.z; });
    const idx = new Uint16Array((n - 1) * 3);
    for (let k = 0; k < n - 1; k++) { idx[3 * k] = 0; idx[3 * k + 1] = k + 1; idx[3 * k + 2] = k + 2; }
    const attributes = new Cesium.GeometryAttributes();
    attributes.position = new Cesium.GeometryAttribute({ componentDatatype: Cesium.ComponentDatatype.DOUBLE, componentsPerAttribute: 3, values: pos });
    const geometry = new Cesium.Geometry({
      attributes,
      indices: idx,
      primitiveType: Cesium.PrimitiveType.TRIANGLES,
      boundingSphere: Cesium.BoundingSphere.fromVertices(Array.from(pos)),
    });
    return new Cesium.Primitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry,
        attributes: { color: Cesium.ColorGeometryInstanceAttribute.fromColor(this.color.withAlpha(this.style.coneAlpha)) },
      }),
      appearance: new Cesium.PerInstanceColorAppearance({ translucent: true, flat: true, closed: false }),
      asynchronous: false,
      compressVertices: false,
    });
  }

  hide() {
    if (!this.visible) return;
    this.visible = false;
    this.outline.show = false;
    for (const r of this.rayLines) r.show = false;
    if (this.cone) { this.scene.primitives.remove(this.cone); this.cone = null; }
    if (this.fill) { this.scene.primitives.remove(this.fill); this.fill = null; }
    this.ringKey = '';
  }

  destroy() {
    this.hide();
    this.scene.primitives.remove(this.lines);
  }
}
