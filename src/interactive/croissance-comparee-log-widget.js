(function () {
  "use strict";

  /* ================================================================
   * <croissance-comparee-log-widget> — atelier interactif : ln x face à
   * √x, ∛x, xᵏ (k réglable), x et eˣ, sur une fenêtre [0 ; xmax] dont la
   * largeur se règle par un curseur logarithmique (xmax de 10 à 10⁶). Les
   * ordonnées s'adaptent par paliers ronds, toujours annoncés. Les
   * croisements avec ln x sont calculés par bissection et repérés : ∛x se
   * laisse dépasser entre x ≈ 6,4 et x ≈ 93,4, puis repasse devant pour
   * toujours ; x⁰ʼ¹ ne repasse devant que vers 3,4 × 10¹⁵. Message central :
   * « finit par » — sur une fenêtre bornée, l'ordre observé peut tromper.
   * Web Component (Shadow DOM).
   * ================================================================ */

  var LARGEUR = 340, HAUTEUR = 260;
  var MG = { g: 44, d: 16, h: 14, b: 30 };
  var EXP = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"];
  var DEFAUT = { e: 1, k: 0.1, racine2: true, racine3: true, xk: false, lin: true, ex: true };

  function fr(n, d) {
    var s = (Math.round(n * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d);
    var neg = s.charAt(0) === "-";
    if (neg) s = s.slice(1);
    var parts = s.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    s = parts.join(",");
    if (neg && /[1-9]/.test(s)) s = "−" + s;
    return s;
  }

  function exposant(n) {
    return String(n).split("").map(function (c) { return c === "-" ? "⁻" : EXP[+c]; }).join("");
  }

  function sci(x) {
    if (x < 1e5) return fr(x, x < 10 ? 2 : x < 100 ? 1 : 0).replace(/,(\d*?)0+$/, ",$1").replace(/,$/, "");
    var n = Math.floor(Math.log10(x));
    var m = x / Math.pow(10, n);
    return fr(m, 1) + " × 10" + exposant(n);
  }

  function palier(v) {
    var e = Math.floor(Math.log10(v));
    var base = Math.pow(10, e);
    var choix = [1, 2, 2.5, 5, 10];
    for (var i = 0; i < choix.length; i++) if (choix[i] * base >= v - 1e-9) return choix[i] * base;
    return 10 * base;
  }

  function bissection(f, a, b) {
    var fa = f(a);
    for (var i = 0; i < 200; i++) {
      var m = (a + b) / 2, fm = f(m);
      if (fa * fm <= 0) b = m; else { a = m; fa = fm; }
    }
    return (a + b) / 2;
  }

  // Croisements de ln x et xᵏ : en posant u = ln x, ln x = xᵏ ⟺ u = e^(k·u). La fonction
  // g(u) = ln u − k·u atteint son maximum −ln k − 1 en u = 1/k : deux croisements si k < 1/e.
  function croisementsPuissance(k) {
    var g = function (u) { return Math.log(u) - k * u; };
    if (g(1 / k) <= 0) return null;
    var u1 = bissection(g, 1e-9, 1 / k);
    var u2 = bissection(g, 1 / k, 1 / k * 60);
    return [Math.exp(u1), Math.exp(u2)];
  }

  function svgEl(tag, attrs) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  var COURBES = [
    { id: "ln", nom: "ln x", classe: "c-ln", f: function (x) { return Math.log(x); } },
    { id: "racine2", nom: "√x", classe: "c-r2", f: Math.sqrt },
    { id: "racine3", nom: "∛x", classe: "c-r3", f: Math.cbrt },
    { id: "xk", nom: "xᵏ", classe: "c-xk", f: null },
    { id: "lin", nom: "x", classe: "c-lin", f: function (x) { return x; } },
    { id: "ex", nom: "eˣ", classe: "c-ex", f: Math.exp },
  ];

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}' +
    '*{box-sizing:border-box;}' +
    '.zone{display:flex;flex-direction:column;align-items:center;gap:4px;margin-bottom:10px;}' +
    'svg{width:100%;max-width:340px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.grille{stroke:var(--line,#e2d8c8);stroke-width:1;}' +
    '.grad{font-size:9.5px;font-family:var(--mono,monospace);fill:var(--ink-soft,#6b6055);}' +
    '.c-ln{stroke:var(--accent,#a8471f);stroke-width:3;fill:none;}' +
    '.c-r2{stroke:var(--good,#2f7a4f);stroke-width:2.2;fill:none;}' +
    '.c-r3{stroke:var(--plan,#5b4ea3);stroke-width:2.2;fill:none;}' +
    '.c-xk{stroke:var(--plan,#5b4ea3);stroke-width:2.2;fill:none;stroke-dasharray:7 4;}' +
    '.c-lin{stroke:var(--ink-faint,#9c9083);stroke-width:1.8;fill:none;}' +
    '.c-ex{stroke:var(--bad,#b3261e);stroke-width:2;fill:none;}' +
    '.f-ln{fill:var(--accent-ink,#7a3212);}' +
    '.f-r2{fill:var(--good,#2f7a4f);}' +
    '.f-r3,.f-xk{fill:var(--plan,#5b4ea3);}' +
    '.f-lin{fill:var(--ink-soft,#6b6055);}' +
    '.f-ex{fill:var(--bad,#b3261e);}' +
    '.etiq{font-size:11px;font-weight:700;}' +
    '.croix{fill:var(--surface,#fff);stroke:var(--ink,#241f1a);stroke-width:1.6;}' +
    '.etiq-croix{font-size:10px;font-family:var(--mono,monospace);fill:var(--ink,#241f1a);}' +
    '.annonce{font-size:0.86rem;color:var(--ink-soft,#6b6055);text-align:center;}' +
    '.bilan{border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);background:var(--surface,#fff);padding:10px 12px;margin:6px 0 14px;font-size:0.93rem;line-height:1.5;}' +
    '.bilan p{margin:0 0 6px;}' +
    '.bilan p:last-child{margin-bottom:0;}' +
    '.cle{font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur{display:flex;flex-direction:column;gap:4px;margin-top:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);text-align:center;}' +
    '.ligne{display:flex;align-items:center;gap:12px;min-height:44px;}' +
    '.ligne input[type="range"]{flex:1 1 auto;min-height:44px;accent-color:var(--accent,#a8471f);}' +
    '.valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:78px;text-align:right;font-size:0.9rem;}' +
    '.boutons{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:6px 0;}' +
    'button{min-height:44px;min-width:56px;padding:6px 12px;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);background:var(--surface,#fff);color:var(--ink,#241f1a);font:inherit;font-weight:600;cursor:pointer;}' +
    'button:focus-visible,input:focus-visible{outline:2px solid var(--accent,#a8471f);outline-offset:2px;}' +
    '.cases{display:flex;flex-wrap:wrap;gap:4px 14px;justify-content:center;margin:6px 0;}' +
    '.cases label{display:flex;align-items:center;gap:8px;min-height:44px;font-weight:600;cursor:pointer;}' +
    '.cases input{width:20px;height:20px;accent-color:var(--accent,#a8471f);}' +
    '[hidden]{display:none!important;}' +
    '</style>' +
    '<div class="zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '"></svg><div class="annonce" id="annonce"></div></div>' +
    '<div class="curseur"><label for="e">largeur de la fenêtre : x de 0 à …</label><div class="ligne"><input type="range" id="e" min="1" max="6" step="0.05"><span class="valeur" id="e-v"></span></div></div>' +
    '<div class="boutons"><button type="button" data-e="1">10</button><button type="button" data-e="2">100</button><button type="button" data-e="3">1 000</button><button type="button" data-e="6">10⁶</button></div>' +
    '<div class="cases">' +
    '<label><input type="checkbox" id="racine2"> √x</label>' +
    '<label><input type="checkbox" id="racine3"> ∛x</label>' +
    '<label><input type="checkbox" id="lin"> x</label>' +
    '<label><input type="checkbox" id="ex"> eˣ</label>' +
    '<label><input type="checkbox" id="xk"> xᵏ</label>' +
    '</div>' +
    '<div class="curseur" id="bloc-k" hidden><label for="k">k — exposant de xᵏ</label><div class="ligne"><input type="range" id="k" min="0.1" max="1" step="0.01"><span class="valeur" id="k-v"></span></div></div>' +
    '<div class="bilan" id="bilan"></div>';

  class CroissanceCompareeLogWidget extends HTMLElement {
    constructor() {
      super();
      var sh = this.attachShadow({ mode: "open" });
      sh.appendChild(TEMPLATE.content.cloneNode(true));
      this._sh = sh;
      this._e = Object.assign({}, DEFAUT);
    }

    connectedCallback() {
      var self = this, sh = this._sh;
      var ie = sh.getElementById("e"), ik = sh.getElementById("k");
      ie.value = String(this._e.e);
      ik.value = String(this._e.k);
      ie.addEventListener("input", function () { self._e.e = parseFloat(ie.value); self._rendre(); });
      ik.addEventListener("input", function () { self._e.k = parseFloat(ik.value); self._rendre(); });
      sh.querySelectorAll("button[data-e]").forEach(function (b) {
        b.addEventListener("click", function () { self._e.e = parseFloat(b.dataset.e); ie.value = b.dataset.e; self._rendre(); });
      });
      ["racine2", "racine3", "lin", "ex", "xk"].forEach(function (id) {
        var c = sh.getElementById(id);
        c.checked = self._e[id];
        c.addEventListener("change", function () { self._e[id] = c.checked; self._rendre(); });
      });
      this._rendre();
    }

    _rendre() {
      var sh = this._sh, st = this._e;
      var xmax = Math.pow(10, st.e);
      var k = st.k;
      sh.getElementById("e-v").textContent = sci(xmax);
      sh.getElementById("k-v").textContent = fr(k, 2);
      sh.getElementById("bloc-k").hidden = !st.xk;

      var visibles = COURBES.filter(function (c) { return c.id === "ln" || st[c.id]; });
      var fk = function (x) { return Math.pow(x, k); };
      // Palier vertical : calé sur les courbes « lentes » (ln et puissances < 1) ; x et eˣ sortent.
      var ref = Math.log(xmax);
      if (st.racine2) ref = Math.max(ref, Math.sqrt(xmax));
      if (st.racine3) ref = Math.max(ref, Math.cbrt(xmax));
      if (st.xk) ref = Math.max(ref, fk(xmax));
      var yMax = palier(ref * 1.1);
      var yMin = -0.25 * yMax;
      sh.getElementById("annonce").textContent = "l'échelle verticale va maintenant jusqu'à " + sci(yMax);

      var svg = sh.getElementById("svg");
      svg.innerHTML = "";
      var gx = function (x) { return MG.g + (x / xmax) * (LARGEUR - MG.g - MG.d); };
      var gy = function (y) { return HAUTEUR - MG.b - ((y - yMin) / (yMax - yMin)) * (HAUTEUR - MG.b - MG.h); };
      var defs = svgEl("defs", {});
      var m = svgEl("marker", { id: "fl", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      m.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(m);
      svg.appendChild(defs);
      var y0 = gy(0);
      // grille horizontale
      for (var i = 1; i <= 4; i++) {
        var v = yMax * i / 4, yy = gy(v);
        svg.appendChild(svgEl("line", { x1: MG.g, y1: yy, x2: LARGEUR - MG.d, y2: yy, class: "grille" }));
        var t = svgEl("text", { x: MG.g - 4, y: yy + 3, "text-anchor": "end", class: "grad" });
        t.textContent = sci(v);
        svg.appendChild(t);
      }
      svg.appendChild(svgEl("line", { x1: MG.g, y1: y0, x2: LARGEUR - 4, y2: y0, class: "axe", "marker-end": "url(#fl)" }));
      svg.appendChild(svgEl("line", { x1: MG.g, y1: HAUTEUR - MG.b + 6, x2: MG.g, y2: 4, class: "axe", "marker-end": "url(#fl)" }));
      // Graduations en notation scientifique plus longues : 2 ou 3 graduations seulement au-delà de 10⁴.
      var pas = palier(xmax / (xmax >= 1e4 ? 2.5 : 4));
      for (var xt = pas; xt <= xmax * 1.0001; xt += pas) {
        var px = gx(xt);
        svg.appendChild(svgEl("line", { x1: px, y1: y0, x2: px, y2: y0 + 4, class: "axe" }));
        var tt = svgEl("text", { x: px, y: HAUTEUR - MG.b + 16, "text-anchor": xt + pas > xmax * 1.0001 && px > LARGEUR - 50 ? "end" : "middle", class: "grad" });
        tt.textContent = sci(xt);
        svg.appendChild(tt);
      }
      var t0 = svgEl("text", { x: MG.g - 4, y: y0 + 3, "text-anchor": "end", class: "grad" });
      t0.textContent = "0";
      svg.appendChild(t0);

      var etiquettesY = [];
      var self = this;
      visibles.forEach(function (c) {
        var f = c.id === "xk" ? fk : c.f;
        var d = "", enCours = false, sortie = null;
        var N = 500;
        for (var j = 0; j <= N; j++) {
          // échantillonnage plus fin près de 0 (ln y plonge vers −∞)
          var x = xmax * Math.pow(j / N, 2);
          if (x <= 0) continue;
          var y = f(x);
          if (y > yMax) {
            if (enCours && sortie === null) sortie = x;
            if (enCours) { d += "L" + gx(x).toFixed(1) + " " + gy(yMax).toFixed(1) + " "; }
            enCours = false;
            continue;
          }
          if (y < yMin) { enCours = false; continue; }
          d += (enCours ? "L" : "M") + gx(x).toFixed(1) + " " + gy(y).toFixed(1) + " ";
          enCours = true;
        }
        svg.appendChild(svgEl("path", { d: d, class: c.classe }));
        var cls = "etiq f-" + c.classe.slice(2);
        if (sortie !== null && (c.id === "lin" || c.id === "ex")) {
          var xs = c.id === "lin" ? yMax : Math.log(yMax);
          var lab = svgEl("text", { x: Math.min(gx(xs) + 4, LARGEUR - MG.d - 2), y: MG.h + 10 + (c.id === "ex" ? 0 : 12), "text-anchor": gx(xs) > LARGEUR - 90 ? "end" : "start", class: cls });
          lab.textContent = c.nom + " hors du graphique ↑";
          svg.appendChild(lab);
        } else if (c.id !== "lin" && c.id !== "ex") {
          var yf = f(xmax);
          etiquettesY.push({ y: gy(yf), texte: c.id === "xk" ? "xᵏ (k = " + fr(k, 2) + ")" : c.nom, cls: cls });
        }
      });
      // étiquettes en bout de courbe, écartées verticalement pour ne pas se chevaucher
      // du bas vers le haut : l'étiquette la plus basse reste en place, les autres remontent.
      etiquettesY.sort(function (a, b) { return b.y - a.y; });
      for (var q = 1; q < etiquettesY.length; q++) {
        if (etiquettesY[q - 1].y - etiquettesY[q].y < 13) etiquettesY[q].y = etiquettesY[q - 1].y - 13;
      }
      etiquettesY.forEach(function (e) {
        var lt = svgEl("text", { x: LARGEUR - MG.d - 2, y: (e.y - 4).toFixed(1), "text-anchor": "end", class: e.cls });
        lt.textContent = e.texte;
        svg.appendChild(lt);
      });

      // croisements
      var dernierPx = -1e9, rang = 0;
      var marquer = function (x, f) {
        if (x > xmax) return;
        var cx = gx(x), cy = gy(f(x));
        svg.appendChild(svgEl("circle", { cx: cx, cy: cy, r: 4.5, class: "croix" }));
        // Pas d'étiquette collée à l'axe vertical (fenêtre très large), et étiquettes de deux
        // croisements voisins alternées dessus/dessous pour ne pas se chevaucher.
        if (cx - MG.g < 18) return;
        rang = cx - dernierPx < 60 ? rang + 1 : 0;
        dernierPx = cx;
        var lt = svgEl("text", { x: Math.min(cx + 6, LARGEUR - 60), y: rang % 2 ? cy - 8 : cy + 14, class: "etiq-croix" });
        lt.textContent = "x ≈ " + sci(x);
        svg.appendChild(lt);
      };
      var C3 = [bissection(function (x) { return Math.log(x) - Math.cbrt(x); }, 2, 20), bissection(function (x) { return Math.log(x) - Math.cbrt(x); }, 20, 500)];
      if (st.racine3) { marquer(C3[0], Math.cbrt); marquer(C3[1], Math.cbrt); }
      var CK = st.xk ? croisementsPuissance(k) : null;
      if (CK) { marquer(CK[0], fk); marquer(CK[1], fk); }

      // bilan
      var html = "";
      if (st.racine2) html += "<p><b>√x</b> reste toujours au-dessus de ln x : l'écart minimal vaut 2 − ln 4 ≈ 0,614, atteint en x = 4.</p>";
      if (st.racine3) {
        if (xmax < C3[0]) html += "<p><b>∛x</b> reste au-dessus de ln x sur cette fenêtre… élargis-la.</p>";
        else if (xmax < C3[1]) html += "<p><b>∛x</b> s'est fait dépasser par ln x en x ≈ " + fr(C3[0], 1) + " : sur cette fenêtre, ln x semble l'emporter. Élargis encore la fenêtre.</p>";
        else html += "<p><b>∛x</b> se laisse dépasser par ln x entre x ≈ " + fr(C3[0], 1) + " et x ≈ " + fr(C3[1], 1) + ", puis repasse devant et ne redescend plus jamais.</p>";
      }
      if (st.xk) {
        if (!CK) html += "<p><b>xᵏ (k = " + fr(k, 2) + ")</b> reste au-dessus de ln x pour tout x > 0 (c'est le cas dès que k > 1/e ≈ 0,368).</p>";
        else {
          var p = "<p><b>xᵏ (k = " + fr(k, 2) + ")</b> passe sous ln x dès x ≈ " + sci(CK[0]) + ". Elle finit par repasser devant, mais seulement vers " + sci(CK[1]);
          p += CK[1] > xmax ? " — bien au-delà de cette fenêtre : ici, ln x a l'air de gagner.</p>" : ".</p>";
          html += p;
        }
      }
      if (st.ex && Math.log(yMax) < xmax) html += "<p><b>eˣ</b> sort du graphique dès x ≈ " + fr(Math.log(yMax), 1) + " : elle écrase toutes les autres.</p>";
      html += '<p><span class="cle">« Finit par »</span> : sur une fenêtre bornée, l\'ordre observé peut tromper. Seule la limite en +∞ tranche : ln x / xᵏ tend vers 0 pour tout k > 0, si petit soit-il.</p>';
      sh.getElementById("bilan").innerHTML = html;
    }
  }

  if (!customElements.get("croissance-comparee-log-widget")) customElements.define("croissance-comparee-log-widget", CroissanceCompareeLogWidget);
})();
