import type { ExerciceOptimisation } from "../core/optimisation.types";
import { segmentsPhraseEnonce } from "../ui/formatOptimisation";
import { QuestionFinale } from "./QuestionFinale";
import { SegmentsInline } from "./SegmentsInline";

interface Props {
  exercice: ExerciceOptimisation;
}

/** Bloc "énoncé" persistant — affiché en tête de chaque écran (même principe que
 * `EnonceComparaisonSeries.tsx`), pour que le contexte narratif reste visible sur toute la
 * séquence. `contexte.phraseEnonce` peut embarquer un fragment `$...$` (la fonction déjà donnée,
 * variante `fonctionDonnee`) — jamais un unique bloc KaTeX pour la phrase entière.
 *
 * `QuestionFinale` (voir CLAUDE.md, "Question finale persistante") rendue APRÈS le bloc énoncé
 * (jamais à l'intérieur — ne concurrence pas visuellement le contexte narratif) ; ne rend rien pour
 * les exercices "gen57" embarqués dont la vraie question finale est portée ailleurs
 * (`ExerciceEquationInequationCommun.questionFinale`, jamais `contexte.questionFinale`).
 *
 * `CroquisOptimisation` (`prompt-implementation-3-diagrammes-svg.md`) — n'est PLUS rendu ici depuis
 * `prompt-restructuration-architecture-modelisation.md` (le placement persistant sur toute la
 * séquence était une première version) : rendu désormais UNIQUEMENT sur l'écran
 * "contrainteEtGrandeur" (`EtapeContrainteEtGrandeurOptimisation.tsx`), l'écran où la relation
 * géométrique est établie — c'est là que le schéma apporte le plus. */
export function EnonceOptimisation({ exercice }: Props) {
  return (
    <>
      <div className="equation-box">
        <p className="prompt-text">
          <SegmentsInline segments={segmentsPhraseEnonce(exercice.contexte.phraseEnonce)} />
        </p>
      </div>
      <QuestionFinale question={exercice.contexte.questionFinale} />
    </>
  );
}
