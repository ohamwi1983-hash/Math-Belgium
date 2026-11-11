(function () {
  "use strict";

  /* ================================================================
   * <fenetre-durer-widget> — atelier interactif (4e, ch. 8, § 10) :
   * vue de côté schématique de la fenêtre de Dürer. Un œil (vision à un
   * seul œil), une vitre verticale fixe à 1 m de l'œil, et deux bâtons
   * verticaux centrés sur la ligne de visée horizontale, dont on règle la
   * distance et la hauteur. Les rayons issus de l'œil vers les extrémités
   * de chaque bâton coupent la vitre : le segment obtenu est l'image du
   * bâton. Taille apparente = hauteur × (distance œil–vitre) ÷ (distance
   * œil–bâton). Bouton « même taille apparente » : règle le bâton 2 pour
   * que les deux images coïncident (deux fois plus loin → deux fois plus
   * grand). Défauts : bâton 1 à 3 m, 1 m ; bâton 2 à 6 m, 2 m → même
   * image (≈ 0,33 m sur la vitre). Fenêtre FIXE, repère orthonormé.
   * ================================================================ */

  var SVGNS = "http://www.w3.org/2000/svg";
  var LARGEUR = 460, HAUTEUR = 246;
  var ECH = 38, OX = 34, OY = 118; // OY : ligne de visée (hauteur de l'œil)
  var DV = 1; // distance œil–vitre (m)
  var H_MAX = 4, D_MIN = 2, D_MAX = 10.5;

  function defaut() { return { d1: 3, h1: 1, d2: 6, h2: 2, message: "" }; }

  function moins(s) { return String(s).replace(/-/g, "−"); }
  function fmt(x, d) {
    var f = Math.pow(10, d), r = Math.round(x * f) / f;
    if (Object.is(r, -0)) r = 0;
    var s = r.toFixed(d);
    if (d > 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
    return moins(s.replace(".", ","));
  }
  function egal(x, d) {
    var f = Math.pow(10, d);
    return Math.abs(Math.round(x * f) / f - x) < 1e-9 ? "= " + fmt(x, d) : "≈ " + fmt(x, d);
  }
  function P(x, y) { return { x: OX + ECH * x, y: OY - ECH * y }; }
  function el(tag, attrs, parent) {
    var e = document.createElementNS(SVGNS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function ligne(parent, a, b, cls) { return el("line", { x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: cls }, parent); }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#182430);}' +
    '*{box-sizing:border-box;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:10px;}' +
    'svg{width:100%;max-width:520px;height:auto;background:var(--surface-2,#f7f9fb);border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);}' +
    '.visee{stroke:var(--ink-soft,#51626f);stroke-width:1;stroke-dasharray:2 4;}' +
    '.vitre{stroke:var(--plan,#5b4ea3);stroke-width:5;opacity:0.35;}' +
    '.rayon1{stroke:var(--good,#2f7a4f);stroke-width:1.3;}' +
    '.rayon2{stroke:var(--bad,#b23a3a);stroke-width:1.3;stroke-dasharray:6 3;}' +
    '.baton1{stroke:var(--good,#2f7a4f);stroke-width:5;stroke-linecap:round;}' +
    '.baton2{stroke:var(--bad,#b23a3a);stroke-width:5;stroke-linecap:round;}' +
    '.image1{stroke:var(--good,#2f7a4f);stroke-width:7;stroke-linecap:butt;opacity:0.85;}' +
    '.image2{stroke:var(--bad,#b23a3a);stroke-width:3;stroke-linecap:butt;}' +
    '.oeil{fill:var(--ink,#182430);}' +
    '.grad{stroke:var(--ink-soft,#51626f);stroke-width:1;}' +
    '.graduation{font-size:11px;fill:var(--ink-soft,#51626f);font-family:var(--sans,sans-serif);}' +
    '.etiq{font-size:13px;font-weight:700;font-family:var(--sans,sans-serif);fill:var(--ink,#182430);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.etiq-g{fill:var(--good,#2f7a4f);} .etiq-b{fill:var(--bad,#b23a3a);} .etiq-p{fill:var(--plan,#5b4ea3);}' +
    '.lecture{display:flex;flex-direction:column;gap:8px;margin:0 0 12px;font-variant-numeric:tabular-nums;}' +
    '.carte{padding:10px 12px;border-radius:var(--radius,3px);background:var(--surface-2,#f7f9fb);border:1px solid var(--line,#ccd8e0);line-height:1.55;font-size:0.95rem;}' +
    '.carte-titre{font-weight:700;font-size:0.82rem;color:var(--ink-soft,#51626f);margin-bottom:4px;}' +
    '.liste{margin:0;padding-left:1.2em;} .liste li{margin:2px 0;}' +
    '.c-g{color:var(--good,#2f7a4f);font-weight:700;} .c-b{color:var(--bad,#b23a3a);font-weight:700;}' +
    '.resultat{font-weight:700;color:var(--good,#2f7a4f);}' +
    '.note{font-size:0.86rem;color:var(--ink-soft,#51626f);}' +
    '.message{color:var(--bad,#b23a3a);font-size:0.9rem;min-height:1.2em;text-align:center;}' +
    '.controles{display:flex;flex-direction:column;gap:6px;align-items:center;}' +
    '.groupe{width:100%;max-width:440px;}' +
    '.groupe-titre{font-size:0.86rem;font-weight:700;margin:4px 0 0;}' +
    '.curseur{display:flex;align-items:center;gap:8px;width:100%;}' +
    '.curseur label{flex:0 0 auto;width:5.6em;font-size:0.86rem;color:var(--ink-soft,#51626f);font-weight:600;}' +
    '.curseur input{flex:1 1 auto;min-width:0;height:44px;}' +
    '.curseur output{flex:0 0 auto;width:4.2em;text-align:right;font-variant-numeric:tabular-nums;font-size:0.9rem;}' +
    '#g1 input{accent-color:var(--good,#2f7a4f);} #g2 input{accent-color:var(--bad,#b23a3a);}' +
    '.btn{min-height:44px;min-width:44px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);background:var(--surface,#fff);color:var(--ink,#182430);font-weight:600;cursor:pointer;font-family:inherit;font-size:0.95rem;}' +
    '.btn:focus-visible{outline:2px solid var(--accent,#b65c1f);outline-offset:2px;}' +
    '.btn-reset{background:var(--accent-soft,#f6e2d3);border-color:var(--accent-soft-line,#e8c4a4);color:var(--accent-ink,#7a3212);}' +
    '.rangee{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:4px;}' +
    '.lecture,.controles{max-width:620px;margin-left:auto;margin-right:auto;}' +
    '</style>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" role="img" aria-label="Vue de côté : un œil, une vitre et deux bâtons ; les rayons visuels coupent la vitre"></svg></div>' +
    '<div class="lecture" id="lecture" aria-live="polite"></div>' +
    '<div class="controles">' +
    '<div class="groupe" id="g1"><div class="groupe-titre" style="color:var(--good,#2f7a4f)">Bâton 1</div>' +
    '<div class="curseur"><label for="d1">Distance</label><input id="d1" type="range" min="' + D_MIN + '" max="' + D_MAX + '" step="0.5"><output id="d1-v"></output></div>' +
    '<div class="curseur"><label for="h1">Hauteur</label><input id="h1" type="range" min="0.5" max="' + H_MAX + '" step="0.25"><output id="h1-v"></output></div></div>' +
    '<div class="groupe" id="g2"><div class="groupe-titre" style="color:var(--bad,#b23a3a)">Bâton 2</div>' +
    '<div class="curseur"><label for="d2">Distance</label><input id="d2" type="range" min="' + D_MIN + '" max="' + D_MAX + '" step="0.5"><output id="d2-v"></output></div>' +
    '<div class="curseur"><label for="h2">Hauteur</label><input id="h2" type="range" min="0.5" max="' + H_MAX + '" step="0.25"><output id="h2-v"></output></div></div>' +
    '<div class="rangee">' +
    '<button class="btn" id="meme" type="button">Même taille apparente</button>' +
    '<button class="btn btn-reset" id="reset" type="button">Réinitialiser</button></div>' +
    '<div class="message" id="message" aria-live="polite"></div>' +
    '</div>';

  class FenetreDurerWidget extends HTMLElement {
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
      ["d1", "h1", "d2", "h2"].forEach(function (id) {
        ecoute(sh.getElementById(id), "input", function (ev) { self._e[id] = parseFloat(ev.target.value); self._e.message = ""; self._rendre(); });
      });
      ecoute(sh.getElementById("meme"), "click", function () { self._memeTaille(); });
      ecoute(sh.getElementById("reset"), "click", function () { self._e = defaut(); self._rendre(); });
      this._rendre();
    }

    disconnectedCallback() {
      this._ecouteurs.forEach(function (x) { x[0].removeEventListener(x[1], x[2]); });
      this._ecouteurs = [];
    }

    _memeTaille() {
      var e = this._e;
      // h2 = h1 × d2 / d1, arrondi au quart de mètre le plus proche dont le rapport est exact si possible
      var cible = e.h1 * e.d2 / e.d1;
      if (cible >= 0.5 - 1e-9 && cible <= H_MAX + 1e-9 && Math.abs(Math.round(cible * 4) / 4 - cible) < 1e-9) {
        e.h2 = cible;
        e.message = "";
      } else {
        // sinon : un couple (distance, hauteur) des curseurs avec h2 / d2 = h1 / d1, le plus proche de d2
        var meilleur = null;
        for (var d = D_MIN; d <= D_MAX + 1e-9; d += 0.5) {
          var h = e.h1 * d / e.d1;
          if (h < 0.5 - 1e-9 || h > H_MAX + 1e-9 || Math.abs(Math.round(h * 4) / 4 - h) > 1e-9) continue;
          if (!meilleur || Math.abs(d - e.d2) < Math.abs(meilleur.d - e.d2)) meilleur = { d: d, h: h };
        }
        if (meilleur) {
          e.d2 = meilleur.d; e.h2 = Math.round(meilleur.h * 4) / 4; e.message = "";
        } else {
          e.h2 = Math.min(H_MAX, Math.max(0.5, Math.round(cible * 4) / 4));
          e.message = "Réglage exact impossible avec ces curseurs : la hauteur la plus proche a été choisie.";
        }
      }
      this._rendre();
    }

    _rendre() {
      var sh = this.shadowRoot, e = this._e, svg = this._svg;
      ["d1", "h1", "d2", "h2"].forEach(function (id) { sh.getElementById(id).value = e[id]; });
      sh.getElementById("d1-v").textContent = fmt(e.d1, 2) + " m";
      sh.getElementById("d2-v").textContent = fmt(e.d2, 2) + " m";
      sh.getElementById("h1-v").textContent = fmt(e.h1, 2) + " m";
      sh.getElementById("h2-v").textContent = fmt(e.h2, 2) + " m";
      sh.getElementById("message").textContent = e.message;
      while (svg.firstChild) svg.removeChild(svg.firstChild);

      // graduations de distance (m)
      for (var m = 0; m <= 11; m++) {
        var g = P(m, -2.75);
        ligne(svg, { x: g.x, y: g.y - 4 }, { x: g.x, y: g.y + 2 }, "grad");
        if (m % 2 === 0) {
          var tg = el("text", { x: g.x, y: g.y + 14, class: "graduation", "text-anchor": "middle" }, svg);
          tg.textContent = m + " m";
        }
      }
      ligne(svg, P(0, -2.75), P(11, -2.75), "grad");
      ligne(svg, P(0, 0), P(11, 0), "visee");

      var oeil = P(0, 0);
      var b = [
        { d: e.d1, h: e.h1, cls: "1", nom: "1" },
        { d: e.d2, h: e.h2, cls: "2", nom: "2" },
      ];
      // rayons
      b.forEach(function (o) {
        ligne(svg, oeil, P(o.d, o.h / 2), "rayon" + o.cls);
        ligne(svg, oeil, P(o.d, -o.h / 2), "rayon" + o.cls);
      });
      // vitre
      ligne(svg, P(DV, -2.5), P(DV, 2.5), "vitre");
      var tv = el("text", { x: P(DV, 2.5).x, y: P(DV, 2.5).y + 2, class: "etiq etiq-p", "text-anchor": "middle" }, svg);
      tv.textContent = "vitre";
      // bâtons
      b.forEach(function (o) {
        ligne(svg, P(o.d, -o.h / 2), P(o.d, o.h / 2), "baton" + o.cls);
        // bâton 1 étiqueté au-dessus, bâton 2 en dessous : jamais superposés
        var haut = o.cls === "1";
        var px = P(o.d, 0).x, fin = o.d > 8;
        var t = el("text", {
          x: fin ? px - 6 : px + 6,
          y: haut ? P(o.d, o.h / 2).y - 6 : P(o.d, -o.h / 2).y + 15,
          class: "etiq etiq-" + (haut ? "g" : "b"),
          "text-anchor": fin ? "end" : "start",
        }, svg);
        t.textContent = "bâton " + o.nom;
      });
      // images sur la vitre : demi-hauteur × DV / d
      var imgs = b.map(function (o) { return o.h * DV / o.d; });
      ligne(svg, P(DV, -imgs[0] / 2), P(DV, imgs[0] / 2), "image1");
      ligne(svg, P(DV, -imgs[1] / 2), P(DV, imgs[1] / 2), "image2");
      el("circle", { cx: oeil.x, cy: oeil.y, r: 5, class: "oeil" }, svg);
      var to = el("text", { x: oeil.x, y: oeil.y + 20, class: "etiq", "text-anchor": "middle" }, svg);
      to.textContent = "œil";

      var memes = Math.abs(imgs[0] - imgs[1]) < 1e-9;
      var lignes = b.map(function (o, i) {
        return '<li><span class="c-' + (i === 0 ? "g" : "b") + '">Bâton ' + o.nom + '</span> : ' +
          fmt(o.h, 2) + ' × ' + fmt(DV, 0) + ' ÷ ' + fmt(o.d, 2) + ' ' + egal(imgs[i], 2) + ' m sur la vitre (' + egal(imgs[i] * 100, 0) + ' cm)</li>';
      }).join("");
      var verdict = memes
        ? '<span class="resultat">Les deux images coïncident</span> : ' +
          (Math.abs(e.d1 - e.d2) < 1e-9 ? 'mêmes distances et mêmes hauteurs.' :
            'le bâton ' + (e.d2 > e.d1 ? '2' : '1') + ' est ' + fmt(Math.max(e.d1, e.d2) / Math.min(e.d1, e.d2), 2) +
            ' fois plus loin, et exactement ' + fmt(Math.max(e.d1, e.d2) / Math.min(e.d1, e.d2), 2) + ' fois plus grand.')
        : 'Les deux images n\'ont pas la même taille : le bâton ' + (imgs[0] > imgs[1] ? '1' : '2') + ' paraît plus grand à travers la vitre.';
      this._lecture.innerHTML =
        '<div class="carte"><div class="carte-titre">Taille apparente = hauteur × (distance œil–vitre) ÷ (distance œil–bâton)</div>' +
        '<ul class="liste">' + lignes + '</ul>' + verdict + '</div>' +
        '<div class="carte note">Le peintre regarde avec un seul œil (vision monoculaire) : tout ce qui est sur un même rayon visuel ' +
        'se projette au même point de la vitre. Un objet deux fois plus loin doit donc être deux fois plus grand pour paraître de la même taille.</div>';
    }
  }

  if (!customElements.get("fenetre-durer-widget")) {
    customElements.define("fenetre-durer-widget", FenetreDurerWidget);
  }
})();
