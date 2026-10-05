/**
 * Couche B (5e) — types pour 5gen29 ("Étude locale (extremums et points critiques)"). N'importe
 * jamais rien de `src/generateurs5e/`.
 *
 * La séquence d'écrans dépend UNIQUEMENT de champs déjà connus à la génération (`exercice.type`,
 * `exercice.niveau`, et le NOMBRE de vrais extremums/points d'inflexion déjà classifiés) — jamais
 * une branche réactive dépendant d'une réponse élève, même patron que
 * `moteur5e/typesTangentes.ts::ordreEcransTangente` (5gen28).
 *
 * 7 écrans possibles, dans cet ordre fixe quand ils sont présents :
 *   1. "domaine"        — UNIQUEMENT "rationnelleAvecCE" (domaine=ℝ sinon, écran sauté).
 *   2. "resoudreFPrime"  — toujours.
 *   3. "tableauFPrime"   — toujours.
 *   4. "extremums"       — sauté si AUCUNE racine de f' n'est un vrai extremum (ex. polynomiale
 *      "double", où l'unique racine est toujours "ni_lun_ni_lautre").
 *   5. "resoudreFSeconde"— UNIQUEMENT `niveau==="avance"`.
 *   6. "tableauFSeconde"  — idem.
 *   7. "inflexions"       — idem 5/6, ET sauté si AUCUNE racine de f'' n'est un vrai point
 *      d'inflexion (jamais atteint en pratique pour ce générateur — voir `generateurs5e/etudeLocale`,
 *      f'' y a TOUJOURS un vrai changement de signe à chacune de ses racines — mais le calcul reste
 *      générique, jamais supposé, exactement comme pour "extremums").
 */
import type { ExerciceEtudeLocale } from "../core5e/etudeLocale.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type EcranEtudeLocale = "domaine" | "resoudreFPrime" | "tableauFPrime" | "extremums" | "resoudreFSeconde" | "tableauFSeconde" | "inflexions";

/** Nombre de racines de f'(x)=0 réellement classées "max" ou "min" (jamais "ni_lun_ni_lautre") —
 * calculé UNE FOIS depuis `classificationFPrime`, déjà stocké à la génération (jamais re-dérivé en
 * relisant le tableau de signes rempli par l'élève). */
export function nombreExtremums(exercice: ExerciceEtudeLocale): number {
  return exercice.classificationFPrime.filter((c) => c !== "ni_lun_ni_lautre").length;
}

/** Même principe pour les racines de f''(x)=0 réellement "pi". */
export function nombreInflexions(exercice: ExerciceEtudeLocale): number {
  return exercice.classificationFSeconde.filter((c) => c === "pi").length;
}

export function ordreEcransEtudeLocale(exercice: ExerciceEtudeLocale): EcranEtudeLocale[] {
  const ecrans: EcranEtudeLocale[] = [];
  if (exercice.type === "rationnelleAvecCE") ecrans.push("domaine");
  ecrans.push("resoudreFPrime", "tableauFPrime");
  if (nombreExtremums(exercice) > 0) ecrans.push("extremums");
  if (exercice.niveau === "avance") {
    ecrans.push("resoudreFSeconde", "tableauFSeconde");
    if (nombreInflexions(exercice) > 0) ecrans.push("inflexions");
  }
  return ecrans;
}

export function ecranInitial(exercice: ExerciceEtudeLocale): EcranEtudeLocale {
  return ordreEcransEtudeLocale(exercice)[0];
}

export function ecranApres(exercice: ExerciceEtudeLocale, ecran: EcranEtudeLocale): EcranEtudeLocale | "termine" {
  const ordre = ordreEcransEtudeLocale(exercice);
  const index = ordre.indexOf(ecran);
  return index + 1 < ordre.length ? ordre[index + 1] : "termine";
}

export interface ResultatExerciceEtudeLocale {
  exercice: ExerciceEtudeLocale;
  /** Indexé par écran RÉELLEMENT traversé — 2 à 7 clés selon `ordreEcransEtudeLocale`. */
  scores: Partial<Record<EcranEtudeLocale, number>>;
}

export interface EtatSessionEtudeLocale {
  reglages: ReglagesSession5e;
  generateur: () => ExerciceEtudeLocale;
  exerciceCourant: ExerciceEtudeLocale;
  phase: EcranEtudeLocale;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<EcranEtudeLocale, number>>;
  indexExercice: number;
  resultats: ResultatExerciceEtudeLocale[];
  terminee: boolean;
  derniereEtapeRevelee: boolean;
}
