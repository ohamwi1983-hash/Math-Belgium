import { useState } from "react";
import type { ExerciceColinearPointsParametre } from "../core/colinearite.types";
import { diagnostiquerResolutionAvecX } from "../moteur/verificationColinearite";
import { PLACEHOLDER_SOLUTION_X, consigneGlobaleColinearite, formatEquationReduiteLatex } from "../ui/formatColinearite";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { formatMessageErreur } from "../ui/messageErreur";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceColinearPointsParametre;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (valeur: number) => void;
}

/**
 * Écran "resolutionAvecX" — V4-écran3 (variante "pointsParametre") UNIQUEMENT, dernière phase,
 * `promptcorrectionsgenerateur24complet.md` (points 9-10) : cette variante garantit désormais
 * toujours exactement une solution (voir `generateurs/colinearite/index.ts`) — un simple champ
 * numérique `x =` remplace l'interface "add-as-needed" à 3 états de "résolution" (V2).
 *
 * **Aucun bouton "Aide"** (point 9, `NIVEAU_AIDE_MAX_RESOLUTION_AVEC_X = 0` — même convention que
 * le générateur 26 "Norme d'un vecteur et distance entre 2 points" : un écran à `max=0` n'affiche
 * jamais de bouton, jamais un bouton perpétuellement désactivé).
 */
export function EtapeResolutionAvecXColinearite({ exercice, tentativesUtilisees, tentativesMax, onValider }: Props) {
  const [texte, setTexte] = useState("");

  const valeur = Number(texte.replace(",", "."));
  const complet = texte.trim() !== "";
  const statut = complet && tentativesUtilisees > 0 ? diagnostiquerResolutionAvecX(exercice, valeur) : undefined;
  const consigneGlobale = consigneGlobaleColinearite(exercice);

  return (
    <div>
      {consigneGlobale && <p className="prompt-text">{consigneGlobale}</p>}
      <div className="equation-box">
        <Katex expression={formatEquationReduiteLatex(exercice)} />
      </div>
      <p className="prompt-text">Résous cette équation.</p>

      <div className="field field-inline">
        <label className="field-label" htmlFor="colinearite-resolutionavecx-x">
          x =
        </label>
        <input
          id="colinearite-resolutionavecx-x"
          className={`text-input${statut !== undefined && statut !== "correct" ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_SOLUTION_X}
          value={texte}
          onChange={(e) => setTexte(filtrerSaisieNumerique(e.target.value))}
          onKeyDown={gererKeyDownNumerique}
        />
      </div>

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(valeur)}>
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
