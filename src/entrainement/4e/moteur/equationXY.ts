import { evaluerExpressionGenerale } from "./expressionGenerale";
import { lireNombre, normaliserExpression } from "./verificationTransfertSecondDegre";

/**
 * Lecture et jugement des saisies du lot G du chapitre 7 de 4e (gen92–gen95) : une ÉQUATION en x et
 * y (droite ou cercle, sous n'importe quelle forme équivalente — cartésienne, explicite, non
 * développée, développée, multipliée par une constante non nulle) et une VALEUR EXACTE de longueur
 * (entier, fraction, racine « √20 », « 2√5 »).
 *
 * Équation : les deux membres sont évalués en huit points fixes non particuliers ; la saisie est
 * juste quand « membre de gauche − membre de droite » est proportionnel (facteur non nul) à
 * l'équation attendue ramenée à « … = 0 ». Une saisie sans « = » n'est pas une équation : statut
 * `forme` (message, aucune tentative comptée), comme une saisie illisible (`parse_error`).
 * Valeur exacte : une valeur DÉCIMALE proche d'une valeur irrationnelle attendue est refusée sans
 * tentative (statut `forme`) — la consigne demande la valeur exacte.
 */

export type FonctionXY = (x: number, y: number) => number;

export type StatutSaisieLotG = { etat: "correct" | "faux" | "piege" | "parse_error" | "forme"; message?: string };

const POINTS: [number, number][] = [
  [0.37, -1.21],
  [1.9, 0.43],
  [-2.3, 2.7],
  [0.11, 3.3],
  [-1.7, -0.6],
  [2.6, -2.2],
  [3.1, 1.4],
  [-0.8, 0.9],
];

/** Préfixe recopié devant l'équation : « d : », « d ≡ », « (d) : », « t ≡ », « 𝒞 : », « Γ : ». */
function sansNom(s: string): string {
  return s.replace(/^\s*\(?\s*[a-zA-Zα-ωΓΔ𝒞][a-zA-Z0-9_'′″₀-₉]*\s*\)?\s*(?::|≡)\s*/u, "").trim();
}

export type LectureEquationXY = { valeurs: number[] } | { erreur: "illisible" | "sans-egal" };

/** Valeurs de « gauche − droite » aux points de contrôle. */
export function lireEquationXY(saisie: string): LectureEquationXY {
  const s = normaliserExpression(sansNom(saisie).replace(/≡/g, "="));
  if (s === "") return { erreur: "illisible" };
  const membres = s.split("=");
  if (membres.length === 1) {
    try {
      evaluerExpressionGenerale(membres[0]!, 0.5, { y: 0.5 });
      return { erreur: "sans-egal" };
    } catch {
      return { erreur: "illisible" };
    }
  }
  if (membres.length !== 2 || membres.some((m) => m.trim() === "")) return { erreur: "illisible" };
  const valeurs: number[] = [];
  try {
    for (const [x, y] of POINTS) {
      valeurs.push(evaluerExpressionGenerale(membres[0]!, x, { y }) - evaluerExpressionGenerale(membres[1]!, x, { y }));
    }
  } catch {
    return { erreur: "illisible" };
  }
  return { valeurs };
}

/** Les valeurs sont-elles k·cible (k ≠ 0) aux points de contrôle ? */
export function proportionnelle(valeurs: number[], cible: FonctionXY): boolean {
  if (valeurs.some((v) => !Number.isFinite(v))) return false;
  const t = POINTS.map(([x, y]) => cible(x, y));
  let j = 0;
  for (let i = 1; i < t.length; i++) if (Math.abs(t[i]!) > Math.abs(t[j]!)) j = i;
  if (Math.abs(t[j]!) < 1e-12) return false;
  const k = valeurs[j]! / t[j]!;
  if (Math.abs(k) < 1e-9) return false;
  return valeurs.every((v, i) => Math.abs(v - k * t[i]!) <= 1e-7 * Math.max(1, Math.abs(v), Math.abs(k * t[i]!)));
}

export interface PiegeEquationXY {
  f: FonctionXY;
  message: string;
}

export const MESSAGE_SANS_EGAL = "Écris une équation complète, avec le signe « = » (par exemple $3x+4y-32=0$).";

export function verifierEquationXY(saisie: string, cible: FonctionXY, pieges: PiegeEquationXY[], messageSiFaux?: string): StatutSaisieLotG {
  const l = lireEquationXY(saisie);
  if ("erreur" in l) return l.erreur === "illisible" ? { etat: "parse_error" } : { etat: "forme", message: MESSAGE_SANS_EGAL };
  if (l.valeurs.every((v) => Math.abs(v) < 1e-9)) return { etat: "faux", message: "Ton égalité est vraie pour tous les points du plan : ce n'est l'équation d'aucune droite ni d'aucun cercle." };
  if (proportionnelle(l.valeurs, cible)) return { etat: "correct" };
  const p = pieges.find((x) => proportionnelle(l.valeurs, x.f));
  if (p) return { etat: "piege", message: p.message };
  return { etat: "faux", message: messageSiFaux };
}

/** Le point (x ; y) vérifie-t-il l'équation saisie ? `null` si illisible. */
export function equationPasseParPoint(saisie: string, x: number, y: number): boolean | null {
  const s = normaliserExpression(sansNom(saisie).replace(/≡/g, "="));
  const membres = s.split("=");
  if (membres.length !== 2) return null;
  try {
    return Math.abs(evaluerExpressionGenerale(membres[0]!, x, { y }) - evaluerExpressionGenerale(membres[1]!, x, { y })) < 1e-9;
  } catch {
    return null;
  }
}

/* ---------------------------------------------------------------------------------------------
 * Valeur exacte
 * ------------------------------------------------------------------------------------------- */

function sansPrefixeNombre(s: string): string {
  return s
    .trim()
    .replace(/^[a-zA-Z][a-zA-Z0-9_₀-₉'′]*\s*(?:\([^)]*\))?\s*=\s*/, "")
    .replace(/^\|\|?\s*\\?vec\{?[A-Z]+\}?\s*\|\|?\s*=\s*/, "")
    .replace(/^[A-Z]{2}\s*=\s*/, "")
    .trim();
}

export interface PiegeValeur {
  valeur: number;
  message: string;
}

export function lireValeurExacte(saisie: string): number | null {
  return lireNombre(sansPrefixeNombre(saisie));
}

export function verifierValeurExacte(saisie: string, cible: number, pieges: PiegeValeur[], messageSiFaux?: string): StatutSaisieLotG {
  const brut = sansPrefixeNombre(saisie);
  const v = lireNombre(brut);
  if (v === null) return { etat: "parse_error" };
  if (Math.abs(v - cible) < 1e-7 * Math.max(1, Math.abs(cible))) return { etat: "correct" };
  const decimal = /\d[.,]\d/.test(brut) && !/√|sqrt/.test(brut);
  if (decimal && Math.abs(v - cible) < 0.05 * Math.max(1, Math.abs(cible))) {
    return { etat: "forme", message: "C'est une valeur approchée : donne la valeur exacte (par exemple $\\sqrt{20}$ ou $2\\sqrt{5}$)." };
  }
  const p = pieges.find((x) => Math.abs(v - x.valeur) < 1e-7 * Math.max(1, Math.abs(x.valeur)));
  if (p) return { etat: "piege", message: p.message };
  return { etat: "faux", message: messageSiFaux };
}
