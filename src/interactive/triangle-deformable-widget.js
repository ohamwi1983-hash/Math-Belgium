(function () {
  "use strict";

  /* ================================================================
   * <triangle-deformable-widget> — atelier interactif (4e, ch. 5, § 6) :
   * un triangle ABC dont on déplace les sommets (glisser au doigt ou à
   * la souris, ou — au clavier — choisir un sommet puis régler x et y
   * avec deux curseurs). En direct :
   *  - côtés a, b, c et angles Â, B̂, Ĉ ;
   *  - les trois rapports de la loi des sinus, toujours égaux au
   *    diamètre 2R du cercle circonscrit (dessiné, avec un diamètre) ;
   *  - Al-Kashi lue comme un « Pythagore corrigé » : a² comparé à
   *    b² + c², le terme −2bc·cos Â et son signe (Â aigu, droit, obtus) ;
   *  - l'aire ½·b·c·sin Â.
   * Fenêtre FIXE (jamais recalculée), sommets bornés au cadre, triangle
   * trop aplati refusé (le sommet reste à sa dernière position valide).
   * Coordonnées arrondies au dixième pendant le glissement, pour que les
   * cas exacts (angle droit, triangle isocèle…) soient réellement
   * atteignables. Web Component (Shadow DOM).
   * ================================================================ */

  var D2R = Math.PI / 180;
  var SVGNS = "http://www.w3.org/2000/svg";

  // Fenêtre du monde (unités) et du dessin (viewBox).
  var X_MIN = -1, X_MAX = 11, Y_MIN = -3, Y_MAX = 8;
  var LARGEUR = 420, HAUTEUR = Math.round(LARGEUR * (Y_MAX - Y_MIN) / (X_MAX - X_MIN));
  // Zone où un sommet peut se trouver (marge pour que l'étiquette reste visible).
  var BORNE = { xMin: -0.4, xMax: 10.4, yMin: -2.4, yMax: 7.4 };
  var ANGLE_MIN = 4; // degrés — en dessous, triangle refusé (trop aplati)
  var COTE_MIN = 0.8;

  // Défaut : a = 7, b = 5, c = 8 → Â = 60° exactement.
  function defaut() {
    return {
      A: { x: 1, y: 1 },
      B: { x: 9, y: 1 },
      C: { x: 1 + 5 * Math.cos(60 * D2R), y: 1 + 5 * Math.sin(60 * D2R) }
    };
  }

  function arrondi(n, d) {
    var f = Math.pow(10, d);
    var r = Math.round(n * f) / f;
    if (Object.is(r, -0)) r = 0;
    return r;
  }
  function fmt(n, d) {
    return arrondi(n, d).toFixed(d).replace(".", ",").replace("-", "−");
  }
  function exact(n, d) {
    return Math.abs(n - arrondi(n, d)) < 1e-7;
  }
  // « = 7,00 » ou « ≈ 7,21 »
  function egal(n, d) {
    return (exact(n, d) ? "= " : "≈ ") + fmt(n, d);
  }
  function signeTxt(n, d) {
    // valeur signée avec « − » typographique et « + » explicite
    var s = fmt(Math.abs(n), d);
    if (arrondi(n, d) === 0) return "0";
    return (n < 0 ? "−" : "+") + s;
  }

  function dist(P, Q) { return Math.hypot(P.x - Q.x, P.y - Q.y); }
  function angleEn(P, Q, R) {
    // angle en P du triangle PQR, en degrés
    var ux = Q.x - P.x, uy = Q.y - P.y, vx = R.x - P.x, vy = R.y - P.y;
    var c = (ux * vx + uy * vy) / (Math.hypot(ux, uy) * Math.hypot(vx, vy));
    c = Math.max(-1, Math.min(1, c));
    return Math.acos(c) / D2R;
  }

  function mesures(T) {
    var a = dist(T.B, T.C), b = dist(T.A, T.C), c = dist(T.A, T.B);
    var A = angleEn(T.A, T.B, T.C), B = angleEn(T.B, T.A, T.C);
    var C = 180 - A - B;
    // Centre du cercle circonscrit
    var ax = T.A.x, ay = T.A.y, bx = T.B.x, by = T.B.y, cx = T.C.x, cy = T.C.y;
    var dd = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
    var ux = ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / dd;
    var uy = ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / dd;
    var R = Math.hypot(ax - ux, ay - uy);
    return { a: a, b: b, c: c, A: A, B: B, C: C, O: { x: ux, y: uy }, R: R };
  }

  function valide(T) {
    var a = dist(T.B, T.C), b = dist(T.A, T.C), c = dist(T.A, T.B);
    if (a < COTE_MIN || b < COTE_MIN || c < COTE_MIN) return false;
    var A = angleEn(T.A, T.B, T.C), B = angleEn(T.B, T.A, T.C), C = 180 - A - B;
    return A >= ANGLE_MIN && B >= ANGLE_MIN && C >= ANGLE_MIN;
  }

  function sx(x) { return (x - X_MIN) / (X_MAX - X_MIN) * LARGEUR; }
  function sy(y) { return HAUTEUR - (y - Y_MIN) / (Y_MAX - Y_MIN) * HAUTEUR; }
  var ECHELLE = LARGEUR / (X_MAX - X_MIN);

  function el(tag, attrs, texte) {
    var e = document.createElementNS(SVGNS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (texte != null) e.textContent = texte;
    return e;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#182430);}' +
    '*{box-sizing:border-box;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:10px;}' +
    'svg{width:100%;max-width:520px;height:auto;background:var(--surface-2,#f7f9fb);border-radius:var(--radius,3px);display:block;}' +
    '.grille{stroke:var(--line-soft,#dfe7ec);stroke-width:1;}' +
    '.cercle{fill:none;stroke:var(--plan,#5b4ea3);stroke-width:1.4;stroke-dasharray:5 4;}' +
    '.diametre{stroke:var(--plan,#5b4ea3);stroke-width:1.4;stroke-dasharray:2 3;}' +
    '.centre{fill:var(--plan,#5b4ea3);}' +
    '.txt-plan{fill:var(--plan,#5b4ea3);font-size:12px;font-family:var(--sans,sans-serif);}' +
    '.tri{fill:var(--accent,#b65c1f);fill-opacity:0.08;stroke:var(--accent,#b65c1f);stroke-width:2.2;stroke-linejoin:round;}' +
    '.arc{fill:none;stroke:var(--ink-soft,#51626f);stroke-width:1.3;}' +
    '.arc-a{stroke:var(--accent,#b65c1f);stroke-width:2;}' +
    '.carre-droit{fill:none;stroke:var(--accent,#b65c1f);stroke-width:1.6;}' +
    '.poignee{fill:transparent;cursor:grab;touch-action:none;}' +
    '.sommet{fill:var(--ink,#182430);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.sommet.actif{fill:var(--accent,#b65c1f);}' +
    '.nom{font-size:15px;font-weight:700;fill:var(--ink,#182430);font-family:var(--serif,serif);font-style:italic;}' +
    '.nom-cote{font-size:14px;font-weight:600;fill:var(--accent-ink,#7a3c11);font-family:var(--serif,serif);font-style:italic;}' +
    '.aide{font-size:0.82rem;color:var(--ink-soft,#51626f);text-align:center;margin:0 0 12px;}' +
    '.blocs{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px;margin-bottom:14px;}' +
    '.bloc{background:var(--surface-2,#f7f9fb);border:1px solid var(--line-soft,#dfe7ec);border-radius:var(--radius,3px);padding:10px 12px;}' +
    '.bloc h4{margin:0 0 6px;font-size:0.78rem;letter-spacing:0.04em;color:var(--ink-soft,#51626f);font-weight:700;}' +
    '.bloc p{margin:3px 0;font-size:0.9rem;font-variant-numeric:tabular-nums;line-height:1.45;}' +
    '.bloc .fort{font-weight:700;color:var(--plan-ink,#443a80);}' +
    '.verdict{font-weight:600;}' +
    '.v-aigu{color:var(--good,#2f7a4f);}' +
    '.v-droit{color:var(--plan-ink,#443a80);}' +
    '.v-obtus{color:var(--bad,#b23a3a);}' +
    '.clavier{border-top:1px solid var(--line-soft,#dfe7ec);padding-top:12px;display:flex;flex-direction:column;gap:10px;}' +
    '.choix-sommet{display:flex;gap:8px;align-items:center;flex-wrap:wrap;}' +
    '.choix-sommet span{font-size:0.88rem;color:var(--ink-soft,#51626f);}' +
    '.btn{min-height:44px;min-width:44px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);background:var(--surface,#fff);color:var(--ink,#182430);font-weight:600;cursor:pointer;font-family:inherit;font-size:0.9rem;}' +
    '.btn[aria-pressed="true"]{background:var(--accent-soft,#f4e3d1);border-color:var(--accent-soft-line,#e6c8a4);color:var(--accent-ink,#7a3c11);}' +
    '.curseur{display:flex;align-items:center;gap:10px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3c11);min-width:22px;}' +
    '.curseur input{flex:1 1 auto;accent-color:var(--accent,#b65c1f);min-height:44px;}' +
    '.curseur .val{min-width:48px;text-align:right;font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#51626f);font-size:0.9rem;}' +
    '.btn-reset{align-self:center;background:var(--accent-soft,#f4e3d1);border-color:var(--accent-soft-line,#e6c8a4);color:var(--accent-ink,#7a3c11);}' +
    '.refus{min-height:1.3em;margin:0;text-align:center;font-size:0.84rem;color:var(--bad,#b23a3a);}' +
    '</style>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" role="img" aria-label="Triangle ABC déformable et son cercle circonscrit"></svg></div>' +
    '<p class="aide">Fais glisser les sommets A, B et C.</p>' +
    '<p class="refus" id="refus" aria-live="polite"></p>' +
    '<div class="blocs">' +
    '<div class="bloc"><h4>Côtés et angles</h4><div id="mesures"></div></div>' +
    '<div class="bloc"><h4>Loi des sinus</h4><div id="sinus"></div></div>' +
    '<div class="bloc"><h4>Al-Kashi : un Pythagore corrigé</h4><div id="kashi"></div></div>' +
    '<div class="bloc"><h4>Aire</h4><div id="aire"></div></div>' +
    '</div>' +
    '<div class="clavier">' +
    '<div class="choix-sommet"><span>Sommet à déplacer :</span>' +
    '<button class="btn" type="button" data-s="A" aria-pressed="false">A</button>' +
    '<button class="btn" type="button" data-s="B" aria-pressed="false">B</button>' +
    '<button class="btn" type="button" data-s="C" aria-pressed="true">C</button></div>' +
    '<div class="curseur"><label for="cx">x</label><input type="range" id="cx" min="' + BORNE.xMin + '" max="' + BORNE.xMax + '" step="0.1"><span class="val" id="cx-val"></span></div>' +
    '<div class="curseur"><label for="cy">y</label><input type="range" id="cy" min="' + BORNE.yMin + '" max="' + BORNE.yMax + '" step="0.1"><span class="val" id="cy-val"></span></div>' +
    '<button class="btn btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class TriangleDeformableWidget extends HTMLElement {
    constructor() {
      super();
      var s = this.attachShadow({ mode: "open" });
      s.appendChild(TEMPLATE.content.cloneNode(true));
      this._T = defaut();
      this._actif = "C";
      this._glisse = null;
      this._svg = s.getElementById("svg");
      this._mesures = s.getElementById("mesures");
      this._sinus = s.getElementById("sinus");
      this._kashi = s.getElementById("kashi");
      this._aire = s.getElementById("aire");
      this._refus = s.getElementById("refus");
      this._cx = s.getElementById("cx");
      this._cy = s.getElementById("cy");
      this._cxVal = s.getElementById("cx-val");
      this._cyVal = s.getElementById("cy-val");
      this._boutons = Array.prototype.slice.call(s.querySelectorAll("[data-s]"));
      this._reset = s.getElementById("reset");
      this._ecouteurs = [];
    }

    connectedCallback() {
      var self = this;
      function ecoute(cible, type, fn) { cible.addEventListener(type, fn); self._ecouteurs.push([cible, type, fn]); }

      this._boutons.forEach(function (b) {
        ecoute(b, "click", function () { self._actif = b.dataset.s; self._rendre(); });
      });
      ecoute(this._cx, "input", function () { self._deplacer(self._actif, parseFloat(self._cx.value), self._T[self._actif].y); });
      ecoute(this._cy, "input", function () { self._deplacer(self._actif, self._T[self._actif].x, parseFloat(self._cy.value)); });
      ecoute(this._reset, "click", function () { self._T = defaut(); self._actif = "C"; self._refus.textContent = ""; self._rendre(); });

      ecoute(this._svg, "pointerdown", function (e) {
        var t = e.target;
        if (!t || !t.dataset || !t.dataset.poignee) return;
        e.preventDefault();
        self._glisse = t.dataset.poignee;
        self._actif = self._glisse;
        try { self._svg.setPointerCapture(e.pointerId); } catch (err) { /* rien */ }
        self._rendre();
      });
      ecoute(this._svg, "pointermove", function (e) {
        if (!self._glisse) return;
        var p = self._versMonde(e.clientX, e.clientY);
        if (p) self._deplacer(self._glisse, arrondi(p.x, 1), arrondi(p.y, 1));
      });
      function fin(e) {
        if (!self._glisse) return;
        self._glisse = null;
        try { self._svg.releasePointerCapture(e.pointerId); } catch (err) { /* rien */ }
        self._rendre();
      }
      ecoute(this._svg, "pointerup", fin);
      ecoute(this._svg, "pointercancel", fin);
      this._rendre();
    }

    disconnectedCallback() {
      this._ecouteurs.forEach(function (x) { x[0].removeEventListener(x[1], x[2]); });
      this._ecouteurs = [];
    }

    _versMonde(cx, cy) {
      var m = this._svg.getScreenCTM();
      if (!m) return null;
      var pt = this._svg.createSVGPoint();
      pt.x = cx; pt.y = cy;
      var q = pt.matrixTransform(m.inverse());
      return {
        x: X_MIN + q.x / LARGEUR * (X_MAX - X_MIN),
        y: Y_MIN + (HAUTEUR - q.y) / HAUTEUR * (Y_MAX - Y_MIN)
      };
    }

    _deplacer(nom, x, y) {
      x = Math.max(BORNE.xMin, Math.min(BORNE.xMax, x));
      y = Math.max(BORNE.yMin, Math.min(BORNE.yMax, y));
      var essai = { A: this._T.A, B: this._T.B, C: this._T.C };
      essai[nom] = { x: x, y: y };
      if (valide(essai)) {
        this._T = essai;
        this._refus.textContent = "";
      } else {
        this._refus.textContent = "Triangle trop aplati : le sommet reste à sa dernière position.";
      }
      this._rendre();
    }

    _rendre() {
      var T = this._T, m = mesures(T), self = this;
      var svg = this._svg;
      svg.textContent = "";

      // clip au cadre
      var defs = el("defs", {});
      var clip = el("clipPath", { id: "cadre" });
      clip.appendChild(el("rect", { x: 0, y: 0, width: LARGEUR, height: HAUTEUR }));
      defs.appendChild(clip);
      svg.appendChild(defs);

      // quadrillage léger (unités)
      for (var gx = Math.ceil(X_MIN); gx <= X_MAX; gx++) svg.appendChild(el("line", { x1: sx(gx), y1: 0, x2: sx(gx), y2: HAUTEUR, class: "grille" }));
      for (var gy = Math.ceil(Y_MIN); gy <= Y_MAX; gy++) svg.appendChild(el("line", { x1: 0, y1: sy(gy), x2: LARGEUR, y2: sy(gy), class: "grille" }));

      var g = el("g", { "clip-path": "url(#cadre)" });
      // cercle circonscrit + diamètre passant par C
      g.appendChild(el("circle", { cx: sx(m.O.x), cy: sy(m.O.y), r: m.R * ECHELLE, class: "cercle" }));
      var Cp = { x: 2 * m.O.x - T.C.x, y: 2 * m.O.y - T.C.y };
      g.appendChild(el("line", { x1: sx(T.C.x), y1: sy(T.C.y), x2: sx(Cp.x), y2: sy(Cp.y), class: "diametre" }));
      g.appendChild(el("circle", { cx: sx(m.O.x), cy: sy(m.O.y), r: 3, class: "centre" }));
      svg.appendChild(g);
      var oDansCadre = m.O.x > X_MIN + 0.3 && m.O.x < X_MAX - 0.6 && m.O.y > Y_MIN + 0.4 && m.O.y < Y_MAX - 0.3;
      if (oDansCadre) svg.appendChild(el("text", { x: sx(m.O.x) + 6, y: sy(m.O.y) - 6, class: "txt-plan" }, "O"));

      // triangle
      svg.appendChild(el("polygon", { points: [T.A, T.B, T.C].map(function (P) { return sx(P.x) + "," + sy(P.y); }).join(" "), class: "tri" }));

      // arcs d'angle (Â en couleur : c'est l'angle d'Al-Kashi et de l'aire)
      [["A", "B", "C", m.A], ["B", "C", "A", m.B], ["C", "A", "B", m.C]].forEach(function (t) {
        var P = T[t[0]], Q = T[t[1]], R = T[t[2]], ang = t[3];
        var cls = t[0] === "A" ? "arc arc-a" : "arc";
        var rp = 20;
        if (Math.abs(ang - 90) < 0.05) {
          // carré d'angle droit
          var u = { x: (Q.x - P.x) / dist(P, Q), y: (Q.y - P.y) / dist(P, Q) };
          var v = { x: (R.x - P.x) / dist(P, R), y: (R.y - P.y) / dist(P, R) };
          var k = 12 / ECHELLE;
          var p1 = { x: P.x + u.x * k, y: P.y + u.y * k }, p3 = { x: P.x + v.x * k, y: P.y + v.y * k };
          var p2 = { x: p1.x + v.x * k, y: p1.y + v.y * k };
          svg.appendChild(el("polyline", { points: [p1, p2, p3].map(function (p) { return sx(p.x) + "," + sy(p.y); }).join(" "), class: t[0] === "A" ? "carre-droit" : "arc" }));
          return;
        }
        var a1 = Math.atan2(-(Q.y - P.y), Q.x - P.x), a2 = Math.atan2(-(R.y - P.y), R.x - P.x);
        // en coordonnées écran (y vers le bas)
        var x1 = sx(P.x) + rp * Math.cos(a1), y1 = sy(P.y) + rp * Math.sin(a1);
        var x2 = sx(P.x) + rp * Math.cos(a2), y2 = sy(P.y) + rp * Math.sin(a2);
        var cross = Math.cos(a1) * Math.sin(a2) - Math.sin(a1) * Math.cos(a2);
        svg.appendChild(el("path", { d: "M" + x1 + "," + y1 + " A" + rp + "," + rp + " 0 0," + (cross > 0 ? 1 : 0) + " " + x2 + "," + y2, class: cls }));
      });

      // noms des côtés (au milieu, poussés vers l'extérieur)
      var G = { x: (T.A.x + T.B.x + T.C.x) / 3, y: (T.A.y + T.B.y + T.C.y) / 3 };
      [["a", T.B, T.C], ["b", T.A, T.C], ["c", T.A, T.B]].forEach(function (t) {
        var M = { x: (t[1].x + t[2].x) / 2, y: (t[1].y + t[2].y) / 2 };
        var dx = M.x - G.x, dy = M.y - G.y, n = Math.hypot(dx, dy) || 1;
        var px = sx(M.x) + dx / n * 14, py = sy(M.y) - dy / n * 14 + 5;
        svg.appendChild(el("text", { x: px, y: py, "text-anchor": "middle", class: "nom-cote" }, t[0]));
      });

      // sommets : poignée (zone de saisie large), point, nom
      ["A", "B", "C"].forEach(function (nom) {
        var P = T[nom];
        var dx = P.x - G.x, dy = P.y - G.y, n = Math.hypot(dx, dy) || 1;
        var lx = sx(P.x) + dx / n * 17, ly = sy(P.y) - dy / n * 17 + 5;
        lx = Math.max(10, Math.min(LARGEUR - 10, lx));
        ly = Math.max(14, Math.min(HAUTEUR - 4, ly));
        svg.appendChild(el("text", { x: lx, y: ly, "text-anchor": "middle", class: "nom" }, nom));
        svg.appendChild(el("circle", { cx: sx(P.x), cy: sy(P.y), r: 6, class: "sommet" + (self._actif === nom ? " actif" : "") }));
        svg.appendChild(el("circle", { cx: sx(P.x), cy: sy(P.y), r: 24, class: "poignee", "data-poignee": nom }));
      });

      // --- textes ---
      var html = "";
      html += "<p>a = BC " + egal(m.a, 2) + " ; b = CA " + egal(m.b, 2) + " ; c = AB " + egal(m.c, 2) + "</p>";
      html += "<p>Â " + egal(m.A, 1) + "° ; B̂ " + egal(m.B, 1) + "° ; Ĉ " + egal(m.C, 1) + "°</p>";
      html += "<p>Â + B̂ + Ĉ = 180°</p>";
      this._mesures.innerHTML = html;

      var rA = m.a / Math.sin(m.A * D2R), rB = m.b / Math.sin(m.B * D2R), rC = m.c / Math.sin(m.C * D2R);
      html = "";
      html += "<p>a / sin Â " + egal(rA, 2) + "</p>";
      html += "<p>b / sin B̂ " + egal(rB, 2) + "</p>";
      html += "<p>c / sin Ĉ " + egal(rC, 2) + "</p>";
      html += '<p class="fort">Diamètre du cercle circonscrit : 2R ' + egal(2 * m.R, 2) + "</p>";
      html += "<p>Les trois rapports sont égaux, et égaux au diamètre (pointillés violets).</p>";
      this._sinus.innerHTML = html;

      var a2 = m.a * m.a, bc2 = m.b * m.b + m.c * m.c, terme = -2 * m.b * m.c * Math.cos(m.A * D2R);
      var droit = Math.abs(m.A - 90) < 0.05;
      html = "";
      html += "<p>a² " + egal(a2, 2) + "</p>";
      html += "<p>b² + c² " + egal(bc2, 2) + "</p>";
      if (droit) {
        html += "<p>terme −2bc·cos Â = 0</p>";
        html += '<p class="verdict v-droit">Â droit : cos Â = 0, Al-Kashi redevient Pythagore — a² = b² + c².</p>';
      } else if (m.A < 90) {
        html += "<p>terme −2bc·cos Â " + (exact(terme, 2) ? "= " : "≈ ") + signeTxt(terme, 2) + "</p>";
        html += '<p class="verdict v-aigu">Â aigu : cos Â &gt; 0, le terme est négatif — a² &lt; b² + c².</p>';
      } else {
        html += "<p>terme −2bc·cos Â " + (exact(terme, 2) ? "= " : "≈ ") + signeTxt(terme, 2) + "</p>";
        html += '<p class="verdict v-obtus">Â obtus : cos Â &lt; 0, le terme est positif — a² &gt; b² + c².</p>';
      }
      this._kashi.innerHTML = html;

      var aire = 0.5 * m.b * m.c * Math.sin(m.A * D2R);
      this._aire.innerHTML = "<p>Aire = ½ · b · c · sin Â " + egal(aire, 2) + "</p>" +
        "<p>(on obtient la même valeur avec ½ · a · c · sin B̂ ou ½ · a · b · sin Ĉ)</p>";

      // clavier
      this._boutons.forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.s === self._actif ? "true" : "false"); });
      var P = T[this._actif];
      this._cx.value = String(arrondi(P.x, 1));
      this._cy.value = String(arrondi(P.y, 1));
      this._cx.setAttribute("aria-label", "abscisse du sommet " + this._actif);
      this._cy.setAttribute("aria-label", "ordonnée du sommet " + this._actif);
      this._cxVal.textContent = (exact(P.x, 1) ? "" : "≈ ") + fmt(P.x, 1);
      this._cyVal.textContent = (exact(P.y, 1) ? "" : "≈ ") + fmt(P.y, 1);
    }
  }

  if (!customElements.get("triangle-deformable-widget")) {
    customElements.define("triangle-deformable-widget", TriangleDeformableWidget);
  }
})();
