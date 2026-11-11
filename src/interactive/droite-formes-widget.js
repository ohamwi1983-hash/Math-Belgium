(function () {
  "use strict";

  /* ================================================================
   * <droite-formes-widget> — « une droite, quatre écritures » (4e,
   * géométrie analytique plane, § 1). Un point A et un vecteur
   * directeur u (coordonnées entières, déplaçables au doigt, à la
   * souris ou aux boutons −/+). Les 4 formes se réécrivent en direct :
   * implicite (vecteur normal (−β ; α)), explicite en y (impossible si
   * la droite est verticale), explicite en x (impossible si elle est
   * horizontale), paramétrique. Un curseur t fait glisser M(t) = A + t·u
   * sur la droite : équation vectorielle AM = t·u.
   * Défaut A(1 ; 1), u(2 ; 1) → x − 2y + 1 = 0.
   * Fenêtre fixe [−8 ; 8] × [−8 ; 8], même échelle sur les deux axes.
   * ================================================================ */

  var DEFAUT = { xA: 1, yA: 1, a: 2, b: 1, t: 1 };
  var BORNES_A = { min: -4, max: 4 };
  var BORNES_U = { min: -4, max: 4 };
  var BORNES_T = { min: -3, max: 3, step: 0.25 };
  var X_MIN = -8, X_MAX = 8, Y_MIN = -8, Y_MAX = 8;
  var LARGEUR = 420, HAUTEUR = 420, MARGE = 24;
  var NS = "http://www.w3.org/2000/svg";

  function moins(s) { return String(s).replace(/-/g, "−"); }
  function pgcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a; }

  /** Fraction réduite {n, d} avec d > 0. */
  function fr(n, d) {
    if (d < 0) { n = -n; d = -d; }
    var g = pgcd(n, d) || 1;
    return { n: n / g, d: d / g };
  }
  function frSub(p, q) { return fr(p.n * q.d - q.n * p.d, p.d * q.d); }
  function frMul(p, q) { return fr(p.n * q.n, p.d * q.d); }

  /** HTML d'une fraction positive (|n|/d) : entier ou fraction empilée. */
  function frAbsHtml(f) {
    var n = Math.abs(f.n);
    if (f.d === 1) return String(n);
    return '<span class="fr" aria-label="' + n + ' sur ' + f.d + '"><span class="fr-n">' + n + '</span><span class="fr-d">' + f.d + '</span></span>';
  }

  /** Combinaison linéaire propre : termes [{c: fraction, v: "x" | "y" | "t" | ""}].
   * Coefficient 1 omis devant une variable, termes nuls supprimés, « − » au lieu de « + − ». */
  function lin(termes) {
    var h = "", premier = true;
    termes.forEach(function (tm) {
      var c = tm.c;
      if (c.n === 0) return;
      var neg = c.n < 0;
      var corps = (tm.v && Math.abs(c.n) === 1 && c.d === 1) ? "" : frAbsHtml(c);
      corps += tm.v ? '<i>' + tm.v + '</i>' : "";
      if (premier) h += (neg ? "−" : "") + corps;
      else h += (neg ? " − " : " + ") + corps;
      premier = false;
    });
    return premier ? "0" : h;
  }
  function ent(n) { return fr(n, 1); }

  function nbDec(v) {
    var r = Math.round(v * 100) / 100;
    if (Object.is(r, -0)) r = 0;
    return moins(String(r).replace(".", ","));
  }

  function svgEl(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  /** Petite flèche de vecteur tracée au-dessus d'un <text> SVG déjà inséré
   * (le caractère combinant U+20D7 s'affiche en carré vide dans Chromium). */
  function flecheSur(svg, texte, classe) {
    var bb;
    try { bb = texte.getBBox(); } catch { return; }
    if (!bb || !bb.width) return;
    var y = bb.y + 1.2, x1 = bb.x + 0.5, x2 = bb.x + bb.width + 1.5;
    svg.appendChild(svgEl("line", { x1: x1.toFixed(2), x2: (x2 - 3).toFixed(2), y1: y.toFixed(2), y2: y.toFixed(2), class: "vf " + classe }));
    svg.appendChild(svgEl("path", { d: "M" + x2.toFixed(2) + " " + y.toFixed(2) + " L" + (x2 - 5).toFixed(2) + " " + (y - 2.6).toFixed(2) + " L" + (x2 - 5).toFixed(2) + " " + (y + 2.6).toFixed(2) + " Z", class: "vf " + classe }));
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}' +
    '*{box-sizing:border-box;}' +
    '.consigne{margin:0 0 10px;font-size:0.9rem;color:var(--ink-soft,#6b6055);text-align:center;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:440px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);touch-action:none;display:block;}' +
    '.grille{stroke:var(--line,#e2d8c8);stroke-width:0.6;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}' +
    '.graduation{fill:var(--ink-soft,#6b6055);font-size:10px;font-family:var(--sans,sans-serif);}' +
    '.fl-axe{fill:var(--ink-soft,#6b6055);}' +
    '.fl-accent{fill:var(--accent,#a8471f);}' +
    '.fl-good{fill:var(--good,#2f7a4f);}' +
    '.droite{stroke:var(--ink,#241f1a);stroke-width:1.6;}' +
    '.vec-accent{stroke:var(--accent,#a8471f);stroke-width:2.4;}' +
    '.vec-good{stroke:var(--good,#2f7a4f);stroke-width:2;stroke-dasharray:5 3;}' +
    '.point-ink{fill:var(--ink,#241f1a);}' +
    '.point-accent{fill:var(--accent,#a8471f);}' +
    '.point-good{fill:var(--good,#2f7a4f);}' +
    '.poignee{fill:transparent;cursor:grab;}' +
    '.poignee-anneau{fill:none;stroke:var(--accent,#a8471f);stroke-width:1.4;stroke-dasharray:3 3;}' +
    '.etiquette{font-size:14px;font-weight:700;font-family:var(--sans,sans-serif);paint-order:stroke;stroke:var(--surface-2,#faf6f0);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.et-ink{fill:var(--ink,#241f1a);}' +
    '.et-accent{fill:var(--accent-ink,#7a3212);}' +
    '.et-good{fill:var(--good,#2f7a4f);}' +
    '.vf{stroke-width:1.5;}' +
    '.vf-accent{stroke:var(--accent-ink,#7a3212);fill:var(--accent-ink,#7a3212);}' +
    '.vf-good{stroke:var(--good,#2f7a4f);fill:var(--good,#2f7a4f);}' +
    '.vec{position:relative;display:inline-block;padding-top:0.2em;line-height:1.1;font-style:italic;}' +
    '.vec::before{content:"";position:absolute;left:0.04em;right:0.12em;top:0.04em;border-top:1.5px solid currentColor;}' +
    '.vec::after{content:"";position:absolute;right:-0.06em;top:calc(0.04em + 0.75px - 0.21em);border-top:0.21em solid transparent;border-bottom:0.21em solid transparent;border-left:0.34em solid currentColor;}' +
    '.fr{display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;font-size:0.82em;line-height:1.05;margin:0 0.08em;}' +
    '.fr-n{border-bottom:1.2px solid currentColor;padding:0 0.15em;}' +
    '.fr-d{padding:0 0.15em;}' +
    '.formes{display:grid;grid-template-columns:1fr;gap:6px;margin:0 0 12px;}' +
    '.forme{padding:8px 12px;border-radius:var(--radius,3px);background:var(--surface-2,#faf6f0);border-left:3px solid var(--line,#e2d8c8);font-size:0.95rem;line-height:1.6;overflow-wrap:anywhere;}' +
    '.forme .nom{display:block;font-size:0.78rem;font-weight:700;letter-spacing:0.02em;color:var(--ink-soft,#6b6055);}' +
    '.forme .eq{font-weight:700;font-variant-numeric:tabular-nums;}' +
    '.forme .eq i{font-family:Georgia,"Times New Roman",serif;}' +
    '.forme .note{display:block;font-size:0.82rem;color:var(--ink-soft,#6b6055);}' +
    '.forme.ok{border-left-color:var(--good,#2f7a4f);}' +
    '.forme.impossible{border-left-color:var(--bad,#b23a3a);}' +
    '.forme.impossible .eq{color:var(--bad,#b23a3a);}' +
    '.vectorielle{padding:8px 12px;border-radius:var(--radius,3px);background:var(--good-soft,#e4f1e8);color:var(--ink,#241f1a);font-size:0.92rem;line-height:1.6;margin:0 0 12px;overflow-wrap:anywhere;}' +
    '.message{min-height:1.4em;margin:0 0 8px;font-size:0.86rem;color:var(--bad,#b23a3a);text-align:center;}' +
    '.reglages{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:8px;margin:0 0 10px;}' +
    '.reg{display:flex;align-items:center;justify-content:space-between;gap:6px;padding:4px 8px;border-radius:var(--radius,3px);background:var(--surface-2,#faf6f0);}' +
    '.reg-nom{font-size:0.9rem;min-width:52px;}' +
    '.reg button{min-width:44px;min-height:44px;border-radius:var(--radius,3px);border:1px solid var(--line,#d9cfc2);background:var(--surface,#fff);color:var(--ink,#241f1a);font:inherit;font-size:1.1rem;cursor:pointer;}' +
    '.reg-val{min-width:30px;text-align:center;font-variant-numeric:tabular-nums;font-weight:700;}' +
    '.curseur{display:flex;flex-direction:column;gap:2px;margin:0 0 8px;}' +
    '.curseur label{font-weight:700;color:var(--good,#2f7a4f);font-size:0.9rem;}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input{flex:1 1 auto;min-width:0;min-height:44px;accent-color:var(--good,#2f7a4f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:700;min-width:52px;text-align:right;}' +
    '.btn-reset{display:block;min-height:44px;margin:4px auto 0;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;}' +
    'button:focus-visible,input:focus-visible{outline:2px solid var(--accent,#a8471f);outline-offset:2px;}' +
    '</style>' +
    '<p class="consigne">Fais glisser le point A ou l\'extrémité du vecteur <span class="vec">u</span> (ou utilise les boutons).</p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" role="img" aria-label="Repère : la droite passant par A, de vecteur directeur u"></svg></div>' +
    '<p class="message" id="message" aria-live="polite"></p>' +
    '<div class="formes" id="formes" aria-live="polite"></div>' +
    '<div class="vectorielle" id="vectorielle"></div>' +
    '<div class="curseur"><label for="t">Paramètre t (le point M glisse sur la droite)</label><div class="curseur-row">' +
    '<input type="range" id="t" min="' + BORNES_T.min + '" max="' + BORNES_T.max + '" step="' + BORNES_T.step + '" value="' + DEFAUT.t + '">' +
    '<span class="curseur-valeur" id="t-valeur"></span></div></div>' +
    '<div class="reglages" id="reglages"></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>';

  class DroiteFormesWidget extends HTMLElement {
    constructor() {
      super();
      var sh = this.attachShadow({ mode: "open" });
      sh.appendChild(TEMPLATE.content.cloneNode(true));
      this._sh = sh;
      this._e = Object.assign({}, DEFAUT);
      this._svg = sh.getElementById("svg");
      this._formes = sh.getElementById("formes");
      this._vect = sh.getElementById("vectorielle");
      this._message = sh.getElementById("message");
      this._reglages = sh.getElementById("reglages");
      this._t = sh.getElementById("t");
    }

    connectedCallback() {
      var self = this;
      this._construireReglages();
      this._onInput = function () { self._e.t = parseFloat(self._t.value); self._message.textContent = ""; self._rendre(); };
      this._onClic = function (e) {
        var b = e.target.closest("button[data-cle]");
        if (b) { self._modifier(b.getAttribute("data-cle"), parseInt(b.getAttribute("data-pas"), 10)); return; }
        if (e.target.closest("#reset")) {
          self._e = Object.assign({}, DEFAUT);
          self._t.value = String(DEFAUT.t);
          self._message.textContent = "";
          self._rendre();
        }
      };
      this._onDown = function (e) {
        var p = e.target.closest("[data-poignee]");
        if (!p) return;
        self._glisse = p.getAttribute("data-poignee");
        try { self._svg.setPointerCapture(e.pointerId); } catch { /* ignoré */ }
        e.preventDefault();
      };
      this._onMove = function (e) {
        if (!self._glisse) return;
        var pt = self._versMath(e.clientX, e.clientY);
        var x = Math.round(pt[0]), y = Math.round(pt[1]);
        if (self._glisse === "A") {
          self._essayer({ xA: x, yA: y });
        } else {
          self._essayer({ a: x - self._e.xA, b: y - self._e.yA });
        }
      };
      this._onUp = function () { self._glisse = null; };
      this._t.addEventListener("input", this._onInput);
      this._sh.addEventListener("click", this._onClic);
      this._svg.addEventListener("pointerdown", this._onDown);
      this._svg.addEventListener("pointermove", this._onMove);
      this._svg.addEventListener("pointerup", this._onUp);
      this._svg.addEventListener("pointercancel", this._onUp);
      this._rendre();
    }

    disconnectedCallback() {
      this._t.removeEventListener("input", this._onInput);
      this._sh.removeEventListener("click", this._onClic);
      this._svg.removeEventListener("pointerdown", this._onDown);
      this._svg.removeEventListener("pointermove", this._onMove);
      this._svg.removeEventListener("pointerup", this._onUp);
      this._svg.removeEventListener("pointercancel", this._onUp);
    }

    _construireReglages() {
      var lignes = [
        ["xA", 'A : abscisse'], ["yA", 'A : ordonnée'],
        ["a", '<span class="vec">u</span> : 1re comp.'], ["b", '<span class="vec">u</span> : 2e comp.'],
      ];
      this._reglages.innerHTML = lignes.map(function (l) {
        return '<div class="reg"><span class="reg-nom">' + l[1] + '</span>' +
          '<button type="button" data-cle="' + l[0] + '" data-pas="-1" aria-label="Diminuer">−</button>' +
          '<span class="reg-val" id="v-' + l[0] + '"></span>' +
          '<button type="button" data-cle="' + l[0] + '" data-pas="1" aria-label="Augmenter">+</button></div>';
      }).join("");
    }

    _modifier(cle, pas) {
      var ch = {};
      ch[cle] = this._e[cle] + pas;
      this._essayer(ch);
    }

    /** Applique un changement s'il reste valide (bornes, u non nul) ; sinon explique le refus. */
    _essayer(ch) {
      var n = Object.assign({}, this._e, ch);
      if (n.xA < BORNES_A.min || n.xA > BORNES_A.max || n.yA < BORNES_A.min || n.yA > BORNES_A.max) {
        this._message.textContent = "A reste entre −4 et 4 sur chaque axe.";
        return;
      }
      if (n.a < BORNES_U.min || n.a > BORNES_U.max || n.b < BORNES_U.min || n.b > BORNES_U.max) {
        this._message.textContent = "Les composantes de u restent entre −4 et 4.";
        return;
      }
      if (n.a === 0 && n.b === 0) {
        this._message.textContent = "Un vecteur directeur ne peut pas être nul : il ne donnerait aucune direction.";
        return;
      }
      var change = n.xA !== this._e.xA || n.yA !== this._e.yA || n.a !== this._e.a || n.b !== this._e.b;
      this._e = n;
      if (change) this._message.textContent = "";
      this._rendre();
    }

    _toPx(x, y) {
      return [
        MARGE + (x - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - 2 * MARGE),
        HAUTEUR - MARGE - (y - Y_MIN) / (Y_MAX - Y_MIN) * (HAUTEUR - 2 * MARGE),
      ];
    }

    _versMath(cx, cy) {
      var r = this._svg.getBoundingClientRect();
      var sx = (cx - r.left) / r.width * LARGEUR, sy = (cy - r.top) / r.height * HAUTEUR;
      return [
        X_MIN + (sx - MARGE) / (LARGEUR - 2 * MARGE) * (X_MAX - X_MIN),
        Y_MIN + (HAUTEUR - MARGE - sy) / (HAUTEUR - 2 * MARGE) * (Y_MAX - Y_MIN),
      ];
    }

    _fond() {
      var svg = this._svg;
      svg.innerHTML = "";
      var defs = svgEl("defs", {});
      ["fl-axe", "fl-accent", "fl-good"].forEach(function (id) {
        var mk = svgEl("marker", { id: id, markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto", markerUnits: "userSpaceOnUse" });
        mk.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: id }));
        defs.appendChild(mk);
      });
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
      [-6, -4, -2, 2, 4, 6].forEach(function (v) {
        var p = this._toPx(v, 0), q = this._toPx(0, v);
        var tx = svgEl("text", { x: p[0].toFixed(1), y: (o[1] + 13).toFixed(1), "text-anchor": "middle", class: "graduation" });
        tx.textContent = moins(v);
        svg.appendChild(tx);
        var ty = svgEl("text", { x: (o[0] - 5).toFixed(1), y: (q[1] + 4).toFixed(1), "text-anchor": "end", class: "graduation" });
        ty.textContent = moins(v);
        svg.appendChild(ty);
      }, this);
      var t0 = svgEl("text", { x: (o[0] - 5).toFixed(1), y: (o[1] + 13).toFixed(1), "text-anchor": "end", class: "graduation" });
      t0.textContent = "0";
      svg.appendChild(t0);
    }

    _ligne(p, q, classe, fleche, clip) {
      var a = this._toPx(p[0], p[1]), b = this._toPx(q[0], q[1]);
      var attrs = { x1: a[0].toFixed(2), y1: a[1].toFixed(2), x2: b[0].toFixed(2), y2: b[1].toFixed(2), class: classe };
      if (fleche) attrs["marker-end"] = "url(#" + fleche + ")";
      if (clip) attrs["clip-path"] = "url(#cadre)";
      this._svg.appendChild(svgEl("line", attrs));
    }

    _dansCadre(x, y) { return x >= X_MIN && x <= X_MAX && y >= Y_MIN && y <= Y_MAX; }

    /** Étiquette près d'un point, décalée du côté opposé au centre du cadre pour rester lisible. */
    _etiquette(x, y, texte, classe, dx, dy) {
      var p = this._toPx(x, y);
      var droite = dx !== undefined ? dx >= 0 : p[0] < LARGEUR - 80;
      var t = svgEl("text", {
        x: (p[0] + (dx !== undefined ? dx : (droite ? 9 : -9))).toFixed(2),
        y: (p[1] + (dy !== undefined ? dy : (p[1] < 40 ? 18 : -9))).toFixed(2),
        "text-anchor": droite ? "start" : "end", class: "etiquette " + classe,
      });
      t.textContent = texte;
      this._svg.appendChild(t);
      return t;
    }

    _rendre() {
      var e = this._e, sh = this._sh;
      ["xA", "yA", "a", "b"].forEach(function (c) { sh.getElementById("v-" + c).textContent = moins(e[c]); });
      sh.getElementById("t-valeur").textContent = "t = " + nbDec(e.t);
      this._fond();

      var xA = e.xA, yA = e.yA, a = e.a, b = e.b, t = e.t;
      // droite entière, coupée au cadre
      var L = 40 / Math.max(Math.abs(a), Math.abs(b));
      this._ligne([xA - L * a, yA - L * b], [xA + L * a, yA + L * b], "droite", null, true);
      // vecteur AM = t·u (vert, pointillé)
      var xM = xA + t * a, yM = yA + t * b;
      var mDedans = this._dansCadre(xM, yM);
      if (t !== 0 && mDedans) this._ligne([xA, yA], [xM, yM], "vec-good", "fl-good", false);
      // vecteur u depuis A
      this._ligne([xA, yA], [xA + a, yA + b], "vec-accent", "fl-accent", false);
      // étiquette u, le long du vecteur, du côté opposé à M
      var pA = this._toPx(xA, yA), pU = this._toPx(xA + a, yA + b);
      var ddx = pU[0] - pA[0], ddy = pU[1] - pA[1], LL = Math.hypot(ddx, ddy) || 1;
      var nx = ddy / LL, ny = -ddx / LL;
      if (ny > 0) { nx = -nx; ny = -ny; }
      var tu = svgEl("text", { x: (pA[0] + 0.5 * ddx + nx * 15).toFixed(1), y: (pA[1] + 0.5 * ddy + ny * 15 + 5).toFixed(1), "text-anchor": "middle", class: "etiquette et-accent" });
      tu.textContent = "u";
      this._svg.appendChild(tu);
      flecheSur(this._svg, tu, "vf-accent");
      // M
      if (mDedans) {
        var pm = this._toPx(xM, yM);
        this._svg.appendChild(svgEl("circle", { cx: pm[0].toFixed(2), cy: pm[1].toFixed(2), r: 5, class: "point-good" }));
        this._etiquette(xM, yM, "M", "et-good", -nx * 14 - 4, -ny * 14 + 5);
      }
      // A et poignées
      this._svg.appendChild(svgEl("circle", { cx: pA[0].toFixed(2), cy: pA[1].toFixed(2), r: 5.5, class: "point-ink" }));
      this._etiquette(xA, yA, "A", "et-ink", -nx * 14 - 4, -ny * 14 + 5);
      this._svg.appendChild(svgEl("circle", { cx: pU[0].toFixed(2), cy: pU[1].toFixed(2), r: 9, class: "poignee-anneau" }));
      this._svg.appendChild(svgEl("circle", { cx: pA[0].toFixed(2), cy: pA[1].toFixed(2), r: 20, class: "poignee", "data-poignee": "A" }));
      this._svg.appendChild(svgEl("circle", { cx: pU[0].toFixed(2), cy: pU[1].toFixed(2), r: 20, class: "poignee", "data-poignee": "U" }));
      // nom de la droite près du bord
      var dirx = a / Math.hypot(a, b), diry = b / Math.hypot(a, b);
      var sD = 9;
      while (sD > 1 && !this._dansCadre(xA + sD * dirx, yA + sD * diry)) sD -= 0.5;
      var xd = xA + (sD - 0.6) * dirx, yd = yA + (sD - 0.6) * diry;
      this._etiquette(xd, yd, "d", "et-ink", nx * 14 - 4, ny * 14 + 5);

      this._ecrireFormes(xA, yA, a, b);
      this._ecrireVectorielle(xA, yA, a, b, t, xM, yM, mDedans);
    }

    _ecrireFormes(xA, yA, a, b) {
      // implicite : n(−β ; α) puis −β(x − xA) + α(y − yA) = 0, simplifiée
      var na = -b, nb = a, nc = -(na * xA + nb * yA);
      var g = pgcd(pgcd(na, nb), nc) || 1;
      var A = na / g, B = nb / g, C = nc / g;
      if (A < 0 || (A === 0 && B < 0)) { A = -A; B = -B; C = -C; }
      var implicite = lin([{ c: ent(A), v: "x" }, { c: ent(B), v: "y" }, { c: ent(C), v: "" }]) + " = 0";
      var normale = 'vecteur normal (−β ; α) = (' + moins(na) + ' ; ' + moins(nb) + ')';
      var simplifiee = (g !== 1 || A !== na) ? ' — équation simplifiée' : '';
      var regle = 'Et dans l\'autre sens : un vecteur directeur de ' + implicite.replace(" = 0", "") + ' = 0 est (−b ; a) = (' + moins(-B) + ' ; ' + moins(A) + ').';

      var h = '<div class="forme ok"><span class="nom">Implicite — toujours possible</span><span class="eq">' + implicite + '</span>' +
        '<span class="note">' + normale + simplifiee + '. ' + regle + '</span></div>';

      if (a === 0) {
        h += '<div class="forme impossible"><span class="nom">Explicite en y</span><span class="eq">impossible : droite verticale</span>' +
          '<span class="note">Le vecteur directeur (0 ; ' + moins(b) + ') est vertical : la droite a pour équation x = ' + moins(xA) + ', elle n\'a pas de pente.</span></div>';
      } else {
        var m = fr(b, a), p = frSub(ent(yA), frMul(m, ent(xA)));
        h += '<div class="forme ok"><span class="nom">Explicite en y — pente m = β / α</span><span class="eq"><i>y</i> = ' +
          lin([{ c: m, v: "x" }, { c: p, v: "" }]) + '</span></div>';
      }
      if (b === 0) {
        h += '<div class="forme impossible"><span class="nom">Explicite en x</span><span class="eq">impossible : droite horizontale</span>' +
          '<span class="note">Le vecteur directeur (' + moins(a) + ' ; 0) est horizontal : la droite a pour équation y = ' + moins(yA) + '.</span></div>';
      } else {
        var n = fr(a, b), q = frSub(ent(xA), frMul(n, ent(yA)));
        h += '<div class="forme ok"><span class="nom">Explicite en x</span><span class="eq"><i>x</i> = ' +
          lin([{ c: n, v: "y" }, { c: q, v: "" }]) + '</span></div>';
      }
      h += '<div class="forme ok"><span class="nom">Paramétrique — toujours possible</span><span class="eq"><i>x</i> = ' +
        lin([{ c: ent(xA), v: "" }, { c: ent(a), v: "t" }]) + ' et <i>y</i> = ' +
        lin([{ c: ent(yA), v: "" }, { c: ent(b), v: "t" }]) + '</span></div>';
      this._formes.innerHTML = h;
    }

    _ecrireVectorielle(xA, yA, a, b, t, xM, yM, mDedans) {
      var ts = nbDec(t);
      var tsPar = t < 0 ? "(" + ts + ")" : ts;
      this._vect.innerHTML =
        'Équation vectorielle : <span class="vec">AM</span> = t·<span class="vec">u</span>. Avec t = ' + ts + ' : ' +
        '<span class="vec">AM</span> = ' + tsPar + ' · (' + moins(a) + ' ; ' + moins(b) + ') = (' + nbDec(t * a) + ' ; ' + nbDec(t * b) + '), ' +
        'donc <b>M(' + nbDec(xM) + ' ; ' + nbDec(yM) + ')</b>.' +
        (t === 0 ? ' Pour t = 0, M est en A.' : '') +
        (mDedans ? '' : ' (M est hors du cadre : la droite continue au-delà.)');
    }
  }

  if (!customElements.get("droite-formes-widget")) {
    customElements.define("droite-formes-widget", DroiteFormesWidget);
  }
})();
