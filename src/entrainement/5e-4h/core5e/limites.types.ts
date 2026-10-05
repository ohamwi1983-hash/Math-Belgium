/**
 * Couche core (5e) — contrat pour `5gen20` ("Limites, reconnaissance et calcul", chapitre "Limites
 * et asymptotes"). 4 familles STRUCTURELLEMENT DISJOINTES (union discriminée par `famille`, même
 * principe que 5gen5/5gen10/5gen13/5gen14) : "limiteReelle" (substitution directe, résultat fini),
 * "formeIndeterminee" (0/0, un facteur (x-a) commun), "limiteInfiniePoint" (dénominateur nul en a,
 * numérateur non nul — racine simple/double du dénominateur), "limiteInfini" (x→±∞, comparaison de
 * degrés).
 *
 * Toute limite/ratio EXACT est représenté par `FractionExacte` (jamais un flottant reconstruit après
 * coup) — leçon tirée de `prompt5gen14remplacementvariante.md` (un dénominateur non représentable
 * exactement en IEEE754 avait produit un artefact décimal affiché à l'écran, ex.
 * "10.666666666666668") : ici la fraction est calculée en arithmétique ENTIÈRE dès la génération,
 * jamais reconstruite depuis un flottant approximatif.
 */

export interface FractionExacte {
  /** Signé, peut être 0. */
  num: number;
  /** Toujours > 0. */
  den: number;
}

/**
 * Famille 0 — nombre réel : N(x)=kN·x+bN, D(x)=kD·x+bD (linéaires), D(a)≠0 GARANTI par construction
 * (jamais un rejet/régénération — `a` et `D(a)` sont choisis en premier, `bD` s'ensuit). Substitution
 * directe de `a` donne un résultat fini immédiatement, pas de forme indéterminée.
 */
export interface ExerciceLimiteReelle {
  famille: "limiteReelle";
  a: number;
  kN: number;
  bN: number;
  kD: number;
  bD: number;
  /** N(a)/D(a), réduite. */
  limite: FractionExacte;
}

/**
 * Famille 1 — forme 0/0 : N(x)=kN·(x-a)·(x-p), D(x)=kD·(x-a)·(x-q), un facteur (x-a) commun aux
 * deux. `limite` (= kN·(a-p) / (kD·(a-q)), réduite) TOUJOURS dérivée de `a`/`kN`/`p`/`kD`/`q` —
 * jamais l'inverse (construction "à l'envers" au sens de CETTE famille : la vérité terrain
 * structurelle est choisie en premier, la limite s'ensuit automatiquement en arithmétique exacte,
 * jamais un rejet/régénération si le résultat n'est pas "propre" — il l'est TOUJOURS par
 * construction entière).
 */
export interface ExerciceLimiteFormeIndeterminee {
  famille: "formeIndeterminee";
  a: number;
  kN: number;
  p: number;
  kD: number;
  q: number;
  limite: FractionExacte;
}

/**
 * Famille 2 — limite infinie en un point : N(x)=kN·x+bN (linéaire, N(a)≠0), D(x) nul en a.
 * - "racineSimple" : D(x)=kD·(x-a)·(x-q), q≠a — le signe de D change de part et d'autre de a, DEUX
 *   limites unilatérales potentiellement différentes.
 * - "racineDouble" : D(x)=kD·(x-a)², le signe de D est CONSTANT (=signe de kD) des deux côtés — UNE
 *   seule limite bilatérale (piège : croire à tort qu'il y en a toujours deux).
 * Tous les signes (`signeNumerateurA`/`signeDenominateurGauche`/`signeDenominateurDroite`/
 * `signeLimiteGauche`/`signeLimiteDroite`) sont la vérité terrain, recalculables depuis
 * `kN,bN,a,kD,q` mais stockés pour usage direct côté moteur/présentation (même convention que
 * `ExercicePrincipalSuiteArithmetique`, qui stocke `indicesTermesProches`/`indiceTermeEloigne`
 * plutôt que de les recalculer partout).
 */
export interface ExerciceLimiteInfiniePoint {
  famille: "limiteInfiniePoint";
  a: number;
  sousCas: "racineSimple" | "racineDouble";
  kN: number;
  bN: number;
  kD: number;
  /** Présent uniquement si `sousCas==="racineSimple"`. */
  q?: number;
  signeNumerateurA: 1 | -1;
  signeDenominateurGauche: 1 | -1;
  /** === `signeDenominateurGauche` si `sousCas==="racineDouble"`. */
  signeDenominateurDroite: 1 | -1;
  signeLimiteGauche: 1 | -1;
  /** === `signeLimiteGauche` si `sousCas==="racineDouble"`. */
  signeLimiteDroite: 1 | -1;
}

/**
 * Famille 3 — limite à l'infini : N(x)/D(x), polynômes représentés par leurs coefficients
 * `[c0,c1,...,cDeg]` (indice = degré du terme, `cDeg` toujours non nul). `sousCas` dérivé de
 * `degN`/`degD` : "degresEgaux" (limite finie = ratio des coefficients dominants, INDÉPENDANTE de
 * la direction), "numerateurPlusGrand" (limite infinie, signe dépendant de la parité du degré
 * résultant ET de la direction si ce degré est impair), "numerateurPlusPetit" (limite = 0).
 */
export interface ExerciceLimiteInfini {
  famille: "limiteInfini";
  direction: "plus" | "moins";
  sousCas: "degresEgaux" | "numerateurPlusGrand" | "numerateurPlusPetit";
  coeffsN: number[];
  coeffsD: number[];
  degN: number;
  degD: number;
  /** Degré du terme dominant qui subsiste après simplification (degN-degD) — peut être négatif
   * ("numerateurPlusPetit", le terme simplifié tend vers 0), nul ("degresEgaux", un nombre pur) ou
   * positif ("numerateurPlusGrand", un monôme). */
  degreResultat: number;
  /** Ratio des coefficients dominants (kN/kD, réduit) — TOUJOURS présent, quel que soit `sousCas` :
   * c'est la valeur de référence de l'écran "simplifierLimiteRef" (`ratioCoefficients·x^degreResultat`,
   * degré éventuellement négatif ou nul) ET, quand `natureLimite==="finie"`, la limite finale
   * elle-même (`degreResultat===0`). */
  ratioCoefficients: FractionExacte;
  natureLimite: "finie" | "zero" | "infinie";
  /** Présent uniquement si `natureLimite==="infinie"` (sousCas "numerateurPlusGrand"). */
  signeLimiteInfinie?: 1 | -1;
}

export type ExerciceLimite =
  | ExerciceLimiteReelle
  | ExerciceLimiteFormeIndeterminee
  | ExerciceLimiteInfiniePoint
  | ExerciceLimiteInfini;

export type GenerateurExerciceLimite = () => ExerciceLimite;
