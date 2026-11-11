(function () {
  "use strict";

  /* ================================================================
   * <angle-d-or-widget> — atelier interactif (5e, chapitre 3 « Suites »,
   * section « Problèmes classiques », application du tournesol) : N
   * graines placées comme sur un capitule — la graine k à l'angle k·θ et
   * à la distance c·√k du centre (même construction que l'illustration
   * du chapitre). L'élève fait varier θ :
   *   - θ = p/q de tour (90°, 120°, 144°…) : après q graines, on retombe
   *     exactement dans la même direction → q rayons rectilignes, et de
   *     grands vides entre eux ;
   *   - θ proche d'une fraction p/q : q bras légèrement courbés, toujours
   *     des vides ;
   *   - θ = angle d'or ≈ 137,508° = 360° × (1 − 1/φ) : remplissage
   *     régulier, sans vide, et des spirales dont le nombre est un terme
   *     de la suite de Fibonacci (21, 34, 55…).
   * Option « Colorer les spirales » : couleur selon le reste de k dans la
   * division par 13, 21, 34 ou 55 — une famille de spirales apparaît.
   * Fenêtre FIXE : l'échelle c ne dépend pas de N. Web Component
   * (Shadow DOM).
   * ================================================================ */

  var NS = "http://www.w3.org/2000/svg";
  var TAILLE = 400, CENTRE = 200, R_MAX = 188, N_MAX = 500;
  var ECHELLE = R_MAX / Math.sqrt(N_MAX);
  var PHI = (1 + Math.sqrt(5)) / 2;
  var ANGLE_OR = 360 * (1 - 1 / PHI); // ≈ 137,5078°
  var DEFAUT = { theta: 137.5, n: 300, colorer: false, modulo: 34 };
  var PRESETS = [
    { theta: 137.5, texte: "137,5° (angle d'or)" },
    { theta: 137, texte: "137°" },
    { theta: 120, texte: "120° (1/3 de tour)" },
    { theta: 90, texte: "90° (1/4 de tour)" },
    { theta: 144, texte: "144° (2/5 de tour)" },
  ];

  function decimalFr(v, dec) {
    var t = v.toFixed(dec);
    if (dec > 0) t = t.replace(/0+$/, "").replace(/\.$/, "");
    return t.replace(".", ",").replace("-", "−");
  }

  function pgcd(a, b) { return b ? pgcd(b, a % b) : Math.abs(a); }

  /** Fraction de tour exacte p/q pour θ donné au dixième de degré (θ·10 / 3600). */
  function fractionExacte(theta) {
    var num = Math.round(theta * 10), den = 3600;
    var g = pgcd(num, den);
    return { p: num / g, q: den / g };
  }

  /** Dernière réduite (fraction continue) de x de dénominateur ≤ qMax. */
  function meilleureReduite(x, qMax) {
    var h0 = 0, h1 = 1, k0 = 1, k1 = 0, reste = x, meilleure = { p: 0, q: 1 };
    for (var i = 0; i < 20; i++) {
      var a = Math.floor(reste);
      var h2 = a * h1 + h0, k2 = a * k1 + k0;
      if (k2 > qMax) break;
      meilleure = { p: h2, q: k2 };
      h0 = h1; h1 = h2; k0 = k1; k1 = k2;
      var frac = reste - a;
      if (frac < 1e-12) break;
      reste = 1 / frac;
    }
    return meilleure;
  }

  function svgEl(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    for (var key in attrs) el.setAttribute(key, attrs[key]);
    return el;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}' +
    '*{box-sizing:border-box;}' +
    '.presets{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;margin-bottom:12px;}' +
    '.preset{flex:1 1 auto;min-height:44px;padding:8px 10px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);font-weight:600;font-size:0.85rem;cursor:pointer;font-family:inherit;}' +
    '.preset[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);border-color:var(--accent-soft-line,#e8c4a4);color:var(--accent-ink,#7a3212);}' +
    '.preset:focus-visible,.btn-reset:focus-visible,select:focus-visible,input:focus-visible{outline:2px solid var(--accent,#a8471f);outline-offset:2px;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:400px;height:auto;aspect-ratio:1/1;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.graine{fill:var(--accent,#a8471f);}' +
    '.graine-b{fill:var(--plan,#5b4ea3);}' +
    '.coeur{fill:none;stroke:var(--line,#e2d8c8);stroke-width:1;}' +
    '.verdict{font-size:0.92rem;line-height:1.45;margin:0 0 14px;padding:10px 14px;border-radius:var(--radius,3px);background:var(--surface-2,#faf6f0);border-left:4px solid var(--ink-faint,#9c9083);}' +
    '.verdict.or{border-left-color:var(--good,#2f7a4f);}' +
    '.verdict.rationnel{border-left-color:var(--bad,#b23a3a);}' +
    '.verdict.proche{border-left-color:var(--attn,#b7791f);}' +
    '.verdict strong{font-weight:700;}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:4px;}' +
    '.curseur label{font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-width:0;height:36px;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:64px;text-align:right;font-size:0.92rem;}' +
    '.ligne-option{display:flex;flex-wrap:wrap;align-items:center;gap:10px;}' +
    '.ligne-option label.case{display:flex;align-items:center;gap:8px;min-height:44px;font-weight:600;cursor:pointer;}' +
    '.ligne-option input[type="checkbox"]{width:20px;height:20px;accent-color:var(--accent,#a8471f);}' +
    'select{font:inherit;min-height:44px;padding:6px 10px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);}' +
    'select:disabled{opacity:0.5;}' +
    '.aide{font-size:0.84rem;color:var(--ink-soft,#6b6055);margin:0;line-height:1.4;}' +
    '.btn-reset{min-height:44px;padding:8px 16px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '</style>' +
    '<div class="presets" id="presets" role="group" aria-label="Angles prédéfinis"></div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + TAILLE + ' ' + TAILLE + '" role="img" aria-label="Disposition des graines"></svg></div>' +
    '<p class="verdict" id="verdict" aria-live="polite"></p>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="theta">Angle entre deux graines successives θ</label><div class="curseur-row">' +
    '<input type="range" id="theta" min="90" max="180" step="0.1"><span class="curseur-valeur" id="theta-valeur"></span></div></div>' +
    '<div class="curseur"><label for="n">Nombre de graines N</label><div class="curseur-row">' +
    '<input type="range" id="n" min="50" max="' + N_MAX + '" step="10"><span class="curseur-valeur" id="n-valeur"></span></div></div>' +
    '<div class="ligne-option"><label class="case"><input type="checkbox" id="colorer"> Colorer les spirales</label>' +
    '<label for="modulo" class="aide">selon le reste de k dans la division par</label>' +
    '<select id="modulo"><option value="13">13</option><option value="21">21</option><option value="34">34</option><option value="55">55</option></select></div>' +
    '<p class="aide" id="aide-couleur"></p>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class AngleDOrWidgetClass extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._shadow = shadow;
      this._theta = DEFAUT.theta;
      this._n = DEFAUT.n;
      this._colorer = DEFAUT.colorer;
      this._modulo = DEFAUT.modulo;
      this._svg = shadow.getElementById("svg");
      this._verdict = shadow.getElementById("verdict");
      this._inputTheta = shadow.getElementById("theta");
      this._valeurTheta = shadow.getElementById("theta-valeur");
      this._inputN = shadow.getElementById("n");
      this._valeurN = shadow.getElementById("n-valeur");
      this._caseColorer = shadow.getElementById("colorer");
      this._selectModulo = shadow.getElementById("modulo");
      this._aideCouleur = shadow.getElementById("aide-couleur");
      this._reset = shadow.getElementById("reset");
      var zone = shadow.getElementById("presets");
      this._boutons = PRESETS.map(function (p) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "preset";
        b.textContent = p.texte;
        b.dataset.theta = String(p.theta);
        zone.appendChild(b);
        return b;
      });
    }

    connectedCallback() {
      var self = this;
      this._onTheta = function () { self._theta = parseFloat(self._inputTheta.value); self._rendre(); };
      this._onN = function () { self._n = parseInt(self._inputN.value, 10); self._rendre(); };
      this._onColorer = function () { self._colorer = self._caseColorer.checked; self._rendre(); };
      this._onModulo = function () { self._modulo = parseInt(self._selectModulo.value, 10); self._rendre(); };
      this._onPreset = function (e) { self._theta = parseFloat(e.currentTarget.dataset.theta); self._rendre(); };
      this._onReset = function () {
        self._theta = DEFAUT.theta; self._n = DEFAUT.n; self._colorer = DEFAUT.colorer; self._modulo = DEFAUT.modulo;
        self._rendre();
      };
      this._inputTheta.addEventListener("input", this._onTheta);
      this._inputN.addEventListener("input", this._onN);
      this._caseColorer.addEventListener("change", this._onColorer);
      this._selectModulo.addEventListener("change", this._onModulo);
      this._reset.addEventListener("click", this._onReset);
      this._boutons.forEach(function (b) { b.addEventListener("click", self._onPreset); });
      this._rendre();
    }

    disconnectedCallback() {
      var self = this;
      this._inputTheta.removeEventListener("input", this._onTheta);
      this._inputN.removeEventListener("input", this._onN);
      this._caseColorer.removeEventListener("change", this._onColorer);
      this._selectModulo.removeEventListener("change", this._onModulo);
      this._reset.removeEventListener("click", this._onReset);
      this._boutons.forEach(function (b) { b.removeEventListener("click", self._onPreset); });
    }

    _rendre() {
      this._inputTheta.value = String(this._theta);
      this._inputN.value = String(this._n);
      this._caseColorer.checked = this._colorer;
      this._selectModulo.value = String(this._modulo);
      this._selectModulo.disabled = !this._colorer;
      this._valeurTheta.textContent = decimalFr(this._theta, 1) + "°";
      this._valeurN.textContent = String(this._n);
      var theta = this._theta;
      this._boutons.forEach(function (b) {
        b.setAttribute("aria-pressed", Math.abs(parseFloat(b.dataset.theta) - theta) < 1e-9 ? "true" : "false");
      });
      this._dessiner();
      this._commenter();
    }

    _dessiner() {
      var svg = this._svg;
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      svg.appendChild(svgEl("circle", { cx: CENTRE, cy: CENTRE, r: R_MAX + 6, class: "coeur" }));
      var rayonGraine = Math.max(2.6, Math.min(5.2, ECHELLE * 0.62));
      var m = this._modulo, theta = this._theta;
      // Couleur de la famille j = k mod m : les m familles sont rangées selon la direction de leur
      // graine la plus éloignée du centre, puis colorées en alternance — deux spirales voisines ont
      // ainsi deux couleurs différentes, ce qui rend la famille de spirales lisible.
      var rang = {};
      if (this._colorer) {
        var familles = [];
        // Direction mesurée sur la couronne extérieure (dernière graine de chaque famille) : toutes
        // ces graines sont à peu près à la même distance du centre, l'ordre angulaire y est fiable.
        for (var j0 = 0; j0 < m; j0++) {
          var kExt = this._n - ((this._n - j0) % m + m) % m;
          familles.push({ j: j0, angle: ((kExt * theta) % 360 + 360) % 360 });
        }
        familles.sort(function (u, v) { return u.angle - v.angle; });
        familles.forEach(function (f, i) { rang[f.j] = i; });
      }
      for (var k = 1; k <= this._n; k++) {
        var a = k * theta * Math.PI / 180;
        var r = ECHELLE * Math.sqrt(k);
        var attrs = {
          cx: (CENTRE + r * Math.cos(a)).toFixed(2),
          cy: (CENTRE - r * Math.sin(a)).toFixed(2),
          r: rayonGraine.toFixed(2),
          class: this._colorer && rang[k % m] % 2 ? "graine graine-b" : "graine",
        };
        svg.appendChild(svgEl("circle", attrs));
      }
    }

    _commenter() {
      var theta = this._theta;
      var v = this._verdict;
      var exacte = fractionExacte(theta);
      var tours = theta / 360;
      v.className = "verdict";
      if (Math.abs(theta - ANGLE_OR) < 0.05) {
        v.classList.add("or");
        v.innerHTML = "<strong>Angle d'or</strong> (valeur exacte ≈ 137,508° = 360° × (1 − 1/φ)) : les graines remplissent " +
          "tout le disque, <strong>sans aucun vide</strong>. L'œil voit des spirales dans les deux sens, et leur nombre est " +
          "toujours un terme de la suite de Fibonacci : 21 et 34 vers le centre, 34 et 55 plus loin (augmente N).";
      } else if (exacte.q <= 60) {
        v.classList.add("rationnel");
        v.innerHTML = "θ = " + decimalFr(theta, 1) + "° = <strong>" + exacte.p + "/" + exacte.q + " de tour</strong> : après " +
          exacte.q + " graines, on retombe exactement dans la même direction. Les graines s'alignent sur <strong>" + exacte.q +
          " rayons rectilignes</strong>, avec de grands vides entre eux — de la place perdue.";
      } else {
        var red = meilleureReduite(tours, 55);
        v.classList.add("proche");
        v.innerHTML = "θ = " + decimalFr(theta, 1) + "° est <strong>proche de " + red.p + "/" + red.q + " de tour</strong> : " +
          "les graines se rangent en " + red.q + " bras légèrement courbés, séparés par des vides. Rapproche-toi de " +
          "137,5° : les vides disparaissent.";
      }
      this._aideCouleur.textContent = this._colorer
        ? "Chaque famille de graines de même reste dans la division par " + this._modulo + " a sa couleur, en alternance : à l'angle d'or, " +
          "chaque famille s'aligne sur une spirale, et on compte " + this._modulo + " spirales aux couleurs alternées. Change d'angle : " +
          "les spirales colorées se déforment ou se cassent."
        : "Coche « Colorer les spirales » pour colorer chaque famille de spirales.";
    }
  }

  if (!customElements.get("angle-d-or-widget")) {
    customElements.define("angle-d-or-widget", AngleDOrWidgetClass);
  }
})();
