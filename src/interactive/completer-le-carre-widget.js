(function () {
  "use strict";

  /* ================================================================
   * <completer-le-carre-widget> — atelier interactif : la méthode géométrique
   * d'al-Khwârizmî (IXe siècle) pour résoudre x² + bx = c (b, c > 0). Un carré
   * de côté x, deux rectangles x × b/2 accolés (le « gnomon »), puis le petit
   * carré manquant de côté b/2, d'abord en pointillés, complété au clic. Le
   * grand carré obtenu a pour côté x + b/2 et pour aire c + (b/2)². Les étapes
   * algébriques s'affichent en regard, pas à pas. Web Component (Shadow DOM).
   * La figure est à l'échelle : son côté total (x + b/2) est ajusté au cadre.
   * ================================================================ */

  var DEFAUT = { b: 10, c: 39 }; // le problème historique d'al-Khwârizmî : x² + 10x = 39
  var BORNES_B = { min: 1, max: 14, step: 1 };
  var BORNES_C = { min: 1, max: 60, step: 1 };
  var PRESETS = [
    { b: 10, c: 39, label: "x² + 10x = 39" },
    { b: 6, c: 16, label: "x² + 6x = 16" },
    { b: 4, c: 21, label: "x² + 4x = 21" },
    { b: 3, c: 10, label: "x² + 3x = 10" },
  ];
  var TAILLE = 300, MARGE = 30;

  function fr(n, decimales) {
    if (decimales === undefined) decimales = 2;
    var facteur = Math.pow(10, decimales);
    var arrondi = Math.round(n * facteur) / facteur;
    var s = String(arrondi);
    if (s.indexOf("e") >= 0) s = arrondi.toFixed(decimales);
    return s.replace(".", ",").replace("-", "−");
  }

  function estEntier(v) { return Math.abs(v - Math.round(v)) < 1e-9; }

  // Racine carrée affichée exactement si le radicande est un carré parfait (au centième près),
  // sinon valeur approchée — jamais « = » pour une valeur arrondie.
  function racineTexte(v) {
    var r = Math.sqrt(v);
    if (estEntier(r * 100) || estEntier(r)) return { egal: "=", valeur: fr(r) , exacte: true, r: r };
    return { egal: "≈", valeur: fr(r), exacte: false, r: r };
  }

  function svgEl(ns, tag, attrs) {
    var el = document.createElementNS(ns, tag);
    for (var key in attrs) el.setAttribute(key, attrs[key]);
    return el;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.2rem;font-weight:600;color:var(--ink,#241f1a);margin:0 0 12px;}' +
    '.presets{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:0 0 12px;}' +
    '.preset{min-height:44px;padding:6px 12px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);font:inherit;font-size:0.88rem;cursor:pointer;}' +
    '.preset[aria-pressed="true"]{border-color:var(--accent,#a8471f);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:340px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.carre-x{fill:var(--accent-soft,#f6e2d3);stroke:var(--accent,#a8471f);stroke-width:1.6;}' +
    '.rect{fill:var(--good-soft,#dcefe3);stroke:var(--good,#2f7a4f);stroke-width:1.6;}' +
    '.petit{fill:transparent;stroke:var(--bad,#a8322f);stroke-width:1.6;stroke-dasharray:5 4;transition:fill .5s ease;}' +
    '.petit.plein{fill:var(--bad-soft,#f4dcdb);stroke-dasharray:none;}' +
    '.contour{fill:none;stroke:var(--ink,#241f1a);stroke-width:2.2;opacity:0;transition:opacity .5s ease;}' +
    '.contour.visible{opacity:1;}' +
    '.aire{font-family:var(--sans,sans-serif);font-size:13px;font-weight:600;fill:var(--ink,#241f1a);text-anchor:middle;dominant-baseline:middle;}' +
    '.cote{font-family:var(--sans,sans-serif);font-size:12px;fill:var(--ink-soft,#6b6055);text-anchor:middle;dominant-baseline:middle;}' +
    '.etapes{list-style:none;margin:0 0 14px;padding:10px 12px;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);background:var(--surface,#fff);display:flex;flex-direction:column;gap:6px;}' +
    '.etapes li{font-variant-numeric:tabular-nums;color:var(--ink,#241f1a);font-size:0.95rem;line-height:1.4;overflow-wrap:anywhere;transition:opacity .4s ease;}' +
    '.etapes li .n{display:inline-block;min-width:1.4em;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.etapes li.cache{opacity:0.28;}' +
    '.etapes li.final{font-weight:700;color:var(--good,#2f7a4f);}' +
    '.note{margin:0 0 14px;font-size:0.88rem;color:var(--ink-soft,#6b6055);line-height:1.45;text-align:center;}' +
    '.actions{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:0 0 14px;}' +
    '.btn{min-height:44px;padding:8px 16px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.92rem;font-family:inherit;}' +
    '.btn:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '.btn:focus-visible,.preset:focus-visible{outline:2px solid var(--accent,#a8471f);outline-offset:2px;}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-width:0;min-height:44px;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:40px;text-align:right;font-size:0.92rem;}' +
    '@media (prefers-reduced-motion: reduce){.petit,.contour,.etapes li{transition:none;}}' +
    '</style>' +
    '<p class="formule" id="formule"></p>' +
    '<div class="presets" id="presets"></div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + TAILLE + ' ' + TAILLE + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Carré complété d’al-Khwârizmî"></svg></div>' +
    '<div class="actions"><button class="btn" id="completer" type="button" aria-pressed="false">Compléter le carré</button></div>' +
    '<ol class="etapes" id="etapes"></ol>' +
    '<p class="note" id="note"></p>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="b">b (coefficient de x)</label><div class="curseur-row">' +
    '<input type="range" id="b" min="' + BORNES_B.min + '" max="' + BORNES_B.max + '" step="' + BORNES_B.step + '" value="' + DEFAUT.b + '">' +
    '<span class="curseur-valeur" id="b-valeur"></span></div></div>' +
    '<div class="curseur"><label for="c">c (second membre)</label><div class="curseur-row">' +
    '<input type="range" id="c" min="' + BORNES_C.min + '" max="' + BORNES_C.max + '" step="' + BORNES_C.step + '" value="' + DEFAUT.c + '">' +
    '<span class="curseur-valeur" id="c-valeur"></span></div></div>' +
    '</div>';

  class CompleterLeCarreWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._b = DEFAUT.b;
      this._c = DEFAUT.c;
      this._complete = false;
      this._svg = shadow.getElementById("svg");
      this._formule = shadow.getElementById("formule");
      this._etapes = shadow.getElementById("etapes");
      this._note = shadow.getElementById("note");
      this._inputB = shadow.getElementById("b");
      this._inputC = shadow.getElementById("c");
      this._valeurB = shadow.getElementById("b-valeur");
      this._valeurC = shadow.getElementById("c-valeur");
      this._btn = shadow.getElementById("completer");
      this._presets = shadow.getElementById("presets");
      var self = this;
      PRESETS.forEach(function (p) {
        var bt = document.createElement("button");
        bt.type = "button";
        bt.className = "preset";
        bt.textContent = p.label;
        bt.addEventListener("click", function () {
          self._b = p.b; self._c = p.c;
          self._inputB.value = String(p.b); self._inputC.value = String(p.c);
          self._complete = false;
          self._rendre();
        });
        self._presets.appendChild(bt);
      });
    }

    connectedCallback() {
      var self = this;
      this._onB = function () { self._b = parseFloat(self._inputB.value); self._complete = false; self._rendre(); };
      this._onC = function () { self._c = parseFloat(self._inputC.value); self._complete = false; self._rendre(); };
      this._onBtn = function () { self._complete = !self._complete; self._rendre(); };
      this._inputB.addEventListener("input", this._onB);
      this._inputC.addEventListener("input", this._onC);
      this._btn.addEventListener("click", this._onBtn);
      this._rendre();
    }

    disconnectedCallback() {
      this._inputB.removeEventListener("input", this._onB);
      this._inputC.removeEventListener("input", this._onC);
      this._btn.removeEventListener("click", this._onBtn);
    }

    _rendre() {
      var b = this._b, c = this._c;
      var m = b / 2;                 // moitié du coefficient : côté du petit carré
      var m2 = m * m;                // aire du petit carré
      var total = c + m2;            // aire du grand carré
      var rac = racineTexte(total);  // côté du grand carré : x + b/2
      var x = rac.r - m;             // racine positive
      var xNeg = -rac.r - m;         // racine négative (refusée par al-Khwârizmî)
      var complete = this._complete;

      this._valeurB.textContent = fr(b);
      this._valeurC.textContent = fr(c);
      this._formule.textContent = "x² + " + fr(b) + "x = " + fr(c);
      this._btn.textContent = complete ? "Retirer le petit carré" : "Compléter le carré";
      this._btn.setAttribute("aria-pressed", complete ? "true" : "false");
      var presetBtns = this._presets.querySelectorAll(".preset");
      for (var i = 0; i < PRESETS.length; i++) {
        presetBtns[i].setAttribute("aria-pressed", PRESETS[i].b === b && PRESETS[i].c === c ? "true" : "false");
      }

      // ---- figure ----
      var ns = "http://www.w3.org/2000/svg";
      var svg = this._svg;
      svg.innerHTML = "";
      var cote = TAILLE - 2 * MARGE;                 // côté du grand carré en pixels
      var k = cote / (x + m);                        // pixels par unité
      var px = x * k, pm = m * k;
      var x0 = MARGE, y0 = MARGE;
      svg.appendChild(svgEl(ns, "rect", { x: x0, y: y0, width: px.toFixed(2), height: px.toFixed(2), class: "carre-x" }));
      svg.appendChild(svgEl(ns, "rect", { x: (x0 + px).toFixed(2), y: y0, width: pm.toFixed(2), height: px.toFixed(2), class: "rect" }));
      svg.appendChild(svgEl(ns, "rect", { x: x0, y: (y0 + px).toFixed(2), width: px.toFixed(2), height: pm.toFixed(2), class: "rect" }));
      var petit = svgEl(ns, "rect", { x: (x0 + px).toFixed(2), y: (y0 + px).toFixed(2), width: pm.toFixed(2), height: pm.toFixed(2), class: "petit" + (complete ? " plein" : "") });
      svg.appendChild(petit);
      svg.appendChild(svgEl(ns, "rect", { x: x0, y: y0, width: cote.toFixed(2), height: cote.toFixed(2), class: "contour" + (complete ? " visible" : "") }));

      function texte(cls, xx, yy, t) {
        var e = svgEl(ns, "text", { x: xx.toFixed(2), y: yy.toFixed(2), class: cls });
        e.textContent = t;
        svg.appendChild(e);
      }
      // aires dans les pièces (seulement si la pièce est assez grande pour son étiquette)
      if (px > 34) texte("aire", x0 + px / 2, y0 + px / 2, "x²");
      var etiqRect = fr(m) + "x";
      if (pm > 30 && px > 30) {
        texte("aire", x0 + px + pm / 2, y0 + px / 2, etiqRect);
        texte("aire", x0 + px / 2, y0 + px + pm / 2, etiqRect);
      }
      if (pm > 26) texte("aire", x0 + px + pm / 2, y0 + px + pm / 2, complete ? fr(m2) : "?");
      // côtés
      texte("cote", x0 + px / 2, y0 - 12, "x");
      texte("cote", x0 + px + pm / 2, y0 - 12, fr(m));
      texte("cote", x0 - 13, y0 + px / 2, "x");
      texte("cote", x0 - 13, y0 + px + pm / 2, fr(m));

      // ---- étapes ----
      var etapes = [
        { t: "x² + " + fr(b) + "x = " + fr(c), visible: true },
        { t: "On coupe " + fr(b) + "x en deux rectangles : x² + 2 × " + fr(m) + "x = " + fr(c), visible: true },
        { t: "On ajoute le petit carré de côté " + fr(m) + " : x² + " + fr(b) + "x + " + fr(m2) + " = " + fr(c) + " + " + fr(m2), visible: complete },
        { t: "Le grand carré : (x + " + fr(m) + ")² = " + fr(total), visible: complete },
        { t: "Son côté : x + " + fr(m) + " = √" + fr(total) + " " + rac.egal + " " + rac.valeur, visible: complete },
        { t: "x " + (rac.exacte ? "= " : "≈ ") + rac.valeur + " − " + fr(m) + " " + (rac.exacte ? "= " : "≈ ") + fr(x), visible: complete, final: true },
      ];
      this._etapes.innerHTML = "";
      var self = this;
      etapes.forEach(function (e, idx) {
        var li = document.createElement("li");
        if (!e.visible) li.className = "cache";
        else if (e.final) li.className = "final";
        var n = document.createElement("span");
        n.className = "n";
        n.textContent = (idx + 1) + ".";
        li.appendChild(n);
        li.appendChild(document.createTextNode(" " + e.t));
        if (!e.visible) li.setAttribute("aria-hidden", "true");
        self._etapes.appendChild(li);
      });

      this._note.textContent = complete
        ? "Al-Khwârizmî ne gardait que la solution positive : x est la longueur d’un côté. L’équation a aussi une solution négative : x + " +
          fr(m) + " = −" + rac.valeur + " donne x " + (rac.exacte ? "= " : "≈ ") + fr(xNeg) + "."
        : "Il manque un petit carré dans le coin pour obtenir un grand carré. Appuie sur « Compléter le carré ».";
    }
  }

  if (!customElements.get("completer-le-carre-widget")) {
    customElements.define("completer-le-carre-widget", CompleterLeCarreWidget);
  }
})();
