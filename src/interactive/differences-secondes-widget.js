(function () {
  "use strict";

  /* ================================================================
   * <differences-secondes-widget> — atelier interactif : reconnaître le
   * type d'une fonction à partir d'un tableau de valeurs (x = 0 à 5, pas 1).
   * Différences premières constantes → premier degré ; différences secondes
   * constantes → second degré (et la différence seconde vaut 2a, d'où a,
   * puis b = f(1) − f(0) − a et c = f(0)) ; sinon, ni l'un ni l'autre.
   * Même langage visuel que <parabole-widget> (variables CSS du chapitre,
   * thème clair/sombre). Web Component (Shadow DOM).
   * ================================================================ */

  var XS = [0, 1, 2, 3, 4, 5];
  var LARGEUR = 560, HAUTEUR = 260, MARGE = 34;

  var PRESETS = {
    cours: { label: "f(x) = x² + 1 (cours)", type: "second", a: 1, b: 0, c: 1 },
    premier: { label: "Premier degré", type: "premier", m: 3, p: -2 },
    negatif: { label: "Second degré, a < 0", type: "second", a: -2, b: 4, c: 3 },
    ni: { label: "Ni l'un ni l'autre (2ˣ)", type: "expo", base: 2 }
  };

  function fr(n) {
    var r = Math.round(n * 100) / 100;
    var s = String(Math.abs(r)).replace(".", ",");
    return (r < 0 ? "−" : "") + s;
  }

  function valeur(fn, x) {
    if (fn.type === "premier") return fn.m * x + fn.p;
    if (fn.type === "second") return fn.a * x * x + fn.b * x + fn.c;
    if (fn.type === "cube") return fn.k * x * x * x + fn.c;
    return Math.pow(fn.base, x);
  }

  /** Écriture propre de ax² + bx + c (coefficients entiers). */
  function trinome(a, b, c) {
    var t = [];
    function terme(coef, partie) {
      if (coef === 0) return;
      var abs = Math.abs(coef);
      var txt = (abs === 1 && partie) ? partie : fr(abs) + partie;
      t.push({ neg: coef < 0, txt: txt });
    }
    terme(a, "x²"); terme(b, "x"); terme(c, "");
    if (!t.length) return "0";
    var s = (t[0].neg ? "−" : "") + t[0].txt;
    for (var i = 1; i < t.length; i++) s += (t[i].neg ? " − " : " + ") + t[i].txt;
    return s;
  }

  function formuleFonction(fn) {
    if (fn.type === "premier") return trinome(0, fn.m, fn.p);
    if (fn.type === "second") return trinome(fn.a, fn.b, fn.c);
    if (fn.type === "cube") return (fn.k === 1 ? "" : fn.k === -1 ? "−" : fr(fn.k)) + "x³" + (fn.c ? (fn.c < 0 ? " − " : " + ") + fr(Math.abs(fn.c)) : "");
    return fn.base + "ˣ";
  }

  function differences(liste) {
    var d = [];
    for (var i = 1; i < liste.length; i++) d.push(liste[i] - liste[i - 1]);
    return d;
  }
  function constante(liste) {
    for (var i = 1; i < liste.length; i++) if (Math.abs(liste[i] - liste[0]) > 1e-9) return false;
    return true;
  }

  function entier(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }
  function nonNul(min, max) { var v = 0; while (v === 0) v = entier(min, max); return v; }

  function tirage() {
    var r = Math.random();
    if (r < 0.3) return { type: "premier", m: nonNul(-4, 4), p: entier(-5, 5) };
    if (r < 0.75) return { type: "second", a: nonNul(-3, 3), b: entier(-5, 5), c: entier(-5, 5) };
    if (r < 0.9) return { type: "cube", k: nonNul(-2, 2), c: entier(-3, 3) };
    return { type: "expo", base: entier(2, 3) };
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}' +
    '*{box-sizing:border-box;}' +
    '.choix{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;}' +
    'button{min-height:44px;padding:8px 12px;border-radius:3px;border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);font-family:inherit;font-size:0.88rem;cursor:pointer;}' +
    'button:hover:not(:disabled){border-color:var(--accent,#a8471f);background:var(--accent-soft,#f6e2d3);}' +
    'button.actif{border-color:var(--accent,#a8471f);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;}' +
    'button:disabled{opacity:.45;cursor:not-allowed;}' +
    '.question{font-size:0.95rem;margin:0 0 10px;color:var(--ink-soft,#6b6055);}' +
    '.formule{font-family:var(--serif,serif);font-style:italic;font-weight:600;color:var(--ink,#241f1a);}' +
    '.table-zone{overflow-x:auto;margin-bottom:12px;}' +
    'table{border-collapse:collapse;width:100%;max-width:640px;min-width:300px;font-variant-numeric:tabular-nums;}' +
    'th,td{border:1px solid var(--line,#e2d8c8);padding:6px 4px;text-align:center;font-size:0.92rem;}' +
    'th{background:var(--surface-2,#faf6f0);font-weight:600;color:var(--ink-soft,#6b6055);white-space:nowrap;}' +
    'td.vide{border:none;}' +
    'tr.diff td{color:var(--accent-ink,#7a3212);}' +
    'tr.diff2 td{color:var(--good,#2f7a4f);font-weight:600;}' +
    'tr.cache{display:none;}' +
    '.actions{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;}' +
    '.verdict{border-left:3px solid var(--accent,#a8471f);background:var(--surface-2,#faf6f0);padding:10px 12px;border-radius:3px;font-size:0.92rem;line-height:1.5;min-height:1.5em;}' +
    '.verdict:empty{display:none;}' +
    '.verdict strong{color:var(--accent-ink,#7a3212);}' +
    '.verdict .ok{color:var(--good,#2f7a4f);font-weight:600;}' +
    '.graphe-zone{margin-top:12px;}' +
    'svg{width:100%;height:auto;max-width:560px;display:block;margin:0 auto;background:var(--surface-2,#faf6f0);border-radius:3px;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.grille{stroke:var(--line-soft,#ede5d7);stroke-width:1;}' +
    '.point{fill:var(--accent,#a8471f);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.courbe{stroke:var(--good,#2f7a4f);stroke-width:2;fill:none;stroke-dasharray:6 4;}' +
    '.graduation{font-size:10px;fill:var(--ink-faint,#9c9083);font-family:var(--sans,sans-serif);}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--serif,serif);font-style:italic;}' +
    '</style>' +
    '<div class="choix" id="choix"></div>' +
    '<p class="question">Fonction du tableau : <span class="formule" id="formule"></span></p>' +
    '<div class="table-zone"><table><tbody id="corps"></tbody></table></div>' +
    '<div class="actions">' +
    '<button type="button" id="btn-d1">Calculer les différences premières</button>' +
    '<button type="button" id="btn-d2" disabled>Calculer les différences secondes</button>' +
    '<button type="button" id="btn-formule">Montrer la fonction</button>' +
    '</div>' +
    '<div class="verdict" id="verdict" aria-live="polite"></div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Points du tableau de valeurs"></svg></div>';

  class DifferencesSecondesWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._s = shadow;
      this._choix = "cours";
      this._fn = PRESETS.cours;
      this._etape = 0;
      this._formuleVisible = false;
      var self = this;
      var zone = shadow.getElementById("choix");
      Object.keys(PRESETS).concat(["hasard"]).forEach(function (cle) {
        var b = document.createElement("button");
        b.type = "button";
        b.dataset.cle = cle;
        b.textContent = cle === "hasard" ? "Au hasard" : PRESETS[cle].label;
        b.addEventListener("click", function () { self._choisir(cle); });
        zone.appendChild(b);
      });
      shadow.getElementById("btn-d1").addEventListener("click", function () { self._etape = Math.max(self._etape, 1); self._rendre(); });
      shadow.getElementById("btn-d2").addEventListener("click", function () { self._etape = 2; self._rendre(); });
      shadow.getElementById("btn-formule").addEventListener("click", function () { self._formuleVisible = true; self._rendre(); });
    }

    connectedCallback() { this._rendre(); }

    _choisir(cle) {
      this._choix = cle;
      this._fn = cle === "hasard" ? tirage() : PRESETS[cle];
      this._etape = 0;
      this._formuleVisible = cle !== "hasard";
      this._rendre();
    }

    _rendre() {
      var s = this._s, fn = this._fn;
      var ys = XS.map(function (x) { return valeur(fn, x); });
      var d1 = differences(ys), d2 = differences(d1);
      Array.prototype.forEach.call(s.querySelectorAll("#choix button"), function (b) {
        b.classList.toggle("actif", b.dataset.cle === this._choix);
      }, this);
      s.getElementById("formule").textContent = this._formuleVisible ? "f(x) = " + formuleFonction(fn) : "inconnue — à toi de la reconnaître";
      s.getElementById("btn-formule").hidden = this._formuleVisible;

      var corps = s.getElementById("corps");
      corps.innerHTML = "";
      function ligne(titre, valeurs, decalage, classe) {
        var tr = document.createElement("tr");
        if (classe) tr.className = classe;
        var th = document.createElement("th");
        th.textContent = titre;
        tr.appendChild(th);
        // Une case de tableau par x ; les différences se placent « entre » deux valeurs : on les
        // aligne sous la colonne de droite de chaque paire (décalage 1 ou 2 cases vides).
        for (var i = 0; i < decalage; i++) { var v = document.createElement("td"); v.className = "vide"; tr.appendChild(v); }
        valeurs.forEach(function (val) { var td = document.createElement("td"); td.textContent = fr(val); tr.appendChild(td); });
        corps.appendChild(tr);
      }
      ligne("x", XS, 0, "");
      ligne("f(x)", ys, 0, "");
      if (this._etape >= 1) ligne("Δ", d1, 1, "diff");
      if (this._etape >= 2) ligne("Δ²", d2, 2, "diff2");

      var d2Btn = s.getElementById("btn-d2");
      d2Btn.disabled = this._etape < 1 || this._etape >= 2 || constante(d1);
      s.getElementById("btn-d1").disabled = this._etape >= 1;

      var verdict = "";
      if (this._etape >= 1 && constante(d1)) {
        verdict = "Les différences premières valent toutes <strong>" + fr(d1[0]) + "</strong> : elles sont constantes, " +
          "donc f est du <span class=\"ok\">premier degré</span>. Son taux d'accroissement est m = " + fr(d1[0]) +
          " et f(0) = " + fr(ys[0]) + " : f(x) = " + trinome(0, d1[0], ys[0]) + ".";
      } else if (this._etape === 1) {
        verdict = "Les différences premières (" + d1.map(fr).join(" ; ") + ") ne sont pas constantes : f n'est pas du premier degré. " +
          "Calcule les différences des différences.";
      } else if (this._etape >= 2) {
        if (constante(d2)) {
          var a = d2[0] / 2, b = d1[0] - a, c = ys[0];
          verdict = "Les différences secondes valent toutes <strong>" + fr(d2[0]) + "</strong> : elles sont constantes, donc f est du " +
            "<span class=\"ok\">second degré</span>.<br>La différence seconde vaut 2a : a = " + fr(d2[0]) + " ÷ 2 = " + fr(a) + ".<br>" +
            "f(1) − f(0) = a + b, donc b = " + fr(d1[0]) + " − " + (a < 0 ? "(" + fr(a) + ")" : fr(a)) + " = " + fr(b) + ".<br>" +
            "c = f(0) = " + fr(c) + ".<br>Fonction retrouvée : <strong>f(x) = " + trinome(a, b, c) + "</strong>" +
            " — vérification : f(5) = " + fr(a * 25 + b * 5 + c) + ", comme dans le tableau.";
        } else {
          verdict = "Les différences secondes (" + d2.map(fr).join(" ; ") + ") ne sont pas constantes non plus : f n'est " +
            "<span class=\"ok\">ni du premier, ni du second degré</span>.";
        }
      }
      s.getElementById("verdict").innerHTML = verdict;
      this._dessiner(ys);
    }

    _dessiner(ys) {
      var svg = this._s.getElementById("svg");
      var NS = "http://www.w3.org/2000/svg";
      function el(nom, attrs) {
        var e = document.createElementNS(NS, nom);
        for (var k in attrs) e.setAttribute(k, attrs[k]);
        return e;
      }
      svg.innerHTML = "";
      var min = Math.min.apply(null, ys.concat([0])), max = Math.max.apply(null, ys.concat([0]));
      if (max - min < 4) { max = min + 4; }
      var marge = (max - min) * 0.1;
      min -= marge; max += marge;
      function px(x) { return MARGE + (x + 0.5) / 6 * (LARGEUR - 2 * MARGE); }
      function py(y) { return HAUTEUR - MARGE - (y - min) / (max - min) * (HAUTEUR - 2 * MARGE); }
      var defs = el("defs", {});
      var mk = el("marker", { id: "fl-ds", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      mk.appendChild(el("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(mk);
      svg.appendChild(defs);
      var y0 = py(0);
      svg.appendChild(el("line", { x1: MARGE - 6, x2: LARGEUR - MARGE + 8, y1: y0, y2: y0, class: "axe", "marker-end": "url(#fl-ds)" }));
      svg.appendChild(el("line", { x1: px(0), x2: px(0), y1: HAUTEUR - MARGE + 6, y2: MARGE - 10, class: "axe", "marker-end": "url(#fl-ds)" }));
      var lx = el("text", { x: LARGEUR - MARGE + 6, y: y0 - 6, class: "etiquette", "text-anchor": "end" }); lx.textContent = "x"; svg.appendChild(lx);
      var ly = el("text", { x: px(0) + 6, y: MARGE - 2, class: "etiquette" }); ly.textContent = "f(x)"; svg.appendChild(ly);
      XS.forEach(function (x) {
        if (x === 0) return;
        var t = el("text", { x: px(x), y: y0 + 14, class: "graduation", "text-anchor": "middle" }); t.textContent = String(x); svg.appendChild(t);
      });
      // Courbe passant par les points (interpolation lisse seulement pour les types connus).
      var fn = this._fn;
      if (this._formuleVisible || this._etape >= 2 || (this._etape >= 1 && constante(differences(ys)))) {
        var d = "";
        for (var i = 0; i <= 100; i++) {
          var x = i / 100 * 5;
          var y = valeur(fn, x);
          d += (i ? "L" : "M") + px(x).toFixed(1) + "," + py(y).toFixed(1);
        }
        svg.appendChild(el("path", { d: d, class: "courbe" }));
      }
      ys.forEach(function (y, i) {
        svg.appendChild(el("circle", { cx: px(XS[i]), cy: py(y), r: 5, class: "point" }));
      });
    }
  }

  if (!customElements.get("differences-secondes-widget")) {
    customElements.define("differences-secondes-widget", DifferencesSecondesWidget);
  }
})();
