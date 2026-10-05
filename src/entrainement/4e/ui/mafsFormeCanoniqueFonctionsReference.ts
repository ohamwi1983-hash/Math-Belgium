import type { FamilleReference } from "../core/fonctionsReference.types";
import { evaluerFonctionReference } from "../moteur/verificationFonctionsReference";
import {
  RATIO_GRAPHE,
  U_CIBLE,
  ZOOM_MAX,
  ZOOM_MIN,
  calculerPasGrille,
  calculerSegments,
  calculerSegmentsVisibles,
  formatEtiquetteGrille,
} from "./mafsFonctionsReference";
import type { SegmentTrace } from "./mafsFonctionsReference";

export { RATIO_GRAPHE, ZOOM_MAX, ZOOM_MIN, calculerPasGrille, formatEtiquetteGrille, calculerSegments };
export type { SegmentTrace };

/**
 * Graphe Mafs pour "Forme canonique et transformations — fonctions de référence" (chapitre 2) :
 * généralise `calculerViewBoxFonctionReference` (`mafsFonctionsReference.ts`, "Transformations
 * graphiques — fonctions de référence") de 2 courbes (cible + live) à N courbes simultanées — même
 * mouvement que `calculerViewBoxMultiple` (`mafsTransformation.ts`, "Forme canonique et
 * transformations" chapitre 1), qui généralise de la même façon `calculerViewBoxTransformation`.
 * Nouvelle fonction plutôt que modification du fichier existant, pour ne jamais risquer de
 * régression sur son seul autre consommateur (`MafsGraphFonctionsReference.tsx`) — `ajusterAuRatio`
 * y est déjà dupliquée pour la même raison (voir son commentaire).
 */
export interface ParametresCourbeFR {
  famille: FamilleReference;
  th: number;
  tv: number;
  ch: number;
  eh: number;
  ev: number;
  cv: number;
  sox: boolean;
  soy: boolean;
}

export interface ViewBoxFonctionReferenceFR {
  x: [number, number];
  y: [number, number];
}

function ajusterAuRatio(x: [number, number], y: [number, number], ratio: number): ViewBoxFonctionReferenceFR {
  const largeurZone = x[1] - x[0];
  const hauteurZone = y[1] - y[0];
  const ratioZone = largeurZone / hauteurZone;

  if (ratioZone > ratio) {
    const centreY = (y[0] + y[1]) / 2;
    const demiHauteur = largeurZone / ratio / 2;
    return { x, y: [centreY - demiHauteur, centreY + demiHauteur] };
  }

  const centreX = (x[0] + x[1]) / 2;
  const demiLargeur = (hauteurZone * ratio) / 2;
  return { x: [centreX - demiLargeur, centreX + demiLargeur], y };
}

const ECHANTILLONS_PAR_SEGMENT = 30;

/** Plancher minimal du padding autour d'une courbe (voir `ratioAvecPadding`/
 * `calculerViewBoxFonctionReferenceMultiple`) — même principe et même diagnostic que
 * `mafsFonctionsReference.ts::PADDING_MIN` (dixième exercice, dupliqué pas importé — présentation
 * pure, même duplication assumée que `ajusterAuRatio`), mais recalibré INDÉPENDAMMENT pour ce
 * générateur, jamais copié tel quel : un plancher ABSOLU fixe à 1 unité (l'ancien comportement)
 * devenait dominant dès qu'une courbe se resserrait sous ~8 unités — un cas encore plus fréquent ici
 * que pour le dixième exercice, ce générateur autorisant CH/EH ET EV/CV simultanément non-neutres
 * (79,7% des tirages réels sur un balayage de 4800, contre structurellement 0% pour le dixième
 * exercice, qui impose "un seul canal actif à la fois"). Round 2 (correctif demandé directement en
 * conversation, sans fichier prompt dédié, immédiatement après celui du dixième exercice) : abaissé
 * à 0,3 (jamais 0,1 comme le dixième exercice — voir `U_MIN_CADRAGE` ci-dessous pour la raison exacte
 * de cette divergence, propre à ce générateur). */
