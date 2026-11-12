/**
 * Couche A (5e) — génération pour 5gen34 ("Extrema en contexte borné"), générateur du chapitre
 * "Dérivées et applications". N'importe jamais rien de `moteur5e/`.
 *
 * Construction "à l'envers" depuis les racines CHOISIES de f'(t)=0 (même technique que
 * 5gen28/5gen29, jamais résolu puis vérifié) :
 *   - 2 racines (f' quadratique, f cubique) : f'(t)=3a(t-r1)(t-r2) identifié à 3at²+2bt+c donne
 *     b=-3a(r1+r2)/2 (entier si `a` est PAIR, technique identique à 5gen29) et c=3a·r1·r2.
 *   - 3 racines (f' cubique, f quartique) : f'(t)=4A(t-r1)(t-r2)(t-r3) identifié à
 *     4At³+3Bt²+2Ct+D. Choisir A=3m (m entier non nul) rend les 3 coefficients TOUJOURS entiers :
 *     B=-4m·Σr, C=6m·Σ(paires), D=-12m·Πr (démontré par substitution directe, voir index.test.ts).
 *
 * Le PIÈGE CENTRAL de ce générateur (contrairement aux autres du chapitre, domaine NON borné) :
 * t∈[0;T] est FERMÉ ET BORNÉ, donc l'extremum ABSOLU peut être un extremum LOCAL **OU** une des 2
 * BORNES (t=0 ou t=T) — indépendamment pour le MAX et pour le MIN, 4 cas croisés possibles. La
 * constante `d` (ou `e`) ne change JAMAIS lequel des 4 cas se produit (translation verticale
 * uniforme, n'affecte aucune comparaison relative) — seule la POSITION des racines par rapport à 0
 * et T (donc T lui-même, et la position du premier extremum) contrôle le cas obtenu. Technique de
 * recherche : boucle bornée sur une grille de marges candidates (`MARGES_GAUCHE`/`MARGES_DROITE`),
 * jamais un rejet non plafonné — même patron que `tirerPositionsVA` (5gen22/lectureGraphiqueLimites).
 *
 * **Contrainte mathématique RÉELLE découverte en construisant ce générateur** (jamais un simple
 * problème de réglage de marges) : avec un NOMBRE IMPAIR de racines de f' (le cas "3 racines"), la
 * PREMIÈRE et la DERNIÈRE racine ont TOUJOURS la MÊME classification (alternance oblige :
 * min,max,min ou max,min,max). Or, entre 0 et la 1ère racine, f est monotone — donc f(0) est
 * TOUJOURS du côté "attendu" de cette 1ère racine (si elle est classée "max", f(0) < f(r1)
 * TOUJOURS ; si "min", f(0) > f(r1) TOUJOURS), et de même entre la dernière racine et T. Pour le
 * motif "min,max,min" (les 2 racines extérieures sont des MIN), ceci force f(0) et f(T) à être
 * chacun du côté "au-dessus" de ces minima extérieurs — donc `casMin` NE PEUT JAMAIS être "borne"
 * (démontré par le calcul + confirmé empiriquement sur 500+ tirages, voir index.test.ts). Motif
 * symétrique "max,min,max" : `casMax` ne peut jamais être "borne". Conséquence : **le cas
 * "max=borne ET min=borne" est mathématiquement IMPOSSIBLE avec 3 racines** pour cette
 * construction (f(0) ancré à la valeur de référence 0) — `genererExerciceExtremaBornes` réserve
 * donc ce cas croisé au cas "2 racines" (seul motif à nombre PAIR de racines, sans cette
 * contrainte de parité — les 2 racines ont des classifications OPPOSÉES, chaque borne est alors
 * libre indépendamment). Le signe du paramètre de forme (`m` pour 3 racines) est choisi selon la
 * cible plutôt que tiré au hasard, pour ne jamais viser un cas structurellement hors de portée.
 */
