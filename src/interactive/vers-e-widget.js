(function () {
  "use strict";

  /* ================================================================
   * <vers-e-widget> — atelier interactif (6e, ch. 2, § 2, juste après la
   * définition de e et l'encadré historique sur Bernoulli). Deux modes :
   *  1) « (1 + 1/n)ⁿ » : n réglable de 1 à 10⁹ par un curseur
   *     LOGARITHMIQUE ; valeur, chiffres déjà corrects, écart à e, graphique
   *     (abscisses en puissances de 10) et tableau de repères.
   *  2) « Intérêts composés » : 1 000 € placés un an à 100 %, intérêts
   *     versés n fois par an (annuel … chaque seconde). Capital en escalier
   *     au fil de l'année, courbe limite K₀·eᵗ, tableau des capitaux finals
   *     qui se rapprochent de K₀·e ≈ 2 718,28 €.
   * Calcul : exp(n·log1p(1/n)), et non Math.pow(1 + 1/n, n), qui perd ses
   * chiffres pour n grand (à n = 10⁹, il dépasse e). Fenêtres FIXES par
   * mode, jamais recalculées depuis le curseur. Web Component (Shadow DOM).
   * ================================================================ */

  var W = 340, H = 220, ML = 44, MR = 14, MT = 14, MB = 26;
  var SUP = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"];
  var K0 = 1000;
  var REPERES = [1, 10, 100, 1000, 10000, 1e6, 1e9];
  var FREQUENCES = [
    { nom: "année", n: 1 },
    { nom: "semestre", n: 2 },
    { nom: "trimestre", n: 4 },
    { nom: "mois", n: 12 },
    { nom: "semaine", n: 52 },
    { nom: "jour", n: 365 },
    { nom: "heure", n: 8760 },
    { nom: "minute", n: 525600 },
    { nom: "seconde", n: 31536000 },
  ];
  // Fenêtres fixes.
  var WIN1 = { xMin: -0.3, xMax: 9.4, yMin: 1.9, yMax: 2.85 };
  var WIN2 = { xMin: -0.04, xMax: 1.08, yMin: 0, yMax: 3100 };

  function valeur(n) { return Math.exp(n * Math.log1p(1 / n)); }
  function sup(n) { return String(n).split("").map(function (c) { return SUP[+c]; }).join(""); }
  function entier(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " "); }
  function puissance10(k) { return k === 0 ? "1" : k === 1 ? "10" : "10" + sup(k); }
  function nomN(n) { var k = Math.log10(n); return Math.abs(k - Math.round(k)) < 1e-12 && k >= 4 ? puissance10(Math.round(k)) : entier(n); }

  // Décimales groupées par trois : 2,718 281 828.
  function decimal(v, dec) {
    var s = v.toFixed(dec), neg = s.charAt(0) === "-";
    if (neg) s = s.slice(1);
    var p = s.split(".");
    var ent = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    var fr = p[1] ? p[1].replace(/(\d{3})(?=\d)/g, "$1 ") : "";
    return (neg ? "−" : "") + ent + (fr ? "," + fr : "");
  }
  // Deux chiffres significatifs pour un écart positif (petit ou grand).
  function ecart(x) {
    if (x >= 10) return decimal(x, 2);
    var dec = Math.max(2, Math.ceil(-Math.log10(x)) + 1);
    return decimal(x, Math.min(dec, 14));
  }
  function pourcent(n) {
    var p = 100 / n;
    if (p >= 1) return decimal(p, p === Math.round(p) ? 0 : 2) + " %";
    var dec = Math.ceil(-Math.log10(p)) + 1;
    return decimal(p, dec) + " %";
  }

  function svgEl(tag, attrs) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}' +
    '*{box-sizing:border-box;}' +
    '.modes{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-bottom:10px;}' +
    'button{min-height:44px;padding:6px 12px;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);background:var(--surface,#fff);color:var(--ink,#241f1a);font:inherit;font-weight:600;cursor:pointer;}' +
    'button[aria-pressed="true"]{background:var(--accent-soft,#f4e3d1);border-color:var(--accent,#a8471f);color:var(--accent-ink,#7a3212);}' +
    'button:focus-visible,input:focus-visible{outline:2px solid var(--accent,#a8471f);outline-offset:2px;}' +
    '.zone{display:flex;flex-direction:column;align-items:center;gap:4px;margin-bottom:8px;}' +
    'svg{width:100%;max-width:340px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);display:block;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.grille{stroke:var(--line,#e2d8c8);stroke-width:1;}' +
    '.tick{stroke:var(--ink-soft,#6b6055);stroke-width:1;}' +
    '.tick-label{font-size:9.5px;font-family:var(--mono,monospace);fill:var(--ink-faint,#9c9083);}' +
    '.nom-axe{font-size:10px;font-family:var(--mono,monospace);fill:var(--ink-soft,#6b6055);}' +
    '.limite{stroke:var(--good,#2f7a4f);stroke-width:1.6;stroke-dasharray:6 4;fill:none;}' +
    '.etiq-limite{font-size:11px;font-weight:700;fill:var(--good,#2f7a4f);}' +
    '.courbe{stroke:var(--accent,#a8471f);stroke-width:2.4;fill:none;}' +
    '.repere{fill:var(--accent,#a8471f);opacity:0.45;}' +
    '.point{fill:var(--accent,#a8471f);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.guide{stroke:var(--accent,#a8471f);stroke-width:1;stroke-dasharray:3 3;}' +
    '.formule{font-family:var(--serif,serif);font-size:1rem;font-weight:700;color:var(--accent-ink,#7a3212);text-align:center;margin:2px 0;word-break:break-all;}' +
    '.stats{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:6px 0 10px;}' +
    '.stat{flex:1 1 140px;min-width:0;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:8px 6px;text-align:center;background:var(--surface,#fff);}' +
    '.stat-label{display:block;font-family:var(--mono,monospace);font-size:10px;color:var(--ink-faint,#9c9083);margin-bottom:5px;}' +
    '.stat-value{display:block;font-variant-numeric:tabular-nums;font-size:0.94rem;font-weight:600;color:var(--accent-ink,#7a3212);}' +
    '.stat-value.limite-v{color:var(--good,#2f7a4f);}' +
    '.ok{color:var(--good,#2f7a4f);font-weight:800;}' +
    '.curseur{display:flex;flex-direction:column;gap:4px;margin-top:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);text-align:center;}' +
    '.ligne{display:flex;align-items:center;gap:12px;min-height:44px;}' +
    '.ligne input[type="range"]{flex:1 1 auto;min-height:44px;accent-color:var(--accent,#a8471f);}' +
    '.valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:96px;text-align:right;font-size:0.9rem;}' +
    '.boutons{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:6px 0;}' +
    '.table-zone{overflow-x:auto;margin-top:8px;}' +
    'table{border-collapse:collapse;margin:0 auto;font-size:12.5px;font-variant-numeric:tabular-nums;}' +
    'th,td{padding:4px 6px;text-align:right;white-space:nowrap;border-bottom:1px solid var(--line,#e2d8c8);}' +
    'th{font-family:var(--mono,monospace);font-size:11px;font-weight:600;color:var(--ink-soft,#6b6055);}' +
    'td:first-child,th:first-child{text-align:left;}' +
    'tr.actif td{background:var(--accent-soft,#f4e3d1);color:var(--accent-ink,#7a3212);font-weight:700;}' +
    '.note{font-size:0.88rem;color:var(--ink-soft,#6b6055);text-align:center;margin:8px 0 0;line-height:1.45;}' +
    '[hidden]{display:none!important;}' +
    '</style>' +
    '<div class="modes" role="group" aria-label="Mode"><button type="button" id="m1" aria-pressed="true">(1 + 1/n)ⁿ</button><button type="button" id="m2" aria-pressed="false">Intérêts composés</button></div>' +
    '<div class="zone"><svg id="svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Graphique"></svg><p class="formule" id="formule"></p></div>' +
    '<div class="stats" id="stats"></div>' +
    '<div id="ctl1">' +
    '<div class="curseur"><label for="k">n — curseur logarithmique, de 1 à 10⁹</label><div class="ligne"><input type="range" id="k" min="0" max="9" step="0.01"><span class="valeur" id="k-v"></span></div></div>' +
    '<div class="boutons" id="raccourcis"></div>' +
    '</div>' +
    '<div id="ctl2" hidden>' +
    '<div class="curseur"><label for="f">fréquence des versements d’intérêts</label><div class="ligne"><input type="range" id="f" min="0" max="' + (FREQUENCES.length - 1) + '" step="1"><span class="valeur" id="f-v"></span></div></div>' +
    '</div>' +
    '<div class="table-zone"><table id="table"></table></div>' +
    '<p class="note" id="note"></p>';

  class VersEWidget extends HTMLElement {
    constructor() {
      super();
      var sh = this.attachShadow({ mode: "open" });
      sh.appendChild(TEMPLATE.content.cloneNode(true));
      this._sh = sh;
      this._mode = 1;
      this._k = 1; // n = 10
      this._f = 3; // chaque mois
      var rac = sh.getElementById("raccourcis");
      REPERES.forEach(function (n) {
        var b = document.createElement("button");
        b.type = "button";
        b.dataset.k = String(Math.log10(n));
        b.textContent = "n = " + nomN(n);
        rac.appendChild(b);
      });
    }

    connectedCallback() {
      var self = this, sh = this._sh;
      var ik = sh.getElementById("k"), iff = sh.getElementById("f");
      ik.value = String(this._k);
      iff.value = String(this._f);
      this._ecouteurs = [
        [sh.getElementById("m1"), "click", function () { self._mode = 1; self._rendre(); }],
        [sh.getElementById("m2"), "click", function () { self._mode = 2; self._rendre(); }],
        [ik, "input", function () { self._k = parseFloat(ik.value); self._rendre(); }],
        [iff, "input", function () { self._f = parseInt(iff.value, 10); self._rendre(); }],
      ];
      sh.querySelectorAll("#raccourcis button").forEach(function (b) {
        self._ecouteurs.push([b, "click", function () { self._k = parseFloat(b.dataset.k); ik.value = b.dataset.k; self._rendre(); }]);
      });
      this._ecouteurs.forEach(function (e) { e[0].addEventListener(e[1], e[2]); });
      this._rendre();
    }

    disconnectedCallback() {
      (this._ecouteurs || []).forEach(function (e) { e[0].removeEventListener(e[1], e[2]); });
    }

    _rendre() {
      var sh = this._sh;
      sh.getElementById("m1").setAttribute("aria-pressed", String(this._mode === 1));
      sh.getElementById("m2").setAttribute("aria-pressed", String(this._mode === 2));
      sh.getElementById("ctl1").hidden = this._mode !== 1;
      sh.getElementById("ctl2").hidden = this._mode !== 2;
      if (this._mode === 1) this._rendreSuite(); else this._rendreInterets();
    }

    _cadre(win, xTicks, yTicks, nomX, nomY) {
      var svg = this._sh.getElementById("svg");
      svg.innerHTML = "";
      var px = function (x) { return ML + (x - win.xMin) / (win.xMax - win.xMin) * (W - ML - MR); };
      var py = function (y) { return H - MB - (y - win.yMin) / (win.yMax - win.yMin) * (H - MT - MB); };
      var defs = svgEl("defs", {});
      var m = svgEl("marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      m.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(m);
      var clip = svgEl("clipPath", { id: "cadre" });
      clip.appendChild(svgEl("rect", { x: ML, y: MT, width: W - ML - MR, height: H - MT - MB }));
      defs.appendChild(clip);
      svg.appendChild(defs);
      var x0 = px(Math.max(win.xMin, 0)), yAxe = py(win.yMin);
      yTicks.forEach(function (t) {
        var y = py(t.v).toFixed(1);
        svg.appendChild(svgEl("line", { x1: ML, x2: W - MR, y1: y, y2: y, class: "grille" }));
        svg.appendChild(svgEl("line", { x1: x0 - 3, x2: x0 + 3, y1: y, y2: y, class: "tick" }));
        var tx = svgEl("text", { x: x0 - 5, y: (+y + 3).toFixed(1), "text-anchor": "end", class: "tick-label" });
        tx.textContent = t.t;
        svg.appendChild(tx);
      });
      xTicks.forEach(function (t) {
        var x = px(t.v).toFixed(1);
        svg.appendChild(svgEl("line", { x1: x, x2: x, y1: yAxe - 3, y2: yAxe + 3, class: "tick" }));
        var tx = svgEl("text", { x: x, y: (yAxe + 13).toFixed(1), "text-anchor": "middle", class: "tick-label" });
        tx.textContent = t.t;
        svg.appendChild(tx);
      });
      svg.appendChild(svgEl("line", { x1: ML - 4, x2: W - 4, y1: yAxe.toFixed(1), y2: yAxe.toFixed(1), class: "axe", "marker-end": "url(#fleche)" }));
      svg.appendChild(svgEl("line", { x1: x0.toFixed(1), x2: x0.toFixed(1), y1: H - MB + 6, y2: 4, class: "axe", "marker-end": "url(#fleche)" }));
      var nx = svgEl("text", { x: W - 6, y: (yAxe - 6).toFixed(1), "text-anchor": "end", class: "nom-axe" });
      nx.textContent = nomX;
      svg.appendChild(nx);
      var ny = svgEl("text", { x: (x0 + 8).toFixed(1), y: 11, class: "nom-axe" });
      ny.textContent = nomY;
      svg.appendChild(ny);
      var g = svgEl("g", { "clip-path": "url(#cadre)" });
      svg.appendChild(g);
      return { svg: svg, g: g, px: px, py: py };
    }

    // ---------------- mode 1 : (1 + 1/n)ⁿ
    _rendreSuite() {
      var sh = this._sh;
      var n = Math.round(Math.pow(10, this._k));
      var v = valeur(n);
      sh.getElementById("k-v").textContent = "n = " + nomN(n);
      var xTicks = [], yTicks = [];
      for (var k = 0; k <= 9; k++) xTicks.push({ v: k, t: puissance10(k) });
      [2, 2.2, 2.4, 2.6].forEach(function (y) { yTicks.push({ v: y, t: decimal(y, 1) }); });
      var c = this._cadre(WIN1, xTicks, yTicks, "n", "(1 + 1/n)ⁿ");
      var ye = c.py(Math.E).toFixed(1);
      c.g.appendChild(svgEl("line", { x1: ML, x2: W - MR, y1: ye, y2: ye, class: "limite" }));
      var le = svgEl("text", { x: W - MR - 4, y: (+ye - 6).toFixed(1), "text-anchor": "end", class: "etiq-limite" });
      le.textContent = "e ≈ 2,718";
      c.svg.appendChild(le);
      var d = "";
      for (var s = 0; s <= 300; s++) {
        var kk = 9 * s / 300;
        d += (s ? "L" : "M") + c.px(kk).toFixed(1) + " " + c.py(valeur(Math.pow(10, kk))).toFixed(1) + " ";
      }
      c.g.appendChild(svgEl("path", { d: d, class: "courbe" }));
      REPERES.forEach(function (r) {
        c.g.appendChild(svgEl("circle", { cx: c.px(Math.log10(r)).toFixed(1), cy: c.py(valeur(r)).toFixed(1), r: 3, class: "repere" }));
      });
      var cx = c.px(Math.log10(n)), cy = c.py(v);
      c.g.appendChild(svgEl("line", { x1: ML, x2: cx.toFixed(1), y1: cy.toFixed(1), y2: cy.toFixed(1), class: "guide" }));
      c.g.appendChild(svgEl("circle", { cx: cx.toFixed(1), cy: cy.toFixed(1), r: 5.5, class: "point" }));

      sh.getElementById("formule").textContent = "(1 + 1/" + entier(n) + ")" + sup(n);
      // Chiffres déjà corrects : préfixe commun avec e, à 9 décimales.
      var sv = decimal(v, 9), se = decimal(Math.E, 9), i = 0;
      while (i < sv.length && sv.charAt(i) === se.charAt(i)) i++;
      while (i > 0 && !/\d/.test(sv.charAt(i - 1))) i--;
      var html = '<span class="ok">' + sv.slice(0, i) + "</span>" + sv.slice(i);
      sh.getElementById("stats").innerHTML =
        '<div class="stat"><span class="stat-label">(1 + 1/n)ⁿ ≈</span><span class="stat-value">' + html + "</span></div>" +
        '<div class="stat"><span class="stat-label">e ≈</span><span class="stat-value limite-v">' + se + "</span></div>" +
        '<div class="stat"><span class="stat-label">écart à e</span><span class="stat-value">' + ecart(Math.E - v) + "</span></div>";

      var t = "<tr><th>n</th><th>(1 + 1/n)ⁿ</th></tr>";
      REPERES.forEach(function (r) {
        t += '<tr class="' + (r === n ? "actif" : "") + '"><td>' + nomN(r) + "</td><td>" + decimal(valeur(r), 9) + "</td></tr>";
      });
      sh.getElementById("table").innerHTML = t;
      sh.getElementById("note").textContent =
        "En vert, les chiffres déjà corrects. Multiplier n par 10 divise l’écart à e par 10 environ : la suite approche e, mais lentement, et ne l’atteint jamais.";
    }

    // ---------------- mode 2 : intérêts composés
    _rendreInterets() {
      var sh = this._sh;
      var fq = FREQUENCES[this._f], n = fq.n;
      var Kf = K0 * valeur(n), Ke = K0 * Math.E;
      sh.getElementById("f-v").textContent = "n = " + entier(n);
      var xTicks = [{ v: 0.25, t: "3 mois" }, { v: 0.5, t: "6 mois" }, { v: 0.75, t: "9 mois" }, { v: 1, t: "1 an" }];
      var yTicks = [1000, 2000, 3000].map(function (y) { return { v: y, t: entier(y) }; });
      var c = this._cadre(WIN2, xTicks, yTicks, "t", "capital (€)");
      // Courbe limite K₀·eᵗ et niveau K₀·e.
      var dl = "";
      for (var s = 0; s <= 100; s++) { var tt = s / 100; dl += (s ? "L" : "M") + c.px(tt).toFixed(1) + " " + c.py(K0 * Math.exp(tt)).toFixed(1) + " "; }
      c.g.appendChild(svgEl("path", { d: dl, class: "limite" }));
      var ye = c.py(Ke).toFixed(1);
      c.g.appendChild(svgEl("line", { x1: c.px(0).toFixed(1), x2: c.px(1.06).toFixed(1), y1: ye, y2: ye, class: "limite" }));
      var le = svgEl("text", { x: c.px(0.02).toFixed(1), y: (+ye - 6).toFixed(1), "text-anchor": "start", class: "etiq-limite" });
      le.textContent = "K₀·e ≈ 2 718,28 €";
      c.svg.appendChild(le);
      // Capital au fil de l'année : un palier par versement (lisse au-delà de 365 versements).
      var d = "M" + c.px(0).toFixed(1) + " " + c.py(K0).toFixed(1) + " ";
      if (n <= 365) {
        for (var j = 1; j <= n; j++) {
          var xj = c.px(j / n).toFixed(1);
          d += "L" + xj + " " + c.py(K0 * Math.exp((j - 1) * Math.log1p(1 / n))).toFixed(1) + " ";
          d += "L" + xj + " " + c.py(K0 * Math.exp(j * Math.log1p(1 / n))).toFixed(1) + " ";
        }
      } else {
        for (var q = 1; q <= 200; q++) { var tq = q / 200; d += "L" + c.px(tq).toFixed(1) + " " + c.py(K0 * Math.exp(n * tq * Math.log1p(1 / n))).toFixed(1) + " "; }
      }
      c.g.appendChild(svgEl("path", { d: d, class: "courbe" }));
      c.g.appendChild(svgEl("circle", { cx: c.px(1).toFixed(1), cy: c.py(Kf).toFixed(1), r: 5.5, class: "point" }));

      sh.getElementById("formule").textContent = entier(K0) + "·(1 + 1/" + entier(n) + ")" + sup(n) + " ≈ " + decimal(Kf, 2) + " €";
      sh.getElementById("stats").innerHTML =
        '<div class="stat"><span class="stat-label">versé chaque ' + fq.nom + "</span><span class=\"stat-value\">" + pourcent(n) + " d’intérêt</span></div>" +
        '<div class="stat"><span class="stat-label">capital après un an</span><span class="stat-value">' + decimal(Kf, 2) + " €</span></div>" +
        '<div class="stat"><span class="stat-label">il manque pour K₀·e</span><span class="stat-value limite-v">' + ecart(Ke - Kf) + " €</span></div>";
      var self = this;
      var t = "<tr><th>versé chaque</th><th>n</th><th>capital final</th></tr>";
      FREQUENCES.forEach(function (f, i) {
        t += '<tr class="' + (i === self._f ? "actif" : "") + '"><td>' + f.nom + "</td><td>" + entier(f.n) + "</td><td>" + decimal(K0 * valeur(f.n), 2) + " €</td></tr>";
      });
      sh.getElementById("table").innerHTML = t;
      sh.getElementById("note").textContent =
        "K₀ = 1 000 € placés un an à 100 % : chaque versement ajoute 100 %/n du capital du moment. Verser plus souvent rapporte plus, mais jamais plus que K₀·e ≈ 2 718,28 €.";
    }
  }

  if (!customElements.get("vers-e-widget")) customElements.define("vers-e-widget", VersEWidget);
})();
