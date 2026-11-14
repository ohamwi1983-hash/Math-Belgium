import { appliquerRecurrence, ecarts, premiersTermes, rapports, valeurExplicite, valeurExpliciteReelle, versNombre } from "../core5e/definirSuite";
import type { ExerciceDefinirSuite, ExerciceNature, FormuleExplicite, Q, RecurrenceLineaire } from "../core5e/definirSuite";
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { StatutVerification } from "../moteur/statutVerification";
import { sansEspacesMilliers } from "./saisieNombreSuites";
import type { PhaseDefinirSuite } from "./typesDefinirSuite";

/**
 * Couche B (5e) — vérification de `5gen44` « Définir et reconnaître une suite ». Valeurs attendues
 * tirées de `core5e/definirSuite.ts` (source unique).
 *
 * - Expression en n (uₙ₊₁, u₂ₙ, uₙ₋₁, uₙ₊₁ − uₙ, uₙ₊₁/uₙ) : ÉQUIVALENCE, évaluée aux rangs entiers
 *   1, 2, 3, 4, 5, 7, 10 (2, …, 11 pour uₙ₋₁) — toute écriture équivalente est acceptée, simplifiée
 *   ou non.
 * - Expression en uₙ et n (nature d'une récurrence) : l'élève écrit u (ou un, u_n, uₙ) pour uₙ ;
 *   équivalence aux points (u, n) de `POINTS_UN`.
 * - Nombre (uₚ, u₂, u₃, u₄, écarts, rapports) : valeur EXACTE (fraction ou décimal exact) ; une valeur
 *   approchée est refusée avec un message qui demande la valeur exacte.
 * - Verdict : choix fermé, une seule tentative.
 */

const RANGS = [1, 2, 3, 4, 5, 7, 10];
const RANGS_PRECEDENT = [2, 3, 4, 5, 6, 8, 11];
const POINTS_UN: [number, number][] = [
  [2, 1],
  [3, 2],
  [5, 3],
  [-1.5, 4],
  [7, 6],
  [0.5, 5],
  [-4, 9],
];

/** Type de lecture d'un champ : expression en n, expression en uₙ (et n), ou nombre exact. */
export type TypeChamp = "n" | "un" | "nombre";

/** Valeurs exactes attendues des écrans à nombres (récurrence, écarts, rapports, uₚ). */
export function nombresAttendus(e: ExerciceDefinirSuite, phase: PhaseDefinirSuite): Q[] {
  switch (phase) {
    case "terme":
      return e.variante === "notations" ? [valeurExplicite(e.f, e.p)] : [];
    case "terme2":
    case "terme3":
    case "terme4": {
      const k = Number(phase.slice(-1));
      return [premiersTermes(e, k)[k - 1]];
    }
    case "ecarts":
      return e.variante === "nature-termes" ? ecarts(e.termes) : [];
    case "rapports":
      return e.variante === "nature-termes" ? rapports(e.termes) : [];
    default:
      return [];
  }
}

type Attendu = { type: "nombre"; valeur: Q } | { type: "n"; f: (n: number) => number; rangs: number[] } | { type: "un"; f: (u: number, n: number) => number };

function differenceLineaire(g: RecurrenceLineaire, u: number, n: number): number {
  return (versNombre(g.A) - 1) * u + g.B * n + g.C;
}

function quotientLineaire(g: RecurrenceLineaire, u: number, n: number): number {
  return versNombre(g.A) + (g.B * n + g.C) / u;
}

