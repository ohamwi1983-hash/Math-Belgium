import { useState } from "react";
import type { ExerciceEquationCercleDeveloppee } from "../core/equationCercleDeveloppee.types";
import { NIVEAU_AIDE_MAX_REGROUPEMENT } from "../moteur/sessionEquationCercleDeveloppee";
import { diagnostiquerRegroupement } from "../moteur/verificationEquationCercleDeveloppee";
import { CONSIGNE_GENERALE_CENTRE_RAYON, CONSIGNE_REGROUPEMENT, PLACEHOLDER_EQUATION, TEXTE_AIDE_REGROUPEMENT_NIVEAU1, formatAideRegroupementNiveau2Latex, formatEquationDeveloppeeLatex } from "../ui/formatEquationCercleDeveloppee";
import { formatMessageErreur } from "../ui/messageErreur";
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
 * Écran 1 (première étape, toujours sans état actuel — rien à rappeler avant elle) — l'énoncé
 * (équation développée) reste affiché, fixe, sur les 3 écrans de cet exercice. Champ de texte
 * libre, vérifié par équivalence algébrique à 2 variables (`diagnostiquerRegroupement`).
 */
export function EtapeRegroupementEquationCercleDeveloppee({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [texte, setTexte] = useState("");

  const complet = texte.trim() !== "";

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerRegroupement(exercice, texte) : undefined;
  const erronee = apresEchec && statut !== "correct";

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_CENTRE_RAYON}</p>
      <div className="equation-box">
        <Katex expression={formatEquationDeveloppeeLatex(exercice)} block />
      </div>
      <p className="prompt-text">{CONSIGNE_REGROUPEMENT}</p>

      <div className="field">
        <label className="field-label" htmlFor="equation-cercle-developpee-regroupement">
          Équation regroupée :
        </label>
        <input
          id="equation-cercle-developpee-regroupement"
          className={`text-input${erronee ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_EQUATION}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{TEXTE_AIDE_REGROUPEMENT_NIVEAU1}</p>
          {niveauAide >= 2 && (
            <p>
              <Katex expression={formatAideRegroupementNiveau2Latex(exercice)} />
            </p>
          )}
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
