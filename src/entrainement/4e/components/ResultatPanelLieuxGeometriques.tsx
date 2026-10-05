import type { ExerciceLieuxGeometriques } from "../core/lieuxGeometriques.types";
import type { ResultatExerciceLieuxGeometriques } from "../moteur/typesLieuxGeometriques";
import { formatEquationLieuLatex, segmentsDescriptionLieu, texteNombrePointsAttendu, texteReponseResolutionAttendue } from "../ui/formatLieuxGeometriques";
import { Katex } from "./Katex";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";
import { RenduFragments } from "./RenduFragments";

interface Props {
  resultat: ResultatExerciceLieuxGeometriques;
  exercice: ExerciceLieuxGeometriques;
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

/** Panneau de bilan — les 3 scores sont toujours des `number` (jamais `null`), les 3 écrans étant
 * désormais TOUJOURS traversés (aucun saut conditionnel, contrairement à l'architecture
 * précédente). Récapitulatif uniformisé (`LigneRecap`/`statutRecap`/`TotalPointsRecap`, jamais
 * l'ancien format `score-list`/`X/100` par écran) — `revele`/`niveauAide` capturés au moment de la
 * clôture de chaque écran côté moteur, jamais dérivés du score seul. */
export function ResultatPanelLieuxGeometriques({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const totalPoints = resultat.scoreIdentification + resultat.scoreEquations + resultat.scoreResolution;

  return (
    <div>
      <h2 className="result-title">Lieux géométriques : intersection</h2>
      <p className="result-subtitle">Résultat de l'exercice</p>
      <LigneEcran label="Identification" revele={resultat.identificationRevele} niveauAide={resultat.niveauAideIdentification} />
      <LigneEcran label="Équations" revele={resultat.equationsRevele} niveauAide={resultat.niveauAideEquations} />
      <LigneEcran label="Résolution" revele={resultat.resolutionRevele} niveauAide={resultat.niveauAideResolution} />
      <TotalPointsRecap points={totalPoints} maxPoints={300} />

      {afficherReponseApresEchec && resultat.scoreIdentification === 0 && (
        <div className="answer-reveal">
          Premier lieu : <RenduFragments fragments={segmentsDescriptionLieu(exercice.lieu1)} />. Second lieu : <RenduFragments fragments={segmentsDescriptionLieu(exercice.lieu2)} />.
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreEquations === 0 && (
        <div className="answer-reveal">
          Équations attendues : <Katex expression={formatEquationLieuLatex(exercice.lieu1)} /> et <Katex expression={formatEquationLieuLatex(exercice.lieu2)} />
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreResolution === 0 && (
        <div className="answer-reveal">
          {texteNombrePointsAttendu(resultat.nombrePoints)}{" "}
          {resultat.nombrePoints > 0 && (
            <>
              Réponse attendue : <Katex expression={texteReponseResolutionAttendue(exercice)} />
            </>
          )}
        </div>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
