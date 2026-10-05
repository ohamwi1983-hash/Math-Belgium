import type { ExerciceTriangleQuelconque } from "../core/triangleQuelconque.types";
import type { ResultatExerciceTriangleQuelconque } from "../moteur/typesTriangleQuelconque";
import { valeurAire } from "../moteur/verificationTriangleQuelconque";
import { libelleConfiguration, libelleDonneeManquante, valeurAffichageDonneeManquante } from "../ui/formatTriangleQuelconque";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceTriangleQuelconque;
  exercice: ExerciceTriangleQuelconque;
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

/** Récapitulatif final uniformisé (`promptuniformisationrecap4e.md`, point 10 de l'audit chapitre 3) —
 * même patron que `ResultatPanelIntersectionDroites.tsx` (2 écrans, chacun son propre
 * `niveauAideXxx` progressif) : liste `LigneRecap` à plat + `TotalPointsRecap` en complément, jamais
 * un score fractionnaire par écran. */
export function ResultatPanelTriangleQuelconque({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const totalPoints = resultat.scoreDonneeManquante + resultat.scoreAire;
  const maxPoints = 200;

  return (
    <div>
      <h2 className="result-title">Triangle quelconque — {libelleConfiguration(exercice.configuration)}</h2>
      <p className="result-subtitle">Résultat de l'exercice</p>
      <LigneEcran
        label={`Donnée manquante (${libelleDonneeManquante(exercice)})`}
        revele={resultat.donneeManquanteRevele}
        niveauAide={resultat.niveauAideDonneeManquante}
      />
      <LigneEcran label="Aire" revele={resultat.aireRevele} niveauAide={resultat.niveauAideAire} />
      <TotalPointsRecap points={totalPoints} maxPoints={maxPoints} />
      {afficherReponseApresEchec && resultat.scoreDonneeManquante === 0 && (
        <div className="answer-reveal">
          {libelleDonneeManquante(exercice)} attendu(e) : {valeurAffichageDonneeManquante(exercice)}
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreAire === 0 && (
        <div className="answer-reveal">
          Aire attendue : {Math.round(valeurAire(exercice) * 100) / 100} {exercice.unite}²
        </div>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
