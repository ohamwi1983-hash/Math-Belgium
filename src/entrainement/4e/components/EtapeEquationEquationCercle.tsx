import { useState } from "react";
import type { ExerciceEquationCercle } from "../core/equationCercle.types";
import { NIVEAU_AIDE_MAX_EQUATION } from "../moteur/sessionEquationCercle";
import { diagnostiquerEquationExercice } from "../moteur/verificationEquationCercle";
import { CONSIGNE_EQUATION, CONSIGNE_GENERALE_EQUATION_CERCLE, LATEX_GABARIT_EQUATION, PLACEHOLDER_EQUATION, TEXTE_AIDE_EQUATION_NIVEAU1, formatEtatActuelCentreRayonLatex } from "../ui/formatEquationCercle";
import { formatMessageErreur } from "../ui/messageErreur";
import { EquationCercleGraph } from "./EquationCercleGraph";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceEquationCercle;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: string) => void;
}

/**
 * Écran 3 (dernier, toujours terminal) — champ texte libre, réutilise directement
 * `diagnostiquerEquationExercice` (`moteur/verificationEquationCercle.ts`, moteur d'égalité
 * algébrique à 2 variables déjà partagé). Un seul niveau d'aide : le gabarit général, jamais
 * substitué avec les vraies valeurs (elles sont déjà rappelées dans le bloc "État actuel").
 */
export function EtapeEquationEquationCercle({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [texte, setTexte] = useState("");

  const complet = texte.trim() !== "";

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerEquationExercice(exercice, texte) : undefined;
  const erronee = apresEchec && statut !== "correct";

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_EQUATION_CERCLE}</p>
      <EquationCercleGraph exercice={exercice} afficherCentre afficherRayon />
      <EtatActuelPanel latex={formatEtatActuelCentreRayonLatex(exercice)} />
      <p className="prompt-text">{CONSIGNE_EQUATION}</p>

      <div className="field field-inline">
        <label className="field-label" htmlFor="equation-cercle-equation">
          Équation :
        </label>
        <input
          id="equation-cercle-equation"
          className={`text-input${erronee ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_EQUATION}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{TEXTE_AIDE_EQUATION_NIVEAU1}</p>
          <p>
            <Katex expression={LATEX_GABARIT_EQUATION} />
          </p>
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_EQUATION} onActiverAide={onActiverAide} />

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
