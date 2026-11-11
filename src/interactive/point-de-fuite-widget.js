(function () {
  "use strict";

  /* ================================================================
   * <point-de-fuite-widget> — atelier interactif (4e, ch. 8, § 11) :
   * construction d'une maison en perspective centrale à un point de
   * fuite. Ligne d'horizon (hauteur réglable), point de fuite F sur
   * l'horizon (déplaçable). La façade avant est frontale (vraie forme :
   * rectangle + pignon). La face arrière est l'image de la façade par
   * l'homothétie de centre F (curseur de profondeur) : ses sommets sont
   * sur les fuyantes. Le pignon arrière se place grâce aux diagonales de
   * la face arrière ; le faîtage est la fuyante issue du sommet du pignon
   * avant. Verticales et horizontales frontales restent parallèles ;
   * seules les fuyantes convergent.
   * Option « milieu en perspective » : les diagonales d'une face latérale
   * (un trapèze) se coupent sur la verticale du vrai milieu de profondeur,
   * comparée au faux milieu (moitié de la longueur dessinée).
   * Option « comparer avec la cavalière » : la même maison en cavalière.
   * Coordonnées en pixels du tableau (y vers le bas). Fenêtre FIXE.
   * ================================================================ */

  var SVGNS = "http://www.w3.org/2000/svg";
  var LARGEUR = 460, HAUTEUR = 330;
  var SOL_Y = 300;
  // façade avant : rectangle 160 × 100 + pignon de 60
  var AV = { g: 60, d: 220, bas: SOL_Y, haut: 200, pignon: 140 };

  function defaut() { return { horizon: 150, fuite: 340, prof: 30, milieu: false, cavaliere: false }; }

  function moins(s) { return String(s).replace(/-/g, "−"); }
  function fmt(x, d) {
    var f = Math.pow(10, d), r = Math.round(x * f) / f;
    if (Object.is(r, -0)) r = 0;
    var s = r.toFixed(d);
    if (d > 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
    return moins(s.replace(".", ","));
  }
  function el(tag, attrs, parent) {
    var e = document.createElementNS(SVGNS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function ligne(parent, a, b, cls) { return el("line", { x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: cls }, parent); }
  function poly(parent, pts, cls) {
    return el("polygon", { points: pts.map(function (p) { return p.x + "," + p.y; }).join(" "), class: cls }, parent);
  }
  function inter(a, b, c, d) {
    var den = (a.x - b.x) * (c.y - d.y) - (a.y - b.y) * (c.x - d.x);
    if (Math.abs(den) < 1e-9) return null;
    var t = ((a.x - c.x) * (c.y - d.y) - (a.y - c.y) * (c.x - d.x)) / den;
    return { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) };
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#182430);}' +
    '*{box-sizing:border-box;}' +
    '.graphe-zone{display:flex;flex-direction:column;align-items:center;gap:8px;margin-bottom:10px;}' +
    'svg{width:100%;max-width:520px;height:auto;background:var(--surface-2,#f7f9fb);border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);}' +
    '.titre-svg{font-size:0.85rem;font-weight:700;color:var(--ink-soft,#51626f);}' +
    '.horizon{stroke:var(--ink-soft,#51626f);stroke-width:1.2;stroke-dasharray:6 4;}' +
    '.sol{stroke:var(--ink-soft,#51626f);stroke-width:1;}' +
    '.fuyante-guide{stroke:var(--accent,#b65c1f);stroke-width:1;stroke-dasharray:3 4;opacity:0.85;}' +
    '.fuyante{stroke:var(--accent,#b65c1f);stroke-width:2.2;}' +
    '.verticale{stroke:var(--good,#2f7a4f);stroke-width:2.4;}' +
    '.frontale{stroke:var(--plan,#5b4ea3);stroke-width:2.4;}' +
    '.toit{stroke:var(--ink,#182430);stroke-width:2.2;}' +
    '.cache{stroke:var(--ink-soft,#51626f);stroke-width:1.4;stroke-dasharray:4 4;}' +
    '.diag{stroke:var(--ink-soft,#51626f);stroke-width:1.1;stroke-dasharray:2 3;}' +
    '.facade{fill:var(--accent-soft,#f6e2d3);fill-opacity:0.55;}' +
    '.cote{fill:var(--plan-soft,#e7e3f5);fill-opacity:0.6;}' +
    '.pf{fill:var(--accent,#b65c1f);}' +
    '.vrai{stroke:var(--good,#2f7a4f);stroke-width:2.4;stroke-dasharray:7 3;}' +
    '.faux{stroke:var(--bad,#b23a3a);stroke-width:2;stroke-dasharray:3 3;}' +
    '.pt{fill:var(--ink,#182430);} .pt-vrai{fill:var(--good,#2f7a4f);} .pt-faux{fill:var(--bad,#b23a3a);}' +
    '.etiq{font-size:13px;font-weight:700;font-family:var(--sans,sans-serif);fill:var(--ink,#182430);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.etiq-a{fill:var(--accent,#b65c1f);} .etiq-g{fill:var(--good,#2f7a4f);} .etiq-b{fill:var(--bad,#b23a3a);} .etiq-s{fill:var(--ink-soft,#51626f);font-weight:600;}' +
    '.lecture{display:flex;flex-direction:column;gap:8px;margin:0 0 12px;font-variant-numeric:tabular-nums;}' +
    '.carte{padding:10px 12px;border-radius:var(--radius,3px);background:var(--surface-2,#f7f9fb);border:1px solid var(--line,#ccd8e0);line-height:1.55;font-size:0.95rem;}' +
    '.carte-titre{font-weight:700;font-size:0.82rem;color:var(--ink-soft,#51626f);margin-bottom:4px;}' +
    '.liste{margin:0;padding-left:1.2em;} .liste li{margin:2px 0;}' +
    '.c-a{color:var(--accent,#b65c1f);font-weight:700;} .c-g{color:var(--good,#2f7a4f);font-weight:700;} .c-p{color:var(--plan,#5b4ea3);font-weight:700;} .c-b{color:var(--bad,#b23a3a);font-weight:700;}' +
    '.controles{display:flex;flex-direction:column;gap:6px;align-items:center;}' +
    '.curseur{display:flex;align-items:center;gap:8px;width:100%;max-width:440px;}' +
    '.curseur label{flex:0 0 auto;width:7.2em;font-size:0.86rem;color:var(--ink-soft,#51626f);font-weight:600;}' +
    '.curseur input{flex:1 1 auto;min-width:0;height:44px;accent-color:var(--accent,#b65c1f);}' +
    '.options{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;}' +
    '.btn{min-height:44px;min-width:44px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);background:var(--surface,#fff);color:var(--ink,#182430);font-weight:600;cursor:pointer;font-family:inherit;font-size:0.95rem;}' +
    '.btn[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);border-color:var(--accent,#b65c1f);color:var(--accent-ink,#7a3212);}' +
    '.btn:focus-visible{outline:2px solid var(--accent,#b65c1f);outline-offset:2px;}' +
    '.btn-reset{background:var(--accent-soft,#f6e2d3);border-color:var(--accent-soft-line,#e8c4a4);color:var(--accent-ink,#7a3212);margin-top:4px;}' +
    '.lecture,.controles{max-width:620px;margin-left:auto;margin-right:auto;}' +
    '[hidden]{display:none!important;}' +
    '</style>' +
    '<div class="graphe-zone">' +
    '<svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" role="img" aria-label="Maison dessinée en perspective centrale à un point de fuite"></svg>' +
    '<div id="zone-cav" hidden><div class="titre-svg">La même maison en perspective cavalière</div>' +
    '<svg id="svg-cav" viewBox="0 0 ' + LARGEUR + ' 240" role="img" aria-label="La même maison en perspective cavalière"></svg></div>' +
    '</div>' +
    '<div class="lecture" id="lecture" aria-live="polite"></div>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="horizon">Ligne d\'horizon</label><input id="horizon" type="range" min="60" max="290" step="5" aria-label="Hauteur de la ligne d\'horizon (vers la droite : plus bas)"></div>' +
    '<div class="curseur"><label for="fuite">Point de fuite</label><input id="fuite" type="range" min="20" max="440" step="5" aria-label="Position du point de fuite sur la ligne d\'horizon"></div>' +
    '<div class="curseur"><label for="prof">Profondeur</label><input id="prof" type="range" min="12" max="60" step="2" aria-label="Profondeur de la maison"></div>' +
    '<div class="options">' +
    '<button class="btn" type="button" id="b-milieu" aria-pressed="false">Milieu en perspective</button>' +
    '<button class="btn" type="button" id="b-cav" aria-pressed="false">Comparer avec la cavalière</button>' +
    '</div>' +
    '<button class="btn btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class PointDeFuiteWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._svg = shadow.getElementById("svg");
      this._svgCav = shadow.getElementById("svg-cav");
      this._lecture = shadow.getElementById("lecture");
      this._e = defaut();
      this._ecouteurs = [];
    }

    connectedCallback() {
      var self = this, sh = this.shadowRoot;
      function ecoute(c, t, f) { c.addEventListener(t, f); self._ecouteurs.push([c, t, f]); }
      ["horizon", "fuite", "prof"].forEach(function (id) {
        ecoute(sh.getElementById(id), "input", function (ev) { self._e[id] = parseFloat(ev.target.value); self._rendre(); });
      });
      ecoute(sh.getElementById("b-milieu"), "click", function () { self._e.milieu = !self._e.milieu; self._rendre(); });
      ecoute(sh.getElementById("b-cav"), "click", function () { self._e.cavaliere = !self._e.cavaliere; self._rendre(); });
      ecoute(sh.getElementById("reset"), "click", function () { self._e = defaut(); self._rendre(); });
      this._rendre();
    }

    disconnectedCallback() {
      this._ecouteurs.forEach(function (x) { x[0].removeEventListener(x[1], x[2]); });
      this._ecouteurs = [];
    }

    _rendre() {
      var sh = this.shadowRoot, e = this._e;
      sh.getElementById("horizon").value = e.horizon;
      sh.getElementById("fuite").value = e.fuite;
      sh.getElementById("prof").value = e.prof;
      sh.getElementById("b-milieu").setAttribute("aria-pressed", e.milieu ? "true" : "false");
      sh.getElementById("b-cav").setAttribute("aria-pressed", e.cavaliere ? "true" : "false");
      sh.getElementById("zone-cav").hidden = !e.cavaliere;
      this._dessiner();
      if (e.cavaliere) this._dessinerCavaliere();
    }

    _dessiner() {
      var e = this._e, svg = this._svg;
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var F = { x: e.fuite, y: e.horizon };
      var f = e.prof / 100; // fraction du chemin vers F
      function arr(p) { return { x: p.x + f * (F.x - p.x), y: p.y + f * (F.y - p.y) }; }
      var A = { x: AV.g, y: AV.bas }, B = { x: AV.d, y: AV.bas }, C = { x: AV.d, y: AV.haut }, D = { x: AV.g, y: AV.haut };
      var S = { x: (AV.g + AV.d) / 2, y: AV.pignon };
      var A2 = arr(A), B2 = arr(B), C2 = arr(C), D2 = arr(D);
      // pignon arrière : par les diagonales de la face arrière, puis sur le faîtage (fuyante S → F)
      var centre2 = inter(A2, C2, B2, D2);
      var S2 = inter({ x: centre2.x, y: 0 }, { x: centre2.x, y: 10 }, S, F) || arr(S);
      var droite = F.x > AV.d, gauche = F.x < AV.g;

      // sol, horizon, point de fuite
      ligne(svg, { x: 0, y: SOL_Y }, { x: LARGEUR, y: SOL_Y }, "sol");
      ligne(svg, { x: 0, y: F.y }, { x: LARGEUR, y: F.y }, "horizon");
      // étiquette de l'horizon du côté opposé au point de fuite : jamais de chevauchement
      var thG = F.x > LARGEUR / 2;
      var th = el("text", { x: thG ? 8 : LARGEUR - 8, y: F.y - 6, class: "etiq etiq-s", "text-anchor": thG ? "start" : "end" }, svg);
      th.textContent = "ligne d'horizon";

      // faces colorées
      if (droite) poly(svg, [B, B2, C2, C], "cote");
      if (gauche) poly(svg, [A, A2, D2, D], "cote");
      poly(svg, [A, B, C, S, D], "facade");

      // guides : fuyantes prolongées jusqu'au point de fuite
      [A, B, C, D, S].forEach(function (p) { ligne(svg, p, F, "fuyante-guide"); });

      // arêtes cachées (face arrière)
      ligne(svg, A2, B2, "cache");
      if (!gauche) ligne(svg, A2, D2, "cache");
      if (!droite) ligne(svg, B2, C2, "cache");
      if (!gauche) ligne(svg, A, A2, "cache");
      if (!droite) ligne(svg, B, B2, "cache");
      // diagonales de la face arrière → verticale du pignon arrière
      ligne(svg, A2, C2, "diag"); ligne(svg, B2, D2, "diag");
      ligne(svg, centre2, S2, "diag");

      // arêtes visibles
      // fuyantes (orange)
      if (droite) { ligne(svg, B, B2, "fuyante"); ligne(svg, C, C2, "fuyante"); }
      if (gauche) { ligne(svg, A, A2, "fuyante"); ligne(svg, D, D2, "fuyante"); }
      if (!droite && !gauche) { ligne(svg, C, C2, "fuyante"); ligne(svg, D, D2, "fuyante"); }
      // arête d'égout du pan opposé : visible seulement si l'œil est au-dessus du faîtage
      var auDessus = F.y < S.y;
      if (droite) ligne(svg, D, D2, auDessus ? "fuyante" : "cache");
      if (gauche) ligne(svg, C, C2, auDessus ? "fuyante" : "cache");
      ligne(svg, S, S2, "fuyante"); // faîtage
      // verticales (vert)
      ligne(svg, A, D, "verticale"); ligne(svg, B, C, "verticale");
      if (droite) ligne(svg, B2, C2, "verticale");
      if (gauche) ligne(svg, A2, D2, "verticale");
      // horizontales frontales (violet)
      ligne(svg, A, B, "frontale"); ligne(svg, D, C, "frontale");
      ligne(svg, D2, C2, "cache"); // base du pignon arrière, cachée par le toit
      // toit
      ligne(svg, D, S, "toit"); ligne(svg, S, C, "toit");
      ligne(svg, S2, droite ? C2 : D2, "toit");

      // milieu en perspective sur la face latérale visible (ou droite par défaut)
      var cote = gauche ? [A, A2, D2, D] : [B, B2, C2, C];
      if (e.milieu) {
        var bas1 = cote[0], bas2 = cote[1], haut2 = cote[2], haut1 = cote[3];
        ligne(svg, bas1, haut2, "diag"); ligne(svg, bas2, haut1, "diag");
        var X = inter(bas1, haut2, bas2, haut1);
        // vraie verticale du milieu : coupe les arêtes basse et haute du trapèze
        var mb = inter({ x: X.x, y: 0 }, { x: X.x, y: 10 }, bas1, bas2);
        var mh = inter({ x: X.x, y: 0 }, { x: X.x, y: 10 }, haut1, haut2);
        ligne(svg, mb, mh, "vrai");
        el("circle", { cx: X.x, cy: X.y, r: 4, class: "pt-vrai" }, svg);
        // faux milieu : moitié de la longueur dessinée de l'arête du bas
        var fm = { x: (bas1.x + bas2.x) / 2, y: (bas1.y + bas2.y) / 2 };
        var fmh = { x: (haut1.x + haut2.x) / 2, y: (haut1.y + haut2.y) / 2 };
        ligne(svg, fm, fmh, "faux");
        el("circle", { cx: fm.x, cy: fm.y, r: 3.6, class: "pt-faux" }, svg);
        this._milieu = { vrai: mb, faux: fm, bas1: bas1, bas2: bas2 };
      } else {
        this._milieu = null;
      }

      el("circle", { cx: F.x, cy: F.y, r: 5, class: "pf" }, svg);
      var tf = el("text", { x: Math.min(Math.max(F.x, 60), LARGEUR - 60), y: F.y - 10, class: "etiq etiq-a", "text-anchor": "middle" }, svg);
      tf.textContent = "point de fuite";
      var ts = el("text", { x: S.x, y: S.y - 8, class: "etiq", "text-anchor": "middle" }, svg); ts.textContent = "S";
      var ts2 = el("text", { x: S2.x, y: S2.y - 8, class: "etiq", "text-anchor": "middle" }, svg); ts2.textContent = "S′";

      this._sommets = { A: A, B: B, C: C, D: D, S: S, A2: A2, B2: B2, C2: C2, D2: D2, S2: S2, F: F };
      this._ecrireLecture();
    }

    _ecrireLecture() {
      var e = this._e, m = this._milieu;
      var html =
        '<div class="carte"><div class="carte-titre">Ce qui reste parallèle, ce qui converge</div>' +
        '<ul class="liste">' +
        '<li>Les <span class="c-g">verticales</span> restent verticales et parallèles entre elles.</li>' +
        '<li>Les <span class="c-p">horizontales de la façade</span> (parallèles à la vitre) restent horizontales et parallèles.</li>' +
        '<li>Seules les <span class="c-a">fuyantes</span> — les droites qui s\'éloignent de toi — convergent vers le point de fuite, sur la ligne d\'horizon.</li>' +
        '</ul></div>' +
        '<div class="carte"><div class="carte-titre">Construction du toit</div>' +
        '<ul class="liste">' +
        '<li>Le faîtage part du sommet S du pignon avant et suit la fuyante vers le point de fuite.</li>' +
        '<li>Les diagonales de la face arrière se coupent en son centre ; la verticale qui passe par ce centre coupe le faîtage au sommet S′ du pignon arrière.</li>' +
        '</ul></div>';
      if (m) {
        var lg = Math.hypot(m.bas2.x - m.bas1.x, m.bas2.y - m.bas1.y);
        var dv = Math.hypot(m.vrai.x - m.bas1.x, m.vrai.y - m.bas1.y);
        var pct = lg > 0 ? dv / lg * 100 : 50;
        html +=
          '<div class="carte"><div class="carte-titre">Le milieu en perspective</div>' +
          'Les diagonales de la face latérale (un trapèze sur le dessin) se coupent sur la verticale du ' +
          '<span class="c-g">vrai milieu</span> de la profondeur. Elle tombe à ' + fmt(pct, 0) + ' % de l\'arête dessinée, ' +
          'en partant de l\'avant — pas à 50 %. La moitié lointaine est dessinée plus courte que la moitié proche : le ' +
          '<span class="c-b">faux milieu</span> (moitié de la longueur dessinée) tombe donc trop près de l\'avant.</div>';
      }
      this._lecture.innerHTML = html;
    }

    _dessinerCavaliere() {
      var svg = this._svgCav, e = this._e;
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      // profondeur réelle choisie proportionnelle au curseur ; fuyantes à 45°, réduites de moitié
      var p = e.prof * 3.2, dx = 0.5 * p * Math.SQRT1_2, dy = -0.5 * p * Math.SQRT1_2;
      var base = 220, g = 120;
      var A = { x: g, y: base }, B = { x: g + 120, y: base }, C = { x: g + 120, y: base - 80 }, D = { x: g, y: base - 80 };
      var S = { x: g + 60, y: base - 130 };
      function arr(q) { return { x: q.x + dx, y: q.y + dy }; }
      var A2 = arr(A), B2 = arr(B), C2 = arr(C), D2 = arr(D), S2 = arr(S);
      poly(svg, [B, B2, C2, C], "cote");
      poly(svg, [A, B, C, S, D], "facade");
      ligne(svg, A2, B2, "cache"); ligne(svg, A, A2, "cache"); ligne(svg, A2, D2, "cache");
      ligne(svg, B, B2, "fuyante"); ligne(svg, C, C2, "fuyante"); ligne(svg, D, D2, "fuyante"); ligne(svg, S, S2, "fuyante");
      ligne(svg, A, D, "verticale"); ligne(svg, B, C, "verticale"); ligne(svg, B2, C2, "verticale");
      ligne(svg, A, B, "frontale"); ligne(svg, D, C, "frontale"); ligne(svg, D2, C2, "frontale");
      ligne(svg, D, S, "toit"); ligne(svg, S, C, "toit"); ligne(svg, S2, C2, "toit");
      var t = el("text", { x: 14, y: 26, class: "etiq etiq-a" }, svg);
      t.textContent = "fuyantes parallèles (45°)";
    }
  }

  if (!customElements.get("point-de-fuite-widget")) {
    customElements.define("point-de-fuite-widget", PointDeFuiteWidget);
  }
})();
