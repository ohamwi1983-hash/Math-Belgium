import type { ExerciceMoyennePonderee } from "../core/moyennePonderee.types";
import type { ResultatExerciceMoyennePonderee } from "../moteur/typesMoyennePonderee";
import { formatCentresAttendusTexte, formatSommesAttenduesTexte } from "../ui/formatMoyennePonderee";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";
import { SegmentsInline } from "./SegmentsInline";

interface Props {
  resultat: ResultatExerciceMoyennePonderee;
  exercice: ExerciceMoyennePonderee;
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
 * `niveauAideXxx`/`xxxRevele` déjà capturés au moment de la clôture de chaque écran côté moteur
 * (`typesMoyennePonderee.ts`), jamais dérivés du score seul. Ligne "Centres de classe"
 * conditionnelle sur `scoreCentres !== null` (écran sauté pour la variante "discrete") — même
 * principe que le `score-list` d'origine.
 */
export function ResultatPanelMoyennePonderee({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const scores = [resultat.scoreCentres, resultat.scoreSommes, resultat.scoreQuotient].filter(
    (score): score is number => score !== null,
  );
  const totalPoints = scores.reduce((somme, score) => somme + score, 0);
  const maxPoints = scores.length * 100;

  return (
    <div>
      <h2 className="result-title">Moyenne pondérée</h2>
      <p className="result-subtitle">Résultat de l'exercice</p>
      {resultat.scoreCentres !== null && (
        <LigneEcran label="Centres de classe" revele={resultat.centresRevele} niveauAide={resultat.niveauAideCentres} />
      )}
      <LigneEcran label="Sommes intermédiaires" revele={resultat.sommesRevele} niveauAide={resultat.niveauAideSommes} />
      <LigneEcran label="Moyenne pondérée (quotient)" revele={resultat.quotientRevele} niveauAide={resultat.niveauAideQuotient} />
      <TotalPointsRecap points={totalPoints} maxPoints={maxPoints} />
      {afficherReponseApresEchec && resultat.scoreCentres === 0 && exercice.variante === "classes" && (
        <div className="answer-reveal">Centres attendus : {formatCentresAttendusTexte(exercice)}</div>
      )}
      {afficherReponseApresEchec && resultat.scoreSommes === 0 && (
        <div className="answer-reveal">
          Sommes attendues : <SegmentsInline segments={formatSommesAttenduesTexte(exercice)} />
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreQuotient === 0 && (
        <div className="answer-reveal">Moyenne pondérée attendue : {exercice.moyenne}</div>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
