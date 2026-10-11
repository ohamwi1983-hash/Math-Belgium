import type { EtatSessionComposeeGraphique } from "../moteur5e/typesComposeeGraphique";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { labelChampResultat } from "./formatComposeeGraphique";

function formatResultatAttendu(resultatAttendu: number | null): string {
  return resultatAttendu === null ? "n'existe pas" : String(resultatAttendu);
}

/**
 * Construit le récapitulatif des questions déjà closes de l'exercice en cours. Contrairement aux
 * générateurs 4e à phases nommées fixes, chaque "étape" ici est une question de
 * `exercice.questions` (nombre variable) — on boucle donc sur `etat.resultatsQuestionsExercice`
 * (déjà accumulé par le moteur, un élément par question close, jamais recalculé) plutôt que sur un
 * ensemble fixe de champs `scoreXxxExercice`.
 */
export function calculerRecapitulatifComposeeGraphique(etat: EtatSessionComposeeGraphique): EntreeRecapitulatif[] {
  return etat.resultatsQuestionsExercice.map((resultat, index) => ({
    libelle: `Question ${index + 1} — ${labelChampResultat(resultat.question)}`,
    estLatex: false,
    valeur: formatResultatAttendu(resultat.question.resultatAttendu),
    revele: resultat.revele,
  }));
}
