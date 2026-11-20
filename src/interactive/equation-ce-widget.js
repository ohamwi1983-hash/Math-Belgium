(function () {
  "use strict";

  /* ================================================================
   * <equation-ce-widget> — atelier interactif (6e, ch. 1, § 3, méthode en
   * 3 temps). Une équation arc(A) = arc(B) : courbes des deux membres,
   * chacune tracée seulement là où elle existe (bandes « CE du membre de
   * gauche / de droite » sous le graphique), bande verte de la CE commune,
   * candidats de l'équation simplifiée marqués acceptés (vert) ou rejetés
   * (rouge). Un curseur balaie x et dit, membre par membre, si l'arcfonction
   * existe (argument dans [−1 ; 1]) : un candidat rejeté rend au moins un
   * membre inexistant. Fenêtre FIXE par équation. Web Component.
   * Couleurs : membre de gauche orange, membre de droite bleu, CE vert.
   * ================================================================ */

  var X = '<i>x</i>';
  var R2 = Math.SQRT2;
  function arcVal(type, u) { return type === "arcsin" ? Math.asin(u) : type === "arccos" ? Math.acos(u) : Math.atan(u); }

  var EQUATIONS = [
    {
      option: "arcsin(2x − 1) = arcsin(x)",
      typeG: "arcsin", typeD: "arcsin",
      argG: function (x) { return 2 * x - 1; }, argD: function (x) { return x; },
      txtG: "2" + X + " − 1", txtD: X,
      domG: [0, 1], domD: [-1, 1], ce: [0, 1],
      ceTxt: "[0 ; 1]", domGTxt: "[0 ; 1]", domDTxt: "[−1 ; 1]",
      simplifiee: "2" + X + " − 1 = " + X, candidats: [{ x: 1, txt: "1", ok: true }],
      win: { xMin: -1.6, xMax: 1.6, yMin: -1.9, yMax: 1.9 }, xTicks: [-1, 1], yTicks: [-1, 1], yPi: [-Math.PI / 2, Math.PI / 2],
      xDefaut: 0.5,
    },
    {
      option: "arccos(x² − 1) = arccos(1 − x)",
      typeG: "arccos", typeD: "arccos",
      argG: function (x) { return x * x - 1; }, argD: function (x) { return 1 - x; },
      txtG: X + "² − 1", txtD: "1 − " + X,
      domG: [-R2, R2], domD: [0, 2], ce: [0, R2],
      ceTxt: "[0 ; √2]", domGTxt: "[−√2 ; √2]", domDTxt: "[0 ; 2]",
      simplifiee: X + "² + " + X + " − 2 = 0", candidats: [{ x: -2, txt: "−2", ok: false }, { x: 1, txt: "1", ok: true }],
      win: { xMin: -2.6, xMax: 2.6, yMin: -0.6, yMax: 3.7 }, xTicks: [-2, -1, 1, 2], yTicks: [1, 2], yPi: [Math.PI],
      xDefaut: 0.5,
    },
    {
      option: "arctan(x²) = arctan(3x − 2)",
      typeG: "arctan", typeD: "arctan",
      argG: function (x) { return x * x; }, argD: function (x) { return 3 * x - 2; },
      txtG: X + "²", txtD: "3" + X + " − 2",
      domG: [-Infinity, Infinity], domD: [-Infinity, Infinity], ce: [-Infinity, Infinity],
      ceTxt: "ℝ", ceNote: " (arctan n’a pas de CE)", domGTxt: "ℝ", domDTxt: "ℝ",
      simplifiee: X + "² − 3" + X + " + 2 = 0", candidats: [{ x: 1, txt: "1", ok: true }, { x: 2, txt: "2", ok: true }],
      win: { xMin: -1, xMax: 3.4, yMin: -1.9, yMax: 1.9 }, xTicks: [1, 2, 3], yTicks: [-1, 1], yPi: [-Math.PI / 2, Math.PI / 2],
      xDefaut: 0,
    },
    {
      option: "arccos(2x) = arccos(x² − 3)",
      typeG: "arccos", typeD: "arccos",
      argG: function (x) { return 2 * x; }, argD: function (x) { return x * x - 3; },
      txtG: "2" + X, txtD: X + "² − 3",
      domG: [-0.5, 0.5], domD: [[-2, -R2], [R2, 2]], ce: null,
      ceTxt: "∅", ceNote: " : aucun réel ne respecte les deux conditions", domGTxt: "[−1/2 ; 1/2]", domDTxt: "[−2 ; −√2] ∪ [√2 ; 2]",
      simplifiee: X + "² − 2" + X + " − 3 = 0", candidats: [{ x: -1, txt: "−1", ok: false }, { x: 3, txt: "3", ok: false }],
      win: { xMin: -3.4, xMax: 3.4, yMin: -0.6, yMax: 3.7 }, xTicks: [-3, -2, -1, 1, 2, 3], yTicks: [1, 2], yPi: [Math.PI],
      xDefaut: 0,
    },
  ];

  var W = 340, H = 300, ML = 34, MR = 14, MT = 12, MB = 236; // MB : bas de la zone du graphique
  var BANDE_G = 258, BANDE_D = 282;
  var NS = "http://www.w3.org/2000/svg";

  function fmt(n, dec) {
    if (Math.abs(n) < 0.5 * Math.pow(10, -dec)) n = 0;
    var s = n.toFixed(dec);
    if (s.indexOf(".") >= 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
    return s.replace(".", ",").replace("-", "−");
  }
  function svgEl(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }
  function intervalles(d) { return d === null ? [] : Array.isArray(d[0]) ? d : [d]; }
  function dans(d, x) { return intervalles(d).some(function (iv) { return x >= iv[0] - 1e-12 && x <= iv[1] + 1e-12; }); }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#182430);}' +
    '*{box-sizing:border-box;}' +
    '.choix{display:flex;flex-direction:column;gap:6px;margin-bottom:12px;}' +
    '.choix label{font-size:0.8rem;color:var(--ink-soft,#51626f);}' +
    'select{min-height:44px;font:inherit;font-size:0.95rem;padding:6px 10px;border:1px solid var(--line,#ccd8e0);border-radius:var(--radius,3px);background:var(--surface,#fff);color:var(--ink,#182430);}' +
    '.figure{display:flex;flex-direction:column;align-items:center;gap:6px;}' +
    'svg{width:100%;max-width:340px;height:auto;background:var(--surface-2,#f7f9fb);border-radius:var(--radius,3px);display:block;}' +
    '.axe{stroke:var(--ink-soft,#51626f);stroke-width:1.3;}' +
    '.fleche{fill:var(--ink-soft,#51626f);}' +
    '.grille{stroke:var(--line-soft,#dfe7ec);stroke-width:1;}' +
    '.tick{stroke:var(--ink-soft,#51626f);stroke-width:1;}' +
    '.tick-label{font-size:10px;font-family:var(--sans,sans-serif);fill:var(--ink-soft,#51626f);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3px;}' +
    '.ce{fill:var(--good,#2f7a4f);opacity:0.12;}' +
    '.ce-bord{stroke:var(--good,#2f7a4f);stroke-width:1.2;stroke-dasharray:4 3;}' +
    '.c-g{stroke:var(--accent,#b65c1f);stroke-width:2.6;fill:none;}' +
    '.c-d{stroke:var(--sky,#2f6fb0);stroke-width:2.6;fill:none;}' +
    '.b-g{stroke:var(--accent,#b65c1f);stroke-width:6;stroke-linecap:butt;}' +
    '.b-d{stroke:var(--sky,#2f6fb0);stroke-width:6;stroke-linecap:butt;}' +
    '.b-ligne{stroke:var(--line,#ccd8e0);stroke-width:1;}' +
    '.b-label{font-size:10px;font-weight:600;paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3px;}' +
    '.b-label-g{fill:var(--accent-ink,#7a3c11);}' +
    '.b-label-d{fill:var(--sky-ink,#1f4e7d);}' +
    '.guide{stroke:var(--plan,#5b4ea3);stroke-width:1.4;stroke-dasharray:4 3;}' +
    '.pt-g{fill:var(--accent,#b65c1f);stroke:var(--surface,#fff);stroke-width:1.2;}' +
    '.pt-d{fill:var(--sky,#2f6fb0);stroke:var(--surface,#fff);stroke-width:1.2;}' +
    '.cand-ok{fill:var(--good,#2f7a4f);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.cand-ko{stroke:var(--bad,#b23a3a);stroke-width:2.6;stroke-linecap:round;}' +
    '.sol{fill:none;stroke:var(--good,#2f7a4f);stroke-width:2.4;}' +
    '.etq-ok{font-size:11px;font-weight:700;fill:var(--good,#2f7a4f);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3px;}' +
    '.etq-ko{font-size:11px;font-weight:700;fill:var(--bad,#b23a3a);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3px;}' +
    '.fm{font-family:var(--serif,Georgia,serif);white-space:nowrap;}' +
    '.fm i{margin-right:0.06em;}' +
    '.equation{text-align:center;font-size:1.06rem;}' +
    '.legende{font-size:0.82rem;color:var(--ink-soft,#51626f);text-align:center;line-height:1.5;}' +
    '.leg-g{color:var(--accent-ink,#7a3c11);font-weight:700;}' +
    '.leg-d{color:var(--sky-ink,#1f4e7d);font-weight:700;}' +
    '.leg-ce{color:var(--good,#2f7a4f);font-weight:700;}' +
    '.curseur{display:flex;flex-direction:column;gap:4px;margin-top:12px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--plan-ink,#443a80);text-align:center;}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;min-height:44px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--plan,#5b4ea3);min-height:44px;}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#51626f);min-width:64px;text-align:right;}' +
    '.boutons{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:6px;}' +
    'button{min-height:44px;font:inherit;font-size:0.92rem;padding:6px 12px;border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);background:var(--surface,#fff);color:var(--ink,#182430);cursor:pointer;}' +
    'button:focus-visible,select:focus-visible,input:focus-visible{outline:2px solid var(--accent,#b65c1f);outline-offset:2px;}' +
    '.lecture{margin-top:12px;border:1px solid var(--line,#ccd8e0);border-radius:var(--radius,3px);background:var(--surface,#fff);padding:10px 12px;font-size:0.93rem;line-height:1.6;}' +
    '.lecture p{margin:0 0 6px;}' +
    '.lecture p:last-child{margin-bottom:0;}' +
    '.existe{color:var(--good,#2f7a4f);font-weight:700;}' +
    '.inexiste{color:var(--bad,#b23a3a);font-weight:700;}' +
    '.etapes{margin-top:10px;padding-top:8px;border-top:1px solid var(--line-soft,#dfe7ec);}' +
    '</style>' +
    '<div class="choix"><label for="equation">Équation</label><select id="equation"></select></div>' +
    '<div class="figure">' +
    '<div class="equation fm" id="titre"></div>' +
    '<svg id="svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Les deux membres de l’équation et la condition d’existence"></svg>' +
    '<div class="legende"><span class="leg-g">orange : membre de gauche</span> · <span class="leg-d">bleu : membre de droite</span><br>' +
    '<span class="leg-ce">bande verte : la CE commune</span> · candidat ● accepté, ✕ rejeté</div>' +
    '</div>' +
    '<div class="curseur"><label for="x">x — balaie les réels et regarde quels membres existent</label><div class="curseur-row">' +
    '<input type="range" id="x" min="0" max="10" step="1" value="0"><span class="curseur-valeur" id="x-valeur"></span></div></div>' +
    '<div class="boutons" id="boutons"></div>' +
    '<div class="lecture" aria-live="polite"><div id="balayage"></div><div class="etapes" id="etapes"></div></div>';

  var PAS = 0.05;

  class EquationCeWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._s = shadow;
      this._svg = shadow.getElementById("svg");
      this._select = shadow.getElementById("equation");
      this._input = shadow.getElementById("x");
      var self = this;
      EQUATIONS.forEach(function (e, i) {
        var o = document.createElement("option");
        o.value = String(i);
        o.textContent = e.option;
        self._select.appendChild(o);
      });
    }

    connectedCallback() {
      var self = this;
      this._onSelect = function () { self._choisir(parseInt(self._select.value, 10)); };
      this._onX = function () { self._i = parseInt(self._input.value, 10); self._rendre(); };
      this._select.addEventListener("change", this._onSelect);
      this._input.addEventListener("input", this._onX);
      this._choisir(0);
    }

    disconnectedCallback() {
      this._select.removeEventListener("change", this._onSelect);
      this._input.removeEventListener("input", this._onX);
    }

    _choisir(i) {
      var e = EQUATIONS[i], self = this;
      this._e = e;
      this._select.value = String(i);
      this._input.max = String(Math.round((e.win.xMax - e.win.xMin) / PAS));
      this._i = Math.round((e.xDefaut - e.win.xMin) / PAS);
      this._input.value = String(this._i);
      this._s.getElementById("titre").innerHTML = e.typeG + "(" + e.txtG + ") = " + e.typeD + "(" + e.txtD + ")";
      var zone = this._s.getElementById("boutons");
      zone.innerHTML = "";
      e.candidats.forEach(function (c) {
        var b = document.createElement("button");
        b.type = "button";
        b.textContent = "Tester x = " + c.txt;
        b.addEventListener("click", function () {
          self._i = Math.round((c.x - e.win.xMin) / PAS);
          self._input.value = String(self._i);
          self._rendre();
        });
        zone.appendChild(b);
      });
      var cand = e.candidats.map(function (c) { return c.txt; });
      var verdicts = e.candidats.map(function (c) {
        return c.ok ? '<span class="existe">' + c.txt + " ∈ CE : accepté</span>" : '<span class="inexiste">' + c.txt + " ∉ CE : rejeté</span>";
      });
      var S = e.candidats.filter(function (c) { return c.ok; }).map(function (c) { return c.txt; });
      this._s.getElementById("etapes").innerHTML =
        "<p><b>1) CE.</b> Membre de gauche : <span class=\"fm\">" + e.domGTxt + "</span> ; membre de droite : <span class=\"fm\">" + e.domDTxt + "</span> ; CE commune : <span class=\"fm\">" + e.ceTxt + "</span>" + (e.ceNote || "") + ".</p>" +
        "<p><b>2) Équation simplifiée</b> (" + e.typeG + " est injective) : <span class=\"fm\">" + e.simplifiee + "</span>, candidat" + (cand.length > 1 ? "s " : " ") + cand.join(" et ") + ".</p>" +
        "<p><b>3) Confrontation à la CE.</b> " + verdicts.join(" ; ") + '. Donc <span class="fm"><i>S</i> = ' + (S.length ? "{" + S.join(" ; ") + "}" : "∅") + "</span>.</p>";
      this._rendre();
    }

    _px(x, y) {
      var w = this._e.win;
      return [ML + (x - w.xMin) / (w.xMax - w.xMin) * (W - ML - MR), MB - (y - w.yMin) / (w.yMax - w.yMin) * (MB - MT)];
    }

    _courbe(type, arg, dom) {
      var w = this._e.win, self = this, d = "";
      intervalles(dom).forEach(function (iv) {
        var lo = Math.max(iv[0], w.xMin), hi = Math.min(iv[1], w.xMax);
        if (hi <= lo) return;
        for (var i = 0; i <= 240; i++) {
          var x = lo + (hi - lo) * i / 240;
          var u = Math.max(-1, Math.min(1, arg(x)));
          var p = self._px(x, arcVal(type, type === "arctan" ? arg(x) : u));
          d += (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1) + " ";
        }
      });
      return d.trim();
    }

    _bande(svg, y, dom, cls, label, clsLabel) {
      var w = this._e.win, self = this;
      svg.appendChild(svgEl("line", { x1: ML, x2: W - MR, y1: y, y2: y, class: "b-ligne" }));
      intervalles(dom).forEach(function (iv) {
        var a = self._px(Math.max(iv[0], w.xMin), 0)[0], b = self._px(Math.min(iv[1], w.xMax), 0)[0];
        svg.appendChild(svgEl("line", { x1: a.toFixed(1), x2: b.toFixed(1), y1: y, y2: y, class: cls }));
      });
      var t = svgEl("text", { x: 4, y: y + 3.5, class: "b-label " + clsLabel });
      t.textContent = label;
      svg.appendChild(t);
    }

    _rendre() {
      var e = this._e, w = e.win, self = this, svg = this._svg;
      var x = Math.round((w.xMin + this._i * PAS) * 1000) / 1000;
      svg.innerHTML = "";
      var defs = svgEl("defs", {});
      var m = svgEl("marker", { id: "fl", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      m.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(m);
      var clip = svgEl("clipPath", { id: "cadre" });
      clip.appendChild(svgEl("rect", { x: ML, y: MT, width: W - ML - MR, height: MB - MT }));
      defs.appendChild(clip);
      svg.appendChild(defs);

      // CE commune : bande verte sur toute la hauteur du graphique.
      intervalles(e.ce).forEach(function (iv) {
        var a = self._px(Math.max(iv[0], w.xMin), 0)[0], b = self._px(Math.min(iv[1], w.xMax), 0)[0];
        svg.appendChild(svgEl("rect", { x: a.toFixed(1), y: MT, width: Math.max(0, b - a).toFixed(1), height: MB - MT, class: "ce" }));
        [iv[0], iv[1]].forEach(function (v) {
          if (!isFinite(v)) return;
          var p = self._px(v, 0)[0];
          svg.appendChild(svgEl("line", { x1: p.toFixed(1), x2: p.toFixed(1), y1: MT, y2: MB, class: "ce-bord" }));
        });
      });
      // Repère.
      var o = this._px(0, 0);
      var yT = e.yTicks.concat(e.yPi);
      yT.forEach(function (t) {
        var p = self._px(0, t);
        svg.appendChild(svgEl("line", { x1: ML, x2: W - MR, y1: p[1].toFixed(1), y2: p[1].toFixed(1), class: "grille" }));
      });
      svg.appendChild(svgEl("line", { x1: ML - 4, x2: W - 4, y1: o[1].toFixed(1), y2: o[1].toFixed(1), class: "axe", "marker-end": "url(#fl)" }));
      svg.appendChild(svgEl("line", { x1: o[0].toFixed(1), x2: o[0].toFixed(1), y1: MB + 4, y2: 4, class: "axe", "marker-end": "url(#fl)" }));
      e.xTicks.forEach(function (t) {
        var p = self._px(t, 0);
        svg.appendChild(svgEl("line", { x1: p[0].toFixed(1), x2: p[0].toFixed(1), y1: (o[1] - 3).toFixed(1), y2: (o[1] + 3).toFixed(1), class: "tick" }));
        var tx = svgEl("text", { x: p[0].toFixed(1), y: (o[1] + 14).toFixed(1), "text-anchor": "middle", class: "tick-label" });
        tx.textContent = fmt(t, 2);
        svg.appendChild(tx);
      });
      yT.forEach(function (t) {
        var p = self._px(0, t);
        svg.appendChild(svgEl("line", { x1: (o[0] - 3).toFixed(1), x2: (o[0] + 3).toFixed(1), y1: p[1].toFixed(1), y2: p[1].toFixed(1), class: "tick" }));
        var tx = svgEl("text", { x: (o[0] - 5).toFixed(1), y: (p[1] + 3.5).toFixed(1), "text-anchor": "end", class: "tick-label" });
        tx.textContent = Math.abs(Math.abs(t) - Math.PI / 2) < 1e-9 ? (t < 0 ? "−π/2" : "π/2") : Math.abs(t - Math.PI) < 1e-9 ? "π" : fmt(t, 2);
        svg.appendChild(tx);
      });
      // Nom de l'axe SOUS l'axe : au-dessus, il croiserait l'étiquette d'un candidat proche du bord.
      var nx = svgEl("text", { x: W - 6, y: (o[1] + 14).toFixed(1), "text-anchor": "end", class: "tick-label" });
      nx.textContent = "x";
      svg.appendChild(nx);

      var g = svgEl("g", { "clip-path": "url(#cadre)" });
      svg.appendChild(g);
      g.appendChild(svgEl("path", { d: this._courbe(e.typeG, e.argG, e.domG), class: "c-g" }));
      g.appendChild(svgEl("path", { d: this._courbe(e.typeD, e.argD, e.domD), class: "c-d" }));

      // Guide du balayage et points des membres qui existent.
      var px = this._px(x, 0)[0];
      g.appendChild(svgEl("line", { x1: px.toFixed(1), x2: px.toFixed(1), y1: MT, y2: MB, class: "guide" }));
      var uG = e.argG(x), uD = e.argD(x);
      var exG = e.typeG === "arctan" || Math.abs(uG) <= 1 + 1e-12, exD = e.typeD === "arctan" || Math.abs(uD) <= 1 + 1e-12;
      var vG = exG ? arcVal(e.typeG, e.typeG === "arctan" ? uG : Math.max(-1, Math.min(1, uG))) : null;
      var vD = exD ? arcVal(e.typeD, e.typeD === "arctan" ? uD : Math.max(-1, Math.min(1, uD))) : null;
      if (exG) { var pg = this._px(x, vG); g.appendChild(svgEl("circle", { cx: pg[0].toFixed(1), cy: pg[1].toFixed(1), r: 4, class: "pt-g" })); }
      if (exD) { var pd = this._px(x, vD); g.appendChild(svgEl("circle", { cx: pd[0].toFixed(1), cy: pd[1].toFixed(1), r: 4, class: "pt-d" })); }

      // Candidats : ● vert accepté (et cercle autour de l'intersection), ✕ rouge rejeté.
      e.candidats.forEach(function (c) {
        var p = self._px(c.x, 0);
        if (c.ok) {
          svg.appendChild(svgEl("circle", { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: 5, class: "cand-ok" }));
          var q = self._px(c.x, arcVal(e.typeG, e.argG(c.x)));
          svg.appendChild(svgEl("circle", { cx: q[0].toFixed(1), cy: q[1].toFixed(1), r: 7.5, class: "sol" }));
        } else {
          var s = 5;
          svg.appendChild(svgEl("line", { x1: p[0] - s, y1: p[1] - s, x2: p[0] + s, y2: p[1] + s, class: "cand-ko" }));
          svg.appendChild(svgEl("line", { x1: p[0] - s, y1: p[1] + s, x2: p[0] + s, y2: p[1] - s, class: "cand-ko" }));
        }
        var t = svgEl("text", { x: p[0].toFixed(1), y: (p[1] - 9).toFixed(1), "text-anchor": "middle", class: c.ok ? "etq-ok" : "etq-ko" });
        t.textContent = c.ok ? "accepté" : "rejeté";
        svg.appendChild(t);
      });

      // Bandes des CE de chaque membre, sous le graphique.
      this._bande(svg, BANDE_G, e.domG, "b-g", "CE gauche", "b-label-g");
      this._bande(svg, BANDE_D, e.domD, "b-d", "CE droite", "b-label-d");
      [BANDE_G, BANDE_D].forEach(function (yb) { svg.appendChild(svgEl("line", { x1: px.toFixed(1), x2: px.toFixed(1), y1: yb - 6, y2: yb + 6, class: "guide" })); });
      svg.querySelectorAll("text.tick-label").forEach(function (t) { svg.appendChild(t); });

      // Textes.
      this._s.getElementById("x-valeur").textContent = "x = " + fmt(x, 2);
      var membre = function (type, txt, u, existe, v) {
        var s = '<span class="fm">' + txt + " = " + fmt(u, 3) + "</span> : ";
        if (existe) return s + '<span class="fm">' + type + "(" + fmt(u, 3) + ") " + (Math.abs(v) < 1e-12 ? "= " : "≈ ") + fmt(v, 3) + '</span> <span class="existe">existe</span>';
        return s + '<span class="inexiste">' + fmt(u, 3) + " ∉ [−1 ; 1], " + type + "(" + fmt(u, 3) + ") n’existe pas</span>";
      };
      var h = "<p>En <span class=\"fm\"><i>x</i> = " + fmt(x, 2) + "</span> :</p>" +
        "<p>gauche — " + membre(e.typeG, e.txtG, uG, exG, vG) + ".</p>" +
        "<p>droite — " + membre(e.typeD, e.txtD, uD, exD, vD) + ".</p>";
      if (exG && exD) h += Math.abs(vG - vD) < 1e-9 ? '<p><span class="existe">Les deux membres sont égaux : x est solution.</span></p>' : "<p>Les deux membres existent mais diffèrent : x n’est pas solution.</p>";
      else h += '<p><span class="inexiste">x est hors CE : l’équation n’a même pas de sens en ce point.</span></p>';
      this._s.getElementById("balayage").innerHTML = h;
    }
  }

  if (!customElements.get("equation-ce-widget")) customElements.define("equation-ce-widget", EquationCeWidget);
})();
