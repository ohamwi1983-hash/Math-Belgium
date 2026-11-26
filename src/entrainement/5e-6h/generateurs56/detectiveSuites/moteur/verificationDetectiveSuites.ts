// Copie 5e (6h) de `5e-4h/moteur5e/verificationDetectiveSuites.ts` (56gen10 ← 5gen49, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
import type { ExerciceDetectiveSuites, IdDescriptionSuites, ReponseDetectiveSuites } from "../core/detectiveSuites.types";
import { evaluerExpressionGenerale } from "../../../../5e-4h/moteur/expressionGenerale";
import { normaliserSigneMoins } from "../../../../../lib/normaliserSaisie";
import { sansEspacesMilliers } from "../../../../5e-4h/moteur5e/saisieNombreSuites";
import { CONTEXTES_POURCENTAGE, descriptionCorrecte, indiceLigneFausse, reponseAttendue, resultat } from "./modeleDetectiveSuites";

/**
 * Vérification de 5gen49. Écran 1 : le numéro de la ligne fausse. Écran 2 : la description de
 * l'erreur. Écran 3 : le résultat final corrigé, lu dans un champ libre (jamais filtré) :
 * - un nombre (évaluateur du chantier : virgule décimale, fraction « 16/3 », calcul accepté, espace
 *   des milliers comme 5gen14/5gen15, préfixe « S = », « u₈ ≈ » et unité finale ignorés) ; valeur
 *   EXACTE attendue, sauf en contexte à pourcentage avec calculatrice (arrondi à l'unité, tolérance
 *   d'une unité). Une valeur décimale proche d'une valeur exacte non décimale (16/3 ≈ 5,33) est
 *   signalée « approchée » sans consommer de tentative ;
 * - « n'existe pas » (somme infinie qui n'existe pas) ;
 * - « +∞ » / « −∞ » (limite infinie ; « inf », « infini », « plus l'infini » acceptés).
 */

export type StatutChampSuites = "correct" | "faux" | "parse_error" | "approchee";

type Lecture = { genre: "nombre"; valeur: number; decimal: boolean } | { genre: "nexistePas" } | { genre: "infini"; signe: 1 | -1 } | null;

function sansUnite(texte: string, e: ExerciceDetectiveSuites): string {
  const unites = ["€", "euros", "euro"];
  if (e.variante === "pourcentage") unites.unshift(CONTEXTES_POURCENTAGE[e.contexte]!.unite);
  let s = texte.trim();
  for (const u of unites) s = s.replace(new RegExp(`\\s*${u.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}\\s*\\.?$`, "i"), "");
  return s.trim();
}

/** Lecture d'une saisie ; `null` si illisible. */
export function lireReponse(texte: string, e: ExerciceDetectiveSuites): Lecture {
  let s = normaliserSigneMoins(texte).trim().replace(/[’`]/g, "'");
  if (s === "") return null;
  if (/n'?\s*existe\s+pas|^existe\s+pas|aucune|impossible|pas\s+de\s+somme|∄/i.test(s)) return { genre: "nexistePas" };
  // Préfixe « S = », « u_8 ≈ », « lim u_n = » : on garde ce qui suit le dernier « = » ou « ≈ ».
  s = s.replace(/^.*[=≈]/, "").trim();
  const compact = s.toLowerCase().replace(/\s+/g, "");
  if (/^\+?(∞|inf|infini|l'infini|plusl'infini|\+l'infini)$/.test(compact)) return { genre: "infini", signe: 1 };
  if (/^(-(∞|inf|infini|l'infini)|moinsl'infini)$/.test(compact)) return { genre: "infini", signe: -1 };
  const nettoye = sansUnite(sansEspacesMilliers(s), e);
  if (nettoye === "") return null;
  try {
    const v = evaluerExpressionGenerale(nettoye.replace(/(\d),(\d)/g, "$1.$2"), 0);
    if (!Number.isFinite(v)) return null;
    return { genre: "nombre", valeur: v, decimal: /\d[.,]\d/.test(nettoye) };
  } catch {
    return null;
  }
}

export function diagnostiquerReponse(texte: string, attendue: ReponseDetectiveSuites, e: ExerciceDetectiveSuites): StatutChampSuites {
  const lu = lireReponse(texte, e);
  if (lu === null) return "parse_error";
  if (attendue.genre === "nexistePas") return lu.genre === "nexistePas" ? "correct" : "faux";
  if (attendue.genre === "infini") return lu.genre === "infini" && lu.signe === attendue.signe ? "correct" : "faux";
  if (lu.genre !== "nombre") return "faux";
  if (Math.abs(lu.valeur - attendue.valeur) <= attendue.tolerance) return "correct";
  if (attendue.exacte && lu.decimal && Math.abs(lu.valeur - attendue.valeur) <= 5e-3 * Math.max(1, Math.abs(attendue.valeur))) return "approchee";
  return "faux";
}

export function verifierLigne(e: ExerciceDetectiveSuites, indice: number): boolean {
  return indice === indiceLigneFausse(e);
}

export function verifierDescription(e: ExerciceDetectiveSuites, choix: IdDescriptionSuites): boolean {
  return choix === descriptionCorrecte(e);
}

export function diagnostiquerCorrection(e: ExerciceDetectiveSuites, texte: string): StatutChampSuites {
  return diagnostiquerReponse(texte, reponseAttendue(e), e);
}

/** La saisie reprend le résultat (faux) de la copie : l'erreur n'a pas été corrigée. */
export function estResultatCopie(e: ExerciceDetectiveSuites, texte: string): boolean {
  return diagnostiquerReponse(texte, resultat(e, true), e) === "correct";
}
