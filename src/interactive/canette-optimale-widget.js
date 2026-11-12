(function () {
  "use strict";

  /* ================================================================
   * <canette-optimale-widget> — atelier « la canette optimale » (5e,
   * Dérivées, § 8). Volume fixé à 330 cm³ ; curseur r (2 à 6 cm),
   * h = 330/(πr²). Canette dessinée À L'ÉCHELLE (9 px par cm) à côté
   * d'une vraie canette de 33 cl (pointillés), et courbe de l'aire
   * A(r) = 2πr² + 660/r avec le point courant et le minimum
   * (r³ = 165/π, r ≈ 3,74 cm, h = 2r). Case « fond et couvercle deux
   * fois plus épais » : coût K(r) = 4πr² + 660/r, minimum r³ = 165/(2π),
   * h = 4r — plus proche d'une vraie canette (h/r ≈ 3,5). Fenêtres FIXES.
   * Web Component (Shadow DOM).
   * ================================================================ */

  var NS = "http://www.w3.org/2000/svg";
  var V = 330;
  var LARGEUR = 440, HAUTEUR = 300;
  var ECHELLE = 8.6, SOL = 266, CX = 86;
  var GX0 = 196, GX1 = 428, GY0 = 268, GY1 = 22;
  var R_MIN_G = 1.5, R_MAX_G = 6.3, A_MIN_G = 200, A_MAX_G = 600;
  var VRAIE = { r: 3.3, h: 11.5 };

  function fr(n, dec) {
    var f = Math.pow(10, dec);
    var r = Math.round(n * f) / f;
    if (Object.is(r, -0)) r = 0;
    return r.toFixed(dec).replace(".", ",").replace("-", "−");
  }

  function el(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  function hauteur(r) { return V / (Math.PI * r * r); }
  /* k = 1 : aire réelle ; k = 2 : fond et couvercle comptés double (coût). */
  function cout(r, k) { return 2 * k * Math.PI * r * r + 2 * V / r; }
  function derivee(r, k) { return 4 * k * Math.PI * r - 2 * V / (r * r); }
  function rOptimal(k) { return Math.cbrt(V / (2 * k * Math.PI)); }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}' +
    '*{box-sizing:border-box;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:460px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);display:block;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.grille{stroke:var(--line,#ccd8e0);stroke-width:0.7;}' +
    '.grad{font-size:13px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.titre-axe{font-size:13px;font-weight:700;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.sol{stroke:var(--ink-soft,#6b6055);stroke-width:1;}' +
    '.boite{fill:var(--accent-soft,#f6e2d3);stroke:var(--accent,#a8471f);stroke-width:2;}' +
    '.boite-epaisse{stroke-width:4;}' +
    '.cote-ligne{stroke:var(--accent-ink,#7a3212);stroke-width:1.2;}' +
    '.vraie{fill:none;stroke:var(--ink-soft,#6b6055);stroke-width:1.3;stroke-dasharray:4 3;}' +
    '.cote{font-size:13.5px;font-weight:700;fill:var(--accent-ink,#7a3212);font-family:var(--sans,sans-serif);}' +
    '.cote-vraie{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.courbe{stroke:var(--accent,#a8471f);stroke-width:2.4;fill:none;}' +
    '.courbe-cout{stroke:var(--sky,#2f6fb0);}' +
    '.courbe-pale{stroke-width:1.4;stroke-dasharray:5 4;opacity:0.6;}' +
    '.pt{fill:var(--accent,#a8471f);}' +
    '.pt-cout{fill:var(--sky,#2f6fb0);}' +
    '.pt-min{fill:var(--good,#2f7a4f);}' +
    '.etq-min{font-size:13px;font-weight:700;fill:var(--good,#2f7a4f);font-family:var(--sans,sans-serif);}' +
    '.lecture{background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);padding:10px 12px;margin:0 0 14px;font-size:0.93rem;line-height:1.55;font-variant-numeric:tabular-nums;}' +
    '.lecture p{margin:0 0 6px;}' +
    '.lecture p:last-child{margin:0;}' +
    '.derivee{font-weight:700;}' +
    '.derivee.neg{color:var(--bad,#b23a3a);}' +
    '.derivee.pos{color:var(--sky-ink,#1f4e7d);}' +
    '.derivee.nul{color:var(--good,#2f7a4f);}' +
    '.min{color:var(--good,#2f7a4f);font-weight:700;}' +
    '.vraie-txt{color:var(--ink-soft,#6b6055);}' +
    '.controles{display:flex;flex-direction:column;gap:10px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-width:0;height:44px;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:72px;text-align:right;}' +
    '.case{display:flex;align-items:center;gap:10px;min-height:44px;font-size:0.92rem;cursor:pointer;}' +
    '.case input{width:22px;height:22px;flex:none;accent-color:var(--sky,#2f6fb0);}' +
    '.btn-reset{padding:8px 14px;min-height:44px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '</style>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Canette de 330 cm³ à l\'échelle et courbe de son aire en fonction du rayon"></svg></div>' +
    '<div class="lecture" id="lecture" aria-live="polite"></div>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="r">r — rayon de la canette (cm)</label><div class="curseur-row">' +
    '<input type="range" id="r" min="2" max="6" step="0.05" value="5">' +
    '<span class="curseur-valeur" id="r-valeur"></span></div></div>' +
    '<label class="case"><input type="checkbox" id="epais"> Fond et couvercle deux fois plus épais (comptés double dans le coût)</label>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class CanetteOptimaleWidget extends HTMLElement {
    constructor() {
      super();
      var s = this.attachShadow({ mode: "open" });
      s.appendChild(TEMPLATE.content.cloneNode(true));
      this._s = s;
      this._r = 5;
      this._k = 1;
      var self = this;
      this._onR = function () { self._r = parseFloat(s.getElementById("r").value); self._rendre(); };
      this._onEpais = function () { self._k = s.getElementById("epais").checked ? 2 : 1; self._rendre(); };
      this._onReset = function () {
        self._r = 5; self._k = 1;
        s.getElementById("r").value = "5";
        s.getElementById("epais").checked = false;
        self._rendre();
      };
    }

    connectedCallback() {
      var s = this._s;
      s.getElementById("r").addEventListener("input", this._onR);
      s.getElementById("epais").addEventListener("change", this._onEpais);
      s.getElementById("reset").addEventListener("click", this._onReset);
      this._rendre();
    }

    disconnectedCallback() {
      var s = this._s;
      s.getElementById("r").removeEventListener("input", this._onR);
      s.getElementById("epais").removeEventListener("change", this._onEpais);
      s.getElementById("reset").removeEventListener("click", this._onReset);
    }

    _rendre() {
      var s = this._s;
      var r = this._r, k = this._k;
      var h = hauteur(r);
      s.getElementById("r-valeur").textContent = fr(r, 2) + " cm";

      var svg = s.getElementById("svg");
      svg.innerHTML = "";
      var defs = el("defs", {});
      var mk = el("marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      mk.appendChild(el("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(mk);
      svg.appendChild(defs);

      /* ---- Panneau 1 : la canette à l'échelle ---- */
      svg.appendChild(el("line", { x1: 8, x2: 168, y1: SOL, y2: SOL, class: "sol" }));
      var dessinerCylindre = function (rr, hh, cls) {
        var w = rr * ECHELLE, H = hh * ECHELLE, ry = Math.max(2, w * 0.18);
        var haut = SOL - H;
        var d = "M" + (CX - w) + " " + haut + " L" + (CX - w) + " " + SOL +
          " A" + w + " " + ry + " 0 0 0 " + (CX + w) + " " + SOL +
          " L" + (CX + w) + " " + haut;
        var g = el("g", {});
        g.appendChild(el("path", { d: d, class: cls }));
        g.appendChild(el("ellipse", { cx: CX, cy: haut, rx: w, ry: ry, class: cls }));
        svg.appendChild(g);
        return haut;
      };
      var hautVraie = dessinerCylindre(VRAIE.r, VRAIE.h, "vraie");
      var hautCan = dessinerCylindre(r, h, "boite" + (k === 2 ? " boite-epaisse" : ""));
      var tv = el("text", { x: CX + VRAIE.r * ECHELLE + 3, y: hautVraie - 4, class: "cote-vraie" });
      tv.textContent = "vraie 33 cl";
      svg.appendChild(tv);
      // Cote verticale de h à gauche de la canette (texte tourné), cote de r sous le sol
      var xc = Math.max(20, CX - r * ECHELLE - 9);
      svg.appendChild(el("line", { x1: xc, x2: xc, y1: hautCan, y2: SOL, class: "cote-ligne" }));
      svg.appendChild(el("line", { x1: xc - 4, x2: xc + 4, y1: hautCan, y2: hautCan, class: "cote-ligne" }));
      svg.appendChild(el("line", { x1: xc - 4, x2: xc + 4, y1: SOL, y2: SOL, class: "cote-ligne" }));
      var yh = (hautCan + SOL) / 2;
      var ch = el("text", { x: xc - 6, y: yh, "text-anchor": "middle", class: "cote", transform: "rotate(-90 " + (xc - 6) + " " + yh + ")" });
      ch.textContent = "h = " + fr(h, 1);
      svg.appendChild(ch);
      svg.appendChild(el("line", { x1: CX, x2: CX + r * ECHELLE, y1: SOL + 6, y2: SOL + 6, class: "cote-ligne" }));
      var cr = el("text", { x: CX + r * ECHELLE / 2, y: SOL + 22, "text-anchor": "middle", class: "cote" });
      cr.textContent = "r = " + fr(r, 2);
      svg.appendChild(cr);

      /* ---- Panneau 2 : aire (ou coût) en fonction de r ---- */
      var gx = function (x) { return GX0 + (x - R_MIN_G) / (R_MAX_G - R_MIN_G) * (GX1 - GX0); };
      var gy = function (y) { return GY0 - (y - A_MIN_G) / (A_MAX_G - A_MIN_G) * (GY0 - GY1); };
      var v;
      for (v = 2; v <= 6; v++) {
        svg.appendChild(el("line", { x1: gx(v), x2: gx(v), y1: GY1, y2: GY0, class: "grille" }));
        var t = el("text", { x: gx(v), y: GY0 + 14, "text-anchor": "middle", class: "grad" });
        t.textContent = String(v);
        svg.appendChild(t);
      }
      for (v = 300; v <= 600; v += 100) {
        svg.appendChild(el("line", { x1: GX0, x2: GX1, y1: gy(v), y2: gy(v), class: "grille" }));
        var t2 = el("text", { x: GX0 - 4, y: gy(v) + 4, "text-anchor": "end", class: "grad" });
        t2.textContent = String(v);
        svg.appendChild(t2);
      }
      var t200 = el("text", { x: GX0 - 4, y: GY0 + 4, "text-anchor": "end", class: "grad" });
      t200.textContent = "200";
      svg.appendChild(t200);
      svg.appendChild(el("line", { x1: GX0, x2: GX1 + 6, y1: GY0, y2: GY0, class: "axe", "marker-end": "url(#fleche)" }));
      svg.appendChild(el("line", { x1: GX0, x2: GX0, y1: GY0, y2: GY1 - 8, class: "axe", "marker-end": "url(#fleche)" }));
      var tr = el("text", { x: GX1, y: GY0 - 6, "text-anchor": "end", class: "titre-axe" });
      tr.textContent = "r (cm)";
      svg.appendChild(tr);
      var ta = el("text", { x: GX0 + 6, y: GY1 + 2, class: "titre-axe" });
      ta.textContent = k === 1 ? "aire (cm²)" : "coût (cm² comptés)";
      svg.appendChild(ta);

      var tracer = function (kk, cls) {
        var d = "";
        for (var i = 0; i <= 160; i++) {
          var rr = 2 + (i / 160) * 4;
          d += (i === 0 ? "M" : "L") + gx(rr).toFixed(2) + " " + gy(cout(rr, kk)).toFixed(2) + " ";
        }
        svg.appendChild(el("path", { d: d.trim(), class: cls }));
      };
      tracer(1, "courbe" + (k === 1 ? "" : " courbe-pale"));
      tracer(2, "courbe courbe-cout" + (k === 2 ? "" : " courbe-pale"));

      var rOpt = rOptimal(k), aOpt = cout(rOpt, k);
      svg.appendChild(el("circle", { cx: gx(rOpt), cy: gy(aOpt), r: 5, class: "pt-min" }));
      var em = el("text", { x: gx(rOpt), y: gy(aOpt) + 18, "text-anchor": "middle", class: "etq-min" });
      em.textContent = "min";
      svg.appendChild(em);
      svg.appendChild(el("circle", { cx: gx(r), cy: gy(cout(r, k)), r: 5.5, class: k === 1 ? "pt" : "pt-cout" }));

      /* ---- Lecture ---- */
      var A = cout(r, k), dA = derivee(r, k);
      var hOpt = hauteur(rOpt);
      var nom = k === 1 ? "A" : "K";
      var formule = k === 1 ? "A(r) = 2πr² + 660/r" : "K(r) = 4πr² + 660/r";
      var formuleD = k === 1 ? "A′(r) = 4πr − 660/r²" : "K′(r) = 8πr − 660/r²";
      var sensClasse, sensTxt;
      if (Math.abs(dA) < 1.5) { sensClasse = "nul"; sensTxt = formuleD.split(" = ")[0] + " ≈ 0 : tu es au minimum."; }
      else if (dA < 0) { sensClasse = "neg"; sensTxt = formuleD.split(" = ")[0] + " ≈ " + fr(dA, 1) + " < 0 : agrandir r fait encore diminuer " + (k === 1 ? "l'aire." : "le coût."); }
      else { sensClasse = "pos"; sensTxt = formuleD.split(" = ")[0] + " ≈ " + fr(dA, 1) + " > 0 : il faut diminuer r."; }
      s.getElementById("lecture").innerHTML =
        '<p>h = 330/(πr²) ≈ ' + fr(h, 2) + ' cm, h/r ≈ ' + fr(h / r, 2) + ' ; ' + formule + ' ≈ ' + fr(A, 1) + ' cm²' + (k === 2 ? ' comptés' : '') + '.</p>' +
        '<p class="derivee ' + sensClasse + '">' + formuleD + ' : ' + sensTxt + '</p>' +
        '<p class="min">Minimum de ' + nom + ' : r³ = ' + (k === 1 ? '165/π' : '165/(2π)') + ', r ≈ ' + fr(rOpt, 2) + ' cm, h ≈ ' + fr(hOpt, 2) + ' cm = ' + (k === 1 ? '2r' : '4r') + ', ' + nom + ' ≈ ' + fr(aOpt, 1) + ' cm².</p>' +
        '<p class="vraie-txt">Une vraie canette de 33 cl : r ≈ 3,3 cm, h ≈ 11,5 cm, h/r ≈ 3,5 — plus proche du cas « fond et couvercle épais » que du modèle à épaisseur uniforme.</p>';
    }
  }

  if (!customElements.get("canette-optimale-widget")) {
    customElements.define("canette-optimale-widget", CanetteOptimaleWidget);
  }
})();
