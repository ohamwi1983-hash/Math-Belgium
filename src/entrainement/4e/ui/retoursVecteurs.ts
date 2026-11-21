import type { FragmentConsigne } from "./formatEquationDroite";
import { latex, texte } from "../../export/corrigeTableau";
import { col, coefVec, pointL, q, qp, vec, type V } from "./corrigeVecteurs1";
import type { ExercicePointVectoriel } from "../core/pointVectoriel.types";
import type { ExerciceRelationGeneraleRV, ExerciceRelationVectorielle } from "../core/relationVectorielle.types";

/**
 * Règles communes des anciens générateurs du chapitre 6 de 4e (« Calcul vectoriel », gen20–gen29 ;
 * audit 4e ch. 6, lot B) — modèle `components/RetourSaisie.tsx` (lot B du 4e ch. 2, appliqué au
 * ch. 5) :
 * - une saisie ILLISIBLE n'atteint jamais le moteur (aucune tentative), avec un message PAR NATURE
 *   de champ (jamais « la place de x » dans un champ de coordonnées) ;
 * - message ciblé sur l'erreur du cours trahie par la dernière réponse fausse, jamais la réponse ;
 * - aides à deux niveaux en KaTeX : niveau 1 = la propriété du cours, niveau 2 = comment l'appliquer
 *   ICI (une coordonnée posée, l'autre laissée à l'élève), jamais le résultat.
 * Ce fichier : messages d'illisible, outils et générateurs 20, 21 ; `retoursVecteurs2.ts` : 22 à
 * 24 ; `retoursVecteurs3.ts` : 25, 26 ; `retoursVecteurs4.ts` : 29 (27 et 28 : dans leurs écrans).
 */

export type Fragments = FragmentConsigne[];
export type Niveaux = Fragments[];

const SANS_TENTATIVE = " Cette saisie ne compte pas comme une tentative.";

/** Messages d'illisible par nature de champ (G2). */
export const ILLISIBLE_VECTEURS = {
  coordonnee: `Nombre non reconnu : écris chaque coordonnée, par exemple −3, 2,5 ou 7/2 (virgule ou point).${SANS_TENTATIVE}`,
  composante: `Nombre non reconnu : écris chaque composante, par exemple −4, 1,5 ou 3/2 (virgule ou point).${SANS_TENTATIVE}`,
  composanteX: `Expression non reconnue : écris chaque composante en fonction de x, par exemple 2x − 3 ou 5 (vérifie les signes et les parenthèses).${SANS_TENTATIVE}`,
  combinaison: `Expression non reconnue : écris une combinaison des vecteurs, un coefficient devant chaque nom, par exemple −3u + 2v + 4AB (sans flèche).${SANS_TENTATIVE}`,
  critere: `Nombre non reconnu : écris la valeur du critère, un nombre comme −14 ou 0.${SANS_TENTATIVE}`,
  produitScalaire: `Nombre non reconnu : écris la valeur du produit scalaire, un nombre comme −14 ou 0.${SANS_TENTATIVE}`,
  equationX: `Équation non reconnue : écris l'équation réduite en x, par exemple 3x − 6 = 0 ou x² − 16 = 0 (vérifie les signes et les parenthèses).${SANS_TENTATIVE}`,
  valeurX: `Nombre non reconnu : écris la valeur de x, par exemple −3, 2,5 ou 5/2.${SANS_TENTATIVE}`,
  valeursX: `Nombre non reconnu : écris chaque valeur de x, par exemple −3 ou 5/2 (un nombre par champ).${SANS_TENTATIVE}`,
  norme: `Écriture non reconnue : écris la valeur exacte, un entier ou une racine comme √29, 3√5 ou rac(29).${SANS_TENTATIVE}`,
  normeApprochee: `C'est une valeur approchée : on demande la valeur exacte, un entier ou une racine comme √29 ou 3√5.${SANS_TENTATIVE}`,
  longueurCarree: `Nombre non reconnu : écris le carré de la longueur, un entier comme 25.${SANS_TENTATIVE}`,
  traduction: `Égalité non reconnue : écris une égalité entre différences de points, par exemple Q − P = 2(R − P) ou Q = P + 2(R − P).${SANS_TENTATIVE}`,
  vecteurNomme: `Vecteur non reconnu : écris un vecteur par ses deux lettres, par exemple AB (ou 0 pour le vecteur nul).${SANS_TENTATIVE}`,
  norme29: `Nombre non reconnu : écris un nombre, par exemple 112,8 (virgule ou point).${SANS_TENTATIVE}`,
  angle: `Nombre non reconnu : écris un angle en degrés, par exemple 21,8 (le symbole ° est facultatif).${SANS_TENTATIVE}`,
  egaliteVecteurs: `Égalité non reconnue : écris chaque égalité avec les lettres des vecteurs, par exemple u = 3v ou u = −v/2.${SANS_TENTATIVE}`,
} as const;

