import type { ExerciceInequationRationnelle } from "../core/inequationRationnelle.types";
import type { ResultatExerciceInequationRationnelle } from "../moteur/sessionInequationRationnelle";
import { formatSolutionEnsembleProduit } from "../ui/formatSolutionEnsembleProduit";
import {
  formatExpressionIsoleeDenominateurCarreLatex,
  formatExpressionIsoleeLatex,
  formatExpressionIsoleeNiveau3Latex,
  formatExpressionIsoleeNiveau4Latex,
} from "../ui/formatInequationRationnelle";
import { formatLineaireDeveloppe } from "../ui/formatSignesProduit";
import { formatFormeFactoriseeDepuisRacines, formatMembreGauche } from "../ui/formatEquation";
import { formatFractionSimplifiee } from "../ui/formatSimplification";
import { libelleCategorie } from "../ui/categorieLabels";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";
import { Katex } from "./Katex";

interface Props {
  resultat: ResultatExerciceInequationRationnelle;
  exercice: ExerciceInequationRationnelle;
  afficherReponseApresEchec: boolean;
  labelBouton: string;
  onContinuer: () => void;
}

function LigneEcran({ label, revele, niveauAide }: { label: string; revele: boolean; niveauAide: number | null }) {
  const statut = statutRecap(revele, niveauAide);
  return (
    <LigneRecap label={label} statut={statut}>
      {libelleStatutRecap(statut)}
    </LigneRecap>
  );
}

