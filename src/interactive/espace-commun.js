(function (root) {
  "use strict";

  /* ================================================================
   * Outils partagés des ateliers de géométrie dans l'espace (4e, ch. 8,
   * lot G de l'audit) : cube ABCDEFGH de côté 2 (coordonnées entières,
   * jamais affichées : le chapitre raisonne sans repère), points nommés,
   * arithmétique exacte (entiers et fractions), plans par trois points,
   * position de deux plans, découpe d'une droite et d'un plan par une
   * boîte, localisation d'un point en mots, vue cavalière ou tournée au
   * doigt, dessin du cube (arêtes cachées en pointillés), styles communs.
   * Exposé sur window.EspaceCommun (importé AVANT chaque atelier par son
   * register-*.js). Aucun « déterminant », aucun radian.
   * Convention du cours : base ABCD (A avant-gauche, B avant-droit,
   * C arrière-droit, D arrière-gauche), E au-dessus de A, F de B, G de C,
   * H de D.
   * ================================================================ */

  var SVGNS = "http://www.w3.org/2000/svg";

  var PTS = {
    A: [0, 0, 0], B: [2, 0, 0], C: [2, 2, 0], D: [0, 2, 0],
    E: [0, 0, 2], F: [2, 0, 2], G: [2, 2, 2], H: [0, 2, 2],
    I: [0, 0, 1], J: [2, 0, 1], K: [2, 1, 2], O: [1, 1, 0], "O′": [1, 1, 2]
  };
  var NOMS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "O", "O′"];
  var SOMMETS = ["A", "B", "C", "D", "E", "F", "G", "H"];
  var DESCR_NOMME = {
    I: "le point I, milieu de [AE]", J: "le point J, milieu de [BF]", K: "le point K, milieu de [FG]",
    O: "le point O, centre de la face ABCD", "O′": "le point O′, centre de la face EFGH"
  };
  var NOTE_POINTS = "Points nommés : I milieu de [AE], J milieu de [BF], K milieu de [FG], O centre de ABCD, O′ centre de EFGH.";

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
  // plans remarquables à 4 sommets (6 faces + 6 rectangles diagonaux) et plans « de coin »
  var QUADS = ["ABCD", "EFGH", "ABFE", "BCGF", "CDHG", "DAEH", "ABGH", "CDEF", "ADGF", "BCHE", "ACGE", "BDHF"];
  var COINS = ["BDE", "ACF", "BDG", "ACH", "AFH", "BEG", "CFH", "DEG"];

  // ---------- arithmétique ----------
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function mul(k, a) { return [k * a[0], k * a[1], k * a[2]]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function nul(a) { return a[0] === 0 && a[1] === 0 && a[2] === 0; }
  function pgcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a; }
  // point rationnel { n:[..], d } = P + (a/b)·u
  function ptRat(P, a, b, u) {
    if (b < 0) { a = -a; b = -b; }
    var n = add(mul(b, P), mul(a, u));
    var g = pgcd(pgcd(pgcd(n[0], n[1]), n[2]), b) || 1;
    return { n: [n[0] / g, n[1] / g, n[2] / g], d: b / g };
  }
  function ratEgal(M, P) { return M.n[0] === M.d * P[0] && M.n[1] === M.d * P[1] && M.n[2] === M.d * P[2]; }
  function ratVal(M) { return [M.n[0] / M.d, M.n[1] / M.d, M.n[2] / M.d]; }

  // ---------- plans et droites ----------
  function droite(a, b) { return { a: a, b: b, P: PTS[a], u: sub(PTS[b], PTS[a]), nom: "(" + a + b + ")" }; }
  /** Plan par trois noms de points ; null si les points sont alignés. */
  function plan(noms) {
    var V = PTS[noms[0]], n = cross(sub(PTS[noms[1]], V), sub(PTS[noms[2]], V));
    if (nul(n)) return null;
    return { V: V, n: n, noms: noms.slice(), nom: nomPlan(noms) };
  }
  function contient(pl, X) { return dot(pl.n, sub(X, pl.V)) === 0; }
  function contientRat(pl, M) { return dot(pl.n, sub(M.n, mul(M.d, pl.V))) === 0; }
  function contientDroite(pl, L) { return contient(pl, L.P) && contient(pl, add(L.P, L.u)); }
  /** Nom d'un plan : le quadrilatère remarquable qui contient ses trois points s'il existe. */
  function nomPlan(noms) {
    var tousSommets = noms.every(function (c) { return SOMMETS.indexOf(c) >= 0; });
    if (tousSommets) {
      for (var i = 0; i < QUADS.length; i++) {
        var q = QUADS[i];
        if (noms.every(function (c) { return q.indexOf(c) >= 0; })) return "(" + q + ")";
      }
    }
    return "(" + noms.join("") + ")";
  }
  /** Points nommés d'un plan. */
  function pointsDuPlan(pl) { return NOMS.filter(function (c) { return contient(pl, PTS[c]); }); }
  /** Position de deux plans : confondus, parallèles ou sécants (P point réel de la droite commune, u direction entière). */
  function deuxPlans(p1, p2) {
    var u = cross(p1.n, p2.n);
    if (nul(u)) return contient(p1, p2.V) ? { type: "confondus" } : { type: "paralleles" };
    // point de la droite commune : résolution de n1·X = c1, n2·X = c2, u·X = u·V1 (réel)
    var c1 = dot(p1.n, p1.V), c2 = dot(p2.n, p2.V);
    var a = p1.n, b = p2.n;
    // X = (c1 (b×u) + c2 (u×a)) / (u·u)   (formule classique, u = a×b)
    var X = mul(1 / dot(u, u), add(mul(c1, cross(b, u)), mul(c2, cross(u, a))));
    return { type: "secants", P: X, u: u };
  }
  /** Intersection exacte droite / plan : null si parallèle ou incluse. */
  function percee(L, pl) {
    var nu = dot(pl.n, L.u);
    if (nu === 0) return null;
    return ptRat(L.P, dot(pl.n, sub(pl.V, L.P)), nu, L.u);
  }
  /** Droites distinctes passant par au moins deux points nommés (liste de noms). */
  function droitesNommees(liste) {
    var res = [];
    liste = liste || NOMS;
    for (var i = 0; i < liste.length; i++) for (var j = i + 1; j < liste.length; j++) {
      var L = droite(liste[i], liste[j]);
      var deja = res.some(function (M) { return nul(cross(M.u, L.u)) && nul(cross(sub(L.P, M.P), M.u)); });
      if (!deja) res.push(L);
    }
    return res;
  }
  function memeDroite(L, M) { return nul(cross(M.u, L.u)) && nul(cross(sub(L.P, M.P), M.u)); }

  // ---------- localisation en mots (aucune coordonnée) ----------
  function nomPoint(M) {
    for (var i = 0; i < NOMS.length; i++) if (ratEgal(M, PTS[NOMS[i]])) return NOMS[i];
    return null;
  }
  function localiser(M, lettre) {
    lettre = lettre || "M";
    var nm = nomPoint(M);
    if (nm) return { nom: nm, txt: SOMMETS.indexOf(nm) >= 0 ? "le sommet " + nm : DESCR_NOMME[nm], dehors: false };
    for (var i = 0; i < ARETES.length; i++) {
      var X = PTS[ARETES[i][0]], Y = PTS[ARETES[i][1]], nx = ARETES[i][0], ny = ARETES[i][1];
      var XY = sub(Y, X), XM = sub(M.n, mul(M.d, X));
      if (!nul(cross(XM, XY))) continue;
      var num = dot(XM, XY), den = M.d * dot(XY, XY);
      if (num > 0 && num < den) return { nom: lettre, txt: lettre + ", sur l'arête [" + nx + ny + "]" + (2 * num === den ? " (en son milieu)" : ""), dehors: false };
      if (num > den) {
        var s = lettre + ", sur le prolongement de [" + nx + ny + "], au-delà de " + ny;
        if (num === 2 * den) s += " : " + ny + " est le milieu de [" + nx + lettre + "]";
        return { nom: lettre, txt: s, dehors: true };
      }
      if (num < 0) {
        var s2 = lettre + ", sur le prolongement de [" + nx + ny + "], au-delà de " + nx;
        if (num === -den) s2 += " : " + nx + " est le milieu de [" + lettre + ny + "]";
        return { nom: lettre, txt: s2, dehors: true };
      }
    }
    var v = ratVal(M);
    var dedans = v.every(function (c) { return c >= 0 && c <= 2; });
    if (dedans) {
      for (var f in FACES) {
        var face = FACES[f], V0 = PTS[face.nom[0]];
        if (dot(face.n, sub(M.n, mul(M.d, V0))) === 0) return { nom: lettre, txt: lettre + ", à l'intérieur de la face " + face.nom, dehors: false };
      }
      return { nom: lettre, txt: lettre + ", à l'intérieur du cube", dehors: false };
    }
    return { nom: lettre, txt: lettre + ", hors du solide", dehors: true };
  }
  function versRat(X) { // point réel à coordonnées rationnelles simples → fraction exacte (dénominateur ≤ 24)
    for (var d = 1; d <= 24; d++) {
      var n = X.map(function (c) { return Math.round(c * d); });
      if (n.every(function (k, i) { return Math.abs(k / d - X[i]) < 1e-9; })) {
        var g = pgcd(pgcd(pgcd(n[0], n[1]), n[2]), d) || 1;
        return { n: [n[0] / g, n[1] / g, n[2] / g], d: d / g };
      }
    }
    return null;
  }

  // ---------- découpe ----------
  function boite(extra) {
    var lo = [-0.35, -0.35, -0.35], hi = [2.35, 2.35, 2.35];
    (extra || []).forEach(function (X) { for (var i = 0; i < 3; i++) { lo[i] = Math.min(lo[i], X[i] - 0.45); hi[i] = Math.max(hi[i], X[i] + 0.45); } });
    return { lo: lo, hi: hi };
  }
  function clipDroite(P, u, bx) {
    var t0 = -1e9, t1 = 1e9;
    for (var i = 0; i < 3; i++) {
      if (Math.abs(u[i]) < 1e-12) { if (P[i] < bx.lo[i] - 1e-9 || P[i] > bx.hi[i] + 1e-9) return null; continue; }
      var a = (bx.lo[i] - P[i]) / u[i], b = (bx.hi[i] - P[i]) / u[i];
      t0 = Math.max(t0, Math.min(a, b)); t1 = Math.min(t1, Math.max(a, b));
    }
    return t0 < t1 - 1e-9 ? [t0, t1] : null;
  }
  function segmentDroite(P, u, bx) {
    var r = clipDroite(P, u, bx);
    return r ? [add(P, mul(r[0], u)), add(P, mul(r[1], u))] : null;
  }
  /** Polygone d'un plan (V, n) découpé par une boîte, sommets dans l'ordre. */
  function planBoite(V, n, bx) {
    var c = [], lo = bx.lo, hi = bx.hi, coins = [];
    for (var a = 0; a < 2; a++) for (var b = 0; b < 2; b++) for (var d = 0; d < 2; d++) coins.push([a ? hi[0] : lo[0], b ? hi[1] : lo[1], d ? hi[2] : lo[2]]);
    var ar = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
    ar.forEach(function (e) {
      var X = coins[e[0]], Y = coins[e[1]];
      var fx = dot(n, sub(X, V)), fy = dot(n, sub(Y, V));
      if (Math.abs(fx - fy) < 1e-12) { if (Math.abs(fx) < 1e-12) { c.push(X); c.push(Y); } return; }
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
  var CUBE = { lo: [0, 0, 0], hi: [2, 2, 2] };
  /** Face (clé de FACES) qui contient un point réel du bord du cube, sinon null. */
  function faceDe(X) {
    for (var f in FACES) {
      var face = FACES[f], V0 = PTS[face.nom[0]];
      if (Math.abs(dot(face.n, sub(X, V0))) < 1e-9) return f;
    }
    return null;
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
    return { p: function (X) { var d = sub(X, C0); return { u: dot(d, r), v: dot(d, up) }; }, f: f };
  }

  function el(tag, attrs, parent) {
    var e = document.createElementNS(SVGNS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  /**
   * Dessine une scène dans `svg` (viewBox larg × haut).
   * scene = { cube: bool, polys: [{pts, cls}], segs: [{a, b, cls}], points: [{X, nom, cls, r, etiq}],
   *           centre: [x,y,z] (facultatif), rayon: nombre (facultatif) }
   */
  function dessiner(svg, etat, scene, larg, haut) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var tous = [];
    if (scene.cube !== false) SOMMETS.forEach(function (c) { tous.push(PTS[c]); });
    (scene.polys || []).forEach(function (p) { p.pts.forEach(function (X) { tous.push(X); }); });
    (scene.segs || []).forEach(function (s) { tous.push(s.a, s.b); });
    (scene.points || []).forEach(function (p) { tous.push(p.X); });
    var C0 = scene.centre, R = scene.rayon;
    if (!C0) {
      var lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
      tous.forEach(function (X) { for (var i = 0; i < 3; i++) { lo[i] = Math.min(lo[i], X[i]); hi[i] = Math.max(hi[i], X[i]); } });
      C0 = [(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2];
    }
    if (!R) {
      R = 0;
      tous.forEach(function (X) { var d = sub(X, C0); R = Math.max(R, Math.sqrt(dot(d, d))); });
      R = Math.max(R + 0.12, Math.sqrt(3) + 0.15);
    }
    var echelle = (Math.min(larg, haut) / 2 - 14) / (R * 1.05);
    var V = vue(etat, C0);
    var du = 0, dv = 0;
    if (etat.cav && !scene.rayon) {
      // vue cavalière (fixe) : cadrage sur l'encombrement réel du dessin, marges pour les étiquettes
      var u0 = 1e9, u1 = -1e9, v0 = 1e9, v1 = -1e9;
      tous.forEach(function (X) { var q = V.p(X); u0 = Math.min(u0, q.u); u1 = Math.max(u1, q.u); v0 = Math.min(v0, q.v); v1 = Math.max(v1, q.v); });
      echelle = Math.min((larg - 44) / Math.max(u1 - u0, 1e-6), (haut - 44) / Math.max(v1 - v0, 1e-6));
      du = (u0 + u1) / 2; dv = (v0 + v1) / 2;
    }
    var P2 = function (X) { var q = V.p(X); return { x: larg / 2 + echelle * (q.u - du), y: haut / 2 - echelle * (q.v - dv) }; };
    var pts = function (L) { return L.map(function (X) { var p = P2(X); return p.x.toFixed(1) + "," + p.y.toFixed(1); }).join(" "); };
    (scene.polys || []).forEach(function (p) { if (p.pts.length >= 3) el("polygon", { points: pts(p.pts), "class": p.cls }, svg); });
    var ligne = function (X, Y, cls) { var p = P2(X), q = P2(Y); el("line", { x1: p.x.toFixed(1), y1: p.y.toFixed(1), x2: q.x.toFixed(1), y2: q.y.toFixed(1), "class": cls }, svg); };
    if (scene.cube !== false) {
      var vis = {};
      for (var f in FACES) vis[f] = dot(FACES[f].n, V.f) < 0;
      ARETES.forEach(function (ar) { if (!(vis[ar[2]] || vis[ar[3]])) ligne(PTS[ar[0]], PTS[ar[1]], "arete-cachee"); });
      ARETES.forEach(function (ar) { if (vis[ar[2]] || vis[ar[3]]) ligne(PTS[ar[0]], PTS[ar[1]], "arete"); });
    }
    (scene.segs || []).forEach(function (s) { ligne(s.a, s.b, s.cls); });
    var ctr = P2(scene.centreEtiquettes || (scene.cube !== false ? [1, 1, 1] : C0));
    (scene.points || []).forEach(function (pt) {
      var p = P2(pt.X);
      el("circle", { cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: pt.r || 3, "class": pt.cls || "pt" }, svg);
      if (!pt.nom) return;
      var dx = p.x - ctr.x, dy = p.y - ctr.y, l = Math.sqrt(dx * dx + dy * dy);
      if (l < 1) { dx = 1; dy = -1; l = Math.SQRT2; }
      var off = pt.decalage || 14;
      var x = p.x + dx / l * off, y = p.y + dy / l * off + 5;
      x = Math.max(8, Math.min(larg - 8, x)); y = Math.max(14, Math.min(haut - 4, y));
      var t = el("text", { x: x.toFixed(1), y: y.toFixed(1), "text-anchor": "middle", "class": pt.etiq || "etiq" }, svg);
      t.textContent = pt.nom;
    });
    return { P2: P2 };
  }

  /** Rotation au doigt (pointeurs) : la première touche quitte la vue cavalière. */
  function installerRotation(svg, etat, rendre) {
    var drag = null;
    svg.addEventListener("pointerdown", function (e) {
      drag = { x: e.clientX, y: e.clientY };
      if (etat.cav) { etat.cav = false; etat.yaw = 30; etat.pitch = 20; }
      try { svg.setPointerCapture(e.pointerId); } catch (err) { /* rien */ }
    });
    svg.addEventListener("pointermove", function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      drag = { x: e.clientX, y: e.clientY };
      etat.yaw = (etat.yaw + dx * 0.6) % 360;
      etat.pitch = Math.max(-80, Math.min(80, etat.pitch + dy * 0.6));
      rendre();
    });
    var fin = function () { drag = null; };
    svg.addEventListener("pointerup", fin);
    svg.addEventListener("pointercancel", fin);
  }
  function tourner(etat, sens) {
    if (etat.cav) { etat.cav = false; etat.yaw = 30; etat.pitch = 20; }
    if (sens === "g") etat.yaw -= 15;
    if (sens === "d") etat.yaw += 15;
    if (sens === "h") etat.pitch = Math.min(80, etat.pitch + 15);
    if (sens === "b") etat.pitch = Math.max(-80, etat.pitch - 15);
  }
  function boutonsRotation(avecCav) {
    return '<div class="rot" role="group" aria-label="Rotation">' +
      '<button class="btn" type="button" data-rot="g" aria-label="Tourner vers la gauche">◀</button>' +
      '<button class="btn" type="button" data-rot="h" aria-label="Basculer vers le haut">▲</button>' +
      '<button class="btn" type="button" data-rot="b" aria-label="Basculer vers le bas">▼</button>' +
      '<button class="btn" type="button" data-rot="d" aria-label="Tourner vers la droite">▶</button>' +
      (avecCav === false ? "" : '<button class="btn" type="button" data-cav="1">Vue cavalière</button>') +
      '</div>';
  }

  function options(liste) { return liste.map(function (c) { return '<option value="' + c + '">' + c + '</option>'; }).join(""); }
  function select(id, liste, libelle) { return '<select id="' + id + '" aria-label="' + (libelle || "Point") + '">' + options(liste || NOMS) + '</select>'; }

  var CSS =
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#182430);}' +
    '*{box-sizing:border-box;}' +
    '.modes{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:0 0 12px;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:8px;}' +
    'svg{width:100%;max-width:500px;height:auto;background:var(--surface-2,#f7f9fb);border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);touch-action:none;cursor:grab;user-select:none;}' +
    '.arete{stroke:var(--ink,#182430);stroke-width:1.7;fill:none;}' +
    '.arete-cachee{stroke:var(--ink-soft,#51626f);stroke-width:1.3;stroke-dasharray:5 4;fill:none;}' +
    '.plan{fill:var(--plan,#5b4ea3);fill-opacity:0.16;stroke:var(--plan,#5b4ea3);stroke-width:1.2;stroke-opacity:0.7;}' +
    '.plan2{fill:var(--sky,#2f6fb0);fill-opacity:0.14;stroke:var(--sky,#2f6fb0);stroke-width:1.2;stroke-opacity:0.7;}' +
    '.plan-ok{fill:var(--good,#2f7a4f);fill-opacity:0.16;stroke:var(--good,#2f7a4f);stroke-width:1.2;stroke-opacity:0.7;}' +
    '.plan-ko{fill:var(--bad,#b23a3a);fill-opacity:0.10;stroke:var(--bad,#b23a3a);stroke-width:1.2;stroke-opacity:0.6;stroke-dasharray:6 4;}' +
    '.d1{stroke:var(--accent,#b65c1f);stroke-width:3;stroke-linecap:round;}' +
    '.d1x{stroke:var(--accent,#b65c1f);stroke-width:1.6;stroke-dasharray:6 5;}' +
    '.d2{stroke:var(--sky,#2f6fb0);stroke-width:3;stroke-linecap:round;}' +
    '.d2x{stroke:var(--sky,#2f6fb0);stroke-width:1.6;stroke-dasharray:6 5;}' +
    '.ok{stroke:var(--good,#2f7a4f);stroke-width:3;stroke-linecap:round;}' +
    '.okx{stroke:var(--good,#2f7a4f);stroke-width:1.6;stroke-dasharray:6 5;}' +
    '.ko{stroke:var(--bad,#b23a3a);stroke-width:2.2;stroke-dasharray:7 5;stroke-linecap:round;}' +
    '.inter{stroke:var(--bad,#b23a3a);stroke-width:3.2;stroke-linecap:round;}' +
    '.trace{stroke:var(--ink-soft,#51626f);stroke-width:1.4;stroke-dasharray:3 3;}' +
    '.pt{fill:var(--ink,#182430);}' +
    '.pt-choisi{fill:var(--ink,#182430);stroke:var(--surface-2,#f7f9fb);stroke-width:1.5;}' +
    '.pt-inter{fill:var(--bad,#b23a3a);stroke:var(--surface-2,#f7f9fb);stroke-width:2;}' +
    '.pt-ok{fill:var(--good,#2f7a4f);stroke:var(--surface-2,#f7f9fb);stroke-width:2;}' +
    '.etiq{font-size:14px;font-weight:700;font-family:var(--sans,sans-serif);fill:var(--ink,#182430);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.etiq-n{font-size:13px;fill:var(--ink-soft,#51626f);}' +
    '.etiq-m{fill:var(--bad,#b23a3a);}' +
    '.etiq-ok{fill:var(--good,#2f7a4f);}' +
    '.etiq-d{fill:var(--accent,#b65c1f);font-style:italic;}' +
    '.etiq-d2{fill:var(--sky,#2f6fb0);font-style:italic;}' +
    '.rot{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:0 0 12px;}' +
    '.selection{display:flex;flex-direction:column;gap:8px;align-items:center;margin:0 auto 12px;max-width:620px;}' +
    '.ligne{display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:center;}' +
    '.libelle{font-size:0.9rem;font-weight:600;color:var(--ink-soft,#51626f);}' +
    '.c1{color:var(--accent,#b65c1f);} .c2{color:var(--sky-ink,#1f4e7d);} .cp{color:var(--plan-ink,#443a80);} .cok{color:var(--good,#2f7a4f);} .cko{color:var(--bad,#b23a3a);}' +
    'select{min-height:44px;min-width:58px;max-width:100%;font:inherit;font-size:1rem;font-weight:700;padding:6px 8px;border:1px solid var(--line,#ccd8e0);border-radius:var(--radius,3px);background:var(--surface,#fff);color:var(--ink,#182430);}' +
    'input[type=range]{width:min(320px,100%);min-height:44px;accent-color:var(--accent,#b65c1f);}' +
    '.btn{min-height:44px;min-width:44px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);background:var(--surface,#fff);color:var(--ink,#182430);font-weight:600;cursor:pointer;font-family:inherit;font-size:0.95rem;}' +
    '.btn[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);border-color:var(--accent,#b65c1f);color:var(--accent-ink,#7a3212);}' +
    '.btn:disabled{opacity:0.45;cursor:not-allowed;}' +
    '.btn:focus-visible,select:focus-visible,input:focus-visible{outline:2px solid var(--accent,#b65c1f);outline-offset:2px;}' +
    '.btn-reset{background:var(--accent-soft,#f6e2d3);border-color:var(--accent-soft-line,#e8c4a4);color:var(--accent-ink,#7a3212);}' +
    '.carte{padding:10px 12px;border-radius:var(--radius,3px);background:var(--surface-2,#f7f9fb);border:1px solid var(--line,#ccd8e0);line-height:1.55;font-size:0.95rem;margin:0 auto 12px;max-width:620px;}' +
    '.carte ol{margin:4px 0 0;padding-left:1.3em;} .carte li{margin:2px 0;}' +
    '.verdict{font-weight:700;font-size:1.05rem;color:var(--plan-ink,#443a80);margin-bottom:4px;}' +
    '.refus{font-weight:700;color:var(--bad,#b23a3a);}' +
    '.note{font-size:0.86rem;color:var(--ink-soft,#51626f);text-align:center;}' +
    '.message{color:var(--bad,#b23a3a);font-size:0.9rem;min-height:1.2em;text-align:center;margin:0 auto 8px;max-width:620px;}' +
    '.bas{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;}' +
    '[hidden]{display:none!important;}';

  root.EspaceCommun = {
    PTS: PTS, NOMS: NOMS, SOMMETS: SOMMETS, FACES: FACES, ARETES: ARETES, QUADS: QUADS, COINS: COINS,
    DESCR_NOMME: DESCR_NOMME, NOTE_POINTS: NOTE_POINTS, CUBE: CUBE,
    sub: sub, add: add, mul: mul, dot: dot, cross: cross, nul: nul,
    ptRat: ptRat, ratVal: ratVal, ratEgal: ratEgal, versRat: versRat,
    droite: droite, plan: plan, nomPlan: nomPlan, contient: contient, contientRat: contientRat, contientDroite: contientDroite,
    pointsDuPlan: pointsDuPlan, deuxPlans: deuxPlans, percee: percee, droitesNommees: droitesNommees, memeDroite: memeDroite,
    nomPoint: nomPoint, localiser: localiser, faceDe: faceDe,
    boite: boite, clipDroite: clipDroite, segmentDroite: segmentDroite, planBoite: planBoite,
    vue: vue, el: el, dessiner: dessiner, installerRotation: installerRotation, tourner: tourner, boutonsRotation: boutonsRotation,
    options: options, select: select, CSS: CSS
  };
})(window);
