import type { EtatSessionContexteEconomique } from "../moteur5e/typesContexteEconomique";
import { ordreEcransContexteEconomique } from "../moteur5e/typesContexteEconomique";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatReponseAttenduePhaseLatex, LIBELLE_ECRAN_CONTEXTE_ECONOMIQUE } from "./formatContexteEconomique";

/**
 * Construit le récapitulatif des écrans déjà clos de l'exercice en cours (5gen33). Le signal
 * "révélé" vient de `etat.revelesPartiels[ecran]`, peuplé depuis `etapeCourante.revelee` à la
 * clôture de chaque écran (`sessionContexteEconomique.ts::soumettreEcran`).
 * `ordreEcransContexteEconomique(exercice)` donne la séquence RÉELLE (5 écrans pour la famille "A",
 * 8 pour "B", 6 pour le bonus — fixée dès le tirage, voir `typesContexteEconomique.ts`) ; on
 * s'arrête à l'écran courant (pas encore clos). Réutilise `formatReponseAttenduePhaseLatex`, déjà
 * la seule source de vérité pour la réponse CONFIRMÉE par écran (même fonction que la bannière de
 * validation ET le bloc "état actuel" dans `App5gen33.tsx`/`formatTermesEtatActuelLatex`).
 */
export function calculerRecapitulatifContexteEconomique(etat: EtatSessionContexteEconomique): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const entrees: EntreeRecapitulatif[] = [];

  for (const ecran of ordreEcransContexteEconomique(exercice)) {
    if (ecran === etat.phase) break;
    const score = etat.scoresPartiels[ecran];
    if (score === undefined) continue;
    const valeurs = formatReponseAttenduePhaseLatex(exercice, ecran);
    if (valeurs.length === 0) continue;
    entrees.push({
      libelle: LIBELLE_ECRAN_CONTEXTE_ECONOMIQUE[ecran],
      estLatex: true,
      valeur: valeurs.join("\\quad"),
      ...(valeurs.length > 1 ? { valeurs } : {}),
      revele: etat.revelesPartiels[ecran] ?? false,
    });
  }

  return entrees;
}