export function ResultatPanelInequationRationnelle({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const uneEtapeRevelee =
    resultat.isolerRevele ||
    resultat.combinerRevele ||
    resultat.ceRevele ||
    resultat.racineNumerateurRevele ||
    resultat.denomReconnaissanceRevele ||
    resultat.denomChamp1Revele ||
    resultat.denomFactorisationRevele ||
    resultat.miseEnEvidenceRevele ||
    resultat.reconnaissanceRevele ||
    resultat.champ1Revele ||
    resultat.champ2Revele ||
    resultat.factorisationRevele ||
    resultat.simplifierDenomCategorieRevelee ||
    resultat.simplifierNumCategorieRevelee ||
    resultat.grilleRevelee ||
    resultat.intervalleRevele;

  const scoresPourTotal = [
    resultat.scoreIsoler,
    resultat.scoreCombiner,
    resultat.scoreCE,
    resultat.scoreRacineNumerateur,
    resultat.scoreDenomReduction,
    resultat.scoreDenomReconnaissance,
    resultat.scoreDenomChamp1,
    resultat.scoreDenomFactorisation,
    resultat.scoreMiseEnEvidence,
    resultat.scoreReduction,
    resultat.scoreReconnaissance,
    resultat.scoreChamp1,
    resultat.scoreChamp2,
    resultat.scoreFactorisation,
    resultat.scoreSimplifierDenomReduction,
    resultat.scoreSimplifierDenomReconnaissance,
    resultat.scoreSimplifierDenomChamp1,
    resultat.scoreSimplifierDenomChamp2,
    resultat.scoreSimplifierDenomFactorisation,
    resultat.scoreSimplifierNumReduction,
    resultat.scoreSimplifierNumReconnaissance,
    resultat.scoreSimplifierNumChamp1,
    resultat.scoreSimplifierNumChamp2,
    resultat.scoreSimplifierNumFactorisation,
    resultat.scoreSimplifierFraction,
    resultat.scoreGrille,
    resultat.scoreIntervalle,
  ].filter((score): score is number => score !== null);
  const totalPoints = scoresPourTotal.reduce((somme, score) => somme + score, 0);
  const maxPoints = scoresPourTotal.length * 100;

  return (
    <div>
      <h2 className="result-title">Inéquations rationnelles</h2>
      <p className="result-subtitle">
        {uneEtapeRevelee ? "Au moins une étape a dû être révélée après trop d'échecs." : "Résultat de l'exercice"}
      </p>
      {resultat.scoreIsoler !== null && (
        <LigneEcran label="Isoler" revele={resultat.isolerRevele} niveauAide={resultat.aideIsolerUtilisee ? 1 : 0} />
      )}
      {resultat.scoreCombiner !== null && (
        <LigneEcran label="Combiner" revele={resultat.combinerRevele} niveauAide={resultat.aideCombinerUtilisee ? 1 : 0} />
      )}
      <LigneEcran label="Condition d'existence (CE)" revele={resultat.ceRevele} niveauAide={resultat.aideCeUtilisee ? 1 : 0} />
      {resultat.scoreRacineNumerateur !== null && (
        <LigneEcran label="Racine du numérateur" revele={resultat.racineNumerateurRevele} niveauAide={null} />
      )}
      {resultat.scoreDenomReduction !== null && (
        <LigneEcran
          label="Réduction (dénominateur)"
          revele={resultat.scoreDenomReduction === 0}
          niveauAide={resultat.aideDenomReductionUtilisee ? 1 : 0}
        />
      )}
      {resultat.scoreDenomReconnaissance !== null && (
        <LigneEcran label="Méthode (dénominateur)" revele={resultat.denomReconnaissanceRevele} niveauAide={null} />
      )}
      {resultat.scoreDenomChamp1 !== null && (
        <LigneEcran
          label="Factorisation (dénominateur)"
          revele={resultat.denomChamp1Revele}
          niveauAide={resultat.aideDenomChamp1Utilisee ? 1 : 0}
        />
      )}
      {resultat.scoreDenomFactorisation !== null && (
        <LigneEcran
          label="Forme factorisée (dénominateur)"
          revele={resultat.denomFactorisationRevele}
          niveauAide={resultat.aideDenomFactorisationUtilisee ? 1 : 0}
        />
      )}
      {resultat.scoreMiseEnEvidence !== null && (
        <LigneEcran
          label="Mise en évidence"
          revele={resultat.miseEnEvidenceRevele}
          niveauAide={resultat.aideMiseEnEvidenceUtilisee ? 1 : 0}
        />
      )}
      {resultat.scoreReduction !== null && (
        <LigneEcran
          label={exercice.niveau === "cubique" ? "Réduction (facteur quadratique)" : "Réduction (numérateur combiné)"}
          revele={resultat.scoreReduction === 0}
          niveauAide={resultat.aideReductionUtilisee ? 1 : 0}
        />
      )}
      {resultat.scoreReconnaissance !== null && (
        <LigneEcran
          label={exercice.niveau === "cubique" ? "Méthode (facteur quadratique)" : "Méthode (numérateur combiné)"}
          revele={resultat.reconnaissanceRevele}
          niveauAide={null}
        />
      )}
      {resultat.scoreChamp1 !== null && (
        <LigneEcran
          label={exercice.niveau === "cubique" ? "Factorisation (facteur quadratique)" : "Factorisation (numérateur combiné)"}
          revele={resultat.champ1Revele}
          niveauAide={resultat.aideChamp1Utilisee ? 1 : 0}
        />
      )}
      {resultat.scoreChamp2 !== null && (
        <LigneEcran
          label={exercice.niveau === "cubique" ? "Racines (facteur quadratique)" : "Racines (numérateur combiné)"}
          revele={resultat.champ2Revele}
          niveauAide={resultat.aideChamp2Utilisee ? 1 : 0}
        />
      )}
      {resultat.scoreFactorisation !== null && (
        <LigneEcran
          label={exercice.niveau === "cubique" ? "Forme factorisée (facteur quadratique)" : "Forme factorisée (numérateur combiné)"}
          revele={resultat.factorisationRevele}
          niveauAide={resultat.aideFactorisationUtilisee ? 1 : 0}
        />
      )}
      {resultat.scoreSimplifierDenomReduction !== null && (
        <LigneEcran
          label="Réduction (dénominateur)"
          revele={resultat.scoreSimplifierDenomReduction === 0}
          niveauAide={resultat.aideSimplifierDenomReductionUtilisee ? 1 : 0}
        />
      )}
      {resultat.scoreSimplifierDenomReconnaissance !== null && (
        <LigneEcran label="Méthode (dénominateur)" revele={resultat.simplifierDenomCategorieRevelee} niveauAide={null} />
      )}
      {resultat.scoreSimplifierDenomChamp1 !== null && (
        <LigneEcran
          label="Factorisation (dénominateur)"
          revele={resultat.scoreSimplifierDenomChamp1 === 0}
          niveauAide={resultat.aideSimplifierDenomChamp1Utilisee ? 1 : 0}
        />
      )}
      {resultat.scoreSimplifierDenomChamp2 !== null && (
        <LigneEcran
          label="Racines (dénominateur)"
          revele={resultat.scoreSimplifierDenomChamp2 === 0}
          niveauAide={resultat.aideSimplifierDenomChamp2Utilisee ? 1 : 0}
        />
      )}
      {resultat.scoreSimplifierDenomFactorisation !== null && (
        <LigneEcran
          label="Forme factorisée (dénominateur)"
          revele={resultat.scoreSimplifierDenomFactorisation === 0}
          niveauAide={resultat.aideSimplifierDenomFactorisationUtilisee ? 1 : 0}
        />
      )}
      {resultat.scoreSimplifierNumReduction !== null && (
        <LigneEcran
          label="Réduction (numérateur)"
          revele={resultat.scoreSimplifierNumReduction === 0}
          niveauAide={resultat.aideSimplifierNumReductionUtilisee ? 1 : 0}
        />
      )}
      {resultat.scoreSimplifierNumReconnaissance !== null && (
        <LigneEcran label="Méthode (numérateur)" revele={resultat.simplifierNumCategorieRevelee} niveauAide={null} />
      )}
      {resultat.scoreSimplifierNumChamp1 !== null && (
        <LigneEcran
          label="Factorisation (numérateur)"
          revele={resultat.scoreSimplifierNumChamp1 === 0}
          niveauAide={resultat.aideSimplifierNumChamp1Utilisee ? 1 : 0}
        />
      )}
      {resultat.scoreSimplifierNumChamp2 !== null && (
        <LigneEcran
          label="Racines (numérateur)"
          revele={resultat.scoreSimplifierNumChamp2 === 0}
          niveauAide={resultat.aideSimplifierNumChamp2Utilisee ? 1 : 0}
        />
      )}
      {resultat.scoreSimplifierNumFactorisation !== null && (
        <LigneEcran
          label="Forme factorisée (numérateur)"
          revele={resultat.scoreSimplifierNumFactorisation === 0}
          niveauAide={resultat.aideSimplifierNumFactorisationUtilisee ? 1 : 0}
        />
      )}
      {resultat.scoreSimplifierFraction !== null && (
        <LigneEcran
          label="Simplification"
          revele={resultat.scoreSimplifierFraction === 0}
          niveauAide={resultat.aideSimplifierFractionUtilisee ? 1 : 0}
        />
      )}
      <LigneEcran label="Tableau de signes" revele={resultat.grilleRevelee} niveauAide={null} />
      <LigneEcran label="Ensemble-solution" revele={resultat.intervalleRevele} niveauAide={resultat.aideIntervalleUtilisee ? 1 : 0} />
      <TotalPointsRecap points={totalPoints} maxPoints={maxPoints} />
      {afficherReponseApresEchec && resultat.scoreIsoler === 0 && exercice.niveau === "niveau2" && (
        <p className="answer-reveal">Forme isolée attendue : {formatExpressionIsoleeLatex(exercice)}</p>
      )}
      {afficherReponseApresEchec && resultat.scoreIsoler === 0 && exercice.niveau === "niveau3" && (
        <p className="answer-reveal">Forme isolée attendue : {formatExpressionIsoleeNiveau3Latex(exercice)}</p>
      )}
      {afficherReponseApresEchec && resultat.scoreIsoler === 0 && exercice.niveau === "niveau4" && (
        <p className="answer-reveal">Forme isolée attendue : {formatExpressionIsoleeNiveau4Latex(exercice)}</p>
      )}
      {afficherReponseApresEchec && resultat.scoreIsoler === 0 && exercice.niveau === "denominateurCarre" && (
        <p className="answer-reveal">Forme isolée attendue : {formatExpressionIsoleeDenominateurCarreLatex(exercice)}</p>
      )}
      {afficherReponseApresEchec && resultat.scoreCombiner === 0 && exercice.niveau === "niveau2" && (
        <p className="answer-reveal">
          Numérateur combiné attendu : {formatLineaireDeveloppe(exercice.numerateur.k, exercice.numerateur.p)}
        </p>
      )}
      {afficherReponseApresEchec &&
        resultat.scoreCombiner === 0 &&
        (exercice.niveau === "niveau3" ||
          exercice.niveau === "niveau4" ||
          exercice.niveau === "denominateurCarre" ||
          exercice.niveau === "sansFacteurCommun") && (
          <p className="answer-reveal">Numérateur combiné attendu : {formatMembreGauche(exercice.numerateur.enonce)}</p>
        )}
      {afficherReponseApresEchec && resultat.scoreCE === 0 && (
        <p className="answer-reveal">
          Condition{Array.isArray(exercice.ce) ? "s" : ""} d'existence attendue{Array.isArray(exercice.ce) ? "s" : ""} :{" "}
          {Array.isArray(exercice.ce) ? exercice.ce.join(" et ") : exercice.ce}
        </p>
      )}
      {afficherReponseApresEchec &&
        resultat.scoreRacineNumerateur === 0 &&
        exercice.niveau !== "niveau3" &&
        exercice.niveau !== "niveau4" &&
        exercice.niveau !== "denominateurCarre" &&
        exercice.niveau !== "facteurCommun" &&
        exercice.niveau !== "sansFacteurCommun" &&
        exercice.niveau !== "cubique" && (
          <p className="answer-reveal">Racine du numérateur attendue : {exercice.numerateur.p}</p>
        )}
      {afficherReponseApresEchec && resultat.scoreMiseEnEvidence === 0 && exercice.niveau === "cubique" && (
        <p className="answer-reveal">Mise en évidence attendue : x({formatMembreGauche(exercice.numerateur.enonce)})</p>
      )}
      {afficherReponseApresEchec &&
        resultat.scoreChamp2 === 0 &&
        (exercice.niveau === "niveau3" ||
          exercice.niveau === "niveau4" ||
          exercice.niveau === "denominateurCarre" ||
          exercice.niveau === "sansFacteurCommun") && (
          <p className="answer-reveal">
            Racines attendues (numérateur combiné) : {[...exercice.numerateur.solution.racines].sort((a, b) => a - b).join(" ; ")}
          </p>
        )}
      {afficherReponseApresEchec && resultat.scoreChamp2 === 0 && exercice.niveau === "cubique" && (
        <p className="answer-reveal">
          Racines attendues (facteur quadratique) : {[...exercice.numerateur.solution.racines].sort((a, b) => a - b).join(" ; ")}
        </p>
      )}
      {afficherReponseApresEchec &&
        resultat.scoreDenomFactorisation === 0 &&
        exercice.niveau === "sansFacteurCommun" && (
          <p className="answer-reveal">
            Forme factorisée attendue (dénominateur) :{" "}
            <Katex
              expression={`${formatFormeFactoriseeDepuisRacines(exercice.denominateur.enonce, exercice.denominateur.solution.racines)} = 0`}
            />
          </p>
        )}
      {afficherReponseApresEchec &&
        resultat.scoreFactorisation === 0 &&
        (exercice.niveau === "niveau3" ||
          exercice.niveau === "niveau4" ||
          exercice.niveau === "denominateurCarre" ||
          exercice.niveau === "sansFacteurCommun" ||
          exercice.niveau === "cubique") && (
          <p className="answer-reveal">
            Forme factorisée attendue ({exercice.niveau === "cubique" ? "facteur quadratique" : "numérateur combiné"}) :{" "}
            <Katex
              expression={`${formatFormeFactoriseeDepuisRacines(exercice.numerateur.enonce, exercice.numerateur.solution.racines)} = 0`}
            />
          </p>
        )}
      {afficherReponseApresEchec && resultat.scoreSimplifierDenomReconnaissance === 0 && exercice.niveau === "facteurCommun" && "categorie" in exercice.fraction.denominateur && (
        <p className="answer-reveal">Méthode attendue (dénominateur) : {libelleCategorie(exercice.fraction.denominateur.categorie)}</p>
      )}
      {afficherReponseApresEchec && resultat.scoreSimplifierDenomChamp1 === 0 && exercice.niveau === "facteurCommun" && "categorie" in exercice.fraction.denominateur && (
        <p className="answer-reveal">
          Réponse attendue (dénominateur) :{" "}
          {exercice.fraction.denominateur.categorie === "cas_general"
            ? `Δ = ${exercice.fraction.denominateur.solution.delta}`
            : `${exercice.fraction.denominateur.solution.formeFactorisee} = 0`}
        </p>
      )}
      {afficherReponseApresEchec && resultat.scoreSimplifierDenomChamp2 === 0 && exercice.niveau === "facteurCommun" && "categorie" in exercice.fraction.denominateur && (
        <p className="answer-reveal">
          Racines attendues (dénominateur) : {[...exercice.fraction.denominateur.solution.racines].sort((a, b) => a - b).join(" ; ")}
        </p>
      )}
      {afficherReponseApresEchec && resultat.scoreSimplifierDenomFactorisation === 0 && exercice.niveau === "facteurCommun" && "categorie" in exercice.fraction.denominateur && (
        <p className="answer-reveal">
          Forme factorisée attendue (dénominateur) :{" "}
          <Katex
            expression={`${formatFormeFactoriseeDepuisRacines(exercice.fraction.denominateur.enonce, exercice.fraction.denominateur.solution.racines)} = 0`}
          />
        </p>
      )}
      {afficherReponseApresEchec && resultat.scoreSimplifierNumReconnaissance === 0 && exercice.niveau === "facteurCommun" && "categorie" in exercice.fraction.numerateur && (
        <p className="answer-reveal">Méthode attendue (numérateur) : {libelleCategorie(exercice.fraction.numerateur.categorie)}</p>
      )}
      {afficherReponseApresEchec && resultat.scoreSimplifierNumChamp1 === 0 && exercice.niveau === "facteurCommun" && "categorie" in exercice.fraction.numerateur && (
        <p className="answer-reveal">
          Réponse attendue (numérateur) :{" "}
          {exercice.fraction.numerateur.categorie === "cas_general"
            ? `Δ = ${exercice.fraction.numerateur.solution.delta}`
            : `${exercice.fraction.numerateur.solution.formeFactorisee} = 0`}
        </p>
      )}
      {afficherReponseApresEchec && resultat.scoreSimplifierNumChamp2 === 0 && exercice.niveau === "facteurCommun" && "categorie" in exercice.fraction.numerateur && (
        <p className="answer-reveal">
          Racines attendues (numérateur) : {[...exercice.fraction.numerateur.solution.racines].sort((a, b) => a - b).join(" ; ")}
        </p>
      )}
      {afficherReponseApresEchec && resultat.scoreSimplifierNumFactorisation === 0 && exercice.niveau === "facteurCommun" && "categorie" in exercice.fraction.numerateur && (
        <p className="answer-reveal">
          Forme factorisée attendue (numérateur) :{" "}
          <Katex
            expression={`${formatFormeFactoriseeDepuisRacines(exercice.fraction.numerateur.enonce, exercice.fraction.numerateur.solution.racines)} = 0`}
          />
        </p>
      )}
      {afficherReponseApresEchec && resultat.scoreSimplifierFraction === 0 && exercice.niveau === "facteurCommun" && (
        <p className="answer-reveal">
          Fraction simplifiée attendue : <Katex expression={formatFractionSimplifiee(exercice.fraction)} />
        </p>
      )}
      {afficherReponseApresEchec && resultat.scoreGrille === 0 && (
        <p className="answer-reveal">Tableau attendu : signe du quotient = {exercice.grille.ligneQuotient.join(" ")}</p>
      )}
      {afficherReponseApresEchec && resultat.scoreIntervalle === 0 && (
        <p className="answer-reveal">Réponse attendue : S = {formatSolutionEnsembleProduit(exercice.solution)}</p>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
