(function () {
  "use strict";

  /* ================================================================
   * <solution-etrangere-widget> — atelier interactif (4e, chapitre 3,
   * section « Étudier algébriquement », niveau 2) : l'équation
   * √(x + p) = x + q, vue en deux panneaux.
   *   1. Avant : y = √(x + p) et y = x + q — leurs intersections sont les
   *      vraies solutions. En pointillés, y = −√(x + p).
   *   2. Après élévation au carré : y = x + p et y = (x + q)² — souvent
   *      DEUX intersections : l'une est une vraie solution, l'autre une
   *      « solution étrangère » (rouge), en réalité solution de
   *      −√(x + p) = x + q : là, le membre de droite x + q est négatif,
   *      ce que la condition de validité x + q ≥ 0 exclut.
   * Valeurs exactes (radical simplifié si besoin). Préréglage
   * √(x + 2) = x ; curseurs p et q pour explorer.
   * Fenêtres de tracé FIXES. Web Component (Shadow DOM).
   * ================================================================ */

  var X_MIN = -7.5, X_MAX = 7.5;
  var P1 = { yMin: -5, yMax: 6 };
  var P2 = { yMin: -3, yMax: 11 };
  var LARGEUR = 440, HAUTEUR = 250, MARGE_G = 24, MARGE_D = 18, MARGE_H = 14, MARGE_B = 20;
  var NS = "http://www.w3.org/2000/svg";
  var EPS = 1e-9;
  var PRESETS = [
    { p: 2, q: 0 },
    { p: 7, q: 1 },
    { p: 4, q: 0 },
    { p: 1, q: 1 },
    { p: 1, q: 3 },
  ];
  var DEFAUT = { p: 2, q: 0 };

  function moinsTypo(t) { return String(t).replace(/-/g, "−"); }
  function decimalFr(v, dec) {
    var fac = Math.pow(10, dec);
    var t = (Math.round(v * fac) / fac).toFixed(dec);
    if (dec > 0) t = t.replace(/0+$/, "").replace(/\.$/, "");
    if (t === "-0") t = "0";
    return moinsTypo(t.replace(".", ","));
  }
  /** « x + 2 », « x − 3 », « x ». */
  function xPlus(c) {
    if (c === 0) return "x";
    return "x " + (c > 0 ? "+ " : "− ") + Math.abs(c);
  }
  /** (x + q)², ou x² si q = 0. */
  function carre(q) { return q === 0 ? "x²" : "(" + xPlus(q) + ")²"; }
  /** x² + Bx + C = 0 écrit proprement. */
  function trinome(B, C) {
    var t = "x²";
    if (B !== 0) t += (B > 0 ? " + " : " − ") + (Math.abs(B) === 1 ? "" : Math.abs(B)) + "x";
    if (C !== 0) t += (C > 0 ? " + " : " − ") + Math.abs(C);
    return t + " = 0";
  }
  /** √n simplifié : { m, r } avec n = m²·r, r sans facteur carré. */
  function radicalSimplifie(n) {
    var m = 1, r = n;
    for (var f = 2; f * f <= r; f++) {
      while (r % (f * f) === 0) { r /= f * f; m *= f; }
    }
    return { m: m, r: r };
  }
  /** Fraction n/2 réduite, en texte. */
  function demi(n) {
    if (n % 2 === 0) return moinsTypo(String(n / 2));
    return moinsTypo(String(n)) + "/2";
  }

  /** Racines exactes de x² + Bx + C = 0 (B, C entiers), Δ = B² − 4C. */
  function racines(B, C) {
    var delta = B * B - 4 * C;
    if (delta < 0) return { delta: delta, liste: [] };
    var s = Math.sqrt(delta);
    var entier = Math.abs(s - Math.round(s)) < EPS;
    var liste = [-1, 1].map(function (signe) {
      var v = (-B + signe * s) / 2;
      var texte;
      if (entier) {
        texte = demi(-B + signe * Math.round(s));
      } else {
        // Ici B = 2q − 1 est impair, donc Δ = B² − 4C aussi : Δ = m²·r avec m
        // impair, et la fraction (−B ± m√r)/2 est déjà irréductible.
        var rad = radicalSimplifie(delta);
        var radTexte = (rad.m === 1 ? "" : rad.m) + "√" + rad.r;
        texte = "(" + moinsTypo(String(-B)) + (signe > 0 ? " + " : " − ") + radTexte + ")/2 ≈ " + decimalFr(v, 2);
      }
      return { v: v, texte: texte };
    });
    if (delta === 0) liste = [liste[0]];
    return { delta: delta, liste: liste };
  }

  function svgEl(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    for (var cle in attrs) el.setAttribute(cle, attrs[cle]);
    return el;
  }

  function repere(cadre) {
    return {
      x: function (x) { return MARGE_G + (x - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - MARGE_G - MARGE_D); },
      y: function (y) { return HAUTEUR - MARGE_B - (y - cadre.yMin) / (cadre.yMax - cadre.yMin) * (HAUTEUR - MARGE_H - MARGE_B); },
    };
  }

  function ancrage(px) {
    if (px < 60) return { anchor: "start", x: Math.max(px + 6, 4) };
    if (px > LARGEUR - 60) return { anchor: "end", x: Math.min(px - 6, LARGEUR - 4) };
    return { anchor: "middle", x: px };
  }

  var boutonsPresets = PRESETS.map(function (pr, i) {
    return '<button class="btn btn-preset" type="button" data-preset="' + i + '">√(' + xPlus(pr.p) + ') = ' + xPlus(pr.q) + '</button>';
  }).join("");

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.equation{text-align:center;font-family:var(--serif,serif);font-size:1.2rem;font-weight:700;color:var(--ink,#241f1a);margin:2px 0 10px;}' +
    '.presets{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;margin-bottom:10px;}' +
    '.titre-panneau{font-size:0.86rem;font-weight:700;color:var(--ink-soft,#6b6055);margin:6px 0 4px;text-align:center;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:6px;}' +
    'svg{width:100%;max-width:460px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.5;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.tick{stroke:var(--ink-soft,#6b6055);stroke-width:1;}' +
    '.grille{stroke:var(--line,#e2d8c8);stroke-width:0.8;}' +
    '.etiquette-tick{font-size:10.5px;fill:var(--ink-soft,#6b6055);font-family:var(--mono,monospace);}' +
    '.courbe-racine{stroke:var(--accent,#a8471f);stroke-width:2.6;fill:none;}' +
    '.courbe-moins-racine{stroke:var(--ink-faint,#9c9083);stroke-width:1.8;stroke-dasharray:5 4;fill:none;}' +
    '.droite{stroke:var(--plan,#5b4ea3);stroke-width:2.4;fill:none;}' +
    '.parabole{stroke:var(--plan,#5b4ea3);stroke-width:2.4;fill:none;}' +
    '.droite-carre{stroke:var(--accent,#a8471f);stroke-width:2.4;fill:none;}' +
    '.zone-interdite{fill:var(--bad,#b3261e);opacity:0.07;}' +
    '.borne-validite{stroke:var(--bad,#b3261e);stroke-width:1.2;stroke-dasharray:3 3;}' +
    '.point-ok{fill:var(--good,#2e7d4f);stroke:var(--surface,#fff);stroke-width:1.4;}' +
    '.point-etranger{fill:var(--bad,#b3261e);stroke:var(--surface,#fff);stroke-width:1.4;}' +
    '.guide{stroke:var(--ink-faint,#9c9083);stroke-width:1.1;stroke-dasharray:3 3;}' +
    '.etiquette-courbe{font-size:11px;font-weight:700;font-family:var(--mono,monospace);}' +
    '.etiquette-courbe.lab-racine{fill:var(--accent,#a8471f);}' +
    '.etiquette-courbe.lab-moins{fill:var(--ink-faint,#9c9083);}' +
    '.etiquette-courbe.lab-droite{fill:var(--plan,#5b4ea3);}' +
    '.etiquette-ok{font-size:11px;font-weight:700;fill:var(--good,#2e7d4f);font-family:var(--mono,monospace);}' +
    '.etiquette-etranger{font-size:11px;font-weight:700;fill:var(--bad,#b3261e);font-family:var(--mono,monospace);}' +
    '.etapes{margin:10px 0 0;padding:10px 12px 10px 30px;border-radius:var(--radius,3px);background:var(--surface,#fff);border:1px solid var(--line,#e2d8c8);font-size:0.9rem;line-height:1.5;color:var(--ink,#241f1a);}' +
    '.etapes li{margin:2px 0;overflow-wrap:anywhere;}' +
    '.ok{color:var(--good,#2e7d4f);font-weight:700;}' +
    '.non{color:var(--bad,#b3261e);font-weight:700;}' +
    '.conclusion{display:block;text-align:center;margin-top:10px;font-weight:700;font-size:1rem;color:var(--ink,#241f1a);}' +
    '.controles{display:flex;flex-direction:column;gap:8px;margin-top:12px;}' +
    '.curseur{display:flex;align-items:center;gap:10px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;min-width:22px;color:var(--ink,#241f1a);}' +
    '.curseur input[type="range"]{flex:1 1 auto;min-width:0;accent-color:var(--accent,#a8471f);height:32px;}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:32px;text-align:right;font-size:0.92rem;}' +
    '.btn{padding:7px 11px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.85rem;font-family:inherit;min-height:36px;}' +
    '.btn:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '.btn-preset[aria-pressed="true"]{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<p class="equation" id="equation"></p>' +
    '<div class="presets">' + boutonsPresets + '</div>' +
    '<p class="titre-panneau" id="titre1"></p>' +
    '<div class="graphe-zone"><svg id="svg1" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg" aria-label="Avant élévation au carré"></svg></div>' +
    '<p class="titre-panneau" id="titre2"></p>' +
    '<div class="graphe-zone"><svg id="svg2" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg" aria-label="Après élévation au carré"></svg></div>' +
    '<ol class="etapes" id="etapes" aria-live="polite"></ol>' +
    '<span class="conclusion" id="conclusion"></span>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="p">p</label><input type="range" id="p" min="-2" max="8" step="1"><span class="curseur-valeur" id="p-valeur"></span></div>' +
    '<div class="curseur"><label for="q">q</label><input type="range" id="q" min="-3" max="4" step="1"><span class="curseur-valeur" id="q-valeur"></span></div>' +
    '</div>';

  class SolutionEtrangereWidgetClass extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._etat = Object.assign({}, DEFAUT);
      this._svg1 = shadow.getElementById("svg1");
      this._svg2 = shadow.getElementById("svg2");
      this._equation = shadow.getElementById("equation");
      this._titre1 = shadow.getElementById("titre1");
      this._titre2 = shadow.getElementById("titre2");
      this._etapes = shadow.getElementById("etapes");
      this._conclusion = shadow.getElementById("conclusion");
      this._presets = Array.prototype.slice.call(shadow.querySelectorAll(".btn-preset"));
      this._inputs = { p: shadow.getElementById("p"), q: shadow.getElementById("q") };
      this._valeurs = { p: shadow.getElementById("p-valeur"), q: shadow.getElementById("q-valeur") };
    }

    connectedCallback() {
      var self = this;
      this._ecouteurs = [];
      function ecoute(el, type, fn) { el.addEventListener(type, fn); self._ecouteurs.push([el, type, fn]); }
      this._presets.forEach(function (b) {
        ecoute(b, "click", function () {
          var pr = PRESETS[Number(b.getAttribute("data-preset"))];
          self._etat = { p: pr.p, q: pr.q };
          self._rendre();
        });
      });
      ["p", "q"].forEach(function (nom) {
        ecoute(self._inputs[nom], "input", function () { self._etat[nom] = parseInt(self._inputs[nom].value, 10); self._rendre(); });
      });
      this._rendre();
    }

    disconnectedCallback() {
      (this._ecouteurs || []).forEach(function (t) { t[0].removeEventListener(t[1], t[2]); });
      this._ecouteurs = [];
    }

    _rendre() {
      var e = this._etat, p = e.p, q = e.q;
      var self = this;
      ["p", "q"].forEach(function (nom) {
        self._inputs[nom].value = String(e[nom]);
        self._valeurs[nom].textContent = moinsTypo(String(e[nom]));
      });
      this._presets.forEach(function (b) {
        var pr = PRESETS[Number(b.getAttribute("data-preset"))];
        b.setAttribute("aria-pressed", String(pr.p === p && pr.q === q));
      });
      var gauche = "√(" + xPlus(p) + ")";
      var droite = xPlus(q);
      this._equation.textContent = gauche + " = " + droite;
      this._titre1.textContent = "1. L'équation de départ : y = " + gauche + " et y = " + droite;
      this._titre2.textContent = "2. Après élévation au carré : y = " + xPlus(p) + " et y = " + carre(q);

      var B = 2 * q - 1, C = q * q - p;
      var r = racines(B, C);
      var racinesInfo = r.liste.map(function (rc) {
        return { v: rc.v, texte: rc.texte, valide: rc.v + q >= -EPS };
      });

      // Étapes de résolution.
      var lignes = [];
      lignes.push("Condition de validité : une racine carrée n'est jamais négative, donc le membre de droite doit être positif ou nul : " +
        (q === 0 ? "x ≥ 0." : droite + " ≥ 0, soit x ≥ " + moinsTypo(String(-q)) + "."));
      lignes.push("On élève les deux membres au carré : " + xPlus(p) + " = " + carre(q) + ", soit " + trinome(B, C) + ".");
      if (r.delta < 0) {
        lignes.push("Δ = " + moinsTypo(String(r.delta)) + " < 0 : même après élévation au carré, il n'y a aucune solution.");
      } else {
        lignes.push("Δ = " + moinsTypo(String(r.delta)) + " → " + racinesInfo.map(function (rc, i) {
          return (racinesInfo.length > 1 ? "x" + (i === 0 ? "₁" : "₂") : "x") + " = " + rc.texte;
        }).join(" ; ") + ".");
      }
      this._etapes.innerHTML = "";
      lignes.forEach(function (t) { var li = document.createElement("li"); li.textContent = t; self._etapes.appendChild(li); });
      racinesInfo.forEach(function (rc, i) {
        var li = document.createElement("li");
        var nom = racinesInfo.length > 1 ? "x" + (i === 0 ? "₁" : "₂") : "x";
        var membre = rc.v + q;
        var span = document.createElement("span");
        span.className = rc.valide ? "ok" : "non";
        span.textContent = rc.valide ? "solution ✓" : "solution étrangère ✗";
        li.appendChild(document.createTextNode("Vérification de " + nom + " : le membre de droite " + droite + " vaut " + decimalFr(membre, 2) + (rc.valide ? " ≥ 0 → " : " < 0 → ")));
        li.appendChild(span);
        if (!rc.valide) {
          li.appendChild(document.createTextNode(" : " + nom + " vérifie l'équation élevée au carré, mais pas la condition de validité. C'est en réalité une solution de −√(" + xPlus(p) + ") = " + droite + " (la courbe en pointillés)."));
        }
        self._etapes.appendChild(li);
      });
      var valides = racinesInfo.filter(function (rc) { return rc.valide; });
      this._conclusion.textContent = valides.length === 0
        ? "S = ∅"
        : "S = {" + valides.map(function (rc) { return rc.texte.split(" ≈")[0]; }).join(" ; ") + "}";

      this._panneau1(p, q, racinesInfo);
      this._panneau2(p, q, racinesInfo);
    }

    _fond(svg, cadre, pasY) {
      var R = repere(cadre);
      svg.innerHTML = "";
      var defs = svgEl("defs", {});
      var marqueur = svgEl("marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      marqueur.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(marqueur);
      var clip = svgEl("clipPath", { id: "zone" });
      clip.appendChild(svgEl("rect", { x: R.x(X_MIN), y: R.y(cadre.yMax), width: R.x(X_MAX) - R.x(X_MIN), height: R.y(cadre.yMin) - R.y(cadre.yMax) }));
      defs.appendChild(clip);
      svg.appendChild(defs);
      var x, y;
      for (x = -7; x <= 7; x++) svg.appendChild(svgEl("line", { x1: R.x(x), x2: R.x(x), y1: R.y(cadre.yMin), y2: R.y(cadre.yMax), class: "grille" }));
      for (y = Math.ceil(cadre.yMin); y <= cadre.yMax; y++) svg.appendChild(svgEl("line", { x1: R.x(X_MIN), x2: R.x(X_MAX), y1: R.y(y), y2: R.y(y), class: "grille" }));
      svg.appendChild(svgEl("line", { x1: R.x(X_MIN), x2: R.x(X_MAX) + 6, y1: R.y(0), y2: R.y(0), class: "axe", "marker-end": "url(#fleche)" }));
      svg.appendChild(svgEl("line", { x1: R.x(0), x2: R.x(0), y1: R.y(cadre.yMin), y2: R.y(cadre.yMax) - 6, class: "axe", "marker-end": "url(#fleche)" }));
      for (x = -6; x <= 6; x += 2) {
        if (x === 0) continue;
        svg.appendChild(svgEl("line", { x1: R.x(x), x2: R.x(x), y1: R.y(0) - 3, y2: R.y(0) + 3, class: "tick" }));
        var t = svgEl("text", { x: R.x(x), y: R.y(0) + 14, "text-anchor": "middle", class: "etiquette-tick" });
        t.textContent = moinsTypo(String(x));
        svg.appendChild(t);
      }
      for (y = Math.ceil(cadre.yMin / pasY) * pasY; y <= cadre.yMax; y += pasY) {
        if (y === 0) continue;
        svg.appendChild(svgEl("line", { x1: R.x(0) - 3, x2: R.x(0) + 3, y1: R.y(y), y2: R.y(y), class: "tick" }));
        var ty = svgEl("text", { x: R.x(0) - 6, y: R.y(y) + 3.5, "text-anchor": "end", class: "etiquette-tick" });
        ty.textContent = moinsTypo(String(y));
        svg.appendChild(ty);
      }
      return R;
    }

    _courbe(R, fn, xDebut, classe) {
      var d = "", n = 300;
      for (var i = 0; i <= n; i++) {
        var x = xDebut + (X_MAX - xDebut) * i / n;
        var y = Math.max(-40, Math.min(40, fn(x)));
        d += (i === 0 ? "M" : "L") + R.x(x).toFixed(2) + " " + R.y(y).toFixed(2) + " ";
      }
      return svgEl("path", { d: d, class: classe });
    }

    _etiquetteCourbe(svg, R, cadre, fn, xPos, texte, classe, dessous) {
      var y = fn(xPos);
      y = Math.max(cadre.yMin + 0.6, Math.min(cadre.yMax - 0.4, y));
      var t = svgEl("text", { x: R.x(xPos).toFixed(2), y: (R.y(y) + (dessous ? 15 : -7)).toFixed(2), "text-anchor": "end", class: "etiquette-courbe " + classe });
      t.textContent = texte;
      svg.appendChild(t);
    }

    _marquer(svg, R, x, y, valide, texte, dessous, decalage) {
      var px = R.x(x), py = R.y(y);
      svg.appendChild(svgEl("line", { x1: px, x2: px, y1: py, y2: R.y(0), class: "guide" }));
      svg.appendChild(svgEl("circle", { cx: px, cy: py, r: 5.5, class: valide ? "point-ok" : "point-etranger" }));
      var a = ancrage(px);
      var ty = dessous ? py + 18 : py - 10 - (decalage || 0);
      if (ty < 12) ty = py + 18;
      if (ty > HAUTEUR - 4) ty = py - 10;
      var t = svgEl("text", { x: a.x.toFixed(2), y: ty.toFixed(2), "text-anchor": a.anchor, class: valide ? "etiquette-ok" : "etiquette-etranger" });
      t.textContent = texte;
      svg.appendChild(t);
    }

    _panneau1(p, q, rcs) {
      var svg = this._svg1;
      var R = this._fond(svg, P1, 2);
      // Zone où la condition de validité x + q ≥ 0 n'est pas respectée.
      var xv = -q;
      if (xv > X_MIN) {
        svg.appendChild(svgEl("rect", { x: R.x(X_MIN), y: R.y(P1.yMax), width: R.x(Math.min(xv, X_MAX)) - R.x(X_MIN), height: R.y(P1.yMin) - R.y(P1.yMax), class: "zone-interdite" }));
        svg.appendChild(svgEl("line", { x1: R.x(xv), x2: R.x(xv), y1: R.y(P1.yMin), y2: R.y(P1.yMax), class: "borne-validite" }));
      }
      var g = svgEl("g", { "clip-path": "url(#zone)" });
      var debut = Math.max(-p, X_MIN);
      g.appendChild(this._courbe(R, function (x) { return -Math.sqrt(Math.max(0, x + p)); }, debut, "courbe-moins-racine"));
      g.appendChild(this._courbe(R, function (x) { return Math.sqrt(Math.max(0, x + p)); }, debut, "courbe-racine"));
      g.appendChild(this._courbe(R, function (x) { return x + q; }, X_MIN, "droite"));
      svg.appendChild(g);
      this._etiquetteCourbe(svg, R, P1, function (x) { return Math.sqrt(x + p); }, X_MAX - 0.3, "√(" + xPlus(p) + ")", "lab-racine", true);
      this._etiquetteCourbe(svg, R, P1, function (x) { return -Math.sqrt(x + p); }, X_MAX - 0.3, "−√(" + xPlus(p) + ")", "lab-moins", true);
      this._etiquetteCourbe(svg, R, P1, function (x) { return x + q; }, Math.min(X_MAX - 0.3, P1.yMax - q - 0.6), xPlus(q), "lab-droite", false);
      var self = this;
      rcs.forEach(function (rc) {
        if (rc.v < X_MIN || rc.v > X_MAX) return;
        // Vraie solution : sur √ ; étrangère : sur −√ (là où la droite coupe le reflet).
        var y = rc.valide ? Math.sqrt(rc.v + p) : -Math.sqrt(rc.v + p);
        self._marquer(svg, R, rc.v, y, rc.valide, rc.valide ? "solution" : "étrangère", !rc.valide, 0);
      });
    }

    _panneau2(p, q, rcs) {
      var svg = this._svg2;
      var R = this._fond(svg, P2, 2);
      var g = svgEl("g", { "clip-path": "url(#zone)" });
      g.appendChild(this._courbe(R, function (x) { return (x + q) * (x + q); }, X_MIN, "parabole"));
      g.appendChild(this._courbe(R, function (x) { return x + p; }, X_MIN, "droite-carre"));
      svg.appendChild(g);
      this._etiquetteCourbe(svg, R, P2, function (x) { return x + p; }, X_MAX - 0.3, xPlus(p), "lab-racine", true);
      var xPar = Math.min(X_MAX - 0.3, -q + Math.sqrt(P2.yMax - 0.8));
      this._etiquetteCourbe(svg, R, P2, function (x) { return (x + q) * (x + q); }, xPar - 0.15, carre(q), "lab-droite", false);
      var self = this;
      rcs.forEach(function (rc, i) {
        if (rc.v < X_MIN || rc.v > X_MAX) return;
        self._marquer(svg, R, rc.v, rc.v + p, rc.valide, rc.valide ? "solution" : "étrangère", false, i === 1 && rcs.length > 1 && Math.abs(rcs[0].v - rc.v) < 2 ? 12 : 0);
      });
    }
  }

  if (!customElements.get("solution-etrangere-widget")) {
    customElements.define("solution-etrangere-widget", SolutionEtrangereWidgetClass);
  }
})();
