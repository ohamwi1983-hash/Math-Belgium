import { useState } from "react";
import { Line, Mafs, Point as MafsPoint } from "mafs";
import "mafs/core.css";
import type { CumulComparaisonSeries, SerieComparaison } from "../core/comparaisonSeries.types";
import { EPAISSEUR_TRAIT_STANDARD, RATIO_GRAPHE, ZOOM_MAX, ZOOM_MIN } from "../ui/mafsTransformation";
import { calculerViewBoxComparaisonSeries, pointsCourbeCumulee } from "../ui/comparaisonSeriesGraph";
import { formatIndicateurPasGrille } from "../ui/indicateurPasGrille";
import { GrilleAdaptative } from "./mafsGraphPartage";
import { useLargeurConteneur } from "./useLargeurConteneur";

const COULEUR_A = "#1971c2";
const COULEUR_B = "#f08c00";
const COULEUR_CONTOUR_SELECTION = "#212529";
const RAYON_POINT = 6;
const RAYON_POINT_SELECTIONNE = 9;

const LARGEUR_PAR_DEFAUT = 420;
const LARGEUR_MIN = 240;
const LARGEUR_MAX = 480;

interface Props {
  serieA: SerieComparaison;
  serieB: SerieComparaison;
  cumul: CumulComparaisonSeries;
}

/**
 * Graphe "courbes cumulées" — variante "graphique" de "Comparaison de deux séries statistiques".
 * Réutilise l'approche de rendu polygonal déjà établie par "Paramètres de position"/gen33
 * (`LectureQuartileGraph.tsx` : une chaîne de `Line.Segment` reliant les sommets successifs, un
 * `Point` par sommet). Aucun tableau de données brutes affiché en complément (spec) — le graphe est
 * la seule source pour cette variante.
 *
 * **Sélection de points au clic** (`promptgen38selectionpoints.md`) — les points restent FIXES,
 * jamais de `MovablePoint`/drag (contrairement à l'écran "Polygone" de gen33, qui reste une vraie
 * construction ; ici c'est une aide à la lecture) : chaque sommet est un `Point` Mafs, rendu
 * cliquable via `svgCircleProps.onClick`, qui spread directement dans le `<circle>` natif — aucune
 * réimplémentation manuelle du calcul pixel n'est nécessaire (contrairement à `PointCroix`,
 * `mafsGraphPartage.tsx`, qui doit recalculer la position lui-même faute de composant Mafs natif
 * pour ce style). Sélection INDÉPENDANTE par courbe (`selectionneA`/`selectionneB`, un état par
 * courbe, jamais partagé) : sélectionner un point sur une courbe ne touche jamais la sélection
 * active de l'autre courbe, et sélectionner un nouveau point sur une courbe remplace toujours
 * l'ancien (un seul `useState<number|null>` par courbe, jamais un `Set`). La légende affiche les
 * coordonnées du point actif de chaque courbe dans SA couleur, et RIEN pour une courbe sans
 * sélection (jamais de placeholder "—", contrairement à `PolygoneEffectifsGraph` — les deux
 * sélections coexistent ici, un "—" par défaut sur les deux encombrerait la légende avant toute
 * interaction).
 *
 * **Échelles horizontale/verticale DÉCOUPLÉES** (`promptgen38fixechellegraphe.md`) — X (le
 * caractère du contexte) et Y (effectif/fréquence cumulé) sont deux grandeurs sans rapport, jamais
 * la même unité : `preserveAspectRatio={false}` désactive le comportement par défaut de Mafs
 * (`"contain"`, qui forcerait un même pas pixel/unité sur les deux axes, écrasant systématiquement
 * la courbe selon la plage du contexte tiré — étroite type "autonomie de batterie en h" ou large
 * type "salaire mensuel en €") — chaque axe reçoit alors sa propre échelle, calculée indépendamment
 * par Mafs lui-même à partir de sa propre plage de `viewBox` et de sa propre dimension pixel
 * (mécanisme natif de la bibliothèque, jamais une compensation manuelle côté génération du viewBox
 * — voir `calculerViewBoxComparaisonSeries`, `ui/comparaisonSeriesGraph.ts`). `GrilleAdaptative`
 * (`mafsGraphPartage.tsx`, partagée par tous les graphes Mafs du projet) était déjà construite pour
 * calculer `xSpan`/`ySpan` indépendamment l'un de l'autre — aucune modification nécessaire pour
 * afficher deux pas de grille distincts.
 *
 * **Labels "A"/"B" retirés du tracé, portés uniquement par la légende** — un `<Text>` attaché au
 * dernier point de chaque courbe se serait chevauché avec ce point (et, pour `cumul==="frequence"`,
 * les deux courbes finissent TOUJOURS exactement au même y=100%, garantissant la collision des deux
 * labels entre eux) — remplacé par les entrées "Série A"/"Série B" déjà présentes dans la légende
 * (mêmes couleurs `COULEUR_A`/`COULEUR_B`, `.mafs-graph-swatch-serie-a`/`-b`), qui identifient les
 * courbes sans jamais risquer de chevauchement, quelle que soit l'échelle calculée.
 */
