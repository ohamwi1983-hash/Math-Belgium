/**
 * Couche A (5e) — 3 familles bonus "isoler une inconnue algébrique" de 5gen14. REFONDUES par
 * `prompt5gen14refontefamillesbonus.md` (remplace intégralement le design introduit par
 * `prompt5gen14remplacementvariante.md`, voir `docs/historique-5e-suites.md`) :
 * - Famille A (`algebriqueTermeGeneral`) — u_p ET u_n TOUS DEUX algébriques en x (u1 n'apparaît
 *   plus du tout), isolés via la relation générale `u_n=u_p+(n-p)r`.
 * - Famille B (`algebriqueSommeSn`) — 4 sous-cas à fréquence comparable (A/B/C/D), selon quelles
 *   grandeurs (u1/r/Sn) sont algébriques.
 * - Famille C (`algebriqueRangN`) — INCHANGÉE (u1/r numériques, isoler le rang n).
 *
 * Construction "à l'envers" (jamais de rejet/régénération jusqu'à tomber juste) : la vérité terrain
 * (`xReel` pour A/B, `n` pour C) est choisie EN PREMIER, la valeur cible dérivée ENSUITE en
 * substituant cette vérité terrain dans la formule — garantit par construction une solution exacte
 * et propre, jamais un flottant approximatif.
 */
import type {
  ExerciceAlgebriqueRangN,
  ExerciceAlgebriqueSommeSn,
  ExerciceAlgebriqueSommeSnA,
  ExerciceAlgebriqueSommeSnB,
  ExerciceAlgebriqueSommeSnC,
  ExerciceAlgebriqueSommeSnD,
  ExerciceAlgebriqueTermeGeneral,
  SousCasSommeSn,
  TermeLineaire,
} from "../../core5e/suitesArithmetiques.types";
import { tirerU1EtR } from "./parametres";

