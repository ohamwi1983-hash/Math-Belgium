import type { EtatSessionLieuxGeometriques } from "../moteur/typesLieuxGeometriques";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { LIBELLE_TYPE_LIEU, formatCaracteristiquesLieuLatex, formatEtatActuelSystemeLatex } from "./formatLieuxGeometriques";

/**
 * Récapitulatif "Ce qu'on sait déjà" — 3 phases FIXES (`identification` → `equations` →
 * `resolution`, voir `moteur/typesLieuxGeometriques.ts`). Toujours les valeurs CONFIRMÉES (jamais la
 * saisie de l'élève), lues sur `exerciceCourant` ; une entrée n'apparaît qu'une fois son écran clos
 * (`scoreXxxExercice !== null`). Une ligne par lieu après l'identification (chaque lieu nommé par son
 * type — les 2 lieux sont toujours de types différents), puis le système des 2 équations après
 * l'écran "équations" : c'est lui que l'écran "résolution" fait résoudre.
 */
export function calculerRecapitulatifLieuxGeometriques(etat: EtatSessionLieuxGeometriques): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const entrees: EntreeRecapitulatif[] = [];

  if (etat.scoreIdentificationExercice !== null) {
    for (const lieu of [exercice.lieu1, exercice.lieu2]) {
      entrees.push({ libelle: LIBELLE_TYPE_LIEU[lieu.type], estLatex: true, valeur: formatCaracteristiquesLieuLatex(lieu), revele: etat.identificationRevele });
    }
  }

  if (etat.scoreEquationsExercice !== null) {
    entrees.push({ libelle: "Système", estLatex: true, valeur: formatEtatActuelSystemeLatex(exercice), revele: etat.equationsRevele });
  }

  return entrees;
}
