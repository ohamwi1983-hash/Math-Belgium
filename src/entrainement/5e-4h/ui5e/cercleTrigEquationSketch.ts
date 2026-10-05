/**
 * Couche présentation (5e) — géométrie du diagramme SVG "cercle trigonométrique" de 5gen10 (écran
 * 3). SVG sur mesure (jamais Mafs — principe déjà établi sur gen58 4e/5gen7, voir CLAUDE.md "Choix
 * du rendu graphique") : aucune coordonnée cartésienne n'est jamais lue par l'élève ici, seul le
 * placement ANGULAIRE des solutions compte — rayon PIXEL fixe (schématique), angle EXACT.
 *
 * Convention mathématique standard (θ=0 sur l'axe X+, sens ANTI-HORAIRE) — contrairement à
 * `ui5e/polygoneCercleSketch.ts` (5gen7, départ en haut, sens horaire, un contexte purement
 * décoratif sans lien avec le cercle trigonométrique réel) : ici l'angle affiché EST la solution
 * mathématique elle-même, la convention doit donc être la vraie convention trigonométrique.
 */
export const RAYON_PIXEL = 100;
export const CENTRE = { x: 130, y: 130 };
export const TAILLE_CADRE = 260;
const RAYON_LABEL = RAYON_PIXEL + 22;

export interface PointSVG {
  x: number;
  y: number;
}

/** y SVG croît vers le BAS — un angle θ mesuré dans le sens trigonométrique standard (anti-horaire)
 * se traduit donc par `y = CENTRE.y - RAYON·sin(θ)` (signe opposé à un simple `cos/sin` naïf). */
export function positionAngle(theta: number): PointSVG {
  return { x: CENTRE.x + RAYON_PIXEL * Math.cos(theta), y: CENTRE.y - RAYON_PIXEL * Math.sin(theta) };
}

export function positionLabelAngle(theta: number): PointSVG {
  return { x: CENTRE.x + RAYON_LABEL * Math.cos(theta), y: CENTRE.y - RAYON_LABEL * Math.sin(theta) };
}

/** Coordonnées pixel du path SVG — précision suffisante pour un rendu propre (n'affecte jamais une
 * valeur mathématique montrée à l'élève, voir D.1 pour l'arrondi d'AFFICHAGE des angles/décimales). */
function fmt(v: number): string {
  return v.toFixed(2);
}

/**
 * Construit le `d` d'un path SVG "secteur ombré" (pie wedge), du centre à `thetaDebut`, arc
 * jusqu'à `thetaFin` (sens ANTI-HORAIRE, cohérent avec `positionAngle`), retour au centre — nouveau
 * mode d'affichage pour 5gen13 (Type 3, inéquation trigonométrique), additif : ne change rien au
 * mode "points isolés" déjà utilisé par 5gen10/5gen11.
 *
 * `thetaFin` est normalisé pour rester ≥`thetaDebut` (ajout de 2π si besoin) — jamais un span
 * négatif, qui produirait un arc dans le mauvais sens.
 */
export function cheminArcOmbre(thetaDebut: number, thetaFin: number): string {
  let fin = thetaFin;
  while (fin < thetaDebut) fin += 2 * Math.PI;
  const span = fin - thetaDebut;
  const grandArc = span > Math.PI ? 1 : 0;
  const pDebut = positionAngle(thetaDebut);
  const pFin = positionAngle(fin);
  return `M ${CENTRE.x} ${CENTRE.y} L ${fmt(pDebut.x)} ${fmt(pDebut.y)} A ${RAYON_PIXEL} ${RAYON_PIXEL} 0 ${grandArc},0 ${fmt(pFin.x)} ${fmt(pFin.y)} Z`;
}
