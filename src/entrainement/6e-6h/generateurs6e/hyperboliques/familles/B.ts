import type { ExerciceHyperboliquesB } from "../../../core6e/hyperboliques.types";
import { tirerCoefficientNonNul, tirerEntier, tirerParmi } from "../aleatoire";

/** "donné sh, trouver ch" : k=sh(x0), entier non nul dans {-3,...,-1,1,...,3} (peut être négatif —
 * spec explicite). */
export function construireBTrouverCh(overrides?: { k?: number }): ExerciceHyperboliquesB {
  return { famille: "B", sousType: "trouverCh", k: overrides?.k ?? tirerCoefficientNonNul() };
}

/** "donné ch, trouver sh" : k=ch(x0), entier STRICTEMENT supérieur à 1 (spec explicite, sinon
 * k²−1<0 sous la racine). `signeX0` : 40% du temps un signe est précisé (répondant unique attendu),
 * sinon `null` (les 2 valeurs ±√(k²−1) sont possibles) — proportion arbitraire mais documentée,
 * choisie pour que les 2 cas restent régulièrement rencontrés au tirage naturel. */
export function construireBTrouverSh(overrides?: { k?: number; signeX0?: 1 | -1 | null }): ExerciceHyperboliquesB {
  const k = overrides?.k ?? tirerEntier(2, 5);
  const signeX0 = overrides && "signeX0" in overrides ? (overrides.signeX0 ?? null) : Math.random() < 0.4 ? tirerParmi([1, -1] as const) : null;
  return { famille: "B", sousType: "trouverSh", k, signeX0 };
}

/** Sous-type tiré ÉQUIPROBABLE parmi "trouverCh"/"trouverSh" (spec : "sous-type tiré"). */
export function construireB(): ExerciceHyperboliquesB {
  return Math.random() < 0.5 ? construireBTrouverCh() : construireBTrouverSh();
}
