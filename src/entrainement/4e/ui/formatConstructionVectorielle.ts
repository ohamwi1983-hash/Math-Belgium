/**
 * Présentation pure — "Construction graphique de vecteurs sur grille" (chapitre "Calcul
 * vectoriel", quatrième générateur).
 */
import type { ExerciceConstructionVectorielle } from "../core/constructionVectorielle.types";
import type { Composantes, Point } from "../core/vecteur.types";
import { calculerViewBoxVecteurs } from "./vecteurGraph";
import type { ViewBoxTransformation } from "./vecteurGraph";

function formatNombre(valeur: number): string {
  return Number.isInteger(valeur) ? String(valeur) : valeur.toFixed(2).replace(/\.?0+$/, "");
}

/**
 * Consigne composée en 3 morceaux (avant/latex/apres) — même patron que `consignePointVectoriel`
 * (voir sa section dédiée, CLAUDE.md) : jamais de `$...$` littéral passé à KaTeX, une prose brute
 * autour d'un court fragment mathématique.
 */
export interface ConsigneConstruction {
  avant: string;
  latex: string;
  apres: string;
}

export function consigneConstructionVectorielle(exercice: ExerciceConstructionVectorielle): ConsigneConstruction {
  const coef = exercice.coefficient;
  const coefTexte = coef === 1 ? "" : coef === -1 ? "-" : formatNombre(coef);
  return {
    avant: "Trace le vecteur ",
    latex: `${coefTexte}\\vec{${exercice.labelA}${exercice.labelB}}`,
    apres: " à partir du point de ton choix sur la grille.",
  };
}

/** Rappel purement symbolique des points A/B connus — fragment KaTeX direct, jamais de prose.
 * Conservée telle quelle pour les consommateurs qui ont besoin d'une seule chaîne —
 * `formatTermesDonneesConnuesConstructionLatex` ci-dessous en est la version "bloc fitter". */
export function formatDonneesConnuesConstructionLatex(exercice: ExerciceConstructionVectorielle): string {
  return formatTermesDonneesConnuesConstructionLatex(exercice).join(" \\quad ");
}

/** Version "bloc fitter" de `formatDonneesConnuesConstructionLatex`
 * (`promptblocfittertousgenerateurs.md`) — un fragment KaTeX par point. */
export function formatTermesDonneesConnuesConstructionLatex(exercice: ExerciceConstructionVectorielle): string[] {
  return [
    `${exercice.labelA}(${formatNombre(exercice.pointA.x)} ; ${formatNombre(exercice.pointA.y)})`,
    `${exercice.labelB}(${formatNombre(exercice.pointB.x)} ; ${formatNombre(exercice.pointB.y)})`,
  ];
}

/** Composantes du tracé proposé au départ (poignées écartées d'environ 3 unités — elles se
 * chevauchaient presque, signalement chapitre 6, point 26) — la première qui n'est PAS la cible,
 * sinon « Valider » sans rien bouger serait compté juste. */
const TRACES_INITIAUX: Composantes[] = [
  { x: 3, y: 0 },
  { x: 0, y: 3 },
  { x: -3, y: 0 },
];
/** Le tracé initial est posé sous le plus bas des points A, B — jamais sur A ou B. */
const DECALAGE_SOUS_POINTS = 2;

export function traceInitialConstruction(exercice: ExerciceConstructionVectorielle): { depart: Point; arrivee: Point } {
  const { pointA, pointB, cibleComposantes } = exercice;
  const composantes = TRACES_INITIAUX.find((t) => t.x !== cibleComposantes.x || t.y !== cibleComposantes.y)!;
  const depart = { x: Math.min(pointA.x, pointB.x), y: Math.min(pointA.y, pointB.y) - DECALAGE_SOUS_POINTS };
  return { depart, arrivee: { x: depart.x + composantes.x, y: depart.y + composantes.y } };
}

/**
 * Fenêtre FIXE du graphe de construction (signalement chapitre 6, point 8 — recalculée à chaque
 * rendu, elle suivait le vecteur en cours de glisser et bougeait sous le doigt). Tirée de
 * l'exercice seul : A, B, le tracé initial, et la cible posée au centre de [A, B] — de quoi la
 * tracer en entier quelque part dans la fenêtre, sans révéler où.
 */
export function fenetreConstructionVectorielle(exercice: ExerciceConstructionVectorielle): ViewBoxTransformation {
  const { pointA, pointB, cibleComposantes } = exercice;
  const initial = traceInitialConstruction(exercice);
  const centre = { x: (pointA.x + pointB.x) / 2, y: (pointA.y + pointB.y) / 2 };
  return calculerViewBoxVecteurs(
    [pointA, pointB, initial.depart, initial.arrivee].map((point) => ({ point, label: "" })),
    [{ origine: { x: centre.x - cibleComposantes.x / 2, y: centre.y - cibleComposantes.y / 2 }, vecteur: cibleComposantes }],
  );
}

/** Fenêtre de la révélation : la fenêtre fixe, agrandie seulement si le vecteur attendu tracé
 * depuis l'ancre de l'élève en sort (le glisser est terminé, plus rien ne bouge sous le doigt). */
export function fenetreRevelationConstruction(fenetre: ViewBoxTransformation, depart: Point, cible: Composantes): ViewBoxTransformation {
  const arrivee = { x: depart.x + cible.x, y: depart.y + cible.y };
  const dedans = (p: Point) => p.x >= fenetre.x[0] && p.x <= fenetre.x[1] && p.y >= fenetre.y[0] && p.y <= fenetre.y[1];
  if (dedans(depart) && dedans(arrivee)) return fenetre;
  const coins: Point[] = [
    { x: fenetre.x[0], y: fenetre.y[0] },
    { x: fenetre.x[1], y: fenetre.y[1] },
  ];
  return calculerViewBoxVecteurs(
    coins.map((point) => ({ point, label: "" })),
    [{ origine: depart, vecteur: cible }],
  );
}

/** Garde une poignée sur un nœud entier de la fenêtre — sans déplacement du fond (`pan` coupé),
 * une poignée sortie de la fenêtre serait perdue. */
export function contraindreAuNoeudDeFenetre([x, y]: [number, number], fenetre: ViewBoxTransformation): [number, number] {
  const borne = (v: number, [min, max]: [number, number]) => Math.min(Math.floor(max), Math.max(Math.ceil(min), Math.round(v)));
  return [borne(x, fenetre.x), borne(y, fenetre.y)];
}
