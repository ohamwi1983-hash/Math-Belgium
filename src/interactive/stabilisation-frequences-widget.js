(function () {
  "use strict";

  /* ================================================================
   * <stabilisation-frequences-widget> — atelier « La fréquence se
   * stabilise » (6e, chapitre 6 « Probabilités », section 1).
   *
   * On lance une pièce (« pile », p = 1/2), un dé (« obtenir 6 », p = 1/6) ou
   * un dé truqué dont la probabilité d'obtenir 6 est cachée (tirée au hasard
   * dans l'atelier). Boutons +10 / +100 / +1 000 lancers (jusqu'à 10 000 par
   * série), « Nouvelle série » (jusqu'à 5 séries superposées) : la fréquence
   * cumulée de chaque série oscille beaucoup au début puis se resserre autour
   * de la probabilité — les séries dessinent un entonnoir.
   *
   * Abscisse LOGARITHMIQUE fixe (1 à 10 000 lancers) : c'est la seule échelle
   * où le début (très agité) et la fin (très stable) sont lisibles ensemble.
   * Ordonnée fixe [0 ; 1].
   *
   * La bande grisée autour du modèle traduit la règle de 6gen75 : l'écart
   * relatif |f − p|/p est jugé significatif au-delà de 50 % (moins de 100
   * essais), 25 % (100 à 400), 18 % (401 à 1 000), 12 % (plus de 1 000).
   * ================================================================ */

  var NS = "http://www.w3.org/2000/svg";
  var W = 460, H = 300, MG = 44, MD = 16, MH = 16, MB = 38;
  var N_MAX = 10000, SERIES_MAX = 5;
  var CLASSES_SERIES = ["s0", "s1", "s2", "s3", "s4"];
  var PROBAS_TRUQUEES = [0.08, 0.1, 0.24, 0.27, 0.3, 0.33];

  var EXPERIENCES = {
    piece: { libelle: "lancer une pièce — « pile »", p: 0.5, pTexte: "1/2", modele: "pièce équilibrée : 1/2" },
    de: { libelle: "lancer un dé — « obtenir 6 »", p: 1 / 6, pTexte: "1/6", modele: "dé équilibré : 1/6" },
    truque: { libelle: "dé mystère — « obtenir 6 »", p: 1 / 6, pTexte: "1/6", modele: "si le dé était équilibré : 1/6" },
  };

  function seuilRelatif(n) { return n < 100 ? 0.5 : n <= 400 ? 0.25 : n <= 1000 ? 0.18 : 0.12; }

  function nombreFr(n, d) {
    var s = n.toFixed(d);
    if (d > 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
    var parts = s.split(".");
    if (parts[0].length > 3) parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return parts.join(",");
  }

  function svgEl(tag, attrs, texte) {
    var el = document.createElementNS(NS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    if (texte !== undefined) el.textContent = texte;
    return el;
  }

  var px = function (n) { return MG + Math.log10(n) / 4 * (W - MG - MD); };
  var py = function (f) { return MH + (1 - f) * (H - MH - MB); };

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    "<style>" +
    ":host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}" +
    "*{box-sizing:border-box;}" +
    "[hidden]{display:none!important;}" +
    ".figure{display:flex;justify-content:center;margin-bottom:10px;}" +
    ".figure svg{width:100%;max-width:460px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}" +
    ".grille{stroke:var(--line-soft,#ece4d6);stroke-width:1;}" +
    ".axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}" +
    ".fleche{fill:var(--ink-soft,#6b6055);}" +
    ".grad{font-size:10.5px;font-family:var(--mono,monospace);fill:var(--ink-soft,#6b6055);}" +
    ".titre-axe{font-size:11px;font-style:italic;font-family:var(--serif,serif);fill:var(--ink-soft,#6b6055);}" +
    ".bande{fill:var(--line,#ddd2c0);opacity:0.45;}" +
    ".modele{stroke:var(--ink,#241f1a);stroke-width:1.4;stroke-dasharray:6 4;}" +
    ".vraie{stroke:var(--bad,#a8322f);stroke-width:1.8;stroke-dasharray:2 3;}" +
    ".leg{font-size:11px;font-family:var(--sans,sans-serif);font-weight:600;fill:var(--ink,#241f1a);}" +
    ".leg-vraie{fill:var(--bad,#a8322f);}" +
    ".serie{fill:none;stroke-width:1.6;stroke-linejoin:round;opacity:0.75;}" +
    ".serie.der{stroke-width:2.4;opacity:1;}" +
    ".s0{stroke:var(--accent,#a8471f);}.s1{stroke:var(--good,#2f7a4f);}.s2{stroke:var(--plan,#5b4ea3);}.s3{stroke:var(--sky,#2f7fa8);}.s4{stroke:var(--rose,#b03a72);}" +
    ".bandeau{border-radius:var(--radius,3px);padding:8px 12px;margin:0 0 8px;font-size:0.9rem;line-height:1.5;text-align:center;font-variant-numeric:tabular-nums;}" +
    ".bandeau.ok{background:var(--good-soft,#e2f0e7);color:var(--good,#2f7a4f);}" +
    ".bandeau.alerte{background:var(--bad-soft,#f8e2e0);color:var(--bad,#a8322f);}" +
    ".bandeau.neutre{background:var(--surface-2,#faf6f0);color:var(--ink-soft,#6b6055);}" +
    ".bandeau strong{font-weight:700;}" +
    ".regle{text-align:center;font-size:0.8rem;color:var(--ink-soft,#6b6055);margin:0 0 12px;line-height:1.45;}" +
    ".controles{display:flex;flex-direction:column;gap:8px;}" +
    ".ligne{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:0.88rem;}" +
    ".ligne label{flex:0 0 96px;font-weight:600;}" +
    ".ligne select{flex:1 1 200px;min-width:0;font:inherit;padding:4px 6px;border:1px solid var(--line,#ddd2c0);border-radius:var(--radius,3px);background:var(--surface,#fffdf9);color:var(--ink,#241f1a);}" +
    "button{font:inherit;font-size:0.86rem;padding:6px 10px;border:1px solid var(--line,#ddd2c0);border-radius:var(--radius,3px);background:var(--surface,#fffdf9);color:var(--ink,#241f1a);cursor:pointer;}" +
    "button:hover:not(:disabled){border-color:var(--accent,#a8471f);}" +
    "button:disabled{opacity:0.45;cursor:default;}" +
    "button.principal{background:var(--accent,#a8471f);border-color:var(--accent,#a8471f);color:#fff;}" +
    ".boutons{display:flex;flex-wrap:wrap;gap:6px;}" +
    "@media (max-width:480px){.ligne label{flex-basis:100%;}}" +
    "</style>" +
    '<div class="figure"><svg id="svg" viewBox="0 0 ' + W + " " + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Fréquence cumulée en fonction du nombre de lancers"></svg></div>' +
    '<p class="bandeau neutre" id="bandeau"></p>' +
    '<p class="regle">Bande grisée : zone où l\'écart relatif |f − p|/p reste acceptable — 50 % sous 100 essais, 25 % de 100 à 400, 18 % de 401 à 1 000, 12 % au-delà.</p>' +
    '<div class="controles">' +
    '<div class="ligne"><label for="exp">expérience</label><select id="exp">' +
    Object.keys(EXPERIENCES).map(function (k) { return '<option value="' + k + '">' + EXPERIENCES[k].libelle + "</option>"; }).join("") +
    "</select></div>" +
    '<div class="ligne"><label>lancers</label><div class="boutons">' +
    '<button type="button" class="principal" data-ajout="10">+10</button>' +
    '<button type="button" class="principal" data-ajout="100">+100</button>' +
    '<button type="button" class="principal" data-ajout="1000">+1 000</button>' +
    '<button type="button" id="nouvelle">Nouvelle série</button>' +
    '<button type="button" id="effacer">Tout effacer</button>' +
    '<button type="button" id="demasquer" hidden>Démasquer le dé</button>' +
    "</div></div>" +
    "</div>";

  class StabilisationFrequencesWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._s = shadow;
    }

    connectedCallback() {
      if (this._pret) return;
      this._pret = true;
      var self = this, s = this._s;
      s.getElementById("exp").addEventListener("change", function () { self._reinitialiser(); });
      Array.prototype.forEach.call(s.querySelectorAll("[data-ajout]"), function (b) {
        b.addEventListener("click", function () { self._lancer(parseInt(b.getAttribute("data-ajout"), 10)); });
      });
      s.getElementById("nouvelle").addEventListener("click", function () { self._nouvelleSerie(); });
      s.getElementById("effacer").addEventListener("click", function () { self._reinitialiser(); });
      s.getElementById("demasquer").addEventListener("click", function () { self._demasque = true; self._rendre(); });
      this._reinitialiser();
      // État de départ non vide : une première série de 100 lancers.
      this._lancer(100);
    }

    _exp() { return EXPERIENCES[this._s.getElementById("exp").value]; }

    _reinitialiser() {
      var cle = this._s.getElementById("exp").value;
      this._pVraie = cle === "truque" ? PROBAS_TRUQUEES[Math.floor(Math.random() * PROBAS_TRUQUEES.length)] : this._exp().p;
      this._demasque = false;
      this._series = [];
      this._nouvelleSerie();
    }

    _nouvelleSerie() {
      if (this._series.length >= SERIES_MAX) return;
      // succes[n] = nombre de succès après n lancers (succes[0] = 0).
      this._series.push({ succes: new Uint16Array(N_MAX + 1), n: 0 });
      this._rendre();
    }

    _lancer(nb) {
      var serie = this._series[this._series.length - 1];
      var fin = Math.min(N_MAX, serie.n + nb), p = this._pVraie, c = serie.succes[serie.n];
      for (var i = serie.n + 1; i <= fin; i++) {
        if (Math.random() < p) c++;
        serie.succes[i] = c;
      }
      serie.n = fin;
      this._rendre();
    }

    _rendre() {
      var s = this._s, exp = this._exp(), cle = s.getElementById("exp").value;
      var serie = this._series[this._series.length - 1];
      var plein = serie.n >= N_MAX;
      Array.prototype.forEach.call(s.querySelectorAll("[data-ajout]"), function (b) { b.disabled = plein; });
      s.getElementById("nouvelle").disabled = this._series.length >= SERIES_MAX || serie.n === 0;
      var dem = s.getElementById("demasquer");
      dem.hidden = cle !== "truque";
      dem.disabled = this._demasque;
      this._bandeau(exp, cle, serie);
      this._dessiner(exp, cle);
    }

    _bandeau(exp, cle, serie) {
      var b = this._s.getElementById("bandeau");
      var nbS = this._series.length;
      var prefixe = nbS > 1 ? "Série " + nbS + " — " : "";
      if (serie.n === 0) {
        b.className = "bandeau neutre";
        b.textContent = prefixe + (cle === "piece" ? "Lance la pièce" : "Lance le dé") + " pour commencer la série.";
        return;
      }
      var f = serie.succes[serie.n] / serie.n, p = exp.p;
      var ecart = Math.abs(f - p) / p, seuil = seuilRelatif(serie.n);
      var significatif = ecart > seuil;
      var txt = prefixe + "<strong>" + nombreFr(serie.n, 0) + "</strong> lancers, " + nombreFr(serie.succes[serie.n], 0) +
        " succès : f ≈ <strong>" + nombreFr(f, 3) + "</strong> ; écart relatif à " + exp.pTexte + " : |f − p|/p ≈ " +
        nombreFr(ecart * 100, 1) + " % (seuil " + nombreFr(seuil * 100, 0) + " %). ";
      if (significatif) {
        txt += cle === "truque" ? "Écart significatif : ce dé n'est sans doute pas équilibré." : "Écart significatif : ce n'est pas impossible, mais rare — relance pour voir.";
      } else {
        txt += cle === "truque" ? "Pas d'écart significatif : rien ne prouve (encore) que le dé est truqué." : "Compatible avec le modèle.";
      }
      if (cle === "truque" && this._demasque) {
        txt += " La vraie probabilité d'obtenir 6 avec ce dé est " + nombreFr(this._pVraie, 2) + ".";
      }
      b.className = "bandeau " + (significatif ? "alerte" : "ok");
      b.innerHTML = txt;
    }

    _dessiner(exp, cle) {
      var svg = this._s.getElementById("svg");
      svg.innerHTML = "";
      var defs = svgEl("defs", {});
      var m = svgEl("marker", { id: "fl", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      m.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(m);
      svg.appendChild(defs);

      // Bande de tolérance (règle de 6gen75), par paliers.
      var p = exp.p;
      [[1, 100, 0.5], [100, 400, 0.25], [400, 1000, 0.18], [1000, N_MAX, 0.12]].forEach(function (t) {
        var haut = Math.min(1, p * (1 + t[2])), bas = Math.max(0, p * (1 - t[2]));
        svg.appendChild(svgEl("rect", { x: px(t[0]), y: py(haut), width: px(t[1]) - px(t[0]), height: py(bas) - py(haut), class: "bande" }));
      });

      // Grille et graduations.
      [1, 10, 100, 1000, 10000].forEach(function (n) {
        svg.appendChild(svgEl("line", { x1: px(n), x2: px(n), y1: py(0), y2: py(1), class: "grille" }));
        svg.appendChild(svgEl("text", { x: px(n), y: H - MB + 14, "text-anchor": n === N_MAX ? "end" : "middle", class: "grad" }, nombreFr(n, 0)));
      });
      [0, 0.25, 0.5, 0.75, 1].forEach(function (f) {
        svg.appendChild(svgEl("line", { x1: px(1), x2: px(N_MAX), y1: py(f), y2: py(f), class: "grille" }));
        svg.appendChild(svgEl("text", { x: MG - 6, y: py(f) + 3.5, "text-anchor": "end", class: "grad" }, nombreFr(f, 2)));
      });
      svg.appendChild(svgEl("line", { x1: px(1), x2: W - 4, y1: py(0), y2: py(0), class: "axe", "marker-end": "url(#fl)" }));
      svg.appendChild(svgEl("line", { x1: px(1), x2: px(1), y1: py(0), y2: 6, class: "axe", "marker-end": "url(#fl)" }));
      svg.appendChild(svgEl("text", { x: W - MD, y: H - 6, "text-anchor": "end", class: "titre-axe" }, "nombre de lancers (échelle logarithmique)"));
      svg.appendChild(svgEl("text", { x: px(1) + 6, y: MH - 2, class: "titre-axe" }, "fréquence"));

      // Modèle (et vraie valeur une fois le dé démasqué).
      svg.appendChild(svgEl("line", { x1: px(1), x2: px(N_MAX), y1: py(p), y2: py(p), class: "modele" }));
      var yLeg = p > 0.8 ? py(p) + 14 : py(p) - 6;
      svg.appendChild(svgEl("text", { x: px(N_MAX) - 4, y: yLeg, "text-anchor": "end", class: "leg" }, exp.modele));
      if (cle === "truque" && this._demasque) {
        var pv = this._pVraie;
        svg.appendChild(svgEl("line", { x1: px(1), x2: px(N_MAX), y1: py(pv), y2: py(pv), class: "vraie" }));
        var dessous = pv < p ? py(pv) + 14 : py(pv) - 6;
        if (Math.abs(py(pv) - py(p)) < 16) dessous = pv < p ? py(pv) + 14 : py(pv) - 18;
        svg.appendChild(svgEl("text", { x: px(1) + 8, y: dessous, class: "leg leg-vraie" }, "vraie probabilité : " + nombreFr(pv, 2)));
      }

      // Séries : points de plus en plus espacés quand n grandit (abscisse logarithmique).
      var der = this._series.length - 1;
      this._series.forEach(function (serie, i) {
        if (serie.n === 0) return;
        var d = "";
        for (var n = 1; n <= serie.n; n += Math.max(1, Math.floor(n / 150))) {
          d += (d ? "L" : "M") + px(n).toFixed(1) + " " + py(serie.succes[n] / n).toFixed(1) + " ";
        }
        d += "L" + px(serie.n).toFixed(1) + " " + py(serie.succes[serie.n] / serie.n).toFixed(1);
        svg.appendChild(svgEl("path", { d: d, class: "serie " + CLASSES_SERIES[i] + (i === der ? " der" : "") }));
      });
    }
  }

  if (!customElements.get("stabilisation-frequences-widget")) {
    customElements.define("stabilisation-frequences-widget", StabilisationFrequencesWidget);
  }
})();
