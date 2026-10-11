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
 * Étape "constance" (refonte 2, correction 7 — nouvelle question) : même construction à liste
 * extensible que la décroissance/croissance, le nombre réel de morceaux étant dynamique (1, 2 ou 3
 * selon le nombre de gaps de la zone 4 — voir constanceAttendueCaracteristiques). Surlignage en
 * temps réel (correction 3) sur le graphique, mis à jour à chaque interaction avec la liste.
 */
export function EtapeConstanceCaracteristiques({ exercice, tentativesUtilisees, tentativesMax, onValider, validation}: Props) {
  const [liste, setListe] = useState(etatListeInitiale());
  const reponse = construireListe(liste);

  return (
    <div>
      <MafsGraphCaracteristiquesFonction exercice={exercice} surlignage={morceauxCompletsPourSurlignage(liste)} />
      <p className="prompt-text">Sur quel(s) intervalle(s) cette fonction est-elle constante ?</p>
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