import type { CasBorneAbsolu, ClassificationExtremumBorne, ExerciceExtremaBornes } from "../../core5e/extremaBornes.types";
import { entierAleatoire } from "../limites/fraction";
import { CONTEXTES_EXTREMA_BORNES, tirerContexte } from "./contextes";

export { CONTEXTES_EXTREMA_BORNES };

// ============================================================================
// Évaluation polynomiale générique — coefficients ASCENDANTS. RÉPLIQUÉE (jamais importée) dans
// `moteur5e/verificationExtremaBornes.ts`, voir CLAUDE.md, règle moteur5e ↔ generateurs5e.
// ============================================================================

export function evalPoly(coeffs: number[], t: number): number {
  let s = 0;
  for (let i = 0; i < coeffs.length; i++) s += coeffs[i] * Math.pow(t, i);
  return s;
}

export function derivativeCoeffs(coeffs: number[]): number[] {
  const d: number[] = [];
  for (let i = 1; i < coeffs.length; i++) d.push(coeffs[i] * i);
  return d;
}

// ============================================================================
// Classification GÉNÉRIQUE d'une racine de f'(t)=0 par évaluation du signe de f' juste avant/après
// — jamais une parité déduite à la main (source d'erreur), toujours recalculée depuis les
// coefficients réels. Racines TOUJOURS simples dans ce générateur (jamais de racine double) donc
// TOUJOURS un vrai changement de signe — "max" (+ puis -) ou "min" (- puis +).
// ============================================================================

function representantsZones(valeursTriees: number[]): number[] {
  const reps: number[] = [valeursTriees[0] - 1];
  for (let i = 0; i < valeursTriees.length - 1; i++) reps.push((valeursTriees[i] + valeursTriees[i + 1]) / 2);
  reps.push(valeursTriees[valeursTriees.length - 1] + 1);
  return reps;
}

export function classifierExtrema(coeffs: number[], racines: number[]): ClassificationExtremumBorne[] {
  const deriv = derivativeCoeffs(coeffs);
  const reps = representantsZones(racines);
  return racines.map((_, i) => {
    const avant = evalPoly(deriv, reps[i]);
    const apres = evalPoly(deriv, reps[i + 1]);
    return avant > 0 && apres < 0 ? "max" : "min";
  });
}

// ============================================================================
// Forme (coefficients + racines), AVANT ajout de la constante `d` — construite depuis un `r1`
// (position du premier racine, variable de recherche) et une "signature" (écarts entre racines +
// paramètre de signe/magnitude) fixée une fois pour tout l'exercice.
// ============================================================================

interface Signature2 {
  nbRacines: 2;
  a: number;
  gap: number;
}
interface Signature3 {
  nbRacines: 3;
  /** Facteur dominant de f' : f'(t) = K(t−r1)(t−r2)(t−r3). |K| ∈ {4, 8, …, 24} — coefficients de f
   * entiers dès que K est multiple de 12, ou multiple de 4 avec r1+r2+r3 divisible par 3 (testé
   * dans la recherche, forme écartée sinon). Le signe de K fixe le motif. */
  K: number;
  g1: number;
  g2: number;
}
type Signature = Signature2 | Signature3;

/** 2 écarts DISTINCTS (jamais g1===g2) — un espacement SYMÉTRIQUE (r1=r2-g, r3=r2+g) rend f'
 * IMPAIRE autour de r2 (f'(r2+u)=4A·u·(u²-g²), impaire en u), donc son intégrale F(r2+u)-F(r2) est
 * PAIRE en u : f(r1) et f(r3) (les 2 racines de MÊME classification, "outer" du triplet) seraient
 * alors TOUJOURS mathématiquement ÉGALES, quels que soient `r1`/T choisis ensuite — un cas
 * d'ambiguïté STRUCTURELLE (jamais résolue par la recherche de marges, voir `candidatsUniques`).
 * Écarts dans 1..5 (T ≤ 9 pour les quartiques, coefficients ≤ 300 et valeurs ≤ ~3 000 filtrés
 * par la recherche). */
