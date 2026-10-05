import type { ExerciceSignesProduit, FacteurQuadratiqueIrreductible, FacteurSignesProduit } from "../core/signesProduit.types";
import type { ResultatExerciceSignesProduit } from "../moteur/typesSignesProduit";
import { formatSolutionEnsembleProduit } from "../ui/formatSolutionEnsembleProduit";
import { formatFormeFactoriseeDepuisRacines } from "../ui/formatEquation";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";
import { Katex } from "./Katex";

interface Props {
  resultat: ResultatExerciceSignesProduit;
  exercice: ExerciceSignesProduit;
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

function facteurFactorisable(exercice: ExerciceSignesProduit) {
  const facteur = exercice.facteurs.find((f) => f.type === "quadratique_factorisable");
  return facteur?.type === "quadratique_factorisable" ? facteur.exercice : undefined;
}

function facteursIrreductibles(exercice: ExerciceSignesProduit): FacteurQuadratiqueIrreductible[] {
  return exercice.facteurs.filter((f): f is FacteurQuadratiqueIrreductible => f.type === "quadratique_irreductible");
}

function facteursLineaires(exercice: ExerciceSignesProduit): Extract<FacteurSignesProduit, { type: "lineaire" }>[] {
  return exercice.facteurs.filter((f): f is Extract<FacteurSignesProduit, { type: "lineaire" }> => f.type === "lineaire");
}

function facteursQuadratiques(exercice: ExerciceSignesProduit): Exclude<FacteurSignesProduit, { type: "lineaire" }>[] {
  return exercice.facteurs.filter((f): f is Exclude<FacteurSignesProduit, { type: "lineaire" }> => f.type !== "lineaire");
}

export function ResultatPanelSignesProduit({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const irreductibles = facteursIrreductibles(exercice);
  const lineaires = facteursLineaires(exercice);
  const quadratiques = facteursQuadratiques(exercice);
  const factorisable = facteurFactorisable(exercice);
  const uneEtapeRevelee =
    resultat.methodeRevelees.some(Boolean) || resultat.grilleRevelee || resultat.intervalleRevele;

  const scoresPourTotal = [
    ...resultat.scoresRacineLineaire,
    resultat.scoreReductionFacteur,
    ...resultat.scoresMethode,
    resultat.scoreFactorisationChamp1,
    resultat.scoreFactorisationChamp2,
    resultat.scoreFactorisationFactorisation,
    ...resultat.scoresSigneIrreductible,
    resultat.scoreGrille,
    resultat.scoreIntervalle,
  ].filter((score): score is number => score !== null);
  const totalPoints = scoresPourTotal.reduce((somme, score) => somme + score, 0);
  const maxPoints = scoresPourTotal.length * 100;

  return (
    <div>
      <h2 className="result-title">Tableau de signes à plusieurs facteurs</h2>
      <p className="result-subtitle">
        {uneEtapeRevelee ? "Au moins une étape a dû être révélée après trop d'échecs." : "Résultat de l'exercice"}
      </p>
      {resultat.scoresRacineLineaire.map((score, index) => (
        <LigneEcran
          key={`racine-lineaire-${index}`}
          label={`Racine (facteur linéaire${lineaires.length > 1 ? ` ${index + 1}` : ""})`}
          revele={score === 0}
          niveauAide={null}
        />
      ))}
      {resultat.scoreReductionFacteur !== null && (
        <LigneEcran
          label="Réduction (facteur à factoriser)"
          revele={resultat.scoreReductionFacteur === 0}
          niveauAide={resultat.aideReductionFacteurUtilisee ? 1 : 0}
        />
      )}
      {resultat.scoresMethode.map((_score, index) => (
        <LigneEcran
          key={`methode-${index}`}
          label={`Méthode${quadratiques.length > 1 ? ` (facteur ${index + 1})` : ""}`}
          revele={resultat.methodeRevelees[index] ?? false}
          niveauAide={null}
        />
      ))}
      {resultat.scoreFactorisationChamp1 !== null && (
        <LigneEcran
          label="Factorisation"
          revele={resultat.scoreFactorisationChamp1 === 0}
          niveauAide={resultat.aideFactorisationChamp1Utilisee ? 1 : 0}
        />
      )}
      {resultat.scoreFactorisationChamp2 !== null && (
        <LigneEcran
          label="Racines (facteur à factoriser)"
          revele={resultat.scoreFactorisationChamp2 === 0}
          niveauAide={resultat.aideFactorisationChamp2Utilisee ? 1 : 0}
        />
      )}
      {resultat.scoreFactorisationFactorisation !== null && (
        <LigneEcran
          label="Forme factorisée (facteur à factoriser)"
          revele={resultat.scoreFactorisationFactorisation === 0}
          niveauAide={resultat.aideFactorisationFactorisationUtilisee ? 1 : 0}
        />
      )}
      {resultat.scoresSigneIrreductible.map((score, index) => (
        <LigneEcran
          key={index}
          label={`Signe (facteur irréductible${resultat.scoresSigneIrreductible.length > 1 ? ` ${index + 1}` : ""})`}
          revele={score === 0}
          niveauAide={null}
        />
      ))}
      <LigneEcran label="Tableau de signes" revele={resultat.scoreGrille === 0} niveauAide={resultat.aideGrilleTableauUtilisee ? 1 : 0} />
      <LigneEcran label="Ensemble-solution" revele={resultat.scoreIntervalle === 0} niveauAide={resultat.aideIntervalleUtilisee ? 1 : 0} />
      <TotalPointsRecap points={totalPoints} maxPoints={maxPoints} />
      {afficherReponseApresEchec &&
        resultat.scoresRacineLineaire.map(
          (score, index) =>
            score === 0 && (
              <p className="answer-reveal" key={`racine-lineaire-${index}`}>
                Racine attendue (facteur linéaire{lineaires.length > 1 ? ` ${index + 1}` : ""}) : {lineaires[index]?.polynome.p}
              </p>
            ),
        )}
      {afficherReponseApresEchec && resultat.scoreFactorisationChamp2 === 0 && factorisable && (
        <p className="answer-reveal">
          Racines attendues (facteur à factoriser) : {[...factorisable.solution.racines].sort((a, b) => a - b).join(" ; ")}
        </p>
      )}
      {afficherReponseApresEchec &&
        resultat.scoresSigneIrreductible.map(
          (score, index) =>
            score === 0 && (
              <p className="answer-reveal" key={index}>
                Signe attendu (facteur irréductible{resultat.scoresSigneIrreductible.length > 1 ? ` ${index + 1}` : ""}) :{" "}
                {irreductibles[index]?.signe === "+" ? "toujours positif" : "toujours négatif"}
              </p>
            ),
        )}
      {afficherReponseApresEchec && resultat.scoreFactorisationFactorisation === 0 && factorisable && (
        <p className="answer-reveal">
          Forme factorisée attendue (facteur à factoriser) :{" "}
          <Katex expression={`${formatFormeFactoriseeDepuisRacines(factorisable.enonce, factorisable.solution.racines)} = 0`} />
        </p>
      )}
      {afficherReponseApresEchec && resultat.scoreGrille === 0 && (
        <p className="answer-reveal">Tableau attendu : signe du produit = {exercice.grille.produit.join(" ")}</p>
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
