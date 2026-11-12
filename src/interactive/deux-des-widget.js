(function () {
  "use strict";

  /* ================================================================
   * <deux-des-widget> — atelier « Deux dés : la grille des 36 issues »
   * (6e, chapitre 6 « Probabilités », section 2, diagramme cartésien).
   *
   * Mode « 2 dés » : grille 6 × 6 (1er dé en abscisse, 2e dé en ordonnée),
   * chaque case = une issue équiprobable. On choisit un événement (somme,
   * produit, maximum, écart, « au moins un 6 ») : les cases favorables
   * s'allument, on lit « n cases sur 36 » et la probabilité exacte. En
   * dessous, l'histogramme des 11 sommes montre qu'elles ne sont PAS
   * équiprobables (1, 2, …, 6, …, 2, 1 cases) ; la part de chaque barre qui
   * réalise l'événement choisi est mise en évidence.
   *
   * Mode « 3 dés : 9 ou 10 ? » : le problème posé à Galilée — 9 et 10
   * s'écrivent chacun de 6 façons comme somme de trois faces, mais 10 sort
   * plus souvent (27 issues sur 216 contre 25) : on compte des issues
   * ORDONNÉES, pas des décompositions.
   *
   * Fenêtres FIXES. Réglage par défaut : somme = 5 (4/36 = 1/9, exemple du
   * cours).
   * ================================================================ */

  var NS = "http://www.w3.org/2000/svg";

  // Grille : viewBox carré, cases carrées.
  var GW = 330, GH = 330, GG = 46, GD = 14, GHAUT = 14, GBAS = 44;
  var CASE = (GW - GG - GD) / 6;

  // Histogramme.
  var HW = 440, HH = 200, HG = 40, HD = 12, HHAUT = 16, HBAS = 34;

  var EVENEMENTS = {
    somme: { libelle: "somme = k", kMin: 2, kMax: 12, kDef: 5, valeur: function (a, b) { return a + b; }, teste: function (a, b, k) { return a + b === k; } },
    produit: { libelle: "produit = k", kMin: 1, kMax: 36, kDef: 12, valeur: function (a, b) { return a * b; }, teste: function (a, b, k) { return a * b === k; } },
    produitPair: { libelle: "produit pair", kMin: null, valeur: function (a, b) { return a * b; }, teste: function (a, b) { return (a * b) % 2 === 0; } },
    maximum: { libelle: "plus grand des deux = k", kMin: 1, kMax: 6, kDef: 4, valeur: function (a, b) { return Math.max(a, b); }, teste: function (a, b, k) { return Math.max(a, b) === k; } },
    ecart: { libelle: "écart entre les deux = k", kMin: 0, kMax: 5, kDef: 1, valeur: function (a, b) { return Math.abs(a - b); }, teste: function (a, b, k) { return Math.abs(a - b) === k; } },
    auMoinsUn6: { libelle: "au moins un 6", kMin: null, valeur: null, teste: function (a, b) { return a === 6 || b === 6; } },
  };

  function pgcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }

  function nombreFr(n, d) {
    var s = n.toFixed(d);
    if (d > 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
    return s.replace(".", ",");
  }

  // « 4/36 = 1/9 ≈ 0,111 » (fraction simplifiée seulement si elle diffère).
  function fractionTexte(n, total) {
    if (n === 0) return "0/" + total + " = 0";
    if (n === total) return total + "/" + total + " = 1";
    var g = pgcd(n, total);
    var s = n + "/" + total;
    if (g > 1) s += " = " + n / g + "/" + total / g;
    return s + " ≈ " + nombreFr(n / total, 3);
  }

  function svgEl(tag, attrs, texte) {
    var el = document.createElementNS(NS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    if (texte !== undefined) el.textContent = texte;
    return el;
  }

  function fleche(svg) {
    var defs = svgEl("defs", {});
    var m = svgEl("marker", { id: "fl", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
    m.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
    defs.appendChild(m);
    svg.appendChild(defs);
  }

  // Décompositions d'une somme en trois faces (a ≤ b ≤ c) et nombre d'issues ordonnées.
  function decompositions3(somme) {
    var liste = [];
    for (var a = 1; a <= 6; a++) for (var b = a; b <= 6; b++) {
      var c = somme - a - b;
      if (c < b || c > 6) continue;
      var facons = a === b && b === c ? 1 : a === b || b === c ? 3 : 6;
      liste.push({ a: a, b: b, c: c, facons: facons });
    }
    return liste;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    "<style>" +
    ":host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}" +
    "*{box-sizing:border-box;}" +
    "[hidden]{display:none!important;}" +
    ".figures{display:flex;flex-direction:column;align-items:center;gap:10px;margin-bottom:10px;}" +
    ".figures svg{width:100%;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}" +
    "#svg-grille{max-width:330px;}" +
    "#svg-histo{max-width:440px;}" +
    ".axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}" +
    ".fleche{fill:var(--ink-soft,#6b6055);}" +
    ".grad{font-size:11px;font-family:var(--mono,monospace);fill:var(--ink-soft,#6b6055);}" +
    ".titre-axe{font-size:11.5px;font-style:italic;font-family:var(--serif,serif);fill:var(--ink-soft,#6b6055);}" +
    ".case{fill:var(--surface,#fffdf9);stroke:var(--line,#ddd2c0);stroke-width:1;}" +
    ".case.on{fill:var(--accent-soft,#f6e3d6);stroke:var(--accent,#a8471f);stroke-width:2;}" +
    ".val{font-size:12px;font-family:var(--mono,monospace);fill:var(--ink-faint,#9c9083);}" +
    ".val.on{fill:var(--accent-ink,#7a3212);font-weight:700;}" +
    ".pastille{fill:var(--accent,#a8471f);}" +
    ".barre{fill:var(--line,#ddd2c0);}" +
    ".barre.on{fill:var(--accent,#a8471f);}" +
    ".barre.autre{fill:var(--good,#2f7a4f);}" +
    ".compte{font-size:10.5px;font-family:var(--mono,monospace);fill:var(--ink-soft,#6b6055);}" +
    ".compte.on{fill:var(--accent-ink,#7a3212);font-weight:700;}" +
    ".compte.autre{fill:var(--good,#2f7a4f);font-weight:700;}" +
    ".resultat{text-align:center;font-size:0.95rem;font-variant-numeric:tabular-nums;margin:0 0 6px;line-height:1.5;}" +
    ".resultat strong{color:var(--accent-ink,#7a3212);}" +
    ".note{text-align:center;font-size:0.84rem;color:var(--ink-soft,#6b6055);margin:0 0 12px;line-height:1.45;}" +
    ".galilee{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 0 12px;}" +
    ".colonne{border:1px solid var(--line,#ddd2c0);border-radius:var(--radius,3px);padding:8px 10px;background:var(--surface,#fffdf9);}" +
    ".colonne h4{margin:0 0 6px;font-size:0.9rem;}" +
    ".colonne.s9 h4{color:var(--good,#2f7a4f);}" +
    ".colonne.s10 h4{color:var(--accent-ink,#7a3212);}" +
    ".colonne ul{list-style:none;margin:0;padding:0;font-family:var(--mono,monospace);font-size:0.8rem;line-height:1.55;}" +
    ".colonne li{display:flex;justify-content:space-between;gap:6px;}" +
    ".colonne .tot{border-top:1px solid var(--line,#ddd2c0);margin-top:4px;padding-top:4px;font-weight:700;}" +
    ".controles{display:flex;flex-direction:column;gap:8px;}" +
    ".ligne{display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-size:0.88rem;}" +
    ".ligne label{flex:0 0 110px;font-weight:600;}" +
    ".ligne select{flex:1 1 180px;min-width:0;font:inherit;padding:4px 6px;border:1px solid var(--line,#ddd2c0);border-radius:var(--radius,3px);background:var(--surface,#fffdf9);color:var(--ink,#241f1a);}" +
    ".ligne input[type=range]{flex:1 1 140px;min-width:0;accent-color:var(--accent,#a8471f);}" +
    ".ligne .v{min-width:30px;text-align:right;font-weight:700;font-variant-numeric:tabular-nums;}" +
    "@media (max-width:480px){.ligne label{flex-basis:84px;font-size:0.82rem;}.galilee{grid-template-columns:1fr;}}" +
    "</style>" +
    '<div class="figures">' +
    '<svg id="svg-grille" viewBox="0 0 ' + GW + " " + GH + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Grille des 36 issues de deux dés"></svg>' +
    '<svg id="svg-histo" viewBox="0 0 ' + HW + " " + HH + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Nombre d\'issues de chaque somme"></svg>' +
    "</div>" +
    '<p class="resultat" id="resultat"></p>' +
    '<p class="note" id="note"></p>' +
    '<div class="galilee" id="galilee" hidden></div>' +
    '<div class="controles">' +
    '<div class="ligne"><label for="mode">expérience</label><select id="mode">' +
    '<option value="2">lancer deux dés</option>' +
    '<option value="3">lancer trois dés : 9 ou 10 ?</option>' +
    "</select></div>" +
    '<div class="ligne" id="ligne-ev"><label for="ev">événement</label><select id="ev">' +
    Object.keys(EVENEMENTS).map(function (k) { return '<option value="' + k + '">' + EVENEMENTS[k].libelle + "</option>"; }).join("") +
    "</select></div>" +
    '<div class="ligne" id="ligne-k"><label for="k">k</label><input type="range" id="k" min="2" max="12" step="1" value="5"><span class="v" id="k-v"></span></div>' +
    "</div>";

  class DeuxDesWidget extends HTMLElement {
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
      s.getElementById("mode").addEventListener("change", function () { self._rendre(); });
      s.getElementById("ev").addEventListener("change", function () {
        var ev = EVENEMENTS[s.getElementById("ev").value];
        if (ev.kMin !== null) {
          var k = s.getElementById("k");
          k.min = String(ev.kMin);
          k.max = String(ev.kMax);
          k.value = String(ev.kDef);
        }
        self._rendre();
      });
      s.getElementById("k").addEventListener("input", function () { self._rendre(); });
      this._rendre();
    }

    _rendre() {
      var s = this._s;
      var trois = s.getElementById("mode").value === "3";
      s.getElementById("ligne-ev").hidden = trois;
      s.getElementById("galilee").hidden = !trois;
      if (trois) {
        s.getElementById("ligne-k").hidden = true;
        this._rendreTrois();
        return;
      }
      var cle = s.getElementById("ev").value, ev = EVENEMENTS[cle];
      var avecK = ev.kMin !== null;
      s.getElementById("ligne-k").hidden = !avecK;
      var k = parseInt(s.getElementById("k").value, 10);
      s.getElementById("k-v").textContent = avecK ? String(k) : "";
      var n = 0;
      for (var a = 1; a <= 6; a++) for (var b = 1; b <= 6; b++) if (ev.teste(a, b, k)) n++;
      var nom = avecK ? ev.libelle.replace("k", String(k)) : ev.libelle;
      s.getElementById("resultat").innerHTML =
        "Événement « " + nom + " » : <strong>" + n + " case" + (n > 1 ? "s" : "") + " sur 36</strong>, donc P = " + fractionTexte(n, 36) + ".";
      var note;
      if (n === 0) note = "Aucune case ne convient : l'événement est impossible.";
      else if (cle === "auMoinsUn6") note = "Par le complément : « aucun 6 » occupe 5 × 5 = 25 cases, donc 36 − 25 = 11 cases.";
      else if (cle === "somme") note = "Les 11 sommes ne sont pas équiprobables : 7 occupe 6 cases, 2 et 12 une seule. « Favorables / possibles » se compte sur les 36 cases, pas sur les 11 sommes.";
      else if (cle === "produitPair") note = "Par le complément : le produit est impair seulement si les deux faces sont impaires, soit 3 × 3 = 9 cases.";
      else note = "Chaque case est une issue équiprobable : il suffit de compter les cases allumées.";
      s.getElementById("note").textContent = note;
      this._dessinerGrille(ev, k);
      this._dessinerHisto2(ev, k, cle);
    }

    _dessinerGrille(ev, k) {
      var svg = this._s.getElementById("svg-grille");
      svg.innerHTML = "";
      fleche(svg);
      var x0 = GG, y0 = GH - GBAS;
      for (var a = 1; a <= 6; a++) {
        for (var b = 1; b <= 6; b++) {
          var on = ev.teste(a, b, k);
          var x = x0 + (a - 1) * CASE, y = y0 - b * CASE;
          svg.appendChild(svgEl("rect", { x: x + 1.5, y: y + 1.5, width: CASE - 3, height: CASE - 3, rx: 3, class: "case" + (on ? " on" : "") }));
          if (ev.valeur) {
            svg.appendChild(svgEl("text", { x: x + CASE / 2, y: y + CASE / 2 + 4, "text-anchor": "middle", class: "val" + (on ? " on" : "") }, String(ev.valeur(a, b))));
          } else if (on) {
            svg.appendChild(svgEl("circle", { cx: x + CASE / 2, cy: y + CASE / 2, r: 5, class: "pastille" }));
          }
        }
        svg.appendChild(svgEl("text", { x: x0 + (a - 0.5) * CASE, y: y0 + 16, "text-anchor": "middle", class: "grad" }, String(a)));
        svg.appendChild(svgEl("text", { x: x0 - 8, y: y0 - (a - 0.5) * CASE + 4, "text-anchor": "end", class: "grad" }, String(a)));
      }
      svg.appendChild(svgEl("line", { x1: x0, y1: y0, x2: GW - 4, y2: y0, class: "axe", "marker-end": "url(#fl)" }));
      svg.appendChild(svgEl("line", { x1: x0, y1: y0, x2: x0, y2: 6, class: "axe", "marker-end": "url(#fl)" }));
      svg.appendChild(svgEl("text", { x: GW - GD, y: GH - 8, "text-anchor": "end", class: "titre-axe" }, "1er dé"));
      var ty = svgEl("text", { x: 14, y: (GHAUT + y0) / 2, "text-anchor": "middle", class: "titre-axe", transform: "rotate(-90 14 " + (GHAUT + y0) / 2 + ")" }, "2e dé");
      svg.appendChild(ty);
    }

    // Histogramme des 11 sommes : barre complète = nombre de cases de la somme ;
    // partie colorée = cases de cette somme qui réalisent l'événement choisi.
    _dessinerHisto2(ev, k, cle) {
      var svg = this._s.getElementById("svg-histo");
      svg.innerHTML = "";
      fleche(svg);
      var yMax = 7;
      var lb = (HW - HG - HD) / 11;
      var py = function (v) { return HH - HBAS - v / yMax * (HH - HBAS - HHAUT); };
      for (var somme = 2; somme <= 12; somme++) {
        var total = 0, dedans = 0;
        for (var a = 1; a <= 6; a++) {
          var b = somme - a;
          if (b < 1 || b > 6) continue;
          total++;
          if (ev.teste(a, b, k)) dedans++;
        }
        var x = HG + (somme - 2) * lb + lb * 0.15, w = lb * 0.7;
        svg.appendChild(svgEl("rect", { x: x, y: py(total), width: w, height: py(0) - py(total), class: "barre" }));
        if (dedans > 0) svg.appendChild(svgEl("rect", { x: x, y: py(dedans), width: w, height: py(0) - py(dedans), class: "barre on" }));
        var lbl = cle === "somme" || dedans === 0 ? String(total) : dedans + "/" + total;
        svg.appendChild(svgEl("text", { x: x + w / 2, y: py(total) - 4, "text-anchor": "middle", class: "compte" + (dedans > 0 ? " on" : "") }, lbl));
        svg.appendChild(svgEl("text", { x: x + w / 2, y: HH - HBAS + 14, "text-anchor": "middle", class: "grad" }, String(somme)));
      }
      svg.appendChild(svgEl("line", { x1: HG, y1: py(0), x2: HW - 4, y2: py(0), class: "axe", "marker-end": "url(#fl)" }));
      svg.appendChild(svgEl("line", { x1: HG, y1: py(0), x2: HG, y2: 6, class: "axe", "marker-end": "url(#fl)" }));
      svg.appendChild(svgEl("text", { x: HW - HD, y: HH - 6, "text-anchor": "end", class: "titre-axe" }, "somme des deux dés"));
      svg.appendChild(svgEl("text", { x: HG + 6, y: HHAUT, class: "titre-axe" }, "nombre de cases (sur 36)"));
    }

    _rendreTrois() {
      var s = this._s;
      var d9 = decompositions3(9), d10 = decompositions3(10);
      var n9 = d9.reduce(function (t, d) { return t + d.facons; }, 0);
      var n10 = d10.reduce(function (t, d) { return t + d.facons; }, 0);
      s.getElementById("resultat").innerHTML =
        "Somme 9 : <strong>" + n9 + " issues sur 216</strong> (P ≈ " + nombreFr(n9 / 216, 3) + ") — somme 10 : <strong>" +
        n10 + " issues sur 216</strong> (P ≈ " + nombreFr(n10 / 216, 3) + ").";
      s.getElementById("note").textContent =
        "Les joueurs qui écrivaient à Galilée comptaient 6 décompositions pour chacune des deux sommes. Mais une décomposition " +
        "aux trois faces différentes (1 + 2 + 6) donne 6 issues ordonnées, deux faces égales (1 + 4 + 4) seulement 3, trois faces " +
        "égales (3 + 3 + 3) une seule : on compte les 6 × 6 × 6 = 216 issues équiprobables, pas les décompositions.";
      var colonne = function (somme, liste, total, classe) {
        return '<div class="colonne ' + classe + '"><h4>Somme ' + somme + "</h4><ul>" +
          liste.map(function (d) { return "<li><span>" + d.a + " + " + d.b + " + " + d.c + "</span><span>" + d.facons + " façon" + (d.facons > 1 ? "s" : "") + "</span></li>"; }).join("") +
          '<li class="tot"><span>' + liste.length + " décompositions</span><span>" + total + " issues</span></li></ul></div>";
      };
      s.getElementById("galilee").innerHTML = colonne(9, d9, n9, "s9") + colonne(10, d10, n10, "s10");
      this._dessinerGrilleTrois();
      this._dessinerHisto3();
    }

    // En mode 3 dés, la grille montre les 36 couples des deux premiers dés et,
    // dans chaque case, la face du 3e dé qui complète la somme à 9 (vert) ou à 10 (orange).
    _dessinerGrilleTrois() {
      var svg = this._s.getElementById("svg-grille");
      svg.innerHTML = "";
      fleche(svg);
      var x0 = GG, y0 = GH - GBAS;
      for (var a = 1; a <= 6; a++) {
        for (var b = 1; b <= 6; b++) {
          var x = x0 + (a - 1) * CASE, y = y0 - b * CASE;
          var c9 = 9 - a - b, c10 = 10 - a - b;
          var ok9 = c9 >= 1 && c9 <= 6, ok10 = c10 >= 1 && c10 <= 6;
          svg.appendChild(svgEl("rect", { x: x + 1.5, y: y + 1.5, width: CASE - 3, height: CASE - 3, rx: 3, class: "case" + (ok9 || ok10 ? " on" : "") }));
          if (ok9) svg.appendChild(svgEl("text", { x: x + CASE * 0.3, y: y + CASE / 2 + 4, "text-anchor": "middle", class: "compte autre" }, String(c9)));
          if (ok10) svg.appendChild(svgEl("text", { x: x + CASE * 0.7, y: y + CASE / 2 + 4, "text-anchor": "middle", class: "compte on" }, String(c10)));
        }
        svg.appendChild(svgEl("text", { x: x0 + (a - 0.5) * CASE, y: y0 + 16, "text-anchor": "middle", class: "grad" }, String(a)));
        svg.appendChild(svgEl("text", { x: x0 - 8, y: y0 - (a - 0.5) * CASE + 4, "text-anchor": "end", class: "grad" }, String(a)));
      }
      svg.appendChild(svgEl("line", { x1: x0, y1: y0, x2: GW - 4, y2: y0, class: "axe", "marker-end": "url(#fl)" }));
      svg.appendChild(svgEl("line", { x1: x0, y1: y0, x2: x0, y2: 6, class: "axe", "marker-end": "url(#fl)" }));
      svg.appendChild(svgEl("text", { x: GW - GD, y: GH - 8, "text-anchor": "end", class: "titre-axe" }, "1er dé"));
      svg.appendChild(svgEl("text", { x: 14, y: (GHAUT + y0) / 2, "text-anchor": "middle", class: "titre-axe", transform: "rotate(-90 14 " + (GHAUT + y0) / 2 + ")" }, "2e dé"));
      svg.appendChild(svgEl("text", { x: GW / 2 + GG / 2, y: GH - 22, "text-anchor": "middle", class: "grad" }, ""));
    }

    _dessinerHisto3() {
      var svg = this._s.getElementById("svg-histo");
      svg.innerHTML = "";
      fleche(svg);
      var compte = {};
      for (var a = 1; a <= 6; a++) for (var b = 1; b <= 6; b++) for (var c = 1; c <= 6; c++) compte[a + b + c] = (compte[a + b + c] || 0) + 1;
      var yMax = 30, lb = (HW - HG - HD) / 16;
      var py = function (v) { return HH - HBAS - v / yMax * (HH - HBAS - HHAUT); };
      for (var somme = 3; somme <= 18; somme++) {
        var v = compte[somme], classe = somme === 9 ? " autre" : somme === 10 ? " on" : "";
        var x = HG + (somme - 3) * lb + lb * 0.12, w = lb * 0.76;
        svg.appendChild(svgEl("rect", { x: x, y: py(v), width: w, height: py(0) - py(v), class: "barre" + classe }));
        svg.appendChild(svgEl("text", { x: x + w / 2, y: py(v) - 4, "text-anchor": "middle", class: "compte" + classe }, String(v)));
        svg.appendChild(svgEl("text", { x: x + w / 2, y: HH - HBAS + 14, "text-anchor": "middle", class: "grad" }, String(somme)));
      }
      svg.appendChild(svgEl("line", { x1: HG, y1: py(0), x2: HW - 4, y2: py(0), class: "axe", "marker-end": "url(#fl)" }));
      svg.appendChild(svgEl("line", { x1: HG, y1: py(0), x2: HG, y2: 6, class: "axe", "marker-end": "url(#fl)" }));
      svg.appendChild(svgEl("text", { x: HW - HD, y: HH - 6, "text-anchor": "end", class: "titre-axe" }, "somme des trois dés"));
      svg.appendChild(svgEl("text", { x: HG + 6, y: HHAUT, class: "titre-axe" }, "nombre d'issues (sur 216)"));
    }
  }

  if (!customElements.get("deux-des-widget")) {
    customElements.define("deux-des-widget", DeuxDesWidget);
  }
})();
