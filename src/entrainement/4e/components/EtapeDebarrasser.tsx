import { useState } from "react";
import type { ExerciceCaracteristiquesAlgebriques } from "../core/caracteristiquesAlgebriques.types";
import { diagnostiquerDebarrasserNiveau1 } from "../moteur/verificationCaracteristiquesAlgebriques";
import { formatEquationRechercheZerosLatex, instructionDebarrasser } from "../ui/formatCaracteristiquesAlgebriques";
import { formatMessageErreur } from "../ui/messageErreur";
import { Katex } from "./Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

interface Props {
  exercice: ExerciceCaracteristiquesAlgebriques;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (reponse: string) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Étape "se débarrasser de..." (`prompt-3-ameliorations-finales.md`, point 2) — `inverse`/
 * `racine_carree`/`racine_cubique`/`cube` uniquement (miroir de `EtapeSeparation.tsx` pour les 2
 * autres familles, voir `necessiteDebarrasser`). Un seul champ libre, l'instruction adaptée à
 * l'opération réellement nécessaire (`instructionDebarrasser`) — jamais un texte générique.
 * L'équation isolée confirmée à l'étape précédente n'est plus rappelée ici via un bloc "état
 * actuel" isolé : elle apparaît désormais dans le récapitulatif "Ce qu'on sait déjà"
 * (`RecapitulatifPanel`, `calculerRecapitulatifCaracteristiquesAlgebriques`) affiché en haut de
 * chaque écran par `AppCaracteristiquesAlgebriques.tsx`.
 */
export function EtapeDebarrasser({ exercice, tentativesUtilisees, tentativesMax, onValider, validation}: Props) {
  const [texte, setTexte] = useState("");
  const complet = texte.trim() !== "";
  const statut =
    tentativesUtilisees > 0 && exercice.niveau === "niveau1" ? diagnostiquerDebarrasserNiveau1(exercice, texte) : undefined;
  const erronee = tentativesUtilisees > 0 && statut !== "correct";

  return (
    <div>
      <div className="equation-box">
        <Katex expression={formatEquationRechercheZerosLatex(exercice)} block />
      </div>
      <p className="prompt-text">{instructionDebarrasser(exercice.famille)}</p>
      <div className="field field-inline">
        <input
          className={`text-input${erronee ? " is-erronee" : ""}`}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          aria-label="Équation simplifiée"
        />
      </div>
      {!validation && (
        <>
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
