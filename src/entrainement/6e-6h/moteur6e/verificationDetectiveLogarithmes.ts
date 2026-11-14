import type { ExerciceDetectiveLogarithmes, IdDescriptionLogarithmes, NombreExact, ReponseChampLog } from "../core6e/detectiveLogarithmes.types";
import { descriptionCorrecte, indiceLigneFausse, valeursAttendues } from "./modeleDetectiveLogarithmes";
import { diagnostiquerFonction, diagnostiquerNombre, type StatutChamp } from "./verificationDetectiveIntegrales";
import { evaluerExpressionExponentielle } from "./expressionExponentielle";
import { verifierEnsembleReelGuide } from "./verificationEnsembleReel";

/**
 * Vérification de 6gen88. Écran 1 : le numéro de la ligne fausse. Écran 2 : la description de
 * l'erreur. Écran 3 : chaque valeur est comparée à la valeur EXACTE avec l'évaluateur d'expressions
 * du chapitre (fractions, e, ln, log, logN, π, √ — même saisie que 6gen84, dont les vérificateurs
 * de nombre et de fonction sont réutilisés) :
 * - un nombre ou une fonction : comme 6gen84 (une valeur DÉCIMALE proche mais non exacte est
 *   signalée « approchée » sans consommer de tentative) ;
 * - un ensemble fini de solutions : éléments séparés par « ; » (accolades, « S = », « x = » et
 *   « ou » tolérés ; ∅ ou « vide » pour l'ensemble vide), comparé comme un ENSEMBLE (ordre
 *   indifférent, doublons ignorés) ;
 * - un intervalle (construction guidée du chapitre, `EnsembleReelGuideBuilder`) : égalité
 *   d'ensembles (`verifierEnsembleReelGuide`).
 */

export type { StatutChamp };

function preparer(texte: string): string {
  return texte
    .trim()
    .replace(/[−–—]/g, "-")
    .replace(/(\d),(\d)/g, "$1.$2");
}

/** Lecture d'un ensemble fini saisi au clavier : `null` si un élément est illisible. */
export function lireEnsemble(texte: string): { valeurs: number[]; decimal: boolean } | null {
  let s = preparer(texte).replace(/^S\s*=\s*/i, "").trim();
  if (/^(∅|vide|\{\s*\})$/i.test(s)) return { valeurs: [], decimal: false };
  s = s.replace(/^\{/, "").replace(/\}$/, "").trim();
  const morceaux = s
    .split(/;|\bou\b/i)
    .map((m) => m.trim().replace(/^x\s*=\s*/i, "").trim())
    .filter((m) => m !== "");
  if (morceaux.length === 0) return null;
  const valeurs: number[] = [];
  for (const m of morceaux) {
    try {
      valeurs.push(evaluerExpressionExponentielle(m, {}));
    } catch {
      return null;
    }
  }
  return { valeurs, decimal: morceaux.some((m) => /\d\.\d/.test(m)) };
}

function proche(a: number, b: number, tol: number): boolean {
  return Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
}

/** Retire les doublons d'une liste de réels (à la tolérance près). */
function sansDoublons(valeurs: number[], tol: number): number[] {
  const r: number[] = [];
  for (const v of valeurs) if (!r.some((x) => proche(v, x, tol))) r.push(v);
  return r;
}

function memeEnsemble(lus: number[], attendus: number[], tol: number): boolean {
  const a = sansDoublons(lus, tol);
  return a.length === attendus.length && attendus.every((x) => a.some((y) => proche(y, x, tol)));
}

export function diagnostiquerEnsemble(texte: string, attendus: NombreExact[]): StatutChamp {
  if (preparer(texte) === "") return "parse_error";
  const lu = lireEnsemble(texte);
  if (lu === null) return "parse_error";
  if (lu.valeurs.some((v) => !Number.isFinite(v))) return "faux";
  const cibles = attendus.map((x) => x.valeur);
  if (memeEnsemble(lu.valeurs, cibles, 1e-9)) return "correct";
  if (lu.decimal && memeEnsemble(lu.valeurs, cibles, 5e-3)) return "approchee";
  return "faux";
}

export function verifierLigne(e: ExerciceDetectiveLogarithmes, indice: number): boolean {
  return indice === indiceLigneFausse(e);
}

export function verifierDescription(e: ExerciceDetectiveLogarithmes, choix: IdDescriptionLogarithmes): boolean {
  return choix === descriptionCorrecte(e);
}

/** Statut de chaque valeur attendue. */
export function diagnostiquerCorrection(e: ExerciceDetectiveLogarithmes, reponses: ReponseChampLog[]): StatutChamp[] {
  return valeursAttendues(e).map((v, i) => {
    const r = reponses[i] ?? null;
    if (v.genre === "intervalle") {
      if (r === null || typeof r === "string") return "parse_error";
      return verifierEnsembleReelGuide(r, v.ensemble) ? "correct" : "faux";
    }
    const texte = typeof r === "string" ? r : "";
    if (v.genre === "nombre") return diagnostiquerNombre(texte, v.nombre.valeur);
    if (v.genre === "fonction") return diagnostiquerFonction(texte, v);
    return diagnostiquerEnsemble(texte, v.elements);
  });
}
