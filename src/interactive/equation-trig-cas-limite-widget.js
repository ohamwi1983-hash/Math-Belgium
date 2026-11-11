(function () {
  "use strict";

  /* ================================================================
   * <equation-trig-cas-limite-widget> — atelier interactif : sélecteur
   * sin/cos/tan, curseur k (+ boutons des valeurs remarquables) —
   * matérialise la méthode de la section « Résoudre une équation
   * trigonométrique » : l'angle de référence α₀ (aigu, tel que sin, cos ou
   * tan de α₀ vaille |k|), puis la symétrie qui donne les 2 solutions
   * (« α₀ et 180° − α₀ », « 180° + α₀ et 360° − α₀ », etc.). Pour sin/cos,
   * les 2 solutions fusionnent en UNE seule quand |k| = 1, et il n'y en a
   * aucune si |k| > 1 ; pour tan, il y en a TOUJOURS exactement 2.
   * Droite horizontale y = k pour sin, verticale x = k pour cos.
   * Réglage par défaut (cos α = −1/2) : reproduit l'exemple résolu
   * (α = 120° ou 240°). Le cercle a une fenêtre FIXE : seuls la droite et
   * les points bougent. Web Component (Shadow DOM).
   * ================================================================ */

  var D2R = Math.PI / 180;
  var DEFAUT = { fn: "cos", k: -0.5 };
  var BORNES_K_SINCOS = { min: -1.3, max: 1.3, step: 0.01 };
  var BORNES_K_TAN = { min: -4, max: 4, step: 0.05 };
  var R2 = Math.SQRT2 / 2, R3 = Math.sqrt(3) / 2, R33 = Math.sqrt(3) / 3, S3 = Math.sqrt(3);

  // Valeurs remarquables (texte exact, valeur numérique).
  var REMARQUABLES = {
    sincos: [
      ["−1", -1], ["−√3/2", -R3], ["−√2/2", -R2], ["−1/2", -0.5], ["0", 0],
      ["1/2", 0.5], ["√2/2", R2], ["√3/2", R3], ["1", 1],
    ],
    tan: [
      ["−√3", -S3], ["−1", -1], ["−√3/3", -R33], ["0", 0], ["√3/3", R33], ["1", 1], ["√3", S3],
    ],
  };

  var C_TAILLE = 240, C_CX = 120, C_CY = 120, C_R = 84;

  function formatNombreFr(n, decimales) {
    var facteur = Math.pow(10, decimales);
    var arrondi = Math.round(n * facteur) / facteur;
    if (Object.is(arrondi, -0)) arrondi = 0;
    return arrondi.toFixed(decimales).replace(".", ",").replace("-", "−");
  }

  // Écriture sans zéros inutiles : 0,3 plutôt que 0,30 ; 4 plutôt que 4,00.
  function nombreCourt(n, decimales) {
    var t = formatNombreFr(n, decimales);
    return t.indexOf(",") === -1 ? t : t.replace(/0+$/, "").replace(/,$/, "");
  }

  // Un angle en degrés : « = 60° » s'il est entier (à 1e-6 près), sinon « ≈ 45,6° ».
  function angleTexte(deg) {
    var entier = Math.round(deg);
    if (Math.abs(deg - entier) < 1e-6) return { exact: true, txt: String(entier === 360 ? 0 : entier) + "°" };
    return { exact: false, txt: formatNombreFr(deg, 1) + "°" };
  }
  function egal(a) { return (a.exact ? "= " : "≈ ") + a.txt; }

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
    '.formule-row{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;margin-bottom:14px;}' +
    '.formule{font-family:var(--serif,serif);font-style:italic;font-size:1.1rem;font-weight:600;color:var(--ink,#241f1a);}' +
    '.formule-row select{min-height:44px;font-family:inherit;font-size:1.05rem;font-weight:700;color:var(--accent-ink,#7a3212);background:var(--surface,#fff);border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:3px 8px;cursor:pointer;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:260px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.cercle-ref{stroke:var(--ink-faint,#9c9083);stroke-width:1.4;fill:none;}' +
    '.corde{stroke:var(--plan,#5b4ea3);stroke-width:1.6;stroke-dasharray:4 3;opacity:0.85;}' +
    '.repere{stroke:var(--bad,#b23a3a);stroke-width:1.3;stroke-dasharray:4 3;}' +
    '.arc-ref{stroke:var(--good,#2f7a4f);stroke-width:2;fill:none;}' +
    '.rayon-ref{stroke:var(--good,#2f7a4f);stroke-width:1.2;stroke-dasharray:2 3;}' +
    '.point-u{fill:var(--accent,#a8471f);}' +
    '.point-limite{fill:var(--good,#2f7a4f);}' +
    '.etiquette-u{font-size:11px;font-weight:700;fill:var(--accent-ink,#7a3212);font-family:var(--sans,sans-serif);}' +
    '.etiquette-repere{font-size:11px;fill:var(--bad,#b23a3a);font-family:var(--sans,sans-serif);}' +
    '.etiquette-ref{font-size:10.5px;font-weight:700;fill:var(--good,#2f7a4f);font-family:var(--sans,sans-serif);}' +
    '.verdict{font-size:0.9rem;margin:0 0 18px;padding:10px 14px;border-radius:var(--radius,3px);background:var(--surface-2,#faf6f0);line-height:1.6;}' +
    '.verdict p{margin:0;}' +
    '.verdict p + p{margin-top:4px;}' +
    '.verdict .conclusion{font-weight:700;}' +
    '.verdict-normal{color:var(--accent-ink,#7a3212);}' +
    '.verdict-limite{color:var(--good,#2f7a4f);}' +
    '.verdict-tan{color:var(--plan,#5b4ea3);}' +
    '.verdict-aucune{color:var(--bad,#b23a3a);}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-height:44px;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:64px;text-align:right;font-size:0.92rem;}' +
    '.crans-titre{font-size:0.82rem;color:var(--ink-soft,#6b6055);margin:0;}' +
    '.crans{display:grid;grid-template-columns:repeat(auto-fill,minmax(66px,1fr));gap:6px;}' +
    '.crans button{white-space:nowrap;min-height:44px;padding:6px 6px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink-soft,#6b6055);font-weight:700;cursor:pointer;font-size:0.88rem;font-family:var(--mono,monospace);}' +
    '.crans button.actif{background:var(--accent,#a8471f);border-color:var(--accent,#a8471f);color:#fff;}' +
    '.crans button:focus-visible,.btn-reset:focus-visible{outline:2px solid var(--accent,#a8471f);outline-offset:2px;}' +
    '.btn-reset{min-height:44px;margin-top:2px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<div class="formule-row"><select id="fn" aria-label="Fonction">' +
    '<option value="sin">sin α</option>' +
    '<option value="cos">cos α</option>' +
    '<option value="tan">tan α</option>' +
    '</select><span class="formule" id="formule">= k</span></div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + C_TAILLE + ' ' + C_TAILLE + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Cercle trigonométrique et solutions de l\'équation"></svg></div>' +
    '<div class="verdict" id="verdict"></div>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="k">k</label><div class="curseur-row">' +
    '<input type="range" id="k" min="' + BORNES_K_SINCOS.min + '" max="' + BORNES_K_SINCOS.max + '" step="' + BORNES_K_SINCOS.step + '" value="' + DEFAUT.k + '">' +
    '<span class="curseur-valeur" id="k-valeur"></span></div></div>' +
    '<p class="crans-titre">Valeurs remarquables de k :</p>' +
    '<div class="crans" id="crans"></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class EquationTrigCasLimiteWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  EquationTrigCasLimiteWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._fn = DEFAUT.fn;
    this._k = DEFAUT.k;
    this._kTexte = null;
    this._svg = shadow.getElementById("svg");
    this._selectFn = shadow.getElementById("fn");
    this._formule = shadow.getElementById("formule");
    this._verdict = shadow.getElementById("verdict");
    this._inputK = shadow.getElementById("k");
    this._valeurK = shadow.getElementById("k-valeur");
    this._crans = shadow.getElementById("crans");
    this._resetBtn = shadow.getElementById("reset");
    this._selectFn.value = this._fn;
  };

  // Retrouve l'écriture exacte de k s'il vaut une valeur remarquable (à 1e-9 près).
  EquationTrigCasLimiteWidgetClass.prototype._reconnaitre = function () {
    var liste = REMARQUABLES[this._fn === "tan" ? "tan" : "sincos"];
    for (var i = 0; i < liste.length; i++) if (Math.abs(liste[i][1] - this._k) < 1e-9) return liste[i][0];
    return null;
  };

  EquationTrigCasLimiteWidgetClass.prototype._construireCrans = function () {
    var liste = REMARQUABLES[this._fn === "tan" ? "tan" : "sincos"];
    this._crans.innerHTML = liste.map(function (r, i) {
      return '<button type="button" data-i="' + i + '">' + r[0] + '</button>';
    }).join("");
  };

  EquationTrigCasLimiteWidgetClass.prototype._appliquerBornes = function () {
    var b = this._fn === "tan" ? BORNES_K_TAN : BORNES_K_SINCOS;
    this._inputK.min = String(b.min);
    this._inputK.max = String(b.max);
    this._inputK.step = String(b.step);
    this._k = Math.max(b.min, Math.min(b.max, this._k));
    this._inputK.value = String(this._k);
  };

  EquationTrigCasLimiteWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInputK = function () {
      self._k = parseFloat(self._inputK.value);
      self._kTexte = self._reconnaitre();
      self._rendre();
    };
    this._onChangeFn = function () {
      self._fn = self._selectFn.value;
      self._appliquerBornes();
      self._construireCrans();
      self._kTexte = self._reconnaitre();
      self._rendre();
    };
    this._onClickCran = function (evt) {
      var btn = evt.target.closest("button[data-i]");
      if (!btn) return;
      var r = REMARQUABLES[self._fn === "tan" ? "tan" : "sincos"][parseInt(btn.getAttribute("data-i"), 10)];
      self._k = r[1];
      self._kTexte = r[0];
      self._inputK.value = String(r[1]);
      self._rendre();
    };
    this._onReset = function () {
      self._fn = DEFAUT.fn;
      self._k = DEFAUT.k;
      self._selectFn.value = DEFAUT.fn;
      self._appliquerBornes();
      self._construireCrans();
      self._kTexte = self._reconnaitre();
      self._rendre();
    };
    this._inputK.addEventListener("input", this._onInputK);
    this._selectFn.addEventListener("change", this._onChangeFn);
    this._crans.addEventListener("click", this._onClickCran);
    this._resetBtn.addEventListener("click", this._onReset);
    this._construireCrans();
    this._kTexte = this._reconnaitre();
    this._rendre();
  };

  EquationTrigCasLimiteWidgetClass.prototype.disconnectedCallback = function () {
    this._inputK.removeEventListener("input", this._onInputK);
    this._selectFn.removeEventListener("change", this._onChangeFn);
    this._crans.removeEventListener("click", this._onClickCran);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  EquationTrigCasLimiteWidgetClass.prototype._pointCercle = function (thetaRad, r) {
    var rr = r === undefined ? C_R : r;
    return [C_CX + rr * Math.cos(thetaRad), C_CY - rr * Math.sin(thetaRad)];
  };

  EquationTrigCasLimiteWidgetClass.prototype._etiquettePoint = function (svg, ns, px, py, texte) {
    var droite = px >= C_CX;
    var procheHaut = py < 24;
    var procheBas = py > C_TAILLE - 20;
    var ancre = droite ? "start" : "end";
    var dx = droite ? 8 : -8;
    if (px > C_TAILLE - 70) { ancre = "end"; dx = -9; }
    if (px < 70) { ancre = "start"; dx = 9; }
    var dy = procheHaut ? 16 : procheBas ? -8 : (py < C_CY ? -9 : 16);
    var t = svgEl(ns, "text", { x: (px + dx).toFixed(2), y: (py + dy).toFixed(2), "text-anchor": ancre, class: "etiquette-u" });
    t.textContent = texte;
    svg.appendChild(t);
  };

  EquationTrigCasLimiteWidgetClass.prototype._rendre = function () {
    var fn = this._fn, k = this._k;
    var kTxt = this._kTexte || nombreCourt(k, 2);
    this._valeurK.textContent = kTxt;
    this._formule.textContent = "= k";
    var self = this;
    Array.prototype.forEach.call(this._crans.querySelectorAll("button"), function (b) {
      var r = REMARQUABLES[fn === "tan" ? "tan" : "sincos"][parseInt(b.getAttribute("data-i"), 10)];
      b.className = Math.abs(r[1] - k) < 1e-9 ? "actif" : "";
    });

    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    svg.innerHTML = "";

    var defs = svgEl(ns, "defs", {});
    var fleche = svgEl(ns, "marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
    fleche.appendChild(svgEl(ns, "path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
    defs.appendChild(fleche);
    svg.appendChild(defs);

    svg.appendChild(svgEl(ns, "circle", { cx: C_CX, cy: C_CY, r: C_R, class: "cercle-ref" }));
    svg.appendChild(svgEl(ns, "line", { x1: C_CX - C_R - 18, x2: C_CX + C_R + 18, y1: C_CY, y2: C_CY, class: "axe", "marker-end": "url(#fleche)" }));
    svg.appendChild(svgEl(ns, "line", { x1: C_CX, x2: C_CX, y1: C_CY + C_R + 18, y2: C_CY - C_R - 18, class: "axe", "marker-end": "url(#fleche)" }));

    // Droite repère : y = k (sin), x = k (cos) — rien pour tan.
    if (fn === "sin") {
      var yRepere = C_CY - k * C_R;
      svg.appendChild(svgEl(ns, "line", { x1: C_CX - C_R - 14, x2: C_CX + C_R + 4, y1: yRepere.toFixed(2), y2: yRepere.toFixed(2), class: "repere" }));
      var etRep = svgEl(ns, "text", { x: (C_CX + C_R + 6).toFixed(2), y: (yRepere + 4).toFixed(2), class: "etiquette-repere" });
      etRep.textContent = "y = k";
      svg.appendChild(etRep);
    } else if (fn === "cos") {
      var xRepere = C_CX + k * C_R;
      svg.appendChild(svgEl(ns, "line", { x1: xRepere.toFixed(2), x2: xRepere.toFixed(2), y1: C_CY - C_R - 4, y2: C_CY + C_R + 14, class: "repere" }));
      var etRep2 = svgEl(ns, "text", { x: xRepere.toFixed(2), y: (C_CY - C_R - 8).toFixed(2), "text-anchor": "middle", class: "etiquette-repere" });
      etRep2.textContent = "x = k";
      svg.appendChild(etRep2);
    }

    var nomFn = fn;
    var absK = Math.abs(k);
    var lignes = [];
    var classe = "verdict-normal";
    var solutions = []; // en degrés
    var alpha0 = null;

    if (fn !== "tan" && absK > 1 + 1e-9) {
      classe = "verdict-aucune";
      lignes.push(nomFn + " α = " + kTxt + " : |k| > 1.");
      lignes.push({ c: "Aucune solution : " + nomFn + " α reste toujours entre −1 et 1, la droite ne coupe plus le cercle." });
    } else {
      // Angle de référence α₀, aigu, tel que sin/cos/tan α₀ = |k|.
      var a0 = fn === "sin" ? Math.asin(Math.min(1, absK)) : fn === "cos" ? Math.acos(Math.min(1, absK)) : Math.atan(absK);
      var a0deg = a0 / D2R;
      alpha0 = angleTexte(a0deg);
      var kAbsTxt = this._kTexte ? this._kTexte.replace("−", "") : nombreCourt(absK, 2);
      lignes.push("Angle de référence : " + nomFn + " α₀ = " + kAbsTxt + "  →  α₀ " + egal(alpha0) + (this._kTexte ? "" : " (touche " + nomFn + "⁻¹ de la calculatrice)"));
      var nul = absK < 1e-9, un = Math.abs(absK - 1) < 1e-9;
      var regle;
      if (fn === "sin") {
        if (nul) { regle = "k = 0 : les 2 solutions sont sur l'axe horizontal"; solutions = [0, 180]; }
        else if (k > 0) { regle = "k > 0 : α₀ et 180° − α₀"; solutions = [a0deg, 180 - a0deg]; }
        else { regle = "k < 0 : 180° + α₀ et 360° − α₀"; solutions = [180 + a0deg, 360 - a0deg]; }
      } else if (fn === "cos") {
        if (nul) { regle = "k = 0 : les 2 solutions sont sur l'axe vertical"; solutions = [90, 270]; }
        else if (un && k > 0) { regle = "k = 1 : α₀ = 0°, et 360° − α₀ = 360° n'est pas dans [0° ; 360°["; solutions = [0, 0]; }
        else if (k > 0) { regle = "k > 0 : α₀ et 360° − α₀"; solutions = [a0deg, 360 - a0deg]; }
        else { regle = "k < 0 : 180° − α₀ et 180° + α₀"; solutions = [180 - a0deg, 180 + a0deg]; }
      } else {
        if (nul) { regle = "k = 0 : les 2 solutions sont sur l'axe horizontal"; solutions = [0, 180]; }
        else if (k > 0) { regle = "k > 0 (quadrants I et III) : α₀ et 180° + α₀"; solutions = [a0deg, 180 + a0deg]; }
        else { regle = "k < 0 (quadrants II et IV) : 180° − α₀ et 360° − α₀"; solutions = [180 - a0deg, 360 - a0deg]; }
      }
      lignes.push("Symétrie — " + regle + ".");
      var s1 = angleTexte(solutions[0]), s2 = angleTexte(solutions[1]);
      var fusion = fn !== "tan" && Math.abs(solutions[0] - solutions[1]) < 1e-6;
      if (fusion) {
        classe = "verdict-limite";
        solutions = [solutions[0]];
        lignes.push({ c: "Cas limite |k| = 1 : les 2 solutions se confondent en UNE seule, α " + egal(s1) + "." });
      } else if (fn === "tan") {
        classe = "verdict-tan";
        lignes.push({ c: "α " + egal(s1) + " ou α " + egal(s2) + " — toujours 2 solutions, espacées de 180°." });
      } else {
        lignes.push({ c: "α " + egal(s1) + " ou α " + egal(s2) + "." });
      }
    }

    // Arc de l'angle de référence α₀ (vert), mesuré depuis l'axe le plus proche du premier point.
    if (alpha0 && solutions.length) {
      var t0 = solutions[0] * D2R;
      // Arc entre la solution et le demi-axe horizontal le plus proche (là où l'angle aigu α₀ se lit).
      var refAxe = (solutions[0] > 90 && solutions[0] < 270) ? Math.PI : (solutions[0] >= 270 ? 2 * Math.PI : 0);
      if (fn === "cos" || fn === "sin" || fn === "tan") {
        var debut = Math.min(refAxe, t0), fin = Math.max(refAxe, t0);
        if (fin - debut > 1e-6 && fin - debut < Math.PI / 2 + 1e-6) {
          var rA = 30;
          var pA = this._pointCercle(debut, rA), pB = this._pointCercle(fin, rA);
          svg.appendChild(svgEl(ns, "path", { d: "M" + pA[0].toFixed(2) + " " + pA[1].toFixed(2) + " A" + rA + " " + rA + " 0 0 0 " + pB[0].toFixed(2) + " " + pB[1].toFixed(2), class: "arc-ref" }));
          var pR = this._pointCercle(t0, C_R);
          svg.appendChild(svgEl(ns, "line", { x1: C_CX, y1: C_CY, x2: pR[0].toFixed(2), y2: pR[1].toFixed(2), class: "rayon-ref" }));
          var mil = (debut + fin) / 2;
          var pE = this._pointCercle(mil, rA + 12);
          var et = svgEl(ns, "text", { x: pE[0].toFixed(2), y: (pE[1] + 4).toFixed(2), "text-anchor": "middle", class: "etiquette-ref" });
          et.textContent = "α₀";
          svg.appendChild(et);
        }
      }
    }

    if (solutions.length === 2) {
      var p0 = self._pointCercle(solutions[0] * D2R), p1 = self._pointCercle(solutions[1] * D2R);
      svg.appendChild(svgEl(ns, "line", { x1: p0[0].toFixed(2), y1: p0[1].toFixed(2), x2: p1[0].toFixed(2), y2: p1[1].toFixed(2), class: "corde" }));
    }
    solutions.forEach(function (deg, i) {
      var p = self._pointCercle(deg * D2R);
      var limite = solutions.length === 1;
      svg.appendChild(svgEl(ns, "circle", { cx: p[0].toFixed(2), cy: p[1].toFixed(2), r: 5, class: limite ? "point-limite" : "point-u" }));
      var a = angleTexte(deg);
      var nom = limite ? "α" : (i === 0 ? "α₁" : "α₂");
      self._etiquettePoint(svg, ns, p[0], p[1], nom + (a.exact ? " = " : " ≈ ") + a.txt);
    });

    this._verdict.className = "verdict " + classe;
    this._verdict.innerHTML = "";
    var entete = document.createElement("p");
    entete.textContent = nomFn + " α = " + kTxt + " sur [0° ; 360°[";
    entete.className = "conclusion";
    this._verdict.appendChild(entete);
    lignes.forEach(function (l) {
      var p = document.createElement("p");
      if (typeof l === "string") p.textContent = l;
      else { p.textContent = l.c; p.className = "conclusion"; }
      self._verdict.appendChild(p);
    });
  };

  if (!customElements.get("equation-trig-cas-limite-widget")) {
    customElements.define("equation-trig-cas-limite-widget", EquationTrigCasLimiteWidgetClass);
  }
})();
