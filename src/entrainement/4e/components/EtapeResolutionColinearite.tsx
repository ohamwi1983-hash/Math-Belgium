import { useState } from "react";
import type { ExerciceColinearParametre } from "../core/colinearite.types";
import { diagnostiquerResolutionAvecX } from "../moteur/verificationColinearite";
import { PLACEHOLDER_SOLUTION_X, consigneGlobaleColinearite, formatEnonceLatex, formatEquationReduiteLatex } from "../ui/formatColinearite";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { formatMessageErreur } from "../ui/messageErreur";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceColinearParametre;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (valeur: number) => void;
}

/**
 * Écran "resolution" — V2-écran2 (variante "parametre"), dernière phase. Depuis
 * `promptcorrectionsgenerateur24lot3.md`, point 2 : réécrit pour rejoindre exactement le patron déjà
 * en place pour "resolutionAvecX" (V4, `EtapeResolutionAvecXColinearite.tsx`) — cette variante
 * garantit désormais toujours exactement une solution (voir `generateurs/colinearite/index.ts`), un
 * simple champ numérique `x =` remplace l'ancienne interface à 3 états (Aucune/Une/Une infinité de
 * solutions).
 *
 * **Aucun bouton "Aide"** (`NIVEAU_AIDE_MAX_RESOLUTION = 0` — retire l'aide générique de résolution,
 * sans valeur ajoutée pour un simple champ `x=`, même convention que "resolutionAvecX").
 *
 * `promptgen24modificationscompletes.md` : bloc de données redondant (composantes de $\vec u$/
 * $\vec v$, `formatEnonceLatex`) ajouté au-dessus — le bloc violet existant (équation réduite
 * validée à l'écran précédent) devient conceptuellement le bloc "état actuel", aucun changement
 * structurel de son propre rendu (structure miroir de `EtapeResolutionParametreOrthogonalite.tsx`,
 * générateur 25).
 */
export function EtapeResolutionColinearite({ exercice, tentativesUtilisees, tentativesMax, onValider }: Props) {
  const [texte, setTexte] = useState("");

  const valeur = Number(texte.replace(",", "."));
  const complet = texte.trim() !== "";
  const statut = complet && tentativesUtilisees > 0 ? diagnostiquerResolutionAvecX(exercice, valeur) : undefined;
  const consigneGlobale = consigneGlobaleColinearite(exercice);

  return (
    <div>
      {consigneGlobale && <p className="prompt-text">{consigneGlobale}</p>}
      <div className="equation-box">
        <Katex expression={formatEnonceLatex(exercice)} />
      </div>
      <div className="equation-box">
        <Katex expression={formatEquationReduiteLatex(exercice)} />
      </div>
      <p className="prompt-text">Résous cette équation.</p>

      <div className="field field-inline">
        <label className="field-label" htmlFor="colinearite-resolution-x">
          x =
        </label>
        <input
          id="colinearite-resolution-x"
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
