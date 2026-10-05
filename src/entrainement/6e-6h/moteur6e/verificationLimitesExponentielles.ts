import type { CategorieFI, CibleLimite, ExerciceLimiteA, ExerciceLimiteB, ExerciceLimiteC, ExerciceLimiteG, ExerciceLimiteH, ExerciceLimiteI, ExerciceLimiteJ, ExerciceLimiteK, ExerciceLimiteL, ExerciceLimiteN } from "../core6e/limitesExponentielles.types";
import { diagnostiquerValeur, evaluerExpressionExponentielle } from "./equivalenceExponentielle";

/**
 * Couche B (6e) — vérification pour `6gen6`. N'importe jamais rien de `src/generateurs6e/` — voir
 * `verificationLimitesExponentielles.test.ts` pour la preuve avec des exercices factices définis
 * localement.
 *
 * **Réponse catégorielle partagée** (`ReponseLimite`) — miroir élève du `CibleLimite` du contrat
 * (core), voir sa note de conception. `verifierReponseLimite` est la SEULE primitive nécessaire
 * pour les 7 écrans catégoriels (A×2, B×3, C-facteurs) — jamais 7 comparateurs séparés.
 */
export type ReponseLimite = { type: "plus_infini" } | { type: "moins_infini" } | { type: "zero" } | { type: "valeur"; texte: string };

const TOLERANCE = 0.01;

export function verifierReponseLimite(cible: CibleLimite, reponse: ReponseLimite): boolean {
  if (cible.type === "valeur") {
    return reponse.type === "valeur" && diagnostiquerValeur(reponse.texte, cible.valeur, TOLERANCE) === "correct";
  }
  return reponse.type === cible.type;
}

function memeValeur(texte: string, cible: number): boolean {
  return diagnostiquerValeur(texte, cible, TOLERANCE) === "correct";
}

/**
 * Compare une expression (fonction de x) à une référence fermée en échantillonnant plusieurs
 * points — réplique locale de `diagnostiquerEquivalenceFonction` (`equivalenceExponentielle.ts`)
 * mais retourne un simple booléen (jamais un statut à 3 valeurs séparé, cette vérification-ci
 * n'expose qu'un booléen à `etapeTentatives.ts`, comme tous les autres écrans de ce moteur) —
 * DUPLIQUÉE plutôt qu'appelée directement pour pouvoir composer la garde anti-recopie ci-dessous
 * SANS documenter un second niveau d'indirection ; en pratique cette fonction délègue simplement à
 * `diagnostiquerValeur`/évaluation directe.
 */
/** `variable` (additif, défaut "x") — nom de la variable liée, pour les écrans qui demandent une
 * reformulation dans une AUTRE variable (ex. famille L, changement de variable u=x/k). */
function equivalenteAReference(texte: string, reference: (x: number) => number, points: number[], variable: string = "x"): boolean {
  let comparables = 0;
  for (const x of points) {
    const attendu = reference(x);
    if (!Number.isFinite(attendu)) continue;
    let soumis: number;
    try {
      soumis = evaluerExpressionExponentielle(texte, { [variable]: x });
    } catch {
      return false;
    }
    if (!Number.isFinite(soumis)) return false;
    comparables++;
    if (Math.abs(soumis - attendu) > TOLERANCE) return false;
  }
  return comparables >= Math.min(3, points.length);
}

/**
 * ⚠️ **Vigilance documentée** (même famille de risque que gen50/gen52, chapitre 6 4e — voir
 * CLAUDE.md, "Sixième révision — audit puis correctif de vérification structurelle") : pour
 * l'écran "combiner" de la famille G, la cible demandée est ALGÉBRIQUEMENT IDENTIQUE (pour tout x
 * hors des points exclus) à l'expression f(x) déjà affichée dans l'énoncé — combiner en une seule
 * fraction ne change JAMAIS la valeur de la fonction là où elle est définie. Une pure équivalence
 * NUMÉRIQUE ne peut donc PAS distinguer "réponse déjà correctement transformée" de "recopie brute
 * de l'énoncé, non transformée". Seule une garde LÉGÈRE est appliquée (`texteEstRecopieLitterale`,
 * ci-dessous) : rejette une recopie EXACTE (normalisée) du texte source, le cas de triche le plus
 * probable en pratique (copier-coller), sans prétendre couvrir une reformulation non simplifiée
 * mais différemment présentée — limite connue et acceptée, documentée ici plutôt que devinée
 * silencieusement.
 */
