import { useState } from "react";
import type { ExerciceSuiteArithmetique } from "../core5e/suitesArithmetiques.types";
import type { PhaseSuiteArithmetique } from "../moteur5e/typesSuiteArithmetique";
import type { ReponseEquation } from "../moteur5e/sessionSuiteArithmetique";
import { PHASES_AIDE1_LATEX, consigneGenerale, consignePhase, formatTermesDonneesLatex, texteAideNiveau1, texteAideNiveau2, noteAideNiveau1 } from "../ui5e/formatSuiteArithmetique";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";
import { EnTeteExercice } from "./EnTeteExercice";
import { MESSAGE_SOLUTION_DIRECTE, estSolutionDirecte } from "../moteur5e/saisieNombreSuites";

type PhasePoserEquation = "poserEquationAlgebrique" | "poserEquationRangN";

interface Props {
  exercice: ExerciceSuiteArithmetique;
  phase: PhasePoserEquation;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseEquation) => void;
  /** Statut à 3 valeurs calculé côté PRÉSENTATION uniquement (voir `EtapeChampSimpleSuiteArithmetique.tsx`) —
   * optionnel, un appelant qui ne le fournit pas garde le message générique historique. */
  diagnostiquer?: (reponse: ReponseEquation) => StatutVerification;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran "poserEquationAlgebrique" (familles "algebriqueTermeGeneral"/"algebriqueSommeSn") ou
 * "poserEquationRangN" (famille "algebriqueRangN") — REFONTE `prompt5gen14refontefamillesbonus.md` :
 * UN SEUL champ texte libre où l'élève tape l'équation COMPLÈTE, "=" inclus (remplace le patron "2
 * champs gauche/droite séparés par un '=' visuel" — `diagnostiquerEquationComplete`/
 * `diagnostiquerEquationCompleteEnN`, `moteur5e/verificationSuiteArithmetique.ts`, splittent le
 * texte sur "=" avant de déléguer à la vérification par différences finies existante). */
export function EtapePoserEquation({ exercice, phase, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, validation}: Props) {
  const [texte, setTexte] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = texte.trim() !== "";
  const aide2 = texteAideNiveau2(exercice, phase);
  const apresEchec = tentativesUtilisees > 0;
  const equationErronee = apresEchec && !!diagnostiquer && complet && diagnostiquer({ texte }) !== "correct";
  // Exemples hors de l'espace des tirages (raison 12 > 9).
  const placeholder = phase === "poserEquationRangN" ? "ex : 7+(n−1)×12=1003" : "ex : 5x−47=2(x+16)";
  const inconnue = phase === "poserEquationRangN" ? "n" : "x";
  const [solutionDirecte, setSolutionDirecte] = useState(false);

  function valider() {
    if (!complet) return;
    // « x = −3 » : c'est la solution, pas l'équation demandée — refusé sans consommer de tentative.
    if (estSolutionDirecte(texte, inconnue)) {
      setSolutionDirecte(true);
      return;
    }
    setSolutionDirecte(false);
    const reponse: ReponseEquation = { texte };
    if (diagnostiquer) setDernierStatut(diagnostiquer(reponse));
    onValider(reponse);
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={consigneGenerale(exercice)}
        blocDonnees={
          <div className="equation-box equation-box-donnees">
            {formatTermesDonneesLatex(exercice).map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </div>
        }
      />
      <p className="prompt-text">{consignePhase(exercice, phase)}</p>
      <ApercuExpressionLatex texte={texte} />
      <div className="field-row">
        <input
          type="text"
          className={`text-input${equationErronee ? " is-erronee" : ""}`}
          value={texte}
          onChange={(e) => {
            setTexte(e.target.value);
            setSolutionDirecte(false);
          }}
          placeholder={placeholder}
        />
      </div>
      {niveauAide >= 1 && (
        <div className="aide-5e">
          {noteAideNiveau1(exercice, phase) && <p>{noteAideNiveau1(exercice, phase)}</p>}
          {PHASES_AIDE1_LATEX.has(phase as PhaseSuiteArithmetique) ? (
            <Katex expression={texteAideNiveau1(exercice, phase)} block />
          ) : (
            <p>{texteAideNiveau1(exercice, phase)}</p>
          )}
          {niveauAide >= 2 && aide2.length > 0 && <Katex expression={aide2} block />}
        </div>
      )}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
          Valider
        </button>
        {solutionDirecte && (
          <p className="alert-error" role="alert">
            {MESSAGE_SOLUTION_DIRECTE}
          </p>
        )}
        {montrerErreurs && !solutionDirecte && (
          <p className="alert-error" role="alert">
            {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