type SegmentAncien = { type: "texte" | "katex"; valeur: string };

/** Aides d'un ancien format (segments texte / KaTeX, cumulatives par niveau : `aide(2)` reprend
 * `aide(1)`) → deux niveaux de fragments, le niveau 2 sans répéter le niveau 1. */
export function aidesParNiveau(aide: (niveau: number) => SegmentAncien[][]): Niveaux {
  const versFragments = (lignes: SegmentAncien[][]): Fragments =>
    lignes.flatMap((ligne, i) => [...(i > 0 ? [texte(" ")] : []), ...ligne.map((s) => (s.type === "katex" ? latex(s.valeur) : texte(s.valeur)))]);
  const n1 = aide(1);
  return [versFragments(n1), versFragments(aide(2).slice(n1.length))];
}

// ---------------------------------------------------------------------------------------------
// Outils
// ---------------------------------------------------------------------------------------------

const EPS = 1e-6;
export function egal(a: number, b: number): boolean {
  return Number.isFinite(a) && Math.abs(a - b) < EPS;
}
export function memePoint(r: V, c: V): boolean {
  return egal(r.x, c.x) && egal(r.y, c.y);
}
/** Premier message dont le candidat (réponse fausse typique) coïncide avec la saisie. */
export function premierCandidat(saisie: V, candidats: { valeur: V; message: Fragments }[], attendu: V): Fragments | null {
  if (memePoint(saisie, attendu)) return null;
  for (const c of candidats) if (!memePoint(c.valeur, attendu) && memePoint(saisie, c.valeur)) return c.message;
  if (egal(saisie.x, attendu.y) && egal(saisie.y, attendu.x) && !egal(attendu.x, attendu.y)) return [texte("Tes deux valeurs sont échangées : l'abscisse (première coordonnée) s'écrit en premier.")];
  return null;
}
const addV = (a: V, b: V): V => ({ x: a.x + b.x, y: a.y + b.y });
const subV = (a: V, b: V): V => ({ x: a.x - b.x, y: a.y - b.y });
const mulV = (k: number, a: V): V => ({ x: k * a.x, y: k * a.y });

export const MESSAGE_COMPOSANTES_INVERSEES: Fragments = [texte("Les composantes d'un vecteur se calculent « extrémité − origine » : "), latex("\\vec{AB}=B-A"), texte(", pas A − B (ce serait le vecteur opposé).")];

// ---------------------------------------------------------------------------------------------
// gen20 — point à partir d'une relation vectorielle (un écran)
// ---------------------------------------------------------------------------------------------

