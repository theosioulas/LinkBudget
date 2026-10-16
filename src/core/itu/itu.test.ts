import { describe, it, expect, beforeAll } from 'vitest';
import fixtures from './__fixtures__.json';
import { rainAttenuation } from './p618';
import { rainSpecificAttenuation } from './p838';
import { gaseousAttenuationSlant } from './p676';
import { cloudSpecificCoefficient } from './p840';
import { siteClimate, atmosphericAttenuation, availabilityForMargin } from './atmosphere';
import { loadGridsFromDisk } from '../../test/loadGrids';

const rel = (a: number, b: number) => Math.abs(a - b) / Math.abs(b);

describe('ITU-R models vs ITU-Rpy reference', () => {
  beforeAll(() => loadGridsFromDisk());

  for (const c of fixtures) {
    const tag = `${c.lat},${c.lon} ${c.f}GHz el${c.el} p${c.p}`;
    it(`P.838 specific attenuation ${tag}`, () => {
      expect(rel(rainSpecificAttenuation(c.R001, c.f, c.el, c.tau), c.gr)).toBeLessThan(0.005);
    });
    it(`P.618 rain attenuation ${tag}`, () => {
      const A = rainAttenuation({ lat: c.lat, fGHz: c.f, elDeg: c.el, hsKm: c.hs, pPct: c.p, R001: c.R001, hRainKm: c.hr, tauDeg: c.tau });
      expect(rel(A, c.Ar)).toBeLessThan(0.01);
    });
    it(`P.676 slant gaseous attenuation ${tag}`, () => {
      expect(rel(gaseousAttenuationSlant(c.f, c.el, c.rho, 1013.25, 288.15, c.V), c.Ag)).toBeLessThan(0.02);
    });
    it(`P.840 Kl ${tag}`, () => {
      expect(rel(cloudSpecificCoefficient(c.f, 0), c.Kl)).toBeLessThan(0.005);
    });
    it(`climate maps ${tag}`, () => {
      const s = siteClimate(c.lat, c.lon);
      expect(s.source).toBe('itu-maps');
      expect(rel(s.R001, c.R001)).toBeLessThan(0.15);
      expect(Math.abs(s.hRain - c.hr)).toBeLessThan(0.25);
      expect(rel(s.V, c.V)).toBeLessThan(0.1);
    });
  }

  it('availability inversion is consistent with forward model', () => {
    const climate = siteClimate(40.7, -74);
    const base = { lat: 40.7, fGHz: 19.7, elDeg: 35, tauDeg: 45, antennaDiameterM: 0.7, climate };
    const A = atmosphericAttenuation({ ...base, pPct: 0.3 }).total;
    const av = availabilityForMargin(A, base);
    expect(Math.abs(av - 99.7)).toBeLessThan(0.02);
  });
});
