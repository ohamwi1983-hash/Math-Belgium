(function () {
  "use strict";

  /* ================================================================
   * <bidon-optimal-widget> — atelier « Le bidon optimal » (5e, chapitre 1,
   * section 5). Contenance V fixée (1000 ou 2500 cm³), curseur r : le cylindre
   * dessiné s'élargit et s'aplatit, h(r) = V/(πr²) s'affiche, et le point mobile
   * parcourt la courbe de l'aire totale A(r) = 2πr² + 2V/r — composition de
   * l'aire (fonction de r et h) avec h(r). Minimum marqué en r* = ∛(V/(2π)),
   * où h = 2r. Fenêtres FIXES par contenance (jamais recalculées depuis r).
   * ================================================================ */

  var CONFIGS = {
    1000: { rMin: 2.5, rMax: 12, yMax: 1200, pas: 200, echelle: 3 },
    2500: { rMin: 3.5, rMax: 15, yMax: 1900, pas: 300, echelle: 2.6 },
  };

  var GL = 440, GH = 280, MG = 46, MD = 16, MH = 18, MB = 30;
  var CL = 200, CH = 280;

  function nombreFr(n, d) {
    var s = n.toFixed(d);
    if (d > 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
    return s.replace(".", ",").replace("-", "−");
  }

  function svgEl(ns, tag, attrs) {
    var el = document.createElementNS(ns, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  function hauteur(V, r) { return V / (Math.PI * r * r); }
  function aire(V, r) { return 2 * Math.PI * r * r + 2 * V / r; }
  function rOptimal(V) { return Math.cbrt(V / (2 * Math.PI)); }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    "<style>" +
    ":host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}" +
    "*{box-sizing:border-box;}" +
    "[hidden]{display:none!important;}" +
    ".haut{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-items:center;margin-bottom:10px;}" +
    "select,button{font-family:inherit;font-size:0.9rem;font-weight:600;color:var(--ink,#241f1a);background:var(--surface,#fff);border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:6px 10px;cursor:pointer;min-height:34px;max-width:100%;}" +
    "button:hover{border-color:var(--accent,#a8471f);}" +
    ".formules{text-align:center;font-family:var(--serif,serif);font-size:1rem;margin:0 0 10px;overflow-wrap:anywhere;}" +
    ".figures{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-bottom:12px;}" +
    ".figures svg{height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}" +
    "#svg-cyl{width:100%;max-width:200px;flex:1 1 150px;}" +
    "#svg-graphe{width:100%;max-width:440px;flex:3 1 280px;}" +
    ".grille{stroke:var(--line-soft,#ece4d6);stroke-width:1;}" +
    ".axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}" +
    ".fleche{fill:var(--ink-soft,#6b6055);}" +
    ".grad{font-size:10.5px;font-family:var(--mono,monospace);fill:var(--ink-soft,#6b6055);}" +
    ".titre-axe{font-size:11px;font-style:italic;font-family:var(--serif,serif);fill:var(--ink-soft,#6b6055);}" +
    ".courbe{stroke:var(--plan,#5b4ea3);stroke-width:2.6;fill:none;}" +
    ".guide{stroke:var(--accent,#a8471f);stroke-width:1.2;stroke-dasharray:4 3;}" +
    ".point{fill:var(--accent,#a8471f);}" +
    ".point-min{fill:var(--surface,#fff);stroke:var(--good,#2f7a4f);stroke-width:2.4;}" +
    ".etiquette{font-size:11px;font-family:var(--mono,monospace);font-weight:600;}" +
    ".et-point{fill:var(--accent-ink,#7a3212);}" +
    ".et-min{fill:var(--good,#2f7a4f);}" +
    ".cyl-face{fill:var(--sky-soft,#dcecf5);stroke:var(--sky,#2f7fa8);stroke-width:1.6;}" +
    ".cyl-haut{fill:var(--surface,#fff);stroke:var(--sky,#2f7fa8);stroke-width:1.6;}" +
    ".cyl-cache{fill:none;stroke:var(--sky,#2f7fa8);stroke-width:1.2;stroke-dasharray:4 3;}" +
    ".cote{stroke:var(--ink-soft,#6b6055);stroke-width:1.1;}" +
    ".cote-txt{font-size:12px;font-family:var(--serif,serif);font-style:italic;fill:var(--ink,#241f1a);}" +
    ".stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px;margin-bottom:12px;}" +
    ".stat{background:var(--surface,#fff);border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:8px 10px;text-align:center;}" +
    ".stat-label{display:block;font-size:0.78rem;color:var(--ink-soft,#6b6055);}" +
    ".stat-valeur{display:block;font-weight:700;font-variant-numeric:tabular-nums;font-size:clamp(0.85rem,3.6vw,1rem);}" +
    ".message{text-align:center;font-size:0.92rem;font-weight:600;padding:8px 12px;border-radius:var(--radius,3px);margin:0 0 12px;background:var(--surface-2,#faf6f0);color:var(--ink-soft,#6b6055);}" +
    ".message.min{background:var(--good-soft,#e2f0e7);color:var(--good,#2f7a4f);}" +
    ".curseur{display:flex;align-items:center;gap:10px;}" +
    ".curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}" +
    ".curseur input{flex:1 1 auto;accent-color:var(--accent,#a8471f);min-width:0;}" +
    ".curseur span{min-width:64px;text-align:right;font-variant-numeric:tabular-nums;font-weight:600;}" +
    "</style>" +
    '<div class="haut"><label for="volume">Contenance</label><select id="volume"><option value="1000">V = 1000 cm³</option><option value="2500">V = 2500 cm³</option></select><button id="aller-min">Aller au minimum</button></div>' +
    '<p class="formules" id="formules"></p>' +
    '<div class="figures">' +
    '<svg id="svg-cyl" viewBox="0 0 ' + CL + " " + CH + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Le bidon cylindrique"></svg>' +
    '<svg id="svg-graphe" viewBox="0 0 ' + GL + " " + GH + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Aire totale du bidon en fonction du rayon"></svg>' +
    "</div>" +
    '<div class="stats">' +
    '<div class="stat"><span class="stat-label">rayon r</span><span class="stat-valeur" id="v-r"></span></div>' +
    '<div class="stat"><span class="stat-label">hauteur h(r)</span><span class="stat-valeur" id="v-h"></span></div>' +
    '<div class="stat"><span class="stat-label">diamètre 2r</span><span class="stat-valeur" id="v-d"></span></div>' +
    '<div class="stat"><span class="stat-label">aire totale A(r)</span><span class="stat-valeur" id="v-a"></span></div>' +
    "</div>" +
    '<p class="message" id="message"></p>' +
    '<div class="curseur"><label for="r">r</label><input type="range" id="r" step="0.01"><span id="r-valeur"></span></div>';

  class BidonOptimalWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._s = shadow;
      this._V = 1000;
      this._r = 3;
    }

    connectedCallback() {
      if (this._pret) return;
      this._pret = true;
      var self = this, s = this._s;
      this._input = s.getElementById("r");
      s.getElementById("volume").addEventListener("change", function (e) {
        self._V = parseInt(e.target.value, 10);
        self._r = self._V === 1000 ? 3 : 4.5;
        self._configurerCurseur();
        self._rendre();
      });
      s.getElementById("aller-min").addEventListener("click", function () {
        self._r = rOptimal(self._V);
        self._input.value = String(self._r);
        self._rendre();
      });
      this._input.addEventListener("input", function () {
        var r = parseFloat(self._input.value), rs = rOptimal(self._V);
        // Aimant autour du minimum : le pas de 0,01 ne tombe jamais pile sur r*.
        if (Math.abs(r - rs) < 0.06) r = rs;
        self._r = r;
        self._rendre();
      });
      this._configurerCurseur();
      this._rendre();
    }

    _configurerCurseur() {
      var c = CONFIGS[this._V];
      this._input.min = String(c.rMin);
      this._input.max = String(c.rMax);
      this._input.value = String(this._r);
    }

    _rendre() {
      var V = this._V, r = this._r, s = this._s;
      var h = hauteur(V, r), A = aire(V, r), rs = rOptimal(V);
      var auMin = Math.abs(r - rs) < 1e-9;
      s.getElementById("formules").textContent =
        "h(r) = " + V + "/(πr²)   et   A(r) = 2πr² + 2πr·h(r) = 2πr² + " + 2 * V + "/r";
      s.getElementById("r-valeur").textContent = nombreFr(r, 2) + " cm";
      s.getElementById("v-r").textContent = nombreFr(r, 2) + " cm";
      s.getElementById("v-h").textContent = nombreFr(h, 2) + " cm";
      s.getElementById("v-d").textContent = nombreFr(2 * r, 2) + " cm";
      s.getElementById("v-a").textContent = nombreFr(A, 1) + " cm²";
      var msg = s.getElementById("message");
      if (auMin) {
        msg.className = "message min";
        msg.textContent = "Minimum : r = ∛(V/(2π)) ≈ " + nombreFr(rs, 2) + " cm et h ≈ " + nombreFr(hauteur(V, rs), 2) +
          " cm = 2r — au bidon le plus économe, la hauteur égale le diamètre.";
      } else {
        msg.className = "message";
        msg.textContent = (r < rs ? "Bidon étroit et haut : " : "Bidon large et bas : ") +
          "l'aire vaut " + nombreFr(A - aire(V, rs), 1) + " cm² de plus qu'au minimum (r ≈ " + nombreFr(rs, 2) + " cm).";
      }
      this._dessinerCylindre(r, h);
      this._dessinerGraphe();
    }

    _dessinerCylindre(r, h) {
      var ns = "http://www.w3.org/2000/svg", svg = this._s.getElementById("svg-cyl");
      svg.innerHTML = "";
      var e = CONFIGS[this._V].echelle;
      var rx = r * e, ry = rx * 0.28, hp = h * e;
      var cx = CL / 2 + 8, bas = CH - 24, haut = bas - hp;
      // Face latérale + fond (arrière en pointillé), puis disque du haut.
      svg.appendChild(svgEl(ns, "path", {
        d: "M" + (cx - rx) + " " + haut + " L" + (cx - rx) + " " + bas + " A" + rx + " " + ry + " 0 0 0 " + (cx + rx) + " " + bas +
          " L" + (cx + rx) + " " + haut + " Z",
        class: "cyl-face",
      }));
      svg.appendChild(svgEl(ns, "path", { d: "M" + (cx - rx) + " " + bas + " A" + rx + " " + ry + " 0 0 1 " + (cx + rx) + " " + bas, class: "cyl-cache" }));
      svg.appendChild(svgEl(ns, "ellipse", { cx: cx, cy: haut, rx: rx, ry: ry, class: "cyl-haut" }));
      // Cote du rayon (sur le disque du haut) et de la hauteur (à gauche).
      svg.appendChild(svgEl(ns, "line", { x1: cx, y1: haut, x2: cx + rx, y2: haut, class: "cote" }));
      var tr = svgEl(ns, "text", { x: cx + rx / 2, y: haut - ry - 5, "text-anchor": "middle", class: "cote-txt" });
      tr.textContent = "r";
      svg.appendChild(tr);
      var xh = cx - rx - 12;
      svg.appendChild(svgEl(ns, "line", { x1: xh, y1: haut, x2: xh, y2: bas, class: "cote" }));
      svg.appendChild(svgEl(ns, "line", { x1: xh - 4, y1: haut, x2: xh + 4, y2: haut, class: "cote" }));
      svg.appendChild(svgEl(ns, "line", { x1: xh - 4, y1: bas, x2: xh + 4, y2: bas, class: "cote" }));
      var th = svgEl(ns, "text", { x: xh - 6, y: (haut + bas) / 2 + 4, "text-anchor": "end", class: "cote-txt" });
      th.textContent = "h";
      svg.appendChild(th);
    }

    _dessinerGraphe() {
      var ns = "http://www.w3.org/2000/svg", svg = this._s.getElementById("svg-graphe");
      svg.innerHTML = "";
      var V = this._V, c = CONFIGS[V], xMax = c.rMax + 1, yMax = c.yMax;
      var px = function (x) { return MG + x / xMax * (GL - MG - MD); };
      var py = function (y) { return MH + (yMax - y) / yMax * (GH - MH - MB); };
      var defs = svgEl(ns, "defs", {});
      var marker = svgEl(ns, "marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      marker.appendChild(svgEl(ns, "path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(marker);
      svg.appendChild(defs);
      for (var gx = 2; gx <= xMax; gx += 2) {
        svg.appendChild(svgEl(ns, "line", { x1: px(gx), x2: px(gx), y1: py(0), y2: py(yMax), class: "grille" }));
        var t = svgEl(ns, "text", { x: px(gx), y: py(0) + 14, "text-anchor": "middle", class: "grad" });
        t.textContent = String(gx);
        svg.appendChild(t);
      }
      for (var gy = c.pas; gy <= yMax; gy += c.pas) {
        svg.appendChild(svgEl(ns, "line", { x1: px(0), x2: px(xMax), y1: py(gy), y2: py(gy), class: "grille" }));
        if (gy === yMax) continue; // place laissée au titre d'axe « A (cm²) »
        var t2 = svgEl(ns, "text", { x: px(0) - 5, y: py(gy) + 3.5, "text-anchor": "end", class: "grad" });
        t2.textContent = String(gy);
        svg.appendChild(t2);
      }
      svg.appendChild(svgEl(ns, "line", { x1: px(0), x2: px(xMax) + 4, y1: py(0), y2: py(0), class: "axe", "marker-end": "url(#fleche)" }));
      svg.appendChild(svgEl(ns, "line", { x1: px(0), x2: px(0), y1: py(0), y2: py(yMax) - 6, class: "axe", "marker-end": "url(#fleche)" }));
      var tx = svgEl(ns, "text", { x: px(xMax), y: py(0) - 6, "text-anchor": "end", class: "titre-axe" });
      tx.textContent = "r (cm)";
      svg.appendChild(tx);
      var ty = svgEl(ns, "text", { x: px(0) + 6, y: py(yMax) + 4, class: "titre-axe" });
      ty.textContent = "A (cm²)";
      svg.appendChild(ty);
      // Courbe A(r) sur [rMin ; rMax], tronquée proprement au cadre.
      var d = "", dedans = false;
      for (var i = 0; i <= 300; i++) {
        var r = c.rMin + (i / 300) * (c.rMax - c.rMin), A = aire(V, r);
        if (A <= yMax) {
          d += (dedans ? "L" : "M") + px(r).toFixed(1) + " " + py(A).toFixed(1) + " ";
          dedans = true;
        } else dedans = false;
      }
      svg.appendChild(svgEl(ns, "path", { d: d.trim(), class: "courbe" }));
      var rs = rOptimal(V), As = aire(V, rs);
      svg.appendChild(svgEl(ns, "circle", { cx: px(rs), cy: py(As), r: 5, class: "point-min" }));
      var em = svgEl(ns, "text", { x: px(rs), y: py(As) + 20, "text-anchor": "middle", class: "etiquette et-min" });
      em.textContent = "minimum (" + nombreFr(rs, 2) + " ; " + nombreFr(As, 1) + ")";
      svg.appendChild(em);
      var rCur = this._r, Acur = aire(V, rCur);
      if (Acur <= yMax) {
        svg.appendChild(svgEl(ns, "line", { x1: px(rCur), x2: px(rCur), y1: py(0), y2: py(Acur), class: "guide" }));
        svg.appendChild(svgEl(ns, "circle", { cx: px(rCur), cy: py(Acur), r: 5, class: "point" }));
        var ancreDroite = px(rCur) > GL - 120;
        var ep = svgEl(ns, "text", { x: px(rCur) + (ancreDroite ? -8 : 8), y: py(Acur) - 9, "text-anchor": ancreDroite ? "end" : "start", class: "etiquette et-point" });
        ep.textContent = "A ≈ " + nombreFr(Acur, 1);
        svg.appendChild(ep);
      }
    }
  }

  if (!customElements.get("bidon-optimal-widget")) {
    customElements.define("bidon-optimal-widget", BidonOptimalWidget);
  }
})();
