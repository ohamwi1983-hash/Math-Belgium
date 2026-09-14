(function () {
  "use strict";

  /* ================================================================
   * <cercle-trigo-widget> — cercle trigonométrique (gauche) relié à un graphe
   * sin/cos/tan qui se trace au fur et à mesure (droite), x de 0 à 3π.
   * Web Component (Shadow DOM), couleurs empruntées aux variables CSS du thème.
   * ================================================================ */

  var DEUX_PI = 2 * Math.PI;
  var X_MAX = 3 * Math.PI;
  var DEFAUT_X = Math.PI / 4;

  // --- Panneau cercle -------------------------------------------------
  var C_TAILLE = 260, C_CX = 130, C_CY = 130, C_R = 90;
  // L'INDICATEUR D'ANGLE ORIENTÉ (petit arc près du sommet, PAS l'arc balayé sur la circonférence
  // ni le rayon/point mobile) est le seul élément dont le rayon grandit au-delà de 2π — corrigé
  // sur retour utilisateur : la première version faisait grandir l'arc SUR le cercle (et le point
  // mobile avec), ce qui déformait à tort la référence fixe. Le cercle, le point mobile et le
  // rayon restent maintenant TOUJOURS sur le vrai cercle (rayon C_R constant, jamais déformé) ;
  // seul ce petit indicateur près du centre s'enroule en "ressort circulaire" au-delà d'un tour.
  var R_ANGLE_BASE = 20;
  var ANGLE_RESSORT_CROISSANCE = 34;

  // --- Panneau graphe ---------------------------------------------------
  var G_LARGEUR = 380, G_HAUTEUR = 260, G_MARGE_G = 30, G_MARGE_D = 14, G_MARGE_H = 16, G_MARGE_B = 30;
  var FENETRES_Y = {
    sin: { min: -1.4, max: 1.4 },
    cos: { min: -1.4, max: 1.4 },
    tan: { min: -4, max: 4 },
  };
  var ASYMPTOTES_TAN = [Math.PI / 2, 3 * Math.PI / 2, 5 * Math.PI / 2];

  var FN = {
    sin: { f: Math.sin, symbole: "sin(x)" },
    cos: { f: Math.cos, symbole: "cos(x)" },
    tan: { f: Math.tan, symbole: "tan(x)" },
  };

  function formatNombreFr(n, decimales) {
    var facteur = Math.pow(10, decimales);
    var arrondi = Math.round(n * facteur) / facteur;
    return arrondi.toFixed(decimales).replace(".", ",").replace("-", "−");
  }

  function formatEnPi(x) {
    var k = x / Math.PI;
    return formatNombreFr(k, 2) + "π";
  }

  function svgEl(ns, tag, attrs) {
    var el = document.createElementNS(ns, tag);
    for (var key in attrs) el.setAttribute(key, attrs[key]);
    return el;
  }

  // Rayon de l'indicateur d'angle orienté : fixe tant que t<=2π, grandit ensuite avec l'excédent
  // au-delà d'un tour complet — c'est ce grandissement qui produit l'effet "ressort circulaire".
  function rayonAngleIndicateur(t) {
    if (t <= DEUX_PI) return R_ANGLE_BASE;
    return R_ANGLE_BASE + ANGLE_RESSORT_CROISSANCE * ((t - DEUX_PI) / DEUX_PI);
  }

  // Dessine uniquement la tête de flèche triangulaire à (x2,y2), orientée dans le sens
  // (x1,y1)->(x2,y2) — réutilisée à la fois par dessinerVecteur et pour marquer la pointe d'un
  // arc (angle orienté) sans y accoler de ligne droite.
  function dessinerTeteFleche(ns, svg, x1, y1, x2, y2, classeTete) {
    var dx = x2 - x1, dy = y2 - y1;
    var longueur = Math.hypot(dx, dy);
    if (longueur < 0.5) return;
    var ux = dx / longueur, uy = dy / longueur;
    var taille = 8, largeur = 4.5;
    var baseX = x2 - ux * taille, baseY = y2 - uy * taille;
    var perpX = -uy, perpY = ux;
    var p1x = baseX + perpX * largeur, p1y = baseY + perpY * largeur;
    var p2x = baseX - perpX * largeur, p2y = baseY - perpY * largeur;
    var points = x2 + "," + y2 + " " + p1x.toFixed(2) + "," + p1y.toFixed(2) + " " + p2x.toFixed(2) + "," + p2y.toFixed(2);
    svg.appendChild(svgEl(ns, "polygon", { points: points, class: classeTete }));
  }

  // Dessine un vecteur (ligne + tête de flèche) de (x1,y1) vers (x2,y2).
  function dessinerVecteur(ns, svg, x1, y1, x2, y2, classeLigne, classeTete) {
    svg.appendChild(svgEl(ns, "line", { x1: x1, y1: y1, x2: x2, y2: y2, class: classeLigne }));
    dessinerTeteFleche(ns, svg, x1, y1, x2, y2, classeTete);
  }

  // Intersection du rayon partant de (cx,cy) dans la direction (dirX,dirY) avec le bord de la
  // fenêtre carrée [boxMin,boxMax]×[boxMin,boxMax] — utilisée pour prolonger le segment de
  // l'angle jusqu'à la bordure du contenant quand il ne croise pas la droite x=1 (tangente).
  function rayonBordFenetre(cx, cy, dirX, dirY, boxMin, boxMax) {
    var candidats = [];
    if (dirX > 1e-6) candidats.push((boxMax - cx) / dirX);
    else if (dirX < -1e-6) candidats.push((boxMin - cx) / dirX);
    if (dirY > 1e-6) candidats.push((boxMax - cy) / dirY);
    else if (dirY < -1e-6) candidats.push((boxMin - cy) / dirY);
    var valides = candidats.filter(function (t) { return t > 0; });
    var t = valides.length ? Math.min.apply(null, valides) : 0;
    return { x: cx + dirX * t, y: cy + dirY * t };
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.panneaux{display:flex;flex-wrap:wrap;gap:16px;justify-content:center;margin-bottom:16px;}' +
    '.panneau{background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);padding:6px;}' +
    '#svg-cercle{width:100%;max-width:260px;height:auto;display:block;}' +
    '#svg-graphe{width:100%;max-width:360px;height:auto;display:block;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}' +
    '.grille{stroke:var(--line-soft,#ede5d7);stroke-width:1;}' +
    '.cercle-ref{stroke:var(--ink-faint,#9c9083);stroke-width:1.4;fill:none;}' +
    '.arc-cercle-violet{stroke:var(--plan,#5b4ea3);stroke-width:3.4;fill:none;stroke-linecap:round;}' +
    '.angle-oriente{stroke:var(--plan,#5b4ea3);stroke-width:2;fill:none;stroke-linecap:round;opacity:0.85;}' +
    '.angle-oriente-tete{fill:var(--plan,#5b4ea3);opacity:0.85;}' +
    '.rayon-violet{stroke:var(--plan,#5b4ea3);stroke-width:2.6;stroke-linecap:round;}' +
    '.point-mobile{fill:var(--plan,#5b4ea3);}' +
    '.segment-rouge{stroke:var(--bad,#b23a3a);stroke-width:2.8;stroke-linecap:round;}' +
    '.point-rouge{fill:var(--bad,#b23a3a);}' +
    '.guide-rouge{stroke:var(--bad,#b23a3a);stroke-width:1.1;stroke-dasharray:3 3;}' +
    '.vecteur-vert-ligne{stroke:var(--good,#2f7a4f);stroke-width:2.4;stroke-linecap:round;}' +
    '.vecteur-vert-tete{fill:var(--good,#2f7a4f);}' +
    '.prolongement-tan{stroke:var(--plan,#5b4ea3);stroke-width:1.3;stroke-dasharray:4 3;opacity:0.7;}' +
    '.axe-x-violet{stroke:var(--plan,#5b4ea3);stroke-width:3.4;stroke-linecap:round;}' +
    '.courbe{stroke:var(--accent,#a8471f);stroke-width:2.4;fill:none;}' +
    '.asymptote{stroke:var(--line,#e2d8c8);stroke-width:1;stroke-dasharray:4 3;}' +
    '.etiquette{font-size:11.5px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.etiquette-angle{font-size:12px;font-weight:600;fill:var(--plan,#5b4ea3);font-family:var(--sans,sans-serif);}' +
    '.legende-panneau{text-align:center;font-size:0.82rem;color:var(--ink-faint,#9c9083);margin:4px 0 0;font-family:var(--sans,sans-serif);}' +
    '.stats{display:flex;align-items:stretch;justify-content:center;gap:6px;flex-wrap:wrap;margin-bottom:18px;}' +
    '.stat{flex:1 1 0;min-width:88px;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:8px 4px;text-align:center;background:var(--surface,#fff);}' +
    '.stat-label{display:block;font-family:var(--mono,monospace);font-size:10px;letter-spacing:0.02em;text-transform:uppercase;color:var(--ink-faint,#9c9083);margin-bottom:5px;}' +
    '.stat-value{display:block;font-variant-numeric:tabular-nums;font-size:0.98rem;font-weight:600;color:var(--ink,#241f1a);white-space:nowrap;}' +
    '.controles{display:flex;flex-direction:column;gap:14px;}' +
    '.ligne-select{display:flex;align-items:center;gap:10px;justify-content:center;}' +
    '.ligne-select label{font-weight:600;color:var(--ink,#241f1a);}' +
    'select{font:inherit;padding:6px 10px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:128px;text-align:right;font-size:0.9rem;}' +
    '.btn-reset{margin-top:2px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<div class="panneaux">' +
    '<div class="panneau"><svg id="svg-cercle" viewBox="0 0 ' + C_TAILLE + ' ' + C_TAILLE + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<div class="panneau"><svg id="svg-graphe" viewBox="0 0 ' + G_LARGEUR + ' ' + G_HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '</div>' +
    '<div class="stats">' +
    '<div class="stat"><span class="stat-label">x (rad)</span><span class="stat-value" id="val-x-rad"></span></div>' +
    '<div class="stat"><span class="stat-label">x (en π)</span><span class="stat-value" id="val-x-pi"></span></div>' +
    '<div class="stat"><span class="stat-label" id="label-fn"></span><span class="stat-value" id="val-fn"></span></div>' +
    '</div>' +
    '<div class="controles">' +
    '<div class="ligne-select"><label for="fn">Fonction</label>' +
    '<select id="fn"><option value="sin">sin(x)</option><option value="cos">cos(x)</option><option value="tan">tan(x)</option></select>' +
    '</div>' +
    '<div class="curseur"><label for="x">x — angle balayé</label><div class="curseur-row">' +
    '<input type="range" id="x" min="0" max="' + X_MAX + '" step="0.01" value="' + DEFAUT_X + '">' +
    '<span class="curseur-valeur" id="x-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class CercleTrigoWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  CercleTrigoWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._x = DEFAUT_X;
    this._fn = "sin";
    this._svgCercle = shadow.getElementById("svg-cercle");
    this._svgGraphe = shadow.getElementById("svg-graphe");
    this._selectFn = shadow.getElementById("fn");
    this._inputX = shadow.getElementById("x");
    this._valeurX = shadow.getElementById("x-valeur");
    this._valXRad = shadow.getElementById("val-x-rad");
    this._valXPi = shadow.getElementById("val-x-pi");
    this._labelFn = shadow.getElementById("label-fn");
    this._valFn = shadow.getElementById("val-fn");
    this._resetBtn = shadow.getElementById("reset");
  };

  CercleTrigoWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInputX = function () {
      self._x = parseFloat(self._inputX.value);
      self._rendre();
    };
    this._onChangeFn = function () {
      self._fn = self._selectFn.value;
      self._rendre();
    };
    this._onReset = function () {
      self._x = DEFAUT_X;
      self._fn = "sin";
      self._inputX.value = String(DEFAUT_X);
      self._selectFn.value = "sin";
      self._rendre();
    };
    this._inputX.addEventListener("input", this._onInputX);
    this._selectFn.addEventListener("change", this._onChangeFn);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  CercleTrigoWidgetClass.prototype.disconnectedCallback = function () {
    this._inputX.removeEventListener("input", this._onInputX);
    this._selectFn.removeEventListener("change", this._onChangeFn);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  CercleTrigoWidgetClass.prototype._dessinerCercle = function () {
    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svgCercle;
    svg.innerHTML = "";
    var x = this._x, fn = this._fn;

    svg.appendChild(svgEl(ns, "circle", { cx: C_CX, cy: C_CY, r: C_R, class: "cercle-ref" }));
    svg.appendChild(svgEl(ns, "line", { x1: C_CX - C_R - 20, x2: C_CX + C_R + 20, y1: C_CY, y2: C_CY, class: "axe" }));
    svg.appendChild(svgEl(ns, "line", { x1: C_CX, x2: C_CX, y1: C_CY - C_R - 20, y2: C_CY + C_R + 20, class: "axe" }));

    // Point vrai sur le cercle de référence — rayon TOUJOURS fixe (= C_R), jamais déformé par x,
    // quel que soit le nombre de tours. Utilisé pour le rayon, le point mobile, le vecteur vert et
    // les projections rouges.
    var pxVrai = C_CX + C_R * Math.cos(x);
    var pyVrai = C_CY - C_R * Math.sin(x);

    if (x > 0) {
      // Arc balayé sur le VRAI cercle (rayon fixe) : se retrace sur lui-même au-delà de 2π, ne
      // grandit jamais — ce n'est PAS lui qui prend la forme d'un ressort (corrigé sur retour
      // utilisateur : la première version le faisait grandir à tort).
      var nArc = Math.max(2, Math.round((x / X_MAX) * 400));
      var dArc = "";
      for (var i = 0; i <= nArc; i++) {
        var t = (i / nArc) * x;
        var pxa = C_CX + C_R * Math.cos(t);
        var pya = C_CY - C_R * Math.sin(t);
        dArc += (i === 0 ? "M" : "L") + pxa.toFixed(2) + " " + pya.toFixed(2) + " ";
      }
      svg.appendChild(svgEl(ns, "path", { d: dArc.trim(), class: "arc-cercle-violet" }));

      // Angle orienté : petit arc près du sommet, terminé par une flèche (c'est un angle ORIENTÉ,
      // pas un simple arc). C'EST LUI qui s'enroule en "ressort circulaire" au-delà de 2π (son
      // rayon grandit avec l'excédent au-delà d'un tour complet), puisqu'un simple arc à rayon
      // fixe ne peut pas montrer visuellement plus d'un tour.
      var nAng = Math.max(2, Math.round((x / X_MAX) * 400));
      var dAng = "";
      for (var j = 0; j <= nAng; j++) {
        var tj = (j / nAng) * x;
        var rj = rayonAngleIndicateur(tj);
        var pxj = C_CX + rj * Math.cos(tj);
        var pyj = C_CY - rj * Math.sin(tj);
        dAng += (j === 0 ? "M" : "L") + pxj.toFixed(2) + " " + pyj.toFixed(2) + " ";
      }
      svg.appendChild(svgEl(ns, "path", { d: dAng.trim(), class: "angle-oriente" }));
      // Direction de la flèche calculée analytiquement (deux points écartés d'un epsilon FIXE en
      // angle), plutôt qu'à partir des deux derniers points échantillonnés — pour un petit x, des
      // points consécutifs de l'échantillonnage sont trop proches (quelques dixièmes de pixel sur
      // un arc de rayon ~20px) pour donner une direction fiable, et la flèche disparaissait.
      var epsilonFleche = Math.min(0.08, x);
      var rAvant = rayonAngleIndicateur(x - epsilonFleche);
      var pxAvant = C_CX + rAvant * Math.cos(x - epsilonFleche);
      var pyAvant = C_CY - rAvant * Math.sin(x - epsilonFleche);
      var rPointe = rayonAngleIndicateur(x);
      var pxPointe = C_CX + rPointe * Math.cos(x);
      var pyPointe = C_CY - rPointe * Math.sin(x);
      dessinerTeteFleche(ns, svg, pxAvant, pyAvant, pxPointe, pyPointe, "angle-oriente-tete");
    }

    // Rayon + point mobile : toujours sur le vrai cercle, jamais de rayon variable.
    svg.appendChild(svgEl(ns, "line", { x1: C_CX, y1: C_CY, x2: pxVrai.toFixed(2), y2: pyVrai.toFixed(2), class: "rayon-violet" }));
    svg.appendChild(svgEl(ns, "circle", { cx: pxVrai.toFixed(2), cy: pyVrai.toFixed(2), r: 4.5, class: "point-mobile" }));

    // cos(x) : inchangé — segment rouge (centre -> abscisse du point) ET vecteur vert par-dessus
    // (les deux coïncident géométriquement ; le vecteur vert, dessiné en second, reste visible).
    // sin(x)/tan(x) : sur retour utilisateur, il n'y a plus de segment rouge NI de vecteur vert
    // séparé du centre — seul le vecteur vert lui-même remplace l'ancien segment rouge, flèche
    // pointant vers le point qui correspond à la valeur (le point sur le cercle pour sin, le point
    // sur la droite tangente x=1 pour tan).
    if (fn === "cos") {
      svg.appendChild(svgEl(ns, "line", { x1: C_CX, y1: C_CY, x2: pxVrai.toFixed(2), y2: C_CY, class: "segment-rouge" }));
      svg.appendChild(svgEl(ns, "circle", { cx: pxVrai.toFixed(2), cy: pyVrai.toFixed(2), r: 4, class: "point-rouge" }));
      dessinerVecteur(ns, svg, C_CX, C_CY, pxVrai.toFixed(2), C_CY, "vecteur-vert-ligne", "vecteur-vert-tete");
    } else if (fn === "sin") {
      // Vecteur vert de l'axe des x jusqu'au point du cercle qui correspond à sin(x).
      dessinerVecteur(ns, svg, pxVrai.toFixed(2), C_CY, pxVrai.toFixed(2), pyVrai.toFixed(2), "vecteur-vert-ligne", "vecteur-vert-tete");
    } else {
      var cosX = Math.cos(x);
      // Prolongement pointillé du segment de l'angle (le rayon, au-delà du point sur le cercle) :
      // jusqu'à l'intersection avec la droite verticale x=1 quand elle est atteignable dans la
      // fenêtre visible, sinon jusqu'à la bordure de la fenêtre du contenant.
      var pointeIntersection = null;
      if (cosX > 0.02) {
        var yInterVrai = C_CY - Math.tan(x) * C_R;
        if (yInterVrai >= 0 && yInterVrai <= C_TAILLE) {
          pointeIntersection = { x: C_CX + C_R, y: yInterVrai };
        }
      }
      if (!pointeIntersection) {
        pointeIntersection = rayonBordFenetre(C_CX, C_CY, Math.cos(x), -Math.sin(x), 0, C_TAILLE);
      }
      svg.appendChild(svgEl(ns, "line", { x1: pxVrai.toFixed(2), y1: pyVrai.toFixed(2), x2: pointeIntersection.x.toFixed(2), y2: pointeIntersection.y.toFixed(2), class: "prolongement-tan" }));

      // Vecteur vert de l'axe des x (sur la droite x=1) jusqu'au point qui correspond à tan(x) —
      // seulement quand tan(x) est défini (borné pour rester dans la fenêtre visible).
      if (Math.abs(cosX) > 0.02) {
        var tanX = Math.tan(x);
        var tanClamp = Math.max(-2.3, Math.min(2.3, tanX));
        var pxTang = C_CX + C_R;
        var pyTang = C_CY - tanClamp * C_R;
        dessinerVecteur(ns, svg, pxTang, C_CY, pxTang, pyTang.toFixed(2), "vecteur-vert-ligne", "vecteur-vert-tete");
      }
    }

    // Indication : valeur de l'angle en π rad, directement sur le cercle.
    var etiqAngle = svgEl(ns, "text", { x: C_CX, y: C_TAILLE - 6, "text-anchor": "middle", class: "etiquette-angle" });
    etiqAngle.textContent = "x = " + formatEnPi(x);
    svg.appendChild(etiqAngle);
  };

  CercleTrigoWidgetClass.prototype._toPxGraphe = function (xMath, yMath, yMin, yMax) {
    var zoneL = G_LARGEUR - G_MARGE_G - G_MARGE_D;
    var zoneH = G_HAUTEUR - G_MARGE_H - G_MARGE_B;
    var px = G_MARGE_G + (xMath / X_MAX) * zoneL;
    var py = G_HAUTEUR - G_MARGE_B - ((yMath - yMin) / (yMax - yMin)) * zoneH;
    return [px, py];
  };

  CercleTrigoWidgetClass.prototype._dessinerGraphe = function () {
    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svgGraphe;
    svg.innerHTML = "";
    var x = this._x, fn = this._fn;
    var fenetre = FENETRES_Y[fn];
    var yMin = fenetre.min, yMax = fenetre.max;
    var self = this;

    function toPx(xm, ym) { return self._toPxGraphe(xm, ym, yMin, yMax); }

    // Asymptotes verticales (tangente uniquement)
    if (fn === "tan") {
      ASYMPTOTES_TAN.forEach(function (xa) {
        if (xa > X_MAX) return;
        var p = toPx(xa, 0);
        svg.appendChild(svgEl(ns, "line", { x1: p[0].toFixed(2), x2: p[0].toFixed(2), y1: G_MARGE_H, y2: G_HAUTEUR - G_MARGE_B, class: "asymptote" }));
      });
    }

    // Axes
    var origine = toPx(0, 0);
    svg.appendChild(svgEl(ns, "line", { x1: G_MARGE_G, x2: G_LARGEUR - G_MARGE_D, y1: origine[1].toFixed(2), y2: origine[1].toFixed(2), class: "axe" }));
    svg.appendChild(svgEl(ns, "line", { x1: G_MARGE_G, x2: G_MARGE_G, y1: G_MARGE_H, y2: G_HAUTEUR - G_MARGE_B, class: "axe" }));

    var etiqX = svgEl(ns, "text", { x: G_LARGEUR - G_MARGE_D + 2, y: origine[1] + 4, class: "etiquette" });
    etiqX.textContent = "x";
    svg.appendChild(etiqX);
    var etiqY = svgEl(ns, "text", { x: G_MARGE_G + 4, y: G_MARGE_H - 4, class: "etiquette" });
    etiqY.textContent = "y";
    svg.appendChild(etiqY);

    // Segment violet en sur-épaisseur sur l'axe des x, de 0 à x — reflète l'arc balayé sur le cercle.
    if (x > 0) {
      var pViolet0 = toPx(0, 0), pViolet1 = toPx(x, 0);
      svg.appendChild(svgEl(ns, "line", { x1: pViolet0[0].toFixed(2), x2: pViolet1[0].toFixed(2), y1: pViolet0[1].toFixed(2), y2: pViolet1[1].toFixed(2), class: "axe-x-violet" }));

      // Indication : valeur de l'angle en π rad, sur l'abscisse du segment qui évolue.
      var etiqAbsc = svgEl(ns, "text", { x: pViolet1[0].toFixed(2), y: (origine[1] + 16).toFixed(2), "text-anchor": "middle", class: "etiquette-angle" });
      etiqAbsc.textContent = formatEnPi(x);
      svg.appendChild(etiqAbsc);
    }

    // Courbe tracée progressivement de 0 à x (pas au-delà) — se "dessine au fur et à mesure"
    // avec le curseur, jamais pré-tracée sur tout l'intervalle [0, 3π].
    var f = FN[fn].f;
    var n = Math.max(2, Math.round((x / X_MAX) * 600));
    if (x > 0) {
      var segments = [];
      var courant = "";
      var dernierValide = false;
      for (var i = 0; i <= n; i++) {
        var xx = (i / n) * x;
        var yy = f(xx);
        var valide = yy >= yMin - 0.001 && yy <= yMax + 0.001;
        // tan : on coupe le tracé près des asymptotes plutôt que de traverser tout le graphe
        if (fn === "tan") {
          var procheAsymptote = ASYMPTOTES_TAN.some(function (xa) { return Math.abs(xx - xa) < 0.05; });
          if (procheAsymptote) valide = false;
        }
        if (valide) {
          var p = toPx(xx, Math.max(yMin, Math.min(yMax, yy)));
          courant += (!dernierValide ? "M" : "L") + p[0].toFixed(2) + " " + p[1].toFixed(2) + " ";
        } else if (dernierValide && courant) {
          segments.push(courant.trim());
          courant = "";
        }
        dernierValide = valide;
      }
      if (courant) segments.push(courant.trim());
      segments.forEach(function (seg) {
        svg.appendChild(svgEl(ns, "path", { d: seg, class: "courbe" }));
      });

      // Marqueur rouge à la pointe (x, f(x)) + guide pointillé vers l'axe Y, pour relier
      // explicitement au segment rouge du cercle ("cela correspond à l'ordonnée du graphe") — et
      // vecteur vert (nouveau) du point d'abscisse x vers ce même point de la courbe.
      var yPointe = f(x);
      var pointeValide = yPointe >= yMin && yPointe <= yMax && !(fn === "tan" && ASYMPTOTES_TAN.some(function (xa) { return Math.abs(x - xa) < 0.05; }));
      if (pointeValide) {
        var pPointe = toPx(x, yPointe);
        var pAbscisse = toPx(x, 0);
        dessinerVecteur(ns, svg, pAbscisse[0].toFixed(2), pAbscisse[1].toFixed(2), pPointe[0].toFixed(2), pPointe[1].toFixed(2), "vecteur-vert-ligne", "vecteur-vert-tete");
        svg.appendChild(svgEl(ns, "line", { x1: G_MARGE_G, x2: pPointe[0].toFixed(2), y1: pPointe[1].toFixed(2), y2: pPointe[1].toFixed(2), class: "guide-rouge" }));
        svg.appendChild(svgEl(ns, "circle", { cx: pPointe[0].toFixed(2), cy: pPointe[1].toFixed(2), r: 4, class: "point-rouge" }));
      }
    }
  };

  CercleTrigoWidgetClass.prototype._rendre = function () {
    var x = this._x, fn = this._fn;
    this._valeurX.textContent = formatNombreFr(x, 2) + " rad (" + formatEnPi(x) + ")";
    this._valXRad.textContent = formatNombreFr(x, 2);
    this._valXPi.textContent = formatEnPi(x);
    this._labelFn.textContent = FN[fn].symbole;
    var cosX = Math.cos(x);
    if (fn === "tan" && Math.abs(cosX) <= 0.02) {
      this._valFn.textContent = "non défini";
    } else {
      this._valFn.textContent = formatNombreFr(FN[fn].f(x), 3);
    }
    this._dessinerCercle();
    this._dessinerGraphe();
  };

  if (!customElements.get("cercle-trigo-widget")) {
    customElements.define("cercle-trigo-widget", CercleTrigoWidgetClass);
  }
})();
