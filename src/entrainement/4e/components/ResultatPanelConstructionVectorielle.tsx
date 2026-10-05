import type { ExerciceConstructionVectorielle } from "../core/constructionVectorielle.types";
import type { ResultatExerciceConstructionVectorielle } from "../moteur/typesConstructionVectorielle";
import { Katex } from "./Katex";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";

/** Notation matricielle colonne (2×1) — jamais la notation en ligne d'un point (correction
 * transversale : un vecteur ne doit jamais être visuellement indiscernable d'un point). */
function formatVecteurColonneLatex(v: { x: number; y: number }): string {
  return `\\begin{pmatrix} ${v.x} \\\\ ${v.y} \\end{pmatrix}`;
}

interface Props {
  resultat: ResultatExerciceConstructionVectorielle;
  exercice: ExerciceConstructionVectorielle;
  afficherReponseApresEchec: boolean;
  labelBouton: string;
  onContinuer: () => void;
}

/**
 * Récapitulatif uniformisé (`LigneRecap`/`statutRecap`/`TotalPointsRecap`, convention CLAUDE.md) —
 * remplace l'ancien format `score-list`/`X/100`. Pas de bouton Aide sur ce générateur (voir
 * `sessionConstructionVectorielle.ts`) : `statutRecap` reçoit toujours `niveauAide=null`, jamais
 * orange, seulement vert/rouge selon `constructionRevele`.
 */
export function ResultatPanelConstructionVectorielle({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const statut = statutRecap(resultat.constructionRevele, null);
  return (
    <div>
      <h2 className="result-title">Construction graphique de vecteurs</h2>
      <p className="result-subtitle">Résultat de l'exercice</p>
      <LigneRecap label="Construction" statut={statut}>
        {libelleStatutRecap(statut)}
      </LigneRecap>
      <TotalPointsRecap points={resultat.scoreConstruction} maxPoints={100} />
      {afficherReponseApresEchec && resultat.scoreConstruction === 0 && (
        <div className="answer-reveal">
          Vecteur attendu : <Katex expression={formatVecteurColonneLatex(exercice.cibleComposantes)} />, depuis n'importe quel point d'ancrage.
        </div>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
