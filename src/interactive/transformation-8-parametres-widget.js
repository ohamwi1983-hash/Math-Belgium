(function () {
  "use strict";

  /* ================================================================
   * <transformation-8-parametres-widget> — atelier interactif : sélecteur
   * de famille (les 6 fonctions de référence) et les 8 paramètres de la
   * formule unifiée f(x) = SOX·(EV/CV)·g(SOY·(CH/EH)·(x-TH)) + TV
   * (CH/EH et EV/CV combinés chacun en un seul facteur positif, SOX/SOY en
   * cases à cocher séparées). Matérialise les deux affirmations de la
   * section : le point caractéristique reste TOUJOURS exactement en x=TH
   * quels que soient les autres paramètres, et le signe à l'intérieur de
   * la parenthèse est toujours opposé au sens du déplacement. Web
   * Component (Shadow DOM).
   * ================================================================ */

  var DEFAUT = { famille: "inverse", th: 3, tv: 2, kh: 1, kv: 1, sox: false, soy: false };
  var BORNES_TH = { min: -3, max: 3, step: 0.5 };
  var BORNES_TV = { min: -3, max: 3, step: 0.5 };
  var BORNES_K = { min: 0.3, max: 3, step: 0.1 };

  // Fenêtres FIXES par famille (changent seulement quand la FAMILLE change, jamais avec TH/TV/kh/
  // kv/SOX/SOY) : bornées pour rester lisibles malgré la plage des curseurs.
  var FAMILLES = {
    carre: { symbole: "x²", g: function (u) { return u * u; }, domaine: "tout", X_MIN: -6, X_MAX: 6, Y_MIN: -2, Y_MAX: 20 },
    cube: { symbole: "x³", g: function (u) { return u * u * u; }, domaine: "tout", X_MIN: -4, X_MAX: 4, Y_MIN: -40, Y_MAX: 40 },
    racine: { symbole: "√x", g: function (u) { return u < 0 ? NaN : Math.sqrt(u); }, domaine: "racine", X_MIN: -6, X_MAX: 6, Y_MIN: -2, Y_MAX: 6 },
    racineCubique: { symbole: "∛x", g: function (u) { return (u < 0 ? -1 : 1) * Math.pow(Math.abs(u), 1 / 3); }, domaine: "tout", X_MIN: -8, X_MAX: 8, Y_MIN: -3, Y_MAX: 3 },
    inverse: { symbole: "1/x", g: function (u) { return Math.abs(u) < 1e-9 ? NaN : 1 / u; }, domaine: "inverse", X_MIN: -6, X_MAX: 6, Y_MIN: -8, Y_MAX: 8 },
    valeurAbsolue: { symbole: "|x|", g: function (u) { return Math.abs(u); }, domaine: "tout", X_MIN: -6, X_MAX: 6, Y_MIN: -2, Y_MAX: 8 },
  };
  var LARGEUR = 420, HAUTEUR = 320, MARGE = 34;

  function formatNombreFr(n, decimales) {
    var facteur = Math.pow(10, decimales);
    var arrondi = Math.round(n * facteur) / facteur;
    return arrondi.toFixed(decimales).replace(".", ",").replace("-", "−");
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
    '.ligne-select{display:flex;align-items:center;gap:10px;justify-content:center;margin-bottom:12px;}' +
    '.ligne-select label{font-weight:600;color:var(--ink,#241f1a);}' +
    'select{font:inherit;padding:6px 10px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);}' +
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1rem;font-weight:600;color:var(--ink,#241f1a);margin:0 0 12px;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.courbe{stroke:var(--accent,#a8471f);stroke-width:2.4;fill:none;}' +
    '.asymptote{stroke:var(--ink-faint,#9c9083);stroke-width:1.2;stroke-dasharray:4 3;}' +
    '.point-caracteristique{fill:var(--plan,#5b4ea3);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.guide-th{stroke:var(--plan,#5b4ea3);stroke-width:1.2;stroke-dasharray:3 3;opacity:0.75;}' +
    '.etiquette-point{font-size:11.5px;font-weight:700;fill:var(--plan,#5b4ea3);font-family:var(--mono,monospace);}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.stats{display:flex;align-items:stretch;justify-content:center;gap:6px;flex-wrap:wrap;margin-bottom:16px;}' +
    '.stat{flex:1 1 90px;min-width:0;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:8px 4px;text-align:center;background:var(--surface,#fff);}' +
    '.stat-label{display:block;font-family:var(--mono,monospace);font-size:10px;letter-spacing:0.02em;color:var(--ink-faint,#9c9083);margin-bottom:5px;}' +
    '.stat-value{display:block;font-variant-numeric:tabular-nums;font-size:0.94rem;font-weight:600;color:var(--plan,#5b4ea3);white-space:nowrap;}' +
    '.cases{display:flex;justify-content:center;gap:20px;margin-bottom:14px;}' +
    '.case{display:flex;align-items:center;gap:7px;font-weight:600;font-size:0.9rem;cursor:pointer;color:var(--ink,#241f1a);}' +
    '.case input[type="checkbox"]{width:16px;height:16px;cursor:pointer;accent-color:var(--accent,#a8471f);}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{margin-top:2px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<div class="ligne-select"><label for="famille">Famille</label>' +
    '<select id="famille">' +
    '<option value="carre">carrée — x²</option>' +
    '<option value="cube">cube — x³</option>' +
    '<option value="racine">racine carrée — √x</option>' +
    '<option value="racineCubique">racine cubique — ∛x</option>' +
    '<option value="inverse">inverse — 1/x</option>' +
    '<option value="valeurAbsolue">valeur absolue — |x|</option>' +
    '</select></div>' +
    '<p class="formule" id="formule"></p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<div class="stats">' +
    '<div class="stat"><span class="stat-label">point caractéristique</span><span class="stat-value" id="val-point"></span></div>' +
    '</div>' +
    '<div class="cases">' +
    '<label class="case"><input type="checkbox" id="sox">SOX (symétrie Ox)</label>' +
    '<label class="case"><input type="checkbox" id="soy">SOY (symétrie Oy)</label>' +
    '</div>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="th">TH — translation horizontale</label><div class="curseur-row">' +
    '<input type="range" id="th" min="' + BORNES_TH.min + '" max="' + BORNES_TH.max + '" step="' + BORNES_TH.step + '" value="' + DEFAUT.th + '">' +
    '<span class="curseur-valeur" id="th-valeur"></span></div></div>' +
    '<div class="curseur"><label for="tv">TV — translation verticale</label><div class="curseur-row">' +
    '<input type="range" id="tv" min="' + BORNES_TV.min + '" max="' + BORNES_TV.max + '" step="' + BORNES_TV.step + '" value="' + DEFAUT.tv + '">' +
    '<span class="curseur-valeur" id="tv-valeur"></span></div></div>' +
    '<div class="curseur"><label for="kh">CH/EH — facteur horizontal</label><div class="curseur-row">' +
    '<input type="range" id="kh" min="' + BORNES_K.min + '" max="' + BORNES_K.max + '" step="' + BORNES_K.step + '" value="' + DEFAUT.kh + '">' +
    '<span class="curseur-valeur" id="kh-valeur"></span></div></div>' +
    '<div class="curseur"><label for="kv">EV/CV — facteur vertical</label><div class="curseur-row">' +
    '<input type="range" id="kv" min="' + BORNES_K.min + '" max="' + BORNES_K.max + '" step="' + BORNES_K.step + '" value="' + DEFAUT.kv + '">' +
    '<span class="curseur-valeur" id="kv-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class Transformation8ParametresWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  Transformation8ParametresWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._famille = DEFAUT.famille;
    this._th = DEFAUT.th;
    this._tv = DEFAUT.tv;
    this._kh = DEFAUT.kh;
    this._kv = DEFAUT.kv;
    this._sox = DEFAUT.sox;
    this._soy = DEFAUT.soy;
    this._selectFamille = shadow.getElementById("famille");
    this._formule = shadow.getElementById("formule");
    this._svg = shadow.getElementById("svg");
    this._valPoint = shadow.getElementById("val-point");
    this._inputTh = shadow.getElementById("th");
    this._inputTv = shadow.getElementById("tv");
    this._inputKh = shadow.getElementById("kh");
    this._inputKv = shadow.getElementById("kv");
    this._caseSox = shadow.getElementById("sox");
    this._caseSoy = shadow.getElementById("soy");
    this._valeurTh = shadow.getElementById("th-valeur");
    this._valeurTv = shadow.getElementById("tv-valeur");
    this._valeurKh = shadow.getElementById("kh-valeur");
    this._valeurKv = shadow.getElementById("kv-valeur");
    this._resetBtn = shadow.getElementById("reset");
    this._selectFamille.value = this._famille;
  };

  Transformation8ParametresWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onChangeFamille = function () { self._famille = self._selectFamille.value; self._rendre(); };
    this._onInputTh = function () { self._th = parseFloat(self._inputTh.value); self._rendre(); };
    this._onInputTv = function () { self._tv = parseFloat(self._inputTv.value); self._rendre(); };
    this._onInputKh = function () { self._kh = parseFloat(self._inputKh.value); self._rendre(); };
    this._onInputKv = function () { self._kv = parseFloat(self._inputKv.value); self._rendre(); };
    this._onChangeSox = function () { self._sox = self._caseSox.checked; self._rendre(); };
    this._onChangeSoy = function () { self._soy = self._caseSoy.checked; self._rendre(); };
    this._onReset = function () {
      self._famille = DEFAUT.famille; self._th = DEFAUT.th; self._tv = DEFAUT.tv;
      self._kh = DEFAUT.kh; self._kv = DEFAUT.kv; self._sox = DEFAUT.sox; self._soy = DEFAUT.soy;
      self._selectFamille.value = DEFAUT.famille;
      self._inputTh.value = String(DEFAUT.th);
      self._inputTv.value = String(DEFAUT.tv);
      self._inputKh.value = String(DEFAUT.kh);
      self._inputKv.value = String(DEFAUT.kv);
      self._caseSox.checked = false;
      self._caseSoy.checked = false;
      self._rendre();
    };
    this._selectFamille.addEventListener("change", this._onChangeFamille);
    this._inputTh.addEventListener("input", this._onInputTh);
    this._inputTv.addEventListener("input", this._onInputTv);
    this._inputKh.addEventListener("input", this._onInputKh);
    this._inputKv.addEventListener("input", this._onInputKv);
    this._caseSox.addEventListener("change", this._onChangeSox);
    this._caseSoy.addEventListener("change", this._onChangeSoy);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  Transformation8ParametresWidgetClass.prototype.disconnectedCallback = function () {
    this._selectFamille.removeEventListener("change", this._onChangeFamille);
    this._inputTh.removeEventListener("input", this._onInputTh);
    this._inputTv.removeEventListener("input", this._onInputTv);
    this._inputKh.removeEventListener("input", this._onInputKh);
    this._inputKv.removeEventListener("input", this._onInputKv);
    this._caseSox.removeEventListener("change", this._onChangeSox);
    this._caseSoy.removeEventListener("change", this._onChangeSoy);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  Transformation8ParametresWidgetClass.prototype._toPx = function (win, xMath, yMath) {
    var px = MARGE + (xMath - win.X_MIN) / (win.X_MAX - win.X_MIN) * (LARGEUR - 2 * MARGE);
    var py = HAUTEUR - MARGE - (yMath - win.Y_MIN) / (win.Y_MAX - win.Y_MIN) * (HAUTEUR - 2 * MARGE);
    return [px, py];
  };

  Transformation8ParametresWidgetClass.prototype._traceIntervalle = function (svg, ns, win, xMin, xMax, f) {
    var self = this;
    if (xMax - xMin < 1e-6) return;
    var n = Math.max(4, Math.round(240 * (xMax - xMin) / (win.X_MAX - win.X_MIN)));
    var segments = [], courant = "", dernierValide = false;
    for (var i = 0; i <= n; i++) {
      var xx = xMin + (i / n) * (xMax - xMin);
      var yy = f(xx);
      var valide = isFinite(yy) && yy >= win.Y_MIN - 0.4 && yy <= win.Y_MAX + 0.4;
      if (valide) {
        var p = self._toPx(win, xx, Math.max(win.Y_MIN, Math.min(win.Y_MAX, yy)));
        courant += (!dernierValide ? "M" : "L") + p[0].toFixed(2) + " " + p[1].toFixed(2) + " ";
      } else if (dernierValide && courant) {
        segments.push(courant.trim());
        courant = "";
      }
      dernierValide = valide;
    }
    if (courant) segments.push(courant.trim());
    segments.forEach(function (seg) {
      svg.appendChild(svgEl(ns, "path", { d: seg, class: "courbe" }));
    });
  };

  Transformation8ParametresWidgetClass.prototype._rendre = function () {
    var famille = this._famille, th = this._th, tv = this._tv, kh = this._kh, kv = this._kv, sox = this._sox, soy = this._soy;
    var def = FAMILLES[famille];
    var win = def;
    var signH = soy ? -1 : 1, signV = sox ? -1 : 1;
    var f = function (x) { return signV * kv * def.g(signH * kh * (x - th)) + tv; };

    this._formule.textContent =
      "f(x) = " + (signV < 0 ? "−" : "") + formatNombreFr(kv, 1) + "·g(" + (signH < 0 ? "−" : "") + formatNombreFr(kh, 1) +
      "·(x" + (th >= 0 ? "−" + formatNombreFr(th, 1) : "+" + formatNombreFr(-th, 1)) + ")) " + (tv >= 0 ? "+ " : "− ") + formatNombreFr(Math.abs(tv), 1) +
      "   [g(x) = " + def.symbole + "]";
    this._valPoint.textContent = "(" + formatNombreFr(th, 1) + " ; " + formatNombreFr(tv, 1) + ")";
    this._valeurTh.textContent = formatNombreFr(th, 1);
    this._valeurTv.textContent = formatNombreFr(tv, 1);
    this._valeurKh.textContent = formatNombreFr(kh, 1);
    this._valeurKv.textContent = formatNombreFr(kv, 1);

    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    svg.innerHTML = "";
    var self = this;

    var defs = svgEl(ns, "defs", {});
    var fleche = svgEl(ns, "marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
    fleche.appendChild(svgEl(ns, "path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
    defs.appendChild(fleche);
    svg.appendChild(defs);

    var origine = self._toPx(win, 0, 0);
    svg.appendChild(svgEl(ns, "line", { x1: MARGE, x2: LARGEUR - MARGE, y1: origine[1].toFixed(2), y2: origine[1].toFixed(2), class: "axe", "marker-end": "url(#fleche)" }));
    var xOrigine = Math.max(win.X_MIN, Math.min(win.X_MAX, 0));
    var origineY = self._toPx(win, xOrigine, 0);
    svg.appendChild(svgEl(ns, "line", { x1: origineY[0].toFixed(2), x2: origineY[0].toFixed(2), y1: HAUTEUR - MARGE, y2: MARGE, class: "axe", "marker-end": "url(#fleche)" }));
    var etiqX = svgEl(ns, "text", { x: LARGEUR - MARGE + 6, y: origine[1] + 4, class: "etiquette" });
    etiqX.textContent = "x";
    svg.appendChild(etiqX);

    if (def.domaine === "inverse") {
      var pAsymH0 = self._toPx(win, win.X_MIN, tv), pAsymH1 = self._toPx(win, win.X_MAX, tv);
      svg.appendChild(svgEl(ns, "line", { x1: pAsymH0[0].toFixed(2), y1: pAsymH0[1].toFixed(2), x2: pAsymH1[0].toFixed(2), y2: pAsymH1[1].toFixed(2), class: "asymptote" }));
      if (th >= win.X_MIN && th <= win.X_MAX) {
        var pAsymV0 = self._toPx(win, th, win.Y_MIN), pAsymV1 = self._toPx(win, th, win.Y_MAX);
        svg.appendChild(svgEl(ns, "line", { x1: pAsymV0[0].toFixed(2), y1: pAsymV0[1].toFixed(2), x2: pAsymV1[0].toFixed(2), y2: pAsymV1[1].toFixed(2), class: "asymptote" }));
      }
      this._traceIntervalle(svg, ns, win, win.X_MIN, th - 0.02, f);
      this._traceIntervalle(svg, ns, win, th + 0.02, win.X_MAX, f);
    } else if (def.domaine === "racine") {
      // Domaine = { x : signH·kh·(x-TH) ≥ 0 } — dépend du signe de SOY, c'est précisément ce que
      // l'astuce désigne comme le seul rôle réellement indépendant de SOY pour cette famille.
      if (signH > 0) this._traceIntervalle(svg, ns, win, th, win.X_MAX, f);
      else this._traceIntervalle(svg, ns, win, win.X_MIN, th, f);
    } else {
      this._traceIntervalle(svg, ns, win, win.X_MIN, win.X_MAX, f);
    }

    // Point caractéristique : TOUJOURS en x=TH (et y=TV), quels que soient kh/kv/SOX/SOY —
    // matérialise l'astuce de la section. Pour l'inverse, c'est l'intersection des asymptotes
    // (pas un point de la courbe elle-même) ; pour les autres familles, g(0)=0 donc f(TH)=TV.
    if (th >= win.X_MIN && th <= win.X_MAX && tv >= win.Y_MIN && tv <= win.Y_MAX) {
      var pC = self._toPx(win, th, tv);
      svg.appendChild(svgEl(ns, "line", { x1: pC[0].toFixed(2), y1: (HAUTEUR - MARGE).toFixed(2), x2: pC[0].toFixed(2), y2: pC[1].toFixed(2), class: "guide-th" }));
      svg.appendChild(svgEl(ns, "circle", { cx: pC[0].toFixed(2), cy: pC[1].toFixed(2), r: 5.5, class: "point-caracteristique" }));
      var etC = svgEl(ns, "text", { x: pC[0].toFixed(2), y: (HAUTEUR - MARGE + 16).toFixed(2), "text-anchor": "middle", class: "etiquette-point" });
      etC.textContent = "x=TH";
      svg.appendChild(etC);
    }
  };

  if (!customElements.get("transformation-8-parametres-widget")) {
    customElements.define("transformation-8-parametres-widget", Transformation8ParametresWidgetClass);
  }
})();
