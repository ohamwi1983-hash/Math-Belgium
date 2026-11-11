(function () {
  "use strict";

  /* ================================================================
   * <multiplication-k-widget> — atelier « Multiplier un vecteur par un
   * réel k » (4e, calcul vectoriel, § 3). Vecteur AB fixe, AB = (2 ; 1),
   * A à l'origine du dessin ; curseur k de −3 à 3 par pas de 0,5. Le
   * vecteur k·AB est dessiné sur la droite (AB), graduée en multiples
   * de AB ; le tableau des 6 cas surligne la ligne active ; la longueur
   * (|k| fois celle de AB), le sens et les composantes sont affichés.
   * k = 0 : vecteur nul, sans direction. Défaut k = 2. Web Component
   * (Shadow DOM), fenêtre fixe.
   * ================================================================ */

  var AB = [2, 1];
  var K_DEFAUT = 2;
  var X_MIN = -7, X_MAX = 7, Y_MIN = -3.8, Y_MAX = 3.8;
  var LARGEUR = 480, HAUTEUR = 280, MARGE = 16;
  var NS = "http://www.w3.org/2000/svg";

  function fr(n) {
    var a = Math.round(n * 100) / 100;
    if (Object.is(a, -0)) a = 0;
    return (a < 0 ? "−" : "") + String(Math.abs(a)).replace(".", ",");
  }
  function par(n) { return n < 0 ? "(" + fr(n) + ")" : fr(n); }
  function el(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  var VAB = '<span class="vec">AB</span>';

  var CAS = [
    { id: "gt1", texte: "k > 1", effet: "même sens, plus long", test: function (k) { return k > 1; } },
    { id: "0a1", texte: "0 < k < 1", effet: "même sens, plus court", test: function (k) { return k > 0 && k < 1; } },
    { id: "0", texte: "k = 0", effet: "vecteur nul (pas de direction)", test: function (k) { return k === 0; } },
    { id: "m1a0", texte: "−1 < k < 0", effet: "sens opposé, plus court", test: function (k) { return k > -1 && k < 0; } },
    { id: "m1", texte: "k = −1", effet: "sens opposé, même longueur (vecteur opposé)", test: function (k) { return k === -1; } },
    { id: "ltm1", texte: "k < −1", effet: "sens opposé, plus long", test: function (k) { return k < -1; } },
  ];

  var STYLE =
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}' +
    '*{box-sizing:border-box;}' +
    '.vec{display:inline-block;position:relative;font-family:var(--serif,Georgia,serif);font-style:italic;font-weight:700;padding:0 1px;line-height:1;}' +
    '.vec::before{content:"";position:absolute;left:1px;right:3px;top:-0.32em;border-top:1.5px solid currentColor;}' +
    '.vec::after{content:"";position:absolute;right:0;top:-0.32em;transform:translateY(-50%);border-left:5px solid currentColor;border-top:3.5px solid transparent;border-bottom:3.5px solid transparent;margin-top:0.75px;}' +
    '.graphe-zone{display:flex;justify-content:center;margin:0 0 10px;}' +
    'svg{width:100%;max-width:480px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);display:block;}' +
    '.grille{stroke:var(--line,#d9cfc2);stroke-width:0.6;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.2;}' +
    '.droite{stroke:var(--ink-soft,#6b6055);stroke-width:1.2;stroke-dasharray:5 4;opacity:0.8;}' +
    '.v-ab{stroke:var(--ink,#241f1a);stroke-width:2.4;}' +
    '.v-kp{stroke:var(--good,#2f7a4f);stroke-width:7;opacity:0.55;stroke-linecap:round;}' +
    '.v-kn{stroke:var(--bad,#b23a3a);stroke-width:7;opacity:0.55;stroke-linecap:round;}' +
    '.m-ink{fill:var(--ink,#241f1a);} .m-soft{fill:var(--ink-soft,#6b6055);} .m-good{fill:var(--good,#2f7a4f);} .m-bad{fill:var(--bad,#b23a3a);}' +
    '.cran{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}' +
    '.cran-lab{font-size:11px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.pt{fill:var(--ink,#241f1a);}' +
    '.pt-m{stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.lab{font-size:13px;font-weight:700;font-family:var(--sans,sans-serif);fill:var(--ink,#241f1a);}' +
    '.lab-good{fill:var(--good,#2f7a4f);} .lab-bad{fill:var(--bad,#b23a3a);}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;margin:0 0 12px;}' +
    '.curseur label{font-weight:700;}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;min-height:44px;}' +
    '.curseur-row input{flex:1 1 auto;accent-color:var(--accent,#a8471f);min-height:44px;}' +
    '.k-val{min-width:52px;text-align:right;font-variant-numeric:tabular-nums;font-weight:700;font-size:1.1rem;}' +
    '.table-zone{overflow-x:auto;margin:0 0 10px;}' +
    'table{border-collapse:collapse;margin:0 auto;font-size:0.9rem;min-width:280px;}' +
    'th,td{border:1px solid var(--line,#d9cfc2);padding:6px 10px;text-align:left;}' +
    'th{background:var(--surface-2,#faf6f0);font-weight:700;}' +
    'td.k{white-space:nowrap;font-variant-numeric:tabular-nums;}' +
    'tr.actif td{background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:700;}' +
    '.lecture{display:flex;flex-direction:column;gap:6px;font-variant-numeric:tabular-nums;}' +
    '.ligne{padding:9px 12px;border-radius:var(--radius,3px);background:var(--surface-2,#faf6f0);font-size:0.95rem;line-height:1.7;}' +
    '.ligne-r{border-left:4px solid var(--good,#2f7a4f);font-weight:600;}' +
    '.ligne-r.neg{border-left-color:var(--bad,#b23a3a);}' +
    '.rappel{font-size:0.88rem;color:var(--ink-soft,#6b6055);}' +
    '.btn-reset{display:block;margin:10px auto 0;min-height:44px;padding:8px 16px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font:inherit;font-weight:600;cursor:pointer;}';

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    "<style>" + STYLE + "</style>" +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + " " + HAUTEUR + '" role="img" aria-label="Le vecteur k fois AB dessiné sur la droite AB"></svg></div>' +
    '<div class="curseur"><label for="k">Valeur de k</label><div class="curseur-row">' +
    '<input type="range" id="k" min="-3" max="3" step="0.5" value="' + K_DEFAUT + '">' +
    '<span class="k-val" id="k-val"></span></div></div>' +
    '<div class="table-zone"><table><thead><tr><th>Valeur de k</th><th>Effet sur <span class="vec">AB</span></th></tr></thead><tbody id="tbody"></tbody></table></div>' +
    '<div class="lecture" id="lecture" aria-live="polite"></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>';

  class MultiplicationKWidget extends HTMLElement {
    constructor() {
      super();
      var sh = this.attachShadow({ mode: "open" });
      sh.appendChild(TEMPLATE.content.cloneNode(true));
      this._sh = sh;
      this._k = K_DEFAUT;
      this._svg = sh.getElementById("svg");
      this._input = sh.getElementById("k");
    }

    connectedCallback() {
      var self = this;
      this._sh.getElementById("tbody").innerHTML = CAS.map(function (c) {
        return '<tr data-cas="' + c.id + '"><td class="k">' + c.texte + "</td><td>" + c.effet + "</td></tr>";
      }).join("");
      this._input.addEventListener("input", function () { self._k = parseFloat(self._input.value); self._rendre(); });
      this._sh.getElementById("reset").addEventListener("click", function () {
        self._k = K_DEFAUT; self._input.value = String(K_DEFAUT); self._rendre();
      });
      this._rendre();
    }

    _px(x, y) {
      return [MARGE + (x - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - 2 * MARGE),
        HAUTEUR - MARGE - (y - Y_MIN) / (Y_MAX - Y_MIN) * (HAUTEUR - 2 * MARGE)];
    }

    _ligne(a, b, attrs) {
      var pa = this._px(a[0], a[1]), pb = this._px(b[0], b[1]);
      attrs.x1 = pa[0].toFixed(1); attrs.y1 = pa[1].toFixed(1); attrs.x2 = pb[0].toFixed(1); attrs.y2 = pb[1].toFixed(1);
      this._svg.appendChild(el("line", attrs));
    }

    _texte(p, t, classe, ancre) {
      var e = el("text", { x: p[0].toFixed(1), y: p[1].toFixed(1), class: classe, "text-anchor": ancre || "middle" });
      e.textContent = t;
      this._svg.appendChild(e);
    }

    _rendre() {
      var k = this._k, svg = this._svg;
      this._sh.getElementById("k-val").textContent = "k = " + fr(k);
      this._sh.querySelectorAll("tr[data-cas]").forEach(function (tr) {
        var c = CAS.filter(function (x) { return x.id === tr.getAttribute("data-cas"); })[0];
        tr.classList.toggle("actif", c.test(k));
      });

      svg.innerHTML = "";
      var defs = el("defs", {});
      [["p-ink", "m-ink"], ["p-soft", "m-soft"], ["p-good", "m-good"], ["p-bad", "m-bad"]].forEach(function (m) {
        var mk = el("marker", { id: m[0], markerWidth: "12", markerHeight: "12", refX: "8", refY: "6", orient: "auto", markerUnits: "userSpaceOnUse" });
        mk.appendChild(el("path", { d: "M0,1 L11,6 L0,11 Z", class: m[1] }));
        defs.appendChild(mk);
      });
      svg.appendChild(defs);
      for (var i = Math.ceil(X_MIN); i <= Math.floor(X_MAX); i++) this._ligne([i, Y_MIN], [i, Y_MAX], { class: "grille" });
      for (var j = Math.ceil(Y_MIN); j <= Math.floor(Y_MAX); j++) this._ligne([X_MIN, j], [X_MAX, j], { class: "grille" });
      this._ligne([X_MIN, 0], [X_MAX, 0], { class: "axe", "marker-end": "url(#p-soft)" });
      this._ligne([0, Y_MIN], [0, Y_MAX], { class: "axe", "marker-end": "url(#p-soft)" });
      // droite (AB), prolongée jusqu'au cadre
      this._ligne([X_MIN, X_MIN * AB[1] / AB[0]], [X_MAX, X_MAX * AB[1] / AB[0]], { class: "droite" });
      // graduation de la droite en multiples de AB (−3 … 3)
      var nx = -AB[1], ny = AB[0], nn = Math.hypot(nx, ny);
      for (var m = -3; m <= 3; m++) {
        var c = [m * AB[0], m * AB[1]];
        var pc = this._px(c[0], c[1]);
        var ex = nx / nn * 5, ey = -ny / nn * 5;
        svg.appendChild(el("line", { x1: (pc[0] - ex).toFixed(1), y1: (pc[1] - ey).toFixed(1), x2: (pc[0] + ex).toFixed(1), y2: (pc[1] + ey).toFixed(1), class: "cran" }));
        if (m !== 0 && m !== 1) this._texte([pc[0] + 10, pc[1] + 16], fr(m), "cran-lab");
      }
      var kab = [k * AB[0], k * AB[1]];
      if (k !== 0) this._ligne([0, 0], kab, { class: k > 0 ? "v-kp" : "v-kn", "marker-end": "url(#" + (k > 0 ? "p-good" : "p-bad") + ")" });
      this._ligne([0, 0], AB, { class: "v-ab", "marker-end": "url(#p-ink)" });
      var pA = this._px(0, 0), pB = this._px(AB[0], AB[1]);
      svg.appendChild(el("circle", { cx: pA[0].toFixed(1), cy: pA[1].toFixed(1), r: 4.5, class: "pt" }));
      this._texte([pA[0] - 6, pA[1] + 17], "A", "lab", "end");
      this._texte([pB[0] - 4, pB[1] - 12], "B", "lab", "end");
      if (k !== 0 && k !== 1) {
        var pM = this._px(kab[0], kab[1]);
        svg.appendChild(el("circle", { cx: pM[0].toFixed(1), cy: pM[1].toFixed(1), r: 4.5, class: "pt pt-m" }));
        this._texte([pM[0] + (k > 0 ? -2 : 4), pM[1] + (k > 0 ? -12 : 20)], "M", "lab " + (k > 0 ? "lab-good" : "lab-bad"), k > 0 ? "end" : "start");
      }

      var lecture = this._sh.getElementById("lecture");
      var nomK = fr(k) + "·" + VAB;
      var comp = '<div class="ligne ligne-r' + (k < 0 ? " neg" : "") + '">' + nomK + " = (" + fr(k) + " × " + par(AB[0]) + " ; " + fr(k) + " × " + par(AB[1]) + ") = (" + fr(kab[0]) + " ; " + fr(kab[1]) + ")</div>";
      var info;
      if (k === 0) {
        info = '<div class="ligne">0·' + VAB + " est le <strong>vecteur nul</strong> : il n'a ni direction ni sens, et sa longueur vaut 0.</div>";
      } else {
        var sens = k > 0 ? "même sens que " + VAB : "sens opposé à " + VAB;
        var abk = Math.abs(k);
        var longueur = abk === 1 ? "même longueur que " + VAB : (abk > 1 ? fr(abk) + " fois plus long que " + VAB : fr(abk) + " fois la longueur de " + VAB + " (plus court)");
        info = (k === 1 ? '<div class="ligne">1·' + VAB + " = " + VAB + " : c'est le même vecteur (aucune ligne du tableau).</div>" : "") + '<div class="ligne">Longueur : ‖' + nomK + "‖ = |" + fr(k) + "| × ‖" + VAB + "‖ = " + fr(abk) + " × ‖" + VAB + "‖ — " + longueur + ". Sens : " + sens + ".</div>";
      }
      lecture.innerHTML = comp + info +
        '<div class="ligne rappel">Même direction, toujours (pour k ≠ 0) : ' + VAB + " et k·" + VAB + " sont <strong>colinéaires</strong>, portés par la même droite (AB). Le point M tel que <span class=\"vec\">AM</span> = k·" + VAB + " est donc sur (AB) : A, B et M sont alignés.</div>";
    }
  }

  if (!customElements.get("multiplication-k-widget")) {
    customElements.define("multiplication-k-widget", MultiplicationKWidget);
  }
})();
