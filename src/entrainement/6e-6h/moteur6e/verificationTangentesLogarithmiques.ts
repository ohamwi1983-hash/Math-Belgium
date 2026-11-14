import type { Comb, ExerciceTangentesLog } from "../core6e/tangentesLogarithmiques.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerEquivalenceFonction, separerEquationTexte } from "./equivalenceExponentielle";
import { evaluerExpressionExponentielle, evaluerValeurExponentielle } from "./expressionExponentielle";
import type { PhaseTangentesLog } from "./typesTangentesLogarithmiques";

/**
 * Couche B (6e) — vérification de `6gen87`. N'importe rien de `generateurs6e/`.
 *
 * - Dérivée : équivalence numérique (`diagnostiquerEquivalenceFonction`, même évaluateur que 6gen16)
 *   aux points du domaine de la famille.
 * - Valeurs (f(x₀), f′(x₀), a, abscisses) : valeur exacte ou décimale très proche (tolérance 5·10⁻⁴,
 *   relative pour les grands nombres) — 0,37 ne passe pas pour 1/e.
 * - Équations : champ d'expression vérifié par ÉQUIVALENCE. « y = … », « … = y », « 2x − y − 1 = 0 »
 *   ou l'expression seule (lue comme y = …) : le membre gauche moins le membre droit doit valoir
 *   λ·(y − m x − p) pour un même λ ≠ 0 en tous les points échantillonnés (x, y[, a]).
 */

const TOLERANCE = 5e-4;
const TOLERANCE_DERIVEE = 1e-3;

/** Échantillons (x, y) — et a pour l'équation de la tangente en a (a > 0 : familles de `origine`). */
const ECHANTILLONS: Record<string, number>[] = [
  { x: -1.3, y: 0.7, a: 0.6 },
  { x: 0.4, y: -1.1, a: 1.3 },
  { x: 1.7, y: 2.3, a: 2.2 },
  { x: 2.9, y: -0.6, a: 3.1 },
  { x: 0.9, y: 1.5, a: 0.85 },
  { x: -0.5, y: -2.2, a: 1.75 },
];

function toleranceValeur(cible: number): number {
  return Math.max(TOLERANCE, TOLERANCE * Math.abs(cible));
}

function valeurComb(c: Comb): number {
  return c.reduce((s, t) => s + (t.n / t.d) * t.atome.valeur, 0);
}

function diagnostiquerValeurExacte(texte: string, cible: number): StatutVerification {
  const v = evaluerValeurExponentielle(texte ?? "");
  if (v === null) return "parse_error";
  return Math.abs(v - cible) <= toleranceValeur(cible) ? "correct" : "not_equivalent";
}

/** Référence d'une équation : R(variables) = 0 décrit la droite (ou la famille de droites). */
type Reference = (v: Record<string, number>) => number;

/**
 * Équation saisie ⟺ `reference` = 0, à un facteur constant λ ≠ 0 près. Une saisie sans « = » est
 * lue comme « y = saisie ». Un symbole d'inégalité → `not_equivalent` (ce n'est pas une équation).
 */
export function diagnostiquerEquation(texte: string, reference: Reference): StatutVerification {
  const brut = (texte ?? "").trim();
  if (brut === "") return "parse_error";
  const sansEgal = !/[=<>≤≥]/.test(brut);
  const separe = sansEgal ? { gauche: "y", droite: brut, symbole: "=" } : separerEquationTexte(brut);
  if (separe === null) return "parse_error";
  if (separe.gauche.trim() === "" || separe.droite.trim() === "") return "parse_error";
  const diffs: number[] = [];
  const refs: number[] = [];
  for (const ech of ECHANTILLONS) {
    let g: number;
    let d: number;
    try {
      g = evaluerExpressionExponentielle(separe.gauche, ech);
      d = evaluerExpressionExponentielle(separe.droite, ech);
    } catch {
      return "parse_error";
    }
    const r = reference(ech);
    if (!Number.isFinite(r)) continue;
    const diff = g - d;
    if (!Number.isFinite(diff)) return "not_equivalent";
    diffs.push(diff);
    refs.push(r);
  }
  if (separe.symbole !== "=") return "not_equivalent";
  if (refs.length < 3) return "parse_error";
  let produit = 0;
  let carre = 0;
  for (let i = 0; i < refs.length; i++) {
    produit += diffs[i] * refs[i];
    carre += refs[i] * refs[i];
  }
  const lambda = produit / carre;
  if (Math.abs(lambda) < 1e-6) return "not_equivalent";
  const tol = 2e-3 * Math.max(1, Math.abs(lambda));
  for (let i = 0; i < refs.length; i++) {
    if (Math.abs(diffs[i] - lambda * refs[i]) > tol * Math.max(1, Math.abs(refs[i]))) return "not_equivalent";
  }
  return "correct";
}

function referenceDroite(m: number, p: number): Reference {
  return (v) => v.y - (m * v.x + p);
}

/** Référence de la tangente au point d'abscisse a (variables x, y, a). */
function referenceTangenteEnA(e: ExerciceTangentesLog): Reference {
  const { fn, dfn } = e.fonction;
  return (v) => v.y - (dfn(v.a) * (v.x - v.a) + fn(v.a));
}

/** Droite(s) attendue(s) sur l'écran d'équation (une par contact). */
export function droitesAttendues(e: ExerciceTangentesLog): { m: number; p: number }[] {
  return e.contacts.map((c) => ({ m: valeurComb(c.m), p: valeurComb(c.p) }));
}

/** Abscisses attendues (écran `solutions`). */
export function abscissesAttendues(e: ExerciceTangentesLog): number[] {
  return e.contacts.map((c) => valeurComb(c.x0));
}

