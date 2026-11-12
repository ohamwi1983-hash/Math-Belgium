(function () {
  "use strict";

  /* ================================================================
   * <point-critique-signe-widget> — atelier interactif : famille
   * f(x)=x³−3kx, curseur k — matérialise en direct le piège de la
   * section : f'(a)=0 ne suffit PAS, il faut que f' CHANGE de signe.
   * k=1 (défaut) reproduit exactement l'exemple résolu du tableau de
   * signes complet (extremums en x=±1, f=∓2). k=0 donne f(x)=x³, même
   * dérivée que l'exemple f(x)=x³+2 de la section (point critique SANS
   * extremum, f' ne change jamais de signe). k<0 : f' > 0 partout,
   * aucun point critique. Sous la courbe : tableau de signes de f' en
   * direct ; case « f'' et concavité » : courbe colorée ∩ (x < 0) / ∪
   * (x > 0), point d'inflexion (0 ; 0) marqué quel que soit k, et
   * tableau de signes de f''(x) = 6x. Web Component (Shadow DOM).
   * ================================================================ */

  var DEFAUT_K = 1;
  var BORNES_K = { min: -0.5, max: 2, step: 0.05 };
  var EPSILON_K = 0.02;

  var X_MIN = -2.5, X_MAX = 2.5, Y_MIN = -22, Y_MAX = 22;
  var LARGEUR = 420, HAUTEUR = 320, MARGE = 34;

  function formatNombreFr(n, decimales) {
    var facteur = Math.pow(10, decimales);
    var arrondi = Math.round(n * facteur) / facteur;
    if (Object.is(arrondi, -0)) arrondi = 0;
    return arrondi.toFixed(decimales).replace(".", ",").replace("-", "−");
  }

  /* Nombre sans zéros inutiles : 1 → « 1 », 1,2247 → « 1,22 ». */
  function frCourt(n) {
    var s = formatNombreFr(n, 2);
    return s.indexOf(",") >= 0 ? s.replace(/0+$/, "").replace(/,$/, "") : s;
  }

  function svgEl(ns, tag, attrs) {
    var el = document.createElementNS(ns, tag);
    for (var key in attrs) el.setAttribute(key, attrs[key]);
    return el;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.05rem;font-weight:600;color:var(--ink,#241f1a);margin:0 0 12px;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.courbe{stroke:var(--accent,#a8471f);stroke-width:2.4;fill:none;}' +
    '.courbe-concave{stroke:var(--rose,#b23a7a);}' +
    '.courbe-convexe{stroke:var(--sky,#2f6fb0);}' +
    '.etiquette-concave{fill:var(--rose,#b23a7a);}' +
    '.etiquette-convexe{fill:var(--sky,#2f6fb0);}' +
    '.tangente{stroke:var(--plan,#5b4ea3);stroke-width:1.4;stroke-dasharray:5 4;}' +
    '.point-max{fill:var(--good,#2f7a4f);}' +
    '.point-min{fill:var(--bad,#b23a3a);}' +
    '.point-inflexion{fill:var(--plan,#5b4ea3);}' +
    '.etiquette{font-size:11.5px;font-weight:700;font-family:var(--sans,sans-serif);}' +
    '.etiquette-max{fill:var(--good,#2f7a4f);}' +
    '.etiquette-min{fill:var(--bad,#b23a3a);}' +
    '.etiquette-inflexion{fill:var(--plan,#5b4ea3);}' +
    '.verdict{text-align:center;font-size:0.88rem;font-weight:600;margin:0 0 18px;padding:10px 14px;border-radius:var(--radius,3px);}' +
    '.verdict-2{color:var(--good,#2f7a4f);background:var(--surface-2,#faf6f0);}' +
    '.verdict-inflexion{color:var(--plan,#5b4ea3);background:var(--surface-2,#faf6f0);}' +
    '.verdict-aucun{color:var(--accent-ink,#7a3212);background:var(--surface-2,#faf6f0);}' +
    '.tables{display:flex;flex-direction:column;gap:10px;margin:0 0 18px;}' +
    'table{width:100%;border-collapse:collapse;font-size:0.88rem;font-variant-numeric:tabular-nums;table-layout:fixed;}' +
    'th,td{border:1px solid var(--line,#ccd8e0);padding:6px 2px;text-align:center;overflow-wrap:anywhere;}' +
    'th{background:var(--surface-2,#faf6f0);font-weight:700;}' +
    'td.lib,th.lib{width:22%;font-weight:700;background:var(--surface-2,#faf6f0);}' +
    '.zero{font-weight:700;}' +
    '.plus{color:var(--good,#2f7a4f);font-weight:700;}' +
    '.moins{color:var(--bad,#b23a3a);font-weight:700;}' +
    '.fl{font-size:1.15rem;line-height:1;}' +
    '.nat{font-size:0.78rem;font-weight:700;}' +
    '.nat-max{color:var(--good,#2f7a4f);}' +
    '.nat-min{color:var(--bad,#b23a3a);}' +
    '.nat-ni{color:var(--plan,#5b4ea3);}' +
    '.conc{font-size:1.1rem;font-weight:700;}' +
    '.conc-moins{color:var(--rose,#b23a7a);}' +
    '.conc-plus{color:var(--sky,#2f6fb0);}' +
    '.case{display:flex;align-items:center;gap:10px;min-height:44px;font-size:0.92rem;cursor:pointer;}' +
    '.case input{width:22px;height:22px;flex:none;accent-color:var(--plan,#5b4ea3);}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{margin-top:2px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<p class="formule" id="formule"></p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<p class="verdict" id="verdict"></p>' +
    '<div class="tables" id="tables"></div>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="k">k</label><div class="curseur-row">' +
    '<input type="range" id="k" min="' + BORNES_K.min + '" max="' + BORNES_K.max + '" step="' + BORNES_K.step + '" value="' + DEFAUT_K + '">' +
    '<span class="curseur-valeur" id="k-valeur"></span></div></div>' +
    '<label class="case"><input type="checkbox" id="concav"> f\'\' et concavité (point d\'inflexion)</label>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class PointCritiqueSigneWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  PointCritiqueSigneWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._k = DEFAUT_K;
    this._formule = shadow.getElementById("formule");
    this._svg = shadow.getElementById("svg");
    this._verdict = shadow.getElementById("verdict");
    this._inputK = shadow.getElementById("k");
    this._valeurK = shadow.getElementById("k-valeur");
    this._resetBtn = shadow.getElementById("reset");
    this._tables = shadow.getElementById("tables");
    this._caseConcav = shadow.getElementById("concav");
    this._concav = false;
  };

  PointCritiqueSigneWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInputK = function () { self._k = parseFloat(self._inputK.value); self._rendre(); };
    this._onReset = function () { self._k = DEFAUT_K; self._inputK.value = String(DEFAUT_K); self._concav = false; self._caseConcav.checked = false; self._rendre(); };
    this._onConcav = function () { self._concav = self._caseConcav.checked; self._rendre(); };
    this._caseConcav.addEventListener("change", this._onConcav);
    this._inputK.addEventListener("input", this._onInputK);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  PointCritiqueSigneWidgetClass.prototype.disconnectedCallback = function () {
    this._inputK.removeEventListener("input", this._onInputK);
    this._resetBtn.removeEventListener("click", this._onReset);
    this._caseConcav.removeEventListener("change", this._onConcav);
  };

  PointCritiqueSigneWidgetClass.prototype._toPx = function (xMath, yMath) {
    var px = MARGE + (xMath - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - 2 * MARGE);
    var py = HAUTEUR - MARGE - (yMath - Y_MIN) / (Y_MAX - Y_MIN) * (HAUTEUR - 2 * MARGE);
    return [px, py];
  };

  PointCritiqueSigneWidgetClass.prototype._traceCourbe = function (svg, ns, f, xDeb, xFin, classe) {
    var self = this;
    var n = 200;
    var d = "";
    if (xDeb === undefined) { xDeb = X_MIN; xFin = X_MAX; classe = "courbe"; }
    for (var i = 0; i <= n; i++) {
      var xx = xDeb + (i / n) * (xFin - xDeb);
      var yy = Math.max(Y_MIN, Math.min(Y_MAX, f(xx)));
      var p = self._toPx(xx, yy);
      d += (i === 0 ? "M" : "L") + p[0].toFixed(2) + " " + p[1].toFixed(2) + " ";
    }
    svg.appendChild(svgEl(ns, "path", { d: d.trim(), class: classe }));
  };

  PointCritiqueSigneWidgetClass.prototype._rendre = function () {
    var k = this._k;
    this._valeurK.textContent = formatNombreFr(k, 2);
    var f = function (x) { return x * x * x - 3 * k * x; };

    this._formule.textContent = "f(x) = x³ − 3·" + formatNombreFr(k, 2) + "·x        f'(x) = 3x² − 3·" + formatNombreFr(k, 2);

    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    svg.innerHTML = "";
    var self = this;

    var defs = svgEl(ns, "defs", {});
    var fleche = svgEl(ns, "marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
    fleche.appendChild(svgEl(ns, "path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
    defs.appendChild(fleche);
    svg.appendChild(defs);

    var origine = self._toPx(0, 0);
    svg.appendChild(svgEl(ns, "line", { x1: MARGE, x2: LARGEUR - MARGE, y1: origine[1].toFixed(2), y2: origine[1].toFixed(2), class: "axe", "marker-end": "url(#fleche)" }));
    svg.appendChild(svgEl(ns, "line", { x1: origine[0].toFixed(2), x2: origine[0].toFixed(2), y1: HAUTEUR - MARGE, y2: MARGE, class: "axe", "marker-end": "url(#fleche)" }));

    if (this._concav) {
      self._traceCourbe(svg, ns, f, X_MIN, 0, "courbe courbe-concave");
      self._traceCourbe(svg, ns, f, 0, X_MAX, "courbe courbe-convexe");
      var pc = self._toPx(-1.9, f(-1.9)), pv = self._toPx(1.9, f(1.9));
      var ec = svgEl(ns, "text", { x: pc[0].toFixed(2), y: (pc[1] - 14).toFixed(2), "text-anchor": "middle", class: "etiquette etiquette-concave" });
      ec.textContent = "∩ concave";
      svg.appendChild(ec);
      var ev = svgEl(ns, "text", { x: pv[0].toFixed(2), y: (pv[1] + 22).toFixed(2), "text-anchor": "middle", class: "etiquette etiquette-convexe" });
      ev.textContent = "∪ convexe";
      svg.appendChild(ev);
    } else {
      self._traceCourbe(svg, ns, f);
    }

    function dessinerPointCritique(x, classePoint, classeEtiquette, texte) {
      var y = f(x);
      var p = self._toPx(x, y);
      var pGauche = self._toPx(X_MIN, y), pDroite = self._toPx(X_MAX, y);
      svg.appendChild(svgEl(ns, "line", { x1: pGauche[0].toFixed(2), y1: p[1].toFixed(2), x2: pDroite[0].toFixed(2), y2: p[1].toFixed(2), class: "tangente" }));
      svg.appendChild(svgEl(ns, "circle", { cx: p[0].toFixed(2), cy: p[1].toFixed(2), r: 5, class: classePoint }));
      var et = svgEl(ns, "text", { x: p[0].toFixed(2), y: (p[1] + (y >= 0 ? -12 : 20)).toFixed(2), "text-anchor": "middle", class: "etiquette " + classeEtiquette });
      et.textContent = texte;
      svg.appendChild(et);
    }

    if (k > EPSILON_K) {
      var racine = Math.sqrt(k);
      dessinerPointCritique(-racine, "point-max", "etiquette-max", "max (" + formatNombreFr(-racine, 2) + " ; " + formatNombreFr(f(-racine), 2) + ")");
      dessinerPointCritique(racine, "point-min", "etiquette-min", "min (" + formatNombreFr(racine, 2) + " ; " + formatNombreFr(f(racine), 2) + ")");
      this._verdict.className = "verdict verdict-2";
      this._verdict.textContent = "f'(x)=3(x²−" + formatNombreFr(k, 2) + ") s'annule en x=±" + formatNombreFr(racine, 2) + " et CHANGE de signe aux deux → 2 vrais extremums.";
    } else if (k >= -EPSILON_K) {
      dessinerPointCritique(0, "point-inflexion", "etiquette-inflexion", "point critique (0 ; 0) — pas d'extremum");
      this._verdict.className = "verdict verdict-inflexion";
      this._verdict.textContent = "f'(x)=3x² ≥ 0 partout, nul seulement en x=0 → f' NE change PAS de signe ⟹ pas d'extremum, point d'inflexion à tangente horizontale (comme f(x)=x³+2 dans l'exemple).";
    } else {
      this._verdict.className = "verdict verdict-aucun";
      this._verdict.textContent = "f'(x)=3x²−3·" + formatNombreFr(k, 2) + " > 0 pour TOUT x (k<0) → aucun point critique, f est strictement croissante sur ℝ.";
    }

    if (this._concav) {
      var o = self._toPx(0, 0);
      svg.appendChild(svgEl(ns, "circle", { cx: o[0].toFixed(2), cy: o[1].toFixed(2), r: 5, class: "point-inflexion" }));
      if (k > EPSILON_K || k < -EPSILON_K) {
        var ei = svgEl(ns, "text", { x: (o[0] + 8).toFixed(2), y: (o[1] - 9).toFixed(2), "text-anchor": "start", class: "etiquette etiquette-inflexion" });
        ei.textContent = "PI (0 ; 0)";
        svg.appendChild(ei);
      }
    }

    this._rendreTables(k);
  };

  /* Tableau de signes de f'(x) = 3(x² − k) en direct, et de f''(x) = 6x si la case est cochée. */
  PointCritiqueSigneWidgetClass.prototype._rendreTables = function (k) {
    var cs = function (signe) { return signe === "+" ? '<td class="plus">+</td>' : signe === "−" ? '<td class="moins">−</td>' : '<td class="zero">0</td>'; };
    var fl = function (haut) { return '<td class="fl">' + (haut ? "↗" : "↘") + '</td>'; };
    var html = "";
    if (k > EPSILON_K) {
      var r = frCourt(Math.sqrt(k));
      html = '<table aria-label="Tableau de signes de f\'">' +
        '<tr><th class="lib">x</th><th>−∞</th><th></th><th>−' + r + '</th><th></th><th>' + r + '</th><th></th><th>+∞</th></tr>' +
        '<tr><td class="lib">f\'(x)</td><td></td>' + cs("+") + cs("0") + cs("−") + cs("0") + cs("+") + '<td></td></tr>' +
        '<tr><td class="lib">f</td><td></td>' + fl(true) + '<td class="nat nat-max">max.</td>' + fl(false) + '<td class="nat nat-min">min.</td>' + fl(true) + '<td></td></tr>' +
        '</table>';
    } else if (k >= -EPSILON_K) {
      html = '<table aria-label="Tableau de signes de f\'">' +
        '<tr><th class="lib">x</th><th>−∞</th><th></th><th>0</th><th></th><th>+∞</th></tr>' +
        '<tr><td class="lib">f\'(x)</td><td></td>' + cs("+") + cs("0") + cs("+") + '<td></td></tr>' +
        '<tr><td class="lib">f</td><td></td>' + fl(true) + '<td class="nat nat-ni">ni max. ni min.</td>' + fl(true) + '<td></td></tr>' +
        '</table>';
    } else {
      html = '<table aria-label="Tableau de signes de f\'">' +
        '<tr><th class="lib">x</th><th>−∞</th><th></th><th>+∞</th></tr>' +
        '<tr><td class="lib">f\'(x)</td><td></td>' + cs("+") + '<td></td></tr>' +
        '<tr><td class="lib">f</td><td></td>' + fl(true) + '<td></td></tr>' +
        '</table>';
    }
    if (this._concav) {
      html += '<table aria-label="Tableau de signes de f\'\'">' +
        '<tr><th class="lib">x</th><th>−∞</th><th></th><th>0</th><th></th><th>+∞</th></tr>' +
        '<tr><td class="lib">f\'\'(x) = 6x</td><td></td>' + cs("−") + cs("0") + cs("+") + '<td></td></tr>' +
        '<tr><td class="lib">f</td><td></td><td class="conc conc-moins">∩</td><td class="nat nat-ni">PI</td><td class="conc conc-plus">∪</td><td></td></tr>' +
        '</table>';
    }
    this._tables.innerHTML = html;
  };

  if (!customElements.get("point-critique-signe-widget")) {
    customElements.define("point-critique-signe-widget", PointCritiqueSigneWidgetClass);
  }
})();
