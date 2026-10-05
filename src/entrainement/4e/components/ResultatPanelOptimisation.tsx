import type { ExerciceOptimisation } from "../core/optimisation.types";
import type { ResultatExerciceOptimisation } from "../moteur/typesOptimisation";
import {
  formatDomaineLatex,
  formatFonctionDeveloppeeLatex,
  formatOptimalAttenduLatex,
  formatSommetAttenduLatex,
  formatSystemeAccoladeLatex,
  libellePositionOptimum,
} from "../ui/formatOptimisation";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";
import { Katex } from "./Katex";

interface Props {
  resultat: ResultatExerciceOptimisation;
  exercice: ExerciceOptimisation;
  afficherReponseApresEchec: boolean;
  labelBouton: string;
  onContinuer: () => void;
}

/** Récapitulatif final uniformisé (`promptuniformisationrecap4e.md`, restructuré par
 * `prompt-restructuration-architecture-modelisation.md`) — 7 lignes potentielles, 3
 * (`identification`/`contrainteEtGrandeur`/`systeme`/`domaine` — 4 en réalité, `identification` peut
 * être sautée indépendamment des 3 autres) absentes pour la variante `fonctionDonnee` (écrans absents
 * de sa séquence, voir `typesOptimisation.ts`). Points déjà calculés par le moteur (pénalité `-20
 * pts/niveau d'aide`, exactement le barème du prompt) réutilisés tels quels. */
export function ResultatPanelOptimisation({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const optionCorrecte = exercice.optionsInterpretation.find((option) => option.correcte);
  const statutSommet = statutRecap(resultat.sommetRevele, resultat.niveauAideSommet);
  const statutDecision = statutRecap(resultat.decisionRevele, resultat.niveauAideDecision);
  const statutInterpretation = statutRecap(resultat.interpretationRevele, resultat.niveauAideInterpretation);
  const scores = [
    resultat.scoreIdentification,
    resultat.scoreContrainteEtGrandeur,
    resultat.scoreSysteme,
    resultat.scoreDomaine,
    resultat.scoreSommet,
    resultat.scoreDecision,
    resultat.scoreInterpretation,
  ].filter((score): score is number => score !== null);
  const totalPoints = scores.reduce((somme, score) => somme + score, 0);
  const maxPoints = scores.length * 100;

  return (
    <div>
      <h2 className="result-title">Problèmes d'optimisation</h2>
      <p className="result-subtitle">Résultat de l'exercice</p>
      {resultat.scoreIdentification !== null && (
        <LigneRecap label="Identifier x et y" statut={statutRecap(resultat.identificationRevele, resultat.niveauAideIdentification)}>
          {libelleStatutRecap(statutRecap(resultat.identificationRevele, resultat.niveauAideIdentification))}
        </LigneRecap>
      )}
      {resultat.scoreContrainteEtGrandeur !== null && (
        <LigneRecap
          label="Poser la contrainte et exprimer la grandeur"
          statut={statutRecap(resultat.contrainteEtGrandeurRevele, resultat.niveauAideContrainteEtGrandeur)}
        >
          {libelleStatutRecap(statutRecap(resultat.contrainteEtGrandeurRevele, resultat.niveauAideContrainteEtGrandeur))}
        </LigneRecap>
      )}
      {resultat.scoreSysteme !== null && (
        <LigneRecap label="Résoudre le système" statut={statutRecap(resultat.systemeRevele, resultat.niveauAideSysteme)}>
          {libelleStatutRecap(statutRecap(resultat.systemeRevele, resultat.niveauAideSysteme))}
        </LigneRecap>
      )}
      {resultat.scoreDomaine !== null && (
        <LigneRecap label="Domaine de validité" statut={statutRecap(resultat.domaineRevele, resultat.niveauAideDomaine)}>
          {libelleStatutRecap(statutRecap(resultat.domaineRevele, resultat.niveauAideDomaine))}
        </LigneRecap>
      )}
      <LigneRecap label="Sommet" statut={statutSommet}>
        {libelleStatutRecap(statutSommet)}
      </LigneRecap>
      <LigneRecap label="Décision (sommet ou borne)" statut={statutDecision}>
        {libelleStatutRecap(statutDecision)}
      </LigneRecap>
      <LigneRecap label="Interprétation" statut={statutInterpretation}>
        {libelleStatutRecap(statutInterpretation)}
      </LigneRecap>
      <TotalPointsRecap points={totalPoints} maxPoints={maxPoints} />

      {afficherReponseApresEchec && exercice.variante === "modelisation" && resultat.scoreContrainteEtGrandeur === 0 && (
        <div className="answer-reveal">
          Relation attendue : <Katex expression={formatSystemeAccoladeLatex(exercice)} />
        </div>
      )}
      {afficherReponseApresEchec && exercice.variante === "modelisation" && resultat.scoreSysteme === 0 && (
        <div className="answer-reveal">
          Réponse attendue : <Katex expression={formatFonctionDeveloppeeLatex(exercice.fonction, exercice.contexte.labelVariable)} />
        </div>
      )}
      {afficherReponseApresEchec && exercice.variante === "modelisation" && resultat.scoreDomaine === 0 && (
        <div className="answer-reveal">
          Domaine attendu : <Katex expression={formatDomaineLatex(exercice.domaine, exercice.contexte.labelVariable)} />
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreSommet === 0 && (
        <div className="answer-reveal">
          Sommet attendu : <Katex expression={formatSommetAttenduLatex(exercice)} />
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreDecision === 0 && (
        <div className="answer-reveal">
          Optimum attendu ({libellePositionOptimum(exercice)}) : <Katex expression={formatOptimalAttenduLatex(exercice)} />
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreInterpretation === 0 && optionCorrecte && (
        <div className="answer-reveal">Interprétation attendue : {optionCorrecte.texte}</div>
      )}

      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
