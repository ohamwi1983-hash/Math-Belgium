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
  m: number;
  g1: number;
  g2: number;
}
type Signature = Signature2 | Signature3;

/** 2 écarts DISTINCTS (jamais g1===g2) — un espacement SYMÉTRIQUE (r1=r2-g, r3=r2+g) rend f'
 * IMPAIRE autour de r2 (f'(r2+u)=4A·u·(u²-g²), impaire en u), donc son intégrale F(r2+u)-F(r2) est
 * PAIRE en u : f(r1) et f(r3) (les 2 racines de MÊME classification, "outer" du triplet) seraient
 * alors TOUJOURS mathématiquement ÉGALES, quels que soient `r1`/T choisis ensuite — un cas
 * d'ambiguïté STRUCTURELLE (jamais résolue par la recherche de marges, voir `candidatsUniques`),
 * démontré par calcul direct et confirmé empiriquement (`index.test.ts`). Écarter cette symétrie
 * dès le tirage, avec un repli déterministe borné plutôt qu'un rejet illimité.
 */
function tirerEcartsDistincts(): [number, number] {
  const g1 = entierAleatoire(2, 4);
  let g2 = entierAleatoire(2, 4);
  for (let tentative = 0; g2 === g1 && tentative < 10; tentative++) g2 = entierAleatoire(2, 4);
  if (g2 === g1) g2 = g1 === 4 ? 2 : g1 + 1;
  return [g1, g2];
}

const A_MAGNITUDES = [-4, -2, 2, 4];
const M_MAGNITUDES_POSITIFS = [1, 2, 3];
const M_MAGNITUDES_NEGATIFS = [-1, -2, -3];

/** Pour 3 racines, le signe de `m` détermine le motif (min,max,min si m>0 — `casMin` alors
 * TOUJOURS "local", seul `casMax` est tunable — ou max,min,max si m<0, symétrique) — voir tête de
 * fichier. Choisi selon `cible` plutôt que tiré au hasard : viser `casMax="borne"` exige m>0,
 * viser `casMin="borne"` exige m<0 ; pour "local-local" (les 2 motifs conviennent), tiré au hasard. */
function tirerSignature(nbRacines: 2 | 3, cible: { casMax: CasBorneAbsolu; casMin: CasBorneAbsolu }): Signature {
  if (nbRacines === 2) {
    const a = A_MAGNITUDES[entierAleatoire(0, A_MAGNITUDES.length - 1)];
    return { nbRacines: 2, a, gap: entierAleatoire(2, 4) };
  }
  const [g1, g2] = tirerEcartsDistincts();
  let poolM = Math.random() < 0.5 ? M_MAGNITUDES_POSITIFS : M_MAGNITUDES_NEGATIFS;
  if (cible.casMax === "borne") poolM = M_MAGNITUDES_POSITIFS;
  else if (cible.casMin === "borne") poolM = M_MAGNITUDES_NEGATIFS;
  const m = poolM[entierAleatoire(0, poolM.length - 1)];
  return { nbRacines: 3, m, g1, g2 };
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
  const { m, g1, g2 } = signature;
  const A = 3 * m;
  const r2 = r1 + g1;
  const r3 = r2 + g2;
  const somme = r1 + r2 + r3;
  const sommePaires = r1 * r2 + r1 * r3 + r2 * r3;
  const produit = r1 * r2 * r3;
  const B = -4 * m * somme;
  const C = 6 * m * sommePaires;
  const D = -12 * m * produit;
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

const MARGES_GAUCHE = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15];
const MARGES_DROITE = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 18];
const T_MIN = 6;
// "Raisonnable" (voir tâche, ex. 6 à 24) est un exemple, pas un plafond dur — une marge GAUCHE
// grande pousse aussi `rDernier` (donc T) vers le haut avant même d'ajouter la marge DROITE ; un
// plafond trop serré empêche parfois la recherche d'atteindre certaines combinaisons. 30 reste
// "réaliste" pour un contexte en heures/jours tout en laissant assez de marge à la recherche.
const T_MAX = 30;

interface FormeTrouvee {
  coeffsSansConstante: number[];
  racines: number[];
  classification: ClassificationExtremumBorne[];
  T: number;
}

