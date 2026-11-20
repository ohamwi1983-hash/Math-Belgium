(function () {
  "use strict";

  /* ================================================================
   * <arc-de-trig-widget> — atelier interactif (6e, ch. 1, § 2, piège
   * « arcsin(x) est l'UNIQUE angle de [−π/2 ; π/2] … »). θ libre sur le
   * cercle trigonométrique (radians, de −2π à 2π par pas de π/48) ; le
   * résultat arcsin(sin θ) est l'angle de l'image [−π/2 ; π/2] qui a le
   * même sinus — égal à θ seulement si θ est déjà dans l'image. Variantes
   * arccos(cos θ) (image [0 ; π], même cosinus) et arctan(tan θ) (image
   * ]−π/2 ; π/2[, même tangente). Calcul EXACT en multiples de π/48 (aucun
   * arrondi sur le résultat), relation affichée (π − θ, θ − 2π…), graphique
   * « en dents de scie » de θ ↦ arc(trig θ). Fenêtres FIXES. Web Component.
   * Couleurs : θ et son point en orange, le résultat (image) en vert.
   * ================================================================ */

  var PI = Math.PI;
  var D = 48; // θ = k·π/48

  var MODES = [
    { cle: "sin", option: "arcsin(sin θ)", arc: "arcsin", trig: "sin", image: "[−π/2 ; π/2]", imin: -PI / 2, imax: PI / 2,
      yWin: { min: -2.2, max: 2.2 }, yTicks: [-PI / 2, PI / 2], meme: "le même sinus" },
    { cle: "cos", option: "arccos(cos θ)", arc: "arccos", trig: "cos", image: "[0 ; π]", imin: 0, imax: PI,
      yWin: { min: -0.6, max: 3.75 }, yTicks: [PI / 2, PI], meme: "le même cosinus" },
    { cle: "tan", option: "arctan(tan θ)", arc: "arctan", trig: "tan", image: "]−π/2 ; π/2[", imin: -PI / 2, imax: PI / 2,
      yWin: { min: -2.2, max: 2.2 }, yTicks: [-PI / 2, PI / 2], meme: "la même tangente" },
  ];

  function mod(a, n) { return ((a % n) + n) % n; }
  function pgcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a || 1; }

  // Résultat exact (en unités de π/48) de arc(trig(kπ/48)), ou null si tan n'existe pas.
  function resultat(cle, k) {
    var r;
    if (cle === "sin") { r = mod(k + D / 2, 2 * D) - D / 2; if (r > D / 2) r = D - r; return r; }
    if (cle === "cos") { r = mod(k, 2 * D); if (r > D) r = 2 * D - r; return r; }
    if (mod(k - D / 2, D) === 0) return null;
    return mod(k + D / 2, D) - D / 2;
  }
  // Valeur réelle de θ ↦ arc(trig θ), pour tracer la courbe.
  function arcTrig(cle, t) {
    if (cle === "sin") return Math.asin(Math.max(-1, Math.min(1, Math.sin(t))));
    if (cle === "cos") return Math.acos(Math.max(-1, Math.min(1, Math.cos(t))));
    return Math.atan(Math.tan(t));
  }

  // n·π (n entier) en texte : « π », « −2π », « 3π ».
  function nPi(n) { return n === 1 ? "π" : n === -1 ? "−π" : (n < 0 ? "−" : "") + Math.abs(n) + "π"; }
  // k·π/48 en HTML (fraction empilée) ou en texte (SVG).
  function piFrac(k, html) {
    if (k === 0) return "0";
    var g = pgcd(k, D), p = Math.abs(k / g), q = D / g, s = k < 0 ? "−" : "";
    var num = (p === 1 ? "" : p) + "π";
    if (q === 1) return s + num;
    return html ? s + '<span class="frac"><span>' + num + '</span><span>' + q + '</span></span>' : s + num + "/" + q;
  }

  function fmt(n, dec) {
    if (Math.abs(n) < 0.5 * Math.pow(10, -dec)) n = 0;
    var s = n.toFixed(dec);
    if (s.indexOf(".") >= 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
    return s.replace(".", ",").replace("-", "−");
  }

  var NS = "http://www.w3.org/2000/svg";
  function svgEl(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }
  function marqueur(svg, id) {
    var defs = svgEl("defs", {});
    var m = svgEl("marker", { id: id, markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
    m.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
    defs.appendChild(m);
    svg.appendChild(defs);
    return defs;
  }
  function texte(svg, x, y, t, cls, ancre) {
    var e = svgEl("text", { x: x.toFixed(1), y: y.toFixed(1), "text-anchor": ancre || "middle", class: cls });
    e.textContent = t;
    svg.appendChild(e);
    return e;
  }

  var CW = 300, CH = 270, CR = 92, CX = 150, CY = 135; // cercle
  var GW = 340, GH = 220, GL = 34, GR = 14, GT = 12, GB = 24; // graphique
  var XG = { min: -6.75, max: 6.75 };

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#182430);}' +
    '*{box-sizing:border-box;}' +
    '.choix{display:flex;flex-direction:column;gap:6px;margin-bottom:12px;}' +
    '.choix label{font-size:0.8rem;color:var(--ink-soft,#51626f);}' +
    'select{min-height:44px;font:inherit;font-size:0.95rem;padding:6px 10px;border:1px solid var(--line,#ccd8e0);border-radius:var(--radius,3px);background:var(--surface,#fff);color:var(--ink,#182430);}' +
    '.figures{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;}' +
    'svg{height:auto;background:var(--surface-2,#f7f9fb);border-radius:var(--radius,3px);display:block;}' +
    '#cercle{width:100%;max-width:300px;flex:1 1 260px;}' +
    '#graphe{width:100%;max-width:340px;flex:1 1 300px;}' +
    '.axe{stroke:var(--ink-soft,#51626f);stroke-width:1.3;}' +
    '.fleche{fill:var(--ink-soft,#51626f);}' +
    '.grille{stroke:var(--line-soft,#dfe7ec);stroke-width:1;}' +
    '.tick{stroke:var(--ink-soft,#51626f);stroke-width:1;}' +
    '.tick-label{font-size:10px;font-family:var(--sans,sans-serif);fill:var(--ink-soft,#51626f);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3px;}' +
    '.cercle{stroke:var(--ink-faint,#8a97a1);stroke-width:1.4;fill:none;}' +
    '.image{stroke:var(--good,#2f7a4f);stroke-width:7;fill:none;opacity:0.35;stroke-linecap:round;}' +
    '.spirale{stroke:var(--accent,#b65c1f);stroke-width:1.8;fill:none;}' +
    '.rayon-t{stroke:var(--accent,#b65c1f);stroke-width:1.6;}' +
    '.rayon-r{stroke:var(--good,#2f7a4f);stroke-width:2.2;}' +
    '.lien{stroke:var(--plan,#5b4ea3);stroke-width:1.4;stroke-dasharray:4 3;}' +
    '.projection{stroke:var(--plan,#5b4ea3);stroke-width:4;stroke-linecap:round;}' +
    '.tangente-geo{stroke:var(--ink-faint,#8a97a1);stroke-width:1.1;stroke-dasharray:2 3;}' +
    '.pt-t{fill:var(--accent,#b65c1f);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.pt-r{fill:var(--good,#2f7a4f);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.etq-t{font-size:11px;font-weight:700;fill:var(--accent-ink,#7a3c11);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3px;}' +
    '.etq-r{font-size:11px;font-weight:700;fill:var(--good,#2f7a4f);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3px;}' +
    '.etq-img{font-size:10px;font-weight:600;fill:var(--good,#2f7a4f);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3px;}' +
    '.courbe{stroke:var(--good,#2f7a4f);stroke-width:2.4;fill:none;}' +
    '.identite{stroke:var(--accent,#b65c1f);stroke-width:1.2;stroke-dasharray:5 4;opacity:0.8;}' +
    '.bande{fill:var(--good,#2f7a4f);opacity:0.08;}' +
    '.guide{stroke:var(--ink-faint,#8a97a1);stroke-width:1;stroke-dasharray:3 3;}' +
    '.fm{font-family:var(--serif,Georgia,serif);white-space:nowrap;}' +
    '.fm i{margin-right:0.06em;}' +
    '.frac{display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;line-height:1.15;font-size:0.88em;}' +
    '.frac>span:first-child{border-bottom:1px solid currentColor;padding:0 3px 1px;}' +
    '.frac>span:last-child{padding:1px 3px 0;}' +
    '.legende{font-size:0.82rem;color:var(--ink-soft,#51626f);text-align:center;line-height:1.5;margin-top:4px;}' +
    '.leg-t{color:var(--accent-ink,#7a3c11);font-weight:700;}' +
    '.leg-r{color:var(--good,#2f7a4f);font-weight:700;}' +
    '.curseur{display:flex;flex-direction:column;gap:4px;margin-top:12px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3c11);text-align:center;}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;min-height:44px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#b65c1f);min-height:44px;}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#51626f);min-width:104px;text-align:right;}' +
    '.boutons{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:6px;}' +
    'button{min-height:44px;min-width:56px;font:inherit;font-size:0.95rem;padding:6px 12px;border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);background:var(--surface,#fff);color:var(--ink,#182430);cursor:pointer;font-family:var(--serif,Georgia,serif);}' +
    'button:focus-visible,select:focus-visible,input:focus-visible{outline:2px solid var(--accent,#b65c1f);outline-offset:2px;}' +
    '.lecture{margin-top:12px;border:1px solid var(--line,#ccd8e0);border-radius:var(--radius,3px);background:var(--surface,#fff);padding:10px 12px;font-size:0.95rem;line-height:1.8;text-align:center;}' +
    '.ok{color:var(--good,#2f7a4f);font-weight:700;}' +
    '.ko{color:var(--bad,#b23a3a);font-weight:700;}' +
    '</style>' +
    '<div class="choix"><label for="mode">Expression étudiée</label><select id="mode"></select></div>' +
    '<div>' +
    '<div class="figures">' +
    '<svg id="cercle" viewBox="0 0 ' + CW + ' ' + CH + '" role="img" aria-label="Cercle trigonométrique"></svg>' +
    '<svg id="graphe" viewBox="0 0 ' + GW + ' ' + GH + '" role="img" aria-label="Graphique de arc(trig θ)"></svg>' +
    '</div>' +
    '<div class="legende" id="legende"></div>' +
    '</div>' +
    '<div class="curseur"><label for="theta">θ — angle en radians, n’importe où sur le cercle</label><div class="curseur-row">' +
    '<input type="range" id="theta" min="-96" max="96" step="1" value="32"><span class="curseur-valeur" id="theta-valeur"></span></div></div>' +
    '<div class="boutons" id="boutons"></div>' +
    '<div class="lecture" aria-live="polite" id="lecture"></div>';

  var RACCOURCIS = [-80, -40, -8, 8, 32, 40, 56, 88];

  class ArcDeTrigWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._s = shadow;
      this._select = shadow.getElementById("mode");
      this._input = shadow.getElementById("theta");
      var self = this;
      MODES.forEach(function (m, i) {
        var o = document.createElement("option");
        o.value = String(i);
        o.textContent = m.option;
        self._select.appendChild(o);
      });
      var zone = shadow.getElementById("boutons");
      RACCOURCIS.forEach(function (k) {
        var b = document.createElement("button");
        b.type = "button";
        b.innerHTML = piFrac(k, true);
        b.setAttribute("aria-label", "θ = " + piFrac(k, false));
        b.addEventListener("click", function () { self._k = k; self._input.value = String(k); self._rendre(); });
        zone.appendChild(b);
      });
    }

    connectedCallback() {
      var self = this;
      this._onSelect = function () { self._m = MODES[parseInt(self._select.value, 10)]; self._rendre(); };
      this._onT = function () { self._k = parseInt(self._input.value, 10); self._rendre(); };
      this._select.addEventListener("change", this._onSelect);
      this._input.addEventListener("input", this._onT);
      this._m = MODES[0];
      this._k = 32;
      this._rendre();
    }

    disconnectedCallback() {
      this._select.removeEventListener("change", this._onSelect);
      this._input.removeEventListener("input", this._onT);
    }

    _cercle(theta, phi) {
      var m = this._m, svg = this._s.getElementById("cercle");
      svg.innerHTML = "";
      var defs = marqueur(svg, "flc");
      var clip = svgEl("clipPath", { id: "cadre-c" });
      clip.appendChild(svgEl("rect", { x: 0, y: 0, width: CW, height: CH }));
      defs.appendChild(clip);
      var P = function (x, y) { return [CX + x * CR, CY - y * CR]; };
      svg.appendChild(svgEl("line", { x1: 8, x2: CW - 8, y1: CY, y2: CY, class: "axe", "marker-end": "url(#flc)" }));
      svg.appendChild(svgEl("line", { x1: CX, x2: CX, y1: CH - 6, y2: 6, class: "axe", "marker-end": "url(#flc)" }));
      [[1, 0, "1", 0, 13], [-1, 0, "−1", 0, 13], [0, 1, "1", -6, 4], [0, -1, "−1", -6, 4]].forEach(function (t) {
        var p = P(t[0], t[1]);
        if (t[1] === 0) svg.appendChild(svgEl("line", { x1: p[0], x2: p[0], y1: CY - 3, y2: CY + 3, class: "tick" }));
        else svg.appendChild(svgEl("line", { x1: CX - 3, x2: CX + 3, y1: p[1], y2: p[1], class: "tick" }));
        texte(svg, p[0] + t[3] + (t[1] === 0 ? (t[0] > 0 ? -7 : 8) : 0), p[1] + t[4], t[2], "tick-label", t[1] === 0 ? "middle" : "end");
      });
      svg.appendChild(svgEl("circle", { cx: CX, cy: CY, r: CR, class: "cercle" }));
      // Image de l'arcfonction : arc vert épais sur le cercle.
      var a0 = m.imin, a1 = m.imax;
      var p0 = P(Math.cos(a0), Math.sin(a0)), p1 = P(Math.cos(a1), Math.sin(a1));
      svg.appendChild(svgEl("path", { d: "M" + p0[0].toFixed(1) + " " + p0[1].toFixed(1) + " A" + CR + " " + CR + " 0 0 0 " + p1[0].toFixed(1) + " " + p1[1].toFixed(1), class: "image" }));
      var e0 = P(1.22 * Math.cos(a0), 1.22 * Math.sin(a0)), e1 = P(1.22 * Math.cos(a1), 1.22 * Math.sin(a1));
      texte(svg, e0[0] + (m.cle === "cos" ? 10 : 0), e0[1] + (m.cle === "cos" ? -5 : 4), m.cle === "cos" ? "0" : "−π/2", "etq-img");
      texte(svg, e1[0] + (m.cle === "cos" ? -6 : 0), e1[1] + (m.cle === "cos" ? -5 : 4), m.cle === "cos" ? "π" : "π/2", "etq-img");
      // Lien « même sinus / cosinus / tangente » entre M(θ) et M′(résultat).
      var M = P(Math.cos(theta), Math.sin(theta));
      var g = svgEl("g", { "clip-path": "url(#cadre-c)" });
      svg.appendChild(g);
      if (m.cle === "tan") {
        var t1 = P(1, -1.45), t2 = P(1, 1.45);
        g.appendChild(svgEl("line", { x1: t1[0], y1: t1[1], x2: t2[0], y2: t2[1], class: "tangente-geo" }));
      }
      if (phi !== null) {
        var R = P(Math.cos(phi), Math.sin(phi));
        if (m.cle === "sin") {
          var py = P(0, Math.sin(theta));
          g.appendChild(svgEl("line", { x1: Math.min(M[0], R[0], CX).toFixed(1), x2: Math.max(M[0], R[0], CX).toFixed(1), y1: M[1].toFixed(1), y2: M[1].toFixed(1), class: "lien" }));
          g.appendChild(svgEl("line", { x1: CX, x2: CX, y1: CY, y2: py[1].toFixed(1), class: "projection" }));
        } else if (m.cle === "cos") {
          var px = P(Math.cos(theta), 0);
          g.appendChild(svgEl("line", { x1: M[0].toFixed(1), x2: M[0].toFixed(1), y1: Math.min(M[1], R[1], CY).toFixed(1), y2: Math.max(M[1], R[1], CY).toFixed(1), class: "lien" }));
          g.appendChild(svgEl("line", { x1: CX, x2: px[0].toFixed(1), y1: CY, y2: CY, class: "projection" }));
        } else {
          var tv = Math.tan(theta);
          var Tq = P(1, tv), Ms = P(-Math.cos(phi), -Math.sin(phi));
          g.appendChild(svgEl("line", { x1: Ms[0].toFixed(1), y1: Ms[1].toFixed(1), x2: Tq[0].toFixed(1), y2: Tq[1].toFixed(1), class: "lien" }));
          g.appendChild(svgEl("line", { x1: P(1, 0)[0], x2: P(1, 0)[0], y1: CY, y2: Tq[1].toFixed(1), class: "projection" }));
        }
        g.appendChild(svgEl("line", { x1: CX, y1: CY, x2: R[0].toFixed(1), y2: R[1].toFixed(1), class: "rayon-r" }));
      }
      // Arc parcouru depuis 0 (spirale : un tour de plus s'éloigne du centre).
      var d = "", N = Math.max(2, Math.ceil(Math.abs(theta) / 0.05));
      for (var i = 0; i <= N; i++) {
        var t = theta * i / N, rr = 0.2 + 0.07 * Math.abs(t) / PI;
        var q = P(rr * Math.cos(t), rr * Math.sin(t));
        d += (i ? "L" : "M") + q[0].toFixed(1) + " " + q[1].toFixed(1) + " ";
      }
      svg.appendChild(svgEl("path", { d: d.trim(), class: "spirale" }));
      svg.appendChild(svgEl("line", { x1: CX, y1: CY, x2: M[0].toFixed(1), y2: M[1].toFixed(1), class: "rayon-t" }));
      svg.appendChild(svgEl("circle", { cx: M[0].toFixed(1), cy: M[1].toFixed(1), r: 5.5, class: "pt-t" }));
      var lm = P(1.2 * Math.cos(theta), 1.2 * Math.sin(theta));
      texte(svg, lm[0], lm[1] + 4, "θ", "etq-t");
      if (phi !== null) {
        var Rr = P(Math.cos(phi), Math.sin(phi));
        svg.appendChild(svgEl("circle", { cx: Rr[0].toFixed(1), cy: Rr[1].toFixed(1), r: 4.5, class: "pt-r" }));
        if (Math.abs(phi - theta) > 1e-9) {
          var lr = P(0.72 * Math.cos(phi), 0.72 * Math.sin(phi));
          texte(svg, lr[0], lr[1] + 4, m.arc, "etq-r");
        }
      }
    }

    _px(x, y) {
      var w = this._m.yWin;
      return [GL + (x - XG.min) / (XG.max - XG.min) * (GW - GL - GR), GH - GB - (y - w.min) / (w.max - w.min) * (GH - GT - GB)];
    }

    _graphe(theta, phi) {
      var m = this._m, self = this, svg = this._s.getElementById("graphe");
      svg.innerHTML = "";
      var defs = marqueur(svg, "flg");
      var clip = svgEl("clipPath", { id: "cadre-g" });
      clip.appendChild(svgEl("rect", { x: GL, y: GT, width: GW - GL - GR, height: GH - GT - GB }));
      defs.appendChild(clip);
      // Bande de l'image (ordonnées permises).
      var b0 = this._px(0, m.imax), b1 = this._px(0, m.imin);
      svg.appendChild(svgEl("rect", { x: GL, y: b0[1].toFixed(1), width: GW - GL - GR, height: (b1[1] - b0[1]).toFixed(1), class: "bande" }));
      var o = this._px(0, 0);
      for (var j = -4; j <= 4; j++) {
        if (j === 0) continue;
        var p = this._px(j * PI / 2, 0);
        svg.appendChild(svgEl("line", { x1: p[0].toFixed(1), x2: p[0].toFixed(1), y1: GT, y2: GH - GB, class: "grille" }));
      }
      m.yTicks.forEach(function (t) {
        var p = self._px(0, t);
        svg.appendChild(svgEl("line", { x1: GL, x2: GW - GR, y1: p[1].toFixed(1), y2: p[1].toFixed(1), class: "grille" }));
      });
      svg.appendChild(svgEl("line", { x1: GL - 4, x2: GW - 4, y1: o[1].toFixed(1), y2: o[1].toFixed(1), class: "axe", "marker-end": "url(#flg)" }));
      svg.appendChild(svgEl("line", { x1: o[0].toFixed(1), x2: o[0].toFixed(1), y1: GH - 4, y2: 4, class: "axe", "marker-end": "url(#flg)" }));
      for (var i = -4; i <= 4; i++) {
        if (i === 0) continue;
        var q = this._px(i * PI / 2, 0);
        svg.appendChild(svgEl("line", { x1: q[0].toFixed(1), x2: q[0].toFixed(1), y1: (o[1] - 3).toFixed(1), y2: (o[1] + 3).toFixed(1), class: "tick" }));
        if (i % 2 === 0) texte(svg, q[0], o[1] + 14, nPi(i / 2), "tick-label");
      }
      m.yTicks.forEach(function (t) {
        var p = self._px(0, t);
        svg.appendChild(svgEl("line", { x1: (o[0] - 3).toFixed(1), x2: (o[0] + 3).toFixed(1), y1: p[1].toFixed(1), y2: p[1].toFixed(1), class: "tick" }));
        texte(svg, o[0] - 5, p[1] + 3.5, Math.abs(t - PI) < 1e-9 ? "π" : t < 0 ? "−π/2" : "π/2", "tick-label", "end");
      });
      texte(svg, GW - 8, o[1] - 7, "θ", "tick-label", "end");
      var g = svgEl("g", { "clip-path": "url(#cadre-g)" });
      svg.appendChild(g);
      var i0 = this._px(XG.min, XG.min), i1 = this._px(XG.max, XG.max);
      g.appendChild(svgEl("line", { x1: i0[0].toFixed(1), y1: i0[1].toFixed(1), x2: i1[0].toFixed(1), y2: i1[1].toFixed(1), class: "identite" }));
      var d = "", N = 1200, prec = null;
      for (var s = 0; s <= N; s++) {
        var t = XG.min + (XG.max - XG.min) * s / N, y = arcTrig(m.cle, t);
        var r = this._px(t, y);
        var saut = prec !== null && Math.abs(y - prec) > 1;
        d += (prec === null || saut ? "M" : "L") + r[0].toFixed(1) + " " + r[1].toFixed(1) + " ";
        prec = y;
      }
      g.appendChild(svgEl("path", { d: d.trim(), class: "courbe" }));
      var pt = this._px(theta, 0);
      g.appendChild(svgEl("line", { x1: pt[0].toFixed(1), x2: pt[0].toFixed(1), y1: GT, y2: GH - GB, class: "guide" }));
      svg.appendChild(svgEl("circle", { cx: pt[0].toFixed(1), cy: o[1].toFixed(1), r: 4, class: "pt-t" }));
      if (phi !== null) {
        var pr = this._px(theta, phi);
        svg.appendChild(svgEl("circle", { cx: pr[0].toFixed(1), cy: pr[1].toFixed(1), r: 5, class: "pt-r" }));
      }

      // Étiquettes de graduation au premier plan (jamais masquées par une courbe).
      svg.querySelectorAll("text.tick-label").forEach(function (t) { svg.appendChild(t); });
    }

    _rendre() {
      var m = this._m, k = this._k;
      var theta = k * PI / D;
      var r = resultat(m.cle, k);
      var phi = r === null ? null : r * PI / D;
      this._input.value = String(k);
      this._cercle(theta, phi);
      this._graphe(theta, phi);
      this._s.getElementById("legende").innerHTML =
        '<span class="leg-t">orange : θ</span> (et la droite <span class="fm">y = θ</span> en pointillés) · ' +
        '<span class="leg-r">vert : l’image ' + m.image + ' et le résultat ' + m.arc + '(' + m.trig + ' θ)</span>';
      this._s.getElementById("theta-valeur").innerHTML = '<span class="fm"><i>θ</i> = ' + piFrac(k, true) + '</span>' + (k === 0 ? "" : " ≈ " + fmt(theta, 2));
      var lect = this._s.getElementById("lecture");
      var expr = '<span class="fm">' + m.arc + '(' + m.trig + ' <i>θ</i>)</span>';
      if (r === null) {
        lect.innerHTML = '<span class="fm">tan <i>θ</i></span> n’existe pas (<span class="fm"><i>θ</i> = ' + piFrac(k, true) + '</span>, un multiple impair de <span class="fm"><span class="frac"><span>π</span><span>2</span></span></span>) : ' + expr + ' n’a pas de sens.';
        return;
      }
      var valTrig = m.cle === "sin" ? Math.sin(theta) : m.cle === "cos" ? Math.cos(theta) : Math.tan(theta);
      var relation;
      if (m.cle === "tan") {
        var n = (r - k) / D;
        relation = n === 0 ? "θ" : "θ " + (n > 0 ? "+ " : "− ") + nPi(Math.abs(n));
      } else if (m.cle === "sin") {
        if (mod(r - k, 2 * D) === 0) { var n1 = (r - k) / D; relation = n1 === 0 ? "θ" : "θ " + (n1 > 0 ? "+ " : "− ") + nPi(Math.abs(n1)); }
        else relation = nPi((r + k) / D) + " − θ";
      } else {
        if (mod(r - k, 2 * D) === 0) { var n2 = (r - k) / D; relation = n2 === 0 ? "θ" : "θ " + (n2 > 0 ? "+ " : "− ") + nPi(Math.abs(n2)); }
        else { var n3 = (r + k) / D; relation = n3 === 0 ? "−θ" : nPi(n3) + " − θ"; }
      }
      var dedans = r === k;
      var h = '<span class="fm">' + m.trig + ' <i>θ</i> ' + (Math.abs(valTrig * 1000 - Math.round(valTrig * 1000)) < 1e-6 ? "= " : "≈ ") + fmt(valTrig, 3) + '</span>, et ' + expr + ' = <span class="fm">' + piFrac(r, true) + '</span>' + (r === 0 ? "" : ' ≈ ' + fmt(phi, 2)) + '<br>';
      if (dedans) h += '<span class="ok">θ est dans l’image ' + m.image + '</span> : ' + expr + ' = <span class="fm"><i>θ</i></span>.';
      else h += '<span class="ko">θ n’est pas dans l’image ' + m.image + '</span> : le résultat est l’angle de l’image qui a ' + m.meme + ', ici ' + expr + ' = <span class="fm">' + relation.replace(/θ/g, "<i>θ</i>") + '</span> ≠ <span class="fm"><i>θ</i></span>.';
      lect.innerHTML = h;
    }
  }

  if (!customElements.get("arc-de-trig-widget")) customElements.define("arc-de-trig-widget", ArcDeTrigWidget);
})();
