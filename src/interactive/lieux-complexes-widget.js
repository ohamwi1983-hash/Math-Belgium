(function () {
  "use strict";

  /* ================================================================
   * <lieux-complexes-widget> — atelier interactif (6e, ch. 5, §9
   * « Problèmes avancés ») : on choisit une condition sur z, puis on
   * promène le point M (glisser au doigt/à la souris, ou curseurs x, y).
   * M devient vert quand il vérifie la condition (tolérance de quelques
   * pixels) et chaque position valide laisse un point : le lieu se
   * dessine peu à peu. Le bouton « Montrer le lieu » le trace en entier.
   * Conditions : |z − a| = k (cercle), arg(z − a) ≡ θ₀ mod 2π (demi-
   * droite, A exclu), arg(z − a) ≡ θ₀ mod π (droite privée de A),
   * |z − a| = |z − b| (médiatrice). Sur le mauvais rayon en mode
   * « mod 2π », le texte explique pourquoi M échoue : c'est la
   * différence demi-droite / droite du piège de la section.
   * Fenêtre FIXE, repère orthonormé. Web Component (Shadow DOM).
   * ================================================================ */

  var X_MIN = -4, X_MAX = 4, Y_MIN = -4, Y_MAX = 4;
  var MARGE = 26, ECHELLE = 40;
  var LARGEUR = 2 * MARGE + (X_MAX - X_MIN) * ECHELLE;
  var HAUTEUR = 2 * MARGE + (Y_MAX - Y_MIN) * ECHELLE;
  var TOLERANCE = 0.12;      // en unités (≈ 5 px)
  var RAYON_EXCLU = 0.15;    // M trop proche de A : argument non défini
  var TRACE_MAX = 1500;
  var EPS = 1e-9;

  var A = { x: 1, y: 1 };
  var K = 2;
  var THETA0_DEG = 30;
  var MED_A = { x: 1, y: 0 }, MED_B = { x: 0, y: -1 };

  var CONDITIONS = {
    cercle: { libelle: "|z − (1 + i)| = 2", option: "|z − a| = k : cercle" },
    demi: { libelle: "arg(z − (1 + i)) ≡ π/6 (mod 2π)", option: "arg(z − a) ≡ θ₀ (mod 2π)" },
    droite: { libelle: "arg(z − (1 + i)) ≡ π/6 (mod π)", option: "arg(z − a) ≡ θ₀ (mod π)" },
    mediatrice: { libelle: "|z − 1| = |z + i|", option: "|z − a| = |z − b|" },
  };
  var DEFAUT = { condition: "demi", mx: -1.6, my: -0.5 };

  function nombreFr(n, decimales) {
    var facteur = Math.pow(10, decimales);
    var arrondi = Math.round(n * facteur) / facteur;
    if (Object.is(arrondi, -0) || Math.abs(arrondi) < EPS) arrondi = 0;
    return arrondi.toFixed(decimales).replace(".", ",").replace("-", "−");
  }

  function svgEl(tag, attrs) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var key in attrs) el.setAttribute(key, attrs[key]);
    return el;
  }

  function toPx(x, y) {
    return [MARGE + (x - X_MIN) * ECHELLE, HAUTEUR - MARGE - (y - Y_MIN) * ECHELLE];
  }

  function borner(v, a, b) { return Math.max(a, Math.min(b, v)); }

  /** Angle en degrés dans ]−180 ; 180]. */
  function angleDeg(dx, dy) {
    var a = Math.atan2(dy, dx) * 180 / Math.PI;
    if (a <= -180 + 1e-9) a += 360;
    return a;
  }

  /** Point où la demi-droite issue de p, de direction (ux, uy), sort du cadre. */
  function sortieCadre(p, ux, uy) {
    var t = Infinity;
    if (ux > EPS) t = Math.min(t, (X_MAX - p.x) / ux);
    if (ux < -EPS) t = Math.min(t, (X_MIN - p.x) / ux);
    if (uy > EPS) t = Math.min(t, (Y_MAX - p.y) / uy);
    if (uy < -EPS) t = Math.min(t, (Y_MIN - p.y) / uy);
    return { x: p.x + t * ux, y: p.y + t * uy };
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.choix{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px;margin-bottom:10px;}' +
    '.choix label{font-weight:700;color:var(--accent-ink,#7a3212);font-size:0.9rem;}' +
    'select{max-width:100%;padding:6px 8px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#2b2620);font-family:inherit;font-size:0.9rem;}' +
    '.condition{text-align:center;font-family:var(--serif,serif);font-style:italic;font-weight:700;font-size:1.05rem;color:var(--accent-ink,#7a3212);margin:0 0 10px;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:' + LARGEUR + 'px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);touch-action:none;cursor:crosshair;user-select:none;}' +
    '.grille{stroke:var(--line,#e2d8c8);stroke-width:0.7;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.graduation{font-size:9px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.nom-axe{font-size:10px;font-weight:700;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.lieu{fill:none;stroke:var(--plan,#5b4ea3);stroke-width:2.4;opacity:0.85;}' +
    '.lieu-exclu{fill:var(--surface-2,#faf6f0);stroke:var(--plan,#5b4ea3);stroke-width:2;}' +
    '.segment-ab{stroke:var(--ink-soft,#6b6055);stroke-width:1.2;stroke-dasharray:4 3;}' +
    '.trace{fill:var(--good,#2f7a4f);opacity:0.55;}' +
    '.point-fixe{fill:var(--ink,#2b2620);}' +
    '.liaison{stroke:var(--ink-soft,#6b6055);stroke-width:1.1;stroke-dasharray:3 3;}' +
    '.m-ok{fill:var(--good,#2f7a4f);stroke:var(--surface,#fff);stroke-width:2;}' +
    '.m-non{fill:var(--bad,#b23a3a);stroke:var(--surface,#fff);stroke-width:2;}' +
    '.halo-ok{fill:var(--good,#2f7a4f);opacity:0.18;}' +
    '.etiquette{font-size:11px;font-weight:700;fill:var(--ink,#2b2620);font-family:var(--sans,sans-serif);}' +
    '.etiquette-m{font-size:12px;font-weight:700;font-family:var(--sans,sans-serif);}' +
    '.etiquette-m.ok{fill:var(--good,#2f7a4f);}' +
    '.etiquette-m.non{fill:var(--bad,#b23a3a);}' +
    '.lecture{text-align:center;font-size:0.88rem;font-weight:600;margin:0 0 8px;padding:10px 14px;border-radius:var(--radius,3px);color:var(--ink,#2b2620);background:var(--surface-2,#faf6f0);line-height:1.7;font-variant-numeric:tabular-nums;}' +
    '.verdict{text-align:center;font-size:0.88rem;font-weight:700;margin:0 0 16px;padding:8px 12px;border-radius:var(--radius,3px);}' +
    '.verdict.ok{color:var(--good,#2f7a4f);background:var(--good-soft,#e3f1e8);}' +
    '.verdict.non{color:var(--bad,#b23a3a);background:var(--bad-soft,#f7e1e1);}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-width:0;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:52px;text-align:right;font-size:0.92rem;}' +
    '.boutons{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;}' +
    'button{padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;}' +
    'button:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    'button[aria-pressed="true"]{background:var(--plan,#5b4ea3);border-color:var(--plan,#5b4ea3);color:#fff;}' +
    '.consigne{text-align:center;font-size:0.82rem;color:var(--ink-soft,#6b6055);margin:0 0 10px;}' +
    '</style>' +
    '<div class="choix"><label for="condition">Condition</label><select id="condition">' +
    Object.keys(CONDITIONS).map(function (k) { return '<option value="' + k + '">' + CONDITIONS[k].option + '</option>'; }).join("") +
    '</select></div>' +
    '<p class="condition" id="libelle"></p>' +
    '<p class="consigne">Fais glisser le point M dans le repère (ou utilise les curseurs x et y).</p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Plan d\'Argand avec le point M"></svg></div>' +
    '<p class="lecture" id="lecture"></p>' +
    '<p class="verdict" id="verdict"></p>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="mx">x = Re(z)</label><div class="curseur-row">' +
    '<input type="range" id="mx" min="' + X_MIN + '" max="' + X_MAX + '" step="0.05" value="' + DEFAUT.mx + '">' +
    '<span class="curseur-valeur" id="mx-valeur"></span></div></div>' +
    '<div class="curseur"><label for="my">y = Im(z)</label><div class="curseur-row">' +
    '<input type="range" id="my" min="' + Y_MIN + '" max="' + Y_MAX + '" step="0.05" value="' + DEFAUT.my + '">' +
    '<span class="curseur-valeur" id="my-valeur"></span></div></div>' +
    '<div class="boutons">' +
    '<button type="button" id="montrer" aria-pressed="false">Montrer le lieu</button>' +
    '<button type="button" id="effacer">Effacer la trace</button>' +
    '</div>' +
    '</div>';

  class LieuxComplexesWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._condition = DEFAUT.condition;
      this._m = { x: DEFAUT.mx, y: DEFAUT.my };
      this._trace = [];
      this._montrer = false;
      this._glisse = false;
      this._svg = shadow.getElementById("svg");
      this._select = shadow.getElementById("condition");
      this._libelle = shadow.getElementById("libelle");
      this._lecture = shadow.getElementById("lecture");
      this._verdict = shadow.getElementById("verdict");
      this._inputX = shadow.getElementById("mx");
      this._inputY = shadow.getElementById("my");
      this._valeurX = shadow.getElementById("mx-valeur");
      this._valeurY = shadow.getElementById("my-valeur");
      this._btnMontrer = shadow.getElementById("montrer");
      this._btnEffacer = shadow.getElementById("effacer");
      this._select.value = this._condition;
    }

    connectedCallback() {
      var self = this;
      this._onSelect = function () {
        self._condition = self._select.value;
        self._trace = [];
        self._rendre(false);
      };
      this._onX = function () { self._deplacer(parseFloat(self._inputX.value), self._m.y, false); };
      this._onY = function () { self._deplacer(self._m.x, parseFloat(self._inputY.value), false); };
      this._onMontrer = function () { self._montrer = !self._montrer; self._rendre(false); };
      this._onEffacer = function () { self._trace = []; self._rendre(false); };
      this._onDown = function (evt) {
        self._glisse = true;
        try { self._svg.setPointerCapture(evt.pointerId); } catch { /* capture facultative */ }
        self._depuisPointeur(evt);
        evt.preventDefault();
      };
      this._onMove = function (evt) { if (self._glisse) { self._depuisPointeur(evt); evt.preventDefault(); } };
      this._onUp = function () { self._glisse = false; };
      this._select.addEventListener("change", this._onSelect);
      this._inputX.addEventListener("input", this._onX);
      this._inputY.addEventListener("input", this._onY);
      this._btnMontrer.addEventListener("click", this._onMontrer);
      this._btnEffacer.addEventListener("click", this._onEffacer);
      this._svg.addEventListener("pointerdown", this._onDown);
      this._svg.addEventListener("pointermove", this._onMove);
      this._svg.addEventListener("pointerup", this._onUp);
      this._svg.addEventListener("pointercancel", this._onUp);
      this._rendre(false);
    }

    disconnectedCallback() {
      this._select.removeEventListener("change", this._onSelect);
      this._inputX.removeEventListener("input", this._onX);
      this._inputY.removeEventListener("input", this._onY);
      this._btnMontrer.removeEventListener("click", this._onMontrer);
      this._btnEffacer.removeEventListener("click", this._onEffacer);
      this._svg.removeEventListener("pointerdown", this._onDown);
      this._svg.removeEventListener("pointermove", this._onMove);
      this._svg.removeEventListener("pointerup", this._onUp);
      this._svg.removeEventListener("pointercancel", this._onUp);
    }

    _depuisPointeur(evt) {
      var ctm = this._svg.getScreenCTM();
      if (!ctm) return;
      var pt = this._svg.createSVGPoint();
      pt.x = evt.clientX; pt.y = evt.clientY;
      var p = pt.matrixTransform(ctm.inverse());
      var x = X_MIN + (p.x - MARGE) / ECHELLE;
      var y = Y_MIN + (HAUTEUR - MARGE - p.y) / ECHELLE;
      this._deplacer(x, y, true);
    }

    _deplacer(x, y, depuisPointeur) {
      this._m = { x: borner(x, X_MIN, X_MAX), y: borner(y, Y_MIN, Y_MAX) };
      if (depuisPointeur) {
        this._inputX.value = String(this._m.x);
        this._inputY.value = String(this._m.y);
      }
      this._rendre(true);
    }

    /** { ok, texte, explication } pour la position courante de M. */
    _evaluer() {
      var m = this._m, c = this._condition;
      if (c === "cercle") {
        var d = Math.hypot(m.x - A.x, m.y - A.y);
        var ok = Math.abs(d - K) < TOLERANCE;
        return {
          ok: ok,
          texte: "|z − (1 + i)| = AM ≈ " + nombreFr(d, 2) + "   (il faut 2)",
          explication: ok ? "M est à la distance 2 de A : il est sur le cercle de centre A et de rayon 2."
            : "AM ≠ 2 : M n'est pas sur le cercle de centre A et de rayon 2.",
        };
      }
      if (c === "demi" || c === "droite") {
        var dx = m.x - A.x, dy = m.y - A.y, dist = Math.hypot(dx, dy);
        if (dist < RAYON_EXCLU) {
          return {
            ok: false,
            texte: "z − (1 + i) ≈ 0",
            explication: "M est en A : z − (1 + i) = 0 n'a pas d'argument, le point A est exclu du lieu.",
          };
        }
        var u = { x: Math.cos(THETA0_DEG * Math.PI / 180), y: Math.sin(THETA0_DEG * Math.PI / 180) };
        var t = dx * u.x + dy * u.y;
        var ecart = Math.abs(dx * u.y - dy * u.x);
        var arg = angleDeg(dx, dy);
        var surDroite = ecart < TOLERANCE;
        var texte = "arg(z − (1 + i)) ≈ " + nombreFr(arg, 0) + "°   (π/6 = 30°)";
        if (c === "demi") {
          var okDemi = surDroite && t > 0;
          return {
            ok: okDemi,
            texte: texte,
            explication: okDemi ? "L'argument vaut 30° à 2π près : M est sur la demi-droite d'origine A (exclue)."
              : surDroite ? "M est sur la droite, mais du MAUVAIS côté de A : l'argument vaut " + nombreFr(arg, 0) + "°, soit 30° à π près seulement, pas à 2π près."
                : "L'argument n'est pas égal à 30° à 2π près.",
          };
        }
        return {
          ok: surDroite,
          texte: texte,
          explication: surDroite ? (t > 0 ? "Argument égal à 30° : vrai à π près, M est sur la droite (privée de A)."
            : "Argument égal à " + nombreFr(arg, 0) + "° = 30° − 180° : vrai à π près, M est aussi sur la droite (privée de A).")
            : "L'argument n'est égal ni à 30° ni à −150° : M n'est pas sur la droite.",
        };
      }
      var da = Math.hypot(m.x - MED_A.x, m.y - MED_A.y), db = Math.hypot(m.x - MED_B.x, m.y - MED_B.y);
      // Distance de M à la médiatrice : (MA² − MB²) / (2·AB).
      var ab = Math.hypot(MED_A.x - MED_B.x, MED_A.y - MED_B.y);
      var okMed = Math.abs((da * da - db * db) / (2 * ab)) < TOLERANCE;
      return {
        ok: okMed,
        texte: "|z − 1| = MA ≈ " + nombreFr(da, 2) + "   ;   |z + i| = MB ≈ " + nombreFr(db, 2),
        explication: okMed ? "MA = MB : M est à égale distance de A et de B, sur la médiatrice de [AB] (la droite y = −x)."
          : "MA ≠ MB : M est plus proche de " + (da < db ? "A" : "B") + " que de " + (da < db ? "B" : "A") + ".",
      };
    }

    _rendre(enregistrer) {
      var c = this._condition, m = this._m;
      this._libelle.textContent = CONDITIONS[c].libelle;
      this._valeurX.textContent = nombreFr(m.x, 2);
      this._valeurY.textContent = nombreFr(m.y, 2);
      this._btnMontrer.setAttribute("aria-pressed", this._montrer ? "true" : "false");
      this._btnMontrer.textContent = this._montrer ? "Cacher le lieu" : "Montrer le lieu";

      var ev = this._evaluer();
      if (enregistrer && ev.ok) {
        this._trace.push({ x: m.x, y: m.y });
        if (this._trace.length > TRACE_MAX) this._trace.shift();
      }

      var svg = this._svg;
      svg.innerHTML = "";
      var defs = svgEl("defs", {});
      var marqueur = svgEl("marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      marqueur.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(marqueur);
      var clip = svgEl("clipPath", { id: "cadre" });
      clip.appendChild(svgEl("rect", { x: MARGE, y: MARGE, width: LARGEUR - 2 * MARGE, height: HAUTEUR - 2 * MARGE }));
      defs.appendChild(clip);
      svg.appendChild(defs);

      for (var g = X_MIN + 1; g < X_MAX; g++) {
        var gx = toPx(g, 0)[0], gy = toPx(0, g)[1];
        svg.appendChild(svgEl("line", { x1: gx, x2: gx, y1: MARGE, y2: HAUTEUR - MARGE, class: "grille" }));
        svg.appendChild(svgEl("line", { x1: MARGE, x2: LARGEUR - MARGE, y1: gy, y2: gy, class: "grille" }));
      }
      var o = toPx(0, 0);
      svg.appendChild(svgEl("line", { x1: MARGE - 6, x2: LARGEUR - MARGE + 8, y1: o[1], y2: o[1], class: "axe", "marker-end": "url(#fleche)" }));
      svg.appendChild(svgEl("line", { x1: o[0], x2: o[0], y1: HAUTEUR - MARGE + 6, y2: MARGE - 8, class: "axe", "marker-end": "url(#fleche)" }));
      var nomRe = svgEl("text", { x: LARGEUR - MARGE + 2, y: o[1] - 8, "text-anchor": "end", class: "nom-axe" });
      nomRe.textContent = "Re";
      svg.appendChild(nomRe);
      var nomIm = svgEl("text", { x: o[0] + 8, y: MARGE - 2, class: "nom-axe" });
      nomIm.textContent = "Im";
      svg.appendChild(nomIm);
      [-3, -2, -1, 1, 2, 3].forEach(function (v) {
        var px = toPx(v, 0), py = toPx(0, v);
        var tx = svgEl("text", { x: px[0], y: px[1] + 13, "text-anchor": "middle", class: "graduation" });
        tx.textContent = nombreFr(v, 0);
        svg.appendChild(tx);
        var ty = svgEl("text", { x: py[0] - 5, y: py[1] + 3, "text-anchor": "end", class: "graduation" });
        ty.textContent = (v === 1 ? "" : v === -1 ? "−" : nombreFr(v, 0)) + "i";
        svg.appendChild(ty);
      });

      var groupe = svgEl("g", { "clip-path": "url(#cadre)" });
      svg.appendChild(groupe);

      // Le lieu complet (bouton « Montrer le lieu »).
      if (this._montrer) {
        var pa = toPx(A.x, A.y);
        if (c === "cercle") {
          groupe.appendChild(svgEl("circle", { cx: pa[0], cy: pa[1], r: K * ECHELLE, class: "lieu" }));
        } else if (c === "demi" || c === "droite") {
          var ux = Math.cos(THETA0_DEG * Math.PI / 180), uy = Math.sin(THETA0_DEG * Math.PI / 180);
          var fin = toPx.apply(null, (function (s) { return [s.x, s.y]; })(sortieCadre(A, ux, uy)));
          var debut = c === "droite" ? toPx.apply(null, (function (s) { return [s.x, s.y]; })(sortieCadre(A, -ux, -uy))) : pa;
          groupe.appendChild(svgEl("line", { x1: debut[0], y1: debut[1], x2: fin[0], y2: fin[1], class: "lieu" }));
          groupe.appendChild(svgEl("circle", { cx: pa[0], cy: pa[1], r: 5, class: "lieu-exclu" }));
        } else {
          var p1 = toPx(X_MIN, -X_MIN), p2 = toPx(X_MAX, -X_MAX);
          groupe.appendChild(svgEl("line", { x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1], class: "lieu" }));
        }
      }
      if (c === "mediatrice") {
        var qa = toPx(MED_A.x, MED_A.y), qb = toPx(MED_B.x, MED_B.y);
        groupe.appendChild(svgEl("line", { x1: qa[0], y1: qa[1], x2: qb[0], y2: qb[1], class: "segment-ab" }));
      }

      // Trace : positions valides déjà visitées.
      this._trace.forEach(function (p) {
        var q = toPx(p.x, p.y);
        groupe.appendChild(svgEl("circle", { cx: q[0].toFixed(1), cy: q[1].toFixed(1), r: 2.4, class: "trace" }));
      });

      // Points fixes et liaisons vers M.
      var pm = toPx(m.x, m.y);
      function pointFixe(p, nom, placement) {
        var q = toPx(p.x, p.y);
        svg.appendChild(svgEl("circle", { cx: q[0], cy: q[1], r: 4, class: "point-fixe" }));
        var t = svgEl("text", { x: q[0] + (placement === "gauche" ? -7 : 7), y: q[1] + (placement === "dessous" ? 15 : -7), "text-anchor": placement === "gauche" ? "end" : "start", class: "etiquette" });
        t.textContent = nom;
        svg.appendChild(t);
      }
      if (c === "mediatrice") {
        [MED_A, MED_B].forEach(function (p) {
          var q = toPx(p.x, p.y);
          svg.appendChild(svgEl("line", { x1: q[0], y1: q[1], x2: pm[0].toFixed(2), y2: pm[1].toFixed(2), class: "liaison" }));
        });
        pointFixe(MED_A, "A(1)", "dessus");
        pointFixe(MED_B, "B(−i)", "dessous");
      } else {
        var qa2 = toPx(A.x, A.y);
        svg.appendChild(svgEl("line", { x1: qa2[0], y1: qa2[1], x2: pm[0].toFixed(2), y2: pm[1].toFixed(2), class: "liaison" }));
        if (!(this._montrer && c !== "cercle")) pointFixe(A, "A(1 + i)", "gauche");
        else {
          // À gauche de A : la demi-droite/droite part vers la droite (θ₀ = 30°), l'étiquette ne la recouvre pas.
          var tA = svgEl("text", { x: qa2[0] - 7, y: qa2[1] - 7, "text-anchor": "end", class: "etiquette" });
          tA.textContent = "A(1 + i)";
          svg.appendChild(tA);
        }
      }

      // Le point M.
      if (ev.ok) svg.appendChild(svgEl("circle", { cx: pm[0].toFixed(2), cy: pm[1].toFixed(2), r: 13, class: "halo-ok" }));
      svg.appendChild(svgEl("circle", { cx: pm[0].toFixed(2), cy: pm[1].toFixed(2), r: 7, class: ev.ok ? "m-ok" : "m-non" }));
      var droite = pm[0] > LARGEUR - 60, haut = pm[1] < MARGE + 20;
      var tm = svgEl("text", { x: (pm[0] + (droite ? -11 : 11)).toFixed(2), y: (pm[1] + (haut ? 20 : -10)).toFixed(2), "text-anchor": droite ? "end" : "start", class: "etiquette-m " + (ev.ok ? "ok" : "non") });
      tm.textContent = "M";
      svg.appendChild(tm);

      this._lecture.textContent = "z = " + nombreFr(m.x, 2) + (m.y < 0 ? " − " : " + ") + nombreFr(Math.abs(m.y), 2) + "i   —   " + ev.texte;
      this._verdict.className = "verdict " + (ev.ok ? "ok" : "non");
      this._verdict.textContent = (ev.ok ? "✓ " : "✗ ") + ev.explication;
    }
  }

  if (!customElements.get("lieux-complexes-widget")) {
    customElements.define("lieux-complexes-widget", LieuxComplexesWidget);
  }
})();