export function aidesPointVectoriel(e: ExercicePointVectoriel): Niveaux {
  const P = e.pointCherche;
  if (e.variante === "translation") {
    const A = e.labelPoint;
    return [
      [texte(`L'image d'un point par une translation : on ajoute les composantes du vecteur aux coordonnées du point. Ici, `), latex(`${vec(`${A}${P}`)}=${col(e.translation)}`), texte(" : "), latex(`x_{${P}}=x_${A}+${qp(e.translation.x)}`), texte(".")],
      [texte("Abscisse : "), latex(`x_{${P}}=${q(e.point.x)}+${qp(e.translation.x)}`), texte(". Fais le même calcul pour l'ordonnée, avec "), latex(`y_${A}`), texte(" et la seconde composante.")],
    ];
  }
  if (e.variante === "milieu") {
    const { labelA: a, labelB: b } = e;
    return [
      [texte(`Les coordonnées du milieu sont les moyennes des coordonnées des extrémités : `), latex(`x_${P}=\\dfrac{x_${a}+x_${b}}{2}`), texte(" et "), latex(`y_${P}=\\dfrac{y_${a}+y_${b}}{2}`), texte(".")],
      [texte("Abscisse : "), latex(`x_${P}=\\dfrac{${q(e.pointA.x)}+${qp(e.pointB.x)}}{2}`), texte(". Même calcul pour l'ordonnée.")],
    ];
  }
  if (e.variante === "symetrique") {
    const { labelA: a, labelCentre: c } = e;
    return [
      [texte(`${P} est le symétrique de ${a} par rapport à ${c} : ${c} est le milieu de [${a}${P}]. On peut aussi écrire `), latex(`${vec(`${a}${c}`)}=${vec(`${c}${P}`)}`), texte(` : on part de ${c} et on avance encore une fois de `), latex(vec(`${a}${c}`)), texte(".")],
      [texte(`Comme ${c} est le milieu, `), latex(`x_${c}=\\dfrac{x_${a}+x_{${P}}}{2}`), texte(", donc "), latex(`x_{${P}}=2x_${c}-x_${a}=2\\cdot ${qp(e.centre.x)}-${qp(e.pointA.x)}`), texte(". Même calcul pour l'ordonnée.")],
    ];
  }
  if (e.forme === "pointAPoint") {
    const { labelOrigine: b, labelConnu: c } = e;
    return [
      [texte("Calcule d'abord les composantes du vecteur connu (extrémité − origine), multiplie-les par le coefficient, puis ajoute le résultat aux coordonnées du point de départ : "), latex(`${P}=${b}+${coefVec(e.coefficient)}${vec(`${b}${c}`)}`), texte(".")],
      [latex(`${vec(`${b}${c}`)}`), texte(" a pour première composante "), latex(`${q(e.pointConnu.x)}-${qp(e.pointOrigine.x)}`), texte(" ; le vecteur multiplié part de "), latex(b), texte(", donc "), latex(`x_${P}=${q(e.pointOrigine.x)}+${qp(e.coefficient)}\\cdot(${q(e.pointConnu.x)}-${qp(e.pointOrigine.x)})`), texte(". Même calcul pour l'ordonnée.")],
    ];
  }
  const { labelDepart: a, labelU: u, labelV: v } = e;
  return [
    [texte("Multiplie chaque vecteur par son coefficient (les deux composantes), additionne composante par composante, puis ajoute aux coordonnées du point de départ : "), latex(`${P}=${a}+${vec(`${a}${P}`)}`), texte(".")],
    [texte("Abscisse : "), latex(`x_${P}=${q(e.pointDepart.x)}+${qp(e.coefU)}\\cdot ${qp(e.vecteurU.x)}+${qp(e.coefV)}\\cdot ${qp(e.vecteurV.x)}`), texte(" (premières composantes de "), latex(vec(u)), texte(" et "), latex(vec(v)), texte("). Même calcul pour l'ordonnée.")],
  ];
}

