(function () {
  "use strict";

  /* ================================================================
   * <pente-angle-widget> — « pente et angle » (4e, géométrie analytique
   * plane, § 3). Une droite réglée par son angle θ avec Ox (0° à 179°)
   * et son ordonnée à l'origine p. Affiche m = tan θ (exact pour les
   * angles remarquables), l'angle avec Oy (90° − θ, ramené dans
   * [0° ; 180°[), p et l'équation y = mx + p ; l'« escalier » (on avance
   * de 1, on monte de m). θ = 90° : droite verticale, ni pente ni p.
   * Pente négative : angle obtus, et rappel « tan⁻¹ négatif → +180° ».
   * Défaut θ = 60°, p = 2 → m = √3, angle avec Oy = 30°.
   * Fenêtre fixe [−5 ; 5] × [−5 ; 5], même échelle sur les deux axes.
   * ================================================================ */

  var DEFAUT = { theta: 60, p: 2 };
  var BORNES_THETA = { min: 0, max: 179, step: 1 };
  var BORNES_P = { min: -3, max: 3, step: 0.5 };
  var CRANS = [0, 30, 45, 60, 90, 120, 135, 150];
  // m = tan θ exacte pour les angles remarquables : [texte brut, HTML]
  var EXACTS = {
    0: ["0", "0"],
    30: ["√3/3", '<span class="fr"><span class="fr-n">√3</span><span class="fr-d">3</span></span>'],
    45: ["1", "1"],
    60: ["√3", "√3"],
    120: ["−√3", "−√3"],
    135: ["−1", "−1"],
    150: ["−√3/3", '−<span class="fr"><span class="fr-n">√3</span><span class="fr-d">3</span></span>'],
  };
  var X_MIN = -5, X_MAX = 5, Y_MIN = -5, Y_MAX = 5;
  var LARGEUR = 400, HAUTEUR = 400, MARGE = 22;
  var NS = "http://www.w3.org/2000/svg";
  var D2R = Math.PI / 180;

  function moins(s) { return String(s).replace(/-/g, "−"); }
  function nbDec(v, dec) {
    var f = Math.pow(10, dec === undefined ? 2 : dec);
    var r = Math.round(v * f) / f;
    if (Object.is(r, -0)) r = 0;
    return moins(String(r).replace(".", ","));
  }
  function svgEl(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}' +
    '*{box-sizing:border-box;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);display:block;}' +
    '.grille{stroke:var(--line,#e2d8c8);stroke-width:0.6;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}' +
    '.graduation{fill:var(--ink-soft,#6b6055);font-size:10px;font-family:var(--sans,sans-serif);}' +
    '.fl-axe{fill:var(--ink-soft,#6b6055);}' +
    '.droite{stroke:var(--accent,#a8471f);stroke-width:2.4;}' +
    '.escalier{stroke:var(--plan,#6a4c9c);stroke-width:2;stroke-dasharray:5 3;fill:none;}' +
    '.parallele{stroke:var(--ink-faint,#9c9083);stroke-width:1.2;stroke-dasharray:4 3;}' +
    '.arc-ox{stroke:var(--accent,#a8471f);stroke-width:2;fill:none;}' +
    '.arc-ox.obtus{stroke:var(--bad,#b23a3a);}' +
    '.arc-oy{stroke:var(--good,#2f7a4f);stroke-width:2;fill:none;}' +
    '.point{fill:var(--ink,#241f1a);}' +
    '.etiquette{font-size:13px;font-weight:700;font-family:var(--sans,sans-serif);paint-order:stroke;stroke:var(--surface-2,#faf6f0);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.et-accent{fill:var(--accent-ink,#7a3212);}' +
    '.et-bad{fill:var(--bad,#b23a3a);}' +
    '.et-good{fill:var(--good,#2f7a4f);}' +
    '.et-plan{fill:var(--plan,#6a4c9c);}' +
    '.et-ink{fill:var(--ink,#241f1a);}' +
    '.fr{display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;font-size:0.82em;line-height:1.05;margin:0 0.08em;}' +
    '.fr-n{border-bottom:1.2px solid currentColor;padding:0 0.15em;}' +
    '.fr-d{padding:0 0.15em;}' +
    '.lecture{display:flex;flex-direction:column;gap:6px;margin:0 0 14px;font-variant-numeric:tabular-nums;}' +
    '.ligne{padding:8px 12px;border-radius:var(--radius,3px);background:var(--surface-2,#faf6f0);font-size:0.92rem;line-height:1.55;overflow-wrap:anywhere;}' +
    '.ligne b{font-weight:700;}' +
    '.ligne i{font-family:Georgia,"Times New Roman",serif;}' +
    '.equation{border-left:3px solid var(--accent,#a8471f);font-size:1rem;}' +
    '.alerte{background:var(--bad-soft,#f6e0dc);color:var(--ink,#241f1a);border-left:3px solid var(--bad,#b23a3a);}' +
    '.info{color:var(--ink-soft,#6b6055);}' +
    '.curseur{display:flex;flex-direction:column;gap:2px;margin:0 0 6px;}' +
    '.curseur label{font-weight:700;color:var(--accent-ink,#7a3212);font-size:0.9rem;}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input{flex:1 1 auto;min-width:0;min-height:44px;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:700;min-width:52px;text-align:right;}' +
    '.crans{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 10px;}' +
    '.crans button{flex:1 0 56px;min-height:44px;padding:6px 4px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);font-weight:700;cursor:pointer;font-family:inherit;font-size:0.88rem;}' +
    '.crans button[aria-pressed="true"]{border-color:var(--accent,#a8471f);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);}' +
    '.btn-reset{display:block;min-height:44px;margin:4px auto 0;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;}' +
    'button:focus-visible,input:focus-visible{outline:2px solid var(--accent,#a8471f);outline-offset:2px;}' +
    '</style>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" role="img" aria-label="Repère : la droite, son angle avec Ox et son escalier"></svg></div>' +
    '<div class="lecture" id="lecture" aria-live="polite"></div>' +
    '<div class="curseur"><label for="theta">Angle θ avec Ox</label><div class="curseur-row">' +
    '<input type="range" id="theta" min="' + BORNES_THETA.min + '" max="' + BORNES_THETA.max + '" step="' + BORNES_THETA.step + '" value="' + DEFAUT.theta + '">' +
    '<span class="curseur-valeur" id="theta-valeur"></span></div></div>' +
    '<div class="crans" id="crans" role="group" aria-label="Angles remarquables"></div>' +
    '<div class="curseur"><label for="p">Ordonnée à l\'origine p</label><div class="curseur-row">' +
    '<input type="range" id="p" min="' + BORNES_P.min + '" max="' + BORNES_P.max + '" step="' + BORNES_P.step + '" value="' + DEFAUT.p + '">' +
    '<span class="curseur-valeur" id="p-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>';

  class PenteAngleWidget extends HTMLElement {
    constructor() {
      super();
      var sh = this.attachShadow({ mode: "open" });
      sh.appendChild(TEMPLATE.content.cloneNode(true));
      this._sh = sh;
      this._e = Object.assign({}, DEFAUT);
      this._svg = sh.getElementById("svg");
      this._lecture = sh.getElementById("lecture");
      this._theta = sh.getElementById("theta");
      this._p = sh.getElementById("p");
      sh.getElementById("crans").innerHTML = CRANS.map(function (c) {
        return '<button type="button" data-theta="' + c + '">' + c + '°</button>';
      }).join("");
    }

    connectedCallback() {
      var self = this;
      this._onInput = function () {
        self._e.theta = parseInt(self._theta.value, 10);
        self._e.p = parseFloat(self._p.value);
        self._rendre();
      };
      this._onClic = function (e) {
        var b = e.target.closest("button[data-theta]");
        if (b) { self._e.theta = parseInt(b.getAttribute("data-theta"), 10); self._theta.value = String(self._e.theta); self._rendre(); return; }
        if (e.target.closest("#reset")) {
          self._e = Object.assign({}, DEFAUT);
          self._theta.value = String(DEFAUT.theta);
          self._p.value = String(DEFAUT.p);
          self._rendre();
        }
      };
      this._theta.addEventListener("input", this._onInput);
      this._p.addEventListener("input", this._onInput);
      this._sh.addEventListener("click", this._onClic);
      this._rendre();
    }

    disconnectedCallback() {
      this._theta.removeEventListener("input", this._onInput);
      this._p.removeEventListener("input", this._onInput);
      this._sh.removeEventListener("click", this._onClic);
    }

    _toPx(x, y) {
      return [
        MARGE + (x - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - 2 * MARGE),
        HAUTEUR - MARGE - (y - Y_MIN) / (Y_MAX - Y_MIN) * (HAUTEUR - 2 * MARGE),
      ];
    }

    _fond() {
      var svg = this._svg;
      svg.innerHTML = "";
      var defs = svgEl("defs", {});
      var mk = svgEl("marker", { id: "fl-axe", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto", markerUnits: "userSpaceOnUse" });
      mk.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fl-axe" }));
      defs.appendChild(mk);
      var clip = svgEl("clipPath", { id: "cadre" });
      clip.appendChild(svgEl("rect", { x: MARGE, y: MARGE, width: LARGEUR - 2 * MARGE, height: HAUTEUR - 2 * MARGE }));
      defs.appendChild(clip);
      svg.appendChild(defs);
      for (var g = X_MIN + 1; g < X_MAX; g++) {
        var px = this._toPx(g, 0)[0], py = this._toPx(0, g)[1];
        svg.appendChild(svgEl("line", { x1: px.toFixed(1), x2: px.toFixed(1), y1: MARGE, y2: HAUTEUR - MARGE, class: "grille" }));
        svg.appendChild(svgEl("line", { x1: MARGE, x2: LARGEUR - MARGE, y1: py.toFixed(1), y2: py.toFixed(1), class: "grille" }));
      }
      var o = this._toPx(0, 0);
      svg.appendChild(svgEl("line", { x1: MARGE, x2: LARGEUR - MARGE + 4, y1: o[1], y2: o[1], class: "axe", "marker-end": "url(#fl-axe)" }));
      svg.appendChild(svgEl("line", { x1: o[0], x2: o[0], y1: HAUTEUR - MARGE, y2: MARGE - 4, class: "axe", "marker-end": "url(#fl-axe)" }));
      var tx = svgEl("text", { x: LARGEUR - MARGE - 2, y: o[1] - 7, "text-anchor": "end", class: "graduation" });
      tx.textContent = "x";
      svg.appendChild(tx);
      var ty = svgEl("text", { x: o[0] + 7, y: MARGE + 8, class: "graduation" });
      ty.textContent = "y";
      svg.appendChild(ty);
      [-4, -2, 2, 4].forEach(function (v) {
        var p = this._toPx(v, 0), q = this._toPx(0, v);
        var a = svgEl("text", { x: p[0].toFixed(1), y: (o[1] + 13).toFixed(1), "text-anchor": "middle", class: "graduation" });
        a.textContent = moins(v);
        svg.appendChild(a);
        var b = svgEl("text", { x: (o[0] - 5).toFixed(1), y: (q[1] + 4).toFixed(1), "text-anchor": "end", class: "graduation" });
        b.textContent = moins(v);
        svg.appendChild(b);
      }, this);
    }

    _segment(p, q, classe, clip) {
      var a = this._toPx(p[0], p[1]), b = this._toPx(q[0], q[1]);
      var attrs = { x1: a[0].toFixed(2), y1: a[1].toFixed(2), x2: b[0].toFixed(2), y2: b[1].toFixed(2), class: classe };
      if (clip) attrs["clip-path"] = "url(#cadre)";
      this._svg.appendChild(svgEl("line", attrs));
    }

    /** Arc de cercle (en pixels) centré en (cx ; cy) math, de l'angle a1 à a2 (degrés, sens direct). */
    _arc(cx, cy, a1, a2, r, classe) {
      var c = this._toPx(cx, cy), pts = [], n = Math.max(6, Math.ceil(Math.abs(a2 - a1) / 4));
      for (var i = 0; i <= n; i++) {
        var a = (a1 + (a2 - a1) * i / n) * D2R;
        pts.push((c[0] + r * Math.cos(a)).toFixed(2) + " " + (c[1] - r * Math.sin(a)).toFixed(2));
      }
      this._svg.appendChild(svgEl("path", { d: "M" + pts.join(" L"), class: classe }));
    }

    _texte(x, y, s, classe, ancre) {
      var t = svgEl("text", { x: x.toFixed(1), y: y.toFixed(1), "text-anchor": ancre || "middle", class: "etiquette " + classe });
      t.textContent = s;
      this._svg.appendChild(t);
      return t;
    }

    /** Texte au milieu d'un arc, à l'extérieur. */
    _etiquetteArc(cx, cy, a1, a2, r, s, classe) {
      var c = this._toPx(cx, cy), am = (a1 + a2) / 2 * D2R;
      var x = c[0] + (r + 14) * Math.cos(am), y = c[1] - (r + 14) * Math.sin(am) + 4;
      x = Math.max(MARGE + 16, Math.min(LARGEUR - MARGE - 16, x));
      y = Math.max(MARGE + 12, Math.min(HAUTEUR - MARGE - 4, y));
      this._texte(x, y, s, classe);
    }

    _rendre() {
      var th = this._e.theta, p = this._e.p, sh = this._sh;
      sh.getElementById("theta-valeur").textContent = th + "°";
      sh.getElementById("p-valeur").textContent = nbDec(p);
      Array.prototype.forEach.call(sh.querySelectorAll("button[data-theta]"), function (b) {
        b.setAttribute("aria-pressed", parseInt(b.getAttribute("data-theta"), 10) === th ? "true" : "false");
      });
      this._fond();

      var verticale = th === 90;
      var m = verticale ? null : Math.tan(th * D2R);
      if (m !== null && Math.abs(m) < 1e-12) m = 0;
      var obtus = th > 90;
      var thOy = 90 - th;
      var thOyRamene = thOy < 0 ? thOy + 180 : thOy;

      // droite : par (0 ; p), direction (cos θ ; sin θ) — verticale : l'axe Oy lui-même
      var dx = Math.cos(th * D2R), dy = Math.sin(th * D2R);
      if (verticale) { dx = 0; dy = 1; }
      var y0 = verticale ? 0 : p;
      this._segment([-20 * dx, y0 - 20 * dy], [20 * dx, y0 + 20 * dy], "droite", true);

      if (!verticale) {
        // escalier : on avance de 1, on monte de m
        var yHaut = Math.max(Y_MIN, Math.min(Y_MAX, p + m));
        this._segment([0, p], [1, p], "escalier", true);
        if (m !== 0) this._segment([1, p], [1, yHaut], "escalier", true);
        var pp = this._toPx(0.5, p);
        this._texte(pp[0], pp[1] + (m >= 0 ? 15 : -7), "1", "et-plan");
        if (m !== 0) {
          var pm = this._toPx(1, (p + yHaut) / 2);
          var mTxt = EXACTS[th] ? EXACTS[th][0] : "≈ " + nbDec(m);
          this._texte(pm[0] + 7, pm[1] + 4, "m = " + mTxt, "et-plan", "start");
        }
        var p0 = this._toPx(0, p);
        this._svg.appendChild(svgEl("circle", { cx: p0[0].toFixed(2), cy: p0[1].toFixed(2), r: 4.5, class: "point" }));
        this._texte(p0[0] - 8, p0[1] - 8, "(0 ; " + nbDec(p) + ")", "et-ink", "end");
      }

      // angle avec Ox : au point d'intersection avec Ox s'il est dans le cadre, sinon au point (0 ; p)
      var classeOx = obtus ? "arc-ox obtus" : "arc-ox";
      var classeEtOx = obtus ? "et-bad" : "et-accent";
      if (verticale) {
        this._arc(0, 0, 0, 90, 26, classeOx);
        this._etiquetteArc(0, 0, 0, 90, 26, "90°", classeEtOx);
      } else if (m !== 0) {
        var x0 = -p / m;
        if (Math.abs(x0) <= 4) {
          this._arc(x0, 0, 0, th, 24, classeOx);
          this._etiquetteArc(x0, 0, 0, th, 24, th + "°", classeEtOx);
        } else {
          this._segment([0, p], [2.2, p], "parallele", true);
          this._arc(0, p, 0, th, 24, classeOx);
          this._etiquetteArc(0, p, 0, th, 24, th + "°", classeEtOx);
        }
      }
      // angle avec Oy : au point (0 ; p), de la droite jusqu'à Oy (sens direct)
      if (!verticale && thOyRamene > 0) {
        this._arc(0, p, th, th + thOyRamene, 40, "arc-oy");
        this._etiquetteArc(0, p, th, th + thOyRamene, 40, thOyRamene + "°", "et-good");
      }

      this._ecrire(th, p, m, verticale, obtus, thOy, thOyRamene);
    }

    _ecrire(th, p, m, verticale, obtus, thOy, thOyRamene) {
      var h = '<div class="ligne">Angle avec Ox : <b>θ = ' + th + '°</b>' + (obtus ? ' — angle obtus' : '') + '</div>';
      var exact = EXACTS[th];
      if (verticale) {
        h += '<div class="ligne alerte">θ = 90° : la droite est <b>verticale</b>. Elle n\'a <b>pas de pente</b> (tan 90° n\'existe pas) ' +
          'et pas d\'ordonnée à l\'origine : passant par (0 ; ' + nbDec(this._e.p) + '), c\'est ici l\'axe Oy lui-même, d\'équation x = 0. ' +
          'Une autre verticale x = k (k ≠ 0) ne couperait jamais Oy.</div>';
        h += '<div class="ligne">Angle avec Oy : 90° − 90° = <b>0°</b></div>';
        h += '<div class="ligne equation">Équation : <b><i>x</i> = 0</b></div>';
        this._lecture.innerHTML = h;
        return;
      }
      var mHtml = exact ? exact[1] : "≈ " + nbDec(m);
      h += '<div class="ligne">Pente : <b>m = tan ' + th + '° ' + (exact ? '= ' : '') + mHtml + '</b>' +
        (m === 0 ? ' — droite horizontale' : (m > 0 ? ' — la droite monte' : ' — la droite descend')) + '</div>';
      h += '<div class="ligne">Angle avec Oy : 90° − ' + th + '° = ' + moins(thOy) + '°' +
        (thOy < 0 ? ', négatif : on ajoute 180° → <b>' + thOyRamene + '°</b>' : ' → <b>' + thOyRamene + '°</b>') + '</div>';
      h += '<div class="ligne">Ordonnée à l\'origine : <b>p = ' + nbDec(this._e.p) + '</b> (la droite coupe Oy en (0 ; ' + nbDec(this._e.p) + '))</div>';
      // équation y = mx + p
      var terme;
      if (m === 0) terme = "";
      else if (exact) terme = (exact[0] === "1" ? "" : exact[0] === "−1" ? "−" : exact[1]) + "<i>x</i>";
      else terme = nbDec(m) + "<i>x</i>";
      var pTxt = "";
      if (p !== 0) pTxt = terme ? (p > 0 ? " + " : " − ") + nbDec(Math.abs(p)) : nbDec(p);
      else if (!terme) pTxt = "0";
      h += '<div class="ligne equation">Équation : <b><i>y</i> ' + (exact ? '=' : '≈') + ' ' + terme + pTxt + '</b></div>';
      h += '<div class="ligne info">Escalier : on avance de 1, on monte de m' + (m < 0 ? ' (m &lt; 0 : on descend)' : '') + '.</div>';
      if (m < 0) {
        h += '<div class="ligne alerte">Pente négative → angle avec Ox <b>obtus</b> (jamais négatif). La calculatrice donne ' +
          'tan⁻¹(' + (exact ? exact[0] : nbDec(m)) + ') ' + (exact ? '=' : '≈') + ' ' + moins(th - 180) + '°, un angle négatif : ' +
          'ajoute 180° → θ = ' + moins(th - 180) + '° + 180° = ' + th + '°.</div>';
      }
      this._lecture.innerHTML = h;
    }
  }

  if (!customElements.get("pente-angle-widget")) {
    customElements.define("pente-angle-widget", PenteAngleWidget);
  }
})();
