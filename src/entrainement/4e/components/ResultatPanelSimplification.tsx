import type { Exercice } from "../core/generateur.types";
import type { ExerciceSimplification } from "../core/simplification.types";
import type { ResultatExerciceSimplification } from "../moteur/typesSimplification";
import { formatFraction, formatFractionSimplifiee } from "../ui/formatSimplification";
import { estSolutionUnique, formatFormeFactoriseeDepuisRacines, formatTermesZerosAttendusLatex } from "../ui/formatEquation";
import { libelleCategorie } from "../ui/categorieLabels";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";
import { Katex } from "./Katex";

/**
 * Réponse attendue au champ principal (champ1) d'un P2 — même convention que ResultatPanel.tsx
 * (exercice 1) : "Δ = ..." pour cas_general, la forme factorisée confirmée (avec "= 0") sinon.
 */
function formatChampPrincipalAttendu(poly: Exercice): string {
  return poly.categorie === "cas_general" ? `\\Delta = ${poly.solution.delta}` : `${poly.solution.formeFactorisee} = 0`;
}

interface Props {
  resultat: ResultatExerciceSimplification;
  exercice: ExerciceSimplification;
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

/**
 * Récapitulatif final uniformisé (`promptuniformisationrecap4e.md`) — liste `LigneRecap` à plat,
 * jamais de score `X/100` par écran (voir CLAUDE.md), PLUS un résumé chiffré (`TotalPointsRecap`).
 * Bug utilisateur du 27/09 : ce générateur restait au format `score-list`/`X/100` d'origine. Chaque
 * étape pénalise l'aide par un facteur ×0,5 fixe (`aideXxxUtilisee`, un seul palier, jamais un
 * `niveauAide` à paliers multiples) — traité comme l'équivalent d'un `niveauAide` de 0 ou 1 pour
 * `statutRecap`, même principe que ResultatPanelAnalyseFonction.tsx (gen7). `revele` vient d'un
 * flag dédié quand il existe (denomCategorieRevelee/numCategorieRevelee, écrans "Méthode"), sinon
 * de `score === 0` — `soumettreEtapeTentatives` (etapeTentatives.ts) garantit cette équivalence
 * pour toute étape notée par tentatives, sans exception (voir aussi
 * ResultatPanelCaracteristiquesAlgebriques.tsx pour le même principe).
 */
export function ResultatPanelSimplification({
  resultat,
  exercice,
  afficherReponseApresEchec,
  labelBouton,
  onContinuer,
}: Props) {
  const uneEtapeRevelee = resultat.denomCategorieRevelee || resultat.numCategorieRevelee;

  const scoresPourTotal = [
    resultat.scoreDenomReduction,
    resultat.scoreDenomReductionP1,
    resultat.scoreDenomReconnaissance,
    resultat.scoreDenomChamp1,
    resultat.scoreDenomChamp2,
    resultat.scoreDenomFactorisation,
    resultat.scoreCEDirecte,
    resultat.scoreNumReduction,
    resultat.scoreNumReductionP1,
    resultat.scoreNumReconnaissance,
    resultat.scoreNumChamp1,
    resultat.scoreNumChamp2,
    resultat.scoreNumFactorisation,
    resultat.scoreSimplification,
  ].filter((score): score is number => score !== null);
  const totalPoints = scoresPourTotal.reduce((somme, score) => somme + score, 0);
  const maxPoints = scoresPourTotal.length * 100;

  return (
    <div>
      <h2 className="result-title">Simplifier une fraction rationnelle</h2>
      <div className="equation-box">
        <Katex expression={formatFraction(exercice)} block />
      </div>
      <p className="result-subtitle">
        {uneEtapeRevelee ? "Au moins une méthode a dû être révélée après trop d'échecs." : "Résultat de l'exercice"}
      </p>
      {resultat.scoreDenomReduction !== null && (
        <LigneEcran
          label="Réduction (dénominateur)"
          revele={resultat.scoreDenomReduction === 0}
          niveauAide={resultat.aideDenomReductionUtilisee ? 1 : 0}
        />
      )}
      {resultat.scoreDenomReductionP1 !== null && (
        <LigneEcran
          label="Réduction (dénominateur)"
          revele={resultat.scoreDenomReductionP1 === 0}
          niveauAide={resultat.aideDenomReductionP1Utilisee ? 1 : 0}
        />
      )}
      {resultat.scoreDenomReconnaissance !== null && (
        <LigneEcran label="Méthode (dénominateur)" revele={resultat.denomCategorieRevelee} niveauAide={null} />
      )}
      {resultat.scoreDenomChamp1 !== null && (
        <LigneEcran
          label="Dénominateur factorisé"
          revele={resultat.scoreDenomChamp1 === 0}
          niveauAide={resultat.aideDenomChamp1Utilisee ? 1 : 0}
        />
      )}
      {resultat.scoreDenomChamp2 !== null && (
        <LigneEcran
          label="Conditions d'existence (CE)"
          revele={resultat.scoreDenomChamp2 === 0}
          niveauAide={resultat.aideDenomChamp2Utilisee ? 1 : 0}
        />
      )}
      {resultat.scoreDenomFactorisation !== null && (
        <LigneEcran
          label="Factorisation (dénominateur)"
          revele={resultat.scoreDenomFactorisation === 0}
          niveauAide={resultat.aideDenomFactorisationUtilisee ? 1 : 0}
        />
      )}
      {resultat.scoreCEDirecte !== null && (
        <LigneEcran label="Condition d'existence (CE)" revele={resultat.scoreCEDirecte === 0} niveauAide={null} />
      )}
      {resultat.scoreNumReduction !== null && (
        <LigneEcran
          label="Réduction (numérateur)"
          revele={resultat.scoreNumReduction === 0}
          niveauAide={resultat.aideNumReductionUtilisee ? 1 : 0}
        />
      )}
      {resultat.scoreNumReductionP1 !== null && (
        <LigneEcran
          label="Réduction (numérateur)"
          revele={resultat.scoreNumReductionP1 === 0}
          niveauAide={resultat.aideNumReductionP1Utilisee ? 1 : 0}
        />
      )}
      {resultat.scoreNumReconnaissance !== null && (
        <LigneEcran label="Méthode (numérateur)" revele={resultat.numCategorieRevelee} niveauAide={null} />
      )}
      {resultat.scoreNumChamp1 !== null && (
        <LigneEcran
          label="Numérateur factorisé"
          revele={resultat.scoreNumChamp1 === 0}
          niveauAide={resultat.aideNumChamp1Utilisee ? 1 : 0}
        />
      )}
      {resultat.scoreNumChamp2 !== null && (
        <LigneEcran
          label="Racines (numérateur)"
          revele={resultat.scoreNumChamp2 === 0}
          niveauAide={resultat.aideNumChamp2Utilisee ? 1 : 0}
        />
      )}
      {resultat.scoreNumFactorisation !== null && (
        <LigneEcran
          label="Factorisation (numérateur)"
          revele={resultat.scoreNumFactorisation === 0}
          niveauAide={resultat.aideNumFactorisationUtilisee ? 1 : 0}
        />
      )}
      <LigneEcran
        label="Simplification"
        revele={resultat.scoreSimplification === 0}
        niveauAide={resultat.aideSimplificationUtilisee ? 1 : 0}
      />
      <TotalPointsRecap points={totalPoints} maxPoints={maxPoints} />
      {afficherReponseApresEchec && resultat.scoreDenomReconnaissance === 0 && (
        <p className="answer-reveal">
          Méthode attendue (dénominateur) : {libelleCategorie((exercice.denominateur as Exercice).categorie)}
        </p>
      )}
      {afficherReponseApresEchec && resultat.scoreDenomChamp1 === 0 && (
        <p className="answer-reveal">
          Réponse attendue (dénominateur) :{" "}
          <Katex expression={formatChampPrincipalAttendu(exercice.denominateur as Exercice)} />
        </p>
      )}
      {afficherReponseApresEchec && resultat.scoreDenomChamp2 === 0 && (
        <p className="answer-reveal">
          {estSolutionUnique(exercice.denominateur as Exercice) ? "CE attendue" : "CE attendues"} :{" "}
          <span className="equation-box-termes">
            {formatTermesZerosAttendusLatex(exercice.denominateur as Exercice).map((terme, i) => (
              <Katex key={i} expression={terme} />
            ))}
          </span>
        </p>
      )}
      {afficherReponseApresEchec && resultat.scoreDenomFactorisation === 0 && (
        <p className="answer-reveal">
          Forme factorisée attendue (dénominateur) :{" "}
          <Katex
            expression={`${formatFormeFactoriseeDepuisRacines((exercice.denominateur as Exercice).enonce, (exercice.denominateur as Exercice).solution.racines)} = 0`}
          />
        </p>
      )}
      {afficherReponseApresEchec && resultat.scoreCEDirecte === 0 && (
        <p className="answer-reveal">CE attendue : {exercice.racineCommune}</p>
      )}
      {afficherReponseApresEchec && resultat.scoreNumReconnaissance === 0 && (
        <p className="answer-reveal">
          Méthode attendue (numérateur) : {libelleCategorie((exercice.numerateur as Exercice).categorie)}
        </p>
      )}
      {afficherReponseApresEchec && resultat.scoreNumChamp1 === 0 && (
        <p className="answer-reveal">
          Réponse attendue (numérateur) :{" "}
          <Katex expression={formatChampPrincipalAttendu(exercice.numerateur as Exercice)} />
        </p>
      )}
      {afficherReponseApresEchec && resultat.scoreNumChamp2 === 0 && (
        <p className="answer-reveal">
          {estSolutionUnique(exercice.numerateur as Exercice) ? "Racine attendue (numérateur)" : "Racines attendues (numérateur)"} :{" "}
          <span className="equation-box-termes">
            {formatTermesZerosAttendusLatex(exercice.numerateur as Exercice).map((terme, i) => (
              <Katex key={i} expression={terme} />
            ))}
          </span>
        </p>
      )}
      {afficherReponseApresEchec && resultat.scoreNumFactorisation === 0 && (
        <p className="answer-reveal">
          Forme factorisée attendue (numérateur) :{" "}
          <Katex
            expression={`${formatFormeFactoriseeDepuisRacines((exercice.numerateur as Exercice).enonce, (exercice.numerateur as Exercice).solution.racines)} = 0`}
          />
        </p>
      )}
      {afficherReponseApresEchec && resultat.scoreSimplification === 0 && (
        <p className="answer-reveal">
          Réponse attendue : <Katex expression={formatFractionSimplifiee(exercice)} />
        </p>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
