import * as Cesium from 'cesium';
import type { SatelliteDef } from '../core/orbit/propagator';
import { satEcef, satEci } from '../core/orbit/propagator';
import { orbitRing } from '../core/orbit/kepler';
import { gmst } from '../core/time';
import type { Constellation, Payload, Terminal } from '../core/model';
import { beamFootprints, coverageRing, steeredSpotFootprint, type Footprint } from '../core/rf/beams';
import { evaluateBeam } from '../core/rf/beams';
import { sub, unit as unit3, dot as dot3, norm as norm3, type Vec3 } from '../core/vec';
import { geodeticToEcef } from '../core/geo/coords';
import { pointInRing } from '../core/geo/polygon';
import { BeamVolume } from './beamVolume';

import type { Layers } from '../store/store';

export type ViewMode = 'terminal' | 'earth' | 'satellite';
import { rampColor, type CoverageResult } from '../core/sim/coverage';

export const REUSE_COLORS = ['#4cc9f0', '#06d6a0', '#ffd166', '#ef476f', '#b388ff', '#ff9f43', '#90e0ef'];
const BEAM_A = Cesium.Color.fromCssColorString('#22d3ee');
const BEAM_B = Cesium.Color.fromCssColorString('#f472b6');

const km = (v: Vec3, out?: Cesium.Cartesian3) => {
  const o = out ?? new Cesium.Cartesian3();
  o.x = v[0] * 1000; o.y = v[1] * 1000; o.z = v[2] * 1000;
  return o;
};
const ll = (lat: number, lon: number, h = 0) => Cesium.Cartesian3.fromDegrees(lon, lat, h);

