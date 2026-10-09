import { Katex } from "../components/Katex";
import type { PhaseProprietesLogarithme, ResultatExerciceProprietesLogarithme } from "../moteur6e/typesProprietesLogarithme";
import { LIBELLE_PHASE, calculerTotalPointsProprietesLogarithme, formatReponseAttenduePhaseLatex } from "../ui6e/formatProprietesLogarithme";
import { LigneRecap, statutRecap } from "./LigneRecap";

type AideParPhase = Partial<Record<PhaseProprietesLogarithme, { niveauAide: number; revele: boolean }>>;

interface Props {
  resultat: ResultatExerciceProprietesLogarithme;
  aideParPhase: AideParPhase;
  onContinuer: () => void;
  dernier: boolean;
}

const PHASES: PhaseProprietesLogarithme[] = ["ecran1", "ecran2"];

/**
 * Écran récapitulatif final — patron plat/coloré (`LigneRecap`), toujours EXACTEMENT 2 lignes
 * (2 écrans fixes, jamais de dispatch par famille comme `ResultatPanelExponentiellesProblemes.tsx`,
 * 6gen12). Le total chiffré est un COMPLÉMENT séparé (`.recap-final-total`), jamais à la place
 * d'une ligne colorée (CLAUDE.md).
 */
export function ResultatPanelProprietesLogarithme({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  const exercice = resultat.exercice;
  const { total, maximum } = calculerTotalPointsProprietesLogarithme(resultat);
  return (
    <div className="card resultat-panel">
      <h2>Récapitulatif</h2>
      {PHASES.map((phase) => {
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
