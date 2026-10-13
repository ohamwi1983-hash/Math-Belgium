import { useState, type ReactNode } from "react";

interface Props {
  /** `true` sur le tout premier écran d'un exercice (calculé une fois par l'App, voir
   * `estPremierEcran` dans un `AppXxx.tsx`), `false` sur tous les écrans suivants du même
   * exercice. */
  estPremierEcran: boolean;
  consigneGenerale: string;
  blocDonnees: ReactNode;
}

/**
 * Système "plein puis compact" (option 1B retenue) : la consigne générale + le bloc de données
 * s'affichent en entier au premier écran, puis se replient en bandeau compact dépliable sur les
 * écrans suivants du même exercice — évite de répéter le même contexte en entier à chaque écran.
 * Composant dupliqué par chantier (convention CLAUDE.md), identique en 5e-4h/6e-6h.
 */
export function EnTeteExercice({ estPremierEcran, consigneGenerale, blocDonnees }: Props) {
  const [deplie, setDeplie] = useState(false);

  if (estPremierEcran) {
    return (
      <div className="entete-exercice">
        <p className="prompt-text">{consigneGenerale}</p>
        {blocDonnees}
      </div>
    );
  }

  return (
    <div className="entete-exercice entete-exercice-compacte">
      <button type="button" className="entete-exercice-toggle" aria-expanded={deplie} onClick={() => setDeplie((v) => !v)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width="13" height="13" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
        <span>{consigneGenerale}</span>
      </button>
      {deplie && <div className="entete-exercice-contenu">{blocDonnees}</div>}
    </div>
  );
}