function tirerEcartsDistincts(): [number, number] {
  const g1 = entierAleatoire(1, 5);
  let g2 = entierAleatoire(1, 5);
  for (let tentative = 0; g2 === g1 && tentative < 10; tentative++) g2 = entierAleatoire(1, 5);
  if (g2 === g1) g2 = g1 === 5 ? 1 : g1 + 1;
  return [g1, g2];
}

/** |K| multiple de 4 (coefficient dominant K/4 de 1 à 6) — variété des quartiques : avec T ≤ 9,
 * les cas « une borne bat un extremum local » n'admettent qu'une vingtaine de configurations de
 * racines ; faire varier K les multiplie (≥ 20 polynômes distincts par variante quartique). */
const MAGNITUDES_K = [4, 8, 12, 16, 20, 24];

/** Pour 3 racines, le signe de `K` détermine le motif (min,max,min si K>0 — `casMin` alors
 * TOUJOURS "local", seul `casMax` est tunable — ou max,min,max si K<0, symétrique) — voir tête de
 * fichier. Choisi selon `cible` plutôt que tiré au hasard. Pour 2 racines, `a` ∈ {±1, ±2, ±3}
 * (±1 et ±3 seulement si l'écart est pair, pour que b = −3a(r1+r2)/2 soit entier). */
function tirerSignature(nbRacines: 2 | 3, cible: { casMax: CasBorneAbsolu; casMin: CasBorneAbsolu }): Signature {
  if (nbRacines === 2) {
    const gap = entierAleatoire(1, 6);
    const magnitudes = gap % 2 === 0 ? [1, 2, 3] : [2];
    const magnitude = magnitudes[entierAleatoire(0, magnitudes.length - 1)];
    const a = Math.random() < 0.5 ? magnitude : -magnitude;
    return { nbRacines: 2, a, gap };
  }
  const [g1, g2] = tirerEcartsDistincts();
  let signe = Math.random() < 0.5 ? 1 : -1;
  if (cible.casMax === "borne") signe = 1;
  else if (cible.casMin === "borne") signe = -1;
  const K = signe * MAGNITUDES_K[entierAleatoire(0, MAGNITUDES_K.length - 1)];
  return { nbRacines: 3, K, g1, g2 };
}

/** Coefficients ASCENDANTS SANS la constante (coeffs[0]=0 — la constante n'affecte jamais quel cas
 * max/min-local/borne est obtenu, voir tête de fichier) + racines, pour un `r1` donné. */
function construireFormeSansConstante(signature: Signature, r1: number): { coeffs: number[]; racines: number[] } {
  if (signature.nbRacines === 2) {
    const { a, gap } = signature;
    const r2 = r1 + gap;
    const b = (-3 * a * (r1 + r2)) / 2;
    const c = 3 * a * r1 * r2;
    return { coeffs: [0, c, b, a], racines: [r1, r2] };
  }
  const { K, g1, g2 } = signature;
  const r2 = r1 + g1;
  const r3 = r2 + g2;
  const somme = r1 + r2 + r3;
  const sommePaires = r1 * r2 + r1 * r3 + r2 * r3;
  const produit = r1 * r2 * r3;
  // f(t) = K·[t⁴/4 − S·t³/3 + P·t²/2 − Π·t] — coefficients entiers vérifiés par l'appelant
  // (`coefficientsEntiers`) : K/4, K·S/3, K·P/2 doivent l'être.
  const A = K / 4;
  const B = (-K * somme) / 3;
  const C = (K * sommePaires) / 2;
  const D = -K * produit;
  return { coeffs: [0, D, C, B, A], racines: [r1, r2, r3] };
}

// ============================================================================
// Calcul du cas croisé (max local/borne, min local/borne) réellement obtenu pour une forme donnée
// — RÉPLIQUÉ dans `moteur5e/verificationExtremaBornes.ts` (vérité terrain de l'écran 5).
// ============================================================================

