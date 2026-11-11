(function () {
  "use strict";

  /* ================================================================
   * <gauss-double-echelle-widget> — atelier interactif : la preuve de
   * Sₙ = n(u₁ + uₙ)/2 par la « double échelle ». Les termes u₁…uₙ d'une
   * suite arithmétique sont dessinés en barres (un escalier). Une copie de
   * cet escalier, dans l'ordre inverse (uₙ…u₁), pend du « plafond » : le
   * bouton « Assembler » la fait descendre d'un seul bloc jusqu'à se poser
   * sur la première. Elle s'emboîte parfaitement parce que la même
   * translation convient à toutes les colonnes : u_k + u_(n+1−k) vaut
   * toujours u₁ + uₙ. On obtient un rectangle n × (u₁ + uₙ), qui contient
   * deux fois la somme. Préréglage « Gauss » : 1 + 2 + … + 100, dessiné
   * dans sa propre fenêtre fixe. Web Component (Shadow DOM).
   * ================================================================ */

  var DEFAUT = { n: 8, u1: 6, r: 5 };
  var BORNES = { n: [2, 12], u1: [1, 10], r: [0, 5] };

  // Fenêtres FIXES. Mode normal : 12 colonnes au maximum, hauteur u₁ + uₙ ≤ 10 + 65 = 75 ;
  // le « plafond » d'où pend la copie retournée est à 80. Mode Gauss : 100 colonnes,
  // hauteur 101, plafond à 110.
  var LARGEUR = 460, HAUTEUR = 300, MARGE_G = 40, MARGE_D = 16, MARGE_H = 22, MARGE_B = 26;
  var FENETRES = {
    normal: { colonnes: 12, plafond: 80, graduations: [0, 20, 40, 60, 80] },
    gauss: { colonnes: 100, plafond: 110, graduations: [0, 25, 50, 75, 100] },
  };

  var REDUIT = typeof window !== "undefined" && window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function entierFr(n) {
    var s = String(Math.abs(Math.round(n)));
    s = s.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return (n < 0 ? "−" : "") + s;
  }

  function nombreFr(x) {
    if (Math.abs(x - Math.round(x)) < 1e-9) return entierFr(x);
    return String(Math.round(x * 100) / 100).replace(".", ",").replace("-", "−");
  }

  var INDICES = { "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉" };
  function indice(k) {
    return String(k).split("").map(function (c) { return INDICES[c] || c; }).join("");
  }

  function svgEl(tag, attrs) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var key in attrs) el.setAttribute(key, attrs[key]);
    return el;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}' +
    '*{box-sizing:border-box;}' +
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.02rem;font-weight:600;margin:0 0 10px;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:460px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.graduation{stroke:var(--line,#e2d8c8);stroke-width:1;}' +
    '.barre-a{fill:var(--accent,#a8471f);fill-opacity:0.78;stroke:var(--surface,#fff);stroke-width:0.8;}' +
    '.barre-b{fill:var(--good,#2f7a4f);fill-opacity:0.62;stroke:var(--surface,#fff);stroke-width:0.8;}' +
    '.plafond{stroke:var(--ink-soft,#6b6055);stroke-width:1.2;stroke-dasharray:2 3;}' +
    '.rectangle{fill:none;stroke:var(--ink,#241f1a);stroke-width:1.8;stroke-dasharray:6 4;}' +
    '.copie{transition:transform 0.9s ease-in-out;}' +
    '.copie.instantane{transition:none;}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.etiquette-n{font-size:10.5px;fill:var(--ink-soft,#6b6055);font-family:var(--mono,monospace);}' +
    '.etiquette-rect{font-size:12px;font-weight:700;fill:var(--ink,#241f1a);font-family:var(--mono,monospace);}' +
    '.legende{display:flex;flex-wrap:wrap;justify-content:center;gap:6px 16px;font-size:0.86rem;margin:0 0 10px;}' +
    '.pastille{display:inline-block;width:12px;height:12px;border-radius:2px;vertical-align:-1px;margin-right:6px;}' +
    '.pastille-a{background:var(--accent,#a8471f);opacity:0.78;}' +
    '.pastille-b{background:var(--good,#2f7a4f);opacity:0.62;}' +
    '.calcul{background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);padding:10px 14px;margin:0 0 14px;font-size:0.92rem;line-height:1.55;}' +
    '.calcul p{margin:0;}' +
    '.calcul .resultat{font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.boutons{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-bottom:14px;}' +
    '.btn{min-height:44px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.9rem;font-family:inherit;}' +
    '.btn:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '.btn[aria-pressed="true"]{background:var(--accent,#a8471f);border-color:var(--accent,#a8471f);color:var(--surface,#fff);}' +
    '.btn:focus-visible,input:focus-visible{outline:2px solid var(--accent,#a8471f);outline-offset:2px;}' +
    '.controles{display:flex;flex-direction:column;gap:10px;}' +
    '.curseur{display:flex;flex-direction:column;gap:4px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;min-height:44px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);min-height:44px;}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:36px;text-align:right;}' +
    '</style>' +
    '<p class="formule" id="formule"></p>' +
    '<div class="legende"><span><span class="pastille pastille-a"></span>u₁, u₂, …, uₙ</span>' +
    '<span><span class="pastille pastille-b"></span>la même suite à l’envers : uₙ, …, u₂, u₁</span></div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Double échelle de Gauss"></svg></div>' +
    '<div class="boutons">' +
    '<button class="btn" id="assembler" type="button" aria-pressed="false">Assembler</button>' +
    '<button class="btn" id="gauss" type="button" aria-pressed="false">Gauss : 1 + 2 + … + 100</button>' +
    '</div>' +
    '<div class="calcul" id="calcul" aria-live="polite"></div>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="n">n — nombre de termes</label><div class="curseur-row"><input type="range" id="n" min="2" max="12" step="1"><span class="curseur-valeur" id="n-valeur"></span></div></div>' +
    '<div class="curseur"><label for="u1">u₁ — premier terme</label><div class="curseur-row"><input type="range" id="u1" min="1" max="10" step="1"><span class="curseur-valeur" id="u1-valeur"></span></div></div>' +
    '<div class="curseur"><label for="r">r — raison</label><div class="curseur-row"><input type="range" id="r" min="0" max="5" step="1"><span class="curseur-valeur" id="r-valeur"></span></div></div>' +
    '</div>';

  class GaussDoubleEchelleWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._shadow = shadow;
      this._n = DEFAUT.n; this._u1 = DEFAUT.u1; this._r = DEFAUT.r;
      this._assemble = false;
      this._gauss = false;
      this._inputs = { n: shadow.getElementById("n"), u1: shadow.getElementById("u1"), r: shadow.getElementById("r") };
      this._valeurs = { n: shadow.getElementById("n-valeur"), u1: shadow.getElementById("u1-valeur"), r: shadow.getElementById("r-valeur") };
      this._btnAssembler = shadow.getElementById("assembler");
      this._btnGauss = shadow.getElementById("gauss");
      this._svg = shadow.getElementById("svg");
      this._calcul = shadow.getElementById("calcul");
      this._formule = shadow.getElementById("formule");
    }

    connectedCallback() {
      var self = this;
      ["n", "u1", "r"].forEach(function (cle) { self._inputs[cle].value = String(self["_" + cle]); });
      this._onInput = function (e) {
        var cle = e.target.id;
        self["_" + cle] = parseInt(e.target.value, 10);
        self._gauss = false;
        self._assemble = false;
        self._rendre(true);
      };
      this._onAssembler = function () {
        self._assemble = !self._assemble;
        self._appliquerPosition(false);
        self._rendreCalcul();
      };
      this._onGauss = function () {
        self._gauss = !self._gauss;
        self._assemble = false;
        self._rendre(true);
      };
      ["n", "u1", "r"].forEach(function (cle) { self._inputs[cle].addEventListener("input", self._onInput); });
      this._btnAssembler.addEventListener("click", this._onAssembler);
      this._btnGauss.addEventListener("click", this._onGauss);
      this._rendre(true);
    }

    disconnectedCallback() {
      var self = this;
      ["n", "u1", "r"].forEach(function (cle) { self._inputs[cle].removeEventListener("input", self._onInput); });
      this._btnAssembler.removeEventListener("click", this._onAssembler);
      this._btnGauss.removeEventListener("click", this._onGauss);
    }

    _parametres() {
      if (this._gauss) return { n: 100, u1: 1, r: 1, fenetre: FENETRES.gauss };
      return { n: this._n, u1: this._u1, r: this._r, fenetre: FENETRES.normal };
    }

    _toPy(v, fenetre) {
      return HAUTEUR - MARGE_B - (v / fenetre.plafond) * (HAUTEUR - MARGE_H - MARGE_B);
    }

    _appliquerPosition(instantane) {
      if (!this._copie) return;
      var dy = this._assemble ? this._decalage : 0;
      if (instantane || REDUIT) this._copie.classList.add("instantane");
      else this._copie.classList.remove("instantane");
      this._copie.style.transform = "translate(0px, " + dy.toFixed(2) + "px)";
      this._rectangle.style.opacity = this._assemble ? "1" : "0";
      this._etiquetteRect.style.opacity = this._assemble ? "1" : "0";
      this._btnAssembler.setAttribute("aria-pressed", this._assemble ? "true" : "false");
      this._btnAssembler.textContent = this._assemble ? "Séparer" : "Assembler";
    }

    _rendre(instantane) {
      var p = this._parametres();
      var n = p.n, u1 = p.u1, r = p.r, f = p.fenetre;
      var un = u1 + (n - 1) * r;
      var self = this;

      ["n", "u1", "r"].forEach(function (cle) { self._valeurs[cle].textContent = String(self["_" + cle]); });
      this._btnGauss.setAttribute("aria-pressed", this._gauss ? "true" : "false");
      this._formule.textContent = this._gauss
        ? "uₖ = k, pour k de 1 à 100"
        : "uₖ = " + u1 + " + (k − 1) × " + r + " , pour k de 1 à " + n;

      var svg = this._svg;
      svg.innerHTML = "";
      var defs = svgEl("defs", {});
      var marker = svgEl("marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      marker.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(marker);
      svg.appendChild(defs);

      var largeurUtile = LARGEUR - MARGE_G - MARGE_D - 10;
      var pas = largeurUtile / f.colonnes;
      var largeurBarre = this._gauss ? pas : pas * 0.82;
      var x0 = MARGE_G + 4;
      var bas = this._toPy(0, f);

      f.graduations.forEach(function (g) {
        var y = self._toPy(g, f);
        if (g > 0) svg.appendChild(svgEl("line", { x1: MARGE_G, x2: LARGEUR - MARGE_D, y1: y.toFixed(2), y2: y.toFixed(2), class: "graduation" }));
        var t = svgEl("text", { x: MARGE_G - 6, y: (y + 4).toFixed(2), "text-anchor": "end", class: "etiquette-n" });
        t.textContent = String(g);
        svg.appendChild(t);
      });

      var yPlafond = this._toPy(f.plafond, f);
      svg.appendChild(svgEl("line", { x1: MARGE_G, x2: LARGEUR - MARGE_D, y1: yPlafond.toFixed(2), y2: yPlafond.toFixed(2), class: "plafond" }));

      for (var k = 1; k <= n; k++) {
        var uk = u1 + (k - 1) * r;
        var x = x0 + (k - 1) * pas + (pas - largeurBarre) / 2;
        var yHaut = this._toPy(uk, f);
        svg.appendChild(svgEl("rect", { x: x.toFixed(2), y: yHaut.toFixed(2), width: largeurBarre.toFixed(2), height: (bas - yHaut).toFixed(2), class: "barre-a" }));
        var montrerIndice = this._gauss ? (k === 1 || k === 50 || k === 100) : true;
        if (montrerIndice) {
          var et = svgEl("text", { x: (x + largeurBarre / 2).toFixed(2), y: (bas + 14).toFixed(2), "text-anchor": "middle", class: "etiquette-n" });
          et.textContent = String(k);
          svg.appendChild(et);
        }
      }

      // Copie retournée : la colonne k reçoit u_(n+1−k), pendue au plafond.
      var copie = svgEl("g", { class: "copie" });
      for (var j = 1; j <= n; j++) {
        var v = u1 + (n - j) * r;
        var xj = x0 + (j - 1) * pas + (pas - largeurBarre) / 2;
        var yb = this._toPy(f.plafond - v, f);
        copie.appendChild(svgEl("rect", { x: xj.toFixed(2), y: yPlafond.toFixed(2), width: largeurBarre.toFixed(2), height: (yb - yPlafond).toFixed(2), class: "barre-b" }));
      }
      svg.appendChild(copie);
      this._copie = copie;
      // Même translation pour toutes les colonnes : plafond − (u₁ + uₙ).
      this._decalage = this._toPy(u1 + un, f) - yPlafond;

      var xFin = x0 + n * pas - (pas - largeurBarre) / 2;
      var xDebut = x0 + (pas - largeurBarre) / 2;
      var yRect = this._toPy(u1 + un, f);
      this._rectangle = svgEl("rect", { x: xDebut.toFixed(2), y: yRect.toFixed(2), width: (xFin - xDebut).toFixed(2), height: (bas - yRect).toFixed(2), class: "rectangle" });
      this._rectangle.style.transition = REDUIT ? "none" : "opacity 0.4s ease 0.6s";
      svg.appendChild(this._rectangle);
      var xEt = Math.min(xFin, LARGEUR - MARGE_D - 4);
      this._etiquetteRect = svgEl("text", { x: xEt.toFixed(2), y: (yRect - 6).toFixed(2), "text-anchor": "end", class: "etiquette-rect" });
      this._etiquetteRect.textContent = n + " × " + (u1 + un);
      this._etiquetteRect.style.transition = this._rectangle.style.transition;
      svg.appendChild(this._etiquetteRect);

      svg.appendChild(svgEl("line", { x1: MARGE_G, x2: LARGEUR - MARGE_D + 8, y1: bas.toFixed(2), y2: bas.toFixed(2), class: "axe", "marker-end": "url(#fleche)" }));
      svg.appendChild(svgEl("line", { x1: MARGE_G, x2: MARGE_G, y1: bas.toFixed(2), y2: MARGE_H - 10, class: "axe", "marker-end": "url(#fleche)" }));
      var etX = svgEl("text", { x: LARGEUR - MARGE_D + 4, y: (bas - 6).toFixed(2), "text-anchor": "end", class: "etiquette" });
      etX.textContent = "k";
      svg.appendChild(etX);
      var etY = svgEl("text", { x: MARGE_G + 6, y: MARGE_H - 8, class: "etiquette" });
      etY.textContent = "valeur du terme";
      svg.appendChild(etY);

      this._appliquerPosition(instantane);
      this._rendreCalcul();
    }

    _rendreCalcul() {
      var p = this._parametres();
      var n = p.n, u1 = p.u1, r = p.r;
      var un = u1 + (n - 1) * r;
      var somme = n * (u1 + un) / 2;
      var sN = "S" + indice(n), uN = "u" + indice(n);
      var lignes = [];
      if (this._gauss) {
        lignes.push("<p>Le jeune Gauss écrit la somme deux fois, la seconde à l’envers : chaque colonne vaut 1 + 100 = 2 + 99 = … = 101.</p>");
      } else {
        lignes.push("<p>" + uN + " = " + u1 + " + (" + n + " − 1) × " + r + " = " + nombreFr(un) + ".</p>");
        lignes.push("<p>Chaque colonne : u₁ + " + uN + " = u₂ + u" + indice(n - 1) + " = … = " + u1 + " + " + nombreFr(un) + " = " + nombreFr(u1 + un) + ".</p>");
      }
      if (this._assemble) {
        lignes.push("<p>Rectangle : 2 · " + sN + " = n × (u₁ + " + uN + ") = " + n + " × " + nombreFr(u1 + un) + " = " + nombreFr(n * (u1 + un)) + ",</p>");
        lignes.push('<p class="resultat">donc ' + sN + " = " + nombreFr(n * (u1 + un)) + " ÷ 2 = " + nombreFr(somme) + ".</p>");
      } else {
        lignes.push("<p>Appuie sur « Assembler » : la copie verte descend d’un seul bloc et se pose sur l’escalier.</p>");
      }
      this._calcul.innerHTML = lignes.join("");
    }
  }

  if (!customElements.get("gauss-double-echelle-widget")) {
    customElements.define("gauss-double-echelle-widget", GaussDoubleEchelleWidget);
  }
})();
