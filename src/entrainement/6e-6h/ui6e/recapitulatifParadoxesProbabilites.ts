import type { EtatPuceProgression } from "../../components/ProgressionPuces";
import type { EtatSessionParadoxes } from "../moteur6e/typesParadoxesProbabilites";
import { PHASES_PARADOXE } from "../moteur6e/typesParadoxesProbabilites";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatReponseAttenduePhaseLatex, libellePhase } from "./formatParadoxesProbabilites";

/**
 * « Ce qu'on sait déjà » de `6gen76` : valeurs confirmées des écrans clos. La PRÉDICTION n'y figure
 * pas (le panneau met une coche ✓ devant chaque ligne, or une prédiction n'est ni juste ni fausse) :
 * elle est rappelée telle quelle sur l'écran de conclusion, pour la confronter au calcul.
 */
export function calculerRecapitulatifParadoxes(etat: EtatSessionParadoxes): EntreeRecapitulatif[] {
  const e = etat.exerciceCourant;
  const index = PHASES_PARADOXE.indexOf(etat.phase);
  const entrees: EntreeRecapitulatif[] = [];
  for (const phase of ["modeliser", "calculer"] as const) {
    if (PHASES_PARADOXE.indexOf(phase) >= index) break;
    entrees.push({ libelle: libellePhase(e, phase), valeur: "", estLatex: true, revele: etat.revelesPartiels[phase] ?? false, valeurs: formatReponseAttenduePhaseLatex(e, phase) });
  }
  return entrees;
}

/** Une puce par écran ; la prédiction (non notée) est « sans-objet » une fois close. */
export function calculerSegmentsProgressionParadoxes(etat: EtatSessionParadoxes, aideParPhase: Partial<Record<string, boolean>>): EtatPuceProgression[] {
  const index = etat.terminee ? PHASES_PARADOXE.length : PHASES_PARADOXE.indexOf(etat.phase);
  return PHASES_PARADOXE.map((phase, i) => {
    if (i > index) return "a-venir";
    if (i === index) return "courante";
    if (phase === "prediction") return "sans-objet";
    if (etat.revelesPartiels[phase]) return "revele";
    return aideParPhase[phase] ? "aide" : "correcte";
  });
}
