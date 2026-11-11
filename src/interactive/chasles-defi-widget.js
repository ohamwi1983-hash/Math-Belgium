(function () {
  "use strict";

  /* ================================================================
   * <chasles-defi-widget> — défi (4e, ch. 6, § 6) : sur une figure fixe
   * nommée (hexagone ABCDEF de centre O, parallélogramme ABCD de centre
   * O, triangle ABC avec les milieux I, J, K), une expression vectorielle
   * est tirée (vecteurs à réordonner, à retourner, soustractions,
   * chaînes fermées). L'élève choisit le résultat parmi 4 propositions
   * (dont les pièges classiques, ex. BC pour AB − AC = CB), en UN SEUL
   * essai ; la correction affiche alors le télescopage pas à pas et
   * dessine la chaîne sur la figure. « Nouvelle expression » relance ;
   * jamais de score. Une seule proposition est juste : les autres sont
   * filtrées numériquement (deux vecteurs égaux de la figure, comme AB
   * et DC dans le parallélogramme, ne peuvent pas coexister comme
   * « bonne » et « mauvaise » réponse). Web Component (Shadow DOM).
   * ================================================================ */

  var SVGNS = "http://www.w3.org/2000/svg";
  var LARGEUR = 420, HAUTEUR = 300;

  function hexagone() {
    var c = { x: 210, y: 150 }, r = 112, pts = {}, noms = ["A", "B", "C", "D", "E", "F"];
    noms.forEach(function (n, i) {
      var ang = (180 + 60 * i) * Math.PI / 180;
      pts[n] = { x: c.x + r * Math.cos(ang), y: c.y - r * Math.sin(ang) };
    });
    pts.O = { x: c.x, y: c.y };
    return { nom: "l'hexagone régulier ABCDEF de centre O", points: pts, contour: noms, extra: [], segments: [] };
  }
  function parallelogramme() {
    var pts = { A: { x: 58, y: 248 }, B: { x: 290, y: 248 }, C: { x: 366, y: 62 }, D: { x: 134, y: 62 } };
    pts.O = { x: (pts.A.x + pts.C.x) / 2, y: (pts.A.y + pts.C.y) / 2 };
    return { nom: "le parallélogramme ABCD de centre O", points: pts, contour: ["A", "B", "C", "D"], segments: [["A", "C"], ["B", "D"]] };
  }
  function triangle() {
    var pts = { A: { x: 52, y: 254 }, B: { x: 368, y: 254 }, C: { x: 196, y: 44 } };
    pts.I = { x: (pts.A.x + pts.B.x) / 2, y: (pts.A.y + pts.B.y) / 2 };
    pts.J = { x: (pts.B.x + pts.C.x) / 2, y: (pts.B.y + pts.C.y) / 2 };
    pts.K = { x: (pts.C.x + pts.A.x) / 2, y: (pts.C.y + pts.A.y) / 2 };
    return { nom: "le triangle ABC, avec I, J, K milieux de [AB], [BC], [CA]", points: pts, contour: ["A", "B", "C"], segments: [] };
  }
  var FIGURES = [hexagone, parallelogramme, triangle];

  // Modèles : P, Q, R, S = 4 points distincts. termes : [origine, extrémité, signe].
  // chaine : vecteurs dans l'ordre du télescopage ; res : [origine, extrémité] ou null (vecteur nul).
  var MODELES = [
    { termes: [["P", "Q", 1], ["R", "S", 1], ["Q", "R", 1]], n: 4,
      etapes: ["On réordonne pour que les vecteurs se suivent : {PQ} + {QR} + {RS}", "{PQ} + {QR} = {PR}", "{PR} + {RS} = {PS}"],
      chaine: [["P", "Q"], ["Q", "R"], ["R", "S"]], res: ["P", "S"], pieges: [["S", "P"], ["P", "R"], ["Q", "S"]] },
    { termes: [["P", "Q", 1], ["P", "R", -1]], n: 3,
      etapes: ["Soustraire, c'est ajouter l'opposé : −{PR} = {RP}, donc {PQ} − {PR} = {PQ} + {RP}", "On réordonne : {RP} + {PQ}", "{RP} + {PQ} = {RQ}"],
      chaine: [["R", "P"], ["P", "Q"]], res: ["R", "Q"], pieges: [["Q", "R"], ["Q", "P"], ["P", "R"]] },
    { termes: [["P", "Q", 1], ["Q", "R", 1], ["R", "P", 1]], n: 3,
      etapes: ["{PQ} + {QR} = {PR}", "{PR} + {RP} = {PP} = {0} : la chaîne est fermée, elle revient à son point de départ"],
      chaine: [["P", "Q"], ["Q", "R"], ["R", "P"]], res: null, pieges: [["P", "R"], ["R", "P"], ["P", "Q"]] },
    { termes: [["P", "Q", 1], ["R", "Q", -1]], n: 3,
      etapes: ["−{RQ} = {QR}, donc {PQ} − {RQ} = {PQ} + {QR}", "{PQ} + {QR} = {PR}"],
      chaine: [["P", "Q"], ["Q", "R"]], res: ["P", "R"], pieges: [["R", "P"], ["P", "Q"], ["Q", "R"]] },
    { termes: [["Q", "R", 1], ["P", "Q", 1]], n: 3,
      etapes: ["On réordonne : {PQ} + {QR}", "{PQ} + {QR} = {PR}"],
      chaine: [["P", "Q"], ["Q", "R"]], res: ["P", "R"], pieges: [["R", "P"], ["Q", "P"], null] },
    { termes: [["P", "Q", 1], ["R", "S", 1], ["R", "Q", -1]], n: 4,
      etapes: ["−{RQ} = {QR}, donc l'expression vaut {PQ} + {QR} + {RS}", "{PQ} + {QR} = {PR}", "{PR} + {RS} = {PS}"],
      chaine: [["P", "Q"], ["Q", "R"], ["R", "S"]], res: ["P", "S"], pieges: [["S", "P"], ["Q", "S"], ["P", "R"]] },
    { termes: [["P", "Q", 1], ["Q", "R", 1], ["P", "R", -1]], n: 3,
      etapes: ["{PQ} + {QR} = {PR}", "{PR} − {PR} = {PR} + {RP} = {PP} = {0} : la chaîne revient à son point de départ"],
      chaine: [["P", "Q"], ["Q", "R"], ["R", "P"]], res: null, pieges: [["P", "R"], ["R", "P"], ["Q", "P"]] },
    { termes: [["Q", "P", 1], ["Q", "R", -1]], n: 3,
      etapes: ["−{QR} = {RQ}, donc {QP} − {QR} = {QP} + {RQ}", "On réordonne : {RQ} + {QP}", "{RQ} + {QP} = {RP}"],
      chaine: [["R", "Q"], ["Q", "P"]], res: ["R", "P"], pieges: [["P", "R"], ["P", "Q"], ["R", "Q"]] },
    { termes: [["P", "Q", 1], ["R", "P", 1], ["S", "R", 1]], n: 4,
      etapes: ["On réordonne : {SR} + {RP} + {PQ}", "{SR} + {RP} = {SP}", "{SP} + {PQ} = {SQ}"],
      chaine: [["S", "R"], ["R", "P"], ["P", "Q"]], res: ["S", "Q"], pieges: [["Q", "S"], ["S", "P"], ["P", "R"]] }
  ];

  function vecHtml(nom) { return '<span class="vec">' + nom + '</span>'; }
  function melanger(t) { for (var i = t.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = t[i]; t[i] = t[j]; t[j] = x; } return t; }
  function el(tag, attrs, parent) {
    var e = document.createElementNS(SVGNS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#182430);}' +
    '*{box-sizing:border-box;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:10px;}' +
    'svg{width:100%;max-width:520px;height:auto;background:var(--surface-2,#f7f9fb);border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);}' +
    '.contour{fill:var(--accent,#b65c1f);fill-opacity:0.05;stroke:var(--ink-soft,#51626f);stroke-width:1.6;stroke-linejoin:round;}' +
    '.segment{stroke:var(--ink-soft,#51626f);stroke-width:1;stroke-dasharray:4 4;}' +
    '.point{fill:var(--ink,#182430);}' +
    '.etiq{font-size:16px;font-weight:700;font-family:var(--sans,sans-serif);fill:var(--ink,#182430);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.v-chaine{stroke:var(--plan,#5b4ea3);stroke-width:3;} .t-chaine{fill:var(--plan,#5b4ea3);}' +
    '.v-res{stroke:var(--accent,#b65c1f);stroke-width:3.5;stroke-dasharray:8 5;} .t-res{fill:var(--accent,#b65c1f);}' +
    '.nul{fill:none;stroke:var(--accent,#b65c1f);stroke-width:2.5;}' +
    '.vec{display:inline-block;position:relative;padding-top:0.45em;line-height:1.05;}' +
    '.vec::before{content:"";position:absolute;left:0.05em;right:0.3em;top:0.18em;border-top:1.5px solid currentColor;}' +
    '.vec::after{content:"";position:absolute;right:0;top:calc(0.18em - 3.2px);border-left:6px solid currentColor;border-top:3.7px solid transparent;border-bottom:3.7px solid transparent;}' +
    '.enonce{padding:12px;border-radius:var(--radius,3px);background:var(--surface-2,#f7f9fb);border:1px solid var(--line,#ccd8e0);margin-bottom:12px;line-height:1.6;}' +
    '.enonce-fig{font-size:0.88rem;color:var(--ink-soft,#51626f);}' +
    '.expr{font-size:1.25rem;font-weight:700;margin-top:4px;font-variant-numeric:tabular-nums;}' +
    '.options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-bottom:12px;}' +
    '.opt{min-height:52px;padding:8px 10px;border-radius:var(--radius,3px);border:1.5px solid var(--line,#ccd8e0);background:var(--surface,#fff);color:var(--ink,#182430);font-weight:700;font-size:1.15rem;cursor:pointer;font-family:inherit;}' +
    '.opt:hover:not(:disabled){border-color:var(--accent,#b65c1f);}' +
    '.opt:focus-visible{outline:2px solid var(--accent,#b65c1f);outline-offset:2px;}' +
    '.opt:disabled{cursor:default;}' +
    '.opt.juste{border-color:var(--good,#2f7a4f);background:color-mix(in srgb,var(--good,#2f7a4f) 12%,var(--surface,#fff));color:var(--good,#2f7a4f);}' +
    '.opt.faux{border-color:var(--bad,#b23a3a);background:color-mix(in srgb,var(--bad,#b23a3a) 10%,var(--surface,#fff));color:var(--bad,#b23a3a);}' +
    '.marque{font-size:0.95rem;margin-left:6px;}' +
    '.correction{padding:12px;border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);background:var(--surface-2,#f7f9fb);line-height:1.65;margin-bottom:12px;}' +
    '.verdict{font-weight:700;margin-bottom:6px;}' +
    '.verdict-ok{color:var(--good,#2f7a4f);} .verdict-ko{color:var(--bad,#b23a3a);}' +
    '.correction ol{margin:4px 0 0;padding-left:1.4em;}' +
    '.legende{font-size:0.85rem;color:var(--ink-soft,#51626f);margin-top:6px;}' +
    '.c-chaine{color:var(--plan,#5b4ea3);font-weight:700;} .c-res{color:var(--accent,#b65c1f);font-weight:700;}' +
    '.consigne{font-size:0.9rem;color:var(--ink-soft,#51626f);margin-bottom:8px;}' +
    '.controles{display:flex;justify-content:center;}' +
    '.btn{min-height:44px;min-width:44px;padding:8px 16px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-family:inherit;font-size:0.95rem;}' +
    '.btn:focus-visible{outline:2px solid var(--accent,#b65c1f);outline-offset:2px;}' +
    '.lecture,.controles,.enonce,.consigne,.options,.correction{max-width:620px;margin-left:auto;margin-right:auto;}' +
    '</style>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" role="img" aria-label="Figure de l\'exercice"></svg></div>' +
    '<div class="enonce" id="enonce"></div>' +
    '<div class="consigne">Choisis le vecteur égal à cette expression — un seul essai.</div>' +
    '<div class="options" id="options"></div>' +
    '<div class="correction" id="correction" hidden aria-live="polite"></div>' +
    '<div class="controles"><button class="btn" type="button" id="nouveau">Nouvelle expression</button></div>';

  class ChaslesDefiWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._svg = shadow.getElementById("svg");
      this._enonce = shadow.getElementById("enonce");
      this._options = shadow.getElementById("options");
      this._correction = shadow.getElementById("correction");
      this._ecouteurs = [];
      this._exo = null;
    }

    connectedCallback() {
      var self = this;
      function ecoute(c, t, f) { c.addEventListener(t, f); self._ecouteurs.push([c, t, f]); }
      ecoute(this.shadowRoot.getElementById("nouveau"), "click", function () { self._nouveau(); });
      ecoute(this._options, "click", function (e) {
        var b = e.target.closest ? e.target.closest("button[data-i]") : null;
        if (!b || b.disabled) return;
        self._repondre(parseInt(b.getAttribute("data-i"), 10));
      });
      this._nouveau();
    }

    disconnectedCallback() {
      this._ecouteurs.forEach(function (t) { t[0].removeEventListener(t[1], t[2]); });
      this._ecouteurs = [];
    }

    _vecteur(pts, paire) {
      if (!paire) return { x: 0, y: 0 };
      if (paire.k) return { x: paire.k * (pts[paire[1]].x - pts[paire[0]].x), y: paire.k * (pts[paire[1]].y - pts[paire[0]].y) };
      return { x: pts[paire[1]].x - pts[paire[0]].x, y: pts[paire[1]].y - pts[paire[0]].y };
    }

    _egaux(u, v) { return Math.abs(u.x - v.x) < 1e-6 && Math.abs(u.y - v.y) < 1e-6; }

    _nouveau() {
      var fig = FIGURES[Math.floor(Math.random() * FIGURES.length)]();
      var modele;
      // évite de reproposer exactement le même modèle deux fois de suite
      do { modele = MODELES[Math.floor(Math.random() * MODELES.length)]; } while (this._exo && modele === this._exo.modele && MODELES.length > 1);
      var noms = melanger(Object.keys(fig.points)).slice(0, modele.n);
      var map = { P: noms[0], Q: noms[1], R: noms[2], S: noms[3] };
      function tr(paire) { return paire ? [map[paire[0]], map[paire[1]]] : null; }
      var termes = modele.termes.map(function (t) { return [map[t[0]], map[t[1]], t[2]]; });
      var res = tr(modele.res);
      var pts = fig.points, self = this;

      // résultat numérique indépendant du modèle (somme des termes)
      var somme = { x: 0, y: 0 };
      termes.forEach(function (t) { var v = self._vecteur(pts, [t[0], t[1]]); somme.x += t[2] * v.x; somme.y += t[2] * v.y; });
      if (!this._egaux(somme, this._vecteur(pts, res))) throw new Error("modèle incohérent");

      var options = [res];
      function cle(p) { return p ? p[0] + p[1] : "0"; }
      var vus = {}; vus[cle(res)] = true;
      var valeurs = [this._vecteur(pts, res)];
      function essayer(p) {
        if (vus[cle(p)]) return false;
        var v = self._vecteur(pts, p);
        for (var i = 0; i < valeurs.length; i++) if (self._egaux(v, valeurs[i])) return false;
        vus[cle(p)] = true; valeurs.push(v); options.push(p);
        return true;
      }
      modele.pieges.forEach(function (p) { if (options.length < 4) essayer(tr(p)); });
      var tous = Object.keys(pts), garde = 0;
      while (options.length < 4 && garde < 500) {
        garde++;
        var a = tous[Math.floor(Math.random() * tous.length)], b = tous[Math.floor(Math.random() * tous.length)];
        if (a === b) continue;
        essayer([a, b]);
      }
      if (options.length < 4 && res) essayer(null);
      melanger(options);
      var correct = -1;
      for (var i = 0; i < options.length; i++) if (cle(options[i]) === cle(res)) correct = i;

      this._exo = { figure: fig, modele: modele, map: map, termes: termes, res: res, options: options, correct: correct, repondu: false };
      this._rendreEnonce();
      this._dessiner(false);
      this._correction.hidden = true;
      this._correction.innerHTML = "";
    }

    _nomHtml(p) { return p ? vecHtml(p[0] + p[1]) : vecHtml("0"); }

    _rendreEnonce() {
      var X = this._exo, self = this;
      var expr = X.termes.map(function (t, i) {
        var s = self._nomHtml([t[0], t[1]]);
        if (i === 0) return (t[2] < 0 ? "−" : "") + s;
        return (t[2] < 0 ? " − " : " + ") + s;
      }).join("");
      this._enonce.innerHTML = '<div class="enonce-fig">Dans ' + X.figure.nom + ', réduis :</div><div class="expr">' + expr + '</div>';
      this._options.innerHTML = X.options.map(function (p, i) {
        return '<button class="opt" type="button" data-i="' + i + '">' + self._nomHtml(p) + '</button>';
      }).join("");
    }

    _repondre(i) {
      var X = this._exo, self = this;
      if (X.repondu) return;
      X.repondu = true;
      X.choix = i;
      var boutons = this._options.querySelectorAll("button");
      Array.prototype.forEach.call(boutons, function (b, j) {
        b.disabled = true;
        if (j === X.correct) { b.classList.add("juste"); b.insertAdjacentHTML("beforeend", '<span class="marque">✓</span>'); }
        else if (j === i) { b.classList.add("faux"); b.insertAdjacentHTML("beforeend", '<span class="marque">✗</span>'); }
      });
      var map = X.map;
      function remplace(txt) {
        return txt.replace(/\{([PQRS]{2}|0)\}/g, function (m, g) {
          if (g === "0") return vecHtml("0");
          return vecHtml(map[g[0]] + map[g[1]]);
        });
      }
      var ok = i === X.correct;
      var h = '<div class="verdict ' + (ok ? 'verdict-ok">Juste !' : 'verdict-ko">Ce n\'est pas ça.') + ' La réponse est ' + this._nomHtml(X.res) + '.</div>';
      h += '<ol>' + X.modele.etapes.map(function (e) { return '<li>' + remplace(e) + '</li>'; }).join("") + '</ol>';
      h += '<div class="legende"><span class="c-chaine">Violet</span> : la chaîne de vecteurs qui se suivent. ' +
        (X.res ? '<span class="c-res">Orange</span> : le vecteur résultat, du premier point au dernier.' : 'La chaîne revient à son point de départ : <span class="c-res">vecteur nul</span>.') + '</div>';
      this._correction.innerHTML = h;
      this._correction.hidden = false;
      this._dessiner(true);
    }

    _fleche(svg, a, b, cTrait, cTete, decal) {
      var dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy);
      if (L < 1) return;
      var ux = dx / L, uy = dy / L;
      var ox = -uy * (decal || 0), oy = ux * (decal || 0);
      var ax = a.x + ux * 6 + ox, ay = a.y + uy * 6 + oy, bxp = b.x - ux * 6 + ox, byp = b.y - uy * 6 + oy;
      var t = 13, l = 6, bx = bxp - ux * t, by = byp - uy * t;
      el("line", { x1: ax.toFixed(1), y1: ay.toFixed(1), x2: bx.toFixed(1), y2: by.toFixed(1), class: cTrait }, svg);
      el("path", { d: "M" + bxp.toFixed(1) + "," + byp.toFixed(1) + " L" + (bx - uy * l).toFixed(1) + "," + (by + ux * l).toFixed(1) + " L" + (bx + uy * l).toFixed(1) + "," + (by - ux * l).toFixed(1) + " Z", class: cTete }, svg);
    }

    _dessiner(avecChaine) {
      var X = this._exo, fig = X.figure, pts = fig.points, svg = this._svg, self = this;
      svg.innerHTML = "";
      el("polygon", { points: fig.contour.map(function (n) { return pts[n].x.toFixed(1) + "," + pts[n].y.toFixed(1); }).join(" "), class: "contour" }, svg);
      (fig.segments || []).forEach(function (s) {
        el("line", { x1: pts[s[0]].x, y1: pts[s[0]].y, x2: pts[s[1]].x, y2: pts[s[1]].y, class: "segment" }, svg);
      });
      if (avecChaine) {
        var map = X.map;
        X.modele.chaine.forEach(function (c) {
          self._fleche(svg, pts[map[c[0]]], pts[map[c[1]]], "v-chaine", "t-chaine", 0);
        });
        if (X.res) self._fleche(svg, pts[X.res[0]], pts[X.res[1]], "v-res", "t-res", 0);
        else {
          var dep = pts[map[X.modele.chaine[0][0]]];
          el("circle", { cx: dep.x, cy: dep.y, r: 11, class: "nul" }, svg);
        }
      }
      // centre de la figure, pour placer les étiquettes vers l'extérieur
      var cx = 0, cy = 0;
      fig.contour.forEach(function (n) { cx += pts[n].x; cy += pts[n].y; });
      cx /= fig.contour.length; cy /= fig.contour.length;
      Object.keys(pts).forEach(function (n) {
        var p = pts[n];
        el("circle", { cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: 4, class: "point" }, svg);
        var dx = p.x - cx, dy = p.y - cy, L = Math.hypot(dx, dy);
        var lx, ly;
        if (L < 1) { lx = p.x + 12; ly = p.y - 10; } // centre O
        else { lx = p.x + dx / L * 17; ly = p.y + dy / L * 17 + 6; }
        lx = Math.max(10, Math.min(LARGEUR - 10, lx)); ly = Math.max(16, Math.min(HAUTEUR - 4, ly));
        var t = el("text", { x: lx.toFixed(1), y: ly.toFixed(1), class: "etiq", "text-anchor": "middle" }, svg);
        t.textContent = n;
      });
    }
  }

  if (!customElements.get("chasles-defi-widget")) {
    customElements.define("chasles-defi-widget", ChaslesDefiWidget);
  }
})();
