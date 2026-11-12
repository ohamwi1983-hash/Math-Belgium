(function () {
  "use strict";

  /* ================================================================
   * <triangle-rapport-affixes-widget> — atelier interactif (6e, nombres
   * complexes, §8) : trois points A, B, C à faire glisser dans le plan
   * d'Argand. Le quotient q = (z_C − z_A)/(z_B − z_A) est dessiné comme
   * un point dans un second petit plan (cercle unité, directions ±60° et
   * ±90° repérées), avec son module et son argument. Le verdict tombe en
   * direct : alignés (q réel), rectangle en A (q imaginaire pur), isocèle
   * en A (|q| = 1), isocèle rectangle en A (q = ±i), équilatéral
   * (q = e^{±iπ/3}).
   * Aimants (case cochée par défaut) : pendant le glisser, le point est
   * attiré par les positions qui réalisent EXACTEMENT un cas remarquable
   * (sommet équilatéral, sommet isocèle rectangle), puis par les courbes
   * (droite des alignés, perpendiculaire, cercle des isocèles), puis par
   * la grille entière — sans aimant, un triangle équilatéral serait
   * inatteignable (aucun triangle équilatéral à sommets entiers).
   * Fenêtres FIXES. Web Component (Shadow DOM).
   * ================================================================ */

  var NS = "http://www.w3.org/2000/svg";
  var X_MIN = -5, X_MAX = 5, Y_MIN = -5, Y_MAX = 5;
  var LARGEUR = 340, HAUTEUR = 340, MARGE = 22;
  var Q_MIN = -2, Q_MAX = 2;
  var Q_TAILLE = 190, Q_MARGE = 18;
  var EPS = 1e-6;
  var R_SNAP_POINT = 0.35, R_SNAP_COURBE = 0.16, R_SNAP_GRILLE = 0.22;
  var DEFAUT = { A: { x: -1, y: -1 }, B: { x: 3, y: -1 }, C: { x: 0, y: 2 } };

  function svgEl(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  function nombreFr(n, dec) {
    var f = Math.pow(10, dec);
    var a = Math.round(n * f) / f;
    if (Object.is(a, -0)) a = 0;
    var s = a.toFixed(dec);
    if (s.indexOf(".") >= 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
    return s.replace(".", ",").replace("-", "−");
  }

  // a + bi lisible : « 2 », « −i », « 1 + 2i », « 0,5 − 1,25i »
  function complexeFr(z, dec) {
    var x = Math.abs(z.x) < 5e-4 ? 0 : z.x;
    var y = Math.abs(z.y) < 5e-4 ? 0 : z.y;
    if (y === 0) return nombreFr(x, dec);
    var mag = Math.abs(y);
    var partieI = (Math.abs(mag - 1) < 5e-4 ? "" : nombreFr(mag, dec)) + "i";
    if (x === 0) return (y < 0 ? "−" : "") + partieI;
    return nombreFr(x, dec) + (y < 0 ? " − " : " + ") + partieI;
  }

  // Argument (radians) → « 60° (π/3) » quand c'est un multiple de 15°.
  function argumentFr(t) {
    var deg = t * 180 / Math.PI;
    if (deg <= -180 + 1e-9) deg += 360;
    var texte = nombreFr(deg, 1) + "°";
    var k = deg / 15;
    if (Math.abs(k - Math.round(k)) < 1e-3) {
      var num = Math.round(k), den = 12;
      if (num === 0) return "0°";
      var g = pgcd(Math.abs(num), den);
      num /= g; den /= g;
      var signe = num < 0 ? "−" : "";
      var m = Math.abs(num);
      var pi = (m === 1 ? "" : m) + "π" + (den === 1 ? "" : "/" + den);
      texte += " (" + signe + pi + ")";
    }
    return texte;
  }

  function pgcd(a, b) { while (b) { var t = a % b; a = b; b = t; } return a; }

  function cSub(u, v) { return { x: u.x - v.x, y: u.y - v.y }; }
  function cAdd(u, v) { return { x: u.x + v.x, y: u.y + v.y }; }
  function cMul(u, v) { return { x: u.x * v.x - u.y * v.y, y: u.x * v.y + u.y * v.x }; }
  function cDiv(u, v) {
    var d = v.x * v.x + v.y * v.y;
    return { x: (u.x * v.x + u.y * v.y) / d, y: (u.y * v.x - u.x * v.y) / d };
  }
  function cMod(u) { return Math.hypot(u.x, u.y); }
  function cScale(u, k) { return { x: u.x * k, y: u.y * k }; }
  function dist(u, v) { return Math.hypot(u.x - v.x, u.y - v.y); }
  var I = { x: 0, y: 1 }, MOINS_I = { x: 0, y: -1 };
  var E60 = { x: 0.5, y: Math.sqrt(3) / 2 }, E_60 = { x: 0.5, y: -Math.sqrt(3) / 2 };

  function projeterDroite(p, p0, d) {
    var n2 = d.x * d.x + d.y * d.y;
    if (n2 < EPS) return null;
    var t = ((p.x - p0.x) * d.x + (p.y - p0.y) * d.y) / n2;
    return { x: p0.x + t * d.x, y: p0.y + t * d.y };
  }
  function projeterCercle(p, c, r) {
    var v = cSub(p, c), m = cMod(v);
    if (m < EPS || r < EPS) return null;
    return cAdd(c, cScale(v, r / m));
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    "<style>" +
    ":host{display:block;font-family:var(--sans,system-ui,sans-serif);}" +
    "*{box-sizing:border-box;}" +
    ".figures{display:flex;flex-wrap:wrap;justify-content:center;align-items:flex-start;gap:12px;margin-bottom:12px;background:var(--surface,#fff);}" +
    ".plan{flex:1 1 300px;max-width:360px;min-width:0;}" +
    ".panneau{flex:0 1 200px;max-width:210px;min-width:0;text-align:center;}" +
    "svg{display:block;width:100%;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);user-select:none;-webkit-user-select:none;}" +
    ".titre-panneau{font-size:0.78rem;color:var(--ink-soft,#6b6055);margin:4px 0 0;line-height:1.35;}" +
    ".grille{stroke:var(--line,#e2d8c8);stroke-width:0.8;}" +
    ".axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}" +
    ".fleche{fill:var(--ink-soft,#6b6055);}" +
    ".nom-axe{font-size:10px;fill:var(--ink-soft,#6b6055);}" +
    ".triangle{stroke:var(--accent,#a8471f);stroke-width:2;fill:var(--accent,#a8471f);fill-opacity:0.10;stroke-linejoin:round;}" +
    ".triangle.aligne{fill-opacity:0;}" +
    ".cote-ab{stroke:var(--good,#2f7a4f);stroke-width:2.6;}" +
    ".cote-ac{stroke:var(--plan,#5b4ea3);stroke-width:2.6;}" +
    ".point{stroke:var(--surface,#fff);stroke-width:1.5;}" +
    ".point-A{fill:var(--ink,#241f1a);}" +
    ".point-B{fill:var(--good,#2f7a4f);}" +
    ".point-C{fill:var(--plan,#5b4ea3);}" +
    ".poignee{fill:transparent;cursor:grab;touch-action:none;}" +
    ".etiquette{font-size:12px;font-weight:700;}" +
    ".et-A{fill:var(--ink,#241f1a);}" +
    ".et-B{fill:var(--good,#2f7a4f);}" +
    ".et-C{fill:var(--plan,#5b4ea3);}" +
    ".angle-droit{stroke:var(--bad,#b23a3a);stroke-width:1.4;fill:none;}" +
    ".cercle-unite{stroke:var(--ink-faint,#9c9083);stroke-width:1.2;fill:none;}" +
    ".repere{stroke:var(--ink-faint,#9c9083);stroke-width:1;stroke-dasharray:3 3;}" +
    ".cible{fill:none;stroke:var(--ink-faint,#9c9083);stroke-width:1.2;}" +
    ".cible.atteinte{stroke:var(--good,#2f7a4f);stroke-width:2;}" +
    ".vecteur-q{stroke:var(--bad,#b23a3a);stroke-width:2;}" +
    ".point-q{fill:var(--bad,#b23a3a);}" +
    ".et-q{font-size:12px;font-weight:700;fill:var(--bad,#b23a3a);}" +
    ".et-cible{font-size:9px;fill:var(--ink-soft,#6b6055);}" +
    ".lecture{text-align:center;font-size:0.86rem;margin:0 0 10px;padding:10px 12px;border-radius:var(--radius,3px);color:var(--ink,#241f1a);background:var(--surface-2,#faf6f0);line-height:1.6;font-variant-numeric:tabular-nums;}" +
    ".lecture strong{color:var(--bad,#b23a3a);}" +
    ".verdicts{list-style:none;margin:0 0 14px;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:6px;}" +
    ".verdicts li{font-size:0.82rem;padding:6px 8px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);color:var(--ink-soft,#6b6055);background:var(--surface,#fff);line-height:1.35;}" +
    ".verdicts li.oui{border-color:var(--good,#2f7a4f);color:var(--good,#2f7a4f);font-weight:700;background:var(--good-soft,rgba(47,122,79,0.08));}" +
    ".verdicts .crit{display:block;font-weight:400;font-size:0.76rem;color:var(--ink-soft,#6b6055);}" +
    ".avertissement{color:var(--bad,#b23a3a);font-weight:700;}" +
    ".controles{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:10px 18px;}" +
    ".controles label{display:flex;align-items:center;gap:6px;font-size:0.88rem;color:var(--ink,#241f1a);cursor:pointer;}" +
    ".controles input{accent-color:var(--accent,#a8471f);width:18px;height:18px;}" +
    ".aide{font-size:0.8rem;color:var(--ink-soft,#6b6055);text-align:center;margin:0 0 10px;}" +
    ".btn-reset{padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;}" +
    "@media (max-width:520px){.figures{gap:8px;flex-wrap:nowrap;}.plan{flex:1 1 0;}.panneau{flex:0 0 38%;}.titre-panneau{font-size:0.7rem;}.etiquette{font-size:18px;}.nom-axe{font-size:15px;}.et-q{font-size:18px;}.et-cible{font-size:14px;}}" +
    "</style>" +
    '<p class="aide">Fais glisser A, B ou C.</p>' +
    '<div class="figures">' +
    '<div class="plan"><svg id="plan" viewBox="0 0 ' + LARGEUR + " " + HAUTEUR + '" role="img" aria-label="Triangle ABC dans le plan d’Argand"></svg></div>' +
    '<div class="panneau"><svg id="panneau" viewBox="0 0 ' + Q_TAILLE + " " + Q_TAILLE + '" role="img" aria-label="Le quotient q dans le plan"></svg>' +
    '<p class="titre-panneau">Le point q = (z<sub>C</sub> − z<sub>A</sub>) / (z<sub>B</sub> − z<sub>A</sub>), avec le cercle unité</p></div>' +
    "</div>" +
    '<p class="lecture" id="lecture"></p>' +
    '<ul class="verdicts" id="verdicts"></ul>' +
    '<div class="controles">' +
    '<label><input type="checkbox" id="aimants" checked> Aimants</label>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    "</div>";

  class TriangleRapportAffixesWidget extends HTMLElement {
    constructor() {
      super();
      var sh = this.attachShadow({ mode: "open" });
      sh.appendChild(TEMPLATE.content.cloneNode(true));
      this._pts = { A: Object.assign({}, DEFAUT.A), B: Object.assign({}, DEFAUT.B), C: Object.assign({}, DEFAUT.C) };
      this._plan = sh.getElementById("plan");
      this._panneau = sh.getElementById("panneau");
      this._lecture = sh.getElementById("lecture");
      this._verdicts = sh.getElementById("verdicts");
      this._aimants = sh.getElementById("aimants");
      this._reset = sh.getElementById("reset");
      this._glisse = null;
    }

    connectedCallback() {
      var self = this;
      this._onDown = function (e) { self._debut(e); };
      this._onMove = function (e) { self._deplacer(e); };
      this._onUp = function (e) { self._fin(e); };
      this._onReset = function () {
        self._pts = { A: Object.assign({}, DEFAUT.A), B: Object.assign({}, DEFAUT.B), C: Object.assign({}, DEFAUT.C) };
        self._rendre();
      };
      this._plan.addEventListener("pointerdown", this._onDown);
      this._plan.addEventListener("pointermove", this._onMove);
      this._plan.addEventListener("pointerup", this._onUp);
      this._plan.addEventListener("pointercancel", this._onUp);
      this._reset.addEventListener("click", this._onReset);
      this._rendre();
    }

    disconnectedCallback() {
      this._plan.removeEventListener("pointerdown", this._onDown);
      this._plan.removeEventListener("pointermove", this._onMove);
      this._plan.removeEventListener("pointerup", this._onUp);
      this._plan.removeEventListener("pointercancel", this._onUp);
      this._reset.removeEventListener("click", this._onReset);
    }

    _px(p) {
      return [
        MARGE + (p.x - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - 2 * MARGE),
        HAUTEUR - MARGE - (p.y - Y_MIN) / (Y_MAX - Y_MIN) * (HAUTEUR - 2 * MARGE),
      ];
    }

    _math(evt) {
      var pt = this._plan.createSVGPoint();
      pt.x = evt.clientX; pt.y = evt.clientY;
      var m = this._plan.getScreenCTM();
      if (!m) return null;
      var q = pt.matrixTransform(m.inverse());
      return {
        x: X_MIN + (q.x - MARGE) / (LARGEUR - 2 * MARGE) * (X_MAX - X_MIN),
        y: Y_MIN + (HAUTEUR - MARGE - q.y) / (HAUTEUR - 2 * MARGE) * (Y_MAX - Y_MIN),
      };
    }

    _debut(e) {
      var p = this._math(e);
      if (!p) return;
      var meilleur = null, dMin = 0.75;
      for (var nom in this._pts) {
        var d = dist(p, this._pts[nom]);
        if (d < dMin) { dMin = d; meilleur = nom; }
      }
      if (!meilleur) return;
      this._glisse = meilleur;
      try { this._plan.setPointerCapture(e.pointerId); } catch (err) { /* rien */ }
      e.preventDefault();
    }

    _deplacer(e) {
      if (!this._glisse) return;
      var p = this._math(e);
      if (!p) return;
      p.x = Math.min(X_MAX - 0.2, Math.max(X_MIN + 0.2, p.x));
      p.y = Math.min(Y_MAX - 0.2, Math.max(Y_MIN + 0.2, p.y));
      if (this._aimants.checked) p = this._aimanter(this._glisse, p);
      this._pts[this._glisse] = p;
      this._rendre();
      e.preventDefault();
    }

    _fin(e) {
      if (!this._glisse) return;
      try { this._plan.releasePointerCapture(e.pointerId); } catch (err) { /* rien */ }
      this._glisse = null;
    }

    // Cibles exactes (points) puis courbes, selon le point déplacé.
    _cibles(nom) {
      var A = this._pts.A, B = this._pts.B, C = this._pts.C;
      var points = [], courbes = [];
      if (nom === "C") {
        var u = cSub(B, A);
        if (cMod(u) > EPS) {
          [E60, E_60, I, MOINS_I].forEach(function (q) { points.push(cAdd(A, cMul(u, q))); });
          courbes.push({ type: "droite", p0: A, d: u });
          courbes.push({ type: "droite", p0: A, d: cMul(u, I) });
          courbes.push({ type: "cercle", c: A, r: cMod(u) });
        }
      } else if (nom === "B") {
        var v = cSub(C, A);
        if (cMod(v) > EPS) {
          [E60, E_60, I, MOINS_I].forEach(function (q) { points.push(cAdd(A, cDiv(v, q))); });
          courbes.push({ type: "droite", p0: A, d: v });
          courbes.push({ type: "droite", p0: A, d: cMul(v, I) });
          courbes.push({ type: "cercle", c: A, r: cMod(v) });
        }
      } else {
        var w = cSub(C, B);
        if (cMod(w) > EPS) {
          var M = cScale(cAdd(B, C), 0.5);
          // sommets équilatéraux et isocèles rectangles en A
          points.push(cAdd(B, cMul(w, E60)));
          points.push(cAdd(B, cMul(w, E_60)));
          points.push(cAdd(M, cScale(cMul(w, I), 0.5)));
          points.push(cAdd(M, cScale(cMul(w, MOINS_I), 0.5)));
          courbes.push({ type: "droite", p0: B, d: w });
          courbes.push({ type: "droite", p0: M, d: cMul(w, I) });
          courbes.push({ type: "cercle", c: M, r: cMod(w) / 2 });
        }
      }
      return { points: points, courbes: courbes };
    }

    _aimanter(nom, p) {
      var c = this._cibles(nom);
      var i, meilleur = null, dMin = R_SNAP_POINT;
      for (i = 0; i < c.points.length; i++) {
        var d = dist(p, c.points[i]);
        if (d < dMin && this._dansCadre(c.points[i])) { dMin = d; meilleur = c.points[i]; }
      }
      if (meilleur) return { x: meilleur.x, y: meilleur.y };
      var grille = { x: Math.round(p.x), y: Math.round(p.y) };
      if (dist(p, grille) < R_SNAP_GRILLE && this._dansCadre(grille)) return grille;
      dMin = R_SNAP_COURBE;
      for (i = 0; i < c.courbes.length; i++) {
        var k = c.courbes[i];
        var proj = k.type === "droite" ? projeterDroite(p, k.p0, k.d) : projeterCercle(p, k.c, k.r);
        if (!proj) continue;
        var dd = dist(p, proj);
        if (dd < dMin && this._dansCadre(proj)) { dMin = dd; meilleur = proj; }
      }
      return meilleur ? { x: meilleur.x, y: meilleur.y } : p;
    }

    _dansCadre(p) {
      return p.x >= X_MIN + 0.2 && p.x <= X_MAX - 0.2 && p.y >= Y_MIN + 0.2 && p.y <= Y_MAX - 0.2;
    }

    _rendre() {
      var A = this._pts.A, B = this._pts.B, C = this._pts.C;
      var u = cSub(B, A), v = cSub(C, A);
      var degenere = cMod(u) < 1e-3 || cMod(v) < 1e-3 || dist(B, C) < 1e-3;
      var q = degenere ? null : cDiv(v, u);
      var tol = 2e-3;
      var etat = { aligne: false, rectangle: false, isocele: false, isoRect: false, equilateral: false };
      if (q) {
        var m = cMod(q);
        etat.aligne = Math.abs(q.y) < tol * Math.max(1, m);
        etat.rectangle = Math.abs(q.x) < tol * Math.max(1, m);
        etat.isocele = Math.abs(m - 1) < tol;
        etat.isoRect = etat.rectangle && etat.isocele;
        etat.equilateral = etat.isocele && Math.abs(q.x - 0.5) < tol && Math.abs(Math.abs(q.y) - Math.sqrt(3) / 2) < tol;
      }
      this._dessinerPlan(etat);
      this._dessinerPanneau(q, etat);

      var aff = "z<sub>A</sub> = " + complexeFr(A, 2) + " ; z<sub>B</sub> = " + complexeFr(B, 2) + " ; z<sub>C</sub> = " + complexeFr(C, 2);
      if (!q) {
        this._lecture.innerHTML = aff + '<br><span class="avertissement">A, B et C doivent être trois points distincts.</span>';
      } else {
        this._lecture.innerHTML = aff + "<br><strong>q = " + complexeFr(q, 2) + "</strong> — |q| = " + nombreFr(cMod(q), 3) +
          " ; arg q = " + argumentFr(Math.atan2(q.y, q.x));
      }

      var lignes = [
        ["aligne", "A, B, C alignés", "q réel"],
        ["rectangle", "Rectangle en A", "q imaginaire pur"],
        ["isocele", "Isocèle en A", "|q| = 1, soit AC = AB"],
        ["isoRect", "Isocèle rectangle en A", "q = i ou q = −i"],
        ["equilateral", "Équilatéral", "q = e<sup>iπ/3</sup> ou e<sup>−iπ/3</sup>"],
      ];
      this._verdicts.innerHTML = lignes.map(function (l) {
        var oui = etat[l[0]];
        return '<li class="' + (oui ? "oui" : "") + '">' + (oui ? "✓ " : "") + l[1] + '<span class="crit">' + l[2] + "</span></li>";
      }).join("");
    }

    _axes(svg, x0, y0, x1, y1, ox, oy, noms, idFleche) {
      var defs = svgEl("defs", {});
      var mk = svgEl("marker", { id: idFleche, markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      mk.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(mk);
      svg.appendChild(defs);
      svg.appendChild(svgEl("line", { x1: x0, y1: oy, x2: x1, y2: oy, class: "axe", "marker-end": "url(#" + idFleche + ")" }));
      svg.appendChild(svgEl("line", { x1: ox, y1: y0, x2: ox, y2: y1, class: "axe", "marker-end": "url(#" + idFleche + ")" }));
      if (noms) {
        var re = svgEl("text", { x: x1 - 2, y: oy - 6, "text-anchor": "end", class: "nom-axe" });
        re.textContent = "Re";
        svg.appendChild(re);
        var im = svgEl("text", { x: ox + 6, y: y1 + 10, class: "nom-axe" });
        im.textContent = "Im";
        svg.appendChild(im);
      }
    }

    _dessinerPlan(etat) {
      var svg = this._plan, self = this;
      svg.innerHTML = "";
      for (var g = X_MIN; g <= X_MAX; g++) {
        var a = this._px({ x: g, y: Y_MIN }), b = this._px({ x: g, y: Y_MAX });
        svg.appendChild(svgEl("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: "grille" }));
        var c = this._px({ x: X_MIN, y: g }), d = this._px({ x: X_MAX, y: g });
        svg.appendChild(svgEl("line", { x1: c[0], y1: c[1], x2: d[0], y2: d[1], class: "grille" }));
      }
      var o = this._px({ x: 0, y: 0 });
      this._axes(svg, MARGE - 8, HAUTEUR - MARGE + 8, LARGEUR - MARGE + 12, MARGE - 12, o[0], o[1], true, "fl-plan");

      var P = this._pts;
      var pa = this._px(P.A), pb = this._px(P.B), pc = this._px(P.C);
      svg.appendChild(svgEl("polygon", {
        points: [pa, pb, pc].map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" "),
        class: "triangle" + (etat.aligne ? " aligne" : ""),
      }));
      svg.appendChild(svgEl("line", { x1: pa[0], y1: pa[1], x2: pb[0], y2: pb[1], class: "cote-ab" }));
      svg.appendChild(svgEl("line", { x1: pa[0], y1: pa[1], x2: pc[0], y2: pc[1], class: "cote-ac" }));

      if (etat.rectangle && !etat.aligne) {
        var ub = [pb[0] - pa[0], pb[1] - pa[1]], uc = [pc[0] - pa[0], pc[1] - pa[1]];
        var nb = Math.hypot(ub[0], ub[1]), nc = Math.hypot(uc[0], uc[1]);
        if (nb > 1 && nc > 1) {
          var s = 11;
          var e1 = [ub[0] / nb * s, ub[1] / nb * s], e2 = [uc[0] / nc * s, uc[1] / nc * s];
          svg.appendChild(svgEl("path", {
            d: "M" + (pa[0] + e1[0]) + " " + (pa[1] + e1[1]) + " L" + (pa[0] + e1[0] + e2[0]) + " " + (pa[1] + e1[1] + e2[1]) + " L" + (pa[0] + e2[0]) + " " + (pa[1] + e2[1]),
            class: "angle-droit",
          }));
        }
      }

      // centre de gravité pour orienter les étiquettes vers l'extérieur
      var gx = (pa[0] + pb[0] + pc[0]) / 3, gy = (pa[1] + pb[1] + pc[1]) / 3;
      [["A", pa], ["B", pb], ["C", pc]].forEach(function (e) {
        var nom = e[0], p = e[1];
        svg.appendChild(svgEl("circle", { cx: p[0], cy: p[1], r: 6, class: "point point-" + nom }));
        svg.appendChild(svgEl("circle", { cx: p[0], cy: p[1], r: 16, class: "poignee" }));
        var dx = p[0] - gx, dy = p[1] - gy, n = Math.hypot(dx, dy);
        if (n < 1) { dx = 1; dy = -1; n = Math.SQRT2; }
        var lx = p[0] + dx / n * 15, ly = p[1] + dy / n * 15 + 4;
        lx = Math.min(LARGEUR - 10, Math.max(10, lx));
        ly = Math.min(HAUTEUR - 6, Math.max(14, ly));
        var t = svgEl("text", { x: lx.toFixed(1), y: ly.toFixed(1), "text-anchor": "middle", class: "etiquette et-" + nom });
        t.textContent = nom;
        svg.appendChild(t);
      });
      void self;
    }

    _dessinerPanneau(q, etat) {
      var svg = this._panneau;
      svg.innerHTML = "";
      var self = this;
      function px(p) {
        return [
          Q_MARGE + (p.x - Q_MIN) / (Q_MAX - Q_MIN) * (Q_TAILLE - 2 * Q_MARGE),
          Q_TAILLE - Q_MARGE - (p.y - Q_MIN) / (Q_MAX - Q_MIN) * (Q_TAILLE - 2 * Q_MARGE),
        ];
      }
      var o = px({ x: 0, y: 0 });
      var unite = (Q_TAILLE - 2 * Q_MARGE) / (Q_MAX - Q_MIN);
      this._axes(svg, Q_MARGE - 6, Q_TAILLE - Q_MARGE + 6, Q_TAILLE - Q_MARGE + 10, Q_MARGE - 10, o[0], o[1], false, "fl-q");
      svg.appendChild(svgEl("circle", { cx: o[0], cy: o[1], r: unite, class: "cercle-unite" }));
      [60, -60].forEach(function (deg) {
        var t = deg * Math.PI / 180, p = px({ x: 1.9 * Math.cos(t), y: 1.9 * Math.sin(t) });
        svg.appendChild(svgEl("line", { x1: o[0], y1: o[1], x2: p[0], y2: p[1], class: "repere" }));
      });
      var cibles = [
        { z: E60, ok: etat.equilateral && q && q.y > 0 },
        { z: E_60, ok: etat.equilateral && q && q.y < 0 },
        { z: I, ok: etat.isoRect && q && q.y > 0 },
        { z: MOINS_I, ok: etat.isoRect && q && q.y < 0 },
      ];
      cibles.forEach(function (c) {
        var p = px(c.z);
        svg.appendChild(svgEl("circle", { cx: p[0], cy: p[1], r: 6, class: "cible" + (c.ok ? " atteinte" : "") }));
      });
      var tI = svgEl("text", { x: o[0] - 6, y: px(I)[1] - 6, "text-anchor": "end", class: "et-cible" });
      tI.textContent = "i";
      svg.appendChild(tI);
      var tMI = svgEl("text", { x: o[0] - 6, y: px(MOINS_I)[1] + 12, "text-anchor": "end", class: "et-cible" });
      tMI.textContent = "−i";
      svg.appendChild(tMI);
      var t1 = svgEl("text", { x: px({ x: 1, y: 0 })[0] + 3, y: o[1] + 12, class: "et-cible" });
      t1.textContent = "1";
      svg.appendChild(t1);

      if (!q) return;
      var lim = Q_MAX - 0.12;
      var horsCadre = Math.abs(q.x) > lim || Math.abs(q.y) > lim;
      var qa = q;
      if (horsCadre) {
        var k = lim / Math.max(Math.abs(q.x), Math.abs(q.y));
        qa = cScale(q, k);
      }
      var pq = px(qa);
      svg.appendChild(svgEl("line", { x1: o[0], y1: o[1], x2: pq[0], y2: pq[1], class: "vecteur-q", "marker-end": horsCadre ? "url(#fl-q)" : "none" }));
      if (!horsCadre) svg.appendChild(svgEl("circle", { cx: pq[0], cy: pq[1], r: 4.5, class: "point-q" }));
      var droite = pq[0] > Q_TAILLE - 40;
      var t = svgEl("text", {
        x: (pq[0] + (droite ? -8 : 8)).toFixed(1),
        y: (pq[1] + (pq[1] < 22 ? 14 : -7)).toFixed(1),
        "text-anchor": droite ? "end" : "start",
        class: "et-q",
      });
      t.textContent = horsCadre ? "q (hors cadre)" : "q";
      svg.appendChild(t);
      void self;
    }
  }

  if (!customElements.get("triangle-rapport-affixes-widget")) {
    customElements.define("triangle-rapport-affixes-widget", TriangleRapportAffixesWidget);
  }
})();
