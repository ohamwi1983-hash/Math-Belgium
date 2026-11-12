(function () {
  "use strict";

  /* ================================================================
   * <dichotomie-widget> — atelier interactif (5e, ch. 5, § 9) : la
   * méthode de la dichotomie pas à pas. P(q) = 2q³ − 6q² − 50 sur
   * [4 ; 5] (exemple du cours : P(4,5) ≈ 10,75 ; P(4,25) ≈ −4,84 ;
   * P(4,375) ≈ 2,64 ; P(4,3125) ≈ −1,18 → q ≈ 4,34), ou x³ − 2 sur
   * [1 ; 2] (racine ∛2). Bouton « Étape suivante » : l'intervalle se
   * coupe en deux (bande colorée qui rétrécit, milieu marqué, signe de
   * P(m)), le tableau des itérations se remplit, la largeur est divisée
   * par 2. Fenêtre FIXE ; zoom sur l'intervalle courant seulement à la
   * demande (bouton), jamais automatiquement. Web Component (Shadow DOM).
   * ================================================================ */

  var FONCTIONS = {
    cout: {
      label: "P(q) = 2q³ − 6q² − 50",
      variable: "q",
      p: function (q) { return 2 * q * q * q - 6 * q * q - 50; },
      a0: 4, b0: 5, vue: { xMin: 3, xMax: 5.6, yMin: -62, yMax: 120 },
      contexte: "Coût moyen minimal (exemple du cours) : on cherche q tel que P(q) = 0, entre 4 et 5.",
    },
    racine: {
      label: "P(x) = x³ − 2",
      variable: "x",
      p: function (x) { return x * x * x - 2; },
      a0: 1, b0: 2, vue: { xMin: 0.4, xMax: 2.4, yMin: -2.6, yMax: 12 },
      contexte: "Racine cubique de 2 : on cherche x tel que x³ = 2, entre 1 et 2.",
    },
  };

  var ETAPES_MAX = 10;
  var LARGEUR = 320, HAUTEUR = 220, M_G = 36, M_D = 14, M_H = 14, M_B = 26;

  function formatNombreFr(n, decimales) {
    var facteur = Math.pow(10, decimales);
    var arrondi = Math.round(n * facteur) / facteur;
    if (Object.is(arrondi, -0)) arrondi = 0;
    return arrondi.toFixed(decimales).replace(".", ",").replace("-", "−");
  }

  /* Bornes de dichotomie : décimales exactes (puissances de 2), écrites sans zéros inutiles. */
  function formatBorne(n) {
    var s = (Math.round(n * 1e6) / 1e6).toString();
    return s.replace(".", ",").replace("-", "−");
  }

  function svgEl(ns, tag, attrs) {
    var el = document.createElementNS(ns, tag);
    for (var key in attrs) el.setAttribute(key, attrs[key]);
    return el;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.formule{text-align:center;font-size:0.92rem;font-weight:600;color:var(--ink,#241f1a);margin:0 0 4px;}' +
    '.contexte{text-align:center;font-size:0.8rem;color:var(--ink-soft,#6b6055);margin:0 0 10px;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:10px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.graduation{stroke:var(--ink-soft,#6b6055);stroke-width:1;}' +
    '.grad-txt{font-size:9px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.courbe{stroke:var(--plan,#5b4ea3);stroke-width:2.2;fill:none;}' +
    '.bande{fill:var(--accent,#a8471f);opacity:0.16;}' +
    '.bord{stroke:var(--accent,#a8471f);stroke-width:1.6;}' +
    '.milieu{stroke:var(--ink,#241f1a);stroke-width:1.2;stroke-dasharray:4 3;}' +
    '.pt-pos{fill:var(--good,#2f7a4f);stroke:var(--surface,#fff);stroke-width:1.2;}' +
    '.pt-neg{fill:var(--bad,#b23a3a);stroke:var(--surface,#fff);stroke-width:1.2;}' +
    '.etq{font-size:10px;font-weight:700;font-family:var(--sans,sans-serif);paint-order:stroke;stroke:var(--surface-2,#faf6f0);stroke-width:3px;}' +
    '.etq-bord{fill:var(--accent-ink,#7a3212);}' +
    '.etq-pos{fill:var(--good,#2f7a4f);}' +
    '.etq-neg{fill:var(--bad,#b23a3a);}' +
    '.etat{text-align:center;font-size:0.86rem;font-weight:600;margin:0 0 10px;padding:9px 12px;border-radius:var(--radius,3px);background:var(--surface-2,#faf6f0);color:var(--ink,#241f1a);font-variant-numeric:tabular-nums;}' +
    '.tableau-zone{margin:0 0 12px;}' +
    'table{width:100%;border-collapse:collapse;font-size:0.72rem;font-variant-numeric:tabular-nums;}' +
    'th,td{padding:4px 3px;text-align:center;border-bottom:1px solid var(--line,#d9cfc2);white-space:nowrap;}' +
    'th{font-weight:700;color:var(--ink-soft,#6b6055);}' +
    'td.pos{color:var(--good,#2f7a4f);font-weight:700;}' +
    'td.neg{color:var(--bad,#b23a3a);font-weight:700;}' +
    'td.intervalle{white-space:normal;}' +
    'tr.courante td{background:var(--accent-soft,#f6e2d3);}' +
    '.controles{display:flex;flex-direction:column;gap:10px;}' +
    '.ligne{display:flex;flex-wrap:wrap;gap:8px;align-items:center;}' +
    '.ligne label{font-weight:600;font-size:0.86rem;color:var(--ink,#241f1a);}' +
    'select{min-height:44px;flex:1 1 160px;padding:6px 8px;border-radius:var(--radius,3px);border:1px solid var(--line,#d9cfc2);background:var(--surface,#fff);color:var(--ink,#241f1a);font:inherit;font-size:0.88rem;}' +
    '.boutons{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;}' +
    '.btn{min-height:44px;padding:8px 12px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.86rem;font-family:inherit;}' +
    '.btn:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '.btn:disabled{opacity:0.5;cursor:default;}' +
    '.btn-principal{background:var(--accent,#a8471f);color:var(--surface,#fff);border-color:var(--accent,#a8471f);}' +
    '</style>' +
    '<p class="formule" id="formule"></p>' +
    '<p class="contexte" id="contexte"></p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Graphe de P et intervalle de dichotomie"></svg></div>' +
    '<p class="etat" id="etat"></p>' +
    '<div class="tableau-zone"><table><thead><tr><th>étape</th><th>m</th><th>P(m)</th><th>nouvel intervalle</th><th>largeur</th></tr></thead><tbody id="corps"></tbody></table></div>' +
    '<div class="controles">' +
    '<div class="boutons">' +
    '<button class="btn btn-principal" id="suivant" type="button">Étape suivante</button>' +
    '<button class="btn" id="zoom" type="button">Zoom sur l\'intervalle</button>' +
    '<button class="btn" id="recommencer" type="button">Recommencer</button>' +
    '</div>' +
    '<div class="ligne"><label for="fonction">Équation</label><select id="fonction">' +
    '<option value="cout">2q³ − 6q² − 50 = 0 (exemple du cours)</option>' +
    '<option value="racine">x³ − 2 = 0 (racine cubique de 2)</option>' +
    '</select></div>' +
    '</div>';

  class DichotomieWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._cle = "cout";
      this._svg = shadow.getElementById("svg");
      this._formule = shadow.getElementById("formule");
      this._contexte = shadow.getElementById("contexte");
      this._etat = shadow.getElementById("etat");
      this._corps = shadow.getElementById("corps");
      this._btnSuivant = shadow.getElementById("suivant");
      this._btnZoom = shadow.getElementById("zoom");
      this._btnRecommencer = shadow.getElementById("recommencer");
      this._selFonction = shadow.getElementById("fonction");
      this._recommencer();
    }

    connectedCallback() {
      var self = this;
      this._onSuivant = function () { self._etape(); };
      this._onZoom = function () { self._basculerZoom(); };
      this._onRecommencer = function () { self._recommencer(); self._rendre(); };
      this._onFonction = function () { self._cle = self._selFonction.value; self._recommencer(); self._rendre(); };
      this._btnSuivant.addEventListener("click", this._onSuivant);
      this._btnZoom.addEventListener("click", this._onZoom);
      this._btnRecommencer.addEventListener("click", this._onRecommencer);
      this._selFonction.addEventListener("change", this._onFonction);
      this._rendre();
    }

    disconnectedCallback() {
      this._btnSuivant.removeEventListener("click", this._onSuivant);
      this._btnZoom.removeEventListener("click", this._onZoom);
      this._btnRecommencer.removeEventListener("click", this._onRecommencer);
      this._selFonction.removeEventListener("change", this._onFonction);
    }

    _recommencer() {
      var F = FONCTIONS[this._cle];
      this._a = F.a0;
      this._b = F.b0;
      this._iterations = [];
      this._trouve = false;
      this._vue = F.vue;
      this._zoom = false;
    }

    _etape() {
      if (this._iterations.length >= ETAPES_MAX || this._trouve) return;
      var F = FONCTIONS[this._cle];
      var a = this._a, b = this._b, m = (a + b) / 2;
      var pa = F.p(a), pm = F.p(m);
      var na, nb;
      if (pm === 0) { na = m; nb = m; this._trouve = true; }
      else if (pa * pm < 0) { na = a; nb = m; }
      else { na = m; nb = b; }
      this._iterations.push({ a: a, b: b, m: m, pm: pm, na: na, nb: nb });
      this._a = na;
      this._b = nb;
      this._rendre();
    }

    /* Zoom calculé UNE fois, au clic, autour de l'intervalle courant — jamais recalé ensuite. */
    _basculerZoom() {
      var F = FONCTIONS[this._cle];
      if (this._zoom) { this._vue = F.vue; this._zoom = false; }
      else {
        var w = Math.max(this._b - this._a, 1e-4);
        var xMin = this._a - w * 0.6, xMax = this._b + w * 0.6;
        var y1 = F.p(xMin), y2 = F.p(xMax);
        var yMax = Math.max(Math.abs(y1), Math.abs(y2)) * 1.25;
        this._vue = { xMin: xMin, xMax: xMax, yMin: -yMax, yMax: yMax };
        this._zoom = true;
      }
      this._rendre();
    }

    _px(x) { var v = this._vue; return M_G + (x - v.xMin) / (v.xMax - v.xMin) * (LARGEUR - M_G - M_D); }
    _py(y) { var v = this._vue; return HAUTEUR - M_B - (y - v.yMin) / (v.yMax - v.yMin) * (HAUTEUR - M_H - M_B); }

    _rendre() {
      var F = FONCTIONS[this._cle];
      var v = this._vue;
      var ns = "http://www.w3.org/2000/svg";
      var svg = this._svg;
      var self = this;
      svg.innerHTML = "";
      this._formule.textContent = F.label;
      this._contexte.textContent = F.contexte;

      var defs = svgEl(ns, "defs", {});
      var fleche = svgEl(ns, "marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      fleche.appendChild(svgEl(ns, "path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(fleche);
      var clip = svgEl(ns, "clipPath", { id: "zone" });
      clip.appendChild(svgEl(ns, "rect", { x: M_G, y: M_H - 4, width: LARGEUR - M_G - M_D, height: HAUTEUR - M_H - M_B + 8 }));
      defs.appendChild(clip);
      svg.appendChild(defs);

      /* Bande de l'intervalle courant [a ; b]. */
      var xa = this._px(this._a), xb = this._px(this._b);
      var g = svgEl(ns, "g", { "clip-path": "url(#zone)" });
      g.appendChild(svgEl(ns, "rect", { x: Math.min(xa, xb).toFixed(2), y: M_H - 4, width: Math.max(Math.abs(xb - xa), 1.5).toFixed(2), height: HAUTEUR - M_H - M_B + 8, class: "bande" }));
      g.appendChild(svgEl(ns, "line", { x1: xa.toFixed(2), x2: xa.toFixed(2), y1: M_H - 4, y2: HAUTEUR - M_B + 4, class: "bord" }));
      g.appendChild(svgEl(ns, "line", { x1: xb.toFixed(2), x2: xb.toFixed(2), y1: M_H - 4, y2: HAUTEUR - M_B + 4, class: "bord" }));

      /* Courbe. */
      var n = 240, d = "";
      for (var k = 0; k <= n; k++) {
        var xx = v.xMin + (k / n) * (v.xMax - v.xMin);
        d += (k === 0 ? "M" : "L") + this._px(xx).toFixed(2) + " " + this._py(F.p(xx)).toFixed(2) + " ";
      }
      g.appendChild(svgEl(ns, "path", { d: d.trim(), class: "courbe" }));

      /* Dernier milieu testé. */
      var der = this._iterations[this._iterations.length - 1];
      if (der) {
        var xm = this._px(der.m);
        g.appendChild(svgEl(ns, "line", { x1: xm.toFixed(2), x2: xm.toFixed(2), y1: this._py(0).toFixed(2), y2: this._py(der.pm).toFixed(2), class: "milieu" }));
        g.appendChild(svgEl(ns, "circle", { cx: xm.toFixed(2), cy: this._py(der.pm).toFixed(2), r: 4.6, class: der.pm > 0 ? "pt-pos" : "pt-neg" }));
      }
      svg.appendChild(g);

      /* Axes (y = 0 toujours dans la fenêtre ; axe vertical à gauche de la zone). */
      var y0 = this._py(0);
      svg.appendChild(svgEl(ns, "line", { x1: M_G - 4, x2: LARGEUR - M_D + 4, y1: y0.toFixed(2), y2: y0.toFixed(2), class: "axe", "marker-end": "url(#fleche)" }));
      svg.appendChild(svgEl(ns, "line", { x1: M_G, x2: M_G, y1: HAUTEUR - M_B + 4, y2: M_H - 6, class: "axe", "marker-end": "url(#fleche)" }));
      var etP = svgEl(ns, "text", { x: M_G + 4, y: M_H + 4, class: "grad-txt" });
      etP.textContent = "P";
      svg.appendChild(etP);
      this._graduationsX(svg, ns, y0);

      /* Étiquettes a, b, et signe de P(m). */
      var etA = svgEl(ns, "text", { x: xa.toFixed(2), y: HAUTEUR - 6, "text-anchor": Math.abs(xb - xa) < 40 ? "end" : "middle", class: "etq etq-bord" });
      etA.textContent = "a = " + formatBorne(this._a);
      var etB = svgEl(ns, "text", { x: xb.toFixed(2), y: HAUTEUR - 6, "text-anchor": Math.abs(xb - xa) < 40 ? "start" : "middle", class: "etq etq-bord" });
      etB.textContent = "b = " + formatBorne(this._b);
      if (!this._trouve) { svg.appendChild(etA); svg.appendChild(etB); }
      if (der) {
        var xmT = this._px(der.m), ymT = this._py(der.pm);
        var dansZone = xmT > M_G && xmT < LARGEUR - M_D && ymT > M_H && ymT < HAUTEUR - M_B;
        if (dansZone) {
          var etM = svgEl(ns, "text", { x: xmT.toFixed(2), y: (der.pm > 0 ? ymT - 9 : ymT + 16).toFixed(2), "text-anchor": "middle", class: "etq " + (der.pm > 0 ? "etq-pos" : "etq-neg") });
          etM.textContent = "P(m) " + (der.pm > 0 ? "> 0" : "< 0");
          svg.appendChild(etM);
        }
      }

      this._majTableau(F);
      this._majEtat(F);
      this._btnSuivant.disabled = this._iterations.length >= ETAPES_MAX || this._trouve;
      this._btnZoom.textContent = this._zoom ? "Vue d'ensemble" : "Zoom sur l'intervalle";
    }

    _graduationsX(svg, ns, y0) {
      var v = this._vue;
      var etendue = v.xMax - v.xMin;
      var pas = Math.pow(10, Math.floor(Math.log10(etendue / 4)));
      if (etendue / pas > 8) pas *= 2;
      if (etendue / pas > 8) pas *= 2.5;
      var dec = Math.max(0, -Math.floor(Math.log10(pas) + 1e-9));
      for (var t = Math.ceil(v.xMin / pas) * pas; t <= v.xMax - pas * 0.3; t += pas) {
        var xt = this._px(t);
        if (xt < M_G + 6) continue;
        svg.appendChild(svgEl(ns, "line", { x1: xt.toFixed(2), x2: xt.toFixed(2), y1: (y0 - 3).toFixed(2), y2: (y0 + 3).toFixed(2), class: "graduation" }));
        var txt = svgEl(ns, "text", { x: xt.toFixed(2), y: (y0 - 6).toFixed(2), "text-anchor": "middle", class: "grad-txt" });
        txt.textContent = formatNombreFr(t, dec);
        svg.appendChild(txt);
      }
    }

    _majTableau(F) {
      var html = '<tr><td>0</td><td>—</td><td>—</td><td>[' + formatBorne(F.a0) + ' ; ' + formatBorne(F.b0) + ']</td><td>' + formatBorne(F.b0 - F.a0) + '</td></tr>';
      var dernier = this._iterations.length - 1;
      this._iterations.forEach(function (it, i) {
        var cl = it.pm > 0 ? "pos" : (it.pm < 0 ? "neg" : "");
        var intervalle = it.na === it.nb ? "racine : " + formatBorne(it.na) : "[" + formatBorne(it.na) + " ; " + formatBorne(it.nb) + "]";
        html += '<tr' + (i === dernier ? ' class="courante"' : '') + '><td>' + (i + 1) + '</td><td>' + formatBorne(it.m) + '</td><td class="' + cl + '">' +
          formatNombreFr(it.pm, 2) + '</td><td class="intervalle">' + intervalle + '</td><td>' + formatBorne(it.nb - it.na) + '</td></tr>';
      });
      this._corps.innerHTML = html;
    }

    _majEtat(F) {
      var n = this._iterations.length;
      var w = this._b - this._a;
      if (this._trouve) {
        this._etat.textContent = "P(m) = 0 exactement : la racine vaut " + formatBorne(this._a) + ".";
        return;
      }
      if (n === 0) {
        this._etat.textContent = "P(" + formatBorne(F.a0) + ") ≈ " + formatNombreFr(F.p(F.a0), 2) + " < 0 et P(" + formatBorne(F.b0) + ") ≈ " +
          formatNombreFr(F.p(F.b0), 2) + " > 0 : une racine est dans [" + formatBorne(F.a0) + " ; " + formatBorne(F.b0) + "]. Clique « Étape suivante ».";
        return;
      }
      var m = (this._a + this._b) / 2;
      var dec = Math.max(2, Math.min(5, Math.ceil(-Math.log10(w / 2))));
      var texte = "Largeur divisée par 2 à chaque étape : " + formatBorne(w) + " après " + n + " étape" + (n > 1 ? "s" : "") +
        ". " + F.variable + " ≈ " + formatNombreFr(m, dec) + " (milieu du dernier intervalle, à " + formatBorne(w / 2) + " près).";
      if (n >= ETAPES_MAX) texte += " Fin : 10 étapes suffisent largement.";
      this._etat.textContent = texte;
    }
  }

  if (!customElements.get("dichotomie-widget")) {
    customElements.define("dichotomie-widget", DichotomieWidget);
  }
})();
