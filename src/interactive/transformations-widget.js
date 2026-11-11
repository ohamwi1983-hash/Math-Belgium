(function () {
  "use strict";

  /* ================================================================
   * <transformations-widget> — atelier interactif f(x) = a(x − TH)² + TV,
   * a = EV/CV selon |a|≥1 (a < 0 : symétrie d'axe Ox, SOX). Même mécanique que
   * <parabole-widget> (zoom, pan, couleurs héritées des variables CSS du
   * chapitre), sommet trivial (TH, TV) puisque les curseurs paramètrent
   * directement la forme canonique.
   *
   * Deux modes :
   * - « Libre » : curseurs TH / EV (CV) / TV, options AS / S / OAO ; la forme
   *   canonique ET la forme développée ax² + bx + c sont affichées en direct.
   * - « Pas à pas » : depuis y = x², on applique dans l'ordre l'étirement ou la
   *   compression (et la symétrie si a < 0), la translation horizontale, puis la
   *   translation verticale ; la courbe de l'étape précédente reste en
   *   pointillés, une phrase explique chaque étape et le sommet est suivi.
   * ================================================================ */

  var DEFAUT = { th: 0, ev: 1, tv: 0 };
  // Cible proposée en entrant dans « Pas à pas » si les curseurs sont encore sur y = x²
  // (sinon les trois étapes ne montreraient rien).
  var EXEMPLE_PAS = { th: -1, ev: 2, tv: 3 };
  var MIN = -3, MAX = 3, STEP = 0.1;
  var CENTRE_Y = 2, DEMI_X_BASE = 6, DEMI_Y_BASE = 8;
  var ZOOM_MIN = 0.4, ZOOM_MAX = 5, ZOOM_PAS = 1.3;
  var LARGEUR = 560, HAUTEUR = 420, MARGE = 30;
  var NB_ETAPES = 3;

  function formatNombreFr(n) {
    var arrondi = Math.round(n * 100) / 100;
    if (Object.is(arrondi, -0)) arrondi = 0;
    return arrondi.toString().replace(".", ",").replace("-", "−");
  }

  /** Coefficient de la forme développée : jusqu'à 3 décimales (0,1 · 0,1² = 0,001), virgule, −. */
  function formatCoefFr(n) {
    var arrondi = Number(n.toFixed(3));
    if (Object.is(arrondi, -0)) arrondi = 0;
    return arrondi.toString().replace(".", ",").replace("-", "−");
  }

  function pasAgreable(valeurBrute) {
    var exposant = Math.floor(Math.log10(valeurBrute));
    var fraction = valeurBrute / Math.pow(10, exposant);
    var pasFraction = fraction < 1.5 ? 1 : fraction < 3 ? 2 : fraction < 7 ? 5 : 10;
    return pasFraction * Math.pow(10, exposant);
  }

  /** Arrondit au millième pour neutraliser les erreurs de virgule flottante des curseurs. */
  function net(n) {
    var r = Math.round(n * 1000) / 1000;
    return Object.is(r, -0) ? 0 : r;
  }

  /** f(x) = a(x − TH)² + TV, forme canonique — gère a=±1 (coefficient omis),
   * TH=0 (parenthèse réduite à x²) et le cas dégénéré a=0 (droite horizontale). */
  function formatCanonique(a, p, q) {
    a = net(a); p = net(p); q = net(q);
    if (a === 0) return q === 0 ? "0" : formatNombreFr(q);
    var coefA = Math.abs(a) === 1 ? "" : formatNombreFr(Math.abs(a));
    var signeA = a < 0 ? "−" : "";
    var interieur = p === 0 ? "x²" : (p > 0 ? "(x − " + formatNombreFr(p) + ")²" : "(x + " + formatNombreFr(-p) + ")²");
    var corps = signeA + coefA + interieur;
    if (q === 0) return corps;
    return corps + " " + (q < 0 ? "−" : "+") + " " + formatNombreFr(Math.abs(q));
  }

  /** Forme développée ax² + bx + c avec b = −2ap et c = ap² + q : coefficients 1/−1 omis,
   * termes nuls supprimés, signes propres. */
  function formatDeveloppee(a, p, q) {
    a = net(a);
    var b = net(-2 * a * p);
    var c = net(a * p * p + q);
    var termes = [];
    if (a !== 0) termes.push({ neg: a < 0, texte: (Math.abs(a) === 1 ? "" : formatCoefFr(Math.abs(a))) + "x²" });
    if (b !== 0) termes.push({ neg: b < 0, texte: (Math.abs(b) === 1 ? "" : formatCoefFr(Math.abs(b))) + "x" });
    if (c !== 0) termes.push({ neg: c < 0, texte: formatCoefFr(Math.abs(c)) });
    if (termes.length === 0) return "0";
    var res = (termes[0].neg ? "−" : "") + termes[0].texte;
    for (var i = 1; i < termes.length; i++) res += " " + (termes[i].neg ? "−" : "+") + " " + termes[i].texte;
    return res;
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
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.35rem;font-weight:600;color:var(--ink,#241f1a);margin:0 0 4px;min-height:1.7rem;}' +
    '.formule-dev{text-align:center;font-size:.95rem;color:var(--ink-soft,#6b6055);margin:0 0 4px;}' +
    '.formule-dev .math{font-family:var(--serif,serif);font-style:italic;font-weight:600;color:var(--ink,#241f1a);}' +
    '.note{text-align:center;font-size:.88rem;color:var(--accent-ink,#7a3212);margin:0 0 6px;min-height:1.2rem;}' +
    '.zoom-bar{display:flex;align-items:center;justify-content:flex-end;gap:6px;margin:6px 0 8px;}' +
    '.zoom-bar button{width:44px;height:44px;border-radius:3px;border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);font-size:17px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;font-family:inherit;padding:0;}' +
    '.zoom-bar button:hover:not(:disabled){border-color:var(--accent,#a8471f);background:var(--accent-soft,#f6e2d3);}' +
    '.zoom-bar button:disabled{opacity:.4;cursor:not-allowed;}' +
    '.zoom-bar .zoom-reset{font-size:15px;}' +
    '.zoom-valeur{font-variant-numeric:tabular-nums;font-size:.8rem;color:var(--ink-soft,#6b6055);min-width:38px;text-align:center;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;height:auto;max-width:100%;background:var(--surface-2,#faf6f0);border-radius:3px;cursor:grab;touch-action:none;}' +
    'svg.en-deplacement{cursor:grabbing;}' +
    '.pas{margin:0 0 14px;padding:10px 12px;border:1px solid var(--line,#e2d8c8);border-radius:3px;background:var(--surface,#fff);}' +
    '.pas-tete{display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:6px;}' +
    '.pas-indicateur{font-size:.82rem;font-weight:700;color:var(--accent-ink,#7a3212);text-transform:uppercase;letter-spacing:.04em;}' +
    '.pas-formule{font-family:var(--serif,serif);font-style:italic;font-weight:600;color:var(--ink,#241f1a);}' +
    '.pas-phrase{margin:0;font-size:.93rem;line-height:1.5;color:var(--ink,#241f1a);min-height:2.8em;}' +
    '.pas-boutons{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;}' +
    '.pas-boutons .btn{margin-top:0;flex:1 1 140px;}' +
    '.controles{display:flex;gap:22px;align-items:flex-start;flex-wrap:wrap;}' +
    '.curseurs{flex:1 1 auto;min-width:220px;}' +
    '.ligne-curseur{display:grid;grid-template-columns:32px 1fr 52px;align-items:center;gap:10px;margin-bottom:6px;min-height:44px;}' +
    '.ligne-curseur label{font-family:var(--mono,monospace);font-weight:700;color:var(--accent-ink,#7a3212);text-align:center;font-size:.82rem;}' +
    '.ligne-curseur input[type="range"]{width:100%;min-height:44px;accent-color:var(--accent,#a8471f);}' +
    '.ligne-curseur .valeur{font-variant-numeric:tabular-nums;text-align:right;color:var(--ink-soft,#6b6055);font-size:0.92rem;}' +
    '.btn{min-height:44px;margin-top:8px;padding:8px 14px;border-radius:3px;border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;}' +
    '.btn:hover:not(:disabled){background:var(--accent-soft-line,#e8c4a4);}' +
    '.btn:disabled{opacity:.45;cursor:not-allowed;}' +
    '.options{display:flex;flex-direction:column;gap:2px;padding-left:16px;border-left:1px solid var(--line,#e2d8c8);}' +
    '.options label{display:flex;align-items:center;gap:8px;min-height:44px;font-size:0.88rem;color:var(--ink-soft,#6b6055);cursor:pointer;}' +
    '.options label.desactive{color:var(--ink-faint,#9c9083);cursor:not-allowed;}' +
    '.options input{accent-color:var(--accent,#a8471f);width:18px;height:18px;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.grille{stroke:var(--line-soft,#ede5d7);stroke-width:1;}' +
    '.courbe{stroke:var(--accent,#a8471f);stroke-width:2.4;fill:none;}' +
    '.courbe-precedente{stroke:var(--ink-faint,#9c9083);stroke-width:2;stroke-dasharray:6 5;fill:none;}' +
    '.deplacement{stroke:#3d72b4;stroke-width:2;fill:none;}' +
    '.deplacement-pointe{fill:#3d72b4;}' +
    '.axe-symetrie{stroke:var(--ink-faint,#9c9083);stroke-width:1.4;stroke-dasharray:6 4;}' +
    '.point-sommet{fill:var(--accent,#a8471f);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.point-oao{fill:var(--good,#2f7a4f);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.graduation{font-size:9.5px;fill:var(--ink-faint,#9c9083);font-family:var(--sans,sans-serif);}' +
    '</style>' +
    '<div class="modes" role="group" aria-label="Mode de l\'atelier">' +
    '<button type="button" id="mode-libre" aria-pressed="true">Libre</button>' +
    '<button type="button" id="mode-pas" aria-pressed="false">Pas à pas</button>' +
    '</div>' +
    '<p class="formule" id="formule"></p>' +
    '<p class="formule-dev" id="formule-dev"></p>' +
    '<p class="note" id="note"></p>' +
    '<div class="zoom-bar">' +
    '<button type="button" id="zoom-out" aria-label="Dézoomer">−</button>' +
    '<span class="zoom-valeur" id="zoom-valeur">100 %</span>' +
    '<button type="button" id="zoom-in" aria-label="Zoomer">+</button>' +
    '<button type="button" id="zoom-reset" class="zoom-reset" aria-label="Réinitialiser le zoom">⟲</button>' +
    '</div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<div class="pas" id="pas" hidden aria-live="polite">' +
    '<div class="pas-tete"><span class="pas-indicateur" id="pas-indicateur"></span><span class="pas-formule" id="pas-formule"></span></div>' +
    '<p class="pas-phrase" id="pas-phrase"></p>' +
    '<div class="pas-boutons">' +
    '<button class="btn" id="pas-precedent" type="button">◀ Étape précédente</button>' +
    '<button class="btn" id="pas-suivant" type="button">Étape suivante ▶</button>' +
    '</div>' +
    '</div>' +
    '<div class="controles">' +
    '<div class="curseurs">' +
    '<div class="ligne-curseur"><label for="th">TH</label><input type="range" id="th" min="' + MIN + '" max="' + MAX + '" step="' + STEP + '" value="' + DEFAUT.th + '"><span class="valeur" id="th-valeur"></span></div>' +
    '<div class="ligne-curseur"><label for="ev" id="label-ev">EV</label><input type="range" id="ev" min="' + MIN + '" max="' + MAX + '" step="' + STEP + '" value="' + DEFAUT.ev + '"><span class="valeur" id="ev-valeur"></span></div>' +
    '<div class="ligne-curseur"><label for="tv">TV</label><input type="range" id="tv" min="' + MIN + '" max="' + MAX + '" step="' + STEP + '" value="' + DEFAUT.tv + '"><span class="valeur" id="tv-valeur"></span></div>' +
    '<button class="btn" id="reset" type="button">Fonction de référence</button>' +
    '</div>' +
    '<div class="options" id="options">' +
    '<label id="label-as"><input type="checkbox" id="as"> AS</label>' +
    '<label id="label-s"><input type="checkbox" id="s"> S</label>' +
    '<label id="label-oao"><input type="checkbox" id="oao"> OAO</label>' +
    '</div>' +
    '</div>';

  class TransformationsWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  TransformationsWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._th = DEFAUT.th; this._ev = DEFAUT.ev; this._tv = DEFAUT.tv;
    this._zoom = 1;
    this._centreX = 0;
    this._centreY = CENTRE_Y;
    this._enDeplacement = false;
    this._mode = "libre";
    this._etape = 0;
    this._svg = shadow.getElementById("svg");
    this._formule = shadow.getElementById("formule");
    this._formuleDev = shadow.getElementById("formule-dev");
    this._note = shadow.getElementById("note");
    this._blocPas = shadow.getElementById("pas");
    this._pasIndicateur = shadow.getElementById("pas-indicateur");
    this._pasFormule = shadow.getElementById("pas-formule");
    this._pasPhrase = shadow.getElementById("pas-phrase");
    this._pasPrecedent = shadow.getElementById("pas-precedent");
    this._pasSuivant = shadow.getElementById("pas-suivant");
    this._btnModeLibre = shadow.getElementById("mode-libre");
    this._btnModePas = shadow.getElementById("mode-pas");
    this._options = shadow.getElementById("options");
    this._inputTH = shadow.getElementById("th");
    this._inputEV = shadow.getElementById("ev");
    this._inputTV = shadow.getElementById("tv");
    this._valeurTH = shadow.getElementById("th-valeur");
    this._valeurEV = shadow.getElementById("ev-valeur");
    this._valeurTV = shadow.getElementById("tv-valeur");
    this._labelEV = shadow.getElementById("label-ev");
    this._checkAS = shadow.getElementById("as");
    this._checkS = shadow.getElementById("s");
    this._checkOAO = shadow.getElementById("oao");
    this._labelAS = shadow.getElementById("label-as");
    this._labelS = shadow.getElementById("label-s");
    this._resetBtn = shadow.getElementById("reset");
    this._zoomIn = shadow.getElementById("zoom-in");
    this._zoomOut = shadow.getElementById("zoom-out");
    this._zoomReset = shadow.getElementById("zoom-reset");
    this._zoomValeur = shadow.getElementById("zoom-valeur");
  };

  TransformationsWidgetClass.prototype._fixerCurseurs = function (valeurs) {
    this._th = valeurs.th; this._ev = valeurs.ev; this._tv = valeurs.tv;
    this._inputTH.value = String(valeurs.th);
    this._inputEV.value = String(valeurs.ev);
    this._inputTV.value = String(valeurs.tv);
  };

  TransformationsWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInput = function () {
      self._th = parseFloat(self._inputTH.value);
      self._ev = parseFloat(self._inputEV.value);
      self._tv = parseFloat(self._inputTV.value);
      self._rendre();
    };
    this._onReset = function () {
      self._fixerCurseurs(DEFAUT);
      self._etape = 0;
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
    this._onModePas = function () { self._changerMode("pas"); };
    this._onPrecedent = function () {
      if (self._etape > 0) { self._etape--; self._rendre(); }
    };
    this._onSuivant = function () {
      if (self._etape < NB_ETAPES) { self._etape++; self._rendre(); }
    };
    this._inputTH.addEventListener("input", this._onInput);
    this._inputEV.addEventListener("input", this._onInput);
    this._inputTV.addEventListener("input", this._onInput);
    this._resetBtn.addEventListener("click", this._onReset);
    this._checkAS.addEventListener("change", this._onChange);
    this._checkS.addEventListener("change", this._onChange);
    this._checkOAO.addEventListener("change", this._onChange);
    this._zoomIn.addEventListener("click", this._onZoomIn);
    this._zoomOut.addEventListener("click", this._onZoomOut);
    this._zoomReset.addEventListener("click", this._onZoomReset);
    this._svg.addEventListener("pointerdown", this._onPointerDown);
    this._svg.addEventListener("pointermove", this._onPointerMove);
    this._svg.addEventListener("pointerup", this._onPointerUp);
    this._svg.addEventListener("pointercancel", this._onPointerUp);
    this._btnModeLibre.addEventListener("click", this._onModeLibre);
    this._btnModePas.addEventListener("click", this._onModePas);
    this._pasPrecedent.addEventListener("click", this._onPrecedent);
    this._pasSuivant.addEventListener("click", this._onSuivant);
    this._rendre();
  };

  TransformationsWidgetClass.prototype.disconnectedCallback = function () {
    this._inputTH.removeEventListener("input", this._onInput);
    this._inputEV.removeEventListener("input", this._onInput);
    this._inputTV.removeEventListener("input", this._onInput);
    this._resetBtn.removeEventListener("click", this._onReset);
    this._checkAS.removeEventListener("change", this._onChange);
    this._checkS.removeEventListener("change", this._onChange);
    this._checkOAO.removeEventListener("change", this._onChange);
    this._zoomIn.removeEventListener("click", this._onZoomIn);
    this._zoomOut.removeEventListener("click", this._onZoomOut);
    this._zoomReset.removeEventListener("click", this._onZoomReset);
    this._svg.removeEventListener("pointerdown", this._onPointerDown);
    this._svg.removeEventListener("pointermove", this._onPointerMove);
    this._svg.removeEventListener("pointerup", this._onPointerUp);
    this._svg.removeEventListener("pointercancel", this._onPointerUp);
    this._btnModeLibre.removeEventListener("click", this._onModeLibre);
    this._btnModePas.removeEventListener("click", this._onModePas);
    this._pasPrecedent.removeEventListener("click", this._onPrecedent);
    this._pasSuivant.removeEventListener("click", this._onSuivant);
  };

  TransformationsWidgetClass.prototype._changerMode = function (mode) {
    if (mode === this._mode) return;
    this._mode = mode;
    this._btnModeLibre.setAttribute("aria-pressed", mode === "libre" ? "true" : "false");
    this._btnModePas.setAttribute("aria-pressed", mode === "pas" ? "true" : "false");
    if (mode === "pas") {
      this._etape = 0;
      var surReference = net(this._th) === DEFAUT.th && net(this._ev) === DEFAUT.ev && net(this._tv) === DEFAUT.tv;
      if (surReference) this._fixerCurseurs(EXEMPLE_PAS);
    }
    this._rendre();
  };

  TransformationsWidgetClass.prototype._appliquerZoom = function (nouveauZoom) {
    this._zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, nouveauZoom));
    this._rendre();
  };

  TransformationsWidgetClass.prototype._toPx = function (xMath, yMath) {
    var px = MARGE + (xMath - this._xMin) / (this._xMax - this._xMin) * (LARGEUR - 2 * MARGE);
    var py = HAUTEUR - MARGE - (yMath - this._yMin) / (this._yMax - this._yMin) * (HAUTEUR - 2 * MARGE);
    return [px, py];
  };

  /** Paramètres (a, p, q) de la courbe affichée à l'étape k du mode « Pas à pas ». */
  function parametresEtape(k, a, p, q) {
    if (k <= 0) return { a: 1, p: 0, q: 0 };
    if (k === 1) return { a: a, p: 0, q: 0 };
    if (k === 2) return { a: a, p: p, q: 0 };
    return { a: a, p: p, q: q };
  }

  /** Phrase d'explication de l'étape k (k ≥ 1 : passage de l'étape k − 1 à l'étape k). */
  function phraseEtape(k, a, p, q) {
    if (k === 0) {
      return "On part de la fonction de référence y = x², de sommet (0 ; 0). Clique sur « Étape suivante ».";
    }
    if (k === 1) {
      var txtA = formatNombreFr(a);
      if (a === 0) return "On multiplie les ordonnées par a = 0 : elles deviennent toutes nulles, ce n'est plus une parabole.";
      if (a === 1) return "On multiplie les ordonnées par a = 1 : rien ne change, ni étirement ni compression.";
      if (a === -1) return "On multiplie les ordonnées par a = −1 : la parabole se retourne (symétrie d'axe Ox, SOX) sans changer d'ouverture.";
      var forme = Math.abs(a) > 1
        ? "la parabole se resserre (étirement vertical, EV, car |a| > 1)"
        : "la parabole s'aplatit (compression verticale, CV, car |a| < 1)";
      var sox = a < 0 ? " ; comme a est négatif, elle se retourne aussi (symétrie d'axe Ox, SOX)" : "";
      return "On multiplie les ordonnées par a = " + txtA + " : " + forme + sox + ". Le sommet reste en (0 ; 0).";
    }
    if (k === 2) {
      if (p === 0) return "TH = 0 : pas de translation horizontale, le sommet reste en (0 ; 0).";
      return "On déplace la courbe de " + formatNombreFr(Math.abs(p)) + " vers la " + (p > 0 ? "droite" : "gauche") +
        " (translation horizontale) : le sommet passe en (" + formatNombreFr(p) + " ; 0).";
    }
    if (q === 0) return "TV = 0 : pas de translation verticale, le sommet reste en (" + formatNombreFr(p) + " ; 0).";
    return "On déplace la courbe de " + formatNombreFr(Math.abs(q)) + " vers le " + (q > 0 ? "haut" : "bas") +
      " (translation verticale) : le sommet arrive en (" + formatNombreFr(p) + " ; " + formatNombreFr(q) + ").";
  }

  TransformationsWidgetClass.prototype._rendre = function () {
    var th = net(this._th), ev = net(this._ev), tv = net(this._tv);
    var enPas = this._mode === "pas";
    this._valeurTH.textContent = formatNombreFr(th);
    this._valeurEV.textContent = formatNombreFr(ev);
    this._valeurTV.textContent = formatNombreFr(tv);
    this._labelEV.textContent = Math.abs(ev) >= 1 ? "EV" : "CV";

    var cible = "f(x) = " + formatCanonique(ev, th, tv);
    this._formule.textContent = cible;
    this._formuleDev.innerHTML = 'Forme développée : <span class="math">f(x) = ' + formatDeveloppee(ev, th, tv) + "</span>";
    var note = "";
    if (ev === 0) note = "a = 0 : ce n'est plus une parabole, mais une droite horizontale.";
    else if (ev < 0) note = "a < 0 : la parabole est retournée (symétrie d'axe Ox, SOX).";
    this._note.textContent = note;

    this._blocPas.hidden = !enPas;
    this._options.hidden = enPas;

    var etapeCourante = null, etapePrecedente = null;
    if (enPas) {
      etapeCourante = parametresEtape(this._etape, ev, th, tv);
      etapePrecedente = this._etape > 0 ? parametresEtape(this._etape - 1, ev, th, tv) : null;
      this._pasIndicateur.textContent = "Étape " + this._etape + " / " + NB_ETAPES;
      this._pasFormule.textContent = "y = " + formatCanonique(etapeCourante.a, etapeCourante.p, etapeCourante.q);
      this._pasPhrase.textContent = phraseEtape(this._etape, ev, th, tv);
      this._pasPrecedent.disabled = this._etape === 0;
      this._pasSuivant.disabled = this._etape === NB_ETAPES;
    }

    var degenere = ev === 0;
    this._labelAS.classList.toggle("desactive", degenere);
    this._labelS.classList.toggle("desactive", degenere);
    this._checkAS.disabled = degenere;
    this._checkS.disabled = degenere;

    var demiX = DEMI_X_BASE * this._zoom;
    var demiY = DEMI_Y_BASE * this._zoom;
    this._xMin = this._centreX - demiX; this._xMax = this._centreX + demiX;
    this._yMin = this._centreY - demiY; this._yMax = this._centreY + demiY;
    this._zoomValeur.textContent = Math.round(100 / this._zoom) + " %";
    this._zoomIn.disabled = this._zoom <= ZOOM_MIN + 1e-9;
    this._zoomOut.disabled = this._zoom >= ZOOM_MAX - 1e-9;

    var X_MIN = this._xMin, X_MAX = this._xMax, Y_MIN = this._yMin, Y_MAX = this._yMax;
    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    svg.innerHTML = "";
    var self = this;
    // Les courbes sont découpées au cadre du repère (sinon elles débordent dans la marge).
    var defs = document.createElementNS(ns, "defs");
    var clip = document.createElementNS(ns, "clipPath");
    clip.setAttribute("id", "zone-trace");
    var rectClip = document.createElementNS(ns, "rect");
    rectClip.setAttribute("x", MARGE); rectClip.setAttribute("y", MARGE);
    rectClip.setAttribute("width", LARGEUR - 2 * MARGE); rectClip.setAttribute("height", HAUTEUR - 2 * MARGE);
    clip.appendChild(rectClip); defs.appendChild(clip); svg.appendChild(defs);

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

    function tracer(a, p, q, classe) {
      var n = 240, d = "";
      for (var i = 0; i <= n; i++) {
        var xx = X_MIN + (i / n) * (X_MAX - X_MIN);
        var yy = a * (xx - p) * (xx - p) + q;
        var pt = self._toPx(xx, Math.max(Y_MIN - 2, Math.min(Y_MAX + 2, yy)));
        d += (i === 0 ? "M" : "L") + pt[0].toFixed(2) + " " + pt[1].toFixed(2) + " ";
      }
      var chemin = document.createElementNS(ns, "path");
      chemin.setAttribute("d", d.trim());
      chemin.setAttribute("class", classe);
      chemin.setAttribute("clip-path", "url(#zone-trace)");
      svg.appendChild(chemin);
    }

    function pointSommet(x, y, texte, auDessous) {
      if (x < X_MIN || x > X_MAX || y < Y_MIN || y > Y_MAX) return;
      var ptS = self._toPx(x, y);
      var cS = document.createElementNS(ns, "circle");
      cS.setAttribute("cx", ptS[0]); cS.setAttribute("cy", ptS[1]); cS.setAttribute("r", 5);
      cS.setAttribute("class", "point-sommet");
      svg.appendChild(cS);
      var etiqS = document.createElementNS(ns, "text");
      etiqS.setAttribute("x", ptS[0] + 8); etiqS.setAttribute("y", ptS[1] + (auDessous ? 18 : -8));
      etiqS.setAttribute("class", "etiquette");
      etiqS.textContent = texte;
      svg.appendChild(etiqS);
    }

    if (enPas) {
      if (etapePrecedente) tracer(etapePrecedente.a, etapePrecedente.p, etapePrecedente.q, "courbe-precedente");
      tracer(etapeCourante.a, etapeCourante.p, etapeCourante.q, "courbe");
      // Flèche du déplacement du sommet (étapes de translation).
      if (etapePrecedente && (etapePrecedente.p !== etapeCourante.p || etapePrecedente.q !== etapeCourante.q)) {
        var p1 = self._toPx(etapePrecedente.p, etapePrecedente.q);
        var p2 = self._toPx(etapeCourante.p, etapeCourante.q);
        var dx = p2[0] - p1[0], dy = p2[1] - p1[1];
        var long = Math.sqrt(dx * dx + dy * dy);
        if (long > 14) {
          var ux = dx / long, uy = dy / long;
          var fin = [p2[0] - ux * 8, p2[1] - uy * 8];
          var trait = document.createElementNS(ns, "line");
          trait.setAttribute("x1", p1[0]); trait.setAttribute("y1", p1[1]);
          trait.setAttribute("x2", fin[0] - ux * 6); trait.setAttribute("y2", fin[1] - uy * 6);
          trait.setAttribute("class", "deplacement");
          svg.appendChild(trait);
          var pointe = document.createElementNS(ns, "path");
          var bx = fin[0] - ux * 9, by = fin[1] - uy * 9;
          pointe.setAttribute("d", "M" + fin[0] + " " + fin[1] + " L" + (bx - uy * 5) + " " + (by + ux * 5) + " L" + (bx + uy * 5) + " " + (by - ux * 5) + " Z");
          pointe.setAttribute("class", "deplacement-pointe");
          svg.appendChild(pointe);
        }
      }
      if (etapeCourante.a !== 0) {
        pointSommet(etapeCourante.p, etapeCourante.q,
          "S(" + formatNombreFr(etapeCourante.p) + " ; " + formatNombreFr(etapeCourante.q) + ")", etapeCourante.a > 0);
      }
      return;
    }

    tracer(ev, th, tv, "courbe");

    var xS = th, yS = tv; // forme canonique : sommet direct, aucun calcul -b/(2a) nécessaire

    if (!degenere && this._checkAS.checked) {
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

    if (!degenere && this._checkS.checked) {
      pointSommet(xS, yS, "S(" + formatNombreFr(xS) + " ; " + formatNombreFr(yS) + ")", ev > 0);
    }

    if (this._checkOAO.checked) {
      var yOAO = ev * (0 - th) * (0 - th) + tv;
      if (yOAO >= Y_MIN && yOAO <= Y_MAX && 0 >= X_MIN && 0 <= X_MAX) {
        var ptO = self._toPx(0, yOAO);
        var cO = document.createElementNS(ns, "circle");
        cO.setAttribute("cx", ptO[0]); cO.setAttribute("cy", ptO[1]); cO.setAttribute("r", 5);
        cO.setAttribute("class", "point-oao");
        svg.appendChild(cO);
        var etiqO = document.createElementNS(ns, "text");
        etiqO.setAttribute("x", ptO[0] + 8); etiqO.setAttribute("y", ptO[1] + 16);
        etiqO.setAttribute("class", "etiquette");
        etiqO.textContent = "(0 ; " + formatNombreFr(yOAO) + ")";
        svg.appendChild(etiqO);
      }
    }
  };

  if (!customElements.get("transformations-widget")) {
    customElements.define("transformations-widget", TransformationsWidgetClass);
  }
})();