function normaliser(texte: string): string {
  return texte.replace(/\s+/g, "").toLowerCase();
}

function texteEstRecopieLitterale(texteSoumis: string, texteSource: string): boolean {
  return normaliser(texteSoumis) === normaliser(texteSource);
}

// ============================================================================
// Famille A — 2 écrans (exposant, globale). Purement catégoriel.
// ============================================================================

export function verifierAExposant(exercice: ExerciceLimiteA, reponse: ReponseLimite): boolean {
  return verifierReponseLimite(exercice.limiteExposant, reponse);
}

export function verifierAGlobale(exercice: ExerciceLimiteA, reponse: ReponseLimite): boolean {
  return verifierReponseLimite(exercice.limiteGlobale, reponse);
}

// ============================================================================
// Famille B — 3 écrans (exponentielle, polynomiale, globale). Purement catégoriel.
// ============================================================================

export function verifierBExponentielle(exercice: ExerciceLimiteB, reponse: ReponseLimite): boolean {
  return verifierReponseLimite(exercice.limiteExponentielle, reponse);
}

export function verifierBPolynomiale(exercice: ExerciceLimiteB, reponse: ReponseLimite): boolean {
  return verifierReponseLimite(exercice.limitePolynomiale, reponse);
}

export function verifierBGlobale(exercice: ExerciceLimiteB, reponse: ReponseLimite): boolean {
  return verifierReponseLimite(exercice.limiteGlobale, reponse);
}

// ============================================================================
// Famille C — 2 écrans (facteurs — 2 sous-réponses catégorielles combinées —, globale — valeur
// numérique libre, toujours 0).
// ============================================================================

export interface ReponseFacteursC {
  facteur1: ReponseLimite;
  facteur2: ReponseLimite;
}

export function verifierCFacteurs(exercice: ExerciceLimiteC, reponse: ReponseFacteursC): boolean {
  return verifierReponseLimite(exercice.limiteFacteur1, reponse.facteur1) && verifierReponseLimite(exercice.limiteFacteur2, reponse.facteur2);
}

export function verifierCGlobale(exercice: ExerciceLimiteC, texte: string): boolean {
  return memeValeur(texte, exercice.limiteGlobale);
}

// ============================================================================
// Famille G — 3 écrans (combiner, ordre1, conclure). Instance unique.
// ============================================================================

function referenceG(): (x: number) => number {
  return (x: number) => 1 / Math.cos(x) + 1 / (1 - Math.exp(Math.PI / 2 - x));
}

const TEXTE_SOURCE_G = "1/cos(x)+1/(1-exp(pi/2-x))";
const POINTS_G = [Math.PI / 2 + 0.3, Math.PI / 2 - 0.3, Math.PI / 2 + 0.7, Math.PI / 2 - 0.7, Math.PI / 2 + 1.1, Math.PI / 2 - 1.1, Math.PI / 2 + 1.9, Math.PI / 2 - 1.9];

export function verifierGCombiner(_exercice: ExerciceLimiteG, texte: string): boolean {
  if (texteEstRecopieLitterale(texte, TEXTE_SOURCE_G)) return false;
  return equivalenteAReference(texte, referenceG(), POINTS_G);
}

/** Écran "ordre1" — QCM booléen "l'ordre 1 suffit-il à conclure ?" — TOUJOURS "Non" pour cette
 * instance (voir la note de conception dans `core6e/limitesExponentielles.types.ts`). */
export function verifierGOrdre1(_exercice: ExerciceLimiteG, ordre1Suffit: boolean): boolean {
  return ordre1Suffit === false;
}

export function verifierGConclure(exercice: ExerciceLimiteG, texte: string): boolean {
  return memeValeur(texte, exercice.limiteFinale);
}

// ============================================================================
// Famille H — L'Hôpital, 0/0 pur exponentiel (4 écrans : forme, numérateur, dénominateur,
// conclure). f(x) = (e^(kx) − 1) / (m·x), x→0.
// ============================================================================

/** Écran "forme" — classification AVANT toute dérivation, TOUJOURS "zero_sur_zero" pour cette
 * famille (f(0)=0/0 par construction, voir `construireH`). */
