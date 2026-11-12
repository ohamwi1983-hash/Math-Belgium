(function () {
  "use strict";

  /* ================================================================
   * <archimede-widget> — atelier interactif "encadrement de π par les polygones
   * d'Archimède" : un cercle de rayon r = 1/2 (périmètre = π exactement), un
   * polygone régulier inscrit et un polygone régulier circonscrit à n côtés,
   * n réglable de 3 à 30 par un curseur, ou mode « doublement » 6 → 12 → 24
   * → 48 → 96 (la démarche historique d'Archimède), avec un petit graphe des
   * deux bornes qui se resserrent autour de π (fenêtre fixe). Web Component (Shadow DOM) : aucun
   * conflit avec les styles de la page, couleurs empruntées aux variables CSS
   * du thème (héritées à travers la frontière du Shadow DOM).
   * ================================================================ */

  var N_MIN = 3, N_MAX = 30, N_DEFAUT = 6;
  var CSS_MAX_WIDTH_PX = 460; // doit rester synchronisé avec la règle `svg{max-width}` plus bas.
  // Rayon du cercle en unités de viewBox (et donc du polygone inscrit, dont les sommets sont
  // dessus) — le cercle ne doit JAMAIS changer de taille quand n varie.
  //
  // PIÈGE VÉRIFIÉ EN PRATIQUE (deux essais précédents dans ce sens, tous les deux insuffisants) :
  // augmenter ce nombre seul NE change RIEN à la taille réellement affichée à l'écran si la taille
  // totale du viewBox (LARGEUR) grandit dans la même proportion — seul le RATIO r/LARGEUR détermine
  // la taille affichée (× CSS_MAX_WIDTH_PX), pas r tout seul. Confirmé par calcul direct (pas
  // supposé) : passer r de 86 à 127 tout en gardant "jamais aucun rognage même à n=3" n'avait fait
  // grandir le cercle affiché que de 208px à 216px (+4%, imperceptible) — parce que garantir 0
  // rognage à n=3 (facteur 1/cos60°=2, le circonscrit vaut le double du cercle) sur ce MÊME viewBox
  // oblige mathématiquement le cercle à rester sous ~50% de la largeur totale, quel que soit r.
  // Correctif définitif : ne protéger du rognage que jusqu'à n=5 (PROTECTION_FACTEUR = 1,3, entre
  // 1/cos(36°)=1,236 pour n=5 et 1/cos(45°)=1,414 pour n=4) plutôt que le pire cas n=3 — à n=3 et
  // dans une moindre mesure n=4, le polygone circonscrit (jamais le cercle) dépasse alors le bord
  // réel du SVG et est rogné net par le viewport SVG (comportement par défaut, pas un bug) : un prix
  // pédagogiquement raisonnable pour un cercle enfin visiblement grand sur TOUTE la plage.
  var R_CERCLE_PX = 150;
  var PROTECTION_FACTEUR = 1.3;
  var MARGE_SECURITE_PX = 12;
  var DEMI_VIEWBOX_PX = R_CERCLE_PX * PROTECTION_FACTEUR + MARGE_SECURITE_PX;
  var LARGEUR = DEMI_VIEWBOX_PX * 2, HAUTEUR = DEMI_VIEWBOX_PX * 2;
  // Cadre visuel gris (rectangle dessiné, PAS le fond CSS du <svg>), un peu plus grand que le
  // cercle pour qu'il le remplisse presque entièrement, sans coller pile à son bord.
  var PAD_CADRE_PX = 20;
  var DEMI_CADRE_PX = R_CERCLE_PX + PAD_CADRE_PX;

  var ETAPES = [6, 12, 24, 48, 96];
  // Petit graphe des bornes — fenêtre FIXE : x = étape (0..4), y ∈ [2,95 ; 3,50] (n = 6 : 3 et 3,464).
  var B_L = 360, B_H = 170, B_MG = 46, B_MD = 14, B_MH = 14, B_MB = 30, B_YMIN = 2.95, B_YMAX = 3.5;

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
    'svg{width:100%;max-width:' + CSS_MAX_WIDTH_PX + 'px;height:auto;}' +
    '.cadre-fond{fill:var(--surface-2,#faf6f0);stroke:var(--line,#e2d8c8);stroke-width:1;}' +
    '.cercle{stroke:var(--ink-faint,#9c9083);stroke-width:1.4;fill:none;}' +
    '.poly-inscrit{stroke:var(--good,#2f7a4f);stroke-width:2.4;fill:var(--good,#2f7a4f);fill-opacity:0.08;}' +
    '.poly-circonscrit{stroke:var(--accent,#a8471f);stroke-width:2;stroke-dasharray:5 4;fill:none;}' +
    '.stats{display:flex;align-items:stretch;justify-content:center;gap:5px;flex-wrap:nowrap;margin-top:20px;}' +
    '.stat{flex:1 1 0;min-width:0;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:8px 3px;text-align:center;background:var(--surface,#fff);}' +
    '.stat-label{display:block;font-family:var(--mono,monospace);font-size:9.5px;letter-spacing:0.02em;color:var(--ink-faint,#9c9083);margin-bottom:5px;line-height:1.25;}' +
    '.stat-value{display:block;font-variant-numeric:tabular-nums;font-size:0.92rem;font-weight:600;color:var(--ink,#241f1a);white-space:nowrap;}' +
    '.stat-in{border-color:var(--good,#2f7a4f);}' +
    '.stat-in .stat-value{color:var(--good,#2f7a4f);}' +
    '.stat-out{border-color:var(--accent-soft-line,#e8c4a4);}' +
    '.stat-out .stat-value{color:var(--accent,#a8471f);}' +
    '.stat-rel{flex:0 0 auto;align-self:center;font-family:var(--serif,serif);font-size:1.15rem;color:var(--ink-soft,#6b6055);padding:0 1px;}' +
    '[hidden]{display:none!important;}' +
    '.mode-row{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;margin-bottom:14px;}' +
    '.mode-row label{font-weight:600;color:var(--ink,#241f1a);}' +
    'select{font:inherit;padding:6px 10px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);}' +
    '.doublement{display:flex;flex-direction:column;gap:10px;align-items:center;}' +
    '.boutons{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;}' +
    '.btn{padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;}' +
    '.btn:disabled{opacity:0.5;cursor:default;}' +
    '.etapes{font-variant-numeric:tabular-nums;font-size:0.9rem;color:var(--ink-soft,#6b6055);text-align:center;}' +
    '.etapes b{color:var(--accent-ink,#7a3212);}' +
    '.bornes-zone{margin-top:14px;display:flex;flex-direction:column;align-items:center;gap:6px;}' +
    '#svg-bornes{width:100%;max-width:' + B_L + 'px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.2;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.ligne-pi{stroke:var(--plan,#5b4ea3);stroke-width:1.3;stroke-dasharray:5 4;}' +
    '.pt-in{fill:var(--good,#2f7a4f);}' +
    '.pt-out{fill:var(--accent,#a8471f);}' +
    '.trait-in{stroke:var(--good,#2f7a4f);stroke-width:1.6;fill:none;}' +
    '.trait-out{stroke:var(--accent,#a8471f);stroke-width:1.6;fill:none;}' +
    '.etq{font-size:11px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.etq-pi{font-size:11px;font-weight:700;fill:var(--plan,#5b4ea3);font-family:var(--sans,sans-serif);}' +
    '.historique{font-size:0.86rem;color:var(--ink,#241f1a);text-align:center;padding:8px 12px;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);background:var(--surface,#fff);margin:0;}' +
    '.curseur-n{display:flex;flex-direction:column;gap:8px;}' +
    '.curseur-n label{font-family:var(--serif,serif);font-style:italic;font-weight:600;color:var(--ink,#241f1a);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.n-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--accent-ink,#7a3212);min-width:64px;text-align:right;}' +
    '</style>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<div class="mode-row"><label for="mode">Mode</label><select id="mode">' +
    '<option value="libre">nombre de côtés libre (3 à 30)</option>' +
    '<option value="doublement">doublement d\'Archimède : 6 → 96</option>' +
    '</select></div>' +
    '<div class="doublement" id="doublement" hidden>' +
    '<div class="boutons"><button class="btn" id="doubler" type="button">Doubler le nombre de côtés</button>' +
    '<button class="btn" id="recommencer" type="button">Recommencer à 6</button></div>' +
    '<div class="etapes" id="etapes"></div>' +
    '</div>' +
    '<div class="curseur-n" id="bloc-curseur">' +
    '<label for="n">Nombre de côtés n</label>' +
    '<div class="curseur-row">' +
    '<input type="range" id="n" min="' + N_MIN + '" max="' + N_MAX + '" step="1" value="' + N_DEFAUT + '">' +
    '<span class="n-valeur" id="n-valeur"></span>' +
    '</div>' +
    '</div>' +
    '<div class="stats">' +
    '<div class="stat stat-in"><span class="stat-label">Polygone inscrit</span><span class="stat-value" id="val-in"></span></div>' +
    '<span class="stat-rel" aria-hidden="true">≤</span>' +
    '<div class="stat stat-cercle"><span class="stat-label">Cercle</span><span class="stat-value" id="val-cercle"></span></div>' +
    '<span class="stat-rel" aria-hidden="true">≤</span>' +
    '<div class="stat stat-out"><span class="stat-label">Polygone circonscrit</span><span class="stat-value" id="val-out"></span></div>' +
    '</div>' +
    '<div class="bornes-zone" id="bornes-zone" hidden>' +
    '<svg id="svg-bornes" viewBox="0 0 ' + B_L + ' ' + B_H + '" xmlns="http://www.w3.org/2000/svg"></svg>' +
    '<p class="historique" id="historique"></p>' +
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
    this._mode = "libre";
    this._etape = 0;
    this._selectMode = shadow.getElementById("mode");
    this._blocDoublement = shadow.getElementById("doublement");
    this._blocCurseur = shadow.getElementById("bloc-curseur");
    this._btnDoubler = shadow.getElementById("doubler");
    this._btnRecommencer = shadow.getElementById("recommencer");
    this._etapes = shadow.getElementById("etapes");
    this._bornesZone = shadow.getElementById("bornes-zone");
    this._svgBornes = shadow.getElementById("svg-bornes");
    this._historique = shadow.getElementById("historique");
  };

  ArchimedeWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInput = function () {
      self._n = parseInt(self._inputN.value, 10);
      self._rendre();
    };
    this._onMode = function () {
      self._mode = self._selectMode.value;
      if (self._mode === "doublement") { self._etape = 0; self._n = ETAPES[0]; }
      else { self._n = parseInt(self._inputN.value, 10); }
      self._rendre();
    };
    this._onDoubler = function () {
      if (self._etape < ETAPES.length - 1) self._etape++;
      self._n = ETAPES[self._etape];
      self._rendre();
    };
    this._onRecommencer = function () { self._etape = 0; self._n = ETAPES[0]; self._rendre(); };
    this._inputN.addEventListener("input", this._onInput);
    this._selectMode.addEventListener("change", this._onMode);
    this._btnDoubler.addEventListener("click", this._onDoubler);
    this._btnRecommencer.addEventListener("click", this._onRecommencer);
    this._rendre();
  };

  ArchimedeWidgetClass.prototype.disconnectedCallback = function () {
    this._inputN.removeEventListener("input", this._onInput);
    this._selectMode.removeEventListener("change", this._onMode);
    this._btnDoubler.removeEventListener("click", this._onDoubler);
    this._btnRecommencer.removeEventListener("click", this._onRecommencer);
  };

  ArchimedeWidgetClass.prototype._dessinerBornes = function () {
    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svgBornes;
    svg.innerHTML = "";
    function el(tag, attrs, texte) {
      var e = document.createElementNS(ns, tag);
      for (var k in attrs) e.setAttribute(k, attrs[k]);
      if (texte !== undefined) e.textContent = texte;
      svg.appendChild(e);
      return e;
    }
    var defs = document.createElementNS(ns, "defs");
    var m = document.createElementNS(ns, "marker");
    m.setAttribute("id", "fleche-b"); m.setAttribute("markerWidth", "8"); m.setAttribute("markerHeight", "8");
    m.setAttribute("refX", "6"); m.setAttribute("refY", "4"); m.setAttribute("orient", "auto");
    var mp = document.createElementNS(ns, "path"); mp.setAttribute("d", "M0,0 L8,4 L0,8 Z"); mp.setAttribute("class", "fleche");
    m.appendChild(mp); defs.appendChild(m); svg.appendChild(defs);
    var px = function (i) { return B_MG + 14 + i * (B_L - B_MG - B_MD - 28) / (ETAPES.length - 1); };
    var py = function (y) { return B_H - B_MB - (y - B_YMIN) / (B_YMAX - B_YMIN) * (B_H - B_MH - B_MB); };
    el("line", { x1: B_MG, y1: B_H - B_MB, x2: B_L - B_MD, y2: B_H - B_MB, class: "axe", "marker-end": "url(#fleche-b)" });
    el("line", { x1: B_MG, y1: B_H - B_MB, x2: B_MG, y2: B_MH - 4, class: "axe", "marker-end": "url(#fleche-b)" });
    [3, 3.1, 3.2, 3.3, 3.4].forEach(function (y) {
      el("line", { x1: B_MG - 4, y1: py(y), x2: B_MG, y2: py(y), class: "axe" });
      el("text", { x: B_MG - 7, y: py(y) + 4, "text-anchor": "end", class: "etq" }, formatNombreFr(y, 1));
    });
    el("line", { x1: B_MG, y1: py(Math.PI), x2: B_L - B_MD, y2: py(Math.PI), class: "ligne-pi" });
    el("text", { x: B_L - B_MD - 2, y: py(Math.PI) - 5, "text-anchor": "end", class: "etq-pi" }, "π");
    var dIn = "", dOut = "";
    for (var i = 0; i < ETAPES.length; i++) {
      el("text", { x: px(i), y: B_H - B_MB + 16, "text-anchor": "middle", class: "etq" }, "n = " + ETAPES[i]);
      if (i > this._etape) continue;
      var a = Math.PI / ETAPES[i];
      var yIn = ETAPES[i] * Math.sin(a), yOut = ETAPES[i] * Math.tan(a);
      dIn += (i === 0 ? "M" : "L") + px(i).toFixed(2) + " " + py(yIn).toFixed(2) + " ";
      dOut += (i === 0 ? "M" : "L") + px(i).toFixed(2) + " " + py(yOut).toFixed(2) + " ";
      el("circle", { cx: px(i), cy: py(yIn), r: 4, class: "pt-in" });
      el("circle", { cx: px(i), cy: py(yOut), r: 4, class: "pt-out" });
    }
    el("path", { d: dIn.trim(), class: "trait-in" });
    el("path", { d: dOut.trim(), class: "trait-out" });
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

    var doublement = this._mode === "doublement";
    this._blocDoublement.hidden = !doublement;
    this._blocCurseur.hidden = doublement;
    this._bornesZone.hidden = !doublement;
    if (doublement) {
      this._btnDoubler.disabled = this._etape >= ETAPES.length - 1;
      var self = this;
      this._etapes.innerHTML = ETAPES.map(function (v, i) { return i === self._etape ? "<b>" + v + "</b>" : String(v); }).join(" → ");
      this._dessinerBornes();
      this._historique.textContent = this._etape === ETAPES.length - 1
        ? "Avec 96 côtés, Archimède obtient 3 + 10/71 < π < 3 + 1/7, soit 3,1408… < π < 3,1428… — l'écart entre les deux bornes est déjà inférieur à 0,002."
        : "Écart entre les deux bornes : " + formatNombreFr(perimOut - perimIn, 5) + ". Double encore : l'encadrement se resserre autour de π.";
    }
  };

  if (!customElements.get("archimede-widget")) {
    customElements.define("archimede-widget", ArchimedeWidgetClass);
  }
})();
