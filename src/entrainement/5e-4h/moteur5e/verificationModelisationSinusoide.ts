/**
 * Couche B (5e) — vérification pour 5gen13 ("Modéliser une fonction sinusoïdale en contexte").
 * N'importe jamais rien de `src/generateurs5e/`.
 *
 * Réutilise DIRECTEMENT (moteur→moteur, déjà établi ailleurs sur la plateforme) :
 * - `diagnostiquerValeurArcSecteur` (`verificationArcsSecteurs.ts`, 5gen6, tolérance serrée ±0.01) —
 *   pour tout champ "nombre simple" (A, b, vitesses, bornes en u/t...).
 * - `diagnostiquerBranches`/`diagnostiquerEnsembleNumerique` (`verificationEquationTrig.ts`, 5gen10)
 *   — pour les écrans Phase 2 "resoudre"/"extremum", exactement le même format `{constante,periode}`
 *   que 5gen10/5gen11, ici toujours en régime "decimal" (`exact:null`, ce générateur ne travaille
 *   jamais avec des multiples exacts de π).
 *
 * RÉPLIQUE localement (jamais importée, ces fonctions sont PRIVÉES à leur module d'origine) :
 * - `diagnostiquerSysteme` — même patron que
 *   `verificationProblemesContexte.ts::diagnostiquerEquationLineaireAB` (5gen5), adapté aux 2
 *   variables nommées `omega`/`phi` plutôt que `a`/`b`.
 */
import type { DonneesPhase1, IntervalleModelisation, QuestionExtremum, QuestionInequation, QuestionResoudre } from "../core5e/modelisationSinusoide.types";
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerValeurArcSecteur } from "./verificationArcsSecteurs";
import { diagnostiquerBranches, diagnostiquerEnsembleNumerique } from "./verificationEquationTrig";
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

