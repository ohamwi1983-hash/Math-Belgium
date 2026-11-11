(function () {
  "use strict";

  /* ================================================================
   * <ombre-soleil-lampe-widget> — atelier interactif (4e, ch. 8, § 12) :
   * un sol horizontal dessiné en perspective cavalière, trois piquets
   * verticaux de hauteurs différentes.
   * Mode « Soleil » : rayons parallèles (azimut et hauteur réglables) →
   * ombres parallèles entre elles, longueur proportionnelle à la hauteur
   * (L = h / tan α). La méthode de la trace au sol est dessinée pour le
   * piquet 2 : trace depuis le pied, parallèle à l'ombre du piquet 1
   * (exemple), puis rayon depuis le sommet, parallèle au rayon du piquet 1.
   * Mode « Lampe » : rayons issus d'un point (projection centrale) →
   * ombres concourantes au pied de la lampe ; lampe plus basse qu'un
   * sommet → ombre au sol illimitée.
   * Monde : X à droite, Y en profondeur, Z vers le haut ; projection
   * cavalière (profondeur à 45°, réduite de moitié). Fenêtre FIXE.
   * ================================================================ */

  var SVGNS = "http://www.w3.org/2000/svg";
  var LARGEUR = 440, HAUTEUR = 330;
  var ECH = 30, OX = 22, OY = 318, K = 0.5, C45 = Math.SQRT1_2;
  var SOL = { xMax: 10, yMax: 9 };
  var PIQUETS = [
    { x: 2, y: 2, h: 2, nom: "1" },
    { x: 5, y: 4.5, h: 3, nom: "2" },
    { x: 7.5, y: 1.5, h: 1.5, nom: "3" },
  ];

  function defaut() { return { mode: "soleil", az: 20, alt: 35, lx: 5, ly: 7, lz: 5 }; }

  function proj(X, Y, Z) {
    return { x: OX + ECH * (X + K * Y * C45), y: OY - ECH * (Z + K * Y * C45) };
  }
  function moins(s) { return String(s).replace(/-/g, "−"); }
  function fmt(x, d) {
    var f = Math.pow(10, d), r = Math.round(x * f) / f;
    if (Object.is(r, -0)) r = 0;
    var s = r.toFixed(d);
    if (d > 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
    return moins(s.replace(".", ","));
  }
  function approx(x, d) {
    var f = Math.pow(10, d);
    return Math.abs(Math.round(x * f) / f - x) < 1e-9 ? "= " + fmt(x, d) : "≈ " + fmt(x, d);
  }

  function el(tag, attrs, parent) {
    var e = document.createElementNS(SVGNS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  // segment découpé au cadre du dessin (Liang-Barsky) : rien ne dépasse jamais de la figure
  function couper(a, b) {
    var t0 = 0, t1 = 1, dx = b.x - a.x, dy = b.y - a.y;
    var p = [-dx, dx, -dy, dy], q = [a.x - 1, LARGEUR - 1 - a.x, a.y - 1, HAUTEUR - 1 - a.y];
    for (var i = 0; i < 4; i++) {
      if (p[i] === 0) { if (q[i] < 0) return null; continue; }
      var r = q[i] / p[i];
      if (p[i] < 0) { if (r > t1) return null; if (r > t0) t0 = r; }
      else { if (r < t0) return null; if (r < t1) t1 = r; }
    }
    return [{ x: a.x + t0 * dx, y: a.y + t0 * dy }, { x: a.x + t1 * dx, y: a.y + t1 * dy }];
  }
  function ligne(parent, a, b, cls) {
    var c = couper(a, b);
    if (!c) return null;
    return el("line", { x1: c[0].x, y1: c[0].y, x2: c[1].x, y2: c[1].y, class: cls }, parent);
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#182430);}' +
    '*{box-sizing:border-box;}' +
    '.modes{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:0 0 12px;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:10px;}' +
    'svg{width:100%;max-width:520px;height:auto;background:var(--surface-2,#f7f9fb);border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);}' +
    '.sol{fill:var(--good-soft,#e2efe6);fill-opacity:0.55;stroke:var(--ink-soft,#51626f);stroke-width:1.2;}' +
    '.quad{stroke:var(--line,#ccd8e0);stroke-width:0.6;}' +
    '.piquet{stroke:var(--ink,#182430);stroke-width:3.4;stroke-linecap:round;}' +
    '.ombre{stroke:var(--ink-soft,#51626f);stroke-width:5;stroke-linecap:round;opacity:0.75;}' +
    '.rayon{stroke:var(--attn,#c98a12);stroke-width:1.6;}' +
    '.rayon-lampe{stroke:var(--attn,#c98a12);stroke-width:1.4;stroke-dasharray:5 4;}' +
    '.trace{stroke:var(--plan,#5b4ea3);stroke-width:1.8;stroke-dasharray:6 4;}' +
    '.trace-rayon{stroke:var(--plan,#5b4ea3);stroke-width:1.8;}' +
    '.prolong{stroke:var(--bad,#b23a3a);stroke-width:1.2;stroke-dasharray:3 4;}' +
    '.fleche{fill:var(--attn,#c98a12);}' +
    '.fleche-plan{fill:var(--plan,#5b4ea3);}' +
    '.pied{fill:var(--ink,#182430);}' +
    '.bout{fill:var(--plan,#5b4ea3);}' +
    '.lampe{fill:var(--attn,#c98a12);stroke:var(--ink,#182430);stroke-width:1.2;}' +
    '.mat{stroke:var(--ink-soft,#51626f);stroke-width:1.4;stroke-dasharray:2 3;}' +
    '.pied-lampe{fill:var(--bad,#b23a3a);}' +
    '.etiq{font-size:13px;font-weight:700;font-family:var(--sans,sans-serif);fill:var(--ink,#182430);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.etiq-plan{fill:var(--plan,#5b4ea3);} .etiq-attn{fill:var(--attn,#c98a12);} .etiq-bad{fill:var(--bad,#b23a3a);}' +
    '.lecture{display:flex;flex-direction:column;gap:8px;margin:0 0 12px;font-variant-numeric:tabular-nums;}' +
    '.carte{padding:10px 12px;border-radius:var(--radius,3px);background:var(--surface-2,#f7f9fb);border:1px solid var(--line,#ccd8e0);line-height:1.55;font-size:0.95rem;}' +
    '.carte-titre{font-weight:700;font-size:0.82rem;color:var(--ink-soft,#51626f);margin-bottom:4px;}' +
    '.liste{margin:0;padding-left:1.2em;} .liste li{margin:2px 0;}' +
    '.resultat{font-weight:700;color:var(--good,#2f7a4f);}' +
    '.alerte{color:var(--bad,#b23a3a);font-weight:600;}' +
    '.note{font-size:0.86rem;color:var(--ink-soft,#51626f);}' +
    '.controles{display:flex;flex-direction:column;gap:6px;align-items:center;}' +
    '.curseur{display:flex;align-items:center;gap:8px;width:100%;max-width:440px;}' +
    '.curseur label{flex:0 0 auto;width:7.2em;font-size:0.86rem;color:var(--ink-soft,#51626f);font-weight:600;}' +
    '.curseur input{flex:1 1 auto;min-width:0;height:44px;accent-color:var(--accent,#b65c1f);}' +
    '.curseur output{flex:0 0 auto;width:3.4em;text-align:right;font-variant-numeric:tabular-nums;font-size:0.9rem;}' +
    '.btn{min-height:44px;min-width:44px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);background:var(--surface,#fff);color:var(--ink,#182430);font-weight:600;cursor:pointer;font-family:inherit;font-size:0.95rem;}' +
    '.btn[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);border-color:var(--accent,#b65c1f);color:var(--accent-ink,#7a3212);}' +
    '.btn:focus-visible{outline:2px solid var(--accent,#b65c1f);outline-offset:2px;}' +
    '.btn-reset{background:var(--accent-soft,#f6e2d3);border-color:var(--accent-soft-line,#e8c4a4);color:var(--accent-ink,#7a3212);margin-top:4px;}' +
    '.lecture,.controles{max-width:620px;margin-left:auto;margin-right:auto;}' +
    '[hidden]{display:none!important;}' +
    '</style>' +
    '<div class="modes" role="group" aria-label="Source de lumière">' +
    '<button class="btn" type="button" data-mode="soleil" aria-pressed="true">Soleil</button>' +
    '<button class="btn" type="button" data-mode="lampe" aria-pressed="false">Lampe</button>' +
    '</div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" role="img" aria-label="Trois piquets verticaux sur un sol horizontal en perspective cavalière, avec leurs ombres"></svg></div>' +
    '<div class="lecture" id="lecture" aria-live="polite"></div>' +
    '<div class="controles">' +
    '<div id="ctl-soleil">' +
    '<div class="curseur"><label for="az">Direction</label><input id="az" type="range" min="0" max="350" step="10"><output id="az-v"></output></div>' +
    '<div class="curseur"><label for="alt">Hauteur du soleil</label><input id="alt" type="range" min="25" max="75" step="5"><output id="alt-v"></output></div>' +
    '</div>' +
    '<div id="ctl-lampe" hidden>' +
    '<div class="curseur"><label for="lx">Lampe : gauche – droite</label><input id="lx" type="range" min="0" max="10" step="0.5"><output id="lx-v"></output></div>' +
    '<div class="curseur"><label for="ly">Lampe : avant – arrière</label><input id="ly" type="range" min="0" max="9" step="0.5"><output id="ly-v"></output></div>' +
    '<div class="curseur"><label for="lz">Hauteur de la lampe</label><input id="lz" type="range" min="1" max="7" step="0.5"><output id="lz-v"></output></div>' +
    '</div>' +
    '<button class="btn btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class OmbreSoleilLampeWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._svg = shadow.getElementById("svg");
      this._lecture = shadow.getElementById("lecture");
      this._e = defaut();
      this._ecouteurs = [];
    }

    connectedCallback() {
      var self = this, sh = this.shadowRoot;
      function ecoute(c, t, f) { c.addEventListener(t, f); self._ecouteurs.push([c, t, f]); }
      Array.prototype.forEach.call(sh.querySelectorAll("[data-mode]"), function (b) {
        ecoute(b, "click", function () { self._e.mode = b.getAttribute("data-mode"); self._rendre(); });
      });
      ["az", "alt", "lx", "ly", "lz"].forEach(function (id) {
        ecoute(sh.getElementById(id), "input", function (ev) { self._e[id] = parseFloat(ev.target.value); self._rendre(); });
      });
      ecoute(sh.getElementById("reset"), "click", function () {
        var m = self._e.mode; self._e = defaut(); self._e.mode = m; self._rendre();
      });
      this._rendre();
    }

    disconnectedCallback() {
      this._ecouteurs.forEach(function (x) { x[0].removeEventListener(x[1], x[2]); });
      this._ecouteurs = [];
    }

    _syncControles() {
      var sh = this.shadowRoot, e = this._e;
      ["az", "alt", "lx", "ly", "lz"].forEach(function (id) { sh.getElementById(id).value = e[id]; });
      sh.getElementById("az-v").textContent = e.az + "°";
      sh.getElementById("alt-v").textContent = e.alt + "°";
      sh.getElementById("lx-v").textContent = fmt(e.lx, 1);
      sh.getElementById("ly-v").textContent = fmt(e.ly, 1);
      sh.getElementById("lz-v").textContent = fmt(e.lz, 1) + " m";
      sh.getElementById("ctl-soleil").hidden = e.mode !== "soleil";
      sh.getElementById("ctl-lampe").hidden = e.mode !== "lampe";
      Array.prototype.forEach.call(sh.querySelectorAll("[data-mode]"), function (b) {
        b.setAttribute("aria-pressed", b.getAttribute("data-mode") === e.mode ? "true" : "false");
      });
    }

    _fleche(a, b, cls) {
      var dx = b.x - a.x, dy = b.y - a.y, n = Math.hypot(dx, dy) || 1, ux = dx / n, uy = dy / n;
      var t = 8, w = 4;
      var p = [b.x, b.y, b.x - t * ux + w * uy, b.y - t * uy - w * ux, b.x - t * ux - w * uy, b.y - t * uy + w * ux];
      el("polygon", { points: p.join(" "), class: cls }, this._svg);
    }

    _sol() {
      var svg = this._svg;
      var c = [proj(0, 0, 0), proj(SOL.xMax, 0, 0), proj(SOL.xMax, SOL.yMax, 0), proj(0, SOL.yMax, 0)];
      el("polygon", { points: c.map(function (p) { return p.x + "," + p.y; }).join(" "), class: "sol" }, svg);
      for (var i = 1; i < SOL.xMax; i++) ligne(svg, proj(i, 0, 0), proj(i, SOL.yMax, 0), "quad");
      for (var j = 1; j < SOL.yMax; j++) ligne(svg, proj(0, j, 0), proj(SOL.xMax, j, 0), "quad");
    }

    _rendre() {
      this._syncControles();
      var svg = this._svg;
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      this._sol();
      if (this._e.mode === "soleil") this._rendreSoleil(); else this._rendreLampe();
    }

    _piquets(parent) {
      var svg = this._svg;
      PIQUETS.forEach(function (p) {
        var a = proj(p.x, p.y, 0), b = proj(p.x, p.y, p.h);
        ligne(svg, a, b, "piquet");
        el("circle", { cx: a.x, cy: a.y, r: 3, class: "pied" }, svg);
        var t = el("text", { x: b.x - 6, y: b.y - 8, class: "etiq", "text-anchor": "middle" }, svg);
        t.textContent = p.nom;
      });
    }

    _rendreSoleil() {
      var e = this._e, svg = this._svg;
      var az = e.az * Math.PI / 180, alt = e.alt * Math.PI / 180;
      var dx = Math.cos(az), dy = Math.sin(az), cot = 1 / Math.tan(alt);
      var ombres = PIQUETS.map(function (p) {
        var L = p.h * cot;
        return { p: p, L: L, bout: { x: p.x + L * dx, y: p.y + L * dy } };
      });
      // ombres
      ombres.forEach(function (o) {
        ligne(svg, proj(o.p.x, o.p.y, 0), proj(o.bout.x, o.bout.y, 0), "ombre");
      });
      // méthode de la trace au sol pour le piquet 2 (exemple : piquet 1)
      var o2 = ombres[1], p2 = o2.p;
      var LL = 30;
      ligne(svg, proj(p2.x, p2.y, 0), proj(p2.x + LL * dx, p2.y + LL * dy, 0), "trace");
      // rayons parallèles : depuis un point au-dessus du sommet jusqu'au bout de l'ombre
      var self = this;
      ombres.forEach(function (o, i) {
        var amont = 1.6; // longueur du rayon dessinée en amont du sommet
        var dep = { x: o.p.x - amont * dx * cot, y: o.p.y - amont * dy * cot, z: o.p.h + amont };
        var a = proj(dep.x, dep.y, dep.z), b = proj(o.bout.x, o.bout.y, 0);
        ligne(svg, a, b, i === 1 ? "trace-rayon" : "rayon");
        self._fleche(a, b, i === 1 ? "fleche-plan" : "fleche");
      });
      this._piquets();
      // bout de l'ombre 2 (construit)
      var b2 = proj(o2.bout.x, o2.bout.y, 0);
      el("circle", { cx: b2.x, cy: b2.y, r: 4.2, class: "bout" }, svg);
      var tb = el("text", { x: Math.min(b2.x, LARGEUR - 70), y: Math.min(b2.y + 18, HAUTEUR - 4), class: "etiq etiq-plan", "text-anchor": "middle" }, svg);
      tb.textContent = "ombre de 2";
      // lecture
      var lignes = ombres.map(function (o) {
        return "<li>Piquet " + o.p.nom + " : hauteur " + fmt(o.p.h, 1) + " m → ombre " + approx(o.L, 2) + " m</li>";
      }).join("");
      this._lecture.innerHTML =
        '<div class="carte"><div class="carte-titre">Soleil : projection parallèle</div>' +
        'Tous les rayons ont la même direction : les trois ombres sont <span class="resultat">parallèles entre elles</span>, ' +
        'et chaque ombre est proportionnelle à la hauteur de son piquet (ombre ÷ hauteur ' + approx(cot, 2) + ' pour les trois).' +
        '<ul class="liste">' + lignes + '</ul></div>' +
        '<div class="carte"><div class="carte-titre">Construire l\'ombre du piquet 2 (trace au sol)</div>' +
        '<ul class="liste"><li>Au sol, depuis le pied du piquet 2, trace la parallèle à l\'ombre du piquet 1 (pointillés violets).</li>' +
        '<li>Depuis le sommet du piquet 2, trace la parallèle au rayon du piquet 1 (trait violet).</li>' +
        '<li>Ces deux droites sont dans un même plan vertical : leur point commun est l\'ombre du sommet.</li></ul></div>';
    }

    _rendreLampe() {
      var e = this._e, svg = this._svg, self = this;
      var L0 = { x: e.lx, y: e.ly };
      var pl0 = proj(e.lx, e.ly, 0), pl = proj(e.lx, e.ly, e.lz);
      ligne(svg, pl0, pl, "mat");
      var res = PIQUETS.map(function (p) {
        if (e.lz <= p.h + 1e-9) return { p: p, illimitee: true };
        var t = e.lz / (e.lz - p.h);
        var bout = { x: e.lx + t * (p.x - e.lx), y: e.ly + t * (p.y - e.ly) };
        var dist = Math.hypot(p.x - e.lx, p.y - e.ly);
        return { p: p, bout: bout, L: dist * p.h / (e.lz - p.h), illimitee: false };
      });
      res.forEach(function (r) {
        var pied = proj(r.p.x, r.p.y, 0);
        // prolongement de l'ombre vers le pied de la lampe : les droites concourent
        ligne(svg, pied, pl0, "prolong");
        if (r.illimitee) {
          var ux = r.p.x - e.lx, uy = r.p.y - e.ly, n = Math.hypot(ux, uy) || 1;
          var loin = { x: r.p.x + 40 * ux / n, y: r.p.y + 40 * uy / n };
          ligne(svg, pied, proj(loin.x, loin.y, 0), "ombre");
          ligne(svg, pl, proj(r.p.x, r.p.y, r.p.h), "rayon-lampe");
        } else {
          ligne(svg, pied, proj(r.bout.x, r.bout.y, 0), "ombre");
          var b = proj(r.bout.x, r.bout.y, 0);
          ligne(svg, pl, b, "rayon-lampe");
          self._fleche(proj(r.p.x, r.p.y, r.p.h), b, "fleche");
        }
      });
      this._piquets();
      el("circle", { cx: pl0.x, cy: pl0.y, r: 4, class: "pied-lampe" }, svg);
      el("circle", { cx: pl.x, cy: pl.y, r: 7, class: "lampe" }, svg);
      var tl = el("text", { x: pl.x + 11, y: pl.y + 4, class: "etiq etiq-attn" }, svg);
      tl.textContent = "lampe";
      var tp = el("text", { x: pl0.x + 8, y: pl0.y + 15, class: "etiq etiq-bad" }, svg);
      tp.textContent = "pied de la lampe";
      var lignes = res.map(function (r) {
        if (r.illimitee) return '<li class="alerte">Piquet ' + r.p.nom + ' : la lampe n\'est pas plus haute que son sommet — son ombre au sol est illimitée.</li>';
        return "<li>Piquet " + r.p.nom + " : hauteur " + fmt(r.p.h, 1) + " m → ombre " + approx(r.L, 2) + " m</li>";
      }).join("");
      this._lecture.innerHTML =
        '<div class="carte"><div class="carte-titre">Lampe : projection centrale</div>' +
        'Les rayons partent tous d\'un même point : les ombres ne sont plus parallèles, elles sont ' +
        '<span class="resultat">concourantes</span> — leurs prolongements (pointillés rouges) passent tous par le pied de la lampe. ' +
        'Plus un piquet est proche de la lampe ou plus il est haut, plus son ombre s\'allonge.' +
        '<ul class="liste">' + lignes + '</ul></div>' +
        '<div class="carte note">Soleil : projection parallèle, ombres parallèles. Lampe : projection centrale, ombres concourantes — ' +
        'comme les fuyantes de la perspective centrale, qui convergent vers un point de fuite.</div>';
    }
  }

  if (!customElements.get("ombre-soleil-lampe-widget")) {
    customElements.define("ombre-soleil-lampe-widget", OmbreSoleilLampeWidget);
  }
})();
