(function () {
  "use strict";

  /* ================================================================
   * <viete-racines-widget> — atelier interactif (4e, chapitre 2, § 1) :
   * deux racines x₁, x₂ et un coefficient a réglables ; trace la parabole
   * a(x − x₁)(x − x₂), affiche S = x₁ + x₂, P = x₁·x₂, l'équation
   * x² − Sx + P = 0 et le trinôme développé ax² + bx + c (b = −aS, c = aP).
   * Lit le signe des racines à partir de S et P (P < 0 → signes opposés…)
   * et repère la « racine évidente » : a + b + c = 0 ⟺ 1 est racine,
   * a − b + c = 0 ⟺ −1 est racine. Fenêtre FIXE (jamais recalculée).
   * Web Component (Shadow DOM).
   * ================================================================ */

  var DEFAUT = { x1: 2, x2: 5, a: 1 }; // exemple du cours : racines 2 et 5 → x² − 7x + 10 = 0
  var BORNES = { min: -6, max: 6, step: 0.5 };
  var VALEURS_A = [-2, -1, 1, 2];
  var X_MIN = -7, X_MAX = 7, Y_MIN = -10, Y_MAX = 10;
  var LARGEUR = 420, HAUTEUR = 300, MARGE = 30;
  var NS = "http://www.w3.org/2000/svg";

  function estEntier(v) { return Math.abs(v - Math.round(v)) < 1e-9; }

  // Nombre au format français : virgule décimale, « − » typographique, sans zéros inutiles.
  function nb(v) {
    if (Math.abs(v) < 1e-9) v = 0;
    var s = estEntier(v) ? String(Math.round(v)) : (Math.round(v * 100) / 100).toString();
    return s.replace(".", ",").replace("-", "−");
  }

  // Monôme « coef·lettre » dans une somme : signe séparé, coefficient 1 omis.
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

  // Facteur (x − r) écrit proprement : x pour r = 0, x + 2 pour r = −2.
  function facteur(r) {
    if (Math.abs(r) < 1e-9) return "x";
    return "(x " + (r > 0 ? "− " : "+ ") + nb(Math.abs(r)) + ")";
  }

  function factorisee(a, x1, x2) {
    var pre = a === 1 ? "" : (a === -1 ? "−" : nb(a));
    if (Math.abs(x1 - x2) < 1e-9) {
      var f = facteur(x1);
      if (f === "x") return pre + "x²";
      return pre + f + "²";
    }
    var lo = Math.min(x1, x2), hi = Math.max(x1, x2);
    var f1 = facteur(lo), f2 = facteur(hi);
    // x se place en tête : « x(x − 3) » plutôt que « (x − 3)x »
    if (f2 === "x") { var t = f1; f1 = f2; f2 = t; }
    return pre + f1 + f2;
  }

  function svgEl(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}' +
    '*{box-sizing:border-box;}' +
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.15rem;font-weight:600;margin:0 0 4px;overflow-wrap:anywhere;}' +
    '.sous-formule{text-align:center;font-size:0.95rem;color:var(--ink-soft,#6b6055);margin:0 0 12px;overflow-wrap:anywhere;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:14px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.grad{stroke:var(--ink-soft,#6b6055);stroke-width:1;}' +
    '.courbe{stroke:var(--accent,#a8471f);stroke-width:2.6;fill:none;}' +
    '.sommet{stroke:var(--plan,#6b4fa0);stroke-width:1.3;stroke-dasharray:4 4;}' +
    '.racine{fill:var(--ink,#241f1a);}' +
    '.racine.evidente{fill:var(--good,#2f7a4f);}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);}' +
    '.etiquette-racine{font-size:12px;font-weight:700;fill:var(--ink,#241f1a);}' +
    '.etiquette-sommet{font-size:11.5px;fill:var(--plan,#6b4fa0);font-weight:600;}' +
    '.stats{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin:0 0 12px;}' +
    '.stat{flex:1 1 120px;min-width:0;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:8px 6px;text-align:center;background:var(--surface,#fff);}' +
    '.stat-label{display:block;font-size:11px;color:var(--ink-faint,#9c9083);margin-bottom:4px;}' +
    '.stat-value{display:block;font-variant-numeric:tabular-nums;font-size:1rem;font-weight:700;}' +
    '.lecture{border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);background:var(--surface,#fff);padding:10px 12px;margin:0 0 10px;line-height:1.5;font-size:0.95rem;}' +
    '.lecture b{color:var(--accent-ink,#7a3212);}' +
    '.evidente-txt{border-left:4px solid var(--good,#2f7a4f);background:var(--surface,#fff);padding:8px 12px;margin:0 0 12px;font-size:0.95rem;line-height:1.5;}' +
    '.evidente-txt[hidden]{display:none;}' +
    '.controles{display:flex;flex-direction:column;gap:10px;}' +
    '.curseur{display:flex;flex-direction:column;gap:4px;}' +
    '.curseur label,.groupe-label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-height:44px;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:44px;text-align:right;}' +
    '.boutons-a{display:flex;gap:6px;flex-wrap:wrap;}' +
    '.btn{min-height:44px;min-width:52px;padding:6px 12px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);font:inherit;font-weight:600;cursor:pointer;}' +
    '.btn[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);border-color:var(--accent,#a8471f);color:var(--accent-ink,#7a3212);}' +
    '.btn-reset{align-self:center;background:var(--accent-soft,#f6e2d3);border-color:var(--accent-soft-line,#e8c4a4);color:var(--accent-ink,#7a3212);}' +
    '</style>' +
    '<p class="formule" id="formule"></p>' +
    '<p class="sous-formule" id="developpee"></p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" role="img" aria-label="Parabole et ses deux racines"></svg></div>' +
    '<div class="stats">' +
    '<div class="stat"><span class="stat-label">somme S = x₁ + x₂</span><span class="stat-value" id="val-s"></span></div>' +
    '<div class="stat"><span class="stat-label">produit P = x₁ · x₂</span><span class="stat-value" id="val-p"></span></div>' +
    '</div>' +
    '<div class="lecture" id="lecture"></div>' +
    '<div class="evidente-txt" id="evidente" hidden></div>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="x1">x₁ — première racine</label><div class="curseur-row">' +
    '<input type="range" id="x1" min="' + BORNES.min + '" max="' + BORNES.max + '" step="' + BORNES.step + '"><span class="curseur-valeur" id="x1-val"></span></div></div>' +
    '<div class="curseur"><label for="x2">x₂ — seconde racine</label><div class="curseur-row">' +
    '<input type="range" id="x2" min="' + BORNES.min + '" max="' + BORNES.max + '" step="' + BORNES.step + '"><span class="curseur-valeur" id="x2-val"></span></div></div>' +
    '<div class="curseur"><span class="groupe-label">a — coefficient de x²</span><div class="boutons-a" id="boutons-a"></div></div>' +
    '<button class="btn btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class VieteRacinesWidget extends HTMLElement {
    constructor() {
      super();
      var sh = this.attachShadow({ mode: "open" });
      sh.appendChild(TEMPLATE.content.cloneNode(true));
      this._x1 = DEFAUT.x1; this._x2 = DEFAUT.x2; this._a = DEFAUT.a;
      var $ = function (id) { return sh.getElementById(id); };
      this._el = {
        formule: $("formule"), developpee: $("developpee"), svg: $("svg"), s: $("val-s"), p: $("val-p"),
        lecture: $("lecture"), evidente: $("evidente"), x1: $("x1"), x2: $("x2"),
        x1Val: $("x1-val"), x2Val: $("x2-val"), boutonsA: $("boutons-a"), reset: $("reset"),
      };
      var self = this;
      this._boutons = VALEURS_A.map(function (v) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "btn"; b.textContent = "a = " + nb(v);
        b.addEventListener("click", function () { self._a = v; self._rendre(); });
        self._el.boutonsA.appendChild(b);
        return b;
      });
    }

    connectedCallback() {
      var self = this, e = this._el;
      e.x1.value = String(this._x1); e.x2.value = String(this._x2);
      this._onX1 = function () { self._x1 = parseFloat(e.x1.value); self._rendre(); };
      this._onX2 = function () { self._x2 = parseFloat(e.x2.value); self._rendre(); };
      this._onReset = function () {
        self._x1 = DEFAUT.x1; self._x2 = DEFAUT.x2; self._a = DEFAUT.a;
        e.x1.value = String(DEFAUT.x1); e.x2.value = String(DEFAUT.x2);
        self._rendre();
      };
      e.x1.addEventListener("input", this._onX1);
      e.x2.addEventListener("input", this._onX2);
      e.reset.addEventListener("click", this._onReset);
      this._rendre();
    }

    disconnectedCallback() {
      this._el.x1.removeEventListener("input", this._onX1);
      this._el.x2.removeEventListener("input", this._onX2);
      this._el.reset.removeEventListener("click", this._onReset);
    }

    _px(x, y) {
      return [MARGE + (x - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - 2 * MARGE),
        HAUTEUR - MARGE - (y - Y_MIN) / (Y_MAX - Y_MIN) * (HAUTEUR - 2 * MARGE)];
    }

    _rendre() {
      var e = this._el, a = this._a, x1 = this._x1, x2 = this._x2;
      var S = x1 + x2, P = x1 * x2, b = -a * S, c = a * P;
      var self = this;

      this._boutons.forEach(function (bt, i) { bt.setAttribute("aria-pressed", String(VALEURS_A[i] === a)); });
      e.x1Val.textContent = nb(x1);
      e.x2Val.textContent = nb(x2);
      e.formule.textContent = "f(x) = " + factorisee(a, x1, x2);
      e.developpee.textContent = "f(x) = " + polynome(a, b, c) + "    a = " + nb(a) + " ; b = " + nb(b) + " ; c = " + nb(c);
      e.s.textContent = nb(S);
      e.p.textContent = nb(P);

      // Lecture du signe des racines à partir de S et P (sans les connaître).
      var equation = "Équation de même racines (à un facteur a près) : " + polynome(1, -S, P) + " = 0.";
      var signe;
      var double = Math.abs(x1 - x2) < 1e-9;
      if (Math.abs(P) < 1e-9) {
        signe = double ? "P = 0 et S = 0 : la racine double vaut 0." : "P = 0 : <b>une des racines est nulle</b> — l'autre vaut S = " + nb(S) + ".";
      } else if (P < 0) {
        signe = "P &lt; 0 : <b>les racines sont de signes opposés</b> (un produit négatif a exactement un facteur négatif).";
      } else if (S > 0) {
        signe = "P &gt; 0 et S &gt; 0 : <b>deux racines positives</b>" + (double ? " (ici confondues)." : ".");
      } else {
        signe = "P &gt; 0 et S &lt; 0 : <b>deux racines négatives</b>" + (double ? " (ici confondues)." : ".");
      }
      e.lecture.innerHTML = equation + "<br>" + signe;

      // Racine évidente : a + b + c = a(1 − x₁)(1 − x₂) ; a − b + c = a(1 + x₁)(1 + x₂).
      var sommeABC = a + b + c, sommeAmBC = a - b + c;
      var msgs = [];
      if (Math.abs(sommeABC) < 1e-9) {
        msgs.push("a + b + c = " + nb(a) + (b < 0 ? " − " : " + ") + nb(Math.abs(b)) + (c < 0 ? " − " : " + ") + nb(Math.abs(c)) + " = 0 : <b>x = 1 est une racine évidente</b>. Par Viète, l'autre vaut c/a = " + nb(P) + ".");
      }
      if (Math.abs(sommeAmBC) < 1e-9) {
        msgs.push("a − b + c = " + nb(a) + (-b < 0 ? " − " : " + ") + nb(Math.abs(b)) + (c < 0 ? " − " : " + ") + nb(Math.abs(c)) + " = 0 : <b>x = −1 est une racine évidente</b>. Par Viète, l'autre vaut −c/a = " + nb(-P) + ".");
      }
      if (msgs.length) { e.evidente.innerHTML = msgs.join("<br>"); e.evidente.hidden = false; }
      else { e.evidente.hidden = true; e.evidente.textContent = ""; }

      // --- graphique
      var svg = e.svg;
      svg.innerHTML = "";
      var defs = svgEl("defs", {});
      var mk = svgEl("marker", { id: "fl", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      mk.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(mk); svg.appendChild(defs);
      var o = this._px(0, 0);
      svg.appendChild(svgEl("line", { x1: MARGE - 6, x2: LARGEUR - MARGE + 6, y1: o[1], y2: o[1], class: "axe", "marker-end": "url(#fl)" }));
      svg.appendChild(svgEl("line", { x1: o[0], x2: o[0], y1: HAUTEUR - MARGE + 6, y2: MARGE - 6, class: "axe", "marker-end": "url(#fl)" }));
      for (var g = X_MIN + 1; g < X_MAX; g++) {
        if (g === 0) continue;
        var pg = this._px(g, 0);
        svg.appendChild(svgEl("line", { x1: pg[0], x2: pg[0], y1: o[1] - 3, y2: o[1] + 3, class: "grad" }));
      }
      var tx = svgEl("text", { x: LARGEUR - MARGE + 4, y: o[1] - 8, class: "etiquette" }); tx.textContent = "x"; svg.appendChild(tx);
      var ty = svgEl("text", { x: o[0] + 6, y: MARGE - 8, class: "etiquette" }); ty.textContent = "y"; svg.appendChild(ty);

      // axe de symétrie x = S/2
      var xs = S / 2, ps = this._px(xs, 0);
      svg.appendChild(svgEl("line", { x1: ps[0], x2: ps[0], y1: MARGE, y2: HAUTEUR - MARGE, class: "sommet" }));
      var es = svgEl("text", { x: Math.min(ps[0] + 5, LARGEUR - 70), y: MARGE + 12, class: "etiquette-sommet" });
      es.textContent = "x = S/2 = " + nb(xs); svg.appendChild(es);

      // parabole (coupée hors de la fenêtre verticale)
      var d = "", dedans = false;
      for (var i = 0; i <= 280; i++) {
        var xx = X_MIN + i / 280 * (X_MAX - X_MIN), yy = a * (xx - x1) * (xx - x2);
        if (yy >= Y_MIN - 0.5 && yy <= Y_MAX + 0.5) {
          var p = this._px(xx, Math.max(Y_MIN, Math.min(Y_MAX, yy)));
          d += (dedans ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1) + " ";
          dedans = true;
        } else dedans = false;
      }
      svg.appendChild(svgEl("path", { d: d, class: "courbe" }));

      var racines = double ? [x1] : [Math.min(x1, x2), Math.max(x1, x2)];
      racines.forEach(function (r, k) {
        var pr = self._px(r, 0);
        var ev = Math.abs(r - 1) < 1e-9 || Math.abs(r + 1) < 1e-9;
        svg.appendChild(svgEl("circle", { cx: pr[0], cy: pr[1], r: 5, class: "racine" + (ev ? " evidente" : "") }));
        var et = svgEl("text", { x: pr[0], y: o[1] + (k === 0 ? 18 : 30), "text-anchor": "middle", class: "etiquette-racine" });
        et.textContent = double ? "racine double : " + nb(r) : nb(r);
        svg.appendChild(et);
      });
    }
  }

  if (!customElements.get("viete-racines-widget")) customElements.define("viete-racines-widget", VieteRacinesWidget);
})();