export function diagnostiquerPhiModuloDeuxPi(texte: string, cible: number): StatutVerification {
  try {
    const valeur = evaluerExpressionGenerale(texte, 0);
    if (!Number.isFinite(valeur)) return "parse_error";
    const ecart = valeur - cible;
    const kEntier = Math.round(ecart / (2 * Math.PI));
    return Math.abs(ecart - kEntier * 2 * Math.PI) <= 0.01 ? "correct" : "not_equivalent";
  } catch {
    return "parse_error";
  }
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
    const memeCoeffOmega = Math.abs(coeffOmega - k * coeffOmegaRef) < 1e-3;
    const memeConstante = Math.abs(c0 - k * constanteRef) < 1e-3;
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

function diagnostiquerEquivalenceEnT(texte: string, cible: (t: number) => number, variablesExtra: Record<string, number> = {}): StatutVerification {
  try {
    for (const t of [1, 2.37, -1.5, 5.1]) {
      const valeur = evaluerTrigRadiansEnT(texte, t, variablesExtra);
      if (!Number.isFinite(valeur)) return "parse_error";
      if (Math.abs(valeur - cible(t)) > 1e-3) return "not_equivalent";
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
  return diagnostiquerEquivalenceEnT(normalise, (t) => A * Math.sin(omega * t) + b, { phi: 0 });
}

/** Techniques B2/B3/donnée — φ NUMÉRIQUEMENT connu, équivalence algébrique complète. */
export function diagnostiquerFonctionFinaleNumerique(texte: string, A: number, omega: number, phi: number, b: number): StatutVerification {
  return diagnostiquerEquivalenceEnT(texte, (t) => A * Math.sin(omega * t + phi) + b);
}

export function diagnostiquerFonctionFinale(donnees: DonneesPhase1, texte: string): StatutVerification {
  const { A, omega, phi, b } = donnees.fonction;
  if (donnees.technique === "b1") return diagnostiquerFonctionFinaleSymbolique(texte, A, omega, b);
  return diagnostiquerFonctionFinaleNumerique(texte, A, omega, phi as number, b);
}

// ============================================================================
// Phase 2 — Type "resoudre" (réutilise diagnostiquerBranches/diagnostiquerEnsembleNumerique).
// ============================================================================

function versValeur(v: number) {
  return { exact: null, decimal: v };
}

export interface ReponseArgumentResoudre {
  aucuneSolution: boolean;
  lignes: string[];
}

export function diagnostiquerArgumentResoudre(question: QuestionResoudre, reponse: ReponseArgumentResoudre): StatutVerification {
  if (reponse.aucuneSolution) return question.aucuneSolution ? "correct" : "not_equivalent";
  if (question.aucuneSolution) return "not_equivalent";
  return diagnostiquerBranches(
    reponse.lignes,
    question.branchesU.map((br) => ({ constante: versValeur(br.constante), periode: versValeur(br.periode) })),
  );
}

export function diagnostiquerIsolerTResoudre(question: QuestionResoudre, lignes: string[]): StatutVerification {
  return diagnostiquerBranches(
    lignes,
    question.branchesT.map((br) => ({ constante: versValeur(br.constante), periode: versValeur(br.periode) })),
  );
}

export function diagnostiquerSolutionsResoudre(question: QuestionResoudre, textes: string[]): StatutVerification {
  return diagnostiquerEnsembleNumerique(textes, question.solutions);
}

// ============================================================================
// Phase 2 — Type "extremum" (réutilise le même mécanisme que 5gen11).
// ============================================================================

export function diagnostiquerPoserExtremum(question: QuestionExtremum, texte: string): StatutVerification {
  return diagnostiquerBranches([texte], [{ constante: versValeur(question.brancheU.constante), periode: versValeur(question.brancheU.periode) }]);
}

export function diagnostiquerIsolerTExtremum(question: QuestionExtremum, texte: string): StatutVerification {
  return diagnostiquerBranches([texte], [{ constante: versValeur(question.brancheT.constante), periode: versValeur(question.brancheT.periode) }]);
}

export function diagnostiquerSolutionsExtremum(question: QuestionExtremum, textes: string[]): StatutVerification {
  return diagnostiquerEnsembleNumerique(textes, question.solutions);
}

// ============================================================================
// Phase 2 — Type "inequation" (technique NOUVELLE sur la plateforme).
// ============================================================================

/** Écran 1 — isoler sin(ωt+φ)◇m. Cas spécial (|m|>1) : comparaison textuelle directe du choix.
 * Cas général : extrait le symbole de comparaison (>=/<=/>/<) et la valeur du membre droit —
 * NE VÉRIFIE PAS la structure exacte du membre gauche (au-delà de la présence de "sin("),
 * simplification assumée documentée dans CLAUDE.md. */
export function diagnostiquerIsolerSinInequation(texte: string, casSpecialCible: "toujoursVrai" | "toujoursFaux" | null, sens: "ge" | "le", m: number): StatutVerification {
  if (casSpecialCible !== null) {
    return texte.trim() === casSpecialCible ? "correct" : "not_equivalent";
  }
  const match = texte.match(/(>=|<=|>|<)/);
  if (!match) return "parse_error";
  const symbole = match[0];
  const [gauche, droite] = texte.split(symbole);
  if (!/sin\s*\(/.test(gauche)) return "parse_error";
  try {
    const valeur = evaluerExpressionGenerale(droite, 0);
    if (!Number.isFinite(valeur)) return "parse_error";
    if (Math.abs(valeur - m) > 0.01) return "not_equivalent";
    const sensSoumis = symbole.startsWith(">") ? "ge" : "le";
    return sensSoumis === sens ? "correct" : "not_equivalent";
  } catch {
    return "parse_error";
  }
}

export function diagnostiquerResoudreUInequation(question: QuestionInequation, infTexte: string, supTexte: string): StatutVerification {
  return combiner2(diagnostiquerNombre(infTexte, question.borneInfU), diagnostiquerNombre(supTexte, question.borneSupU));
}

export function diagnostiquerIsolerTInequation(question: QuestionInequation, infTexte: string, supTexte: string): StatutVerification {
  return combiner2(diagnostiquerNombre(infTexte, question.borneInfT), diagnostiquerNombre(supTexte, question.borneSupT));
}

/** Écran 4 — équivalence d'ENSEMBLES d'intervalles, ordre indifférent (add-as-needed). */
export function diagnostiquerListerIntervalles(paires: [string, string][], cible: IntervalleModelisation[]): StatutVerification {
  if (paires.length !== cible.length) return "not_equivalent";
  const valeurs: IntervalleModelisation[] = [];
  for (const [infTexte, supTexte] of paires) {
    try {
      const inf = evaluerExpressionGenerale(infTexte, 0);
      const sup = evaluerExpressionGenerale(supTexte, 0);
      if (!Number.isFinite(inf) || !Number.isFinite(sup)) return "parse_error";
      valeurs.push({ inf, sup });
    } catch {
      return "parse_error";
    }
  }
  const restantes = [...cible];
  for (const v of valeurs) {
    const index = restantes.findIndex((c) => Math.abs(c.inf - v.inf) <= 0.01 && Math.abs(c.sup - v.sup) <= 0.01);
    if (index === -1) return "not_equivalent";
    restantes.splice(index, 1);
  }
  return "correct";
}
