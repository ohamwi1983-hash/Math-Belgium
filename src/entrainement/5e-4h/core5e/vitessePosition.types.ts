/**
 * Couche core (5e) — contrat pour 5gen35 ("Vitesse et position"), DERNIER générateur du chapitre
 * "Dérivées et applications" (5e), à la suite de 5gen25-5gen34. Type pur, aucune logique.
 *
 * Principe : e(t) = (a/2)·t² + b·t, une fonction de POSITION quadratique (accélération constante
 * depuis un départ arrêté si b=0, ou déjà lancé à une vitesse initiale b si b>0). v(t)=e'(t) est la
 * VITESSE — jamais fournie, l'élève dérive lui-même (compétence déjà acquise en 5gen27, réinvestie
 * ici en contexte).
 *
 * 2 variantes STRUCTURELLEMENT DISJOINTES (union discriminée par `variante`), une seule tirée par
 * exercice :
 * - "A" ("course simple") — 5 écrans, une seule équation à résoudre (e(t)=D, distance totale).
 * - "B" ("course en segments") — 6 écrans : mêmes 2 premiers écrans que A, puis résolution de
 *   e(t)=D1 (distance INTERMÉDIAIRE) suivie d'un changement de modèle explicite (vitesse constante
 *   sur le segment restant D2=D-D1) — voir `generateurs5e/vitessePosition/index.ts` pour la preuve
 *   arithmétique complète de la construction "à l'envers".
 *
 * Champs COMMUNS aux 2 variantes, DÉLIBÉRÉMENT unifiés sous des noms génériques (`distanceCible`/
 * `tCible`/`racineRejetee`) plutôt que dupliqués sous des noms spécifiques à la variante (`D`/
 * `tTotal` pour A, `D1`/`t1` pour B) : les écrans "resoudre" et "vitessePointe" sont ENTIÈREMENT
 * partagés entre les 2 variantes (même composant, même vérification) — seule la variante B ajoute
 * des écrans supplémentaires APRÈS `vitessePointe` (`segmentConstant`/`tempsTotal`), jamais une
 * branche différente sur les écrans communs.
 */

/** Option d'un écran QCM "justification" — même motif que `OptionInterpretation`
 * (`core5e/limitesContexte.types.ts`) : une seule `correcte: true`, ordre mélangé à la génération
 * et fixe pour l'instance. Type distinct (pas une réutilisation directe de `OptionInterpretation`)
 * car ce générateur n'a aucune dépendance vers `limitesContexte` — même esprit que
 * `generateurs/optimisation/interpretation.ts` vs `generateurs/equationReference/interpretation.ts`
 * (modules frères jamais partagés d'un générateur à l'autre).
 */
export interface OptionJustification {
  texte: string;
  correcte: boolean;
}

/** Un contexte narratif de la banque (course, natation, cyclisme...) — voir
 * `generateurs5e/vitessePosition/contextes.ts`. Unités FIXÉES à m/s pour tous les contextes
 * (jamais variables d'un contexte à l'autre) : la conversion ×3,6 de l'écran "conversion"
 * (variante A) n'est correcte QUE pour une vitesse exprimée en m/s au départ. */
export interface ContexteVitessePosition {
  id: string;
  /** Sujet grammatical singulier (ex. "le coureur", "la nageuse") — utilisé dans les phrases
   * secondaires (consignes d'écran), jamais dans l'énoncé principal (déjà autoporteur). */
  sujet: string;
  pronom: "il" | "elle";
  /** Phrase d'énoncé complète, variante A — reçoit e(t) déjà formaté en LaTeX et la distance
   * totale D (entier, en m). */
  phraseA: (eLatex: string, D: number) => string;
  /** Phrase d'énoncé complète, variante B — reçoit e(t), la distance intermédiaire D1 (point de
   * passage) et la distance totale D (D1 < D, tous deux en m). */
  phraseB: (eLatex: string, D1: number, D: number) => string;
}

interface ExerciceVitessePositionCommun {
  contexte: ContexteVitessePosition;
  /** Coefficient de e(t)=(a/2)t²+bt — toujours 1 ou 2 (garantit `racineRejetee` TOUJOURS entière,
   * voir index.ts pour la preuve : 2b/a est entier dans les deux cas). */
  a: 1 | 2;
  /** Vitesse initiale (t=0) — 0 (départ arrêté) ou entier positif (déjà lancé). */
  b: number;
  /** Distance totale annoncée dans l'énoncé (entier, m) — la distance à parcourir intégralement.
   * Pour la variante A, `distanceCible === D` (l'unique équation à résoudre porte sur la distance
   * totale). Pour la variante B, `distanceCible` est la distance INTERMÉDIAIRE D1 < D. */
  D: number;
  /** Temps donné pour l'écran "evaluerV0" (0 < t0 < borne du régime quadratique — `tCible` pour A,
   * `tCible` aussi pour B puisque c'est la fin du régime accéléré). Entier ou décimal simple
   * (multiple de 0,5). */
  t0: number;
  /** Distance dont l'équation e(t)=distanceCible doit être résolue à l'écran "resoudre" — D pour
   * la variante A, D1 (< D) pour la variante B. */
  distanceCible: number;
  /** Racine POSITIVE exacte de e(t)=distanceCible — vérité terrain, JAMAIS recalculée en résolvant
   * l'équation une seconde fois côté vérification. t_total pour A, t1 (temps du point de passage)
   * pour B. */
  tCible: number;
  /** Racine NÉGATIVE exacte de la même équation — TOUJOURS strictement négative pour tout tirage
   * a∈{1,2}, b≥0, tCible>0 (preuve complète : `generateurs5e/vitessePosition/index.ts`). Affichée/
   * vérifiée à l'écran "resoudre", jamais silencieusement ignorée. */
  racineRejetee: number;
  /** QCM "pourquoi rejette-t-on la racine négative" — 4 options, une seule correcte, ordre mélangé
   * à la construction (fixe pour cette instance). */
  optionsRejetRacine: OptionJustification[];
}

export interface ExerciceVitessePositionA extends ExerciceVitessePositionCommun {
  variante: "A";
}

/** Variante B — après le point de passage à `tCible` (renommé "t1" dans les consignes/aides), le
 * segment restant D2=D-distanceCible est parcouru à VITESSE CONSTANTE égale à v(tCible) — e(t) est
 * ABANDONNÉE pour ce segment (changement de modèle explicite, pas seulement calculatoire — voir
 * CLAUDE.md/la tâche). */
export interface ExerciceVitessePositionB extends ExerciceVitessePositionCommun {
  variante: "B";
  /** D - distanceCible, TOUJOURS strictement positif (distanceCible < D imposé à la génération). */
  D2: number;
}

export type ExerciceVitessePosition = ExerciceVitessePositionA | ExerciceVitessePositionB;

export type GenerateurExerciceVitessePosition = () => ExerciceVitessePosition;
