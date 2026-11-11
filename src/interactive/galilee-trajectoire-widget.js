(function () {
  "use strict";

  /* ================================================================
   * <galilee-trajectoire-widget> — atelier interactif : l'idée de Galilée.
   * Un projectile lancé horizontalement depuis h₀ avec une vitesse v :
   * avancée horizontale régulière (x = v·t) et chute accélérée
   * (y = h₀ − 5t²). Les positions toutes les 0,2 s montrent les deux
   * mouvements indépendants ; combinés, ils dessinent la parabole
   * y = h₀ − 5(x/v)². Fenêtre fixe (x de 0 à 30 m, y de 0 à 42 m).
   * Même langage visuel que <parabole-widget>. Web Component (Shadow DOM).
   * ================================================================ */

  var LARGEUR = 560, HAUTEUR = 440, MG = 38, MD = 18, MH = 22, MB = 34;
  var X_MAX = 30, Y_MAX = 42, PAS_T = 0.2;
  var DEFAUT = { h: 20, v: 5 };

  function fr(n, dec) {
    var p = Math.pow(10, dec === undefined ? 2 : dec);
    var r = Math.round(n * p) / p;
    return (r < 0 ? "−" : "") + String(Math.abs(r)).replace(".", ",");
  }
  function pgcd(a, b) { return b ? pgcd(b, a % b) : a; }

  /** Coefficient 5/v² écrit en fraction réduite : « x²/5 », « 5x²/9 »… */
  function termeX2(v) {
    var num = 5, den = v * v, g = pgcd(num, den);
    num /= g; den /= g;
    if (den === 1) return (num === 1 ? "" : num) + "x²";
    return (num === 1 ? "" : num) + "x²/" + den;
  }
  function tempsImpact(h) { return Math.sqrt(h / 5); }
  function ecrireTemps(h) {
    var t = tempsImpact(h);
    var exact = Math.abs(t - Math.round(t * 100) / 100) < 1e-9;
    return (exact ? "= " : "≈ ") + fr(t) + " s";
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}' +
    '*{box-sizing:border-box;}' +
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.25rem;font-weight:600;margin:0 0 6px;}' +
    '.idee{text-align:center;font-size:0.88rem;color:var(--ink-soft,#6b6055);margin:0 0 10px;}' +
    'svg{width:100%;height:auto;max-width:100%;background:var(--surface-2,#faf6f0);border-radius:3px;display:block;margin-bottom:12px;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.grille{stroke:var(--line-soft,#ede5d7);stroke-width:1;}' +
    '.sol{stroke:var(--ink-soft,#6b6055);stroke-width:2;}' +
    '.courbe{stroke:var(--accent,#a8471f);stroke-width:2;fill:none;stroke-dasharray:6 4;opacity:.75;}' +
    '.point{fill:var(--accent,#a8471f);stroke:var(--surface,#fff);stroke-width:1.2;}' +
    '.projectile{fill:var(--accent-ink,#7a3212);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.repere-h{stroke:#3d72b4;stroke-width:2;}' +
    '.repere-v{stroke:var(--good,#2f7a4f);stroke-width:2;}' +
    '.guide{stroke:var(--ink-faint,#9c9083);stroke-width:0.8;stroke-dasharray:2 3;}' +
    '.graduation{font-size:10px;fill:var(--ink-faint,#9c9083);font-family:var(--sans,sans-serif);}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--serif,serif);font-style:italic;}' +
    '.legende{display:flex;flex-wrap:wrap;gap:14px;font-size:0.82rem;color:var(--ink-soft,#6b6055);margin:-4px 0 12px;}' +
    '.legende span::before{content:"";display:inline-block;width:14px;height:3px;margin-right:6px;vertical-align:middle;}' +
    '.legende .h::before{background:#3d72b4;}' +
    '.legende .v::before{background:var(--good,#2f7a4f);}' +
    '.legende .c::before{background:var(--accent,#a8471f);}' +
    '.bilan{border-left:3px solid var(--accent,#a8471f);background:var(--surface-2,#faf6f0);padding:10px 12px;border-radius:3px;font-size:0.92rem;line-height:1.55;margin-bottom:14px;}' +
    '.ligne{display:grid;grid-template-columns:minmax(88px,auto) 1fr 64px;align-items:center;gap:10px;margin-bottom:4px;}' +
    '.ligne label{font-size:0.88rem;color:var(--accent-ink,#7a3212);font-weight:600;}' +
    'input[type="range"]{width:100%;height:44px;accent-color:var(--accent,#a8471f);}' +
    '.valeur{font-variant-numeric:tabular-nums;text-align:right;color:var(--ink-soft,#6b6055);font-size:0.9rem;}' +
    '.boutons{display:flex;flex-wrap:wrap;gap:8px;margin-top:6px;}' +
    'button{min-height:44px;padding:8px 14px;border-radius:3px;border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;}' +
    'button:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<p class="formule" id="formule"></p>' +
    '<p class="idee">L\'idée de Galilée : décomposer le mouvement en deux mouvements indépendants.</p>' +
    '<svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Trajectoire d\'un projectile lancé horizontalement"></svg>' +
    '<div class="legende"><span class="h">avancée horizontale : x = v·t, pas réguliers</span><span class="v">chute : y = h₀ − 5t², pas de plus en plus grands</span><span class="c">la parabole qui en résulte</span></div>' +
    '<div class="bilan" id="bilan" aria-live="polite"></div>' +
    '<div class="ligne"><label for="h">hauteur h₀</label><input type="range" id="h" min="5" max="40" step="1"><span class="valeur" id="h-val"></span></div>' +
    '<div class="ligne"><label for="v">vitesse v</label><input type="range" id="v" min="2" max="10" step="1"><span class="valeur" id="v-val"></span></div>' +
    '<div class="ligne"><label for="t">temps t</label><input type="range" id="t" min="0" max="1" step="0.01"><span class="valeur" id="t-val"></span></div>' +
    '<div class="boutons"><button type="button" id="lancer">Lancer</button><button type="button" id="reset">Réinitialiser</button></div>';

  class GalileeTrajectoireWidget extends HTMLElement {
    constructor() {
      super();
      var s = this.attachShadow({ mode: "open" });
      s.appendChild(TEMPLATE.content.cloneNode(true));
      this._s = s;
      this._h = DEFAUT.h; this._v = DEFAUT.v; this._t = tempsImpact(DEFAUT.h);
      this._anim = null;
      var self = this;
      this._inH = s.getElementById("h"); this._inV = s.getElementById("v"); this._inT = s.getElementById("t");
      this._inH.addEventListener("input", function () { self._stop(); self._h = Number(self._inH.value); self._t = tempsImpact(self._h); self._rendre(); });
      this._inV.addEventListener("input", function () { self._stop(); self._v = Number(self._inV.value); self._rendre(); });
      this._inT.addEventListener("input", function () { self._stop(); self._t = Number(self._inT.value) * tempsImpact(self._h); self._rendre(); });
      s.getElementById("lancer").addEventListener("click", function () { self._lancer(); });
      s.getElementById("reset").addEventListener("click", function () {
        self._stop(); self._h = DEFAUT.h; self._v = DEFAUT.v; self._t = tempsImpact(DEFAUT.h); self._rendre();
      });
    }

    connectedCallback() { this._rendre(); }
    disconnectedCallback() { this._stop(); }

    _stop() { if (this._anim) { cancelAnimationFrame(this._anim); this._anim = null; } }

    _lancer() {
      this._stop();
      var duree = tempsImpact(this._h);
      var reduit = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduit) { this._t = duree; this._rendre(); return; }
      var self = this, debut = null;
      // Temps réel ralenti ×0,5 pour qu'on suive les positions successives.
      function etape(ts) {
        if (debut === null) debut = ts;
        var t = Math.min(duree, (ts - debut) / 1000 * 0.5);
        self._t = t; self._rendre();
        if (t < duree) self._anim = requestAnimationFrame(etape); else self._anim = null;
      }
      this._t = 0;
      this._anim = requestAnimationFrame(etape);
    }

    _rendre() {
      var s = this._s, h = this._h, v = this._v, t = this._t, T = tempsImpact(h);
      this._inH.value = h; this._inV.value = v; this._inT.value = T ? t / T : 0;
      s.getElementById("h-val").textContent = h + " m";
      s.getElementById("v-val").textContent = v + " m/s";
      s.getElementById("t-val").textContent = fr(t) + " s";
      s.getElementById("formule").textContent = "y = " + h + " − " + termeX2(v);
      var xImpact = v * T;
      s.getElementById("bilan").innerHTML =
        "À l'instant t = " + fr(t) + " s : x = v·t = " + fr(v * t) + " m et y = h₀ − 5t² = " + fr(h - 5 * t * t) + " m.<br>" +
        "On remplace t par x/v : y = " + h + " − 5(x/" + v + ")², soit <strong>y = " + h + " − " + termeX2(v) + "</strong> — une parabole.<br>" +
        "Impact au sol (y = 0) : 5t² = " + h + ", donc t " + ecrireTemps(h) + ", à x = v·t " + (Math.abs(xImpact - Math.round(xImpact * 100) / 100) < 1e-9 ? "= " : "≈ ") + fr(xImpact) + " m.";
      this._dessiner();
    }

    _dessiner() {
      var svg = this._s.getElementById("svg"), NS = "http://www.w3.org/2000/svg";
      var h = this._h, v = this._v, t = this._t, T = tempsImpact(h);
      function el(nom, a) { var e = document.createElementNS(NS, nom); for (var k in a) e.setAttribute(k, a[k]); return e; }
      function px(x) { return MG + x / X_MAX * (LARGEUR - MG - MD); }
      function py(y) { return HAUTEUR - MB - y / Y_MAX * (HAUTEUR - MB - MH); }
      svg.innerHTML = "";
      var defs = el("defs", {});
      var mk = el("marker", { id: "fl-gal", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      mk.appendChild(el("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(mk); svg.appendChild(defs);
      var gx, gy;
      for (gx = 5; gx <= X_MAX; gx += 5) {
        svg.appendChild(el("line", { x1: px(gx), x2: px(gx), y1: py(0), y2: py(Y_MAX), class: "grille" }));
        var tx = el("text", { x: px(gx), y: py(0) + 14, class: "graduation", "text-anchor": "middle" }); tx.textContent = String(gx); svg.appendChild(tx);
      }
      for (gy = 10; gy <= 40; gy += 10) {
        svg.appendChild(el("line", { x1: px(0), x2: px(X_MAX), y1: py(gy), y2: py(gy), class: "grille" }));
        var ty = el("text", { x: px(0) - 6, y: py(gy) + 3, class: "graduation", "text-anchor": "end" }); ty.textContent = String(gy); svg.appendChild(ty);
      }
      svg.appendChild(el("line", { x1: px(0), x2: px(X_MAX) + 10, y1: py(0), y2: py(0), class: "axe", "marker-end": "url(#fl-gal)" }));
      svg.appendChild(el("line", { x1: px(0), x2: px(0), y1: py(0), y2: py(Y_MAX) - 10, class: "axe", "marker-end": "url(#fl-gal)" }));
      var lx = el("text", { x: px(X_MAX) + 6, y: py(0) - 6, class: "etiquette", "text-anchor": "end" }); lx.textContent = "x (m)"; svg.appendChild(lx);
      var ly = el("text", { x: px(0) + 8, y: py(Y_MAX) - 2, class: "etiquette" }); ly.textContent = "y (m)"; svg.appendChild(ly);

      // Parabole complète en pointillés (référence), jusqu'à l'impact.
      var d = "";
      for (var i = 0; i <= 80; i++) {
        var ti = T * i / 80, xi = v * ti, yi = h - 5 * ti * ti;
        d += (i ? "L" : "M") + px(xi).toFixed(1) + "," + py(yi).toFixed(1);
      }
      svg.appendChild(el("path", { d: d, class: "courbe" }));

      // Positions toutes les 0,2 s jusqu'à t : repères sur les deux axes.
      var n = Math.floor(t / PAS_T + 1e-9);
      for (var k = 0; k <= n; k++) {
        var tk = k * PAS_T, xk = v * tk, yk = h - 5 * tk * tk;
        svg.appendChild(el("line", { x1: px(xk), x2: px(xk), y1: py(yk), y2: py(0), class: "guide" }));
        svg.appendChild(el("line", { x1: px(0), x2: px(xk), y1: py(yk), y2: py(yk), class: "guide" }));
        svg.appendChild(el("line", { x1: px(xk), x2: px(xk), y1: py(0) - 5, y2: py(0) + 5, class: "repere-h" }));
        svg.appendChild(el("line", { x1: px(0) - 5, x2: px(0) + 5, y1: py(yk), y2: py(yk), class: "repere-v" }));
        svg.appendChild(el("circle", { cx: px(xk), cy: py(yk), r: 3.5, class: "point" }));
      }
      // Projectile à l'instant t.
      svg.appendChild(el("circle", { cx: px(v * t), cy: py(h - 5 * t * t), r: 7, class: "projectile" }));
    }
  }

  if (!customElements.get("galilee-trajectoire-widget")) {
    customElements.define("galilee-trajectoire-widget", GalileeTrajectoireWidget);
  }
})();
