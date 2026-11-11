(function () {
  "use strict";

  /* ================================================================
   * <egalite-parallelogramme-widget> — atelier « Égalité de vecteurs
   * et parallélogramme » (4e, calcul vectoriel, § 1 et § 12). Points
   * A, B, C déplaçables sur un quadrillage (doigt, souris, clavier).
   * Mode « AB = CD » : D = C + AB, quadrilatère ABDC (ordre des lettres
   * A, B, D, C — piège ABCD, croisé, affichable). Mode « quatrième
   * sommet » : D tel que ABCD soit un parallélogramme (AB = DC),
   * D = C − AB calculé composante par composante, vérification par le
   * milieu commun des diagonales. A, B, C alignés : parallélogramme
   * aplati signalé. Défaut A(1 ; 1), B(5 ; 2), C(6 ; 5) → D(2 ; 4) en
   * mode quatrième sommet. Web Component (Shadow DOM), fenêtre fixe.
   * ================================================================ */

  var DEFAUT = { A: [1, 1], B: [5, 2], C: [6, 5], mode: "sommet", piege: false };
  var P_MIN = [0, 0], P_MAX = [10, 8];
  var X_MIN = -1, X_MAX = 12, Y_MIN = -1, Y_MAX = 10;
  var LARGEUR = 480, HAUTEUR = 406, MARGE = 16;
  var NS = "http://www.w3.org/2000/svg";

  function fr(n) {
    var a = Math.round(n * 100) / 100;
    if (Object.is(a, -0)) a = 0;
    return (a < 0 ? "−" : "") + String(Math.abs(a)).replace(".", ",");
  }
  function par(n) { return n < 0 ? "(" + fr(n) + ")" : fr(n); }
  function couple(p) { return "(" + fr(p[0]) + " ; " + fr(p[1]) + ")"; }
  function vec(nom) { return '<span class="vec">' + nom + "</span>"; }
  function el(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  var STYLE =
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}' +
    '*{box-sizing:border-box;}' +
    '.vec{display:inline-block;position:relative;font-family:var(--serif,Georgia,serif);font-style:italic;font-weight:700;padding:0 1px;line-height:1;}' +
    '.vec::before{content:"";position:absolute;left:1px;right:3px;top:-0.32em;border-top:1.5px solid currentColor;}' +
    '.vec::after{content:"";position:absolute;right:0;top:-0.32em;transform:translateY(-50%);border-left:5px solid currentColor;border-top:3.5px solid transparent;border-bottom:3.5px solid transparent;margin-top:0.75px;}' +
    '.choix{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:0 0 10px;}' +
    '.choix button{min-height:44px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--line,#d9cfc2);background:var(--surface,#fff);color:var(--ink,#241f1a);font:inherit;font-size:0.92rem;cursor:pointer;}' +
    '.choix button[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);border-color:var(--accent,#a8471f);color:var(--accent-ink,#7a3212);font-weight:700;}' +
    '.case{display:flex;align-items:center;justify-content:center;gap:8px;min-height:44px;margin:0 0 6px;cursor:pointer;font-size:0.92rem;}' +
    '.case input{width:20px;height:20px;accent-color:var(--bad,#b23a3a);}' +
    '.aide{font-size:0.82rem;color:var(--ink-soft,#6b6055);text-align:center;margin:0 0 8px;}' +
    '.graphe-zone{display:flex;justify-content:center;margin:0 0 10px;}' +
    'svg{width:100%;max-width:480px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);display:block;}' +
    '.grille{stroke:var(--line,#d9cfc2);stroke-width:0.6;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.2;}' +
    '.m-soft{fill:var(--ink-soft,#6b6055);} .m-acc{fill:var(--accent,#a8471f);} .m-bad{fill:var(--bad,#b23a3a);}' +
    '.quad{fill:var(--good,#2f7a4f);fill-opacity:0.12;stroke:var(--good,#2f7a4f);stroke-width:1.6;stroke-dasharray:5 4;}' +
    '.quad-plat{fill:none;stroke:var(--bad,#b23a3a);}' +
    '.piege{fill:var(--bad,#b23a3a);fill-opacity:0.07;stroke:var(--bad,#b23a3a);stroke-width:1.8;stroke-dasharray:3 4;}' +
    '.diag{stroke:var(--ink-soft,#6b6055);stroke-width:1;stroke-dasharray:2 4;}' +
    '.v{stroke:var(--accent,#a8471f);stroke-width:3;}' +
    '.pt{fill:var(--ink,#241f1a);}' +
    '.pt-d{fill:var(--good,#2f7a4f);}' +
    '.pt-i{fill:var(--ink-soft,#6b6055);}' +
    '.poignee{cursor:grab;outline:none;}' +
    '.poignee:focus-visible .anneau{stroke:var(--accent,#a8471f);stroke-width:3;}' +
    '.anneau{fill:var(--surface,#fff);stroke:var(--ink,#241f1a);stroke-width:2.2;}' +
    '.zone{fill:transparent;}' +
    '.lab{font-size:13px;font-weight:700;font-family:var(--sans,sans-serif);fill:var(--ink,#241f1a);paint-order:stroke;stroke:var(--surface-2,#faf6f0);stroke-width:3px;}' +
    '.lab-d{fill:var(--good,#2f7a4f);}' +
    '.lab-i{font-size:11px;fill:var(--ink-soft,#6b6055);}' +
    '.lecture{display:flex;flex-direction:column;gap:6px;font-variant-numeric:tabular-nums;}' +
    '.ligne{padding:9px 12px;border-radius:var(--radius,3px);background:var(--surface-2,#faf6f0);font-size:0.95rem;line-height:1.7;}' +
    '.ligne-r{border-left:4px solid var(--good,#2f7a4f);font-weight:600;}' +
    '.ligne-alerte{border-left:4px solid var(--bad,#b23a3a);color:var(--bad,#b23a3a);font-weight:600;}' +
    '.c-acc{color:var(--accent-ink,#7a3212);} .c-good{color:var(--good,#2f7a4f);}' +
    '.btn-reset{display:block;margin:10px auto 0;min-height:44px;padding:8px 16px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font:inherit;font-weight:600;cursor:pointer;}';

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    "<style>" + STYLE + "</style>" +
    '<div class="choix" role="group" aria-label="Mode">' +
    '<button type="button" data-mode="egalite"><span class="vec">AB</span> = <span class="vec">CD</span></button>' +
    '<button type="button" data-mode="sommet">Quatrième sommet de ABCD</button>' +
    "</div>" +
    '<label class="case" id="case-piege"><input type="checkbox" id="piege"> Montrer le piège : relier A, B, C, D dans cet ordre</label>' +
    '<p class="aide">Fais glisser A, B et C (ou sélectionne un point et utilise les flèches du clavier).</p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + " " + HAUTEUR + '" role="img" aria-label="Quatre points A, B, C, D et le parallélogramme qu\'ils forment"></svg></div>' +
    '<div class="lecture" id="lecture" aria-live="polite"></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>';

  function copie(e) { return { A: e.A.slice(), B: e.B.slice(), C: e.C.slice(), mode: e.mode, piege: e.piege }; }

  class EgaliteParallelogrammeWidget extends HTMLElement {
    constructor() {
      super();
      var sh = this.attachShadow({ mode: "open" });
      sh.appendChild(TEMPLATE.content.cloneNode(true));
      this._sh = sh;
      this._e = copie(DEFAUT);
      this._svg = sh.getElementById("svg");
      this._drag = null;
      this._message = "";
    }

    connectedCallback() {
      var self = this;
      this._sh.querySelectorAll("[data-mode]").forEach(function (b) {
        b.addEventListener("click", function () { self._e.mode = b.getAttribute("data-mode"); self._message = ""; self._rendre(); });
      });
      var cb = this._sh.getElementById("piege");
      cb.addEventListener("change", function () { self._e.piege = cb.checked; self._rendre(); });
      this._sh.getElementById("reset").addEventListener("click", function () { self._e = copie(DEFAUT); self._message = ""; self._rendre(); });
      this._svg.addEventListener("pointermove", function (e) { self._deplacer(e); });
      var fin = function () { self._drag = null; };
      this._svg.addEventListener("pointerup", fin);
      this._svg.addEventListener("pointercancel", fin);
      this._rendre();
    }

    _D(e) {
      var ab = [e.B[0] - e.A[0], e.B[1] - e.A[1]];
      return e.mode === "egalite" ? [e.C[0] + ab[0], e.C[1] + ab[1]] : [e.C[0] - ab[0], e.C[1] - ab[1]];
    }

    _px(x, y) {
      return [MARGE + (x - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - 2 * MARGE),
        HAUTEUR - MARGE - (y - Y_MIN) / (Y_MAX - Y_MIN) * (HAUTEUR - 2 * MARGE)];
    }

    _versMath(ev) {
      var pt = this._svg.createSVGPoint();
      pt.x = ev.clientX; pt.y = ev.clientY;
      var p = pt.matrixTransform(this._svg.getScreenCTM().inverse());
      return [X_MIN + (p.x - MARGE) / (LARGEUR - 2 * MARGE) * (X_MAX - X_MIN),
        Y_MIN + (HAUTEUR - MARGE - p.y) / (HAUTEUR - 2 * MARGE) * (Y_MAX - Y_MIN)];
    }

    _deplacer(ev) {
      if (!this._drag) return;
      var p = this._versMath(ev);
      this._poser(this._drag, [Math.round(p[0]), Math.round(p[1])]);
    }

    // Déplace un point si la nouvelle position est valide (dans le cadre, distincte des autres, D visible).
    _poser(nom, q) {
      var x = Math.max(P_MIN[0], Math.min(P_MAX[0], q[0])), y = Math.max(P_MIN[1], Math.min(P_MAX[1], q[1]));
      var e = this._e;
      if (e[nom][0] === x && e[nom][1] === y) return;
      var essai = copie(e); essai[nom] = [x, y];
      var memes = function (a, b) { return a[0] === b[0] && a[1] === b[1]; };
      if (memes(essai.A, essai.B) || memes(essai.A, essai.C) || memes(essai.B, essai.C)) {
        this._message = "Deux points ne peuvent pas être confondus.";
        this._rendreLecture(); return;
      }
      var D = this._D(essai);
      if (D[0] < X_MIN || D[0] > X_MAX || D[1] < Y_MIN || D[1] > Y_MAX) {
        this._message = "Ce déplacement enverrait D hors du cadre : choisis une autre position.";
        this._rendreLecture(); return;
      }
      this._message = "";
      this._e = essai;
      this._rendre();
    }

    _ligne(a, b, attrs) {
      var pa = this._px(a[0], a[1]), pb = this._px(b[0], b[1]);
      if (attrs.class === "v") {
        // la pointe ne doit pas disparaître sous le point d'arrivée
        var dx = pb[0] - pa[0], dy = pb[1] - pa[1], n = Math.hypot(dx, dy);
        if (n > 12) pb = [pb[0] - dx / n * 8, pb[1] - dy / n * 8];
      }
      attrs.x1 = pa[0].toFixed(1); attrs.y1 = pa[1].toFixed(1); attrs.x2 = pb[0].toFixed(1); attrs.y2 = pb[1].toFixed(1);
      this._svg.appendChild(el("line", attrs));
    }

    _poly(pts, classe) {
      var self = this;
      this._svg.appendChild(el("polygon", { points: pts.map(function (p) { return self._px(p[0], p[1]).map(function (n) { return n.toFixed(1); }).join(","); }).join(" "), class: classe }));
    }

    _etiquette(p, texte, centre, classe) {
      // étiquette poussée vers l'extérieur de la figure (à l'opposé du centre)
      var pp = this._px(p[0], p[1]), pc = this._px(centre[0], centre[1]);
      var dx = pp[0] - pc[0], dy = pp[1] - pc[1], n = Math.hypot(dx, dy) || 1;
      var x = pp[0] + dx / n * 20, y = pp[1] + dy / n * 18 + 4;
      var ancre = dx / n > 0.35 ? "start" : (dx / n < -0.35 ? "end" : "middle");
      x = Math.max(4, Math.min(LARGEUR - 4, x));
      var t = el("text", { x: x.toFixed(1), y: Math.max(14, Math.min(HAUTEUR - 4, y)).toFixed(1), class: "lab " + (classe || ""), "text-anchor": ancre });
      t.textContent = texte;
      this._svg.appendChild(t);
    }

    _poignee(nom) {
      var self = this, p = this._px(this._e[nom][0], this._e[nom][1]);
      var g = el("g", { class: "poignee", tabindex: "0", role: "slider", "aria-label": "Point " + nom + " — flèches du clavier pour déplacer", style: "touch-action:none" });
      g.appendChild(el("circle", { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: 22, class: "zone" }));
      g.appendChild(el("circle", { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: 7, class: "anneau" }));
      g.addEventListener("pointerdown", function (ev) {
        ev.preventDefault(); self._drag = nom;
        try { self._svg.setPointerCapture(ev.pointerId); } catch (err) { /* rien */ }
      });
      g.addEventListener("keydown", function (ev) {
        var d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[ev.key];
        if (!d) return;
        ev.preventDefault();
        self._focus = nom;
        self._poser(nom, [self._e[nom][0] + d[0], self._e[nom][1] + d[1]]);
      });
      this._svg.appendChild(g);
      return g;
    }

    _rendre() {
      var e = this._e, svg = this._svg, sh = this._sh;
      sh.querySelectorAll("[data-mode]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-mode") === e.mode)); });
      sh.getElementById("piege").checked = e.piege;
      sh.getElementById("case-piege").hidden = e.mode !== "egalite";

      var A = e.A, B = e.B, C = e.C, D = this._D(e);
      var ab = [B[0] - A[0], B[1] - A[1]], ac = [C[0] - A[0], C[1] - A[1]];
      var aligne = ab[0] * ac[1] - ab[1] * ac[0] === 0;
      // ordre de parcours du parallélogramme
      var tour = e.mode === "egalite" ? [A, B, D, C] : [A, B, C, D];
      var centre = [(tour[0][0] + tour[2][0]) / 2, (tour[0][1] + tour[2][1]) / 2];

      svg.innerHTML = "";
      var defs = el("defs", {});
      [["p-soft", "m-soft"], ["p-acc", "m-acc"]].forEach(function (m) {
        var mk = el("marker", { id: m[0], markerWidth: "12", markerHeight: "12", refX: "8", refY: "6", orient: "auto", markerUnits: "userSpaceOnUse" });
        mk.appendChild(el("path", { d: "M0,1 L11,6 L0,11 Z", class: m[1] }));
        defs.appendChild(mk);
      });
      svg.appendChild(defs);
      for (var i = X_MIN; i <= X_MAX; i++) this._ligne([i, Y_MIN], [i, Y_MAX], { class: "grille" });
      for (var j = Y_MIN; j <= Y_MAX; j++) this._ligne([X_MIN, j], [X_MAX, j], { class: "grille" });
      this._ligne([X_MIN, 0], [X_MAX, 0], { class: "axe", "marker-end": "url(#p-soft)" });
      this._ligne([0, Y_MIN], [0, Y_MAX], { class: "axe", "marker-end": "url(#p-soft)" });

      this._poly(tour, aligne ? "quad quad-plat" : "quad");
      if (e.mode === "egalite" && e.piege && !aligne) this._poly([A, B, C, D], "piege");
      if (!aligne) {
        this._ligne(tour[0], tour[2], { class: "diag" });
        this._ligne(tour[1], tour[3], { class: "diag" });
        var pI = this._px(centre[0], centre[1]);
        svg.appendChild(el("circle", { cx: pI[0].toFixed(1), cy: pI[1].toFixed(1), r: 3.5, class: "pt-i" }));
      }
      // les deux représentants égaux
      this._ligne(A, B, { class: "v", "marker-end": "url(#p-acc)" });
      if (e.mode === "egalite") this._ligne(C, D, { class: "v", "marker-end": "url(#p-acc)" });
      else this._ligne(D, C, { class: "v", "marker-end": "url(#p-acc)" });

      var pD = this._px(D[0], D[1]);
      svg.appendChild(el("circle", { cx: pD[0].toFixed(1), cy: pD[1].toFixed(1), r: 6, class: "pt-d" }));
      var self = this;
      [["A", A], ["B", B], ["C", C]].forEach(function (x) { self._etiquette(x[1], x[0] + couple(x[1]), centre); });
      this._etiquette(D, "D" + couple(D), centre, "lab-d");
      var poignees = { A: this._poignee("A"), B: this._poignee("B"), C: this._poignee("C") };
      if (this._focus) { poignees[this._focus].focus(); this._focus = null; }
      this._rendreLecture();
    }

    _rendreLecture() {
      var e = this._e, A = e.A, B = e.B, C = e.C, D = this._D(e);
      var ab = [B[0] - A[0], B[1] - A[1]], ac = [C[0] - A[0], C[1] - A[1]];
      var aligne = ab[0] * ac[1] - ab[1] * ac[0] === 0;
      var h = [];
      if (this._message) h.push('<div class="ligne ligne-alerte">' + this._message + "</div>");
      h.push('<div class="ligne"><span class="c-acc">' + vec("AB") + "</span> = (x<sub>B</sub> − x<sub>A</sub> ; y<sub>B</sub> − y<sub>A</sub>) = (" + fr(B[0]) + " − " + par(A[0]) + " ; " + fr(B[1]) + " − " + par(A[1]) + ") = " + couple(ab) + "</div>");
      if (e.mode === "egalite") {
        h.push('<div class="ligne ligne-r">' + vec("CD") + " = " + vec("AB") + " ⟺ D = C + " + vec("AB") + " = (" + fr(C[0]) + " + " + par(ab[0]) + " ; " + fr(C[1]) + " + " + par(ab[1]) + ") = <span class=\"c-good\">D" + couple(D) + "</span></div>");
        h.push('<div class="ligne">' + vec("AB") + " = " + vec("CD") + " ⟺ <strong>ABDC</strong> est un parallélogramme. Attention à l'ordre des lettres : on fait le tour de la figure en passant par A, B, D puis C — pas A, B, C, D." +
          (e.piege && !aligne ? " En reliant A, B, C, D dans cet ordre (pointillés rouges), on obtient un quadrilatère croisé, pas un parallélogramme." : "") + "</div>");
      } else {
        h.push('<div class="ligne ligne-r">ABCD parallélogramme ⟺ ' + vec("AB") + " = " + vec("DC") + " ⟺ D = C − " + vec("AB") + " = (" + fr(C[0]) + " − " + par(ab[0]) + " ; " + fr(C[1]) + " − " + par(ab[1]) + ") = <span class=\"c-good\">D" + couple(D) + "</span></div>");
        if (!aligne) {
          var m = [(A[0] + C[0]) / 2, (A[1] + C[1]) / 2];
          h.push('<div class="ligne">Vérification : les diagonales [AC] et [BD] ont le même milieu, (' + fr(m[0]) + " ; " + fr(m[1]) + ") pour les deux.</div>");
        }
      }
      if (aligne) h.push('<div class="ligne ligne-alerte">A, B et C sont alignés : le « parallélogramme » est aplati, ses quatre sommets sont sur une même droite.</div>');
      this._sh.getElementById("lecture").innerHTML = h.join("");
    }
  }

  if (!customElements.get("egalite-parallelogramme-widget")) {
    customElements.define("egalite-parallelogramme-widget", EgaliteParallelogrammeWidget);
  }
})();
