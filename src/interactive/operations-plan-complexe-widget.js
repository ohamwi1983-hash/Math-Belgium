(function () {
  "use strict";

  /* ================================================================
   * <operations-plan-complexe-widget> — atelier « les opérations, vues
   * dans le plan » (6e, ch. 5, §1–2). Deux points z et w se déplacent au
   * doigt, à la souris ou au clavier (flèches, pas de 0,5) ; un bouton par
   * opération : z + w (parallélogramme), z − w, z̄ (miroir sur l'axe réel),
   * −z (symétrie de centre O), 1/z, z·w, × i (quart de tour). Le résultat
   * s'affiche comme POINT et en forme a + bi, avec le calcul algébrique
   * correspondant. Fenêtre FIXE [−6 ; 6]² : un résultat hors cadre est
   * signalé par une flèche au bord, jamais par un recadrage.
   * ================================================================ */

  var NS = "http://www.w3.org/2000/svg";
  var X_MIN = -6, X_MAX = 6, Y_MIN = -6, Y_MAX = 6;
  var LARGEUR = 360, HAUTEUR = 360, MARGE = 18;
  var BORNE_DRAG = 5; // z et w restent dans [−5 ; 5]²
  var PAS = 0.5;
  var DEFAUT = { z: { x: 2, y: 1 }, w: { x: -1, y: 2 }, op: "somme" };

  var OPERATIONS = [
    { id: "somme", label: "z + w" },
    { id: "difference", label: "z − w" },
    { id: "conjugue", label: "z̄" },
    { id: "oppose", label: "−z" },
    { id: "inverse", label: "1/z" },
    { id: "produit", label: "z · w" },
    { id: "foisI", label: "× i" },
  ];

  function arrondi(n, d) {
    var f = Math.pow(10, d);
    var r = Math.round(n * f) / f;
    return Object.is(r, -0) ? 0 : r;
  }
  function fmt(n, d) {
    if (d === undefined) d = 2;
    var r = arrondi(n, d);
    var s = String(r);
    if (s.indexOf("e") >= 0) s = r.toFixed(d);
    return s.replace(".", ",").replace("-", "−");
  }
  function estArrondi(n, d) {
    return Math.abs(n - arrondi(n, d)) > 1e-9;
  }
  /** Forme a + bi lisible : « 2 − i », « −3i », « 0 », « 1,5 + 0,5i ». */
  function complexe(x, y, d) {
    if (d === undefined) d = 2;
    var a = arrondi(x, d), b = arrondi(y, d);
    var partieB = function (v, avecSigne) {
      var abs = Math.abs(v);
      var coef = abs === 1 ? "" : fmt(abs, d);
      if (!avecSigne) return (v < 0 ? "−" : "") + coef + "i";
      return (v < 0 ? " − " : " + ") + coef + "i";
    };
    if (b === 0) return fmt(a, d);
    if (a === 0) return partieB(b, false);
    return fmt(a, d) + partieB(b, true);
  }
  function approx(x, y, d) {
    return (estArrondi(x, d) || estArrondi(y, d)) ? " ≈ " : " = ";
  }
  /** a + bi entre parenthèses quand il a deux termes ou un signe en tête. */
  function par(x, y) {
    var s = complexe(x, y);
    return (/[ ]/.test(s) || s.charAt(0) === "−") ? "(" + s + ")" : s;
  }
  function svgEl(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.ops{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;margin-bottom:12px;}' +
    '.ops button{flex:0 1 auto;min-width:64px;padding:8px 10px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink-soft,#6b6055);font-weight:700;cursor:pointer;font-size:0.92rem;font-family:inherit;}' +
    '.ops button.actif{background:var(--accent,#a8471f);border-color:var(--accent,#a8471f);color:#fff;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:10px;}' +
    'svg{width:100%;max-width:380px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);touch-action:none;user-select:none;-webkit-user-select:none;}' +
    '.grille{stroke:var(--line,#e2d8c8);stroke-width:0.7;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.graduation{font-size:9px;fill:var(--ink-faint,#9a8f84);font-family:var(--sans,sans-serif);}' +
    '.axe-nom{font-size:10px;font-weight:700;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.vec-z{stroke:var(--accent,#a8471f);stroke-width:2;}' +
    '.vec-w{stroke:var(--good,#2f7a4f);stroke-width:2;}' +
    '.vec-r{stroke:var(--plan,#6b4fa0);stroke-width:2.4;}' +
    '.aide{stroke:var(--ink-faint,#9a8f84);stroke-width:1.2;stroke-dasharray:4 3;fill:none;}' +
    '.aide-r{stroke:var(--plan,#6b4fa0);stroke-width:1.2;stroke-dasharray:4 3;fill:none;}' +
    '.pt-z{fill:var(--accent,#a8471f);cursor:grab;}' +
    '.pt-w{fill:var(--good,#2f7a4f);cursor:grab;}' +
    '.pt-r{fill:var(--plan,#6b4fa0);}' +
    '.halo{fill:transparent;cursor:grab;}' +
    '.pt-z:focus,.pt-w:focus,.halo:focus{outline:none;}' +
    '.focus-ring{fill:none;stroke:var(--ink,#2b2622);stroke-width:1.5;stroke-dasharray:2 2;}' +
    '.et{font-size:12px;font-weight:700;font-family:var(--serif,serif);font-style:italic;}' +
    '.et-z{fill:var(--accent-ink,#7a3212);}' +
    '.et-w{fill:var(--good,#2f7a4f);}' +
    '.et-r{fill:var(--plan,#6b4fa0);}' +
    '.hors{fill:var(--plan,#6b4fa0);}' +
    '.lecture{text-align:center;font-size:0.92rem;margin:0 0 10px;padding:10px 12px;border-radius:var(--radius,3px);color:var(--ink,#2b2622);background:var(--surface-2,#faf6f0);line-height:1.7;font-variant-numeric:tabular-nums;overflow-wrap:anywhere;}' +
    '.lecture .z{color:var(--accent-ink,#7a3212);font-weight:700;}' +
    '.lecture .w{color:var(--good,#2f7a4f);font-weight:700;}' +
    '.lecture .r{color:var(--plan,#6b4fa0);font-weight:700;}' +
    '.calcul{display:block;font-size:0.86rem;color:var(--ink-soft,#6b6055);}' +
    '.consigne{text-align:center;font-size:0.8rem;color:var(--ink-faint,#9a8f84);margin:0 0 10px;}' +
    '.btn-reset{display:block;margin:0 auto;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;}' +
    '</style>' +
    '<div class="ops" id="ops"></div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" role="img" aria-label="Plan complexe avec les points z, w et le résultat"></svg></div>' +
    '<p class="consigne">Fais glisser les points z et w (ou sélectionne-les avec Tab puis utilise les flèches).</p>' +
    '<p class="lecture" id="lecture"></p>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>';

  class OperationsPlanComplexeWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._z = { x: DEFAUT.z.x, y: DEFAUT.z.y };
      this._w = { x: DEFAUT.w.x, y: DEFAUT.w.y };
      this._op = DEFAUT.op;
      this._drag = null;
      this._focus = null;
      this._svg = shadow.getElementById("svg");
      this._ops = shadow.getElementById("ops");
      this._lecture = shadow.getElementById("lecture");
      this._reset = shadow.getElementById("reset");
      var self = this;
      OPERATIONS.forEach(function (o) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("data-op", o.id);
        b.textContent = o.label;
        self._ops.appendChild(b);
      });
    }

    connectedCallback() {
      var self = this;
      this._onOp = function (e) {
        var b = e.target.closest("button[data-op]");
        if (!b) return;
        self._op = b.getAttribute("data-op");
        self._rendre();
      };
      this._onDown = function (e) {
        var cible = e.target.getAttribute && e.target.getAttribute("data-pt");
        if (!cible) return;
        e.preventDefault();
        self._drag = cible;
        self._focus = cible;
        try { self._svg.setPointerCapture(e.pointerId); } catch { /* ignore */ }
        self._deplacer(e);
      };
      this._onMove = function (e) {
        if (!self._drag) return;
        e.preventDefault();
        self._deplacer(e);
      };
      this._onUp = function (e) {
        if (!self._drag) return;
        self._drag = null;
        try { self._svg.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
        self._rendre();
      };
      this._onKey = function (e) {
        var cible = e.target.getAttribute && e.target.getAttribute("data-pt");
        if (!cible) return;
        var d = { ArrowLeft: [-PAS, 0], ArrowRight: [PAS, 0], ArrowUp: [0, PAS], ArrowDown: [0, -PAS] }[e.key];
        if (!d) return;
        e.preventDefault();
        var p = cible === "z" ? self._z : self._w;
        p.x = Math.max(-BORNE_DRAG, Math.min(BORNE_DRAG, p.x + d[0]));
        p.y = Math.max(-BORNE_DRAG, Math.min(BORNE_DRAG, p.y + d[1]));
        self._focus = cible;
        self._rendre();
        var el = self._svg.querySelector('[data-pt="' + cible + '"]');
        if (el) el.focus();
      };
      this._onReset = function () {
        self._z = { x: DEFAUT.z.x, y: DEFAUT.z.y };
        self._w = { x: DEFAUT.w.x, y: DEFAUT.w.y };
        self._op = DEFAUT.op;
        self._rendre();
      };
      this._ops.addEventListener("click", this._onOp);
      this._svg.addEventListener("pointerdown", this._onDown);
      this._svg.addEventListener("pointermove", this._onMove);
      this._svg.addEventListener("pointerup", this._onUp);
      this._svg.addEventListener("pointercancel", this._onUp);
      this._svg.addEventListener("keydown", this._onKey);
      this._reset.addEventListener("click", this._onReset);
      this._rendre();
    }

    disconnectedCallback() {
      this._ops.removeEventListener("click", this._onOp);
      this._svg.removeEventListener("pointerdown", this._onDown);
      this._svg.removeEventListener("pointermove", this._onMove);
      this._svg.removeEventListener("pointerup", this._onUp);
      this._svg.removeEventListener("pointercancel", this._onUp);
      this._svg.removeEventListener("keydown", this._onKey);
      this._reset.removeEventListener("click", this._onReset);
    }

    _px(x, y) {
      return [
        MARGE + (x - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - 2 * MARGE),
        HAUTEUR - MARGE - (y - Y_MIN) / (Y_MAX - Y_MIN) * (HAUTEUR - 2 * MARGE),
      ];
    }

    _deplacer(e) {
      var ctm = this._svg.getScreenCTM();
      if (!ctm) return;
      var pt = this._svg.createSVGPoint();
      pt.x = e.clientX; pt.y = e.clientY;
      var loc = pt.matrixTransform(ctm.inverse());
      var x = X_MIN + (loc.x - MARGE) / (LARGEUR - 2 * MARGE) * (X_MAX - X_MIN);
      var y = Y_MIN + (HAUTEUR - MARGE - loc.y) / (HAUTEUR - 2 * MARGE) * (Y_MAX - Y_MIN);
      x = Math.max(-BORNE_DRAG, Math.min(BORNE_DRAG, Math.round(x / PAS) * PAS));
      y = Math.max(-BORNE_DRAG, Math.min(BORNE_DRAG, Math.round(y / PAS) * PAS));
      var p = this._drag === "z" ? this._z : this._w;
      if (p.x === x && p.y === y) return;
      p.x = x; p.y = y;
      this._rendre();
    }

    /** Résultat de l'opération courante : point, aides graphiques, texte. */
    _calculer() {
      var z = this._z, w = this._w, a = z.x, b = z.y, c = w.x, d = w.y;
      var Z = '<span class="z">z</span>', W = '<span class="w">w</span>';
      switch (this._op) {
        case "somme":
          return { r: { x: a + c, y: b + d }, nom: "z + w", utiliseW: true,
            calc: "parties réelles : " + fmt(a) + " + " + par(c, 0) + " = " + fmt(a + c) + " ; parties imaginaires : " + fmt(b) + " + " + par(d, 0) + " = " + fmt(b + d),
            note: Z + " + " + W + " est le 4e sommet du parallélogramme construit sur O, " + Z + " et " + W + "." };
        case "difference":
          return { r: { x: a - c, y: b - d }, nom: "z − w", utiliseW: true,
            calc: "parties réelles : " + fmt(a) + " − " + par(c, 0) + " = " + fmt(a - c) + " ; parties imaginaires : " + fmt(b) + " − " + par(d, 0) + " = " + fmt(b - d),
            note: "Le vecteur de " + W + " vers " + Z + " a pour affixe " + Z + " − " + W + " : sa longueur est la distance entre les deux points." };
        case "conjugue":
          return { r: { x: a, y: -b }, nom: "z̄", utiliseW: false,
            calc: "même partie réelle " + fmt(a) + ", partie imaginaire opposée : " + fmt(-b),
            note: "z̄ est le symétrique de " + Z + " par rapport à l'axe réel." };
        case "oppose":
          return { r: { x: -a, y: -b }, nom: "−z", utiliseW: false,
            calc: "les deux parties changent de signe : " + fmt(-a) + " et " + fmt(-b),
            note: "−z est le symétrique de " + Z + " par rapport à l'origine O." };
        case "inverse":
          if (a === 0 && b === 0) return { r: null, nom: "1/z", utiliseW: false, calc: "", note: "1/z n'existe pas pour z = 0 : déplace " + Z + "." };
          var m2 = a * a + b * b;
          return { r: { x: a / m2, y: -b / m2 }, nom: "1/z", utiliseW: false,
            calc: "1/z = z̄ / (z·z̄) = " + par(a, -b) + " / " + fmt(m2),
            note: "1/z a pour module 1/|z| et pour argument −arg(z) : même direction que z̄, plus près de O quand |z| > 1." };
        case "produit":
          return { r: { x: a * c - b * d, y: a * d + b * c }, nom: "z·w", utiliseW: true,
            calc: par(a, b) + " · " + par(c, d) + " = (" + fmt(a) + "·" + par(c, 0) + " − " + par(b, 0) + "·" + par(d, 0) + ") + (" + fmt(a) + "·" + par(d, 0) + " + " + par(b, 0) + "·" + par(c, 0) + ")i",
            note: "Les modules se multiplient, les arguments s'additionnent." };
        default:
          // i·(a + bi) = ai + bi² : termes écrits réduits (« i », « −i² », jamais « 1i² »).
          var tI = a === 0 ? "" : (a === 1 ? "i" : a === -1 ? "−i" : fmt(a) + "i");
          var tI2 = b === 0 ? "" : (Math.abs(b) === 1 ? "i²" : fmt(Math.abs(b)) + "i²");
          var dev = tI && tI2 ? tI + (b < 0 ? " − " : " + ") + tI2 : (tI || (tI2 ? (b < 0 ? "−" : "") + tI2 : "0"));
          return { r: { x: -b, y: a }, nom: "iz", utiliseW: false,
            calc: "i · " + par(a, b) + " = " + dev + " = " + complexe(-b, a) + "  (car i² = −1)",
            note: "Multiplier par i fait tourner " + Z + " d'un quart de tour (+90°) autour de O." };
      }
    }

    _rendre() {
      var self = this, svg = this._svg;
      var z = this._z, w = this._w;
      Array.prototype.forEach.call(this._ops.querySelectorAll("button"), function (b) {
        b.className = b.getAttribute("data-op") === self._op ? "actif" : "";
      });
      var res = this._calculer();
      svg.innerHTML = "";

      var defs = svgEl("defs", {});
      var m = svgEl("marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      m.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(m);
      var mr = svgEl("marker", { id: "fleche-r", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      mr.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "hors" }));
      defs.appendChild(mr);
      svg.appendChild(defs);

      // Quadrillage et axes (fenêtre fixe).
      for (var k = X_MIN + 1; k < X_MAX; k++) {
        if (k === 0) continue;
        var gx = self._px(k, 0)[0], gy = self._px(0, k)[1];
        svg.appendChild(svgEl("line", { x1: gx, x2: gx, y1: MARGE, y2: HAUTEUR - MARGE, class: "grille" }));
        svg.appendChild(svgEl("line", { x1: MARGE, x2: LARGEUR - MARGE, y1: gy, y2: gy, class: "grille" }));
        if (k % 2 === 0) {
          var o = self._px(0, 0);
          var tx = svgEl("text", { x: gx, y: o[1] + 12, "text-anchor": "middle", class: "graduation" });
          tx.textContent = fmt(k);
          svg.appendChild(tx);
          var ty = svgEl("text", { x: o[0] - 5, y: gy + 3, "text-anchor": "end", class: "graduation" });
          ty.textContent = fmt(k) + "i";
          svg.appendChild(ty);
        }
      }
      var O = self._px(0, 0);
      svg.appendChild(svgEl("line", { x1: MARGE, x2: LARGEUR - MARGE, y1: O[1], y2: O[1], class: "axe", "marker-end": "url(#fleche)" }));
      svg.appendChild(svgEl("line", { x1: O[0], x2: O[0], y1: HAUTEUR - MARGE, y2: MARGE, class: "axe", "marker-end": "url(#fleche)" }));
      var re = svgEl("text", { x: LARGEUR - MARGE - 2, y: O[1] - 6, "text-anchor": "end", class: "axe-nom" });
      re.textContent = "Re";
      svg.appendChild(re);
      var im = svgEl("text", { x: O[0] + 6, y: MARGE + 8, class: "axe-nom" });
      im.textContent = "Im";
      svg.appendChild(im);

      var dedans = function (p) { return p.x >= X_MIN && p.x <= X_MAX && p.y >= Y_MIN && p.y <= Y_MAX; };
      var ligne = function (p, q, cls) {
        var P = self._px(p.x, p.y), Q = self._px(q.x, q.y);
        svg.appendChild(svgEl("line", { x1: P[0].toFixed(2), y1: P[1].toFixed(2), x2: Q[0].toFixed(2), y2: Q[1].toFixed(2), class: cls }));
      };
      var r = res.r;

      // Aides de construction (sous les vecteurs).
      if (r && dedans(r)) {
        if (self._op === "somme") { ligne(z, r, "aide"); ligne(w, r, "aide"); }
        if (self._op === "difference") { ligne(w, z, "aide-r"); ligne({ x: -w.x, y: -w.y }, r, "aide"); ligne(z, r, "aide"); ligne({ x: 0, y: 0 }, { x: -w.x, y: -w.y }, "aide"); }
        if (self._op === "conjugue") ligne(z, r, "aide");
        if (self._op === "oppose") ligne(z, r, "aide");
        if (self._op === "foisI") {
          var rz = Math.hypot(z.x, z.y);
          if (rz > 0) {
            var R = rz / (X_MAX - X_MIN) * (LARGEUR - 2 * MARGE);
            var P0 = self._px(z.x, z.y), P1 = self._px(r.x, r.y);
            svg.appendChild(svgEl("path", { d: "M" + P0[0].toFixed(2) + "," + P0[1].toFixed(2) + " A" + R.toFixed(2) + "," + R.toFixed(2) + " 0 0 0 " + P1[0].toFixed(2) + "," + P1[1].toFixed(2), class: "aide-r", "marker-end": "url(#fleche-r)" }));
          }
        }
      }

      // Vecteurs depuis O.
      ligne({ x: 0, y: 0 }, z, "vec-z");
      if (res.utiliseW) ligne({ x: 0, y: 0 }, w, "vec-w");
      if (r && dedans(r)) ligne({ x: 0, y: 0 }, r, "vec-r");

      // Résultat hors cadre : flèche au bord dans sa direction.
      if (r && !dedans(r)) {
        var t = Math.min(
          r.x !== 0 ? (r.x > 0 ? X_MAX - 0.3 : X_MIN + 0.3) / r.x : Infinity,
          r.y !== 0 ? (r.y > 0 ? Y_MAX - 0.3 : Y_MIN + 0.3) / r.y : Infinity
        );
        var bord = { x: r.x * t, y: r.y * t };
        var B = self._px(bord.x, bord.y);
        svg.appendChild(svgEl("line", { x1: O[0], y1: O[1], x2: B[0].toFixed(2), y2: B[1].toFixed(2), class: "aide-r", "marker-end": "url(#fleche-r)" }));
      }

      // Étiquette poussée RADIALEMENT vers l'extérieur (jamais sur le vecteur), ancrée selon le côté.
      var etiquette = function (p, texte, cls) {
        var P = self._px(p.x, p.y);
        var n = Math.hypot(p.x, p.y), ux = n ? p.x / n : 0.7, uy = n ? p.y / n : 0.7;
        var x = P[0] + 13 * ux, y = P[1] - 13 * uy + 4;
        var ancre = ux > 0.35 ? "start" : (ux < -0.35 ? "end" : "middle");
        if (x > LARGEUR - 40) ancre = "end";
        if (x < 40) ancre = "start";
        y = Math.max(14, Math.min(HAUTEUR - 6, y));
        var el = svgEl("text", { x: x.toFixed(2), y: y.toFixed(2), "text-anchor": ancre, class: "et " + cls });
        el.textContent = texte;
        svg.appendChild(el);
      };

      if (r && dedans(r)) {
        var Pr = self._px(r.x, r.y);
        svg.appendChild(svgEl("circle", { cx: Pr[0].toFixed(2), cy: Pr[1].toFixed(2), r: 5.5, class: "pt-r" }));
        etiquette(r, res.nom, "et-r");
      }

      var poignee = function (p, id, cls, nom, cacher) {
        if (cacher) return;
        var P = self._px(p.x, p.y);
        if (self._focus === id) svg.appendChild(svgEl("circle", { cx: P[0].toFixed(2), cy: P[1].toFixed(2), r: 10, class: "focus-ring" }));
        svg.appendChild(svgEl("circle", { cx: P[0].toFixed(2), cy: P[1].toFixed(2), r: 6.5, class: cls }));
        // Halo invisible, plus large, pour attraper le point au doigt.
        var h = svgEl("circle", { cx: P[0].toFixed(2), cy: P[1].toFixed(2), r: 16, class: "halo", "data-pt": id, tabindex: "0", role: "slider", "aria-label": "point " + nom + " = " + complexe(p.x, p.y) });
        svg.appendChild(h);
        etiquette(p, nom, id === "z" ? "et-z" : "et-w");
      };
      poignee(w, "w", "pt-w", "w", !res.utiliseW);
      poignee(z, "z", "pt-z", "z", false);

      // Lecture.
      var html = '<span class="z">z = ' + complexe(z.x, z.y) + "</span>";
      if (res.utiliseW) html += ' ; <span class="w">w = ' + complexe(w.x, w.y) + "</span>";
      html += "<br>";
      if (r) {
        html += '<span class="r">' + res.nom + approx(r.x, r.y, 2) + complexe(r.x, r.y) + "</span>";
        if (!dedans(r)) html += " (hors du cadre : la flèche indique sa direction)";
        html += '<span class="calcul">' + res.calc + "</span>";
      }
      html += '<span class="calcul">' + res.note + "</span>";
      this._lecture.innerHTML = html;
    }
  }

  if (!customElements.get("operations-plan-complexe-widget")) {
    customElements.define("operations-plan-complexe-widget", OperationsPlanComplexeWidget);
  }
})();