export function ComparaisonSeriesGraph({ serieA, serieB, cumul }: Props) {
  const [wrapperRef, largeurMesuree] = useLargeurConteneur<HTMLDivElement>();
  const largeur = Math.min(LARGEUR_MAX, Math.max(LARGEUR_MIN, largeurMesuree || LARGEUR_PAR_DEFAUT));
  const hauteur = largeur / RATIO_GRAPHE;
  const [pas, setPas] = useState<{ x: number; y: number } | null>(null);
  const [selectionneA, setSelectionneA] = useState<number | null>(null);
  const [selectionneB, setSelectionneB] = useState<number | null>(null);

  const pointsA = pointsCourbeCumulee(serieA, cumul);
  const pointsB = pointsCourbeCumulee(serieB, cumul);
  const viewBox = calculerViewBoxComparaisonSeries(pointsA, pointsB);

  const courbes = [
    { points: pointsA, couleur: COULEUR_A, label: "A", selectionne: selectionneA, onSelectionner: setSelectionneA },
    { points: pointsB, couleur: COULEUR_B, label: "B", selectionne: selectionneB, onSelectionner: setSelectionneB },
  ];

  return (
    <div className="mafs-graph" ref={wrapperRef}>
      <Mafs width={largeur} height={hauteur} viewBox={{ x: viewBox.x, y: viewBox.y, padding: 0 }} preserveAspectRatio={false} pan={true} zoom={{ min: ZOOM_MIN, max: ZOOM_MAX }}>
        <GrilleAdaptative largeur={largeur} hauteur={hauteur} onPasChange={(x, y) => setPas({ x, y })} />
        {courbes.map((courbe) => (
          <g key={courbe.label}>
            {courbe.points.slice(0, -1).map((sommet, i) => (
              <Line.Segment key={`segment-${i}`} point1={[sommet.x, sommet.y]} point2={[courbe.points[i + 1].x, courbe.points[i + 1].y]} color={courbe.couleur} weight={EPAISSEUR_TRAIT_STANDARD} />
            ))}
            {courbe.points.map((p, i) => {
              const estSelectionne = courbe.selectionne === i;
              return (
                <MafsPoint
                  key={`sommet-${i}`}
                  x={p.x}
                  y={p.y}
                  color={courbe.couleur}
                  svgCircleProps={{
                    r: estSelectionne ? RAYON_POINT_SELECTIONNE : RAYON_POINT,
                    style: {
                      cursor: "pointer",
                      stroke: estSelectionne ? COULEUR_CONTOUR_SELECTION : undefined,
                      strokeWidth: estSelectionne ? 2 : undefined,
                    },
                    onClick: () => courbe.onSelectionner(i),
                  }}
                />
              );
            })}
          </g>
        ))}
      </Mafs>
      {pas && <p className="mafs-graph-pas">{formatIndicateurPasGrille(pas.x, pas.y)}</p>}
      <div className="mafs-graph-legende">
        <span className="mafs-graph-legende-item">
          <span className="mafs-graph-swatch mafs-graph-swatch-serie-a" /> Série A
        </span>
        <span className="mafs-graph-legende-item">
          <span className="mafs-graph-swatch mafs-graph-swatch-serie-b" /> Série B
        </span>
        {selectionneA !== null && (
          <span className="mafs-graph-legende-item" style={{ color: COULEUR_A }}>
            Point sélectionné (A) : ({pointsA[selectionneA].x} ; {pointsA[selectionneA].y})
          </span>
        )}
        {selectionneB !== null && (
          <span className="mafs-graph-legende-item" style={{ color: COULEUR_B }}>
            Point sélectionné (B) : ({pointsB[selectionneB].x} ; {pointsB[selectionneB].y})
          </span>
        )}
      </div>
    </div>
  );
}
