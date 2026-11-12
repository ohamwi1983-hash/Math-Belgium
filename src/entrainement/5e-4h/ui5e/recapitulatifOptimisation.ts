import type { EtatSessionOptimisation } from "../moteur5e/typesOptimisationGeometrique";
import { ordreEcransOptimisation } from "../moteur5e/typesOptimisationGeometrique";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatReponseAttendueEcranLatex, LIBELLE_ECRAN } from "./formatOptimisationGeometrique";

/**
 * Construit le récapitulatif (« Ce qu'on sait déjà ») des écrans déjà clos de l'exercice en cours
 * (5gen32). Icône (✓/✗) pilotée par `etat.revelesPartiels[ecran]`. Chaque entrée affiche la VRAIE
 * réponse attendue de l'écran (`formatReponseAttendueEcranLatex`) — jamais la dernière saisie de
 * l'élève, qui pouvait être fausse ou mal écrite (erreur KaTeX rouge, mots collés : audit 5e ch. 5,
 * point 12). Les écrans suivants s'appuient ainsi toujours sur des valeurs correctes.
 */
export function calculerRecapitulatifOptimisation(etat: EtatSessionOptimisation): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const entrees: EntreeRecapitulatif[] = [];

  for (const ecran of ordreEcransOptimisation(exercice)) {
    if (ecran === etat.phase) break;
    const score = etat.scoresPartiels[ecran];
    if (score === undefined) continue;
    const valeur = formatReponseAttendueEcranLatex(exercice, ecran);
    if (valeur === "") continue;
    entrees.push({
      libelle: LIBELLE_ECRAN[ecran],
      estLatex: true,
      valeur,
      revele: etat.revelesPartiels[ecran] ?? false,
    });
  }

  return entrees;
}
