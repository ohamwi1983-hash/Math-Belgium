import { useState } from "react";
import type { ExerciceSuiteArithmetique } from "../core5e/suitesArithmetiques.types";
import type { PhaseSuiteArithmetique } from "../moteur5e/typesSuiteArithmetique";
import type { ReponseEquation } from "../moteur5e/sessionSuiteArithmetique";
import { PHASES_AIDE1_LATEX, consigneGenerale, consignePhase, formatTermesDonneesLatex, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatSuiteArithmetique";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelSuiteArithmetique } from "./EtatActuelSuiteArithmetique";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

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
}

/** Écran "poserEquationAlgebrique" (familles "algebriqueTermeGeneral"/"algebriqueSommeSn") ou
 * "poserEquationRangN" (famille "algebriqueRangN") — REFONTE `prompt5gen14refontefamillesbonus.md` :
 * UN SEUL champ texte libre où l'élève tape l'équation COMPLÈTE, "=" inclus (remplace le patron "2
 * champs gauche/droite séparés par un '=' visuel" — `diagnostiquerEquationComplete`/
 * `diagnostiquerEquationCompleteEnN`, `moteur5e/verificationSuiteArithmetique.ts`, splittent le
 * texte sur "=" avant de déléguer à la vérification par différences finies existante). */
export function EtapePoserEquation({ exercice, phase, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [texte, setTexte] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = texte.trim() !== "";
  const aide2 = texteAideNiveau2(exercice, phase);
  const apresEchec = tentativesUtilisees > 0;
  const equationErronee = apresEchec && !!diagnostiquer && complet && diagnostiquer({ texte }) !== "correct";
  const placeholder = phase === "poserEquationRangN" ? "ex : 5+(n-1)*3=302" : "ex : 5x-47=-x+16-x+19";

  function valider() {
    if (!complet) return;
    const reponse: ReponseEquation = { texte };
    if (diagnostiquer) setDernierStatut(diagnostiquer(reponse));
    onValider(reponse);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale(exercice)}</p>
      <div className="equation-box equation-box-donnees">
        {formatTermesDonneesLatex(exercice).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>
      <EtatActuelSuiteArithmetique exercice={exercice} phase={phase} />
      <p className="prompt-text">{consignePhase(exercice, phase)}</p>
      <ApercuExpressionLatex texte={texte} />
      <div className="field-row">
        <input
          type="text"
          className={`text-input${equationErronee ? " is-erronee" : ""}`}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder={placeholder}
        />
      </div>
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
          {PHASES_AIDE1_LATEX.has(phase as PhaseSuiteArithmetique) ? (
            <Katex expression={texteAideNiveau1(exercice, phase)} block />
          ) : (
            <p>{texteAideNiveau1(exercice, phase)}</p>
          )}
          {niveauAide >= 2 && aide2.length > 0 && <Katex expression={aide2} block />}
        </div>
      )}
    </div>
  );
}
