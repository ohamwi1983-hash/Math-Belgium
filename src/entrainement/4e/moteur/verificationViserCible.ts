import type { ExerciceViserCible, OptionVecteur, VerdictDirect, VerdictInverse } from "../core/viserCible.types";
import { coefficientK, colineaires, conditionInverse, critere, solutionM, valeurFraction, vecteurAC, verdictDirect, verdictInverse } from "./modeleViserCible";
import { evaluerExpression } from "./expressionAlgebrique";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

/**
 * Vérification de gen89. Choix fermés (vecteur à comparer, conclusion) : une seule tentative.
 * Champs libres (composantes, critère, k, condition, m) : statut à 4 valeurs ; une saisie illisible
 * (`parse_error`) ne consomme jamais de tentative (c'est l'appli qui ne l'envoie pas à la session).
 * Critère : celui du cours, comme gen24 — l'ordre (AC⃗, u⃗) donne l'opposé, accepté aussi.
 */

export type StatutChamp = "correct" | "faux" | "parse_error";

const TOLERANCE = 1e-6;

/** Nombre saisi : entier, décimal (virgule ou point) ou fraction a/b, signe moins typographique
 * accepté. `null` si illisible. */
export function lireNombre(texte: string): number | null {
  const s = normaliserSigneMoins(texte).trim().replace(/\s+/g, "").replace(",", ".");
  if (s === "") return null;
  if (/^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(s)) return Number(s);
  const f = /^([+-]?)\(?([+-]?\d+(?:\.\d+)?)\)?\/\(?([+-]?\d+(?:\.\d+)?)\)?$/.exec(s);
  if (f) {
    const den = Number(f[3]);
    if (den === 0) return null;
    return (f[1] === "-" ? -1 : 1) * (Number(f[2]) / den);
  }
  return null;
}

function statutNombre(texte: string, cible: number): StatutChamp {
  const v = lireNombre(texte);
  if (v === null) return "parse_error";
  return Math.abs(v - cible) <= TOLERANCE ? "correct" : "faux";
}

// Écran 1 — le vecteur à comparer à u⃗.
export function verifierVecteur(choix: OptionVecteur): boolean {
  return choix === "AC";
}

// Écran 2 — composantes de AC⃗.
export function diagnostiquerComposantes(e: ExerciceViserCible, tx: string, ty: string): { x: StatutChamp; y: StatutChamp } {
  const ac = vecteurAC(e);
  return { x: statutNombre(tx, ac.x), y: statutNombre(ty, ac.y) };
}

/** Erreur typique : origine moins extrémité (composantes de CA⃗). */
export function composantesInversees(e: ExerciceViserCible, tx: string, ty: string): boolean {
  const ac = vecteurAC(e);
  return statutNombre(tx, -ac.x) === "correct" && statutNombre(ty, -ac.y) === "correct";
}

// Écran 3 (sens direct) — critère, colinéarité, k.
export interface ReponseTest {
  critere: string;
  colineaires: boolean;
  /** Ignoré si l'élève répond « non colinéaires ». */
  k: string;
}

export type DiagnosticTest =
  | { statut: "parse_error" }
  | { statut: "correct" }
  /** Critère juste mais colinéarité mal conclue : choix fermé, l'écran se clôt (une tentative). */
  | { statut: "conclusion_fausse" }
  | { statut: "critere_faux" }
  | { statut: "k_faux"; motif: "inverse" | "signe" | "autre" };

export function diagnostiquerTest(e: ExerciceViserCible, r: ReponseTest): DiagnosticTest {
  const c = lireNombre(r.critere);
  const k = r.colineaires ? lireNombre(r.k) : 0;
  if (c === null || k === null) return { statut: "parse_error" };
  const vrai = critere(e);
  if (Math.abs(c - vrai) > TOLERANCE && Math.abs(c + vrai) > TOLERANCE) return { statut: "critere_faux" };
  if (r.colineaires !== colineaires(e)) return { statut: "conclusion_fausse" };
  if (!r.colineaires) return { statut: "correct" };
  const kVrai = valeurFraction(coefficientK(e)!);
  if (Math.abs(k - kVrai) <= TOLERANCE) return { statut: "correct" };
  if (k !== 0 && Math.abs(1 / k - kVrai) <= TOLERANCE) return { statut: "k_faux", motif: "inverse" };
  if (Math.abs(k + kVrai) <= TOLERANCE) return { statut: "k_faux", motif: "signe" };
  return { statut: "k_faux", motif: "autre" };
}

// Écran 3 (sens inverse) — la condition de colinéarité, équation libre en m.
export type StatutCondition = "correct" | "faux" | "parse_error" | "sans_egal";

const ECHANTILLON = [0.37, 1.53, -0.82, 2.19, -1.41];

/** Lecture d'un membre d'équation : m (ou x) est la variable ; « ⋅ » est un point de multiplication. */
function evaluerMembre(texte: string, m: number): number {
  return evaluerExpression(texte.replace(/[mM]/g, "x").replace(/⋅/g, "·"), m);
}

/**
 * L'équation saisie (n'importe quelle forme, inconnue d'un côté ou des deux) est acceptée si
 * « membre de gauche − membre de droite » est un multiple NON NUL de α·m + β (condition du cours),
 * en 5 points non entiers : tout multiple, tout ordre du critère, toute réécriture équivalente.
 */
export function diagnostiquerCondition(e: ExerciceViserCible, texte: string): StatutCondition {
  const s = normaliserSigneMoins(texte).trim();
  if (s === "") return "parse_error";
  const membres = s.split("=");
  if (membres.length !== 2) {
    if (membres.length === 1) {
      try {
        evaluerMembre(s, 1.3);
      } catch {
        return "parse_error";
      }
      return "sans_egal";
    }
    return "parse_error";
  }
  if (membres.some((m) => m.trim() === "")) return "parse_error";
  let valeurs: number[];
  try {
    valeurs = ECHANTILLON.map((m) => evaluerMembre(membres[0]!, m) - evaluerMembre(membres[1]!, m));
  } catch {
    return "parse_error";
  }
  if (valeurs.some((v) => !Number.isFinite(v))) return "parse_error";
  const { alpha, beta } = conditionInverse(e);
  const cibles = ECHANTILLON.map((m) => alpha * m + beta);
  const i = cibles.reduce((meilleur, v, j) => (Math.abs(v) > Math.abs(cibles[meilleur]!) ? j : meilleur), 0);
  const lambda = valeurs[i]! / cibles[i]!;
  if (!Number.isFinite(lambda) || Math.abs(lambda) < 1e-9) return "faux";
  return valeurs.every((v, j) => Math.abs(v - lambda * cibles[j]!) <= 1e-6 * Math.max(1, Math.abs(v))) ? "correct" : "faux";
}

// Écran 4 (sens inverse) — la valeur de m.
export function diagnostiquerParametre(e: ExerciceViserCible, texte: string): StatutChamp {
  return statutNombre(texte, solutionM(e));
}

// Dernier écran — la conclusion dans le contexte.
export function verifierConclusionDirecte(e: ExerciceViserCible, choix: VerdictDirect): boolean {
  return choix === verdictDirect(e);
}

export function verifierConclusionInverse(e: ExerciceViserCible, choix: VerdictInverse | "cote"): boolean {
  return choix === verdictInverse(e);
}
