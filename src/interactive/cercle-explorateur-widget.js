(function () {
  "use strict";

  /* ================================================================
   * <cercle-explorateur-widget> — atelier interactif (4e, chapitre 5,
   * section « Le cercle trigonométrique »).
   * - « Explorer » : θ de −720° à 720° (curseur + boutons ±1°, ±15°,
   *   ±90°). Une spirale matérialise les tours complets ; le panneau
   *   donne l'angle réduit dans [0° ; 360°[ avec le calcul, le quadrant
   *   (ou « sur un axe »), l'angle du premier quadrant avec sa formule,
   *   les signes et valeurs de sin, cos, tan, et en option la
   *   construction de la tangente P(1 ; tan θ).
   * - « Défi » : un angle tiré au hasard (négatif ou au-delà de 360°
   *   compris) ; l'élève choisit le quadrant et les signes de sin, cos,
   *   tan — un seul essai, correction expliquée, jamais de score.
   * Fenêtre fixe (cercle de rayon constant). Web Component (Shadow DOM).
   * ================================================================ */

  var D2R = Math.PI / 180;
  var DEFAUT = 150;
  var TAILLE = 300, CX = 150, CY = 150, R = 92, AXE = 135, BORD = 8;

  var EXACT = {
    sin: { 0: "0", 30: "1/2", 45: "√2/2", 60: "√3/2", 90: "1" },
    cos: { 0: "1", 30: "√3/2", 45: "√2/2", 60: "1/2", 90: "0" },
    tan: { 0: "0", 30: "√3/3", 45: "1", 60: "√3" },
  };
  var NOMS_Q = ["", "I", "II", "III", "IV"];

  function nombreFr(n, d) {
    var f = Math.pow(10, d);
    var a = Math.round(n * f) / f;
    if (Math.abs(a) < 1e-12) a = 0;
    return a.toFixed(d).replace(".", ",").replace("-", "−");
  }
  function deg(a) { return String(a).replace("-", "−") + "°"; }
  function sinD(a) { var v = Math.sin(a * D2R); return Math.abs(v) < 1e-12 ? 0 : v; }
  function cosD(a) { var v = Math.cos(a * D2R); return Math.abs(v) < 1e-12 ? 0 : v; }
  function pt(a, r) { return [CX + r * Math.cos(a * D2R), CY - r * Math.sin(a * D2R)]; }
  function randInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

  function reduire(theta) {
    var k = Math.floor(theta / 360);
    var r = theta - 360 * k;
    var calcul;
    if (k === 0) calcul = deg(theta) + " est déjà dans [0° ; 360°[.";
    else if (k > 0) calcul = deg(theta) + " − " + (k === 1 ? "" : k + " × ") + "360° = " + deg(r);
    else calcul = deg(theta) + " + " + (k === -1 ? "" : (-k) + " × ") + "360° = " + deg(r);
    return { r: r, k: k, calcul: calcul };
  }

  function quadrant(r) {
    if (r > 0 && r < 90) return 1;
    if (r > 90 && r < 180) return 2;
    if (r > 180 && r < 270) return 3;
    if (r > 270 && r < 360) return 4;
    return 0;
  }

  function reference(r, q) {
    if (q === 1) return { ref: r, formule: "θ lui-même : " + deg(r) };
    if (q === 2) return { ref: 180 - r, formule: "180° − " + deg(r) + " = " + deg(180 - r) };
    if (q === 3) return { ref: r - 180, formule: deg(r) + " − 180° = " + deg(r - 180) };
    if (q === 4) return { ref: 360 - r, formule: "360° − " + deg(r) + " = " + deg(360 - r) };
    return null;
  }

  function signeTexte(v) { return v > 1e-12 ? "+" : v < -1e-12 ? "−" : "0"; }

  /** Valeur exacte si l'angle de référence est remarquable, sinon « ≈ ». */
  function valeur(fn, r) {
    var s = sinD(r), c = cosD(r);
    var v = fn === "sin" ? s : fn === "cos" ? c : (Math.abs(c) < 1e-12 ? null : s / c);
    if (v === null) return "non définie";
    var refA = r % 90 === 0 ? (r % 180 === 0 ? 0 : 90) : null;
    if (refA === null) {
      var q = quadrant(r);
      refA = reference(r, q).ref;
    }
    var table = EXACT[fn];
    var ex = table[refA];
    if (ex !== undefined) {
      if (ex === "0") return "0";
      return (v < 0 ? "−" : "") + ex;
    }
    return "≈ " + nombreFr(v, 3);
  }

  function arcPath(a0, a1, rFn, pas) {
    var sens = a1 >= a0 ? 1 : -1;
    var d = "";
    var a = a0;
    var p = pt(a, rFn(a));
    d = "M" + p[0].toFixed(2) + " " + p[1].toFixed(2);
    while (sens * (a1 - a) > pas) {
      a += sens * pas;
      p = pt(a, rFn(a));
      d += " L" + p[0].toFixed(2) + " " + p[1].toFixed(2);
    }
    p = pt(a1, rFn(a1));
    d += " L" + p[0].toFixed(2) + " " + p[1].toFixed(2);
    return d;
  }

  function teteFleche(a1, r, sens) {
    var p = pt(a1, r);
    var t = a1 * D2R;
    var dx = -Math.sin(t) * sens, dy = -Math.cos(t) * sens;
    var nx = -dy, ny = dx;
    var bx = p[0] - dx * 7, by = p[1] - dy * 7;
    return "M" + p[0].toFixed(2) + " " + p[1].toFixed(2) +
      " L" + (bx + nx * 3.6).toFixed(2) + " " + (by + ny * 3.6).toFixed(2) +
      " L" + (bx - nx * 3.6).toFixed(2) + " " + (by - ny * 3.6).toFixed(2) + " Z";
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}' +
    '*{box-sizing:border-box;}' +
    '[hidden]{display:none!important;}' +
    '.modes{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:0 0 14px;}' +
    'button{font-family:inherit;}' +
    '.modes button{min-height:44px;padding:8px 16px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);font-weight:600;font-size:.92rem;cursor:pointer;}' +
    '.modes button[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);border-color:var(--accent,#a8471f);color:var(--accent-ink,#7a3212);}' +
    '.disposition{display:flex;flex-wrap:wrap;gap:16px;justify-content:center;align-items:flex-start;}' +
    '.graphe{flex:1 1 260px;max-width:340px;display:flex;justify-content:center;}' +
    'svg{width:100%;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.panneau{flex:1 1 260px;max-width:420px;display:flex;flex-direction:column;gap:10px;min-width:0;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}' +
    '.fleche-axe{fill:var(--ink-soft,#6b6055);}' +
    '.txt-axe{font-size:11px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.txt-q{font-size:13px;font-weight:700;fill:var(--ink-faint,#9c9083);font-family:var(--sans,sans-serif);}' +
    '.cercle{stroke:var(--ink-faint,#9c9083);stroke-width:1.4;fill:none;}' +
    '.spirale{stroke:var(--accent,#a8471f);stroke-width:1.6;fill:none;}' +
    '.spirale-tete{fill:var(--accent,#a8471f);}' +
    '.arc-ref{stroke:var(--good,#2f7a4f);stroke-width:3;fill:none;}' +
    '.txt-ref{font-size:11px;font-weight:700;fill:var(--good,#2f7a4f);font-family:var(--sans,sans-serif);}' +
    '.rayon{stroke:var(--accent,#a8471f);stroke-width:2;}' +
    '.proj{stroke:var(--accent,#a8471f);stroke-width:1.2;stroke-dasharray:4 3;}' +
    '.pt{fill:var(--accent,#a8471f);}' +
    '.txt-pt{font-size:12px;font-weight:700;fill:var(--accent-ink,#7a3212);font-family:var(--sans,sans-serif);}' +
    '.tangente{stroke:var(--ink-faint,#9c9083);stroke-width:1.2;stroke-dasharray:5 4;}' +
    '.droite-om{stroke:var(--plan,#5b4ea3);stroke-width:1.4;stroke-dasharray:4 3;}' +
    '.seg-tan{stroke:var(--plan,#5b4ea3);stroke-width:3.2;}' +
    '.pt-p{fill:var(--plan,#5b4ea3);}' +
    '.txt-p{font-size:11px;font-weight:700;fill:var(--plan,#5b4ea3);font-family:var(--sans,sans-serif);}' +
    '.bloc{margin:0;font-size:.9rem;line-height:1.55;font-variant-numeric:tabular-nums;overflow-wrap:anywhere;}' +
    '.bloc b{color:var(--accent-ink,#7a3212);}' +
    '.reduit{background:var(--surface-2,#faf6f0);padding:8px 10px;border-radius:var(--radius,3px);}' +
    'table{border-collapse:collapse;width:100%;font-variant-numeric:tabular-nums;font-size:.9rem;}' +
    'th,td{border:1px solid var(--line,#e2d8c8);padding:6px 6px;text-align:center;}' +
    'th{background:var(--surface-2,#faf6f0);font-weight:600;}' +
    'td.plus{color:var(--good,#2f7a4f);font-weight:700;}' +
    'td.moins{color:var(--bad,#b3261e);font-weight:700;}' +
    '.note{margin:0;font-size:.84rem;color:var(--ink-soft,#6b6055);}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;margin-top:14px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-height:44px;accent-color:var(--accent,#a8471f);min-width:0;}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:58px;text-align:right;}' +
    '.pas{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:6px;margin-top:8px;}' +
    '@media (max-width:480px){.pas{grid-template-columns:repeat(3,minmax(0,1fr));}}' +
    '.pas button{min-height:44px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);font-weight:600;font-size:.9rem;cursor:pointer;font-variant-numeric:tabular-nums;}' +
    '.case{display:flex;align-items:center;gap:8px;min-height:44px;cursor:pointer;font-size:.92rem;margin-top:6px;}' +
    '.case input{width:20px;height:20px;accent-color:var(--plan,#5b4ea3);}' +
    '.actions{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:12px;}' +
    '.btn{min-height:44px;padding:8px 16px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:.9rem;}' +
    '.btn:disabled{opacity:.5;cursor:default;}' +
    '.defi-angle{font-family:var(--serif,serif);font-size:1.5rem;font-weight:700;text-align:center;margin:0;color:var(--accent-ink,#7a3212);font-variant-numeric:tabular-nums;}' +
    '.consigne{margin:0;font-size:.9rem;text-align:center;}' +
    '.groupe{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;}' +
    '.groupe .nom{font-weight:600;font-size:.92rem;}' +
    '.choix{display:flex;gap:6px;flex-wrap:wrap;}' +
    '.choix button{min-width:52px;min-height:44px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);font-size:1rem;font-weight:700;cursor:pointer;}' +
    '.choix button[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);border-color:var(--accent,#a8471f);color:var(--accent-ink,#7a3212);}' +
    '.choix button:disabled{cursor:default;}' +
    '.choix button.juste{background:var(--good-soft,#e2f0e6);border-color:var(--good,#2f7a4f);color:var(--good,#2f7a4f);}' +
    '.choix button.faux{background:var(--bad-soft,#f6dcdc);border-color:var(--bad,#b3261e);color:var(--bad,#b3261e);}' +
    '.correction{list-style:none;margin:0;padding:10px 12px;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);display:flex;flex-direction:column;gap:6px;font-size:.88rem;line-height:1.45;}' +
    '.correction .ok{color:var(--good,#2f7a4f);font-weight:700;}' +
    '.correction .ko{color:var(--bad,#b3261e);font-weight:700;}' +
    '</style>' +
    '<div class="modes"><button type="button" id="mode-exp" aria-pressed="true">Explorer</button><button type="button" id="mode-defi" aria-pressed="false">Défi</button></div>' +
    '<div class="disposition">' +
    '<div class="graphe"><svg id="svg" viewBox="0 0 ' + TAILLE + ' ' + TAILLE + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Cercle trigonométrique"></svg></div>' +
    '<div class="panneau" id="panneau-exp">' +
    '<p class="bloc reduit" id="reduit"></p>' +
    '<p class="bloc" id="quadrant"></p>' +
    '<table><thead><tr><th></th><th>sin θ</th><th>cos θ</th><th>tan θ</th></tr></thead><tbody id="tbody"></tbody></table>' +
    '<p class="bloc" id="coords"></p>' +
    '<p class="note" id="note-tan"></p>' +
    '</div>' +
    '<div class="panneau" id="panneau-defi" hidden>' +
    '<p class="defi-angle" id="defi-angle"></p>' +
    '<p class="consigne">Sans calculatrice : dans quel quadrant tombe M(θ), et quels sont les signes de sin θ, cos θ et tan θ ?</p>' +
    '<div class="groupe"><span class="nom">Quadrant</span><div class="choix" data-g="q">' +
    '<button type="button" data-v="1" aria-pressed="false">I</button><button type="button" data-v="2" aria-pressed="false">II</button><button type="button" data-v="3" aria-pressed="false">III</button><button type="button" data-v="4" aria-pressed="false">IV</button></div></div>' +
    ['sin', 'cos', 'tan'].map(function (f) {
      return '<div class="groupe"><span class="nom">Signe de ' + f + ' θ</span><div class="choix" data-g="' + f + '">' +
        '<button type="button" data-v="1" aria-pressed="false" aria-label="' + f + ' θ positif">+</button>' +
        '<button type="button" data-v="-1" aria-pressed="false" aria-label="' + f + ' θ négatif">−</button></div></div>';
    }).join("") +
    '<div class="actions"><button class="btn" type="button" id="verifier" disabled>Vérifier</button><button class="btn" type="button" id="nouveau">Nouvel angle</button></div>' +
    '<ul class="correction" id="correction" hidden></ul>' +
    '</div>' +
    '</div>' +
    '<div id="controles-exp">' +
    '<div class="curseur"><label for="theta">θ</label><div class="curseur-row">' +
    '<input type="range" id="theta" min="-720" max="720" step="1" value="' + DEFAUT + '">' +
    '<span class="curseur-valeur" id="theta-valeur"></span></div></div>' +
    '<div class="pas" id="pas">' +
    [-90, -15, -1, 1, 15, 90].map(function (d) {
      return '<button type="button" data-d="' + d + '">' + (d > 0 ? "+" : "−") + Math.abs(d) + '°</button>';
    }).join("") +
    '</div>' +
    '<label class="case"><input type="checkbox" id="tangente"> Construction de la tangente</label>' +
    '<div class="actions"><button class="btn" type="button" id="reset">Réinitialiser</button></div>' +
    '</div>';

  class CercleExplorateurWidget extends HTMLElement {
    constructor() {
      super();
      var sh = this.attachShadow({ mode: "open" });
      sh.appendChild(TEMPLATE.content.cloneNode(true));
      this._theta = DEFAUT;
      this._mode = "exp";
      this._defi = null;
      var g = function (id) { return sh.getElementById(id); };
      this._el = {
        svg: g("svg"), reduit: g("reduit"), quadrant: g("quadrant"), tbody: g("tbody"), coords: g("coords"),
        noteTan: g("note-tan"), input: g("theta"), valeur: g("theta-valeur"), pas: g("pas"), tangente: g("tangente"),
        reset: g("reset"), modeExp: g("mode-exp"), modeDefi: g("mode-defi"), panExp: g("panneau-exp"),
        panDefi: g("panneau-defi"), ctrlExp: g("controles-exp"), defiAngle: g("defi-angle"),
        verifier: g("verifier"), nouveau: g("nouveau"), correction: g("correction"),
      };
      this._groupes = Array.prototype.slice.call(sh.querySelectorAll(".choix"));
    }

    connectedCallback() {
      var self = this, e = this._el;
      this._h = {
        input: function () { self._theta = parseInt(e.input.value, 10); self._rendre(); },
        pas: function (ev) {
          var b = ev.target.closest("button");
          if (!b) return;
          self._theta = Math.max(-720, Math.min(720, self._theta + parseInt(b.getAttribute("data-d"), 10)));
          e.input.value = String(self._theta);
          self._rendre();
        },
        tangente: function () { self._rendre(); },
        reset: function () { self._theta = DEFAUT; e.input.value = String(DEFAUT); e.tangente.checked = false; self._rendre(); },
        modeExp: function () { self._mode = "exp"; self._rendre(); },
        modeDefi: function () { self._mode = "defi"; if (!self._defi) self._nouveauDefi(); self._rendre(); },
        choix: function (ev) {
          var b = ev.target.closest("button");
          if (!b || !self._defi || self._defi.verifie) return;
          var grp = b.parentNode.getAttribute("data-g");
          self._defi.choix[grp] = parseInt(b.getAttribute("data-v"), 10);
          self._rendre();
        },
        verifier: function () { if (self._defi && self._complet()) { self._defi.verifie = true; self._rendre(); } },
        nouveau: function () { self._nouveauDefi(); self._rendre(); },
      };
      e.input.addEventListener("input", this._h.input);
      e.pas.addEventListener("click", this._h.pas);
      e.tangente.addEventListener("change", this._h.tangente);
      e.reset.addEventListener("click", this._h.reset);
      e.modeExp.addEventListener("click", this._h.modeExp);
      e.modeDefi.addEventListener("click", this._h.modeDefi);
      e.verifier.addEventListener("click", this._h.verifier);
      e.nouveau.addEventListener("click", this._h.nouveau);
      this._groupes.forEach(function (gr) { gr.addEventListener("click", self._h.choix); });
      this._rendre();
    }

    disconnectedCallback() {
      var self = this, e = this._el;
      e.input.removeEventListener("input", this._h.input);
      e.pas.removeEventListener("click", this._h.pas);
      e.tangente.removeEventListener("change", this._h.tangente);
      e.reset.removeEventListener("click", this._h.reset);
      e.modeExp.removeEventListener("click", this._h.modeExp);
      e.modeDefi.removeEventListener("click", this._h.modeDefi);
      e.verifier.removeEventListener("click", this._h.verifier);
      e.nouveau.removeEventListener("click", this._h.nouveau);
      this._groupes.forEach(function (gr) { gr.removeEventListener("click", self._h.choix); });
    }

    _nouveauDefi() {
      var ref = randInt(1, 17) * 5;
      var q = randInt(1, 4);
      var base = [ref, 180 - ref, 180 + ref, 360 - ref][q - 1];
      var tours = [-2, -1, -1, 0, 1, 1][randInt(0, 5)];
      var theta = base + 360 * tours;
      if (this._defi && this._defi.theta === theta) theta = base + 360 * (tours === 1 ? -1 : 1);
      this._defi = { theta: theta, choix: { q: null, sin: null, cos: null, tan: null }, verifie: false };
    }

    _complet() {
      var c = this._defi.choix;
      return c.q !== null && c.sin !== null && c.cos !== null && c.tan !== null;
    }

    _rendre() {
      var e = this._el;
      var exp = this._mode === "exp";
      e.modeExp.setAttribute("aria-pressed", exp ? "true" : "false");
      e.modeDefi.setAttribute("aria-pressed", exp ? "false" : "true");
      e.panExp.hidden = !exp;
      e.ctrlExp.hidden = !exp;
      e.panDefi.hidden = exp;
      if (exp) this._rendreExplorer();
      else this._rendreDefi();
    }

    _svgBase() {
      var s = '<defs><marker id="fl" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path class="fleche-axe" d="M0,0 L8,4 L0,8 Z"/></marker></defs>';
      s += '<line class="axe" x1="' + (CX - AXE) + '" y1="' + CY + '" x2="' + (CX + AXE) + '" y2="' + CY + '" marker-end="url(#fl)"/>';
      s += '<line class="axe" x1="' + CX + '" y1="' + (CY + AXE) + '" x2="' + CX + '" y2="' + (CY - AXE) + '" marker-end="url(#fl)"/>';
      s += '<text class="txt-axe" x="' + (CX + AXE - 2) + '" y="' + (CY + 16) + '" text-anchor="end">cos</text>';
      s += '<text class="txt-axe" x="' + (CX + 8) + '" y="' + (CY - AXE + 10) + '">sin</text>';
      s += '<text class="txt-axe" x="' + (CX - 12) + '" y="' + (CY + 15) + '">O</text>';
      s += '<circle class="cercle" cx="' + CX + '" cy="' + CY + '" r="' + R + '"/>';
      var dq = 118;
      s += '<text class="txt-q" x="' + (CX + dq) + '" y="' + (CY - dq + 4) + '" text-anchor="middle">I</text>';
      s += '<text class="txt-q" x="' + (CX - dq) + '" y="' + (CY - dq + 4) + '" text-anchor="middle">II</text>';
      s += '<text class="txt-q" x="' + (CX - dq) + '" y="' + (CY + dq + 4) + '" text-anchor="middle">III</text>';
      s += '<text class="txt-q" x="' + (CX + dq) + '" y="' + (CY + dq + 4) + '" text-anchor="middle">IV</text>';
      return s;
    }

    _svgAngle(theta, avecTangente) {
      var red = reduire(theta);
      var r = red.r, q = quadrant(r);
      var s = "";
      // angle de référence (arc vert entre OM et l'axe horizontal le plus proche)
      if (q) {
        var a0 = q === 1 ? 0 : q === 2 ? r : q === 3 ? 180 : r;
        var a1 = q === 1 ? r : q === 2 ? 180 : q === 3 ? r : 360;
        s += '<path class="arc-ref" d="' + arcPath(a0, a1, function () { return 58; }, 2) + '"/>';
        var mid = pt((a0 + a1) / 2, 71);
        s += '<text class="txt-ref" x="' + mid[0].toFixed(1) + '" y="' + (mid[1] + 4).toFixed(1) + '" text-anchor="middle">' + reference(r, q).ref + '°</text>';
      }
      // spirale de l'angle orienté (le rayon grandit d'un tour à l'autre)
      if (theta !== 0) {
        var rFn = function (a) { return 18 + 9 * Math.abs(a) / 360; };
        s += '<path class="spirale" d="' + arcPath(0, theta, rFn, 3) + '"/>';
        s += '<path class="spirale-tete" d="' + teteFleche(theta, rFn(theta), theta > 0 ? 1 : -1) + '"/>';
      }
      var M = pt(r, R);
      // tangente
      if (avecTangente) {
        var xt = CX + R;
        s += '<line class="tangente" x1="' + xt + '" y1="' + BORD + '" x2="' + xt + '" y2="' + (TAILLE - BORD) + '"/>';
        var c = cosD(r);
        if (Math.abs(c) > 1e-9) {
          var tn = sinD(r) / c;
          var yP = CY - R * tn;
          var yClip = Math.max(BORD, Math.min(TAILLE - BORD, yP));
          // droite (OM) jusqu'à P, coupée au cadre
          var fx = (xt - CX), fy = (yClip - CY);
          if (yP !== yClip) { fx = (xt - CX) * (yClip - CY) / (yP - CY); }
          s += '<line class="droite-om" x1="' + M[0] + '" y1="' + M[1] + '" x2="' + (CX + fx) + '" y2="' + (CY + fy) + '"/>';
          s += '<line class="droite-om" x1="' + CX + '" y1="' + CY + '" x2="' + (CX + fx) + '" y2="' + (CY + fy) + '"/>';
          s += '<line class="seg-tan" x1="' + xt + '" y1="' + CY + '" x2="' + xt + '" y2="' + yClip + '"/>';
          if (yP === yClip) {
            s += '<circle class="pt-p" cx="' + xt + '" cy="' + yP + '" r="4.5"/>';
            s += '<text class="txt-p" x="' + (xt + 7) + '" y="' + (yP + (tn >= 0 ? -6 : 14)) + '">P</text>';
          }
        } else {
          var dx = Math.cos(r * D2R), dy = Math.sin(r * D2R);
          s += '<line class="droite-om" x1="' + (CX - dx * 130) + '" y1="' + (CY + dy * 130) + '" x2="' + (CX + dx * 130) + '" y2="' + (CY - dy * 130) + '"/>';
        }
      }
      s += '<line class="proj" x1="' + M[0] + '" y1="' + M[1] + '" x2="' + M[0] + '" y2="' + CY + '"/>';
      s += '<line class="proj" x1="' + M[0] + '" y1="' + M[1] + '" x2="' + CX + '" y2="' + M[1] + '"/>';
      s += '<line class="rayon" x1="' + CX + '" y1="' + CY + '" x2="' + M[0] + '" y2="' + M[1] + '"/>';
      s += '<circle class="pt" cx="' + M[0] + '" cy="' + M[1] + '" r="5"/>';
      var lm = pt(r, R + 15);
      s += '<text class="txt-pt" x="' + lm[0].toFixed(1) + '" y="' + (lm[1] + 4).toFixed(1) + '" text-anchor="middle">M</text>';
      return s;
    }

    _rendreExplorer() {
      var e = this._el, theta = this._theta;
      var avecTan = e.tangente.checked;
      e.valeur.textContent = deg(theta);
      e.svg.innerHTML = this._svgBase() + this._svgAngle(theta, avecTan);

      var red = reduire(theta), r = red.r, q = quadrant(r);
      var tours = Math.floor(Math.abs(theta) / 360);
      var sens = theta < 0 ? "sens horaire (angle négatif)" : theta > 0 ? "sens direct" : "";
      e.reduit.innerHTML = "<b>Angle réduit</b> : " + red.calcul +
        (tours > 0 ? "<br>" + tours + " tour" + (tours > 1 ? "s" : "") + " complet" + (tours > 1 ? "s" : "") + " en " + sens + " : la spirale s'élargit à chaque tour." :
          theta < 0 ? "<br>Angle négatif : on tourne dans le sens des aiguilles d'une montre." : "");
      if (q) {
        var ref = reference(r, q);
        e.quadrant.innerHTML = "<b>Quadrant " + NOMS_Q[q] + "</b> — angle du premier quadrant : " + ref.formule + ".";
      } else {
        var pos = { 0: "sur l'axe horizontal, à droite", 90: "sur l'axe vertical, en haut", 180: "sur l'axe horizontal, à gauche", 270: "sur l'axe vertical, en bas" }[r];
        e.quadrant.innerHTML = "<b>Sur un axe</b> — M est " + pos + " : il n'appartient à aucun quadrant, on lit directement ses valeurs.";
      }
      var s = sinD(r), c = cosD(r);
      var tanDef = Math.abs(c) > 1e-12;
      var t = tanDef ? s / c : null;
      function cl(v) { return v === null ? "" : v > 1e-12 ? "plus" : v < -1e-12 ? "moins" : ""; }
      e.tbody.innerHTML =
        '<tr><th>signe</th><td class="' + cl(s) + '">' + signeTexte(s) + '</td><td class="' + cl(c) + '">' + signeTexte(c) + '</td><td class="' + cl(t) + '">' + (tanDef ? signeTexte(t) : "—") + '</td></tr>' +
        '<tr><th>valeur</th><td>' + valeur("sin", r) + '</td><td>' + valeur("cos", r) + '</td><td>' + valeur("tan", r) + '</td></tr>';
      var vc = valeur("cos", r), vs = valeur("sin", r);
      e.coords.innerHTML = vc.charAt(0) !== "≈" && vs.charAt(0) !== "≈"
        ? "M(" + deg(theta) + ") = (" + vc + " ; " + vs + ")"
        : "M(" + deg(theta) + ") ≈ (" + nombreFr(c, 3) + " ; " + nombreFr(s, 3) + ")";
      if (!avecTan) e.noteTan.textContent = "Coche « Construction de la tangente » pour lire tan θ comme une longueur sur la tangente au cercle en (1 ; 0).";
      else if (!tanDef) e.noteTan.textContent = "tan θ n'est pas définie : la droite (OM) est parallèle à la tangente, elle ne la coupe jamais.";
      else if (Math.abs(R * t) > CY - BORD) e.noteTan.textContent = "La droite (OM) coupe la tangente en P(1 ; tan θ), ici hors du cadre (tan θ ≈ " + nombreFr(t, 2) + ").";
      else e.noteTan.textContent = "La droite (OM) coupe la tangente en P(1 ; tan θ) : le segment violet mesure tan θ ≈ " + nombreFr(t, 3) + (c < 0 ? " (la droite passe par O, de l'autre côté de M)." : ".");
    }

    _rendreDefi() {
      var e = this._el, d = this._defi;
      e.defiAngle.textContent = "θ = " + deg(d.theta);
      var red = reduire(d.theta), r = red.r, q = quadrant(r);
      var sol = { q: q, sin: sinD(r) > 0 ? 1 : -1, cos: cosD(r) > 0 ? 1 : -1, tan: sinD(r) * cosD(r) > 0 ? 1 : -1 };
      e.svg.innerHTML = this._svgBase() + (d.verifie ? this._svgAngle(d.theta, false) : "");
      this._groupes.forEach(function (gr) {
        var g = gr.getAttribute("data-g");
        Array.prototype.forEach.call(gr.querySelectorAll("button"), function (b) {
          var v = parseInt(b.getAttribute("data-v"), 10);
          b.setAttribute("aria-pressed", d.choix[g] === v ? "true" : "false");
          b.disabled = d.verifie;
          b.classList.remove("juste", "faux");
          if (d.verifie) {
            if (v === sol[g]) b.classList.add("juste");
            else if (d.choix[g] === v) b.classList.add("faux");
          }
        });
      });
      e.verifier.disabled = d.verifie || !this._complet();
      e.correction.hidden = !d.verifie;
      if (!d.verifie) { e.correction.innerHTML = ""; return; }
      function marque(ok) { return ok ? '<span class="ok">✓</span> ' : '<span class="ko">✗</span> '; }
      var ref = reference(r, q);
      var items = [];
      items.push("<li>Angle réduit : " + red.calcul + "</li>");
      items.push("<li>" + marque(d.choix.q === q) + "Quadrant " + NOMS_Q[q] + " (" + deg(r) + " est entre " + [0, 90, 180, 270][q - 1] + "° et " + [90, 180, 270, 360][q - 1] + "°) ; angle du premier quadrant : " + ref.formule + ".</li>");
      items.push("<li>" + marque(d.choix.sin === sol.sin) + "sin θ " + (sol.sin > 0 ? "> 0 : M est au-dessus" : "< 0 : M est en dessous") + " de l'axe horizontal.</li>");
      items.push("<li>" + marque(d.choix.cos === sol.cos) + "cos θ " + (sol.cos > 0 ? "> 0 : M est à droite" : "< 0 : M est à gauche") + " de l'axe vertical.</li>");
      items.push("<li>" + marque(d.choix.tan === sol.tan) + "tan θ = sin θ / cos θ : " + (sol.tan > 0 ? "même signe, donc tan θ > 0." : "signes contraires, donc tan θ < 0.") + "</li>");
      e.correction.innerHTML = items.join("");
    }
  }

  if (!customElements.get("cercle-explorateur-widget")) {
    customElements.define("cercle-explorateur-widget", CercleExplorateurWidget);
  }
})();
