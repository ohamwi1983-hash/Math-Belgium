import { useState } from "react";
import type { FamilleReference, ModeSelectionFamilles, ReglagesFamillesFonctionReference } from "../core/fonctionsReference.types";
import { OPTIONS_FAMILLE } from "../ui/famillesReferenceLabels";

interface Props {
  onCommencer: (reglages: ReglagesFamillesFonctionReference) => void;
}

function quantitesInitiales(): Record<FamilleReference, number> {
  return { carre: 0, cube: 0, racine_carree: 0, racine_cubique: 0, inverse: 0, valeur_absolue: 0 };
}

/**
 * Écran de réglage professeur (`prompt-reglage-nombre-par-famille.md`) — précède l'écran de
 * reconnaissance, seul écran de ce générateur avant cette étape. Deux modes : "Aléatoire" (défaut,
 * comportement historique inchangé) et "Personnalisé" (un nombre d'exercices par famille, entre 0
 * et 20 — le nombre total de la série se déduit de leur somme, aucun réglage séparé). Le bouton
 * "Commencer" est désactivé en mode personnalisé tant qu'aucune famille n'a de quantité positive
 * (série vide, cas dégénéré).
 */
export function EtapeReglagesFonctionsReference({ onCommencer }: Props) {
  const [mode, setMode] = useState<ModeSelectionFamilles>("aleatoire");
  const [quantites, setQuantites] = useState<Record<FamilleReference, number>>(quantitesInitiales);

  const total = OPTIONS_FAMILLE.reduce((somme, { valeur }) => somme + quantites[valeur], 0);
  const peutCommencer = mode === "aleatoire" || total > 0;

  function changerQuantite(famille: FamilleReference, valeur: string) {
    const n = Number(valeur);
    const bornee = Number.isFinite(n) ? Math.min(20, Math.max(0, Math.trunc(n))) : 0;
    setQuantites((precedent) => ({ ...precedent, [famille]: bornee }));
  }

  return (
    <div>
      <p className="prompt-text">Choisis comment les familles d'exercices sont sélectionnées pour cette série.</p>

      <div className="options-grid" style={{ marginBottom: 16 }}>
        <button type="button" className={mode === "aleatoire" ? "btn toggle-active" : "btn"} onClick={() => setMode("aleatoire")}>
          Aléatoire
        </button>
        <button type="button" className={mode === "personnalise" ? "btn toggle-active" : "btn"} onClick={() => setMode("personnalise")}>
          Personnalisé
        </button>
      </div>

      {mode === "aleatoire" ? (
        <p className="prompt-text">Tirage uniforme parmi les 6 familles à chaque exercice.</p>
      ) : (
        <div className="contenu-conditionnel">
          <p className="prompt-text">Nombre d'exercices par famille (0 à 20) :</p>
          {OPTIONS_FAMILLE.map(({ valeur, libelle }) => (
            <div className="field field-inline" key={valeur}>
              <label className="field-label" htmlFor={`quantite-${valeur}`}>
                {libelle}
              </label>
              <input
                id={`quantite-${valeur}`}
                className="text-input"
                type="number"
                min={0}
                max={20}
                value={quantites[valeur]}
                onChange={(e) => changerQuantite(valeur, e.target.value)}
              />
            </div>
          ))}
          <p className="prompt-text">Total : {total} exercice{total > 1 ? "s" : ""}.</p>
        </div>
      )}

      <button type="button" className="btn btn-primary" disabled={!peutCommencer} onClick={() => onCommencer({ mode, quantites })}>
        Commencer
      </button>
    </div>
  );
}
