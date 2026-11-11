(function () {
  "use strict";

  /* ================================================================
   * <parametres-graphiques-widget> — atelier interactif : curseurs a, b
   * pour f(x)=a+b·ln(x), point (1;a) toujours affiché, tangente en x=1 de
   * pente b tracée, et une case à cocher pour révéler le point en x=e
   * (f(e)=a+b, le piège de la section). Reprend l'exemple résolu
   * (a=1,b=2) comme réglage par défaut. Mode « Défi » : une courbe cible
   * a₀ + b₀·ln(x) en pointillés, lisible par deux points pris en x = e, e²
   * ou 1/e (jamais en x = 1) ; l'élève règle a et b pour la recouvrir. Pas
   * de score. Web Component (Shadow DOM).
   * ================================================================ */

  var E = Math.E;
  var DEFAUT = { a: 1, b: 2 };
  var BORNES_A = { min: -3, max: 5, step: 0.5 };
  var BORNES_B = { min: -4, max: 4, step: 0.5 };
  var X_MIN = -0.6;
  var LARGEUR = 420, HAUTEUR = 320, MARGE = 34;
  // Fenêtre Y FIXE (jamais recalculée depuis a/b courants), resserrée pour que les points se
  // lisent : la courbe sort simplement du cadre près de x = 0 (asymptote) ou pour les réglages
  // extrêmes — elle est découpée proprement par _traceFonction.
  var Y_MIN_FIXE = -8, Y_MAX_FIXE = 12;
  // Défi : a₀ ∈ {−2 ; −1,5 ; … ; 4}, b₀ ∈ {−3 ; … ; 3} \ {0} (pas de 0,5 comme les curseurs).
  var DEFI_A = { min: -2, max: 4 }, DEFI_B = { min: -3, max: 3 };
  var POINTS_INDICE = [
    { x: E, lnx: 1, nom: "e" },
    { x: E * E, lnx: 2, nom: "e²" },
    { x: 1 / E, lnx: -1, nom: "1/e" },
  ];
  var REGLAGE_DEFI = { a: 0, b: 1 }; // curseurs remis à zéro à chaque nouveau défi

  // « 1 » plutôt que « 1,0 » ; garde « 1,5 ».
  function formatCourt(n) {
    var t = formatNombreFr(n, 1);
    return t.replace(/,0$/, "");
  }

  function tirerDemi(min, max) {
    var n = Math.round((max - min) * 2);
    return min + Math.floor(Math.random() * (n + 1)) / 2;
  }

  // f(x) = a + b·ln(x), écrite proprement : « 2 − 1,5·ln(x) », « ln(x) », « −ln(x) + 3 »…
  function ecrireFormule(a, b) {
    var termeLn;
    if (b === 1) termeLn = "ln(x)";
    else if (b === -1) termeLn = "−ln(x)";
    else termeLn = formatCourt(b) + "·ln(x)";
    if (a === 0) return "f(x) = " + termeLn;
    if (b === 0) return "f(x) = " + formatCourt(a);
    var signe = b > 0 ? " + " : " − ";
    var absLn = Math.abs(b) === 1 ? "ln(x)" : formatCourt(Math.abs(b)) + "·ln(x)";
    return "f(x) = " + formatCourt(a) + signe + absLn;
  }

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
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.2rem;font-weight:600;color:var(--ink,#241f1a);margin:0 0 14px;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.courbe-f{stroke:var(--accent,#a8471f);stroke-width:2.6;fill:none;}' +
    '.tangente{stroke:var(--plan,#5b4ea3);stroke-width:2.2;}' +
    '.point-1{fill:var(--accent,#a8471f);}' +
    '.point-e{fill:var(--good,#2f7a4f);}' +
    '.guide-e{stroke:var(--good,#2f7a4f);stroke-width:1.2;stroke-dasharray:4 3;opacity:0.8;}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.etiquette-1{font-size:11.5px;font-weight:600;fill:var(--accent-ink,#7a3212);font-family:var(--mono,monospace);}' +
    '.etiquette-e{font-size:11.5px;font-weight:600;fill:var(--good,#2f7a4f);font-family:var(--mono,monospace);}' +
    '.case{display:flex;align-items:center;justify-content:center;gap:8px;min-height:44px;font-weight:600;font-size:0.92rem;cursor:pointer;color:var(--good,#2f7a4f);margin-bottom:12px;}' +
    '.case input[type="checkbox"]{width:20px;height:20px;cursor:pointer;accent-color:var(--good,#2f7a4f);}' +
    '.stats{display:flex;align-items:stretch;justify-content:center;gap:6px;margin-top:20px;flex-wrap:wrap;}' +
    '.stat{flex:1 1 130px;min-width:0;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:8px 6px;text-align:center;background:var(--surface,#fff);}' +
    '.stat-label{display:block;font-family:var(--mono,monospace);font-size:10px;letter-spacing:0.02em;color:var(--ink-faint,#9c9083);margin-bottom:5px;}' +
    '.stat-value{display:block;font-variant-numeric:tabular-nums;font-size:0.94rem;font-weight:600;color:var(--accent-ink,#7a3212);white-space:nowrap;}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{margin-top:2px;min-height:44px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '[hidden]{display:none!important;}' +
    '.modes{display:flex;justify-content:center;gap:8px;margin-bottom:14px;}' +
    '.mode{min-height:44px;min-width:96px;padding:8px 16px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink-soft,#6b6055);font-weight:600;cursor:pointer;font-size:0.92rem;font-family:inherit;}' +
    '.mode[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);border-color:var(--accent-soft-line,#e8c4a4);color:var(--accent-ink,#7a3212);}' +
    '.cible{stroke:var(--ink-soft,#6b6055);stroke-width:2.4;stroke-dasharray:7 5;fill:none;}' +
    '.point-cible{fill:var(--surface,#fff);stroke:var(--ink,#241f1a);stroke-width:2.2;}' +
    '.etiquette-cible{font-size:11.5px;font-weight:700;fill:var(--ink,#241f1a);font-family:var(--mono,monospace);}' +
    '.graduation{stroke:var(--ink-faint,#9c9083);stroke-width:1;}' +
    '.etiquette-grad{font-size:10px;fill:var(--ink-faint,#9c9083);font-family:var(--mono,monospace);}' +
    '.defi{margin:0 0 14px;padding:10px 12px;border:1px solid var(--line,#e2d8c8);border-left:3px solid var(--plan,#5b4ea3);border-radius:var(--radius,3px);background:var(--surface,#fff);color:var(--ink,#241f1a);font-size:0.92rem;line-height:1.5;}' +
    '.defi p{margin:0 0 6px;}' +
    '.defi p:last-of-type{margin-bottom:0;}' +
    '.rappel{color:var(--ink-soft,#6b6055);font-size:0.86rem;}' +
    '.verdict{font-weight:700;}' +
    '.verdict.ok{color:var(--good,#2f7a4f);}' +
    '.verdict.pas-encore{color:var(--ink-soft,#6b6055);font-weight:600;}' +
    '.btn-defi{display:block;margin:10px auto 0;min-height:44px;padding:8px 16px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.9rem;font-family:inherit;}' +
    '</style>' +
    '<div class="modes" role="group" aria-label="Mode">' +
    '<button class="mode" id="mode-libre" type="button" aria-pressed="true">Libre</button>' +
    '<button class="mode" id="mode-defi" type="button" aria-pressed="false">Défi</button>' +
    '</div>' +
    '<p class="formule" id="formule"></p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<div class="defi" id="defi" hidden>' +
    '<p id="defi-consigne"></p>' +
    '<p class="rappel">Rappel : ln(1/e) = −1, ln(e) = 1, ln(e²) = 2.</p>' +
    '<p class="verdict" id="verdict"></p>' +
    '<button class="btn-defi" id="nouveau-defi" type="button">Nouveau défi</button>' +
    '</div>' +
    '<label class="case"><input type="checkbox" id="case-e">Révéler le point en x=e</label>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="a">a</label><div class="curseur-row">' +
    '<input type="range" id="a" min="' + BORNES_A.min + '" max="' + BORNES_A.max + '" step="' + BORNES_A.step + '" value="' + DEFAUT.a + '">' +
    '<span class="curseur-valeur" id="a-valeur"></span></div></div>' +
    '<div class="curseur"><label for="b">b</label><div class="curseur-row">' +
    '<input type="range" id="b" min="' + BORNES_B.min + '" max="' + BORNES_B.max + '" step="' + BORNES_B.step + '" value="' + DEFAUT.b + '">' +
    '<span class="curseur-valeur" id="b-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>' +
    '<div class="stats">' +
    '<div class="stat"><span class="stat-label">f(1) = a</span><span class="stat-value" id="val-f1"></span></div>' +
    '<div class="stat"><span class="stat-label">f\'(1) = b</span><span class="stat-value" id="val-fp1"></span></div>' +
    '</div>';

  class ParametresGraphiquesWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  ParametresGraphiquesWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._a = DEFAUT.a;
    this._b = DEFAUT.b;
    this._montrerE = false;
    this._svg = shadow.getElementById("svg");
    this._formule = shadow.getElementById("formule");
    this._caseE = shadow.getElementById("case-e");
    this._inputA = shadow.getElementById("a");
    this._inputB = shadow.getElementById("b");
    this._valeurA = shadow.getElementById("a-valeur");
    this._valeurB = shadow.getElementById("b-valeur");
    this._valF1 = shadow.getElementById("val-f1");
    this._valFp1 = shadow.getElementById("val-fp1");
    this._resetBtn = shadow.getElementById("reset");
    this._btnLibre = shadow.getElementById("mode-libre");
    this._btnDefi = shadow.getElementById("mode-defi");
    this._blocDefi = shadow.getElementById("defi");
    this._consigne = shadow.getElementById("defi-consigne");
    this._verdict = shadow.getElementById("verdict");
    this._btnNouveau = shadow.getElementById("nouveau-defi");
    this._modeDefi = false;
    this._cible = null;
  };

  // Tire une cible (a₀ ; b₀) et deux points-indices distincts, en x = e, e² ou 1/e, dont
  // l'ordonnée reste lisible dans la fenêtre ; jamais la position de départ des curseurs.
  ParametresGraphiquesWidgetClass.prototype._nouveauDefi = function () {
    var a0, b0, pts;
    for (var essai = 0; essai < 200; essai++) {
      a0 = tirerDemi(DEFI_A.min, DEFI_A.max);
      b0 = tirerDemi(DEFI_B.min, DEFI_B.max);
      if (b0 === 0 || (a0 === REGLAGE_DEFI.a && b0 === REGLAGE_DEFI.b)) continue;
      if (this._cible && a0 === this._cible.a && b0 === this._cible.b) continue;
      var ordre = POINTS_INDICE.slice().sort(function () { return Math.random() - 0.5; });
      pts = ordre.slice(0, 2).map(function (p) { return { x: p.x, nom: p.nom, y: a0 + b0 * p.lnx }; });
      if (pts.every(function (p) { return p.y >= Y_MIN_FIXE + 1 && p.y <= Y_MAX_FIXE - 1.5; })) break;
    }
    pts.sort(function (p, q) { return p.x - q.x; });
    this._cible = { a: a0, b: b0, points: pts };
    this._a = REGLAGE_DEFI.a; this._b = REGLAGE_DEFI.b;
    this._inputA.value = String(this._a);
    this._inputB.value = String(this._b);
  };

  ParametresGraphiquesWidgetClass.prototype._changerMode = function (defi) {
    this._modeDefi = defi;
    this._btnLibre.setAttribute("aria-pressed", defi ? "false" : "true");
    this._btnDefi.setAttribute("aria-pressed", defi ? "true" : "false");
    this._blocDefi.hidden = !defi;
    if (defi) {
      this._nouveauDefi();
    } else {
      this._a = DEFAUT.a; this._b = DEFAUT.b;
      this._inputA.value = String(DEFAUT.a);
      this._inputB.value = String(DEFAUT.b);
    }
    this._rendre();
  };

  ParametresGraphiquesWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInputA = function () { self._a = parseFloat(self._inputA.value); self._rendre(); };
    this._onInputB = function () { self._b = parseFloat(self._inputB.value); self._rendre(); };
    this._onToggleE = function () { self._montrerE = self._caseE.checked; self._rendre(); };
    this._onReset = function () {
      var r = self._modeDefi ? REGLAGE_DEFI : DEFAUT;
      self._a = r.a; self._b = r.b; self._montrerE = false;
      self._inputA.value = String(r.a);
      self._inputB.value = String(r.b);
      self._caseE.checked = false;
      self._rendre();
    };
    this._inputA.addEventListener("input", this._onInputA);
    this._inputB.addEventListener("input", this._onInputB);
    this._caseE.addEventListener("change", this._onToggleE);
    this._resetBtn.addEventListener("click", this._onReset);
    this._onLibre = function () { if (self._modeDefi) self._changerMode(false); };
    this._onDefi = function () { if (!self._modeDefi) self._changerMode(true); };
    this._onNouveau = function () { self._nouveauDefi(); self._rendre(); };
    this._btnLibre.addEventListener("click", this._onLibre);
    this._btnDefi.addEventListener("click", this._onDefi);
    this._btnNouveau.addEventListener("click", this._onNouveau);
    this._rendre();
  };

  ParametresGraphiquesWidgetClass.prototype.disconnectedCallback = function () {
    this._inputA.removeEventListener("input", this._onInputA);
    this._inputB.removeEventListener("input", this._onInputB);
    this._caseE.removeEventListener("change", this._onToggleE);
    this._resetBtn.removeEventListener("click", this._onReset);
    this._btnLibre.removeEventListener("click", this._onLibre);
    this._btnDefi.removeEventListener("click", this._onDefi);
    this._btnNouveau.removeEventListener("click", this._onNouveau);
  };

  ParametresGraphiquesWidgetClass.prototype._toPx = function (win, xMath, yMath) {
    var px = MARGE + (xMath - X_MIN) / (win.xMax - X_MIN) * (LARGEUR - 2 * MARGE);
    var py = HAUTEUR - MARGE - (yMath - win.yMin) / (win.yMax - win.yMin) * (HAUTEUR - 2 * MARGE);
    return [px, py];
  };

  ParametresGraphiquesWidgetClass.prototype._traceFonction = function (svg, ns, win, f, xMin, xMax, classe) {
    var self = this;
    var n = 240, segments = [], courant = "", dernierValide = false;
    for (var i = 0; i <= n; i++) {
      var xx = xMin + (i / n) * (xMax - xMin);
      var yy = f(xx);
      var valide = isFinite(yy) && yy >= win.yMin - 0.5 && yy <= win.yMax + 0.5;
      if (valide) {
        var p = self._toPx(win, xx, Math.max(win.yMin, Math.min(win.yMax, yy)));
        courant += (!dernierValide ? "M" : "L") + p[0].toFixed(2) + " " + p[1].toFixed(2) + " ";
      } else if (dernierValide && courant) {
        segments.push(courant.trim());
        courant = "";
      }
      dernierValide = valide;
    }
    if (courant) segments.push(courant.trim());
    segments.forEach(function (seg) {
      svg.appendChild(svgEl(ns, "path", { d: seg, class: classe }));
    });
  };

  ParametresGraphiquesWidgetClass.prototype._segmentTangente = function (win, x0, y0, m) {
    var tXmin = X_MIN - x0, tXmax = win.xMax - x0;
    var tA = (win.yMin - y0) / m, tB = (win.yMax - y0) / m;
    var tYmin = Math.min(tA, tB), tYmax = Math.max(tA, tB);
    var tMin = Math.max(tXmin, tYmin), tMax = Math.min(tXmax, tYmax);
    if (tMin > tMax) return null;
    return [[x0 + tMin, y0 + m * tMin], [x0 + tMax, y0 + m * tMax]];
  };

  ParametresGraphiquesWidgetClass.prototype._rendre = function () {
    var a = this._a, b = this._b;
    var f = function (x) { return x > 0 ? a + b * Math.log(x) : NaN; };
    var fe = a + b; // f(e) = a + b·ln(e) = a + b

    this._formule.textContent = ecrireFormule(a, b);
    this._valeurA.textContent = formatNombreFr(a, 1);
    this._valeurB.textContent = formatNombreFr(b, 1);
    this._valF1.textContent = formatNombreFr(a, 1);
    this._valFp1.textContent = formatNombreFr(b, 1);

    var xMax = 8;
    var win = { xMax: xMax, yMin: Y_MIN_FIXE, yMax: Y_MAX_FIXE };

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
    svg.appendChild(svgEl(ns, "line", { x1: origine[0].toFixed(2), x2: origine[0].toFixed(2), y1: HAUTEUR - MARGE, y2: MARGE, class: "axe", "marker-end": "url(#fleche)" }));
    var etiqX = svgEl(ns, "text", { x: LARGEUR - MARGE + 6, y: origine[1] + 4, class: "etiquette" });
    etiqX.textContent = "x";
    svg.appendChild(etiqX);

    // Graduations : x de 1 à 7, y tous les 4.
    for (var gx = 1; gx <= 7; gx++) {
      var pg = self._toPx(win, gx, 0);
      svg.appendChild(svgEl(ns, "line", { x1: pg[0].toFixed(2), x2: pg[0].toFixed(2), y1: (pg[1] - 3).toFixed(2), y2: (pg[1] + 3).toFixed(2), class: "graduation" }));
      var tg = svgEl(ns, "text", { x: pg[0].toFixed(2), y: (pg[1] + 14).toFixed(2), "text-anchor": "middle", class: "etiquette-grad" });
      tg.textContent = String(gx);
      svg.appendChild(tg);
    }
    for (var gy = Y_MIN_FIXE; gy <= Y_MAX_FIXE; gy += 4) {
      if (gy === 0) continue;
      var py = self._toPx(win, 0, gy);
      svg.appendChild(svgEl(ns, "line", { x1: (py[0] - 3).toFixed(2), x2: (py[0] + 3).toFixed(2), y1: py[1].toFixed(2), y2: py[1].toFixed(2), class: "graduation" }));
      var ty = svgEl(ns, "text", { x: (py[0] - 6).toFixed(2), y: (py[1] + 3).toFixed(2), "text-anchor": "end", class: "etiquette-grad" });
      ty.textContent = formatCourt(gy);
      svg.appendChild(ty);
    }

    var reussi = false;
    if (this._modeDefi && this._cible) {
      var cible = this._cible;
      var fc = function (x) { return x > 0 ? cible.a + cible.b * Math.log(x) : NaN; };
      this._traceFonction(svg, ns, win, fc, 0.02, xMax, "cible");
      cible.points.forEach(function (pt) {
        var pp = self._toPx(win, pt.x, pt.y);
        svg.appendChild(svgEl(ns, "circle", { cx: pp[0].toFixed(2), cy: pp[1].toFixed(2), r: 5, class: "point-cible" }));
        var proche = pp[0] > LARGEUR - 110;
        var et = svgEl(ns, "text", { x: (pp[0] + (proche ? -9 : 9)).toFixed(2), y: (pp[1] + (pt.nom === "1/e" ? 18 : -9)).toFixed(2), "text-anchor": proche ? "end" : "start", class: "etiquette-cible" });
        et.textContent = "(" + pt.nom + " ; " + formatCourt(pt.y) + ")";
        svg.appendChild(et);
      });
      reussi = a === cible.a && b === cible.b;
      this._consigne.textContent = "Recouvre la courbe en pointillés : elle passe par (" + cible.points[0].nom + " ; " +
        formatCourt(cible.points[0].y) + ") et (" + cible.points[1].nom + " ; " + formatCourt(cible.points[1].y) + "). Règle a et b.";
      this._verdict.textContent = reussi
        ? "Bravo : a = " + formatCourt(cible.a) + ", b = " + formatCourt(cible.b) + " — la courbe est recouverte."
        : "Pas encore : ta courbe ne recouvre pas la cible.";
      this._verdict.className = "verdict " + (reussi ? "ok" : "pas-encore");
    }

    var pente = b; // f'(x) = b/x, donc f'(1) = b
    var seg = self._segmentTangente(win, 1, a, pente);
    if (seg) {
      var pT0 = self._toPx(win, seg[0][0], seg[0][1]);
      var pT1 = self._toPx(win, seg[1][0], seg[1][1]);
      svg.appendChild(svgEl(ns, "line", { x1: pT0[0].toFixed(2), y1: pT0[1].toFixed(2), x2: pT1[0].toFixed(2), y2: pT1[1].toFixed(2), class: "tangente" }));
    }

    this._traceFonction(svg, ns, win, f, 0.02, xMax, "courbe-f");

    var p1 = self._toPx(win, 1, a);
    svg.appendChild(svgEl(ns, "circle", { cx: p1[0].toFixed(2), cy: p1[1].toFixed(2), r: 4.5, class: "point-1" }));
    var et1 = svgEl(ns, "text", { x: (p1[0] + 8).toFixed(2), y: (p1[1] - 8).toFixed(2), class: "etiquette-1" });
    et1.textContent = "(1;" + formatNombreFr(a, 1) + ")";
    svg.appendChild(et1);

    if (this._montrerE && fe >= win.yMin && fe <= win.yMax) {
      var pE = self._toPx(win, E, fe);
      var pEaxe = self._toPx(win, E, win.yMin);
      var pEy = self._toPx(win, 0, fe);
      svg.appendChild(svgEl(ns, "line", { x1: pE[0].toFixed(2), y1: pEaxe[1].toFixed(2), x2: pE[0].toFixed(2), y2: pE[1].toFixed(2), class: "guide-e" }));
      svg.appendChild(svgEl(ns, "line", { x1: pE[0].toFixed(2), y1: pE[1].toFixed(2), x2: pEy[0].toFixed(2), y2: pE[1].toFixed(2), class: "guide-e" }));
      svg.appendChild(svgEl(ns, "circle", { cx: pE[0].toFixed(2), cy: pE[1].toFixed(2), r: 4.5, class: "point-e" }));
      var etE = svgEl(ns, "text", { x: (pE[0] + 8).toFixed(2), y: (pE[1] - 8).toFixed(2), class: "etiquette-e" });
      etE.textContent = "f(e)=a+b=" + formatNombreFr(fe, 1);
      svg.appendChild(etE);
    }
  };

  if (!customElements.get("parametres-graphiques-widget")) {
    customElements.define("parametres-graphiques-widget", ParametresGraphiquesWidgetClass);
  }
})();
