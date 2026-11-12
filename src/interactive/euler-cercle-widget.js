(function () {
  "use strict";

  /* ================================================================
   * <euler-cercle-widget> — atelier « e^{iθ}, le point qui tourne »
   * (6e, ch. 5, §4). Un curseur θ (de 0° à 360°) place le point e^{iθ}
   * sur le cercle unité ; ses projections donnent cos θ (sur l'axe réel)
   * et sin θ (sur l'axe imaginaire) : e^{iθ} = cos θ + i sin θ, avec les
   * valeurs exactes aux angles remarquables. Un bouton (et un aimant
   * autour de 180°) met en scène θ = π : e^{iπ} = −1, soit
   * e^{iπ} + 1 = 0, l'identité d'Euler. Fenêtre FIXE [−1,5 ; 1,5]².
   * Les exposants sont écrits en <sup> HTML (jamais de « ^ »).
   * ================================================================ */

  var NS = "http://www.w3.org/2000/svg";
  var X_MIN = -1.5, X_MAX = 1.5, Y_MIN = -1.5, Y_MAX = 1.5;
  var LARGEUR = 360, HAUTEUR = 360, MARGE = 18;
  var DEFAUT = 60;
  var AIMANT = 3; // degrés autour de 180°
  var D2R = Math.PI / 180;

  // Valeurs exactes de (cos, sin) aux angles remarquables (degrés, dans [0 ; 360[).
  var EXACT = {
    0: ["1", "0"], 30: ["√3/2", "1/2"], 45: ["√2/2", "√2/2"], 60: ["1/2", "√3/2"], 90: ["0", "1"],
    120: ["−1/2", "√3/2"], 135: ["−√2/2", "√2/2"], 150: ["−√3/2", "1/2"], 180: ["−1", "0"],
    210: ["−√3/2", "−1/2"], 225: ["−√2/2", "−√2/2"], 240: ["−1/2", "−√3/2"], 270: ["0", "−1"],
    300: ["1/2", "−√3/2"], 315: ["√2/2", "−√2/2"], 330: ["√3/2", "−1/2"],
  };

  function arrondi(n, d) {
    var f = Math.pow(10, d);
    var r = Math.round(n * f) / f;
    return Object.is(r, -0) ? 0 : r;
  }
  function fmt(n, d) {
    if (d === undefined) d = 2;
    var s = String(arrondi(n, d));
    if (s.indexOf("e") >= 0) s = arrondi(n, d).toFixed(d);
    return s.replace(".", ",").replace("-", "−");
  }
  function pgcd(a, b) { return b ? pgcd(b, a % b) : a; }
  /** θ en multiple de π quand θ est un multiple de 15° : « π/3 », « 2π/3 », « π », « 0 ». */
  function enPi(deg) {
    if (deg % 15 !== 0) return null;
    var num = deg / 15, den = 12;
    if (num === 0) return "0";
    var g = pgcd(num, den);
    num /= g; den /= g;
    var n = num === 1 ? "π" : num + "π";
    return den === 1 ? n : n + "/" + den;
  }
  function svgEl(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:10px;}' +
    'svg{width:100%;max-width:360px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.cercle{fill:none;stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.repere{fill:var(--ink-soft,#6b6055);}' +
    '.repere-t{font-size:11px;fill:var(--ink-soft,#6b6055);font-family:var(--serif,serif);font-style:italic;}' +
    '.axe-nom{font-size:10px;font-weight:700;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.rayon{stroke:var(--accent,#a8471f);stroke-width:2;}' +
    '.arc{fill:none;stroke:var(--plan,#6b4fa0);stroke-width:1.6;}' +
    '.proj{stroke:var(--ink-faint,#9a8f84);stroke-width:1.1;stroke-dasharray:4 3;}' +
    '.seg-cos{stroke:var(--accent,#a8471f);stroke-width:4;stroke-linecap:round;opacity:0.75;}' +
    '.seg-sin{stroke:var(--good,#2f7a4f);stroke-width:4;stroke-linecap:round;opacity:0.75;}' +
    '.pt{fill:var(--accent,#a8471f);}' +
    '.pt-euler{fill:var(--bad,#b23a3a);}' +
    '.et-cos{font-size:11px;font-weight:700;fill:var(--accent-ink,#7a3212);font-family:var(--sans,sans-serif);}' +
    '.et-sin{font-size:11px;font-weight:700;fill:var(--good,#2f7a4f);font-family:var(--sans,sans-serif);}' +
    '.et-theta{font-size:12px;font-weight:700;fill:var(--plan,#6b4fa0);font-family:var(--serif,serif);font-style:italic;}' +
    '.et-pt{font-size:12px;font-weight:700;fill:var(--accent-ink,#7a3212);font-family:var(--serif,serif);font-style:italic;}' +
    '.lecture{text-align:center;font-size:0.95rem;margin:0 0 12px;padding:10px 12px;border-radius:var(--radius,3px);color:var(--ink,#2b2622);background:var(--surface-2,#faf6f0);line-height:1.8;font-variant-numeric:tabular-nums;overflow-wrap:anywhere;}' +
    '.lecture .c{color:var(--accent-ink,#7a3212);font-weight:700;}' +
    '.lecture .s{color:var(--good,#2f7a4f);font-weight:700;}' +
    '.lecture sup{font-size:0.72em;}' +
    '.euler{display:block;margin-top:6px;padding:6px 8px;border-radius:var(--radius,3px);border:1px solid var(--bad,#b23a3a);color:var(--bad,#b23a3a);font-weight:700;}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--plan,#6b4fa0);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-width:0;accent-color:var(--plan,#6b4fa0);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:96px;text-align:right;padding-right:2px;font-size:0.92rem;}' +
    '.boutons{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;}' +
    'button{padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;}' +
    'button:disabled{opacity:0.6;cursor:default;}' +
    '</style>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" role="img" aria-label="Cercle unité et point e puissance i thêta"></svg></div>' +
    '<p class="lecture" id="lecture"></p>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="theta">θ (angle)</label><div class="curseur-row">' +
    '<input type="range" id="theta" min="0" max="360" step="1" value="' + DEFAUT + '">' +
    '<span class="curseur-valeur" id="theta-valeur"></span></div></div>' +
    '<div class="boutons">' +
    '<button type="button" id="pi">θ = π</button>' +
    '<button type="button" id="anim">Faire un tour</button>' +
    '<button type="button" id="reset">Réinitialiser</button>' +
    '</div></div>';

  class EulerCercleWidget extends HTMLElement {
    constructor() {
      super();
      var s = this.attachShadow({ mode: "open" });
      s.appendChild(TEMPLATE.content.cloneNode(true));
      this._theta = DEFAUT;
      this._anim = null;
      this._svg = s.getElementById("svg");
      this._lecture = s.getElementById("lecture");
      this._in = s.getElementById("theta");
      this._val = s.getElementById("theta-valeur");
      this._btnPi = s.getElementById("pi");
      this._btnAnim = s.getElementById("anim");
      this._btnReset = s.getElementById("reset");
    }

    connectedCallback() {
      var self = this;
      this._onInput = function () {
        self._stop();
        var t = parseFloat(self._in.value);
        if (Math.abs(t - 180) <= AIMANT) t = 180; // aimant : θ = π
        self._theta = t;
        self._rendre();
      };
      this._onPi = function () { self._stop(); self._theta = 180; self._rendre(); };
      this._onReset = function () { self._stop(); self._theta = DEFAUT; self._rendre(); };
      this._onAnim = function () { self._animer(); };
      this._in.addEventListener("input", this._onInput);
      this._btnPi.addEventListener("click", this._onPi);
      this._btnReset.addEventListener("click", this._onReset);
      this._btnAnim.addEventListener("click", this._onAnim);
      this._rendre();
    }

    disconnectedCallback() {
      this._stop();
      this._in.removeEventListener("input", this._onInput);
      this._btnPi.removeEventListener("click", this._onPi);
      this._btnReset.removeEventListener("click", this._onReset);
      this._btnAnim.removeEventListener("click", this._onAnim);
    }

    _stop() {
      if (this._anim) { cancelAnimationFrame(this._anim); this._anim = null; }
      this._btnAnim.disabled = false;
    }

    _animer() {
      var self = this, t0 = null, duree = 4000;
      this._stop();
      this._btnAnim.disabled = true;
      var pas = function (t) {
        if (t0 === null) t0 = t;
        var u = Math.min(1, (t - t0) / duree);
        self._theta = Math.round(360 * u);
        self._rendre();
        if (u < 1) self._anim = requestAnimationFrame(pas);
        else { self._anim = null; self._btnAnim.disabled = false; }
      };
      this._anim = requestAnimationFrame(pas);
    }

    _px(x, y) {
      return [
        MARGE + (x - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - 2 * MARGE),
        HAUTEUR - MARGE - (y - Y_MIN) / (Y_MAX - Y_MIN) * (HAUTEUR - 2 * MARGE),
      ];
    }

    _rendre() {
      var self = this, svg = this._svg, deg = this._theta;
      this._in.value = String(deg);
      var pi = enPi(deg);
      this._val.textContent = fmt(deg, 0) + "°" + (pi !== null ? " = " + pi : " ≈ " + fmt(deg * D2R, 2) + " rad");

      var t = deg * D2R, c = Math.cos(t), s = Math.sin(t);
      svg.innerHTML = "";
      var defs = svgEl("defs", {});
      var m = svgEl("marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      m.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(m);
      var ma = svgEl("marker", { id: "fleche-arc", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      ma.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", fill: "var(--plan,#6b4fa0)" }));
      defs.appendChild(ma);
      svg.appendChild(defs);

      var O = self._px(0, 0);
      var echelle = (LARGEUR - 2 * MARGE) / (X_MAX - X_MIN);
      svg.appendChild(svgEl("line", { x1: MARGE, x2: LARGEUR - MARGE, y1: O[1], y2: O[1], class: "axe", "marker-end": "url(#fleche)" }));
      svg.appendChild(svgEl("line", { x1: O[0], x2: O[0], y1: HAUTEUR - MARGE, y2: MARGE, class: "axe", "marker-end": "url(#fleche)" }));
      var re = svgEl("text", { x: LARGEUR - MARGE - 2, y: O[1] - 6, "text-anchor": "end", class: "axe-nom" });
      re.textContent = "Re";
      svg.appendChild(re);
      var im = svgEl("text", { x: O[0] + 6, y: MARGE + 8, class: "axe-nom" });
      im.textContent = "Im";
      svg.appendChild(im);
      svg.appendChild(svgEl("circle", { cx: O[0], cy: O[1], r: echelle.toFixed(2), class: "cercle" }));

      // Repères 1, −1, i, −i.
      [[1, 0, "1", 6, 14], [-1, 0, "−1", -8, 14], [0, 1, "i", 6, -6], [0, -1, "−i", 6, 14]].forEach(function (q) {
        var P = self._px(q[0], q[1]);
        svg.appendChild(svgEl("circle", { cx: P[0], cy: P[1], r: 2.5, class: "repere" }));
        var el = svgEl("text", { x: P[0] + q[3], y: P[1] + q[4], "text-anchor": q[3] < 0 ? "end" : "start", class: "repere-t" });
        el.textContent = q[2];
        svg.appendChild(el);
      });

      var P = self._px(c, s), Pc = self._px(c, 0), Ps = self._px(0, s);
      // Projections.
      if (Math.abs(s) > 1e-9) svg.appendChild(svgEl("line", { x1: P[0].toFixed(2), y1: P[1].toFixed(2), x2: Pc[0].toFixed(2), y2: Pc[1].toFixed(2), class: "proj" }));
      if (Math.abs(c) > 1e-9) svg.appendChild(svgEl("line", { x1: P[0].toFixed(2), y1: P[1].toFixed(2), x2: Ps[0].toFixed(2), y2: Ps[1].toFixed(2), class: "proj" }));
      // Segments cos θ et sin θ sur les axes.
      if (Math.abs(c) > 1e-9) svg.appendChild(svgEl("line", { x1: O[0], y1: O[1], x2: Pc[0].toFixed(2), y2: Pc[1].toFixed(2), class: "seg-cos" }));
      if (Math.abs(s) > 1e-9) svg.appendChild(svgEl("line", { x1: O[0], y1: O[1], x2: Ps[0].toFixed(2), y2: Ps[1].toFixed(2), class: "seg-sin" }));
      // Arc de l'angle θ.
      if (deg > 0.5) {
        var n = Math.max(2, Math.ceil(deg / 4)), d = "";
        for (var i = 0; i <= n; i++) {
          var a = t * i / n, Q = self._px(0.28 * Math.cos(a), 0.28 * Math.sin(a));
          d += (i ? " L" : "M") + Q[0].toFixed(2) + "," + Q[1].toFixed(2);
        }
        svg.appendChild(svgEl("path", { d: d, class: "arc", "marker-end": deg >= 20 ? "url(#fleche-arc)" : "" }));
        var Qt = self._px(0.42 * Math.cos(t / 2), 0.42 * Math.sin(t / 2));
        // Près de l'axe imaginaire (θ/2 ≈ 90°), l'étiquette se décale pour ne pas couvrir l'axe.
        var surAxe = Math.abs(Math.cos(t / 2)) < 0.25;
        var et = svgEl("text", { x: (Qt[0] + (surAxe ? 6 : 0)).toFixed(2), y: (Qt[1] + 4).toFixed(2), "text-anchor": surAxe ? "start" : "middle", class: "et-theta" });
        et.textContent = "θ";
        svg.appendChild(et);
      }
      svg.appendChild(svgEl("line", { x1: O[0], y1: O[1], x2: P[0].toFixed(2), y2: P[1].toFixed(2), class: "rayon" }));
      var estPi = deg === 180;
      svg.appendChild(svgEl("circle", { cx: P[0].toFixed(2), cy: P[1].toFixed(2), r: estPi ? 7 : 5.5, class: estPi ? "pt-euler" : "pt" }));

      // Étiquettes cos θ / sin θ, placées côté extérieur et jamais rognées.
      if (Math.abs(c) > 0.12) {
        var ec = svgEl("text", { x: ((O[0] + Pc[0]) / 2).toFixed(2), y: (O[1] + (s >= 0 ? 15 : -7)).toFixed(2), "text-anchor": "middle", class: "et-cos" });
        ec.textContent = "cos θ";
        svg.appendChild(ec);
      }
      if (Math.abs(s) > 0.12) {
        var es = svgEl("text", { x: (O[0] + (c >= 0 ? -6 : 6)).toFixed(2), y: ((O[1] + Ps[1]) / 2 + 4).toFixed(2), "text-anchor": c >= 0 ? "end" : "start", class: "et-sin" });
        es.textContent = "sin θ";
        svg.appendChild(es);
      }
      // Étiquette du point, poussée vers l'extérieur du cercle.
      var Pe = self._px(1.18 * c, 1.18 * s);
      var ep = svgEl("text", { x: Pe[0].toFixed(2), y: (Pe[1] + 4).toFixed(2), "text-anchor": c > 0.3 ? "start" : (c < -0.3 ? "end" : "middle"), class: "et-pt" });
      ep.textContent = "eⁱᶿ";
      if (!estPi) svg.appendChild(ep); // en θ = π, le repère « −1 » nomme déjà le point


      // Lecture.
      var cle = ((deg % 360) + 360) % 360;
      var ex = EXACT[cle];
      var e = "e<sup>iθ</sup>";
      var html = e + " = cos θ + i sin θ = " +
        '<span class="c">' + fmt(c) + "</span> + i·" + '<span class="s">' + (s < 0 ? "(" + fmt(s) + ")" : fmt(s)) + "</span>";
      if (ex) html += "<br>valeurs exactes : cos θ = " + '<span class="c">' + ex[0] + "</span>, sin θ = " + '<span class="s">' + ex[1] + "</span>";
      if (estPi) html += '<span class="euler">e<sup>iπ</sup> = cos π + i sin π = −1 + 0i = −1, soit e<sup>iπ</sup> + 1 = 0 : l\'identité d\'Euler relie e, i, π, 1 et 0.</span>';
      this._lecture.innerHTML = html;
    }
  }

  if (!customElements.get("euler-cercle-widget")) {
    customElements.define("euler-cercle-widget", EulerCercleWidget);
  }
})();
