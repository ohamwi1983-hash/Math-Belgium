(function () {
  "use strict";

  /* ================================================================
   * <courbe-mystere-widget> — atelier « courbe mystère » (5e, chapitre 2,
   * section 5 : lecture graphique). Une courbe cible f(x) = A sin(ωx + φ) + b
   * aux valeurs lisibles est tracée ; un réticule déplaçable (aimanté sur les
   * maximums, minimums et traversées montantes de la ligne moyenne de la
   * cible) aide à lire max, min et x₀ ; quatre curseurs A, T, φ, b règlent la
   * courbe de l'élève jusqu'à la superposition. Aucun score, aucun point.
   * Fenêtre FIXE : x ∈ [0 ; 4π], y ∈ [−6 ; 6]. Web Component (Shadow DOM).
   * ================================================================ */

  var PI = Math.PI;
  var NS = "http://www.w3.org/2000/svg";
  var X_MIN = 0, X_MAX = 4 * PI, Y_MIN = -6, Y_MAX = 6;
  var L = 560, H = 300, MG = 34, MD = 16, MH = 14, MB = 30;
  var CIBLE_DEPART = { A: 2, T: 2 * PI, phiQ: 1, b: 1 };      // φ = phiQ·π/4
  var ELEVE_DEPART = { A: 1, T: 2 * PI, phiQ: 0, b: 0 };
  var T_CHOIX = [PI, 2 * PI, 3 * PI, 4 * PI];                    // périodes des cibles

  function fr(n, d) {
    var f = Math.pow(10, d);
    var v = Math.round(n * f) / f;
    if (Object.is(v, -0)) v = 0;
    var s = v.toFixed(d);
    if (d > 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
    return s.replace(".", ",").replace("-", "−");
  }
  function pgcd(a, b) { return b ? pgcd(b, a % b) : a; }
  /** num·π/den écrit proprement (« 0 », « π », « −3π/4 », « 2π »). */
  function fracPi(num, den) {
    if (num === 0) return "0";
    var g = pgcd(Math.abs(num), den); num /= g; den /= g;
    var signe = num < 0 ? "−" : "";
    var n = Math.abs(num);
    var corps = (n === 1 ? "" : String(n)) + "π";
    return signe + (den === 1 ? corps : corps + "/" + den);
  }
  function el(tag, attrs, texte) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (texte !== undefined) e.textContent = texte;
    return e;
  }
  function sx(x) { return MG + (x - X_MIN) / (X_MAX - X_MIN) * (L - MG - MD); }
  function sy(y) { return MH + (Y_MAX - y) / (Y_MAX - Y_MIN) * (H - MH - MB); }
  function ix(px) { return X_MIN + (px - MG) / (L - MG - MD) * (X_MAX - X_MIN); }
  function iy(py) { return Y_MAX - (py - MH) / (H - MH - MB) * (Y_MAX - Y_MIN); }

  function f(p, x) { return p.A * Math.sin((2 * PI / p.T) * x + p.phiQ * PI / 4) + p.b; }

  /** « y = 2 sin(x/2 − π/4) + 1 » : A omis si 1, ω = 2π/T simplifié, φ et b omis si nuls. */
  function formuleLisible(p) {
    var Tq = Math.round(p.T / (PI / 2));          // T = Tq·π/2, donc ω = 4/Tq
    var num = 4, den = Tq, g = pgcd(num, den); num /= g; den /= g;
    var wx = den === 1 ? (num === 1 ? "x" : num + "x") : (num === 1 ? "x/" + den : num + "x/" + den);
    var arg = wx;
    if (p.phiQ !== 0) arg += (p.phiQ > 0 ? " + " : " − ") + fracPi(Math.abs(p.phiQ), 4);
    var s = "y = " + (p.A === 1 ? "" : fr(p.A, 1) + " ") + "sin(" + arg + ")";
    if (p.b !== 0) s += (p.b > 0 ? " + " : " − ") + fr(Math.abs(p.b), 1);
    return s;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}' +
    '*{box-sizing:border-box;}' +
    '.figure{display:flex;justify-content:center;margin-bottom:10px;}' +
    'svg{width:100%;max-width:640px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);touch-action:none;cursor:crosshair;user-select:none;-webkit-user-select:none;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.2;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.grille{stroke:var(--line,#e2d8c8);stroke-width:1;}' +
    '.grad{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.cible{stroke:var(--ink-faint,#9c9083);stroke-width:5;fill:none;opacity:0.55;stroke-linecap:round;}' +
    '.eleve{stroke:var(--accent,#a8471f);stroke-width:2.2;fill:none;}' +
    '.eleve.ok{stroke:var(--good,#2f7a4f);stroke-width:2.6;}' +
    '.reticule{stroke:var(--plan,#5b4ea3);stroke-width:1.2;stroke-dasharray:4 3;}' +
    '.reticule-pt{fill:var(--plan,#5b4ea3);}' +
    '.reticule-txt{paint-order:stroke;stroke:var(--surface-2,#faf6f0);stroke-width:4px;stroke-linejoin:round;font-size:12.5px;font-weight:700;fill:var(--plan,#5b4ea3);font-family:var(--sans,sans-serif);}' +
    '.legende{paint-order:stroke;stroke:var(--surface-2,#faf6f0);stroke-width:4px;stroke-linejoin:round;font-size:12px;font-family:var(--sans,sans-serif);}' +
    '.leg-cible{fill:var(--ink-soft,#6b6055);}' +
    '.leg-eleve{fill:var(--accent-ink,#7a3212);}' +
    '.etat{text-align:center;font-weight:600;margin:4px 0 6px;padding:7px 10px;border-radius:var(--radius,3px);background:var(--surface-2,#faf6f0);color:var(--ink-soft,#6b6055);}' +
    '.etat.ok{background:var(--good-soft,#dcefe2);color:var(--good,#2f7a4f);border:1px solid var(--good,#2f7a4f);}' +
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.05rem;margin:0 0 4px;}' +
    '.lecture{text-align:center;font-size:0.88rem;color:var(--ink-soft,#6b6055);margin:0 0 12px;min-height:1.3em;}' +
    '.controles{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px 18px;}' +
    '.curseur{display:flex;flex-direction:column;gap:4px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:10px;}' +
    '.curseur-row input{flex:1 1 auto;min-width:0;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:58px;text-align:right;font-size:0.9rem;}' +
    '.boutons{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:12px;}' +
    'button{padding:7px 12px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.86rem;font-family:inherit;}' +
    'button:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<div class="figure"><svg id="svg" viewBox="0 0 ' + L + ' ' + H + '" role="img" aria-label="Courbe mystère et courbe à régler"></svg></div>' +
    '<p class="etat" id="etat"></p>' +
    '<p class="formule" id="formule"></p>' +
    '<p class="lecture" id="lecture"></p>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="A">A (amplitude)</label><div class="curseur-row"><input type="range" id="A" min="0.5" max="4" step="0.5"><span class="curseur-valeur" id="A-v"></span></div></div>' +
    '<div class="curseur"><label for="T">T (période)</label><div class="curseur-row"><input type="range" id="T" min="1" max="8" step="1"><span class="curseur-valeur" id="T-v"></span></div></div>' +
    '<div class="curseur"><label for="phi">φ (déphasage)</label><div class="curseur-row"><input type="range" id="phi" min="-3" max="4" step="1"><span class="curseur-valeur" id="phi-v"></span></div></div>' +
    '<div class="curseur"><label for="b">b (ligne moyenne)</label><div class="curseur-row"><input type="range" id="b" min="-3" max="3" step="0.5"><span class="curseur-valeur" id="b-v"></span></div></div>' +
    '</div>' +
    '<div class="boutons"><button type="button" id="nouvelle">Nouvelle courbe</button><button type="button" id="revoir">Remettre mes curseurs à zéro</button></div>';

  class CourbeMystereWidget extends HTMLElement {
    constructor() {
      super();
      var sr = this.attachShadow({ mode: "open" });
      sr.appendChild(TEMPLATE.content.cloneNode(true));
      this._cible = Object.assign({}, CIBLE_DEPART);
      this._eleve = Object.assign({}, ELEVE_DEPART);
      this._ret = null; // {x, y, nature}
      this._svg = sr.getElementById("svg");
      this._in = { A: sr.getElementById("A"), T: sr.getElementById("T"), phi: sr.getElementById("phi"), b: sr.getElementById("b") };
    }

    connectedCallback() {
      var self = this, sr = this.shadowRoot;
      this._onInput = function () {
        self._eleve.A = parseFloat(self._in.A.value);
        self._eleve.T = parseInt(self._in.T.value, 10) * PI / 2;
        self._eleve.phiQ = parseInt(self._in.phi.value, 10);
        self._eleve.b = parseFloat(self._in.b.value);
        self._rendre();
      };
      this._onNouvelle = function () { self._nouvelleCible(); self._rendre(); };
      this._onRevoir = function () { self._eleve = Object.assign({}, ELEVE_DEPART); self._syncCurseurs(); self._rendre(); };
      this._onPointer = function (e) {
        if (e.type === "pointerdown") { self._drag = true; try { self._svg.setPointerCapture(e.pointerId); } catch (err) { void err; } }
        if (e.type === "pointerup" || e.type === "pointercancel") { self._drag = false; return; }
        if (!self._drag && e.type === "pointermove") return;
        var m = self._svg.getScreenCTM();
        if (!m) return;
        var p = self._svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
        var q = p.matrixTransform(m.inverse());
        self._placerReticule(Math.max(X_MIN, Math.min(X_MAX, ix(q.x))), Math.max(Y_MIN, Math.min(Y_MAX, iy(q.y))));
        self._rendre();
      };
      Object.keys(this._in).forEach(function (k) { self._in[k].addEventListener("input", self._onInput); });
      sr.getElementById("nouvelle").addEventListener("click", this._onNouvelle);
      sr.getElementById("revoir").addEventListener("click", this._onRevoir);
      ["pointerdown", "pointermove", "pointerup", "pointercancel"].forEach(function (t) { self._svg.addEventListener(t, self._onPointer); });
      this._syncCurseurs();
      this._placerReticule(PI / 4, 3);
      this._rendre();
    }

    disconnectedCallback() {
      var self = this, sr = this.shadowRoot;
      Object.keys(this._in).forEach(function (k) { self._in[k].removeEventListener("input", self._onInput); });
      sr.getElementById("nouvelle").removeEventListener("click", this._onNouvelle);
      sr.getElementById("revoir").removeEventListener("click", this._onRevoir);
      ["pointerdown", "pointermove", "pointerup", "pointercancel"].forEach(function (t) { self._svg.removeEventListener(t, self._onPointer); });
    }

    _syncCurseurs() {
      this._in.A.value = String(this._eleve.A);
      this._in.T.value = String(Math.round(this._eleve.T / (PI / 2)));
      this._in.phi.value = String(this._eleve.phiQ);
      this._in.b.value = String(this._eleve.b);
    }

    _nouvelleCible() {
      var precedente = JSON.stringify(this._cible);
      for (var essai = 0; essai < 20; essai++) {
        var A = [1, 1.5, 2, 2.5, 3][Math.floor(Math.random() * 5)];
        var bMax = Math.min(2, 5 - A);
        var bs = [];
        for (var v = -bMax; v <= bMax + 1e-9; v += 0.5) bs.push(Math.round(v * 2) / 2);
        var c = {
          A: A,
          T: T_CHOIX[Math.floor(Math.random() * T_CHOIX.length)],
          phiQ: Math.floor(Math.random() * 8) - 3, // −3π/4 … π
          b: bs[Math.floor(Math.random() * bs.length)],
        };
        if (JSON.stringify(c) !== precedente) { this._cible = c; break; }
      }
      this._ret = null;
      this._placerReticule(PI / 4, 3);
    }

    /** Points remarquables de la cible : maximums, minimums, traversées montantes de y = b. */
    _remarquables() {
      var c = this._cible, w = 2 * PI / c.T, phi = c.phiQ * PI / 4, res = [];
      var familles = [
        { u: PI / 2, y: c.b + c.A, nature: "maximum" },
        { u: -PI / 2, y: c.b - c.A, nature: "minimum" },
        { u: 0, y: c.b, nature: "x₀ (ligne moyenne, en montant)" },
      ];
      familles.forEach(function (fa) {
        for (var k = -4; k <= 8; k++) {
          var x = (fa.u + 2 * k * PI - phi) / w;
          if (x >= X_MIN - 1e-9 && x <= X_MAX + 1e-9) res.push({ x: x, y: fa.y, nature: fa.nature });
        }
      });
      return res;
    }

    _placerReticule(x, y) {
      var best = null, dmin = Infinity;
      this._remarquables().forEach(function (p) {
        var dx = sx(p.x) - sx(x), dy = sy(p.y) - sy(y), d = Math.sqrt(dx * dx + dy * dy);
        if (d < dmin) { dmin = d; best = p; }
      });
      this._ret = best && dmin < 14 ? { x: best.x, y: best.y, nature: best.nature } : { x: x, y: y, nature: null };
    }

    _superposees() {
      for (var i = 0; i <= 200; i++) {
        var x = X_MIN + (X_MAX - X_MIN) * i / 200;
        if (Math.abs(f(this._cible, x) - f(this._eleve, x)) > 1e-6) return false;
      }
      return true;
    }

    _trace(p, cls) {
      var d = "", n = 400;
      for (var i = 0; i <= n; i++) {
        var x = X_MIN + (X_MAX - X_MIN) * i / n;
        var y = Math.max(Y_MIN - 0.5, Math.min(Y_MAX + 0.5, f(p, x)));
        d += (i ? "L" : "M") + sx(x).toFixed(2) + "," + sy(y).toFixed(2);
      }
      return el("path", { d: d, class: cls });
    }

    _rendre() {
      var svg = this._svg, sr = this.shadowRoot;
      svg.innerHTML = "";
      var defs = el("defs", {});
      var m = el("marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      m.appendChild(el("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(m);
      var clip = el("clipPath", { id: "cadre" });
      clip.appendChild(el("rect", { x: MG, y: MH, width: L - MG - MD, height: H - MH - MB }));
      defs.appendChild(clip);
      svg.appendChild(defs);

      // Grille : x tous les π/2, y tous les 1.
      for (var q = 1; q <= 8; q++) svg.appendChild(el("line", { x1: sx(q * PI / 2), y1: sy(Y_MIN), x2: sx(q * PI / 2), y2: sy(Y_MAX), class: "grille" }));
      for (var yy = Y_MIN; yy <= Y_MAX; yy++) if (yy !== 0) svg.appendChild(el("line", { x1: sx(X_MIN), y1: sy(yy), x2: sx(X_MAX), y2: sy(yy), class: "grille" }));
      // Axes fléchés.
      svg.appendChild(el("line", { x1: sx(X_MIN), y1: sy(0), x2: L - 4, y2: sy(0), class: "axe", "marker-end": "url(#fleche)" }));
      svg.appendChild(el("line", { x1: sx(0), y1: H - MB + 6, x2: sx(0), y2: 4, class: "axe", "marker-end": "url(#fleche)" }));
      // Graduations.
      for (var g = 1; g <= 8; g++) {
        var lab = fracPi(g, 2);
        svg.appendChild(el("text", { x: sx(g * PI / 2), y: sy(0) + 15, "text-anchor": "middle", class: "grad" }, lab));
      }
      for (var gy = -6; gy <= 6; gy += 2) if (gy !== 0) svg.appendChild(el("text", { x: sx(0) - 6, y: sy(gy) + 4, "text-anchor": "end", class: "grad" }, fr(gy, 0)));

      var ok = this._superposees();
      var groupe = el("g", { "clip-path": "url(#cadre)" });
      groupe.appendChild(this._trace(this._cible, "cible"));
      groupe.appendChild(this._trace(this._eleve, "eleve" + (ok ? " ok" : "")));
      svg.appendChild(groupe);

      // Légende.
      svg.appendChild(el("text", { x: L - MD - 4, y: MH + 14, "text-anchor": "end", class: "legende leg-cible" }, "courbe mystère (épaisse)"));
      svg.appendChild(el("text", { x: L - MD - 4, y: MH + 30, "text-anchor": "end", class: "legende leg-eleve" }, "ta courbe"));

      // Réticule.
      var r = this._ret;
      if (r) {
        var px = sx(r.x), py = sy(r.y);
        svg.appendChild(el("line", { x1: px, y1: sy(Y_MIN), x2: px, y2: sy(Y_MAX), class: "reticule" }));
        svg.appendChild(el("line", { x1: sx(X_MIN), y1: py, x2: sx(X_MAX), y2: py, class: "reticule" }));
        svg.appendChild(el("circle", { cx: px, cy: py, r: 4.5, class: "reticule-pt" }));
        var droite = px > L - 170, haut = py < MH + 40;
        svg.appendChild(el("text", { x: px + (droite ? -8 : 8), y: py + (haut ? 18 : -8), "text-anchor": droite ? "end" : "start", class: "reticule-txt" },
          "(" + this._xTexte(r.x) + " ; " + fr(r.y, 2) + ")"));
      }

      // Textes.
      var e = this._eleve;
      sr.getElementById("A-v").textContent = fr(e.A, 1);
      sr.getElementById("T-v").textContent = fracPi(Math.round(e.T / (PI / 2)), 2);
      sr.getElementById("phi-v").textContent = fracPi(e.phiQ, 4);
      sr.getElementById("b-v").textContent = fr(e.b, 1);
      sr.getElementById("formule").textContent = "Ta courbe : " + formuleLisible(e);
      var etat = sr.getElementById("etat");
      etat.className = "etat" + (ok ? " ok" : "");
      etat.textContent = ok
        ? "Superposées ✓ — " + formuleLisible(e) + " (A = " + fr(e.A, 1) + ", T = " + fracPi(Math.round(e.T / (PI / 2)), 2) + ", φ = " + fracPi(e.phiQ, 4) + ", b = " + fr(e.b, 1) + "). Clique sur « Nouvelle courbe » pour recommencer."
        : "Pas encore superposées : lis max, min et x₀ sur la courbe mystère avec le réticule.";
      sr.getElementById("lecture").textContent = r
        ? (r.nature ? "Réticule aimanté sur un " + r.nature + " de la courbe mystère : x = " + this._xTexte(r.x) + ", y = " + fr(r.y, 2) + "."
          : "Fais glisser le réticule sur la figure : il s'aimante sur les maximums, minimums et sur x₀.")
        : "";
    }

    /** Abscisse lue en multiple de π/4 quand c'en est un, sinon en décimal avec l'équivalent en π. */
    _xTexte(x) {
      var q = x / (PI / 4);
      if (Math.abs(q - Math.round(q)) < 1e-6) return fracPi(Math.round(q), 4);
      return fr(x, 2) + " ≈ " + fr(x / PI, 2) + "π";
    }
  }

  if (!customElements.get("courbe-mystere-widget")) customElements.define("courbe-mystere-widget", CourbeMystereWidget);
})();
