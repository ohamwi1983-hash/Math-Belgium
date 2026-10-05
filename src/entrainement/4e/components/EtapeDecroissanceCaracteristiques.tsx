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
 * Étape "intervalles de décroissance stricte" (question c, refonte point 5) : même construction à
 * liste extensible que le domaine (bouton "+"), le nombre réel de morceaux étant détecté par la
 * vérification plutôt que supposé fixe — JAMAIS exactement 2 morceaux fixes (correction du
 * symptôme B, refonte 2) : dynamique selon le signe de k (zones 6/7 décroissantes ou non) et la
 * direction du saut en b5 (voir decroissanceAttendueCaracteristiques), de 2 à 4 morceaux.
 * Surlignage en temps réel (refonte 2, correction 3) sur le graphique.
 */
export function EtapeDecroissanceCaracteristiques({ exercice, tentativesUtilisees, tentativesMax, onValider }: Props) {
  const [liste, setListe] = useState(etatListeInitiale());
  const reponse = construireListe(liste);

  return (
    <div>
      <MafsGraphCaracteristiquesFonction exercice={exercice} surlignage={morceauxCompletsPourSurlignage(liste)} />
      <p className="prompt-text">Sur quels intervalles cette fonction est-elle strictement décroissante ?</p>
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
