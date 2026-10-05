import type { ExerciceEquationInequationSecondDegre } from "../core/equationInequationSecondDegre.types";
import type { ResultatExerciceEquationInequationSecondDegre } from "../moteur/typesEquationInequationSecondDegre";
import { formatDomaineLatex, formatFonctionDeveloppeeLatex, formatSystemeAccoladeLatex } from "../ui/formatOptimisation";
import {
  formatEquationInequationLatex,
  formatResolutionAttendueTexte,
  formatValidationAttendueTexte,
  texteAideEliminerSystemeNiveau2,
  texteAidePoserSystemeNiveau2,
} from "../ui/formatEquationInequationSecondDegre";
import { LigneRecap, TotalPointsRecap, libelleStatutRecap, statutRecap } from "./LigneRecap";
import { Katex } from "./Katex";

interface Props {
  resultat: ResultatExerciceEquationInequationSecondDegre;
  exercice: ExerciceEquationInequationSecondDegre;
  afficherReponseApresEchec: boolean;
  labelBouton: string;
  onContinuer: () => void;
}

function LigneEcran({ label, revele, niveauAide }: { label: string; revele: boolean; niveauAide: number }) {
  const statut = statutRecap(revele, niveauAide);
  return <LigneRecap label={label} statut={statut}>{libelleStatutRecap(statut)}</LigneRecap>;
}

/** Récapitulatif final uniformisé (`promptuniformisationrecap4e.md`) — 6 lignes TOUJOURS présentes
 * (séquence commune), + 2 conditionnelles (`scorePoserSysteme`/`scoreEliminerSysteme`, non `null`
 * ssi `voieSysteme`), + 3 conditionnelles (`scoreIdentification`/`scoreContrainteEtGrandeur`/
 * `scoreSysteme`, `null` selon `voieSysteme`/`base.variante`/`base.identificationXY` — voir
 * `typesEquationInequationSecondDegre.ts`) et 1 devenue conditionnelle
 * (`scorePoserEquationInequation`, `null` ssi `voieSysteme` — écran sauté pour cette voie). Points
 * déjà calculés par le moteur (pénalité `-20 pts/niveau d'aide`, exactement le barème du prompt)
 * réutilisés tels quels. */
export function ResultatPanelEquationInequationSecondDegre({ resultat, exercice, afficherReponseApresEchec, labelBouton, onContinuer }: Props) {
  const optionCorrecte = exercice.optionsInterpretation.find((option) => option.correcte);
  const scores = [
    resultat.scorePoserSysteme,
    resultat.scoreEliminerSysteme,
    resultat.scoreIdentification,
    resultat.scoreContrainteEtGrandeur,
    resultat.scoreSysteme,
    resultat.scoreDomaine,
    resultat.scorePoserEquationInequation,
    resultat.scoreResoudre,
    resultat.scoreValidation,
    resultat.scoreInterpretation,
  ].filter((score): score is number => score !== null);
  const totalPoints = scores.reduce((somme, score) => somme + score, 0);
  const maxPoints = scores.length * 100;

  return (
    <div>
      <h2 className="result-title">Équations/inéquations du second degré en contexte</h2>
      <p className="result-subtitle">Résultat de l'exercice</p>
      {resultat.scorePoserSysteme !== null && <LigneEcran label="Poser le système" revele={resultat.poserSystemeRevele} niveauAide={resultat.niveauAidePoserSysteme} />}
      {resultat.scoreEliminerSysteme !== null && (
        <LigneEcran label="Éliminer le terme xy" revele={resultat.eliminerSystemeRevele} niveauAide={resultat.niveauAideEliminerSysteme} />
      )}
      {resultat.scoreIdentification !== null && (
        <LigneEcran label="Identifier x et y" revele={resultat.identificationRevele} niveauAide={resultat.niveauAideIdentification} />
      )}
      {resultat.scoreContrainteEtGrandeur !== null && (
        <LigneEcran
          label="Poser la contrainte et exprimer la grandeur"
          revele={resultat.contrainteEtGrandeurRevele}
          niveauAide={resultat.niveauAideContrainteEtGrandeur}
        />
      )}
      {resultat.scoreSysteme !== null && <LigneEcran label="Résoudre le système" revele={resultat.systemeRevele} niveauAide={resultat.niveauAideSysteme} />}
      {resultat.scoreDomaine !== null && <LigneEcran label="Domaine de validité" revele={resultat.domaineRevele} niveauAide={resultat.niveauAideDomaine} />}
      {resultat.scorePoserEquationInequation !== null && (
        <LigneEcran
          label={exercice.variante === "equation" ? "Poser l'équation" : "Poser l'inéquation"}
          revele={resultat.poserEquationInequationRevele}
          niveauAide={resultat.niveauAidePoserEquationInequation}
        />
      )}
      <LigneEcran label="Résolution" revele={resultat.resoudreRevele} niveauAide={resultat.niveauAideResoudre} />
      <LigneEcran label="Validation contextuelle" revele={resultat.validationRevele} niveauAide={resultat.niveauAideValidation} />
      <LigneEcran label="Interprétation" revele={resultat.interpretationRevele} niveauAide={resultat.niveauAideInterpretation} />
      <TotalPointsRecap points={totalPoints} maxPoints={maxPoints} />

      {afficherReponseApresEchec && resultat.scorePoserSysteme === 0 && (
        <div className="answer-reveal">
          Système attendu : <Katex expression={texteAidePoserSystemeNiveau2(exercice)} />
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreEliminerSysteme === 0 && (
        <div className="answer-reveal">
          Relation attendue : <Katex expression={texteAideEliminerSystemeNiveau2(exercice)} />
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreContrainteEtGrandeur === 0 && exercice.base.variante === "modelisation" && (
        <div className="answer-reveal">
          Relation attendue : <Katex expression={formatSystemeAccoladeLatex(exercice.base)} />
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreSysteme === 0 && exercice.base.variante === "modelisation" && (
        <div className="answer-reveal">
          Réponse attendue : <Katex expression={formatFonctionDeveloppeeLatex(exercice.base.fonction, exercice.base.contexte.labelVariable)} />
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreDomaine === 0 && (
        <div className="answer-reveal">
          Domaine attendu : <Katex expression={formatDomaineLatex(exercice.base.domaine, exercice.base.contexte.labelVariable)} />
        </div>
      )}
      {afficherReponseApresEchec && resultat.scorePoserEquationInequation === 0 && (
        <div className="answer-reveal">
          Réponse attendue : <Katex expression={formatEquationInequationLatex(exercice)} />
        </div>
      )}
      {afficherReponseApresEchec && resultat.scoreResoudre === 0 && <div className="answer-reveal">Résolution attendue : {formatResolutionAttendueTexte(exercice)}</div>}
      {afficherReponseApresEchec && resultat.scoreValidation === 0 && <div className="answer-reveal">Validation attendue : {formatValidationAttendueTexte(exercice)}</div>}
      {afficherReponseApresEchec && resultat.scoreInterpretation === 0 && optionCorrecte && (
        <div className="answer-reveal">Interprétation attendue : {optionCorrecte.texte}</div>
      )}

      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {labelBouton}
      </button>
    </div>
  );
}
