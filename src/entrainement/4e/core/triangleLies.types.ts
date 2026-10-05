/**
 * Contrat core — cinquante-huitième générateur, "Triangles liés (triangulation, côté ou angle
 * partagé)" (chapitre 3, ajouté en fin de liste — même convention "position = ordre de création"
 * que les cinquante-cinquième/cinquante-sixième/cinquante-septième exercices). Spec :
 * `promptimplementationgen58.md`. Indépendant de gen55/gen56/gen57 — aucun composant partagé.
 *
 * Deux triangles liés : un triangle "pont" (fournit une valeur TRANSFÉRÉE, toujours un côté, jamais
 * un angle) et un triangle "cible" (toujours quelconque), pour lequel on demande un côté, un angle
 * ou l'aire. Deux variantes structurellement différentes :
 * - `cotePartage` — les deux triangles partagent un vrai côté dessiné dans le croquis ; les 2
 *   angles qui ferment le triangle cible sont déjà donnés dans l'énoncé (rien à calculer avant de
 *   résoudre le triangle cible lui-même).
 * - `anglePartage` — pas de segment physique commun, mais un même point d'observation d'où sont
 *   prises 2 visées vers 2 cibles différentes ; leur DIFFÉRENCE donne l'un des 2 angles qui ferment
 *   le triangle cible, une HYPOTHÈSE ANNEXE propre au contexte (ex. verticalité d'un objet,
 *   perpendicularité d'une rive) ferme le second — écran "angles" dédié, absent de `cotePartage`.
 * - `sommetPartage` (confirmée par un sujet d'examen officiel FWB, Liège juillet 2012) — les deux
 *   triangles partagent un SOMMET et son angle, littéralement le MÊME angle géométrique (pas une
 *   différence, pas d'hypothèse annexe à documenter) : `triangleCible.A === trianglePont.A`,
 *   transféré tel quel. Le triangle cible est formé par 2 points situés sur les côtés du triangle
 *   pont issus de ce sommet commun (ex. 2 mobiles ayant chacun parcouru une distance connue le long
 *   de leur trajectoire). Contrairement aux 2 autres configurations (1 seule valeur transférée),
 *   l'écran "pont" demande ICI 3 valeurs : l'angle au sommet commun ET les 2 côtés qui en partent
 *   (`trianglePont.A`/`.b`/`.c`) — écran-pivot "soustraction" dédié, absent des 2 autres
 *   configurations, où chaque côté du triangle cible = côté correspondant du pont MOINS la distance
 *   déjà parcourue (`distancesParcourues`, non `null` ssi cette configuration).
 *
 * **Convention interne unifiant les 4 familles** (indépendante des lettres narratives A/B/C/D d'un
 * contexte donné) : le côté TRANSFÉRÉ du triangle pont vers le triangle cible est TOUJOURS
 * `trianglePont.a`, et TOUJOURS reçu dans `triangleCible.a` (`triangleCible.a === trianglePont.a`
 * par construction). Le triangle cible est TOUJOURS résolu par ASA (angle-côté-angle) via
 * `triangleCible.a` (le côté partagé) + `triangleCible.B`/`triangleCible.C` (les 2 angles
 * adjacents à ce côté) — `resoudreAAS` (`generateurs/triangle/resoudreTriangle.ts`, réutilisé tel
 * quel) donne alors le 3e angle et les 2 côtés restants, dont la grandeur demandée. Chaque famille
 * construit son propre `Triangle` (contrat déjà partagé du chapitre 3) en RELABELLANT au besoin la
 * sortie de `resoudreSSS`/`resoudreSAS`/`resoudreAAS` (permutation `{a,A}`/`{b,B}`/`{c,C}`, la
 * même géométrie sous une autre étiquette) pour que cette convention soit toujours respectée.
 *
 * **Écart documenté par rapport à la banque de contextes proposée dans la spec** (section 4,
 * explicitement "proposition initiale, à étendre librement") — les types de triangle pont des
 * familles `hauteurInaccessible` (C) et `distanceInaccessible` (D) sont ÉCHANGÉS par rapport au
 * tableau d'origine (C passe de `quelconque` à `rectangle`, D de `rectangle` à `quelconque`) :
 * la construction à un seul point d'observation + un objet vertical (C) produit naturellement un
 * triangle pont RECTANGLE (angle droit au pied de l'objet, résolu par simple SOH-CAH-TOA) ; la
 * construction à un seul point d'observation + une visée vers un point de repère atteignable (D)
 * produit naturellement un triangle pont QUELCONQUE (résolu par loi des sinus, AAS). Signalé plutôt
 * que tranché silencieusement, conformément à l'instruction de la spec — voir CLAUDE.md pour le
 * détail complet des 4 constructions géométriques concrètes.
 */
