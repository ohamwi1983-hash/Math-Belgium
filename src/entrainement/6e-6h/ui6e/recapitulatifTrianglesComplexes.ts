import type { EtatSessionTrianglesComplexes, PhaseTrianglesComplexes } from "../moteur6e/typesTrianglesComplexes";
import { phasesPourExercice } from "../moteur6e/typesTrianglesComplexes";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { LIBELLE_PHASE, formatReponseAttenduePhaseLatex } from "./formatTrianglesComplexes";

/**
 * Construit le récapitulatif des écrans déjà clos de l'exercice en cours. Réutilise
 * `LIBELLE_PHASE`/`phasesPourExercice`/`formatReponseAttenduePhaseLatex`, déjà exportés par
 * `formatTrianglesComplexes.ts`/`typesTrianglesComplexes.ts` — jamais une logique recalculée
 * séparément.
 */
export function calculerRecapitulatifTrianglesComplexes(etat: EtatSessionTrianglesComplexes): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const sequence = phasesPourExercice(exercice);
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));

  return precedentes.map((phase: PhaseTrianglesComplexes) => {
    // Une valeur qui finit par un radical (√n) déborde de 2 px de sa boîte KaTeX (queue du
    // symbole) et déclenchait une barre de défilement dans `.recap-corps` : petite espace finale.
    const valeurs = formatReponseAttenduePhaseLatex(exercice, phase).map((v) => (/\\sqrt\{[^{}]*\}\}?$/.test(v) ? `${v}\\,` : v));
    const revele = etat.revelesPartiels[phase] ?? false;
    return { libelle: LIBELLE_PHASE[phase], estLatex: true, valeur: valeurs.join(" \\quad "), valeurs, revele };
  });
}

/** Une puce par écran RÉELLEMENT traversé par CET exercice (`phasesPourExercice`), jamais une
 * séquence fixe commune aux 4 familles. */
export function calculerSegmentsProgressionTrianglesComplexes(etat: EtatSessionTrianglesComplexes) {
  const sequence = phasesPourExercice(etat.exerciceCourant);
  return sequence.map((phase) => {
    if (phase === etat.phase) return "courante" as const;
    if (etat.scoresPartiels[phase] === undefined) return "a-venir" as const;
    return etat.revelesPartiels[phase] ? ("revele" as const) : ("correcte" as const);
  });
}