/** Attendus, champ par champ, d'un écran à champs. */
export function attendusEcran(e: ExerciceDefinirSuite, phase: PhaseDefinirSuite): Attendu[] {
  switch (phase) {
    case "suivant":
      if (e.variante !== "notations") return [];
      return [{ type: "n", f: (n) => valeurExpliciteReelle(e.f, n + 1), rangs: RANGS }];
    case "autre":
      if (e.variante !== "notations") return [];
      return e.autre === "double" ? [{ type: "n", f: (n) => valeurExpliciteReelle(e.f, 2 * n), rangs: RANGS }] : [{ type: "n", f: (n) => valeurExpliciteReelle(e.f, n - 1), rangs: RANGS_PRECEDENT }];
    case "difference":
      if (e.variante === "nature-formule") {
        const f = e.f;
        return [{ type: "n", f: (n) => valeurExpliciteReelle(f, n + 1) - valeurExpliciteReelle(f, n), rangs: RANGS }];
      }
      if (e.variante === "nature-recurrence") {
        const g = e.g;
        return [{ type: "un", f: (u, n) => differenceLineaire(g, u, n) }];
      }
      return [];
    case "quotient":
      if (e.variante === "nature-formule") {
        const f = e.f;
        return [{ type: "n", f: (n) => valeurExpliciteReelle(f, n + 1) / valeurExpliciteReelle(f, n), rangs: RANGS }];
      }
      if (e.variante === "nature-recurrence") {
        const g = e.g;
        return [{ type: "un", f: (u, n) => quotientLineaire(g, u, n) }];
      }
      return [];
    case "verdict":
      return [];
    default:
      return nombresAttendus(e, phase).map((valeur) => ({ type: "nombre", valeur }));
  }
}

// ============================================================================
// Lecture des saisies.
// ============================================================================

/** « uₙ », « u_n », « u_{n} », « un » → « u » (la lettre de l'élève pour uₙ). */
export function normaliserU(texte: string): string {
  return texte.replace(/u\s*(?:_\s*\{\s*n\s*\}|_\s*n|ₙ|n(?![a-z]))/gi, "u");
}

/** Évalue une saisie ; `null` si elle est illisible (syntaxe, lettre inconnue, x à la place de n). */
function evaluer(texte: string, type: TypeChamp, n: number, u: number): number | null {
  const brut = type === "nombre" ? sansEspacesMilliers(texte) : texte;
  if (/x/i.test(brut)) return null;
  try {
    if (type === "nombre") return evaluerExpressionGenerale(brut, NaN, {});
    if (type === "n") return evaluerExpressionGenerale(brut, NaN, { n });
    return evaluerExpressionGenerale(normaliserU(brut), NaN, { u, n });
  } catch {
    return null;
  }
}

function proche(v: number, cible: number, tol = 1e-7): boolean {
  return Math.abs(v - cible) <= tol * Math.max(1, Math.abs(cible));
}

/** La saisie (expression) coïncide-t-elle avec `f` en tous les points où `f` est définie ? `null` : illisible. */
function coincide(texte: string, attendu: Attendu): boolean | null {
  if (attendu.type === "nombre") {
    const v = evaluer(texte, "nombre", 0, 0);
    if (v === null || Number.isNaN(v)) return null;
    return proche(v, versNombre(attendu.valeur), 1e-9);
  }
  const points: [number, number][] = attendu.type === "n" ? attendu.rangs.map((n) => [0, n]) : POINTS_UN;
  let lisible = false;
  for (const [u, n] of points) {
    const cible = attendu.type === "n" ? attendu.f(n) : attendu.f(u, n);
    const v = evaluer(texte, attendu.type, n, u);
    if (v === null) return null;
    if (!Number.isFinite(cible)) continue;
    if (Number.isNaN(v)) return null;
    lisible = true;
    if (!Number.isFinite(v) || !proche(v, cible)) return false;
  }
  return lisible ? true : null;
}

/** Statut champ par champ (`[statut]` pour le choix fermé). */
export function diagnostiquerChamps(e: ExerciceDefinirSuite, phase: PhaseDefinirSuite, valeurs: string[]): StatutVerification[] {
  if (phase === "verdict") return [e.variante !== "notations" && e.variante !== "recurrence" && valeurs[0] === e.verdict ? "correct" : "not_equivalent"];
  return attendusEcran(e, phase).map((attendu, i) => {
    const r = coincide(valeurs[i] ?? "", attendu);
    if (r === null) return "parse_error";
    return r ? "correct" : "not_equivalent";
  });
}

export function diagnostiquerEcran(e: ExerciceDefinirSuite, phase: PhaseDefinirSuite, valeurs: string[]): StatutVerification {
  const statuts = diagnostiquerChamps(e, phase, valeurs);
  if (statuts.includes("parse_error")) return "parse_error";
  return statuts.every((s) => s === "correct") ? "correct" : "not_equivalent";
}

export function verifierEcran(e: ExerciceDefinirSuite, phase: PhaseDefinirSuite, valeurs: string[]): boolean {
  return diagnostiquerEcran(e, phase, valeurs) === "correct";
}

