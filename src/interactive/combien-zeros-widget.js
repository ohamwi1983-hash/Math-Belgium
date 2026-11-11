(function () {
  "use strict";

  /* ================================================================
   * <combien-zeros-widget> — atelier interactif (4e, chapitre 3, section
   * « Étudier algébriquement une fonction de référence ») : choix d'une
   * des 6 familles, curseurs a, b (forme [famille](ax + b)) et K ; le
   * graphe y = [famille](ax + b) et la droite y = K. Le nombre de
   * solutions de [famille](ax + b) = K (et leurs valeurs) se lit en
   * direct, et le tableau « nombre de zéros selon le signe de K » du
   * chapitre se surligne à la bonne case — complété par la colonne
   * K = 0 (une racine double pour carrée/valeur absolue, aucune solution
   * pour l'inverse, qui n'atteint jamais 0).
   * Fenêtre de tracé FIXE. Web Component (Shadow DOM).
   * ================================================================ */

  var X_MIN = -6.5, X_MAX = 6.5, Y_MIN = -5.5, Y_MAX = 5.5;
  var LARGEUR = 440, HAUTEUR = 340, MARGE_G = 24, MARGE_D = 20, MARGE_H = 16, MARGE_B = 22;
  var NS = "http://www.w3.org/2000/svg";
  var EPS = 1e-9;
  var DEFAUT = { famille: "carree", a: 1, b: -1, K: 4 };

  function cbrt(v) { return v < 0 ? -Math.pow(-v, 1 / 3) : Math.pow(v, 1 / 3); }

  // resoudre(K) → valeurs de u = ax + b telles que g(u) = K.
  var FAMILLES = [
    { id: "carree", nom: "Carrée", ligne: "Carrée / Valeur absolue", g: function (u) { return u * u; },
      ecrire: function (s) { return "(" + s + ")²"; },
      resoudre: function (K) { return K < -EPS ? [] : K < EPS ? [0] : [-Math.sqrt(K), Math.sqrt(K)]; } },
    { id: "absolue", nom: "Valeur absolue", ligne: "Carrée / Valeur absolue", g: function (u) { return Math.abs(u); },
      ecrire: function (s) { return "|" + s + "|"; },
      resoudre: function (K) { return K < -EPS ? [] : K < EPS ? [0] : [-K, K]; } },
    { id: "racine", nom: "Racine carrée", ligne: "Racine carrée", g: function (u) { return u >= 0 ? Math.sqrt(u) : null; },
      ecrire: function (s) { return "√(" + s + ")"; },
      resoudre: function (K) { return K < -EPS ? [] : [K * K]; } },
    { id: "cube", nom: "Cube", ligne: "Cube / Racine cubique / Inverse", g: function (u) { return u * u * u; },
      ecrire: function (s) { return "(" + s + ")³"; },
      resoudre: function (K) { return [cbrt(K)]; } },
    { id: "cubique", nom: "Racine cubique", ligne: "Cube / Racine cubique / Inverse", g: cbrt,
      ecrire: function (s) { return "∛(" + s + ")"; },
      resoudre: function (K) { return [K * K * K]; } },
    { id: "inverse", nom: "Inverse", ligne: "Cube / Racine cubique / Inverse", g: function (u) { return Math.abs(u) < EPS ? null : 1 / u; },
      ecrire: function (s) { return "1/(" + s + ")"; },
      resoudre: function (K) { return Math.abs(K) < EPS ? [] : [1 / K]; } },
  ];

  // Tableau du chapitre, complété par la colonne K = 0.
  var TABLEAU = [
    { ligne: "Carrée / Valeur absolue", neg: "0", nul: "1", pos: "2" },
    { ligne: "Racine carrée", neg: "0", nul: "1", pos: "1" },
    { ligne: "Cube / Racine cubique / Inverse", neg: "1", nul: "1", nulNote: "inverse : 0", pos: "1" },
  ];

  function famille(id) { return FAMILLES.filter(function (f) { return f.id === id; })[0]; }

  function pgcd(a, b) { return b ? pgcd(b, a % b) : Math.abs(a); }
  function enFraction(v) {
    for (var d = 1; d <= 400; d++) {
      var n = Math.round(v * d);
      if (Math.abs(n / d - v) < 1e-9) { var g = pgcd(n, d) || 1; return { n: n / g, d: d / g }; }
    }
    return null;
  }
  function decimalFr(v, dec) {
    var fac = Math.pow(10, dec);
    var t = (Math.round(v * fac) / fac).toFixed(dec);
    if (dec > 0) t = t.replace(/0+$/, "").replace(/\.$/, "");
    if (t === "-0") t = "0";
    return t.replace(".", ",").replace("-", "−");
  }
  /** Texte exact si rationnel (décimale courte ou fraction), « ≈ » sinon. */
  function valeurTexte(v) {
    var fr = enFraction(v);
    if (fr) {
      var d = fr.d;
      while (d % 2 === 0) d /= 2;
      while (d % 5 === 0) d /= 5;
      if (d === 1 && Math.abs(v * 100 - Math.round(v * 100)) < 1e-9) return "= " + decimalFr(v, 2);
      return "= " + (fr.n < 0 ? "−" : "") + Math.abs(fr.n) + "/" + fr.d + " ≈ " + decimalFr(v, 2);
    }
    return "≈ " + decimalFr(v, 2);
  }

  /** « ax + b » écrit proprement : 2x − 1, −x + 0,5, x, 3… */
  function interieur(a, b) {
    var ta = Math.abs(a - 1) < EPS ? "x" : Math.abs(a + 1) < EPS ? "−x" : decimalFr(a, 1) + "x";
    if (Math.abs(b) < EPS) return ta;
    return ta + (b > 0 ? " + " : " − ") + decimalFr(Math.abs(b), 1);
  }

  function svgEl(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    for (var cle in attrs) el.setAttribute(cle, attrs[cle]);
    return el;
  }
  function xPx(x) { return MARGE_G + (x - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - MARGE_G - MARGE_D); }
  function yPx(y) { return HAUTEUR - MARGE_B - (y - Y_MIN) / (Y_MAX - Y_MIN) * (HAUTEUR - MARGE_H - MARGE_B); }
  function yDepuisPx(py) { return Y_MIN + (HAUTEUR - MARGE_B - py) / (HAUTEUR - MARGE_H - MARGE_B) * (Y_MAX - Y_MIN); }
  function ancrage(px) {
    if (px < 50) return { anchor: "start", x: Math.max(px + 4, 4) };
    if (px > LARGEUR - 50) return { anchor: "end", x: Math.min(px - 4, LARGEUR - 4) };
    return { anchor: "middle", x: px };
  }

  var optionsFamilles = FAMILLES.map(function (f) { return '<option value="' + f.id + '">' + f.nom + '</option>'; }).join("");

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.entete{display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;margin-bottom:8px;}' +
    '.entete label{font-weight:600;color:var(--ink,#241f1a);font-size:0.9rem;}' +
    'select{font:inherit;font-size:0.95rem;padding:6px 8px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);min-height:38px;}' +
    '.equation{text-align:center;font-family:var(--serif,serif);font-size:1.12rem;font-weight:600;color:var(--ink,#241f1a);margin:4px 0 8px;overflow-wrap:anywhere;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:10px;}' +
    'svg{width:100%;max-width:460px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);user-select:none;-webkit-user-select:none;touch-action:none;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.5;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.tick{stroke:var(--ink-soft,#6b6055);stroke-width:1;}' +
    '.grille{stroke:var(--line,#e2d8c8);stroke-width:0.8;}' +
    '.etiquette-tick{font-size:10.5px;fill:var(--ink-soft,#6b6055);font-family:var(--mono,monospace);}' +
    '.asymptote{stroke:var(--ink-faint,#9c9083);stroke-width:1.2;stroke-dasharray:5 4;}' +
    '.courbe{stroke:var(--accent,#a8471f);stroke-width:2.6;fill:none;stroke-linejoin:round;}' +
    '.point-plein{fill:var(--accent,#a8471f);}' +
    '.droite-k{stroke:var(--plan,#5b4ea3);stroke-width:2.2;}' +
    '.poignee{fill:var(--plan,#5b4ea3);cursor:ns-resize;}' +
    '.guide{stroke:var(--good,#2e7d4f);stroke-width:1.5;stroke-dasharray:4 3;}' +
    '.solution{fill:var(--good,#2e7d4f);stroke:var(--surface,#fff);stroke-width:1.2;}' +
    '.hors-cadre{fill:var(--good,#2e7d4f);}' +
    '.etiquette-k{font-size:11.5px;font-weight:700;fill:var(--plan,#5b4ea3);font-family:var(--mono,monospace);}' +
    '.etiquette-sol{font-size:11px;font-weight:700;fill:var(--good,#2e7d4f);font-family:var(--mono,monospace);}' +
    '.controles{display:flex;flex-direction:column;gap:8px;}' +
    '.curseur{display:flex;align-items:center;gap:10px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;min-width:22px;color:var(--ink,#241f1a);}' +
    '.curseur.k label{color:var(--plan,#5b4ea3);}' +
    '.curseur input[type="range"]{flex:1 1 auto;min-width:0;accent-color:var(--accent,#a8471f);height:32px;}' +
    '.curseur.k input[type="range"]{accent-color:var(--plan,#5b4ea3);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:40px;text-align:right;font-size:0.92rem;}' +
    '.resultat{margin-top:12px;padding:10px 12px;border-radius:var(--radius,3px);background:var(--surface,#fff);border:1px solid var(--line,#e2d8c8);text-align:center;}' +
    '.nombre{display:block;font-size:1.02rem;font-weight:700;color:var(--good,#2e7d4f);}' +
    '.nombre.zero{color:var(--bad,#b3261e);}' +
    '.valeurs{display:block;margin-top:4px;font-variant-numeric:tabular-nums;font-size:0.95rem;color:var(--ink,#241f1a);overflow-wrap:anywhere;}' +
    '.message{margin:6px 0 0;font-size:0.88rem;line-height:1.45;color:var(--ink-soft,#6b6055);}' +
    '.table-zone{overflow-x:auto;margin-top:12px;}' +
    'table{border-collapse:collapse;margin:0 auto;font-size:0.84rem;min-width:300px;}' +
    'th,td{border:1px solid var(--line,#e2d8c8);padding:5px 7px;text-align:center;color:var(--ink,#241f1a);}' +
    'th{background:var(--surface-2,#faf6f0);font-weight:600;white-space:nowrap;}' +
    '.petit{display:block;font-size:0.78rem;color:var(--ink-soft,#6b6055);white-space:nowrap;}' +
    'td.ligne{text-align:left;}' +
    'tr.courante td.ligne{font-weight:700;}' +
    'td.case-active{background:var(--good,#2e7d4f);color:var(--surface,#fff);font-weight:700;}' +
    '.note{font-size:0.8rem;color:var(--ink-faint,#9c9083);text-align:center;margin:6px 0 0;}' +
    '.boutons{display:flex;justify-content:center;margin-top:12px;}' +
    '.btn{padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;min-height:36px;}' +
    '.btn:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<div class="entete"><label for="famille">Famille</label><select id="famille">' + optionsFamilles + '</select></div>' +
    '<p class="equation" id="equation"></p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg" aria-label="Courbe et droite y = K"></svg></div>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="a">a</label><input type="range" id="a" min="-3" max="3" step="0.5"><span class="curseur-valeur" id="a-valeur"></span></div>' +
    '<div class="curseur"><label for="b">b</label><input type="range" id="b" min="-4" max="4" step="0.5"><span class="curseur-valeur" id="b-valeur"></span></div>' +
    '<div class="curseur k"><label for="K">K</label><input type="range" id="K" min="-4" max="4" step="0.5"><span class="curseur-valeur" id="K-valeur"></span></div>' +
    '</div>' +
    '<div class="resultat" aria-live="polite"><span class="nombre" id="nombre"></span><span class="valeurs" id="valeurs"></span><p class="message" id="message"></p></div>' +
    '<div class="table-zone"><table><thead><tr><th>Famille</th><th>K &lt; 0</th><th>K = 0</th><th>K &gt; 0</th></tr></thead><tbody id="tableau"></tbody></table></div>' +
    '<p class="note">Nombre de solutions de [famille](ax + b) = K. La colonne K = 0 complète le tableau du cours.</p>' +
    '<div class="boutons"><button class="btn" id="reset" type="button">Réinitialiser</button></div>';

  class CombienZerosWidgetClass extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._etat = Object.assign({}, DEFAUT);
      this._glisse = false;
      this._svg = shadow.getElementById("svg");
      this._select = shadow.getElementById("famille");
      this._equation = shadow.getElementById("equation");
      this._inputs = { a: shadow.getElementById("a"), b: shadow.getElementById("b"), K: shadow.getElementById("K") };
      this._valeursCurseurs = { a: shadow.getElementById("a-valeur"), b: shadow.getElementById("b-valeur"), K: shadow.getElementById("K-valeur") };
      this._nombre = shadow.getElementById("nombre");
      this._valeurs = shadow.getElementById("valeurs");
      this._message = shadow.getElementById("message");
      this._tableau = shadow.getElementById("tableau");
      this._reset = shadow.getElementById("reset");
    }

    connectedCallback() {
      var self = this;
      this._ecouteurs = [];
      function ecoute(el, type, fn) { el.addEventListener(type, fn); self._ecouteurs.push([el, type, fn]); }
      ecoute(this._select, "change", function () { self._etat.famille = self._select.value; self._rendre(); });
      ["a", "b", "K"].forEach(function (nom) {
        ecoute(self._inputs[nom], "input", function () {
          var v = parseFloat(self._inputs[nom].value);
          // a ne vaut jamais 0 (ce ne serait plus une fonction de x) : repoussé au pas suivant.
          if (nom === "a" && Math.abs(v) < EPS) v = self._etat.a > 0 ? -0.5 : 0.5;
          self._etat[nom] = v;
          self._rendre();
        });
      });
      ecoute(this._reset, "click", function () { self._etat = Object.assign({}, DEFAUT); self._rendre(); });
      ecoute(this._svg, "pointerdown", function (e) {
        self._glisse = true;
        self._svg.setPointerCapture(e.pointerId);
        e.preventDefault();
        self._deplacer(e);
      });
      ecoute(this._svg, "pointermove", function (e) { if (self._glisse) self._deplacer(e); });
      var fin = function (e) {
        self._glisse = false;
        if (self._svg.hasPointerCapture(e.pointerId)) self._svg.releasePointerCapture(e.pointerId);
      };
      ecoute(this._svg, "pointerup", fin);
      ecoute(this._svg, "pointercancel", fin);
      this._rendre();
    }

    disconnectedCallback() {
      (this._ecouteurs || []).forEach(function (t) { t[0].removeEventListener(t[1], t[2]); });
      this._ecouteurs = [];
    }

    _deplacer(e) {
      var ctm = this._svg.getScreenCTM();
      if (!ctm) return;
      var p = this._svg.createSVGPoint();
      p.x = e.clientX; p.y = e.clientY;
      var l = p.matrixTransform(ctm.inverse());
      var K = Math.min(4, Math.max(-4, Math.round(yDepuisPx(l.y) * 2) / 2));
      if (K !== this._etat.K) { this._etat.K = K; this._rendre(); }
    }

    _rendre() {
      var e = this._etat;
      var fam = famille(e.famille);
      var self = this;
      this._select.value = e.famille;
      ["a", "b", "K"].forEach(function (nom) {
        self._inputs[nom].value = String(e[nom]);
        self._valeursCurseurs[nom].textContent = decimalFr(e[nom], 1);
      });
      var expr = fam.ecrire(interieur(e.a, e.b));
      this._equation.textContent = expr + " = " + decimalFr(e.K, 1);

      var us = fam.resoudre(e.K);
      var xs = us.map(function (u) { return (u - e.b) / e.a; }).sort(function (p, q) { return p - q; });

      // Résultat
      var n = xs.length;
      this._nombre.className = "nombre" + (n === 0 ? " zero" : "");
      this._nombre.textContent = n === 0 ? "Aucune solution" : n === 1 ? "1 solution" : n + " solutions";
      this._valeurs.textContent = n === 0 ? "" : xs.map(function (x) { return "x " + valeurTexte(x); }).join(" ; ");
      this._message.textContent = this._explication(fam, e.K, xs);

      // Tableau
      var col = e.K < -EPS ? "neg" : e.K > EPS ? "pos" : "nul";
      this._tableau.innerHTML = "";
      TABLEAU.forEach(function (r) {
        var tr = document.createElement("tr");
        var courante = r.ligne === fam.ligne;
        if (courante) tr.className = "courante";
        var td0 = document.createElement("td");
        td0.className = "ligne";
        td0.textContent = r.ligne;
        tr.appendChild(td0);
        ["neg", "nul", "pos"].forEach(function (c) {
          var td = document.createElement("td");
          td.textContent = r[c];
          if (c === "nul" && r.nulNote) {
            var note = document.createElement("span");
            note.className = "petit";
            note.textContent = "(" + r.nulNote + ")";
            td.appendChild(note);
          }
          if (courante && c === col) td.className = "case-active";
          tr.appendChild(td);
        });
        self._tableau.appendChild(tr);
      });

      this._dessiner(fam, xs);
    }

    _explication(fam, K, xs) {
      var kT = decimalFr(K, 1);
      if (fam.id === "carree" || fam.id === "absolue") {
        if (K < -EPS) return "Un " + (fam.id === "carree" ? "carré" : "valeur absolue") + " n'est jamais négatif : la droite y = " + kT + " passe sous toute la courbe.";
        if (K < EPS) return "La droite y = 0 touche la courbe en un seul point, son sommet : une seule solution (ax + b = 0).";
        return "Deux équations : ax + b = " + (fam.id === "carree" ? "√K" : "K") + " ou ax + b = " + (fam.id === "carree" ? "−√K" : "−K") + " — deux points d'intersection.";
      }
      if (fam.id === "racine") {
        if (K < -EPS) return "Une racine carrée n'est jamais négative : aucune solution.";
        return "On élève au carré : ax + b = K². La courbe ne monte (ou ne descend) que d'un côté : une seule intersection.";
      }
      if (fam.id === "inverse") {
        if (Math.abs(K) < EPS) return "1/(ax + b) n'est jamais nul : y = 0 est l'asymptote horizontale, la courbe ne l'atteint jamais. Aucune solution.";
        return "On inverse : ax + b = 1/K. Une seule intersection, sur l'une des deux branches.";
      }
      return "La courbe prend chaque valeur exactement une fois : quelle que soit K, une seule solution.";
    }

    _dessiner(fam, xs) {
      var e = this._etat;
      var svg = this._svg;
      svg.innerHTML = "";
      var defs = svgEl("defs", {});
      var marqueur = svgEl("marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      marqueur.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(marqueur);
      var clip = svgEl("clipPath", { id: "zone" });
      clip.appendChild(svgEl("rect", { x: xPx(X_MIN), y: yPx(Y_MAX), width: xPx(X_MAX) - xPx(X_MIN), height: yPx(Y_MIN) - yPx(Y_MAX) }));
      defs.appendChild(clip);
      svg.appendChild(defs);
      var x, y;
      for (x = -6; x <= 6; x++) svg.appendChild(svgEl("line", { x1: xPx(x), x2: xPx(x), y1: yPx(Y_MIN), y2: yPx(Y_MAX), class: "grille" }));
      for (y = -5; y <= 5; y++) svg.appendChild(svgEl("line", { x1: xPx(X_MIN), x2: xPx(X_MAX), y1: yPx(y), y2: yPx(y), class: "grille" }));
      svg.appendChild(svgEl("line", { x1: xPx(X_MIN), x2: xPx(X_MAX) + 6, y1: yPx(0), y2: yPx(0), class: "axe", "marker-end": "url(#fleche)" }));
      svg.appendChild(svgEl("line", { x1: xPx(0), x2: xPx(0), y1: yPx(Y_MIN), y2: yPx(Y_MAX) - 6, class: "axe", "marker-end": "url(#fleche)" }));
      for (x = -6; x <= 6; x += 2) {
        if (x === 0) continue;
        svg.appendChild(svgEl("line", { x1: xPx(x), x2: xPx(x), y1: yPx(0) - 3, y2: yPx(0) + 3, class: "tick" }));
        var t = svgEl("text", { x: xPx(x), y: yPx(0) + 14, "text-anchor": "middle", class: "etiquette-tick" });
        t.textContent = decimalFr(x, 0);
        svg.appendChild(t);
      }
      for (y = -4; y <= 4; y += 2) {
        if (y === 0) continue;
        svg.appendChild(svgEl("line", { x1: xPx(0) - 3, x2: xPx(0) + 3, y1: yPx(y), y2: yPx(y), class: "tick" }));
        var ty = svgEl("text", { x: xPx(0) - 6, y: yPx(y) + 3.5, "text-anchor": "end", class: "etiquette-tick" });
        ty.textContent = decimalFr(y, 0);
        svg.appendChild(ty);
      }

      // Courbe y = g(ax + b), coupée là où elle n'existe pas ; asymptote verticale pour l'inverse.
      var x0 = -e.b / e.a;
      if (fam.id === "inverse") {
        svg.appendChild(svgEl("line", { x1: xPx(x0), x2: xPx(x0), y1: yPx(Y_MIN), y2: yPx(Y_MAX), class: "asymptote" }));
      }
      var d = "", ouvert = false, n = 600;
      for (var i = 0; i <= n; i++) {
        var xx = X_MIN + (X_MAX - X_MIN) * i / n;
        var u = e.a * xx + e.b;
        var v = fam.g(u);
        var coupure = fam.id === "inverse" && i > 0 && ((e.a * (X_MIN + (X_MAX - X_MIN) * (i - 1) / n) + e.b) * u <= 0);
        if (v === null || coupure) { ouvert = false; if (v === null) continue; }
        v = Math.max(-30, Math.min(30, v));
        d += (ouvert ? "L" : "M") + xPx(xx).toFixed(2) + " " + yPx(v).toFixed(2) + " ";
        ouvert = true;
      }
      var g = svgEl("g", { "clip-path": "url(#zone)" });
      g.appendChild(svgEl("path", { d: d, class: "courbe" }));
      svg.appendChild(g);
      if (fam.id === "racine" && x0 >= X_MIN && x0 <= X_MAX) {
        svg.appendChild(svgEl("circle", { cx: xPx(x0), cy: yPx(0), r: 4, class: "point-plein" }));
      }

      // Droite y = K, avec une poignée à droite.
      var pk = yPx(e.K);
      svg.appendChild(svgEl("line", { x1: xPx(X_MIN), x2: xPx(X_MAX), y1: pk, y2: pk, class: "droite-k" }));
      svg.appendChild(svgEl("circle", { cx: xPx(X_MAX) - 8, cy: pk, r: 7, class: "poignee" }));
      var lk = svgEl("text", { x: xPx(X_MIN) + 4, y: (e.K > 4.5 ? pk + 14 : pk - 6).toFixed(2), class: "etiquette-k" });
      lk.textContent = "y = " + decimalFr(e.K, 1);
      svg.appendChild(lk);

      // Solutions : points d'intersection projetés sur l'axe des x (ou flèche si hors du cadre).
      xs.forEach(function (xs1, idx) {
        if (xs1 < X_MIN || xs1 > X_MAX) {
          var gauche = xs1 < X_MIN;
          var bx = gauche ? xPx(X_MIN) + 2 : xPx(X_MAX) - 2;
          var dir = gauche ? 1 : -1;
          svg.appendChild(svgEl("path", { d: "M" + bx + " " + pk + " l" + (8 * dir) + " -6 l0 12 Z", class: "hors-cadre" }));
          var th = svgEl("text", { x: (bx + 12 * dir).toFixed(2), y: (pk + 18).toFixed(2), "text-anchor": gauche ? "start" : "end", class: "etiquette-sol" });
          th.textContent = "x " + valeurTexte(xs1).replace(/ ≈ .*$/, "") + " (hors cadre)";
          svg.appendChild(th);
          return;
        }
        var px = xPx(xs1);
        svg.appendChild(svgEl("line", { x1: px, x2: px, y1: pk, y2: yPx(0), class: "guide" }));
        svg.appendChild(svgEl("circle", { cx: px, cy: pk, r: 5, class: "solution" }));
        svg.appendChild(svgEl("circle", { cx: px, cy: yPx(0), r: 3.5, class: "solution" }));
        var a = ancrage(px);
        var dessous = e.K >= 0;
        var yl = dessous ? yPx(0) + 26 + (idx % 2) * 12 : yPx(0) - 10 - (idx % 2) * 12;
        var tl = svgEl("text", { x: a.x.toFixed(2), y: yl.toFixed(2), "text-anchor": a.anchor, class: "etiquette-sol" });
        tl.textContent = decimalFr(xs1, 2);
        svg.appendChild(tl);
      });
    }
  }

  if (!customElements.get("combien-zeros-widget")) {
    customElements.define("combien-zeros-widget", CombienZerosWidgetClass);
  }
})();
