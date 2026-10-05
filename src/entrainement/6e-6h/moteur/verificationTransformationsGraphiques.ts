import type { Enonce } from "../core/generateur.types";
import type { ExerciceTransformationGraphique, ReponseCurseurs } from "../core/transformationsGraphiques.types";
import { diagnostiquerFormeFactorisee } from "./expressionAlgebrique";
import type { StatutVerification } from "./statutVerification";

/**
 * a = ±(ev/cv) — formule unique valable pour les deux branches de génération (section 1 de la
 * spec) : si ev est la branche active (cv=1 neutre), ev/cv = ev = magnitude d'étirement ; si cv
 * est la branche active (ev=1 neutre), ev/cv = 1/cv = magnitude de compression. sox détermine le
 * signe (symétrie d'axe Ox). Type d'entrée volontairement structurel (pas
 * `ExerciceTransformationGraphique`) : accepte aussi bien l'exercice que `ReponseCurseurs`
 * (mêmes champs ev/cv/sox, noms différents pour p/q) — réutilisé tel quel par
 * `src/ui/mafsTransformation.ts` pour calculer `a` de la courbe manipulable en direct (bouton
 * "Aide"), sans dupliquer la formule.
 */
export function calculerA(parametres: { ev: number; cv: number; sox: boolean }): number {
  const magnitude = parametres.ev / parametres.cv;
  return parametres.sox ? -magnitude : magnitude;
}

/**
 * Développe a(x-p)²+q en un Enonce {a,b,c} équivalent : a(x-p)²+q = ax² - 2ap·x + (ap²+q).
 * Permet de réutiliser telle quelle `verifierFormeFactorisee` (exercice 1) pour la vérification
 * flexible du champ équation (section 2 de la spec) — développe la saisie de l'élève et compare
 * par échantillonnage, sans jamais comparer de chaînes de caractères ni exiger une structure
 * particulière (la spec demande une équivalence purement algébrique, "sous n'importe quelle
 * forme").
 */
export function enonceEquivalent(exercice: ExerciceTransformationGraphique): Enonce {
  const a = calculerA(exercice);
  const { p, q } = exercice;
  return { a, b: -2 * a * p, c: a * p * p + q };
}

/** Note "équation" (section 3 de la spec) : équivalence algébrique flexible avec a(x-p)²+q. */
export function diagnostiquerEquationTransformation(
  exercice: ExerciceTransformationGraphique,
  expressionSaisie: string,
): StatutVerification {
  return diagnostiquerFormeFactorisee(expressionSaisie, enonceEquivalent(exercice));
}

export function verifierEquationTransformation(exercice: ExerciceTransformationGraphique, expressionSaisie: string): boolean {
  return diagnostiquerEquationTransformation(exercice, expressionSaisie) === "correct";
}

const TOLERANCE_RAPPORT = 1e-9;

/** Résultat curseur par curseur — utilisé par l'UI pour marquer en rouge les curseurs/toggle
 * incorrects après une tentative (section 3 de la spec), jamais pour la note elle-même. */
export interface EvaluationCurseurs {
  th: boolean;
  tv: boolean;
  ev: boolean;
  cv: boolean;
  sox: boolean;
}

/**
 * EV et CV ne sont **jamais** comparés chacun à une valeur canonique fixe : seul le RAPPORT
 * ev/cv compte (il représente |a|, voir `calculerA`) — toute combinaison dont le rapport est
 * correct est acceptée (ex. ev=4,cv=2 est équivalent à ev=2,cv=1, tous deux représentant |a|=2).
 * Conséquence directe : `ev` et `cv` sont toujours évalués et renvoyés ENSEMBLE, comme une seule
 * unité de vérification (jamais l'un correct et l'autre faux) — contrairement à `th`/`tv`/`sox`,
 * qui restent chacun comparés individuellement à leur propre valeur attendue.
 */
export function evaluerCurseurs(exercice: ExerciceTransformationGraphique, reponse: ReponseCurseurs): EvaluationCurseurs {
  const rapportCorrect = Math.abs(reponse.ev / reponse.cv - exercice.ev / exercice.cv) < TOLERANCE_RAPPORT;
  return {
    th: reponse.th === exercice.p,
    tv: reponse.tv === exercice.q,
    ev: rapportCorrect,
    cv: rapportCorrect,
    sox: reponse.sox === exercice.sox,
  };
}

/** Note "curseurs" (section 3 de la spec) : les 4 curseurs + le toggle comparés en un seul essai
 * (tout ou rien) — un seul curseur incorrect invalide toute la tentative. */
export function verifierCurseurs(exercice: ExerciceTransformationGraphique, reponse: ReponseCurseurs): boolean {
  const evaluation = evaluerCurseurs(exercice, reponse);
  return evaluation.th && evaluation.tv && evaluation.ev && evaluation.cv && evaluation.sox;
}