/** Message d'une saisie non lue (aucune tentative décomptée). */
export function messageIllisible(e: ExerciceDefinirSuite, phase: PhaseDefinirSuite, valeurs: string[]): string {
  const types = attendusEcran(e, phase).map((a) => a.type);
  if (valeurs.some((v) => /x/i.test(v))) return "La variable de rang s'appelle n, pas x : réécris ton expression avec n. Aucune tentative n'a été comptée.";
  if (types.includes("nombre") && valeurs.some((v) => /[a-z]/i.test(v))) return "On attend un nombre (entier, décimal ou fraction), sans lettre. Aucune tentative n'a été comptée.";
  if (types.includes("un")) return "Écriture non reconnue — écris u pour uₙ, n pour le rang, et vérifie les parenthèses. Aucune tentative n'a été comptée.";
  return "Écriture non reconnue — vérifie les parenthèses et l'écriture des puissances et des fractions. Aucune tentative n'a été comptée.";
}

// ============================================================================
// Pièges reconnus (jamais la valeur attendue).
// ============================================================================

function exprN(f: (n: number) => number, rangs = RANGS): Attendu {
  return { type: "n", f, rangs };
}

function estExpr(texte: string, f: (n: number) => number, rangs = RANGS): boolean {
  return coincide(texte, exprN(f, rangs)) === true;
}

function estNombre(texte: string, x: number): boolean {
  const v = evaluer(texte, "nombre", 0, 0);
  return v !== null && Number.isFinite(v) && proche(v, x, 1e-9);
}

/** Substitutions partielles de n (une seule occurrence remplacée) : second degré et homographique. */
function partielles(f: FormuleExplicite, s: (n: number) => number): ((n: number) => number)[] {
  if (f.type === "second-degre") return [(n) => f.a * s(n) * s(n) + f.b * n + f.c, (n) => f.a * n * n + f.b * s(n) + f.c];
  if (f.type === "homographique") return [(n) => (f.a * s(n) + f.b) / (f.c * n + f.d), (n) => (f.a * n + f.b) / (f.c * s(n) + f.d)];
  if (f.type === "somme-expo") return [(n) => Math.pow(f.p, s(n)) + f.alpha * n + f.beta, (n) => Math.pow(f.p, n) + f.alpha * s(n) + f.beta];
  return [];
}

function piegeNotations(e: Extract<ExerciceDefinirSuite, { variante: "notations" }>, phase: PhaseDefinirSuite, texte: string): string | null {
  const f = (n: number) => valeurExpliciteReelle(e.f, n);
  if (phase === "suivant") {
    if (estExpr(texte, (n) => f(n) + 1)) {
      const expo = e.f.type === "exponentielle" ? " Si tu voulais l'exposant n + 1, mets-le entre parenthèses au clavier." : "";
      return `Tu as écrit uₙ + 1 (le terme augmenté de 1) : uₙ₊₁ est le terme de RANG n + 1, il faut remplacer n par (n + 1) dans la formule.${expo}`;
    }
    if (estExpr(texte, f)) return "C'est uₙ lui-même : remplace chaque n par (n + 1).";
    if (partielles(e.f, (n) => n + 1).some((g) => estExpr(texte, g))) return "Remplace CHAQUE n de la formule par (n + 1), pas seulement le premier.";
    return null;
  }
  if (phase === "autre") {
    if (e.autre === "double") {
      if (estExpr(texte, (n) => 2 * f(n))) return "Tu as calculé 2uₙ, le double du terme : u₂ₙ est le terme de RANG 2n, il faut remplacer n par 2n.";
      if (partielles(e.f, (n) => 2 * n).some((g) => estExpr(texte, g))) return "Remplace CHAQUE n de la formule par 2n.";
      const sd = e.f;
      if (sd.type === "second-degre" && estExpr(texte, (n) => 2 * sd.a * n * n + 2 * sd.b * n + sd.c)) return "Attention au carré : (2n)² = 4n², pas 2n².";
      return null;
    }
    if (estExpr(texte, (n) => f(n) - 1, RANGS_PRECEDENT)) return "Tu as écrit uₙ − 1 (le terme diminué de 1) : uₙ₋₁ est le terme de RANG n − 1, il faut remplacer n par (n − 1).";
    if (partielles(e.f, (n) => n - 1).some((g) => estExpr(texte, g, RANGS_PRECEDENT))) return "Remplace CHAQUE n de la formule par (n − 1).";
    return null;
  }
  if (phase === "terme") {
    if (estNombre(texte, f(e.p - 1))) return `Tu as calculé le terme de rang ${e.p - 1} : la formule est explicite, remplace directement n par ${e.p} (pas de « n − 1 » ici).`;
    if (estNombre(texte, f(e.p + 1))) return `Tu as calculé le terme de rang ${e.p + 1} : remplace n par ${e.p}, pas par ${e.p + 1}.`;
    const v = evaluer(texte, "nombre", 0, 0);
    if (v !== null && Number.isFinite(v) && proche(v, f(e.p), 0.01) && !proche(v, f(e.p), 1e-9)) return "Donne la valeur exacte (une fraction si besoin), pas une valeur arrondie.";
    return null;
  }
  return null;
}

