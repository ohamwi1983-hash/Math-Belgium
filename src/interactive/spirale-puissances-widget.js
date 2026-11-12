(function () {
  "use strict";

  /* ================================================================
   * <spirale-puissances-widget> — atelier interactif (6e, ch. 5, §5
   * « Formule de Moivre ») : z = r·(cos θ + i sin θ), curseurs r et θ.
   * Les points z⁰ = 1, z, z², …, z¹² sont reliés dans l'ordre : chaque
   * multiplication par z tourne de θ ET change la taille d'un facteur r.
   * r < 1 : la spirale s'enroule vers 0 (cycle amorti) ; r = 1 : les
   * points restent sur le cercle unité (Moivre pur) ; r > 1 : la spirale
   * s'éloigne (cycle amplifié). Un curseur n met en évidence zⁿ avec son
   * module rⁿ et son argument nθ. Fenêtre FIXE, coupée proprement par un
   * clipPath (aucun recadrage, aucun point infini). Web Component.
   * ================================================================ */

  var D2R = Math.PI / 180;
  var DEFAUT = { r: 0.9, theta: 40, n: 5 };
  var BORNES_R = { min: 0.7, max: 1.3, step: 0.01 };
  var BORNES_THETA = { min: 0, max: 180, step: 1 };
  var N_MAX = 12;

  var X_MIN = -2.5, X_MAX = 2.5, Y_MIN = -2.5, Y_MAX = 2.5;
  var MARGE = 26, ECHELLE = 61;
  var LARGEUR = 2 * MARGE + (X_MAX - X_MIN) * ECHELLE;
  var HAUTEUR = 2 * MARGE + (Y_MAX - Y_MIN) * ECHELLE;
  var EPS = 1e-9;

  function nombreFr(n, decimales) {
    var facteur = Math.pow(10, decimales);
    var arrondi = Math.round(n * facteur) / facteur;
    if (Object.is(arrondi, -0) || Math.abs(arrondi) < EPS) arrondi = 0;
    return arrondi.toFixed(decimales).replace(".", ",").replace("-", "−");
  }

  var EXPOSANTS = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
  function exposant(n) {
    return String(n).split("").map(function (ch) { return EXPOSANTS[ch]; }).join("");
  }

  function svgEl(tag, attrs) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var key in attrs) el.setAttribute(key, attrs[key]);
    return el;
  }

  function toPx(x, y) {
    return [MARGE + (x - X_MIN) * ECHELLE, HAUTEUR - MARGE - (y - Y_MIN) * ECHELLE];
  }

  function dansCadre(x, y) {
    return x >= X_MIN && x <= X_MAX && y >= Y_MIN && y <= Y_MAX;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:' + LARGEUR + 'px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.grille{stroke:var(--line,#e2d8c8);stroke-width:0.7;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.graduation{font-size:9px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.nom-axe{font-size:10px;font-weight:700;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.cercle-unite{fill:none;stroke:var(--ink-soft,#6b6055);stroke-width:1;stroke-dasharray:4 3;opacity:0.7;}' +
    '.spirale{fill:none;stroke-width:1.8;stroke-linejoin:round;}' +
    '.spirale.amorti{stroke:var(--good,#2f7a4f);}' +
    '.spirale.cercle{stroke:var(--plan,#5b4ea3);}' +
    '.spirale.amplifie{stroke:var(--bad,#b23a3a);}' +
    '.point{stroke:var(--surface,#fff);stroke-width:1;}' +
    '.point.amorti{fill:var(--good,#2f7a4f);}' +
    '.point.cercle{fill:var(--plan,#5b4ea3);}' +
    '.point.amplifie{fill:var(--bad,#b23a3a);}' +
    '.point-depart{fill:var(--ink,#2b2620);}' +
    '.point-n{fill:var(--accent,#a8471f);stroke:var(--surface,#fff);stroke-width:2;}' +
    '.rayon-n{stroke:var(--accent,#a8471f);stroke-width:1.6;stroke-dasharray:5 3;}' +
    '.etiquette{font-size:10px;font-weight:700;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.etiquette-n{font-size:12px;font-weight:700;fill:var(--accent-ink,#7a3212);font-family:var(--sans,sans-serif);}' +
    '.hors-cadre{font-size:10px;fill:var(--bad,#b23a3a);font-family:var(--sans,sans-serif);}' +
    '.lecture{text-align:center;font-size:0.88rem;font-weight:600;margin:0 0 8px;padding:10px 14px;border-radius:var(--radius,3px);color:var(--ink,#2b2620);background:var(--surface-2,#faf6f0);line-height:1.7;font-variant-numeric:tabular-nums;}' +
    '.verdict{text-align:center;font-size:0.88rem;font-weight:700;margin:0 0 16px;padding:8px 12px;border-radius:var(--radius,3px);}' +
    '.verdict.amorti{color:var(--good,#2f7a4f);background:var(--good-soft,#e3f1e8);}' +
    '.verdict.cercle{color:var(--plan-ink,#443a80);background:var(--plan-soft,#ece9f8);}' +
    '.verdict.amplifie{color:var(--bad,#b23a3a);background:var(--bad-soft,#f7e1e1);}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-width:0;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:52px;text-align:right;font-size:0.92rem;}' +
    '.boutons{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;}' +
    'button{padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;}' +
    'button:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Spirale des puissances de z"></svg></div>' +
    '<p class="lecture" id="lecture"></p>' +
    '<p class="verdict" id="verdict"></p>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="r">r = |z|</label><div class="curseur-row">' +
    '<input type="range" id="r" min="' + BORNES_R.min + '" max="' + BORNES_R.max + '" step="' + BORNES_R.step + '" value="' + DEFAUT.r + '">' +
    '<span class="curseur-valeur" id="r-valeur"></span></div></div>' +
    '<div class="curseur"><label for="theta">θ = arg(z)</label><div class="curseur-row">' +
    '<input type="range" id="theta" min="' + BORNES_THETA.min + '" max="' + BORNES_THETA.max + '" step="' + BORNES_THETA.step + '" value="' + DEFAUT.theta + '">' +
    '<span class="curseur-valeur" id="theta-valeur"></span></div></div>' +
    '<div class="curseur"><label for="n">n (puissance mise en évidence)</label><div class="curseur-row">' +
    '<input type="range" id="n" min="1" max="' + N_MAX + '" step="1" value="' + DEFAUT.n + '">' +
    '<span class="curseur-valeur" id="n-valeur"></span></div></div>' +
    '<div class="boutons">' +
    '<button type="button" data-r="0.85">r &lt; 1</button>' +
    '<button type="button" data-r="1">r = 1</button>' +
    '<button type="button" data-r="1.1">r &gt; 1</button>' +
    '<button type="button" id="reset">Réinitialiser</button>' +
    '</div>' +
    '</div>';

  class SpiralePuissancesWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._r = DEFAUT.r; this._theta = DEFAUT.theta; this._n = DEFAUT.n;
      this._svg = shadow.getElementById("svg");
      this._lecture = shadow.getElementById("lecture");
      this._verdict = shadow.getElementById("verdict");
      this._inputR = shadow.getElementById("r");
      this._inputTheta = shadow.getElementById("theta");
      this._inputN = shadow.getElementById("n");
      this._valeurR = shadow.getElementById("r-valeur");
      this._valeurTheta = shadow.getElementById("theta-valeur");
      this._valeurN = shadow.getElementById("n-valeur");
      this._boutons = shadow.querySelector(".boutons");
    }

    connectedCallback() {
      var self = this;
      this._onR = function () { self._r = parseFloat(self._inputR.value); self._rendre(); };
      this._onTheta = function () { self._theta = parseFloat(self._inputTheta.value); self._rendre(); };
      this._onN = function () { self._n = parseInt(self._inputN.value, 10); self._rendre(); };
      this._onBoutons = function (evt) {
        var btn = evt.target.closest("button");
        if (!btn) return;
        if (btn.id === "reset") {
          self._r = DEFAUT.r; self._theta = DEFAUT.theta; self._n = DEFAUT.n;
          self._inputTheta.value = String(DEFAUT.theta);
          self._inputN.value = String(DEFAUT.n);
        } else {
          self._r = parseFloat(btn.getAttribute("data-r"));
        }
        self._inputR.value = String(self._r);
        self._rendre();
      };
      this._inputR.addEventListener("input", this._onR);
      this._inputTheta.addEventListener("input", this._onTheta);
      this._inputN.addEventListener("input", this._onN);
      this._boutons.addEventListener("click", this._onBoutons);
      this._rendre();
    }

    disconnectedCallback() {
      this._inputR.removeEventListener("input", this._onR);
      this._inputTheta.removeEventListener("input", this._onTheta);
      this._inputN.removeEventListener("input", this._onN);
      this._boutons.removeEventListener("click", this._onBoutons);
    }

    _rendre() {
      var r = this._r, thetaDeg = this._theta, n = this._n;
      var regime = Math.abs(r - 1) < EPS ? "cercle" : r < 1 ? "amorti" : "amplifie";
      this._valeurR.textContent = nombreFr(r, 2);
      this._valeurTheta.textContent = nombreFr(thetaDeg, 0) + "°";
      this._valeurN.textContent = String(n);

      var pts = [];
      for (var k = 0; k <= N_MAX; k++) {
        var mod = Math.pow(r, k), ang = k * thetaDeg * D2R;
        pts.push({ x: mod * Math.cos(ang), y: mod * Math.sin(ang), mod: mod });
      }

      var svg = this._svg;
      svg.innerHTML = "";
      var defs = svgEl("defs", {});
      var marqueur = svgEl("marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      marqueur.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(marqueur);
      var clip = svgEl("clipPath", { id: "cadre" });
      clip.appendChild(svgEl("rect", { x: MARGE, y: MARGE, width: LARGEUR - 2 * MARGE, height: HAUTEUR - 2 * MARGE }));
      defs.appendChild(clip);
      svg.appendChild(defs);

      for (var g = Math.ceil(X_MIN); g <= Math.floor(X_MAX); g++) {
        if (g === 0) continue;
        var gx = toPx(g, 0)[0], gy = toPx(0, g)[1];
        svg.appendChild(svgEl("line", { x1: gx, x2: gx, y1: MARGE, y2: HAUTEUR - MARGE, class: "grille" }));
        svg.appendChild(svgEl("line", { x1: MARGE, x2: LARGEUR - MARGE, y1: gy, y2: gy, class: "grille" }));
      }
      var o = toPx(0, 0);
      svg.appendChild(svgEl("line", { x1: MARGE - 6, x2: LARGEUR - MARGE + 8, y1: o[1], y2: o[1], class: "axe", "marker-end": "url(#fleche)" }));
      svg.appendChild(svgEl("line", { x1: o[0], x2: o[0], y1: HAUTEUR - MARGE + 6, y2: MARGE - 8, class: "axe", "marker-end": "url(#fleche)" }));
      var nomRe = svgEl("text", { x: LARGEUR - MARGE + 2, y: o[1] - 8, "text-anchor": "end", class: "nom-axe" });
      nomRe.textContent = "Re";
      svg.appendChild(nomRe);
      var nomIm = svgEl("text", { x: o[0] + 8, y: MARGE - 2, class: "nom-axe" });
      nomIm.textContent = "Im";
      svg.appendChild(nomIm);
      [-2, -1, 1, 2].forEach(function (v) {
        var px = toPx(v, 0), py = toPx(0, v);
        var tx = svgEl("text", { x: px[0], y: px[1] + 13, "text-anchor": "middle", class: "graduation" });
        tx.textContent = nombreFr(v, 0);
        svg.appendChild(tx);
        var ty = svgEl("text", { x: py[0] - 5, y: py[1] + 3, "text-anchor": "end", class: "graduation" });
        ty.textContent = (v === 1 ? "" : v === -1 ? "−" : nombreFr(v, 0)) + "i";
        svg.appendChild(ty);
      });
      svg.appendChild(svgEl("circle", { cx: o[0], cy: o[1], r: ECHELLE, class: "cercle-unite" }));

      // Spirale (coupée au cadre par le clipPath — jamais de recadrage).
      var groupe = svgEl("g", { "clip-path": "url(#cadre)" });
      var d = pts.map(function (p, i) {
        // Borne les coordonnées dessinées (r¹² ≤ 1,3¹² ≈ 23 : largement fini, mais on reste sobre).
        var q = toPx(Math.max(-40, Math.min(40, p.x)), Math.max(-40, Math.min(40, p.y)));
        return (i === 0 ? "M" : "L") + q[0].toFixed(2) + "," + q[1].toFixed(2);
      }).join(" ");
      groupe.appendChild(svgEl("path", { d: d, class: "spirale " + regime }));
      var pn = pts[n];
      if (dansCadre(pn.x, pn.y)) {
        var qn = toPx(pn.x, pn.y);
        groupe.appendChild(svgEl("line", { x1: o[0], y1: o[1], x2: qn[0].toFixed(2), y2: qn[1].toFixed(2), class: "rayon-n" }));
      }
      svg.appendChild(groupe);

      var horsCadre = 0;
      pts.forEach(function (p, i) {
        if (!dansCadre(p.x, p.y)) { horsCadre++; return; }
        var q = toPx(p.x, p.y);
        if (i === 0) {
          svg.appendChild(svgEl("circle", { cx: q[0], cy: q[1], r: 4, class: "point-depart" }));
          return;
        }
        svg.appendChild(svgEl("circle", { cx: q[0].toFixed(2), cy: q[1].toFixed(2), r: i === n ? 0 : 3.6, class: "point " + regime }));
      });
      // Étiquettes : 1 (départ), z, et zⁿ (mis en évidence) — jamais rognées.
      function etiquette(p, texte, classe) {
        if (!dansCadre(p.x, p.y)) return;
        var q = toPx(p.x, p.y);
        var droite = q[0] > LARGEUR - 70, haut = q[1] < MARGE + 18;
        var t = svgEl("text", { x: (q[0] + (droite ? -8 : 8)).toFixed(2), y: (q[1] + (haut ? 16 : -8)).toFixed(2), "text-anchor": droite ? "end" : "start", class: classe });
        t.textContent = texte;
        svg.appendChild(t);
      }
      etiquette(pts[0], "1", "etiquette");
      if (n !== 1) etiquette(pts[1], "z", "etiquette");
      if (dansCadre(pn.x, pn.y)) {
        var qn2 = toPx(pn.x, pn.y);
        svg.appendChild(svgEl("circle", { cx: qn2[0].toFixed(2), cy: qn2[1].toFixed(2), r: 6, class: "point-n" }));
      }
      etiquette(pn, n === 1 ? "z" : "z" + exposant(n), "etiquette-n");
      if (horsCadre > 0) {
        var hc = svgEl("text", { x: MARGE + 4, y: HAUTEUR - MARGE - 6, class: "hors-cadre" });
        hc.textContent = horsCadre + (horsCadre === 1 ? " point hors du cadre" : " points hors du cadre");
        svg.appendChild(hc);
      }

      var argN = ((n * thetaDeg) % 360 + 360) % 360;
      var zn = n === 1 ? "z" : "z" + exposant(n);
      this._lecture.textContent = n === 1
        ? "z = r·(cos θ + i sin θ)   —   |z| = " + nombreFr(r, 2) + "   ;   arg(z) = " + nombreFr(thetaDeg, 0) + "°"
        : zn + " = r" + exposant(n) + "·(cos " + n + "θ + i sin " + n + "θ)   —   |" + zn + "| = " + nombreFr(r, 2) + exposant(n) + " ≈ " +
          nombreFr(pn.mod, 3) + "   ;   arg(" + zn + ") = " + n + " × " + nombreFr(thetaDeg, 0) + "° ≡ " + nombreFr(argN, 0) + "°";

      if (regime === "amorti") {
        this._verdict.className = "verdict amorti";
        this._verdict.textContent = "r < 1 : |zⁿ| = rⁿ diminue, la spirale s'enroule vers 0 — un cycle économique amorti, qui revient à l'équilibre.";
      } else if (regime === "cercle") {
        this._verdict.className = "verdict cercle";
        this._verdict.textContent = "r = 1 : |zⁿ| = 1, tous les points restent sur le cercle unité — Moivre pur : seul l'angle est multiplié par n.";
      } else {
        this._verdict.className = "verdict amplifie";
        this._verdict.textContent = "r > 1 : |zⁿ| = rⁿ grandit sans limite, la spirale s'éloigne — un cycle économique qui s'amplifie.";
      }
    }
  }

  if (!customElements.get("spirale-puissances-widget")) {
    customElements.define("spirale-puissances-widget", SpiralePuissancesWidget);
  }
})();
