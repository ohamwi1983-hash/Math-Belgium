// Copie 5e (6h) de `5e-4h/moteur5e/verificationTroisTermes.ts` (56gen5 ← 5gen46, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
import { analyser, equationBrute, produitAffines, raisonEn, relationCorrecte, termesEn, valeurFraction } from "../core/troisTermes.types";
import type { ExerciceTroisTermes, Poly } from "../core/troisTermes.types";
import { evaluerExpressionGenerale } from "../../../../5e-4h/moteur/expressionGenerale";
import type { StatutVerification } from "../../../../5e-4h/moteur/statutVerification";
import { diagnostiquerNombre, estSolutionDirecte, sansEspacesMilliers } from "../../../../5e-4h/moteur5e/saisieNombreSuites";
import { REPONSE_AUCUNE } from "./typesTroisTermes";
import type { PhaseTroisTermes } from "./typesTroisTermes";

/**
 * Couche B (5e) — vérification de `5gen46` « Trois termes consécutifs ». Toutes les valeurs
 * attendues viennent de `core5e/troisTermes.types.ts` (source unique). Saisie lue par les MÊMES
 * fonctions que 5gen14/5gen15 : `evaluerExpressionGenerale` (multiplication implicite « 3x », « x² »
 * ou « x^2 », virgule décimale, fraction « 1/2 ») et `saisieNombreSuites.ts::diagnostiquerNombre`
 * (espace des milliers acceptée) pour les nombres.
 *
 * - `relation` : choix fermé, comparé à la relation de la variante.
 * - `equation` : le membre de gauche saisi est un polynôme de degré ≤ 2, PROPORTIONNEL (facteur non
 *   nul) à 2b − a − c ou à b² − a·c — « 2x − 8 », « x − 4 » et « −x + 4 » sont tous justes. Une
 *   écriture équivalente mais pas réduite (parenthèses, termes semblables non regroupés), un second
 *   membre non nul ou directement « x = … » sont refusés par un message, SANS consommer de tentative
 *   (`refusFormat`, même décision que `MESSAGE_SOLUTION_DIRECTE` de 5gen14).
 * - `solutions` : ensemble des valeurs qui conviennent (ordre libre, doublons ignorés), ou « aucune ».
 * - `termes` : quatre nombres par valeur qui convient (a, b, c, raison), tolérance 0,01.
 */

// ============================================================================
// Lecture d'un polynôme saisi.
// ============================================================================

const POINTS = [-1, 0, 1, 2, 3];

/** Coefficients d'un polynôme de degré ≤ 2 saisi en x ; `null` si ce n'en est pas un ; lève une
 * erreur si la saisie est illisible. */
function lirePoly(texte: string): Poly | null {
  const valeurs = POINTS.map((x) => evaluerExpressionGenerale(sansEspacesMilliers(texte), x));
  if (!valeurs.every(Number.isFinite)) return null;
  const [fm1, f0, f1, f2, f3] = valeurs;
  const c0 = f0;
  const c2 = (f1 - 2 * f0 + fm1) / 2;
  const c1 = (f1 - fm1) / 2;
  const p = (x: number) => c0 + c1 * x + c2 * x * x;
  if (Math.abs(p(2) - f2) > 1e-6 || Math.abs(p(3) - f3) > 1e-6) return null;
  return [c0, c1, c2];
}

type LectureEquation = { statut: "parse_error" } | { statut: "second-membre" } | { statut: "pas-polynome" } | { statut: "poly"; poly: Poly };

/** Lit « P » ou « P = 0 » (un éventuel second membre doit valoir 0). */
function lireEquation(texte: string): LectureEquation {
  const parties = texte.split("=");
  if (parties.length > 2 || parties.some((p) => p.trim() === "")) return { statut: "parse_error" };
  try {
    const gauche = lirePoly(parties[0]);
    if (parties.length === 2) {
      const droite = lirePoly(parties[1]);
      if (droite === null || gauche === null) return { statut: "pas-polynome" };
      if (droite.some((k) => Math.abs(k) > 1e-9)) return { statut: "second-membre" };
    }
    return gauche === null ? { statut: "pas-polynome" } : { statut: "poly", poly: gauche };
  } catch {
    return { statut: "parse_error" };
  }
}

/** p = k·cible avec k ≠ 0 ? */
function proportionnel(p: Poly, cible: Poly): boolean {
  const i = [2, 1, 0].find((j) => cible[j] !== 0);
  if (i === undefined) return false;
  const k = p[i] / cible[i];
  if (!Number.isFinite(k) || Math.abs(k) < 1e-9) return false;
  return p.every((v, j) => Math.abs(v - k * cible[j]) < 1e-6 * Math.max(1, Math.abs(k * cible[j])));
}

/** Écriture réduite : pas de parenthèses, un seul monôme par degré. */
function estReduite(texte: string): boolean {
  const s = sansEspacesMilliers(texte.split("=")[0]).replace(/\s+/g, "");
  if (/[()[\]]/.test(s)) return false;
  const monomes = s.split(/(?<=.)(?<![*/^eE])[+-]/).filter((m) => m !== "");
  const degres = monomes.map((m) => (/x(\^2|²)|x\*?x/i.test(m) ? 2 : /x/i.test(m) ? 1 : 0));
  return new Set(degres).size === degres.length;
}

