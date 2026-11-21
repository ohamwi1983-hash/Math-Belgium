(function () {
  "use strict";

  /* ================================================================
   * <equilibre-forces-widget> — atelier (4e, ch. 6, § 17) :
   * F₁ et F₂ partent du point O ; leurs extrémités sont déplaçables
   * (composantes entières, un carreau = 10 N, chacune entre −8 et 8).
   * La force d'équilibre F₃ = −(F₁ + F₂) est dessinée depuis O, puis les
   * trois forces sont reprises bout à bout (pointillés) : le triangle des
   * forces se ferme exactement en O. Bouton « Piège : F₃ = F₁ + F₂ » :
   * la résultante (en rouge) au lieu de son opposée — le polygone ne se
   * ferme plus. Affichés : composantes, intensité ‖F₃‖ = √(x² + y²)
   * (exacte puis approchée) et angle avec l'horizontale, tan α = |y| ÷ |x|.
   * Défaut : F₁(0 ; −80), F₂(−50 ; 50) → F₃(50 ; 30).
   * Fenêtre FIXE (−17 à 17 carreaux : F₃ y tient toujours).
   * Web Component (Shadow DOM).
   * ================================================================ */

  var SVGNS = "http://www.w3.org/2000/svg";
  var LIM = 8, FEN = 17;
  var UNITE = 15, MARGE = 12;
  var COTE = 2 * FEN * UNITE + 2 * MARGE;
  var NEWTONS = 10;
  var NOMS = { F1: "F₁", F2: "F₂" };

  function defaut() { return { F1: { x: 0, y: -8 }, F2: { x: -5, y: 5 } }; }
  function moins(s) { return String(s).replace(/-/g, "−"); }
  function fmt(x, d) {
    var f = Math.pow(10, d), r = Math.round(x * f) / f;
    if (Object.is(r, -0)) r = 0;
    return moins(r.toFixed(d).replace(".", ","));
  }
  function racine(n) {
    var k = 1, m = n;
    for (var i = 2; i * i <= m; i++) { while (m % (i * i) === 0) { m /= i * i; k *= i; } }
    return { k: k, m: m };
  }
  function N(c) { return moins(c * NEWTONS); }
  function vec(v) { return "(" + N(v.x) + " ; " + N(v.y) + ")"; }

  function el(tag, attrs, parent) {
    var e = document.createElementNS(SVGNS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#182430);}' +
    '*{box-sizing:border-box;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:10px;}' +
    'svg{width:100%;max-width:500px;height:auto;background:var(--surface-2,#f7f9fb);border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);}' +
    '.grille{stroke:var(--line,#ccd8e0);stroke-width:0.6;}' +
    '.axe{stroke:var(--ink-soft,#51626f);stroke-width:1.2;}' +
    '.fleche-axe{fill:var(--ink-soft,#51626f);}' +
    '.graduation{font-size:14px;fill:var(--ink-soft,#51626f);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.f1{stroke:var(--bad,#b23a3a);stroke-width:3;} .f1-t{fill:var(--bad,#b23a3a);}' +
    '.f2{stroke:var(--good,#2f7a4f);stroke-width:3;} .f2-t{fill:var(--good,#2f7a4f);}' +
    '.f3{stroke:var(--accent,#b65c1f);stroke-width:3.2;} .f3-t{fill:var(--accent,#b65c1f);}' +
    '.f1p{stroke:var(--bad,#b23a3a);stroke-width:2;stroke-dasharray:6 4;opacity:0.75;}' +
    '.f2p{stroke:var(--good,#2f7a4f);stroke-width:2;stroke-dasharray:6 4;opacity:0.75;}' +
    '.f3p{stroke:var(--accent,#b65c1f);stroke-width:2;stroke-dasharray:6 4;opacity:0.75;}' +
    '.f1p-t{fill:var(--bad,#b23a3a);opacity:0.75;} .f2p-t{fill:var(--good,#2f7a4f);opacity:0.75;} .f3p-t{fill:var(--accent,#b65c1f);opacity:0.75;}' +
    '.piege{stroke:var(--plan,#5b4ea3);stroke-width:3;stroke-dasharray:3 4;} .piege-t{fill:var(--plan,#5b4ea3);}' +
    '.trou{fill:none;stroke:var(--plan,#5b4ea3);stroke-width:2;}' +
    '.point{fill:var(--ink,#182430);}' +
    '.poignee{fill:transparent;cursor:grab;touch-action:none;}' +
    '.poignee-active{fill:var(--accent,#b65c1f);fill-opacity:0.14;}' +
    '.etiq{font-size:19px;font-weight:700;paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.e1{fill:var(--bad,#b23a3a);} .e2{fill:var(--good,#2f7a4f);} .e3{fill:var(--accent,#b65c1f);} .ep{fill:var(--plan,#5b4ea3);} .eo{fill:var(--ink,#182430);}' +
    '.lecture{display:flex;flex-direction:column;gap:8px;margin:0 auto 14px;max-width:620px;font-variant-numeric:tabular-nums;text-align:left;}' +
    '.carte{padding:10px 12px;border-radius:var(--radius,3px);background:var(--surface-2,#f7f9fb);border:1px solid var(--line,#ccd8e0);line-height:1.55;font-size:0.95rem;}' +
    '.carte-titre{font-weight:700;font-size:0.82rem;color:var(--ink-soft,#51626f);margin-bottom:4px;}' +
    '.c1{color:var(--bad,#b23a3a);font-weight:700;} .c2{color:var(--good,#2f7a4f);font-weight:700;} .c3{color:var(--accent-ink,#7a3212);font-weight:700;} .cp{color:var(--plan,#5b4ea3);font-weight:700;}' +
    '.controles{display:flex;flex-direction:column;gap:10px;align-items:center;max-width:620px;margin:0 auto;}' +
    '.rangee{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-items:center;}' +
    '.libelle{font-size:0.88rem;color:var(--ink-soft,#51626f);font-weight:600;}' +
    '.btn{min-height:44px;min-width:44px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);background:var(--surface,#fff);color:var(--ink,#182430);font-weight:600;cursor:pointer;font-family:inherit;font-size:0.95rem;}' +
    '.btn[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);border-color:var(--accent,#b65c1f);color:var(--accent-ink,#7a3212);}' +
    '.btn:focus-visible{outline:2px solid var(--accent,#b65c1f);outline-offset:2px;}' +
    '.btn-reset{background:var(--accent-soft,#f6e2d3);border-color:var(--accent-soft-line,#e8c4a4);color:var(--accent-ink,#7a3212);}' +
    '</style>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + COTE + ' ' + COTE + '" role="img" aria-label="Trois forces appliquées au point O et leur triangle des forces, bout à bout"></svg></div>' +
    '<div class="lecture" id="lecture" aria-live="polite"></div>' +
    '<div class="controles">' +
    '<div class="rangee"><span class="libelle">Force à modifier :</span>' +
    '<button class="btn" type="button" data-point="F1" aria-pressed="false">F₁</button>' +
    '<button class="btn" type="button" data-point="F2" aria-pressed="true">F₂</button></div>' +
    '<div class="rangee">' +
    '<button class="btn" type="button" data-dx="-1" data-dy="0" aria-label="Diminuer la composante x de 10 N">←</button>' +
    '<button class="btn" type="button" data-dx="0" data-dy="1" aria-label="Augmenter la composante y de 10 N">↑</button>' +
    '<button class="btn" type="button" data-dx="0" data-dy="-1" aria-label="Diminuer la composante y de 10 N">↓</button>' +
    '<button class="btn" type="button" data-dx="1" data-dy="0" aria-label="Augmenter la composante x de 10 N">→</button></div>' +
    '<div class="rangee"><button class="btn" type="button" id="piege" aria-pressed="false">Piège : F₃ = F₁ + F₂</button>' +
    '<button class="btn btn-reset" id="reset" type="button">Réinitialiser</button></div>' +
    '</div>';

  class EquilibreForcesWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._svg = shadow.getElementById("svg");
      this._lecture = shadow.getElementById("lecture");
      this._etat = defaut();
      this._point = "F2";
      this._piege = false;
      this._glisse = null;
      this._ecouteurs = [];
    }

    connectedCallback() {
      var self = this, sh = this.shadowRoot;
      function ecoute(c, t, f) { c.addEventListener(t, f); self._ecouteurs.push([c, t, f]); }
      Array.prototype.forEach.call(sh.querySelectorAll("[data-point]"), function (b) {
        ecoute(b, "click", function () { self._point = b.getAttribute("data-point"); self._rendre(); });
      });
      Array.prototype.forEach.call(sh.querySelectorAll("[data-dx]"), function (b) {
        ecoute(b, "click", function () {
          var p = self._etat[self._point];
          self._deplacer(self._point, p.x + parseInt(b.getAttribute("data-dx"), 10), p.y + parseInt(b.getAttribute("data-dy"), 10));
        });
      });
      ecoute(sh.getElementById("piege"), "click", function () { self._piege = !self._piege; self._rendre(); });
      ecoute(sh.getElementById("reset"), "click", function () { self._etat = defaut(); self._point = "F2"; self._piege = false; self._rendre(); });
      ecoute(this._svg, "pointerdown", function (e) {
        var c = e.target && e.target.getAttribute && e.target.getAttribute("data-poignee");
        if (!c) return;
        e.preventDefault();
        self._glisse = c; self._point = c;
        try { self._svg.setPointerCapture(e.pointerId); } catch (err) { /* rien */ }
        self._rendre();
      });
      ecoute(this._svg, "pointermove", function (e) {
        if (!self._glisse) return;
        var p = self._versMonde(e.clientX, e.clientY);
        if (p) self._deplacer(self._glisse, Math.round(p.x), Math.round(p.y));
      });
      function fin(e) {
        if (!self._glisse) return;
        self._glisse = null;
        try { self._svg.releasePointerCapture(e.pointerId); } catch (err) { /* rien */ }
      }
      ecoute(this._svg, "pointerup", fin);
      ecoute(this._svg, "pointercancel", fin);
      this._rendre();
    }

    disconnectedCallback() {
      this._ecouteurs.forEach(function (t) { t[0].removeEventListener(t[1], t[2]); });
      this._ecouteurs = [];
    }

    _versMonde(cx, cy) {
      var ctm = this._svg.getScreenCTM();
      if (!ctm) return null;
      var pt = this._svg.createSVGPoint();
      pt.x = cx; pt.y = cy;
      var q = pt.matrixTransform(ctm.inverse());
      return { x: -FEN + (q.x - MARGE) / UNITE, y: FEN - (q.y - MARGE) / UNITE };
    }

    _px(x, y) { return [MARGE + (x + FEN) * UNITE, MARGE + (FEN - y) * UNITE]; }

    _deplacer(nom, x, y) {
      x = Math.max(-LIM, Math.min(LIM, x));
      y = Math.max(-LIM, Math.min(LIM, y));
      var p = this._etat[nom];
      if (p.x === x && p.y === y) return;
      p.x = x; p.y = y;
      this._rendre();
    }

    _fleche(svg, P, Q, classeTrait, classeTete) {
      var a = this._px(P.x, P.y), b = this._px(Q.x, Q.y);
      var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
      if (L < 1) return;
      var t = Math.min(12, L / 1.4), w = t / 2.2;
      var ux = dx / L, uy = dy / L;
      el("line", { x1: a[0], y1: a[1], x2: b[0] - ux * t * 0.8, y2: b[1] - uy * t * 0.8, class: classeTrait }, svg);
      el("path", { d: "M" + b[0] + "," + b[1] + " L" + (b[0] - ux * t - uy * w) + "," + (b[1] - uy * t + ux * w) + " L" + (b[0] - ux * t + uy * w) + "," + (b[1] - uy * t - ux * w) + " Z", class: classeTete }, svg);
    }

    _etiquette(svg, P, Q, texte, classe, cote) {
      var a = this._px(P.x, P.y), b = this._px(Q.x, Q.y);
      var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
      if (L < 1) return;
      var nx = -dy / L * 17 * cote, ny = dx / L * 17 * cote;
      var x = Math.max(14, Math.min(COTE - 14, (a[0] + b[0]) / 2 + nx)), y = Math.max(16, Math.min(COTE - 6, (a[1] + b[1]) / 2 + ny + 5));
      var t = el("text", { x: x.toFixed(1), y: y.toFixed(1), class: "etiq " + classe, "text-anchor": "middle" }, svg);
      t.textContent = texte;
    }

    _rendre() {
      var sh = this.shadowRoot, self = this, E = this._etat;
      Array.prototype.forEach.call(sh.querySelectorAll("[data-point]"), function (b) {
        b.setAttribute("aria-pressed", b.getAttribute("data-point") === self._point ? "true" : "false");
      });
      sh.getElementById("piege").setAttribute("aria-pressed", this._piege ? "true" : "false");
      var O = { x: 0, y: 0 };
      var S = { x: E.F1.x + E.F2.x, y: E.F1.y + E.F2.y };
      var F3 = { x: -S.x, y: -S.y };
      var svg = this._svg;
      svg.innerHTML = "";
      var defs = el("defs", {}, svg);
      var mk = el("marker", { id: "fl", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" }, defs);
      el("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche-axe" }, mk);
      for (var g = -FEN; g <= FEN; g++) {
        var px = this._px(g, 0)[0], py = this._px(0, g)[1];
        el("line", { x1: px, y1: MARGE, x2: px, y2: COTE - MARGE, class: "grille" }, svg);
        el("line", { x1: MARGE, y1: py, x2: COTE - MARGE, y2: py, class: "grille" }, svg);
      }
      var o = this._px(0, 0);
      el("line", { x1: MARGE, y1: o[1], x2: COTE - MARGE, y2: o[1], class: "axe", "marker-end": "url(#fl)" }, svg);
      el("line", { x1: o[0], y1: COTE - MARGE, x2: o[0], y2: MARGE, class: "axe", "marker-end": "url(#fl)" }, svg);
      var gx = el("text", { x: this._px(1, 0)[0] - 8, y: o[1] + 15, class: "graduation" }, svg); gx.textContent = "10 N";
      var tx = el("text", { x: COTE - MARGE - 4, y: o[1] - 7, class: "graduation", "text-anchor": "end" }, svg); tx.textContent = "x";
      var ty = el("text", { x: o[0] + 7, y: MARGE + 12, class: "graduation" }, svg); ty.textContent = "y";

      // bout à bout : F₁ depuis O, F₂ depuis l'extrémité de F₁, F₃ depuis l'extrémité de F₁ + F₂ → retour en O
      this._fleche(svg, E.F1, S, "f2p", "f2p-t");
      if (!this._piege) this._fleche(svg, S, O, "f3p", "f3p-t");
      else {
        var fausse = { x: S.x + S.x, y: S.y + S.y };
        this._fleche(svg, S, fausse, "piege", "piege-t");
        var pf = this._px(fausse.x, fausse.y);
        el("circle", { cx: pf[0], cy: pf[1], r: 6, class: "trou" }, svg);
      }
      // forces depuis O
      this._fleche(svg, O, E.F1, "f1", "f1-t");
      this._fleche(svg, O, E.F2, "f2", "f2-t");
      if (!this._piege) this._fleche(svg, O, F3, "f3", "f3-t");
      else this._fleche(svg, O, S, "piege", "piege-t");
      this._etiquette(svg, O, E.F1, "F₁", "e1", 1);
      this._etiquette(svg, O, E.F2, "F₂", "e2", -1);
      if (!this._piege) this._etiquette(svg, O, F3, "F₃", "e3", 1);
      else this._etiquette(svg, O, S, "F₁ + F₂", "ep", 1);
      el("circle", { cx: o[0], cy: o[1], r: 4.5, class: "point" }, svg);
      var eo = el("text", { x: o[0] - 9, y: o[1] + 20, class: "etiq eo", "text-anchor": "end" }, svg); eo.textContent = "O";
      ["F1", "F2"].forEach(function (n) {
        var p = self._px(E[n].x, E[n].y);
        el("circle", { cx: p[0], cy: p[1], r: 20, class: "poignee" + (self._point === n ? " poignee-active" : ""), "data-poignee": n }, svg);
      });

      // ---------- lecture ----------
      var n2 = (F3.x * F3.x + F3.y * F3.y) * NEWTONS * NEWTONS, r = racine(n2);
      var intens = n2 === 0 ? "0" : r.m === 1 ? String(r.k) : (r.k > 1 ? r.k : "") + "√" + r.m + " ≈ " + fmt(Math.sqrt(n2), 1);
      var h = '<div class="carte"><div class="carte-titre">Les forces (en N)</div><span class="c1">F₁' + vec(E.F1) + '</span> · <span class="c2">F₂' + vec(E.F2) + '</span><br>' +
        'Résultante : F₁ + F₂ = ' + vec(S) + '</div>';
      if (!this._piege) {
        h += '<div class="carte"><div class="carte-titre">Équilibre : F₁ + F₂ + F₃ = 0</div><span class="c3">F₃ = −(F₁ + F₂) = ' + vec(F3) + '</span> : on change les deux signes.<br>' +
          'Intensité : ‖F₃‖ = √(' + N(F3.x) + '² + ' + N(F3.y) + '²) = ' + (n2 === 0 ? '0' : '√' + n2 + (r.m === 1 || r.k > 1 ? ' = ' + intens : ' ≈ ' + fmt(Math.sqrt(n2), 1))) + ' N.';
        if (F3.x !== 0 && F3.y !== 0) {
          var alpha = Math.atan(Math.abs(F3.y) / Math.abs(F3.x)) * 180 / Math.PI;
          h += '<br>Direction : tan α = ' + Math.abs(F3.y * NEWTONS) + ' ÷ ' + Math.abs(F3.x * NEWTONS) + ', donc α ≈ ' + fmt(alpha, 1) + '° avec l\'horizontale, ' + (F3.x > 0 ? 'vers la droite' : 'vers la gauche') + ' et ' + (F3.y > 0 ? 'vers le haut.' : 'vers le bas.');
        } else if (n2 > 0) {
          h += '<br>Direction : ' + (F3.x === 0 ? (F3.y > 0 ? 'verticale, vers le haut.' : 'verticale, vers le bas.') : (F3.x > 0 ? 'horizontale, vers la droite.' : 'horizontale, vers la gauche.'));
        } else h += '<br>F₁ et F₂ se compensent déjà : aucune troisième force n\'est nécessaire.';
        h += '</div><div class="carte"><div class="carte-titre">Bout à bout</div>Les trois forces reprises bout à bout (pointillés) forment un triangle fermé : on revient en O, la somme est nulle.</div>';
      } else {
        h += '<div class="carte"><div class="carte-titre">Le piège</div><span class="cp">F₃ = F₁ + F₂ = ' + vec(S) + '</span> : bout à bout, on arrive en ' + vec({ x: 2 * S.x, y: 2 * S.y }) + ' et non en O. ' +
          'La somme vaut 2(F₁ + F₂), pas 0 : la troisième force doit être l\'opposée de la résultante.</div>';
      }
      this._lecture.innerHTML = h;
    }
  }

  if (!customElements.get("equilibre-forces-widget")) {
    customElements.define("equilibre-forces-widget", EquilibreForcesWidget);
  }
})();
