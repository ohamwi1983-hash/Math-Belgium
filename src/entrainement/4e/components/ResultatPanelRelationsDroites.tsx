import type { ExerciceRelationsDroites } from "../core/relationsDroites.types";
import type { ResultatExerciceRelationsDroites } from "../moteur/typesRelationsDroites";
import {
  LIBELLE_CRITERE,
  formatAideConstructionNiveau2Latex,
  formatAideEquationNiveau2Latex,
  formatEtatActuelVecteurChercheLatex,
  formatEtatActuelVecteurReferenceLatex,
} from "../ui/formatRelationsDroites";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";
import { Katex } from "./Katex";

interface Props {
  resultat: ResultatExerciceRelationsDroites;
  exercice: ExerciceRelationsDroites;
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

/** Panneau de bilan — les 3 scores sont toujours des `number` (jamais `null`), ce générateur n'ayant
 * structurellement aucune étape sautable (contrairement à "Équation d'une droite"). */
export function ResultatPanelRelationsDroites({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  return (
    <div>
      <h2 className="result-title">Relations entre droites</h2>
      <p className="result-subtitle">
        Droite {LIBELLE_CRITERE[resultat.critere]} — résultat de l'exercice
      </p>
      <LigneEcran label="Extraction du vecteur directeur" revele={resultat.extractionRevele} aideUtilisee={resultat.extractionAideUtilisee} />
      <LigneEcran label="Construction du vecteur cherché" revele={resultat.constructionRevele} aideUtilisee={resultat.constructionAideUtilisee} />
      <LigneEcran label="Équation de la droite cherchée" revele={resultat.equationRevele} aideUtilisee={resultat.equationAideUtilisee} />
      <TotalPointsRecap points={resultat.scoreExtraction + resultat.scoreConstruction + resultat.scoreEquation} maxPoints={300} />

      {afficherReponseApresEchec && resultat.scoreExtraction === 0 && (
        <div className="answer-reveal">
          Vecteur directeur attendu : <Katex expression={formatEtatActuelVecteurReferenceLatex(exercice)} />
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreConstruction === 0 && (
        <div className="answer-reveal">
          Méthode : <Katex expression={formatAideConstructionNiveau2Latex(exercice)} />
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreEquation === 0 && (
        <div className="answer-reveal">
          Point + vecteur attendus : <Katex expression={formatEtatActuelVecteurChercheLatex(exercice)} />
          <br />
          Équation attendue : <Katex expression={formatAideEquationNiveau2Latex(exercice)} />
        </div>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
