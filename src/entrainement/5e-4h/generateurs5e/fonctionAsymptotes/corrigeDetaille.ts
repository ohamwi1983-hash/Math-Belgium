import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceFonctionAsymptotes } from "../../core5e/fonctionAsymptotes";
import { estGraphique, estOblique, limiteDroite, numerateurEnP } from "../../core5e/fonctionAsymptotes";
import { limiteL, limL, parL, plusL, pointC, polyL } from "../../ui5e/ecrituresLimitesLotG";
import { fL, figurePapier, formeL, horizL, nomHoriz, reponse } from "../../ui5e/formatFonctionAsymptotes";

/**
 * Corrigé détaillé « comme au tableau » de `5gen65`, une lettre par écran : a) asymptote verticale
 * → valeur qui annule le dénominateur ; b) asymptote horizontale (quotient des coefficients) ou
 * oblique (écart c/(x − p) qui tend vers 0) ; c) point du graphe : substitution, produit en croix,
 * l'inconnue isolée une opération par ligne ; d) f(x) écrite, vérifiée en A, figure annotée ;
 * e) limite à droite de p (signe du numérateur, dénominateur → 0⁺). Variantes graphiques : une
 * ligne de LECTURE (« x = 2 : asymptote verticale lue ») en tête de chaque traduction.
 */

type E = ExerciceFonctionAsymptotes;
const t = texte;
const f = latex;
const enveloppe = (svg: string) => `<div style="max-width:7cm;margin:4px auto">${svg.replace(/<svg ([^>]*?)width="([\d.]+)" height="([\d.]+)"/, '<svg $1width="100%" style="height:auto;display:block"')}</div>`;

function etapeA(e: E): EtapeCorrection[] {
  const d = e.d;
  const ob = estOblique(e);
  const L: LigneCalcul[] = [];
  if (estGraphique(e)) L.push(ligne(`x=${d.p}`, "asymptote verticale lue (pointillés)"));
  if (ob) L.push(ligne(`p=${d.p}`, [t("le dénominateur "), f("x-p"), t(" s'annule en "), f(`x=${d.p}`)]));
  else {
    L.push(ligne(`${d.p}+d=0`, [t("le dénominateur "), f("x+d"), t(" s'annule en "), f(`x=${d.p}`)]));
    L.push(ligne(`d=${-d.p}`, d.p > 0 ? `on retranche ${d.p}` : `on ajoute ${-d.p}`));
  }
  return [
    utilise("a", [t("Une fonction rationnelle a une asymptote verticale "), f("x=p"), t(" là où son dénominateur s'annule et pas son numérateur (cours, points 2 et 5).")]),
    calcul("a", L),
    resultat("a", reponse(e, "av")),
    piege("a", ob ? [t("Se tromper de signe : "), f("x-p"), t(" s'annule en "), f("x=p"), t(", pas en "), f("x=-p"), t(".")] : [t("Prendre "), f(`d=${d.p}`), t(" : "), f("x+d"), t(" s'annule en "), f("x=-d"), t(".")]),
  ];
}

function etapeB(e: E): EtapeCorrection[] {
  const d = e.d;
  const ob = estOblique(e);
  const L: LigneCalcul[] = [];
  if (estGraphique(e)) L.push(ligne(horizL(e), `asymptote ${nomHoriz(e)} lue (pointillés)`));
  if (ob) {
    L.push(ligne(`f(x)-(ax+b)=\\dfrac{c}{x-p}`, "écart entre f et la droite"));
    L.push(ligne(`\\lim\\limits_{x\\to +\\infty}\\dfrac{c}{x-p}=0`, "le dénominateur tend vers +∞"));
    L.push(ligne(`a=${d.m}`, "même pente que l'asymptote oblique"));
    L.push(ligne(`b=${d.q}`, "même ordonnée à l'origine"));
  } else {
    L.push(ligne(`\\lim\\limits_{x\\to +\\infty}\\dfrac{ax+b}{x+d}=\\dfrac{a}{1}=a`, "quotient des coefficients de x"));
    L.push(ligne(`a=${d.k}`, [t("l'asymptote horizontale est "), f(horizL(e))]));
  }
  return [
    utilise("b", ob ? [t("La droite "), f("y=ax+b"), t(" est asymptote oblique quand "), f("f(x)-(ax+b)"), t(" tend vers 0 en l'infini (cours, point 2).")] : [t("En l'infini, un quotient de polynômes de même degré tend vers le quotient de leurs coefficients de plus haut degré : c'est l'ordonnée de l'asymptote horizontale (cours, point 2).")]),
    calcul("b", L),
    resultat("b", reponse(e, "horiz")),
    piege("b", ob ? [t("Échanger pente et ordonnée à l'origine : a multiplie x.")] : [t("Prendre "), f("a=\\dfrac{1}{k}"), t(" : la limite vaut "), f("\\dfrac{a}{1}"), t(", donc a est l'ordonnée de l'asymptote elle-même.")]),
  ];
}

