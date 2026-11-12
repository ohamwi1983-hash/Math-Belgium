import type { CourbeGraphique, PointGraphique } from "../core5e/composeeGraphique.types";
import type { CouleursGrapheComposee } from "../ui5e/composeeGraphiqueGraph";
import { svgGrapheComposee } from "../ui5e/composeeGraphiqueGraph";

interface Props {
  courbe: CourbeGraphique;
  couleurs: CouleursGrapheComposee;
  nom: string;
  /** Point à révéler (aide niveau 2) — nœud RÉEL de `courbe`, avec 2 pointillés vers les axes.
   * `null`/absent tant que l'aide n'a pas atteint ce palier. */
  pointRevele?: PointGraphique | null;
}

/**
 * Une seule courbe de 5gen4 (ligne brisée à nœuds de grille entiers) sur le cadre FIXE [−8 ; 8]² —
 * rendu SVG statique produit par `svgGrapheComposee` (le même que pour le papier), sans zoom ni
 * déplacement : la lecture EXACTE d'une valeur passe par le quadrillage à 1 unité, qui ne doit
 * jamais changer d'échelle (audit du chapitre 1 de 5e, décision G). Composant propre à 5gen4 (aucun
 * autre générateur ne l'utilise).
 */
export function CourbeGraph({ courbe, couleurs, nom, pointRevele }: Props) {
  return (
    <div className="courbe-graph-conteneur">
      <p className="courbe-graph-label">{nom}</p>
      <div className="courbe-graph-svg" dangerouslySetInnerHTML={{ __html: svgGrapheComposee(courbe, { couleurs, pointRevele, titre: `Graphe de ${nom}` }) }} />
    </div>
  );
}
