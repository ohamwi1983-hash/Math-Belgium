(function () {
  "use strict";

  /* ================================================================
   * <rattrapage-exponentielle-widget> — atelier interactif (6e, ch. 2, § 1,
   * « La règle de dominance ») : aˣ face à xⁿ, pour x > 0, a et n réglables.
   * Les croisements sont calculés par bissection sur h(x) = x·ln a − n·ln x
   * (minimum en x = n / ln a) : deux croisements si ce minimum est négatif,
   * aucun sinon. Le plus grand est le DERNIER dépassement : à partir de lui,
   * aˣ reste au-dessus de xⁿ pour toujours. La fenêtre se règle UNIQUEMENT
   * par des sélecteurs (abscisses ; échelle verticale logarithmique ou
   * normale et, en normale, la hauteur) : les curseurs a et n ne la
   * recalculent jamais. En échelle logarithmique, aˣ est une droite et le
   * rattrapage reste visible même quand il a lieu vers x ≈ 1 000.
   * Web Component (Shadow DOM).
   * ================================================================ */

  var W = 340, H = 250, ML = 46, MR = 14, MT = 14, MB = 28;
  var FENETRES_X = [5, 10, 25, 50, 100, 500, 2000];
  // Haut de l'échelle logarithmique pour chaque fenêtre (exposant de 10), fixé à la main :
  // il contient xⁿ jusqu'au bord droit pour n ≤ 8, donc chaque croisement de la fenêtre.
  var HAUT_LOG = { 5: 6, 10: 8, 25: 12, 50: 14, 100: 16, 500: 22, 2000: 27 };
  var BAS_LOG = -1;
  var HAUTEURS_NORMALES = [10, 50, 200, 1000, 10000, 1000000];
  var SUP = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"];
  var DEFAUT = { a: Math.E, n: 3, ix: 1, log: true, iy: 2 };

  function fr(n, dec) {
    if (Math.abs(n) < 0.5 * Math.pow(10, -dec)) n = 0;
    var s = n.toFixed(dec);
    if (s.indexOf(".") >= 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
    var neg = s.charAt(0) === "-";
    if (neg) s = s.slice(1);
    var parts = s.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return (neg ? "−" : "") + parts.join(",");
  }
  function sup(n) { return String(n).split("").map(function (c) { return c === "-" ? "⁻" : SUP[+c]; }).join(""); }
  function puissance10(k) { return k === 0 ? "1" : k === 1 ? "10" : "10" + sup(k); }
  function nombreAxe(v) { return v >= 1e5 ? puissance10(Math.round(Math.log10(v))) : fr(v, 0); }
  function precision(x) { return x < 10 ? 2 : x < 100 ? 1 : 0; }

  function bissection(f, a, b) {
    var fa = f(a);
    for (var i = 0; i < 200; i++) {
      var m = (a + b) / 2, fm = f(m);
      if (fa * fm <= 0) b = m; else { a = m; fa = fm; }
    }
    return (a + b) / 2;
  }

  // Croisements de aˣ et xⁿ pour x > 0 : aˣ = xⁿ ⟺ h(x) = x·ln a − n·ln x = 0.
  function croisements(a, n) {
    var L = Math.log(a), xs = n / L;
    var h = function (x) { return x * L - n * Math.log(x); };
    if (h(xs) > 0) return null;
    return [bissection(h, 1e-12, xs), bissection(h, xs, xs * 100)];
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
    '.zone{display:flex;flex-direction:column;align-items:center;gap:4px;margin-bottom:8px;}' +
    'svg{width:100%;max-width:340px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);display:block;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.grille{stroke:var(--line,#e2d8c8);stroke-width:1;}' +
    '.tick{stroke:var(--ink-soft,#6b6055);stroke-width:1;}' +
    '.tick-label{font-size:9.5px;font-family:var(--mono,monospace);fill:var(--ink-faint,#9c9083);}' +
    '.nom-axe{font-size:10px;font-family:var(--mono,monospace);fill:var(--ink-soft,#6b6055);}' +
    '.c-exp{stroke:var(--accent,#a8471f);stroke-width:2.6;fill:none;}' +
    '.c-pol{stroke:var(--plan,#5b4ea3);stroke-width:2.4;fill:none;}' +
    '.devant{fill:var(--plan,#5b4ea3);opacity:0.13;}' +
    '.bande{stroke:var(--plan,#5b4ea3);stroke-width:5;stroke-linecap:butt;}' +
    '.croix{fill:var(--surface,#fff);stroke:var(--good,#2f7a4f);stroke-width:2.2;}' +
    '.croix-der{fill:var(--good,#2f7a4f);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.etiq-croix{font-size:10.5px;font-family:var(--mono,monospace);font-weight:700;fill:var(--good,#2f7a4f);paint-order:stroke;stroke:var(--surface-2,#faf6f0);stroke-width:3px;}' +
    '.repere{stroke:var(--good,#2f7a4f);stroke-width:1;stroke-dasharray:3 3;}' +
    '.legende{display:flex;flex-wrap:wrap;gap:4px 16px;justify-content:center;font-size:0.88rem;font-weight:600;}' +
    '.l-exp{color:var(--accent-ink,#7a3212);}' +
    '.l-pol{color:var(--plan-ink,#443a80);}' +
    '.trait{display:inline-block;width:18px;height:3px;vertical-align:middle;margin-right:5px;border-radius:2px;}' +
    '.t-exp{background:var(--accent,#a8471f);}' +
    '.t-pol{background:var(--plan,#5b4ea3);}' +
    '.t-dev{background:var(--plan,#5b4ea3);opacity:0.35;height:9px;}' +
    '.bilan{border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);background:var(--surface,#fff);padding:10px 12px;margin:6px 0 12px;font-size:0.93rem;line-height:1.5;}' +
    '.bilan p{margin:0 0 6px;}' +
    '.bilan p:last-child{margin-bottom:0;}' +
    '.cle{font-weight:700;color:var(--good,#2f7a4f);}' +
    '.curseur{display:flex;flex-direction:column;gap:4px;margin-top:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);text-align:center;}' +
    '.curseur.pol label{color:var(--plan-ink,#443a80);}' +
    '.ligne{display:flex;align-items:center;gap:12px;min-height:44px;}' +
    '.ligne input[type="range"]{flex:1 1 auto;min-height:44px;accent-color:var(--accent,#a8471f);}' +
    '.curseur.pol input[type="range"]{accent-color:var(--plan,#5b4ea3);}' +
    '.valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:64px;text-align:right;}' +
    '.boutons{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:4px 0;}' +
    'button{min-height:44px;min-width:56px;padding:6px 12px;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);background:var(--surface,#fff);color:var(--ink,#241f1a);font:inherit;font-weight:600;cursor:pointer;}' +
    '.reglages{display:flex;flex-wrap:wrap;gap:8px 14px;justify-content:center;margin-top:10px;}' +
    '.reglages label{display:flex;flex-direction:column;gap:4px;font-family:var(--mono,monospace);font-size:11px;color:var(--ink-faint,#9c9083);}' +
    'select{min-height:44px;font:inherit;font-size:0.93rem;padding:6px 10px;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);background:var(--surface,#fff);color:var(--ink,#241f1a);}' +
    'button:focus-visible,select:focus-visible,input:focus-visible{outline:2px solid var(--accent,#a8471f);outline-offset:2px;}' +
    '[hidden]{display:none!important;}' +
    '</style>' +
    '<div class="zone">' +
    '<svg id="svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Graphique de a puissance x et x puissance n"></svg>' +
    '<div class="legende"><span class="l-exp"><span class="trait t-exp"></span><span id="leg-exp"></span></span>' +
    '<span class="l-pol"><span class="trait t-pol"></span><span id="leg-pol"></span></span>' +
    '<span class="l-pol"><span class="trait t-dev"></span><span id="leg-dev"></span></span></div>' +
    '</div>' +
    '<div class="bilan" id="bilan" aria-live="polite"></div>' +
    '<div class="curseur"><label for="a">a — base de l’exponentielle</label><div class="ligne"><input type="range" id="a" min="1.05" max="3" step="0.01"><span class="valeur" id="a-v"></span></div></div>' +
    '<div class="boutons"><button type="button" data-a="e">a = e</button><button type="button" data-a="2">a = 2</button><button type="button" data-a="1.2">a = 1,2</button></div>' +
    '<div class="curseur pol"><label for="n">n — exposant du polynôme xⁿ</label><div class="ligne"><input type="range" id="n" min="1" max="8" step="1"><span class="valeur" id="n-v"></span></div></div>' +
    '<div class="reglages">' +
    '<label for="fx">abscisses<select id="fx"></select></label>' +
    '<label for="ech">échelle verticale<select id="ech"><option value="log">logarithmique</option><option value="normale">normale</option></select></label>' +
    '<label for="fy" id="bloc-fy">ordonnées<select id="fy"></select></label>' +
    '</div>';

  class RattrapageExponentielleWidget extends HTMLElement {
    constructor() {
      super();
      var sh = this.attachShadow({ mode: "open" });
      sh.appendChild(TEMPLATE.content.cloneNode(true));
      this._sh = sh;
      this._e = Object.assign({}, DEFAUT);
      var fx = sh.getElementById("fx"), fy = sh.getElementById("fy");
      FENETRES_X.forEach(function (x, i) {
        var o = document.createElement("option");
        o.value = String(i);
        o.textContent = "0 ≤ x ≤ " + fr(x, 0);
        fx.appendChild(o);
      });
      HAUTEURS_NORMALES.forEach(function (y, i) {
        var o = document.createElement("option");
        o.value = String(i);
        o.textContent = "jusqu’à " + nombreAxe(y);
        fy.appendChild(o);
      });
    }

    connectedCallback() {
      var self = this, sh = this._sh, st = this._e;
      var ia = sh.getElementById("a"), inn = sh.getElementById("n");
      var fx = sh.getElementById("fx"), fy = sh.getElementById("fy"), ech = sh.getElementById("ech");
      ia.value = String(st.a); inn.value = String(st.n);
      fx.value = String(st.ix); fy.value = String(st.iy); ech.value = st.log ? "log" : "normale";
      this._ecouteurs = [
        [ia, "input", function () { st.a = parseFloat(ia.value); self._rendre(); }],
        [inn, "input", function () { st.n = parseInt(inn.value, 10); self._rendre(); }],
        [fx, "change", function () { st.ix = parseInt(fx.value, 10); self._rendre(); }],
        [fy, "change", function () { st.iy = parseInt(fy.value, 10); self._rendre(); }],
        [ech, "change", function () { st.log = ech.value === "log"; self._rendre(); }],
      ];
      sh.querySelectorAll("button[data-a]").forEach(function (b) {
        self._ecouteurs.push([b, "click", function () {
          st.a = b.dataset.a === "e" ? Math.E : parseFloat(b.dataset.a);
          ia.value = String(st.a);
          self._rendre();
        }]);
      });
      this._ecouteurs.forEach(function (e) { e[0].addEventListener(e[1], e[2]); });
      this._rendre();
    }

    disconnectedCallback() {
      (this._ecouteurs || []).forEach(function (e) { e[0].removeEventListener(e[1], e[2]); });
    }

    _rendre() {
      var sh = this._sh, st = this._e;
      var a = st.a, n = st.n, X = FENETRES_X[st.ix];
      var estE = Math.abs(a - Math.E) < 1e-9;
      var nomA = estE ? "e" : fr(a, 2);
      var nomPol = n === 1 ? "x" : "x" + sup(n);
      sh.getElementById("a-v").textContent = estE ? "e ≈ 2,718" : fr(a, 2);
      sh.getElementById("n-v").textContent = String(n);
      sh.getElementById("leg-exp").textContent = nomA + "ˣ";
      sh.getElementById("leg-pol").textContent = nomPol;
      sh.getElementById("leg-dev").textContent = nomPol + " devant";
      sh.getElementById("bloc-fy").hidden = st.log;

      // Fenêtre : uniquement depuis les sélecteurs.
      var yBas, yHaut, Y;
      if (st.log) { yBas = BAS_LOG; yHaut = HAUT_LOG[X]; }
      else { Y = HAUTEURS_NORMALES[st.iy]; yBas = -0.08 * Y; yHaut = Y; }
      var tr = function (y) { return st.log ? (y > 0 ? Math.log10(y) : -Infinity) : y; };
      var px = function (x) { return ML + x / X * (W - ML - MR); };
      var py = function (v) { return H - MB - (v - yBas) / (yHaut - yBas) * (H - MT - MB); };

      var svg = sh.getElementById("svg");
      svg.innerHTML = "";
      var defs = svgEl("defs", {});
      var m = svgEl("marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      m.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(m);
      var clip = svgEl("clipPath", { id: "cadre" });
      clip.appendChild(svgEl("rect", { x: ML, y: MT, width: W - ML - MR, height: H - MT - MB }));
      defs.appendChild(clip);
      svg.appendChild(defs);

      // Graduations verticales
      var yAxeX = st.log ? py(BAS_LOG) : py(0);
      var ticksY = [];
      if (st.log) {
        var pas = yHaut <= 8 ? 2 : yHaut <= 16 ? 4 : 5;
        for (var k = 0; k <= yHaut; k += pas) ticksY.push({ v: k, t: puissance10(k) });
      } else {
        for (var j = 1; j <= 4; j++) ticksY.push({ v: Y * j / 4, t: nombreAxe(Y * j / 4) });
      }
      ticksY.forEach(function (tk) {
        var y = py(tk.v).toFixed(1);
        svg.appendChild(svgEl("line", { x1: ML, x2: W - MR, y1: y, y2: y, class: "grille" }));
        svg.appendChild(svgEl("line", { x1: ML - 3, x2: ML + 3, y1: y, y2: y, class: "tick" }));
        var tx = svgEl("text", { x: ML - 5, y: (+y + 3).toFixed(1), "text-anchor": "end", class: "tick-label" });
        tx.textContent = tk.t;
        svg.appendChild(tx);
      });
      // Graduations horizontales : 5 graduations régulières
      for (var i = 1; i <= 5; i++) {
        var xv = X * i / 5, xp = px(xv).toFixed(1);
        svg.appendChild(svgEl("line", { x1: xp, x2: xp, y1: yAxeX - 3, y2: yAxeX + 3, class: "tick" }));
        var t2 = svgEl("text", { x: i === 5 ? (px(xv) - 2).toFixed(1) : xp, y: (yAxeX + 13).toFixed(1), "text-anchor": i === 5 ? "end" : "middle", class: "tick-label" });
        t2.textContent = fr(xv, 0);
        svg.appendChild(t2);
      }
      svg.appendChild(svgEl("line", { x1: ML - 4, x2: W - 4, y1: yAxeX.toFixed(1), y2: yAxeX.toFixed(1), class: "axe", "marker-end": "url(#fleche)" }));
      svg.appendChild(svgEl("line", { x1: ML, x2: ML, y1: H - MB + 6, y2: 4, class: "axe", "marker-end": "url(#fleche)" }));
      var nx = svgEl("text", { x: W - 6, y: (yAxeX - 6).toFixed(1), "text-anchor": "end", class: "nom-axe" });
      nx.textContent = "x";
      svg.appendChild(nx);
      var ny = svgEl("text", { x: ML + 6, y: 11, class: "nom-axe" });
      ny.textContent = st.log ? "y (échelle logarithmique)" : "y";
      svg.appendChild(ny);

      var g = svgEl("g", { "clip-path": "url(#cadre)" });
      svg.appendChild(g);
      var C = croisements(a, n);

      // Zone où xⁿ est devant : bande sous les courbes + trait épais sur l'axe des x.
      if (C && C[0] < X) {
        var x1 = C[0], x2 = Math.min(C[1], X);
        var dz = "", N0 = 120;
        for (var q = 0; q <= N0; q++) {
          var xq = x1 + (x2 - x1) * q / N0;
          dz += (q ? "L" : "M") + px(xq).toFixed(1) + " " + py(Math.min(yHaut + 1, Math.max(yBas, tr(Math.pow(xq, n))))).toFixed(1) + " ";
        }
        for (var q2 = N0; q2 >= 0; q2--) {
          var xr = x1 + (x2 - x1) * q2 / N0;
          dz += "L" + px(xr).toFixed(1) + " " + py(Math.min(yHaut + 1, Math.max(yBas, tr(Math.pow(a, xr))))).toFixed(1) + " ";
        }
        g.appendChild(svgEl("path", { d: dz + "Z", class: "devant" }));
        svg.appendChild(svgEl("line", { x1: px(x1).toFixed(1), x2: px(x2).toFixed(1), y1: yAxeX.toFixed(1), y2: yAxeX.toFixed(1), class: "bande" }));
      }

      var courbe = function (f, classe) {
        var d = "", ouvert = false, N = 500;
        for (var s = 0; s <= N; s++) {
          var x = X * s / N;
          var v = tr(f(x));
          if (!isFinite(v) || v < yBas - (yHaut - yBas)) { ouvert = false; continue; }
          v = Math.min(v, yHaut + (yHaut - yBas));
          d += (ouvert ? "L" : "M") + px(x).toFixed(1) + " " + py(v).toFixed(1) + " ";
          ouvert = true;
        }
        g.appendChild(svgEl("path", { d: d, class: classe }));
      };
      courbe(function (x) { return Math.pow(x, n); }, "c-pol");
      courbe(function (x) { return Math.pow(a, x); }, "c-exp");

      // Croisements : le dernier (à partir duquel aˣ reste devant) est plein. Chaque croisement est
      // relié à l'axe des x par un pointillé, et son abscisse est écrite juste au-dessus de l'axe, à
      // l'écart des courbes (le premier n'est écrit que s'il reste lisible à côté du second).
      if (C) {
        C.forEach(function (xc, r) {
          if (xc > X) return;
          var v = tr(Math.pow(a, xc));
          if (v > yHaut || v < yBas) return;
          var cx = px(xc), cy = py(v);
          g.appendChild(svgEl("line", { x1: cx.toFixed(1), x2: cx.toFixed(1), y1: cy.toFixed(1), y2: yAxeX.toFixed(1), class: "repere" }));
          svg.appendChild(svgEl("circle", { cx: cx.toFixed(1), cy: cy.toFixed(1), r: 4.5, class: r === 1 ? "croix-der" : "croix" }));
          if (cx - ML < 16) return;
          if (r === 0 && C[1] <= X && px(C[1]) - cx < 62) return;
          var droite = cx < W - 80;
          var lt = svgEl("text", {
            x: (droite ? cx + 8 : cx - 8).toFixed(1), y: (yAxeX - 9).toFixed(1),
            "text-anchor": droite ? "start" : "end", class: "etiq-croix",
          });
          lt.textContent = "x ≈ " + fr(xc, precision(xc));
          svg.appendChild(lt);
        });
      }

      // Bilan
      var html = "";
      if (!C) {
        html += "<p>Pour a = " + nomA + " et n = " + n + ", " + nomA + "ˣ est au-dessus de " + nomPol +
          " pour tout x &gt; 0 : le polynôme n’est jamais devant, il n’y a rien à rattraper.</p>";
      } else {
        html += "<p>" + nomPol + " passe devant en x ≈ " + fr(C[0], precision(C[0])) + ", puis " + nomA +
          "ˣ le rattrape en x ≈ " + fr(C[1], precision(C[1])) + ".</p>";
        html += '<p><span class="cle">À partir de x ≈ ' + fr(C[1], precision(C[1])) + ", " + nomA + "ˣ reste au-dessus de " + nomPol + " pour toujours.</span>";
        if (C[1] > X) html += " Ce dernier dépassement est au-delà de la fenêtre (x ≤ " + fr(X, 0) + ") : élargis les abscisses pour le voir.";
        else if (!st.log && Math.pow(a, C[1]) > Y) html += " Le point de rattrapage est plus haut que la fenêtre : monte les ordonnées ou passe en échelle logarithmique.";
        html += "</p>";
      }
      html += "<p>Plus a est proche de 1, ou plus n est grand, plus le rattrapage est tardif — mais il arrive toujours : " +
        nomPol + " / " + nomA + "ˣ tend vers 0 quand x tend vers +∞.</p>";
      sh.getElementById("bilan").innerHTML = html;
    }
  }

  if (!customElements.get("rattrapage-exponentielle-widget")) customElements.define("rattrapage-exponentielle-widget", RattrapageExponentielleWidget);
})();
