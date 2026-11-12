(function () {
  "use strict";

  /* ================================================================
   * <fiabilite-montage-widget> — atelier « Fiabilité d'un montage » (6e,
   * chapitre 6 « Les probabilités », section 4). 2 à 4 composants qui
   * tombent en panne indépendamment, chacun avec sa probabilité de
   * fonctionner. Montages : tout en série, tout en parallèle, mixte
   * « (C1 ∥ C2) puis C3 » et mixte « (C1 ∥ C2) puis (C3 ∥ C4) ».
   * Un montage = une suite d'ÉTAGES en série ; chaque étage = des composants
   * en parallèle. P(étage) = 1 − produit des probabilités de panne ;
   * P(montage) = produit des P(étage).
   * Réglage par défaut : 0,9 et 0,8 (série 0,72 ; parallèle 0,98 — exemple
   * du cours). Tirage d'un appareil et simulation de 1 000 appareils.
   * ================================================================ */

  var VB_L = 440;
  var DEFAUTS = [0.9, 0.8, 0.85, 0.7];
  var MONTAGES = {
    serie: { libelle: "Tout en série" },
    parallele: { libelle: "Tout en parallèle" },
    mixte3: { libelle: "Mixte : (C₁ ∥ C₂) puis C₃", n: 3 },
    mixte4: { libelle: "Mixte : (C₁ ∥ C₂) puis (C₃ ∥ C₄)", n: 4 },
  };
  var INDICES = ["₁", "₂", "₃", "₄"];

  function fmt(x, d) { return x.toFixed(d).replace(".", ","); }
  /** Écriture courte d'une probabilité saisie au centième (0,9 ; 0,85). */
  function court(x) { return fmt(x, 2).replace(/0$/, "").replace(/,$/, ""); }
  /** Coupe une formule aux « = », « ≈ », « × » de niveau 0 (hors parenthèses et
   * crochets) : chaque morceau reste insécable, la ligne ne se brise qu'entre eux. */
  function morceauxInsecables(texte) {
    var html = "", courant = "", prof = 0;
    for (var i = 0; i < texte.length; i++) {
      var c = texte[i];
      if (c === "(" || c === "[") prof += 1;
      if (c === ")" || c === "]") prof -= 1;
      var sep = prof === 0 && c === " " && /^ (=|≈|×) /.test(texte.slice(i, i + 3));
      if (sep) {
        html += '<span class="nw">' + courant + "</span> " + texte[i + 1] + " ";
        courant = "";
        i += 2;
      } else courant += c;
    }
    return html + '<span class="nw">' + courant + "</span>";
  }
  function entierFr(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " "); }

  function svgEl(tag, attrs) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  function etages(montage, n) {
    if (montage === "serie") { var e = []; for (var i = 0; i < n; i++) e.push([i]); return e; }
    if (montage === "parallele") { var p = []; for (var j = 0; j < n; j++) p.push(j); return [p]; }
    if (montage === "mixte3") return [[0, 1], [2]];
    return [[0, 1], [2, 3]];
  }

  function probaEtage(etage, ps) {
    var panne = 1;
    etage.forEach(function (i) { panne *= 1 - ps[i]; });
    return 1 - panne;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    "<style>" +
    ":host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}" +
    "*{box-sizing:border-box;}" +
    "[hidden]{display:none!important;}" +
    ".haut{display:flex;flex-wrap:wrap;gap:10px 16px;align-items:center;margin:0 0 12px;font-size:0.88rem;}" +
    ".haut label{font-weight:600;}" +
    "select{font:inherit;font-size:0.88rem;padding:5px 8px;border:1px solid var(--line,#ddd2c0);border-radius:var(--radius,3px);background:var(--surface,#fffdf9);color:var(--ink,#241f1a);max-width:100%;}" +
    ".figure{display:flex;justify-content:center;margin:0 0 10px;}" +
    ".figure svg{width:100%;max-width:440px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}" +
    ".fil{stroke:var(--ink-soft,#6b6055);stroke-width:1.8;fill:none;}" +
    ".noeud{fill:var(--ink-soft,#6b6055);}" +
    ".boite{fill:var(--plan-soft,#e9e5f5);stroke:var(--plan,#5b4ea3);stroke-width:1.6;}" +
    ".boite.ok{fill:var(--good-soft,#e2f0e7);stroke:var(--good,#2f7a4f);stroke-width:2.6;}" +
    ".boite.ko{fill:var(--bad-soft,#f8e2e0);stroke:var(--bad,#a8322f);stroke-width:2.6;stroke-dasharray:5 3;}" +
    ".nom{font-family:var(--serif,serif);font-style:italic;font-size:15px;font-weight:600;text-anchor:middle;fill:var(--plan-ink,#463c86);}" +
    ".val{font-family:var(--mono,monospace);font-size:12.5px;text-anchor:middle;fill:var(--ink-soft,#6b6055);}" +
    ".borne{font-family:var(--sans,sans-serif);font-size:11px;font-weight:600;fill:var(--ink-soft,#6b6055);}" +
    ".formule{text-align:center;font-family:var(--serif,serif);font-size:0.96rem;line-height:1.6;margin:0 0 4px;}" +
    ".formule.calcul{font-variant-numeric:tabular-nums;}" +
    ".nw{white-space:nowrap;}" +
    ".resultat{text-align:center;font-weight:700;font-size:1rem;color:var(--accent-ink,#7a3212);margin:4px 0 12px;font-variant-numeric:tabular-nums;}" +
    ".curseurs{display:flex;flex-direction:column;gap:8px;margin:0 0 12px;}" +
    ".curseur{display:flex;align-items:center;gap:10px;font-size:0.88rem;}" +
    ".curseur label{flex:0 0 150px;font-weight:600;}" +
    ".curseur input{flex:1 1 auto;accent-color:var(--accent,#a8471f);min-width:0;}" +
    ".curseur span{min-width:42px;text-align:right;font-variant-numeric:tabular-nums;font-weight:600;}" +
    "@media (max-width:480px){.curseur label{flex-basis:118px;font-size:0.82rem;}}" +
    ".boutons{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:0 0 10px;}" +
    "button{font:inherit;font-size:0.86rem;padding:6px 12px;border-radius:var(--radius,3px);border:1px solid var(--line,#ddd2c0);background:var(--surface,#fffdf9);color:var(--ink,#241f1a);cursor:pointer;min-height:36px;}" +
    "button:hover{border-color:var(--accent,#a8471f);}" +
    "button:focus-visible{outline:2px solid var(--accent,#a8471f);outline-offset:2px;}" +
    "button.principal{background:var(--accent,#a8471f);border-color:var(--accent,#a8471f);color:var(--surface,#fffdf9);font-weight:600;}" +
    ".verdict{text-align:center;font-size:0.9rem;font-weight:600;margin:0 0 8px;min-height:1.3em;}" +
    ".verdict.ok{color:var(--good,#2f7a4f);}" +
    ".verdict.ko{color:var(--bad,#a8322f);}" +
    ".sim{text-align:center;font-size:0.88rem;font-variant-numeric:tabular-nums;color:var(--ink-soft,#6b6055);margin:0;}" +
    "</style>" +
    '<div class="haut">' +
    '<span><label for="montage">montage</label> <select id="montage">' +
    '<option value="serie">' + MONTAGES.serie.libelle + "</option>" +
    '<option value="parallele">' + MONTAGES.parallele.libelle + "</option>" +
    '<option value="mixte3">' + MONTAGES.mixte3.libelle + "</option>" +
    '<option value="mixte4">' + MONTAGES.mixte4.libelle + "</option>" +
    "</select></span>" +
    "</div>" +
    '<div class="figure"><svg id="svg" viewBox="0 0 ' + VB_L + ' 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Schéma du montage, de l\'entrée à la sortie"></svg></div>' +
    '<p class="formule" id="formule"></p>' +
    '<p class="formule calcul" id="calcul"></p>' +
    '<p class="resultat" id="resultat"></p>' +
    '<div class="curseurs">' +
    '<div class="curseur" id="ligne-n"><label for="n">nombre de composants</label><input type="range" id="n" min="2" max="4" step="1" value="2"><span id="n-v"></span></div>' +
    [0, 1, 2, 3].map(function (i) {
      return '<div class="curseur" id="ligne-p' + i + '"><label for="p' + i + '">P(C' + INDICES[i] + " fonctionne)</label>" +
        '<input type="range" id="p' + i + '" min="0.5" max="0.99" step="0.01" value="' + DEFAUTS[i] + '"><span id="p' + i + '-v"></span></div>';
    }).join("") +
    "</div>" +
    '<div class="boutons">' +
    '<button type="button" id="tirer">Tirer un appareil au hasard</button>' +
    '<button type="button" class="principal" id="simuler">Simuler 1 000 appareils</button>' +
    "</div>" +
    '<p class="verdict" id="verdict" aria-live="polite"></p>' +
    '<p class="sim" id="sim" aria-live="polite"></p>';

  class FiabiliteMontageWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._s = shadow;
      this._etat = null; // état du dernier appareil tiré (tableau de booléens) ou null
    }

    connectedCallback() {
      if (this._pret) return;
      this._pret = true;
      var self = this, s = this._s;
      var effacer = function () { self._etat = null; s.getElementById("verdict").textContent = ""; s.getElementById("sim").textContent = ""; self._rendre(); };
      s.getElementById("montage").addEventListener("change", effacer);
      ["n", "p0", "p1", "p2", "p3"].forEach(function (id) { s.getElementById(id).addEventListener("input", effacer); });
      s.getElementById("tirer").addEventListener("click", function () { self._tirer(); });
      s.getElementById("simuler").addEventListener("click", function () { self._simuler(); });
      this._rendre();
    }

    _montage() { return this._s.getElementById("montage").value; }
    _nombre() {
      var m = MONTAGES[this._montage()];
      return m.n || parseInt(this._s.getElementById("n").value, 10);
    }
    _ps() {
      var s = this._s, ps = [];
      for (var i = 0; i < 4; i++) ps.push(Math.round(parseFloat(s.getElementById("p" + i).value) * 100) / 100);
      return ps;
    }

    _rendre() {
      var s = this._s, montage = this._montage(), n = this._nombre(), ps = this._ps();
      s.getElementById("ligne-n").hidden = !!MONTAGES[montage].n;
      s.getElementById("n-v").textContent = String(n);
      for (var i = 0; i < 4; i++) {
        s.getElementById("ligne-p" + i).hidden = i >= n;
        s.getElementById("p" + i + "-v").textContent = fmt(ps[i], 2);
      }
      var et = etages(montage, n);
      var P = 1;
      et.forEach(function (e) { P *= probaEtage(e, ps); });
      s.getElementById("formule").innerHTML = morceauxInsecables("P(fonctionne) = " + this._symbolique(et));
      s.getElementById("calcul").innerHTML = morceauxInsecables(this._numerique(et, ps, P));
      var arrondi = Math.round(P * 1e4) / 1e4;
      s.getElementById("resultat").textContent = "P(fonctionne) " + (Math.abs(arrondi - P) < 1e-12 ? "= " : "≈ ") + fmt(arrondi, 4);
      this._dessiner(et, ps);
    }

    _symbolique(et) {
      var morceaux = et.map(function (e) {
        if (e.length === 1) return "p" + INDICES[e[0]];
        var inner = "1 − " + e.map(function (i) { return "(1 − p" + INDICES[i] + ")"; }).join("");
        return et.length === 1 ? inner : "[" + inner + "]";
      });
      return morceaux.join(" × ");
    }

    _numerique(et, ps, P) {
      var morceaux = et.map(function (e) {
        if (e.length === 1) return court(ps[e[0]]);
        var inner = "1 − " + e.map(function (i) { return court(Math.round((1 - ps[i]) * 100) / 100); }).join(" × ");
        return et.length === 1 ? inner : "(" + inner + ")";
      });
      var ligne = "= " + morceaux.join(" × ");
      var aDesEtagesParalleles = et.some(function (e) { return e.length > 1; });
      if (aDesEtagesParalleles && et.length > 1) {
        // Étape intermédiaire : chaque étage parallèle évalué.
        ligne += " = " + et.map(function (e) {
          var v = probaEtage(e, ps);
          var a = Math.round(v * 1e4) / 1e4;
          return fmt(a, 4).replace(/0+$/, "").replace(/,$/, "");
        }).join(" × ");
      }
      var arrondi = Math.round(P * 1e4) / 1e4;
      return ligne + (Math.abs(arrondi - P) < 1e-12 ? " = " : " ≈ ") + fmt(arrondi, 4).replace(/0+$/, "").replace(/,$/, "");
    }

    _dessiner(et, ps) {
      var svg = this._s.getElementById("svg"), etat = this._etat;
      svg.innerHTML = "";
      // Hauteur du schéma selon la plus grande colonne de composants en parallèle
      // (le montage choisi, jamais les curseurs de probabilité).
      var BL = 72, BH = 46, PAS = 58;
      var maxPile = Math.max.apply(null, et.map(function (e) { return e.length; }));
      var VB_H = Math.max(110, maxPile * PAS + 26);
      svg.setAttribute("viewBox", "0 0 " + VB_L + " " + VB_H);
      var yMil = VB_H / 2, xE = 46, xS = VB_L - 46;
      var bE = svgEl("text", { x: 6, y: yMil - 8, class: "borne" }); bE.textContent = "entrée"; svg.appendChild(bE);
      var bS = svgEl("text", { x: VB_L - 6, y: yMil - 8, "text-anchor": "end", class: "borne" }); bS.textContent = "sortie"; svg.appendChild(bS);
      svg.appendChild(svgEl("circle", { cx: 8, cy: yMil, r: 3.5, class: "noeud" }));
      svg.appendChild(svgEl("circle", { cx: VB_L - 8, cy: yMil, r: 3.5, class: "noeud" }));
      var largeur = (xS - xE) / et.length;
      var xCourant = 8;
      et.forEach(function (e, k) {
        var x0 = xE + k * largeur, x1 = x0 + largeur, xc = (x0 + x1) / 2;
        var parallele = e.length > 1;
        var gauche = parallele ? x0 + 8 : xc - BL / 2;
        var droite = parallele ? x1 - 8 : xc + BL / 2;
        svg.appendChild(svgEl("line", { x1: xCourant, y1: yMil, x2: gauche, y2: yMil, class: "fil" }));
        var pas = PAS;
        e.forEach(function (i, r) {
          var y = parallele ? yMil + (r - (e.length - 1) / 2) * pas : yMil;
          if (parallele) {
            svg.appendChild(svgEl("polyline", { points: gauche + "," + yMil + " " + gauche + "," + y.toFixed(1) + " " + (xc - BL / 2) + "," + y.toFixed(1), class: "fil" }));
            svg.appendChild(svgEl("polyline", { points: (xc + BL / 2) + "," + y.toFixed(1) + " " + droite + "," + y.toFixed(1) + " " + droite + "," + yMil, class: "fil" }));
          }
          var classe = "boite" + (etat ? (etat[i] ? " ok" : " ko") : "");
          svg.appendChild(svgEl("rect", { x: xc - BL / 2, y: (y - BH / 2).toFixed(1), width: BL, height: BH, rx: 4, class: classe }));
          var nom = svgEl("text", { x: xc, y: (y - 4).toFixed(1), class: "nom" });
          nom.textContent = "C" + INDICES[i];
          svg.appendChild(nom);
          var val = svgEl("text", { x: xc, y: (y + 15).toFixed(1), class: "val" });
          val.textContent = fmt(ps[i], 2);
          svg.appendChild(val);
        });
        if (parallele) {
          svg.appendChild(svgEl("circle", { cx: gauche, cy: yMil, r: 3, class: "noeud" }));
          svg.appendChild(svgEl("circle", { cx: droite, cy: yMil, r: 3, class: "noeud" }));
        }
        xCourant = droite;
      });
      svg.appendChild(svgEl("line", { x1: xCourant, y1: yMil, x2: VB_L - 8, y2: yMil, class: "fil" }));
    }

    _tirerEtat(n, ps) {
      var etat = [];
      for (var i = 0; i < n; i++) etat.push(Math.random() < ps[i]);
      return etat;
    }

    _fonctionne(et, etat) {
      return et.every(function (e) { return e.some(function (i) { return etat[i]; }); });
    }

    _tirer() {
      var montage = this._montage(), n = this._nombre(), ps = this._ps(), et = etages(montage, n);
      this._etat = this._tirerEtat(n, ps);
      var ok = this._fonctionne(et, this._etat);
      var enPanne = [];
      for (var i = 0; i < n; i++) if (!this._etat[i]) enPanne.push("C" + INDICES[i]);
      var v = this._s.getElementById("verdict");
      v.className = "verdict " + (ok ? "ok" : "ko");
      v.textContent = (enPanne.length === 0 ? "Aucun composant en panne" :
        (enPanne.length === 1 ? enPanne[0] + " est en panne" : enPanne.join(", ") + " sont en panne")) +
        " : l'appareil " + (ok ? "fonctionne." : "ne fonctionne pas.");
      this._rendre();
    }

    _simuler() {
      var montage = this._montage(), n = this._nombre(), ps = this._ps(), et = etages(montage, n), N = 1000, ok = 0;
      for (var k = 0; k < N; k++) if (this._fonctionne(et, this._tirerEtat(n, ps))) ok += 1;
      var P = 1;
      et.forEach(function (e) { P *= probaEtage(e, ps); });
      this._s.getElementById("sim").textContent = "Sur 1 000 appareils simulés : " + entierFr(ok) + " fonctionnent, fréquence " +
        fmt(ok / N, 3) + " (probabilité " + fmt(Math.round(P * 1e4) / 1e4, 4) + ").";
    }
  }

  if (!customElements.get("fiabilite-montage-widget")) {
    customElements.define("fiabilite-montage-widget", FiabiliteMontageWidget);
  }
})();
