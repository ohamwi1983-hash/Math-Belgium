import { Katex } from "../components/Katex";
import { phaseApres, phaseInitiale } from "../moteur6e/typesInequationsLogarithmiques";
import type { PhaseInequationLogarithmique, ResultatExerciceInequationLogarithmique } from "../moteur6e/typesInequationsLogarithmiques";
import { LIBELLE_PHASE_LOG, contenuRecapPhase, totalPointsRecap } from "../ui6e/formatInequationsLogarithmiques";
import { LigneRecap, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceInequationLogarithmique;
  aideParPhase: Partial<Record<PhaseInequationLogarithmique, { niveauAide: number; revele: boolean }>>;
  onContinuer: () => void;
  dernier: boolean;
}

/** Séquence RÉELLE de phases traversées par CETTE instance — dérivée de `phaseInitiale`/
 * `phaseApres` (Couche B, seule source de vérité pour l'enchaînement), jamais redupliquée ici. */
function ordrePhases(exercice: ResultatExerciceInequationLogarithmique["exercice"]): PhaseInequationLogarithmique[] {
  const phases: PhaseInequationLogarithmique[] = [];
  let phase = phaseInitiale(exercice);
  for (;;) {
    phases.push(phase);
    const suivante = phaseApres(phase);
    if (suivante === "termine") return phases;
    phase = suivante;
  }
}

/**
 * Écran récapitulatif final — même patron plat/coloré que `ResultatPanelInequationExponentielle.tsx`
 * (6gen10, voir CLAUDE.md "Récapitulatif final à plat, coloré") : une `LigneRecap` PAR ÉCRAN
 * RÉELLEMENT TRAVERSÉ, contenant la réponse ATTENDUE — jamais un score fractionnaire `X/100`.
 */
export function ResultatPanelInequationLogarithmique({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  const phases = ordrePhases(resultat.exercice);
  const { total, maximum } = totalPointsRecap(resultat);

  return (
    <div className="card resultat-panel">
      <h2>Récapitulatif</h2>
      {phases.map((phase) => {
        const info = aideParPhase[phase];
        const statut = statutRecap(info?.revele ?? false, info?.niveauAide ?? null);
        const contenu = contenuRecapPhase(resultat.exercice, phase);
        return (
          <LigneRecap key={phase} label={LIBELLE_PHASE_LOG[phase]} statut={statut}>
            {contenu.latex !== null ? <Katex expression={contenu.latex} /> : contenu.texte}
          </LigneRecap>
        );
      })}
      <div className="recap-final-total">
        <strong>Total</strong> : {Math.round(total)}/{maximum}
      </div>
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {dernier ? "Voir le résumé" : "Exercice suivant"}
      </button>
    </div>
  );
}
