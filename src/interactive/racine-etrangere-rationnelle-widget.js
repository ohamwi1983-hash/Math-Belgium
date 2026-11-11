(function () {
  "use strict";

  /* ================================================================
   * <racine-etrangere-rationnelle-widget> — atelier interactif : pourquoi
   * une équation avec l'inconnue au dénominateur peut produire une racine
   * étrangère. En haut, les deux membres tracés (asymptotes aux valeurs
   * interdites) et leurs VRAIS points d'intersection. En bas, l'équation
   * polynomiale obtenue — par produit en croix, ou par réduction au
   * dénominateur commun — et ses racines : celles qui annulent un
   * dénominateur sont marquées « étrangères ». Préréglage : l'exemple du cours
   * 5/(x − 2) = (3x − 3)/(x² − x − 2). Fenêtres fixes. Web Component.
   * ================================================================ */

  var PRESETS = [
    {
      id: "cours",
      bouton: "Exemple du cours",
      equation: "5 / (x − 2) = (3x − 3) / (x² − x − 2)",
      gauche: function (x) { return 5 / (x - 2); },
      droite: function (x) { return (3 * x - 3) / (x * x - x - 2); },
      nomGauche: "5/(x − 2)",
      nomDroite: "(3x − 3)/(x² − x − 2)",
      interdites: [-1, 2],
      ce: "x² − x − 2 = (x − 2)(x + 1) : x ≠ 2 et x ≠ −1",
      croix: {
        lignes: ["5(x² − x − 2) = (3x − 3)(x − 2)", "5x² − 5x − 10 = 3x² − 9x + 6", "2x² + 4x − 16 = 0, soit (x − 2)(x + 4) = 0"],
        poly: function (x) { return x * x + 2 * x - 8; },
        nomPoly: "x² + 2x − 8",
        racines: [-4, 2],
        yMin: -12, yMax: 20,
      },
      commun: {
        lignes: ["Dénominateur commun : (x − 2)(x + 1)", "5(x + 1) = 3x − 3", "2x + 8 = 0"],
        poly: function (x) { return 2 * x + 8; },
        nomPoly: "2x + 8",
        racines: [-4],
        yMin: -12, yMax: 20,
      },
      solutions: [-4],
    },
    {
      id: "vide",
      bouton: "Toutes étrangères",
      equation: "(x + 1) / (x − 2) = 3 / (x − 2)",
      gauche: function (x) { return (x + 1) / (x - 2); },
      droite: function (x) { return 3 / (x - 2); },
      nomGauche: "(x + 1)/(x − 2)",
      nomDroite: "3/(x − 2)",
      interdites: [2],
      ce: "x ≠ 2",
      croix: {
        lignes: ["(x + 1)(x − 2) = 3(x − 2)", "x² − x − 2 = 3x − 6", "x² − 4x + 4 = 0, soit (x − 2)² = 0"],
        poly: function (x) { return (x - 2) * (x - 2); },
        nomPoly: "x² − 4x + 4",
        racines: [2],
        yMin: -6, yMax: 14,
      },
      commun: {
        lignes: ["Dénominateur commun : x − 2", "x + 1 = 3", "x − 2 = 0"],
        poly: function (x) { return x - 2; },
        nomPoly: "x − 2",
        racines: [2],
        yMin: -6, yMax: 14,
      },
      solutions: [],
    },
    {
      id: "deux",
      bouton: "Deux vraies solutions",
      equation: "x = 6 / (x − 1)",
      gauche: function (x) { return x; },
      droite: function (x) { return 6 / (x - 1); },
      nomGauche: "x",
      nomDroite: "6/(x − 1)",
      interdites: [1],
      ce: "x ≠ 1",
      croix: {
        lignes: ["x(x − 1) = 6", "x² − x − 6 = 0, soit (x − 3)(x + 2) = 0"],
        poly: function (x) { return x * x - x - 6; },
        nomPoly: "x² − x − 6",
        racines: [-2, 3],
        yMin: -10, yMax: 20,
      },
      commun: {
        lignes: ["Dénominateur commun : x − 1", "x(x − 1) = 6", "x² − x − 6 = 0, soit (x − 3)(x + 2) = 0"],
        poly: function (x) { return x * x - x - 6; },
        nomPoly: "x² − x − 6",
        racines: [-2, 3],
        yMin: -10, yMax: 20,
      },
      solutions: [-2, 3],
    },
    {
      id: "une",
      bouton: "Une sur deux",
      equation: "x² / (x − 3) = 9 / (x − 3)",
      gauche: function (x) { return (x * x) / (x - 3); },
      droite: function (x) { return 9 / (x - 3); },
      nomGauche: "x²/(x − 3)",
      nomDroite: "9/(x − 3)",
      interdites: [3],
      ce: "x ≠ 3",
      croix: {
        lignes: ["x²(x − 3) = 9(x − 3)", "(x − 3)(x² − 9) = 0, soit (x − 3)²(x + 3) = 0"],
        poly: function (x) { return (x - 3) * (x - 3) * (x + 3) / 4; },
        nomPoly: "(x − 3)²(x + 3), divisé par 4 pour la fenêtre",
        racines: [-3, 3],
        yMin: -20, yMax: 30,
      },
      commun: {
        lignes: ["Dénominateur commun : x − 3", "x² = 9", "x² − 9 = 0, soit (x − 3)(x + 3) = 0"],
        poly: function (x) { return x * x - 9; },
        nomPoly: "x² − 9",
        racines: [-3, 3],
        yMin: -20, yMax: 30,
      },
      solutions: [-3],
    },
  ];

  var X_MIN = -7, X_MAX = 7;
  var HAUT = { yMin: -10, yMax: 10, h: 280 };
  var BAS_H = 200;
  var LARGEUR = 420, MARGE = 28;

  function fr(n) {
    var arrondi = Math.round(n * 100) / 100;
    if (Object.is(arrondi, -0)) arrondi = 0;
    return String(arrondi).replace(".", ",").replace("-", "−");
  }

  function ensemble(liste) {
    if (!liste.length) return "S = ∅";
    return "S = {" + liste.slice().sort(function (a, b) { return a - b; }).map(fr).join(" ; ") + "}";
  }

  function svgEl(ns, tag, attrs) {
    var el = document.createElementNS(ns, tag);
    for (var key in attrs) el.setAttribute(key, attrs[key]);
    return el;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.presets,.modes{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:0 0 12px;}' +
    '.preset,.mode{min-height:44px;padding:6px 12px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);font:inherit;font-size:0.88rem;cursor:pointer;}' +
    '.preset[aria-pressed="true"],.mode[aria-pressed="true"]{border-color:var(--accent,#a8471f);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;}' +
    '.preset:focus-visible,.mode:focus-visible{outline:2px solid var(--accent,#a8471f);outline-offset:2px;}' +
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.12rem;font-weight:600;color:var(--ink,#241f1a);margin:0 0 4px;overflow-wrap:anywhere;}' +
    '.ce{text-align:center;font-size:0.9rem;color:var(--ink-soft,#6b6055);margin:0 0 12px;overflow-wrap:anywhere;}' +
    '.titre-graphe{font-family:var(--mono,monospace);font-size:11px;letter-spacing:0.02em;color:var(--ink-faint,#9c9083);text-align:center;margin:0 0 6px;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.grad{stroke:var(--ink-faint,#9c9083);stroke-width:1;}' +
    '.grad-txt{font-size:10px;fill:var(--ink-faint,#9c9083);font-family:var(--sans,sans-serif);text-anchor:middle;}' +
    '.gauche{stroke:var(--accent,#a8471f);stroke-width:2.4;fill:none;}' +
    '.droite{stroke:var(--plan,#5b4a8a);stroke-width:2.4;fill:none;}' +
    '.poly{stroke:var(--ink,#241f1a);stroke-width:2.2;fill:none;}' +
    '.asymptote{stroke:var(--bad,#a8322f);stroke-width:1.3;stroke-dasharray:5 4;}' +
    '.inter{fill:var(--good,#2f7a4f);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.etrangere{fill:var(--surface-2,#faf6f0);stroke:var(--bad,#a8322f);stroke-width:2.4;}' +
    '.vraie{fill:var(--good,#2f7a4f);}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.etiq-bad{font-size:11.5px;font-weight:600;fill:var(--bad,#a8322f);font-family:var(--sans,sans-serif);}' +
    '.etiq-good{font-size:11.5px;font-weight:600;fill:var(--good,#2f7a4f);font-family:var(--sans,sans-serif);}' +
    '.legende{display:flex;flex-wrap:wrap;gap:4px 14px;justify-content:center;margin:-4px 0 12px;font-size:0.85rem;color:var(--ink-soft,#6b6055);}' +
    '.legende span::before{content:"";display:inline-block;width:16px;height:3px;margin-right:6px;vertical-align:middle;background:currentColor;}' +
    '.legende .lg{color:var(--accent,#a8471f);}' +
    '.legende .ld{color:var(--plan,#5b4a8a);}' +
    '.calcul{margin:0 0 12px;padding:10px 12px;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);background:var(--surface,#fff);}' +
    '.calcul p{margin:0 0 4px;font-size:0.93rem;line-height:1.45;color:var(--ink,#241f1a);overflow-wrap:anywhere;font-variant-numeric:tabular-nums;}' +
    '.calcul ul{list-style:none;margin:6px 0 0;padding:0;display:flex;flex-direction:column;gap:4px;}' +
    '.calcul li{font-size:0.93rem;line-height:1.4;overflow-wrap:anywhere;}' +
    '.calcul li.ok{color:var(--good,#2f7a4f);font-weight:600;}' +
    '.calcul li.ko{color:var(--bad,#a8322f);font-weight:600;}' +
    '.conclusion{text-align:center;font-weight:700;font-size:1.02rem;color:var(--ink,#241f1a);margin:0 0 8px;}' +
    '.message{text-align:center;font-size:0.9rem;line-height:1.45;color:var(--ink-soft,#6b6055);margin:0;}' +
    '</style>' +
    '<div class="presets" id="presets"></div>' +
    '<p class="formule" id="formule"></p>' +
    '<p class="ce" id="ce"></p>' +
    '<p class="titre-graphe">LES DEUX MEMBRES — leurs points communs sont les vraies solutions</p>' +
    '<div class="graphe-zone"><svg id="svg-haut" viewBox="0 0 ' + LARGEUR + ' ' + HAUT.h + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Courbes des deux membres"></svg></div>' +
    '<div class="legende"><span class="lg" id="lg"></span><span class="ld" id="ld"></span></div>' +
    '<div class="modes" id="modes">' +
    '<button class="mode" type="button" data-mode="croix">Produit en croix</button>' +
    '<button class="mode" type="button" data-mode="commun">Méthode du dénominateur commun</button>' +
    '</div>' +
    '<div class="calcul" id="calcul"></div>' +
    '<p class="titre-graphe" id="titre-bas"></p>' +
    '<div class="graphe-zone"><svg id="svg-bas" viewBox="0 0 ' + LARGEUR + ' ' + BAS_H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Équation polynomiale obtenue"></svg></div>' +
    '<p class="conclusion" id="conclusion"></p>' +
    '<p class="message" id="message"></p>';

  class RacineEtrangereRationnelleWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._preset = 0;
      this._mode = "croix";
      this._svgHaut = shadow.getElementById("svg-haut");
      this._svgBas = shadow.getElementById("svg-bas");
      this._formule = shadow.getElementById("formule");
      this._ce = shadow.getElementById("ce");
      this._calcul = shadow.getElementById("calcul");
      this._titreBas = shadow.getElementById("titre-bas");
      this._conclusion = shadow.getElementById("conclusion");
      this._message = shadow.getElementById("message");
      this._lg = shadow.getElementById("lg");
      this._ld = shadow.getElementById("ld");
      this._presets = shadow.getElementById("presets");
      this._modes = shadow.getElementById("modes");
      var self = this;
      PRESETS.forEach(function (p, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "preset";
        b.textContent = p.bouton;
        b.addEventListener("click", function () { self._preset = i; self._rendre(); });
        self._presets.appendChild(b);
      });
    }

    connectedCallback() {
      var self = this;
      this._onMode = function (e) {
        var cible = e.target.closest ? e.target.closest(".mode") : null;
        if (!cible) return;
        self._mode = cible.getAttribute("data-mode");
        self._rendre();
      };
      this._modes.addEventListener("click", this._onMode);
      this._rendre();
    }

    disconnectedCallback() {
      this._modes.removeEventListener("click", this._onMode);
    }

    _px(x, y, yMin, yMax, h) {
      return [MARGE + (x - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - 2 * MARGE),
        h - MARGE + 4 - (y - yMin) / (yMax - yMin) * (h - 2 * MARGE + 8)];
    }

    _repere(svg, ns, yMin, yMax, h, idFleche, pasY) {
      var self = this;
      var defs = svgEl(ns, "defs", {});
      var marker = svgEl(ns, "marker", { id: idFleche, markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      marker.appendChild(svgEl(ns, "path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(marker);
      svg.appendChild(defs);
      var o = self._px(0, 0, yMin, yMax, h);
      for (var gx = X_MIN + 1; gx < X_MAX; gx++) {
        if (gx === 0) continue;
        var p = self._px(gx, 0, yMin, yMax, h);
        svg.appendChild(svgEl(ns, "line", { x1: p[0], x2: p[0], y1: o[1] - 3, y2: o[1] + 3, class: "grad" }));
        if (gx % 2 === 0) {
          var t = svgEl(ns, "text", { x: p[0], y: o[1] + 13, class: "grad-txt" });
          t.textContent = fr(gx);
          svg.appendChild(t);
        }
      }
      for (var gy = Math.ceil(yMin / pasY) * pasY; gy < yMax; gy += pasY) {
        if (gy === 0) continue;
        var q = self._px(0, gy, yMin, yMax, h);
        svg.appendChild(svgEl(ns, "line", { x1: o[0] - 3, x2: o[0] + 3, y1: q[1], y2: q[1], class: "grad" }));
        var ty = svgEl(ns, "text", { x: o[0] - 12, y: q[1] + 3, class: "grad-txt" });
        ty.textContent = fr(gy);
        svg.appendChild(ty);
      }
      svg.appendChild(svgEl(ns, "line", { x1: MARGE, x2: LARGEUR - MARGE, y1: o[1], y2: o[1], class: "axe", "marker-end": "url(#" + idFleche + ")" }));
      svg.appendChild(svgEl(ns, "line", { x1: o[0], x2: o[0], y1: h - MARGE + 6, y2: MARGE - 8, class: "axe", "marker-end": "url(#" + idFleche + ")" }));
      var ex = svgEl(ns, "text", { x: LARGEUR - MARGE + 4, y: o[1] - 6, class: "etiquette" });
      ex.textContent = "x";
      svg.appendChild(ex);
      return o;
    }

    // Trace g en coupant aux valeurs interdites et aux sorties de fenêtre (pas de trait vertical parasite).
    _courbe(svg, ns, g, coupures, yMin, yMax, h, classe) {
      var bornes = [X_MIN].concat(coupures.filter(function (c) { return c > X_MIN && c < X_MAX; }).sort(function (a, b) { return a - b; })).concat([X_MAX]);
      for (var k = 0; k < bornes.length - 1; k++) {
        var lo = bornes[k] + (k > 0 ? 1e-3 : 0), hi = bornes[k + 1] - (k < bornes.length - 2 ? 1e-3 : 0);
        var n = Math.max(8, Math.round(300 * (hi - lo) / (X_MAX - X_MIN)));
        var d = "", dernier = false;
        for (var i = 0; i <= n; i++) {
          var x = lo + (i / n) * (hi - lo);
          var y = g(x);
          var ok = isFinite(y) && y >= yMin - 3 && y <= yMax + 3;
          if (ok) {
            var p = this._px(x, Math.max(yMin - 3, Math.min(yMax + 3, y)), yMin, yMax, h);
            d += (dernier ? "L" : "M") + p[0].toFixed(2) + " " + p[1].toFixed(2) + " ";
          }
          dernier = ok;
        }
        if (d) svg.appendChild(svgEl(ns, "path", { d: d.trim(), class: classe }));
      }
    }

    _rendre() {
      var P = PRESETS[this._preset];
      var M = this._mode === "croix" ? P.croix : P.commun;
      var self = this;
      var bts = this._presets.querySelectorAll(".preset");
      for (var i = 0; i < bts.length; i++) bts[i].setAttribute("aria-pressed", i === this._preset ? "true" : "false");
      var bm = this._modes.querySelectorAll(".mode");
      for (var j = 0; j < bm.length; j++) bm[j].setAttribute("aria-pressed", bm[j].getAttribute("data-mode") === this._mode ? "true" : "false");

      this._formule.textContent = P.equation;
      this._ce.textContent = "CE : " + P.ce;
      this._lg.textContent = "membre de gauche : " + P.nomGauche;
      this._ld.textContent = "membre de droite : " + P.nomDroite;

      // ---- graphe du haut : les deux membres ----
      var ns = "http://www.w3.org/2000/svg";
      var svg = this._svgHaut;
      svg.innerHTML = "";
      var o = this._repere(svg, ns, HAUT.yMin, HAUT.yMax, HAUT.h, "fl-ret-haut", 2);
      P.interdites.forEach(function (v) {
        var pv = self._px(v, 0, HAUT.yMin, HAUT.yMax, HAUT.h);
        svg.appendChild(svgEl(ns, "line", { x1: pv[0], x2: pv[0], y1: MARGE - 8, y2: HAUT.h - MARGE + 6, class: "asymptote" }));
        var t = svgEl(ns, "text", { x: pv[0] + 4, y: MARGE + 4, class: "etiq-bad" });
        t.textContent = "x ≠ " + fr(v);
        svg.appendChild(t);
      });
      this._courbe(svg, ns, P.gauche, P.interdites, HAUT.yMin, HAUT.yMax, HAUT.h, "gauche");
      this._courbe(svg, ns, P.droite, P.interdites, HAUT.yMin, HAUT.yMax, HAUT.h, "droite");
      P.solutions.forEach(function (s) {
        var y = P.gauche(s);
        if (y < HAUT.yMin || y > HAUT.yMax) return;
        var ps = self._px(s, y, HAUT.yMin, HAUT.yMax, HAUT.h);
        svg.appendChild(svgEl(ns, "circle", { cx: ps[0].toFixed(2), cy: ps[1].toFixed(2), r: 5, class: "inter" }));
        var t = svgEl(ns, "text", { x: ps[0] + 8, y: ps[1] - 8, class: "etiq-good" });
        t.textContent = "x = " + fr(s);
        svg.appendChild(t);
      });
      if (!P.solutions.length) {
        var t0 = svgEl(ns, "text", { x: MARGE + 4, y: HAUT.h - MARGE - 4, class: "etiq-bad" });
        t0.textContent = "aucun point commun";
        svg.appendChild(t0);
      }

      // ---- calcul et verdicts ----
      this._calcul.innerHTML = "";
      M.lignes.forEach(function (l) {
        var p = document.createElement("p");
        p.textContent = l;
        self._calcul.appendChild(p);
      });
      var ul = document.createElement("ul");
      var racinesTriees = M.racines.slice().sort(function (a, b) { return a - b; });
      racinesTriees.forEach(function (r) {
        var li = document.createElement("li");
        var interdite = P.interdites.indexOf(r) >= 0;
        li.className = interdite ? "ko" : "ok";
        li.textContent = interdite
          ? "x = " + fr(r) + " : racine étrangère — x = " + fr(r) + " annule un dénominateur, rejetée"
          : "x = " + fr(r) + " : respecte la CE, c’est une solution";
        ul.appendChild(li);
      });
      this._calcul.appendChild(ul);

      // ---- graphe du bas : l'équation polynomiale ----
      this._titreBas.textContent = "L’ÉQUATION OBTENUE : " + M.nomPoly + " = 0";
      var svgB = this._svgBas;
      svgB.innerHTML = "";
      var pas = (M.yMax - M.yMin) > 30 ? 10 : 4;
      this._repere(svgB, ns, M.yMin, M.yMax, BAS_H, "fl-ret-bas", pas);
      this._courbe(svgB, ns, M.poly, [], M.yMin, M.yMax, BAS_H, "poly");
      racinesTriees.forEach(function (r) {
        var interdite = P.interdites.indexOf(r) >= 0;
        var pr = self._px(r, 0, M.yMin, M.yMax, BAS_H);
        svgB.appendChild(svgEl(ns, "circle", { cx: pr[0].toFixed(2), cy: pr[1].toFixed(2), r: 5.5, class: interdite ? "etrangere" : "vraie" }));
        var t = svgEl(ns, "text", { x: pr[0], y: pr[1] - 10, "text-anchor": "middle", class: interdite ? "etiq-bad" : "etiq-good" });
        t.textContent = interdite ? fr(r) + " étrangère" : fr(r);
        svgB.appendChild(t);
      });

      this._conclusion.textContent = ensemble(P.solutions);
      var nbEtr = racinesTriees.filter(function (r) { return P.interdites.indexOf(r) >= 0; }).length;
      var msg;
      if (this._mode === "croix") {
        msg = nbEtr
          ? "Le produit en croix multiplie par des expressions qui peuvent valoir 0 : l’équation obtenue accepte des valeurs que l’équation de départ refusait."
          : "Ici, aucune racine n’annule un dénominateur : toutes les racines sont des solutions.";
        if (P.id === "cours") msg += " Essaie la méthode du dénominateur commun : l’équation reste du premier degré.";
      } else {
        msg = nbEtr
          ? "Même avec le dénominateur commun, une racine peut annuler un dénominateur : la vérification avec la CE reste indispensable."
          : P.id === "cours"
            ? "En multipliant par le dénominateur commun (x − 2)(x + 1) plutôt que par le produit des deux dénominateurs, l’équation reste du premier degré : la racine étrangère n’apparaît même pas."
            : "Aucune racine n’annule un dénominateur : toutes les racines sont des solutions.";
      }
      this._message.textContent = msg;
    }
  }

  if (!customElements.get("racine-etrangere-rationnelle-widget")) {
    customElements.define("racine-etrangere-rationnelle-widget", RacineEtrangereRationnelleWidget);
  }
})();
