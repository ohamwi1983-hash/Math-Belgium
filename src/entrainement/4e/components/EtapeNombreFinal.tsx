import { useState } from "react";
import type { ExerciceBienaymeTchebychevIntervalleVersNombre } from "../core/bienaymeTchebychev.types";
import { diagnostiquerNombre } from "../moteur/verificationBienaymeTchebychev";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { PRECISION_UNITE, formatEtatActuelCombineLatex, kEtatActuel, pourcentAttenduEtatActuel } from "../ui/formatBienaymeTchebychev";
import { formatMessageErreur } from "../ui/messageErreur";
import { EnonceBienaymeTchebychev } from "./EnonceBienaymeTchebychev";
import { EtatActuelPanel } from "./EtatActuelPanel";

interface Props {
  exercice: ExerciceBienaymeTchebychevIntervalleVersNombre;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (texte: string) => void;
}

/** Rôle "nombre minimal d'individus" (v3Nombre, dernier écran de V3) — AUCUNE aide (même convention
 * "max=0 → pas de bouton" que l'écran "résolution" de "Colinéarité"/"Orthogonalité"). Rappelle k et
 * le pourcentage déjà confirmés aux 2 écrans précédents. */
export function EtapeNombreFinal({ exercice, tentativesUtilisees, tentativesMax, onValider }: Props) {
  const [texte, setTexte] = useState("");
  const complet = texte.trim() !== "";
  const statut = complet && tentativesUtilisees > 0 ? diagnostiquerNombre(exercice, texte) : undefined;

  return (
    <div>
      <EnonceBienaymeTchebychev exercice={exercice} />
      <EtatActuelPanel latex={formatEtatActuelCombineLatex(pourcentAttenduEtatActuel(exercice), kEtatActuel(exercice))} />
      <p className="prompt-text">Quel est le nombre minimal d'individus garanti ? ({PRECISION_UNITE})</p>

      <div className="field field-inline">
        <label className="field-label" htmlFor="bienayme-nombre-final">
          Nombre minimal =
        </label>
        <input
          id="bienayme-nombre-final"
          className={`text-input${statut !== undefined && statut !== "correct" ? " is-erronee" : ""}`}
          placeholder="ex : 42"
          value={texte}
          onChange={(e) => setTexte(filtrerSaisieNumerique(e.target.value))}
          onKeyDown={gererKeyDownNumerique}
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
