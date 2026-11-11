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
   * la parenthèse est toujours opposé au sens du déplacement.
   *
   * Deux modes :
   * - « Libre » (par défaut, comportement historique) ;
   * - « Défi » : une courbe cible (réglages atteignables avec les curseurs)
   *   s'affiche en pointillés verts ; l'élève règle les curseurs pour la
   *   recouvrir. Le verdict compare les COURBES (échantillonnage), jamais
   *   les curseurs : SOY invisible pour une famille paire, SOX ≡ SOY pour
   *   une impaire, et les compromis facteur horizontal / facteur vertical
   *   (ex. (2x)² = 4x²) sont donc tous acceptés.
   * Dans les deux modes, l'image A du point (1 ; 1) de la fonction de
   * référence est suivie (g(1) = 1 pour les 6 familles) : on voit l'effet de
   * CH/EH, SOY, EV/CV et SOX, qui laissent le point caractéristique immobile.
   * Web Component (Shadow DOM).
   * ================================================================ */

  var DEFAUT = { famille: "inverse", th: 3, tv: 2, kh: 1, kv: 1, sox: false, soy: false };
  var NEUTRE = { th: 0, tv: 0, kh: 1, kv: 1, sox: false, soy: false };
  var BORNES_TH = { min: -3, max: 3, step: 0.5 };
  var BORNES_TV = { min: -3, max: 3, step: 0.5 };
  var BORNES_K = { min: 0.3, max: 3, step: 0.1 };
  // Réglages possibles d'une cible : tous atteignables exactement avec les pas des curseurs.
  var CIBLE_T = [-3, -2.5, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 2.5, 3];
  var CIBLE_K = [0.5, 1, 1, 2];

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
  var PARITE = { carre: "paire", valeurAbsolue: "paire", cube: "impaire", racineCubique: "impaire", inverse: "impaire", racine: "aucune" };
  var LARGEUR = 420, HAUTEUR = 320, MARGE = 34;

  function formatNombreFr(n, decimales) {
    var facteur = Math.pow(10, decimales);
    var arrondi = Math.round(n * facteur) / facteur;
    return arrondi.toFixed(decimales).replace(".", ",").replace("-", "−");
  }

  /** Nombre court : « 2 », « 0,5 », « −1,5 ». */
  function fmt(n) {
    var r = Math.round(n * 100) / 100;
    return (Number.isInteger(r) ? String(r) : String(r).replace(".", ",")).replace("-", "−");
  }

  function svgEl(ns, tag, attrs) {
    var el = document.createElementNS(ns, tag);
    for (var key in attrs) el.setAttribute(key, attrs[key]);
    return el;
  }

  function fonction(famille, r) {
    var g = FAMILLES[famille].g;
    var signH = r.soy ? -1 : 1, signV = r.sox ? -1 : 1;
    return function (x) { return signV * r.kv * g(signH * r.kh * (x - r.th)) + r.tv; };
  }

  /** Les deux courbes sont-elles la même ? Comparaison sur 241 abscisses de la fenêtre (et le même
   * domaine) — jamais sur les curseurs, pour accepter tous les réglages équivalents. */
  function memesCourbes(famille, r1, r2) {
    var win = FAMILLES[famille];
    var f1 = fonction(famille, r1), f2 = fonction(famille, r2);
    for (var i = 0; i <= 240; i++) {
      var x = win.X_MIN + (i / 240) * (win.X_MAX - win.X_MIN) + 0.0137;
      if (famille === "inverse" && (Math.abs(x - r1.th) < 0.03 || Math.abs(x - r2.th) < 0.03)) continue;
      var y1 = f1(x), y2 = f2(x);
      var d1 = isFinite(y1), d2 = isFinite(y2);
      if (d1 !== d2) return false;
      if (d1 && Math.abs(y1 - y2) > 1e-6 * Math.max(1, Math.abs(y2))) return false;
    }
    return true;
  }

  function texteReglage(r) {
    return "TH = " + fmt(r.th) + " · TV = " + fmt(r.tv) + " · CH/EH = " + fmt(r.kh) + " · EV/CV = " + fmt(r.kv) +
      " · SOX : " + (r.sox ? "oui" : "non") + " · SOY : " + (r.soy ? "oui" : "non");
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.modes{display:flex;justify-content:center;gap:0;margin-bottom:12px;}' +
    '.modes button{font:inherit;font-size:0.9rem;font-weight:600;padding:7px 16px;border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink-soft,#6b6055);cursor:pointer;min-height:38px;}' +
    '.modes button:first-child{border-radius:var(--radius,3px) 0 0 var(--radius,3px);}' +
    '.modes button:last-child{border-radius:0 var(--radius,3px) var(--radius,3px) 0;border-left:none;}' +
    '.modes button[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);border-color:var(--accent-soft-line,#e8c4a4);}' +
    '.ligne-select{display:flex;align-items:center;gap:10px;justify-content:center;margin-bottom:12px;}' +
    '.ligne-select label{font-weight:600;color:var(--ink,#241f1a);}' +
    'select{font:inherit;padding:6px 10px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);}' +
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1rem;font-weight:600;color:var(--ink,#241f1a);margin:0 0 12px;overflow-wrap:anywhere;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.courbe{stroke:var(--accent,#a8471f);stroke-width:2.4;fill:none;}' +
    '.courbe-cible{stroke:var(--good,#2f7a4f);stroke-width:3;fill:none;stroke-dasharray:7 5;opacity:0.9;}' +
    '.asymptote{stroke:var(--ink-faint,#9c9083);stroke-width:1.2;stroke-dasharray:4 3;}' +
    '.point-caracteristique{fill:var(--plan,#5b4ea3);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.point-a{fill:var(--sky,#2f6fb0);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.guide-th{stroke:var(--plan,#5b4ea3);stroke-width:1.2;stroke-dasharray:3 3;opacity:0.75;}' +
    '.etiquette-point{font-size:11.5px;font-weight:700;fill:var(--plan,#5b4ea3);font-family:var(--mono,monospace);}' +
    '.etiquette-a{font-size:12px;font-weight:700;fill:var(--sky,#2f6fb0);font-family:var(--mono,monospace);paint-order:stroke;stroke:var(--surface-2,#faf6f0);stroke-width:3px;}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.defi{border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);background:var(--surface,#fff);padding:10px 12px;margin-bottom:14px;text-align:center;}' +
    '.defi[hidden]{display:none;}' +
    '.verdict{font-weight:600;font-size:0.92rem;margin:0 0 8px;color:var(--ink,#241f1a);}' +
    '.verdict.ok{color:var(--good,#2f7a4f);}' +
    '.note{font-size:0.84rem;color:var(--ink-soft,#6b6055);margin:0 0 8px;}' +
    '.note[hidden]{display:none;}' +
    '.revelation{font-family:var(--mono,monospace);font-size:0.78rem;color:var(--ink-soft,#6b6055);margin:0 0 8px;line-height:1.5;}' +
    '.revelation[hidden]{display:none;}' +
    '.defi-boutons{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;}' +
    '.stats{display:flex;align-items:stretch;justify-content:center;gap:6px;flex-wrap:wrap;margin-top:16px;}' +
    '.stat{flex:1 1 120px;min-width:0;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:8px 4px;text-align:center;background:var(--surface,#fff);}' +
    '.stat-label{display:block;font-family:var(--mono,monospace);font-size:10px;letter-spacing:0.02em;color:var(--ink-faint,#9c9083);margin-bottom:5px;}' +
    '.stat-value{display:block;font-variant-numeric:tabular-nums;font-size:0.94rem;font-weight:600;color:var(--plan,#5b4ea3);white-space:nowrap;}' +
    '.stat-value.a{color:var(--sky,#2f6fb0);}' +
    '.cases{display:flex;justify-content:center;gap:20px;flex-wrap:wrap;margin-bottom:14px;}' +
    '.case{display:flex;align-items:center;gap:7px;font-weight:600;font-size:0.9rem;cursor:pointer;color:var(--ink,#241f1a);}' +
    '.case input[type="checkbox"]{width:16px;height:16px;cursor:pointer;accent-color:var(--accent,#a8471f);}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-width:0;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;font-size:0.92rem;}' +
    '.btn{padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;min-height:38px;}' +
    '.btn:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '.btn-reset{margin-top:2px;align-self:center;}' +
    'button:focus-visible,select:focus-visible{outline:2px solid var(--plan,#5b4ea3);outline-offset:2px;}' +
    '</style>' +
    '<div class="modes" role="group" aria-label="Mode">' +
    '<button type="button" id="mode-libre">Libre</button>' +
    '<button type="button" id="mode-defi">Défi</button>' +
    '</div>' +
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
    '<div class="defi" id="defi" hidden>' +
    '<p class="verdict" id="verdict" aria-live="polite"></p>' +
    '<p class="note" id="note" hidden></p>' +
    '<p class="revelation" id="revelation" hidden></p>' +
    '<div class="defi-boutons">' +
    '<button type="button" class="btn" id="nouvelle-cible">Nouvelle cible</button>' +
    '<button type="button" class="btn" id="reveler">Révéler les réglages de la cible</button>' +
    '</div>' +
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
    '<button class="btn btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>' +
    '<div class="stats">' +
    '<div class="stat"><span class="stat-label">point caractéristique</span><span class="stat-value" id="val-point"></span></div>' +
    '<div class="stat"><span class="stat-label">A, image de (1 ; 1)</span><span class="stat-value a" id="val-a"></span></div>' +
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
    this._mode = "libre";
    this._famille = DEFAUT.famille;
    this._th = DEFAUT.th;
    this._tv = DEFAUT.tv;
    this._kh = DEFAUT.kh;
    this._kv = DEFAUT.kv;
    this._sox = DEFAUT.sox;
    this._soy = DEFAUT.soy;
    this._cible = null;
    this._revele = false;
    this._selectFamille = shadow.getElementById("famille");
    this._formule = shadow.getElementById("formule");
    this._svg = shadow.getElementById("svg");
    this._valPoint = shadow.getElementById("val-point");
    this._valA = shadow.getElementById("val-a");
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
    this._btnLibre = shadow.getElementById("mode-libre");
    this._btnDefi = shadow.getElementById("mode-defi");
    this._defi = shadow.getElementById("defi");
    this._verdict = shadow.getElementById("verdict");
    this._note = shadow.getElementById("note");
    this._revelation = shadow.getElementById("revelation");
    this._btnNouvelle = shadow.getElementById("nouvelle-cible");
    this._btnReveler = shadow.getElementById("reveler");
    this._selectFamille.value = this._famille;
  };

  Transformation8ParametresWidgetClass.prototype._reglage = function () {
    return { th: this._th, tv: this._tv, kh: this._kh, kv: this._kv, sox: this._sox, soy: this._soy };
  };

  Transformation8ParametresWidgetClass.prototype._appliquerReglage = function (r) {
    this._th = r.th; this._tv = r.tv; this._kh = r.kh; this._kv = r.kv; this._sox = r.sox; this._soy = r.soy;
    this._inputTh.value = String(r.th);
    this._inputTv.value = String(r.tv);
    this._inputKh.value = String(r.kh);
    this._inputKv.value = String(r.kv);
    this._caseSox.checked = r.sox;
    this._caseSoy.checked = r.soy;
  };

  /** Cible atteignable, visible dans la fenêtre, et différente de la courbe actuelle. */
  Transformation8ParametresWidgetClass.prototype._nouvelleCible = function () {
    var famille = this._famille, win = FAMILLES[famille], actuel = this._reglage();
    var pioche = function (t) { return t[Math.floor(Math.random() * t.length)]; };
    for (var essai = 0; essai < 200; essai++) {
      var c = { th: pioche(CIBLE_T), tv: pioche(CIBLE_T), kh: pioche(CIBLE_K), kv: pioche(CIBLE_K), sox: Math.random() < 0.4, soy: Math.random() < 0.4 };
      if (memesCourbes(famille, c, actuel)) continue;
      var f = fonction(famille, c), visibles = 0, total = 0;
      for (var i = 0; i <= 60; i++) {
        var x = win.X_MIN + (i / 60) * (win.X_MAX - win.X_MIN);
        var y = f(x);
        if (!isFinite(y)) continue;
        total++;
        if (y >= win.Y_MIN && y <= win.Y_MAX) visibles++;
      }
      if (total === 0 || visibles < 0.35 * total) continue;
      this._cible = c;
      this._revele = false;
      return;
    }
    this._cible = { th: 1, tv: -1, kh: 1, kv: 2, sox: false, soy: false };
    this._revele = false;
  };

  Transformation8ParametresWidgetClass.prototype._changerMode = function (mode) {
    if (this._mode === mode) return;
    this._mode = mode;
    if (mode === "defi") {
      this._appliquerReglage(NEUTRE);
      this._nouvelleCible();
    } else {
      this._cible = null;
    }
    this._rendre();
  };

  Transformation8ParametresWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onChangeFamille = function () {
      self._famille = self._selectFamille.value;
      if (self._mode === "defi") { self._appliquerReglage(NEUTRE); self._nouvelleCible(); }
      self._rendre();
    };
    this._onInputTh = function () { self._th = parseFloat(self._inputTh.value); self._rendre(); };
    this._onInputTv = function () { self._tv = parseFloat(self._inputTv.value); self._rendre(); };
    this._onInputKh = function () { self._kh = parseFloat(self._inputKh.value); self._rendre(); };
    this._onInputKv = function () { self._kv = parseFloat(self._inputKv.value); self._rendre(); };
    this._onChangeSox = function () { self._sox = self._caseSox.checked; self._rendre(); };
    this._onChangeSoy = function () { self._soy = self._caseSoy.checked; self._rendre(); };
    this._onReset = function () {
      if (self._mode === "defi") {
        // En défi : les curseurs reviennent à la fonction de référence, la cible reste la même.
        self._appliquerReglage(NEUTRE);
      } else {
        self._famille = DEFAUT.famille;
        self._selectFamille.value = DEFAUT.famille;
        self._appliquerReglage(DEFAUT);
      }
      self._rendre();
    };
    this._onLibre = function () { self._changerMode("libre"); };
    this._onDefi = function () { self._changerMode("defi"); };
    this._onNouvelle = function () { self._appliquerReglage(NEUTRE); self._nouvelleCible(); self._rendre(); };
    this._onReveler = function () { self._revele = true; self._rendre(); };
    this._selectFamille.addEventListener("change", this._onChangeFamille);
    this._inputTh.addEventListener("input", this._onInputTh);
    this._inputTv.addEventListener("input", this._onInputTv);
    this._inputKh.addEventListener("input", this._onInputKh);
    this._inputKv.addEventListener("input", this._onInputKv);
    this._caseSox.addEventListener("change", this._onChangeSox);
    this._caseSoy.addEventListener("change", this._onChangeSoy);
    this._resetBtn.addEventListener("click", this._onReset);
    this._btnLibre.addEventListener("click", this._onLibre);
    this._btnDefi.addEventListener("click", this._onDefi);
    this._btnNouvelle.addEventListener("click", this._onNouvelle);
    this._btnReveler.addEventListener("click", this._onReveler);
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
    this._btnLibre.removeEventListener("click", this._onLibre);
    this._btnDefi.removeEventListener("click", this._onDefi);
    this._btnNouvelle.removeEventListener("click", this._onNouvelle);
    this._btnReveler.removeEventListener("click", this._onReveler);
  };

  Transformation8ParametresWidgetClass.prototype._toPx = function (win, xMath, yMath) {
    var px = MARGE + (xMath - win.X_MIN) / (win.X_MAX - win.X_MIN) * (LARGEUR - 2 * MARGE);
    var py = HAUTEUR - MARGE - (yMath - win.Y_MIN) / (win.Y_MAX - win.Y_MIN) * (HAUTEUR - 2 * MARGE);
    return [px, py];
  };

  Transformation8ParametresWidgetClass.prototype._traceIntervalle = function (svg, ns, win, xMin, xMax, f, classe) {
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
      svg.appendChild(svgEl(ns, "path", { d: seg, class: classe || "courbe" }));
    });
  };

  /** Trace la courbe d'un réglage (domaine propre à la famille). */
  Transformation8ParametresWidgetClass.prototype._traceReglage = function (svg, ns, win, famille, r, classe) {
    var def = FAMILLES[famille];
    var f = fonction(famille, r);
    if (def.domaine === "inverse") {
      this._traceIntervalle(svg, ns, win, win.X_MIN, r.th - 0.02, f, classe);
      this._traceIntervalle(svg, ns, win, r.th + 0.02, win.X_MAX, f, classe);
    } else if (def.domaine === "racine") {
      // Domaine = { x : signH·kh·(x-TH) ≥ 0 } — dépend du signe de SOY, c'est précisément ce que
      // l'astuce désigne comme le seul rôle réellement indépendant de SOY pour cette famille.
      if (!r.soy) this._traceIntervalle(svg, ns, win, r.th, win.X_MAX, f, classe);
      else this._traceIntervalle(svg, ns, win, win.X_MIN, r.th, f, classe);
    } else {
      this._traceIntervalle(svg, ns, win, win.X_MIN, win.X_MAX, f, classe);
    }
  };

  Transformation8ParametresWidgetClass.prototype._rendreDefi = function () {
    var defi = this._mode === "defi" && this._cible;
    this._defi.hidden = !defi;
    if (!defi) return;
    var r = this._reglage(), c = this._cible, famille = this._famille;
    var ok = memesCourbes(famille, r, c);
    this._verdict.className = "verdict" + (ok ? " ok" : "");
    this._verdict.textContent = ok
      ? "Recouverte ! Ta courbe et la cible sont exactement la même courbe."
      : "Pas encore : règle les curseurs pour recouvrir la courbe en pointillés verts.";
    var memeCurseurs = r.th === c.th && r.tv === c.tv && Math.abs(r.kh - c.kh) < 1e-9 && Math.abs(r.kv - c.kv) < 1e-9 && r.sox === c.sox && r.soy === c.soy;
    var note = "";
    if (ok && !memeCurseurs) {
      note = "Tes réglages ne sont pas ceux qui ont servi à tracer la cible, et pourtant c'est la même courbe : un réglage équivalent.";
      if (r.soy !== c.soy && PARITE[famille] === "paire") note += " Pour une fonction paire, SOY ne change rien à la courbe.";
      else if ((r.sox !== c.sox || r.soy !== c.soy) && PARITE[famille] === "impaire") note += " Pour une fonction impaire, SOX et SOY donnent la même courbe.";
      if (Math.abs(r.kh - c.kh) > 1e-9 || Math.abs(r.kv - c.kv) > 1e-9) note += " Ici, un facteur horizontal peut se compenser par un facteur vertical.";
    }
    this._note.hidden = !note;
    this._note.textContent = note;
    this._revelation.hidden = !this._revele;
    this._revelation.textContent = this._revele ? "Réglages de la cible : " + texteReglage(c) : "";
    this._btnReveler.disabled = this._revele;
  };

  Transformation8ParametresWidgetClass.prototype._rendre = function () {
    var famille = this._famille, th = this._th, tv = this._tv, kh = this._kh, kv = this._kv, sox = this._sox, soy = this._soy;
    var def = FAMILLES[famille];
    var win = def;
    var signH = soy ? -1 : 1, signV = sox ? -1 : 1;

    this._btnLibre.setAttribute("aria-pressed", this._mode === "libre" ? "true" : "false");
    this._btnDefi.setAttribute("aria-pressed", this._mode === "defi" ? "true" : "false");

    this._formule.textContent =
      "f(x) = " + (signV < 0 ? "−" : "") + formatNombreFr(kv, 1) + "·g(" + (signH < 0 ? "−" : "") + formatNombreFr(kh, 1) +
      "·(x" + (th >= 0 ? "−" + formatNombreFr(th, 1) : "+" + formatNombreFr(-th, 1)) + ")) " + (tv >= 0 ? "+ " : "− ") + formatNombreFr(Math.abs(tv), 1) +
      "   [g(x) = " + def.symbole + "]";
    this._valPoint.textContent = "(" + formatNombreFr(th, 1) + " ; " + formatNombreFr(tv, 1) + ")";
    // A = image de (1 ; 1) : l'argument de g vaut 1 pour x = TH + 1/(SOY·CH/EH), et g(1) = 1.
    var ax = th + 1 / (signH * kh), ay = signV * kv + tv;
    this._valA.textContent = "(" + fmt(ax) + " ; " + fmt(ay) + ")";
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

    // Cible du défi (sous la courbe de l'élève, en pointillés verts).
    if (this._mode === "defi" && this._cible) this._traceReglage(svg, ns, win, famille, this._cible, "courbe-cible");

    var r = this._reglage();
    if (def.domaine === "inverse") {
      var pAsymH0 = self._toPx(win, win.X_MIN, tv), pAsymH1 = self._toPx(win, win.X_MAX, tv);
      svg.appendChild(svgEl(ns, "line", { x1: pAsymH0[0].toFixed(2), y1: pAsymH0[1].toFixed(2), x2: pAsymH1[0].toFixed(2), y2: pAsymH1[1].toFixed(2), class: "asymptote" }));
      if (th >= win.X_MIN && th <= win.X_MAX) {
        var pAsymV0 = self._toPx(win, th, win.Y_MIN), pAsymV1 = self._toPx(win, th, win.Y_MAX);
        svg.appendChild(svgEl(ns, "line", { x1: pAsymV0[0].toFixed(2), y1: pAsymV0[1].toFixed(2), x2: pAsymV1[0].toFixed(2), y2: pAsymV1[1].toFixed(2), class: "asymptote" }));
      }
    }
    this._traceReglage(svg, ns, win, famille, r, "courbe");

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

    // Point A, image de (1 ; 1) — dessiné s'il est dans la fenêtre ; étiquette tournée vers l'intérieur.
    if (ax >= win.X_MIN && ax <= win.X_MAX && ay >= win.Y_MIN && ay <= win.Y_MAX) {
      var pA = self._toPx(win, ax, ay);
      svg.appendChild(svgEl(ns, "circle", { cx: pA[0].toFixed(2), cy: pA[1].toFixed(2), r: 5, class: "point-a" }));
      var aDroite = pA[0] < LARGEUR - MARGE - 30;
      var yA = pA[1] - 8 < 14 ? pA[1] + 18 : pA[1] - 8;
      var etA = svgEl(ns, "text", { x: (pA[0] + (aDroite ? 8 : -8)).toFixed(2), y: yA.toFixed(2), "text-anchor": aDroite ? "start" : "end", class: "etiquette-a" });
      etA.textContent = "A";
      svg.appendChild(etA);
    }

    this._rendreDefi();
  };

  if (!customElements.get("transformation-8-parametres-widget")) {
    customElements.define("transformation-8-parametres-widget", Transformation8ParametresWidgetClass);
  }
})();
