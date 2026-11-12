(function () {
  "use strict";

  /* ================================================================
   * <anniversaires-widget> — atelier « Le paradoxe des anniversaires »
   * (6e, chapitre 6, section 4). Curseur n de 1 à 60 personnes. Courbe de
   * P(au moins deux nées le même jour) = 1 − P(tous différents), avec
   * P(tous différents) = 364/365 × 363/365 × … × (366 − n)/365 (n − 1 facteurs,
   * règle du produit sur un chemin), sur une fenêtre FIXE (n de 0 à 60,
   * probabilité de 0 à 1) ; ligne 0,5 et repère n = 23 (≈ 0,507). « Tirer une
   * classe » : n dates au hasard (365 jours équiprobables, sans 29 février),
   * coïncidences surlignées, compteur « coïncidence dans x classes sur y ».
   * ================================================================ */

  var N_MIN = 1, N_MAX = 60, N_DEFAUT = 23;
  var L = 460, H = 270, MG = 44, MD = 16, MH = 20, MB = 34;
  var MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août",
    "septembre", "octobre", "novembre", "décembre"];
  var JOURS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  var TEINTES = ["accent", "plan", "good", "sky", "rose", "bad"];

  function nombreFr(x, d) { return x.toFixed(d).replace(".", ",").replace("-", "−"); }

  function svgEl(tag, attrs) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  function pTousDifferents(n) {
    var p = 1;
    for (var i = 1; i < n; i++) p *= (365 - i) / 365;
    return p;
  }

  function dateDuJour(j) {
    var m = 0;
    while (j >= JOURS[m]) { j -= JOURS[m]; m++; }
    return (j + 1 === 1 ? "1er" : String(j + 1)) + " " + MOIS[m];
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    "<style>" +
    ":host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}" +
    "*{box-sizing:border-box;}" +
    "[hidden]{display:none!important;}" +
    ".figure svg{display:block;width:100%;max-width:460px;height:auto;margin:0 auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}" +
    ".grille{stroke:var(--line-soft,#ece4d6);stroke-width:1;}" +
    ".axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}" +
    ".fleche{fill:var(--ink-soft,#6b6055);}" +
    ".grad{font-size:10px;font-family:var(--mono,monospace);fill:var(--ink-soft,#6b6055);}" +
    ".titre-axe{font-size:11px;font-style:italic;font-family:var(--serif,serif);fill:var(--ink-soft,#6b6055);}" +
    ".courbe{fill:none;stroke:var(--accent,#a8471f);stroke-width:2.4;}" +
    ".pt-courbe{fill:var(--accent,#a8471f);}" +
    ".moitie{stroke:var(--ink-faint,#9c9083);stroke-width:1.2;stroke-dasharray:5 4;}" +
    ".repere23{stroke:var(--plan,#5b4ea3);stroke-width:1.2;stroke-dasharray:3 3;}" +
    ".txt23{font-size:10.5px;font-weight:600;fill:var(--plan-ink,#463c86);font-family:var(--sans,sans-serif);}" +
    ".guide{stroke:var(--good,#2f7a4f);stroke-width:1.2;stroke-dasharray:4 3;}" +
    ".pt-courant{fill:var(--good,#2f7a4f);stroke:var(--surface,#fff);stroke-width:1.5;}" +
    ".txt-courant{font-size:11px;font-weight:700;fill:var(--good,#2f7a4f);font-family:var(--sans,sans-serif);}" +
    ".formule{text-align:center;font-family:var(--serif,serif);font-size:0.92rem;margin:10px 0 8px;line-height:1.5;}" +
    ".stats{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:0 0 10px;}" +
    ".stat{flex:1 1 150px;max-width:230px;background:var(--surface-2,#faf6f0);border:1px solid var(--line-soft,#ece4d6);border-radius:var(--radius,3px);padding:6px 8px;text-align:center;}" +
    ".stat-label{font-size:0.72rem;letter-spacing:0.04em;color:var(--ink-soft,#6b6055);font-family:var(--mono,monospace);}" +
    ".stat-val{font-size:1.02rem;font-weight:700;font-variant-numeric:tabular-nums;}" +
    ".classe{margin:0 0 10px;}" +
    ".verdict{text-align:center;font-weight:600;font-size:0.9rem;padding:6px 10px;border-radius:var(--radius,3px);margin:0 0 8px;}" +
    ".verdict.oui{background:var(--good-soft,#e2f0e7);color:var(--good,#2f7a4f);}" +
    ".verdict.non{background:var(--surface-2,#faf6f0);color:var(--ink-soft,#6b6055);}" +
    ".dates{display:flex;flex-wrap:wrap;gap:5px;justify-content:center;}" +
    ".date{font-size:0.78rem;padding:2px 7px;border-radius:999px;border:1px solid var(--line-soft,#ece4d6);background:var(--surface,#fff);color:var(--ink-soft,#6b6055);font-variant-numeric:tabular-nums;}" +
    ".date.c-accent{background:var(--accent-soft,#f6e3d6);border-color:var(--accent,#a8471f);color:var(--accent-ink,#7a3212);font-weight:700;}" +
    ".date.c-plan{background:var(--plan-soft,#e8e4f6);border-color:var(--plan,#5b4ea3);color:var(--plan-ink,#463c86);font-weight:700;}" +
    ".date.c-good{background:var(--good-soft,#e2f0e7);border-color:var(--good,#2f7a4f);color:var(--good,#2f7a4f);font-weight:700;}" +
    ".date.c-sky{background:var(--sky-soft,#dfeef6);border-color:var(--sky,#2f7fa8);color:var(--sky-ink,#1d5a7a);font-weight:700;}" +
    ".date.c-rose{background:var(--surface,#fff);border-width:2px;border-color:var(--rose,#b0437a);color:var(--rose,#b0437a);font-weight:700;}" +
    ".date.c-bad{background:var(--bad-soft,#f8e2e0);border-color:var(--bad,#a8322f);color:var(--bad,#a8322f);font-weight:700;}" +
    ".compteur{text-align:center;font-size:0.86rem;color:var(--ink-soft,#6b6055);margin:6px 0 0;font-variant-numeric:tabular-nums;}" +
    ".controles{display:flex;flex-direction:column;gap:10px;}" +
    ".curseur{display:flex;align-items:center;gap:10px;font-size:0.88rem;}" +
    ".curseur label{flex:0 0 150px;font-weight:600;}" +
    ".curseur input{flex:1 1 auto;accent-color:var(--accent,#a8471f);min-width:0;}" +
    ".curseur span{min-width:30px;text-align:right;font-weight:600;font-variant-numeric:tabular-nums;}" +
    ".boutons{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;}" +
    "button{font:inherit;font-size:0.86rem;padding:6px 12px;border-radius:var(--radius,3px);border:1px solid var(--line,#ddd2c0);background:var(--surface,#fff);color:var(--ink,#241f1a);cursor:pointer;}" +
    "button:hover{border-color:var(--accent,#a8471f);}" +
    "button.principal{background:var(--accent,#a8471f);border-color:var(--accent,#a8471f);color:#fff;}" +
    "@media (max-width:480px){.curseur label{flex-basis:110px;font-size:0.8rem;}}" +
    "</style>" +
    '<div class="figure"><svg id="svg" viewBox="0 0 ' + L + " " + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Probabilité qu\'au moins deux personnes soient nées le même jour, selon le nombre de personnes"></svg></div>' +
    '<p class="formule" id="formule"></p>' +
    '<div class="stats">' +
    '<div class="stat"><div class="stat-label">P(tous différents)</div><div class="stat-val" id="p-diff"></div></div>' +
    '<div class="stat"><div class="stat-label">P(au moins deux le même jour)</div><div class="stat-val" id="p-coinc"></div></div>' +
    "</div>" +
    '<div class="classe" id="classe" hidden>' +
    '<p class="verdict" id="verdict"></p>' +
    '<div class="dates" id="dates"></div>' +
    '<p class="compteur" id="compteur"></p>' +
    "</div>" +
    '<div class="controles">' +
    '<div class="curseur"><label for="n">nombre de personnes n</label><input type="range" id="n" min="' + N_MIN + '" max="' + N_MAX + '" step="1" value="' + N_DEFAUT + '"><span id="n-v"></span></div>' +
    '<div class="boutons">' +
    '<button type="button" id="tirer" class="principal">Tirer une classe</button>' +
    '<button type="button" id="tirer100">Tirer 100 classes</button>' +
    "</div>" +
    "</div>";

  class AnniversairesWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._s = shadow;
    }

    connectedCallback() {
      if (this._pret) return;
      this._pret = true;
      var self = this, s = this._s;
      s.getElementById("n").addEventListener("input", function () {
        self._classes = 0; self._coinc = 0; self._dernier = null;
        self._rendre();
      });
      s.getElementById("tirer").addEventListener("click", function () { self._tirer(1); });
      s.getElementById("tirer100").addEventListener("click", function () { self._tirer(100); });
      this._classes = 0; this._coinc = 0; this._dernier = null;
      this._rendre();
    }

    _n() { return parseInt(this._s.getElementById("n").value, 10); }

    _tirer(combien) {
      var n = this._n();
      for (var c = 0; c < combien; c++) {
        var jours = [];
        for (var i = 0; i < n; i++) jours.push(Math.floor(Math.random() * 365));
        var vus = {}, coinc = false;
        jours.forEach(function (j) { if (vus[j]) coinc = true; vus[j] = (vus[j] || 0) + 1; });
        this._classes++;
        if (coinc) this._coinc++;
        this._dernier = jours;
      }
      this._rendre();
    }

    _rendre() {
      var s = this._s, n = this._n();
      var pd = pTousDifferents(n), pc = 1 - pd;
      s.getElementById("n-v").textContent = String(n);
      s.getElementById("p-diff").textContent = nombreFr(pd, 4);
      s.getElementById("p-coinc").textContent = nombreFr(pc, 4);
      var f = s.getElementById("formule");
      if (n === 1) f.textContent = "Une seule personne : aucune coïncidence possible, P(au moins deux le même jour) = 0.";
      else if (n === 2) f.textContent = "P(tous différents) = 364/365 : la 2e personne doit éviter 1 jour.";
      else if (n === 3) f.textContent = "P(tous différents) = 364/365 × 363/365 : chaque nouvelle personne évite un jour de plus.";
      else f.textContent = "P(tous différents) = 364/365 × 363/365 × … × " + (366 - n) + "/365 (" + (n - 1) + " facteurs), puis P(au moins deux) = 1 − P(tous différents).";

      var zone = s.getElementById("classe");
      if (this._dernier) {
        zone.hidden = false;
        var compte = {};
        this._dernier.forEach(function (j) { compte[j] = (compte[j] || 0) + 1; });
        var teinte = {}, t = 0;
        var tri = this._dernier.slice().sort(function (a, b) { return a - b; });
        tri.forEach(function (j) { if (compte[j] > 1 && !(j in teinte)) { teinte[j] = TEINTES[t % TEINTES.length]; t++; } });
        s.getElementById("dates").innerHTML = tri.map(function (j) {
          return '<span class="date' + (j in teinte ? " c-" + teinte[j] : "") + '">' + dateDuJour(j) + "</span>";
        }).join("");
        var groupes = Object.keys(teinte).map(function (j) { return dateDuJour(+j) + " (" + compte[j] + " personnes)"; });
        var v = s.getElementById("verdict");
        if (groupes.length) {
          v.className = "verdict oui";
          v.textContent = "Coïncidence ! Même anniversaire : " + groupes.join(", ") + ".";
        } else {
          v.className = "verdict non";
          v.textContent = "Pas de coïncidence dans cette classe : les " + n + " dates sont toutes différentes.";
        }
        s.getElementById("compteur").textContent = "Coïncidence dans " + this._coinc + " classe" + (this._coinc > 1 ? "s" : "") +
          " sur " + this._classes + " (fréquence " + nombreFr(this._coinc / this._classes, 2) + ", probabilité " + nombreFr(pc, 2) + ").";
      } else {
        zone.hidden = true;
      }
      this._dessiner(n, pc);
    }

    _dessiner(n, pc) {
      var svg = this._s.getElementById("svg");
      svg.innerHTML = "";
      var defs = svgEl("defs", {});
      var marker = svgEl("marker", { id: "fl", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      marker.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(marker);
      svg.appendChild(defs);
      var px = function (x) { return MG + x / N_MAX * (L - MG - MD); };
      var py = function (y) { return MH + (1 - y) * (H - MH - MB); };
      for (var gx = 10; gx <= N_MAX; gx += 10) {
        svg.appendChild(svgEl("line", { x1: px(gx), x2: px(gx), y1: py(0), y2: py(1), class: "grille" }));
        var t = svgEl("text", { x: px(gx), y: py(0) + 14, "text-anchor": "middle", class: "grad" });
        t.textContent = String(gx);
        svg.appendChild(t);
      }
      for (var gy = 0.25; gy <= 1.0001; gy += 0.25) {
        svg.appendChild(svgEl("line", { x1: px(0), x2: px(N_MAX), y1: py(gy), y2: py(gy), class: "grille" }));
        var t2 = svgEl("text", { x: px(0) - 5, y: py(gy) + 3.5, "text-anchor": "end", class: "grad" });
        t2.textContent = { 0.25: "0,25", 0.5: "0,5", 0.75: "0,75", 1: "1" }[gy];
        svg.appendChild(t2);
      }
      var t0 = svgEl("text", { x: px(0) - 5, y: py(0) + 3.5, "text-anchor": "end", class: "grad" });
      t0.textContent = "0";
      svg.appendChild(t0);
      // ligne 0,5 et repère 23
      svg.appendChild(svgEl("line", { x1: px(0), x2: px(N_MAX), y1: py(0.5), y2: py(0.5), class: "moitie" }));
      var p23 = 1 - pTousDifferents(23);
      svg.appendChild(svgEl("line", { x1: px(23), x2: px(23), y1: py(0), y2: py(p23), class: "repere23" }));
      var t23 = svgEl("text", { x: px(23) + 5, y: py(0) - 6, class: "txt23" });
      t23.textContent = "23 personnes : " + nombreFr(p23, 3);
      svg.appendChild(t23);
      // courbe (points pour n = 1..60, reliés)
      var d = "";
      for (var k = 1; k <= N_MAX; k++) d += (k === 1 ? "M" : "L") + px(k).toFixed(1) + " " + py(1 - pTousDifferents(k)).toFixed(1) + " ";
      svg.appendChild(svgEl("path", { d: d.trim(), class: "courbe" }));
      // point courant
      svg.appendChild(svgEl("line", { x1: px(n), x2: px(n), y1: py(0), y2: py(pc), class: "guide" }));
      svg.appendChild(svgEl("line", { x1: px(0), x2: px(n), y1: py(pc), y2: py(pc), class: "guide" }));
      svg.appendChild(svgEl("circle", { cx: px(n), cy: py(pc), r: 5, class: "pt-courant" }));
      var aDroite = n < 40;
      var tc = svgEl("text", { x: px(n) + (aDroite ? 8 : -8), y: py(pc) + (pc > 0.9 ? 16 : -8), "text-anchor": aDroite ? "start" : "end", class: "txt-courant" });
      tc.textContent = "n = " + n + " : " + nombreFr(pc, 4);
      svg.appendChild(tc);
      // axes
      svg.appendChild(svgEl("line", { x1: px(0), x2: px(N_MAX) + 6, y1: py(0), y2: py(0), class: "axe", "marker-end": "url(#fl)" }));
      svg.appendChild(svgEl("line", { x1: px(0), x2: px(0), y1: py(0), y2: py(1) - 12, class: "axe", "marker-end": "url(#fl)" }));
      var tx = svgEl("text", { x: px(N_MAX), y: py(0) + 28, "text-anchor": "end", class: "titre-axe" });
      tx.textContent = "nombre de personnes n";
      svg.appendChild(tx);
      var ty = svgEl("text", { x: px(0) + 6, y: MH - 6, class: "titre-axe" });
      ty.textContent = "P(au moins deux le même jour)";
      svg.appendChild(ty);
    }
  }

  if (!customElements.get("anniversaires-widget")) {
    customElements.define("anniversaires-widget", AnniversairesWidget);
  }
})();
