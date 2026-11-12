(function () {
  "use strict";

  /* ================================================================
   * <arbre-tirages-widget> — atelier « L'arbre des tirages » (6e,
   * chapitre 6 « Les probabilités », section 2). Urne réglable (rouges
   * 1–8, bleues 1–8), avec ou sans remise, 2 ou 3 tirages. L'arbre
   * pondéré se redessine : fraction sur chaque branche (forme non
   * réduite, qui garde la composition de l'urne lisible), probabilité de
   * chaque chemin au bout. On choisit un événement : ses chemins
   * s'allument et la somme de leurs probabilités s'écrit sous l'arbre
   * (fraction exacte, irréductible, puis valeur décimale). Contrôle :
   * la somme de tous les chemins vaut 1.
   * Tous les chemins d'un même arbre ont le même dénominateur (produit
   * des effectifs de l'urne à chaque étage), d'où des sommes exactes en
   * entiers. Réglage par défaut = exemple du cours : 5 rouges, 3 bleues,
   * sans remise, 2 tirages.
   * ================================================================ */

  var DEFAUT = { rouges: 5, bleues: 3, remise: false, tirages: 2, evenement: "exactementUne" };
  var L = 440, MG = 34, MD = 112;

  function pgcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a || 1; }

  function nombreFr(v, d) {
    var s = v.toFixed(d).replace(".", ",");
    return s.replace("-", "−");
  }

  /* Valeur décimale : « = 0,375 » si l'écriture est exacte avec au plus 3 décimales,
   * sinon « ≈ 0,536 ». */
  function decimal(num, den) {
    var v = num / den;
    var exact = Math.abs(v * 1000 - Math.round(v * 1000)) < 1e-9;
    var s = nombreFr(v, 3).replace(/(,\d*?)0+$/, "$1").replace(/,$/, "");
    return (exact ? "= " : "≈ ") + (exact ? s : nombreFr(v, 3));
  }

  function svgEl(tag, attrs, texte) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    if (texte !== undefined) el.textContent = texte;
    return el;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    "<style>" +
    ":host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}" +
    "*{box-sizing:border-box;}" +
    ".figure{display:flex;justify-content:center;margin-bottom:10px;}" +
    ".figure svg{width:100%;max-width:" + L + "px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}" +
    ".branche{stroke:var(--ink-faint,#9c9083);stroke-width:1.4;fill:none;opacity:0.7;}" +
    ".branche.on{stroke:var(--accent,#a8471f);stroke-width:3;opacity:1;}" +
    ".branche.nulle{stroke-dasharray:3 3;}" +
    ".frac{font-family:var(--mono,monospace);font-size:12px;fill:var(--ink-soft,#6b6055);}" +
    ".frac.on{fill:var(--accent-ink,#7a3212);font-weight:700;}" +
    ".noeud-r{fill:var(--bad,#a8322f);font-weight:700;font-size:13px;font-family:var(--sans,sans-serif);}" +
    ".noeud-b{fill:var(--sky,#2f7fa8);font-weight:700;font-size:13px;font-family:var(--sans,sans-serif);}" +
    ".racine{fill:var(--ink-soft,#6b6055);}" +
    ".feuille{font-family:var(--mono,monospace);font-size:11.5px;fill:var(--ink-faint,#9c9083);}" +
    ".feuille.on{fill:var(--accent-ink,#7a3212);font-weight:700;}" +
    ".entete{font-size:10.5px;font-style:italic;font-family:var(--serif,serif);fill:var(--ink-soft,#6b6055);}" +
    ".resultat{display:flex;flex-direction:column;gap:6px;margin:0 0 14px;font-variant-numeric:tabular-nums;}" +
    ".ligne{padding:9px 12px;border-radius:var(--radius,3px);background:var(--surface-2,#faf6f0);font-size:0.88rem;line-height:1.5;overflow-wrap:anywhere;}" +
    ".ligne.principale{font-weight:700;color:var(--accent-ink,#7a3212);background:var(--accent-soft,#f6e2d3);}" +
    ".ligne.controle{color:var(--good,#2f7a4f);}" +
    ".ligne.note{color:var(--ink-soft,#6b6055);font-size:0.84rem;}" +
    ".groupe{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-bottom:10px;}" +
    ".groupe button{padding:7px 12px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink-soft,#6b6055);font-weight:600;cursor:pointer;font-size:0.86rem;font-family:inherit;}" +
    ".groupe button.actif{background:var(--accent,#a8471f);border-color:var(--accent,#a8471f);color:#fff;}" +
    ".groupe button:disabled{opacity:0.45;cursor:not-allowed;}" +
    ".titre-groupe{text-align:center;font-size:0.8rem;color:var(--ink-soft,#6b6055);margin:4px 0 4px;}" +
    ".curseurs{display:flex;flex-direction:column;gap:8px;margin-bottom:10px;}" +
    ".curseur{display:flex;align-items:center;gap:10px;font-size:0.88rem;}" +
    ".curseur label{flex:0 0 70px;font-weight:600;}" +
    ".curseur input{flex:1 1 auto;min-width:0;accent-color:var(--accent,#a8471f);}" +
    ".curseur span{min-width:28px;text-align:right;font-weight:700;font-variant-numeric:tabular-nums;}" +
    ".c-r{color:var(--bad,#a8322f);}.c-b{color:var(--sky,#2f7fa8);}" +
    ".btn-reset{display:block;margin:4px auto 0;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;}" +
    "@media (max-width:480px){.curseur label{flex-basis:56px;font-size:0.82rem;}.groupe button{font-size:0.8rem;padding:6px 9px;}}" +
    "</style>" +
    '<div class="figure"><svg id="svg" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Arbre pondéré des tirages"></svg></div>' +
    '<div class="resultat" id="resultat"></div>' +
    '<p class="titre-groupe">Événement</p>' +
    '<div class="groupe" id="evenements"></div>' +
    '<div class="curseurs">' +
    '<div class="curseur"><label for="r" class="c-r">rouges</label><input type="range" id="r" min="1" max="8" step="1"><span id="r-v" class="c-r"></span></div>' +
    '<div class="curseur"><label for="b" class="c-b">bleues</label><input type="range" id="b" min="1" max="8" step="1"><span id="b-v" class="c-b"></span></div>' +
    "</div>" +
    '<div class="groupe" id="remise">' +
    '<button type="button" data-remise="non">sans remise</button>' +
    '<button type="button" data-remise="oui">avec remise</button>' +
    "</div>" +
    '<div class="groupe" id="tirages">' +
    '<button type="button" data-t="2">2 tirages</button>' +
    '<button type="button" data-t="3">3 tirages</button>' +
    "</div>" +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>';

  var EVENEMENTS = [
    { id: "exactementUne", libelle: function () { return "exactement une rouge"; }, test: function (c) { return compte(c, "R") === 1; } },
    { id: "auMoinsUne", libelle: function () { return "au moins une rouge"; }, test: function (c) { return compte(c, "R") >= 1; } },
    { id: "memeCouleur", libelle: function () { return "même couleur"; }, test: function (c) { return compte(c, "R") === 0 || compte(c, "R") === c.length; } },
    { id: "toutesRouges", libelle: function (t) { return t === 2 ? "deux rouges" : "trois rouges"; }, test: function (c) { return compte(c, "R") === c.length; } },
  ];

  function compte(chemin, lettre) {
    var n = 0;
    for (var i = 0; i < chemin.length; i++) if (chemin[i] === lettre) n++;
    return n;
  }

  class ArbreTiragesWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._s = shadow;
      this._etat = Object.assign({}, DEFAUT);
    }

    connectedCallback() {
      if (this._pret) return;
      this._pret = true;
      var self = this, s = this._s;
      s.getElementById("r").value = String(this._etat.rouges);
      s.getElementById("b").value = String(this._etat.bleues);
      s.getElementById("r").addEventListener("input", function () { self._etat.rouges = parseInt(this.value, 10); self._rendre(); });
      s.getElementById("b").addEventListener("input", function () { self._etat.bleues = parseInt(this.value, 10); self._rendre(); });
      s.getElementById("remise").addEventListener("click", function (e) {
        var bt = e.target.closest("button[data-remise]");
        if (!bt) return;
        self._etat.remise = bt.getAttribute("data-remise") === "oui";
        self._rendre();
      });
      s.getElementById("tirages").addEventListener("click", function (e) {
        var bt = e.target.closest("button[data-t]");
        if (!bt || bt.disabled) return;
        self._etat.tirages = parseInt(bt.getAttribute("data-t"), 10);
        self._rendre();
      });
      s.getElementById("evenements").addEventListener("click", function (e) {
        var bt = e.target.closest("button[data-ev]");
        if (!bt) return;
        self._etat.evenement = bt.getAttribute("data-ev");
        self._rendre();
      });
      s.getElementById("reset").addEventListener("click", function () {
        self._etat = Object.assign({}, DEFAUT);
        s.getElementById("r").value = String(DEFAUT.rouges);
        s.getElementById("b").value = String(DEFAUT.bleues);
        self._rendre();
      });
      this._rendre();
    }

    /* Liste des chemins : lettres, fraction de chaque branche, numérateur du chemin.
     * Le dénominateur est commun à tous les chemins. */
    _construire() {
      var e = this._etat, N = e.rouges + e.bleues, t = e.tirages;
      var chemins = [];
      (function parcourir(prefixe, r, b, branches) {
        if (prefixe.length === t) {
          var num = 1;
          branches.forEach(function (br) { num *= br.num; });
          chemins.push({ lettres: prefixe, branches: branches, num: num });
          return;
        }
        var total = r + b;
        var brR = { num: r, den: total }, brB = { num: b, den: total };
        parcourir(prefixe + "R", e.remise ? r : Math.max(r - 1, 0), b, branches.concat([brR]));
        parcourir(prefixe + "B", r, e.remise ? b : Math.max(b - 1, 0), branches.concat([brB]));
      })("", e.rouges, e.bleues, []);
      var den = 1;
      for (var i = 0; i < t; i++) den *= e.remise ? N : N - i;
      return { chemins: chemins, den: den };
    }

    _rendre() {
      var e = this._etat, s = this._s;
      var N = e.rouges + e.bleues;
      // Sans remise, 3 tirages exigent au moins 3 boules.
      var troisPossible = e.remise || N >= 3;
      if (!troisPossible && e.tirages === 3) e.tirages = 2;
      s.getElementById("r-v").textContent = String(e.rouges);
      s.getElementById("b-v").textContent = String(e.bleues);
      Array.prototype.forEach.call(s.querySelectorAll("#remise button"), function (bt) {
        bt.className = (bt.getAttribute("data-remise") === "oui") === e.remise ? "actif" : "";
      });
      Array.prototype.forEach.call(s.querySelectorAll("#tirages button"), function (bt) {
        var t = parseInt(bt.getAttribute("data-t"), 10);
        bt.className = t === e.tirages ? "actif" : "";
        bt.disabled = t === 3 && !troisPossible;
      });
      var evZone = s.getElementById("evenements");
      evZone.innerHTML = EVENEMENTS.map(function (ev) {
        return '<button type="button" data-ev="' + ev.id + '" class="' + (ev.id === e.evenement ? "actif" : "") + '">' + ev.libelle(e.tirages) + "</button>";
      }).join("");

      var arbre = this._construire();
      var ev = EVENEMENTS.filter(function (x) { return x.id === e.evenement; })[0];
      // Un chemin de probabilité nulle (urne vide d'une couleur) ne s'allume jamais.
      arbre.chemins.forEach(function (c) { c.on = c.num > 0 && ev.test(c.lettres); });
      this._dessiner(arbre);
      this._ecrireResultat(arbre, ev, troisPossible);
    }

    _dessiner(arbre) {
      var e = this._etat, t = e.tirages, svg = this._s.getElementById("svg");
      var nbFeuilles = Math.pow(2, t);
      var H = t === 2 ? 236 : 360, MH = 26, MB = 14;
      svg.setAttribute("viewBox", "0 0 " + L + " " + H);
      svg.innerHTML = "";
      var pas = (H - MH - MB) / nbFeuilles;
      var xNiveau = function (i) { return MG + (L - MG - MD) * (i / t); };
      // Entêtes des étages
      for (var et = 1; et <= t; et++) {
        svg.appendChild(svgEl("text", { x: xNiveau(et), y: 14, "text-anchor": "middle", class: "entete" }, (et === 1 ? "1er" : et + "e") + " tirage"));
      }
      svg.appendChild(svgEl("text", { x: L - MD + 58, y: 14, "text-anchor": "middle", class: "entete" }, "chemin"));
      svg.appendChild(svgEl("circle", { cx: MG, cy: MH + (H - MH - MB) / 2, r: 4, class: "racine" }));

      // Position verticale d'un nœud : moyenne des feuilles de son sous-arbre.
      var yNoeud = function (prefixeIndex, niveau) {
        var largeur = Math.pow(2, t - niveau);
        var debut = prefixeIndex * largeur;
        return MH + pas * (debut + largeur / 2);
      };
      // Branches : pour chaque niveau, chaque nœud parent et ses 2 enfants.
      for (var niv = 1; niv <= t; niv++) {
        var nbNoeuds = Math.pow(2, niv);
        for (var idx = 0; idx < nbNoeuds; idx++) {
          var parent = Math.floor(idx / 2);
          var x1 = xNiveau(niv - 1), y1 = niv === 1 ? MH + (H - MH - MB) / 2 : yNoeud(parent, niv - 1);
          var x2 = xNiveau(niv) - 9, y2 = yNoeud(idx, niv);
          // Chemin (préfixe) de ce nœud et branche correspondante
          var largeur = Math.pow(2, t - niv);
          var cheminRef = arbre.chemins[idx * largeur];
          var br = cheminRef.branches[niv - 1];
          var on = arbre.chemins.slice(idx * largeur, (idx + 1) * largeur).some(function (c) { return c.on; });
          var nulle = br.num === 0;
          svg.appendChild(svgEl("line", { x1: x1 + (niv === 1 ? 4 : 9), y1: y1, x2: x2, y2: y2, class: "branche" + (on && !nulle ? " on" : "") + (nulle ? " nulle" : "") }));
          var haut = idx % 2 === 0;
          var mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
          svg.appendChild(svgEl("text", {
            x: mx, y: haut ? my - 5 : my + 13, "text-anchor": "middle", class: "frac" + (on && !nulle ? " on" : ""),
          }, br.num + "/" + br.den));
          var lettre = cheminRef.lettres[niv - 1];
          svg.appendChild(svgEl("text", { x: xNiveau(niv), y: y2 + 4.5, "text-anchor": "middle", class: lettre === "R" ? "noeud-r" : "noeud-b" }, lettre));
        }
      }
      // Feuilles : nom du chemin et probabilité (dénominateur commun).
      arbre.chemins.forEach(function (c, i) {
        var y = MH + pas * (i + 0.5) + 4;
        svg.appendChild(svgEl("text", { x: L - MD + 14, y: y, class: "feuille" + (c.on ? " on" : "") }, c.lettres + "\u00a0\u00a0" + c.num + "/" + arbre.den));
      });
    }

    _ecrireResultat(arbre, ev, troisPossible) {
      var e = this._etat, den = arbre.den, zone = this._s.getElementById("resultat");
      var choisis = arbre.chemins.filter(function (c) { return c.on && c.num > 0; });
      var somme = choisis.reduce(function (a, c) { return a + c.num; }, 0);
      var g = pgcd(somme, den);
      var nom = "P(" + ev.libelle(e.tirages) + ")";
      var html;
      if (somme === 0) {
        html = '<div class="ligne principale">' + nom + " = 0 : aucun chemin possible ne réalise cet événement.</div>";
      } else {
        var parChemins = choisis.map(function (c) { return "P(" + c.lettres + ")"; }).join(" + ");
        var valeurs = choisis.map(function (c) { return c.num + "/" + den; }).join(" + ");
        html = '<div class="ligne principale">' + nom + " = " + parChemins + " = " + valeurs +
          (choisis.length > 1 ? " = " + somme + "/" + den : "") +
          (g > 1 ? " = " + somme / g + "/" + den / g : "") + " " + decimal(somme, den) + "</div>";
      }
      if (ev.id === "auMoinsUne") {
        var bleus = arbre.chemins[arbre.chemins.length - 1];
        var nomB = bleus.lettres;
        html += '<div class="ligne">Par le complément : 1 − P(' + nomB + ") = 1 − " + bleus.num + "/" + den + " = " + (den - bleus.num) + "/" + den + " — un seul chemin à calculer.</div>";
      }
      var tous = arbre.chemins.map(function (c) { return String(c.num); }).join(" + ");
      var total = arbre.chemins.reduce(function (a, c) { return a + c.num; }, 0);
      html += '<div class="ligne controle">Contrôle : somme de tous les chemins = (' + tous + ")/" + den + " = " + total + "/" + den + " = 1 ✓</div>";
      html += '<div class="ligne note">' + (e.remise
        ? "Avec remise : l'urne retrouve sa composition après chaque tirage, chaque étage porte les mêmes probabilités — les tirages sont indépendants."
        : "Sans remise : la composition de l'urne change après chaque tirage, les probabilités des branches changent d'un étage à l'autre.") +
        (troisPossible ? "" : " Avec 2 boules seulement, un 3e tirage sans remise est impossible.") + "</div>";
      zone.innerHTML = html;
    }
  }

  if (!customElements.get("arbre-tirages-widget")) {
    customElements.define("arbre-tirages-widget", ArbreTiragesWidget);
  }
})();
