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
 * Étape "intervalles de décroissance stricte" (question c, refonte point 5) : même construction à
 * liste extensible que le domaine (bouton "+"), le nombre réel de morceaux étant détecté par la
 * vérification plutôt que supposé fixe — JAMAIS exactement 2 morceaux fixes (correction du
 * symptôme B, refonte 2) : dynamique selon le signe de k (zones 6/7 décroissantes ou non) et la
 * direction du saut en b5 (voir decroissanceAttendueCaracteristiques), de 2 à 4 morceaux. `liste`
 * est remontée à `AppCaracteristiquesFonction`, qui en dérive le surlignage en temps réel du
 * graphe centralisé dans `blocDonnees` — plus rendu localement ici.
 */
export function EtapeDecroissanceCaracteristiques({ tentativesUtilisees, tentativesMax, liste, onChangeListe, onValider, validation}: Props) {
  const reponse = construireListe(liste);

  return (
    <div>
      <p className="prompt-text">Sur quels intervalles cette fonction est-elle strictement décroissante ?</p>
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
