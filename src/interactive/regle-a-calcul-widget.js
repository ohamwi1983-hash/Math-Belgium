(function () {
  "use strict";

  /* ================================================================
   * <regle-a-calcul-widget> — atelier interactif (6e, ch. 3, section 1,
   * historique Oughtred) : une règle à calcul simplifiée. Deux réglettes
   * graduées en échelle logarithmique de 1 à 10 (position d'un nombre N =
   * log₁₀(N) × longueur). La réglette du bas glisse (au doigt, ou via les
   * curseurs a et b) : multiplier, c'est mettre bout à bout la longueur de
   * a et celle de b — log a + log b = log(ab). Si ab > 10, on aligne
   * l'index 10 de la réglette mobile (lecture = ab ÷ 10). Mode division :
   * aligner b sous a, lire au-dessus de l'index 1 (ou 10). Web Component
   * (Shadow DOM).
   * ================================================================ */

  var W = 340, H = 172;
  var X0 = 22, L = 296;            // réglette fixe : de X0 à X0 + L
  var Y_FIXE = 34, H_FIXE = 38;     // corps de la réglette fixe
  var Y_MOB = 76, H_MOB = 44;       // corps de la réglette mobile (≥ 44 : saisissable au doigt)
  var LOG10 = function (x) { return Math.log(x) / Math.LN10; };

  // Graduations : pas 0,1 entre 1 et 2, 0,2 entre 2 et 5, 0,5 entre 5 et 10.
  var GRADUATIONS = (function () {
    var t = [], v;
    for (v = 10; v <= 100; v += 1) {
      var n = v / 10;
      if (n < 2 || (n < 5 && v % 2 === 0) || (n >= 5 && v % 5 === 0)) t.push(n);
    }
    return t;
  })();

  function arrondi(n, d) { var f = Math.pow(10, d); return Math.round(n * f) / f; }
  function fmt(n, dec) {
    var s = arrondi(n, dec).toFixed(dec);
    if (s.indexOf(".") >= 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
    return s.replace(".", ",").replace("-", "−");
  }

  function svgEl(tag, attrs) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}' +
    '*{box-sizing:border-box;}' +
    '.onglets{display:flex;gap:8px;margin-bottom:12px;}' +
    '.onglets button{flex:1 1 0;}' +
    'button{min-height:44px;font:inherit;font-size:0.9rem;padding:6px 12px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);cursor:pointer;}' +
    'button[aria-pressed="true"]{background:var(--accent-soft,#f4e3d1);border-color:var(--accent,#a8471f);color:var(--accent-ink,#7a3212);font-weight:700;}' +
    'button:focus-visible,input:focus-visible{outline:2px solid var(--plan,#5b4ea3);outline-offset:2px;}' +
    '.graphe{display:flex;justify-content:center;}' +
    'svg{width:100%;max-width:340px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);display:block;touch-action:pan-y;user-select:none;-webkit-user-select:none;}' +
    '.corps-fixe{fill:var(--surface,#fff);stroke:var(--ink-faint,#9c9083);stroke-width:1;}' +
    '.corps-mob{fill:var(--accent-soft,#f4e3d1);stroke:var(--accent,#a8471f);stroke-width:1.2;cursor:grab;}' +
    '.corps-mob.saisi{cursor:grabbing;}' +
    '.trait{stroke:var(--ink-soft,#6b6055);stroke-width:1;}' +
    '.trait-mob{stroke:var(--accent-ink,#7a3212);stroke-width:1;pointer-events:none;}' +
    '.num{font-size:10px;font-family:var(--mono,monospace);fill:var(--ink,#241f1a);}' +
    '.num-mob{font-size:10px;font-family:var(--mono,monospace);fill:var(--accent-ink,#7a3212);pointer-events:none;}' +
    '.nom-regle{font-size:9.5px;font-family:var(--sans,sans-serif);fill:var(--ink-faint,#9c9083);}' +
    '.long-a{stroke:var(--good,#2f7a4f);stroke-width:4;stroke-linecap:round;}' +
    '.long-b{stroke:var(--plan,#5b4ea3);stroke-width:4;stroke-linecap:round;}' +
    '.long-label{font-size:10px;font-weight:700;font-family:var(--sans,sans-serif);}' +
    '.long-label-a{fill:var(--good,#2f7a4f);}' +
    '.long-label-b{fill:var(--plan-ink,#443a80);}' +
    '.curseur-verre{fill:var(--plan,#5b4ea3);opacity:0.08;pointer-events:none;}' +
    '.curseur-fil{stroke:var(--bad,#b23a3a);stroke-width:1.6;pointer-events:none;}' +
    '.index{fill:var(--good,#2f7a4f);}' +
    '.lecture-label{font-size:11px;font-weight:700;font-family:var(--mono,monospace);fill:var(--bad,#b23a3a);}' +
    '.etapes{margin:12px 0 0;padding-left:1.3em;font-size:0.92rem;line-height:1.5;}' +
    '.etapes li{margin-bottom:3px;}' +
    '.resultat{margin-top:10px;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);background:var(--surface,#fff);padding:10px 12px;font-size:0.93rem;line-height:1.5;}' +
    '.resultat .gros{font-size:1.1rem;font-weight:700;font-variant-numeric:tabular-nums;color:var(--ink,#241f1a);}' +
    '.pourquoi{margin-top:6px;font-family:var(--mono,monospace);font-size:0.84rem;color:var(--ink-soft,#6b6055);}' +
    '.note{margin-top:6px;color:var(--accent-ink,#7a3212);font-size:0.88rem;}' +
    '.curseur{display:flex;flex-direction:column;gap:4px;margin-top:12px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;text-align:center;}' +
    '.lab-a{color:var(--good,#2f7a4f);}' +
    '.lab-b{color:var(--plan-ink,#443a80);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;min-height:44px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-height:44px;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:44px;text-align:right;}' +
    '.aide{font-size:0.82rem;color:var(--ink-faint,#9c9083);text-align:center;margin-top:4px;}' +
    '</style>' +
    '<div class="onglets" role="group" aria-label="Opération"><button type="button" id="mode-mult">Multiplier a × b</button><button type="button" id="mode-div">Diviser a ÷ b</button></div>' +
    '<div class="graphe"><svg id="svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Règle à calcul"></svg></div>' +
    '<div class="aide">Fais glisser la réglette du bas au doigt, ou règle a et b.</div>' +
    '<div class="curseur"><label for="a" class="lab-a">a</label><div class="curseur-row"><input type="range" id="a" min="1" max="10" step="0.1"><span class="curseur-valeur" id="a-val"></span></div></div>' +
    '<div class="curseur"><label for="b" class="lab-b">b</label><div class="curseur-row"><input type="range" id="b" min="1" max="10" step="0.1"><span class="curseur-valeur" id="b-val"></span></div></div>' +
    '<ol class="etapes" id="etapes"></ol>' +
    '<div class="resultat" aria-live="polite" id="resultat"></div>';

  class RegleACalculWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._s = shadow;
      this._svg = shadow.getElementById("svg");
      this._inA = shadow.getElementById("a");
      this._inB = shadow.getElementById("b");
      this._btnMult = shadow.getElementById("mode-mult");
      this._btnDiv = shadow.getElementById("mode-div");
      this._mode = "mult";
      this._a = 2;
      this._b = 3;
    }

    connectedCallback() {
      var self = this;
      this._inA.value = String(this._a);
      this._inB.value = String(this._b);
      this._onA = function () { self._a = parseFloat(self._inA.value); self._rendre(); };
      this._onB = function () { self._b = parseFloat(self._inB.value); self._rendre(); };
      this._onMult = function () { self._mode = "mult"; self._rendre(); };
      this._onDiv = function () { self._mode = "div"; self._a = 7.5; self._b = 2.5; self._inA.value = "7.5"; self._inB.value = "2.5"; self._rendre(); };
      this._inA.addEventListener("input", this._onA);
      this._inB.addEventListener("input", this._onB);
      this._btnMult.addEventListener("click", this._onMult);
      this._btnDiv.addEventListener("click", this._onDiv);
      this._rendre();
    }

    disconnectedCallback() {
      this._inA.removeEventListener("input", this._onA);
      this._inB.removeEventListener("input", this._onB);
      this._btnMult.removeEventListener("click", this._onMult);
      this._btnDiv.removeEventListener("click", this._onDiv);
    }

    _pos(n) { return X0 + L * LOG10(n); }

    // Décalage (en longueur de règle, unité = L) de la réglette mobile, et lecture associée.
    _calcul() {
      var a = this._a, b = this._b, la = LOG10(a), lb = LOG10(b);
      if (this._mode === "mult") {
        var p = a * b;
        if (p <= 10 + 1e-9) {
          return { decalage: la, index: 1, filMob: lb, lecture: p, facteur: 1, exact: p };
        }
        // Index 10 de la réglette mobile sous a : la réglette part vers la gauche.
        return { decalage: la - 1, index: 10, filMob: lb, lecture: p / 10, facteur: 10, exact: p };
      }
      var q = a / b;
      if (a >= b - 1e-9) {
        // b de la réglette mobile sous a ; on lit au-dessus de l'index 1.
        return { decalage: la - lb, index: 1, filMob: 0, lecture: q, facteur: 1, exact: q };
      }
      // a < b : au-dessus de l'index 1 on sortirait à gauche ; on lit au-dessus de l'index 10.
      return { decalage: la - lb, index: 10, filMob: 1, lecture: q * 10, facteur: 0.1, exact: q };
    }

    _rendre() {
      var self = this, svg = this._svg, c = this._calcul(), a = this._a, b = this._b;
      this._btnMult.setAttribute("aria-pressed", String(this._mode === "mult"));
      this._btnDiv.setAttribute("aria-pressed", String(this._mode === "div"));
      this._s.getElementById("a-val").textContent = fmt(a, 1);
      this._s.getElementById("b-val").textContent = fmt(b, 1);
      svg.innerHTML = "";
      var defs = svgEl("defs", {});
      var clip = svgEl("clipPath", { id: "clip" });
      clip.appendChild(svgEl("rect", { x: 0, y: 0, width: W, height: H }));
      defs.appendChild(clip);
      svg.appendChild(defs);

      // ---- réglette fixe
      svg.appendChild(svgEl("rect", { x: X0 - 8, y: Y_FIXE, width: L + 16, height: H_FIXE, rx: 3, class: "corps-fixe" }));
      var nf = svgEl("text", { x: X0 - 6, y: Y_FIXE - 4, class: "nom-regle" });
      nf.textContent = "réglette fixe";
      svg.appendChild(nf);
      GRADUATIONS.forEach(function (n) {
        var x = self._pos(n), entier = Math.abs(n - Math.round(n)) < 1e-9, moyen = Math.abs(n * 2 - Math.round(n * 2)) < 1e-9;
        var hTrait = entier ? 14 : moyen ? 9 : 6;
        svg.appendChild(svgEl("line", { x1: x.toFixed(2), x2: x.toFixed(2), y1: Y_FIXE + H_FIXE, y2: Y_FIXE + H_FIXE - hTrait, class: "trait" }));
        if (entier || n === 1.5) {
          var t = svgEl("text", { x: x.toFixed(2), y: Y_FIXE + 13, "text-anchor": "middle", class: "num" });
          t.textContent = fmt(n, 1);
          svg.appendChild(t);
        }
      });

      // ---- réglette mobile (décalée de c.decalage × L), rognée au cadre
      var dx = c.decalage * L;
      var g = svgEl("g", { "clip-path": "url(#clip)" });
      var gMob = svgEl("g", { transform: "translate(" + dx.toFixed(2) + " 0)" });
      var corps = svgEl("rect", { x: X0 - 8, y: Y_MOB, width: L + 16, height: H_MOB, rx: 3, class: "corps-mob" });
      gMob.appendChild(corps);
      GRADUATIONS.forEach(function (n) {
        var x = self._pos(n), entier = Math.abs(n - Math.round(n)) < 1e-9, moyen = Math.abs(n * 2 - Math.round(n * 2)) < 1e-9;
        var hTrait = entier ? 14 : moyen ? 9 : 6;
        gMob.appendChild(svgEl("line", { x1: x.toFixed(2), x2: x.toFixed(2), y1: Y_MOB, y2: Y_MOB + hTrait, class: "trait-mob" }));
        if (entier || n === 1.5) {
          var t = svgEl("text", { x: x.toFixed(2), y: Y_MOB + H_MOB - 8, "text-anchor": "middle", class: "num-mob" });
          t.textContent = fmt(n, 1);
          gMob.appendChild(t);
        }
      });
      // index utilisé (1 ou 10), repéré par un petit triangle vert
      var xi = this._pos(c.index);
      gMob.appendChild(svgEl("path", { d: "M" + (xi - 5).toFixed(2) + " " + (Y_MOB + H_MOB + 7) + " L" + (xi + 5).toFixed(2) + " " + (Y_MOB + H_MOB + 7) + " L" + xi.toFixed(2) + " " + (Y_MOB + H_MOB + 1) + " Z", class: "index" }));
      g.appendChild(gMob);
      svg.appendChild(g);
      var nm = svgEl("text", { x: W - 6, y: Y_MOB + H_MOB + 22, "text-anchor": "end", class: "nom-regle" });
      nm.textContent = "réglette mobile — glisse-la";
      svg.appendChild(nm);

      // ---- longueurs log a et log b, au-dessus de la réglette fixe (multiplication)
      var yL = Y_FIXE - 14;
      if (this._mode === "mult") {
        var finA = this._pos(a), xA1 = finA;
        if (c.index === 1) {
          svg.appendChild(svgEl("line", { x1: X0.toFixed(2), x2: finA.toFixed(2), y1: yL, y2: yL, class: "long-a" }));
          svg.appendChild(svgEl("line", { x1: finA.toFixed(2), x2: this._pos(c.lecture).toFixed(2), y1: yL, y2: yL, class: "long-b" }));
          var tA = svgEl("text", { x: ((X0 + finA) / 2).toFixed(2), y: yL - 5, "text-anchor": "middle", class: "long-label long-label-a" });
          tA.textContent = "log " + fmt(a, 1);
          svg.appendChild(tA);
          var tB = svgEl("text", { x: ((finA + this._pos(c.lecture)) / 2).toFixed(2), y: yL - 5, "text-anchor": "middle", class: "long-label long-label-b" });
          tB.textContent = "log " + fmt(b, 1);
          svg.appendChild(tB);
        } else {
          svg.appendChild(svgEl("line", { x1: X0.toFixed(2), x2: xA1.toFixed(2), y1: yL, y2: yL, class: "long-a" }));
        }
      }

      // ---- curseur (verre + fil) sur la lecture
      var xFil = X0 + dx + L * c.filMob;
      svg.appendChild(svgEl("rect", { x: (xFil - 9).toFixed(2), y: Y_FIXE - 4, width: 18, height: Y_MOB + H_MOB - Y_FIXE + 8, rx: 3, class: "curseur-verre" }));
      svg.appendChild(svgEl("line", { x1: xFil.toFixed(2), x2: xFil.toFixed(2), y1: Y_FIXE - 4, y2: Y_MOB + H_MOB + 4, class: "curseur-fil" }));
      var ancre = xFil > W - 60 ? "end" : xFil < 60 ? "start" : "middle";
      var lab = svgEl("text", { x: xFil.toFixed(2), y: H - 6, "text-anchor": ancre, class: "lecture-label" });
      lab.textContent = "lecture ≈ " + fmt(c.lecture, 2);
      svg.appendChild(lab);

      this._brancherGlisser(corps);
      this._textes(c);
    }

    // Glisser au doigt : la réglette suit le pointeur ; on en déduit a (multiplication : le
    // nombre au-dessus de l'index utilisé ; division : a reste, on déduit b).
    _brancherGlisser(corps) {
      var self = this;
      corps.addEventListener("pointerdown", function (ev) {
        ev.preventDefault();
        var svg = self._svg;
        var pt = svg.createSVGPoint();
        var versSvg = function (e) { pt.x = e.clientX; pt.y = e.clientY; return pt.matrixTransform(svg.getScreenCTM().inverse()).x; };
        var c0 = self._calcul(), depart = versSvg(ev), dec0 = c0.decalage, index0 = c0.index;
        corps.classList.add("saisi");
        var bouger = function (e) {
          var dec = dec0 + (versSvg(e) - depart) / L;
          if (self._mode === "mult") {
            // l'index 1 (ou 10) se trouve sous le nombre 10^(dec) (ou 10^(dec+1))
            var aNouv = index0 === 1 ? Math.pow(10, dec) : Math.pow(10, dec + 1);
            if (aNouv < 1) aNouv = 1;
            if (aNouv > 10) aNouv = 10;
            self._a = arrondi(aNouv, 1);
            self._inA.value = String(self._a);
          } else {
            var bNouv = self._a / Math.pow(10, dec);
            self._b = Math.max(1, Math.min(10, arrondi(bNouv, 1)));
            self._inB.value = String(self._b);
          }
          self._rendre();
        };
        var lacher = function () {
          window.removeEventListener("pointermove", bouger);
          window.removeEventListener("pointerup", lacher);
          window.removeEventListener("pointercancel", lacher);
        };
        window.addEventListener("pointermove", bouger);
        window.addEventListener("pointerup", lacher);
        window.addEventListener("pointercancel", lacher);
      });
    }

    _textes(c) {
      var a = this._a, b = this._b, A = fmt(a, 1), B = fmt(b, 1);
      var etapes = this._s.getElementById("etapes"), res = this._s.getElementById("resultat");
      if (this._mode === "mult") {
        var produit = fmt(c.exact, 2);
        if (c.index === 1) {
          etapes.innerHTML =
            "<li>Place l'index <b>1</b> de la réglette mobile sous <b>" + A + "</b> sur la réglette fixe.</li>" +
            "<li>Amène le fil du curseur au-dessus de <b>" + B + "</b> sur la réglette mobile.</li>" +
            "<li>Lis le nombre au-dessus du fil, sur la réglette fixe : <b>" + fmt(c.lecture, 2) + "</b>.</li>";
          res.innerHTML =
            '<div class="gros">' + A + " × " + B + " = " + produit + "</div>" +
            '<div class="pourquoi">longueur(' + A + ") + longueur(" + B + ") = log " + A + " + log " + B + " = log(" + A + " × " + B + ") = log " + produit + "</div>";
        } else {
          etapes.innerHTML =
            "<li>" + A + " × " + B + " dépasse 10 : avec l'index 1, " + B + " sortirait de la règle. Place plutôt l'index <b>10</b> de la réglette mobile sous <b>" + A + "</b>.</li>" +
            "<li>Amène le fil au-dessus de <b>" + B + "</b> sur la réglette mobile.</li>" +
            "<li>Lis <b>" + fmt(c.lecture, 2) + "</b> au-dessus du fil, puis multiplie par 10.</li>";
          res.innerHTML =
            '<div class="gros">' + A + " × " + B + " = " + fmt(c.lecture, 2) + " × 10 = " + produit + "</div>" +
            '<div class="pourquoi">log ' + A + " + log " + B + " − 1 = log(" + A + " × " + B + " ÷ 10) = log " + fmt(c.lecture, 2) + "</div>" +
            '<div class="note">Reculer d\'une longueur de règle, c\'est soustraire log 10 = 1 : diviser par 10.</div>';
        }
      } else {
        var quotient = fmt(c.exact, 3);
        if (c.index === 1) {
          etapes.innerHTML =
            "<li>Place <b>" + B + "</b> de la réglette mobile sous <b>" + A + "</b> sur la réglette fixe.</li>" +
            "<li>Amène le fil au-dessus de l'index <b>1</b> de la réglette mobile.</li>" +
            "<li>Lis le nombre au-dessus du fil : <b>" + fmt(c.lecture, 2) + "</b>.</li>";
          res.innerHTML =
            '<div class="gros">' + A + " ÷ " + B + " = " + quotient + "</div>" +
            '<div class="pourquoi">longueur(' + A + ") − longueur(" + B + ") = log " + A + " − log " + B + " = log(" + A + " ÷ " + B + ")</div>";
        } else {
          etapes.innerHTML =
            "<li>Place <b>" + B + "</b> de la réglette mobile sous <b>" + A + "</b>.</li>" +
            "<li>" + A + " &lt; " + B + " : l'index 1 sort à gauche. Amène le fil au-dessus de l'index <b>10</b>.</li>" +
            "<li>Lis <b>" + fmt(c.lecture, 2) + "</b>, puis divise par 10.</li>";
          res.innerHTML =
            '<div class="gros">' + A + " ÷ " + B + " = " + fmt(c.lecture, 2) + " ÷ 10 = " + quotient + "</div>" +
            '<div class="pourquoi">log ' + A + " − log " + B + " + 1 = log(" + A + " ÷ " + B + " × 10)</div>";
        }
      }
    }
  }

  if (!customElements.get("regle-a-calcul-widget")) {
    customElements.define("regle-a-calcul-widget", RegleACalculWidget);
  }
})();
