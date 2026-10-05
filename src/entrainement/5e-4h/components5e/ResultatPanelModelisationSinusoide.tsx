import type { PhaseModelisationSinusoide, ResultatExerciceModelisationSinusoide } from "../moteur5e/typesModelisationSinusoide";
import { ordreComplet } from "../moteur5e/typesModelisationSinusoide";
import { LIBELLE_PHASE, formatTermesDonneesLatex, formatTermesReponseAttendueModelisationSinusoide } from "../ui5e/formatModelisationSinusoide";
import { Katex } from "../components/Katex";
import { LigneRecap, statutRecap, RecapTotalPoints } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceModelisationSinusoide;
  aideParPhase: Partial<Record<PhaseModelisationSinusoide, { niveauAide: number; revele: boolean }>>;
  onContinuer: () => void;
  dernier: boolean;
}

/** Fragments KaTeX d'une ligne du récapitulatif — un `<Katex>` par fragment COMPLET, jamais un
 * unique bloc `\quad`-joined (bloc fitter, plusieurs phases pouvant avoir 2 valeurs ou plus, ex.
 * "systeme"/"resolution"/les listes de branches ou de solutions). */
function FragmentsRecap({ fragments }: { fragments: string[] }) {
  if (fragments.length === 0) return null;
  return (
    <>
      {fragments.map((f, i) => (
        <span key={i}>
          <Katex expression={f} />
          {i < fragments.length - 1 ? "  " : ""}
        </span>
      ))}
    </>
  );
}

/**
 * Écran récapitulatif final — liste à plat (même convention que 5gen1, `ResultatPanelDomaineDefinition.tsx`,
 * et 5gen11, `ResultatPanelExtremumsSinusoide.tsx`) : itère `ordreComplet(exercice)` (la séquence
 * RÉELLEMENT traversée par CETTE instance — jusqu'à 17 phases possibles selon la technique/le type
 * réellement tirés, jamais une liste fixe) et affiche, pour chaque phase, la réponse VRAIMENT
 * attendue (jamais un score fractionnaire `X/100`), colorée via `aideParPhase` (fourni par
 * `App5gen13.tsx`, capturé au moment précis où chaque écran se ferme).
 */
export function ResultatPanelModelisationSinusoide({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  const exercice = resultat.exercice;
  const phases = ordreComplet(exercice);

  function statutPhase(phase: PhaseModelisationSinusoide) {
    const info = aideParPhase[phase];
    return statutRecap(info?.revele ?? false, info?.niveauAide ?? null);
  }

  return (
    <div className="resultat-panel">
      <h2>Récapitulatif</h2>
      <div className="equation-box equation-box-termes">
        {formatTermesDonneesLatex(exercice).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>
      {phases.map((phase) => {
        const score = resultat.scores[phase];
        if (score === undefined) return null;
        return (
          <LigneRecap key={phase} label={LIBELLE_PHASE[phase]} statut={statutPhase(phase)}>
            <FragmentsRecap fragments={formatTermesReponseAttendueModelisationSinusoide(exercice, phase)} />
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
