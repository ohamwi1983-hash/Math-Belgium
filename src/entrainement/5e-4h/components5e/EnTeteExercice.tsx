import { useState } from "react";
import type { ReactNode } from "react";
import { estClos, useEtatCadre } from "../../components/cadreGenerateur";

interface Props {
  consigneGenerale: ReactNode;
  blocDonnees: ReactNode;
}

/**
 * En-tête d'écran partagé : consigne générale + bloc de données, toujours rendus en entier sur
 * CHAQUE écran de l'exercice (option 1A retenue). Composant dupliqué par chantier (convention
 * CLAUDE.md), identique en 4e/6e-6h.
 *
 * Refonte du 22/11/2026 (maquettes A et B) : carte sobre (fond blanc, bord fin) ; dès qu'un écran de
 * l'exercice est clos (segments publiés par `ProgressionPuces` dans le cadre de la page), l'énoncé se
 * REPLIE en une ligne — touche pour le déplier. Le contenu reste dans le DOM (seule la mise en page
 * change) ; sans progression publiée (générateur à un écran, quiz), il reste toujours déplié.
 */
export function EnTeteExercice({ consigneGenerale, blocDonnees }: Props) {
  const { segments } = useEtatCadre();
  const repliable = !!segments && segments.some(estClos);
  const [deplie, setDeplie] = useState(false);
  const replie = repliable && !deplie;
  return (
    <div className={`entete-exercice${repliable ? " entete-repliable" : ""}${replie ? " est-replie" : ""}`} onClick={replie ? () => setDeplie(true) : undefined}>
      {repliable ? (
        <button
          type="button"
          className="entete-exercice-bascule"
          aria-expanded={!replie}
          onClick={(e) => {
            e.stopPropagation();
            setDeplie((d) => !d);
          }}
        >
          <span className="entete-exercice-label">Énoncé</span>
          <span className="entete-exercice-chevron" aria-hidden="true" />
          <span className="sr-only">{replie ? " (afficher)" : " (replier)"}</span>
        </button>
      ) : (
        <p className="entete-exercice-label">Énoncé</p>
      )}
      <p className="prompt-text">{consigneGenerale}</p>
      {blocDonnees}
    </div>
  );
}
