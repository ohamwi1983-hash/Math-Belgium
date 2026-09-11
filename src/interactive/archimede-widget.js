(function () {
  "use strict";

  /* ================================================================
   * <archimede-widget> — atelier interactif "encadrement de π par les polygones
   * d'Archimède" : un cercle de rayon r = 1/2 (périmètre = π exactement), un
   * polygone régulier inscrit et un polygone régulier circonscrit à n côtés,
   * n réglable de 3 à 30 par un curseur. Web Component (Shadow DOM) : aucun
   * conflit avec les styles de la page, couleurs empruntées aux variables CSS
   * du thème (héritées à travers la frontière du Shadow DOM).
   * ================================================================ */

  var N_MIN = 3, N_MAX = 30, N_DEFAUT = 6;
  // Rayon pixel FIXE du cercle (et donc du polygone inscrit, dont les sommets sont dessus) — le
  // cercle ne doit JAMAIS changer de taille quand n varie. Choisi GRAND (127) pour remplir le
  // cadre visuel, pas timidement réservé en fonction du pire cas n=3 (piège de la version
  // précédente : réserver la moitié du cadre pour n=3 faisait paraître le cercle minuscule à tout
  // le reste de la plage, avec une grande marge grise inutilisée autour — repéré sur capture
  // d'écran réelle, pas en relisant le code).
  var R_CERCLE_PX = 127;
  // Cadre visuel gris (rectangle dessiné, PAS le fond CSS du <svg>) : juste un peu plus grand que
  // le cercle, pour qu'il le remplisse presque entièrement — dimensionné sur le cas n=6 (référence
  // par défaut, coïncide presque exactement avec le facteur 1/cos(30°)≈1,155 du polygone
  // circonscrit à 6 côtés).
  var PAD_CADRE_PX = 20;
  var DEMI_CADRE_PX = R_CERCLE_PX + PAD_CADRE_PX;
  // Zone de dessin RÉELLE (viewBox), plus grande que le cadre gris : pour n petit (3, 4), le
  // polygone circonscrit dépasse largement le cadre gris — volontairement laissé déborder SUR LE
  // FOND DE LA CARTE (jamais rogné/coupé net) plutôt que rétréci pour rentrer dans le cadre, ce qui
  // aurait fait reculer le cercle à chaque changement de n (le bug initialement signalé). Le pire
  // cas n=3 (facteur 1/cos 60°=2, le circonscrit vaut deux fois le rayon du cercle) fixe la marge
  // de sécurité nécessaire pour qu'il ne soit JAMAIS rogné par le bord réel du SVG.
  var MARGE_SECURITE_PX = 16;
  var DEMI_VIEWBOX_PX = R_CERCLE_PX * 2 + MARGE_SECURITE_PX;
  var LARGEUR = DEMI_VIEWBOX_PX * 2, HAUTEUR = DEMI_VIEWBOX_PX * 2;

  function formatNombreFr(n, decimales) {
    var facteur = Math.pow(10, decimales);
    var arrondi = Math.round(n * facteur) / facteur;
    return arrondi.toFixed(decimales).replace(".", ",");
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:18px;}' +
    'svg{width:100%;max-width:460px;height:auto;}' +
    '.cadre-fond{fill:var(--surface-2,#faf6f0);stroke:var(--line,#e2d8c8);stroke-width:1;}' +
    '.cercle{stroke:var(--ink-faint,#9c9083);stroke-width:1.4;fill:none;}' +
    '.poly-inscrit{stroke:var(--good,#2f7a4f);stroke-width:2.4;fill:var(--good,#2f7a4f);fill-opacity:0.08;}' +
    '.poly-circonscrit{stroke:var(--accent,#a8471f);stroke-width:2;stroke-dasharray:5 4;fill:none;}' +
    '.stats{display:flex;align-items:stretch;justify-content:center;gap:5px;flex-wrap:nowrap;margin-bottom:20px;}' +
    '.stat{flex:1 1 0;min-width:0;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:8px 3px;text-align:center;background:var(--surface,#fff);}' +
    '.stat-label{display:block;font-family:var(--mono,monospace);font-size:9.5px;letter-spacing:0.02em;text-transform:uppercase;color:var(--ink-faint,#9c9083);margin-bottom:5px;line-height:1.25;}' +
    '.stat-value{display:block;font-variant-numeric:tabular-nums;font-size:0.92rem;font-weight:600;color:var(--ink,#241f1a);white-space:nowrap;}' +
    '.stat-in{border-color:var(--good,#2f7a4f);}' +
    '.stat-in .stat-value{color:var(--good,#2f7a4f);}' +
    '.stat-out{border-color:var(--accent-soft-line,#e8c4a4);}' +
    '.stat-out .stat-value{color:var(--accent,#a8471f);}' +
    '.stat-rel{flex:0 0 auto;align-self:center;font-family:var(--serif,serif);font-size:1.15rem;color:var(--ink-soft,#6b6055);padding:0 1px;}' +
    '.curseur-n{display:flex;flex-direction:column;gap:8px;}' +
    '.curseur-n label{font-family:var(--serif,serif);font-style:italic;font-weight:600;color:var(--ink,#241f1a);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.n-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--accent-ink,#7a3212);min-width:64px;text-align:right;}' +
    '</style>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<div class="stats">' +
    '<div class="stat stat-in"><span class="stat-label">Polygone inscrit</span><span class="stat-value" id="val-in"></span></div>' +
    '<span class="stat-rel" aria-hidden="true">≤</span>' +
    '<div class="stat stat-cercle"><span class="stat-label">Cercle</span><span class="stat-value" id="val-cercle"></span></div>' +
    '<span class="stat-rel" aria-hidden="true">≤</span>' +
    '<div class="stat stat-out"><span class="stat-label">Polygone circonscrit</span><span class="stat-value" id="val-out"></span></div>' +
    '</div>' +
    '<div class="curseur-n">' +
    '<label for="n">Nombre de côtés n</label>' +
    '<div class="curseur-row">' +
    '<input type="range" id="n" min="' + N_MIN + '" max="' + N_MAX + '" step="1" value="' + N_DEFAUT + '">' +
    '<span class="n-valeur" id="n-valeur"></span>' +
    '</div>' +
    '</div>';

  class ArchimedeWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  ArchimedeWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._n = N_DEFAUT;
    this._svg = shadow.getElementById("svg");
    this._inputN = shadow.getElementById("n");
    this._valeurN = shadow.getElementById("n-valeur");
    this._valIn = shadow.getElementById("val-in");
    this._valCercle = shadow.getElementById("val-cercle");
    this._valOut = shadow.getElementById("val-out");
  };

  ArchimedeWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInput = function () {
      self._n = parseInt(self._inputN.value, 10);
      self._rendre();
    };
    this._inputN.addEventListener("input", this._onInput);
    this._rendre();
  };

  ArchimedeWidgetClass.prototype.disconnectedCallback = function () {
    this._inputN.removeEventListener("input", this._onInput);
  };

  ArchimedeWidgetClass.prototype._rendre = function () {
    var n = this._n;
    var alpha = Math.PI / n;
    // Le cercle (et le polygone inscrit, dont les sommets sont dessus) garde TOUJOURS le même
    // rayon R_CERCLE_PX — seul le polygone circonscrit change de taille autour de lui, avec le
    // rayon r/cos α attendu (même formule que le rappel du chapitre, R = r/cosα).
    var rCercle = R_CERCLE_PX;
    var rOut = R_CERCLE_PX / Math.cos(alpha);
    var cx = LARGEUR / 2, cy = HAUTEUR / 2;
    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    svg.innerHTML = "";

    // Cadre gris dessiné en SVG (pas un fond CSS sur tout le <svg>) : dimensionné autour du
    // cercle, PAS de la zone de dessin entière — pour n petit, le polygone circonscrit déborde
    // volontairement dessus, sur le fond de la carte (jamais rogné, voir les constantes en tête de
    // fichier).
    var fond = document.createElementNS(ns, "rect");
    fond.setAttribute("x", cx - DEMI_CADRE_PX); fond.setAttribute("y", cy - DEMI_CADRE_PX);
    fond.setAttribute("width", 2 * DEMI_CADRE_PX); fond.setAttribute("height", 2 * DEMI_CADRE_PX);
    fond.setAttribute("rx", 3);
    fond.setAttribute("class", "cadre-fond");
    svg.appendChild(fond);

    function sommets(rayon) {
      var pts = [];
      for (var k = 0; k < n; k++) {
        var theta = -Math.PI / 2 + k * (2 * Math.PI / n);
        pts.push((cx + rayon * Math.cos(theta)).toFixed(2) + "," + (cy + rayon * Math.sin(theta)).toFixed(2));
      }
      return pts.join(" ");
    }

    var polyOut = document.createElementNS(ns, "polygon");
    polyOut.setAttribute("points", sommets(rOut));
    polyOut.setAttribute("class", "poly-circonscrit");
    svg.appendChild(polyOut);

    var cercle = document.createElementNS(ns, "circle");
    cercle.setAttribute("cx", cx); cercle.setAttribute("cy", cy); cercle.setAttribute("r", rCercle);
    cercle.setAttribute("class", "cercle");
    svg.appendChild(cercle);

    var polyIn = document.createElementNS(ns, "polygon");
    polyIn.setAttribute("points", sommets(rCercle));
    polyIn.setAttribute("class", "poly-inscrit");
    svg.appendChild(polyIn);

    // r = 1/2 : côté inscrit = 2r·sinα = sinα, côté circonscrit = 2r·tanα = tanα,
    // périmètre du cercle = 2πr = π exactement.
    var perimIn = n * Math.sin(alpha);
    var perimOut = n * Math.tan(alpha);
    this._valeurN.textContent = "n = " + n;
    this._valIn.textContent = formatNombreFr(perimIn, 5);
    this._valCercle.textContent = "π ≈ " + formatNombreFr(Math.PI, 5);
    this._valOut.textContent = formatNombreFr(perimOut, 5);
  };

  if (!customElements.get("archimede-widget")) {
    customElements.define("archimede-widget", ArchimedeWidgetClass);
  }
})();
