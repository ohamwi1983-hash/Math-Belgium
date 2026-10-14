import type { Morceau } from "../core/inequation.types";
import { construireListe } from "../ui/listeMorceaux";
import type { EtatListeMorceaux } from "../ui/listeMorceaux";
import { ListeMorceauxInput } from "./ListeMorceauxInput";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

interface Props {
  tentativesUtilisees: number;
  tentativesMax: number;
  liste: EtatListeMorceaux;
  onChangeListe: (etat: EtatListeMorceaux) => void;
  onValider: (reponse: Morceau[]) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Étape "domaine de définition" (question a) : même composant générique de construction guidée
 * d'intervalle que partout ailleurs dans le projet (liste extensible "+ Ajouter un morceau", gère
 * déjà nativement ℝ, un intervalle, une union de plusieurs morceaux). Refonte 3, correction 1 :
 * l'élève construit désormais le domaine LUI-MÊME tel qu'il est (les morceaux où la fonction est
 * réellement définie), jamais son complémentaire — plus aucun texte d'habillage "ℝ \ (...)"
 * autour de la question, ni l'indication qui l'accompagnait. `liste` (état de la construction) est
 * remonté à `AppCaracteristiquesFonction`, qui en dérive le surlignage en temps réel du graphe
 * centralisé dans `blocDonnees` — plus rendu localement ici.
 */
export function EtapeDomaineCaracteristiques({ tentativesUtilisees, tentativesMax, liste, onChangeListe, onValider, validation}: Props) {
  const reponse = construireListe(liste);

  return (
    <div>
      <p className="prompt-text">Quel est le domaine de définition de cette fonction ?</p>
      <ListeMorceauxInput etat={liste} onChange={onChangeListe} />
      {!validation && (
        <>
        <button
          type="button"
          className="btn btn-primary"
          disabled={reponse === null}
          onClick={() => reponse !== null && onValider(reponse)}
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