// ============================================================================
// Statuts.
// ============================================================================

function lireNombre(texte: string): number | null {
  try {
    const v = evaluerExpressionGenerale(sansEspacesMilliers(texte.replace(/^\s*x\s*=\s*/i, "")), 0);
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

/** Valeurs attendues de l'écran `termes`, champ par champ (a, b, c, raison pour chaque valeur). */
export function valeursAttenduesTermes(e: ExerciceTroisTermes): number[] {
  return analyser(e).valables.flatMap((x) => [...termesEn(e, x), valeurFraction(raisonEn(e, x))]);
}

function contient(liste: number[], v: number): boolean {
  return liste.some((x) => Math.abs(x - v) < 1e-9);
}

/** Statut champ par champ (seuls les champs faux sont marqués). */
export function diagnostiquerChamps(e: ExerciceTroisTermes, phase: PhaseTroisTermes, valeurs: string[]): StatutVerification[] {
  switch (phase) {
    case "relation":
      return [valeurs[0] === relationCorrecte(e) ? "correct" : "not_equivalent"];
    case "equation": {
      const lecture = lireEquation(valeurs[0] ?? "");
      if (lecture.statut === "parse_error") return ["parse_error"];
      if (lecture.statut !== "poly") return ["not_equivalent"];
      return [proportionnel(lecture.poly, equationBrute(e)) ? "correct" : "not_equivalent"];
    }
    case "solutions": {
      const valables = analyser(e).valables;
      if (valeurs[0] === REPONSE_AUCUNE) return [valables.length === 0 ? "correct" : "not_equivalent"];
      return valeurs.map((v) => {
        const x = lireNombre(v);
        if (x === null) return "parse_error";
        return contient(valables, x) ? "correct" : "not_equivalent";
      });
    }
    case "termes":
      return valeursAttenduesTermes(e).map((cible, i) => diagnostiquerNombre(valeurs[i] ?? "", cible));
  }
}

export function diagnostiquerEcran(e: ExerciceTroisTermes, phase: PhaseTroisTermes, valeurs: string[]): StatutVerification {
  const statuts = diagnostiquerChamps(e, phase, valeurs);
  if (statuts.includes("parse_error")) return "parse_error";
  if (!statuts.every((s) => s === "correct")) return "not_equivalent";
  if (phase === "solutions" && valeurs[0] !== REPONSE_AUCUNE) {
    // Toutes les valeurs saisies conviennent : encore faut-il qu'il n'en manque aucune.
    const lues = valeurs.map((v) => lireNombre(v) as number);
    if (!analyser(e).valables.every((x) => contient(lues, x))) return "not_equivalent";
  }
  return "correct";
}

export function verifierEcran(e: ExerciceTroisTermes, phase: PhaseTroisTermes, valeurs: string[]): boolean {
  return diagnostiquerEcran(e, phase, valeurs) === "correct";
}

/** Message d'une saisie non lue (aucune tentative décomptée). */
export function messageIllisible(phase: PhaseTroisTermes): string {
  if (phase === "equation") return "Expression non reconnue — écris une expression en x, par exemple 2x² − 3x + 1 ; aucune tentative n'a été comptée.";
  return "Écriture non reconnue — écris un nombre (fraction comme 3/4 acceptée) ; aucune tentative n'a été comptée.";
}

/** Écriture refusée SANS consommer de tentative (forme demandée non respectée), ou `null`. */
export function refusFormat(e: ExerciceTroisTermes, phase: PhaseTroisTermes, valeurs: string[]): string | null {
  if (phase !== "equation") return null;
  const texte = valeurs[0] ?? "";
  if (estSolutionDirecte(texte, "x")) return "Écris l'équation réduite, pas directement la valeur de x : tu la calculeras à l'écran suivant ; aucune tentative n'a été comptée.";
  const lecture = lireEquation(texte);
  if (lecture.statut === "second-membre") return "Ramène tous les termes dans le membre de gauche : l'équation doit avoir la forme … = 0 ; aucune tentative n'a été comptée.";
  if (lecture.statut === "poly" && proportionnel(lecture.poly, equationBrute(e)) && !estReduite(texte)) {
    return "Ton équation est juste mais pas encore réduite : développe (plus de parenthèses) et regroupe les termes semblables ; aucune tentative n'a été comptée.";
  }
  return null;
}

// ============================================================================
// Pièges reconnus (jamais la valeur attendue).
// ============================================================================

function piegeEquation(e: ExerciceTroisTermes, texte: string): string | null {
  const lecture = lireEquation(texte);
  if (lecture.statut !== "poly") return null;
  const p = lecture.poly;
  const [a, b, c] = e.termes;
  const cible = equationBrute(e);
  const candidat = (q: Poly) => !proportionnel(q, cible) && proportionnel(p, q);
  if (e.variante === "arithmetique") {
    // 2 appliqué au seul premier terme de b.
    const deuxPartiel: Poly = [b[0] - a[0] - c[0], 2 * b[1] - a[1] - c[1], 2 * b[2] - a[2] - c[2]];
    if (b[0] !== 0 && candidat(deuxPartiel)) return "Le 2 multiplie TOUTE l'expression de b : distribue-le à chacun de ses termes.";
    if (candidat([2 * b[0] - a[0] + c[0], 2 * b[1] - a[1] + c[1], 2 * b[2] - a[2] + c[2]]) || candidat([2 * b[0] + a[0] - c[0], 2 * b[1] + a[1] - c[1], 2 * b[2] + a[2] - c[2]])) {
      return "Attention aux signes : en passant a + c dans le membre de gauche, CHACUN de ses termes change de signe.";
    }
    return null;
  }
  // (u + v)² écrit u² + v², sans double produit.
  const sansDouble: Poly = [b[0] * b[0], 0, b[1] * b[1]];
  const ac = produitAffines(a, c);
  if (b[0] !== 0 && b[1] !== 0 && candidat([sansDouble[0] - ac[0], -ac[1], sansDouble[2] - ac[2]])) {
    return "Le carré d'une somme contient un double produit : (u + v)² = u² + 2uv + v².";
  }
  const bb = produitAffines(b, b);
  if (candidat([bb[0] + ac[0], bb[1] + ac[1], bb[2] + ac[2]])) return "Attention au signe : en passant a × c dans le membre de gauche, il devient − a × c.";
  if (candidat([b[0] - ac[0], b[1] - ac[1], -ac[2]])) return "La relation porte sur le CARRÉ de b : b² = a × c.";
  return null;
}

function piegeSolutions(e: ExerciceTroisTermes, valeurs: string[]): string | null {
  const an = analyser(e);
  const res = an.resolution;
  if (valeurs[0] === REPONSE_AUCUNE) {
    if (an.valables.length === 0) return null;
    return res.type === "delta-positif" || res.type === "delta-nul" ? "L'équation a des solutions (Δ n'est pas négatif) : calcule-les, puis vérifie-les." : "L'équation réduite a une solution : calcule-la, puis vérifie-la.";
  }
  const lues = valeurs.map(lireNombre);
  if (lues.some((v) => v === null)) return null;
  const nombres = lues as number[];
  const messages: string[] = [];
  for (const x of an.ecartees) {
    if (contient(nombres, x)) {
      const [ta, tb, tc] = termesEn(e, x).map((v) => (v < 0 ? `−${-v}` : String(v)));
      messages.push(`Pour x = ${x < 0 ? "−" : ""}${Math.abs(x)}, les termes valent ${ta} ; ${tb} ; ${tc} : un terme nul n'a pas de place dans une suite géométrique, écarte cette valeur.`);
    }
  }
  if (res.type === "delta-negatif") messages.push("Calcule le discriminant : s'il est négatif, l'équation n'a aucune solution réelle.");
  if (res.type === "contradiction") messages.push("Les termes en x se sont éliminés : l'égalité qui reste peut-elle être vraie ?");
  if (messages.length > 0) return messages.join(" ");
  if (an.valables.some((x) => !contient(nombres, x)) && nombres.every((v) => contient(an.valables, v))) {
    return res.type === "delta-positif" ? "Il manque une valeur : une équation du second degré dont le discriminant est positif a deux solutions." : "Il manque une valeur.";
  }
  if (nombres.some((v) => contient(an.valables, -v) && !contient(an.valables, v))) return "Vérifie le signe de ta solution : remplace x par ta valeur dans l'équation réduite.";
  return null;
}

function piegeTermes(e: ExerciceTroisTermes, valeurs: string[]): string | null {
  const valables = analyser(e).valables;
  for (let i = 0; i < valables.length; i++) {
    const [ta, tb] = termesEn(e, valables[i]);
    const v = lireNombre(valeurs[4 * i + 3] ?? "");
    if (v === null) continue;
    const juste = valeurFraction(raisonEn(e, valables[i]));
    if (Math.abs(v - juste) <= 0.01) continue;
    if (e.variante === "geometrique" && Math.abs(v - ta / tb) <= 0.01) return "Tu as divisé à l'envers : q est un terme divisé par le terme PRÉCÉDENT, q = b/a.";
    if (e.variante === "arithmetique" && Math.abs(v - (ta - tb)) <= 0.01) return "La raison est un terme MOINS le précédent, r = b − a : son signe dit si les termes augmentent ou diminuent.";
    if (e.variante === "geometrique" && Math.abs(v - (tb - ta)) <= 0.01) return "Dans une suite géométrique, on passe d'un terme au suivant en MULTIPLIANT : q est un quotient, pas une différence.";
  }
  return null;
}

/** Message ciblé sur une erreur classique, `null` si rien de reconnaissable (ou réponse juste). */
export function messagePiege(e: ExerciceTroisTermes, phase: PhaseTroisTermes, valeurs: string[]): string | null {
  switch (phase) {
    case "relation":
      return null;
    case "equation":
      return piegeEquation(e, valeurs[0] ?? "");
    case "solutions":
      return piegeSolutions(e, valeurs);
    case "termes":
      return piegeTermes(e, valeurs);
  }
}
