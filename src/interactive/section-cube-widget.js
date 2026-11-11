(function () {
  "use strict";

  /* ================================================================
   * <section-cube-widget> — atelier interactif (4e, ch. 8, § 9) :
   * section plane d'un cube. Trois points P, Q, R placés sur des arêtes
   * (arête choisie + position t de 0 à 1) définissent le plan de coupe.
   * Le widget calcule l'intersection du plan (PQR) avec les 12 arêtes,
   * ordonne les points (polygone convexe), colorie la section et annonce
   * son nombre de côtés (triangle à hexagone). Le cube se fait tourner
   * (glisser, ou boutons) ; « Vue cavalière » remet la vue du cours :
   * x horizontal, z vertical, y fuyant à 45° et réduit de moitié.
   * Arêtes cachées en pointillés dans la vue courante.
   * Cube du cours : base ABCD (A avant-gauche, B avant-droit, C arrière-
   * droit, D arrière-gauche), E au-dessus de A, F de B, G de C, H de D.
   * Web Component (Shadow DOM), aucune bibliothèque.
   * ================================================================ */

  var SVGNS = "http://www.w3.org/2000/svg";
  var L = 300, H = 290, ECHELLE = 150;
  var EPS = 1e-9;

  var SOMMETS = {
    A: [0, 0, 0], B: [1, 0, 0], C: [1, 1, 0], D: [0, 1, 0],
    E: [0, 0, 1], F: [1, 0, 1], G: [1, 1, 1], H: [0, 1, 1]
  };
  var ARETES = ["AB", "BC", "CD", "DA", "EF", "FG", "GH", "HE", "AE", "BF", "CG", "DH"];
  // Faces : normale sortante + 4 sommets
  var FACES = [
    { nom: "ABCD", n: [0, 0, -1], s: "ABCD", axe: 2, val: 0 },
    { nom: "EFGH", n: [0, 0, 1], s: "EFGH", axe: 2, val: 1 },
    { nom: "ABFE", n: [0, -1, 0], s: "ABFE", axe: 1, val: 0 },
    { nom: "DCGH", n: [0, 1, 0], s: "DCGH", axe: 1, val: 1 },
    { nom: "ADHE", n: [-1, 0, 0], s: "ADHE", axe: 0, val: 0 },
    { nom: "BCGF", n: [1, 0, 0], s: "BCGF", axe: 0, val: 1 }
  ];
  var NOMS_POLY = { 3: "triangle", 4: "quadrilatère", 5: "pentagone", 6: "hexagone" };
  var PRESETS = {
    triangle: [["AB", 0.5], ["DA", 0.5], ["AE", 0.5]],
    quadrilatere: [["AE", 0.3], ["BF", 0.55], ["CG", 0.75]],
    pentagone: [["AB", 0.5], ["AE", 0.5], ["FG", 0.75]],
    hexagone: [["AB", 0.5], ["BF", 0.5], ["FG", 0.5]]
  };
  var YAW0 = -25, PITCH0 = 20;

  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function mul(a, k) { return [a[0] * k, a[1] * k, a[2] * k]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function norme(a) { return Math.sqrt(dot(a, a)); }

  function nb(v) {
    var r = Math.round(v * 100) / 100;
    if (Math.abs(r) < 1e-12) r = 0;
    return String(r).replace(".", ",").replace("-", "−");
  }

  function pointArete(nom, t) {
    var a = SOMMETS[nom[0]], b = SOMMETS[nom[1]];
    return add(a, mul(sub(b, a), t));
  }
  function decritPoint(nom, t) {
    if (t < 1e-6) return "le sommet " + nom[0];
    if (t > 1 - 1e-6) return "le sommet " + nom[1];
    if (Math.abs(t - 0.5) < 1e-6) return "le milieu de [" + nom + "]";
    return "un point de [" + nom + "]";
  }

  function el(tag, attrs, parent) {
    var e = document.createElementNS(SVGNS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  function optionsAretes() {
    return ARETES.map(function (a) { return '<option value="' + a + '">[' + a + "]</option>"; }).join("");
  }

  function lignePoint(nom) {
    return '<div class="ligne-point">' +
      '<div class="rangee-g"><span class="nom-pt">' + nom + '</span>' +
      '<select id="ar-' + nom + '" aria-label="Arête qui porte le point ' + nom + '">' + optionsAretes() + '</select>' +
      '<span class="val" id="val-' + nom + '"></span></div>' +
      '<input type="range" id="t-' + nom + '" min="0" max="1" step="0.05" aria-label="Position du point ' + nom + ' sur son arête, de 0 à 1">' +
      '</div>';
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#182430);}' +
    '*{box-sizing:border-box;}' +
    '[hidden]{display:none !important;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:8px;}' +
    'svg{width:100%;max-width:440px;height:auto;background:var(--surface-2,#f7f9fb);border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);touch-action:pan-y;cursor:grab;}' +
    'svg.glisse{cursor:grabbing;}' +
    '.arete{stroke:var(--ink,#182430);stroke-width:1.8;stroke-linecap:round;}' +
    '.arete-cachee{stroke:var(--ink-soft,#51626f);stroke-width:1.3;stroke-dasharray:5 4;}' +
    '.section{fill:var(--accent,#b65c1f);fill-opacity:0.22;stroke:none;}' +
    '.cote{stroke:var(--accent,#b65c1f);stroke-width:2.6;stroke-linecap:round;}' +
    '.cote-cache{stroke:var(--accent,#b65c1f);stroke-width:2;stroke-dasharray:5 4;}' +
    '.face-plan{fill:var(--plan,#5b4ea3);fill-opacity:0.18;stroke:var(--plan,#5b4ea3);stroke-width:2.4;}' +
    '.pt-donne{fill:var(--accent,#b65c1f);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.pt-calc{fill:var(--good,#2f7a4f);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.etiq{font-size:14px;font-weight:700;fill:var(--ink,#182430);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.etiq-donne{fill:var(--accent-ink,#7a3212);}' +
    '.etiq-calc{fill:var(--good,#2f7a4f);}' +
    '.lecture{display:flex;flex-direction:column;gap:8px;margin:0 auto 12px;max-width:620px;}' +
    '.carte{padding:10px 12px;border-radius:var(--radius,3px);background:var(--surface-2,#f7f9fb);border:1px solid var(--line,#ccd8e0);line-height:1.6;font-size:0.95rem;overflow-wrap:anywhere;}' +
    '.verdict{font-weight:700;font-size:1.05rem;color:var(--accent-ink,#7a3212);}' +
    '.alerte{border-color:var(--bad,#b23a3a);}' +
    '.alerte .verdict{color:var(--bad,#b23a3a);}' +
    '.note{font-size:0.85rem;color:var(--ink-soft,#51626f);}' +
    '.liste{margin:4px 0 0;padding-left:18px;}' +
    '.controles{display:flex;flex-direction:column;gap:10px;max-width:620px;margin:0 auto;}' +
    '.rangee{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-items:center;}' +
    '.libelle{font-size:0.88rem;color:var(--ink-soft,#51626f);font-weight:600;width:100%;text-align:center;}' +
    '.btn{min-height:44px;min-width:44px;padding:8px 12px;border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);background:var(--surface,#fff);color:var(--ink,#182430);font-weight:600;cursor:pointer;font-family:inherit;font-size:0.95rem;}' +
    '.btn[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);border-color:var(--accent,#b65c1f);color:var(--accent-ink,#7a3212);}' +
    '.btn:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid var(--accent,#b65c1f);outline-offset:2px;}' +
    '.ligne-point{display:flex;flex-direction:column;gap:2px;padding:6px 8px;border-radius:var(--radius,3px);background:var(--surface-2,#f7f9fb);border:1px solid var(--line,#ccd8e0);}' +
    '.rangee-g{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}' +
    '.nom-pt{font-weight:700;color:var(--accent-ink,#7a3212);min-width:18px;}' +
    'select{min-height:44px;min-width:88px;padding:6px 8px;border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);background:var(--surface,#fff);color:var(--ink,#182430);font:inherit;}' +
    '.val{font-size:0.9rem;color:var(--ink-soft,#51626f);font-variant-numeric:tabular-nums;}' +
    'input[type=range]{width:100%;margin:0;min-height:44px;accent-color:var(--accent,#b65c1f);}' +
    '</style>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + L + ' ' + H + '" role="img" aria-label="Un cube coupé par le plan PQR"></svg></div>' +
    '<div class="lecture" id="lecture" aria-live="polite"></div>' +
    '<div class="controles">' +
    '<div class="rangee"><span class="libelle">Tourner le cube (ou glisser sur la figure)</span>' +
    '<button class="btn" type="button" data-yaw="15" aria-label="Tourner vers la gauche">↺</button>' +
    '<button class="btn" type="button" data-yaw="-15" aria-label="Tourner vers la droite">↻</button>' +
    '<button class="btn" type="button" data-pitch="15" aria-label="Voir davantage le dessus">↑</button>' +
    '<button class="btn" type="button" data-pitch="-15" aria-label="Voir davantage le dessous">↓</button>' +
    '<button class="btn" type="button" id="cavaliere">Vue cavalière</button></div>' +
    '<div class="rangee"><span class="libelle">Réglages prêts</span>' +
    '<button class="btn" type="button" data-preset="triangle">Triangle</button>' +
    '<button class="btn" type="button" data-preset="quadrilatere">Quadrilatère</button>' +
    '<button class="btn" type="button" data-preset="pentagone">Pentagone</button>' +
    '<button class="btn" type="button" data-preset="hexagone">Hexagone régulier</button></div>' +
    lignePoint("P") + lignePoint("Q") + lignePoint("R") +
    '</div>';

  class SectionCubeWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._svg = shadow.getElementById("svg");
      this._lecture = shadow.getElementById("lecture");
      this._etat = { vue: "cavaliere", yaw: YAW0, pitch: PITCH0, pts: null, preset: "quadrilatere" };
      this._chargePreset("quadrilatere");
      this._ecouteurs = [];
    }

    _chargePreset(nom) {
      this._etat.preset = nom;
      this._etat.pts = PRESETS[nom].map(function (p) { return { arete: p[0], t: p[1] }; });
    }

    connectedCallback() {
      var self = this, sh = this.shadowRoot;
      function ecoute(c, t, f, o) { c.addEventListener(t, f, o); self._ecouteurs.push([c, t, f, o]); }
      Array.prototype.forEach.call(sh.querySelectorAll("[data-yaw],[data-pitch]"), function (b) {
        ecoute(b, "click", function () {
          var e = self._etat;
          if (e.vue === "cavaliere") { e.vue = "libre"; e.yaw = YAW0; e.pitch = PITCH0; }
          e.yaw = self._borneYaw(e.yaw + Number(b.getAttribute("data-yaw") || 0));
          e.pitch = self._bornePitch(e.pitch + Number(b.getAttribute("data-pitch") || 0));
          self._rendre();
        });
      });
      ecoute(sh.getElementById("cavaliere"), "click", function () {
        self._etat.vue = "cavaliere"; self._etat.yaw = YAW0; self._etat.pitch = PITCH0; self._rendre();
      });
      Array.prototype.forEach.call(sh.querySelectorAll("[data-preset]"), function (b) {
        ecoute(b, "click", function () { self._chargePreset(b.getAttribute("data-preset")); self._syncControles(); self._rendre(); });
      });
      ["P", "Q", "R"].forEach(function (nom, i) {
        ecoute(sh.getElementById("ar-" + nom), "change", function (ev) {
          self._etat.pts[i].arete = ev.target.value; self._etat.preset = null; self._rendre();
        });
        ecoute(sh.getElementById("t-" + nom), "input", function (ev) {
          self._etat.pts[i].t = Number(ev.target.value); self._etat.preset = null; self._rendre();
        });
      });
      // Glisser pour tourner
      var drag = null;
      ecoute(this._svg, "pointerdown", function (ev) {
        drag = { x: ev.clientX, y: ev.clientY, id: ev.pointerId };
        try { self._svg.setPointerCapture(ev.pointerId); } catch (e) { /* rien */ }
        self._svg.classList.add("glisse");
      });
      ecoute(this._svg, "pointermove", function (ev) {
        if (!drag || ev.pointerId !== drag.id) return;
        var dx = ev.clientX - drag.x, dy = ev.clientY - drag.y;
        if (Math.abs(dx) + Math.abs(dy) < 2) return;
        drag.x = ev.clientX; drag.y = ev.clientY;
        var e = self._etat;
        if (e.vue === "cavaliere") { e.vue = "libre"; e.yaw = YAW0; e.pitch = PITCH0; }
        e.yaw = self._borneYaw(e.yaw - dx * 0.6);
        e.pitch = self._bornePitch(e.pitch + dy * 0.6);
        self._rendre();
      });
      function fin() { drag = null; self._svg.classList.remove("glisse"); }
      ecoute(this._svg, "pointerup", fin);
      ecoute(this._svg, "pointercancel", fin);
      this._syncControles();
      this._rendre();
    }

    disconnectedCallback() {
      this._ecouteurs.forEach(function (x) { x[0].removeEventListener(x[1], x[2], x[3]); });
      this._ecouteurs = [];
    }

    _borneYaw(v) { return Math.max(-120, Math.min(120, v)); }
    _bornePitch(v) { return Math.max(-10, Math.min(70, v)); }

    _syncControles() {
      var sh = this.shadowRoot, pts = this._etat.pts;
      ["P", "Q", "R"].forEach(function (nom, i) {
        sh.getElementById("ar-" + nom).value = pts[i].arete;
        sh.getElementById("t-" + nom).value = String(pts[i].t);
      });
    }

    // Projection : renvoie [X écran, Y écran]
    _proj(p) {
      var e = this._etat, X, Y;
      if (e.vue === "cavaliere") {
        var k = 0.5 * Math.SQRT1_2;
        var cx = 0.5 + 0.5 * k, cy = 0.5 + 0.5 * k;
        X = p[0] + k * p[1] - cx;
        Y = p[2] + k * p[1] - cy;
      } else {
        var r = this._rot(sub(p, [0.5, 0.5, 0.5]));
        X = r[0]; Y = r[2];
      }
      return [L / 2 + ECHELLE * X, H / 2 - ECHELLE * Y];
    }
    _rot(v) {
      var e = this._etat;
      var a = e.yaw * Math.PI / 180, b = e.pitch * Math.PI / 180;
      var x1 = v[0] * Math.cos(a) - v[1] * Math.sin(a);
      var y1 = v[0] * Math.sin(a) + v[1] * Math.cos(a);
      var z1 = v[2];
      var y2 = y1 * Math.cos(b) - z1 * Math.sin(b);
      var z2 = y1 * Math.sin(b) + z1 * Math.cos(b);
      return [x1, y2, z2];
    }
    _faceVisible(f) {
      var e = this._etat;
      if (e.vue === "cavaliere") {
        var k = 0.5 * Math.SQRT1_2;
        return dot(f.n, [-k, 1, -k]) < -EPS;
      }
      return this._rot(f.n)[1] < -EPS;
    }

    _section() {
      var pts = this._etat.pts.map(function (p) { return pointArete(p.arete, p.t); });
      var n = cross(sub(pts[1], pts[0]), sub(pts[2], pts[0]));
      var nn = norme(n);
      if (nn < 1e-9) return { erreur: "alignes", pts: pts };
      n = mul(n, 1 / nn);
      var d = dot(n, pts[0]);
      function f(nom) { return dot(n, SOMMETS[nom]) - d; }
      // Face contenue dans le plan ?
      for (var i = 0; i < FACES.length; i++) {
        var s = FACES[i].s.split("");
        if (s.every(function (v) { return Math.abs(f(v)) < 1e-9; })) return { erreur: "face", face: FACES[i], pts: pts };
      }
      var inter = [];
      function ajoute(p, arete, t) {
        for (var j = 0; j < inter.length; j++) if (norme(sub(inter[j].p, p)) < 1e-7) return;
        inter.push({ p: p, arete: arete, t: t });
      }
      ARETES.forEach(function (a) {
        var f1 = f(a[0]), f2 = f(a[1]);
        if (Math.abs(f1) < 1e-9) ajoute(SOMMETS[a[0]], a, 0);
        if (Math.abs(f2) < 1e-9) ajoute(SOMMETS[a[1]], a, 1);
        if ((f1 < -1e-9 && f2 > 1e-9) || (f1 > 1e-9 && f2 < -1e-9)) {
          var t = f1 / (f1 - f2);
          ajoute(pointArete(a, t), a, t);
        }
      });
      if (inter.length < 3) return { erreur: "plat", pts: pts };
      // Ordre angulaire dans le plan
      var c = [0, 0, 0];
      inter.forEach(function (q) { c = add(c, q.p); });
      c = mul(c, 1 / inter.length);
      var u = sub(inter[0].p, c); u = mul(u, 1 / (norme(u) || 1));
      var v = cross(n, u);
      inter.forEach(function (q) { var w = sub(q.p, c); q.ang = Math.atan2(dot(w, v), dot(w, u)); });
      inter.sort(function (a, b) { return a.ang - b.ang; });
      // Commencer le tour par P (lecture plus naturelle : P, puis ses voisins)
      var iP = 0;
      inter.forEach(function (q, j) { if (norme(sub(q.p, pts[0])) < 1e-7) iP = j; });
      inter = inter.slice(iP).concat(inter.slice(0, iP));
      return { n: n, poly: inter, pts: pts };
    }

    _rendre() {
      var self = this, svg = this._svg, e = this._etat;
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var sec = this._section();
      var visibles = FACES.map(function (f) { return self._faceVisible(f); });

      // Arêtes du cube : cachées si les deux faces adjacentes sont invisibles
      function facesDe(a) {
        return FACES.map(function (f, i) { return f.s.indexOf(a[0]) >= 0 && f.s.indexOf(a[1]) >= 0 ? i : -1; }).filter(function (i) { return i >= 0; });
      }
      var aretesCachees = [], aretesVues = [];
      ARETES.forEach(function (a) {
        var vue = facesDe(a).some(function (i) { return visibles[i]; });
        (vue ? aretesVues : aretesCachees).push(a);
      });
      function trait(p1, p2, cls) {
        var a = self._proj(p1), b = self._proj(p2);
        el("line", { x1: a[0].toFixed(2), y1: a[1].toFixed(2), x2: b[0].toFixed(2), y2: b[1].toFixed(2), "class": cls }, svg);
      }
      aretesCachees.forEach(function (a) { trait(SOMMETS[a[0]], SOMMETS[a[1]], "arete-cachee"); });

      // Face contenue (cas dégénéré)
      if (sec.erreur === "face") {
        var pf = sec.face.s.split("").map(function (v) { return self._proj(SOMMETS[v]); });
        el("polygon", { points: pf.map(function (q) { return q[0].toFixed(2) + "," + q[1].toFixed(2); }).join(" "), "class": "face-plan" }, svg);
      }

      // Section
      if (sec.poly) {
        var p2 = sec.poly.map(function (q) { return self._proj(q.p); });
        el("polygon", { points: p2.map(function (q) { return q[0].toFixed(2) + "," + q[1].toFixed(2); }).join(" "), "class": "section" }, svg);
        for (var i = 0; i < sec.poly.length; i++) {
          var A = sec.poly[i].p, B = sec.poly[(i + 1) % sec.poly.length].p;
          trait(A, B, this._coteVisible(A, B, visibles) ? "cote" : "cote-cache");
        }
      }
      aretesVues.forEach(function (a) { trait(SOMMETS[a[0]], SOMMETS[a[1]], "arete"); });

      // Étiquettes des sommets (vers l'extérieur du cube)
      var centre = this._proj([0.5, 0.5, 0.5]);
      var occupes = [];
      Object.keys(SOMMETS).forEach(function (nom) {
        var q = self._proj(SOMMETS[nom]);
        var dx = q[0] - centre[0], dy = q[1] - centre[1], l = Math.sqrt(dx * dx + dy * dy) || 1;
        var x = q[0] + dx / l * 15, y = q[1] + dy / l * 15;
        occupes.push([x, y]);
        var t = el("text", { x: x.toFixed(1), y: (y + 5).toFixed(1), "class": "etiq", "text-anchor": "middle" }, svg);
        t.textContent = nom;
      });

      // Points de section : P, Q, R donnés ; autres nommés S, T, U
      var donnes = sec.pts;
      var autres = ["S", "T", "U", "V"], k = 0;
      var etiquetes = [];
      if (sec.poly) {
        sec.poly.forEach(function (q) {
          var idx = -1;
          donnes.forEach(function (d, j) { if (idx < 0 && norme(sub(d, q.p)) < 1e-7) idx = j; });
          q.nom = idx >= 0 ? "PQR"[idx] : autres[k++];
          q.donne = idx >= 0;
          etiquetes.push(q);
        });
      } else {
        donnes.forEach(function (d, j) { etiquetes.push({ p: d, nom: "PQR"[j], donne: true }); });
      }
      // Points d'abord (pour que les étiquettes évitent aussi les points)
      var projetes = etiquetes.map(function (q) { return self._proj(q.p); });
      projetes.forEach(function (s, j) {
        el("circle", { cx: s[0].toFixed(2), cy: s[1].toFixed(2), r: 5, "class": etiquetes[j].donne ? "pt-donne" : "pt-calc" }, svg);
      });
      // Étiquette : parmi 12 positions autour du point, la plus éloignée des étiquettes déjà
      // posées (sommets compris) et des autres points, et restant dans le cadre.
      etiquetes.forEach(function (q, j) {
        var s = projetes[j], meilleur = null, score = -1;
        for (var k2 = 0; k2 < 12; k2++) {
          var ang = k2 * Math.PI / 6;
          var x = s[0] + Math.cos(ang) * 15, y = s[1] + Math.sin(ang) * 15;
          if (x < 10 || x > L - 10 || y < 12 || y > H - 8) continue;
          var m = 1e9;
          occupes.forEach(function (o) { m = Math.min(m, Math.hypot(o[0] - x, o[1] - y)); });
          projetes.forEach(function (o, jj) { if (jj !== j) m = Math.min(m, Math.hypot(o[0] - x, o[1] - y) + 4); });
          if (m > score + 0.5) { score = m; meilleur = [x, y]; }
        }
        if (!meilleur) meilleur = [s[0] + 12, s[1] - 10];
        occupes.push(meilleur);
        var t = el("text", { x: meilleur[0].toFixed(1), y: (meilleur[1] + 5).toFixed(1), "class": "etiq " + (q.donne ? "etiq-donne" : "etiq-calc"), "text-anchor": "middle" }, svg);
        t.textContent = q.nom;
      });

      this._ecritLecture(sec);
      this._majBoutons();
    }

    _coteVisible(A, B, visibles) {
      for (var i = 0; i < FACES.length; i++) {
        var f = FACES[i];
        if (Math.abs(A[f.axe] - f.val) < 1e-7 && Math.abs(B[f.axe] - f.val) < 1e-7 && visibles[i]) return true;
      }
      return false;
    }

    _ecritLecture(sec) {
      var e = this._etat, h = "";
      var vals = e.pts;
      var sh = this.shadowRoot;
      ["P", "Q", "R"].forEach(function (nom, i) {
        sh.getElementById("val-" + nom).textContent = "t = " + nb(vals[i].t) + " — " + decritPoint(vals[i].arete, vals[i].t);
      });
      if (sec.erreur === "alignes") {
        h = '<div class="carte alerte"><div class="verdict">P, Q et R sont alignés (ou confondus)</div>' +
          '<div>Trois points alignés ne déterminent pas un plan : une infinité de plans passent par leur droite. Déplace l\'un des trois points.</div></div>';
      } else if (sec.erreur === "face") {
        h = '<div class="carte alerte"><div class="verdict">Le plan (PQR) est celui de la face ' + sec.face.nom + '</div>' +
          '<div>Le plan ne traverse pas le cube : il contient toute une face. La « section » est alors la face elle-même (en violet).</div></div>';
      } else if (sec.erreur === "plat") {
        h = '<div class="carte alerte"><div class="verdict">Le plan ne fait que toucher le cube</div>' +
          '<div>Il ne le coupe que suivant une arête ou en un sommet : pas de polygone de section.</div></div>';
      } else {
        var nbC = sec.poly.length;
        var nomPoly = NOMS_POLY[nbC] || (nbC + " côtés");
        var liste = sec.poly.map(function (q) {
          return "<li>" + q.nom + (q.donne ? " (donné)" : " (construit)") + " : " + decritPoint(q.arete, q.t) + "</li>";
        }).join("");
        var regulier = e.preset === "hexagone" ? " Ici, les 6 côtés ont la même longueur : c'est un hexagone régulier." : "";
        h = '<div class="carte"><div class="verdict">Section : ' + nomPoly + ' (' + nbC + ' côtés)</div>' +
          '<div>Le plan (PQR) traverse ' + nbC + ' faces du cube : chaque face traversée apporte exactement 2 sommets de la section, et deux faces voisines se partagent un sommet.' + regulier + '</div>' +
          '<ul class="liste">' + liste + '</ul></div>';
      }
      h += '<div class="note">' + (e.vue === "cavaliere"
        ? "Vue cavalière du cours : x horizontal, z vertical, y fuyant à 45° et réduit de moitié."
        : "Vue tournée : glisse sur la figure ou utilise les boutons ; « Vue cavalière » revient au dessin du cours.") +
        " Arêtes et côtés cachés en pointillés.</div>";
      this._lecture.innerHTML = h;
    }

    _majBoutons() {
      var e = this._etat, sh = this.shadowRoot;
      Array.prototype.forEach.call(sh.querySelectorAll("[data-preset]"), function (b) {
        b.setAttribute("aria-pressed", String(b.getAttribute("data-preset") === e.preset));
      });
      sh.getElementById("cavaliere").setAttribute("aria-pressed", String(e.vue === "cavaliere"));
    }
  }

  if (!customElements.get("section-cube-widget")) customElements.define("section-cube-widget", SectionCubeWidget);
})();
