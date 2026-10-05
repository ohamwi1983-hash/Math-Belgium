import type { CelluleSinCos, CelluleTan, ExerciceValeursRemarquables, ReponseValeursExactes, ValeurSinCos, ValeurTan } from "../core/valeursRemarquables.types";
import type { Quadrant } from "../core/cercleTrigonometrique.types";
import type { StatutVerification } from "./statutVerification";

/** Harmonisé avec `verificationCercleTrigonometrique.ts` (gen14, même écran "angle du premier
 * quadrant") — les deux valeurs (`anglePremierQuadrant` ici toujours un littéral entier fixe,
 * jamais dérivé d'un calcul flottant ; `angleReduit`/`180 - angleReduit` côté gen14, arithmétique
 * entière elle aussi) sont exactes par construction, donc aucune justification trouvée à un écart
 * de tolérance entre les deux (audit de traçabilité de précision) — la valeur la plus stricte des
 * deux est retenue. */
const TOLERANCE = 1e-9;

/** Sélection sur le cercle interactif, jamais de saisie libre : comparaison directe, pas de statut à 3 valeurs. */
export function verifierQuadrant(exercice: ExerciceValeursRemarquables, quadrant: Quadrant): boolean {
  return quadrant === exercice.quadrant;
}

export function diagnostiquerAnglePremierQuadrant(exercice: ExerciceValeursRemarquables, valeur: number): StatutVerification {
  if (!Number.isFinite(valeur)) return "parse_error";
  return Math.abs(valeur - exercice.anglePremierQuadrant) <= TOLERANCE ? "correct" : "not_equivalent";
}

export function verifierAnglePremierQuadrant(exercice: ExerciceValeursRemarquables, valeur: number): boolean {
  return diagnostiquerAnglePremierQuadrant(exercice, valeur) === "correct";
}

/**
 * Refonte `promptcreationgenerateur15.md` — l'étape "Valeurs exactes" n'est plus un champ libre
 * évalué par expression mais un tableau à cellules cycliques (comme l'écran "Signes" du générateur
 * 14) : chaque cellule est un choix parmi un ensemble FIXE de littéraux, jamais une saisie
 * ambiguë — donc jamais de `StatutVerification`/`parse_error` ici, une simple comparaison
 * booléenne suffit, même principe que `evaluerSignes`/`verifierSignes`
 * (`verificationCercleTrigonometrique.ts`). Petites tables numériques dupliquées depuis
 * `ui/cycleValeurTrigonometrique.ts` (mêmes valeurs, jamais importées — `src/moteur/` n'importe
 * jamais `src/ui/`) : c'est la magnitude+signe encodée dans chaque littéral qui est comparée à la
 * valeur réelle de l'exercice, jamais une comparaison de chaîne.
 */
const VALEUR_NUMERIQUE_SIN_COS: Record<ValeurSinCos, number> = {
  "0": 0,
  "1/2": 0.5,
  "-1/2": -0.5,
  "rac2/2": Math.SQRT2 / 2,
  "-rac2/2": -Math.SQRT2 / 2,
  "rac3/2": Math.sqrt(3) / 2,
  "-rac3/2": -Math.sqrt(3) / 2,
  "1": 1,
  "-1": -1,
};

const VALEUR_NUMERIQUE_TAN: Record<Exclude<ValeurTan, "indefini">, number> = {
  "0": 0,
  "rac3/3": 1 / Math.sqrt(3),
  "-rac3/3": -1 / Math.sqrt(3),
  "1": 1,
  "-1": -1,
  rac3: Math.sqrt(3),
  "-rac3": -Math.sqrt(3),
};

function cellulesSinCosEgales(saisie: CelluleSinCos, attendu: number): boolean {
  return saisie !== "?" && Math.abs(VALEUR_NUMERIQUE_SIN_COS[saisie] - attendu) < TOLERANCE;
}

function cellulesTanEgales(saisie: CelluleTan, attendu: number | null): boolean {
  if (saisie === "?") return false;
  if (attendu === null) return saisie === "indefini";
  if (saisie === "indefini") return false;
  return Math.abs(VALEUR_NUMERIQUE_TAN[saisie] - attendu) < TOLERANCE;
}

/**
 * Les 3 champs (sin/cos/tan) évalués indépendamment (marquage rouge en direct après un échec, côté
 * présentation via `ui/cycleValeurTrigonometrique.ts`), mais soumis en un seul essai global — même
 * principe que la grille de l'exercice 5 et l'écran "Signes" du générateur 14.
 */
export function evaluerValeursExactes(
  exercice: ExerciceValeursRemarquables,
  reponse: ReponseValeursExactes,
): { sin: boolean; cos: boolean; tan: boolean } {
  return {
    sin: cellulesSinCosEgales(reponse.sin, exercice.sinValeur),
    cos: cellulesSinCosEgales(reponse.cos, exercice.cosValeur),
    tan: cellulesTanEgales(reponse.tan, exercice.tanValeur),
  };
}

export function verifierValeursExactes(exercice: ExerciceValeursRemarquables, reponse: ReponseValeursExactes): boolean {
  const evaluation = evaluerValeursExactes(exercice, reponse);
  return evaluation.sin && evaluation.cos && evaluation.tan;
}