export function verifierHForme(_exercice: ExerciceLimiteH, reponse: CategorieFI): boolean {
  return reponse === "zero_sur_zero";
}

const POINTS_H = [-1.7, -1.1, -0.6, -0.3, 0.3, 0.6, 1.1, 1.7];

/** f'(x) = k·ln(a)·a^(k(x-x0)) — pas de garde anti-recopie nécessaire ici : la dérivée ne
 * ressemble textuellement à aucune sous-expression de l'énoncé source, contrairement aux anciennes
 * familles D/E/F où factoriser/scinder préservait la même valeur. Fonction ENTIÈRE (définie sur
 * tout ℝ), les points d'échantillonnage n'ont pas besoin d'être recentrés autour de x0. */
function derivePartieExponentielleH(exercice: ExerciceLimiteH, x: number): number {
  const { base, k, x0 } = exercice;
  return k * Math.log(base) * Math.pow(base, k * (x - x0));
}

/** `expAuNumerateur` choisit quelle position (numérateur ou dénominateur) porte la dérivée de la
 * partie exponentielle (équivalence de FONCTION) et laquelle porte `m`, une CONSTANTE indépendante
 * de x (simple valeur numérique — demander une "équivalence de fonction" pour une constante serait
 * une complexité artificielle côté élève). */
export function verifierHNumerateur(exercice: ExerciceLimiteH, texte: string): boolean {
  if (exercice.expAuNumerateur) return equivalenteAReference(texte, (x) => derivePartieExponentielleH(exercice, x), POINTS_H);
  return memeValeur(texte, exercice.m);
}

export function verifierHDenominateur(exercice: ExerciceLimiteH, texte: string): boolean {
  if (exercice.expAuNumerateur) return memeValeur(texte, exercice.m);
  return equivalenteAReference(texte, (x) => derivePartieExponentielleH(exercice, x), POINTS_H);
}

export function verifierHConclure(exercice: ExerciceLimiteH, texte: string): boolean {
  return memeValeur(texte, exercice.limiteFinale);
}

// ============================================================================
// Famille I — L'Hôpital, 0/0 mixte trigonométrique (4 écrans : forme, numérateur, dénominateur,
// conclure). Base `a` quelconque, orientation sin/exp variable (`sinAuNumerateur`).
// ============================================================================

const POINTS_I = [-1.7, -1.1, -0.6, -0.3, 0.3, 0.6, 1.1, 1.7];

export function verifierIForme(_exercice: ExerciceLimiteI, reponse: CategorieFI): boolean {
  return reponse === "zero_sur_zero";
}

/** d/dx[sin(k(x-x0))] = k·cos(k(x-x0)) — fonction ENTIÈRE, pas besoin de recentrer les points
 * d'échantillonnage autour de x0. */
function deriveeSinI(exercice: ExerciceLimiteI, x: number): number {
  return exercice.k * Math.cos(exercice.k * (x - exercice.x0));
}

/** d/dx[a^(m(x-x0))-1] = m·ln(a)·a^(m(x-x0)) — fonction ENTIÈRE, même remarque. */
function deriveePartieExponentielleI(exercice: ExerciceLimiteI, x: number): number {
  const { base, m, x0 } = exercice;
  return m * Math.log(base) * Math.pow(base, m * (x - x0));
}

export function verifierINumerateur(exercice: ExerciceLimiteI, texte: string): boolean {
  const derivee = exercice.sinAuNumerateur ? deriveeSinI : deriveePartieExponentielleI;
  return equivalenteAReference(texte, (x) => derivee(exercice, x), POINTS_I);
}

export function verifierIDenominateur(exercice: ExerciceLimiteI, texte: string): boolean {
  const derivee = exercice.sinAuNumerateur ? deriveePartieExponentielleI : deriveeSinI;
  return equivalenteAReference(texte, (x) => derivee(exercice, x), POINTS_I);
}

export function verifierIConclure(exercice: ExerciceLimiteI, texte: string): boolean {
  return memeValeur(texte, exercice.limiteFinale);
}

// ============================================================================
// Famille J — L'Hôpital, 0/0 mixte arcfonction (4 écrans : forme, numérateur, dénominateur,
// conclure). Base `a` quelconque, `arcFn` ∈ {arctan, arcsin}, orientation variable
// (`arcAuNumerateur`).
// ============================================================================

