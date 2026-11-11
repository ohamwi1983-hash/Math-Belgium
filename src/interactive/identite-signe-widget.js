(function () {
  "use strict";

  /* ================================================================
   * <identite-signe-widget> — atelier interactif sur l'identité
   * fondamentale cos²θ + sin²θ = 1 : on CONNAÎT sin θ (ou cos θ, au
   * choix), on choisit le quadrant parmi les 2 compatibles avec son signe,
   * et l'atelier montre les DEUX candidats ±√(1 − …) côte à côte — un
   * seul est coché, selon le quadrant (le piège de la section).
   * Valeurs EXACTES quand la valeur connue est « ronde » (fraction de petit
   * dénominateur, ou √2/2, √3/2 via les boutons) ; sinon valeurs
   * approchées, toujours précédées de « ≈ ». Le petit cercle montre M(θ),
   * sa projection P et le triangle rectangle O–P–M d'hypoténuse OM = 1.
   * Réglage par défaut (sin θ = 3/5, quadrant II) : reproduit exactement
   * l'exemple résolu (cos θ = −4/5, tan θ = −3/4). Web Component (Shadow DOM).
   * ================================================================ */

  var PI = Math.PI;
  var DEFAUT = { mode: "sin", valeur: 0.6, quadrant: "II" };
  var BORNES = { min: -0.99, max: 0.99, step: 0.01 };
  // Signe de sin et de cos dans chaque quadrant.
  var SIGNE_SIN = { I: 1, II: 1, III: -1, IV: -1 };
  var SIGNE_COS = { I: 1, II: -1, III: -1, IV: 1 };
  // Dénominateurs « ronds » : au-delà, une fraction exacte n'aide plus l'élève.
  var DENOMINATEURS_RONDS = [1, 2, 3, 4, 5, 6, 8, 10, 12, 13, 17, 25];

  // Valeurs proposées en boutons (positives ; « Changer le signe » donne les négatives).
  // Forme exacte : coef·√rad / den.
  var PRESETS = [
    { id: "p12", texte: "1/2", coef: 1, rad: 1, den: 2 },
    { id: "p35", texte: "3/5", coef: 3, rad: 1, den: 5 },
    { id: "p45", texte: "4/5", coef: 4, rad: 1, den: 5 },
    { id: "p513", texte: "5/13", coef: 5, rad: 1, den: 13 },
    { id: "p1213", texte: "12/13", coef: 12, rad: 1, den: 13 },
    { id: "pr2", texte: "√2/2", coef: 1, rad: 2, den: 2 },
    { id: "pr3", texte: "√3/2", coef: 1, rad: 3, den: 2 },
  ];

  var C_TAILLE = 240, C_CX = 120, C_CY = 120, C_R = 84;

  function pgcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a || 1; }

  // √n = m·√k avec k sans facteur carré.
  function simplifierRacine(n) {
    var m = 1, k = n;
    for (var d = 2; d * d <= k; d++) {
      while (k % (d * d) === 0) { k /= d * d; m *= d; }
    }
    return { m: m, k: k };
  }

  // Exact {s, m, k, d} = s·m·√k / d, fraction réduite.
  function exact(s, m, k, d) {
    if (m === 0) return { s: 1, m: 0, k: 1, d: 1 };
    var g = pgcd(m, d);
    return { s: s, m: m / g, k: k, d: d / g };
  }

  function valeurExacte(e) { return e.s * e.m * Math.sqrt(e.k) / e.d; }

  function texteExact(e) {
    if (e.m === 0) return "0";
    var signe = e.s < 0 ? "−" : "";
    var num = e.k === 1 ? String(e.m) : (e.m === 1 ? "" : String(e.m)) + "√" + e.k;
    return signe + num + (e.d === 1 ? "" : "/" + e.d);
  }

  function formatNombreFr(n, decimales) {
    var facteur = Math.pow(10, decimales);
    var arrondi = Math.round(n * facteur) / facteur;
    if (Object.is(arrondi, -0)) arrondi = 0;
    return arrondi.toFixed(decimales).replace(".", ",").replace("-", "−");
  }

  // « = 0,64 » si l'écriture à `decimales` chiffres est exacte, sinon « ≈ 0,70 ».
  function egalOuEnviron(n, decimales) {
    var facteur = Math.pow(10, decimales);
    var exacteDec = Math.abs(Math.round(n * facteur) / facteur - n) < 1e-9;
    return (exacteDec ? "= " : "≈ ") + formatNombreFr(n, decimales);
  }

  // Reconnaît une valeur décimale du curseur comme fraction « ronde » (ex. 0,6 = 3/5).
  function versExactDepuisDecimal(v) {
    for (var i = 0; i < DENOMINATEURS_RONDS.length; i++) {
      var d = DENOMINATEURS_RONDS[i];
      var n = Math.round(Math.abs(v) * d);
      if (Math.abs(n / d - Math.abs(v)) < 1e-9) return exact(v < 0 ? -1 : 1, n, 1, d);
    }
    return null;
  }

  // À partir de la valeur connue x = s·m√k/d, l'autre vaut ±√(1 − x²) = ±√(d² − m²k)/d.
  function complementExact(e) {
    var radicande = e.d * e.d - e.m * e.m * e.k;
    if (radicande < 0) return null;
    var r = simplifierRacine(radicande);
    return exact(1, r.m, r.k, e.d);
  }

  // Carré exact x² = m²k/d², réduit.
  function carreExact(e) {
    var n = e.m * e.m * e.k, d = e.d * e.d, g = pgcd(n, d);
    return { n: n / g, d: d / g };
  }

  function texteFraction(f) { return f.d === 1 ? String(f.n) : f.n + "/" + f.d; }

  // Quotient exact (s1·m1√k1/d1) / (s2·m2√k2/d2) = s·(m1·d2)√(k1k2) / (m2·d1·k2).
  function quotientExact(a, b) {
    var r = simplifierRacine(a.k * b.k);
    var num = a.m * b.d * r.m, den = b.m * a.d * b.k;
    return exact(a.s * b.s, num, r.k, den);
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
    '.modes{display:flex;gap:8px;justify-content:center;margin-bottom:12px;flex-wrap:wrap;}' +
    '.modes button,.quadrants button,.presets button{min-height:44px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink-soft,#6b6055);font-weight:700;cursor:pointer;font-size:0.9rem;font-family:inherit;}' +
    '.modes button{padding:8px 14px;}' +
    '.modes button.actif,.quadrants button.actif,.presets button.actif{background:var(--accent,#a8471f);border-color:var(--accent,#a8471f);color:#fff;}' +
    '.modes button:focus-visible,.quadrants button:focus-visible,.presets button:focus-visible,.btn-reset:focus-visible{outline:2px solid var(--accent,#a8471f);outline-offset:2px;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:260px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.cercle-ref{stroke:var(--ink-faint,#9c9083);stroke-width:1.4;fill:none;}' +
    '.triangle{fill:var(--accent,#a8471f);fill-opacity:0.08;stroke:none;}' +
    '.cote-connu{stroke:var(--accent,#a8471f);stroke-width:3;stroke-linecap:round;}' +
    '.cote-cherche{stroke:var(--good,#2f7a4f);stroke-width:3;stroke-linecap:round;}' +
    '.angle-arc{stroke:var(--accent,#a8471f);stroke-width:1.6;fill:none;}' +
    '.droite-om{stroke:var(--ink,#241f1a);stroke-width:1.8;}' +
    '.point-m{fill:var(--accent,#a8471f);}' +
    '.angle-droit{stroke:var(--ink-soft,#6b6055);stroke-width:1.2;fill:none;}' +
    '.etiquette{font-size:11px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.etiquette-connu{font-size:11px;font-weight:700;fill:var(--accent-ink,#7a3212);font-family:var(--sans,sans-serif);}' +
    '.etiquette-cherche{font-size:11px;font-weight:700;fill:var(--good,#2f7a4f);font-family:var(--sans,sans-serif);}' +
    '.etiquette-theta{font-size:11.5px;font-weight:700;fill:var(--accent-ink,#7a3212);font-family:var(--sans,sans-serif);}' +
    '.consigne{text-align:center;font-size:0.85rem;color:var(--ink-soft,#6b6055);margin:0 0 6px;}' +
    '.quadrants{display:flex;gap:8px;justify-content:center;margin-bottom:12px;}' +
    '.quadrants button{flex:1 1 0;padding:8px 4px;}' +
    '.quadrants button:disabled{opacity:0.3;cursor:not-allowed;}' +
    '.candidats{display:flex;gap:10px;justify-content:center;margin:0 0 12px;flex-wrap:wrap;}' +
    '.candidat{font-family:inherit;font-size:0.92rem;font-weight:700;padding:6px 10px;border-radius:var(--radius,3px);}' +
    '.candidat-bon{color:var(--good,#2f7a4f);background:var(--surface-2,#faf6f0);}' +
    '.candidat-mauvais{color:var(--bad,#b23a3a);background:var(--surface-2,#faf6f0);text-decoration:line-through;opacity:0.75;}' +
    '.resultat{margin:0 0 18px;padding:10px 14px;border-radius:var(--radius,3px);color:var(--accent-ink,#7a3212);background:var(--surface-2,#faf6f0);font-size:0.9rem;line-height:1.6;}' +
    '.resultat p{margin:0;}' +
    '.resultat p + p{margin-top:4px;}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-height:44px;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:64px;text-align:right;font-size:0.92rem;}' +
    '.presets-titre{font-size:0.82rem;color:var(--ink-soft,#6b6055);margin:0;}' +
    '.presets{display:flex;gap:6px;flex-wrap:wrap;}' +
    '.presets button{flex:1 1 56px;padding:6px 8px;font-family:var(--mono,monospace);}' +
    '.btn-reset{min-height:44px;margin-top:2px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<div class="modes" id="modes" role="group" aria-label="Valeur connue">' +
    '<button type="button" data-mode="sin">sin θ connu</button>' +
    '<button type="button" data-mode="cos">cos θ connu</button>' +
    '</div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + C_TAILLE + ' ' + C_TAILLE + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Cercle trigonométrique avec le point M et le triangle rectangle OPM"></svg></div>' +
    '<p class="consigne" id="consigne"></p>' +
    '<div class="quadrants" id="quadrants" role="group" aria-label="Quadrant de θ">' +
    '<button type="button" data-q="I">I</button>' +
    '<button type="button" data-q="II">II</button>' +
    '<button type="button" data-q="III">III</button>' +
    '<button type="button" data-q="IV">IV</button>' +
    '</div>' +
    '<div class="candidats" id="candidats"></div>' +
    '<div class="resultat" id="resultat"></div>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="val" id="val-label">sin θ (donné)</label><div class="curseur-row">' +
    '<input type="range" id="val" min="' + BORNES.min + '" max="' + BORNES.max + '" step="' + BORNES.step + '" value="' + DEFAUT.valeur + '">' +
    '<span class="curseur-valeur" id="val-valeur"></span></div></div>' +
    '<p class="presets-titre">Valeurs exactes :</p>' +
    '<div class="presets" id="presets">' +
    PRESETS.map(function (p) { return '<button type="button" data-preset="' + p.id + '">' + p.texte + '</button>'; }).join("") +
    '<button type="button" data-preset="signe">Changer le signe</button>' +
    '</div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class IdentiteSigneWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  IdentiteSigneWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._mode = DEFAUT.mode;
    this._valeur = DEFAUT.valeur;
    this._exact = versExactDepuisDecimal(DEFAUT.valeur);
    this._presetId = null;
    this._quadrant = DEFAUT.quadrant;
    this._svg = shadow.getElementById("svg");
    this._modesWrap = shadow.getElementById("modes");
    this._quadrantsWrap = shadow.getElementById("quadrants");
    this._presetsWrap = shadow.getElementById("presets");
    this._consigne = shadow.getElementById("consigne");
    this._candidats = shadow.getElementById("candidats");
    this._resultat = shadow.getElementById("resultat");
    this._input = shadow.getElementById("val");
    this._inputLabel = shadow.getElementById("val-label");
    this._valeurAff = shadow.getElementById("val-valeur");
    this._resetBtn = shadow.getElementById("reset");
  };

  IdentiteSigneWidgetClass.prototype._quadrantsValides = function () {
    var positif = this._valeur >= 0;
    if (this._mode === "sin") return positif ? ["I", "II"] : ["III", "IV"];
    return positif ? ["I", "IV"] : ["II", "III"];
  };

  IdentiteSigneWidgetClass.prototype._ajusterQuadrant = function () {
    var valides = this._quadrantsValides();
    if (valides.indexOf(this._quadrant) === -1) this._quadrant = valides[0];
  };

  IdentiteSigneWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInput = function () {
      var nouvelle = parseFloat(self._input.value);
      // 0 exclu : θ tomberait sur un axe, qui n'appartient à aucun quadrant.
      if (Math.abs(nouvelle) < 1e-9) {
        nouvelle = self._valeur < 0 ? BORNES.step : -BORNES.step;
        self._input.value = String(nouvelle);
      }
      self._valeur = nouvelle;
      self._exact = versExactDepuisDecimal(self._valeur);
      self._presetId = null;
      self._ajusterQuadrant();
      self._rendre();
    };
    this._onClickQuadrant = function (evt) {
      var btn = evt.target.closest("button[data-q]");
      if (!btn || btn.disabled) return;
      self._quadrant = btn.getAttribute("data-q");
      self._rendre();
    };
    this._onClickMode = function (evt) {
      var btn = evt.target.closest("button[data-mode]");
      if (!btn) return;
      self._mode = btn.getAttribute("data-mode");
      self._ajusterQuadrant();
      self._rendre();
    };
    this._onClickPreset = function (evt) {
      var btn = evt.target.closest("button[data-preset]");
      if (!btn) return;
      var id = btn.getAttribute("data-preset");
      if (id === "signe") {
        self._valeur = -self._valeur;
        if (self._exact) self._exact = exact(-self._exact.s, self._exact.m, self._exact.k, self._exact.d);
      } else {
        var p = PRESETS.filter(function (x) { return x.id === id; })[0];
        var signe = self._valeur < 0 ? -1 : 1;
        self._exact = exact(signe, p.coef, p.rad, p.den);
        self._valeur = valeurExacte(self._exact);
        self._presetId = id;
      }
      self._input.value = String(self._valeur);
      self._ajusterQuadrant();
      self._rendre();
    };
    this._onReset = function () {
      self._mode = DEFAUT.mode;
      self._valeur = DEFAUT.valeur;
      self._exact = versExactDepuisDecimal(DEFAUT.valeur);
      self._presetId = null;
      self._quadrant = DEFAUT.quadrant;
      self._input.value = String(DEFAUT.valeur);
      self._rendre();
    };
    this._input.addEventListener("input", this._onInput);
    this._quadrantsWrap.addEventListener("click", this._onClickQuadrant);
    this._modesWrap.addEventListener("click", this._onClickMode);
    this._presetsWrap.addEventListener("click", this._onClickPreset);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  IdentiteSigneWidgetClass.prototype.disconnectedCallback = function () {
    this._input.removeEventListener("input", this._onInput);
    this._quadrantsWrap.removeEventListener("click", this._onClickQuadrant);
    this._modesWrap.removeEventListener("click", this._onClickMode);
    this._presetsWrap.removeEventListener("click", this._onClickPreset);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  IdentiteSigneWidgetClass.prototype._dessinerCercle = function (theta) {
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

    var mx = C_CX + C_R * Math.cos(theta), my = C_CY - C_R * Math.sin(theta);
    var px = mx, py = C_CY;

    // Triangle rectangle O–P–M (rectangle en P, hypoténuse OM = 1).
    svg.appendChild(svgEl(ns, "path", {
      d: "M" + C_CX + " " + C_CY + " L" + px.toFixed(2) + " " + py.toFixed(2) + " L" + mx.toFixed(2) + " " + my.toFixed(2) + " Z",
      class: "triangle",
    }));
    var sinConnu = this._mode === "sin";
    svg.appendChild(svgEl(ns, "line", { x1: C_CX, y1: C_CY, x2: px.toFixed(2), y2: py.toFixed(2), class: sinConnu ? "cote-cherche" : "cote-connu" }));
    svg.appendChild(svgEl(ns, "line", { x1: px.toFixed(2), y1: py.toFixed(2), x2: mx.toFixed(2), y2: my.toFixed(2), class: sinConnu ? "cote-connu" : "cote-cherche" }));

    var tailleAngleDroit = 7;
    var dxDroit = px > C_CX ? -tailleAngleDroit : tailleAngleDroit;
    var dyDroit = my < C_CY ? -tailleAngleDroit : tailleAngleDroit;
    svg.appendChild(svgEl(ns, "path", {
      d: "M" + (px + dxDroit).toFixed(2) + " " + py.toFixed(2) + " L" + (px + dxDroit).toFixed(2) + " " + (py + dyDroit).toFixed(2) +
        " L" + px.toFixed(2) + " " + (py + dyDroit).toFixed(2),
      class: "angle-droit",
    }));

    var rArc = 16;
    var arcEndX = C_CX + rArc * Math.cos(theta), arcEndY = C_CY - rArc * Math.sin(theta);
    var grandArc = theta > PI ? 1 : 0;
    svg.appendChild(svgEl(ns, "path", {
      d: "M" + (C_CX + rArc) + " " + C_CY + " A" + rArc + " " + rArc + " 0 " + grandArc + " 0 " + arcEndX.toFixed(2) + " " + arcEndY.toFixed(2),
      class: "angle-arc",
    }));

    svg.appendChild(svgEl(ns, "line", { x1: C_CX, y1: C_CY, x2: mx.toFixed(2), y2: my.toFixed(2), class: "droite-om" }));
    svg.appendChild(svgEl(ns, "circle", { cx: mx.toFixed(2), cy: my.toFixed(2), r: 5, class: "point-m" }));

    // Étiquettes des deux côtés de l'angle droit. Si OP est court, « cos θ » passe au-delà de P
    // (sinon il chevaucherait l'arc de θ) et « P » change de côté de l'axe.
    var haut = my < C_CY;
    var droite = px >= C_CX;
    var opCourt = Math.abs(px - C_CX) < 46;
    var etCos = svgEl(ns, "text", opCourt ? {
      x: (px + (droite ? 6 : -6)).toFixed(2), y: (haut ? C_CY + 15 : C_CY - 7).toFixed(2), "text-anchor": droite ? "start" : "end",
      class: sinConnu ? "etiquette-cherche" : "etiquette-connu",
    } : {
      x: ((C_CX + px) / 2).toFixed(2), y: (haut ? C_CY + 15 : C_CY - 7).toFixed(2), "text-anchor": "middle",
      class: sinConnu ? "etiquette-cherche" : "etiquette-connu",
    });
    etCos.textContent = "cos θ";
    svg.appendChild(etCos);
    var etSin = svgEl(ns, "text", {
      x: (px + (droite ? 6 : -6)).toFixed(2), y: ((py + my) / 2 + 4).toFixed(2), "text-anchor": droite ? "start" : "end",
      class: sinConnu ? "etiquette-connu" : "etiquette-cherche",
    });
    etSin.textContent = "sin θ";
    svg.appendChild(etSin);
    var etUn = svgEl(ns, "text", {
      x: ((C_CX + mx) / 2 + (droite ? -8 : 8)).toFixed(2), y: ((C_CY + my) / 2 + (haut ? -4 : 12)).toFixed(2),
      "text-anchor": droite ? "end" : "start", class: "etiquette",
    });
    etUn.textContent = "1";
    svg.appendChild(etUn);

    var procheDroite = mx > C_TAILLE - 50;
    var procheGauche = mx < 50;
    var etM = svgEl(ns, "text", {
      x: (mx + (procheDroite ? -9 : 9)).toFixed(2), y: (my + (haut ? -8 : 16)).toFixed(2),
      "text-anchor": procheDroite ? "end" : procheGauche ? "start" : "start", class: "etiquette-theta",
    });
    etM.textContent = "M(θ)";
    svg.appendChild(etM);

    // « O » du côté horizontal opposé à M, hors de l'arc de θ (plus loin si l'arc dépasse un demi-tour).
    var decalO = theta > PI ? 19 : 6;
    var etO = svgEl(ns, "text", { x: droite ? C_CX - decalO : C_CX + decalO, y: (haut ? C_CY + 15 : C_CY - 6), "text-anchor": droite ? "end" : "start", class: "etiquette" });
    etO.textContent = "O";
    svg.appendChild(etO);

    var pCoteM = opCourt ? !haut : haut; // P du côté opposé à M, sauf si « cos θ » y est déjà
    var etP = svgEl(ns, "text", { x: (px + (droite ? 5 : -5)).toFixed(2), y: (pCoteM ? py + 15 : py - 6).toFixed(2), "text-anchor": droite ? "start" : "end", class: "etiquette" });
    etP.textContent = "P";
    svg.appendChild(etP);
  };

  IdentiteSigneWidgetClass.prototype._rendre = function () {
    var self = this;
    var mode = this._mode;
    var autre = mode === "sin" ? "cos" : "sin";
    var v = this._valeur;
    var quadrant = this._quadrant;
    var ex = this._exact;

    // Boutons de mode, presets, quadrants.
    Array.prototype.forEach.call(this._modesWrap.querySelectorAll("button"), function (b) {
      var actif = b.getAttribute("data-mode") === mode;
      b.className = actif ? "actif" : "";
      b.setAttribute("aria-pressed", actif ? "true" : "false");
    });
    Array.prototype.forEach.call(this._presetsWrap.querySelectorAll("button[data-preset]"), function (b) {
      var id = b.getAttribute("data-preset");
      var p = PRESETS.filter(function (x) { return x.id === id; })[0];
      var actif = !!(p && ex && ex.m === p.coef && ex.k === p.rad && ex.d === p.den);
      b.className = actif ? "actif" : "";
    });
    var valides = this._quadrantsValides();
    Array.prototype.forEach.call(this._quadrantsWrap.querySelectorAll("button"), function (btn) {
      var q = btn.getAttribute("data-q");
      var valide = valides.indexOf(q) !== -1;
      btn.disabled = !valide;
      btn.className = q === quadrant && valide ? "actif" : "";
      btn.setAttribute("aria-pressed", q === quadrant && valide ? "true" : "false");
    });

    this._inputLabel.textContent = mode + " θ (donné)";
    var texteDonne = ex ? texteExact(ex) : formatNombreFr(v, 2);
    this._valeurAff.textContent = texteDonne;
    this._consigne.textContent = mode + " θ " + (v >= 0 ? "≥ 0" : "< 0") + " : θ est dans le quadrant " + valides[0] + " ou " + valides[1] + ". Choisis le quadrant :";

    // Angle θ pour le dessin.
    // Angle du premier quadrant dont la coordonnée connue vaut |v|, replacé ensuite dans le quadrant.
    var aigu = mode === "sin" ? Math.asin(Math.min(1, Math.abs(v))) : Math.acos(Math.min(1, Math.abs(v)));
    var theta;
    if (quadrant === "I") theta = aigu;
    else if (quadrant === "II") theta = PI - aigu;
    else if (quadrant === "III") theta = PI + aigu;
    else theta = 2 * PI - aigu;

    var signeAutre = mode === "sin" ? SIGNE_COS[quadrant] : SIGNE_SIN[quadrant];
    var lignes = [];
    var candBon, candMauvais, autreValeur, autreExact = null;

    if (ex) {
      var comp = complementExact(ex);
      var carre = carreExact(ex);
      var reste = { n: carre.d - carre.n, d: carre.d };
      var g = pgcd(reste.n, reste.d);
      reste = { n: reste.n / g, d: reste.d / g };
      var texteCarre = "(" + texteExact(exact(1, ex.m, ex.k, ex.d)) + ")²";
      autreExact = exact(signeAutre, comp.m, comp.k, comp.d);
      autreValeur = valeurExacte(autreExact);
      candBon = autre + " θ = " + texteExact(autreExact);
      candMauvais = autre + " θ = " + texteExact(exact(-signeAutre, comp.m, comp.k, comp.d));
      lignes.push(autre + "²θ = 1 − " + mode + "²θ = 1 − " + texteCarre + " = 1 − " + texteFraction(carre) + " = " + texteFraction(reste));
      lignes.push(autre + " θ = ±√(" + texteFraction(reste) + ") = ±" + texteExact(comp) + " — deux candidats.");
    } else {
      var carreDec = v * v;
      var resteDec = 1 - carreDec;
      var racine = Math.sqrt(Math.max(0, resteDec));
      autreValeur = signeAutre * racine;
      candBon = autre + " θ ≈ " + formatNombreFr(autreValeur, 2);
      candMauvais = autre + " θ ≈ " + formatNombreFr(-autreValeur, 2);
      lignes.push(autre + "²θ = 1 − " + mode + "²θ = 1 − (" + formatNombreFr(Math.abs(v), 2) + ")² = 1 − " + formatNombreFr(carreDec, 4) + " = " + formatNombreFr(resteDec, 4));
      lignes.push(autre + " θ = ±√" + formatNombreFr(resteDec, 4) + " ≈ ±" + formatNombreFr(racine, 2) + " — deux candidats.");
    }
    lignes.push("Quadrant " + quadrant + " : " + autre + " θ y est " + (signeAutre > 0 ? "positif" : "négatif") + ", donc " + candBon + ".");

    // tan θ = sin θ / cos θ.
    var sinEx = null, cosEx = null;
    if (ex) {
      sinEx = mode === "sin" ? ex : autreExact;
      cosEx = mode === "sin" ? autreExact : ex;
    }
    var sinVal = mode === "sin" ? v : autreValeur;
    var cosVal = mode === "sin" ? autreValeur : v;
    if (ex && sinEx && cosEx && cosEx.m !== 0) {
      var tanEx = quotientExact(sinEx, cosEx);
      lignes.push("tan θ = sin θ / cos θ = (" + texteExact(sinEx) + ") / (" + texteExact(cosEx) + ") = " + texteExact(tanEx));
    } else if (Math.abs(cosVal) > 1e-9) {
      lignes.push("tan θ = sin θ / cos θ " + egalOuEnviron(sinVal / cosVal, 2));
    }

    this._candidats.innerHTML = "";
    var spanBon = document.createElement("span");
    spanBon.className = "candidat candidat-bon";
    spanBon.textContent = "✓ " + candBon + " (quadrant " + quadrant + ")";
    var spanMauvais = document.createElement("span");
    spanMauvais.className = "candidat candidat-mauvais";
    spanMauvais.textContent = "✗ " + candMauvais;
    // Ordre fixe : le candidat positif à gauche, le négatif à droite.
    if (signeAutre > 0) { this._candidats.appendChild(spanBon); this._candidats.appendChild(spanMauvais); }
    else { this._candidats.appendChild(spanMauvais); this._candidats.appendChild(spanBon); }

    this._resultat.innerHTML = "";
    lignes.forEach(function (l) {
      var p = document.createElement("p");
      p.textContent = l;
      self._resultat.appendChild(p);
    });

    this._dessinerCercle(theta);
  };

  if (!customElements.get("identite-signe-widget")) {
    customElements.define("identite-signe-widget", IdentiteSigneWidgetClass);
  }
})();
