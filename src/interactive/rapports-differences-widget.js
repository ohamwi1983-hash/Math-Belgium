(function () {
  "use strict";

  /* ================================================================
   * <rapports-differences-widget> — atelier interactif (6e, ch. 2, § 7,
   * « Reconnaître un accroissement de type exponentiel ») : un tableau de
   * mesures prises à pas constant, ses différences successives et ses
   * rapports successifs. L'élève voit laquelle des deux lignes est
   * constante : différences constantes → modèle linéaire f(t) = m·t + p ;
   * rapports constants → modèle exponentiel Q(t) = Q₀·rᵗ ; ni l'un ni
   * l'autre → aucun des deux modèles. Le bouton « Nouveau tableau » fait
   * défiler des tableaux des trois sortes (pas de 1, 2 ou 3 unités, premier
   * relevé en t = 0 ou en t = 1). Graphique des points, fenêtre FIXE propre
   * à chaque tableau (jamais recalculée), modèle tracé quand il existe.
   * Web Component (Shadow DOM).
   * ================================================================ */

  // Chaque tableau porte sa fenêtre de tracé, écrite à la main (jamais calculée à l'affichage).
  var TABLEAUX = [
    {
      contexte: "Nombre de bactéries (en milliers), compté toutes les heures",
      var: "t (h)", grandeur: "Q(t)",
      t: [0, 1, 2, 3, 4], v: [100, 150, 225, 337.5, 506.25],
      win: { xMin: 0, xMax: 4.6, yMin: -50, yMax: 560 }, xTicks: [1, 2, 3, 4], yTicks: [100, 200, 300, 400, 500],
    },
    {
      contexte: "Hauteur d'eau dans une cuve (en cm), relevée chaque minute",
      var: "t (min)", grandeur: "f(t)",
      t: [0, 1, 2, 3, 4], v: [12, 15.5, 19, 22.5, 26],
      win: { xMin: 0, xMax: 4.6, yMin: -3, yMax: 30 }, xTicks: [1, 2, 3, 4], yTicks: [5, 10, 15, 20, 25],
    },
    {
      contexte: "Distance parcourue par une bille sur une pente (en cm), chaque seconde",
      var: "t (s)", grandeur: "d(t)",
      t: [0, 1, 2, 3, 4], v: [3, 4, 7, 12, 19],
      win: { xMin: 0, xMax: 4.6, yMin: -2, yMax: 22 }, xTicks: [1, 2, 3, 4], yTicks: [5, 10, 15, 20],
      remarque: "Les différences augmentent de 2 à chaque pas : ce sont les différences des différences qui sont constantes (un modèle du second degré).",
    },
    {
      contexte: "Masse d'un isotope radioactif (en mg), mesurée chaque jour",
      var: "t (j)", grandeur: "Q(t)",
      t: [0, 1, 2, 3, 4], v: [800, 400, 200, 100, 50],
      win: { xMin: 0, xMax: 4.6, yMin: -80, yMax: 880 }, xTicks: [1, 2, 3, 4], yTicks: [200, 400, 600, 800],
    },
    {
      contexte: "Carburant d'un groupe électrogène (en L), relevé toutes les 3 heures",
      var: "t (h)", grandeur: "f(t)",
      t: [0, 3, 6, 9, 12], v: [90, 78, 66, 54, 42],
      win: { xMin: 0, xMax: 13.5, yMin: -8, yMax: 100 }, xTicks: [3, 6, 9, 12], yTicks: [20, 40, 60, 80],
    },
    {
      contexte: "Abonnés d'une chaîne vidéo (en centaines), comptés tous les 2 mois",
      var: "t (mois)", grandeur: "Q(t)",
      t: [0, 2, 4, 6, 8], v: [5, 20, 80, 320, 1280],
      win: { xMin: 0, xMax: 9, yMin: -120, yMax: 1400 }, xTicks: [2, 4, 6, 8], yTicks: [300, 600, 900, 1200],
    },
    {
      contexte: "Élèves d'une classe au courant d'une rumeur, chaque jour",
      var: "t (j)", grandeur: "N(t)",
      t: [0, 1, 2, 3, 4], v: [10, 20, 25, 27, 28],
      win: { xMin: 0, xMax: 4.6, yMin: -3, yMax: 32 }, xTicks: [1, 2, 3, 4], yTicks: [10, 20, 30],
      remarque: "La croissance ralentit à chaque pas : la rumeur plafonne (la classe compte 28 élèves), c'est une saturation.",
    },
    {
      contexte: "Prix d'une course en taxi (en €) selon la distance (en km)",
      var: "x (km)", grandeur: "f(x)",
      t: [1, 2, 3, 4, 5], v: [5, 7, 9, 11, 13],
      win: { xMin: 0, xMax: 5.6, yMin: -1.5, yMax: 15 }, xTicks: [1, 2, 3, 4, 5], yTicks: [3, 6, 9, 12],
    },
    {
      contexte: "Capital placé à intérêts composés (en €), relevé à la fin de chaque année",
      var: "t (ans)", grandeur: "Q(t)",
      t: [1, 2, 3, 4, 5], v: [2200, 2420, 2662, 2928.2, 3221.02],
      win: { xMin: 0, xMax: 5.6, yMin: -300, yMax: 3600 }, xTicks: [1, 2, 3, 4, 5], yTicks: [1000, 2000, 3000],
    },
  ];

  var W = 340, H = 220, ML = 44, MR = 14, MT = 14, MB = 26;
  var TOL = 1e-9;

  function fr(n, dec) {
    if (Math.abs(n) < 0.5 * Math.pow(10, -dec)) n = 0;
    var s = n.toFixed(dec);
    if (s.indexOf(".") >= 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
    var neg = s.charAt(0) === "-";
    if (neg) s = s.slice(1);
    var parts = s.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    s = parts.join(",");
    return (neg ? "−" : "") + s;
  }

  function constante(liste) {
    for (var i = 1; i < liste.length; i++) {
      if (Math.abs(liste[i] - liste[0]) > TOL * Math.max(1, Math.abs(liste[0]))) return false;
    }
    return true;
  }

  function svgEl(tag, attrs) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}' +
    '*{box-sizing:border-box;}' +
    '.contexte{font-size:0.93rem;font-weight:600;margin:0 0 8px;text-align:center;}' +
    '.compteur{font-family:var(--mono,monospace);font-size:11px;color:var(--ink-faint,#9c9083);text-align:center;margin-bottom:4px;}' +
    '.table-zone{overflow-x:auto;margin:0 0 10px;}' +
    'table{border-collapse:collapse;margin:0 auto;font-size:13px;font-variant-numeric:tabular-nums;}' +
    'th,td{padding:2px 6px;text-align:center;white-space:nowrap;line-height:1.35;}' +
    'thead th{font-family:var(--mono,monospace);font-weight:600;font-size:10.5px;color:var(--ink-soft,#6b6055);border-bottom:1px solid var(--line,#e2d8c8);vertical-align:bottom;padding-bottom:4px;}' +
    'thead th.constante{color:var(--good,#2f7a4f);}' +
    'td.t{color:var(--ink-soft,#6b6055);}' +
    'td.m{font-weight:700;color:var(--accent-ink,#7a3212);}' +
    'td.e{color:var(--ink-soft,#6b6055);font-size:12px;}' +
    'td.e.constante{color:var(--good,#2f7a4f);font-weight:700;background:var(--good-soft,rgba(47,122,79,0.10));}' +
    'td.vide{height:9px;padding:0;}' +
    '.statut{display:block;font-size:10px;font-weight:600;}' +
    '.zone{display:flex;flex-direction:column;align-items:center;margin-bottom:8px;}' +
    'svg{width:100%;max-width:340px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);display:block;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.grille{stroke:var(--line,#e2d8c8);stroke-width:1;}' +
    '.tick{stroke:var(--ink-soft,#6b6055);stroke-width:1;}' +
    '.tick-label{font-size:9.5px;font-family:var(--mono,monospace);fill:var(--ink-faint,#9c9083);}' +
    '.nom-axe{font-size:10px;font-family:var(--mono,monospace);fill:var(--ink-soft,#6b6055);}' +
    '.modele{stroke:var(--good,#2f7a4f);stroke-width:2;fill:none;}' +
    '.point{fill:var(--accent,#a8471f);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.legende{display:flex;gap:4px 16px;justify-content:center;flex-wrap:wrap;font-size:0.85rem;font-weight:600;margin-top:4px;}' +
    '.l-mes{color:var(--accent-ink,#7a3212);}' +
    '.l-mod{color:var(--good,#2f7a4f);}' +
    '.pt{display:inline-block;width:9px;height:9px;border-radius:50%;background:var(--accent,#a8471f);margin-right:5px;}' +
    '.tr{display:inline-block;width:18px;height:3px;background:var(--good,#2f7a4f);vertical-align:middle;margin-right:5px;}' +
    '.verdict{border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);background:var(--surface,#fff);padding:10px 12px;margin:4px 0 12px;font-size:0.93rem;line-height:1.5;}' +
    '.verdict p{margin:0 0 6px;}' +
    '.verdict p:last-child{margin-bottom:0;}' +
    '.titre-verdict{font-weight:700;}' +
    '.titre-verdict.ok{color:var(--good,#2f7a4f);}' +
    '.titre-verdict.non{color:var(--bad,#b3261e);}' +
    '.formule{font-family:var(--serif,serif);font-size:1.05rem;font-weight:700;color:var(--good,#2f7a4f);}' +
    '.boutons{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;}' +
    'button{min-height:44px;padding:6px 14px;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);background:var(--surface,#fff);color:var(--ink,#241f1a);font:inherit;font-weight:600;cursor:pointer;}' +
    'button.principal{background:var(--accent-soft,#f4e3d1);border-color:var(--accent-soft-line,#e6c8a4);color:var(--accent-ink,#7a3212);}' +
    '[hidden]{display:none!important;}' +
    'button:focus-visible{outline:2px solid var(--accent,#a8471f);outline-offset:2px;}' +
    '</style>' +
    '<div class="compteur" id="compteur"></div>' +
    '<p class="contexte" id="contexte"></p>' +
    '<div class="table-zone"><table id="table"></table></div>' +
    '<div class="zone"><svg id="svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Graphique des mesures"></svg>' +
    '<div class="legende"><span class="l-mes"><span class="pt"></span>mesures</span><span class="l-mod" id="leg-mod"><span class="tr"></span><span id="leg-mod-t"></span></span></div></div>' +
    '<div class="verdict" id="verdict" aria-live="polite"></div>' +
    '<div class="boutons"><button type="button" id="precedent">Tableau précédent</button><button type="button" class="principal" id="suivant">Nouveau tableau</button></div>';

  class RapportsDifferencesWidget extends HTMLElement {
    constructor() {
      super();
      var sh = this.attachShadow({ mode: "open" });
      sh.appendChild(TEMPLATE.content.cloneNode(true));
      this._sh = sh;
      this._i = 0;
    }

    connectedCallback() {
      var self = this;
      this._onSuivant = function () { self._i = (self._i + 1) % TABLEAUX.length; self._rendre(); };
      this._onPrecedent = function () { self._i = (self._i + TABLEAUX.length - 1) % TABLEAUX.length; self._rendre(); };
      this._sh.getElementById("suivant").addEventListener("click", this._onSuivant);
      this._sh.getElementById("precedent").addEventListener("click", this._onPrecedent);
      this._rendre();
    }

    disconnectedCallback() {
      this._sh.getElementById("suivant").removeEventListener("click", this._onSuivant);
      this._sh.getElementById("precedent").removeEventListener("click", this._onPrecedent);
    }

    // Analyse d'un tableau : différences, rapports, verdict et modèle (jamais écrit à la main).
    _analyse(tb) {
      var d = [], q = [];
      for (var i = 1; i < tb.v.length; i++) {
        d.push(tb.v[i] - tb.v[i - 1]);
        q.push(tb.v[i] / tb.v[i - 1]);
      }
      var h = tb.t[1] - tb.t[0];
      var res = { d: d, q: q, h: h, lin: constante(d), exp: constante(q) };
      if (res.lin) {
        res.m = d[0] / h;
        res.p = tb.v[0] - res.m * tb.t[0];
        res.f = function (t) { return res.m * t + res.p; };
      } else if (res.exp) {
        res.r = Math.pow(q[0], 1 / h);
        res.Q0 = tb.v[0] / Math.pow(res.r, tb.t[0]);
        res.f = function (t) { return res.Q0 * Math.pow(res.r, t); };
      }
      return res;
    }

    _rendre() {
      var tb = TABLEAUX[this._i], sh = this._sh;
      var an = this._analyse(tb);
      sh.getElementById("compteur").textContent = "tableau " + (this._i + 1) + " sur " + TABLEAUX.length;
      sh.getElementById("contexte").textContent = tb.contexte;
      this._tableau(tb, an);
      this._graphique(tb, an);
      this._verdict(tb, an);
      sh.getElementById("leg-mod").hidden = !an.f;
      sh.getElementById("leg-mod-t").textContent = an.lin ? "modèle linéaire" : "modèle exponentiel";
    }

    // Tableau vertical (une mesure par ligne, tient sur un téléphone) : chaque différence et chaque
    // rapport sont placés ENTRE les deux mesures qu'ils comparent (cellules décalées d'une demi-ligne).
    _tableau(tb, an) {
      var n = tb.v.length;
      // Accord : « différences constantes », « rapports constants ».
      var statut = function (ok, fem) { var c = fem ? "constantes" : "constants"; return '<span class="statut">' + (ok ? c + " ✓" : "pas " + c) + "</span>"; };
      var html = "<thead><tr><th>" + tb.var + "</th><th>" + tb.grandeur + "</th>" +
        '<th class="' + (an.lin ? "constante" : "") + '">différences' + statut(an.lin, true) + "</th>" +
        '<th class="' + (an.exp ? "constante" : "") + '">rapports' + statut(an.exp) + "</th></tr></thead><tbody>";
      var cd = an.lin ? "e constante" : "e", cq = an.exp ? "e constante" : "e";
      for (var r = 0; r < 2 * n; r++) {
        html += "<tr>";
        if (r % 2 === 0) {
          var k = r / 2;
          html += '<td class="t" rowspan="2">' + fr(tb.t[k], 2) + '</td><td class="m" rowspan="2">' + fr(tb.v[k], 2) + "</td>";
        }
        if (r === 0 || r === 2 * n - 1) {
          html += '<td class="' + cd + ' vide"></td><td class="' + cq + ' vide"></td>';
        } else if (r % 2 === 1) {
          var j = (r - 1) / 2;
          var d = an.d[j], q = an.q[j];
          html += '<td class="' + cd + '" rowspan="2">' + (d >= 0 ? "+" : "") + fr(d, 2) + '</td><td class="' + cq + '" rowspan="2">×' + fr(q, 3) + "</td>";
        }
        html += "</tr>";
      }
      this._sh.getElementById("table").innerHTML = html + "</tbody>";
    }

    _graphique(tb, an) {
      var svg = this._sh.getElementById("svg");
      var w = tb.win;
      svg.innerHTML = "";
      var px = function (x) { return ML + (x - w.xMin) / (w.xMax - w.xMin) * (W - ML - MR); };
      var py = function (y) { return H - MB - (y - w.yMin) / (w.yMax - w.yMin) * (H - MT - MB); };
      var defs = svgEl("defs", {});
      var m = svgEl("marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      m.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(m);
      var clip = svgEl("clipPath", { id: "cadre" });
      clip.appendChild(svgEl("rect", { x: ML, y: MT, width: W - ML - MR, height: H - MT - MB }));
      defs.appendChild(clip);
      svg.appendChild(defs);
      var x0 = px(0), y0 = py(0);
      tb.yTicks.forEach(function (t) {
        var y = py(t).toFixed(1);
        svg.appendChild(svgEl("line", { x1: ML, x2: W - MR, y1: y, y2: y, class: "grille" }));
        svg.appendChild(svgEl("line", { x1: x0 - 3, x2: x0 + 3, y1: y, y2: y, class: "tick" }));
        var tx = svgEl("text", { x: x0 - 5, y: (+y + 3).toFixed(1), "text-anchor": "end", class: "tick-label" });
        tx.textContent = fr(t, 2);
        svg.appendChild(tx);
      });
      tb.xTicks.forEach(function (t) {
        var x = px(t).toFixed(1);
        svg.appendChild(svgEl("line", { x1: x, x2: x, y1: y0 - 3, y2: y0 + 3, class: "tick" }));
        var tx = svgEl("text", { x: x, y: (y0 + 13).toFixed(1), "text-anchor": "middle", class: "tick-label" });
        tx.textContent = fr(t, 2);
        svg.appendChild(tx);
      });
      svg.appendChild(svgEl("line", { x1: ML - 6, x2: W - 4, y1: y0.toFixed(1), y2: y0.toFixed(1), class: "axe", "marker-end": "url(#fleche)" }));
      svg.appendChild(svgEl("line", { x1: x0.toFixed(1), x2: x0.toFixed(1), y1: H - MB + 6, y2: 4, class: "axe", "marker-end": "url(#fleche)" }));
      var nx = svgEl("text", { x: W - 6, y: (y0 - 6).toFixed(1), "text-anchor": "end", class: "nom-axe" });
      nx.textContent = tb.var.split(" ")[0];
      svg.appendChild(nx);
      var ny = svgEl("text", { x: (x0 + 8).toFixed(1), y: 12, "text-anchor": "start", class: "nom-axe" });
      ny.textContent = tb.grandeur;
      svg.appendChild(ny);
      var g = svgEl("g", { "clip-path": "url(#cadre)" });
      svg.appendChild(g);
      if (an.f) {
        var d = "", N = 160;
        for (var i = 0; i <= N; i++) {
          var x = w.xMin + (w.xMax - w.xMin) * i / N;
          var y = an.f(x);
          y = Math.max(w.yMin - (w.yMax - w.yMin), Math.min(w.yMax + (w.yMax - w.yMin), y));
          d += (i ? "L" : "M") + px(x).toFixed(1) + " " + py(y).toFixed(1) + " ";
        }
        g.appendChild(svgEl("path", { d: d, class: "modele" }));
      }
      tb.t.forEach(function (t, k) {
        g.appendChild(svgEl("circle", { cx: px(t).toFixed(1), cy: py(tb.v[k]).toFixed(1), r: 4.5, class: "point" }));
      });
    }

    _verdict(tb, an) {
      var html = "";
      var v = tb.var.split(" ")[0];
      var g = tb.grandeur.replace(/\(.*\)/, "");
      if (an.lin) {
        html += '<p class="titre-verdict ok">Différences constantes : modèle linéaire.</p>';
        html += "<p>Chaque pas de " + fr(an.h, 2) + " donne toujours la même différence, " + fr(an.d[0], 2) + ". ";
        if (an.h !== 1) html += "Pour une unité : m = " + fr(an.d[0], 2) + " / " + fr(an.h, 2) + " = " + fr(an.m, 3) + ". ";
        else html += "m = " + fr(an.m, 3) + ". ";
        if (tb.t[0] !== 0) html += "Valeur en " + v + " = 0 : p = " + fr(tb.v[0], 2) + " − " + fr(an.m * tb.t[0], 3) + " = " + fr(an.p, 3) + ".";
        else html += "p = " + g + "(0) = " + fr(an.p, 3) + ".";
        html += "</p>";
        var terme = an.p === 0 ? "" : (an.p > 0 ? " + " : " − ") + fr(Math.abs(an.p), 3);
        var coef = an.m === 1 ? "" : an.m === -1 ? "−" : fr(an.m, 3);
        html += '<p class="formule">' + g + "(" + v + ") = " + coef + v + terme + "</p>";
      } else if (an.exp) {
        html += '<p class="titre-verdict ok">Rapports constants : modèle exponentiel.</p>';
        html += "<p>Chaque pas de " + fr(an.h, 2) + " multiplie toujours par le même facteur, " + fr(an.q[0], 3) + ". ";
        if (an.h !== 1) html += "Ce rapport porte sur " + fr(an.h, 2) + " unités : r" + (an.h === 2 ? "²" : "³") + " = " + fr(an.q[0], 3) + ", donc r = " + fr(an.r, 3) + ". ";
        else html += "r = " + fr(an.r, 3) + (an.r < 1 ? " (entre 0 et 1 : décroissance)" : "") + ". ";
        if (tb.t[0] !== 0) html += "Valeur en " + v + " = 0 : Q₀ = " + fr(tb.v[0], 2) + " / " + fr(an.r, 3) + " = " + fr(an.Q0, 3) + ".";
        else html += "Q₀ = " + g + "(0) = " + fr(an.Q0, 3) + ".";
        html += "</p>";
        html += '<p class="formule">' + g + "(" + v + ") = " + fr(an.Q0, 3) + "·" + fr(an.r, 3) + (v === "t" ? "ᵗ" : "ˣ") + "</p>";
      } else {
        html += '<p class="titre-verdict non">Ni les différences ni les rapports ne sont constants.</p>';
        html += "<p>Ce tableau ne suit ni un modèle linéaire, ni un modèle exponentiel.</p>";
      }
      if (tb.remarque) html += "<p>" + tb.remarque + "</p>";
      this._sh.getElementById("verdict").innerHTML = html;
    }
  }

  if (!customElements.get("rapports-differences-widget")) customElements.define("rapports-differences-widget", RapportsDifferencesWidget);
})();
