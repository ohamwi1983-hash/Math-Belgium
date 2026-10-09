import { Katex } from "../components/Katex";
import type { PhaseIntersectionsConiques, ResultatExerciceIntersectionsConiques } from "../moteur6e/typesIntersectionsConiques";
import { phasesPourExercice } from "../moteur6e/typesIntersectionsConiques";
import { LIBELLE_PHASE, calculerTotalPointsIntersectionsConiques, formatReponseAttenduePhaseLatex } from "../ui6e/formatIntersectionsConiques";
import { LigneRecap, statutRecap } from "./LigneRecap";

type AideParPhase = Partial<Record<PhaseIntersectionsConiques, { niveauAide: number; revele: boolean }>>;

interface Props {
  resultat: ResultatExerciceIntersectionsConiques;
  aideParPhase: AideParPhase;
  onContinuer: () => void;
  dernier: boolean;
}

/** Récapitulatif final — patron plat/coloré standard (`LigneRecap`/`statutRecap`), une ligne PAR
 * ÉCRAN RÉELLEMENT TRAVERSÉ (`phasesPourExercice`) — mirroir `ResultatPanelEquationConiqueCaracteristiques.tsx`
 * (6gen59). */
export function ResultatPanelIntersectionsConiques({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  const exercice = resultat.exercice;
  const phases = phasesPourExercice(exercice);
  const { total, maximum } = calculerTotalPointsIntersectionsConiques(resultat);
  return (
    <div className="card resultat-panel">
      <h2>Récapitulatif</h2>
      {phases.map((phase) => {
        const info = aideParPhase[phase];
        const statut = statutRecap(info?.revele ?? false, info?.niveauAide ?? null);
        return (
          <LigneRecap key={phase} label={LIBELLE_PHASE[phase]} statut={statut}>
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
