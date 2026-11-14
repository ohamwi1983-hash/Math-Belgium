import { aireConcentration, aireEnFonctionDeA, coefficientGini, evaluerLorenz, giniEnFonctionDeA, integraleLorenz } from "../core6e/lorenzGini";
import type { ExerciceLorenzComparaison, ExerciceLorenzGini, ExerciceLorenzParametre } from "../core6e/lorenzGini";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerEquivalenceFonction } from "./equivalenceExponentielle";
import { evaluerExpressionExponentielle, evaluerValeurExponentielle } from "./expressionExponentielle";
import type { PhaseLorenz } from "./typesLorenzGini";
import { diagnostiquerProbabilite } from "./verificationProbabilites";

/**
 * Couche B (6e) — vérification de `6gen82`. Toute valeur numérique (part des revenus, aire, Gini, a)
 * passe par `diagnostiquerProbabilite` : écriture EXACTE (fraction, expression avec e…), décimal
 * correctement arrondi au MILLIÈME au moins (précision annoncée dans chaque consigne) ou
 * pourcentage. Les expressions en a (variante paramètre) sont comparées par équivalence de
 * fonction (même brique que 6gen26, sous-type « paramètre »).
 *
 * `messagePiege` reconnaît les erreurs classiques (aire sous la courbe au lieu de l'aire entre la
 * diagonale et la courbe, facteur 2 oublié, Gini hors de [0 ; 1], part de la population au lieu de
 * la part des revenus) et les signale — sans jamais donner la valeur attendue.
 */

export const DECIMALES_MIN = 3;

/** Identifiant de l'option juste de l'interprétation (option canonique 0). */
export const ID_INTERPRETATION_JUSTE = "0";

/** Option juste du verdict : « 0 » si la répartition 1 est la plus inégalitaire, « 1 » sinon. */
export function idVerdictJuste(e: ExerciceLorenzComparaison): string {
  return coefficientGini(e.courbes[0]) > coefficientGini(e.courbes[1]) ? "0" : "1";
}

/** Valeurs numériques attendues, champ par champ, pour les écrans à champs numériques. */
export function valeursAttendues(e: ExerciceLorenzGini, phase: PhaseLorenz): number[] {
  switch (e.variante) {
    case "lecture":
      if (phase === "valeur") return [evaluerLorenz(e.courbe, e.p)];
      if (phase === "aire") return [aireConcentration(e.courbe)];
      if (phase === "gini") return [coefficientGini(e.courbe)];
      return [];
    case "comparaison":
      if (phase === "aires") return e.courbes.map(aireConcentration);
      if (phase === "ginis") return e.courbes.map(coefficientGini);
      return [];
    case "parametre":
      if (phase === "valeurA") return [e.a];
      return [];
  }
}

const POINTS_A = [0.2, 0.5, 0.9, 1.3];

function fonctionEnA(e: ExerciceLorenzParametre, phase: PhaseLorenz): (a: number) => number {
  return phase === "aireA" ? (a) => aireEnFonctionDeA(e.famille, a) : (a) => giniEnFonctionDeA(e.famille, a);
}

/** Statut champ par champ (`[statut]` pour un écran à choix). */
export function diagnostiquerChamps(e: ExerciceLorenzGini, phase: PhaseLorenz, valeurs: string[]): StatutVerification[] {
  if (phase === "interpretation") return [valeurs[0] === ID_INTERPRETATION_JUSTE ? "correct" : "not_equivalent"];
  if (phase === "verdict" && e.variante === "comparaison") return [valeurs[0] === idVerdictJuste(e) ? "correct" : "not_equivalent"];
  if ((phase === "aireA" || phase === "giniA") && e.variante === "parametre") {
    return [diagnostiquerEquivalenceFonction(valeurs[0] ?? "", fonctionEnA(e, phase), POINTS_A, 1e-3, "a")];
  }
  return valeursAttendues(e, phase).map((cible, i) => diagnostiquerProbabilite(valeurs[i] ?? "", cible, DECIMALES_MIN));
}

/** Statut global : `parse_error` prioritaire, puis `not_equivalent`. */
export function diagnostiquerEcran(e: ExerciceLorenzGini, phase: PhaseLorenz, valeurs: string[]): StatutVerification {
  const statuts = diagnostiquerChamps(e, phase, valeurs);
  if (statuts.includes("parse_error")) return "parse_error";
  return statuts.every((s) => s === "correct") ? "correct" : "not_equivalent";
}

export function verifierEcran(e: ExerciceLorenzGini, phase: PhaseLorenz, valeurs: string[]): boolean {
  return diagnostiquerEcran(e, phase, valeurs) === "correct";
}

// ============================================================================
// Pièges reconnus.
// ============================================================================

