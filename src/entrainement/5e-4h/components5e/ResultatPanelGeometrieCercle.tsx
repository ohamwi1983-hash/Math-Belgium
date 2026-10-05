import type { PhaseGeometrieCercle, ResultatExerciceGeometrieCercle } from "../moteur5e/typesGeometrieCercle";
import { formatValeurPhaseLatex, labelRecapPhase, phasesDuScenario } from "../ui5e/formatGeometrieCercle";
import { LigneRecap, statutRecap, RecapTotalPoints } from "./LigneRecap";
import { Katex } from "../components/Katex";

interface Props {
  resultat: ResultatExerciceGeometrieCercle;
  aideParPhase: Partial<Record<PhaseGeometrieCercle, { niveauAide: number; revele: boolean }>>;
  onContinuer: () => void;
  dernier: boolean;
}

/** Écran récapitulatif final — une ligne `LigneRecap` par phase RÉELLEMENT traversée par le scénario
 * de l'instance (`phasesDuScenario`, toujours la séquence COMPLÈTE pour ce générateur — aucun saut
 * conditionnel, contrairement à 5gen1). `aideParPhase` (fourni par `App5gen12.tsx`, capturé au
 * moment précis où chaque écran se ferme, `etat.niveauAide`/`etat.etapeCourante.revelee`) porte le
 * suivi précis par écran — `ResultatExerciceGeometrieCercle` (Couche B) ne le trace pas lui-même,
 * jamais touché ici. */
export function ResultatPanelGeometrieCercle({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  const exercice = resultat.exercice;
  const phases = phasesDuScenario(exercice.scenario);

  function statutPhase(phase: PhaseGeometrieCercle) {
    const info = aideParPhase[phase];
    return statutRecap(info?.revele ?? false, info?.niveauAide ?? null);
  }

  return (
    <div className="resultat-panel">
      <h2>Récapitulatif</h2>
      {phases.map((phase) => (
        <LigneRecap key={phase} label={labelRecapPhase(phase)} statut={statutPhase(phase)}>
          <Katex expression={formatValeurPhaseLatex(exercice, phase)} />
        </LigneRecap>
      ))}
      <RecapTotalPoints
        ecrans={phases.map((phase) => {
          const info = aideParPhase[phase];
          return { revele: info?.revele ?? false, niveauAide: info?.niveauAide ?? null };
        })}
      />
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {dernier ? "Voir le résumé" : "Exercice suivant"}
      </button>
    </div>
  );
}
