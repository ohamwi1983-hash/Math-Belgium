import type { ExerciceCombinaisonVecteurs } from "../core/combinaisonVecteurs.types";
import type { ResultatExerciceCombinaisonVecteurs } from "../moteur/typesCombinaisonVecteurs";
import {
  formatEquationReduiteLatex,
  formatResultatLatex,
  formatVecteurColonneLatex,
  libelleVarianteCombinaisonVecteurs,
} from "../ui/formatCombinaisonVecteurs";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";
import { Katex } from "./Katex";

interface Props {
  resultat: ResultatExerciceCombinaisonVecteurs;
  exercice: ExerciceCombinaisonVecteurs;
  afficherReponseApresEchec: boolean;
  labelBouton: string;
  onContinuer: () => void;
}

function LigneEcran({ label, revele, niveauAide }: { label: string; revele: boolean; niveauAide: number }) {
  const statut = statutRecap(revele, niveauAide);
  return (
    <LigneRecap label={label} statut={statut}>
      {libelleStatutRecap(statut)}
    </LigneRecap>
  );
}

/** Récapitulatif final uniformisé (`LigneRecap`/`statutRecap`/`TotalPointsRecap`, convention
 * CLAUDE.md "Récapitulatif final") — remplace l'ancien format `score-list`/`X/100` par écran. Les 2
 * scores sont toujours des `number` (jamais `null`, aucune étape sautable ici) — structure aussi
 * simple que "Triangle quelconque"/"Loi des sinus" sur ce plan. La pénalité d'aide progressive
 * (jusqu'à -20/niveau) est déjà entièrement reflétée dans le score ; `niveauAideSimplification`/
 * `niveauAideComposantes` (capturés à la clôture de chaque écran, jamais dérivés du score a
 * posteriori) ne servent ici qu'à colorer la ligne en orange. */
export function ResultatPanelCombinaisonVecteurs({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const totalPoints = resultat.scoreSimplification + resultat.scoreComposantes;
  const maxPoints = 200;

  return (
    <div>
      <h2 className="result-title">
        Calcul de composantes de combinaisons linéaires — {libelleVarianteCombinaisonVecteurs(resultat.variante)}
      </h2>
      <p className="result-subtitle">Résultat de l'exercice</p>
      <LigneEcran label="Réduction symbolique" revele={resultat.simplificationRevele} niveauAide={resultat.niveauAideSimplification} />
      <LigneEcran label="Composantes" revele={resultat.composantesRevele} niveauAide={resultat.niveauAideComposantes} />
      <TotalPointsRecap points={totalPoints} maxPoints={maxPoints} />
      {afficherReponseApresEchec && resultat.scoreSimplification === 0 && (
        <div className="answer-reveal">
          Réduction attendue : <Katex expression={formatEquationReduiteLatex(exercice)} />
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreComposantes === 0 && (
        <div className="answer-reveal">
          <Katex expression={formatResultatLatex(exercice)} /> attendu{" "}
          <Katex expression={`= ${formatVecteurColonneLatex(exercice.reponse)}`} />
        </div>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