function piegeRecurrence(e: Extract<ExerciceDefinirSuite, { variante: "recurrence" }>, phase: PhaseDefinirSuite, texte: string): string | null {
  const k = Number(phase.slice(-1));
  const t = premiersTermes(e, k);
  const prec = t[k - 2];
  const cible = versNombre(t[k - 1]);
  const v = evaluer(texte, "nombre", 0, 0);
  if (v === null || !Number.isFinite(v)) return null;
  if (proche(v, versNombre(prec), 1e-9)) return `C'est le terme précédent, u${"₀₁₂₃"[k - 1]} : applique-lui la relation pour obtenir le suivant.`;
  // uₙ remplacé par le RANG n au lieu de la valeur du terme.
  try {
    const parRang = versNombre(appliquerRecurrence(e.g, { num: k - 1, den: 1 }));
    if (proche(v, parRang, 1e-9) && !proche(parRang, cible, 1e-9)) return `Dans la relation, on remplace uₙ par la VALEUR du terme précédent, pas par son rang ${k - 1}.`;
  } catch {
    // Relation non définie au rang : rien à reconnaître.
  }
  const u = versNombre(prec);
  if (e.g.type === "carre") {
    if (u < 0 && proche(v, -u * u + e.g.c, 1e-9)) return "Le carré d'un nombre négatif est positif : (−a)² = a².";
    if (proche(v, 2 * u + e.g.c, 1e-9)) return "uₙ² est uₙ × uₙ, pas 2 × uₙ.";
  } else {
    const num = e.g.alpha * u + e.g.beta;
    const den = e.g.gamma * u + e.g.delta;
    if (num !== 0 && proche(v, den / num, 1e-9)) return "Ta fraction est à l'envers : le numérateur de la relation reste au numérateur.";
  }
  if (proche(v, cible, 0.01)) return "Donne la valeur exacte (une fraction si besoin), pas une valeur arrondie.";
  return null;
}

