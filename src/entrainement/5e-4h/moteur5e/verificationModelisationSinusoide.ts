/**
 * Couche B (5e) — vérification pour 5gen13 ("Modéliser une fonction sinusoïdale en contexte").
 * N'importe jamais rien de `src/generateurs5e/`.
 *
 * Réutilise DIRECTEMENT (moteur→moteur) `diagnostiquerValeurArcSecteur` (5gen6, ±0,01) pour les
 * nombres simples. Les écrans de Phase 2 (branches en u et en t, solutions, bornes d'inéquation)
 * n'utilisent PLUS la primitive de 5gen10 (marge fixe ±0,01, refusait 21 à 76 % des démarches
 * correctes) : marges propagées locales, voir « Tolérances PROPAGÉES » ci-dessous.
 *
 * RÉPLIQUE localement (jamais importée, ces fonctions sont PRIVÉES à leur module d'origine) :
 * - `diagnostiquerSysteme` — même patron que
 *   `verificationProblemesContexte.ts::diagnostiquerEquationLineaireAB` (5gen5), adapté aux 2
 *   variables nommées `omega`/`phi` plutôt que `a`/`b`.
 */
import type { BrancheModelisation, DonneesPhase1, IntervalleModelisation, QuestionExtremum, QuestionInequation, QuestionResoudre } from "../core5e/modelisationSinusoide.types";
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerValeurArcSecteur } from "./verificationArcsSecteurs";
import { diagnostiquerCalculArrondi, diagnostiquerCalculDixieme } from "./verificationGeometrieCercle";

/** `${v}` bascule en notation scientifique ("2.4e-15") dès que |v| est très proche de 0 (cas
 * fréquent : sin/cos/asin d'un argument tombant, à l'erreur flottante près, sur une valeur
 * remarquable) — le parseur maison (`expressionGenerale.ts`) ne comprend pas ce "e", et une
 * réinjection brute dans une expression reconstruite ferait échouer une réponse pourtant
 * mathématiquement correcte (`parse_error` au lieu de "correct"). `toFixed` reste toujours en
 * notation décimale, jamais scientifique, pour les grandeurs bornées manipulées ici (sin/cos/
 * asin/acos∈[−1;1], atan/tan bornés en pratique par les valeurs d'exercice). Bug trouvé par
 * Playwright (`prompt5gen8913conventionphiPhi.md`), pas par les tests unitaires existants (aucun
 * ne couvrait un argument tombant pile sur un multiple de π/une valeur remarquable). */
function formatSansNotationScientifique(v: number): string {
  return v.toFixed(15);
}

// ============================================================================
// Nombres simples — réutilise diagnostiquerValeurArcSecteur (5gen6, moteur→moteur) pour les écrans
// SANS convention d'arrondi propre (bornes u/t des écrans "inequation", hors périmètre de
// `promptcorrections5gen13B1B2.md`).
// ============================================================================

export function diagnostiquerNombre(texte: string, cible: number): StatutVerification {
  return diagnostiquerValeurArcSecteur(texte, cible);
}

// ============================================================================
// Nombres à convention d'arrondi explicite (`promptcorrections5gen13B1B2.md`) — réutilise
// TEL QUEL `diagnostiquerCalculArrondi`/`diagnostiquerCalculDixieme` (`verificationGeometrieCercle.ts`,
// 5gen12, moteur→moteur), jamais une 2e paire de constantes de tolérance dupliquées : "amplitude"/
// "decalage" (B1 A=R/b=R+h_sol, B2 A/b) arrondissent à l'UNITÉ ; "pulsation" (B1/B2, ω=2π/T calculé
// DIRECTEMENT) arrondit à la PREMIÈRE DÉCIMALE. La tolérance décimale porte UNIQUEMENT sur
// la validation de la saisie élève — jamais sur l'affichage interne (état actuel), voir
// `formatOmegaExactPiLatex` dans `ui5e/formatModelisationSinusoide.ts`.
// ============================================================================

