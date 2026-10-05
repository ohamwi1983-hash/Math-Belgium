/**
 * Géométrie pure du graphe d'histogramme — pixel ↔ donnée, séparée du rendu React
 * (`components/HistogrammeGraph.tsx`) pour rester testable sans DOM, même principe que les 5
 * graphes du projet (Mafs et croquis SVG schématiques). Contrairement aux graphes Mafs, jamais de
 * zoom/pan ici : un cadrage FIXE (axe X gradué selon les bornes de classes, non interactif — spec)
 * suffit, puisque le seul geste de l'élève est un glissement VERTICAL cranté sur chaque barre.
 */
import type { ExerciceHistogramme } from "../core/histogramme.types";

export const LARGEUR_HISTOGRAMME = 400;
export const HAUTEUR_HISTOGRAMME = 280;
const MARGE_GAUCHE = 40;
const MARGE_DROITE = 12;
const MARGE_HAUT = 16;
const MARGE_BAS = 34;

export interface GeometrieHistogramme {
  largeur: number;
  hauteur: number;
  margeGauche: number;
  margeDroite: number;
  margeHaut: number;
  margeBas: number;
  /** Bornes X du graphe — toujours `[classes[0].borneInf, classes[dernière].borneSup]`. */
  borneXMin: number;
  borneXMax: number;
  /** Hauteur maximale affichée sur l'axe Y — toujours strictement au-dessus de la valeur réelle la
   * plus haute (marge de confort pour le glissement, voir `calculerHauteurMaxAxe`). */
  hauteurMaxAxe: number;
}

/**
 * Valeur affichée par la hauteur d'une classe selon la variante — l'effectif pour "effectif", la
 * fréquence (%) pour "frequence". Réutilisée par la géométrie ET par la vérification
 * (`moteur/verificationHistogramme.ts::valeurAttendueTrace`, dupliquée là-bas — `src/ui/` peut
 * dépendre de `src/moteur/`, jamais l'inverse, donc cette petite fonction pure ne peut pas être
 * partagée dans l'autre sens sans casser la règle d'architecture).
 */
export function valeurHauteur(exercice: ExerciceHistogramme, index: number): number {
  const classe = exercice.classes[index];
  return exercice.variante === "frequence" ? classe.frequencePourcent : classe.effectif;
}

/** Marge fixe au-dessus de la valeur réelle la plus haute — généreuse pour la fréquence (%, qui
 * peut légitimement approcher des valeurs bien plus grandes que l'effectif brut). */
function margeAxe(exercice: ExerciceHistogramme): number {
  return exercice.variante === "frequence" ? 10 : 3;
}

export function calculerHauteurMaxAxe(exercice: ExerciceHistogramme): number {
  const maxReel = Math.max(...exercice.classes.map((_, i) => valeurHauteur(exercice, i)));
  return maxReel + margeAxe(exercice);
}

export function calculerGeometrie(exercice: ExerciceHistogramme): GeometrieHistogramme {
  return {
    largeur: LARGEUR_HISTOGRAMME,
    hauteur: HAUTEUR_HISTOGRAMME,
    margeGauche: MARGE_GAUCHE,
    margeDroite: MARGE_DROITE,
    margeHaut: MARGE_HAUT,
    margeBas: MARGE_BAS,
    borneXMin: exercice.classes[0].borneInf,
    borneXMax: exercice.classes[exercice.classes.length - 1].borneSup,
    hauteurMaxAxe: calculerHauteurMaxAxe(exercice),
  };
}

export function xVersPixel(geom: GeometrieHistogramme, xDonnee: number): number {
  const largeurUtile = geom.largeur - geom.margeGauche - geom.margeDroite;
  const span = geom.borneXMax - geom.borneXMin;
  return geom.margeGauche + ((xDonnee - geom.borneXMin) / span) * largeurUtile;
}

export function yVersPixel(geom: GeometrieHistogramme, yDonnee: number): number {
  const hauteurUtile = geom.hauteur - geom.margeHaut - geom.margeBas;
  return geom.hauteur - geom.margeBas - (yDonnee / geom.hauteurMaxAxe) * hauteurUtile;
}

/** Inverse de `yVersPixel` — convertit une position pixel Y (dans le repère du SVG) en valeur de
 * donnée BRUTE, pas encore crantée (voir `cranterHauteur`). */
export function pixelVersY(geom: GeometrieHistogramme, yPixel: number): number {
  const hauteurUtile = geom.hauteur - geom.margeHaut - geom.margeBas;
  return ((geom.hauteur - geom.margeBas - yPixel) / hauteurUtile) * geom.hauteurMaxAxe;
}

/** Accroche une valeur brute sur la grille entière la plus proche, bornée à `[0, hauteurMaxEntiere]`
 * — jamais de valeur continue libre (spec : "glissement cranté sur des valeurs discrètes"). */
export function cranterHauteur(yDonneeBrute: number, hauteurMaxAxe: number): number {
  const hauteurMaxEntiere = Math.floor(hauteurMaxAxe);
  return Math.max(0, Math.min(hauteurMaxEntiere, Math.round(yDonneeBrute)));
}

/** Pas d'affichage des lignes de grille horizontales — purement cosmétique, JAMAIS le pas
 * d'accrochage du glissement (toujours 1, voir `cranterHauteur`) : une grille visuelle à chaque
 * unité serait illisible dès que `hauteurMaxAxe` dépasse une quinzaine d'unités (cas fréquent pour
 * la variante "fréquence", dont l'échelle peut approcher plusieurs dizaines de %). */
export function pasAffichageGrille(hauteurMaxAxe: number): number {
  if (hauteurMaxAxe <= 15) return 1;
  if (hauteurMaxAxe <= 40) return 5;
  return 10;
}

/** Valeurs des lignes de grille horizontales à afficher, de 0 à `hauteurMaxAxe` par pas de
 * `pasAffichageGrille`. */
export function valeursGrilleHorizontale(hauteurMaxAxe: number): number[] {
  const pas = pasAffichageGrille(hauteurMaxAxe);
  const valeurs: number[] = [];
  for (let v = 0; v <= hauteurMaxAxe; v += pas) valeurs.push(v);
  return valeurs;
}
