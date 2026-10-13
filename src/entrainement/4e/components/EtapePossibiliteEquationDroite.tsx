import { useState } from "react";
import type { ExerciceEquationDroite } from "../core/equationDroite.types";
import { consignePossibilite, formatEnonceLatex } from "../ui/formatEquationDroite";
import { formatMessageErreur } from "../ui/messageErreur";
import { ConsigneGeneraleEquationDroite } from "./ConsigneGeneraleEquationDroite";
import { Katex } from "./Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceEquationDroite;
  estPremierEcran: boolean;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (reponse: "possible" | "impossible") => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran 2 — champ catégoriel pur "possible"/"impossible", aucune saisie libre (donc jamais de
 * `parse_error`). Piège central : la forme cible peut être structurellement impossible pour cette
 * droite précise (verticale pour explicite_y, horizontale pour explicite_x) — si "impossible" est
 * la bonne réponse, l'exercice se clôt directement ici (voir `sessionEquationDroite.ts`).
 *
 * **Aucun bouton "Aide"** (`NIVEAU_AIDE_MAX_POSSIBILITE = 0`, `promptgen42modifications.md`, point
 * 3) : l'ancienne aide révélait directement possible/impossible plutôt que d'orienter la réflexion
 * — retirée sans remplacement, même patron que "Colinéarité"/"Orthogonalité" écrans "resolution".
 */
export function EtapePossibiliteEquationDroite({ exercice, estPremierEcran, tentativesUtilisees, tentativesMax, onValider, validation}: Props) {
  const [choix, setChoix] = useState<"possible" | "impossible" | null>(null);

  return (
    <div>
      <EnTeteExercice
        estPremierEcran={estPremierEcran}
        consigneGenerale={<ConsigneGeneraleEquationDroite exercice={exercice} />}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={formatEnonceLatex(exercice)} />
          </div>
        }
      />
      <p className="prompt-text">{consignePossibilite(exercice)}</p>

      <div className="options-grid-compact">
        <button type="button" className={choix === "possible" ? "btn toggle-active" : "btn"} onClick={() => setChoix("possible")}>
          Possible
        </button>
        <button type="button" className={choix === "impossible" ? "btn toggle-active" : "btn"} onClick={() => setChoix("impossible")}>
          Impossible
        </button>
      </div>

      {!validation && (
        <>
        <button type="button" className="btn btn-primary" disabled={choix === null} onClick={() => choix !== null && onValider(choix)}>
          Valider
        </button>
        {tentativesUtilisees > 0 && (
          <p className="alert-error" role="alert">
            {formatMessageErreur(tentativesUtilisees, tentativesMax)}
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