export function diagnostiquerNombreUnite(texte: string, cible: number): StatutVerification {
  return diagnostiquerCalculArrondi(texte, cible);
}

export function diagnostiquerNombreDixieme(texte: string, cible: number): StatutVerification {
  return diagnostiquerCalculDixieme(texte, cible);
}

function combiner2(a: StatutVerification, b: StatutVerification): StatutVerification {
  if (a === "parse_error" || b === "parse_error") return "parse_error";
  return a === "correct" && b === "correct" ? "correct" : "not_equivalent";
}

// ============================================================================
// φ modulo 2π (B2) — accepte toute valeur congrue, jamais seulement la valeur "naturelle".
// ============================================================================

export function diagnostiquerPhiModuloDeuxPi(texte: string, cible: number, tolerance = 0.01): StatutVerification {
  try {
    const valeur = evaluerExpressionGenerale(resoudreInverseTrig(texte), 0);
    if (!Number.isFinite(valeur)) return "parse_error";
    const ecart = valeur - cible;
    const kEntier = Math.round(ecart / (2 * Math.PI));
    return Math.abs(ecart - kEntier * 2 * Math.PI) <= tolerance + MARGE ? "correct" : "not_equivalent";
  } catch {
    return "parse_error";
  }
}

// ============================================================================
// Tolérances PROPAGÉES (audit 5e ch. 2, points 49 et 51). Chaque écran accepte une réponse
// arrondie au centième (±0,005) ; une valeur obtenue en DIVISANT par ω une grandeur elle-même
// arrondie au centième hérite d'une erreur 0,005/ω (ω descend à 2π/60 ≈ 0,1), et une solution
// t = c + n·p cumule l'erreur de c et n fois celle de p. Les marges ci-dessous bornent exactement ces
// erreurs (démarche correcte ⇒ acceptée) sans couvrir une erreur de méthode (vérifié par simulation,
// scratchpad 5c2-E).
// ============================================================================

const MARGE = 1e-6;
/** Une valeur en u (argument) arrondie au centième. */
const TOLERANCE_U = 0.0055;
/** Arrondi au centième de la valeur finale demandée. */
const ARRONDI_CENTIEME = 0.0055;

/** Erreur sur t = (u − φ)/ω quand u est arrondi au centième (φ, ω affichés à 5 décimales). */
export function toleranceT(omega: number): number {
  return ARRONDI_CENTIEME + TOLERANCE_U / Math.abs(omega);
}

/** Erreur sur t = c + n·p quand c ET p sont chacun à `toleranceT` près. */
function toleranceSolution(omega: number, n: number): number {
  return ARRONDI_CENTIEME + (TOLERANCE_U / Math.abs(omega)) * (1 + Math.abs(n));
}

/** ω = 2π/T demandé « exact ou arrondi au millième » : ±0,0005. Refuse π/T et 1/T, que l'ancienne
 * marge ±0,05 acceptait dans 57 % et 14 % des tirages (ω ≈ 0,05–0,3). */
export function diagnostiquerPulsation(texte: string, omega: number): StatutVerification {
  return diagnostiquerAvecTolerance(texte, omega, 0.0005);
}

/** φ (B2) = argument cible − ω·t₀ : ω arrondi au millième ⇒ erreur 0,0005·t₀, plus l'arrondi au
 * centième de φ. */
export function tolerancePhiB2(t0: number): number {
  return ARRONDI_CENTIEME + 0.0005 * Math.abs(t0);
}

/** B3 : ω = (α₁ − α₂)/(t₁ − t₂) et φ = α₁ − ω·t₁ avec des α arrondis au centième. */
export function toleranceOmegaB3(t1: number, t2: number): number {
  return ARRONDI_CENTIEME + (2 * TOLERANCE_U) / Math.abs(t1 - t2);
}
export function tolerancePhiB3(t1: number, t2: number): number {
  return ARRONDI_CENTIEME + TOLERANCE_U + toleranceOmegaB3(t1, t2) * Math.max(Math.abs(t1), Math.abs(t2));
}

