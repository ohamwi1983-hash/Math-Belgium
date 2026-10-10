import { useState } from "react";
import type { ExerciceEquationParaboleDeveloppee } from "../core/equationParaboleDeveloppee.types";
import { NIVEAU_AIDE_MAX_COMPLETION } from "../moteur/sessionEquationParaboleDeveloppee";
import { diagnostiquerCompletionCarre } from "../moteur/verificationEquationParaboleDeveloppee";
import { CONSIGNE_COMPLETION, CONSIGNE_GENERALE_CARACTERISTIQUES_PARABOLE, formatEquationDeveloppeeLatex, formatRegroupementLatex, segmentsAideCompletionNiveau1, texteAideCompletionNiveau2 } from "../ui/formatEquationParaboleDeveloppee";
import { formatMessageErreur } from "../ui/messageErreur";
import { ApercuExpressionLatex } from "./ApercuExpressionLatex";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceEquationParaboleDeveloppee;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: string) => void;
}

/**
 * Écran 2 — énoncé toujours affiché, "état actuel" rappelle le regroupement CONFIRMÉ à l'écran 1.
 * Champ de texte libre, vérifié par équivalence algébrique à 2 variables
 * (`diagnostiquerCompletionCarre` — cible IDENTIQUE à l'écran 1, voir l'en-tête de
 * `verificationEquationParaboleDeveloppee.ts`).
 */
export function EtapeCompletionEquationParaboleDeveloppee({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [texte, setTexte] = useState("");

  const complet = texte.trim() !== "";

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerCompletionCarre(exercice, texte) : undefined;
  const erronee = apresEchec && statut !== "correct";

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_CARACTERISTIQUES_PARABOLE}</p>
      <div className="equation-box">
        <Katex expression={formatEquationDeveloppeeLatex(exercice)} block />
      </div>
      <EtatActuelPanel latex={formatRegroupementLatex(exercice)} />
      <p className="prompt-text">{CONSIGNE_COMPLETION}</p>

      <ApercuExpressionLatex texte={texte} />
      <div className="field">
        <label className="field-label" htmlFor="equation-parabole-developpee-completion">
          Équation complétée :
        </label>
        <input
          id="equation-parabole-developpee-completion"
          className={`text-input${erronee ? " is-erronee" : ""}`}
          placeholder="ex : (x-1)^2=16(y+2)"
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            <RenduFragments fragments={segmentsAideCompletionNiveau1(exercice)} />
          </p>
          {niveauAide >= 2 && (
            <p>
              <Katex expression={texteAideCompletionNiveau2(exercice)} />
            </p>
          )}
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_COMPLETION} onActiverAide={onActiverAide} />

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(texte)}>
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, statut)}
        </p>
      )}
    </div>
  );
}
