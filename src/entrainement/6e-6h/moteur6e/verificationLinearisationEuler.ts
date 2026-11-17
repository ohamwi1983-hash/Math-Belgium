import { coefficientsProduit, enSinus, evaluerExpressionInitiale, evaluerLineaire, evaluerPrimitive, facteurK, formeLineaire, integraleExacte, primitive, puissances, termesRegroupes, valeur, valeurExacte } from "../core6e/linearisationEuler";
import type { ExerciceLinearisation, TermeLineaire, TermePrimitive } from "../core6e/linearisationEuler";
import type { StatutVerification } from "../moteur/statutVerification";
import { evaluerValeurComplexe } from "./expressionComplexe";
import type { Complexe } from "./expressionComplexe";
import { evaluerExpressionExponentielle, evaluerValeurExponentielle } from "./expressionExponentielle";
import type { PhaseLinearisation } from "./typesLinearisationEuler";
import { normaliserSaisieMoivre } from "./verificationFormuleMoivre";

/**
 * Couche B (6e) — vérification de `6gen93` « Linéariser avec les formules d'Euler ». Toutes les
 * valeurs attendues viennent de `core6e/linearisationEuler.ts` (source unique).
 *
 * - `euler` : K, nombre complexe exact (analyseur du chapitre, `expressionComplexe.ts` : « -i/8 »,
 *   « 1/(8i) », « -0,0625 » acceptés) ; une puissance non calculée (« ^ ») est refusée SANS
 *   tentative : calculer (2i)ᑫ est justement le travail de l'écran.
 * - `developper` : coefficients entiers, égalité exacte, champ par champ.
 * - `regrouper` : coefficients de cos(kx) (réels) ou de sin(kx) (imaginaires purs, « 2i », « -6i »).
 * - `lineaire` : expression libre en x, comparée par ÉQUIVALENCE NUMÉRIQUE en six points ; une
 *   expression égale mais encore non linéarisée (puissance ou produit de cos/sin, recopie de
 *   l'énoncé) est refusée SANS tentative — test de linéarité : chaque cos(…)/sin(…) est multiplié
 *   par un paramètre λ, l'expression doit être affine en λ.
 * - `primitive` : égalité à une constante près (différences G(x) − G(x₀)) ; « + C » final toléré.
 * - `integrale` : valeur EXACTE (π, √, fractions) ; un décimal qui n'en est qu'un arrondi est
 *   refusé SANS tentative, avec un message qui demande la valeur exacte.
 */

const POINTS_X = [-2.1, -0.7, 0.3, 1.1, 1.9, 2.7];
const X0 = 0.37;
const TOLERANCE = 1e-6;

// ============================================================================
// Lecture des saisies.
// ============================================================================

