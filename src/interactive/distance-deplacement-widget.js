(function () {
  "use strict";

  /* ================================================================
   * <distance-deplacement-widget> — atelier interactif (6e ch. 4, § 7) :
   * graphique de v(t) en haut (aire verte si v > 0, rouge si v < 0),
   * voiture sur une droite graduée en dessous, position x(t) = ∫₀ᵗ v.
   * Deux compteurs qui divergent dès que v change de signe :
   * déplacement = ∫₀ᵗ v(s) ds et distance parcourue = ∫₀ᵗ |v(s)| ds.
   * Trace des allers-retours sous la route (le temps descend). Fenêtres
   * fixes par préréglage. Web Component (Shadow DOM).
   * ================================================================ */

  var LARGEUR = 420;
  var H_V = 200, H_ROUTE = 120;
  var MG = 40, MD = 24;

  var PRESETS = [
    {
      id: "aller-retour", label: "Aller-retour",
      T: 3, vMin: -1.6, vMax: 3.6, xMin: -0.4, xMax: 2,
      v: function (t) { return t * t - 4 * t + 3; },
      X: function (t) { return t * t * t / 3 - 2 * t * t + 3 * t; },
      vTexte: "v(t) = t² − 4t + 3, t ∈ [0 ; 3]",
      graduations: [0, 0.5, 1, 1.5],
      fin: "Déplacement nul : la voiture revient à son point de départ, mais elle a parcouru 4/3 à l'aller et 4/3 au retour, soit 8/3 ≈ 2,67."
    },
    {
      id: "exemple", label: "Exemple du cours",
      T: 2, vMin: -0.8, vMax: 8, xMin: -1, xMax: 11,
      v: function (t) { return 2 * t + 3; },
      X: function (t) { return t * t + 3 * t; },
      vTexte: "v(t) = 2t + 3, t ∈ [0 ; 2]",
      graduations: [0, 2, 4, 6, 8, 10],
      fin: "v(t) > 0 tout le temps : la voiture ne recule jamais, déplacement et distance valent tous les deux 10."
    },
    {
      id: "sinus", label: "v(t) = 3 sin(t)",
      T: 2 * Math.PI, vMin: -3.6, vMax: 3.6, xMin: -0.6, xMax: 7,
      v: function (t) { return 3 * Math.sin(t); },
      X: function (t) { return 3 - 3 * Math.cos(t); },
      vTexte: "v(t) = 3 sin(t), t ∈ [0 ; 2π]",
      graduations: [0, 2, 4, 6],
      fin: "Déplacement nul après un aller (6) et un retour (6) : la distance parcourue vaut 12."
    }
  ];

  function formatNombreFr(n, decimales) {
    var facteur = Math.pow(10, decimales);
    var arrondi = Math.round(n * facteur) / facteur;
    if (Object.is(arrondi, -0) || Math.abs(arrondi) < 1e-12) arrondi = 0;
    return arrondi.toFixed(decimales).replace(".", ",").replace("-", "−");
  }

  function svgEl(tag, attrs) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var key in attrs) el.setAttribute(key, attrs[key]);
    return el;
  }

  function chemin(points) {
    var d = "";
    for (var i = 0; i < points.length; i++) d += (i === 0 ? "M" : "L") + points[i][0].toFixed(1) + " " + points[i][1].toFixed(1) + " ";
    return d.trim();
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.presets{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-bottom:10px;}' +
    '.presets button{min-height:44px;padding:8px 12px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);font:inherit;font-size:0.9rem;cursor:pointer;}' +
    '.presets button[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);border-color:var(--accent,#a8471f);color:var(--accent-ink,#7a3212);font-weight:700;}' +
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.02rem;font-weight:600;color:var(--ink,#241f1a);margin:0 0 10px;}' +
    '.graphe-zone{display:flex;flex-direction:column;align-items:center;gap:6px;margin-bottom:10px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.grad{stroke:var(--ink-faint,#9c9083);stroke-width:1;}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.courbe{stroke:var(--ink,#241f1a);stroke-width:2.2;fill:none;}' +
    '.pos{fill:var(--good,#2f7a4f);fill-opacity:0.32;}' +
    '.neg{fill:var(--bad,#b23a3a);fill-opacity:0.32;}' +
    '.repere{stroke:var(--accent,#a8471f);stroke-width:1.5;stroke-dasharray:4 3;}' +
    '.point{fill:var(--accent,#a8471f);}' +
    '.route{stroke:var(--ink-soft,#6b6055);stroke-width:2;}' +
    '.trace{stroke:var(--plan,#5b4ea3);stroke-width:2;fill:none;}' +
    '.voiture{fill:var(--accent,#a8471f);}' +
    '.roue{fill:var(--ink,#241f1a);}' +
    '.depart{fill:var(--ink-faint,#9c9083);}' +
    '.stats{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin:0 0 10px;}' +
    '.stat{flex:1 1 120px;min-width:0;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:8px 6px;text-align:center;background:var(--surface,#fff);}' +
    '.stat-label{display:block;font-size:0.78rem;color:var(--ink-faint,#9c9083);margin-bottom:4px;}' +
    '.stat-value{display:block;font-variant-numeric:tabular-nums;font-size:1rem;font-weight:700;color:var(--ink,#241f1a);}' +
    '.message{text-align:center;font-size:0.92rem;color:var(--ink,#241f1a);margin:0 0 12px;min-height:2.6em;line-height:1.4;}' +
    '.message .recule{color:var(--bad,#b23a3a);font-weight:700;}' +
    '.message .avance{color:var(--good,#2f7a4f);font-weight:700;}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;min-height:44px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-width:0;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:48px;text-align:right;font-size:0.92rem;}' +
    '.boutons{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;}' +
    '.boutons button{min-height:44px;padding:8px 16px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.9rem;font-family:inherit;}' +
    '</style>' +
    '<div class="presets" id="presets"></div>' +
    '<p class="formule" id="formule"></p>' +
    '<div class="graphe-zone">' +
    '<svg id="svg-v" viewBox="0 0 ' + LARGEUR + ' ' + H_V + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Graphique de la vitesse"></svg>' +
    '<svg id="svg-route" viewBox="0 0 ' + LARGEUR + ' ' + H_ROUTE + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Position de la voiture sur une droite"></svg>' +
    '</div>' +
    '<div class="stats">' +
    '<div class="stat"><span class="stat-label">déplacement = ∫₀ᵗ v(s) ds</span><span class="stat-value" id="dep"></span></div>' +
    '<div class="stat"><span class="stat-label">distance parcourue = ∫₀ᵗ |v(s)| ds</span><span class="stat-value" id="dist"></span></div>' +
    '</div>' +
    '<p class="message" id="message"></p>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="t">t — instant</label><div class="curseur-row">' +
    '<input type="range" id="t" min="0" max="3" step="0.01" value="0">' +
    '<span class="curseur-valeur" id="t-valeur"></span></div></div>' +
    '<div class="boutons"><button type="button" id="lecture">▶ Lecture</button><button type="button" id="reset">Réinitialiser</button></div>' +
    '</div>';

  class DistanceDeplacementWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      var self = this;
      this._svgV = shadow.getElementById("svg-v");
      this._svgR = shadow.getElementById("svg-route");
      this._formule = shadow.getElementById("formule");
      this._dep = shadow.getElementById("dep");
      this._dist = shadow.getElementById("dist");
      this._message = shadow.getElementById("message");
      this._inputT = shadow.getElementById("t");
      this._valT = shadow.getElementById("t-valeur");
      this._btnLecture = shadow.getElementById("lecture");
      this._btnReset = shadow.getElementById("reset");
      this._boutons = [];
      var zone = shadow.getElementById("presets");
      PRESETS.forEach(function (p, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.textContent = p.label;
        b.addEventListener("click", function () { self._stop(); self._choisir(i); });
        zone.appendChild(b);
        self._boutons.push(b);
      });
      this._inputT.addEventListener("input", function () {
        self._stop();
        var T = PRESETS[self._i].T;
        var t = Math.min(T, parseFloat(self._inputT.value));
        // le pas 0,01 du curseur n'atteint pas exactement 2π : on recolle à la borne
        if (T - t < 0.006) t = T;
        self._t = t;
        self._rendre();
      });
      this._btnLecture.addEventListener("click", function () { self._basculerLecture(); });
      this._btnReset.addEventListener("click", function () { self._stop(); self._choisir(0); });
      this._anim = null;
      this._choisir(0);
    }

    disconnectedCallback() { this._stop(); }

    _choisir(i) {
      this._i = i;
      var p = PRESETS[i];
      this._t = 0;
      this._inputT.max = String(p.T);
      this._inputT.value = "0";
      this._boutons.forEach(function (b, k) { b.setAttribute("aria-pressed", k === i ? "true" : "false"); });
      this._rendre();
    }

    _stop() {
      if (this._anim) cancelAnimationFrame(this._anim);
      this._anim = null;
      this._btnLecture.textContent = "▶ Lecture";
    }

    _basculerLecture() {
      var self = this;
      if (this._anim) { this._stop(); return; }
      var p = PRESETS[this._i];
      var reduit = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (this._t >= p.T - 1e-9) this._t = 0;
      if (reduit) { this._t = p.T; this._inputT.value = String(p.T); this._rendre(); return; }
      var duree = 5000 * (p.T - this._t) / p.T;
      var t0 = this._t, debut = null;
      this._btnLecture.textContent = "❚❚ Pause";
      function pas(ts) {
        if (debut === null) debut = ts;
        var u = Math.min(1, (ts - debut) / duree);
        self._t = t0 + (p.T - t0) * u;
        self._inputT.value = String(self._t);
        self._rendre();
        if (u < 1) self._anim = requestAnimationFrame(pas);
        else self._stop();
      }
      this._anim = requestAnimationFrame(pas);
    }

    _distance(t) {
      var p = PRESETS[this._i];
      var n = 2000, h = t / n, s = 0;
      if (t <= 0) return 0;
      for (var k = 0; k < n; k++) {
        var a = Math.abs(p.v(k * h)), b = Math.abs(p.v((k + 1) * h)), m = Math.abs(p.v((k + 0.5) * h));
        s += (a + 4 * m + b) * h / 6;
      }
      return s;
    }

    _rendre() {
      var p = PRESETS[this._i];
      var t = this._t;
      // ---------- graphique de v
      var svg = this._svgV;
      svg.innerHTML = "";
      var defs = svgEl("defs", {});
      var m = svgEl("marker", { id: "flv", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      m.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(m);
      svg.appendChild(defs);
      var MH = 22, MB = 26;
      function tx(tt) { return MG + tt / p.T * (LARGEUR - MG - MD - 14); }
      function vy(v) { return MH + (p.vMax - v) / (p.vMax - p.vMin) * (H_V - MH - MB); }
      // aires de 0 à t
      var nA = 160;
      for (var k = 0; k < nA; k++) {
        var ta = t * k / nA, tb = t * (k + 1) / nA;
        if (tb <= ta) break;
        var va = p.v(ta), vb = p.v(tb);
        var cls = (va + vb) / 2 >= 0 ? "pos" : "neg";
        var d = "M" + tx(ta).toFixed(1) + " " + vy(0).toFixed(1) + " L" + tx(ta).toFixed(1) + " " + vy(va).toFixed(1) +
          " L" + tx(tb).toFixed(1) + " " + vy(vb).toFixed(1) + " L" + tx(tb).toFixed(1) + " " + vy(0).toFixed(1) + " Z";
        svg.appendChild(svgEl("path", { d: d, class: cls }));
      }
      svg.appendChild(svgEl("line", { x1: MG - 6, y1: vy(0), x2: LARGEUR - MD, y2: vy(0), class: "axe", "marker-end": "url(#flv)" }));
      svg.appendChild(svgEl("line", { x1: MG, y1: H_V - 6, x2: MG, y2: 8, class: "axe", "marker-end": "url(#flv)" }));
      var lt = svgEl("text", { x: LARGEUR - MD + 2, y: vy(0) - 6, class: "etiquette", "text-anchor": "end" });
      lt.textContent = "t";
      svg.appendChild(lt);
      var lv = svgEl("text", { x: MG + 6, y: 16, class: "etiquette" });
      lv.textContent = "v(t)";
      svg.appendChild(lv);
      var pts = [];
      for (var i = 0; i <= 200; i++) { var tt = p.T * i / 200; pts.push([tx(tt), vy(p.v(tt))]); }
      svg.appendChild(svgEl("path", { d: chemin(pts), class: "courbe" }));
      // graduation de fin
      var lT = svgEl("text", { x: tx(p.T), y: vy(0) + 16, class: "etiquette", "text-anchor": "middle" });
      lT.textContent = p.id === "sinus" ? "2π" : formatNombreFr(p.T, 0);
      svg.appendChild(lT);
      svg.appendChild(svgEl("line", { x1: tx(t), y1: MH - 6, x2: tx(t), y2: H_V - MB + 4, class: "repere" }));
      svg.appendChild(svgEl("circle", { cx: tx(t), cy: vy(p.v(t)), r: 5, class: "point" }));

      // ---------- route
      var r = this._svgR;
      r.innerHTML = "";
      var ROUTE_Y = 34;
      function rx(x) { return 22 + (x - p.xMin) / (p.xMax - p.xMin) * (LARGEUR - 44); }
      r.appendChild(svgEl("line", { x1: 12, y1: ROUTE_Y, x2: LARGEUR - 10, y2: ROUTE_Y, class: "route" }));
      p.graduations.forEach(function (g) {
        r.appendChild(svgEl("line", { x1: rx(g), y1: ROUTE_Y - 4, x2: rx(g), y2: ROUTE_Y + 4, class: "grad" }));
        var lg = svgEl("text", { x: rx(g), y: ROUTE_Y + 17, class: "etiquette", "text-anchor": "middle" });
        lg.textContent = formatNombreFr(g, g % 1 === 0 ? 0 : 1);
        r.appendChild(lg);
      });
      r.appendChild(svgEl("circle", { cx: rx(0), cy: ROUTE_Y, r: 3.5, class: "depart" }));
      // trace : position en fonction du temps (le temps descend sous la route)
      var tr = [];
      var nT = 120;
      for (var q = 0; q <= nT; q++) { var tq = t * q / nT; tr.push([rx(p.X(tq)), ROUTE_Y + 26 + (tq / p.T) * (H_ROUTE - ROUTE_Y - 32)]); }
      if (t > 0) r.appendChild(svgEl("path", { d: chemin(tr), class: "trace" }));
      // voiture
      var xc = rx(p.X(t));
      var vt = p.v(t);
      var sens = vt < -1e-9 ? -1 : 1;
      var corps = "M" + (xc - 14) + " " + (ROUTE_Y - 6) + " L" + (xc + 14) + " " + (ROUTE_Y - 6) + " L" + (xc + 14) + " " + (ROUTE_Y - 13) +
        " L" + (xc + 6 * sens) + " " + (ROUTE_Y - 13) + " L" + (xc + 1 * sens) + " " + (ROUTE_Y - 20) + " L" + (xc - 9 * sens) + " " + (ROUTE_Y - 20) +
        " L" + (xc - 14 * sens) + " " + (ROUTE_Y - 13) + " L" + (xc - 14) + " " + (ROUTE_Y - 13) + " Z";
      r.appendChild(svgEl("path", { d: corps, class: "voiture" }));
      r.appendChild(svgEl("circle", { cx: xc - 8, cy: ROUTE_Y - 5, r: 3.5, class: "roue" }));
      r.appendChild(svgEl("circle", { cx: xc + 8, cy: ROUTE_Y - 5, r: 3.5, class: "roue" }));

      // ---------- textes
      this._formule.textContent = p.vTexte + ", départ en x = 0";
      this._valT.textContent = formatNombreFr(t, 2);
      var dep = p.X(t) - p.X(0);
      var dist = this._distance(t);
      this._dep.textContent = formatNombreFr(dep, 2);
      this._dist.textContent = formatNombreFr(dist, 2);
      this._message.innerHTML = "";
      var span = document.createElement("span");
      if (t >= p.T - 1e-6) {
        this._message.textContent = p.fin;
        return;
      }
      if (Math.abs(vt) < 0.02) {
        this._message.textContent = "v(t) ≈ 0 : la voiture s'arrête un instant — si v change de signe, elle repart dans l'autre sens.";
      } else if (vt > 0) {
        span.className = "avance";
        span.textContent = "v(t) > 0 : la voiture avance.";
        this._message.appendChild(span);
        this._message.appendChild(document.createTextNode(" Le déplacement et la distance augmentent ensemble."));
      } else {
        span.className = "recule";
        span.textContent = "v(t) < 0 : la voiture recule.";
        this._message.appendChild(span);
        this._message.appendChild(document.createTextNode(" Le déplacement diminue, mais la distance parcourue continue d'augmenter."));
      }
    }
  }

  if (!customElements.get("distance-deplacement-widget")) {
    customElements.define("distance-deplacement-widget", DistanceDeplacementWidget);
  }
})();
