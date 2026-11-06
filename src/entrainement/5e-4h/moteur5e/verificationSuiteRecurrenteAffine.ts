/**
 * Couche B (5e) — vérification pour 5gen19 ("Suite récurrente affine et régime permanent").
 * Réutilise `evaluerExpressionGenerale` (cross-chantier, déjà établi). `combinerStatuts`/
 * `statutNumerique` répliqués localement (même principe que 5gen17/5gen18).
 */
import type { ExerciceSuiteRecurrenteAffine } from "../core5e/suiteRecurrenteAffine.types";
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import { fractionQVersNombre } from "./fractionQ";
import type { StatutVerification } from "../moteur/statutVerification";

export const TOLERANCE_PRECISE = 0.01;

/**
 * Tolérance des termes Q₂, Q₃, Q₄ — PROPAGÉE : la consigne autorise à réutiliser les valeurs
 * arrondies au centième. Une erreur d'arrondi ε ≤ 0,005 sur Qₖ devient a·ε sur Qₖ₊₁, à laquelle
 * s'ajoute le nouvel arrondi : tolérance(Qₖ) = 0,005 × (1 + |a| + … + |a|^(k−2)) + 0,005, plus une
 * petite marge flottante. Reste bien en dessous des erreurs de démarche (a et b inversés, oubli de
 * b…), qui faussent le résultat de plusieurs unités.
 */
export function toleranceTerme(rang: 2 | 3 | 4, a: number): number {
  let somme = 0;
  for (let j = 0; j <= rang - 2; j++) somme += Math.abs(a) ** j;
  return 0.005 * somme + 0.005 + 1e-6;
}

/** « 12 345 » (espace / espace insécable / fine entre groupes de 3 chiffres) lu comme 12345 —
 * normalisation LOCALE (l'évaluateur partagé ne connaît pas le séparateur de milliers). */
function retirerSeparateursMilliers(texte: string): string {
  return texte.replace(/(\d)[\s\u00a0\u202f]+(?=\d{3}(?!\d))/g, "$1");
}

/** La lettre de la grandeur (« Q », « Qn », « Q_n », « Qₙ ») est acceptée à la place de x — l'écran
 * présente la suite sous ce nom. Remplacée par « (x) » avant l'évaluation (multiplication implicite
 * « 0,85Q » préservée). Majuscule seule : une minuscule comme « e » ou « p » entrerait en conflit
 * avec les constantes/fonctions de l'évaluateur. */
export function remplacerLettreGrandeur(texte: string, lettre: string): string {
  const motif = new RegExp(`(?<![A-Za-z])${lettre}(?:_\\{n\\}|_n|ₙ|n)?(?![A-Za-z(])`, "g");
  return texte.replace(motif, "(x)");
}

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
    const valeur = evaluerExpressionGenerale(retirerSeparateursMilliers(texte), 0);
    return statutNumerique(valeur, cible, tolerance);
  } catch {
    return "parse_error";
  }
}

const POINTS_ECHANTILLON = [0, 1, 5, 10, 20];

/** Écran "poserRecurrence" — l'élève écrit Qₙ₊₁ en fonction de Qₙ, en tapant « x » ou la lettre de
 * la grandeur (`remplacerLettreGrandeur`). Équivalence par
 * échantillonnage à plusieurs points, jamais une comparaison textuelle. */
export function diagnostiquerPoserRecurrence(texte: string, exercice: ExerciceSuiteRecurrenteAffine): StatutVerification {
  const a = fractionQVersNombre(exercice.a);
  const saisie = remplacerLettreGrandeur(retirerSeparateursMilliers(texte), exercice.variableGrandeur);
  const statuts: StatutVerification[] = [];
  for (const x of POINTS_ECHANTILLON) {
    try {
      const valeur = evaluerExpressionGenerale(saisie, x);
      statuts.push(statutNumerique(valeur, a * x + exercice.b, TOLERANCE_PRECISE));
    } catch {
      statuts.push("parse_error");
    }
  }
  return combinerStatuts(...statuts);
}

export interface ReponseRegimePermanent {
  existe: boolean;
  L: string;
}

/** Écran "regimePermanent" — piège central de la spec : l'élève doit d'abord juger si un régime
 * permanent EXISTE (|a|<1) avant même de tenter de le calculer ; si `existe` est correctement
 * `false` (régime divergent), le champ `L` n'est jamais vérifié (aucun calcul attendu). */
export function diagnostiquerRegimePermanent(reponse: ReponseRegimePermanent, exercice: ExerciceSuiteRecurrenteAffine): StatutVerification {
  const bonneExistence = reponse.existe === (exercice.regime === "convergent");
  if (!bonneExistence) return "not_equivalent";
  if (!reponse.existe) return "correct";
  return diagnostiquerNombreTexte(reponse.L, fractionQVersNombre(exercice.L!), TOLERANCE_PRECISE);
}

/** Écran "termesSuccessifs" — Q₂/Q₃/Q₄, dans cet ordre, tolérance propagée (`toleranceTerme`). */
export function diagnostiquerTermesSuccessifs(textes: string[], exercice: ExerciceSuiteRecurrenteAffine): StatutVerification {
  if (textes.length !== 3) return "not_equivalent";
  const a = fractionQVersNombre(exercice.a);
  const cibles = [exercice.u2, exercice.u3, exercice.u4].map(fractionQVersNombre);
  const rangs = [2, 3, 4] as const;
  return combinerStatuts(...textes.map((t, i) => diagnostiquerNombreTexte(t, cibles[i], toleranceTerme(rangs[i], a))));
}

/** Le verdict d'existence seul (choix fermé à 2 options : UNE seule tentative, voir la session). */
export function verdictExistenceCorrect(reponse: ReponseRegimePermanent, exercice: ExerciceSuiteRecurrenteAffine): boolean {
  return reponse.existe === (exercice.regime === "convergent");
}
