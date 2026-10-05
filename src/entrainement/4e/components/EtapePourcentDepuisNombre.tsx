import { useState } from "react";
import type {
  ExerciceBienaymeTchebychevNombreVersIntervalle,
  ExerciceBienaymeTchebychevNombreVersSigma,
  ExerciceBienaymeTchebychevNombreVersXBar,
} from "../core/bienaymeTchebychev.types";
import { diagnostiquerPourcentDepuisNombre } from "../moteur/verificationBienaymeTchebychev";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { PRECISION_POURCENT_INTERMEDIAIRE } from "../ui/formatBienaymeTchebychev";
import { formatMessageErreur } from "../ui/messageErreur";
import { EnonceBienaymeTchebychev } from "./EnonceBienaymeTchebychev";

type Exercice = ExerciceBienaymeTchebychevNombreVersIntervalle | ExerciceBienaymeTchebychevNombreVersSigma | ExerciceBienaymeTchebychevNombreVersXBar;

interface Props {
  exercice: Exercice;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (texte: string) => void;
}

/** Rôle "pourcentage minimal depuis un nombre d'individus donné" (v4Pourcent0, v7Pourcent0,
 * v8Pourcent0) — toujours le PREMIER écran de sa variante (n et le nombre minimal sont déjà dans
 * l'énoncé), AUCUNE aide (même convention "max=0 → pas de bouton"). */
export function EtapePourcentDepuisNombre({ exercice, tentativesUtilisees, tentativesMax, onValider }: Props) {
  const [texte, setTexte] = useState("");
  const complet = texte.trim() !== "";
  const statut = complet && tentativesUtilisees > 0 ? diagnostiquerPourcentDepuisNombre(exercice, texte) : undefined;

  return (
    <div>
      <EnonceBienaymeTchebychev exercice={exercice} />
      <p className="prompt-text">Quel est le pourcentage minimal correspondant à ce nombre d'individus ? ({PRECISION_POURCENT_INTERMEDIAIRE})</p>

      <div className="field field-inline">
        <label className="field-label" htmlFor="bienayme-pourcent-depuis-nombre">
          % minimal =
        </label>
        <input
          id="bienayme-pourcent-depuis-nombre"
          className={`text-input${statut !== undefined && statut !== "correct" ? " is-erronee" : ""}`}
          placeholder="ex : 75,5"
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