function diagnostiquerAvecTolerance(texte: string, cible: number, tolerance: number): StatutVerification {
  try {
    const valeur = evaluerExpressionGenerale(resoudreInverseTrig(texte), 0);
    if (!Number.isFinite(valeur)) return "parse_error";
    return Math.abs(valeur - cible) <= tolerance + MARGE ? "correct" : "not_equivalent";
  } catch {
    return "parse_error";
  }
}

export function diagnostiquerResolutionB3(omegaTexte: string, phiTexte: string, omega: number, phi: number, t1: number, t2: number): StatutVerification {
  return combiner2(diagnostiquerAvecTolerance(omegaTexte, omega, toleranceOmegaB3(t1, t2)), diagnostiquerPhiModuloDeuxPi(phiTexte, phi, tolerancePhiB3(t1, t2)));
}

// ============================================================================
// Branches à entier libre k (ou n) — RÉPLIQUÉ localement (la primitive de 5gen10 a une marge fixe
// ±0,01) avec des marges paramétrées. asin/acos/atan résolus avant évaluation (point 48 : l'exemple
// « asin(0,37) + 2*k*pi » du champ doit être accepté).
// ============================================================================

interface LigneBranche {
  f0: number;
  periode: number;
}

function evaluerLigneBranche(texte: string): LigneBranche | null {
  try {
    const expr = resoudreInverseTrig(texte);
    const f0 = evaluerExpressionGenerale(expr, 0, { k: 0, n: 0 });
    const f1 = evaluerExpressionGenerale(expr, 0, { k: 1, n: 1 });
    if (!Number.isFinite(f0) || !Number.isFinite(f1)) return null;
    return { f0, periode: f1 - f0 };
  } catch {
    return null;
  }
}

function correspondBranche(ligne: LigneBranche, branche: BrancheModelisation, toleranceConstante: number, tolerancePeriode: number): boolean {
  if (Math.abs(Math.abs(ligne.periode) - Math.abs(branche.periode)) > tolerancePeriode + MARGE) return false;
  const ecart = ligne.f0 - branche.constante;
  const kEntier = Math.round(ecart / branche.periode);
  return Math.abs(ecart - kEntier * branche.periode) <= toleranceConstante + MARGE;
}

export function diagnostiquerBranchesTolerance(lignes: string[], branches: BrancheModelisation[], toleranceConstante: number, tolerancePeriode: number): StatutVerification {
  const evaluations = lignes.map(evaluerLigneBranche);
  if (evaluations.some((e) => e === null)) return "parse_error";
  if (evaluations.length !== branches.length) return "not_equivalent";
  const restantes = [...branches];
  for (const ligne of evaluations as LigneBranche[]) {
    const index = restantes.findIndex((b) => correspondBranche(ligne, b, toleranceConstante, tolerancePeriode));
    if (index === -1) return "not_equivalent";
    restantes.splice(index, 1);
  }
  return "correct";
}

/** Solutions t dans la fenêtre : chaque cible t = c + n·p (c, p de sa branche) a sa propre marge
 * `toleranceSolution(ω, n)` ; ordre indifférent, une saisie par cible. */
export function diagnostiquerSolutionsTolerance(textes: string[], cibles: number[], branches: BrancheModelisation[], omega: number): StatutVerification {
  const valeurs: number[] = [];
  for (const texte of textes) {
    try {
      const v = evaluerExpressionGenerale(resoudreInverseTrig(texte), 0);
      if (!Number.isFinite(v)) return "parse_error";
      valeurs.push(v);
    } catch {
      return "parse_error";
    }
  }
  if (valeurs.length !== cibles.length) return "not_equivalent";
  const marge = (t: number) => {
    let nMin = Infinity;
    for (const b of branches) nMin = Math.min(nMin, Math.abs(Math.round((t - b.constante) / b.periode)));
    return toleranceSolution(omega, Number.isFinite(nMin) ? nMin : 0);
  };
  const restantes = [...cibles];
  for (const v of valeurs) {
    const index = restantes.findIndex((c) => Math.abs(c - v) <= marge(c) + MARGE);
    if (index === -1) return "not_equivalent";
    restantes.splice(index, 1);
  }
  return "correct";
}

