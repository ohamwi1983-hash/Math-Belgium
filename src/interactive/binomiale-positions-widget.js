(function () {
  "use strict";

  /* ================================================================
   * <binomiale-positions-widget> — atelier interactif : n (curseur
   * entier), p (curseur), k (sélecteur) — barres de la distribution
   * P(X=k) recalculées en direct, k courant surligné. Matérialise en
   * direct les DEUX pièges de la section : oublier de compter le
   * nombre de POSITIONS (chemins) C(n,k) donne un résultat n fois trop
   * petit ; et P(au moins 1) ne s'obtient JAMAIS en additionnant les p
   * (qui peut dépasser 1, impossible), toujours par le complément.
   * Réglage par défaut (n=5, p=0,3, k=2) reproduit exactement l'exemple
   * résolu : P(X=2)=0,3087 via 10 positions. Web Component (Shadow
   * DOM).
   * ================================================================ */

  var DEFAUT = { n: 5, p: 0.3, k: 2 };
  var BORNES_N = { min: 1, max: 8, step: 1 };
  var BORNES_P = { min: 0.05, max: 0.95, step: 0.05 };

  var LARGEUR = 420, HAUTEUR = 220, MARGE_G = 34, MARGE_D = 14, MARGE_H = 14, MARGE_B = 34;

  function formatNombreFr(n, decimales) {
    var facteur = Math.pow(10, decimales);
    var arrondi = Math.round(n * facteur) / facteur;
    if (Object.is(arrondi, -0)) arrondi = 0;
    return arrondi.toFixed(decimales).replace(".", ",").replace("-", "−");
  }

  function combinaison(n, k) {
    if (k < 0 || k > n) return 0;
    k = Math.min(k, n - k);
    var resultat = 1;
    for (var i = 0; i < k; i++) resultat = (resultat * (n - i)) / (i + 1);
    return Math.round(resultat);
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
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.barre{fill:var(--accent-soft-line,#e8c4a4);}' +
    '.barre-active{fill:var(--accent,#a8471f);}' +
    '.etiquette-barre{font-size:10px;fill:var(--ink-soft,#6b6055);font-family:var(--mono,monospace);}' +
    '.etiquette-k{font-size:11px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.k-select{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-bottom:12px;}' +
    '.k-select button{padding:6px 12px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink-soft,#6b6055);font-weight:700;cursor:pointer;font-size:0.86rem;font-family:inherit;}' +
    '.k-select button.actif{background:var(--accent,#a8471f);border-color:var(--accent,#a8471f);color:#fff;}' +
    '.lecture{display:flex;flex-direction:column;gap:6px;margin:0 0 18px;font-variant-numeric:tabular-nums;}' +
    '.ligne-formule{padding:9px 12px;border-radius:var(--radius,3px);background:var(--surface-2,#faf6f0);font-size:0.85rem;}' +
    '.ligne-vrai{font-weight:700;color:var(--good,#2f7a4f);}' +
    '.ligne-faux{color:var(--bad,#b23a3a);}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{margin-top:2px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<div class="k-select" id="kselect"></div>' +
    '<div class="lecture" id="lecture"></div>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="n">n (tirages)</label><div class="curseur-row">' +
    '<input type="range" id="n" min="' + BORNES_N.min + '" max="' + BORNES_N.max + '" step="' + BORNES_N.step + '" value="' + DEFAUT.n + '">' +
    '<span class="curseur-valeur" id="n-valeur"></span></div></div>' +
    '<div class="curseur"><label for="p">p (succès)</label><div class="curseur-row">' +
    '<input type="range" id="p" min="' + BORNES_P.min + '" max="' + BORNES_P.max + '" step="' + BORNES_P.step + '" value="' + DEFAUT.p + '">' +
    '<span class="curseur-valeur" id="p-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class BinomialePositionsWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  BinomialePositionsWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._n = DEFAUT.n; this._p = DEFAUT.p; this._k = DEFAUT.k;
    this._svg = shadow.getElementById("svg");
    this._kSelect = shadow.getElementById("kselect");
    this._lecture = shadow.getElementById("lecture");
    this._inputN = shadow.getElementById("n");
    this._inputP = shadow.getElementById("p");
    this._valeurN = shadow.getElementById("n-valeur");
    this._valeurP = shadow.getElementById("p-valeur");
    this._resetBtn = shadow.getElementById("reset");
  };

  BinomialePositionsWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInputN = function () {
      self._n = parseInt(self._inputN.value, 10);
      if (self._k > self._n) self._k = self._n;
      self._rendre();
    };
    this._onInputP = function () { self._p = parseFloat(self._inputP.value); self._rendre(); };
    this._onClickK = function (evt) {
      var btn = evt.target.closest("button[data-k]");
      if (!btn) return;
      self._k = parseInt(btn.getAttribute("data-k"), 10);
      self._rendre();
    };
    this._onReset = function () {
      self._n = DEFAUT.n; self._p = DEFAUT.p; self._k = DEFAUT.k;
      self._inputN.value = String(DEFAUT.n);
      self._inputP.value = String(DEFAUT.p);
      self._rendre();
    };
    this._inputN.addEventListener("input", this._onInputN);
    this._inputP.addEventListener("input", this._onInputP);
    this._kSelect.addEventListener("click", this._onClickK);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  BinomialePositionsWidgetClass.prototype.disconnectedCallback = function () {
    this._inputN.removeEventListener("input", this._onInputN);
    this._inputP.removeEventListener("input", this._onInputP);
    this._kSelect.removeEventListener("click", this._onClickK);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  BinomialePositionsWidgetClass.prototype._rendre = function () {
    var n = this._n, p = this._p, k = this._k;
    this._valeurN.textContent = String(n);
    this._valeurP.textContent = formatNombreFr(p, 2);

    var boutonsK = "";
    for (var i = 0; i <= n; i++) {
      boutonsK += '<button type="button" data-k="' + i + '" class="' + (i === k ? "actif" : "") + '">' + i + '</button>';
    }
    this._kSelect.innerHTML = boutonsK;

    var probas = [];
    for (var kk = 0; kk <= n; kk++) {
      var c = combinaison(n, kk);
      probas.push(c * Math.pow(p, kk) * Math.pow(1 - p, n - kk));
    }

    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    svg.innerHTML = "";

    var defs = svgEl(ns, "defs", {});
    var fleche = svgEl(ns, "marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
    fleche.appendChild(svgEl(ns, "path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
    defs.appendChild(fleche);
    svg.appendChild(defs);

    var origineY = HAUTEUR - MARGE_B, hautY = MARGE_H;
    svg.appendChild(svgEl(ns, "line", { x1: MARGE_G, x2: LARGEUR - MARGE_D, y1: origineY, y2: origineY, class: "axe", "marker-end": "url(#fleche)" }));
    svg.appendChild(svgEl(ns, "line", { x1: MARGE_G, x2: MARGE_G, y1: origineY, y2: hautY, class: "axe", "marker-end": "url(#fleche)" }));

    var largeurDispo = LARGEUR - MARGE_G - MARGE_D;
    var largeurBarre = (largeurDispo / (n + 1)) * 0.62;
    var hauteurDispo = origineY - hautY;

    probas.forEach(function (proba, kk) {
      var centreX = MARGE_G + largeurDispo * ((kk + 0.5) / (n + 1));
      var hauteurBarre = proba * hauteurDispo;
      svg.appendChild(svgEl(ns, "rect", {
        x: (centreX - largeurBarre / 2).toFixed(2),
        y: (origineY - hauteurBarre).toFixed(2),
        width: largeurBarre.toFixed(2),
        height: hauteurBarre.toFixed(2),
        class: kk === k ? "barre-active" : "barre",
      }));
      var etVal = svgEl(ns, "text", { x: centreX.toFixed(2), y: (origineY - hauteurBarre - 6).toFixed(2), "text-anchor": "middle", class: "etiquette-barre" });
      etVal.textContent = formatNombreFr(proba, 3);
      svg.appendChild(etVal);
      var etK = svgEl(ns, "text", { x: centreX.toFixed(2), y: (origineY + 16).toFixed(2), "text-anchor": "middle", class: "etiquette-k" });
      etK.textContent = "k=" + kk;
      svg.appendChild(etK);
    });

    var cnk = combinaison(n, k);
    var probaUnChemin = Math.pow(p, k) * Math.pow(1 - p, n - k);
    var probaXk = cnk * probaUnChemin;
    var pAuMoinsUn = 1 - Math.pow(1 - p, n);
    var pAuMoinsUnFaux = n * p;

    this._lecture.innerHTML =
      '<div class="ligne-formule ligne-vrai">Positions pour k=' + k + ' succès parmi n=' + n + ' : C(' + n + ';' + k + ')=' + cnk + ' → P(X=' + k + ') = ' + cnk + '×' + formatNombreFr(p, 2) + '^' + k + '×' + formatNombreFr(1 - p, 2) + '^' + (n - k) + ' = ' + formatNombreFr(probaXk, 4) + '</div>' +
      '<div class="ligne-formule ligne-faux">✗ Piège — oublier les positions : ' + formatNombreFr(p, 2) + '^' + k + '×' + formatNombreFr(1 - p, 2) + '^' + (n - k) + ' = ' + formatNombreFr(probaUnChemin, 4) + ' (' + cnk + ' fois trop petit !)</div>' +
      '<div class="ligne-formule ligne-vrai">P(au moins 1 succès) = 1 − (1−p)ⁿ = 1 − ' + formatNombreFr(1 - p, 2) + '^' + n + ' = ' + formatNombreFr(pAuMoinsUn, 4) + '</div>' +
      '<div class="ligne-formule ligne-faux">✗ Piège — additionner les p : n×p = ' + n + '×' + formatNombreFr(p, 2) + ' = ' + formatNombreFr(pAuMoinsUnFaux, 2) + (pAuMoinsUnFaux > 1 ? ' (IMPOSSIBLE, dépasse 1 !)' : ' — différent de ' + formatNombreFr(pAuMoinsUn, 4)) + '</div>';
  };

  if (!customElements.get("binomiale-positions-widget")) {
    customElements.define("binomiale-positions-widget", BinomialePositionsWidgetClass);
  }
})();