function lireNombre(texte: string): number | null {
  const brut = texte.trim();
  const pourcent = /%\s*$/.test(brut);
  const v = evaluerValeurExponentielle(pourcent ? brut.replace(/%\s*$/, "") : brut);
  if (v === null || !Number.isFinite(v)) return null;
  return pourcent ? v / 100 : v;
}

/** Égalité à l'arrondi près (millième, ou 2 % relatif pour les grandes valeurs). */
function proche(v: number, cible: number): boolean {
  return Math.abs(v - cible) <= Math.max(6e-4, 0.02 * Math.abs(cible));
}

function piegeAire(v: number, aire: number, sousCourbe: number): string | null {
  if (proche(v, aire)) return null;
  if (v < 0) return "Une aire est toujours positive : la diagonale est AU-DESSUS de la courbe de Lorenz, c'est x − L(x) qu'il faut intégrer.";
  if (proche(v, sousCourbe)) return "Ce nombre est l'aire SOUS la courbe de Lorenz ; on cherche l'aire comprise entre la diagonale et la courbe.";
  if (proche(v, 2 * aire)) return "Ce nombre est le double de l'aire demandée : c'est le coefficient de Gini, pas encore demandé ici.";
  return null;
}

function piegeGini(v: number, aire: number, sousCourbe: number): string | null {
  if (proche(v, 2 * aire)) return null;
  if (v > 1 || v < 0) return "Un coefficient de Gini est toujours compris entre 0 et 1 : ce résultat est impossible, reprends ton calcul.";
  if (proche(v, aire)) return "Ce nombre est l'aire entre la diagonale et la courbe : le coefficient de Gini compare cette aire à celle du triangle sous la diagonale.";
  if (proche(v, 2 * sousCourbe)) return "Tu as doublé l'aire SOUS la courbe de Lorenz, au lieu de l'aire comprise entre la diagonale et la courbe.";
  if (proche(v, sousCourbe)) return "Ce nombre est l'aire SOUS la courbe de Lorenz, pas l'aire comprise entre la diagonale et la courbe.";
  return null;
}

function valeurExpressionEnA(texte: string, a: number): number | null {
  try {
    const v = evaluerExpressionExponentielle(texte, { a });
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

/** Message ciblé sur une erreur classique, `null` si rien de reconnaissable (ou réponse juste). */
export function messagePiege(e: ExerciceLorenzGini, phase: PhaseLorenz, valeurs: string[], libelles: string[] = []): string | null {
  if (e.variante === "lecture") {
    const v = lireNombre(valeurs[0] ?? "");
    if (v === null) return null;
    const aire = aireConcentration(e.courbe);
    const sous = integraleLorenz(e.courbe);
    if (phase === "valeur") {
      if (proche(v, evaluerLorenz(e.courbe, e.p))) return null;
      if (proche(v, e.p)) return "Ce nombre est la part de la POPULATION ; on demande la part des revenus qu'elle détient, c'est-à-dire son image par L.";
      if (proche(v, 1 - evaluerLorenz(e.courbe, e.p))) return "Ce nombre est la part des revenus détenue par les autres, les plus riches ; L donne celle des plus pauvres.";
      return null;
    }
    if (phase === "aire") return piegeAire(v, aire, sous);
    if (phase === "gini") return piegeGini(v, aire, sous);
    return null;
  }
  if (e.variante === "comparaison") {
    if (phase !== "aires" && phase !== "ginis") return null;
    const messages: string[] = [];
    e.courbes.forEach((c, i) => {
      const v = lireNombre(valeurs[i] ?? "");
      if (v === null) return;
      const m = phase === "aires" ? piegeAire(v, aireConcentration(c), integraleLorenz(c)) : piegeGini(v, aireConcentration(c), integraleLorenz(c));
      if (m) messages.push(libelles[i] ? `${libelles[i]} : ${m.charAt(0).toLowerCase()}${m.slice(1)}` : m);
    });
    return messages.length > 0 ? messages.join(" ") : null;
  }
  // Paramètre.
  if (phase === "giniA") {
    const ok = POINTS_A.every((a) => {
      const v = valeurExpressionEnA(valeurs[0] ?? "", a);
      return v !== null && Math.abs(v - aireEnFonctionDeA(e.famille, a)) < 1e-3;
    });
    return ok ? "Cette expression est celle de l'aire : le coefficient de Gini compare l'aire à celle du triangle sous la diagonale." : null;
  }
  if (phase === "valeurA") {
    const v = lireNombre(valeurs[0] ?? "");
    if (v === null || proche(v, e.a)) return null;
    if (v > 1 || v < 0) return "Avec cette valeur, L ne serait plus une courbe de Lorenz (elle prendrait des valeurs négatives ou dépasserait la diagonale) : a doit être compris entre 0 et 1.";
    if (proche(v, 2 * e.a)) return "Avec cette valeur, c'est l'AIRE qui vaudrait le coefficient visé, pas le coefficient de Gini.";
    return null;
  }
  return null;
}
