import type { ExerciceCaracteristiquesDroite } from "../core/caracteristiquesDroite.types";
import type { ResultatExerciceCaracteristiquesDroite } from "../moteur/typesCaracteristiquesDroite";
import { LIBELLE_CARACTERISTIQUE, formatCaracteristiquesAttenduesLatex, formatEtatActuelPointVecteurLatex } from "../ui/formatCaracteristiquesDroite";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";
import { Katex } from "./Katex";

interface Props {
  resultat: ResultatExerciceCaracteristiquesDroite;
  exercice: ExerciceCaracteristiquesDroite;
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
 * CLAUDE.md "Récapitulatif final") — remplace l'ancien format `score-list`/`X/100` par écran
 * (audit checklist chapitre 6, point 10). Les 2 scores sont toujours des `number` (jamais `null`),
 * les 2 écrans étant TOUJOURS traversés, y compris pour une instance verticale (même principe que
 * "Relations entre droites").
 */
export function ResultatPanelCaracteristiquesDroite({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const totalPoints = resultat.scoreExtraction + resultat.scoreCaracteristiques;
  const maxPoints = 200;

  return (
    <div>
      <h2 className="result-title">Caractéristiques d'une droite</h2>
      <p className="result-subtitle">
        {resultat.verticale ? "Droite verticale" : `Caractéristique demandée : ${LIBELLE_CARACTERISTIQUE[resultat.caracteristiqueDemandee]}`} — résultat de l'exercice
      </p>
      <LigneEcran label="Extraction du point et du vecteur directeur" revele={resultat.extractionRevele} niveauAide={resultat.niveauAideExtraction} />
      <LigneEcran
        label={`${LIBELLE_CARACTERISTIQUE[resultat.caracteristiqueDemandee]} et ordonnée à l'origine`}
        revele={resultat.caracteristiquesRevele}
        niveauAide={resultat.niveauAideCaracteristiques}
      />
      <TotalPointsRecap points={totalPoints} maxPoints={maxPoints} />

      {afficherReponseApresEchec && resultat.scoreExtraction === 0 && (
        <div className="answer-reveal">
          Point + vecteur attendus : <Katex expression={formatEtatActuelPointVecteurLatex(exercice)} />
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreCaracteristiques === 0 && (
        <div className="answer-reveal">
          Réponse attendue : <Katex expression={formatCaracteristiquesAttenduesLatex(exercice)} />
        </div>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
