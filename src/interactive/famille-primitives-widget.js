(function () {
  "use strict";

  /* ================================================================
   * <famille-primitives-widget> — atelier interactif : choix de f (2x,
   * cos x, eˣ, 1/x) et curseur C pour la famille F + C. La courbe glisse
   * verticalement, la tangente en un point fixe garde TOUJOURS la même
   * pente — l'intuition de la section : un glissement vertical ne change
   * jamais la dérivée. Pour 1/x, deux constantes indépendantes C₁ (x < 0)
   * et C₂ (x > 0) : ℝ₀ n'est pas un intervalle, chaque branche de ln|x| a
   * sa propre constante. Option « Afficher f » (f en pointillés). Réglage
   * par défaut (f = 2x, C = 0) identique à l'ancienne version. Fenêtres
   * fixes par fonction. Web Component (Shadow DOM).
   * ================================================================ */

  var BORNES_C = { min: -3, max: 3, step: 0.5 };
  var LARGEUR = 420, HAUTEUR = 300, MARGE = 34;
  var C_FANEES = [-2, 0, 2];

  function fmt(n, dmax) {
    if (Math.abs(n) < 1e-12) n = 0;
    var s = n.toFixed(dmax);
    if (s.indexOf(".") >= 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
    if (s === "-0") s = "0";
    return s.replace(".", ",").replace("-", "−");
  }

  function signeC(c) {
    if (Math.abs(c) < 1e-9) return " (C = 0)";
    return (c > 0 ? " + " : " − ") + fmt(Math.abs(c), 1);
  }

  var FONCTIONS = {
    x2: {
      label: "f(x) = 2x",
      win: { xMin: -2.4, xMax: 2.4, yMin: -3.5, yMax: 8.3 },
      f: function (x) { return 2 * x; },
      F: function (x) { return x * x; },
      Ftexte: "x²",
      tangentes: [{ x: 1, texte: "pente = f(1) = 2, toujours" }],
    },
    cos: {
      label: "f(x) = cos(x)",
      win: { xMin: -3.6, xMax: 3.6, yMin: -4.5, yMax: 4.5 },
      f: function (x) { return Math.cos(x); },
      F: function (x) { return Math.sin(x); },
      Ftexte: "sin(x)",
      tangentes: [{ x: 0, texte: "pente = f(0) = 1, toujours" }],
    },
    exp: {
      label: "f(x) = eˣ",
      win: { xMin: -3, xMax: 2.2, yMin: -3.5, yMax: 8.3 },
      f: function (x) { return Math.exp(x); },
      F: function (x) { return Math.exp(x); },
      Ftexte: "eˣ",
      tangentes: [{ x: 1, texte: "pente = f(1) = e ≈ 2,72, toujours" }],
    },
    inv: {
      label: "f(x) = 1/x",
      win: { xMin: -4, xMax: 4, yMin: -4.5, yMax: 4.5 },
      f: function (x) { return 1 / x; },
      F: function (x) { return Math.log(Math.abs(x)); },
      Ftexte: "ln|x|",
      tangentes: [
        { x: -1, texte: "pente = f(−1) = −1" },
        { x: 1, texte: "pente = f(1) = 1" },
      ],
    },
  };

  function svgEl(ns, tag, attrs) {
    var el = document.createElementNS(ns, tag);
    for (var key in attrs) el.setAttribute(key, attrs[key]);
    return el;
  }

  function curseurHtml(id, label) {
    return '<div class="curseur" id="bloc-' + id + '"><label for="' + id + '">' + label + '</label><div class="curseur-row">' +
      '<input type="range" id="' + id + '" min="' + BORNES_C.min + '" max="' + BORNES_C.max + '" step="' + BORNES_C.step + '" value="0">' +
      '<span class="curseur-valeur" id="' + id + '-valeur"></span></div></div>';
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.ligne-select{display:flex;align-items:center;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:12px;}' +
    '.ligne-select label{font-weight:600;color:var(--ink,#241f1a);}' +
    'select{font:inherit;min-height:44px;padding:6px 10px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);}' +
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.05rem;font-weight:600;color:var(--ink,#241f1a);margin:0 0 12px;overflow-wrap:anywhere;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.courbe{stroke:var(--accent,#a8471f);stroke-width:2.6;fill:none;}' +
    '.courbe-fanee{stroke:var(--ink-faint,#c9beae);stroke-width:1.3;fill:none;}' +
    '.courbe-f{stroke:var(--good,#2f7a4f);stroke-width:1.8;fill:none;stroke-dasharray:5 4;}' +
    '.asymptote{stroke:var(--ink-faint,#c9beae);stroke-width:1.2;stroke-dasharray:4 4;}' +
    '.tangente{stroke:var(--plan,#5b4ea3);stroke-width:2.2;}' +
    '.point-tangente{fill:var(--plan,#5b4ea3);}' +
    '.etiquette-tangente{font-size:11px;font-weight:600;fill:var(--plan,#5b4ea3);font-family:var(--sans,sans-serif);paint-order:stroke;stroke:var(--surface-2,#faf6f0);stroke-width:3px;stroke-linejoin:round;}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.etiquette-f{font-size:11px;font-weight:600;fill:var(--good,#2f7a4f);font-family:var(--sans,sans-serif);}' +
    '.note{text-align:center;font-size:0.88rem;color:var(--ink-soft,#6b6055);margin:0 0 18px;padding:10px 14px;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.note strong{color:var(--ink,#241f1a);}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-width:0;min-height:44px;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:48px;text-align:right;font-size:0.92rem;}' +
    '.case{display:flex;align-items:center;gap:10px;min-height:44px;cursor:pointer;color:var(--ink,#241f1a);font-weight:600;}' +
    '.case input{width:22px;height:22px;accent-color:var(--good,#2f7a4f);}' +
    '.btn-reset{min-height:44px;margin-top:2px;padding:8px 16px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '[hidden]{display:none!important;}' +
    '</style>' +
    '<div class="ligne-select"><label for="fonction">Fonction f</label>' +
    '<select id="fonction">' +
    '<option value="x2">f(x) = 2x</option>' +
    '<option value="cos">f(x) = cos(x)</option>' +
    '<option value="exp">f(x) = eˣ</option>' +
    '<option value="inv">f(x) = 1/x</option>' +
    '</select></div>' +
    '<p class="formule" id="formule"></p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<p class="note" id="note"></p>' +
    '<div class="controles">' +
    curseurHtml("c", "C") +
    curseurHtml("c1", "C₁ — branche x &lt; 0") +
    curseurHtml("c2", "C₂ — branche x &gt; 0") +
    '<label class="case"><input type="checkbox" id="voir-f"> Afficher f (en pointillés)</label>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class FamillePrimitivesWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  FamillePrimitivesWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._cle = "x2";
    this._c = 0; this._c1 = 0; this._c2 = 0;
    this._voirF = false;
    this._select = shadow.getElementById("fonction");
    this._formule = shadow.getElementById("formule");
    this._svg = shadow.getElementById("svg");
    this._note = shadow.getElementById("note");
    this._inputs = { c: shadow.getElementById("c"), c1: shadow.getElementById("c1"), c2: shadow.getElementById("c2") };
    this._valeurs = { c: shadow.getElementById("c-valeur"), c1: shadow.getElementById("c1-valeur"), c2: shadow.getElementById("c2-valeur") };
    this._blocs = { c: shadow.getElementById("bloc-c"), c1: shadow.getElementById("bloc-c1"), c2: shadow.getElementById("bloc-c2") };
    this._caseF = shadow.getElementById("voir-f");
    this._resetBtn = shadow.getElementById("reset");
  };

  FamillePrimitivesWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onSelect = function () { self._cle = self._select.value; self._rendre(); };
    this._onInput = function (e) { self["_" + e.target.id] = parseFloat(e.target.value); self._rendre(); };
    this._onCase = function () { self._voirF = self._caseF.checked; self._rendre(); };
    this._onReset = function () {
      self._cle = "x2"; self._select.value = "x2";
      self._c = 0; self._c1 = 0; self._c2 = 0;
      ["c", "c1", "c2"].forEach(function (k) { self._inputs[k].value = "0"; });
      self._voirF = false; self._caseF.checked = false;
      self._rendre();
    };
    this._select.addEventListener("change", this._onSelect);
    ["c", "c1", "c2"].forEach(function (k) { self._inputs[k].addEventListener("input", self._onInput); });
    this._caseF.addEventListener("change", this._onCase);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  FamillePrimitivesWidgetClass.prototype.disconnectedCallback = function () {
    var self = this;
    this._select.removeEventListener("change", this._onSelect);
    ["c", "c1", "c2"].forEach(function (k) { self._inputs[k].removeEventListener("input", self._onInput); });
    this._caseF.removeEventListener("change", this._onCase);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  FamillePrimitivesWidgetClass.prototype._toPx = function (xMath, yMath) {
    var w = this._win;
    var px = MARGE + (xMath - w.xMin) / (w.xMax - w.xMin) * (LARGEUR - 2 * MARGE);
    var py = HAUTEUR - MARGE - (yMath - w.yMin) / (w.yMax - w.yMin) * (HAUTEUR - 2 * MARGE);
    return [px, py];
  };

  // Trace y = g(x) sur [x0 ; x1], en coupant le tracé hors de la fenêtre (pas de segments
  // verticaux parasites près d'une asymptote).
  FamillePrimitivesWidgetClass.prototype._trace = function (svg, ns, g, x0, x1, classe) {
    var w = this._win, n = 240, d = "", dedans = false;
    for (var i = 0; i <= n; i++) {
      var x = x0 + (i / n) * (x1 - x0);
      var y = g(x);
      if (!isFinite(y) || y < w.yMin - 0.5 || y > w.yMax + 0.5) { dedans = false; continue; }
      var p = this._toPx(x, Math.max(w.yMin, Math.min(w.yMax, y)));
      d += (dedans ? "L" : "M") + p[0].toFixed(2) + " " + p[1].toFixed(2) + " ";
      dedans = true;
    }
    if (d) svg.appendChild(svgEl(ns, "path", { d: d.trim(), class: classe }));
  };

  FamillePrimitivesWidgetClass.prototype._rendre = function () {
    var self = this;
    var def = FONCTIONS[this._cle];
    var inv = this._cle === "inv";
    this._win = def.win;
    var w = def.win;

    this._blocs.c.hidden = inv;
    this._blocs.c1.hidden = !inv;
    this._blocs.c2.hidden = !inv;
    ["c", "c1", "c2"].forEach(function (k) { self._valeurs[k].textContent = fmt(self["_" + k], 1); });

    var cGauche = inv ? this._c1 : this._c;
    var cDroite = inv ? this._c2 : this._c;
    var Fc = function (x) { return def.F(x) + (x < 0 ? cGauche : cDroite); };

    if (inv) {
      this._formule.textContent = "F(x) = ln|x|" + signeC(this._c1) + " si x < 0 ; ln|x|" + signeC(this._c2) + " si x > 0";
    } else {
      this._formule.textContent = "F(x) = " + def.Ftexte + signeC(this._c) + "   (primitive de " + def.label + ")";
    }

    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    svg.innerHTML = "";
    var defs = svgEl(ns, "defs", {});
    var fleche = svgEl(ns, "marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
    fleche.appendChild(svgEl(ns, "path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
    defs.appendChild(fleche);
    svg.appendChild(defs);

    var origine = self._toPx(0, 0);
    svg.appendChild(svgEl(ns, "line", { x1: MARGE, x2: LARGEUR - MARGE, y1: origine[1].toFixed(2), y2: origine[1].toFixed(2), class: "axe", "marker-end": "url(#fleche)" }));
    svg.appendChild(svgEl(ns, "line", { x1: origine[0].toFixed(2), x2: origine[0].toFixed(2), y1: HAUTEUR - MARGE, y2: MARGE, class: "axe", "marker-end": "url(#fleche)" }));
    var etiqX = svgEl(ns, "text", { x: LARGEUR - MARGE + 6, y: origine[1] + 4, class: "etiquette" });
    etiqX.textContent = "x";
    svg.appendChild(etiqX);

    // Quelques membres de la famille, en fané, pour voir les « pistes » parallèles.
    C_FANEES.forEach(function (cf) {
      var g = function (x) { return def.F(x) + cf; };
      if (inv) {
        self._trace(svg, ns, g, w.xMin, -0.02, "courbe-fanee");
        self._trace(svg, ns, g, 0.02, w.xMax, "courbe-fanee");
      } else {
        self._trace(svg, ns, g, w.xMin, w.xMax, "courbe-fanee");
      }
    });

    if (inv) {
      svg.appendChild(svgEl(ns, "line", { x1: origine[0].toFixed(2), x2: origine[0].toFixed(2), y1: MARGE, y2: HAUTEUR - MARGE, class: "asymptote" }));
    }

    if (this._voirF) {
      if (inv) {
        self._trace(svg, ns, def.f, w.xMin, -0.02, "courbe-f");
        self._trace(svg, ns, def.f, 0.02, w.xMax, "courbe-f");
      } else {
        self._trace(svg, ns, def.f, w.xMin, w.xMax, "courbe-f");
      }
      var xEt = inv ? 2.6 : (this._cle === "cos" ? -3.3 : (this._cle === "exp" ? -2.8 : -2.2));
      var yEt = def.f(xEt);
      var pEt = self._toPx(xEt, Math.max(w.yMin + 0.3, Math.min(w.yMax - 0.3, yEt)));
      var tf = svgEl(ns, "text", { x: pEt[0].toFixed(2), y: (pEt[1] - 8).toFixed(2), class: "etiquette-f" });
      tf.textContent = "f";
      svg.appendChild(tf);
    }

    if (inv) {
      self._trace(svg, ns, Fc, w.xMin, -0.02, "courbe");
      self._trace(svg, ns, Fc, 0.02, w.xMax, "courbe");
    } else {
      self._trace(svg, ns, Fc, w.xMin, w.xMax, "courbe");
    }

    // Tangente en un point fixe : sa pente f(x_T) ne dépend jamais de C.
    def.tangentes.forEach(function (t, idx) {
      var yT = Fc(t.x), pente = def.f(t.x), demi = inv ? 0.7 : 0.6;
      var p0 = self._toPx(t.x - demi, yT - pente * demi);
      var p1 = self._toPx(t.x + demi, yT + pente * demi);
      svg.appendChild(svgEl(ns, "line", { x1: p0[0].toFixed(2), y1: p0[1].toFixed(2), x2: p1[0].toFixed(2), y2: p1[1].toFixed(2), class: "tangente" }));
      var pt = self._toPx(t.x, Math.max(w.yMin, Math.min(w.yMax, yT)));
      svg.appendChild(svgEl(ns, "circle", { cx: pt[0].toFixed(2), cy: pt[1].toFixed(2), r: 4.5, class: "point-tangente" }));
      // Étiquette à gauche du point si elle déborderait du cadre à droite (≈ 5,6 px par caractère).
      var largeurTexte = t.texte.length * 5.6;
      var aGauche = (inv && idx === 0) || pt[0] + 8 + largeurTexte > LARGEUR - 4;
      var et = svgEl(ns, "text", {
        x: (pt[0] + (aGauche ? -8 : 8)).toFixed(2),
        y: (pt[1] + (pt[1] < MARGE + 20 ? 18 : -8)).toFixed(2),
        "text-anchor": aGauche ? "end" : "start",
        class: "etiquette-tangente",
      });
      et.textContent = t.texte;
      svg.appendChild(et);
    });

    if (inv) {
      this._note.innerHTML = "<strong>ℝ₀ n'est pas un intervalle</strong> : chaque branche a sa propre constante. " +
        "Fais varier C₁ et C₂ séparément — la dérivée vaut 1/x partout, quels que soient C₁ et C₂.";
    } else {
      this._note.textContent = "F′(x) = " + def.label.replace("f(x) = ", "") + ", quel que soit C — le glissement vertical ne change jamais la pente, en aucun point.";
    }
  };

  if (!customElements.get("famille-primitives-widget")) {
    customElements.define("famille-primitives-widget", FamillePrimitivesWidgetClass);
  }
})();
