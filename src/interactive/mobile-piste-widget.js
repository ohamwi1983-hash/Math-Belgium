(function () {
  "use strict";

  /* ================================================================
   * <mobile-piste-widget> — atelier interactif : position, vitesse,
   * accélération. Une voiture se déplace sur une piste graduée en
   * mètres ; s(t), v(t) = s'(t) et a(t) = v'(t) sont tracés l'un sous
   * l'autre, reliés par le curseur t (bouton lecture à la demande,
   * jamais d'animation automatique ; pas à pas si l'utilisateur préfère
   * réduire les animations). Bandeau : « avance / recule / à l'arrêt »
   * (signe de v) et « accélère / ralentit » (signes de v et de a).
   * Mouvements prêts :
   *  - aller-retour s(t) = −t² + 8t sur [0 ; 8] (exemple du cours :
   *    arrêt et demi-tour en t = 4, s = 16 m) ;
   *  - voiture lancée s(t) = t² + 4t sur [0 ; 7] (repère à 45 m franchi
   *    en t = 5 s à 14 m/s = 50,4 km/h) ;
   *  - freinage s(t) = v₀t − d·t²/2 jusqu'à l'arrêt en t = v₀/d,
   *    distance de freinage v₀²/(2d) (50 km/h, d = 7 → ≈ 13,8 m).
   * Fenêtres FIXES par mouvement. Web Component (Shadow DOM).
   * ================================================================ */

  var VITESSES_KMH = [30, 50, 70, 90];
  var D_BORNES = { min: 6, max: 8, step: 0.5, defaut: 7 };
  var DEFAUT_V0 = 50;

  function mouvementAllerRetour() {
    return {
      cle: "allerRetour",
      formule: "s(t) = −t² + 8t",
      tMax: 8,
      s: function (t) { return -t * t + 8 * t; },
      v: function (t) { return -2 * t + 8; },
      a: function () { return -2; },
      fen: { s: [0, 18], v: [-9, 9], a: [-3, 3] },
      piste: 18, gradPiste: 2, repere: null,
    };
  }
  function mouvementLancee() {
    return {
      cle: "lancee",
      formule: "s(t) = t² + 4t",
      tMax: 7,
      s: function (t) { return t * t + 4 * t; },
      v: function (t) { return 2 * t + 4; },
      a: function () { return 2; },
      fen: { s: [0, 80], v: [0, 20], a: [-3, 3] },
      piste: 80, gradPiste: 10, repere: 45,
    };
  }
  function mouvementFreinage(v0kmh, d) {
    var v0 = v0kmh / 3.6, tArret = v0 / d;
    return {
      cle: "freinage",
      formule: "s(t) = " + formatNombreFr(v0, 2) + "t − " + formatNombreFr(d / 2, 2) + "t² (jusqu'à l'arrêt)",
      tMax: 4.5,
      tArret: tArret,
      distance: v0 * v0 / (2 * d),
      v0: v0, v0kmh: v0kmh, d: d,
      s: function (t) { var u = Math.min(t, tArret); return v0 * u - d * u * u / 2; },
      v: function (t) { return t >= tArret ? 0 : v0 - d * t; },
      a: function (t) { return t >= tArret ? 0 : -d; },
      fen: { s: [0, 56], v: [0, 27], a: [-9, 1] },
      piste: 56, gradPiste: 10, repere: null,
    };
  }

  function formatNombreFr(n, decimales) {
    var facteur = Math.pow(10, decimales);
    var arrondi = Math.round(n * facteur) / facteur;
    if (Object.is(arrondi, -0)) arrondi = 0;
    var s = arrondi.toFixed(decimales);
    if (s.indexOf(".") >= 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
    return s.replace(".", ",").replace("-", "−");
  }

  function svgEl(ns, tag, attrs) {
    var el = document.createElementNS(ns, tag);
    for (var key in attrs) el.setAttribute(key, attrs[key]);
    return el;
  }

  var LP = 400, HP = 74;      // piste
  var LG = 400, HG = 92;      // chaque graphe
  var MG = 50;

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1rem;font-weight:600;color:var(--ink,#241f1a);margin:0 0 8px;}' +
    '.figure{display:flex;flex-direction:column;align-items:center;gap:4px;max-width:440px;margin:0 auto 8px;background:var(--surface,#fff);}' +
    'svg{width:100%;max-width:440px;height:auto;display:block;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.route{fill:var(--line,#e2d8cc);}' +
    '.trait-route{stroke:var(--ink-faint,#9c9083);stroke-width:1;}' +
    '.grad{font-size:10.5px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.repere{stroke:var(--good,#2f7a4f);stroke-width:1.6;stroke-dasharray:4 3;}' +
    '.et-repere{font-size:10.5px;font-weight:700;fill:var(--good,#2f7a4f);font-family:var(--sans,sans-serif);}' +
    '.carrosserie{fill:var(--accent,#a8471f);}' +
    '.vitre{fill:var(--surface,#fff);opacity:0.85;}' +
    '.roue{fill:var(--ink,#241f1a);}' +
    '.vecteur{stroke:var(--plan,#5b4b8a);stroke-width:2.2;}' +
    '.tete{fill:var(--plan,#5b4b8a);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.2;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.zero{stroke:var(--ink-faint,#9c9083);stroke-width:1;stroke-dasharray:3 3;}' +
    '.courbe-s{stroke:var(--accent,#a8471f);stroke-width:2.2;fill:none;}' +
    '.courbe-v{stroke:var(--good,#2f7a4f);stroke-width:2.2;fill:none;}' +
    '.courbe-a{stroke:var(--plan,#5b4b8a);stroke-width:2.2;fill:none;}' +
    '.curseur-t{stroke:var(--ink-soft,#6b6055);stroke-width:1;stroke-dasharray:2 3;}' +
    '.point{stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.nom-axe{font-size:11px;font-style:italic;font-family:var(--serif,serif);fill:var(--ink-soft,#6b6055);}' +
    '.etat{text-align:center;font-size:0.86rem;margin:0 0 6px;color:var(--ink,#241f1a);font-variant-numeric:tabular-nums;}' +
    '.bandeau{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:0 0 6px;}' +
    '.pastille{padding:6px 10px;border-radius:999px;font-size:0.84rem;font-weight:700;background:var(--surface-2,#faf6f0);}' +
    '.pastille.pos{color:var(--good,#2f7a4f);}' +
    '.pastille.neg{color:var(--bad,#b23a3a);}' +
    '.pastille.neutre{color:var(--ink-soft,#6b6055);}' +
    '.info{text-align:center;font-size:0.84rem;margin:0 0 12px;color:var(--accent-ink,#7a3212);font-weight:600;}' +
    '.controles{display:flex;flex-direction:column;gap:10px;}' +
    '.choix{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;}' +
    '.choix button,.btn{min-height:44px;padding:6px 12px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8cc);background:var(--surface,#fff);color:var(--ink,#241f1a);font-size:0.88rem;font-family:inherit;cursor:pointer;}' +
    '.choix button[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);border-color:var(--accent,#a8471f);color:var(--accent-ink,#7a3212);font-weight:700;}' +
    '.btn-lecture{min-width:110px;font-weight:600;border-color:var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);}' +
    '.curseur{display:flex;flex-direction:column;gap:4px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:10px;min-height:44px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-width:0;height:44px;margin:0;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:60px;text-align:right;font-size:0.92rem;}' +
    '.freinage[hidden]{display:none;}' +
    '.freinage{display:flex;flex-direction:column;gap:8px;}' +
    '.sous-titre{font-size:0.82rem;color:var(--ink-soft,#6b6055);text-align:center;margin:0;}' +
    '</style>' +
    '<p class="formule" id="formule"></p>' +
    '<div class="figure">' +
    '<svg id="svg-piste" viewBox="0 0 ' + LP + ' ' + HP + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Voiture sur la piste graduée en mètres"></svg>' +
    '<svg id="svg-s" viewBox="0 0 ' + LG + ' ' + HG + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Graphique de la position s(t)"></svg>' +
    '<svg id="svg-v" viewBox="0 0 ' + LG + ' ' + HG + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Graphique de la vitesse v(t)"></svg>' +
    '<svg id="svg-a" viewBox="0 0 ' + LG + ' ' + HG + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Graphique de l\'accélération a(t)"></svg>' +
    '</div>' +
    '<p class="etat" id="etat"></p>' +
    '<div class="bandeau" aria-live="polite"><span class="pastille" id="sens"></span><span class="pastille" id="allure"></span></div>' +
    '<p class="info" id="info"></p>' +
    '<div class="controles">' +
    '<div class="choix" id="choix" role="group" aria-label="Mouvement">' +
    '<button type="button" data-mvt="allerRetour">Aller-retour</button>' +
    '<button type="button" data-mvt="lancee">Voiture lancée</button>' +
    '<button type="button" data-mvt="freinage">Freinage</button>' +
    '</div>' +
    '<div class="curseur"><label for="t">t — temps (s)</label><div class="curseur-row">' +
    '<input type="range" id="t" min="0" step="0.05"><span class="curseur-valeur" id="t-valeur"></span></div></div>' +
    '<div class="choix"><button type="button" class="btn btn-lecture" id="lecture">▶ Lecture</button></div>' +
    '<div class="freinage" id="freinage" hidden>' +
    '<p class="sous-titre">Vitesse au début du freinage</p>' +
    '<div class="choix" id="choix-v0" role="group" aria-label="Vitesse initiale"></div>' +
    '<div class="curseur"><label for="d">d — décélération (m/s²)</label><div class="curseur-row">' +
    '<input type="range" id="d" min="' + D_BORNES.min + '" max="' + D_BORNES.max + '" step="' + D_BORNES.step + '" value="' + D_BORNES.defaut + '"><span class="curseur-valeur" id="d-valeur"></span></div></div>' +
    '</div>' +
    '</div>';

  class MobilePisteWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  MobilePisteWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    var g = function (id) { return shadow.getElementById(id); };
    this._svgPiste = g("svg-piste");
    this._svgS = g("svg-s"); this._svgV = g("svg-v"); this._svgA = g("svg-a");
    this._formule = g("formule"); this._etat = g("etat"); this._sens = g("sens"); this._allure = g("allure"); this._info = g("info");
    this._choix = g("choix"); this._inputT = g("t"); this._valeurT = g("t-valeur"); this._lecture = g("lecture");
    this._zoneFreinage = g("freinage"); this._choixV0 = g("choix-v0"); this._inputD = g("d"); this._valeurD = g("d-valeur");
    var self = this;
    VITESSES_KMH.forEach(function (kmh) {
      var b = document.createElement("button");
      b.type = "button"; b.dataset.kmh = String(kmh); b.textContent = kmh + " km/h";
      self._choixV0.appendChild(b);
    });
    this._v0kmh = DEFAUT_V0;
    this._d = D_BORNES.defaut;
    this._t = 0;
    this._lectureActive = false;
    this._raf = null;
    this._minuterie = null;
  };

  MobilePisteWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onChoix = function (e) {
      var b = e.target.closest("button");
      if (b && b.dataset.mvt) self._choisir(b.dataset.mvt);
    };
    this._onV0 = function (e) {
      var b = e.target.closest("button");
      if (!b || !b.dataset.kmh) return;
      self._v0kmh = parseInt(b.dataset.kmh, 10);
      self._choisir("freinage", true);
    };
    this._onD = function () { self._d = parseFloat(self._inputD.value); self._choisir("freinage", true); };
    this._onT = function () { self._arreterLecture(); self._t = parseFloat(self._inputT.value); self._rendre(); };
    this._onLecture = function () { if (self._lectureActive) self._arreterLecture(); else self._lancerLecture(); };
    this._choix.addEventListener("click", this._onChoix);
    this._choixV0.addEventListener("click", this._onV0);
    this._inputD.addEventListener("input", this._onD);
    this._inputT.addEventListener("input", this._onT);
    this._lecture.addEventListener("click", this._onLecture);
    this._choisir("allerRetour");
  };

  MobilePisteWidgetClass.prototype.disconnectedCallback = function () {
    this._arreterLecture();
    this._choix.removeEventListener("click", this._onChoix);
    this._choixV0.removeEventListener("click", this._onV0);
    this._inputD.removeEventListener("input", this._onD);
    this._inputT.removeEventListener("input", this._onT);
    this._lecture.removeEventListener("click", this._onLecture);
  };

  MobilePisteWidgetClass.prototype._choisir = function (cle, garderT) {
    this._arreterLecture();
    if (cle === "allerRetour") this._m = mouvementAllerRetour();
    else if (cle === "lancee") this._m = mouvementLancee();
    else this._m = mouvementFreinage(this._v0kmh, this._d);
    if (!garderT) this._t = 0;
    this._t = Math.min(this._t, this._m.tMax);
    this._inputT.max = String(this._m.tMax);
    this._inputT.value = String(this._t);
    var bs = this._choix.querySelectorAll("button");
    for (var i = 0; i < bs.length; i++) bs[i].setAttribute("aria-pressed", bs[i].dataset.mvt === cle ? "true" : "false");
    var bv = this._choixV0.querySelectorAll("button");
    for (var j = 0; j < bv.length; j++) bv[j].setAttribute("aria-pressed", parseInt(bv[j].dataset.kmh, 10) === this._v0kmh ? "true" : "false");
    this._zoneFreinage.hidden = cle !== "freinage";
    this._valeurD.textContent = formatNombreFr(this._d, 1);
    this._formule.textContent = this._m.formule;
    this._rendre();
  };

  MobilePisteWidgetClass.prototype._reduireAnimations = function () {
    return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  };

  MobilePisteWidgetClass.prototype._lancerLecture = function () {
    var self = this;
    if (this._t >= this._m.tMax - 1e-9) this._t = 0;
    this._lectureActive = true;
    this._lecture.textContent = "⏸ Pause";
    if (this._reduireAnimations()) {
      // Pas à pas (0,5 s de temps simulé toutes les 600 ms), sans mouvement continu.
      this._minuterie = setInterval(function () {
        self._t = Math.min(self._m.tMax, Math.round((self._t + 0.5) * 100) / 100);
        self._inputT.value = String(self._t);
        self._rendre();
        if (self._t >= self._m.tMax) self._arreterLecture();
      }, 600);
      return;
    }
    var precedent = null;
    var pas = function (ts) {
      if (!self._lectureActive) return;
      if (precedent !== null) {
        self._t = Math.min(self._m.tMax, self._t + (ts - precedent) / 1000);
        self._inputT.value = String(self._t);
        self._rendre();
      }
      precedent = ts;
      if (self._t >= self._m.tMax) { self._arreterLecture(); return; }
      self._raf = requestAnimationFrame(pas);
    };
    this._raf = requestAnimationFrame(pas);
  };

  MobilePisteWidgetClass.prototype._arreterLecture = function () {
    this._lectureActive = false;
    if (this._raf !== null) { cancelAnimationFrame(this._raf); this._raf = null; }
    if (this._minuterie !== null) { clearInterval(this._minuterie); this._minuterie = null; }
    if (this._lecture) this._lecture.textContent = "▶ Lecture";
  };

  MobilePisteWidgetClass.prototype._rendre = function () {
    var m = this._m, t = this._t;
    var s = m.s(t), v = m.v(t), a = m.a(t);
    this._valeurT.textContent = formatNombreFr(t, 2) + " s";
    this._rendrePiste(s, v);
    this._rendreGraphe(this._svgS, "s", m.s, m.fen.s, "courbe-s", "s (m)", "var(--accent,#a8471f)", t);
    this._rendreGraphe(this._svgV, "v", m.v, m.fen.v, "courbe-v", "v (m/s)", "var(--good,#2f7a4f)", t);
    this._rendreGraphe(this._svgA, "a", m.a, m.fen.a, "courbe-a", "a (m/s²)", "var(--plan,#5b4b8a)", t);

    this._etat.textContent = "t = " + formatNombreFr(t, 2) + " s : s ≈ " + formatNombreFr(s, 1) + " m ; v ≈ " +
      formatNombreFr(v, 1) + " m/s (" + formatNombreFr(v * 3.6, 1) + " km/h) ; a = " + formatNombreFr(a, 1) + " m/s²";

    var eps = 1e-6;
    if (Math.abs(v) < eps) { this._sens.className = "pastille neutre"; this._sens.textContent = "à l'arrêt (v = 0)"; }
    else if (v > 0) { this._sens.className = "pastille pos"; this._sens.textContent = "avance (v > 0)"; }
    else { this._sens.className = "pastille neg"; this._sens.textContent = "recule (v < 0)"; }

    if (Math.abs(v) < eps) {
      this._allure.className = "pastille neutre";
      this._allure.textContent = Math.abs(a) < eps ? "reste immobile" : "demi-tour : repart dans l'autre sens";
    } else if (Math.abs(a) < eps) {
      this._allure.className = "pastille neutre"; this._allure.textContent = "vitesse constante";
    } else if (v * a > 0) {
      this._allure.className = "pastille pos"; this._allure.textContent = "accélère (v et a de même signe)";
    } else {
      this._allure.className = "pastille neg"; this._allure.textContent = "ralentit (v et a de signes contraires)";
    }

    if (m.cle === "allerRetour") {
      this._info.textContent = "v(4) = 0 : le mobile s'arrête en s(4) = 16 m, position maximale, puis revient.";
    } else if (m.cle === "lancee") {
      this._info.textContent = "Repère de 45 m franchi en t = 5 s, à v(5) = 14 m/s = 50,4 km/h.";
    } else {
      this._info.textContent = "Arrêt en t = v₀/d ≈ " + formatNombreFr(m.tArret, 2) + " s ; distance de freinage v₀²/(2d) ≈ " +
        formatNombreFr(m.distance, 1) + " m (v₀ = " + m.v0kmh + " km/h ≈ " + formatNombreFr(m.v0, 2) + " m/s).";
    }
  };

  MobilePisteWidgetClass.prototype._rendrePiste = function (s, v) {
    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svgPiste, m = this._m;
    svg.innerHTML = "";
    var x0 = 42, x1 = LP - 24, yRoute = 46;
    function px(sm) { return x0 + Math.max(0, Math.min(m.piste, sm)) / m.piste * (x1 - x0); }
    svg.appendChild(svgEl(ns, "rect", { x: x0 - 6, y: yRoute, width: x1 - x0 + 12, height: 8, class: "route" }));
    for (var g = 0; g <= m.piste + 1e-9; g += m.gradPiste) {
      var gx = px(g);
      svg.appendChild(svgEl(ns, "line", { x1: gx, y1: yRoute + 8, x2: gx, y2: yRoute + 12, class: "trait-route" }));
      var tg = svgEl(ns, "text", { x: gx, y: yRoute + 23, "text-anchor": "middle", class: "grad" });
      tg.textContent = formatNombreFr(g, 0);
      svg.appendChild(tg);
    }
    var tm = svgEl(ns, "text", { x: x1 + 18, y: yRoute + 23, "text-anchor": "end", class: "grad" });
    tm.textContent = "m";
    svg.appendChild(tm);
    if (m.repere !== null) {
      var rx = px(m.repere);
      svg.appendChild(svgEl(ns, "line", { x1: rx, y1: 8, x2: rx, y2: yRoute + 8, class: "repere" }));
      var tr = svgEl(ns, "text", { x: rx + 4, y: 12, class: "et-repere" });
      tr.textContent = "repère 45 m";
      svg.appendChild(tr);
    }
    if (m.cle === "freinage") {
      var fx = px(m.distance);
      svg.appendChild(svgEl(ns, "line", { x1: fx, y1: 8, x2: fx, y2: yRoute + 8, class: "repere" }));
      var tf = svgEl(ns, "text", { x: Math.min(fx + 4, x1 - 70), y: 12, class: "et-repere" });
      tf.textContent = "arrêt ≈ " + formatNombreFr(m.distance, 1) + " m";
      svg.appendChild(tf);
    }
    // Voiture : l'avant est à la position s.
    var cx = px(s);
    var groupe = svgEl(ns, "g", {});
    groupe.appendChild(svgEl(ns, "rect", { x: cx - 30, y: yRoute - 12, width: 30, height: 10, rx: 3, class: "carrosserie" }));
    groupe.appendChild(svgEl(ns, "path", { d: "M" + (cx - 24) + " " + (yRoute - 12) + " L" + (cx - 19) + " " + (yRoute - 20) + " L" + (cx - 9) + " " + (yRoute - 20) + " L" + (cx - 5) + " " + (yRoute - 12) + " Z", class: "carrosserie" }));
    groupe.appendChild(svgEl(ns, "rect", { x: cx - 18, y: yRoute - 18, width: 8, height: 5, class: "vitre" }));
    groupe.appendChild(svgEl(ns, "circle", { cx: cx - 23, cy: yRoute - 1.5, r: 3.5, class: "roue" }));
    groupe.appendChild(svgEl(ns, "circle", { cx: cx - 7, cy: yRoute - 1.5, r: 3.5, class: "roue" }));
    svg.appendChild(groupe);
    // Vecteur vitesse (longueur proportionnelle à v, dessiné en SVG).
    if (Math.abs(v) > 1e-6) {
      var vMaxF = Math.max(Math.abs(m.fen.v[0]), Math.abs(m.fen.v[1]));
      var longueur = 10 + 40 * Math.abs(v) / vMaxF;
      var dir = v > 0 ? 1 : -1;
      var xd = v > 0 ? cx + 3 : cx - 33;
      var xf = xd + dir * longueur;
      var yv = yRoute - 28;
      svg.appendChild(svgEl(ns, "line", { x1: xd, y1: yv, x2: xf - dir * 6, y2: yv, class: "vecteur" }));
      svg.appendChild(svgEl(ns, "path", { d: "M" + xf + " " + yv + " L" + (xf - dir * 7) + " " + (yv - 4) + " L" + (xf - dir * 7) + " " + (yv + 4) + " Z", class: "tete" }));
    }
  };

  MobilePisteWidgetClass.prototype._rendreGraphe = function (svg, id, fn, fen, classe, nom, couleur, t) {
    var ns = "http://www.w3.org/2000/svg";
    var m = this._m;
    svg.innerHTML = "";
    var yMin = fen[0], yMax = fen[1];
    var xG = MG, xD = LG - 18, yH = 10, yB = HG - 16;
    function P(tt, y) {
      return [xG + tt / m.tMax * (xD - xG), yB - (y - yMin) / (yMax - yMin) * (yB - yH)];
    }
    var defs = svgEl(ns, "defs", {});
    var fl = svgEl(ns, "marker", { id: "fleche-" + id, markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
    fl.appendChild(svgEl(ns, "path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
    defs.appendChild(fl);
    svg.appendChild(defs);
    var yAxe = yMin <= 0 && yMax >= 0 ? P(0, 0)[1] : yB;
    svg.appendChild(svgEl(ns, "line", { x1: xG, y1: yAxe, x2: LG - 6, y2: yAxe, class: "axe", "marker-end": "url(#fleche-" + id + ")" }));
    svg.appendChild(svgEl(ns, "line", { x1: xG, y1: yB + 2, x2: xG, y2: 3, class: "axe", "marker-end": "url(#fleche-" + id + ")" }));
    var tn = svgEl(ns, "text", { x: 12, y: (yH + yB) / 2, "text-anchor": "middle", class: "nom-axe", transform: "rotate(-90 12 " + ((yH + yB) / 2) + ")" });
    tn.textContent = nom;
    svg.appendChild(tn);
    var tt = svgEl(ns, "text", { x: LG - 8, y: yAxe - 4, "text-anchor": "end", class: "nom-axe" });
    tt.textContent = "t (s)";
    svg.appendChild(tt);
    // Graduations de y (bornes de la fenêtre) et de t (chaque seconde).
    [yMin, yMax].forEach(function (y) {
      if (Math.abs(y) < 1e-9) return;
      var p = P(0, y);
      var tg = svgEl(ns, "text", { x: xG - 4, y: p[1] + 4, "text-anchor": "end", class: "grad" });
      tg.textContent = formatNombreFr(y, 0);
      svg.appendChild(tg);
      svg.appendChild(svgEl(ns, "line", { x1: xG, y1: p[1], x2: xD, y2: p[1], class: "zero" }));
    });
    var p0 = P(0, 0);
    if (yMin < 0 && yMax > 0) {
      var t0 = svgEl(ns, "text", { x: xG - 4, y: p0[1] + 4, "text-anchor": "end", class: "grad" });
      t0.textContent = "0";
      svg.appendChild(t0);
    }
    for (var k = 1; k <= Math.floor(m.tMax + 1e-9); k++) {
      var pk = P(k, 0);
      svg.appendChild(svgEl(ns, "line", { x1: pk[0], y1: yAxe, x2: pk[0], y2: yAxe + 3, class: "axe" }));
      if (id === "a") {
        var tk = svgEl(ns, "text", { x: pk[0], y: Math.min(HG - 3, yAxe + 13), "text-anchor": "middle", class: "grad" });
        tk.textContent = String(k);
        svg.appendChild(tk);
      }
    }
    // Courbe.
    var d = "", n = 160;
    for (var i = 0; i <= n; i++) {
      var ti = i / n * m.tMax;
      var p = P(ti, Math.max(yMin, Math.min(yMax, fn(ti))));
      d += (i === 0 ? "M" : "L") + p[0].toFixed(2) + " " + p[1].toFixed(2) + " ";
    }
    svg.appendChild(svgEl(ns, "path", { d: d.trim(), class: classe }));
    // Curseur de temps et point courant.
    var pc = P(t, Math.max(yMin, Math.min(yMax, fn(t))));
    svg.appendChild(svgEl(ns, "line", { x1: pc[0], y1: yH, x2: pc[0], y2: yB, class: "curseur-t" }));
    svg.appendChild(svgEl(ns, "circle", { cx: pc[0], cy: pc[1], r: 4.5, class: "point", style: "fill:" + couleur }));
  };

  if (!customElements.get("mobile-piste-widget")) {
    customElements.define("mobile-piste-widget", MobilePisteWidgetClass);
  }
})();
