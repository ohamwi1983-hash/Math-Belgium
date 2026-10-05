import type { ExerciceBoiteMoustaches } from "../core/boiteMoustaches.types";
import type { ResultatExerciceBoiteMoustaches } from "../moteur/typesBoiteMoustaches";
import {
  formatTermesCinqNombresLatex,
  segmentsComparaisonDispersionsAttendue,
  segmentsComparaisonMedianesAttendue,
} from "../ui/formatBoiteMoustaches";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";
import { Katex } from "./Katex";
import { SegmentsInline } from "./SegmentsInline";

interface Props {
  resultat: ResultatExerciceBoiteMoustaches;
  exercice: ExerciceBoiteMoustaches;
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

/**
 * Récapitulatif final uniformisé (`LigneRecap`/`statutRecap`/`TotalPointsRecap`, convention
 * CLAUDE.md "Récapitulatif final") — remplace l'ancien format `score-list`/`X/100` par écran.
 * `niveauAide`/`revele` déjà capturés côté moteur (`ResultatExerciceBoiteMoustaches`) au moment
 * précis de la clôture de chaque écran — jamais dérivés du score seul. Variantes "construction"/
 * "lecture" : un seul écran (`resultat.score`) ; variante "comparaison" : 2 écrans
 * (`scoreComparaisonMedianes`/`scoreComparaisonDispersions`) — jamais les deux formes en même temps
 * sur une même instance (`null` sur celle qui ne s'applique pas).
 */
export function ResultatPanelBoiteMoustaches({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const scores = [resultat.score, resultat.scoreComparaisonMedianes, resultat.scoreComparaisonDispersions].filter(
    (score): score is number => score !== null,
  );
  const totalPoints = scores.reduce((somme, score) => somme + score, 0);
  const maxPoints = scores.length * 100;

  return (
    <div>
      <h2 className="result-title">Boîte à moustaches</h2>
      <p className="result-subtitle">Résultat de l'exercice</p>
      {resultat.score !== null && <LigneEcran label="Score" revele={resultat.revele} niveauAide={resultat.niveauAide} />}
      {resultat.scoreComparaisonMedianes !== null && (
        <LigneEcran
          label="Comparaison des médianes"
          revele={resultat.comparaisonMedianesRevele}
          niveauAide={resultat.niveauAideComparaisonMedianes}
        />
      )}
      {resultat.scoreComparaisonDispersions !== null && (
        <LigneEcran
          label="Comparaison des dispersions"
          revele={resultat.comparaisonDispersionsRevele}
          niveauAide={resultat.niveauAideComparaisonDispersions}
        />
      )}
      <TotalPointsRecap points={totalPoints} maxPoints={maxPoints} />
      {afficherReponseApresEchec && resultat.score === 0 && exercice.variante !== "comparaison" && (
        <div className="answer-reveal">
          Réponse attendue :{" "}
          <span className="equation-box-termes">
            {formatTermesCinqNombresLatex(exercice.valeurs).map((terme, i) => (
              <Katex key={i} expression={terme} />
            ))}
          </span>
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreComparaisonMedianes === 0 && exercice.variante === "comparaison" && (
        <div className="answer-reveal">
          <SegmentsInline segments={segmentsComparaisonMedianesAttendue(exercice)} />
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreComparaisonDispersions === 0 && exercice.variante === "comparaison" && (
        <div className="answer-reveal">
          <SegmentsInline segments={segmentsComparaisonDispersionsAttendue(exercice)} />
        </div>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
