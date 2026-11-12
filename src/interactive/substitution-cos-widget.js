(function () {
  "use strict";

  /* ================================================================
   * <substitution-cos-widget> — atelier « t = cos x : garder ou rejeter »
   * (5e, chapitre 2, section 7). L'équation a·t² + b·t + c = 0 avec
   * t = cos x (ou t = sin x) : à gauche la parabole en t avec la bande
   * [−1 ; 1] en vert, les racines hors de la bande barrées ; à droite le
   * cercle trigonométrique où chaque racine gardée est projetée (droite
   * verticale x = t pour cos, horizontale y = t pour sin) → les solutions
   * en x dans [0 ; 2π[ sont listées. Fenêtres FIXES. Web Component.
   * ================================================================ */

  var PI = Math.PI;
  var NS = "http://www.w3.org/2000/svg";
  var L = 560, H = 280;
  // Panneau parabole.
  var P = { x0: 34, x1: 290, y0: 16, y1: 252, tMin: -3, tMax: 3, yMin: -6, yMax: 6 };
  // Panneau cercle.
  var C = { cx: 430, cy: 134, r: 92 };

  var PRESETS = [
    { id: "ex", label: "2t² + t − 3 = 0 (exemple du chapitre, t = cos x)", a: 2, b: 1, c: -3, fn: "cos" },
    { id: "deux", label: "2t² − 3t + 1 = 0 (t = sin x)", a: 2, b: -3, c: 1, fn: "sin" },
    { id: "facteur", label: "t² − ½t = 0 (t = cos x)", a: 1, b: -0.5, c: 0, fn: "cos" },
    { id: "double", label: "4t² − 4t + 1 = 0 (racine double, t = cos x)", a: 4, b: -4, c: 1, fn: "cos" },
    { id: "aucune", label: "t² − 4 = 0 (tout est rejeté, t = sin x)", a: 1, b: 0, c: -4, fn: "sin" },
  ];

  function fr(n, d) {
    var f = Math.pow(10, d);
    var v = Math.round(n * f) / f;
    if (Object.is(v, -0)) v = 0;
    var s = v.toFixed(d);
    if (d > 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
    return s.replace(".", ",").replace("-", "−");
  }
  function pgcd(a, b) { return b ? pgcd(b, a % b) : a; }
  function el(tag, attrs, texte) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (texte !== undefined) e.textContent = texte;
    return e;
  }

  /** Valeur exacte lisible pour t : fraction simple ou ±√2/2, ±√3/2 ; sinon décimal. */
  function tTexte(t) {
    var rac = [[Math.SQRT2 / 2, "√2/2"], [Math.sqrt(3) / 2, "√3/2"]];
    for (var i = 0; i < rac.length; i++) if (Math.abs(Math.abs(t) - rac[i][0]) < 1e-9) return (t < 0 ? "−" : "") + rac[i][1];
    for (var den = 1; den <= 12; den++) {
      var num = Math.round(t * den);
      if (Math.abs(t * den - num) < 1e-9) {
        var g = pgcd(Math.abs(num), den) || 1; num /= g; var d2 = den / g;
        return (num < 0 ? "−" : "") + (d2 === 1 ? String(Math.abs(num)) : Math.abs(num) + "/" + d2);
      }
    }
    return fr(t, 3);
  }

  /** x dans [0 ; 2π[ en multiple de π (dénominateur ≤ 6) si possible, sinon décimal en rad. */
  function xTexte(x) {
    var q = x / PI;
    for (var den = 1; den <= 6; den++) {
      var num = Math.round(q * den);
      if (Math.abs(q * den - num) < 1e-7) {
        if (num === 0) return "0";
        var g = pgcd(num, den); num /= g; var d2 = den / g;
        var corps = (num === 1 ? "" : String(num)) + "π";
        return d2 === 1 ? corps : corps + "/" + d2;
      }
    }
    return fr(x, 3) + " rad";
  }

  function coefTexte(v, lettre, premier) {
    if (v === 0) return "";
    var signe = v < 0 ? " − " : (premier ? "" : " + ");
    if (premier && v < 0) signe = "−";
    var abs = Math.abs(v);
    var nb = abs === 0.5 ? "½" : fr(abs, 1);
    if (lettre && abs === 1) nb = "";
    return signe + nb + lettre;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}' +
    '*{box-sizing:border-box;}' +
    '.equation{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.1rem;font-weight:600;margin:0 0 10px;}' +
    '.figure{display:flex;justify-content:center;margin-bottom:10px;}' +
    'svg{width:100%;max-width:680px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.2;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.bande{fill:var(--good,#2f7a4f);opacity:0.14;}' +
    '.bord-bande{stroke:var(--good,#2f7a4f);stroke-width:1;stroke-dasharray:4 3;}' +
    '.parabole{stroke:var(--accent,#a8471f);stroke-width:2.3;fill:none;}' +
    '.garde{fill:var(--good,#2f7a4f);}' +
    '.rejet{stroke:var(--bad,#b23a3a);stroke-width:2.6;stroke-linecap:round;}' +
    '.rejet-pt{fill:none;stroke:var(--bad,#b23a3a);stroke-width:1.6;}' +
    '.grad{paint-order:stroke;stroke:var(--surface-2,#faf6f0);stroke-width:4px;stroke-linejoin:round;font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.titre{paint-order:stroke;stroke:var(--surface-2,#faf6f0);stroke-width:4px;stroke-linejoin:round;font-size:12.5px;font-weight:700;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.lab-garde{paint-order:stroke;stroke:var(--surface-2,#faf6f0);stroke-width:4px;stroke-linejoin:round;font-size:12.5px;font-weight:700;fill:var(--good,#2f7a4f);font-family:var(--sans,sans-serif);}' +
    '.lab-rejet{paint-order:stroke;stroke:var(--surface-2,#faf6f0);stroke-width:4px;stroke-linejoin:round;font-size:12.5px;font-weight:700;fill:var(--bad,#b23a3a);font-family:var(--sans,sans-serif);}' +
    '.cercle{stroke:var(--ink-faint,#9c9083);stroke-width:1.4;fill:none;}' +
    '.projection{stroke:var(--good,#2f7a4f);stroke-width:1.5;stroke-dasharray:5 3;}' +
    '.sol{fill:var(--accent,#a8471f);}' +
    '.lab-sol{paint-order:stroke;stroke:var(--surface-2,#faf6f0);stroke-width:4px;stroke-linejoin:round;font-size:12.5px;font-weight:700;fill:var(--accent-ink,#7a3212);font-family:var(--sans,sans-serif);}' +
    '.resultat{margin:0 0 12px;padding:9px 12px;border-radius:var(--radius,3px);background:var(--surface-2,#faf6f0);font-size:0.92rem;line-height:1.6;}' +
    '.resultat strong{color:var(--accent-ink,#7a3212);}' +
    '.reglages{display:flex;flex-direction:column;gap:10px;}' +
    '.ligne{display:flex;gap:10px;flex-wrap:wrap;align-items:center;}' +
    'select{font-family:inherit;font-size:0.9rem;color:var(--ink,#241f1a);background:var(--surface,#fff);border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:5px 8px;max-width:100%;}' +
    '.curseurs{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px 16px;}' +
    '.curseur{display:flex;flex-direction:column;gap:3px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:8px;}' +
    '.curseur-row input{flex:1 1 auto;min-width:0;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:34px;text-align:right;}' +
    '</style>' +
    '<p class="equation" id="equation"></p>' +
    '<div class="figure"><svg id="svg" viewBox="0 0 ' + L + ' ' + H + '" role="img" aria-label="Parabole en t et cercle trigonométrique"></svg></div>' +
    '<div class="resultat" id="resultat"></div>' +
    '<div class="reglages">' +
    '<div class="ligne"><select id="preset" aria-label="Équation de départ"></select>' +
    '<select id="fn" aria-label="Substitution"><option value="cos">t = cos x</option><option value="sin">t = sin x</option></select></div>' +
    '<div class="curseurs">' +
    '<div class="curseur"><label for="a">a</label><div class="curseur-row"><input type="range" id="a" min="-4" max="4" step="0.5"><span class="curseur-valeur" id="a-v"></span></div></div>' +
    '<div class="curseur"><label for="b">b</label><div class="curseur-row"><input type="range" id="b" min="-4" max="4" step="0.5"><span class="curseur-valeur" id="b-v"></span></div></div>' +
    '<div class="curseur"><label for="c">c</label><div class="curseur-row"><input type="range" id="c" min="-4" max="4" step="0.5"><span class="curseur-valeur" id="c-v"></span></div></div>' +
    '</div></div>';

  class SubstitutionCosWidget extends HTMLElement {
    constructor() {
      super();
      var sr = this.attachShadow({ mode: "open" });
      sr.appendChild(TEMPLATE.content.cloneNode(true));
      this._svg = sr.getElementById("svg");
      this._preset = sr.getElementById("preset");
      this._fnSel = sr.getElementById("fn");
      this._in = { a: sr.getElementById("a"), b: sr.getElementById("b"), c: sr.getElementById("c") };
      var self = this;
      PRESETS.forEach(function (p) {
        var o = document.createElement("option");
        o.value = p.id; o.textContent = p.label;
        self._preset.appendChild(o);
      });
      var perso = document.createElement("option");
      perso.value = "perso"; perso.textContent = "Réglage libre (curseurs)";
      this._preset.appendChild(perso);
      this._appliquerPreset(PRESETS[0]);
    }

    _appliquerPreset(p) {
      this._a = p.a; this._b = p.b; this._c = p.c; this._fn = p.fn;
      this._in.a.value = String(p.a); this._in.b.value = String(p.b); this._in.c.value = String(p.c);
      this._fnSel.value = p.fn; this._preset.value = p.id;
    }

    connectedCallback() {
      var self = this;
      this._onPreset = function () {
        var p = PRESETS.filter(function (x) { return x.id === self._preset.value; })[0];
        if (p) self._appliquerPreset(p);
        self._rendre();
      };
      this._onFn = function () { self._fn = self._fnSel.value; self._rendre(); };
      this._onCurseur = function (e) {
        var cle = e.currentTarget.id;
        var v = parseFloat(e.currentTarget.value);
        if (cle === "a" && v === 0) { v = self._a > 0 ? -0.5 : 0.5; e.currentTarget.value = String(v); } // a ≠ 0
        self["_" + cle] = v;
        self._preset.value = "perso";
        self._rendre();
      };
      this._preset.addEventListener("change", this._onPreset);
      this._fnSel.addEventListener("change", this._onFn);
      Object.keys(this._in).forEach(function (k) { self._in[k].addEventListener("input", self._onCurseur); });
      this._rendre();
    }

    disconnectedCallback() {
      var self = this;
      this._preset.removeEventListener("change", this._onPreset);
      this._fnSel.removeEventListener("change", this._onFn);
      Object.keys(this._in).forEach(function (k) { self._in[k].removeEventListener("input", self._onCurseur); });
    }

    _racines() {
      var a = this._a, b = this._b, c = this._c;
      var delta = b * b - 4 * a * c;
      if (delta < -1e-12) return { delta: delta, t: [] };
      if (Math.abs(delta) <= 1e-12) return { delta: 0, t: [-b / (2 * a)] };
      var s = Math.sqrt(delta);
      var t1 = (-b - s) / (2 * a), t2 = (-b + s) / (2 * a);
      return { delta: delta, t: t1 < t2 ? [t1, t2] : [t2, t1] };
    }

    _solutionsX(t) {
      var xs = [];
      function ajoute(x) {
        var v = ((x % (2 * PI)) + 2 * PI) % (2 * PI);
        if (Math.abs(v - 2 * PI) < 1e-9) v = 0;
        for (var i = 0; i < xs.length; i++) if (Math.abs(xs[i] - v) < 1e-9) return;
        xs.push(v);
      }
      if (this._fn === "cos") { var a = Math.acos(t); ajoute(a); ajoute(2 * PI - a); }
      else { var s = Math.asin(t); ajoute(s); ajoute(PI - s); }
      return xs.sort(function (u, v) { return u - v; });
    }

    _rendre() {
      var sr = this.shadowRoot, svg = this._svg;
      var a = this._a, b = this._b, c = this._c, fn = this._fn;
      sr.getElementById("a-v").textContent = fr(a, 1);
      sr.getElementById("b-v").textContent = fr(b, 1);
      sr.getElementById("c-v").textContent = fr(c, 1);
      var eq = coefTexte(a, "t²", true) + coefTexte(b, "t", false) + coefTexte(c, "", false);
      sr.getElementById("equation").textContent = eq + " = 0   avec t = " + fn + " x";

      var rac = this._racines();
      var gardees = rac.t.filter(function (t) { return t >= -1 - 1e-9 && t <= 1 + 1e-9; }).map(function (t) { return Math.max(-1, Math.min(1, t)); });
      var rejetees = rac.t.filter(function (t) { return t < -1 - 1e-9 || t > 1 + 1e-9; });

      svg.innerHTML = "";
      var defs = el("defs", {});
      var m = el("marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      m.appendChild(el("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(m);
      var clip = el("clipPath", { id: "cadre-p" });
      clip.appendChild(el("rect", { x: P.x0, y: P.y0, width: P.x1 - P.x0, height: P.y1 - P.y0 }));
      defs.appendChild(clip);
      svg.appendChild(defs);

      function px(t) { return P.x0 + (t - P.tMin) / (P.tMax - P.tMin) * (P.x1 - P.x0); }
      function py(y) { return P.y0 + (P.yMax - y) / (P.yMax - P.yMin) * (P.y1 - P.y0); }

      // --- Panneau parabole ---
      svg.appendChild(el("rect", { x: px(-1), y: P.y0, width: px(1) - px(-1), height: P.y1 - P.y0, class: "bande" }));
      svg.appendChild(el("line", { x1: px(-1), y1: P.y0, x2: px(-1), y2: P.y1, class: "bord-bande" }));
      svg.appendChild(el("line", { x1: px(1), y1: P.y0, x2: px(1), y2: P.y1, class: "bord-bande" }));
      svg.appendChild(el("line", { x1: P.x0, y1: py(0), x2: P.x1 + 10, y2: py(0), class: "axe", "marker-end": "url(#fleche)" }));
      svg.appendChild(el("line", { x1: px(0), y1: P.y1, x2: px(0), y2: P.y0 - 6, class: "axe", "marker-end": "url(#fleche)" }));
      svg.appendChild(el("text", { x: P.x1 + 4, y: py(0) - 7, "text-anchor": "end", class: "titre" }, "t"));
      [-3, -2, -1, 1, 2, 3].forEach(function (g) {
        svg.appendChild(el("text", { x: px(g), y: py(0) + 15, "text-anchor": "middle", class: "grad" }, fr(g, 0)));
      });
      svg.appendChild(el("text", { x: (px(-1) + px(1)) / 2, y: P.y0 + 13, "text-anchor": "middle", class: "lab-garde" }, "[−1 ; 1]"));
      var d = "";
      for (var i = 0; i <= 240; i++) {
        var t = P.tMin + (P.tMax - P.tMin) * i / 240;
        var y = Math.max(P.yMin - 1, Math.min(P.yMax + 1, a * t * t + b * t + c));
        d += (i ? "L" : "M") + px(t).toFixed(2) + "," + py(y).toFixed(2);
      }
      var gp = el("g", { "clip-path": "url(#cadre-p)" });
      gp.appendChild(el("path", { d: d, class: "parabole" }));
      svg.appendChild(gp);
      var y0 = py(0);
      gardees.forEach(function (t, k) {
        svg.appendChild(el("circle", { cx: px(t), cy: y0, r: 5.5, class: "garde" }));
        svg.appendChild(el("text", { x: px(t), y: y0 - (k % 2 ? 30 : 13), "text-anchor": "middle", class: "lab-garde" }, "t = " + tTexte(t)));
      });
      rejetees.forEach(function (t, k) {
        var visible = t >= P.tMin && t <= P.tMax;
        var xx = visible ? px(t) : (t < 0 ? P.x0 + 8 : P.x1 - 8);
        svg.appendChild(el("circle", { cx: xx, cy: y0, r: 6, class: "rejet-pt" }));
        svg.appendChild(el("line", { x1: xx - 7, y1: y0 - 7, x2: xx + 7, y2: y0 + 7, class: "rejet" }));
        svg.appendChild(el("line", { x1: xx - 7, y1: y0 + 7, x2: xx + 7, y2: y0 - 7, class: "rejet" }));
        var ancre = xx < P.x0 + 40 ? "start" : xx > P.x1 - 40 ? "end" : "middle";
        svg.appendChild(el("text", { x: xx, y: y0 + (k % 2 ? 44 : 30), "text-anchor": ancre, class: "lab-rejet" }, "t = " + tTexte(t) + (visible ? "" : " (hors cadre)")));
      });

      // --- Panneau cercle ---
      svg.appendChild(el("text", { x: C.cx, y: 13, "text-anchor": "middle", class: "titre" }, fn === "cos" ? "cos x = t : droite verticale" : "sin x = t : droite horizontale"));
      svg.appendChild(el("line", { x1: C.cx - C.r - 22, y1: C.cy, x2: C.cx + C.r + 26, y2: C.cy, class: "axe", "marker-end": "url(#fleche)" }));
      svg.appendChild(el("line", { x1: C.cx, y1: C.cy + C.r + 22, x2: C.cx, y2: C.cy - C.r - 16, class: "axe", "marker-end": "url(#fleche)" }));
      svg.appendChild(el("text", { x: C.cx + C.r + 28, y: C.cy + 18, "text-anchor": "end", class: "grad" }, "cos"));
      svg.appendChild(el("text", { x: C.cx - 7, y: C.cy - C.r - 8, "text-anchor": "end", class: "grad" }, "sin"));
      svg.appendChild(el("circle", { cx: C.cx, cy: C.cy, r: C.r, class: "cercle" }));
      var self = this, toutes = [];
      gardees.forEach(function (t) {
        if (fn === "cos") {
          var xl = C.cx + t * C.r;
          svg.appendChild(el("line", { x1: xl, y1: C.cy - C.r - 12, x2: xl, y2: C.cy + C.r + 12, class: "projection" }));
        } else {
          var yl = C.cy - t * C.r;
          svg.appendChild(el("line", { x1: C.cx - C.r - 12, y1: yl, x2: C.cx + C.r + 12, y2: yl, class: "projection" }));
        }
        self._solutionsX(t).forEach(function (x) { toutes.push(x); });
      });
      // dédoublonner (deux racines ne donnent jamais le même x, mais par sécurité)
      toutes = toutes.filter(function (x, i) { return toutes.findIndex(function (y) { return Math.abs(y - x) < 1e-9; }) === i; }).sort(function (u, v) { return u - v; });
      toutes.forEach(function (x) {
        var qx = C.cx + C.r * Math.cos(x), qy = C.cy - C.r * Math.sin(x);
        svg.appendChild(el("circle", { cx: qx, cy: qy, r: 5, class: "sol" }));
        var lx = C.cx + (C.r + 16) * Math.cos(x), ly = C.cy - (C.r + 16) * Math.sin(x);
        var ancre = Math.cos(x) > 0.3 ? "start" : Math.cos(x) < -0.3 ? "end" : "middle";
        lx = Math.max(C.cx - C.r - 50, Math.min(L - 6, lx));
        var ly2 = Math.abs(Math.sin(x)) < 0.2 ? ly - 9 : ly + 4;
        if (ancre === "middle") { lx = qx + 9; ancre = "start"; ly2 = Math.sin(x) > 0 ? qy - 7 : qy + 17; } // près de l'axe vertical : à droite du point
        svg.appendChild(el("text", { x: lx, y: ly2, "text-anchor": ancre, class: "lab-sol" }, xTexte(x)));
      });

      // --- Texte du résultat ---
      var lignes = [];
      var deltaTxt = "Δ = " + fr(b, 1).replace(/^−/, "(−") + (b < 0 ? ")" : "") + "² − 4·" + fr(a, 1) + "·" + (c < 0 ? "(" + fr(c, 1) + ")" : fr(c, 1)) + " = " + fr(rac.delta, 2);
      lignes.push(deltaTxt + (rac.t.length === 0 ? " < 0 : aucune racine en t, donc aucune solution." : ""));
      if (rac.t.length) {
        lignes.push("Racines en t : " + rac.t.map(function (t) {
          var ok = t >= -1 - 1e-9 && t <= 1 + 1e-9;
          return "t = " + tTexte(t) + (ok ? " (gardée)" : " (rejetée : hors de [−1 ; 1])");
        }).join(" ; ") + ".");
        if (!gardees.length) lignes.push("Toutes les racines sont rejetées : l'équation n'a <strong>aucune solution</strong>.");
        gardees.forEach(function (t) {
          var xs = self._solutionsX(t).map(xTexte);
          lignes.push(fn + " x = " + tTexte(t) + " → x = " + xs.join(" ou x = ") + " dans [0 ; 2π[.");
        });
        if (toutes.length) lignes.push("<strong>S = { " + toutes.map(xTexte).join(" ; ") + " }</strong> (" + toutes.length + " solution" + (toutes.length > 1 ? "s" : "") + ")");
      }
      sr.getElementById("resultat").innerHTML = lignes.map(function (l) { return "<div>" + l + "</div>"; }).join("");
    }
  }

  if (!customElements.get("substitution-cos-widget")) customElements.define("substitution-cos-widget", SubstitutionCosWidget);
})();
