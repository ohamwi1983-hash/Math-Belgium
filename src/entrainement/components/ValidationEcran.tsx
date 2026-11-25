import type { ReactNode } from "react";
import { CorrigeDepliable } from "./CorrigeDepliable";

/**
 * Forme PARTAGÉE du prop `validation` de chaque composant d'écran (`EtapeXxx.tsx`) — toujours
 * EXACTEMENT cette forme, jamais redéfinie localement par générateur, pour que le câblage dans
 * chaque `EtapeXxx.tsx` reste un snippet identique partout (seule la construction de la valeur,
 * côté `AppXxx.tsx`, varie par générateur).
 */
export interface ValidationEtapeProps {
  /** `true` si la réponse a été révélée (tentatives épuisées sans bonne réponse), `false` si
   * l'élève a répondu correctement. */
  revele: boolean;
  /** Réponse(s) attendue(s) — DÉJÀ construite (fragments KaTeX ou autre) par `AppXxx.tsx`, jamais
   * formatée ici ; affichée uniquement si `revele`. Absente quand l'écran n'a pas de réponse
   * "attendue" représentable (ex. QCM). */
  reponseAttendue?: ReactNode;
  labelSuivant: string;
  onSuivant: () => void;
  /** Optionnel (rétrocompatible) : message affiché à la place de « Tentatives épuisées — … » quand
   * l'écran a été clos AVANT d'épuiser les tentatives (verdict fermé faux, qui ne se rejoue pas). */
  messageRevele?: ReactNode;
  /** Optionnel (rétrocompatible) : corrigé détaillé « comme au tableau » de l'étape — les MÊMES lignes
   * que le corrigé papier (`correctionDetaillee` de l'adaptateur, rendu `CorrigeDetailleEcran.tsx`).
   * Écran révélé : affiché sous la réponse attendue. Bonne réponse : replié derrière « Voir comment
   * on y arrive » (`CorrigeDepliable`, décision du 25/11/2026). Jamais avant la réponse (ce bloc
   * n'existe qu'une fois l'écran clos). Le MÊME nœud va dans l'entrée d'historique de l'étape
   * (`EntreeHistoriqueEtape.corrigeDetaille`) pour la fiche de sa puce. */
  corrigeDetaille?: ReactNode;
  /** Optionnel (rétrocompatible) : figure montrée une fois l'écran validé, réussi OU révélé (ex. 4e
   * ch. 2 : courbe et tableau de signes de gen5/gen6). */
  figureApres?: ReactNode;
}

type Props = ValidationEtapeProps;

/**
 * Bloc de validation inline — remplace le bouton "Valider" une fois l'écran terminé (bonne réponse,
 * ou tentatives épuisées), à la place d'un écran de résultat séparé (plus de `ResultatPanelXxx`/
 * `ResumeSessionXxx` — convention CLAUDE.md, "validation/invalidation avant de passer à l'écran
 * suivant"). Partagé par 4e/5e-4h/6e-6h (comme `BoutonExportWord.tsx`), jamais dupliqué par niveau.
 */
export function ValidationEcran({ revele, reponseAttendue, labelSuivant, onSuivant, messageRevele, corrigeDetaille, figureApres }: Props) {
  // Refonte du 22/11/2026 (maquette D) : verdict et réponse attendue dans UN SEUL encadré ; le bouton
  // (`validation-suivant`) devient, sur téléphone, la barre fixe du bas (voir `CadreActions.tsx`).
  // Textes, ordre et libellé du bouton (`labelSuivant`) inchangés.
  return (
    <div className="validation-ecran">
      <div className={`validation-verdict ${revele ? "validation-verdict-revele" : "validation-verdict-juste"}`}>
        <p className={revele ? "alert-error" : "alert-success"} role="alert">
          {revele ? (messageRevele ?? "Tentatives épuisées — ce n'était pas la bonne réponse.") : "Bonne réponse !"}
        </p>
        {revele && reponseAttendue && (
          <div className="validation-reponse-attendue">
            <p className="validation-reponse-attendue-label">Réponse attendue :</p>
            {reponseAttendue}
          </div>
        )}
      </div>
      {figureApres}
      {revele ? corrigeDetaille : <CorrigeDepliable corrige={corrigeDetaille} />}
      <button type="button" className="btn btn-primary validation-suivant" onClick={onSuivant}>
        {labelSuivant}
      </button>
    </div>
  );
}