function etapeC(e: E): EtapeCorrection[] {
  const d = e.d;
  const ob = estOblique(e);
  const delta = d.x0 - d.p;
  const L: LigneCalcul[] = [];
  if (estGraphique(e)) L.push(ligne(`x_A=${d.x0}`, "abscisse de A, lue sur une ligne du quadrillage"), ligne(`y_A=${d.y0}`, "ordonnée de A, lue de même"));
  L.push(ligne(`f(${d.x0})=${d.y0}`, "A est sur le graphe"));
  if (ob) {
    const r = d.y0 - d.m * d.x0 - d.q;
    const mx = d.m === 1 ? parL(d.x0) : d.m === -1 ? `-${parL(d.x0)}` : `${d.m}\\cdot ${parL(d.x0)}`;
    const s0 = d.m * d.x0 + d.q;
    L.push(ligne(`${mx}${plusL(d.q)}+\\dfrac{c}{${d.x0}${plusL(-d.p)}}=${d.y0}`, "on remplace a, b, p et x"));
    if (Math.abs(delta) === 1) {
      L.push(ligne(`${s0}${delta === 1 ? "+" : "-"}c=${d.y0}`, "on calcule"));
      L.push(ligne(`${delta === 1 ? "" : "-"}c=${r}`, s0 >= 0 ? `on retranche ${s0}` : `on ajoute ${-s0}`));
      if (delta === -1) L.push(ligne(`c=${d.c}`, "on change les signes"));
    } else {
      L.push(ligne(`${s0}+\\dfrac{c}{${delta}}=${d.y0}`, "on calcule"));
      L.push(ligne(`\\dfrac{c}{${delta}}=${r}`, s0 >= 0 ? `on retranche ${s0}` : `on ajoute ${-s0}`));
      L.push(ligne(`c=${r}\\cdot ${parL(delta)}`, [t("on multiplie par "), f(`${delta}`)]));
      L.push(ligne(`c=${d.c}`));
    }
  } else {
    const kx = d.k * d.x0;
    L.push(ligne(`\\dfrac{${d.k}\\cdot ${parL(d.x0)}+b}{${d.x0}${plusL(-d.p)}}=${d.y0}`, "on remplace a, d et x"));
    if (delta === 1) L.push(ligne(`${kx}+b=${d.y0}`, "le dénominateur vaut 1"));
    else {
      L.push(ligne(`\\dfrac{${kx}+b}{${delta}}=${d.y0}`, "on calcule"));
      L.push(ligne(`${kx}+b=${d.y0}\\cdot ${parL(delta)}`, [t("on multiplie par "), f(`${delta}`)]));
      L.push(ligne(`${kx}+b=${d.y0 * delta}`));
    }
    L.push(ligne(`b=${d.y0 * delta}${plusL(-kx)}`, kx >= 0 ? `on retranche ${kx}` : `on ajoute ${-kx}`));
    L.push(ligne(`b=${d.b}`));
  }
  return [
    utilise("c", [t("Un point est sur le graphe quand ses coordonnées vérifient "), f("y=f(x)"), t(" ; une seule inconnue reste à trouver.")]),
    calcul("c", L),
    resultat("c", reponse(e, "point")),
    piege("c", Math.abs(delta) === 1 ? [t("Oublier un signe en remplaçant : mets les nombres négatifs entre parenthèses.")] : ob ? [t("S'arrêter à "), f(`\\dfrac{c}{${delta}}`), t(" : il faut encore multiplier par "), f(`${delta}`), t(".")] : [t("Oublier de multiplier par le dénominateur "), f(`${delta}`), t(" avant d'isoler b.")]),
  ];
}

