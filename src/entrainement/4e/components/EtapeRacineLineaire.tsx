import { useState } from "react";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";

interface Props {
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  /** L'inéquation complète (encadré principal, toujours affichée — voir AppSignesProduit.tsx).
   * Devenu optionnel avec l'ajout de `expressionAfficheeTermes` ci-dessous — au moins l'un des deux
   * doit être fourni par l'appelant (garanti côté `AppSignesProduit.tsx`, seul consommateur). */
  expressionAffichee?: string;
  /** Version "bloc fitter" de `expressionAffichee` (`promptblocfittertousgenerateurs.md`) — un
   * fragment KaTeX par facteur parenthésé plutôt qu'une seule chaîne, pour un retour à la ligne
   * propre sur mobile étroit. Prioritaire sur `expressionAffichee` quand fourni. */
  expressionAfficheeTermes?: string[];
  /** Le facteur linéaire isolé courant, ex. "3x + 3 = 0" (encadré "état actuel"). */
  etatActuel: string;
  onValider: (racine: number) => void;
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
  expressionAffichee,
  expressionAfficheeTermes,
  etatActuel,
  onValider,
}: Props) {
  const [reponse, setReponse] = useState("");

  const nombreSaisi = Number(reponse.trim().replace(",", "."));
  const valide = reponse.trim() !== "" && Number.isFinite(nombreSaisi);

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      {expressionAfficheeTermes !== undefined ? (
        <div className="equation-box equation-box-termes">
          {expressionAfficheeTermes.map((terme, i) => (
            <Katex key={i} expression={terme} />
          ))}
        </div>
      ) : (
        <div className="equation-box">
          <Katex expression={expressionAffichee ?? ""} block />
        </div>
      )}
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
      <button type="button" className="btn btn-primary" disabled={!valide} onClick={() => onValider(nombreSaisi)}>
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
