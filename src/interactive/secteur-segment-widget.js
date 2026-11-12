(function () {
  "use strict";

  /* ================================================================
   * <secteur-segment-widget> — atelier interactif : curseurs n (nombre de
   * côtés du polygone régulier inscrit) et r (rayon), calcule en direct
   * l'aire du secteur OAB, du triangle OAB et du segment circulaire (leur
   * différence), la longueur de la corde AB (loi des cosinus), et VÉRIFIE
   * en direct l'astuce de la section : n × segment = cercle − polygone.
   * Mode « angle θ libre » (audit 5e ch. 2) : θ de 10° à 350° sans polygone,
   * corde affichée par la loi des cosinus AB² = r² + r² − 2r²·cos θ.
   * Web Component (Shadow DOM).
   * ================================================================ */

  var PI = Math.PI;
  var DEFAUT = { n: 6, r: 4, thetaDeg: 60, mode: "polygone" };
  var BORNES_THETA = { min: 10, max: 350, step: 5 };
  var BORNES_N = { min: 3, max: 12, step: 1 };
  var BORNES_R = { min: 3, max: 10, step: 0.5 };

  var TAILLE = 300, CX = 150, CY = 150;
  // Le cercle dessiné doit changer visuellement avec r (curseur) — jamais un rayon fixe : C_R
  // (rayon EN PIXELS) est interpolé linéairement entre C_R_MIN (à r minimal) et C_R_MAX (à r
  // maximal), recalculé à chaque rendu plutôt qu'une constante de module (voir `_rendre`).
  var C_R_MIN = 65, C_R_MAX = 130;

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
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:14px;}' +
    'svg{width:100%;max-width:300px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.cercle-ref{stroke:var(--ink-faint,#9c9083);stroke-width:1.4;fill:none;}' +
    '.polygone{stroke:var(--line,#e2d8c8);stroke-width:1.3;fill:none;}' +
    '.rayon{stroke:var(--ink-soft,#6b6055);stroke-width:1.6;}' +
    '.corde{stroke:var(--ink,#241f1a);stroke-width:1.6;}' +
    '.segment-aire{fill:var(--accent,#a8471f);fill-opacity:0.35;stroke:var(--accent,#a8471f);stroke-width:1.6;}' +
    '.centre{fill:var(--ink-soft,#6b6055);}' +
    '.sommet{fill:var(--ink,#241f1a);}' +
    '.arc-theta{stroke:var(--plan,#5b4ea3);stroke-width:1.6;fill:none;}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.etiquette-sommet{font-size:12.5px;font-weight:700;fill:var(--ink,#241f1a);font-family:var(--sans,sans-serif);}' +
    '.etiquette-theta{font-size:11.5px;font-weight:600;fill:var(--plan,#5b4ea3);font-family:var(--sans,sans-serif);}' +
    '.etiquette-segment{font-size:11.5px;font-weight:700;fill:var(--accent-ink,#7a3212);font-family:var(--sans,sans-serif);}' +
    '.stats{display:flex;align-items:stretch;justify-content:center;gap:6px;flex-wrap:wrap;margin:14px 0;}' +
    '.stat{flex:1 1 110px;min-width:0;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:8px 6px;text-align:center;background:var(--surface,#fff);}' +
    '.stat-label{display:block;font-family:var(--mono,monospace);font-size:10px;letter-spacing:0.02em;color:var(--ink-faint,#9c9083);margin-bottom:5px;}' +
    '.stat-value{display:block;font-variant-numeric:tabular-nums;font-size:0.92rem;font-weight:600;color:var(--ink,#241f1a);white-space:nowrap;}' +
    '.verif{text-align:center;font-size:0.86rem;color:var(--ink-soft,#6b6055);margin:0;padding:10px 12px;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.verif strong{color:var(--good,#2f7a4f);}' +
    '[hidden]{display:none!important;}' +
    '.mode-row{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;margin-bottom:12px;}' +
    '.mode-row label{font-weight:600;color:var(--ink,#241f1a);}' +
    'select{font:inherit;padding:6px 10px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);}' +
    '.cosinus{text-align:center;font-size:0.86rem;color:var(--ink,#241f1a);margin:0 0 10px;padding:8px 12px;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);background:var(--surface,#fff);overflow-wrap:anywhere;}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:64px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{margin-top:2px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    // width/height explicites en plus du viewBox — voir le commentaire équivalent dans
    // cercle-trigo-widget.js (même piège de taille de remplacement SVG par défaut, invisible ici
    // seulement parce que TAILLE=300 coïncide avec cette valeur par défaut).
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + TAILLE + ' ' + TAILLE + '" width="' + TAILLE + '" height="' + TAILLE + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<div class="mode-row"><label for="mode">Mode</label><select id="mode">' +
    '<option value="polygone">polygone régulier à n côtés</option>' +
    '<option value="libre">angle θ libre</option>' +
    '</select></div>' +
    '<div class="controles">' +
    '<div class="curseur" id="bloc-theta" hidden><label for="theta">θ — angle au centre (°)</label><div class="curseur-row">' +
    '<input type="range" id="theta" min="' + BORNES_THETA.min + '" max="' + BORNES_THETA.max + '" step="' + BORNES_THETA.step + '" value="' + DEFAUT.thetaDeg + '">' +
    '<span class="curseur-valeur" id="theta-valeur"></span></div></div>' +
    '<div class="curseur" id="bloc-n"><label for="n">n — nombre de côtés</label><div class="curseur-row">' +
    '<input type="range" id="n" min="' + BORNES_N.min + '" max="' + BORNES_N.max + '" step="' + BORNES_N.step + '" value="' + DEFAUT.n + '">' +
    '<span class="curseur-valeur" id="n-valeur"></span></div></div>' +
    '<div class="curseur"><label for="r">r — rayon (cm)</label><div class="curseur-row">' +
    '<input type="range" id="r" min="' + BORNES_R.min + '" max="' + BORNES_R.max + '" step="' + BORNES_R.step + '" value="' + DEFAUT.r + '">' +
    '<span class="curseur-valeur" id="r-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>' +
    '<div class="stats">' +
    '<div class="stat"><span class="stat-label">aire secteur OAB</span><span class="stat-value" id="val-secteur"></span></div>' +
    '<div class="stat"><span class="stat-label">aire triangle OAB</span><span class="stat-value" id="val-triangle"></span></div>' +
    '<div class="stat"><span class="stat-label">aire segment</span><span class="stat-value" id="val-segment"></span></div>' +
    '<div class="stat"><span class="stat-label">corde AB</span><span class="stat-value" id="val-corde"></span></div>' +
    '</div>' +
    '<p class="cosinus" id="cosinus"></p>' +
    '<p class="verif" id="verif"></p>';

  class SecteurSegmentWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  SecteurSegmentWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._n = DEFAUT.n;
    this._r = DEFAUT.r;
    this._svg = shadow.getElementById("svg");
    this._valSecteur = shadow.getElementById("val-secteur");
    this._valTriangle = shadow.getElementById("val-triangle");
    this._valSegment = shadow.getElementById("val-segment");
    this._valCorde = shadow.getElementById("val-corde");
    this._verif = shadow.getElementById("verif");
    this._inputN = shadow.getElementById("n");
    this._inputR = shadow.getElementById("r");
    this._valeurN = shadow.getElementById("n-valeur");
    this._valeurR = shadow.getElementById("r-valeur");
    this._resetBtn = shadow.getElementById("reset");
    this._mode = DEFAUT.mode;
    this._thetaDeg = DEFAUT.thetaDeg;
    this._selectMode = shadow.getElementById("mode");
    this._inputTheta = shadow.getElementById("theta");
    this._valeurTheta = shadow.getElementById("theta-valeur");
    this._blocTheta = shadow.getElementById("bloc-theta");
    this._blocN = shadow.getElementById("bloc-n");
    this._cosinus = shadow.getElementById("cosinus");
  };

  SecteurSegmentWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInputN = function () { self._n = parseInt(self._inputN.value, 10); self._rendre(); };
    this._onInputR = function () { self._r = parseFloat(self._inputR.value); self._rendre(); };
    this._onReset = function () {
      self._n = DEFAUT.n; self._r = DEFAUT.r; self._thetaDeg = DEFAUT.thetaDeg; self._mode = DEFAUT.mode;
      self._selectMode.value = DEFAUT.mode;
      self._inputTheta.value = String(DEFAUT.thetaDeg);
      self._inputN.value = String(DEFAUT.n);
      self._inputR.value = String(DEFAUT.r);
      self._rendre();
    };
    this._onInputTheta = function () { self._thetaDeg = parseFloat(self._inputTheta.value); self._rendre(); };
    this._onMode = function () { self._mode = self._selectMode.value; self._rendre(); };
    this._inputN.addEventListener("input", this._onInputN);
    this._inputR.addEventListener("input", this._onInputR);
    this._inputTheta.addEventListener("input", this._onInputTheta);
    this._selectMode.addEventListener("change", this._onMode);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  SecteurSegmentWidgetClass.prototype.disconnectedCallback = function () {
    this._inputN.removeEventListener("input", this._onInputN);
    this._inputR.removeEventListener("input", this._onInputR);
    this._inputTheta.removeEventListener("input", this._onInputTheta);
    this._selectMode.removeEventListener("change", this._onMode);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  SecteurSegmentWidgetClass.prototype._rendre = function () {
    var n = this._n, r = this._r;
    var libre = this._mode === "libre";
    var theta = libre ? this._thetaDeg * PI / 180 : (2 * PI) / n;
    var thetaDeg = theta * 180 / PI;
    this._blocTheta.hidden = !libre;
    this._blocN.hidden = libre;
    this._valeurTheta.textContent = formatNombreFr(this._thetaDeg, 0) + "°";
    var C_R = C_R_MIN + ((r - BORNES_R.min) / (BORNES_R.max - BORNES_R.min)) * (C_R_MAX - C_R_MIN);
    var rTheta = (C_R * 22) / 108;

    var aireSecteur = 0.5 * r * r * theta;
    var aireTriangle = 0.5 * r * r * Math.sin(theta);
    var aireSegment = aireSecteur - aireTriangle;
    var corde = r * Math.sqrt(2 * (1 - Math.cos(theta)));
    var airePolygone = n * aireTriangle;
    var aireCercle = PI * r * r;

    this._valeurN.textContent = String(n);
    this._valeurR.textContent = formatNombreFr(r, 1) + " cm";
    this._valSecteur.textContent = formatNombreFr(aireSecteur, 2) + " cm²";
    // θ > 180° : sin θ < 0, le triangle OAB est « de l'autre côté » de la corde — son aire vaut
    // |½r² sin θ| et le segment (le grand) = secteur + aire du triangle (formule inchangée).
    this._valTriangle.textContent = formatNombreFr(Math.abs(aireTriangle), 2) + " cm²";
    this._valSegment.textContent = formatNombreFr(aireSegment, 2) + " cm²";
    this._valCorde.textContent = formatNombreFr(corde, 2) + " cm";

    var degTxt = Math.abs(thetaDeg - Math.round(thetaDeg)) < 1e-9 ? formatNombreFr(thetaDeg, 0) : formatNombreFr(thetaDeg, 2);
    this._cosinus.textContent = "Loi des cosinus dans OAB : AB² = r² + r² − 2·r·r·cos θ = 2 × " + formatNombreFr(r, 1) + "² × (1 − cos " +
      degTxt + "°) = " + formatNombreFr(corde * corde, 2) + ", donc AB ≈ " + formatNombreFr(corde, 2) + " cm.";
    this._verif.hidden = libre;
    if (!libre) {
      var nSegments = n * aireSegment;
      var cercleMoinsPolygone = aireCercle - airePolygone;
      this._verif.innerHTML =
        "vérification — n × segment = " + formatNombreFr(nSegments, 2) + " cm² ; cercle − polygone = " +
        formatNombreFr(cercleMoinsPolygone, 2) + " cm² &nbsp;<strong>✓ cohérent</strong>";
    }

    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    svg.innerHTML = "";

    svg.appendChild(svgEl(ns, "circle", { cx: CX, cy: CY, r: C_R, class: "cercle-ref" }));

    // Sommets du polygone régulier, disposés pour que A et B (les deux premiers) encadrent le
    // sommet du cercle — le secteur mis en évidence reste toujours bien visible en haut, quel que
    // soit n.
    var startAngle = PI / 2 + theta / 2;
    var sommets = [];
    for (var i = 0; i < n; i++) {
      var ang = startAngle - i * theta;
      sommets.push([CX + C_R * Math.cos(ang), CY - C_R * Math.sin(ang)]);
    }
    if (!libre) {
      var dPoly = sommets.map(function (p, i) { return (i === 0 ? "M" : "L") + p[0].toFixed(2) + " " + p[1].toFixed(2); }).join(" ") + " Z";
      svg.appendChild(svgEl(ns, "path", { d: dPoly, class: "polygone" }));
    }
    var grandArc = theta > PI ? 1 : 0;

    var A = sommets[0], B = libre ? [CX + C_R * Math.cos(startAngle - theta), CY - C_R * Math.sin(startAngle - theta)] : sommets[1];
    var angleA = startAngle, angleB = startAngle - theta;

    // Segment circulaire (entre la corde AB et l'arc AB) rempli en couleur — arc mineur (angle θ)
    // depuis A jusqu'à B, refermé par la corde (Z).
    var dSegment = "M " + A[0].toFixed(2) + " " + A[1].toFixed(2) +
      " A " + C_R + " " + C_R + " 0 " + grandArc + " 1 " + B[0].toFixed(2) + " " + B[1].toFixed(2) + " Z";
    svg.appendChild(svgEl(ns, "path", { d: dSegment, class: "segment-aire" }));

    // Rayons OA, OB et corde AB (contour du triangle OAB, en plus du segment déjà rempli).
    svg.appendChild(svgEl(ns, "line", { x1: CX, y1: CY, x2: A[0].toFixed(2), y2: A[1].toFixed(2), class: "rayon" }));
    svg.appendChild(svgEl(ns, "line", { x1: CX, y1: CY, x2: B[0].toFixed(2), y2: B[1].toFixed(2), class: "rayon" }));
    svg.appendChild(svgEl(ns, "line", { x1: A[0].toFixed(2), y1: A[1].toFixed(2), x2: B[0].toFixed(2), y2: B[1].toFixed(2), class: "corde" }));

    // Petit arc θ près du centre, entre les deux rayons (rTheta déjà calculé en proportion de C_R).
    var pThetaA = [CX + rTheta * Math.cos(angleA), CY - rTheta * Math.sin(angleA)];
    var pThetaB = [CX + rTheta * Math.cos(angleB), CY - rTheta * Math.sin(angleB)];
    var dArcTheta = "M " + pThetaA[0].toFixed(2) + " " + pThetaA[1].toFixed(2) +
      " A " + rTheta + " " + rTheta + " 0 " + grandArc + " 1 " + pThetaB[0].toFixed(2) + " " + pThetaB[1].toFixed(2);
    svg.appendChild(svgEl(ns, "path", { d: dArcTheta, class: "arc-theta" }));
    var milieuAngle = (angleA + angleB) / 2;
    var pTheta = [CX + (rTheta + 14) * Math.cos(milieuAngle), CY - (rTheta + 14) * Math.sin(milieuAngle)];
    var etTheta = svgEl(ns, "text", { x: pTheta[0].toFixed(2), y: pTheta[1].toFixed(2), "text-anchor": "middle", class: "etiquette-theta" });
    etTheta.textContent = "θ";
    svg.appendChild(etTheta);

    svg.appendChild(svgEl(ns, "circle", { cx: CX, cy: CY, r: 3, class: "centre" }));
    var etO = svgEl(ns, "text", { x: CX - 4, y: CY + 16, "text-anchor": "end", class: "etiquette-sommet" });
    etO.textContent = "O";
    svg.appendChild(etO);

    svg.appendChild(svgEl(ns, "circle", { cx: A[0].toFixed(2), cy: A[1].toFixed(2), r: 3.5, class: "sommet" }));
    var etA = svgEl(ns, "text", { x: (A[0] - 8).toFixed(2), y: (A[1] - 8).toFixed(2), "text-anchor": "end", class: "etiquette-sommet" });
    etA.textContent = "A";
    svg.appendChild(etA);

    svg.appendChild(svgEl(ns, "circle", { cx: B[0].toFixed(2), cy: B[1].toFixed(2), r: 3.5, class: "sommet" }));
    var etB = svgEl(ns, "text", { x: (B[0] + 8).toFixed(2), y: (B[1] - 8).toFixed(2), class: "etiquette-sommet" });
    etB.textContent = "B";
    svg.appendChild(etB);

    var milieuSegment = [CX + (C_R + 16) * Math.cos(milieuAngle), CY - (C_R + 16) * Math.sin(milieuAngle)];
    var etSeg = svgEl(ns, "text", { x: milieuSegment[0].toFixed(2), y: milieuSegment[1].toFixed(2), "text-anchor": "middle", class: "etiquette-segment" });
    etSeg.textContent = "segment";
    svg.appendChild(etSeg);
  };

  if (!customElements.get("secteur-segment-widget")) {
    customElements.define("secteur-segment-widget", SecteurSegmentWidgetClass);
  }
})();
