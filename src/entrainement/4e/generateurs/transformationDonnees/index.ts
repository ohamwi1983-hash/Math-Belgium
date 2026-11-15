import type { ExerciceTransformationDonnees, FormeTransformation, IndicateursSerie, TypeTransformation } from "../../core/transformationDonnees.types";
import { CONTEXTES, type ContexteTransformation, type ParametresSerie, type Plage } from "../../moteur/contextesTransformationDonnees";

/**
 * Générateur de « Effet d'une transformation des données » (gen108). Tout le hasard passe par
 * `Math.random` : `genererAvecCode` (`export/codeExercice.ts`) le remplace par une graine, et le QR
 * code d'une feuille rouvre ainsi le MÊME exercice.
 *
 * Garanties (vérifiées par tirages massifs) :
 * - série de départ plausible : étendue entre 2,6 et 4,8 écarts-types, médiane ≠ moyenne (à au
 *   plus 0,6 σ), bornes du contexte respectées (notes entre 0 et 20…) ; σ sur une grille courte,
 *   donc V = σ² EXACTE (aucun arrondi « variance à deux décimales » à gérer) ;
 * - nouveaux indicateurs EXACTS et courts : au plus 3 décimales pour la moyenne, la médiane,
 *   l'étendue et l'écart-type, au plus 4 pour la variance — l'élève donne des valeurs exactes ;
 * - la FORME (signature de difficulté) est tirée AVANT le contexte, avec des poids fixes : ses
 *   fréquences ne dépendent pas du nombre de contextes de chaque forme ni de la boucle de rejet.
 */

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)]!;
}

function melange(n: number): number[] {
  const t = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [t[i], t[j]] = [t[j]!, t[i]!];
  }
  return t;
}

export function arrondi9(x: number): number {
  const r = Math.round(x * 1e9) / 1e9;
  return r === 0 ? 0 : r;
}

/** Nombre de décimales d'un décimal (après arrondi à 1e-9 contre le bruit flottant). */
export function decimales(x: number): number {
  const s = arrondi9(x).toFixed(9).replace(/0+$/, "");
  const i = s.indexOf(".");
  return i < 0 || i === s.length - 1 ? 0 : s.length - i - 1;
}

function tirer([min, max, pas]: Plage): number {
  const k = Math.floor(Math.random() * (Math.round((max - min) / pas) + 1));
  return arrondi9(min + k * pas);
}

function surGrille(x: number, pas: number): number {
  return arrondi9(Math.round(x / pas) * pas);
}

function tirerSerie(p: ParametresSerie): IndicateursSerie | null {
  const ecartType = tirer(p.ecartType);
  const moyenne = tirer(p.moyenne);
  const etendue = surGrille(ecartType * (2.6 + Math.random() * 2.2), p.pasEtendue);
  if (etendue < 2.5 * ecartType) return null;
  const mediane = surGrille(moyenne + (Math.random() * 2 - 1) * 0.55 * ecartType, p.pasMediane);
  if (mediane === moyenne || Math.abs(mediane - moyenne) > 0.6 * ecartType) return null;
  if (p.min !== undefined && moyenne - 0.55 * etendue < p.min) return null;
  if (p.max !== undefined && moyenne + 0.55 * etendue > p.max) return null;
  return { moyenne, mediane, etendue, variance: arrondi9(ecartType * ecartType), ecartType };
}

/** Indicateurs de y = a·x + b : moyenne et médiane suivent la transformation complète, étendue et
 * écart-type sont multipliés par |a|, la variance par a² (la constante b n'agit sur aucun écart). */
export function transformer(x: IndicateursSerie, a: number, b: number): IndicateursSerie {
  return {
    moyenne: arrondi9(a * x.moyenne + b),
    mediane: arrondi9(a * x.mediane + b),
    etendue: arrondi9(Math.abs(a) * x.etendue),
    variance: arrondi9(a * a * x.variance),
    ecartType: arrondi9(Math.abs(a) * x.ecartType),
  };
}

function resultatsCourts(y: IndicateursSerie): boolean {
  return decimales(y.moyenne) <= 3 && decimales(y.mediane) <= 3 && decimales(y.etendue) <= 3 && decimales(y.ecartType) <= 3 && decimales(y.variance) <= 4;
}

export function construireDepuisContexte(c: ContexteTransformation): ExerciceTransformationDonnees {
  for (;;) {
    const depart = tirerSerie(c.serie);
    if (!depart) continue;
    const { a, b, pourcentage, constante } = c.coefficients();
    const arrivee = transformer(depart, a, b);
    if (!resultatsCourts(arrivee)) continue;
    return {
      type: TYPE_DE_FORME[c.forme],
      forme: c.forme,
      contexte: c.id,
      n: entier(c.n[0], c.n[1]),
      a,
      b,
      pourcentage,
      constante,
      depart,
      arrivee,
      ordrePhrases: melange(4),
    };
  }
}

export const TYPE_DE_FORME: Record<FormeTransformation, TypeTransformation> = {
  constante: "constante",
  pourcentage: "multiplication",
  facteur: "multiplication",
  direct: "affine",
  avant: "affine",
  negatif: "affine",
};

/** Poids des formes dans chaque variante (tirées AVANT le contexte). */
const POIDS_FORMES: Record<TypeTransformation, [FormeTransformation, number][]> = {
  constante: [["constante", 1]],
  multiplication: [
    ["pourcentage", 0.5],
    ["facteur", 0.5],
  ],
  affine: [
    ["direct", 0.45],
    ["avant", 0.35],
    ["negatif", 0.2],
  ],
};

function tirerForme(type: TypeTransformation): FormeTransformation {
  const u = Math.random();
  let cumul = 0;
  for (const [forme, poids] of POIDS_FORMES[type]) {
    cumul += poids;
    if (u < cumul) return forme;
  }
  return POIDS_FORMES[type][POIDS_FORMES[type].length - 1]![0];
}

export function genererType(type: TypeTransformation): ExerciceTransformationDonnees {
  const forme = tirerForme(type);
  return construireDepuisContexte(choisir(CONTEXTES.filter((c) => c.forme === forme)));
}

// ---------------------------------------------------------------------------------------------
// Catalogue de variantes (SelecteurVarianteDev, `?code=`, adaptateur de feuilles)
// ---------------------------------------------------------------------------------------------

export const CATALOGUE_VARIANTES: { id: TypeTransformation; label: string }[] = [
  { id: "constante", label: "Ajouter ou retirer une constante (prime, bonus, correction)" },
  { id: "multiplication", label: "Multiplier par un nombre (pourcentage, changement d'unité)" },
  { id: "affine", label: "Transformation affine (°C → °F, conversion et frais, points manquants)" },
];

export function construireAvecVariante(id: string): ExerciceTransformationDonnees {
  if (id === "constante" || id === "multiplication" || id === "affine") return genererType(id);
  return genererExerciceTransformationDonnees();
}

/** Tirage libre : une des trois natures de transformation, au hasard. */
export function genererExerciceTransformationDonnees(): ExerciceTransformationDonnees {
  return genererType(choisir(CATALOGUE_VARIANTES).id);
}
