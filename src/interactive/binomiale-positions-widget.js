(function () {
  "use strict";

  /* ================================================================
   * <binomiale-positions-widget> — atelier interactif : n (curseur
   * entier), p (curseur), k (sélecteur), mode « exactement k » ou
   * « au moins k » — barres de la distribution P(X=k) recalculées en
   * direct, barre(s) concernée(s) surlignée(s). X = nombre de succès.
   * Matérialise les DEUX pièges de la section : oublier de compter les
   * chemins à k succès de l'arbre donne un résultat N fois trop petit
   * (N = nombre de ces chemins) ; et P(au moins 1) ne s'obtient jamais
   * en additionnant les p (qui peut dépasser 1), toujours par le
   * complément. Pour n ≤ 5, les chemins à k succès sont listés (S/É).
   * Aucune notation du chapitre suivant (analyse combinatoire) : le
   * nombre de chemins est obtenu en les comptant.
   * Réglage par défaut (n=5, p=0,3, k=2) reproduit exactement l'exemple
   * résolu : P(X=2)=0,3087 via 10 chemins. Web Component (Shadow DOM).
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

  /* Chemins de l'arbre à n étages contenant exactement k succès, sous forme
   * de mots en S (succès) / É (échec), dans l'ordre de lecture de l'arbre
   * (S avant É à chaque étage). */
  function cheminsASucces(n, k) {
    var res = [];
    (function construire(prefixe, restants, succes) {
      if (succes > k || succes + restants < k) return;
      if (restants === 0) { res.push(prefixe); return; }
      construire(prefixe + "S", restants - 1, succes + 1);
      construire(prefixe + "É", restants - 1, succes);
    })("", n, 0);
    return res;
  }

  /* Nombre de chemins à k succès : comptage étage par étage (chaque chemin à
   * k succès sur n étages finit par S — il en avait k−1 sur n−1 étages — ou
   * par É — il en avait k), sans formule toute faite. */
  function nombreChemins(n, k) {
    if (k < 0 || k > n) return 0;
    var ligne = [1];
    for (var e = 1; e <= n; e++) {
      var suivante = [];
      for (var j = 0; j <= e; j++) suivante.push((ligne[j - 1] || 0) + (ligne[j] || 0));
      ligne = suivante;
    }
    return ligne[k];
  }

  var EXPOSANTS = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
  function exposant(n) {
    return String(n).split("").map(function (c) { return EXPOSANTS[c]; }).join("");
  }
  /* « base puissance e » en exposant Unicode (jamais de « ^ »). */
  function puissance(base, e) {
    return base + exposant(e);
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
    '.mode{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-bottom:10px;}' +
    '.mode button{padding:6px 12px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink-soft,#6b6055);font-weight:600;cursor:pointer;font-size:0.86rem;font-family:inherit;}' +
    '.mode button.actif{background:var(--plan-soft,#ece8f7);border-color:var(--plan,#5b4ea3);color:var(--plan-ink,#463c86);}' +
    '.chemins{font-family:var(--mono,monospace);font-size:0.82rem;line-height:1.7;word-break:break-word;}' +
    '.chemins span{display:inline-block;margin:0 8px 0 0;}' +
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
    '<div class="mode" id="mode">' +
    '<button type="button" data-mode="exactement" class="actif">exactement k succès</button>' +
    '<button type="button" data-mode="auMoins">au moins k succès</button>' +
    '</div>' +
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
    this._n = DEFAUT.n; this._p = DEFAUT.p; this._k = DEFAUT.k; this._mode = "exactement";
    this._modeZone = shadow.getElementById("mode");
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
    this._onClickMode = function (evt) {
      var btn = evt.target.closest("button[data-mode]");
      if (!btn) return;
      self._mode = btn.getAttribute("data-mode");
      self._rendre();
    };
    this._onReset = function () {
      self._n = DEFAUT.n; self._p = DEFAUT.p; self._k = DEFAUT.k; self._mode = "exactement";
      self._inputN.value = String(DEFAUT.n);
      self._inputP.value = String(DEFAUT.p);
      self._rendre();
    };
    this._inputN.addEventListener("input", this._onInputN);
    this._inputP.addEventListener("input", this._onInputP);
    this._kSelect.addEventListener("click", this._onClickK);
    this._modeZone.addEventListener("click", this._onClickMode);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  BinomialePositionsWidgetClass.prototype.disconnectedCallback = function () {
    this._inputN.removeEventListener("input", this._onInputN);
    this._inputP.removeEventListener("input", this._onInputP);
    this._kSelect.removeEventListener("click", this._onClickK);
    this._modeZone.removeEventListener("click", this._onClickMode);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  BinomialePositionsWidgetClass.prototype._rendre = function () {
    var n = this._n, p = this._p, k = this._k;
    this._valeurN.textContent = String(n);
    this._valeurP.textContent = formatNombreFr(p, 2).replace(/(,\d*?)0+$/, "$1").replace(/,$/, "");
    var auMoins = this._mode === "auMoins";
    Array.prototype.forEach.call(this._modeZone.querySelectorAll("button"), function (b) {
      b.className = b.getAttribute("data-mode") === (auMoins ? "auMoins" : "exactement") ? "actif" : "";
    });

    var boutonsK = "";
    for (var i = 0; i <= n; i++) {
      boutonsK += '<button type="button" data-k="' + i + '" class="' + (i === k ? "actif" : "") + '">' + i + '</button>';
    }
    this._kSelect.innerHTML = boutonsK;

    var probas = [];
    for (var kk = 0; kk <= n; kk++) {
      var c = nombreChemins(n, kk);
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
        class: (auMoins ? kk >= k : kk === k) ? "barre-active" : "barre",
      }));
      var etVal = svgEl(ns, "text", { x: centreX.toFixed(2), y: (origineY - hauteurBarre - 6).toFixed(2), "text-anchor": "middle", class: "etiquette-barre" });
      etVal.textContent = formatNombreFr(proba, 3);
      svg.appendChild(etVal);
      var etK = svgEl(ns, "text", { x: centreX.toFixed(2), y: (origineY + 16).toFixed(2), "text-anchor": "middle", class: "etiquette-k" });
      etK.textContent = "k=" + kk;
      svg.appendChild(etK);
    });

    var nb = nombreChemins(n, k);
    var q = 1 - p;
    function court(v) { return formatNombreFr(v, 2).replace(/(,\d*?)0+$/, "$1").replace(/,$/, ""); }
    var pS = court(p), qS = court(q);
    function produitChemin(kk) {
      var facteurs = [];
      if (kk > 0) facteurs.push(kk === 1 ? pS : puissance(pS, kk));
      if (n - kk > 0) facteurs.push(n - kk === 1 ? qS : puissance(qS, n - kk));
      return facteurs.length ? facteurs.join(" × ") : "1";
    }
    /* « = 0,3087 » si la valeur s'écrit exactement avec 4 décimales, sinon « ≈ 0,3087 ». */
    function egal(v) {
      var exact = Math.abs(v * 1e4 - Math.round(v * 1e4)) < 1e-9;
      return exact ? "= " + formatNombreFr(v, 4).replace(/(,\d*?)0+$/, "$1").replace(/,$/, "") : "≈ " + formatNombreFr(v, 4);
    }
    var probaUnChemin = Math.pow(p, k) * Math.pow(q, n - k);
    var probaXk = nb * probaUnChemin;
    var pAuMoinsUn = 1 - Math.pow(q, n);
    var pAuMoinsUnFaux = n * p;
    var html = "";

    if (!auMoins) {
      html +=
        '<div class="ligne-formule ligne-vrai">Chemins de l\'arbre à ' + k + ' succès parmi ' + n + (n > 1 ? ' tirages : ' : ' tirage : ') + nb +
        ' → P(X = ' + k + ') = ' + nb + ' × ' + produitChemin(k) + ' ' + egal(probaXk) + '</div>';
      if (n <= 5) {
        html += '<div class="ligne-formule chemins">' + cheminsASucces(n, k).map(function (c) { return "<span>" + c + "</span>"; }).join("") + '</div>';
      }
      if (nb > 1) {
        html += '<div class="ligne-formule ligne-faux">✗ Piège — oublier de compter les chemins : ' + produitChemin(k) + ' ' +
          egal(probaUnChemin) + ' (' + nb + ' fois trop petit !)</div>';
      }
    } else {
      var somme = 0, termes = [];
      var exacts = true;
      for (var j = k; j <= n; j++) { somme += probas[j]; termes.push(formatNombreFr(probas[j], 4)); if (egal(probas[j]).charAt(0) !== "=") exacts = false; }
      html +=
        '<div class="ligne-formule ligne-vrai">P(X ≥ ' + k + ') = ' + (k === n ? "P(X = " + n + ")" : "P(X = " + k + ") + … + P(X = " + n + ")") +
        (exacts ? ' = ' : ' ≈ ') + termes.join(" + ") + ' ' + (exacts ? egal(somme) : '≈ ' + formatNombreFr(somme, 4)) + '</div>';
      if (k > 0) {
        var compl = 0;
        for (var j2 = 0; j2 < k; j2++) compl += probas[j2];
        html += '<div class="ligne-formule">Par le complément : 1 − P(X ≤ ' + (k - 1) + ') ' + egal(compl).charAt(0) + ' 1 − ' + formatNombreFr(compl, 4) + ' ' + egal(1 - compl) + '</div>';
      }
    }
    html +=
      '<div class="ligne-formule ligne-vrai">P(au moins 1 succès) = 1 − P(X = 0) = 1 − ' + (n === 1 ? qS : puissance(qS, n)) + ' ' + egal(pAuMoinsUn) + '</div>' +
      '<div class="ligne-formule ligne-faux">✗ Piège — additionner les p : n × p = ' + n + ' × ' + pS + ' = ' + court(pAuMoinsUnFaux) +
      (pAuMoinsUnFaux > 1 ? ' (impossible, dépasse 1 !)' : ' — différent de ' + formatNombreFr(pAuMoinsUn, 4).replace(/(,\d*?)0+$/, "$1").replace(/,$/, "")) + '</div>';
    this._lecture.innerHTML = html;
  };

  if (!customElements.get("binomiale-positions-widget")) {
    customElements.define("binomiale-positions-widget", BinomialePositionsWidgetClass);
  }
})();
