(function () {
  "use strict";

  /* ================================================================
   * <f-fprime-exponentielle-widget> — atelier interactif (6e, ch. 2, § 3,
   * « Graphique de la dérivée ») : deux graphiques superposés sur les MÊMES
   * abscisses, f en haut et f′ en bas, pour quelques fonctions exponentielles
   * du chapitre. Un point se déplace sur f (curseur, ou glisser sur l'un des
   * deux graphiques) avec sa tangente et sa pente ; le point (x ; f′(x)) lui
   * correspond en bas. Code couleur unique, partout : VERT là où f′ > 0 (f
   * croissante), ROUGE là où f′ < 0 (f décroissante) — sur la courbe de f,
   * sur la courbe de f′, sur la tangente et sur les deux points. Repères :
   * extremum de f (f′ s'annule en changeant de signe, cercle foncé) et
   * inflexion de f (extremum de f′, cercle violet). Fenêtres FIXES par
   * fonction, jamais recalculées depuis x. Web Component (Shadow DOM).
   * ================================================================ */

  var E = Math.exp;

  var FONCTIONS = [
    {
      nom: "f(x) = (x − 1)·eˣ", derivee: "f′(x) = x·eˣ",
      f: function (x) { return (x - 1) * E(x); }, fp: function (x) { return x * E(x); },
      xMin: -4.5, xMax: 1.3, xDefaut: -3,
      fWin: { min: -1.4, max: 3.2 }, fpWin: { min: -0.8, max: 3.5 },
      xTicks: [-4, -3, -2, -1, 1], fTicks: [-1, 1, 2, 3], fpTicks: [1, 2, 3],
      remarquables: [
        { x: -1, type: "inflexion", libre: "x = −1", detail: "f′ est minimale en x = −1 (f′(−1) = −1/e ≈ −0,37)" },
        { x: 0, type: "extremum", libre: "x = 0", detail: "minimum de f : f(0) = −1" },
      ],
    },
    {
      nom: "f(x) = x·eˣ", derivee: "f′(x) = (x + 1)·eˣ",
      f: function (x) { return x * E(x); }, fp: function (x) { return (x + 1) * E(x); },
      xMin: -5, xMax: 1, xDefaut: -4,
      fWin: { min: -0.8, max: 2.9 }, fpWin: { min: -0.5, max: 3 },
      xTicks: [-4, -3, -2, -1, 1], fTicks: [1, 2], fpTicks: [1, 2],
      remarquables: [
        { x: -2, type: "inflexion", libre: "x = −2", detail: "f′ est minimale en x = −2 (f′(−2) = −1/e² ≈ −0,14)" },
        { x: -1, type: "extremum", libre: "x = −1", detail: "minimum de f : f(−1) = −1/e ≈ −0,37" },
      ],
    },
    {
      nom: "f(x) = e⁻ˣ²", derivee: "f′(x) = −2x·e⁻ˣ²",
      f: function (x) { return E(-x * x); }, fp: function (x) { return -2 * x * E(-x * x); },
      xMin: -2.5, xMax: 2.5, xDefaut: -2,
      fWin: { min: -0.25, max: 1.3 }, fpWin: { min: -1.1, max: 1.1 },
      xTicks: [-2, -1, 1, 2], fTicks: [0.5, 1], fpTicks: [-1, -0.5, 0.5, 1],
      remarquables: [
        { x: -Math.SQRT1_2, type: "inflexion", libre: "x = −√2/2", detail: "f′ est maximale en x = −√2/2 ≈ −0,71 (f′ ≈ 0,86)" },
        { x: 0, type: "extremum", libre: "x = 0", detail: "maximum de f : f(0) = 1" },
        { x: Math.SQRT1_2, type: "inflexion", libre: "x = √2/2", detail: "f′ est minimale en x = √2/2 ≈ 0,71 (f′ ≈ −0,86)" },
      ],
    },
    {
      nom: "f(x) = (eˣ + e⁻ˣ)/2", derivee: "f′(x) = (eˣ − e⁻ˣ)/2",
      f: function (x) { return (E(x) + E(-x)) / 2; }, fp: function (x) { return (E(x) - E(-x)) / 2; },
      xMin: -2.2, xMax: 2.2, xDefaut: -1.8,
      fWin: { min: -0.5, max: 4.8 }, fpWin: { min: -4.8, max: 4.8 },
      xTicks: [-2, -1, 1, 2], fTicks: [1, 2, 3, 4], fpTicks: [-4, -2, 2, 4],
      remarquables: [{ x: 0, type: "extremum", libre: "x = 0", detail: "minimum de f : f(0) = 1" }],
      note: "f′ est croissante sur tout l’intervalle (aucun extremum) : f est convexe partout, sans point d’inflexion.",
    },
    {
      nom: "f(x) = x·e⁻ˣ", derivee: "f′(x) = (1 − x)·e⁻ˣ",
      f: function (x) { return x * E(-x); }, fp: function (x) { return (1 - x) * E(-x); },
      xMin: -0.6, xMax: 5, xDefaut: 0,
      fWin: { min: -1.2, max: 0.6 }, fpWin: { min: -0.4, max: 3 },
      xTicks: [1, 2, 3, 4, 5], fTicks: [-1, -0.5, 0.5], fpTicks: [1, 2, 3],
      remarquables: [
        { x: 1, type: "extremum", libre: "x = 1", detail: "maximum de f : f(1) = 1/e ≈ 0,37" },
        { x: 2, type: "inflexion", libre: "x = 2", detail: "f′ est minimale en x = 2 (f′(2) = −1/e² ≈ −0,14)" },
      ],
    },
    {
      nom: "f(x) = eˣ − 2", derivee: "f′(x) = eˣ",
      f: function (x) { return E(x) - 2; }, fp: function (x) { return E(x); },
      xMin: -3, xMax: 2, xDefaut: -2,
      fWin: { min: -2.4, max: 5.6 }, fpWin: { min: -0.6, max: 7.6 },
      xTicks: [-3, -2, -1, 1, 2], fTicks: [-2, 2, 4], fpTicks: [2, 4, 6],
      remarquables: [],
      note: "f′ > 0 partout : f est croissante partout… et pourtant f(0) = −1 < 0. Le graphique de f′ renseigne sur la croissance de f, jamais sur son signe.",
    },
  ];

  var NB_PAS = 400;
  var W = 340, H = 170, ML = 38, MR = 14, MT = 14, MB = 22;

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
    'svg{width:100%;max-width:340px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);display:block;touch-action:pan-y;cursor:ew-resize;user-select:none;-webkit-user-select:none;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.grille{stroke:var(--line,#e2d8c8);stroke-width:1;}' +
    '.tick{stroke:var(--ink-soft,#6b6055);stroke-width:1;}' +
    '.tick-label{font-size:9.5px;font-family:var(--mono,monospace);fill:var(--ink-faint,#9c9083);paint-order:stroke;stroke:var(--surface-2,#faf6f0);stroke-width:3px;}' +
    '.titre{font-size:12px;font-weight:700;fill:var(--ink,#241f1a);}' +
    '.c-pos{stroke:var(--good,#2f7a4f);stroke-width:2.6;fill:none;}' +
    '.c-neg{stroke:var(--bad,#b3261e);stroke-width:2.6;fill:none;}' +
    '.zone-pos{fill:var(--good,#2f7a4f);opacity:0.07;}' +
    '.zone-neg{fill:var(--bad,#b3261e);opacity:0.06;}' +
    '.t-pos{stroke:var(--good,#2f7a4f);}' +
    '.t-neg{stroke:var(--bad,#b3261e);}' +
    '.t-nul{stroke:var(--plan,#5b4ea3);}' +
    '.tangente{stroke-width:1.8;stroke-dasharray:6 4;}' +
    '.p-pos{fill:var(--good,#2f7a4f);}' +
    '.p-neg{fill:var(--bad,#b3261e);}' +
    '.p-nul{fill:var(--plan,#5b4ea3);}' +
    '.point{stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.guide{stroke:var(--ink-faint,#9c9083);stroke-width:1;stroke-dasharray:3 3;}' +
    '.repere-extremum{fill:var(--surface,#fff);stroke:var(--ink,#241f1a);stroke-width:2;}' +
    '.repere-inflexion{fill:var(--surface,#fff);stroke:var(--plan,#5b4ea3);stroke-width:2;}' +
    '.formules{font-family:var(--mono,monospace);font-size:12px;color:var(--ink-soft,#6b6055);text-align:center;margin:6px 0 2px;}' +
    '.legende{font-size:0.82rem;color:var(--ink-soft,#6b6055);margin-top:4px;line-height:1.5;text-align:center;}' +
    '.leg-pos{color:var(--good,#2f7a4f);font-weight:700;}' +
    '.leg-neg{color:var(--bad,#b3261e);font-weight:700;}' +
    '.pastille{display:inline-block;width:10px;height:10px;border-radius:50%;border:2px solid;margin:0 4px 0 6px;vertical-align:-1px;}' +
    '.pastille-e{border-color:var(--ink,#241f1a);}' +
    '.pastille-i{border-color:var(--plan,#5b4ea3);}' +
    '.lecture{margin-top:12px;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);background:var(--surface,#fff);padding:10px 12px;font-size:0.93rem;line-height:1.45;}' +
    '.valeurs{font-family:var(--mono,monospace);font-size:12.5px;color:var(--ink-soft,#6b6055);margin-bottom:4px;font-variant-numeric:tabular-nums;}' +
    '.sens-pos{color:var(--good,#2f7a4f);font-weight:700;}' +
    '.sens-neg{color:var(--bad,#b3261e);font-weight:700;}' +
    '.sens-nul{color:var(--plan-ink,#443a80);font-weight:700;}' +
    '.alerte{margin-top:6px;font-weight:600;}' +
    '.note{margin-top:6px;color:var(--ink-soft,#6b6055);}' +
    '.curseur{display:flex;flex-direction:column;gap:4px;margin-top:14px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);text-align:center;}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;min-height:44px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);min-height:44px;}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;}' +
    '.boutons{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;justify-content:center;}' +
    'button{min-height:44px;font:inherit;font-size:0.88rem;padding:6px 12px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);cursor:pointer;}' +
    'button.inflexion{border-color:var(--plan,#5b4ea3);color:var(--plan-ink,#443a80);}' +
    'button:focus-visible,select:focus-visible,input:focus-visible{outline:2px solid var(--accent,#a8471f);outline-offset:2px;}' +
    '</style>' +
    '<div class="choix"><label for="fonction">Fonction étudiée</label><select id="fonction"></select></div>' +
    '<div class="graphes">' +
    '<svg id="svg-f" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Graphique de f"></svg>' +
    '<svg id="svg-fp" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Graphique de f prime"></svg>' +
    '<div class="formules" id="formules"></div>' +
    '<div class="legende"><span class="leg-pos">vert : f′ &gt; 0, f croissante</span> · <span class="leg-neg">rouge : f′ &lt; 0, f décroissante</span><br>' +
    '<span class="pastille pastille-e"></span>extremum de f <span class="pastille pastille-i"></span>inflexion de f (extremum de f′)</div>' +
    '</div>' +
    '<div class="lecture" aria-live="polite"><div class="valeurs" id="valeurs"></div><div id="sens"></div><div id="alerte" class="alerte"></div><div id="note" class="note"></div></div>' +
    '<div class="curseur"><label for="x">x — fais glisser le point sur f (ou glisse sur un graphique)</label><div class="curseur-row">' +
    '<input type="range" id="x" min="0" max="' + NB_PAS + '" step="1" value="0"><span class="curseur-valeur" id="x-valeur"></span></div></div>' +
    '<div class="boutons" id="boutons"></div>';

  class FFprimeExponentielleWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._s = shadow;
      this._select = shadow.getElementById("fonction");
      this._svgF = shadow.getElementById("svg-f");
      this._svgFp = shadow.getElementById("svg-fp");
      this._inputX = shadow.getElementById("x");
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
      this._onX = function () { self._xExact = null; self._pas = parseInt(self._inputX.value, 10); self._rendre(); };
      this._glisse = false;
      // À la souris, empêcher la sélection du texte de la page pendant le glissement (au doigt,
      // touch-action: pan-y laisse le défilement vertical au navigateur).
      this._onDown = function (ev) { if (ev.pointerType === "mouse") ev.preventDefault(); self._glisse = true; self._depuisPointeur(ev); };
      this._onMove = function (ev) { if (self._glisse) self._depuisPointeur(ev); };
      this._onUp = function () { self._glisse = false; };
      this._select.addEventListener("change", this._onSelect);
      this._inputX.addEventListener("input", this._onX);
      [this._svgF, this._svgFp].forEach(function (s) {
        s.addEventListener("pointerdown", self._onDown);
        s.addEventListener("pointermove", self._onMove);
        s.addEventListener("pointerup", self._onUp);
        s.addEventListener("pointerleave", self._onUp);
        s.addEventListener("pointercancel", self._onUp);
      });
      this._choisir(0);
    }

    disconnectedCallback() {
      var self = this;
      this._select.removeEventListener("change", this._onSelect);
      this._inputX.removeEventListener("input", this._onX);
      [this._svgF, this._svgFp].forEach(function (s) {
        s.removeEventListener("pointerdown", self._onDown);
        s.removeEventListener("pointermove", self._onMove);
        s.removeEventListener("pointerup", self._onUp);
        s.removeEventListener("pointerleave", self._onUp);
        s.removeEventListener("pointercancel", self._onUp);
      });
    }

    _xDePas(p) { var fn = this._fn; return fn.xMin + (p / NB_PAS) * (fn.xMax - fn.xMin); }
    _pasDeX(x) { var fn = this._fn; return Math.round((x - fn.xMin) / (fn.xMax - fn.xMin) * NB_PAS); }

    _depuisPointeur(ev) {
      var r = ev.currentTarget.getBoundingClientRect();
      var vx = (ev.clientX - r.left) / r.width * W;
      var p = Math.round((vx - ML) / (W - ML - MR) * NB_PAS);
      p = Math.max(0, Math.min(NB_PAS, p));
      this._pas = p;
      this._xExact = null;
      this._inputX.value = String(p);
      this._rendre();
    }

    _choisir(i) {
      var self = this;
      this._fn = FONCTIONS[i];
      this._select.value = String(i);
      this._pas = this._pasDeX(this._fn.xDefaut);
      this._xExact = null;
      this._inputX.value = String(this._pas);
      this._s.getElementById("formules").textContent = this._fn.nom + "   ·   " + this._fn.derivee;
      this._s.getElementById("note").textContent = this._fn.note || "";
      var boutons = this._s.getElementById("boutons");
      boutons.innerHTML = "";
      this._fn.remarquables.forEach(function (r) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = r.type;
        b.textContent = (r.type === "extremum" ? "Extremum en " : "Inflexion en ") + r.libre;
        b.addEventListener("click", function () {
          self._pas = self._pasDeX(r.x);
          self._xExact = r.x;
          self._inputX.value = String(self._pas);
          self._rendre();
        });
        boutons.appendChild(b);
      });
      this._rendre();
    }

    _px(win, x, y) {
      var fn = this._fn;
      var px = ML + (x - fn.xMin) / (fn.xMax - fn.xMin) * (W - ML - MR);
      var py = H - MB - (y - win.min) / (win.max - win.min) * (H - MT - MB);
      return [px, py];
    }

    _cadre(svg, win, yTicks, titre, id) {
      var fn = this._fn, self = this;
      svg.innerHTML = "";
      var defs = svgEl("defs", {});
      var m = svgEl("marker", { id: "fl-" + id, markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      m.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(m);
      var clip = svgEl("clipPath", { id: "clip-" + id });
      clip.appendChild(svgEl("rect", { x: ML, y: MT, width: W - ML - MR, height: H - MT - MB }));
      defs.appendChild(clip);
      svg.appendChild(defs);
      var y0 = win.min <= 0 && win.max >= 0 ? 0 : win.min;
      var pAxe = this._px(win, fn.xMin, y0);
      var x0 = fn.xMin <= 0 && fn.xMax >= 0 ? 0 : fn.xMin;
      var pAxeY = this._px(win, x0, win.min);
      yTicks.forEach(function (t) {
        var p = self._px(win, fn.xMin, t);
        svg.appendChild(svgEl("line", { x1: ML, x2: W - MR, y1: p[1].toFixed(1), y2: p[1].toFixed(1), class: "grille" }));
        svg.appendChild(svgEl("line", { x1: (pAxeY[0] - 3).toFixed(1), x2: (pAxeY[0] + 3).toFixed(1), y1: p[1].toFixed(1), y2: p[1].toFixed(1), class: "tick" }));
        var tx = svgEl("text", { x: (pAxeY[0] - 5).toFixed(1), y: (p[1] + 3).toFixed(1), "text-anchor": "end", class: "tick-label" });
        tx.textContent = fmt(t, 2);
        svg.appendChild(tx);
      });
      svg.appendChild(svgEl("line", { x1: ML - 4, x2: W - 4, y1: pAxe[1].toFixed(1), y2: pAxe[1].toFixed(1), class: "axe", "marker-end": "url(#fl-" + id + ")" }));
      svg.appendChild(svgEl("line", { x1: pAxeY[0].toFixed(1), x2: pAxeY[0].toFixed(1), y1: H - MB + 4, y2: 4, class: "axe", "marker-end": "url(#fl-" + id + ")" }));
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
      // Titre dans le coin opposé à l'axe vertical (jamais sur l'axe).
      var aGauche = pAxeY[0] > ML + 60;
      var t = svgEl("text", { x: aGauche ? ML + 6 : W - MR - 6, y: MT + 12, "text-anchor": aGauche ? "start" : "end", class: "titre" });
      t.textContent = titre;
      svg.appendChild(t);
      var g = svgEl("g", { "clip-path": "url(#clip-" + id + ")" });
      svg.appendChild(g);
      return g;
    }

    // Courbe découpée selon le signe de f′ : deux chemins, vert (f′ > 0) et rouge (f′ < 0).
    _cheminsSignes(win, f) {
      var fn = this._fn, dPos = "", dNeg = "", prec = null;
      for (var p = 0; p <= NB_PAS; p++) {
        var x = this._xDePas(p), y = f(x), s = fn.fp(x) >= 0;
        var yc = Math.max(win.min - (win.max - win.min), Math.min(win.max + (win.max - win.min), y));
        var q = this._px(win, x, yc);
        var seg = q[0].toFixed(1) + " " + q[1].toFixed(1) + " ";
        if (prec === null || prec.s !== s) {
          // Le nouveau morceau repart du point précédent : la courbe reste continue au changement de couleur.
          var depart = prec ? "M" + prec.seg + "L" : "M";
          if (s) dPos += depart + seg; else dNeg += depart + seg;
        } else if (s) dPos += "L" + seg; else dNeg += "L" + seg;
        prec = { s: s, seg: seg };
      }
      return [dPos.trim(), dNeg.trim()];
    }

    _rendre() {
      var fn = this._fn, self = this;
      var x = this._xExact != null ? this._xExact : this._xDePas(this._pas);
      var y = fn.f(x), pente = fn.fp(x);
      var seuilNul = (fn.fpWin.max - fn.fpWin.min) * 0.004;
      var signe = Math.abs(pente) < seuilNul ? "nul" : pente > 0 ? "pos" : "neg";

      // ---- graphique de f
      var gF = this._cadre(this._svgF, fn.fWin, fn.fTicks, "f", "f");
      var cf = this._cheminsSignes(fn.fWin, fn.f);
      gF.appendChild(svgEl("path", { d: cf[0], class: "c-pos" }));
      gF.appendChild(svgEl("path", { d: cf[1], class: "c-neg" }));
      var dx = (fn.xMax - fn.xMin) * 0.18;
      var t0 = this._px(fn.fWin, x - dx, y - pente * dx), t1 = this._px(fn.fWin, x + dx, y + pente * dx);
      gF.appendChild(svgEl("line", { x1: t0[0].toFixed(1), y1: t0[1].toFixed(1), x2: t1[0].toFixed(1), y2: t1[1].toFixed(1), class: "tangente t-" + signe }));
      fn.remarquables.forEach(function (r) {
        var q = self._px(fn.fWin, r.x, fn.f(r.x));
        gF.appendChild(svgEl("circle", { cx: q[0].toFixed(1), cy: q[1].toFixed(1), r: 4.5, class: "repere-" + r.type }));
      });
      var pF = this._px(fn.fWin, x, y);
      gF.appendChild(svgEl("line", { x1: pF[0].toFixed(1), x2: pF[0].toFixed(1), y1: pF[1].toFixed(1), y2: H - MB, class: "guide" }));
      gF.appendChild(svgEl("circle", { cx: pF[0].toFixed(1), cy: pF[1].toFixed(1), r: 5.5, class: "point p-" + signe }));

      // ---- graphique de f′
      var gP = this._cadre(this._svgFp, fn.fpWin, fn.fpTicks, "f′", "fp");
      var haut = this._px(fn.fpWin, fn.xMin, fn.fpWin.max)[1], zero = this._px(fn.fpWin, fn.xMin, 0)[1], bas = this._px(fn.fpWin, fn.xMin, fn.fpWin.min)[1];
      gP.appendChild(svgEl("rect", { x: ML, y: haut.toFixed(1), width: W - ML - MR, height: Math.max(0, zero - haut).toFixed(1), class: "zone-pos" }));
      gP.appendChild(svgEl("rect", { x: ML, y: zero.toFixed(1), width: W - ML - MR, height: Math.max(0, bas - zero).toFixed(1), class: "zone-neg" }));
      var cp = this._cheminsSignes(fn.fpWin, fn.fp);
      gP.appendChild(svgEl("path", { d: cp[0], class: "c-pos" }));
      gP.appendChild(svgEl("path", { d: cp[1], class: "c-neg" }));
      fn.remarquables.forEach(function (r) {
        var q = self._px(fn.fpWin, r.x, fn.fp(r.x));
        gP.appendChild(svgEl("circle", { cx: q[0].toFixed(1), cy: q[1].toFixed(1), r: 4.5, class: "repere-" + r.type }));
      });
      var pP = this._px(fn.fpWin, x, pente);
      gP.appendChild(svgEl("line", { x1: pP[0].toFixed(1), x2: pP[0].toFixed(1), y1: MT, y2: H - MB, class: "guide" }));
      gP.appendChild(svgEl("circle", { cx: pP[0].toFixed(1), cy: pP[1].toFixed(1), r: 5.5, class: "point p-" + signe }));

      // ---- textes
      this._s.getElementById("x-valeur").textContent = fmt(x, 2);
      this._s.getElementById("valeurs").textContent =
        "x = " + fmt(x, 2) + "   f(x) ≈ " + fmt(y, 3) + "   pente de la tangente : f′(x) ≈ " + fmt(pente, 3);
      var sens = this._s.getElementById("sens");
      if (signe === "nul") sens.innerHTML = '<span class="sens-nul">f′(x) ≈ 0</span> : la tangente est horizontale.';
      else if (signe === "pos") sens.innerHTML = '<span class="sens-pos">f′(x) &gt; 0</span> : la tangente monte, f est <b>croissante</b> autour de ce x.';
      else sens.innerHTML = '<span class="sens-neg">f′(x) &lt; 0</span> : la tangente descend, f est <b>décroissante</b> autour de ce x.';
      var proche = null, tol = (fn.xMax - fn.xMin) / NB_PAS * 1.6;
      fn.remarquables.forEach(function (r) { if (Math.abs(r.x - x) <= tol) proche = r; });
      var alerte = this._s.getElementById("alerte");
      if (proche && proche.type === "extremum") alerte.textContent = "f′ s’annule en changeant de signe : " + proche.detail + ".";
      else if (proche) alerte.textContent = "Point d’inflexion de f : " + proche.detail + ".";
      else alerte.textContent = "";
    }
  }

  if (!customElements.get("f-fprime-exponentielle-widget")) customElements.define("f-fprime-exponentielle-widget", FFprimeExponentielleWidget);
})();