import type { Triangle } from "./triangle.types";

export type VarianteTriangleLies = "cotePartage" | "anglePartage" | "sommetPartage";

/**
 * A. `terrainRectangle` — terrain quadrilatère, diagonale calculée via un triangle pont RECTANGLE,
 *    grandeur demandée = aire du second triangle (`cotePartage`).
 * B. `terrainQuelconque` — même principe, triangle pont lui-même QUELCONQUE (SAS), grandeur
 *    demandée = un côté du terrain (`cotePartage`).
 * C. `hauteurInaccessible` — hauteur d'un objet vertical inaccessible, triangle pont RECTANGLE
 *    (un point d'observation + un point de repère à hauteur connue sur le même support vertical),
 *    grandeur demandée = un côté (la hauteur, `anglePartage`).
 * D. `distanceInaccessible` — distance entre 2 points inaccessibles, triangle pont QUELCONQUE (un
 *    point d'observation + un point de repère atteignable, résolu par AAS), grandeur demandée = un
 *    côté (la distance, `anglePartage`).
 *
 * **4 familles ajoutées** (`promptextensionbanquesgen57gen58.md`, extension de la banque section 4) :
 * J. `terrainSportif` — même mécanique que `terrainQuelconque` (pont SAS), mais grandeur demandée =
 *    AIRE du triangle cible plutôt qu'un côté (`cotePartage`).
 * M. `inclinaisonCable` — même mécanique que `hauteurInaccessible` (pont rectangle, hypothèse de
 *    verticalité), mais grandeur demandée = un ANGLE du triangle cible plutôt que la hauteur totale
 *    (`anglePartage`).
 * L. `hauteurArbre` / N. `sectionFalaise` — nouveau mécanisme de pont QUELCONQUE en `anglePartage`
 *    (aucune des 4 familles d'origine ne couvrait cette combinaison) : triangulation du côté
 *    transféré via un repère atteignable R (baseline OR + 2 angles, ASA — même principe que
 *    `distanceInaccessible`), combinée à l'hypothèse de verticalité du triangle cible (même principe
 *    que `hauteurInaccessible`) — voir `hauteurArbre.ts` pour le détail complet. L demande un côté
 *    (la hauteur), N une aire (section triangulaire visible).
 *
 * **3 familles `sommetPartage`** (nouvelle configuration, `promptextensiongen58sommetpartage`) :
 * P. `naviresConvergents` / Q. `randonneursSommet` — pont QUELCONQUE (`resoudrePontSommetPartageQuelconque`,
 *    `pontSommetPartage.ts`), grandeur demandée = un CÔTÉ (la distance entre les 2 mobiles).
 * R. `avionsConvergents` — pont RECTANGLE (angle droit AU SOMMET COMMUN, 2 routes perpendiculaires —
 *    seule famille du générateur où l'angle droit coïncide avec le sommet partagé, puisque ce
 *    sommet doit rester `A` par convention), grandeur demandée = l'AIRE.
 */
export type FamilleTriangleLies =
  | "terrainRectangle"
  | "terrainQuelconque"
  | "hauteurInaccessible"
  | "distanceInaccessible"
  | "terrainSportif"
  | "inclinaisonCable"
  | "hauteurArbre"
  | "sectionFalaise"
  | "naviresConvergents"
  | "randonneursSommet"
  | "avionsConvergents";

export type TypeTrianglePont = "rectangle" | "quelconque";

export type GrandeurDemandeeTriangleLies = "cote" | "angle" | "aire";

/** Une donnée numérique GIVEN affichée à l'élève (bloc de données d'un écran) — jamais une valeur à
 * calculer, seulement de la lecture. */
export interface DonneeAfficheeTriangleLies {
  label: string;
  valeur: number;
  unite: string;
}

/** Un point nommé du croquis Mafs (coordonnées réelles, échelle réelle — jamais un croquis
 * schématique comme `TriangleSketch`/`TriangleQuelconqueSketch`). */
export interface PointTriangleLies {
  nom: string;
  x: number;
  y: number;
}