// ============================================================================
// Système B3 — équation linéaire en (ω,φ). Même patron que
// `verificationProblemesContexte.ts::diagnostiquerEquationLineaireAB` (5gen5), RÉPLIQUÉ (fonction
// privée à son module d'origine), adapté aux 2 variables ω/φ.
// ============================================================================

/** "omega"/"phi" résolus NATIVEMENT via le paramètre `variables` de `evaluerExpressionGenerale` —
 * remplace l'ancienne pré-substitution textuelle par regex `\bomega\b`/`\bphi\b`, qui cassait
 * silencieusement toute saisie où la variable est collée à un coefficient ("3omega", "2phi" : `\b`
 * ne matche jamais entre un chiffre et une lettre), même bug que l'ancien traitement de "pi"
 * (promptauditparsingpisqrt.md). */
function variablesOmegaPhi(omega: number, phi: number): Record<string, number> {
  return { omega, phi };
}

const INVERSE_TRIG_MATH: Record<"asin" | "acos" | "atan", (x: number) => number> = { asin: Math.asin, acos: Math.acos, atan: Math.atan };
const DEBUT_APPEL_INVERSE_TRIG = /\b(asin|acos|atan)\s*\(/i;
const GARDE_APPELS_INVERSE_TRIG_MAX = 10;

interface AppelInverseTrigTrouve {
  debut: number;
  fin: number;
  fonction: "asin" | "acos" | "atan";
  interieur: string;
}

function trouverAppelInverseTrig(expr: string): AppelInverseTrigTrouve | null {
  const debutMatch = DEBUT_APPEL_INVERSE_TRIG.exec(expr);
  if (debutMatch === null) return null;
  const indexParenOuvrante = debutMatch.index + debutMatch[0].length - 1;
  let profondeur = 0;
  for (let i = indexParenOuvrante; i < expr.length; i++) {
    if (expr[i] === "(") profondeur++;
    else if (expr[i] === ")") {
      profondeur--;
      if (profondeur === 0) {
        return { debut: debutMatch.index, fin: i, fonction: debutMatch[1].toLowerCase() as "asin" | "acos" | "atan", interieur: expr.slice(indexParenOuvrante + 1, i) };
      }
    }
  }
  return null;
}

/** `evaluerExpressionGenerale` (moteur 4e, ne connaît que sqrt/abs/cbrt/sin/cos/tan) ignore
 * totalement asin/acos/atan — pourtant l'écran "systeme" (B3) invite explicitement l'élève à
 * écrire `asin((v−b)/A)` (voir le placeholder, `EtapeSysteme.tsx`) : sans ce pré-traitement,
 * toute réponse suivant littéralement cet exemple échouait en `parse_error` (bug trouvé par
 * Playwright, `prompt5gen8913conventionphiPhi.md`, jamais couvert par les tests unitaires
 * existants qui n'exerçaient `diagnostiquerSysteme` qu'avec un membre droit déjà numérique).
 * Résout ces appels EN AMONT de la substitution ω/φ — leur argument est toujours purement
 * numérique ici (jamais fonction de ω/φ), même patron que `trouverAppelTrig`/
 * `evaluerTrigRadiansEnT` plus bas dans ce fichier (résolution locale, pas de récursion). */
function resoudreInverseTrig(texte: string): string {
  let expr = texte;
  let garde = 0;
  let appel: AppelInverseTrigTrouve | null;
  while ((appel = trouverAppelInverseTrig(expr)) && garde < GARDE_APPELS_INVERSE_TRIG_MAX) {
    const valeurInterieure = evaluerExpressionGenerale(appel.interieur, 0);
    const valeur = INVERSE_TRIG_MATH[appel.fonction](valeurInterieure);
    expr = expr.slice(0, appel.debut) + `(${formatSansNotationScientifique(valeur)})` + expr.slice(appel.fin + 1);
    garde++;
  }
  return expr;
}

function evaluerExpressionOmegaPhi(texte: string, omega: number, phi: number): number {
  return evaluerExpressionGenerale(resoudreInverseTrig(texte), 0, variablesOmegaPhi(omega, phi));
}

/** Vérifie qu'une équation LIBRE en (ω,φ) (`gauche`/`droite`, textes séparés) représente la MÊME
 * relation que `ω·t + φ − alphaRef = 0` (le système linéarisé de B3, une équation par point
 * t₁/t₂) — extraction des coefficients par différences finies (3 échantillons), vérifie la
 * linéarité sur 2 points supplémentaires, compare à la référence à un facteur d'échelle près. */
export function diagnostiquerSysteme(gauche: string, droite: string, t: number, coeffPhiRef: number, alphaRef: number): StatutVerification {
  try {
    const diff = (omega: number, phi: number) => evaluerExpressionOmegaPhi(gauche, omega, phi) - evaluerExpressionOmegaPhi(droite, omega, phi);
    const c0 = diff(0, 0);
    const coeffOmega = diff(1, 0) - c0;
    const coeffPhi = diff(0, 1) - c0;
    if (![c0, coeffOmega, coeffPhi].every(Number.isFinite)) return "parse_error";
    for (const [o, p] of [
      [2, 3],
      [-1, 4],
    ] as const) {
      const predit = coeffOmega * o + coeffPhi * p + c0;
      const reel = diff(o, p);
      if (!Number.isFinite(reel)) return "parse_error";
      if (Math.abs(predit - reel) > 1e-4) return "not_equivalent";
    }
    const coeffOmegaRef = t;
    const constanteRef = -alphaRef;
    const k = coeffPhi / coeffPhiRef;
    if (!Number.isFinite(k) || Math.abs(k) < 1e-9) return "not_equivalent";
    const memeCoeffOmega = Math.abs(coeffOmega - k * coeffOmegaRef) < 1e-3 * Math.max(1, Math.abs(k));
    // α arrondi au centième accepté (point 49) : ±0,0055 sur la constante, à l'échelle k près.
    const memeConstante = Math.abs(c0 - k * constanteRef) <= (TOLERANCE_U + MARGE) * Math.max(1, Math.abs(k));
    return memeCoeffOmega && memeConstante ? "correct" : "not_equivalent";
  } catch {
    return "parse_error";
  }
}

// ============================================================================
// f(t) finale — dispatch symbolique (B1) vs numérique (B2/B3/donnée).
//
// `evaluerExpressionGenerale` interprète ses PROPRES sin/cos/tan en DEGRÉS (convention exclusive du
// chapitre 3 de la 4e) — incompatible ici, où l'argument ω·t+φ est en RADIANS. Réplique le motif
// `evaluerTrigRadians`/`trouverAppelTrig` (`verificationEquationTrig.ts`, 5gen10 — fonctions
// PRIVÉES à leur module d'origine, jamais importées) : substitue d'abord "t" par sa valeur
// numérique PARTOUT ("pi" est reconnu nativement par `evaluerExpressionGenerale`, audit
// promptauditparsingpisqrt.md), puis résout chaque appel sin(...)/cos(...)/tan(...) via Math.sin/cos/tan
// directement (imbrication de parenthèses ARBITRAIRE dans l'argument), le reste de l'expression
// restant délégué à `evaluerExpressionGenerale` pour l'arithmétique pure.
// ============================================================================

const TRIG_MATH: Record<"sin" | "cos" | "tan", (x: number) => number> = { sin: Math.sin, cos: Math.cos, tan: Math.tan };
const DEBUT_APPEL_TRIG = /\b(sin|cos|tan)\s*\(/i;
const GARDE_APPELS_TRIG_MAX = 10;

interface AppelTrigTrouve {
  debut: number;
  fin: number;
  fonction: "sin" | "cos" | "tan";
  interieur: string;
}

function trouverAppelTrig(expr: string): AppelTrigTrouve | null {
  const debutMatch = DEBUT_APPEL_TRIG.exec(expr);
  if (debutMatch === null) return null;
  const indexParenOuvrante = debutMatch.index + debutMatch[0].length - 1;
  let profondeur = 0;
  for (let i = indexParenOuvrante; i < expr.length; i++) {
    if (expr[i] === "(") profondeur++;
    else if (expr[i] === ")") {
      profondeur--;
      if (profondeur === 0) {
        return { debut: debutMatch.index, fin: i, fonction: debutMatch[1].toLowerCase() as "sin" | "cos" | "tan", interieur: expr.slice(indexParenOuvrante + 1, i) };
      }
    }
  }
  return null;
}

/** "t" résolu NATIVEMENT via le paramètre `variables` de `evaluerExpressionGenerale` (`variables
 * Extra` permet en plus à `diagnostiquerFonctionFinaleSymbolique` d'y injecter `{ phi: 0 }`, plutôt
 * que de neutraliser "phi" par une 2e pré-substitution textuelle) — remplace l'ancien
 * `texte.replace(/\bt\b/gi, ...)`, qui cassait silencieusement toute saisie où la variable est
 * collée à un coefficient ("3t" : `\b` ne matche jamais entre un chiffre et une lettre), même bug
 * que l'ancien traitement de "pi" (promptauditparsingpisqrt.md). */
function evaluerTrigRadiansEnT(texte: string, tValeur: number, variablesExtra: Record<string, number> = {}): number {
  const variables = { t: tValeur, ...variablesExtra };
  let expr = texte;
  let garde = 0;
  let appel: AppelTrigTrouve | null;
  while ((appel = trouverAppelTrig(expr)) && garde < GARDE_APPELS_TRIG_MAX) {
    const valeurInterieure = evaluerExpressionGenerale(appel.interieur, 0, variables);
    const valeur = TRIG_MATH[appel.fonction](valeurInterieure);
    expr = expr.slice(0, appel.debut) + `(${formatSansNotationScientifique(valeur)})` + expr.slice(appel.fin + 1);
    garde++;
  }
  return evaluerExpressionGenerale(expr, 0, variables);
}

/** Marge en t de l'équivalence f(t) : ω et φ recopiés à 4–5 décimales (ou ω au millième, comme
 * demandé à l'écran « pulsation ») — |Δf| ≤ |A|·(|Δω|·|t| + |Δφ|), avec |Δω|, |Δφ| ≤ 0,0006. */
function margeFonction(A: number, t: number): number {
  return 0.002 + Math.abs(A) * 0.0006 * (Math.abs(t) + 1);
}

function diagnostiquerEquivalenceEnT(texte: string, cible: (t: number) => number, A: number, variablesExtra: Record<string, number> = {}): StatutVerification {
  try {
    for (const t of [1, 2.37, -1.5, 5.1]) {
      const valeur = evaluerTrigRadiansEnT(texte, t, variablesExtra);
      if (!Number.isFinite(valeur)) return "parse_error";
      if (Math.abs(valeur - cible(t)) > margeFonction(A, t)) return "not_equivalent";
    }
    return "correct";
  } catch {
    return "parse_error";
  }
}

/** Technique B1 — φ doit rester SYMBOLIQUE (piège central) : exige un token "phi"/"φ" littéral,
 * puis vérifie A/ω/b en résolvant ce token à 0 (neutre pour une somme, via `variablesExtra`) avant
 * équivalence — "φ" (lettre grecque unicode) normalisé en "phi" (substitution caractère à caractère,
 * jamais sensible à un mot voisin, donc jamais concernée par le bug `\b` ci-dessus) pour que le
 * tokeniseur la reconnaisse. */
export function diagnostiquerFonctionFinaleSymbolique(texte: string, A: number, omega: number, b: number): StatutVerification {
  const contientPhiSymbolique = /\bphi\b/i.test(texte) || texte.includes("φ");
  if (!contientPhiSymbolique) return "not_equivalent";
  const normalise = texte.replace(/φ/g, "phi");
  return diagnostiquerEquivalenceEnT(normalise, (t) => A * Math.sin(omega * t) + b, A, { phi: 0 });
}

/** Techniques B2/B3/donnée — φ NUMÉRIQUEMENT connu, équivalence algébrique complète. */
export function diagnostiquerFonctionFinaleNumerique(texte: string, A: number, omega: number, phi: number, b: number): StatutVerification {
  return diagnostiquerEquivalenceEnT(texte, (t) => A * Math.sin(omega * t + phi) + b, A);
}

export function diagnostiquerFonctionFinale(donnees: DonneesPhase1, texte: string): StatutVerification {
  const { A, omega, phi, b } = donnees.fonction;
  if (donnees.technique === "b1") return diagnostiquerFonctionFinaleSymbolique(texte, A, omega, b);
  return diagnostiquerFonctionFinaleNumerique(texte, A, omega, phi as number, b);
}

// ============================================================================
// Phase 2 — Type "resoudre".
// ============================================================================

export interface ReponseArgumentResoudre {
  aucuneSolution: boolean;
  lignes: string[];
}

export function diagnostiquerArgumentResoudre(question: QuestionResoudre, reponse: ReponseArgumentResoudre): StatutVerification {
  if (reponse.aucuneSolution) return question.aucuneSolution ? "correct" : "not_equivalent";
  if (question.aucuneSolution) return "not_equivalent";
  return diagnostiquerBranchesTolerance(reponse.lignes, question.branchesU, TOLERANCE_U + ARRONDI_CENTIEME, ARRONDI_CENTIEME);
}

export function diagnostiquerIsolerTResoudre(question: QuestionResoudre, lignes: string[], omega: number): StatutVerification {
  return diagnostiquerBranchesTolerance(lignes, question.branchesT, toleranceT(omega), toleranceT(omega));
}

export function diagnostiquerSolutionsResoudre(question: QuestionResoudre, textes: string[], omega: number): StatutVerification {
  return diagnostiquerSolutionsTolerance(textes, question.solutions, question.branchesT, omega);
}

// ============================================================================
// Phase 2 — Type "extremum".
// ============================================================================

export function diagnostiquerPoserExtremum(question: QuestionExtremum, texte: string): StatutVerification {
  return diagnostiquerBranchesTolerance([texte], [question.brancheU], TOLERANCE_U + ARRONDI_CENTIEME, ARRONDI_CENTIEME);
}

export function diagnostiquerIsolerTExtremum(question: QuestionExtremum, texte: string, omega: number): StatutVerification {
  return diagnostiquerBranchesTolerance([texte], [question.brancheT], toleranceT(omega), toleranceT(omega));
}

export function diagnostiquerSolutionsExtremum(question: QuestionExtremum, textes: string[], omega: number): StatutVerification {
  return diagnostiquerSolutionsTolerance(textes, question.solutions, [question.brancheT], omega);
}

// ============================================================================
// Phase 2 — Type "inequation".
// ============================================================================

/** « ≥ », « ≤ » (et leurs variantes) écrits comme à l'écran ⇒ « >= », « <= » (point 58). */
function normaliserComparateurs(texte: string): string {
  return texte.replace(/[≥⩾]/g, ">=").replace(/[≤⩽]/g, "<=");
}

/** Écran 1 — isoler sin(ωt+φ)◇m. Cas spécial (|m|>1) : comparaison textuelle directe du choix.
 * Cas général : extrait le symbole de comparaison (>=/<=/>/<) et la valeur du membre droit —
 * NE VÉRIFIE PAS la structure exacte du membre gauche (au-delà de la présence de "sin("). */
export function diagnostiquerIsolerSinInequation(texteBrut: string, casSpecialCible: "toujoursVrai" | "toujoursFaux" | null, sens: "ge" | "le", m: number): StatutVerification {
  if (casSpecialCible !== null) {
    return texteBrut.trim() === casSpecialCible ? "correct" : "not_equivalent";
  }
  const texte = normaliserComparateurs(texteBrut);
  const match = texte.match(/(>=|<=|>|<)/);
  if (!match) return "parse_error";
  const symbole = match[0];
  const [gauche, droite] = texte.split(symbole);
  if (!/sin\s*\(/.test(gauche)) return "parse_error";
  try {
    const valeur = evaluerExpressionGenerale(resoudreInverseTrig(droite), 0);
    if (!Number.isFinite(valeur)) return "parse_error";
    if (Math.abs(valeur - m) > ARRONDI_CENTIEME + MARGE) return "not_equivalent";
    const sensSoumis = symbole.startsWith(">") ? "ge" : "le";
    return sensSoumis === sens ? "correct" : "not_equivalent";
  } catch {
    return "parse_error";
  }
}

function valeurOuErreur(texte: string): number | "parse_error" {
  try {
    const v = evaluerExpressionGenerale(resoudreInverseTrig(texte), 0);
    return Number.isFinite(v) ? v : "parse_error";
  } catch {
    return "parse_error";
  }
}

/** Deux bornes comparées MODULO `periode` (même décalage pour les deux : c'est le même arc), avec
 * une marge par borne (point 50 : [−π−arcsin m ; arcsin m] et [π−arcsin m ; 2π+arcsin m] décrivent le
 * même ensemble). */
function diagnostiquerBornesModulo(infTexte: string, supTexte: string, infRef: number, supRef: number, periode: number, tolerance: number): StatutVerification {
  const inf = valeurOuErreur(infTexte);
  const sup = valeurOuErreur(supTexte);
  if (inf === "parse_error" || sup === "parse_error") return "parse_error";
  const j = Math.round((inf - infRef) / periode);
  const ok = Math.abs(inf - (infRef + j * periode)) <= tolerance + MARGE && Math.abs(sup - (supRef + j * periode)) <= tolerance + MARGE;
  return ok ? "correct" : "not_equivalent";
}

export function diagnostiquerResoudreUInequation(question: QuestionInequation, infTexte: string, supTexte: string): StatutVerification {
  return diagnostiquerBornesModulo(infTexte, supTexte, question.borneInfU, question.borneSupU, 2 * Math.PI, TOLERANCE_U + ARRONDI_CENTIEME);
}

export function diagnostiquerIsolerTInequation(question: QuestionInequation, infTexte: string, supTexte: string, omega: number): StatutVerification {
  return diagnostiquerBornesModulo(infTexte, supTexte, question.borneInfT, question.borneSupT, (2 * Math.PI) / Math.abs(omega), toleranceT(omega));
}

/** Écran 4 — équivalence d'ENSEMBLES d'intervalles, ordre indifférent (add-as-needed). Une borne
 * égale à 0 ou à la fenêtre (intervalle coupé) se lit directement (±0,01) ; une autre borne vaut
 * borne_t + n·(2π/ω) et reçoit la marge propagée correspondante. */
export function diagnostiquerListerIntervalles(paires: [string, string][], question: QuestionInequation, omega: number): StatutVerification {
  const cible = question.intervalles;
  if (paires.length !== cible.length) return "not_equivalent";
  const valeurs: IntervalleModelisation[] = [];
  for (const [infTexte, supTexte] of paires) {
    const inf = valeurOuErreur(infTexte);
    const sup = valeurOuErreur(supTexte);
    if (inf === "parse_error" || sup === "parse_error") return "parse_error";
    valeurs.push({ inf, sup });
  }
  const periode = (2 * Math.PI) / Math.abs(omega);
  const marge = (borne: number, base: number) =>
    Math.abs(borne) < 1e-9 || Math.abs(borne - question.fenetre) < 1e-9 ? 2 * ARRONDI_CENTIEME : toleranceSolution(omega, Math.round((borne - base) / periode));
  const restantes = [...cible];
  for (const v of valeurs) {
    const index = restantes.findIndex(
      (c) => Math.abs(c.inf - v.inf) <= marge(c.inf, question.borneInfT) + MARGE && Math.abs(c.sup - v.sup) <= marge(c.sup, question.borneSupT) + MARGE,
    );
    if (index === -1) return "not_equivalent";
    restantes.splice(index, 1);
  }
  return "correct";
}
