(function () {
  "use strict";

  /* ================================================================
   * <refraction-widget> — atelier interactif (6e, ch. 1, application
   * « Calculer l'angle de réfraction de la lumière »). Loi de
   * Snell-Descartes n₁ sin θ₁ = n₂ sin θ₂ : on isole θ₂ avec arcsin,
   * θ₂ = arcsin(n₁ sin θ₁ / n₂), qui n'existe que si n₁ sin θ₁ / n₂ ≤ 1.
   * Quand le rayon passe dans un milieu MOINS réfringent (n₁ > n₂), il
   * existe un angle limite θ_lim = arcsin(n₂ / n₁) au-delà duquel il n'y a
   * plus de rayon réfracté : réflexion totale. Scène (rayons, normale,
   * angles) et graphique θ₂ en fonction de θ₁ (0° à 90°, fenêtre FIXE).
   * Couleurs : incident orange, réfracté vert, réflexion totale rouge,
   * angle limite violet. Web Component (Shadow DOM).
   * ================================================================ */

  var DEG = Math.PI / 180;
  var MILIEUX = [
    { nom: "air", n: 1 },
    { nom: "eau", n: 1.33 },
    { nom: "verre", n: 1.5 },
    { nom: "diamant", n: 2.42 },
  ];

  var SW = 340, SH = 250, OX = 170, OY = 125, R = 105; // scène
  var GW = 340, GH = 230, GL = 34, GR = 14, GT = 14, GB = 26; // graphique
  var NS = "http://www.w3.org/2000/svg";

  function fmt(n, dec) {
    if (Math.abs(n) < 0.5 * Math.pow(10, -dec)) n = 0;
    var s = n.toFixed(dec);
    if (s.indexOf(".") >= 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
    return s.replace(".", ",").replace("-", "−");
  }
  function nTxt(n) { return n.toFixed(2).replace(".", ","); }
  function svgEl(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }
  function texte(svg, x, y, t, cls, ancre) {
    var e = svgEl("text", { x: x.toFixed(1), y: y.toFixed(1), "text-anchor": ancre || "middle", class: cls });
    e.textContent = t;
    svg.appendChild(e);
    return e;
  }
  function frac(n, d) { return '<span class="frac"><span>' + n + '</span><span>' + d + '</span></span>'; }
  // Arc d'angle autour de O, angles mesurés depuis l'axe des x (sens trigonométrique, en radians).
  function arc(r, t0, t1) {
    var p0 = [OX + r * Math.cos(t0), OY - r * Math.sin(t0)], p1 = [OX + r * Math.cos(t1), OY - r * Math.sin(t1)];
    var grand = Math.abs(t1 - t0) > Math.PI ? 1 : 0, sens = t1 > t0 ? 0 : 1;
    return "M" + p0[0].toFixed(1) + " " + p0[1].toFixed(1) + " A" + r + " " + r + " 0 " + grand + " " + sens + " " + p1[0].toFixed(1) + " " + p1[1].toFixed(1);
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#182430);}' +
    '*{box-sizing:border-box;}' +
    '.choix{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px;}' +
    '.choix div{flex:1 1 140px;display:flex;flex-direction:column;gap:4px;}' +
    '.choix label{font-size:0.8rem;color:var(--ink-soft,#51626f);}' +
    'select{min-height:44px;font:inherit;font-size:0.95rem;padding:6px 10px;border:1px solid var(--line,#ccd8e0);border-radius:var(--radius,3px);background:var(--surface,#fff);color:var(--ink,#182430);}' +
    '.figures{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;}' +
    'svg{width:100%;max-width:340px;height:auto;background:var(--surface-2,#f7f9fb);border-radius:var(--radius,3px);display:block;flex:1 1 300px;}' +
    '.milieu2{fill:var(--sky,#2f6fb0);opacity:0.1;}' +
    '.interface{stroke:var(--ink-soft,#51626f);stroke-width:1.6;}' +
    '.normale{stroke:var(--ink-faint,#8a97a1);stroke-width:1.2;stroke-dasharray:5 4;}' +
    '.incident{stroke:var(--accent,#b65c1f);stroke-width:2.8;}' +
    '.refracte{stroke:var(--good,#2f7a4f);stroke-width:2.8;}' +
    '.reflechi{stroke:var(--ink-faint,#8a97a1);stroke-width:1.4;stroke-dasharray:3 3;}' +
    '.reflechi-total{stroke:var(--bad,#b23a3a);stroke-width:2.8;}' +
    '.limite{stroke:var(--plan,#5b4ea3);stroke-width:1.6;stroke-dasharray:6 4;}' +
    '.fleche-i{fill:var(--accent,#b65c1f);}' +
    '.fleche-r{fill:var(--good,#2f7a4f);}' +
    '.fleche-t{fill:var(--bad,#b23a3a);}' +
    '.fleche{fill:var(--ink-soft,#51626f);}' +
    '.a-i{stroke:var(--accent,#b65c1f);stroke-width:1.6;fill:none;}' +
    '.a-r{stroke:var(--good,#2f7a4f);stroke-width:1.6;fill:none;}' +
    '.etq{font-size:11px;font-weight:600;fill:var(--ink-soft,#51626f);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3px;}' +
    '.etq-i{font-size:12px;font-weight:700;fill:var(--accent-ink,#7a3c11);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3px;}' +
    '.etq-r{font-size:12px;font-weight:700;fill:var(--good,#2f7a4f);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3px;}' +
    '.etq-t{font-size:11px;font-weight:700;fill:var(--bad,#b23a3a);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3px;}' +
    '.etq-l{font-size:10.5px;font-weight:600;fill:var(--plan-ink,#443a80);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3px;}' +
    '.axe{stroke:var(--ink-soft,#51626f);stroke-width:1.3;}' +
    '.grille{stroke:var(--line-soft,#dfe7ec);stroke-width:1;}' +
    '.tick{stroke:var(--ink-soft,#51626f);stroke-width:1;}' +
    '.tick-label{font-size:10px;font-family:var(--sans,sans-serif);fill:var(--ink-soft,#51626f);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3px;}' +
    '.zone-totale{fill:var(--bad,#b23a3a);opacity:0.09;}' +
    '.identite{stroke:var(--ink-faint,#8a97a1);stroke-width:1.2;stroke-dasharray:5 4;}' +
    '.courbe{stroke:var(--good,#2f7a4f);stroke-width:2.6;fill:none;}' +
    '.pt-ok{fill:var(--good,#2f7a4f);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.pt-ko{fill:var(--bad,#b23a3a);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.fm{font-family:var(--serif,Georgia,serif);white-space:nowrap;}' +
    '.fm i{margin-right:0.06em;}' +
    '.frac{display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;line-height:1.15;font-size:0.88em;}' +
    '.frac>span:first-child{border-bottom:1px solid currentColor;padding:0 3px 1px;}' +
    '.frac>span:last-child{padding:1px 3px 0;}' +
    'sub{font-size:0.7em;}' +
    '.legende{font-size:0.82rem;color:var(--ink-soft,#51626f);text-align:center;line-height:1.5;margin-top:4px;}' +
    '.leg-i{color:var(--accent-ink,#7a3c11);font-weight:700;}' +
    '.leg-r{color:var(--good,#2f7a4f);font-weight:700;}' +
    '.leg-t{color:var(--bad,#b23a3a);font-weight:700;}' +
    '.leg-l{color:var(--plan-ink,#443a80);font-weight:700;}' +
    '.curseur{display:flex;flex-direction:column;gap:4px;margin-top:10px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3c11);text-align:center;}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;min-height:44px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#b65c1f);min-height:44px;}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#51626f);min-width:64px;text-align:right;}' +
    'select:focus-visible,input:focus-visible{outline:2px solid var(--accent,#b65c1f);outline-offset:2px;}' +
    '.lecture{margin-top:10px;border:1px solid var(--line,#ccd8e0);border-radius:var(--radius,3px);background:var(--surface,#fff);padding:10px 12px;font-size:0.93rem;line-height:1.8;}' +
    '.lecture p{margin:0 0 4px;}' +
    '.ok{color:var(--good,#2f7a4f);font-weight:700;}' +
    '.ko{color:var(--bad,#b23a3a);font-weight:700;}' +
    '.lim{color:var(--plan-ink,#443a80);font-weight:700;}' +
    '</style>' +
    '<div class="choix"><div><label for="m1">Milieu 1 (rayon incident, en haut)</label><select id="m1"></select></div>' +
    '<div><label for="m2">Milieu 2 (en bas)</label><select id="m2"></select></div></div>' +
    '<div>' +
    '<div class="figures">' +
    '<svg id="scene" viewBox="0 0 ' + SW + ' ' + SH + '" role="img" aria-label="Rayon lumineux à la surface entre deux milieux"></svg>' +
    '<svg id="graphe" viewBox="0 0 ' + GW + ' ' + GH + '" role="img" aria-label="Angle réfracté en fonction de l’angle d’incidence"></svg>' +
    '</div>' +
    '<div class="legende"><span class="leg-i">orange : incident</span> · <span class="leg-r">vert : réfracté</span> · <span class="leg-t">rouge : réflexion totale</span> · <span class="leg-l">violet : angle limite</span></div>' +
    '</div>' +
    '<div class="curseur"><label for="t1">θ₁ — angle d’incidence, mesuré depuis la normale</label><div class="curseur-row">' +
    '<input type="range" id="t1" min="0" max="178" step="1" value="80"><span class="curseur-valeur" id="t1-valeur"></span></div></div>' +
    '<div class="lecture" aria-live="polite" id="lecture"></div>';

  class RefractionWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._s = shadow;
      ["m1", "m2"].forEach(function (id, j) {
        var sel = shadow.getElementById(id);
        MILIEUX.forEach(function (m, i) {
          var o = document.createElement("option");
          o.value = String(i);
          o.textContent = m.nom + " (n = " + nTxt(m.n) + ")";
          sel.appendChild(o);
        });
        sel.value = j === 0 ? "0" : "1";
      });
    }

    connectedCallback() {
      var self = this;
      this._onChange = function () { self._rendre(); };
      ["m1", "m2", "t1"].forEach(function (id) {
        self._s.getElementById(id).addEventListener(id === "t1" ? "input" : "change", self._onChange);
      });
      this._rendre();
    }

    disconnectedCallback() {
      var self = this;
      ["m1", "m2", "t1"].forEach(function (id) {
        self._s.getElementById(id).removeEventListener(id === "t1" ? "input" : "change", self._onChange);
      });
    }

    _scene(m1, m2, t1, s, lim) {
      var svg = this._s.getElementById("scene");
      svg.innerHTML = "";
      var defs = svgEl("defs", {});
      [["fi", "fleche-i"], ["fr", "fleche-r"], ["ft", "fleche-t"]].forEach(function (d) {
        var m = svgEl("marker", { id: d[0], markerWidth: "9", markerHeight: "9", refX: "4", refY: "4.5", orient: "auto" });
        m.appendChild(svgEl("path", { d: "M0,0 L9,4.5 L0,9 Z", class: d[1] }));
        defs.appendChild(m);
      });
      svg.appendChild(defs);
      svg.appendChild(svgEl("rect", { x: 0, y: OY, width: SW, height: SH - OY, class: "milieu2" }));
      svg.appendChild(svgEl("line", { x1: 0, x2: SW, y1: OY, y2: OY, class: "interface" }));
      svg.appendChild(svgEl("line", { x1: OX, x2: OX, y1: 8, y2: SH - 8, class: "normale" }));
      texte(svg, 8, 18, m1.nom + " (n₁ = " + nTxt(m1.n) + ")", "etq", "start");
      texte(svg, 8, SH - 10, m2.nom + " (n₂ = " + nTxt(m2.n) + ")", "etq", "start");
      texte(svg, OX + 6, 18, "normale", "etq", "start");
      // Angle limite (côté incident), si le milieu 2 est moins réfringent.
      if (lim !== null) {
        var al = Math.PI / 2 + lim;
        svg.appendChild(svgEl("line", { x1: OX, y1: OY, x2: (OX + R * Math.cos(al)).toFixed(1), y2: (OY - R * Math.sin(al)).toFixed(1), class: "limite" }));
        texte(svg, OX + (R + 4) * Math.cos(al) - 2, OY - (R + 4) * Math.sin(al) - 4, "angle limite", "etq-l", "end");
      }
      // Rayon incident : arrive d'en haut à gauche vers O (angle θ₁ avec la normale).
      var ai = Math.PI / 2 + t1; // direction du point de départ, depuis O
      var A = [OX + R * Math.cos(ai), OY - R * Math.sin(ai)];
      var mi = [(A[0] + OX) / 2, (A[1] + OY) / 2];
      svg.appendChild(svgEl("line", { x1: A[0].toFixed(1), y1: A[1].toFixed(1), x2: OX, y2: OY, class: "incident" }));
      svg.appendChild(svgEl("line", { x1: A[0].toFixed(1), y1: A[1].toFixed(1), x2: mi[0].toFixed(1), y2: mi[1].toFixed(1), class: "incident", "marker-end": "url(#fi)" }));
      if (t1 > 0.5 * DEG) svg.appendChild(svgEl("path", { d: arc(34, Math.PI / 2, ai), class: "a-i" }));
      var li = Math.PI / 2 + t1 / 2;
      texte(svg, OX + 48 * Math.cos(li), OY - 48 * Math.sin(li) + 4, "θ₁", "etq-i");
      // Rayon réfléchi (en haut à droite) : faible, ou total.
      var ar = Math.PI / 2 - t1;
      var B = [OX + R * Math.cos(ar), OY - R * Math.sin(ar)];
      var totale = s > 1 + 1e-12;
      svg.appendChild(svgEl("line", { x1: OX, y1: OY, x2: B[0].toFixed(1), y2: B[1].toFixed(1), class: totale ? "reflechi-total" : "reflechi", "marker-end": totale ? "url(#ft)" : "" }));
      if (totale) texte(svg, B[0] + 4, B[1] - 6, "réflexion totale", "etq-t", B[0] > SW - 100 ? "end" : "start");
      // Rayon réfracté (en bas à droite), angle θ₂ avec la normale.
      if (!totale) {
        var t2 = Math.asin(Math.min(1, s));
        var at = -Math.PI / 2 + t2;
        var C = [OX + R * Math.cos(at), OY - R * Math.sin(at)];
        var mc = [OX + 0.62 * (C[0] - OX), OY + 0.62 * (C[1] - OY)];
        svg.appendChild(svgEl("line", { x1: OX, y1: OY, x2: C[0].toFixed(1), y2: C[1].toFixed(1), class: "refracte" }));
        svg.appendChild(svgEl("line", { x1: OX, y1: OY, x2: mc[0].toFixed(1), y2: mc[1].toFixed(1), class: "refracte", "marker-end": "url(#fr)" }));
        if (t2 > 0.5 * DEG) svg.appendChild(svgEl("path", { d: arc(30, -Math.PI / 2, at), class: "a-r" }));
        var lr = -Math.PI / 2 + t2 / 2;
        texte(svg, OX + 44 * Math.cos(lr) + 3, OY - 44 * Math.sin(lr) + 4, "θ₂", "etq-r");
      }
    }

    _px(x, y) { return [GL + x / 90 * (GW - GL - GR), GH - GB - y / 90 * (GH - GT - GB)]; }

    _graphe(m1, m2, t1d, s, limd) {
      var self = this, svg = this._s.getElementById("graphe");
      svg.innerHTML = "";
      var defs = svgEl("defs", {});
      var m = svgEl("marker", { id: "fg", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      m.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(m);
      svg.appendChild(defs);
      var o = this._px(0, 0), coin = this._px(90, 90);
      if (limd !== null) {
        var pl = this._px(limd, 0);
        svg.appendChild(svgEl("rect", { x: pl[0].toFixed(1), y: coin[1].toFixed(1), width: (coin[0] - pl[0]).toFixed(1), height: (o[1] - coin[1]).toFixed(1), class: "zone-totale" }));
      }
      [30, 60, 90].forEach(function (t) {
        var p = self._px(t, t);
        svg.appendChild(svgEl("line", { x1: GL, x2: coin[0].toFixed(1), y1: p[1].toFixed(1), y2: p[1].toFixed(1), class: "grille" }));
        svg.appendChild(svgEl("line", { x1: p[0].toFixed(1), x2: p[0].toFixed(1), y1: coin[1].toFixed(1), y2: o[1].toFixed(1), class: "grille" }));
      });
      svg.appendChild(svgEl("line", { x1: o[0].toFixed(1), y1: o[1].toFixed(1), x2: coin[0].toFixed(1), y2: coin[1].toFixed(1), class: "identite" }));
      svg.appendChild(svgEl("line", { x1: o[0].toFixed(1), x2: GW - 4, y1: o[1].toFixed(1), y2: o[1].toFixed(1), class: "axe", "marker-end": "url(#fg)" }));
      svg.appendChild(svgEl("line", { x1: o[0].toFixed(1), x2: o[0].toFixed(1), y1: o[1].toFixed(1), y2: 4, class: "axe", "marker-end": "url(#fg)" }));
      var r = m1.n / m2.n, d = "", fin = limd !== null ? limd : 90;
      for (var i = 0; i <= 300; i++) {
        var a = fin * i / 300, v = Math.asin(Math.min(1, r * Math.sin(a * DEG))) / DEG, p = this._px(a, v);
        d += (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1) + " ";
      }
      svg.appendChild(svgEl("path", { d: d.trim(), class: "courbe" }));
      if (limd !== null) {
        var pl2 = this._px(limd, 0), ph = this._px(limd, 90);
        svg.appendChild(svgEl("line", { x1: pl2[0].toFixed(1), x2: pl2[0].toFixed(1), y1: pl2[1].toFixed(1), y2: ph[1].toFixed(1), class: "limite" }));
        var place = pl2[0] < GW - 110;
        texte(svg, pl2[0] + (place ? 5 : -5), ph[1] + 22, "réflexion totale", "etq-t", place ? "start" : "end");
      }
      var pc = s <= 1 + 1e-12 ? this._px(t1d, Math.asin(Math.min(1, s)) / DEG) : this._px(t1d, 0);
      svg.appendChild(svgEl("circle", { cx: pc[0].toFixed(1), cy: pc[1].toFixed(1), r: 5.5, class: s <= 1 + 1e-12 ? "pt-ok" : "pt-ko" }));
      [30, 60, 90].forEach(function (t) {
        var p = self._px(t, t);
        svg.appendChild(svgEl("line", { x1: p[0].toFixed(1), x2: p[0].toFixed(1), y1: (o[1] - 3).toFixed(1), y2: (o[1] + 3).toFixed(1), class: "tick" }));
        texte(svg, p[0], o[1] + 14, t + "°", "tick-label");
        svg.appendChild(svgEl("line", { x1: (o[0] - 3).toFixed(1), x2: (o[0] + 3).toFixed(1), y1: p[1].toFixed(1), y2: p[1].toFixed(1), class: "tick" }));
        texte(svg, o[0] - 5, p[1] + 3.5, t + "°", "tick-label", "end");
      });
      texte(svg, o[0] - 5, o[1] + 4, "0", "tick-label", "end");
      texte(svg, GW - 6, o[1] - 7, "θ₁", "tick-label", "end");
      texte(svg, o[0] + 8, 13, "θ₂", "tick-label", "start");
    }

    _rendre() {
      var m1 = MILIEUX[parseInt(this._s.getElementById("m1").value, 10)];
      var m2 = MILIEUX[parseInt(this._s.getElementById("m2").value, 10)];
      var t1d = parseInt(this._s.getElementById("t1").value, 10) / 2;
      var t1 = t1d * DEG;
      var s = m1.n * Math.sin(t1) / m2.n;
      var lim = m1.n > m2.n ? Math.asin(m2.n / m1.n) : null;
      var limd = lim === null ? null : lim / DEG;
      this._scene(m1, m2, t1, s, lim);
      this._graphe(m1, m2, t1d, s, limd);
      this._s.getElementById("t1-valeur").textContent = "θ₁ = " + fmt(t1d, 1) + "°";
      var N1 = "<i>n</i><sub>1</sub>", N2 = "<i>n</i><sub>2</sub>", T1 = "<i>θ</i><sub>1</sub>", T2 = "<i>θ</i><sub>2</sub>";
      var h = '<p><span class="fm">' + N1 + " sin " + T1 + " = " + N2 + " sin " + T2 + "</span> donne " +
        '<span class="fm">sin ' + T2 + " = " + frac(N1 + " sin " + T1, N2) + " = " + frac(nTxt(m1.n) + " × sin " + fmt(t1d, 1) + "°", nTxt(m2.n)) + "</span> " + (Math.abs(s - Math.round(s * 1e4) / 1e4) < 1e-12 ? "= " : "≈ ") + fmt(s, 4) + ".</p>";
      if (s <= 1 + 1e-12) {
        var t2d = Math.asin(Math.min(1, s)) / DEG;
        h += '<p><span class="ok">' + fmt(s, 4) + " ≤ 1</span> : <span class=\"fm\">" + T2 + " = arcsin(" + fmt(s, 4) + ")</span> " + (t1d === 0 ? "= " : "≈ ") + fmt(t2d, 2) + "°. " +
          (t1d === 0 ? "Incidence normale : le rayon traverse sans être dévié." : m1.n === m2.n ? "Même milieu : le rayon n’est pas dévié." : m1.n < m2.n ? "Le rayon se rapproche de la normale (θ₂ < θ₁)." : "Le rayon s’écarte de la normale (θ₂ > θ₁).") + "</p>";
      } else {
        h += '<p><span class="ko">' + fmt(s, 4) + " > 1 : arcsin(" + fmt(s, 4) + ") n’existe pas</span>. Aucun angle n’a un sinus plus grand que 1 : il n’y a pas de rayon réfracté, toute la lumière est réfléchie (réflexion totale).</p>";
      }
      if (lim !== null) {
        h += '<p><span class="lim">Angle limite</span> : <span class="fm">' + T1 + " = arcsin " + frac(N2, N1) + " = arcsin " + frac(nTxt(m2.n), nTxt(m1.n)) + "</span> ≈ " + fmt(limd, 2) +
          "°. Au-delà, réflexion totale.</p>";
      } else {
        h += "<p>Ici " + (m1.n === m2.n ? "n₁ = n₂" : "n₁ < n₂") + " : <span class=\"fm\">" + frac(N1, N2) + " sin " + T1 + " ≤ 1</span> pour tout angle, il n’y a pas d’angle limite.</p>";
      }
      this._s.getElementById("lecture").innerHTML = h;
    }
  }

  if (!customElements.get("refraction-widget")) customElements.define("refraction-widget", RefractionWidget);
})();
