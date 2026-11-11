(function () {
  "use strict";

  /* ================================================================
   * <chainette-widget> — atelier interactif : une chaîne suspendue entre
   * deux points d'attache (−10 ; 16) et (10 ; 16) (en mètres) prend la forme
   * d'une chaînette y = a·ch(x/a) + c, où c est réglé pour que la courbe
   * passe par les attaches. Le curseur a règle la tension (plus a est
   * grand, plus la chaîne est tendue). La parabole qui passe par les mêmes
   * attaches et le même point bas est superposée en pointillés, avec
   * l'écart maximal entre les deux. Case « Arche retournée » : la même
   * forme à l'envers (principe des arches, Gateway Arch de Saint-Louis).
   * Web Component (Shadow DOM).
   * ================================================================ */

  var L = 10, H = 16;
  var LARGEUR = 340, HAUTEUR = 270;
  var MG = { g: 34, d: 12, h: 14, b: 28 };
  var X_MIN = -12, X_MAX = 12, Y_MIN = 0, Y_MAX = 18;
  var DEFAUT = { a: 6, arche: false };

  function ch(x) { return (Math.exp(x) + Math.exp(-x)) / 2; }
  function sh(x) { return (Math.exp(x) - Math.exp(-x)) / 2; }

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
    '.sol{stroke:var(--ink-faint,#9c9083);stroke-width:1;stroke-dasharray:2 3;}' +
    '.poteau{stroke:var(--ink-soft,#6b6055);stroke-width:4;stroke-linecap:round;}' +
    '.chainette{stroke:var(--accent,#a8471f);stroke-width:3;fill:none;}' +
    '.parabole{stroke:var(--plan,#5b4ea3);stroke-width:1.8;fill:none;stroke-dasharray:6 4;}' +
    '.attache{fill:var(--ink,#241f1a);}' +
    '.ecart{stroke:var(--bad,#b3261e);stroke-width:2;}' +
    '.leg-c{fill:var(--accent-ink,#7a3212);font-size:11px;font-weight:700;}' +
    '.leg-p{fill:var(--plan,#5b4ea3);font-size:11px;font-weight:700;}' +
    '.legende{display:flex;flex-wrap:wrap;gap:4px 16px;justify-content:center;margin:0 0 10px;font-size:0.86rem;font-weight:600;}' +
    '.legende span{display:flex;align-items:center;gap:6px;}' +
    '.trait-c{display:inline-block;width:22px;border-top:3px solid var(--accent,#a8471f);}' +
    '.trait-p{display:inline-block;width:22px;border-top:2px dashed var(--plan,#5b4ea3);}' +
    '.stats{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:0 0 12px;}' +
    '.stat{flex:1 1 140px;min-width:0;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);background:var(--surface,#fff);padding:7px 6px;text-align:center;}' +
    '.stat-label{display:block;font-family:var(--mono,monospace);font-size:10px;color:var(--ink-faint,#9c9083);margin-bottom:4px;}' +
    '.stat-value{display:block;font-weight:600;font-variant-numeric:tabular-nums;}' +
    '.texte{border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);background:var(--surface,#fff);padding:10px 12px;margin:0 0 12px;font-size:0.92rem;line-height:1.55;}' +
    '.texte p{margin:0 0 6px;}' +
    '.texte p:last-child{margin-bottom:0;}' +
    '.curseur{display:flex;flex-direction:column;gap:4px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);text-align:center;}' +
    '.ligne{display:flex;align-items:center;gap:12px;min-height:44px;}' +
    '.ligne input[type="range"]{flex:1 1 auto;min-height:44px;accent-color:var(--accent,#a8471f);}' +
    '.valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;}' +
    '.case{display:flex;align-items:center;justify-content:center;gap:10px;min-height:44px;margin:8px 0;font-weight:600;cursor:pointer;}' +
    '.case input{width:22px;height:22px;accent-color:var(--accent,#a8471f);}' +
    '</style>' +
    '<div class="zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '"></svg></div>' +
    '<div class="legende"><span><i class="trait-c"></i>chaînette</span><span><i class="trait-p"></i>parabole (mêmes attaches, même point bas)</span></div>' +
    '<div class="stats">' +
    '<div class="stat"><span class="stat-label" id="fleche-label">flèche (creux)</span><span class="stat-value" id="fleche"></span></div>' +
    '<div class="stat"><span class="stat-label">longueur de la chaîne</span><span class="stat-value" id="longueur"></span></div>' +
    '<div class="stat"><span class="stat-label">écart max. avec la parabole</span><span class="stat-value" id="ecart"></span></div>' +
    '</div>' +
    '<div class="curseur"><label for="a">a — tension de la chaîne</label><div class="ligne"><input type="range" id="a" min="5" max="50" step="0.5"><span class="valeur" id="a-v"></span></div></div>' +
    '<label class="case"><input type="checkbox" id="arche"> Arche retournée</label>' +
    '<div class="texte" id="texte"></div>';

  class ChainetteWidget extends HTMLElement {
    constructor() {
      super();
      var s = this.attachShadow({ mode: "open" });
      s.appendChild(TEMPLATE.content.cloneNode(true));
      this._sh = s;
      this._a = DEFAUT.a;
      this._arche = DEFAUT.arche;
    }

    connectedCallback() {
      var self = this, s = this._sh;
      var ia = s.getElementById("a"), ic = s.getElementById("arche");
      ia.value = String(this._a);
      ic.checked = this._arche;
      ia.addEventListener("input", function () { self._a = parseFloat(ia.value); self._rendre(); });
      ic.addEventListener("change", function () { self._arche = ic.checked; self._rendre(); });
      this._rendre();
    }

    _rendre() {
      var s = this._sh, a = this._a, arche = this._arche;
      var c = H - a * ch(L / a);
      var y0 = a + c; // point bas
      var fleche = H - y0;
      var cat = function (x) { return a * ch(x / a) + c; };
      var para = function (x) { return y0 + fleche * (x / L) * (x / L); };
      // Arche retournée : Y = H − y, les attaches deviennent les pieds (au sol), le point bas devient le sommet.
      var tr = arche ? function (y) { return H - y; } : function (y) { return y; };
      var ecartMax = 0, xEcart = 0;
      for (var i = 0; i <= 400; i++) {
        var x = -L + 2 * L * i / 400;
        var e = Math.abs(cat(x) - para(x));
        if (e > ecartMax) { ecartMax = e; xEcart = x; }
      }

      s.getElementById("a-v").textContent = fr(a, 1);
      s.getElementById("fleche-label").textContent = arche ? "hauteur de l'arche" : "flèche (creux)";
      s.getElementById("fleche").textContent = fr(fleche, 2) + " m";
      s.getElementById("longueur").textContent = fr(2 * a * sh(L / a), 2) + " m";
      s.getElementById("ecart").textContent = fr(ecartMax * 100, 0) + " cm";

      var svg = s.getElementById("svg");
      svg.innerHTML = "";
      var gx = function (x) { return MG.g + (x - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - MG.g - MG.d); };
      var gy = function (y) { return HAUTEUR - MG.b - (y - Y_MIN) / (Y_MAX - Y_MIN) * (HAUTEUR - MG.b - MG.h); };
      var defs = svgEl("defs", {});
      var m = svgEl("marker", { id: "fl", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      m.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(m);
      svg.appendChild(defs);
      var bas = gy(0);
      svg.appendChild(svgEl("line", { x1: MG.g - 6, y1: bas, x2: LARGEUR - 4, y2: bas, class: "axe", "marker-end": "url(#fl)" }));
      svg.appendChild(svgEl("line", { x1: gx(0), y1: bas + 6, x2: gx(0), y2: 4, class: "axe", "marker-end": "url(#fl)" }));
      [-10, -5, 5, 10].forEach(function (v) {
        var t = svgEl("text", { x: gx(v), y: bas + 14, "text-anchor": "middle", class: "grad" });
        t.textContent = fr(v, 0);
        svg.appendChild(t);
      });
      [5, 10, 15].forEach(function (v) {
        var t = svgEl("text", { x: gx(0) - 4, y: gy(v) + 3, "text-anchor": "end", class: "grad" });
        t.textContent = fr(v, 0);
        svg.appendChild(t);
        svg.appendChild(svgEl("line", { x1: gx(0) - 3, y1: gy(v), x2: gx(0) + 3, y2: gy(v), class: "axe" }));
      });
      var unite = svgEl("text", { x: LARGEUR - 6, y: bas - 6, "text-anchor": "end", class: "grad" });
      unite.textContent = "x (m)";
      svg.appendChild(unite);

      if (!arche) {
        svg.appendChild(svgEl("line", { x1: gx(-L), y1: bas, x2: gx(-L), y2: gy(H), class: "poteau" }));
        svg.appendChild(svgEl("line", { x1: gx(L), y1: bas, x2: gx(L), y2: gy(H), class: "poteau" }));
      }
      var trace = function (f, classe) {
        var d = "";
        for (var j = 0; j <= 200; j++) {
          var x = -L + 2 * L * j / 200;
          d += (j ? "L" : "M") + gx(x).toFixed(1) + " " + gy(tr(f(x))).toFixed(1) + " ";
        }
        svg.appendChild(svgEl("path", { d: d, class: classe }));
      };
      trace(para, "parabole");
      trace(cat, "chainette");
      svg.appendChild(svgEl("circle", { cx: gx(-L), cy: gy(tr(H)), r: 4, class: "attache" }));
      svg.appendChild(svgEl("circle", { cx: gx(L), cy: gy(tr(H)), r: 4, class: "attache" }));
      if (ecartMax * (HAUTEUR - MG.b - MG.h) / (Y_MAX - Y_MIN) > 2) {
        svg.appendChild(svgEl("line", { x1: gx(xEcart), y1: gy(tr(cat(xEcart))), x2: gx(xEcart), y2: gy(tr(para(xEcart))), class: "ecart" }));
      }

      var txt = "<p>Chaînette : y = " + fr(a, 1) + " · ch(x / " + fr(a, 1) + ") " + (c < 0 ? "− " : "+ ") + fr(Math.abs(c), 2) + ", avec ch(x) = (eˣ + e⁻ˣ) / 2.</p>";
      txt += a >= 20
        ? "<p>Chaîne tendue (a grand) : la flèche est petite et la chaînette se confond presque avec la parabole — l'écart ne dépasse pas " + fr(ecartMax * 100, 0) + " cm.</p>"
        : "<p>Chaîne détendue (a petit) : la flèche est grande et la chaînette s'écarte nettement de la parabole (jusqu'à " + fr(ecartMax * 100, 0) + " cm) : elle est plus « plate » au fond et plus raide près des attaches.</p>";
      txt += arche
        ? "<p>Retournée, la chaînette donne la forme d'arche la plus stable : chaque morceau n'y est que comprimé, sans flexion. La Gateway Arch de Saint-Louis (192 m de haut, 192 m d'écartement au sol) a une forme proche d'une chaînette (une chaînette « pondérée », plus épaisse à la base).</p>"
        : "<p>Galilée pensait qu'une chaîne pendait en parabole. En 1691, Huygens, Leibniz et Jean Bernoulli montrent que c'est une autre courbe : la chaînette, écrite aujourd'hui avec le cosinus hyperbolique.</p>";
      s.getElementById("texte").innerHTML = txt;
    }
  }

  if (!customElements.get("chainette-widget")) customElements.define("chainette-widget", ChainetteWidget);
})();
