import type { ReactNode } from "react";

/**
 * Une entrée par étape déjà close de l'exercice en cours — construite par `AppXxx.tsx` au moment
 * où l'étape se termine (jamais recalculée après coup : la saisie de l'élève n'est conservée nulle
 * part ailleurs dans l'état de session, voir le commentaire de `ProgressionPuces.onSegmentClick`).
 */
export interface EntreeHistoriqueEtape {
  /** Nom de l'étape, ex. "Coefficients" — même libellé que le récapitulatif final quand il existe
   * déjà (`EntreeRecapitulatif.libelle`), pour ne jamais inventer un second vocabulaire. */
  titre: string;
  /** Ce que l'élève a tapé/choisi, déjà formaté (texte ou KaTeX). */
  votreReponse: ReactNode;
  /** `false` uniquement si révélée (tentatives épuisées) — même sémantique que
   * `EtatPuceProgression` ("correcte" ⟺ `!revele`), jamais recalculée différemment. */
  correcte: boolean;
  /** Réponse correcte — affichée uniquement si `!correcte` (inutile de la répéter quand l'élève
   * avait déjà la bonne réponse sous les yeux). */
  reponseAttendue?: ReactNode;
}

interface Props {
  entree: EntreeHistoriqueEtape;
  onFermer: () => void;
}

/**
 * Fiche de consultation en lecture seule d'un écran déjà clos — ouverte en cliquant une puce
 * "correcte"/"revele" de `ProgressionPuces` (maquette "A — Puces cliquables + fiche", choisie
 * après présentation de 3 propositions). Même chrome overlay/panneau que `CalculatriceScientifique`
 * (`.calculatrice-overlay`/`-panneau`) mais classes propres (`.fiche-reponse-*`) pour garder le nom
 * lisible, jamais les mêmes littéralement. Partagée 4e/5e-4h/6e-6h, comme `ValidationEcran`/
 * `ProgressionPuces` : jamais dupliquée par chantier.
 */
export function FicheReponseEcran({ entree, onFermer }: Props) {
  return (
    <div className="fiche-reponse-overlay" onClick={onFermer}>
      <div className="fiche-reponse-panneau" onClick={(e) => e.stopPropagation()}>
        <div className="fiche-reponse-entete">
          <p className="fiche-reponse-eyebrow">{entree.titre} · lecture seule</p>
          <span className={`fiche-reponse-badge ${entree.correcte ? "fiche-reponse-badge-correcte" : "fiche-reponse-badge-incorrecte"}`}>
            {entree.correcte ? "✓ Correct" : "✗ Incorrect"}
          </span>
        </div>

        <div className={`fiche-reponse-bloc ${entree.correcte ? "fiche-reponse-bloc-correcte" : "fiche-reponse-bloc-incorrecte"}`}>
          <p className="fiche-reponse-bloc-label">Ta réponse</p>
          <div className="fiche-reponse-bloc-valeur">{entree.votreReponse}</div>
        </div>

        {!entree.correcte && entree.reponseAttendue && (
          <div className="fiche-reponse-bloc fiche-reponse-bloc-attendue">
            <p className="fiche-reponse-bloc-label">Réponse attendue</p>
            <div className="fiche-reponse-bloc-valeur">{entree.reponseAttendue}</div>
          </div>
        )}

        <button type="button" className="btn btn-primary fiche-reponse-fermer" onClick={onFermer}>
          Fermer
        </button>
      </div>
    </div>
  );
}
