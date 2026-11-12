(function () {
  "use strict";

  /* ================================================================
   * <boite-carton-widget> — atelier interactif : la boîte sans couvercle.
   * Dans une feuille L × l, on découpe aux quatre coins des carrés de
   * côté x, puis on relève les bords : V(x) = x(L − 2x)(l − 2x).
   * Trois vues synchronisées par le curseur x : le patron (carrés
   * découpés, plis en pointillés), la boîte en perspective cavalière, et
   * la courbe de V avec le point courant, le signe de V'(x) et le maximum
   * (calculé exactement par V'(x) = 0). Formats : carré 30 × 30 cm
   * (x = 5 cm, V = 2000 cm³) et A4 29,7 × 21 cm (x ≈ 4,04 cm,
   * V ≈ 1128,5 cm³). Fenêtres FIXES par format. Web Component.
   * ================================================================ */

  var FORMATS = {
    carre: { nom: "carré 30 × 30 cm", L: 30, l: 30 },
    a4: { nom: "A4 29,7 × 21 cm", L: 29.7, l: 21 },
  };
  var DEFAUT_FORMAT = "carre";
  var DEFAUT_X = 3;
  var PAS_X = 0.05;

  // V(x) = 4x³ − 2(L + l)x² + L·l·x ; V'(x) = 12x² − 4(L + l)x + L·l.
  function V(F, x) { return x * (F.L - 2 * x) * (F.l - 2 * x); }
  function Vp(F, x) { return 12 * x * x - 4 * (F.L + F.l) * x + F.L * F.l; }
  function xOptimal(F) {
    var A = 12, B = -4 * (F.L + F.l), C = F.L * F.l;
    return (-B - Math.sqrt(B * B - 4 * A * C)) / (2 * A); // plus petite racine (dans ]0 ; l/2[)
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

  var LH = 400, HH = 190;   // vue haute : patron (gauche) + boîte (droite)
  var LC = 400, HC = 210;   // courbe V(x)
  var MC = 36;

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.02rem;font-weight:600;color:var(--ink,#241f1a);margin:0 0 8px;}' +
    '.figure{display:flex;flex-direction:column;align-items:center;gap:6px;margin:0 auto 8px;max-width:440px;background:var(--surface,#fff);}' +
    'svg{width:100%;max-width:440px;height:auto;display:block;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.feuille{fill:var(--surface,#fff);stroke:var(--ink-soft,#6b6055);stroke-width:1.2;}' +
    '.coin{fill:var(--surface-2,#faf6f0);stroke:var(--bad,#b23a3a);stroke-width:1.2;stroke-dasharray:3 2;}' +
    '.pli{stroke:var(--ink-faint,#9c9083);stroke-width:1;stroke-dasharray:4 3;fill:none;}' +
    '.fond-boite{fill:var(--accent-soft,#f6e2d3);stroke:var(--accent,#a8471f);stroke-width:1.2;}' +
    '.face{fill:var(--accent,#a8471f);fill-opacity:0.22;stroke:var(--accent,#a8471f);stroke-width:1.4;}' +
    '.face-cote{fill:var(--accent,#a8471f);fill-opacity:0.34;stroke:var(--accent,#a8471f);stroke-width:1.4;}' +
    '.arete{stroke:var(--accent,#a8471f);stroke-width:1.4;fill:none;}' +
    '.cachee{stroke:var(--accent,#a8471f);stroke-width:1;stroke-dasharray:3 3;fill:none;opacity:0.7;}' +
    '.cote{font-size:11px;font-weight:600;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.cote-x{fill:var(--bad,#b23a3a);font-weight:700;}' +
    '.titre-vue{font-size:10.5px;fill:var(--ink-faint,#9c9083);font-family:var(--sans,sans-serif);letter-spacing:0.04em;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.courbe{stroke:var(--accent,#a8471f);stroke-width:2.3;fill:none;}' +
    '.repere{stroke:var(--good,#2f7a4f);stroke-width:1.1;stroke-dasharray:4 3;}' +
    '.point-max{fill:var(--good,#2f7a4f);}' +
    '.point{fill:var(--accent,#a8471f);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.guide{stroke:var(--accent,#a8471f);stroke-width:1;stroke-dasharray:2 3;opacity:0.8;}' +
    '.grad{font-size:10.5px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.et-max{font-size:11px;font-weight:700;fill:var(--good,#2f7a4f);font-family:var(--sans,sans-serif);}' +
    '.etat{text-align:center;font-size:0.86rem;margin:0 0 6px;color:var(--ink,#241f1a);font-variant-numeric:tabular-nums;}' +
    '.sens{text-align:center;font-size:0.86rem;font-weight:700;margin:0 0 12px;padding:8px 10px;border-radius:var(--radius,3px);background:var(--surface-2,#faf6f0);}' +
    '.sens.monte{color:var(--good,#2f7a4f);}' +
    '.sens.descend{color:var(--bad,#b23a3a);}' +
    '.sens.max{color:var(--accent-ink,#7a3212);}' +
    '.controles{display:flex;flex-direction:column;gap:10px;}' +
    '.choix{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;}' +
    '.choix button,.btn-reset{min-height:44px;padding:6px 12px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8cc);background:var(--surface,#fff);color:var(--ink,#241f1a);font-size:0.88rem;font-family:inherit;cursor:pointer;}' +
    '.choix button[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);border-color:var(--accent,#a8471f);color:var(--accent-ink,#7a3212);font-weight:700;}' +
    '.btn-reset{border-color:var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;}' +
    '.curseur{display:flex;flex-direction:column;gap:4px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;min-height:44px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-width:0;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:66px;text-align:right;font-size:0.92rem;}' +
    '</style>' +
    '<p class="formule" id="formule"></p>' +
    '<div class="figure">' +
    '<svg id="svg-haut" viewBox="0 0 ' + LH + ' ' + HH + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Patron de la feuille et boîte obtenue"></svg>' +
    '<svg id="svg-courbe" viewBox="0 0 ' + LC + ' ' + HC + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Courbe du volume V en fonction de x"></svg>' +
    '</div>' +
    '<p class="etat" id="etat"></p>' +
    '<p class="sens" id="sens" aria-live="polite"></p>' +
    '<div class="controles">' +
    '<div class="choix" id="choix" role="group" aria-label="Format de la feuille">' +
    '<button type="button" data-format="carre">Carré 30 × 30</button>' +
    '<button type="button" data-format="a4">A4 29,7 × 21</button>' +
    '</div>' +
    '<div class="curseur"><label for="x">x — côté des carrés découpés (cm)</label><div class="curseur-row">' +
    '<input type="range" id="x" step="' + PAS_X + '"><span class="curseur-valeur" id="x-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class BoiteCartonWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  BoiteCartonWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._svgHaut = shadow.getElementById("svg-haut");
    this._svgCourbe = shadow.getElementById("svg-courbe");
    this._formule = shadow.getElementById("formule");
    this._etat = shadow.getElementById("etat");
    this._sens = shadow.getElementById("sens");
    this._inputX = shadow.getElementById("x");
    this._valeurX = shadow.getElementById("x-valeur");
    this._choix = shadow.getElementById("choix");
    this._resetBtn = shadow.getElementById("reset");
  };

  BoiteCartonWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onX = function () { self._x = parseFloat(self._inputX.value); self._rendre(); };
    this._onChoix = function (e) {
      var btn = e.target.closest("button");
      if (btn && btn.dataset.format) self._choisir(btn.dataset.format, self._x);
    };
    this._onReset = function () { self._choisir(DEFAUT_FORMAT, DEFAUT_X); };
    this._inputX.addEventListener("input", this._onX);
    this._choix.addEventListener("click", this._onChoix);
    this._resetBtn.addEventListener("click", this._onReset);
    this._choisir(DEFAUT_FORMAT, DEFAUT_X);
  };

  BoiteCartonWidgetClass.prototype.disconnectedCallback = function () {
    this._inputX.removeEventListener("input", this._onX);
    this._choix.removeEventListener("click", this._onChoix);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  BoiteCartonWidgetClass.prototype._choisir = function (cle, x) {
    var F = FORMATS[cle];
    this._cle = cle;
    var xMax = Math.round((F.l / 2 - 0.1) * 100) / 100;
    this._xMax = xMax;
    this._inputX.min = "0.1";
    this._inputX.max = String(xMax);
    this._x = Math.max(0.1, Math.min(xMax, x));
    this._inputX.value = String(this._x);
    var boutons = this._choix.querySelectorAll("button");
    for (var i = 0; i < boutons.length; i++) boutons[i].setAttribute("aria-pressed", boutons[i].dataset.format === cle ? "true" : "false");
    var Ltxt = formatNombreFr(F.L, 1), ltxt = formatNombreFr(F.l, 1);
    this._formule.textContent = "V(x) = x(" + Ltxt + " − 2x)(" + ltxt + " − 2x)";
    this._rendre();
  };

  BoiteCartonWidgetClass.prototype._rendre = function () {
    var F = FORMATS[this._cle], x = this._x;
    this._valeurX.textContent = formatNombreFr(x, 2) + " cm";
    this._rendreHaut(F, x);
    this._rendreCourbe(F, x);

    var lb = F.L - 2 * x, pb = F.l - 2 * x, v = V(F, x), vp = Vp(F, x);
    this._etat.textContent = "Boîte : " + formatNombreFr(lb, 2) + " × " + formatNombreFr(pb, 2) + " × " +
      formatNombreFr(x, 2) + " cm — V ≈ " + formatNombreFr(v, 1) + " cm³ ; V'(x) ≈ " + formatNombreFr(vp, 1);
    var xo = xOptimal(F);
    if (Math.abs(x - xo) < PAS_X / 2 + 1e-9) {
      this._sens.className = "sens max";
      this._sens.textContent = "V'(x) ≈ 0 : le volume est MAXIMAL (V passe de croissant à décroissant).";
    } else if (vp > 0) {
      this._sens.className = "sens monte";
      this._sens.textContent = "V'(x) > 0 : V augmente — découpe des carrés un peu plus grands.";
    } else {
      this._sens.className = "sens descend";
      this._sens.textContent = "V'(x) < 0 : V diminue — les carrés sont déjà trop grands.";
    }
  };

  // Vue haute : patron à gauche, boîte cavalière à droite (échelles fixes par format).
  BoiteCartonWidgetClass.prototype._rendreHaut = function (F, x) {
    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svgHaut;
    svg.innerHTML = "";

    // --- Patron (zone 0..190 × 18..180) ---
    var zoneP = { x: 12, y: 22, w: 170, h: 150 };
    var sP = Math.min(zoneP.w / F.L, zoneP.h / F.l);
    var wP = F.L * sP, hP = F.l * sP;
    var ox = zoneP.x + (zoneP.w - wP) / 2, oy = zoneP.y + (zoneP.h - hP) / 2;
    var t1 = svgEl(ns, "text", { x: zoneP.x + zoneP.w / 2, y: 14, "text-anchor": "middle", class: "titre-vue" });
    t1.textContent = "patron";
    svg.appendChild(t1);
    svg.appendChild(svgEl(ns, "rect", { x: ox.toFixed(2), y: oy.toFixed(2), width: wP.toFixed(2), height: hP.toFixed(2), class: "feuille" }));
    var c = x * sP;
    [[ox, oy], [ox + wP - c, oy], [ox, oy + hP - c], [ox + wP - c, oy + hP - c]].forEach(function (p) {
      svg.appendChild(svgEl(ns, "rect", { x: p[0].toFixed(2), y: p[1].toFixed(2), width: c.toFixed(2), height: c.toFixed(2), class: "coin" }));
    });
    svg.appendChild(svgEl(ns, "rect", { x: (ox + c).toFixed(2), y: (oy + c).toFixed(2), width: Math.max(0, wP - 2 * c).toFixed(2), height: Math.max(0, hP - 2 * c).toFixed(2), class: "pli" }));
    var cx = svgEl(ns, "text", { x: (ox + c / 2).toFixed(2), y: (oy + c + 12).toFixed(2), "text-anchor": "middle", class: "cote cote-x" });
    cx.textContent = "x";
    svg.appendChild(cx);
    var cL = svgEl(ns, "text", { x: (ox + wP / 2).toFixed(2), y: (oy + hP + 13).toFixed(2), "text-anchor": "middle", class: "cote" });
    cL.textContent = formatNombreFr(F.L, 1) + " cm";
    svg.appendChild(cL);

    // --- Boîte cavalière (zone 200..392 × 22..180), échelle fixe par format ---
    var k = 0.5 * Math.SQRT1_2; // fuyante : 45°, coefficient 1/2
    var hMax = F.l / 2;
    var zoneB = { x: 202, y: 22, w: 188, h: 150 };
    var sB = Math.min(zoneB.w / (F.L + k * F.l), zoneB.h / (hMax + k * F.l));
    var t2 = svgEl(ns, "text", { x: zoneB.x + zoneB.w / 2, y: 14, "text-anchor": "middle", class: "titre-vue" });
    t2.textContent = "boîte (cm)";
    svg.appendChild(t2);
    var lb = (F.L - 2 * x) * sB, pb = (F.l - 2 * x) * k * sB, hb = x * sB;
    // Origine : coin avant-bas-gauche, placé pour centrer la boîte de taille maximale.
    var bx = zoneB.x + (zoneB.w - (F.L + k * F.l) * sB) / 2 + (2 * x) * sB / 2;
    var by = zoneB.y + zoneB.h - 6;
    function P(u, w, h) { return [bx + u + w, by - h - w]; } // u : longueur, w : profondeur projetée, h : hauteur
    function pts(arr) { return arr.map(function (p) { return p[0].toFixed(2) + "," + p[1].toFixed(2); }).join(" "); }
    var A = P(0, 0, 0), B = P(lb, 0, 0), C = P(lb, pb, 0), D = P(0, pb, 0);
    var E = P(0, 0, hb), Fp = P(lb, 0, hb), G = P(lb, pb, hb), H = P(0, pb, hb);
    // Arêtes cachées (fond arrière-gauche).
    svg.appendChild(svgEl(ns, "polyline", { points: pts([A, D, C]), class: "cachee" }));
    svg.appendChild(svgEl(ns, "line", { x1: D[0].toFixed(2), y1: D[1].toFixed(2), x2: H[0].toFixed(2), y2: H[1].toFixed(2), class: "cachee" }));
    // Faces visibles : côté droit, avant ; ouverture du dessus.
    svg.appendChild(svgEl(ns, "polygon", { points: pts([B, C, G, Fp]), class: "face-cote" }));
    svg.appendChild(svgEl(ns, "polygon", { points: pts([A, B, Fp, E]), class: "face" }));
    svg.appendChild(svgEl(ns, "polyline", { points: pts([E, H, G]), class: "arete" }));
    var cb = svgEl(ns, "text", { x: ((A[0] + B[0]) / 2).toFixed(2), y: (A[1] + 13).toFixed(2), "text-anchor": "middle", class: "cote" });
    cb.textContent = formatNombreFr(F.L - 2 * x, 1);
    svg.appendChild(cb);
    var chx = svgEl(ns, "text", { x: (A[0] - 4).toFixed(2), y: ((A[1] + E[1]) / 2 + 4).toFixed(2), "text-anchor": "end", class: "cote cote-x" });
    chx.textContent = formatNombreFr(x, 1);
    svg.appendChild(chx);
    var cp = svgEl(ns, "text", { x: ((B[0] + C[0]) / 2 + 6).toFixed(2), y: ((B[1] + C[1]) / 2 + 10).toFixed(2), "text-anchor": "start", class: "cote" });
    cp.textContent = formatNombreFr(F.l - 2 * x, 1);
    svg.appendChild(cp);
  };

  BoiteCartonWidgetClass.prototype._rendreCourbe = function (F, x) {
    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svgCourbe;
    svg.innerHTML = "";
    var xo = xOptimal(F), vMaxi = V(F, xo);
    var xMaxF = F.l / 2;
    var yMaxF = Math.ceil(vMaxi * 1.18 / 100) * 100;
    function toPx(xm, ym) {
      return [MC + xm / xMaxF * (LC - MC - 22), HC - 26 - ym / yMaxF * (HC - 26 - 16)];
    }
    var defs = svgEl(ns, "defs", {});
    var fl = svgEl(ns, "marker", { id: "fleche-bc", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
    fl.appendChild(svgEl(ns, "path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
    defs.appendChild(fl);
    svg.appendChild(defs);
    var o = toPx(0, 0);
    svg.appendChild(svgEl(ns, "line", { x1: o[0], y1: o[1], x2: LC - 8, y2: o[1], class: "axe", "marker-end": "url(#fleche-bc)" }));
    svg.appendChild(svgEl(ns, "line", { x1: o[0], y1: o[1], x2: o[0], y2: 6, class: "axe", "marker-end": "url(#fleche-bc)" }));
    var nx = svgEl(ns, "text", { x: LC - 10, y: o[1] - 6, "text-anchor": "end", class: "grad" });
    nx.textContent = "x (cm)";
    svg.appendChild(nx);
    var nv = svgEl(ns, "text", { x: o[0] + 6, y: 14, class: "grad" });
    nv.textContent = "V (cm³)";
    svg.appendChild(nv);
    // Graduations en x : tous les 5 cm (carré) ou 2 cm (A4).
    var pasX = F.l >= 30 ? 5 : 2;
    for (var g = pasX; g < xMaxF; g += pasX) {
      var pg = toPx(g, 0);
      svg.appendChild(svgEl(ns, "line", { x1: pg[0], y1: pg[1], x2: pg[0], y2: pg[1] + 4, class: "axe" }));
      var tg = svgEl(ns, "text", { x: pg[0], y: pg[1] + 15, "text-anchor": "middle", class: "grad" });
      tg.textContent = formatNombreFr(g, 0);
      svg.appendChild(tg);
    }
    // Courbe V sur ]0 ; l/2[.
    var d = "";
    for (var i = 0; i <= 160; i++) {
      var xx = (i / 160) * xMaxF;
      var p = toPx(xx, V(F, xx));
      d += (i === 0 ? "M" : "L") + p[0].toFixed(2) + " " + p[1].toFixed(2) + " ";
    }
    svg.appendChild(svgEl(ns, "path", { d: d.trim(), class: "courbe" }));
    // Maximum.
    var pm = toPx(xo, vMaxi);
    svg.appendChild(svgEl(ns, "line", { x1: pm[0], y1: pm[1], x2: pm[0], y2: o[1], class: "repere" }));
    svg.appendChild(svgEl(ns, "line", { x1: o[0], y1: pm[1], x2: pm[0], y2: pm[1], class: "repere" }));
    svg.appendChild(svgEl(ns, "circle", { cx: pm[0], cy: pm[1], r: 5, class: "point-max" }));
    var etm = svgEl(ns, "text", { x: pm[0] + 8, y: pm[1] - 8, class: "et-max" });
    etm.textContent = "max : x ≈ " + formatNombreFr(xo, 2) + " ; V ≈ " + formatNombreFr(vMaxi, 1);
    svg.appendChild(etm);
    // Point courant.
    var pc = toPx(x, V(F, x));
    svg.appendChild(svgEl(ns, "line", { x1: pc[0], y1: pc[1], x2: pc[0], y2: o[1], class: "guide" }));
    svg.appendChild(svgEl(ns, "circle", { cx: pc[0], cy: pc[1], r: 5.5, class: "point" }));
  };

  if (!customElements.get("boite-carton-widget")) {
    customElements.define("boite-carton-widget", BoiteCartonWidgetClass);
  }
})();
