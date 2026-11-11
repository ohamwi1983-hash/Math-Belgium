(function () {
  "use strict";

  /* ================================================================
   * <log-exp-miroir-widget> — atelier interactif : reprend le mécanisme
   * miroir déjà utilisé au chapitre 1 (reciproque-miroir-widget), appliqué
   * ici à expₐ/logₐ avec la base a réglable en continu (pas un sélecteur
   * fermé de fonctions). Point (r;aʳ) sur expₐ, son symétrique (aʳ;r) sur
   * logₐ, par rapport à y=x. Case « Afficher les tangentes » : tangente à
   * expₐ en (r;aʳ), de pente m = aʳ·ln(a), et tangente à logₐ en (aʳ;r), de
   * pente 1/m — symétriques elles aussi par rapport à y=x. En base e, c'est
   * la preuve visuelle de (ln x)′ = 1/x. Web Component (Shadow DOM).
   * ================================================================ */

  var DEFAUT = { a: 2, r: 0.8 }; // reprend exactement le point (r;s) de l'illustration statique
  var BORNES_A = { min: 0.3, max: 3, step: 0.02 };
  var R_MIN = -1.5, R_MAX = 1.5;
  var TAILLE = 340, MARGE = 30;
  // Fenêtre carrée FIXE (jamais recalculée depuis a/r courants, sinon les axes bougent avec le
  // point qu'on est en train de faire glisser). Bornes = pire cas de expₐ(r) sur BORNES_A×[R_MIN,R_MAX] :
  // max≈6,086 en (a=0,3 ; r=−1,5), min≈0,164 en (a=0,3 ; r=1,5) — toujours dans [R_MIN,R_MAX] côté bas.
  // (a=3 ; r=1,5) donne 3^1,5 ≈ 5,196 : reste dans la fenêtre.
  var DEMI_LONGUEUR_TANGENTE = 2.4; // demi-longueur (unités du repère) des segments de tangente
  var DOMAINE_MIN = -2.2, DOMAINE_MAX = 6.8;

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
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:16px;}' +
    'svg{width:100%;max-width:340px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.diagonale{stroke:var(--ink-faint,#9c9083);stroke-width:1.3;stroke-dasharray:5 4;}' +
    '.courbe-exp{stroke:var(--good,#2f7a4f);stroke-width:2.6;fill:none;}' +
    '.courbe-log{stroke:var(--accent,#a8471f);stroke-width:2.6;fill:none;}' +
    '.guide-miroir{stroke:var(--plan,#5b4ea3);stroke-width:1.2;stroke-dasharray:4 3;opacity:0.75;}' +
    '.point-exp{fill:var(--good,#2f7a4f);}' +
    '.point-log{fill:var(--accent,#a8471f);}' +
    '.etiquette-point{font-size:11px;font-weight:600;font-family:var(--mono,monospace);}' +
    '.etiquette-point-exp{fill:var(--good,#2f7a4f);}' +
    '.etiquette-point-log{fill:var(--accent-ink,#7a3212);}' +
    '.legende{font-size:11.5px;font-weight:600;font-family:var(--sans,sans-serif);}' +
    '.legende-exp{fill:var(--good,#2f7a4f);}' +
    '.legende-log{fill:var(--accent-ink,#7a3212);}' +
    '.legende-diag{fill:var(--ink-faint,#9c9083);}' +
    '.stats{display:flex;align-items:stretch;justify-content:center;gap:6px;margin-top:20px;flex-wrap:wrap;}' +
    '.stat{flex:1 1 130px;min-width:0;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:8px 6px;text-align:center;background:var(--surface,#fff);}' +
    '.stat-label{display:block;font-family:var(--mono,monospace);font-size:10px;letter-spacing:0.02em;color:var(--ink-faint,#9c9083);margin-bottom:5px;}' +
    '.stat-value{display:block;font-variant-numeric:tabular-nums;font-size:0.94rem;font-weight:600;color:var(--ink,#241f1a);white-space:nowrap;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);text-align:center;}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;font-size:0.92rem;}' +
    '.options{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;margin:14px 0 4px;}' +
    '.case{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 6px;font-weight:600;font-size:0.92rem;cursor:pointer;color:var(--plan,#5b4ea3);}' +
    '.case input[type="checkbox"]{width:20px;height:20px;cursor:pointer;accent-color:var(--plan,#5b4ea3);}' +
    '.btn-e{min-height:44px;padding:8px 16px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.9rem;font-family:inherit;}' +
    '.btn-e:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '.tangente-exp{stroke:var(--good,#2f7a4f);stroke-width:1.8;stroke-dasharray:7 4;}' +
    '.tangente-log{stroke:var(--accent,#a8471f);stroke-width:1.8;stroke-dasharray:7 4;}' +
    '.pentes{margin:14px 0 0;padding:10px 12px;border:1px solid var(--line,#e2d8c8);border-left:3px solid var(--plan,#5b4ea3);border-radius:var(--radius,3px);background:var(--surface,#fff);color:var(--ink,#241f1a);font-size:0.92rem;line-height:1.5;}' +
    '.pentes p{margin:0 0 4px;}' +
    '.pentes p:last-child{margin-bottom:0;}' +
    '.pente-exp{color:var(--good,#2f7a4f);font-weight:600;}' +
    '.pente-log{color:var(--accent-ink,#7a3212);font-weight:600;}' +
    '.base-e{color:var(--plan,#5b4ea3);font-weight:600;}' +
    '</style>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + TAILLE + ' ' + TAILLE + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<div class="curseur"><label for="a">a — base</label><div class="curseur-row">' +
    '<input type="range" id="a" min="' + BORNES_A.min + '" max="' + BORNES_A.max + '" step="' + BORNES_A.step + '" value="' + DEFAUT.a + '">' +
    '<span class="curseur-valeur" id="a-valeur"></span></div></div>' +
    '<div class="curseur"><label for="r">r</label><div class="curseur-row">' +
    '<input type="range" id="r" min="' + R_MIN + '" max="' + R_MAX + '" step="0.02" value="' + DEFAUT.r + '">' +
    '<span class="curseur-valeur" id="r-valeur"></span></div></div>' +
    '<div class="options">' +
    '<label class="case"><input type="checkbox" id="case-tangentes">Afficher les tangentes</label>' +
    '<button class="btn-e" id="btn-e" type="button">a = e</button>' +
    '</div>' +
    '<div class="pentes" id="pentes" hidden></div>' +
    '<div class="stats">' +
    '<div class="stat"><span class="stat-label">point sur expₐ</span><span class="stat-value" id="val-point-exp"></span></div>' +
    '<div class="stat"><span class="stat-label">symétrique sur logₐ</span><span class="stat-value" id="val-point-log"></span></div>' +
    '</div>';

  class LogExpMiroirWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  LogExpMiroirWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._a = DEFAUT.a;
    this._r = DEFAUT.r;
    this._svg = shadow.getElementById("svg");
    this._inputA = shadow.getElementById("a");
    this._inputR = shadow.getElementById("r");
    this._valeurA = shadow.getElementById("a-valeur");
    this._valeurR = shadow.getElementById("r-valeur");
    this._valPointExp = shadow.getElementById("val-point-exp");
    this._valPointLog = shadow.getElementById("val-point-log");
    this._caseTangentes = shadow.getElementById("case-tangentes");
    this._btnE = shadow.getElementById("btn-e");
    this._pentes = shadow.getElementById("pentes");
    this._tangentes = false;
  };

  LogExpMiroirWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    // a ne peut jamais valoir 1 (logₐ n'existe pas en base 1) : un curseur qui franchit 1 est
    // repoussé au pas le plus proche, dans le sens du déplacement.
    this._onInputA = function () {
      var v = parseFloat(self._inputA.value);
      if (Math.abs(v - 1) < BORNES_A.step / 2) {
        v = v >= self._a ? 1 + BORNES_A.step : 1 - BORNES_A.step;
        self._inputA.value = String(v);
      }
      // Au pas le plus proche de e (2,72), la base est e exactement : le texte « base e » et les
      // pentes 1/x restent alors rigoureusement exacts.
      self._a = Math.abs(v - Math.E) < BORNES_A.step / 2 ? Math.E : v;
      self._rendre();
    };
    this._onToggleTangentes = function () { self._tangentes = self._caseTangentes.checked; self._rendre(); };
    this._onBaseE = function () {
      self._a = Math.E;
      self._inputA.value = "2.72";
      self._rendre();
    };
    this._caseTangentes.addEventListener("change", this._onToggleTangentes);
    this._btnE.addEventListener("click", this._onBaseE);
    this._onInputR = function () { self._r = parseFloat(self._inputR.value); self._rendre(); };
    this._inputA.addEventListener("input", this._onInputA);
    this._inputR.addEventListener("input", this._onInputR);
    this._rendre();
  };

  LogExpMiroirWidgetClass.prototype.disconnectedCallback = function () {
    this._inputA.removeEventListener("input", this._onInputA);
    this._inputR.removeEventListener("input", this._onInputR);
    this._caseTangentes.removeEventListener("change", this._onToggleTangentes);
    this._btnE.removeEventListener("click", this._onBaseE);
  };

  // Découpe le segment [P, Q] à la fenêtre carrée [min ; max]² (Liang–Barsky) — null s'il en sort.
  function clipSegment(P, Q, min, max) {
    var dx = Q[0] - P[0], dy = Q[1] - P[1];
    var t0 = 0, t1 = 1;
    var p = [-dx, dx, -dy, dy];
    var q = [P[0] - min, max - P[0], P[1] - min, max - P[1]];
    for (var i = 0; i < 4; i++) {
      if (p[i] === 0) { if (q[i] < 0) return null; continue; }
      var t = q[i] / p[i];
      if (p[i] < 0) { if (t > t1) return null; if (t > t0) t0 = t; }
      else { if (t < t0) return null; if (t < t1) t1 = t; }
    }
    return [[P[0] + t0 * dx, P[1] + t0 * dy], [P[0] + t1 * dx, P[1] + t1 * dy]];
  }

  LogExpMiroirWidgetClass.prototype._toPx = function (win, xMath, yMath) {
    var px = MARGE + (xMath - win.min) / (win.max - win.min) * (TAILLE - 2 * MARGE);
    var py = TAILLE - MARGE - (yMath - win.min) / (win.max - win.min) * (TAILLE - 2 * MARGE);
    return [px, py];
  };

  LogExpMiroirWidgetClass.prototype._traceFonction = function (svg, ns, win, xMin, xMax, f, classe) {
    var self = this;
    var n = 220, segments = [], courant = "", dernierValide = false;
    for (var i = 0; i <= n; i++) {
      var xx = xMin + (i / n) * (xMax - xMin);
      var yy = f(xx);
      var valide = isFinite(yy) && yy >= win.min - 0.5 && yy <= win.max + 0.5;
      if (valide) {
        var p = self._toPx(win, xx, Math.max(win.min, Math.min(win.max, yy)));
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

  // Étiquette d'un point, ancrée à gauche ou à droite selon la proximité du bord du cadre — évite
  // le rognage (overflow:hidden implicite d'un <svg> racine).
  LogExpMiroirWidgetClass.prototype._etiquettePoint = function (svg, ns, px, py, texte, classe) {
    var procheDroite = px > TAILLE - 70;
    var procheHaut = py < MARGE + 18;
    var ancre = procheDroite ? "end" : "start";
    var dx = procheDroite ? -8 : 8;
    var dy = procheHaut ? 16 : -8;
    var t = svgEl(ns, "text", { x: (px + dx).toFixed(2), y: (py + dy).toFixed(2), "text-anchor": ancre, class: classe });
    t.textContent = texte;
    svg.appendChild(t);
  };

  LogExpMiroirWidgetClass.prototype._rendre = function () {
    var a = this._a, r = this._r;
    var expA = function (x) { return Math.pow(a, x); };
    var logA = function (x) { return x > 0 ? Math.log(x) / Math.log(a) : NaN; };
    var s = expA(r);

    var baseE = a === Math.E;
    this._valeurA.textContent = baseE ? "e ≈ 2,72" : formatNombreFr(a, 2);
    this._valeurR.textContent = formatNombreFr(r, 2);
    this._valPointExp.textContent = "(" + formatNombreFr(r, 2) + " ; " + formatNombreFr(s, 2) + ")";
    this._valPointLog.textContent = "(" + formatNombreFr(s, 2) + " ; " + formatNombreFr(r, 2) + ")";

    // Fenêtre carrée fixe (voir DOMAINE_MIN/DOMAINE_MAX) — y=x reste à 45° quelle que soit la
    // base choisie puisqu'elle est toujours carrée, mais ne bouge plus quand a ou r varie.
    var win = { min: DOMAINE_MIN, max: DOMAINE_MAX };

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
    svg.appendChild(svgEl(ns, "line", { x1: MARGE, x2: TAILLE - MARGE, y1: origine[1].toFixed(2), y2: origine[1].toFixed(2), class: "axe", "marker-end": "url(#fleche)" }));
    svg.appendChild(svgEl(ns, "line", { x1: origine[0].toFixed(2), x2: origine[0].toFixed(2), y1: TAILLE - MARGE, y2: MARGE, class: "axe", "marker-end": "url(#fleche)" }));

    var pD0 = self._toPx(win, win.min, win.min);
    var pD1 = self._toPx(win, win.max, win.max);
    svg.appendChild(svgEl(ns, "line", { x1: pD0[0].toFixed(2), y1: pD0[1].toFixed(2), x2: pD1[0].toFixed(2), y2: pD1[1].toFixed(2), class: "diagonale" }));

    this._traceFonction(svg, ns, win, R_MIN, R_MAX, expA, "courbe-exp");
    var logXmin = Math.max(0.01, win.min);
    this._traceFonction(svg, ns, win, logXmin, win.max, logA, "courbe-log");

    var m = s * Math.log(a); // pente de expₐ en r : (aˣ)′ = aˣ·ln(a)
    if (this._tangentes) {
      // Segment de tangente centré sur (r ; s), de demi-longueur fixe dans la direction (1 ; m) ;
      // la tangente à logₐ en est l'image par la symétrie (x ; y) ↦ (y ; x).
      var norme = Math.sqrt(1 + m * m);
      var ux = DEMI_LONGUEUR_TANGENTE / norme, uy = DEMI_LONGUEUR_TANGENTE * m / norme;
      var E1 = [r - ux, s - uy], E2 = [r + ux, s + uy];
      var segExp = clipSegment(E1, E2, win.min, win.max);
      var segLog = clipSegment([E1[1], E1[0]], [E2[1], E2[0]], win.min, win.max);
      [[segExp, "tangente-exp"], [segLog, "tangente-log"]].forEach(function (c) {
        if (!c[0]) return;
        var q0 = self._toPx(win, c[0][0][0], c[0][0][1]), q1 = self._toPx(win, c[0][1][0], c[0][1][1]);
        svg.appendChild(svgEl(ns, "line", { x1: q0[0].toFixed(2), y1: q0[1].toFixed(2), x2: q1[0].toFixed(2), y2: q1[1].toFixed(2), class: c[1] }));
      });
      var nomBase = baseE ? "e" : formatNombreFr(a, 2);
      var html = '<p><span class="pente-exp">Pente sur expₐ en x = ' + formatNombreFr(r, 2) + ' : m = aʳ · ln(a) ≈ ' + formatNombreFr(m, 3) + '</span></p>' +
        '<p><span class="pente-log">Pente sur logₐ en x = ' + formatNombreFr(s, 2) + ' : 1/m ≈ ' + formatNombreFr(1 / m, 3) + '</span></p>' +
        '<p>Les deux tangentes sont symétriques par rapport à y = x : les pentes sont inverses l\'une de l\'autre' +
        (a < 1 ? ' (ici toutes deux négatives, car la base ' + nomBase + ' est inférieure à 1).' : '.') + '</p>';
      if (baseE) {
        html += '<p class="base-e">Base e : en x = eʳ ≈ ' + formatNombreFr(s, 2) + ', la pente de ln vaut 1/eʳ = 1/x ≈ ' +
          formatNombreFr(1 / s, 3) + ' : c\'est (ln x)′ = 1/x.</p>';
      } else {
        html += '<p>Appuie sur « a = e » : la pente de ln en x devient exactement 1/x.</p>';
      }
      this._pentes.innerHTML = html;
      this._pentes.hidden = false;
    } else {
      this._pentes.hidden = true;
    }

    var pExp = self._toPx(win, r, s);
    var pLog = self._toPx(win, s, r);
    svg.appendChild(svgEl(ns, "line", { x1: pExp[0].toFixed(2), y1: pExp[1].toFixed(2), x2: pLog[0].toFixed(2), y2: pLog[1].toFixed(2), class: "guide-miroir" }));
    svg.appendChild(svgEl(ns, "circle", { cx: pExp[0].toFixed(2), cy: pExp[1].toFixed(2), r: 4.5, class: "point-exp" }));
    svg.appendChild(svgEl(ns, "circle", { cx: pLog[0].toFixed(2), cy: pLog[1].toFixed(2), r: 4.5, class: "point-log" }));
    self._etiquettePoint(svg, ns, pExp[0], pExp[1], "(" + formatNombreFr(r, 2) + ";" + formatNombreFr(s, 2) + ")", "etiquette-point etiquette-point-exp");
    self._etiquettePoint(svg, ns, pLog[0], pLog[1], "(" + formatNombreFr(s, 2) + ";" + formatNombreFr(r, 2) + ")", "etiquette-point etiquette-point-log");

    var yLegende = MARGE + 4;
    var legExp = svgEl(ns, "text", { x: MARGE + 4, y: yLegende, class: "legende legende-exp" });
    legExp.textContent = (baseE ? "e" : formatNombreFr(a, 2)) + "ˣ";
    svg.appendChild(legExp);
    var legLog = svgEl(ns, "text", { x: MARGE + 4, y: yLegende + 15, class: "legende legende-log" });
    legLog.textContent = baseE ? "ln(x)" : "logₐ(x)";
    svg.appendChild(legLog);
    var legDiag = svgEl(ns, "text", { x: MARGE + 4, y: yLegende + 30, class: "legende legende-diag" });
    legDiag.textContent = "y = x";
    svg.appendChild(legDiag);
  };

  if (!customElements.get("log-exp-miroir-widget")) {
    customElements.define("log-exp-miroir-widget", LogExpMiroirWidgetClass);
  }
})();
