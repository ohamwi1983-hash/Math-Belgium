/**
 * Contrat exposé — chapitre 3, "Triangle quelconque" (remplace "Aire d'un triangle quelconque" à
 * la position 19, `promptcreationgenerateur19trianglequelconque.md`). Réutilise directement
 * `Triangle` (`triangle.types.ts`, module partagé du chapitre) — même couplage assumé que les
 * autres générateurs du chapitre.
 *
 * Deux configurations UNIQUEMENT, jamais le cas ambigu SSA (2 côtés + un angle qui n'est PAS
 * l'angle compris entre eux) — explicitement hors de portée de ce générateur, réservé à un futur
 * générateur séparé non développé ici :
 * - `loiSinus` : 2 angles + 1 côté connus, 1 côté manquant (AAS, jamais ambigu — les 3 angles sont
 *   déjà déterminés, `resoudreAAS` ne fait qu'un simple rapport).
 * - `alKashi` : 3 côtés connus, 1 angle manquant (SSS, jamais ambigu sur [0°,180°] — `resoudreSSS`
 *   utilise `acos`).
 *
 * `donneeManquante` identifie explicitement quelle lettre du `Triangle` résolu est la donnée à
 * retrouver à l'écran 1 — dérivée à la génération, jamais redevinée côté vérification/présentation.
 *
 * `unite` (`promptcorrectionsgenerateur19unitesnotation.md`) : une unité de longueur tirée
 * aléatoirement parmi les 5 valeurs de `UniteLongueur`, fixée pour tout l'exercice (les deux
 * écrans, énoncé compris) — jamais retirée indépendamment par écran. L'angle manquant (`alKashi`)
 * n'a lui-même aucune unité (toujours en degrés) : `unite` ne concerne que les longueurs (le côté
 * manquant de `loiSinus` à l'écran 1, et l'aire — en unité au carré — à l'écran 2, toujours
 * présente quelle que soit la configuration).
 */
import type { CoteTriangle, SommetTriangle, Triangle } from "./triangle.types";

export type ConfigurationTriangleQuelconque = "loiSinus" | "alKashi";

/** Une lettre du triangle — un côté (a/b/c) ou un angle (A/B/C), selon la configuration. */
export type LettreTriangle = CoteTriangle | SommetTriangle;

/** Unité de longueur — tirée une fois par exercice, partagée par les deux écrans. L'écran 2 (aire)
 * réutilise cette même valeur pour son propre menu déroulant, seul le LIBELLE affiché diffère
 * (`cm` vs `cm²`) — voir `ui/formatTriangleQuelconque.ts::OPTIONS_UNITE_AIRE`. */
export type UniteLongueur = "mm" | "cm" | "dm" | "m" | "km";

export interface ExerciceTriangleQuelconque {
  configuration: ConfigurationTriangleQuelconque;
  triangle: Triangle;
  /** La lettre manquante à retrouver à l'écran 1 — toujours un côté pour `loiSinus`, toujours un angle pour `alKashi`. */
  donneeManquante: LettreTriangle;
  unite: UniteLongueur;
}

export type GenerateurExerciceTriangleQuelconque = () => ExerciceTriangleQuelconque;
