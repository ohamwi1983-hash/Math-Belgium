(function () {
  "use strict";

  /* ================================================================
   * <seuil-grande-roue-widget> — atelier : inéquation sinusoïdale sur la
   * grande roue de l'exemple du chapitre (rayon 15 m, centre à 17 m,
   * période 8 min, départ au point le plus bas) :
   *   h(t) = 15 sin(πt/4 − π/2) + 17.
   * Un curseur règle le seuil y₀ ; l'arc solution s'allume sur la roue,
   * les intervalles en t se colorent sur la courbe (deux tours), et la
   * durée par tour au-dessus (ou au-dessous) du seuil s'affiche.
   * Une seule <svg> (roue + courbe à la même échelle verticale) : la
   * droite y = y₀ traverse les deux panneaux. Web Component (Shadow DOM).
   * ================================================================ */

  var NS = "http://www.w3.org/2000/svg";
  var A = 15, B = 17, T = 8, OMEGA = Math.PI / 4, PHI = -Math.PI / 2;
  var DEFAUT = { seuil: 24.5, sens: "dessus" };
  var BORNES_SEUIL = { min: 0, max: 34, step: 0.5 };

  // Fenêtre FIXE (jamais recalculée depuis le seuil) : hauteurs de −1 à 36 m, temps de 0 à 16 min.
  var Y_MIN = -1, Y_MAX = 36;
  var LARGEUR = 620, HAUTEUR = 320;
  var MARGE_H = 16, MARGE_B = 30;
  // Panneau roue : x en mètres de −17 à 17 (même échelle que y).
  var ROUE_X0 = 8;
  var T_MAX = 16;

  function h(t) { return A * Math.sin(OMEGA * t + PHI) + B; }

  function fr(n, d) {
    var f = Math.pow(10, d);
    var s = (Math.round(n * f) / f).toFixed(d).replace(".", ",");
    return s.replace("-", "−");
  }

  function minSec(t) {
    var total = Math.round(t * 60);
    var m = Math.floor(total / 60), s = total % 60;
    if (s === 0) return m + " min";
    if (m === 0) return s + " s";
    return m + " min " + (s < 10 ? "0" : "") + s + " s";
  }

  function el(tag, attrs, texte) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (texte !== undefined) e.textContent = texte;
    return e;
  }

  var zoneH = HAUTEUR - MARGE_H - MARGE_B;
  var echelle = zoneH / (Y_MAX - Y_MIN); // px par mètre
  function py(y) { return HAUTEUR - MARGE_B - (y - Y_MIN) * echelle; }
  var roueCx = ROUE_X0 + 17 * echelle + 6;
  function pxRoue(x) { return roueCx + x * echelle; }
  // Panneau courbe, à droite de la roue (sans chevauchement).
  var G_X0 = roueCx + A * echelle + 40, G_X1 = LARGEUR - 14;
  function pxT(t) { return G_X0 + (t / T_MAX) * (G_X1 - G_X0 - 10); }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    "<style>" +
    ":host{display:block;font-family:var(--sans,system-ui,sans-serif);}" +
    "*{box-sizing:border-box;}" +
    ".formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.02rem;font-weight:600;color:var(--ink,#241f1a);margin:0 0 10px;}" +
    ".figure{background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);padding:6px;margin-bottom:12px;}" +
    "svg{width:100%;height:auto;display:block;}" +
    ".axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}" +
    ".fleche{fill:var(--ink-soft,#6b6055);}" +
    ".sol{stroke:var(--ink-faint,#9c9083);stroke-width:1.4;}" +
    ".roue{stroke:var(--ink-faint,#9c9083);stroke-width:1.6;fill:none;}" +
    ".pied{stroke:var(--ink-faint,#9c9083);stroke-width:1.4;}" +
    ".arc-sol{stroke:var(--good,#2f7a4f);stroke-width:6;fill:none;stroke-linecap:round;}" +
    ".courbe{stroke:var(--ink-soft,#6b6055);stroke-width:1.8;fill:none;}" +
    ".courbe-sol{stroke:var(--good,#2f7a4f);stroke-width:3.4;fill:none;}" +
    ".bande{fill:var(--good,#2f7a4f);opacity:0.14;}" +
    ".seg-t{stroke:var(--good,#2f7a4f);stroke-width:5;stroke-linecap:butt;}" +
    ".seuil{stroke:var(--accent,#a8471f);stroke-width:1.6;stroke-dasharray:6 4;}" +
    ".borne{fill:var(--accent,#a8471f);}" +
    ".guide{stroke:var(--ink-faint,#c9beae);stroke-width:1;stroke-dasharray:3 3;}" +
    ".depart{fill:var(--plan,#5b4ea3);}" +
    ".etiq{font-size:11px;fill:var(--ink-soft,#6b6055);}" +
    ".etiq-seuil{font-size:11.5px;font-weight:700;fill:var(--accent-ink,#7a3212);}" +
    ".grad{stroke:var(--ink-soft,#6b6055);stroke-width:1;}" +
    ".lecture{text-align:center;font-size:0.9rem;color:var(--ink,#241f1a);margin:0 0 12px;padding:8px 12px;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);line-height:1.5;}" +
    ".lecture b{color:var(--good,#2f7a4f);}" +
    ".stats{display:flex;justify-content:center;gap:6px;flex-wrap:wrap;margin-bottom:14px;}" +
    ".stat{flex:1 1 90px;min-width:0;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:8px 4px;text-align:center;background:var(--surface,#fff);}" +
    ".stat-label{display:block;font-family:var(--mono,monospace);font-size:10px;color:var(--ink-faint,#9c9083);margin-bottom:4px;}" +
    ".stat-value{display:block;font-variant-numeric:tabular-nums;font-size:0.92rem;font-weight:600;color:var(--ink,#241f1a);}" +
    ".controles{display:flex;flex-direction:column;gap:12px;}" +
    ".ligne{display:flex;align-items:center;gap:10px;justify-content:center;flex-wrap:wrap;}" +
    ".ligne label{font-weight:600;color:var(--ink,#241f1a);}" +
    "select{font:inherit;padding:6px 10px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);}" +
    ".curseur{display:flex;flex-direction:column;gap:6px;}" +
    ".curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}" +
    ".curseur-row{display:flex;align-items:center;gap:12px;}" +
    ".curseur-row input{flex:1 1 auto;min-width:0;accent-color:var(--accent,#a8471f);}" +
    ".valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:64px;text-align:right;}" +
    ".btn{padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}" +
    "</style>" +
    '<p class="formule">h(t) = 15 sin(πt/4 − π/2) + 17 (h en m, t en min)</p>' +
    '<div class="figure"><svg id="svg" viewBox="0 0 ' + LARGEUR + " " + HAUTEUR + '" role="img" aria-label="Grande roue et courbe de la hauteur, avec le seuil"></svg></div>' +
    '<p class="lecture" id="lecture"></p>' +
    '<div class="stats">' +
    '<div class="stat"><span class="stat-label">m = (y₀ − 17)/15</span><span class="stat-value" id="val-m"></span></div>' +
    '<div class="stat"><span class="stat-label">durée par tour</span><span class="stat-value" id="val-duree"></span></div>' +
    '<div class="stat"><span class="stat-label">fraction du tour</span><span class="stat-value" id="val-frac"></span></div>' +
    "</div>" +
    '<div class="controles">' +
    '<div class="ligne"><label for="sens">Condition</label><select id="sens">' +
    '<option value="dessus">h(t) ≥ y₀ (au-dessus du seuil)</option>' +
    '<option value="dessous">h(t) ≤ y₀ (au-dessous du seuil)</option>' +
    "</select></div>" +
    '<div class="curseur"><label for="seuil">y₀ — seuil (m)</label><div class="curseur-row">' +
    '<input type="range" id="seuil" min="' + BORNES_SEUIL.min + '" max="' + BORNES_SEUIL.max + '" step="' + BORNES_SEUIL.step + '" value="' + DEFAUT.seuil + '">' +
    '<span class="valeur" id="seuil-valeur"></span></div></div>' +
    '<button class="btn" id="reset" type="button">Réinitialiser (y₀ = 24,5 m)</button>' +
    "</div>";

  class SeuilGrandeRoueWidget extends HTMLElement {
    constructor() {
      super();
      var sr = this.attachShadow({ mode: "open" });
      sr.appendChild(TEMPLATE.content.cloneNode(true));
      this._seuil = DEFAUT.seuil;
      this._sens = DEFAUT.sens;
      this._svg = sr.getElementById("svg");
      this._lecture = sr.getElementById("lecture");
      this._valM = sr.getElementById("val-m");
      this._valDuree = sr.getElementById("val-duree");
      this._valFrac = sr.getElementById("val-frac");
      this._inSeuil = sr.getElementById("seuil");
      this._valSeuil = sr.getElementById("seuil-valeur");
      this._selSens = sr.getElementById("sens");
      this._btn = sr.getElementById("reset");
    }

    connectedCallback() {
      var self = this;
      this._onSeuil = function () { self._seuil = parseFloat(self._inSeuil.value); self._rendre(); };
      this._onSens = function () { self._sens = self._selSens.value; self._rendre(); };
      this._onReset = function () {
        self._seuil = DEFAUT.seuil; self._sens = DEFAUT.sens;
        self._inSeuil.value = String(DEFAUT.seuil); self._selSens.value = DEFAUT.sens;
        self._rendre();
      };
      this._inSeuil.addEventListener("input", this._onSeuil);
      this._selSens.addEventListener("change", this._onSens);
      this._btn.addEventListener("click", this._onReset);
      this._rendre();
    }

    disconnectedCallback() {
      this._inSeuil.removeEventListener("input", this._onSeuil);
      this._selSens.removeEventListener("change", this._onSens);
      this._btn.removeEventListener("click", this._onReset);
    }

    // Intervalles solutions dans [0 ; T] (un tour), à partir de m.
    _intervallesTour(m, dessus) {
      if (m >= 1) return dessus ? (m === 1 ? [[T / 2, T / 2]] : []) : [[0, T]];
      if (m <= -1) return dessus ? [[0, T]] : (m === -1 ? [[0, 0], [T, T]] : []);
      var as = Math.asin(m);
      var t1 = (as + Math.PI / 2) / OMEGA;              // u = arcsin m
      var t2 = (Math.PI - as + Math.PI / 2) / OMEGA;    // u = π − arcsin m
      return dessus ? [[t1, t2]] : [[0, t1], [t2, T]];
    }

    _rendre() {
      var y0 = this._seuil, dessus = this._sens === "dessus";
      var m = (y0 - B) / A;
      var tour = this._intervallesTour(m, dessus);
      var duree = 0;
      tour.forEach(function (iv) { duree += iv[1] - iv[0]; });

      this._valSeuil.textContent = fr(y0, 1) + " m";
      this._valM.textContent = fr(m, 3);
      this._valDuree.textContent = minSec(duree);
      this._valFrac.textContent = fr(duree / T, 3);

      var texte;
      var signe = dessus ? "≥" : "≤";
      if (m > 1 || m < -1 || (m === 1 && dessus) || (m === -1 && !dessus)) {
        var toujours = (m < -1 && dessus) || (m > 1 && !dessus);
        if (toujours) texte = "|m| > 1 : h(t) " + signe + " " + fr(y0, 1) + " est <b>toujours vraie</b> — la nacelle reste " + (dessus ? "au-dessus" : "au-dessous") + " du seuil pendant tout le tour.";
        else if (m === 1 || m === -1) texte = "Le seuil touche la roue en un seul point : la condition n'est vraie qu'<b>un instant</b> par tour.";
        else texte = "|m| > 1 : h(t) " + signe + " " + fr(y0, 1) + " n'est <b>jamais vraie</b> — la roue ne " + (dessus ? "monte pas si haut" : "descend pas si bas") + ".";
      } else {
        var parties = [];
        [0, T].forEach(function (dec) {
          tour.forEach(function (iv) {
            var a = iv[0] + dec, b = iv[1] + dec;
            if (b - a > 1e-9) parties.push("[" + fr(a, 2) + " ; " + fr(b, 2) + "]");
          });
        });
        texte = "sin(u) " + signe + " " + fr(m, 3) + " : sur deux tours, t ∈ <b>" + parties.join(" ∪ ") + "</b> (en min).";
      }
      this._lecture.innerHTML = texte;
      this._dessiner(y0, m, tour, dessus);
    }

    _dessiner(y0, m, tour, dessus) {
      var svg = this._svg;
      svg.innerHTML = "";
      var defs = el("defs", {});
      var mk = el("marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      mk.appendChild(el("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(mk);
      svg.appendChild(defs);

      // --- Roue ---
      var cy = py(B), r = A * echelle;
      svg.appendChild(el("line", { x1: ROUE_X0, x2: pxRoue(17), y1: py(0), y2: py(0), class: "sol" }));
      svg.appendChild(el("line", { x1: roueCx, y1: cy, x2: roueCx - 0.45 * r, y2: py(0), class: "pied" }));
      svg.appendChild(el("line", { x1: roueCx, y1: cy, x2: roueCx + 0.45 * r, y2: py(0), class: "pied" }));
      svg.appendChild(el("circle", { cx: roueCx, cy: cy, r: r, class: "roue" }));
      svg.appendChild(el("circle", { cx: roueCx, cy: cy, r: 3, class: "depart" }));
      svg.appendChild(el("text", { x: ROUE_X0 + 2, y: py(0) + 14, class: "etiq" }, "sol"));

      // Arc solution sur la roue : points de hauteur ≥ y₀ (ou ≤). Angle u mesuré depuis l'horizontale
      // (sin u = (y − 17)/15), parcouru en suivant la rotation (sens trigonométrique, départ en bas).
      if (m < 1 || !dessus) {
        var u0, u1;
        if (dessus) {
          if (m <= -1) { u0 = -Math.PI / 2; u1 = 1.5 * Math.PI; } else { u0 = Math.asin(m); u1 = Math.PI - Math.asin(m); }
        } else {
          if (m >= 1) { u0 = -Math.PI / 2; u1 = 1.5 * Math.PI; } else if (m > -1) { u0 = Math.PI - Math.asin(m); u1 = 2 * Math.PI + Math.asin(m); } else { u0 = u1 = 0; }
        }
        if (u1 - u0 > 1e-6) {
          var d = "", n = 80;
          for (var i = 0; i <= n; i++) {
            var u = u0 + (u1 - u0) * i / n;
            var x = roueCx + r * Math.cos(u), yy = cy - r * Math.sin(u);
            d += (i === 0 ? "M" : "L") + x.toFixed(2) + " " + yy.toFixed(2) + " ";
          }
          svg.appendChild(el("path", { d: d.trim(), class: "arc-sol" }));
        }
      }
      // Départ (t = 0) : point le plus bas.
      svg.appendChild(el("circle", { cx: roueCx, cy: cy + r, r: 4.5, class: "depart" }));
      svg.appendChild(el("text", { x: roueCx + 8, y: cy + r - 6, class: "etiq" }, "t = 0"));

      // --- Courbe ---
      var yAxe = py(0);
      svg.appendChild(el("line", { x1: G_X0, x2: G_X1, y1: yAxe, y2: yAxe, class: "axe", "marker-end": "url(#fleche)" }));
      svg.appendChild(el("line", { x1: G_X0, x2: G_X0, y1: py(Y_MIN), y2: MARGE_H - 4, class: "axe", "marker-end": "url(#fleche)" }));
      svg.appendChild(el("text", { x: G_X1 - 2, y: yAxe + 24, "text-anchor": "end", class: "etiq" }, "t (min)"));
      svg.appendChild(el("text", { x: G_X0 + 6, y: MARGE_H + 6, class: "etiq" }, "h (m)"));
      [0, 2, 4, 6, 8, 10, 12, 14, 16].forEach(function (t) {
        var x = pxT(t);
        svg.appendChild(el("line", { x1: x, x2: x, y1: yAxe - 3, y2: yAxe + 3, class: "grad" }));
        if (t > 0) svg.appendChild(el("text", { x: x, y: yAxe + 14, "text-anchor": "middle", class: "etiq" }, String(t)));
      });
      [2, 17, 32].forEach(function (y) {
        svg.appendChild(el("line", { x1: G_X0 - 3, x2: G_X0 + 3, y1: py(y), y2: py(y), class: "grad" }));
        svg.appendChild(el("text", { x: G_X0 - 5, y: py(y) + 4, "text-anchor": "end", class: "etiq" }, String(y)));
      });

      // Intervalles solutions sur deux tours : bandes + segments sur l'axe t + courbe épaissie.
      var intervalles = [];
      [0, T].forEach(function (dec) { tour.forEach(function (iv) { intervalles.push([iv[0] + dec, iv[1] + dec]); }); });
      intervalles.forEach(function (iv) {
        var a = pxT(iv[0]), b = pxT(iv[1]);
        if (b - a > 0.5) {
          svg.appendChild(el("rect", { x: a, y: MARGE_H, width: b - a, height: yAxe - MARGE_H, class: "bande" }));
          svg.appendChild(el("line", { x1: a, x2: b, y1: yAxe, y2: yAxe, class: "seg-t" }));
        }
      });

      var chemin = function (t0, t1) {
        var s = "", n = Math.max(2, Math.round((t1 - t0) * 40));
        for (var i = 0; i <= n; i++) {
          var t = t0 + (t1 - t0) * i / n;
          s += (i === 0 ? "M" : "L") + pxT(t).toFixed(2) + " " + py(h(t)).toFixed(2) + " ";
        }
        return s.trim();
      };
      svg.appendChild(el("path", { d: chemin(0, T_MAX), class: "courbe" }));
      intervalles.forEach(function (iv) {
        if (iv[1] - iv[0] > 1e-6) svg.appendChild(el("path", { d: chemin(iv[0], iv[1]), class: "courbe-sol" }));
      });

      // Bornes des intervalles (là où h = y₀), avec guides vers l'axe t.
      if (m > -1 && m < 1) {
        intervalles.forEach(function (iv) {
          [iv[0], iv[1]].forEach(function (t) {
            if (t <= 1e-9 || t >= T_MAX - 1e-9 || Math.abs(t - T) < 1e-9) return;
            var x = pxT(t);
            svg.appendChild(el("line", { x1: x, x2: x, y1: py(y0), y2: yAxe, class: "guide" }));
            svg.appendChild(el("circle", { cx: x, cy: py(y0), r: 3.8, class: "borne" }));
          });
        });
      }

      // Seuil y = y₀ : traverse la roue et la courbe (même échelle verticale).
      if (y0 >= Y_MIN && y0 <= Y_MAX) {
        svg.appendChild(el("line", { x1: ROUE_X0, x2: G_X1 - 6, y1: py(y0), y2: py(y0), class: "seuil" }));
        var etiqY = py(y0) - 5;
        if (etiqY < MARGE_H + 10) etiqY = py(y0) + 14;
        svg.appendChild(el("text", { x: G_X1 - 6, y: etiqY, "text-anchor": "end", class: "etiq-seuil" }, "y₀ = " + fr(y0, 1)));
      }
    }
  }

  if (!customElements.get("seuil-grande-roue-widget")) {
    customElements.define("seuil-grande-roue-widget", SeuilGrandeRoueWidget);
  }
})();
