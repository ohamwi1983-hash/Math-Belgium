(function () {
  "use strict";

  /* ================================================================
   * <reciproque-miroir-widget> — atelier interactif : f et f⁻¹ symétriques par
   * rapport à y=x. Un curseur x déplace un point sur f ; son symétrique suit
   * automatiquement sur f⁻¹, avec un pointillé perpendiculaire à y=x reliant les
   * deux. Deux fonctions au choix (linéaire, cubique) pour montrer que l'idée
   * n'est pas propre aux droites. Web Component (Shadow DOM).
   * ================================================================ */

  var FONCTIONS = {
    lineaire: {
      label: 'f(x) = 2x + 1',
      labelReciproque: "f⁻¹(x) = (x−1)/2",
      f: function (x) { return 2 * x + 1; },
      fInv: function (x) { return (x - 1) / 2; },
      xMin: -3, xMax: 3, step: 0.01,
    },
    cubique: {
      label: 'f(x) = x³',
      labelReciproque: "f⁻¹(x) = ∛x",
      f: function (x) { return x * x * x; },
      fInv: function (x) { return Math.cbrt(x); },
      xMin: -1.8, xMax: 1.8, step: 0.01,
    },
  };

  // Fenêtre carrée FIXE et commune aux deux fonctions — indispensable pour que la
  // droite y=x apparaisse bien à 45°, et pour que le symétrique d'un point reste
  // visuellement son vrai symétrique (piège déjà rencontré : un cadrage non carré,
  // ou qui varie selon le choix de fonction, casse cette lecture géométrique).
  var DOMAINE = 7; // x et y ∈ [-DOMAINE ; DOMAINE]
  var TAILLE = 340, MARGE = 30;

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
    '.select-row{display:flex;justify-content:center;margin-bottom:12px;}' +
    '.select-row select{font-family:inherit;font-size:0.92rem;font-weight:600;color:var(--ink,#241f1a);background:var(--surface,#fff);border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:6px 10px;cursor:pointer;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:16px;}' +
    'svg{width:100%;max-width:340px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.diagonale{stroke:var(--ink-faint,#9c9083);stroke-width:1.3;stroke-dasharray:5 4;}' +
    '.courbe-f{stroke:var(--accent,#a8471f);stroke-width:2.6;fill:none;}' +
    '.courbe-finv{stroke:var(--good,#2f7a4f);stroke-width:2.6;fill:none;}' +
    '.guide-miroir{stroke:var(--plan,#5b4ea3);stroke-width:1.2;stroke-dasharray:4 3;opacity:0.75;}' +
    '.point-f{fill:var(--accent,#a8471f);}' +
    '.point-finv{fill:var(--good,#2f7a4f);}' +
    '.etiquette{font-size:11px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.etiquette-point{font-size:11px;font-weight:600;font-family:var(--mono,monospace);}' +
    '.etiquette-point-f{fill:var(--accent-ink,#7a3212);}' +
    '.etiquette-point-finv{fill:var(--good,#2f7a4f);}' +
    '.legende{font-size:11.5px;font-weight:600;font-family:var(--sans,sans-serif);}' +
    '.legende-f{fill:var(--accent-ink,#7a3212);}' +
    '.legende-finv{fill:var(--good,#2f7a4f);}' +
    '.legende-diag{fill:var(--ink-faint,#9c9083);}' +
    '.stats{display:flex;align-items:stretch;justify-content:center;gap:6px;margin-bottom:20px;flex-wrap:wrap;}' +
    '.stat{flex:1 1 130px;min-width:0;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:8px 6px;text-align:center;background:var(--surface,#fff);}' +
    '.stat-label{display:block;font-family:var(--mono,monospace);font-size:10px;letter-spacing:0.02em;color:var(--ink-faint,#9c9083);margin-bottom:5px;}' +
    '.stat-value{display:block;font-variant-numeric:tabular-nums;font-size:0.94rem;font-weight:600;color:var(--ink,#241f1a);white-space:nowrap;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);text-align:center;}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;font-size:0.92rem;}' +
    '</style>' +
    '<div class="select-row"><select id="fonction">' +
    '<option value="lineaire">f(x) = 2x + 1</option>' +
    '<option value="cubique">f(x) = x³</option>' +
    '</select></div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + TAILLE + ' ' + TAILLE + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<div class="stats">' +
    '<div class="stat"><span class="stat-label">point sur f</span><span class="stat-value" id="val-point-f"></span></div>' +
    '<div class="stat"><span class="stat-label">symétrique sur f⁻¹</span><span class="stat-value" id="val-point-finv"></span></div>' +
    '</div>' +
    '<div class="curseur"><label for="x">x</label><div class="curseur-row">' +
    '<input type="range" id="x" min="0" max="1" step="0.001" value="0.5">' +
    '<span class="curseur-valeur" id="x-valeur"></span></div></div>';

  class ReciproqueMiroirWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  ReciproqueMiroirWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._cle = 'lineaire';
    this._svg = shadow.getElementById("svg");
    this._selectFonction = shadow.getElementById("fonction");
    this._inputX = shadow.getElementById("x");
    this._valeurX = shadow.getElementById("x-valeur");
    this._valPointF = shadow.getElementById("val-point-f");
    this._valPointFinv = shadow.getElementById("val-point-finv");
    this._xNorm = 0.5;
  };

  ReciproqueMiroirWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onChangeFonction = function () {
      self._cle = self._selectFonction.value;
      self._rendre();
    };
    this._onInputX = function () {
      self._xNorm = parseFloat(self._inputX.value);
      self._rendre();
    };
    this._selectFonction.addEventListener("change", this._onChangeFonction);
    this._inputX.addEventListener("input", this._onInputX);
    this._rendre();
  };

  ReciproqueMiroirWidgetClass.prototype.disconnectedCallback = function () {
    this._selectFonction.removeEventListener("change", this._onChangeFonction);
    this._inputX.removeEventListener("input", this._onInputX);
  };

  ReciproqueMiroirWidgetClass.prototype._toPx = function (xMath, yMath) {
    var px = MARGE + (xMath + DOMAINE) / (2 * DOMAINE) * (TAILLE - 2 * MARGE);
    var py = TAILLE - MARGE - (yMath + DOMAINE) / (2 * DOMAINE) * (TAILLE - 2 * MARGE);
    return [px, py];
  };

  ReciproqueMiroirWidgetClass.prototype._traceFonction = function (svg, ns, f, classe) {
    var self = this;
    var n = 200, segments = [], courant = "", dernierValide = false;
    var def = FONCTIONS[self._cle];
    for (var i = 0; i <= n; i++) {
      var xx = def.xMin + (i / n) * (def.xMax - def.xMin);
      var yy = f(xx);
      var valide = isFinite(yy) && yy >= -DOMAINE - 0.5 && yy <= DOMAINE + 0.5;
      if (valide) {
        var p = self._toPx(xx, Math.max(-DOMAINE, Math.min(DOMAINE, yy)));
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

  // Étiquette d'un point, ancrée à gauche ou à droite selon la proximité du bord
  // du cadre — évite le rognage (overflow:hidden implicite d'un <svg> racine)
  // déjà rencontré ailleurs sur ce site quand une étiquette est toujours ancrée
  // du même côté sans tenir compte du bord.
  ReciproqueMiroirWidgetClass.prototype._etiquettePoint = function (svg, ns, px, py, texte, classe) {
    var procheDroite = px > TAILLE - 70;
    var procheHaut = py < MARGE + 18;
    var ancre = procheDroite ? "end" : "start";
    var dx = procheDroite ? -8 : 8;
    var dy = procheHaut ? 16 : -8;
    var t = svgEl(ns, "text", { x: (px + dx).toFixed(2), y: (py + dy).toFixed(2), "text-anchor": ancre, class: classe });
    t.textContent = texte;
    svg.appendChild(t);
  };

  ReciproqueMiroirWidgetClass.prototype._rendre = function () {
    var def = FONCTIONS[this._cle];
    var x = def.xMin + this._xNorm * (def.xMax - def.xMin);
    var y = def.f(x);

    this._valeurX.textContent = formatNombreFr(x, 2);
    this._valPointF.textContent = "(" + formatNombreFr(x, 2) + " ; " + formatNombreFr(y, 2) + ")";
    this._valPointFinv.textContent = "(" + formatNombreFr(y, 2) + " ; " + formatNombreFr(x, 2) + ")";

    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    svg.innerHTML = "";
    var self = this;

    var defs = svgEl(ns, "defs", {});
    var marker = svgEl(ns, "marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
    marker.appendChild(svgEl(ns, "path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
    defs.appendChild(marker);
    svg.appendChild(defs);

    // Axes — flèches en bout (marker-end), la ligne verticale est dessinée du bas vers le haut
    // pour que son "end" (donc la flèche) pointe vers le haut, pas vers l'origine.
    var origine = self._toPx(0, 0);
    svg.appendChild(svgEl(ns, "line", { x1: MARGE, x2: TAILLE - MARGE, y1: origine[1].toFixed(2), y2: origine[1].toFixed(2), class: "axe", "marker-end": "url(#fleche)" }));
    svg.appendChild(svgEl(ns, "line", { x1: origine[0].toFixed(2), x2: origine[0].toFixed(2), y1: TAILLE - MARGE, y2: MARGE, class: "axe", "marker-end": "url(#fleche)" }));

    // Diagonale y = x
    var pD0 = self._toPx(-DOMAINE, -DOMAINE);
    var pD1 = self._toPx(DOMAINE, DOMAINE);
    svg.appendChild(svgEl(ns, "line", { x1: pD0[0].toFixed(2), y1: pD0[1].toFixed(2), x2: pD1[0].toFixed(2), y2: pD1[1].toFixed(2), class: "diagonale" }));

    // f et f⁻¹
    this._traceFonction(svg, ns, def.f, "courbe-f");
    this._traceFonction(svg, ns, def.fInv, "courbe-finv");

    // Guide pointillé reliant le point et son symétrique (perpendiculaire à y=x)
    if (Math.abs(x) <= DOMAINE && Math.abs(y) <= DOMAINE) {
      var pF = self._toPx(x, y);
      var pFinv = self._toPx(y, x);
      svg.appendChild(svgEl(ns, "line", { x1: pF[0].toFixed(2), y1: pF[1].toFixed(2), x2: pFinv[0].toFixed(2), y2: pFinv[1].toFixed(2), class: "guide-miroir" }));

      svg.appendChild(svgEl(ns, "circle", { cx: pF[0].toFixed(2), cy: pF[1].toFixed(2), r: 4.5, class: "point-f" }));
      svg.appendChild(svgEl(ns, "circle", { cx: pFinv[0].toFixed(2), cy: pFinv[1].toFixed(2), r: 4.5, class: "point-finv" }));

      self._etiquettePoint(svg, ns, pF[0], pF[1], "(" + formatNombreFr(x, 2) + ";" + formatNombreFr(y, 2) + ")", "etiquette-point etiquette-point-f");
      self._etiquettePoint(svg, ns, pFinv[0], pFinv[1], "(" + formatNombreFr(y, 2) + ";" + formatNombreFr(x, 2) + ")", "etiquette-point etiquette-point-finv");
    }

    // Légende
    var yLegende = MARGE + 4;
    var legF = svgEl(ns, "text", { x: MARGE + 4, y: yLegende, class: "legende legende-f" });
    legF.textContent = def.label;
    svg.appendChild(legF);
    var legFinv = svgEl(ns, "text", { x: MARGE + 4, y: yLegende + 15, class: "legende legende-finv" });
    legFinv.textContent = def.labelReciproque;
    svg.appendChild(legFinv);
    var legDiag = svgEl(ns, "text", { x: MARGE + 4, y: yLegende + 30, class: "legende legende-diag" });
    legDiag.textContent = "y = x";
    svg.appendChild(legDiag);
  };

  if (!customElements.get("reciproque-miroir-widget")) {
    customElements.define("reciproque-miroir-widget", ReciproqueMiroirWidgetClass);
  }
})();
