// Copie 5e (6h) de `5e-4h/ui5e/recapitulatifDefinirSuite.ts` (56gen3 ← 5gen44, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
import type { EtatPuceProgression } from "../../../../components/ProgressionPuces";
import { phasesPourExercice } from "../moteur/typesDefinirSuite";
import type { EtatSessionDefinirSuite } from "../moteur/typesDefinirSuite";
import type { EntreeRecapitulatif } from "../../../../5e-4h/ui5e/recapitulatif";
import { libellePhase, reponseRecap } from "./formatDefinirSuite";

/** « Ce qu'on sait déjà » de `5gen44` : valeurs confirmées des écrans clos, jamais la saisie de l'élève. */
export function calculerRecapitulatifDefinirSuite(etat: EtatSessionDefinirSuite): EntreeRecapitulatif[] {
  const e = etat.exerciceCourant;
  const phases = phasesPourExercice(e);
  const index = etat.terminee ? phases.length : phases.indexOf(etat.phase);
  return phases.slice(0, index).map((phase) => {
    const revele = etat.revelesPartiels[phase] ?? false;
    const r = reponseRecap(e, phase);
    if ("texte" in r) return { libelle: libellePhase(e, phase), valeur: r.texte, estLatex: false, revele };
    if (r.latex.length === 1) return { libelle: libellePhase(e, phase), valeur: r.latex[0], estLatex: true, revele };
    return { libelle: libellePhase(e, phase), valeur: "", estLatex: true, revele, valeurs: r.latex.map((x, i) => (i < r.latex.length - 1 ? `${x}\\;;` : x)) };
  });
}

/** Une puce par écran (toujours trois). */
export function calculerSegmentsProgressionDefinirSuite(etat: EtatSessionDefinirSuite, aideParPhase: Partial<Record<string, boolean>>): EtatPuceProgression[] {
  const phases = phasesPourExercice(etat.exerciceCourant);
  const index = etat.terminee ? phases.length : phases.indexOf(etat.phase);
  return phases.map((phase, i) => {
    if (i > index) return "a-venir";
    if (i === index) return "courante";
    if (etat.revelesPartiels[phase]) return "revele";
    return aideParPhase[phase] ? "aide" : "correcte";
  });
}