export interface CasObtenu {
  casMax: CasBorneAbsolu;
  casMin: CasBorneAbsolu;
  /** false si 2 valeurs candidates (extrema locaux + bornes) coïncident exactement — ambigu,
   * jamais retenu (l'écran 5 exige un maximum/minimum absolu SANS égalité). */
  candidatsUniques: boolean;
}

function calculerCas(coeffs: number[], racines: number[], classification: ClassificationExtremumBorne[], T: number): CasObtenu {
  const f0 = evalPoly(coeffs, 0);
  const fT = evalPoly(coeffs, T);
  const valeursExtrema = racines.map((r) => evalPoly(coeffs, r));
  const candidats = [...valeursExtrema, f0, fT];
  const candidatsUniques = new Set(candidats).size === candidats.length;

  const locauxMax = racines.filter((_, i) => classification[i] === "max").map((r) => evalPoly(coeffs, r));
  const locauxMin = racines.filter((_, i) => classification[i] === "min").map((r) => evalPoly(coeffs, r));
  const meilleurLocalMax = Math.max(...locauxMax);
  const meilleurLocalMin = Math.min(...locauxMin);
  const borneMax = Math.max(f0, fT);
  const borneMin = Math.min(f0, fT);

  const casMax: CasBorneAbsolu = borneMax > meilleurLocalMax ? "borne" : "local";
  const casMin: CasBorneAbsolu = borneMin < meilleurLocalMin ? "borne" : "local";
  return { casMax, casMin, candidatsUniques };
}

// ============================================================================
// Recherche bornée de (r1, T) réalisant le cas croisé CIBLÉ — grille de marges candidates, jamais
// un rejet non plafonné ; repli déterministe sur la 1ère combinaison valide (candidats uniques)
// rencontrée si aucune ne réalise exactement la cible (jamais atteint en pratique, voir
// index.test.ts, mais le repli reste défensif).
// ============================================================================

const MARGES_GAUCHE = [1, 2, 3, 4, 5, 6, 7];
const MARGES_DROITE = [1, 2, 3, 4, 5, 6];
const T_MIN = 5;
/** Allègement (décision L) : T ≤ 8 pour les quartiques (3 racines), T ≤ 12 pour les cubiques —
 * valeurs à évaluer raisonnables, coefficients bornés par `COEFF_MAX`. */
const T_MAX_PAR_NB_RACINES: Record<2 | 3, number> = { 2: 12, 3: 9 };
const COEFF_MAX = 300;
/** Écart maximal entre les valeurs de f aux candidats (avant la constante, qui ajoute 5 à 20) :
 * les valeurs à calculer restent ≤ ~3 000. */
const AMPLITUDE_VALEURS_MAX = 2980;

interface FormeTrouvee {
  coeffsSansConstante: number[];
  racines: number[];
  classification: ClassificationExtremumBorne[];
  T: number;
}

/** Cherche TOUTES les combinaisons (r1,T) réalisant EXACTEMENT `cible` pour UNE signature donnée,
 * et en tire une au hasard (variété : la 1re de la grille donnait toujours le même T). `repli` : une
 * combinaison valide (candidats uniques) quel que soit le cas obtenu, filet de sécurité. */
