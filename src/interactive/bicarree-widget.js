(function () {
  "use strict";

  /* ================================================================
   * <bicarree-widget> — atelier interactif (4e, chapitre 2, § 1, « pour
   * aller plus loin ») : équation bicarrée x⁴ + bx² + c = 0 et changement
   * de variable t = x². Curseurs b et c (entiers). En haut : la parabole
   * t² + bt + c et ses racines t₁, t₂ (vertes si t ≥ 0, rouges et barrées
   * si t < 0, zone t < 0 grisée). En bas : l'axe des x, avec ±√t pour chaque
   * t gardé. Valeurs EXACTES quand c'est possible (racines simplifiées),
   * sinon arrondies (≈). Fenêtres FIXES. Web Component (Shadow DOM).
   * ================================================================ */

  var NS = "http://www.w3.org/2000/svg";
  var LARGEUR = 420, HAUTEUR = 230, MARGE = 28;
  var HAUT_X = 96;
  var T_MIN = -12, T_MAX = 12, Y_MIN = -20, Y_MAX = 30;
  var X_MIN = -4, X_MAX = 4;

  var PRESETS = [
    { nom: "x⁴ − 5x² + 4 = 0", b: -5, c: 4 },
    { nom: "x⁴ − x² − 12 = 0", b: -1, c: -12 },
    { nom: "x⁴ − 4x² = 0", b: -4, c: 0 },
    { nom: "x⁴ − 6x² + 9 = 0", b: -6, c: 9 },
    { nom: "x⁴ + 3x² + 2 = 0", b: 3, c: 2 },
  ];

  function gcd(x, y) { x = Math.abs(x); y = Math.abs(y); while (y) { var t = x % y; x = y; y = t; } return x; }
  function nb(v) {
    if (Math.abs(v) < 1e-9) v = 0;
    var s = Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : (Math.round(v * 100) / 100).toString();
    return s.replace(".", ",").replace("-", "−");
  }
  function par(v) { return v < 0 ? "(" + nb(v) + ")" : nb(v); }
  function frac(p, q) {
    if (q < 0) { p = -p; q = -q; }
    var g = gcd(p, q) || 1;
    p /= g; q /= g;
    if (q === 1) return nb(p);
    return (p < 0 ? "−" : "") + Math.abs(p) + "/" + q;
  }
  function racineSimplifiee(n) {
    var k = 1;
    for (var d = 2; d * d <= n; d++) while (n % (d * d) === 0) { n /= d * d; k *= d; }
    return { k: k, m: n };
  }
  function texteRacine(k, m) { return m === 1 ? String(k) : (k === 1 ? "" : String(k)) + "√" + m; }
  function racineFraction(p, q) {
    var g = gcd(p, q) || 1; p /= g; q /= g;
    var s = racineSimplifiee(p * q);
    var g2 = gcd(s.k, q) || 1;
    var k = s.k / g2, d = q / g2;
    var t = texteRacine(k, s.m);
    return d === 1 ? t : t + "/" + d;
  }
  function terme(coef, lettre, premier) {
    if (coef === 0) return "";
    var abs = Math.abs(coef);
    var corps = (lettre && abs === 1) ? lettre : abs + lettre;
    if (premier) return (coef < 0 ? "−" : "") + corps;
    return (coef < 0 ? " − " : " + ") + corps;
  }
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
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.2rem;font-weight:600;margin:0 0 4px;overflow-wrap:anywhere;}' +
    '.formule-t{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1rem;color:var(--ink-soft,#6b6055);margin:0 0 10px;overflow-wrap:anywhere;}' +
    '.graphe-zone{display:flex;flex-direction:column;align-items:center;gap:2px;margin-bottom:10px;}' +
    '.graphe-titre{font-size:0.82rem;color:var(--ink-faint,#9c9083);margin:4px 0 0;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.grad{stroke:var(--ink-soft,#6b6055);stroke-width:1;}' +
    '.interdit{fill:var(--bad,#a8322f);opacity:0.08;}' +
    '.courbe{stroke:var(--accent,#a8471f);stroke-width:2.6;fill:none;}' +
    '.garde{fill:var(--good,#2f7a4f);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.rejete{fill:var(--surface,#fff);stroke:var(--bad,#a8322f);stroke-width:2.4;}' +
    '.barre{stroke:var(--bad,#a8322f);stroke-width:2.4;}' +
    '.etiquette-bad,.etiquette-good{paint-order:stroke;stroke:var(--surface-2,#faf6f0);stroke-width:4px;stroke-linejoin:round;}' +
    '.lien{stroke:var(--good,#2f7a4f);stroke-width:1.2;stroke-dasharray:3 3;}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);}' +
    '.etiquette-bad{font-size:12px;font-weight:700;fill:var(--bad,#a8322f);}' +
    '.etiquette-good{font-size:12px;font-weight:700;fill:var(--good,#2f7a4f);}' +
    '.curseur{display:flex;flex-direction:column;gap:2px;margin-bottom:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-width:0;min-height:44px;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:36px;text-align:right;}' +
    '.resolution{border-left:4px solid var(--accent,#a8471f);background:var(--surface,#fff);padding:8px 12px;margin:6px 0 0;}' +
    '.resolution ol{margin:0;padding-left:1.3em;line-height:1.55;font-size:0.95rem;}' +
    '.resolution li{overflow-wrap:anywhere;}' +
    '.conclusion{font-weight:700;margin:8px 0 0;overflow-wrap:anywhere;}' +
    '</style>' +
    '<div class="presets" id="presets"></div>' +
    '<p class="formule" id="formule"></p>' +
    '<p class="formule-t" id="formule-t"></p>' +
    '<div class="graphe-zone">' +
    '<p class="graphe-titre">En t : la parabole y = t² + bt + c</p>' +
    '<svg id="svg-t" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" role="img" aria-label="Parabole en t"></svg>' +
    '<p class="graphe-titre">En x : les solutions ±√t</p>' +
    '<svg id="svg-x" viewBox="0 0 ' + LARGEUR + ' ' + HAUT_X + '" role="img" aria-label="Solutions en x"></svg>' +
    '</div>' +
    '<div class="curseur"><label for="b">b</label><div class="curseur-row"><input type="range" id="b" min="-10" max="10" step="1"><span class="curseur-valeur" id="b-val"></span></div></div>' +
    '<div class="curseur"><label for="c">c</label><div class="curseur-row"><input type="range" id="c" min="-12" max="12" step="1"><span class="curseur-valeur" id="c-val"></span></div></div>' +
    '<div class="resolution"><ol id="etapes"></ol><p class="conclusion" id="conclusion"></p></div>';

  class BicarreeWidget extends HTMLElement {
    constructor() {
      super();
      var sh = this.attachShadow({ mode: "open" });
      sh.appendChild(TEMPLATE.content.cloneNode(true));
      var $ = function (id) { return sh.getElementById(id); };
      this._el = {
        presets: $("presets"), formule: $("formule"), formuleT: $("formule-t"), svgT: $("svg-t"), svgX: $("svg-x"),
        b: $("b"), c: $("c"), bVal: $("b-val"), cVal: $("c-val"), etapes: $("etapes"), conclusion: $("conclusion"),
      };
      var self = this;
      this._boutons = PRESETS.map(function (p) {
        var bt = document.createElement("button");
        bt.type = "button"; bt.className = "btn"; bt.textContent = p.nom;
        bt.addEventListener("click", function () { self._regler(p.b, p.c); });
        self._el.presets.appendChild(bt);
        return bt;
      });
    }

    connectedCallback() {
      var self = this;
      this._onB = function () { self._b = parseInt(self._el.b.value, 10); self._rendre(); };
      this._onC = function () { self._c = parseInt(self._el.c.value, 10); self._rendre(); };
      this._el.b.addEventListener("input", this._onB);
      this._el.c.addEventListener("input", this._onC);
      this._regler(-5, 4);
    }

    disconnectedCallback() {
      this._el.b.removeEventListener("input", this._onB);
      this._el.c.removeEventListener("input", this._onC);
    }

    _regler(b, c) {
      this._b = b; this._c = c;
      this._el.b.value = String(b); this._el.c.value = String(c);
      this._rendre();
    }

    // Racines en t : [{ v, texte, exact, p, q }] — p/q quand t est rationnel.
    _racinesT(b, c) {
      var delta = b * b - 4 * c;
      if (delta < 0) return { delta: delta, t: [] };
      var s = racineSimplifiee(delta);
      if (delta === 0) return { delta: delta, t: [{ v: -b / 2, texte: frac(-b, 2), p: -b, q: 2 }] };
      if (s.m === 1) {
        return { delta: delta, t: [{ v: (-b - s.k) / 2, texte: frac(-b - s.k, 2), p: -b - s.k, q: 2 }, { v: (-b + s.k) / 2, texte: frac(-b + s.k, 2), p: -b + s.k, q: 2 }] };
      }
      // t irrationnel : (−b ± k√m)/2
      var g = gcd(gcd(b, s.k), 2) || 1;
      var B = -b / g, K = s.k / g, D = 2 / g, r = texteRacine(K, s.m);
      var tx = function (signe) {
        var num = B === 0 ? (signe > 0 ? r : "−" + r) : nb(B) + (signe > 0 ? " + " : " − ") + r;
        return D === 1 ? num : (B === 0 ? num + "/" + D : "(" + num + ")/" + D);
      };
      return { delta: delta, t: [{ v: (-b - Math.sqrt(delta)) / 2, texte: tx(-1) }, { v: (-b + Math.sqrt(delta)) / 2, texte: tx(1) }] };
    }

    _axesT(svg, px) {
      var defs = svgEl("defs", {});
      var mk = svgEl("marker", { id: "fl-t", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      mk.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(mk); svg.appendChild(defs);
      var o = px(0, 0);
      // zone t < 0 : interdite (t = x² ≥ 0)
      svg.appendChild(svgEl("rect", { x: MARGE, y: MARGE, width: o[0] - MARGE, height: HAUTEUR - 2 * MARGE, class: "interdit" }));
      var ti = svgEl("text", { x: MARGE + 6, y: MARGE + 14, class: "etiquette-bad" }); ti.textContent = "t < 0 : impossible"; svg.appendChild(ti);
      svg.appendChild(svgEl("line", { x1: MARGE - 6, x2: LARGEUR - MARGE + 6, y1: o[1], y2: o[1], class: "axe", "marker-end": "url(#fl-t)" }));
      svg.appendChild(svgEl("line", { x1: o[0], x2: o[0], y1: HAUTEUR - MARGE + 6, y2: MARGE - 6, class: "axe", "marker-end": "url(#fl-t)" }));
      for (var g = T_MIN; g <= T_MAX; g += 2) {
        if (g === 0) continue;
        var p = px(g, 0);
        svg.appendChild(svgEl("line", { x1: p[0], x2: p[0], y1: o[1] - 3, y2: o[1] + 3, class: "grad" }));
      }
      var tx = svgEl("text", { x: LARGEUR - MARGE + 2, y: o[1] - 8, class: "etiquette", "text-anchor": "end" }); tx.textContent = "t"; svg.appendChild(tx);
      var ty = svgEl("text", { x: o[0] + 6, y: MARGE - 8, class: "etiquette" }); ty.textContent = "y"; svg.appendChild(ty);
      return o;
    }

    _rendre() {
      var b = this._b, c = this._c, e = this._el;
      e.bVal.textContent = nb(b); e.cVal.textContent = nb(c);
      var eqX = "x⁴" + terme(b, "x²", false) + terme(c, "", false) + " = 0";
      var eqT = "t²" + terme(b, "t", false) + terme(c, "", false) + " = 0";
      e.formule.textContent = eqX;
      e.formuleT.textContent = "avec t = x² (t ≥ 0) : " + eqT;
      this._boutons.forEach(function (bt, i) { bt.setAttribute("aria-pressed", String(PRESETS[i].b === b && PRESETS[i].c === c)); });

      var R = this._racinesT(b, c);
      // solutions en x
      var solutions = []; // { v, texte }
      var etapes = ["On pose t = x², avec t ≥ 0 : " + eqT + "."];
      etapes.push("Δ = " + par(b) + "² − 4 · 1 · " + par(c) + " = " + nb(R.delta) + (R.delta < 0 ? " < 0 : aucune valeur de t." : R.delta === 0 ? " : une racine double en t." : ""));
      if (R.t.length) etapes.push(R.t.length === 1 ? "t = " + R.t[0].texte : "t₁ = " + R.t[0].texte + " et t₂ = " + R.t[1].texte);
      var rejetes = [];
      R.t.forEach(function (t) {
        if (t.v < -1e-9) { rejetes.push(t.texte); return; }
        var exact, texte;
        if (Math.abs(t.v) < 1e-9) { solutions.push({ v: 0, texte: "0" }); return; }
        if (t.q) { texte = racineFraction(t.p, t.q); exact = true; } else { texte = "√(" + t.texte + ")"; exact = false; }
        var rv = Math.sqrt(t.v);
        var aff = exact && texte.indexOf("√") < 0 ? texte : texte + " ≈ " + nb(rv);
        solutions.push({ v: -rv, texte: "−" + aff.replace(" ≈ ", " ≈ −") });
        solutions.push({ v: rv, texte: aff });
      });
      if (rejetes.length) etapes.push("On rejette t = " + rejetes.join(" et t = ") + " : x² ne peut pas être négatif.");
      var gardes = R.t.filter(function (t) { return t.v >= -1e-9; });
      if (gardes.length) {
        etapes.push(gardes.map(function (t) {
          if (Math.abs(t.v) < 1e-9) return "x² = 0 ⟺ x = 0";
          var r = t.q ? racineFraction(t.p, t.q) : "√(" + t.texte + ")";
          return "x² = " + t.texte + " ⟺ x = −" + r + " ou x = " + r;
        }).join(" ; "));
      }
      solutions.sort(function (u, v) { return u.v - v.v; });
      e.etapes.innerHTML = "";
      etapes.forEach(function (t) { var li = document.createElement("li"); li.textContent = t; e.etapes.appendChild(li); });
      e.conclusion.textContent = solutions.length
        ? "S = {" + solutions.map(function (s) { return s.texte; }).join(" ; ") + "}"
        : "Aucune solution : S = ∅.";

      // --- parabole en t
      var px = function (t, y) {
        return [MARGE + (t - T_MIN) / (T_MAX - T_MIN) * (LARGEUR - 2 * MARGE),
          HAUTEUR - MARGE - (y - Y_MIN) / (Y_MAX - Y_MIN) * (HAUTEUR - 2 * MARGE)];
      };
      var svg = e.svgT;
      svg.innerHTML = "";
      var o = this._axesT(svg, px);
      var d = "", dedans = false;
      for (var i = 0; i <= 300; i++) {
        var tt = T_MIN + i / 300 * (T_MAX - T_MIN), yy = tt * tt + b * tt + c;
        if (yy >= Y_MIN - 0.5 && yy <= Y_MAX + 0.5) {
          var p = px(tt, Math.max(Y_MIN, Math.min(Y_MAX, yy)));
          d += (dedans ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1) + " ";
          dedans = true;
        } else dedans = false;
      }
      svg.appendChild(svgEl("path", { d: d, class: "courbe" }));
      R.t.forEach(function (t, k) {
        if (t.v < T_MIN || t.v > T_MAX) return;
        var q = px(t.v, 0);
        var ok = t.v >= -1e-9;
        svg.appendChild(svgEl("circle", { cx: q[0], cy: q[1], r: 6, class: ok ? "garde" : "rejete" }));
        if (!ok) {
          svg.appendChild(svgEl("line", { x1: q[0] - 8, y1: q[1] - 8, x2: q[0] + 8, y2: q[1] + 8, class: "barre" }));
          svg.appendChild(svgEl("line", { x1: q[0] - 8, y1: q[1] + 8, x2: q[0] + 8, y2: q[1] - 8, class: "barre" }));
        }
        var lab = svgEl("text", { x: q[0], y: o[1] + (k === 0 ? 20 : 34), "text-anchor": "middle", class: ok ? "etiquette-good" : "etiquette-bad" });
        lab.textContent = (R.t.length === 1 ? "t" : "t" + (k === 0 ? "₁" : "₂")) + " " + (t.q && t.texte.indexOf("/") < 0 ? "= " + t.texte : "≈ " + nb(t.v));
        svg.appendChild(lab);
      });

      // --- axe des x
      var sx = e.svgX;
      sx.innerHTML = "";
      var defs = svgEl("defs", {});
      var mk = svgEl("marker", { id: "fl-x", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      mk.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(mk); sx.appendChild(defs);
      var yAxe = 40;
      var qx = function (x) { return MARGE + (x - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - 2 * MARGE); };
      sx.appendChild(svgEl("line", { x1: MARGE - 6, x2: LARGEUR - MARGE + 6, y1: yAxe, y2: yAxe, class: "axe", "marker-end": "url(#fl-x)" }));
      for (var g = X_MIN; g <= X_MAX; g++) {
        sx.appendChild(svgEl("line", { x1: qx(g), x2: qx(g), y1: yAxe - 3, y2: yAxe + 3, class: "grad" }));
        var tg = svgEl("text", { x: qx(g), y: yAxe + 16, "text-anchor": "middle", class: "etiquette" });
        tg.textContent = nb(g);
        sx.appendChild(tg);
      }
      var tx = svgEl("text", { x: LARGEUR - MARGE + 2, y: yAxe - 10, "text-anchor": "end", class: "etiquette" }); tx.textContent = "x"; sx.appendChild(tx);
      solutions.forEach(function (s, k) {
        if (s.v < X_MIN || s.v > X_MAX) return;
        var X = qx(s.v);
        sx.appendChild(svgEl("circle", { cx: X, cy: yAxe, r: 6, class: "garde" }));
        // une solution entière est déjà lue sur la graduation : étiquette seulement si elle ne l'est pas
        if (Math.abs(s.v - Math.round(s.v)) < 1e-9) return;
        var lab = svgEl("text", { x: X, y: k % 2 === 0 ? yAxe + 34 : yAxe + 48, "text-anchor": "middle", class: "etiquette-good" });
        lab.textContent = "≈ " + nb(s.v);
        sx.appendChild(lab);
      });
      if (!solutions.length) {
        var vide = svgEl("text", { x: LARGEUR / 2, y: yAxe - 14, "text-anchor": "middle", class: "etiquette-bad" });
        vide.textContent = "aucune solution en x";
        sx.appendChild(vide);
      }
    }
  }

  if (!customElements.get("bicarree-widget")) customElements.define("bicarree-widget", BicarreeWidget);
})();