export function verifierJForme(_exercice: ExerciceLimiteJ, reponse: CategorieFI): boolean {
  return reponse === "zero_sur_zero";
}

/** Décalages SOIGNEUSEMENT choisis pour rester dans le domaine de arcsin(k(x-x0)) quel que soit
 * |k|≤4 — |k·(x-x0)| ≤ 4·0,2 = 0,8 < 1, marge confortable — RECENTRÉS autour de x0 (le domaine
 * dépend de x0 maintenant que le point de limite varie). Utilisés aussi pour arctan (domaine ℝ,
 * aucune restriction), par souci d'un seul jeu de points pour toute dérivée d'arcfonction. */
const DECALAGES_ARC_J = [-0.2, -0.15, -0.08, -0.04, 0.04, 0.08, 0.15, 0.2];
function pointsArcJ(x0: number): number[] {
  return DECALAGES_ARC_J.map((d) => x0 + d);
}
const POINTS_EXP_J = [-1.7, -1.1, -0.6, -0.3, 0.3, 0.6, 1.1, 1.7];

/** d/dx[arctan(k(x-x0))] = k/(1+(k(x-x0))²), d/dx[arcsin(k(x-x0))] = k/√(1-(k(x-x0))²). */
function deriveeArcFnJ(exercice: ExerciceLimiteJ, x: number): number {
  const { k, x0, arcFn } = exercice;
  if (arcFn === "arctan") return k / (1 + Math.pow(k * (x - x0), 2));
  return k / Math.sqrt(1 - Math.pow(k * (x - x0), 2));
}

/** d/dx[a^(m(x-x0))-1] = m·ln(a)·a^(m(x-x0)) — fonction ENTIÈRE, pas besoin de recentrage. */
function deriveePartieExponentielleJ(exercice: ExerciceLimiteJ, x: number): number {
  const { base, m, x0 } = exercice;
  return m * Math.log(base) * Math.pow(base, m * (x - x0));
}

export function verifierJNumerateur(exercice: ExerciceLimiteJ, texte: string): boolean {
  if (exercice.arcAuNumerateur) return equivalenteAReference(texte, (x) => deriveeArcFnJ(exercice, x), pointsArcJ(exercice.x0));
  return equivalenteAReference(texte, (x) => deriveePartieExponentielleJ(exercice, x), POINTS_EXP_J);
}

export function verifierJDenominateur(exercice: ExerciceLimiteJ, texte: string): boolean {
  if (exercice.arcAuNumerateur) return equivalenteAReference(texte, (x) => deriveePartieExponentielleJ(exercice, x), POINTS_EXP_J);
  return equivalenteAReference(texte, (x) => deriveeArcFnJ(exercice, x), pointsArcJ(exercice.x0));
}

export function verifierJConclure(exercice: ExerciceLimiteJ, texte: string): boolean {
  return memeValeur(texte, exercice.limiteFinale);
}

// ============================================================================
// Famille K — L'Hôpital, DEUX applications (6 écrans : forme, numérateur1, dénominateur1,
// numérateur2, dénominateur2, conclure). Base `a` quelconque, orientation variable
// (`expAuNumerateur`).
// ============================================================================

const POINTS_K = [-1.7, -1.1, -0.6, -0.3, 0.3, 0.6, 1.1, 1.7];

export function verifierKForme(_exercice: ExerciceLimiteK, reponse: CategorieFI): boolean {
  return reponse === "zero_sur_zero";
}

/** N'(x) = k·ln(a)·(a^(k(x-x0))-1) — fonction ENTIÈRE, pas besoin de recentrer les points. */
function derivee1ExpK(exercice: ExerciceLimiteK, x: number): number {
  const { base, k, x0 } = exercice;
  return k * Math.log(base) * (Math.pow(base, k * (x - x0)) - 1);
}

/** D'(x) = 2m(x-x0) — une vraie fonction de x (pas une constante), même à ce stade. */
function derivee1PolyK(exercice: ExerciceLimiteK, x: number): number {
  return 2 * exercice.m * (x - exercice.x0);
}

