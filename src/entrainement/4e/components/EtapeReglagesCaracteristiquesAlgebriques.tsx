import { useState } from "react";
import type { FamilleReference, ModeSelectionFamilles, ReglagesFamillesFonctionReference } from "../core/fonctionsReference.types";
import type { NiveauCaracteristiquesAlgebriques } from "../core/caracteristiquesAlgebriques.types";
import { OPTIONS_FAMILLE } from "../ui/famillesReferenceLabels";

interface Props {
  onCommencer: (reglages: ReglagesFamillesFonctionReference, niveau: NiveauCaracteristiquesAlgebriques) => void;
}

function quantitesInitiales(): Record<FamilleReference, number> {
  return { carre: 0, cube: 0, racine_carree: 0, racine_cubique: 0, inverse: 0, valeur_absolue: 0 };
}

/**
 * Écran de réglage professeur (spec section 2 : "réutilise le principe déjà construit pour
 * 'Transformations graphiques — fonctions de référence'") — copie conforme de
 * `EtapeReglagesFonctionsReference.tsx` (dixième exercice), même mécanisme (mode "Aléatoire"/
 * "Personnalisé", 0 à 20 exercices par famille) sur le même contrat
 * `ReglagesFamillesFonctionReference` réutilisé tel quel, complété par un toggle "Niveau 1"/
 * "Niveau 2" (`prompt-niveau2caracteristiquesalgebriques.md`) — s'applique uniformément à toute la
 * série (voir `creerGenerateurCaracteristiquesAlgebriques`), jamais un mélange niveau 1/niveau 2.
 */
export function EtapeReglagesCaracteristiquesAlgebriques({ onCommencer }: Props) {
  const [mode, setMode] = useState<ModeSelectionFamilles>("aleatoire");
  const [quantites, setQuantites] = useState<Record<FamilleReference, number>>(quantitesInitiales);
  const [niveau, setNiveau] = useState<NiveauCaracteristiquesAlgebriques>("niveau1");

  const total = OPTIONS_FAMILLE.reduce((somme, { valeur }) => somme + quantites[valeur], 0);
  const peutCommencer = mode === "aleatoire" || total > 0;

  function changerQuantite(famille: FamilleReference, valeur: string) {
    const n = Number(valeur);
    const bornee = Number.isFinite(n) ? Math.min(20, Math.max(0, Math.trunc(n))) : 0;
    setQuantites((precedent) => ({ ...precedent, [famille]: bornee }));
  }

  return (
    <div>
      <p className="prompt-text">Choisis le niveau : k constant (niveau 1) ou k(x) = cx+d, du 1er degré (niveau 2).</p>
      <div className="options-grid" style={{ marginBottom: 16 }}>
        <button type="button" className={niveau === "niveau1" ? "btn toggle-active" : "btn"} onClick={() => setNiveau("niveau1")}>
          Niveau 1
        </button>
        <button type="button" className={niveau === "niveau2" ? "btn toggle-active" : "btn"} onClick={() => setNiveau("niveau2")}>
          Niveau 2
        </button>
      </div>

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
        <div>
          <p className="prompt-text">Nombre d'exercices par famille (0 à 20) :</p>
          {OPTIONS_FAMILLE.map(({ valeur, libelle }) => (
            <div className="field field-inline" key={valeur}>
              <label className="field-label" htmlFor={`quantite-alg-${valeur}`}>
                {libelle}
              </label>
              <input
                id={`quantite-alg-${valeur}`}
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

      <button
        type="button"
        className="btn btn-primary"
        disabled={!peutCommencer}
        onClick={() => onCommencer({ mode, quantites }, niveau)}
      >
        Commencer
      </button>
    </div>
  );
}
