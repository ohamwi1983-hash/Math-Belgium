import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

/**
 * Mesure la largeur réelle du conteneur (ResizeObserver) plutôt que de s'en remettre au
 * width="auto" interne de Mafs : on a besoin de cette même largeur pour calculer une HAUTEUR
 * proportionnelle (Mafs n'a pas de height="auto", contrairement à sa largeur) qui respecte
 * RATIO_GRAPHE quel que soit l'écran — voir le commentaire de RATIO_GRAPHE dans
 * mafsTransformation.ts pour la raison exacte pour laquelle ce ratio doit rester constant.
 * Partagée entre `MafsGraphTransformation.tsx` et `MafsGraphFormeCanoniqueTransformations.tsx` —
 * fichier séparé de `mafsGraphPartage.tsx` (qui n'exporte que le composant `GrilleAdaptative`) pour
 * que chaque fichier ne mélange jamais export de composant et export de hook (react-refresh).
 */
export function useLargeurConteneur<T extends HTMLElement>(): [RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [largeur, setLargeur] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const observer = new ResizeObserver((entries) => {
      setLargeur(entries[0].contentRect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, largeur];
}
