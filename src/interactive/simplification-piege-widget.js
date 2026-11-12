(function () {
  "use strict";

  /* ================================================================
   * <simplification-piege-widget> — atelier interactif (5e, chapitre 1, §3) :
   * « la simplification qui ment ». Pour une composée f∘g, deux courbes
   * superposées dans le même repère FIXE : la formule simplifiée (pointillés,
   * définie sur un ensemble trop grand) et la vraie composée (trait plein,
   * seulement sur dom(f∘g), points creux aux valeurs exclues, morceaux
   * manquants). Une sonde x compare les deux en un point. Idée : on ne lit
   * jamais le domaine sur la formule simplifiée.
   * Web Component (Shadow DOM).
   * ================================================================ */

  var X_MIN = -5, X_MAX = 5, Y_MIN = -6, Y_MAX = 6;
  var LARGEUR = 420, HAUTEUR = 360, MG = 30, MD = 18, MH = 16, MB = 26;

  // Chaque préréglage : formule simplifiée s(x) (définie sur ℝ), vraie composée sur son domaine
  // (morceaux [a ; b] avec bornes incluses ou non), points exclus isolés (trous) et explications.
  var PRESETS = [
    {
      nom: "f(t) = t², g(x) = √x",
      etapes: ["(f∘g)(x) = f(g(x)) = (√x)²", "formule simplifiée : x"],
      simple: function (x) { return x; },
      simpleTexte: "y = x",
      morceaux: [{ a: 0, inclA: true, b: Infinity, inclB: false }],
      trous: [],
      domTexte: "dom(f∘g) = [0 ; +∞[",
      conditions: "x ∈ dom g ⟺ x ≥ 0 ; g(x) ∈ dom f : toujours (f(t) = t² accepte tout réel).",
      raison: function (x) { return x < 0 ? "√x n'existe pas pour x < 0" : ""; },
      ecart: "Elles diffèrent pour x < 0 : la formule simplifiée donne une valeur, la composée n'existe pas.",
    },
    {
      nom: "f(x) = 3/x, g(x) = 7/(4x + 6)",
      etapes: ["(f∘g)(x) = 3 / (7/(4x + 6))", "formule simplifiée : (12x + 18)/7"],
      simple: function (x) { return (12 * x + 18) / 7; },
      simpleTexte: "y = (12x + 18)/7",
      morceaux: [{ a: -Infinity, inclA: false, b: -1.5, inclB: false }, { a: -1.5, inclA: false, b: Infinity, inclB: false }],
      trous: [-1.5],
      domTexte: "dom(f∘g) = ℝ ∖ {−3/2}",
      conditions: "x ∈ dom g ⟺ 4x + 6 ≠ 0 ⟺ x ≠ −3/2 ; g(x) ∈ dom f ⟺ g(x) ≠ 0 : toujours vrai (le numérateur 7 ne s'annule pas).",
      raison: function (x) { return Math.abs(x + 1.5) < 1e-9 ? "g(−3/2) n'existe pas : dénominateur nul" : ""; },
      ecart: "Elles diffèrent en un seul point, x = −3/2 : la droite y passe par (−3/2 ; 0), la composée a un trou.",
    },
    {
      nom: "f(t) = t², g(x) = √(4 − x²)",
      etapes: ["(f∘g)(x) = f(g(x)) = (√(4 − x²))²", "formule simplifiée : 4 − x²"],
      simple: function (x) { return 4 - x * x; },
      simpleTexte: "y = 4 − x²",
      morceaux: [{ a: -2, inclA: true, b: 2, inclB: true }],
      trous: [],
      domTexte: "dom(f∘g) = [−2 ; 2]",
      conditions: "x ∈ dom g ⟺ 4 − x² ≥ 0 ⟺ −2 ≤ x ≤ 2 ; g(x) ∈ dom f : toujours.",
      raison: function (x) { return Math.abs(x) > 2 + 1e-9 ? "√(4 − x²) n'existe pas pour |x| > 2" : ""; },
      ecart: "Elles diffèrent pour x < −2 et x > 2 : la parabole continue, la composée s'arrête.",
    },
    {
      nom: "f(t) = 1/t, g(x) = 1/(x − 2)",
      etapes: ["(f∘g)(x) = 1 / (1/(x − 2))", "formule simplifiée : x − 2"],
      simple: function (x) { return x - 2; },
      simpleTexte: "y = x − 2",
      morceaux: [{ a: -Infinity, inclA: false, b: 2, inclB: false }, { a: 2, inclA: false, b: Infinity, inclB: false }],
      trous: [2],
      domTexte: "dom(f∘g) = ℝ ∖ {2}",
      conditions: "x ∈ dom g ⟺ x ≠ 2 ; g(x) ∈ dom f ⟺ g(x) ≠ 0 : toujours vrai.",
      raison: function (x) { return Math.abs(x - 2) < 1e-9 ? "g(2) n'existe pas : dénominateur nul" : ""; },
      ecart: "Elles diffèrent en x = 2 : la droite passe par (2 ; 0), la composée a un trou.",
    },
  ];

  function moins(s) { return String(s).replace(/-/g, "−"); }
  function formatNombreFr(n, d) {
    var f = Math.pow(10, d);
    var r = Math.round(n * f) / f;
    if (Object.is(r, -0)) r = 0;
    return moins(r.toFixed(d).replace(/\.?0+$/, "").replace(".", ","));
  }

  var NS = "http://www.w3.org/2000/svg";
  function svgEl(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }
  function px(x) { return MG + (x - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - MG - MD); }
  function py(y) { return MH + (Y_MAX - y) / (Y_MAX - Y_MIN) * (HAUTEUR - MH - MB); }

  function chemin(fn, a, b) {
    var n = 200, d = "";
    for (var i = 0; i <= n; i++) {
      var x = a + (i / n) * (b - a);
      var y = fn(x);
      d += (i === 0 ? "M" : "L") + px(x).toFixed(2) + "," + py(y).toFixed(2);
    }
    return d;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}' +
    '*{box-sizing:border-box;}' +
    '.select-row{display:flex;justify-content:center;margin-bottom:10px;}' +
    'select{font-family:inherit;font-size:0.9rem;font-weight:600;color:var(--ink,#241f1a);background:var(--surface,#fff);border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:6px 10px;max-width:100%;min-width:0;}' +
    '.etapes{margin:0 0 8px;padding:0;list-style:none;text-align:center;font-family:var(--serif,serif);font-size:1rem;}' +
    '.etapes li{overflow-wrap:anywhere;}' +
    '.figure{display:flex;justify-content:center;margin-bottom:8px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);display:block;}' +
    '.grille{stroke:var(--line-soft,#ece4d6);stroke-width:1;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.tick-label{font-size:10px;fill:var(--ink-faint,#9c9083);font-family:var(--mono,monospace);}' +
    '.simple{fill:none;stroke:var(--accent,#a8471f);stroke-width:2;stroke-dasharray:6 5;}' +
    '.vraie{fill:none;stroke:var(--good,#2f7a4f);stroke-width:4;stroke-linecap:round;}' +
    '.trou{fill:var(--surface-2,#faf6f0);stroke:var(--good,#2f7a4f);stroke-width:2.2;}' +
    '.borne{fill:var(--good,#2f7a4f);}' +
    '.zone-ecart{fill:var(--bad,#b3261e);opacity:0.08;}' +
    '.sonde{stroke:var(--plan,#5b4ea3);stroke-width:1.3;stroke-dasharray:4 3;}' +
    '.sonde-simple{fill:var(--accent,#a8471f);}' +
    '.sonde-vraie{fill:var(--good,#2f7a4f);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.legende{display:flex;flex-wrap:wrap;justify-content:center;gap:6px 16px;font-size:0.85rem;margin:0 0 8px;}' +
    '.leg-simple{color:var(--accent-ink,#7a3212);}.leg-vraie{color:var(--good,#2f7a4f);font-weight:600;}' +
    '.infos{font-size:0.9rem;margin:0 0 10px;display:flex;flex-direction:column;gap:4px;}' +
    '.dom{font-family:var(--mono,monospace);font-weight:700;color:var(--good,#2f7a4f);}' +
    '.ecart{color:var(--bad,#b3261e);font-weight:600;}' +
    '.sonde-texte{text-align:center;font-size:0.92rem;margin:0 0 10px;overflow-wrap:anywhere;}' +
    '.ko{color:var(--bad,#b3261e);font-weight:600;}' +
    '.curseur{display:flex;align-items:center;gap:10px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur input{flex:1 1 auto;min-width:0;accent-color:var(--accent,#a8471f);}' +
    '.curseur .val{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:3em;text-align:right;}' +
    '</style>' +
    '<div class="select-row"><select id="preset" aria-label="Choisir une composée"></select></div>' +
    '<ul class="etapes" id="etapes"></ul>' +
    '<div class="figure"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" role="img" aria-label="Formule simplifiée et vraie composée superposées"></svg></div>' +
    '<div class="legende"><span class="leg-simple">- - - formule simplifiée</span><span class="leg-vraie">━ vraie composée f∘g</span></div>' +
    '<div class="infos" id="infos"></div>' +
    '<p class="sonde-texte" id="sonde-texte"></p>' +
    '<div class="curseur"><label for="x">x</label><input type="range" id="x" min="' + X_MIN + '" max="' + X_MAX + '" step="0.05" value="-1"><span class="val" id="x-val"></span></div>';

  class SimplificationPiegeWidget extends HTMLElement {
    constructor() {
      super();
      var sh = this.attachShadow({ mode: "open" });
      sh.appendChild(TEMPLATE.content.cloneNode(true));
      this._sh = sh;
      this._i = 0;
      this._x = -1;
      var sel = sh.getElementById("preset");
      PRESETS.forEach(function (p, i) {
        var o = document.createElement("option");
        o.value = String(i);
        o.textContent = p.nom;
        sel.appendChild(o);
      });
    }

    connectedCallback() {
      var self = this, sh = this._sh;
      this._onPreset = function () { self._i = parseInt(sh.getElementById("preset").value, 10); self._rendre(); };
      this._onX = function () {
        var v = parseFloat(sh.getElementById("x").value);
        // Aimant sur les valeurs exclues et les bornes, pour pouvoir tomber pile dessus.
        var p = PRESETS[self._i];
        var speciaux = p.trous.slice();
        p.morceaux.forEach(function (m) { if (isFinite(m.a)) speciaux.push(m.a); if (isFinite(m.b)) speciaux.push(m.b); });
        for (var k = 0; k < speciaux.length; k++) if (Math.abs(speciaux[k] - v) < 0.12) { v = speciaux[k]; break; }
        self._x = v;
        self._rendre();
      };
      sh.getElementById("preset").addEventListener("change", this._onPreset);
      sh.getElementById("x").addEventListener("input", this._onX);
      this._rendre();
    }

    disconnectedCallback() {
      this._sh.getElementById("preset").removeEventListener("change", this._onPreset);
      this._sh.getElementById("x").removeEventListener("input", this._onX);
    }

    _rendre() {
      var sh = this._sh, p = PRESETS[this._i], x = this._x;
      var et = sh.getElementById("etapes");
      et.innerHTML = "";
      p.etapes.forEach(function (e) { var li = document.createElement("li"); li.textContent = e; et.appendChild(li); });
      sh.getElementById("x-val").textContent = formatNombreFr(x, 2);
      this._dessiner(p, x);

      var infos = sh.getElementById("infos");
      infos.innerHTML = "";
      var l1 = document.createElement("div");
      l1.textContent = "Formule simplifiée : " + p.simpleTexte + ", calculable pour tout réel.";
      var l2 = document.createElement("div");
      l2.appendChild(document.createTextNode("Vraie composée : "));
      var d = document.createElement("span"); d.className = "dom"; d.textContent = p.domTexte;
      l2.appendChild(d);
      l2.appendChild(document.createTextNode(" — " + p.conditions));
      var l3 = document.createElement("div"); l3.className = "ecart";
      l3.textContent = p.ecart + " On ne lit jamais le domaine sur la formule simplifiée.";
      infos.appendChild(l1); infos.appendChild(l2); infos.appendChild(l3);

      var t = sh.getElementById("sonde-texte");
      t.innerHTML = "";
      var raison = p.raison(x);
      t.appendChild(document.createTextNode("En x = " + formatNombreFr(x, 2) + " : formule simplifiée → " + formatNombreFr(p.simple(x), 2) + " ; composée → "));
      var s = document.createElement("span");
      if (raison) { s.className = "ko"; s.textContent = "n'existe pas (" + raison + ")"; }
      else s.textContent = formatNombreFr(p.simple(x), 2);
      t.appendChild(s);
    }

    _dessiner(p, x) {
      var svg = this._sh.getElementById("svg");
      svg.innerHTML = "";
      var defs = svgEl("defs", {});
      var mk = svgEl("marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      mk.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(mk);
      var clip = svgEl("clipPath", { id: "cadre" });
      clip.appendChild(svgEl("rect", { x: px(X_MIN), y: py(Y_MAX), width: px(X_MAX) - px(X_MIN), height: py(Y_MIN) - py(Y_MAX) }));
      defs.appendChild(clip);
      svg.appendChild(defs);

      for (var gx = X_MIN; gx <= X_MAX; gx++) svg.appendChild(svgEl("line", { x1: px(gx), x2: px(gx), y1: py(Y_MIN), y2: py(Y_MAX), class: "grille" }));
      for (var gy = Y_MIN; gy <= Y_MAX; gy++) svg.appendChild(svgEl("line", { x1: px(X_MIN), x2: px(X_MAX), y1: py(gy), y2: py(gy), class: "grille" }));

      // Zone(s) où la formule simplifiée existe mais pas la composée (hors morceaux), en teinte légère.
      var bornes = [];
      p.morceaux.forEach(function (m) { bornes.push([Math.max(m.a, X_MIN), Math.min(m.b, X_MAX)]); });
      var curseur = X_MIN;
      bornes.forEach(function (b) {
        if (b[0] > curseur + 1e-9) svg.appendChild(svgEl("rect", { x: px(curseur), y: py(Y_MAX), width: px(b[0]) - px(curseur), height: py(Y_MIN) - py(Y_MAX), class: "zone-ecart" }));
        curseur = Math.max(curseur, b[1]);
      });
      if (curseur < X_MAX - 1e-9) svg.appendChild(svgEl("rect", { x: px(curseur), y: py(Y_MAX), width: px(X_MAX) - px(curseur), height: py(Y_MIN) - py(Y_MAX), class: "zone-ecart" }));

      // Axes fléchés (verticale tracée du bas vers le haut pour que la flèche pointe en haut)
      svg.appendChild(svgEl("line", { x1: px(X_MIN), x2: px(X_MAX) + 8, y1: py(0), y2: py(0), class: "axe", "marker-end": "url(#fleche)" }));
      svg.appendChild(svgEl("line", { x1: px(0), x2: px(0), y1: py(Y_MIN), y2: py(Y_MAX) - 8, class: "axe", "marker-end": "url(#fleche)" }));
      for (var tx = X_MIN; tx <= X_MAX; tx++) {
        if (tx === 0 || tx % 1 !== 0) continue;
        var lx = svgEl("text", { x: px(tx), y: py(0) + 13, "text-anchor": "middle", class: "tick-label" });
        lx.textContent = moins(tx);
        svg.appendChild(lx);
      }
      for (var ty = Y_MIN; ty <= Y_MAX; ty += 2) {
        if (ty === 0) continue;
        var ly = svgEl("text", { x: px(0) - 5, y: py(ty) + 3.5, "text-anchor": "end", class: "tick-label" });
        ly.textContent = moins(ty);
        svg.appendChild(ly);
      }

      var g = svgEl("g", { "clip-path": "url(#cadre)" });
      g.appendChild(svgEl("path", { d: chemin(p.simple, X_MIN, X_MAX), class: "simple" }));
      p.morceaux.forEach(function (m) {
        var a = Math.max(m.a, X_MIN), b = Math.min(m.b, X_MAX);
        if (b > a) g.appendChild(svgEl("path", { d: chemin(p.simple, a, b), class: "vraie" }));
      });
      svg.appendChild(g);
      // Bornes incluses (points pleins) et valeurs exclues (points creux)
      p.morceaux.forEach(function (m) {
        [[m.a, m.inclA], [m.b, m.inclB]].forEach(function (bo) {
          if (!isFinite(bo[0]) || !bo[1]) return;
          svg.appendChild(svgEl("circle", { cx: px(bo[0]), cy: py(p.simple(bo[0])), r: 4.5, class: "borne" }));
        });
      });
      p.trous.forEach(function (t) {
        svg.appendChild(svgEl("circle", { cx: px(t), cy: py(p.simple(t)), r: 5, class: "trou" }));
      });

      // Sonde
      var yS = p.simple(x);
      svg.appendChild(svgEl("line", { x1: px(x), x2: px(x), y1: py(Y_MIN), y2: py(Y_MAX), class: "sonde" }));
      if (yS >= Y_MIN && yS <= Y_MAX) {
        svg.appendChild(svgEl("circle", { cx: px(x), cy: py(yS), r: 4, class: "sonde-simple" }));
        if (!p.raison(x)) svg.appendChild(svgEl("circle", { cx: px(x), cy: py(yS), r: 6, class: "sonde-vraie" }));
      }
    }
  }

  if (!customElements.get("simplification-piege-widget")) {
    customElements.define("simplification-piege-widget", SimplificationPiegeWidget);
  }
})();
