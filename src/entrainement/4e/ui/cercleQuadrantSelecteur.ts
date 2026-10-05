/**
 * Écran "Quadrant" (correction 3, promptcorrectionsgenerateurcercletrigo1.md ; affinée par
 * promptcorrectionsgenerateurcercletrigo2.md) : remplace le QCM à 5 boutons textuels par un cercle
 * interactif — géométrie purement statique (aucune donnée d'exercice en entrée, contrairement à
 * cercleTrigSketch.ts), toujours la même quelle que soit l'angle de l'exercice. Ce sélecteur
 * n'affiche JAMAIS l'angle de l'énoncé placé dessus — il reste neutre, un pur outil de sélection,
 * distinct visuellement et fonctionnellement du croquis d'aide.
 *
 * Chaque quadrant est une zone CLIQUABLE couvrant tout son quart du carré (pas seulement
 * l'intérieur du disque) — cible tactile généreuse sur mobile — mais sa surbrillance VISUELLE
 * (round 2, point 1.2) épouse la forme réelle du quart de disque (`cheminQuartDisque`), jamais le
 * carré englobant : la zone cliquable et la zone visuellement surlignée sont donc deux géométries
 * distinctes qui se superposent, pas une seule et même forme.
 *
 * Ox et Oy sont désormais deux valeurs de `Quadrant` à part entière ("axeOx"/"axeOy", round 2,
 * point 1.4) — deux zones cliquables indépendantes, chacune sa propre bande élargie
 * (`axeOxRect`/`axeOyRect`, cible tactile) et son propre trait d'axe qui s'épaissit
 * individuellement quand sélectionné (point 1.5) — jamais les deux ensemble comme au round
 * précédent.
 */
import { CENTRE_CERCLE_TRIG, HAUTEUR_CERCLE_TRIG, LARGEUR_CERCLE_TRIG, RAYON_CERCLE_TRIG, pointSurCercle } from "./cercleTrigGeometrie";
import type { PointCroquisCercleTrig } from "./cercleTrigGeometrie";

