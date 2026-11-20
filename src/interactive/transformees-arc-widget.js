(function () {
  "use strict";

  /* ================================================================
   * <transformees-arc-widget> — atelier interactif (6e, ch. 1, § 5,
   * reconnaître une fonction cyclométrique). f(x) = c + k·arc(mx + n),
   * arc ∈ {arcsin, arccos, arctan} ; quatre curseurs k, m, n, c. Domaine
   * (vert, sur l'axe des abscisses) et image (violet, sur l'axe des
   * ordonnées) calculés et écrits EXACTEMENT en direct (fractions, π),
   * sens de variation, asymptotes d'arctan. Courbe de référence arc(x) en
   * gris. Fenêtre FIXE (−6,5 à 6,5 et −8,6 à 8,6), choisie pour contenir
   * tous les réglages : |c| + |k|·π ≤ 2 + 2π ≈ 8,28 et |(±1 − n)/m| ≤ 6.
   * ================================================================ */

  var PI = Math.PI;
  var ARCS = [
    { cle: "arcsin", f: Math.asin, borne: true },
    { cle: "arccos", f: Math.acos, borne: true },
    { cle: "arctan", f: Math.atan, borne: false },
  ];
  var K = [-2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2];
  var MM = [-3, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 3];
  var NC = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2];

  var W = 340, H = 340, ML = 30, MR = 14, MT = 12, MB = 22;
  var WIN = { xMin: -6.5, xMax: 6.5, yMin: -8.6, yMax: 8.6 };
  var NS = "http://www.w3.org/2000/svg";

  function fmt(n, dec) {
    if (Math.abs(n) < 0.5 * Math.pow(10, -dec)) n = 0;
    var s = n.toFixed(dec);
    if (s.indexOf(".") >= 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
    return s.replace(".", ",").replace("-", "−");
  }
  function pgcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a || 1; }
  // Rationnel p/q (q > 0) le plus simple égal à v (dénominateur ≤ 24).
  function rat(v) {
    for (var q = 1; q <= 24; q++) { var p = Math.round(v * q); if (Math.abs(p / q - v) < 1e-9) { var g = pgcd(p, q); return [p / g, q / g]; } }
    return null;
  }
  function frac(n, d) { return '<span class="frac"><span>' + n + '</span><span>' + d + '</span></span>'; }
  // Nombre rationnel en HTML : « 3 », « −5/3 » empilé.
  function nombre(v) {
    var r = rat(v);
    if (!r) return fmt(v, 3);
    if (r[1] === 1) return fmt(r[0], 0);
    return (r[0] < 0 ? "−" : "") + frac(Math.abs(r[0]), r[1]);
  }
  // c + a·π (a rationnel), en HTML : « −1 − 3π/4 », « π », « 2 + π ».
  function cPlusAPi(c, a) {
    if (Math.abs(a) < 1e-12) return nombre(c);
    var r = rat(Math.abs(a)), pi;
    if (r[1] === 1) pi = (r[0] === 1 ? "" : r[0]) + "π";
    else pi = frac((r[0] === 1 ? "" : r[0]) + "π", r[1]);
    if (Math.abs(c) < 1e-12) return (a < 0 ? "−" : "") + pi;
    return nombre(c) + (a < 0 ? " − " : " + ") + pi;
  }
  function svgEl(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  var CURSEURS = [
    { id: "k", label: "k — étirement vertical (et symétrie si k < 0)", vals: K, defaut: 5 },
    { id: "m", label: "m — coefficient de x (étirement horizontal)", vals: MM, defaut: 6 },
    { id: "n", label: "n — décalage dans l’argument", vals: NC, defaut: 4 },
    { id: "c", label: "c — translation verticale", vals: NC, defaut: 4 },
  ];

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#182430);}' +
    '*{box-sizing:border-box;}' +
    '.choix{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:10px;}' +
    'button{min-height:44px;min-width:88px;font-family:var(--serif,Georgia,serif);font-size:1rem;padding:6px 12px;border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);background:var(--surface,#fff);color:var(--ink,#182430);cursor:pointer;}' +
    'button.actif{border-color:var(--accent,#b65c1f);background:var(--accent-soft,#f4e3d1);color:var(--accent-ink,#7a3c11);font-weight:700;}' +
    'button:focus-visible,input:focus-visible{outline:2px solid var(--accent,#b65c1f);outline-offset:2px;}' +
    '.figure{display:flex;flex-direction:column;align-items:center;gap:6px;}' +
    'svg{width:100%;max-width:340px;height:auto;background:var(--surface-2,#f7f9fb);border-radius:var(--radius,3px);display:block;}' +
    '.axe{stroke:var(--ink-soft,#51626f);stroke-width:1.3;}' +
    '.fleche{fill:var(--ink-soft,#51626f);}' +
    '.grille{stroke:var(--line-soft,#dfe7ec);stroke-width:1;}' +
    '.tick{stroke:var(--ink-soft,#51626f);stroke-width:1;}' +
    '.tick-label{font-size:10px;font-family:var(--sans,sans-serif);fill:var(--ink-soft,#51626f);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3px;}' +
    '.reference{stroke:var(--ink-faint,#8a97a1);stroke-width:1.5;fill:none;stroke-dasharray:5 4;}' +
    '.courbe{stroke:var(--accent,#b65c1f);stroke-width:2.8;fill:none;}' +
    '.asymptote{stroke:var(--plan,#5b4ea3);stroke-width:1.2;stroke-dasharray:6 4;}' +
    '.domaine{stroke:var(--good,#2f7a4f);stroke-width:6;opacity:0.7;}' +
    '.image{stroke:var(--plan,#5b4ea3);stroke-width:6;opacity:0.7;}' +
    '.b-dom{fill:var(--good,#2f7a4f);}' +
    '.b-img{fill:var(--plan,#5b4ea3);}' +
    '.b-ouv{fill:var(--surface-2,#f7f9fb);stroke:var(--plan,#5b4ea3);stroke-width:2;}' +
    '.extremite{fill:var(--accent,#b65c1f);stroke:var(--surface,#fff);stroke-width:1.2;}' +
    '.fm{font-family:var(--serif,Georgia,serif);white-space:nowrap;}' +
    '.fm i{margin-right:0.06em;}' +
    '.frac{display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;line-height:1.15;font-size:0.88em;}' +
    '.frac>span:first-child{border-bottom:1px solid currentColor;padding:0 3px 1px;}' +
    '.frac>span:last-child{padding:1px 3px 0;}' +
    '.formule{text-align:center;font-size:1.08rem;color:var(--accent-ink,#7a3c11);}' +
    '.legende{font-size:0.82rem;color:var(--ink-soft,#51626f);text-align:center;line-height:1.5;}' +
    '.leg-dom{color:var(--good,#2f7a4f);font-weight:700;}' +
    '.leg-img{color:var(--plan-ink,#443a80);font-weight:700;}' +
    '.curseurs{display:grid;grid-template-columns:1fr;gap:2px 16px;margin-top:10px;}' +
    '@media (min-width:560px){.curseurs{grid-template-columns:1fr 1fr;}}' +
    '.curseur{display:flex;flex-direction:column;gap:2px;}' +
    '.curseur label{font-size:0.82rem;color:var(--ink-soft,#51626f);}' +
    '.curseur-row{display:flex;align-items:center;gap:10px;min-height:44px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#b65c1f);min-height:44px;}' +
    '.curseur-valeur{font-family:var(--serif,Georgia,serif);font-variant-numeric:tabular-nums;font-weight:600;min-width:64px;text-align:right;}' +
    '.stats{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;}' +
    '.stat{flex:1 1 140px;min-width:0;border:1px solid var(--line,#ccd8e0);border-radius:var(--radius,3px);padding:8px 6px;text-align:center;background:var(--surface,#fff);}' +
    '.stat-label{display:block;font-size:0.78rem;color:var(--ink-soft,#51626f);margin-bottom:4px;}' +
    '.stat-value{display:block;font-size:1rem;font-weight:600;line-height:1.5;}' +
    '.stat-dom .stat-value{color:var(--good,#2f7a4f);}' +
    '.stat-img .stat-value{color:var(--plan-ink,#443a80);}' +
    '.approx{display:block;font-size:0.8rem;font-weight:400;color:var(--ink-soft,#51626f);font-family:var(--sans,sans-serif);}' +
    '.lecture{margin-top:10px;border:1px solid var(--line,#ccd8e0);border-radius:var(--radius,3px);background:var(--surface,#fff);padding:10px 12px;font-size:0.93rem;line-height:1.7;}' +
    '.lecture p{margin:0 0 4px;}' +
    '</style>' +
    '<div class="choix" id="arcs"></div>' +
    '<div class="figure">' +
    '<div class="formule fm" id="formule"></div>' +
    '<svg id="svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Graphique de la fonction transformée"></svg>' +
    '<div class="legende" id="legende"></div>' +
    '</div>' +
    '<div class="curseurs" id="curseurs"></div>' +
    '<div class="stats">' +
    '<div class="stat stat-dom"><span class="stat-label">domaine</span><span class="stat-value fm" id="domaine"></span></div>' +
    '<div class="stat stat-img"><span class="stat-label">image</span><span class="stat-value fm" id="image"></span></div>' +
    '</div>' +
    '<div class="lecture" aria-live="polite" id="lecture"></div>';

  class TransformeesArcWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._s = shadow;
      this._svg = shadow.getElementById("svg");
      this._a = 0;
      this._idx = {};
      var self = this;
      var zone = shadow.getElementById("arcs");
      ARCS.forEach(function (a, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.textContent = a.cle;
        b.addEventListener("click", function () { self._a = i; self._rendre(); });
        zone.appendChild(b);
      });
      var zc = shadow.getElementById("curseurs");
      CURSEURS.forEach(function (c) {
        self._idx[c.id] = c.defaut;
        var d = document.createElement("div");
        d.className = "curseur";
        d.innerHTML = '<label for="' + c.id + '">' + c.label + '</label><div class="curseur-row">' +
          '<input type="range" id="' + c.id + '" min="0" max="' + (c.vals.length - 1) + '" step="1" value="' + c.defaut + '">' +
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
      this._s.getElementById("curseurs").addEventListener("input", this._onInput);
      this._rendre();
    }

    disconnectedCallback() {
      this._s.getElementById("curseurs").removeEventListener("input", this._onInput);
    }

    _v(id) { var c = CURSEURS.filter(function (x) { return x.id === id; })[0]; return c.vals[this._idx[id]]; }

    _px(x, y) {
      return [ML + (x - WIN.xMin) / (WIN.xMax - WIN.xMin) * (W - ML - MR), H - MB - (y - WIN.yMin) / (WIN.yMax - WIN.yMin) * (H - MT - MB)];
    }

    _chemin(f, lo, hi) {
      var d = "";
      for (var i = 0; i <= 300; i++) {
        var x = lo + (hi - lo) * i / 300, y = Math.max(WIN.yMin - 2, Math.min(WIN.yMax + 2, f(x)));
        var p = this._px(x, y);
        d += (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1) + " ";
      }
      return d.trim();
    }

    _repere(svg) {
      var self = this;
      var defs = svgEl("defs", {});
      var m = svgEl("marker", { id: "fl", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      m.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(m);
      var clip = svgEl("clipPath", { id: "cadre" });
      clip.appendChild(svgEl("rect", { x: ML, y: MT, width: W - ML - MR, height: H - MT - MB }));
      defs.appendChild(clip);
      svg.appendChild(defs);
      var o = this._px(0, 0);
      var xt = [-6, -4, -2, 2, 4, 6], yt = [-8, -6, -4, -2, 2, 4, 6, 8];
      xt.forEach(function (t) { var p = self._px(t, 0); svg.appendChild(svgEl("line", { x1: p[0].toFixed(1), x2: p[0].toFixed(1), y1: MT, y2: H - MB, class: "grille" })); });
      yt.forEach(function (t) { var p = self._px(0, t); svg.appendChild(svgEl("line", { x1: ML, x2: W - MR, y1: p[1].toFixed(1), y2: p[1].toFixed(1), class: "grille" })); });
      svg.appendChild(svgEl("line", { x1: ML - 4, x2: W - 4, y1: o[1].toFixed(1), y2: o[1].toFixed(1), class: "axe", "marker-end": "url(#fl)" }));
      svg.appendChild(svgEl("line", { x1: o[0].toFixed(1), x2: o[0].toFixed(1), y1: H - 4, y2: 4, class: "axe", "marker-end": "url(#fl)" }));
      xt.forEach(function (t) {
        var p = self._px(t, 0);
        svg.appendChild(svgEl("line", { x1: p[0].toFixed(1), x2: p[0].toFixed(1), y1: (o[1] - 3).toFixed(1), y2: (o[1] + 3).toFixed(1), class: "tick" }));
        var tx = svgEl("text", { x: p[0].toFixed(1), y: (o[1] + 14).toFixed(1), "text-anchor": "middle", class: "tick-label" });
        tx.textContent = fmt(t, 0);
        svg.appendChild(tx);
      });
      yt.forEach(function (t) {
        var p = self._px(0, t);
        svg.appendChild(svgEl("line", { x1: (o[0] - 3).toFixed(1), x2: (o[0] + 3).toFixed(1), y1: p[1].toFixed(1), y2: p[1].toFixed(1), class: "tick" }));
        var tx = svgEl("text", { x: (o[0] - 5).toFixed(1), y: (p[1] + 3.5).toFixed(1), "text-anchor": "end", class: "tick-label" });
        tx.textContent = fmt(t, 0);
        svg.appendChild(tx);
      });
      var nx = svgEl("text", { x: W - 8, y: (o[1] - 7).toFixed(1), "text-anchor": "end", class: "tick-label" });
      nx.textContent = "x";
      svg.appendChild(nx);
      var ny = svgEl("text", { x: (o[0] + 8).toFixed(1), y: 13, class: "tick-label" });
      ny.textContent = "y";
      svg.appendChild(ny);
    }

    _rendre() {
      var A = ARCS[this._a], self = this;
      var k = this._v("k"), m = this._v("m"), n = this._v("n"), c = this._v("c");
      // Argument borné à [−1 ; 1] pour arcsin / arccos : aux bornes du domaine, un arrondi (1,0000000002) donnerait NaN.
      var f = function (x) { var u = m * x + n; return c + k * A.f(A.borne ? Math.max(-1, Math.min(1, u)) : u); };
      var svg = this._svg;
      svg.innerHTML = "";
      this._repere(svg);
      var g = svgEl("g", { "clip-path": "url(#cadre)" });
      svg.appendChild(g);

      // Domaine : −1 ≤ mx + n ≤ 1 (arcsin, arccos) ; ℝ pour arctan.
      var lo, hi;
      if (A.borne) { var u = (-1 - n) / m, v = (1 - n) / m; lo = Math.min(u, v); hi = Math.max(u, v); }
      else { lo = WIN.xMin; hi = WIN.xMax; }
      // Image : c + k·[bornes de arc].
      var a0 = A.cle === "arccos" ? 0 : -PI / 2, a1 = A.cle === "arccos" ? PI : PI / 2;
      var y0 = Math.min(c + k * a0, c + k * a1), y1 = Math.max(c + k * a0, c + k * a1);

      // Référence arc(x), puis asymptotes, courbe, domaine et image.
      g.appendChild(svgEl("path", { d: this._chemin(A.f, A.borne ? -1 : WIN.xMin, A.borne ? 1 : WIN.xMax), class: "reference" }));
      if (!A.borne) [y0, y1].forEach(function (y) {
        var p = self._px(0, y);
        g.appendChild(svgEl("line", { x1: ML, x2: W - MR, y1: p[1].toFixed(1), y2: p[1].toFixed(1), class: "asymptote" }));
      });
      g.appendChild(svgEl("path", { d: this._chemin(f, lo, hi), class: "courbe" }));
      var o = this._px(0, 0);
      var d0 = this._px(lo, 0), d1 = this._px(hi, 0);
      g.appendChild(svgEl("line", { x1: d0[0].toFixed(1), x2: d1[0].toFixed(1), y1: o[1].toFixed(1), y2: o[1].toFixed(1), class: "domaine" }));
      var i0 = this._px(0, y0), i1 = this._px(0, y1);
      g.appendChild(svgEl("line", { x1: o[0].toFixed(1), x2: o[0].toFixed(1), y1: i0[1].toFixed(1), y2: i1[1].toFixed(1), class: "image" }));
      if (A.borne) {
        [lo, hi].forEach(function (x) {
          var p = self._px(x, 0), q = self._px(x, f(x));
          g.appendChild(svgEl("circle", { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: 4, class: "b-dom" }));
          g.appendChild(svgEl("circle", { cx: q[0].toFixed(1), cy: q[1].toFixed(1), r: 4, class: "extremite" }));
        });
      }
      [i0, i1].forEach(function (p) {
        g.appendChild(svgEl("circle", { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: 4, class: A.borne ? "b-img" : "b-ouv" }));
      });
      svg.querySelectorAll("text.tick-label").forEach(function (t) { svg.appendChild(t); });

      // Boutons et curseurs.
      var bs = this._s.getElementById("arcs").children;
      for (var j = 0; j < bs.length; j++) { bs[j].classList.toggle("actif", j === this._a); bs[j].setAttribute("aria-pressed", j === this._a ? "true" : "false"); }
      CURSEURS.forEach(function (cu) { self._s.getElementById(cu.id + "-valeur").innerHTML = '<i>' + cu.id + '</i> = ' + fmt(self._v(cu.id), 2); });

      // Formule.
      var mx = m === 1 ? "<i>x</i>" : m === -1 ? "−<i>x</i>" : fmt(m, 2) + "<i>x</i>";
      var arg = mx + (n === 0 ? "" : (n > 0 ? " + " : " − ") + fmt(Math.abs(n), 2));
      var ka = Math.abs(k), partie = (ka === 1 ? "" : fmt(ka, 2) + " ") + A.cle + "(" + arg + ")";
      var expr = c === 0 ? (k < 0 ? "−" : "") + partie : fmt(c, 2) + (k < 0 ? " − " : " + ") + partie;
      this._s.getElementById("formule").innerHTML = "<i>f</i>(<i>x</i>) = " + expr;
      this._s.getElementById("legende").innerHTML = 'gris pointillé : <span class="fm">' + A.cle + '(<i>x</i>)</span> de référence · <span class="leg-dom">vert : domaine</span> · <span class="leg-img">violet : image</span>' + (A.borne ? "" : " et asymptotes");

      // Domaine et image, exacts puis approchés.
      var dom, img, approxD, approxI;
      if (A.borne) {
        dom = "[" + nombre(lo) + " ; " + nombre(hi) + "]";
        approxD = rat(lo) && rat(lo)[1] === 1 && rat(hi)[1] === 1 ? "" : "≈ [" + fmt(lo, 2) + " ; " + fmt(hi, 2) + "]";
      } else { dom = "ℝ"; approxD = ""; }
      var demi = A.cle === "arccos" ? Math.abs(k) : Math.abs(k) / 2;
      var bas, haut;
      if (A.cle === "arccos") { bas = k > 0 ? cPlusAPi(c, 0) : cPlusAPi(c, k); haut = k > 0 ? cPlusAPi(c, k) : cPlusAPi(c, 0); }
      else { bas = cPlusAPi(c, -demi); haut = cPlusAPi(c, demi); }
      img = (A.borne ? "[" : "]") + bas + " ; " + haut + (A.borne ? "]" : "[");
      approxI = "≈ " + (A.borne ? "[" : "]") + fmt(y0, 2) + " ; " + fmt(y1, 2) + (A.borne ? "]" : "[");
      this._s.getElementById("domaine").innerHTML = dom + (approxD ? '<span class="approx">' + approxD + "</span>" : "");
      this._s.getElementById("image").innerHTML = img + '<span class="approx">' + approxI + "</span>";

      var croissante = A.cle === "arccos" ? k * m < 0 : k * m > 0;
      var h = "";
      if (A.borne) {
        h += '<p><b>Domaine.</b> <span class="fm">−1 ≤ ' + arg + " ≤ 1</span>" + (m < 0 ? " ; comme <i>m</i> < 0, diviser par <i>m</i> change le sens des inégalités" : "") +
          ' : <span class="fm"><i>x</i> ∈ ' + dom + "</span>.</p>";
      } else h += "<p><b>Domaine.</b> arctan est définie sur ℝ : aucune condition.</p>";
      h += '<p><b>Image.</b> ' + A.cle + " prend ses valeurs dans <span class=\"fm\">" + (A.cle === "arccos" ? "[0 ; π]" : A.borne ? "[−π/2 ; π/2]" : "]−π/2 ; π/2[") + "</span> ; multiplier par <i>k</i> = " + fmt(k, 2) +
        (k < 0 ? " (<i>k</i> < 0 : les bornes s’échangent)" : "") + " puis ajouter <i>c</i> = " + fmt(c, 2) + " donne <span class=\"fm\">" + img + "</span>.</p>";
      h += "<p><b>Variations.</b> <i>f</i> est <b>" + (croissante ? "croissante" : "décroissante") + "</b> : " + A.cle + " est " + (A.cle === "arccos" ? "décroissante" : "croissante") +
        ", et le signe de <i>k</i>·<i>m</i> = " + fmt(k * m, 2) + (croissante === (A.cle !== "arccos") ? " la garde" : " l’inverse") + ".</p>";
      if (!A.borne) h += '<p><b>Asymptotes horizontales.</b> <span class="fm"><i>y</i> = ' + bas + '</span> et <span class="fm"><i>y</i> = ' + haut + "</span>.</p>";
      this._s.getElementById("lecture").innerHTML = h;
    }
  }

  if (!customElements.get("transformees-arc-widget")) customElements.define("transformees-arc-widget", TransformeesArcWidget);
})();
