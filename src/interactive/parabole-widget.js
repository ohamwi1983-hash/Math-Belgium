(function () {
  "use strict";

  /* ================================================================
   * <parabole-widget> — atelier interactif f(x) = ax² + bx + c.
   * Web Component (Shadow DOM) : aucun conflit avec les styles de la page,
   * couleurs empruntées aux variables CSS du chapitre (héritées à travers
   * la frontière du Shadow DOM) pour suivre le thème clair/sombre du lecteur.
   *
   * Deux modes :
   * - « Libre » : curseurs a, b, c, options AS / S / OAO / droite y = bx + c,
   *   zoom et déplacement ; zéros (0, 1 ou 2) marqués sur l'axe et image
   *   affichés en direct.
   * - « Défi des signes » : une parabole tirée au hasard, sans formule ;
   *   l'élève choisit le signe de a, de b et de c, UN SEUL essai, puis la
   *   correction justifie chaque signe (ouverture, ordonnée à l'origine,
   *   position de l'axe x_S = −b/(2a)). Pas de score.
   * ================================================================ */

  var DEFAUT = { a: 1, b: 0, c: 0 };
  var MIN = -3, MAX = 3, STEP = 0.1;
  // Fenêtre de base (zoom = 1, centre par défaut) : X centré sur 0, Y centré sur CENTRE_Y —
  // le zoom agrandit/réduit ces deux demi-portées d'un même facteur autour du centre courant,
  // et le glisser-déposer (pointerdown/move/up sur le SVG) déplace ce centre librement.
  var CENTRE_Y = 2, DEMI_X_BASE = 6, DEMI_Y_BASE = 8;
  var ZOOM_MIN = 0.4, ZOOM_MAX = 5, ZOOM_PAS = 1.3;
  var LARGEUR = 560, HAUTEUR = 420, MARGE = 30;
  var EPS = 1e-9;

  /** Nombre au format français, arrondi au centième (−, virgule). */
  function formatNombreFr(n) {
    var arrondi = Math.round(n * 100) / 100;
    if (Object.is(arrondi, -0)) arrondi = 0;
    return arrondi.toString().replace(".", ",").replace("-", "−");
  }

  /** Vrai si n s'écrit exactement avec au plus deux décimales. */
  function estExactAuCentieme(n) {
    return Math.abs(n * 100 - Math.round(n * 100)) < 1e-6;
  }

  /** « = 1,5 » si la valeur est exacte au centième, « ≈ 1,41 » sinon. */
  function egalOuEnviron(n) {
    return (estExactAuCentieme(n) ? "= " : "≈ ") + formatNombreFr(n);
  }

  /** Arrondit un pas de grille brut vers 1, 2 ou 5 fois une puissance de 10 —
   * évite un nombre de graduations qui explose ou s'effondre en zoomant. */
  function pasAgreable(valeurBrute) {
    var exposant = Math.floor(Math.log10(valeurBrute));
    var fraction = valeurBrute / Math.pow(10, exposant);
    var pasFraction = fraction < 1.5 ? 1 : fraction < 3 ? 2 : fraction < 7 ? 5 : 10;
    return pasFraction * Math.pow(10, exposant);
  }

  function formatFonction(a, b, c) {
    var termes = [];
    if (a !== 0) {
      var coefA = Math.abs(a) === 1 ? "" : formatNombreFr(Math.abs(a));
      termes.push({ signe: a < 0 ? "−" : "", texte: coefA + "x²" });
    }
    if (b !== 0) {
      var coefB = Math.abs(b) === 1 ? "" : formatNombreFr(Math.abs(b));
      termes.push({ signe: b < 0 ? "−" : "+", texte: coefB + "x" });
    }
    if (c !== 0) {
      termes.push({ signe: c < 0 ? "−" : "+", texte: formatNombreFr(Math.abs(c)) });
    }
    if (termes.length === 0) return "0";
    var resultat = (termes[0].signe === "−" ? "−" : "") + termes[0].texte;
    for (var i = 1; i < termes.length; i++) resultat += " " + termes[i].signe + " " + termes[i].texte;
    return resultat;
  }

  /** Zéros de ax² + bx + c (a ≠ 0), triés : [] si Δ < 0, [r] si Δ = 0, [x₁, x₂] sinon. */
  function zerosTrinome(a, b, c) {
    var delta = b * b - 4 * a * c;
    if (Math.abs(delta) < EPS) return [-b / (2 * a)];
    if (delta < 0) return [];
    var r = Math.sqrt(delta);
    var x1 = (-b - r) / (2 * a), x2 = (-b + r) / (2 * a);
    return x1 < x2 ? [x1, x2] : [x2, x1];
  }

  function entierAleatoire(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  /** Parabole du défi : signes de a, b, c tirés uniformément (les 8 combinaisons), valeurs
   * simples, sommet à gauche ou à droite de l'axe Oy de façon lisible (|x_S| ≥ 0,5) et dans
   * la fenêtre fixe [−6 ; 6] × [−6 ; 10], ordonnée à l'origine visible. */
  function tirerParaboleDefi() {
    var modulesA = [0.5, 1, 2];
    for (var essai = 0; essai < 500; essai++) {
      var sa = Math.random() < 0.5 ? 1 : -1;
      var sb = Math.random() < 0.5 ? 1 : -1;
      var sc = Math.random() < 0.5 ? 1 : -1;
      var a = sa * modulesA[entierAleatoire(0, 2)];
      var b = sb * entierAleatoire(1, 4);
      var c = sc * entierAleatoire(1, 4);
      var xS = -b / (2 * a);
      var yS = c - (b * b) / (4 * a);
      if (Math.abs(xS) < 0.5 || Math.abs(xS) > 4) continue;
      if (yS < -5 || yS > 9) continue;
      if (c < -5 || c > 9) continue;
      return { a: a, b: b, c: c };
    }
    return { a: 1, b: -2, c: -3 };
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '[hidden]{display:none!important;}' +
    '.modes{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:0 0 14px;}' +
    '.modes button{min-height:44px;padding:8px 16px;border-radius:3px;border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);font-weight:600;font-family:inherit;font-size:.92rem;cursor:pointer;}' +
    '.modes button[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);border-color:var(--accent,#a8471f);color:var(--accent-ink,#7a3212);}' +
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.35rem;font-weight:600;color:var(--ink,#241f1a);margin:0 0 14px;min-height:1.7rem;}' +
    '.zoom-bar{display:flex;align-items:center;justify-content:flex-end;gap:6px;margin-bottom:8px;}' +
    '.zoom-bar button{width:44px;height:44px;border-radius:3px;border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);font-size:17px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;font-family:inherit;padding:0;}' +
    '.zoom-bar button:hover:not(:disabled){border-color:var(--accent,#a8471f);background:var(--accent-soft,#f6e2d3);}' +
    '.zoom-bar button:disabled{opacity:.4;cursor:not-allowed;}' +
    '.zoom-bar .zoom-reset{font-size:15px;}' +
    '.zoom-valeur{font-variant-numeric:tabular-nums;font-size:.8rem;color:var(--ink-soft,#6b6055);min-width:38px;text-align:center;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;height:auto;max-width:100%;background:var(--surface-2,#faf6f0);border-radius:3px;cursor:grab;touch-action:none;}' +
    'svg.en-deplacement{cursor:grabbing;}' +
    'svg.fixe{cursor:default;touch-action:auto;}' +
    '.infos{margin:0 0 14px;padding:10px 12px;border:1px solid var(--line,#e2d8c8);border-radius:3px;background:var(--surface,#fff);font-size:.92rem;color:var(--ink,#241f1a);line-height:1.5;}' +
    '.infos p{margin:0;}' +
    '.infos p + p{margin-top:4px;}' +
    '.infos strong{color:var(--accent-ink,#7a3212);}' +
    '.controles{display:flex;gap:22px;align-items:flex-start;flex-wrap:wrap;}' +
    '.curseurs{flex:1 1 auto;min-width:220px;}' +
    '.ligne-curseur{display:grid;grid-template-columns:20px 1fr 52px;align-items:center;gap:10px;margin-bottom:6px;min-height:44px;}' +
    '.ligne-curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);text-align:center;}' +
    '.ligne-curseur input[type="range"]{width:100%;min-height:44px;accent-color:var(--accent,#a8471f);}' +
    '.ligne-curseur .valeur{font-variant-numeric:tabular-nums;text-align:right;color:var(--ink-soft,#6b6055);font-size:0.92rem;}' +
    '.btn{min-height:44px;margin-top:8px;padding:8px 14px;border-radius:3px;border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.9rem;font-family:inherit;}' +
    '.btn:hover:not(:disabled){background:var(--accent-soft-line,#e8c4a4);}' +
    '.btn:disabled{opacity:.45;cursor:not-allowed;}' +
    '.options{display:flex;flex-direction:column;gap:2px;padding-left:16px;border-left:1px solid var(--line,#e2d8c8);}' +
    '.options label{display:flex;align-items:center;gap:8px;min-height:44px;font-size:0.9rem;color:var(--ink-soft,#6b6055);cursor:pointer;}' +
    '.options label.desactive{color:var(--ink-faint,#9c9083);cursor:not-allowed;}' +
    '.options input{accent-color:var(--accent,#a8471f);width:18px;height:18px;}' +
    '.math-label{font-family:var(--serif,serif);font-style:italic;}' +
    '.defi-consigne{margin:0 0 10px;font-size:.95rem;color:var(--ink,#241f1a);text-align:center;}' +
    '.groupe-signe{display:grid;grid-template-columns:minmax(90px,auto) 1fr;align-items:center;gap:10px;margin-bottom:6px;}' +
    '.groupe-signe .nom{font-size:.92rem;color:var(--ink,#241f1a);}' +
    '.groupe-signe .nom i{font-family:var(--serif,serif);font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.choix{display:flex;gap:8px;}' +
    '.choix button{min-width:64px;min-height:44px;border-radius:3px;border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);font-size:1.05rem;font-weight:700;font-family:inherit;cursor:pointer;}' +
    '.choix button[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);border-color:var(--accent,#a8471f);color:var(--accent-ink,#7a3212);}' +
    '.choix button:disabled{cursor:default;}' +
    '.choix button.juste{background:var(--good-soft,#e2f0e6);border-color:var(--good,#2f7a4f);color:var(--good,#2f7a4f);}' +
    '.choix button.faux{background:var(--bad-soft,#f6dcdc);border-color:var(--bad,#b3261e);color:var(--bad,#b3261e);}' +
    '.defi-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:6px;}' +
    '.correction{margin-top:12px;padding:10px 12px;border-radius:3px;border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);font-size:.92rem;line-height:1.5;color:var(--ink,#241f1a);}' +
    '.correction p{margin:0;}' +
    '.correction p + p{margin-top:6px;}' +
    '.correction .ok{color:var(--good,#2f7a4f);font-weight:700;}' +
    '.correction .ko{color:var(--bad,#b3261e);font-weight:700;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.grille{stroke:var(--line-soft,#ede5d7);stroke-width:1;}' +
    '.courbe{stroke:var(--accent,#a8471f);stroke-width:2.4;fill:none;}' +
    '.axe-symetrie{stroke:var(--ink-faint,#9c9083);stroke-width:1.4;stroke-dasharray:6 4;}' +
    '.point-sommet{fill:var(--accent,#a8471f);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.point-oao{fill:var(--good,#2f7a4f);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.point-zero{fill:var(--surface,#fff);stroke:#3d72b4;stroke-width:2.2;}' +
    '.etiquette-zero{font-size:11px;fill:#3d72b4;font-family:var(--sans,sans-serif);font-weight:600;}' +
    '.droite-lineaire{stroke:#3d72b4;stroke-width:2.2;}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.graduation{font-size:9.5px;fill:var(--ink-faint,#9c9083);font-family:var(--sans,sans-serif);}' +
    '</style>' +
    '<div class="modes" role="group" aria-label="Mode de l\'atelier">' +
    '<button type="button" id="mode-libre" aria-pressed="true">Libre</button>' +
    '<button type="button" id="mode-defi" aria-pressed="false">Défi des signes</button>' +
    '</div>' +
    '<p class="formule" id="formule"></p>' +
    '<div class="zoom-bar" id="zoom-bar">' +
    '<button type="button" id="zoom-out" aria-label="Dézoomer">−</button>' +
    '<span class="zoom-valeur" id="zoom-valeur">100 %</span>' +
    '<button type="button" id="zoom-in" aria-label="Zoomer">+</button>' +
    '<button type="button" id="zoom-reset" class="zoom-reset" aria-label="Réinitialiser le zoom">⟲</button>' +
    '</div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<div class="infos" id="infos" aria-live="polite"></div>' +
    '<div class="controles" id="controles">' +
    '<div class="curseurs">' +
    '<div class="ligne-curseur"><label for="a">a</label><input type="range" id="a" min="' + MIN + '" max="' + MAX + '" step="' + STEP + '" value="' + DEFAUT.a + '"><span class="valeur" id="a-valeur"></span></div>' +
    '<div class="ligne-curseur"><label for="b">b</label><input type="range" id="b" min="' + MIN + '" max="' + MAX + '" step="' + STEP + '" value="' + DEFAUT.b + '"><span class="valeur" id="b-valeur"></span></div>' +
    '<div class="ligne-curseur"><label for="c">c</label><input type="range" id="c" min="' + MIN + '" max="' + MAX + '" step="' + STEP + '" value="' + DEFAUT.c + '"><span class="valeur" id="c-valeur"></span></div>' +
    '<button class="btn" id="reset" type="button">Fonction de référence</button>' +
    '</div>' +
    '<div class="options">' +
    '<label id="label-as"><input type="checkbox" id="as"> AS</label>' +
    '<label id="label-s"><input type="checkbox" id="s"> S</label>' +
    '<label id="label-oao"><input type="checkbox" id="oao"> OAO</label>' +
    '<label id="label-lineaire"><input type="checkbox" id="lineaire"> <span class="math-label">y = bx + c</span></label>' +
    '</div>' +
    '</div>' +
    '<div class="defi" id="defi" hidden>' +
    '<p class="defi-consigne">Observe la parabole : quel est le signe de <i>a</i>, de <i>b</i> et de <i>c</i> ? Tu n\'as qu\'un essai.</p>' +
    '<div class="groupe-signe"><span class="nom">Signe de <i>a</i></span><div class="choix" data-coef="a"><button type="button" data-signe="1" aria-pressed="false" aria-label="a positif">+</button><button type="button" data-signe="-1" aria-pressed="false" aria-label="a négatif">−</button></div></div>' +
    '<div class="groupe-signe"><span class="nom">Signe de <i>b</i></span><div class="choix" data-coef="b"><button type="button" data-signe="1" aria-pressed="false" aria-label="b positif">+</button><button type="button" data-signe="-1" aria-pressed="false" aria-label="b négatif">−</button></div></div>' +
    '<div class="groupe-signe"><span class="nom">Signe de <i>c</i></span><div class="choix" data-coef="c"><button type="button" data-signe="1" aria-pressed="false" aria-label="c positif">+</button><button type="button" data-signe="-1" aria-pressed="false" aria-label="c négatif">−</button></div></div>' +
    '<div class="defi-actions">' +
    '<button class="btn" id="verifier" type="button" disabled>Vérifier</button>' +
    '<button class="btn" id="nouvelle" type="button">Nouvelle parabole</button>' +
    '</div>' +
    '<div class="correction" id="correction" hidden aria-live="polite"></div>' +
    '</div>';

  class ParaboleWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  ParaboleWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._a = DEFAUT.a; this._b = DEFAUT.b; this._c = DEFAUT.c;
    this._zoom = 1;
    this._centreX = 0;
    this._centreY = CENTRE_Y;
    this._enDeplacement = false;
    this._mode = "libre";
    this._defi = null; // { a, b, c, choix: {a,b,c}, verifie: bool }
    this._svg = shadow.getElementById("svg");
    this._formule = shadow.getElementById("formule");
    this._infos = shadow.getElementById("infos");
    this._controles = shadow.getElementById("controles");
    this._zoomBar = shadow.getElementById("zoom-bar");
    this._blocDefi = shadow.getElementById("defi");
    this._correction = shadow.getElementById("correction");
    this._btnVerifier = shadow.getElementById("verifier");
    this._btnNouvelle = shadow.getElementById("nouvelle");
    this._btnModeLibre = shadow.getElementById("mode-libre");
    this._btnModeDefi = shadow.getElementById("mode-defi");
    this._groupesChoix = Array.prototype.slice.call(shadow.querySelectorAll(".choix"));
    this._inputA = shadow.getElementById("a");
    this._inputB = shadow.getElementById("b");
    this._inputC = shadow.getElementById("c");
    this._valeurA = shadow.getElementById("a-valeur");
    this._valeurB = shadow.getElementById("b-valeur");
    this._valeurC = shadow.getElementById("c-valeur");
    this._checkAS = shadow.getElementById("as");
    this._checkS = shadow.getElementById("s");
    this._checkOAO = shadow.getElementById("oao");
    this._checkLineaire = shadow.getElementById("lineaire");
    this._labelAS = shadow.getElementById("label-as");
    this._labelS = shadow.getElementById("label-s");
    this._resetBtn = shadow.getElementById("reset");
    this._zoomIn = shadow.getElementById("zoom-in");
    this._zoomOut = shadow.getElementById("zoom-out");
    this._zoomReset = shadow.getElementById("zoom-reset");
    this._zoomValeur = shadow.getElementById("zoom-valeur");
  };

  ParaboleWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInput = function () {
      self._a = parseFloat(self._inputA.value);
      self._b = parseFloat(self._inputB.value);
      self._c = parseFloat(self._inputC.value);
      self._rendre();
    };
    this._onReset = function () {
      self._a = DEFAUT.a; self._b = DEFAUT.b; self._c = DEFAUT.c;
      self._inputA.value = String(DEFAUT.a);
      self._inputB.value = String(DEFAUT.b);
      self._inputC.value = String(DEFAUT.c);
      self._rendre();
    };
    this._onChange = function () { self._rendre(); };
    this._onZoomIn = function () { self._appliquerZoom(self._zoom / ZOOM_PAS); };
    this._onZoomOut = function () { self._appliquerZoom(self._zoom * ZOOM_PAS); };
    this._onZoomReset = function () {
      self._zoom = 1; self._centreX = 0; self._centreY = CENTRE_Y;
      self._rendre();
    };
    this._onPointerDown = function (event) {
      if (self._mode !== "libre") return;
      self._enDeplacement = true;
      self._svg.classList.add("en-deplacement");
      self._svg.setPointerCapture(event.pointerId);
      self._dernierClientX = event.clientX;
      self._dernierClientY = event.clientY;
      event.preventDefault();
    };
    this._onPointerMove = function (event) {
      if (!self._enDeplacement) return;
      var rect = self._svg.getBoundingClientRect();
      var echelleX = LARGEUR / rect.width, echelleY = HAUTEUR / rect.height;
      var deltaPxX = (event.clientX - self._dernierClientX) * echelleX;
      var deltaPxY = (event.clientY - self._dernierClientY) * echelleY;
      self._dernierClientX = event.clientX;
      self._dernierClientY = event.clientY;
      var xSpan = self._xMax - self._xMin, ySpan = self._yMax - self._yMin;
      var wPx = LARGEUR - 2 * MARGE, hPx = HAUTEUR - 2 * MARGE;
      self._centreX -= deltaPxX * (xSpan / wPx);
      self._centreY += deltaPxY * (ySpan / hPx);
      self._rendre();
    };
    this._onPointerUp = function () {
      self._enDeplacement = false;
      self._svg.classList.remove("en-deplacement");
    };
    this._onModeLibre = function () { self._changerMode("libre"); };
    this._onModeDefi = function () { self._changerMode("defi"); };
    this._onChoix = function (event) {
      var bouton = event.target.closest("button[data-signe]");
      if (!bouton || !self._defi || self._defi.verifie) return;
      var coef = bouton.parentElement.getAttribute("data-coef");
      self._defi.choix[coef] = parseInt(bouton.getAttribute("data-signe"), 10);
      self._rendreDefiBoutons();
    };
    this._onVerifier = function () {
      if (!self._defi || self._defi.verifie) return;
      var ch = self._defi.choix;
      if (ch.a === 0 || ch.b === 0 || ch.c === 0) return;
      self._defi.verifie = true;
      self._rendre();
    };
    this._onNouvelle = function () { self._nouveauDefi(); };

    this._inputA.addEventListener("input", this._onInput);
    this._inputB.addEventListener("input", this._onInput);
    this._inputC.addEventListener("input", this._onInput);
    this._resetBtn.addEventListener("click", this._onReset);
    this._checkAS.addEventListener("change", this._onChange);
    this._checkS.addEventListener("change", this._onChange);
    this._checkOAO.addEventListener("change", this._onChange);
    this._checkLineaire.addEventListener("change", this._onChange);
    this._zoomIn.addEventListener("click", this._onZoomIn);
    this._zoomOut.addEventListener("click", this._onZoomOut);
    this._zoomReset.addEventListener("click", this._onZoomReset);
    this._svg.addEventListener("pointerdown", this._onPointerDown);
    this._svg.addEventListener("pointermove", this._onPointerMove);
    this._svg.addEventListener("pointerup", this._onPointerUp);
    this._svg.addEventListener("pointercancel", this._onPointerUp);
    this._btnModeLibre.addEventListener("click", this._onModeLibre);
    this._btnModeDefi.addEventListener("click", this._onModeDefi);
    this._blocDefi.addEventListener("click", this._onChoix);
    this._btnVerifier.addEventListener("click", this._onVerifier);
    this._btnNouvelle.addEventListener("click", this._onNouvelle);
    this._rendre();
  };

  ParaboleWidgetClass.prototype.disconnectedCallback = function () {
    this._inputA.removeEventListener("input", this._onInput);
    this._inputB.removeEventListener("input", this._onInput);
    this._inputC.removeEventListener("input", this._onInput);
    this._resetBtn.removeEventListener("click", this._onReset);
    this._checkAS.removeEventListener("change", this._onChange);
    this._checkS.removeEventListener("change", this._onChange);
    this._checkOAO.removeEventListener("change", this._onChange);
    this._checkLineaire.removeEventListener("change", this._onChange);
    this._zoomIn.removeEventListener("click", this._onZoomIn);
    this._zoomOut.removeEventListener("click", this._onZoomOut);
    this._zoomReset.removeEventListener("click", this._onZoomReset);
    this._svg.removeEventListener("pointerdown", this._onPointerDown);
    this._svg.removeEventListener("pointermove", this._onPointerMove);
    this._svg.removeEventListener("pointerup", this._onPointerUp);
    this._svg.removeEventListener("pointercancel", this._onPointerUp);
    this._btnModeLibre.removeEventListener("click", this._onModeLibre);
    this._btnModeDefi.removeEventListener("click", this._onModeDefi);
    this._blocDefi.removeEventListener("click", this._onChoix);
    this._btnVerifier.removeEventListener("click", this._onVerifier);
    this._btnNouvelle.removeEventListener("click", this._onNouvelle);
  };

  ParaboleWidgetClass.prototype._changerMode = function (mode) {
    if (mode === this._mode) return;
    this._mode = mode;
    this._btnModeLibre.setAttribute("aria-pressed", mode === "libre" ? "true" : "false");
    this._btnModeDefi.setAttribute("aria-pressed", mode === "defi" ? "true" : "false");
    if (mode === "defi" && !this._defi) {
      this._nouveauDefi();
      return;
    }
    this._rendre();
  };

  ParaboleWidgetClass.prototype._nouveauDefi = function () {
    var p = tirerParaboleDefi();
    this._defi = { a: p.a, b: p.b, c: p.c, choix: { a: 0, b: 0, c: 0 }, verifie: false };
    this._rendre();
  };

  ParaboleWidgetClass.prototype._appliquerZoom = function (nouveauZoom) {
    this._zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, nouveauZoom));
    this._rendre();
  };

  ParaboleWidgetClass.prototype._toPx = function (xMath, yMath) {
    var px = MARGE + (xMath - this._xMin) / (this._xMax - this._xMin) * (LARGEUR - 2 * MARGE);
    var py = HAUTEUR - MARGE - (yMath - this._yMin) / (this._yMax - this._yMin) * (HAUTEUR - 2 * MARGE);
    return [px, py];
  };

  /** Texte des zéros et de l'image pour f(x) = ax² + bx + c (cas a = 0 compris). */
  function infosZerosImage(a, b, c) {
    var zeros, image;
    if (Math.abs(a) < EPS) {
      if (Math.abs(b) < EPS) {
        zeros = Math.abs(c) < EPS ? "tous les réels annulent f (f est la fonction nulle)." : "aucun : f est constante et ne s'annule jamais.";
        image = "{" + formatNombreFr(c) + "}";
      } else {
        zeros = "un seul, x " + egalOuEnviron(-c / b) + " (a = 0 : ce n'est plus une parabole, mais une droite).";
        image = "ℝ";
      }
      return { zeros: zeros, image: image };
    }
    var z = zerosTrinome(a, b, c);
    if (z.length === 0) zeros = "aucun : la parabole ne coupe pas l'axe des x (Δ < 0).";
    else if (z.length === 1) zeros = "un seul (zéro double), x " + egalOuEnviron(z[0]) + " : le sommet est sur l'axe des x.";
    else zeros = "deux, x₁ " + egalOuEnviron(z[0]) + " et x₂ " + egalOuEnviron(z[1]) + ".";
    var yS = c - (b * b) / (4 * a);
    var bord = formatNombreFr(yS);
    if (a > 0) {
      image = estExactAuCentieme(yS) ? "[" + bord + " ; +∞[" : "[y_S ; +∞[, avec y_S ≈ " + bord;
    } else {
      image = estExactAuCentieme(yS) ? "]−∞ ; " + bord + "]" : "]−∞ ; y_S], avec y_S ≈ " + bord;
    }
    return { zeros: zeros, image: image };
  }

  ParaboleWidgetClass.prototype._rendreDefiBoutons = function () {
    var defi = this._defi;
    this._groupesChoix.forEach(function (groupe) {
      var coef = groupe.getAttribute("data-coef");
      var vrai = defi[coef] > 0 ? 1 : -1;
      Array.prototype.forEach.call(groupe.querySelectorAll("button"), function (bouton) {
        var signe = parseInt(bouton.getAttribute("data-signe"), 10);
        bouton.setAttribute("aria-pressed", defi.choix[coef] === signe ? "true" : "false");
        bouton.disabled = defi.verifie;
        bouton.classList.remove("juste", "faux");
        if (defi.verifie) {
          if (signe === vrai) bouton.classList.add("juste");
          else if (defi.choix[coef] === signe) bouton.classList.add("faux");
        }
      });
    });
    var complet = defi.choix.a !== 0 && defi.choix.b !== 0 && defi.choix.c !== 0;
    this._btnVerifier.disabled = defi.verifie || !complet;
  };

  ParaboleWidgetClass.prototype._rendreCorrection = function () {
    var d = this._defi;
    var ch = d.choix;
    var xS = -d.b / (2 * d.a);
    var marque = function (coef) {
      var vrai = d[coef] > 0 ? 1 : -1;
      return ch[coef] === vrai ? '<span class="ok">✓ juste</span>' : '<span class="ko">✗ faux</span>';
    };
    var signeTexte = function (v) { return v > 0 ? "positif" : "négatif"; };
    var memeSigne = d.a * d.b > 0;
    var lignes = [];
    lignes.push("<p><strong>a " + (d.a > 0 ? "&gt; 0" : "&lt; 0") + "</strong> " + marque("a") + " — la parabole est tournée vers le " +
      (d.a > 0 ? "haut (elle a un minimum)." : "bas (elle a un maximum)."));
    lignes.push("<p><strong>c " + (d.c > 0 ? "&gt; 0" : "&lt; 0") + "</strong> " + marque("c") + " — c = f(0) : la parabole coupe l'axe des y en (0 ; " +
      formatNombreFr(d.c) + "), " + (d.c > 0 ? "au-dessus" : "en dessous") + " de l'origine.");
    lignes.push("<p><strong>b " + (d.b > 0 ? "&gt; 0" : "&lt; 0") + "</strong> " + marque("b") + " — le sommet est à " +
      (xS < 0 ? "gauche" : "droite") + " de l'axe Oy (x_S = " + formatNombreFr(xS) + "). Comme x_S = −b/(2a), l'axe est à gauche de Oy quand a et b ont le même signe : ici a et b sont de signes " +
      (memeSigne ? "identiques" : "contraires") + ", donc b est " + signeTexte(d.b) + ".");
    lignes.push("<p>La parabole était f(x) = " + formatFonction(d.a, d.b, d.c) + ".</p>");
    this._correction.innerHTML = lignes.join("</p>");
  };

  ParaboleWidgetClass.prototype._rendre = function () {
    var enDefi = this._mode === "defi" && !!this._defi;
    var a, b, c;
    if (enDefi) {
      a = this._defi.a; b = this._defi.b; c = this._defi.c;
    } else {
      a = this._a; b = this._b; c = this._c;
    }
    var revele = enDefi && this._defi.verifie;

    this._controles.hidden = enDefi;
    this._zoomBar.hidden = enDefi;
    this._infos.hidden = enDefi;
    this._blocDefi.hidden = !enDefi;
    this._svg.classList.toggle("fixe", enDefi);

    this._valeurA.textContent = formatNombreFr(this._a);
    this._valeurB.textContent = formatNombreFr(this._b);
    this._valeurC.textContent = formatNombreFr(this._c);

    if (enDefi) {
      this._formule.textContent = revele ? "f(x) = " + formatFonction(a, b, c) : "f(x) = ax² + bx + c";
      this._rendreDefiBoutons();
      this._correction.hidden = !revele;
      if (revele) this._rendreCorrection();
    } else {
      this._formule.textContent = "f(x) = " + formatFonction(a, b, c);
      var infos = infosZerosImage(a, b, c);
      this._infos.innerHTML = "<p><strong>Zéros</strong> : " + infos.zeros + "</p><p><strong>Image</strong> : " + infos.image + "</p>";
    }

    var degenere = Math.abs(a) < EPS;
    this._labelAS.classList.toggle("desactive", degenere);
    this._labelS.classList.toggle("desactive", degenere);
    this._checkAS.disabled = degenere;
    this._checkS.disabled = degenere;

    var zoom = enDefi ? 1 : this._zoom;
    var centreX = enDefi ? 0 : this._centreX;
    var centreY = enDefi ? CENTRE_Y : this._centreY;
    var demiX = DEMI_X_BASE * zoom;
    var demiY = DEMI_Y_BASE * zoom;
    this._xMin = centreX - demiX; this._xMax = centreX + demiX;
    this._yMin = centreY - demiY; this._yMax = centreY + demiY;
    this._zoomValeur.textContent = Math.round(100 / this._zoom) + " %";
    this._zoomIn.disabled = this._zoom <= ZOOM_MIN + 1e-9;
    this._zoomOut.disabled = this._zoom >= ZOOM_MAX - 1e-9;

    var X_MIN = this._xMin, X_MAX = this._xMax, Y_MIN = this._yMin, Y_MAX = this._yMax;
    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    svg.innerHTML = "";
    var self = this;

    var pasX = pasAgreable((X_MAX - X_MIN) / 8);
    var pasY = pasAgreable((Y_MAX - Y_MIN) / 8);
    var origine = self._toPx(0, 0);
    // L'axe reste visible au bord du cadre quand l'origine sort de la fenêtre (zoom/déplacement).
    var axeYpx = Math.max(MARGE, Math.min(LARGEUR - MARGE, origine[0]));
    var axeXpx = Math.max(MARGE, Math.min(HAUTEUR - MARGE, origine[1]));

    for (var kx = Math.ceil(X_MIN / pasX); kx * pasX <= X_MAX; kx++) {
      var xVal = kx * pasX;
      var pxg = self._toPx(xVal, 0)[0];
      var lg = document.createElementNS(ns, "line");
      lg.setAttribute("x1", pxg); lg.setAttribute("x2", pxg);
      lg.setAttribute("y1", MARGE); lg.setAttribute("y2", HAUTEUR - MARGE);
      lg.setAttribute("class", "grille");
      svg.appendChild(lg);
      if (kx !== 0) {
        var etiqGx = document.createElementNS(ns, "text");
        etiqGx.setAttribute("x", pxg); etiqGx.setAttribute("y", axeXpx + 13);
        etiqGx.setAttribute("text-anchor", "middle");
        etiqGx.setAttribute("class", "graduation");
        etiqGx.textContent = formatNombreFr(xVal);
        svg.appendChild(etiqGx);
      }
    }
    for (var ky = Math.ceil(Y_MIN / pasY); ky * pasY <= Y_MAX; ky++) {
      var yVal = ky * pasY;
      var pyg = self._toPx(0, yVal)[1];
      var lg2 = document.createElementNS(ns, "line");
      lg2.setAttribute("x1", MARGE); lg2.setAttribute("x2", LARGEUR - MARGE);
      lg2.setAttribute("y1", pyg); lg2.setAttribute("y2", pyg);
      lg2.setAttribute("class", "grille");
      svg.appendChild(lg2);
      if (ky !== 0) {
        var etiqGy = document.createElementNS(ns, "text");
        etiqGy.setAttribute("x", axeYpx - 6); etiqGy.setAttribute("y", pyg + 3);
        etiqGy.setAttribute("text-anchor", "end");
        etiqGy.setAttribute("class", "graduation");
        etiqGy.textContent = formatNombreFr(yVal);
        svg.appendChild(etiqGy);
      }
    }

    var axeX = document.createElementNS(ns, "line");
    axeX.setAttribute("x1", MARGE); axeX.setAttribute("x2", LARGEUR - MARGE);
    axeX.setAttribute("y1", axeXpx); axeX.setAttribute("y2", axeXpx);
    axeX.setAttribute("class", "axe");
    svg.appendChild(axeX);
    var axeY = document.createElementNS(ns, "line");
    axeY.setAttribute("x1", axeYpx); axeY.setAttribute("x2", axeYpx);
    axeY.setAttribute("y1", MARGE); axeY.setAttribute("y2", HAUTEUR - MARGE);
    axeY.setAttribute("class", "axe");
    svg.appendChild(axeY);
    // Flèches des axes : vers la droite (x) et vers le haut (y).
    var flecheX = document.createElementNS(ns, "path");
    var xf = LARGEUR - MARGE;
    flecheX.setAttribute("d", "M" + (xf + 7) + " " + axeXpx + " L" + (xf - 3) + " " + (axeXpx - 5) + " L" + (xf - 3) + " " + (axeXpx + 5) + " Z");
    flecheX.setAttribute("class", "fleche");
    svg.appendChild(flecheX);
    var flecheY = document.createElementNS(ns, "path");
    flecheY.setAttribute("d", "M" + axeYpx + " " + (MARGE - 7) + " L" + (axeYpx - 5) + " " + (MARGE + 3) + " L" + (axeYpx + 5) + " " + (MARGE + 3) + " Z");
    flecheY.setAttribute("class", "fleche");
    svg.appendChild(flecheY);

    var etiqX = document.createElementNS(ns, "text");
    etiqX.setAttribute("x", LARGEUR - MARGE + 4); etiqX.setAttribute("y", axeXpx + 18);
    etiqX.setAttribute("class", "etiquette"); etiqX.textContent = "x";
    svg.appendChild(etiqX);
    var etiqY = document.createElementNS(ns, "text");
    etiqY.setAttribute("x", axeYpx + 9); etiqY.setAttribute("y", MARGE - 6);
    etiqY.setAttribute("class", "etiquette"); etiqY.textContent = "y";
    svg.appendChild(etiqY);

    var n = 240, d = "";
    for (var i = 0; i <= n; i++) {
      var xx = X_MIN + (i / n) * (X_MAX - X_MIN);
      var yy = a * xx * xx + b * xx + c;
      var pt = self._toPx(xx, Math.max(Y_MIN - 2, Math.min(Y_MAX + 2, yy)));
      d += (i === 0 ? "M" : "L") + pt[0].toFixed(2) + " " + pt[1].toFixed(2) + " ";
    }
    var chemin = document.createElementNS(ns, "path");
    chemin.setAttribute("d", d.trim());
    chemin.setAttribute("class", "courbe");
    svg.appendChild(chemin);

    if (!enDefi && this._checkLineaire.checked) {
      var pL1 = self._toPx(X_MIN, b * X_MIN + c);
      var pL2 = self._toPx(X_MAX, b * X_MAX + c);
      var ligneAB = document.createElementNS(ns, "line");
      ligneAB.setAttribute("x1", pL1[0]); ligneAB.setAttribute("y1", pL1[1]);
      ligneAB.setAttribute("x2", pL2[0]); ligneAB.setAttribute("y2", pL2[1]);
      ligneAB.setAttribute("class", "droite-lineaire");
      svg.appendChild(ligneAB);
    }

    var montrerAS = enDefi ? revele : (!degenere && this._checkAS.checked);
    var montrerS = enDefi ? revele : (!degenere && this._checkS.checked);
    var montrerOAO = enDefi ? revele : this._checkOAO.checked;

    if (montrerAS) {
      var xS = -b / (2 * a);
      if (xS >= X_MIN && xS <= X_MAX) {
        var pxS = self._toPx(xS, 0)[0];
        var las = document.createElementNS(ns, "line");
        las.setAttribute("x1", pxS); las.setAttribute("x2", pxS);
        las.setAttribute("y1", MARGE); las.setAttribute("y2", HAUTEUR - MARGE);
        las.setAttribute("class", "axe-symetrie");
        svg.appendChild(las);
        var etiqAS = document.createElementNS(ns, "text");
        etiqAS.setAttribute("x", pxS + 4); etiqAS.setAttribute("y", MARGE + 12);
        etiqAS.setAttribute("class", "etiquette");
        etiqAS.textContent = "x = " + formatNombreFr(xS);
        svg.appendChild(etiqAS);
      }
    }

    // Zéros marqués sur l'axe des x (mode libre).
    if (!enDefi && !degenere) {
      var zeros = zerosTrinome(a, b, c);
      zeros.forEach(function (z, k) {
        if (z < X_MIN || z > X_MAX || 0 < Y_MIN || 0 > Y_MAX) return;
        var pz = self._toPx(z, 0);
        var cz = document.createElementNS(ns, "circle");
        cz.setAttribute("cx", pz[0]); cz.setAttribute("cy", pz[1]); cz.setAttribute("r", 4.5);
        cz.setAttribute("class", "point-zero");
        svg.appendChild(cz);
        var tz = document.createElementNS(ns, "text");
        tz.setAttribute("x", pz[0]); tz.setAttribute("y", pz[1] - 9);
        tz.setAttribute("text-anchor", "middle");
        tz.setAttribute("class", "etiquette-zero");
        tz.textContent = zeros.length === 1 ? "x₀" : (k === 0 ? "x₁" : "x₂");
        svg.appendChild(tz);
      });
    }

    if (montrerS) {
      var xS2 = -b / (2 * a);
      var yS2 = a * xS2 * xS2 + b * xS2 + c;
      if (xS2 >= X_MIN && xS2 <= X_MAX && yS2 >= Y_MIN && yS2 <= Y_MAX) {
        var ptS = self._toPx(xS2, yS2);
        var cS = document.createElementNS(ns, "circle");
        cS.setAttribute("cx", ptS[0]); cS.setAttribute("cy", ptS[1]); cS.setAttribute("r", 5);
        cS.setAttribute("class", "point-sommet");
        svg.appendChild(cS);
        var etiqS = document.createElementNS(ns, "text");
        etiqS.setAttribute("x", ptS[0] + 8); etiqS.setAttribute("y", ptS[1] + (a > 0 ? 18 : -8));
        etiqS.setAttribute("class", "etiquette");
        etiqS.textContent = "S(" + formatNombreFr(xS2) + " ; " + formatNombreFr(yS2) + ")";
        svg.appendChild(etiqS);
      }
    }

    if (montrerOAO && c >= Y_MIN && c <= Y_MAX && 0 >= X_MIN && 0 <= X_MAX) {
      var ptO = self._toPx(0, c);
      var cO = document.createElementNS(ns, "circle");
      cO.setAttribute("cx", ptO[0]); cO.setAttribute("cy", ptO[1]); cO.setAttribute("r", 5);
      cO.setAttribute("class", "point-oao");
      svg.appendChild(cO);
      var etiqO = document.createElementNS(ns, "text");
      etiqO.setAttribute("x", ptO[0] + 8); etiqO.setAttribute("y", ptO[1] + 16);
      etiqO.setAttribute("class", "etiquette");
      etiqO.textContent = "(0 ; " + formatNombreFr(c) + ")";
      svg.appendChild(etiqO);
    }
  };

  if (!customElements.get("parabole-widget")) {
    customElements.define("parabole-widget", ParaboleWidgetClass);
  }
})();
