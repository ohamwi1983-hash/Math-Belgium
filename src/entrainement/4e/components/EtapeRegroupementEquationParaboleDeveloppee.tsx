import { useState } from "react";
import type { ExerciceEquationParaboleDeveloppee } from "../core/equationParaboleDeveloppee.types";
import { NIVEAU_AIDE_MAX_REGROUPEMENT } from "../moteur/sessionEquationParaboleDeveloppee";
import { diagnostiquerRegroupement } from "../moteur/verificationEquationParaboleDeveloppee";
import { CONSIGNE_GENERALE_CARACTERISTIQUES_PARABOLE, TEXTE_AIDE_REGROUPEMENT_NIVEAU1, formatEquationDeveloppeeLatex, segmentsConsigneRegroupement, texteAideRegroupementNiveau2 } from "../ui/formatEquationParaboleDeveloppee";
import { formatMessageErreur } from "../ui/messageErreur";
import { ApercuExpressionLatex } from "./ApercuExpressionLatex";
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
 * Écran 1 (première étape, sans état actuel — rien à rappeler avant elle) — l'énoncé (équation
 * développée) reste affiché, fixe, sur les 3 écrans. Champ de texte libre, vérifié par équivalence
 * algébrique à 2 variables (`diagnostiquerRegroupement`).
 */
export function EtapeRegroupementEquationParaboleDeveloppee({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [texte, setTexte] = useState("");

  const complet = texte.trim() !== "";

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerRegroupement(exercice, texte) : undefined;
  const erronee = apresEchec && statut !== "correct";

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_CARACTERISTIQUES_PARABOLE}</p>
      <div className="equation-box">
        <Katex expression={formatEquationDeveloppeeLatex(exercice)} block />
      </div>
      <p className="prompt-text">
        <RenduFragments fragments={segmentsConsigneRegroupement(exercice)} />
      </p>

      <ApercuExpressionLatex texte={texte} />
      <div className="field">
        <label className="field-label" htmlFor="equation-parabole-developpee-regroupement">
          Équation factorisée :
        </label>
        <input
          id="equation-parabole-developpee-regroupement"
          className={`text-input${erronee ? " is-erronee" : ""}`}
          placeholder="ex : 2(x^2-2x)=32y+62"
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{TEXTE_AIDE_REGROUPEMENT_NIVEAU1}</p>
          {niveauAide >= 2 && <p>{texteAideRegroupementNiveau2(exercice)}</p>}
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_REGROUPEMENT} onActiverAide={onActiverAide} />

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
