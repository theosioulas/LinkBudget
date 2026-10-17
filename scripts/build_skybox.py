"""
Render the space background (Cesium sky-box cube faces) from a real star catalogue.

Data: d3-celestial (BSD-3-Clause, (c) Olaf Frohn) — Hipparcos/Tycho stars to magnitude 14 with B-V colour,
and the Milky Way brightness outlines (mw.json). Get it with `npm pack d3-celestial` and pass the
extracted `package/data` directory:

    python3 scripts/build_skybox.py <d3-celestial>/package/data public/skybox 2048

Cube-face convention (matches Cesium's SkyBox, which samples the cube with the direction in the
TEME/equatorial frame and uploads images with flipY): see `face_dirs()`.
"""
import json, math, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

FACES = ['px', 'mx', 'py', 'my', 'pz', 'mz']


def face_dirs(face, n):
    """Unit view directions (x, y, z) for every pixel of a face, rows top→bottom."""
    c = (np.arange(n) + 0.5) / n
    s, v = np.meshgrid(c, c)              # s: column fraction, v: row fraction from the top
    sc, tc = 2 * s - 1, 1 - 2 * v         # GL cube-map coords (t flipped by flipY upload)
    one = np.ones_like(sc)
    d = {
        'px': (one, -tc, -sc), 'mx': (-one, -tc, sc),
        'py': (sc, one, tc), 'my': (sc, -one, -tc),
        'pz': (sc, -tc, one), 'mz': (-sc, -tc, -one),
    }[face]
    x, y, z = (np.asarray(a, dtype=np.float64) for a in d)
    r = np.sqrt(x * x + y * y + z * z)
    return x / r, y / r, z / r


def project(x, y, z, n):
    """Direction(s) → (face, col, row) in pixels, the inverse of face_dirs."""
    ax, ay, az = abs(x), abs(y), abs(z)
    if ax >= ay and ax >= az:
        face, ma, sc, tc = ('px', ax, -z, -y) if x > 0 else ('mx', ax, z, -y)
    elif ay >= az:
        face, ma, sc, tc = ('py', ay, x, z) if y > 0 else ('my', ay, x, -z)
    else:
        face, ma, sc, tc = ('pz', az, x, -y) if z > 0 else ('mz', az, -x, -y)
    s, t = (sc / ma + 1) / 2, (tc / ma + 1) / 2
    return face, s * n, (1 - t) * n


def radec_vec(ra_deg, dec_deg):
    a, d = math.radians(ra_deg), math.radians(dec_deg)
    return math.cos(d) * math.cos(a), math.cos(d) * math.sin(a), math.sin(d)


BV = [(-0.4, (0.60, 0.70, 1.00)), (0.0, (0.80, 0.86, 1.00)), (0.4, (0.98, 0.97, 1.00)), (0.65, (1.00, 0.95, 0.85)),
      (1.0, (1.00, 0.84, 0.65)), (1.5, (1.00, 0.74, 0.50)), (2.0, (1.00, 0.66, 0.42))]


def bv_rgb(bv):
    if bv <= BV[0][0]:
        return BV[0][1]
    for (b0, c0), (b1, c1) in zip(BV, BV[1:]):
        if bv <= b1:
            f = (bv - b0) / (b1 - b0)
            return tuple(c0[i] + f * (c1[i] - c0[i]) for i in range(3))
    return BV[-1][1]


