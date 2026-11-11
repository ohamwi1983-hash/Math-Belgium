(function () {
  "use strict";

  /* ================================================================
   * <triangulation-widget> — atelier interactif (4e, ch. 5, § 7) :
   * mesurer une hauteur inaccessible avec deux triangles liés.
   * Deux modes :
   *  1. « Deux visées depuis deux points » — A et B alignés avec le pied
   *     F, distance d = AB, élévations α (depuis A) et β (depuis B).
   *     Triangle pont ABS (quelconque, résolu en premier : Ŝ = β − α,
   *     angle en B = 180° − β, BS par la loi des sinus) → triangle cible
   *     BFS (rectangle en F, contient h) : h = BS·sin β.
   *  2. « Un seul point O, repère connu » (comme gen58, « angle
   *     partagé ») — repère M à hauteur connue hₘ sur le support, visées
   *     θₘ vers M puis θₜ vers le sommet T depuis le MÊME point O.
   *     Triangle pont OFM (rectangle en F) : OM = hₘ / sin θₘ →
   *     triangle cible OMT (quelconque, contient MT) : Ô = θₜ − θₘ,
   *     angle en M = 90° + θₘ, T̂ = 90° − θₜ, MT par la loi des sinus ;
   *     hauteur totale = hₘ + MT.
   * Dessin à l'échelle, fenêtre FIXE par mode (pire cas des curseurs
   * couvert, vérifié par calcul). Web Component (Shadow DOM).
   * ================================================================ */

  var D2R = Math.PI / 180;
  var SVGNS = "http://www.w3.org/2000/svg";

  // Mode 1 — bornes choisies pour garder une fenêtre fixe raisonnable :
  // AF = d·cos α·sin β / sin(β − α) et h = d·sin α·sin β / sin(β − α), maximaux pour un écart
  // minimal (20°) et α maximal : pire AF ≈ 98,1 m et pire h ≈ 68,7 m (d = 50, α = 35°, β = 55°).
  var M1 = { d: { min: 20, max: 50, step: 1, def: 40 }, a: { min: 15, max: 35, step: 1, def: 28 }, b: { min: 35, max: 70, step: 1, def: 52 }, ecartMin: 20 };
  var F1 = { xMin: -8, xMax: 108, yMin: -12, yMax: 80 };
  // Mode 2 — pire OF = 8/tan15° ≈ 29,9 m ; pire hauteur totale ≈ 29,9·tan55° ≈ 42,7 m.
  var M2 = { h: { min: 3, max: 8, step: 0.5, def: 6 }, tm: { min: 15, max: 35, step: 1, def: 20 }, tt: { min: 25, max: 55, step: 1, def: 50 }, ecartMin: 10 };
  var F2 = { xMin: -5, xMax: 40, yMin: -6, yMax: 48 };
  var LARGEUR = 420;

  function arrondi(n, d) {
    var f = Math.pow(10, d);
    var r = Math.round(n * f) / f;
    if (Object.is(r, -0)) r = 0;
    return r;
  }
  function fmt(n, d) { return arrondi(n, d).toFixed(d).replace(".", ",").replace("-", "−"); }
  function fmtCourt(n) {
    // entier sans décimales, sinon une décimale (valeurs de curseurs)
    return Math.abs(n - Math.round(n)) < 1e-9 ? String(Math.round(n)).replace("-", "−") : fmt(n, 1);
  }
  function exact(n, d) { return Math.abs(n - arrondi(n, d)) < 1e-7; }
  function egal(n, d) { return (exact(n, d) ? "= " : "≈ ") + fmt(n, d); }
  function sin(deg) { return Math.sin(deg * D2R); }
  function cos(deg) { return Math.cos(deg * D2R); }
  function tan(deg) { return Math.tan(deg * D2R); }

  function el(tag, attrs, texte) {
    var e = document.createElementNS(SVGNS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (texte != null) e.textContent = texte;
    return e;
  }

  function curseurHtml(id, label, b) {
    return '<div class="curseur"><label for="' + id + '">' + label + '</label>' +
      '<input type="range" id="' + id + '" min="' + b.min + '" max="' + b.max + '" step="' + b.step + '" value="' + b.def + '">' +
      '<span class="val" id="' + id + '-val"></span></div>';
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#182430);}' +
    '*{box-sizing:border-box;}' +
    '.modes{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:12px;}' +
    '.btn{min-height:44px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);background:var(--surface,#fff);color:var(--ink,#182430);font-weight:600;cursor:pointer;font-family:inherit;font-size:0.9rem;}' +
    '.btn[aria-pressed="true"]{background:var(--accent-soft,#f4e3d1);border-color:var(--accent-soft-line,#e6c8a4);color:var(--accent-ink,#7a3c11);}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:520px;height:auto;background:var(--surface-2,#f7f9fb);border-radius:var(--radius,3px);display:block;}' +
    'svg.haut{max-width:440px;}' +
    '.sol{stroke:var(--ink-soft,#51626f);stroke-width:1.6;}' +
    '.poteau{stroke:var(--ink-soft,#51626f);stroke-width:4;stroke-linecap:round;}' +
    '.pont{fill:var(--plan,#5b4ea3);fill-opacity:0.10;stroke:var(--plan,#5b4ea3);stroke-width:2;stroke-linejoin:round;}' +
    '.cible{fill:var(--accent,#b65c1f);fill-opacity:0.12;stroke:var(--accent,#b65c1f);stroke-width:2;stroke-linejoin:round;}' +
    '.visee{stroke:var(--ink-faint,#8a97a1);stroke-width:1.2;stroke-dasharray:4 3;}' +
    '.grandeur{stroke:var(--good,#2f7a4f);stroke-width:3.2;stroke-linecap:round;}' +
    '.arc{fill:none;stroke:var(--ink-soft,#51626f);stroke-width:1.3;}' +
    '.pt{fill:var(--ink,#182430);}' +
    '.nom{font-size:14px;font-weight:700;fill:var(--ink,#182430);font-family:var(--serif,serif);font-style:italic;}' +
    '.mesure{font-size:12px;fill:var(--ink-soft,#51626f);font-family:var(--sans,sans-serif);}' +
    '.mesure-g{font-size:13px;font-weight:700;fill:var(--good,#2f7a4f);font-family:var(--sans,sans-serif);}' +
    '.legende{display:flex;gap:14px;flex-wrap:wrap;justify-content:center;font-size:0.82rem;margin:0 0 12px;color:var(--ink-soft,#51626f);}' +
    '.legende span::before{content:"";display:inline-block;width:12px;height:12px;margin-right:6px;vertical-align:-1px;border-radius:2px;}' +
    '.lg-pont::before{background:var(--plan,#5b4ea3);opacity:0.55;}' +
    '.lg-cible::before{background:var(--accent,#b65c1f);opacity:0.55;}' +
    '.lg-g::before{background:var(--good,#2f7a4f);}' +
    '.etapes{background:var(--surface-2,#f7f9fb);border:1px solid var(--line-soft,#dfe7ec);border-radius:var(--radius,3px);padding:10px 14px;margin-bottom:14px;}' +
    '.etapes h4{margin:8px 0 4px;font-size:0.86rem;}' +
    '.etapes h4:first-child{margin-top:0;}' +
    '.h-pont{color:var(--plan-ink,#443a80);}' +
    '.h-cible{color:var(--accent-ink,#7a3c11);}' +
    '.etapes p{margin:3px 0;font-size:0.9rem;line-height:1.45;font-variant-numeric:tabular-nums;}' +
    '.resultat{margin-top:8px !important;font-weight:700;color:var(--good,#2f7a4f);}' +
    '.controles{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur{display:flex;align-items:center;gap:10px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3c11);min-width:96px;font-size:0.95rem;}' +
    '.curseur input{flex:1 1 auto;min-width:0;accent-color:var(--accent,#b65c1f);min-height:44px;}' +
    '.curseur .val{min-width:54px;text-align:right;font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#51626f);font-size:0.9rem;}' +
    '.note{min-height:1.2em;margin:0;font-size:0.82rem;color:var(--ink-soft,#51626f);text-align:center;}' +
    '.btn-reset{align-self:center;margin-top:6px;background:var(--accent-soft,#f4e3d1);border-color:var(--accent-soft-line,#e6c8a4);color:var(--accent-ink,#7a3c11);}' +
    '[hidden]{display:none !important;}' +
    '</style>' +
    '<div class="modes" role="group" aria-label="Configuration">' +
    '<button class="btn" type="button" data-mode="1" aria-pressed="true">Deux visées depuis deux points</button>' +
    '<button class="btn" type="button" data-mode="2" aria-pressed="false">Un seul point O, repère connu</button>' +
    '</div>' +
    '<div class="graphe-zone"><svg id="svg" role="img"></svg></div>' +
    '<p class="legende"><span class="lg-pont">triangle pont</span><span class="lg-cible">triangle cible</span><span class="lg-g">grandeur cherchée</span></p>' +
    '<div class="etapes" id="etapes" aria-live="polite"></div>' +
    '<div class="controles" id="c1">' +
    curseurHtml("d", "d = AB (m)", M1.d) +
    curseurHtml("al", "α (depuis A)", M1.a) +
    curseurHtml("be", "β (depuis B)", M1.b) +
    '</div>' +
    '<div class="controles" id="c2" hidden>' +
    curseurHtml("hm", "hₘ (m)", M2.h) +
    curseurHtml("tm", "θₘ (vers M)", M2.tm) +
    curseurHtml("tt", "θₜ (vers T)", M2.tt) +
    '</div>' +
    '<p class="note" id="note" aria-live="polite"></p>' +
    '<div class="controles"><button class="btn btn-reset" id="reset" type="button">Réinitialiser</button></div>';

  class TriangulationWidget extends HTMLElement {
    constructor() {
      super();
      var s = this.attachShadow({ mode: "open" });
      s.appendChild(TEMPLATE.content.cloneNode(true));
      this._s = s;
      this._mode = 1;
      this._v = { d: M1.d.def, al: M1.a.def, be: M1.b.def, hm: M2.h.def, tm: M2.tm.def, tt: M2.tt.def };
      this._svg = s.getElementById("svg");
      this._etapes = s.getElementById("etapes");
      this._note = s.getElementById("note");
      this._ecouteurs = [];
    }

    connectedCallback() {
      var self = this, s = this._s;
      function ecoute(c, t, f) { c.addEventListener(t, f); self._ecouteurs.push([c, t, f]); }
      Array.prototype.forEach.call(s.querySelectorAll("[data-mode]"), function (b) {
        ecoute(b, "click", function () { self._mode = parseInt(b.dataset.mode, 10); self._note.textContent = ""; self._rendre(); });
      });
      ["d", "al", "be", "hm", "tm", "tt"].forEach(function (id) {
        var inp = s.getElementById(id);
        ecoute(inp, "input", function () { self._changer(id, parseFloat(inp.value)); });
      });
      ecoute(s.getElementById("reset"), "click", function () {
        self._v = { d: M1.d.def, al: M1.a.def, be: M1.b.def, hm: M2.h.def, tm: M2.tm.def, tt: M2.tt.def };
        self._note.textContent = "";
        self._rendre();
      });
      this._rendre();
    }

    disconnectedCallback() {
      this._ecouteurs.forEach(function (x) { x[0].removeEventListener(x[1], x[2]); });
      this._ecouteurs = [];
    }

    _changer(id, val) {
      var v = this._v;
      v[id] = val;
      this._note.textContent = "";
      // Contraintes : β ≥ α + 20° (mode 1), θₜ ≥ θₘ + 10° (mode 2) — on pousse l'autre curseur.
      if (id === "al" && v.be < v.al + M1.ecartMin) { v.be = v.al + M1.ecartMin; this._note.textContent = "β doit dépasser α d'au moins 20° : β a été ajusté."; }
      if (id === "be" && v.be < v.al + M1.ecartMin) { v.al = Math.max(M1.a.min, v.be - M1.ecartMin); if (v.be < v.al + M1.ecartMin) v.be = v.al + M1.ecartMin; this._note.textContent = "β doit dépasser α d'au moins 20° : α a été ajusté."; }
      if (id === "tm" && v.tt < v.tm + M2.ecartMin) { v.tt = v.tm + M2.ecartMin; this._note.textContent = "θₜ doit dépasser θₘ d'au moins 10° : θₜ a été ajusté."; }
      if (id === "tt" && v.tt < v.tm + M2.ecartMin) { v.tm = Math.max(M2.tm.min, v.tt - M2.ecartMin); if (v.tt < v.tm + M2.ecartMin) v.tt = v.tm + M2.ecartMin; this._note.textContent = "θₜ doit dépasser θₘ d'au moins 10° : θₘ a été ajusté."; }
      this._rendre();
    }

    _rendre() {
      var s = this._s, v = this._v, self = this;
      Array.prototype.forEach.call(s.querySelectorAll("[data-mode]"), function (b) {
        b.setAttribute("aria-pressed", parseInt(b.dataset.mode, 10) === self._mode ? "true" : "false");
      });
      s.getElementById("c1").hidden = this._mode !== 1;
      s.getElementById("c2").hidden = this._mode !== 2;
      ["d", "al", "be", "hm", "tm", "tt"].forEach(function (id) {
        s.getElementById(id).value = String(v[id]);
        var unite = (id === "d" || id === "hm") ? " m" : "°";
        s.getElementById(id + "-val").textContent = fmtCourt(v[id]) + unite;
      });
      if (this._mode === 1) this._rendre1(); else this._rendre2();
    }

    _cadre(F, hauteurPx) {
      var svg = this._svg;
      svg.textContent = "";
      var H = Math.round(LARGEUR * (F.yMax - F.yMin) / (F.xMax - F.xMin));
      svg.setAttribute("viewBox", "0 0 " + LARGEUR + " " + H);
      svg.setAttribute("class", H > LARGEUR ? "haut" : "");
      var X = function (x) { return (x - F.xMin) / (F.xMax - F.xMin) * LARGEUR; };
      var Y = function (y) { return H - (y - F.yMin) / (F.yMax - F.yMin) * H; };
      return { X: X, Y: Y, H: H };
    }

    _arc(c, P, a1, a2, r) {
      // arc de cercle en P, angles (degrés, sens mathématique) a1 → a2
      var x1 = c.X(P.x) + r * Math.cos(a1 * D2R), y1 = c.Y(P.y) - r * Math.sin(a1 * D2R);
      var x2 = c.X(P.x) + r * Math.cos(a2 * D2R), y2 = c.Y(P.y) - r * Math.sin(a2 * D2R);
      var grand = Math.abs(a2 - a1) > 180 ? 1 : 0;
      this._svg.appendChild(el("path", { d: "M" + x1 + "," + y1 + " A" + r + "," + r + " 0 " + grand + "," + (a2 > a1 ? 0 : 1) + " " + x2 + "," + y2, class: "arc" }));
    }

    _poly(c, pts, cls) {
      this._svg.appendChild(el("polygon", { points: pts.map(function (P) { return c.X(P.x) + "," + c.Y(P.y); }).join(" "), class: cls }));
    }
    _ligne(c, P, Q, cls) { this._svg.appendChild(el("line", { x1: c.X(P.x), y1: c.Y(P.y), x2: c.X(Q.x), y2: c.Y(Q.y), class: cls })); }
    _txt(c, P, dx, dy, t, cls, ancre) { this._svg.appendChild(el("text", { x: c.X(P.x) + dx, y: c.Y(P.y) + dy, class: cls, "text-anchor": ancre || "middle" }, t)); }
    _pt(c, P) { this._svg.appendChild(el("circle", { cx: c.X(P.x), cy: c.Y(P.y), r: 3.5, class: "pt" })); }

    _rendre1() {
      var v = this._v, d = v.d, al = v.al, be = v.be;
      var S_ang = be - al, B_ang = 180 - be;
      var BS = d * sin(al) / sin(S_ang);
      var h = BS * sin(be);
      var BF = BS * cos(be);
      var A = { x: 0, y: 0 }, B = { x: d, y: 0 }, F = { x: d + BF, y: 0 }, S = { x: d + BF, y: h };
      var c = this._cadre(F1);
      this._svg.setAttribute("aria-label", "Deux visées depuis A et B vers le sommet S ; triangle pont ABS, triangle cible BFS");
      this._ligne(c, { x: F1.xMin, y: 0 }, { x: F1.xMax, y: 0 }, "sol");
      this._poly(c, [A, B, S], "pont");
      this._poly(c, [B, F, S], "cible");
      this._ligne(c, F, S, "grandeur");
      // angle droit en F
      var k = 9;
      this._svg.appendChild(el("polyline", { points: (c.X(F.x) - k) + "," + c.Y(0) + " " + (c.X(F.x) - k) + "," + (c.Y(0) - k) + " " + c.X(F.x) + "," + (c.Y(0) - k), class: "arc" }));
      this._arc(c, A, 0, al, 30);
      this._arc(c, B, 0, be, 22);
      [A, B, F, S].forEach(this._pt.bind(this, c));
      this._txt(c, A, 0, 18, "A", "nom");
      this._txt(c, B, 0, 18, "B", "nom");
      this._txt(c, F, 0, 18, "F", "nom");
      this._txt(c, S, 0, -9, "S", "nom");
      this._txt(c, { x: d / 2, y: 0 }, 0, 32, "d = " + fmtCourt(d) + " m", "mesure");
      this._txt(c, A, 36, -6, "α", "mesure", "start");
      this._txt(c, B, 27, -6, "β", "mesure", "start");
      this._txt(c, { x: F.x, y: h / 2 }, 8, 4, "h", "mesure-g", "start");

      var html = "";
      html += '<h4 class="h-pont">1. Triangle pont ABS — quelconque, résolu en premier</h4>';
      html += "<p>angle en A = α = " + fmtCourt(al) + "° ; angle en B = 180° − β = " + fmtCourt(B_ang) + "° ; angle en S = β − α = " + fmtCourt(S_ang) + "°</p>";
      html += "<p>Loi des sinus : BS / sin Â = AB / sin Ŝ, donc BS = " + fmtCourt(d) + " × sin " + fmtCourt(al) + "° / sin " + fmtCourt(S_ang) + "° " + egal(BS, 2) + " m</p>";
      html += '<h4 class="h-cible">2. Triangle cible BFS — rectangle en F, il contient la hauteur h</h4>';
      html += "<p>h = BS × sin β ≈ " + fmt(BS, 2) + " × sin " + fmtCourt(be) + "° " + egal(h, 2) + " m</p>";
      html += '<p class="resultat">Hauteur de la tour ' + egal(h, 2) + " m</p>";
      this._etapes.innerHTML = html;
    }

    _rendre2() {
      var v = this._v, hm = v.hm, tm = v.tm, tt = v.tt;
      var OF = hm / tan(tm);
      var OM = hm / sin(tm);
      var Oang = tt - tm, Mang = 90 + tm, Tang = 90 - tt;
      var MT = OM * sin(Oang) / sin(Tang);
      var H = hm + MT;
      var O = { x: 0, y: 0 }, F = { x: OF, y: 0 }, M = { x: OF, y: hm }, T = { x: OF, y: H };
      var c = this._cadre(F2);
      this._svg.setAttribute("aria-label", "Depuis O, visées vers le repère M puis vers le sommet T ; triangle pont OFM, triangle cible OMT");
      this._ligne(c, { x: F2.xMin, y: 0 }, { x: F2.xMax, y: 0 }, "sol");
      this._poly(c, [O, F, M], "pont");
      this._poly(c, [O, M, T], "cible");
      this._ligne(c, M, T, "grandeur");
      var k = 9;
      this._svg.appendChild(el("polyline", { points: (c.X(F.x) - k) + "," + c.Y(0) + " " + (c.X(F.x) - k) + "," + (c.Y(0) - k) + " " + c.X(F.x) + "," + (c.Y(0) - k), class: "arc" }));
      this._arc(c, O, 0, tm, 34);
      this._arc(c, O, tm, tt, 50);
      [O, F, M, T].forEach(this._pt.bind(this, c));
      this._txt(c, O, 0, 18, "O", "nom");
      this._txt(c, F, 0, 18, "F", "nom");
      this._txt(c, M, 9, 5, "M", "nom", "start");
      this._txt(c, T, 0, -9, "T", "nom");
      this._txt(c, { x: OF, y: hm / 2 }, 9, 4, "hₘ = " + fmtCourt(hm) + " m", "mesure", "start");
      this._txt(c, { x: OF, y: hm + MT / 2 }, 9, 4, "MT", "mesure-g", "start");
      this._txt(c, O, 40, -4, "θₘ", "mesure", "start");
      var aMid = (tm + tt) / 2;
      this._txt(c, O, 58 * Math.cos(aMid * D2R), -58 * Math.sin(aMid * D2R), "θₜ − θₘ", "mesure", "start");

      var html = "";
      html += '<h4 class="h-pont">1. Triangle pont OFM — rectangle en F, résolu en premier</h4>';
      html += "<p>sin θₘ = FM / OM, donc OM = hₘ / sin θₘ = " + fmtCourt(hm) + " / sin " + fmtCourt(tm) + "° " + egal(OM, 2) + " m</p>";
      html += '<h4 class="h-cible">2. Triangle cible OMT — quelconque, il contient MT</h4>';
      html += "<p>angle en O = θₜ − θₘ = " + fmtCourt(Oang) + "° ; angle en M = 90° + θₘ = " + fmtCourt(Mang) + "° ; angle en T = 90° − θₜ = " + fmtCourt(Tang) + "°</p>";
      html += "<p>Loi des sinus : MT / sin Ô = OM / sin T̂, donc MT ≈ " + fmt(OM, 2) + " × sin " + fmtCourt(Oang) + "° / sin " + fmtCourt(Tang) + "° " + egal(MT, 2) + " m</p>";
      html += "<p>Hauteur totale = hₘ + MT ≈ " + fmtCourt(hm) + " + " + fmt(MT, 2) + " " + egal(H, 2) + " m</p>";
      html += '<p class="resultat">Hauteur totale ' + egal(H, 2) + " m</p>";
      this._etapes.innerHTML = html;
    }
  }

  if (!customElements.get("triangulation-widget")) {
    customElements.define("triangulation-widget", TriangulationWidget);
  }
})();