export interface RectZone {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type QuadrantSimple = "I" | "II" | "III" | "IV";

export interface ZoneQuadrant {
  quadrant: QuadrantSimple;
  /** Zone cliquable — tout le quart du carré, plus généreuse que le disque affiché. */
  rect: RectZone;
  /** Position du chiffre romain, toujours à l'intérieur du disque (même décalage que le croquis d'aide). */
  label: PointCroquisCercleTrig;
  /** Attribut `d` du quart de disque réel (arc + les deux rayons qui le délimitent) — la forme VISUELLEMENT surlignée. */
  cheminDisque: string;
}

/** Triangle plein (attribut `points` d'un `<polygon>`) pointant vers l'extrémité positive d'un axe. */
export type PointsFleche = string;

export interface ZonesCercleQuadrantSelecteur {
  largeur: number;
  hauteur: number;
  centre: PointCroquisCercleTrig;
  rayon: number;
  zonesQuadrant: ZoneQuadrant[];
  /** Bande cliquable élargie autour de Ox, plus épaisse que le simple trait visible de l'axe. */
  axeOxRect: RectZone;
  /** Bande cliquable élargie autour de Oy. */
  axeOyRect: RectZone;
  /** Position de l'étiquette "X" (point 1.1, round 2 ; renommée "Ox"→"X",
   * promptcorrectionsgenerateur14aides.md, section 3), au bout de l'axe horizontal. */
  labelOx: PointCroquisCercleTrig;
  /** Position de l'étiquette "Y" (renommée "Oy"→"Y"), au bout de l'axe vertical. */
  labelOy: PointCroquisCercleTrig;
  /** Flèche à l'extrémité positive de l'axe X (section 3). */
  flecheX: PointsFleche;
  /** Flèche à l'extrémité positive de l'axe Y (section 3). */
  flecheY: PointsFleche;
  /** Position de l'étiquette "O" à l'origine — décalée dans le coin supérieur du quadrant III,
   * proche de l'intersection sans la chevaucher (section 3). */
  labelOrigine: PointCroquisCercleTrig;
}

const EPAISSEUR_AXE = 32;
const DECALAGE_LABEL = RAYON_CERCLE_TRIG * 0.62;
const MARGE_BORD_FLECHE = 2;
const LONGUEUR_FLECHE = 10;
const DEMI_LARGEUR_FLECHE = 5;
const DECALAGE_LABEL_ORIGINE = 12;

/** Triangle plein pointant vers `pointe`, orienté selon `direction` ("est"/"nord"). */
function construireFleche(pointe: PointCroquisCercleTrig, direction: "est" | "nord"): PointsFleche {
  const base =
    direction === "est"
      ? {
          c1: { x: pointe.x - LONGUEUR_FLECHE, y: pointe.y - DEMI_LARGEUR_FLECHE },
          c2: { x: pointe.x - LONGUEUR_FLECHE, y: pointe.y + DEMI_LARGEUR_FLECHE },
        }
      : {
          c1: { x: pointe.x - DEMI_LARGEUR_FLECHE, y: pointe.y + LONGUEUR_FLECHE },
          c2: { x: pointe.x + DEMI_LARGEUR_FLECHE, y: pointe.y + LONGUEUR_FLECHE },
        };
  return `${pointe.x},${pointe.y} ${base.c1.x},${base.c1.y} ${base.c2.x},${base.c2.y}`;
}

/** Bornes angulaires (convention pointSurCercle : 0°=est, sens antihoraire) de chaque quadrant. */
const PLAGE_ANGLES: Record<QuadrantSimple, [number, number]> = {
  I: [0, 90],
  II: [90, 180],
  III: [180, 270],
  IV: [270, 360],
};

/**
 * Quart de disque réel (arc + les deux rayons qui le délimitent, exactement les deux segments
 * d'axes bordant ce quadrant — point 1.3, round 2) : `M centre L départ A rayon rayon 0 0 0
 * arrivée Z`. Sweep-flag=0 (même convention que l'arc de l'angle dans cercleTrigSketch.ts, déjà
 * vérifiée visuellement) trace l'arc dans le sens des angles croissants, jamais l'arc opposé.
 */
function cheminQuartDisque(quadrant: QuadrantSimple): string {
  const [angleDebut, angleFin] = PLAGE_ANGLES[quadrant];
  const c = CENTRE_CERCLE_TRIG;
  const depart = pointSurCercle(angleDebut, RAYON_CERCLE_TRIG);
  const arrivee = pointSurCercle(angleFin, RAYON_CERCLE_TRIG);
  return `M ${c.x} ${c.y} L ${depart.x} ${depart.y} A ${RAYON_CERCLE_TRIG} ${RAYON_CERCLE_TRIG} 0 0 0 ${arrivee.x} ${arrivee.y} Z`;
}

export function calculerZonesCercleQuadrantSelecteur(): ZonesCercleQuadrantSelecteur {
  const c = CENTRE_CERCLE_TRIG;

  const zonesQuadrant: ZoneQuadrant[] = [
    {
      quadrant: "I",
      rect: { x: c.x, y: 0, width: LARGEUR_CERCLE_TRIG - c.x, height: c.y },
      label: { x: c.x + DECALAGE_LABEL, y: c.y - DECALAGE_LABEL },
      cheminDisque: cheminQuartDisque("I"),
    },
    {
      quadrant: "II",
      rect: { x: 0, y: 0, width: c.x, height: c.y },
      label: { x: c.x - DECALAGE_LABEL, y: c.y - DECALAGE_LABEL },
      cheminDisque: cheminQuartDisque("II"),
    },
    {
      quadrant: "III",
      rect: { x: 0, y: c.y, width: c.x, height: HAUTEUR_CERCLE_TRIG - c.y },
      label: { x: c.x - DECALAGE_LABEL, y: c.y + DECALAGE_LABEL },
      cheminDisque: cheminQuartDisque("III"),
    },
    {
      quadrant: "IV",
      rect: { x: c.x, y: c.y, width: LARGEUR_CERCLE_TRIG - c.x, height: HAUTEUR_CERCLE_TRIG - c.y },
      label: { x: c.x + DECALAGE_LABEL, y: c.y + DECALAGE_LABEL },
      cheminDisque: cheminQuartDisque("IV"),
    },
  ];

  const axeOxRect: RectZone = { x: 0, y: c.y - EPAISSEUR_AXE / 2, width: LARGEUR_CERCLE_TRIG, height: EPAISSEUR_AXE };
  const axeOyRect: RectZone = { x: c.x - EPAISSEUR_AXE / 2, y: 0, width: EPAISSEUR_AXE, height: HAUTEUR_CERCLE_TRIG };

  const pointeX: PointCroquisCercleTrig = { x: LARGEUR_CERCLE_TRIG - MARGE_BORD_FLECHE, y: c.y };
  const pointeY: PointCroquisCercleTrig = { x: c.x, y: MARGE_BORD_FLECHE };

  return {
    largeur: LARGEUR_CERCLE_TRIG,
    hauteur: HAUTEUR_CERCLE_TRIG,
    centre: c,
    rayon: RAYON_CERCLE_TRIG,
    zonesQuadrant,
    axeOxRect,
    axeOyRect,
    labelOx: { x: LARGEUR_CERCLE_TRIG - 14, y: c.y - 6 },
    labelOy: { x: c.x + 6, y: 12 },
    flecheX: construireFleche(pointeX, "est"),
    flecheY: construireFleche(pointeY, "nord"),
    labelOrigine: { x: c.x - DECALAGE_LABEL_ORIGINE, y: c.y + DECALAGE_LABEL_ORIGINE },
  };
}
