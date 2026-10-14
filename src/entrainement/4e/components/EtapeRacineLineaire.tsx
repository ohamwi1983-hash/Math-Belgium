import { useState } from "react";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

interface Props {
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  /** Le facteur linéaire isolé courant, ex. "3x + 3 = 0" (encadré "état actuel"). */
  etatActuel: string;
  onValider: (racine: number) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Étape "Racine (facteur linéaire)" (promptgenerateur5signesProduit.md, point 10) : un facteur
 * linéaire donné tel quel n'a rien à factoriser, mais l'élève doit tout de même calculer sa racine
 * explicitement avant qu'elle n'apparaisse dans le tableau de signes — jusqu'ici sautée à tort.
 * Un seul champ (toujours exactement une racine pour un facteur du 1er degré, jamais le pattern
 * "Pas de/Au moins un(e)" réservé aux cas à cardinalité variable) — champ purement numérique, hors
 * périmètre "parse_error" (AUDIT-comparaison-reponses.md) : le bouton reste désactivé tant que la
 * saisie n'est pas un nombre fini, empêchant toute soumission invalide plutôt que d'afficher un
 * message dédié.
 */
export function EtapeRacineLineaire({
  tentativesUtilisees,
  tentativesMax,
  recapitulatif,
  etatActuel,
  onValider,
  validation,
}: Props) {
  const [reponse, setReponse] = useState("");

  const nombreSaisi = Number(reponse.trim().replace(",", "."));
  const valide = reponse.trim() !== "" && Number.isFinite(nombreSaisi);

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      <EtatActuelPanel latex={etatActuel} />
      <p className="prompt-text">Quelle est la racine de ce facteur ?</p>
      <div className="field">
        <label className="field-label" htmlFor="racine-lineaire">
          Racine
        </label>
        <input
          id="racine-lineaire"
          className="text-input"
          value={reponse}
          onChange={(e) => setReponse(e.target.value)}
        />
      </div>
      {!validation && (
        <>
        <button type="button" className="btn btn-primary" disabled={!valide} onClick={() => onValider(nombreSaisi)}>
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
