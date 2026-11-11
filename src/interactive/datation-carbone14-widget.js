(function () {
  "use strict";

  /* ================================================================
   * <datation-carbone14-widget> — atelier interactif : décroissance du
   * carbone 14, N(t)/N₀ = (1/2)^(t/5 730), tracée de 0 à 40 000 ans, avec
   * l'escalier des demi-vies (50 %, 25 %, 12,5 %…) en pointillés. Un curseur
   * « pourcentage de ¹⁴C restant » donne l'âge t = 5 730 · ln(1/p) / ln 2,
   * repéré sur la courbe et sur les deux axes, et le calcul est détaillé
   * pas à pas (e^(−λt) = p, λ = ln 2 / 5 730). Web Component (Shadow DOM).
   * ================================================================ */

  var DEMI_VIE = 5730;
  var LAMBDA = Math.LN2 / DEMI_VIE;
  var T_MAX = 40000;
  var LARGEUR = 340, HAUTEUR = 240;
  var MG = { g: 40, d: 14, h: 14, b: 34 };
  var DEFAUT = 30;

  function fr(n, d) {
    var s = (Math.round(n * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d);
    var neg = s.charAt(0) === "-";
    if (neg) s = s.slice(1);
    var parts = s.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    s = parts.join(",");
    if (neg && /[1-9]/.test(s)) s = "−" + s;
    return s;
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
    '.zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:340px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.grad{font-size:9.5px;font-family:var(--mono,monospace);fill:var(--ink-soft,#6b6055);}' +
    '.titre-axe{font-size:10px;font-family:var(--mono,monospace);fill:var(--ink-faint,#9c9083);}' +
    '.courbe{stroke:var(--accent,#a8471f);stroke-width:2.6;fill:none;}' +
    '.escalier{stroke:var(--ink-faint,#9c9083);stroke-width:1.1;stroke-dasharray:4 3;fill:none;}' +
    '.point-demi{fill:var(--ink-faint,#9c9083);}' +
    '.lecture{stroke:var(--plan,#5b4ea3);stroke-width:1.4;stroke-dasharray:5 3;}' +
    '.point{fill:var(--plan,#5b4ea3);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.val-lecture{font-size:10.5px;font-weight:700;font-family:var(--mono,monospace);fill:var(--plan,#5b4ea3);}' +
    '.resultat{text-align:center;font-size:1.05rem;font-weight:700;margin:0 0 8px;font-variant-numeric:tabular-nums;}' +
    '.calcul{border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);background:var(--surface,#fff);padding:10px 12px;margin:0 0 12px;font-size:0.92rem;line-height:1.6;}' +
    '.calcul ol{margin:0;padding-left:1.3em;}' +
    '.note{font-size:0.86rem;color:var(--ink-soft,#6b6055);margin:0 0 12px;}' +
    '.alerte{color:var(--bad,#b3261e);font-weight:600;}' +
    '.curseur{display:flex;flex-direction:column;gap:4px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--plan,#5b4ea3);text-align:center;}' +
    '.ligne{display:flex;align-items:center;gap:12px;min-height:44px;}' +
    '.ligne input[type="range"]{flex:1 1 auto;min-height:44px;accent-color:var(--plan,#5b4ea3);}' +
    '.valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;}' +
    '</style>' +
    '<div class="zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '"></svg></div>' +
    '<p class="resultat" id="resultat"></p>' +
    '<div class="curseur"><label for="p">pourcentage de carbone 14 restant</label><div class="ligne"><input type="range" id="p" min="1" max="100" step="1"><span class="valeur" id="p-v"></span></div></div>' +
    '<div class="calcul" id="calcul"></div>' +
    '<p class="note" id="note"></p>';

  class DatationCarbone14Widget extends HTMLElement {
    constructor() {
      super();
      var sh = this.attachShadow({ mode: "open" });
      sh.appendChild(TEMPLATE.content.cloneNode(true));
      this._sh = sh;
      this._p = DEFAUT;
    }

    connectedCallback() {
      var self = this, inp = this._sh.getElementById("p");
      inp.value = String(this._p);
      inp.addEventListener("input", function () { self._p = parseFloat(inp.value); self._rendre(); });
      this._rendre();
    }

    _rendre() {
      var sh = this._sh;
      var pct = this._p, p = pct / 100;
      var age = -Math.log(p) / LAMBDA;
      sh.getElementById("p-v").textContent = pct + " %";

      var svg = sh.getElementById("svg");
      svg.innerHTML = "";
      var bas = HAUTEUR - MG.b;
      var gx = function (t) { return MG.g + (t / T_MAX) * (LARGEUR - MG.g - MG.d); };
      var gy = function (v) { return bas - (v / 100) * (bas - MG.h); };
      var defs = svgEl("defs", {});
      var m = svgEl("marker", { id: "fl", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      m.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(m);
      svg.appendChild(defs);
      svg.appendChild(svgEl("line", { x1: MG.g, y1: bas, x2: LARGEUR - 4, y2: bas, class: "axe", "marker-end": "url(#fl)" }));
      svg.appendChild(svgEl("line", { x1: MG.g, y1: bas, x2: MG.g, y2: 4, class: "axe", "marker-end": "url(#fl)" }));
      for (var t = 0; t <= T_MAX; t += 10000) {
        var x = gx(t);
        svg.appendChild(svgEl("line", { x1: x, y1: bas, x2: x, y2: bas + 4, class: "axe" }));
        var tx = svgEl("text", { x: x, y: bas + 14, "text-anchor": t === T_MAX ? "end" : "middle", class: "grad" });
        tx.textContent = fr(t, 0);
        svg.appendChild(tx);
      }
      var lt = svgEl("text", { x: LARGEUR - 6, y: bas + 28, "text-anchor": "end", class: "titre-axe" });
      lt.textContent = "t (années)";
      svg.appendChild(lt);
      [25, 50, 75, 100].forEach(function (v) {
        var y = gy(v);
        svg.appendChild(svgEl("line", { x1: MG.g - 4, y1: y, x2: MG.g, y2: y, class: "axe" }));
        var g = svgEl("text", { x: MG.g - 6, y: y + 3, "text-anchor": "end", class: "grad" });
        g.textContent = v + " %";
        svg.appendChild(g);
      });
      var ly = svgEl("text", { x: MG.g + 6, y: 12, class: "titre-axe" });
      ly.textContent = "¹⁴C restant";
      svg.appendChild(ly);

      // escalier des demi-vies
      for (var k = 1; k * DEMI_VIE <= T_MAX; k++) {
        var tk = k * DEMI_VIE, vk = 100 / Math.pow(2, k);
        var d = "M" + MG.g + " " + gy(vk).toFixed(1) + " L" + gx(tk).toFixed(1) + " " + gy(vk).toFixed(1) + " L" + gx(tk).toFixed(1) + " " + bas;
        if (k <= 3) svg.appendChild(svgEl("path", { d: d, class: "escalier" }));
        svg.appendChild(svgEl("circle", { cx: gx(tk), cy: gy(vk), r: 2.6, class: "point-demi" }));
      }
      // courbe
      var dc = "";
      for (var j = 0; j <= 200; j++) {
        var tt = T_MAX * j / 200;
        dc += (j ? "L" : "M") + gx(tt).toFixed(1) + " " + gy(100 * Math.exp(-LAMBDA * tt)).toFixed(1) + " ";
      }
      svg.appendChild(svgEl("path", { d: dc, class: "courbe" }));

      // lecture
      var px = gx(Math.min(age, T_MAX)), py = gy(pct);
      if (age <= T_MAX) {
        svg.appendChild(svgEl("line", { x1: MG.g, y1: py, x2: px, y2: py, class: "lecture" }));
        svg.appendChild(svgEl("line", { x1: px, y1: py, x2: px, y2: bas, class: "lecture" }));
        svg.appendChild(svgEl("circle", { cx: px, cy: py, r: 5, class: "point" }));
        var lab = svgEl("text", { x: Math.min(px + 6, LARGEUR - 70), y: Math.max(py - 8, 24), class: "val-lecture" });
        lab.textContent = "≈ " + fr(age, 0) + " ans";
        svg.appendChild(lab);
      }

      sh.getElementById("resultat").textContent = "Il reste " + pct + " % de carbone 14 : âge ≈ " + fr(age, 0) + " ans (" + fr(age / DEMI_VIE, 2) + (age / DEMI_VIE < 2 ? " demi-vie)" : " demi-vies)");
      sh.getElementById("calcul").innerHTML =
        "<ol>" +
        "<li>Modèle : N(t) = N₀ · e<sup>−λt</sup>, avec λ = ln 2 / 5 730 ≈ 1,2097 × 10⁻⁴ par an.</li>" +
        "<li>Il reste " + fr(p, 2) + " de N₀ : e<sup>−λt</sup> = " + fr(p, 2) + ".</li>" +
        "<li>On applique ln aux deux membres : −λt = ln(" + fr(p, 2) + ") ≈ " + fr(Math.log(p), 4) + ".</li>" +
        "<li>t = −ln(" + fr(p, 2) + ") / λ = 5 730 × ln(1/" + fr(p, 2) + ") / ln 2 ≈ <b>" + fr(age, 0) + " ans</b>.</li>" +
        "</ol>";
      sh.getElementById("note").innerHTML = pct <= 3
        ? '<span class="alerte">Attention :</span> avec si peu de carbone 14, la mesure devient très imprécise. Au-delà d\'environ 50 000 ans, il en reste trop peu pour dater un objet.'
        : "Chaque palier en pointillés est une demi-vie : la quantité est divisée par 2 tous les 5 730 ans, quelle que soit la quantité de départ. Au-delà d'environ 50 000 ans, il reste trop peu de carbone 14 pour mesurer.";
    }
  }

  if (!customElements.get("datation-carbone14-widget")) customElements.define("datation-carbone14-widget", DatationCarbone14Widget);
})();
