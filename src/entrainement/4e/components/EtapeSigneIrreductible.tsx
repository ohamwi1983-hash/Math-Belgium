import { useState } from "react";
import type { SigneA } from "../core/inequation.types";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";

interface Props {
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  /** Bloc "état actuel" isolant ce facteur — absent/null par défaut : rien de rendu. */
  etatActuel?: string | null;
  aideActivee: boolean;
  onActiverAide: () => void;
  onValider: (reponse: SigneA) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Étape "signe irréductible" (section 2, point 2 de la spec) : choix mutuellement exclusif
 * toujours positif/toujours négatif pour un facteur quadratique à Δ<0 — répétée une fois par
 * facteur irréductible présent (0 à 2), même mécanisme que EtapeSigneA (exercice "tableau de
 * signes") mais sans croquis (pas de parabole unique ici, ce n'est qu'un facteur parmi d'autres).
 *
 * Le rappel « il garde toujours le signe de son propre a » (même texte que le callout `attention`
 * du cours) n'est montré qu'à l'activation du bouton Aide : affiché d'office, il donnait la
 * réponse (audit gen5). L'aide est suivie par occurrence (`aideSigneIrreductibleCourante`,
 * moteur/sessionSignesProduit.ts), cet écran pouvant se répéter 0 à 2 fois par exercice.
 */
export function EtapeSigneIrreductible({
  tentativesUtilisees,
  tentativesMax,
  recapitulatif,
  etatActuel,
  aideActivee,
  onActiverAide,
  onValider,
  validation,
}: Props) {
  const [signe, setSigne] = useState<SigneA | null>(null);

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
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

      {aideActivee && (
        <div className="triangle-quelconque-aide">
          <p>
            Un facteur quadratique irréductible (Δ&lt;0) ne s'annule jamais : il garde toujours le signe de son propre a,
            sur toute la droite réelle.
          </p>
        </div>
      )}
      {!validation && (
        <>
        <BoutonAide niveauAide={aideActivee ? 1 : 0} niveauAideMax={1} onActiverAide={onActiverAide} />
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
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
