(function () {
  "use strict";

  /* ================================================================
   * <traversee-riviere-widget> — atelier (4e, ch. 6, § 17) :
   * rivière de 40 m, courant c (0 à 2 m/s) parallèle aux rives, vitesse
   * propre v (0,5 à 3 m/s) et angle de visée θ (−80° à 80°, mesuré depuis
   * la perpendiculaire aux rives : négatif = vers l'amont). Repère : x le
   * long de la rive dans le sens du courant, y vers l'autre rive.
   * v_p = (v·sin θ ; v·cos θ), v_R = v_p + v_c, durée t = 40 ÷ y_{v_R},
   * point d'accostage x_A = x_{v_R} · t, distance parcourue ‖v_R‖ · t.
   * Bouton « Juste en face » : x_{v_p} = −c, possible seulement si v > c.
   * Défaut : c = 0,6 ; v = 0,8 ; θ = 0° → exemple du cours (50 s, 30 m en
   * aval, 1 m/s, 50 m). Vitesses dessinées 18 fois plus grandes (1 m/s → 18 m).
   * Fenêtre FIXE (x de −30 à 90 m) : une trajectoire qui en sort est
   * coupée au bord, et le texte le dit. Web Component (Shadow DOM).
   * ================================================================ */

  var SVGNS = "http://www.w3.org/2000/svg";
  var X_MIN = -30, X_MAX = 90, Y_MIN = -12, Y_MAX = 52;
  var LARG_RIV = 40, ECH = 18;
  var UNITE = 3.4, MARGE = 14;
  var LARGEUR = (X_MAX - X_MIN) * UNITE + 2 * MARGE;
  var HAUTEUR = (Y_MAX - Y_MIN) * UNITE + 2 * MARGE;
  var DEF = { c: 0.6, v: 0.8, theta: 0 };

  function moins(s) { return String(s).replace(/-/g, "−"); }
  function fmt(x, d) {
    var f = Math.pow(10, d), r = Math.round(x * f) / f;
    if (Object.is(r, -0)) r = 0;
    return moins(r.toFixed(d).replace(".", ","));
  }
  function exact(x, d) { return Math.abs(Math.round(x * Math.pow(10, d)) - x * Math.pow(10, d)) < 1e-6; }
  function rel(x, d) { return (exact(x, d) ? " = " : " ≈ ") + fmt(x, d); }

  function el(tag, attrs, parent) {
    var e = document.createElementNS(SVGNS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#182430);}' +
    '*{box-sizing:border-box;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:10px;}' +
    'svg{width:100%;max-width:560px;height:auto;background:var(--surface-2,#f7f9fb);border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);}' +
    '.eau{fill:var(--sky,#2f6fa8);fill-opacity:0.12;}' +
    '.rive{stroke:var(--ink-soft,#51626f);stroke-width:2;}' +
    '.courant{stroke:var(--sky,#2f6fa8);stroke-width:1.4;opacity:0.7;}' +
    '.courant-tete{fill:var(--sky,#2f6fa8);opacity:0.7;}' +
    '.axe{stroke:var(--ink-soft,#51626f);stroke-width:1.2;}' +
    '.fleche-axe{fill:var(--ink-soft,#51626f);}' +
    '.repere{font-size:14px;fill:var(--ink-soft,#51626f);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.trajet{stroke:var(--accent,#b65c1f);stroke-width:2.2;stroke-dasharray:7 5;}' +
    '.enface{stroke:var(--ink-soft,#51626f);stroke-width:1.2;stroke-dasharray:3 4;}' +
    '.vp{stroke:var(--good,#2f7a4f);stroke-width:3;}' +
    '.vp-tete{fill:var(--good,#2f7a4f);}' +
    '.vc{stroke:var(--attn,#a86a00);stroke-width:3;}' +
    '.vc-tete{fill:var(--attn,#a86a00);}' +
    '.vr{stroke:var(--accent,#b65c1f);stroke-width:3.2;}' +
    '.vr-tete{fill:var(--accent,#b65c1f);}' +
    '.para{stroke:var(--ink-soft,#51626f);stroke-width:1;stroke-dasharray:3 3;}' +
    '.point{fill:var(--ink,#182430);}' +
    '.accostage{fill:var(--accent,#b65c1f);}' +
    '.etiq{font-size:15px;font-weight:700;fill:var(--ink,#182430);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.etiq-acc{font-size:16px;font-weight:700;fill:var(--accent,#b65c1f);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.etiq-vp{font-size:16px;font-weight:700;fill:var(--good,#2f7a4f);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.etiq-vc{font-size:16px;font-weight:700;fill:var(--attn,#a86a00);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.lecture{display:flex;flex-direction:column;gap:8px;margin:0 auto 14px;max-width:620px;font-variant-numeric:tabular-nums;text-align:left;}' +
    '.carte{padding:10px 12px;border-radius:var(--radius,3px);background:var(--surface-2,#f7f9fb);border:1px solid var(--line,#ccd8e0);line-height:1.55;font-size:0.95rem;}' +
    '.carte-titre{font-weight:700;font-size:0.82rem;color:var(--ink-soft,#51626f);margin-bottom:4px;}' +
    '.c-vp{color:var(--good,#2f7a4f);font-weight:700;}' +
    '.c-vc{color:var(--attn,#a86a00);font-weight:700;}' +
    '.c-acc{color:var(--accent-ink,#7a3212);font-weight:700;}' +
    '.message{color:var(--bad,#b23a3a);font-weight:600;min-height:1.2em;text-align:center;}' +
    '.controles{display:flex;flex-direction:column;gap:12px;max-width:620px;margin:0 auto;}' +
    '.curseur{display:grid;grid-template-columns:minmax(0,1fr);gap:4px;}' +
    '.curseur label{font-weight:600;font-size:0.92rem;}' +
    '.curseur input{width:100%;min-height:32px;accent-color:var(--accent,#b65c1f);}' +
    '.rangee{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-items:center;}' +
    '.btn{min-height:44px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);background:var(--surface,#fff);color:var(--ink,#182430);font-weight:600;cursor:pointer;font-family:inherit;font-size:0.95rem;}' +
    '.btn:focus-visible{outline:2px solid var(--accent,#b65c1f);outline-offset:2px;}' +
    '.btn-reset{background:var(--accent-soft,#f6e2d3);border-color:var(--accent-soft-line,#e8c4a4);color:var(--accent-ink,#7a3212);}' +
    '</style>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR.toFixed(1) + ' ' + HAUTEUR.toFixed(1) + '" role="img" aria-label="Rivière vue de dessus : vitesse propre, courant, vitesse réelle et trajectoire du nageur"></svg></div>' +
    '<div class="lecture" id="lecture" aria-live="polite"></div>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="c" id="lc"></label><input id="c" type="range" min="0" max="2" step="0.1"></div>' +
    '<div class="curseur"><label for="v" id="lv"></label><input id="v" type="range" min="0.5" max="3" step="0.1"></div>' +
    '<div class="curseur"><label for="t" id="lt"></label><input id="t" type="range" min="-80" max="80" step="1"></div>' +
    '<div class="message" id="message" aria-live="polite"></div>' +
    '<div class="rangee"><button class="btn" type="button" id="enface">Juste en face</button>' +
    '<button class="btn" type="button" id="perp">Nager perpendiculairement</button>' +
    '<button class="btn btn-reset" type="button" id="reset">Réinitialiser</button></div>' +
    '</div>';

  class TraverseeRiviereWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._svg = shadow.getElementById("svg");
      this._lecture = shadow.getElementById("lecture");
      this._message = shadow.getElementById("message");
      this._etat = { c: DEF.c, v: DEF.v, theta: DEF.theta };
      this._ecouteurs = [];
    }

    connectedCallback() {
      var self = this, sh = this.shadowRoot;
      function ecoute(c, t, f) { c.addEventListener(t, f); self._ecouteurs.push([c, t, f]); }
      var ic = sh.getElementById("c"), iv = sh.getElementById("v"), it = sh.getElementById("t");
      ecoute(ic, "input", function () { self._etat.c = Number(ic.value); self._message.textContent = ""; self._rendre(); });
      ecoute(iv, "input", function () { self._etat.v = Number(iv.value); self._message.textContent = ""; self._rendre(); });
      ecoute(it, "input", function () { self._etat.theta = Number(it.value); self._message.textContent = ""; self._rendre(); });
      ecoute(sh.getElementById("enface"), "click", function () {
        var E = self._etat;
        if (E.v <= E.c) {
          self._message.textContent = "Impossible : la vitesse propre (" + fmt(E.v, 1) + " m/s) ne dépasse pas le courant (" + fmt(E.c, 1) + " m/s). Le courant l'emporte toujours.";
          return;
        }
        self._message.textContent = "";
        E.theta = -Math.asin(E.c / E.v) * 180 / Math.PI;
        self._rendre();
      });
      ecoute(sh.getElementById("perp"), "click", function () { self._etat.theta = 0; self._message.textContent = ""; self._rendre(); });
      ecoute(sh.getElementById("reset"), "click", function () { self._etat = { c: DEF.c, v: DEF.v, theta: DEF.theta }; self._message.textContent = ""; self._rendre(); });
      this._rendre();
    }

    disconnectedCallback() {
      this._ecouteurs.forEach(function (t) { t[0].removeEventListener(t[1], t[2]); });
      this._ecouteurs = [];
    }

    _px(x, y) { return [MARGE + (x - X_MIN) * UNITE, MARGE + (Y_MAX - y) * UNITE]; }

    _fleche(svg, P, Q, classeTrait, classeTete, t, w) {
      var a = this._px(P.x, P.y), b = this._px(Q.x, Q.y);
      var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
      if (L < 1) return;
      t = t || 11; w = w || 5;
      if (L < t * 1.4) { t = L / 1.4; w = t / 2.2; }
      var ux = dx / L, uy = dy / L;
      el("line", { x1: a[0], y1: a[1], x2: b[0] - ux * t * 0.8, y2: b[1] - uy * t * 0.8, class: classeTrait }, svg);
      el("path", { d: "M" + b[0] + "," + b[1] + " L" + (b[0] - ux * t - uy * w) + "," + (b[1] - uy * t + ux * w) + " L" + (b[0] - ux * t + uy * w) + "," + (b[1] - uy * t - ux * w) + " Z", class: classeTete }, svg);
    }

    /* « v » suivi d'un indice (tspan abaissé) : vₚ existe en Unicode, pas v_c ni v_R. */
    _etiqSub(svg, x, y, indice, classe, ancre) {
      var t = el("text", { x: x.toFixed(1), y: y.toFixed(1), class: classe, "text-anchor": ancre }, svg);
      t.appendChild(document.createTextNode("v"));
      var s = el("tspan", { dy: "4", "font-size": "12" }, t);
      s.textContent = indice;
    }

    _rendre() {
      var sh = this.shadowRoot, E = this._etat;
      sh.getElementById("c").value = String(E.c);
      sh.getElementById("v").value = String(E.v);
      sh.getElementById("t").value = String(Math.round(E.theta));
      sh.getElementById("lc").textContent = "Courant c : " + fmt(E.c, 1) + " m/s";
      sh.getElementById("lv").textContent = "Vitesse propre (par rapport à l'eau) : " + fmt(E.v, 1) + " m/s";
      var th = E.theta;
      sh.getElementById("lt").textContent = "Angle de visée θ : " + fmt(th, Math.abs(th - Math.round(th)) < 1e-9 ? 0 : 1) + "° " +
        (Math.abs(th) < 1e-9 ? "(perpendiculaire aux rives)" : th < 0 ? "(vers l'amont)" : "(vers l'aval)");

      var rad = th * Math.PI / 180;
      var vpx = E.v * Math.sin(rad), vpy = E.v * Math.cos(rad);
      if (Math.abs(vpx) < 1e-12) vpx = 0;
      var vrx = vpx + E.c, vry = vpy;
      if (Math.abs(vrx) < 1e-9) vrx = 0;
      var t = LARG_RIV / vry, xA = vrx * t, nR = Math.hypot(vrx, vry), dist = nR * t;

      var svg = this._svg;
      svg.innerHTML = "";
      var defs = el("defs", {}, svg);
      var mk = el("marker", { id: "fl", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" }, defs);
      el("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche-axe" }, mk);
      var r0 = this._px(X_MIN, LARG_RIV), r1 = this._px(X_MAX, 0);
      el("rect", { x: r0[0], y: r0[1], width: r1[0] - r0[0], height: r1[1] - r0[1], class: "eau" }, svg);
      // flèches de courant, longueur proportionnelle à c
      if (E.c > 0) {
        for (var cx = -22; cx <= 80; cx += 34) {
          for (var cy = 10; cy <= 30; cy += 20) {
            this._fleche(svg, { x: cx, y: cy }, { x: cx + E.c * 8, y: cy }, "courant", "courant-tete", 7, 3.5);
          }
        }
      }
      [0, LARG_RIV].forEach(function (y) { var a = this._px(X_MIN, y), b = this._px(X_MAX, y); el("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: "rive" }, svg); }, this);
      // repère : x le long de la rive (sens du courant), y vers l'autre rive
      var o = this._px(0, 0), ax = this._px(X_MIN + 2, 0);
      var ox = this._px(X_MAX - 2, -8), oy = this._px(0, -10), oy2 = this._px(0, Y_MAX - 1);
      el("line", { x1: this._px(X_MIN + 4, -8)[0], y1: ox[1], x2: ox[0], y2: ox[1], class: "axe", "marker-end": "url(#fl)" }, svg);
      var tx = el("text", { x: ox[0] - 2, y: ox[1] - 6, class: "repere", "text-anchor": "end" }, svg); tx.textContent = "x (sens du courant)";
      el("line", { x1: oy[0] - 30, y1: oy[1], x2: oy2[0] - 30, y2: oy2[1], class: "axe", "marker-end": "url(#fl)" }, svg);
      var ty = el("text", { x: oy2[0] - 36, y: oy2[1] + 12, class: "repere", "text-anchor": "end" }, svg); ty.textContent = "y";
      var tl = el("text", { x: ax[0] + 2, y: this._px(0, 20)[1] + 4, class: "repere" }, svg); tl.textContent = "40 m";
      // en face
      var pF = this._px(0, LARG_RIV);
      el("line", { x1: o[0], y1: o[1], x2: pF[0], y2: pF[1], class: "enface" }, svg);
      // trajectoire (coupée au bord de la carte)
      var fin = { x: xA, y: LARG_RIV }, dehors = false;
      if (xA > X_MAX || xA < X_MIN) {
        var bord = xA > X_MAX ? X_MAX : X_MIN;
        fin = { x: bord, y: LARG_RIV * bord / xA };
        dehors = true;
      }
      var pfin = this._px(fin.x, fin.y);
      el("line", { x1: o[0], y1: o[1], x2: pfin[0], y2: pfin[1], class: "trajet" }, svg);
      // vitesses (× 18) : parallélogramme v_p, v_c, v_R
      var Pp = { x: vpx * ECH, y: vpy * ECH }, Pc = { x: E.c * ECH, y: 0 }, Pr = { x: vrx * ECH, y: vry * ECH };
      if (E.c > 0) {
        var a1 = this._px(Pp.x, Pp.y), b1 = this._px(Pr.x, Pr.y), a2 = this._px(Pc.x, Pc.y);
        el("line", { x1: a1[0], y1: a1[1], x2: b1[0], y2: b1[1], class: "para" }, svg);
        el("line", { x1: a2[0], y1: a2[1], x2: b1[0], y2: b1[1], class: "para" }, svg);
        this._fleche(svg, { x: 0, y: 0 }, Pc, "vc", "vc-tete");
      }
      this._fleche(svg, { x: 0, y: 0 }, Pp, "vp", "vp-tete");
      this._fleche(svg, { x: 0, y: 0 }, Pr, "vr", "vr-tete");
      var lp = this._px(Pp.x, Pp.y);
      this._etiqSub(svg, lp[0] - 7, lp[1] - 4, "p", "etiq-vp", "end");
      if (E.c > 0) { var lc = this._px(Pc.x, 0); this._etiqSub(svg, lc[0] + 4, lc[1] + 18, "c", "etiq-vc", "start"); }
      var lr = this._px(Pr.x, Pr.y);
      this._etiqSub(svg, lr[0] + 7, lr[1] + 5, "R", "etiq-acc", "start");
      el("circle", { cx: o[0], cy: o[1], r: 4, class: "point" }, svg);
      var eD = el("text", { x: o[0] - 6, y: o[1] + 16, class: "etiq", "text-anchor": "end" }, svg); eD.textContent = "départ";
      el("circle", { cx: pF[0], cy: pF[1], r: 3.5, class: "point" }, svg);
      if (!dehors) {
        el("circle", { cx: pfin[0], cy: pfin[1], r: 5, class: "accostage" }, svg);
        var eA = el("text", { x: Math.max(30, Math.min(LARGEUR - 30, pfin[0])), y: pfin[1] - 9, class: "etiq-acc", "text-anchor": "middle" }, svg);
        eA.textContent = Math.abs(xA) < 0.05 ? "en face" : "accostage";
      }

      // ---------- lecture ----------
      var h = '<div class="carte"><div class="carte-titre">Vitesses en composantes (m/s)</div>' +
        '<span class="c-vp">v<sub>p</sub> = (v · sin θ ; v · cos θ)' + (th === 0 ? ' = (0 ; ' + fmt(vpy, 1) + ')' : ' ≈ (' + fmt(vpx, 2) + ' ; ' + fmt(vpy, 2) + ')') + '</span><br>' +
        '<span class="c-vc">v<sub>c</sub> = (' + fmt(E.c, 1) + ' ; 0)</span><br>' +
        '<span class="c-acc">v<sub>R</sub> = v<sub>p</sub> + v<sub>c</sub>' + (exact(vrx, 2) && exact(vry, 2) ? ' = (' : ' ≈ (') + fmt(vrx, 2) + ' ; ' + fmt(vry, 2) + '), ‖v<sub>R</sub>‖' + rel(nR, 2) + ' m/s</span></div>';
      h += '<div class="carte"><div class="carte-titre">Traversée</div>' +
        'Durée : t = 40 ÷ ' + fmt(vry, 2) + rel(t, 1) + ' s (seule la composante y fait traverser).<br>' +
        'Point d\'accostage : x<sub>A</sub> = ' + fmt(vrx, 2) + ' × t' + rel(xA, 1) + ' m' +
        (Math.abs(xA) < 0.05 ? ' : juste en face du départ.' : xA > 0 ? ' : en aval du point juste en face.' : ' : en amont du point juste en face.') +
        (dehors ? ' (hors de la carte)' : '') + '<br>' +
        'Distance parcourue : ‖v<sub>R</sub>‖ × t' + rel(dist, 1) + ' m.</div>';
      if (Math.abs(xA) < 0.05 && E.c > 0) {
        h += '<div class="carte"><div class="carte-titre">Juste en face</div>x de v<sub>p</sub> = −c = ' + fmt(-E.c, 1) + ' et y de v<sub>p</sub> = √(v² − c²) = √(' + fmt(E.v * E.v, 2) + ' − ' + fmt(E.c * E.c, 2) + ')' + rel(vpy, 2) +
          ' : le nageur vise vers l\'amont, et la traversée dure plus longtemps qu\'en nageant perpendiculairement (' + fmt(LARG_RIV / E.v, 1) + ' s).</div>';
      }
      this._lecture.innerHTML = h;
    }
  }

  if (!customElements.get("traversee-riviere-widget")) {
    customElements.define("traversee-riviere-widget", TraverseeRiviereWidget);
  }
})();
