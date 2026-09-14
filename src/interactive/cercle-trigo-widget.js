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
  // Au-delà de 2π, l'angle continue de tourner mais on ne peut plus le distinguer visuellement
  // d'un tour précédent si on le redessine sur le même cercle — on fait donc grandir le rayon du
  // TRACÉ (pas du cercle lui-même, qui reste fixe) uniquement pour la portion au-delà de 2π,
  // ce qui donne l'effet "ressort circulaire" demandé, sans jamais faire varier la taille du
  // cercle trigonométrique de référence (piège déjà rencontré 2 fois cette session : ne jamais
  // laisser un affichage se recadrer/se déformer selon le paramètre qu'il est censé montrer).
  var RESSORT_CROISSANCE = 46;

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
    '.arc-violet{stroke:var(--plan,#5b4ea3);stroke-width:3.4;fill:none;stroke-linecap:round;}' +
    '.rayon-violet{stroke:var(--plan,#5b4ea3);stroke-width:2.6;stroke-linecap:round;}' +
    '.point-mobile{fill:var(--plan,#5b4ea3);}' +
    '.segment-rouge{stroke:var(--bad,#b23a3a);stroke-width:2.8;stroke-linecap:round;}' +
    '.point-rouge{fill:var(--bad,#b23a3a);}' +
    '.guide-rouge{stroke:var(--bad,#b23a3a);stroke-width:1.1;stroke-dasharray:3 3;}' +
    '.axe-x-violet{stroke:var(--plan,#5b4ea3);stroke-width:3.4;stroke-linecap:round;}' +
    '.courbe{stroke:var(--accent,#a8471f);stroke-width:2.4;fill:none;}' +
    '.asymptote{stroke:var(--line,#e2d8c8);stroke-width:1;stroke-dasharray:4 3;}' +
    '.etiquette{font-size:11.5px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
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
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:64px;text-align:right;font-size:0.92rem;}' +
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

  // Rayon du point mobile sur le cercle : fixe (=C_R) tant que x <= 2π, puis grandit
  // progressivement au-delà — c'est ce grandissement, combiné à l'angle qui continue de tourner,
  // qui dessine le "ressort circulaire" demandé pour représenter un angle > un tour complet.
  function rayonPourAngle(x) {
    if (x <= DEUX_PI) return C_R;
    return C_R + RESSORT_CROISSANCE * ((x - DEUX_PI) / DEUX_PI);
  }

  CercleTrigoWidgetClass.prototype._dessinerCercle = function () {
    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svgCercle;
    svg.innerHTML = "";
    var x = this._x, fn = this._fn;

    svg.appendChild(svgEl(ns, "circle", { cx: C_CX, cy: C_CY, r: C_R, class: "cercle-ref" }));
    svg.appendChild(svgEl(ns, "line", { x1: G_MARGE_G, x2: G_MARGE_G, y1: C_CY, y2: C_CY, class: "axe" }));
    // axes
    svg.appendChild(svgEl(ns, "line", { x1: C_CX - C_R - 20, x2: C_CX + C_R + 20, y1: C_CY, y2: C_CY, class: "axe" }));
    svg.appendChild(svgEl(ns, "line", { x1: C_CX, x2: C_CX, y1: C_CY - C_R - 20, y2: C_CY + C_R + 20, class: "axe" }));

    // Arc/spirale violet(te) balayé(e) de 0 à x, échantillonné finement — le rayon suit
    // rayonPourAngle(t) pour chaque point, ce qui produit un arc simple tant que t<=2π puis une
    // spirale sortante au-delà.
    var n = Math.max(2, Math.round((x / X_MAX) * 400));
    var d = "";
    for (var i = 0; i <= n; i++) {
      var t = (i / n) * x;
      var r = rayonPourAngle(t);
      var px = C_CX + r * Math.cos(t);
      var py = C_CY - r * Math.sin(t);
      d += (i === 0 ? "M" : "L") + px.toFixed(2) + " " + py.toFixed(2) + " ";
    }
    if (x > 0) {
      svg.appendChild(svgEl(ns, "path", { d: d.trim(), class: "arc-violet" }));
    }

    // Rayon (segment centre -> point courant) et point mobile, en violet
    var rActuel = rayonPourAngle(x);
    var pxActuel = C_CX + rActuel * Math.cos(x);
    var pyActuel = C_CY - rActuel * Math.sin(x);
    svg.appendChild(svgEl(ns, "line", { x1: C_CX, y1: C_CY, x2: pxActuel.toFixed(2), y2: pyActuel.toFixed(2), class: "rayon-violet" }));
    svg.appendChild(svgEl(ns, "circle", { cx: pxActuel.toFixed(2), cy: pyActuel.toFixed(2), r: 4.5, class: "point-mobile" }));

    // Point sur le VRAI cercle (rayon fixe C_R), utilisé pour les projections rouges — toujours
    // sur le cercle de référence, même quand x > 2π (le point violet, lui, peut être sur la spirale).
    var pxVrai = C_CX + C_R * Math.cos(x);
    var pyVrai = C_CY - C_R * Math.sin(x);

    if (fn === "sin") {
      // projection verticale : segment rouge du point vrai jusqu'à l'axe des x
      svg.appendChild(svgEl(ns, "line", { x1: pxVrai.toFixed(2), y1: pyVrai.toFixed(2), x2: pxVrai.toFixed(2), y2: C_CY, class: "segment-rouge" }));
      svg.appendChild(svgEl(ns, "circle", { cx: pxVrai.toFixed(2), cy: pyVrai.toFixed(2), r: 4, class: "point-rouge" }));
    } else if (fn === "cos") {
      // projection horizontale : segment rouge du centre jusqu'à la position x du point vrai
      svg.appendChild(svgEl(ns, "line", { x1: C_CX, y1: C_CY, x2: pxVrai.toFixed(2), y2: C_CY, class: "segment-rouge" }));
      svg.appendChild(svgEl(ns, "circle", { cx: pxVrai.toFixed(2), cy: pyVrai.toFixed(2), r: 4, class: "point-rouge" }));
    } else {
      // tangente : segment vertical sur la droite tangente au point (1,0) du cercle, longueur tan(x)
      var cosX = Math.cos(x);
      if (Math.abs(cosX) > 0.02) {
        var tanX = Math.tan(x);
        var tanClamp = Math.max(-2.3, Math.min(2.3, tanX));
        var pxTang = C_CX + C_R;
        var pyTang = C_CY - tanClamp * C_R;
        svg.appendChild(svgEl(ns, "line", { x1: pxTang, y1: C_CY, x2: pxTang, y2: pyTang.toFixed(2), class: "segment-rouge" }));
        svg.appendChild(svgEl(ns, "circle", { cx: pxTang, cy: pyTang.toFixed(2), r: 4, class: "point-rouge" }));
      }
    }
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
      // explicitement au segment rouge du cercle ("cela correspond à l'ordonnée du graphe").
      var yPointe = f(x);
      var pointeValide = yPointe >= yMin && yPointe <= yMax && !(fn === "tan" && ASYMPTOTES_TAN.some(function (xa) { return Math.abs(x - xa) < 0.05; }));
      if (pointeValide) {
        var pPointe = toPx(x, yPointe);
        svg.appendChild(svgEl(ns, "line", { x1: G_MARGE_G, x2: pPointe[0].toFixed(2), y1: pPointe[1].toFixed(2), y2: pPointe[1].toFixed(2), class: "guide-rouge" }));
        svg.appendChild(svgEl(ns, "circle", { cx: pPointe[0].toFixed(2), cy: pPointe[1].toFixed(2), r: 4, class: "point-rouge" }));
      }
    }
  };

  CercleTrigoWidgetClass.prototype._rendre = function () {
    var x = this._x, fn = this._fn;
    this._valeurX.textContent = formatNombreFr(x, 2) + " rad";
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
