/**
 * Géométrie pure du graphe "courbes cumulées" — variante "graphique" de "Comparaison de deux séries
 * statistiques". Séparée du rendu React (`components/ComparaisonSeriesGraph.tsx`) pour rester
 * testable sans DOM, même principe que les autres graphes du projet.
 *
 * Contrairement à "Boîte à moustaches" (Y = simple séparateur de ligne, sans signification
 * mathématique) ou "Paramètres de position"/gen33 (une seule courbe), ce graphe est un VRAI plan XY
 * : X = les valeurs réelles de la série (le caractère du contexte, plage très variable — étroite
 * comme 14-35h ou large comme 2200-4800€), Y = l'effectif cumulé OU la fréquence cumulée (toujours
 * bornée 0 à n ou 0 à 100%). **Ces deux grandeurs sont de nature différente, sans rapport l'une avec
 * l'autre** — contrairement aux quatre autres graphes Mafs du projet (courbes de fonctions, vecteurs,
 * triangle...), où X et Y partagent la même unité et où déformer leur rapport fausserait la lecture
 * (ex. la courbure d'une parabole). Ici, forcer un même pas sur les deux axes écraserait
 * systématiquement la courbe dans un sens ou l'autre selon la plage du contexte tiré
 * (`promptgen38fixechellegraphe.md`) — le viewBox retourné ne force donc **plus** le ratio x/y à
 * `RATIO_GRAPHE` (l'ancien `ajusterAuRatio`, dupliqué comme dans `vecteurGraph.ts`/
 * `mafsFonctionsReference.ts`, a été retiré) : chaque axe couvre sa propre plage réelle avec sa
 * propre marge, et c'est `Mafs` (`preserveAspectRatio={false}`, voir `ComparaisonSeriesGraph.tsx`)
 * qui calcule alors deux échelles pixel/unité indépendantes, une par axe — le mécanisme natif de la
 * bibliothèque pour ce cas, jamais une compensation manuelle côté génération du viewBox.
 *
 * Chaque polygone (une courbe "ogive" par série) est construit comme `[(x_0, 0), (x_1,
 * cumul_1), ..., (x_k, cumul_k)]` — même principe de tracé linéaire par segments déjà établi par
 * "Paramètres de position"/gen33 pour ses courbes cumulées de classes, adapté ici à des valeurs
 * discrètes plutôt qu'à des bornes de classe.
 */
import type { CumulComparaisonSeries, SerieComparaison } from "../core/comparaisonSeries.types";

export interface PointCourbeCumulee {
  x: number;
  y: number;
}

/** Le polygone des valeurs cumulées d'UNE série, pour le type de cumul choisi — toujours dérivé
 * directement de `serie.lignes`, jamais recalculé indépendamment ailleurs. */
export function pointsCourbeCumulee(serie: SerieComparaison, cumul: CumulComparaisonSeries): PointCourbeCumulee[] {
  const premierPoint: PointCourbeCumulee = { x: serie.lignes[0].valeur, y: 0 };
  return [
    premierPoint,
    ...serie.lignes.map((ligne) => ({
      x: ligne.valeur,
      y: cumul === "effectif" ? ligne.effectifCumule : ligne.frequenceCumulee,
    })),
  ];
}

export interface ViewBoxComparaisonSeries {
  x: [number, number];
  y: [number, number];
}

/** ViewBox couvrant l'union des 2 polygones, avec une marge proportionnelle PAR AXE — jamais un
 * domaine fixe indépendant des vraies données (même invariant que le reste du projet), et jamais de
 * ratio x/y forcé entre les deux (voir la documentation en tête de fichier) : chaque axe garde sa
 * propre plage réelle, laissant `Mafs` leur appliquer des échelles pixel indépendantes. */
export function calculerViewBoxComparaisonSeries(pointsA: PointCourbeCumulee[], pointsB: PointCourbeCumulee[]): ViewBoxComparaisonSeries {
  const tousPoints = [...pointsA, ...pointsB];
  const xs = tousPoints.map((p) => p.x);
  const ys = tousPoints.map((p) => p.y);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMax = Math.max(...ys);

  const margeX = Math.max(1, (xMax - xMin) * 0.15);
  const margeY = Math.max(1, yMax * 0.15);

  return { x: [xMin - margeX, xMax + margeX], y: [-margeY, yMax + margeY] };
}
