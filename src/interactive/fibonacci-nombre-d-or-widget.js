(function () {
  "use strict";

  /* ================================================================
   * <fibonacci-nombre-d-or-widget> — atelier interactif (5e, chapitre 3
   * « Suites », section « Problèmes classiques ») : l'élève choisit les
   * deux premiers termes u₁ et u₂ (entiers de −10 à 20), la suite suit la
   * règle de Fibonacci uₙ₊₂ = uₙ₊₁ + uₙ. Tableau des 15 premiers termes
   * avec le rapport uₙ₊₁/uₙ, et graphique de ce rapport : il oscille
   * autour de φ = (1 + √5)/2 et s'en rapproche — quels que soient les
   * deux premiers termes, pourvu qu'ils ne soient pas tous les deux nuls
   * (formule de Binet : uₙ = A·φⁿ + B·ψⁿ, et A = 0 exigerait
   * u₂ = ψ·u₁ avec ψ = (1 − √5)/2 irrationnel, impossible pour des
   * entiers non tous nuls). Un terme nul en cours de route (ex. 2 ; −1 ;
   * 1 ; 0 ; 1…) rend UN rapport indéfini : « — » dans le tableau.
   * Fenêtre du graphique FIXE (rapports de 0 à 3, les autres sont
   * signalés au bord). Web Component (Shadow DOM).
   * ================================================================ */

  var NS = "http://www.w3.org/2000/svg";
  var PHI = (1 + Math.sqrt(5)) / 2;
  var N_TERMES = 15;
  var BORNE_MIN = -10, BORNE_MAX = 20;
  var DEFAUT = { u1: 1, u2: 1 };
  var LARGEUR = 460, HAUTEUR = 250, MG = 34, MD = 16, MH = 16, MB = 30;
  var Y_MIN = 0, Y_MAX = 3;
  var N_RAPPORTS = N_TERMES - 1;

  function entierFr(v) {
    var s = String(Math.abs(v)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return (v < 0 ? "−" : "") + s;
  }

  function decimalFr(v, dec) {
    var t = v.toFixed(dec);
    if (/^-0[.,]?0*$/.test(t)) t = t.slice(1);
    return t.replace(".", ",").replace("-", "−");
  }

  function svgEl(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    for (var key in attrs) el.setAttribute(key, attrs[key]);
    return el;
  }

  function xPx(n) { return MG + (n - 0.5) / (N_RAPPORTS) * (LARGEUR - MG - MD); }
  function yPx(v) { return HAUTEUR - MB - (v - Y_MIN) / (Y_MAX - Y_MIN) * (HAUTEUR - MB - MH); }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}' +
    '*{box-sizing:border-box;}' +
    '.presets{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;margin-bottom:12px;}' +
    '.preset{flex:1 1 auto;min-height:44px;padding:8px 10px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);font-weight:600;font-size:0.85rem;cursor:pointer;font-family:inherit;}' +
    '.preset:focus-visible,.btn-reset:focus-visible,input:focus-visible{outline:2px solid var(--accent,#a8471f);outline-offset:2px;}' +
    '.regle{text-align:center;font-family:var(--serif,serif);font-style:italic;font-weight:600;font-size:1.05rem;margin:0 0 10px;}' +
    '.controles{display:grid;grid-template-columns:1fr 1fr;gap:10px 16px;margin-bottom:12px;}' +
    '@media (max-width:420px){.controles{grid-template-columns:1fr;}}' +
    '.curseur{display:flex;flex-direction:column;gap:4px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:10px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-width:0;height:36px;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:36px;text-align:right;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:10px;}' +
    'svg{width:100%;max-width:460px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.grille{stroke:var(--line,#e2d8c8);stroke-width:0.8;}' +
    '.tick{font-size:10.5px;fill:var(--ink-soft,#6b6055);font-family:var(--mono,monospace);}' +
    '.ligne-phi{stroke:var(--good,#2f7a4f);stroke-width:1.6;stroke-dasharray:5 4;}' +
    '.etiquette-phi{font-size:11.5px;font-weight:700;fill:var(--good,#2f7a4f);font-family:var(--mono,monospace);}' +
    '.connecteur{stroke:var(--accent,#a8471f);stroke-width:1.5;stroke-dasharray:3 3;fill:none;}' +
    '.point-dessus{fill:var(--accent,#a8471f);}' +
    '.point-dessous{fill:var(--plan,#5b4ea3);}' +
    '.hors{fill:var(--ink-faint,#9c9083);}' +
    '.legende{font-size:0.82rem;color:var(--ink-soft,#6b6055);text-align:center;margin:0 0 12px;}' +
    '.legende .dessus{color:var(--accent,#a8471f);font-weight:700;}' +
    '.legende .dessous{color:var(--plan,#5b4ea3);font-weight:700;}' +
    '.verdict{font-size:0.92rem;line-height:1.45;margin:0 0 12px;padding:10px 14px;border-radius:var(--radius,3px);background:var(--surface-2,#faf6f0);border-left:4px solid var(--good,#2f7a4f);}' +
    '.verdict.nul{border-left-color:var(--bad,#b23a3a);}' +
    '.table-zone{overflow-x:auto;margin-bottom:12px;}' +
    'table{border-collapse:collapse;width:100%;font-variant-numeric:tabular-nums;font-size:0.88rem;}' +
    'th,td{padding:4px 8px;border-bottom:1px solid var(--line,#e2d8c8);text-align:right;white-space:nowrap;}' +
    'th{color:var(--ink-soft,#6b6055);font-weight:600;}' +
    'td.dessus{color:var(--accent,#a8471f);font-weight:600;}' +
    'td.dessous{color:var(--plan,#5b4ea3);font-weight:600;}' +
    'td.vide{color:var(--ink-faint,#9c9083);}' +
    '.encart{font-size:0.88rem;line-height:1.45;padding:10px 14px;border-radius:var(--radius,3px);border:1px dashed var(--line,#e2d8c8);margin:0 0 12px;}' +
    '.btn-reset{display:block;margin:0 auto;min-height:44px;padding:8px 16px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;}' +
    '</style>' +
    '<div class="presets" role="group" aria-label="Préréglages">' +
    '<button type="button" class="preset" data-u1="1" data-u2="1">Fibonacci (1 ; 1)</button>' +
    '<button type="button" class="preset" data-u1="2" data-u2="1">Lucas (2 ; 1)</button>' +
    '<button type="button" class="preset" id="hasard">Au hasard</button></div>' +
    '<p class="regle">uₙ₊₂ = uₙ₊₁ + uₙ</p>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="u1">u₁</label><div class="curseur-row"><input type="range" id="u1" min="' + BORNE_MIN + '" max="' + BORNE_MAX + '" step="1"><span class="curseur-valeur" id="u1-valeur"></span></div></div>' +
    '<div class="curseur"><label for="u2">u₂</label><div class="curseur-row"><input type="range" id="u2" min="' + BORNE_MIN + '" max="' + BORNE_MAX + '" step="1"><span class="curseur-valeur" id="u2-valeur"></span></div></div>' +
    '</div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" role="img" aria-label="Rapports de deux termes successifs"></svg></div>' +
    '<p class="legende">Rapport uₙ₊₁ / uₙ en fonction de n : <span class="dessus">au-dessus de φ</span>, <span class="dessous">en dessous de φ</span>.</p>' +
    '<p class="verdict" id="verdict" aria-live="polite"></p>' +
    '<div class="table-zone"><table><thead><tr><th>n</th><th>uₙ</th><th>uₙ₊₁ / uₙ</th></tr></thead><tbody id="corps"></tbody></table></div>' +
    '<p class="encart"><strong>Le nombre d\'or</strong> φ = (1 + √5) / 2 ≈ 1,618034 vérifie φ² = φ + 1 (≈ 2,618034). ' +
    'Si le rapport de deux termes successifs se stabilise sur une valeur x, la règle uₙ₊₂ = uₙ₊₁ + uₙ, divisée par uₙ, donne x² = x + 1 : x ne peut être que φ.</p>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>';

  class FibonacciNombreDOrWidgetClass extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._u1 = DEFAUT.u1;
      this._u2 = DEFAUT.u2;
      this._in1 = shadow.getElementById("u1");
      this._in2 = shadow.getElementById("u2");
      this._val1 = shadow.getElementById("u1-valeur");
      this._val2 = shadow.getElementById("u2-valeur");
      this._svg = shadow.getElementById("svg");
      this._verdict = shadow.getElementById("verdict");
      this._corps = shadow.getElementById("corps");
      this._reset = shadow.getElementById("reset");
      this._hasard = shadow.getElementById("hasard");
      this._presets = Array.prototype.slice.call(shadow.querySelectorAll(".preset[data-u1]"));
    }

    connectedCallback() {
      var self = this;
      this._onIn = function () { self._u1 = parseInt(self._in1.value, 10); self._u2 = parseInt(self._in2.value, 10); self._rendre(); };
      this._onPreset = function (e) { self._u1 = parseInt(e.currentTarget.dataset.u1, 10); self._u2 = parseInt(e.currentTarget.dataset.u2, 10); self._rendre(); };
      this._onHasard = function () {
        var a, b;
        do { a = 1 + Math.floor(Math.random() * 20); b = 1 + Math.floor(Math.random() * 20); } while (a === self._u1 && b === self._u2);
        self._u1 = a; self._u2 = b; self._rendre();
      };
      this._onReset = function () { self._u1 = DEFAUT.u1; self._u2 = DEFAUT.u2; self._rendre(); };
      this._in1.addEventListener("input", this._onIn);
      this._in2.addEventListener("input", this._onIn);
      this._hasard.addEventListener("click", this._onHasard);
      this._reset.addEventListener("click", this._onReset);
      this._presets.forEach(function (b) { b.addEventListener("click", self._onPreset); });
      this._rendre();
    }

    disconnectedCallback() {
      var self = this;
      this._in1.removeEventListener("input", this._onIn);
      this._in2.removeEventListener("input", this._onIn);
      this._hasard.removeEventListener("click", this._onHasard);
      this._reset.removeEventListener("click", this._onReset);
      this._presets.forEach(function (b) { b.removeEventListener("click", self._onPreset); });
    }

    _termes() {
      var t = [this._u1, this._u2];
      while (t.length < N_TERMES) t.push(t[t.length - 1] + t[t.length - 2]);
      return t;
    }

    _rendre() {
      this._in1.value = String(this._u1);
      this._in2.value = String(this._u2);
      this._val1.textContent = entierFr(this._u1);
      this._val2.textContent = entierFr(this._u2);
      var t = this._termes();
      var rapports = [];
      for (var i = 0; i < N_RAPPORTS; i++) rapports.push(t[i] === 0 ? null : t[i + 1] / t[i]);
      this._remplirTable(t, rapports);
      this._dessiner(rapports);
      this._commenter(t, rapports);
    }

    _classe(r) {
      if (r === null) return "vide";
      if (Math.abs(r - PHI) < 5e-7) return "";
      return r > PHI ? "dessus" : "dessous";
    }

    _remplirTable(t, rapports) {
      var html = "";
      for (var i = 0; i < N_TERMES; i++) {
        var r = i < N_RAPPORTS ? rapports[i] : undefined;
        var cellule;
        if (r === undefined) cellule = '<td class="vide"></td>';
        else if (r === null) cellule = '<td class="vide" title="uₙ = 0 : division impossible">—</td>';
        else cellule = '<td class="' + this._classe(r) + '">' + decimalFr(r, 6) + "</td>";
        html += "<tr><td>" + (i + 1) + "</td><td>" + entierFr(t[i]) + "</td>" + cellule + "</tr>";
      }
      this._corps.innerHTML = html;
    }

    _dessiner(rapports) {
      var svg = this._svg;
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var y0 = yPx(0);
      for (var g = 1; g <= 3; g++) {
        svg.appendChild(svgEl("line", { x1: MG, y1: yPx(g), x2: LARGEUR - MD, y2: yPx(g), class: "grille" }));
      }
      for (var v = 0; v <= 3; v++) {
        var tk = svgEl("text", { x: MG - 8, y: yPx(v) + 4, "text-anchor": "end", class: "tick" });
        tk.textContent = String(v);
        svg.appendChild(tk);
      }
      svg.appendChild(svgEl("line", { x1: MG, y1: y0, x2: LARGEUR - MD + 6, y2: y0, class: "axe" }));
      svg.appendChild(svgEl("path", { d: "M" + (LARGEUR - MD + 10) + " " + y0 + " l-8 -4 v8 z", class: "fleche" }));
      svg.appendChild(svgEl("line", { x1: MG, y1: HAUTEUR - MB, x2: MG, y2: MH - 8, class: "axe" }));
      svg.appendChild(svgEl("path", { d: "M" + MG + " " + (MH - 12) + " l-4 8 h8 z", class: "fleche" }));
      var en = svgEl("text", { x: LARGEUR - MD, y: y0 + 22, "text-anchor": "end", class: "tick" });
      en.textContent = "n";
      svg.appendChild(en);
      var yPhi = yPx(PHI);
      svg.appendChild(svgEl("line", { x1: MG, y1: yPhi, x2: LARGEUR - MD, y2: yPhi, class: "ligne-phi" }));
      var ePhi = svgEl("text", { x: LARGEUR - MD - 2, y: yPhi - 6, "text-anchor": "end", class: "etiquette-phi" });
      ePhi.textContent = "φ ≈ 1,618";
      svg.appendChild(ePhi);
      for (var n = 1; n <= N_RAPPORTS; n += (n < 2 ? 1 : 3)) {
        var lab = svgEl("text", { x: xPx(n), y: y0 + 14, "text-anchor": "middle", class: "tick" });
        lab.textContent = String(n);
        svg.appendChild(lab);
      }
      // Connecteur pointillé entre rapports successifs visibles et définis.
      var d = "", precedentVisible = false;
      rapports.forEach(function (r, i) {
        var visible = r !== null && r >= Y_MIN && r <= Y_MAX;
        if (visible) { d += (precedentVisible ? " L" : " M") + xPx(i + 1).toFixed(1) + " " + yPx(r).toFixed(1); }
        precedentVisible = visible;
      });
      if (d) svg.appendChild(svgEl("path", { d: d.trim(), class: "connecteur" }));
      var self = this;
      rapports.forEach(function (r, i) {
        if (r === null) return;
        var x = xPx(i + 1);
        if (r > Y_MAX) {
          svg.appendChild(svgEl("path", { d: "M" + x.toFixed(1) + " " + (MH - 2) + " l-5 8 h10 z", class: "hors" }));
        } else if (r < Y_MIN) {
          svg.appendChild(svgEl("path", { d: "M" + x.toFixed(1) + " " + (y0 - 2) + " l-5 -8 h10 z", class: "hors" }));
        } else {
          var c = self._classe(r);
          svg.appendChild(svgEl("circle", { cx: x.toFixed(1), cy: yPx(r).toFixed(1), r: 4.5, class: c === "dessous" ? "point-dessous" : "point-dessus" }));
        }
      });
    }

    _commenter(t, rapports) {
      var v = this._verdict;
      v.className = "verdict";
      if (this._u1 === 0 && this._u2 === 0) {
        v.classList.add("nul");
        v.textContent = "Avec u₁ = u₂ = 0, tous les termes sont nuls : aucun rapport n'existe. C'est le seul cas où le rapport ne tend pas vers φ.";
        return;
      }
      var dernier = rapports[N_RAPPORTS - 1];
      var ecart = Math.abs(dernier - PHI);
      var ecartTexte = ecart < 5e-7 ? "moins de 0,000001" : decimalFr(ecart, 6);
      var nuls = [];
      for (var i = 0; i < N_RAPPORTS; i++) if (t[i] === 0) nuls.push(i + 1);
      var phrase = "Quels que soient les deux premiers termes entiers (pas tous les deux nuls), le rapport uₙ₊₁ / uₙ finit par " +
        "osciller autour du nombre d'or φ ≈ 1,618034, alternativement au-dessus et en dessous, et s'en rapproche. " +
        "Ici, u₁₅ / u₁₄ = " + decimalFr(dernier, 6) + " : écart avec φ de " + ecartTexte + ".";
      if (nuls.length) {
        phrase += " Attention : u" + nuls.map(indice).join(", u") + " = 0, le rapport correspondant n'existe pas (division par 0), d'où le « — ».";
      }
      v.textContent = phrase;
    }
  }

  function indice(n) {
    var chiffres = "₀₁₂₃₄₅₆₇₈₉";
    return String(n).split("").map(function (c) { return chiffres[+c]; }).join("");
  }

  if (!customElements.get("fibonacci-nombre-d-or-widget")) {
    customElements.define("fibonacci-nombre-d-or-widget", FibonacciNombreDOrWidgetClass);
  }
})();
