import type { Arcfonction, ValeurExacte } from "./cyclometrique.types";
import type { EnsembleReelGuide } from "./ensembleReel.types";

/**
 * Couche core (6e) — contrat pour `6gen3` ("Équations avec fonctions cyclométriques", chapitre 1).
 * REFONTE TOTALE : 4 variantes équiprobables (dont la variante 4 tire ensuite l'un de ses 3
 * sous-cas, équiprobables), mais — contrairement à l'ancienne version — les 4 partagent la MÊME
 * séquence de 4 écrans (CE → équation non cyclométrique → existence de solutions → accepter/rejeter
 * chaque solution), reflétée par une SEULE forme de résultat (`ResultatExerciceEquationsCyclometriques`,
 * `moteur6e/typesEquationsCyclometriques.ts`) plutôt qu'une union par famille comme avant.
 *
 * `candidats` — les racines de l'équation NON CYCLOMÉTRIQUE (écran 2), calculées à la génération,
 * AVANT tout filtrage par la CE (c'est exactement ce que demande l'écran 3) — chaque candidat porte
 * déjà son verdict accepter/rejeter attendu (CE + non-parasite pour la variante 4), calculé une
 * fois pour toutes à la génération (aucun paramètre choisi librement par l'élève n'entre en jeu
 * ici, donc pas de "cohérence interne" à recalculer à la volée — voir CLAUDE.md). Triés par x
 * croissant, toujours DISTINCTS.
 */
export type VarianteEquationsCyclometriques = "angleLineaire" | "memeArcfonction" | "angleQuadratique" | "arcfonctionsDifferentes";

/** 3 sous-cas de la variante 4, équiprobables au tirage. */
export type SousCasArcfonctionsDifferentes = "asin_acos" | "asin_atan" | "acos_atan";

export interface ArgumentLineaire {
  a: number;
  b: number;
}

export interface ArgumentQuadratique {
  a: number;
  b: number;
  c: number;
}

export interface CandidatSolution {
  x: number;
  /** `true` ssi la solution vérifie la CE de l'écran 1 ET (variante 4 seulement) n'est pas une
   * solution parasite introduite par la mise au carré. */
  accepteAttendu: boolean;
}

interface ExerciceCommun {
  ce: EnsembleReelGuide;
  candidats: CandidatSolution[];
}

/** Variante 1 — arcfonction(ax+b) = angle particulier (radian). */
export interface ExerciceAngleLineaire extends ExerciceCommun {
  variante: "angleLineaire";
  arcfonction: Arcfonction;
  arg: ArgumentLineaire;
  angle: ValeurExacte;
}

/** Variante 2 — arcfonction(ax+b) = arcfonction(cx+d), même arcfonction des deux côtés. */
export interface ExerciceMemeArcfonction extends ExerciceCommun {
  variante: "memeArcfonction";
  arcfonction: Arcfonction;
  arg1: ArgumentLineaire;
  arg2: ArgumentLineaire;
}

/** Variante 3 — arcfonction(ax²+bx+c) = angle particulier (radian). */
export interface ExerciceAngleQuadratique extends ExerciceCommun {
  variante: "angleQuadratique";
  arcfonction: Arcfonction;
  arg: ArgumentQuadratique;
  angle: ValeurExacte;
}

/** Variante 4 — arcfonction1(ax+b) = arcfonction2(cx+d), arcfonctions DIFFÉRENTES. `arg1`=u=ax+b
 * (toujours l'arcfonction listée en premier dans `sousCas`), `arg2`=v=cx+d (la seconde).
 *
 * `conditionParasite` — écran intercalaire NOUVEAU (entre "ce" et "equation", variante 4
 * UNIQUEMENT) : condition de compatibilité des CODOMAINES des 2 arcfonctions (ex. arcsin/arccos
 * exige que les 2 arguments soient ≥0 sur leur intersection de codomaines [0;π/2]), exprimée comme
 * un sous-ensemble de x — DISTINCTE de `ce` (qui ne porte que sur le DOMAINE des arcfonctions,
 * jamais sur le signe/codomaine). Contrairement à `ce`, qui est TOUJOURS non vide par construction,
 * `conditionParasite` PEUT être vide pour certains couples (a,b,c,d) — retirée à la génération dans
 * ce cas (voir `arcfonctionsDifferentes.ts`), le builder élève n'ayant aucun moyen de représenter
 * l'ensemble vide. Une fois `ce` ET `conditionParasite` connus, `accepteAttendu` de chaque candidat
 * équivaut exactement à "x appartient aux deux" (propriété vérifiée par test, jamais recalculée
 * ainsi en Couche B — `accepteAttendu` reste la source de vérité, déjà calculée indépendamment). */
export interface ExerciceArcfonctionsDifferentes extends ExerciceCommun {
  variante: "arcfonctionsDifferentes";
  sousCas: SousCasArcfonctionsDifferentes;
  arg1: ArgumentLineaire;
  arg2: ArgumentLineaire;
  conditionParasite: EnsembleReelGuide;
}

export type ExerciceEquationsCyclometriques = ExerciceAngleLineaire | ExerciceMemeArcfonction | ExerciceAngleQuadratique | ExerciceArcfonctionsDifferentes;

export type GenerateurExerciceEquationsCyclometriques = () => ExerciceEquationsCyclometriques;