/** N''(x) = k²·ln(a)²·a^(k(x-x0)) — pas de nouvel écran de diagnostic ici : la consigne de l'écran
 * explique directement que le rapport des dérivées précédentes est ENCORE 0/0 en x0 (6 écrans
 * fixes, jamais un écran de re-diagnostic séparé). */
function derivee2ExpK(exercice: ExerciceLimiteK, x: number): number {
  const { base, k, x0 } = exercice;
  const lnA = Math.log(base);
  return k * k * lnA * lnA * Math.pow(base, k * (x - x0));
}

export function verifierKNumerateur1(exercice: ExerciceLimiteK, texte: string): boolean {
  const derivee = exercice.expAuNumerateur ? derivee1ExpK : derivee1PolyK;
  return equivalenteAReference(texte, (x) => derivee(exercice, x), POINTS_K);
}

export function verifierKDenominateur1(exercice: ExerciceLimiteK, texte: string): boolean {
  const derivee = exercice.expAuNumerateur ? derivee1PolyK : derivee1ExpK;
  return equivalenteAReference(texte, (x) => derivee(exercice, x), POINTS_K);
}

export function verifierKNumerateur2(exercice: ExerciceLimiteK, texte: string): boolean {
  if (exercice.expAuNumerateur) return equivalenteAReference(texte, (x) => derivee2ExpK(exercice, x), POINTS_K);
  return memeValeur(texte, 2 * exercice.m);
}

/** D''(x) = 2m — une CONSTANTE, indépendante de x (même principe que `verifierHDenominateur`) —
 * sauf si l'orientation place la partie exponentielle au dénominateur, auquel cas c'est une vraie
 * fonction de x. */
export function verifierKDenominateur2(exercice: ExerciceLimiteK, texte: string): boolean {
  if (exercice.expAuNumerateur) return memeValeur(texte, 2 * exercice.m);
  return equivalenteAReference(texte, (x) => derivee2ExpK(exercice, x), POINTS_K);
}

export function verifierKConclure(exercice: ExerciceLimiteK, texte: string): boolean {
  return memeValeur(texte, exercice.limiteFinale);
}

// ============================================================================
// Famille L — FI 1^∞ via pivot e (2 écrans : reformuler, conclure), dispatch par sous-type.
// Variable DIFFÉRENTE de x (u pour L1, t pour L2) — aucun risque de recopie littérale de f(x), même
// principe que l'ancienne famille F1.
// ============================================================================

const POINTS_U_L1 = [-12, -8, -5, -3, 3, 5, 8, 12];
const POINTS_T_L2 = [-0.6, -0.4, -0.25, -0.1, 0.1, 0.25, 0.4, 0.6];

export function verifierLReformuler(exercice: ExerciceLimiteL, texte: string): boolean {
  const { k, m } = exercice;
  if (exercice.sousType === "L1") {
    return equivalenteAReference(texte, (u) => Math.pow(1 + 1 / u, u * k * m), POINTS_U_L1, "u");
  }
  return equivalenteAReference(texte, (t) => Math.pow(1 + t, (k * m) / t), POINTS_T_L2, "t");
}

export function verifierLConclure(exercice: ExerciceLimiteL, texte: string): boolean {
  return memeValeur(texte, exercice.limiteFinale);
}

// ============================================================================
// Famille N — FI ∞^0/0^0 via loi des puissances (2 écrans : combiner, conclure).
// f(x) = (base^(k/x))^(mx+x²), x→0, base quelconque.
// ============================================================================

const POINTS_N = [-1.7, -1.1, -0.6, -0.3, 0.3, 0.6, 1.1, 1.7];

function texteSourceN(exercice: ExerciceLimiteN): string {
  const { base, k, m } = exercice;
  return `(${base}^(${k}/x))^(${m}*x+x^2)`;
}

/** Même vigilance que la famille G ci-dessus : combiner via la loi des puissances ne change jamais
 * la valeur de f(x), une recopie littérale est donc rejetée. */
export function verifierNCombiner(exercice: ExerciceLimiteN, texte: string): boolean {
  if (texteEstRecopieLitterale(texte, texteSourceN(exercice))) return false;
  const { base, k, m } = exercice;
  return equivalenteAReference(texte, (x) => Math.pow(base, k * m + k * x), POINTS_N);
}

export function verifierNConclure(exercice: ExerciceLimiteN, texte: string): boolean {
  return memeValeur(texte, exercice.limiteFinale);
}