function rechercherForme(signature: Signature, cible: { casMax: CasBorneAbsolu; casMin: CasBorneAbsolu }): { exact: FormeTrouvee | null; repli: FormeTrouvee | null } {
  let repli: FormeTrouvee | null = null;
  const exacts: FormeTrouvee[] = [];
  const tMax = T_MAX_PAR_NB_RACINES[signature.nbRacines];
  for (const margeGauche of MARGES_GAUCHE) {
    const r1 = margeGauche;
    const { coeffs, racines } = construireFormeSansConstante(signature, r1);
    if (coeffs.some((c) => !Number.isInteger(c) || Math.abs(c) > COEFF_MAX)) continue;
    const classification = classifierExtrema(coeffs, racines);
    const rDernier = racines[racines.length - 1];
    for (const margeDroite of MARGES_DROITE) {
      const T = rDernier + margeDroite;
      if (T < T_MIN || T > tMax) continue;
      const cas = calculerCas(coeffs, racines, classification, T);
      if (!cas.candidatsUniques) continue;
      const valeurs = [0, T, ...racines].map((t) => evalPoly(coeffs, t));
      if (Math.max(...valeurs) - Math.min(...valeurs) > AMPLITUDE_VALEURS_MAX) continue;
      const forme: FormeTrouvee = { coeffsSansConstante: coeffs, racines, classification, T };
      if (repli === null) repli = forme;
      if (cas.casMax === cible.casMax && cas.casMin === cible.casMin) exacts.push(forme);
    }
  }
  const exact = exacts.length > 0 ? exacts[entierAleatoire(0, exacts.length - 1)] : null;
  return { exact, repli };
}

// ============================================================================
// Point d'entrée — cible un cas croisé (forcé ou tiré uniformément parmi les 4), nombre de racines
// tiré indépendamment 2/3 (~50/50), contexte narratif tiré indépendamment.
// ============================================================================

const CAS_POSSIBLES: { casMax: CasBorneAbsolu; casMin: CasBorneAbsolu }[] = [
  { casMax: "local", casMin: "local" },
  { casMax: "local", casMin: "borne" },
  { casMax: "borne", casMin: "local" },
  { casMax: "borne", casMin: "borne" },
];

function tirerCible(): { casMax: CasBorneAbsolu; casMin: CasBorneAbsolu } {
  return CAS_POSSIBLES[entierAleatoire(0, CAS_POSSIBLES.length - 1)];
}

/** Constante `d` (ou `e`) — choisie APRÈS la forme, pour translater tous les candidats vers des
 * valeurs positives "réalistes" (grandeur physique) sans jamais changer lequel des 4 cas est
 * obtenu (translation uniforme). */
function choisirConstante(coeffsSansConstante: number[], racines: number[], T: number): number {
  const candidats = [...racines.map((r) => evalPoly(coeffsSansConstante, r)), evalPoly(coeffsSansConstante, 0), evalPoly(coeffsSansConstante, T)];
  const minCandidat = Math.min(...candidats);
  return -minCandidat + entierAleatoire(5, 20);
}

/** Nombre de signatures FRAÎCHES essayées avant d'accepter le repli — borné, jamais un rejet
 * illimité. Une signature donnée peut ne réaliser aucun des 4 cas croisés à marge=1..18 (pente
 * trop raide ou trop douce pour CETTE signature précise) ; une AUTRE signature (autre écart entre
 * racines, autre magnitude de coefficient) y parvient presque toujours — vérifié empiriquement sur
 * 500+ tirages, voir `index.test.ts`. */
const MAX_SIGNATURES_ESSAYEES = 250;

function trouverFormeAvecCible(nbRacines: 2 | 3, cible: { casMax: CasBorneAbsolu; casMin: CasBorneAbsolu }, nbRacinesLibre = false): FormeTrouvee {
  let repliGlobal: FormeTrouvee | null = null;
  for (let tentative = 0; tentative < MAX_SIGNATURES_ESSAYEES; tentative++) {
    const signature = tirerSignature(nbRacines, cible);
    const { exact, repli } = rechercherForme(signature, cible);
    if (exact) return exact;
    if (repliGlobal === null && repli !== null) repliGlobal = repli;
  }
  // Avec T ≤ 8, une quartique atteint difficilement « max local ET min local » : si le nombre de
  // racines n'était pas imposé, on bascule sur une cubique plutôt que d'accepter un autre cas.
  if (nbRacinesLibre && nbRacines === 3) return trouverFormeAvecCible(2, cible);
  // Repli déterministe — jamais atteint en pratique (voir index.test.ts), mais borné et toujours
  // défini : `repliGlobal` est déjà garanti non-null dès la 1ère signature testée (une signature
  // "simple" — écarts distincts, marge=1 — a systématiquement des candidats uniques).
  if (repliGlobal) return repliGlobal;
  const signatureRepli = tirerSignature(nbRacines, cible);
  // K multiple de 12 : coefficients entiers quelles que soient les racines.
  if (signatureRepli.nbRacines === 3) signatureRepli.K = Math.sign(signatureRepli.K) * 12;
  if (signatureRepli.nbRacines === 2) signatureRepli.a = Math.sign(signatureRepli.a) * 2;
  const { coeffs, racines } = construireFormeSansConstante(signatureRepli, 1);
  return { coeffsSansConstante: coeffs, racines, classification: classifierExtrema(coeffs, racines), T: Math.max(T_MIN, racines[racines.length - 1] + 1) };
}