/** Une option de l'écran "interpretation" (QCM) — une seule `correcte: true`, ordre mélangé à la
 * génération, fixe pour l'instance (même principe que `optimisation.types.ts::OptionInterpretation`). */
export interface OptionInterpretationTriangleLies {
  texte: string;
  correcte: boolean;
}

export interface ExerciceTriangleLies {
  famille: FamilleTriangleLies;
  variante: VarianteTriangleLies;
  typeTrianglePont: TypeTrianglePont;
  grandeurDemandee: GrandeurDemandeeTriangleLies;

  /** Phrase(s) d'introduction du contexte narratif, affichée(s) en tête de chaque écran. */
  contexte: string;

  /** Triangle "pont" résolu — vérité terrain, toujours en degrés. Le côté transféré vers le
   * triangle cible est toujours `trianglePont.a` (voir convention en tête de fichier). */
  trianglePont: Triangle;
  /** Données données à l'élève pour résoudre le triangle pont — 2 entrées si `rectangle` (2
   * mesures suffisent avec l'angle droit implicite), jusqu'à 3 si `quelconque` (SAS : 2 côtés +
   * l'angle compris). */
  donneesPont: DonneeAfficheeTriangleLies[];
  /** Nom narratif du côté transféré (ex. "AC", "OM") — pour l'affichage de la question et du
   * bloc "état actuel", jamais pour la vérification (qui compare toujours à `trianglePont.a`). */
  labelCoteTransfere: string;
  /** Question complète de l'écran "pont" (déjà mise en forme, spécifique à la famille). */
  questionPont: string;

  /** Uniquement pour `anglePartage` — les 2 angles de visée bruts, pris depuis le MÊME point
   * d'observation vers 2 cibles différentes, affichés à l'écran "angles" ; leur différence donne
   * `triangleCible.B` (l'angle utile). `null` pour `cotePartage` (écran absent, rien à calculer —
   * les 2 angles qui ferment le triangle cible sont déjà donnés directement dans l'énoncé). */
  anglesBrutsVisee: [DonneeAfficheeTriangleLies, DonneeAfficheeTriangleLies] | null;
  /** Texte de l'hypothèse annexe propre au contexte, qui ferme le 3e angle (`triangleCible.C`) —
   * non `null` si et seulement si `variante === "anglePartage"`. */
  hypotheseAnnexe: string | null;

  /** Uniquement pour `sommetPartage` — les 2 distances déjà parcourues par les mobiles, données
   * narrativement, à soustraire respectivement à `trianglePont.b`/`.c` pour obtenir
   * `triangleCible.b`/`.c` (écran "soustraction") — `distancesParcourues[0]` correspond toujours à
   * `trianglePont.b`, `distancesParcourues[1]` à `trianglePont.c`. `null` pour les 2 autres
   * configurations (écran absent, rien à soustraire). */
  distancesParcourues: [DonneeAfficheeTriangleLies, DonneeAfficheeTriangleLies] | null;

  /** Triangle "cible" résolu — vérité terrain. `triangleCible.a === trianglePont.a` (côté
   * partagé) ; `triangleCible.B`/`triangleCible.C` sont les 2 angles qui le ferment par ASA. */
  triangleCible: Triangle;
  /** Les 2 angles déjà donnés dans l'énoncé pour `cotePartage` (valeurs = `triangleCible.B`/`.C`,
   * dupliquées ici uniquement pour l'affichage) — tableau vide pour `anglePartage` (calculés à
   * l'écran "angles" à la place). */
  donneesCibleEnonce: DonneeAfficheeTriangleLies[];
  /** Question complète de l'écran de résolution du triangle cible. */
  questionCible: string;
  /** Valeur attendue à l'écran final (côté/angle/aire), pré-calculée une fois pour toutes — jamais
   * recalculée côté vérification (même principe que `exercice.solution` ailleurs sur la plateforme). */
  valeurCibleAttendue: number;
  uniteGrandeurCible: string;

  /** Géométrie du croquis Mafs (coordonnées réelles) — un point nommé par sommet réellement utilisé
   * (pont ∪ cible, un sommet partagé n'apparaît qu'une fois), et les segments formant chaque
   * triangle (paires de noms de points, réutilisant `points`). */
  points: PointTriangleLies[];
  segmentsPont: [string, string][];
  segmentsCible: [string, string][];

  optionsInterpretation: OptionInterpretationTriangleLies[];
}

export type GenerateurExerciceTriangleLies = () => ExerciceTriangleLies;
