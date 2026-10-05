/**
 * Couche B (5e) — vérification pour 5gen18 ("Comparaison numérique de deux suites"). Réutilise
 * `evaluerExpressionGenerale` (cross-chantier, déjà établi). `combinerStatuts`/`statutNumerique`
 * répliqués localement (même principe que `verificationSuiteClassique.ts`, 5gen17).
 */
import type { ExerciceComparaisonSuites } from "../core5e/comparaisonSuites.types";
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { StatutVerification } from "../moteur/statutVerification";

/** "Convention arrondie" — tolérance absolue, réplique le patron déjà établi (gen29, 4e ;
 * `verificationProblemesContexte.ts`, 5gen5) pour toute réponse qui accepte indifféremment un
 * résultat arrondi ou plus précis. */
export const TOLERANCE_ARRONDIE = 0.5;
export const TOLERANCE_INDICE = 0.01;

function statutNumerique(valeur: number, cible: number, tolerance: number): StatutVerification {
  if (!Number.isFinite(valeur)) return "parse_error";
  return Math.abs(valeur - cible) <= tolerance ? "correct" : "not_equivalent";
}

function combinerStatuts(...statuts: StatutVerification[]): StatutVerification {
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  return statuts.every((s) => s === "correct") ? "correct" : "not_equivalent";
}

function diagnostiquerNombreTexte(texte: string, cible: number, tolerance: number): StatutVerification {
  try {
    const valeur = evaluerExpressionGenerale(texte, 0);
    return statutNumerique(valeur, cible, tolerance);
  } catch {
    return "parse_error";
  }
}

/** `textes` = [u(n-1), u(n), u(n+1), v(n-1), v(n), v(n+1)], dans cet ordre — les 6 cellules du
 * tableau, tolérance arrondie. */
export function diagnostiquerTableau(textes: string[], exercice: ExerciceComparaisonSuites): StatutVerification {
  if (textes.length !== 6) return "not_equivalent";
  const cibles = [...exercice.uTable, ...exercice.vTable];
  return combinerStatuts(...textes.map((t, i) => diagnostiquerNombreTexte(t, cibles[i], TOLERANCE_ARRONDIE)));
}

/** Statut à 3 valeurs d'UNE SEULE cellule du tableau (A.2 — highlight rouge par champ indépendant),
 * même cibles/tolérance que `diagnostiquerTableau` ci-dessus, jamais recalculées indépendamment. */
export function diagnostiquerCelluleTableau(texte: string, index: number, exercice: ExerciceComparaisonSuites): StatutVerification {
  const cibles = [...exercice.uTable, ...exercice.vTable];
  if (index < 0 || index >= cibles.length) return "parse_error";
  return diagnostiquerNombreTexte(texte, cibles[index], TOLERANCE_ARRONDIE);
}

export interface ReponseConclusion {
  nSeuil: string;
  traduction: string;
}

/** L'indice n et sa traduction contextuelle doivent TOUS DEUX être corrects — piège central de la
 * spec : confondre n et n-1/n+1 (indice), ou oublier de traduire l'indice dans l'unité du contexte
 * (année/mois). */
export function diagnostiquerConclusion(reponse: ReponseConclusion, exercice: ExerciceComparaisonSuites): StatutVerification {
  return combinerStatuts(diagnostiquerNSeuil(reponse.nSeuil, exercice), diagnostiquerTraduction(reponse.traduction, exercice));
}

/** Statuts à 3 valeurs par champ (A.2), mêmes cibles/tolérance que `diagnostiquerConclusion`
 * ci-dessus, jamais recalculées indépendamment. */
export function diagnostiquerNSeuil(nSeuil: string, exercice: ExerciceComparaisonSuites): StatutVerification {
  return diagnostiquerNombreTexte(nSeuil, exercice.nSeuil, TOLERANCE_INDICE);
}
export function diagnostiquerTraduction(traduction: string, exercice: ExerciceComparaisonSuites): StatutVerification {
  return diagnostiquerNombreTexte(traduction, exercice.traductionValeur, TOLERANCE_INDICE);
}
