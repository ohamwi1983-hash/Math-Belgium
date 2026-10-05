import type { CompositionDirigee, ExerciceComposerFonctions } from "../core5e/composerFonctions.types";
import type { EnsembleReelGuide } from "../core5e/domaineDefinition.types";
import type { PhaseComposerFonctions, ResultatExerciceComposerFonctions } from "../moteur5e/typesComposerFonctions";
import { ordreComplet } from "../moteur5e/typesComposerFonctions";
import { formatTermesEnsembleReelLatex } from "../ui5e/formatDomaineDefinition";
import { estPhaseFRondG, formatTermesConditionsLatex, libellePhaseComposerFonctions } from "../ui5e/formatComposerFonctions";
import { Katex } from "../components/Katex";
import { LigneRecap, RecapTotalPoints, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceComposerFonctions;
  aideParPhase: Partial<Record<PhaseComposerFonctions, number>>;
  onContinuer: () => void;
  dernier: boolean;
}

function LigneDomaineTermes({ ensemble }: { ensemble: EnsembleReelGuide }) {
  const termes = formatTermesEnsembleReelLatex(ensemble);
  return (
    <span className="equation-box-termes">
      {termes.map((t, i) => (
        <Katex key={i} expression={t} />
      ))}
    </span>
  );
}

function directionDe(exercice: ExerciceComposerFonctions, phase: PhaseComposerFonctions): CompositionDirigee | null {
  return estPhaseFRondG(phase) ? exercice.fRondG : exercice.gRondF;
}

/** Contenu (réponse RÉELLEMENT attendue) d'une ligne du récapitulatif — dispatché par TYPE de
 * phase (formule/conditions/c1/c2/domaine), jamais par nom exact (10 valeurs possibles, seul le
 * préfixe compte — même principe que `sessionComposerFonctions.ts::soumettreGenerique`). */
function ContenuLigne({ exercice, phase }: { exercice: ExerciceComposerFonctions; phase: PhaseComposerFonctions }) {
  const dir = directionDe(exercice, phase);
  if (dir === null) return null;
  if (phase.startsWith("formule")) return <Katex expression={`(${estPhaseFRondG(phase) ? "f\\circ g" : "g\\circ f"})(x) = ${dir.latex}`} />;
  if (phase.startsWith("conditions")) {
    const termes = formatTermesConditionsLatex(dir);
    return (
      <span className="equation-box-termes">
        {termes.map((t, i) => (
          <Katex key={i} expression={t} />
        ))}
      </span>
    );
  }
  if (phase.startsWith("c1")) return <LigneDomaineTermes ensemble={dir.interieure.domaine} />;
  if (phase.startsWith("c2")) return dir.domaineApresCarre !== null ? <LigneDomaineTermes ensemble={dir.domaineApresCarre} /> : null;
  return <LigneDomaineTermes ensemble={dir.domaine} />;
}

/**
 * Écran récapitulatif final — même patron plat/coloré que `ResultatPanelDomaineDefinition.tsx`
 * (5gen1) : une `LigneRecap` PAR PHASE de `ordreComplet(exercice)` (2 à 10 selon `sens`/richesse des
 * 2 directions, jamais un ensemble fixe), contenant la réponse RÉELLEMENT attendue.
 *
 * `ResultatExerciceComposerFonctions` ne trace aucun `niveauAide` par phase (seuls `scores`/
 * `reveles` sont persistés côté Couche B) — le niveau d'aide RÉELLEMENT utilisé par écran est donc
 * capturé côté présentation (`App5gen3.tsx`, `aideParPhase`, figé au moment où l'écran se ferme) et
 * transmis ici en prop, jamais recalculé depuis le score (qui reste `<100` après une simple
 * tentative ratée sans aide, ce qui classerait à tort l'écran en orange).
 */
export function ResultatPanelComposerFonctions({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  const ex = resultat.exercice;
  const ordre = ordreComplet(ex);
  return (
    <div className="resultat-panel">
      <h2>Récapitulatif</h2>
      {ordre.map((phase) => (
        <LigneRecap key={phase} label={libellePhaseComposerFonctions(phase)} statut={statutRecap(resultat.reveles[phase] ?? false, aideParPhase[phase] ?? null)}>
          <ContenuLigne exercice={ex} phase={phase} />
        </LigneRecap>
      ))}
      <RecapTotalPoints ecrans={ordre.map((phase) => ({ revele: resultat.reveles[phase] ?? false, niveauAide: aideParPhase[phase] ?? null }))} />
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {dernier ? "Voir le résumé" : "Exercice suivant"}
      </button>
    </div>
  );
}
