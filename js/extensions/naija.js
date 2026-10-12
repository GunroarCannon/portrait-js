/* Nigerian & African pack — heritages, hairstyles, garments, headwear and textiles for everyday
 * Lagos and the wider continent. Written for the Lagos Swipe game, but it is plain engine content:
 * every piece is a registry entry, so it shows up in the Atelier dropdowns and the generator rolls it.
 *
 * Load it after render.js (and after example.js, whose "yoruba" it replaces with a fuller one).
 *
 * What's inside
 *   heritages  Lagosian (modern default) · Yoruba · Igbo · Hausa · Fulani · Edo · Niger Delta (Ijaw) ·
 *              Efik-Ibibio · Tiv & Middle Belt · Kanuri · Ghanaian · Kenyan · South African · Ethiopian ·
 *              Senegalese · Congolese
 *   hair       dreadlocks · locs in a bun · braids in a bun · faux locs · bantu knots · shuku · irun kiko
 *              (threading) · ghana braids · knotless braids · frontal wig
 *   clothing   kaftan (senator) · buba & puff sleeves · jersey (green-white-green) · babanriga
 *   headwear   red cap · zanna cap · satin bonnet
 *   patterns   ankara · aso-oke
 *   roles      corper · banker · okada rider · influencer · market trader · Nollywood star */
