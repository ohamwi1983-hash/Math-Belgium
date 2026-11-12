import type { EtatSessionFrequenceProbabilite } from "../moteur6e/typesFrequenceProbabilite";
import { phasesPourExercice } from "../moteur6e/typesFrequenceProbabilite";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { LIBELLE_PHASE, reponseAttendueFragments, reponseAttendueTexte } from "./formatFrequenceProbabilite";

/** Récapitulatif « Ce qu'on sait déjà » de `6gen75` : la valeur CONFIRMÉE de chaque écran clos
 * (formule KaTeX, ou phrase pour les écrans à choix), avec ✓/✗ selon `revelesPartiels`. */
export function calculerRecapitulatifFrequenceProbabilite(etat: EtatSessionFrequenceProbabilite): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const sequence = phasesPourExercice(exercice);
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));
  return precedentes.map((phase) => {
    const revele = etat.revelesPartiels[phase] ?? false;
    const texte = reponseAttendueTexte(exercice, phase);
    if (texte !== null) return { libelle: LIBELLE_PHASE[phase], estLatex: false, valeur: texte, revele };
    const valeurs = reponseAttendueFragments(exercice, phase).map((f) => f.valeur);
    return { libelle: LIBELLE_PHASE[phase], estLatex: true, valeur: valeurs.join(" \\quad "), valeurs, revele };
  });
}

export function calculerSegmentsProgressionFrequenceProbabilite(etat: EtatSessionFrequenceProbabilite) {
  const sequence = phasesPourExercice(etat.exerciceCourant);
  return sequence.map((phase) => {
    if (phase === etat.phase) return "courante" as const;
    if (etat.scoresPartiels[phase] === undefined) return "a-venir" as const;
    return etat.revelesPartiels[phase] ? ("revele" as const) : ("correcte" as const);
  });
}
