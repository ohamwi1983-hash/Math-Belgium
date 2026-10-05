/**
 * Couche core (5e) — contrat pour `5gen14` ("Suites arithmétiques, formule générale et termes").
 * 5 familles STRUCTURELLEMENT DISJOINTES (union discriminée par `famille`, même principe que
 * 5gen5/5gen10/5gen13) : "principal" (le pipeline u1/r à 4+1 combinaisons de départ, "2 données →
 * le reste" — même architecture que 5gen6, `ORDRE_QUANTITES...` non réutilisé tel quel car les
 * quantités ne sont pas toutes du même type ici), "coherence" (variante bonus, r+u_p+u_q
 * sur-spécifiés, jugement de cohérence AVANT tout calcul), "algebriqueTermeGeneral"/
 * "algebriqueSommeSn"/"algebriqueRangN" (3 variantes bonus "isoler une inconnue algébrique" —
 * remplacent l'ancienne "moyenneArithmetique", retirée : elle ne mobilisait qu'un seul raisonnement
 * — propriété de moyenne — redémontré à l'identique à chaque tirage, `prompt5gen14remplacementvariante.md`).
 *
 * `un(u1,r,n)=u1+(n-1)r` et `sn(u1,r,n)=(n/2)(2u1+(n-1)r)` sont TOUJOURS calculées depuis la
 * vérité terrain `{u1,r}` — jamais stockées à double sur le contrat (`generateurs5e/
 * suitesArithmetiques/parametres.ts` porte ces 2 primitives, réutilisées par 5gen16 en
 * import générateur→générateur pour sa variante "réutilise la génération de 5gen14").
 */

export interface BaseSuiteArithmetique {
  u1: number;
  r: number;
}

export interface TermeIndiceValeur {
  indice: number;
  valeur: number;
}

/** Les 5 combinaisons de départ du pipeline "principal" — voir CLAUDE.md section 5gen14 pour le
 * détail de la séquence d'écrans (variable) associée à chacune. */
export type ComboSuiteArithmetique = "direct" | "u1_up" | "r_up" | "up_uq" | "un_sn";

export type DonneesSuiteArithmetique =
  | { combo: "direct" }
  | { combo: "u1_up"; up: TermeIndiceValeur }
  | { combo: "r_up"; up: TermeIndiceValeur }
  | { combo: "up_uq"; up: TermeIndiceValeur; uq: TermeIndiceValeur }
  | { combo: "un_sn"; un: TermeIndiceValeur; sn: number };

export interface ExercicePrincipalSuiteArithmetique {
  famille: "principal";
  /** Vérité terrain — jamais montrée directement à l'élève, seulement via `donnees`. */
  base: BaseSuiteArithmetique;
  donnees: DonneesSuiteArithmetique;
  /** Écran 4 — 4 indices consécutifs (ex. n0..n0+3), toujours présents. */
  indicesTermesProches: [number, number, number, number];
  /** Écran 5 — un indice éloigné (style "u100"). */
  indiceTermeEloigne: number;
  /** Écran 6 (bonus Sn) — toujours présent pour cette famille, un indice frais. */
  indiceSn: number;
}

/** Variante bonus 1 — r ET u_p (p≠1) TOUJOURS donnés directement ; u_q (q≠p) est la donnée
 * REDONDANTE dont la cohérence doit être jugée en premier (`u_q réel` = celui qui rendrait les 3
 * données cohérentes ; `uq.valeur` peut en différer si `coherent===false`). Si cohérent, le
 * pipeline continue exactement comme le combo "r_up" (trouver u1, puis écrans 3 à 6) — sinon
 * l'exercice s'arrête à l'écran de cohérence, aucun champ optionnel ci-dessous n'est renseigné. */
export interface ExerciceCoherenceSuiteArithmetique {
  famille: "coherence";
  base: BaseSuiteArithmetique;
  r: number;
  p: TermeIndiceValeur;
  q: TermeIndiceValeur;
  coherent: boolean;
  indicesTermesProches?: [number, number, number, number];
  indiceTermeEloigne?: number;
  indiceSn?: number;
}

export interface TermeLineaire {
  a: number;
  b: number;
}

/** Famille bonus A — REFONTE (`prompt5gen14refontefamillesbonus.md`) : isoler x via la relation
 * GÉNÉRALE entre 2 termes quelconques d'une suite arithmétique, `u_n=u_p+(n-p)r` — u1 n'apparaît
 * PLUS DU TOUT dans cette famille (contrairement à l'ancienne version, où u_p était toujours le
 * terme de référence fixe). `up`/`un` sont TOUS DEUX des expressions ALGÉBRIQUES en x, `p`/`n` sont
 * TOUS DEUX des indices tirés (distincts l'un de l'autre, plage large [1,20] — jamais l'un des 2
 * fixé/concentré sur de petites valeurs). `r` reste NUMÉRIQUE. Construction "à l'envers" : `xReel`/
 * `r`/`p`/`n`/`up` choisis EN PREMIER, `un.a` choisi libre (≠`up.a`, sinon l'équation dégénère —
 * pente nulle), `un.b` DÉRIVÉ ensuite pour que l'équation ait exactement `xReel` comme solution —
 * jamais un tirage suivi d'un rejet/régénération jusqu'à tomber sur une solution propre. */
