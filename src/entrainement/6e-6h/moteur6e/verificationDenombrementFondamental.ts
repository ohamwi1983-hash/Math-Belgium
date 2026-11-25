import type { ExerciceDenombrementFondamental } from "../core6e/denombrementFondamental.types";
import { diagnostiquerAttentes } from "./attentesCombinatoire";
import type { Attente } from "./attentesCombinatoire";
import type { DefinitionSession } from "./sessionCombinatoire";
import { estChoixDenombrementFondamental, phasesPourExercice } from "./typesDenombrementFondamental";
import type { PhaseDenombrementFondamental } from "./typesDenombrementFondamental";

/**
 * Vérification de `6gen43` : ce qu'attend chaque champ (lecture commune `saisieCombinatoire` :
 * « 249 900 », « 9 × 8 × 7 », « 6! », « C(10 ; 3) » lus pareil partout — audit, G9 et § 2 n° 19).
 */

const entier = (cible: number): Attente => ({ nature: "entier", cible });

export function attentesDenombrementFondamental(e: ExerciceDenombrementFondamental, p: PhaseDenombrementFondamental): Attente[] {
  switch (e.famille) {
    case "A": {
      const i = Number(p.slice(1)) - 1;
      return (e.valeursEcrans[i] ?? []).map(entier);
    }
    case "B":
      if (e.sousType === "direct") return [entier(e.diagonales)];
      return p === "b1" ? [entier(e.constanteEquation)] : [entier(e.n)];
    case "C":
      return p === "c1" ? [{ choix: e.formule }] : [entier(e.resultat)];
    case "D":
      if (p === "d1") return [entier(e.nombreUnites)];
      if (p === "d2") return [entier(e.arrangementsBlocs)];
      return [entier(e.resultatFinal)];
    case "E":
      return p === "e1" ? [{ choix: e.sousType }] : [entier(e.resultat)];
  }
}

export const DEFINITION_6GEN43: DefinitionSession<ExerciceDenombrementFondamental, PhaseDenombrementFondamental> = {
  phases: phasesPourExercice,
  estChoix: estChoixDenombrementFondamental,
  diagnostiquer: (e, p, valeurs) => diagnostiquerAttentes(attentesDenombrementFondamental(e, p), valeurs),
};
