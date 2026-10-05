/**
 * Géométrie pure du graphe Mafs illustratif de "Distance point-droite et droite-droite"
 * (`promptgen47modifications.md`, points 3/7/10) — représente à l'échelle réelle les droites/
 * points de l'instance courante, jamais assez précis pour lire la réponse directement dessus
 * (aucun marqueur de point entier supplémentaire, contrairement à "Lecture graphique — équation
 * d'une droite" dont c'est justement l'objectif). Réutilise `pointDepuisImpliciteDroite`
 * (`moteur/verificationDroite.ts`, module frère — src/ui/ peut dépendre de src/moteur/) pour
 * ancrer chaque droite tracée, et `calculerViewBoxVecteurs` (`ui/vecteurGraph.ts`, chapitre 4,
 * réutilisation cross-chapitre déjà établie : ces deux modules sont de simples utilitaires
 * `Point`/`Composantes` génériques, sans aucune connaissance de leur chapitre d'origine).
 */
import type { DroiteImplicite } from "../core/droite.types";
import type { Point } from "../core/vecteur.types";
import { pointDepuisImpliciteDroite } from "../moteur/verificationDroite";
import { calculerViewBoxVecteurs } from "./vecteurGraph";
import type { PointAffiche } from "./vecteurGraph";

export interface LigneAffichee {
  droite: DroiteImplicite;
  label: string;
  couleur: string;
}

/** Angle du vecteur directeur `(-b ; a)` — universellement correct y compris pour une droite
 * verticale/horizontale, même principe que `LectureGraphiqueDroiteGraph.tsx`. */
export function anglePenteDroite(droite: DroiteImplicite): number {
  return Math.atan2(droite.a, -droite.b);
}

/** Fraction du plus petit côté du viewBox utilisée comme décalage perpendiculaire — proportionnel à
 * l'échelle réellement affichée (jamais une constante absolue en unités du repère, qui serait
 * imperceptible sur un graphe à grande échelle et disproportionnée sur un petit — voir
 * `pointEtiquetteDroite`). */
const FRACTION_DECALAGE_PERPENDICULAIRE = 0.06;

/**
 * Point où placer le LABEL d'une droite sur le graphe — jamais l'ancrage canonique
 * (`pointDepuisImpliciteDroite`, le point de la droite le plus proche de l'ORIGINE) : cet ancrage
 * est systématiquement voisin des graduations des axes (chevauchement direct), et peut tomber hors
 * du viewBox réellement affiché une fois les deux droites éloignées l'une de l'autre (`d_1`/`d_2`
 * peuvent être à des dizaines d'unités de l'origine). Calcule à la place le point de la droite le
 * plus proche du CENTRE du viewBox (projection orthogonale) — reste dans la zone visible par
 * construction, loin de la zone encombrée par les graduations près de l'origine — puis le décale
 * perpendiculairement à la droite (le long de sa normale `(a,b)`), d'une fraction de l'échelle
 * réelle du viewBox, pour que le texte se pose À CÔTÉ du trait plutôt que dessus.
 */
export function pointEtiquetteDroite(droite: DroiteImplicite, viewBox: { x: [number, number]; y: [number, number] }): Point {
  const centre = { x: (viewBox.x[0] + viewBox.x[1]) / 2, y: (viewBox.y[0] + viewBox.y[1]) / 2 };
  const normeNormaleCarre = droite.a * droite.a + droite.b * droite.b || 1;
  // Projection orthogonale de `centre` sur la droite ax+by+c=0.
  const residu = droite.a * centre.x + droite.b * centre.y + droite.c;
  const projection = { x: centre.x - (residu * droite.a) / normeNormaleCarre, y: centre.y - (residu * droite.b) / normeNormaleCarre };

  const largeur = Math.abs(viewBox.x[1] - viewBox.x[0]);
  const hauteur = Math.abs(viewBox.y[1] - viewBox.y[0]);
  const echelle = Math.min(largeur, hauteur) || Math.max(largeur, hauteur) || 1;
  const decalage = echelle * FRACTION_DECALAGE_PERPENDICULAIRE;
  const normeNormale = Math.sqrt(normeNormaleCarre);

  return {
    x: projection.x + (droite.a / normeNormale) * decalage,
    y: projection.y + (droite.b / normeNormale) * decalage,
  };
}

/** Calcule le viewBox couvrant toutes les droites (via un point d'ancrage réel sur chacune) et les
 * points supplémentaires (P, Q) actuellement affichés — jamais un cadrage figé qui laisserait un
 * élément hors champ une fois b/Q révélés. */
export function viewBoxDistanceDroite(lignes: LigneAffichee[], pointsSupplementaires: Point[]): { x: [number, number]; y: [number, number] } {
  const points: PointAffiche[] = [
    ...lignes.map((l) => ({ point: pointDepuisImpliciteDroite(l.droite), label: "" })),
    ...pointsSupplementaires.map((p) => ({ point: p, label: "" })),
  ];
  return calculerViewBoxVecteurs(points);
}
