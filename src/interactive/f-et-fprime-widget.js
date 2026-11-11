(function () {
  "use strict";

  /* ================================================================
   * <f-et-fprime-widget> — atelier interactif (6e, ch. 3, section
   * « Graphique de la fonction dérivée ») : deux graphiques empilés,
   * f en haut et f′ en bas, sur les MÊMES abscisses. Le curseur x place un
   * point sur f avec sa tangente ; la pente de cette tangente est reportée
   * comme le point (x ; f′(x)) du graphique du bas, qui garde la trace des
   * abscisses déjà visitées — la courbe de f′ se dessine au fur et à mesure
   * (ou d'un coup, case à cocher). Les points remarquables (f′ = 0 →
   * extremum de f ; extremum de f′ → inflexion de f) sont marqués sur les
   * deux graphiques et accessibles par des boutons. Fenêtres FIXES par
   * fonction (jamais recalculées depuis x). Web Component (Shadow DOM).
   * ================================================================ */

  var LN = Math.log;
  var E = Math.E;

  // Fenêtres fixes choisies pour que chaque point remarquable soit lisible ; ce qui sort d'une
  // fenêtre est simplement rogné (clipPath), jamais remis à l'échelle.
  var FONCTIONS = [
    {
      id: "x-moins-ln",
      nom: "f(x) = x − ln(x)",
      derivee: "f′(x) = 1 − 1/x",
      f: function (x) { return x - LN(x); },
      fp: function (x) { return 1 - 1 / x; },
      xMin: 0.2, xMax: 5, xDefaut: 0.5,
      fWin: { min: 0, max: 4 }, fpWin: { min: -4, max: 1.5 },
      xTicks: [1, 2, 3, 4, 5], fTicks: [1, 2, 3], fpTicks: [-3, -2, -1, 1],
      remarquables: [{ x: 1, type: "extremum", libre: "x = 1", detail: "minimum de f : f(1) = 1" }],
    },
    {
      id: "ln-sur-x",
      nom: "f(x) = ln(x) / x",
      derivee: "f′(x) = (1 − ln x) / x²",
      f: function (x) { return LN(x) / x; },
      fp: function (x) { return (1 - LN(x)) / (x * x); },
      xMin: 1, xMax: 12, xDefaut: 1.6,
      fWin: { min: -0.05, max: 0.45 }, fpWin: { min: -0.05, max: 0.3 },
      xTicks: [2, 4, 6, 8, 10, 12], fTicks: [0.1, 0.2, 0.3, 0.4], fpTicks: [0.1, 0.2],
      remarquables: [
        { x: E, type: "extremum", libre: "x = e ≈ 2,72", detail: "maximum de f : f(e) = 1/e ≈ 0,368" },
        { x: Math.exp(1.5), type: "inflexion", libre: "x = e√e ≈ 4,48", detail: "f′ atteint son minimum (≈ −0,025)" },
      ],
    },
    {
      id: "x-ln",
      nom: "f(x) = x·ln(x)",
      derivee: "f′(x) = ln(x) + 1",
      f: function (x) { return x * LN(x); },
      fp: function (x) { return LN(x) + 1; },
      xMin: 0.03, xMax: 2.5, xDefaut: 0.1,
      fWin: { min: -0.6, max: 2.4 }, fpWin: { min: -3, max: 2.2 },
      xTicks: [0.5, 1, 1.5, 2, 2.5], fTicks: [-0.5, 1, 2], fpTicks: [-2, -1, 1, 2],
      remarquables: [{ x: 1 / E, type: "extremum", libre: "x = 1/e ≈ 0,37", detail: "minimum de f : f(1/e) = −1/e ≈ −0,368" }],
    },
    {
      id: "ln-moins-demi",
      nom: "f(x) = ln(x) − x/2",
      derivee: "f′(x) = 1/x − 1/2",
      f: function (x) { return LN(x) - x / 2; },
      fp: function (x) { return 1 / x - 0.5; },
      xMin: 0.3, xMax: 7, xDefaut: 0.6,
      fWin: { min: -2, max: 0.3 }, fpWin: { min: -0.6, max: 3 },
      xTicks: [1, 2, 3, 4, 5, 6, 7], fTicks: [-1.5, -1, -0.5], fpTicks: [1, 2, 3],
      remarquables: [{ x: 2, type: "extremum", libre: "x = 2", detail: "maximum de f : f(2) = ln 2 − 1 ≈ −0,307" }],
    },
    {
      id: "ln-x2-plus-1",
      nom: "f(x) = ln(x² + 1)",
      derivee: "f′(x) = 2x / (x² + 1)",
      f: function (x) { return LN(x * x + 1); },
      fp: function (x) { return 2 * x / (x * x + 1); },
      xMin: -4, xMax: 4, xDefaut: -3,
      fWin: { min: -0.4, max: 3 }, fpWin: { min: -1.3, max: 1.3 },
      xTicks: [-4, -3, -2, -1, 1, 2, 3, 4], fTicks: [1, 2, 3], fpTicks: [-1, 1],
      remarquables: [
        { x: -1, type: "inflexion", libre: "x = −1", detail: "f′ atteint son minimum (−1)" },
        { x: 0, type: "extremum", libre: "x = 0", detail: "minimum de f : f(0) = 0" },
        { x: 1, type: "inflexion", libre: "x = 1", detail: "f′ atteint son maximum (1)" },
      ],
    },
  ];

  var NB_PAS = 400; // résolution du curseur et de la trace
  var W = 340, H = 180, ML = 38, MR = 14, MT = 14, MB = 24;

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
    '.choix{display:flex;flex-direction:column;gap:6px;margin-bottom:12px;}' +
    '.choix label{font-family:var(--mono,monospace);font-size:11px;color:var(--ink-faint,#9c9083);}' +
    'select{min-height:44px;font:inherit;font-size:0.95rem;padding:6px 10px;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);background:var(--surface,#fff);color:var(--ink,#241f1a);}' +
    '.graphes{display:flex;flex-direction:column;align-items:center;gap:6px;}' +
    'svg{width:100%;max-width:340px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);display:block;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.grille{stroke:var(--line,#e2d8c8);stroke-width:1;}' +
    '.tick{stroke:var(--ink-soft,#6b6055);stroke-width:1;}' +
    '.tick-label{font-size:9.5px;font-family:var(--mono,monospace);fill:var(--ink-faint,#9c9083);}' +
    '.titre{font-size:12px;font-weight:700;font-family:var(--sans,sans-serif);}' +
    '.titre-f{fill:var(--accent-ink,#7a3212);}' +
    '.titre-fp{fill:var(--plan-ink,#443a80);}' +
    '.courbe-f{stroke:var(--accent,#a8471f);stroke-width:2.4;fill:none;}' +
    '.courbe-fp{stroke:var(--plan,#5b4ea3);stroke-width:2.4;fill:none;}' +
    '.courbe-fp-fantome{stroke:var(--plan,#5b4ea3);stroke-width:1.2;fill:none;opacity:0.18;}' +
    '.tangente{stroke:var(--plan,#5b4ea3);stroke-width:1.8;stroke-dasharray:6 4;}' +
    '.guide{stroke:var(--ink-faint,#9c9083);stroke-width:1;stroke-dasharray:3 3;}' +
    '.point-f{fill:var(--accent,#a8471f);}' +
    '.point-fp{fill:var(--plan,#5b4ea3);}' +
    '.repere-extremum{fill:var(--surface,#fff);stroke:var(--good,#2f7a4f);stroke-width:2;}' +
    '.repere-inflexion{fill:var(--surface,#fff);stroke:var(--bad,#b23a3a);stroke-width:2;}' +
    '.zone-pos{fill:var(--good,#2f7a4f);opacity:0.08;}' +
    '.zone-neg{fill:var(--bad,#b23a3a);opacity:0.07;}' +
    '.formules{font-family:var(--mono,monospace);font-size:12px;color:var(--ink-soft,#6b6055);text-align:center;margin:6px 0 2px;}' +
    '.lecture{margin-top:12px;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);background:var(--surface,#fff);padding:10px 12px;font-size:0.93rem;line-height:1.45;}' +
    '.lecture .valeurs{font-family:var(--mono,monospace);font-size:12.5px;color:var(--ink-soft,#6b6055);margin-bottom:4px;font-variant-numeric:tabular-nums;}' +
    '.sens-pos{color:var(--good,#2f7a4f);font-weight:600;}' +
    '.sens-neg{color:var(--bad,#b23a3a);font-weight:600;}' +
    '.sens-nul{color:var(--plan-ink,#443a80);font-weight:600;}' +
    '.alerte{margin-top:6px;font-weight:600;}' +
    '.alerte-extremum{color:var(--good,#2f7a4f);}' +
    '.alerte-inflexion{color:var(--bad,#b23a3a);}' +
    '.curseur{display:flex;flex-direction:column;gap:4px;margin-top:14px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);text-align:center;}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;min-height:44px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);min-height:44px;}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;}' +
    '.case{display:flex;align-items:center;gap:10px;min-height:44px;cursor:pointer;font-size:0.93rem;}' +
    '.case input{width:22px;height:22px;accent-color:var(--plan,#5b4ea3);}' +
    '.boutons{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;}' +
    'button{min-height:44px;font:inherit;font-size:0.88rem;padding:6px 12px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);cursor:pointer;}' +
    'button.extremum{border-color:var(--good,#2f7a4f);color:var(--good,#2f7a4f);}' +
    'button.inflexion{border-color:var(--bad,#b23a3a);color:var(--bad,#b23a3a);}' +
    'button.reset{background:var(--accent-soft,#f4e3d1);border-color:var(--accent-soft-line,#e6c8a4);color:var(--accent-ink,#7a3212);font-weight:600;}' +
    'button:focus-visible,select:focus-visible,input:focus-visible{outline:2px solid var(--plan,#5b4ea3);outline-offset:2px;}' +
    '.legende-reperes{font-size:0.82rem;color:var(--ink-soft,#6b6055);margin-top:6px;line-height:1.4;}' +
    '.pastille{display:inline-block;width:10px;height:10px;border-radius:50%;border:2px solid;margin-right:4px;vertical-align:-1px;}' +
    '.pastille-e{border-color:var(--good,#2f7a4f);}' +
    '.pastille-i{border-color:var(--bad,#b23a3a);}' +
    '</style>' +
    '<div class="choix"><label for="fonction">Fonction étudiée</label><select id="fonction"></select></div>' +
    '<div class="graphes">' +
    '<svg id="svg-f" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Graphique de f"></svg>' +
    '<svg id="svg-fp" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Graphique de f prime"></svg>' +
    '</div>' +
    '<div class="formules" id="formules"></div>' +
    '<div class="legende-reperes"><span class="pastille pastille-e"></span>f′ = 0 : extremum de f &nbsp; <span class="pastille pastille-i"></span>extremum de f′ : inflexion de f</div>' +
    '<div class="lecture" aria-live="polite"><div class="valeurs" id="valeurs"></div><div id="sens"></div><div id="alerte" class="alerte"></div></div>' +
    '<div class="curseur"><label for="x">x — fais glisser le point sur f</label><div class="curseur-row">' +
    '<input type="range" id="x" min="0" max="' + NB_PAS + '" step="1" value="0"><span class="curseur-valeur" id="x-valeur"></span></div></div>' +
    '<label class="case"><input type="checkbox" id="toute"> Montrer toute la courbe de f′</label>' +
    '<div class="boutons" id="boutons"></div>';

  class FEtFprimeWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._s = shadow;
      this._select = shadow.getElementById("fonction");
      this._svgF = shadow.getElementById("svg-f");
      this._svgFp = shadow.getElementById("svg-fp");
      this._inputX = shadow.getElementById("x");
      this._caseToute = shadow.getElementById("toute");
      var self = this;
      FONCTIONS.forEach(function (fn, i) {
        var o = document.createElement("option");
        o.value = String(i);
        o.textContent = fn.nom;
        self._select.appendChild(o);
      });
    }

    connectedCallback() {
      var self = this;
      this._onSelect = function () { self._choisir(parseInt(self._select.value, 10)); };
      this._onX = function () { self._pas = parseInt(self._inputX.value, 10); self._visiter(self._pas); self._rendre(); };
      this._onCase = function () { self._rendre(); };
      this._select.addEventListener("change", this._onSelect);
      this._inputX.addEventListener("input", this._onX);
      this._caseToute.addEventListener("change", this._onCase);
      this._choisir(0);
    }

    disconnectedCallback() {
      this._select.removeEventListener("change", this._onSelect);
      this._inputX.removeEventListener("input", this._onX);
      this._caseToute.removeEventListener("change", this._onCase);
    }

    _xDePas(p) { var fn = this._fn; return fn.xMin + (p / NB_PAS) * (fn.xMax - fn.xMin); }
    _pasDeX(x) { var fn = this._fn; return Math.round((x - fn.xMin) / (fn.xMax - fn.xMin) * NB_PAS); }

    _choisir(i) {
      var self = this;
      this._fn = FONCTIONS[i];
      this._select.value = String(i);
      this._visites = new Uint8Array(NB_PAS + 1);
      this._pas = this._pasDeX(this._fn.xDefaut);
      this._inputX.value = String(this._pas);
      this._visiter(this._pas);
      this._s.getElementById("formules").textContent = this._fn.nom + "   ·   " + this._fn.derivee;
      var boutons = this._s.getElementById("boutons");
      boutons.innerHTML = "";
      this._fn.remarquables.forEach(function (r) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = r.type;
        b.textContent = (r.type === "extremum" ? "Extremum en " : "Inflexion en ") + r.libre;
        b.addEventListener("click", function () { self._allerA(r.x); });
        boutons.appendChild(b);
      });
      var reset = document.createElement("button");
      reset.type = "button";
      reset.className = "reset";
      reset.textContent = "Effacer la trace";
      reset.addEventListener("click", function () {
        self._visites = new Uint8Array(NB_PAS + 1);
        self._visiter(self._pas);
        self._rendre();
      });
      boutons.appendChild(reset);
      this._rendre();
    }

    // Va à un point remarquable : la trace se complète sur tout le trajet parcouru (comme si on
    // avait fait glisser le curseur), et la valeur EXACTE de x est utilisée pour le texte.
    _allerA(x) {
      var cible = this._pasDeX(x);
      var a = Math.min(cible, this._pas), b = Math.max(cible, this._pas);
      for (var p = a; p <= b; p++) this._visites[p] = 1;
      this._pas = cible;
      this._xExact = x;
      this._inputX.value = String(cible);
      this._rendre();
      this._xExact = null;
    }

    _visiter(p) {
      // Remplit aussi les pas sautés depuis la dernière position (glissement rapide).
      if (this._dernierPas != null && Math.abs(this._dernierPas - p) < 60) {
        var a = Math.min(this._dernierPas, p), b = Math.max(this._dernierPas, p);
        for (var q = a; q <= b; q++) this._visites[q] = 1;
      }
      this._visites[p] = 1;
      this._dernierPas = p;
    }

    _px(win, x, y) {
      var fn = this._fn;
      var px = ML + (x - fn.xMin) / (fn.xMax - fn.xMin) * (W - ML - MR);
      var py = H - MB - (y - win.min) / (win.max - win.min) * (H - MT - MB);
      return [px, py];
    }

    _cadre(svg, win, yTicks, titre, classeTitre, idClip) {
      var fn = this._fn;
      svg.innerHTML = "";
      var defs = svgEl("defs", {});
      var m = svgEl("marker", { id: "fl-" + idClip, markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      m.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(m);
      var clip = svgEl("clipPath", { id: "clip-" + idClip });
      clip.appendChild(svgEl("rect", { x: ML, y: MT, width: W - ML - MR, height: H - MT - MB }));
      defs.appendChild(clip);
      svg.appendChild(defs);
      var self = this;
      // Axe des x : en y = 0 s'il est dans la fenêtre, sinon en bas du cadre.
      var y0 = win.min <= 0 && win.max >= 0 ? 0 : win.min;
      var pAxe = this._px(win, fn.xMin, y0);
      // Axe des y : en x = 0 s'il est dans la fenêtre, sinon au bord gauche.
      var x0 = fn.xMin <= 0 && fn.xMax >= 0 ? 0 : fn.xMin;
      var pAxeY = this._px(win, x0, win.min);
      yTicks.forEach(function (t) {
        var p = self._px(win, fn.xMin, t);
        svg.appendChild(svgEl("line", { x1: ML, x2: W - MR, y1: p[1].toFixed(1), y2: p[1].toFixed(1), class: "grille" }));
        svg.appendChild(svgEl("line", { x1: (pAxeY[0] - 3).toFixed(1), x2: (pAxeY[0] + 3).toFixed(1), y1: p[1].toFixed(1), y2: p[1].toFixed(1), class: "tick" }));
        var tx = svgEl("text", { x: (pAxeY[0] - 5).toFixed(1), y: (p[1] + 3).toFixed(1), "text-anchor": "end", class: "tick-label" });
        tx.textContent = fmt(t, 3);
        svg.appendChild(tx);
      });
      svg.appendChild(svgEl("line", { x1: ML - 4, x2: W - 4, y1: pAxe[1].toFixed(1), y2: pAxe[1].toFixed(1), class: "axe", "marker-end": "url(#fl-" + idClip + ")" }));
      svg.appendChild(svgEl("line", { x1: pAxeY[0].toFixed(1), x2: pAxeY[0].toFixed(1), y1: H - MB + 4, y2: 4, class: "axe", "marker-end": "url(#fl-" + idClip + ")" }));
      fn.xTicks.forEach(function (t) {
        var p = self._px(win, t, y0);
        svg.appendChild(svgEl("line", { x1: p[0].toFixed(1), x2: p[0].toFixed(1), y1: (p[1] - 3).toFixed(1), y2: (p[1] + 3).toFixed(1), class: "tick" }));
        var basLibre = p[1] + 13 <= H - 2;
        var tx = svgEl("text", { x: p[0].toFixed(1), y: (basLibre ? p[1] + 13 : p[1] - 6).toFixed(1), "text-anchor": "middle", class: "tick-label" });
        tx.textContent = fmt(t, 2);
        svg.appendChild(tx);
      });
      var ax = svgEl("text", { x: W - 10, y: (pAxe[1] - 6).toFixed(1), "text-anchor": "end", class: "tick-label" });
      ax.textContent = "x";
      svg.appendChild(ax);
      var t = svgEl("text", { x: ML + 6, y: MT + 12, class: "titre " + classeTitre });
      t.textContent = titre;
      svg.appendChild(t);
      var g = svgEl("g", { "clip-path": "url(#clip-" + idClip + ")" });
      svg.appendChild(g);
      return g;
    }

    _chemin(win, f, filtre) {
      var d = "", ouvert = false;
      for (var p = 0; p <= NB_PAS; p++) {
        var x = this._xDePas(p), y = f(x);
        var ok = isFinite(y) && (!filtre || filtre(p));
        if (ok) {
          var yc = Math.max(win.min - 1 * (win.max - win.min), Math.min(win.max + 1 * (win.max - win.min), y));
          var q = this._px(win, x, yc);
          d += (ouvert ? "L" : "M") + q[0].toFixed(1) + " " + q[1].toFixed(1) + " ";
          ouvert = true;
        } else {
          ouvert = false;
        }
      }
      return d.trim();
    }

    _rendre() {
      var fn = this._fn, self = this;
      var x = this._xExact != null ? this._xExact : this._xDePas(this._pas);
      var y = fn.f(x), pente = fn.fp(x);
      var toute = this._caseToute.checked;

      // ---- graphique de f
      var gF = this._cadre(this._svgF, fn.fWin, fn.fTicks, "f", "titre-f", "f");
      gF.appendChild(svgEl("path", { d: this._chemin(fn.fWin, fn.f), class: "courbe-f" }));
      var dx = (fn.xMax - fn.xMin) * 0.16;
      var t0 = this._px(fn.fWin, x - dx, y - pente * dx), t1 = this._px(fn.fWin, x + dx, y + pente * dx);
      gF.appendChild(svgEl("line", { x1: t0[0].toFixed(1), y1: t0[1].toFixed(1), x2: t1[0].toFixed(1), y2: t1[1].toFixed(1), class: "tangente" }));
      fn.remarquables.forEach(function (r) {
        var q = self._px(fn.fWin, r.x, fn.f(r.x));
        gF.appendChild(svgEl("circle", { cx: q[0].toFixed(1), cy: q[1].toFixed(1), r: 4.5, class: r.type === "extremum" ? "repere-extremum" : "repere-inflexion" }));
      });
      var pF = this._px(fn.fWin, x, y);
      gF.appendChild(svgEl("circle", { cx: pF[0].toFixed(1), cy: pF[1].toFixed(1), r: 5, class: "point-f" }));

      // ---- graphique de f′ : zones de signe, trace visitée, point courant
      var gP = this._cadre(this._svgFp, fn.fpWin, fn.fpTicks, "f′", "titre-fp", "fp");
      var haut = this._px(fn.fpWin, fn.xMin, fn.fpWin.max)[1], zero = this._px(fn.fpWin, fn.xMin, 0)[1], bas = this._px(fn.fpWin, fn.xMin, fn.fpWin.min)[1];
      gP.appendChild(svgEl("rect", { x: ML, y: haut.toFixed(1), width: W - ML - MR, height: Math.max(0, zero - haut).toFixed(1), class: "zone-pos" }));
      gP.appendChild(svgEl("rect", { x: ML, y: zero.toFixed(1), width: W - ML - MR, height: Math.max(0, bas - zero).toFixed(1), class: "zone-neg" }));
      gP.appendChild(svgEl("path", { d: this._chemin(fn.fpWin, fn.fp), class: "courbe-fp-fantome" }));
      var vis = this._visites;
      gP.appendChild(svgEl("path", { d: this._chemin(fn.fpWin, fn.fp, toute ? null : function (p) { return vis[p] === 1; }), class: "courbe-fp" }));
      fn.remarquables.forEach(function (r) {
        var q = self._px(fn.fpWin, r.x, fn.fp(r.x));
        gP.appendChild(svgEl("circle", { cx: q[0].toFixed(1), cy: q[1].toFixed(1), r: 4.5, class: r.type === "extremum" ? "repere-extremum" : "repere-inflexion" }));
      });
      var pP = this._px(fn.fpWin, x, pente);
      gP.appendChild(svgEl("line", { x1: pP[0].toFixed(1), x2: pP[0].toFixed(1), y1: MT, y2: H - MB, class: "guide" }));
      gP.appendChild(svgEl("circle", { cx: pP[0].toFixed(1), cy: pP[1].toFixed(1), r: 5, class: "point-fp" }));
      gF.appendChild(svgEl("line", { x1: pF[0].toFixed(1), x2: pF[0].toFixed(1), y1: pF[1].toFixed(1), y2: H - MB, class: "guide" }));

      // ---- textes
      this._s.getElementById("x-valeur").textContent = fmt(x, 2);
      this._s.getElementById("valeurs").textContent =
        "x = " + fmt(x, 2) + "   f(x) ≈ " + fmt(y, 3) + "   pente f′(x) ≈ " + fmt(pente, 3);
      var proche = null;
      var tol = (fn.xMax - fn.xMin) / NB_PAS * 1.6;
      fn.remarquables.forEach(function (r) { if (Math.abs(r.x - x) <= tol) proche = r; });
      var sens = this._s.getElementById("sens");
      var seuilNul = (fn.fpWin.max - fn.fpWin.min) * 0.004;
      if (proche && proche.type === "extremum" || Math.abs(pente) < seuilNul) {
        sens.innerHTML = '<span class="sens-nul">f′(x) ≈ 0</span> : la tangente est horizontale.';
      } else if (pente > 0) {
        sens.innerHTML = '<span class="sens-pos">f′(x) &gt; 0</span> (point dans la bande verte) : f est <b>croissante</b> autour de ce x.';
      } else {
        sens.innerHTML = '<span class="sens-neg">f′(x) &lt; 0</span> (point dans la bande rouge) : f est <b>décroissante</b> autour de ce x.';
      }
      var alerte = this._s.getElementById("alerte");
      if (proche && proche.type === "extremum") {
        alerte.className = "alerte alerte-extremum";
        alerte.textContent = "Tangente horizontale : f′ s'annule en changeant de signe, f a un extremum (" + proche.detail + ").";
      } else if (proche && proche.type === "inflexion") {
        alerte.className = "alerte alerte-inflexion";
        alerte.textContent = "Inflexion de f : " + proche.detail + ". La pente cesse d'augmenter (ou de diminuer), f change de concavité.";
      } else {
        alerte.className = "alerte";
        alerte.textContent = "";
      }
    }
  }

  if (!customElements.get("f-et-fprime-widget")) {
    customElements.define("f-et-fprime-widget", FEtFprimeWidget);
  }
})();
