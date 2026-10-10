import type { PointExtraSolide3D, SegmentExtraSolide3D } from "../components/Solide3DSketch";
import type { FaceSolide3D, Point3D, Solide3D } from "../core/geometrieEspace.types";
import type {
  DirectionCandidate,
  ExerciceOmbreSoleil,
  ExerciceOmbreSoleilDirectionInconnue,
  ExerciceOmbreSoleilObstacle,
  ObstacleOmbreSoleil,
  Piquet,
  PiquetAResoudre,
} from "../core/ombreSoleil.types";
import { additionner3D, multiplierScalaire3D, soustraire3D } from "../moteur/geometrieEspace";
import { ombreDepuis, solideCollision, sommetPiquet, verifierDirection } from "../moteur/verificationOmbreSoleil";

/** Les 2 variantes à boucle — jamais "simple", qui n'a pas de tableau `obstacles`/`piquets`. */
export type ExerciceOmbreSoleilBoucle = ExerciceOmbreSoleilObstacle | ExerciceOmbreSoleilDirectionInconnue;

/**
 * Présentation — "Ombre au soleil" (41e générateur, chapitre "Géométrie dans l'espace").
 * Terminologie interdite dans tout texte affiché à l'élève : "déterminant", "produit scalaire"
 * (même règle que "Position droite/plan"/"Section plane d'un solide"). Aucune saisie libre nulle
 * part (sélection uniquement, spec section "Vérification") — jamais de `StatutVerification`, le
 * message générique "Incorrect — tentative N/M" suffit partout.
 *
 * **La direction de lumière n'est JAMAIS montrée numériquement** — chaque écran de sélection
 * présente 4 candidats génériques ("Candidat 1".."4"), l'ordre étant MÉLANGÉ à l'affichage
 * (`ordreAffichageCandidats`) pour que le premier candidat de `exercice.directionsCandidates`
 * (toujours la vraie direction, `id==="d0"`) ne se retrouve jamais systématiquement à la même
 * position visuelle d'un exercice à l'autre — sans ce mélange, l'élève apprendrait par réflexe
 * "le premier bouton est toujours bon" plutôt qu'à raisonner. Un seul aperçu (le candidat
 * actuellement sélectionné) est tracé à la fois sur le croquis, jamais les 4 simultanément — même
 * principe que "Section plane d'un solide" (`apercuSegmentFace`).
 *
 * **Extension (section 2) — variante `obstacle` refondue autour d'un "bâton" isolé + 1 à 3
 * solides-obstacles réels** (`core/ombreSoleil.types.ts`, `ObstacleAResoudre`) : `itemBoucleCourant`
 * centralise TOUTE la divergence entre les 2 variantes à boucle en un seul point plutôt que de la
 * disperser dans chaque composant `Etape*.tsx` — pour `obstacle`, l'origine du rayon reste le MÊME
 * bâton à chaque itération (jamais un nouveau piquet), l'obstacle testé change (déjà filtré via
 * `solideCollision`) ; pour `directionInconnue`, chaque itération porte son propre piquet, jamais
 * d'obstacle (toujours le sol seul, comportement historique inchangé).
 */

/** Fisher-Yates — copie mélangée, jamais l'ordre canonique de `exercice.directionsCandidates`
 * (voir l'en-tête du fichier). */