def milky_way(data_dir, n):
    """Milky Way glow per face, from the nested brightness outlines rasterised in RA/Dec then blurred."""
    W, H = 4096, 2048
    mw = json.load(open(f'{data_dir}/mw.json'))
    weights = {'ol1': 0.10, 'ol2': 0.14, 'ol3': 0.20, 'ol4': 0.26, 'ol5': 0.30}  # nested outlines, faint → bright
    acc = np.zeros((H, W), np.float32)
    for f in mw['features']:
        layer = Image.new('L', (W, H), 0)
        dl = ImageDraw.Draw(layer)
        for poly in f['geometry']['coordinates']:
            for k, ring in enumerate(poly):
                for shift in (-360, 0, 360):
                    pts = [((lon + shift + 180) / 360 * W, (90 - lat) / 180 * H) for lon, lat in ring]
                    dl.polygon(pts, fill=0 if k else 255)
        acc += np.asarray(layer, np.float32) / 255 * weights.get(f['id'], 0.2)
    eq = Image.fromarray((np.clip(acc, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(22))
    eq = np.asarray(eq, np.float32) / 255
    # dust-lane / cloud texture: multi-octave value noise
    rng = np.random.default_rng(7)
    tex = np.zeros((H, W), np.float32)
    for octave, amp in ((16, 0.5), (48, 0.3), (160, 0.2)):
        small = Image.fromarray((rng.random((octave // 2, octave)) * 255).astype(np.uint8))
        tex += np.asarray(small.resize((W, H), Image.BICUBIC), np.float32) / 255 * amp
    eq *= 0.45 + 0.9 * tex
    out = {}
    for face in FACES:
        x, y, z = face_dirs(face, n)
        ra = np.degrees(np.arctan2(y, x))           # -180..180 like d3-celestial
        dec = np.degrees(np.arcsin(np.clip(z, -1, 1)))
        px = np.clip(((ra + 180) / 360 * W).astype(int), 0, W - 1)
        py = np.clip(((90 - dec) / 180 * H).astype(int), 0, H - 1)
        out[face] = eq[py, px]
    return out


def splat(img, cx, cy, sigma, rgb, peak):
    n = img.shape[0]
    r = int(math.ceil(3 * sigma)) + 1
    x0, x1 = max(0, int(cx) - r), min(n, int(cx) + r + 1)
    y0, y1 = max(0, int(cy) - r), min(n, int(cy) + r + 1)
    if x0 >= x1 or y0 >= y1:
        return
    xs = np.arange(x0, x1) + 0.5 - cx
    ys = np.arange(y0, y1) + 0.5 - cy
    g = np.exp(-(ys[:, None] ** 2 + xs[None, :] ** 2) / (2 * sigma * sigma)) * peak
    for i in range(3):
        img[y0:y1, x0:x1, i] += g * rgb[i]


def main(data_dir, out_dir, n):
    faces = {f: np.zeros((n, n, 3), np.float32) for f in FACES}
    mw = milky_way(data_dir, n)
    glow = (0.55, 0.60, 0.75)
    for f in FACES:
        for i in range(3):
            faces[f][..., i] += mw[f] * 0.2 * glow[i]
    stars = json.load(open(f'{data_dir}/stars.14.json'))['features']
    scale = n / 2048
    for st in stars:
        mag = float(st['properties']['mag'])
        try:
            bv = float(st['properties']['bv'])
        except (TypeError, ValueError):
            bv = 0.6
        lon, lat = st['geometry']['coordinates']
        face, cx, cy = project(*radec_vec(lon, lat), n)
        rgb = bv_rgb(bv)
        # brightness: perceptual (sqrt of flux) with a floor so faint stars still read as dust
        peak = min(1.8, 1.0 * 10 ** (-0.4 * (mag - 2.0) * 0.42))
        peak = max(peak, 0.11 if mag < 9 else 0.06)
        sigma = (0.55 + 0.5 * max(0.0, (4.5 - mag) / 6)) * scale
        splat(faces[face], cx, cy, sigma, rgb, peak)
        if mag < 2.5:  # soft halo for the brightest stars
            splat(faces[face], cx, cy, 3.2 * scale, rgb, 0.12 * (2.5 - mag + 0.5))
    for f in FACES:
        a = np.clip(faces[f], 0, 1) ** (1 / 1.15)
        Image.fromarray((a * 255 + 0.5).astype(np.uint8)).save(f'{out_dir}/{f}.jpg', quality=93, subsampling=0)
        print('wrote', f)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 2048)
