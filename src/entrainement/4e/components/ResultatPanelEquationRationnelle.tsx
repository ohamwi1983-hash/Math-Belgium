import type { Exercice } from "../core/generateur.types";
import type { ExerciceEquationRationnelle } from "../core/equationRationnelle.types";
import type { PolynomeLineaire } from "../core/simplification.types";
import type { ResultatExerciceEquationRationnelle } from "../moteur/typesEquationRationnelle";
import { formatEquationRationnelleLatex, formatFractionReduiteOuConstante } from "../ui/formatEquationRationnelle";
import { formatFractionSimplifiee } from "../ui/formatSimplification";
import { libelleCategorie } from "../ui/categorieLabels";
import { racinesDistinctes } from "../moteur/verificationEquationRationnelle";
import { estSolutionUnique, formatEnonceLatex, formatFormeFactoriseeDepuisRacines, formatTermesZerosAttendusLatex } from "../ui/formatEquation";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";
import { Katex } from "./Katex";

interface Props {
  resultat: ResultatExerciceEquationRationnelle;
  exercice: ExerciceEquationRationnelle;
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

function estPolynomeLineaire(poly: Exercice | PolynomeLineaire): poly is PolynomeLineaire {
  return "k" in poly;
}

/** Le P2 embarqué dans fractionGauche — même principe que sessionEquationRationnelle.ts::p2DeFractionGauche. */
function p2DeFractionGauche(exercice: ExerciceEquationRationnelle): Exercice | null {
  const fractionGauche = exercice.fractionGauche;
  if (!fractionGauche) return null;
  return estPolynomeLineaire(fractionGauche.numerateur) ? (fractionGauche.denominateur as Exercice) : (fractionGauche.numerateur as Exercice);
}

export function ResultatPanelEquationRationnelle({
  resultat,
  exercice,
  afficherReponseApresEchec,
  labelBouton,
  onContinuer,
}: Props) {
  const p2 = p2DeFractionGauche(exercice);

  const scoresPourTotal = [
    resultat.scoreCE,
    resultat.scoreSimplifier,
    resultat.scoreSimplifierReduction,
    resultat.scoreSimplifierReconnaissance,
    resultat.scoreSimplifierChamp1,
    resultat.scoreSimplifierChamp2,
    resultat.scoreSimplifierFactorisation,
    resultat.scoreSimplifierFraction,
    resultat.scoreIsolement,
    resultat.scoreReconnaissance,
    resultat.scoreChampPrincipal,
    resultat.scoreRacines,
    resultat.scoreRacinesEtrangeres,
  ].filter((score): score is number => score !== null);
  const totalPoints = scoresPourTotal.reduce((somme, score) => somme + score, 0);
  const maxPoints = scoresPourTotal.length * 100;

  return (
    <div>
      <h2 className="result-title">L'inconnue au dénominateur</h2>
      <div className="equation-box">
        <Katex expression={formatEquationRationnelleLatex(exercice)} block />
      </div>
      <p className="result-subtitle">
        {resultat.categorieRevelee ? "La méthode a dû être révélée après trop d'échecs." : "Résultat de l'exercice"}
      </p>
      <LigneEcran label="Condition d'existence (CE)" revele={resultat.scoreCE === 0} niveauAide={resultat.aideCeUtilisee ? 1 : 0} />
      {resultat.scoreSimplifier !== null && (
        <LigneEcran label="Simplifier" revele={resultat.scoreSimplifier === 0} niveauAide={null} />
      )}
      {resultat.scoreSimplifierReduction !== null && (
        <LigneEcran
          label="Réduction (fraction)"
          revele={resultat.scoreSimplifierReduction === 0}
          niveauAide={resultat.aideSimplifierReductionUtilisee ? 1 : 0}
        />
      )}
      {resultat.scoreSimplifierReconnaissance !== null && (
        <LigneEcran label="Méthode (fraction)" revele={resultat.simplifierCategorieRevelee} niveauAide={null} />
      )}
      {resultat.scoreSimplifierChamp1 !== null && (
        <LigneEcran
          label="Factorisation (fraction)"
          revele={resultat.scoreSimplifierChamp1 === 0}
          niveauAide={resultat.aideSimplifierChamp1Utilisee ? 1 : 0}
        />
      )}
      {resultat.scoreSimplifierChamp2 !== null && (
        <LigneEcran
          label="Racines (fraction)"
          revele={resultat.scoreSimplifierChamp2 === 0}
          niveauAide={resultat.aideSimplifierChamp2Utilisee ? 1 : 0}
        />
      )}
      {resultat.scoreSimplifierFactorisation !== null && (
        <LigneEcran
          label="Forme factorisée (fraction)"
          revele={resultat.scoreSimplifierFactorisation === 0}
          niveauAide={resultat.aideSimplifierFactorisationUtilisee ? 1 : 0}
        />
      )}
      {resultat.scoreSimplifierFraction !== null && (
        <LigneEcran
          label="Simplification"
          revele={resultat.scoreSimplifierFraction === 0}
          niveauAide={resultat.aideSimplifierFractionUtilisee ? 1 : 0}
        />
      )}
      <LigneEcran label="Isolement" revele={resultat.scoreIsolement === 0} niveauAide={resultat.aideIsolementUtilisee ? 1 : 0} />
      {resultat.scoreReconnaissance !== null && (
        <LigneEcran label="Méthode" revele={resultat.categorieRevelee} niveauAide={null} />
      )}
      {resultat.scoreChampPrincipal !== null && (
        <LigneEcran
          label="Factorisation"
          revele={resultat.scoreChampPrincipal === 0}
          niveauAide={resultat.aideChamp1Utilisee ? 1 : 0}
        />
      )}
      <LigneEcran label="Solutions" revele={resultat.scoreRacines === 0} niveauAide={resultat.aideChamp2Utilisee ? 1 : 0} />
      <LigneEcran label="Solutions étrangères" revele={resultat.scoreRacinesEtrangeres === 0} niveauAide={null} />
      <TotalPointsRecap points={totalPoints} maxPoints={maxPoints} />
      {afficherReponseApresEchec && resultat.scoreCE === 0 && (
        <p className="answer-reveal">
          {exercice.ce.length === 1 ? "Condition d'existence attendue" : "Conditions d'existence attendues"} :{" "}
          {exercice.ce.map((v) => `x ≠ ${v}`).join(" et ")}
        </p>
      )}
      {afficherReponseApresEchec && resultat.scoreSimplifier === 0 && (
        <p className="answer-reveal">
          {exercice.fractionsSimplifiables.length === 1 ? "Fraction simplifiée attendue" : "Fractions simplifiées attendues"} :{" "}
          {exercice.fractionsSimplifiables
            .map(formatFractionReduiteOuConstante)
            .map((expr, index) => <Katex key={index} expression={expr} />)}
        </p>
      )}
      {afficherReponseApresEchec && resultat.scoreSimplifierReconnaissance === 0 && p2 && (
        <p className="answer-reveal">Méthode attendue (fraction) : {libelleCategorie(p2.categorie)}</p>
      )}
      {afficherReponseApresEchec && resultat.scoreSimplifierChamp1 === 0 && p2 && (
        <p className="answer-reveal">
          Réponse attendue (fraction) :{" "}
          {p2.categorie === "cas_general" ? `Δ = ${p2.solution.delta}` : `${p2.solution.formeFactorisee} = 0`}
        </p>
      )}
      {afficherReponseApresEchec && resultat.scoreSimplifierChamp2 === 0 && p2 && (
        <p className="answer-reveal">
          {estSolutionUnique(p2) ? "Racine attendue (fraction)" : "Racines attendues (fraction)"} :{" "}
          <span className="equation-box-termes">
            {formatTermesZerosAttendusLatex(p2).map((terme, i) => (
              <Katex key={i} expression={terme} />
            ))}
          </span>
        </p>
      )}
      {afficherReponseApresEchec && resultat.scoreSimplifierFactorisation === 0 && p2 && (
        <p className="answer-reveal">
          Forme factorisée attendue (fraction) :{" "}
          <Katex expression={`${formatFormeFactoriseeDepuisRacines(p2.enonce, p2.solution.racines)} = 0`} />
        </p>
      )}
      {afficherReponseApresEchec && resultat.scoreSimplifierFraction === 0 && exercice.fractionGauche && (
        <p className="answer-reveal">
          Fraction simplifiée attendue : <Katex expression={formatFractionSimplifiee(exercice.fractionGauche)} />
        </p>
      )}
      {afficherReponseApresEchec && resultat.scoreIsolement === 0 && (
        <p className="answer-reveal">
          Équation isolée attendue : <Katex expression={formatEnonceLatex(exercice.equationIsolee.enonce)} />
        </p>
      )}
      {afficherReponseApresEchec && resultat.scoreChampPrincipal === 0 && (
        <p className="answer-reveal">
          Réponse attendue :{" "}
          {exercice.equationIsolee.categorie === "cas_general"
            ? `Δ = ${exercice.equationIsolee.solution.delta}`
            : `${exercice.equationIsolee.solution.formeFactorisee} = 0`}
        </p>
      )}
      {afficherReponseApresEchec && resultat.scoreRacines === 0 && (
        <p className="answer-reveal">
          {estSolutionUnique(exercice.equationIsolee) ? "Solution attendue" : "Solutions attendues"} :{" "}
          <span className="equation-box-termes">
            {formatTermesZerosAttendusLatex(exercice.equationIsolee).map((terme, i) => (
              <Katex key={i} expression={terme} />
            ))}
          </span>
        </p>
      )}
      {afficherReponseApresEchec && resultat.scoreRacinesEtrangeres === 0 && (
        <p className="answer-reveal">
          {racinesDistinctes(exercice.equationIsolee.solution.racines)
            .map((r) => `x = ${r} : ${exercice.ce.includes(r) ? "à rejeter" : "valide"}`)
            .join(" ; ")}
        </p>
      )}
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
