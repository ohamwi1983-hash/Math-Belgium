(function () {
  "use strict";

  /* ================================================================
   * <simplification-trou-widget> — atelier interactif : la fraction
   * f(x) = a(x − r)(x − p) / ((x − r)(x − q)) et sa forme simplifiée
   * g(x) = a(x − p)/(x − q) ont la même courbe PARTOUT sauf en x = r : f n'y
   * est pas définie (point creux, rond vide), g si. Asymptote verticale en
   * x = q pour les deux. Préréglage : l'exemple du cours
   * (2x² − 6x)/(x² − x − 6) = 2x/(x + 2) (a = 2, r = 3, p = 0, q = −2).
   * Fenêtre fixe. Web Component (Shadow DOM).
   * ================================================================ */

  var DEFAUT = { a: 2, r: 3, p: 0, q: -2 };
  var BORNES = { a: { min: -3, max: 3 }, r: { min: -5, max: 5 }, p: { min: -5, max: 5 }, q: { min: -5, max: 5 } };
  var X_MIN = -6, X_MAX = 6, Y_MIN = -8, Y_MAX = 8;
  var LARGEUR = 420, HAUTEUR = 320, MARGE = 30;

  function fr(n, decimales) {
    if (decimales === undefined) decimales = 2;
    var facteur = Math.pow(10, decimales);
    var arrondi = Math.round(n * facteur) / facteur;
    if (Object.is(arrondi, -0)) arrondi = 0;
    return String(arrondi).replace(".", ",").replace("-", "−");
  }

  function pgcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a || 1; }

  // Valeur exacte d'un quotient d'entiers : fraction réduite, puis valeur décimale (« = » si finie).
  function quotientTexte(num, den) {
    if (den < 0) { num = -num; den = -den; }
    var g = pgcd(num, den);
    num /= g; den /= g;
    var v = num / den;
    if (den === 1) return fr(num);
    var decimaleFinie = Math.abs(v * 100 - Math.round(v * 100)) < 1e-9;
    return fr(num, 0) + "/" + den + (decimaleFinie ? " = " : " ≈ ") + fr(v);
  }

  // (x − v) écrit proprement : x si v = 0, (x + 2) si v = −2.
  function facteur(v) {
    if (v === 0) return "x";
    return "(x " + (v > 0 ? "− " : "+ ") + fr(Math.abs(v)) + ")";
  }

  // Polynôme du second degré ou constant, écrit en ordre décroissant, sans « 1x » ni « + 0 ».
  function polyTexte(c2, c1, c0) {
    var morceaux = [];
    function terme(coef, partie, premier) {
      if (coef === 0) return;
      var signe = coef < 0 ? "−" : "+";
      var abs = Math.abs(coef);
      var corps = (abs === 1 && partie) ? partie : fr(abs) + partie;
      if (premier) morceaux.push((coef < 0 ? "−" : "") + corps);
      else morceaux.push(signe + " " + corps);
    }
    terme(c2, "x²", true);
    terme(c1, "x", morceaux.length === 0);
    terme(c0, "", morceaux.length === 0);
    return morceaux.length ? morceaux.join(" ") : "0";
  }

  function svgEl(ns, tag, attrs) {
    var el = document.createElementNS(ns, tag);
    for (var key in attrs) el.setAttribute(key, attrs[key]);
    return el;
  }

  function curseurHtml(id, label, min, max, valeur) {
    return '<div class="curseur"><label for="' + id + '">' + label + '</label><div class="curseur-row">' +
      '<input type="range" id="' + id + '" min="' + min + '" max="' + max + '" step="1" value="' + valeur + '">' +
      '<span class="curseur-valeur" id="' + id + '-valeur"></span></div></div>';
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.formules{display:flex;flex-direction:column;gap:4px;align-items:center;margin:0 0 12px;text-align:center;}' +
    '.formule{font-family:var(--serif,serif);font-style:italic;font-size:1.06rem;font-weight:600;color:var(--ink,#241f1a);overflow-wrap:anywhere;}' +
    '.formule.simple{color:var(--good,#2f7a4f);}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.grad{stroke:var(--ink-faint,#9c9083);stroke-width:1;}' +
    '.grad-txt{font-size:10px;fill:var(--ink-faint,#9c9083);font-family:var(--sans,sans-serif);text-anchor:middle;}' +
    '.courbe{stroke:var(--accent,#a8471f);stroke-width:2.6;fill:none;}' +
    '.courbe.simple{stroke:var(--good,#2f7a4f);}' +
    '.asymptote{stroke:var(--ink-faint,#9c9083);stroke-width:1.3;stroke-dasharray:5 4;}' +
    '.trou{fill:var(--surface-2,#faf6f0);stroke:var(--accent,#a8471f);stroke-width:2.2;}' +
    '.point-plein{fill:var(--good,#2f7a4f);}' +
    '.repere{stroke:var(--accent,#a8471f);stroke-width:1;stroke-dasharray:3 3;}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.etiquette-trou{font-size:11.5px;font-weight:600;fill:var(--accent-ink,#7a3212);font-family:var(--sans,sans-serif);}' +
    '.infos{display:flex;flex-direction:column;gap:6px;margin:0 0 12px;padding:10px 12px;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);background:var(--surface,#fff);}' +
    '.infos p{margin:0;font-size:0.93rem;line-height:1.45;color:var(--ink,#241f1a);font-variant-numeric:tabular-nums;overflow-wrap:anywhere;}' +
    '.infos .lab{font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.message{margin:0 0 14px;font-size:0.92rem;line-height:1.45;color:var(--ink-soft,#6b6055);text-align:center;}' +
    '.case{display:flex;align-items:center;gap:10px;min-height:44px;margin:0 0 12px;cursor:pointer;color:var(--ink,#241f1a);font-size:0.95rem;}' +
    '.case input{width:22px;height:22px;accent-color:var(--accent,#a8471f);}' +
    '.controles{display:flex;flex-direction:column;gap:10px;}' +
    '.curseur{display:flex;flex-direction:column;gap:4px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-width:0;min-height:44px;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:40px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{min-height:44px;margin-top:4px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '.btn-reset:focus-visible{outline:2px solid var(--accent,#a8471f);outline-offset:2px;}' +
    '</style>' +
    '<div class="formules"><span class="formule" id="f-dev"></span><span class="formule" id="f-fact"></span><span class="formule simple" id="f-simple"></span></div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Courbe de la fraction et de sa forme simplifiée"></svg></div>' +
    '<label class="case"><input type="checkbox" id="seule"> Afficher la forme simplifiée seule</label>' +
    '<div class="infos"><p id="ce"></p><p id="trou"></p></div>' +
    '<p class="message" id="message"></p>' +
    '<div class="controles">' +
    curseurHtml("r", "r (racine commune, simplifiée)", BORNES.r.min, BORNES.r.max, DEFAUT.r) +
    curseurHtml("p", "p (racine du numérateur restant)", BORNES.p.min, BORNES.p.max, DEFAUT.p) +
    curseurHtml("q", "q (racine du dénominateur restant)", BORNES.q.min, BORNES.q.max, DEFAUT.q) +
    curseurHtml("a", "a (coefficient)", BORNES.a.min, BORNES.a.max, DEFAUT.a) +
    '<button class="btn-reset" id="reset" type="button">Exemple du cours</button>' +
    '</div>';

  class SimplificationTrouWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._v = { a: DEFAUT.a, r: DEFAUT.r, p: DEFAUT.p, q: DEFAUT.q };
      this._seule = false;
      this._svg = shadow.getElementById("svg");
      this._fDev = shadow.getElementById("f-dev");
      this._fFact = shadow.getElementById("f-fact");
      this._fSimple = shadow.getElementById("f-simple");
      this._ce = shadow.getElementById("ce");
      this._trou = shadow.getElementById("trou");
      this._message = shadow.getElementById("message");
      this._case = shadow.getElementById("seule");
      this._reset = shadow.getElementById("reset");
      this._inputs = {};
      this._valeurs = {};
      var self = this;
      ["a", "r", "p", "q"].forEach(function (k) {
        self._inputs[k] = shadow.getElementById(k);
        self._valeurs[k] = shadow.getElementById(k + "-valeur");
      });
    }

    connectedCallback() {
      var self = this;
      this._handlers = {};
      ["a", "r", "p", "q"].forEach(function (k) {
        self._handlers[k] = function () { self._changer(k, parseInt(self._inputs[k].value, 10)); };
        self._inputs[k].addEventListener("input", self._handlers[k]);
      });
      this._onCase = function () { self._seule = self._case.checked; self._rendre(); };
      this._onReset = function () {
        self._v = { a: DEFAUT.a, r: DEFAUT.r, p: DEFAUT.p, q: DEFAUT.q };
        ["a", "r", "p", "q"].forEach(function (k) { self._inputs[k].value = String(self._v[k]); });
        self._rendre();
      };
      this._case.addEventListener("change", this._onCase);
      this._reset.addEventListener("click", this._onReset);
      this._rendre();
    }

    disconnectedCallback() {
      var self = this;
      ["a", "r", "p", "q"].forEach(function (k) { self._inputs[k].removeEventListener("input", self._handlers[k]); });
      this._case.removeEventListener("change", this._onCase);
      this._reset.removeEventListener("click", this._onReset);
    }

    // Contraintes : a ≠ 0, q ≠ r (sinon pas de trou mais un pôle double), q ≠ p (sinon la forme
    // simplifiée serait la constante a). Une valeur interdite est sautée dans le sens du déplacement.
    _changer(k, v) {
      var ancien = this._v[k];
      var sens = v >= ancien ? 1 : -1;
      var self = this;
      function interdit(val) {
        if (k === "a") return val === 0;
        if (k === "q") return val === self._v.r || val === self._v.p;
        if (k === "r") return val === self._v.q;
        if (k === "p") return val === self._v.q;
        return false;
      }
      var b = BORNES[k];
      var essai = v, n = 0;
      while (interdit(essai) && n < 12) {
        essai += sens;
        if (essai > b.max || essai < b.min) { sens = -sens; essai = v + sens; }
        n++;
      }
      this._v[k] = essai;
      this._inputs[k].value = String(essai);
      this._rendre();
    }

    _toPx(x, y) {
      return [MARGE + (x - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - 2 * MARGE),
        HAUTEUR - MARGE - (y - Y_MIN) / (Y_MAX - Y_MIN) * (HAUTEUR - 2 * MARGE)];
    }

    _tracer(svg, ns, g, lo, hi, classe) {
      var n = Math.max(6, Math.round(240 * (hi - lo) / (X_MAX - X_MIN)));
      var d = "", dernier = false;
      for (var i = 0; i <= n; i++) {
        var x = lo + (i / n) * (hi - lo);
        var y = g(x);
        var ok = isFinite(y) && y >= Y_MIN - 2 && y <= Y_MAX + 2;
        if (ok) {
          var p = this._toPx(x, Math.max(Y_MIN - 2, Math.min(Y_MAX + 2, y)));
          d += (dernier ? "L" : "M") + p[0].toFixed(2) + " " + p[1].toFixed(2) + " ";
        }
        dernier = ok;
      }
      if (d) svg.appendChild(svgEl(ns, "path", { d: d.trim(), class: classe }));
    }

    _rendre() {
      var v = this._v, a = v.a, r = v.r, p = v.p, q = v.q;
      var seule = this._seule;
      ["a", "r", "p", "q"].forEach(function (k) { this._valeurs[k].textContent = fr(v[k]); }, this);

      // numérateur a(x − r)(x − p) et dénominateur (x − r)(x − q), développés
      var numDev = polyTexte(a, -a * (r + p), a * r * p);
      var denDev = polyTexte(1, -(r + q), r * q);
      var coefTxt = a === 1 ? "" : (a === -1 ? "−" : fr(a));
      this._fDev.textContent = "f(x) = (" + numDev + ") / (" + denDev + ")";
      var numFact = coefTxt + facteur(p) + facteur(r);
      if (p === 0 && a === 1) numFact = "x" + facteur(r);
      this._fFact.textContent = "f(x) = " + numFact + " / (" + facteur(r) + facteur(q) + ")";
      var numSimple = p === 0 ? coefTxt + "x" : coefTxt + facteur(p);
      if (p === 0 && a === 1) numSimple = "x";
      this._fSimple.textContent = "forme simplifiée : g(x) = " + numSimple + " / " + facteur(q).replace(/^\((.*)\)$/, "($1)");

      var g = function (x) { return a * (x - p) / (x - q); };
      var yTrou = a * (r - p) / (r - q);

      this._ce.innerHTML = "";
      var labCe = document.createElement("span");
      labCe.className = "lab";
      labCe.textContent = seule ? "Domaine de g : " : "CE (dénominateur non simplifié) : ";
      this._ce.appendChild(labCe);
      this._ce.appendChild(document.createTextNode(seule ? "x ≠ " + fr(q) : "x ≠ " + fr(Math.min(r, q)) + " et x ≠ " + fr(Math.max(r, q))));

      this._trou.innerHTML = "";
      var labT = document.createElement("span");
      labT.className = "lab";
      labT.textContent = seule ? "En x = " + fr(r) + " : " : "Point creux en x = " + fr(r) + " : ";
      this._trou.appendChild(labT);
      var valeurExacte = quotientTexte(a * (r - p), r - q);
      this._trou.appendChild(document.createTextNode(seule
        ? "g(" + fr(r) + ") = " + valeurExacte + " (g y est définie)"
        : "la courbe s’approche de " + valeurExacte + ", mais f(" + fr(r) + ") n’existe pas"));

      this._message.textContent = seule
        ? "La forme simplifiée seule est définie en x = " + fr(r) + " (point plein) : ce n’est plus la même fonction que f."
        : "Simplifier par " + facteur(r) + " ne rend pas x = " + fr(r) + " permis : la fonction de départ n’y est pas définie.";

      // ---- graphique ----
      var ns = "http://www.w3.org/2000/svg";
      var svg = this._svg;
      svg.innerHTML = "";
      var defs = svgEl(ns, "defs", {});
      var marker = svgEl(ns, "marker", { id: "fleche-st", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      marker.appendChild(svgEl(ns, "path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(marker);
      svg.appendChild(defs);

      var o = this._toPx(0, 0);
      for (var gx = X_MIN + 1; gx < X_MAX; gx++) {
        if (gx === 0) continue;
        var pg = this._toPx(gx, 0);
        svg.appendChild(svgEl(ns, "line", { x1: pg[0], x2: pg[0], y1: o[1] - 3, y2: o[1] + 3, class: "grad" }));
        if (gx % 2 === 0) {
          var t = svgEl(ns, "text", { x: pg[0], y: o[1] + 14, class: "grad-txt" });
          t.textContent = fr(gx);
          svg.appendChild(t);
        }
      }
      for (var gy = Y_MIN + 2; gy < Y_MAX; gy += 2) {
        if (gy === 0) continue;
        var py = this._toPx(0, gy);
        svg.appendChild(svgEl(ns, "line", { x1: o[0] - 3, x2: o[0] + 3, y1: py[1], y2: py[1], class: "grad" }));
        var ty = svgEl(ns, "text", { x: o[0] - 12, y: py[1] + 3, class: "grad-txt" });
        ty.textContent = fr(gy);
        svg.appendChild(ty);
      }
      svg.appendChild(svgEl(ns, "line", { x1: MARGE, x2: LARGEUR - MARGE, y1: o[1], y2: o[1], class: "axe", "marker-end": "url(#fleche-st)" }));
      svg.appendChild(svgEl(ns, "line", { x1: o[0], x2: o[0], y1: HAUTEUR - MARGE, y2: MARGE, class: "axe", "marker-end": "url(#fleche-st)" }));
      var ex = svgEl(ns, "text", { x: LARGEUR - MARGE + 4, y: o[1] - 6, class: "etiquette" });
      ex.textContent = "x";
      svg.appendChild(ex);
      var ey = svgEl(ns, "text", { x: o[0] + 6, y: MARGE - 8, class: "etiquette" });
      ey.textContent = "y";
      svg.appendChild(ey);

      // asymptote verticale x = q
      var pq = this._toPx(q, 0);
      svg.appendChild(svgEl(ns, "line", { x1: pq[0], x2: pq[0], y1: MARGE, y2: HAUTEUR - MARGE, class: "asymptote" }));
      var eq = svgEl(ns, "text", { x: pq[0] + 4, y: MARGE + 12, class: "etiquette" });
      eq.textContent = "x = " + fr(q);
      svg.appendChild(eq);

      var classe = "courbe" + (seule ? " simple" : "");
      this._tracer(svg, ns, g, X_MIN, q - 1e-3, classe);
      this._tracer(svg, ns, g, q + 1e-3, X_MAX, classe);

      // point en x = r : creux pour f, plein pour g
      var dansFenetre = yTrou >= Y_MIN && yTrou <= Y_MAX;
      if (dansFenetre) {
        var pt = this._toPx(r, yTrou);
        svg.appendChild(svgEl(ns, "line", { x1: pt[0], x2: pt[0], y1: pt[1], y2: o[1], class: "repere" }));
        svg.appendChild(svgEl(ns, "circle", { cx: pt[0].toFixed(2), cy: pt[1].toFixed(2), r: 5, class: seule ? "point-plein" : "trou" }));
        var droite = pt[0] < LARGEUR - 120;
        var et = svgEl(ns, "text", { x: (pt[0] + (droite ? 9 : -9)).toFixed(2), y: (pt[1] - 9).toFixed(2), "text-anchor": droite ? "start" : "end", class: "etiquette-trou" });
        et.textContent = seule ? "défini en x = " + fr(r) : "trou en x = " + fr(r);
        svg.appendChild(et);
      } else {
        var et2 = svgEl(ns, "text", { x: MARGE + 4, y: HAUTEUR - MARGE - 6, class: "etiquette-trou" });
        et2.textContent = "point en x = " + fr(r) + " hors de la fenêtre";
        svg.appendChild(et2);
      }
    }
  }

  if (!customElements.get("simplification-trou-widget")) {
    customElements.define("simplification-trou-widget", SimplificationTrouWidget);
  }
})();