/** « cos 3x » → « cos(3x) », « cosx » → « cos(x) » (après la réécriture des puissances de 6gen38). */
export function normaliserExpression(texte: string): string {
  return normaliserSaisieMoivre(texte.replace(/[−–—]/g, "-")).replace(/(cos|sin)\s*(\d*)\s*\*?\s*x(?![a-z(])/g, (_m, f: string, k: string) => `${f}(${k}x)`);
}

/** Retire un « + C » (ou « + k ») final : la constante d'intégration est permise. */
function sansConstante(texte: string): string {
  return texte.replace(/\+\s*[Ckc]\s*$/, "");
}

function evaluerEn(texte: string, x: number, lam?: number): number | "illisible" {
  try {
    return evaluerExpressionExponentielle(texte, lam === undefined ? { x } : { x, lam });
  } catch {
    return "illisible";
  }
}

function lireComplexe(texte: string): Complexe | null {
  if (texte.trim() === "") return null;
  const z = evaluerValeurComplexe(texte.replace(/[−–—]/g, "-"));
  return z && Number.isFinite(z.re) && Number.isFinite(z.im) ? z : null;
}

function lireReel(texte: string): number | null {
  if (texte.trim() === "") return null;
  return evaluerValeurExponentielle(texte.replace(/[−–—]/g, "-"));
}

/** Expression lisible (syntaxe correcte en x) ? */
function expressionLisible(texte: string): boolean {
  return POINTS_X.some((x) => typeof evaluerEn(texte, x) === "number");
}

/** Chaque cos(…)/sin(…) multiplié par λ : « (lam*cos(…)) ». */
function avecLambda(texte: string): string {
  let sortie = "";
  let i = 0;
  const motif = /(cos|sin)\s*\(/g;
  let m: RegExpExecArray | null;
  while ((m = motif.exec(texte)) !== null) {
    const ouvrante = motif.lastIndex - 1;
    let profondeur = 0;
    let fermante = -1;
    for (let j = ouvrante; j < texte.length; j++) {
      if (texte[j] === "(") profondeur++;
      else if (texte[j] === ")") {
        profondeur--;
        if (profondeur === 0) {
          fermante = j;
          break;
        }
      }
    }
    if (fermante === -1) return texte;
    sortie += `${texte.slice(i, m.index)}(lam*${texte.slice(m.index, fermante + 1)})`;
    i = fermante + 1;
    motif.lastIndex = i;
  }
  return sortie + texte.slice(i);
}

/** Vrai si l'expression n'est PAS une combinaison linéaire de cos(…)/sin(…) (puissance, produit, quotient). */
export function nonLineaire(texteNormalise: string): boolean {
  const t = avecLambda(texteNormalise);
  return POINTS_X.some((x) => {
    const [a, b, c] = [1, 2, 3].map((lam) => evaluerEn(t, x, lam));
    if (typeof a !== "number" || typeof b !== "number" || typeof c !== "number") return false;
    return Math.abs(c - 2 * b + a) > 1e-6;
  });
}

function equivalente(texte: string, reference: (x: number) => number): StatutVerification {
  for (const x of POINTS_X) {
    const v = evaluerEn(texte, x);
    if (v === "illisible") return "parse_error";
    if (!Number.isFinite(v) || Math.abs(v - reference(x)) > TOLERANCE) return "not_equivalent";
  }
  return "correct";
}

function equivalenteAConstantePres(texte: string, reference: (x: number) => number): StatutVerification {
  const g0 = evaluerEn(texte, X0);
  if (g0 === "illisible") return "parse_error";
  const r0 = reference(X0);
  for (const x of POINTS_X) {
    const v = evaluerEn(texte, x);
    if (v === "illisible") return "parse_error";
    if (!Number.isFinite(v) || !Number.isFinite(g0) || Math.abs(v - g0 - (reference(x) - r0)) > TOLERANCE) return "not_equivalent";
  }
  return "correct";
}

/** Écriture décimale pure (« 0,79 », « -1.5 ») : une valeur exacte ne s'écrit ainsi que si elle est décimale. */
function estDecimal(texte: string): boolean {
  return /^\s*[+-]?\s*\d+(?:[.,]\d+)?\s*$/.test(texte.replace(/[−–—]/g, "-"));
}

// ============================================================================
// Valeurs attendues, champ par champ.
// ============================================================================

export function nombreChamps(e: ExerciceLinearisation, phase: PhaseLinearisation): number {
  if (phase === "developper") return puissances(e).n + 1;
  if (phase === "regrouper") return termesRegroupes(e).length;
  return 1;
}

function K(e: ExerciceLinearisation): Complexe {
  const k = facteurK(e);
  return { re: valeur(k.re), im: valeur(k.im) };
}

function procheComplexe(z: Complexe, re: number, im: number, tol = 1e-9): boolean {
  return Math.abs(z.re - re) <= tol && Math.abs(z.im - im) <= tol;
}

function fonctionLineaire(e: ExerciceLinearisation): (x: number) => number {
  const termes = formeLineaire(e);
  return (x) => evaluerLineaire(termes, x);
}

function fonctionPrimitive(e: ExerciceLinearisation): (x: number) => number {
  const termes = primitive(e);
  return (x) => evaluerPrimitive(termes, x);
}

/** Statut champ par champ. */
export function diagnostiquerChamps(e: ExerciceLinearisation, phase: PhaseLinearisation, valeurs: string[]): StatutVerification[] {
  switch (phase) {
    case "euler": {
      const z = lireComplexe(valeurs[0] ?? "");
      if (!z) return ["parse_error"];
      const k = K(e);
      return [procheComplexe(z, k.re, k.im) ? "correct" : "not_equivalent"];
    }
    case "developper":
      return coefficientsProduit(e).map((t, i) => {
        const v = lireReel(valeurs[i] ?? "");
        if (v === null) return "parse_error";
        return Math.abs(v - t.c) < 1e-9 ? "correct" : "not_equivalent";
      });
    case "regrouper": {
      const sinus = enSinus(e);
      return termesRegroupes(e).map((t, i) => {
        const z = lireComplexe(valeurs[i] ?? "");
        if (!z) return "parse_error";
        const attendu = t.k > 0 && sinus ? { re: 0, im: t.coef } : { re: t.coef, im: 0 };
        return procheComplexe(z, attendu.re, attendu.im) ? "correct" : "not_equivalent";
      });
    }
    case "lineaire":
      return [equivalente(normaliserExpression(valeurs[0] ?? ""), fonctionLineaire(e))];
    case "primitive":
      return [equivalenteAConstantePres(sansConstante(normaliserExpression(valeurs[0] ?? "")), fonctionPrimitive(e))];
    case "integrale": {
      const v = lireReel(valeurs[0] ?? "");
      if (v === null) return ["parse_error"];
      return [Math.abs(v - valeurExacte(integraleExacte(e))) < 1e-7 ? "correct" : "not_equivalent"];
    }
  }
}

export function diagnostiquerEcran(e: ExerciceLinearisation, phase: PhaseLinearisation, valeurs: string[]): StatutVerification {
  const statuts = diagnostiquerChamps(e, phase, valeurs);
  if (statuts.includes("parse_error")) return "parse_error";
  return statuts.every((s) => s === "correct") ? "correct" : "not_equivalent";
}

export function verifierEcran(e: ExerciceLinearisation, phase: PhaseLinearisation, valeurs: string[]): boolean {
  return diagnostiquerEcran(e, phase, valeurs) === "correct";
}

// ============================================================================
// Contrôle AVANT soumission — aucun de ces messages ne consomme de tentative.
// ============================================================================

const SANS_TENTATIVE = " Cette saisie ne compte pas comme une tentative.";

function messageIllisible(phase: PhaseLinearisation): string {
  switch (phase) {
    case "euler":
      return "Saisie non reconnue — écris un nombre complexe comme -3i/4 ou 1/2 (i pour l'unité imaginaire, fraction acceptée)." + SANS_TENTATIVE;
    case "developper":
      return "Saisie non reconnue — écris un nombre entier dans chaque case (0 si la puissance n'apparaît pas)." + SANS_TENTATIVE;
    case "regrouper":
      return "Saisie non reconnue — écris un nombre dans chaque case, avec i s'il le faut (par exemple 4, -2 ou 6i)." + SANS_TENTATIVE;
    case "lineaire":
    case "primitive":
      return "Expression non reconnue — écris par exemple 3cos(2x)/4 - sin(x)/2 + 1/8 (cos et sin avec parenthèses, sans i ni exponentielle)." + SANS_TENTATIVE;
    case "integrale":
      return "Saisie non reconnue — écris une valeur exacte, par exemple 3pi/16 + sqrt(3)/8 (π et √ acceptés)." + SANS_TENTATIVE;
  }
}

/** Message qui ARRÊTE la soumission (saisie illisible ou pas encore sous la forme demandée), `null` sinon. */
export function controleAvantSoumission(e: ExerciceLinearisation, phase: PhaseLinearisation, valeurs: string[]): string | null {
  if (diagnostiquerChamps(e, phase, valeurs).includes("parse_error")) {
    if ((phase === "lineaire" || phase === "primitive") && /(^|[^a-z])i([^a-z]|$)|e\s*\^/.test(valeurs[0] ?? "")) {
      return "La réponse s'écrit avec des cos et des sin, sans i ni exponentielle : regroupe d'abord les termes deux à deux." + SANS_TENTATIVE;
    }
    return messageIllisible(phase);
  }
  if (phase === "euler" && /\^|[²³⁴]/.test(valeurs[0] ?? "")) {
    return "Calcule la puissance : K doit être un nombre simplifié, sans « ^ » (pense à i² = −1)." + SANS_TENTATIVE;
  }
  if (phase === "lineaire") {
    const t = normaliserExpression(valeurs[0] ?? "");
    if (expressionLisible(t) && nonLineaire(t)) {
      return "Ce n'est pas encore une forme linéarisée : il ne doit rester ni puissance ni produit de cos et de sin, seulement des termes comme a·cos(kx), b·sin(kx) et une constante." + SANS_TENTATIVE;
    }
  }
  if (phase === "integrale") {
    const v = lireReel(valeurs[0] ?? "");
    const I = valeurExacte(integraleExacte(e));
    if (v !== null && estDecimal(valeurs[0] ?? "") && Math.abs(v - I) >= 1e-7 && Math.abs(v - I) <= 0.01 * Math.max(1, Math.abs(I))) {
      return "Cette valeur n'est qu'un arrondi : donne la valeur EXACTE (avec π, √ ou des fractions)." + SANS_TENTATIVE;
    }
  }
  return null;
}

// ============================================================================
// Pièges reconnus (jamais la valeur attendue).
// ============================================================================

function proportionnelle(texte: string, reference: (x: number) => number, facteur: number): boolean {
  return equivalente(texte, (x) => facteur * reference(x)) === "correct";
}

function piegeEuler(e: ExerciceLinearisation, z: Complexe): string | null {
  const { p, q, n } = puissances(e);
  const k = K(e);
  const module = Math.hypot(z.re, z.im);
  if (procheComplexe(z, -k.re, -k.im)) return "Le signe de K est faux : calcule les puissances de i une par une (i² = −1, i³ = −i, i⁴ = 1).";
  if (q > 0 && procheComplexe(z, 1 / 2 ** n, 0)) return "Le dénominateur de sin x est 2i, pas 2 : le facteur i ne disparaît pas.";
  if (q > 1 && Math.abs(module - 1 / (2 ** (p + 1))) < 1e-9) return "Dans (2i)ᑫ, le 2 est lui aussi élevé à la puissance : (2i)ᑫ = 2ᑫ · iᑫ.";
  if (Math.abs(module - 2 ** n) < 1e-9) return "K est l'INVERSE du produit des dénominateurs : il s'écrit 1 sur ce produit.";
  if (Math.abs(module - 1 / 2 ** n) < 1e-9 && q % 2 === 1 && Math.abs(z.im) < 1e-9) return "Il reste un i au dénominateur : multiplie le numérateur et le dénominateur par i pour l'en faire sortir.";
  return null;
}

function piegeLineaire(e: ExerciceLinearisation, texte: string): string | null {
  const f = fonctionLineaire(e);
  const { n } = puissances(e);
  if (proportionnelle(texte, f, -1)) return "Le signe est faux partout : revois le signe de K (puissances de i).";
  if (proportionnelle(texte, f, 2)) return "Tous tes coefficients sont doublés : K contient déjà le 1/2ⁿ, et 2cos(kx) ne se compte qu'une fois.";
  if (proportionnelle(texte, f, 0.5)) return "Tous tes coefficients sont divisés par 2 : n'oublie pas le facteur 2 de la somme de deux exponentielles conjuguées, égale à 2cos(kx).";
  if (proportionnelle(texte, f, 2 ** n) || proportionnelle(texte, f, -(2 ** n))) return "Tu as linéarisé le produit P, mais il reste à le multiplier par le facteur K de l'étape 1.";
  const constante = formeLineaire(e).find((t) => t.k === 0);
  if (constante && equivalente(texte, (x) => f(x) - valeur(constante.coef)) === "correct") return "Il manque le terme constant (le terme sans exponentielle du développement).";
  return null;
}

function variantePrimitive(e: ExerciceLinearisation, transformer: (t: TermePrimitive, l: TermeLineaire) => number): (x: number) => number {
  const termes = primitive(e);
  const lin = formeLineaire(e);
  return (x) => termes.reduce((s, t, i) => s + transformer(t, lin[i]) * (t.fonction === "x" ? x : t.fonction === "cos" ? Math.cos(t.k * x) : Math.sin(t.k * x)), 0);
}

function piegePrimitive(e: ExerciceLinearisation, texte: string): string | null {
  const lin = formeLineaire(e);
  const derivee = (x: number) => lin.reduce((s, t) => s + valeur(t.coef) * (t.fonction === "cos" ? -t.k * Math.sin(t.k * x) : t.fonction === "sin" ? t.k * Math.cos(t.k * x) : 0), 0);
  if (equivalenteAConstantePres(texte, derivee) === "correct") return "Tu as dérivé f au lieu de chercher une primitive.";
  const sansDiviser = variantePrimitive(e, (t) => valeur(t.coef) * (t.fonction === "x" ? 1 : t.k));
  if (lin.some((t) => t.k > 1) && equivalenteAConstantePres(texte, sansDiviser) === "correct") return "N'oublie pas de diviser par k : une primitive de cos(kx) est sin(kx)/k.";
  const signeCos = variantePrimitive(e, (t) => valeur(t.coef) * (t.fonction === "cos" ? -1 : 1));
  if (enSinus(e) && equivalenteAConstantePres(texte, signeCos) === "correct") return "Attention au signe : une primitive de sin(kx) est −cos(kx)/k.";
  const signeSin = variantePrimitive(e, (t) => valeur(t.coef) * (t.fonction === "sin" ? -1 : 1));
  if (!enSinus(e) && equivalenteAConstantePres(texte, signeSin) === "correct") return "Attention au signe : une primitive de cos(kx) est +sin(kx)/k (c'est la dérivée de cos qui porte un signe −).";
  return null;
}

/** Message ciblé sur une erreur classique, `null` si rien de reconnaissable (ou réponse juste). */
export function messagePiege(e: ExerciceLinearisation, phase: PhaseLinearisation, valeurs: string[]): string | null {
  switch (phase) {
    case "euler": {
      const z = lireComplexe(valeurs[0] ?? "");
      return z ? piegeEuler(e, z) : null;
    }
    case "developper": {
      const lus = valeurs.map(lireReel);
      if (lus.some((v) => v === null)) return null;
      const attendus = coefficientsProduit(e).map((t) => t.c);
      const nombres = lus as number[];
      if (puissances(e).q > 0 && nombres.every((v, i) => Math.abs(Math.abs(v) - Math.abs(attendus[i])) < 1e-9)) return "Les valeurs sont bonnes mais pas tous les signes : dans la différence des deux exponentielles, chaque terme soustrait apporte un signe −.";
      if (Math.abs(nombres[0] - attendus[0]) > 1e-9) return "La plus grande puissance vient du produit de tous les premiers termes : relis son coefficient.";
      return null;
    }
    case "regrouper": {
      const sinus = enSinus(e);
      const messages = new Set<string>();
      termesRegroupes(e).forEach((t, i) => {
        const z = lireComplexe(valeurs[i] ?? "");
        if (!z) return;
        if (t.k === 0) {
          if (procheComplexe(z, 2 * t.coef, 0) && t.coef !== 0) messages.add("Le terme constant n'a pas de partenaire : il reste tel quel, sans facteur 2.");
          return;
        }
        if (t.coef === 0) return;
        if (sinus) {
          if (procheComplexe(z, t.coef, 0)) messages.add("La différence de deux exponentielles conjuguées vaut 2i·sin(kx) : le i reste dans le coefficient.");
          else if (procheComplexe(z, 0, t.coef / 2)) messages.add("N'oublie pas le facteur 2 : la différence de deux exponentielles conjuguées vaut 2i·sin(kx).");
        } else if (procheComplexe(z, t.coef / 2, 0)) messages.add("N'oublie pas le facteur 2 : la somme de deux exponentielles conjuguées vaut 2cos(kx).");
      });
      return messages.size > 0 ? [...messages].join(" ") : null;
    }
    case "lineaire": {
      const t = normaliserExpression(valeurs[0] ?? "");
      return expressionLisible(t) ? piegeLineaire(e, t) : null;
    }
    case "primitive": {
      const t = sansConstante(normaliserExpression(valeurs[0] ?? ""));
      return expressionLisible(t) ? piegePrimitive(e, t) : null;
    }
    case "integrale": {
      const v = lireReel(valeurs[0] ?? "");
      if (v === null) return null;
      const I = valeurExacte(integraleExacte(e));
      if (Math.abs(v + I) < 1e-7) return "Le signe est inversé : on calcule F(borne supérieure) − F(borne inférieure).";
      return null;
    }
  }
}

/** Sert aux contrôles du générateur : la forme linéarisée coïncide bien avec cosᵖx·sinᑫx. */
export function controleCoherence(e: ExerciceLinearisation): boolean {
  const f = fonctionLineaire(e);
  return POINTS_X.every((x) => Math.abs(f(x) - evaluerExpressionInitiale(e, x)) < 1e-9);
}
