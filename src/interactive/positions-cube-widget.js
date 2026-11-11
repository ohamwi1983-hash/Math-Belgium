(function () {
  "use strict";

  /* ================================================================
   * <positions-cube-widget> — atelier interactif (4e, ch. 8, § 3 et § 4).
   * Un cube ABCDEFGH (base ABCD : A avant-gauche, B avant-droit,
   * C arrière-droit, D arrière-gauche ; E au-dessus de A, F de B, G de C,
   * H de D) qu'on fait tourner (glisser, ou boutons). Points nommés en
   * plus : I milieu de [EF], J milieu de [BF], K milieu de [FG],
   * O centre de (ABCD), O′ centre de (EFGH).
   * Mode « Deux droites » : sécantes / parallèles / confondues / gauches,
   * avec la justification. Mode « Droite et plan » : incluse / parallèle /
   * sécante, avec le point de percée dessiné (même hors du solide).
   * Mode « Défi » : une question tirée, un seul essai, puis la correction
   * et la rotation débloquée. Aucun score.
   * Calculs EXACTS (cube de côté 2 : tous les points nommés ont des
   * coordonnées entières ; intersections en fractions). Aucune coordonnée
   * n'est affichée : le chapitre raisonne sans repère.
   * Web Component (Shadow DOM), rendu SVG projeté à la main.
   * ================================================================ */

  var SVGNS = "http://www.w3.org/2000/svg";
  var LARG = 340, HAUT = 300, CX = 170, CY = 150, DEMI = 128;

  var PTS = {
    A: [0, 0, 0], B: [2, 0, 0], C: [2, 2, 0], D: [0, 2, 0],
    E: [0, 0, 2], F: [2, 0, 2], G: [2, 2, 2], H: [0, 2, 2],
    I: [1, 0, 2], J: [2, 0, 1], K: [2, 1, 2], O: [1, 1, 0], "O′": [1, 1, 2]
  };
  var NOMS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "O", "O′"];
  var SOMMETS = ["A", "B", "C", "D", "E", "F", "G", "H"];
  var DESCR_NOMME = {
    I: "le point I, milieu de [EF]", J: "le point J, milieu de [BF]", K: "le point K, milieu de [FG]",
    O: "le point O, centre de la face (ABCD)", "O′": "le point O′, centre de la face (EFGH)"
  };

  // faces : nom, sommets (ordre cyclique), normale sortante
  var FACES = {
    bas: { nom: "ABCD", n: [0, 0, -1] }, haut: { nom: "EFGH", n: [0, 0, 1] },
    avant: { nom: "ABFE", n: [0, -1, 0] }, arriere: { nom: "CDHG", n: [0, 1, 0] },
    droite: { nom: "BCGF", n: [1, 0, 0] }, gauche: { nom: "ADHE", n: [-1, 0, 0] }
  };
  var ARETES = [
    ["A", "B", "bas", "avant"], ["B", "C", "bas", "droite"], ["C", "D", "bas", "arriere"], ["D", "A", "bas", "gauche"],
    ["E", "F", "haut", "avant"], ["F", "G", "haut", "droite"], ["G", "H", "haut", "arriere"], ["H", "E", "haut", "gauche"],
    ["A", "E", "avant", "gauche"], ["B", "F", "avant", "droite"], ["C", "G", "droite", "arriere"], ["D", "H", "arriere", "gauche"]
  ];
  // plans « remarquables » à 4 sommets (6 faces + 6 rectangles diagonaux)
  var QUADS = ["ABCD", "EFGH", "ABFE", "BCGF", "CDHG", "DAEH", "ABGH", "CDEF", "ADGF", "BCHE", "ACGE", "BDHF"];
  // plans « de coin » (3 voisins d'un sommet)
  var COINS = ["BDE", "ACF", "BDG", "ACH", "AFH", "BEG", "CFH", "DEG"];

  // ---------- arithmétique entière / fractions ----------
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function mul(k, a) { return [k * a[0], k * a[1], k * a[2]]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function nul(a) { return a[0] === 0 && a[1] === 0 && a[2] === 0; }
  function pgcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a; }
  // point rationnel = { n:[..], d } (d > 0, réduit)
  function ptRat(P, a, b, u) { // P + (a/b)·u
    if (b < 0) { a = -a; b = -b; }
    var n = add(mul(b, P), mul(a, u));
    var g = pgcd(pgcd(pgcd(n[0], n[1]), n[2]), b) || 1;
    return { n: [n[0] / g, n[1] / g, n[2] / g], d: b / g };
  }
  function ratEgal(M, P) { return M.n[0] === M.d * P[0] && M.n[1] === M.d * P[1] && M.n[2] === M.d * P[2]; }
  function ratVal(M) { return [M.n[0] / M.d, M.n[1] / M.d, M.n[2] / M.d]; }
  function dansPlan(X, V, n) { return dot(n, sub(X, V)) === 0; }

  function nomPoint(M) {
    for (var i = 0; i < NOMS.length; i++) if (ratEgal(M, PTS[NOMS[i]])) return NOMS[i];
    return null;
  }

  // nom d'un plan donné par 3 noms de sommets
  function nomPlanSommets(t) {
    var s = t.join("");
    for (var i = 0; i < QUADS.length; i++) {
      var q = QUADS[i];
      if (t.every(function (c) { return q.indexOf(c) >= 0; })) return "(" + q + ")";
    }
    return "(" + s + ")";
  }
  // nom d'un plan passant par une liste de points (noms quelconques)
  function nomPlanPoints(noms) {
    var tous = noms.every(function (c) { return SOMMETS.indexOf(c) >= 0; });
    if (tous) {
      for (var i = 0; i < QUADS.length; i++) {
        var q = QUADS[i];
        if (noms.every(function (c) { return q.indexOf(c) >= 0; })) return "(" + q + ")";
      }
    }
    return "(" + noms.join("") + ")";
  }

  // ---------- localisation d'un point (sans coordonnées) ----------
  function fracTxt(p, q) {
    if (q < 0) { p = -p; q = -q; }
    var g = pgcd(p, q) || 1; p /= g; q /= g;
    return q === 1 ? String(p) : p + "/" + q;
  }
  function localiser(M) {
    var nm = nomPoint(M);
    if (nm) {
      if (SOMMETS.indexOf(nm) >= 0) return { nom: nm, txt: "le sommet " + nm, dehors: false };
      return { nom: nm, txt: DESCR_NOMME[nm], dehors: false };
    }
    for (var i = 0; i < ARETES.length; i++) {
      var X = PTS[ARETES[i][0]], Y = PTS[ARETES[i][1]], nx = ARETES[i][0], ny = ARETES[i][1];
      var XY = sub(Y, X), XM = sub(M.n, mul(M.d, X));
      if (!nul(cross(XM, XY))) continue;
      var num = dot(XM, XY), den = M.d * dot(XY, XY); // λ = num / den
      if (num > 0 && num < den) {
        return { nom: "M", txt: "M, sur l'arête [" + nx + ny + "]" + (2 * num === den ? " (en son milieu)" : ""), dehors: false };
      }
      if (num > den) {
        var s = "M, sur le prolongement de [" + nx + ny + "], au-delà de " + ny;
        if (num === 2 * den) s += " : " + ny + " est le milieu de [" + nx + "M]";
        return { nom: "M", txt: s, dehors: true };
      }
      if (num < 0) {
        var s2 = "M, sur le prolongement de [" + nx + ny + "], au-delà de " + nx;
        if (num === -den) s2 += " : " + nx + " est le milieu de [M" + ny + "]";
        return { nom: "M", txt: s2, dehors: true };
      }
    }
    var v = ratVal(M);
    var dedans = v.every(function (c) { return c >= 0 && c <= 2; });
    if (dedans) {
      for (var f in FACES) {
        var face = FACES[f], V0 = PTS[face.nom[0]];
        if (dot(face.n, sub(M.n, mul(M.d, V0))) === 0) return { nom: "M", txt: "M, à l'intérieur de la face (" + face.nom + ")", dehors: false };
      }
      return { nom: "M", txt: "M, à l'intérieur du cube", dehors: false };
    }
    return { nom: "M", txt: "M, hors du solide", dehors: true };
  }

  // ---------- verdicts ----------
  function droite(n1, n2) { return { a: n1, b: n2, P: PTS[n1], u: sub(PTS[n2], PTS[n1]), nom: "(" + n1 + n2 + ")" }; }

  function verdictDroites(L1, L2) {
    var w = cross(L1.u, L2.u), PP = sub(L2.P, L1.P);
    if (nul(w)) {
      if (nul(cross(PP, L1.u))) {
        return { cat: "confondues", titre: "Confondues", point: null,
          justif: L1.nom + " et " + L2.nom + " ont la même direction et un point commun (" + L2.a + " est sur " + L1.nom + ") : c'est la même droite." };
      }
      var ordre = dot(L2.u, L1.u) > 0 ? [L1.a, L1.b, L2.b, L2.a] : [L1.a, L1.b, L2.a, L2.b];
      return { cat: "parallèles", titre: "Parallèles", point: null,
        justif: L1.nom + " et " + L2.nom + " ont la même direction. Deux droites parallèles sont toujours coplanaires : ici, elles sont dans le plan " + nomPlanPoints(ordre) + ", sans point commun." };
    }
    var triple = dot(PP, w);
    if (triple === 0) {
      var num = dot(cross(PP, L2.u), w), den = dot(w, w);
      var M = ptRat(L1.P, num, den, L1.u);
      var loc = localiser(M);
      var pts = [L1.a, L1.b];
      [L2.a, L2.b].forEach(function (c) { if (pts.indexOf(c) < 0) pts.push(c); });
      var trois = pts.length >= 3 ? pts : pts.concat([]);
      // 3 points non alignés parmi les 4
      var choix = null;
      for (var i = 0; i < pts.length && !choix; i++) for (var j = i + 1; j < pts.length && !choix; j++) for (var k = j + 1; k < pts.length && !choix; k++) {
        if (!nul(cross(sub(PTS[pts[j]], PTS[pts[i]]), sub(PTS[pts[k]], PTS[pts[i]])))) choix = [pts[i], pts[j], pts[k]];
      }
      var plan = choix ? nomPlanPoints(pts.length === 4 && nomPlanPoints(pts).length === 6 ? pts : choix) : "(" + trois.join("") + ")";
      return { cat: "sécantes", titre: "Sécantes en " + loc.nom, point: M, loc: loc,
        justif: L1.nom + " et " + L2.nom + " sont coplanaires, dans le plan " + plan + ", et n'ont pas la même direction : elles se coupent en un seul point, " + loc.txt + "." };
    }
    // gauches : le plan (L1.a L1.b L2.a) contient L1 ; L2 le perce en L2.a seulement
    var X = L2.a, Y = L2.b;
    var planNom = "(" + L1.a + L1.b + X + ")";
    return { cat: "gauches", titre: "Gauches", point: null,
      justif: L2.nom + " perce le plan " + planNom + ", qui contient " + L1.nom + ", au seul point " + X + ", qui n'est pas sur " + L1.nom +
        " : les deux droites ne sont ni sécantes ni parallèles. Elles n'ont aucun plan commun — elles sont gauches.",
      perce: X, nonPlan: Y };
  }

  function droiteParalleleDansPlan(u, V, n) {
    var meilleur = null, rang = 9;
    for (var i = 0; i < NOMS.length; i++) for (var j = 0; j < NOMS.length; j++) {
      if (i === j) continue;
      var X = PTS[NOMS[i]], Y = PTS[NOMS[j]];
      if (!dansPlan(X, V, n) || !dansPlan(Y, V, n)) continue;
      var d = sub(Y, X);
      if (!nul(cross(d, u)) || dot(d, u) <= 0) continue;
      var sx = SOMMETS.indexOf(NOMS[i]) >= 0, sy = SOMMETS.indexOf(NOMS[j]) >= 0;
      var arete = sx && sy && dot(d, d) === 4;
      var r = arete ? 0 : (sx && sy ? 1 : 2);
      if (r < rang) { rang = r; meilleur = "(" + NOMS[i] + NOMS[j] + ")"; }
    }
    return meilleur;
  }

  function verdictPlan(L, trio) {
    var V = PTS[trio[0]], n = cross(sub(PTS[trio[1]], V), sub(PTS[trio[2]], V));
    var nomP = nomPlanSommets(trio);
    var Pin = dansPlan(L.P, V, n), Qin = dansPlan(PTS[L.b], V, n);
    var nu = dot(n, L.u);
    if (nu === 0) {
      if (Pin) return { cat: "incluse", titre: "Incluse dans le plan", point: null, plan: { V: V, n: n },
        justif: L.a + " et " + L.b + " sont tous les deux dans le plan " + nomP + " : la droite " + L.nom + " y est incluse." };
      var par = droiteParalleleDansPlan(L.u, V, n);
      return { cat: "parallèle", titre: "Parallèle au plan", point: null, plan: { V: V, n: n },
        justif: L.a + " n'est pas dans le plan " + nomP + ", et " + L.nom + " est parallèle à " + (par || "une droite") + ", qui est dans le plan : la droite est parallèle au plan, sans jamais le rencontrer." };
    }
    var num = dot(n, sub(V, L.P));
    var M = ptRat(L.P, num, nu, L.u);
    var loc = localiser(M);
    var just;
    if (Pin || Qin) {
      var dedans = Pin ? L.a : L.b, dehors = Pin ? L.b : L.a;
      just = dedans + " est dans le plan " + nomP + ", mais " + dehors + " n'y est pas : la droite n'est pas incluse, et elle a un point commun avec le plan. Elle est donc sécante, en " + dedans + ".";
    } else {
      just = "Ni " + L.a + " ni " + L.b + " n'est dans le plan " + nomP + ", et " + L.nom + " n'est parallèle à aucune droite de ce plan : elle le perce en un seul point, " + loc.txt + "." + (loc.dehors ? " Le plan est infini : le point de percée peut tomber hors du solide dessiné." : "");
    }
    return { cat: "sécante", titre: "Sécante en " + loc.nom, point: M, loc: loc, plan: { V: V, n: n }, justif: just };
  }

  // ---------- projection ----------
  var CAV = { k: 0.5, c: Math.cos(Math.PI / 4), s: Math.sin(Math.PI / 4) };
  function vue(etat, C0) {
    if (etat.cav) {
      return {
        p: function (X) { var x = X[0] - C0[0], y = X[1] - C0[1], z = X[2] - C0[2]; return { u: x + CAV.k * CAV.c * y, v: z + CAV.k * CAV.s * y }; },
        f: [-CAV.k * CAV.c, 1, -CAV.k * CAV.s]
      };
    }
    var t = etat.yaw * Math.PI / 180, ph = etat.pitch * Math.PI / 180;
    var r = [Math.cos(t), Math.sin(t), 0];
    var f = [-Math.sin(t) * Math.cos(ph), Math.cos(t) * Math.cos(ph), -Math.sin(ph)];
    var up = [-Math.sin(t) * Math.sin(ph), Math.cos(t) * Math.sin(ph), Math.cos(ph)];
    return {
      p: function (X) { var d = [X[0] - C0[0], X[1] - C0[1], X[2] - C0[2]]; return { u: dot(d, r), v: dot(d, up) }; },
      f: f
    };
  }

  function el(tag, attrs, parent) {
    var e = document.createElementNS(SVGNS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  // boîte de dessin et découpe
  function boite(extra) {
    var lo = [-0.35, -0.35, -0.35], hi = [2.35, 2.35, 2.35];
    if (extra) for (var i = 0; i < 3; i++) { lo[i] = Math.min(lo[i], extra[i] - 0.45); hi[i] = Math.max(hi[i], extra[i] + 0.45); }
    return { lo: lo, hi: hi };
  }
  function clipDroite(P, u, bx) {
    var t0 = -1e9, t1 = 1e9;
    for (var i = 0; i < 3; i++) {
      if (u[i] === 0) { if (P[i] < bx.lo[i] || P[i] > bx.hi[i]) return null; continue; }
      var a = (bx.lo[i] - P[i]) / u[i], b = (bx.hi[i] - P[i]) / u[i];
      t0 = Math.max(t0, Math.min(a, b)); t1 = Math.min(t1, Math.max(a, b));
    }
    return t0 < t1 ? [t0, t1] : null;
  }
  function planBoite(V, n, bx) {
    var c = [], lo = bx.lo, hi = bx.hi;
    var coins = [];
    for (var a = 0; a < 2; a++) for (var b = 0; b < 2; b++) for (var d = 0; d < 2; d++) coins.push([a ? hi[0] : lo[0], b ? hi[1] : lo[1], d ? hi[2] : lo[2]]);
    var ar = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
    ar.forEach(function (e) {
      var X = coins[e[0]], Y = coins[e[1]];
      var fx = dot(n, sub(X, V)), fy = dot(n, sub(Y, V));
      if (fx === fy) { if (fx === 0) { c.push(X); c.push(Y); } return; }
      if ((fx <= 0 && fy >= 0) || (fx >= 0 && fy <= 0)) {
        var t = fx / (fx - fy);
        c.push([X[0] + t * (Y[0] - X[0]), X[1] + t * (Y[1] - X[1]), X[2] + t * (Y[2] - X[2])]);
      }
    });
    var u = [];
    c.forEach(function (p) { if (!u.some(function (q) { return Math.abs(q[0] - p[0]) + Math.abs(q[1] - p[1]) + Math.abs(q[2] - p[2]) < 1e-7; })) u.push(p); });
    if (u.length < 3) return [];
    var g = [0, 0, 0]; u.forEach(function (p) { g = add(g, p); }); g = mul(1 / u.length, g);
    var e1 = sub(u[0], g), nn = mul(1 / Math.sqrt(dot(n, n)), n), e2 = cross(nn, e1);
    u.sort(function (p, q) { var a1 = sub(p, g), a2 = sub(q, g); return Math.atan2(dot(a1, e2), dot(a1, e1)) - Math.atan2(dot(a2, e2), dot(a2, e1)); });
    return u;
  }

  // ---------- défi ----------
  function hasard(n) { return Math.floor(Math.random() * n); }
  function tirerDroite() {
    for (;;) { var a = NOMS[hasard(NOMS.length)], b = NOMS[hasard(NOMS.length)]; if (a !== b) return [a, b]; }
  }
  function tirerDefi() {
    var type = Math.random() < 0.5 ? "droites" : "plan";
    var cats = type === "droites" ? ["sécantes", "parallèles", "gauches"] : ["incluse", "parallèle", "sécante"];
    var cible = cats[hasard(3)];
    for (var essai = 0; essai < 4000; essai++) {
      if (type === "droites") {
        var d1 = tirerDroite(), d2 = tirerDroite();
        var L1 = droite(d1[0], d1[1]), L2 = droite(d2[0], d2[1]);
        var v = verdictDroites(L1, L2);
        if (v.cat !== cible) continue;
        if (d1.some(function (c) { return d2.indexOf(c) >= 0; }) && cible !== "sécantes") continue;
        return { type: type, d1: d1, d2: d2, cats: cats, verdict: v };
      }
      var pool = QUADS.concat(COINS), q = pool[hasard(pool.length)];
      var trio = [q[0], q[1], q[2]];
      var d = tirerDroite();
      var vp = verdictPlan(droite(d[0], d[1]), trio);
      if (vp.cat !== cible) continue;
      if (vp.point && vp.loc && vp.loc.dehors) {
        var m = ratVal(vp.point); if (m.some(function (c) { return c < -2 || c > 4; })) continue;
      }
      return { type: type, d1: d, trio: trio, cats: cats, verdict: vp };
    }
    return tirerDefi();
  }

  var OPTS = NOMS.map(function (c) { return '<option value="' + c + '">' + c + '</option>'; }).join("");
  var OPTS_S = SOMMETS.map(function (c) { return '<option value="' + c + '">' + c + '</option>'; }).join("");
  function sel(id, sommets) { return '<select id="' + id + '" aria-label="Point ' + id + '">' + (sommets ? OPTS_S : OPTS) + '</select>'; }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#182430);}' +
    '*{box-sizing:border-box;}' +
    '.modes{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:0 0 12px;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:8px;}' +
    'svg{width:100%;max-width:500px;height:auto;background:var(--surface-2,#f7f9fb);border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);touch-action:none;cursor:grab;user-select:none;}' +
    'svg.verrou{cursor:default;}' +
    '.arete{stroke:var(--ink,#182430);stroke-width:1.7;fill:none;}' +
    '.arete-cachee{stroke:var(--ink-soft,#51626f);stroke-width:1.3;stroke-dasharray:5 4;fill:none;}' +
    '.plan{fill:var(--plan,#5b4ea3);fill-opacity:0.16;stroke:var(--plan,#5b4ea3);stroke-width:1.2;stroke-opacity:0.7;}' +
    '.d1{stroke:var(--accent,#b65c1f);stroke-width:3;stroke-linecap:round;}' +
    '.d2{stroke:var(--good,#2f7a4f);stroke-width:3;stroke-linecap:round;}' +
    '.d1x{stroke:var(--accent,#b65c1f);stroke-width:1.6;stroke-dasharray:6 5;}' +
    '.d2x{stroke:var(--good,#2f7a4f);stroke-width:1.6;stroke-dasharray:6 5;}' +
    '.pt{fill:var(--ink,#182430);}' +
    '.pt-choisi{fill:var(--ink,#182430);stroke:var(--surface-2,#f7f9fb);stroke-width:1.5;}' +
    '.pt-inter{fill:var(--bad,#b23a3a);stroke:var(--surface-2,#f7f9fb);stroke-width:2;}' +
    '.etiq{font-size:14px;font-weight:700;font-family:var(--sans,sans-serif);fill:var(--ink,#182430);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.etiq-n{font-size:13px;font-weight:700;fill:var(--ink-soft,#51626f);}' +
    '.etiq-m{fill:var(--bad,#b23a3a);}' +
    '.rot{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:0 0 12px;}' +
    '.selection{display:flex;flex-direction:column;gap:8px;align-items:center;margin:0 0 12px;}' +
    '.ligne{display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:center;}' +
    '.libelle{font-size:0.9rem;font-weight:600;color:var(--ink-soft,#51626f);}' +
    '.c1{color:var(--accent,#b65c1f);} .c2{color:var(--good,#2f7a4f);} .cp{color:var(--plan,#5b4ea3);}' +
    'select{min-height:44px;min-width:58px;font:inherit;font-size:1rem;font-weight:700;padding:6px 8px;border:1px solid var(--line,#ccd8e0);border-radius:var(--radius,3px);background:var(--surface,#fff);color:var(--ink,#182430);}' +
    '.btn{min-height:44px;min-width:44px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);background:var(--surface,#fff);color:var(--ink,#182430);font-weight:600;cursor:pointer;font-family:inherit;font-size:0.95rem;}' +
    '.btn[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);border-color:var(--accent,#b65c1f);color:var(--accent-ink,#7a3212);}' +
    '.btn:disabled{opacity:0.45;cursor:not-allowed;}' +
    '.btn:focus-visible,select:focus-visible{outline:2px solid var(--accent,#b65c1f);outline-offset:2px;}' +
    '.btn-reset{background:var(--accent-soft,#f6e2d3);border-color:var(--accent-soft-line,#e8c4a4);color:var(--accent-ink,#7a3212);}' +
    '.carte{padding:10px 12px;border-radius:var(--radius,3px);background:var(--surface-2,#f7f9fb);border:1px solid var(--line,#ccd8e0);line-height:1.55;font-size:0.95rem;margin:0 0 12px;}' +
    '.verdict{font-weight:700;font-size:1.05rem;color:var(--plan-ink,#443a80);margin-bottom:4px;}' +
    '.note{font-size:0.86rem;color:var(--ink-soft,#51626f);}' +
    '.message{color:var(--bad,#b23a3a);font-size:0.9rem;min-height:1.2em;text-align:center;margin:0 0 8px;}' +
    '.choix{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:0 0 12px;}' +
    '.choix .btn.ok{background:var(--good-soft,#dcefe2);border-color:var(--good,#2f7a4f);color:var(--good,#2f7a4f);}' +
    '.choix .btn.ko{background:var(--bad-soft,#f6dede);border-color:var(--bad,#b23a3a);color:var(--bad,#b23a3a);}' +
    '.choix .btn.ok:disabled,.choix .btn.ko:disabled{opacity:1;}' +
    '.question{font-weight:600;text-align:center;margin:0 0 10px;line-height:1.5;}' +
    '.bas{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;}' +
    '.selection,.carte,.question,.message{max-width:620px;margin-left:auto;margin-right:auto;}' +
    '[hidden]{display:none!important;}' +
    '</style>' +
    '<div class="modes" role="group" aria-label="Mode">' +
    '<button class="btn" type="button" data-mode="droites" aria-pressed="true">Deux droites</button>' +
    '<button class="btn" type="button" data-mode="plan" aria-pressed="false">Droite et plan</button>' +
    '<button class="btn" type="button" data-mode="defi" aria-pressed="false">Défi</button>' +
    '</div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARG + ' ' + HAUT + '" role="img" aria-label="Cube ABCDEFGH avec les droites et le plan choisis"></svg></div>' +
    '<div class="rot" role="group" aria-label="Rotation du cube">' +
    '<button class="btn" type="button" data-rot="g" aria-label="Tourner vers la gauche">◀</button>' +
    '<button class="btn" type="button" data-rot="h" aria-label="Basculer vers le haut">▲</button>' +
    '<button class="btn" type="button" data-rot="b" aria-label="Basculer vers le bas">▼</button>' +
    '<button class="btn" type="button" data-rot="d" aria-label="Tourner vers la droite">▶</button>' +
    '<button class="btn" type="button" id="cav">Vue cavalière</button>' +
    '</div>' +
    '<div class="selection" id="sel-droites">' +
    '<div class="ligne"><span class="libelle c1">Droite 1 : (</span>' + sel("a1") + sel("b1") + '<span class="libelle c1">)</span></div>' +
    '<div class="ligne" id="ligne-d2"><span class="libelle c2">Droite 2 : (</span>' + sel("a2") + sel("b2") + '<span class="libelle c2">)</span></div>' +
    '<div class="ligne" id="ligne-plan" hidden><span class="libelle cp">Plan : (</span>' + sel("p1", true) + sel("p2", true) + sel("p3", true) + '<span class="libelle cp">)</span></div>' +
    '<div class="note">Points nommés : I milieu de [EF], J milieu de [BF], K milieu de [FG], O centre de (ABCD), O′ centre de (EFGH).</div>' +
    '</div>' +
    '<div id="defi" hidden>' +
    '<div class="question" id="question"></div>' +
    '<div class="choix" id="choix"></div>' +
    '</div>' +
    '<div class="message" id="message" aria-live="polite"></div>' +
    '<div class="carte" id="carte" aria-live="polite"></div>' +
    '<div class="bas"><button class="btn" type="button" id="nouvelle" hidden>Nouvelle question</button>' +
    '<button class="btn btn-reset" type="button" id="reset">Réinitialiser</button></div>';

  class PositionsCubeWidget extends HTMLElement {
    constructor() {
      super();
      var sh = this.attachShadow({ mode: "open" });
      sh.appendChild(TEMPLATE.content.cloneNode(true));
      this._sh = sh;
      this._svg = sh.getElementById("svg");
      this._defauts();
    }

    _defauts() {
      this._mode = "droites";
      this._vue = { cav: true, yaw: 30, pitch: 20 };
      this._d = { a1: "A", b1: "B", a2: "C", b2: "G" };
      this._p = { a1: "A", b1: "G", p1: "E", p2: "F", p3: "G" };
      this._defi = null;
    }

    connectedCallback() {
      if (this._pret) return;
      this._pret = true;
      var self = this, sh = this._sh;
      sh.querySelectorAll("[data-mode]").forEach(function (b) {
        b.addEventListener("click", function () { self._changerMode(b.getAttribute("data-mode")); });
      });
      sh.querySelectorAll("[data-rot]").forEach(function (b) {
        b.addEventListener("click", function () { self._tourner(b.getAttribute("data-rot")); });
      });
      sh.getElementById("cav").addEventListener("click", function () { self._vue.cav = true; self._rendre(); });
      ["a1", "b1", "a2", "b2", "p1", "p2", "p3"].forEach(function (id) {
        sh.getElementById(id).addEventListener("change", function (e) {
          var cible = self._mode === "plan" ? self._p : self._d;
          cible[id] = e.target.value; self._rendre();
        });
      });
      sh.getElementById("reset").addEventListener("click", function () {
        var m = self._mode; self._defauts(); self._mode = m;
        if (m === "defi") self._defi = tirerDefi();
        self._majSelects(); self._rendre();
      });
      sh.getElementById("nouvelle").addEventListener("click", function () {
        self._defi = tirerDefi(); self._vue.cav = true; self._rendre();
      });
      // glisser pour tourner
      var drag = null;
      this._svg.addEventListener("pointerdown", function (e) {
        if (self._verrou()) return;
        drag = { x: e.clientX, y: e.clientY };
        if (self._vue.cav) { self._vue.cav = false; self._vue.yaw = 30; self._vue.pitch = 20; }
        try { self._svg.setPointerCapture(e.pointerId); } catch (err) { /* rien */ }
      });
      this._svg.addEventListener("pointermove", function (e) {
        if (!drag) return;
        var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        drag = { x: e.clientX, y: e.clientY };
        self._vue.yaw = (self._vue.yaw + dx * 0.6) % 360;
        self._vue.pitch = Math.max(-80, Math.min(80, self._vue.pitch + dy * 0.6));
        self._rendre();
      });
      var fin = function () { drag = null; };
      this._svg.addEventListener("pointerup", fin);
      this._svg.addEventListener("pointercancel", fin);
      this._majSelects();
      this._rendre();
    }

    _verrou() { return this._mode === "defi" && this._defi && !this._defi.repondu; }

    _changerMode(m) {
      this._mode = m;
      if (m === "defi") { this._defi = tirerDefi(); this._vue.cav = true; }
      this._majSelects();
      this._rendre();
    }

    _tourner(sens) {
      if (this._verrou()) return;
      if (this._vue.cav) { this._vue.cav = false; this._vue.yaw = 30; this._vue.pitch = 20; }
      if (sens === "g") this._vue.yaw -= 15;
      if (sens === "d") this._vue.yaw += 15;
      if (sens === "h") this._vue.pitch = Math.min(80, this._vue.pitch + 15);
      if (sens === "b") this._vue.pitch = Math.max(-80, this._vue.pitch - 15);
      this._rendre();
    }

    _majSelects() {
      var sh = this._sh, src = this._mode === "plan" ? this._p : this._d;
      ["a1", "b1", "a2", "b2", "p1", "p2", "p3"].forEach(function (id) { if (src[id]) sh.getElementById(id).value = src[id]; });
      sh.querySelectorAll("[data-mode]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-mode") === this._mode)); }, this);
      var defi = this._mode === "defi";
      sh.getElementById("sel-droites").hidden = defi;
      sh.getElementById("ligne-d2").hidden = this._mode !== "droites";
      sh.getElementById("ligne-plan").hidden = this._mode !== "plan";
      sh.getElementById("defi").hidden = !defi;
      sh.getElementById("nouvelle").hidden = !defi;
    }

    // ---------- calcul de la scène courante ----------
    _scene() {
      var msg = "";
      if (this._mode === "droites") {
        var d = this._d;
        if (d.a1 === d.b1 || d.a2 === d.b2) return { msg: "Choisis deux points différents pour chaque droite.", l1: null };
        var L1 = droite(d.a1, d.b1), L2 = droite(d.a2, d.b2);
        return { msg: msg, l1: L1, l2: L2, v: verdictDroites(L1, L2) };
      }
      if (this._mode === "plan") {
        var p = this._p;
        if (p.a1 === p.b1) return { msg: "Choisis deux points différents pour la droite.", l1: null };
        if (p.p1 === p.p2 || p.p1 === p.p3 || p.p2 === p.p3) return { msg: "Choisis trois sommets différents pour le plan.", l1: null };
        var L = droite(p.a1, p.b1), trio = [p.p1, p.p2, p.p3];
        return { msg: msg, l1: L, trio: trio, v: verdictPlan(L, trio) };
      }
      var q = this._defi;
      if (q.type === "droites") return { msg: "", l1: droite(q.d1[0], q.d1[1]), l2: droite(q.d2[0], q.d2[1]), v: q.verdict, defi: q };
      return { msg: "", l1: droite(q.d1[0], q.d1[1]), trio: q.trio, v: q.verdict, defi: q };
    }

    _rendre() {
      var sh = this._sh, svg = this._svg, self = this;
      var sc = this._scene();
      var montrer = !sc.defi || sc.defi.repondu;
      svg.classList.toggle("verrou", this._verrou());
      sh.querySelectorAll("[data-rot], #cav").forEach(function (b) { b.disabled = self._verrou(); });
      sh.getElementById("message").textContent = sc.msg || "";
      while (svg.firstChild) svg.removeChild(svg.firstChild);

      var M = (sc.v && sc.v.point && montrer) ? ratVal(sc.v.point) : null;
      var Mloin = M && M.some(function (c) { return c < -3 || c > 5; });
      var bx = boite(M && !Mloin ? M : null);
      // géométrie à dessiner (calculée avant l'échelle)
      var poly = [];
      if (sc.trio) {
        var Vp = PTS[sc.trio[0]], np = cross(sub(PTS[sc.trio[1]], Vp), sub(PTS[sc.trio[2]], Vp));
        poly = planBoite(Vp, np, bx);
      }
      var segs = [];
      [[sc.l1, "d1"], [sc.l2, "d2"]].forEach(function (c) {
        var L = c[0]; if (!L) return;
        if (montrer) { var r = clipDroite(L.P, L.u, bx); if (r) segs.push([add(L.P, mul(r[0], L.u)), add(L.P, mul(r[1], L.u)), c[1] + "x"]); }
      });
      // centre et rayon du contenu (fixes pendant la rotation) : tout ce qui est dessiné
      var tous = SOMMETS.map(function (c) { return PTS[c]; }).concat(poly);
      segs.forEach(function (sg) { tous.push(sg[0], sg[1]); });
      if (M && !Mloin) tous.push(M);
      var lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
      tous.forEach(function (X) { for (var i = 0; i < 3; i++) { lo[i] = Math.min(lo[i], X[i]); hi[i] = Math.max(hi[i], X[i]); } });
      var C0 = [(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2];
      var R = 0;
      tous.forEach(function (X) { var dd = sub(X, C0); R = Math.max(R, Math.sqrt(dot(dd, dd))); });
      R = Math.max(R + 0.12, Math.sqrt(3) + 0.15);
      var echelle = DEMI / (R * 1.12);
      var V = vue(this._vue, C0);
      var P2 = function (X) { var q = V.p(X); return { x: CX + echelle * q.u, y: CY - echelle * q.v }; };

      if (poly.length) el("polygon", { points: poly.map(function (X) { var p = P2(X); return p.x.toFixed(1) + "," + p.y.toFixed(1); }).join(" "), "class": "plan" }, svg);
      // arêtes du cube
      var faceVisible = {};
      for (var f in FACES) faceVisible[f] = dot(FACES[f].n, V.f) < 0;
      var cachees = [], visibles = [];
      ARETES.forEach(function (ar) { (faceVisible[ar[2]] || faceVisible[ar[3]] ? visibles : cachees).push(ar); });
      var ligne = function (X, Y, cls) { var p = P2(X), q = P2(Y); el("line", { x1: p.x.toFixed(1), y1: p.y.toFixed(1), x2: q.x.toFixed(1), y2: q.y.toFixed(1), "class": cls }, svg); };
      cachees.forEach(function (ar) { ligne(PTS[ar[0]], PTS[ar[1]], "arete-cachee"); });
      visibles.forEach(function (ar) { ligne(PTS[ar[0]], PTS[ar[1]], "arete"); });

      // droites
      segs.forEach(function (sg) { ligne(sg[0], sg[1], sg[2]); });
      if (sc.l1) ligne(sc.l1.P, add(sc.l1.P, sc.l1.u), "d1");
      if (sc.l2) ligne(sc.l2.P, add(sc.l2.P, sc.l2.u), "d2");

      // points et étiquettes
      var ctr = P2([1, 1, 1]);
      var choisis = [];
      if (sc.l1) choisis.push(sc.l1.a, sc.l1.b);
      if (sc.l2) choisis.push(sc.l2.a, sc.l2.b);
      NOMS.forEach(function (nm) {
        var X = PTS[nm], p = P2(X), estSommet = SOMMETS.indexOf(nm) >= 0;
        var choisi = choisis.indexOf(nm) >= 0;
        if (!estSommet && !choisi) return;
        el("circle", { cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: choisi ? 4.2 : 2.6, "class": choisi ? "pt-choisi" : "pt" }, svg);
        var dx = p.x - ctr.x, dy = p.y - ctr.y, l = Math.sqrt(dx * dx + dy * dy) || 1;
        var off = estSommet ? 14 : 13;
        var t = el("text", { x: (p.x + dx / l * off).toFixed(1), y: (p.y + dy / l * off + 5).toFixed(1), "text-anchor": "middle", "class": "etiq" + (estSommet ? "" : " etiq-n") }, svg);
        t.textContent = nm;
      });
      if (M && !Mloin) {
        var pm = P2(M);
        el("circle", { cx: pm.x.toFixed(1), cy: pm.y.toFixed(1), r: 5.5, "class": "pt-inter" }, svg);
        if (sc.v.loc && sc.v.loc.nom === "M") {
          var tm = el("text", { x: (pm.x + 10).toFixed(1), y: (pm.y - 9).toFixed(1), "class": "etiq etiq-m" }, svg);
          tm.textContent = "M";
        }
      }

      // panneaux
      var carte = sh.getElementById("carte");
      if (this._mode === "defi") {
        var q = this._defi;
        var nomsQ = q.type === "droites"
          ? "Quelle est la position des droites (" + q.d1.join("") + ") et (" + q.d2.join("") + ") ?"
          : "Quelle est la position de la droite (" + q.d1.join("") + ") par rapport au plan " + nomPlanSommets(q.trio) + " ?";
        sh.getElementById("question").textContent = nomsQ + (q.repondu ? "" : " Réponds d'après le dessin, puis fais tourner le cube pour vérifier.");
        var zone = sh.getElementById("choix");
        zone.innerHTML = "";
        var libelles = { "sécantes": "Sécantes", "parallèles": "Parallèles", "gauches": "Gauches", "incluse": "Incluse dans le plan", "parallèle": "Parallèle au plan", "sécante": "Sécante au plan" };
        q.cats.forEach(function (c) {
          var b = document.createElement("button");
          b.className = "btn"; b.type = "button"; b.textContent = libelles[c];
          if (q.repondu) {
            b.disabled = true;
            if (c === q.verdict.cat) { b.classList.add("ok"); b.textContent += " ✓"; }
            else if (c === q.choix) { b.classList.add("ko"); b.textContent += " ✗"; }
          } else {
            b.addEventListener("click", function () { q.repondu = true; q.choix = c; self._rendre(); });
          }
          zone.appendChild(b);
        });
        if (q.repondu) {
          carte.hidden = false;
          carte.innerHTML = '<div class="verdict">' + (q.choix === q.verdict.cat ? "Bonne réponse : " : "Réponse : ") + q.verdict.titre + '</div>' +
            '<div>' + q.verdict.justif + '</div><div class="note">La rotation est débloquée : fais tourner le cube pour vérifier.</div>';
        } else { carte.hidden = true; carte.innerHTML = ""; }
        return;
      }
      if (!sc.v) { carte.hidden = true; carte.innerHTML = ""; return; }
      carte.hidden = false;
      var extra = Mloin ? '<div class="note">(Le point M est trop loin pour être dessiné dans le cadre.)</div>' : "";
      carte.innerHTML = '<div class="verdict">' + sc.v.titre + '</div><div>' + sc.v.justif + '</div>' + extra +
        (this._vue.cav && sc.v.cat === "gauches" ? '<div class="note">Sur le dessin, les deux droites peuvent sembler se croiser : fais tourner le cube.</div>' : "");
    }
  }

  // pour les tests : verdicts exposés (aucun effet sur l'atelier)
  PositionsCubeWidget._calc = { verdictDroites: verdictDroites, verdictPlan: verdictPlan, droite: droite, PTS: PTS, tirerDefi: tirerDefi };

  if (!customElements.get("positions-cube-widget")) {
    customElements.define("positions-cube-widget", PositionsCubeWidget);
  }
})();