function etapeD(e: E): EtapeCorrection[] {
  const d = e.d;
  const ob = estOblique(e);
  const verif = ob
    ? ligne(`f(${d.x0})=${d.m === 1 ? parL(d.x0) : d.m === -1 ? `-${parL(d.x0)}` : `${d.m}\\cdot ${parL(d.x0)}`}${plusL(d.q)}+\\dfrac{${d.c}}{${d.x0 - d.p}}=${d.y0}`)
    : ligne(`f(${d.x0})=\\dfrac{${d.k}\\cdot ${parL(d.x0)}${plusL(d.b)}}{${d.x0}${plusL(-d.p)}}=\\dfrac{${d.k * d.x0 + d.b}}{${d.x0 - d.p}}=${d.y0}`);
  return [
    utilise("d", [t("On remplace les inconnues de la forme "), f(formeL(e)), t(" par les valeurs trouvées.")]),
    { ...calcul("d", [ligne(formeL(e)), ligne(`=${fL(e)}`, ob ? [f(`a=${d.m}`), t(", "), f(`b=${d.q}`), t(", "), f(`c=${d.c}`), t(", "), f(`p=${d.p}`)] : [f(`a=${d.k}`), t(", "), f(`b=${d.b}`), t(", "), f(`d=${-d.p}`)])]), figureHtml: enveloppe(figurePapier(e, true)) },
    resultat("d", reponse(e, "fonction")),
    verification("d", [t("Le point A est bien sur le graphe :")], [verif]),
  ];
}

function etapeE(e: E): EtapeCorrection[] {
  const d = e.d;
  const ob = estOblique(e);
  const Lp = limL(pointC(d.p, "+"));
  const L: LigneCalcul[] = [];
  if (ob) {
    L.push(ligne(`${Lp}(${polyL([d.m, d.q])})=${d.m * d.p + d.q}`, "partie affine : on remplace x par p"));
    L.push(ligne(`${Lp}(${polyL([1, -d.p])})=0^{+}`, [t("pour "), f(`x>${d.p}`), t(", le dénominateur est positif")]));
    L.push(ligne(`${Lp}\\dfrac{${d.c}}{${polyL([1, -d.p])}}=${limiteL(limiteDroite(e))}`, `numérateur ${d.c > 0 ? "positif" : "négatif"} divisé par 0⁺`));
    L.push(ligne(`${Lp}f(x)=${limiteL(limiteDroite(e))}`, "nombre + infini"));
  } else {
    L.push(ligne(`${Lp}(${polyL([d.k, d.b])})=${d.k}\\cdot ${parL(d.p)}${plusL(d.b)}=${numerateurEnP(e)}`, "le numérateur ne s'annule pas en p"));
    L.push(ligne(`${Lp}(${polyL([1, -d.p])})=0^{+}`, [t("pour "), f(`x>${d.p}`), t(", le dénominateur est positif")]));
    L.push(ligne(`${Lp}f(x)=${limiteL(limiteDroite(e))}`, `${numerateurEnP(e) > 0 ? "positif" : "négatif"} divisé par 0⁺`));
  }
  return [
    utilise("e", [t("Asymptote verticale : la limite en p est infinie ; nombre non nul divisé par "), f("0^{+}"), t(" donne un infini du signe de ce nombre (cours, point 1).")]),
    calcul("e", L),
    resultat("e", reponse(e, "verifier")),
    piege("e", [t("Conclure sans tester le numérateur : s'il s'annulait aussi en p, ce serait un point vide, pas une asymptote.")]),
  ];
}

export function correctionDetailleeFonctionAsymptotes(e: E): EtapeCorrection[] {
  return [...etapeA(e), ...etapeB(e), ...etapeC(e), ...etapeD(e), ...etapeE(e)];
}
