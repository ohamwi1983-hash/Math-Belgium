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
}

type Props = ValidationEtapeProps;

/**
 * Bloc de validation inline — remplace le bouton "Valider" une fois l'écran terminé (bonne réponse,
 * ou tentatives épuisées), à la place d'un écran de résultat séparé (plus de `ResultatPanelXxx`/
 * `ResumeSessionXxx` — convention CLAUDE.md, "validation/invalidation avant de passer à l'écran
 * suivant"). Partagé par 4e/5e-4h/6e-6h (comme `BoutonExportWord.tsx`), jamais dupliqué par niveau.
 */
export function ValidationEcran({ revele, reponseAttendue, labelSuivant, onSuivant }: Props) {
  return (
    <div className="validation-ecran">
      <p className={revele ? "alert-error" : "alert-success"} role="alert">
        {revele ? "Tentatives épuisées — ce n'était pas la bonne réponse." : "Bonne réponse !"}
      </p>
      {revele && reponseAttendue && (
        <div className="validation-reponse-attendue">
          <p className="validation-reponse-attendue-label">Réponse attendue :</p>
          {reponseAttendue}
        </div>
      )}
      <button type="button" className="btn btn-primary" onClick={onSuivant}>
        {labelSuivant}
      </button>
    </div>
  );
}
