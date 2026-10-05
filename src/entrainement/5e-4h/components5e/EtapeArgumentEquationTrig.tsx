import { useState } from "react";
import type { ExerciceEquationTrig } from "../core5e/equationsTrigonometriques.types";
import type { ReponseArgument } from "../moteur5e/verificationEquationTrig";
import { ANNONCE_PRECISION_DECIMAL, CONSIGNE_GENERALE_EQUATION_TRIG, formatEquationEnonceLatex, texteAideArgumentNiveau1, texteAideArgumentNiveau2 } from "../ui5e/formatEquationTrig";
import { formatQuestionArgumentTexte } from "../ui5e/formatEquationTrigonometrique";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import { BoutonAide } from "./BoutonAide";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceEquationTrig;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseArgument) => void;
  /** Statut à 3 valeurs (correct/not_equivalent/parse_error) calculé côté PRÉSENTATION uniquement,
   * pour différencier le message affiché après une tentative échouée — jamais consommé par le
   * score, qui reste piloté par le booléen historique déclenché via `onValider`. Optionnel : un
   * appelant qui ne le fournit pas garde le message générique historique. */
  diagnostiquer?: (reponse: ReponseArgument) => StatutVerification;
}

/** Écran 1 — résoudre pour l'argument u=ax+b. Add-as-needed (1 ligne pour tan/cas spécial, 2 pour
 * le cas général) + gate 2 boutons "Aucune solution"/"Au moins une série d'angles" (cos/sin
 * uniquement, jamais tan — D.1, même patron que `EtapeCEDomaineDefinition.tsx`). Calculatrice
 * scientifique affichée UNIQUEMENT en régime "decimal" (D.1 — jamais pour une valeur d'angle
 * particulier, régime "exact"). */
export function EtapeArgumentEquationTrig({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const gateActif = exercice.fonction !== "tan";
  const [choixAucuneSolution, setChoixAucuneSolution] = useState<boolean | null>(gateActif ? null : false);
  const [lignes, setLignes] = useState<string[]>([""]);
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const lignesVisibles = choixAucuneSolution === false;
  const complet = choixAucuneSolution === true || (lignesVisibles && lignes.length > 0 && lignes.every((l) => l.trim() !== ""));
  const reponseCourante: ReponseArgument = choixAucuneSolution === true ? { aucuneSolution: true } : { aucuneSolution: false, lignes };
  const lignesErronee = montrerErreurs && lignesVisibles && !!diagnostiquer && diagnostiquer(reponseCourante) !== "correct";

  function ajouterLigne() {
    setLignes((arr) => [...arr, ""]);
  }
  function retirerLigne(i: number) {
    setLignes((arr) => arr.filter((_, j) => j !== i));
  }
  function modifierLigne(i: number, valeur: string) {
    setLignes((arr) => arr.map((v, j) => (j === i ? valeur : v)));
  }
  function valider() {
    if (!complet) return;
    const reponse: ReponseArgument = choixAucuneSolution === true ? { aucuneSolution: true } : { aucuneSolution: false, lignes };
    if (diagnostiquer) setDernierStatut(diagnostiquer(reponse));
    onValider(reponse);
  }

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_EQUATION_TRIG}</p>
      <div className="equation-box">
        <Katex expression={formatEquationEnonceLatex(exercice)} block />
      </div>
      <p className="prompt-text">
        {formatQuestionArgumentTexte(exercice.fonction)} <Katex expression={exercice.k.latex} /> ?
        {exercice.regime === "decimal" && ANNONCE_PRECISION_DECIMAL}
      </p>
      {exercice.regime === "decimal" && <CalculatriceScientifique />}
      {gateActif && (
        <div className="options-grid">
          <button type="button" className={choixAucuneSolution === true ? "btn toggle-active" : "btn"} onClick={() => setChoixAucuneSolution(true)}>
            Aucune solution
          </button>
          <button type="button" className={choixAucuneSolution === false ? "btn toggle-active" : "btn"} onClick={() => setChoixAucuneSolution(false)}>
            Au moins une série d'angles
          </button>
        </div>
      )}
      {lignesVisibles && (
        <div className="contenu-conditionnel">
          {lignes.map((ligne, i) => (
            <div key={i}>
              <ApercuExpressionLatex texte={ligne} />
              <div className="field-row">
              <input
                type="text"
                className={`text-input${lignesErronee ? " is-erronee" : ""}`}
                value={ligne}
                onChange={(e) => modifierLigne(i, e.target.value)}
                placeholder="ex : pi/3 + 2*k*pi"
              />
              {lignes.length > 1 && (
                <button type="button" className="btn liste-morceaux-retirer" aria-label="Retirer" onClick={() => retirerLigne(i)}>
                  ×
                </button>
              )}
              </div>
            </div>
          ))}
          <button type="button" className="btn" onClick={ajouterLigne}>
            + Ajouter une série
          </button>
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideArgumentNiveau1(exercice.fonction)}</p>
          {niveauAide >= 2 && <p>{texteAideArgumentNiveau2(exercice.fonction)}</p>}
        </div>
      )}
    </div>
  );
}
