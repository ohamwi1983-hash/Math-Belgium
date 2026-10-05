import type { PhaseEtudeComplete, ResultatExerciceEtudeComplete } from "../moteur5e/typesEtudeComplete";
import { ordreComplet } from "../moteur5e/typesEtudeComplete";
import { estPhaseTexteSimple, formatFonctionLatex, formatReponseAttendueTexte, formatReponseAttenduePhaseLatex, formatProprietesConstructionInverseTexte, labelPhase } from "../ui5e/formatEtudeComplete";
import { Katex } from "../components/Katex";
import { LigneRecap, RecapTotalPoints, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceEtudeComplete;
  aideParPhase: Partial<Record<PhaseEtudeComplete, { niveauAide: number; revele: boolean }>>;
  onContinuer: () => void;
  dernier: boolean;
}

/** Écran récapitulatif final — une `LigneRecap` par écran RÉELLEMENT traversé (pipeline VARIABLE :
 * 1 ou 2 exclusions, cas spécial optionnel). Variante bonus : une seule ligne, texte simple. */
export function ResultatPanelEtudeComplete({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  const exercice = resultat.exercice;
  const phases = ordreComplet(exercice);

  function statutPhase(phase: PhaseEtudeComplete) {
    const info = aideParPhase[phase];
    return statutRecap(info?.revele ?? false, info?.niveauAide ?? null);
  }

  return (
    <div className="resultat-panel">
      <h2>Récapitulatif</h2>
      {exercice.mode === "etude" && (
        <div className="equation-box equation-box-termes">
          <Katex expression={formatFonctionLatex(exercice)} block />
        </div>
      )}
      {exercice.mode === "constructionInverse" && (
        <div className="equation-box equation-box-donnees">
          {formatProprietesConstructionInverseTexte(exercice.proprietes).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}
      {phases.map((phase) => {
        const score = resultat.scores[phase];
        if (score === undefined) return null;
        const statut = statutPhase(phase);
        return (
          <LigneRecap key={phase} label={labelPhase(phase)} statut={statut}>
            {estPhaseTexteSimple(exercice, phase) ? (
              <span>{formatReponseAttendueTexte(exercice, phase)}</span>
            ) : exercice.mode === "etude" ? (
              <span className="equation-box-termes">
                {formatReponseAttenduePhaseLatex(exercice, phase).map((frag, i) => (
                  <Katex key={i} expression={frag} />
                ))}
              </span>
            ) : null}
          </LigneRecap>
        );
      })}
      <RecapTotalPoints
        ecrans={phases
          .filter((phase) => resultat.scores[phase] !== undefined)
          .map((phase) => {
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
