(function () {
  "use strict";

  /* ================================================================
   * <radian-enroule-widget> — atelier « le radian, un rayon enroulé »
   * (5e, chapitre 2, section 1). Un curseur θ (en radians) et un curseur r :
   * le rayon est reporté le long de l'arc, un morceau de longueur r par
   * radian (couleurs alternées), le secteur est ombré, et s = rθ,
   * A = ½r²θ et la conversion degrés/radians s'affichent en direct.
   * Le cercle dessiné garde TOUJOURS la même taille (r ne change que les
   * valeurs affichées) : fenêtre fixe, jamais recalculée depuis un curseur.
   * Web Component (Shadow DOM).
   * ================================================================ */

  var PI = Math.PI;
  var NS = "http://www.w3.org/2000/svg";
  var DEFAUT = { theta: 1, r: 3 };
  var L = 320, H = 300, CX = 160, CY = 150, R = 96;

  function fr(n, d) {
    var f = Math.pow(10, d);
    var v = Math.round(n * f) / f;
    if (Object.is(v, -0)) v = 0;
    return v.toFixed(d).replace(".", ",").replace("-", "−");
  }

  function el(tag, attrs, texte) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (texte !== undefined) e.textContent = texte;
    return e;
  }

  function pt(t, rayon) {
    return [CX + rayon * Math.cos(t), CY - rayon * Math.sin(t)];
  }

  function arcPath(t0, t1, rayon) {
    // Arc échantillonné (évite les cas limites de l'arc SVG pour un tour complet).
    var n = Math.max(2, Math.ceil(Math.abs(t1 - t0) / 0.04));
    var d = "";
    for (var i = 0; i <= n; i++) {
      var p = pt(t0 + (t1 - t0) * (i / n), rayon);
      d += (i === 0 ? "M" : "L") + p[0].toFixed(2) + "," + p[1].toFixed(2);
    }
    return d;
  }

  /** Multiple de π lisible quand θ en est un multiple simple (dénominateur ≤ 6), sinon null. */
  function enPi(theta) {
    var q = theta / PI;
    for (var den = 1; den <= 6; den++) {
      var num = Math.round(q * den);
      if (num !== 0 && Math.abs(q * den - num) < 1e-6) {
        var g = pgcd(Math.abs(num), den);
        num /= g; var dd = den / g;
        var numTxt = num === 1 ? "π" : num + "π";
        return dd === 1 ? numTxt : numTxt + "/" + dd;
      }
    }
    return null;
  }
  function pgcd(a, b) { return b ? pgcd(b, a % b) : a; }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}' +
    '*{box-sizing:border-box;}' +
    '.figure{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.2;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.cercle{stroke:var(--ink-faint,#9c9083);stroke-width:1.2;fill:none;stroke-dasharray:3 3;}' +
    '.secteur{fill:var(--accent,#a8471f);opacity:0.13;}' +
    '.rayon-ref{stroke:var(--plan,#5b4ea3);stroke-width:3;stroke-linecap:round;}' +
    '.rayon-fin{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.morceau-a{stroke:var(--plan,#5b4ea3);stroke-width:5;fill:none;stroke-linecap:butt;}' +
    '.morceau-b{stroke:var(--accent,#a8471f);stroke-width:5;fill:none;stroke-linecap:butt;}' +
    '.reste{stroke:var(--good,#2f7a4f);stroke-width:5;fill:none;}' +
    '.graduation{stroke:var(--ink,#241f1a);stroke-width:1.6;}' +
    '.num{font-size:12px;font-weight:700;fill:var(--ink,#241f1a);font-family:var(--sans,sans-serif);}' +
    '.angle{stroke:var(--accent,#a8471f);stroke-width:1.6;fill:none;}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.etiquette-r{font-size:13px;font-style:italic;font-weight:700;fill:var(--plan,#5b4ea3);font-family:var(--serif,serif);}' +
    '.etiquette-theta{font-size:13px;font-style:italic;font-weight:700;fill:var(--accent-ink,#7a3212);font-family:var(--serif,serif);}' +
    '.lecture{text-align:center;font-size:0.95rem;margin:0 0 6px;line-height:1.6;}' +
    '.lecture strong{color:var(--accent-ink,#7a3212);}' +
    '.stats{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin:10px 0 14px;}' +
    '.stat{flex:1 1 92px;min-width:0;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:7px 4px;text-align:center;background:var(--surface,#fff);}' +
    '.stat-label{display:block;font-family:var(--mono,monospace);font-size:10.5px;color:var(--ink-faint,#9c9083);margin-bottom:4px;}' +
    '.stat-value{display:block;font-variant-numeric:tabular-nums;font-weight:600;font-size:0.95rem;}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input{flex:1 1 auto;min-width:0;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:92px;text-align:right;font-size:0.9rem;}' +
    '.boutons{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;}' +
    'button{padding:7px 12px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.86rem;font-family:inherit;}' +
    'button:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<div class="figure"><svg id="svg" viewBox="0 0 ' + L + ' ' + H + '" role="img" aria-label="Cercle avec le rayon reporté le long de l arc"></svg></div>' +
    '<p class="lecture" id="lecture"></p>' +
    '<div class="stats">' +
    '<div class="stat"><span class="stat-label">θ en degrés</span><span class="stat-value" id="v-deg"></span></div>' +
    '<div class="stat"><span class="stat-label">arc s = r·θ</span><span class="stat-value" id="v-s"></span></div>' +
    '<div class="stat"><span class="stat-label">secteur A = ½·r²·θ</span><span class="stat-value" id="v-a"></span></div>' +
    '</div>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="theta">θ (en radians)</label><div class="curseur-row">' +
    '<input type="range" id="theta" min="0" max="6.3" step="0.01" value="' + DEFAUT.theta + '">' +
    '<span class="curseur-valeur" id="theta-valeur"></span></div></div>' +
    '<div class="curseur"><label for="r">r (rayon, en cm)</label><div class="curseur-row">' +
    '<input type="range" id="r" min="1" max="10" step="0.5" value="' + DEFAUT.r + '">' +
    '<span class="curseur-valeur" id="r-valeur"></span></div></div>' +
    '<div class="boutons">' +
    '<button type="button" data-theta="1">θ = 1 rad</button>' +
    '<button type="button" data-theta="pi2">θ = π/2</button>' +
    '<button type="button" data-theta="pi">θ = π</button>' +
    '<button type="button" data-theta="2pi">θ = 2π (un tour)</button>' +
    '</div></div>';

  class RadianEnrouleWidget extends HTMLElement {
    constructor() {
      super();
      var sr = this.attachShadow({ mode: "open" });
      sr.appendChild(TEMPLATE.content.cloneNode(true));
      this._theta = DEFAUT.theta;
      this._r = DEFAUT.r;
      this._svg = sr.getElementById("svg");
      this._inTheta = sr.getElementById("theta");
      this._inR = sr.getElementById("r");
      this._boutons = Array.prototype.slice.call(sr.querySelectorAll("button[data-theta]"));
    }

    connectedCallback() {
      var self = this;
      this._onTheta = function () {
        var v = parseFloat(self._inTheta.value);
        // Aimants doux : 1, 2, …, 6 rad et 2π (le curseur va jusqu'à 6,3).
        var aimants = [1, 2, 3, 4, 5, 6, PI / 2, PI, 2 * PI];
        for (var i = 0; i < aimants.length; i++) if (Math.abs(v - aimants[i]) < 0.025) v = aimants[i];
        self._theta = Math.min(v, 2 * PI);
        self._rendre();
      };
      this._onR = function () { self._r = parseFloat(self._inR.value); self._rendre(); };
      this._onBouton = function (e) {
        var k = e.currentTarget.getAttribute("data-theta");
        self._theta = k === "1" ? 1 : k === "pi2" ? PI / 2 : k === "pi" ? PI : 2 * PI;
        self._inTheta.value = String(self._theta);
        self._rendre();
      };
      this._inTheta.addEventListener("input", this._onTheta);
      this._inR.addEventListener("input", this._onR);
      this._boutons.forEach(function (b) { b.addEventListener("click", self._onBouton); });
      this._rendre();
    }

    disconnectedCallback() {
      var self = this;
      this._inTheta.removeEventListener("input", this._onTheta);
      this._inR.removeEventListener("input", this._onR);
      this._boutons.forEach(function (b) { b.removeEventListener("click", self._onBouton); });
    }

    _rendre() {
      var th = this._theta, r = this._r, svg = this._svg, sr = this.shadowRoot;
      svg.innerHTML = "";
      var defs = el("defs", {});
      var m = el("marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      m.appendChild(el("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(m);
      svg.appendChild(defs);

      svg.appendChild(el("line", { x1: CX - R - 30, y1: CY, x2: CX + R + 34, y2: CY, class: "axe", "marker-end": "url(#fleche)" }));
      svg.appendChild(el("line", { x1: CX, y1: CY + R + 30, x2: CX, y2: CY - R - 30, class: "axe", "marker-end": "url(#fleche)" }));
      svg.appendChild(el("circle", { cx: CX, cy: CY, r: R, class: "cercle" }));

      // Secteur ombré.
      if (th > 0.001) {
        var dSect = "M" + CX + "," + CY + " " + arcPath(0, th, R).replace(/^M/, "L") + " Z";
        svg.appendChild(el("path", { d: dSect, class: "secteur" }));
      }

      // Rayon de référence (sur l'axe) et rayon final.
      svg.appendChild(el("line", { x1: CX, y1: CY, x2: CX + R, y2: CY, class: "rayon-ref" }));
      var tR = el("text", { x: CX + R / 2, y: CY + 17, "text-anchor": "middle", class: "etiquette-r" }, "r");
      svg.appendChild(tR);
      var pf = pt(th, R);
      if (th > 0.001) svg.appendChild(el("line", { x1: CX, y1: CY, x2: pf[0].toFixed(2), y2: pf[1].toFixed(2), class: "rayon-fin" }));

      // Le rayon reporté sur l'arc : un morceau par radian entier, puis le reste.
      var entiers = Math.floor(th + 1e-9);
      for (var k = 0; k < entiers; k++) {
        svg.appendChild(el("path", { d: arcPath(k, k + 1, R), class: k % 2 === 0 ? "morceau-a" : "morceau-b" }));
      }
      var reste = th - entiers;
      if (reste > 0.005) svg.appendChild(el("path", { d: arcPath(entiers, th, R), class: "reste" }));

      // Graduations à chaque radian entier atteint, numérotées.
      for (var g = 1; g <= entiers; g++) {
        var a1 = pt(g, R - 7), a2 = pt(g, R + 7), lab = pt(g, R + 20);
        svg.appendChild(el("line", { x1: a1[0].toFixed(2), y1: a1[1].toFixed(2), x2: a2[0].toFixed(2), y2: a2[1].toFixed(2), class: "graduation" }));
        svg.appendChild(el("text", { x: lab[0].toFixed(2), y: (lab[1] + 4).toFixed(2), "text-anchor": "middle", class: "num" }, String(g)));
      }

      // Petit arc d'angle θ près du centre, et étiquette θ.
      if (th > 0.02) {
        svg.appendChild(el("path", { d: arcPath(0, th, 24), class: "angle" }));
        var pl = pt(th / 2, 38);
        svg.appendChild(el("text", { x: pl[0].toFixed(2), y: (pl[1] + 4).toFixed(2), "text-anchor": "middle", class: "etiquette-theta" }, "θ"));
      }

      // Légende de la figure, en haut à gauche.
      svg.appendChild(el("text", { x: 10, y: 20, class: "etiquette" }, "chaque trait coloré = un rayon r"));

      // Valeurs.
      var deg = th * 180 / PI;
      var piTxt = enPi(th);
      sr.getElementById("theta-valeur").textContent = fr(th, 2) + " rad" + (piTxt ? " = " + piTxt : "");
      sr.getElementById("r-valeur").textContent = fr(r, 1) + " cm";
      sr.getElementById("v-deg").textContent = fr(deg, 1) + "°";
      sr.getElementById("v-s").textContent = fr(r * th, 2) + " cm";
      sr.getElementById("v-a").textContent = fr(0.5 * r * r * th, 2) + " cm²";

      var lecture;
      if (Math.abs(th - 2 * PI) < 1e-9) {
        lecture = "Un tour complet : <strong>2π ≈ 6,28 rayons</strong> enroulés — c'est pourquoi 360° = 2π rad, et le périmètre vaut 2πr.";
      } else if (th < 0.005) {
        lecture = "Fais grandir θ : le rayon r va s'enrouler le long du cercle.";
      } else {
        lecture = "L'arc contient <strong>" + fr(th, 2) + (th < 2 ? " rayon" : " rayons") + "</strong> : " +
          (entiers > 0 ? entiers + " rayon" + (entiers > 1 ? "s" : "") + " entier" + (entiers > 1 ? "s" : "") : "aucun rayon entier") +
          (reste > 0.005 ? " et " + fr(reste, 2) + " d'un rayon" : "") +
          ". Donc θ = " + fr(th, 2) + " rad" + (piTxt ? " = " + piTxt : "") + ".";
      }
      sr.getElementById("lecture").innerHTML = lecture;
    }
  }

  if (!customElements.get("radian-enroule-widget")) customElements.define("radian-enroule-widget", RadianEnrouleWidget);
})();
