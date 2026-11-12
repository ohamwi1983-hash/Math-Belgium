(function () {
  "use strict";

  /* ================================================================
   * <transformation-az-b-widget> — atelier interactif : z' = az + b.
   * Curseurs |a| (module), arg(a) (degrés), Re(b), Im(b) — classe en direct
   * la transformation selon a (translation / rotation / homothétie /
   * similitude, featureTable de la section) et affiche son centre
   * Ω = b/(1−a), son angle et son rapport. Le point M (sommet du petit
   * triangle) se fait GLISSER : son image M′ suit, avec les segments ΩM et
   * ΩM′, l'arc de l'angle et le rapport ΩM′/ΩM = |a| vérifié en direct.
   * Mode « composer deux transformations » : T₁ puis T₂ (z ↦ a₂(a₁z + b₁) + b₂)
   * et T₂ puis T₁, dessinées ensemble — même multiplicateur a₁a₂ dans les deux
   * ordres, mais images différentes quand les centres diffèrent.
   * Réglage par défaut (|a| = 1, arg(a) = 90°, b = 0) : le cas a = i, b = 0 de
   * l'astuce — rotation de centre O et d'angle π/2. Fenêtre FIXE.
   * Web Component (Shadow DOM).
   * ================================================================ */

  var NS = "http://www.w3.org/2000/svg";
  var D2R = Math.PI / 180;
  var DEFAUT = {
    t1: { mod: 1, arg: 90, bx: 0, by: 0 },
    t2: { mod: 1, arg: 90, bx: 2, by: 0 },
    M: { x: 2, y: 1 },
    mode: "simple",
  };
  var BORNES = {
    mod: { min: 0.3, max: 2.5, step: 0.05 },
    arg: { min: 0, max: 360, step: 1 },
    b: { min: -3, max: 3, step: 0.1 },
  };
  var EPS_MODULE = 0.03, EPS_ANGLE_DEG = 2;
  // triangle repéré par rapport à M (premier sommet)
  var FORME_REL = [{ x: 0, y: 0 }, { x: 0.7, y: 0.35 }, { x: 0, y: 0.7 }];

  var X_MIN = -7, X_MAX = 9, Y_MIN = -7, Y_MAX = 9;
  var LARGEUR = 380, HAUTEUR = 380, MARGE = 26;

  function formatNombreFr(n, decimales) {
    var facteur = Math.pow(10, decimales);
    var arrondi = Math.round(n * facteur) / facteur;
    if (Object.is(arrondi, -0)) arrondi = 0;
    return arrondi.toFixed(decimales).replace(".", ",").replace("-", "−");
  }
  function court(n) {
    return formatNombreFr(n, 2).replace(/,?0+$/, "") || "0";
  }
  function complexeFr(z) {
    var x = Math.abs(z.x) < 0.005 ? 0 : z.x, y = Math.abs(z.y) < 0.005 ? 0 : z.y;
    if (y === 0) return court(x);
    var mag = Math.abs(y), pi = (Math.abs(mag - 1) < 0.005 ? "" : court(mag)) + "i";
    if (x === 0) return (y < 0 ? "−" : "") + pi;
    return court(x) + (y < 0 ? " − " : " + ") + pi;
  }
  function entreParentheses(z) {
    var t = complexeFr(z);
    return /[ ]/.test(t) ? "(" + t + ")" : t;
  }

  // « a·z + b » lisible : z, −z, i·z, (1 + i)·z ; b nul omis, b réel négatif « − 3 ».
  function affine(a, b) {
    var ax = Math.abs(a.x) < 0.005 ? 0 : a.x, ay = Math.abs(a.y) < 0.005 ? 0 : a.y;
    var tete;
    if (ay === 0 && Math.abs(ax - 1) < 0.005) tete = "z";
    else if (ay === 0 && Math.abs(ax + 1) < 0.005) tete = "−z";
    else tete = entreParentheses(a) + "·z";
    var bx = Math.abs(b.x) < 0.005 ? 0 : b.x, by = Math.abs(b.y) < 0.005 ? 0 : b.y;
    if (bx === 0 && by === 0) return tete;
    if (by === 0) return tete + (bx < 0 ? " − " : " + ") + court(Math.abs(bx));
    if (bx === 0) return tete + (by < 0 ? " − " : " + ") + complexeFr({ x: 0, y: Math.abs(by) });
    return tete + " + " + "(" + complexeFr(b) + ")";
  }

  function svgEl(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    for (var key in attrs) el.setAttribute(key, attrs[key]);
    return el;
  }

  function cMul(u, v) { return { x: u.x * v.x - u.y * v.y, y: u.x * v.y + u.y * v.x }; }
  function cAdd(u, v) { return { x: u.x + v.x, y: u.y + v.y }; }
  function cSub(u, v) { return { x: u.x - v.x, y: u.y - v.y }; }
  function cDiv(u, v) {
    var d = v.x * v.x + v.y * v.y;
    return { x: (u.x * v.x + u.y * v.y) / d, y: (u.y * v.x - u.x * v.y) / d };
  }
  function cMod(u) { return Math.hypot(u.x, u.y); }

  function curseurHtml(id, label, bornes, valeur) {
    return '<div class="curseur"><label for="' + id + '">' + label + '</label><div class="curseur-row">' +
      '<input type="range" id="' + id + '" min="' + bornes.min + '" max="' + bornes.max + '" step="' + bornes.step + '" value="' + valeur + '">' +
      '<span class="curseur-valeur" id="' + id + '-valeur"></span></div></div>';
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '[hidden]{display:none!important;}' +
    '.mode-row{display:flex;justify-content:center;gap:8px;margin-bottom:12px;flex-wrap:wrap;}' +
    '.mode-row button{flex:1 1 0;max-width:220px;min-width:130px;padding:8px 10px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink-soft,#6b6055);font-weight:700;cursor:pointer;font-size:0.88rem;font-family:inherit;}' +
    '.mode-row button.actif{background:var(--accent,#a8471f);border-color:var(--accent,#a8471f);color:#fff;}' +
    '.formule{text-align:center;font-family:var(--mono,monospace);font-size:0.9rem;font-weight:700;color:var(--ink,#241f1a);margin:0 0 12px;line-height:1.6;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:380px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);user-select:none;-webkit-user-select:none;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.fleche-accent{fill:var(--accent,#a8471f);}' +
    '.forme-orig{stroke:var(--ink-faint,#9c9083);stroke-width:1.6;fill:var(--ink-faint,#9c9083);fill-opacity:0.12;}' +
    '.forme-image{stroke:var(--accent,#a8471f);stroke-width:2;fill:var(--accent,#a8471f);fill-opacity:0.14;}' +
    '.forme-image2{stroke:var(--good,#2f7a4f);stroke-width:2;fill:var(--good,#2f7a4f);fill-opacity:0.10;stroke-dasharray:5 3;}' +
    '.forme-inter{stroke:var(--ink-faint,#9c9083);stroke-width:1;fill:none;stroke-dasharray:2 3;}' +
    '.point-M{fill:var(--ink,#241f1a);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.point-image{fill:var(--accent,#a8471f);}' +
    '.point-image2{fill:var(--good,#2f7a4f);}' +
    '.poignee{fill:transparent;cursor:grab;touch-action:none;}' +
    '.centre{fill:var(--plan,#5b4ea3);}' +
    '.centre-croix{stroke:var(--plan,#5b4ea3);stroke-width:1.4;}' +
    '.centre2{fill:var(--ink-soft,#6b6055);}' +
    '.centre2-croix{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.rayon{stroke:var(--plan,#5b4ea3);stroke-width:1.2;stroke-dasharray:4 3;}' +
    '.arc-angle{stroke:var(--plan,#5b4ea3);stroke-width:1.6;fill:none;}' +
    '.vecteur-translation{stroke:var(--accent,#a8471f);stroke-width:1.6;stroke-dasharray:5 3;}' +
    '.etiquette{font-size:11px;font-weight:700;font-family:var(--sans,sans-serif);}' +
    '.etiquette-orig{fill:var(--ink,#241f1a);}' +
    '.etiquette-image{fill:var(--accent-ink,#7a3212);}' +
    '.etiquette-image2{fill:var(--good,#2f7a4f);}' +
    '.etiquette-centre{fill:var(--plan,#5b4ea3);}' +
    '.etiquette-centre2{fill:var(--ink-soft,#6b6055);}' +
    '.classification{text-align:center;font-size:0.88rem;font-weight:700;margin:0 0 6px;padding:10px 14px;border-radius:var(--radius,3px);color:var(--accent-ink,#7a3212);background:var(--surface-2,#faf6f0);line-height:1.55;}' +
    '.centre-texte{text-align:center;font-size:0.82rem;color:var(--ink-soft,#6b6055);margin:0 0 18px;font-variant-numeric:tabular-nums;line-height:1.6;}' +
    '.aide{font-size:0.8rem;color:var(--ink-soft,#6b6055);text-align:center;margin:0 0 8px;}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.groupe-titre{font-weight:700;font-size:0.86rem;color:var(--ink,#241f1a);margin:4px 0 -4px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-width:0;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{margin-top:2px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<div class="mode-row" id="mode">' +
    '<button type="button" data-mode="simple">Une transformation</button>' +
    '<button type="button" data-mode="composer">Composer deux transformations</button>' +
    '</div>' +
    '<p class="formule" id="formule"></p>' +
    '<p class="aide">Fais glisser le point M.</p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Le point M, son image et le centre de la transformation"></svg></div>' +
    '<p class="classification" id="classification"></p>' +
    '<p class="centre-texte" id="centre-texte"></p>' +
    '<div class="controles">' +
    '<p class="groupe-titre" id="titre-t1" hidden>T₁ : z′ = a₁z + b₁</p>' +
    curseurHtml("module", "|a|", BORNES.mod, DEFAUT.t1.mod) +
    curseurHtml("arg", "arg(a)", BORNES.arg, DEFAUT.t1.arg) +
    curseurHtml("bx", "Re(b)", BORNES.b, DEFAUT.t1.bx) +
    curseurHtml("by", "Im(b)", BORNES.b, DEFAUT.t1.by) +
    '<div class="controles" id="bloc-t2" hidden>' +
    '<p class="groupe-titre">T₂ : z′ = a₂z + b₂</p>' +
    curseurHtml("module2", "|a₂|", BORNES.mod, DEFAUT.t2.mod) +
    curseurHtml("arg2", "arg(a₂)", BORNES.arg, DEFAUT.t2.arg) +
    curseurHtml("bx2", "Re(b₂)", BORNES.b, DEFAUT.t2.bx) +
    curseurHtml("by2", "Im(b₂)", BORNES.b, DEFAUT.t2.by) +
    '</div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  var CHAMPS = [
    ["module", "t1", "mod"], ["arg", "t1", "arg"], ["bx", "t1", "bx"], ["by", "t1", "by"],
    ["module2", "t2", "mod"], ["arg2", "t2", "arg"], ["bx2", "t2", "bx"], ["by2", "t2", "by"],
  ];

  function copie(o) { return JSON.parse(JSON.stringify(o)); }

  // Paramètres d'une transformation : a, b, classification, centre.
  function analyser(t) {
    var a = { x: t.mod * Math.cos(t.arg * D2R), y: t.mod * Math.sin(t.arg * D2R) };
    var b = { x: t.bx, y: t.by };
    var argMod = ((t.arg % 360) + 360) % 360;
    var estA1 = Math.abs(t.mod - 1) < EPS_MODULE && (argMod < EPS_ANGLE_DEG || argMod > 360 - EPS_ANGLE_DEG);
    var res = { a: a, b: b, translation: estA1, centre: null, nature: "", rapport: t.mod, angle: argMod };
    if (estA1) {
      res.nature = "translation";
      return res;
    }
    res.centre = cDiv(b, cSub({ x: 1, y: 0 }, a));
    var estRotation = Math.abs(t.mod - 1) < EPS_MODULE;
    var estReel = Math.abs(argMod % 180) < EPS_ANGLE_DEG || Math.abs((argMod % 180) - 180) < EPS_ANGLE_DEG;
    if (estRotation) res.nature = "rotation";
    else if (estReel) {
      res.nature = "homothetie";
      res.rapportReel = Math.abs(argMod - 180) < 90 ? -t.mod : t.mod;
    } else res.nature = "similitude";
    return res;
  }
  function appliquer(an, z) { return cAdd(cMul(an.a, z), an.b); }

  class TransformationAzBWidgetClass extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._etat = { t1: copie(DEFAUT.t1), t2: copie(DEFAUT.t2) };
      this._M = copie(DEFAUT.M);
      this._mode = DEFAUT.mode;
      this._svg = shadow.getElementById("svg");
      this._formule = shadow.getElementById("formule");
      this._classification = shadow.getElementById("classification");
      this._centreTexte = shadow.getElementById("centre-texte");
      this._modeWrap = shadow.getElementById("mode");
      this._blocT2 = shadow.getElementById("bloc-t2");
      this._titreT1 = shadow.getElementById("titre-t1");
      this._resetBtn = shadow.getElementById("reset");
      var self = this;
      this._inputs = CHAMPS.map(function (c) {
        return { input: shadow.getElementById(c[0]), valeur: shadow.getElementById(c[0] + "-valeur"), t: c[1], cle: c[2] };
      });
      this._glisse = false;
      void self;
    }

    connectedCallback() {
      var self = this;
      this._onInput = function (evt) {
        var item = self._inputs.find(function (it) { return it.input === evt.target; });
        if (!item) return;
        self._etat[item.t][item.cle] = parseFloat(item.input.value);
        self._rendre();
      };
      this._onClickMode = function (evt) {
        var btn = evt.target.closest("button[data-mode]");
        if (!btn) return;
        self._mode = btn.getAttribute("data-mode");
        self._rendre();
      };
      this._onReset = function () {
        self._etat = { t1: copie(DEFAUT.t1), t2: copie(DEFAUT.t2) };
        self._M = copie(DEFAUT.M);
        self._inputs.forEach(function (it) { it.input.value = String(self._etat[it.t][it.cle]); });
        self._rendre();
      };
      this._onDown = function (e) { self._debut(e); };
      this._onMove = function (e) { self._deplacer(e); };
      this._onUp = function (e) { self._fin(e); };
      this._inputs.forEach(function (it) { it.input.addEventListener("input", self._onInput); });
      this._modeWrap.addEventListener("click", this._onClickMode);
      this._resetBtn.addEventListener("click", this._onReset);
      this._svg.addEventListener("pointerdown", this._onDown);
      this._svg.addEventListener("pointermove", this._onMove);
      this._svg.addEventListener("pointerup", this._onUp);
      this._svg.addEventListener("pointercancel", this._onUp);
      this._rendre();
    }

    disconnectedCallback() {
      var self = this;
      this._inputs.forEach(function (it) { it.input.removeEventListener("input", self._onInput); });
      this._modeWrap.removeEventListener("click", this._onClickMode);
      this._resetBtn.removeEventListener("click", this._onReset);
      this._svg.removeEventListener("pointerdown", this._onDown);
      this._svg.removeEventListener("pointermove", this._onMove);
      this._svg.removeEventListener("pointerup", this._onUp);
      this._svg.removeEventListener("pointercancel", this._onUp);
    }

    _toPx(xMath, yMath) {
      var px = MARGE + (xMath - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - 2 * MARGE);
      var py = HAUTEUR - MARGE - (yMath - Y_MIN) / (Y_MAX - Y_MIN) * (HAUTEUR - 2 * MARGE);
      return [px, py];
    }

    _versMath(evt) {
      var pt = this._svg.createSVGPoint();
      pt.x = evt.clientX; pt.y = evt.clientY;
      var m = this._svg.getScreenCTM();
      if (!m) return null;
      var q = pt.matrixTransform(m.inverse());
      return {
        x: X_MIN + (q.x - MARGE) / (LARGEUR - 2 * MARGE) * (X_MAX - X_MIN),
        y: Y_MIN + (HAUTEUR - MARGE - q.y) / (HAUTEUR - 2 * MARGE) * (Y_MAX - Y_MIN),
      };
    }

    _debut(e) {
      var p = this._versMath(e);
      if (!p || Math.hypot(p.x - this._M.x, p.y - this._M.y) > 0.9) return;
      this._glisse = true;
      try { this._svg.setPointerCapture(e.pointerId); } catch (err) { /* rien */ }
      e.preventDefault();
    }

    _deplacer(e) {
      if (!this._glisse) return;
      var p = this._versMath(e);
      if (!p) return;
      p.x = Math.min(X_MAX - 1, Math.max(X_MIN + 0.3, p.x));
      p.y = Math.min(Y_MAX - 1, Math.max(Y_MIN + 0.3, p.y));
      var g = { x: Math.round(p.x), y: Math.round(p.y) };
      if (Math.hypot(p.x - g.x, p.y - g.y) < 0.25) p = g; // aimant : grille entière
      this._M = p;
      this._rendre();
      e.preventDefault();
    }

    _fin(e) {
      if (!this._glisse) return;
      try { this._svg.releasePointerCapture(e.pointerId); } catch (err) { /* rien */ }
      this._glisse = false;
    }

    _rendre() {
      var self = this, mode = this._mode, composer = mode === "composer";
      Array.prototype.forEach.call(this._modeWrap.querySelectorAll("button"), function (btn) {
        btn.className = btn.getAttribute("data-mode") === mode ? "actif" : "";
      });
      this._blocT2.hidden = !composer;
      this._titreT1.hidden = !composer;
      this._inputs.forEach(function (it) {
        var v = self._etat[it.t][it.cle];
        it.valeur.textContent = it.cle === "mod" ? formatNombreFr(v, 2) : it.cle === "arg" ? formatNombreFr(v, 0) + "°" : formatNombreFr(v, 1);
      });
      var t1 = analyser(this._etat.t1);

      var svg = this._svg;
      svg.innerHTML = "";
      var defs = svgEl("defs", {});
      var fl = svgEl("marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      fl.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(fl);
      var fla = svgEl("marker", { id: "fleche-accent", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      fla.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche-accent" }));
      defs.appendChild(fla);
      svg.appendChild(defs);
      var origine = this._toPx(0, 0);
      svg.appendChild(svgEl("line", { x1: MARGE, x2: LARGEUR - MARGE, y1: origine[1].toFixed(2), y2: origine[1].toFixed(2), class: "axe", "marker-end": "url(#fleche)" }));
      svg.appendChild(svgEl("line", { x1: origine[0].toFixed(2), x2: origine[0].toFixed(2), y1: HAUTEUR - MARGE, y2: MARGE, class: "axe", "marker-end": "url(#fleche)" }));

      var M = this._M;
      var forme = FORME_REL.map(function (d) { return cAdd(M, d); });

      if (!composer) {
        this._formule.textContent = "z′ = " + affine(t1.a, t1.b);
        var image = forme.map(function (z) { return appliquer(t1, z); });
        var Mp = image[0];
        if (t1.centre) this._dessinerCentreEtAngle(t1, M, Mp, "centre", "Ω");
        else {
          var p0 = this._toPx(M.x, M.y), p1 = this._toPx(Mp.x, Mp.y);
          if (Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) > 8) svg.appendChild(svgEl("line", { x1: p0[0], y1: p0[1], x2: p1[0], y2: p1[1], class: "vecteur-translation", "marker-end": "url(#fleche-accent)" }));
        }
        this._chemin(forme, "forme-orig");
        this._chemin(image, "forme-image");
        this._point(Mp, "point-image", "M′", "etiquette-image");
        this._pointM();

        var txt, centreTxt = "";
        if (t1.nature === "translation") {
          txt = "Translation (a = 1) — vecteur d'affixe b = " + complexeFr(t1.b) + ", aucun centre fixe.";
          centreTxt = "M = " + complexeFr(M) + " → M′ = " + complexeFr(Mp) + " : MM′ = |b| = " + court(cMod(t1.b));
        } else {
          var dM = cMod(cSub(M, t1.centre)), dMp = cMod(cSub(Mp, t1.centre));
          if (t1.nature === "rotation") txt = "Rotation (|a| = 1, a ≠ 1) — centre Ω, angle θ = arg(a) = " + formatNombreFr(t1.angle, 0) + "°, rapport 1.";
          else if (t1.nature === "homothetie") txt = "Homothétie (a réel) — centre Ω, rapport k = " + formatNombreFr(t1.rapportReel, 2) + ".";
          else txt = "Similitude — centre Ω, angle arg(a) = " + formatNombreFr(t1.angle, 0) + "°, rapport |a| = " + formatNombreFr(t1.rapport, 2) + ".";
          centreTxt = "Centre Ω = b/(1 − a) = " + complexeFr(t1.centre) + "   |   M = " + complexeFr(M) + " → M′ = " + complexeFr(Mp) +
            (dM > 0.01 ? "   |   ΩM′ / ΩM = " + court(dMp) + " / " + court(dM) + " = " + formatNombreFr(dMp / dM, 2) + " = |a|" : "   |   M = Ω : le centre est fixe");
        }
        this._classification.textContent = txt;
        this._centreTexte.textContent = centreTxt;
        return;
      }

      // ----- mode composer -----
      var t2 = analyser(this._etat.t2);
      this._formule.innerHTML = "";
      this._formule.appendChild(document.createTextNode("T₁ : z′ = " + affine(t1.a, t1.b)));
      this._formule.appendChild(document.createElement("br"));
      this._formule.appendChild(document.createTextNode("T₂ : z′ = " + affine(t2.a, t2.b)));

      var inter1 = forme.map(function (z) { return appliquer(t1, z); });
      var img21 = inter1.map(function (z) { return appliquer(t2, z); }); // T₁ puis T₂
      var inter2 = forme.map(function (z) { return appliquer(t2, z); });
      var img12 = inter2.map(function (z) { return appliquer(t1, z); }); // T₂ puis T₁
      if (t1.centre) this._croix(t1.centre, "centre", "centre-croix", "Ω₁", "etiquette-centre");
      if (t2.centre) this._croix(t2.centre, "centre2", "centre2-croix", "Ω₂", "etiquette-centre2");
      this._chemin(forme, "forme-orig");
      this._chemin(inter1, "forme-inter");
      this._chemin(inter2, "forme-inter");
      this._chemin(img21, "forme-image");
      this._chemin(img12, "forme-image2");
      var memes = Math.hypot(img21[0].x - img12[0].x, img21[0].y - img12[0].y) < 0.02;
      this._point(img21[0], "point-image", "M″", "etiquette-image");
      if (!memes) this._point(img12[0], "point-image2", "M‴", "etiquette-image2");
      this._pointM();

      var a = cMul(t1.a, t2.a);
      var b21 = cAdd(cMul(t2.a, t1.b), t2.b);
      var b12 = cAdd(cMul(t1.a, t2.b), t1.b);
      this._classification.textContent = "Multiplicateur de la composée : a₁a₂ = " + complexeFr(a) +
        " — le même dans les deux ordres (module " + formatNombreFr(cMod(a), 2) + ", argument " +
        formatNombreFr((((t1.angle + t2.angle) % 360) + 360) % 360, 0) + "°).";
      this._centreTexte.textContent =
        "T₁ puis T₂ (point M″, orange) : z ↦ " + affine(a, b21) +
        "   |   T₂ puis T₁ (point M‴, vert) : z ↦ " + affine(a, b12) + "   |   " +
        (memes ? "Même image : ici, l'ordre ne compte pas (même centre, ou deux translations)." : "Images différentes : l'ordre compte, car les centres diffèrent.");
    }

    _chemin(points, classe) {
      var self = this;
      var d = points.map(function (pt, i) {
        var p = self._toPx(pt.x, pt.y);
        return (i === 0 ? "M" : "L") + p[0].toFixed(2) + " " + p[1].toFixed(2);
      }).join(" ") + " Z";
      this._svg.appendChild(svgEl("path", { d: d, class: classe }));
    }

    _etiquette(p, texte, classe) {
      var droite = p[0] > LARGEUR - 70, gauche = p[0] < 40;
      var x = p[0] + (droite ? -9 : 9);
      var y = p[1] < 22 ? p[1] + 16 : p[1] - 8;
      var t = svgEl("text", { x: x.toFixed(2), y: y.toFixed(2), "text-anchor": droite ? "end" : "start", class: "etiquette " + classe });
      if (gauche) t.setAttribute("x", (p[0] + 9).toFixed(2));
      t.textContent = texte;
      this._svg.appendChild(t);
    }

    _point(z, classe, texte, classeEt) {
      var p = this._toPx(z.x, z.y);
      this._svg.appendChild(svgEl("circle", { cx: p[0].toFixed(2), cy: p[1].toFixed(2), r: 4.5, class: classe }));
      this._etiquette(p, texte, classeEt);
    }

    _pointM() {
      var p = this._toPx(this._M.x, this._M.y);
      this._svg.appendChild(svgEl("circle", { cx: p[0].toFixed(2), cy: p[1].toFixed(2), r: 6, class: "point-M" }));
      this._svg.appendChild(svgEl("circle", { cx: p[0].toFixed(2), cy: p[1].toFixed(2), r: 16, class: "poignee" }));
      var t = svgEl("text", { x: (p[0] - 10).toFixed(2), y: (p[1] + 16).toFixed(2), "text-anchor": "end", class: "etiquette etiquette-orig" });
      if (p[0] < 40) { t.setAttribute("x", (p[0] + 10).toFixed(2)); t.setAttribute("text-anchor", "start"); }
      if (p[1] > HAUTEUR - 24) t.setAttribute("y", (p[1] - 10).toFixed(2));
      t.textContent = "M";
      this._svg.appendChild(t);
    }

    _croix(z, classePoint, classeCroix, texte, classeEt) {
      var p = this._toPx(z.x, z.y);
      this._svg.appendChild(svgEl("line", { x1: (p[0] - 7).toFixed(2), y1: p[1].toFixed(2), x2: (p[0] + 7).toFixed(2), y2: p[1].toFixed(2), class: classeCroix }));
      this._svg.appendChild(svgEl("line", { x1: p[0].toFixed(2), y1: (p[1] - 7).toFixed(2), x2: p[0].toFixed(2), y2: (p[1] + 7).toFixed(2), class: classeCroix }));
      this._svg.appendChild(svgEl("circle", { cx: p[0].toFixed(2), cy: p[1].toFixed(2), r: 3.5, class: classePoint }));
      var t = svgEl("text", { x: (p[0] - 9).toFixed(2), y: (p[1] + 15).toFixed(2), "text-anchor": "end", class: "etiquette " + classeEt });
      if (p[0] < 40) { t.setAttribute("x", (p[0] + 9).toFixed(2)); t.setAttribute("text-anchor", "start"); }
      if (p[1] > HAUTEUR - 22) t.setAttribute("y", (p[1] - 9).toFixed(2));
      t.textContent = texte;
      this._svg.appendChild(t);
    }

    // Centre Ω, rayons ΩM et ΩM′, arc orienté de l'angle arg(a) (si ce n'est pas une homothétie).
    _dessinerCentreEtAngle(an, M, Mp, classe, nom) {
      var pO = this._toPx(an.centre.x, an.centre.y), pM = this._toPx(M.x, M.y), pMp = this._toPx(Mp.x, Mp.y);
      var dM = Math.hypot(pM[0] - pO[0], pM[1] - pO[1]);
      if (dM > 4) {
        this._svg.appendChild(svgEl("line", { x1: pO[0], y1: pO[1], x2: pM[0], y2: pM[1], class: "rayon" }));
        this._svg.appendChild(svgEl("line", { x1: pO[0], y1: pO[1], x2: pMp[0], y2: pMp[1], class: "rayon" }));
        if (an.nature !== "homothetie" && an.angle > 1 && an.angle < 359) {
          var r = Math.min(26, dM * 0.6);
          var t0 = Math.atan2(-(pM[1] - pO[1]), pM[0] - pO[0]);
          var t1 = t0 + an.angle * D2R;
          var a0 = [pO[0] + r * Math.cos(t0), pO[1] - r * Math.sin(t0)];
          var a1 = [pO[0] + r * Math.cos(t1), pO[1] - r * Math.sin(t1)];
          var grand = an.angle > 180 ? 1 : 0;
          this._svg.appendChild(svgEl("path", { d: "M" + a0[0].toFixed(2) + " " + a0[1].toFixed(2) + " A" + r.toFixed(2) + " " + r.toFixed(2) + " 0 " + grand + " 0 " + a1[0].toFixed(2) + " " + a1[1].toFixed(2), class: "arc-angle" }));
          var tm = t0 + an.angle * D2R / 2;
          var tx = svgEl("text", { x: (pO[0] + (r + 12) * Math.cos(tm)).toFixed(2), y: (pO[1] - (r + 12) * Math.sin(tm) + 4).toFixed(2), "text-anchor": "middle", class: "etiquette etiquette-centre" });
          tx.textContent = "θ";
          this._svg.appendChild(tx);
        }
      }
      this._croix(an.centre, classe, classe + "-croix", nom, "etiquette-" + classe);
    }
  }

  if (!customElements.get("transformation-az-b-widget")) {
    customElements.define("transformation-az-b-widget", TransformationAzBWidgetClass);
  }
})();
