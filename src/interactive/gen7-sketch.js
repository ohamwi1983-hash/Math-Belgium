/* Gen7 sketch — croquis SVG SCHÉMATIQUES (jamais à l'échelle numérique, comme les
 * croquis "allure"/"axe-sommet" du vrai gen7). Ce module construit des éléments SVG
 * dans un <svg> fourni par l'appelant (DOM requis — pas testable sous Node pur, mais
 * la géométrie est pure et vérifiable séparément si besoin). */
(function (root) {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var Sketch = {};

  function el(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  var W = 220, H = 170, OX = 40, OY = 130, OFFSET_H = 55, OFFSET_V = 42;
  /** Décalage (plus modeste que OFFSET_H) pour placer le sommet selon le signe RÉEL de xS dans
   * construireSketchPartage — un plein OFFSET_H pousserait le marqueur hors du cadre visible côté
   * gauche (OX=40 de marge seulement), alors que OFFSET_H lui-même reste nécessaire tel quel pour
   * l'écartement RELATIF entre le sommet et les racines (pxRang), qui doit rester perceptible. */
  var OFFSET_H_XS = 25;

  function axes(svg) {
    svg.appendChild(el("line", { x1: 8, y1: OY, x2: W - 8, y2: OY, class: "sk-axe" }));
    svg.appendChild(el("line", { x1: OX, y1: H - 8, x2: OX, y2: 8, class: "sk-axe" }));
    var fx = el("text", { x: W - 10, y: OY - 6, class: "sk-etiquette" }); fx.textContent = "x";
    svg.appendChild(fx);
    var fy = el("text", { x: OX + 6, y: 14, class: "sk-etiquette" }); fy.textContent = "y";
    svg.appendChild(fy);
  }

  /** Trace y=k(x-sx)²+sy échantillonné sur toute la largeur du cadre — jamais de clampage manuel,
   * le viewBox SVG (overflow hidden par défaut) rogne proprement la portion hors-cadre. */
  function tracerParabole(svg, sx, sy, k, classe) {
    var pts = [];
    var xMin = 6, xMax = W - 6;
    for (var i = 0; i <= 60; i++) {
      var x = xMin + (i / 60) * (xMax - xMin);
      var y = k * (x - sx) * (x - sx) + sy;
      pts.push((i === 0 ? "M" : "L") + x.toFixed(1) + " " + y.toFixed(1));
    }
    svg.appendChild(el("path", { d: pts.join(" "), class: classe || "sk-courbe" }));
  }

  // ---------------------------------------------------------------------
  // Croquis "allure" (écran 2) — piloté par le CHOIX partiel de l'élève,
  // jamais par les vraies valeurs de a/b (seul c, déjà connu, est réel).
  // ---------------------------------------------------------------------
  Sketch.construireSketchAllure = function (svg, choix, c) {
    svg.innerHTML = "";
    axes(svg);
    var neutre = !choix.signeA || !choix.signeAB;
    var signeA = choix.signeA === "-" ? -1 : 1;
    var dx = choix.signeAB === "+" ? -1 : (choix.signeAB === "-" ? 1 : 0);
    var sx = OX + dx * OFFSET_H;
    var cx = OX;
    // Bug réel corrigé : signe inversé par rapport à la convention correcte déjà en place dans
    // construireSketchPartage ci-dessous (c > 0 -> point AU-DESSUS de l'axe des x, donc un svg-y
    // PLUS PETIT que OY, l'axe svg-y croissant vers le bas) — le point C apparaissait sous l'axe
    // pour un c positif, et au-dessus pour un c négatif : exactement l'inverse de ce que "c" doit
    // représenter.
    var cyOffset = c > 1e-9 ? 1 : (c < -1e-9 ? -1 : 0);
    var cy = OY - cyOffset * OFFSET_V * 0.5;
    // Le sens de la concavité est piloté UNIQUEMENT par signeA — jamais par la position du point
    // C ni par le décalage horizontal issu du choix a·b (dx) : k a une magnitude FIXE, son signe
    // seul dépend de signeA, jamais recalculé depuis 2 points (bug réel corrigé : cette dérivation
    // pouvait inverser la concavité dès que a·b déplaçait sx horizontalement).
    var k = (signeA >= 0 ? -1 : 1) * 0.006;
    // sy résolu pour que la courbe passe EXACTEMENT par C (bug réel corrigé : sy était fixé
    // indépendamment de C — par |signeA| seul —, si bien que la courbe tracée ne passait pas par
    // le point C affiché, alors que la légende "c = ..." affirme implicitement le contraire).
    // Cohérent avec la nature schématique du croquis : seule la POSITION de C suit sa vraie
    // valeur, la courbe s'ajuste autour, jamais l'inverse.
    var sy = cy - k * (cx - sx) * (cx - sx);
    tracerParabole(svg, sx, sy, k, neutre ? "sk-courbe sk-neutre" : "sk-courbe");
    var pt = el("circle", { cx: cx, cy: cy, r: 4, class: "sk-point-c" });
    svg.appendChild(pt);
    var label = el("text", { x: cx + 8, y: cy - 6, class: "sk-etiquette" });
    label.textContent = "c = " + c;
    svg.appendChild(label);
  };

  // ---------------------------------------------------------------------
  // Croquis partagé Ox/Oy (écrans axeSommet / domaineImage / tableauSignes) —
  // positions RANG (jamais magnitude) des racines/xS le long de Ox.
  // ---------------------------------------------------------------------
  Sketch.construireSketchPartage = function (svg, donnees, options) {
    svg.innerHTML = "";
    axes(svg);
    var a = donnees.a, c = donnees.c, yS = donnees.yS, xS = donnees.xS;
    var colonnes = donnees.colonnesValeurs, indexSommet = donnees.indexSommet;
    var k = colonnes.length;
    // sx piloté par le signe RÉEL de xS — bug réel corrigé : sx valait TOUJOURS OX (même colonne
    // que C, x=0), quel que soit xS, dès que k===1 (racine double OU catégorie "irréductible" sans
    // racine réelle) — mais aussi en réalité pour TOUT k, puisque pxRang(indexSommet) s'annule
    // toujours par construction (rang-indexSommet=0). Résultat : le sommet s'affichait à tort à la
    // même abscisse que l'ordonnée à l'origine (jusqu'à fusionner en "S = C") dès que xS≠0 (b≠0),
    // ce qui est le cas général.
    var sx = OX + (xS > 1e-9 ? 1 : (xS < -1e-9 ? -1 : 0)) * OFFSET_H_XS;
    var cx = OX;
    // Bug réel corrigé : une racine dont la valeur RÉELLE vaut exactement 0 doit coïncider avec
    // Oy (même colonne que C) — jamais un simple décalage de rang depuis sx, qui la plaçait à côté
    // sans raison (aucun rapport avec sa vraie position). Concerne aussi bien un rang racine que
    // le rang du sommet lui-même (couvert par la formule de sx ci-dessus, cohérente avec ce même
    // principe).
    function pxRang(rang) {
      if (k === 1) return sx; // valeur unique (racine double ou "irréductible") : ancrée sur sx
      if (Math.abs(colonnes[rang]) < 1e-9) return cx;
      return sx + (rang - indexSommet) * OFFSET_H;
    }
    // Le sens de la concavité est piloté UNIQUEMENT par le signe RÉEL de a — jamais recalculé
    // depuis (sx,sy)/(cx,cy) (bug réel corrigé : avant le correctif ci-dessus, sx valait toujours
    // cx, ce qui masquait ce second bug latent — dès que sx≠cx, une dérivation géométrique du
    // genre (cy-sy)/(cx-sx)² n'a plus aucune garantie de correspondre au signe réel de a).
    var kCourbe = (a > 0 ? -1 : 1) * 0.02;
    var cy, sy;
    if (Math.abs(yS) < 1e-9) {
      // Bug réel corrigé : une racine RÉELLE double (yS=0, ex. produit_remarquable) place
      // TOUJOURS le sommet exactement SUR l'axe des x — fait mathématique absolu (Δ=0 ⟹
      // f(xS)=0), jamais une simple approximation schématique laissant le sommet flotter
      // au-dessus/en-dessous de l'axe (comme le ferait la dérivation générique ci-dessous à
      // partir du signe de c). Même principe que le cas x=0 déjà traité dans pxRang : on ancre
      // d'abord le point dont la position est un fait exact, puis on en déduit l'autre (ici cy,
      // pour que la courbe reste cohérente avec le point C affiché) — jamais l'inverse.
      sy = OY;
      cy = sy + kCourbe * (cx - sx) * (cx - sx);
    } else {
      cy = OY - (c > 1e-9 ? 1 : (c < -1e-9 ? -1 : 0)) * OFFSET_V;
      // sy résolu pour que la courbe passe EXACTEMENT par C — bug réel corrigé : la courbe ne
      // passait jamais par C (ex. par l'origine quand c=0), un fait mathématique absolu (f(0)=c),
      // jamais une simple approximation schématique tolérable ici.
      sy = cy - kCourbe * (cx - sx) * (cx - sx);
    }
    tracerParabole(svg, sx, sy, kCourbe, "sk-courbe");

    if (options && options.surlignageImage) {
      var yBord = a > 0 ? 8 : H - 8;
      svg.appendChild(el("line", { x1: cx, y1: sy, x2: cx, y2: yBord, class: "sk-surlignage" }));
    }
    if (options && options.marquesRacines && k > 1) {
      for (var i = 0; i < k; i++) {
        if (i === indexSommet) continue;
        var px = pxRang(i);
        svg.appendChild(el("circle", { cx: px, cy: OY, r: 3.5, class: "sk-point-racine" }));
        var lbl = el("text", { x: px, y: OY + 16, class: "sk-etiquette", "text-anchor": "middle" });
        lbl.textContent = i === 0 ? "x₁" : "x₂";
        svg.appendChild(lbl);
      }
    }
    if (options && options.marquesRacines && k === 1) {
      var lblDouble = el("text", { x: sx, y: OY + 16, class: "sk-etiquette", "text-anchor": "middle" });
      lblDouble.textContent = "x₁=x₂";
      svg.appendChild(lblDouble);
    }
    svg.appendChild(el("circle", { cx: cx, cy: cy, r: 3.5, class: "sk-point-c" }));
    if (Math.abs(cx - sx) > 1 || Math.abs(cy - sy) > 1) {
      svg.appendChild(el("circle", { cx: sx, cy: sy, r: 4, class: "sk-point-s" }));
      var lblS = el("text", { x: sx + (indexSommet === 0 || k === 1 ? 8 : (indexSommet === k - 1 ? -8 : 8)), y: sy - 7, class: "sk-etiquette", "text-anchor": indexSommet === k - 1 && k > 1 ? "end" : "start" });
      lblS.textContent = "S";
      svg.appendChild(lblS);
      var lblXs = el("text", { x: sx, y: OY + 16, class: "sk-etiquette", "text-anchor": "middle" });
      lblXs.textContent = "xₛ";
      if (!(options && options.marquesRacines)) svg.appendChild(lblXs);
    } else {
      svg.appendChild(el("circle", { cx: sx, cy: sy, r: 4, class: "sk-point-s" }));
      var lblSC = el("text", { x: sx + 8, y: sy - 7, class: "sk-etiquette" });
      lblSC.textContent = "S = C";
      svg.appendChild(lblSC);
    }
  };

  root.Gen7Sketch = Sketch;
})(window);

