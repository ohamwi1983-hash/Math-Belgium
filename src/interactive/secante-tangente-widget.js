(function () {
  "use strict";

  /* ================================================================
   * <secante-tangente-widget> — atelier « de la sécante à la tangente »
   * (5e, Dérivées, § 1). On choisit f et a ; le curseur h (positif OU
   * négatif, jamais 0) fait pivoter la sécante (AB), A(a ; f(a)),
   * B(a+h ; f(a+h)). Le taux d'accroissement est affiché avec la
   * formule substituée, et un tableau garde les taux des valeurs
   * repères de h (1 ; 0,1 ; 0,01 ; −0,01 ; −0,1 ; −0,5) dès qu'on y
   * passe : ils convergent vers f'(a). Fenêtre FIXE par fonction.
   * Curseur en échelle logarithmique : pas très fins près de 0.
   * Web Component (Shadow DOM).
   * ================================================================ */

  var NS = "http://www.w3.org/2000/svg";
  var LARGEUR = 420, HAUTEUR = 320, MARGE = 30;
  var H_MIN_ABS = 0.01;
  var CRANS = 1000;
  var REPERES = [1, 0.1, 0.01, -0.01, -0.1, -0.5];
  var BOUTONS = [1, 0.1, 0.01, -0.01];

  var FONCTIONS = {
    carre: {
      label: "f(x) = x² − 3, en a = 2",
      ecriture: "x² − 3",
      f: function (x) { return x * x - 3; },
      a: 2, derivee: 4, hMax: 2, hMinNeg: -2,
      fenetre: { xMin: -0.6, xMax: 4.6, yMin: -4.5, yMax: 14 },
      pasX: 1, pasY: 2
    },
    cube: {
      label: "f(x) = x³, en a = 1",
      ecriture: "x³",
      f: function (x) { return x * x * x; },
      a: 1, derivee: 3, hMax: 2, hMinNeg: -2,
      fenetre: { xMin: -1.6, xMax: 3.6, yMin: -3, yMax: 28 },
      pasX: 1, pasY: 5
    },
    inverse: {
      label: "f(x) = 1/x, en a = 1",
      ecriture: "1/x",
      f: function (x) { return 1 / x; },
      a: 1, derivee: -1, hMax: 2, hMinNeg: -0.8,
      fenetre: { xMin: -0.4, xMax: 3.6, yMin: -0.6, yMax: 5.6 },
      pasX: 1, pasY: 1
    },
    racine: {
      label: "f(x) = √x, en a = 1",
      ecriture: "√x",
      f: function (x) { return x < 0 ? NaN : Math.sqrt(x); },
      a: 1, derivee: 0.5, hMax: 2, hMinNeg: -0.95,
      fenetre: { xMin: -0.4, xMax: 3.6, yMin: -0.5, yMax: 2.3 },
      pasX: 1, pasY: 0.5
    }
  };

  function fr(n, decimales) {
    var facteur = Math.pow(10, decimales);
    var arrondi = Math.round(n * facteur) / facteur;
    if (Object.is(arrondi, -0)) arrondi = 0;
    var s = arrondi.toFixed(decimales);
    if (s.indexOf(".") >= 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
    return s.replace(".", ",").replace("-", "−");
  }

  /** Vrai si la valeur affichée avec 4 décimales est exacte. */
  function estExact(n) { return Math.abs(n * 1e4 - Math.round(n * 1e4)) < 1e-6; }

  function el(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}' +
    '*{box-sizing:border-box;}' +
    '.choix{display:flex;flex-direction:column;gap:6px;margin:0 0 12px;}' +
    '.choix label{font-weight:700;font-size:0.9rem;color:var(--accent-ink,#7a3212);}' +
    'select{min-height:44px;font:inherit;font-size:0.95rem;padding:6px 10px;border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);background:var(--surface,#fff);color:var(--ink,#241f1a);max-width:100%;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:440px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);display:block;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.grille{stroke:var(--line,#ccd8e0);stroke-width:0.7;}' +
    '.grad{font-size:12.5px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.courbe{stroke:var(--accent,#a8471f);stroke-width:2.4;fill:none;}' +
    '.secante{stroke:var(--sky,#2f6fb0);stroke-width:2;}' +
    '.tangente{stroke:var(--good,#2f7a4f);stroke-width:1.8;stroke-dasharray:6 4;}' +
    '.aide{stroke:var(--ink-soft,#6b6055);stroke-width:1;stroke-dasharray:3 3;}' +
    '.pointA{fill:var(--ink,#241f1a);}' +
    '.pointB{fill:var(--sky,#2f6fb0);}' +
    '.etq{font-size:14px;font-weight:700;font-family:var(--sans,sans-serif);}' +
    '.etqA{fill:var(--ink,#241f1a);}' +
    '.etqB{fill:var(--sky,#2f6fb0);}' +
    '.etqAide{font-size:13px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.lecture{background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);padding:10px 12px;margin:0 0 14px;font-size:0.95rem;line-height:1.5;}' +
    '.ligne-taux{display:flex;flex-wrap:wrap;align-items:center;gap:6px;justify-content:center;}' +
    '.frac{display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;font-variant-numeric:tabular-nums;}' +
    '.frac > span:first-child{border-bottom:1.5px solid currentColor;padding:0 4px 1px;}' +
    '.frac > span:last-child{padding:1px 4px 0;}' +
    '.resultat{font-weight:700;color:var(--sky-ink,#1f4e7d);}' +
    '.limite{text-align:center;margin:6px 0 0;font-weight:700;color:var(--good,#2f7a4f);}' +
    '.controles{display:flex;flex-direction:column;gap:12px;margin-bottom:14px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-width:0;height:44px;accent-color:var(--sky,#2f6fb0);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:72px;text-align:right;font-size:0.92rem;}' +
    '.boutons{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;}' +
    '.boutons button{min-height:44px;padding:4px 2px;border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);background:var(--surface,#fff);color:var(--ink,#241f1a);font:inherit;font-size:0.85rem;font-weight:600;cursor:pointer;}' +
    '.boutons button.actif{background:var(--sky-soft,#dde9f5);border-color:var(--sky,#2f6fb0);}' +
    '.case{display:flex;align-items:center;gap:10px;min-height:44px;font-size:0.92rem;cursor:pointer;}' +
    '.case input{width:22px;height:22px;accent-color:var(--good,#2f7a4f);}' +
    'table{width:100%;border-collapse:collapse;font-size:0.9rem;font-variant-numeric:tabular-nums;}' +
    'th,td{border:1px solid var(--line,#ccd8e0);padding:6px 6px;text-align:center;}' +
    'th{background:var(--surface-2,#faf6f0);font-weight:700;}' +
    'td.vide{color:var(--ink-soft,#6b6055);}' +
    'tr.courant td{background:var(--sky-soft,#dde9f5);}' +
    'caption{caption-side:top;text-align:left;font-weight:700;font-size:0.88rem;padding:0 0 6px;color:var(--ink-soft,#6b6055);}' +
    '.btn-reset{margin-top:12px;padding:8px 14px;min-height:44px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;display:block;margin-left:auto;margin-right:auto;}' +
    '</style>' +
    '<div class="choix"><label for="fn">Fonction</label><select id="fn">' +
    '<option value="carre">f(x) = x² − 3, en a = 2</option>' +
    '<option value="cube">f(x) = x³, en a = 1</option>' +
    '<option value="inverse">f(x) = 1/x, en a = 1</option>' +
    '<option value="racine">f(x) = √x, en a = 1</option>' +
    '</select></div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Courbe de f, sécante (AB) et tangente en A"></svg></div>' +
    '<div class="lecture" id="lecture" aria-live="polite"></div>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="h">h — écart entre B et A</label><div class="curseur-row">' +
    '<input type="range" id="h" min="' + (-CRANS) + '" max="' + CRANS + '" step="1">' +
    '<span class="curseur-valeur" id="h-valeur"></span></div></div>' +
    '<div class="boutons" id="boutons"></div>' +
    '<label class="case"><input type="checkbox" id="tg"> Montrer la tangente en A (et f\'(a))</label>' +
    '</div>' +
    '<table id="table"><caption>Taux d\'accroissement pour les valeurs repères de h</caption><thead><tr><th>h</th><th>a + h</th><th>taux</th></tr></thead><tbody id="tbody"></tbody></table>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>';

  class SecanteTangenteWidget extends HTMLElement {
    constructor() {
      super();
      var s = this.attachShadow({ mode: "open" });
      s.appendChild(TEMPLATE.content.cloneNode(true));
      this._s = s;
      this._fn = "carre";
      this._h = 1;
      this._vus = {};
      this._tg = false;
      var boutons = s.getElementById("boutons");
      var self = this;
      BOUTONS.forEach(function (v) {
        var b = document.createElement("button");
        b.type = "button";
        b.textContent = "h = " + fr(v, 2);
        b.dataset.h = String(v);
        boutons.appendChild(b);
      });
      this._onFn = function () { self._fn = s.getElementById("fn").value; self._reinitValeurs(); };
      this._onH = function () {
        var nouveau = self._curseurVersH(parseInt(s.getElementById("h").value, 10));
        self._marquerPassages(self._h, nouveau);
        self._h = nouveau;
        self._rendre();
      };
      this._onBouton = function (e) {
        var b = e.target.closest("button");
        if (!b || b.dataset.h === undefined) return;
        self._h = parseFloat(b.dataset.h);
        self._vus[String(self._h)] = true;
        s.getElementById("h").value = String(self._hVersCurseur(self._h));
        self._rendre();
      };
      this._onTg = function () { self._tg = s.getElementById("tg").checked; self._rendre(); };
      this._onReset = function () {
        self._fn = "carre";
        s.getElementById("fn").value = "carre";
        s.getElementById("tg").checked = false;
        self._tg = false;
        self._reinitValeurs();
      };
    }

    connectedCallback() {
      var s = this._s;
      s.getElementById("fn").addEventListener("change", this._onFn);
      s.getElementById("h").addEventListener("input", this._onH);
      s.getElementById("boutons").addEventListener("click", this._onBouton);
      s.getElementById("tg").addEventListener("change", this._onTg);
      s.getElementById("reset").addEventListener("click", this._onReset);
      this._reinitValeurs();
    }

    disconnectedCallback() {
      var s = this._s;
      s.getElementById("fn").removeEventListener("change", this._onFn);
      s.getElementById("h").removeEventListener("input", this._onH);
      s.getElementById("boutons").removeEventListener("click", this._onBouton);
      s.getElementById("tg").removeEventListener("change", this._onTg);
      s.getElementById("reset").removeEventListener("click", this._onReset);
    }

    _reinitValeurs() {
      this._h = 1;
      this._vus = { "1": true };
      this._s.getElementById("h").value = String(this._hVersCurseur(1));
      this._rendre();
    }

    /* Curseur −CRANS…CRANS → h, échelle logarithmique de chaque côté (0 repoussé à +0,01). */
    _curseurVersH(c) {
      var F = FONCTIONS[this._fn];
      if (c === 0) c = 1;
      var max = c > 0 ? F.hMax : -F.hMinNeg;
      var t = (Math.abs(c) - 1) / (CRANS - 1);
      var v = H_MIN_ABS * Math.pow(max / H_MIN_ABS, t);
      return c > 0 ? v : -v;
    }

    _hVersCurseur(h) {
      var F = FONCTIONS[this._fn];
      var max = h > 0 ? F.hMax : -F.hMinNeg;
      var t = Math.log(Math.abs(h) / H_MIN_ABS) / Math.log(max / H_MIN_ABS);
      var c = Math.round(1 + t * (CRANS - 1));
      return h > 0 ? c : -c;
    }

    /* Une valeur repère est « vue » dès que le curseur passe dessus ou la franchit. */
    _marquerPassages(avant, apres) {
      var self = this;
      REPERES.forEach(function (v) {
        if ((avant - v) * (apres - v) <= 0 || Math.abs(apres - v) < Math.abs(v) * 0.03) self._vus[String(v)] = true;
      });
    }

    _rendre() {
      var s = this._s;
      var F = FONCTIONS[this._fn];
      var W = F.fenetre;
      var h = this._h;
      var a = F.a;
      var fa = F.f(a), fb = F.f(a + h);
      var taux = (fb - fa) / h;

      s.getElementById("h-valeur").textContent = "h = " + fr(h, Math.abs(h) < 0.1 ? 3 : 2);
      Array.prototype.forEach.call(s.getElementById("boutons").children, function (b) {
        b.classList.toggle("actif", Math.abs(parseFloat(b.dataset.h) - h) < 1e-9);
      });

      var gx = function (x) { return MARGE + (x - W.xMin) / (W.xMax - W.xMin) * (LARGEUR - 2 * MARGE); };
      var gy = function (y) { return HAUTEUR - MARGE - (y - W.yMin) / (W.yMax - W.yMin) * (HAUTEUR - 2 * MARGE); };

      var svg = s.getElementById("svg");
      svg.innerHTML = "";
      var defs = el("defs", {});
      var mk = el("marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      mk.appendChild(el("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(mk);
      var clip = el("clipPath", { id: "zone" });
      clip.appendChild(el("rect", { x: MARGE, y: MARGE, width: LARGEUR - 2 * MARGE, height: HAUTEUR - 2 * MARGE }));
      defs.appendChild(clip);
      svg.appendChild(defs);

      // Grille et graduations
      var i, v;
      for (v = Math.ceil(W.xMin / F.pasX) * F.pasX; v <= W.xMax + 1e-9; v += F.pasX) {
        svg.appendChild(el("line", { x1: gx(v), x2: gx(v), y1: MARGE, y2: HAUTEUR - MARGE, class: "grille" }));
        if (Math.abs(v) > 1e-9) {
          var tx = el("text", { x: gx(v), y: Math.min(HAUTEUR - MARGE + 14, gy(0) + 14), "text-anchor": "middle", class: "grad" });
          tx.textContent = fr(v, 2);
          svg.appendChild(tx);
        }
      }
      for (v = Math.ceil(W.yMin / F.pasY) * F.pasY; v <= W.yMax + 1e-9; v += F.pasY) {
        svg.appendChild(el("line", { x1: MARGE, x2: LARGEUR - MARGE, y1: gy(v), y2: gy(v), class: "grille" }));
        if (Math.abs(v) > 1e-9) {
          var ty = el("text", { x: Math.max(MARGE - 4, gx(0) - 5), y: gy(v) + 3.5, "text-anchor": "end", class: "grad" });
          ty.textContent = fr(v, 2);
          svg.appendChild(ty);
        }
      }
      // Axes fléchés
      svg.appendChild(el("line", { x1: MARGE, x2: LARGEUR - MARGE + 8, y1: gy(0), y2: gy(0), class: "axe", "marker-end": "url(#fleche)" }));
      svg.appendChild(el("line", { x1: gx(0), x2: gx(0), y1: HAUTEUR - MARGE, y2: MARGE - 8, class: "axe", "marker-end": "url(#fleche)" }));

      var g = el("g", { "clip-path": "url(#zone)" });
      svg.appendChild(g);

      // Courbe (découpée hors domaine / hors fenêtre élargie)
      var d = "", leve = true, n = 400;
      for (i = 0; i <= n; i++) {
        var xx = W.xMin + (i / n) * (W.xMax - W.xMin);
        var yy = F.f(xx);
        if (!isFinite(yy) || yy > W.yMax + 50 || yy < W.yMin - 50) { leve = true; continue; }
        d += (leve ? "M" : "L") + gx(xx).toFixed(2) + " " + gy(yy).toFixed(2) + " ";
        leve = false;
      }
      g.appendChild(el("path", { d: d.trim(), class: "courbe" }));

      // Droite par un point et une pente, tracée sur toute la largeur (le clip la coupe)
      var droite = function (x0, y0, m, cls) {
        var x1 = W.xMin - 1, x2 = W.xMax + 1;
        g.appendChild(el("line", { x1: gx(x1), y1: gy(y0 + m * (x1 - x0)), x2: gx(x2), y2: gy(y0 + m * (x2 - x0)), class: cls }));
      };
      if (this._tg) droite(a, fa, F.derivee, "tangente");
      droite(a, fa, taux, "secante");

      // Triangle d'accroissement : h à l'horizontale, f(a+h) − f(a) à la verticale
      var pA = [gx(a), gy(fa)], pB = [gx(a + h), gy(fb)];
      g.appendChild(el("line", { x1: pA[0], y1: pA[1], x2: pB[0], y2: pA[1], class: "aide" }));
      g.appendChild(el("line", { x1: pB[0], y1: pA[1], x2: pB[0], y2: pB[1], class: "aide" }));
      if (Math.abs(pB[0] - pA[0]) > 26) {
        var th = el("text", { x: (pA[0] + pB[0]) / 2, y: pA[1] + (fb >= fa ? 14 : -6), "text-anchor": "middle", class: "etqAide" });
        th.textContent = "h";
        g.appendChild(th);
      }

      g.appendChild(el("circle", { cx: pA[0], cy: pA[1], r: 5, class: "pointA" }));
      g.appendChild(el("circle", { cx: pB[0], cy: pB[1], r: 5, class: "pointB" }));
      var etA = el("text", { x: pA[0] - 9, y: pA[1] - 9, "text-anchor": "end", class: "etq etqA" });
      etA.textContent = "A";
      g.appendChild(etA);
      if (Math.abs(pB[0] - pA[0]) > 14 || Math.abs(pB[1] - pA[1]) > 14) {
        var etB = el("text", { x: pB[0] + 9, y: pB[1] + (h > 0 ? 16 : -9), class: "etq etqB" });
        etB.textContent = "B";
        g.appendChild(etB);
      }

      // Lecture : formule substituée
      var dec = Math.abs(h) < 0.1 ? 3 : 2;
      var aTxt = fr(a, 2), xb = fr(a + h, dec + 1);
      // f(a+h) avec 6 décimales au plus : « = » si la valeur affichée est exacte, sinon « ≈ ».
      var fbExact = Math.abs(fb * 1e6 - Math.round(fb * 1e6)) < 1e-6;
      var fbTxt = fr(fb, 6);
      var faTxt = fr(fa, 4);
      var tauxTxt = (estExact(taux) ? "= " : "≈ ") + fr(taux, 4);
      var lecture = s.getElementById("lecture");
      lecture.innerHTML =
        '<div class="ligne-taux">taux = ' +
        '<span class="frac"><span>f(' + xb + ') − f(' + aTxt + ')</span><span>' + fr(h, dec) + '</span></span>' +
        (fbExact ? ' = ' : ' ≈ ') + '<span class="frac"><span>' + fbTxt + ' − ' + faTxt + '</span><span>' + fr(h, dec) + '</span></span> ' +
        '<span class="resultat">' + tauxTxt + '</span></div>' +
        '<p class="limite" id="limite"></p>';
      var lim = lecture.querySelector("#limite");
      if (this._tg) lim.textContent = "Quand h tend vers 0, le taux tend vers f'(" + aTxt + ") = " + fr(F.derivee, 2) + " : la sécante devient la tangente.";
      else { lim.textContent = "Rapproche h de 0, des deux côtés : vers quelle valeur le taux se stabilise-t-il ?"; lim.style.color = "var(--ink-soft,#6b6055)"; }

      // Tableau des taux repères
      var tbody = s.getElementById("tbody");
      tbody.innerHTML = "";
      var self = this;
      REPERES.forEach(function (rv) {
        var tr = document.createElement("tr");
        if (Math.abs(rv - h) < 1e-9) tr.className = "courant";
        var vu = self._vus[String(rv)];
        var t = (F.f(a + rv) - fa) / rv;
        var cellules = [fr(rv, 2), fr(a + rv, 2), vu ? (estExact(t) ? "" : "≈ ") + fr(t, 4) : "?"];
        cellules.forEach(function (c, j) {
          var td = document.createElement("td");
          td.textContent = c;
          if (j === 2 && !vu) td.className = "vide";
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
    }
  }

  if (!customElements.get("secante-tangente-widget")) {
    customElements.define("secante-tangente-widget", SecanteTangenteWidget);
  }
})();
