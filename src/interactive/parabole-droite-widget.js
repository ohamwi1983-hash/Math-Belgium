(function () {
  "use strict";

  /* ================================================================
   * <parabole-droite-widget> — atelier interactif (4e, chapitre 2, § 2) :
   * parabole f(x) = ax² + bx + c et droite g(x) = mx + p, symbole au choix.
   * La partie de la parabole qui vérifie f(x) ◇ g(x) est verte, les points
   * communs sont marqués, et l'ensemble-solution apparaît en couleur sur
   * l'axe des x (rond plein = borne incluse, rond vide = exclue). Le texte
   * donne le trinôme f(x) − g(x), son Δ, ses racines et S, notation belge
   * (]−∞ ; 1] ∪ [3 ; +∞[). Fenêtre FIXE. Web Component (Shadow DOM).
   * Réglage par défaut : l'exemple du cours, −x² + 4x + 1 ≥ 4 → S = [1 ; 3].
   * ================================================================ */

  var NS = "http://www.w3.org/2000/svg";
  var LARGEUR = 420, HAUTEUR = 300, MARGE = 28;
  var X_MIN = -6, X_MAX = 6, Y_MIN = -8, Y_MAX = 10;

  var SYMBOLES = [
    { id: "ge", texte: "≥", sup: true, large: true, phrase: "au-dessus de la droite (ou sur elle)" },
    { id: "gt", texte: ">", sup: true, large: false, phrase: "strictement au-dessus de la droite" },
    { id: "le", texte: "≤", sup: false, large: true, phrase: "en dessous de la droite (ou sur elle)" },
    { id: "lt", texte: "<", sup: false, large: false, phrase: "strictement en dessous de la droite" },
  ];

  var PRESETS = [
    { nom: "Exemple du cours", a: -1, b: 4, c: 1, m: 0, p: 4, s: "ge" },
    { nom: "Droite oblique", a: 1, b: -2, c: -3, m: 1, p: -3, s: "lt" },
    { nom: "Droite tangente", a: 1, b: 0, c: 0, m: 2, p: -1, s: "gt" },
    { nom: "Aucun point commun", a: 0.5, b: 0, c: 2, m: 1, p: -2, s: "le" },
  ];

  function nb(v) {
    if (Math.abs(v) < 1e-9) v = 0;
    var s = Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : (Math.round(v * 100) / 100).toString();
    return s.replace(".", ",").replace("-", "−");
  }
  function estExact(v) { return Math.abs(v * 100 - Math.round(v * 100)) < 1e-7; }
  function terme(coef, lettre, premier) {
    if (Math.abs(coef) < 1e-9) return "";
    var abs = Math.abs(coef);
    var corps = (lettre && Math.abs(abs - 1) < 1e-9) ? lettre : nb(abs) + lettre;
    if (premier) return (coef < 0 ? "−" : "") + corps;
    return (coef < 0 ? " − " : " + ") + corps;
  }
  function polynome(a, b, c) {
    var s = terme(a, "x²", true);
    s += terme(b, "x", s === "");
    s += terme(c, "", s === "");
    return s === "" ? "0" : s;
  }
  function par(v) { return v < 0 ? "(" + nb(v) + ")" : nb(v); }
  function svgEl(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;text-align:left;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}' +
    '*{box-sizing:border-box;}' +
    '.presets{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;}' +
    '.btn{min-height:44px;padding:6px 10px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);font:inherit;font-size:0.92rem;font-weight:600;cursor:pointer;}' +
    '.btn[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);border-color:var(--accent,#a8471f);color:var(--accent-ink,#7a3212);}' +
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.1rem;font-weight:600;margin:0 0 8px;overflow-wrap:anywhere;line-height:1.5;}' +
    '.formule .f{color:var(--accent-ink,#7a3212);}.formule .g{color:var(--plan,#6b4fa0);}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:10px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.fleche-sol{fill:var(--good,#2f7a4f);}' +
    '.grad{stroke:var(--ink-soft,#6b6055);stroke-width:1;}' +
    '.courbe{stroke:var(--accent,#a8471f);stroke-width:2.4;fill:none;opacity:0.55;}' +
    '.courbe-ok{stroke:var(--good,#2f7a4f);stroke-width:3;fill:none;}' +
    '.droite{stroke:var(--plan,#6b4fa0);stroke-width:2.2;fill:none;}' +
    '.commun{fill:var(--ink,#241f1a);}' +
    '.solution{stroke:var(--good,#2f7a4f);stroke-width:6;stroke-linecap:butt;}' +
    '.borne-in{fill:var(--good,#2f7a4f);stroke:var(--good,#2f7a4f);stroke-width:2;}' +
    '.borne-out{fill:var(--surface-2,#faf6f0);stroke:var(--good,#2f7a4f);stroke-width:2.4;}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);}' +
    '.etiquette-fort{font-size:12px;font-weight:700;fill:var(--ink,#241f1a);}' +
    '.etiquette-fort{paint-order:stroke;stroke:var(--surface-2,#faf6f0);stroke-width:4px;stroke-linejoin:round;}' +
    '.reglages{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:0 14px;}' +
    '.curseur{display:flex;flex-direction:column;gap:2px;margin-bottom:4px;min-width:0;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur.g label{color:var(--plan,#6b4fa0);}' +
    '.curseur-row{display:flex;align-items:center;gap:10px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-width:0;min-height:44px;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:40px;text-align:right;}' +
    '.symboles{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin:8px 0 10px;}' +
    '.symboles .btn{min-width:64px;font-size:1rem;}' +
    '.resolution{border-left:4px solid var(--accent,#a8471f);background:var(--surface,#fff);padding:8px 12px;margin:0;}' +
    '.resolution ol{margin:0;padding-left:1.3em;line-height:1.55;font-size:0.95rem;}' +
    '.resolution li{overflow-wrap:anywhere;}' +
    '.conclusion{font-weight:700;margin:8px 0 0;overflow-wrap:anywhere;color:var(--good,#2f7a4f);}' +
    '</style>' +
    '<div class="presets" id="presets"></div>' +
    '<p class="formule" id="formule"></p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" role="img" aria-label="Parabole et droite"></svg></div>' +
    '<div class="symboles" id="symboles"></div>' +
    '<div class="reglages">' +
    '<div class="curseur"><label for="a">a (parabole)</label><div class="curseur-row"><input type="range" id="a" min="-2" max="2" step="0.5"><span class="curseur-valeur" id="a-val"></span></div></div>' +
    '<div class="curseur"><label for="b">b (parabole)</label><div class="curseur-row"><input type="range" id="b" min="-6" max="6" step="1"><span class="curseur-valeur" id="b-val"></span></div></div>' +
    '<div class="curseur"><label for="c">c (parabole)</label><div class="curseur-row"><input type="range" id="c" min="-6" max="6" step="1"><span class="curseur-valeur" id="c-val"></span></div></div>' +
    '<div class="curseur g"><label for="m">m (pente de la droite)</label><div class="curseur-row"><input type="range" id="m" min="-3" max="3" step="0.5"><span class="curseur-valeur" id="m-val"></span></div></div>' +
    '<div class="curseur g"><label for="p">p (ordonnée à l’origine)</label><div class="curseur-row"><input type="range" id="p" min="-6" max="6" step="1"><span class="curseur-valeur" id="p-val"></span></div></div>' +
    '</div>' +
    '<div class="resolution"><ol id="etapes"></ol><p class="conclusion" id="conclusion"></p></div>';

  class ParaboleDroiteWidget extends HTMLElement {
    constructor() {
      super();
      var sh = this.attachShadow({ mode: "open" });
      sh.appendChild(TEMPLATE.content.cloneNode(true));
      var $ = function (id) { return sh.getElementById(id); };
      var self = this;
      this._el = { presets: $("presets"), formule: $("formule"), svg: $("svg"), symboles: $("symboles"), etapes: $("etapes"), conclusion: $("conclusion") };
      this._champs = ["a", "b", "c", "m", "p"];
      this._champs.forEach(function (k) { self._el[k] = $(k); self._el[k + "Val"] = $(k + "-val"); });
      this._boutonsPreset = PRESETS.map(function (pr) {
        var bt = document.createElement("button");
        bt.type = "button"; bt.className = "btn"; bt.textContent = pr.nom;
        bt.addEventListener("click", function () { self._regler(pr); });
        self._el.presets.appendChild(bt);
        return bt;
      });
      this._boutonsSymbole = SYMBOLES.map(function (sy) {
        var bt = document.createElement("button");
        bt.type = "button"; bt.className = "btn"; bt.textContent = "f(x) " + sy.texte + " g(x)";
        bt.addEventListener("click", function () { self._s = sy.id; self._rendre(); });
        self._el.symboles.appendChild(bt);
        return bt;
      });
      this._v = {};
    }

    connectedCallback() {
      var self = this;
      this._handlers = {};
      this._champs.forEach(function (k) {
        self._handlers[k] = function () {
          var v = parseFloat(self._el[k].value);
          // a ne vaut jamais 0 (sinon ce n'est plus une parabole) : on saute dans le sens du déplacement.
          if (k === "a" && Math.abs(v) < 1e-9) { v = self._v.a > 0 ? -0.5 : 0.5; self._el.a.value = String(v); }
          self._v[k] = v; self._rendre();
        };
        self._el[k].addEventListener("input", self._handlers[k]);
      });
      this._regler(PRESETS[0]);
    }

    disconnectedCallback() {
      var self = this;
      this._champs.forEach(function (k) { self._el[k].removeEventListener("input", self._handlers[k]); });
    }

    _regler(pr) {
      var self = this;
      this._champs.forEach(function (k) { self._v[k] = pr[k]; self._el[k].value = String(pr[k]); });
      this._s = pr.s;
      this._rendre();
    }

    _px(x, y) {
      return [MARGE + (x - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - 2 * MARGE),
        HAUTEUR - MARGE - (y - Y_MIN) / (Y_MAX - Y_MIN) * (HAUTEUR - 2 * MARGE)];
    }

    _trace(svg, fn, x1, x2, classe) {
      if (x2 - x1 < 1e-6) return;
      var n = Math.max(6, Math.round(240 * (x2 - x1) / (X_MAX - X_MIN)));
      var d = "", dedans = false;
      for (var i = 0; i <= n; i++) {
        var xx = x1 + i / n * (x2 - x1), yy = fn(xx);
        if (yy >= Y_MIN - 1 && yy <= Y_MAX + 1) {
          var q = this._px(xx, Math.max(Y_MIN - 1, Math.min(Y_MAX + 1, yy)));
          d += (dedans ? "L" : "M") + q[0].toFixed(1) + " " + q[1].toFixed(1) + " ";
          dedans = true;
        } else dedans = false;
      }
      if (d) svg.appendChild(svgEl("path", { d: d, class: classe }));
    }

    _rendre() {
      var v = this._v, e = this._el, self = this;
      var a = v.a, b = v.b, c = v.c, m = v.m, p = v.p;
      var sy = SYMBOLES.filter(function (s) { return s.id === self._s; })[0];
      this._boutonsSymbole.forEach(function (bt, i) { bt.setAttribute("aria-pressed", String(SYMBOLES[i].id === sy.id)); });
      this._boutonsPreset.forEach(function (bt, i) {
        var pr = PRESETS[i];
        bt.setAttribute("aria-pressed", String(pr.a === a && pr.b === b && pr.c === c && pr.m === m && pr.p === p && pr.s === sy.id));
      });
      this._champs.forEach(function (k) { e[k + "Val"].textContent = nb(v[k]); });

      var f = function (x) { return a * x * x + b * x + c; };
      var g = function (x) { return m * x + p; };
      var A = a, B = b - m, C = c - p;
      var h = function (x) { return A * x * x + B * x + C; };
      var gTexte = polynome(0, m, p);
      e.formule.innerHTML = "";
      var sf = document.createElement("span"); sf.className = "f"; sf.textContent = "f(x) = " + polynome(a, b, c);
      var sg = document.createElement("span"); sg.className = "g"; sg.textContent = "g(x) = " + gTexte;
      e.formule.appendChild(sf); e.formule.appendChild(document.createElement("br")); e.formule.appendChild(sg);

      // Racines de h = f − g (coefficients multiples de 0,5 : Δ est exact en virgule flottante).
      var delta = B * B - 4 * A * C;
      var racines = [];
      if (delta > 1e-12) {
        var r1 = (-B - Math.sqrt(delta)) / (2 * A), r2 = (-B + Math.sqrt(delta)) / (2 * A);
        racines = [Math.min(r1, r2), Math.max(r1, r2)];
      } else if (Math.abs(delta) <= 1e-12) racines = [-B / (2 * A)];
      var arrondi = racines.some(function (r) { return !estExact(r); });
      var val = function (r) { return nb(r); };
      var veut = function (x) { var y = h(x); return sy.sup ? y > 1e-9 : y < -1e-9; };

      // Ensemble-solution : intervalles [{ de, a, deIn, aIn }] (±Infinity aux bouts) + points isolés.
      var intervalles = [], isoles = [];
      var bornes = [-Infinity].concat(racines).concat([Infinity]);
      for (var k = 0; k < bornes.length - 1; k++) {
        var lo = bornes[k], hi = bornes[k + 1];
        var mil = lo === -Infinity ? (hi === Infinity ? 0 : hi - 1) : hi === Infinity ? lo + 1 : (lo + hi) / 2;
        if (veut(mil)) intervalles.push({ de: lo, a: hi, deIn: sy.large && isFinite(lo), aIn: sy.large && isFinite(hi) });
      }
      // Fusion autour d'une racine incluse (symbole large) quand les deux côtés sont solutions.
      var fusion = [];
      intervalles.forEach(function (it) {
        var dernier = fusion[fusion.length - 1];
        if (dernier && dernier.a === it.de && sy.large) { dernier.a = it.a; dernier.aIn = it.aIn; } else fusion.push(it);
      });
      if (sy.large) {
        racines.forEach(function (r) {
          var couvert = fusion.some(function (it) { return r >= it.de - 1e-9 && r <= it.a + 1e-9; });
          if (!couvert) isoles.push(r);
        });
      }
      var morceaux = fusion.map(function (it) {
        if (it.de === -Infinity && it.a === Infinity) return "ℝ";
        var o = it.de === -Infinity ? "]−∞" : (it.deIn ? "[" : "]") + val(it.de);
        var f2 = it.a === Infinity ? "+∞[" : val(it.a) + (it.aIn ? "]" : "[");
        return o + " ; " + f2;
      });
      var texteS;
      if (morceaux.length === 1 && morceaux[0] === "ℝ") texteS = "ℝ";
      else if (!morceaux.length && !isoles.length) texteS = "∅";
      else if (!morceaux.length) texteS = "{" + isoles.map(val).join(" ; ") + "}";
      else if (fusion.length === 2 && fusion[0].de === -Infinity && fusion[1].a === Infinity && !sy.large && racines.length === 1) texteS = "ℝ \\ {" + val(racines[0]) + "}";
      else texteS = morceaux.join(" ∪ ") + (isoles.length ? " ∪ {" + isoles.map(val).join(" ; ") + "}" : "");

      var etapes = [];
      etapes.push("f(x) " + sy.texte + " g(x) ⟺ f(x) − g(x) " + sy.texte + " 0, avec f(x) − g(x) = " + polynome(A, B, C) + ".");
      etapes.push("Δ = " + par(B) + "² − 4 · " + par(A) + " · " + par(C) + " = " + nb(delta) +
        (racines.length === 2 ? " > 0 : deux points communs, en x = " + val(racines[0]) + " et x = " + val(racines[1]) + "." :
          racines.length === 1 ? " : un seul point commun (la droite est tangente), en x = " + val(racines[0]) + "." :
            " < 0 : la parabole et la droite n'ont aucun point commun."));
      etapes.push("a = " + nb(A) + (A > 0 ? " > 0" : " < 0") + " : f(x) − g(x) a le signe de a " + (racines.length === 2 ? "à l'extérieur des racines, le signe opposé entre elles." : "partout" + (racines.length ? ", sauf au point commun où il est nul." : ".")));
      etapes.push("On garde les x où la parabole est " + sy.phrase + ".");
      e.etapes.innerHTML = "";
      etapes.forEach(function (t) { var li = document.createElement("li"); li.textContent = t; e.etapes.appendChild(li); });
      e.conclusion.textContent = "S = " + texteS + (arrondi ? " (valeurs arrondies)" : "");

      // --- dessin
      var svg = e.svg;
      svg.innerHTML = "";
      var defs = svgEl("defs", {});
      [["fl", "fleche"], ["fl-sol", "fleche-sol"]].forEach(function (d) {
        var mk = svgEl("marker", { id: d[0], markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
        mk.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: d[1] }));
        defs.appendChild(mk);
      });
      svg.appendChild(defs);
      var o = this._px(0, 0);
      svg.appendChild(svgEl("line", { x1: MARGE - 6, x2: LARGEUR - MARGE + 6, y1: o[1], y2: o[1], class: "axe", "marker-end": "url(#fl)" }));
      svg.appendChild(svgEl("line", { x1: o[0], x2: o[0], y1: HAUTEUR - MARGE + 6, y2: MARGE - 6, class: "axe", "marker-end": "url(#fl)" }));
      for (var gx = X_MIN + 1; gx < X_MAX; gx++) {
        if (gx === 0) continue;
        var q = this._px(gx, 0);
        svg.appendChild(svgEl("line", { x1: q[0], x2: q[0], y1: o[1] - 3, y2: o[1] + 3, class: "grad" }));
      }
      for (var gy = Y_MIN + 2; gy < Y_MAX; gy += 2) {
        if (gy === 0) continue;
        var qy = this._px(0, gy);
        svg.appendChild(svgEl("line", { x1: o[0] - 3, x2: o[0] + 3, y1: qy[1], y2: qy[1], class: "grad" }));
      }
      var t1 = svgEl("text", { x: LARGEUR - MARGE + 2, y: o[1] - 8, "text-anchor": "end", class: "etiquette" }); t1.textContent = "x"; svg.appendChild(t1);
      var t2 = svgEl("text", { x: o[0] + 6, y: MARGE - 8, class: "etiquette" }); t2.textContent = "y"; svg.appendChild(t2);
      var u1 = this._px(1, 0), u2 = this._px(0, 2);
      var l1 = svgEl("text", { x: u1[0], y: o[1] - 8, "text-anchor": "middle", class: "etiquette" }); l1.textContent = "1"; svg.appendChild(l1);
      var l2 = svgEl("text", { x: o[0] - 6, y: u2[1] + 4, "text-anchor": "end", class: "etiquette" }); l2.textContent = "2"; svg.appendChild(l2);

      // droite, parabole (fanée), puis la partie de la parabole qui vérifie l'inéquation
      this._trace(svg, g, X_MIN, X_MAX, "droite");
      this._trace(svg, f, X_MIN, X_MAX, "courbe");
      fusion.forEach(function (it) {
        self._trace(svg, f, Math.max(X_MIN, it.de), Math.min(X_MAX, it.a), "courbe-ok");
      });
      racines.forEach(function (r) {
        if (r < X_MIN || r > X_MAX || f(r) < Y_MIN || f(r) > Y_MAX) return;
        var q = self._px(r, f(r));
        svg.appendChild(svgEl("circle", { cx: q[0], cy: q[1], r: 5, class: "commun" }));
      });
      // ensemble-solution sur l'axe des x
      fusion.forEach(function (it) {
        var x1 = Math.max(X_MIN, it.de), x2 = Math.min(X_MAX, it.a);
        if (x2 <= x1) return;
        var q1 = self._px(x1, 0), q2 = self._px(x2, 0);
        var attrs = { x1: q1[0], x2: q2[0], y1: o[1], y2: o[1], class: "solution" };
        svg.appendChild(svgEl("line", attrs));
        [[it.de, it.deIn], [it.a, it.aIn]].forEach(function (bo) {
          if (!isFinite(bo[0]) || bo[0] < X_MIN || bo[0] > X_MAX) return;
          var qb = self._px(bo[0], 0);
          svg.appendChild(svgEl("circle", { cx: qb[0], cy: qb[1], r: 5.5, class: bo[1] ? "borne-in" : "borne-out" }));
        });
      });
      isoles.forEach(function (r) {
        if (r < X_MIN || r > X_MAX) return;
        var qb = self._px(r, 0);
        svg.appendChild(svgEl("circle", { cx: qb[0], cy: qb[1], r: 5.5, class: "borne-in" }));
      });
      // racines exclues (symbole strict) : rond vide
      if (!sy.large) racines.forEach(function (r) {
        if (r < X_MIN || r > X_MAX) return;
        var dejaBorne = fusion.some(function (it) { return Math.abs(it.de - r) < 1e-9 || Math.abs(it.a - r) < 1e-9; });
        if (dejaBorne) return;
        var qb = self._px(r, 0);
        svg.appendChild(svgEl("circle", { cx: qb[0], cy: qb[1], r: 5.5, class: "borne-out" }));
      });
      // abscisses des points communs
      racines.forEach(function (r, k) {
        if (r < X_MIN || r > X_MAX) return;
        var qb = self._px(r, 0);
        var lab = svgEl("text", { x: qb[0], y: o[1] + (k === 0 ? 22 : 36), "text-anchor": "middle", class: "etiquette-fort" });
        lab.textContent = (estExact(r) ? "" : "≈ ") + nb(r);
        svg.appendChild(lab);
      });
    }
  }

  if (!customElements.get("parabole-droite-widget")) customElements.define("parabole-droite-widget", ParaboleDroiteWidget);
})();
