(function () {
  "use strict";

  /* ================================================================
   * <ipp-choix-widget> — atelier interactif (6e ch. 4, § 1, intégration
   * par parties) : une intégrale ∫ (1er facteur)·(2e facteur) dx ; l'élève
   * choisit le facteur qu'il DÉRIVE (l'autre est primitivé). Le widget
   * écrit la formule appliquée f·g − ∫ f′·g et juge l'intégrale restante
   * (plus simple / plus compliquée). Choix fermé gagnable par élimination :
   * UN seul essai, puis le bon choix et la primitive finale sont révélés.
   * Pas de score. Web Component (Shadow DOM).
   * ================================================================ */

  var BANQUE = [
    {
      integrale: "∫ x·eˣ dx", facteurs: ["x", "eˣ"], bon: 0,
      choix: [
        { formule: "On dérive f = x et on primitive g′ = eˣ, donc g = eˣ :  ∫ x·eˣ dx = x·eˣ − ∫ 1·eˣ dx",
          verdict: "Plus simple : il reste ∫ eˣ dx, immédiate. Continue !" },
        { formule: "On dérive f = eˣ et on primitive g′ = x, donc g = x²/2 :  ∫ x·eˣ dx = (x²/2)·eˣ − ∫ eˣ·(x²/2) dx",
          verdict: "Plus compliquée : le facteur x est devenu x²/2. Mauvais choix." }
      ],
      finale: "∫ x·eˣ dx = x·eˣ − eˣ + C = (x − 1)eˣ + C",
      remarque: ""
    },
    {
      integrale: "∫ x·sin(x) dx", facteurs: ["x", "sin(x)"], bon: 0,
      choix: [
        { formule: "On dérive f = x et on primitive g′ = sin(x), donc g = −cos(x) :  ∫ x·sin(x) dx = −x·cos(x) + ∫ cos(x) dx",
          verdict: "Plus simple : il reste ∫ cos(x) dx, immédiate. Continue !" },
        { formule: "On dérive f = sin(x) et on primitive g′ = x, donc g = x²/2 :  ∫ x·sin(x) dx = (x²/2)·sin(x) − ∫ cos(x)·(x²/2) dx",
          verdict: "Plus compliquée : le facteur x est devenu x²/2. Mauvais choix." }
      ],
      finale: "∫ x·sin(x) dx = −x·cos(x) + sin(x) + C",
      remarque: ""
    },
    {
      integrale: "∫ x·cos(x) dx", facteurs: ["x", "cos(x)"], bon: 0,
      choix: [
        { formule: "On dérive f = x et on primitive g′ = cos(x), donc g = sin(x) :  ∫ x·cos(x) dx = x·sin(x) − ∫ sin(x) dx",
          verdict: "Plus simple : il reste ∫ sin(x) dx, immédiate. Continue !" },
        { formule: "On dérive f = cos(x) et on primitive g′ = x, donc g = x²/2 :  ∫ x·cos(x) dx = (x²/2)·cos(x) + ∫ sin(x)·(x²/2) dx",
          verdict: "Plus compliquée : le facteur x est devenu x²/2. Mauvais choix." }
      ],
      finale: "∫ x·cos(x) dx = x·sin(x) + cos(x) + C",
      remarque: ""
    },
    {
      integrale: "∫ ln(x) dx = ∫ ln(x)·1 dx", facteurs: ["ln(x)", "1"], bon: 0,
      choix: [
        { formule: "On dérive f = ln(x) et on primitive g′ = 1, donc g = x :  ∫ ln(x) dx = x·ln(x) − ∫ (1/x)·x dx = x·ln(x) − ∫ 1 dx",
          verdict: "Plus simple : (1/x)·x = 1, il reste ∫ 1 dx. Continue !" },
        { formule: "On dérive f = 1 et on primitive g′ = ln(x) : il faudrait déjà connaître une primitive de ln(x)…",
          verdict: "Impossible : c'est justement la primitive cherchée. Mauvais choix." }
      ],
      finale: "∫ ln(x) dx = x·ln(x) − x + C   (pour x > 0)",
      remarque: "L'astuce : écrire ln(x) = ln(x)·1 pour faire apparaître un produit."
    },
    {
      integrale: "∫ x·ln(x) dx", facteurs: ["x", "ln(x)"], bon: 1,
      choix: [
        { formule: "On dérive f = x et on primitive g′ = ln(x), donc g = x·ln(x) − x :  ∫ x·ln(x) dx = x·(x·ln(x) − x) − ∫ (x·ln(x) − x) dx",
          verdict: "Plus compliquée : l'intégrale de départ x·ln(x) réapparaît, avec un terme en plus. Mauvais choix." },
        { formule: "On dérive f = ln(x) et on primitive g′ = x, donc g = x²/2 :  ∫ x·ln(x) dx = (x²/2)·ln(x) − ∫ (1/x)·(x²/2) dx = (x²/2)·ln(x) − ∫ (x/2) dx",
          verdict: "Plus simple : le logarithme a disparu, il reste ∫ (x/2) dx. Continue !" }
      ],
      finale: "∫ x·ln(x) dx = (x²/2)·ln(x) − x²/4 + C   (pour x > 0)",
      remarque: "Avec un logarithme, on dérive presque toujours le logarithme : sa dérivée 1/x se simplifie."
    },
    {
      integrale: "∫ x²·eˣ dx", facteurs: ["x²", "eˣ"], bon: 0,
      choix: [
        { formule: "On dérive f = x² et on primitive g′ = eˣ, donc g = eˣ :  ∫ x²·eˣ dx = x²·eˣ − ∫ 2x·eˣ dx",
          verdict: "Plus simple, mais il reste encore un produit 2x·eˣ : il faudra recommencer une 2ᵉ intégration par parties (en dérivant 2x)." },
        { formule: "On dérive f = eˣ et on primitive g′ = x², donc g = x³/3 :  ∫ x²·eˣ dx = (x³/3)·eˣ − ∫ eˣ·(x³/3) dx",
          verdict: "Plus compliquée : le facteur x² est devenu x³/3. Mauvais choix." }
      ],
      finale: "∫ x²·eˣ dx = x²·eˣ − 2(x − 1)eˣ + C = (x² − 2x + 2)eˣ + C",
      remarque: "Deux intégrations par parties successives : chacune abaisse d'un degré la puissance de x."
    }
  ];

  function melanger(tab) {
    var t = tab.slice();
    for (var i = t.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var x = t[i]; t[i] = t[j]; t[j] = x;
    }
    return t;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.rappel{text-align:center;font-size:0.88rem;color:var(--ink-soft,#6b6055);margin:0 0 10px;}' +
    '.integrale{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.35rem;font-weight:700;color:var(--ink,#241f1a);margin:0 0 6px;}' +
    '.consigne{text-align:center;font-size:0.95rem;color:var(--ink,#241f1a);margin:0 0 12px;}' +
    '.choix{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:12px;}' +
    '.choix button{flex:1 1 160px;min-height:48px;padding:10px 12px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);font:inherit;font-size:0.95rem;cursor:pointer;}' +
    '.choix button:disabled{cursor:default;opacity:0.75;}' +
    '.choix button.choisi{border-width:2px;font-weight:700;}' +
    '.choix button.bon{border-color:var(--good,#2f7a4f);background:var(--good-soft,#dcefe2);color:var(--ink,#241f1a);}' +
    '.choix button.faux{border-color:var(--bad,#b23a3a);background:var(--bad-soft,#f6dede);color:var(--ink,#241f1a);}' +
    '.resultat{border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);background:var(--surface,#fff);padding:10px 12px;margin:0 0 12px;font-size:0.92rem;line-height:1.5;color:var(--ink,#241f1a);}' +
    '.resultat p{margin:0 0 8px;overflow-wrap:anywhere;}' +
    '.resultat p:last-child{margin-bottom:0;}' +
    '.verdict-bon{color:var(--good,#2f7a4f);font-weight:700;}' +
    '.verdict-faux{color:var(--bad,#b23a3a);font-weight:700;}' +
    '.finale{font-family:var(--serif,serif);font-style:italic;font-weight:700;}' +
    '.titre-bloc{font-size:0.78rem;letter-spacing:0.03em;text-transform:uppercase;color:var(--ink-faint,#9c9083);display:block;margin-bottom:2px;}' +
    '.boutons{display:flex;justify-content:center;}' +
    '.boutons button{min-height:44px;padding:8px 16px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.9rem;font-family:inherit;}' +
    '</style>' +
    '<p class="rappel">Intégration par parties : ∫ f·g′ dx = f·g − ∫ f′·g dx — on dérive f, on primitive g′.</p>' +
    '<p class="integrale" id="integrale"></p>' +
    '<p class="consigne">Quel facteur choisis-tu de dériver ? Un seul essai.</p>' +
    '<div class="choix" id="choix"><button type="button" id="c0"></button><button type="button" id="c1"></button></div>' +
    '<div class="resultat" id="resultat" hidden></div>' +
    '<div class="boutons"><button type="button" id="suivante">Intégrale suivante</button></div>';

  class IppChoixWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      var self = this;
      this._integrale = shadow.getElementById("integrale");
      this._c = [shadow.getElementById("c0"), shadow.getElementById("c1")];
      this._resultat = shadow.getElementById("resultat");
      this._c.forEach(function (b, i) { b.addEventListener("click", function () { self._repondre(i); }); });
      shadow.getElementById("suivante").addEventListener("click", function () { self._suivante(); });
      this._ordre = melanger(BANQUE);
      this._k = 0;
      this._afficher();
    }

    _suivante() {
      this._k++;
      if (this._k >= this._ordre.length) {
        var dernier = this._ordre[this._ordre.length - 1];
        this._ordre = melanger(BANQUE);
        if (this._ordre[0] === dernier && this._ordre.length > 1) { this._ordre.push(this._ordre.shift()); }
        this._k = 0;
      }
      this._afficher();
    }

    _afficher() {
      var item = this._ordre[this._k];
      this._integrale.textContent = item.integrale;
      this._c[0].textContent = "Dériver le 1er facteur : " + item.facteurs[0];
      this._c[1].textContent = "Dériver le 2e facteur : " + item.facteurs[1];
      this._c.forEach(function (b) { b.disabled = false; b.className = ""; });
      this._resultat.hidden = true;
      this._resultat.innerHTML = "";
    }

    _repondre(i) {
      var item = this._ordre[this._k];
      var juste = i === item.bon;
      this._c.forEach(function (b) { b.disabled = true; });
      this._c[i].classList.add("choisi", juste ? "bon" : "faux");
      if (!juste) this._c[item.bon].classList.add("bon");
      var r = this._resultat;
      r.innerHTML = "";
      function ligne(titre, texte, classe) {
        var p = document.createElement("p");
        if (titre) {
          var t = document.createElement("span");
          t.className = "titre-bloc";
          t.textContent = titre;
          p.appendChild(t);
        }
        var s = document.createElement("span");
        if (classe) s.className = classe;
        s.textContent = texte;
        p.appendChild(s);
        r.appendChild(p);
      }
      ligne("Ton choix", item.choix[i].formule, "");
      ligne("", item.choix[i].verdict, juste ? "verdict-bon" : "verdict-faux");
      if (!juste) {
        ligne("Le bon choix", item.choix[item.bon].formule, "");
        ligne("", item.choix[item.bon].verdict, "verdict-bon");
      }
      ligne("Primitive finale", item.finale, "finale");
      if (item.remarque) ligne("", item.remarque, "");
      r.hidden = false;
    }
  }

  if (!customElements.get("ipp-choix-widget")) {
    customElements.define("ipp-choix-widget", IppChoixWidget);
  }
})();
