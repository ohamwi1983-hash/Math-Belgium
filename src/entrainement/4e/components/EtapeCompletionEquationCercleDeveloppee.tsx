import { useState } from "react";
import type { ExerciceEquationCercleDeveloppee } from "../core/equationCercleDeveloppee.types";
import { NIVEAU_AIDE_MAX_COMPLETION } from "../moteur/sessionEquationCercleDeveloppee";
import { diagnostiquerCompletionCarre } from "../moteur/verificationEquationCercleDeveloppee";
import { CONSIGNE_COMPLETION, CONSIGNE_GENERALE_CENTRE_RAYON, PLACEHOLDER_COMPLETION, TEXTE_AIDE_COMPLETION_NIVEAU1, formatAideCompletionNiveau2Latex, formatEquationDeveloppeeLatex, formatEtatActuelRegroupementLatex } from "../ui/formatEquationCercleDeveloppee";
import { formatMessageErreur } from "../ui/messageErreur";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceEquationCercleDeveloppee;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: string) => void;
}

/**
 * Écran 2 — énoncé toujours affiché, "état actuel" rappelle le regroupement CONFIRMÉ à l'écran 1
 * (jamais resaisi). Champ de texte libre, vérifié par équivalence algébrique à 2 variables
 * (`diagnostiquerCompletionCarre` — cible IDENTIQUE à l'écran 1, voir l'en-tête de
 * `verificationEquationCercleDeveloppee.ts`).
 */
export function EtapeCompletionEquationCercleDeveloppee({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [texte, setTexte] = useState("");

  const complet = texte.trim() !== "";

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerCompletionCarre(exercice, texte) : undefined;
  const erronee = apresEchec && statut !== "correct";

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_CENTRE_RAYON}</p>
      <div className="equation-box">
        <Katex expression={formatEquationDeveloppeeLatex(exercice)} block />
      </div>
      <EtatActuelPanel latex={formatEtatActuelRegroupementLatex(exercice)} />
      <p className="prompt-text">{CONSIGNE_COMPLETION}</p>

      <div className="field">
        <label className="field-label" htmlFor="equation-cercle-developpee-completion">
          Équation complétée :
        </label>
        <input
          id="equation-cercle-developpee-completion"
          className={`text-input${erronee ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_COMPLETION}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{TEXTE_AIDE_COMPLETION_NIVEAU1}</p>
          {niveauAide >= 2 && (
            <p>
              <Katex expression={formatAideCompletionNiveau2Latex(exercice)} />
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