export function ordreAffichageCandidats(candidats: readonly DirectionCandidate[]): DirectionCandidate[] {
  const copie = [...candidats];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

// --- Croquis — solide de cadrage synthétique --------------------------------------------------------

const MARGE_SOL = 3;
const COULEUR_PIQUET = "#495057";
const COULEUR_EXEMPLE = "#868e96";
const COULEUR_SELECTION = "#f08c00";

interface BornesSol {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

/** Englobe les piquets/bâtons affichés ET, désormais, la GÉOMÉTRIE RÉELLE de chaque solide-obstacle
 * (tous ses sommets, pas seulement un rectangle abstrait — voir `cadrageSolide`) — le rectangle du
 * sol doit rester assez grand pour border correctement une caisse ou un escalier de plusieurs
 * marches, jamais seulement les positions x/y d'un ancien "mur plat" ponctuel. */
function bornesScene(piquetsVisibles: readonly Piquet[], obstacles: readonly ObstacleOmbreSoleil[]): BornesSol {
  const xs = piquetsVisibles.map((p) => p.base.x);
  const ys = piquetsVisibles.map((p) => p.base.y);
  for (const obstacle of obstacles) {
    for (const sommet of Object.values(obstacle.solide.sommets)) {
      xs.push(sommet.x);
      ys.push(sommet.y);
    }
  }
  return {
    xMin: Math.min(...xs) - MARGE_SOL,
    xMax: Math.max(...xs) + MARGE_SOL,
    yMin: Math.min(...ys) - MARGE_SOL,
    yMax: Math.max(...ys) + MARGE_SOL,
  };
}

/**
 * Solide de CADRAGE synthétique — jamais un vrai gabarit (`generateurs/solide3D/gabarits.ts`, hors
 * de propos ici, voir `core/ombreSoleil.types.ts`) : seulement de quoi border correctement le
 * viewBox de `Solide3DSketch` (dérivé UNIQUEMENT de `solide.sommets`, voir `ui/solide3DSketch.ts`) —
 * le rectangle du sol (toujours présent, dessiné en trait), la base/le sommet de chaque piquet en
 * sommets NON reliés par aucune face (jamais dans le wireframe, juste pour englober correctement
 * leur hauteur dans le calcul du viewBox), et, depuis l'extension (section 2), le wireframe RÉEL de
 * chaque solide-obstacle fusionné dans ce même solide de cadrage (sommets/faces préfixés par index,
 * `obs${i}_${nom}`, pour ne jamais collisionner entre deux obstacles ni avec le sol/les piquets).
 * `id` fixé à une valeur arbitraire du catalogue partagé (jamais utilisé ailleurs pour ce
 * générateur) — seul le type `NomSolide3D` l'exige, cette valeur n'est jamais affichée ni comparée.
 *
 * **Limite cosmétique acceptée, jamais corrigée dans le code partagé** : `normaleExterieureFace`
 * (`ui/solide3DSketch.ts`) décide si une face est visible/cachée en la comparant au centroïde
 * GLOBAL de TOUS les sommets du solide passé — pour une scène à plusieurs obstacles potentiellement
 * éloignés les uns des autres, cette heuristique peut se tromper sur la visibilité de certaines
 * faces d'obstacle (rendu plein/pointillé) sans jamais toucher la vérité terrain (qui vit
 * exclusivement dans `moteur/verificationOmbreSoleil.ts`, jamais recalculée ici) — un risque
 * purement visuel, délibérément accepté plutôt que de modifier `solide3DSketch.ts`, partagé et
 * correct pour "Position droite/plan"/"Section plane d'un solide" (gabarits convexes uniques).
 */
export function cadrageSolide(piquetsVisibles: readonly Piquet[], obstacles: readonly ObstacleOmbreSoleil[] = []): Solide3D {
  const bornes = bornesScene(piquetsVisibles, obstacles);
  const sommets: Record<string, Point3D> = {
    sol1: { x: bornes.xMin, y: bornes.yMin, z: 0 },
    sol2: { x: bornes.xMax, y: bornes.yMin, z: 0 },
    sol3: { x: bornes.xMax, y: bornes.yMax, z: 0 },
    sol4: { x: bornes.xMin, y: bornes.yMax, z: 0 },
  };
  const faces: FaceSolide3D[] = [["sol1", "sol2", "sol3", "sol4"]];

  piquetsVisibles.forEach((piquet, index) => {
    sommets[`piquet${index}base`] = piquet.base;
    sommets[`piquet${index}tip`] = sommetPiquet(piquet);
  });

  obstacles.forEach((obstacle, indexObstacle) => {
    for (const [nom, point] of Object.entries(obstacle.solide.sommets)) {
      sommets[`obs${indexObstacle}_${nom}`] = point;
    }
    for (const face of obstacle.solide.faces) {
      faces.push(face.map((nom) => `obs${indexObstacle}_${nom}`));
    }
  });

  return { id: "cube", label: "", sommets, faces };
}

/** Segment vertical (base→sommet) d'un piquet — toujours dans une couleur dédiée, jamais confondu
 * avec un rayon de lumière (toujours en pointillé). */
export function segmentPiquet(piquet: Piquet, couleur = COULEUR_PIQUET): SegmentExtraSolide3D {
  return { a: piquet.base, b: sommetPiquet(piquet), couleur };
}

/** Marqueur au sommet du piquet, étiqueté par son id (déjà attribué par la Couche A — "A".."D",
 * "E" pour l'exemple/le piquet connu). */
export function pointSommetPiquet(piquet: Piquet, couleur = COULEUR_PIQUET): PointExtraSolide3D {
  return { position: sommetPiquet(piquet), label: piquet.id, couleur };
}

/** L'exemple déjà résolu (variantes A/B) — segment piquet + rayon lumineux (pointillé) + marqueur
 * d'ombre, toujours dans la couleur "exemple" neutre, jamais confondue avec la sélection en cours. */
export function elementsExemple(piquetExemple: Piquet, ombreExemple: Point3D): { points: PointExtraSolide3D[]; segments: SegmentExtraSolide3D[] } {
  return {
    points: [pointSommetPiquet(piquetExemple, COULEUR_EXEMPLE), { position: ombreExemple, label: "Exemple", couleur: COULEUR_EXEMPLE }],
    segments: [segmentPiquet(piquetExemple, COULEUR_EXEMPLE), { a: sommetPiquet(piquetExemple), b: ombreExemple, couleur: COULEUR_EXEMPLE, pointille: true }],
  };
}

const LONGUEUR_APERCU_DIRECTION = 3;

function normaliser(v: Point3D): Point3D {
  const norme = Math.hypot(v.x, v.y, v.z) || 1;
  return multiplierScalaire3D(v, 1 / norme);
}

/** Aperçu (pointillé orange) du candidat de DIRECTION actuellement sélectionné — un segment de
 * longueur FIXE depuis le sommet du piquet (jamais jusqu'à son vrai point d'ombre, qui révélerait
 * la réponse de l'étape "point" suivante) : seule la PENTE du segment doit être comparée à
 * l'exemple, jamais sa longueur. `null` tant qu'aucun candidat n'est sélectionné. */
export function apercuDirection(piquet: Piquet, candidat: DirectionCandidate | null): SegmentExtraSolide3D | null {
  if (!candidat) return null;
  const sommet = sommetPiquet(piquet);
  const bout = additionner3D(sommet, multiplierScalaire3D(normaliser(candidat.vecteur), LONGUEUR_APERCU_DIRECTION));
  return { a: sommet, b: bout, couleur: COULEUR_SELECTION, pointille: true };
}

/** Aperçu (rayon pointillé + marqueur) du candidat de POINT D'OMBRE actuellement sélectionné —
 * calculé RÉELLEMENT via `ombreDepuis` (jamais une position approximative), avec l'obstacle RÉEL de
 * l'item de boucle courant s'il y en a un (déjà filtré via `solideCollision`, voir
 * `itemBoucleCourant`). `null` tant qu'aucun candidat n'est sélectionné. */
export function apercuPoint(
  piquet: Piquet,
  candidat: DirectionCandidate | null,
  obstacle: Solide3D | undefined,
): { point: PointExtraSolide3D; segment: SegmentExtraSolide3D } | null {
  if (!candidat) return null;
  const sommet = sommetPiquet(piquet);
  const ombre = ombreDepuis(sommet, candidat.vecteur, obstacle);
  return {
    point: { position: ombre, label: "?", couleur: COULEUR_SELECTION },
    segment: { a: sommet, b: ombre, couleur: COULEUR_SELECTION, pointille: true },
  };
}

// --- Textes ------------------------------------------------------------------------------------------

export const CONSIGNE_POINT_SIMPLE =
  "Un piquet vertical projette une ombre sur le sol, dans la direction du soleil illustrée par l'exemple ci-dessous. Sélectionne le bon point d'ombre.";

export const TEXTE_AIDE_POINT_SIMPLE_NIVEAU1 =
  "Rappel de la méthode : trace, depuis le sommet du piquet, une droite PARALLÈLE à la direction de l'exemple (jamais verticale) — c'est elle qui indique où tombe l'ombre.";

export const TEXTE_AIDE_POINT_SIMPLE_NIVEAU2 =
  "La droite correcte est désormais tracée depuis le sommet du piquet — il ne reste plus qu'à repérer où elle rencontre le sol parmi les candidats proposés.";

export const CONSIGNE_DIRECTION =
  "Sélectionne, parmi les 4 candidats, la droite RÉELLEMENT parallèle à la direction du soleil illustrée par l'exemple.";

export const TEXTE_AIDE_DIRECTION_NIVEAU1 =
  "Rappel de la méthode : la lumière frappe tous les objets dans EXACTEMENT la même direction — compare la pente de chaque candidat à celle de l'exemple, jamais à la verticale.";

export const CONSIGNE_POINT =
  "Sélectionne, parmi les 4 candidats, le point où l'ombre de ce piquet touche réellement une surface.";

/** Aide 2, PARTAGÉE entre les 2 sous-étapes d'un même item de boucle (spec, variante B/C) — révèle
 * uniquement la SURFACE réellement touchée (obstacle ou sol direct), jamais le point exact. Prend
 * toujours une forme `PiquetAResoudre` — pour la variante `obstacle`, `itemBoucleCourant` construit
 * un wrapper synthétique autour de l'obstacle réellement testé à cette itération, jamais un second
 * texte dédié. */
export function texteAideNiveau2SurfaceTouchee(piquet: PiquetAResoudre): string {
  return piquet.surObstacle
    ? "L'ombre de ce piquet touche l'obstacle — elle ne va pas jusqu'au sol."
    : "L'ombre de ce piquet passe au-dessus de tout obstacle et touche directement le sol.";
}

export const CONSIGNE_DIRECTION_INCONNUE =
  "Voici un piquet et son ombre déjà connus. Déduis-en, parmi les 4 candidats, la direction réelle de la lumière — jamais devinée, toujours déduite de cette seule paire.";

export const TEXTE_AIDE_DIRECTION_INCONNUE_NIVEAU1 =
  "Rappel de la méthode : la bonne direction est celle qui relie EXACTEMENT le sommet du piquet connu à son ombre déjà observée — compare chaque candidat à cette paire, jamais à une supposition.";

export const TEXTE_AIDE_DIRECTION_INCONNUE_NIVEAU2 =
  "La direction correcte relie exactement le sommet du piquet connu à l'ombre déjà observée sur le croquis.";

export function libelleCandidat(index: number): string {
  return `Candidat ${index + 1}`;
}

/** Titre affiché en tête d'écran, jamais un identifiant de code (`ExerciceOmbreSoleil` n'a pas de
 * champ "titre" — dérivé ici uniquement de la variante, pour rester cohérent avec le reste du
 * projet où la présentation ne relit jamais un identifiant technique). */
export function titreVariante(exercice: ExerciceOmbreSoleil): string {
  if (exercice.variante === "simple") return "Ombre simple";
  if (exercice.variante === "obstacle") return "Ombre avec obstacle";
  return "Direction inconnue";
}

/** Progression au sein de la boucle (variantes B/C) — un compteur live, toujours dérivé de l'état
 * vivant, jamais une formule fragile (même principe que "Section plane d'un solide"). Le nom de
 * l'unité comptée diverge selon la variante — "obstacles" pour `obstacle` (une itération de boucle
 * = un solide-obstacle, jamais un piquet — voir `core/ombreSoleil.types.ts`), "piquets" pour
 * `directionInconnue` (comportement historique inchangé). */
export function texteProgressionBoucle(exercice: ExerciceOmbreSoleilBoucle, nombreResolus: number): string {
  if (exercice.variante === "obstacle") {
    return `Obstacles résolus : ${nombreResolus}/${exercice.obstacles.length}`;
  }
  return `Piquets résolus : ${nombreResolus}/${exercice.piquets.length}`;
}

/** Vérité utilitaire uniquement — `soustraire3D`/`sommetPiquet` réutilisées ici pour rester
 * cohérentes avec les calculs de vérification, jamais une seconde formule divergente. */
export function directionReelleVersOmbre(piquet: Piquet, ombre: Point3D): Point3D {
  return soustraire3D(ombre, sommetPiquet(piquet));
}

// --- Item de boucle courant — centralise TOUTE la divergence entre les 2 variantes à boucle -------

/** Toutes les données nécessaires aux 2 écrans de la boucle (`EtapeDirectionOmbre`/`EtapePointOmbre`)
 * pour l'item COURANT (index `resolus.length`) — un seul point de dispatch par variante, jamais
 * dispersé dans chaque composant. */
export interface ItemBoucleCourant {
  /** Piquet dont le sommet sert d'origine au rayon lumineux — le BÂTON pour `obstacle` (le MÊME
   * objet à travers toute la boucle, jamais un nouveau piquet par obstacle), le piquet propre à cet
   * index pour `directionInconnue`. */
  piquetOrigine: Piquet;
  /** Solide de collision RÉEL testé pour cet item (déjà filtré via `solideCollision`, jamais le
   * solide brut d'un escalier) — `undefined` pour `directionInconnue`, qui ne teste jamais
   * d'obstacle (toujours le sol seul, `verifierPointOmbre`). */
  obstacle: Solide3D | undefined;
  /** Vérité terrain de cet item, sous une forme `PiquetAResoudre`-compatible — pour `obstacle`, un
   * wrapper SYNTHÉTIQUE autour du bâton + l'ombre réelle de CET obstacle précis (`ObstacleAResoudre`
   * n'a pas lui-même de champ `piquet`), pour réutiliser telle quelle
   * `texteAideNiveau2SurfaceTouchee` sans texte dédié. */
  verite: PiquetAResoudre;
}

export function itemBoucleCourant(exercice: ExerciceOmbreSoleilBoucle, index: number): ItemBoucleCourant {
  if (exercice.variante === "obstacle") {
    const obstacleResoudre = exercice.obstacles[index];
    return {
      piquetOrigine: exercice.baton,
      obstacle: solideCollision(obstacleResoudre.obstacle),
      verite: { piquet: exercice.baton, ombre: obstacleResoudre.ombre, surObstacle: obstacleResoudre.surObstacle },
    };
  }
  const piquetResoudre = exercice.piquets[index];
  return { piquetOrigine: piquetResoudre.piquet, obstacle: undefined, verite: piquetResoudre };
}

// --- Cadrage/éléments cumulatifs, communs aux écrans d'un même exercice --------------------------

/** Tous les piquets réellement montrés au cours de l'exercice (exemple/connu compris) — sert
 * UNIQUEMENT à border le viewBox (`cadrageSolide`) : calculé une seule fois par exercice pour que le
 * cadrage reste STABLE d'un écran à l'autre. Pour `obstacle`, un seul bâton (jamais un par
 * obstacle — c'est le MÊME bâton résolu à chaque itération de la boucle, voir `itemBoucleCourant`) ;
 * les solides-obstacles eux-mêmes sont fusionnés séparément, voir `obstaclesDeExercice`/
 * `cadrageSolide`. */
export function piquetsPourCadrage(exercice: ExerciceOmbreSoleil): Piquet[] {
  if (exercice.variante === "simple") return [exercice.piquetExemple, exercice.piquet.piquet];
  if (exercice.variante === "obstacle") return [exercice.piquetExemple, exercice.baton];
  return [exercice.piquetConnu, ...exercice.piquets.map((p) => p.piquet)];
}

/** Les solides-obstacles RÉELS de l'exercice, à fusionner dans le solide de cadrage
 * (`cadrageSolide`) — toujours vide pour `simple`/`directionInconnue` (ni l'un ni l'autre n'a de
 * notion d'obstacle). */
export function obstaclesDeExercice(exercice: ExerciceOmbreSoleil): ObstacleOmbreSoleil[] {
  return exercice.variante === "obstacle" ? exercice.obstacles.map((o) => o.obstacle) : [];
}

/**
 * Solide RÉELLEMENT affiché pour un exercice — variantes "simple"/"obstacle" (modèle bâton isolé,
 * voir `core/ombreSoleil.types.ts`) : le solide de cadrage synthétique habituel (`cadrageSolide`),
 * désormais enrichi du wireframe RÉEL de chaque solide-obstacle pour `obstacle` (jamais un mur plat
 * abstrait). Variante "directionInconnue" (le seul cas où l'objet projeté EST un vrai gabarit) : le
 * VRAI solide tiré (`exercice.solide`), sommets et faces intacts — wireframe complet affiché,
 * jamais réduit à un cube synthétique — étendu de sommets VIRTUELS jamais référencés par aucune
 * face (donc jamais une arête supplémentaire tracée), un par ombre déjà connue à l'avance
 * (`ombreConnue` + chaque `piquets[i].ombre`, toujours vérité terrain déjà calculée), pour que le
 * viewBox les cadre correctement dès le premier écran — cadrage stable d'un écran à l'autre, même
 * principe que `piquetsPourCadrage`/`cadrageSolide` pour les 2 autres variantes.
 */
export function solidePourAffichage(exercice: ExerciceOmbreSoleil): Solide3D {
  if (exercice.variante !== "directionInconnue") {
    return cadrageSolide(piquetsPourCadrage(exercice), obstaclesDeExercice(exercice));
  }
  const sommets: Record<string, Point3D> = { ...exercice.solide.sommets };
  sommets.ombreConnueCadrage = exercice.ombreConnue;
  exercice.piquets.forEach((p, index) => {
    sommets[`ombreCadrage${index}`] = p.ombre;
  });
  return { ...exercice.solide, sommets };
}

/** Retrouve, parmi les 4 candidats, celui qui correspond RÉELLEMENT à la vraie direction — jamais
 * un id câblé en dur (`"d0"`, toujours vrai par construction côté Couche A, voir
 * `ombreGeometrie.ts::construireDirectionsCandidates`, mais jamais supposé ici) : dérivé via la même
 * fonction de vérité terrain que la Couche B, cohérent avec le reste du projet (ex. "Section plane
 * d'un solide"/"Colinéarité", qui retrouvent toujours la bonne réponse par re-vérification, jamais
 * par position dans un tableau). Sert uniquement à dessiner l'aide de niveau 2 (droite déjà tracée),
 * jamais à décider l'ordre d'affichage des boutons (voir `ordreAffichageCandidats`). */
export function directionCorrecte(exercice: ExerciceOmbreSoleil): DirectionCandidate {
  const trouve = exercice.directionsCandidates.find((c) => verifierDirection(exercice, c.id));
  if (!trouve) throw new Error("directionCorrecte : aucun candidat ne correspond à la vraie direction — exercice mal formé");
  return trouve;
}

const COULEUR_OMBRE_FINALE = "#2f9e44";

/** Image complète d'un piquet déjà résolu — segment vertical, rayon lumineux (pointillé) jusqu'à son
 * ombre réelle, et le marqueur d'ombre lui-même. Réutilisée à la fois pour les items déjà validés
 * pendant la boucle (`elementsResolus`) et pour l'écran de conclusion (`elementsConclusion`). */
function elementsPiquetResolu(pr: PiquetAResoudre, couleur = COULEUR_OMBRE_FINALE): { points: PointExtraSolide3D[]; segments: SegmentExtraSolide3D[] } {
  return {
    points: [pointSommetPiquet(pr.piquet), { position: pr.ombre, label: `Ombre ${pr.piquet.id}`, couleur }],
    segments: [segmentPiquet(pr.piquet), { a: sommetPiquet(pr.piquet), b: pr.ombre, couleur, pointille: true }],
  };
}

/** Image d'un obstacle déjà résolu de la boucle `obstacle` — le bâton (segment + marqueur de
 * sommet) reste le MÊME à chaque itération (jamais redessiné en double, `elementsResolus` ne
 * l'ajoute qu'une fois via `itemBoucleCourant`/le composant appelant) : cette fonction ne produit
 * que le rayon + le marqueur d'ombre propres à CET obstacle précis, étiqueté par son rang
 * d'affichage (`"Ombre 1"`, `"Ombre 2"`...) plutôt que par un id de piquet partagé par tous. */
function elementsObstacleResolu(baton: Piquet, obstacleResoudre: { ombre: Point3D }, indexAffiche: number, couleur = COULEUR_OMBRE_FINALE): { points: PointExtraSolide3D[]; segments: SegmentExtraSolide3D[] } {
  const sommet = sommetPiquet(baton);
  return {
    points: [{ position: obstacleResoudre.ombre, label: `Ombre ${indexAffiche + 1}`, couleur }],
    segments: [{ a: sommet, b: obstacleResoudre.ombre, couleur, pointille: true }],
  };
}

/** Items déjà validés de la boucle courante (indices dans `resolus`), affichés en PLUS de l'exemple
 * et de l'item en cours — l'élève voit ainsi tout son travail déjà accompli rester visible d'un item
 * à l'autre, jamais effacé (même principe que `connus`/`segmentsTraces`, "Section plane d'un
 * solide"). Pour `obstacle`, chaque index résolu produit un rayon+marqueur d'ombre distinct depuis
 * le MÊME bâton (jamais redessiné en double) ; pour `directionInconnue`, comportement historique
 * inchangé (un piquet complet par index). */
export function elementsResolus(exercice: ExerciceOmbreSoleilBoucle, resolus: number[]): { points: PointExtraSolide3D[]; segments: SegmentExtraSolide3D[] } {
  const points: PointExtraSolide3D[] = [];
  const segments: SegmentExtraSolide3D[] = [];
  if (exercice.variante === "obstacle") {
    for (const index of resolus) {
      const { points: p, segments: s } = elementsObstacleResolu(exercice.baton, exercice.obstacles[index], index);
      points.push(...p);
      segments.push(...s);
    }
    return { points, segments };
  }
  for (const index of resolus) {
    const { points: p, segments: s } = elementsPiquetResolu(exercice.piquets[index]);
    points.push(...p);
    segments.push(...s);
  }
  return { points, segments };
}

/** Image finale, écran de conclusion — "relier les points-ombres pour reconstituer l'ombre
 * complète" (spec, étape 4). Pour "simple" (un seul piquet) et "obstacle" (un seul bâton, dont
 * seule la VÉRITÉ TERRAIN GLOBALE de la scène compte — `exercice.ombre`/`indexObstacleTouche`,
 * jamais les N résultats hypothétiques testés indépendamment pendant la boucle), aucun segment de
 * liaison — rien à relier, une seule ombre réelle. Pour "directionInconnue" (plusieurs vrais
 * sommets du même gabarit), tous les piquets reliés entre eux dans l'ordre de résolution. */
export function elementsConclusion(exercice: ExerciceOmbreSoleil): { points: PointExtraSolide3D[]; segments: SegmentExtraSolide3D[] } {
  if (exercice.variante === "simple") {
    return elementsPiquetResolu(exercice.piquet);
  }
  if (exercice.variante === "obstacle") {
    const verite: PiquetAResoudre = { piquet: exercice.baton, ombre: exercice.ombre, surObstacle: exercice.indexObstacleTouche !== null };
    return elementsPiquetResolu(verite);
  }
  const points: PointExtraSolide3D[] = [];
  const segments: SegmentExtraSolide3D[] = [];
  for (const pr of exercice.piquets) {
    const { points: p, segments: s } = elementsPiquetResolu(pr);
    points.push(...p);
    segments.push(...s);
  }
  for (let i = 0; i < exercice.piquets.length - 1; i++) {
    segments.push({ a: exercice.piquets[i].ombre, b: exercice.piquets[i + 1].ombre, couleur: COULEUR_OMBRE_FINALE });
  }
  return { points, segments };
}
