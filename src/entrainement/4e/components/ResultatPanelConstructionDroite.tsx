import type { ExerciceConstructionDroite } from "../core/constructionDroite.types";
import type { ResultatExerciceConstructionDroite } from "../moteur/typesConstructionDroite";
import { formatEnonceLatex, formatEtatActuelPointsLatex } from "../ui/formatConstructionDroite";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";
import { Katex } from "./Katex";

interface Props {
  resultat: ResultatExerciceConstructionDroite;
  exercice: ExerciceConstructionDroite;
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

/** 2 scores toujours des `number` (jamais `null`) — structure aussi simple que "Forme canonique et
 * transformations" sur ce plan, aucune étape n'est sautable ici. */
export function ResultatPanelConstructionDroite({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const point2 = { x: exercice.point.x + exercice.vecteur.x, y: exercice.point.y + exercice.vecteur.y };

  return (
    <div>
      <h2 className="result-title">Construction graphique — tracer une droite</h2>
      <p className="result-subtitle">Résultat de l'exercice</p>
      <LigneEcran label="Points de la droite" revele={resultat.pointsRevele} aideUtilisee={resultat.pointsAideUtilisee} />
      <LigneEcran label="Tracé sur le graphe" revele={resultat.traceRevele} aideUtilisee={resultat.traceAideUtilisee} />
      <TotalPointsRecap points={resultat.scorePoints + resultat.scoreTrace} maxPoints={200} />

      {afficherReponseApresEchec && resultat.scorePoints === 0 && (
        <div className="answer-reveal">
          Exemple de points valides : <Katex expression={formatEtatActuelPointsLatex(exercice.point, point2)} />
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreTrace === 0 && (
        <div className="answer-reveal">
          Équation de la droite : <Katex expression={formatEnonceLatex(exercice)} />
        </div>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
