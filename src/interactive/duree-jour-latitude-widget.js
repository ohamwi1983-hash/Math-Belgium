(function () {
  "use strict";

  /* ================================================================
   * <duree-jour-latitude-widget> — atelier : la durée du jour selon la
   * latitude, calculée avec la vraie formule astronomique
   *   δ(j) ≈ 23,44° · sin(2π(j − 80)/365,24)   (déclinaison du Soleil)
   *   cos H₀ = −tan(latitude) · tan(δ)          (angle horaire du coucher)
   *   durée = 2·H₀ / 15° (en heures)
   * puis comparée au modèle sinusoïdal 12 + A·sin(2π(j − 80)/365,24).
   * Au-delà du cercle polaire, cos H₀ sort de [−1 ; 1] : jour polaire
   * (24 h) ou nuit polaire (0 h) — valeur bornée, jamais de NaN.
   * Réfraction et taille du disque solaire négligées (≈ +15 min réels).
   * Fenêtre FIXE : 0 à 24 h, toute l'année. Web Component (Shadow DOM).
   * ================================================================ */

  var NS = "http://www.w3.org/2000/svg";
  var RAD = Math.PI / 180;
  var ANNEE = 365.24, DECL_MAX = 23.44, J_EQUINOXE = 80;
  var J_ETE = 172, J_HIVER = 355;
  var DEFAUT = { lat: 50.8, jour: J_ETE };
  var PRESETS = [
    { label: "Équateur", lat: 0 },
    { label: "Bruxelles", lat: 50.8 },
    { label: "Cercle polaire", lat: 66.5 },
    { label: "Tromsø", lat: 69.6 },
  ];
  var MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  var LONG_MOIS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  var INITIALES = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

  function declinaison(j) { return DECL_MAX * Math.sin(2 * Math.PI * (j - J_EQUINOXE) / ANNEE); }
  function duree(lat, j) {
    var x = -Math.tan(lat * RAD) * Math.tan(declinaison(j) * RAD);
    if (x <= -1) return 24;
    if (x >= 1) return 0;
    return (2 * Math.acos(x) / RAD) / 15;
  }

  function fr(n, d) {
    var f = Math.pow(10, d);
    return (Math.round(n * f) / f).toFixed(d).replace(".", ",").replace("-", "−");
  }
  function hMin(h) {
    var total = Math.round(h * 60);
    var hh = Math.floor(total / 60), mm = total % 60;
    return hh + " h " + (mm < 10 ? "0" : "") + mm;
  }
  function date(j) {
    var m = 0, reste = Math.round(j);
    while (m < 11 && reste > LONG_MOIS[m]) { reste -= LONG_MOIS[m]; m++; }
    return reste + " " + MOIS[m];
  }
  function el(tag, attrs, texte) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (texte !== undefined) e.textContent = texte;
    return e;
  }

  var LARGEUR = 560, HAUTEUR = 300, MG = 40, MD = 16, MH = 14, MB = 28;
  function px(j) { return MG + ((j - 1) / 364) * (LARGEUR - MG - MD - 8); }
  function py(h) { return HAUTEUR - MB - (h / 24) * (HAUTEUR - MH - MB); }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    "<style>" +
    ":host{display:block;font-family:var(--sans,system-ui,sans-serif);}" +
    "*{box-sizing:border-box;}" +
    "[hidden]{display:none !important;}" +
    ".formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1rem;font-weight:600;color:var(--ink,#241f1a);margin:0 0 10px;}" +
    ".figure{background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);padding:6px;margin-bottom:10px;}" +
    "svg{width:100%;height:auto;display:block;}" +
    ".axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}" +
    ".fleche{fill:var(--ink-soft,#6b6055);}" +
    ".grad{stroke:var(--ink-soft,#6b6055);stroke-width:1;}" +
    ".grille{stroke:var(--line,#e2d8c8);stroke-width:1;}" +
    ".vraie{stroke:var(--accent,#a8471f);stroke-width:2.6;fill:none;}" +
    ".modele{stroke:var(--plan,#5b4ea3);stroke-width:1.8;fill:none;stroke-dasharray:6 4;}" +
    ".moyenne{stroke:var(--ink-faint,#9c9083);stroke-width:1.2;stroke-dasharray:3 4;}" +
    ".point{fill:var(--accent,#a8471f);stroke:var(--surface,#fff);stroke-width:1.5;}" +
    ".guide{stroke:var(--ink-faint,#c9beae);stroke-width:1;stroke-dasharray:3 3;}" +
    ".etiq{font-size:12px;fill:var(--ink-soft,#6b6055);}" +
    ".etiq-pt{font-size:11.5px;font-weight:700;fill:var(--accent-ink,#7a3212);}" +
    ".legende{display:flex;flex-wrap:wrap;gap:4px 16px;justify-content:center;margin:0 0 10px;font-size:0.86rem;font-weight:600;}" +
    ".leg-vraie{color:var(--accent-ink,#7a3212);}" +
    ".leg-modele{color:var(--plan,#5b4ea3);}" +
    ".lecture{text-align:center;font-size:0.9rem;color:var(--ink,#241f1a);margin:0 0 12px;padding:8px 12px;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);line-height:1.5;}" +
    ".stats{display:flex;justify-content:center;gap:6px;flex-wrap:wrap;margin-bottom:14px;}" +
    ".stat{flex:1 1 92px;min-width:0;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:8px 4px;text-align:center;background:var(--surface,#fff);}" +
    ".stat-label{display:block;font-family:var(--mono,monospace);font-size:10px;color:var(--ink-faint,#9c9083);margin-bottom:4px;}" +
    ".stat-value{display:block;font-variant-numeric:tabular-nums;font-size:0.92rem;font-weight:600;color:var(--ink,#241f1a);}" +
    ".presets{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-bottom:12px;}" +
    ".btn{padding:7px 12px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.86rem;font-family:inherit;}" +
    ".btn[aria-pressed=\"true\"]{background:var(--accent,#a8471f);color:var(--on-accent,#fff);border-color:var(--accent,#a8471f);}" +
    ".controles{display:flex;flex-direction:column;gap:12px;}" +
    ".curseur{display:flex;flex-direction:column;gap:6px;}" +
    ".curseur label{font-weight:700;color:var(--accent-ink,#7a3212);}" +
    ".curseur-row{display:flex;align-items:center;gap:12px;}" +
    ".curseur-row input{flex:1 1 auto;min-width:0;accent-color:var(--accent,#a8471f);}" +
    ".valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:72px;text-align:right;}" +
    "</style>" +
    '<p class="formule">cos H₀ = −tan(latitude) · tan(δ), durée = 2H₀/15°</p>' +
    '<div class="figure"><svg id="svg" viewBox="0 0 ' + LARGEUR + " " + HAUTEUR + '" role="img" aria-label="Durée du jour au fil de l\'année, vraie formule et modèle sinusoïdal"></svg></div>' +
    '<p class="legende"><span class="leg-vraie">— durée du jour (formule astronomique)</span><span class="leg-modele" id="leg-modele"></span></p>' +
    '<p class="lecture" id="lecture"></p>' +
    '<div class="stats">' +
    '<div class="stat"><span class="stat-label">21 juin</span><span class="stat-value" id="val-ete"></span></div>' +
    '<div class="stat"><span class="stat-label">21 déc.</span><span class="stat-value" id="val-hiver"></span></div>' +
    '<div class="stat"><span class="stat-label">b (moyenne)</span><span class="stat-value" id="val-b"></span></div>' +
    '<div class="stat"><span class="stat-label">A (amplitude)</span><span class="stat-value" id="val-a"></span></div>' +
    "</div>" +
    '<div class="presets" id="presets"></div>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="lat">Latitude (degrés nord)</label><div class="curseur-row">' +
    '<input type="range" id="lat" min="0" max="80" step="0.1" value="' + DEFAUT.lat + '"><span class="valeur" id="lat-valeur"></span></div></div>' +
    '<div class="curseur"><label for="jour">Jour de l\'année</label><div class="curseur-row">' +
    '<input type="range" id="jour" min="1" max="365" step="1" value="' + DEFAUT.jour + '"><span class="valeur" id="jour-valeur"></span></div></div>' +
    "</div>";

  class DureeJourLatitudeWidget extends HTMLElement {
    constructor() {
      super();
      var sr = this.attachShadow({ mode: "open" });
      sr.appendChild(TEMPLATE.content.cloneNode(true));
      this._lat = DEFAUT.lat;
      this._jour = DEFAUT.jour;
      this._svg = sr.getElementById("svg");
      this._legModele = sr.getElementById("leg-modele");
      this._lecture = sr.getElementById("lecture");
      this._valEte = sr.getElementById("val-ete");
      this._valHiver = sr.getElementById("val-hiver");
      this._valB = sr.getElementById("val-b");
      this._valA = sr.getElementById("val-a");
      this._inLat = sr.getElementById("lat");
      this._valLat = sr.getElementById("lat-valeur");
      this._inJour = sr.getElementById("jour");
      this._valJour = sr.getElementById("jour-valeur");
      this._presets = sr.getElementById("presets");
      var self = this;
      this._boutons = PRESETS.map(function (p) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "btn"; b.textContent = p.label + " (" + fr(p.lat, 1) + "°)";
        b.dataset.lat = String(p.lat);
        self._presets.appendChild(b);
        return b;
      });
    }

    connectedCallback() {
      var self = this;
      this._onLat = function () { self._lat = parseFloat(self._inLat.value); self._rendre(); };
      this._onJour = function () { self._jour = parseFloat(self._inJour.value); self._rendre(); };
      this._onPreset = function (e) {
        var b = e.target.closest("button");
        if (!b) return;
        self._lat = parseFloat(b.dataset.lat);
        self._inLat.value = String(self._lat);
        self._rendre();
      };
      this._inLat.addEventListener("input", this._onLat);
      this._inJour.addEventListener("input", this._onJour);
      this._presets.addEventListener("click", this._onPreset);
      this._rendre();
    }

    disconnectedCallback() {
      this._inLat.removeEventListener("input", this._onLat);
      this._inJour.removeEventListener("input", this._onJour);
      this._presets.removeEventListener("click", this._onPreset);
    }

    _rendre() {
      var lat = this._lat, j = this._jour;
      var max = 0, min = 24;
      for (var k = 1; k <= 365; k++) { var v = duree(lat, k); if (v > max) max = v; if (v < min) min = v; }
      var b = (max + min) / 2, A = (max - min) / 2;
      var polaire = max >= 24 - 1e-9 || min <= 1e-9;

      this._valLat.textContent = fr(lat, 1) + "°";
      this._valJour.textContent = date(j);
      this._valEte.textContent = hMin(duree(lat, J_ETE));
      this._valHiver.textContent = hMin(duree(lat, J_HIVER));
      this._valB.textContent = fr(b, 2) + " h";
      this._valA.textContent = fr(A, 2) + " h";
      this._boutons.forEach(function (bt) { bt.setAttribute("aria-pressed", String(Math.abs(parseFloat(bt.dataset.lat) - lat) < 0.05)); });
      this._legModele.textContent = "- - modèle 12 + " + fr(A, 2) + " sin(2π(j − 80)/365,24)";

      var dj = duree(lat, j), delta = declinaison(j);
      var texte = "Le " + date(j) + " (j = " + j + ") : δ ≈ " + fr(delta, 1) + "°, jour de " + hMin(dj) + ". ";
      if (lat < 0.05) texte += "À l'équateur, l'amplitude est nulle : 12 h toute l'année.";
      else if (polaire) texte += "Au-delà du cercle polaire (66,56°), la formule sature : jour polaire (24 h) en été, nuit polaire (0 h) en hiver — la courbe n'est plus une sinusoïde.";
      else texte += "b reste ≈ 12 h à toutes les latitudes ; c'est l'amplitude A qui grandit avec la latitude.";
      if (!polaire && lat >= 0.05) texte += " (Réfraction négligée : le jour réel dure environ un quart d'heure de plus.)";
      this._lecture.textContent = texte;
      this._dessiner(lat, j, A);
    }

    _dessiner(lat, j, A) {
      var svg = this._svg;
      svg.innerHTML = "";
      var defs = el("defs", {});
      var mk = el("marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      mk.appendChild(el("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(mk);
      svg.appendChild(defs);

      [6, 12, 18, 24].forEach(function (h) {
        svg.appendChild(el("line", { x1: MG, x2: px(365), y1: py(h), y2: py(h), class: "grille" }));
        svg.appendChild(el("text", { x: MG - 6, y: py(h) + 4, "text-anchor": "end", class: "etiq" }, h + " h"));
      });
      svg.appendChild(el("line", { x1: MG, x2: LARGEUR - MD + 2, y1: py(0), y2: py(0), class: "axe", "marker-end": "url(#fleche)" }));
      svg.appendChild(el("line", { x1: MG, x2: MG, y1: py(0) + 4, y2: MH - 8, class: "axe", "marker-end": "url(#fleche)" }));
      var debut = 1;
      for (var m = 0; m < 12; m++) {
        var x = px(debut);
        svg.appendChild(el("line", { x1: x, x2: x, y1: py(0) - 3, y2: py(0) + 3, class: "grad" }));
        svg.appendChild(el("text", { x: px(debut + LONG_MOIS[m] / 2), y: py(0) + 15, "text-anchor": "middle", class: "etiq" }, INITIALES[m]));
        debut += LONG_MOIS[m];
      }
      svg.appendChild(el("line", { x1: MG, x2: px(365), y1: py(12), y2: py(12), class: "moyenne" }));

      var dVraie = "", dModele = "";
      for (var k = 1; k <= 365; k++) {
        dVraie += (k === 1 ? "M" : "L") + px(k).toFixed(2) + " " + py(duree(lat, k)).toFixed(2) + " ";
        var mod = Math.max(-0.4, Math.min(24.4, 12 + A * Math.sin(2 * Math.PI * (k - J_EQUINOXE) / ANNEE)));
        dModele += (k === 1 ? "M" : "L") + px(k).toFixed(2) + " " + py(mod).toFixed(2) + " ";
      }
      svg.appendChild(el("path", { d: dModele.trim(), class: "modele" }));
      svg.appendChild(el("path", { d: dVraie.trim(), class: "vraie" }));

      var dj = duree(lat, j);
      var xj = px(j), yj = py(dj);
      svg.appendChild(el("line", { x1: xj, x2: xj, y1: yj, y2: py(0), class: "guide" }));
      svg.appendChild(el("circle", { cx: xj, cy: yj, r: 5, class: "point" }));
      var anchor = xj > LARGEUR - 110 ? "end" : xj < MG + 60 ? "start" : "middle";
      var ty = yj - 10 < MH + 10 ? yj + 20 : yj - 10;
      svg.appendChild(el("text", { x: xj, y: ty, "text-anchor": anchor, class: "etiq-pt" }, hMin(dj)));
    }
  }

  if (!customElements.get("duree-jour-latitude-widget")) {
    customElements.define("duree-jour-latitude-widget", DureeJourLatitudeWidget);
  }
})();
