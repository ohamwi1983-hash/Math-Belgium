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
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

type Exercice = ExerciceBienaymeTchebychevNombreVersIntervalle | ExerciceBienaymeTchebychevNombreVersSigma | ExerciceBienaymeTchebychevNombreVersXBar;

interface Props {
  exercice: Exercice;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (texte: string) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Rôle "pourcentage minimal depuis un nombre d'individus donné" (v4Pourcent0, v7Pourcent0,
 * v8Pourcent0) — toujours le PREMIER écran de sa variante (n et le nombre minimal sont déjà dans
 * l'énoncé), AUCUNE aide (même convention "max=0 → pas de bouton"). */
export function EtapePourcentDepuisNombre({ exercice, tentativesUtilisees, tentativesMax, onValider, validation}: Props) {
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
