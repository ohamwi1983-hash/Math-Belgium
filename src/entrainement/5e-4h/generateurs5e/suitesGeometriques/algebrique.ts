/**
 * Couche A (5e) — 3 familles bonus "isoler une inconnue algébrique" de 5gen15, REFONTE
 * (`prompt5gen15refontefamillesbonus.md`, miroir direct de `generateurs5e/suitesArithmetiques/algebrique.ts`,
 * 5gen14) remplaçant intégralement les 2 anciennes familles "moyenne géométrique" :
 * - Famille A (`algebriqueTermeGeneral`) — u_p ET u_n TOUS DEUX algébriques en x, isolés via la
 *   relation générale `u_n=u_p·q^(n-p)` (q numérique).
 * - Famille B (`algebriqueSommeSn`) — 2 sous-cas à fréquence comparable (A/B), selon que u1 ou S_n
 *   est l'expression algébrique. q TOUJOURS numérique (voir doc du contrat, core5e/suitesGeometriques.types.ts).
 * - Famille C (`algebriqueRangN`) — isoler le rang n, q RESTREINT AUX VALEURS STRICTEMENT POSITIVES
 *   (voir doc du contrat).
 *
 * Construction "à l'envers" (jamais de rejet/régénération jusqu'à tomber juste) : la vérité terrain
 * (`xReel` pour A/B, `n` pour C) est choisie EN PREMIER, la valeur cible dérivée ENSUITE en
 * substituant cette vérité terrain dans la formule.
 */
import type {
  ExerciceAlgebriqueRangN,
  ExerciceAlgebriqueSommeSn,
  ExerciceAlgebriqueSommeSnA,
  ExerciceAlgebriqueSommeSnB,
  ExerciceAlgebriqueTermeGeneral,
  FractionQ,
  SousCasSommeSnGeometrique,
  TermeLineaire,
  TermeLineaireFractionQ,
} from "../../core5e/suitesGeometriques.types";
import { additionnerFractionQ, diviserFractionQ, entierVersFractionQ, fractionQ, fractionQVersNombre, multiplierFractionQ, puissanceFractionQ, soustraireFractionQ } from "./fraction";
import { Q_SIGNE_POOL } from "./principal";

