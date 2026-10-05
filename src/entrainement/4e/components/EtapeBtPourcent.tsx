import { useState } from "react";
import type { ExerciceSynthese } from "../core/exerciceSynthese.types";
import { diagnostiquerBtPourcent } from "../moteur/verificationExerciceSynthese";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import {
  consigneBtPourcent,
  formatEnonceTexte,
  formatEtatActuelIntervalleBTLatex,
  libelleBoutonAide,
  texteAideBtPourcentNiveau1,
} from "../ui/formatExerciceSynthese";
import { formatMessageErreur } from "../ui/messageErreur";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceSynthese;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
}

const MAX = 1;

/**
 * Écran "btPourcent" (dernier écran de la séquence, "gen37 adaptée") — un seul champ, le
 * pourcentage minimal garanti $1-1/k^2$, toujours exactement 75 pour $k=2$. L'intervalle CONFIRMÉ
 * à l'écran précédent est rappelé via `EtatActuelPanel`, jamais resaisi.
 */
export function EtapeBtPourcent({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [texte, setTexte] = useState("");
  const complet = texte.trim() !== "";
  const statut = complet && tentativesUtilisees > 0 ? diagnostiquerBtPourcent(exercice, texte) : undefined;

  return (
    <div>
      <div className="equation-box">
        <p className="prompt-text">{formatEnonceTexte(exercice)}</p>
      </div>
      <EtatActuelPanel latex={formatEtatActuelIntervalleBTLatex(exercice)} />
      <p className="prompt-text">{consigneBtPourcent()}</p>

      <div className="field field-inline">
        <label className="field-label" htmlFor="synthese-bt-pourcent">
          % minimal =
        </label>
        <input
          id="synthese-bt-pourcent"
          className={`text-input${statut !== undefined && statut !== "correct" ? " is-erronee" : ""}`}
          placeholder="ex : 75"
          value={texte}
          onChange={(e) => setTexte(filtrerSaisieNumerique(e.target.value))}
          onKeyDown={gererKeyDownNumerique}
        />
      </div>

      {niveauAide >= 1 && (
        <div className="triangle-quelconque-aide">
          <p>{texteAideBtPourcentNiveau1(exercice).texte}</p>
          <Katex expression={texteAideBtPourcentNiveau1(exercice).latex} block />
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={niveauAide >= MAX} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, MAX)}
      </button>

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
