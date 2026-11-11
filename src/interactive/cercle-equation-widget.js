(function () {
  "use strict";

  /* ================================================================
   * <cercle-equation-widget> — atelier interactif (4e, ch. 7, § 8).
   * Mode « Centre et rayon » : centre (entier) et rayon (entier) réglables
   * → forme centre-rayon et forme développée x² + y² + Dx + Ey + F = 0 ;
   * option « tangente » : un point P à coordonnées entières du cercle,
   * le rayon CP et la tangente perpendiculaire avec son équation.
   * Mode « Équation développée » : D, E, F réglables → complétion du
   * carré pas à pas, centre (−D/2 ; −E/2), r² = D²/4 + E²/4 − F ;
   * r² < 0 : aucun point ; r² = 0 : un seul point ; sinon rayon exact.
   * Défaut : centre (2 ; −3), r = 5 ↔ x² + y² − 4x + 6y − 12 = 0.
   * Fenêtre FIXE, repère orthonormé. Web Component (Shadow DOM).
   * ================================================================ */

  var SVGNS = "http://www.w3.org/2000/svg";
  var X_MIN = -9, X_MAX = 9, Y_MIN = -9, Y_MAX = 9;
  var UNITE = 17, MARGE = 14;
  var LARGEUR = (X_MAX - X_MIN) * UNITE + 2 * MARGE;
  var HAUTEUR = (Y_MAX - Y_MIN) * UNITE + 2 * MARGE;
  var BORNE_C = 5;

  function defaut() { return { mode: "cr", a: 2, b: -3, r: 5, tangente: false, idx: null, D: -4, E: 6, F: -12 }; }

  function arrondi(v, n) { var f = Math.pow(10, n); return Math.round(v * f) / f; }
  function estExact(v, n) { return Math.abs(v - arrondi(v, n)) < 1e-9; }
  function nb(v, n) {
    if (n === undefined) n = 2;
    var r = arrondi(v, n);
    if (Math.abs(r) < 1e-12) r = 0;
    return String(r).replace(".", ",").replace("-", "−");
  }
  function pgcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a; }
  // √n = k√m
  function simplifieRacine(n) {
    var k = 1, m = n;
    for (var d = 2; d * d <= m; d++) { while (m % (d * d) === 0) { m /= d * d; k *= d; } }
    return [k, m];
  }
  // texte exact de √n / 2 (n entier > 0)
  function racineSur2(n) {
    var km = simplifieRacine(n), k = km[0], m = km[1];
    if (m === 1) return nb(k / 2);
    if (k % 2 === 0) { var q = k / 2; return (q === 1 ? "" : q) + "√" + m; }
    return (k === 1 ? "" : k) + "√" + m + "/2";
  }
  // « (x − 2)² », « x² »
  function carre(lettre, c) {
    if (Math.abs(c) < 1e-12) return lettre + "²";
    return "(" + lettre + (c > 0 ? " − " : " + ") + nb(Math.abs(c)) + ")²";
  }
  // terme « + 4x », « − x », « + 6 » (premier : sans « + »)
  function terme(coef, lettre, premier) {
    if (Math.abs(coef) < 1e-12) return "";
    var signe = coef < 0 ? (premier ? "−" : " − ") : (premier ? "" : " + ");
    var abs = Math.abs(coef);
    var corps = lettre ? (abs === 1 ? lettre : nb(abs) + lettre) : nb(abs);
    return signe + corps;
  }
  function developpee(D, E, F) {
    return "x² + y²" + terme(D, "x") + terme(E, "y") + terme(F, "") + " = 0";
  }
  function implicite(a, b, c) {
    var s = terme(a, "x", true);
    s += terme(b, "y", s === "");
    s += terme(c, "", s === "");
    return (s || "0") + " = 0";
  }

  function el(tag, attrs, parent) {
    var e = document.createElementNS(SVGNS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#182430);}' +
    '*{box-sizing:border-box;}' +
    '[hidden]{display:none !important;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:10px;}' +
    'svg{width:100%;max-width:460px;height:auto;background:var(--surface-2,#f7f9fb);border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);}' +
    '.grille{stroke:var(--line,#ccd8e0);stroke-width:0.6;}' +
    '.axe{stroke:var(--ink-soft,#51626f);stroke-width:1.3;}' +
    '.fleche-axe{fill:var(--ink-soft,#51626f);}' +
    '.graduation{font-size:11px;fill:var(--ink-soft,#51626f);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.cercle{fill:var(--accent,#b65c1f);fill-opacity:0.06;stroke:var(--accent,#b65c1f);stroke-width:2.6;}' +
    '.rayon{stroke:var(--good,#2f7a4f);stroke-width:2.2;}' +
    '.tangente{stroke:var(--plan,#5b4ea3);stroke-width:2.2;}' +
    '.angle-droit{fill:none;stroke:var(--plan,#5b4ea3);stroke-width:1.3;}' +
    '.point{fill:var(--ink,#182430);}' +
    '.point-p{fill:var(--good,#2f7a4f);}' +
    '.point-seul{fill:var(--bad,#b23a3a);}' +
    '.etiq{font-size:14px;font-weight:700;fill:var(--ink,#182430);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.etiq-p{fill:var(--good,#2f7a4f);}' +
    '.lecture{display:flex;flex-direction:column;gap:8px;margin:0 auto 14px;max-width:620px;font-variant-numeric:tabular-nums;}' +
    '.carte{padding:10px 12px;border-radius:var(--radius,3px);background:var(--surface-2,#f7f9fb);border:1px solid var(--line,#ccd8e0);line-height:1.6;font-size:0.95rem;overflow-wrap:anywhere;}' +
    '.carte-titre{font-weight:700;font-size:0.82rem;color:var(--ink-soft,#51626f);margin-bottom:4px;}' +
    '.eq{font-size:1.05rem;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.eq-t{font-weight:700;color:var(--plan,#5b4ea3);}' +
    '.etape{display:block;}' +
    '.note{font-size:0.85rem;color:var(--ink-soft,#51626f);}' +
    '.alerte{color:var(--bad,#b23a3a);font-weight:700;}' +
    '.controles{display:flex;flex-direction:column;gap:10px;align-items:stretch;max-width:620px;margin:0 auto;}' +
    '.zone{display:flex;flex-direction:column;gap:10px;align-items:stretch;}' +
    '.rangee{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-items:center;}' +
    '.libelle{font-size:0.88rem;color:var(--ink-soft,#51626f);font-weight:600;}' +
    '.btn{min-height:44px;min-width:44px;padding:8px 12px;border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);background:var(--surface,#fff);color:var(--ink,#182430);font-weight:600;cursor:pointer;font-family:inherit;font-size:0.95rem;}' +
    '.btn[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);border-color:var(--accent,#b65c1f);color:var(--accent-ink,#7a3212);}' +
    '.btn:focus-visible,input:focus-visible{outline:2px solid var(--accent,#b65c1f);outline-offset:2px;}' +
    '.btn-reset{background:var(--accent-soft,#f6e2d3);border-color:var(--accent-soft-line,#e8c4a4);color:var(--accent-ink,#7a3212);align-self:center;}' +
    '.curseur{display:flex;flex-direction:column;gap:2px;}' +
    '.curseur label{font-size:0.88rem;font-weight:600;color:var(--ink-soft,#51626f);}' +
    'input[type=range]{width:100%;margin:0;min-height:44px;accent-color:var(--accent,#b65c1f);}' +
    '.case{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 12px;border:1px solid var(--line,#ccd8e0);border-radius:var(--radius,3px);background:var(--surface,#fff);font-weight:600;cursor:pointer;align-self:center;}' +
    '.case input{width:20px;height:20px;accent-color:var(--accent,#b65c1f);}' +
    '</style>' +
    '<div class="rangee" style="margin-bottom:10px"><span class="libelle">Partir de :</span>' +
    '<button class="btn" type="button" data-mode="cr">Centre et rayon</button>' +
    '<button class="btn" type="button" data-mode="dev">Équation développée</button></div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" role="img" aria-label="Cercle dans un repère"></svg></div>' +
    '<div class="lecture" id="lecture" aria-live="polite"></div>' +
    '<div class="controles">' +
    '<div id="zone-cr" class="zone">' +
    '<div class="rangee"><span class="libelle">Centre C :</span>' +
    '<button class="btn" type="button" data-dx="-1" data-dy="0" aria-label="Centre vers la gauche">←</button>' +
    '<button class="btn" type="button" data-dx="0" data-dy="1" aria-label="Centre vers le haut">↑</button>' +
    '<button class="btn" type="button" data-dx="0" data-dy="-1" aria-label="Centre vers le bas">↓</button>' +
    '<button class="btn" type="button" data-dx="1" data-dy="0" aria-label="Centre vers la droite">→</button></div>' +
    '<div class="curseur"><label for="r" id="label-r">Rayon r</label><input type="range" id="r" min="1" max="6" step="1"></div>' +
    '<label class="case"><input type="checkbox" id="tangente"> Tangente en un point</label>' +
    '<div class="rangee" id="zone-p" hidden>' +
    '<button class="btn" type="button" id="p-prec">◀ Point précédent</button>' +
    '<button class="btn" type="button" id="p-suiv">Point suivant ▶</button></div>' +
    '</div>' +
    '<div id="zone-dev" class="zone" hidden>' +
    '<div class="curseur"><label for="D" id="label-D">D</label><input type="range" id="D" min="-10" max="10" step="1"></div>' +
    '<div class="curseur"><label for="E" id="label-E">E</label><input type="range" id="E" min="-10" max="10" step="1"></div>' +
    '<div class="curseur"><label for="F" id="label-F">F</label><input type="range" id="F" min="-30" max="30" step="1"></div>' +
    '</div>' +
    '<button class="btn btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class CercleEquationWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._svg = shadow.getElementById("svg");
      this._lecture = shadow.getElementById("lecture");
      this._etat = defaut();
      this._ecouteurs = [];
    }

    connectedCallback() {
      var self = this, sh = this.shadowRoot;
      function ecoute(c, t, f) { c.addEventListener(t, f); self._ecouteurs.push([c, t, f]); }
      Array.prototype.forEach.call(sh.querySelectorAll("[data-mode]"), function (b) {
        ecoute(b, "click", function () { self._etat.mode = b.getAttribute("data-mode"); self._rendre(); });
      });
      Array.prototype.forEach.call(sh.querySelectorAll("[data-dx]"), function (b) {
        ecoute(b, "click", function () {
          var E = self._etat;
          E.a = Math.max(-BORNE_C, Math.min(BORNE_C, E.a + parseInt(b.getAttribute("data-dx"), 10)));
          E.b = Math.max(-BORNE_C, Math.min(BORNE_C, E.b + parseInt(b.getAttribute("data-dy"), 10)));
          self._rendre();
        });
      });
      ecoute(sh.getElementById("r"), "input", function (e) { self._etat.r = parseInt(e.target.value, 10); self._etat.idx = null; self._rendre(); });
      ecoute(sh.getElementById("tangente"), "change", function (e) { self._etat.tangente = e.target.checked; self._rendre(); });
      ecoute(sh.getElementById("p-prec"), "click", function () { self._etat.idx = (self._etat.idx || 0) - 1; self._rendre(); });
      ecoute(sh.getElementById("p-suiv"), "click", function () { self._etat.idx = (self._etat.idx || 0) + 1; self._rendre(); });
      ["D", "E", "F"].forEach(function (id) {
        ecoute(sh.getElementById(id), "input", function (e) { self._etat[id] = parseInt(e.target.value, 10); self._rendre(); });
      });
      ecoute(sh.getElementById("reset"), "click", function () { var m = self._etat.mode; self._etat = defaut(); self._etat.mode = m; self._rendre(); });
      this._rendre();
    }

    disconnectedCallback() {
      this._ecouteurs.forEach(function (t) { t[0].removeEventListener(t[1], t[2]); });
      this._ecouteurs = [];
    }

    _px(x, y) { return [MARGE + (x - X_MIN) * UNITE, MARGE + (Y_MAX - y) * UNITE]; }

    // points à coordonnées entières du cercle de rayon entier r, triés par angle
    _pointsEntiers(r) {
      var l = [];
      for (var dx = -r; dx <= r; dx++) {
        var q = r * r - dx * dx, dy = Math.round(Math.sqrt(q));
        if (dy * dy !== q) continue;
        l.push([dx, dy]);
        if (dy !== 0) l.push([dx, -dy]);
      }
      l.sort(function (u, v) {
        var au = Math.atan2(u[1], u[0]), av = Math.atan2(v[1], v[0]);
        if (au < 0) au += 2 * Math.PI; if (av < 0) av += 2 * Math.PI;
        return au - av;
      });
      return l;
    }

    _rendre() {
      var sh = this.shadowRoot, self = this, E = this._etat;
      var cr = E.mode === "cr";
      Array.prototype.forEach.call(sh.querySelectorAll("[data-mode]"), function (b) {
        b.setAttribute("aria-pressed", b.getAttribute("data-mode") === E.mode ? "true" : "false");
      });
      sh.getElementById("zone-cr").hidden = !cr;
      sh.getElementById("zone-dev").hidden = cr;
      sh.getElementById("zone-p").hidden = !(cr && E.tangente);
      sh.getElementById("r").value = String(E.r);
      sh.getElementById("label-r").textContent = "Rayon r = " + E.r;
      sh.getElementById("tangente").checked = E.tangente;
      ["D", "E", "F"].forEach(function (id) {
        sh.getElementById(id).value = String(E[id]);
        sh.getElementById("label-" + id).textContent = "Coefficient " + id + " = " + nb(E[id]);
      });

      // grandeurs du cercle
      var D, Ee, F, cx, cy, n; // n = 4r² (entier)
      if (cr) {
        D = -2 * E.a; Ee = -2 * E.b; F = E.a * E.a + E.b * E.b - E.r * E.r;
      } else {
        D = E.D; Ee = E.E; F = E.F;
      }
      cx = -D / 2; cy = -Ee / 2;
      n = D * D + Ee * Ee - 4 * F;
      var r2 = n / 4, r = n > 0 ? Math.sqrt(r2) : 0;

      // point de tangence
      var P = null, CP = null;
      if (cr && E.tangente) {
        var liste = this._pointsEntiers(E.r);
        if (E.idx === null) {
          var i0 = 0;
          for (var i = 0; i < liste.length; i++) if (liste[i][0] === 3 && liste[i][1] === 4) i0 = i;
          if (E.r !== 5) { // premier point du premier quadrant hors axe, sinon le premier
            for (var j = 0; j < liste.length; j++) if (liste[j][0] > 0 && liste[j][1] > 0) { i0 = j; break; }
          }
          E.idx = i0;
        }
        E.idx = ((E.idx % liste.length) + liste.length) % liste.length;
        CP = liste[E.idx];
        P = { x: E.a + CP[0], y: E.b + CP[1] };
      }

      // ---------- dessin ----------
      var svg = this._svg;
      svg.innerHTML = "";
      var defs = el("defs", {}, svg);
      var clip = el("clipPath", { id: "cadre" }, defs);
      el("rect", { x: MARGE, y: MARGE, width: LARGEUR - 2 * MARGE, height: HAUTEUR - 2 * MARGE }, clip);
      var mk = el("marker", { id: "fl", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" }, defs);
      el("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche-axe" }, mk);
      var g = el("g", { "clip-path": "url(#cadre)" }, svg);
      for (var gx = X_MIN; gx <= X_MAX; gx++) { var px = this._px(gx, 0)[0]; el("line", { x1: px, y1: MARGE, x2: px, y2: HAUTEUR - MARGE, class: "grille" }, g); }
      for (var gy = Y_MIN; gy <= Y_MAX; gy++) { var py = this._px(0, gy)[1]; el("line", { x1: MARGE, y1: py, x2: LARGEUR - MARGE, y2: py, class: "grille" }, g); }
      var o = this._px(0, 0);
      el("line", { x1: MARGE, y1: o[1], x2: LARGEUR - MARGE, y2: o[1], class: "axe", "marker-end": "url(#fl)" }, svg);
      el("line", { x1: o[0], y1: HAUTEUR - MARGE, x2: o[0], y2: MARGE, class: "axe", "marker-end": "url(#fl)" }, svg);
      var t1 = el("text", { x: this._px(1, 0)[0] - 3, y: o[1] + 15, class: "graduation" }, svg); t1.textContent = "1";
      var t2 = el("text", { x: o[0] - 12, y: this._px(0, 1)[1] + 4, class: "graduation" }, svg); t2.textContent = "1";

      var pc = this._px(cx, cy);
      if (n > 0) el("circle", { cx: pc[0], cy: pc[1], r: (r * UNITE).toFixed(1), class: "cercle" }, g);
      if (P) {
        var pp = this._px(P.x, P.y);
        el("line", { x1: pc[0], y1: pc[1], x2: pp[0], y2: pp[1], class: "rayon" }, g);
        // tangente : direction (−dy ; dx)
        var L = Math.hypot(CP[0], CP[1]), tx = -CP[1] / L, ty = CP[0] / L;
        var q0 = this._px(P.x - tx * 30, P.y - ty * 30), q1 = this._px(P.x + tx * 30, P.y + ty * 30);
        el("line", { x1: q0[0], y1: q0[1], x2: q1[0], y2: q1[1], class: "tangente" }, g);
        // angle droit en P : vers C et le long de la tangente (pixels, y inversé)
        var c = 9, ux = -CP[0] / L, uy = CP[1] / L, vx = tx, vy = -ty;
        el("path", { d: "M" + (pp[0] + ux * c) + "," + (pp[1] + uy * c) + " L" + (pp[0] + ux * c + vx * c) + "," + (pp[1] + uy * c + vy * c) + " L" + (pp[0] + vx * c) + "," + (pp[1] + vy * c), class: "angle-droit" }, g);
        el("circle", { cx: pp[0], cy: pp[1], r: 5, class: "point-p" }, svg);
        var et = el("text", { x: (pp[0] + CP[0] / L * 16).toFixed(1), y: (pp[1] - CP[1] / L * 16 + 5).toFixed(1), class: "etiq etiq-p", "text-anchor": "middle" }, svg);
        et.textContent = "P";
      }
      if (n >= 0 && cx >= X_MIN && cx <= X_MAX && cy >= Y_MIN && cy <= Y_MAX) {
        el("circle", { cx: pc[0], cy: pc[1], r: n === 0 ? 6 : 4.5, class: n === 0 ? "point-seul" : "point" }, svg);
        var ec = el("text", { x: (pc[0] - 12).toFixed(1), y: (pc[1] + 18).toFixed(1), class: "etiq", "text-anchor": "middle" }, svg);
        ec.textContent = "C";
      }

      // ---------- lecture ----------
      var h = '';
      if (cr) {
        h += '<div class="carte"><div class="carte-titre">Forme centre-rayon</div>' +
          '<div class="eq">' + carre("x", E.a) + ' + ' + carre("y", E.b) + ' = ' + (E.r * E.r) + '</div>' +
          '<div>Centre C(' + nb(E.a) + ' ; ' + nb(E.b) + '), rayon r = ' + E.r + ', donc r² = ' + (E.r * E.r) + '</div></div>';
        h += '<div class="carte"><div class="carte-titre">Forme développée</div>' +
          '<span class="etape">' + carre("x", E.a) + ' = x²' + terme(D, "x") + terme(E.a * E.a, "") + '</span>' +
          '<span class="etape">' + carre("y", E.b) + ' = y²' + terme(Ee, "y") + terme(E.b * E.b, "") + '</span>' +
          '<span class="etape">On regroupe et on passe ' + (E.r * E.r) + ' à gauche :</span>' +
          '<div class="eq">' + developpee(D, Ee, F) + '</div>' +
          '<div class="note">Le même coefficient (1) devant x² et devant y² : c\'est la signature d\'un cercle.</div></div>';
        if (P) {
          var g3 = pgcd(pgcd(CP[0], CP[1]), CP[0] * P.x + CP[1] * P.y) || 1;
          var ta = CP[0] / g3, tb = CP[1] / g3, tc = -(CP[0] * P.x + CP[1] * P.y) / g3;
          if (ta < 0 || (ta === 0 && tb < 0)) { ta = -ta; tb = -tb; tc = -tc; }
          h += '<div class="carte"><div class="carte-titre">Tangente en P(' + nb(P.x) + ' ; ' + nb(P.y) + ')</div>' +
            '<div>La tangente est perpendiculaire au rayon [CP]. Le vecteur CP(' + nb(CP[0]) + ' ; ' + nb(CP[1]) + ') est donc un vecteur normal de la tangente :</div>' +
            '<div>' + nb(CP[0]) + '(x' + terme(-P.x, "") + ') ' + (CP[1] < 0 ? '− ' + nb(-CP[1]) : '+ ' + nb(CP[1])) + '(y' + terme(-P.y, "") + ') = 0</div>' +
            '<div class="eq-t">' + implicite(ta, tb, tc) + '</div></div>';
        }
      } else {
        h += '<div class="carte"><div class="carte-titre">Équation de départ</div><div class="eq">' + developpee(D, Ee, F) + '</div></div>';
        h += '<div class="carte"><div class="carte-titre">Compléter les carrés</div>' +
          '<span class="etape">1. Regrouper : (x²' + terme(D, "x") + ') + (y²' + terme(Ee, "y") + ') = ' + nb(-F) + '</span>' +
          '<span class="etape">2. Compléter : ' + carre("x", cx) + terme(-cx * cx, "") + ' + ' + carre("y", cy) + terme(-cy * cy, "") + ' = ' + nb(-F) + '</span>' +
          '<span class="etape">3. Isoler les carrés : ' + carre("x", cx) + ' + ' + carre("y", cy) + ' = ' + nb(-F) + terme(cx * cx, "") + terme(cy * cy, "") + ' = <strong>' + nb(r2) + '</strong></span></div>';
        if (n < 0) {
          h += '<div class="carte alerte">Aucun point : une somme de deux carrés ne peut pas valoir ' + nb(r2) + ', qui est négatif. Ce n\'est pas un cercle.</div>';
        } else if (n === 0) {
          h += '<div class="carte"><div class="carte-titre">Un seul point</div><div>r² = 0 : seul le point (' + nb(cx) + ' ; ' + nb(cy) + ') vérifie l\'équation — c\'est le centre lui-même, pas un cercle.</div></div>';
        } else {
          h += '<div class="carte"><div class="carte-titre">Centre et rayon</div>' +
            '<div class="eq">' + carre("x", cx) + ' + ' + carre("y", cy) + ' = ' + nb(r2) + '</div>' +
            '<div>Centre C(' + nb(cx) + ' ; ' + nb(cy) + ')</div>' +
            '<div>Rayon r = √' + nb(r2) + ' = ' + racineSur2(n) + (estExact(r, 2) ? '' : ' ≈ ' + nb(r)) + '</div></div>';
        }
      }
      this._lecture.innerHTML = h;
    }
  }

  if (!customElements.get("cercle-equation-widget")) {
    customElements.define("cercle-equation-widget", CercleEquationWidget);
  }
})();
