import { Katex } from "../components/Katex";
import type { PhaseLieuxGeometriquesParametres, ResultatExerciceLieuxGeometriquesParametres } from "../moteur6e/typesLieuxGeometriquesParametres";
import { phasesPourExercice } from "../moteur6e/typesLieuxGeometriquesParametres";
import { calculerTotalPointsLieuxGeometriquesParametres, formatReponseAttenduePhaseLatex, libellePhase } from "../ui6e/formatLieuxGeometriquesParametres";
import { LigneRecap, statutRecap } from "./LigneRecap";

type AideParPhase = Partial<Record<PhaseLieuxGeometriquesParametres, { niveauAide: number; revele: boolean }>>;

interface Props {
  resultat: ResultatExerciceLieuxGeometriquesParametres;
  aideParPhase: AideParPhase;
  onContinuer: () => void;
  dernier: boolean;
}

/** Récapitulatif final — patron plat/coloré standard (`LigneRecap`/`statutRecap`), une ligne PAR
 * ÉCRAN RÉELLEMENT TRAVERSÉ (`phasesPourExercice` — longueur VARIABLE selon la famille/sous-type/
 * régime, voir `moteur6e/typesLieuxGeometriquesParametres.ts`) — mirroir
 * `ResultatPanelDenombrementFondamental.tsx` (6gen43). */
export function ResultatPanelLieuxGeometriquesParametres({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  const exercice = resultat.exercice;
  const phases = phasesPourExercice(exercice);
  const { total, maximum } = calculerTotalPointsLieuxGeometriquesParametres(resultat);
  return (
    <div className="card resultat-panel">
      <h2>Récapitulatif</h2>
      {phases.map((phase) => {
        const info = aideParPhase[phase];
        const statut = statutRecap(info?.revele ?? false, info?.niveauAide ?? null);
        return (
          <LigneRecap key={phase} label={libellePhase(phase)} statut={statut}>
            <span className="equation-box-termes">
              {formatReponseAttenduePhaseLatex(exercice, phase).map((frag, i) => (
                <Katex key={i} expression={frag} />
              ))}
            </span>
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
