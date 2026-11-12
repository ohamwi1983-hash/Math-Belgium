(function () {
  "use strict";

  /* ================================================================
   * <constructeur-composees-widget> — atelier « Le constructeur de composées »
   * (5e, chapitre 1, section 2). L'élève enchaîne des briques (affine, carré,
   * cube, racine carrée, racine cubique, inverse, valeur absolue) : la formule
   * h(x) et son graphe se mettent à jour. Échanger deux briques laisse l'ancienne
   * courbe en pointillé — f∘g ≠ g∘f se voit d'un coup d'œil. Mode « défi » : une
   * écriture h(x) est proposée, l'élève reconstitue la chaîne ; verdict par
   * comparaison numérique des deux fonctions, aucun score.
   * Fenêtre FIXE x ∈ [−5 ; 5], y ∈ [−6 ; 6] — jamais recalculée.
   * ================================================================ */

  var X_MIN = -5, X_MAX = 5, Y_MIN = -6, Y_MAX = 6;
  var LARGEUR = 440, HAUTEUR = 300, MG = 34, MD = 16, MH = 16, MB = 26;
  var MAX_BRIQUES = 5;

  var TYPES = {
    affine: { nom: "ax + b" },
    carre: { nom: "x²" },
    cube: { nom: "x³" },
    racine: { nom: "√x" },
    racine3: { nom: "∛x" },
    inverse: { nom: "1/x" },
    abs: { nom: "|x|" },
  };
  var ORDRE_TYPES = ["affine", "carre", "cube", "racine", "racine3", "inverse", "abs"];

  function nombreFr(n) {
    var arrondi = Math.round(n * 100) / 100;
    var s = String(arrondi).replace(".", ",");
    return s.replace("-", "−");
  }

  function svgEl(ns, tag, attrs) {
    var el = document.createElementNS(ns, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  // ---------- Calcul ----------
  function appliquer(brique, u) {
    if (!isFinite(u)) return NaN;
    switch (brique.type) {
      case "affine": return brique.a * u + brique.b;
      case "carre": return u * u;
      case "cube": return u * u * u;
      case "racine": return u < 0 ? NaN : Math.sqrt(u);
      case "racine3": return Math.cbrt(u);
      case "inverse": return u === 0 ? NaN : 1 / u;
      case "abs": return Math.abs(u);
    }
    return NaN;
  }

  function evaluer(chaine, x) {
    var v = x;
    for (var i = 0; i < chaine.length; i++) {
      v = appliquer(chaine[i], v);
      if (!isFinite(v)) return NaN;
    }
    return v;
  }

  // ---------- Écriture ----------
  // Expression = { txt, niveau } — niveau : "x" (la variable seule), "delimite" (valeur
  // absolue : ses barres suffisent, jamais de parenthèses en plus), "primaire" (puissance,
  // racine), "produit" (coefficient, quotient), "somme".
  function entre(u) { return "(" + u.txt + ")"; }
  function nu(u) { return u.niveau === "x" || u.niveau === "delimite"; }

  function ecrire(brique, u) {
    switch (brique.type) {
      case "affine": {
        var a = brique.a, b = brique.b, coeff;
        if (a === 1 && b === 0) return u;
        var noyau = nu(u) || u.niveau === "primaire" ? u.txt : entre(u);
        if (a === 1) coeff = noyau;
        else if (a === -1) coeff = "−" + noyau;
        else coeff = nombreFr(a) + noyau;
        if (b === 0) return { txt: coeff, niveau: "produit" };
        var signe = b > 0 ? " + " : " − ";
        return { txt: coeff + signe + nombreFr(Math.abs(b)), niveau: "somme" };
      }
      case "carre":
        return { txt: (nu(u) ? u.txt : entre(u)) + "²", niveau: "primaire" };
      case "cube":
        return { txt: (nu(u) ? u.txt : entre(u)) + "³", niveau: "primaire" };
      case "racine":
        return { txt: "√" + (nu(u) ? u.txt : entre(u)), niveau: "primaire" };
      case "racine3":
        return { txt: "∛" + (nu(u) ? u.txt : entre(u)), niveau: "primaire" };
      case "inverse":
        return { txt: "1/" + (nu(u) || u.niveau === "primaire" ? u.txt : entre(u)), niveau: "produit" };
      case "abs":
        return { txt: "|" + u.txt + "|", niveau: "delimite" };
    }
    return u;
  }

  function formule(chaine) {
    var u = { txt: "x", niveau: "x" };
    for (var i = 0; i < chaine.length; i++) u = ecrire(chaine[i], u);
    return u.txt;
  }

  function formuleBrique(brique) {
    return ecrire(brique, { txt: "x", niveau: "x" }).txt;
  }

  // ---------- Défi ----------
  function entierParmi(liste) { return liste[Math.floor(Math.random() * liste.length)]; }

  function briqueAleatoire() {
    var type = entierParmi(ORDRE_TYPES);
    if (type === "affine") return { type: "affine", a: entierParmi([-3, -2, 2, 3]), b: entierParmi([-4, -3, -2, -1, 1, 2, 3, 4]) };
    return { type: type };
  }

  function pointsValides(chaine) {
    var n = 0;
    for (var i = 0; i <= 200; i++) {
      var y = evaluer(chaine, X_MIN + (i / 200) * (X_MAX - X_MIN));
      if (isFinite(y) && y >= Y_MIN && y <= Y_MAX) n++;
    }
    return n;
  }

  function memeFonction(c1, c2) {
    var compares = 0;
    for (var i = 0; i <= 160; i++) {
      var x = X_MIN + (i / 160) * (X_MAX - X_MIN) + 0.0137;
      var y1 = evaluer(c1, x), y2 = evaluer(c2, x);
      var v1 = isFinite(y1), v2 = isFinite(y2);
      if (v1 !== v2) return false;
      if (v1) {
        compares++;
        if (Math.abs(y1 - y2) > 1e-6 * Math.max(1, Math.abs(y1))) return false;
      }
    }
    return compares > 0;
  }

  function tirerDefi() {
    for (var essai = 0; essai < 200; essai++) {
      var longueur = Math.random() < 0.55 ? 2 : 3;
      var chaine = [];
      for (var i = 0; i < longueur; i++) chaine.push(briqueAleatoire());
      var ok = true;
      for (var j = 1; j < chaine.length; j++) {
        // Deux briques identiques à la suite ou paires qui s'annulent : défi sans intérêt.
        var p = chaine[j - 1].type, q = chaine[j].type;
        if (p === q) ok = false;
        if ((p === "carre" && q === "racine") || (p === "cube" && q === "racine3") || (p === "racine3" && q === "cube")) ok = false;
        if ((p === "carre" || p === "abs") && q === "abs") ok = false;
      }
      if (!ok) continue;
      if (pointsValides(chaine) < 50) continue;
      if (memeFonction(chaine, [])) continue;
      return chaine;
    }
    return [{ type: "affine", a: 2, b: -1 }, { type: "racine" }];
  }

  // ---------- Gabarit ----------
  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    "<style>" +
    ":host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}" +
    "*{box-sizing:border-box;}" +
    "[hidden]{display:none!important;}" +
    ".mode{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-bottom:12px;}" +
    "button{font-family:inherit;font-size:0.88rem;font-weight:600;color:var(--ink,#241f1a);background:var(--surface,#fff);border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:6px 10px;cursor:pointer;min-height:34px;}" +
    "button:hover{border-color:var(--accent,#a8471f);}" +
    "button:disabled{opacity:0.45;cursor:default;}" +
    "button.actif{background:var(--accent,#a8471f);color:var(--on-accent,#fff);border-color:var(--accent,#a8471f);}" +
    ".formule{text-align:center;font-family:var(--serif,serif);font-size:1.12rem;font-weight:600;margin:4px 0 10px;overflow-wrap:anywhere;}" +
    ".formule .h{color:var(--accent-ink,#7a3212);font-style:italic;}" +
    ".cible{text-align:center;font-family:var(--serif,serif);font-size:1.05rem;margin:0 0 6px;color:var(--sky-ink,#1d5a7a);overflow-wrap:anywhere;}" +
    ".graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}" +
    "svg{width:100%;max-width:440px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}" +
    ".grille{stroke:var(--line-soft,#ece4d6);stroke-width:1;}" +
    ".axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}" +
    ".fleche{fill:var(--ink-soft,#6b6055);}" +
    ".grad{font-size:10.5px;font-family:var(--mono,monospace);fill:var(--ink-soft,#6b6055);}" +
    ".courbe{stroke:var(--accent,#a8471f);stroke-width:2.6;fill:none;stroke-linejoin:round;}" +
    ".fantome{stroke:var(--ink-faint,#9c9083);stroke-width:2;fill:none;stroke-dasharray:5 4;}" +
    ".cible-courbe{stroke:var(--sky,#2f7fa8);stroke-width:5;fill:none;opacity:0.45;stroke-linecap:round;}" +
    ".legende{font-size:11px;font-family:var(--sans,sans-serif);}" +
    ".legende-h{fill:var(--accent-ink,#7a3212);font-weight:700;}" +
    ".legende-f{fill:var(--ink-soft,#6b6055);}" +
    ".legende-c{fill:var(--sky-ink,#1d5a7a);font-weight:700;}" +
    ".verdict{text-align:center;font-weight:600;font-size:0.92rem;padding:8px 12px;border-radius:var(--radius,3px);margin:0 0 12px;}" +
    ".verdict.ok{background:var(--good-soft,#e2f0e7);color:var(--good,#2f7a4f);}" +
    ".verdict.non{background:var(--surface-2,#faf6f0);color:var(--ink-soft,#6b6055);border:1px solid var(--line,#e2d8c8);}" +
    ".palette{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-bottom:10px;}" +
    ".palette-titre{width:100%;text-align:center;font-size:0.82rem;color:var(--ink-soft,#6b6055);}" +
    ".chaine{display:flex;flex-direction:column;gap:8px;margin-bottom:10px;}" +
    ".chaine-vide{text-align:center;font-size:0.88rem;color:var(--ink-soft,#6b6055);font-style:italic;}" +
    ".brique{border:1px solid var(--line,#e2d8c8);border-left:4px solid var(--accent,#a8471f);border-radius:var(--radius,3px);background:var(--surface,#fff);padding:8px 10px;display:flex;flex-wrap:wrap;align-items:center;gap:8px;}" +
    ".brique-nom{font-family:var(--serif,serif);font-weight:600;flex:1 1 140px;min-width:0;overflow-wrap:anywhere;}" +
    ".brique-ordre{font-size:0.78rem;color:var(--ink-soft,#6b6055);display:block;font-family:var(--sans,sans-serif);font-weight:500;}" +
    ".brique-actions{display:flex;gap:4px;}" +
    ".brique-actions button{padding:4px 8px;min-width:34px;}" +
    ".reglages{display:flex;flex-wrap:wrap;gap:10px;width:100%;}" +
    ".reglage{display:flex;align-items:center;gap:6px;flex:1 1 140px;font-size:0.85rem;}" +
    ".reglage input{flex:1 1 auto;accent-color:var(--accent,#a8471f);min-width:0;}" +
    ".reglage span{min-width:30px;text-align:right;font-variant-numeric:tabular-nums;}" +
    ".actions-defi{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:8px;}" +
    ".solution{text-align:center;font-size:0.9rem;color:var(--ink-soft,#6b6055);margin:0 0 8px;overflow-wrap:anywhere;}" +
    ".note{text-align:center;font-size:0.82rem;color:var(--ink-soft,#6b6055);margin:0;}" +
    "</style>" +
    '<div class="mode"><button id="mode-libre" class="actif">Construire librement</button><button id="mode-defi">Défi</button></div>' +
    '<p class="cible" id="cible" hidden></p>' +
    '<p class="formule" id="formule"></p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + " " + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Graphe de la composée h"></svg></div>' +
    '<p class="verdict" id="verdict" hidden></p>' +
    '<div class="actions-defi" id="actions-defi" hidden><button id="nouveau">Nouveau défi</button><button id="reveler">Montrer une chaîne possible</button></div>' +
    '<p class="solution" id="solution" hidden></p>' +
    '<div class="palette" id="palette"><span class="palette-titre">Ajouter une brique (appliquée en dernier) :</span></div>' +
    '<div class="chaine" id="chaine"></div>' +
    '<p class="note" id="note"></p>';

  class ConstructeurComposeesWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._s = shadow;
      this._chaine = [{ type: "affine", a: 2, b: -1 }, { type: "racine" }];
      this._fantome = null;
      this._mode = "libre";
      this._cibleChaine = null;
      this._revele = false;
    }

    connectedCallback() {
      if (this._pret) return;
      this._pret = true;
      var self = this, s = this._s;
      var palette = s.getElementById("palette");
      ORDRE_TYPES.forEach(function (t) {
        var b = document.createElement("button");
        b.textContent = TYPES[t].nom;
        b.setAttribute("aria-label", "Ajouter la brique " + TYPES[t].nom);
        b.dataset.type = t;
        b.addEventListener("click", function () { self._ajouter(t); });
        palette.appendChild(b);
      });
      s.getElementById("mode-libre").addEventListener("click", function () { self._changerMode("libre"); });
      s.getElementById("mode-defi").addEventListener("click", function () { self._changerMode("defi"); });
      s.getElementById("nouveau").addEventListener("click", function () { self._nouveauDefi(); });
      s.getElementById("reveler").addEventListener("click", function () { self._revele = true; self._rendre(); });
      this._rendreChaine();
      this._rendre();
    }

    _changerMode(mode) {
      this._mode = mode;
      this._s.getElementById("mode-libre").classList.toggle("actif", mode === "libre");
      this._s.getElementById("mode-defi").classList.toggle("actif", mode === "defi");
      this._fantome = null;
      if (mode === "defi") this._nouveauDefi();
      else { this._cibleChaine = null; this._rendre(); }
    }

    _nouveauDefi() {
      this._cibleChaine = tirerDefi();
      this._chaine = [];
      this._fantome = null;
      this._revele = false;
      this._rendreChaine();
      this._rendre();
    }

    _ajouter(type) {
      if (this._chaine.length >= MAX_BRIQUES) return;
      this._fantome = null;
      this._chaine.push(type === "affine" ? { type: "affine", a: 2, b: 1 } : { type: type });
      this._rendreChaine();
      this._rendre();
    }

    _deplacer(i, sens) {
      var j = i + sens;
      if (j < 0 || j >= this._chaine.length) return;
      // L'ancienne courbe reste en pointillé : l'échange de deux briques se voit.
      this._fantome = this._chaine.slice();
      var t = this._chaine[i];
      this._chaine[i] = this._chaine[j];
      this._chaine[j] = t;
      this._rendreChaine();
      this._rendre();
    }

    _retirer(i) {
      this._fantome = null;
      this._chaine.splice(i, 1);
      this._rendreChaine();
      this._rendre();
    }

    _rendreChaine() {
      var self = this, zone = this._s.getElementById("chaine");
      zone.innerHTML = "";
      var palette = this._s.getElementById("palette");
      palette.querySelectorAll("button").forEach(function (b) { b.disabled = self._chaine.length >= MAX_BRIQUES; });
      if (this._chaine.length === 0) {
        var vide = document.createElement("p");
        vide.className = "chaine-vide";
        vide.textContent = "Aucune brique : h(x) = x. Ajoute une brique ci-dessus.";
        zone.appendChild(vide);
        return;
      }
      this._chaine.forEach(function (br, i) {
        var carte = document.createElement("div");
        carte.className = "brique";
        var nom = document.createElement("div");
        nom.className = "brique-nom";
        var ordre = document.createElement("span");
        ordre.className = "brique-ordre";
        ordre.textContent = i === 0 ? "Étage 1 — appliqué en premier" : "Étage " + (i + 1) + (i === self._chaine.length - 1 ? " — appliqué en dernier" : "");
        nom.appendChild(ordre);
        var expr = document.createElement("span");
        expr.className = "brique-expr";
        expr.textContent = "f" + "₁₂₃₄₅"[i] + "(x) = " + formuleBrique(br);
        nom.appendChild(expr);
        carte.appendChild(nom);
        var actions = document.createElement("div");
        actions.className = "brique-actions";
        [["↑", -1, "Monter (appliquer plus tôt)"], ["↓", 1, "Descendre (appliquer plus tard)"]].forEach(function (def) {
          var b = document.createElement("button");
          b.textContent = def[0];
          b.setAttribute("aria-label", def[2]);
          b.disabled = (def[1] === -1 && i === 0) || (def[1] === 1 && i === self._chaine.length - 1);
          b.addEventListener("click", function () { self._deplacer(i, def[1]); });
          actions.appendChild(b);
        });
        var suppr = document.createElement("button");
        suppr.textContent = "✕";
        suppr.setAttribute("aria-label", "Retirer cette brique");
        suppr.addEventListener("click", function () { self._retirer(i); });
        actions.appendChild(suppr);
        carte.appendChild(actions);
        if (br.type === "affine") {
          var reglages = document.createElement("div");
          reglages.className = "reglages";
          [["a", -3, 3], ["b", -5, 5]].forEach(function (def) {
            var lab = document.createElement("label");
            lab.className = "reglage";
            lab.textContent = def[0] + " ";
            var input = document.createElement("input");
            input.type = "range";
            input.min = String(def[1]);
            input.max = String(def[2]);
            input.step = "0.5";
            input.value = String(br[def[0]]);
            var val = document.createElement("span");
            val.textContent = nombreFr(br[def[0]]);
            input.addEventListener("input", function () {
              var v = parseFloat(input.value);
              // a = 0 écraserait toute la chaîne en dessous (fonction constante) : repoussé.
              if (def[0] === "a" && v === 0) v = br.a > 0 ? -0.5 : 0.5;
              input.value = String(v);
              br[def[0]] = v;
              val.textContent = nombreFr(v);
              self._fantome = null;
              expr.textContent = "f" + "₁₂₃₄₅"[i] + "(x) = " + formuleBrique(br);
              self._rendre();
            });
            lab.appendChild(input);
            lab.appendChild(val);
            reglages.appendChild(lab);
          });
          carte.appendChild(reglages);
        }
        zone.appendChild(carte);
      });
    }

    _rendre() {
      var s = this._s;
      var defi = this._mode === "defi" && this._cibleChaine;
      s.getElementById("formule").innerHTML = '<span class="h">h</span>(x) = ' + echapper(formule(this._chaine));
      var cible = s.getElementById("cible");
      cible.hidden = !defi;
      if (defi) cible.textContent = "Défi : reconstitue h(x) = " + formule(this._cibleChaine);
      s.getElementById("actions-defi").hidden = !defi;
      var verdict = s.getElementById("verdict");
      var solution = s.getElementById("solution");
      if (defi) {
        var ok = this._chaine.length > 0 && memeFonction(this._chaine, this._cibleChaine);
        verdict.hidden = false;
        verdict.className = "verdict " + (ok ? "ok" : "non");
        verdict.textContent = ok
          ? "Bravo : ta chaîne donne exactement la même fonction que h — les deux courbes coïncident."
          : "Pas encore : ta courbe (orange) ne se superpose pas à celle de h (bleue).";
        solution.hidden = !this._revele;
        if (this._revele) {
          solution.textContent = "Une chaîne possible, de l'étage 1 au dernier : " + this._cibleChaine.map(formuleBrique).join("  →  ");
        }
      } else {
        verdict.hidden = true;
        solution.hidden = true;
      }
      s.getElementById("note").textContent = this._fantome
        ? "Pointillé : la courbe avant l'échange. L'ordre des étages change la fonction — f∘g ≠ g∘f en général."
        : "Échange deux étages avec ↑ ↓ pour comparer les deux ordres.";
      this._dessiner();
    }

    _dessiner() {
      var ns = "http://www.w3.org/2000/svg", svg = this._s.getElementById("svg");
      svg.innerHTML = "";
      var defs = svgEl(ns, "defs", {});
      var marker = svgEl(ns, "marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      marker.appendChild(svgEl(ns, "path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(marker);
      svg.appendChild(defs);
      var px = function (x) { return MG + (x - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - MG - MD); };
      var py = function (y) { return MH + (Y_MAX - y) / (Y_MAX - Y_MIN) * (HAUTEUR - MH - MB); };
      for (var gx = X_MIN; gx <= X_MAX; gx++) svg.appendChild(svgEl(ns, "line", { x1: px(gx), x2: px(gx), y1: py(Y_MIN), y2: py(Y_MAX), class: "grille" }));
      for (var gy = Y_MIN; gy <= Y_MAX; gy++) svg.appendChild(svgEl(ns, "line", { x1: px(X_MIN), x2: px(X_MAX), y1: py(gy), y2: py(gy), class: "grille" }));
      svg.appendChild(svgEl(ns, "line", { x1: px(X_MIN), x2: px(X_MAX) + 6, y1: py(0), y2: py(0), class: "axe", "marker-end": "url(#fleche)" }));
      svg.appendChild(svgEl(ns, "line", { x1: px(0), x2: px(0), y1: py(Y_MIN), y2: py(Y_MAX) - 6, class: "axe", "marker-end": "url(#fleche)" }));
      for (var tx = -4; tx <= 4; tx += 2) {
        if (tx === 0) continue;
        var t = svgEl(ns, "text", { x: px(tx), y: py(0) + 14, "text-anchor": "middle", class: "grad" });
        t.textContent = nombreFr(tx);
        svg.appendChild(t);
      }
      for (var ty = -4; ty <= 4; ty += 2) {
        if (ty === 0) continue;
        var t2 = svgEl(ns, "text", { x: px(0) - 5, y: py(ty) + 3.5, "text-anchor": "end", class: "grad" });
        t2.textContent = nombreFr(ty);
        svg.appendChild(t2);
      }
      var defi = this._mode === "defi" && this._cibleChaine;
      if (defi) tracer(svg, ns, this._cibleChaine, px, py, "cible-courbe");
      if (this._fantome) tracer(svg, ns, this._fantome, px, py, "fantome");
      tracer(svg, ns, this._chaine, px, py, "courbe");
      var leg = [["h(x) — ta chaîne", "legende-h"]];
      if (defi) leg.push(["h(x) du défi", "legende-c"]);
      if (this._fantome) leg.push(["avant l'échange", "legende-f"]);
      leg.forEach(function (l, i) {
        var et = svgEl(ns, "text", { x: LARGEUR - MD - 4, y: MH + 12 + i * 14, "text-anchor": "end", class: "legende " + l[1] });
        et.textContent = l[0];
        svg.appendChild(et);
      });
    }
  }

  function echapper(t) { return t.replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

  // Tracé coupé : hors domaine (NaN), hors fenêtre, ou saut vertical (asymptote).
  function tracer(svg, ns, chaine, px, py, classe) {
    var n = 600, d = "", precedent = null;
    for (var i = 0; i <= n; i++) {
      var x = X_MIN + (i / n) * (X_MAX - X_MIN);
      var y = evaluer(chaine, x);
      var valide = isFinite(y) && y >= Y_MIN - 0.5 && y <= Y_MAX + 0.5;
      if (valide && precedent !== null && Math.abs(y - precedent) > 4) valide = false;
      if (valide) {
        var yc = Math.max(Y_MIN, Math.min(Y_MAX, y));
        d += (precedent === null ? "M" : "L") + px(x).toFixed(1) + " " + py(yc).toFixed(1) + " ";
        precedent = y;
      } else {
        precedent = null;
      }
    }
    if (d) svg.appendChild(svgEl(ns, "path", { d: d.trim(), class: classe }));
  }

  if (!customElements.get("constructeur-composees-widget")) {
    customElements.define("constructeur-composees-widget", ConstructeurComposeesWidget);
  }
})();
