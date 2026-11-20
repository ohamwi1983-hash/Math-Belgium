(function () {
  "use strict";

  /* ================================================================
   * <angle-de-vue-widget> — atelier interactif (6e, ch. 1, application
   * « Trouver la meilleure place pour regarder un écran »). Un écran est
   * accroché entre les hauteurs a et b = a + h au-dessus des yeux ; vu
   * depuis la distance x, il occupe l'angle θ(x) = arctan(b/x) − arctan(a/x).
   * À gauche la scène (à l'échelle), à droite le graphique de θ(x) en
   * degrés, maximum en x* = √(ab). Tout près du mur, θ → 0 (les deux rayons
   * deviennent verticaux) ; très loin aussi. Couleur du graphique et du
   * point : VERT tant que reculer agrandit θ (θ′ > 0), ROUGE ensuite.
   * Fenêtres FIXES : scène 0 à 12,6 sur 0 à 7,4 ; graphique 0 à 12 et
   * 0° à 90° (θ* ≤ 65,4° pour tous les réglages : a = 0,2, h = 4).
   * ================================================================ */

  var DEG = 180 / Math.PI;
  var SW = 340, SH = 214, SM = 12; // scène
  var SX = { min: -0.7, max: 12.7 }, SY = { min: -0.9 };
  var ECH = (SW - 2 * SM) / (SX.max - SX.min); // px par unité (même échelle en x et en y)
  var GW = 340, GH = 220, GL = 34, GR = 14, GT = 12, GB = 26;
  var GX = { min: 0, max: 12.6 }, GY = { min: 0, max: 90 };
  var NS = "http://www.w3.org/2000/svg";

  function fmt(n, dec) {
    if (Math.abs(n) < 0.5 * Math.pow(10, -dec)) n = 0;
    var s = n.toFixed(dec);
    if (s.indexOf(".") >= 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
    return s.replace(".", ",").replace("-", "−");
  }
  function svgEl(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }
  function texte(svg, x, y, t, cls, ancre) {
    var e = svgEl("text", { x: x.toFixed(1), y: y.toFixed(1), "text-anchor": ancre || "middle", class: cls });
    e.textContent = t;
    svg.appendChild(e);
    return e;
  }
  function frac(n, d) { return '<span class="frac"><span>' + n + '</span><span>' + d + '</span></span>'; }

  var CURSEURS = [
    { id: "x", label: "x — ta distance au mur", min: 0.1, max: 12, pas: 0.1, defaut: 5 },
    { id: "a", label: "a — hauteur du bas de l’écran au-dessus de tes yeux", min: 0.2, max: 3, pas: 0.1, defaut: 1 },
    { id: "h", label: "h — hauteur de l’écran (b = a + h)", min: 0.5, max: 4, pas: 0.1, defaut: 3 },
  ];

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#182430);}' +
    '*{box-sizing:border-box;}' +
    '.figures{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;}' +
    'svg{width:100%;max-width:340px;height:auto;background:var(--surface-2,#f7f9fb);border-radius:var(--radius,3px);display:block;flex:1 1 300px;}' +
    '.axe{stroke:var(--ink-soft,#51626f);stroke-width:1.3;}' +
    '.fleche{fill:var(--ink-soft,#51626f);}' +
    '.fleche-cote{fill:var(--ink-soft,#51626f);}' +
    '.grille{stroke:var(--line-soft,#dfe7ec);stroke-width:1;}' +
    '.tick{stroke:var(--ink-soft,#51626f);stroke-width:1;}' +
    '.tick-label{font-size:10px;font-family:var(--sans,sans-serif);fill:var(--ink-soft,#51626f);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3px;}' +
    '.sol{stroke:var(--ink-faint,#8a97a1);stroke-width:1.2;stroke-dasharray:6 4;}' +
    '.mur{stroke:var(--ink-soft,#51626f);stroke-width:2;}' +
    '.ecran{stroke:var(--ink,#182430);stroke-width:7;stroke-linecap:butt;}' +
    '.rayon-b{stroke:var(--sky,#2f6fb0);stroke-width:1.6;}' +
    '.rayon-a{stroke:var(--accent,#b65c1f);stroke-width:1.6;}' +
    '.secteur-pos{fill:var(--good,#2f7a4f);opacity:0.22;}' +
    '.secteur-neg{fill:var(--bad,#b23a3a);opacity:0.2;}' +
    '.oeil{fill:var(--ink,#182430);}' +
    '.cote{stroke:var(--ink-soft,#51626f);stroke-width:1.1;}' +
    '.etq{font-size:11px;font-weight:600;fill:var(--ink,#182430);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3px;}' +
    '.etq-a{fill:var(--accent-ink,#7a3c11);}' +
    '.etq-b{fill:var(--sky-ink,#1f4e7d);}' +
    '.etq-theta-pos{font-size:12px;font-weight:700;fill:var(--good,#2f7a4f);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3px;}' +
    '.etq-theta-neg{font-size:12px;font-weight:700;fill:var(--bad,#b23a3a);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3px;}' +
    '.c-pos{stroke:var(--good,#2f7a4f);stroke-width:2.6;fill:none;}' +
    '.c-neg{stroke:var(--bad,#b23a3a);stroke-width:2.6;fill:none;}' +
    '.repere-max{stroke:var(--ink-faint,#8a97a1);stroke-width:1;stroke-dasharray:3 3;}' +
    '.pt-max{fill:var(--surface,#fff);stroke:var(--ink,#182430);stroke-width:2;}' +
    '.pt-pos{fill:var(--good,#2f7a4f);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.pt-neg{fill:var(--bad,#b23a3a);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.etq-max{font-size:10.5px;font-weight:600;fill:var(--ink,#182430);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3px;}' +
    '.fm{font-family:var(--serif,Georgia,serif);white-space:nowrap;}' +
    '.fm i{margin-right:0.06em;}' +
    '.frac{display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;line-height:1.15;font-size:0.88em;}' +
    '.frac>span:first-child{border-bottom:1px solid currentColor;padding:0 3px 1px;}' +
    '.frac>span:last-child{padding:1px 3px 0;}' +
    '.rad .sous{border-top:1px solid currentColor;padding:0 2px 0 1px;}' +
    '.legende{font-size:0.82rem;color:var(--ink-soft,#51626f);text-align:center;line-height:1.5;margin-top:4px;}' +
    '.leg-pos{color:var(--good,#2f7a4f);font-weight:700;}' +
    '.leg-neg{color:var(--bad,#b23a3a);font-weight:700;}' +
    '.curseurs{margin-top:10px;}' +
    '.curseur{display:flex;flex-direction:column;gap:2px;}' +
    '.curseur label{font-size:0.84rem;color:var(--ink-soft,#51626f);}' +
    '.curseur-row{display:flex;align-items:center;gap:10px;min-height:44px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#b65c1f);min-height:44px;}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;min-width:64px;text-align:right;color:var(--ink-soft,#51626f);}' +
    '.boutons{display:flex;justify-content:center;margin-top:4px;}' +
    'button{min-height:44px;font:inherit;font-size:0.92rem;padding:6px 14px;border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);background:var(--surface,#fff);color:var(--ink,#182430);cursor:pointer;}' +
    'button:focus-visible,input:focus-visible{outline:2px solid var(--accent,#b65c1f);outline-offset:2px;}' +
    '.stats{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;}' +
    '.stat{flex:1 1 140px;min-width:0;border:1px solid var(--line,#ccd8e0);border-radius:var(--radius,3px);padding:8px 6px;text-align:center;background:var(--surface,#fff);}' +
    '.stat-label{display:block;font-size:0.78rem;color:var(--ink-soft,#51626f);margin-bottom:4px;}' +
    '.stat-value{display:block;font-variant-numeric:tabular-nums;font-size:1rem;font-weight:600;}' +
    '.lecture{margin-top:10px;border:1px solid var(--line,#ccd8e0);border-radius:var(--radius,3px);background:var(--surface,#fff);padding:10px 12px;font-size:0.93rem;line-height:1.75;}' +
    '.lecture p{margin:0 0 4px;}' +
    '.pos{color:var(--good,#2f7a4f);font-weight:700;}' +
    '.neg{color:var(--bad,#b23a3a);font-weight:700;}' +
    '</style>' +
    '<div>' +
    '<div class="figures">' +
    '<svg id="scene" viewBox="0 0 ' + SW + ' ' + SH + '" role="img" aria-label="Scène vue de profil : tes yeux, le mur et l’écran"></svg>' +
    '<svg id="graphe" viewBox="0 0 ' + GW + ' ' + GH + '" role="img" aria-label="Graphique de l’angle de vue en fonction de la distance"></svg>' +
    '</div>' +
    '<div class="legende">Scène de profil, à l’échelle (point noir : tes yeux) · <span class="leg-pos">vert : reculer agrandit θ</span> · <span class="leg-neg">rouge : reculer réduit θ</span></div>' +
    '</div>' +
    '<div class="curseurs" id="curseurs"></div>' +
    '<div class="boutons"><button type="button" id="optimum">Aller à la meilleure place</button></div>' +
    '<div class="stats">' +
    '<div class="stat"><span class="stat-label">angle de vue θ(x)</span><span class="stat-value" id="theta"></span></div>' +
    '<div class="stat"><span class="stat-label">meilleure place <i>x</i>* = <span class="rad">√<span class="sous"><i>ab</i></span></span></span><span class="stat-value" id="xetoile"></span></div>' +
    '</div>' +
    '<div class="lecture" aria-live="polite" id="lecture"></div>';

  class AngleDeVueWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._s = shadow;
      this._idx = {};
      var self = this, zc = shadow.getElementById("curseurs");
      CURSEURS.forEach(function (c) {
        var n = Math.round((c.max - c.min) / c.pas), i0 = Math.round((c.defaut - c.min) / c.pas);
        self._idx[c.id] = i0;
        var d = document.createElement("div");
        d.className = "curseur";
        d.innerHTML = '<label for="' + c.id + '">' + c.label + '</label><div class="curseur-row">' +
          '<input type="range" id="' + c.id + '" min="0" max="' + n + '" step="1" value="' + i0 + '">' +
          '<span class="curseur-valeur" id="' + c.id + '-valeur"></span></div>';
        zc.appendChild(d);
      });
    }

    connectedCallback() {
      var self = this;
      this._onInput = function (ev) {
        var id = ev.target && ev.target.id;
        if (!(id in self._idx)) return;
        self._idx[id] = parseInt(ev.target.value, 10);
        self._rendre();
      };
      this._onOpt = function () {
        var a = self._v("a"), b = a + self._v("h"), c = CURSEURS[0];
        var i = Math.round((Math.sqrt(a * b) - c.min) / c.pas);
        self._idx.x = Math.max(0, Math.min(Math.round((c.max - c.min) / c.pas), i));
        self._s.getElementById("x").value = String(self._idx.x);
        self._rendre();
      };
      this._s.getElementById("curseurs").addEventListener("input", this._onInput);
      this._s.getElementById("optimum").addEventListener("click", this._onOpt);
      this._rendre();
    }

    disconnectedCallback() {
      this._s.getElementById("curseurs").removeEventListener("input", this._onInput);
      this._s.getElementById("optimum").removeEventListener("click", this._onOpt);
    }

    _v(id) { var c = CURSEURS.filter(function (x) { return x.id === id; })[0]; return Math.round((c.min + this._idx[id] * c.pas) * 1000) / 1000; }

    _scene(x, a, b, croit) {
      var svg = this._s.getElementById("scene");
      svg.innerHTML = "";
      var P = function (u, v) { return [SM + (u - SX.min) * ECH, SH - SM - (v - SY.min) * ECH]; };
      var defs = svgEl("defs", {});
      var m = svgEl("marker", { id: "fc", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto-start-reverse" });
      m.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche-cote" }));
      defs.appendChild(m);
      svg.appendChild(defs);
      var o = P(0, 0), mur0 = P(x, SY.min + 0.15), mur1 = P(x, b + 0.35);
      // Ligne horizontale des yeux.
      svg.appendChild(svgEl("line", { x1: o[0].toFixed(1), y1: o[1].toFixed(1), x2: P(12.6, 0)[0].toFixed(1), y2: o[1].toFixed(1), class: "sol" }));
      svg.appendChild(svgEl("line", { x1: mur0[0].toFixed(1), y1: mur0[1].toFixed(1), x2: mur1[0].toFixed(1), y2: mur1[1].toFixed(1), class: "mur" }));
      var pa = P(x, a), pb = P(x, b);
      // Secteur de l'angle θ, rayons, écran.
      var r = Math.min(46, 0.75 * Math.hypot(pa[0] - o[0], pa[1] - o[1]));
      var ta = Math.atan2(a, x), tb = Math.atan2(b, x);
      var qa = [o[0] + r * Math.cos(ta), o[1] - r * Math.sin(ta)], qb = [o[0] + r * Math.cos(tb), o[1] - r * Math.sin(tb)];
      svg.appendChild(svgEl("path", { d: "M" + o[0].toFixed(1) + " " + o[1].toFixed(1) + " L" + qa[0].toFixed(1) + " " + qa[1].toFixed(1) + " A" + r.toFixed(1) + " " + r.toFixed(1) + " 0 0 0 " + qb[0].toFixed(1) + " " + qb[1].toFixed(1) + " Z", class: croit ? "secteur-pos" : "secteur-neg" }));
      svg.appendChild(svgEl("line", { x1: o[0].toFixed(1), y1: o[1].toFixed(1), x2: pa[0].toFixed(1), y2: pa[1].toFixed(1), class: "rayon-a" }));
      svg.appendChild(svgEl("line", { x1: o[0].toFixed(1), y1: o[1].toFixed(1), x2: pb[0].toFixed(1), y2: pb[1].toFixed(1), class: "rayon-b" }));
      svg.appendChild(svgEl("line", { x1: pa[0].toFixed(1), y1: pa[1].toFixed(1), x2: pb[0].toFixed(1), y2: pb[1].toFixed(1), class: "ecran" }));
      svg.appendChild(svgEl("circle", { cx: o[0].toFixed(1), cy: o[1].toFixed(1), r: 4, class: "oeil" }));
      var tm = (ta + tb) / 2, rl = r + 12;
      texte(svg, o[0] + rl * Math.cos(tm), o[1] - rl * Math.sin(tm) + 4, "θ", croit ? "etq-theta-pos" : "etq-theta-neg");
      // Hauteurs a et b, à droite du mur (à gauche quand le mur est près du bord droit).
      var gauche = x > 10.4;
      var dxl = gauche ? -8 : 8, anc = gauche ? "end" : "start";
      texte(svg, pa[0] + dxl, pa[1] + 4, "a = " + fmt(a, 1), "etq etq-a", anc);
      texte(svg, pb[0] + dxl, pb[1] + 4, "b = " + fmt(b, 1), "etq etq-b", anc);
      // Cote x (double flèche) sous la ligne des yeux.
      var yc = P(0, -0.5)[1];
      if (x > 0.6) svg.appendChild(svgEl("line", { x1: (o[0] + 2).toFixed(1), y1: yc.toFixed(1), x2: (pa[0] - 2).toFixed(1), y2: yc.toFixed(1), class: "cote", "marker-start": "url(#fc)", "marker-end": "url(#fc)" }));
      var xl = Math.max(o[0] + 24, Math.min(SW - 30, (o[0] + pa[0]) / 2));
      texte(svg, xl, yc - 4, "x = " + fmt(x, 1), "etq");
    }

    _px(x, y) {
      return [GL + (x - GX.min) / (GX.max - GX.min) * (GW - GL - GR), GH - GB - (y - GY.min) / (GY.max - GY.min) * (GH - GT - GB)];
    }

    _graphe(x, a, b, xs, ts, th, croit) {
      var self = this, svg = this._s.getElementById("graphe");
      svg.innerHTML = "";
      var defs = svgEl("defs", {});
      var m = svgEl("marker", { id: "fg", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      m.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(m);
      svg.appendChild(defs);
      var o = this._px(0, 0);
      [30, 60, 90].forEach(function (t) { var p = self._px(0, t); svg.appendChild(svgEl("line", { x1: GL, x2: GW - GR, y1: p[1].toFixed(1), y2: p[1].toFixed(1), class: "grille" })); });
      [2, 4, 6, 8, 10, 12].forEach(function (t) { var p = self._px(t, 0); svg.appendChild(svgEl("line", { x1: p[0].toFixed(1), x2: p[0].toFixed(1), y1: GT, y2: GH - GB, class: "grille" })); });
      svg.appendChild(svgEl("line", { x1: o[0].toFixed(1), x2: GW - 4, y1: o[1].toFixed(1), y2: o[1].toFixed(1), class: "axe", "marker-end": "url(#fg)" }));
      svg.appendChild(svgEl("line", { x1: o[0].toFixed(1), x2: o[0].toFixed(1), y1: o[1].toFixed(1), y2: 4, class: "axe", "marker-end": "url(#fg)" }));
      // Repères du maximum (sous la courbe).
      var pm = this._px(xs, ts);
      svg.appendChild(svgEl("line", { x1: pm[0].toFixed(1), x2: pm[0].toFixed(1), y1: pm[1].toFixed(1), y2: o[1].toFixed(1), class: "repere-max" }));
      svg.appendChild(svgEl("line", { x1: o[0].toFixed(1), x2: pm[0].toFixed(1), y1: pm[1].toFixed(1), y2: pm[1].toFixed(1), class: "repere-max" }));
      // Courbe θ(x) : verte avant x*, rouge après.
      var theta = function (u) { return (Math.atan(b / u) - Math.atan(a / u)) * DEG; };
      var chemin = function (lo, hi) {
        var d = "";
        for (var i = 0; i <= 200; i++) { var u = lo + (hi - lo) * i / 200, p = self._px(u, theta(u)); d += (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1) + " "; }
        return d.trim();
      };
      svg.appendChild(svgEl("path", { d: chemin(0.001, Math.min(xs, GX.max)), class: "c-pos" }));
      if (xs < GX.max) svg.appendChild(svgEl("path", { d: chemin(xs, GX.max), class: "c-neg" }));
      svg.appendChild(svgEl("circle", { cx: pm[0].toFixed(1), cy: pm[1].toFixed(1), r: 5, class: "pt-max" }));
      var droite = pm[0] < GW - 120;
      texte(svg, pm[0] + (droite ? 8 : -8), pm[1] - 8, "maximum : " + fmt(ts, 1) + "°", "etq-max", droite ? "start" : "end");
      var pc = this._px(x, th);
      svg.appendChild(svgEl("circle", { cx: pc[0].toFixed(1), cy: pc[1].toFixed(1), r: 5.5, class: croit ? "pt-pos" : "pt-neg" }));
      // Graduations (au premier plan).
      [2, 4, 6, 8, 10, 12].forEach(function (t) {
        var p = self._px(t, 0);
        svg.appendChild(svgEl("line", { x1: p[0].toFixed(1), x2: p[0].toFixed(1), y1: (o[1] - 3).toFixed(1), y2: (o[1] + 3).toFixed(1), class: "tick" }));
        texte(svg, p[0], o[1] + 14, fmt(t, 0), "tick-label");
      });
      [30, 60, 90].forEach(function (t) {
        var p = self._px(0, t);
        svg.appendChild(svgEl("line", { x1: (o[0] - 3).toFixed(1), x2: (o[0] + 3).toFixed(1), y1: p[1].toFixed(1), y2: p[1].toFixed(1), class: "tick" }));
        texte(svg, o[0] - 5, p[1] + 3.5, t + "°", "tick-label", "end");
      });
      texte(svg, o[0] - 5, o[1] + 4, "0", "tick-label", "end");
      texte(svg, GW - 8, o[1] - 6, "x", "tick-label", "end");
      texte(svg, o[0] + 8, 13, "θ", "tick-label", "start");
    }

    _rendre() {
      var self = this;
      var x = this._v("x"), a = this._v("a"), h = this._v("h"), b = Math.round((a + h) * 1000) / 1000;
      var th = (Math.atan(b / x) - Math.atan(a / x)) * DEG;
      var xs = Math.sqrt(a * b), ts = (Math.atan(b / xs) - Math.atan(a / xs)) * DEG;
      var dth = a / (x * x + a * a) - b / (x * x + b * b); // θ′(x)
      var croit = dth > 1e-12 || (Math.abs(dth) <= 1e-12 && x < xs);
      this._scene(x, a, b, croit);
      this._graphe(x, a, b, xs, ts, th, croit);
      CURSEURS.forEach(function (c) { self._s.getElementById(c.id + "-valeur").textContent = c.id + " = " + fmt(self._v(c.id), 1); });
      this._s.getElementById("theta").textContent = fmt(th, 2) + "° ≈ " + fmt(th / DEG, 3) + " rad";
      this._s.getElementById("xetoile").textContent = fmt(xs, 2) + " (θ* ≈ " + fmt(ts, 2) + "°)";
      var aT = fmt(Math.atan(b / x) * DEG, 2), bT = fmt(Math.atan(a / x) * DEG, 2);
      var prod = Math.round(a * b * 10000) / 10000;
      var racine = Math.abs(xs - Math.round(xs * 100) / 100) < 1e-9 ? "= " + fmt(xs, 2) : "≈ " + fmt(xs, 2);
      var h1 = '<p><span class="fm"><i>θ</i>(<i>x</i>) = arctan ' + frac("<i>b</i>", "<i>x</i>") + " − arctan " + frac("<i>a</i>", "<i>x</i>") +
        "</span> <span class=\"fm\">= arctan " + frac(fmt(b, 1), fmt(x, 1)) + " − arctan " + frac(fmt(a, 1), fmt(x, 1)) + "</span> ≈ " + aT + "° − " + bT + "° ≈ " + fmt(th, 2) + "°.</p>";
      var dist = Math.abs(x - xs) < 0.05 ? '<span class="pos">Tu es à la meilleure place (à 0,05 près).</span>' :
        croit ? '<span class="pos">θ′(x) > 0 : en reculant, l’angle grandit.</span>' : '<span class="neg">θ′(x) < 0 : en reculant, l’angle diminue.</span>';
      var pres = x <= 0.5 ? " Tout près du mur, les deux rayons sont presque verticaux : θ tend vers 0, l’écran se voit très mal." : "";
      var h2 = "<p>" + dist + pres + "</p>";
      var h3 = '<p>Maximum : <span class="fm"><i>θ</i> ′(<i>x</i>) = 0 ⟺ <i>x</i>² = <i>ab</i></span>, donc <span class="fm"><i>x</i>* = <span class="rad">√<span class="sous">' +
        fmt(a, 1) + " · " + fmt(b, 1) + "</span></span> = <span class=\"rad\">√<span class=\"sous\">" + fmt(prod, 4) + "</span></span> " + racine + "</span>.</p>";
      this._s.getElementById("lecture").innerHTML = h1 + h2 + h3;
    }
  }

  if (!customElements.get("angle-de-vue-widget")) customElements.define("angle-de-vue-widget", AngleDeVueWidget);
})();