export const PADDING_MIN = 0.3;

/** Plancher de fenêtre en U-espace — recalibré au round 2 en même temps que `PADDING_MIN`
 * (0,7, abaissé depuis 1,5), jamais indépendamment : les deux paramètres interagissent (voir
 * `ratioAvecPadding`) et un balayage empirique dédié à CE générateur (jamais une réutilisation des
 * constantes du dixième exercice, dont les contraintes diffèrent — voir `PADDING_MIN` ci-dessus)
 * a montré qu'un plancher trop bas (`PADDING_MIN=0,1`, comme le dixième exercice) DÉGRADE
 * l'occupation moyenne malgré une baisse de `U_MIN_CADRAGE` compensatoire, à cause d'une famille
 * structurellement scale-invariante absente du dixième exercice : pour `valeur_absolue`
 * (`|k·u|=k·|u|`, déjà documenté pour la note "curseurs" du dixième exercice), le ratio naturel
 * largeur/hauteur d'une courbe reste EXACTEMENT constant quelle que soit la fenêtre `u` choisie —
 * aucune recherche de fenêtre ne peut jamais corriger son aspect ratio, seul le padding ABSOLU (donc
 * un plancher suffisamment généreux, pas trop réduit) le peut, en refusant de rétrécir
 * proportionnellement à la courbe. Le couple `(U_MIN_CADRAGE=0,7, PADDING_MIN=0,3)` a été retenu
 * après un balayage de grille comparatif (4800 tirages × plusieurs couples, méthode "verify before
 * fixing") sur les DEUX scénarios d'usage réels du générateur — la courbe cible seule (écrans
 * "reconnaissance"/"canonique") ET les 4 traces simultanées de l'écran "tv" (le cas le plus exigeant
 * documenté) : améliore les deux métriques d'occupation (X et Y) sur les deux scénarios (moyennes
 * d'occupation +8 à +9 points, nombre de cas sévèrement écrasés `<10%` réduit de 36% à 53% selon la
 * métrique) SANS jamais dégrader le pire cas déjà connu (`valeur_absolue` à canaux CH/EH et EV/CV
 * combinés, dont le ratio scale-invariant reste identiquement mauvais quel que soit le couple choisi
 * — confirmé qu'il ne s'agit jamais d'une régression introduite par ce correctif, seulement d'un cas
 * pré-existant hors de portée de toute stratégie de fenêtrage). */
export const U_MIN_CADRAGE = 0.7;

/** Nombre de fenêtres candidates balayées par `uCadrageAdapteFR` (grille, pas bissection — voir sa
 * documentation). */
const NB_CANDIDATS_CADRAGE = 13;

/** Même garde-fou que `mafsFonctionsReference.ts::AMELIORATION_MIN_LOG` (dupliqué, pas importé) —
 * n'accepte une fenêtre plus étroite que `U_CIBLE` que si elle rapproche RÉELLEMENT le ratio naturel
 * de `RATIO_GRAPHE`, jamais sur un simple bruit de virgule flottante introduit par le plancher
 * `Math.max(PADDING_MIN, ...)` du padding. */
const AMELIORATION_MIN_LOG = 1e-6;

function bornesPourFenetre(courbe: ParametresCourbeFR, uFenetre: number) {
  let xMin = Infinity;
  let xMax = -Infinity;
  let yMin = Infinity;
  let yMax = -Infinity;
  for (const segment of calculerSegments(courbe, uFenetre)) {
    const [debut, fin] = segment.domaine;
    xMin = Math.min(xMin, debut);
    xMax = Math.max(xMax, fin);
    for (let i = 0; i <= ECHANTILLONS_PAR_SEGMENT; i++) {
      const x = debut + ((fin - debut) * i) / ECHANTILLONS_PAR_SEGMENT;
      const y = evaluerFonctionReference(courbe, x);
      if (!Number.isFinite(y)) continue;
      yMin = Math.min(yMin, y);
      yMax = Math.max(yMax, y);
    }
  }
  return { xMin, xMax, yMin, yMax };
}

