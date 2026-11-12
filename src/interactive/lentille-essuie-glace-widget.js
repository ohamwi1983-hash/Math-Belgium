(function () {
  "use strict";

  /* ================================================================
   * <lentille-essuie-glace-widget> — atelier : deux aires composées du
   * générateur 5gen12.
   *  • Lentille : deux disques de rayons r₁ et r₂ dont on fait varier la
   *    distance d des centres. La lentille commune = deux segments
   *    circulaires de même corde c. Pour chaque cercle :
   *    θ = arccos(1 − c²/(2r²)), segment = ½·r²·(θ − sin θ).
   *  • Essuie-glace : différence de deux secteurs de même angle θ,
   *    rayons R et r : aire = ½·θ·(R² − r²).
   * Fenêtres FIXES (jamais recalculées depuis les curseurs).
   * Web Component (Shadow DOM).
   * ================================================================ */

  var NS = "http://www.w3.org/2000/svg";
  var LARGEUR = 520, HAUTEUR = 320;

  function fr(n, d) {
    var f = Math.pow(10, d);
    return (Math.round(n * f) / f).toFixed(d).replace(".", ",").replace("-", "−");
  }
  function deg(rad) { return rad * 180 / Math.PI; }
  function el(tag, attrs, texte) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (texte !== undefined) e.textContent = texte;
    return e;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    "<style>" +
    ":host{display:block;font-family:var(--sans,system-ui,sans-serif);}" +
    "*{box-sizing:border-box;}" +
    "[hidden]{display:none !important;}" +
    ".ligne{display:flex;align-items:center;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:12px;}" +
    ".ligne label{font-weight:600;color:var(--ink,#241f1a);}" +
    "select{font:inherit;max-width:100%;padding:6px 10px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);}" +
    ".figure{background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);padding:6px;margin-bottom:12px;}" +
    "svg{width:100%;height:auto;display:block;}" +
    ".cercle1{stroke:var(--accent,#a8471f);stroke-width:1.8;fill:none;}" +
    ".cercle2{stroke:var(--plan,#5b4ea3);stroke-width:1.8;fill:none;}" +
    ".lentille{fill:var(--good,#2f7a4f);opacity:0.32;stroke:var(--good,#2f7a4f);stroke-width:1.4;}" +
    ".corde{stroke:var(--ink,#241f1a);stroke-width:1.8;}" +
    ".rayon1{stroke:var(--accent,#a8471f);stroke-width:1.3;stroke-dasharray:4 3;}" +
    ".rayon2{stroke:var(--plan,#5b4ea3);stroke-width:1.3;stroke-dasharray:4 3;}" +
    ".centre1{fill:var(--accent,#a8471f);}" +
    ".centre2{fill:var(--plan,#5b4ea3);}" +
    ".axe-c{stroke:var(--ink-faint,#9c9083);stroke-width:1;stroke-dasharray:2 4;}" +
    ".arc1{stroke:var(--accent,#a8471f);stroke-width:1.4;fill:none;}" +
    ".arc2{stroke:var(--plan,#5b4ea3);stroke-width:1.4;fill:none;}" +
    ".balaye{fill:var(--good,#2f7a4f);opacity:0.3;stroke:var(--good,#2f7a4f);stroke-width:1.4;}" +
    ".petit{fill:var(--surface-2,#faf6f0);stroke:var(--ink-faint,#9c9083);stroke-width:1.2;stroke-dasharray:4 3;}" +
    ".bras{stroke:var(--ink,#241f1a);stroke-width:2.6;stroke-linecap:round;}" +
    ".pivot{fill:var(--ink,#241f1a);}" +
    ".etiq{font-size:12px;fill:var(--ink-soft,#6b6055);}" +
    ".etiq1{font-size:12px;font-weight:700;fill:var(--accent-ink,#7a3212);}" +
    ".etiq2{font-size:12px;font-weight:700;fill:var(--plan,#5b4ea3);}" +
    ".etiqc{font-size:12px;font-weight:700;fill:var(--ink,#241f1a);}" +
    ".etapes{font-size:0.9rem;color:var(--ink,#241f1a);margin:0 0 12px;padding:8px 12px;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);line-height:1.6;}" +
    ".etapes p{margin:0;overflow-wrap:anywhere;}" +
    ".etapes .total{font-weight:700;color:var(--good,#2f7a4f);}" +
    ".controles{display:flex;flex-direction:column;gap:12px;}" +
    ".curseur{display:flex;flex-direction:column;gap:6px;}" +
    ".curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}" +
    ".curseur-row{display:flex;align-items:center;gap:12px;}" +
    ".curseur-row input{flex:1 1 auto;min-width:0;accent-color:var(--accent,#a8471f);}" +
    ".valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:64px;text-align:right;}" +
    "</style>" +
    '<div class="ligne"><label for="mode">Situation</label><select id="mode">' +
    '<option value="lentille">Lentille : deux segments circulaires</option>' +
    '<option value="essuie">Essuie-glace : différence de deux secteurs</option>' +
    "</select></div>" +
    '<div class="figure"><svg id="svg" viewBox="0 0 ' + LARGEUR + " " + HAUTEUR + '" role="img" aria-label="Figure de la lentille ou de l\'essuie-glace"></svg></div>' +
    '<div class="etapes" id="etapes"></div>' +
    '<div class="controles" id="controles"></div>';

  var CURSEURS = {
    lentille: [
      { id: "r1", label: "r₁ — rayon du cercle de gauche (cm)", min: 3, max: 8, step: 0.5, defaut: 6, unite: " cm" },
      { id: "r2", label: "r₂ — rayon du cercle de droite (cm)", min: 3, max: 8, step: 0.5, defaut: 6, unite: " cm" },
      { id: "d", label: "d — distance entre les centres (cm)", min: 0.5, max: 15.5, step: 0.1, defaut: 6, unite: " cm" },
    ],
    essuie: [
      { id: "R", label: "R — longueur du bras (cm)", min: 4, max: 12, step: 0.5, defaut: 10, unite: " cm" },
      { id: "r", label: "r — début du balai (cm)", min: 1, max: 11, step: 0.5, defaut: 4, unite: " cm" },
      { id: "theta", label: "θ — angle balayé (degrés)", min: 10, max: 180, step: 5, defaut: 120, unite: "°" },
    ],
  };

  class LentilleEssuieGlaceWidget extends HTMLElement {
    constructor() {
      super();
      var sr = this.attachShadow({ mode: "open" });
      sr.appendChild(TEMPLATE.content.cloneNode(true));
      this._mode = "lentille";
      this._v = {};
      var self = this;
      Object.keys(CURSEURS).forEach(function (m) { CURSEURS[m].forEach(function (c) { self._v[c.id] = c.defaut; }); });
      this._sel = sr.getElementById("mode");
      this._svg = sr.getElementById("svg");
      this._etapes = sr.getElementById("etapes");
      this._controles = sr.getElementById("controles");
      this._inputs = {};
    }

    connectedCallback() {
      var self = this;
      this._onMode = function () { self._mode = self._sel.value; self._construire(); self._rendre(); };
      this._onInput = function (e) {
        var id = e.target.dataset.id;
        self._v[id] = parseFloat(e.target.value);
        self._contraindre(id);
        self._rendre();
      };
      this._sel.addEventListener("change", this._onMode);
      this._controles.addEventListener("input", this._onInput);
      this._construire();
      this._rendre();
    }

    disconnectedCallback() {
      this._sel.removeEventListener("change", this._onMode);
      this._controles.removeEventListener("input", this._onInput);
    }

    _construire() {
      var self = this;
      this._controles.innerHTML = "";
      this._inputs = {};
      CURSEURS[this._mode].forEach(function (c) {
        var bloc = document.createElement("div");
        bloc.className = "curseur";
        bloc.innerHTML = '<label for="in-' + c.id + '">' + c.label + '</label><div class="curseur-row">' +
          '<input type="range" id="in-' + c.id + '" data-id="' + c.id + '" min="' + c.min + '" max="' + c.max + '" step="' + c.step + '" value="' + self._v[c.id] + '">' +
          '<span class="valeur" id="val-' + c.id + '"></span></div>';
        self._controles.appendChild(bloc);
        self._inputs[c.id] = { input: bloc.querySelector("input"), valeur: bloc.querySelector(".valeur"), def: c };
      });
    }

    // Les deux cercles doivent se couper (|r₁ − r₂| < d < r₁ + r₂) ; le balai commence avant le bout du bras (r < R).
    _contraindre(id) {
      var v = this._v;
      if (this._mode === "lentille") {
        var dMin = Math.abs(v.r1 - v.r2) + 0.2, dMax = v.r1 + v.r2 - 0.2;
        if (v.d < dMin) v.d = Math.round(dMin * 10) / 10;
        if (v.d > dMax) v.d = Math.round(dMax * 10) / 10;
        if (this._inputs.d) this._inputs.d.input.value = String(v.d);
      } else {
        if (v.r > v.R - 1) {
          if (id === "r") v.r = v.R - 1; else v.r = Math.max(1, v.R - 1);
          if (this._inputs.r) this._inputs.r.input.value = String(v.r);
        }
      }
    }

    _rendre() {
      var self = this;
      this._contraindre();
      Object.keys(this._inputs).forEach(function (id) {
        var o = self._inputs[id];
        o.valeur.textContent = fr(self._v[id], o.def.step < 1 ? 1 : 0) + o.def.unite;
      });
      if (this._mode === "lentille") this._rendreLentille(); else this._rendreEssuie();
    }

    _rendreLentille() {
      var r1 = this._v.r1, r2 = this._v.r2, d = this._v.d;
      // Position de la corde : abscisse a (depuis O₁) telle que r₁² − a² = r₂² − (d − a)².
      var a = (d * d + r1 * r1 - r2 * r2) / (2 * d);
      var hc = Math.sqrt(Math.max(0, r1 * r1 - a * a));
      var c = 2 * hc;
      var b = d - a; // distance de O₂ à la corde
      // Angle au centre (intercepte la corde, du côté de la lentille) : > 180° si le centre est du « mauvais » côté.
      var th1 = 2 * Math.atan2(hc, a), th2 = 2 * Math.atan2(hc, b);
      var seg1 = 0.5 * r1 * r1 * (th1 - Math.sin(th1));
      var seg2 = 0.5 * r2 * r2 * (th2 - Math.sin(th2));
      var aire = seg1 + seg2;

      var lignes = [];
      lignes.push("Corde commune : c = " + fr(c, 2) + " cm.");
      [[1, r1, th1, seg1, a], [2, r2, th2, seg2, b]].forEach(function (t) {
        var i = t[0] === 1 ? "₁" : "₂";
        var thetaArc = deg(Math.acos(Math.max(-1, Math.min(1, 1 - (c * c) / (2 * t[1] * t[1])))));
        var texteTheta = "θ" + i + " = arccos(1 − c²/(2r" + i + "²)) = arccos(1 − " + fr(c, 2) + "²/(2 × " + fr(t[1], 1) + "²)) ≈ " + fr(thetaArc, 1) + "°";
        if (t[4] < 0) texteTheta += " — le centre est du côté de la lentille : on prend 360° − " + fr(thetaArc, 1) + "° = " + fr(deg(t[2]), 1) + "°";
        lignes.push("Cercle " + t[0] + " : " + texteTheta + " ; segment" + i + " = ½ × " + fr(t[1], 1) + "² × (θ" + i + " − sin θ" + i + ") ≈ " + fr(t[3], 2) + " cm².");
      });
      lignes.push('<span class="total">Aire de la lentille = segment₁ + segment₂ ≈ ' + fr(aire, 2) + " cm²</span>");
      this._etapes.innerHTML = lignes.map(function (l) { return "<p>" + l + "</p>"; }).join("");
      this._dessinerLentille(r1, r2, d, a, hc, th1, th2);
    }

    _dessinerLentille(r1, r2, d, a, hc, th1, th2) {
      var svg = this._svg;
      svg.innerHTML = "";
      // Fenêtre FIXE : x ∈ [−17 ; 17] cm, même échelle en y (la corde est en x = 0).
      var echelle = (LARGEUR - 20) / 34;
      var cx = LARGEUR / 2, cy = HAUTEUR / 2;
      function X(x) { return cx + x * echelle; }
      function Y(y) { return cy - y * echelle; }
      var o1 = -a, o2 = d - a;

      svg.appendChild(el("line", { x1: 0, x2: LARGEUR, y1: cy, y2: cy, class: "axe-c" }));
      // Lentille : arc du cercle 2 (côté gauche de la corde) puis arc du cercle 1 (côté droit).
      var pH = X(0) + " " + Y(hc), pB = X(0) + " " + Y(-hc);
      var grand2 = th2 > Math.PI ? 1 : 0, grand1 = th1 > Math.PI ? 1 : 0;
      var dLent = "M" + pH + " A" + (r2 * echelle) + " " + (r2 * echelle) + " 0 " + grand2 + " 0 " + pB +
        " A" + (r1 * echelle) + " " + (r1 * echelle) + " 0 " + grand1 + " 0 " + pH + " Z";
      svg.appendChild(el("path", { d: dLent, class: "lentille" }));
      svg.appendChild(el("circle", { cx: X(o1), cy: cy, r: r1 * echelle, class: "cercle1" }));
      svg.appendChild(el("circle", { cx: X(o2), cy: cy, r: r2 * echelle, class: "cercle2" }));
      svg.appendChild(el("line", { x1: X(0), x2: X(0), y1: Y(hc), y2: Y(-hc), class: "corde" }));
      svg.appendChild(el("line", { x1: X(o1), y1: cy, x2: X(0), y2: Y(hc), class: "rayon1" }));
      svg.appendChild(el("line", { x1: X(o1), y1: cy, x2: X(0), y2: Y(-hc), class: "rayon1" }));
      svg.appendChild(el("line", { x1: X(o2), y1: cy, x2: X(0), y2: Y(hc), class: "rayon2" }));
      svg.appendChild(el("line", { x1: X(o2), y1: cy, x2: X(0), y2: Y(-hc), class: "rayon2" }));
      svg.appendChild(el("circle", { cx: X(o1), cy: cy, r: 3.5, class: "centre1" }));
      svg.appendChild(el("circle", { cx: X(o2), cy: cy, r: 3.5, class: "centre2" }));
      svg.appendChild(el("text", { x: X(o1) - 8, y: cy + 18, "text-anchor": "end", class: "etiq1" }, "O₁"));
      svg.appendChild(el("text", { x: X(o2) + 8, y: cy + 18, "text-anchor": "start", class: "etiq2" }, "O₂"));
      // Petits arcs d'angle au centre.
      function petitArc(ox, sens, th, cls) {
        var ra = 16, mid = sens > 0 ? 0 : Math.PI;
        var a0 = mid - th / 2, a1 = mid + th / 2;
        var p0 = [X(ox) + ra * Math.cos(a0), cy - ra * Math.sin(a0)], p1 = [X(ox) + ra * Math.cos(a1), cy - ra * Math.sin(a1)];
        svg.appendChild(el("path", { d: "M" + p0[0] + " " + p0[1] + " A" + ra + " " + ra + " 0 " + (th > Math.PI ? 1 : 0) + " 0 " + p1[0] + " " + p1[1], class: cls }));
      }
      petitArc(o1, 1, th1, "arc1");
      petitArc(o2, -1, th2, "arc2");
      var yc = Y(hc) - 8;
      svg.appendChild(el("text", { x: X(0) + 6, y: Math.max(14, yc), class: "etiqc" }, "c"));
      svg.appendChild(el("text", { x: 10, y: 18, class: "etiq1" }, "r₁ = " + fr(r1, 1)));
      svg.appendChild(el("text", { x: LARGEUR - 10, y: 18, "text-anchor": "end", class: "etiq2" }, "r₂ = " + fr(r2, 1)));
      svg.appendChild(el("text", { x: LARGEUR / 2, y: HAUTEUR - 8, "text-anchor": "middle", class: "etiq" }, "d = O₁O₂ = " + fr(d, 1) + " cm"));
    }

    _rendreEssuie() {
      var R = this._v.R, r = this._v.r, thDeg = this._v.theta;
      var th = thDeg * Math.PI / 180;
      var grand = 0.5 * th * R * R, petit = 0.5 * th * r * r, aire = grand - petit;
      var lignes = [
        "θ = " + fr(thDeg, 0) + "° = " + fr(th, 3) + " rad (multiplie par π/180).",
        "Grand secteur : ½ × θ × R² = ½ × " + fr(th, 3) + " × " + fr(R, 1) + "² ≈ " + fr(grand, 2) + " cm².",
        "Petit secteur : ½ × θ × r² = ½ × " + fr(th, 3) + " × " + fr(r, 1) + "² ≈ " + fr(petit, 2) + " cm².",
        '<span class="total">Surface balayée = ½ × θ × (R² − r²) ≈ ' + fr(aire, 2) + " cm²</span>",
      ];
      this._etapes.innerHTML = lignes.map(function (l) { return "<p>" + l + "</p>"; }).join("");
      this._dessinerEssuie(R, r, th);
    }

    _dessinerEssuie(R, r, th) {
      var svg = this._svg;
      svg.innerHTML = "";
      // Fenêtre FIXE : bras jusqu'à 12 cm ; pivot en bas au centre ; balayage symétrique autour de la verticale.
      var echelle = (HAUTEUR - 50) / 13;
      var px0 = LARGEUR / 2, py0 = HAUTEUR - 22;
      var a0 = Math.PI / 2 + th / 2, a1 = Math.PI / 2 - th / 2;
      function P(rr, ang) { return [px0 + rr * echelle * Math.cos(ang), py0 - rr * echelle * Math.sin(ang)]; }
      var G0 = P(R, a0), G1 = P(R, a1), p0 = P(r, a0), p1 = P(r, a1);
      var large = th > Math.PI ? 1 : 0;
      var Rp = R * echelle, rp = r * echelle;
      // Couronne balayée (grand secteur moins petit secteur).
      var dBal = "M" + p0[0] + " " + p0[1] + " L" + G0[0] + " " + G0[1] +
        " A" + Rp + " " + Rp + " 0 " + large + " 1 " + G1[0] + " " + G1[1] +
        " L" + p1[0] + " " + p1[1] +
        " A" + rp + " " + rp + " 0 " + large + " 0 " + p0[0] + " " + p0[1] + " Z";
      svg.appendChild(el("path", { d: dBal, class: "balaye" }));
      var dPetit = "M" + px0 + " " + py0 + " L" + p0[0] + " " + p0[1] + " A" + rp + " " + rp + " 0 " + large + " 1 " + p1[0] + " " + p1[1] + " Z";
      svg.appendChild(el("path", { d: dPetit, class: "petit" }));
      svg.appendChild(el("line", { x1: px0, y1: py0, x2: G0[0], y2: G0[1], class: "bras" }));
      svg.appendChild(el("line", { x1: px0, y1: py0, x2: G1[0], y2: G1[1], class: "bras" }));
      svg.appendChild(el("circle", { cx: px0, cy: py0, r: 4.5, class: "pivot" }));
      // Arc de l'angle θ près du pivot.
      var ra = 22, q0 = [px0 + ra * Math.cos(a0), py0 - ra * Math.sin(a0)], q1 = [px0 + ra * Math.cos(a1), py0 - ra * Math.sin(a1)];
      svg.appendChild(el("path", { d: "M" + q0[0] + " " + q0[1] + " A" + ra + " " + ra + " 0 " + large + " 1 " + q1[0] + " " + q1[1], class: "arc1" }));
      svg.appendChild(el("text", { x: px0, y: py0 - ra - 6, "text-anchor": "middle", class: "etiq1" }, "θ"));
      // Étiquettes R et r le long du bras droit (à l'intérieur du cadre).
      var mR = P((R + r) / 2, a1), mr = P(r / 2, a1);
      svg.appendChild(el("text", { x: mR[0] + 8, y: mR[1], class: "etiq2" }, "R = " + fr(R, 1)));
      svg.appendChild(el("text", { x: mr[0] + 8, y: mr[1] + 4, class: "etiq" }, "r = " + fr(r, 1)));
    }
  }

  if (!customElements.get("lentille-essuie-glace-widget")) {
    customElements.define("lentille-essuie-glace-widget", LentilleEssuieGlaceWidget);
  }
})();
