import { useState } from "react";
import type { ExerciceInequation, SigneA } from "../core/inequation.types";
import { Katex } from "./Katex";
import { formatInequationLatex } from "../ui/formatInequation";
import { calculerCroquisAvecRacinesVraies } from "../ui/parabolaSketch";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { ParabolaSketch } from "./ParabolaSketch";

interface Props {
  exercice: ExerciceInequation;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  onValider: (reponse: SigneA) => void;
}

/**
 * Étape "signe de a" (après racines) : choix mutuellement exclusif a>0/a<0, avec un croquis
 * schématique de la parabole mis à jour en direct dès qu'un signe est choisi — combine les
 * vraies racines confirmées de l'exercice (jamais la saisie de l'élève à l'étape précédente,
 * correcte ou non — voir calculerCroquisAvecRacinesVraies) avec le signe choisi ici (état local,
 * pas encore soumis).
 */
export function EtapeSigneA({ exercice, tentativesUtilisees, tentativesMax, recapitulatif, onValider }: Props) {
  const [signe, setSigne] = useState<SigneA | null>(null);
  const croquis = signe ? calculerCroquisAvecRacinesVraies(exercice, signe) : null;

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      <div className="equation-box">
        <Katex expression={formatInequationLatex(exercice.enonce, exercice.symbole)} block />
      </div>
      <p className="prompt-text">Quel est le signe de a ?</p>
      <div className="options-grid-compact">
        <button type="button" className={signe === "+" ? "btn toggle-active" : "btn"} onClick={() => setSigne("+")}>
          a &gt; 0
        </button>
        <button type="button" className={signe === "-" ? "btn toggle-active" : "btn"} onClick={() => setSigne("-")}>
          a &lt; 0
        </button>
      </div>

      {croquis && (
        <div className="contenu-conditionnel">
          <ParabolaSketch croquis={croquis} />
        </div>
      )}

      <button
        type="button"
        className="btn btn-primary"
        disabled={signe === null}
        onClick={() => signe !== null && onValider(signe)}
      >
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}
    </div>
  );
}
