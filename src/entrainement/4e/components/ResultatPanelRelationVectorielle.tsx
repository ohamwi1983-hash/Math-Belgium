import type { ExerciceRelationGeneraleRV, ExerciceRelationVectorielle } from "../core/relationVectorielle.types";
import type { ResultatExerciceRelationVectorielle } from "../moteur/typesRelationVectorielle";
import { formatTraductionAttendueLatex, libelleVarianteRelationVectorielle } from "../ui/formatRelationVectorielle";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";
import { Katex } from "./Katex";

interface Props {
  resultat: ResultatExerciceRelationVectorielle;
  exercice: ExerciceRelationVectorielle;
  afficherReponseApresEchec: boolean;
  labelBouton: string;
  onContinuer: () => void;
}

function LigneEcran({ label, revele, aideUtilisee }: { label: string; revele: boolean; aideUtilisee: boolean }) {
  const statut = statutRecap(revele, aideUtilisee ? 1 : 0);
  return (
    <LigneRecap label={label} statut={statut}>
      {libelleStatutRecap(statut)}
    </LigneRecap>
  );
}

/** Récapitulatif final uniformisé (`LigneRecap`/`statutRecap`/`TotalPointsRecap`, convention
 * CLAUDE.md "Récapitulatif final") — remplace l'ancien format `score-list`/`X/100` par écran.
 * `niveauAide`/`revele` capturés à la clôture de chaque écran côté moteur (jamais dérivés du score
 * a posteriori). Ligne "Traduction" conditionnelle sur `resultat.scoreTraduction !== null` (absente
 * pour la variante `translation`, qui n'a pas cette étape) — même principe que le reste du projet
 * pour une étape sautable. */
export function ResultatPanelRelationVectorielle({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const scores = [resultat.scoreTraduction, resultat.scoreCoordonnees].filter((score): score is number => score !== null);
  const totalPoints = scores.reduce((somme, score) => somme + score, 0);
  const maxPoints = scores.length * 100;

  return (
    <div>
      <h2 className="result-title">
        Point à partir d'une relation vectorielle — {libelleVarianteRelationVectorielle(resultat.variante)}
      </h2>
      <p className="result-subtitle">Résultat de l'exercice</p>
      {resultat.scoreTraduction !== null && (
        <LigneEcran label="Traduction en coordonnées" revele={resultat.traductionRevele} aideUtilisee={resultat.traductionAideUtilisee} />
      )}
      <LigneEcran
        label={`Coordonnées de ${exercice.pointCherche}`}
        revele={resultat.coordonneesRevele}
        aideUtilisee={resultat.coordonneesAideUtilisee}
      />
      <TotalPointsRecap points={totalPoints} maxPoints={maxPoints} />
      {afficherReponseApresEchec && resultat.scoreTraduction === 0 && (
        <div className="answer-reveal">
          Traduction attendue : <Katex expression={formatTraductionAttendueLatex(exercice as ExerciceRelationGeneraleRV)} />
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreCoordonnees === 0 && (
        <div className="answer-reveal">
          {exercice.pointCherche} attendu : ({exercice.reponse.x} ; {exercice.reponse.y})
        </div>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
