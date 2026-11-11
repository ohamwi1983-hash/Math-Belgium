(function () {
  "use strict";

  /* ================================================================
   * <valeurs-remarquables-widget> — atelier interactif (4e, chapitre 5,
   * section « Les valeurs remarquables »).
   * - « Explorer » : un angle de référence (30°, 45°, 60°) fait
   *   apparaître sa « famille » de 4 angles sur le cercle (30° : 30°,
   *   150°, 210°, 330°) — même valeur absolue, signe donné par le
   *   quadrant — pour sin, cos ou tan ; option « sur les axes » (0°,
   *   90°, 180°, 270°). Tableau des valeurs exactes.
   * - « Défi » : un des 16 angles remarquables et une fonction ; l'élève
   *   choisit la valeur exacte parmi 4 propositions — un seul essai,
   *   correction (angle de référence + signe), jamais de score.
   * Fenêtre fixe. Web Component (Shadow DOM).
   * ================================================================ */

  var D2R = Math.PI / 180;
  var TAILLE = 300, CX = 150, CY = 150, R = 80, AXE = 135;
  var SEIZE = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];
  var EXACT = {
    sin: { 0: "0", 30: "1/2", 45: "√2/2", 60: "√3/2", 90: "1" },
    cos: { 0: "1", 30: "√3/2", 45: "√2/2", 60: "1/2", 90: "0" },
    tan: { 0: "0", 30: "√3/3", 45: "1", 60: "√3", 90: null },
  };
  var NOMS_Q = ["", "I", "II", "III", "IV"];
  var NON_DEF = "non définie";

  function deg(a) { return String(a).replace("-", "−") + "°"; }
  function sinD(a) { var v = Math.sin(a * D2R); return Math.abs(v) < 1e-12 ? 0 : v; }
  function cosD(a) { var v = Math.cos(a * D2R); return Math.abs(v) < 1e-12 ? 0 : v; }
  function pt(a, r) { return [CX + r * Math.cos(a * D2R), CY - r * Math.sin(a * D2R)]; }
  function randInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function melanger(t) {
    for (var i = t.length - 1; i > 0; i--) { var j = randInt(0, i); var x = t[i]; t[i] = t[j]; t[j] = x; }
    return t;
  }

  function quadrant(a) {
    if (a > 0 && a < 90) return 1;
    if (a > 90 && a < 180) return 2;
    if (a > 180 && a < 270) return 3;
    if (a > 270 && a < 360) return 4;
    return 0;
  }
  function reference(a) {
    var q = quadrant(a);
    if (q === 1) return { ref: a, calcul: deg(a) };
    if (q === 2) return { ref: 180 - a, calcul: "180° − " + deg(a) + " = " + deg(180 - a) };
    if (q === 3) return { ref: a - 180, calcul: deg(a) + " − 180° = " + deg(a - 180) };
    if (q === 4) return { ref: 360 - a, calcul: "360° − " + deg(a) + " = " + deg(360 - a) };
    return { ref: a % 180 === 0 ? 0 : 90, calcul: "" };
  }
  function numerique(fn, a) {
    var s = sinD(a), c = cosD(a);
    if (fn === "sin") return s;
    if (fn === "cos") return c;
    return Math.abs(c) < 1e-12 ? null : s / c;
  }
  function exacte(fn, a) {
    var v = numerique(fn, a);
    if (v === null) return NON_DEF;
    var ex = EXACT[fn][reference(a).ref];
    if (ex === "0") return "0";
    return (v < 0 ? "−" : "") + ex;
  }
  function oppose(v) {
    if (v === "0" || v === NON_DEF) return null;
    return v.charAt(0) === "−" ? v.slice(1) : "−" + v;
  }
  var ECHANGE = {
    sin: { "0": "1", "1/2": "√3/2", "√3/2": "1/2", "√2/2": "1/2", "1": "0" },
    tan: { "0": NON_DEF, "√3/3": "√3", "√3": "√3/3", "1": "√3", "non définie": "0" },
  };
  ECHANGE.cos = ECHANGE.sin;
  function echange(fn, v) {
    if (v === NON_DEF) return ECHANGE[fn][NON_DEF] || null;
    var neg = v.charAt(0) === "−";
    var abs = neg ? v.slice(1) : v;
    var e = ECHANGE[fn][abs];
    if (!e) return null;
    if (e === "0" || e === NON_DEF) return e;
    return (neg ? "−" : "") + e;
  }
  function tousSignes(fn) {
    var base = fn === "tan" ? ["0", "√3/3", "1", "√3"] : ["0", "1/2", "√2/2", "√3/2", "1"];
    var t = [];
    base.forEach(function (b) { t.push(b); if (b !== "0") t.push("−" + b); });
    if (fn === "tan") t.push(NON_DEF);
    return t;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}' +
    '*{box-sizing:border-box;}' +
    '[hidden]{display:none!important;}' +
    'button{font-family:inherit;}' +
    '.barre{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:0 0 10px;}' +
    '.barre button{min-height:44px;min-width:52px;padding:6px 14px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);font-weight:600;font-size:.92rem;cursor:pointer;}' +
    '.barre button[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);border-color:var(--accent,#a8471f);color:var(--accent-ink,#7a3212);}' +
    '.modes{margin-bottom:14px;}' +
    '.disposition{display:flex;flex-wrap:wrap;gap:16px;justify-content:center;align-items:flex-start;margin-top:6px;}' +
    '.graphe{flex:1 1 260px;max-width:340px;display:flex;justify-content:center;}' +
    'svg{width:100%;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.panneau{flex:1 1 260px;max-width:420px;display:flex;flex-direction:column;gap:10px;min-width:0;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}' +
    '.fleche-axe{fill:var(--ink-soft,#6b6055);}' +
    '.txt-axe{font-size:11px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.cercle{stroke:var(--ink-faint,#9c9083);stroke-width:1.4;fill:none;}' +
    '.pt-faible{fill:var(--ink-faint,#9c9083);}' +
    '.pt-fam{fill:var(--accent,#a8471f);}' +
    '.txt-fam{font-size:11px;font-weight:700;fill:var(--accent-ink,#7a3212);font-family:var(--sans,sans-serif);}' +
    '.rect{stroke:var(--plan,#5b4ea3);stroke-width:1.2;stroke-dasharray:3 3;fill:none;}' +
    '.proj{stroke:var(--accent,#a8471f);stroke-width:1.2;stroke-dasharray:4 3;}' +
    '.marque-plus{stroke:var(--good,#2f7a4f);stroke-width:4;}' +
    '.marque-moins{stroke:var(--bad,#b3261e);stroke-width:4;}' +
    '.txt-plus{font-size:11px;font-weight:700;fill:var(--good,#2f7a4f);font-family:var(--sans,sans-serif);}' +
    '.txt-moins{font-size:11px;font-weight:700;fill:var(--bad,#b3261e);font-family:var(--sans,sans-serif);}' +
    '.tangente{stroke:var(--ink-faint,#9c9083);stroke-width:1.2;stroke-dasharray:5 4;}' +
    '.droite{stroke:var(--plan,#5b4ea3);stroke-width:1.2;stroke-dasharray:4 3;}' +
    '.rayon{stroke:var(--accent,#a8471f);stroke-width:2;}' +
    'table{border-collapse:collapse;width:100%;font-variant-numeric:tabular-nums;font-size:.88rem;}' +
    'th,td{border:1px solid var(--line,#e2d8c8);padding:6px 5px;text-align:center;}' +
    'th{background:var(--surface-2,#faf6f0);font-weight:600;}' +
    'td.plus{color:var(--good,#2f7a4f);font-weight:700;}' +
    'td.moins{color:var(--bad,#b3261e);font-weight:700;}' +
    '.note{margin:0;font-size:.88rem;line-height:1.5;background:var(--surface-2,#faf6f0);padding:8px 10px;border-radius:var(--radius,3px);}' +
    '.question{font-family:var(--serif,serif);font-size:1.35rem;font-weight:700;text-align:center;margin:0;color:var(--accent-ink,#7a3212);}' +
    '.consigne{margin:0;font-size:.9rem;text-align:center;}' +
    '.options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;}' +
    '.options button{min-height:48px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);font-size:1.05rem;font-weight:700;cursor:pointer;font-variant-numeric:tabular-nums;}' +
    '.options button:disabled{cursor:default;}' +
    '.options button.juste{background:var(--good-soft,#e2f0e6);border-color:var(--good,#2f7a4f);color:var(--good,#2f7a4f);}' +
    '.options button.faux{background:var(--bad-soft,#f6dcdc);border-color:var(--bad,#b3261e);color:var(--bad,#b3261e);}' +
    '.correction{margin:0;font-size:.88rem;line-height:1.5;background:var(--surface-2,#faf6f0);padding:8px 10px;border-radius:var(--radius,3px);}' +
    '.correction .ok{color:var(--good,#2f7a4f);font-weight:700;}' +
    '.correction .ko{color:var(--bad,#b3261e);font-weight:700;}' +
    '.actions{display:flex;justify-content:center;}' +
    '.btn{min-height:44px;padding:8px 16px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:.9rem;}' +
    '</style>' +
    '<div class="barre modes"><button type="button" id="mode-exp" aria-pressed="true">Explorer</button><button type="button" id="mode-defi" aria-pressed="false">Défi</button></div>' +
    '<div id="reglages">' +
    '<div class="barre" id="refs" role="group" aria-label="Angle de référence">' +
    '<button type="button" data-r="30" aria-pressed="true">30°</button><button type="button" data-r="45" aria-pressed="false">45°</button><button type="button" data-r="60" aria-pressed="false">60°</button><button type="button" data-r="axes" aria-pressed="false">Sur les axes</button></div>' +
    '<div class="barre" id="fns" role="group" aria-label="Fonction">' +
    '<button type="button" data-f="sin" aria-pressed="true">sin</button><button type="button" data-f="cos" aria-pressed="false">cos</button><button type="button" data-f="tan" aria-pressed="false">tan</button></div>' +
    '</div>' +
    '<div class="disposition">' +
    '<div class="graphe"><svg id="svg" viewBox="0 0 ' + TAILLE + ' ' + TAILLE + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Cercle trigonométrique et angles remarquables"></svg></div>' +
    '<div class="panneau" id="pan-exp">' +
    '<table><thead id="thead"></thead><tbody id="tbody"></tbody></table>' +
    '<p class="note" id="note"></p>' +
    '</div>' +
    '<div class="panneau" id="pan-defi" hidden>' +
    '<p class="question" id="question"></p>' +
    '<p class="consigne">Choisis la valeur exacte (un seul essai).</p>' +
    '<div class="options" id="options"></div>' +
    '<p class="correction" id="correction" hidden></p>' +
    '<div class="actions"><button class="btn" type="button" id="nouveau">Nouvelle question</button></div>' +
    '</div>' +
    '</div>';

  class ValeursRemarquablesWidget extends HTMLElement {
    constructor() {
      super();
      var sh = this.attachShadow({ mode: "open" });
      sh.appendChild(TEMPLATE.content.cloneNode(true));
      this._mode = "exp";
      this._ref = "30";
      this._fn = "sin";
      this._defi = null;
      var g = function (id) { return sh.getElementById(id); };
      this._el = {
        svg: g("svg"), thead: g("thead"), tbody: g("tbody"), note: g("note"), refs: g("refs"), fns: g("fns"),
        reglages: g("reglages"), panExp: g("pan-exp"), panDefi: g("pan-defi"), modeExp: g("mode-exp"),
        modeDefi: g("mode-defi"), question: g("question"), options: g("options"), correction: g("correction"),
        nouveau: g("nouveau"),
      };
    }

    connectedCallback() {
      var self = this, e = this._el;
      this._h = {
        refs: function (ev) { var b = ev.target.closest("button"); if (!b) return; self._ref = b.getAttribute("data-r"); self._rendre(); },
        fns: function (ev) { var b = ev.target.closest("button"); if (!b) return; self._fn = b.getAttribute("data-f"); self._rendre(); },
        modeExp: function () { self._mode = "exp"; self._rendre(); },
        modeDefi: function () { self._mode = "defi"; if (!self._defi) self._nouveauDefi(); self._rendre(); },
        options: function (ev) {
          var b = ev.target.closest("button");
          if (!b || !self._defi || self._defi.choisi !== null) return;
          self._defi.choisi = b.getAttribute("data-v");
          self._rendre();
        },
        nouveau: function () { self._nouveauDefi(); self._rendre(); },
      };
      e.refs.addEventListener("click", this._h.refs);
      e.fns.addEventListener("click", this._h.fns);
      e.modeExp.addEventListener("click", this._h.modeExp);
      e.modeDefi.addEventListener("click", this._h.modeDefi);
      e.options.addEventListener("click", this._h.options);
      e.nouveau.addEventListener("click", this._h.nouveau);
      this._rendre();
    }

    disconnectedCallback() {
      var e = this._el;
      e.refs.removeEventListener("click", this._h.refs);
      e.fns.removeEventListener("click", this._h.fns);
      e.modeExp.removeEventListener("click", this._h.modeExp);
      e.modeDefi.removeEventListener("click", this._h.modeDefi);
      e.options.removeEventListener("click", this._h.options);
      e.nouveau.removeEventListener("click", this._h.nouveau);
    }

    _nouveauDefi() {
      var angle, fn;
      do {
        angle = SEIZE[randInt(0, SEIZE.length - 1)];
        fn = ["sin", "cos", "tan"][randInt(0, 2)];
      } while (this._defi && this._defi.angle === angle && this._defi.fn === fn);
      var juste = exacte(fn, angle);
      var opts = [juste];
      function ajoute(v) { if (v && opts.indexOf(v) < 0 && opts.length < 4) opts.push(v); }
      ajoute(oppose(juste));
      ajoute(echange(fn, juste));
      ajoute(oppose(echange(fn, juste) || ""));
      var reste = melanger(tousSignes(fn));
      for (var i = 0; i < reste.length && opts.length < 4; i++) ajoute(reste[i]);
      this._defi = { angle: angle, fn: fn, juste: juste, options: melanger(opts), choisi: null };
    }

    _rendre() {
      var e = this._el, exp = this._mode === "exp";
      e.modeExp.setAttribute("aria-pressed", exp ? "true" : "false");
      e.modeDefi.setAttribute("aria-pressed", exp ? "false" : "true");
      e.reglages.hidden = !exp;
      e.panExp.hidden = !exp;
      e.panDefi.hidden = exp;
      var self = this;
      Array.prototype.forEach.call(e.refs.querySelectorAll("button"), function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-r") === self._ref ? "true" : "false"); });
      Array.prototype.forEach.call(e.fns.querySelectorAll("button"), function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-f") === self._fn ? "true" : "false"); });
      if (exp) this._rendreExplorer();
      else this._rendreDefi();
    }

    _svgBase(familles) {
      var s = '<defs><marker id="fl" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path class="fleche-axe" d="M0,0 L8,4 L0,8 Z"/></marker></defs>';
      s += '<line class="axe" x1="' + (CX - AXE) + '" y1="' + CY + '" x2="' + (CX + AXE) + '" y2="' + CY + '" marker-end="url(#fl)"/>';
      s += '<line class="axe" x1="' + CX + '" y1="' + (CY + AXE) + '" x2="' + CX + '" y2="' + (CY - AXE) + '" marker-end="url(#fl)"/>';
      s += '<text class="txt-axe" x="' + (CX + AXE - 2) + '" y="' + (CY + 16) + '" text-anchor="end">cos</text>';
      s += '<text class="txt-axe" x="' + (CX + 8) + '" y="' + (CY - AXE + 10) + '">sin</text>';
      s += '<circle class="cercle" cx="' + CX + '" cy="' + CY + '" r="' + R + '"/>';
      SEIZE.forEach(function (a) {
        if (familles.indexOf(a) >= 0) return;
        var p = pt(a, R);
        s += '<circle class="pt-faible" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="2.6"/>';
      });
      return s;
    }

    _svgPoints(familles) {
      var s = "";
      familles.forEach(function (a) {
        var p = pt(a, R), l = pt(a, R + 19);
        // 0° et 180° : étiquette au-dessus du point, pour laisser la place à la valeur lue sur l'axe
        if (a === 0 || a === 180) l = [p[0] + (a === 0 ? 8 : -8), p[1] - 14];
        if (a === 90 || a === 270) l = [p[0] + 20, p[1] + (a === 90 ? -8 : 12)];
        s += '<circle class="pt-fam" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="5"/>';
        s += '<text class="txt-fam" x="' + l[0].toFixed(1) + '" y="' + (l[1] + 4).toFixed(1) + '" text-anchor="middle">' + a + '°</text>';
      });
      return s;
    }

    /** Projections et marques de valeur selon la fonction. */
    _svgValeurs(familles, fn) {
      var s = "";
      var dejaY = {}, dejaX = {};
      if (fn === "tan") {
        var xt = CX + R;
        s += '<line class="tangente" x1="' + xt + '" y1="8" x2="' + xt + '" y2="' + (TAILLE - 8) + '"/>';
        s += '<text class="txt-axe" x="' + (xt - 4) + '" y="22" text-anchor="end">x = 1</text>';
        familles.forEach(function (a) {
          var v = numerique("tan", a);
          if (v === null) return;
          var yP = CY - R * v;
          var p = pt(a, R);
          s += '<line class="droite" x1="' + p[0].toFixed(1) + '" y1="' + p[1].toFixed(1) + '" x2="' + xt + '" y2="' + yP.toFixed(1) + '"/>';
          var cle = Math.round(yP);
          if (dejaY[cle]) return;
          dejaY[cle] = true;
          var cls = v > 1e-9 ? "plus" : v < -1e-9 ? "moins" : "plus";
          s += '<line class="marque-' + cls + '" x1="' + xt + '" y1="' + CY + '" x2="' + xt + '" y2="' + yP.toFixed(1) + '"/>';
          s += '<text class="txt-' + cls + '" x="' + (xt + 6) + '" y="' + (yP + (v >= 0 ? -3 : 12)).toFixed(1) + '">' + exacte("tan", a) + '</text>';
        });
        return s;
      }
      familles.forEach(function (a) {
        var p = pt(a, R);
        if (fn === "sin") {
          s += '<line class="proj" x1="' + p[0].toFixed(1) + '" y1="' + p[1].toFixed(1) + '" x2="' + CX + '" y2="' + p[1].toFixed(1) + '"/>';
          var cy = Math.round(p[1]);
          if (!dejaY[cy]) {
            dejaY[cy] = true;
            var v = sinD(a), cls = v > 1e-9 ? "plus" : v < -1e-9 ? "moins" : "plus";
            if (Math.abs(v) > 1e-9) s += '<line class="marque-' + cls + '" x1="' + CX + '" y1="' + CY + '" x2="' + CX + '" y2="' + p[1].toFixed(1) + '"/>';
            var cote = (Math.cos(a * D2R) >= -1e-9) ? -6 : 6;
            s += '<text class="txt-' + cls + '" x="' + (CX + cote) + '" y="' + (p[1] + (v >= 0 ? -4 : 13)).toFixed(1) + '" text-anchor="' + (cote < 0 ? "end" : "start") + '">' + exacte("sin", a) + '</text>';
          }
        } else {
          s += '<line class="proj" x1="' + p[0].toFixed(1) + '" y1="' + p[1].toFixed(1) + '" x2="' + p[0].toFixed(1) + '" y2="' + CY + '"/>';
          var cx = Math.round(p[0]);
          if (!dejaX[cx]) {
            dejaX[cx] = true;
            var w = cosD(a), c2 = w > 1e-9 ? "plus" : w < -1e-9 ? "moins" : "plus";
            if (Math.abs(w) > 1e-9) s += '<line class="marque-' + c2 + '" x1="' + CX + '" y1="' + CY + '" x2="' + p[0].toFixed(1) + '" y2="' + CY + '"/>';
            var dessous = Math.sin(a * D2R) >= -1e-9;
            s += '<text class="txt-' + c2 + '" x="' + p[0].toFixed(1) + '" y="' + (CY + (dessous ? 15 : -6)) + '" text-anchor="middle">' + exacte("cos", a) + '</text>';
          }
        }
      });
      return s;
    }

    _rendreExplorer() {
      var e = this._el, fn = this._fn;
      var familles;
      if (this._ref === "axes") familles = [0, 90, 180, 270];
      else { var r = parseInt(this._ref, 10); familles = [r, 180 - r, 180 + r, 360 - r]; }
      var s = this._svgBase(familles);
      if (this._ref !== "axes") {
        var pts = familles.map(function (a) { return pt(a, R); });
        s += '<path class="rect" d="M' + pts.map(function (p) { return p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" L") + ' Z"/>';
      }
      s += this._svgValeurs(familles, fn) + this._svgPoints(familles);
      e.svg.innerHTML = s;

      function cl(v) { return v === null ? "" : v > 1e-9 ? "plus" : v < -1e-9 ? "moins" : ""; }
      if (this._ref === "axes") {
        var coords = { 0: "(1 ; 0)", 90: "(0 ; 1)", 180: "(−1 ; 0)", 270: "(0 ; −1)" };
        e.thead.innerHTML = "<tr><th>Angle</th><th>M</th><th>" + fn + "</th></tr>";
        e.tbody.innerHTML = familles.map(function (a) {
          return "<tr><td>" + a + "°</td><td>" + coords[a] + "</td><td class=\"" + cl(numerique(fn, a)) + "\">" + exacte(fn, a) + "</td></tr>";
        }).join("");
        e.note.textContent = fn === "tan"
          ? "Sur les axes, on lit les coordonnées de M directement. tan = sin / cos n'est pas définie en 90° et en 270°, car le cosinus y vaut 0."
          : "Sur les axes, pas d'angle de référence : M a pour coordonnées (cos ; sin), à lire directement — 0, 1 ou −1.";
      } else {
        var ref = parseInt(this._ref, 10);
        e.thead.innerHTML = "<tr><th>Angle</th><th>Quadrant</th><th>Référence</th><th>" + fn + "</th></tr>";
        e.tbody.innerHTML = familles.map(function (a) {
          var q = quadrant(a);
          return "<tr><td>" + a + "°</td><td>" + NOMS_Q[q] + "</td><td>" + reference(a).calcul + "</td><td class=\"" + cl(numerique(fn, a)) + "\">" + exacte(fn, a) + "</td></tr>";
        }).join("");
        e.note.textContent = "Les 4 angles ont le même angle de référence " + ref + "° : leurs " + fn + " ont tous la même valeur absolue, " + EXACT[fn][ref] +
          ". Seul le signe change, selon le quadrant — vert pour +, rouge pour −.";
      }
    }

    _rendreDefi() {
      var e = this._el, d = this._defi;
      var s = this._svgBase([d.angle]);
      var p = pt(d.angle, R);
      s += '<line class="rayon" x1="' + CX + '" y1="' + CY + '" x2="' + p[0].toFixed(1) + '" y2="' + p[1].toFixed(1) + '"/>';
      if (d.choisi !== null) s += this._svgValeurs([d.angle], d.fn);
      s += this._svgPoints([d.angle]);
      e.svg.innerHTML = s;
      e.question.textContent = d.fn + " " + d.angle + "° = ?";
      e.options.innerHTML = d.options.map(function (v) {
        var cls = "";
        if (d.choisi !== null) { if (v === d.juste) cls = "juste"; else if (v === d.choisi) cls = "faux"; }
        return '<button type="button" data-v="' + v + '"' + (cls ? ' class="' + cls + '"' : "") + (d.choisi !== null ? " disabled" : "") + ">" + v + "</button>";
      }).join("");
      e.correction.hidden = d.choisi === null;
      if (d.choisi === null) { e.correction.innerHTML = ""; return; }
      var ok = d.choisi === d.juste;
      var debut = ok ? '<span class="ok">✓ Juste.</span> ' : '<span class="ko">✗ La bonne réponse est ' + d.juste + ".</span> ";
      var a = d.angle, fn = d.fn, q = quadrant(a), txt;
      if (q) {
        var ref = reference(a);
        var v = numerique(fn, a);
        txt = deg(a) + " est dans le quadrant " + NOMS_Q[q] + " ; angle de référence : " + ref.calcul + ". " +
          fn + " " + ref.ref + "° = " + EXACT[fn][ref.ref] + ", et " + fn + " est " + (v > 0 ? "positif" : "négatif") +
          " dans le quadrant " + NOMS_Q[q] + ", donc " + fn + " " + a + "° = " + d.juste + ".";
      } else {
        var coords = { 0: "(1 ; 0)", 90: "(0 ; 1)", 180: "(−1 ; 0)", 270: "(0 ; −1)" };
        var pos = { 0: "sur l'axe horizontal, à droite", 90: "sur l'axe vertical, en haut", 180: "sur l'axe horizontal, à gauche", 270: "sur l'axe vertical, en bas" };
        txt = deg(a) + " est " + pos[a] + " : M" + coords[a] + ". ";
        if (fn === "tan") txt += d.juste === NON_DEF ? "cos " + a + "° = 0, donc tan " + a + "° = sin / cos n'est pas définie." : "tan " + a + "° = sin / cos = 0.";
        else txt += "Donc " + fn + " " + a + "° = " + d.juste + ".";
      }
      e.correction.innerHTML = debut + txt;
    }
  }

  if (!customElements.get("valeurs-remarquables-widget")) {
    customElements.define("valeurs-remarquables-widget", ValeursRemarquablesWidget);
  }
})();
