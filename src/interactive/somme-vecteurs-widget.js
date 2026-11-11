(function () {
  "use strict";

  /* ================================================================
   * <somme-vecteurs-widget> — atelier « Somme et différence de deux
   * vecteurs » (4e, calcul vectoriel). Deux vecteurs u et v déplaçables
   * sur un quadrillage (poignées à leur extrémité, au doigt, à la souris
   * ou au clavier), trois opérations (u + v, u − v, v + u) et deux
   * méthodes (triangle : bout à bout ; parallélogramme : même origine).
   * La construction est dessinée en pointillés, le résultat en couleur,
   * et le calcul composante par composante est affiché sous la figure.
   * Réglage par défaut u(2 ; 3), v(−1 ; 4) : u + v = (1 ; 7),
   * u − v = (3 ; −1). Web Component (Shadow DOM), fenêtre fixe.
   * ================================================================ */

  var DEFAUT = { xu: 2, yu: 3, xv: -1, yv: 4, op: "somme", methode: "triangle" };
  var BORNE = 4; // composantes entières dans [−4 ; 4]
  var X_MIN = -9, X_MAX = 9, Y_MIN = -9, Y_MAX = 9;
  var LARGEUR = 460, HAUTEUR = 460, MARGE = 18;
  var NS = "http://www.w3.org/2000/svg";

  function fr(n) {
    var a = Math.round(n * 100) / 100;
    if (Object.is(a, -0)) a = 0;
    var s = String(Math.abs(a)).replace(".", ",");
    return (a < 0 ? "−" : "") + s;
  }
  function par(n) { return n < 0 ? "(" + fr(n) + ")" : fr(n); }
  function vec(nom) { return '<span class="vec">' + nom + "</span>"; }
  function couple(x, y) { return "(" + fr(x) + " ; " + fr(y) + ")"; }

  function el(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  var STYLE =
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}' +
    '*{box-sizing:border-box;}' +
    '.vec{display:inline-block;position:relative;font-family:var(--serif,Georgia,serif);font-style:italic;font-weight:700;padding:0 1px;line-height:1;}' +
    '.vec::before{content:"";position:absolute;left:1px;right:3px;top:-0.32em;border-top:1.5px solid currentColor;}' +
    '.vec::after{content:"";position:absolute;right:0;top:-0.32em;transform:translateY(-50%);border-left:5px solid currentColor;border-top:3.5px solid transparent;border-bottom:3.5px solid transparent;margin-top:0.75px;}' +
    '.choix{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:0 0 10px;}' +
    '.choix button{min-height:44px;min-width:44px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--line,#d9cfc2);background:var(--surface,#fff);color:var(--ink,#241f1a);font:inherit;font-size:0.92rem;cursor:pointer;}' +
    '.choix button[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);border-color:var(--accent,#a8471f);color:var(--accent-ink,#7a3212);font-weight:700;}' +
    '.choix-titre{width:100%;text-align:center;font-size:0.8rem;color:var(--ink-soft,#6b6055);margin-bottom:-2px;}' +
    '.graphe-zone{display:flex;justify-content:center;margin:4px 0 10px;}' +
    'svg{width:100%;max-width:460px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);display:block;}' +
    '.grille{stroke:var(--line,#d9cfc2);stroke-width:0.6;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}' +
    '.pointe{fill:var(--ink-soft,#6b6055);}' +
    '.v-u{stroke:var(--accent,#a8471f);stroke-width:3;}' +
    '.v-v{stroke:var(--sky,#2f6f9f);stroke-width:3;}' +
    '.v-r{stroke:var(--good,#2f7a4f);stroke-width:3.4;}' +
    '.v-moinsv{stroke:var(--sky,#2f6f9f);stroke-width:2.4;stroke-dasharray:6 4;}' +
    '.v-fantome{stroke:var(--good,#2f7a4f);stroke-width:2;stroke-dasharray:6 4;opacity:0.75;}' +
    '.constr{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;stroke-dasharray:4 4;fill:none;}' +
    '.para{fill:var(--good,#2f7a4f);opacity:0.08;}' +
    '.m-u{fill:var(--accent,#a8471f);} .m-v{fill:var(--sky,#2f6f9f);} .m-r{fill:var(--good,#2f7a4f);}' +
    '.m-ink{fill:var(--ink-soft,#6b6055);}' +
    '.poignee{cursor:grab;outline:none;}' +
    '.poignee:focus-visible .anneau{stroke:var(--ink,#241f1a);stroke-width:2.5;}' +
    '.anneau{fill:var(--surface,#fff);stroke-width:2.5;}' +
    '.zone{fill:transparent;}' +
    '.lab{font-family:var(--serif,Georgia,serif);font-style:italic;font-weight:700;font-size:16px;}' +
    '.lab-u{fill:var(--accent-ink,#7a3212);} .lab-v{fill:var(--sky-ink,#1f4e7d);} .lab-r{fill:var(--good,#2f7a4f);}' +
    '.lab-o{fill:var(--ink,#241f1a);font-style:normal;font-family:var(--sans,sans-serif);font-size:13px;}' +
    '.fleche-lab{stroke-width:1.4;fill:none;} .s-lab-u{stroke:var(--accent-ink,#7a3212);} .s-lab-v{stroke:var(--sky-ink,#1f4e7d);} .s-lab-r{stroke:var(--good,#2f7a4f);}' +
    '.reglages{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin:0 0 10px;}' +
    '.reg{display:flex;align-items:center;justify-content:space-between;gap:6px;padding:4px 8px;border-radius:var(--radius,3px);background:var(--surface-2,#faf6f0);}' +
    '.reg-nom{font-size:0.9rem;min-width:44px;}' +
    '.reg button{min-width:44px;min-height:44px;border-radius:var(--radius,3px);border:1px solid var(--line,#d9cfc2);background:var(--surface,#fff);color:var(--ink,#241f1a);font:inherit;font-size:1.1rem;cursor:pointer;}' +
    '.reg-val{min-width:32px;text-align:center;font-variant-numeric:tabular-nums;font-weight:700;}' +
    '.lecture{display:flex;flex-direction:column;gap:6px;font-variant-numeric:tabular-nums;}' +
    '.ligne{padding:9px 12px;border-radius:var(--radius,3px);background:var(--surface-2,#faf6f0);font-size:0.95rem;line-height:1.7;}' +
    '.ligne-r{border-left:4px solid var(--good,#2f7a4f);font-weight:600;}' +
    '.c-u{color:var(--accent-ink,#7a3212);} .c-v{color:var(--sky-ink,#1f4e7d);} .c-r{color:var(--good,#2f7a4f);}' +
    '.aide{font-size:0.82rem;color:var(--ink-soft,#6b6055);text-align:center;margin:0 0 8px;}' +
    '.btn-reset{display:block;margin:10px auto 0;min-height:44px;padding:8px 16px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font:inherit;font-weight:600;cursor:pointer;}';

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    "<style>" + STYLE + "</style>" +
    '<div class="choix" role="group" aria-label="Opération">' +
    '<div class="choix-titre">Opération</div>' +
    '<button type="button" data-op="somme"><span class="vec">u</span> + <span class="vec">v</span></button>' +
    '<button type="button" data-op="difference"><span class="vec">u</span> − <span class="vec">v</span></button>' +
    '<button type="button" data-op="inverse"><span class="vec">v</span> + <span class="vec">u</span></button>' +
    "</div>" +
    '<div class="choix" role="group" aria-label="Méthode">' +
    '<div class="choix-titre">Méthode</div>' +
    '<button type="button" data-methode="triangle">Triangle (bout à bout)</button>' +
    '<button type="button" data-methode="parallelogramme">Parallélogramme (même origine)</button>' +
    "</div>" +
    '<p class="aide">Fais glisser les poignées rondes au bout des vecteurs (ou utilise les boutons ci-dessous).</p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + " " + HAUTEUR + '" role="img" aria-label="Construction de la somme ou de la différence de deux vecteurs"></svg></div>' +
    '<div class="reglages" id="reglages"></div>' +
    '<div class="lecture" id="lecture" aria-live="polite"></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>';

  class SommeVecteursWidget extends HTMLElement {
    constructor() {
      super();
      var sh = this.attachShadow({ mode: "open" });
      sh.appendChild(TEMPLATE.content.cloneNode(true));
      this._sh = sh;
      this._etat = Object.assign({}, DEFAUT);
      this._svg = sh.getElementById("svg");
      this._lecture = sh.getElementById("lecture");
      this._reglages = sh.getElementById("reglages");
      this._drag = null;
    }

    connectedCallback() {
      var self = this;
      this._sh.querySelectorAll("[data-op]").forEach(function (b) {
        b.addEventListener("click", function () { self._etat.op = b.getAttribute("data-op"); self._rendre(); });
      });
      this._sh.querySelectorAll("[data-methode]").forEach(function (b) {
        b.addEventListener("click", function () { self._etat.methode = b.getAttribute("data-methode"); self._rendre(); });
      });
      this._sh.getElementById("reset").addEventListener("click", function () {
        self._etat = Object.assign({}, DEFAUT); self._rendre();
      });
      this._construireReglages();
      this._onMove = function (e) { self._deplacer(e); };
      this._onUp = function () { self._drag = null; };
      this._svg.addEventListener("pointermove", this._onMove);
      this._svg.addEventListener("pointerup", this._onUp);
      this._svg.addEventListener("pointercancel", this._onUp);
      this._rendre();
    }

    _construireReglages() {
      var self = this;
      var lignes = [["xu", "u", "x"], ["yu", "u", "y"], ["xv", "v", "x"], ["yv", "v", "y"]];
      this._reglages.innerHTML = lignes.map(function (l) {
        return '<div class="reg"><span class="reg-nom ' + (l[1] === "u" ? "c-u" : "c-v") + '">' + vec(l[1]) + " : " + l[2] + "</span>" +
          '<button type="button" data-cle="' + l[0] + '" data-pas="-1" aria-label="Diminuer la composante ' + l[2] + " de " + l[1] + '">−</button>' +
          '<span class="reg-val" id="val-' + l[0] + '"></span>' +
          '<button type="button" data-cle="' + l[0] + '" data-pas="1" aria-label="Augmenter la composante ' + l[2] + " de " + l[1] + '">+</button></div>';
      }).join("");
      this._reglages.querySelectorAll("button").forEach(function (b) {
        b.addEventListener("click", function () {
          var cle = b.getAttribute("data-cle");
          var nv = self._etat[cle] + parseInt(b.getAttribute("data-pas"), 10);
          if (nv < -BORNE || nv > BORNE) return;
          var essai = Object.assign({}, self._etat); essai[cle] = nv;
          if ((cle === "xu" || cle === "yu") && essai.xu === 0 && essai.yu === 0) return;
          if ((cle === "xv" || cle === "yv") && essai.xv === 0 && essai.yv === 0) return;
          self._etat[cle] = nv; self._rendre();
        });
      });
    }

    _px(x, y) {
      var w = LARGEUR - 2 * MARGE, h = HAUTEUR - 2 * MARGE;
      return [MARGE + (x - X_MIN) / (X_MAX - X_MIN) * w, HAUTEUR - MARGE - (y - Y_MIN) / (Y_MAX - Y_MIN) * h];
    }

    _versMath(e) {
      var pt = this._svg.createSVGPoint();
      pt.x = e.clientX; pt.y = e.clientY;
      var p = pt.matrixTransform(this._svg.getScreenCTM().inverse());
      var w = LARGEUR - 2 * MARGE, h = HAUTEUR - 2 * MARGE;
      return [X_MIN + (p.x - MARGE) / w * (X_MAX - X_MIN), Y_MIN + (HAUTEUR - MARGE - p.y) / h * (Y_MAX - Y_MIN)];
    }

    // Positions des poignées et la façon d'en déduire u ou v, selon la méthode et l'opération.
    _geometrie() {
      var s = this._etat, u = [s.xu, s.yu], v = [s.xv, s.yv];
      var tri = s.methode === "triangle";
      var g = { u: u, v: v };
      if (s.op === "inverse" && tri) {
        g.origV = [0, 0]; g.origU = v;
      } else {
        g.origU = [0, 0];
        g.origV = tri ? (s.op === "difference" ? null : u) : [0, 0];
      }
      if (s.op === "difference" && tri) {
        // u puis −v bout à bout : v n'est pas dessiné en tant que tel, sa poignée est au bout de −v
        g.moinsVOrig = u;
        g.poigneeV = [u[0] - v[0], u[1] - v[1]];
        g.depuisPoigneeV = function (p) { return [u[0] - p[0], u[1] - p[1]]; };
      } else {
        var o = g.origV;
        g.poigneeV = [o[0] + v[0], o[1] + v[1]];
        g.depuisPoigneeV = function (p) { return [p[0] - o[0], p[1] - o[1]]; };
      }
      var ou = g.origU;
      g.poigneeU = [ou[0] + u[0], ou[1] + u[1]];
      g.depuisPoigneeU = function (p) { return [p[0] - ou[0], p[1] - ou[1]]; };
      return g;
    }

    _deplacer(e) {
      if (!this._drag) return;
      var p = this._versMath(e);
      var q = [Math.round(p[0]), Math.round(p[1])];
      var g = this._geometrie();
      this._appliquer(this._drag, this._drag === "u" ? g.depuisPoigneeU(q) : g.depuisPoigneeV(q));
    }

    _appliquer(qui, c) {
      var x = Math.max(-BORNE, Math.min(BORNE, c[0])), y = Math.max(-BORNE, Math.min(BORNE, c[1]));
      if (x === 0 && y === 0) return;
      var s = this._etat;
      if (qui === "u") { if (x === s.xu && y === s.yu) return; s.xu = x; s.yu = y; }
      else { if (x === s.xv && y === s.yv) return; s.xv = x; s.yv = y; }
      this._rendre();
    }

    _fleche(a, b, classe, marqueur) {
      var pa = this._px(a[0], a[1]), pb = this._px(b[0], b[1]);
      // la pointe ne doit pas disparaître sous une poignée : on raccourcit le trait de 8 px
      var surPoignee = (this._ptsPoignees || []).some(function (q) { return q[0] === b[0] && q[1] === b[1]; });
      if (surPoignee) {
        var dx = pb[0] - pa[0], dy = pb[1] - pa[1], n = Math.hypot(dx, dy);
        if (n > 12) { pb = [pb[0] - dx / n * 8, pb[1] - dy / n * 8]; }
      }
      this._svg.appendChild(el("line", { x1: pa[0].toFixed(1), y1: pa[1].toFixed(1), x2: pb[0].toFixed(1), y2: pb[1].toFixed(1), class: classe, "marker-end": marqueur ? "url(#" + marqueur + ")" : "" }));
    }

    _etiquette(milieuMath, direction, nom, classe) {
      // Nom posé à côté du milieu du vecteur, du côté gauche de « direction », assez loin pour ne
      // jamais toucher le trait ; chaque lettre de vecteur (u, v) reçoit sa propre flèche.
      var svg = this._svg;
      var g = el("g", {});
      svg.appendChild(g);
      var x = 0, morceaux = [];
      for (var i = 0; i < nom.length; i++) {
        var c = nom[i];
        var t = el("text", { x: x.toFixed(1), y: "0", class: "lab " + classe });
        t.textContent = c === " " ? " " : c;
        g.appendChild(t);
        var w = 0;
        try { w = t.getComputedTextLength(); } catch (err) { w = 0; }
        if (!w) w = c === " " ? 4 : (c === "u" || c === "v" ? 9 : 10);
        morceaux.push([c, x, w]);
        x += w;
      }
      var total = x;
      morceaux.forEach(function (m) {
        if (m[0] !== "u" && m[0] !== "v") return;
        var x1 = m[1] + 0.5, x2 = m[1] + m[2] - 0.5, yf = -15;
        g.appendChild(el("line", { x1: x1.toFixed(1), y1: yf, x2: (x2 - 3).toFixed(1), y2: yf, class: "fleche-lab s-" + classe }));
        g.appendChild(el("path", { d: "M" + (x2 + 1).toFixed(1) + "," + yf + " l-5,-3 l0,6 z", class: classe }));
      });
      var p = this._px(milieuMath[0], milieuMath[1]);
      var dx = direction[0], dy = -direction[1], n = Math.hypot(dx, dy) || 1;
      var nx = dy / n, ny = -dx / n; // normale à gauche du sens de parcours (repère écran)
      var d = (total / 2) * Math.abs(nx) + 11 * Math.abs(ny) + 9;
      var cx = p[0] + nx * d, cy = p[1] + ny * d;
      g.setAttribute("transform", "translate(" + (cx - total / 2).toFixed(1) + "," + (cy + 5).toFixed(1) + ")");
    }

    _poignee(pos, qui, classeAnneau) {
      var self = this;
      var p = this._px(pos[0], pos[1]);
      var g = el("g", { class: "poignee", tabindex: "0", role: "slider", "aria-label": "Extrémité du vecteur " + qui + " — flèches du clavier pour déplacer", style: "touch-action:none" });
      g.appendChild(el("circle", { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: 22, class: "zone" }));
      g.appendChild(el("circle", { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: 7, class: "anneau", stroke: classeAnneau }));
      g.addEventListener("pointerdown", function (e) {
        e.preventDefault();
        self._drag = qui;
        try { self._svg.setPointerCapture(e.pointerId); } catch (err) { /* rien */ }
      });
      g.addEventListener("keydown", function (e) {
        var d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
        if (!d) return;
        e.preventDefault();
        var s = self._etat;
        var cible = qui === "u" ? [s.xu + d[0], s.yu + d[1]] : [s.xv + d[0], s.yv + d[1]];
        if (qui === "v" && s.op === "difference" && s.methode === "triangle") cible = [s.xv - d[0], s.yv - d[1]];
        self._focus = qui;
        self._appliquer(qui, cible);
      });
      this._svg.appendChild(g);
      return g;
    }

    _rendre() {
      var s = this._etat, sh = this._sh;
      sh.querySelectorAll("[data-op]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-op") === s.op)); });
      sh.querySelectorAll("[data-methode]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-methode") === s.methode)); });
      ["xu", "yu", "xv", "yv"].forEach(function (k) { sh.getElementById("val-" + k).textContent = fr(s[k]); });

      var svg = this._svg;
      svg.innerHTML = "";
      var defs = el("defs", {});
      [["p-ink", "m-ink"], ["p-u", "m-u"], ["p-v", "m-v"], ["p-r", "m-r"]].forEach(function (m) {
        var mk = el("marker", { id: m[0], markerWidth: "10", markerHeight: "10", refX: "7", refY: "5", orient: "auto", markerUnits: "userSpaceOnUse" });
        mk.appendChild(el("path", { d: "M0,0.5 L9,5 L0,9.5 Z", class: m[1] }));
        defs.appendChild(mk);
      });
      svg.appendChild(defs);
      // quadrillage et axes
      for (var i = X_MIN; i <= X_MAX; i++) {
        var a = this._px(i, Y_MIN), b = this._px(i, Y_MAX);
        svg.appendChild(el("line", { x1: a[0].toFixed(1), y1: a[1].toFixed(1), x2: b[0].toFixed(1), y2: b[1].toFixed(1), class: "grille" }));
      }
      for (var j = Y_MIN; j <= Y_MAX; j++) {
        var c = this._px(X_MIN, j), d = this._px(X_MAX, j);
        svg.appendChild(el("line", { x1: c[0].toFixed(1), y1: c[1].toFixed(1), x2: d[0].toFixed(1), y2: d[1].toFixed(1), class: "grille" }));
      }
      var o = this._px(0, 0);
      svg.appendChild(el("line", { x1: MARGE, y1: o[1].toFixed(1), x2: LARGEUR - MARGE + 4, y2: o[1].toFixed(1), class: "axe", "marker-end": "url(#p-ink)" }));
      svg.appendChild(el("line", { x1: o[0].toFixed(1), y1: HAUTEUR - MARGE, x2: o[0].toFixed(1), y2: MARGE - 4, class: "axe", "marker-end": "url(#p-ink)" }));

      var g = this._geometrie();
      var u = g.u, v = g.v;
      this._ptsPoignees = [g.poigneeU, g.poigneeV];
      var tri = s.methode === "triangle";
      var res, nomRes;
      if (s.op === "difference") { res = [u[0] - v[0], u[1] - v[1]]; nomRes = "u − v"; }
      else { res = [u[0] + v[0], u[1] + v[1]]; nomRes = s.op === "inverse" ? "v + u" : "u + v"; }
      var somme = [u[0] + v[0], u[1] + v[1]];

      if (s.op === "difference") {
        var mv = [-v[0], -v[1]];
        if (tri) {
          // u, puis −v bout à bout ; résultat de O à u − v
          this._fleche([0, 0], u, "v-u", "p-u");
          this._fleche(u, res, "v-moinsv", "p-v");
          this._fleche([0, 0], res, "v-r", "p-r");
          this._etiquette([u[0] / 2, u[1] / 2], u, "u", "lab-u");
          this._etiquette([u[0] + mv[0] / 2, u[1] + mv[1] / 2], mv, "−v", "lab-v");
          this._etiquette([res[0] / 2, res[1] / 2], [-res[0], -res[1]], "u − v", "lab-r");
        } else {
          // même origine : u, v, −v ; parallélogramme sur u et −v ; représentant de l'extrémité de v à celle de u
          var poly = [[0, 0], u, res, mv].map(function (q) { return this._px(q[0], q[1]).map(function (n) { return n.toFixed(1); }).join(","); }, this).join(" ");
          svg.appendChild(el("polygon", { points: poly, class: "para" }));
          svg.appendChild(el("polyline", { points: [u, res, mv].map(function (q) { return this._px(q[0], q[1]).map(function (n) { return n.toFixed(1); }).join(","); }, this).join(" "), class: "constr" }));
          this._fleche([0, 0], mv, "v-moinsv", "p-v");
          this._fleche([0, 0], u, "v-u", "p-u");
          this._fleche([0, 0], v, "v-v", "p-v");
          this._fleche([0, 0], res, "v-r", "p-r");
          this._fleche(v, u, "v-fantome", "p-r");
          this._etiquette([u[0] / 2, u[1] / 2], u, "u", "lab-u");
          this._etiquette([v[0] / 2, v[1] / 2], [-v[0], -v[1]], "v", "lab-v");
          this._etiquette([mv[0] / 2, mv[1] / 2], mv, "−v", "lab-v");
          this._etiquette([res[0] / 2, res[1] / 2], [-res[0], -res[1]], "u − v", "lab-r");
        }
      } else if (tri) {
        var premier = s.op === "inverse" ? v : u, second = s.op === "inverse" ? u : v;
        if (s.op === "inverse") {
          // fantôme du chemin u puis v : même point d'arrivée
          this._fleche([0, 0], u, "constr", "");
          this._fleche(u, somme, "constr", "");
        }
        this._fleche([0, 0], premier, s.op === "inverse" ? "v-v" : "v-u", s.op === "inverse" ? "p-v" : "p-u");
        this._fleche(premier, somme, s.op === "inverse" ? "v-u" : "v-v", s.op === "inverse" ? "p-u" : "p-v");
        this._fleche([0, 0], somme, "v-r", "p-r");
        this._etiquette([premier[0] / 2, premier[1] / 2], premier, s.op === "inverse" ? "v" : "u", s.op === "inverse" ? "lab-v" : "lab-u");
        this._etiquette([premier[0] + second[0] / 2, premier[1] + second[1] / 2], second, s.op === "inverse" ? "u" : "v", s.op === "inverse" ? "lab-u" : "lab-v");
        this._etiquette([somme[0] / 2, somme[1] / 2], [-somme[0], -somme[1]], nomRes, "lab-r");
      } else {
        var pts = [[0, 0], u, somme, v].map(function (q) { return this._px(q[0], q[1]).map(function (n) { return n.toFixed(1); }).join(","); }, this).join(" ");
        svg.appendChild(el("polygon", { points: pts, class: "para" }));
        svg.appendChild(el("polyline", { points: [u, somme, v].map(function (q) { return this._px(q[0], q[1]).map(function (n) { return n.toFixed(1); }).join(","); }, this).join(" "), class: "constr" }));
        this._fleche([0, 0], u, "v-u", "p-u");
        this._fleche([0, 0], v, "v-v", "p-v");
        this._fleche([0, 0], somme, "v-r", "p-r");
        this._etiquette([u[0] / 2, u[1] / 2], u, "u", "lab-u");
        this._etiquette([v[0] / 2, v[1] / 2], [-v[0], -v[1]], "v", "lab-v");
        this._etiquette([somme[0] / 2, somme[1] / 2], [-somme[0], -somme[1]], nomRes, "lab-r");
      }
      var lo = el("text", { x: (o[0] - 8).toFixed(1), y: (o[1] + 15).toFixed(1), "text-anchor": "end", class: "lab-o" });
      lo.textContent = "O";
      svg.appendChild(lo);

      var hu = this._poignee(g.poigneeU, "u", "var(--accent,#a8471f)");
      var hv = this._poignee(g.poigneeV, "v", "var(--sky,#2f6f9f)");
      if (this._focus) { (this._focus === "u" ? hu : hv).focus(); this._focus = null; }

      this._lecture.innerHTML = this._texte(u, v, res);
    }

    _texte(u, v, res) {
      var s = this._etat;
      var l1 = '<div class="ligne"><span class="c-u">' + vec("u") + " " + couple(u[0], u[1]) + '</span> et <span class="c-v">' + vec("v") + " " + couple(v[0], v[1]) + "</span></div>";
      var calc, methode;
      if (s.op === "somme" || s.op === "inverse") {
        var p = s.op === "somme" ? [u, v, vec("u") + " + " + vec("v")] : [v, u, vec("v") + " + " + vec("u")];
        calc = '<div class="ligne ligne-r"><span class="c-r">' + p[2] + "</span> = (" + fr(p[0][0]) + " + " + par(p[1][0]) + " ; " + fr(p[0][1]) + " + " + par(p[1][1]) + ") = <span class=\"c-r\">" + couple(res[0], res[1]) + "</span></div>";
        if (s.op === "inverse") calc += '<div class="ligne">Même résultat que ' + vec("u") + " + " + vec("v") + " : l'ordre ne change pas la somme (" + vec("u") + " + " + vec("v") + " = " + vec("v") + " + " + vec("u") + ").</div>";
        methode = s.methode === "triangle"
          ? (s.op === "inverse"
            ? "Méthode du triangle : " + vec("u") + " est placé au bout de " + vec("v") + ". Le chemin en pointillés (" + vec("u") + " puis " + vec("v") + ") arrive exactement au même point."
            : "Méthode du triangle : " + vec("v") + " est placé au bout de " + vec("u") + ". La somme va du point de départ au point d'arrivée.")
          : "Méthode du parallélogramme : " + vec("u") + " et " + vec("v") + " partent du même point. La somme est la diagonale du parallélogramme construit sur eux" + (s.op === "inverse" ? " — la même diagonale, que l'on parte de " + vec("u") + " ou de " + vec("v") + "." : ".");
      } else {
        calc = '<div class="ligne ligne-r"><span class="c-r">' + vec("u") + " − " + vec("v") + "</span> = (" + fr(u[0]) + " − " + par(v[0]) + " ; " + fr(u[1]) + " − " + par(v[1]) + ") = <span class=\"c-r\">" + couple(res[0], res[1]) + "</span></div>" +
          '<div class="ligne">Soustraire, c\'est ajouter l\'opposé : ' + vec("u") + " − " + vec("v") + " = " + vec("u") + " + (−" + vec("v") + "), avec −" + vec("v") + " " + couple(-v[0], -v[1]) + ".</div>";
        methode = s.methode === "triangle"
          ? "Méthode du triangle : −" + vec("v") + " (même direction que " + vec("v") + ", sens contraire) est placé au bout de " + vec("u") + "."
          : "Même origine : " + vec("u") + " − " + vec("v") + " est la diagonale du parallélogramme construit sur " + vec("u") + " et −" + vec("v") + ". Le vecteur en pointillés verts, qui va de l'extrémité de " + vec("v") + " à celle de " + vec("u") + ", est le même vecteur, dessiné ailleurs.";
      }
      return l1 + calc + '<div class="ligne">' + methode + "</div>";
    }
  }

  if (!customElements.get("somme-vecteurs-widget")) {
    customElements.define("somme-vecteurs-widget", SommeVecteursWidget);
  }
})();