export function messagePointVectoriel(e: ExercicePointVectoriel, s: V): Fragments | null {
  const r = e.reponse;
  if (e.variante === "translation") {
    return premierCandidat(s, [
      { valeur: subV(e.point, e.translation), message: [texte("Tu as retiré les composantes du vecteur : une translation ajoute les composantes du vecteur aux coordonnées du point.")] },
      { valeur: e.translation, message: [texte(`Ce sont les composantes du vecteur : il faut encore les ajouter aux coordonnées de ${e.labelPoint}.`)] },
    ], r);
  }
  if (e.variante === "milieu") {
    const d = subV(e.pointB, e.pointA);
    return premierCandidat(s, [
      { valeur: mulV(0.5, d), message: [texte("Tu as pris la demi-différence des coordonnées : le milieu est la moyenne, la somme des coordonnées divisée par 2.")] },
      { valeur: mulV(-0.5, d), message: [texte("Tu as pris la demi-différence des coordonnées : le milieu est la moyenne, la somme des coordonnées divisée par 2.")] },
      { valeur: d, message: [texte("Tu as calculé la différence des coordonnées, c'est-à-dire les composantes du vecteur : le milieu se calcule avec leur somme, divisée par 2.")] },
      { valeur: addV(e.pointA, e.pointB), message: [texte("Tu as additionné les coordonnées : il reste à diviser par 2.")] },
    ], r);
  }
  if (e.variante === "symetrique") {
    return premierCandidat(s, [
      { valeur: mulV(0.5, addV(e.pointA, e.centre)), message: [texte(`C'est le milieu de [${e.labelA}${e.labelCentre}] : ${e.labelCentre} doit être le milieu de [${e.labelA}${e.pointCherche}], le point cherché est de l'autre côté de ${e.labelCentre}.`)] },
      { valeur: subV(e.centre, e.pointA), message: [texte("Ce sont les composantes du vecteur "), latex(vec(`${e.labelA}${e.labelCentre}`)), texte(` : il faut encore les ajouter aux coordonnées de ${e.labelCentre}.`)] },
      { valeur: subV(mulV(2, e.pointA), e.centre), message: [texte(`Tu as construit le symétrique de ${e.labelCentre} par rapport à ${e.labelA} : c'est ${e.labelCentre} le centre.`)] },
    ], r);
  }
  if (e.forme === "pointAPoint") {
    const be = subV(e.pointConnu, e.pointOrigine);
    const k = e.coefficient;
    return premierCandidat(s, [
      { valeur: mulV(k, be), message: [texte("Ce sont les composantes de "), latex(vec(`${e.labelOrigine}${e.pointCherche}`)), texte(` : ajoute-les aux coordonnées de ${e.labelOrigine} pour obtenir le point.`)] },
      { valeur: addV(e.pointOrigine, mulV(-k, be)), message: MESSAGE_COMPOSANTES_INVERSEES },
      { valeur: addV(e.pointConnu, mulV(k, be)), message: [texte(`Le vecteur multiplié part de ${e.labelOrigine} : on ajoute le résultat aux coordonnées de ${e.labelOrigine}, pas à celles de ${e.labelConnu}.`)] },
      { valeur: mulV(k, e.pointConnu), message: [texte(`Le coefficient multiplie le vecteur `), latex(vec(`${e.labelOrigine}${e.labelConnu}`)), texte(`, pas les coordonnées du point ${e.labelConnu}.`)] },
    ], r);
  }
  const somme = addV(mulV(e.coefU, e.vecteurU), mulV(e.coefV, e.vecteurV));
  return premierCandidat(s, [
    { valeur: somme, message: [texte("Ce sont les composantes de "), latex(vec(`${e.labelDepart}${e.pointCherche}`)), texte(` : ajoute-les aux coordonnées de ${e.labelDepart} pour obtenir le point.`)] },
    { valeur: subV(e.pointDepart, somme), message: [texte(`On ajoute les composantes du vecteur aux coordonnées de ${e.labelDepart} : `), latex(`${e.pointCherche}=${e.labelDepart}+${vec(`${e.labelDepart}${e.pointCherche}`)}`), texte(".")] },
  ], r);
}

// ---------------------------------------------------------------------------------------------
// gen21 — relation vectorielle (guidée) : traduction, puis coordonnées
// ---------------------------------------------------------------------------------------------

export function aidesTraductionRV(e: ExerciceRelationGeneraleRV): Niveaux {
  const { labelOrigine: b, labelConnu: c, pointCherche: P } = e;
  return [
    [texte("Un vecteur s'écrit « extrémité − origine » : "), latex(`${vec("AB")}=B-A`), texte(". Remplace chaque vecteur de la relation par cette différence de points.")],
    [latex(`${vec(`${b}${P}`)}`), texte(" devient "), latex(`${P}-${b}`), texte(" et "), latex(vec(`${b}${c}`)), texte(" devient "), latex(`${c}-${b}`), texte(" ; le coefficient de la relation reste devant la parenthèse.")],
  ];
}

