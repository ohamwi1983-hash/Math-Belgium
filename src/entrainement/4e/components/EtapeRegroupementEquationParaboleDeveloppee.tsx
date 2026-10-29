import { useState } from "react";
import type { ExerciceEquationParaboleDeveloppee } from "../core/equationParaboleDeveloppee.types";
import { NIVEAU_AIDE_MAX_REGROUPEMENT } from "../moteur/sessionEquationParaboleDeveloppee";
import { diagnostiquerRegroupement, estEquivalenteEquationDepart } from "../moteur/verificationEquationParaboleDeveloppee";
import { CONSIGNE_GENERALE_CARACTERISTIQUES_PARABOLE, TEXTE_AIDE_REGROUPEMENT_NIVEAU1, formatEquationDeveloppeeLatex, messageFormeNonAtteinte, placeholderRegroupement, segmentsConsigneRegroupement, texteAideRegroupementNiveau2 } from "../ui/formatEquationParaboleDeveloppee";
import { formatMessageErreur } from "../ui/messageErreur";
import { ApercuExpressionLatex } from "./ApercuExpressionLatex";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceEquationParaboleDeveloppee;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: string) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran 1 (première étape, sans état actuel — rien à rappeler avant elle) — l'énoncé (équation
 * développée) reste affiché, fixe, sur les 3 écrans. Champ de texte libre, vérifié par équivalence
 * algébrique à 2 variables (`diagnostiquerRegroupement`).
 */
export function EtapeRegroupementEquationParaboleDeveloppee({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation}: Props) {
  const [texte, setTexte] = useState("");

  const complet = texte.trim() !== "";

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerRegroupement(exercice, texte) : undefined;
  const erronee = apresEchec && statut !== "correct";
  const formeNonAtteinte = statut === "not_equivalent" && estEquivalenteEquationDepart(exercice, texte);

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={CONSIGNE_GENERALE_CARACTERISTIQUES_PARABOLE}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={formatEquationDeveloppeeLatex(exercice)} block />
          </div>
        }
      />
      <p className="prompt-text">
        <RenduFragments fragments={segmentsConsigneRegroupement(exercice)} />
      </p>

      <ApercuExpressionLatex texte={texte} />
      <div className="field">
        <label className="field-label" htmlFor="equation-parabole-developpee-regroupement">
          Équation :
        </label>
        <input
          id="equation-parabole-developpee-regroupement"
          className={`text-input${erronee ? " is-erronee" : ""}`}
          placeholder={placeholderRegroupement(exercice)}
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
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_REGROUPEMENT} onActiverAide={onActiverAide} />

        <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(texte)}>
          Valider
        </button>
        {tentativesUtilisees > 0 && (
          <p className="alert-error" role="alert">
            {formeNonAtteinte ? messageFormeNonAtteinte(tentativesUtilisees, tentativesMax) : formatMessageErreur(tentativesUtilisees, tentativesMax, statut)}
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
