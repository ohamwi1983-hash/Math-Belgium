/**
 * Géométrie pure de la grille tournée partagée — "Construction graphique de la parabole" (position
 * 53), premier générateur de la plateforme dont la grille Mafs doit être ALIGNÉE À UNE DIRECTION
 * OBLIQUE plutôt qu'horizontale/verticale (voir `promptgen53remplacement.md`).
 *
 * ## Pourquoi ce n'est PAS Mafs qui tourne
 *
 * Vérifié directement dans le code compilé de Mafs (`node_modules/mafs/build/index.js`) :
 * - `Coordinates.Cartesian` (ce qui trace la grille partout ailleurs sur la plateforme via
 *   `GrilleAdaptative`, `components/mafsGraphPartage.tsx`) lit UNIQUEMENT `viewTransform`, jamais
 *   `userTransform` — la faire pivoter via `<Transform rotate={...}>` n'aurait AUCUN effet visuel
 *   sur ses lignes de grille.
 * - Un `<g transform="rotate(...)">` CSS/SVG externe, autour de tout le canvas Mafs, casserait le
 *   glisser-déposer : `useMovable` (ce qui fait fonctionner `MovablePoint`) calcule le mouvement du
 *   pointeur à partir d'événements DOM bruts, sans connaissance d'une rotation externe appliquée
 *   après son propre rendu — désynchronisation garantie entre le point affiché et le point suivi.
 * - En revanche, `<Transform rotate={θ}>` (déjà exporté par Mafs) COMPOSE correctement : son
 *   implémentation lit le `userTransform` courant du contexte, compose sa propre rotation par
 *   dessus, et fournit le résultat à ses enfants via un nouveau `TransformContext.Provider`.
 *   `useMovable` lit ce même `userTransform` composé pour convertir le mouvement du pointeur en
 *   coordonnées LOCALES (pré-rotation) — le glisser-déposer fonctionne donc correctement sous
 *   rotation, nativement, sans aucun calcul trigonométrique de notre part.
 *
 * ## Conséquence — un seul repère LOCAL, jamais de trigonométrie dans le code applicatif
 *
 * Toute la génération et la vérification (`generateurs/constructionParabole/`,
 * `moteur/verificationConstructionParabole.ts`) vivent entièrement dans le repère LOCAL du contrat
 * (`core/constructionParabole.types.ts`) — directrice toujours `y=0`, foyer toujours `(fx,fy)` avec
 * `fy>0` — EXACTEMENT comme une parabole "verticale" ordinaire. L'obliquité n'existe QU'AU RENDU :
 * toute la scène (grille, cercle, droite, points) est placée dans un seul `<Transform rotate={θ}>`
 * (`components/mafsGraphPartage.tsx::GrilleTournee` pour la grille elle-même, dessinée à la main
 * via la même technique que `PointCroix` — `vec.transform` composé avec le `userTransform` courant,
 * lu depuis l'INTÉRIEUR du même `<Transform>`) :
 * - Les fonctions `constrain` des `<MovablePoint>` restent aussi simples que le `snapEntier` déjà
 *   utilisé partout ailleurs sur la plateforme (`Math.round`), car elles opèrent dans le repère
 *   local — Mafs se charge seul de la conversion vers/depuis le monde tourné.
 * - La grille elle-même est dessinée à la main (jamais `GrilleAdaptative`/`Coordinates.Cartesian`),
 *   ce qui satisfait gratuitement la contrainte "aucune graduation ni label numérique" — on ne
 *   passe simplement jamais par le mécanisme qui en dessinerait.
 *
 * Seule LA VIEWBOX EXTÉRIEURE de `<Mafs>` (qui, elle, reste dans le repère AVANT rotation — la
 * rotation ne s'applique qu'à l'intérieur du `<Transform>`) a besoin d'un calcul explicite de
 * rotation, ci-dessous : elle doit couvrir l'enveloppe du contenu local UNE FOIS FAIT PIVOTER par θ,
 * sans quoi le contenu tournerait hors cadre.
 */
import type { Point } from "../core/vecteur.types";
import { calculerViewBoxVecteurs } from "./vecteurGraph";
import type { PointAffiche } from "./vecteurGraph";

/** Fait pivoter un point du repère local vers le repère extérieur (avant rotation), angle θ en
 * radians — jamais utilisée ailleurs que pour le calcul de viewBox : le rendu/l'interaction eux-
 * mêmes ne font JAMAIS ce calcul, Mafs s'en charge via `<Transform rotate={θ}>` (voir en-tête). */
function tournerPoint(point: Point, theta: number): Point {
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  return { x: point.x * cos - point.y * sin, y: point.x * sin + point.y * cos };
}

/** ViewBox extérieure couvrant l'enveloppe des points LOCAUX une fois tournés par θ — réutilise
 * `calculerViewBoxVecteurs` (marge/ratio déjà éprouvés) sur les points tournés plutôt que de
 * dupliquer cette logique. */
export function calculerViewBoxGrilleTournee(pointsLocaux: Point[], theta: number): ReturnType<typeof calculerViewBoxVecteurs> {
  const affiches: PointAffiche[] = pointsLocaux.map((point) => ({ point: tournerPoint(point, theta), label: "" }));
  return calculerViewBoxVecteurs(affiches);
}

const MARGE_DEMI_PORTEE = 2;

/** Demi-portée (en unités LOCALES, pas de rotation ici) sur laquelle dessiner les lignes de la
 * grille tournée — assez grande pour couvrir tout le contenu local avec une marge de manipulation
 * (glisser au-delà de la géométrie "attendue" reste possible sans sortir de la grille visible). */
export function demiPorteeGrilleTournee(pointsLocaux: Point[]): number {
  const distances = pointsLocaux.flatMap((p) => [Math.abs(p.x), Math.abs(p.y)]);
  return Math.max(0, ...distances) + MARGE_DEMI_PORTEE;
}
