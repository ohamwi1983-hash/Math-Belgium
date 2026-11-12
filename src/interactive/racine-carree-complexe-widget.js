(function () {
  "use strict";

  /* ================================================================
   * <racine-carree-complexe-widget> — atelier « la racine carrée
   * géométrique » (6e, ch. 5, §2). Le point z se déplace au doigt (ou
   * par les curseurs module/argument) ; ses deux racines carrées ±√z
   * s'affichent : module √|z|, argument divisé par 2. L'argument est
   * suivi de façon CONTINUE (déroulé) : quand z fait un tour complet,
   * chaque racine n'en fait qu'un demi et les deux racines s'échangent —
   * une trace optionnelle le montre. Le système x² − y² = a, 2xy = b est
   * vérifié en direct. Fenêtre FIXE [−4 ; 4]².
   * ================================================================ */

  var NS = "http://www.w3.org/2000/svg";
  var X_MIN = -4, X_MAX = 4, Y_MIN = -4, Y_MAX = 4;
  var LARGEUR = 360, HAUTEUR = 360, MARGE = 18;
  var R_MAX = 3.6;
  var DEFAUT = { r: 2.5, phi: 50 }; // degrés, argument DÉROULÉ (peut dépasser 360°)
  var D2R = Math.PI / 180;

  function arrondi(n, d) {
    var f = Math.pow(10, d);
    var r = Math.round(n * f) / f;
    return Object.is(r, -0) ? 0 : r;
  }
  function fmt(n, d) {
    if (d === undefined) d = 2;
    var s = String(arrondi(n, d));
    if (s.indexOf("e") >= 0) s = arrondi(n, d).toFixed(d);
    return s.replace(".", ",").replace("-", "−");
  }
  function complexe(x, y, d) {
    if (d === undefined) d = 2;
    var a = arrondi(x, d), b = arrondi(y, d);
    var abs = Math.abs(b), coef = abs === 1 ? "" : fmt(abs, d);
    if (b === 0) return fmt(a, d);
    if (a === 0) return (b < 0 ? "−" : "") + coef + "i";
    return fmt(a, d) + (b < 0 ? " − " : " + ") + coef + "i";
  }
  /** Ramène un angle (degrés) dans ]−180 ; 180]. */
  function principal(deg) {
    var t = ((deg % 360) + 360) % 360;
    return t > 180 ? t - 360 : t;
  }
  function svgEl(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:10px;}' +
    'svg{width:100%;max-width:380px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);touch-action:none;user-select:none;-webkit-user-select:none;}' +
    '.grille{stroke:var(--line,#e2d8c8);stroke-width:0.7;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.graduation{font-size:9px;fill:var(--ink-faint,#9a8f84);font-family:var(--sans,sans-serif);}' +
    '.axe-nom{font-size:10px;font-weight:700;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.cercle-z{fill:none;stroke:var(--accent,#a8471f);stroke-width:1;stroke-dasharray:3 3;opacity:0.6;}' +
    '.cercle-r{fill:none;stroke:var(--good,#2f7a4f);stroke-width:1;stroke-dasharray:3 3;opacity:0.7;}' +
    '.vec-z{stroke:var(--accent,#a8471f);stroke-width:2;}' +
    '.vec-r1{stroke:var(--good,#2f7a4f);stroke-width:2.2;}' +
    '.vec-r2{stroke:var(--plan,#6b4fa0);stroke-width:2.2;}' +
    '.arc-z{fill:none;stroke:var(--accent,#a8471f);stroke-width:1.4;}' +
    '.arc-r{fill:none;stroke:var(--good,#2f7a4f);stroke-width:1.4;}' +
    '.trace-z{fill:none;stroke:var(--accent,#a8471f);stroke-width:1.4;opacity:0.45;}' +
    '.trace-r1{fill:none;stroke:var(--good,#2f7a4f);stroke-width:1.6;opacity:0.55;}' +
    '.trace-r2{fill:none;stroke:var(--plan,#6b4fa0);stroke-width:1.6;opacity:0.55;}' +
    '.pt-z{fill:var(--accent,#a8471f);cursor:grab;}' +
    '.pt-r1{fill:var(--good,#2f7a4f);}' +
    '.pt-r2{fill:var(--plan,#6b4fa0);}' +
    '.halo{fill:transparent;cursor:grab;}' +
    '.halo:focus{outline:none;}' +
    '.et{font-size:12px;font-weight:700;font-family:var(--serif,serif);font-style:italic;}' +
    '.et-z{fill:var(--accent-ink,#7a3212);}' +
    '.et-r1{fill:var(--good,#2f7a4f);}' +
    '.et-r2{fill:var(--plan,#6b4fa0);}' +
    '.lecture{text-align:center;font-size:0.92rem;margin:0 0 12px;padding:10px 12px;border-radius:var(--radius,3px);color:var(--ink,#2b2622);background:var(--surface-2,#faf6f0);line-height:1.7;font-variant-numeric:tabular-nums;overflow-wrap:anywhere;}' +
    '.lecture .z{color:var(--accent-ink,#7a3212);font-weight:700;}' +
    '.lecture .r1{color:var(--good,#2f7a4f);font-weight:700;}' +
    '.lecture .r2{color:var(--plan,#6b4fa0);font-weight:700;}' +
    '.calcul{display:block;font-size:0.86rem;color:var(--ink-soft,#6b6055);}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-width:0;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:64px;text-align:right;font-size:0.92rem;}' +
    '.boutons{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;align-items:center;}' +
    '.boutons label{font-size:0.88rem;color:var(--ink-soft,#6b6055);display:flex;align-items:center;gap:6px;}' +
    'button{padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;}' +
    'button:disabled{opacity:0.6;cursor:default;}' +
    '</style>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" role="img" aria-label="Plan complexe : z et ses deux racines carrées"></svg></div>' +
    '<p class="lecture" id="lecture"></p>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="r">|z| (module)</label><div class="curseur-row">' +
    '<input type="range" id="r" min="0.2" max="' + R_MAX + '" step="0.05" value="' + DEFAUT.r + '">' +
    '<span class="curseur-valeur" id="r-valeur"></span></div></div>' +
    '<div class="curseur"><label for="phi">arg(z), suivi sur deux tours</label><div class="curseur-row">' +
    '<input type="range" id="phi" min="0" max="720" step="1" value="' + DEFAUT.phi + '">' +
    '<span class="curseur-valeur" id="phi-valeur"></span></div></div>' +
    '<div class="boutons">' +
    '<button type="button" id="tour">Faire faire un tour à z</button>' +
    '<label><input type="checkbox" id="trace" checked> Montrer la trace</label>' +
    '<button type="button" id="reset">Réinitialiser</button>' +
    '</div></div>';

  class RacineCarreeComplexeWidget extends HTMLElement {
    constructor() {
      super();
      var s = this.attachShadow({ mode: "open" });
      s.appendChild(TEMPLATE.content.cloneNode(true));
      this._r = DEFAUT.r;
      this._phi = DEFAUT.phi;
      this._depart = DEFAUT.phi; // début de la trace
      this._drag = false;
      this._anim = null;
      this._svg = s.getElementById("svg");
      this._lecture = s.getElementById("lecture");
      this._inR = s.getElementById("r");
      this._inPhi = s.getElementById("phi");
      this._valR = s.getElementById("r-valeur");
      this._valPhi = s.getElementById("phi-valeur");
      this._btnTour = s.getElementById("tour");
      this._chkTrace = s.getElementById("trace");
      this._btnReset = s.getElementById("reset");
    }

    connectedCallback() {
      var self = this;
      this._onR = function () { self._stop(); self._r = parseFloat(self._inR.value); self._rendre(); };
      this._onPhi = function () { self._stop(); self._phi = parseFloat(self._inPhi.value); self._rendre(); };
      this._onTrace = function () { self._rendre(); };
      this._onReset = function () {
        self._stop();
        self._r = DEFAUT.r; self._phi = DEFAUT.phi; self._depart = DEFAUT.phi;
        self._rendre();
      };
      this._onTour = function () { self._tour(); };
      this._onDown = function (e) {
        if (!(e.target.getAttribute && e.target.getAttribute("data-pt"))) return;
        e.preventDefault();
        self._stop();
        self._drag = true;
        try { self._svg.setPointerCapture(e.pointerId); } catch { /* ignore */ }
      };
      this._onMove = function (e) {
        if (!self._drag) return;
        e.preventDefault();
        self._deplacer(e);
      };
      this._onUp = function (e) {
        self._drag = false;
        try { self._svg.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
      };
      this._onKey = function (e) {
        if (!(e.target.getAttribute && e.target.getAttribute("data-pt"))) return;
        var d = { ArrowLeft: [0, 5], ArrowRight: [0, -5], ArrowUp: [0.1, 0], ArrowDown: [-0.1, 0] }[e.key];
        if (!d) return;
        e.preventDefault();
        self._r = Math.max(0.2, Math.min(R_MAX, self._r + d[0]));
        self._phi = Math.max(0, Math.min(720, self._phi + d[1]));
        self._rendre();
        var h = self._svg.querySelector("[data-pt]");
        if (h) h.focus();
      };
      this._inR.addEventListener("input", this._onR);
      this._inPhi.addEventListener("input", this._onPhi);
      this._chkTrace.addEventListener("change", this._onTrace);
      this._btnReset.addEventListener("click", this._onReset);
      this._btnTour.addEventListener("click", this._onTour);
      this._svg.addEventListener("pointerdown", this._onDown);
      this._svg.addEventListener("pointermove", this._onMove);
      this._svg.addEventListener("pointerup", this._onUp);
      this._svg.addEventListener("pointercancel", this._onUp);
      this._svg.addEventListener("keydown", this._onKey);
      this._rendre();
    }

    disconnectedCallback() {
      this._stop();
      this._inR.removeEventListener("input", this._onR);
      this._inPhi.removeEventListener("input", this._onPhi);
      this._chkTrace.removeEventListener("change", this._onTrace);
      this._btnReset.removeEventListener("click", this._onReset);
      this._btnTour.removeEventListener("click", this._onTour);
      this._svg.removeEventListener("pointerdown", this._onDown);
      this._svg.removeEventListener("pointermove", this._onMove);
      this._svg.removeEventListener("pointerup", this._onUp);
      this._svg.removeEventListener("pointercancel", this._onUp);
      this._svg.removeEventListener("keydown", this._onKey);
    }

    _stop() {
      if (this._anim) { cancelAnimationFrame(this._anim); this._anim = null; }
      this._btnTour.disabled = false;
    }

    /** Anime +360° d'argument (repart de 0 si on dépasse les deux tours). */
    _tour() {
      var self = this;
      this._stop();
      if (this._phi > 360) this._phi = this._phi - 360;
      var debut = this._phi, fin = debut + 360, t0 = null, duree = 3200;
      this._depart = debut;
      this._btnTour.disabled = true;
      var pas = function (t) {
        if (t0 === null) t0 = t;
        var u = Math.min(1, (t - t0) / duree);
        self._phi = debut + 360 * u;
        self._rendre();
        if (u < 1) self._anim = requestAnimationFrame(pas);
        else { self._phi = fin; self._anim = null; self._btnTour.disabled = false; self._rendre(); }
      };
      this._anim = requestAnimationFrame(pas);
    }

    _px(x, y) {
      return [
        MARGE + (x - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - 2 * MARGE),
        HAUTEUR - MARGE - (y - Y_MIN) / (Y_MAX - Y_MIN) * (HAUTEUR - 2 * MARGE),
      ];
    }

    _deplacer(e) {
      var ctm = this._svg.getScreenCTM();
      if (!ctm) return;
      var pt = this._svg.createSVGPoint();
      pt.x = e.clientX; pt.y = e.clientY;
      var loc = pt.matrixTransform(ctm.inverse());
      var x = X_MIN + (loc.x - MARGE) / (LARGEUR - 2 * MARGE) * (X_MAX - X_MIN);
      var y = Y_MIN + (HAUTEUR - MARGE - loc.y) / (HAUTEUR - 2 * MARGE) * (Y_MAX - Y_MIN);
      var r = Math.hypot(x, y);
      if (r < 0.2) return;
      this._r = Math.min(R_MAX, Math.round(r * 20) / 20);
      // Argument DÉROULÉ : on ajoute le plus petit écart au précédent.
      var a = Math.atan2(y, x) / D2R;
      var ecart = principal(a - this._phi);
      this._phi = Math.max(0, Math.min(720, this._phi + ecart));
      this._rendre();
    }

    _rendre() {
      var self = this, svg = this._svg;
      var r = this._r, phi = this._phi;
      this._inR.value = String(r);
      this._inPhi.value = String(Math.round(phi));
      this._valR.textContent = fmt(r, 2);
      this._valPhi.textContent = fmt(phi, 0) + "°";

      var z = { x: r * Math.cos(phi * D2R), y: r * Math.sin(phi * D2R) };
      var rr = Math.sqrt(r);
      var r1 = { x: rr * Math.cos(phi / 2 * D2R), y: rr * Math.sin(phi / 2 * D2R) };
      var r2 = { x: -r1.x, y: -r1.y };

      svg.innerHTML = "";
      var defs = svgEl("defs", {});
      var m = svgEl("marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      m.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(m);
      svg.appendChild(defs);

      for (var k = X_MIN + 1; k < X_MAX; k++) {
        if (k === 0) continue;
        var gx = self._px(k, 0)[0], gy = self._px(0, k)[1];
        svg.appendChild(svgEl("line", { x1: gx, x2: gx, y1: MARGE, y2: HAUTEUR - MARGE, class: "grille" }));
        svg.appendChild(svgEl("line", { x1: MARGE, x2: LARGEUR - MARGE, y1: gy, y2: gy, class: "grille" }));
        var o = self._px(0, 0);
        var tx = svgEl("text", { x: gx, y: o[1] + 12, "text-anchor": "middle", class: "graduation" });
        tx.textContent = fmt(k);
        svg.appendChild(tx);
        var ty = svgEl("text", { x: o[0] - 5, y: gy + 3, "text-anchor": "end", class: "graduation" });
        ty.textContent = fmt(k) + "i";
        svg.appendChild(ty);
      }
      var O = self._px(0, 0);
      svg.appendChild(svgEl("line", { x1: MARGE, x2: LARGEUR - MARGE, y1: O[1], y2: O[1], class: "axe", "marker-end": "url(#fleche)" }));
      svg.appendChild(svgEl("line", { x1: O[0], x2: O[0], y1: HAUTEUR - MARGE, y2: MARGE, class: "axe", "marker-end": "url(#fleche)" }));
      var re = svgEl("text", { x: LARGEUR - MARGE - 2, y: O[1] - 6, "text-anchor": "end", class: "axe-nom" });
      re.textContent = "Re";
      svg.appendChild(re);
      var im = svgEl("text", { x: O[0] + 6, y: MARGE + 8, class: "axe-nom" });
      im.textContent = "Im";
      svg.appendChild(im);

      var echelle = (LARGEUR - 2 * MARGE) / (X_MAX - X_MIN);
      svg.appendChild(svgEl("circle", { cx: O[0], cy: O[1], r: (r * echelle).toFixed(2), class: "cercle-z" }));
      svg.appendChild(svgEl("circle", { cx: O[0], cy: O[1], r: (rr * echelle).toFixed(2), class: "cercle-r" }));

      var chemin = function (rayon, a0, a1) {
        var n = Math.max(2, Math.ceil(Math.abs(a1 - a0) / 3));
        var d = "";
        for (var i = 0; i <= n; i++) {
          var a = (a0 + (a1 - a0) * i / n) * D2R;
          var P = self._px(rayon * Math.cos(a), rayon * Math.sin(a));
          d += (i ? " L" : "M") + P[0].toFixed(2) + "," + P[1].toFixed(2);
        }
        return d;
      };

      // Arcs d'angle : arg(z) (petit rayon) et arg(z)/2 (rayon un peu plus grand), sur le tour courant.
      var phiP = ((phi % 360) + 360) % 360;
      if (phiP > 0.5) {
        svg.appendChild(svgEl("path", { d: chemin(0.45, 0, phiP), class: "arc-z" }));
      }
      var demi = ((phi / 2) % 360 + 360) % 360;
      if (demi > 0.5) svg.appendChild(svgEl("path", { d: chemin(0.7, 0, demi), class: "arc-r" }));

      if (this._chkTrace.checked && Math.abs(phi - this._depart) > 1) {
        var a0 = Math.min(this._depart, phi), a1 = Math.max(this._depart, phi);
        svg.appendChild(svgEl("path", { d: chemin(r, a0, a1), class: "trace-z" }));
        svg.appendChild(svgEl("path", { d: chemin(rr, a0 / 2, a1 / 2), class: "trace-r1" }));
        svg.appendChild(svgEl("path", { d: chemin(rr, a0 / 2 + 180, a1 / 2 + 180), class: "trace-r2" }));
      }

      var vec = function (p, cls) {
        var P = self._px(p.x, p.y);
        svg.appendChild(svgEl("line", { x1: O[0], y1: O[1], x2: P[0].toFixed(2), y2: P[1].toFixed(2), class: cls }));
      };
      vec(z, "vec-z"); vec(r1, "vec-r1"); vec(r2, "vec-r2");

      // Étiquette poussée RADIALEMENT vers l'extérieur (jamais sur le vecteur), ancrée selon le côté.
      var etiquette = function (p, texte, cls) {
        var P = self._px(p.x, p.y);
        var n = Math.hypot(p.x, p.y) || 1, ux = p.x / n, uy = p.y / n;
        var x = P[0] + 13 * ux, y = P[1] - 13 * uy + 4;
        var ancre = ux > 0.35 ? "start" : (ux < -0.35 ? "end" : "middle");
        if (x > LARGEUR - 40) ancre = "end";
        if (x < 40) ancre = "start";
        y = Math.max(14, Math.min(HAUTEUR - 6, y));
        var el = svgEl("text", { x: x.toFixed(2), y: y.toFixed(2), "text-anchor": ancre, class: "et " + cls });
        el.textContent = texte;
        svg.appendChild(el);
      };
      var point = function (p, cls) {
        var P = self._px(p.x, p.y);
        svg.appendChild(svgEl("circle", { cx: P[0].toFixed(2), cy: P[1].toFixed(2), r: 5.5, class: cls }));
      };
      point(r1, "pt-r1"); etiquette(r1, "z₀", "et-r1");
      point(r2, "pt-r2"); etiquette(r2, "−z₀", "et-r2");
      point(z, "pt-z"); etiquette(z, "z", "et-z");
      var Pz = self._px(z.x, z.y);
      svg.appendChild(svgEl("circle", { cx: Pz[0].toFixed(2), cy: Pz[1].toFixed(2), r: 16, class: "halo", "data-pt": "z", tabindex: "0", role: "slider", "aria-label": "point z = " + complexe(z.x, z.y) }));

      // Lecture : z, ses racines, vérification du système.
      var x = r1.x, y = r1.y;
      var tours = phi >= 360 ? " — z a fait un tour : z₀ est arrivée là où était −z₀" : "";
      this._lecture.innerHTML =
        '<span class="z">z = ' + complexe(z.x, z.y) + "</span> ; |z| = " + fmt(r) + " ; arg(z) = " + fmt(principal(phi), 0) + "°<br>" +
        '<span class="r1">z₀ ≈ ' + complexe(x, y) + "</span> et " +
        '<span class="r2">−z₀ ≈ ' + complexe(-x, -y) + "</span>" +
        '<span class="calcul">module √|z| = √' + fmt(r) + " ≈ " + fmt(rr) + " ; argument de z₀ : " + (phi >= 360 ? "φ/2 avec φ = " + fmt(phi, 0) + "° (argument de z suivi en continu), soit " : "arg(z)/2 = ") + fmt(phi / 2, 0) + "° ; −z₀ : " + fmt(((phi / 2 + 180) % 360), 0) + "°" + tours + "</span>" +
        '<span class="calcul">avec z₀ = x + yi : x² − y² ≈ ' + fmt(x * x - y * y) + " = a et 2xy ≈ " + fmt(2 * x * y) + " = b, les parties réelle et imaginaire de z</span>";
    }
  }

  if (!customElements.get("racine-carree-complexe-widget")) {
    customElements.define("racine-carree-complexe-widget", RacineCarreeComplexeWidget);
  }
})();
