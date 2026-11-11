(function () {
  "use strict";

  /* ================================================================
   * <optimisation-enclos-widget> — atelier interactif (4e, chapitre 1, § 3) :
   * trouver l'optimum d'une fonction du second degré sur son domaine de
   * validité. Trois situations (enclos adossé à un mur, prix et revenu,
   * trajectoire d'un ballon) : la variable se règle au curseur, la scène
   * se déforme, le point se déplace sur la courbe. La case « Restreindre
   * le domaine » impose une borne gauche : quand le sommet sort du domaine,
   * l'optimum réel bascule à la borne (la fonction y est monotone).
   * Fenêtres FIXES par situation. Web Component (Shadow DOM).
   * ================================================================ */

  var NS = "http://www.w3.org/2000/svg";
  var LARGEUR = 420, HAUTEUR = 280, MARGE_G = 46, MARGE_D = 22, MARGE_H = 24, MARGE_B = 34;
  var SCENE_L = 420, SCENE_H = 190;

  // a, b, c : f(v) = av² + bv + c. bornes : domaine de validité, ouvert ou fermé.
  var SITUATIONS = [
    {
      id: "enclos", nom: "Enclos", a: -2, b: 40, c: 0,
      v: "x", f: "A", uniteV: "m", uniteF: "m²", grandeur: "l'aire", maximal: "maximale",
      min: 0, max: 20, ouvertG: true, ouvertD: true, pas: 0.5, defaut: 8,
      yMax: 220, yPas: 50, xPas: 5, restrictionDefaut: 12,
      formule: "A(x) = x(40 − 2x) = −2x² + 40x",
      legendeAxeX: "largeur x (m)", legendeAxeY: "aire (m²)",
    },
    {
      id: "prix", nom: "Prix et revenu", a: -2, b: 80, c: 0,
      v: "p", f: "R", uniteV: "€", uniteF: "€", grandeur: "le revenu", maximal: "maximal",
      min: 0, max: 40, ouvertG: true, ouvertD: true, pas: 0.5, defaut: 10,
      yMax: 880, yPas: 200, xPas: 10, restrictionDefaut: 25,
      formule: "R(p) = p(80 − 2p) = −2p² + 80p",
      legendeAxeX: "prix p (€)", legendeAxeY: "revenu (€)",
    },
    {
      id: "trajectoire", nom: "Trajectoire", a: -5, b: 20, c: 25,
      v: "t", f: "h", uniteV: "s", uniteF: "m", grandeur: "la hauteur", maximal: "maximale",
      min: 0, max: 5, ouvertG: false, ouvertD: false, pas: 0.1, defaut: 1,
      yMax: 50, yPas: 10, xPas: 1, restrictionDefaut: 3,
      formule: "h(t) = −5t² + 20t + 25",
      legendeAxeX: "temps t (s)", legendeAxeY: "hauteur (m)",
    },
  ];

  function estEntier(v) { return Math.abs(v - Math.round(v)) < 1e-9; }
  function nb(v) {
    if (Math.abs(v) < 1e-9) v = 0;
    var s = estEntier(v) ? String(Math.round(v)) : (Math.round(v * 100) / 100).toString();
    return s.replace(".", ",").replace("-", "−");
  }
  function svgEl(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }
  function texte(svg, x, y, contenu, cls, ancre) {
    var t = svgEl("text", { x: x, y: y, class: cls || "etiquette" });
    if (ancre) t.setAttribute("text-anchor", ancre);
    t.textContent = contenu;
    svg.appendChild(t);
    return t;
  }
  function intervalle(min, max, ouvertG, ouvertD) {
    return (ouvertG ? "]" : "[") + nb(min) + " ; " + nb(max) + (ouvertD ? "[" : "]");
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}' +
    '*{box-sizing:border-box;}' +
    '.situations{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin:0 0 10px;}' +
    '.btn{min-height:44px;min-width:52px;padding:6px 12px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);font:inherit;font-weight:600;cursor:pointer;}' +
    '.btn[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);border-color:var(--accent,#a8471f);color:var(--accent-ink,#7a3212);}' +
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.1rem;font-weight:600;margin:0 0 4px;overflow-wrap:anywhere;}' +
    '.domaine{text-align:center;font-size:0.92rem;color:var(--ink-soft,#6b6055);margin:0 0 10px;}' +
    '.zone{display:flex;justify-content:center;margin:0 0 10px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.grad{stroke:var(--ink-soft,#6b6055);stroke-width:1;}' +
    '.grille{stroke:var(--line,#e2d8c8);stroke-width:0.8;stroke-dasharray:2 4;}' +
    '.courbe{stroke:var(--accent,#a8471f);stroke-width:2.6;fill:none;}' +
    '.courbe-hors{stroke:var(--ink-faint,#9c9083);stroke-width:2;fill:none;stroke-dasharray:5 5;}' +
    '.sommet-ligne{stroke:var(--plan,#6b4fa0);stroke-width:1.2;stroke-dasharray:4 4;}' +
    '.sommet-pt{fill:var(--plan,#6b4fa0);}' +
    '.optimum{fill:none;stroke:var(--good,#2f7a4f);stroke-width:3;}' +
    '.courant{fill:var(--accent,#a8471f);stroke:var(--surface,#fff);stroke-width:2;}' +
    '.borne{stroke:var(--good,#2f7a4f);stroke-width:1.6;stroke-dasharray:6 3;}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);}' +
    '.etiquette-forte{font-size:12px;font-weight:700;fill:var(--ink,#241f1a);}' +
    '.etiquette-sommet{font-size:11.5px;font-weight:600;fill:var(--plan,#6b4fa0);}' +
    '.etiquette-opt{font-size:11.5px;font-weight:700;fill:var(--good,#2f7a4f);}' +
    '.mur{stroke:var(--ink,#241f1a);stroke-width:6;}' +
    '.hachure{stroke:var(--ink-soft,#6b6055);stroke-width:1;}' +
    '.enclos{fill:var(--accent-soft,#f6e2d3);stroke:var(--accent,#a8471f);stroke-width:2.4;}' +
    '.barre-prix{fill:var(--accent,#a8471f);}' +
    '.barre-q{fill:var(--plan,#6b4fa0);}' +
    '.ballon{fill:var(--accent,#a8471f);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.sol{stroke:var(--ink-soft,#6b6055);stroke-width:2;}' +
    '.mesure{fill:var(--accent,#a8471f);opacity:0.18;}' +
    '.valeur{border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);background:var(--surface,#fff);padding:10px 12px;margin:0 0 10px;text-align:center;font-size:1rem;font-variant-numeric:tabular-nums;}' +
    '.valeur b{color:var(--accent-ink,#7a3212);}' +
    '.verdict{border-left:4px solid var(--good,#2f7a4f);background:var(--surface,#fff);padding:9px 12px;margin:0 0 12px;line-height:1.5;font-size:0.95rem;}' +
    '.verdict.borne-txt{border-left-color:var(--plan,#6b4fa0);}' +
    '.controles{display:flex;flex-direction:column;gap:10px;}' +
    '.curseur{display:flex;flex-direction:column;gap:4px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-height:44px;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;}' +
    '.case{display:flex;align-items:center;gap:10px;min-height:44px;cursor:pointer;font-size:0.95rem;}' +
    '.case input{width:22px;height:22px;accent-color:var(--accent,#a8471f);}' +
    '.curseur[hidden]{display:none;}' +
    '</style>' +
    '<div class="situations" id="situations" role="group" aria-label="Situation"></div>' +
    '<p class="formule" id="formule"></p>' +
    '<p class="domaine" id="domaine"></p>' +
    '<div class="zone"><svg id="scene" viewBox="0 0 ' + SCENE_L + ' ' + SCENE_H + '" role="img" aria-label="Situation concrète"></svg></div>' +
    '<div class="valeur" id="valeur"></div>' +
    '<div class="zone"><svg id="graphe" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" role="img" aria-label="Courbe de la grandeur étudiée"></svg></div>' +
    '<div class="verdict" id="verdict"></div>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="v" id="v-label"></label><div class="curseur-row"><input type="range" id="v"><span class="curseur-valeur" id="v-val"></span></div></div>' +
    '<label class="case"><input type="checkbox" id="restreindre"> Restreindre le domaine (borne gauche imposée)</label>' +
    '<div class="curseur" id="bloc-borne" hidden><label for="borne" id="borne-label"></label><div class="curseur-row"><input type="range" id="borne"><span class="curseur-valeur" id="borne-val"></span></div></div>' +
    '</div>';

  class OptimisationEnclosWidget extends HTMLElement {
    constructor() {
      super();
      var sh = this.attachShadow({ mode: "open" });
      sh.appendChild(TEMPLATE.content.cloneNode(true));
      var $ = function (id) { return sh.getElementById(id); };
      this._el = {
        situations: $("situations"), formule: $("formule"), domaine: $("domaine"), scene: $("scene"),
        valeur: $("valeur"), graphe: $("graphe"), verdict: $("verdict"), v: $("v"), vLabel: $("v-label"),
        vVal: $("v-val"), restreindre: $("restreindre"), blocBorne: $("bloc-borne"), borne: $("borne"),
        borneLabel: $("borne-label"), borneVal: $("borne-val"),
      };
      var self = this;
      this._boutons = SITUATIONS.map(function (s, i) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "btn"; b.textContent = s.nom;
        b.addEventListener("click", function () { self._choisir(i); });
        self._el.situations.appendChild(b);
        return b;
      });
    }

    connectedCallback() {
      var self = this, e = this._el;
      this._onV = function () { self._v = parseFloat(e.v.value); self._rendre(); };
      this._onBorne = function () {
        self._borne = parseFloat(e.borne.value);
        if (self._v < self._borne) { self._v = self._borne; e.v.value = String(self._v); }
        self._rendre();
      };
      this._onRestreindre = function () {
        self._restreint = e.restreindre.checked;
        e.blocBorne.hidden = !self._restreint;
        if (self._restreint && self._v < self._borne) { self._v = self._borne; e.v.value = String(self._v); }
        self._rendre();
      };
      e.v.addEventListener("input", this._onV);
      e.borne.addEventListener("input", this._onBorne);
      e.restreindre.addEventListener("change", this._onRestreindre);
      this._choisir(0);
    }

    disconnectedCallback() {
      this._el.v.removeEventListener("input", this._onV);
      this._el.borne.removeEventListener("input", this._onBorne);
      this._el.restreindre.removeEventListener("change", this._onRestreindre);
    }

    _choisir(i) {
      var s = SITUATIONS[i], e = this._el;
      this._s = s;
      this._v = s.defaut;
      this._borne = s.restrictionDefaut;
      this._restreint = false;
      e.restreindre.checked = false;
      e.blocBorne.hidden = true;
      e.v.min = String(s.min + (s.ouvertG ? s.pas : 0));
      e.v.max = String(s.max - (s.ouvertD ? s.pas : 0));
      e.v.step = String(s.pas);
      e.v.value = String(this._v);
      e.borne.min = String(s.min + s.pas);
      e.borne.max = String(s.max - (s.max - s.min) / 10);
      e.borne.step = String(s.pas >= 0.5 ? 1 : 0.5);
      e.borne.value = String(this._borne);
      e.vLabel.textContent = s.v + " — " + (s.id === "enclos" ? "largeur (m)" : s.id === "prix" ? "prix (€)" : "temps (s)");
      e.borneLabel.textContent = "borne gauche imposée : " + s.v + " ≥ …";
      this._boutons.forEach(function (b, k) { b.setAttribute("aria-pressed", String(k === i)); });
      this._rendre();
    }

    _f(v) { var s = this._s; return s.a * v * v + s.b * v + s.c; }

    _rendre() {
      var s = this._s, e = this._el, v = this._v;
      var gauche = this._restreint ? this._borne : s.min;
      var ouvertG = this._restreint ? false : s.ouvertG;
      var vs = -s.b / (2 * s.a), fs = this._f(vs);

      e.formule.textContent = s.formule;
      e.domaine.textContent = "domaine de validité : " + s.v + " ∈ " + intervalle(gauche, s.max, ouvertG, s.ouvertD) +
        (this._restreint ? " (restreint)" : "");
      e.vVal.textContent = nb(v) + " " + s.uniteV;
      e.borneVal.textContent = nb(this._borne) + " " + s.uniteV;
      e.valeur.innerHTML = s.v + " = " + nb(v) + " " + s.uniteV + " → " + s.f + "(" + nb(v) + ") = <b>" + nb(this._f(v)) + " " + s.uniteF + "</b>";

      // Optimum réel : sommet s'il est dans le domaine, sinon borne gauche (a < 0 : décroissante à droite du sommet).
      var sommetDedans = vs >= gauche - 1e-9 && vs <= s.max + 1e-9 && !(ouvertG && Math.abs(vs - gauche) < 1e-9);
      var vOpt, fOpt;
      if (sommetDedans) {
        vOpt = vs; fOpt = fs;
        e.verdict.className = "verdict";
        e.verdict.innerHTML = "Le sommet " + s.v + " = " + nb(vs) + " appartient au domaine : " + s.grandeur +
          " est " + s.maximal + " au sommet, <b>" + s.f + "(" + nb(vs) + ") = " + nb(fs) + " " + s.uniteF + "</b>." +
          (this._restreint ? " La restriction ne change rien : le sommet reste dans le domaine." : "");
      } else {
        vOpt = gauche; fOpt = this._f(gauche);
        e.verdict.className = "verdict borne-txt";
        e.verdict.innerHTML = "Le sommet " + s.v + " = " + nb(vs) + " est hors du domaine : la fonction y est " +
          "<b>décroissante</b> (on est déjà passé au-delà du sommet). Le maximum est à la borne " + s.v + " = " + nb(gauche) +
          " : <b>" + s.f + "(" + nb(gauche) + ") = " + nb(fOpt) + " " + s.uniteF + "</b> — moins que les " + nb(fs) + " " + s.uniteF + " du sommet.";
      }

      this._dessinerScene(v);
      this._dessinerGraphe(v, gauche, vs, fs, vOpt, fOpt, sommetDedans);
    }

    _dessinerScene(v) {
      var s = this._s, svg = this._el.scene;
      svg.innerHTML = "";
      if (s.id === "enclos") {
        // Vue de dessus : mur en haut, deux côtés de largeur x perpendiculaires, un côté de longueur 40 − 2x.
        var k = 6.5, longueur = 40 - 2 * v, haut = 30;
        var lpx = longueur * k, hpx = v * k, x0 = (SCENE_L - lpx) / 2;
        svg.appendChild(svgEl("line", { x1: 20, x2: SCENE_L - 20, y1: haut, y2: haut, class: "mur" }));
        for (var hx = 26; hx < SCENE_L - 20; hx += 12) svg.appendChild(svgEl("line", { x1: hx, x2: hx - 8, y1: haut - 4, y2: haut - 12, class: "hachure" }));
        texte(svg, 24, 16, "mur existant", "etiquette");
        svg.appendChild(svgEl("rect", { x: x0, y: haut, width: Math.max(lpx, 0.5), height: Math.max(hpx, 0.5), class: "enclos" }));
        if (hpx > 18) texte(svg, x0 - 6, haut + hpx / 2 + 4, "x = " + nb(v), "etiquette-forte", "end");
        texte(svg, SCENE_L / 2, haut + hpx + 16, "40 − 2x = " + nb(longueur) + " m", "etiquette-forte", "middle");
        if (lpx > 70 && hpx > 30) texte(svg, SCENE_L / 2, haut + hpx / 2 + 4, "A = " + nb(this._f(v)) + " m²", "etiquette", "middle");
      } else if (s.id === "prix") {
        // Deux barres : le prix p et le nombre d'acheteurs q = 80 − 2p ; le revenu est leur produit.
        var q = 80 - 2 * v;
        texte(svg, 20, 20, "prix de vente p", "etiquette");
        svg.appendChild(svgEl("rect", { x: 20, y: 27, width: Math.max(v * 8, 1), height: 16, class: "barre-prix" }));
        texte(svg, 26 + v * 8, 40, nb(v) + " €", "etiquette-forte");
        texte(svg, 20, 66, "nombre d'acheteurs q = 80 − 2p", "etiquette");
        svg.appendChild(svgEl("rect", { x: 20, y: 73, width: Math.max(q * 4, 1), height: 16, class: "barre-q" }));
        texte(svg, 26 + q * 4, 86, nb(q), "etiquette-forte");
        texte(svg, SCENE_L / 2, 126, "revenu = prix × acheteurs = " + nb(v) + " × " + nb(q) + " = " + nb(this._f(v)) + " €", "etiquette-forte", "middle");
        texte(svg, SCENE_L / 2, 152, "plus cher : plus par vente,", "etiquette", "middle");
        texte(svg, SCENE_L / 2, 168, "mais moins d'acheteurs", "etiquette", "middle");
      } else {
        // Ballon lancé du haut d'une tour de 25 m : abscisse proportionnelle au temps, trace de la trajectoire.
        var sol = SCENE_H - 22, ech = (sol - 14) / 50, x0t = 110, kx = 58, self = this;
        svg.appendChild(svgEl("line", { x1: 20, x2: SCENE_L - 10, y1: sol, y2: sol, class: "sol" }));
        svg.appendChild(svgEl("rect", { x: x0t - 26, y: sol - 25 * ech, width: 26, height: 25 * ech, class: "mesure" }));
        svg.appendChild(svgEl("line", { x1: 40, x2: 40, y1: sol, y2: 10, class: "axe" }));
        for (var g = 0; g <= 50; g += 10) {
          var yg = sol - g * ech;
          svg.appendChild(svgEl("line", { x1: 36, x2: 44, y1: yg, y2: yg, class: "grad" }));
          texte(svg, 32, yg + 4, nb(g), "etiquette", "end");
        }
        texte(svg, 48, 16, "hauteur (m)", "etiquette");
        texte(svg, x0t - 13, sol - 25 * ech - 5, "tour", "etiquette", "middle");
        var dTr = "";
        for (var i = 0; i <= 60; i++) {
          var tt = i / 60 * v;
          dTr += (i ? "L" : "M") + (x0t + tt * kx).toFixed(1) + " " + (sol - self._f(tt) * ech).toFixed(1) + " ";
        }
        if (v > 0) svg.appendChild(svgEl("path", { d: dTr, class: "courbe-hors" }));
        var h = this._f(v), xb = x0t + v * kx, yb = sol - h * ech;
        svg.appendChild(svgEl("circle", { cx: xb, cy: yb, r: 8, class: "ballon" }));
        texte(svg, xb + (v > 3.5 ? -14 : 14), yb + (h < 8 ? -12 : 4), "h = " + nb(h) + " m", "etiquette-forte", v > 3.5 ? "end" : "start");
      }
    }

    _px(v, y) {
      var s = this._s;
      return [MARGE_G + (v - s.min) / (s.max - s.min) * (LARGEUR - MARGE_G - MARGE_D),
        HAUTEUR - MARGE_B - y / s.yMax * (HAUTEUR - MARGE_H - MARGE_B)];
    }

    _dessinerGraphe(v, gauche, vs, fs, vOpt, fOpt, sommetDedans) {
      var s = this._s, svg = this._el.graphe, self = this;
      svg.innerHTML = "";
      var defs = svgEl("defs", {});
      var mk = svgEl("marker", { id: "fl", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      mk.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(mk); svg.appendChild(defs);
      var o = this._px(s.min, 0);
      // grille horizontale + graduations
      for (var gy = s.yPas; gy <= s.yMax; gy += s.yPas) {
        var py = this._px(s.min, gy)[1];
        svg.appendChild(svgEl("line", { x1: o[0], x2: LARGEUR - MARGE_D, y1: py, y2: py, class: "grille" }));
        texte(svg, o[0] - 6, py + 4, nb(gy), "etiquette", "end");
      }
      for (var gx = s.min + s.xPas; gx <= s.max + 1e-9; gx += s.xPas) {
        var px = this._px(gx, 0)[0];
        svg.appendChild(svgEl("line", { x1: px, x2: px, y1: o[1] - 3, y2: o[1] + 3, class: "grad" }));
        texte(svg, px, o[1] + 16, nb(gx), "etiquette", "middle");
      }
      svg.appendChild(svgEl("line", { x1: o[0], x2: LARGEUR - MARGE_D + 10, y1: o[1], y2: o[1], class: "axe", "marker-end": "url(#fl)" }));
      svg.appendChild(svgEl("line", { x1: o[0], x2: o[0], y1: o[1], y2: MARGE_H - 12, class: "axe", "marker-end": "url(#fl)" }));
      texte(svg, LARGEUR - MARGE_D, o[1] + 30, s.legendeAxeX, "etiquette", "end");
      texte(svg, o[0] + 6, MARGE_H - 8, s.legendeAxeY, "etiquette");

      // courbe : en pointillés hors du domaine (restreint), en trait plein dedans
      function trace(de, a, cls) {
        if (a <= de) return;
        var d = "", n = 160;
        for (var i = 0; i <= n; i++) {
          var vv = de + i / n * (a - de), yy = Math.max(0, self._f(vv));
          var p = self._px(vv, yy);
          d += (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1) + " ";
        }
        svg.appendChild(svgEl("path", { d: d, class: cls }));
      }
      trace(s.min, gauche, "courbe-hors");
      trace(gauche, s.max, "courbe");
      if (this._restreint) {
        var pb = this._px(gauche, 0);
        svg.appendChild(svgEl("line", { x1: pb[0], x2: pb[0], y1: o[1], y2: MARGE_H, class: "borne" }));
        texte(svg, pb[0] + 4, o[1] - 8, s.v + " ≥ " + nb(gauche), "etiquette-opt");
      }

      // sommet
      var psm = this._px(vs, fs);
      svg.appendChild(svgEl("line", { x1: psm[0], x2: psm[0], y1: psm[1], y2: o[1], class: "sommet-ligne" }));
      svg.appendChild(svgEl("circle", { cx: psm[0], cy: psm[1], r: 4.5, class: "sommet-pt" }));
      texte(svg, psm[0], psm[1] - 9, "sommet (" + nb(vs) + " ; " + nb(fs) + ")", "etiquette-sommet", "middle");

      // optimum réel (cercle vert) et point courant
      var po = this._px(vOpt, fOpt);
      svg.appendChild(svgEl("circle", { cx: po[0], cy: po[1], r: 9, class: "optimum" }));
      if (!sommetDedans) texte(svg, po[0] + 12, po[1] + 16, "maximum réel : " + nb(fOpt), "etiquette-opt");
      var pc = this._px(v, Math.max(0, this._f(v)));
      svg.appendChild(svgEl("circle", { cx: pc[0], cy: pc[1], r: 6, class: "courant" }));
    }
  }

  if (!customElements.get("optimisation-enclos-widget")) customElements.define("optimisation-enclos-widget", OptimisationEnclosWidget);
})();
