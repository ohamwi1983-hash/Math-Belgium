import type { FragmentConsigne, LigneCalcul } from "../../export/genererFeuilleExercices";
import type { PlanSolide3D, Point3D, Solide3D } from "./geometrieEspace.types";
import type { MilieuNomme } from "./positionsPlans.types";

/**
 * Contrat de gen107 — « Détective d'erreurs : géométrie dans l'espace » (4e, chapitre 8, section
 * `revision`, processus 3 TRANSFÉRER). Même mécanique que gen91 / 6gen99 : la copie d'un élève
 * fictif (3 ou 4 lignes, avec figure) contient UNE ligne fausse. Trois écrans :
 * a) la ligne fausse (choix fermé, une tentative) ;
 * b) l'erreur commise (4 descriptions, une tentative) ;
 * c) la correction (4 propositions — phrases ou dessins —, une tentative).
 *
 * Variante = THÈME de la copie (= `forme` du profil des évaluations). Ce que l'élève DÉCIDE — la
 * ligne fausse et le type d'erreur — est tiré avant toute boucle de rejet, à parts égales, et
 * n'entre jamais dans `forme`.
 *
 * Tout le texte (copie, descriptions, propositions, contrôle du corrigé, piège, aides) est rédigé
 * UNE fois, au tirage, par le générateur : l'écran et le papier lisent les mêmes fragments.
 * Aucune coordonnée n'est montrée : les `Point3D` restent la vérité terrain interne.
 */

export type ThemeDetectiveEspace = "droites" | "plan" | "section" | "parallelisme" | "cavaliere";

export type TypeErreurEspace =
  // droites : position de trois paires de droites
  | "croisementApparent"
  | "pasDeCroisement"
  | "faceCommune"
  // plan : ces données déterminent-elles un plan ?
  | "pointsAlignes"
  | "pointSurDroite"
  | "droitesGauches"
  // section : remarques pour construire une section
  | "unSeulPoint"
  | "mauvaisCote"
  | "nonCoplanaires"
  // parallelisme : démonstration « deux plans parallèles »
  | "temoinsParalleles"
  | "horsDuPlan"
  | "raisonFausse"
  // cavaliere : dessin d'un pavé
  | "angle"
  | "reduction"
  | "cachees";

/** Dessin d'un pavé en perspective (thème `cavaliere`) : dimensions réelles (cm), angle des fuyantes
 * (degrés), coefficient de réduction et sommet dont les arêtes sont en pointillés. */
export interface DessinPave {
  largeur: number;
  hauteur: number;
  profondeur: number;
  angle: number;
  coefficient: number;
  cache: "D" | "C" | "H" | "B";
}

/** Une proposition d'un choix fermé (écrans b et c). */
export interface OptionDetective {
  fragments: FragmentConsigne[];
  correcte: boolean;
  /** Écran c du thème `cavaliere` : la proposition est un dessin. */
  dessin?: DessinPave;
}

/** Ce qu'on peut tracer sur la figure pour une ligne de la copie (boutons « Ligne n ») : les
 * droites citées (prolongées) et les points cités. */
export interface DessinLigne {
  droites: [Point3D, Point3D][];
  points: Point3D[];
}

/** Figure d'un solide (thèmes droites, plan, section, parallelisme). */
export interface FigureSolideEspace {
  type: "solide";
  solide: Solide3D;
  /** Points nommés qui ne sont pas des sommets (milieux, centres de faces, points P, Q, R d'une
   * section) — `milieuDe` sert seulement au texte de l'énoncé, jamais au dessin. */
  points: MilieuNomme[];
  /** Plans de l'énoncé (colorés par le triangle de leurs trois points). */
  plans: PlanSolide3D[];
  /** Tracés proposés ligne par ligne (`null` : pas de boutons). */
  dessins: DessinLigne[] | null;
}

export interface FigureCavaliereEspace {
  type: "cavaliere";
  dessin: DessinPave;
}

export type FigureDetectiveEspace = FigureSolideEspace | FigureCavaliereEspace;

/** Éléments ajoutés à la figure du corrigé (droites, plans, section complète ; ou le bon dessin). */
export interface CorrigeFigureEspace {
  droites: [Point3D, Point3D][];
  plans: PlanSolide3D[];
  sections: boolean;
  /** Points ajoutés (ex. le quatrième sommet S d'une section). */
  points: { nom: string; position: Point3D }[];
  dessin: DessinPave | null;
}

/** Corrigé « comme au tableau » (`generateurs/detectiveEspace/corrigeDetaille.ts`) : rédigé au tirage,
 * avec les mêmes données que la copie, SANS aléa (un code `?code=` rouvre le même exercice). */
export interface TableauDetectiveEspace {
  /** Contrôle de chaque ligne de la copie : les propriétés appliquées, une par ligne (∈, ⊂, ∥, ∩…). */
  controles: LigneCalcul[][];
  /** La ligne fausse refaite juste (et, s'il le faut, la suite reprise). */
  correction: LigneCalcul[];
}

export interface ExerciceDetectiveEspace {
  theme: ThemeDetectiveEspace;
  type: TypeErreurEspace;
  /** Indice (0, 1, 2…) de la ligne fausse. */
  ligneFausse: number;
  /** Ce que l'élève devait faire (solide, points définis, question). */
  enonce: FragmentConsigne[];
  /** La copie, ligne par ligne. */
  lignes: FragmentConsigne[][];
  /** Écran b (ordre mélangé). */
  descriptions: OptionDetective[];
  /** Écran c : la question, puis les propositions (ordre mélangé). */
  questionCorrection: FragmentConsigne[];
  corrections: OptionDetective[];
  /** Corrigé : la vérification de chaque ligne (une phrase par ligne). */
  controles: FragmentConsigne[][];
  /** Corrigé : la ligne corrigée (et la suite à reprendre s'il y en a une). */
  ligneCorrigee: FragmentConsigne[];
  suite: FragmentConsigne[] | null;
  piege: FragmentConsigne[];
  /** Nom court de l'erreur (réponse brève). */
  nomErreur: string;
  /** Aides des écrans a, b, c (deux chacune). */
  aides: FragmentConsigne[][][];
  figure: FigureDetectiveEspace;
  corrige: CorrigeFigureEspace;
  tableau: TableauDetectiveEspace;
}