function entierAleatoire(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/** x cible — entier ou fraction irréductible simple (jamais 0, jamais décimal non exact) — choisie
 * EN PREMIER, tout le reste de l'exercice est dérivé depuis cette vérité terrain. Dénominateurs
 * limités à des PUISSANCES DE 2 ({2,4}) — même patron que `generateurs5e/suitesArithmetiques/algebrique.ts`
 * (5gen14), répliqué ici (Couche A ↔ Couche A, réutilisation libre du PRINCIPE, jamais du code —
 * chaque générateur garde sa propre implémentation, CLAUDE.md). Retourne directement une `FractionQ`
 * (jamais une division flottante `n/d`, même exacte en binaire pour ces dénominateurs — toute la
 * chaîne de calcul qui en dérive doit rester en arithmétique fractionnaire de bout en bout, voir
 * `prompt5gen155gen16arithmetiqueexacte.md`). */
function tirerXCible(): FractionQ {
  if (Math.random() < 0.55) {
    let x = entierAleatoire(-6, 6);
    while (x === 0) x = entierAleatoire(-6, 6);
    return entierVersFractionQ(x);
  }
  const denominateurs = [2, 4];
  const d = denominateurs[Math.floor(Math.random() * denominateurs.length)];
  let n = entierAleatoire(-3 * d, 3 * d);
  while (n === 0 || n % d === 0) n = entierAleatoire(-3 * d, 3 * d);
  return fractionQ(n, d);
}

function tirerCoefficientNonNul(): number {
  const magnitude = entierAleatoire(1, 5);
  return Math.random() < 0.5 ? magnitude : -magnitude;
}

function tirerTermeLineaire(): TermeLineaire {
  return { a: tirerCoefficientNonNul(), b: entierAleatoire(-10, 10) };
}

function elementAleatoire<T>(tab: readonly T[]): T {
  return tab[Math.floor(Math.random() * tab.length)];
}

const TENTATIVES_MAX = 100;

/** Pool ENTIER (jamais fractionnaire, contrairement à `Q_SIGNE_POOL`) — réservé à la famille B
 * (`algebriqueSommeSn`) : `C=(q^n-1)/(q-1)` reste alors TOUJOURS un entier exact (somme de
 * puissances entières d'un ratio entier), ce qui garantit que `k`/le coefficient de l'équation
 * confirmée restent affichables comme une fraction à petit dénominateur (`ui5e/formatSuiteGeometrique.ts`,
 * `formatValeurExacteLatex`, dénominateur borné à 8) — un q fractionnaire ferait exploser le
 * dénominateur de `C` (ex. q=1/3, n=5 ⟹ dénominateur en 3^4), produisant un décimal non terminant à
 * l'affichage (violerait "jamais de décimal", CLAUDE.md). La famille A n'a pas ce problème : elle
 * n'affiche jamais la constante `q^(n-p)` calculée, seulement `q` lui-même (déjà propre par
 * construction) — elle garde donc le pool `Q_SIGNE_POOL` complet (fractions comprises). */
const Q_ENTIER_POOL = [2, 3, 4, -2, -3, -4];

// ============================================================================
// Famille A — isoler x via u_n=u_p·q^(n-p).
// ============================================================================

/** p≠n, 2 indices tirés INDÉPENDAMMENT sur une plage large [1,15] — jamais l'un des 2 fixé/concentré
 * sur de petites valeurs. */
function tirerPetNDistincts(): [number, number] {
  const p = entierAleatoire(1, 15);
  let n = entierAleatoire(1, 15);
  while (n === p) n = entierAleatoire(1, 15);
  return [p, n];
}

/** Coefficient non nul ET tel que la pente `an - C*upA` reste non nulle (sinon l'équation
 * dégénère) — retry borné puis repli déterministe, même patron que 5gen14. Comparaison EXACTE
 * (`.num!==0` sur une fraction réduite), plus une tolérance flottante approximative. */
function tirerCoefficientEvitantPente(C: FractionQ, upA: number): number {
  for (let tentative = 0; tentative < TENTATIVES_MAX; tentative++) {
    const c = tirerCoefficientNonNul();
    const pente = soustraireFractionQ(entierVersFractionQ(c), multiplierFractionQ(C, entierVersFractionQ(upA)));
    if (pente.num !== 0) return c;
  }
  const penteRepli1 = soustraireFractionQ(entierVersFractionQ(1), multiplierFractionQ(C, entierVersFractionQ(upA)));
  return penteRepli1.num !== 0 ? 1 : 2;
}

// Seuil de magnitude conservé comme proxy de lisibilité pédagogique (même principe que
// `principal.ts`/`Q_SIGNE_POOL`, doc de tête) — évalué UNIQUEMENT pour l'éligibilité d'un candidat
// (`fractionQVersNombre`, jamais réutilisé pour dériver/afficher une valeur). |n-p| atteint jusqu'à
// 14 ici (p,n∈[1,15] indépendants) : q est filtré APRÈS avoir tiré p/n (jamais l'inverse : la plage
// p/n doit rester entière et indépendante de q, voir doc de `tirerPetNDistincts` ci-dessus et le
// test dédié) pour ne garder que les valeurs du pool dont `q^(n-p)` reste d'une magnitude
// raisonnable — toujours au moins une (q=±2 et ±3/2 restent sûrs jusqu'à l'exposant 14 le plus
// défavorable).
const SEUIL_MAGNITUDE_MIN = 1e-6;

function tirerQPourExposant(exposant: number): FractionQ {
  const candidats = Q_SIGNE_POOL.filter((q) => Math.abs(fractionQVersNombre(puissanceFractionQ(q, exposant))) >= SEUIL_MAGNITUDE_MIN);
  return elementAleatoire(candidats.length > 0 ? candidats : Q_SIGNE_POOL);
}

export function genererExerciceAlgebriqueTermeGeneral(): ExerciceAlgebriqueTermeGeneral {
  const xReel = tirerXCible();
  const [p, n] = tirerPetNDistincts();
  const q = tirerQPourExposant(n - p);
  const up = tirerTermeLineaire();
  // C=q^(n-p) — exposant ENTIER fixé par les indices tirés (jamais par x), arithmétique EXACTE sur
  // fractions (`fraction.ts`) — jamais `Math.pow` flottant, exact pour q rationnel (positif ou
  // négatif, entier ou fractionnaire) quel que soit l'exposant.
  const C = puissanceFractionQ(q, n - p);
  const an = tirerCoefficientEvitantPente(C, up.a);
  const upSubstitue = additionnerFractionQ(multiplierFractionQ(entierVersFractionQ(up.a), xReel), entierVersFractionQ(up.b));
  const bn = soustraireFractionQ(multiplierFractionQ(C, upSubstitue), multiplierFractionQ(entierVersFractionQ(an), xReel));
  const un: TermeLineaireFractionQ = { a: an, b: bn };
  return { famille: "algebriqueTermeGeneral", up, un, p, n, q, xReel };
}

// ============================================================================
// Famille B — isoler x via S_n=u_1·(q^n-1)/(q-1), q TOUJOURS numérique, 2 sous-cas.
// ============================================================================

function tirerIndiceNSomme(): number {
  return entierAleatoire(3, 12);
}

/** Sous-cas A — u1(x) algébrique, q/n numériques. Pente de l'équation posée = C·a_{u1}
 * (C=(q^n-1)/(q-1)), TOUJOURS non nulle — C ne s'annule que si q^n=1, impossible sur `Q_ENTIER_POOL`
 * (q≠1, q≠-1, |q|≥2 partout), a_{u1} non nul par `tirerTermeLineaire` — aucun retry nécessaire. */
/** `C=(q^n-1)/(q-1)` — arithmétique EXACTE (`fraction.ts`), q entier du `Q_ENTIER_POOL` (jamais
 * fractionnaire dans cette famille, voir doc de tête de fichier) mais traité par la MÊME mécanique
 * que le reste du générateur — aucune branche "entier donc flottant sûr" à justifier au cas par
 * cas. */
function calculerCSommeSn(q: FractionQ, n: number): FractionQ {
  return diviserFractionQ(soustraireFractionQ(puissanceFractionQ(q, n), entierVersFractionQ(1)), soustraireFractionQ(q, entierVersFractionQ(1)));
}

function genererSousCasA(): ExerciceAlgebriqueSommeSnA {
  const xReel = tirerXCible();
  const q = entierVersFractionQ(elementAleatoire(Q_ENTIER_POOL));
  const n = tirerIndiceNSomme();
  const u1 = tirerTermeLineaire();
  const C = calculerCSommeSn(q, n);
  const u1Substitue = additionnerFractionQ(multiplierFractionQ(entierVersFractionQ(u1.a), xReel), entierVersFractionQ(u1.b));
  const k = multiplierFractionQ(C, u1Substitue);
  return { famille: "algebriqueSommeSn", sousCas: "A", u1, q, n, k, xReel };
}

/** Sous-cas B — mécanique DIFFÉRENTE (miroir du sous-cas D de la famille B de 5gen14) : Sn(x)
 * algébrique, u1/q/n numériques. `k` calculé D'ABORD (u1/q/n tous numériques, aucune inconnue),
 * PUIS `sn` construite pour que `sn(xReel)=k`. */
function genererSousCasB(): ExerciceAlgebriqueSommeSnB {
  const xReel = tirerXCible();
  const q = entierVersFractionQ(elementAleatoire(Q_ENTIER_POOL));
  const n = tirerIndiceNSomme();
  const u1 = entierAleatoire(-20, 20);
  const k = multiplierFractionQ(entierVersFractionQ(u1), calculerCSommeSn(q, n));
  const aS = tirerCoefficientNonNul();
  const bS = soustraireFractionQ(k, multiplierFractionQ(entierVersFractionQ(aS), xReel));
  const sn: TermeLineaireFractionQ = { a: aS, b: bS };
  return { famille: "algebriqueSommeSn", sousCas: "B", u1, q, n, sn, k, xReel };
}

export function construireSommeSnAvecSousCas(sousCas: SousCasSommeSnGeometrique): ExerciceAlgebriqueSommeSn {
  return sousCas === "A" ? genererSousCasA() : genererSousCasB();
}

/** Tirage uniforme sur les 2 sous-cas — "fréquence comparable", explicitement demandé. Exportée :
 * réutilisée telle quelle par `index.ts` pour le tirage top-niveau non forcé. */
export function tirerSousCasSommeSnUniforme(): SousCasSommeSnGeometrique {
  return Math.random() < 0.5 ? "A" : "B";
}

export function genererExerciceAlgebriqueSommeSn(): ExerciceAlgebriqueSommeSn {
  return construireSommeSnAvecSousCas(tirerSousCasSommeSnUniforme());
}

// ============================================================================
// Famille C — isoler le rang n via u_n=u_1·q^(n-1)=k, SANS logarithme (réduction à la même base).
// q RESTREINT AUX VALEURS STRICTEMENT POSITIVES (voir core5e/suitesGeometriques.types.ts pour la
// raison technique impérative).
// ============================================================================

/** q=num/den, TOUJOURS strictement positif — pool distinct de `Q_SIGNE_POOL` (qui contient des
 * valeurs négatives), déjà en fraction réduite (`FractionQ`, jamais reconstruite depuis un
 * flottant), conservée TELLE QUELLE (jamais `frac.num/frac.den` — c'est précisément cette division,
 * jetant la fraction exacte juste après l'avoir calibrée pour `u1`/`k`, qui produisait le `q`
 * décimal reporté par `prompt5gen155gen16arithmetiqueexacte.md`). */
const Q_POSITIF_FRACTIONS: FractionQ[] = [
  { num: 2, den: 1 },
  { num: 3, den: 1 },
  { num: 1, den: 2 },
  { num: 1, den: 3 },
  { num: 3, den: 2 },
  { num: 2, den: 3 },
];

/** m (exposant cible, entier, choisi EN PREMIER) borné à [2,9] — calibré empiriquement pour que
 * `k=u1·q^m` reste un ENTIER EXACT tout en restant "raisonnable à lire" (au pire, den=3/num=3 et
 * m=9 donnent des valeurs à 5 chiffres, jamais de notation exponentielle — largement sous le seuil
 * empirique déjà établi ailleurs sur ce générateur). `u1=c·den^m` (c petit entier non nul) garantit
 * `u1·q^m=c·num^m` EXACT (produit d'entiers, jamais une division flottante) — `u1`/`k` restent donc
 * des `number` (toujours entiers par construction, voir `core5e/suitesGeometriques.types.ts`), seul
 * `q` est du type `FractionQ`. */
export function genererExerciceAlgebriqueRangN(): ExerciceAlgebriqueRangN {
  const q = elementAleatoire(Q_POSITIF_FRACTIONS);
  const m = entierAleatoire(2, 9);
  const c = entierAleatoire(1, 5);
  const u1 = c * Math.pow(q.den, m);
  const k = c * Math.pow(q.num, m);
  const n = m + 1;
  return { famille: "algebriqueRangN", u1, q, m, k, n };
}
