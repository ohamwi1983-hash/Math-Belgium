import type { EtatSessionProprietesOptiquesConiques, PhaseProprietesOptiquesConiques } from "../moteur6e/typesProprietesOptiquesConiques";
import { TOUTES_LES_PHASES } from "../moteur6e/typesProprietesOptiquesConiques";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { LIBELLE_PHASE, formatReponseAttenduePhaseLatex } from "./formatProprietesOptiquesConiques";

/**
 * Construit le récapitulatif des écrans déjà clos de l'exercice en cours. Réutilise
 * `LIBELLE_PHASE`/`TOUTES_LES_PHASES`/`formatReponseAttenduePhaseLatex`, déjà exportés par
 * `formatProprietesOptiquesConiques.ts`/`typesProprietesOptiquesConiques.ts` — jamais une logique
 * recalculée séparément. Une seule famille, TOUJOURS les 4 mêmes écrans (voir en-tête de
 * `typesProprietesOptiquesConiques.ts`), donc `TOUTES_LES_PHASES` (équivalent ici de
 * `PHASES_PAR_FAMILLE`) suffit — pas de `phasesPourExercice`.
 */
export function calculerRecapitulatifProprietesOptiquesConiques(etat: EtatSessionProprietesOptiquesConiques): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const sequence = TOUTES_LES_PHASES;
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));

  return precedentes.map((phase: PhaseProprietesOptiquesConiques) => {
    const valeurs = formatReponseAttenduePhaseLatex(exercice, phase);
    const revele = etat.revelesPartiels[phase] ?? false;
    return { libelle: LIBELLE_PHASE[phase], estLatex: true, valeur: valeurs.join(" \\quad "), valeurs, revele };
  });
}

/** Une puce par écran de la séquence FIXE (`TOUTES_LES_PHASES`) — toujours les 4 mêmes écrans. */
export function calculerSegmentsProgressionProprietesOptiquesConiques(etat: EtatSessionProprietesOptiquesConiques) {
  const sequence = TOUTES_LES_PHASES;
  return sequence.map((phase) => {
    if (phase === etat.phase) return "courante" as const;
    if (etat.scoresPartiels[phase] === undefined) return "a-venir" as const;
    return etat.revelesPartiels[phase] ? ("revele" as const) : ("correcte" as const);
  });
}
