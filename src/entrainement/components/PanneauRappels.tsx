import type { ReactNode } from "react";
import { useLignesRappel } from "./cadreGenerateur";

export interface EntreeRappel {
  cle: string;
  libelle: ReactNode;
  valeur: ReactNode;
  /** Écran révélé (tentatives épuisées) — même champ `revele` qu'avant. */
  revele: boolean;
}

function Icone({ croix }: { croix: boolean }) {
  return croix ? (
    <svg className="recap-icone-svg" viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
      <path fill="currentColor" d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3z" />
    </svg>
  ) : (
    <svg className="recap-icone-svg" viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
      <path fill="currentColor" d="M4.3 12.5 9 17.2 19.7 6.5 18.3 5.1 9 14.4 5.7 11.1Z" />
    </svg>
  );
}

const TONS = { correcte: "réussi", aide: "réussi avec aide", revele: "réponse révélée" } as const;

/**
 * « Ce qu'on sait déjà » (maquette E, 22/11/2026) — une ligne par écran clos, toujours la valeur
 * CONFIRMÉE (jamais la saisie de l'élève, comme avant) : ✓ vert (juste), ✓ jaune (juste avec aide),
 * ✗ rouge (révélée). « Revoir › » (cible ≥ 48 px) ouvre la même `FicheReponseEcran` que le clic sur
 * la puce d'avant — seulement quand la correspondance ligne ↔ écran est sûre (`useLignesRappel`) et
 * que le générateur a une fiche ; sinon rien n'est inventé. Partagé par les `RecapitulatifPanel` des
 * trois chantiers et les socles d'écrans (`AppEcransTrigo`, `AppEcransExp`).
 */
export function PanneauRappels({ entrees }: { entrees: EntreeRappel[] }) {
  const lignes = useLignesRappel(entrees.map((e) => e.revele));
  if (entrees.length === 0) return null;
  return (
    <div className="recap-panel">
      <p className="recap-panel-titre">Ce qu'on sait déjà</p>
      <ul className="recap-list">
        {entrees.map((entree, index) => {
          const ligne = lignes[index] ?? { ton: entree.revele ? "revele" : "correcte" };
          return (
            <li key={entree.cle} className={`recap-item recap-item-${ligne.ton}`}>
              <span className={`recap-icone recap-icone-${ligne.ton === "revele" ? "revele" : "correcte"} recap-ton-${ligne.ton}`} title={TONS[ligne.ton]}>
                <Icone croix={ligne.ton === "revele"} />
                <span className="sr-only">{TONS[ligne.ton]} : </span>
              </span>
              <span className="recap-corps">
                <span className="recap-libelle">{entree.libelle} :</span> {entree.valeur}
                {ligne.ton === "revele" && <span className="recap-note">réponse corrigée</span>}
              </span>
              {ligne.revoir && (
                <button type="button" className="recap-revoir" onClick={ligne.revoir}>
                  Revoir <span aria-hidden="true">›</span>
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
