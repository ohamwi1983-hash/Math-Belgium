import { useState } from "react";
import type { ExerciceEquationParabole } from "../core/equationParabole.types";
import { NIVEAU_AIDE_MAX_EQUATION } from "../moteur/sessionEquationParabole";
import { diagnostiquerEquation } from "../moteur/verificationEquationParabole";
import { CONSIGNE_EQUATION, CONSIGNE_GENERALE_EQUATION_PARABOLE, PLACEHOLDER_EQUATION_HORIZONTAL, PLACEHOLDER_EQUATION_VERTICAL, formatAideEquationNiveau2Latex, formatFoyerLatex, formatSommetLatex, segmentsAideEquationNiveau1 } from "../ui/formatEquationParabole";
import { formatMessageErreur } from "../ui/messageErreur";
import { EquationParaboleGraph } from "./EquationParaboleGraph";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceEquationParabole;
  estPremierEcran: boolean;
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

/** Écran 2 (dernier, toujours terminal) — champ texte libre, réutilise directement
 * `diagnostiquerEquation` (`moteur/verificationEquationParabole.ts`, moteur d'égalité algébrique à
 * 2 variables déjà partagé). "État actuel" rappelle S et F CONFIRMÉS à l'écran 1. */
export function EtapeEquationEquationParabole({ exercice, estPremierEcran, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation}: Props) {
  const [texte, setTexte] = useState("");

  const complet = texte.trim() !== "";

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerEquation(exercice, texte) : undefined;
  const erronee = apresEchec && statut !== "correct";

  return (
    <div>
      <EnTeteExercice
        estPremierEcran={estPremierEcran}
        consigneGenerale={CONSIGNE_GENERALE_EQUATION_PARABOLE}
        blocDonnees={<EquationParaboleGraph exercice={exercice} afficherSommet afficherVecteurP={niveauAide >= 1} />}
      />
      <EtatActuelPanel latex={`S = ${formatSommetLatex(exercice.sommet)} \\quad F = ${formatFoyerLatex(exercice.foyer)}`} />
      <p className="prompt-text">{CONSIGNE_EQUATION}</p>

      <div className="field field-inline">
        <label className="field-label" htmlFor="equation-parabole-equation">
          Équation :
        </label>
        <input
          id="equation-parabole-equation"
          className={`text-input${erronee ? " is-erronee" : ""}`}
          placeholder={exercice.variante === "vertical" ? PLACEHOLDER_EQUATION_VERTICAL : PLACEHOLDER_EQUATION_HORIZONTAL}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            <RenduFragments fragments={segmentsAideEquationNiveau1(exercice)} />
          </p>
          {niveauAide >= 2 && (
            <p>
              <Katex expression={formatAideEquationNiveau2Latex(exercice)} />
            </p>
          )}
        </div>
      )}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_EQUATION} onActiverAide={onActiverAide} />

        <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(texte)}>
          Valider
        </button>
        {tentativesUtilisees > 0 && (
          <p className="alert-error" role="alert">
            {formatMessageErreur(tentativesUtilisees, tentativesMax, statut)}
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