/** Nombre de champs d'un écran (`solutions` : liste libre → 1 statut global). */
export function nombreChamps(e: ExerciceTangentesLog, phase: PhaseTangentesLog): number {
  if (phase === "valeurs") return 2;
  if (phase === "equations") return e.contacts.length;
  return 1;
}

/** Statut champ par champ (l'écran `solutions` rend un seul statut pour toute la liste). */
export function diagnostiquerChamps(e: ExerciceTangentesLog, phase: PhaseTangentesLog, valeurs: string[]): StatutVerification[] {
  const c = e.contacts[0];
  switch (phase) {
    case "derivee":
      return [diagnostiquerEquivalenceFonction(valeurs[0] ?? "", e.fonction.dfn, e.fonction.pointsTest, TOLERANCE_DERIVEE)];
    case "valeurs":
      return [diagnostiquerValeurExacte(valeurs[0], valeurComb(c.fx0)), diagnostiquerValeurExacte(valeurs[1], valeurComb(c.dfx0))];
    case "equation":
      return [diagnostiquerEquation(valeurs[0], referenceDroite(valeurComb(c.m), valeurComb(c.p)))];
    case "equations":
      return droitesAttendues(e).map((d, i) => diagnostiquerEquation(valeurs[i], referenceDroite(d.m, d.p)));
    case "tangenteA":
      return [diagnostiquerEquation(valeurs[0], referenceTangenteEnA(e))];
    case "valeurA":
      return [diagnostiquerValeurExacte(valeurs[0], valeurComb(c.x0))];
    case "solutions": {
      const lues: number[] = [];
      for (const t of valeurs) {
        const v = evaluerValeurExponentielle(t ?? "");
        if (v === null) return ["parse_error"];
        lues.push(v);
      }
      const attendues = abscissesAttendues(e);
      if (lues.length !== attendues.length) return ["not_equivalent"];
      const restantes = [...attendues];
      for (const v of lues) {
        const i = restantes.findIndex((a) => Math.abs(a - v) <= toleranceValeur(a));
        if (i === -1) return ["not_equivalent"];
        restantes.splice(i, 1);
      }
      return ["correct"];
    }
  }
}

/** Statut global : `parse_error` prioritaire (aucune tentative décomptée), puis `not_equivalent`. */
export function diagnostiquerEcran(e: ExerciceTangentesLog, phase: PhaseTangentesLog, valeurs: string[]): StatutVerification {
  const statuts = diagnostiquerChamps(e, phase, valeurs);
  if (statuts.includes("parse_error")) return "parse_error";
  return statuts.every((s) => s === "correct") ? "correct" : "not_equivalent";
}

export function verifierEcran(e: ExerciceTangentesLog, phase: PhaseTangentesLog, valeurs: string[]): boolean {
  return diagnostiquerEcran(e, phase, valeurs) === "correct";
}

function proche(texte: string, cible: number): boolean {
  const v = evaluerValeurExponentielle(texte ?? "");
  return v !== null && Math.abs(v - cible) <= toleranceValeur(cible);
}

/** Message ciblé après une réponse fausse (en plus du compteur de tentatives) — jamais la réponse. */
export function messageSpecifique(e: ExerciceTangentesLog, phase: PhaseTangentesLog, valeurs: string[]): string | null {
  const c = e.contacts[0];
  const fam = e.fonction.famille;
  switch (phase) {
    case "derivee": {
      const texte = valeurs[0] ?? "";
      const egal = (ref: (x: number) => number) => diagnostiquerEquivalenceFonction(texte, ref, e.fonction.pointsTest, TOLERANCE_DERIVEE) === "correct";
      if (fam === "logBase" && egal((x) => 1 / x)) return "Il manque un facteur : seule la base e donne 1/x comme dérivée.";
      if (fam === "xlnx" && (egal((x) => 1 / x + e.fonction.dfn(x) - Math.log(x) - 1) || egal((x) => e.fonction.dfn(x) - 1))) {
        return "x ln(x) est un produit : la règle du produit donne deux termes.";
      }
      const oubli = e.fonction.oubliChaine;
      if (oubli && egal(oubli)) return "Règle de la chaîne : n'oublie pas de multiplier par la dérivée de l'argument du logarithme.";
      return null;
    }
    case "valeurs": {
      const fx0 = valeurComb(c.fx0);
      const dfx0 = valeurComb(c.dfx0);
      if (Math.abs(fx0 - dfx0) > 1e-6 && proche(valeurs[0], dfx0) && proche(valeurs[1], fx0)) return "Tu as échangé f(x₀) et f′(x₀).";
      return null;
    }
    case "equation":
    case "equations": {
      const contacts = phase === "equation" ? [c] : e.contacts;
      for (let i = 0; i < contacts.length; i++) {
        const k = contacts[i];
        if (valeurComb(k.x0) === 0) continue;
        const oubli = diagnostiquerEquation(valeurs[i] ?? "", referenceDroite(valeurComb(k.dfx0), valeurComb(k.fx0))) === "correct";
        if (oubli) return "L'ordonnée du point de contact n'est pas l'ordonnée à l'origine : la tangente s'écrit y = f′(x₀)(x − x₀) + f(x₀).";
      }
      return null;
    }
    case "solutions": {
      if (e.variante !== "parallele") return null;
      const lues = valeurs.map((t) => evaluerValeurExponentielle(t ?? ""));
      if (e.rejetees.some((r) => lues.some((v) => v !== null && Math.abs(v - r) < 1e-3))) return "Une des valeurs proposées n'appartient pas au domaine de f : elle ne donne aucune tangente.";
      return null;
    }
    default:
      return null;
  }
}