function piegeNature(e: ExerciceNature, phase: PhaseDefinirSuite, valeurs: string[]): string | null {
  if (phase === "ecarts" || phase === "rapports") {
    if (e.variante !== "nature-termes") return null;
    const t = e.termes.map(versNombre);
    const lus = valeurs.map((x) => evaluer(x, "nombre", 0, 0));
    if (lus.some((x) => x === null)) return null;
    const v = lus as number[];
    if (phase === "ecarts") {
      if (v.some((x, i) => !proche(x, t[i + 1] - t[i], 1e-9) && proche(x, t[i] - t[i + 1], 1e-9))) return "Un écart se calcule dans l'ordre : le terme MOINS le précédent (uₖ₊₁ − uₖ), pas l'inverse.";
      return null;
    }
    if (v.some((x, i) => !proche(x, t[i + 1] / t[i], 1e-9) && proche(x, t[i] / t[i + 1], 1e-9))) return "Rapport pris à l'envers : c'est le terme DIVISÉ par le précédent (uₖ₊₁/uₖ).";
    if (v.some((x, i) => !proche(x, t[i + 1] / t[i], 1e-9) && proche(x, t[i + 1] / t[i], 0.01))) return "Donne les rapports exacts (fractions), pas des valeurs arrondies.";
    return null;
  }
  const texte = valeurs[0] ?? "";
  if (e.variante === "nature-formule") {
    const f = (n: number) => valeurExpliciteReelle(e.f, n);
    if (phase === "difference") {
      if (estExpr(texte, (n) => f(n) - f(n + 1))) return "Tu as calculé uₙ − uₙ₊₁ : c'est le terme suivant MOINS le terme courant, uₙ₊₁ − uₙ.";
      if (estNombre(texte, 1)) return "uₙ₊₁ n'est pas uₙ + 1 : remplace n par (n + 1) dans la formule avant de soustraire uₙ.";
      return null;
    }
    if (phase === "quotient") {
      if (estExpr(texte, (n) => f(n) / f(n + 1))) return "Quotient pris à l'envers : c'est uₙ₊₁ divisé par uₙ (le terme suivant au numérateur).";
      if (estExpr(texte, (n) => (f(n) + 1) / f(n))) return "uₙ₊₁ n'est pas uₙ + 1 : remplace n par (n + 1) dans la formule.";
      if (estExpr(texte, (n) => f(n + 1) - f(n))) return "Ça, c'est la différence uₙ₊₁ − uₙ : on demande maintenant le QUOTIENT.";
      return null;
    }
    return null;
  }
  if (e.variante === "nature-recurrence") {
    const g = e.g;
    const un = (h: (u: number, n: number) => number) => coincide(texte, { type: "un", f: h }) === true;
    if (phase === "difference") {
      if (un((u, n) => -differenceLineaire(g, u, n))) return "Tu as calculé uₙ − uₙ₊₁ : c'est uₙ₊₁ MOINS uₙ.";
      if (un((u, n) => differenceLineaire(g, u, n) + u)) return "C'est uₙ₊₁ lui-même : il reste à soustraire uₙ.";
      return null;
    }
    if (phase === "quotient") {
      if (un((u, n) => 1 / quotientLineaire(g, u, n))) return "Quotient pris à l'envers : c'est uₙ₊₁ divisé par uₙ.";
      if (un((u, n) => quotientLineaire(g, u, n) * u)) return "C'est uₙ₊₁ lui-même : il reste à diviser par uₙ.";
      return null;
    }
  }
  return null;
}

/** Message ciblé sur une erreur classique, `null` si rien de reconnaissable (ou réponse juste). */
export function messagePiege(e: ExerciceDefinirSuite, phase: PhaseDefinirSuite, valeurs: string[]): string | null {
  if (phase === "verdict") return null;
  if (e.variante === "notations") return piegeNotations(e, phase, valeurs[0] ?? "");
  if (e.variante === "recurrence") return piegeRecurrence(e, phase, valeurs[0] ?? "");
  return piegeNature(e, phase, valeurs);
}

/** Explication après un verdict faux (choix fermé : affichée avec la réponse attendue). */
export function explicationVerdictFaux(e: ExerciceNature, choix: string): string {
  if (e.variante === "nature-termes") {
    if (e.verdict === "aucune") {
      if (e.piege === "ecart-dernier" && choix === "arithmetique") return "Les premiers écarts sont égaux, mais pas le dernier : un seul écart différent suffit pour qu'aucune suite arithmétique ne convienne.";
      if (e.piege === "rapport-dernier" && choix === "geometrique") return "Les premiers rapports sont égaux, mais pas le dernier : un seul rapport différent suffit pour qu'aucune suite géométrique ne convienne.";
      return "Il faut que TOUS les écarts (ou TOUS les rapports) soient égaux ; ici, ce n'est le cas ni pour les uns ni pour les autres.";
    }
    return e.verdict === "arithmetique" ? "Tous les écarts sont égaux : la liste est compatible avec une suite arithmétique." : "Tous les rapports sont égaux : la liste est compatible avec une suite géométrique.";
  }
  if (e.verdict === "aucune") return "La raison proposée ne vaut que pour les deux premiers termes : la différence et le quotient dépendent encore de n (ou de uₙ), ils ne sont pas constants.";
  if (e.verdict === "arithmetique") return "La différence uₙ₊₁ − uₙ simplifiée est un nombre constant : la suite est arithmétique.";
  return "Le quotient uₙ₊₁/uₙ simplifié est un nombre constant : la suite est géométrique.";
}
