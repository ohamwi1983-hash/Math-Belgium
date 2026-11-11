(function () {
  "use strict";

  /* ================================================================
   * <quelle-loi-widget> — défi « Quelle loi ? » (4e, ch. 5, § 6).
   * Tire un triangle dont on connaît trois éléments, de l'un des quatre
   * types AAS (2 angles + 1 côté), SAS (2 côtés + angle compris), SSS
   * (3 côtés) ou SSA (2 côtés + angle non compris, parfois 2 solutions).
   * L'élève choisit la méthode parmi 4 propositions — UN SEUL essai —,
   * puis la résolution complète s'affiche pas à pas (longueurs au
   * centième, angles au dixième de degré) avec la justification du
   * choix. « Nouveau triangle » relance, sans score.
   * Le croquis n'est pas à l'échelle d'une fenêtre fixe : c'est un
   * croquis recadré à chaque tirage (aucun curseur ne le déforme).
   * Web Component (Shadow DOM).
   * ================================================================ */

  var D2R = Math.PI / 180;
  var SVGNS = "http://www.w3.org/2000/svg";
  var LARGEUR = 420, HAUTEUR = 230, MARGE = 36;

  var METHODES = {
    somme: "Somme des angles, puis loi des sinus",
    kashiCote: "Al-Kashi pour le 3e côté, puis Al-Kashi pour un angle",
    kashiCos: "Al-Kashi résolue en cosinus, pour chaque angle",
    ambigu: "Loi des sinus, en vérifiant le cas ambigu"
  };
  var BONNE = { AAS: "somme", SAS: "kashiCote", SSS: "kashiCos", SSA: "ambigu" };
  var NOM_TYPE = {
    AAS: "2 angles et 1 côté (AAS)",
    SAS: "2 côtés et l'angle compris entre eux (SAS)",
    SSS: "3 côtés (SSS)",
    SSA: "2 côtés et un angle non compris (SSA)"
  };
  var JUSTIF = {
    AAS: "Deux angles sont connus : le troisième vient de la somme des angles (180°). On connaît alors un côté et l'angle qui lui est opposé : la loi des sinus donne les deux autres côtés.",
    SAS: "Deux côtés et l'angle compris entre eux : aucun couple « côté et angle opposé » n'est connu, donc la loi des sinus est inutilisable au départ. Al-Kashi donne directement le 3e côté ; on la réutilise ensuite, résolue en cosinus, pour un angle — un cosinus ne laisse aucune ambiguïté sur ]0° ; 180°[.",
    SSS: "Les trois côtés sont connus, mais aucun angle : seule Al-Kashi, résolue en cosinus, donne un angle — par exemple cos Â = (b² + c² − a²) / (2bc). Un cosinus détermine l'angle sans ambiguïté sur ]0° ; 180°[.",
    SSA: "On connaît un côté et l'angle qui lui est opposé (a et Â) : la loi des sinus donne sin B̂. Mais un sinus correspond à deux angles, B̂ et 180° − B̂ : il faut vérifier combien de triangles conviennent (cas ambigu)."
  };

  function rnd(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }
  function arrondi(n, d) {
    var f = Math.pow(10, d);
    var r = Math.round(n * f) / f;
    if (Object.is(r, -0)) r = 0;
    return r;
  }
  function fmt(n, d) { return arrondi(n, d).toFixed(d).replace(".", ",").replace("-", "−"); }
  function exact(n, d) { return Math.abs(n - arrondi(n, d)) < 1e-7; }
  function egal(n, d) { return (exact(n, d) ? "= " : "≈ ") + fmt(n, d); }
  function ent(n) { return String(n).replace("-", "−"); }
  function sin(x) { return Math.sin(x * D2R); }
  function cos(x) { return Math.cos(x * D2R); }
  function acosD(x) { return Math.acos(Math.max(-1, Math.min(1, x))) / D2R; }
  function asinD(x) { return Math.asin(Math.max(-1, Math.min(1, x))) / D2R; }
  function melanger(t) {
    for (var i = t.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = t[i]; t[i] = t[j]; t[j] = x; }
    return t;
  }

  /* ---------- tirages ---------- */

  function tirerAAS() {
    for (;;) {
      var A = rnd(30, 85), B = rnd(30, 85), C = 180 - A - B;
      if (C < 25 || C > 110) continue;
      var cote = Math.random() < 0.5 ? "c" : "a";
      var val = rnd(5, 12);
      var t = { type: "AAS", A: A, B: B, C: C, connus: { A: true, B: true } };
      t.connus[cote] = true;
      if (cote === "c") { t.c = val; t.a = val * sin(A) / sin(C); t.b = val * sin(B) / sin(C); }
      else { t.a = val; t.b = val * sin(B) / sin(A); t.c = val * sin(C) / sin(A); }
      t.cote = cote;
      return t;
    }
  }

  function tirerSAS() {
    var b = rnd(4, 12), c = rnd(4, 12), A = rnd(25, 140);
    var a = Math.sqrt(b * b + c * c - 2 * b * c * cos(A));
    var B = acosD((a * a + c * c - b * b) / (2 * a * c));
    return { type: "SAS", a: a, b: b, c: c, A: A, B: B, C: 180 - A - B, connus: { b: true, c: true, A: true } };
  }

  function tirerSSS() {
    for (;;) {
      var a = rnd(4, 12), b = rnd(4, 12), c = rnd(4, 12);
      var m = Math.max(a, b, c);
      if (m > a + b + c - m - 1) continue;
      var A = acosD((b * b + c * c - a * a) / (2 * b * c));
      var B = acosD((a * a + c * c - b * b) / (2 * a * c));
      return { type: "SSS", a: a, b: b, c: c, A: A, B: B, C: 180 - A - B, connus: { a: true, b: true, c: true } };
    }
  }

  function tirerSSA() {
    for (;;) {
      var A = rnd(25, 65), b = rnd(6, 12), h = b * sin(A);
      var deux = Math.random() < 0.6;
      var cands = [];
      if (deux) { for (var x = Math.ceil(h + 0.6); x <= b - 1; x++) cands.push(x); }
      else { for (var y = b; y <= b + 4; y++) cands.push(y); }
      if (!cands.length) continue;
      var a = cands[rnd(0, cands.length - 1)];
      var s = b * sin(A) / a;
      if (s >= 1) continue;
      var B1 = asinD(s), B2 = 180 - B1;
      var sols = [];
      [B1, B2].forEach(function (Bv) {
        if (A + Bv < 180 - 1e-9) {
          var Cv = 180 - A - Bv;
          sols.push({ B: Bv, C: Cv, c: a * sin(Cv) / sin(A) });
        }
      });
      if (sols.length === 2 && sols[1].C < 3) continue; // triangle trop aplati
      return { type: "SSA", a: a, b: b, A: A, sinB: s, B1: B1, B2: B2, sols: sols, B: sols[0].B, C: sols[0].C, c: sols[0].c, connus: { A: true, a: true, b: true } };
    }
  }

  function tirer() {
    var types = ["AAS", "SAS", "SSS", "SSA"];
    var t = types[rnd(0, 3)];
    return t === "AAS" ? tirerAAS() : t === "SAS" ? tirerSAS() : t === "SSS" ? tirerSSS() : tirerSSA();
  }

  /* ---------- textes ---------- */

  function nomAngle(X) { return X === "A" ? "Â" : X === "B" ? "B̂" : "Ĉ"; }

  function donnees(t) {
    var parts = [];
    ["A", "B", "C"].forEach(function (X) { if (t.connus[X]) parts.push(nomAngle(X) + " = " + ent(t[X]) + "°"); });
    ["a", "b", "c"].forEach(function (x) { if (t.connus[x]) parts.push(x + " = " + ent(t[x])); });
    return parts.join(" ; ");
  }

  function resolution(t) {
    var L = [];
    if (t.type === "AAS") {
      L.push("Ĉ = 180° − Â − B̂ = 180° − " + ent(t.A) + "° − " + ent(t.B) + "° = " + ent(t.C) + "°");
      if (t.cote === "c") {
        L.push("Loi des sinus : a / sin Â = c / sin Ĉ, donc a = " + ent(t.c) + " × sin " + ent(t.A) + "° / sin " + ent(t.C) + "° " + egal(t.a, 2));
        L.push("De même, b = c × sin B̂ / sin Ĉ = " + ent(t.c) + " × sin " + ent(t.B) + "° / sin " + ent(t.C) + "° " + egal(t.b, 2));
      } else {
        L.push("Loi des sinus : b / sin B̂ = a / sin Â, donc b = " + ent(t.a) + " × sin " + ent(t.B) + "° / sin " + ent(t.A) + "° " + egal(t.b, 2));
        L.push("De même, c = a × sin Ĉ / sin Â = " + ent(t.a) + " × sin " + ent(t.C) + "° / sin " + ent(t.A) + "° " + egal(t.c, 2));
      }
      L.push("Bilan : Ĉ = " + ent(t.C) + "°, a " + egal(t.a, 2) + ", b " + egal(t.b, 2) + ", c " + egal(t.c, 2));
    } else if (t.type === "SAS") {
      var a2 = t.a * t.a;
      L.push("Al-Kashi : a² = b² + c² − 2bc · cos Â = " + ent(t.b) + "² + " + ent(t.c) + "² − 2 × " + ent(t.b) + " × " + ent(t.c) + " × cos " + ent(t.A) + "° " + egal(a2, 2) + ", donc a " + egal(t.a, 2));
      var cb = (a2 + t.c * t.c - t.b * t.b) / (2 * t.a * t.c);
      L.push("Al-Kashi résolue en cosinus : cos B̂ = (a² + c² − b²) / (2ac) " + egal(cb, 4) + ", donc B̂ " + egal(t.B, 1) + "°");
      L.push("Ĉ = 180° − Â − B̂ " + egal(t.C, 1) + "°");
      L.push("Bilan : a " + egal(t.a, 2) + ", B̂ " + egal(t.B, 1) + "°, Ĉ " + egal(t.C, 1) + "°");
    } else if (t.type === "SSS") {
      var nA = t.b * t.b + t.c * t.c - t.a * t.a, dA = 2 * t.b * t.c;
      var nB = t.a * t.a + t.c * t.c - t.b * t.b, dB = 2 * t.a * t.c;
      L.push("cos Â = (b² + c² − a²) / (2bc) = (" + ent(t.b * t.b) + " + " + ent(t.c * t.c) + " − " + ent(t.a * t.a) + ") / " + ent(dA) + " = " + ent(nA) + " / " + ent(dA) + " " + egal(nA / dA, 4) + ", donc Â " + egal(t.A, 1) + "°");
      L.push("cos B̂ = (a² + c² − b²) / (2ac) = (" + ent(t.a * t.a) + " + " + ent(t.c * t.c) + " − " + ent(t.b * t.b) + ") / " + ent(dB) + " = " + ent(nB) + " / " + ent(dB) + " " + egal(nB / dB, 4) + ", donc B̂ " + egal(t.B, 1) + "°");
      L.push("Ĉ = 180° − Â − B̂ " + egal(t.C, 1) + "°");
      L.push("Bilan : Â " + egal(t.A, 1) + "°, B̂ " + egal(t.B, 1) + "°, Ĉ " + egal(t.C, 1) + "°");
    } else {
      L.push("Loi des sinus : sin B̂ / b = sin Â / a, donc sin B̂ = " + ent(t.b) + " × sin " + ent(t.A) + "° / " + ent(t.a) + " " + egal(t.sinB, 4));
      L.push("Deux angles ont ce sinus : B̂₁ " + egal(t.B1, 1) + "° (calculatrice, sin⁻¹) ou B̂₂ = 180° − B̂₁ " + egal(t.B2, 1) + "°");
      var somme2 = t.A + t.B2;
      if (t.sols.length === 2) {
        L.push("Test : Â + B̂₂ " + egal(somme2, 1) + "° < 180°, donc B̂₂ convient aussi : deux triangles possibles.");
        L.push("Triangle 1 : Ĉ₁ = 180° − Â − B̂₁ " + egal(t.sols[0].C, 1) + "° et c₁ = a × sin Ĉ₁ / sin Â " + egal(t.sols[0].c, 2));
        L.push("Triangle 2 : Ĉ₂ = 180° − Â − B̂₂ " + egal(t.sols[1].C, 1) + "° et c₂ = a × sin Ĉ₂ / sin Â " + egal(t.sols[1].c, 2));
      } else {
        L.push("Test : Â + B̂₂ " + egal(somme2, 1) + "° ≥ 180°, donc B̂₂ est impossible : un seul triangle.");
        L.push("Ĉ = 180° − Â − B̂₁ " + egal(t.sols[0].C, 1) + "° et c = a × sin Ĉ / sin Â " + egal(t.sols[0].c, 2));
      }
    }
    return L;
  }

  /* ---------- croquis ---------- */

  function el(tag, attrs, texte) {
    var e = document.createElementNS(SVGNS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (texte != null) e.textContent = texte;
    return e;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#182430);}' +
    '*{box-sizing:border-box;}' +
    '.consigne{margin:0 0 6px;font-size:0.92rem;}' +
    '.donnees{margin:0 0 10px;font-weight:700;font-variant-numeric:tabular-nums;color:var(--accent-ink,#7a3c11);}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:480px;height:auto;background:var(--surface-2,#f7f9fb);border-radius:var(--radius,3px);display:block;}' +
    '.tri{fill:var(--accent,#b65c1f);fill-opacity:0.08;stroke:var(--ink-soft,#51626f);stroke-width:2;stroke-linejoin:round;}' +
    '.tri2{fill:none;stroke:var(--plan,#5b4ea3);stroke-width:1.8;stroke-dasharray:6 4;}' +
    '.connu{stroke:var(--accent,#b65c1f);stroke-width:3.4;stroke-linecap:round;}' +
    '.arc-connu{fill:none;stroke:var(--accent,#b65c1f);stroke-width:2.4;}' +
    '.nom{font-size:15px;font-weight:700;fill:var(--ink,#182430);font-family:var(--serif,serif);font-style:italic;}' +
    '.val{font-size:13px;font-weight:700;fill:var(--accent-ink,#7a3c11);font-family:var(--sans,sans-serif);}' +
    '.inc{font-size:13px;fill:var(--ink-soft,#51626f);font-family:var(--serif,serif);font-style:italic;}' +
    '.val2{font-size:12px;fill:var(--plan-ink,#443a80);font-family:var(--sans,sans-serif);}' +
    '.question{margin:0 0 8px;font-weight:600;font-size:0.92rem;}' +
    '.choix{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px;margin-bottom:12px;}' +
    '.btn{min-height:44px;padding:8px 12px;border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);background:var(--surface,#fff);color:var(--ink,#182430);font-weight:600;cursor:pointer;font-family:inherit;font-size:0.9rem;text-align:left;line-height:1.3;}' +
    '.btn:disabled{cursor:default;}' +
    '.btn.juste{background:var(--good-soft,#dcefe2);border-color:var(--good,#2f7a4f);color:var(--good,#2f7a4f);}' +
    '.btn.faux{background:var(--bad-soft,#f6dede);border-color:var(--bad,#b23a3a);color:var(--bad,#b23a3a);}' +
    '.btn.juste::before{content:"✓ ";}' +
    '.btn.faux::before{content:"✗ ";}' +
    '.retour{background:var(--surface-2,#f7f9fb);border:1px solid var(--line-soft,#dfe7ec);border-radius:var(--radius,3px);padding:10px 14px;margin-bottom:12px;}' +
    '.retour p{margin:4px 0;font-size:0.9rem;line-height:1.5;}' +
    '.retour ol{margin:6px 0 0;padding-left:1.3em;}' +
    '.retour li{margin:4px 0;font-size:0.9rem;line-height:1.5;font-variant-numeric:tabular-nums;}' +
    '.verdict-ok{color:var(--good,#2f7a4f);font-weight:700;}' +
    '.verdict-ko{color:var(--bad,#b23a3a);font-weight:700;}' +
    '.type{font-weight:700;}' +
    '.actions{display:flex;justify-content:center;}' +
    '.btn-nouveau{text-align:center;background:var(--accent-soft,#f4e3d1);border-color:var(--accent-soft-line,#e6c8a4);color:var(--accent-ink,#7a3c11);}' +
    '[hidden]{display:none !important;}' +
    '</style>' +
    '<p class="consigne">On veut résoudre ce triangle : trouver tous ses côtés et tous ses angles.</p>' +
    '<p class="donnees" id="donnees"></p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" role="img" aria-label="Croquis du triangle, données connues en couleur"></svg></div>' +
    '<p class="question">Quelle méthode choisis-tu ? (un seul essai)</p>' +
    '<div class="choix" id="choix"></div>' +
    '<div class="retour" id="retour" hidden aria-live="polite"></div>' +
    '<div class="actions"><button class="btn btn-nouveau" id="nouveau" type="button">Nouveau triangle</button></div>';

  class QuelleLoiWidget extends HTMLElement {
    constructor() {
      super();
      var s = this.attachShadow({ mode: "open" });
      s.appendChild(TEMPLATE.content.cloneNode(true));
      this._s = s;
      this._svg = s.getElementById("svg");
      this._donnees = s.getElementById("donnees");
      this._choix = s.getElementById("choix");
      this._retour = s.getElementById("retour");
      this._ecouteurs = [];
    }

    connectedCallback() {
      var self = this;
      var b = this._s.getElementById("nouveau");
      var f = function () { self._nouveau(); };
      b.addEventListener("click", f);
      this._ecouteurs.push([b, "click", f]);
      this._nouveau();
    }

    disconnectedCallback() {
      this._ecouteurs.forEach(function (x) { x[0].removeEventListener(x[1], x[2]); });
      this._ecouteurs = [];
    }

    _nouveau() {
      var self = this;
      this._t = tirer();
      this._repondu = false;
      this._donnees.textContent = "Données : " + donnees(this._t);
      this._retour.hidden = true;
      this._retour.textContent = "";
      this._choix.textContent = "";
      melanger(Object.keys(METHODES)).forEach(function (id) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "btn";
        b.dataset.id = id;
        b.textContent = METHODES[id];
        b.addEventListener("click", function () { self._repondre(id); });
        self._choix.appendChild(b);
      });
      this._dessiner(false);
    }

    _repondre(id) {
      if (this._repondu) return;
      this._repondu = true;
      var t = this._t, bonne = BONNE[t.type];
      Array.prototype.forEach.call(this._choix.querySelectorAll("button"), function (b) {
        b.disabled = true;
        if (b.dataset.id === bonne) b.classList.add("juste");
        else if (b.dataset.id === id) b.classList.add("faux");
      });
      var html = "";
      html += id === bonne
        ? '<p class="verdict-ok">Bonne méthode.</p>'
        : '<p class="verdict-ko">Ce n\'est pas la bonne méthode ici. La bonne : « ' + METHODES[bonne] + ' ».</p>';
      html += '<p><span class="type">Données : ' + NOM_TYPE[t.type] + ".</span> " + JUSTIF[t.type] + "</p>";
      html += "<p><strong>Résolution</strong></p><ol>";
      resolution(t).forEach(function (l) { html += "<li>" + l.replace(/</g, "&lt;") + "</li>"; });
      html += "</ol>";
      this._retour.innerHTML = html;
      this._retour.hidden = false;
      this._dessiner(true);
    }

    _dessiner(revele) {
      var t = this._t, svg = this._svg;
      svg.textContent = "";
      // Coordonnées : A à l'origine, B sur l'axe horizontal, C au-dessus.
      var A = { x: 0, y: 0 }, B = { x: t.c, y: 0 }, C = { x: t.b * cos(t.A), y: t.b * sin(t.A) };
      var B2 = null;
      if (t.type === "SSA" && t.sols.length === 2 && revele) B2 = { x: t.sols[1].c, y: 0 };
      var pts = [A, B, C].concat(B2 ? [B2] : []);
      var xs = pts.map(function (p) { return p.x; }), ys = pts.map(function (p) { return p.y; });
      var xmin = Math.min.apply(null, xs), xmax = Math.max.apply(null, xs), ymin = Math.min.apply(null, ys), ymax = Math.max.apply(null, ys);
      var k = Math.min((LARGEUR - 2 * MARGE) / (xmax - xmin), (HAUTEUR - 2 * MARGE) / (ymax - ymin || 1));
      var ox = (LARGEUR - (xmax - xmin) * k) / 2, oy = (HAUTEUR - (ymax - ymin) * k) / 2;
      function X(p) { return ox + (p.x - xmin) * k; }
      function Y(p) { return HAUTEUR - oy - (p.y - ymin) * k; }
      function poly(P, cls) { svg.appendChild(el("polygon", { points: P.map(function (p) { return X(p) + "," + Y(p); }).join(" "), class: cls })); }

      if (B2) poly([A, B2, C], "tri2");
      poly([A, B, C], "tri");

      var G = { x: (A.x + B.x + C.x) / 3, y: (A.y + B.y + C.y) / 3 };
      var cotes = { a: [B, C], b: [A, C], c: [A, B] };
      Object.keys(cotes).forEach(function (n) {
        var P = cotes[n][0], Q = cotes[n][1];
        var M = { x: (P.x + Q.x) / 2, y: (P.y + Q.y) / 2 };
        var dx = X(M) - X(G), dy = Y(M) - Y(G), d = Math.hypot(dx, dy) || 1;
        var connu = t.connus[n];
        if (connu) svg.appendChild(el("line", { x1: X(P), y1: Y(P), x2: X(Q), y2: Y(Q), class: "connu" }));
        var txt = connu ? n + " = " + ent(t[n]) : n;
        svg.appendChild(el("text", { x: X(M) + dx / d * 16, y: Y(M) + dy / d * 16 + 5, "text-anchor": "middle", class: connu ? "val" : "inc" }, txt));
      });

      var sommets = { A: [A, B, C], B: [B, C, A], C: [C, A, B] };
      Object.keys(sommets).forEach(function (n) {
        var P = sommets[n][0], Q = sommets[n][1], R = sommets[n][2];
        var dx = X(P) - X(G), dy = Y(P) - Y(G), d = Math.hypot(dx, dy) || 1;
        svg.appendChild(el("text", { x: X(P) + dx / d * 16, y: Y(P) + dy / d * 16 + 5, "text-anchor": "middle", class: "nom" }, n));
        if (t.connus[n]) {
          var a1 = Math.atan2(Y(Q) - Y(P), X(Q) - X(P)), a2 = Math.atan2(Y(R) - Y(P), X(R) - X(P));
          var r = 22;
          var cross = Math.cos(a1) * Math.sin(a2) - Math.sin(a1) * Math.cos(a2);
          svg.appendChild(el("path", { d: "M" + (X(P) + r * Math.cos(a1)) + "," + (Y(P) + r * Math.sin(a1)) + " A" + r + "," + r + " 0 0," + (cross > 0 ? 1 : 0) + " " + (X(P) + r * Math.cos(a2)) + "," + (Y(P) + r * Math.sin(a2)), class: "arc-connu" }));
          var bis = Math.atan2(Math.sin(a1) + Math.sin(a2), Math.cos(a1) + Math.cos(a2));
          svg.appendChild(el("text", { x: X(P) + 40 * Math.cos(bis), y: Y(P) + 40 * Math.sin(bis) + 4, "text-anchor": "middle", class: "val" }, ent(t[n]) + "°"));
        }
      });
      if (B2) {
        svg.appendChild(el("text", { x: X(B2), y: Y(B2) + 20, "text-anchor": "middle", class: "val2" }, "B₂"));
      }
    }
  }

  if (!customElements.get("quelle-loi-widget")) {
    customElements.define("quelle-loi-widget", QuelleLoiWidget);
  }
})();