export interface ExerciceAlgebriqueTermeGeneral {
  famille: "algebriqueTermeGeneral";
  up: TermeLineaire;
  un: TermeLineaire;
  /** p≠n (2 termes distincts) — plage large [1,20], jamais concentrée. */
  p: number;
  n: number;
  r: number;
  /** Vérité terrain — jamais montrée directement à l'élève. */
  xReel: number;
}

/** Famille bonus B — REFONTE : isoler x via la formule de la somme S_n=(n/2)(2u1+(n-1)r), 4
 * sous-cas à fréquence comparable (`sousCas`), `n` TOUJOURS numérique (jamais en fonction de x).
 * Union discriminée par `sousCas` (plutôt que des champs `u1: TermeLineaire | number` + type guard) :
 * cohérent avec le reste du projet (`ExerciceSuiteArithmetique` lui-même est une union discriminée
 * par `famille`) et donne au compilateur la forme EXACTE de chaque sous-cas (ex. impossible
 * d'accéder à `u1.a` sur le sous-cas B, où `u1` est un `number`) plutôt qu'un cast/type guard manuel
 * à chaque site de consommation.
 *
 * - A : `u1(x)` algébrique, `r`/`Sn` numériques (Sn=k donné).
 * - B : `r(x)` algébrique, `u1`/`Sn` numériques.
 * - C : `u1(x)` ET `r(x)` algébriques, `Sn` numérique (SEULE construction existant avant cette
 *   refonte, réutilisée telle quelle).
 * - D : mécanique DIFFÉRENTE — `Sn(x)` algébrique, `u1`/`r` numériques. `k` n'est PAS dérivé de
 *   `xReel` ici : `k=(n/2)(2u1+(n-1)r)` calculé D'ABORD (u1/r/n tous numériques, aucune inconnue),
 *   PUIS `sn` (l'expression Sn(x)) est construite pour que `sn(xReel)=k`. Séquence d'écrans dédiée
 *   (`ORDRE_SOMME_SN_D`, `typesSuiteArithmetique.ts`) : calcule S_n d'abord (aucune inconnue), pose
 *   l'équation Sn(x)=[valeur trouvée] ensuite, puis résout x — pas d'écran "en déduire" final (S_n
 *   déjà connu numériquement dès le premier écran).
 */
export type SousCasSommeSn = "A" | "B" | "C" | "D";

export interface ExerciceAlgebriqueSommeSnA {
  famille: "algebriqueSommeSn";
  sousCas: "A";
  u1: TermeLineaire;
  r: number;
  n: number;
  k: number;
  xReel: number;
}
export interface ExerciceAlgebriqueSommeSnB {
  famille: "algebriqueSommeSn";
  sousCas: "B";
  u1: number;
  r: TermeLineaire;
  n: number;
  k: number;
  xReel: number;
}
export interface ExerciceAlgebriqueSommeSnC {
  famille: "algebriqueSommeSn";
  sousCas: "C";
  u1: TermeLineaire;
  r: TermeLineaire;
  n: number;
  k: number;
  xReel: number;
}
export interface ExerciceAlgebriqueSommeSnD {
  famille: "algebriqueSommeSn";
  sousCas: "D";
  u1: number;
  r: number;
  n: number;
  /** Expression algébrique de S_n en x — DONNÉE de l'exercice (contrairement aux autres sous-cas,
   * où c'est u1/r qui sont algébriques et Sn qui est la cible numérique k). */
  sn: TermeLineaire;
  /** Valeur numérique de S_n — calculée D'ABORD depuis u1/r/n (tous numériques, aucune inconnue),
   * PUIS utilisée pour dériver `sn.b` (voir doc de tête). Trouvée par l'élève à l'écran
   * "calculerSn", AVANT de poser l'équation. */
  k: number;
  /** Vérité terrain — jamais montrée directement à l'élève. */
  xReel: number;
}
export type ExerciceAlgebriqueSommeSn = ExerciceAlgebriqueSommeSnA | ExerciceAlgebriqueSommeSnB | ExerciceAlgebriqueSommeSnC | ExerciceAlgebriqueSommeSnD;

/** Famille bonus C — isoler le RANG n (pas d'inconnue x ici : u1/r sont NUMÉRIQUES, comme dans
 * "principal"). `k` dérivé de `n` (choisi EN PREMIER, plage comparable à `indiceTermeEloigne` de la
 * famille "principal") — même principe de construction "à l'envers", jamais de rejet/régénération. */
export interface ExerciceAlgebriqueRangN {
  famille: "algebriqueRangN";
  u1: number;
  r: number;
  k: number;
  /** Vérité terrain (réponse attendue) — jamais montrée directement à l'élève. */
  n: number;
}

export type ExerciceSuiteArithmetique =
  | ExercicePrincipalSuiteArithmetique
  | ExerciceCoherenceSuiteArithmetique
  | ExerciceAlgebriqueTermeGeneral
  | ExerciceAlgebriqueSommeSn
  | ExerciceAlgebriqueRangN;

export type GenerateurExerciceSuiteArithmetique = () => ExerciceSuiteArithmetique;
