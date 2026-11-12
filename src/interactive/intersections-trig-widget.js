(function () {
  "use strict";

  /* ================================================================
   * <intersections-trig-widget> — atelier : « résoudre, c'est chercher
   * des intersections ». Pour chaque équation de la section (mêmes
   * exemples que le cours), les deux membres sont tracés sur [0 ; 2π[ ;
   * les points d'intersection sont marqués et leurs abscisses listées
   * (valeurs exactes quand elles sont remarquables). Un préréglage
   * « sin x = c » laisse régler c avec un curseur.
   * Fenêtre FIXE par préréglage (jamais recalculée depuis le curseur c).
   * Web Component (Shadow DOM).
   * ================================================================ */

  var NS = "http://www.w3.org/2000/svg";
  var PI = Math.PI, DEUX_PI = 2 * Math.PI;

  // Solutions exactes : valeur numérique + écriture en fraction de π.
  function s(num, den) { return { v: (num / den) * PI, l: fracPi(num, den) }; }
  function fracPi(num, den) {
    if (num === 0) return "0";
    var g = pgcd(Math.abs(num), den); num /= g; den /= g;
    var n = num === 1 ? "π" : num === -1 ? "−π" : String(num).replace("-", "−") + "π";
    return den === 1 ? n : n + "/" + den;
  }
  function pgcd(a, b) { while (b) { var t = a % b; a = b; b = t; } return a; }

  var PRESETS = {
    conversion: {
      label: "cos(2x) = sin(x)",
      g: "cos(2x)", d: "sin(x)",
      f1: function (x) { return Math.cos(2 * x); }, f2: function (x) { return Math.sin(x); },
      yMin: -1.6, yMax: 1.6, ticksY: [-1, 1],
      sols: function () { return [s(1, 6), s(5, 6), s(3, 2)]; },
      note: "Exemple « convertir, puis égaler les arguments » : 3π/2 appartient aux deux familles, on ne le compte qu'une fois.",
    },
    familles: {
      label: "2cos(3x − π/4) = 1",
      g: "2cos(3x − π/4)", d: "1",
      f1: function (x) { return 2 * Math.cos(3 * x - PI / 4); }, f2: function () { return 1; },
      yMin: -2.6, yMax: 2.6, ticksY: [-2, -1, 1, 2],
      sols: function () { return [s(7, 36), s(23, 36), s(31, 36), s(47, 36), s(55, 36), s(71, 36)]; },
      note: "Exemple « deux familles de solutions » : a = 3, donc 3 tours de cercle sur [0 ; 2π[ — deux familles × 3 = 6 solutions.",
    },
    produit: {
      label: "sin(x)·(2cos(x) − 1) = 0",
      g: "sin(x)·(2cos(x) − 1)", d: "0",
      f1: function (x) { return Math.sin(x) * (2 * Math.cos(x) - 1); }, f2: function () { return 0; },
      yMin: -2.2, yMax: 2.2, ticksY: [-2, -1, 1, 2],
      sols: function () { return [s(0, 1), s(1, 3), s(1, 1), s(5, 3)]; },
      note: "Produit nul : la courbe coupe l'axe aux zéros de sin(x) (0 et π) ET à ceux de 2cos(x) − 1 (π/3 et 5π/3).",
    },
    factoriser: {
      label: "cos²(x) − ½cos(x) = 0",
      g: "cos²(x) − ½cos(x)", d: "0",
      f1: function (x) { var c = Math.cos(x); return c * c - 0.5 * c; }, f2: function () { return 0; },
      yMin: -0.6, yMax: 1.8, ticksY: [-0.5, 0.5, 1, 1.5],
      sols: function () { return [s(1, 3), s(1, 2), s(3, 2), s(5, 3)]; },
      note: "Après mise en évidence de cos(x) : cos(x) = 0 donne π/2 et 3π/2, cos(x) = 1/2 donne π/3 et 5π/3.",
    },
    secondDegre: {
      label: "2sin²(x) − cos(x) + 1 = 0",
      g: "2sin²(x) − cos(x) + 1", d: "0",
      f1: function (x) { var sn = Math.sin(x); return 2 * sn * sn - Math.cos(x) + 1; }, f2: function () { return 0; },
      yMin: -0.8, yMax: 3.6, ticksY: [1, 2, 3],
      sols: function () { return [s(0, 1)]; },
      note: "La courbe ne fait que TOUCHER l'axe en x = 0 : la racine t = −3/2 a été rejetée, il ne reste que cos(x) = 1.",
    },
    sinc: {
      label: "sin(x) = c (c réglable)",
      g: "sin(x)", d: "c",
      f1: function (x) { return Math.sin(x); }, f2: null,
      yMin: -1.6, yMax: 1.6, ticksY: [-1, 1],
      sols: null,
      note: "",
    },
  };
  var ORDRE = ["conversion", "familles", "produit", "factoriser", "secondDegre", "sinc"];

  // Valeurs remarquables de sin pour sin(x) = c : c → angle α ∈ [−π/2 ; π/2] en fraction de π.
  var REMARQUABLES = [
    [0, 0, 1], [0.5, 1, 6], [-0.5, -1, 6], [Math.SQRT1_2, 1, 4], [-Math.SQRT1_2, -1, 4],
    [Math.sqrt(3) / 2, 1, 3], [-Math.sqrt(3) / 2, -1, 3], [1, 1, 2], [-1, -1, 2],
  ];

  function fr(n, d) {
    var f = Math.pow(10, d);
    return (Math.round(n * f) / f).toFixed(d).replace(".", ",").replace("-", "−");
  }
  function el(tag, attrs, texte) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (texte !== undefined) e.textContent = texte;
    return e;
  }

  var LARGEUR = 560, HAUTEUR = 300, MG = 40, MD = 18, MH = 16, MB = 30;
  var X_MIN = 0, X_MAX = DEUX_PI + 0.35;

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    "<style>" +
    ":host{display:block;font-family:var(--sans,system-ui,sans-serif);}" +
    "*{box-sizing:border-box;}" +
    "[hidden]{display:none !important;}" +
    ".ligne{display:flex;align-items:center;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:12px;}" +
    ".ligne label{font-weight:600;color:var(--ink,#241f1a);}" +
    "select{font:inherit;max-width:100%;padding:6px 10px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);}" +
    ".formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.05rem;font-weight:600;color:var(--ink,#241f1a);margin:0 0 10px;}" +
    ".figure{background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);padding:6px;margin-bottom:12px;}" +
    "svg{width:100%;height:auto;display:block;}" +
    ".axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}" +
    ".fleche{fill:var(--ink-soft,#6b6055);}" +
    ".grad{stroke:var(--ink-soft,#6b6055);stroke-width:1;}" +
    ".grille{stroke:var(--line,#e2d8c8);stroke-width:1;}" +
    ".m1{stroke:var(--accent,#a8471f);stroke-width:2.4;fill:none;}" +
    ".m2{stroke:var(--plan,#5b4ea3);stroke-width:2.4;fill:none;}" +
    ".m2-zero{stroke:var(--plan,#5b4ea3);stroke-width:3;opacity:0.55;}" +
    ".inter{fill:var(--good,#2f7a4f);stroke:var(--surface,#fff);stroke-width:1.5;}" +
    ".guide{stroke:var(--good,#2f7a4f);stroke-width:1;stroke-dasharray:3 3;}" +
    ".etiq{font-size:12px;fill:var(--ink-soft,#6b6055);}" +
    ".etiq-sol{font-size:12px;font-weight:700;fill:var(--good,#2f7a4f);}" +
    ".legende{display:flex;flex-wrap:wrap;gap:4px 16px;justify-content:center;margin:0 0 10px;font-size:0.88rem;font-weight:700;}" +
    ".leg1{color:var(--accent-ink,#7a3212);}" +
    ".leg2{color:var(--plan,#5b4ea3);}" +
    ".solutions{text-align:center;font-size:0.92rem;color:var(--ink,#241f1a);margin:0 0 8px;padding:8px 12px;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);line-height:1.5;overflow-wrap:anywhere;}" +
    ".solutions b{color:var(--good,#2f7a4f);}" +
    ".note{text-align:center;font-size:0.84rem;color:var(--ink-soft,#6b6055);margin:0 0 12px;}" +
    ".curseur{display:flex;flex-direction:column;gap:6px;}" +
    ".curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}" +
    ".curseur-row{display:flex;align-items:center;gap:12px;}" +
    ".curseur-row input{flex:1 1 auto;min-width:0;accent-color:var(--accent,#a8471f);}" +
    ".valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;}" +
    "</style>" +
    '<div class="ligne"><label for="preset">Équation</label><select id="preset"></select></div>' +
    '<p class="formule" id="formule"></p>' +
    '<div class="figure"><svg id="svg" viewBox="0 0 ' + LARGEUR + " " + HAUTEUR + '" role="img" aria-label="Les deux membres de l\'équation et leurs points d\'intersection"></svg></div>' +
    '<p class="legende"><span class="leg1" id="leg1"></span><span class="leg2" id="leg2"></span></p>' +
    '<p class="solutions" id="solutions"></p>' +
    '<p class="note" id="note"></p>' +
    '<div class="curseur" id="bloc-c"><label for="c">c — second membre</label><div class="curseur-row">' +
    '<input type="range" id="c" min="-1.3" max="1.3" step="0.01" value="0.5"><span class="valeur" id="c-valeur"></span></div></div>';

  class IntersectionsTrigWidget extends HTMLElement {
    constructor() {
      super();
      var sr = this.attachShadow({ mode: "open" });
      sr.appendChild(TEMPLATE.content.cloneNode(true));
      this._preset = "conversion";
      this._c = 0.5;
      this._sel = sr.getElementById("preset");
      ORDRE.forEach(function (k) {
        var o = document.createElement("option");
        o.value = k; o.textContent = PRESETS[k].label;
        this._sel.appendChild(o);
      }, this);
      this._sel.value = this._preset;
      this._formule = sr.getElementById("formule");
      this._svg = sr.getElementById("svg");
      this._solutions = sr.getElementById("solutions");
      this._note = sr.getElementById("note");
      this._blocC = sr.getElementById("bloc-c");
      this._leg1 = sr.getElementById("leg1");
      this._leg2 = sr.getElementById("leg2");
      this._inC = sr.getElementById("c");
      this._valC = sr.getElementById("c-valeur");
    }

    connectedCallback() {
      var self = this;
      this._onSel = function () { self._preset = self._sel.value; self._rendre(); };
      this._onC = function () {
        var v = parseFloat(self._inC.value);
        // Aimant sur les valeurs remarquables (±0,015) pour atteindre ½, √2/2, √3/2… exactement.
        for (var i = 0; i < REMARQUABLES.length; i++) if (Math.abs(v - REMARQUABLES[i][0]) < 0.015) v = REMARQUABLES[i][0];
        self._c = v; self._rendre();
      };
      this._sel.addEventListener("change", this._onSel);
      this._inC.addEventListener("input", this._onC);
      this._rendre();
    }

    disconnectedCallback() {
      this._sel.removeEventListener("change", this._onSel);
      this._inC.removeEventListener("input", this._onC);
    }

    _solsSinC(c) {
      if (c > 1 || c < -1) return [];
      var rem = null;
      for (var i = 0; i < REMARQUABLES.length; i++) if (Math.abs(c - REMARQUABLES[i][0]) < 1e-9) rem = REMARQUABLES[i];
      var alpha = Math.asin(c);
      var cand = [alpha, PI - alpha];
      var res = [];
      cand.forEach(function (x, j) {
        var xx = ((x % DEUX_PI) + DEUX_PI) % DEUX_PI;
        if (xx > DEUX_PI - 1e-9) xx = 0;
        if (res.some(function (r) { return Math.abs(r.v - xx) < 1e-9; })) return;
        var l;
        if (rem) {
          // α = num·π/den ; π − α = (den − num)π/den ; ramenés dans [0 ; 2π[.
          var num = rem[1], den = rem[2];
          var n = j === 0 ? num : den - num;
          n = ((n % (2 * den)) + 2 * den) % (2 * den);
          l = fracPi(n, den);
        } else {
          l = fr(xx, 3);
        }
        res.push({ v: xx, l: l });
      });
      return res.sort(function (a, b) { return a.v - b.v; });
    }

    _rendre() {
      var p = PRESETS[this._preset];
      var c = this._c;
      var estSinC = this._preset === "sinc";
      this._blocC.hidden = !estSinC;
      this._valC.textContent = fr(c, 3);
      var droite = estSinC ? "c = " + fr(c, 3) : p.d;
      this._formule.textContent = p.g + " = " + (estSinC ? fr(c, 3) : p.d);
      var sols = estSinC ? this._solsSinC(c) : p.sols();
      var f2 = estSinC ? function () { return c; } : p.f2;

      if (sols.length === 0) {
        this._solutions.innerHTML = "Aucun point d'intersection : |c| > 1, donc <b>S = ∅</b> — le sinus ne dépasse jamais 1 en valeur absolue.";
      } else {
        this._solutions.innerHTML = sols.length + " point" + (sols.length > 1 ? "s" : "") + " d'intersection sur [0 ; 2π[ : <b>S = {" +
          sols.map(function (x) { return x.l; }).join(" ; ") + "}</b>";
      }
      this._note.textContent = estSinC
        ? "Deux solutions en général (α et π − α), une seule si c = ±1, aucune si |c| > 1. Les valeurs remarquables (½, √2/2, √3/2…) sont aimantées."
        : p.note;
      this._dessiner(p, f2, sols, droite);
    }

    _dessiner(p, f2, sols, droite) {
      var svg = this._svg;
      svg.innerHTML = "";
      var yMin = p.yMin, yMax = p.yMax;
      var zl = LARGEUR - MG - MD, zh = HAUTEUR - MH - MB;
      function px(x) { return MG + (x - X_MIN) / (X_MAX - X_MIN) * zl; }
      function py(y) { return HAUTEUR - MB - (y - yMin) / (yMax - yMin) * zh; }

      var defs = el("defs", {});
      var mk = el("marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      mk.appendChild(el("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(mk);
      svg.appendChild(defs);

      // Grille verticale en π/2.
      for (var k = 1; k <= 4; k++) {
        var gx = px(k * PI / 2);
        svg.appendChild(el("line", { x1: gx, x2: gx, y1: MH, y2: HAUTEUR - MB, class: "grille" }));
      }
      var y0 = py(0);
      svg.appendChild(el("line", { x1: MG, x2: LARGEUR - MD + 4, y1: y0, y2: y0, class: "axe", "marker-end": "url(#fleche)" }));
      svg.appendChild(el("line", { x1: MG, x2: MG, y1: HAUTEUR - MB + 4, y2: MH - 6, class: "axe", "marker-end": "url(#fleche)" }));
      svg.appendChild(el("text", { x: LARGEUR - MD, y: y0 - 6, "text-anchor": "end", class: "etiq" }, "x"));
      var etiqPi = [["π/2", PI / 2], ["π", PI], ["3π/2", 3 * PI / 2], ["2π", DEUX_PI]];
      etiqPi.forEach(function (e) {
        svg.appendChild(el("line", { x1: px(e[1]), x2: px(e[1]), y1: y0 - 3, y2: y0 + 3, class: "grad" }));
        svg.appendChild(el("text", { x: px(e[1]) + 3, y: y0 + 13, class: "etiq" }, e[0]));
      });
      p.ticksY.forEach(function (t) {
        svg.appendChild(el("line", { x1: MG - 3, x2: MG + 3, y1: py(t), y2: py(t), class: "grad" }));
        svg.appendChild(el("text", { x: MG - 6, y: py(t) + 4, "text-anchor": "end", class: "etiq" }, fr(t, t % 1 === 0 ? 0 : 1)));
      });

      function chemin(f) {
        var d = "", n = 600, dessine = false;
        for (var i = 0; i <= n; i++) {
          var x = X_MIN + (DEUX_PI - X_MIN) * i / n;
          var y = f(x);
          if (y < yMin - 0.05 || y > yMax + 0.05) { dessine = false; continue; }
          d += (dessine ? "L" : "M") + px(x).toFixed(2) + " " + py(y).toFixed(2) + " ";
          dessine = true;
        }
        return d.trim();
      }
      // Second membre (constant ou fonction), puis premier membre par-dessus.
      var cst = f2(0);
      var constant = Math.abs(f2(1) - cst) < 1e-12 && Math.abs(f2(4) - cst) < 1e-12;
      if (constant && Math.abs(cst) < 1e-12) {
        svg.appendChild(el("line", { x1: px(0), x2: px(DEUX_PI), y1: y0, y2: y0, class: "m2-zero" }));
      } else if (constant) {
        if (cst >= yMin && cst <= yMax) svg.appendChild(el("line", { x1: px(0), x2: px(DEUX_PI), y1: py(cst), y2: py(cst), class: "m2" }));
      } else {
        svg.appendChild(el("path", { d: chemin(f2), class: "m2" }));
      }
      svg.appendChild(el("path", { d: chemin(p.f1), class: "m1" }));

      // Points d'intersection + abscisses (étiquettes alternées haut/bas pour éviter les chevauchements).
      sols.forEach(function (sol, i) {
        var x = px(sol.v), y = py(p.f1(sol.v));
        svg.appendChild(el("line", { x1: x, x2: x, y1: y, y2: y0, class: "guide" }));
        svg.appendChild(el("circle", { cx: x, cy: y, r: 4.8, class: "inter" }));
        var bas = i % 2 === 1;
        var ty = bas ? HAUTEUR - MB + 24 : MH + 2;
        if (!bas && y < MH + 16) ty = y + 18;
        var anchor = x < MG + 18 ? "start" : x > LARGEUR - MD - 18 ? "end" : "middle";
        svg.appendChild(el("text", { x: x, y: ty, "text-anchor": anchor, class: "etiq-sol" }, sol.l));
      });

      this._leg1.textContent = "— " + p.g;
      this._leg2.textContent = "— " + droite;
    }
  }

  if (!customElements.get("intersections-trig-widget")) {
    customElements.define("intersections-trig-widget", IntersectionsTrigWidget);
  }
})();
