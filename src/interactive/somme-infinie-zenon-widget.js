(function () {
  "use strict";

  /* ================================================================
   * <somme-infinie-zenon-widget> — atelier interactif : la somme infinie
   * d'une suite géométrique, deux vues sur la même suite.
   * (a) Quand 0 < q < 1 : un carré qui représente S∞, rempli terme après
   *     terme (chaque terme prend la part 1 − q de ce qui reste, en
   *     rectangles alternés). Quand −1 < q < 0 : une droite graduée où les
   *     sommes partielles font des allers-retours autour de S∞. Quand
   *     q ≥ 1 : pas de vue (a), un message l'explique.
   * (b) Le graphique des sommes partielles Sₙ, avec la droite S∞ = u₁/(1−q)
   *     quand |q| < 1 et l'écart S∞ − Sₙ, multiplié par q à chaque terme.
   * Les curseurs parcourent des listes de valeurs (u₁, q) qui contiennent
   * les valeurs exactes des préréglages (q = 1/3, u₁ = 6). Web Component
   * (Shadow DOM).
   * ================================================================ */

  function liste(debut, fin, pas) {
    var t = [];
    for (var v = debut; v <= fin + 1e-9; v += pas) t.push(Math.round(v * 100) / 100);
    return t;
  }

  var VALEURS_U1 = liste(0.1, 1, 0.1).concat([1.5, 2, 3, 4, 5, 6]);
  var VALEURS_Q = (function () {
    var t = liste(-0.9, 1.2, 0.05).filter(function (v) { return Math.abs(v) > 1e-9; });
    t.push(1 / 3, -1 / 3, 2 / 3);
    t.sort(function (a, b) { return a - b; });
    return t;
  })();

  var PRESETS = {
    achille: { u1: 0.5, q: 0.5, n: 6 },
    neuf: { u1: 0.9, q: 0.1, n: 4 },
    cours: { u1: 6, q: 1 / 3, n: 6 },
  };
  var DEFAUT = PRESETS.achille;
  var N_MAX = 20;

  var LARGEUR = 460, HAUTEUR = 250, MARGE_G = 46, MARGE_D = 18, MARGE_H = 22, MARGE_B = 28;

  function indexProche(tab, v) {
    var best = 0;
    for (var i = 1; i < tab.length; i++) if (Math.abs(tab[i] - v) < Math.abs(tab[best] - v)) best = i;
    return best;
  }

  var INDICES = { "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉" };
  function indice(k) {
    return String(k).split("").map(function (c) { return INDICES[c] || c; }).join("");
  }

  // Virgule décimale, « − » typographique, 4 décimales au plus ; « ≈ » quand on arrondit.
  function nombreFr(x) {
    var arrondi = Math.round(x * 10000) / 10000;
    var exact = Math.abs(arrondi - x) < 1e-9;
    var s;
    if (exact) s = String(arrondi);
    else s = arrondi.toFixed(4);
    s = s.replace(".", ",").replace("-", "−");
    if (s === "−0" || s === "−0,0000") s = s.replace("−", "");
    return (exact ? "" : "≈ ") + s;
  }

  // « = 0,75 » ou « ≈ 0,9844 » : jamais « = ≈ ».
  function egalA(x) {
    var t = nombreFr(x);
    return t.indexOf("≈ ") === 0 ? " " + t : " = " + t;
  }

  function nombreSansApprox(x) {
    return nombreFr(x).replace("≈ ", "");
  }

  function qTexte(q) {
    if (Math.abs(q - 1 / 3) < 1e-9) return "1/3";
    if (Math.abs(q + 1 / 3) < 1e-9) return "−1/3";
    if (Math.abs(q - 2 / 3) < 1e-9) return "2/3";
    return nombreSansApprox(q);
  }

  // Graduation « ronde » au-dessus de v : 1, 2, 2,5, 5 × 10ᵏ.
  function plafondRond(v) {
    var p = Math.pow(10, Math.floor(Math.log10(v)));
    var m = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
    for (var i = 0; i < m.length; i++) if (m[i] * p >= v - 1e-12) return m[i] * p;
    return 10 * p;
  }

  function svgEl(tag, attrs) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var key in attrs) el.setAttribute(key, attrs[key]);
    return el;
  }

  function fleches(svg, sfx) {
    sfx = sfx || "";
    var defs = svgEl("defs", {});
    var marker = svgEl("marker", { id: "fleche" + sfx, markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
    marker.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
    defs.appendChild(marker);
    var marker2 = svgEl("marker", { id: "pointe" + sfx, markerWidth: "5", markerHeight: "5", refX: "4.5", refY: "2.5", orient: "auto" });
    marker2.appendChild(svgEl("path", { d: "M0,0 L5,2.5 L0,5 Z", class: "pointe" }));
    defs.appendChild(marker2);
    svg.appendChild(defs);
  }

  function texte(svg, x, y, contenu, classe, ancre) {
    var t = svgEl("text", { x: x.toFixed(2), y: y.toFixed(2), class: classe, "text-anchor": ancre || "start" });
    t.textContent = contenu;
    svg.appendChild(t);
    return t;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}' +
    '*{box-sizing:border-box;}' +
    '.presets{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;margin-bottom:10px;}' +
    '.btn{min-height:44px;padding:8px 12px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;}' +
    '.btn:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '.btn:focus-visible,input:focus-visible{outline:2px solid var(--accent,#a8471f);outline-offset:2px;}' +
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.02rem;font-weight:600;margin:0 0 10px;}' +
    '.vues{display:grid;grid-template-columns:1fr;gap:10px;margin-bottom:12px;}' +
    '@media (min-width:720px){.vues{grid-template-columns:minmax(0,0.8fr) minmax(0,1.2fr);align-items:start;}}' +
    '.vue{display:flex;flex-direction:column;align-items:center;gap:4px;}' +
    '.vue-titre{font-size:0.82rem;font-weight:700;color:var(--ink-soft,#6b6055);text-transform:uppercase;letter-spacing:0.04em;margin:0;}' +
    'svg{width:100%;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '#svg-a{max-width:300px;}' +
    '#svg-b{max-width:460px;}' +
    '.message-a{font-size:0.88rem;color:var(--ink-soft,#6b6055);background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);padding:12px;margin:0;text-align:center;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.pointe{fill:var(--accent,#a8471f);}' +
    '.graduation{stroke:var(--line,#e2d8c8);stroke-width:1;}' +
    '.cadre{fill:none;stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.part-1{fill:var(--accent,#a8471f);fill-opacity:0.8;stroke:var(--surface,#fff);stroke-width:1;}' +
    '.part-2{fill:var(--accent,#a8471f);fill-opacity:0.5;stroke:var(--surface,#fff);stroke-width:1;}' +
    '.part-vide{fill:var(--surface,#fff);stroke:var(--line,#e2d8c8);stroke-width:1;}' +
    '.reste{fill:var(--good,#2f7a4f);fill-opacity:0.18;stroke:var(--good,#2f7a4f);stroke-width:1.2;stroke-dasharray:3 2;}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.etiquette-n{font-size:10.5px;fill:var(--ink-soft,#6b6055);font-family:var(--mono,monospace);}' +
    '.etiquette-part{font-size:13px;font-weight:700;fill:var(--ink,#241f1a);font-family:var(--mono,monospace);}' +
    '.ligne-limite{stroke:var(--good,#2f7a4f);stroke-width:1.6;stroke-dasharray:5 3;}' +
    '.etiquette-limite{font-size:11.5px;font-weight:700;fill:var(--good,#2f7a4f);font-family:var(--mono,monospace);}' +
    '.point{fill:var(--accent,#a8471f);}' +
    '.point-dernier{fill:var(--accent,#a8471f);stroke:var(--ink,#241f1a);stroke-width:1.5;}' +
    '.connecteur{stroke:var(--accent,#a8471f);stroke-width:1.3;stroke-dasharray:3 3;fill:none;}' +
    '.saut{stroke:var(--accent,#a8471f);stroke-width:1.6;fill:none;}' +
    '.ecart{stroke:var(--good,#2f7a4f);stroke-width:2.5;}' +
    '.hors{fill:var(--bad,#b23a3a);}' +
    '.bilan{background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);padding:10px 14px;margin:0 0 14px;font-size:0.92rem;line-height:1.55;}' +
    '.bilan p{margin:0;}' +
    '.bilan .ok{color:var(--good,#2f7a4f);font-weight:700;}' +
    '.bilan .ko{color:var(--bad,#b23a3a);font-weight:700;}' +
    '.sommes{font-variant-numeric:tabular-nums;overflow-wrap:anywhere;}' +
    '.controles{display:flex;flex-direction:column;gap:8px;}' +
    '.curseur{display:flex;flex-direction:column;gap:2px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;min-height:44px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);min-height:44px;}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:48px;text-align:right;}' +
    '</style>' +
    '<div class="presets">' +
    '<button class="btn" type="button" data-preset="achille">Achille et la tortue</button>' +
    '<button class="btn" type="button" data-preset="neuf">0,999…</button>' +
    '<button class="btn" type="button" data-preset="cours">Exemple du cours</button>' +
    '</div>' +
    '<p class="formule" id="formule"></p>' +
    '<div class="vues">' +
    '<div class="vue"><p class="vue-titre" id="titre-a"></p><svg id="svg-a" xmlns="http://www.w3.org/2000/svg"></svg><p class="message-a" id="message-a" hidden></p></div>' +
    '<div class="vue"><p class="vue-titre">Sommes partielles Sₙ</p><svg id="svg-b" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '</div>' +
    '<div class="bilan" id="bilan" aria-live="polite"></div>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="u1">u₁ — premier terme</label><div class="curseur-row"><input type="range" id="u1" min="0" max="' + (VALEURS_U1.length - 1) + '" step="1"><span class="curseur-valeur" id="u1-valeur"></span></div></div>' +
    '<div class="curseur"><label for="q">q — raison</label><div class="curseur-row"><input type="range" id="q" min="0" max="' + (VALEURS_Q.length - 1) + '" step="1"><span class="curseur-valeur" id="q-valeur"></span></div></div>' +
    '<div class="curseur"><label for="n">n — nombre de termes additionnés</label><div class="curseur-row"><input type="range" id="n" min="1" max="' + N_MAX + '" step="1"><span class="curseur-valeur" id="n-valeur"></span></div></div>' +
    '</div>';

  class SommeInfinieZenonWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._shadow = shadow;
      this._inU1 = shadow.getElementById("u1");
      this._inQ = shadow.getElementById("q");
      this._inN = shadow.getElementById("n");
      this._svgA = shadow.getElementById("svg-a");
      this._svgB = shadow.getElementById("svg-b");
      this._msgA = shadow.getElementById("message-a");
      this._titreA = shadow.getElementById("titre-a");
      this._bilan = shadow.getElementById("bilan");
      this._formule = shadow.getElementById("formule");
      this._appliquerPreset(DEFAUT);
    }

    connectedCallback() {
      var self = this;
      this._onInput = function () {
        self._u1 = VALEURS_U1[parseInt(self._inU1.value, 10)];
        self._q = VALEURS_Q[parseInt(self._inQ.value, 10)];
        self._n = parseInt(self._inN.value, 10);
        self._rendre();
      };
      this._onPreset = function (e) {
        var cle = e.currentTarget.getAttribute("data-preset");
        self._appliquerPreset(PRESETS[cle]);
        self._rendre();
      };
      [this._inU1, this._inQ, this._inN].forEach(function (el) { el.addEventListener("input", self._onInput); });
      this._boutons = Array.prototype.slice.call(this._shadow.querySelectorAll("[data-preset]"));
      this._boutons.forEach(function (b) { b.addEventListener("click", self._onPreset); });
      this._rendre();
    }

    disconnectedCallback() {
      var self = this;
      [this._inU1, this._inQ, this._inN].forEach(function (el) { el.removeEventListener("input", self._onInput); });
      (this._boutons || []).forEach(function (b) { b.removeEventListener("click", self._onPreset); });
    }

    _appliquerPreset(p) {
      var iu = indexProche(VALEURS_U1, p.u1), iq = indexProche(VALEURS_Q, p.q);
      this._u1 = VALEURS_U1[iu]; this._q = VALEURS_Q[iq]; this._n = p.n;
      this._inU1.value = String(iu); this._inQ.value = String(iq); this._inN.value = String(p.n);
    }

    _sommes() {
      var u1 = this._u1, q = this._q, t = [], s = 0, terme = u1;
      for (var k = 1; k <= N_MAX; k++) {
        s += terme;
        // Recalcul par la formule fermée pour limiter l'accumulation d'erreurs d'arrondi.
        var exacte = Math.abs(q - 1) < 1e-12 ? k * u1 : u1 * (1 - Math.pow(q, k)) / (1 - q);
        t.push({ terme: u1 * Math.pow(q, k - 1), somme: exacte });
        terme *= q;
      }
      return t;
    }

    _rendre() {
      var u1 = this._u1, q = this._q, n = this._n;
      var converge = Math.abs(q) < 1 - 1e-12;
      var sInf = converge ? u1 / (1 - q) : null;
      var t = this._sommes();
      this._shadow.getElementById("u1-valeur").textContent = nombreSansApprox(u1);
      this._shadow.getElementById("q-valeur").textContent = qTexte(q);
      this._shadow.getElementById("n-valeur").textContent = String(n);
      this._formule.textContent = "u₁ = " + nombreSansApprox(u1) + " , q = " + qTexte(q) +
        " : " + [0, 1, 2].map(function (i) {
          var v = nombreSansApprox(t[i].terme);
          if (i === 0) return v;
          return v.charAt(0) === "−" ? " − " + v.slice(1) : " + " + v;
        }).join("") + (t[3].terme < 0 ? " − …" : " + …");
      this._rendreVueA(t, sInf);
      this._rendreVueB(t, sInf);
      this._rendreBilan(t, sInf);
    }

    _rendreVueA(t, sInf) {
      var q = this._q, n = this._n, u1 = this._u1;
      var svg = this._svgA;
      svg.innerHTML = "";
      if (q > 0 && q < 1) {
        this._titreA.textContent = "Le carré vaut S∞";
        this._msgA.hidden = true;
        svg.hidden = false;
        var C = 260, P = 20;
        svg.setAttribute("viewBox", "0 0 " + (C + 2 * P) + " " + (C + 2 * P));
        // Région restante (x, y, w, h) ; chaque terme en prend la part 1 − q, en coupant le
        // plus long côté — d'où les rectangles alternés.
        var x = P, y = P, w = C, h = C;
        for (var k = 1; k <= Math.max(n, 1) + 8 && k <= 40; k++) {
          var part = 1 - q;
          var rect;
          if (w >= h) {
            var lw = w * part;
            rect = { x: x, y: y, w: lw, h: h };
            x += lw; w -= lw;
          } else {
            var lh = h * part;
            rect = { x: x, y: y, w: w, h: lh };
            y += lh; h -= lh;
          }
          if (rect.w < 0.4 || rect.h < 0.4) break;
          var dedans = k <= n;
          svg.appendChild(svgEl("rect", { x: rect.x.toFixed(2), y: rect.y.toFixed(2), width: rect.w.toFixed(2), height: rect.h.toFixed(2), class: dedans ? (k % 2 ? "part-1" : "part-2") : "part-vide" }));
          if (dedans && rect.w > 34 && rect.h > 18) {
            texte(svg, rect.x + rect.w / 2, rect.y + rect.h / 2 + 4, "u" + indice(k), "etiquette-part", "middle");
          }
        }
        // Ce qui manque encore : S∞ − Sₙ.
        var xr = P, yr = P, wr = C, hr = C;
        for (var j = 1; j <= n; j++) {
          if (wr >= hr) { var d = wr * (1 - q); xr += d; wr -= d; }
          else { var e = hr * (1 - q); yr += e; hr -= e; }
        }
        if (wr > 0.3 && hr > 0.3) svg.appendChild(svgEl("rect", { x: xr.toFixed(2), y: yr.toFixed(2), width: wr.toFixed(2), height: hr.toFixed(2), class: "reste" }));
        svg.appendChild(svgEl("rect", { x: P, y: P, width: C, height: C, class: "cadre" }));
      } else if (q < 0) {
        this._titreA.textContent = "Sur la droite : des allers-retours";
        this._msgA.hidden = true;
        svg.hidden = false;
        var L = 300, Hh = 150, M = 22;
        svg.setAttribute("viewBox", "0 0 " + L + " " + Hh);
        // Fenêtre fixe relative à u₁ : les sommes restent entre u₁(1 + q) > 0 et u₁.
        var xMax = 1.1 * u1;
        var toX = function (v) { return M + (v / xMax) * (L - 2 * M); };
        var yAxe = Hh - 34;
        svg.appendChild(svgEl("line", { x1: M - 6, x2: L - M + 10, y1: yAxe, y2: yAxe, class: "axe", "marker-end": "url(#fleche-a)" }));
        fleches(svg, "-a");
        [0, u1].forEach(function (g) {
          svg.appendChild(svgEl("line", { x1: toX(g).toFixed(2), x2: toX(g).toFixed(2), y1: yAxe - 4, y2: yAxe + 4, class: "axe" }));
          texte(svg, toX(g), yAxe + 18, g === 0 ? "0" : "u₁ = " + nombreSansApprox(u1), "etiquette-n", g === 0 ? "middle" : "end");
        });
        var xs = toX(sInf);
        svg.appendChild(svgEl("line", { x1: xs.toFixed(2), x2: xs.toFixed(2), y1: 12, y2: yAxe, class: "ligne-limite" }));
        texte(svg, xs, 11, "S∞", "etiquette-limite", "middle");
        var prec = 0;
        var nAff = Math.min(n, 8);
        var pasY = Math.min(11, (yAxe - 26) / nAff);
        for (var i = 0; i < nAff; i++) {
          var s = t[i].somme;
          var yArc = yAxe - 10 - i * pasY;
          var path = "M" + toX(prec).toFixed(2) + " " + yArc.toFixed(2) + " L" + toX(s).toFixed(2) + " " + yArc.toFixed(2);
          svg.appendChild(svgEl("path", { d: path, class: "saut", "marker-end": "url(#pointe-a)" }));
          prec = s;
        }
        svg.appendChild(svgEl("circle", { cx: toX(t[n - 1].somme).toFixed(2), cy: yAxe, r: 4.5, class: "point-dernier" }));
      } else {
        this._titreA.textContent = "Le carré vaut S∞";
        svg.hidden = true;
        this._msgA.hidden = false;
        this._msgA.textContent = Math.abs(q - 1) < 1e-12
          ? "Avec q = 1, on ajoute toujours u₁ : il n’y a pas de S∞ à remplir."
          : "Avec q > 1, les termes grandissent : il n’y a pas de S∞ à remplir.";
      }
    }

    _rendreVueB(t, sInf) {
      var n = this._n, q = this._q;
      var svg = this._svgB;
      svg.innerHTML = "";
      fleches(svg);
      var ref = sInf !== null ? Math.max(sInf, t[0].somme) : t[n - 1].somme;
      var yMax = plafondRond(1.15 * Math.max(ref, t[0].somme));
      var toX = function (k) { return MARGE_G + ((k - 0.5) / (N_MAX + 0.5)) * (LARGEUR - MARGE_G - MARGE_D - 10); };
      var toY = function (v) { return HAUTEUR - MARGE_B - (v / yMax) * (HAUTEUR - MARGE_H - MARGE_B); };
      var bas = toY(0);
      [0.25, 0.5, 0.75, 1].forEach(function (f) {
        var v = f * yMax, y = toY(v);
        svg.appendChild(svgEl("line", { x1: MARGE_G, x2: LARGEUR - MARGE_D, y1: y.toFixed(2), y2: y.toFixed(2), class: "graduation" }));
        texte(svg, MARGE_G - 6, y + 4, nombreSansApprox(v), "etiquette-n", "end");
      });
      texte(svg, MARGE_G - 6, bas + 4, "0", "etiquette-n", "end");
      [1, 5, 10, 15, 20].forEach(function (k) { texte(svg, toX(k), bas + 15, String(k), "etiquette-n", "middle"); });

      if (sInf !== null) {
        var yL = toY(sInf);
        svg.appendChild(svgEl("line", { x1: MARGE_G, x2: LARGEUR - MARGE_D, y1: yL.toFixed(2), y2: yL.toFixed(2), class: "ligne-limite" }));
        texte(svg, LARGEUR - MARGE_D - 4, yL - 6, "S∞" + egalA(sInf), "etiquette-limite", "end");
        var yS = toY(t[n - 1].somme), xE = toX(n) + 9;
        if (Math.abs(yS - yL) > 2) svg.appendChild(svgEl("line", { x1: xE.toFixed(2), x2: xE.toFixed(2), y1: yL.toFixed(2), y2: yS.toFixed(2), class: "ecart" }));
      }

      var d = "";
      for (var k = 1; k <= n; k++) {
        var v = t[k - 1].somme;
        var yv = Math.max(MARGE_H - 4, toY(v));
        d += (k === 1 ? "M" : "L") + toX(k).toFixed(2) + " " + yv.toFixed(2) + " ";
      }
      svg.appendChild(svgEl("path", { d: d.trim(), class: "connecteur" }));
      for (var j = 1; j <= n; j++) {
        var s = t[j - 1].somme;
        if (s > yMax * 1.02) {
          var xh = toX(j);
          svg.appendChild(svgEl("path", { d: "M" + (xh - 4).toFixed(2) + " " + (MARGE_H + 2) + " L" + xh.toFixed(2) + " " + (MARGE_H - 6) + " L" + (xh + 4).toFixed(2) + " " + (MARGE_H + 2) + " Z", class: "hors" }));
          continue;
        }
        svg.appendChild(svgEl("circle", { cx: toX(j).toFixed(2), cy: toY(s).toFixed(2), r: j === n ? 5 : 3.8, class: j === n ? "point-dernier" : "point" }));
      }

      svg.appendChild(svgEl("line", { x1: MARGE_G, x2: LARGEUR - MARGE_D + 8, y1: bas.toFixed(2), y2: bas.toFixed(2), class: "axe", "marker-end": "url(#fleche)" }));
      svg.appendChild(svgEl("line", { x1: MARGE_G, x2: MARGE_G, y1: bas.toFixed(2), y2: MARGE_H - 12, class: "axe", "marker-end": "url(#fleche)" }));
      texte(svg, LARGEUR - MARGE_D + 4, bas - 6, "n", "etiquette", "end");
      texte(svg, MARGE_G + 6, MARGE_H - 8, "Sₙ", "etiquette");
    }

    _rendreBilan(t, sInf) {
      var n = this._n, q = this._q;
      var nListe = Math.min(n, 4);
      var morceaux = [];
      for (var k = 1; k <= nListe; k++) morceaux.push("S" + indice(k) + egalA(t[k - 1].somme));
      if (n > 4) morceaux.push("…", "S" + indice(n) + egalA(t[n - 1].somme));
      var html = '<p class="sommes">' + morceaux.join(" ; ") + "</p>";
      if (sInf !== null) {
        var ecart = sInf - t[n - 1].somme;
        var sN = "S" + indice(n);
        var phrase;
        if (Math.abs(ecart) < 0.00005) phrase = sN + " est à moins de 0,0001 de S∞.";
        else if (ecart > 0) phrase = "il manque encore S∞ − " + sN + egalA(ecart) + ".";
        else phrase = sN + " dépasse S∞ de" + egalA(-ecart).replace(" = ", " ") + ".";
        html += "<p>S∞ = u₁ ÷ (1 − q)" + egalA(sInf).replace(" = ", " = ") + " — " + phrase + "</p>";
        html += '<p class="ok">L’écart est multiplié par q = ' + qTexte(q) + " à chaque terme ajouté" +
          (q < 0 ? " : son signe change, les sommes passent alternativement au-dessus et en dessous de S∞." : " : il fond vers 0, sans jamais s’annuler.") + "</p>";
      } else {
        html += '<p class="ko">La somme infinie n’existe pas : les sommes Sₙ ne se stabilisent pas' +
          (Math.abs(q - 1) < 1e-12 ? " (Sₙ = n × u₁ grandit sans borne)." : ", elles grandissent sans borne.") + "</p>";
      }
      this._bilan.innerHTML = html;
    }
  }

  if (!customElements.get("somme-infinie-zenon-widget")) {
    customElements.define("somme-infinie-zenon-widget", SommeInfinieZenonWidget);
  }
})();
