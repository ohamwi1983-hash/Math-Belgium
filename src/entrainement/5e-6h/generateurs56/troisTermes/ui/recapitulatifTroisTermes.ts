// Copie 5e (6h) de `5e-4h/ui5e/recapitulatifTroisTermes.ts` (56gen5 ← 5gen46, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
import type { EtatPuceProgression } from "../../../../components/ProgressionPuces";
import { PHASES_TROIS_TERMES, phasesJouees } from "../moteur/typesTroisTermes";
import type { EtatSessionTroisTermes } from "../moteur/typesTroisTermes";
import type { EntreeRecapitulatif } from "../../../../5e-4h/ui5e/recapitulatif";
import { libellePhase, reponseRecap } from "./formatTroisTermes";

/** « Ce qu'on sait déjà » de `5gen46` : valeurs confirmées des écrans clos, jamais la saisie de l'élève. */
export function calculerRecapitulatifTroisTermes(etat: EtatSessionTroisTermes): EntreeRecapitulatif[] {
  const e = etat.exerciceCourant;
  const phases = phasesJouees(e);
  const index = etat.terminee ? phases.length : phases.indexOf(etat.phase);
  return phases.slice(0, index).map((phase) => {
    const valeurs = reponseRecap(e, phase);
    const revele = etat.revelesPartiels[phase] ?? false;
    if (valeurs.length === 0) return { libelle: libellePhase(phase), valeur: "aucune valeur ne convient", estLatex: false, revele };
    return { libelle: libellePhase(phase), valeur: "", estLatex: true, revele, valeurs: valeurs.map((x, i) => (i < valeurs.length - 1 ? `${x}\\;;` : x)) };
  });
}

/** Toujours QUATRE puces (leur nombre ne trahit pas le verdict) ; l'écran `termes` est « sans
 * objet » une fois l'exercice fini sans valeur qui convient. */
export function calculerSegmentsProgressionTroisTermes(etat: EtatSessionTroisTermes, aideParPhase: Partial<Record<string, boolean>>): EtatPuceProgression[] {
  const jouees = phasesJouees(etat.exerciceCourant);
  const index = etat.terminee ? PHASES_TROIS_TERMES.length : PHASES_TROIS_TERMES.indexOf(etat.phase);
  return PHASES_TROIS_TERMES.map((phase, i) => {
    if (!jouees.includes(phase) && etat.terminee) return "sans-objet";
    if (i > index) return "a-venir";
    if (i === index) return "courante";
    if (etat.revelesPartiels[phase]) return "revele";
    return aideParPhase[phase] ? "aide" : "correcte";
  });
}
