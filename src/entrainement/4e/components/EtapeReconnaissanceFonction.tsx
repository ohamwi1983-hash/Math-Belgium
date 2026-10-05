import { useState } from "react";
import type { ExerciceFonctionReference, FamilleReference } from "../core/fonctionsReference.types";
import { OPTIONS_FAMILLE } from "../ui/famillesReferenceLabels";
import { MafsGraphFonctionsReference } from "./MafsGraphFonctionsReference";

interface Props {
  exercice: ExerciceFonctionReference;
  tentativesUtilisees: number;
  tentativesMax: number;
  onChoisir: (choix: FamilleReference) => void;
}

/**
 * Étape 0 (spec section 3) : le graphe affiche uniquement la courbe cible transformée, sans
 * indication de famille — l'élève choisit parmi les 6. Aucun curseur ici (contrairement à l'écran
 * "exercice") : seule la reconnaissance de la forme est en jeu, notée avec le mécanisme habituel de
 * tentatives/pénalité (même principe que EtapeReconnaissance.tsx, exercice 1).
 */
export function EtapeReconnaissanceFonction({ exercice, tentativesUtilisees, tentativesMax, onChoisir }: Props) {
  const [choix, setChoix] = useState<FamilleReference | null>(null);
  const erronee = tentativesUtilisees > 0;

  return (
    <div>
      <p className="prompt-text">Observe le graphe : à quelle fonction de référence appartient cette courbe ?</p>
      <MafsGraphFonctionsReference cible={exercice} />
      <div className="options-grid">
        {OPTIONS_FAMILLE.map((option) => (
          <button
            key={option.valeur}
            type="button"
            className={`btn${choix === option.valeur ? " toggle-active" : ""}${erronee && choix === option.valeur ? " is-erronee" : ""}`}
            onClick={() => setChoix(option.valeur)}
          >
            {option.libelle}
          </button>
        ))}
      </div>
      <button type="button" className="btn btn-primary" disabled={choix === null} onClick={() => choix !== null && onChoisir(choix)}>
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
