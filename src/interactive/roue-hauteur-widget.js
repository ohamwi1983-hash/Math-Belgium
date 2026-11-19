(function () {
  "use strict";

  /* ================================================================
   * <roue-hauteur-widget> — atelier « Roue et hauteur » (4e, chapitre 5,
   * § 5, pendant libre de gen79). Une roue de rayon r dont le centre est
   * à la hauteur h ; un point part de l'angle θ₀ (repéré sur le cercle
   * trigonométrique centré sur l'axe de la roue) et tourne d'un angle α,
   * dans le sens trigonométrique ou horaire : θ = θ₀ ± α, hauteur
   * h + r sin θ. Une droite horizontale à la hauteur H montre les 0, 1
   * ou 2 positions où le point passe à cette hauteur, et les angles
   * parcourus correspondants.
   * Fenêtre FIXE (hauteurs de −1 à 34 m, jamais recalculée depuis un
   * curseur) : l'axe des hauteurs et le sol ne bougent jamais.
   * Couleurs : point P, son rayon et sa hauteur en --accent ; départ et
   * angle parcouru en --plan ; hauteur visée H et ses positions en
   * --good — les mêmes couleurs dans le texte sous la figure.
   * Web Component (Shadow DOM).
   * ================================================================ */

  var NS = "http://www.w3.org/2000/svg";
  var DEFAUT = { r: 10, h: 12, theta0: 270, sens: "trigo", alpha: 120, H: 17 };
  var BORNES = {
    r: { min: 2, max: 12, step: 0.5 },
    h: { min: 12, max: 20, step: 0.5 },
    alpha: { min: 0, max: 360, step: 5 },
    H: { min: 0, max: 33, step: 0.5 },
  };
  var DEPARTS = [
    { v: 270, txt: "le bas (θ₀ = 270°)" },
    { v: 0, txt: "la droite (θ₀ = 0°)" },
    { v: 90, txt: "le haut (θ₀ = 90°)" },
    { v: 180, txt: "la gauche (θ₀ = 180°)" },
  ];

  // Fenêtre FIXE : pire cas h + r = 20 + 12 = 32 m, sol à 0.
  var Y_MIN = -1, Y_MAX = 34;
  var LARGEUR = 380, HAUTEUR = 360;
  var MARGE_H = 16, MARGE_B = 22;
  var AXE_X = 44;   // axe des hauteurs (fixe)
  var CX = 214;     // abscisse du centre de la roue (fixe)
  var echelle = (HAUTEUR - MARGE_H - MARGE_B) / (Y_MAX - Y_MIN); // px par mètre
  function py(y) { return HAUTEUR - MARGE_B - (y - Y_MIN) * echelle; }

  function rad(d) { return (d * Math.PI) / 180; }
  function reduire(d) { var x = d % 360; if (x < 0) x += 360; if (Math.abs(x - 360) < 1e-9) x = 0; return x; }
  function fr(n, d) {
    var f = Math.pow(10, d);
    var v = Math.round(n * f) / f;
    if (Object.is(v, -0)) v = 0;
    var s = v.toFixed(d).replace(".", ",");
    return s.replace("-", "−");
  }
  // Nombre court : entier si entier, sinon au plus d décimales (virgule, « − »).
  function nb(n, d) {
    if (Math.abs(n - Math.round(n)) < 1e-9) return fr(Math.round(n), 0);
    return fr(n, d).replace(/0+$/, "").replace(/,$/, "");
  }
  function estEntier(n) { return Math.abs(n - Math.round(n)) < 1e-9; }
  // « = 17 m » si la valeur s'écrit exactement au centième, sinon « ≈ 16,43 m ».
  function egal(n, d) {
    var f = Math.pow(10, d);
    var exact = Math.abs(n * f - Math.round(n * f)) < 1e-7;
    return (exact ? "= " : "≈ ") + nb(n, d);
  }
  function angleTxt(d) { return estEntier(d) ? nb(d, 0) + "°" : "≈ " + fr(d, 1) + "°"; }

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
    ".formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.02rem;font-weight:600;color:var(--ink,#241f1a);margin:0 0 10px;}" +
    ".figure{background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);padding:6px;margin-bottom:12px;}" +
    "svg{width:100%;max-width:460px;height:auto;display:block;margin:0 auto;}" +
    ".axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}" +
    ".axe-roue{stroke:var(--ink-faint,#9c9083);stroke-width:1;stroke-dasharray:4 3;}" +
    ".fleche{fill:var(--ink-soft,#6b6055);}" +
    ".fleche-faible{fill:var(--ink-faint,#9c9083);}" +
    ".fleche-plan{fill:var(--plan,#5b4ea3);}" +
    ".sol{stroke:var(--ink,#241f1a);stroke-width:1.6;}" +
    ".roue{stroke:var(--ink-faint,#9c9083);stroke-width:1.6;fill:none;}" +
    ".centre{fill:var(--ink,#241f1a);}" +
    ".rayon{stroke:var(--accent,#a8471f);stroke-width:2.2;}" +
    ".point{fill:var(--accent,#a8471f);}" +
    ".hauteur{stroke:var(--accent,#a8471f);stroke-width:1.6;stroke-dasharray:5 3;}" +
    ".depart{fill:var(--plan,#5b4ea3);}" +
    ".arc{stroke:var(--plan,#5b4ea3);stroke-width:2;fill:none;}" +
    ".visee{stroke:var(--good,#2f7a4f);stroke-width:1.6;stroke-dasharray:6 4;}" +
    ".passage{fill:var(--good,#2f7a4f);}" +
    ".etiq{font-size:13px;fill:var(--ink-soft,#6b6055);}" +
    ".etiq-p{font-size:14px;font-weight:700;font-style:italic;font-family:var(--serif,serif);fill:var(--accent-ink,#7a3212);}" +
    ".etiq-h{font-size:13px;font-weight:700;fill:var(--good,#2f7a4f);}" +
    ".etiq-plan{font-size:13px;font-weight:700;font-style:italic;font-family:var(--serif,serif);fill:var(--plan,#5b4ea3);}" +
    ".grad{stroke:var(--ink-soft,#6b6055);stroke-width:1;}" +
    ".lecture{font-size:0.9rem;color:var(--ink,#241f1a);margin:0 0 12px;padding:8px 12px;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);line-height:1.6;}" +
    ".lecture p{margin:0 0 4px;}" +
    ".c-accent{color:var(--accent-ink,#7a3212);font-weight:700;}" +
    ".c-plan{color:var(--plan,#5b4ea3);font-weight:700;}" +
    ".c-good{color:var(--good,#2f7a4f);font-weight:700;}" +
    ".stats{display:flex;justify-content:center;gap:6px;flex-wrap:wrap;margin-bottom:14px;}" +
    ".stat{flex:1 1 90px;min-width:0;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:8px 4px;text-align:center;background:var(--surface,#fff);}" +
    ".stat-label{display:block;font-family:var(--mono,monospace);font-size:10px;color:var(--ink-faint,#9c9083);margin-bottom:4px;}" +
    ".stat-value{display:block;font-variant-numeric:tabular-nums;font-size:0.92rem;font-weight:600;}" +
    ".controles{display:flex;flex-direction:column;gap:12px;}" +
    ".ligne{display:flex;align-items:center;gap:8px;justify-content:center;flex-wrap:wrap;}" +
    ".ligne label{font-weight:600;color:var(--ink,#241f1a);}" +
    "select{font:inherit;max-width:100%;padding:6px 10px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);}" +
    ".curseur{display:flex;flex-direction:column;gap:6px;}" +
    ".curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--ink,#241f1a);}" +
    ".curseur.accent label{color:var(--accent-ink,#7a3212);}" +
    ".curseur.plan label{color:var(--plan,#5b4ea3);}" +
    ".curseur.good label{color:var(--good,#2f7a4f);}" +
    ".curseur-row{display:flex;align-items:center;gap:12px;}" +
    ".curseur-row input{flex:1 1 auto;min-width:0;accent-color:var(--accent,#a8471f);}" +
    ".curseur.plan input{accent-color:var(--plan,#5b4ea3);}" +
    ".curseur.good input{accent-color:var(--good,#2f7a4f);}" +
    ".curseur.neutre input{accent-color:var(--ink-soft,#6b6055);}" +
    ".valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:64px;text-align:right;}" +
    ".btn{padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}" +
    "</style>" +
    '<p class="formule">hauteur = h + r sin θ, avec θ = θ₀ ± α</p>' +
    '<div class="figure"><svg id="svg" viewBox="0 0 ' + LARGEUR + " " + HAUTEUR + '" role="img" aria-label="Roue, point qui tourne et sa hauteur au-dessus du sol"></svg></div>' +
    '<div class="lecture" id="lecture"></div>' +
    '<div class="stats">' +
    '<div class="stat"><span class="stat-label">position θ</span><span class="stat-value c-accent" id="val-theta"></span></div>' +
    '<div class="stat"><span class="stat-label">hauteur du point</span><span class="stat-value c-accent" id="val-haut"></span></div>' +
    '<div class="stat"><span class="stat-label">passages à H</span><span class="stat-value c-good" id="val-pass"></span></div>' +
    "</div>" +
    '<div class="controles">' +
    '<div class="ligne"><label for="depart">Départ</label><select id="depart">' +
    DEPARTS.map(function (d) { return '<option value="' + d.v + '">' + d.txt + "</option>"; }).join("") +
    "</select></div>" +
    '<div class="ligne"><label for="sens">Sens</label><select id="sens">' +
    '<option value="trigo">trigonométrique (θ = θ₀ + α)</option>' +
    '<option value="horaire">horaire (θ = θ₀ − α)</option>' +
    "</select></div>" +
    '<div class="curseur plan"><label for="alpha">α — angle parcouru (°)</label><div class="curseur-row">' +
    '<input type="range" id="alpha" min="' + BORNES.alpha.min + '" max="' + BORNES.alpha.max + '" step="' + BORNES.alpha.step + '" value="' + DEFAUT.alpha + '">' +
    '<span class="valeur" id="alpha-valeur"></span></div></div>' +
    '<div class="curseur good"><label for="H">H — hauteur visée (m)</label><div class="curseur-row">' +
    '<input type="range" id="H" min="' + BORNES.H.min + '" max="' + BORNES.H.max + '" step="' + BORNES.H.step + '" value="' + DEFAUT.H + '">' +
    '<span class="valeur" id="H-valeur"></span></div></div>' +
    '<div class="curseur neutre"><label for="r">r — rayon (m)</label><div class="curseur-row">' +
    '<input type="range" id="r" min="' + BORNES.r.min + '" max="' + BORNES.r.max + '" step="' + BORNES.r.step + '" value="' + DEFAUT.r + '">' +
    '<span class="valeur" id="r-valeur"></span></div></div>' +
    '<div class="curseur neutre"><label for="h">h — hauteur du centre (m)</label><div class="curseur-row">' +
    '<input type="range" id="h" min="' + BORNES.h.min + '" max="' + BORNES.h.max + '" step="' + BORNES.h.step + '" value="' + DEFAUT.h + '">' +
    '<span class="valeur" id="h-valeur"></span></div></div>' +
    '<button class="btn" id="reset" type="button">Réinitialiser (exemple du cours)</button>' +
    "</div>";

  class RoueHauteurWidget extends HTMLElement {
    constructor() {
      super();
      var sr = this.attachShadow({ mode: "open" });
      sr.appendChild(TEMPLATE.content.cloneNode(true));
      this._etat = Object.assign({}, DEFAUT);
      this._svg = sr.getElementById("svg");
      this._lecture = sr.getElementById("lecture");
      this._valTheta = sr.getElementById("val-theta");
      this._valHaut = sr.getElementById("val-haut");
      this._valPass = sr.getElementById("val-pass");
      this._in = {};
      this._val = {};
      var self = this;
      ["alpha", "H", "r", "h"].forEach(function (k) { self._in[k] = sr.getElementById(k); self._val[k] = sr.getElementById(k + "-valeur"); });
      this._selDepart = sr.getElementById("depart");
      this._selSens = sr.getElementById("sens");
      this._btn = sr.getElementById("reset");
    }

    connectedCallback() {
      var self = this;
      this._onInput = function (e) {
        var k = e.target.id;
        self._etat[k] = parseFloat(e.target.value);
        self._rendre();
      };
      this._onDepart = function () { self._etat.theta0 = parseFloat(self._selDepart.value); self._rendre(); };
      this._onSens = function () { self._etat.sens = self._selSens.value; self._rendre(); };
      this._onReset = function () {
        self._etat = Object.assign({}, DEFAUT);
        ["alpha", "H", "r", "h"].forEach(function (k) { self._in[k].value = String(DEFAUT[k]); });
        self._selDepart.value = String(DEFAUT.theta0);
        self._selSens.value = DEFAUT.sens;
        self._rendre();
      };
      for (var k in this._in) this._in[k].addEventListener("input", this._onInput);
      this._selDepart.addEventListener("change", this._onDepart);
      this._selSens.addEventListener("change", this._onSens);
      this._btn.addEventListener("click", this._onReset);
      this._selDepart.value = String(this._etat.theta0);
      this._selSens.value = this._etat.sens;
      this._rendre();
    }

    disconnectedCallback() {
      for (var k in this._in) this._in[k].removeEventListener("input", this._onInput);
      this._selDepart.removeEventListener("change", this._onDepart);
      this._selSens.removeEventListener("change", this._onSens);
      this._btn.removeEventListener("click", this._onReset);
    }

    // Positions θ (dans [0° ; 360°[) où la hauteur vaut H, et angles parcourus depuis θ₀.
    _passages() {
      var e = this._etat;
      var k = (e.H - e.h) / e.r;
      var thetas = [];
      if (Math.abs(k) <= 1 + 1e-12) {
        var kk = Math.max(-1, Math.min(1, k));
        var t1 = reduire((Math.asin(kk) * 180) / Math.PI);
        var t2 = reduire(180 - (Math.asin(kk) * 180) / Math.PI);
        thetas = Math.abs(t1 - t2) < 1e-9 ? [t1] : [t1, t2];
      }
      var trigo = e.sens === "trigo";
      var res = thetas.map(function (t) {
        var parcouru = trigo ? reduire(t - e.theta0) : reduire(e.theta0 - t);
        return { theta: t, parcouru: parcouru };
      });
      res.sort(function (a, b) { return a.parcouru - b.parcouru; });
      return { k: k, liste: res };
    }

    _rendre() {
      var e = this._etat;
      var trigo = e.sens === "trigo";
      var brut = trigo ? e.theta0 + e.alpha : e.theta0 - e.alpha;
      var theta = reduire(brut);
      var haut = e.h + e.r * Math.sin(rad(theta));
      var pass = this._passages();

      this._val.alpha.textContent = nb(e.alpha, 0) + "°";
      this._val.H.textContent = nb(e.H, 1) + " m";
      this._val.r.textContent = nb(e.r, 1) + " m";
      this._val.h.textContent = nb(e.h, 1) + " m";
      this._valTheta.textContent = nb(theta, 0) + "°";
      this._valHaut.textContent = (estEntier(haut * 100) ? "" : "≈ ") + nb(haut, 2) + " m";
      this._valPass.textContent = String(pass.liste.length);

      var signe = trigo ? " + " : " − ";
      var ligne1 = '<p><span class="c-plan">θ = θ₀' + signe + "α = " + nb(e.theta0, 0) + "°" + signe + nb(e.alpha, 0) + "° = " + nb(brut, 0).replace("-", "−") + "°" +
        (Math.abs(brut - theta) > 1e-9 ? ", soit " + nb(theta, 0) + "° dans [0° ; 360°[" : "") + "</span></p>";
      var ligne2 = '<p><span class="c-accent">hauteur = h + r sin θ = ' + nb(e.h, 1) + " + " + nb(e.r, 1) + " × sin " + nb(theta, 0) + "° " + egal(haut, 2) + " m</span></p>";
      var k = pass.k;
      var ligne3;
      var debut = '<p><span class="c-good">H = ' + nb(e.H, 1) + " m : sin θ = (" + nb(e.H, 1) + " − " + nb(e.h, 1) + ") ÷ " + nb(e.r, 1) + " " + egal(k, 3);
      if (pass.liste.length === 0) {
        ligne3 = debut + "</span> — " + (k > 0 ? "plus grand que 1" : "plus petit que −1") + " : le point ne passe <b>jamais</b> à cette hauteur.</p>";
      } else if (pass.liste.length === 1) {
        var p0 = pass.liste[0];
        ligne3 = debut + "</span> — une seule position, le point le plus " + (k > 0 ? "haut" : "bas") + " (θ = " + nb(p0.theta, 0) +
          "°), atteinte après un angle parcouru de " + angleTxt(p0.parcouru) + ".</p>";
      } else {
        ligne3 = debut + "</span> — deux positions, θ " + egalAngle(pass.liste[0].theta) + " et θ " + egalAngle(pass.liste[1].theta) +
          ", atteintes après des angles parcourus de " + angleTxt(pass.liste[0].parcouru) + " et " + angleTxt(pass.liste[1].parcouru) + ".</p>";
      }
      this._lecture.innerHTML = ligne1 + ligne2 + ligne3;
      this._dessiner(theta, haut, pass);
    }

    _dessiner(theta, haut, pass) {
      var e = this._etat;
      var svg = this._svg;
      svg.innerHTML = "";
      var defs = el("defs", {});
      // markerUnits="userSpaceOnUse" (convention du site) : taille indépendante de l'épaisseur du trait.
      [["fleche", "fleche"], ["fleche-faible", "fleche-faible"], ["fleche-plan", "fleche-plan"]].forEach(function (m) {
        var mk = el("marker", { id: m[0], markerWidth: "10", markerHeight: "10", refX: "8", refY: "5", orient: "auto", markerUnits: "userSpaceOnUse" });
        mk.appendChild(el("path", { d: "M0,0 L10,5 L0,10 Z", class: m[1] }));
        defs.appendChild(mk);
      });
      svg.appendChild(defs);

      // --- Cadre fixe : sol et axe des hauteurs (graduations tous les 5 m) ---
      var y0 = py(0);
      svg.appendChild(el("line", { x1: AXE_X, x2: LARGEUR - 8, y1: y0, y2: y0, class: "sol" }));
      svg.appendChild(el("text", { x: LARGEUR - 10, y: y0 + 15, "text-anchor": "end", class: "etiq" }, "sol"));
      svg.appendChild(el("line", { x1: AXE_X, x2: AXE_X, y1: py(Y_MIN), y2: MARGE_H - 6, class: "axe", "marker-end": "url(#fleche)" }));
      svg.appendChild(el("text", { x: AXE_X + 8, y: MARGE_H + 2, class: "etiq" }, "hauteur (m)"));
      for (var g = 0; g <= 30; g += 5) {
        svg.appendChild(el("line", { x1: AXE_X - 3, x2: AXE_X + 3, y1: py(g), y2: py(g), class: "grad" }));
        svg.appendChild(el("text", { x: AXE_X - 6, y: py(g) + 4, "text-anchor": "end", class: "etiq" }, String(g)));
      }

      // --- Roue ---
      var cy = py(e.h), R = e.r * echelle;
      // Axes du cercle trigonométrique (centrés sur la roue), avec flèches.
      svg.appendChild(el("line", { x1: CX - R - 14, x2: CX + R + 16, y1: cy, y2: cy, class: "axe-roue", "marker-end": "url(#fleche-faible)" }));
      svg.appendChild(el("line", { x1: CX, x2: CX, y1: cy + R + 10, y2: cy - R - 16, class: "axe-roue", "marker-end": "url(#fleche-faible)" }));
      svg.appendChild(el("circle", { cx: CX, cy: cy, r: R, class: "roue" }));
      svg.appendChild(el("circle", { cx: CX, cy: cy, r: 2.8, class: "centre" }));
      // h : du sol au centre (pointillés le long de l'axe vertical de la roue)
      svg.appendChild(el("line", { x1: CX, x2: CX, y1: y0, y2: cy + R + 10, class: "axe-roue" }));

      // Hauteur visée H (fixe dans le cadre, ne dépend que de H).
      var yH = py(e.H);
      svg.appendChild(el("line", { x1: AXE_X, x2: LARGEUR - 8, y1: yH, y2: yH, class: "visee" }));
      var etiqHy = yH - 5 < MARGE_H + 12 ? yH + 15 : yH - 5;
      svg.appendChild(el("text", { x: AXE_X + 6, y: etiqHy, class: "etiq-h" }, "H = " + nb(e.H, 1)));
      pass.liste.forEach(function (p) {
        var a = rad(p.theta);
        svg.appendChild(el("circle", { cx: CX + R * Math.cos(a), cy: cy - R * Math.sin(a), r: 5, class: "passage" }));
      });

      // Départ θ₀ et angle parcouru α (arc fléché dans le sens choisi).
      var a0 = rad(e.theta0);
      svg.appendChild(el("circle", { cx: CX + R * Math.cos(a0), cy: cy - R * Math.sin(a0), r: 4.5, class: "depart" }));
      var trigo = e.sens === "trigo";
      if (e.alpha > 0.5) {
        var rArc = Math.max(16, 0.42 * R);
        var n = Math.max(8, Math.round(e.alpha / 3));
        var d = "";
        for (var i = 0; i <= n; i++) {
          var t = e.theta0 + (trigo ? 1 : -1) * e.alpha * (i / n);
          var x = CX + rArc * Math.cos(rad(t)), yy = cy - rArc * Math.sin(rad(t));
          d += (i === 0 ? "M" : "L") + x.toFixed(2) + " " + yy.toFixed(2) + " ";
        }
        svg.appendChild(el("path", { d: d.trim(), class: "arc", "marker-end": "url(#fleche-plan)" }));
        var mil = e.theta0 + (trigo ? 1 : -1) * e.alpha / 2;
        var rl = rArc + 12;
        svg.appendChild(el("text", { x: CX + rl * Math.cos(rad(mil)), y: cy - rl * Math.sin(rad(mil)) + 4, "text-anchor": "middle", class: "etiq-plan" }, "α"));
      }

      // Point P, son rayon, sa hauteur (pointillés jusqu'au sol).
      var a = rad(theta);
      var px = CX + R * Math.cos(a), pyP = cy - R * Math.sin(a);
      svg.appendChild(el("line", { x1: CX, y1: cy, x2: px, y2: pyP, class: "rayon" }));
      svg.appendChild(el("line", { x1: px, y1: pyP, x2: px, y2: y0, class: "hauteur" }));
      svg.appendChild(el("circle", { cx: px, cy: pyP, r: 5.5, class: "point" }));
      // Étiquette P : du côté extérieur de la roue, jamais hors du cadre.
      var droite = Math.cos(a) >= 0;
      var lx = px + (droite ? 9 : -9);
      var ly = pyP + (Math.sin(a) >= 0 ? -8 : 16);
      ly = Math.max(MARGE_H + 10, Math.min(y0 - 6, ly));
      svg.appendChild(el("text", { x: lx, y: ly, "text-anchor": droite ? "start" : "end", class: "etiq-p" }, "P"));
    }
  }

  function egalAngle(d) { return estEntier(d) ? "= " + nb(d, 0) + "°" : "≈ " + fr(d, 1) + "°"; }

  if (!customElements.get("roue-hauteur-widget")) {
    customElements.define("roue-hauteur-widget", RoueHauteurWidget);
  }
})();
