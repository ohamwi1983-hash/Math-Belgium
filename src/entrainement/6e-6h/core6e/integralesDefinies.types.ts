import type { ExerciceCalculPrimitives } from "./calculPrimitives.types";
import type { ValeurExacte } from "./cyclometrique.types";

/**
 * Couche core (6e) — contrat pour `6gen25` ("Intégrales définies, paramètre et valeur moyenne",
 * chapitre 4 — "Intégrales et primitives"). Construit AU-DESSUS de `6gen23` ("Calcul de
 * primitives") : chaque exercice embarque un `primitive: ExerciceCalculPrimitives` — l'exercice de
 * calcul de primitive (famille A, B, C ou G UNIQUEMENT, jamais D/E/F — mêmes exclusions que
 * `6gen24`, voir `docs/historique-6e.md`) réellement tiré/construit, dont `primitiveReference`
 * fournit F(x) évaluable en tout point utile — jamais recalculée indépendamment (CLAUDE.md).
 *
 * 3 scénarios possibles (spec : "famille A/B/C" — RENOMMÉS ICI en "scenario" `simple`/`parametre`/
 * `moyenne` pour ne jamais entrer en collision avec les lettres A-G qui désignent déjà les familles
 * de TECHNIQUE de calcul de primitive empruntées à 6gen23) :
 *
 * - `simple` — intégrale définie F(b)−F(a), bornes a<b choisies par génération (domaine
 *   auto-validé, voir `generateurs6e/integralesDefinies/bornes.ts`).
 * - `moyenne` — même intégrale définie, PLUS un écran supplémentaire "valeur moyenne"
 *   (÷(b−a)).
 * - `parametre` — une des deux bornes est un paramètre `m` inconnu, l'intégrale égale une valeur
 *   `cible` donnée ; l'élève pose puis résout l'équation en m. **Restriction délibérée** (voir
 *   en-tête `generateurs6e/integralesDefinies/parametre.ts`) : seules 3 "techniques" canoniques
 *   sont proposées (polynomiale/exponentielle/trigonométrique), PAS les 12 sous-types A/B/C/G
 *   complets — une primitive de famille A "direct" (somme de 3-4 termes de types DIFFÉRENTS,
 *   mélangeant ln/exp/trig/puissance) ne produit JAMAIS une équation en m résoluble par UNE seule
 *   technique reconnaissable ; ces 3 techniques sont donc des exercices CONSTRUITS À LA MAIN
 *   (réutilisant les briques de calcul `evaluerTermeA`/`primitiveTermeA`/`gB`/`primitiveGB` de
 *   6gen23, jamais dupliquées), mais dont l'objet résultant respecte EXACTEMENT le contrat
 *   `ExerciceFamilleA`/`ExerciceFamilleB` — donc 100% compatible avec les fonctions de vérification
 *   et de formatage déjà écrites pour ces familles (`moteur6e/verificationCalculPrimitives.ts`,
 *   `ui6e/formatCalculPrimitives.ts`) sans aucune adaptation.
 */

export type ScenarioIntegraleDefinie = "simple" | "parametre" | "moyenne";

interface ExerciceIntegraleDefinieCommun {
  /** Exercice de calcul de primitive emprunté (famille A/B/C/G de 6gen23) — F(x) SANS constante,
   * `primitiveReference` fournit F(x) évaluable. */
  primitive: ExerciceCalculPrimitives;
}

export interface ExerciceIntegraleSimple extends ExerciceIntegraleDefinieCommun {
  scenario: "simple";
  /** Bornes EXACTES (entiers ou fractions simples), a<b. */
  a: number;
  b: number;
}

export interface ExerciceIntegraleMoyenne extends ExerciceIntegraleDefinieCommun {
  scenario: "moyenne";
  a: number;
  b: number;
}

/** 3 techniques canoniques pour le scénario `parametre` — voir en-tête de fichier et
 * `generateurs6e/integralesDefinies/parametre.ts` pour la justification de cette restriction. */
export type TechniqueParametre = "polynomiale" | "exponentielle" | "trigonometrique";

export interface ExerciceIntegraleParametre extends ExerciceIntegraleDefinieCommun {
  scenario: "parametre";
  technique: TechniqueParametre;
  /** La borne CONNUE/donnée (jamais l'inconnue). */
  borneFixe: number;
  /** Latex EXACT de `borneFixe` (entier pour `polynomiale`/`exponentielle`, multiple exact de π
   * pour `trigonometrique` — jamais reconstruit depuis le flottant côté ui6e, même raison que
   * `cible` ci-dessous). */
  borneFixeLatex: string;
  /** `true` : l'intégrale posée est ∫[borneFixe, m] (m = borne SUPÉRIEURE nommée, intégrale =
   * F(m)−F(borneFixe)). `false` : ∫[m, borneFixe] (intégrale = F(borneFixe)−F(m)). Piège explicite
   * de la spec (confondre quelle borne est fixe / inverser l'ordre de soustraction) — porté par ce
   * champ plutôt que déduit d'une comparaison numérique m vs borneFixe (un "m" inconnu peut très
   * bien être, une fois résolu, numériquement plus petit que la borne fixe même s'il en occupe la
   * position "supérieure" dans l'écriture de l'intégrale — cas parfaitement valide). */
  mEstBorneSuperieure: boolean;
  /** Valeur CORRECTE de m — connue par construction (voir en-tête `parametre.ts`, jamais résolue à
   * l'exécution par un solveur symbolique générique). */
  m: number;
  /** Valeur cible de l'intégrale définie, donnée dans l'énoncé — TOUJOURS une valeur exacte propre
   * (entier/fraction simple pour `polynomiale`/`exponentielle` ; combinaison de 2 termes remarquables
   * du cercle trigonométrique pour `trigonometrique`, voir `parametre.ts`). Représentée en
   * `{numerique,latex}` (réutilise `ValeurExacte`, déjà établi pour ce même besoin ailleurs sur ce
   * chantier — CLAUDE.md, "jamais de décimal pour une valeur générée par la plateforme") plutôt
   * qu'un simple `number` : jamais reconstruite depuis le flottant côté ui6e (fragile), la Couche A
   * qui la construit connaît déjà sa forme exacte. */
  cible: ValeurExacte;
  /** Ensemble ORDONNÉ (order indifférent à la vérification) des solutions valides de l'équation en
   * m — 2 pour `polynomiale` (racines de l'équation du second degré, Viète), 1 pour
   * `exponentielle`/`trigonometrique` (fonction injective / branche principale restreinte). */
  solutionsM: number[];
  /** Texte de restriction du domaine de m à afficher à l'élève, UNIQUEMENT pour `trigonometrique`
   * (branche principale arcsin/arccos — sans cette restriction explicite, l'équation trigonométrique
   * aurait une infinité de solutions périodiques). `null` sinon. */
  domaineMTexte: string | null;
}

export type ExerciceIntegralesDefinies = ExerciceIntegraleSimple | ExerciceIntegraleMoyenne | ExerciceIntegraleParametre;

export type GenerateurExerciceIntegralesDefinies = () => ExerciceIntegralesDefinies;
