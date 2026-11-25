import type { ExerciceBinomialeA, ExerciceBinomialeSequenceOrdonnee } from "../core6e/binomialeSequenceOrdonnee.types";
import { diagnostiquerAttentes } from "./attentesCombinatoire";
import type { Attente } from "./attentesCombinatoire";
import { arrangementBig, combinaisonBig, rationnel } from "./saisieCombinatoire";
import type { Rationnel } from "./saisieCombinatoire";
import type { DefinitionSession } from "./sessionCombinatoire";
import { phasesPourExercice } from "./typesBinomialeSequenceOrdonnee";
import type { PhaseBinomialeSequenceOrdonnee } from "./typesBinomialeSequenceOrdonnee";

/**
 * Vérification de `6gen48` — EXACTE (audit, G18) : la tolérance absolue de 0,01 acceptait « 0 » comme
 * résultat dans 26 % des exercices A. Valeur exacte, ou arrondi correct avec au moins 3 décimales et
 * 2 chiffres significatifs.
 */

/** P(X = k), exacte (p en dixièmes). */
export function probabiliteBinomialeExacte(n: number, p: number, k: number): Rationnel {
  const P = BigInt(Math.round(p * 10));
  return rationnel(combinaisonBig(n, k) * P ** BigInt(k) * (10n - P) ** BigInt(n - k), 10n ** BigInt(n));
}

export function termesExacts(e: ExerciceBinomialeA): Rationnel[] {
  return e.termesACalculer.map((k) => probabiliteBinomialeExacte(e.n, e.p, k));
}

export function resultatExact(e: ExerciceBinomialeA): Rationnel {
  const somme = termesExacts(e).reduce((a, r) => rationnel(a.n * r.d + r.n * a.d, a.d * r.d), rationnel(0));
  return e.strategie === "complement" ? rationnel(somme.d - somme.n, somme.d) : somme;
}

export function attentesBinomialeSequenceOrdonnee(e: ExerciceBinomialeSequenceOrdonnee, p: PhaseBinomialeSequenceOrdonnee): Attente[] {
  if (e.famille === "B") {
    if (p === "bEcran1") return e.denominateurs.map((d) => ({ nature: "probabilite", cible: rationnel(1, d) }));
    return [{ nature: "probabilite", cible: rationnel(1n, arrangementBig(e.n, e.k)) }];
  }
  if (p === "aStrategie") return [{ choix: e.strategie }];
  if (p === "aTermes") return [{ nature: "liste", cible: e.termesACalculer }];
  if (p === "aValeurs") return termesExacts(e).map((cible) => ({ nature: "probabilite", cible }));
  return [{ nature: "probabilite", cible: resultatExact(e) }];
}

export const DEFINITION_6GEN48: DefinitionSession<ExerciceBinomialeSequenceOrdonnee, PhaseBinomialeSequenceOrdonnee> = {
  phases: phasesPourExercice,
  estChoix: (_e, p) => p === "aStrategie",
  diagnostiquer: (e, p, valeurs) => diagnostiquerAttentes(attentesBinomialeSequenceOrdonnee(e, p), valeurs),
};
