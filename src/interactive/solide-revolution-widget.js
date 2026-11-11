(function () {
  "use strict";

  /* ================================================================
   * <solide-revolution-widget> — atelier interactif (6e ch. 4, § 5) :
   * la région sous f (ou entre f et g) sur [a ; b] tourne autour de l'axe
   * des abscisses. Un curseur d'angle « balaie » le solide (méridiens et
   * parallèles dessinés jusqu'à l'angle courant, en projection oblique :
   * un cercle de rayon r devient une ellipse de demi-axes SQUASH·r et r,
   * comme le composant SolidRevolution.tsx), un curseur x montre la
   * tranche (disque ou rondelle) et son aire. Fenêtre FIXE commune aux
   * quatre préréglages. Web Component (Shadow DOM).
   * ================================================================ */

  var LARGEUR = 420, HAUTEUR = 300;
  var X_MIN = -3.6, X_MAX = 4.6;      // fenêtre fixe en x
  var MARGE_G = 30, MARGE_D = 40;
  var AXE_Y = 150;                    // ordonnée (px) de l'axe de rotation
  var ECHELLE_R = 38;                 // px par unité de rayon
  var SQUASH = 0.34;

  var PRESETS = [
    {
      id: "cone", label: "Cône",
      a: 0, b: 3, x0: 1.5,
      f: function (x) { return x; }, g: null,
      fTexte: "f(x) = x", bornes: "[0 ; 3]",
      volume: 9 * Math.PI, volumeTexte: "9π",
      calcul: "V = π ∫₀³ x² dx = π [x³/3]₀³ = 9π",
      remarque: "C'est un cône de rayon 3 et de hauteur 3 : on retrouve πr²h/3 = π × 9 × 3 / 3 = 9π."
    },
    {
      id: "paraboloide", label: "Paraboloïde",
      a: 0, b: 4, x0: 2,
      f: function (x) { return Math.sqrt(Math.max(0, x)); }, g: null,
      fTexte: "f(x) = √x", bornes: "[0 ; 4]",
      volume: 8 * Math.PI, volumeTexte: "8π",
      calcul: "V = π ∫₀⁴ (√x)² dx = π ∫₀⁴ x dx = π [x²/2]₀⁴ = 8π",
      remarque: "Le carré fait disparaître la racine : (√x)² = x. C'est la forme d'une antenne parabolique."
    },
    {
      id: "boule", label: "Boule",
      a: -3, b: 3, x0: 1,
      f: function (x) { return Math.sqrt(Math.max(0, 9 - x * x)); }, g: null,
      fTexte: "f(x) = √(9 − x²)", bornes: "[−3 ; 3]",
      volume: 36 * Math.PI, volumeTexte: "36π",
      calcul: "V = π ∫₋₃³ (9 − x²) dx = π [9x − x³/3]₋₃³ = π (18 + 18) = 36π",
      remarque: "Le demi-disque engendre une boule de rayon 3 : on retrouve 4/3 × π × 3³ = 36π."
    },
    {
      id: "rondelle", label: "Rondelle",
      a: 0, b: 3, x0: 1,
      f: function () { return 3; }, g: function (x) { return x; },
      fTexte: "f(x) = 3 et g(x) = x", bornes: "[0 ; 3]",
      volume: 18 * Math.PI, volumeTexte: "18π",
      calcul: "V = π ∫₀³ (3² − x²) dx = π [9x − x³/3]₀³ = π (27 − 9) = 18π",
      remarque: "On soustrait les CARRÉS des rayons, pas le carré de la différence : c'est l'exemple du cours."
    }
  ];

  var DEFAUT_PRESET = 0;
  var DEFAUT_ANGLE = 300;

  function formatNombreFr(n, decimales) {
    var facteur = Math.pow(10, decimales);
    var arrondi = Math.round(n * facteur) / facteur;
    var s = arrondi.toFixed(decimales);
    if (decimales > 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
    return s.replace(".", ",").replace("-", "−");
  }

  function svgEl(tag, attrs) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var key in attrs) el.setAttribute(key, attrs[key]);
    return el;
  }

  function px(x) { return MARGE_G + (x - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - MARGE_G - MARGE_D); }

  /** Point (x ; rayon r ; angle θ) du solide → pixel, en projection oblique. */
  function proj(x, r, theta) {
    return [px(x) + SQUASH * r * ECHELLE_R * Math.sin(theta), AXE_Y - r * ECHELLE_R * Math.cos(theta)];
  }

  function chemin(points) {
    var d = "";
    for (var i = 0; i < points.length; i++) d += (i === 0 ? "M" : "L") + points[i][0].toFixed(1) + " " + points[i][1].toFixed(1) + " ";
    return d.trim();
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
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.region{fill:var(--accent,#a8471f);fill-opacity:0.35;stroke:var(--accent,#a8471f);stroke-width:2;}' +
    '.region-int{stroke:var(--plan,#5b4ea3);stroke-width:2;fill:none;}' +
    '.patch{fill:var(--accent,#a8471f);fill-opacity:0.07;stroke:none;}' +
    '.meridien{stroke:var(--accent,#a8471f);stroke-opacity:0.45;stroke-width:1;fill:none;}' +
    '.meridien-int{stroke:var(--plan,#5b4ea3);stroke-opacity:0.5;stroke-width:1;fill:none;stroke-dasharray:3 3;}' +
    '.parallele{stroke:var(--ink-faint,#9c9083);stroke-width:1;fill:none;stroke-dasharray:3 3;}' +
    '.tranche{fill:var(--good,#2f7a4f);fill-opacity:0.35;stroke:var(--good,#2f7a4f);stroke-width:2;fill-rule:evenodd;}' +
    '.tranche-label{font-size:12px;font-weight:700;fill:var(--good,#2f7a4f);font-family:var(--sans,sans-serif);}' +
    '.bilan{border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);background:var(--surface,#fff);padding:10px 12px;margin:0 0 12px;color:var(--ink,#241f1a);font-size:0.92rem;line-height:1.5;}' +
    '.bilan p{margin:0 0 6px;}' +
    '.bilan p:last-child{margin-bottom:0;}' +
    '.bilan .vol{font-weight:700;font-variant-numeric:tabular-nums;}' +
    '.bilan .rem{color:var(--ink-soft,#6b6055);}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;min-height:44px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-width:0;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:48px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{min-height:44px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '</style>' +
    '<div class="presets" id="presets"></div>' +
    '<p class="formule" id="formule"></p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Solide de révolution"></svg></div>' +
    '<div class="bilan" id="bilan"></div>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="angle">Angle de rotation</label><div class="curseur-row">' +
    '<input type="range" id="angle" min="0" max="360" step="5" value="' + DEFAUT_ANGLE + '">' +
    '<span class="curseur-valeur" id="angle-valeur"></span></div></div>' +
    '<div class="curseur"><label for="x">x — position de la tranche</label><div class="curseur-row">' +
    '<input type="range" id="x" min="0" max="3" step="0.1" value="1.5">' +
    '<span class="curseur-valeur" id="x-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class SolideRevolutionWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._svg = shadow.getElementById("svg");
      this._formule = shadow.getElementById("formule");
      this._bilan = shadow.getElementById("bilan");
      this._inputAngle = shadow.getElementById("angle");
      this._valAngle = shadow.getElementById("angle-valeur");
      this._inputX = shadow.getElementById("x");
      this._valX = shadow.getElementById("x-valeur");
      this._reset = shadow.getElementById("reset");
      this._presetsZone = shadow.getElementById("presets");
      this._boutons = [];
      var self = this;
      PRESETS.forEach(function (p, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.textContent = p.label;
        b.addEventListener("click", function () { self._choisir(i); });
        self._presetsZone.appendChild(b);
        self._boutons.push(b);
      });
      this._inputAngle.addEventListener("input", function () { self._angle = parseFloat(self._inputAngle.value); self._rendre(); });
      this._inputX.addEventListener("input", function () { self._x = parseFloat(self._inputX.value); self._rendre(); });
      this._reset.addEventListener("click", function () { self._choisir(DEFAUT_PRESET); self._angle = DEFAUT_ANGLE; self._inputAngle.value = String(DEFAUT_ANGLE); self._rendre(); });
      this._angle = DEFAUT_ANGLE;
      this._choisir(DEFAUT_PRESET);
    }

    _choisir(i) {
      this._iPreset = i;
      var p = PRESETS[i];
      this._x = p.x0;
      this._inputX.min = String(p.a);
      this._inputX.max = String(p.b);
      this._inputX.value = String(p.x0);
      this._boutons.forEach(function (b, k) { b.setAttribute("aria-pressed", k === i ? "true" : "false"); });
      this._rendre();
    }

    _rendre() {
      var p = PRESETS[this._iPreset];
      var theta = this._angle * Math.PI / 180;
      var svg = this._svg;
      svg.innerHTML = "";

      var defs = svgEl("defs", {});
      var m = svgEl("marker", { id: "fl", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      m.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(m);
      svg.appendChild(defs);

      var N = 48;
      var xs = [];
      for (var i = 0; i <= N; i++) xs.push(p.a + (p.b - p.a) * i / N);

      // 1) surface balayée : bandes entre méridiens successifs, de 0 à l'angle courant
      var pas = 15 * Math.PI / 180;
      var angles = [];
      for (var t = 0; t < theta - 1e-9; t += pas) angles.push(t);
      if (theta > 0) angles.push(theta);
      var self = this;
      function profil(fn, ang) { return xs.map(function (x) { return proj(x, fn(x), ang); }); }
      for (var k = 0; k + 1 < angles.length; k++) {
        var p1 = profil(p.f, angles[k]);
        var p2 = profil(p.f, angles[k + 1]).reverse();
        svg.appendChild(svgEl("path", { d: chemin(p1.concat(p2)) + " Z", class: "patch" }));
      }
      // méridiens extérieurs (et intérieurs pour la rondelle)
      angles.forEach(function (ang, idx) {
        if (idx === 0) return;
        svg.appendChild(svgEl("path", { d: chemin(profil(p.f, ang)), class: "meridien" }));
        if (p.g) svg.appendChild(svgEl("path", { d: chemin(profil(p.g, ang)), class: "meridien-int" }));
      });
      // parallèles : arcs d'ellipse aux bornes et à quelques abscisses, de 0 à θ
      var nPar = 6;
      for (var j = 0; j <= nPar; j++) {
        var xp = p.a + (p.b - p.a) * j / nPar;
        [p.f, p.g].forEach(function (fn) {
          if (!fn) return;
          var r = fn(xp);
          if (r < 1e-6) return;
          var pts = [];
          var nArc = Math.max(2, Math.ceil(theta / (5 * Math.PI / 180)));
          for (var q = 0; q <= nArc; q++) pts.push(proj(xp, r, theta * q / nArc));
          if (pts.length > 1 && theta > 0) svg.appendChild(svgEl("path", { d: chemin(pts), class: "parallele" }));
        });
      }

      // 2) axe des abscisses (axe de rotation)
      svg.appendChild(svgEl("line", { x1: MARGE_G - 10, y1: AXE_Y, x2: LARGEUR - 18, y2: AXE_Y, class: "axe", "marker-end": "url(#fl)" }));
      var ex = svgEl("text", { x: LARGEUR - 14, y: AXE_Y - 6, class: "etiquette" });
      ex.textContent = "x";
      svg.appendChild(ex);
      [p.a, p.b].forEach(function (xb) {
        var tx = svgEl("text", { x: px(xb), y: AXE_Y + 16, class: "etiquette", "text-anchor": "middle" });
        tx.textContent = formatNombreFr(xb, 1);
        svg.appendChild(tx);
      });

      // 3) région plane de départ (angle 0)
      var haut = profil(p.f, 0);
      var bas = p.g ? profil(p.g, 0).reverse() : [proj(p.b, 0, 0), proj(p.a, 0, 0)];
      svg.appendChild(svgEl("path", { d: chemin(haut.concat(bas)) + " Z", class: "region" }));
      if (p.g) svg.appendChild(svgEl("path", { d: chemin(profil(p.g, 0)), class: "region-int" }));

      // 4) tranche en x
      var x0 = this._x;
      var rf = p.f(x0), rg = p.g ? p.g(x0) : 0;
      var cx = px(x0);
      function ellipse(r) {
        var rx = SQUASH * r * ECHELLE_R, ry = r * ECHELLE_R;
        return "M" + (cx - rx).toFixed(1) + " " + AXE_Y + " a" + rx.toFixed(1) + " " + ry.toFixed(1) + " 0 1 0 " + (2 * rx).toFixed(1) + " 0 a" + rx.toFixed(1) + " " + ry.toFixed(1) + " 0 1 0 " + (-2 * rx).toFixed(1) + " 0 Z";
      }
      if (rf > 1e-6) {
        var d = ellipse(rf);
        if (p.g && rg > 1e-6) d += " " + ellipse(rg);
        svg.appendChild(svgEl("path", { d: d, class: "tranche" }));
      }
      var lab = svgEl("text", { x: cx, y: AXE_Y - rf * ECHELLE_R - 8, class: "tranche-label", "text-anchor": "middle" });
      lab.textContent = p.g ? "rondelle" : "disque";
      svg.appendChild(lab);

      // textes
      this._formule.textContent = p.fTexte + " sur " + p.bornes + ", rotation autour de l'axe des abscisses";
      this._valAngle.textContent = Math.round(this._angle) + "°";
      this._valX.textContent = formatNombreFr(x0, 1);
      var aire, aireTexte;
      if (p.g) {
        aire = Math.PI * (rf * rf - rg * rg);
        aireTexte = "π (f(x)² − g(x)²) = π (" + formatNombreFr(rf * rf, 2) + " − " + formatNombreFr(rg * rg, 2) + ") ≈ " + formatNombreFr(aire, 2);
      } else {
        aire = Math.PI * rf * rf;
        aireTexte = "π f(x)² = π × " + formatNombreFr(rf * rf, 2) + " ≈ " + formatNombreFr(aire, 2);
      }
      this._bilan.innerHTML = "";
      var l1 = document.createElement("p");
      l1.textContent = "Tranche en x = " + formatNombreFr(x0, 1) + " : " + (p.g ? "rondelle de rayons " + formatNombreFr(rf, 2) + " et " + formatNombreFr(rg, 2) : "disque de rayon " + formatNombreFr(rf, 2)) + ", d'aire " + aireTexte + ".";
      var l2 = document.createElement("p");
      l2.className = "vol";
      l2.textContent = p.calcul + " ≈ " + formatNombreFr(p.volume, 2);
      var l3 = document.createElement("p");
      l3.className = "rem";
      l3.textContent = p.remarque;
      this._bilan.appendChild(l1);
      this._bilan.appendChild(l2);
      this._bilan.appendChild(l3);
    }
  }

  if (!customElements.get("solide-revolution-widget")) {
    customElements.define("solide-revolution-widget", SolideRevolutionWidget);
  }
})();
