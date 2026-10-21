import type { Noeud } from "./decompositionLogarithme";

/**
 * Couche core (6e) — contrat pour `6gen13` ("Propriétés du logarithme", chapitre 3 — "Fonctions
 * logarithmes"), REFONTE TOTALE : 5 caractéristiques (produit, quotient, puissance, racine,
 * changement de base) combinées de 1 à 4 à la fois — voir `core6e/decompositionLogarithme.ts` pour
 * le moteur de construction/décomposition (arbre `Noeud`, variables libres m/n/q/r/c).
 *
 * AUCUNE VALEUR NUMÉRIQUE n'est générée ni stockée ici : l'exercice reste PUREMENT SYMBOLIQUE du
 * début à la fin (décomposer `log_a(...)` propriété par propriété, jamais de calcul final). `M`/`N`/`P`
 * n'apparaissent QUE comme noms symboliques dans l'arbre/l'expression affichée (voir `Noeud`/
 * `NomVariable`) ; `m`/`n`/`q`/`c` ne sont QUE des lettres affichées dans la consigne et le bloc de
 * données (voir `ui6e/formatProprietesLogarithme.ts::blocDonnees`), jamais des nombres — la
 * vérification (voir `moteur6e/verificationProprietesLogarithme.ts`) les traite comme des VARIABLES
 * LIBRES échantillonnées à des points fixes, jamais comme des quantités connues de l'exercice.
 */

export interface ExerciceProprieteLogarithme {
  arbre: Noeud;
  avecChangementBase: boolean;
  /** Vrai si `N` (donc la lettre `n`) apparaît dans l'arbre — produit OU quotient présent. */
  avecN: boolean;
  /** Vrai si `P` (donc la lettre `q`) apparaît dans l'arbre — produit ET quotient TOUS LES DEUX
   * présents (la 2e opération binaire a besoin d'une 3e variable, voir `decompositionLogarithme.ts`). */
  avecP: boolean;
  /** Nom symbolique de la nouvelle base (toujours "b" en pratique, jamais numériquement résolue —
   * même convention que la base "a" elle-même) — `null` si "changementBase" absent de la combinaison. */
  b: string | null;
}

export type GenerateurExerciceProprietesLogarithme = () => ExerciceProprieteLogarithme;
