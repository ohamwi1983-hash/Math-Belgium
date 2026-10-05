import { useState } from "react";
import type { FacteurQuadratiqueIrreductible } from "../core/signesProduit.types";
import type { SigneA } from "../core/inequation.types";
import { Katex } from "./Katex";
import { formatFacteurLatex } from "../ui/formatSignesProduit";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { EtatActuelPanel } from "./EtatActuelPanel";

interface Props {
  facteur: FacteurQuadratiqueIrreductible;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  /** Remplace l'encadré principal par défaut (le facteur seul) — l'inéquation complète (promptgenerateur5signesProduit.md, point 1). */
  expressionAffichee?: string;
  /** Version "bloc fitter" de `expressionAffichee` (`promptblocfittertousgenerateurs.md`) — un
   * fragment KaTeX par facteur parenthésé plutôt qu'une seule chaîne. Prioritaire sur
   * `expressionAffichee` quand fourni. */
  expressionAfficheeTermes?: string[];
  /** Bloc "état actuel" isolant ce facteur — absent/null par défaut : rien de rendu. */
  etatActuel?: string | null;
  onValider: (reponse: SigneA) => void;
}

/**
 * Étape "signe irréductible" (section 2, point 2 de la spec) : choix mutuellement exclusif
 * toujours positif/toujours négatif pour un facteur quadratique à Δ<0 — répétée une fois par
 * facteur irréductible présent (0 à 2), même mécanisme que EtapeSigneA (exercice "tableau de
 * signes") mais sans croquis (pas de parabole unique ici, ce n'est qu'un facteur parmi d'autres).
 */
export function EtapeSigneIrreductible({
  facteur,
  tentativesUtilisees,
  tentativesMax,
  recapitulatif,
  expressionAffichee,
  expressionAfficheeTermes,
  etatActuel,
  onValider,
}: Props) {
  const [signe, setSigne] = useState<SigneA | null>(null);

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      {expressionAfficheeTermes !== undefined ? (
        <div className="equation-box equation-box-termes">
          {expressionAfficheeTermes.map((terme, i) => (
            <Katex key={i} expression={terme} />
          ))}
        </div>
      ) : (
        <div className="equation-box">
          <Katex expression={expressionAffichee ?? formatFacteurLatex(facteur)} block />
        </div>
      )}
      <EtatActuelPanel latex={etatActuel ?? null} />
      <p className="prompt-text">Ce facteur est-il toujours positif ou toujours négatif ?</p>
      <div className="options-grid">
        <button type="button" className={signe === "+" ? "btn toggle-active" : "btn"} onClick={() => setSigne("+")}>
          Toujours positif
        </button>
        <button type="button" className={signe === "-" ? "btn toggle-active" : "btn"} onClick={() => setSigne("-")}>
          Toujours négatif
        </button>
      </div>

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
