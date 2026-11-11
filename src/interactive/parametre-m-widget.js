(function () {
  "use strict";

  /* ================================================================
   * <parametre-m-widget> — atelier interactif (4e, chapitre 2, § 1) :
   * une famille d'équations du second degré qui dépend d'un paramètre m.
   * Curseur m (pas 0,25) : la parabole, Δ(m), le nombre de solutions,
   * et un second graphique de Δ en fonction de m qui montre les valeurs
   * critiques (Δ(m) = 0 : racine double). Famille avec m devant x² :
   * m = 0 signalé (l'équation n'est plus du second degré). Fenêtres FIXES
   * par famille. Web Component (Shadow DOM).
   * ================================================================ */

  var NS = "http://www.w3.org/2000/svg";
  var LARGEUR = 420, HAUTEUR = 260, MARGE = 30;

  // a(m), b(m), c(m) ; Δ(m) ; fenêtres fixes ; conclusion générale.
  var FAMILLES = [
    {
      id: "f1", nom: "x² + mx + 4 = 0",
      coefs: function (m) { return [1, m, 4]; },
      mMin: -8, mMax: 8, mDefaut: 5,
      fen: { xMin: -8, xMax: 8, yMin: -10, yMax: 14 },
      fenDelta: { yMin: -20, yMax: 50 },
      critiques: [-4, 4],
      conclusion:
        "Δ = m² − 16. Pour m ∈ ]−4 ; 4[ : aucune solution. Pour m = −4 ou m = 4 : une racine double. " +
        "Pour m ∈ ]−∞ ; −4[ ∪ ]4 ; +∞[ : deux solutions.",
    },
    {
      id: "f2", nom: "mx² + 2x + 1 = 0",
      coefs: function (m) { return [m, 2, 1]; },
      mMin: -4, mMax: 4, mDefaut: -1,
      fen: { xMin: -6, xMax: 6, yMin: -8, yMax: 10 },
      fenDelta: { yMin: -14, yMax: 22 },
      critiques: [1],
      exclu: 0,
      conclusion:
        "Δ = 4 − 4m. Pour m = 0, l'équation devient 2x + 1 = 0 : elle n'est plus du second degré (une seule " +
        "solution, x = −1/2). Pour m < 1 (m ≠ 0) : deux solutions. Pour m = 1 : une racine double (x = −1). " +
        "Pour m > 1 : aucune solution.",
    },
    {
      id: "f3", nom: "x² − 2x + m = 0",
      coefs: function (m) { return [1, -2, m]; },
      mMin: -4, mMax: 4, mDefaut: -3,
      fen: { xMin: -6, xMax: 6, yMin: -8, yMax: 10 },
      fenDelta: { yMin: -14, yMax: 22 },
      critiques: [1],
      conclusion:
        "Δ = 4 − 4m. Pour m < 1 : deux solutions. Pour m = 1 : une racine double (x = 1). Pour m > 1 : " +
        "aucune solution.",
    },
  ];

  function estEntier(v) { return Math.abs(v - Math.round(v)) < 1e-9; }
  function nb(v) {
    if (Math.abs(v) < 1e-9) v = 0;
    var s = estEntier(v) ? String(Math.round(v)) : (Math.round(v * 100) / 100).toString();
    return s.replace(".", ",").replace("-", "−");
  }
  function terme(coef, lettre, premier) {
    if (Math.abs(coef) < 1e-9) return "";
    var abs = Math.abs(coef);
    var corps = (lettre && Math.abs(abs - 1) < 1e-9) ? lettre : nb(abs) + lettre;
    if (premier) return (coef < 0 ? "−" : "") + corps;
    return (coef < 0 ? " − " : " + ") + corps;
  }
  function polynome(a, b, c) {
    var s = terme(a, "x²", true);
    s += terme(b, "x", s === "");
    s += terme(c, "", s === "");
    return s === "" ? "0" : s;
  }
  // Valeur exacte quand elle est « simple », sinon « ≈ ».
  function valeur(v) { return (Math.abs(v * 100 - Math.round(v * 100)) < 1e-6 ? "= " : "≈ ") + nb(v); }

  function svgEl(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}' +
    '*{box-sizing:border-box;}' +
    '.familles{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;}' +
    '.btn{min-height:44px;padding:6px 12px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);font:inherit;font-weight:600;cursor:pointer;}' +
    '.btn[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);border-color:var(--accent,#a8471f);color:var(--accent-ink,#7a3212);}' +
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.15rem;font-weight:600;margin:0 0 10px;overflow-wrap:anywhere;}' +
    '.graphe-zone{display:flex;flex-direction:column;align-items:center;gap:4px;margin-bottom:10px;}' +
    '.graphe-titre{font-size:0.82rem;color:var(--ink-faint,#9c9083);margin:4px 0 0;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.grad{stroke:var(--ink-soft,#6b6055);stroke-width:1;}' +
    '.courbe.deux{stroke:var(--good,#2f7a4f);}' +
    '.courbe.une{stroke:var(--accent,#a8471f);}' +
    '.courbe.zero{stroke:var(--bad,#a8322f);}' +
    '.courbe{stroke-width:2.6;fill:none;}' +
    '.droite{stroke:var(--ink-soft,#6b6055);stroke-width:2.2;fill:none;stroke-dasharray:6 4;}' +
    '.delta-pos{stroke:var(--good,#2f7a4f);stroke-width:2.4;fill:none;}' +
    '.delta-neg{stroke:var(--bad,#a8322f);stroke-width:2.4;fill:none;}' +
    '.point{fill:var(--ink,#241f1a);}' +
    '.critique{fill:var(--accent,#a8471f);}' +
    '.courant{fill:var(--plan,#6b4fa0);stroke:var(--surface,#fff);stroke-width:2;}' +
    '.repere-m{stroke:var(--plan,#6b4fa0);stroke-width:1.2;stroke-dasharray:3 3;}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);}' +
    '.etiquette-fort{font-size:12px;font-weight:700;fill:var(--ink,#241f1a);}' +
    '.etiquette-critique{font-size:12px;font-weight:700;fill:var(--accent-ink,#7a3212);}' +
    '.stats{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin:0 0 10px;}' +
    '.stat{flex:1 1 120px;min-width:0;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:8px 6px;text-align:center;background:var(--surface,#fff);}' +
    '.stat-label{display:block;font-size:11px;color:var(--ink-faint,#9c9083);margin-bottom:4px;}' +
    '.stat-value{display:block;font-variant-numeric:tabular-nums;font-size:0.98rem;font-weight:700;overflow-wrap:anywhere;}' +
    '.deux-t{color:var(--good,#2f7a4f);}.une-t{color:var(--accent-ink,#7a3212);}.zero-t{color:var(--bad,#a8322f);}' +
    '.conclusion{border-left:4px solid var(--accent,#a8471f);background:var(--surface,#fff);padding:8px 12px;margin:0 0 12px;font-size:0.94rem;line-height:1.5;}' +
    '.alerte{border-left:4px solid var(--bad,#a8322f);background:var(--surface,#fff);padding:8px 12px;margin:0 0 10px;font-size:0.94rem;line-height:1.5;}' +
    '.alerte[hidden]{display:none;}' +
    '.curseur{display:flex;flex-direction:column;gap:4px;margin-bottom:10px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-height:44px;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:52px;text-align:right;}' +
    '.boutons{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;}' +
    '</style>' +
    '<div class="familles" id="familles"></div>' +
    '<p class="formule" id="formule"></p>' +
    '<div class="curseur"><label for="m">m — le paramètre</label><div class="curseur-row">' +
    '<input type="range" id="m" step="0.25"><span class="curseur-valeur" id="m-val"></span></div></div>' +
    '<div class="boutons" id="critiques"></div>' +
    '<div class="graphe-zone">' +
    '<p class="graphe-titre">La parabole pour la valeur de m choisie</p>' +
    '<svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" role="img" aria-label="Parabole"></svg>' +
    '<p class="graphe-titre">Δ en fonction de m</p>' +
    '<svg id="svg-delta" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" role="img" aria-label="Discriminant en fonction de m"></svg>' +
    '</div>' +
    '<div class="alerte" id="alerte" hidden></div>' +
    '<div class="stats">' +
    '<div class="stat"><span class="stat-label">Δ = b² − 4ac</span><span class="stat-value" id="val-delta"></span></div>' +
    '<div class="stat"><span class="stat-label">solutions</span><span class="stat-value" id="val-sol"></span></div>' +
    '</div>' +
    '<div class="conclusion" id="conclusion"></div>';

  class ParametreMWidget extends HTMLElement {
    constructor() {
      super();
      var sh = this.attachShadow({ mode: "open" });
      sh.appendChild(TEMPLATE.content.cloneNode(true));
      var $ = function (id) { return sh.getElementById(id); };
      this._el = {
        familles: $("familles"), formule: $("formule"), m: $("m"), mVal: $("m-val"), critiques: $("critiques"),
        svg: $("svg"), svgDelta: $("svg-delta"), alerte: $("alerte"), delta: $("val-delta"), sol: $("val-sol"),
        conclusion: $("conclusion"),
      };
      var self = this;
      this._boutonsFamille = FAMILLES.map(function (f, i) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "btn"; b.textContent = f.nom;
        b.addEventListener("click", function () { self._choisirFamille(i); });
        self._el.familles.appendChild(b);
        return b;
      });
    }

    connectedCallback() {
      var self = this;
      this._onM = function () { self._m = parseFloat(self._el.m.value); self._rendre(); };
      this._el.m.addEventListener("input", this._onM);
      this._choisirFamille(0);
    }

    disconnectedCallback() { this._el.m.removeEventListener("input", this._onM); }

    _choisirFamille(i) {
      var self = this, f = FAMILLES[i];
      this._f = f;
      this._m = f.mDefaut;
      this._el.m.min = String(f.mMin); this._el.m.max = String(f.mMax); this._el.m.value = String(f.mDefaut);
      this._boutonsFamille.forEach(function (b, k) { b.setAttribute("aria-pressed", String(k === i)); });
      this._el.critiques.innerHTML = "";
      f.critiques.concat(f.exclu === undefined ? [] : [f.exclu]).forEach(function (v) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "btn"; b.textContent = "m = " + nb(v);
        b.addEventListener("click", function () { self._m = v; self._el.m.value = String(v); self._rendre(); });
        self._el.critiques.appendChild(b);
      });
      this._el.conclusion.textContent = f.conclusion;
      this._rendre();
    }

    _axes(svg, px, fen, xMin, xMax, lx, ly) {
      var defs = svgEl("defs", {});
      var idf = "fl-" + svg.id;
      var mk = svgEl("marker", { id: idf, markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      mk.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(mk); svg.appendChild(defs);
      var o = px(Math.max(xMin, Math.min(xMax, 0)), 0);
      svg.appendChild(svgEl("line", { x1: MARGE - 6, x2: LARGEUR - MARGE + 6, y1: o[1], y2: o[1], class: "axe", "marker-end": "url(#" + idf + ")" }));
      svg.appendChild(svgEl("line", { x1: o[0], x2: o[0], y1: HAUTEUR - MARGE + 6, y2: MARGE - 6, class: "axe", "marker-end": "url(#" + idf + ")" }));
      for (var g = Math.ceil(xMin); g <= Math.floor(xMax); g++) {
        if (g === 0) continue;
        var p = px(g, 0);
        svg.appendChild(svgEl("line", { x1: p[0], x2: p[0], y1: o[1] - 3, y2: o[1] + 3, class: "grad" }));
      }
      var tx = svgEl("text", { x: LARGEUR - MARGE + 2, y: o[1] - 8, class: "etiquette", "text-anchor": "end" }); tx.textContent = lx; svg.appendChild(tx);
      var ty = svgEl("text", { x: o[0] + 6, y: MARGE - 8, class: "etiquette" }); ty.textContent = ly; svg.appendChild(ty);
      return o;
    }

    _rendre() {
      var f = this._f, m = this._m, e = this._el;
      var co = f.coefs(m), a = co[0], b = co[1], c = co[2];
      var degre1 = Math.abs(a) < 1e-9;
      var delta = b * b - 4 * a * c;
      e.mVal.textContent = nb(m);
      e.formule.textContent = (degre1 ? polynome(0, b, c) : polynome(a, b, c)) + " = 0";

      var racines = [], cls;
      if (degre1) {
        racines = [-c / b];
        e.alerte.hidden = false;
        e.alerte.textContent = "m = 0 : le terme en x² disparaît. L'équation " + polynome(0, b, c) + " = 0 n'est plus du second degré : on ne calcule pas Δ, et sa seule solution est x = " + nb(-c / b) + ".";
        e.delta.textContent = "sans objet";
        e.delta.className = "stat-value";
        e.sol.textContent = "x = " + nb(-c / b) + " (premier degré)";
        e.sol.className = "stat-value";
        cls = "une";
      } else {
        e.alerte.hidden = true;
        e.delta.textContent = nb(delta);
        if (delta > 1e-9) {
          var r1 = (-b - Math.sqrt(delta)) / (2 * a), r2 = (-b + Math.sqrt(delta)) / (2 * a);
          racines = [Math.min(r1, r2), Math.max(r1, r2)];
          cls = "deux";
          e.sol.textContent = "deux : x₁ " + valeur(racines[0]) + " ; x₂ " + valeur(racines[1]);
        } else if (delta > -1e-9) {
          racines = [-b / (2 * a)];
          cls = "une";
          e.sol.textContent = "une racine double : x " + valeur(racines[0]);
        } else {
          cls = "zero";
          e.sol.textContent = "aucune solution réelle";
        }
        e.delta.className = "stat-value " + cls + "-t";
        e.sol.className = "stat-value " + cls + "-t";
      }

      // --- parabole (ou droite si m = 0)
      var fen = f.fen;
      var px = function (x, y) {
        return [MARGE + (x - fen.xMin) / (fen.xMax - fen.xMin) * (LARGEUR - 2 * MARGE),
          HAUTEUR - MARGE - (y - fen.yMin) / (fen.yMax - fen.yMin) * (HAUTEUR - 2 * MARGE)];
      };
      var svg = e.svg;
      svg.innerHTML = "";
      var o = this._axes(svg, px, fen, fen.xMin, fen.xMax, "x", "y");
      var d = "", dedans = false;
      for (var i = 0; i <= 300; i++) {
        var xx = fen.xMin + i / 300 * (fen.xMax - fen.xMin), yy = a * xx * xx + b * xx + c;
        if (yy >= fen.yMin - 0.5 && yy <= fen.yMax + 0.5) {
          var p = px(xx, Math.max(fen.yMin, Math.min(fen.yMax, yy)));
          d += (dedans ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1) + " ";
          dedans = true;
        } else dedans = false;
      }
      svg.appendChild(svgEl("path", { d: d, class: degre1 ? "droite" : "courbe " + cls }));
      racines.forEach(function (r, k) {
        if (r < fen.xMin || r > fen.xMax) return;
        var pr = px(r, 0);
        svg.appendChild(svgEl("circle", { cx: pr[0], cy: pr[1], r: 5, class: "point" }));
        var t = svgEl("text", { x: pr[0], y: o[1] + (k === 0 ? 18 : 31), "text-anchor": "middle", class: "etiquette-fort" });
        t.textContent = nb(r);
        svg.appendChild(t);
      });

      // --- Δ en fonction de m (droite ou parabole selon la famille)
      var fd = f.fenDelta, mMin = f.mMin, mMax = f.mMax;
      var pd = function (x, y) {
        return [MARGE + (x - mMin) / (mMax - mMin) * (LARGEUR - 2 * MARGE),
          HAUTEUR - MARGE - (y - fd.yMin) / (fd.yMax - fd.yMin) * (HAUTEUR - 2 * MARGE)];
      };
      var dfn = function (mm) { var k = f.coefs(mm); return k[1] * k[1] - 4 * k[0] * k[2]; };
      var sd = e.svgDelta;
      sd.innerHTML = "";
      var od = this._axes(sd, pd, fd, mMin, mMax, "m", "Δ");
      // segments colorés selon le signe de Δ, coupés aux valeurs critiques
      var bornes = [mMin].concat(f.critiques).concat([mMax]);
      for (var s = 0; s < bornes.length - 1; s++) {
        var lo = bornes[s], hi = bornes[s + 1], milieu = (lo + hi) / 2;
        var chemin = "";
        for (var j = 0; j <= 80; j++) {
          var mm = lo + j / 80 * (hi - lo), dv = Math.max(fd.yMin, Math.min(fd.yMax, dfn(mm)));
          var q = pd(mm, dv);
          chemin += (j === 0 ? "M" : "L") + q[0].toFixed(1) + " " + q[1].toFixed(1) + " ";
        }
        sd.appendChild(svgEl("path", { d: chemin, class: dfn(milieu) > 0 ? "delta-pos" : "delta-neg" }));
      }
      f.critiques.forEach(function (v) {
        var q = pd(v, 0);
        sd.appendChild(svgEl("circle", { cx: q[0], cy: q[1], r: 5, class: "critique" }));
        var t = svgEl("text", { x: q[0], y: od[1] + 18, "text-anchor": "middle", class: "etiquette-critique" });
        t.textContent = nb(v);
        sd.appendChild(t);
      });
      // point courant (sans objet pour m = 0 dans la famille 2 : marqué sur l'axe)
      var qm = pd(m, degre1 ? 0 : Math.max(fd.yMin, Math.min(fd.yMax, delta)));
      sd.appendChild(svgEl("line", { x1: qm[0], x2: qm[0], y1: od[1], y2: qm[1], class: "repere-m" }));
      sd.appendChild(svgEl("circle", { cx: qm[0], cy: qm[1], r: 6, class: "courant" }));
    }
  }

  if (!customElements.get("parametre-m-widget")) customElements.define("parametre-m-widget", ParametreMWidget);
})();