export function messageTraductionRV(e: ExerciceRelationGeneraleRV, texteSaisi: string): Fragments | null {
  const t = texteSaisi.replace(/\s+/g, "").replace(/[−–—]/g, "-").toUpperCase();
  const { labelOrigine: b, labelConnu: c, pointCherche: P } = e;
  if (t.includes(`${b}-${P}`) && !t.includes(`${P}-${b}`)) return [texte("Toujours « extrémité − origine » : "), latex(vec(`${b}${P}`)), texte(" s'écrit "), latex(`${P}-${b}`), texte(".")];
  if (t.includes(`${b}-${c}`) && !t.includes(`${c}-${b}`)) return [texte("Toujours « extrémité − origine » : "), latex(vec(`${b}${c}`)), texte(" s'écrit "), latex(`${c}-${b}`), texte(".")];
  if (t.includes(`${P}-${b}`) && t.includes(`${c}-${b}`)) return [texte("Les différences de points sont justes : relis le coefficient de la relation.")];
  return null;
}

export function aidesCoordonneesRV(e: ExerciceRelationVectorielle): Niveaux {
  const P = e.pointCherche;
  if (e.variante === "translation") {
    const A = e.labelPoint;
    return [
      [texte("L'image d'un point par une translation : on ajoute les composantes du vecteur aux coordonnées du point, "), latex(`x_{${P}}=x_${A}+${qp(e.translation.x)}`), texte(".")],
      [texte("Abscisse : "), latex(`x_{${P}}=${q(e.point.x)}+${qp(e.translation.x)}`), texte(". Même calcul pour l'ordonnée ; le graphe montre le vecteur tracé depuis "), latex(A), texte(".")],
    ];
  }
  const { labelOrigine: b, labelConnu: c, coefficient: k } = e;
  return [
    [texte("D'après la traduction, "), latex(`${P}=${b}+${coefVec(k)}(${c}-${b})`), texte(" : calcule les composantes de "), latex(vec(`${b}${c}`)), texte(", multiplie-les par le coefficient, puis ajoute-les aux coordonnées de "), latex(b), texte(".")],
    [texte("Abscisse : "), latex(`x_${P}=${q(e.pointOrigine.x)}+${qp(k)}\\cdot(${q(e.pointConnu.x)}-${qp(e.pointOrigine.x)})`), texte(". Même calcul pour l'ordonnée ; le graphe montre "), latex(vec(`${b}${c}`)), texte(".")],
  ];
}

export function messageCoordonneesRV(e: ExerciceRelationVectorielle, s: V): Fragments | null {
  const r = e.reponse;
  if (e.variante === "translation") {
    return premierCandidat(s, [
      { valeur: subV(e.point, e.translation), message: [texte("Tu as retiré les composantes du vecteur : une translation ajoute les composantes du vecteur aux coordonnées du point.")] },
      { valeur: e.translation, message: [texte(`Ce sont les composantes du vecteur : il faut encore les ajouter aux coordonnées de ${e.labelPoint}.`)] },
    ], r);
  }
  const be = subV(e.pointConnu, e.pointOrigine);
  const k = e.coefficient;
  return premierCandidat(s, [
    { valeur: mulV(k, be), message: [texte("Ce sont les composantes de "), latex(vec(`${e.labelOrigine}${e.pointCherche}`)), texte(` : ajoute-les aux coordonnées de ${e.labelOrigine}.`)] },
    { valeur: addV(e.pointOrigine, mulV(-k, be)), message: MESSAGE_COMPOSANTES_INVERSEES },
    { valeur: addV(e.pointConnu, mulV(k, be)), message: [texte(`Le vecteur multiplié part de ${e.labelOrigine} : on ajoute le résultat aux coordonnées de ${e.labelOrigine}, pas à celles de ${e.labelConnu}.`)] },
    { valeur: mulV(k, e.pointConnu), message: [texte("Le coefficient multiplie la différence "), latex(`${e.labelConnu}-${e.labelOrigine}`), texte(`, pas les coordonnées de ${e.labelConnu}.`)] },
  ], r);
}

export { pointL };