function ratioAvecPadding(bornes: { xMin: number; xMax: number; yMin: number; yMax: number }): number {
  const largeurX = bornes.xMax - bornes.xMin;
  const largeurY = bornes.yMax - bornes.yMin;
  const paddingX = Math.max(PADDING_MIN, largeurX * 0.12);
  const paddingY = Math.max(PADDING_MIN, largeurY * 0.12);
  return (largeurX + 2 * paddingX) / (largeurY + 2 * paddingY);
}

/**
 * Cadrage adaptatif par courbe — même objectif que `mafsFonctionsReference.ts::uCadrageAdapte`
 * (dixième exercice), mais une implémentation DÉLIBÉRÉMENT DIFFÉRENTE, jamais un copier-coller :
 * ce générateur autorise `CH`/`EH` ET `EV`/`CV` à être simultanément non-neutres (contrairement au
 * dixième, où un seul "canal" — horizontal ou vertical — est jamais actif à la fois, voir
 * `generateurs/formeCanoniqueFonctionsReference/index.ts`) — un balayage empirique dédié
 * (`check_gen11_monotonic.mjs`, méthode "verify before fixing") a montré que, dans ce cas combiné,
 * le ratio naturel n'est PLUS garanti monotone en fonction de la largeur de fenêtre (~5% des
 * combinaisons testées présentent un extremum intérieur, pas une simple hausse ou baisse continue)
 * — la recherche par BISSECTION du dixième exercice, qui suppose cette monotonie, se comporterait
 * alors de façon incorrecte ici (convergence possible vers un optimum local erroné). Remplacée par
 * une recherche EXHAUSTIVE sur une grille bornée de `NB_CANDIDATS_CADRAGE` fenêtres régulièrement
 * espacées dans `[U_MIN_CADRAGE, U_CIBLE]`, robuste à un ratio non monotone par construction (aucune
 * hypothèse de forme sur la fonction balayée). `U_CIBLE` fait toujours partie des candidats
 * évalués, donc la non-régression par rapport au comportement historique est GARANTIE
 * structurellement (l'argmin ne peut jamais être pire que `U_CIBLE` lui-même), sans qu'aucun test
 * de comparaison séparé ne soit nécessaire pour cette propriété (contrairement au dixième exercice).
 */
export function uCadrageAdapteFR(courbe: ParametresCourbeFR): number {
  let meilleurU = U_CIBLE;
  let meilleureDistance = Math.abs(Math.log(ratioAvecPadding(bornesPourFenetre(courbe, U_CIBLE)) / RATIO_GRAPHE));

  for (let i = 0; i < NB_CANDIDATS_CADRAGE; i++) {
    const u = U_MIN_CADRAGE + ((U_CIBLE - U_MIN_CADRAGE) * i) / (NB_CANDIDATS_CADRAGE - 1);
    const ratio = ratioAvecPadding(bornesPourFenetre(courbe, u));
    const distance = Math.abs(Math.log(ratio / RATIO_GRAPHE));
    if (distance < meilleureDistance - AMELIORATION_MIN_LOG) {
      meilleureDistance = distance;
      meilleurU = u;
    }
  }

  return meilleurU;
}

function etendreBornesSurCourbe(
  bornes: { xMin: number; xMax: number; yMin: number; yMax: number },
  courbe: ParametresCourbeFR,
) {
  const b = bornesPourFenetre(courbe, uCadrageAdapteFR(courbe));
  return {
    xMin: Math.min(bornes.xMin, b.xMin),
    xMax: Math.max(bornes.xMax, b.xMax),
    yMin: Math.min(bornes.yMin, b.yMin),
    yMax: Math.max(bornes.yMax, b.yMax),
  };
}

/** Calcule le viewBox Mafs pour que TOUTES les courbes fournies (0 à 3 confirmées + 1 en cours de
 * construction) soient visibles confortablement — jamais moins d'une courbe (`live` est toujours
 * fourni par les appelants). */
