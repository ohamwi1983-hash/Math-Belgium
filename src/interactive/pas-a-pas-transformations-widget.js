(function () {
  "use strict";

  /* ================================================================
   * <pas-a-pas-transformations-widget> — atelier interactif : une fonction
   * transformée (préréglages des 6 familles) construite ÉTAPE PAR ÉTAPE à
   * partir de sa fonction de référence g, dans l'ordre du générateur gen11 :
   *   étape 1 — CH/EH et SOY (à l'intérieur de g),
   *   étape 2 — TH,
   *   étape 3 — EV/CV et SOX (sur le résultat de g),
   *   étape 4 — TV.
   * Formule unifiée du chapitre : f(x) = SOX·(EV/CV)·g(SOY·(CH/EH)·(x − TH)) + TV.
   * À chaque étape, la courbe précédente reste en pointillés et la nouvelle
   * est tracée en trait plein ; la formule de l'étape et le paramètre appliqué
   * sont écrits ; le point caractéristique (violet) et l'image A du point
   * (1 ; 1) de g (vert) sont suivis avec leurs coordonnées.
   * Fenêtre FIXE par préréglage (jamais recalculée d'une étape à l'autre).
   * Web Component (Shadow DOM).
   * ================================================================ */

  // sh : signe de SOY (−1 si SOY), kh : facteur horizontal effectif (> 1 : CH = kh, < 1 : EH = 1/kh),
  // th : TH, sv : signe de SOX, kv : facteur vertical effectif (> 1 : EV = kv, < 1 : CV = 1/kv), tv : TV.
  var PRESETS = [
    { id: "racine8", famille: "racine", sh: -1, kh: 2, th: 1, sv: -1, kv: 2, tv: 3, X_MIN: -6, X_MAX: 6, Y_MIN: -8, Y_MAX: 5, label: "racine carrée — les 4 étapes" },
    { id: "inverse", famille: "inverse", sh: 1, kh: 1, th: -2, sv: -1, kv: 3, tv: 1, X_MIN: -6, X_MAX: 6, Y_MIN: -8, Y_MAX: 8, label: "inverse" },
    { id: "cube", famille: "cube", sh: 1, kh: 1, th: 2, sv: 1, kv: 0.5, tv: -1, X_MIN: -3, X_MAX: 5, Y_MIN: -10, Y_MAX: 10, label: "cube" },
    { id: "carre", famille: "carre", sh: 1, kh: 0.5, th: -2, sv: -1, kv: 1, tv: 3, X_MIN: -8, X_MAX: 6, Y_MIN: -8, Y_MAX: 8, label: "carrée" },
    { id: "valeurAbsolue", famille: "valeurAbsolue", sh: 1, kh: 1, th: -1, sv: 1, kv: 2, tv: -3, X_MIN: -6, X_MAX: 5, Y_MIN: -4, Y_MAX: 8, label: "valeur absolue" },
    { id: "racineCubique", famille: "racineCubique", sh: 1, kh: 2, th: 1, sv: 1, kv: 1, tv: 1, X_MIN: -8, X_MAX: 8, Y_MIN: -4, Y_MAX: 4, label: "racine cubique" },
  ];
  var DEFAUT_PRESET = "racine8";

  var FAMILLES = {
    carre: { symbole: "x²", nom: "carrée", g: function (u) { return u * u; } },
    cube: { symbole: "x³", nom: "cube", g: function (u) { return u * u * u; } },
    racine: { symbole: "√x", nom: "racine carrée", g: function (u) { return u < -1e-12 ? NaN : Math.sqrt(Math.max(0, u)); } },
    racineCubique: { symbole: "∛x", nom: "racine cubique", g: function (u) { return (u < 0 ? -1 : 1) * Math.pow(Math.abs(u), 1 / 3); } },
    inverse: { symbole: "1/x", nom: "inverse", g: function (u) { return Math.abs(u) < 1e-9 ? NaN : 1 / u; } },
    valeurAbsolue: { symbole: "|x|", nom: "valeur absolue", g: function (u) { return Math.abs(u); } },
  };

  var NB_ETAPES = 4;
  var TITRES = [
    "Départ — la fonction de référence",
    "Étape 1 — CH/EH et SOY (à l'intérieur de g)",
    "Étape 2 — TH (translation horizontale)",
    "Étape 3 — EV/CV et SOX (sur le résultat de g)",
    "Étape 4 — TV (translation verticale)",
  ];
  var LARGEUR = 420, HAUTEUR = 320, MARGE = 34;

  function fmt(n) {
    var r = Math.round(n * 100) / 100;
    var s = (Number.isInteger(r) ? String(r) : String(r).replace(".", ","));
    return s.replace("-", "−");
  }

  function svgEl(ns, tag, attrs) {
    var el = document.createElementNS(ns, tag);
    for (var key in attrs) el.setAttribute(key, attrs[key]);
    return el;
  }

  /** Paramètres effectifs APPLIQUÉS après `etape` étapes (les étapes non encore atteintes sont neutres). */
  function parametresEtape(p, etape) {
    return {
      sh: etape >= 1 ? p.sh : 1,
      kh: etape >= 1 ? p.kh : 1,
      th: etape >= 2 ? p.th : 0,
      sv: etape >= 3 ? p.sv : 1,
      kv: etape >= 3 ? p.kv : 1,
      tv: etape >= 4 ? p.tv : 0,
    };
  }

  function fonctionEtape(p, etape) {
    var q = parametresEtape(p, etape);
    var g = FAMILLES[p.famille].g;
    return function (x) { return q.sv * q.kv * g(q.sh * q.kh * (x - q.th)) + q.tv; };
  }

  /** Argument de g, écrit comme dans le chapitre : « x », « −x », « −2x », « x − 1 », « −2(x − 1) ». */
  function texteArgument(q) {
    var c = q.sh * q.kh;
    var parenthese = q.th === 0 ? "x" : (q.th > 0 ? "x − " + fmt(q.th) : "x + " + fmt(-q.th));
    var simple = q.th === 0;
    if (c === 1) return parenthese;
    if (c === -1) return simple ? "−x" : "−(" + parenthese + ")";
    return fmt(c) + (simple ? "x" : "(" + parenthese + ")");
  }

  function texteFonction(p, etape) {
    var q = parametresEtape(p, etape);
    var arg = texteArgument(q);
    var argSimple = arg === "x";
    var m = q.sv * q.kv;
    var corps;
    if (p.famille === "inverse") {
      var num = m === 1 ? "1" : fmt(m);
      corps = num + "/" + (argSimple ? "x" : "(" + arg + ")");
    } else {
      var gx;
      if (p.famille === "carre") gx = argSimple ? "x²" : "(" + arg + ")²";
      else if (p.famille === "cube") gx = argSimple ? "x³" : "(" + arg + ")³";
      else if (p.famille === "racine") gx = argSimple ? "√x" : "√(" + arg + ")";
      else if (p.famille === "racineCubique") gx = argSimple ? "∛x" : "∛(" + arg + ")";
      else gx = "|" + arg + "|";
      corps = (m === 1 ? "" : m === -1 ? "−" : fmt(m) + "·") + gx;
    }
    if (q.tv > 0) corps += " + " + fmt(q.tv);
    else if (q.tv < 0) corps += " − " + fmt(-q.tv);
    return "y = " + corps;
  }

  function texteFacteurH(kh) {
    return kh > 1 ? "CH = " + fmt(kh) + " : compression horizontale de facteur " + fmt(kh) : "EH = " + fmt(1 / kh) + " : étirement horizontal de facteur " + fmt(1 / kh);
  }
  function texteFacteurV(kv) {
    return kv > 1 ? "EV = " + fmt(kv) + " : étirement vertical de facteur " + fmt(kv) : "CV = " + fmt(1 / kv) + " : compression verticale de facteur " + fmt(1 / kv);
  }

  /** Ce que fait l'étape `etape` (1 à 4) — ou ce qu'elle laisse inchangé. */
  function texteApplique(p, etape) {
    var parts = [];
    if (etape === 1) {
      if (p.kh !== 1) parts.push(texteFacteurH(p.kh));
      if (p.sh === -1) parts.push("SOY : symétrie d'axe Oy");
      return parts.length ? parts.join(" ; ") : "Rien à appliquer : CH/EH = 1 et pas de SOY. La courbe ne change pas.";
    }
    if (etape === 2) {
      if (p.th === 0) return "Rien à appliquer : TH = 0. La courbe ne change pas.";
      return "TH = " + fmt(p.th) + " : translation horizontale de " + fmt(Math.abs(p.th)) + (p.th > 0 ? " vers la droite" : " vers la gauche");
    }
    if (etape === 3) {
      if (p.kv !== 1) parts.push(texteFacteurV(p.kv));
      if (p.sv === -1) parts.push("SOX : symétrie d'axe Ox");
      return parts.length ? parts.join(" ; ") : "Rien à appliquer : EV/CV = 1 et pas de SOX. La courbe ne change pas.";
    }
    if (p.tv === 0) return "Rien à appliquer : TV = 0. La courbe ne change pas.";
    return "TV = " + fmt(p.tv) + " : translation verticale de " + fmt(Math.abs(p.tv)) + (p.tv > 0 ? " vers le haut" : " vers le bas");
  }

  /** Point caractéristique après `etape` étapes : (0 ; 0), puis (TH ; 0), puis (TH ; TV). */
  function pointCaracteristique(p, etape) {
    var q = parametresEtape(p, etape);
    return { x: q.th, y: q.tv };
  }

  /** Image A du point (1 ; 1) de g : g(1) = 1 pour les 6 familles ; l'argument vaut 1 pour
   * x = TH + 1/(SOY·CH/EH). */
  function pointA(p, etape) {
    var q = parametresEtape(p, etape);
    return { x: q.th + 1 / (q.sh * q.kh), y: q.sv * q.kv + q.tv };
  }

  function texteParametres(p) {
    var morceaux = [];
    morceaux.push("SOY : " + (p.sh === -1 ? "oui" : "non"));
    morceaux.push(p.kh === 1 ? "CH/EH : 1" : (p.kh > 1 ? "CH = " + fmt(p.kh) : "EH = " + fmt(1 / p.kh)));
    morceaux.push("TH = " + fmt(p.th));
    morceaux.push(p.kv === 1 ? "EV/CV : 1" : (p.kv > 1 ? "EV = " + fmt(p.kv) : "CV = " + fmt(1 / p.kv)));
    morceaux.push("SOX : " + (p.sv === -1 ? "oui" : "non"));
    morceaux.push("TV = " + fmt(p.tv));
    return morceaux.join(" · ");
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.ligne-select{display:flex;align-items:center;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:10px;}' +
    '.ligne-select label{font-weight:600;color:var(--ink,#241f1a);}' +
    'select{font:inherit;max-width:100%;padding:6px 10px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);}' +
    '.cible{text-align:center;font-family:var(--serif,serif);font-size:1.02rem;font-weight:700;color:var(--ink,#241f1a);margin:0 0 4px;}' +
    '.parametres{text-align:center;font-family:var(--mono,monospace);font-size:0.78rem;color:var(--ink-soft,#6b6055);margin:0 0 12px;line-height:1.5;}' +
    '.titre-etape{text-align:center;font-weight:700;font-size:0.95rem;color:var(--plan-ink,#443a80);margin:0 0 4px;}' +
    '.formule{text-align:center;font-family:var(--serif,serif);font-size:1.05rem;font-weight:600;color:var(--accent-ink,#7a3212);margin:0 0 6px;}' +
    '.applique{text-align:center;font-size:0.9rem;color:var(--ink,#241f1a);margin:0 0 10px;min-height:2.6em;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:10px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.courbe{stroke:var(--accent,#a8471f);stroke-width:2.6;fill:none;}' +
    '.courbe-precedente{stroke:var(--ink-faint,#9c9083);stroke-width:1.8;fill:none;stroke-dasharray:5 4;}' +
    '.asymptote{stroke:var(--ink-faint,#9c9083);stroke-width:1.1;stroke-dasharray:3 3;}' +
    '.point-caracteristique{fill:var(--plan,#5b4ea3);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.point-a{fill:var(--good,#2f7a4f);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.etiquette-graduation{font-size:10.5px;fill:var(--ink-faint,#9c9083);font-family:var(--mono,monospace);}' +
    '.etiquette-point{font-size:12px;font-weight:700;font-family:var(--mono,monospace);paint-order:stroke;stroke:var(--surface-2,#faf6f0);stroke-width:3px;}' +
    '.etiquette-c{fill:var(--plan,#5b4ea3);}' +
    '.etiquette-a{fill:var(--good,#2f7a4f);}' +
    '.legende{display:flex;justify-content:center;gap:14px;flex-wrap:wrap;font-size:0.8rem;color:var(--ink-soft,#6b6055);margin:0 0 12px;}' +
    '.legende span{display:inline-flex;align-items:center;gap:6px;}' +
    '.trait{display:inline-block;width:22px;height:0;border-top:2.6px solid var(--accent,#a8471f);}' +
    '.trait-pointille{display:inline-block;width:22px;height:0;border-top:2px dashed var(--ink-faint,#9c9083);}' +
    '.pastille{display:inline-block;width:10px;height:10px;border-radius:50%;}' +
    '.pastille-c{background:var(--plan,#5b4ea3);}' +
    '.pastille-a{background:var(--good,#2f7a4f);}' +
    '.boutons{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-bottom:12px;}' +
    'button{font:inherit;font-size:0.9rem;font-weight:600;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);cursor:pointer;min-height:40px;}' +
    'button:hover:not(:disabled){background:var(--accent-soft-line,#e8c4a4);}' +
    'button:disabled{opacity:0.45;cursor:default;}' +
    'button:focus-visible,select:focus-visible{outline:2px solid var(--plan,#5b4ea3);outline-offset:2px;}' +
    '.progression{display:flex;justify-content:center;gap:6px;margin-bottom:12px;}' +
    '.progression span{width:28px;height:6px;border-radius:3px;background:var(--line,#e2d8c8);}' +
    '.progression span.fait{background:var(--accent,#a8471f);}' +
    '.stats{display:flex;align-items:stretch;justify-content:center;gap:6px;flex-wrap:wrap;}' +
    '.stat{flex:1 1 130px;min-width:0;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:8px 4px;text-align:center;background:var(--surface,#fff);}' +
    '.stat-label{display:block;font-family:var(--mono,monospace);font-size:10px;letter-spacing:0.02em;color:var(--ink-faint,#9c9083);margin-bottom:5px;}' +
    '.stat-value{display:block;font-variant-numeric:tabular-nums;font-size:0.94rem;font-weight:600;white-space:nowrap;}' +
    '.stat-c{color:var(--plan,#5b4ea3);}' +
    '.stat-a{color:var(--good,#2f7a4f);}' +
    '</style>' +
    '<div class="ligne-select"><label for="preset">Fonction</label><select id="preset"></select></div>' +
    '<p class="cible" id="cible"></p>' +
    '<p class="parametres" id="parametres"></p>' +
    '<div class="progression" id="progression" aria-hidden="true"></div>' +
    '<p class="titre-etape" id="titre-etape"></p>' +
    '<p class="formule" id="formule"></p>' +
    '<p class="applique" id="applique" aria-live="polite"></p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Courbe à l\'étape courante et courbe de l\'étape précédente"></svg></div>' +
    '<div class="legende"><span><i class="trait"></i>étape courante</span><span><i class="trait-pointille"></i>étape précédente</span>' +
    '<span><i class="pastille pastille-c"></i>point caractéristique</span><span><i class="pastille pastille-a"></i>A, image de (1 ; 1)</span></div>' +
    '<div class="boutons">' +
    '<button type="button" id="precedent">← Étape précédente</button>' +
    '<button type="button" id="suivant">Étape suivante →</button>' +
    '<button type="button" id="reset">Recommencer</button>' +
    '</div>' +
    '<div class="stats">' +
    '<div class="stat"><span class="stat-label">point caractéristique</span><span class="stat-value stat-c" id="val-c"></span></div>' +
    '<div class="stat"><span class="stat-label">A, image de (1 ; 1)</span><span class="stat-value stat-a" id="val-a"></span></div>' +
    '</div>';

  class PasAPasTransformationsWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  PasAPasTransformationsWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._presetId = DEFAUT_PRESET;
    this._etape = 0;
    this._select = shadow.getElementById("preset");
    var self = this;
    PRESETS.forEach(function (p) {
      var opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = texteFonction(p, NB_ETAPES).replace("y = ", "") + " (" + p.label + ")";
      self._select.appendChild(opt);
    });
    this._select.value = this._presetId;
    this._cible = shadow.getElementById("cible");
    this._parametres = shadow.getElementById("parametres");
    this._progression = shadow.getElementById("progression");
    this._titre = shadow.getElementById("titre-etape");
    this._formule = shadow.getElementById("formule");
    this._applique = shadow.getElementById("applique");
    this._svg = shadow.getElementById("svg");
    this._valC = shadow.getElementById("val-c");
    this._valA = shadow.getElementById("val-a");
    this._btnPrec = shadow.getElementById("precedent");
    this._btnSuiv = shadow.getElementById("suivant");
    this._btnReset = shadow.getElementById("reset");
    for (var i = 0; i < NB_ETAPES; i++) this._progression.appendChild(document.createElement("span"));
  };

  PasAPasTransformationsWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onPreset = function () { self._presetId = self._select.value; self._etape = 0; self._rendre(); };
    this._onPrec = function () { if (self._etape > 0) { self._etape--; self._rendre(); } };
    this._onSuiv = function () { if (self._etape < NB_ETAPES) { self._etape++; self._rendre(); } };
    this._onReset = function () { self._etape = 0; self._rendre(); };
    this._select.addEventListener("change", this._onPreset);
    this._btnPrec.addEventListener("click", this._onPrec);
    this._btnSuiv.addEventListener("click", this._onSuiv);
    this._btnReset.addEventListener("click", this._onReset);
    this._rendre();
  };

  PasAPasTransformationsWidgetClass.prototype.disconnectedCallback = function () {
    this._select.removeEventListener("change", this._onPreset);
    this._btnPrec.removeEventListener("click", this._onPrec);
    this._btnSuiv.removeEventListener("click", this._onSuiv);
    this._btnReset.removeEventListener("click", this._onReset);
  };

  PasAPasTransformationsWidgetClass.prototype._preset = function () {
    for (var i = 0; i < PRESETS.length; i++) if (PRESETS[i].id === this._presetId) return PRESETS[i];
    return PRESETS[0];
  };

  PasAPasTransformationsWidgetClass.prototype._toPx = function (win, xMath, yMath) {
    var px = MARGE + (xMath - win.X_MIN) / (win.X_MAX - win.X_MIN) * (LARGEUR - 2 * MARGE);
    var py = HAUTEUR - MARGE - (yMath - win.Y_MIN) / (win.Y_MAX - win.Y_MIN) * (HAUTEUR - 2 * MARGE);
    return [px, py];
  };

  /** Trace f sur [xMin ; xMax], en coupant le tracé hors fenêtre et aux valeurs non définies. */
  PasAPasTransformationsWidgetClass.prototype._trace = function (svg, ns, win, f, classe, xMin, xMax) {
    var self = this;
    if (xMax - xMin < 1e-6) return;
    var n = Math.max(4, Math.round(320 * (xMax - xMin) / (win.X_MAX - win.X_MIN)));
    var courant = "", dernierValide = false;
    var marge = (win.Y_MAX - win.Y_MIN) * 0.05;
    for (var i = 0; i <= n; i++) {
      var xx = xMin + (i / n) * (xMax - xMin);
      var yy = f(xx);
      var valide = isFinite(yy) && yy >= win.Y_MIN - marge && yy <= win.Y_MAX + marge;
      if (valide) {
        var p = self._toPx(win, xx, Math.max(win.Y_MIN - marge, Math.min(win.Y_MAX + marge, yy)));
        courant += (!dernierValide ? "M" : "L") + p[0].toFixed(2) + " " + p[1].toFixed(2) + " ";
      } else if (dernierValide && courant) {
        svg.appendChild(svgEl(ns, "path", { d: courant.trim(), class: classe }));
        courant = "";
      }
      dernierValide = valide;
    }
    if (courant) svg.appendChild(svgEl(ns, "path", { d: courant.trim(), class: classe }));
  };

  /** Trace la courbe de l'étape `etape` (domaine propre à la famille : racine d'un seul côté de TH,
   * inverse coupée en TH). */
  PasAPasTransformationsWidgetClass.prototype._traceEtape = function (svg, ns, win, p, etape, classe) {
    var f = fonctionEtape(p, etape);
    var q = parametresEtape(p, etape);
    if (p.famille === "inverse") {
      this._trace(svg, ns, win, f, classe, win.X_MIN, q.th - 0.01);
      this._trace(svg, ns, win, f, classe, q.th + 0.01, win.X_MAX);
    } else if (p.famille === "racine") {
      if (q.sh > 0) this._trace(svg, ns, win, f, classe, Math.max(win.X_MIN, q.th), win.X_MAX);
      else this._trace(svg, ns, win, f, classe, win.X_MIN, Math.min(win.X_MAX, q.th));
    } else {
      this._trace(svg, ns, win, f, classe, win.X_MIN, win.X_MAX);
    }
  };

  PasAPasTransformationsWidgetClass.prototype._etiquette = function (svg, ns, win, px, py, texte, classe, preferer) {
    // Ancrage choisi pour rester DANS le cadre : à droite du point par défaut, à gauche près du bord droit.
    var aDroite = preferer !== "gauche";
    if (px > LARGEUR - MARGE - 70) aDroite = false;
    if (px < MARGE + 70) aDroite = true;
    var y = py - 8;
    if (y < 14) y = py + 18;
    var t = svgEl(ns, "text", { x: (px + (aDroite ? 8 : -8)).toFixed(2), y: y.toFixed(2), "text-anchor": aDroite ? "start" : "end", class: "etiquette-point " + classe });
    t.textContent = texte;
    svg.appendChild(t);
  };

  PasAPasTransformationsWidgetClass.prototype._rendre = function () {
    var p = this._preset();
    var etape = this._etape;
    var win = p;
    var self = this;

    this._cible.textContent = "Objectif : " + texteFonction(p, NB_ETAPES).replace("y = ", "f(x) = ");
    this._parametres.textContent = "Paramètres lus : " + texteParametres(p);
    this._titre.textContent = TITRES[etape];
    this._formule.textContent = texteFonction(p, etape);
    this._applique.textContent = etape === 0
      ? "On part de g(x) = " + FAMILLES[p.famille].symbole + ", la fonction de référence (" + FAMILLES[p.famille].nom + "). Clique sur « Étape suivante »."
      : texteApplique(p, etape) + (etape === NB_ETAPES ? " — c'est la fonction cherchée." : "");
    var spans = this._progression.children;
    for (var i = 0; i < spans.length; i++) spans[i].className = i < etape ? "fait" : "";
    this._btnPrec.disabled = etape === 0;
    this._btnSuiv.disabled = etape === NB_ETAPES;

    var c = pointCaracteristique(p, etape);
    var a = pointA(p, etape);
    this._valC.textContent = "(" + fmt(c.x) + " ; " + fmt(c.y) + ")";
    this._valA.textContent = "(" + fmt(a.x) + " ; " + fmt(a.y) + ")";

    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    svg.innerHTML = "";
    var defs = svgEl(ns, "defs", {});
    var fleche = svgEl(ns, "marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
    fleche.appendChild(svgEl(ns, "path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
    defs.appendChild(fleche);
    svg.appendChild(defs);

    // Axes (fenêtre fixe du préréglage) avec graduations entières légères.
    var o = self._toPx(win, 0, 0);
    for (var gx = Math.ceil(win.X_MIN); gx <= Math.floor(win.X_MAX); gx++) {
      if (gx === 0 || gx % 2 !== 0) continue;
      var pg = self._toPx(win, gx, 0);
      svg.appendChild(svgEl(ns, "line", { x1: pg[0].toFixed(2), x2: pg[0].toFixed(2), y1: (o[1] - 3).toFixed(2), y2: (o[1] + 3).toFixed(2), class: "axe" }));
      var tg = svgEl(ns, "text", { x: pg[0].toFixed(2), y: (o[1] + 14).toFixed(2), "text-anchor": "middle", class: "etiquette-graduation" });
      tg.textContent = fmt(gx);
      svg.appendChild(tg);
    }
    var pasY = (win.Y_MAX - win.Y_MIN) > 14 ? 4 : 2;
    for (var gy = Math.ceil(win.Y_MIN / pasY) * pasY; gy <= win.Y_MAX; gy += pasY) {
      if (gy === 0) continue;
      var ph = self._toPx(win, 0, gy);
      svg.appendChild(svgEl(ns, "line", { x1: (o[0] - 3).toFixed(2), x2: (o[0] + 3).toFixed(2), y1: ph[1].toFixed(2), y2: ph[1].toFixed(2), class: "axe" }));
      var th = svgEl(ns, "text", { x: (o[0] - 6).toFixed(2), y: (ph[1] + 3.5).toFixed(2), "text-anchor": "end", class: "etiquette-graduation" });
      th.textContent = fmt(gy);
      svg.appendChild(th);
    }
    svg.appendChild(svgEl(ns, "line", { x1: MARGE, x2: LARGEUR - MARGE, y1: o[1].toFixed(2), y2: o[1].toFixed(2), class: "axe", "marker-end": "url(#fleche)" }));
    svg.appendChild(svgEl(ns, "line", { x1: o[0].toFixed(2), x2: o[0].toFixed(2), y1: HAUTEUR - MARGE, y2: MARGE, class: "axe", "marker-end": "url(#fleche)" }));
    var ex = svgEl(ns, "text", { x: LARGEUR - MARGE + 4, y: (o[1] - 6).toFixed(2), class: "etiquette" });
    ex.textContent = "x";
    svg.appendChild(ex);
    var ey = svgEl(ns, "text", { x: (o[0] + 7).toFixed(2), y: MARGE - 4, class: "etiquette" });
    ey.textContent = "y";
    svg.appendChild(ey);

    // Asymptotes de l'inverse à l'étape courante (x = TH, y = TV de l'étape).
    if (p.famille === "inverse") {
      var qa = parametresEtape(p, etape);
      var h0 = self._toPx(win, win.X_MIN, qa.tv), h1 = self._toPx(win, win.X_MAX, qa.tv);
      svg.appendChild(svgEl(ns, "line", { x1: h0[0].toFixed(2), y1: h0[1].toFixed(2), x2: h1[0].toFixed(2), y2: h1[1].toFixed(2), class: "asymptote" }));
      var v0 = self._toPx(win, qa.th, win.Y_MIN), v1 = self._toPx(win, qa.th, win.Y_MAX);
      svg.appendChild(svgEl(ns, "line", { x1: v0[0].toFixed(2), y1: v0[1].toFixed(2), x2: v1[0].toFixed(2), y2: v1[1].toFixed(2), class: "asymptote" }));
    }

    if (etape > 0) this._traceEtape(svg, ns, win, p, etape - 1, "courbe-precedente");
    this._traceEtape(svg, ns, win, p, etape, "courbe");

    // Points suivis (dessinés seulement s'ils sont dans la fenêtre).
    var dans = function (pt) { return pt.x >= win.X_MIN && pt.x <= win.X_MAX && pt.y >= win.Y_MIN && pt.y <= win.Y_MAX; };
    if (dans(a)) {
      var pa = self._toPx(win, a.x, a.y);
      svg.appendChild(svgEl(ns, "circle", { cx: pa[0].toFixed(2), cy: pa[1].toFixed(2), r: 5.5, class: "point-a" }));
      self._etiquette(svg, ns, win, pa[0], pa[1], "A", "etiquette-a", a.x < c.x ? "gauche" : "droite");
    }
    if (dans(c)) {
      var pc = self._toPx(win, c.x, c.y);
      svg.appendChild(svgEl(ns, "circle", { cx: pc[0].toFixed(2), cy: pc[1].toFixed(2), r: 5.5, class: "point-caracteristique" }));
      self._etiquette(svg, ns, win, pc[0], pc[1], "C", "etiquette-c", a.x < c.x ? "droite" : "gauche");
    }
  };

  if (!customElements.get("pas-a-pas-transformations-widget")) {
    customElements.define("pas-a-pas-transformations-widget", PasAPasTransformationsWidgetClass);
  }
})();
