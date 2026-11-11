(function () {
  "use strict";

  /* ================================================================
   * <angles-associes-widget> — atelier interactif (4e, chapitre 5,
   * section « Les angles associés »). Un curseur θ ∈ [0° ; 90°] et une
   * famille (complémentaire 90° − θ, supplémentaire 180° − θ,
   * anti-supplémentaire 180° + θ, opposé −θ, et 360° − θ qui tombe sur
   * le MÊME point que −θ). Le cercle montre M(θ), son associé M′, le
   * « miroir » qui les échange (axe vertical, axe horizontal, centre O
   * ou diagonale y = x) et les projections ; les trois règles de la
   * famille s'écrivent en direct avec leurs valeurs. Fenêtre fixe :
   * seul le point M′ bouge. Web Component (Shadow DOM).
   * ================================================================ */

  var D2R = Math.PI / 180;
  var DEFAUT = { theta: 35, famille: "supp" };
  var TAILLE = 300, CX = 150, CY = 150, R = 100, AXE = 132;

  var FAMILLES = {
    comp: { nom: "Complémentaire", ecrit: "90° − θ", angle: function (t) { return 90 - t; }, miroir: "la diagonale y = x : elle échange les deux axes, donc sin et cos s'échangent" },
    supp: { nom: "Supplémentaire", ecrit: "180° − θ", angle: function (t) { return 180 - t; }, miroir: "l'axe vertical (axe des sinus) : le sinus est conservé, le cosinus change de signe" },
    anti: { nom: "Anti-supplémentaire", ecrit: "180° + θ", angle: function (t) { return 180 + t; }, miroir: "le centre O (demi-tour) : sinus et cosinus changent tous les deux de signe" },
    oppose: { nom: "Opposé", ecrit: "−θ", angle: function (t) { return -t; }, miroir: "l'axe horizontal (axe des cosinus) : le cosinus est conservé, le sinus change de signe" },
    trois: { nom: "360° − θ", ecrit: "360° − θ", angle: function (t) { return 360 - t; }, miroir: "l'axe horizontal, comme pour −θ : 360° − θ et −θ désignent le même point du cercle" },
  };
  var ORDRE = ["comp", "supp", "anti", "oppose", "trois"];

  function nombreFr(n, d) {
    var f = Math.pow(10, d);
    var a = Math.round(n * f) / f;
    if (Math.abs(a) < 1e-12) a = 0;
    return a.toFixed(d).replace(".", ",").replace("-", "−");
  }

  /** « = 0,5 » si la valeur tombe juste au millième, « ≈ 0,574 » sinon. */
  function valeurTexte(v) {
    var m = v * 1000;
    if (Math.abs(m - Math.round(m)) < 1e-6) {
      var s = nombreFr(v, 3).replace(/0+$/, "").replace(/,$/, "");
      return "= " + s;
    }
    return "≈ " + nombreFr(v, 3);
  }

  function angleTexte(a) {
    return String(a).replace("-", "−") + "°";
  }

  function tanDefinie(a) {
    var c = Math.cos(a * D2R);
    return Math.abs(c) > 1e-9;
  }

  function sinDeg(a) { var v = Math.sin(a * D2R); return Math.abs(v) < 1e-12 ? 0 : v; }
  function cosDeg(a) { var v = Math.cos(a * D2R); return Math.abs(v) < 1e-12 ? 0 : v; }
  function tanDeg(a) { return sinDeg(a) / cosDeg(a); }

  function pt(a, r) {
    return [CX + r * Math.cos(a * D2R), CY - r * Math.sin(a * D2R)];
  }

  /** Arc échantillonné de a0 à a1 (degrés, sens quelconque), + tête de flèche. */
  function arcAvecFleche(a0, a1, r, classe) {
    if (Math.abs(a1 - a0) < 0.5) return "";
    var pas = a1 > a0 ? 2 : -2;
    var d = "";
    var a = a0;
    var p = pt(a, r);
    d += "M" + p[0].toFixed(2) + " " + p[1].toFixed(2);
    while ((pas > 0 && a + pas < a1) || (pas < 0 && a + pas > a1)) {
      a += pas;
      p = pt(a, r);
      d += " L" + p[0].toFixed(2) + " " + p[1].toFixed(2);
    }
    p = pt(a1, r);
    d += " L" + p[0].toFixed(2) + " " + p[1].toFixed(2);
    var sens = a1 > a0 ? 1 : -1;
    var t = a1 * D2R;
    var dx = -Math.sin(t) * sens, dy = -Math.cos(t) * sens;
    var nx = -dy, ny = dx;
    var bx = p[0] - dx * 7, by = p[1] - dy * 7;
    var tete = "M" + p[0].toFixed(2) + " " + p[1].toFixed(2) +
      " L" + (bx + nx * 3.6).toFixed(2) + " " + (by + ny * 3.6).toFixed(2) +
      " L" + (bx - nx * 3.6).toFixed(2) + " " + (by - ny * 3.6).toFixed(2) + " Z";
    return '<path class="' + classe + '" d="' + d + '" fill="none"/>' +
      '<path class="' + classe + '-tete" d="' + tete + '"/>';
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}' +
    '*{box-sizing:border-box;}' +
    '.familles{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:0 0 14px;}' +
    '.familles button{min-height:44px;padding:6px 12px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);font-weight:600;font-family:inherit;font-size:.88rem;cursor:pointer;line-height:1.2;}' +
    '.familles button small{display:block;font-weight:500;color:var(--ink-soft,#6b6055);font-size:.78rem;}' +
    '.familles button[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);border-color:var(--accent,#a8471f);color:var(--accent-ink,#7a3212);}' +
    '.disposition{display:flex;flex-wrap:wrap;gap:16px;justify-content:center;align-items:flex-start;}' +
    '.graphe{flex:1 1 260px;max-width:340px;display:flex;justify-content:center;}' +
    'svg{width:100%;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.panneau{flex:1 1 260px;max-width:420px;display:flex;flex-direction:column;gap:10px;min-width:0;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}' +
    '.fleche-axe{fill:var(--ink-soft,#6b6055);}' +
    '.nom-axe{font-size:11px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.cercle{stroke:var(--ink-faint,#9c9083);stroke-width:1.4;fill:none;}' +
    '.miroir{stroke:var(--plan,#5b4ea3);stroke-width:3;stroke-dasharray:7 4;opacity:.75;fill:none;}' +
    '.miroir-centre{fill:var(--plan,#5b4ea3);}' +
    '.lien{stroke:var(--plan,#5b4ea3);stroke-width:1.4;stroke-dasharray:3 3;}' +
    '.proj-m{stroke:var(--accent,#a8471f);stroke-width:1.2;stroke-dasharray:4 3;}' +
    '.proj-mp{stroke:var(--good,#2f7a4f);stroke-width:1.2;stroke-dasharray:4 3;}' +
    '.rayon-m{stroke:var(--accent,#a8471f);stroke-width:2;}' +
    '.rayon-mp{stroke:var(--good,#2f7a4f);stroke-width:2;}' +
    '.arc-m{stroke:var(--accent,#a8471f);stroke-width:1.6;}' +
    '.arc-m-tete{fill:var(--accent,#a8471f);}' +
    '.arc-mp{stroke:var(--good,#2f7a4f);stroke-width:1.6;}' +
    '.arc-mp-tete{fill:var(--good,#2f7a4f);}' +
    '.pt-m{fill:var(--accent,#a8471f);}' +
    '.pt-mp{fill:var(--good,#2f7a4f);}' +
    '.et-m{font-size:12px;font-weight:700;fill:var(--accent-ink,#7a3212);font-family:var(--sans,sans-serif);}' +
    '.et-mp{font-size:12px;font-weight:700;fill:var(--good,#2f7a4f);font-family:var(--sans,sans-serif);}' +
    '.titre{font-weight:700;color:var(--accent-ink,#7a3212);margin:0;font-size:.95rem;}' +
    '.coords{margin:0;font-size:.9rem;font-variant-numeric:tabular-nums;line-height:1.6;}' +
    '.coords .m{color:var(--accent-ink,#7a3212);font-weight:600;}' +
    '.coords .mp{color:var(--good,#2f7a4f);font-weight:600;}' +
    '.miroir-txt{margin:0;font-size:.88rem;color:var(--plan-ink,var(--plan,#5b4ea3));background:var(--plan-soft,#ecebf7);padding:8px 10px;border-radius:var(--radius,3px);}' +
    '.regles{list-style:none;margin:0;padding:10px 12px;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);display:flex;flex-direction:column;gap:6px;font-variant-numeric:tabular-nums;font-size:.92rem;}' +
    '.regles li{overflow-wrap:anywhere;}' +
    '.regles .note{color:var(--ink-soft,#6b6055);font-size:.84rem;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;margin-top:14px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-height:44px;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:44px;text-align:right;}' +
    '.btn-reset{display:block;margin:12px auto 0;min-height:44px;padding:8px 16px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:.88rem;font-family:inherit;}' +
    '</style>' +
    '<div class="familles" id="familles" role="group" aria-label="Famille d\'angles associés">' +
    ORDRE.map(function (k) {
      var f = FAMILLES[k];
      var libelle = k === "trois" ? "Même point que −θ ?" : f.nom;
      return '<button type="button" data-f="' + k + '" aria-pressed="false">' + libelle + '<small>' + f.ecrit + '</small></button>';
    }).join("") +
    '</div>' +
    '<div class="disposition">' +
    '<div class="graphe"><svg id="svg" viewBox="0 0 ' + TAILLE + ' ' + TAILLE + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Cercle trigonométrique avec M(θ) et son angle associé"></svg></div>' +
    '<div class="panneau">' +
    '<p class="titre" id="titre"></p>' +
    '<p class="coords" id="coords"></p>' +
    '<p class="miroir-txt" id="miroir"></p>' +
    '<ul class="regles" id="regles"></ul>' +
    '</div></div>' +
    '<div class="curseur"><label for="theta">θ</label><div class="curseur-row">' +
    '<input type="range" id="theta" min="0" max="90" step="1" value="' + DEFAUT.theta + '">' +
    '<span class="curseur-valeur" id="theta-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>';

  class AnglesAssociesWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._theta = DEFAUT.theta;
      this._famille = DEFAUT.famille;
      this._svg = shadow.getElementById("svg");
      this._titre = shadow.getElementById("titre");
      this._coords = shadow.getElementById("coords");
      this._miroir = shadow.getElementById("miroir");
      this._regles = shadow.getElementById("regles");
      this._input = shadow.getElementById("theta");
      this._valeur = shadow.getElementById("theta-valeur");
      this._reset = shadow.getElementById("reset");
      this._boutons = Array.prototype.slice.call(shadow.querySelectorAll("#familles button"));
    }

    connectedCallback() {
      var self = this;
      this._onInput = function () { self._theta = parseInt(self._input.value, 10); self._rendre(); };
      this._onFamille = function (e) {
        var b = e.target.closest("button");
        if (!b) return;
        self._famille = b.getAttribute("data-f");
        self._rendre();
      };
      this._onReset = function () {
        self._theta = DEFAUT.theta;
        self._famille = DEFAUT.famille;
        self._input.value = String(DEFAUT.theta);
        self._rendre();
      };
      this._input.addEventListener("input", this._onInput);
      this.shadowRoot.getElementById("familles").addEventListener("click", this._onFamille);
      this._reset.addEventListener("click", this._onReset);
      this._rendre();
    }

    disconnectedCallback() {
      this._input.removeEventListener("input", this._onInput);
      this.shadowRoot.getElementById("familles").removeEventListener("click", this._onFamille);
      this._reset.removeEventListener("click", this._onReset);
    }

    _rendre() {
      var t = this._theta;
      var k = this._famille;
      var f = FAMILLES[k];
      var a2 = f.angle(t);
      this._valeur.textContent = t + "°";
      this._boutons.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-f") === k ? "true" : "false"); });

      // ---------- SVG ----------
      var s = "";
      s += '<defs><marker id="fl" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path class="fleche-axe" d="M0,0 L8,4 L0,8 Z"/></marker></defs>';
      // miroir sous les axes
      if (k === "supp") s += '<line class="miroir" x1="' + CX + '" y1="' + (CY + R + 18) + '" x2="' + CX + '" y2="' + (CY - R - 18) + '"/>';
      if (k === "oppose" || k === "trois") s += '<line class="miroir" x1="' + (CX - R - 18) + '" y1="' + CY + '" x2="' + (CX + R + 18) + '" y2="' + CY + '"/>';
      if (k === "comp") {
        var dd = (R + 22) / Math.SQRT2;
        s += '<line class="miroir" x1="' + (CX - dd) + '" y1="' + (CY + dd) + '" x2="' + (CX + dd) + '" y2="' + (CY - dd) + '"/>';
        s += '<text class="nom-axe" x="' + (CX - dd + 6) + '" y="' + (CY + dd + 4) + '">y = x</text>';
      }
      s += '<line class="axe" x1="' + (CX - AXE) + '" y1="' + CY + '" x2="' + (CX + AXE) + '" y2="' + CY + '" marker-end="url(#fl)"/>';
      s += '<line class="axe" x1="' + CX + '" y1="' + (CY + AXE) + '" x2="' + CX + '" y2="' + (CY - AXE) + '" marker-end="url(#fl)"/>';
      s += '<text class="nom-axe" x="' + (CX + AXE - 2) + '" y="' + (CY + 16) + '" text-anchor="end">cos</text>';
      s += '<text class="nom-axe" x="' + (CX + 8) + '" y="' + (CY - AXE + 10) + '">sin</text>';
      s += '<circle class="cercle" cx="' + CX + '" cy="' + CY + '" r="' + R + '"/>';
      s += '<text class="nom-axe" x="' + (k === "comp" ? CX + 5 : CX - 12) + '" y="' + (CY + 15) + '">O</text>';

      var M = pt(t, R), P = pt(a2, R);
      // projections
      s += '<line class="proj-m" x1="' + M[0] + '" y1="' + M[1] + '" x2="' + M[0] + '" y2="' + CY + '"/>';
      s += '<line class="proj-m" x1="' + M[0] + '" y1="' + M[1] + '" x2="' + CX + '" y2="' + M[1] + '"/>';
      s += '<line class="proj-mp" x1="' + P[0] + '" y1="' + P[1] + '" x2="' + P[0] + '" y2="' + CY + '"/>';
      s += '<line class="proj-mp" x1="' + P[0] + '" y1="' + P[1] + '" x2="' + CX + '" y2="' + P[1] + '"/>';
      // lien M–M′ (perpendiculaire au miroir, ou passant par O)
      if (Math.hypot(M[0] - P[0], M[1] - P[1]) > 1) {
        s += '<line class="lien" x1="' + M[0] + '" y1="' + M[1] + '" x2="' + P[0] + '" y2="' + P[1] + '"/>';
      }
      if (k === "anti") s += '<circle class="miroir-centre" cx="' + CX + '" cy="' + CY + '" r="5"/>';
      // rayons
      s += '<line class="rayon-m" x1="' + CX + '" y1="' + CY + '" x2="' + M[0] + '" y2="' + M[1] + '"/>';
      s += '<line class="rayon-mp" x1="' + CX + '" y1="' + CY + '" x2="' + P[0] + '" y2="' + P[1] + '"/>';
      // arcs orientés
      s += arcAvecFleche(0, t, 26, "arc-m");
      s += arcAvecFleche(0, a2, 42, "arc-mp");
      // points et étiquettes
      s += '<circle class="pt-m" cx="' + M[0] + '" cy="' + M[1] + '" r="5"/>';
      s += '<circle class="pt-mp" cx="' + P[0] + '" cy="' + P[1] + '" r="5"/>';
      var memePoint = Math.hypot(M[0] - P[0], M[1] - P[1]) < 14;
      var lm = pt(t, R + 17), lp = pt(a2, R + 17);
      if (memePoint) { lm = pt(t + 9, R + 18); lp = pt(t - 9, R + 18); }
      s += '<text class="et-m" x="' + lm[0] + '" y="' + (lm[1] + 4) + '" text-anchor="middle">M</text>';
      s += '<text class="et-mp" x="' + lp[0] + '" y="' + (lp[1] + 4) + '" text-anchor="middle">M′</text>';
      this._svg.innerHTML = s;

      // ---------- textes ----------
      this._titre.textContent = "θ = " + t + "° ; M′ correspond à " + f.ecrit + " = " + angleTexte(a2) +
        (k === "oppose" ? " (même point que 360° − θ = " + (360 - t) + "°)" : "");
      this._coords.innerHTML =
        '<span class="m">M(' + t + '°) ≈ (' + nombreFr(cosDeg(t), 3) + ' ; ' + nombreFr(sinDeg(t), 3) + ')</span><br>' +
        '<span class="mp">M′(' + angleTexte(a2) + ') ≈ (' + nombreFr(cosDeg(a2), 3) + ' ; ' + nombreFr(sinDeg(a2), 3) + ')</span>';
      this._miroir.textContent = "Miroir : " + f.miroir + ".";

      var A = angleTexte(a2), T = t + "°";
      var lignes = [];
      function ligne(gauche, droite, v) { lignes.push("<li>" + gauche + " = " + droite + " " + valeurTexte(v) + "</li>"); }
      if (k === "comp") {
        ligne("sin(" + A + ")", "cos(" + T + ")", sinDeg(a2));
        ligne("cos(" + A + ")", "sin(" + T + ")", cosDeg(a2));
        if (t === 0) lignes.push("<li>tan(90°) n'est pas définie (cos 90° = 0) : la règle tan(90° − θ) = 1 / tan θ ne s'applique pas, car tan 0° = 0.</li>");
        else if (t === 90) lignes.push("<li>tan(0°) = 0, mais tan(90°) n'est pas définie : la règle tan(90° − θ) = 1 / tan θ ne s'applique pas.</li>");
        else ligne("tan(" + A + ")", "1 / tan(" + T + ")", tanDeg(a2));
      } else if (k === "supp") {
        ligne("sin(" + A + ")", "sin(" + T + ")", sinDeg(a2));
        ligne("cos(" + A + ")", "−cos(" + T + ")", cosDeg(a2));
        if (t === 90) lignes.push("<li>tan(90°) n'est pas définie (cos 90° = 0).</li>");
        else ligne("tan(" + A + ")", "−tan(" + T + ")", tanDeg(a2));
      } else if (k === "anti") {
        ligne("sin(" + A + ")", "−sin(" + T + ")", sinDeg(a2));
        ligne("cos(" + A + ")", "−cos(" + T + ")", cosDeg(a2));
        if (t === 90) lignes.push("<li>tan(90°) et tan(270°) ne sont pas définies (cosinus nul).</li>");
        else ligne("tan(" + A + ")", "tan(" + T + ")", tanDeg(a2));
      } else {
        ligne("sin(" + A + ")", "−sin(" + T + ")", sinDeg(a2));
        ligne("cos(" + A + ")", "cos(" + T + ")", cosDeg(a2));
        if (t === 90) lignes.push("<li>tan(" + A + ") n'est pas définie (cosinus nul).</li>");
        else ligne("tan(" + A + ")", "−tan(" + T + ")", tanDeg(a2));
        if (k === "trois") lignes.push('<li class="note">Mêmes règles que pour −θ : un tour complet (360°) ramène au même point, donc ' + A + " et " + angleTexte(-t) + " ont les mêmes sinus, cosinus et tangente.</li>");
      }
      if (t === 0 && k !== "comp") lignes.push('<li class="note">θ = 0° : M est sur l\'axe horizontal.</li>');
      this._regles.innerHTML = lignes.join("");
    }
  }

  if (!customElements.get("angles-associes-widget")) {
    customElements.define("angles-associes-widget", AnglesAssociesWidget);
  }
})();
