(function () {
  "use strict";

  /* ================================================================
   * <monty-hall-widget> — atelier « Monty Hall » (6e, chapitre 6
   * « Les probabilités », section 4). n portes (3 à 10), une voiture derrière
   * l'une d'elles. L'élève choisit une porte ; l'animateur, qui sait où est la
   * voiture, ouvre une porte à chèvre ; l'élève garde sa porte ou change.
   *
   * Règle du cours (et de 6gen76) : l'animateur ouvre UNE SEULE porte à chèvre,
   * autre que la porte choisie ; en changeant, on prend au hasard l'une des
   * n − 2 autres portes encore fermées.
   *   P(gagner en gardant) = 1/n ; P(gagner en changeant) = (n − 1)/(n(n − 2)).
   * Variante (clairement séparée) : l'animateur ouvre toutes les autres portes
   * sauf une ; changer gagne alors avec la probabilité (n − 1)/n.
   *
   * Mode « Jouer » (score cumulé par stratégie) et simulation de 1 000 parties
   * par stratégie, comparées aux valeurs exactes.
   * ================================================================ */

  var VB_L = 440, VB_H = 190;

  function pgcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a || 1; }
  function fraction(num, den) { var g = pgcd(num, den); return { n: num / g, d: den / g }; }
  function fmt(x, d) { return x.toFixed(d).replace(".", ","); }
  function entierFr(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " "); }
  function hasard(k) { return Math.floor(Math.random() * k); }

  function svgEl(tag, attrs) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  /** Probabilités exactes de gain pour n portes et une règle. */
  function exactes(n, regle) {
    var garder = fraction(1, n);
    var changer = regle === "une" ? fraction(n - 1, n * (n - 2)) : fraction(n - 1, n);
    return { garder: garder, changer: changer };
  }

  /** Portes ouvertes par l'animateur (jamais la porte choisie, jamais la voiture). */
  function portesOuvertes(n, voiture, choix, regle) {
    var candidates = [];
    for (var i = 0; i < n; i++) if (i !== choix && i !== voiture) candidates.push(i);
    if (regle === "une") return [candidates[hasard(candidates.length)]];
    // Variante : toutes les autres sauf une. Si le joueur a la voiture, on laisse
    // fermée une chèvre au hasard ; sinon, on laisse fermée la voiture.
    if (choix === voiture) {
      var garde = candidates[hasard(candidates.length)];
      return candidates.filter(function (c) { return c !== garde; });
    }
    return candidates;
  }

  /** Porte prise en changeant : au hasard parmi les portes encore fermées autres que la sienne. */
  function porteApresChangement(n, choix, ouvertes) {
    var restantes = [];
    for (var i = 0; i < n; i++) if (i !== choix && ouvertes.indexOf(i) < 0) restantes.push(i);
    return restantes[hasard(restantes.length)];
  }

  function partieSimulee(n, regle, strategie) {
    var voiture = hasard(n), choix = hasard(n);
    var ouvertes = portesOuvertes(n, voiture, choix, regle);
    var finale = strategie === "garder" ? choix : porteApresChangement(n, choix, ouvertes);
    return finale === voiture;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    "<style>" +
    ":host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}" +
    "*{box-sizing:border-box;}" +
    "[hidden]{display:none!important;}" +
    ".regles{display:flex;flex-direction:column;gap:6px;margin:0 0 12px;font-size:0.88rem;}" +
    ".regles label{display:flex;gap:8px;align-items:flex-start;line-height:1.35;cursor:pointer;}" +
    ".regles input{margin-top:3px;accent-color:var(--accent,#a8471f);flex:0 0 auto;}" +
    ".regles .variante{color:var(--ink-soft,#6b6055);}" +
    ".figure{display:flex;justify-content:center;margin:0 0 10px;}" +
    ".figure svg{width:100%;max-width:440px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}" +
    ".porte{fill:var(--plan-soft,#e9e5f5);stroke:var(--plan,#5b4ea3);stroke-width:1.6;}" +
    ".porte.choisie{stroke:var(--accent,#a8471f);stroke-width:3.2;}" +
    ".porte.ouverte{fill:var(--surface,#fffdf9);stroke:var(--line,#ddd2c0);stroke-dasharray:4 3;}" +
    ".porte.gagnee{fill:var(--good-soft,#e2f0e7);stroke:var(--good,#2f7a4f);stroke-width:3.2;}" +
    ".num{font-family:var(--mono,monospace);font-size:13px;font-weight:600;fill:var(--plan-ink,#463c86);text-anchor:middle;}" +
    ".lot{font-family:var(--sans,sans-serif);font-size:11px;font-weight:600;text-anchor:middle;}" +
    ".lot-voiture{fill:var(--good,#2f7a4f);}" +
    ".lot-chevre{fill:var(--ink-soft,#6b6055);}" +
    ".marque{font-family:var(--sans,sans-serif);font-size:10.5px;font-weight:700;text-anchor:middle;fill:var(--accent-ink,#7a3212);}" +
    ".consigne{text-align:center;font-size:0.92rem;font-weight:600;margin:0 0 10px;min-height:1.4em;}" +
    ".consigne.gagne{color:var(--good,#2f7a4f);}" +
    ".consigne.perdu{color:var(--bad,#a8322f);}" +
    ".boutons{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;margin:0 0 12px;}" +
    "button{font:inherit;font-size:0.86rem;padding:6px 12px;border-radius:var(--radius,3px);border:1px solid var(--line,#ddd2c0);background:var(--surface,#fffdf9);color:var(--ink,#241f1a);cursor:pointer;min-height:36px;}" +
    "button:hover{border-color:var(--accent,#a8471f);}" +
    "button:focus-visible{outline:2px solid var(--accent,#a8471f);outline-offset:2px;}" +
    "button.principal{background:var(--accent,#a8471f);border-color:var(--accent,#a8471f);color:var(--surface,#fffdf9);font-weight:600;}" +
    ".scores{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:0 0 14px;}" +
    ".score{background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);padding:8px 10px;text-align:center;font-size:0.84rem;}" +
    ".score b{display:block;font-size:1.05rem;font-variant-numeric:tabular-nums;margin-top:2px;}" +
    ".curseur{display:flex;align-items:center;gap:10px;font-size:0.88rem;margin:0 0 12px;}" +
    ".curseur label{flex:0 0 auto;font-weight:600;}" +
    ".curseur input{flex:1 1 auto;accent-color:var(--accent,#a8471f);min-width:0;}" +
    ".curseur span{min-width:24px;text-align:right;font-variant-numeric:tabular-nums;font-weight:600;}" +
    ".sim{border-top:1px solid var(--line-soft,#ece4d6);padding-top:12px;}" +
    ".sim-res{display:flex;flex-direction:column;gap:10px;margin-top:10px;}" +
    ".ligne{font-size:0.86rem;}" +
    ".ligne .tete{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:4px;font-variant-numeric:tabular-nums;}" +
    ".barre{position:relative;height:16px;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);overflow:hidden;}" +
    ".barre .obs{position:absolute;left:0;top:0;bottom:0;}" +
    ".barre .obs.garder{background:var(--plan,#5b4ea3);}" +
    ".barre .obs.changer{background:var(--good,#2f7a4f);}" +
    ".barre .exact{position:absolute;top:-2px;bottom:-2px;width:2px;background:var(--ink,#241f1a);}" +
    ".note{font-size:0.8rem;color:var(--ink-soft,#6b6055);margin:8px 0 0;line-height:1.4;}" +
    "</style>" +
    '<div class="regles" role="radiogroup" aria-label="Règle suivie par l\'animateur">' +
    '<label><input type="radio" name="regle" value="une" checked> Règle du cours : l\'animateur ouvre une seule porte à chèvre ; en changeant, tu prends au hasard une autre porte encore fermée.</label>' +
    '<label class="variante"><input type="radio" name="regle" value="toutes"> Variante (autre jeu) : l\'animateur ouvre toutes les autres portes sauf une.</label>' +
    "</div>" +
    '<div class="curseur"><label for="n">nombre de portes</label><input type="range" id="n" min="3" max="10" step="1" value="3"><span id="n-v"></span></div>' +
    '<div class="figure"><svg id="svg" viewBox="0 0 ' + VB_L + " " + VB_H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Les portes du jeu"></svg></div>' +
    '<p class="consigne" id="consigne" aria-live="polite"></p>' +
    '<div class="boutons" id="choix-portes"></div>' +
    '<div class="boutons" id="decision" hidden>' +
    '<button type="button" id="garder">Garder ma porte</button>' +
    '<button type="button" id="changer">Changer de porte</button>' +
    "</div>" +
    '<div class="boutons" id="relance" hidden><button type="button" class="principal" id="nouvelle">Nouvelle partie</button></div>' +
    '<div class="scores">' +
    '<div class="score">en gardant<b id="sc-garder">0 / 0</b></div>' +
    '<div class="score">en changeant<b id="sc-changer">0 / 0</b></div>' +
    "</div>" +
    '<div class="sim">' +
    '<div class="boutons"><button type="button" class="principal" id="simuler">Simuler 1 000 parties de chaque stratégie</button></div>' +
    '<div class="sim-res" id="sim-res"></div>' +
    '<p class="note" id="note"></p>' +
    "</div>";

  class MontyHallWidget extends HTMLElement {
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
      s.getElementById("n").addEventListener("input", function () { self._reinitialiser(); });
      s.querySelectorAll('input[name="regle"]').forEach(function (r) {
        r.addEventListener("change", function () { self._reinitialiser(); });
      });
      s.getElementById("garder").addEventListener("click", function () { self._decider("garder"); });
      s.getElementById("changer").addEventListener("click", function () { self._decider("changer"); });
      s.getElementById("nouvelle").addEventListener("click", function () { self._nouvellePartie(true); });
      s.getElementById("simuler").addEventListener("click", function () { self._simuler(); });
      this._reinitialiser();
    }

    _n() { return parseInt(this._s.getElementById("n").value, 10); }
    _regle() { return this._s.querySelector('input[name="regle"]:checked').value; }

    _reinitialiser() {
      this._scores = { garder: { g: 0, j: 0 }, changer: { g: 0, j: 0 } };
      this._s.getElementById("sim-res").innerHTML = "";
      this._s.getElementById("n-v").textContent = String(this._n());
      this._nouvellePartie(false);
      this._afficherNote();
    }

    _nouvellePartie(focus) {
      var n = this._n();
      this._p = { voiture: hasard(n), choix: null, ouvertes: [], finale: null, strategie: null, phase: "choisir" };
      this._afficherPartie();
      if (focus) {
        var premier = this._s.querySelector("#choix-portes button");
        if (premier) premier.focus();
      }
    }

    _choisir(i) {
      var p = this._p;
      if (p.phase !== "choisir") return;
      p.choix = i;
      p.ouvertes = portesOuvertes(this._n(), p.voiture, i, this._regle());
      p.phase = "decider";
      this._afficherPartie();
      this._s.getElementById("garder").focus();
    }

    _decider(strategie) {
      var p = this._p;
      if (p.phase !== "decider") return;
      p.strategie = strategie;
      p.finale = strategie === "garder" ? p.choix : porteApresChangement(this._n(), p.choix, p.ouvertes);
      p.phase = "fin";
      var sc = this._scores[strategie];
      sc.j += 1;
      if (p.finale === p.voiture) sc.g += 1;
      this._afficherPartie();
      this._s.getElementById("nouvelle").focus();
    }

    _afficherPartie() {
      var s = this._s, p = this._p, n = this._n(), self = this;
      // Boutons de choix (hors de la figure : la figure reste épinglable).
      var zone = s.getElementById("choix-portes");
      zone.innerHTML = "";
      zone.hidden = p.phase !== "choisir";
      for (var i = 0; i < n; i++) {
        var b = document.createElement("button");
        b.type = "button";
        b.textContent = "Porte " + (i + 1);
        b.addEventListener("click", (function (k) { return function () { self._choisir(k); }; })(i));
        zone.appendChild(b);
      }
      s.getElementById("decision").hidden = p.phase !== "decider";
      s.getElementById("relance").hidden = p.phase !== "fin";

      var consigne = s.getElementById("consigne");
      consigne.className = "consigne";
      if (p.phase === "choisir") {
        consigne.textContent = "Choisis une porte : la voiture est derrière l'une des " + n + " portes.";
      } else if (p.phase === "decider") {
        var ouv = p.ouvertes.map(function (k) { return k + 1; });
        var restantes = n - 1 - p.ouvertes.length;
        consigne.textContent = (ouv.length === 1
          ? "L'animateur ouvre la porte " + ouv[0] + " : une chèvre. "
          : "L'animateur ouvre les portes " + ouv.join(", ") + " : des chèvres. ") +
          (restantes === 1
            ? "Gardes-tu la porte " + (p.choix + 1) + " ou changes-tu pour l'autre porte fermée ?"
            : "Gardes-tu la porte " + (p.choix + 1) + " ou changes-tu (au hasard parmi les " + restantes + " autres portes fermées) ?");
      } else {
        var gagne = p.finale === p.voiture;
        consigne.className = "consigne " + (gagne ? "gagne" : "perdu");
        consigne.textContent = (p.strategie === "garder" ? "Tu gardes la porte " : "Tu changes pour la porte ") +
          (p.finale + 1) + " : " + (gagne ? "gagné, la voiture est là !" : "perdu, la voiture était derrière la porte " + (p.voiture + 1) + ".");
      }
      s.getElementById("sc-garder").textContent = this._scores.garder.g + " victoire" + (this._scores.garder.g > 1 ? "s" : "") + " / " + this._scores.garder.j;
      s.getElementById("sc-changer").textContent = this._scores.changer.g + " victoire" + (this._scores.changer.g > 1 ? "s" : "") + " / " + this._scores.changer.j;
      this._dessiner();
    }

    _dessiner() {
      var svg = this._s.getElementById("svg"), p = this._p, n = this._n();
      svg.innerHTML = "";
      var marge = 14, ecart = n <= 5 ? 14 : 8;
      var larg = Math.min(70, (VB_L - 2 * marge - (n - 1) * ecart) / n);
      var total = n * larg + (n - 1) * ecart;
      var x0 = (VB_L - total) / 2, haut = 118, y0 = 42;
      for (var i = 0; i < n; i++) {
        var x = x0 + i * (larg + ecart);
        var ouverte = p.ouvertes.indexOf(i) >= 0 || p.phase === "fin";
        var classe = "porte";
        if (ouverte) classe += " ouverte";
        if (p.phase === "fin" && i === p.finale && i === p.voiture) classe = "porte gagnee";
        else if (i === p.choix && p.phase !== "fin") classe += " choisie";
        else if (p.phase === "fin" && i === p.finale) classe += " choisie";
        svg.appendChild(svgEl("rect", { x: x.toFixed(1), y: y0, width: larg.toFixed(1), height: haut, rx: 4, class: classe }));
        var num = svgEl("text", { x: (x + larg / 2).toFixed(1), y: y0 + 20, class: "num" });
        num.textContent = String(i + 1);
        svg.appendChild(num);
        if (ouverte) {
          var voiture = i === p.voiture;
          var lot = svgEl("text", { x: (x + larg / 2).toFixed(1), y: y0 + haut / 2 + 14, class: "lot " + (voiture ? "lot-voiture" : "lot-chevre") });
          lot.textContent = voiture ? "voiture" : "chèvre";
          svg.appendChild(lot);
        } else {
          // Poignée de porte fermée.
          svg.appendChild(svgEl("circle", { cx: (x + larg - 9).toFixed(1), cy: y0 + haut / 2 + 8, r: 3, class: "lot-chevre" }));
        }
        var texteMarque = "";
        if (p.phase === "fin" && i === p.finale) texteMarque = "ta porte";
        else if (p.phase !== "fin" && i === p.choix) texteMarque = "ton choix";
        if (p.phase === "fin" && i === p.choix && p.strategie === "changer") texteMarque = "1er choix";
        if (texteMarque) {
          var m = svgEl("text", { x: (x + larg / 2).toFixed(1), y: y0 - 10, class: "marque" });
          m.textContent = texteMarque;
          svg.appendChild(m);
        }
      }
    }

    _afficherNote() {
      var n = this._n(), regle = this._regle(), ex = exactes(n, regle);
      var note = this._s.getElementById("note");
      if (regle === "une") {
        note.textContent = "Avec " + n + " portes : P(gagner en gardant) = 1/" + n +
          (n === 3 ? " ; P(gagner en changeant) = 2/3." :
            " ; P(gagner en changeant) = (" + n + " − 1)/(" + n + " × " + (n - 2) + ") = " + ex.changer.n + "/" + ex.changer.d +
            " ≈ " + fmt(ex.changer.n / ex.changer.d, 3) + ". Changer reste plus avantageux, de moins en moins quand n grandit.");
      } else {
        note.textContent = "Variante : l'animateur ne laisse qu'une seule autre porte fermée. P(gagner en gardant) = 1/" + n +
          " ; P(gagner en changeant) = " + ex.changer.n + "/" + ex.changer.d + " : changer gagne presque toujours.";
      }
    }

    _simuler() {
      var n = this._n(), regle = this._regle(), ex = exactes(n, regle), N = 1000;
      var res = this._s.getElementById("sim-res");
      res.innerHTML = "";
      ["garder", "changer"].forEach(function (strat) {
        var g = 0;
        for (var k = 0; k < N; k++) if (partieSimulee(n, regle, strat)) g += 1;
        var fr = ex[strat], exact = fr.n / fr.d, freq = g / N;
        var ligne = document.createElement("div");
        ligne.className = "ligne";
        ligne.innerHTML =
          '<div class="tete"><span><b>' + (strat === "garder" ? "En gardant" : "En changeant") + "</b> : " + entierFr(g) +
          " victoires sur 1 000, fréquence " + fmt(freq, 3) + "</span><span>probabilité exacte " + fr.n + "/" + fr.d +
          " ≈ " + fmt(exact, 3) + "</span></div>" +
          '<div class="barre" role="img" aria-label="Fréquence observée ' + fmt(freq, 3) + ', probabilité ' + fmt(exact, 3) + '">' +
          '<div class="obs ' + strat + '" style="width:' + (freq * 100).toFixed(1) + '%"></div>' +
          '<div class="exact" style="left:calc(' + (exact * 100).toFixed(1) + '% - 1px)"></div></div>';
        res.appendChild(ligne);
      });
      this._afficherNote();
    }
  }

  if (!customElements.get("monty-hall-widget")) {
    customElements.define("monty-hall-widget", MontyHallWidget);
  }
})();
