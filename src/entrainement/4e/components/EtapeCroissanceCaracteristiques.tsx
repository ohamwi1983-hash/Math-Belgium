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
 * Étape "intervalles de croissance stricte" (refonte 2, correction 7 — nouvelle question) : même
 * construction à liste extensible que la décroissance (bouton "+"), le nombre réel de morceaux
 * étant dynamique (3 si k>0, 5 si k<0 — voir croissanceAttendueCaracteristiques) plutôt que
 * supposé fixe. `liste` est remontée à `AppCaracteristiquesFonction`, qui en dérive le surlignage
 * en temps réel du graphe centralisé dans `blocDonnees` — plus rendu localement ici.
 */
export function EtapeCroissanceCaracteristiques({ tentativesUtilisees, tentativesMax, liste, onChangeListe, onValider, validation}: Props) {
  const reponse = construireListe(liste);

  return (
    <div>
      <p className="prompt-text">Sur quels intervalles cette fonction est-elle strictement croissante ?</p>
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
