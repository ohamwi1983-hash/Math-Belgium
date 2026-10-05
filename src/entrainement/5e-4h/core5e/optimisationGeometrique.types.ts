/**
 * Couche core (5e) — contrat pour 5gen32 ("Optimisation géométrique"), 8e générateur du chapitre
 * "Dérivées et applications". Contrairement à 5gen29/5gen31, f'(x) n'est JAMAIS fournie : l'élève
 * la calcule lui-même à l'écran "deriver" (vérifiée par différence finie centrée, voir
 * `moteur5e/verificationOptimisationGeometrique.ts`). 4 familles STRUCTURELLEMENT DISJOINTES à
 * fréquence comparable (~22% chacune) + 2 variantes bonus RARES (poids réduit) :
 *
 *   - "trapeze"   (famille A) — aire d'un trapèze isocèle en fonction de l'angle α (RADIANS,
 *     convention documentée ci-dessous) ; TOUJOURS un maximum (A''<0 partout sur ]0;π/2[) ;
 *     justifiée par le SIGNE DE A'' évalué numériquement (jamais un tableau de signes classique).
 *   - "cylindre"  (famille B) — aire totale d'un cylindre à volume fixé, minimisée en x=rayon ;
 *     tableau de signes classique. Support d'une variante bonus RARE greffée uniquement ici :
 *     `avecApplicationNumerique` ajoute un écran "application" après "conclure" (substitution
 *     numérique dans les dimensions optimales déjà trouvées, jamais une 2e optimisation).
 *   - "margesA"/"margesB" (famille C, 2 sous-parties MIROIR) — rectangle imprimé entouré de marges
 *     `mh`/`mv` distinctes ; "margesA" = aire totale T fixée → maximiser l'aire imprimée ;
 *     "margesB" = aire imprimée A fixée → minimiser l'aire totale. Racine ±k, rejet explicite de la
 *     racine négative (justification à choix).
 *   - "fenetreA"/"fenetreB" (famille D, 2 sous-parties MIROIR) — fenêtre rectangle+demi-cercle ;
 *     "fenetreA" = périmètre P fixé → maximiser l'aire (racine UNIQUE, linéaire, pas de rejet) ;
 *     "fenetreB" = aire A fixée → minimiser le périmètre (racine ±k, rejet explicite). Racines
 *     IRRATIONNELLES dans les 2 sous-parties — précision annoncée + tolérance réellement codée
 *     (voir CLAUDE.md, "Annonce de précision = tolérance réellement vérifiée").
 *   - "cubique" (variante bonus 2, RARE, générateur SÉPARÉ dans le même catalogue) — reconstruction
 *     d'un polynôme cubique coefficient par coefficient à partir de conditions en langage naturel
 *     (2 tangentes horizontales + 2 points de passage). Aucun rapport avec l'optimisation
 *     géométrique à proprement parler, regroupée ici uniquement parce que la consigne de tâche la
 *     rattache au même catalogue de variantes dev.
 *
 * Convention RADIANS (famille "trapeze" uniquement, seule famille trigonométrique) : α est
 * manipulé en RADIANS de bout en bout (domaine ]0;π/2[), MÊME SI le domaine est parfois affiché à
 * l'élève avec la notation "]0°;90°[" dans l'énoncé narratif (contexte géométrique familier) — la
 * dérivation d/dα[sin α]=cos α n'est vraie qu'en radians (voir `moteur/verificationFonctionDerivee.ts`
 * dont l'évaluateur `evaluerRadians` est répliqué ici pour la même raison). Les champs de réponse
 * numériques (angle α_opt) acceptent une valeur en DEGRÉS (plus lisible pour l'élève), convertie en
 * interne — jamais mélangée avec les calculs de dérivée, qui restent en radians.
 */
import type { FractionExacte } from "./limites.types";

export type FamilleOptimisation = "trapeze" | "cylindre" | "margesA" | "margesB" | "fenetreA" | "fenetreB" | "cubique";

/** Valeur exacte de la forme `rationnel + coeffPi·π` — réutilisée pour toute donnée d'énoncé
 * combinant un exact rationnel et un multiple de π (volume du cylindre : rationnel=0 ; périmètre/
 * aire de la fenêtre : les deux parts non nulles). Jamais un flottant reconstruit après coup. */
export interface ValeurAvecPi {
  rationnel: number;
  coeffPi: number;
}

export interface ExerciceTrapeze {
  famille: "trapeze";
  /** Base (entier tiré). */
  b: number;
  /** Côté latéral (entier tiré). */
  l: number;
  /** u = cos(α_opt), fraction EXACTE simple choisie EN PREMIER ("construction à l'envers") — voir
   * `generateurs5e/optimisationGeometrique/index.ts::construireTrapeze`. */
  u: FractionExacte;
}

export interface ExerciceCylindre {
  famille: "cylindre";
  /** x_opt (rayon optimal), entier choisi EN PREMIER. */
  xOpt: number;
  /** V = coeffV·π (coeffV = 2·x_opt³, TOUJOURS entier). */
  coeffV: number;
  /** Variante bonus RARE — écran "application" additionnel après "conclure". */
  avecApplicationNumerique: boolean;
  /** Prix au cm² de matériau (variante bonus uniquement) — coût = prixUnitaire × aire totale
   * minimale, substitution numérique simple, jamais une 2e optimisation. */
  prixUnitaireMateriau?: number;
}

export interface ExerciceMarges {
  famille: "margesA" | "margesB";
  mh: number;
  mv: number;
  /** Aire totale FIXÉE (donnée d'énoncé), uniquement pour "margesA". */
  T?: number;
  /** Aire imprimée FIXÉE (donnée d'énoncé), uniquement pour "margesB". */
  A?: number;
  /** x_opt (largeur imprimée optimale), entier choisi EN PREMIER — voir Couche A pour la dérivation
   * de T/A à partir de x_opt,mh,mv ("construction à l'envers"). */
  xOpt: number;
}

export interface ExerciceFenetre {
  famille: "fenetreA" | "fenetreB";
  /** Périmètre extérieur FIXÉ, uniquement pour "fenetreA". */
  P?: ValeurAvecPi;
  /** Aire FIXÉE, uniquement pour "fenetreB". */
  A?: ValeurAvecPi;
  /** r_opt (rayon optimal), entier choisi EN PREMIER — IRRATIONNEL du point de vue de l'élève qui
   * le recalcule depuis P/A (voir tête de fichier `generateurs5e/optimisationGeometrique/index.ts`). */
  rOpt: number;
}

export interface ExerciceCubique {
  famille: "cubique";
  a: number;
  /** b=-3·a·x2/2, dérivé — TOUJOURS entier (x2 retiré au tirage sinon, boucle bornée). */
  b: number;
  /** x₂≠0, 2e abscisse à tangente horizontale (donnée d'énoncé). */
  x2: number;
  /** d=f(0), donnée d'énoncé (point de passage en x=0). */
  d: number;
  /** x₃≠0, ≠x₂ idéalement — 2e point de passage (donnée d'énoncé). */
  x3: number;
  /** y₃=f(x₃), calculé EXACTEMENT depuis le polynôme complet — donnée d'énoncé (garantit que
   * l'écran "résoudre pour a" retombe EXACTEMENT sur `a`). */
  y3: number;
}

export type ExerciceOptimisation = ExerciceTrapeze | ExerciceCylindre | ExerciceMarges | ExerciceFenetre | ExerciceCubique;
export type GenerateurExerciceOptimisation = () => ExerciceOptimisation;