/** Cherche (r1,T) réalisant EXACTEMENT `cible` pour UNE signature donnée — `null` si aucune
 * combinaison de la grille n'y parvient (peut arriver : pour une signature donnée, la pente peut
 * être trop raide pour qu'une marge minimale (=1) suffise à rester "local", ou trop douce pour
 * jamais dépasser un extremum local même à la marge maximale — voir `genererExerciceExtremaBornes`,
 * qui retire alors une signature FRAÎCHE plutôt que d'insister sur celle-ci). `repli`, la 1ère
 * combinaison valide (candidats uniques) rencontrée quel que soit le cas obtenu, est renvoyée en
 * 2e élément pour servir de filet de sécurité au niveau appelant. */
function rechercherForme(signature: Signature, cible: { casMax: CasBorneAbsolu; casMin: CasBorneAbsolu }): { exact: FormeTrouvee | null; repli: FormeTrouvee | null } {
  let repli: FormeTrouvee | null = null;
  for (const margeGauche of MARGES_GAUCHE) {
    const r1 = margeGauche;
    const { coeffs, racines } = construireFormeSansConstante(signature, r1);
    const classification = classifierExtrema(coeffs, racines);
    const rDernier = racines[racines.length - 1];
    for (const margeDroite of MARGES_DROITE) {
      const T = rDernier + margeDroite;
      if (T < T_MIN || T > T_MAX) continue;
      const cas = calculerCas(coeffs, racines, classification, T);
      if (!cas.candidatsUniques) continue;
      const forme: FormeTrouvee = { coeffsSansConstante: coeffs, racines, classification, T };
      if (repli === null) repli = forme;
      if (cas.casMax === cible.casMax && cas.casMin === cible.casMin) return { exact: forme, repli };
    }
  }
  return { exact: null, repli };
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
const MAX_SIGNATURES_ESSAYEES = 25;

function trouverFormeAvecCible(nbRacines: 2 | 3, cible: { casMax: CasBorneAbsolu; casMin: CasBorneAbsolu }): FormeTrouvee {
  let repliGlobal: FormeTrouvee | null = null;
  for (let tentative = 0; tentative < MAX_SIGNATURES_ESSAYEES; tentative++) {
    const signature = tirerSignature(nbRacines, cible);
    const { exact, repli } = rechercherForme(signature, cible);
    if (exact) return exact;
    if (repliGlobal === null && repli !== null) repliGlobal = repli;
  }
  // Repli déterministe — jamais atteint en pratique (voir index.test.ts), mais borné et toujours
  // défini : `repliGlobal` est déjà garanti non-null dès la 1ère signature testée (une signature
  // "simple" — écarts distincts, marge=1 — a systématiquement des candidats uniques).
  if (repliGlobal) return repliGlobal;
  const { coeffs, racines } = construireFormeSansConstante(tirerSignature(nbRacines, cible), 1);
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
  const forme = trouverFormeAvecCible(nbRacines, cible);
  const d = choisirConstante(forme.coeffsSansConstante, forme.racines, forme.T);
  const coeffs = [...forme.coeffsSansConstante];
  coeffs[0] = d;
  return {
    contexte: contexteForce ?? tirerContexte(),
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

export function construireAvecVarianteId(id: string): ExerciceExtremaBornes {
  const contexte = CONTEXTES_EXTREMA_BORNES[0];
  switch (id) {
    case "max-local-min-local":
      return genererExerciceExtremaBornes({ casMax: "local", casMin: "local" }, 2, contexte);
    case "max-local-min-borne":
      return genererExerciceExtremaBornes({ casMax: "local", casMin: "borne" }, 3, contexte);
    case "max-borne-min-local":
      return genererExerciceExtremaBornes({ casMax: "borne", casMin: "local" }, 3, contexte);
    case "max-borne-min-borne":
      // Impossible avec 3 racines (voir tête de fichier) — TOUJOURS 2 racines pour ce cas,
      // indépendamment de ce que `nbRacinesForce` demanderait.
      return genererExerciceExtremaBornes({ casMax: "borne", casMin: "borne" }, 2, contexte);
    default:
      throw new Error(`construireAvecVarianteId : id inconnu "${id}"`);
  }
}
