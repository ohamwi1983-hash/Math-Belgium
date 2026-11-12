(function () {
  "use strict";

  /* ================================================================
   * <zoom-tangente-widget> — atelier « zoome sur la courbe » (5e,
   * Dérivées, § 2). Une courbe, un point A, un zoom ×1 → ×100 centré
   * sur A : à fort zoom, la courbe se confond avec sa tangente
   * y = f(a) + f'(a)(x − a) (en pointillés). Contre-exemple : |x| en 0,
   * dont le coin reste un coin à tout zoom (point anguleux). Seul le
   * zoom recalcule la fenêtre (c'est LUI le paramètre montré) ; les
   * graduations s'adaptent (pas 1, 2 ou 5 × 10ⁿ). Écart maximal
   * courbe/tangente affiché en % de la hauteur de la fenêtre.
   * Web Component (Shadow DOM).
   * ================================================================ */

  var NS = "http://www.w3.org/2000/svg";
  var LARGEUR = 420, HAUTEUR = 320, MG = 50, MD = 14, MH = 14, MB = 30;
  var CRANS = 1000, Z_MAX = 100;
  var BOUTONS = [1, 2, 10, 100];

  var FONCTIONS = {
    poly: {
      f: function (x) { return x * x - 2 * x + 1; }, a: 3, fa: 4, d: 4, wx: 3, wy: 12,
      titre: "f(x) = x² − 2x + 1, en A(3 ; 4)",
      equation: "Tangente en A : y = 4 + 4(x − 3), soit y = 4x − 8"
    },
    cube: {
      f: function (x) { return x * x * x; }, a: 1, fa: 1, d: 3, wx: 2, wy: 6,
      titre: "f(x) = x³, en A(1 ; 1)",
      equation: "Tangente en A : y = 1 + 3(x − 1), soit y = 3x − 2"
    },
    abs: {
      f: function (x) { return Math.abs(x); }, a: 0, fa: 0, d: null, wx: 2, wy: 2,
      titre: "f(x) = |x|, en A(0 ; 0)",
      equation: "Point anguleux : pente −1 à gauche, pente 1 à droite — pas de tangente unique"
    }
  };

  function fr(n, dec) {
    var facteur = Math.pow(10, dec);
    var r = Math.round(n * facteur) / facteur;
    if (Object.is(r, -0)) r = 0;
    return r.toFixed(dec).replace(".", ",").replace("-", "−");
  }

  function pasJoli(etendue) {
    var brut = etendue / 5;
    var p = Math.pow(10, Math.floor(Math.log10(brut)));
    var m = brut / p;
    var pas = m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10;
    return pas * p;
  }

  function el(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}' +
    '*{box-sizing:border-box;}' +
    '.choix{display:flex;flex-direction:column;gap:6px;margin:0 0 12px;}' +
    '.choix label{font-weight:700;font-size:0.9rem;color:var(--accent-ink,#7a3212);}' +
    'select{min-height:44px;font:inherit;font-size:0.95rem;padding:6px 10px;border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);background:var(--surface,#fff);color:var(--ink,#241f1a);max-width:100%;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:440px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);display:block;}' +
    '.cadre{fill:none;stroke:var(--line,#ccd8e0);stroke-width:1;}' +
    '.grille{stroke:var(--line,#ccd8e0);stroke-width:0.7;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.grad{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);font-variant-numeric:tabular-nums;}' +
    '.courbe{stroke:var(--accent,#a8471f);stroke-width:2.6;fill:none;}' +
    '.tangente{stroke:var(--good,#2f7a4f);stroke-width:2;stroke-dasharray:7 5;}' +
    '.pointA{fill:var(--ink,#241f1a);}' +
    '.etq{font-size:14px;font-weight:700;fill:var(--ink,#241f1a);font-family:var(--sans,sans-serif);}' +
    '.zoom-etq{font-size:13px;font-weight:700;fill:var(--plan,#5b4ea3);font-family:var(--sans,sans-serif);}' +
    '.lecture{background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);padding:10px 12px;margin:0 0 14px;font-size:0.93rem;line-height:1.5;}' +
    '.lecture p{margin:0 0 6px;}' +
    '.lecture p:last-child{margin:0;}' +
    '.eq{font-weight:700;color:var(--good,#2f7a4f);}' +
    '.eq.anguleux{color:var(--bad,#b23a3a);}' +
    '.ecart{font-variant-numeric:tabular-nums;}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur label{font-weight:700;color:var(--plan,#5b4ea3);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-width:0;height:44px;accent-color:var(--plan,#5b4ea3);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:700;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;}' +
    '.boutons{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;}' +
    '.boutons button{min-height:44px;border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);background:var(--surface,#fff);color:var(--ink,#241f1a);font:inherit;font-weight:700;cursor:pointer;}' +
    '.boutons button.actif{background:var(--plan-soft,#e9e5f7);border-color:var(--plan,#5b4ea3);}' +
    '</style>' +
    '<div class="choix"><label for="fn">Courbe et point A</label><select id="fn">' +
    '<option value="poly">f(x) = x² − 2x + 1, en A(3 ; 4)</option>' +
    '<option value="cube">f(x) = x³, en A(1 ; 1)</option>' +
    '<option value="abs">f(x) = |x|, en A(0 ; 0) — point anguleux</option>' +
    '</select></div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Courbe de f zoomée autour du point A, avec sa tangente"></svg></div>' +
    '<div class="lecture" id="lecture" aria-live="polite"></div>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="z">Zoom centré sur A</label><div class="curseur-row">' +
    '<input type="range" id="z" min="0" max="' + CRANS + '" step="1" value="0">' +
    '<span class="curseur-valeur" id="z-valeur"></span></div></div>' +
    '<div class="boutons" id="boutons"></div>' +
    '</div>';

  class ZoomTangenteWidget extends HTMLElement {
    constructor() {
      super();
      var s = this.attachShadow({ mode: "open" });
      s.appendChild(TEMPLATE.content.cloneNode(true));
      this._s = s;
      this._fn = "poly";
      this._z = 1;
      var self = this;
      var boutons = s.getElementById("boutons");
      BOUTONS.forEach(function (z) {
        var b = document.createElement("button");
        b.type = "button";
        b.textContent = "×" + z;
        b.dataset.z = String(z);
        boutons.appendChild(b);
      });
      this._onFn = function () { self._fn = s.getElementById("fn").value; self._rendre(); };
      this._onZ = function () {
        var c = parseInt(s.getElementById("z").value, 10);
        self._z = Math.pow(Z_MAX, c / CRANS);
        self._rendre();
      };
      this._onBouton = function (e) {
        var b = e.target.closest("button");
        if (!b) return;
        self._z = parseFloat(b.dataset.z);
        s.getElementById("z").value = String(Math.round(Math.log(self._z) / Math.log(Z_MAX) * CRANS));
        self._rendre();
      };
    }

    connectedCallback() {
      var s = this._s;
      s.getElementById("fn").addEventListener("change", this._onFn);
      s.getElementById("z").addEventListener("input", this._onZ);
      s.getElementById("boutons").addEventListener("click", this._onBouton);
      this._rendre();
    }

    disconnectedCallback() {
      var s = this._s;
      s.getElementById("fn").removeEventListener("change", this._onFn);
      s.getElementById("z").removeEventListener("input", this._onZ);
      s.getElementById("boutons").removeEventListener("click", this._onBouton);
    }

    _rendre() {
      var s = this._s;
      var F = FONCTIONS[this._fn];
      var z = this._z;
      var xMin = F.a - F.wx / z, xMax = F.a + F.wx / z;
      var yMin = F.fa - F.wy / z, yMax = F.fa + F.wy / z;
      var gx = function (x) { return MG + (x - xMin) / (xMax - xMin) * (LARGEUR - MG - MD); };
      var gy = function (y) { return HAUTEUR - MB - (y - yMin) / (yMax - yMin) * (HAUTEUR - MH - MB); };

      var zTxt = (z < 9.95 ? fr(z, 1) : fr(z, 0)).replace(/,0$/, "");
      s.getElementById("z-valeur").textContent = "×" + zTxt;
      Array.prototype.forEach.call(s.getElementById("boutons").children, function (b) {
        b.classList.toggle("actif", Math.abs(parseFloat(b.dataset.z) - z) < 1e-6);
      });

      var svg = s.getElementById("svg");
      svg.innerHTML = "";
      var defs = el("defs", {});
      var mk = el("marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      mk.appendChild(el("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(mk);
      var clip = el("clipPath", { id: "zone" });
      clip.appendChild(el("rect", { x: MG, y: MH, width: LARGEUR - MG - MD, height: HAUTEUR - MH - MB }));
      defs.appendChild(clip);
      svg.appendChild(defs);

      // Grille et graduations adaptées à la fenêtre (sur le bord du cadre)
      var px = pasJoli(xMax - xMin), py = pasJoli(yMax - yMin);
      var decX = Math.max(0, -Math.floor(Math.log10(px) + 1e-9));
      var decY = Math.max(0, -Math.floor(Math.log10(py) + 1e-9));
      var v;
      for (v = Math.ceil(xMin / px) * px; v <= xMax + 1e-12; v += px) {
        svg.appendChild(el("line", { x1: gx(v), x2: gx(v), y1: MH, y2: HAUTEUR - MB, class: "grille" }));
        var tx = el("text", { x: gx(v), y: HAUTEUR - MB + 15, "text-anchor": "middle", class: "grad" });
        tx.textContent = fr(v, decX);
        svg.appendChild(tx);
      }
      for (v = Math.ceil(yMin / py) * py; v <= yMax + 1e-12; v += py) {
        svg.appendChild(el("line", { x1: MG, x2: LARGEUR - MD, y1: gy(v), y2: gy(v), class: "grille" }));
        var ty = el("text", { x: MG - 5, y: gy(v) + 3.5, "text-anchor": "end", class: "grad" });
        ty.textContent = fr(v, decY);
        svg.appendChild(ty);
      }
      svg.appendChild(el("rect", { x: MG, y: MH, width: LARGEUR - MG - MD, height: HAUTEUR - MH - MB, class: "cadre" }));

      // Axes fléchés, seulement s'ils traversent la fenêtre
      if (yMin < 0 && yMax > 0) svg.appendChild(el("line", { x1: MG, x2: LARGEUR - MD - 2, y1: gy(0), y2: gy(0), class: "axe", "marker-end": "url(#fleche)" }));
      if (xMin < 0 && xMax > 0) svg.appendChild(el("line", { x1: gx(0), x2: gx(0), y1: HAUTEUR - MB, y2: MH + 2, class: "axe", "marker-end": "url(#fleche)" }));

      var g = el("g", { "clip-path": "url(#zone)" });
      svg.appendChild(g);

      if (F.d !== null) {
        var x1 = xMin - (xMax - xMin), x2 = xMax + (xMax - xMin);
        g.appendChild(el("line", { x1: gx(x1), y1: gy(F.fa + F.d * (x1 - F.a)), x2: gx(x2), y2: gy(F.fa + F.d * (x2 - F.a)), class: "tangente" }));
      }

      var d = "", n = 400, i;
      for (i = 0; i <= n; i++) {
        var xx = xMin + (i / n) * (xMax - xMin);
        var yy = F.f(xx);
        var yc = Math.max(yMin - (yMax - yMin), Math.min(yMax + (yMax - yMin), yy));
        d += (i === 0 ? "M" : "L") + gx(xx).toFixed(2) + " " + gy(yc).toFixed(2) + " ";
      }
      g.appendChild(el("path", { d: d.trim(), class: "courbe" }));

      var pA = [gx(F.a), gy(F.fa)];
      g.appendChild(el("circle", { cx: pA[0], cy: pA[1], r: 5, class: "pointA" }));
      var etA = el("text", { x: pA[0] + 9, y: pA[1] + 17, class: "etq" });
      etA.textContent = "A";
      g.appendChild(etA);
      var ez = el("text", { x: LARGEUR - MD - 8, y: MH + 18, "text-anchor": "end", class: "zoom-etq" });
      ez.textContent = "zoom ×" + zTxt;
      svg.appendChild(ez);

      // Lecture
      var lecture = s.getElementById("lecture");
      var html = '<p><strong>' + F.titre + '</strong></p>';
      if (F.d !== null) {
        var ecart = 0;
        for (i = 0; i <= 200; i++) {
          var x = xMin + (i / 200) * (xMax - xMin);
          ecart = Math.max(ecart, Math.abs(F.f(x) - (F.fa + F.d * (x - F.a))));
        }
        var pct = ecart / (yMax - yMin) * 100;
        var pctTxt = pct >= 10 ? fr(pct, 0) : pct >= 1 ? fr(pct, 1) : fr(pct, 2);
        html += '<p class="eq">' + F.equation + '</p>' +
          '<p class="ecart">Écart maximal entre la courbe et la tangente dans la fenêtre : ' + pctTxt + ' % de sa hauteur.' +
          (pct < 1 ? ' La courbe et sa tangente sont devenues indiscernables.' : ' Zoome encore.') + '</p>';
      } else {
        html += '<p class="eq anguleux">' + F.equation + '</p>' +
          '<p>À tout zoom, le dessin est exactement le même : le coin reste un coin. f n\'est pas dérivable en 0.</p>';
      }
      lecture.innerHTML = html;
    }
  }

  if (!customElements.get("zoom-tangente-widget")) {
    customElements.define("zoom-tangente-widget", ZoomTangenteWidget);
  }
})();
