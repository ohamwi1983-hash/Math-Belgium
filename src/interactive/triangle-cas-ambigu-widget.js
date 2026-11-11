(function () {
  "use strict";

  /* ================================================================
   * <triangle-cas-ambigu-widget> — atelier interactif : curseurs Â
   * (angle non compris), b (côté adjacent connu), a (côté opposé à Â,
   * SWINGUÉ depuis C) — matérialise en direct le « cas ambigu » SSA
   * mentionné dans la section (loi des sinus) : selon la longueur de a
   * comparée à h=b·sinÂ et à b, il y a 0, 1 ou 2 triangles possibles.
   * A est fixé à l'origine, [AB] sur l'axe horizontal (B à déterminer),
   * C = b·(cos Â ; sin Â) fixe pour un Â et un b donnés ; le cercle de
   * rayon a centré en C coupe (ou non) l'axe horizontal en 0, 1 ou 2
   * points d'abscisse positive. Sous la figure, le calcul pas à pas par la
   * loi des sinus : sin B̂ = b·sin Â / a, les deux candidats B̂₁ (aigu) et
   * B̂₂ = 180° − B̂₁, le test Â + B̂ < 180°, puis Ĉ et c pour chaque
   * triangle valide. Les triangles dessinés viennent de CE calcul (c = AB),
   * donc figure et texte ne peuvent pas diverger. Fenêtre FIXE, à la même
   * échelle sur les deux axes (les angles ne sont pas déformés), assez large
   * pour C quand Â est obtus. Web Component (Shadow DOM).
   * ================================================================ */

  var D2R = Math.PI / 180;
  var DEFAUT = { angleA: 30, b: 8, a: 5 };
  var BORNES_ANGLE = { min: 15, max: 165, step: 1 };
  var BORNES_B = { min: 4, max: 9, step: 0.1 };
  var BORNES_A = { min: 2, max: 10, step: 0.1 };

  // Échelle identique en x et en y : (LARGEUR − 2·MARGE)/(X_MAX − X_MIN) = (HAUTEUR − 2·MARGE)/(Y_MAX − Y_MIN).
  var X_MIN = -9.5, X_MAX = 19.3, Y_MIN = -1.5, Y_MAX = 10.5;
  var LARGEUR = 540, HAUTEUR = 260, MARGE = 30;
  var EPS = 1e-9;

  function formatNombreFr(n, decimales) {
    var facteur = Math.pow(10, decimales);
    var arrondi = Math.round(n * facteur) / facteur;
    if (Object.is(arrondi, -0)) arrondi = 0;
    return arrondi.toFixed(decimales).replace(".", ",").replace("-", "−");
  }

  // « = 0,8 » si l'écriture à `decimales` chiffres est exacte, sinon « ≈ 0,83 ».
  function egalOuEnviron(n, decimales) {
    var facteur = Math.pow(10, decimales);
    var exacte = Math.abs(Math.round(n * facteur) / facteur - n) < 1e-9;
    return exacte ? "= " + nombreCourt(n, decimales) : "≈ " + formatNombreFr(n, decimales);
  }

  // Écriture sans zéros inutiles : 8 plutôt que 8,0 ; 0,8 plutôt que 0,80.
  function nombreCourt(n, decimales) {
    var t = formatNombreFr(n, decimales);
    return t.indexOf(",") === -1 ? t : t.replace(/0+$/, "").replace(/,$/, "");
  }

  function svgEl(ns, tag, attrs) {
    var el = document.createElementNS(ns, tag);
    for (var key in attrs) el.setAttribute(key, attrs[key]);
    return el;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:540px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.cote-fixe{stroke:var(--ink-soft,#6b6055);stroke-width:1.8;}' +
    '.hauteur{stroke:var(--plan,#5b4ea3);stroke-width:1.3;stroke-dasharray:4 3;}' +
    '.triangle-1{stroke:var(--good,#2f7a4f);stroke-width:2;fill:var(--good,#2f7a4f);fill-opacity:0.08;}' +
    '.triangle-2{stroke:var(--accent,#a8471f);stroke-width:2;fill:var(--accent,#a8471f);fill-opacity:0.08;}' +
    '.cercle-a{stroke:var(--bad,#b23a3a);stroke-width:1.2;stroke-dasharray:3 3;fill:none;opacity:0.7;}' +
    '.sommet{fill:var(--ink,#241f1a);}' +
    '.etiquette{font-size:15px;font-weight:700;fill:var(--ink,#241f1a);font-family:var(--sans,sans-serif);}' +
    '.etiquette-h{font-size:13px;fill:var(--plan,#5b4ea3);font-family:var(--sans,sans-serif);}' +
    '.arc-a{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;fill:none;}' +
    '.etapes{margin:0 0 18px;padding:10px 14px 10px 34px;border-radius:var(--radius,3px);background:var(--surface-2,#faf6f0);color:var(--ink,#241f1a);font-size:0.88rem;line-height:1.55;}' +
    '.etapes li + li{margin-top:4px;}' +
    '.etapes li.ok{color:var(--good,#2f7a4f);}' +
    '.etapes li.ko{color:var(--bad,#b23a3a);}' +
    '.etapes li.t1{color:var(--good,#2f7a4f);font-weight:600;}' +
    '.etapes li.t2{color:var(--accent-ink,#7a3212);font-weight:600;}' +
    '.verdict{text-align:center;font-size:0.88rem;font-weight:600;margin:0 0 18px;padding:10px 14px;border-radius:var(--radius,3px);}' +
    '.verdict-0{color:var(--bad,#b23a3a);background:var(--surface-2,#faf6f0);}' +
    '.verdict-1{color:var(--accent-ink,#7a3212);background:var(--surface-2,#faf6f0);}' +
    '.verdict-2{color:var(--good,#2f7a4f);background:var(--surface-2,#faf6f0);}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-height:44px;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{min-height:44px;margin-top:2px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<p class="verdict" id="verdict"></p>' +
    '<ol class="etapes" id="etapes" aria-label="Calcul pas à pas"></ol>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="angle">Â</label><div class="curseur-row">' +
    '<input type="range" id="angle" min="' + BORNES_ANGLE.min + '" max="' + BORNES_ANGLE.max + '" step="' + BORNES_ANGLE.step + '" value="' + DEFAUT.angleA + '">' +
    '<span class="curseur-valeur" id="angle-valeur"></span></div></div>' +
    '<div class="curseur"><label for="b">b (côté AC)</label><div class="curseur-row">' +
    '<input type="range" id="b" min="' + BORNES_B.min + '" max="' + BORNES_B.max + '" step="' + BORNES_B.step + '" value="' + DEFAUT.b + '">' +
    '<span class="curseur-valeur" id="b-valeur"></span></div></div>' +
    '<div class="curseur"><label for="a">a (côté BC, opposé à Â)</label><div class="curseur-row">' +
    '<input type="range" id="a" min="' + BORNES_A.min + '" max="' + BORNES_A.max + '" step="' + BORNES_A.step + '" value="' + DEFAUT.a + '">' +
    '<span class="curseur-valeur" id="a-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class TriangleCasAmbiguWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  TriangleCasAmbiguWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._angleA = DEFAUT.angleA;
    this._b = DEFAUT.b;
    this._a = DEFAUT.a;
    this._svg = shadow.getElementById("svg");
    this._verdict = shadow.getElementById("verdict");
    this._etapes = shadow.getElementById("etapes");
    this._inputAngle = shadow.getElementById("angle");
    this._inputB = shadow.getElementById("b");
    this._inputA = shadow.getElementById("a");
    this._valeurAngle = shadow.getElementById("angle-valeur");
    this._valeurB = shadow.getElementById("b-valeur");
    this._valeurA = shadow.getElementById("a-valeur");
    this._resetBtn = shadow.getElementById("reset");
  };

  TriangleCasAmbiguWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInputAngle = function () { self._angleA = parseFloat(self._inputAngle.value); self._rendre(); };
    this._onInputB = function () { self._b = parseFloat(self._inputB.value); self._rendre(); };
    this._onInputA = function () { self._a = parseFloat(self._inputA.value); self._rendre(); };
    this._onReset = function () {
      self._angleA = DEFAUT.angleA; self._b = DEFAUT.b; self._a = DEFAUT.a;
      self._inputAngle.value = String(DEFAUT.angleA);
      self._inputB.value = String(DEFAUT.b);
      self._inputA.value = String(DEFAUT.a);
      self._rendre();
    };
    this._inputAngle.addEventListener("input", this._onInputAngle);
    this._inputB.addEventListener("input", this._onInputB);
    this._inputA.addEventListener("input", this._onInputA);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  TriangleCasAmbiguWidgetClass.prototype.disconnectedCallback = function () {
    this._inputAngle.removeEventListener("input", this._onInputAngle);
    this._inputB.removeEventListener("input", this._onInputB);
    this._inputA.removeEventListener("input", this._onInputA);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  TriangleCasAmbiguWidgetClass.prototype._toPx = function (xMath, yMath) {
    var px = MARGE + (xMath - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - 2 * MARGE);
    var py = HAUTEUR - MARGE - (yMath - Y_MIN) / (Y_MAX - Y_MIN) * (HAUTEUR - 2 * MARGE);
    return [px, py];
  };

  TriangleCasAmbiguWidgetClass.prototype._dessinerTriangle = function (svg, ns, bx, classe, nomB) {
    var A = this._toPx(0, 0);
    var C = this._toPx(this._Cx, this._Cy);
    var B = this._toPx(bx, 0);
    svg.appendChild(svgEl(ns, "path", {
      d: "M" + A[0].toFixed(2) + " " + A[1].toFixed(2) + " L" + B[0].toFixed(2) + " " + B[1].toFixed(2) + " L" + C[0].toFixed(2) + " " + C[1].toFixed(2) + " Z",
      class: classe,
    }));
    svg.appendChild(svgEl(ns, "circle", { cx: B[0].toFixed(2), cy: B[1].toFixed(2), r: 4, class: "sommet" }));
    var etB = svgEl(ns, "text", { x: B[0].toFixed(2), y: (B[1] + 18).toFixed(2), "text-anchor": "middle", class: "etiquette" });
    etB.textContent = nomB;
    svg.appendChild(etB);
  };

  // Résolution SSA par la loi des sinus : renvoie la liste des triangles valides et les étapes.
  TriangleCasAmbiguWidgetClass.prototype._resoudre = function () {
    var A = this._angleA, b = this._b, a = this._a;
    var sinA = Math.sin(A * D2R);
    var s = b * sinA / a;
    var res = { s: s, cas: "", candidats: [], triangles: [] };
    if (s > 1 + EPS) { res.cas = "impossible"; return res; }
    var B1 = Math.abs(s - 1) <= EPS ? 90 : Math.asin(s) / D2R;
    res.candidats.push({ nom: Math.abs(s - 1) <= EPS ? "B̂" : "B̂₁", B: B1 });
    if (Math.abs(s - 1) <= EPS) res.cas = "droit";
    else { res.cas = "deux"; res.candidats.push({ nom: "B̂₂", B: 180 - B1 }); }
    res.candidats.forEach(function (c) {
      c.somme = A + c.B;
      c.valide = c.somme < 180 - 1e-7;
      if (c.valide) {
        var C = 180 - A - c.B;
        var cote = a * Math.sin(C * D2R) / sinA;
        res.triangles.push({ nom: c.nom, B: c.B, C: C, c: cote });
      }
    });
    return res;
  };

  TriangleCasAmbiguWidgetClass.prototype._rendre = function () {
    var angleDeg = this._angleA, b = this._b, a = this._a;
    this._valeurAngle.textContent = formatNombreFr(angleDeg, 0) + "°";
    this._valeurB.textContent = formatNombreFr(b, 1);
    this._valeurA.textContent = formatNombreFr(a, 1);

    var angleRad = angleDeg * D2R;
    var Cx = b * Math.cos(angleRad), Cy = b * Math.sin(angleRad);
    this._Cx = Cx;
    this._Cy = Cy;
    var h = b * Math.sin(angleRad);

    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    svg.innerHTML = "";
    var self = this;

    var defs = svgEl(ns, "defs", {});
    var fleche = svgEl(ns, "marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
    fleche.appendChild(svgEl(ns, "path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
    defs.appendChild(fleche);
    svg.appendChild(defs);

    var origine = self._toPx(0, 0);
    svg.appendChild(svgEl(ns, "line", { x1: MARGE, x2: LARGEUR - MARGE, y1: origine[1].toFixed(2), y2: origine[1].toFixed(2), class: "axe", "marker-end": "url(#fleche)" }));
    svg.appendChild(svgEl(ns, "line", { x1: origine[0].toFixed(2), x2: origine[0].toFixed(2), y1: HAUTEUR - MARGE, y2: MARGE, class: "axe", "marker-end": "url(#fleche)" }));

    var res = this._resoudre();

    // Cercle de rayon a centré en C : là où il coupe la base, on trouve B.
    var pC = self._toPx(Cx, Cy), pPied = self._toPx(Cx, 0);
    var echelle = (LARGEUR - 2 * MARGE) / (X_MAX - X_MIN);
    svg.appendChild(svgEl(ns, "circle", { cx: pC[0].toFixed(2), cy: pC[1].toFixed(2), r: (a * echelle).toFixed(2), class: "cercle-a" }));

    // Hauteur h = b·sinÂ.
    svg.appendChild(svgEl(ns, "line", { x1: pC[0].toFixed(2), y1: pC[1].toFixed(2), x2: pPied[0].toFixed(2), y2: pPied[1].toFixed(2), class: "hauteur" }));
    var etH = svgEl(ns, "text", { x: (pPied[0] + 5).toFixed(2), y: ((pC[1] + pPied[1]) / 2).toFixed(2), class: "etiquette-h" });
    etH.textContent = "h ≈ " + formatNombreFr(h, 2);
    svg.appendChild(etH);

    // Arc de l'angle Â en A.
    var rArc = 22;
    svg.appendChild(svgEl(ns, "path", {
      d: "M" + (origine[0] + rArc).toFixed(2) + " " + origine[1].toFixed(2) + " A" + rArc + " " + rArc + " 0 0 0 " +
        (origine[0] + rArc * Math.cos(angleRad)).toFixed(2) + " " + (origine[1] - rArc * Math.sin(angleRad)).toFixed(2),
      class: "arc-a",
    }));

    res.triangles.forEach(function (t, i) {
      var nomB = res.triangles.length === 1 ? "B" : (i === 0 ? "B₁" : "B₂");
      self._dessinerTriangle(svg, ns, t.c, t.nom === "B̂₂" ? "triangle-2" : "triangle-1", nomB);
    });

    svg.appendChild(svgEl(ns, "circle", { cx: pC[0].toFixed(2), cy: pC[1].toFixed(2), r: 4, class: "sommet" }));
    var etC = svgEl(ns, "text", { x: pC[0].toFixed(2), y: (pC[1] - 10).toFixed(2), "text-anchor": "middle", class: "etiquette" });
    etC.textContent = "C";
    svg.appendChild(etC);
    var etA = svgEl(ns, "text", { x: (origine[0] - 4).toFixed(2), y: (origine[1] + 18).toFixed(2), "text-anchor": "end", class: "etiquette" });
    etA.textContent = "A";
    svg.appendChild(etA);

    // Verdict (nombre de triangles).
    var n = res.triangles.length;
    if (n === 0) {
      this._verdict.className = "verdict verdict-0";
      this._verdict.textContent = "AUCUN triangle possible.";
    } else if (n === 1) {
      this._verdict.className = "verdict verdict-1";
      this._verdict.textContent = res.cas === "droit" ? "1 SEUL triangle possible : il est rectangle en B." : "1 SEUL triangle possible.";
    } else {
      this._verdict.className = "verdict verdict-2";
      this._verdict.textContent = "CAS AMBIGU : 2 triangles possibles (B̂ aigu en vert, B̂ obtus en orange).";
    }

    // Calcul pas à pas.
    var etapes = [];
    var sTxt = egalOuEnviron(res.s, 2);
    etapes.push({ t: "Loi des sinus : sin B̂ = b · sin Â / a = " + nombreCourt(b, 1) + " × sin " + formatNombreFr(angleDeg, 0) + "° / " + nombreCourt(a, 1) + " " + sTxt + "." });
    if (res.cas === "impossible") {
      etapes.push({ t: "sin B̂ " + sTxt + " > 1 : impossible, un sinus ne dépasse jamais 1. Le côté a est trop court (a < h) : aucun triangle.", c: "ko" });
    } else if (res.cas === "droit") {
      var c0 = res.candidats[0];
      etapes.push({ t: "sin B̂ = 1, donc B̂ = 90° (un seul candidat)." });
      etapes.push({ t: "Test : Â + B̂ = " + formatNombreFr(c0.somme, 0) + "° " + (c0.valide ? "< 180° ✓" : "≥ 180° ✗"), c: c0.valide ? "ok" : "ko" });
    } else {
      var c1 = res.candidats[0], c2 = res.candidats[1];
      etapes.push({ t: "Deux candidats : B̂₁ " + egalOuEnviron(c1.B, 1) + "° (aigu, touche sin⁻¹) et B̂₂ = 180° − B̂₁ " + egalOuEnviron(c2.B, 1) + "° (obtus)." });
      [c1, c2].forEach(function (c) {
        etapes.push({ t: "Test " + c.nom + " : Â + " + c.nom + " " + egalOuEnviron(c.somme, 1) + "° " + (c.valide ? "< 180° ✓" : "≥ 180° ✗ — ce candidat est rejeté"), c: c.valide ? "ok" : "ko" });
      });
    }
    res.triangles.forEach(function (t, i) {
      var couleur = t.nom === "B̂₂" ? "orange" : "vert";
      var titre = res.triangles.length === 1 ? "Triangle" : "Triangle " + (i + 1) + " (" + couleur + ")";
      etapes.push({
        t: titre + " : Ĉ = 180° − Â − " + t.nom + " " + egalOuEnviron(t.C, 1) + "°, puis c = a · sin Ĉ / sin Â " + egalOuEnviron(t.c, 2) + ".",
        c: t.nom === "B̂₂" ? "t2" : "t1",
      });
    });
    this._etapes.innerHTML = "";
    etapes.forEach(function (e) {
      var li = document.createElement("li");
      li.textContent = e.t;
      if (e.c) li.className = e.c;
      self._etapes.appendChild(li);
    });
  };

  if (!customElements.get("triangle-cas-ambigu-widget")) {
    customElements.define("triangle-cas-ambigu-widget", TriangleCasAmbiguWidgetClass);
  }
})();
