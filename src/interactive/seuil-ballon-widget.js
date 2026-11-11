(function () {
  "use strict";

  /* ================================================================
   * <seuil-ballon-widget> — atelier interactif (4e, chapitre 2, § 7) :
   * une grandeur du second degré en contexte comparée à un seuil k.
   * Situation 1 (exemple du cours) : ballon h(t) = −5t² + 20t + 25,
   * vol de t = 0 à l'impact t = 5. Situation 2 : enclos A(x) = x(20 − x),
   * 0 < x < 20. Curseur k et symbole (=, >, <, ≥, ≤) : résolution affichée
   * (équation ramenée à 0, Δ, racines), racines hors du domaine REJETÉES
   * avec leur raison, ensemble-solution dans le domaine (notation du cours)
   * et sur le graphique. Fenêtres FIXES. Web Component (Shadow DOM).
   * ================================================================ */

  var NS = "http://www.w3.org/2000/svg";
  var LARGEUR = 420, HAUTEUR = 300, MARGE = 34;

  var SITUATIONS = [
    {
      id: "ballon", bouton: "Ballon",
      v: "t", f: "h", unite: "m", uniteVar: "s",
      a: -5, b: 20, c: 25,
      dom: { min: 0, max: 5, minIncl: true, maxIncl: true },
      kMin: 0, kMax: 50, kStep: 1, kDefaut: 25, opDefaut: ">",
      fen: { xMin: -1.5, xMax: 5.6, yMin: -6, yMax: 52, pasX: 1, pasY: 10 },
      courbeMin: -1.3,
      contexte: "Un ballon est lancé depuis 25 m de haut : h(t) = −5t² + 20t + 25 (en m, t en s). Il touche le sol en t = 5 : le domaine du vol est t ∈ [0 ; 5].",
      maxi: "Hauteur maximale : 45 m, atteinte en t = 2 s.",
      rejet: function (r) { return r < 0 ? "rejetée : t < 0, le ballon n'est pas encore lancé" : "rejetée : t > 5, le ballon a déjà touché le sol"; },
      phrase: { ">": "au-dessus de", "≥": "à au moins", "<": "en dessous de", "≤": "à au plus", "=": "exactement à" },
    },
    {
      id: "enclos", bouton: "Enclos",
      v: "x", f: "A", unite: "m²", uniteVar: "m",
      a: -1, b: 20, c: 0,
      dom: { min: 0, max: 20, minIncl: false, maxIncl: false },
      kMin: 0, kMax: 110, kStep: 5, kDefaut: 75, opDefaut: "≥",
      fen: { xMin: -2, xMax: 22, yMin: -12, yMax: 112, pasX: 5, pasY: 20 },
      courbeMin: -1,
      contexte: "40 m de clôture pour un enclos rectangulaire de largeur x : A(x) = x(20 − x) (en m²). Une largeur possible vérifie 0 < x < 20.",
      maxi: "Aire maximale : 100 m², pour x = 10 m (un carré).",
      rejet: function () { return "rejetée : hors de ]0 ; 20[, ce n'est pas une largeur possible"; },
      phrase: { ">": "supérieure à", "≥": "d'au moins", "<": "inférieure à", "≤": "d'au plus", "=": "exactement égale à" },
    },
  ];
  var OPS = ["=", ">", "≥", "<", "≤"];

  function estEntier(v) { return Math.abs(v - Math.round(v)) < 1e-9; }
  function nb(v) {
    if (Math.abs(v) < 1e-9) v = 0;
    var s = estEntier(v) ? String(Math.round(v)) : (Math.round(v * 100) / 100).toString();
    return s.replace(".", ",").replace("-", "−");
  }
  function exact(v) { return Math.abs(v * 100 - Math.round(v * 100)) < 1e-6; }
  function terme(coef, lettre, premier) {
    if (Math.abs(coef) < 1e-9) return "";
    var abs = Math.abs(coef);
    var corps = (lettre && Math.abs(abs - 1) < 1e-9) ? lettre : nb(abs) + lettre;
    if (premier) return (coef < 0 ? "−" : "") + corps;
    return (coef < 0 ? " − " : " + ") + corps;
  }
  function polynome(a, b, c, v) {
    var s = terme(a, v + "²", true);
    s += terme(b, v, s === "");
    s += terme(c, "", s === "");
    return s === "" ? "0" : s;
  }
  function svgEl(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }
  function vrai(op, g) {
    var eps = 1e-9;
    if (op === "=") return Math.abs(g) < eps;
    if (op === ">") return g > eps;
    if (op === "≥") return g > -eps;
    if (op === "<") return g < -eps;
    return g < eps;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}' +
    '*{box-sizing:border-box;}' +
    '.situations,.ops{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;}' +
    '.btn{min-height:44px;min-width:48px;padding:6px 12px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);font:inherit;font-weight:600;cursor:pointer;}' +
    '.btn[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);border-color:var(--accent,#a8471f);color:var(--accent-ink,#7a3212);}' +
    '.contexte{font-size:0.94rem;line-height:1.5;margin:0 0 8px;color:var(--ink-soft,#6b6055);}' +
    '.question{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.12rem;font-weight:600;margin:0 0 10px;overflow-wrap:anywhere;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:10px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.grad{stroke:var(--ink-soft,#6b6055);stroke-width:1;}' +
    '.courbe{stroke:var(--accent,#a8471f);stroke-width:2.6;fill:none;}' +
    '.hors{stroke:var(--ink-faint,#9c9083);stroke-width:1.8;fill:none;stroke-dasharray:4 4;}' +
    '.seuil{stroke:var(--plan,#6b4fa0);stroke-width:1.6;stroke-dasharray:6 4;}' +
    '.sol{stroke:var(--good,#2f7a4f);stroke-width:6;stroke-linecap:butt;}' +
    '.borne-pleine{fill:var(--good,#2f7a4f);}' +
    '.borne-vide{fill:var(--surface-2,#faf6f0);stroke:var(--good,#2f7a4f);stroke-width:2.4;}' +
    '.inter{fill:var(--ink,#241f1a);}' +
    '.rejet{fill:none;stroke:var(--bad,#a8322f);stroke-width:2.4;}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);}' +
    '.etiquette-seuil{font-size:12px;font-weight:700;fill:var(--plan,#6b4fa0);}' +
    '.etiquette-rejet{font-size:11.5px;font-weight:700;fill:var(--bad,#a8322f);}' +
    '.resolution{border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);background:var(--surface,#fff);padding:10px 12px;margin:0 0 10px;font-size:0.95rem;line-height:1.6;overflow-wrap:anywhere;}' +
    '.resolution .rejete{color:var(--bad,#a8322f);font-weight:600;}' +
    '.resolution .garde{color:var(--good,#2f7a4f);font-weight:600;}' +
    '.solution{border-left:4px solid var(--good,#2f7a4f);background:var(--surface,#fff);padding:8px 12px;margin:0 0 10px;font-size:0.98rem;line-height:1.5;}' +
    '.solution .s{font-weight:700;font-variant-numeric:tabular-nums;}' +
    '.maxi{font-size:0.9rem;color:var(--ink-soft,#6b6055);margin:0 0 10px;}' +
    '.curseur{display:flex;flex-direction:column;gap:4px;margin-bottom:8px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-height:44px;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:64px;text-align:right;}' +
    '</style>' +
    '<div class="situations" id="situations"></div>' +
    '<p class="contexte" id="contexte"></p>' +
    '<div class="curseur"><label for="k" id="k-label">k — le seuil</label><div class="curseur-row">' +
    '<input type="range" id="k"><span class="curseur-valeur" id="k-val"></span></div></div>' +
    '<div class="ops" id="ops" role="group" aria-label="Symbole de comparaison"></div>' +
    '<p class="question" id="question"></p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" role="img" aria-label="Courbe, seuil et ensemble-solution"></svg></div>' +
    '<div class="solution" id="solution"></div>' +
    '<div class="resolution" id="resolution"></div>' +
    '<p class="maxi" id="maxi"></p>';

  class SeuilBallonWidget extends HTMLElement {
    constructor() {
      super();
      var sh = this.attachShadow({ mode: "open" });
      sh.appendChild(TEMPLATE.content.cloneNode(true));
      var $ = function (id) { return sh.getElementById(id); };
      this._el = {
        situations: $("situations"), contexte: $("contexte"), k: $("k"), kVal: $("k-val"), kLabel: $("k-label"),
        ops: $("ops"), question: $("question"), svg: $("svg"), solution: $("solution"), resolution: $("resolution"), maxi: $("maxi"),
      };
      var self = this;
      this._boutonsSit = SITUATIONS.map(function (s, i) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "btn"; b.textContent = s.bouton;
        b.addEventListener("click", function () { self._choisir(i); });
        self._el.situations.appendChild(b);
        return b;
      });
      this._boutonsOp = OPS.map(function (op) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "btn"; b.textContent = op;
        b.setAttribute("aria-label", "symbole " + op);
        b.addEventListener("click", function () { self._op = op; self._rendre(); });
        self._el.ops.appendChild(b);
        return b;
      });
    }

    connectedCallback() {
      var self = this;
      this._onK = function () { self._k = parseFloat(self._el.k.value); self._rendre(); };
      this._el.k.addEventListener("input", this._onK);
      this._choisir(0);
    }

    disconnectedCallback() { this._el.k.removeEventListener("input", this._onK); }

    _choisir(i) {
      var s = SITUATIONS[i];
      this._s = s; this._k = s.kDefaut; this._op = s.opDefaut;
      var k = this._el.k;
      k.min = String(s.kMin); k.max = String(s.kMax); k.step = String(s.kStep); k.value = String(s.kDefaut);
      this._el.kLabel.textContent = "k — le seuil (en " + s.unite + ")";
      this._el.contexte.textContent = s.contexte;
      this._el.maxi.textContent = s.maxi;
      this._boutonsSit.forEach(function (b, j) { b.setAttribute("aria-pressed", String(j === i)); });
      this._rendre();
    }

    _dansDomaine(r) {
      var d = this._s.dom, eps = 1e-9;
      if (r < d.min - eps || r > d.max + eps) return false;
      if (!d.minIncl && Math.abs(r - d.min) < eps) return false;
      if (!d.maxIncl && Math.abs(r - d.max) < eps) return false;
      return true;
    }

    // Ensemble-solution DANS le domaine : découpage aux racines, test des points et des intervalles.
    _ensemble(g, racines) {
      var s = this._s, d = s.dom, op = this._op, self = this;
      var pts = [d.min].concat(racines.filter(function (r) { return r > d.min + 1e-9 && r < d.max - 1e-9; })).concat([d.max]);
      var morceaux = [];
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        var ptOk = vrai(op, g(p)) && self._dansDomaine(p);
        morceaux.push({ type: "pt", v: p, ok: ptOk });
        if (i < pts.length - 1) morceaux.push({ type: "int", lo: p, hi: pts[i + 1], ok: vrai(op, g((p + pts[i + 1]) / 2)) });
      }
      var res = [], cur = null;
      morceaux.forEach(function (m) {
        if (m.ok) {
          if (!cur) cur = m.type === "pt" ? { lo: m.v, loIn: true, hi: m.v, hiIn: true } : { lo: m.lo, loIn: false, hi: m.hi, hiIn: false };
          else if (m.type === "pt") { cur.hi = m.v; cur.hiIn = true; }
          else { cur.hi = m.hi; cur.hiIn = false; }
        } else if (cur) { res.push(cur); cur = null; }
      });
      if (cur) res.push(cur);
      return res;
    }

    _texteEnsemble(ens) {
      if (!ens.length) return "∅";
      return ens.map(function (iv) {
        if (Math.abs(iv.hi - iv.lo) < 1e-9) return "{" + nb(iv.lo) + "}";
        return (iv.loIn ? "[" : "]") + nb(iv.lo) + " ; " + nb(iv.hi) + (iv.hiIn ? "]" : "[");
      }).join(" ∪ ");
    }

    _rendre() {
      var s = this._s, e = this._el, k = this._k, op = this._op, v = s.v;
      var self = this;
      this._boutonsOp.forEach(function (b, i) { b.setAttribute("aria-pressed", String(OPS[i] === op)); });
      e.kVal.textContent = nb(k) + " " + s.unite;

      var a = s.a, b = s.b, c0 = s.c - k;
      var g = function (x) { return a * x * x + b * x + s.c - k; };
      var fx = function (x) { return a * x * x + b * x + s.c; };
      e.question.textContent = s.f + "(" + v + ") " + op + " " + nb(k) + "  ⟺  " + polynome(a, b, c0, v) + " " + op + " 0";

      var delta = b * b - 4 * a * c0;
      var racines = [];
      var lignes = ["Δ = " + nb(b) + "² − 4 · (" + nb(a) + ") · " + (c0 < 0 ? "(" + nb(c0) + ")" : nb(c0)) + " = " + nb(delta)];
      if (delta > 1e-9) {
        var sq = Math.sqrt(delta);
        var r1 = (-b - sq) / (2 * a), r2 = (-b + sq) / (2 * a);
        racines = [Math.min(r1, r2), Math.max(r1, r2)];
        lignes.push("Δ &gt; 0 : deux racines.");
      } else if (delta > -1e-9) {
        racines = [-b / (2 * a)];
        lignes.push("Δ = 0 : une racine double.");
      } else {
        lignes.push("Δ &lt; 0 : aucune racine — la courbe ne coupe jamais la droite y = " + nb(k) + ".");
      }
      racines.forEach(function (r, i) {
        var nom = racines.length === 2 ? v + (i === 0 ? "₁" : "₂") : v;
        var val = nom + " " + (exact(r) ? "= " : "≈ ") + nb(r);
        if (self._dansDomaine(r)) lignes.push('<span class="garde">' + val + " : gardée (dans le domaine)</span>");
        else lignes.push('<span class="rejete">' + val + " : " + s.rejet(r) + "</span>");
      });
      e.resolution.innerHTML = lignes.join("<br>");

      var ens = this._ensemble(g, racines);
      var texte = this._texteEnsemble(ens);
      var phrase;
      if (op === "=") {
        phrase = ens.length ? (s.id === "ballon" ? "Le ballon est exactement à " + nb(k) + " m pour t = " + ens.map(function (iv) { return nb(iv.lo); }).join(" s et t = ") + " s."
          : "L'aire vaut exactement " + nb(k) + " m² pour x = " + ens.map(function (iv) { return nb(iv.lo); }).join(" m ou x = ") + " m.")
          : (s.id === "ballon" ? "Le ballon n'est jamais exactement à " + nb(k) + " m pendant son vol." : "Aucune largeur ne donne exactement " + nb(k) + " m².");
      } else {
        phrase = ens.length ? (s.id === "ballon" ? "Le ballon est " + s.phrase[op] + " " + nb(k) + " m pour t ∈ " + texte + "."
          : "L'aire est " + s.phrase[op] + " " + nb(k) + " m² pour x ∈ " + texte + ".")
          : (s.id === "ballon" ? "Jamais pendant le vol : aucun instant ne convient." : "Aucune largeur possible ne convient.");
      }
      e.solution.innerHTML = 'S = <span class="s">' + texte + "</span><br>" + phrase;

      // --- graphique
      var fen = s.fen;
      var px = function (x, y) {
        return [MARGE + (x - fen.xMin) / (fen.xMax - fen.xMin) * (LARGEUR - 2 * MARGE),
          HAUTEUR - MARGE - (y - fen.yMin) / (fen.yMax - fen.yMin) * (HAUTEUR - 2 * MARGE)];
      };
      var svg = e.svg;
      svg.innerHTML = "";
      var defs = svgEl("defs", {});
      var mk = svgEl("marker", { id: "fl-sb", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      mk.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(mk); svg.appendChild(defs);
      var o = px(0, 0);
      svg.appendChild(svgEl("line", { x1: MARGE - 6, x2: LARGEUR - MARGE + 6, y1: o[1], y2: o[1], class: "axe", "marker-end": "url(#fl-sb)" }));
      svg.appendChild(svgEl("line", { x1: o[0], x2: o[0], y1: HAUTEUR - MARGE + 6, y2: MARGE - 6, class: "axe", "marker-end": "url(#fl-sb)" }));
      for (var gx = Math.ceil(fen.xMin / fen.pasX) * fen.pasX; gx <= fen.xMax; gx += fen.pasX) {
        if (Math.abs(gx) < 1e-9) continue;
        var pg = px(gx, 0);
        svg.appendChild(svgEl("line", { x1: pg[0], x2: pg[0], y1: o[1] - 3, y2: o[1] + 3, class: "grad" }));
        var tg = svgEl("text", { x: pg[0], y: o[1] + 15, "text-anchor": "middle", class: "etiquette" }); tg.textContent = nb(gx); svg.appendChild(tg);
      }
      for (var gy = fen.pasY; gy <= fen.yMax; gy += fen.pasY) {
        var py = px(0, gy);
        svg.appendChild(svgEl("line", { x1: o[0] - 3, x2: o[0] + 3, y1: py[1], y2: py[1], class: "grad" }));
        var ty = svgEl("text", { x: o[0] - 6, y: py[1] + 4, "text-anchor": "end", class: "etiquette" }); ty.textContent = nb(gy); svg.appendChild(ty);
      }
      var lx = svgEl("text", { x: LARGEUR - MARGE + 2, y: o[1] - 8, "text-anchor": "end", class: "etiquette" }); lx.textContent = v + " (" + s.uniteVar + ")"; svg.appendChild(lx);
      var ly = svgEl("text", { x: o[0] + 6, y: MARGE - 10, class: "etiquette" }); ly.textContent = s.f + " (" + s.unite + ")"; svg.appendChild(ly);

      // courbe : pleine dans le domaine, pointillée en dehors (la parabole se prolonge, le contexte non)
      var trace = function (lo, hi, cls) {
        var d = "", dedans = false;
        for (var i = 0; i <= 160; i++) {
          var x = lo + i / 160 * (hi - lo), y = fx(x);
          if (y >= fen.yMin && y <= fen.yMax) {
            var p = px(x, y);
            d += (dedans ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1) + " ";
            dedans = true;
          } else dedans = false;
        }
        svg.appendChild(svgEl("path", { d: d, class: cls }));
      };
      trace(s.courbeMin, s.dom.min, "hors");
      trace(s.dom.max, s.id === "ballon" ? s.dom.max + 0.4 : s.dom.max + 1, "hors");
      trace(s.dom.min, s.dom.max, "courbe");

      // seuil y = k
      var pk1 = px(fen.xMin, k), pk2 = px(fen.xMax, k);
      svg.appendChild(svgEl("line", { x1: pk1[0], x2: pk2[0], y1: pk1[1], y2: pk1[1], class: "seuil" }));
      var tk = svgEl("text", { x: LARGEUR - MARGE, y: pk1[1] - 6, "text-anchor": "end", class: "etiquette-seuil" }); tk.textContent = "y = " + nb(k); svg.appendChild(tk);

      // ensemble-solution sur l'axe horizontal
      ens.forEach(function (iv) {
        var a1 = px(iv.lo, 0), a2 = px(iv.hi, 0);
        if (Math.abs(iv.hi - iv.lo) > 1e-9) svg.appendChild(svgEl("line", { x1: a1[0], x2: a2[0], y1: o[1], y2: o[1], class: "sol" }));
        svg.appendChild(svgEl("circle", { cx: a1[0], cy: o[1], r: 5, class: iv.loIn ? "borne-pleine" : "borne-vide" }));
        svg.appendChild(svgEl("circle", { cx: a2[0], cy: o[1], r: 5, class: iv.hiIn ? "borne-pleine" : "borne-vide" }));
      });

      // points d'intersection avec le seuil : gardés (dans le domaine) ou rejetés
      racines.forEach(function (r) {
        if (r < fen.xMin || r > fen.xMax) return;
        var p = px(r, k);
        if (self._dansDomaine(r)) svg.appendChild(svgEl("circle", { cx: p[0], cy: p[1], r: 4.5, class: "inter" }));
        else {
          svg.appendChild(svgEl("circle", { cx: p[0], cy: p[1], r: 6, class: "rejet" }));
          svg.appendChild(svgEl("line", { x1: p[0] - 5, x2: p[0] + 5, y1: p[1] - 5, y2: p[1] + 5, class: "rejet" }));
          var tr = svgEl("text", { x: Math.max(p[0], MARGE + 26), y: p[1] - 10, "text-anchor": "middle", class: "etiquette-rejet" }); tr.textContent = "rejetée"; svg.appendChild(tr);
        }
      });
    }
  }

  if (!customElements.get("seuil-ballon-widget")) customElements.define("seuil-ballon-widget", SeuilBallonWidget);
})();