function entierAleatoire(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** x cible — entier ou fraction irréductible simple (jamais 0, jamais décimal non exact) — choisie
 * EN PREMIER, tout le reste de l'exercice (coefficients, k) est dérivé depuis cette vérité terrain.
 * Dénominateurs limités à des PUISSANCES DE 2 ({2,4}) — jamais 3/5/6 : ce sont les seuls
 * dénominateurs dont TOUTE combinaison linéaire à coefficients entiers (up(x), un(x), Sn(x)) reste
 * représentable EXACTEMENT en flottant IEEE754, sans la moindre erreur d'arrondi. Un dénominateur 3
 * produirait un flottant périodique (ex. x=1/3 ⟹ 0.3333...), qui se propagerait en un `k` affiché à
 * l'écran avec un artefact du type "10.666666666666668" — bug constaté empiriquement en Playwright,
 * jamais un "flottant approximatif" acceptable pour une valeur GÉNÉRÉE (convention transversale
 * CLAUDE.md, "jamais de décimal"). */
function tirerXCible(): number {
  if (Math.random() < 0.55) {
    let x = entierAleatoire(-6, 6);
    while (x === 0) x = entierAleatoire(-6, 6);
    return x;
  }
  const denominateurs = [2, 4];
  const d = denominateurs[Math.floor(Math.random() * denominateurs.length)];
  let n = entierAleatoire(-3 * d, 3 * d);
  while (n === 0 || n % d === 0) n = entierAleatoire(-3 * d, 3 * d);
  const g = pgcd(n, d);
  return n / g / (d / g);
}

function tirerCoefficientNonNul(): number {
  const magnitude = entierAleatoire(1, 5);
  return Math.random() < 0.5 ? magnitude : -magnitude;
}

/** Coefficient non nul ET distinct de `valeur` (`valeur` est toujours non nulle par construction
 * chez tous les appelants) — retry borné puis repli déterministe, même patron "for tentative in
 * range(N)" déjà établi par ce fichier (ex. `tirerTermesLineairesSommeSn` ci-dessous). */
function tirerCoefficientDistinctDe(valeur: number): number {
  for (let tentative = 0; tentative < TENTATIVES_MAX; tentative++) {
    const c = tirerCoefficientNonNul();
    if (c !== valeur) return c;
  }
  return valeur === 1 ? -1 : 1;
}

function tirerTermeLineaire(): TermeLineaire {
  return { a: tirerCoefficientNonNul(), b: entierAleatoire(-10, 10) };
}

const TENTATIVES_MAX = 100;

// ============================================================================
// Famille A — isoler x via la relation générale entre 2 termes : u_n=u_p+(n-p)r.
// ============================================================================

/** p≠n, 2 indices tirés INDÉPENDAMMENT sur une plage large [1,20] — jamais l'un des 2 fixé/concentré
 * sur de petites valeurs (contrairement à l'ancienne version, où seul l'indice de l'"autre" terme
 * variait, u_1 restant toujours le terme de référence). */
function tirerPetNDistincts(): [number, number] {
  const p = entierAleatoire(1, 20);
  let n = entierAleatoire(1, 20);
  while (n === p) n = entierAleatoire(1, 20);
  return [p, n];
}

export function genererExerciceAlgebriqueTermeGeneral(): ExerciceAlgebriqueTermeGeneral {
  const xReel = tirerXCible();
  const r = tirerCoefficientNonNul();
  const [p, n] = tirerPetNDistincts();
  const up = tirerTermeLineaire();
  // a_n ≠ a_p (sinon l'équation u_n(x)=u_p(x)+(n-p)r dégénère — pente nulle, pas de solution
  // unique) — garanti par construction via `tirerCoefficientDistinctDe`.
  const an = tirerCoefficientDistinctDe(up.a);
  const bn = up.a * xReel + up.b + (n - p) * r - an * xReel;
  const un: TermeLineaire = { a: an, b: bn };
  return { famille: "algebriqueTermeGeneral", up, un, p, n, r, xReel };
}

// ============================================================================
// Famille B — isoler x via S_n=(n/2)(2u1+(n-1)r), 4 sous-cas à fréquence comparable.
// ============================================================================

function tirerIndiceNSomme(): number {
  return entierAleatoire(3, 15);
}

/** Sous-cas A — u1(x) algébrique, r/Sn numériques. Pente de l'équation posée = n·a_{u1}, TOUJOURS
 * non nulle par construction (n∈[3,15] jamais nul, a_{u1} non nul par `tirerTermeLineaire`) —
 * aucun retry nécessaire, contrairement au sous-cas C (2 coefficients algébriques pouvant
 * s'annuler mutuellement). */
function genererSousCasA(): ExerciceAlgebriqueSommeSnA {
  const xReel = tirerXCible();
  const n = tirerIndiceNSomme();
  const r = tirerCoefficientNonNul();
  const u1 = tirerTermeLineaire();
  const k = (n / 2) * (2 * (u1.a * xReel + u1.b) + (n - 1) * r);
  return { famille: "algebriqueSommeSn", sousCas: "A", u1, r, n, k, xReel };
}

/** Sous-cas B — r(x) algébrique, u1/Sn numériques. Pente = (n/2)·(n-1)·a_r, TOUJOURS non nulle
 * (n≥3 ⟹ n-1≠0, a_r non nul) — même remarque que le sous-cas A, aucun retry nécessaire. */
function genererSousCasB(): ExerciceAlgebriqueSommeSnB {
  const xReel = tirerXCible();
  const n = tirerIndiceNSomme();
  const u1 = entierAleatoire(-20, 20);
  const r = tirerTermeLineaire();
  const k = (n / 2) * (2 * u1 + (n - 1) * (r.a * xReel + r.b));
  return { famille: "algebriqueSommeSn", sousCas: "B", u1, r, n, k, xReel };
}

/** Sous-cas C — u1(x) ET r(x) algébriques, Sn numérique — SEULE construction qui existait avant
 * cette refonte, réutilisée telle quelle (retry borné : `2u1.a+(n-1)r.a` peut s'annuler, contrairement
 * aux sous-cas A/B à un seul coefficient algébrique). */
function tirerTermesLineairesSommeSn(n: number): [TermeLineaire, TermeLineaire] {
  for (let tentative = 0; tentative < TENTATIVES_MAX; tentative++) {
    const u1 = tirerTermeLineaire();
    const r = tirerTermeLineaire();
    const pente = (n / 2) * (2 * u1.a + (n - 1) * r.a);
    if (pente !== 0) return [u1, r];
  }
  return [
    { a: 1, b: 0 },
    { a: 1, b: 1 },
  ];
}

function genererSousCasC(): ExerciceAlgebriqueSommeSnC {
  const xReel = tirerXCible();
  const n = tirerIndiceNSomme();
  const [u1, r] = tirerTermesLineairesSommeSn(n);
  const k = (n / 2) * (2 * (u1.a * xReel + u1.b) + (n - 1) * (r.a * xReel + r.b));
  return { famille: "algebriqueSommeSn", sousCas: "C", u1, r, n, k, xReel };
}

/** Sous-cas D — mécanique DIFFÉRENTE : Sn(x) algébrique, u1/r numériques. `k` calculé D'ABORD
 * (u1/r/n tous numériques, aucune inconnue), PUIS `sn` construite pour que `sn(xReel)=k` — voir
 * doc de tête du contrat (`core5e/suitesArithmetiques.types.ts`). */
function genererSousCasD(): ExerciceAlgebriqueSommeSnD {
  const xReel = tirerXCible();
  const n = tirerIndiceNSomme();
  const { u1, r } = tirerU1EtR();
  const k = (n / 2) * (2 * u1 + (n - 1) * r);
  const aS = tirerCoefficientNonNul();
  const bS = k - aS * xReel;
  const sn: TermeLineaire = { a: aS, b: bS };
  return { famille: "algebriqueSommeSn", sousCas: "D", u1, r, n, sn, k, xReel };
}

export function construireSommeSnAvecSousCas(sousCas: SousCasSommeSn): ExerciceAlgebriqueSommeSn {
  switch (sousCas) {
    case "A":
      return genererSousCasA();
    case "B":
      return genererSousCasB();
    case "C":
      return genererSousCasC();
    case "D":
      return genererSousCasD();
  }
}

/** Tirage uniforme sur les 4 sous-cas — "fréquence comparable", explicitement demandé (contrairement
 * au tirage PONDÉRÉ entre familles top-niveau, `generateurs5e/suitesArithmetiques/index.ts`).
 * Exportée : réutilisée telle quelle par `index.ts` pour le tirage top-niveau non forcé (jamais
 * réimplémentée localement). */
export function tirerSousCasSommeSnUniforme(): SousCasSommeSn {
  const options: SousCasSommeSn[] = ["A", "B", "C", "D"];
  return options[Math.floor(Math.random() * options.length)];
}

export function genererExerciceAlgebriqueSommeSn(): ExerciceAlgebriqueSommeSn {
  return construireSommeSnAvecSousCas(tirerSousCasSommeSnUniforme());
}

// ============================================================================
// Famille C — isoler le rang n via u1+(n-1)r=k, u1/r NUMÉRIQUES (réutilise `tirerU1EtR`,
// "principal", jamais rejouée localement). INCHANGÉE par cette refonte.
// ============================================================================

/** Plage comparable à `indiceTermeEloigne` (`principal.ts`, `entierAleatoire(50,200)`) —
 * `prompt5gen14remplacementvariante.md` : "borner n dans une plage cohérente avec le reste du
 * générateur (comparable à la plage déjà utilisée pour 'terme éloigné')". */
function tirerNCible(): number {
  return entierAleatoire(50, 200);
}

export function genererExerciceAlgebriqueRangN(): ExerciceAlgebriqueRangN {
  const { u1, r } = tirerU1EtR();
  const n = tirerNCible();
  const k = u1 + (n - 1) * r;
  return { famille: "algebriqueRangN", u1, r, n, k };
}