const satSvg = (color: string) => `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><defs><radialGradient id="g"><stop offset="0" stop-color="${color}" stop-opacity="0.55"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient></defs><circle cx="24" cy="24" r="23" fill="url(#g)"/><g transform="rotate(-30 24 24)"><rect x="3" y="20" width="14" height="8" rx="1" fill="#1d4ed8" stroke="#bfdbfe" stroke-width="1"/><rect x="31" y="20" width="14" height="8" rx="1" fill="#1d4ed8" stroke="#bfdbfe" stroke-width="1"/><line x1="17" y1="24" x2="31" y2="24" stroke="#e5e7eb" stroke-width="1.5"/><rect x="19" y="18" width="10" height="12" rx="2" fill="#f8fafc" stroke="${color}" stroke-width="1.6"/><circle cx="24" cy="33" r="2.4" fill="${color}"/></g></svg>`,
)}`;

const TERMINAL_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44"><defs><radialGradient id="g"><stop offset="0" stop-color="#22d3ee" stop-opacity="0.9"/><stop offset="1" stop-color="#22d3ee" stop-opacity="0"/></radialGradient></defs><circle cx="22" cy="22" r="21" fill="url(#g)"/><rect x="11" y="15" width="22" height="14" rx="2" fill="#0b1220" stroke="#e2f7ff" stroke-width="2"/><g fill="#22d3ee">${Array.from({ length: 12 }, (_, i) => `<circle cx="${14.5 + (i % 4) * 5}" cy="${18.5 + Math.floor(i / 4) * 3.5}" r="1.1"/>`).join('')}</g></svg>`,
)}`;

export interface LiveLinks {
  A: { satId: string; phase: string; active: boolean; aim?: [number, number] } | null;
  B: { satId: string; phase: string; active: boolean; aim?: [number, number] } | null;
}

export class GlobeController {
  viewer: Cesium.Viewer;
  private points = new Cesium.PointPrimitiveCollection();
  private labels = new Cesium.LabelCollection();
  private icons = new Cesium.BillboardCollection();
  private iconA: Cesium.Billboard | null = null;
  private iconB: Cesium.Billboard | null = null;
  private iconSel: Cesium.Billboard | null = null;
  private groundTrack = new Cesium.PolylineCollection();
  private trackFor: string | null = null;
  private trackAt = 0;
  private orbits = new Cesium.PolylineCollection();
  private coverage = new Cesium.PolylineCollection();
  private linkLines = new Cesium.PolylineCollection();
  private footOutlines = new Cesium.PolylineCollection();
  private footFill: Cesium.Primitive | null = null;
  private activeFill: Cesium.Primitive | null = null;
  private sats: SatelliteDef[] = [];
  private satIndex = new Map<string, number>();
  private pointList: Cesium.PointPrimitive[] = [];
  private labelBySat = new Map<string, Cesium.Label>();
  private coverageBySat = new Map<string, Cesium.Polyline>();
  private consts = new Map<string, Constellation>();
  private payloads = new Map<string, Payload>();
  private ringEpoch = 0;
  private lastCoverage = 0;
  private lastFoot = 0;
  private terminalEntity: Cesium.Entity | null = null;
  private scanCone: Cesium.Entity | null = null;
  private walls: Cesium.Entity[] = [];
  private terminal: Terminal | null = null;
  private links: LiveLinks = { A: null, B: null };
  private selectedId: string | null = null;
  private focusId: string | null = null;
  private layers: Layers | null = null;
  private tmp = new Cesium.Cartesian3();
  private imageryKind = '';
  private nightLayer: Cesium.ImageryLayer | null = null;
  private baseLayer: Cesium.ImageryLayer | null = null;
  private imageryErrors = 0;
  private nightFailed = false;
  onImageryFallback?: () => void;
  onPick?: (satId: string | null) => void;
  onPickGround?: (lat: number, lon: number) => void;
  onHover?: (satId: string | null, x: number, y: number) => void;
  onTick?: (ms: number) => void;
  onViewModeChange?: (m: ViewMode) => void;
  pickGroundMode = false;

  constructor(container: HTMLElement, creditContainer: HTMLElement) {
    this.viewer = new Cesium.Viewer(container, {
      baseLayer: false, animation: false, timeline: false, baseLayerPicker: false, geocoder: false, homeButton: false,
      sceneModePicker: false, navigationHelpButton: false, fullscreenButton: false, infoBox: false, selectionIndicator: false,
      creditContainer, shouldAnimate: true, msaaSamples: 4,
      skyBox: undefined,
    });
    const scene = this.viewer.scene;
    // Render at the display's native resolution (sharp on HiDPI/Retina screens) with FXAA on top of MSAA.
    this.viewer.useBrowserRecommendedResolution = false;
    this.viewer.resolutionScale = 1;
    scene.postProcessStages.fxaa.enabled = true;
    // Google Earth-style navigation: left drag grabs and moves the globe, the wheel zooms toward the
    // cursor, middle drag (or Shift+drag) tilts and rotates around the point under the cursor,
    // right drag zooms, Ctrl+drag looks around. The compass / N key turns north back up.
    const ssc = scene.screenSpaceCameraController;
    ssc.rotateEventTypes = [Cesium.CameraEventType.LEFT_DRAG];
    ssc.tiltEventTypes = [Cesium.CameraEventType.MIDDLE_DRAG, Cesium.CameraEventType.PINCH,
      { eventType: Cesium.CameraEventType.LEFT_DRAG, modifier: Cesium.KeyboardEventModifier.SHIFT }];
    ssc.zoomEventTypes = [Cesium.CameraEventType.WHEEL, Cesium.CameraEventType.PINCH];
    // Right drag (or Ctrl+drag): look around from where the camera is, e.g. tilt down near the
    // terminal and turn to look up at the satellites passing overhead.
    ssc.lookEventTypes = [Cesium.CameraEventType.RIGHT_DRAG, { eventType: Cesium.CameraEventType.LEFT_DRAG, modifier: Cesium.KeyboardEventModifier.CTRL }];
    ssc.enableLook = true;
    ssc.inertiaSpin = 0.85;
    ssc.inertiaTranslate = 0.85;
    ssc.inertiaZoom = 0.6;
    // High-resolution star background rendered from the Hipparcos catalogue (scripts/build_skybox.py).
    const sky = (f: string) => new URL(`skybox/${f}.jpg`, document.baseURI).href;
    scene.skyBox = new Cesium.SkyBox({
      sources: { positiveX: sky('px'), negativeX: sky('mx'), positiveY: sky('py'), negativeY: sky('my'), positiveZ: sky('pz'), negativeZ: sky('mz') },
    });
    scene.globe.tileCacheSize = 400;
    scene.globe.enableLighting = true;
    scene.globe.dynamicAtmosphereLighting = true;
    scene.globe.dynamicAtmosphereLightingFromSun = true;
    scene.globe.showGroundAtmosphere = true;
    scene.globe.baseColor = Cesium.Color.fromCssColorString('#0b1a2e');
    scene.globe.atmosphereLightIntensity = 12;
    scene.fog.enabled = true;
    scene.globe.maximumScreenSpaceError = 1.2;
    if (scene.skyAtmosphere) scene.skyAtmosphere.show = true;
    scene.screenSpaceCameraController.minimumZoomDistance = 2_000;
    scene.screenSpaceCameraController.maximumZoomDistance = 120_000_000;
    this.viewer.clock.clockRange = Cesium.ClockRange.UNBOUNDED;
    scene.primitives.add(this.orbits);
    scene.primitives.add(this.coverage);
    scene.primitives.add(this.footOutlines);
    scene.primitives.add(this.linkLines);
    scene.primitives.add(this.points);
    scene.primitives.add(this.labels);
    scene.primitives.add(this.icons);
    scene.primitives.add(this.groundTrack);
    const mkIcon = (c: string) => this.icons.add({ position: Cesium.Cartesian3.UNIT_X, image: satSvg(c), width: 38, height: 38, show: false });
    this.iconA = mkIcon('#22d3ee');
    this.iconB = mkIcon('#f472b6');
    this.iconSel = mkIcon('#ffffff');
    this.setImagery('satellite');

    scene.preRender.addEventListener(() => this.frame());
    // Pointer state: auto-adjustments never run while a mouse button is held.
    scene.canvas.addEventListener('pointerdown', () => { this.pointerDown = true; });
    window.addEventListener('pointerup', () => { this.pointerDown = false; });
    const h = new Cesium.ScreenSpaceEventHandler(scene.canvas);
    h.setInputAction((e: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
      if (this.pickGroundMode) {
        const c = this.viewer.camera.pickEllipsoid(e.position, scene.globe.ellipsoid);
        if (c) { const g = Cesium.Cartographic.fromCartesian(c); this.onPickGround?.(Cesium.Math.toDegrees(g.latitude), Cesium.Math.toDegrees(g.longitude)); }
        return;
      }
      const p = scene.pick(e.position);
      const id = p && typeof p.id === 'string' && this.satIndex.has(p.id) ? (p.id as string) : null;
      this.onPick?.(id);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    let lastHover = 0;
    h.setInputAction((e: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
      const now = performance.now();
      if (now - lastHover < 60) return;
      lastHover = now;
      const p = scene.pick(e.endPosition);
      const id = p && typeof p.id === 'string' && this.satIndex.has(p.id) ? (p.id as string) : null;
      this.onHover?.(id, e.endPosition.x, e.endPosition.y);
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }

  // ------------------------------------------------------------ imagery
  setImagery(kind: string) {
    if (kind === this.imageryKind) return;
    this.imageryKind = kind;
    const layers = this.viewer.imageryLayers;
    if (this.baseLayer) layers.remove(this.baseLayer, true);
    let layer: Cesium.ImageryLayer;
    if (kind === 'satellite') {
      layer = new Cesium.ImageryLayer(new Cesium.UrlTemplateImageryProvider({
        url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        maximumLevel: 17, credit: new Cesium.Credit('Imagery © Esri, Maxar, Earthstar Geographics'),
      }));
      this.imageryErrors = 0;
      (layer.imageryProvider as Cesium.UrlTemplateImageryProvider).errorEvent.addEventListener((err: Cesium.TileProviderError) => {
        err.retry = false;
        if (++this.imageryErrors === 4 && this.imageryKind === 'satellite') { this.imageryKind = ''; this.setImagery('natural'); this.onImageryFallback?.(); }
      });
    } else if (kind === 'dark') {
      layer = new Cesium.ImageryLayer(new Cesium.UrlTemplateImageryProvider({
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', subdomains: 'abcd', maximumLevel: 18,
        credit: new Cesium.Credit('© OpenStreetMap contributors © CARTO'),
      }));
    } else {
      layer = Cesium.ImageryLayer.fromProviderAsync(Cesium.TileMapServiceImageryProvider.fromUrl(Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII')), {});
    }
    layers.add(layer, 0);
    this.baseLayer = layer;
  }

  setNightLights(on: boolean) {
    if (on && !this.nightLayer && !this.nightFailed) {
      const l = new Cesium.ImageryLayer(new Cesium.UrlTemplateImageryProvider({
        url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_Black_Marble/default/2016-01-01/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png',
        maximumLevel: 8, credit: new Cesium.Credit('Night lights: NASA Black Marble (GIBS)'),
      }));
      let errs = 0;
      (l.imageryProvider as Cesium.UrlTemplateImageryProvider).errorEvent.addEventListener((err: Cesium.TileProviderError) => {
        err.retry = false;
        if (++errs === 4 && this.nightLayer === l) { this.viewer.imageryLayers.remove(l, true); this.nightLayer = null; this.nightFailed = true; }
      });
      l.dayAlpha = 0.0;
      l.nightAlpha = 0.9;
      l.brightness = 1.6;
      this.viewer.imageryLayers.add(l);
      this.nightLayer = l;
    } else if (!on && this.nightLayer) {
      this.viewer.imageryLayers.remove(this.nightLayer, true);
      this.nightLayer = null;
    }
  }

  applyLayers(l: Layers) {
    const prev = this.layers;
    this.layers = l;
    this.setImagery(l.imagery);
    this.setNightLights(l.nightLights);
    const s = this.viewer.scene;
    s.globe.enableLighting = l.lighting;
    if (s.skyAtmosphere) s.skyAtmosphere.show = l.atmosphere;
    s.globe.showGroundAtmosphere = l.atmosphere;
    this.footOutlines.show = l.beams;
    if (this.footFill) this.footFill.show = l.beams;
    if (this.scanCone) this.scanCone.show = l.scanCone;
    for (const w of this.walls) w.show = l.walls;
    this.labels.show = l.labels;
    this.orbits.show = l.orbits;
    this.coverage.show = l.coverage;
    this.linkLines.show = l.links;
    this.groundTrack.show = l.groundTrack;
    this.icons.show = l.links || l.dotsLEO || l.dotsMEO || l.dotsGEO;
    this.applyDotVisibility();
    if (!prev || prev.allOrbitsOpacity !== l.allOrbitsOpacity) this.rebuildOrbits(this.currentMs());
  }

  private applyDotVisibility() {
    const l = this.layers;
    this.sats.forEach((s, i) => {
      const oc = this.consts.get(s.constellationId)?.orbitClass;
      const on = !l || (oc === 'GEO' ? l.dotsGEO : oc === 'MEO' ? l.dotsMEO : l.dotsLEO);
      const p = this.pointList[i];
      p.show = on;
      p.pixelSize = this.basePixel(s.id);
      const lb = this.labelBySat.get(s.id);
      if (lb) lb.show = on;
    });
  }

  // ------------------------------------------------------------ scenario
  setScenario(sats: SatelliteDef[], constellations: Constellation[], payloads: Payload[]) {
    this.sats = sats;
    this.consts = new Map(constellations.map((c) => [c.id, c]));
    this.payloads = new Map(payloads.map((p) => [p.id, p]));
    this.points.removeAll();
    this.labels.removeAll();
    this.pointList = [];
    this.satIndex.clear();
    this.labelBySat.clear();
    sats.forEach((s, i) => {
      const c = this.consts.get(s.constellationId)!;
      this.satIndex.set(s.id, i);
      const pt = this.points.add({
        id: s.id, position: Cesium.Cartesian3.ZERO, color: Cesium.Color.fromCssColorString(c.color), pixelSize: 3,
        outlineColor: Cesium.Color.BLACK.withAlpha(0.6), outlineWidth: c.orbitClass === 'LEO' ? 0 : 1,
        scaleByDistance: c.orbitClass === 'LEO' ? new Cesium.NearFarScalar(2e6, 1.6, 6e7, 0.7) : undefined,
      });
      this.pointList.push(pt);
      if (c.showLabels) {
        const lb = this.labels.add({
          position: Cesium.Cartesian3.ZERO, text: s.name, font: '12px Inter, system-ui, sans-serif', fillColor: Cesium.Color.fromCssColorString(c.color),
          outlineColor: Cesium.Color.BLACK, outlineWidth: 3, style: Cesium.LabelStyle.FILL_AND_OUTLINE, pixelOffset: new Cesium.Cartesian2(10, -8),
          horizontalOrigin: Cesium.HorizontalOrigin.LEFT, distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, c.orbitClass === 'GEO' ? 1.6e8 : 6e7), scale: 0.95,
        });
        this.labelBySat.set(s.id, lb);
      }
    });
    this.applyDotVisibility();
    this.rebuildOrbits(this.currentMs());
    this.rebuildCoverage();
    this.lastFoot = 0;
  }

  updatePayloads(payloads: Payload[], constellations: Constellation[]) {
    this.payloads = new Map(payloads.map((p) => [p.id, p]));
    this.consts = new Map(constellations.map((c) => [c.id, c]));
    this.lastFoot = 0;
    this.rebuildOrbits(this.currentMs());
    this.rebuildCoverage();
  }

  private basePixel(id: string) {
    const s = this.sats[this.satIndex.get(id) ?? -1];
    if (!s) return 3;
    const oc = this.consts.get(s.constellationId)?.orbitClass;
    const k = this.layers?.pointSize ?? 3;
    if (id === this.links.A?.satId || id === this.links.B?.satId) return 11;
    if (id === this.selectedId) return 12;
    return oc === 'GEO' ? k + 6 : oc === 'MEO' ? k + 4 : oc === 'LEO' ? k - (s.constellationId === 'starlink' ? 1 : 0) : k + 2;
  }

  setTerminal(t: Terminal) {
    const moved = this.terminal && (this.terminal.lat !== t.lat || this.terminal.lon !== t.lon);
    this.terminal = t;
    if (moved && this.viewMode === 'terminal') setTimeout(() => this.setView('terminal', { duration: 1.2 }), 0);
    const pos = ll(t.lat, t.lon, t.altM);
    if (!this.terminalEntity) {
      this.terminalEntity = this.viewer.entities.add({
        position: pos,
        billboard: { image: TERMINAL_SVG, width: 40, height: 40, disableDepthTestDistance: Number.POSITIVE_INFINITY },
        label: {
          text: t.name, font: '600 13px Inter, system-ui, sans-serif', fillColor: Cesium.Color.WHITE, outlineColor: Cesium.Color.BLACK, outlineWidth: 3,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE, pixelOffset: new Cesium.Cartesian2(0, 30), disableDepthTestDistance: Number.POSITIVE_INFINITY,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 4e7),
        },
      });
    }
    this.terminalEntity.position = new Cesium.ConstantPositionProperty(pos);
    if (this.terminalEntity.label) this.terminalEntity.label.text = new Cesium.ConstantProperty(t.name);
    // scan cone (electronic steering limit) above the terminal
    const L = 900_000;
    const top = t.type === 'phased-array' ? L * Math.tan(Cesium.Math.toRadians(Math.min(t.maxScanDeg, 80))) : 60_000;
    const center = ll(t.lat, t.lon, L / 2);
    const hpr = new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(t.panelAzDeg), 0, -Cesium.Math.toRadians(t.panelTiltDeg));
    const orient = Cesium.Transforms.headingPitchRollQuaternion(center, hpr);
    for (const w of this.walls) this.viewer.entities.remove(w);
    this.walls = [];
    for (const o of t.obstructions ?? []) {
      // obstruction "wall": an arc at 120 km from the terminal whose height subtends the blocked elevation
      const r = 120, span = ((o.azTo - o.azFrom) % 360 + 360) % 360 || 360;
      const pts: number[] = [], heights: number[] = [];
      for (let k = 0; k <= 24; k++) {
        const az = Cesium.Math.toRadians(o.azFrom + (span * k) / 24);
        const lat = t.lat + (r * Math.cos(az)) / 111.2;
        const lon = t.lon + (r * Math.sin(az)) / (111.2 * Math.cos(Cesium.Math.toRadians(t.lat)));
        pts.push(lon, lat);
        heights.push(r * 1000 * Math.tan(Cesium.Math.toRadians(Math.min(o.elMax, 80))));
      }
      this.walls.push(this.viewer.entities.add({
        wall: {
          positions: Cesium.Cartesian3.fromDegreesArray(pts), maximumHeights: heights, minimumHeights: heights.map(() => 0),
          material: Cesium.Color.fromCssColorString('#f87171').withAlpha(0.22), outline: true, outlineColor: Cesium.Color.fromCssColorString('#f87171').withAlpha(0.7),
        },
        show: this.layers?.walls ?? true,
      }));
    }
    if (this.scanCone) this.viewer.entities.remove(this.scanCone);
    this.scanCone = this.viewer.entities.add({
      position: center, orientation: orient,
      cylinder: {
        length: L, topRadius: top, bottomRadius: 0, material: Cesium.Color.fromCssColorString('#22d3ee').withAlpha(0.07), outline: true,
        outlineColor: Cesium.Color.fromCssColorString('#22d3ee').withAlpha(0.35), numberOfVerticalLines: 12, slices: 64,
      },
      show: this.layers?.scanCone ?? true,
    });
    this.lastFoot = 0;
  }

  setLinks(l: LiveLinks) {
    const changed = l.A?.satId !== this.links.A?.satId || l.B?.satId !== this.links.B?.satId || l.A?.phase !== this.links.A?.phase || l.B?.phase !== this.links.B?.phase || l.A?.active !== this.links.A?.active;
    const old = [this.links.A?.satId, this.links.B?.satId];
    this.links = l;
    if (changed) {
      for (const id of [...old, l.A?.satId, l.B?.satId]) this.restyle(id);
      this.lastFoot = 0;
      // Satellite view: glide to the new serving satellite after a handover.
      const serving = this.servingSatId();
      if (this.viewMode === 'satellite' && this.followServing && serving && serving !== this.followSatId) {
        this.setView('satellite', { satId: 'serving', duration: 1.2 });
      }
    }
  }

  setSelected(id: string | null, focus: string | null) {
    const old = this.selectedId;
    this.selectedId = id;
    this.restyle(old);
    this.restyle(id);
    if (focus !== this.focusId) { this.focusId = focus; this.lastFoot = 0; }
  }

  private restyle(id: string | null | undefined) {
    if (!id) return;
    const i = this.satIndex.get(id);
    if (i === undefined) return;
    const p = this.pointList[i];
    const c = this.consts.get(this.sats[i].constellationId)!;
    p.pixelSize = this.basePixel(id);
    if (id === this.links.A?.satId) { p.outlineColor = BEAM_A; p.outlineWidth = 3; p.color = Cesium.Color.WHITE; }
    else if (id === this.links.B?.satId) { p.outlineColor = BEAM_B; p.outlineWidth = 3; p.color = Cesium.Color.WHITE; }
    else if (id === this.selectedId) { p.outlineColor = Cesium.Color.WHITE; p.outlineWidth = 3; p.color = Cesium.Color.fromCssColorString(c.color); }
    else { p.outlineColor = Cesium.Color.BLACK.withAlpha(0.6); p.outlineWidth = c.orbitClass === 'LEO' ? 0 : 1; p.color = Cesium.Color.fromCssColorString(c.color); }
  }

  // ------------------------------------------------------------ time
  currentMs() { return Cesium.JulianDate.toDate(this.viewer.clock.currentTime).getTime(); }
  setTime(ms: number) { this.viewer.clock.currentTime = Cesium.JulianDate.fromDate(new Date(ms)); }
  setClock(multiplier: number, playing: boolean) { this.viewer.clock.multiplier = multiplier; this.viewer.clock.shouldAnimate = playing; }

  // ------------------------------------------------------------ orbits & coverage
  private rebuildOrbits(ms: number) {
    this.orbits.removeAll();
    this.ringEpoch = ms;
    const opacity = this.layers?.allOrbitsOpacity ?? 0.35;
    const byPlane = new Map<string, SatelliteDef>();
    for (const s of this.sats) {
      const c = this.consts.get(s.constellationId);
      if (!c?.showOrbits) continue;
      const key = `${s.constellationId}:${s.kind === 'sgp4' ? s.id : s.plane}`;
      if (!byPlane.has(key)) byPlane.set(key, s);
    }
    for (const s of byPlane.values()) {
      const c = this.consts.get(s.constellationId)!;
      const ring = s.kind === 'geo' ? geoRing() : orbitRing(s.el, ms, c.orbitClass === 'LEO' ? 96 : 180);
      this.orbits.add({
        positions: ring.map((p) => km(p)), width: c.orbitClass === 'LEO' ? 1 : 1.5,
        material: Cesium.Material.fromType('Color', { color: Cesium.Color.fromCssColorString(c.color).withAlpha(c.orbitClass === 'LEO' ? opacity * 0.6 : opacity + 0.15) }),
      });
    }
    function geoRing(): Vec3[] {
      const out: Vec3[] = [];
      for (let k = 0; k <= 360; k += 2) { const a = (k * Math.PI) / 180; out.push([42164.17 * Math.cos(a), 42164.17 * Math.sin(a), 0]); }
      return out;
    }
  }

  private rebuildCoverage() {
    this.coverage.removeAll();
    this.coverageBySat.clear();
    for (const s of this.sats) {
      const c = this.consts.get(s.constellationId);
      if (!c?.showCoverage) continue;
      const pl = this.payloads.get(c.payloadId);
      const line = this.coverage.add({ positions: [Cesium.Cartesian3.ZERO, Cesium.Cartesian3.UNIT_X], width: 1.5, material: Cesium.Material.fromType('Color', { color: Cesium.Color.fromCssColorString(c.color).withAlpha(0.4) }) });
      (line as unknown as { _minEl: number })._minEl = pl?.minElevationDeg ?? 10;
      this.coverageBySat.set(s.id, line);
    }
    this.lastCoverage = 0;
  }

  // ------------------------------------------------------------ per frame
  private frame() {
    const ms = this.currentMs();
    // satellites
    for (let i = 0; i < this.sats.length; i++) {
      const p = satEcef(this.sats[i], ms);
      this.pointList[i].position = km(p, this.tmp);
    }
    for (const [id, lb] of this.labelBySat) {
      const i = this.satIndex.get(id)!;
      lb.position = km(satEcef(this.sats[i], ms), this.tmp);
    }
    // orbit rings follow Earth rotation: r_ecef = Rz(−GMST)·r_eci
    if (Math.abs(ms - this.ringEpoch) > 3 * 3600_000) this.rebuildOrbits(ms);
    this.orbits.modelMatrix = Cesium.Matrix4.fromRotationTranslation(Cesium.Matrix3.fromRotationZ(-gmst(ms)));
    const wall = performance.now();
    if (wall - this.lastCoverage > 400) {
      this.lastCoverage = wall;
      for (const [id, line] of this.coverageBySat) {
        const s = this.sats[this.satIndex.get(id)!];
        const ring = coverageRing(satEcef(s, ms), (line as unknown as { _minEl: number })._minEl, 72);
        line.positions = ring.map(([la, lo]) => ll(la, lo, 3000));
      }
    }
    this.followCamera(ms);
    this.reportHeading();
    this.limitTilt();
    this.drawLinks(ms);
    this.drawIcons(ms);
    if (this.selectedId !== this.trackFor || Math.abs(ms - this.trackAt) > 60_000) this.drawGroundTrack(ms);
    if (wall - this.lastFoot > 250) { this.lastFoot = wall; this.drawFootprints(ms); }
    this.onTick?.(ms);
  }

  private terminalEcefKm(): Vec3 | null {
    if (!this.terminal) return null;
    const c = ll(this.terminal.lat, this.terminal.lon, this.terminal.altM);
    return [c.x / 1000, c.y / 1000, c.z / 1000];
  }

  private pool: Record<'A' | 'B', { glow: Cesium.Polyline; dash: Cesium.Polyline; vol: BeamVolume; ringCache?: { satId: string; at: number; ring: [number, number][] } }> | null = null;
  private fovPool: BeamVolume[] = [];
  private lastFov = 0;

  private ensurePool() {
    if (this.pool) return this.pool;
    const mk = (key: 'A' | 'B') => {
      const color = key === 'A' ? BEAM_A : BEAM_B;
      const z = [Cesium.Cartesian3.UNIT_X, Cesium.Cartesian3.UNIT_Y];
      return {
        glow: this.linkLines.add({ positions: z, width: 9, show: false, material: Cesium.Material.fromType('PolylineGlow', { color, glowPower: 0.22, taperPower: 1 }) }),
        dash: this.linkLines.add({ positions: z, width: 4, show: false, material: Cesium.Material.fromType('PolylineDash', { color, gapColor: Cesium.Color.TRANSPARENT, dashLength: 18 }) }),
        vol: new BeamVolume(this.viewer.scene, color, { coneAlpha: 0.2, fillAlpha: 0.28, lineAlpha: 0.95, lineWidth: 2.5, rays: 4 }),
      };
    };
    this.pool = { A: mk('A'), B: mk('B') };
    return this.pool;
  }

  private drawLinks(ms: number) {
    const pool = this.ensurePool();
    const t = this.terminalEcefKm();
    for (const key of ['A', 'B'] as const) {
      const P = pool[key];
      const L = this.links[key];
      const s = L ? this.sats[this.satIndex.get(L.satId) ?? -1] : undefined;
      if (!t || !L || !s) {
        P.glow.show = P.dash.show = false;
        P.vol.hide();
        continue;
      }
      const sp = satEcef(s, ms);
      const tracking = L.phase === 'tracking';
      const line = [km(t), km(sp)];
      P.glow.show = tracking;
      P.dash.show = !tracking;
      if (tracking) { P.glow.positions = line; P.glow.width = L.active ? 7 : 4; } else P.dash.positions = line;
      // Satellite-side beam serving the terminal, drawn as a sensor volume onto the curved Earth.
      const showCone = this.layers?.cones ?? true, showFoot = this.layers?.beams ?? true;
      if (!tracking || (!showCone && !showFoot)) { P.vol.hide(); continue; }
      const ring = this.servingBeamRing(key, L, s, sp, ms);
      if (!ring) { P.vol.hide(); continue; }
      const oc = this.consts.get(s.constellationId)?.orbitClass;
      P.vol.setAlphas(oc === 'GEO' ? 0.05 : oc === 'MEO' ? 0.1 : 0.22, oc === 'GEO' ? 0.12 : 0.28);
      P.vol.update(sp, ring, { cone: showCone, footprint: showFoot });
    }
    const wall = performance.now();
    if (wall - this.lastFov > 400) { this.lastFov = wall; this.drawFovCones(ms); }
  }

  /** Footprint edge (−3 dB) of the beam that serves the terminal from satellite `s`, or null if not covered. */
  private servingBeamRing(key: 'A' | 'B', L: NonNullable<LiveLinks['A']>, s: SatelliteDef, sp: Vec3, ms: number): [number, number][] | null {
    const c = this.consts.get(s.constellationId);
    const pl = c && this.payloads.get(c.payloadId);
    if (!pl || !this.terminal) return null;
    const user = { lat: this.terminal.lat, lon: this.terminal.lon, alt: 0 };
    const pose = () => ({ ecef: sp, velEcef: sub(satEcef(s, ms + 500), satEcef(s, ms - 500)) });
    switch (pl.layout.kind) {
      case 'steerable-cells': {
        const aim = L.aim ?? [user.lat, user.lon];
        return steeredSpotFootprint(pl, sp, aim[0], aim[1]);
      }
      case 'spot':
      case 'hex-grid': {
        const ev = evaluateBeam(pl, pose(), user);
        return ev.covered ? steeredSpotFootprint({ ...pl, pattern: { ...pl.pattern, kind: 'bessel', scanLossExp: 0 } }, sp, ev.aim[0], ev.aim[1]) : null;
      }
      case 'fixed-strips':
      case 'kml': {
        // Polygon beams: recompute at ~5 Hz (strips move with the satellite; KML beams are fixed).
        const P = this.pool![key];
        const wall = performance.now();
        if (P.ringCache && P.ringCache.satId === s.id && wall - P.ringCache.at < (pl.layout.kind === 'kml' ? 2000 : 200)) return P.ringCache.ring;
        const ev = evaluateBeam(pl, pose(), user);
        let ring: [number, number][] | null = null;
        if (ev.covered) {
          const fps = beamFootprints(pl, pose(), user);
          const mine = pl.layout.kind === 'kml' ? fps.filter((f) => f.id.startsWith(`${ev.beamId}#`)) : fps.filter((f) => f.id === ev.beamId);
          // outermost (lowest-level) contour of the serving beam; prefer a ring containing the terminal
          const outer = mine.filter((f) => f.level === mine[mine.length - 1]?.level);
          ring = (outer.find((f) => pointInRing(user.lat, user.lon, f.ring)) ?? outer[0])?.ring ?? null;
        }
        P.ringCache = { satId: s.id, at: wall, ring: ring ?? [] };
        return ring;
      }
    }
  }

  /** Field-of-view cones (to the minimum-elevation edge) of the LEO/MEO satellites the terminal can see. */
  private drawFovCones(ms: number) {
    const MAX = 6;
    if (!this.fovPool.length) for (let k = 0; k < MAX; k++) this.fovPool.push(new BeamVolume(this.viewer.scene, Cesium.Color.WHITE, { coneAlpha: 0.06, fillAlpha: 0.05, lineAlpha: 0.45, lineWidth: 1.5, rays: 0 }));
    const on = (this.layers?.fovCones ?? true) && this.terminal;
    const picked: { s: SatelliteDef; p: Vec3; el: number; minEl: number }[] = [];
    if (on) {
      const t = this.terminal!;
      const obs = geodeticToEcef(t.lat, t.lon, 0);
      const up = unit3(obs);
      for (let i = 0; i < this.sats.length; i++) {
        const s = this.sats[i];
        const c = this.consts.get(s.constellationId);
        if (!c || c.orbitClass === 'GEO' || !this.pointList[i].show) continue;
        const p = satEcef(s, ms);
        const d = sub(p, obs);
        const el = (Math.asin(dot3(d, up) / norm3(d)) * 180) / Math.PI;
        const minEl = this.payloads.get(c.payloadId)?.minElevationDeg ?? 10;
        if (el >= minEl) picked.push({ s, p, el, minEl });
      }
      picked.sort((a, b) => b.el - a.el);
    }
    this.fovPool.forEach((cone, k) => {
      const x = picked[k];
      if (!x) { cone.hide(); return; }
      const c = this.consts.get(x.s.constellationId)!;
      cone.setColor(Cesium.Color.fromCssColorString(c.color));
      cone.update(x.p, coverageRing(x.p, x.minEl, 72), { cone: true, footprint: true });
    });
  }

  private drawIcons(ms: number) {
    const place = (b: Cesium.Billboard | null, id: string | null | undefined) => {
      if (!b) return;
      const s = id ? this.sats[this.satIndex.get(id) ?? -1] : undefined;
      b.show = !!s;
      if (s) b.position = km(satEcef(s, ms), this.tmp);
    };
    place(this.iconA, this.links.A?.satId);
    place(this.iconB, this.links.B?.satId);
    const sel = this.selectedId && this.selectedId !== this.links.A?.satId && this.selectedId !== this.links.B?.satId ? this.selectedId : null;
    place(this.iconSel, sel);
  }

  /** Ground track of the selected satellite: −10 min … +1 orbit (GEO: 24 h figure-8). */
  private drawGroundTrack(ms: number) {
    this.trackFor = this.selectedId;
    this.trackAt = ms;
    this.groundTrack.removeAll();
    const s = this.selectedId ? this.sats[this.satIndex.get(this.selectedId) ?? -1] : undefined;
    if (!s) return;
    const period = 2 * Math.PI * Math.sqrt(s.el.a ** 3 / 398600.4418) * 1000;
    const span = s.kind === 'geo' ? 86_400_000 : Math.min(period, 6 * 3600_000);
    const n = 240;
    const color = Cesium.Color.fromCssColorString(this.consts.get(s.constellationId)?.color ?? '#fff');
    let seg: Cesium.Cartesian3[] = [];
    let lastLon: number | null = null;
    const flush = () => {
      if (seg.length > 1) this.groundTrack.add({ positions: seg, width: 2, material: Cesium.Material.fromType('PolylineDash', { color: color.withAlpha(0.85), dashLength: 12 }) });
      seg = [];
    };
    for (let k = 0; k <= n; k++) {
      const t = ms - 600_000 + (k / n) * (span + 600_000);
      const g = Cesium.Cartographic.fromCartesian(km(satEcef(s, t)));
      const lon = Cesium.Math.toDegrees(g.longitude);
      if (lastLon !== null && Math.abs(lon - lastLon) > 180) flush();
      lastLon = lon;
      seg.push(Cesium.Cartesian3.fromRadians(g.longitude, g.latitude, 4000));
    }
    flush();
  }

  private drawFootprints(ms: number) {
    this.footOutlines.removeAll();
    if (this.footFill) { this.viewer.scene.primitives.remove(this.footFill); this.footFill = null; }
    if (this.activeFill) { this.viewer.scene.primitives.remove(this.activeFill); this.activeFill = null; }
    // Full beam layouts only for an explicitly focused satellite (Focus / Beam Lab); the LEO cell grid
    // around the terminal only when the "cell grid" layer is on.
    const focusIds = new Set<string>();
    if (this.focusId) focusIds.add(this.focusId);
    const active = this.links.A?.active ? this.links.A : this.links.B?.active ? this.links.B : null;
    if (this.layers?.cellGrid && active) {
      const s = this.sats[this.satIndex.get(active.satId) ?? -1];
      const pl = s && this.payloads.get(this.consts.get(s.constellationId)?.payloadId ?? '');
      if (pl?.layout.kind === 'steerable-cells') focusIds.add(active.satId);
    }
    const instances: Cesium.GeometryInstance[] = [];
    const user = this.terminal ? { lat: this.terminal.lat, lon: this.terminal.lon, alt: 0 } : undefined;
    const drawnLayouts = new Set<string>();
    for (const id of focusIds) {
      const s = this.sats[this.satIndex.get(id) ?? -1];
      if (!s) continue;
      const c = this.consts.get(s.constellationId);
      const pl = c && this.payloads.get(c.payloadId);
      if (!pl) continue;
      // steerable cell grids are ground-fixed: draw once per payload
      const layoutKey = pl.layout.kind === 'steerable-cells' ? `cells:${pl.id}` : id;
      if (drawnLayouts.has(layoutKey)) continue;
      drawnLayouts.add(layoutKey);
      const sp = satEcef(s, ms);
      const vel = sub(satEcef(s, ms + 500), satEcef(s, ms - 500));
      const fps: Footprint[] = beamFootprints(pl, { ecef: sp, velEcef: vel }, user, pl.layout.kind === 'steerable-cells' ? 4 : 3);
      const isKml = pl.layout.kind === 'kml';
      const levels = isKml ? fps.map((f) => f.level ?? 0) : [];
      const lmax = Math.max(...levels, 0), lmin = Math.min(...levels, 0);
      for (const f of fps) {
        if (f.ring.length < 4) continue;
        const col = Cesium.Color.fromCssColorString(REUSE_COLORS[f.color % REUSE_COLORS.length]);
        const positions = f.ring.map(([a, b]) => ll(a, b, 1500));
        const t = isKml && lmax > lmin ? ((f.level ?? lmin) - lmin) / (lmax - lmin) : 0.5;
        this.footOutlines.add({ positions, width: f.active ? 3 : isKml ? 1 : 1.2, material: Cesium.Material.fromType('Color', { color: col.withAlpha(f.active ? 1 : isKml ? 0.35 + 0.5 * t : 0.85) }) });
        instances.push(new Cesium.GeometryInstance({
          geometry: new Cesium.PolygonGeometry({ polygonHierarchy: new Cesium.PolygonHierarchy(f.ring.map(([a, b]) => ll(a, b))), height: 1000, granularity: Cesium.Math.toRadians(0.5) }),
          attributes: { color: Cesium.ColorGeometryInstanceAttribute.fromColor(col.withAlpha(f.active ? 0.45 : isKml ? 0.025 + 0.05 * t : 0.16)) },
        }));
      }
    }
    if (instances.length) {
      this.footFill = this.viewer.scene.primitives.add(new Cesium.Primitive({
        geometryInstances: instances, asynchronous: false,
        appearance: new Cesium.PerInstanceColorAppearance({ translucent: true, flat: true }),
      }));
    }
  }

  // ------------------------------------------------------------ camera
  /**
   * View modes. Terminal and Earth fly to their target and then leave the camera free for
   * Google Earth-style navigation; Satellite locks the camera's frame to the moving satellite
   * (camera.lookAtTransform) so it stays centred while it moves.
   *  - terminal: orbit around the earth station
   *  - earth: orbit around the Earth's centre (whole globe and GEO belt)
   *  - satellite: follow a satellite as it moves
   */
  viewMode: ViewMode = 'terminal';
  private followSatId: string | null = null;
  /** Satellite view tracks whichever satellite carries traffic (switches on handover). */
  private followServing = false;
  private flying = false;

  private servingSatId(): string | null {
    return this.links.A?.active ? this.links.A.satId : this.links.B?.active ? this.links.B.satId : this.links.A?.satId ?? this.links.B?.satId ?? null;
  }

  private release() {
    this.viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
  }

  setView(mode: ViewMode, opts: { satId?: string | null; rangeKm?: number; pitchDeg?: number; duration?: number } = {}) {
    if (this.viewer.isDestroyed()) return;
    const cam = this.viewer.camera;
    cam.cancelFlight();
    this.release();
    this.viewMode = mode;
    if (mode === 'satellite') {
      this.followServing = !opts.satId || opts.satId === 'serving';
      this.followSatId = this.followServing ? this.servingSatId() : opts.satId!;
    } else {
      this.followServing = false;
      this.followSatId = null;
    }
    const duration = opts.duration ?? 1.6;
    const pitch = Cesium.Math.toRadians(opts.pitchDeg ?? (mode === 'terminal' ? -35 : -50));
    if (mode === 'terminal' && this.terminal) {
      const target = ll(this.terminal.lat, this.terminal.lon, 0);
      const hpr = new Cesium.HeadingPitchRange(0, pitch, (opts.rangeKm ?? 3500) * 1000);
      this.flying = true;
      cam.flyToBoundingSphere(new Cesium.BoundingSphere(target, 1), {
        offset: hpr, duration,
        complete: () => { this.flying = false; this.release(); },
        cancel: () => { this.flying = false; },
      });
    } else if (mode === 'earth') {
      const lon = this.terminal?.lon ?? 0, lat = Math.max(-30, Math.min(30, this.terminal?.lat ?? 0));
      const range = (opts.rangeKm ?? 110_000) * 1000;
      this.flying = true;
      cam.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(lon, lat, range), duration,
        orientation: { heading: 0, pitch: -Cesium.Math.PI_OVER_TWO, roll: 0 },
        complete: () => { this.flying = false; this.release(); },
        cancel: () => { this.flying = false; },
      });
    } else if (mode === 'satellite' && this.followSatId) {
      const s = this.sats[this.satIndex.get(this.followSatId) ?? -1];
      if (!s) return;
      const p = km(satEcef(s, this.currentMs()));
      const altKm = Cesium.Cartesian3.magnitude(p) / 1000 - 6371;
      const range = (opts.rangeKm ?? (altKm > 30000 ? 30000 : altKm > 5000 ? 12000 : 2200)) * 1000;
      const hpr = new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-35), range);
      this.flying = true;
      cam.flyToBoundingSphere(new Cesium.BoundingSphere(p, 1), {
        offset: hpr, duration,
        complete: () => {
          this.flying = false;
          if (this.viewMode !== 'satellite') return;
          const now = km(satEcef(s, this.currentMs()));
          cam.lookAtTransform(Cesium.Transforms.eastNorthUpToFixedFrame(now), hpr);
        },
        cancel: () => { this.flying = false; },
      });
    }
  }

  /** Keep the satellite-follow frame on the moving satellite while preserving the user's orbit offset. */
  private followCamera(ms: number) {
    if (this.viewMode !== 'satellite' || !this.followSatId || this.flying) return;
    const s = this.sats[this.satIndex.get(this.followSatId) ?? -1];
    if (!s) return;
    const cam = this.viewer.camera;
    if (Cesium.Matrix4.equals(cam.transform, Cesium.Matrix4.IDENTITY)) return;
    const off = Cesium.Cartesian3.clone(cam.position);
    cam.lookAtTransform(Cesium.Transforms.eastNorthUpToFixedFrame(km(satEcef(s, ms))), off);
  }

  onHeading?: (deg: number) => void;
  private lastHeading = NaN;
  private reportHeading() {
    const h = Cesium.Math.toDegrees(this.viewer.camera.heading);
    if (Math.abs(h - this.lastHeading) > 0.5) { this.lastHeading = h; this.onHeading?.(h); }
  }

  /**
   * Like Google Earth: the higher the camera, the less it may tilt, so zooming out of a tilted view
   * swings back toward looking down and the Earth stays on screen instead of sinking to the bottom.
   * Applied gradually (eases each frame) so it never fights a drag.
   */
  private pointerDown = false;
  private limitTilt() {
    if (this.flying || this.viewMode === 'satellite' || this.pointerDown) return;
    const cam = this.viewer.camera;
    if (!Cesium.Matrix4.equals(cam.transform, Cesium.Matrix4.IDENTITY)) return;
    const h = cam.positionCartographic.height;
    // High up (whole-globe views): keep the Earth centred on screen. Zoom goes toward the cursor,
    // which otherwise walks the globe off to one side; ease the view back onto the Earth's centre.
    if (h > 15e6) { this.centreOnEarth(0.12); return; }
    // Below 4,000 km the camera is completely free: any tilt down to the horizon, looking up at the sky.
    if (h < 4e6) return;
    // In between, tilt is limited a little more the higher the camera (88° at 4,000 km → 30° at 15,000 km).
    const maxTilt = 88 - 58 * (Math.log(h / 4e6) / Math.log(15e6 / 4e6));
    const canvas = this.viewer.scene.canvas;
    const center = cam.pickEllipsoid(new Cesium.Cartesian2(canvas.clientWidth / 2, canvas.clientHeight / 2));
    if (!center) {
      // looking past the Earth: tip the view down toward it
      const pitch = cam.pitch + (-Cesium.Math.PI_OVER_TWO - cam.pitch) * 0.12;
      cam.setView({ orientation: { heading: cam.heading, pitch, roll: 0 } });
      return;
    }
    const inv = Cesium.Matrix4.inverseTransformation(Cesium.Transforms.eastNorthUpToFixedFrame(center), new Cesium.Matrix4());
    const local = Cesium.Matrix4.multiplyByPoint(inv, cam.positionWC, new Cesium.Cartesian3());
    const range = Cesium.Cartesian3.magnitude(local);
    const tilt = Cesium.Math.toDegrees(Math.acos(Math.min(1, Math.max(-1, local.z / range))));
    if (tilt <= maxTilt + 0.3) return;
    const newTilt = tilt - Math.max(0.3, (tilt - maxTilt) * 0.15);
    const heading = Math.atan2(-local.x, -local.y);
    cam.lookAt(center, new Cesium.HeadingPitchRange(heading, -Cesium.Math.toRadians(90 - newTilt), range));
    cam.lookAtTransform(Cesium.Matrix4.IDENTITY);
  }

  /** Turn the camera (in place) toward the Earth's centre by fraction k of the remaining angle; k = 1 snaps. */
  centreOnEarth(k = 1) {
    const cam = this.viewer.camera;
    const want = Cesium.Cartesian3.normalize(Cesium.Cartesian3.negate(cam.positionWC, new Cesium.Cartesian3()), new Cesium.Cartesian3());
    const dir = cam.directionWC;
    const ang = Cesium.Cartesian3.angleBetween(dir, want);
    if (ang < 2e-4) return;
    const t = ang < 0.002 ? 1 : k;
    const nd = Cesium.Cartesian3.normalize(Cesium.Cartesian3.lerp(dir, want, t, new Cesium.Cartesian3()), new Cesium.Cartesian3());
    // keep north up: up = the Earth's axis projected perpendicular to the view direction
    const z = Cesium.Cartesian3.UNIT_Z;
    let up = Cesium.Cartesian3.subtract(z, Cesium.Cartesian3.multiplyByScalar(nd, Cesium.Cartesian3.dot(z, nd), new Cesium.Cartesian3()), new Cesium.Cartesian3());
    if (Cesium.Cartesian3.magnitude(up) < 1e-6) up = Cesium.Cartesian3.clone(cam.upWC);
    Cesium.Cartesian3.normalize(up, up);
    cam.setView({ destination: Cesium.Cartesian3.clone(cam.positionWC), orientation: { direction: nd, up } });
  }

  /** Turn the view back to north-up (like Google Earth's compass / N key), keeping tilt and range. */
  resetNorth() {
    const cam = this.viewer.camera;
    const canvas = this.viewer.scene.canvas;
    const center = cam.pickEllipsoid(new Cesium.Cartesian2(canvas.clientWidth / 2, canvas.clientHeight / 2));
    if (this.viewMode === 'satellite' && !Cesium.Matrix4.equals(cam.transform, Cesium.Matrix4.IDENTITY)) {
      const p = cam.position, range = Cesium.Cartesian3.magnitude(p);
      cam.lookAtTransform(cam.transform, new Cesium.HeadingPitchRange(0, -Math.atan2(p.z, Math.hypot(p.x, p.y)), range));
      return;
    }
    if (!center) { cam.flyTo({ destination: cam.positionWC, orientation: { heading: 0, pitch: cam.pitch, roll: 0 }, duration: 0.6 }); return; }
    const inv = Cesium.Matrix4.inverseTransformation(Cesium.Transforms.eastNorthUpToFixedFrame(center), new Cesium.Matrix4());
    const local = Cesium.Matrix4.multiplyByPoint(inv, cam.positionWC, new Cesium.Cartesian3());
    const range = Cesium.Cartesian3.magnitude(local);
    const pitch = -Math.atan2(local.z, Math.hypot(local.x, local.y));
    this.flying = true;
    cam.flyToBoundingSphere(new Cesium.BoundingSphere(center, 0), {
      offset: new Cesium.HeadingPitchRange(0, pitch, range), duration: 0.6,
      complete: () => { this.flying = false; this.release(); },
      cancel: () => { this.flying = false; },
    });
  }

  // Backwards-compatible helpers
  flyToTerminal(rangeKm = 9000, pitchDeg = -50, duration = 1.6) { this.setView('terminal', { rangeKm, pitchDeg, duration }); }
  flyGlobal() { this.setView('earth'); }
  flyToSat(id: string) { this.setView('satellite', { satId: id }); }

  /** Frame a satellite's full beam layout (used by Focus / Beam Lab). */
  frameBeamLayout(id: string) {
    const s = this.sats[this.satIndex.get(id) ?? -1];
    if (!s) return;
    const c = this.consts.get(s.constellationId);
    const pl = c && this.payloads.get(c.payloadId);
    if (pl && (pl.layout.kind === 'hex-grid' || pl.layout.kind === 'spot' || pl.layout.kind === 'kml')) {
      let lat: number, lon: number;
      if (pl.layout.kind === 'kml') {
        const b = pl.layout.beams;
        lat = b.reduce((a, x) => a + x.centroid[0], 0) / Math.max(1, b.length);
        lon = b.reduce((a, x) => a + x.centroid[1], 0) / Math.max(1, b.length);
      } else { lat = pl.layout.aimLat; lon = pl.layout.aimLon; }
      const range = pl.layout.kind === 'hex-grid' ? Math.max(3500, pl.layout.spacingDeg * (2 * pl.layout.rings + 1) * 37_000 * Cesium.Math.RADIANS_PER_DEGREE * 1.4) : 8000;
      this.release();
      this.viewMode = 'terminal';
      const target = ll(lat, lon, 0);
      const hpr = new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-70), range * 1000);
      this.flying = true;
      this.viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(target, 1), {
        offset: hpr, duration: 1.6,
        complete: () => { this.flying = false; this.release(); },
        cancel: () => { this.flying = false; },
      });
      this.onViewModeChange?.('terminal');
    } else {
      this.setView('satellite', { satId: id });
      this.onViewModeChange?.('satellite');
    }
  }

  satEci(id: string, ms: number) {
    const s = this.sats[this.satIndex.get(id) ?? -1];
    return s ? satEci(s, ms) : null;
  }

  private coverageMap: Cesium.Primitive | null = null;
  /** Render a coverage heat-map (null clears it). */
  setCoverageMap(r: CoverageResult | null, range?: [number, number]) {
    if (this.coverageMap) { this.viewer.scene.primitives.remove(this.coverageMap); this.coverageMap = null; }
    if (!r || !r.cells.length) return;
    const [lo, hi] = range ?? [r.min, r.max];
    const h = r.stepDeg / 2;
    const instances = r.cells.map((c) => {
      const [R, G, B] = rampColor(hi > lo ? (c.value - lo) / (hi - lo) : 0.5);
      return new Cesium.GeometryInstance({
        geometry: new Cesium.RectangleGeometry({ rectangle: Cesium.Rectangle.fromDegrees(c.lon - h, c.lat - h, c.lon + h, c.lat + h), height: 800, granularity: Cesium.Math.toRadians(1) }),
        attributes: { color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromBytes(R, G, B, 150)) },
      });
    });
    this.coverageMap = this.viewer.scene.primitives.add(new Cesium.Primitive({
      geometryInstances: instances, appearance: new Cesium.PerInstanceColorAppearance({ translucent: true, flat: true }),
    }));
  }

  flyToBounds(b: { south: number; north: number; west: number; east: number }) {
    this.viewer.camera.flyTo({ destination: Cesium.Rectangle.fromDegrees(b.west, b.south, b.east, b.north), duration: 1.5 });
  }

  destroy() { if (!this.viewer.isDestroyed()) this.viewer.destroy(); }
}
