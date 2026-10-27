import type { EtatSessionFormuleMoivre } from "../moteur6e/typesFormuleMoivre";
import { phasesPourExercice } from "../moteur6e/typesFormuleMoivre";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { LIBELLE_PHASE, formatReponseAttenduePhaseLatex } from "./formatFormuleMoivre";

/**
 * Construit le récapitulatif des écrans déjà clos de l'exercice en cours. Réutilise
 * `LIBELLE_PHASE`/`phasesPourExercice`/`formatReponseAttenduePhaseLatex`, déjà exportés par
 * `formatFormuleMoivre.ts`/`typesFormuleMoivre.ts` — jamais une logique recalculée séparément.
 * Séquence FIXE à 3 écrans (`phasesPourExercice` ignore ici `exercice`, voir en-tête de
 * `typesFormuleMoivre.ts`), mais réutilisée telle quelle pour rester cohérente avec les 8 autres
 * générateurs de ce chantier.
 */
export function calculerRecapitulatifFormuleMoivre(etat: EtatSessionFormuleMoivre): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const sequence = phasesPourExercice(exercice);
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));

  return precedentes.map((phase) => {
    const valeurs = formatReponseAttenduePhaseLatex(exercice, phase);
    const revele = etat.revelesPartiels[phase] ?? false;
    return { libelle: LIBELLE_PHASE[phase], estLatex: true, valeur: valeurs.join(" \\quad "), valeurs, revele };
  });
}

/** Une puce par écran de la séquence FIXE à 3 écrans (`phasesPourExercice`). */
export function calculerSegmentsProgressionFormuleMoivre(etat: EtatSessionFormuleMoivre) {
  const sequence = phasesPourExercice(etat.exerciceCourant);
  return sequence.map((phase) => {
    if (phase === etat.phase) return "courante" as const;
    if (etat.scoresPartiels[phase] === undefined) return "a-venir" as const;
    return etat.revelesPartiels[phase] ? ("revele" as const) : ("correcte" as const);
  });
}
