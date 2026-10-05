import { useState } from "react";
import type { ExerciceCaracteristiquesAlgebriques } from "../core/caracteristiquesAlgebriques.types";
import { diagnostiquerDebarrasserNiveau1 } from "../moteur/verificationCaracteristiquesAlgebriques";
import { formatEquationRechercheZerosLatex, instructionDebarrasser } from "../ui/formatCaracteristiquesAlgebriques";
import { formatMessageErreur } from "../ui/messageErreur";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceCaracteristiquesAlgebriques;
  etatActuel: string | null;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (reponse: string) => void;
}

/**
 * Étape "se débarrasser de..." (`prompt-3-ameliorations-finales.md`, point 2) — `inverse`/
 * `racine_carree`/`racine_cubique`/`cube` uniquement (miroir de `EtapeSeparation.tsx` pour les 2
 * autres familles, voir `necessiteDebarrasser`). Un seul champ libre, l'instruction adaptée à
 * l'opération réellement nécessaire (`instructionDebarrasser`) — jamais un texte générique.
 * `etatActuel` rappelle l'équation isolée confirmée à l'étape précédente (voir
 * `calculerEtatActuelCaracteristiquesAlgebriques`).
 */
export function EtapeDebarrasser({ exercice, etatActuel, tentativesUtilisees, tentativesMax, onValider }: Props) {
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
      <EtatActuelPanel latex={etatActuel} />
      <p className="prompt-text">{instructionDebarrasser(exercice.famille)}</p>
      <div className="field field-inline">
        <input
          className={`text-input${erronee ? " is-erronee" : ""}`}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          aria-label="Équation simplifiée"
        />
      </div>
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
