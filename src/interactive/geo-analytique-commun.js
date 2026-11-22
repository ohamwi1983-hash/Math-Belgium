(function (root) {
  "use strict";

  /* ================================================================
   * Outils partagés des ateliers de géométrie analytique (4e, ch. 7,
   * lot G de l'audit) : repère à fenêtre FIXE (quadrillage, axes fléchés,
   * graduations écrites avec « − »), conversion pixels ↔ coordonnées,
   * glisser des poignées, écriture des nombres (virgule, « − », fraction
   * « 7⁄3 »), équations de droite « 2x + y − 9 = 0 », styles communs.
   * Exposé sur window.GeoAnaCommun (importé AVANT chaque atelier par son
   * register-*.js). Aucun « déterminant », aucun radian.
   * ================================================================ */

  var SVGNS = "http://www.w3.org/2000/svg";

  function el(tag, attrs, parent) {
    var e = document.createElementNS(SVGNS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  function texte(svg, x, y, contenu, classe, ancre) {
    var t = el("text", { x: (+x).toFixed(1), y: (+y).toFixed(1), class: classe || "etiq", "text-anchor": ancre || "middle" }, svg);
    t.textContent = contenu;
    return t;
  }

  function moins(s) { return String(s).replace(/-/g, "−"); }

  /** Nombre écrit à la française : virgule, « − », au plus `dec` décimales, zéros inutiles retirés. */
  function nb(x, dec) {
    if (dec === undefined) dec = 2;
    if (Math.abs(x) < 1e-9) x = 0;
    var s = x.toFixed(dec);
    if (s.indexOf(".") >= 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
    if (s === "-0") s = "0";
    return moins(s.replace(".", ","));
  }

  function pgcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a || 1; }

  /** Rationnel p/q écrit « 7⁄3 », « −2 » ou « 5 ». */
  function frac(p, q) {
    if (q < 0) { p = -p; q = -q; }
    var g = pgcd(p, q); p /= g; q /= g;
    if (q === 1) return moins(String(p));
    return (p < 0 ? "−" : "") + Math.abs(p) + "⁄" + q;
  }

  function coord(x, y, dec) { return "(" + nb(x, dec) + "\u00a0;\u00a0" + nb(y, dec) + ")"; }

  /** Équation ax + by + c = 0 (coefficients entiers déjà réduits) : « 2x + y − 9 = 0 », « x = 1 ». */
  function equationDroite(a, b, c) {
    var morceaux = [];
    function terme(coef, lettre) {
      if (coef === 0) return;
      var abs = Math.abs(coef);
      var corps = lettre ? (abs === 1 ? lettre : abs + lettre) : String(abs);
      if (morceaux.length === 0) morceaux.push((coef < 0 ? "−" : "") + corps);
      else morceaux.push((coef < 0 ? " − " : " + ") + corps);
    }
    terme(a, "x"); terme(b, "y"); terme(c, "");
    return (morceaux.join("") || "0") + " = 0";
  }

  /** Réduit (a, b, c) entiers par leur PGCD, premier coefficient non nul positif. */
  function reduire(a, b, c) {
    var g = pgcd(pgcd(a, b), c);
    a /= g; b /= g; c /= g;
    if (a < 0 || (a === 0 && b < 0)) { a = -a; b = -b; c = -c; }
    return [a + 0, b + 0, c + 0];
  }

  /** Repère à fenêtre fixe : fen = { xMin, xMax, yMin, yMax }, unite (px), marge (px). */
  function repere(fen, unite, marge) {
    var L = (fen.xMax - fen.xMin) * unite + 2 * marge;
    var H = (fen.yMax - fen.yMin) * unite + 2 * marge;
    var R = {
      fen: fen, unite: unite, marge: marge, L: L, H: H,
      px: function (x, y) { return [marge + (x - fen.xMin) * unite, marge + (fen.yMax - y) * unite]; },
      monde: function (svg, cx, cy) {
        var ctm = svg.getScreenCTM();
        if (!ctm) return null;
        var pt = svg.createSVGPoint();
        pt.x = cx; pt.y = cy;
        var q = pt.matrixTransform(ctm.inverse());
        return { x: fen.xMin + (q.x - marge) / unite, y: fen.yMax - (q.y - marge) / unite };
      },
      /** Quadrillage d'une unité, axes fléchés, graduations tous les `pas`. */
      fond: function (svg, pas) {
        pas = pas || 1;
        var defs = el("defs", {}, svg);
        var mk = el("marker", { id: "fl", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" }, defs);
        el("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche-axe" }, mk);
        var gx, gy;
        for (gx = Math.ceil(fen.xMin); gx <= fen.xMax; gx++) { var px = R.px(gx, 0)[0]; el("line", { x1: px, y1: marge, x2: px, y2: H - marge, class: "grille" }, svg); }
        for (gy = Math.ceil(fen.yMin); gy <= fen.yMax; gy++) { var py = R.px(0, gy)[1]; el("line", { x1: marge, y1: py, x2: L - marge, y2: py, class: "grille" }, svg); }
        var o = R.px(0, 0);
        el("line", { x1: marge, y1: o[1], x2: L - marge, y2: o[1], class: "axe", "marker-end": "url(#fl)" }, svg);
        el("line", { x1: o[0], y1: H - marge, x2: o[0], y2: marge, class: "axe", "marker-end": "url(#fl)" }, svg);
        for (gx = Math.ceil(fen.xMin / pas) * pas; gx < fen.xMax; gx += pas) {
          if (gx === 0) continue;
          texte(svg, R.px(gx, 0)[0], o[1] + 15, moins(gx), "graduation");
        }
        for (gy = Math.ceil(fen.yMin / pas) * pas; gy < fen.yMax; gy += pas) {
          if (gy === 0) continue;
          texte(svg, o[0] - 6, R.px(0, gy)[1] + 4, moins(gy), "graduation", "end");
        }
        texte(svg, o[0] - 6, o[1] + 15, "0", "graduation", "end");
        texte(svg, L - marge - 4, o[1] - 8, "x", "graduation axe-nom", "end");
        texte(svg, o[0] + 8, marge + 12, "y", "graduation axe-nom", "start");
      },
      /** Droite ax + by + c = 0 coupée au cadre (segment), ou null si elle ne le traverse pas. */
      segmentDroite: function (a, b, c) {
        var pts = [];
        var f = fen;
        function ajoute(x, y) {
          if (x < f.xMin - 1e-9 || x > f.xMax + 1e-9 || y < f.yMin - 1e-9 || y > f.yMax + 1e-9) return;
          for (var i = 0; i < pts.length; i++) if (Math.abs(pts[i][0] - x) < 1e-7 && Math.abs(pts[i][1] - y) < 1e-7) return;
          pts.push([x, y]);
        }
        if (Math.abs(b) > 1e-12) { ajoute(f.xMin, -(a * f.xMin + c) / b); ajoute(f.xMax, -(a * f.xMax + c) / b); }
        if (Math.abs(a) > 1e-12) { ajoute(-(b * f.yMin + c) / a, f.yMin); ajoute(-(b * f.yMax + c) / a, f.yMax); }
        if (pts.length < 2) return null;
        return [pts[0], pts[1]];
      },
      traceDroite: function (svg, a, b, c, classe) {
        var s = R.segmentDroite(a, b, c);
        if (!s) return null;
        var p = R.px(s[0][0], s[0][1]), q = R.px(s[1][0], s[1][1]);
        return el("line", { x1: p[0].toFixed(1), y1: p[1].toFixed(1), x2: q[0].toFixed(1), y2: q[1].toFixed(1), class: classe }, svg);
      },
      dansFenetre: function (x, y) { return x >= fen.xMin && x <= fen.xMax && y >= fen.yMin && y <= fen.yMax; },
    };
    return R;
  }

  /** Flèche (vecteur) de P à Q, coordonnées du monde. */
  function fleche(svg, R, P, Q, classeTrait, classeTete) {
    var a = R.px(P.x, P.y), b = R.px(Q.x, Q.y);
    var dx = b[0] - a[0], dy = b[1] - a[1], Lg = Math.hypot(dx, dy);
    if (Lg < 1) return;
    var ux = dx / Lg, uy = dy / Lg, t = 12, w = 5.5;
    el("line", { x1: a[0], y1: a[1], x2: b[0] - ux * t * 0.8, y2: b[1] - uy * t * 0.8, class: classeTrait }, svg);
    el("path", { d: "M" + b[0] + "," + b[1] + " L" + (b[0] - ux * t - uy * w) + "," + (b[1] - uy * t + ux * w) + " L" + (b[0] - ux * t + uy * w) + "," + (b[1] - uy * t - ux * w) + " Z", class: classeTete }, svg);
  }

  /** Point nommé : disque + étiquette décalée de (dx, dy) px, gardée dans le cadre. */
  function point(svg, R, x, y, nom, classePoint, classeEtiq, dx, dy) {
    var p = R.px(x, y);
    el("circle", { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: 4.5, class: classePoint || "point" }, svg);
    if (nom) {
      var tx = Math.max(12, Math.min(R.L - 12, p[0] + (dx === undefined ? 12 : dx)));
      var ty = Math.max(16, Math.min(R.H - 6, p[1] + (dy === undefined ? -10 : dy)));
      texte(svg, tx, ty, nom, classeEtiq || "etiq");
    }
  }

  /** Poignées : cercles transparents data-poignee, la poignée choisie est surlignée. */
  function poignee(svg, R, x, y, nom, active) {
    var p = R.px(x, y);
    el("circle", { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: 22, class: "poignee" + (active ? " poignee-active" : ""), "data-poignee": nom }, svg);
  }

  /** Glisser les poignées d'un svg. surDebut(nom), surDeplacement(nom, x, y) en coordonnées du monde. */
  function glisser(widget, svg, R, surDebut, surDeplacement) {
    var etat = { nom: null };
    function ecoute(c, t, f) { c.addEventListener(t, f); widget._ecouteurs.push([c, t, f]); }
    ecoute(svg, "pointerdown", function (e) {
      var n = e.target && e.target.getAttribute && e.target.getAttribute("data-poignee");
      if (!n) return;
      e.preventDefault();
      etat.nom = n;
      try { svg.setPointerCapture(e.pointerId); } catch (err) { /* rien */ }
      surDebut(n);
    });
    ecoute(svg, "pointermove", function (e) {
      if (!etat.nom) return;
      var p = R.monde(svg, e.clientX, e.clientY);
      if (p) surDeplacement(etat.nom, p.x, p.y);
    });
    function fin(e) {
      if (!etat.nom) return;
      etat.nom = null;
      try { svg.releasePointerCapture(e.pointerId); } catch (err) { /* rien */ }
    }
    ecoute(svg, "pointerup", fin);
    ecoute(svg, "pointercancel", fin);
  }

  function borner(v, a, b) { return Math.max(a, Math.min(b, v)); }

  var CSS =
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#182430);}' +
    '*{box-sizing:border-box;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:10px;}' +
    'svg{width:100%;max-width:540px;height:auto;background:var(--surface-2,#f7f9fb);border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);}' +
    '.grille{stroke:var(--line,#ccd8e0);stroke-width:0.7;}' +
    '.axe{stroke:var(--ink-soft,#51626f);stroke-width:1.3;}' +
    '.fleche-axe{fill:var(--ink-soft,#51626f);}' +
    '.graduation{font-size:11px;fill:var(--ink-soft,#51626f);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.axe-nom{font-size:13px;font-style:italic;}' +
    '.point{fill:var(--ink,#182430);}' +
    '.point-acc{fill:var(--accent,#b65c1f);}' +
    '.point-good{fill:var(--good,#2f7a4f);}' +
    '.point-bad{fill:var(--bad,#b23a3a);}' +
    '.point-plan{fill:var(--plan,#5b4ea3);}' +
    '.poignee{fill:transparent;cursor:grab;touch-action:none;}' +
    '.poignee-active{fill:var(--accent,#b65c1f);fill-opacity:0.14;}' +
    '.etiq{font-size:16px;font-weight:700;fill:var(--ink,#182430);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.etiq-acc{font-size:15px;font-weight:700;fill:var(--accent,#b65c1f);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.etiq-good{font-size:15px;font-weight:700;fill:var(--good,#2f7a4f);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.etiq-bad{font-size:15px;font-weight:700;fill:var(--bad,#b23a3a);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.etiq-plan{font-size:15px;font-weight:700;fill:var(--plan,#5b4ea3);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.trait-ink{stroke:var(--ink,#182430);stroke-width:2;fill:none;}' +
    '.trait-acc{stroke:var(--accent,#b65c1f);stroke-width:2.4;fill:none;}' +
    '.trait-good{stroke:var(--good,#2f7a4f);stroke-width:2.4;fill:none;}' +
    '.trait-bad{stroke:var(--bad,#b23a3a);stroke-width:2.2;fill:none;}' +
    '.trait-plan{stroke:var(--plan,#5b4ea3);stroke-width:2.2;fill:none;}' +
    '.trait-faint{stroke:var(--ink-soft,#51626f);stroke-width:1.6;fill:none;}' +
    '.pointille{stroke-dasharray:7 5;}' +
    '.tete-acc{fill:var(--accent,#b65c1f);}' +
    '.tete-good{fill:var(--good,#2f7a4f);}' +
    '.tete-bad{fill:var(--bad,#b23a3a);}' +
    '.tete-plan{fill:var(--plan,#5b4ea3);}' +
    '.lecture{display:flex;flex-direction:column;gap:8px;margin:0 auto 14px;max-width:620px;font-variant-numeric:tabular-nums;text-align:left;}' +
    '.carte{padding:10px 12px;border-radius:var(--radius,3px);background:var(--surface-2,#f7f9fb);border:1px solid var(--line,#ccd8e0);line-height:1.55;font-size:0.95rem;overflow-wrap:anywhere;}' +
    '.carte-titre{font-weight:700;font-size:0.82rem;color:var(--ink-soft,#51626f);margin-bottom:4px;}' +
    '.c-acc{color:var(--accent-ink,#7a3212);font-weight:700;}' +
    '.c-good{color:var(--good,#2f7a4f);font-weight:700;}' +
    '.c-bad{color:var(--bad,#b23a3a);font-weight:700;}' +
    '.c-plan{color:var(--plan,#5b4ea3);font-weight:700;}' +
    '.note{font-size:0.85rem;color:var(--ink-soft,#51626f);}' +
    '.controles{display:flex;flex-direction:column;gap:10px;align-items:center;max-width:620px;margin:0 auto;}' +
    '.rangee{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-items:center;}' +
    '.libelle{font-size:0.88rem;color:var(--ink-soft,#51626f);font-weight:600;}' +
    '.btn{min-height:44px;min-width:44px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);background:var(--surface,#fff);color:var(--ink,#182430);font-weight:600;cursor:pointer;font-family:inherit;font-size:0.95rem;}' +
    '.btn[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);border-color:var(--accent,#b65c1f);color:var(--accent-ink,#7a3212);}' +
    '.btn:focus-visible{outline:2px solid var(--accent,#b65c1f);outline-offset:2px;}' +
    '.btn-reset{background:var(--accent-soft,#f6e2d3);border-color:var(--accent-soft-line,#e8c4a4);color:var(--accent-ink,#7a3212);}' +
    'select{min-height:44px;padding:6px 10px;border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);background:var(--surface,#fff);color:var(--ink,#182430);font-family:inherit;font-size:0.95rem;max-width:100%;}' +
    '.curseur{display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:center;}' +
    '.curseur input[type=range]{width:min(260px,70vw);min-height:44px;accent-color:var(--accent,#b65c1f);}' +
    '.val{font-weight:700;min-width:3.5em;font-variant-numeric:tabular-nums;}';

  root.GeoAnaCommun = {
    el: el, texte: texte, moins: moins, nb: nb, pgcd: pgcd, frac: frac, coord: coord,
    equationDroite: equationDroite, reduire: reduire, repere: repere, fleche: fleche,
    point: point, poignee: poignee, glisser: glisser, borner: borner, CSS: CSS,
  };
})(window);
