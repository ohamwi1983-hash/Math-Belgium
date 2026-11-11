(function () {
  "use strict";

  /* ================================================================
   * <echelle-semi-log-widget> — atelier interactif : la même croissance
   * exponentielle f(t) = C·e^(r·t) tracée en repère normal puis en repère
   * semi-logarithmique (axe vertical gradué 0,1 ; 1 ; 10 ; … à intervalles
   * égaux). En semi-log, la courbe devient une droite dont la pente se lit
   * directement : ln f(t) = ln C + r·t. Option : une 2ᵉ série pour comparer
   * deux croissances (en repère normal, l'une écrase l'autre ; en semi-log,
   * deux droites lisibles). Web Component (Shadow DOM).
   * ================================================================ */

  var DEFAUT = { c1: 100, r1: 0.05, c2: 50, r2: 0.2, deux: false };
  var T_MAX = 30;
  var LARGEUR = 340, HAUTEUR = 220;
  var MG = { g: 46, d: 14, h: 16, b: 30 };
  // Fenêtre semi-log FIXE : pire cas sur C ∈ [50 ; 500], r ∈ [−0,2 ; 0,3], t ∈ [0 ; 30] :
  // min 50·e^(−6) ≈ 0,124 ; max 500·e^9 ≈ 4,05 × 10⁶ — 8 décades de 0,1 à 10⁷.
  var DEC_MIN = -1, DEC_MAX = 7;
  var EXPOSANTS = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"];

  function fr(n, d) {
    var s = (Math.round(n * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d);
    var neg = s.charAt(0) === "-";
    if (neg) s = s.slice(1);
    var parts = s.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    s = parts.join(",");
    if (neg && /[1-9]/.test(s)) s = "−" + s;
    return s;
  }

  function puissance10(k) {
    if (k === -1) return "0,1";
    if (k === 0) return "1";
    if (k === 1) return "10";
    if (k === 2) return "100";
    if (k === 3) return "1 000";
    return "10" + EXPOSANTS[k];
  }

  // Palier rond (1, 2, 2,5, 5 × 10ⁿ) immédiatement au-dessus de v.
  function palier(v) {
    var e = Math.floor(Math.log10(v));
    var base = Math.pow(10, e);
    var choix = [1, 2, 2.5, 5, 10];
    for (var i = 0; i < choix.length; i++) if (choix[i] * base >= v) return choix[i] * base;
    return 10 * base;
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
    '.graphes{display:grid;grid-template-columns:1fr;gap:14px;margin-bottom:14px;}' +
    '@media (min-width:760px){.graphes{grid-template-columns:1fr 1fr;}}' +
    '.carte{display:flex;flex-direction:column;align-items:center;gap:4px;}' +
    '.titre-graphe{font-family:var(--mono,monospace);font-size:11px;letter-spacing:0.03em;color:var(--ink-soft,#6b6055);text-align:center;}' +
    'svg{width:100%;max-width:340px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.grille{stroke:var(--line,#e2d8c8);stroke-width:1;}' +
    '.sous-grille{stroke:var(--line,#e2d8c8);stroke-width:0.6;opacity:0.7;}' +
    '.grad{font-size:10px;font-family:var(--mono,monospace);fill:var(--ink-soft,#6b6055);}' +
    '.titre-axe{font-size:10.5px;font-family:var(--mono,monospace);fill:var(--ink-faint,#9c9083);}' +
    '.serie1{stroke:var(--accent,#a8471f);stroke-width:2.6;fill:none;}' +
    '.serie2{stroke:var(--good,#2f7a4f);stroke-width:2.6;fill:none;}' +
    '.leg1{fill:var(--accent-ink,#7a3212);font-size:11px;font-weight:600;}' +
    '.leg2{fill:var(--good,#2f7a4f);font-size:11px;font-weight:600;}' +
    '.annonce{font-size:0.86rem;color:var(--ink-soft,#6b6055);text-align:center;min-height:1.2em;}' +
    '.bilan{border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);background:var(--surface,#fff);padding:10px 12px;margin:4px 0 16px;font-size:0.94rem;line-height:1.5;}' +
    '.bilan p{margin:0 0 6px;}' +
    '.bilan p:last-child{margin-bottom:0;}' +
    '.s1{color:var(--accent-ink,#7a3212);font-weight:600;}' +
    '.s2{color:var(--good,#2f7a4f);font-weight:600;}' +
    '.curseurs{display:grid;grid-template-columns:1fr;gap:10px;}' +
    '@media (min-width:600px){.curseurs{grid-template-columns:1fr 1fr;}}' +
    '.curseur{display:flex;flex-direction:column;gap:4px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;text-align:center;}' +
    '.curseur.c1 label{color:var(--accent-ink,#7a3212);}' +
    '.curseur.c2 label{color:var(--good,#2f7a4f);}' +
    '.ligne{display:flex;align-items:center;gap:12px;min-height:44px;}' +
    '.ligne input[type="range"]{flex:1 1 auto;min-height:44px;accent-color:var(--accent,#a8471f);}' +
    '.curseur.c2 input[type="range"]{accent-color:var(--good,#2f7a4f);}' +
    '.valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;font-size:0.92rem;}' +
    '.case{display:flex;align-items:center;justify-content:center;gap:10px;min-height:44px;margin:10px 0 4px;font-weight:600;cursor:pointer;}' +
    '.case input{width:22px;height:22px;accent-color:var(--good,#2f7a4f);}' +
    '[hidden]{display:none!important;}' +
    '</style>' +
    '<div class="graphes">' +
    '<div class="carte"><div class="titre-graphe">REPÈRE NORMAL</div><svg id="normal" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '"></svg><div class="annonce" id="annonce"></div></div>' +
    '<div class="carte"><div class="titre-graphe">REPÈRE SEMI-LOGARITHMIQUE</div><svg id="semilog" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '"></svg><div class="annonce">une même distance = un même rapport (×10)</div></div>' +
    '</div>' +
    '<div class="bilan" id="bilan"></div>' +
    '<div class="curseurs">' +
    '<div class="curseur c1"><label for="c1">C — valeur de départ (série 1)</label><div class="ligne"><input type="range" id="c1" min="50" max="500" step="10"><span class="valeur" id="c1-v"></span></div></div>' +
    '<div class="curseur c1"><label for="r1">r — taux de croissance (série 1)</label><div class="ligne"><input type="range" id="r1" min="-0.2" max="0.3" step="0.01"><span class="valeur" id="r1-v"></span></div></div>' +
    '</div>' +
    '<label class="case"><input type="checkbox" id="deux"> Ajouter une 2ᵉ série</label>' +
    '<div class="curseurs" id="bloc2" hidden>' +
    '<div class="curseur c2"><label for="c2">C — valeur de départ (série 2)</label><div class="ligne"><input type="range" id="c2" min="50" max="500" step="10"><span class="valeur" id="c2-v"></span></div></div>' +
    '<div class="curseur c2"><label for="r2">r — taux de croissance (série 2)</label><div class="ligne"><input type="range" id="r2" min="-0.2" max="0.3" step="0.01"><span class="valeur" id="r2-v"></span></div></div>' +
    '</div>';

  class EchelleSemiLogWidget extends HTMLElement {
    constructor() {
      super();
      var sh = this.attachShadow({ mode: "open" });
      sh.appendChild(TEMPLATE.content.cloneNode(true));
      this._sh = sh;
      this._e = { c1: DEFAUT.c1, r1: DEFAUT.r1, c2: DEFAUT.c2, r2: DEFAUT.r2, deux: DEFAUT.deux };
    }

    connectedCallback() {
      var self = this, sh = this._sh;
      ["c1", "r1", "c2", "r2"].forEach(function (id) {
        var inp = sh.getElementById(id);
        inp.value = String(self._e[id]);
        inp.addEventListener("input", function () { self._e[id] = parseFloat(inp.value); self._rendre(); });
      });
      var cb = sh.getElementById("deux");
      cb.checked = this._e.deux;
      cb.addEventListener("change", function () { self._e.deux = cb.checked; self._rendre(); });
      this._rendre();
    }

    _series() {
      var e = this._e;
      var s = [{ c: e.c1, r: e.r1, classe: "serie1", leg: "leg1", nom: "série 1" }];
      if (e.deux) s.push({ c: e.c2, r: e.r2, classe: "serie2", leg: "leg2", nom: "série 2" });
      return s;
    }

    _axes(svg, yLabel) {
      var defs = svgEl("defs", {});
      var m = svgEl("marker", { id: "fl", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      m.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(m);
      svg.appendChild(defs);
      var bas = HAUTEUR - MG.b;
      svg.appendChild(svgEl("line", { x1: MG.g, y1: bas, x2: LARGEUR - 4, y2: bas, class: "axe", "marker-end": "url(#fl)" }));
      svg.appendChild(svgEl("line", { x1: MG.g, y1: bas, x2: MG.g, y2: 4, class: "axe", "marker-end": "url(#fl)" }));
      for (var t = 0; t <= T_MAX; t += 5) {
        var x = this._px(t);
        svg.appendChild(svgEl("line", { x1: x, y1: bas, x2: x, y2: bas + 4, class: "axe" }));
        var tx = svgEl("text", { x: x, y: bas + 15, "text-anchor": "middle", class: "grad" });
        tx.textContent = String(t);
        svg.appendChild(tx);
      }
      var lt = svgEl("text", { x: LARGEUR - 6, y: bas - 6, "text-anchor": "end", class: "titre-axe" });
      lt.textContent = "t";
      svg.appendChild(lt);
      var ly = svgEl("text", { x: MG.g + 6, y: 12, class: "titre-axe" });
      ly.textContent = yLabel;
      svg.appendChild(ly);
    }

    _px(t) { return MG.g + (t / T_MAX) * (LARGEUR - MG.g - MG.d); }

    _rendre() {
      var sh = this._sh, e = this._e;
      sh.getElementById("c1-v").textContent = fr(e.c1, 0);
      sh.getElementById("r1-v").textContent = fr(e.r1, 2);
      sh.getElementById("c2-v").textContent = fr(e.c2, 0);
      sh.getElementById("r2-v").textContent = fr(e.r2, 2);
      sh.getElementById("bloc2").hidden = !e.deux;
      var series = this._series();
      var self = this;
      var bas = HAUTEUR - MG.b, haut = MG.h;

      // --- repère normal : palier rond annoncé
      var maxV = 0;
      series.forEach(function (s) { maxV = Math.max(maxV, s.c, s.c * Math.exp(s.r * T_MAX)); });
      var yMax = palier(maxV * 1.05);
      var svgN = sh.getElementById("normal");
      svgN.innerHTML = "";
      this._axes(svgN, "f(t)");
      var pyN = function (v) { return bas - (v / yMax) * (bas - haut); };
      for (var i = 1; i <= 4; i++) {
        var v = yMax * i / 4;
        var y = pyN(v);
        svgN.appendChild(svgEl("line", { x1: MG.g, y1: y, x2: LARGEUR - MG.d, y2: y, class: "grille" }));
        var g = svgEl("text", { x: MG.g - 4, y: y + 3, "text-anchor": "end", class: "grad" });
        g.textContent = fr(v, v < 10 ? 1 : 0);
        svgN.appendChild(g);
      }
      var g0 = svgEl("text", { x: MG.g - 4, y: bas + 3, "text-anchor": "end", class: "grad" });
      g0.textContent = "0";
      svgN.appendChild(g0);
      series.forEach(function (s, k) {
        var d = "";
        for (var j = 0; j <= 120; j++) {
          var t = T_MAX * j / 120;
          d += (j ? "L" : "M") + self._px(t).toFixed(1) + " " + pyN(s.c * Math.exp(s.r * t)).toFixed(1) + " ";
        }
        svgN.appendChild(svgEl("path", { d: d, class: s.classe }));
      });
      sh.getElementById("annonce").textContent = "l'échelle verticale va jusqu'à " + fr(yMax, yMax < 10 ? 1 : 0);

      // --- repère semi-logarithmique : fenêtre fixe de 0,1 à 10⁷
      var svgL = sh.getElementById("semilog");
      svgL.innerHTML = "";
      this._axes(svgL, "f(t), échelle log");
      var pyL = function (v) { return bas - ((Math.log10(v) - DEC_MIN) / (DEC_MAX - DEC_MIN)) * (bas - haut); };
      for (var k = DEC_MIN; k <= DEC_MAX; k++) {
        var yk = pyL(Math.pow(10, k));
        svgL.appendChild(svgEl("line", { x1: MG.g, y1: yk, x2: LARGEUR - MG.d, y2: yk, class: "grille" }));
        var lk = svgEl("text", { x: MG.g - 4, y: yk + 3, "text-anchor": "end", class: "grad" });
        lk.textContent = puissance10(k);
        svgL.appendChild(lk);
        if (k < DEC_MAX) {
          for (var sgr = 2; sgr <= 9; sgr++) {
            var ys = pyL(sgr * Math.pow(10, k));
            svgL.appendChild(svgEl("line", { x1: MG.g, y1: ys, x2: MG.g + 5, y2: ys, class: "sous-grille" }));
          }
        }
      }
      series.forEach(function (s) {
        var p0 = [self._px(0), pyL(s.c)];
        var p1 = [self._px(T_MAX), pyL(s.c * Math.exp(s.r * T_MAX))];
        svgL.appendChild(svgEl("path", { d: "M" + p0[0].toFixed(1) + " " + p0[1].toFixed(1) + " L" + p1[0].toFixed(1) + " " + p1[1].toFixed(1), class: s.classe }));
      });
      // légendes (dans le coin supérieur droit du graphique normal)
      series.forEach(function (s, k) {
        var tl = svgEl("text", { x: LARGEUR - MG.d - 2, y: haut + 12 + 14 * k, "text-anchor": "end", class: s.leg });
        tl.textContent = s.nom;
        svgN.appendChild(tl);
      });

      // --- bilan
      var html = "";
      series.forEach(function (s, k) {
        var cls = k ? "s2" : "s1";
        var ligne = '<span class="' + cls + '">' + (series.length > 1 ? s.nom.charAt(0).toUpperCase() + s.nom.slice(1) + " — " : "") +
          "f(t) = " + fr(s.c, 0) + " · e<sup>" + fr(s.r, 2) + "·t</sup></span> : ln f(t) = ln " + fr(s.c, 0) + " + " + fr(s.r, 2).replace(/^−/, "(−") + (s.r < 0 ? ")" : "") + "·t, une droite. ";
        ligne += "Pente de ln f(t) = r = " + fr(s.r, 2) + " (taux relatif : " + fr(s.r * 100, 0) + " % par unité de t), soit " + fr(s.r / Math.LN10, 4) + " décade par unité de t. ";
        if (s.r > 0) ligne += "Temps de doublement : ln 2 / r ≈ " + fr(Math.LN2 / s.r, 2) + ". ";
        else if (s.r < 0) ligne += "Demi-vie : ln 2 / |r| ≈ " + fr(Math.LN2 / -s.r, 2) + ". ";
        else ligne += "r = 0 : la grandeur reste constante (droite horizontale). ";
        ligne += "f(" + T_MAX + ") ≈ " + fr(s.c * Math.exp(s.r * T_MAX), 1) + ".";
        html += "<p>" + ligne + "</p>";
      });
      if (series.length > 1) {
        var m1 = series[0].c * Math.exp(series[0].r * T_MAX), m2 = series[1].c * Math.exp(series[1].r * T_MAX);
        var rapport = Math.max(m1, m2) / Math.min(m1, m2);
        html += "<p>En t = " + T_MAX + ", une série vaut environ " + fr(rapport, rapport < 10 ? 1 : 0) + " fois l'autre : en repère normal, la plus petite est écrasée contre l'axe ; en semi-log, ce sont deux droites, et la plus raide est celle du plus grand taux.</p>";
      }
      sh.getElementById("bilan").innerHTML = html;
    }
  }

  if (!customElements.get("echelle-semi-log-widget")) customElements.define("echelle-semi-log-widget", EchelleSemiLogWidget);
})();