export function genererExerciceExtremaBornes(
  cibleForcee?: { casMax: CasBorneAbsolu; casMin: CasBorneAbsolu },
  nbRacinesForce?: 2 | 3,
  contexteForce?: ExerciceExtremaBornes["contexte"],
): ExerciceExtremaBornes {
  const cible = cibleForcee ?? tirerCible();
  // "max=borne ET min=borne" est mathématiquement IMPOSSIBLE avec 3 racines (voir tête de fichier)
  // — jamais visé avec ce nombre de racines, même si explicitement forcé par un appelant.
  const impose3Impossible = cible.casMax === "borne" && cible.casMin === "borne";
  const nbRacines = impose3Impossible ? 2 : (nbRacinesForce ?? (Math.random() < 0.5 ? 2 : 3));
  const forme = trouverFormeAvecCible(nbRacines, cible, nbRacinesForce === undefined && !impose3Impossible);
  const d = choisirConstante(forme.coeffsSansConstante, forme.racines, forme.T);
  const coeffs = [...forme.coeffsSansConstante];
  coeffs[0] = d;
  const valeurMax = Math.max(...[0, forme.T, ...forme.racines].map((t) => evalPoly(coeffs, t)));
  return {
    contexte: contexteForce ?? tirerContexte(valeurMax),
    T: forme.T,
    coeffs,
    degre: nbRacines === 2 ? 3 : 4,
    racinesFPrime: forme.racines,
    classificationFPrime: forme.classification,
  };
}

// ============================================================================
// Panneau dev — force chacun des 4 cas croisés (voir CLAUDE.md, "Sélecteur dev forçant chacun des
// 4 cas croisés").
// ============================================================================

export const CATALOGUE_VARIANTES: { id: string; label: string }[] = [
  { id: "max-local-min-local", label: "Max local — min local (2 racines)" },
  { id: "max-local-min-borne", label: "Max local — min à une borne (3 racines)" },
  { id: "max-borne-min-local", label: "Max à une borne — min local (3 racines)" },
  { id: "max-borne-min-borne", label: "Max à une borne — min à une borne (2 racines)" },
];

/** Contexte tiré au hasard (compatible avec l'ordre de grandeur des valeurs, `tirerContexte`) —
 * plus jamais forcé au n° 0 (audit 5c5d point 6). */
export function construireAvecVarianteId(id: string): ExerciceExtremaBornes {
  switch (id) {
    case "max-local-min-local":
      return genererExerciceExtremaBornes({ casMax: "local", casMin: "local" }, 2);
    case "max-local-min-borne":
      return genererExerciceExtremaBornes({ casMax: "local", casMin: "borne" }, 3);
    case "max-borne-min-local":
      return genererExerciceExtremaBornes({ casMax: "borne", casMin: "local" }, 3);
    case "max-borne-min-borne":
      // Impossible avec 3 racines (voir tête de fichier) — TOUJOURS 2 racines pour ce cas,
      // indépendamment de ce que `nbRacinesForce` demanderait.
      return genererExerciceExtremaBornes({ casMax: "borne", casMin: "borne" }, 2);
    default:
      throw new Error(`construireAvecVarianteId : id inconnu "${id}"`);
  }
}
