import type { Enonce } from "../core/generateur.types";
import type { ExerciceRelationsRacines } from "../core/relationsRacines.types";
import { diagnostiquerFormeFactorisee } from "./expressionAlgebrique";
import type { StatutVerification } from "./statutVerification";

export interface ReponseSommeProduit {
  s: number;
  p: number;
}

/** Toujours x1+x2 et x1·x2 — jamais recalculé via -b/a / c/a (même valeur par construction, voir
 * generateurs/relationsRacines/index.ts, mais ceci reste la définition, pas la méthode de calcul
 * de l'élève). */
export function sommeEtProduitAttendus(exercice: ExerciceRelationsRacines): { s: number; p: number } {
  const [x1, x2] = exercice.racines;
  return { s: x1 + x2, p: x1 * x2 };
}

/** Étape "somme et produit" : les deux champs doivent être justes ensemble (une seule tentative
 * couvre les deux, comme `verifierRacines` de inequation.types.ts pour une paire de valeurs). */
export function verifierSommeProduit(saisie: ReponseSommeProduit, exercice: ExerciceRelationsRacines): boolean {
  const { s, p } = sommeEtProduitAttendus(exercice);
  return saisie.s === s && saisie.p === p;
}

/** Étape "factorisation" : a(x-x1)(x-x2)=0, racines déjà révélées à l'élève (jamais à déduire de
 * S/P) — même vérificateur générique que `AppEquationRationnelle.tsx` (expression libre comparée
 * par équivalence algébrique à l'énoncé original, pas une égalité textuelle). */
export function diagnostiquerFactorisation(saisie: string, exercice: ExerciceRelationsRacines): StatutVerification {
  return diagnostiquerFormeFactorisee(saisie, exercice.enonce);
}

export function verifierFactorisation(saisie: string, exercice: ExerciceRelationsRacines): boolean {
  return diagnostiquerFactorisation(saisie, exercice) === "correct";
}

/** Étape "équation depuis les racines" : convention a=1 du cours (x²-Sx+P=0), toujours comparée à
 * un énoncé normalisé {a:1, b:-S, c:P} — indépendant du `a` réel de l'exercice (ce dernier n'est
 * jamais redemandé à cet écran, x²-Sx+P=0 est une équation valide partageant les mêmes racines
 * quel que soit a). */
export function diagnostiquerEquationDepuisRacines(saisie: string, exercice: ExerciceRelationsRacines): StatutVerification {
  const { s, p } = sommeEtProduitAttendus(exercice);
  const enonceNormalise: Enonce = { a: 1, b: -s, c: p };
  return diagnostiquerFormeFactorisee(saisie, enonceNormalise);
}

export function verifierEquationDepuisRacines(saisie: string, exercice: ExerciceRelationsRacines): boolean {
  return diagnostiquerEquationDepuisRacines(saisie, exercice) === "correct";
}
