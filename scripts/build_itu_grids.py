"""Resample ITU-R digital maps (from the ITU-Rpy distribution) onto uniform
lat/lon grids and store them as compact little-endian uint16 binaries.

Output grid convention: row 0 = +90 deg lat, col 0 = -180 deg lon,
step `res` degrees, value = raw * scale.

Usage: python3 scripts/build_itu_grids.py <ITU-Rpy repo root> <out dir>
"""
import json
import os
import sys

import numpy as np


def load(root, rel):
    return np.load(os.path.join(root, 'itur', 'data', rel))['arr_0']


def bilinear(lat_src, lon_src, z, lat_q, lon_q):
    """lat_src/lon_src are 1D monotonic axes of grid z[lat, lon]."""
    if lat_src[0] > lat_src[-1]:
        lat_src = lat_src[::-1]
        z = z[::-1, :]
    lon_q = np.where(lon_q < lon_src[0], lon_q + 360, lon_q)
    lon_q = np.where(lon_q > lon_src[-1], lon_q - 360, lon_q)
    i = np.clip(np.searchsorted(lat_src, lat_q) - 1, 0, len(lat_src) - 2)
    j = np.clip(np.searchsorted(lon_src, lon_q) - 1, 0, len(lon_src) - 2)
    ti = (lat_q - lat_src[i]) / (lat_src[i + 1] - lat_src[i])
    tj = (lon_q - lon_src[j]) / (lon_src[j + 1] - lon_src[j])
    ti = np.clip(ti, 0, 1)
    tj = np.clip(tj, 0, 1)
    return ((1 - ti) * (1 - tj) * z[i, j] + ti * (1 - tj) * z[i + 1, j] +
            (1 - ti) * tj * z[i, j + 1] + ti * tj * z[i + 1, j + 1])


def axes(lat2d, lon2d):
    return lat2d[:, 0].astype(float), lon2d[0, :].astype(float)


def main(root, out):
    os.makedirs(out, exist_ok=True)
    specs = [
        # name, data, lat, lon, res, scale, description
        ('r001', '837/v7_r001.npz', '837/v7_lat_r001.npz', '837/v7_lon_r001.npz', 0.5, 0.01,
         'ITU-R P.837-7 rainfall rate exceeded 0.01% of an average year [mm/h]'),
        ('h0', '839/v4_esa0height.npz', '839/v4_esalat.npz', '839/v4_esalon.npz', 1.0, 0.001,
         'ITU-R P.839-4 mean annual 0 degC isotherm height above mean sea level [km]'),
        ('lred_0.1', '840/v7_lred_01.npz', '840/v7_lat.npz', '840/v7_lon.npz', 1.0, 0.0001,
         'ITU-R P.840-7 reduced cloud liquid water content exceeded 0.1% [kg/m2]'),
        ('lred_1', '840/v7_lred_1.npz', '840/v7_lat.npz', '840/v7_lon.npz', 1.0, 0.0001,
         'ITU-R P.840-7 reduced cloud liquid water content exceeded 1% [kg/m2]'),
        ('lred_5', '840/v7_lred_5.npz', '840/v7_lat.npz', '840/v7_lon.npz', 1.0, 0.0001,
         'ITU-R P.840-7 reduced cloud liquid water content exceeded 5% [kg/m2]'),
        ('rho_50', '836/v6_rho_50.npz', '836/v6_lat.npz', '836/v6_lon.npz', 1.0, 0.001,
         'ITU-R P.836-6 surface water vapour density (median) [g/m3]'),
        ('v_50', '836/v6_v_50.npz', '836/v6_lat.npz', '836/v6_lon.npz', 1.0, 0.001,
         'ITU-R P.836-6 total columnar water vapour (median) [kg/m2]'),
        ('nwet_50', '453/v13_nwet_annual_50.npz', '453/v13_lat_n.npz', '453/v13_lon_n.npz', 1.0, 0.01,
         'ITU-R P.453-13 wet term of surface refractivity (median) [ppm]'),
        ('topo', '1511/v1_topo_0dot5.npz', '1511/v1_lat.npz', '1511/v1_lon.npz', 0.5, 0.001,
         'ITU-R P.1511-1 topographic height above mean sea level [km]'),
    ]
    manifest = {}
    for name, f, flat, flon, res, scale, desc in specs:
        z = load(root, f)
        lat_src, lon_src = axes(load(root, flat), load(root, flon))
        nlat = int(round(180 / res)) + 1
        nlon = int(round(360 / res)) + 1
        lat_q = 90 - np.arange(nlat) * res
        lon_q = -180 + np.arange(nlon) * res
        LAT, LON = np.meshgrid(lat_q, lon_q, indexing='ij')
        g = bilinear(lat_src, lon_src, z, LAT.ravel(), LON.ravel()).reshape(nlat, nlon)
        g = np.clip(np.nan_to_num(g), 0, None)
        raw = np.clip(np.round(g / scale), 0, 65535).astype('<u2')
        raw.tofile(os.path.join(out, name + '.bin'))
        manifest[name] = dict(file=name + '.bin', res=res, nlat=nlat, nlon=nlon,
                              scale=scale, description=desc,
                              min=float(g.min()), max=float(g.max()))
        print(name, g.shape, g.min(), g.max())
    with open(os.path.join(out, 'manifest.json'), 'w') as fh:
        json.dump(manifest, fh, indent=1)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
