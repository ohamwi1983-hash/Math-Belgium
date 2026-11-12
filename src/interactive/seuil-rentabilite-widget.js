(function () {
  "use strict";

  /* ================================================================
   * <seuil-rentabilite-widget> — atelier « Seuil de rentabilité » (5e,
   * chapitre 1, section 5). Curseurs : coût fixe CF, coût variable unitaire cv,
   * prix de vente p. Graphe principal : CT(x) = CF + cv·x, CA(x) = p·x et le
   * bénéfice B(x) = CA(x) − CT(x), seuil marqué. Panneau secondaire : le coût
   * unitaire c(x) = CT(x)/x — un QUOTIENT de deux fonctions, pas une
   * composition — qui décroît vers cv et croise le prix p exactement au seuil.
   * Fenêtres FIXES (jamais recalculées depuis les curseurs).
   * ================================================================ */

  var X_MAX = 300;
  var Y_MIN = -3000, Y_MAX = 12000, Y_PAS = 3000;
  var C_MAX = 60, C_PAS = 10;
  var GL = 440, GH = 280, PH = 190, MG = 52, MD = 16, MH = 18, MB = 28;

  function nombreFr(n, d) {
    var neg = n < 0, v = Math.abs(n);
    var s = v.toFixed(d);
    if (d > 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
    var parts = s.split(".");
    if (parts[0].length > 4) parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    s = parts.join(",");
    return (neg && Number(s.replace(",", ".").replace(/ /g, "")) !== 0 ? "−" : "") + s;
  }

  function svgEl(ns, tag, attrs) {
    var el = document.createElementNS(ns, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    "<style>" +
    ":host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}" +
    "*{box-sizing:border-box;}" +
    "[hidden]{display:none!important;}" +
    ".formules{text-align:center;font-family:var(--serif,serif);font-size:0.98rem;margin:0 0 10px;line-height:1.6;}" +
    ".formules span{display:inline-block;margin:0 6px;}" +
    ".formules .ct{color:var(--plan-ink,#463c86);}" +
    ".formules .ca{color:var(--good,#2f7a4f);}" +
    ".formules .b{color:var(--accent-ink,#7a3212);}" +
    ".figures{display:flex;flex-direction:column;align-items:center;gap:8px;margin-bottom:12px;}" +
    ".figures svg{width:100%;max-width:440px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}" +
    ".grille{stroke:var(--line-soft,#ece4d6);stroke-width:1;}" +
    ".axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}" +
    ".fleche{fill:var(--ink-soft,#6b6055);}" +
    ".grad{font-size:10px;font-family:var(--mono,monospace);fill:var(--ink-soft,#6b6055);}" +
    ".titre-axe{font-size:11px;font-style:italic;font-family:var(--serif,serif);fill:var(--ink-soft,#6b6055);}" +
    ".ct{stroke:var(--plan,#5b4ea3);stroke-width:2.4;fill:none;}" +
    ".ca{stroke:var(--good,#2f7a4f);stroke-width:2.4;fill:none;}" +
    ".b{stroke:var(--accent,#a8471f);stroke-width:2.4;fill:none;stroke-dasharray:7 4;}" +
    ".cu{stroke:var(--sky,#2f7fa8);stroke-width:2.4;fill:none;}" +
    ".prix{stroke:var(--good,#2f7a4f);stroke-width:1.5;stroke-dasharray:5 4;}" +
    ".cv{stroke:var(--ink-faint,#9c9083);stroke-width:1.3;stroke-dasharray:3 3;}" +
    ".seuil{stroke:var(--accent,#a8471f);stroke-width:1.3;stroke-dasharray:4 3;}" +
    ".sonde{stroke:var(--ink-faint,#9c9083);stroke-width:1;}" +
    ".pt-seuil{fill:var(--accent,#a8471f);}" +
    ".leg{font-size:11px;font-family:var(--sans,sans-serif);font-weight:600;}" +
    ".leg-ct{fill:var(--plan-ink,#463c86);}" +
    ".leg-ca{fill:var(--good,#2f7a4f);}" +
    ".leg-b{fill:var(--accent-ink,#7a3212);}" +
    ".leg-cu{fill:var(--sky-ink,#1d5a7a);}" +
    ".leg-faint{fill:var(--ink-soft,#6b6055);font-weight:500;}" +
    ".verdict{text-align:center;font-weight:600;font-size:0.92rem;padding:8px 12px;border-radius:var(--radius,3px);margin:0 0 10px;}" +
    ".verdict.ok{background:var(--good-soft,#e2f0e7);color:var(--good,#2f7a4f);}" +
    ".verdict.non{background:var(--bad-soft,#f8e2e0);color:var(--bad,#a8322f);}" +
    ".sonde-txt{text-align:center;font-size:0.88rem;font-variant-numeric:tabular-nums;color:var(--ink-soft,#6b6055);margin:0 0 12px;}" +
    ".note{text-align:center;font-size:0.82rem;color:var(--ink-soft,#6b6055);margin:0 0 12px;}" +
    ".curseurs{display:flex;flex-direction:column;gap:8px;}" +
    ".curseur{display:flex;align-items:center;gap:10px;font-size:0.88rem;}" +
    ".curseur label{flex:0 0 150px;font-weight:600;}" +
    ".curseur input{flex:1 1 auto;accent-color:var(--accent,#a8471f);min-width:0;}" +
    ".curseur span{min-width:62px;text-align:right;font-variant-numeric:tabular-nums;font-weight:600;}" +
    "@media (max-width:480px){.curseur label{flex-basis:96px;font-size:0.8rem;}}" +
    "</style>" +
    '<p class="formules" id="formules"></p>' +
    '<div class="figures">' +
    '<svg id="svg-principal" viewBox="0 0 ' + GL + " " + GH + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Coût total, chiffre d\'affaires et bénéfice"></svg>' +
    '<svg id="svg-unitaire" viewBox="0 0 ' + GL + " " + PH + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Coût unitaire"></svg>' +
    "</div>" +
    '<p class="verdict" id="verdict"></p>' +
    '<p class="sonde-txt" id="sonde-txt"></p>' +
    '<p class="note">c(x) = CT(x)/x est un quotient de deux fonctions, pas une composition : on divise le coût total par la quantité.</p>' +
    '<div class="curseurs">' +
    '<div class="curseur"><label for="cf">coût fixe CF (€)</label><input type="range" id="cf" min="0" max="2000" step="50" value="600"><span id="cf-v"></span></div>' +
    '<div class="curseur"><label for="cv">coût variable cv (€/objet)</label><input type="range" id="cv" min="1" max="30" step="0.5" value="8"><span id="cv-v"></span></div>' +
    '<div class="curseur"><label for="p">prix de vente p (€/objet)</label><input type="range" id="p" min="1" max="40" step="0.5" value="14"><span id="p-v"></span></div>' +
    '<div class="curseur"><label for="x">quantité x (objets)</label><input type="range" id="x" min="1" max="300" step="1" value="150"><span id="x-v"></span></div>' +
    "</div>";

  class SeuilRentabiliteWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._s = shadow;
    }

    connectedCallback() {
      if (this._pret) return;
      this._pret = true;
      var self = this;
      ["cf", "cv", "p", "x"].forEach(function (id) {
        self._s.getElementById(id).addEventListener("input", function () { self._rendre(); });
      });
      this._rendre();
    }

    _val(id) { return parseFloat(this._s.getElementById(id).value); }

    _rendre() {
      var s = this._s;
      var CF = this._val("cf"), cv = this._val("cv"), p = this._val("p"), xs = this._val("x");
      s.getElementById("cf-v").textContent = nombreFr(CF, 0) + " €";
      s.getElementById("cv-v").textContent = nombreFr(cv, 2) + " €";
      s.getElementById("p-v").textContent = nombreFr(p, 2) + " €";
      s.getElementById("x-v").textContent = nombreFr(xs, 0);
      var marge = p - cv;
      s.getElementById("formules").innerHTML =
        '<span class="ct">CT(x) = ' + nombreFr(CF, 0) + " + " + nombreFr(cv, 2) + "x</span>   " +
        '<span class="ca">CA(x) = ' + nombreFr(p, 2) + "x</span>   " +
        '<span class="b">B(x) = CA(x) − CT(x) = ' + expressionBenefice(marge, CF) + "</span>";
      var seuil = marge > 0 ? CF / marge : null;
      var verdict = s.getElementById("verdict");
      if (seuil === null) {
        verdict.className = "verdict non";
        verdict.textContent = "Jamais rentable : chaque objet rapporte p − cv = " + nombreFr(marge, 2) +
          " € ≤ 0, le bénéfice ne rattrape jamais le coût fixe.";
      } else if (seuil === 0) {
        verdict.className = "verdict ok";
        verdict.textContent = "Pas de coût fixe : rentable dès le premier objet vendu.";
      } else {
        verdict.className = "verdict ok";
        var entier = Math.abs(seuil - Math.round(seuil)) < 1e-9;
        verdict.textContent = "Seuil de rentabilité : x = CF/(p − cv) = " + nombreFr(seuil, 1) +
          (entier ? " — B(" + nombreFr(seuil, 0) + ") = 0, rentable à partir de " + nombreFr(seuil + 1, 0) + " objets."
            : " — rentable à partir de " + nombreFr(Math.ceil(seuil), 0) + " objets.") +
          (seuil > X_MAX ? " (hors du graphique)" : "");
      }
      var CT = CF + cv * xs, CA = p * xs;
      s.getElementById("sonde-txt").textContent =
        "Pour x = " + nombreFr(xs, 0) + " : CT = " + nombreFr(CT, 0) + " €, CA = " + nombreFr(CA, 0) + " €, B = " +
        nombreFr(CA - CT, 0) + " €, c(x) = " + nombreFr(CT / xs, 2) + " € par objet.";
      this._dessinerPrincipal(CF, cv, p, seuil, xs);
      this._dessinerUnitaire(CF, cv, p, seuil, xs);
    }

    _axes(svg, ns, px, py, yMin, yMax, pas, hauteur, titreY) {
      var defs = svgEl(ns, "defs", {});
      var marker = svgEl(ns, "marker", { id: "fl", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      marker.appendChild(svgEl(ns, "path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(marker);
      svg.appendChild(defs);
      for (var gx = 50; gx <= X_MAX; gx += 50) {
        svg.appendChild(svgEl(ns, "line", { x1: px(gx), x2: px(gx), y1: py(yMin), y2: py(yMax), class: "grille" }));
        var t = svgEl(ns, "text", { x: px(gx), y: hauteur - MB + 14, "text-anchor": "middle", class: "grad" });
        t.textContent = String(gx);
        svg.appendChild(t);
      }
      for (var gy = yMin; gy <= yMax; gy += pas) {
        svg.appendChild(svgEl(ns, "line", { x1: px(0), x2: px(X_MAX), y1: py(gy), y2: py(gy), class: "grille" }));
        if (gy === yMax) continue; // place laissée au titre d'axe
        var t2 = svgEl(ns, "text", { x: px(0) - 5, y: py(gy) + 3.5, "text-anchor": "end", class: "grad" });
        t2.textContent = nombreFr(gy, 0);
        svg.appendChild(t2);
      }
      svg.appendChild(svgEl(ns, "line", { x1: px(0), x2: px(X_MAX) + 6, y1: py(0), y2: py(0), class: "axe", "marker-end": "url(#fl)" }));
      svg.appendChild(svgEl(ns, "line", { x1: px(0), x2: px(0), y1: py(yMin), y2: py(yMax) - 6, class: "axe", "marker-end": "url(#fl)" }));
      var tx = svgEl(ns, "text", { x: px(X_MAX), y: py(0) - 6, "text-anchor": "end", class: "titre-axe" });
      tx.textContent = "x (objets)";
      svg.appendChild(tx);
      var ty = svgEl(ns, "text", { x: px(0) + 6, y: py(yMax) + 6, class: "titre-axe" });
      ty.textContent = titreY;
      svg.appendChild(ty);
    }

    _dessinerPrincipal(CF, cv, p, seuil, xs) {
      var ns = "http://www.w3.org/2000/svg", svg = this._s.getElementById("svg-principal");
      svg.innerHTML = "";
      var px = function (x) { return MG + x / X_MAX * (GL - MG - MD); };
      var py = function (y) { return MH + (Y_MAX - y) / (Y_MAX - Y_MIN) * (GH - MH - MB); };
      this._axes(svg, ns, px, py, Y_MIN, Y_MAX, Y_PAS, GH, "€");
      droite(svg, ns, px, py, function (x) { return CF + cv * x; }, Y_MIN, Y_MAX, "ct");
      droite(svg, ns, px, py, function (x) { return p * x; }, Y_MIN, Y_MAX, "ca");
      droite(svg, ns, px, py, function (x) { return (p - cv) * x - CF; }, Y_MIN, Y_MAX, "b");
      svg.appendChild(svgEl(ns, "line", { x1: px(xs), x2: px(xs), y1: py(Y_MIN), y2: py(Y_MAX), class: "sonde" }));
      if (seuil !== null && seuil > 0 && seuil <= X_MAX) {
        svg.appendChild(svgEl(ns, "line", { x1: px(seuil), x2: px(seuil), y1: py(Y_MIN), y2: py(p * seuil), class: "seuil" }));
        svg.appendChild(svgEl(ns, "circle", { cx: px(seuil), cy: py(0), r: 4.5, class: "pt-seuil" }));
        var droiteBord = px(seuil) > GL - 110;
        var et = svgEl(ns, "text", { x: px(seuil) + (droiteBord ? -6 : 6), y: py(0) + 16, "text-anchor": droiteBord ? "end" : "start", class: "leg leg-b" });
        et.textContent = "seuil ≈ " + nombreFr(seuil, 1);
        svg.appendChild(et);
      }
      [["CT(x)", "leg-ct"], ["CA(x)", "leg-ca"], ["B(x)", "leg-b"]].forEach(function (l, i) {
        var t = svgEl(ns, "text", { x: MG + 22, y: MH + 14 + i * 14, class: "leg " + l[1] });
        t.textContent = l[0];
        svg.appendChild(t);
      });
    }

    _dessinerUnitaire(CF, cv, p, seuil, xs) {
      var ns = "http://www.w3.org/2000/svg", svg = this._s.getElementById("svg-unitaire");
      svg.innerHTML = "";
      var px = function (x) { return MG + x / X_MAX * (GL - MG - MD); };
      var py = function (y) { return MH + (C_MAX - y) / C_MAX * (PH - MH - MB); };
      this._axes(svg, ns, px, py, 0, C_MAX, C_PAS, PH, "€");
      if (cv <= C_MAX) svg.appendChild(svgEl(ns, "line", { x1: px(0), x2: px(X_MAX), y1: py(cv), y2: py(cv), class: "cv" }));
      if (p <= C_MAX) svg.appendChild(svgEl(ns, "line", { x1: px(0), x2: px(X_MAX), y1: py(p), y2: py(p), class: "prix" }));
      // c(x) = CF/x + cv : tracé seulement là où il entre dans le cadre (x > 0).
      var d = "", dedans = false;
      for (var i = 1; i <= 600; i++) {
        var x = (i / 600) * X_MAX, c = CF / x + cv;
        if (c <= C_MAX) { d += (dedans ? "L" : "M") + px(x).toFixed(1) + " " + py(c).toFixed(1) + " "; dedans = true; }
        else dedans = false;
      }
      if (d) svg.appendChild(svgEl(ns, "path", { d: d.trim(), class: "cu" }));
      svg.appendChild(svgEl(ns, "line", { x1: px(xs), x2: px(xs), y1: py(0), y2: py(C_MAX), class: "sonde" }));
      if (seuil !== null && seuil > 0 && seuil <= X_MAX && p <= C_MAX) {
        svg.appendChild(svgEl(ns, "line", { x1: px(seuil), x2: px(seuil), y1: py(0), y2: py(p), class: "seuil" }));
        svg.appendChild(svgEl(ns, "circle", { cx: px(seuil), cy: py(p), r: 4.5, class: "pt-seuil" }));
      }
      var leg = [["c(x) = CT(x)/x (€ par objet)", "leg-cu"], ["prix p", "leg-ca"], ["coût variable cv", "leg-faint"]];
      leg.forEach(function (l, i) {
        var t = svgEl(ns, "text", { x: GL - MD - 4, y: MH + 12 + i * 13, "text-anchor": "end", class: "leg " + l[1] });
        t.textContent = l[0];
        svg.appendChild(t);
      });
    }
  }

  // B(x) = (p − cv)x − CF, sans « 0x » ni « − 0 ».
  function expressionBenefice(marge, CF) {
    var termeX = marge === 0 ? "" : (marge === 1 ? "" : marge === -1 ? "−" : nombreFr(marge, 2)) + "x";
    if (CF === 0) return termeX || "0";
    return termeX ? termeX + " − " + nombreFr(CF, 0) : "−" + nombreFr(CF, 0);
  }

  // Droite y = f(x) sur [0 ; X_MAX], découpée au cadre vertical (échantillonnage fin).
  function droite(svg, ns, px, py, f, yMin, yMax, classe) {
    var d = "", dedans = false;
    for (var i = 0; i <= 300; i++) {
      var x = (i / 300) * X_MAX, y = f(x);
      if (y >= yMin && y <= yMax) { d += (dedans ? "L" : "M") + px(x).toFixed(1) + " " + py(y).toFixed(1) + " "; dedans = true; }
      else dedans = false;
    }
    if (d) svg.appendChild(svgEl(ns, "path", { d: d.trim(), class: classe }));
  }

  if (!customElements.get("seuil-rentabilite-widget")) {
    customElements.define("seuil-rentabilite-widget", SeuilRentabiliteWidget);
  }
})();
