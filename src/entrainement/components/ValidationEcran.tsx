import type { ReactNode } from "react";

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
  /** Optionnel (rétrocompatible) : corrigé détaillé « comme au tableau » de l'étape, affiché sous la
   * réponse attendue quand elle est révélée — les MÊMES lignes que le corrigé papier
   * (`correctionDetaillee` de l'adaptateur, rendu `CorrigeDetailleEcran.tsx`). */
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
  return (
    <div className="validation-ecran">
      <p className={revele ? "alert-error" : "alert-success"} role="alert">
        {revele ? (messageRevele ?? "Tentatives épuisées — ce n'était pas la bonne réponse.") : "Bonne réponse !"}
      </p>
      {revele && reponseAttendue && (
        <div className="validation-reponse-attendue">
          <p className="validation-reponse-attendue-label">Réponse attendue :</p>
          {reponseAttendue}
        </div>
      )}
      {figureApres}
      {revele && corrigeDetaille}
      <button type="button" className="btn btn-primary" onClick={onSuivant}>
        {labelSuivant}
      </button>
    </div>
  );
}
