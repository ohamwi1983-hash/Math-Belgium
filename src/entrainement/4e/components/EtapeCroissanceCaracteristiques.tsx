import { useState } from "react";
import type { ExerciceCaracteristiquesFonction } from "../core/caracteristiquesFonction.types";
import type { Morceau } from "../core/inequation.types";
import { construireListe, etatListeInitiale } from "../ui/listeMorceaux";
import { morceauxCompletsPourSurlignage } from "../ui/surlignageCaracteristiques";
import { ListeMorceauxInput } from "./ListeMorceauxInput";
import { MafsGraphCaracteristiquesFonction } from "./MafsGraphCaracteristiquesFonction";

interface Props {
  exercice: ExerciceCaracteristiquesFonction;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (reponse: Morceau[]) => void;
}

/**
 * Étape "intervalles de croissance stricte" (refonte 2, correction 7 — nouvelle question) : même
 * construction à liste extensible que la décroissance (bouton "+"), le nombre réel de morceaux
 * étant dynamique (3 si k>0, 5 si k<0 — voir croissanceAttendueCaracteristiques) plutôt que
 * supposé fixe. Surlignage en temps réel (correction 3) sur le graphique, mis à jour à chaque
 * interaction avec la liste.
 */
export function EtapeCroissanceCaracteristiques({ exercice, tentativesUtilisees, tentativesMax, onValider }: Props) {
  const [liste, setListe] = useState(etatListeInitiale());
  const reponse = construireListe(liste);

  return (
    <div>
      <MafsGraphCaracteristiquesFonction exercice={exercice} surlignage={morceauxCompletsPourSurlignage(liste)} />
      <p className="prompt-text">Sur quels intervalles cette fonction est-elle strictement croissante ?</p>
      <ListeMorceauxInput etat={liste} onChange={setListe} />
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
    </div>
  );
}
