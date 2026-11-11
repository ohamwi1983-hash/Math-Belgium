(function () {
  "use strict";

  /* ================================================================
   * <longueur-polygonale-widget> — atelier interactif (6e ch. 4, § 6) :
   * l'arc de courbe sur [a ; b] est approché par n segments (n de 1 à
   * 64). Un segment est mis en évidence avec son triangle dx, dy et
   * ds = √(dx² + dy²) (Pythagore, comme la démonstration du cours). La
   * somme des segments est comparée à la longueur L (exacte quand elle
   * existe, sinon valeur de référence numérique). Une corde est toujours
   * plus courte que l'arc : la somme sous-estime L et s'en rapproche.
   * Fenêtre fixe par préréglage. Web Component (Shadow DOM).
   * ================================================================ */

  var LARGEUR = 420, HAUTEUR = 300;
  var MG = 40, MD = 24, MH = 22, MB = 34;

  function sh(x) { return (Math.exp(x) - Math.exp(-x)) / 2; }
  function ch(x) { return (Math.exp(x) + Math.exp(-x)) / 2; }

  var PRESETS = [
    {
      id: "cours", bouton: "Exemple du cours",
      a: 0, b: 3, xMin: -0.3, xMax: 3.4, yMin: -0.4, yMax: 3.8,
      f: function (x) { return (2 / 3) * Math.pow(Math.max(0, x), 1.5); },
      fTexte: "y = (2/3)·x³ᐟ² sur [0 ; 3]",
      L: 14 / 3, LTexte: "L = 14/3 ≈ 4,6667 (valeur exacte)",
      ticksX: [1, 2, 3], ticksY: [1, 2, 3]
    },
    {
      id: "ch", bouton: "y = ch(x)",
      a: 0, b: 1.5, xMin: -0.2, xMax: 1.75, yMin: -0.2, yMax: 2.6,
      f: ch,
      fTexte: "y = ch(x) sur [0 ; 1,5]",
      L: sh(1.5), LTexte: "L = sh(1,5) ≈ 2,1293 (valeur exacte)",
      ticksX: [0.5, 1, 1.5], ticksY: [1, 2]
    },
    {
      id: "parabole", bouton: "y = x²",
      a: 0, b: 1, xMin: -0.12, xMax: 1.18, yMin: -0.12, yMax: 1.2,
      f: function (x) { return x * x; },
      fTexte: "y = x² sur [0 ; 1]",
      L: (2 * Math.sqrt(5) + Math.log(2 + Math.sqrt(5))) / 4,
      LTexte: "L ≈ 1,4789 (pas de primitive au programme : valeur de référence obtenue numériquement)",
      ticksX: [0.5, 1], ticksY: [0.5, 1]
    },
    {
      id: "cercle", bouton: "Demi-cercle",
      a: -1, b: 1, xMin: -1.25, xMax: 1.25, yMin: -0.15, yMax: 1.3,
      f: function (x) { return Math.sqrt(Math.max(0, 1 - x * x)); },
      fTexte: "y = √(1 − x²) sur [−1 ; 1] (demi-cercle de rayon 1)",
      L: Math.PI, LTexte: "L = π ≈ 3,1416 (valeur exacte : la moitié de 2π)",
      ticksX: [-1, 1], ticksY: [1]
    }
  ];

  var DEFAUT_N = 4;

  function formatNombreFr(n, decimales) {
    var facteur = Math.pow(10, decimales);
    var arrondi = Math.round(n * facteur) / facteur;
    if (Math.abs(arrondi) < 1e-12) arrondi = 0;
    return arrondi.toFixed(decimales).replace(".", ",").replace("-", "−");
  }

  function svgEl(tag, attrs) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var key in attrs) el.setAttribute(key, attrs[key]);
    return el;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.presets{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-bottom:10px;}' +
    '.presets button{min-height:44px;padding:8px 12px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);font:inherit;font-size:0.9rem;cursor:pointer;}' +
    '.presets button[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);border-color:var(--accent,#a8471f);color:var(--accent-ink,#7a3212);font-weight:700;}' +
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.02rem;font-weight:600;color:var(--ink,#241f1a);margin:0 0 10px;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:10px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.grad{stroke:var(--ink-faint,#9c9083);stroke-width:1;}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.courbe{stroke:var(--ink-faint,#9c9083);stroke-width:5;stroke-opacity:0.45;fill:none;stroke-linecap:round;}' +
    '.segment{stroke:var(--accent,#a8471f);stroke-width:2;fill:none;}' +
    '.sommet{fill:var(--accent,#a8471f);}' +
    '.seg-vif{stroke:var(--plan,#5b4ea3);stroke-width:3.5;}' +
    '.cote{stroke:var(--good,#2f7a4f);stroke-width:1.8;stroke-dasharray:4 3;}' +
    '.lab-cote{font-size:12px;font-weight:700;fill:var(--good,#2f7a4f);font-family:var(--sans,sans-serif);}' +
    '.lab-ds{font-size:12px;font-weight:700;fill:var(--plan,#5b4ea3);font-family:var(--sans,sans-serif);}' +
    '.stats{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin:0 0 10px;}' +
    '.stat{flex:1 1 100px;min-width:0;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:8px 6px;text-align:center;background:var(--surface,#fff);}' +
    '.stat-label{display:block;font-size:0.78rem;color:var(--ink-faint,#9c9083);margin-bottom:4px;}' +
    '.stat-value{display:block;font-variant-numeric:tabular-nums;font-size:1rem;font-weight:700;color:var(--ink,#241f1a);}' +
    '.info{font-size:0.9rem;color:var(--ink,#241f1a);margin:0 0 12px;line-height:1.5;}' +
    '.info p{margin:0 0 6px;}' +
    '.info .ref{color:var(--ink-soft,#6b6055);}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;min-height:44px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-width:0;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:40px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{min-height:44px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '</style>' +
    '<div class="presets" id="presets"></div>' +
    '<p class="formule" id="formule"></p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Arc approché par des segments"></svg></div>' +
    '<div class="stats">' +
    '<div class="stat"><span class="stat-label">somme des n segments</span><span class="stat-value" id="somme"></span></div>' +
    '<div class="stat"><span class="stat-label">longueur L</span><span class="stat-value" id="L"></span></div>' +
    '<div class="stat"><span class="stat-label">écart</span><span class="stat-value" id="ecart"></span></div>' +
    '</div>' +
    '<div class="info" id="info"></div>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="n">n — nombre de segments</label><div class="curseur-row">' +
    '<input type="range" id="n" min="1" max="64" step="1" value="' + DEFAUT_N + '">' +
    '<span class="curseur-valeur" id="n-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class LongueurPolygonaleWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      var self = this;
      this._svg = shadow.getElementById("svg");
      this._formule = shadow.getElementById("formule");
      this._somme = shadow.getElementById("somme");
      this._L = shadow.getElementById("L");
      this._ecart = shadow.getElementById("ecart");
      this._info = shadow.getElementById("info");
      this._inputN = shadow.getElementById("n");
      this._valN = shadow.getElementById("n-valeur");
      this._boutons = [];
      var zone = shadow.getElementById("presets");
      PRESETS.forEach(function (p, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.textContent = p.bouton;
        b.addEventListener("click", function () { self._choisir(i); });
        zone.appendChild(b);
        self._boutons.push(b);
      });
      this._inputN.addEventListener("input", function () { self._n = parseInt(self._inputN.value, 10); self._rendre(); });
      shadow.getElementById("reset").addEventListener("click", function () { self._n = DEFAUT_N; self._inputN.value = String(DEFAUT_N); self._choisir(0); });
      this._n = DEFAUT_N;
      this._choisir(0);
    }

    _choisir(i) {
      this._i = i;
      this._boutons.forEach(function (b, k) { b.setAttribute("aria-pressed", k === i ? "true" : "false"); });
      this._rendre();
    }

    _rendre() {
      var p = PRESETS[this._i];
      var n = this._n;
      var svg = this._svg;
      svg.innerHTML = "";
      // repère orthonormé : même échelle sur les deux axes, dans la fenêtre fixe
      var largeurUtile = LARGEUR - MG - MD, hauteurUtile = HAUTEUR - MH - MB;
      var echelle = Math.min(largeurUtile / (p.xMax - p.xMin), hauteurUtile / (p.yMax - p.yMin));
      var ox = MG + (largeurUtile - echelle * (p.xMax - p.xMin)) / 2;
      var oy = MH + (hauteurUtile - echelle * (p.yMax - p.yMin)) / 2;
      function X(x) { return ox + (x - p.xMin) * echelle; }
      function Y(y) { return oy + (p.yMax - y) * echelle; }

      var defs = svgEl("defs", {});
      var m = svgEl("marker", { id: "flp", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      m.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(m);
      svg.appendChild(defs);
      svg.appendChild(svgEl("line", { x1: X(p.xMin), y1: Y(0), x2: X(p.xMax), y2: Y(0), class: "axe", "marker-end": "url(#flp)" }));
      svg.appendChild(svgEl("line", { x1: X(0), y1: Y(p.yMin), x2: X(0), y2: Y(p.yMax), class: "axe", "marker-end": "url(#flp)" }));
      var lx = svgEl("text", { x: X(p.xMax) - 2, y: Y(0) - 7, class: "etiquette", "text-anchor": "end" });
      lx.textContent = "x";
      svg.appendChild(lx);
      var ly = svgEl("text", { x: X(0) + 7, y: Y(p.yMax) + 12, class: "etiquette" });
      ly.textContent = "y";
      svg.appendChild(ly);
      p.ticksX.forEach(function (t) {
        svg.appendChild(svgEl("line", { x1: X(t), y1: Y(0) - 3, x2: X(t), y2: Y(0) + 3, class: "grad" }));
        var l = svgEl("text", { x: X(t), y: Y(0) + 15, class: "etiquette", "text-anchor": "middle" });
        l.textContent = formatNombreFr(t, t % 1 === 0 ? 0 : 1);
        svg.appendChild(l);
      });
      p.ticksY.forEach(function (t) {
        svg.appendChild(svgEl("line", { x1: X(0) - 3, y1: Y(t), x2: X(0) + 3, y2: Y(t), class: "grad" }));
        var l = svgEl("text", { x: X(0) - 6, y: Y(t) + 4, class: "etiquette", "text-anchor": "end" });
        l.textContent = formatNombreFr(t, t % 1 === 0 ? 0 : 1);
        svg.appendChild(l);
      });

      // courbe (trait large et pâle)
      var d = "";
      for (var i = 0; i <= 300; i++) {
        var xx = p.a + (p.b - p.a) * i / 300;
        d += (i === 0 ? "M" : "L") + X(xx).toFixed(1) + " " + Y(p.f(xx)).toFixed(1) + " ";
      }
      svg.appendChild(svgEl("path", { d: d.trim(), class: "courbe" }));

      // segments
      var somme = 0, pts = [];
      for (var k = 0; k <= n; k++) { var xk = p.a + (p.b - p.a) * k / n; pts.push([xk, p.f(xk)]); }
      var ds = "";
      for (var j = 0; j < n; j++) {
        somme += Math.hypot(pts[j + 1][0] - pts[j][0], pts[j + 1][1] - pts[j][1]);
      }
      pts.forEach(function (q, idx) { ds += (idx === 0 ? "M" : "L") + X(q[0]).toFixed(1) + " " + Y(q[1]).toFixed(1) + " "; });
      svg.appendChild(svgEl("path", { d: ds.trim(), class: "segment" }));
      if (n <= 32) pts.forEach(function (q) { svg.appendChild(svgEl("circle", { cx: X(q[0]), cy: Y(q[1]), r: 2.6, class: "sommet" })); });

      // segment mis en évidence : celui du milieu, avec son triangle dx, dy, ds
      var s = Math.floor((n - 1) / 2);
      var P = pts[s], Q = pts[s + 1];
      var dxv = Q[0] - P[0], dyv = Q[1] - P[1];
      var coin = [Q[0], P[1]];
      svg.appendChild(svgEl("line", { x1: X(P[0]), y1: Y(P[1]), x2: X(coin[0]), y2: Y(coin[1]), class: "cote" }));
      svg.appendChild(svgEl("line", { x1: X(coin[0]), y1: Y(coin[1]), x2: X(Q[0]), y2: Y(Q[1]), class: "cote" }));
      svg.appendChild(svgEl("line", { x1: X(P[0]), y1: Y(P[1]), x2: X(Q[0]), y2: Y(Q[1]), class: "seg-vif" }));
      var grand = Math.abs(X(Q[0]) - X(P[0])) > 26;
      if (grand) {
        var ldx = svgEl("text", { x: (X(P[0]) + X(coin[0])) / 2, y: Y(P[1]) + (dyv >= 0 ? 14 : -6), class: "lab-cote", "text-anchor": "middle" });
        ldx.textContent = "dx";
        svg.appendChild(ldx);
        var ldy = svgEl("text", { x: X(coin[0]) + 5, y: (Y(coin[1]) + Y(Q[1])) / 2 + 4, class: "lab-cote" });
        ldy.textContent = "dy";
        svg.appendChild(ldy);
        var lds = svgEl("text", { x: (X(P[0]) + X(Q[0])) / 2 - 8, y: (Y(P[1]) + Y(Q[1])) / 2 - 6, class: "lab-ds", "text-anchor": "end" });
        lds.textContent = "ds";
        svg.appendChild(lds);
      }

      // textes
      this._formule.textContent = p.fTexte;
      this._valN.textContent = String(n);
      this._somme.textContent = formatNombreFr(somme, 4);
      this._L.textContent = formatNombreFr(p.L, 4);
      this._ecart.textContent = formatNombreFr(p.L - somme, 4);
      this._info.innerHTML = "";
      var l1 = document.createElement("p");
      l1.textContent = "Segment en violet : dx = " + formatNombreFr(dxv, 3) + ", dy = " + formatNombreFr(dyv, 3) +
        ", donc ds = √(dx² + dy²) ≈ " + formatNombreFr(Math.hypot(dxv, dyv), 3) + " (Pythagore).";
      var l2 = document.createElement("p");
      l2.textContent = "Une corde est toujours plus courte que l'arc qu'elle remplace : la somme reste sous L, et s'en rapproche quand n grandit.";
      var l3 = document.createElement("p");
      l3.className = "ref";
      l3.textContent = p.LTexte + ".";
      this._info.appendChild(l1);
      this._info.appendChild(l2);
      this._info.appendChild(l3);
    }
  }

  if (!customElements.get("longueur-polygonale-widget")) {
    customElements.define("longueur-polygonale-widget", LongueurPolygonaleWidget);
  }
})();
