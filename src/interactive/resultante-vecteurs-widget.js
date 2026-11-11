(function () {
  "use strict";

  /* ================================================================
   * <resultante-vecteurs-widget> — atelier interactif : F₁, F₂ (en N)
   * et θ, l'angle entre les deux forces — règle du parallélogramme en
   * direct, avec :
   *  - la loi des cosinus et l'explication du signe « + » : dans le
   *    triangle formé par F₁ et le côté opposé du parallélogramme,
   *    l'angle opposé à R vaut 180° − θ, et cos(180° − θ) = −cos θ ;
   *  - la méthode par les composantes (F₁ sur l'axe horizontal) ;
   *  - la déviation correcte même quand elle est obtuse (Rₓ < 0), là où
   *    sin⁻¹ ne renvoie que l'angle aigu.
   * Défaut F₁ = 50 N, F₂ = 30 N, θ = 60° → R = 70 N, déviation ≈ 21,8°
   * (l'exemple résolu). Préréglage « cas obtus » : 20 N, 40 N, 135° →
   * R ≈ 29,47 N, déviation ≈ 106,3°. Web Component (Shadow DOM).
   * ================================================================ */

  var D2R = Math.PI / 180;
  var PRESETS = {
    cours: { f1: 50, f2: 30, theta: 60 },
    obtus: { f1: 20, f2: 40, theta: 135 },
  };
  var DEFAUT = PRESETS.cours;
  var BORNES_F = { min: 20, max: 70, step: 1 };
  var BORNES_THETA = { min: 20, max: 160, step: 1 };
  var ECHELLE = 0.08;

  var X_MIN = -6, X_MAX = 13, Y_MIN = -2, Y_MAX = 7;
  var LARGEUR = 420, HAUTEUR = 230, MARGE = 18;
  var NS = "http://www.w3.org/2000/svg";

  function moins(s) { return s.replace(/-/g, "−"); }
  function fmt(n, d) {
    var f = Math.pow(10, d), r = Math.round(n * f) / f;
    if (Object.is(r, -0)) r = 0;
    return moins(r.toFixed(d).replace(".", ","));
  }
  /** Valeur exacte écrite sans décimales inutiles, sinon « ≈ » + arrondi à d décimales. */
  function val(n, d) {
    var f = Math.pow(10, d), r = Math.round(n * f) / f;
    if (Object.is(r, -0)) r = 0;
    if (Math.abs(n - Math.round(n)) < 1e-9) return moins(String(Math.round(n)));
    if (Math.abs(n - r) < 1e-9) return moins(String(r).replace(".", ","));
    return "≈ " + fmt(n, d);
  }
  function brut(n, d) { // sans « ≈ », pour l'intérieur d'un calcul
    if (Math.abs(n - Math.round(n)) < 1e-9) return moins(String(Math.round(n)));
    return fmt(n, d);
  }
  function eqv(n, d) { var v = val(n, d); return v.charAt(0) === "≈" ? v : "= " + v; }
  function par(t, n) { return n < 0 ? "(" + t + ")" : t; }

  /** Petite flèche de vecteur tracée au-dessus d'un <text> SVG déjà inséré (le caractère combinant
   * U+20D7 n'est pas rendu par toutes les polices). */
  function flecheSur(svg, texte, classe) {
    var bb;
    try { bb = texte.getBBox(); } catch (e) { return; }
    if (!bb || !bb.width) return;
    var y = bb.y + 1.2, x1 = bb.x + 0.5, x2 = bb.x + bb.width + 1.5;
    var l = document.createElementNS("http://www.w3.org/2000/svg", "line");
    l.setAttribute("x1", x1.toFixed(2)); l.setAttribute("x2", (x2 - 3).toFixed(2));
    l.setAttribute("y1", y.toFixed(2)); l.setAttribute("y2", y.toFixed(2));
    l.setAttribute("class", "vf " + classe);
    svg.appendChild(l);
    var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("d", "M" + x2.toFixed(2) + " " + y.toFixed(2) + " L" + (x2 - 5).toFixed(2) + " " + (y - 2.6).toFixed(2) + " L" + (x2 - 5).toFixed(2) + " " + (y + 2.6).toFixed(2) + " Z");
    p.setAttribute("class", "vf-tete " + classe);
    svg.appendChild(p);
  }

  function svgEl(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    for (var key in attrs) el.setAttribute(key, attrs[key]);
    return el;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}' +
    '*{box-sizing:border-box;}' +
    '.presets{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-bottom:12px;}' +
    '.presets button{flex:1 1 0;min-width:140px;max-width:240px;min-height:44px;padding:8px 10px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);font-weight:700;cursor:pointer;font-size:0.86rem;font-family:inherit;}' +
    '.presets button[aria-pressed="true"]{border-color:var(--accent,#a8471f);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:520px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.2;}' +
    '.fl-axe{fill:var(--ink-soft,#6b6055);}' +
    '.fl-f1{fill:var(--good,#2f7a4f);}' +
    '.fl-f2{fill:var(--attn,#a8791f);}' +
    '.fl-r{fill:var(--accent,#a8471f);}' +
    '.vecteur-f1{stroke:var(--good,#2f7a4f);stroke-width:2.4;}' +
    '.vecteur-f2{stroke:var(--attn,#a8791f);stroke-width:2.4;}' +
    '.vecteur-r{stroke:var(--accent,#a8471f);stroke-width:2.8;}' +
    '.parallelogramme{stroke:var(--ink-faint,#9c9083);stroke-width:1.2;stroke-dasharray:4 3;}' +
    '.projection{stroke:var(--accent,#a8471f);stroke-width:1;stroke-dasharray:2 3;opacity:0.8;}' +
    '.arc-theta{stroke:var(--attn,#a8791f);stroke-width:1.5;fill:none;}' +
    '.arc-oppose{stroke:var(--plan,#6b4fa0);stroke-width:1.6;fill:none;}' +
    '.etiquette{font-size:12.5px;font-weight:700;font-family:var(--sans,sans-serif);paint-order:stroke;stroke:var(--surface-2,#faf6f0);stroke-width:3px;stroke-linejoin:round;}' +
    '.et-f1{fill:var(--good,#2f7a4f);}' +
    '.et-f2{fill:var(--attn-ink,#7a5a12);}' +
    '.et-r{fill:var(--accent-ink,#7a3212);}' +
    '.et-plan{fill:var(--plan,#6b4fa0);}' +
    '.vec{position:relative;display:inline-block;padding-top:0.18em;line-height:1.1;}' +
    '.vec::before{content:"";position:absolute;left:0.04em;right:0.12em;top:0.04em;border-top:1.5px solid currentColor;}' +
    '.vec::after{content:"";position:absolute;right:-0.06em;top:calc(0.04em + 0.75px - 0.21em);border-top:0.21em solid transparent;border-bottom:0.21em solid transparent;border-left:0.34em solid currentColor;}' +
    '.vf{stroke-width:1.5;}' +
    '.vf-f1{stroke:var(--good,#2f7a4f);fill:var(--good,#2f7a4f);}' +
    '.vf-f2{stroke:var(--attn-ink,#7a5a12);fill:var(--attn-ink,#7a5a12);}' +
    '.vf-r{stroke:var(--accent-ink,#7a3212);fill:var(--accent-ink,#7a3212);}' +
    '.lecture{display:flex;flex-direction:column;gap:8px;margin:0 0 16px;font-variant-numeric:tabular-nums;}' +
    '.bloc{padding:10px 12px;border-radius:var(--radius,3px);background:var(--surface-2,#faf6f0);font-size:0.88rem;line-height:1.6;}' +
    '.bloc h4{margin:0 0 4px;font-size:0.78rem;letter-spacing:0.04em;color:var(--ink-soft,#6b6055);font-family:var(--mono,ui-monospace,monospace);font-weight:600;}' +
    '.bloc .res{font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.bloc.signe{border-left:3px solid var(--plan,#6b4fa0);}' +
    '.bloc.alerte{border-left:3px solid var(--bad,#b23a3a);}' +
    '.alerte .res{color:var(--bad,#b23a3a);}' +
    '.controles{display:flex;flex-direction:column;gap:10px;}' +
    '.curseur{display:flex;flex-direction:column;gap:2px;}' +
    '.curseur label{font-weight:700;color:var(--accent-ink,#7a3212);font-size:0.9rem;}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-height:44px;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;font-size:0.92rem;}' +
    'button:focus-visible,input:focus-visible{outline:2px solid var(--accent,#a8471f);outline-offset:2px;}' +
    '</style>' +
    '<div class="presets" id="presets" role="group" aria-label="Réglages prêts">' +
    '<button type="button" data-preset="cours">Exemple du cours (50 N, 30 N, 60°)</button>' +
    '<button type="button" data-preset="obtus">Déviation obtuse (20 N, 40 N, 135°)</button>' +
    '</div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Parallélogramme des forces"></svg></div>' +
    '<div class="lecture" id="lecture" aria-live="polite"></div>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="f1">F₁ (N)</label><div class="curseur-row">' +
    '<input type="range" id="f1" min="' + BORNES_F.min + '" max="' + BORNES_F.max + '" step="' + BORNES_F.step + '" value="' + DEFAUT.f1 + '">' +
    '<span class="curseur-valeur" id="f1-valeur"></span></div></div>' +
    '<div class="curseur"><label for="f2">F₂ (N)</label><div class="curseur-row">' +
    '<input type="range" id="f2" min="' + BORNES_F.min + '" max="' + BORNES_F.max + '" step="' + BORNES_F.step + '" value="' + DEFAUT.f2 + '">' +
    '<span class="curseur-valeur" id="f2-valeur"></span></div></div>' +
    '<div class="curseur"><label for="theta">θ, l\'angle entre F₁ et F₂</label><div class="curseur-row">' +
    '<input type="range" id="theta" min="' + BORNES_THETA.min + '" max="' + BORNES_THETA.max + '" step="' + BORNES_THETA.step + '" value="' + DEFAUT.theta + '">' +
    '<span class="curseur-valeur" id="theta-valeur"></span></div></div>' +
    '</div>';

  class ResultanteVecteursWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  ResultanteVecteursWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._f1 = DEFAUT.f1; this._f2 = DEFAUT.f2; this._theta = DEFAUT.theta;
    this._svg = shadow.getElementById("svg");
    this._lecture = shadow.getElementById("lecture");
    this._presets = shadow.getElementById("presets");
    this._inputF1 = shadow.getElementById("f1");
    this._inputF2 = shadow.getElementById("f2");
    this._inputTheta = shadow.getElementById("theta");
    this._valeurF1 = shadow.getElementById("f1-valeur");
    this._valeurF2 = shadow.getElementById("f2-valeur");
    this._valeurTheta = shadow.getElementById("theta-valeur");
  };

  ResultanteVecteursWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInputF1 = function () { self._f1 = parseFloat(self._inputF1.value); self._rendre(); };
    this._onInputF2 = function () { self._f2 = parseFloat(self._inputF2.value); self._rendre(); };
    this._onInputTheta = function () { self._theta = parseFloat(self._inputTheta.value); self._rendre(); };
    this._onPreset = function (e) {
      var b = e.target.closest("button[data-preset]");
      if (!b) return;
      var p = PRESETS[b.getAttribute("data-preset")];
      self._f1 = p.f1; self._f2 = p.f2; self._theta = p.theta;
      self._inputF1.value = String(p.f1);
      self._inputF2.value = String(p.f2);
      self._inputTheta.value = String(p.theta);
      self._rendre();
    };
    this._inputF1.addEventListener("input", this._onInputF1);
    this._inputF2.addEventListener("input", this._onInputF2);
    this._inputTheta.addEventListener("input", this._onInputTheta);
    this._presets.addEventListener("click", this._onPreset);
    this._rendre();
  };

  ResultanteVecteursWidgetClass.prototype.disconnectedCallback = function () {
    this._inputF1.removeEventListener("input", this._onInputF1);
    this._inputF2.removeEventListener("input", this._onInputF2);
    this._inputTheta.removeEventListener("input", this._onInputTheta);
    this._presets.removeEventListener("click", this._onPreset);
  };

  ResultanteVecteursWidgetClass.prototype._toPx = function (x, y) {
    return [
      MARGE + (x - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - 2 * MARGE),
      HAUTEUR - MARGE - (y - Y_MIN) / (Y_MAX - Y_MIN) * (HAUTEUR - 2 * MARGE),
    ];
  };

  /** Arc de cercle (en pixels) de l'angle a1 à l'angle a2 (degrés, sens direct, repère mathématique). */
  function arc(c, r, a1, a2, classe) {
    var p1 = [c[0] + r * Math.cos(a1 * D2R), c[1] - r * Math.sin(a1 * D2R)];
    var p2 = [c[0] + r * Math.cos(a2 * D2R), c[1] - r * Math.sin(a2 * D2R)];
    var grand = a2 - a1 > 180 ? 1 : 0;
    return svgEl("path", { d: "M" + p1[0].toFixed(2) + " " + p1[1].toFixed(2) + " A" + r + " " + r + " 0 " + grand + " 0 " + p2[0].toFixed(2) + " " + p2[1].toFixed(2), class: classe });
  }

  ResultanteVecteursWidgetClass.prototype._rendre = function () {
    var f1 = this._f1, f2 = this._f2, th = this._theta;
    this._valeurF1.textContent = fmt(f1, 0) + " N";
    this._valeurF2.textContent = fmt(f2, 0) + " N";
    this._valeurTheta.textContent = fmt(th, 0) + "°";
    var self = this;
    Array.prototype.forEach.call(this._presets.querySelectorAll("button"), function (b) {
      var p = PRESETS[b.getAttribute("data-preset")];
      b.setAttribute("aria-pressed", p.f1 === f1 && p.f2 === f2 && p.theta === th ? "true" : "false");
    });

    var t = th * D2R;
    var f2x = f2 * Math.cos(t), f2y = f2 * Math.sin(t);
    var rx = f1 + f2x, ry = f2y;
    var r2 = f1 * f1 + f2 * f2 + 2 * f1 * f2 * Math.cos(t);
    var r = Math.sqrt(r2);
    var sinDev = f2 * Math.sin(t) / r;
    var alpha0 = Math.asin(Math.max(-1, Math.min(1, sinDev))) / D2R;
    var dev = Math.atan2(ry, rx) / D2R; // entre 0° et 180°
    var obtus = rx < -1e-9;
    var droit = Math.abs(rx) < 1e-9;

    // ---------- figure ----------
    var svg = this._svg;
    svg.innerHTML = "";
    var defs = svgEl("defs", {});
    ["fl-axe", "fl-f1", "fl-f2", "fl-r"].forEach(function (id) {
      var mk = svgEl("marker", { id: id, markerWidth: "9", markerHeight: "9", refX: "7", refY: "4.5", orient: "auto", markerUnits: "userSpaceOnUse" });
      mk.appendChild(svgEl("path", { d: "M0,0 L9,4.5 L0,9 Z", class: id }));
      defs.appendChild(mk);
    });
    svg.appendChild(defs);

    var o = this._toPx(0, 0);
    svg.appendChild(svgEl("line", { x1: MARGE, x2: LARGEUR - MARGE + 4, y1: o[1].toFixed(2), y2: o[1].toFixed(2), class: "axe", "marker-end": "url(#fl-axe)" }));
    svg.appendChild(svgEl("line", { x1: o[0].toFixed(2), x2: o[0].toFixed(2), y1: HAUTEUR - MARGE, y2: MARGE - 4, class: "axe", "marker-end": "url(#fl-axe)" }));

    var p1 = this._toPx(f1 * ECHELLE, 0), p2 = this._toPx(f2x * ECHELLE, f2y * ECHELLE), pR = this._toPx(rx * ECHELLE, ry * ECHELLE);
    var pRx = this._toPx(rx * ECHELLE, 0);

    svg.appendChild(svgEl("line", { x1: p1[0].toFixed(2), y1: p1[1].toFixed(2), x2: pR[0].toFixed(2), y2: pR[1].toFixed(2), class: "parallelogramme" }));
    svg.appendChild(svgEl("line", { x1: p2[0].toFixed(2), y1: p2[1].toFixed(2), x2: pR[0].toFixed(2), y2: pR[1].toFixed(2), class: "parallelogramme" }));
    svg.appendChild(svgEl("line", { x1: pR[0].toFixed(2), y1: pR[1].toFixed(2), x2: pRx[0].toFixed(2), y2: pRx[1].toFixed(2), class: "projection" }));

    // θ en O (entre F₁ et F₂) ; 180° − θ à l'extrémité de F₁ (angle du triangle opposé à R)
    svg.appendChild(arc(o, 20, 0, th, "arc-theta"));
    svg.appendChild(arc(p1, 16, th, 180, "arc-oppose"));
    var eo = svgEl("text", { x: (p1[0] - 6).toFixed(2), y: (o[1] + 16).toFixed(2), "text-anchor": "end", class: "etiquette et-plan" });
    eo.textContent = "180° − θ";
    svg.appendChild(eo);
    var mt = th / 2 * D2R;
    var et = svgEl("text", { x: (o[0] + 32 * Math.cos(mt)).toFixed(2), y: (o[1] - 32 * Math.sin(mt) + 4).toFixed(2), "text-anchor": "middle", class: "etiquette et-f2" });
    et.textContent = "θ";
    svg.appendChild(et);

    svg.appendChild(svgEl("line", { x1: o[0].toFixed(2), y1: o[1].toFixed(2), x2: p1[0].toFixed(2), y2: p1[1].toFixed(2), class: "vecteur-f1", "marker-end": "url(#fl-f1)" }));
    svg.appendChild(svgEl("line", { x1: o[0].toFixed(2), y1: o[1].toFixed(2), x2: p2[0].toFixed(2), y2: p2[1].toFixed(2), class: "vecteur-f2", "marker-end": "url(#fl-f2)" }));
    svg.appendChild(svgEl("line", { x1: o[0].toFixed(2), y1: o[1].toFixed(2), x2: pR[0].toFixed(2), y2: pR[1].toFixed(2), class: "vecteur-r", "marker-end": "url(#fl-r)" }));

    function etiquette(p, texte, classe, gauche, dy, classeFleche) {
      var e = svgEl("text", { x: (p[0] + (gauche ? -8 : 8)).toFixed(2), y: (p[1] + dy).toFixed(2), "text-anchor": gauche ? "end" : "start", class: "etiquette " + classe });
      e.textContent = texte;
      svg.appendChild(e);
      flecheSur(svg, e, classeFleche);
    }
    etiquette(p1, "F₁", "et-f1", false, 18, "vf-f1");
    etiquette(p2, "F₂", "et-f2", p2[0] < o[0] + 10, -6, "vf-f2");
    etiquette(pR, "R", "et-r", pR[0] > LARGEUR - 40, -6, "vf-r");

    // ---------- lecture ----------
    var sF1 = brut(f1, 0), sF2 = brut(f2, 0), sTh = brut(th, 0);
    var cosT = Math.cos(t);
    var html = "";
    html += '<div class="bloc"><h4>Loi des cosinus</h4>R² = ' + sF1 + '² + ' + sF2 + '² + 2 × ' + sF1 + ' × ' + sF2 + ' × cos ' + sTh + '° ' +
      eqv(r2, 2) + '<br><span class="res">R ' + eqv(r, 2) + ' N</span></div>';
    html += '<div class="bloc signe"><h4>Pourquoi « + » et pas « − » ?</h4>Dans le triangle formé par <span class=vec>F₁</span> et le côté opposé du parallélogramme, l\'angle opposé à <span class=vec>R</span> vaut 180° − θ = ' +
      brut(180 - th, 0) + '°. Al-Kashi donne R² = F₁² + F₂² − 2·F₁·F₂·cos(180° − θ), et comme cos(180° − θ) = −cos θ, le « − » devient « + ».</div>';
    html += '<div class="bloc"><h4>Par les composantes</h4><span class=vec>F₁</span>(' + sF1 + ' ; 0) et <span class=vec>F₂</span>(' + sF2 + ' · cos ' + sTh + '° ; ' + sF2 + ' · sin ' + sTh + '°) = (' +
      val(f2x, 2) + ' ; ' + val(f2y, 2) + ')<br><span class=vec>R</span> = <span class=vec>F₁</span> + <span class=vec>F₂</span> = (' + val(rx, 2) + ' ; ' + val(ry, 2) + ')<br>‖<span class=vec>R</span>‖ = √(' + par(brut(rx, 2), rx) + '² + ' + brut(ry, 2) + '²) ' +
      eqv(r, 2) + ' N — le même résultat</div>';
    var devTxt = (Math.abs(dev - Math.round(dev * 10) / 10) < 1e-9 ? "" : "≈ ") + fmt(dev, 1) + "°";
    if (obtus) {
      html += '<div class="bloc alerte"><h4>Déviation obtuse</h4>Loi des sinus : sin(déviation) = ' + sF2 + ' × sin ' + sTh + '° / R ≈ ' + fmt(sinDev, 3) +
        ' ; la calculatrice (sin⁻¹) affiche ≈ ' + fmt(alpha0, 1) + '°, un angle aigu.<br>Mais Rₓ ' + eqv(rx, 2) + ' est négatif : la résultante penche vers l\'arrière.<br>' +
        '<span class="res">Déviation = 180° − ' + fmt(alpha0, 1) + '° ' + devTxt + ' par rapport à <span class=vec>F₁</span></span></div>';
    } else {
      html += '<div class="bloc"><h4>Déviation</h4>Loi des sinus : sin(déviation) = ' + sF2 + ' × sin ' + sTh + '° / R ≈ ' + fmt(sinDev, 3) + '. ' +
        (droit ? 'Rₓ = 0 : la résultante est perpendiculaire à <span class=vec>F₁</span>.' : 'Rₓ ' + eqv(rx, 2) + ' est positif : la déviation est aiguë.') +
        '<br><span class="res">Déviation ' + devTxt + ' par rapport à <span class=vec>F₁</span></span></div>';
    }
    this._lecture.innerHTML = html;
  };

  if (!customElements.get("resultante-vecteurs-widget")) {
    customElements.define("resultante-vecteurs-widget", ResultanteVecteursWidgetClass);
  }
})();