export function calculerViewBoxFonctionReferenceMultiple(courbes: ParametresCourbeFR[]): ViewBoxFonctionReferenceFR {
  let bornes = { xMin: Infinity, xMax: -Infinity, yMin: Infinity, yMax: -Infinity };
  for (const courbe of courbes) bornes = etendreBornesSurCourbe(bornes, courbe);

  const paddingY = Math.max(PADDING_MIN, (bornes.yMax - bornes.yMin) * 0.12);
  const paddingX = Math.max(PADDING_MIN, (bornes.xMax - bornes.xMin) * 0.12);

  return ajusterAuRatio(
    [bornes.xMin - paddingX, bornes.xMax + paddingX],
    [bornes.yMin - paddingY, bornes.yMax + paddingY],
    RATIO_GRAPHE,
  );
}

const MULTIPLICATEUR_TRACE = 1.5;

/** Dépréciée au profit de `calculerSegmentsVisiblesFR` (`promptauditcourbesmafszoom.md`) — voir
 * `mafsFonctionsReference.ts::calculerSegmentsTrace` pour la justification complète. Conservée telle
 * quelle, encore utilisée par le cadrage initial (`etendreBornesSurSegmentsFR`), non concerné par ce
 * bug. */
export function calculerSegmentsTraceFR(courbe: ParametresCourbeFR): SegmentTrace[] {
  return calculerSegments(courbe, U_CIBLE * MULTIPLICATEUR_TRACE);
}

/** Variante réactive de `calculerSegmentsTraceFR` — délègue directement à
 * `mafsFonctionsReference.ts::calculerSegmentsVisibles` (`ParametresCourbeFR` a exactement la même
 * forme que `ExerciceFonctionReference`, compatibilité structurelle TypeScript). `visibleY`
 * (`promptauditcourbesmafszoomy.md`) : nécessaire au prolongement en y près du pôle de la famille
 * "inverse", voir la documentation de `calculerSegmentsVisibles`. */
export function calculerSegmentsVisiblesFR(courbe: ParametresCourbeFR, visible: [number, number], visibleY: [number, number]): SegmentTrace[] {
  return calculerSegmentsVisibles(courbe, visible, visibleY);
}

/** Fonction g(SOY·(CH/EH)·x) — trace confirmée de l'étape 2 (EH/CH/SOY confirmés, TH/EV/CV/SOX/TV
 * encore neutres) — réutilisée par les écrans des étapes 3 à 5. */
export function courbeEtape2(exercice: { famille: FamilleReference; ch: number; eh: number; soy: boolean }): ParametresCourbeFR {
  return { famille: exercice.famille, th: 0, tv: 0, ch: exercice.ch, eh: exercice.eh, ev: 1, cv: 1, sox: false, soy: exercice.soy };
}

/** Fonction g(SOY·(CH/EH)·(x-TH)) — trace confirmée de l'étape 3 (TH en plus) — réutilisée par les
 * écrans des étapes 4 et 5. */
export function courbeEtape3(exercice: {
  famille: FamilleReference;
  th: number;
  ch: number;
  eh: number;
  soy: boolean;
}): ParametresCourbeFR {
  return { famille: exercice.famille, th: exercice.th, tv: 0, ch: exercice.ch, eh: exercice.eh, ev: 1, cv: 1, sox: false, soy: exercice.soy };
}

/** SOX·(EV/CV)·g(SOY·(CH/EH)·(x-TH)) — trace confirmée de l'étape 4 (EV/CV/SOX en plus, TV encore
 * neutre) — réutilisée par l'écran de l'étape 5. */
export function courbeEtape4(exercice: {
  famille: FamilleReference;
  th: number;
  ch: number;
  eh: number;
  ev: number;
  cv: number;
  sox: boolean;
  soy: boolean;
}): ParametresCourbeFR {
  return { famille: exercice.famille, th: exercice.th, tv: 0, ch: exercice.ch, eh: exercice.eh, ev: exercice.ev, cv: exercice.cv, sox: exercice.sox, soy: exercice.soy };
}
