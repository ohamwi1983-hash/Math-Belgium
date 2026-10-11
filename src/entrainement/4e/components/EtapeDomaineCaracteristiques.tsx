import { useState } from "react";
import type { ExerciceCaracteristiquesFonction } from "../core/caracteristiquesFonction.types";
import type { Morceau } from "../core/inequation.types";
import { construireListe, etatListeInitiale } from "../ui/listeMorceaux";
import { morceauxCompletsPourSurlignage } from "../ui/surlignageCaracteristiques";
import { ListeMorceauxInput } from "./ListeMorceauxInput";
import { MafsGraphCaracteristiquesFonction } from "./MafsGraphCaracteristiquesFonction";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

interface Props {
  exercice: ExerciceCaracteristiquesFonction;
  tentativesUtilisees: number;
  tentativesMax: number;
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
 * autour de la question, ni l'indication qui l'accompagnait. Surlignage en temps réel (refonte 2,
 * correction 3) sur le graphique.
 */
export function EtapeDomaineCaracteristiques({ exercice, tentativesUtilisees, tentativesMax, onValider, validation}: Props) {
  const [liste, setListe] = useState(etatListeInitiale());
  const reponse = construireListe(liste);

  return (
    <div>
      <MafsGraphCaracteristiquesFonction exercice={exercice} surlignage={morceauxCompletsPourSurlignage(liste)} />
      <p className="prompt-text">Quel est le domaine de définition de cette fonction ?</p>
      <ListeMorceauxInput etat={liste} onChange={setListe} />
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
