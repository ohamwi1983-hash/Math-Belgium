(function () {
  "use strict";

  /* ================================================================
   * <trois-formes-widget> — atelier interactif (4e, chapitre 1, § 2) :
   * une même fonction du second degré sous ses trois écritures —
   * développée ax² + bx + c, canonique a(x − x_S)² + y_S, factorisée
   * a(x − x₁)(x − x₂). On règle la parabole par son sommet OU par ses
   * zéros ; les trois formes se mettent à jour ensemble. Cliquer une
   * forme éclaire sur le graphique ce qu'elle permet de lire :
   * développée → (0 ; c), canonique → S et l'axe, factorisée → zéros.
   * Fenêtre FIXE x ∈ [−6 ; 6], y ∈ [−8 ; 8]. Web Component (Shadow DOM).
   * ================================================================ */

  var NS = "http://www.w3.org/2000/svg";
  var LARGEUR = 420, HAUTEUR = 360, MARGE = 14;
  var XMIN = -6, XMAX = 6, YMIN = -8, YMAX = 8;
  var VALEURS_A = [-2, -1, -0.5, 0.5, 1, 2];
  var EPS = 1e-9;

  function estEntier(v) { return Math.abs(v - Math.round(v)) < EPS; }
  // Valeurs exactes jusqu'au millième (0,125 = a·x_S² avec a = 0,5 et x_S demi-entier).
  function nb(v) {
    if (Math.abs(v) < EPS) v = 0;
    var s = estEntier(v) ? String(Math.round(v)) : (Math.round(v * 1000) / 1000).toString();
    return s.replace(".", ",").replace("-", "−");
  }
  function nb2(v) {
    if (Math.abs(v) < 0.005) v = 0;
    return (Math.round(v * 100) / 100).toString().replace(".", ",").replace("-", "−");
  }
  function terme(coef, lettre, premier) {
    if (Math.abs(coef) < EPS) return "";
    var abs = Math.abs(coef);
    var corps = (lettre && Math.abs(abs - 1) < EPS) ? lettre : nb(abs) + lettre;
    if (premier) return (coef < 0 ? "−" : "") + corps;
    return (coef < 0 ? " − " : " + ") + corps;
  }
  function polynome(a, b, c) {
    var s = terme(a, "x²", true);
    s += terme(b, "x", s === "");
    s += terme(c, "", s === "");
    return s === "" ? "0" : s;
  }
  function coefTete(a) {
    if (Math.abs(a - 1) < EPS) return "";
    if (Math.abs(a + 1) < EPS) return "−";
    return nb(a);
  }
  function facteur(r, format) {
    if (Math.abs(r) < EPS) return "x";
    return "(x " + (r > 0 ? "− " : "+ ") + (format || nb)(Math.abs(r)) + ")";
  }
  function pgcd(a, b) { while (b) { var t = b; b = a % b; a = t; } return a; }
  // √r écrit exactement, r multiple de 0,25 (r = p/q, q ∈ {1, 2, 4}).
  function radical(r) {
    var q = 1;
    while (!estEntier(r * q) && q < 64) q *= 2;
    var p = Math.round(r * q), g = pgcd(p, q);
    p /= g; q /= g;
    if (q === 2) return "√(" + p + "/2)";
    var k = 1, m = p;
    for (var d = 2; d * d <= m; d++) while (m % (d * d) === 0) { m /= d * d; k *= d; }
    var racine = (k === 1 ? "" : String(k)) + "√" + m;
    return q === 1 ? racine : racine + "/" + Math.round(Math.sqrt(q));
  }
  function svgEl(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }
  function px(x, y) {
    return [MARGE + (x - XMIN) / (XMAX - XMIN) * (LARGEUR - 2 * MARGE),
      MARGE + (YMAX - y) / (YMAX - YMIN) * (HAUTEUR - 2 * MARGE)];
  }
  function dansFenetre(x, y) { return x >= XMIN && x <= XMAX && y >= YMIN && y <= YMAX; }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}' +
    '*{box-sizing:border-box;}' +
    '.barre{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin:0 0 10px;}' +
    '.btn{min-height:44px;min-width:52px;padding:6px 12px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);font:inherit;font-weight:600;cursor:pointer;}' +
    '.btn[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);border-color:var(--accent,#a8471f);color:var(--accent-ink,#7a3212);}' +
    '.petit{font-weight:500;font-size:0.92rem;}' +
    '.formes{display:flex;flex-direction:column;gap:8px;margin:0 0 12px;}' +
    '.forme{display:block;width:100%;text-align:left;min-height:44px;padding:9px 12px;border:1px solid var(--line,#e2d8c8);border-left:5px solid var(--c);border-radius:var(--radius,3px);background:var(--surface,#fff);color:var(--ink,#241f1a);font:inherit;cursor:pointer;}' +
    '.forme[aria-pressed="true"]{background:var(--surface-2,#faf6f0);border-color:var(--c);box-shadow:inset 0 0 0 1px var(--c);}' +
    '.forme .nom{display:block;font-size:0.8rem;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:var(--c);}' +
    '.forme .expr{display:block;font-family:var(--serif,serif);font-style:italic;font-size:1.08rem;font-weight:600;margin:2px 0;overflow-wrap:anywhere;}' +
    '.forme .lit{display:block;font-size:0.9rem;color:var(--ink-soft,#6b6055);overflow-wrap:anywhere;}' +
    '#f-dev{--c:var(--good,#2f7a4f);}' +
    '#f-can{--c:var(--plan,#6b4fa0);}' +
    '#f-fac{--c:var(--accent,#a8471f);}' +
    '.zone{display:flex;justify-content:center;margin:0 0 12px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.grad{stroke:var(--ink-soft,#6b6055);stroke-width:1;}' +
    '.grille{stroke:var(--line,#e2d8c8);stroke-width:0.7;}' +
    '.courbe{stroke:var(--ink,#241f1a);stroke-width:2.4;fill:none;}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);}' +
    '.h-dev{fill:var(--good,#2f7a4f);}' +
    '.h-can{fill:var(--plan,#6b4fa0);}' +
    '.h-fac{fill:var(--accent,#a8471f);}' +
    '.h-axe{stroke:var(--plan,#6b4fa0);stroke-width:1.6;stroke-dasharray:6 4;}' +
    '.h-txt{font-size:12.5px;font-weight:700;paint-order:stroke;stroke:var(--surface-2,#faf6f0);stroke-width:4px;}' +
    '.controles{display:flex;flex-direction:column;gap:10px;}' +
    '.curseur{display:flex;flex-direction:column;gap:4px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-height:44px;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:44px;text-align:right;}' +
    '.titre-ctrl{font-size:0.9rem;color:var(--ink-soft,#6b6055);text-align:center;margin:4px 0 0;}' +
    '[hidden]{display:none !important;}' +
    '</style>' +
    '<div class="barre" role="group" aria-label="Mode de réglage">' +
    '<button type="button" class="btn" id="m-sommet">Régler par le sommet</button>' +
    '<button type="button" class="btn" id="m-zeros">Régler par les zéros</button>' +
    '</div>' +
    '<div class="formes">' +
    '<button type="button" class="forme" id="f-dev"><span class="nom">Forme développée</span><span class="expr" id="e-dev"></span><span class="lit" id="l-dev"></span></button>' +
    '<button type="button" class="forme" id="f-can"><span class="nom">Forme canonique</span><span class="expr" id="e-can"></span><span class="lit" id="l-can"></span></button>' +
    '<button type="button" class="forme" id="f-fac"><span class="nom">Forme factorisée</span><span class="expr" id="e-fac"></span><span class="lit" id="l-fac"></span></button>' +
    '</div>' +
    '<div class="zone"><svg id="graphe" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" role="img" aria-label="Parabole et éléments lus sur la forme choisie"></svg></div>' +
    '<div class="controles">' +
    '<p class="titre-ctrl">coefficient a</p>' +
    '<div class="barre" id="boutons-a" role="group" aria-label="Coefficient a"></div>' +
    '<div id="bloc-sommet">' +
    '<div class="curseur"><label for="xs">abscisse du sommet x<sub>S</sub></label><div class="curseur-row"><input type="range" id="xs" min="-4" max="4" step="0.5"><span class="curseur-valeur" id="xs-val"></span></div></div>' +
    '<div class="curseur"><label for="ys">ordonnée du sommet y<sub>S</sub></label><div class="curseur-row"><input type="range" id="ys" min="-6" max="6" step="0.5"><span class="curseur-valeur" id="ys-val"></span></div></div>' +
    '</div>' +
    '<div id="bloc-zeros" hidden>' +
    '<div class="curseur"><label for="x1">premier zéro x₁</label><div class="curseur-row"><input type="range" id="x1" min="-5" max="5" step="1"><span class="curseur-valeur" id="x1-val"></span></div></div>' +
    '<div class="curseur"><label for="x2">second zéro x₂</label><div class="curseur-row"><input type="range" id="x2" min="-5" max="5" step="1"><span class="curseur-valeur" id="x2-val"></span></div></div>' +
    '</div>' +
    '<p class="titre-ctrl">exemples</p>' +
    '<div class="barre">' +
    '<button type="button" class="btn petit" id="ex1">x² − 6x + 5</button>' +
    '<button type="button" class="btn petit" id="ex2">2x² − 8x + 3</button>' +
    '</div>' +
    '</div>';

  class TroisFormesWidget extends HTMLElement {
    constructor() {
      super();
      var sh = this.attachShadow({ mode: "open" });
      sh.appendChild(TEMPLATE.content.cloneNode(true));
      var $ = function (id) { return sh.getElementById(id); };
      this._el = {
        mSommet: $("m-sommet"), mZeros: $("m-zeros"), fDev: $("f-dev"), fCan: $("f-can"), fFac: $("f-fac"),
        eDev: $("e-dev"), eCan: $("e-can"), eFac: $("e-fac"), lDev: $("l-dev"), lCan: $("l-can"), lFac: $("l-fac"),
        graphe: $("graphe"), boutonsA: $("boutons-a"), blocSommet: $("bloc-sommet"), blocZeros: $("bloc-zeros"),
        xs: $("xs"), ys: $("ys"), x1: $("x1"), x2: $("x2"), xsVal: $("xs-val"), ysVal: $("ys-val"),
        x1Val: $("x1-val"), x2Val: $("x2-val"), ex1: $("ex1"), ex2: $("ex2"),
      };
      var self = this;
      this._boutonsA = VALEURS_A.map(function (a) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "btn"; b.textContent = nb(a);
        b.setAttribute("aria-label", "a = " + nb(a));
        b.addEventListener("click", function () { self._a = a; self._rendre(); });
        self._el.boutonsA.appendChild(b);
        return b;
      });
      this._a = 1; this._mode = "sommet"; this._forme = "dev";
      this._xs = 3; this._ys = -4; this._x1 = 1; this._x2 = 5;
    }

    connectedCallback() {
      var self = this, e = this._el;
      this._ecoutes = [
        [e.mSommet, "click", function () { self._changerMode("sommet"); }],
        [e.mZeros, "click", function () { self._changerMode("zeros"); }],
        [e.fDev, "click", function () { self._forme = "dev"; self._rendre(); }],
        [e.fCan, "click", function () { self._forme = "can"; self._rendre(); }],
        [e.fFac, "click", function () { self._forme = "fac"; self._rendre(); }],
        [e.xs, "input", function () { self._xs = parseFloat(e.xs.value); self._rendre(); }],
        [e.ys, "input", function () { self._ys = parseFloat(e.ys.value); self._rendre(); }],
        [e.x1, "input", function () { self._x1 = parseFloat(e.x1.value); self._rendre(); }],
        [e.x2, "input", function () { self._x2 = parseFloat(e.x2.value); self._rendre(); }],
        [e.ex1, "click", function () { self._exemple(1, 3, -4); }],
        [e.ex2, "click", function () { self._exemple(2, 2, -5); }],
      ];
      this._ecoutes.forEach(function (t) { t[0].addEventListener(t[1], t[2]); });
      this._rendre();
    }

    disconnectedCallback() {
      (this._ecoutes || []).forEach(function (t) { t[0].removeEventListener(t[1], t[2]); });
    }

    _exemple(a, xs, ys) {
      this._a = a; this._mode = "sommet"; this._xs = xs; this._ys = ys;
      this._rendre();
    }

    // Conserve au mieux la parabole en changeant de mode (les curseurs ont des pas différents).
    _changerMode(mode) {
      if (mode === this._mode) return;
      var p = this._parametres();
      if (mode === "zeros") {
        if (p.zeros && p.zeros.length) {
          var z = p.zeros.length === 2 ? p.zeros : [p.zeros[0], p.zeros[0]];
          this._x1 = Math.max(-5, Math.min(5, Math.round(z[0])));
          this._x2 = Math.max(-5, Math.min(5, Math.round(z[1])));
        } else { this._x1 = -1; this._x2 = 3; }
      } else {
        this._xs = Math.max(-4, Math.min(4, Math.round(p.xs * 2) / 2));
        this._ys = Math.max(-6, Math.min(6, Math.round(p.ys * 2) / 2));
      }
      this._mode = mode;
      this._rendre();
    }

    _parametres() {
      var a = this._a, xs, ys, zeros, exact = true;
      if (this._mode === "zeros") {
        var g = Math.min(this._x1, this._x2), d = Math.max(this._x1, this._x2);
        xs = (g + d) / 2; ys = -a * (d - g) * (d - g) / 4;
        zeros = Math.abs(d - g) < EPS ? [g] : [g, d];
      } else {
        xs = this._xs; ys = this._ys;
        var r = -ys / a;
        if (r < -EPS) zeros = [];
        else if (Math.abs(r) < EPS) zeros = [xs];
        else {
          var s = Math.sqrt(r);
          exact = estEntier(s * 4);
          zeros = [xs - s, xs + s];
        }
      }
      return { a: a, b: -2 * a * xs, c: a * xs * xs + ys, xs: xs, ys: ys, zeros: zeros, exact: exact };
    }

    _rendre() {
      var e = this._el, p = this._parametres(), a = p.a;
      var self = this;
      e.mSommet.setAttribute("aria-pressed", String(this._mode === "sommet"));
      e.mZeros.setAttribute("aria-pressed", String(this._mode === "zeros"));
      e.blocSommet.hidden = this._mode !== "sommet";
      e.blocZeros.hidden = this._mode !== "zeros";
      this._boutonsA.forEach(function (b, i) { b.setAttribute("aria-pressed", String(VALEURS_A[i] === self._a)); });
      [["dev", e.fDev], ["can", e.fCan], ["fac", e.fFac]].forEach(function (t) { t[1].setAttribute("aria-pressed", String(t[0] === self._forme)); });
      e.xs.value = String(this._xs); e.ys.value = String(this._ys);
      e.x1.value = String(this._x1); e.x2.value = String(this._x2);
      e.xsVal.textContent = nb(this._xs); e.ysVal.textContent = nb(this._ys);
      e.x1Val.textContent = nb(this._x1); e.x2Val.textContent = nb(this._x2);

      // Forme développée
      e.eDev.textContent = "f(x) = " + polynome(a, p.b, p.c);
      e.lDev.textContent = "c = " + nb(p.c) + " : la parabole coupe l'axe y en (0 ; " + nb(p.c) + ")" +
        (dansFenetre(0, p.c) ? "" : " — hors de la fenêtre");

      // Forme canonique
      var can = coefTete(a) + (Math.abs(p.xs) < EPS ? "x²" : facteur(p.xs) + "²");
      if (Math.abs(p.ys) > EPS) can += (p.ys > 0 ? " + " : " − ") + nb(Math.abs(p.ys));
      e.eCan.textContent = "f(x) = " + can;
      e.lCan.textContent = "sommet S(" + nb(p.xs) + " ; " + nb(p.ys) + "), axe de symétrie x = " + nb(p.xs) +
        (dansFenetre(p.xs, p.ys) ? "" : " — sommet hors de la fenêtre");

      // Forme factorisée
      if (p.zeros.length === 0) {
        e.eFac.textContent = "pas de forme factorisée réelle";
        e.lFac.textContent = "a et l'ordonnée du sommet ont le même signe : la parabole ne coupe pas l'axe x, aucun zéro (Δ < 0)";
      } else if (p.zeros.length === 1) {
        var r0 = p.zeros[0];
        e.eFac.textContent = "f(x) = " + coefTete(a) + (Math.abs(r0) < EPS ? "x²" : facteur(r0) + "²");
        e.lFac.textContent = "un seul zéro (racine double) : x = " + nb(r0) + ", le sommet est sur l'axe x (Δ = 0)";
      } else if (p.exact) {
        e.eFac.textContent = "f(x) = " + coefTete(a) + facteur(p.zeros[0]) + facteur(p.zeros[1]);
        e.lFac.textContent = "zéros x₁ = " + nb(p.zeros[0]) + " et x₂ = " + nb(p.zeros[1]) + " : la parabole coupe l'axe x en ces points";
      } else {
        e.eFac.textContent = "f(x) ≈ " + coefTete(a) + facteur(p.zeros[0], nb2) + facteur(p.zeros[1], nb2);
        var rad = radical(-p.ys / a);
        e.lFac.textContent = "zéros exacts x₁,₂ = " + (Math.abs(p.xs) < EPS ? "±" : nb(p.xs) + " ± ") + rad +
          ", soit x₁ ≈ " + nb2(p.zeros[0]) + " et x₂ ≈ " + nb2(p.zeros[1]);
      }

      this._dessiner(p);
    }

    _dessiner(p) {
      var svg = this._el.graphe, forme = this._forme;
      svg.innerHTML = "";
      var defs = svgEl("defs", {});
      var mk = svgEl("marker", { id: "fl", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      mk.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(mk); svg.appendChild(defs);
      var i, q;
      for (i = XMIN + 1; i < XMAX; i++) { q = px(i, 0)[0]; svg.appendChild(svgEl("line", { x1: q, x2: q, y1: MARGE, y2: HAUTEUR - MARGE, class: "grille" })); }
      for (i = YMIN + 1; i < YMAX; i++) { q = px(0, i)[1]; svg.appendChild(svgEl("line", { x1: MARGE, x2: LARGEUR - MARGE, y1: q, y2: q, class: "grille" })); }
      var o = px(0, 0);
      svg.appendChild(svgEl("line", { x1: MARGE, x2: LARGEUR - 4, y1: o[1], y2: o[1], class: "axe", "marker-end": "url(#fl)" }));
      svg.appendChild(svgEl("line", { x1: o[0], x2: o[0], y1: HAUTEUR - MARGE, y2: 4, class: "axe", "marker-end": "url(#fl)" }));
      var tx = svgEl("text", { x: LARGEUR - 12, y: o[1] - 8, class: "etiquette" }); tx.textContent = "x"; svg.appendChild(tx);
      var ty = svgEl("text", { x: o[0] + 8, y: 14, class: "etiquette" }); ty.textContent = "y"; svg.appendChild(ty);
      for (i = XMIN + 1; i < XMAX; i++) {
        if (i === 0 || i % 2) continue;
        q = px(i, 0);
        var t = svgEl("text", { x: q[0], y: q[1] + 15, class: "etiquette", "text-anchor": "middle" }); t.textContent = nb(i); svg.appendChild(t);
      }
      for (i = YMIN + 2; i < YMAX; i += 2) {
        if (i === 0) continue;
        q = px(0, i);
        var t2 = svgEl("text", { x: q[0] - 6, y: q[1] + 4, class: "etiquette", "text-anchor": "end" }); t2.textContent = nb(i); svg.appendChild(t2);
      }

      // courbe (échantillonnée, coupée hors fenêtre)
      var d = "", dedans = false;
      for (i = 0; i <= 280; i++) {
        var x = XMIN + i / 280 * (XMAX - XMIN), y = p.a * x * x + p.b * x + p.c;
        if (y < YMIN - 1 || y > YMAX + 1) { dedans = false; continue; }
        var pt = px(x, y);
        d += (dedans ? "L" : "M") + pt[0].toFixed(1) + " " + pt[1].toFixed(1) + " ";
        dedans = true;
      }
      var clip = svgEl("clipPath", { id: "cadre" });
      clip.appendChild(svgEl("rect", { x: MARGE, y: MARGE, width: LARGEUR - 2 * MARGE, height: HAUTEUR - 2 * MARGE }));
      defs.appendChild(clip);
      svg.appendChild(svgEl("path", { d: d, class: "courbe", "clip-path": "url(#cadre)" }));

      function point(x, y, cls, etiquette, dx, dy, ancre) {
        if (!dansFenetre(x, y)) return;
        var c = px(x, y);
        svg.appendChild(svgEl("circle", { cx: c[0], cy: c[1], r: 6, class: cls }));
        var lab = svgEl("text", { x: c[0] + dx, y: c[1] + dy, class: "h-txt " + cls, "text-anchor": ancre || "start" });
        lab.textContent = etiquette; svg.appendChild(lab);
      }
      if (forme === "dev") {
        point(0, p.c, "h-dev", "(0 ; " + nb(p.c) + ")", 10, p.a > 0 ? 18 : -10);
      } else if (forme === "can") {
        if (p.xs >= XMIN && p.xs <= XMAX) {
          var hx = px(p.xs, 0)[0];
          svg.appendChild(svgEl("line", { x1: hx, x2: hx, y1: MARGE, y2: HAUTEUR - MARGE, class: "h-axe" }));
          var la = svgEl("text", { x: hx + 6, y: p.a > 0 ? MARGE + 14 : HAUTEUR - MARGE - 6, class: "h-txt h-can" });
          la.textContent = "axe x = " + nb(p.xs); svg.appendChild(la);
        }
        point(p.xs, p.ys, "h-can", "S(" + nb(p.xs) + " ; " + nb(p.ys) + ")", 0, p.a > 0 ? 22 : -12, "middle");
      } else {
        var noms = p.zeros.length === 2 ? ["x₁", "x₂"] : ["x₀"];
        var fmt = p.exact ? nb : function (v) { return "≈ " + nb2(v); };
        p.zeros.forEach(function (z, k) {
          var seul = p.zeros.length === 1;
          point(z, 0, "h-fac", noms[k] + (p.exact ? " = " : " ") + fmt(z), seul ? 0 : (k ? 4 : -4), p.a > 0 ? 22 : -12,
            seul ? "middle" : (k ? "start" : "end"));
        });
      }
    }
  }

  if (!customElements.get("trois-formes-widget")) customElements.define("trois-formes-widget", TroisFormesWidget);
})();