(function (PM) {
  'use strict';
  if (!PM.hairKit || !PM.define) return;
  const K = PM.hairKit, { lerp, clamp } = PM.math, { curve, color } = PM;
  const TAU = Math.PI * 2;
  const rng = (g, k) => K.texRng(g, 'ng:' + k);
  const A = (id, def) => PM.define('archetypes', id, def);
  const orderOf = id => { const d = PM.get('archetypes', id); return d ? d.order : undefined; };

  // ===================================================================== TEXTILES
  PM.define('patterns', 'ankara', {
    label: 'Ankara (bold wax print)',
    draw(P, b, c, rng, s) {
      P.ctx.fillStyle = c[0]; P.ctx.fillRect(b.x - 2, b.y - 2, b.w + 4, b.h + 4);
      const S = 46 * s;
      let row = 0;
      for (let y = b.y - S; y < b.y + b.h + S; y += S * 0.9, row++) {
        for (let x = b.x - S + (row % 2 ? S * 0.5 : 0); x < b.x + b.w + S; x += S) {
          P.dot(x, y, S * 0.42, c[1]); P.dot(x, y, S * 0.31, c[0]); P.dot(x, y, S * 0.2, c[2]); P.dot(x, y, S * 0.07, c[0]);
          // leaves between the discs
          const a = rng.range(0, TAU);
          P.hair([[x + S * 0.5, y + S * 0.42], [x + S * 0.5 + Math.cos(a) * S * 0.12, y + S * 0.42 + Math.sin(a) * S * 0.12]], 3 * s, c[2]);
        }
      }
    },
  });
  PM.define('patterns', 'aso-oke', {
    label: 'Aso-oke (woven bands)',
    draw(P, b, c, rng, s) {
      P.ctx.fillStyle = c[0]; P.ctx.fillRect(b.x - 2, b.y - 2, b.w + 4, b.h + 4);
      const S = 18 * s;
      for (let x = b.x, i = 0; x < b.x + b.w + S; x += S, i++) {
        if (i % 4 === 0) { P.ctx.fillStyle = c[1]; P.ctx.fillRect(x, b.y - 2, S * 0.55, b.h + 4); }
        else if (i % 4 === 2) { P.ctx.fillStyle = c[2]; P.ctx.fillRect(x + S * 0.2, b.y - 2, S * 0.16, b.h + 4); }
      }
      for (let y = b.y; y < b.y + b.h + S; y += S * 1.6) P.hair([[b.x, y], [b.x + b.w, y]], 0.8, c[2], { smooth: false });
    },
  });

  // ===================================================================== HAIR
  /** Soft spiral for a knot / bun: a few rings in the highlight colour. */
  function spiral(P, C, x, y, R, turns = 2.4) {
    const pts = [];
    for (let a = 0; a < turns * TAU; a += 0.35) { const k = a / (turns * TAU), r = R * (0.15 + 0.8 * (1 - k)); pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r * 0.9]); }
    P.hair(pts, 1 * P.lw, C.hairHi);
  }

  /** Loc / braid ends fanning out of a bun, then the bun itself. */
  function bunOf(kind, label) {
    return {
      label, hatFallback: kind === 'loc' ? 'locs' : 'box-braids',
      silhouette: (geo, g) => K.capSil(geo, g, { vol: 5 }),
      texture: kind === 'loc' ? 'coil' : (P, g, geo, C, r, box) => { for (let y = box.y + 6; y < box.y + box.h; y += 10) P.hair([[box.x, y], [box.x + box.w, y + 4]], 0.8 * P.lw, C.hairHi); },
      backExtra(P, g, geo, C) {
        if (geo.hatted) return;
        const R = geo.hw * 0.52 * g.hairVolume, x = geo.cx + g.hairPart * 6, y = geo.top - R * 0.4, r = rng(g, 'bun' + kind);
        for (let i = 0; i < 10; i++) {
          const a = lerp(-3.0, -0.14, (i + 0.5) / 10), L = R * r.range(1.2, 1.5);
          K.drawStrand(P, C, [[x + Math.cos(a) * R * 0.3, y + Math.sin(a) * R * 0.3], [x + Math.cos(a) * R * 0.85, y + Math.sin(a) * R * 0.9], [x + Math.cos(a) * L, y + Math.sin(a) * L + 6]], kind === 'loc' ? 8 : 6, kind, r);
        }
        const d = P.circle(x, y, R, C.hair, { n: 18 });
        P.clip(d, () => { for (let i = 0; i < 6; i++) P.hair(curve.ellipse(x, y, R * (0.25 + i * 0.13), R * (0.22 + i * 0.12), 12, 0, 0.4 + i * 0.9, 3.6 + i * 0.9), 1 * P.lw, C.hairHi); });
        P.band([[x - R * 0.55, y + R * 0.92], [x, y + R * 1.0], [x + R * 0.55, y + R * 0.92]], 6, C.cloth[1], { w: 0.5 });
      },
    };
  }
  K.hairStyle('loc-bun', bunOf('loc', 'Locs in a top bun'));
  K.hairStyle('braid-bun', bunOf('braid', 'Braids in a top bun'));

  K.hairStyle('dreadlocks', {
    label: 'Dreadlocks (long)',
    hatFallback: 'locs',
    silhouette: (geo, g) => K.capSil(geo, g, { vol: 12, side: 6 }),
    texture: 'coil',
    strands: () => ({ kind: 'loc', count: 8, width: 11.5, len: 140, flare: 24, spread: 10 }),
  });

  K.hairStyle('faux-locs', {
    label: 'Faux locs (curly ends)',
    hatFallback: 'locs',
    silhouette: (geo, g) => K.capSil(geo, g, { vol: 7 }),
    texture: 'coil',
    strands: () => ({ kind: 'loc', count: 9, width: 6.8, len: 120, flare: 16, beads: 0.15 }),
    // little curls where each loc ends
    frontExtra(P, g, geo, C) {
      const o = { kind: 'loc', count: 9, width: 6.8, len: 120, flare: 16 }, r = rng(g, 'curl');
      for (const s of K.strandPaths(geo, g, o)) {
        const e = s.pts[3];
        for (const dx of [-3, 3]) {
          const d = curve.ellipse(e[0] + dx, e[1] + 4, 4.5, 4.5, 9, 0, r.range(0, 1), r.range(0, 1) + 4.8);
          P.hair(d, 6 * P.lw, P.ink); P.hair(d, 3.4 * P.lw, C.hair);
        }
      }
    },
  });

  K.hairStyle('knotless-braids', {
    label: 'Knotless braids (long)',
    hatFallback: 'box-braids',
    silhouette: (geo, g) => K.capSil(geo, g, { vol: 5 }),
    texture(P, g, geo, C, r, box) { for (let y = box.y + 6; y < box.y + box.h; y += 11) P.hair([[box.x, y], [box.x + box.w, y + 3]], 0.7 * P.lw, C.hairHi); },
    strands: () => ({ kind: 'braid', count: 11, width: 5.2, len: 150, flare: 14, beads: 0.2 }),
  });

  K.hairStyle('ghana-braids', {
    label: 'Ghana braids (feed-in)',
    hatFallback: 'cornrows',
    silhouette: (geo, g) => K.capSil(geo, g, { vol: 3, side: 2 }),
    hole: () => ({ noPart: true }),
    texture: (P, g, geo, C) => K.rows(P, g, geo, C, 8),
    strands: () => ({ kind: 'braid', count: 5, width: 6.5, len: 140, flare: 18, shortFront: true }),
  });

  K.hairStyle('bantu-knots', {
    label: 'Bantu knots',
    hatFallback: 'afro-puffs',
    silhouette: (geo, g) => K.capSil(geo, g, { vol: 5, side: 4 }),
    hole: geo => ({ noPart: true, hairlineY: geo.hairlineY - 2 }),
    texture: 'none',
    frontInLayer(Q, g, geo, C) {
      const { cx, hw, hh, top } = geo, r = rng(g, 'knots'), R = clamp(11 * g.hairVolume, 9, 14) * (geo.hatted ? 0.8 : 1);
      const cy = top + hh * 0.5, rx = hw * 1.02, ry = hh * 0.5 + R * 0.6, yMax = geo.ears[0].top + 6;
      let row = 0;
      for (let y = top - R * 0.2; y < yMax; y += R * 1.55, row++) {
        const k = clamp(1 - Math.pow((cy - y) / ry, 2), 0, 1), half = rx * Math.sqrt(k) + R * 0.2;
        for (let x = cx - half + (row % 2 ? R * 0.9 : 0); x <= cx + half; x += R * 1.8) {
          const jx = x + r.range(-1.5, 1.5), jy = y + r.range(-1.5, 1.5);
          Q.circle(jx, jy, R, C.hair, { n: 12, w: 0.7 });
          spiral(Q, C, jx, jy, R);
        }
      }
    },
  });

  K.hairStyle('shuku', {
    label: 'Shuku (raised ridge)',
    hatFallback: 'cornrows',
    silhouette(geo, g) {
      const { cx, hw, hh, top } = geo, base = K.capSil(geo, g, { vol: 2.5, side: 2 });
      const w = hw * 0.36, H = 26 * g.hairVolume * (geo.hatted ? 0.3 : 1);
      // swap the crown point for a raised crest running front to back
      return [[cx - w, top + hh * 0.12], [cx - w * 1.05, top - H * 0.55], [cx, top - H], [cx + w * 1.05, top - H * 0.55], [cx + w, top + hh * 0.12], ...base.slice(1)];
    },
    hole: () => ({ noPart: true }),
    texture(P, g, geo, C, r) {
      const { cx, hw, top, hairlineY } = geo;
      // side cornrows sweep up into the ridge
      for (const s of [-1, 1]) for (let i = 0; i < 4; i++) {
        const u = 0.42 + i * 0.16;
        K.drawStrand(P, C, [[cx + s * hw * (0.5 + i * 0.12), hairlineY + 8 + i * 6], [cx + s * hw * u * 1.05, lerp(hairlineY, top, 0.55)], [cx + s * hw * 0.3, top - 6]], 5, 'braid', r);
      }
      // the ridge itself
      for (let y = top - 22; y < hairlineY; y += 8) P.hair([[cx - hw * 0.32, y + 3], [cx, y - 1], [cx + hw * 0.32, y + 3]], 0.9 * P.lw, C.hairHi);
    },
  });

  K.hairStyle('irun-kiko', {
    label: 'Irun kiko (African threading)',
    hatFallback: 'afro-puffs',
    silhouette: (geo, g) => K.capSil(geo, g, { vol: 4 }),
    hole: () => ({ noPart: true }),
    texture: 'coil',
    backExtra(P, g, geo, C) {
      if (geo.hatted) return;
      const { cx, hw, top, hh } = geo, r = rng(g, 'thread'), n = 5;
      for (let i = 0; i < n; i++) {
        const u = (i + 0.5) / n - 0.5, a = -Math.PI / 2 + u * 1.35;
        const bx = cx + u * hw * 1.3, by = top + hh * 0.2 - Math.abs(u) * 6, L = (50 + r.range(-6, 8)) * g.hairVolume * g.hairLength;
        const ex = bx + Math.cos(a) * L, ey = by + Math.sin(a) * L, w = 15, tip = 8;
        const axis = [[bx, by], [lerp(bx, ex, 0.5), lerp(by, ey, 0.5)], [ex, ey]];
        const nx = -Math.sin(a), ny = Math.cos(a);
        P.shape([[bx + nx * w * 0.5, by + ny * w * 0.5], [ex + nx * tip * 0.5, ey + ny * tip * 0.5, true], [ex + Math.cos(a) * 4, ey + Math.sin(a) * 4], [ex - nx * tip * 0.5, ey - ny * tip * 0.5, true], [bx - nx * w * 0.5, by - ny * w * 0.5]], C.hair, { w: 0.9, wob: 0.2 });
        // thread wraps
        const d = curve.open(axis, 0.2), Ld = curve.length(d);
        for (let s = 6; s < Ld; s += 5) {
          const p = curve.at(d, s / Ld);
          const ww = lerp(w, tip, s / Ld) * 0.5;
          P.hair([[p.x + p.nx * ww, p.y + p.ny * ww], [p.x - p.nx * ww + p.tx * 1.5, p.y - p.ny * ww + p.ty * 1.5]], 0.9 * P.lw, C.hairHi, { smooth: false });
        }
        P.bead(ex + Math.cos(a) * 3, ey + Math.sin(a) * 3, tip * 0.5, i % 2 ? C.cloth[1] : C.metal);
      }
    },
  });

  K.hairStyle('frontal-wig', {
    label: 'Frontal wig (bone straight)',
    hatFallback: 'bob',
    silhouette: (geo, g) => K.longSil(geo, g, { len: 125, flare: 3, wave: 0, jag: 0, side: 12, vol: 11 }),
    hole(geo, g) {
      const { cx, hw, hairlineY: hl } = geo, ps = g.hairPart >= 0 ? 1 : -1, px = cx + ps * hw * 0.4;
      const line = ps > 0 ? [[cx + hw * 0.7, hl + 6], [px, hl - 4, true], [cx - hw * 0.2, hl + 6], [cx - hw * 0.72, hl + 14]] : [[cx + hw * 0.72, hl + 14], [cx + hw * 0.2, hl + 6], [px, hl - 4, true], [cx - hw * 0.7, hl + 6]];
      return { line };
    },
    texture: 'flow', flow: { count: 44, maxSteps: 30 },
  });

  // ===================================================================== CLOTHING
  const N = PM.necklines;
  const fab = (g, C, id) => ({ id: id || g.pattern, colors: [C.cloth[0], C.cloth[1], C.cloth[2]], scale: g.patternScale });
  const trimP = (g, C, base) => ({ id: g.trim, colors: [base, C.metal, C.ink], scale: g.patternScale * 0.5 });

  PM.define('clothing', 'kaftan', {
    label: 'Kaftan (senator)',
    draw(P, g, geo, C) {
      const { neckX: x, nw, neckBase: b } = geo;
      P.shape(geo.torso(N.round(geo, 4, 1.05)), C.cloth[0], { pattern: fab(g, C), w: 1 });
      // band collar, placket and a line of embroidery
      P.shape([[x - nw * 1.1, b - 6, true], [x - nw * 1.05, b + 6], [x, b + 9], [x + nw * 1.05, b + 6], [x + nw * 1.1, b - 6, true], [x, b - 1]], C.cloth[2], { w: 0.7, pattern: trimP(g, C, C.cloth[2]) });
      P.band([[x, b + 9], [x, b + 108]], 9, C.cloth[2], { w: 0.5, pattern: trimP(g, C, C.cloth[2]) });
      for (let i = 0; i < 4; i++) P.bead(x, b + 24 + i * 22, 2.4, C.metal);
      for (const s of [-1, 1]) P.line([[x + s * nw * 1.5, b + 26], [x + s * nw * 2.6, b + 34]], { w: 0.4, color: C.metal, wob: 0.2 });
    },
  });

  PM.define('clothing', 'buba', {
    label: 'Buba (puff sleeves)',
    draw(P, g, geo, C) {
      const { cx, neckX: x, nw, neckBase: b, sw } = geo, id = g.pattern === 'plain' ? 'ankara' : g.pattern;
      const nl = [[cx - sw * 0.72, b + 18, true], [x - nw * 1.4, b + 34], [x, b + 40], [x + nw * 1.4, b + 34], [cx + sw * 0.72, b + 18, true]];
      P.shape(geo.torso(nl), C.cloth[0], { pattern: fab(g, C, id), w: 1 });
      for (const s of [-1, 1]) {
        const p = [[cx + s * sw * 0.62, b + 14], [cx + s * sw * 0.98, b + 4], [cx + s * sw * 1.22, b + 30], [cx + s * sw * 1.08, b + 62], [cx + s * sw * 0.78, b + 56]];
        P.shape(p, C.cloth[0], { pattern: fab(g, C, id), w: 0.9 });
      }
      P.band(nl.map(p => [p[0], p[1] + 2]), 6, C.cloth[1], { w: 0.5 });
    },
  });

  PM.define('clothing', 'jersey', {
    label: 'Jersey (green-white-green)',
    draw(P, g, geo, C) {
      const { cx, neckX: x, nw, neckBase: b, sw } = geo, green = PM.styleSnap(g, '#0a8a4b');
      const nl = N.v(geo, 26, 1.25);
      P.shape(geo.torso(nl), green, { w: 1 });
      for (const s of [-1, 1]) {
        P.band([[cx + s * sw * 0.8, b + 22], [cx + s * sw * 1.0, b + 60], [cx + s * sw * 1.06, geo.H + 20]], 14, C.white, { w: 0.5 });
        // the zig-zag across the chest
        P.line([[x + s * nw * 1.6, b + 40], [x + s * nw * 2.4, b + 52], [x + s * nw * 3.2, b + 40], [x + s * nw * 4.0, b + 52]], { w: 0.5, color: C.white });
      }
      P.shape([[x - nw * 1.3, b - 6, true], [x - nw * 1.2, b + 8], [x, b + 30, true], [x + nw * 1.2, b + 8], [x + nw * 1.3, b - 6, true], [x, b - 2]], C.white, { w: 0.7, tension: 0.3 });
      P.circle(x - nw * 2.6, b + 62, 8, C.white, { w: 0.6, n: 10 });
      P.dot(x - nw * 2.6, b + 62, 3.2, green);
    },
  });

  PM.define('clothing', 'babanriga', {
    label: 'Babanriga (wide gown)',
    draw(P, g, geo, C) {
      const { neckX: x, nw, neckBase: b } = geo;
      P.shape(geo.torso(N.round(geo, 14, 1.6), { expand: 26 }), C.cloth[0], { pattern: fab(g, C, 'plain'), w: 1 });
      // embroidered "U" at the neck and a big chest pocket
      const u = [[x - nw * 1.6, b - 4], [x - nw * 1.4, b + 40], [x, b + 62], [x + nw * 1.4, b + 40], [x + nw * 1.6, b - 4]];
      P.band(u.map(p => [p[0], p[1] + 4]), 10, C.cloth[2], { w: 0.6, pattern: trimP(g, C, C.cloth[2]) });
      P.shape([[x + nw * 1.7, b + 62], [x + nw * 3.0, b + 62], [x + nw * 3.0, b + 96, true], [x + nw * 1.7, b + 96, true]], C.cloth[1], { w: 0.7, pattern: trimP(g, C, C.cloth[1]) });
    },
  });

  // ===================================================================== HEADWEAR
  const hRng = (g, k) => new PM.RNG(PM.hashString(g.seed + ':ng:' + k));

  PM.define('headwear', 'red-cap', {
    label: 'Red cap (chief’s cap)',
    hides: { hair: 'top' },
    front(P, g, geo, C) {
      const { cx, hw, hh, top, hairlineY: hl } = geo, s = g.hairPart >= 0 ? 1 : -1, y0 = hl - 3, red = PM.styleSnap(g, '#b3262a');
      const pts = [[cx - hw * 1.02, y0 + 6, true], [cx - hw * 1.06, top + hh * 0.14], [cx - hw * 0.6, top - 20], [cx, top - 26], [cx + hw * 0.6, top - 20], [cx + hw * 1.06, top + hh * 0.14], [cx + hw * 1.02, y0 + 6, true], [cx, y0 + 10]];
      const d = P.shape(pts, red, { pattern: null });
      P.clip(d, () => { for (let i = -3; i <= 3; i++) P.hair([[cx + i * hw * 0.3, y0 + 8], [cx + i * hw * 0.26, top - 8]], 0.7 * P.lw, color.shade(red, -0.25), { smooth: false }); });
      P.band([[cx - hw * 1.03, y0 + 4], [cx, y0 + 8], [cx + hw * 1.03, y0 + 4]], 6, color.shade(red, -0.2), { w: 0.5 });
      // a feather tucked in at the side
      P.shape([[cx + s * hw * 0.8, top + 4], [cx + s * hw * 1.4, top - 38], [cx + s * hw * 1.62, top - 14], [cx + s * hw * 1.1, top + 8]], C.white, { w: 0.7 });
    },
  });

  PM.define('headwear', 'zanna-cap', {
    label: 'Zanna cap (embroidered)',
    hides: { hair: 'top' },
    front(P, g, geo, C) {
      const { cx, hw, hh, top, hairlineY: hl } = geo, y0 = hl - 2, lift = 20;
      const pts = [[cx - hw * 1.0, y0 + 6, true], [cx - hw * 1.04, top + hh * 0.08], [cx - hw * 0.7, top - lift, true], [cx + hw * 0.7, top - lift, true], [cx + hw * 1.04, top + hh * 0.08], [cx + hw * 1.0, y0 + 6, true], [cx, y0 + 10]];
      const d = P.shape(pts, C.cloth[1], { pattern: { id: 'zigzag', colors: [C.cloth[1], C.cloth[2], C.cloth[0]], scale: 0.7 } });
      P.clip(d, () => { P.band([[cx - hw * 1.1, y0 - 2], [cx, y0 + 4], [cx + hw * 1.1, y0 - 2]], 10, C.cloth[0], { w: 0.5 }); });
      P.line([[cx - hw * 0.7, top - lift], [cx + hw * 0.7, top - lift]], { w: 0.6 });
    },
  });

  PM.define('headwear', 'satin-bonnet', {
    label: 'Satin bonnet',
    hides: { hair: 'top' },
    front(P, g, geo, C) {
      const { cx, hw, hh, top, hairlineY: hl } = geo, y0 = hl + 2, col = C.cloth[1];
      const pts = [[cx - hw * 1.05, y0 + 8, true], [cx - hw * 1.2, top + hh * 0.05], [cx - hw * 0.7, top - 34], [cx, top - 42], [cx + hw * 0.7, top - 34], [cx + hw * 1.2, top + hh * 0.05], [cx + hw * 1.05, y0 + 8, true], [cx, y0 + 12]];
      const d = P.shape(pts, col);
      P.clip(d, () => {
        P.hair(curve.ellipse(cx - hw * 0.4, top - 4, hw * 0.3, 20, 10, 0, -2.7, -1.2), 4 * P.lw, color.mix(col, C.white, 0.55));
        P.band([[cx - hw * 1.1, y0 + 4], [cx, y0 + 10], [cx + hw * 1.1, y0 + 4]], 7, color.shade(col, -0.18), { w: 0.4 });
      });
    },
  });

  // ===================================================================== HERITAGES
  const wa = PM.get('archetypes', 'west-african'), ea = PM.get('archetypes', 'east-african');
  const NG_PALETTE = ['#008751', '#d4a017', '#16120f', '#f1e6cc', '#1c4e9a', '#b3262a', '#e8590c', '#7a2e7a'];
  const afro = (parent, o) => Object.assign({}, parent, { region: 'Africa', groups: ['african', 'west-african'] }, o);
  const modernMasc = { crew: 2, hoodie: 1.6, 'graphic-tee': 1.4, jersey: 0.7, suit: 0.8, kaftan: 1.2, 'denim-jacket': 0.6, dashiki: 0.6, vneck: 0.8 };
  const modernFem = { crew: 1.5, vneck: 1.5, buba: 2, hoodie: 1, 'graphic-tee': 1, wrap: 1, bare: 1, boubou: 0.8, 'denim-jacket': 0.7, jersey: 0.4, turtleneck: 0.5 };

  A('lagosian', afro(wa, {
    label: 'Lagosian (modern Nigerian)', order: wa.order + 0.05,
    notes: 'Everyday Lagos: Yoruba, Igbo, Hausa and Edo families, a lot of mixing, danfo conductors and bankers alike. Knotless braids, frontal wigs, fades and locs, Ankara tops, kaftans, jerseys, face caps and sunglasses. Deep to rich brown skin with a wide spread.',
    skin: [['V-1', 2], ['V-2', 3], ['VI-1', 3], ['VI-2', 3], ['VI-3', 2], ['VI-4', 0.8], ['IV-2', 0.6]],
    hair: {
      fem: { 'knotless-braids': 3, 'frontal-wig': 2.5, 'box-braids': 2, 'ghana-braids': 1.6, cornrows: 1.4, 'faux-locs': 1.4, afro: 1.2, twists: 1.2, 'bantu-knots': 0.8, 'braid-bun': 1, pixie: 0.8, 'afro-puffs': 0.7, 'irun-kiko': 0.4, 'short-crop': 0.8 },
      masc: { fade: 3, waves: 2, 'short-crop': 2, buzz: 1.5, dreadlocks: 1.4, locs: 1.2, cornrows: 1.4, twists: 1.2, 'high-top': 0.7, bald: 1, 'loc-bun': 0.4, afro: 0.5 },
    },
    facialHair: { masc: { none: 9, stubble: 3, 'short-beard': 2.5, goatee: 0.8, mustache: 0.5, 'full-beard': 1 } },
    headwear: { fem: { none: 10, gele: 1.2, headwrap: 1.2, 'satin-bonnet': 0.3, 'baseball-cap': 0.4 }, masc: { none: 10, 'baseball-cap': 2, fila: 1, durag: 0.8, kufi: 0.4, 'red-cap': 0.3, beanie: 0.4 } },
    clothing: { fem: modernFem, masc: modernMasc },
    patterns: { plain: 4, ankara: 2.5, 'aso-oke': 0.8, adinkra: 0.4, batik: 0.8, stripes: 0.8, dots: 0.6 },
    trims: { beadwork: 1, zigzag: 1, 'cross-stitch': 0.7, stripes: 0.6 },
    earrings: { fem: { none: 1, hoops: 3, studs: 3, 'big-disc': 1, drops: 1.5, geometric: 0.8 }, masc: { none: 8, studs: 2 } },
    necklaces: { fem: { none: 3, beads: 1.5, layered: 1.5, 'chain-link': 1, cowrie: 0.4, choker: 0.8 }, masc: { none: 6, 'chain-link': 2.5, beads: 0.5, cross: 0.1 } },
    eyewear: { none: 18, sunglasses: 1.5, 'square-glasses': 0.8, 'round-glasses': 0.4, aviators: 0.4 },
    palette: NG_PALETTE, metals: [['gold', 4], ['silver', 1]],
  }));

  A('yoruba', afro(wa, {
    label: 'Yoruba', order: orderOf('yoruba') != null ? orderOf('yoruba') : wa.order + 0.1,
    notes: 'South-west Nigeria (Lagos, Ibadan, Abeokuta, Ogbomoso). Gele and iro & buba for women, fila and agbada for men, aso-oke and adire. Shuku, irun kiko and kolo hairstyles, coral beads for occasions.',
    skin: [['V-1', 2], ['V-2', 3], ['VI-1', 3], ['VI-2', 3], ['VI-3', 1.5], ['VI-4', 0.5]],
    hair: {
      fem: { shuku: 2.5, 'irun-kiko': 2, 'knotless-braids': 2, cornrows: 1.5, 'box-braids': 1.5, twists: 1, 'ghana-braids': 1, 'frontal-wig': 1, afro: 0.8, 'bantu-knots': 0.6 },
      masc: { 'short-crop': 3, fade: 2, buzz: 2, waves: 1, cornrows: 0.8, bald: 1, 'high-top': 0.5 },
    },
    headwear: { fem: { gele: 4, none: 3.5, headwrap: 1.5 }, masc: { fila: 4, none: 3.5, kufi: 0.5 } },
    clothing: { fem: { buba: 3, wrap: 2, boubou: 2, vneck: 0.8, 'graphic-tee': 0.3 }, masc: { agbada: 2, kaftan: 3, dashiki: 1.5, boubou: 1.5, suit: 0.7, crew: 0.6 } },
    patterns: { 'aso-oke': 3, ankara: 2.5, batik: 2, adinkra: 0.5, plain: 1 },
    necklaces: { fem: { none: 2, beads: 2, 'bead-collar': 1.5, layered: 1.5, cowrie: 0.4 }, masc: { none: 8, beads: 1, medallion: 0.4 } },
    palette: ['#1b3b6f', '#d4a017', '#f1e6cc', '#b5532f', '#7a2e7a', '#0b6b4a', '#16120f', '#b3262a'],
    metals: [['gold', 3], ['coral', 2], ['brass', 1]],
  }));

  A('igbo', afro(wa, {
    label: 'Igbo', order: wa.order + 0.2,
    notes: 'South-east Nigeria (Enugu, Owerri, Aba, Onitsha, Awka). George wrappers and blouses for women, the red cap, isi-agu and coral beads for men at ceremonies. Knotless braids, low cuts, "Nkwobi" and "Jigida" waist beads.',
    skin: [['IV-2', 1.5], ['V-1', 3], ['V-2', 3], ['VI-1', 2.5], ['VI-2', 1.5], ['VI-3', 0.6]],
    face: { noseWidth: [0.9, 1.3], lipFull: [0.7, 1.15], cheek: [0.98, 1.1] },
    hair: {
      fem: { 'knotless-braids': 2.5, 'box-braids': 2, 'frontal-wig': 2, cornrows: 1.5, 'ghana-braids': 1.2, twists: 1.2, afro: 1, 'faux-locs': 1, 'bantu-knots': 0.6, 'braid-bun': 0.8 },
      masc: { 'short-crop': 3, fade: 2.5, buzz: 2, waves: 1.5, bald: 1.2, twists: 0.6, dreadlocks: 0.5 },
    },
    headwear: { fem: { none: 5, gele: 3, headwrap: 1.2 }, masc: { none: 6, 'red-cap': 2.2, fila: 0.6 } },
    clothing: { fem: { buba: 3, wrap: 2, boubou: 1.5, vneck: 1, crew: 0.5 }, masc: { kaftan: 3, agbada: 1.5, dashiki: 1.4, boubou: 1, suit: 1, crew: 0.8, 'open-vest': 0.3 } },
    patterns: { ankara: 2.5, plain: 2, adinkra: 0.5, kente: 0.4, 'aso-oke': 0.3, stripes: 0.6 },
    necklaces: { fem: { none: 2, beads: 2.5, 'bead-collar': 1, layered: 1.5 }, masc: { none: 4, beads: 2.5, coins: 0.3, medallion: 0.4 } },
    palette: ['#b3262a', '#16120f', '#d4a017', '#f1e6cc', '#1b6b4a', '#6a1b5e', '#e8590c', '#1c4e9a'],
    metals: [['coral', 3], ['gold', 3], ['brass', 1]],
  }));

  A('hausa', afro(wa, {
    label: 'Hausa', order: wa.order + 0.3,
    groups: ['african', 'west-african', 'sahel'],
    notes: 'Northern Nigeria (Kano, Kaduna, Zaria, Sokoto). Babanriga and kaftan with embroidered caps — the zanna and kufi — and turbans; hijab and wrapper with matching veil for women. Henna, kohl, braided hair under the veil.',
    skin: [['IV-2', 1.5], ['V-1', 3], ['V-2', 3], ['VI-1', 2], ['VI-2', 1], ['IV-1', 0.5]],
    face: { noseWidth: [0.88, 1.2], lipFull: [0.65, 1.05], cheek: [1.0, 1.1] },
    hairTexture: { 4: 6, 3: 4 },
    hair: { fem: { cornrows: 2, 'box-braids': 1.2, twists: 1, 'short-crop': 1, 'bun-low': 1 }, masc: { buzz: 3, 'short-crop': 3, fade: 1.2, bald: 1.5 } },
    facialHair: { masc: { none: 2, stubble: 2, 'short-beard': 3, 'full-beard': 3, mustache: 0.8, 'long-beard': 0.4, goatee: 0.5 } },
    headwear: { fem: { hijab: 4, headscarf: 2, headwrap: 2, none: 1.2 }, masc: { 'zanna-cap': 2.5, kufi: 2.5, turban: 1.5, doppa: 1.5, none: 1.2 } },
    clothing: { fem: { boubou: 3, wrap: 2, buba: 1.5, 'embroidered-tunic': 1 }, masc: { babanriga: 4, kaftan: 3, boubou: 1.5, kurta: 0.8, suit: 0.4 } },
    patterns: { plain: 3, 'aso-oke': 1, ankara: 1.5, zigzag: 1, mudcloth: 0.8, 'cross-stitch': 0.8 },
    trims: { 'cross-stitch': 2, zigzag: 1.5, beadwork: 0.5, stripes: 0.5 },
    earrings: { fem: { none: 3, studs: 2, drops: 2, 'big-disc': 1, jhumka: 0.5 }, masc: { none: 12 } },
    necklaces: { fem: { none: 3, beads: 1.5, layered: 1, 'bead-collar': 0.5 }, masc: { none: 12 } },
    marks: { 'beauty-mark': 0.05, dimples: 0.08, kohl: 0.25, blush: 0.05 },
    palette: ['#f1e6cc', '#1b6b4a', '#2f5f6e', '#16120f', '#d4a017', '#6a1b5e', '#8a6a3a'],
    metals: [['silver', 3], ['gold', 2], ['brass', 1]],
  }));

  A('fulani', afro(wa, {
    label: 'Fulani', order: wa.order + 0.35,
    groups: ['african', 'west-african', 'sahel'],
    notes: 'Pastoral and town Fulbe across the Sahel and northern Nigeria. Long braids with amber, silver and cowries, wide-brimmed hats, beaded earrings, indigo and red wrappers. Slimmer faces and a lighter-to-deep skin range.',
    skin: [['IV-1', 1], ['IV-2', 2], ['V-1', 3], ['V-2', 2.5], ['VI-1', 1.2], ['VI-2', 0.5]],
    face: { faceLength: [1.0, 1.1], noseWidth: [0.82, 1.1], lipFull: [0.55, 0.95], nose: [0.3, 0.6] },
    hairTexture: { 4: 4, 3: 5, 2: 1.5 },
    nose: { straight: 3, line: 2, aquiline: 1.2, button: 1.2, broad: 1 },
    hair: { fem: { 'fulani-braids': 5, cornrows: 2, 'box-braids': 1, 'two-braids': 1, 'single-braid': 0.8 }, masc: { 'short-crop': 3, buzz: 2, cornrows: 1, 'single-braid': 0.4, bald: 1 } },
    headwear: { fem: { none: 5, headwrap: 2, headscarf: 1.5, 'straw-hat': 1 }, masc: { none: 4, turban: 2.2, tagelmust: 1, 'straw-hat': 1.5, kufi: 0.6 } },
    clothing: { fem: { wrap: 3, boubou: 2, buba: 1, 'embroidered-tunic': 0.8 }, masc: { boubou: 3, babanriga: 1.5, kurta: 1.2, wrap: 1, kaftan: 1 } },
    patterns: { plain: 2, zigzag: 2, 'cross-stitch': 1.5, mudcloth: 1.5, ikat: 1, batik: 0.8 },
    earrings: { fem: { 'big-disc': 3, 'beaded-loops': 2, hoops: 1.5, drops: 1.2, coins: 1 }, masc: { none: 8, studs: 1 } },
    necklaces: { fem: { cowrie: 3, beads: 3, 'bead-collar': 1, layered: 2, coins: 1 }, masc: { none: 6, beads: 1.5, cowrie: 1 } },
    marks: { kohl: 0.25, dimples: 0.05, freckles: 0.03 },
    palette: ['#1b3b6f', '#b3262a', '#f1e6cc', '#16120f', '#d4a017', '#8a4a2a', '#2f5f6e'],
    metals: [['silver', 3], ['gold', 2], ['copper', 1.5], ['coral', 1]],
  }));

  A('edo', afro(wa, {
    label: 'Edo (Benin)', order: wa.order + 0.4,
    notes: 'Benin City and the Edo-speaking south. Coral-bead collars and wrist cuffs, wrapper and blouse with an ivory-white and red palette, the bronze-casting heritage in brass and gold, plaited hair in sculpted rows.',
    skin: [['V-1', 2], ['V-2', 3], ['VI-1', 3], ['VI-2', 2], ['VI-3', 1]],
    hair: { fem: { 'ghana-braids': 2, cornrows: 2, 'knotless-braids': 2, 'box-braids': 1.5, 'frontal-wig': 1.5, 'braid-bun': 1, twists: 1 }, masc: { 'short-crop': 3, fade: 2, buzz: 2, cornrows: 1, bald: 1.2 } },
    headwear: { fem: { none: 5, gele: 2.5, headwrap: 1 }, masc: { none: 6, 'red-cap': 1, fila: 0.5 } },
    clothing: { fem: { buba: 2.5, wrap: 2.5, boubou: 1.5, vneck: 0.8 }, masc: { kaftan: 3, agbada: 1.5, boubou: 1.2, dashiki: 0.8, 'open-vest': 0.5 } },
    patterns: { ankara: 2, plain: 2.5, 'aso-oke': 0.8, adinkra: 0.4 },
    necklaces: { fem: { 'bead-collar': 3, beads: 3, layered: 1.5, none: 1 }, masc: { beads: 3, none: 3, 'bead-collar': 0.5, medallion: 0.5 } },
    earrings: { fem: { 'beaded-loops': 2, 'big-disc': 1.5, hoops: 1.5, studs: 1.5, drops: 1, none: 0.5 }, masc: { none: 8, studs: 1 } },
    palette: ['#b3262a', '#f1e6cc', '#16120f', '#d4a017', '#1b6b4a', '#6a1b5e'],
    metals: [['coral', 4], ['brass', 3], ['gold', 2]],
  }));

  A('niger-delta', afro(wa, {
    label: 'Niger Delta (Ijaw & Urhobo)', order: wa.order + 0.45,
    notes: 'The creeks and river towns of Bayelsa, Rivers and Delta states. George wrappers, Ijaw "etibo" shirts with a wrapper and a walking staff, bold printed wrappers and beaded necklaces. Cornrows, braids and fades.',
    skin: [['V-2', 3], ['VI-1', 3], ['VI-2', 3], ['VI-3', 1.5], ['VI-4', 0.5]],
    hair: { fem: { cornrows: 2.5, 'knotless-braids': 2, 'box-braids': 1.5, twists: 1.2, 'ghana-braids': 1.5, 'frontal-wig': 1.2 }, masc: { 'short-crop': 3, fade: 2, buzz: 2, waves: 1, bald: 1.2, cornrows: 1 } },
    headwear: { fem: { none: 5, gele: 2, headwrap: 1.5 }, masc: { none: 7, fila: 1, 'red-cap': 0.4, 'baseball-cap': 0.7 } },
    clothing: { fem: { buba: 2.5, wrap: 2.5, boubou: 1.2, vneck: 1 }, masc: { kaftan: 2, 'open-vest': 1, boubou: 1.4, crew: 1.2, jersey: 0.8, wrap: 0.8 } },
    patterns: { ankara: 3, plain: 2, batik: 1, 'aso-oke': 0.4 },
    necklaces: { fem: { 'bead-collar': 2, beads: 3, layered: 1.5, none: 1 }, masc: { beads: 2, none: 4, 'chain-link': 0.6 } },
    palette: ['#1c4e9a', '#d4a017', '#f1e6cc', '#b3262a', '#16120f', '#1b6b4a'],
    metals: [['coral', 2], ['gold', 3], ['brass', 1]],
  }));

  A('efik-ibibio', afro(wa, {
    label: 'Efik & Ibibio', order: wa.order + 0.5,
    notes: 'Calabar and Akwa Ibom. Elaborate Efik wrapper-and-blouse "Ofonmma" outfits with high-standing headdresses, coral beads, and the Ibibio "Ekombi" costume tradition. Neat, sculptural hair.',
    skin: [['IV-2', 1], ['V-1', 3], ['V-2', 3], ['VI-1', 2], ['VI-2', 1]],
    hair: { fem: { 'knotless-braids': 2, 'ghana-braids': 2, cornrows: 2, 'box-braids': 1.5, 'frontal-wig': 1.5, twists: 1 }, masc: { 'short-crop': 3, fade: 2, buzz: 2, bald: 1, waves: 1 } },
    headwear: { fem: { gele: 3, none: 4, headwrap: 1 }, masc: { none: 7, fila: 0.8, 'red-cap': 0.4 } },
    clothing: { fem: { buba: 3, wrap: 2, boubou: 1.5, vneck: 0.8 }, masc: { kaftan: 3, boubou: 1.2, agbada: 1, suit: 0.8, crew: 1 } },
    patterns: { ankara: 2.5, plain: 2, 'aso-oke': 0.8, batik: 0.8 },
    necklaces: { fem: { 'bead-collar': 3, beads: 3, layered: 1.2, none: 1 }, masc: { beads: 2.5, none: 4 } },
    palette: ['#b3262a', '#1c4e9a', '#d4a017', '#f1e6cc', '#16120f', '#6a1b5e'],
    metals: [['coral', 3.5], ['gold', 2], ['brass', 1]],
  }));

  A('middle-belt', afro(wa, {
    label: 'Tiv & Middle Belt', order: wa.order + 0.55,
    notes: 'Benue, Plateau, Nasarawa, Kogi and Kwara — Tiv, Idoma, Berom, Nupe, Igala, Igbira. The Tiv "A\'nger" black-and-white striped cloth, Nupe brass and glass beads, Berom beadwork; farm-town and Abuja-commuter faces.',
    skin: [['V-1', 2], ['V-2', 3], ['VI-1', 3], ['VI-2', 2], ['VI-3', 1]],
    hair: { fem: { cornrows: 2.5, 'box-braids': 1.5, twists: 1.5, 'knotless-braids': 1.2, 'short-crop': 1, afro: 0.8 }, masc: { 'short-crop': 3, buzz: 2.5, fade: 1.5, bald: 1.2, cornrows: 0.6 } },
    headwear: { fem: { none: 5, headwrap: 2.5, gele: 1 }, masc: { none: 7, kufi: 0.8, 'baseball-cap': 0.8, fila: 0.4 } },
    clothing: { fem: { wrap: 3, buba: 2, boubou: 1.2, crew: 0.8 }, masc: { kaftan: 2, crew: 1.5, boubou: 1.5, dashiki: 1, 'open-vest': 0.8, 'graphic-tee': 0.8 } },
    patterns: { 'bold-stripes': 2.5, stripes: 1.5, ankara: 1.5, plain: 2, zigzag: 1 },
    necklaces: { fem: { beads: 3, 'bead-collar': 1.2, layered: 1.5, none: 1.5 }, masc: { beads: 1.2, none: 6 } },
    palette: ['#16120f', '#f1e6cc', '#b3262a', '#d4a017', '#1b6b4a', '#1c4e9a'],
    metals: [['brass', 3], ['copper', 1.5], ['gold', 1.5]],
  }));

  A('kanuri', afro(wa, {
    label: 'Kanuri & Borno', order: wa.order + 0.6,
    groups: ['african', 'west-african', 'sahel'],
    notes: 'Borno, Yobe and the Lake Chad basin. Turbans and wide gowns for men, bright wrappers with veils for women; strong brows and long faces; silver and amber jewellery.',
    skin: [['IV-2', 1.5], ['V-1', 3], ['V-2', 3], ['VI-1', 1.5], ['VI-2', 0.5]],
    face: { noseWidth: [0.85, 1.15], lipFull: [0.6, 1.0] },
    hairTexture: { 4: 5, 3: 5 },
    hair: { fem: { cornrows: 2, twists: 1.5, 'box-braids': 1, 'short-crop': 1 }, masc: { buzz: 3, 'short-crop': 3, fade: 1, bald: 1.5 } },
    facialHair: { masc: { none: 2, 'short-beard': 3, 'full-beard': 3, stubble: 1.5, mustache: 1, goatee: 0.6 } },
    headwear: { fem: { hijab: 3, headscarf: 2.5, headwrap: 2, none: 1 }, masc: { turban: 3, tagelmust: 2, kufi: 2, 'zanna-cap': 1.2, none: 1 } },
    clothing: { fem: { boubou: 3, wrap: 2, buba: 1 }, masc: { babanriga: 3.5, kaftan: 2, boubou: 2, kurta: 1 } },
    patterns: { plain: 3, 'aso-oke': 0.8, zigzag: 1.2, mudcloth: 1, 'cross-stitch': 1 },
    marks: { kohl: 0.3, 'beauty-mark': 0.04 },
    earrings: { fem: { none: 3, studs: 2, drops: 2, 'big-disc': 1 }, masc: { none: 12 } },
    palette: ['#f1e6cc', '#2f5f6e', '#16120f', '#8a4a2a', '#b3262a', '#d4a017'],
    metals: [['silver', 3], ['gold', 1.5], ['brass', 1]],
  }));

  // ---- the rest of Africa: lighter touches, same format ----
  A('ghanaian', afro(wa, {
    label: 'Ghanaian', order: wa.order + 0.7,
    notes: 'Accra, Kumasi, the Volta and the north. Kente and adinkra cloth, "kaba and slit", batakari smocks, gold jewellery and Akan beads. Sharp fades, braids and twists.',
    skin: [['V-1', 2], ['V-2', 3], ['VI-1', 3], ['VI-2', 2.5], ['VI-3', 1.2]],
    hair: { fem: { 'knotless-braids': 2.5, 'ghana-braids': 2.5, 'box-braids': 1.5, cornrows: 1.5, twists: 1.5, 'frontal-wig': 1, afro: 0.8 }, masc: { fade: 3, 'short-crop': 3, waves: 1.5, buzz: 1.5, bald: 1, twists: 0.6 } },
    headwear: { fem: { none: 6, headwrap: 2.5, gele: 1 }, masc: { none: 8, fila: 0.5, 'baseball-cap': 0.8, kufi: 0.4 } },
    clothing: { fem: { buba: 2.5, wrap: 2.5, boubou: 1, vneck: 1, 'graphic-tee': 0.6 }, masc: { kaftan: 1.5, dashiki: 2, wrap: 1.5, crew: 1.5, jersey: 1, suit: 0.8 } },
    patterns: { kente: 3.5, adinkra: 2, ankara: 1.5, plain: 1.5, batik: 0.8 },
    necklaces: { fem: { beads: 3, 'bead-collar': 1.5, layered: 1.5, none: 1.5, cowrie: 0.4 }, masc: { none: 5, beads: 1.5 } },
    palette: ['#d4a017', '#1b6b4a', '#b3262a', '#16120f', '#f1e6cc', '#1c4e9a'],
    metals: [['gold', 5], ['brass', 1]],
  }));

  A('kenyan', afro(ea, {
    label: 'Kenyan', order: ea.order + 0.1, groups: ['african', 'east-african'],
    notes: 'Nairobi, Mombasa and the highlands — Kikuyu, Luo, Luhya, Kamba, Kalenjin, Swahili, Maasai and more. Kitenge and kanga prints, shukas, beadwork, fades and cornrows.',
    skin: [['V-1', 2], ['V-2', 3], ['VI-1', 3], ['VI-2', 2], ['VI-3', 1]],
    hair: { fem: { 'box-braids': 2.5, 'knotless-braids': 2, cornrows: 1.5, 'short-crop': 1.5, 'frontal-wig': 1.2, twists: 1.2, afro: 0.6 }, masc: { 'short-crop': 3, fade: 2.5, buzz: 2.5, bald: 1.5, waves: 0.8 } },
    headwear: { fem: { none: 6, headwrap: 2.5 }, masc: { none: 8, 'baseball-cap': 1.2, kufi: 0.8, beanie: 0.4 } },
    clothing: { fem: { buba: 1.8, wrap: 2.5, vneck: 1.5, crew: 1.2, 'denim-jacket': 0.8, boubou: 0.6 }, masc: { crew: 2, hoodie: 1.4, suit: 1, kaftan: 0.8, 'denim-jacket': 0.8, 'graphic-tee': 1.2 } },
    patterns: { ankara: 2, plain: 3, stripes: 1, checks: 1, 'bold-stripes': 0.6 },
    necklaces: { fem: { beads: 3, 'bead-collar': 2, layered: 1, none: 1.5 }, masc: { none: 6, beads: 1 } },
    palette: ['#b3262a', '#1b6b4a', '#16120f', '#f1e6cc', '#1c4e9a', '#d4a017'],
    metals: [['brass', 2], ['gold', 2], ['silver', 1]],
  }));

  A('south-african', afro(wa, {
    label: 'South African', order: wa.order + 0.8, groups: ['african', 'southern-african'],
    notes: 'Johannesburg, Durban, Cape Town and rural Eastern Cape — Zulu, Xhosa, Sotho, Tswana, Venda and more. Doek headwraps, isicholo, Shweshwe prints, Basotho blankets, beadwork, twists, locs and fades.',
    skin: [['IV-2', 1], ['V-1', 2.5], ['V-2', 3], ['VI-1', 2.5], ['VI-2', 1.5], ['VI-3', 0.6]],
    hair: { fem: { twists: 2.5, 'box-braids': 2, 'knotless-braids': 1.5, locs: 1.2, 'faux-locs': 1, afro: 1.2, 'frontal-wig': 1.2, 'bantu-knots': 0.8, cornrows: 1 }, masc: { fade: 3, 'short-crop': 2.5, locs: 1.5, dreadlocks: 0.8, buzz: 1.5, cornrows: 0.8, bald: 1 } },
    headwear: { fem: { none: 4, headwrap: 4, headscarf: 1 }, masc: { none: 8, beanie: 1, 'baseball-cap': 1, 'bucket-hat': 0.1 } },
    clothing: { fem: { wrap: 2, buba: 1.8, vneck: 1.2, crew: 1, 'graphic-tee': 1, 'denim-jacket': 0.8, boubou: 0.6 }, masc: { crew: 2, hoodie: 1.5, suit: 0.8, 'graphic-tee': 1.4, 'denim-jacket': 0.8, dashiki: 0.6, kaftan: 0.4 } },
    patterns: { plain: 3, ankara: 1.5, 'bold-stripes': 1, dots: 1, checks: 1, mudcloth: 0.5 },
    necklaces: { fem: { beads: 3, 'bead-collar': 2, layered: 1.5, none: 1.2 }, masc: { none: 6, beads: 1.2 } },
    palette: ['#2b3a67', '#b3262a', '#f1e6cc', '#16120f', '#d4a017', '#1b6b4a', '#7a2e7a'],
    metals: [['gold', 2], ['silver', 2], ['copper', 1]],
  }));

  A('ethiopian', afro(ea, {
    label: 'Ethiopian & Eritrean (Habesha)', order: ea.order + 0.2, groups: ['african', 'east-african', 'habesha'],
    notes: 'Addis Ababa, Asmara, Gondar, Tigray and Oromia. White cotton netela and habesha kemis with woven tilet borders, shuruba braids, gold crosses, coffee-ceremony hospitality.',
    skin: [['IV-1', 1.5], ['IV-2', 2.5], ['V-1', 3], ['V-2', 2.5], ['VI-1', 1]],
    face: { noseWidth: [0.82, 1.1], lipFull: [0.55, 0.95] },
    nose: { straight: 3, line: 2.5, aquiline: 1.5, button: 1, broad: 0.8 },
    hairTexture: { 4: 4, 3: 5, 2: 2 },
    hair: { fem: { 'box-braids': 2, cornrows: 2, 'knotless-braids': 1.2, 'bun-low': 1, long: 1, twists: 1 }, masc: { 'short-crop': 3, fade: 2, buzz: 2, bald: 1 } },
    headwear: { fem: { none: 6, headscarf: 2, headwrap: 1 }, masc: { none: 8, kufi: 0.5 } },
    clothing: { fem: { wrap: 3, 'embroidered-tunic': 3, vneck: 1, crew: 0.8 }, masc: { crew: 2, suit: 1, 'embroidered-tunic': 1.2, wrap: 1.2, hoodie: 1 } },
    patterns: { plain: 4, 'cross-stitch': 1.5, zigzag: 1.5, 'bold-stripes': 0.8 },
    trims: { 'cross-stitch': 2.5, zigzag: 2, stripes: 1 },
    necklaces: { fem: { 'cross-pendant': 3, beads: 1.5, layered: 1, none: 1.5 }, masc: { none: 6, 'cross-pendant': 2 } },
    palette: ['#f1e6cc', '#1b6b4a', '#d4a017', '#b3262a', '#16120f', '#1c4e9a'],
    metals: [['gold', 3], ['silver', 2]],
  }));

  A('senegalese', afro(wa, {
    label: 'Senegalese', order: wa.order + 0.9, groups: ['african', 'west-african', 'sahel'],
    notes: 'Dakar, Saint-Louis, Touba and the Casamance — Wolof, Serer, Fula, Diola. Grand boubou, colourful bazin, Sabador wraps, tall elegant headwraps and gold jewellery. Taller faces, long necks, bold style.',
    skin: [['V-2', 2], ['VI-1', 3], ['VI-2', 3], ['VI-3', 2.5], ['VI-4', 1.2]],
    face: { neckLength: [1.05, 1.4], faceLength: [1.0, 1.1] },
    hair: { fem: { 'knotless-braids': 2.5, 'box-braids': 2, cornrows: 1.5, twists: 1.5, 'frontal-wig': 1.5, 'bun-top': 1 }, masc: { 'short-crop': 3, fade: 2, buzz: 2.5, bald: 1.5, waves: 1 } },
    headwear: { fem: { gele: 3, headwrap: 3, none: 2 }, masc: { kufi: 1.5, none: 6, fila: 0.5 } },
    clothing: { fem: { boubou: 3.5, buba: 2, wrap: 2, vneck: 1 }, masc: { boubou: 4, kaftan: 2, dashiki: 1, suit: 1, crew: 0.8 } },
    patterns: { batik: 2.5, ankara: 2, plain: 2, 'aso-oke': 0.5, mudcloth: 1.5 },
    earrings: { fem: { 'big-disc': 2, hoops: 2, drops: 2, studs: 1.5, 'patterned-hoop': 1.5 }, masc: { none: 10, studs: 1 } },
    necklaces: { fem: { layered: 2.5, beads: 2, 'bead-collar': 1, choker: 0.8, none: 1 }, masc: { none: 6, beads: 1 } },
    palette: ['#1c4e9a', '#d4a017', '#b3262a', '#f1e6cc', '#16120f', '#1b6b4a', '#e8590c'],
    metals: [['gold', 5], ['silver', 1]],
  }));

  A('congolese', afro(wa, {
    label: 'Congolese', order: wa.order + 1.0, groups: ['african', 'central-african'],
    notes: 'Kinshasa, Brazzaville, Lubumbashi — "la Sape" sapeurs in bold suits and colour-blocked ties, pagne wax prints and elaborate hair. Proud, stylish, expressive faces.',
    skin: [['V-1', 2], ['V-2', 3], ['VI-1', 3], ['VI-2', 2.5], ['VI-3', 1.5], ['VI-4', 0.6]],
    hair: { fem: { 'knotless-braids': 2.5, 'frontal-wig': 2, 'box-braids': 2, 'ghana-braids': 1.5, twists: 1, 'faux-locs': 1, cornrows: 1 }, masc: { fade: 3, 'short-crop': 3, waves: 1.5, buzz: 1.5, bald: 0.8 } },
    headwear: { fem: { none: 6, headwrap: 2, gele: 1 }, masc: { none: 6, fedora: 1.2, 'flat-cap': 0.6, 'baseball-cap': 0.6 } },
    clothing: { fem: { buba: 2.5, wrap: 2, vneck: 1.2, boubou: 1, crew: 0.8 }, masc: { suit: 3, crew: 1, kaftan: 1, dashiki: 1, hoodie: 0.8 } },
    patterns: { ankara: 3, plain: 2, 'bold-stripes': 1, checks: 1 },
    necklaces: { fem: { beads: 2, layered: 2, 'chain-link': 1, none: 1.5 }, masc: { none: 5, 'chain-link': 1.5 } },
    eyewear: { none: 8, sunglasses: 1.5, 'square-glasses': 0.8, aviators: 0.6 },
    palette: ['#b3262a', '#1c4e9a', '#d4a017', '#16120f', '#f1e6cc', '#1b6b4a', '#7a2e7a', '#e8590c'],
    metals: [['gold', 3], ['silver', 1.5]],
  }));

  // ===================================================================== ROLES (everyday Lagos)
  const R = (id, def) => PM.define('roles', id, def);
  R('corper', {
    label: 'Corper (NYSC)', headwear: { 'baseball-cap': 4, none: 1 },
    clothing: { 'field-jacket': 3, 'uniform-shirt': 2, crew: 1 }, pattern: { plain: 1 },
    palette: [['#c8b98a', '#8f8a5b'], ['#0a8a4b', '#f1e6cc'], ['#f1e6cc']],
  });
  R('banker', {
    label: 'Banker / corporate', clothing: { suit: 6, vneck: 1 }, eyewear: { 'square-glasses': 1, none: 3 },
    accessories: { necktie: 0.7, 'id-lanyard': 0.6 }, pattern: { plain: 1 }, headwear: { none: 1 },
    palette: [['#1b2a49', '#16120f', '#3a3a3a'], ['#f1e6cc'], ['#a8302a', '#c99a4b']],
  });
  R('okada-rider', {
    label: 'Okada rider', headwear: { 'baseball-cap': 1.5, none: 3, 'hard-hat': 0.2 },
    clothing: { 'hi-vis': 3, hoodie: 1.5, crew: 2, 'track-jacket': 1 }, pattern: { plain: 1 },
    accessories: { headphones: 0.15 }, eyewear: { sunglasses: 1.5, none: 3 },
    palette: [['#e8590c', '#f1c40f', '#1b6b4a', '#16120f'], ['#16120f'], ['#f1e6cc']],
  });
  R('influencer', {
    label: 'Influencer / content creator', eyewear: { sunglasses: 3, 'cat-eye': 0.8, none: 2 },
    clothing: { buba: 1.5, 'graphic-tee': 1.5, hoodie: 1.2, 'leather-jacket': 1.2, 'denim-jacket': 1 },
    necklace: { layered: 2, 'chain-link': 2, choker: 1 }, earrings: { hoops: 3, 'big-disc': 1.5, geometric: 1 },
    accessories: { headphones: 0.25 }, metals: { gold: 3 },
  });
  R('market-trader', {
    label: 'Market trader', headwear: { gele: 3, headwrap: 3, none: 1 }, clothing: { wrap: 2.5, buba: 3, boubou: 1 },
    pattern: { ankara: 4, 'aso-oke': 1 }, accessories: { apron: 0.3 },
  });
  R('nollywood', {
    label: 'Nollywood star', clothing: { agbada: 2, buba: 2, suit: 2, kaftan: 2 }, headwear: { gele: 2, fila: 2, none: 1.5 },
    necklace: { 'bead-collar': 2, layered: 2, beads: 1.5 }, earrings: { 'big-disc': 2, drops: 2 }, eyewear: { sunglasses: 1, none: 3 },
    pattern: { 'aso-oke': 2, ankara: 3 }, metals: { gold: 4, coral: 1 },
  });

  // ===================================================================== MORE NIGERIAN PEOPLES
  // Each one is a variation on a parent heritage: its own label, notes, dress/hair weights and palette.
  const sub = (parent, id, label, step, o) => {
    const p = PM.get('archetypes', parent);
    A(id, Object.assign({}, p, { label, order: wa.order + step, notes: o.notes }, o.over || {}));
  };
  // South-west (Yoruba family)
  sub('yoruba', 'awori', 'Awori (Lagos indigene)', 0.12, { notes: 'The original Lagosians: Awori, Egun of Badagry and the Eko lagoon towns. Fila and agbada at ceremonies, gele and iro & buba, adire and aso-oke.',
    over: { headwear: { fem: { gele: 3.5, none: 3.5, headwrap: 1.2 }, masc: { fila: 3.5, none: 4, kufi: 0.5 } }, patterns: { 'aso-oke': 2.5, ankara: 3, batik: 2.5, plain: 1 } } });
  sub('yoruba', 'ijebu', 'Ijebu', 0.14, { notes: 'Ijebu-Ode and Remo. Known for sharp business sense, fine adire and aso-oke, neat gele and crisp agbada.',
    over: { palette: ['#7a2e7a', '#d4a017', '#f1e6cc', '#16120f', '#1c4e9a', '#0b6b4a'] } });
  sub('yoruba', 'egba', 'Egba (Abeokuta)', 0.16, { notes: 'Abeokuta and Egbaland. The adire capital: indigo resist-dyed cloth, aso-oke, strong gele.',
    over: { patterns: { batik: 3.5, 'aso-oke': 2.5, ankara: 1.5, plain: 1 }, palette: ['#1b3b6f', '#f1e6cc', '#16120f', '#d4a017', '#b5532f'] } });
  // South-east
  sub('igbo', 'ikwerre', 'Ikwerre (Port Harcourt)', 0.22, { notes: 'Port Harcourt and Rivers State. Boldly dressed, George wrappers, coral beads and tailored senator wears.',
    over: { clothing: { fem: { buba: 2.5, wrap: 2.5, boubou: 1.2, vneck: 1.2, crew: 0.6 }, masc: { kaftan: 3, suit: 1.2, dashiki: 1, agbada: 1, crew: 1 } }, headwear: { fem: { none: 5, gele: 2.5, headwrap: 1 }, masc: { none: 7, 'red-cap': 1.2, fila: 0.5 } } } });
  // North
  sub('hausa', 'nupe', 'Nupe (Bida)', 0.32, { notes: 'Bida, Niger State. Famed for glass beads, brass work and embroidered gowns; Hausa-adjacent dress with Middle Belt flavour.',
    over: { metals: [['brass', 4], ['silver', 2], ['gold', 1]], patterns: { plain: 2, zigzag: 1.5, 'cross-stitch': 1.5, ankara: 1.5, 'aso-oke': 0.8 } } });
  sub('hausa', 'gbagyi', 'Gbagyi (Abuja)', 0.34, { notes: 'Abuja and its surroundings. The Gbagyi are the people of the Federal Capital; plain wraps, embroidered tops, red-clay pots and beads.',
    over: { headwear: { fem: { none: 5, headwrap: 3, hijab: 0.6 }, masc: { none: 6, kufi: 1.5, 'zanna-cap': 0.8, 'baseball-cap': 1 } }, patterns: { plain: 3, ankara: 2, zigzag: 1 } } });
  // Middle Belt
  sub('middle-belt', 'tiv', 'Tiv (Benue)', 0.56, { notes: 'Benue State. The Tiv "A\'nger" black-and-white striped cloth, great dancers, beads and bold stripes.',
    over: { patterns: { 'bold-stripes': 3.5, stripes: 2, plain: 1.5, ankara: 1 }, palette: ['#16120f', '#f1e6cc', '#b3262a', '#d4a017'] } });
  sub('middle-belt', 'idoma', 'Idoma', 0.57, { notes: 'South Benue. Masquerade and bead traditions, wrappers, cap and gown on Sundays.',
    over: { palette: ['#b3262a', '#d4a017', '#16120f', '#f1e6cc', '#1b6b4a'] } });
  sub('middle-belt', 'igala', 'Igala (Kogi)', 0.58, { notes: 'Idah and Anyigba, Kogi State. Royal Attah tradition: red caps, coral beads, white wrappers.',
    over: { headwear: { fem: { none: 4, gele: 2.5, headwrap: 1.5 }, masc: { none: 5, 'red-cap': 2, fila: 1 } }, metals: [['coral', 3.5], ['gold', 2], ['brass', 1]] } });
  sub('middle-belt', 'ebira', 'Ebira (Okene)', 0.59, { notes: 'Okene and Kogi central. The Ebira tiger-print cloth called "etuko", hand-woven and prized at ceremonies.',
    over: { patterns: { zigzag: 2, 'bold-stripes': 2, plain: 2, ankara: 1.5, 'aso-oke': 1 } } });
  sub('middle-belt', 'berom', 'Berom & Plateau', 0.6, { notes: 'Jos Plateau. Cool-climate sweaters and beanies as often as wrappers; Berom beadwork, cornrows.',
    over: { headwear: { fem: { none: 6, headwrap: 2, beanie: 1 }, masc: { none: 6, beanie: 1.5, 'baseball-cap': 1.2 } }, clothing: { fem: { wrap: 2, buba: 1.5, crew: 1.5, vneck: 1.2, hoodie: 1 }, masc: { crew: 2, hoodie: 1.5, kaftan: 1.2, 'denim-jacket': 1, dashiki: 0.6 } } } });
  // South-south
  sub('niger-delta', 'ijaw', 'Ijaw (Bayelsa)', 0.46, { notes: 'The creeks of Bayelsa. Etibo shirts and wrapper, walking stick, bold printed wrappers, bead necklaces and red-and-blue palettes.',
    over: { palette: ['#1c4e9a', '#b3262a', '#f1e6cc', '#d4a017', '#16120f'], metals: [['coral', 3], ['gold', 2], ['brass', 1]] } });
  sub('niger-delta', 'urhobo', 'Urhobo (Delta)', 0.47, { notes: 'Warri, Sapele and Delta State. George wrappers, coral beads, Urhobo-style gele and loud, joyful ceremonies.',
    over: { headwear: { fem: { gele: 3, none: 4, headwrap: 1 }, masc: { none: 6, fila: 1.2, 'red-cap': 0.6 } } } });
  sub('niger-delta', 'itsekiri', 'Itsekiri (Warri)', 0.48, { notes: 'Warri and the Western Delta. Coral-bead regalia, wrappers and fine lace, the Olu of Warri palace tradition.',
    over: { metals: [['coral', 4], ['gold', 3]], necklaces: { fem: { 'bead-collar': 3, beads: 3, layered: 1.5, none: 1 }, masc: { beads: 2.5, none: 3, 'bead-collar': 0.8 } } } });
  sub('niger-delta', 'ogoni', 'Ogoni & Rivers', 0.49, { notes: 'Ogoniland and the Rivers creeks. Fishing-town hardiness, bold wax prints, cornrows and braids.',
    over: { patterns: { ankara: 3.5, plain: 2, batik: 1 } } });
  sub('efik-ibibio', 'efik', 'Efik (Calabar)', 0.5, { notes: 'Calabar. The Efik Ofonmma wrapper-and-blouse, coral beads and high-standing headdresses; carnival city.',
    over: { headwear: { fem: { gele: 4, none: 3, headwrap: 1 }, masc: { none: 7, fila: 0.8, 'red-cap': 0.4 } }, metals: [['coral', 4], ['gold', 2]] } });
  sub('efik-ibibio', 'ibibio', 'Ibibio (Akwa Ibom)', 0.51, { notes: 'Uyo and Akwa Ibom. The Ekombi dance costume tradition, raffia and beads, bright wrappers and neat braids.',
    over: { patterns: { ankara: 3, plain: 2, batik: 1 } } });

  /** Nigerian peoples first (what Lagos Swipe offers), then the wider African set. */
  PM.NAIJA_HERITAGES = ['lagosian', 'yoruba', 'awori', 'ijebu', 'egba', 'igbo', 'ikwerre', 'hausa', 'fulani', 'kanuri', 'nupe', 'gbagyi', 'edo', 'ijaw', 'urhobo', 'itsekiri', 'ogoni', 'efik', 'ibibio',
    'tiv', 'idoma', 'igala', 'ebira', 'berom'];
  PM.OTHER_AFRICAN = ['ghanaian', 'kenyan', 'south-african', 'ethiopian', 'senegalese', 'congolese'];

  PM.CULTURE_GROUPS = PM.CULTURE_GROUPS || {};
  for (const id of ['lagosian', 'yoruba', 'awori', 'ijebu', 'egba', 'igbo', 'ikwerre', 'hausa', 'fulani', 'nupe', 'gbagyi', 'edo', 'niger-delta', 'ijaw', 'urhobo', 'itsekiri', 'ogoni', 'efik', 'ibibio', 'efik-ibibio', 'middle-belt', 'tiv', 'idoma', 'igala', 'ebira', 'berom', 'kanuri', 'ghanaian', 'senegalese', 'congolese', 'south-african']) PM.CULTURE_GROUPS[id] = ['african', 'west-african'];
  for (const id of ['kenyan', 'ethiopian']) PM.CULTURE_GROUPS[id] = ['african', 'east-african'];

  /** The heritages the Lagos Swipe game rolls from, with how common each is in Lagos. */
  PM.NAIJA_MIX = { lagosian: 5, yoruba: 4.5, awori: 1.2, ijebu: 1.2, egba: 0.8, igbo: 4.2, ikwerre: 0.6, hausa: 1.6, fulani: 0.5, kanuri: 0.2, nupe: 0.3, gbagyi: 0.3, edo: 0.9,
    ijaw: 0.6, urhobo: 0.6, itsekiri: 0.4, ogoni: 0.2, efik: 0.4, ibibio: 0.5, tiv: 0.4, idoma: 0.3, igala: 0.3, ebira: 0.3, berom: 0.2,
    ghanaian: 0.12, kenyan: 0.04, 'south-african': 0.04, ethiopian: 0.03, senegalese: 0.03, congolese: 0.03 };
})(window.PM = window.PM || {});
