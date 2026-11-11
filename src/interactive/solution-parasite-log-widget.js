(function () {
  "use strict";

  /* ================================================================
   * <solution-parasite-log-widget> — atelier interactif (6e, ch. 3,
   * sections 1–2) : pourquoi regrouper des logarithmes peut faire
   * apparaître une solution parasite. Deux modes :
   *  - ln(x) + ln(x − 3) (domaine ]3 ; +∞[) contre ln(x(x − 3)) (domaine
   *    ]−∞ ; 0[ ∪ ]3 ; +∞[) ;
   *  - 2·ln(x) (domaine ]0 ; +∞[) contre ln(x²) (domaine ℝ₀).
   * Sur la partie commune des domaines, les deux courbes coïncident ; la
   * forme regroupée existe en plus sur une autre branche, où la droite
   * y = k la coupe une seconde fois : c'est la solution parasite. Fenêtres
   * FIXES par mode. Web Component (Shadow DOM).
   * ================================================================ */

  var LN = Math.log;
  var MODES = [
    {
      id: "somme",
      onglet: "ln(x) + ln(x − 3)",
      depart: "ln(x) + ln(x − 3)",
      regroupe: "ln(x(x − 3))",
      domDepart: "]3 ; +∞[",
      domRegroupe: "]−∞ ; 0[ ∪ ]3 ; +∞[",
      f: function (x) { return x > 3 ? LN(x) + LN(x - 3) : NaN; },
      g: function (x) { var p = x * (x - 3); return p > 0 ? LN(p) : NaN; },
      // intervalles des domaines (bornes ouvertes), pour les bandes sous l'axe
      intDepart: [[3, Infinity]],
      intRegroupe: [[-Infinity, 0], [3, Infinity]],
      // solutions de la forme regroupée g(x) = k : x(x − 3) = eᵏ
      solutions: function (k) {
        var r = Math.sqrt(9 + 4 * Math.exp(k));
        return [(3 - r) / 2, (3 + r) / 2];
      },
      valide: function (x) { return x > 3; },
      raison: "ln(x) et ln(x − 3) n'existent pas pour x < 0",
      equationRegroupee: "x(x − 3) = eᵏ",
      kPreset: LN(4), presetLibelle: "k = ln 4",
      kPresetTexte: "ln 4 ≈ 1,386",
      win: { xMin: -4, xMax: 8, yMin: -3, yMax: 4 },
      xTicks: [-4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8], yTicks: [-2, -1, 1, 2, 3],
      kMin: -2.5, kMax: 3.5,
    },
    {
      id: "carre",
      onglet: "2·ln(x)",
      depart: "2·ln(x)",
      regroupe: "ln(x²)",
      domDepart: "]0 ; +∞[",
      domRegroupe: "ℝ₀ = ]−∞ ; 0[ ∪ ]0 ; +∞[",
      f: function (x) { return x > 0 ? 2 * LN(x) : NaN; },
      g: function (x) { return x !== 0 ? LN(x * x) : NaN; },
      intDepart: [[0, Infinity]],
      intRegroupe: [[-Infinity, 0], [0, Infinity]],
      solutions: function (k) { var r = Math.exp(k / 2); return [-r, r]; },
      valide: function (x) { return x > 0; },
      raison: "ln(x) n'existe pas pour x < 0 : ln(x²) = 2·ln|x|, pas 2·ln(x)",
      equationRegroupee: "x² = eᵏ",
      kPreset: LN(4), presetLibelle: "k = ln 4",
      kPresetTexte: "ln 4 ≈ 1,386",
      win: { xMin: -5, xMax: 5, yMin: -4, yMax: 4 },
      xTicks: [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5], yTicks: [-3, -2, -1, 1, 2, 3],
      kMin: -3, kMax: 3,
    },
  ];

  var W = 340, H = 300, ML = 16, MR = 14, MT = 12, MB = 66; // MB : place des bandes de domaine
  var PAS_K = 0.01;

  function fmt(n, dec) {
    if (Math.abs(n) < 0.5 * Math.pow(10, -dec)) n = 0;
    var s = n.toFixed(dec);
    if (s.indexOf(".") >= 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
    return s.replace(".", ",").replace("-", "−");
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
    '.onglets{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;}' +
    '.onglets button{flex:1 1 140px;}' +
    'button{min-height:44px;font:inherit;font-size:0.9rem;padding:6px 12px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);cursor:pointer;}' +
    'button[aria-pressed="true"]{background:var(--accent-soft,#f4e3d1);border-color:var(--accent,#a8471f);color:var(--accent-ink,#7a3212);font-weight:700;}' +
    'button:focus-visible,input:focus-visible{outline:2px solid var(--plan,#5b4ea3);outline-offset:2px;}' +
    '.graphe{display:flex;justify-content:center;}' +
    'svg{width:100%;max-width:340px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);display:block;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.tick{stroke:var(--ink-soft,#6b6055);stroke-width:1;}' +
    '.tick-label{font-size:9.5px;font-family:var(--mono,monospace);fill:var(--ink-faint,#9c9083);}' +
    '.courbe-g{stroke:var(--accent,#a8471f);stroke-width:7;fill:none;opacity:0.35;stroke-linecap:round;}' +
    '.courbe-f{stroke:var(--good,#2f7a4f);stroke-width:2.4;fill:none;}' +
    '.droite-k{stroke:var(--plan,#5b4ea3);stroke-width:1.6;stroke-dasharray:6 4;}' +
    '.sol-ok{fill:var(--good,#2f7a4f);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.sol-parasite{fill:var(--surface,#fff);stroke:var(--bad,#b23a3a);stroke-width:2.5;}' +
    '.croix{stroke:var(--bad,#b23a3a);stroke-width:2.2;}' +
    '.guide{stroke:var(--ink-faint,#9c9083);stroke-width:1;stroke-dasharray:3 3;}' +
    '.bande-f{fill:var(--good,#2f7a4f);}' +
    '.bande-g{fill:var(--accent,#a8471f);opacity:0.55;}' +
    '.bande-fond{fill:var(--line,#e2d8c8);opacity:0.6;}' +
    '.bande-label{font-size:10px;font-family:var(--sans,sans-serif);font-weight:600;}' +
    '.bande-label-f{fill:var(--good,#2f7a4f);}' +
    '.bande-label-g{fill:var(--accent-ink,#7a3212);}' +
    '.legende{display:flex;flex-direction:column;gap:3px;font-size:0.86rem;margin:10px 0 0;color:var(--ink-soft,#6b6055);}' +
    '.trait{display:inline-block;width:22px;height:0;vertical-align:middle;margin-right:6px;}' +
    '.trait-g{border-top:7px solid var(--accent,#a8471f);opacity:0.4;}' +
    '.trait-f{border-top:2.5px solid var(--good,#2f7a4f);}' +
    '.bilan{margin-top:12px;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);background:var(--surface,#fff);padding:10px 12px;font-size:0.92rem;line-height:1.5;}' +
    '.bilan p{margin:0 0 6px;}' +
    '.bilan p:last-child{margin-bottom:0;}' +
    '.ok{color:var(--good,#2f7a4f);font-weight:600;}' +
    '.ko{color:var(--bad,#b23a3a);font-weight:600;}' +
    '.mono{font-family:var(--mono,monospace);font-size:0.86rem;}' +
    '.morale{margin-top:10px;padding:8px 12px;border-left:4px solid var(--plan,#5b4ea3);background:var(--plan-soft,#ece9f8);color:var(--plan-ink,#443a80);font-size:0.9rem;line-height:1.45;}' +
    '.curseur{display:flex;flex-direction:column;gap:4px;margin-top:14px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--plan-ink,#443a80);text-align:center;}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;min-height:44px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--plan,#5b4ea3);min-height:44px;}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:92px;text-align:right;font-size:0.9rem;}' +
    '.boutons{display:flex;gap:8px;margin-top:6px;flex-wrap:wrap;}' +
    '</style>' +
    '<div class="onglets" role="group" aria-label="Équation étudiée" id="onglets"></div>' +
    '<div class="graphe"><svg id="svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Les deux écritures et la droite y = k"></svg></div>' +
    '<div class="legende"><span><span class="trait trait-f"></span><span id="leg-f"></span></span><span><span class="trait trait-g"></span><span id="leg-g"></span></span><span id="leg-commun"></span></div>' +
    '<div class="curseur"><label for="k">k — hauteur de la droite y = k</label><div class="curseur-row">' +
    '<input type="range" id="k" step="' + PAS_K + '"><span class="curseur-valeur" id="k-valeur"></span></div></div>' +
    '<div class="boutons"><button type="button" id="preset"></button></div>' +
    '<div class="bilan" aria-live="polite" id="bilan"></div>' +
    '<div class="morale" id="morale"></div>';

  class SolutionParasiteLogWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._s = shadow;
      this._svg = shadow.getElementById("svg");
      this._inputK = shadow.getElementById("k");
      this._btnPreset = shadow.getElementById("preset");
      var self = this;
      this._onglets = MODES.map(function (m, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.textContent = m.onglet;
        b.addEventListener("click", function () { self._choisir(i); });
        shadow.getElementById("onglets").appendChild(b);
        return b;
      });
    }

    connectedCallback() {
      var self = this;
      this._onK = function () { self._k = parseFloat(self._inputK.value); self._kPreset = false; self._rendre(); };
      this._onPreset = function () { self._appliquerPreset(); };
      this._inputK.addEventListener("input", this._onK);
      this._btnPreset.addEventListener("click", this._onPreset);
      this._choisir(0);
    }

    disconnectedCallback() {
      this._inputK.removeEventListener("input", this._onK);
      this._btnPreset.removeEventListener("click", this._onPreset);
    }

    _choisir(i) {
      this._m = MODES[i];
      this._onglets.forEach(function (b, j) { b.setAttribute("aria-pressed", String(i === j)); });
      this._inputK.min = String(this._m.kMin);
      this._inputK.max = String(this._m.kMax);
      this._btnPreset.textContent = this._m.presetLibelle;
      this._s.getElementById("leg-f").textContent = "équation de départ : y = " + this._m.depart + ", domaine " + this._m.domDepart;
      this._s.getElementById("leg-g").textContent = "après regroupement : y = " + this._m.regroupe + ", domaine " + this._m.domRegroupe;
      this._s.getElementById("leg-commun").textContent = "Là où les deux existent, les deux courbes coïncident : seule la branche en plus de la forme regroupée diffère.";
      this._appliquerPreset();
    }

    // Le préréglage garde la valeur EXACTE ln 4 (le curseur, au pas de 0,01, n'affiche qu'une
    // approximation) : les solutions affichées tombent alors pile (4 et −1 ; 2 et −2).
    _appliquerPreset() {
      this._k = this._m.kPreset;
      this._kPreset = true;
      this._inputK.value = String(this._k);
      this._rendre();
    }

    _px(x, y) {
      var w = this._m.win;
      return [ML + (x - w.xMin) / (w.xMax - w.xMin) * (W - ML - MR), (H - MB) - (y - w.yMin) / (w.yMax - w.yMin) * (H - MB - MT)];
    }

    _chemin(f) {
      var w = this._m.win, n = 600, d = "", ouvert = false;
      for (var i = 0; i <= n; i++) {
        var x = w.xMin + (i / n) * (w.xMax - w.xMin), y = f(x);
        if (isFinite(y) && y > w.yMin - 3 && y < w.yMax + 3) {
          var p = this._px(x, Math.max(w.yMin - 0.5, Math.min(w.yMax + 0.5, y)));
          d += (ouvert ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1) + " ";
          ouvert = true;
        } else {
          ouvert = false;
        }
      }
      return d.trim();
    }

    _bande(svg, y, intervalles, classe) {
      var w = this._m.win, self = this;
      var x0 = this._px(w.xMin, 0)[0], x1 = this._px(w.xMax, 0)[0];
      svg.appendChild(svgEl("rect", { x: x0.toFixed(1), y: y, width: (x1 - x0).toFixed(1), height: 8, rx: 2, class: "bande-fond" }));
      intervalles.forEach(function (it) {
        var a = Math.max(w.xMin, it[0]), b = Math.min(w.xMax, it[1]);
        if (b <= a) return;
        var pa = self._px(a, 0)[0], pb = self._px(b, 0)[0];
        // bornes ouvertes : petit retrait visuel aux bornes finies
        if (isFinite(it[0])) pa += 2;
        if (isFinite(it[1])) pb -= 2;
        svg.appendChild(svgEl("rect", { x: pa.toFixed(1), y: y, width: Math.max(0, pb - pa).toFixed(1), height: 8, rx: 2, class: classe }));
      });
    }

    _rendre() {
      var m = this._m, w = m.win, svg = this._svg, k = this._k, self = this;
      svg.innerHTML = "";
      var defs = svgEl("defs", {});
      var mk = svgEl("marker", { id: "fl", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      mk.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(mk);
      var clip = svgEl("clipPath", { id: "clip" });
      clip.appendChild(svgEl("rect", { x: ML, y: MT, width: W - ML - MR, height: H - MB - MT }));
      defs.appendChild(clip);
      svg.appendChild(defs);

      var o = this._px(0, 0);
      svg.appendChild(svgEl("line", { x1: ML - 4, x2: W - 4, y1: o[1].toFixed(1), y2: o[1].toFixed(1), class: "axe", "marker-end": "url(#fl)" }));
      svg.appendChild(svgEl("line", { x1: o[0].toFixed(1), x2: o[0].toFixed(1), y1: H - MB + 2, y2: 4, class: "axe", "marker-end": "url(#fl)" }));
      m.xTicks.forEach(function (t) {
        var p = self._px(t, 0);
        svg.appendChild(svgEl("line", { x1: p[0].toFixed(1), x2: p[0].toFixed(1), y1: (p[1] - 3).toFixed(1), y2: (p[1] + 3).toFixed(1), class: "tick" }));
        var tx = svgEl("text", { x: p[0].toFixed(1), y: (p[1] + 13).toFixed(1), "text-anchor": "middle", class: "tick-label" });
        tx.textContent = fmt(t, 0);
        svg.appendChild(tx);
      });
      m.yTicks.forEach(function (t) {
        var p = self._px(0, t);
        svg.appendChild(svgEl("line", { x1: (p[0] - 3).toFixed(1), x2: (p[0] + 3).toFixed(1), y1: p[1].toFixed(1), y2: p[1].toFixed(1), class: "tick" }));
        var tx = svgEl("text", { x: (p[0] - 5).toFixed(1), y: (p[1] + 3).toFixed(1), "text-anchor": "end", class: "tick-label" });
        tx.textContent = fmt(t, 0);
        svg.appendChild(tx);
      });
      var lx = svgEl("text", { x: W - 8, y: (o[1] - 6).toFixed(1), "text-anchor": "end", class: "tick-label" });
      lx.textContent = "x";
      svg.appendChild(lx);

      var g = svgEl("g", { "clip-path": "url(#clip)" });
      svg.appendChild(g);
      g.appendChild(svgEl("path", { d: this._chemin(m.g), class: "courbe-g" }));
      g.appendChild(svgEl("path", { d: this._chemin(m.f), class: "courbe-f" }));
      var pk0 = this._px(w.xMin, k), pk1 = this._px(w.xMax, k);
      g.appendChild(svgEl("line", { x1: pk0[0].toFixed(1), x2: pk1[0].toFixed(1), y1: pk0[1].toFixed(1), y2: pk1[1].toFixed(1), class: "droite-k" }));
      var lk = svgEl("text", { x: (W - MR - 4).toFixed(1), y: (pk0[1] - 5).toFixed(1), "text-anchor": "end", class: "tick-label" });
      lk.textContent = "y = k";
      g.appendChild(lk);

      var sols = m.solutions(k);
      sols.forEach(function (x) {
        var p = self._px(x, k);
        var dedans = x >= w.xMin && x <= w.xMax;
        if (!dedans) return;
        g.appendChild(svgEl("line", { x1: p[0].toFixed(1), x2: p[0].toFixed(1), y1: p[1].toFixed(1), y2: o[1].toFixed(1), class: "guide" }));
        if (m.valide(x)) {
          g.appendChild(svgEl("circle", { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: 5.5, class: "sol-ok" }));
        } else {
          g.appendChild(svgEl("circle", { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: 6, class: "sol-parasite" }));
          g.appendChild(svgEl("line", { x1: (p[0] - 4).toFixed(1), y1: (p[1] - 4).toFixed(1), x2: (p[0] + 4).toFixed(1), y2: (p[1] + 4).toFixed(1), class: "croix" }));
          g.appendChild(svgEl("line", { x1: (p[0] - 4).toFixed(1), y1: (p[1] + 4).toFixed(1), x2: (p[0] + 4).toFixed(1), y2: (p[1] - 4).toFixed(1), class: "croix" }));
        }
      });

      // Bandes des domaines, sous le graphique
      var yb1 = H - MB + 26, yb2 = H - MB + 50;
      var l1 = svgEl("text", { x: ML, y: yb1 - 4, class: "bande-label bande-label-f" });
      l1.textContent = "domaine de " + m.depart + " : " + m.domDepart;
      svg.appendChild(l1);
      this._bande(svg, yb1, m.intDepart, "bande-f");
      var l2 = svgEl("text", { x: ML, y: yb2 - 4, class: "bande-label bande-label-g" });
      l2.textContent = "domaine de " + m.regroupe + " : " + m.domRegroupe;
      svg.appendChild(l2);
      this._bande(svg, yb2, m.intRegroupe, "bande-g");

      // Textes
      this._s.getElementById("k-valeur").textContent = this._kPreset ? m.kPresetTexte : fmt(k, 2);
      var bon = sols.filter(m.valide), mauvais = sols.filter(function (x) { return !m.valide(x); });
      var kTxt = this._kPreset ? "ln 4" : fmt(k, 2);
      // « = » quand la valeur tombe juste (préréglage ln 4 : 4 et −1, 2 et −2), « ≈ » sinon.
      var val = function (x) { return (Math.abs(x - Math.round(x)) < 1e-9 ? "x = " : "x ≈ ") + fmt(x, 3); };
      var membreDroit = this._kPreset ? "4" : "eᵏ ≈ " + fmt(Math.exp(k), 3);
      this._s.getElementById("bilan").innerHTML =
        '<p><b>Après regroupement</b> : <span class="mono">' + m.regroupe + " = " + kTxt + "</span> donne <span class=\"mono\">" +
        m.equationRegroupee.replace("eᵏ", membreDroit) + "</span>, soit <b>deux</b> solutions : " + val(sols[0]) + " et " + val(sols[1]) + ".</p>" +
        '<p><span class="ok">✓ ' + val(bon[0]) + "</span> est solution de l'équation de départ <span class=\"mono\">" +
        m.depart + " = " + kTxt + "</span> : la courbe verte coupe bien la droite.</p>" +
        '<p><span class="ko">✗ ' + val(mauvais[0]) + " : parasite</span> — " + m.raison + ". Seule la forme regroupée existe là.</p>";
      this._s.getElementById("morale").textContent =
        "Regrouper " + m.depart + " en " + m.regroupe + " agrandit le domaine : vérifie toujours la condition d'existence de l'équation de départ.";
    }
  }

  if (!customElements.get("solution-parasite-log-widget")) {
    customElements.define("solution-parasite-log-widget", SolutionParasiteLogWidget);
  }
})();
