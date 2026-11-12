(function () {
  "use strict";

  /* ================================================================
   * <f-fprime-fseconde-widget> — atelier interactif (5e, ch. 5, § 4 et
   * § 6) : trois graphes EMPILÉS — f, f′, f″ — sur le même axe des x,
   * reliés par un même curseur x (repère vertical commun).
   *  - sur f : point courant + tangente (couleur de f′, pour relier la
   *    pente de la tangente à la HAUTEUR du point sur f′) ; courbe colorée
   *    selon la concavité (∪ vert = convexe, ∩ orange = concave) ;
   *    extremums et points d'inflexion marqués ;
   *  - sur f′ : point courant (hauteur = pente) et zéros ;
   *  - sur f″ : signe et concavité affichés.
   * Modes : les trois graphes / « devine f′ » (f′ masqué, révélé par un
   * bouton) / « lecture inverse » (seul f′ est montré, f et f″ se
   * révèlent). Fenêtres FIXES par fonction, jamais recalculées depuis
   * le curseur. Figure seule dans son conteneur (épinglage automatique).
   * Web Component (Shadow DOM).
   * ================================================================ */

  var R3 = Math.sqrt(3);
  var R2 = Math.SQRT2;

  var FONCTIONS = {
    cubique: {
      label: "f(x) = x³ − 3x",
      f: function (x) { return x * x * x - 3 * x; },
      fp: function (x) { return 3 * x * x - 3; },
      fpp: function (x) { return 6 * x; },
      xMin: -2.2, xMax: 2.2, yf: [-4.6, 4.6], yfp: [-4.5, 12.5], yfpp: [-14, 14],
      extremums: [{ x: -1, type: "max" }, { x: 1, type: "min" }],
      inflexions: [0], critiquesSansExtremum: [], defautX: 0.5,
    },
    cubique2: {
      label: "f(x) = x³ − 3x² − 3x + 1",
      f: function (x) { return x * x * x - 3 * x * x - 3 * x + 1; },
      fp: function (x) { return 3 * x * x - 6 * x - 3; },
      fpp: function (x) { return 6 * x - 6; },
      xMin: -1.6, xMax: 3.6, yf: [-11, 4], yfp: [-7.5, 15], yfpp: [-16, 16],
      extremums: [{ x: 1 - R2, type: "max" }, { x: 1 + R2, type: "min" }],
      inflexions: [1], critiquesSansExtremum: [], defautX: 0,
    },
    palier: {
      label: "f(x) = x³ + 2",
      f: function (x) { return x * x * x + 2; },
      fp: function (x) { return 3 * x * x; },
      fpp: function (x) { return 6 * x; },
      xMin: -1.8, xMax: 1.8, yf: [-4.5, 8.5], yfp: [-1.8, 10.5], yfpp: [-11.5, 11.5],
      extremums: [],
      inflexions: [0], critiquesSansExtremum: [0], defautX: -0.8,
    },
    quartique: {
      label: "f(x) = x⁴ − 2x²",
      f: function (x) { return x * x * x * x - 2 * x * x; },
      fp: function (x) { return 4 * x * x * x - 4 * x; },
      fpp: function (x) { return 12 * x * x - 4; },
      xMin: -1.6, xMax: 1.6, yf: [-1.5, 2], yfp: [-11, 11], yfpp: [-6, 28],
      extremums: [{ x: -1, type: "min" }, { x: 0, type: "max" }, { x: 1, type: "min" }],
      inflexions: [-1 / R3, 1 / R3], critiquesSansExtremum: [], defautX: 0.3,
    },
  };

  var LARGEUR = 300, HAUT_PANNEAU = 120, ECART = 12, MARGE_EXT = 6;
  var HAUTEUR = MARGE_EXT * 2 + HAUT_PANNEAU * 3 + ECART * 2;
  var M_G = 30, M_D = 10, M_H = 10, M_B = 10;

  function formatNombreFr(n, decimales) {
    var facteur = Math.pow(10, decimales);
    var arrondi = Math.round(n * facteur) / facteur;
    if (Object.is(arrondi, -0)) arrondi = 0;
    return arrondi.toFixed(decimales).replace(".", ",").replace("-", "−");
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
    '.formule{text-align:center;font-size:0.9rem;color:var(--ink,#241f1a);margin:0 0 10px;font-weight:600;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:10px;}' +
    'svg{width:100%;max-width:330px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.cadre{fill:none;stroke:var(--line,#d9cfc2);stroke-width:1;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.2;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.graduation{stroke:var(--ink-soft,#6b6055);stroke-width:1;}' +
    '.grad-txt{font-size:8.5px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.nom{font-size:13px;font-style:italic;font-weight:700;fill:var(--ink,#241f1a);font-family:var(--serif,serif);}' +
    '.convexe{stroke:var(--good,#2f7a4f);stroke-width:2.4;fill:none;}' +
    '.concave{stroke:var(--accent,#a8471f);stroke-width:2.4;fill:none;}' +
    '.courbe-fp{stroke:var(--plan,#5b4ea3);stroke-width:2.2;fill:none;}' +
    '.courbe-fpp{stroke:var(--ink-soft,#6b6055);stroke-width:2;fill:none;}' +
    '.tangente{stroke:var(--plan,#5b4ea3);stroke-width:1.6;fill:none;}' +
    '.repere{stroke:var(--ink-soft,#6b6055);stroke-width:1;stroke-dasharray:3 3;}' +
    '.pt{stroke:var(--surface,#fff);stroke-width:1.2;}' +
    '.pt-f{fill:var(--ink,#241f1a);}' +
    '.pt-fp{fill:var(--plan,#5b4ea3);}' +
    '.pt-fpp{fill:var(--ink-soft,#6b6055);}' +
    '.marque-ext{fill:var(--bad,#b23a3a);}' +
    '.marque-pi{fill:var(--plan,#5b4ea3);}' +
    '.marque-zero{fill:var(--surface,#fff);stroke:var(--plan,#5b4ea3);stroke-width:1.6;}' +
    '.marque-zero2{fill:var(--surface,#fff);stroke:var(--ink-soft,#6b6055);stroke-width:1.6;}' +
    '.etq{font-size:9px;font-weight:700;font-family:var(--sans,sans-serif);paint-order:stroke;stroke:var(--surface-2,#faf6f0);stroke-width:3px;}' +
    '.etq-ext{fill:var(--bad,#b23a3a);}' +
    '.etq-pi{fill:var(--plan,#5b4ea3);}' +
    '.etq-fp{fill:var(--plan,#5b4ea3);}' +
    '.etq-conv{fill:var(--good,#2f7a4f);}' +
    '.etq-conc{fill:var(--accent,#a8471f);}' +
    '.etq-neutre{fill:var(--ink-soft,#6b6055);}' +
    '.masque{fill:var(--surface,#fff);opacity:0.55;stroke:var(--ink-soft,#6b6055);stroke-dasharray:5 4;stroke-width:1;}' +
    '.masque-txt{font-size:11px;font-style:italic;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.lecture{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-bottom:10px;font-size:0.8rem;font-variant-numeric:tabular-nums;}' +
    '.chip{padding:5px 8px;border-radius:var(--radius,3px);background:var(--surface-2,#faf6f0);font-weight:600;color:var(--ink,#241f1a);}' +
    '.chip-fp{color:var(--plan,#5b4ea3);}' +
    '.chip-conv{color:var(--good,#2f7a4f);}' +
    '.chip-conc{color:var(--accent-ink,#7a3212);}' +
    '.consigne{text-align:center;font-size:0.82rem;color:var(--ink-soft,#6b6055);margin:0 0 12px;font-style:italic;}' +
    '.controles{display:flex;flex-direction:column;gap:10px;}' +
    '.ligne{display:flex;flex-wrap:wrap;gap:8px;align-items:center;}' +
    '.ligne label{font-weight:600;font-size:0.86rem;color:var(--ink,#241f1a);}' +
    'select{min-height:44px;flex:1 1 160px;padding:6px 8px;border-radius:var(--radius,3px);border:1px solid var(--line,#d9cfc2);background:var(--surface,#fff);color:var(--ink,#241f1a);font:inherit;font-size:0.88rem;}' +
    '.curseur{display:flex;flex-direction:column;gap:4px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-height:44px;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:52px;text-align:right;font-size:0.9rem;}' +
    '.btn{min-height:44px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;}' +
    '.btn:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '.btn[hidden]{display:none;}' +
    '.boutons{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;}' +
    '</style>' +
    '<p class="formule" id="formule"></p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Graphes de f, f′ et f″ empilés"></svg></div>' +
    '<div class="lecture" id="lecture"></div>' +
    '<p class="consigne" id="consigne"></p>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="x">x — position commune aux trois graphes</label><div class="curseur-row">' +
    '<input type="range" id="x" step="0.01">' +
    '<span class="curseur-valeur" id="x-valeur"></span></div></div>' +
    '<div class="ligne"><label for="fonction">Fonction</label><select id="fonction">' +
    '<option value="cubique">x³ − 3x (exemple du cours)</option>' +
    '<option value="cubique2">x³ − 3x² − 3x + 1</option>' +
    '<option value="palier">x³ + 2 (point critique sans extremum)</option>' +
    '<option value="quartique">x⁴ − 2x²</option>' +
    '</select></div>' +
    '<div class="ligne"><label for="mode">Mode</label><select id="mode">' +
    '<option value="tous">Les trois graphes</option>' +
    '<option value="devine">Devine f′ (f′ masqué)</option>' +
    '<option value="inverse">Lecture inverse : de f′ vers f</option>' +
    '</select></div>' +
    '<div class="boutons"><button class="btn" id="reveler" type="button" hidden></button>' +
    '<button class="btn" id="reset" type="button">Réinitialiser</button></div>' +
    '</div>';

  class FFprimeFsecondeWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._cle = "cubique";
      this._mode = "tous";
      this._revele = false;
      this._x = FONCTIONS.cubique.defautX;
      this._svg = shadow.getElementById("svg");
      this._formule = shadow.getElementById("formule");
      this._lecture = shadow.getElementById("lecture");
      this._consigne = shadow.getElementById("consigne");
      this._inputX = shadow.getElementById("x");
      this._valeurX = shadow.getElementById("x-valeur");
      this._selFonction = shadow.getElementById("fonction");
      this._selMode = shadow.getElementById("mode");
      this._btnReveler = shadow.getElementById("reveler");
      this._btnReset = shadow.getElementById("reset");
    }

    connectedCallback() {
      var self = this;
      this._onX = function () { self._x = parseFloat(self._inputX.value); self._rendre(); };
      this._onFonction = function () { self._choisirFonction(self._selFonction.value); };
      this._onMode = function () { self._mode = self._selMode.value; self._revele = false; self._rendre(); };
      this._onReveler = function () { self._revele = !self._revele; self._rendre(); };
      this._onReset = function () {
        self._mode = "tous"; self._selMode.value = "tous"; self._revele = false;
        self._selFonction.value = "cubique"; self._choisirFonction("cubique");
      };
      this._inputX.addEventListener("input", this._onX);
      this._selFonction.addEventListener("change", this._onFonction);
      this._selMode.addEventListener("change", this._onMode);
      this._btnReveler.addEventListener("click", this._onReveler);
      this._btnReset.addEventListener("click", this._onReset);
      this._choisirFonction(this._cle);
    }

    disconnectedCallback() {
      this._inputX.removeEventListener("input", this._onX);
      this._selFonction.removeEventListener("change", this._onFonction);
      this._selMode.removeEventListener("change", this._onMode);
      this._btnReveler.removeEventListener("click", this._onReveler);
      this._btnReset.removeEventListener("click", this._onReset);
    }

    _choisirFonction(cle) {
      var F = FONCTIONS[cle];
      this._cle = cle;
      this._revele = false;
      this._x = F.defautX;
      this._inputX.min = String(F.xMin);
      this._inputX.max = String(F.xMax);
      this._inputX.value = String(F.defautX);
      this._rendre();
    }

    /* Panneau i (0 = f, 1 = f′, 2 = f″) : conversion maths → pixels. */
    _px(x) {
      var F = FONCTIONS[this._cle];
      return M_G + (x - F.xMin) / (F.xMax - F.xMin) * (LARGEUR - M_G - M_D);
    }

    _haut(i) { return MARGE_EXT + i * (HAUT_PANNEAU + ECART); }

    _py(i, y, plage) {
      var h = this._haut(i);
      return h + HAUT_PANNEAU - M_B - (y - plage[0]) / (plage[1] - plage[0]) * (HAUT_PANNEAU - M_H - M_B);
    }

    _rendre() {
      var F = FONCTIONS[this._cle];
      var x = this._x;
      var ns = "http://www.w3.org/2000/svg";
      var svg = this._svg;
      var self = this;
      svg.innerHTML = "";
      this._valeurX.textContent = formatNombreFr(x, 2);
      this._formule.textContent = F.label;

      var masqueF = this._mode === "inverse" && !this._revele;
      var masqueFp = this._mode === "devine" && !this._revele;
      var masqueFpp = masqueF;

      var defs = svgEl(ns, "defs", {});
      var fleche = svgEl(ns, "marker", { id: "fleche", markerWidth: "7", markerHeight: "7", refX: "5", refY: "3.5", orient: "auto" });
      fleche.appendChild(svgEl(ns, "path", { d: "M0,0 L7,3.5 L0,7 Z", class: "fleche" }));
      defs.appendChild(fleche);
      var plages = [F.yf, F.yfp, F.yfpp];
      for (var i = 0; i < 3; i++) {
        var clip = svgEl(ns, "clipPath", { id: "clip" + i });
        clip.appendChild(svgEl(ns, "rect", { x: M_G, y: this._haut(i) + M_H - 4, width: LARGEUR - M_G - M_D, height: HAUT_PANNEAU - M_H - M_B + 8 }));
        defs.appendChild(clip);
      }
      svg.appendChild(defs);

      var noms = ["f", "f′", "f″"];
      for (var p = 0; p < 3; p++) {
        var h0 = this._haut(p);
        svg.appendChild(svgEl(ns, "rect", { x: 2, y: h0, width: LARGEUR - 4, height: HAUT_PANNEAU, rx: 3, class: "cadre" }));
        var nom = svgEl(ns, "text", { x: 8, y: h0 + 18, class: "nom" });
        nom.textContent = noms[p];
        svg.appendChild(nom);
        this._axes(svg, ns, p, plages[p], p === 2);
      }

      /* Repère vertical commun aux trois panneaux. */
      var xp = this._px(x);
      svg.appendChild(svgEl(ns, "line", { x1: xp.toFixed(2), x2: xp.toFixed(2), y1: this._haut(0) + 4, y2: this._haut(2) + HAUT_PANNEAU - 4, class: "repere" }));

      /* ---------- Panneau f ---------- */
      if (!masqueF) {
        var g0 = svgEl(ns, "g", { "clip-path": "url(#clip0)" });
        this._courbeConcavite(g0, ns, F);
        var m = F.fp(x), fx = F.f(x);
        var xa = F.xMin, xb = F.xMax;
        g0.appendChild(svgEl(ns, "line", {
          x1: this._px(xa).toFixed(2), y1: this._py(0, fx + m * (xa - x), F.yf).toFixed(2),
          x2: this._px(xb).toFixed(2), y2: this._py(0, fx + m * (xb - x), F.yf).toFixed(2), class: "tangente",
        }));
        svg.appendChild(g0);
        F.extremums.forEach(function (e) {
          self._marque(svg, ns, 0, e.x, F.f(e.x), F.yf, "marque-ext", e.type, "etq-ext");
        });
        F.inflexions.forEach(function (a) {
          var sans = F.critiquesSansExtremum.indexOf(a) >= 0;
          self._marque(svg, ns, 0, a, F.f(a), F.yf, "marque-pi", sans ? "PI, f′ = 0" : "PI", "etq-pi");
        });
        svg.appendChild(svgEl(ns, "circle", { cx: xp.toFixed(2), cy: this._py(0, fx, F.yf).toFixed(2), r: 4.2, class: "pt pt-f" }));
      } else {
        this._masque(svg, ns, 0, "Retrouve f à partir de f′");
      }

      /* ---------- Panneau f′ ---------- */
      if (!masqueFp) {
        var g1 = svgEl(ns, "g", { "clip-path": "url(#clip1)" });
        g1.appendChild(svgEl(ns, "path", { d: this._chemin(F.fp, 1, F.yfp), class: "courbe-fp" }));
        svg.appendChild(g1);
        this._zeros(F.fp, F).forEach(function (z) {
          svg.appendChild(svgEl(ns, "circle", { cx: self._px(z).toFixed(2), cy: self._py(1, 0, F.yfp).toFixed(2), r: 3.4, class: "marque-zero" }));
        });
        var yfp = F.fp(x);
        svg.appendChild(svgEl(ns, "circle", { cx: xp.toFixed(2), cy: this._py(1, yfp, F.yfp).toFixed(2), r: 4.2, class: "pt pt-fp" }));
        var etFp = svgEl(ns, "text", { x: LARGEUR - M_D - 2, y: this._haut(1) + 18, "text-anchor": "end", class: "etq etq-fp" });
        etFp.textContent = "pente de la tangente = f′(x) = " + formatNombreFr(yfp, 2);
        svg.appendChild(etFp);
      } else {
        this._masque(svg, ns, 1, "À toi de l'esquisser");
      }

      /* ---------- Panneau f″ ---------- */
      var yfpp = F.fpp(x);
      if (!masqueFpp) {
        var g2 = svgEl(ns, "g", { "clip-path": "url(#clip2)" });
        g2.appendChild(svgEl(ns, "path", { d: this._chemin(F.fpp, 2, F.yfpp), class: "courbe-fpp" }));
        svg.appendChild(g2);
        F.inflexions.forEach(function (a) {
          svg.appendChild(svgEl(ns, "circle", { cx: self._px(a).toFixed(2), cy: self._py(2, 0, F.yfpp).toFixed(2), r: 3.4, class: "marque-zero2" }));
        });
        svg.appendChild(svgEl(ns, "circle", { cx: xp.toFixed(2), cy: this._py(2, yfpp, F.yfpp).toFixed(2), r: 4.2, class: "pt pt-fpp" }));
        var etFpp = svgEl(ns, "text", { x: LARGEUR - M_D - 2, y: this._haut(2) + 18, "text-anchor": "end", class: "etq " + this._classeConcavite(yfpp) });
        etFpp.textContent = this._texteConcavite(yfpp);
        svg.appendChild(etFpp);
      } else {
        this._masque(svg, ns, 2, "f″ se révèle avec f");
      }

      this._majTextes(F, x, masqueF, masqueFp);
    }

    _classeConcavite(v) {
      if (Math.abs(v) < 0.05) return "etq-neutre";
      return v > 0 ? "etq-conv" : "etq-conc";
    }

    _texteConcavite(v) {
      if (Math.abs(v) < 0.05) return "f″(x) = 0 : changement de concavité possible";
      return v > 0 ? "f″(x) > 0 : convexe ∪" : "f″(x) < 0 : concave ∩";
    }

    _majTextes(F, x, masqueF, masqueFp) {
      var fx = F.f(x), fp = F.fp(x), fpp = F.fpp(x);
      var sens = Math.abs(fp) < 0.05 ? "tangente horizontale" : (fp > 0 ? "f croît" : "f décroît");
      var html = "";
      if (!masqueF) html += '<span class="chip">f(' + formatNombreFr(x, 2) + ') = ' + formatNombreFr(fx, 2) + "</span>";
      if (!masqueFp) html += '<span class="chip chip-fp">f′(x) = ' + formatNombreFr(fp, 2) + " : " + sens + "</span>";
      if (!masqueF) {
        var cc = Math.abs(fpp) < 0.05 ? "chip" : (fpp > 0 ? "chip chip-conv" : "chip chip-conc");
        var tc = Math.abs(fpp) < 0.05 ? "f″(x) = 0" : (fpp > 0 ? "f″(x) = " + formatNombreFr(fpp, 2) + " : convexe ∪" : "f″(x) = " + formatNombreFr(fpp, 2) + " : concave ∩");
        html += '<span class="' + cc + '">' + tc + "</span>";
      }
      this._lecture.innerHTML = html;

      var btn = this._btnReveler;
      if (this._mode === "tous") {
        btn.hidden = true;
        this._consigne.textContent = "Fais glisser x : la pente de la tangente (violet) est exactement la hauteur du point sur f′. Là où f′ change de signe, f a un extremum ; là où f″ change de signe, f a un point d'inflexion.";
      } else if (this._mode === "devine") {
        btn.hidden = false;
        btn.textContent = this._revele ? "Masquer f′" : "Révéler f′";
        this._consigne.textContent = this._revele
          ? "Compare avec ton esquisse : f′ est nulle aux extremums de f, positive là où f monte, négative là où elle descend."
          : "Observe la pente de la tangente en déplaçant x, puis esquisse f′ sur ta feuille : où est-elle nulle, positive, négative ?";
      } else {
        btn.hidden = false;
        btn.textContent = this._revele ? "Masquer f" : "Révéler f";
        this._consigne.textContent = this._revele
          ? "Vérifie : là où f′ > 0, f monte ; là où f′ s'annule en changeant de signe, f a un extremum."
          : "Seul f′ est montré. Lis son signe et ses zéros : où f monte-t-elle, descend-elle, où sont ses extremums ?";
      }
    }

    _axes(svg, ns, i, plage, avecEtiquettes) {
      var F = FONCTIONS[this._cle];
      var y0 = this._py(i, Math.min(Math.max(0, plage[0]), plage[1]), plage);
      svg.appendChild(svgEl(ns, "line", { x1: M_G - 2, x2: LARGEUR - M_D + 2, y1: y0.toFixed(2), y2: y0.toFixed(2), class: "axe", "marker-end": "url(#fleche)" }));
      var x0 = this._px(0);
      svg.appendChild(svgEl(ns, "line", { x1: x0.toFixed(2), x2: x0.toFixed(2), y1: this._haut(i) + HAUT_PANNEAU - 3, y2: this._haut(i) + 4, class: "axe", "marker-end": "url(#fleche)" }));
      for (var k = Math.ceil(F.xMin); k <= Math.floor(F.xMax); k++) {
        if (k === 0) continue;
        var xk = this._px(k);
        svg.appendChild(svgEl(ns, "line", { x1: xk.toFixed(2), x2: xk.toFixed(2), y1: (y0 - 3).toFixed(2), y2: (y0 + 3).toFixed(2), class: "graduation" }));
        if (avecEtiquettes || i === 0) {
          var t = svgEl(ns, "text", { x: xk.toFixed(2), y: (y0 + 12).toFixed(2), "text-anchor": "middle", class: "grad-txt" });
          t.textContent = formatNombreFr(k, 0);
          svg.appendChild(t);
        }
      }
    }

    _chemin(fn, i, plage) {
      var F = FONCTIONS[this._cle];
      var n = 180, d = "";
      for (var k = 0; k <= n; k++) {
        var xx = F.xMin + (k / n) * (F.xMax - F.xMin);
        d += (k === 0 ? "M" : "L") + this._px(xx).toFixed(2) + " " + this._py(i, fn(xx), plage).toFixed(2) + " ";
      }
      return d.trim();
    }

    /* Courbe de f découpée selon le signe de f″ (∪ vert, ∩ orange). */
    _courbeConcavite(g, ns, F) {
      var n = 220;
      var morceau = "", classe = null;
      var self = this;
      function fermer() { if (morceau) g.appendChild(svgEl(ns, "path", { d: morceau.trim(), class: classe })); }
      for (var k = 0; k < n; k++) {
        var xa = F.xMin + (k / n) * (F.xMax - F.xMin);
        var xb = F.xMin + ((k + 1) / n) * (F.xMax - F.xMin);
        var c = F.fpp((xa + xb) / 2) >= 0 ? "convexe" : "concave";
        if (c !== classe) {
          fermer();
          classe = c;
          morceau = "M" + self._px(xa).toFixed(2) + " " + self._py(0, F.f(xa), F.yf).toFixed(2) + " ";
        }
        morceau += "L" + self._px(xb).toFixed(2) + " " + self._py(0, F.f(xb), F.yf).toFixed(2) + " ";
      }
      fermer();
    }

    _marque(svg, ns, i, x, y, plage, classe, texte, classeTexte) {
      var cx = this._px(x), cy = this._py(i, y, plage);
      svg.appendChild(svgEl(ns, "circle", { cx: cx.toFixed(2), cy: cy.toFixed(2), r: 3.6, class: classe }));
      var haut = cy - this._haut(i) < 26;
      var t = svgEl(ns, "text", { x: cx.toFixed(2), y: (haut ? cy + 14 : cy - 7).toFixed(2), "text-anchor": "middle", class: "etq " + classeTexte });
      t.textContent = texte;
      svg.appendChild(t);
    }

    _zeros(fn, F) {
      var res = [];
      var n = 400, pas = (F.xMax - F.xMin) / n;
      var prev = fn(F.xMin);
      for (var k = 1; k <= n; k++) {
        var xx = F.xMin + k * pas;
        var v = fn(xx);
        if (Math.abs(v) < 1e-12) { res.push(xx); }
        else if (prev * v < 0) {
          var a = xx - pas, b = xx;
          for (var it = 0; it < 50; it++) { var m = (a + b) / 2; if (fn(a) * fn(m) <= 0) b = m; else a = m; }
          res.push((a + b) / 2);
        }
        prev = v;
      }
      /* Zéro sans changement de signe (x³ + 2 : f′ = 3x² touche 0 en 0). */
      F.critiquesSansExtremum.forEach(function (z) { if (res.indexOf(z) < 0) res.push(z); });
      return res;
    }

    _masque(svg, ns, i, texte) {
      var h0 = this._haut(i);
      svg.appendChild(svgEl(ns, "rect", { x: M_G, y: h0 + M_H - 2, width: LARGEUR - M_G - M_D, height: HAUT_PANNEAU - M_H - M_B + 4, rx: 4, class: "masque" }));
      var t = svgEl(ns, "text", { x: ((M_G + LARGEUR - M_D) / 2).toFixed(2), y: (h0 + 34).toFixed(2), "text-anchor": "middle", class: "masque-txt" });
      t.textContent = texte;
      svg.appendChild(t);
    }
  }

  if (!customElements.get("f-fprime-fseconde-widget")) {
    customElements.define("f-fprime-fseconde-widget", FFprimeFsecondeWidget);
  }
})();
