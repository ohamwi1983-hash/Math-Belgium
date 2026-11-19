(function () {
  "use strict";

  /* ================================================================
   * <methodes-resolution-widget> — atelier interactif (4e, chapitre 2, § 1) :
   * « les 6 situations en un coup d'œil ». Curseurs a, b, c (entiers, a ≠ 0)
   * ou équations du cours. L'atelier allume la (ou les) situation(s) qui
   * s'applique(nt) — c = 0 ; b = 0 avec ac < 0 ; b = 0 avec ac > 0 ;
   * carré parfait (b² = 4ac) ; racine évidente (a ± b + c = 0) ; cas
   * général — et affiche la résolution de la première, en valeurs EXACTES
   * (fractions, racines simplifiées). Quand la racine évidente s'applique,
   * le discriminant est rappelé comme seconde méthode, tout aussi juste.
   * Web Component (Shadow DOM), sans figure : tout est dans le texte.
   * ================================================================ */

  var PRESETS = [
    { nom: "2x² − 6x = 0", a: 2, b: -6, c: 0 },
    { nom: "2x² − 18 = 0", a: 2, b: 0, c: -18 },
    { nom: "2x² + 5 = 0", a: 2, b: 0, c: 5 },
    { nom: "2x² − 12x + 18 = 0", a: 2, b: -12, c: 18 },
    { nom: "3x² − 5x + 2 = 0", a: 3, b: -5, c: 2 },
    { nom: "x² − x − 6 = 0", a: 1, b: -1, c: -6 },
    { nom: "x² − 2x + 5 = 0", a: 1, b: -2, c: 5 },
  ];

  var SITUATIONS = [
    { id: "c0", titre: "c = 0", methode: "mettre x en évidence" },
    { id: "diff", titre: "b = 0, a et c de signes opposés", methode: "différence de deux carrés" },
    { id: "vide", titre: "b = 0, a et c de même signe", methode: "aucune solution, sans calcul" },
    { id: "carre", titre: "b² = 4ac", methode: "carré parfait" },
    { id: "evid", titre: "a + b + c = 0 ou a − b + c = 0", methode: "racine évidente (1 ou −1)" },
    { id: "gen", titre: "aucun raccourci", methode: "cas général : le discriminant" },
  ];

  function gcd(x, y) { x = Math.abs(x); y = Math.abs(y); while (y) { var t = x % y; x = y; y = t; } return x; }
  function nb(v) {
    if (Math.abs(v) < 1e-9) v = 0;
    var s = Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : (Math.round(v * 100) / 100).toString();
    return s.replace(".", ",").replace("-", "−");
  }
  function approx(v) { return (Math.abs(v * 100 - Math.round(v * 100)) < 1e-9 ? "= " : "≈ ") + nb(v); }
  // Nombre entre parenthèses s'il est négatif (pour l'écrire dans un calcul).
  function par(v) { return v < 0 ? "(" + nb(v) + ")" : nb(v); }
  // Fraction p/q réduite, dénominateur positif.
  function frac(p, q) {
    if (q < 0) { p = -p; q = -q; }
    var g = gcd(p, q) || 1;
    p /= g; q /= g;
    if (q === 1) return nb(p);
    return (p < 0 ? "−" : "") + Math.abs(p) + "/" + q;
  }
  // n entier > 0 : n = k²·m, avec m sans facteur carré.
  function racineSimplifiee(n) {
    var k = 1;
    for (var d = 2; d * d <= n; d++) while (n % (d * d) === 0) { n /= d * d; k *= d; }
    return { k: k, m: n };
  }
  function texteRacine(k, m) { return m === 1 ? String(k) : (k === 1 ? "" : String(k)) + "√" + m; }
  // Les deux nombres (B + K√m)/D et (B − K√m)/D, simplifiés (m > 1, K > 0).
  function formeRacine(B, K, m, D) {
    var g = gcd(gcd(B, K), D) || 1;
    B /= g; K /= g; D /= g;
    if (D < 0) { D = -D; B = -B; }
    var r = texteRacine(K, m);
    var plus = B === 0 ? r : nb(B) + " + " + r;
    var moins = B === 0 ? "−" + r : nb(B) + " − " + r;
    if (D === 1) return [plus, moins];
    if (B === 0) return [r + "/" + D, "−" + r + "/" + D];
    return ["(" + plus + ")/" + D, "(" + moins + ")/" + D];
  }
  // √(p/q) exact, p ≥ 0, q > 0 : √(pq)/q, simplifié.
  function racineFraction(p, q) {
    var g = gcd(p, q) || 1; p /= g; q /= g;
    var s = racineSimplifiee(p * q);
    var g2 = gcd(s.k, q) || 1;
    var k = s.k / g2, d = q / g2;
    var t = texteRacine(k, s.m);
    return d === 1 ? t : t + "/" + d;
  }
  function terme(coef, lettre, premier) {
    if (coef === 0) return "";
    var abs = Math.abs(coef);
    var corps = (lettre && abs === 1) ? lettre : abs + lettre;
    if (premier) return (coef < 0 ? "−" : "") + corps;
    return (coef < 0 ? " − " : " + ") + corps;
  }
  function polynome(a, b, c) {
    var s = terme(a, "x²", true);
    s += terme(b, "x", s === "");
    s += terme(c, "", s === "");
    return s === "" ? "0" : s;
  }
  // Facteur (x − r) pour r = p/q : « x − 3 », « x + 1/2 ».
  function facteurX(p, q) {
    if (p === 0) return "x";
    var f = frac(Math.abs(p), q);
    return p > 0 ? "x − " + f : "x + " + f;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;text-align:left;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}' +
    '*{box-sizing:border-box;}' +
    '.presets{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;}' +
    '.btn{min-height:44px;padding:6px 10px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);font:inherit;font-size:0.92rem;font-weight:600;cursor:pointer;}' +
    '.btn[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);border-color:var(--accent,#a8471f);color:var(--accent-ink,#7a3212);}' +
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.25rem;font-weight:600;margin:4px 0 12px;overflow-wrap:anywhere;}' +
    '.curseur{display:flex;flex-direction:column;gap:2px;margin-bottom:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-width:0;min-height:44px;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:36px;text-align:right;}' +
    '.situations{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:6px;margin:12px 0;padding:0;list-style:none;}' +
    '.situation{border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:8px;background:var(--surface,#fff);color:var(--ink-faint,#9c9083);min-width:0;}' +
    '.situation b{display:block;font-size:0.9rem;margin-bottom:2px;overflow-wrap:anywhere;}' +
    '.situation span{display:block;font-size:0.84rem;overflow-wrap:anywhere;}' +
    '.situation.actif{border:2px solid var(--good,#2f7a4f);color:var(--ink,#241f1a);background:var(--surface-2,#faf6f0);}' +
    '.situation.premier{border-color:var(--accent,#a8471f);}' +
    '.situation .marque{display:none;font-size:0.76rem;font-weight:700;color:var(--accent-ink,#7a3212);margin-top:4px;}' +
    '.situation.premier .marque{display:block;}' +
    '.resolution{border-left:4px solid var(--accent,#a8471f);background:var(--surface,#fff);padding:8px 12px;margin:0 0 10px;}' +
    '.resolution h4{margin:0 0 6px;font-size:0.95rem;}' +
    '.resolution ol{margin:0;padding-left:1.3em;line-height:1.55;font-size:0.95rem;}' +
    '.resolution li{overflow-wrap:anywhere;}' +
    '.conclusion{font-weight:700;margin:8px 0 0;overflow-wrap:anywhere;}' +
    '.autre{border-left:4px solid var(--good,#2f7a4f);background:var(--surface,#fff);padding:8px 12px;margin:0;font-size:0.92rem;line-height:1.5;overflow-wrap:anywhere;}' +
    '.autre[hidden]{display:none;}' +
    '</style>' +
    '<div class="presets" id="presets"></div>' +
    '<p class="formule" id="formule"></p>' +
    '<div class="curseur"><label for="a">a</label><div class="curseur-row"><input type="range" id="a" min="-5" max="5" step="1"><span class="curseur-valeur" id="a-val"></span></div></div>' +
    '<div class="curseur"><label for="b">b</label><div class="curseur-row"><input type="range" id="b" min="-12" max="12" step="1"><span class="curseur-valeur" id="b-val"></span></div></div>' +
    '<div class="curseur"><label for="c">c</label><div class="curseur-row"><input type="range" id="c" min="-12" max="12" step="1"><span class="curseur-valeur" id="c-val"></span></div></div>' +
    '<ul class="situations" id="situations"></ul>' +
    '<div class="resolution"><h4 id="titre-res"></h4><ol id="etapes"></ol><p class="conclusion" id="conclusion"></p></div>' +
    '<p class="autre" id="autre" hidden></p>';

  class MethodesResolutionWidget extends HTMLElement {
    constructor() {
      super();
      var sh = this.attachShadow({ mode: "open" });
      sh.appendChild(TEMPLATE.content.cloneNode(true));
      var $ = function (id) { return sh.getElementById(id); };
      this._el = {
        presets: $("presets"), formule: $("formule"), a: $("a"), b: $("b"), c: $("c"),
        aVal: $("a-val"), bVal: $("b-val"), cVal: $("c-val"), situations: $("situations"),
        titreRes: $("titre-res"), etapes: $("etapes"), conclusion: $("conclusion"), autre: $("autre"),
      };
      var self = this;
      this._boutons = PRESETS.map(function (p) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "btn"; b.textContent = p.nom;
        b.addEventListener("click", function () { self._regler(p.a, p.b, p.c); });
        self._el.presets.appendChild(b);
        return b;
      });
      this._cartes = SITUATIONS.map(function (s) {
        var li = document.createElement("li");
        li.className = "situation";
        var t = document.createElement("b"); t.textContent = s.titre;
        var m = document.createElement("span"); m.textContent = s.methode;
        var q = document.createElement("span"); q.className = "marque"; q.textContent = "→ méthode la plus rapide";
        li.appendChild(t); li.appendChild(m); li.appendChild(q);
        self._el.situations.appendChild(li);
        return li;
      });
      this._a = 2; this._b = -6; this._c = 0;
    }

    connectedCallback() {
      var self = this;
      this._onA = function () {
        var v = parseInt(self._el.a.value, 10);
        // a ne vaut jamais 0 : on saute la valeur dans le sens du déplacement.
        if (v === 0) { v = self._a > 0 ? -1 : 1; self._el.a.value = String(v); }
        self._a = v; self._rendre();
      };
      this._onB = function () { self._b = parseInt(self._el.b.value, 10); self._rendre(); };
      this._onC = function () { self._c = parseInt(self._el.c.value, 10); self._rendre(); };
      this._el.a.addEventListener("input", this._onA);
      this._el.b.addEventListener("input", this._onB);
      this._el.c.addEventListener("input", this._onC);
      this._regler(2, -6, 0);
    }

    disconnectedCallback() {
      this._el.a.removeEventListener("input", this._onA);
      this._el.b.removeEventListener("input", this._onB);
      this._el.c.removeEventListener("input", this._onC);
    }

    _regler(a, b, c) {
      this._a = a; this._b = b; this._c = c;
      this._el.a.value = String(a); this._el.b.value = String(b); this._el.c.value = String(c);
      this._rendre();
    }

    // Situations qui s'appliquent, dans l'ordre de priorité du cours.
    _situations(a, b, c) {
      var s = [];
      if (c === 0) s.push("c0");
      if (b === 0 && a * c < 0) s.push("diff");
      if (b === 0 && a * c > 0) s.push("vide");
      if (b * b === 4 * a * c) s.push("carre");
      if (a + b + c === 0 || a - b + c === 0) s.push("evid");
      if (s.length === 0) s.push("gen");
      return s;
    }

    // Résolution par le discriminant, en valeurs exactes : { etapes, conclusion }.
    _parDelta(a, b, c) {
      var delta = b * b - 4 * a * c;
      var etapes = ["Δ = b² − 4ac = " + par(b) + "² − 4 · " + par(a) + " · " + par(c) + " = " + nb(b * b) + " − " + par(4 * a * c) + " = " + nb(delta)];
      if (delta < 0) return { etapes: etapes.concat(["Δ < 0 : aucune racine réelle."]), conclusion: "Aucune solution : S = ∅." };
      if (delta === 0) {
        etapes.push("Δ = 0 : une racine double, x = −b/(2a).");
        return { etapes: etapes, conclusion: "x = " + frac(-b, 2 * a) + " (racine double)" };
      }
      var s = racineSimplifiee(delta);
      if (s.m === 1) {
        etapes.push("√Δ = " + s.k);
        etapes.push("x = (−b ± √Δ)/(2a) = (" + nb(-b) + " ± " + s.k + ")/" + par(2 * a));
        var x1 = frac(-b + s.k, 2 * a), x2 = frac(-b - s.k, 2 * a);
        return { etapes: etapes, conclusion: "x = " + x1 + " ou x = " + x2 };
      }
      etapes.push("√Δ = √" + delta + (s.k > 1 ? " = " + texteRacine(s.k, s.m) : "") + " (Δ n'est pas un carré parfait)");
      etapes.push("x = (−b ± √Δ)/(2a) = (" + nb(-b) + " ± " + texteRacine(s.k, s.m) + ")/" + par(2 * a));
      var f = formeRacine(-b, s.k, s.m, 2 * a);
      var v1 = (-b + Math.sqrt(delta)) / (2 * a), v2 = (-b - Math.sqrt(delta)) / (2 * a);
      return { etapes: etapes, conclusion: "x = " + f[0] + " " + approx(v1) + " ou x = " + f[1] + " " + approx(v2) };
    }

    _resoudre(id, a, b, c) {
      var eq = polynome(a, b, c) + " = 0";
      if (id === "c0") {
        if (b === 0) {
          return { titre: "c = 0 (et b = 0)", etapes: [eq + " ⟺ x² = 0"], conclusion: "x = 0 (racine double)" };
        }
        var g = (a < 0 ? -1 : 1) * gcd(a, b);
        var dedans = polynome(0, a / g, b / g);
        var devant = (g === 1 ? "" : g === -1 ? "−" : nb(g)) + "x";
        return {
          titre: "c = 0 : mettre x en évidence",
          etapes: [eq + " ⟺ " + devant + "(" + dedans + ") = 0", "Un produit est nul si l'un de ses facteurs est nul : x = 0 ou " + dedans + " = 0."],
          conclusion: "x = 0 ou x = " + frac(-b, a),
        };
      }
      if (id === "diff") {
        var p = -c, q = a; // x² = −c/a > 0
        var r = racineFraction(Math.abs(p), Math.abs(q));
        var rv = Math.sqrt(-c / a);
        var et = [eq + " ⟺ x² = " + frac(p, q)];
        et.push("x² − " + frac(p, q) + " = (x − " + r + ")(x + " + r + ") = 0 : différence de deux carrés.");
        var exact = r.indexOf("√") < 0;
        return { titre: "b = 0, a et c de signes opposés : différence de deux carrés", etapes: et, conclusion: "x = −" + r + " ou x = " + r + (exact ? "" : " (≈ ±" + nb(rv) + ")") };
      }
      if (id === "vide") {
        return {
          titre: "b = 0, a et c de même signe",
          etapes: [eq + " ⟺ x² = " + frac(-c, a), "Un carré n'est jamais négatif : aucun x ne convient, sans aucun calcul."],
          conclusion: "Aucune solution : S = ∅.",
        };
      }
      if (id === "carre") {
        // ax² + bx + c = a(x + b/(2a))² = a(x − r)², r = −b/(2a).
        var devantA = a === 1 ? "" : a === -1 ? "−" : nb(a);
        return {
          titre: "b² = 4ac : un carré parfait",
          etapes: ["b² = " + nb(b * b) + " et 4ac = " + nb(4 * a * c) + " : c'est un carré parfait.", eq + " ⟺ " + devantA + "(" + facteurX(-b, 2 * a) + ")² = 0"],
          conclusion: "x = " + frac(-b, 2 * a) + " (racine double)",
        };
      }
      if (id === "evid") {
        var plus1 = a + b + c === 0;
        return {
          titre: "Racine évidente",
          etapes: plus1
            ? ["a + b + c = " + nb(a) + " + " + par(b) + " + " + par(c) + " = 0 : x₁ = 1 est racine.", "L'autre racine, par le produit : x₂ = c/a = " + frac(c, a) + "."]
            : ["a − b + c = " + nb(a) + " − " + par(b) + " + " + par(c) + " = 0 : x₁ = −1 est racine.", "L'autre racine, par le produit : x₂ = −c/a = " + frac(-c, a) + "."],
          conclusion: plus1 ? "x = 1 ou x = " + frac(c, a) : "x = −1 ou x = " + frac(-c, a),
        };
      }
      var d = this._parDelta(a, b, c);
      return { titre: "Cas général : le discriminant", etapes: d.etapes, conclusion: d.conclusion };
    }

    _rendre() {
      var a = this._a, b = this._b, c = this._c, e = this._el;
      e.aVal.textContent = nb(a); e.bVal.textContent = nb(b); e.cVal.textContent = nb(c);
      e.formule.textContent = polynome(a, b, c) + " = 0";
      this._boutons.forEach(function (bt, i) {
        var p = PRESETS[i];
        bt.setAttribute("aria-pressed", String(p.a === a && p.b === b && p.c === c));
      });
      var actives = this._situations(a, b, c);
      this._cartes.forEach(function (li, i) {
        var id = SITUATIONS[i].id;
        li.classList.toggle("actif", actives.indexOf(id) >= 0);
        li.classList.toggle("premier", actives[0] === id);
      });
      var res = this._resoudre(actives[0], a, b, c);
      e.titreRes.textContent = res.titre;
      e.etapes.innerHTML = "";
      res.etapes.forEach(function (t) { var li = document.createElement("li"); li.textContent = t; e.etapes.appendChild(li); });
      e.conclusion.textContent = res.conclusion;
      // Seconde méthode : la racine évidente n'interdit pas le discriminant (les deux sont justes).
      var autres = [];
      if (actives.indexOf("evid") >= 0 && actives[0] !== "evid") autres.push("la racine évidente marche aussi (" + (a + b + c === 0 ? "a + b + c = 0" : "a − b + c = 0") + ")");
      if (actives[0] === "evid") {
        var d = this._parDelta(a, b, c);
        autres.push("le discriminant donne les mêmes solutions : " + d.etapes[0] + " ; " + d.conclusion + ".");
      }
      if (actives[0] === "carre" || actives[0] === "c0" || actives[0] === "diff") {
        if (actives.length > 1 && actives.indexOf("evid") < 0) autres.push("ici, plusieurs raccourcis marchent : ils donnent les mêmes solutions");
      }
      e.autre.hidden = autres.length === 0;
      e.autre.textContent = autres.length ? "Autre méthode juste : " + autres.join(" ; ") : "";
    }
  }

  if (!customElements.get("methodes-resolution-widget")) customElements.define("methodes-resolution-widget", MethodesResolutionWidget);
})();
