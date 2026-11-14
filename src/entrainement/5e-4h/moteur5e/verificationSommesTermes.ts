import { coefficientFormuleGeom, donneesSomme, facteursMultiples, sommeGeom, termeArith, termeGeom, valeurQ } from "../core5e/sommesTermes.types";
import type { ExerciceSommesTermes } from "../core5e/sommesTermes.types";
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerNombre, sansEspacesMilliers } from "./saisieNombreSuites";
import { diagnostiquerFormuleGenerale } from "./verificationSuiteArithmetique";
import type { PhaseSommesTermes } from "./typesSommesTermes";

/**
 * Couche B (5e) — vérification de `5gen45` « Sommes de termes consécutifs ». Toutes les valeurs
 * attendues viennent de `core5e/sommesTermes.types.ts` (source unique). Saisie lue par les MÊMES
 * fonctions que 5gen14/5gen15 : `saisieNombreSuites.ts::diagnostiquerNombre` (espace des milliers
 * acceptée, virgule décimale, fraction « 1/2 », « − » typographique) et, pour le terme général des
 * nombres impairs/pairs, `diagnostiquerFormuleGenerale` (équivalence en n, comme 5gen14).
 * Toutes les réponses sont exactes (entiers, ou q = 1/2 et −1/2) : tolérance 0,01 de l'évaluateur.
 */

/** Valeurs numériques attendues, champ par champ (vide pour l'écran à expression). */
export function valeursAttendues(e: ExerciceSommesTermes, phase: PhaseSommesTermes): number[] {
  const d = donneesSomme(e);
  switch (phase) {
    case "nombreTermes":
      return [d.nombre];
    case "termesExtremes":
    case "bornesMultiples":
      return [d.premier, d.dernier];
    case "premierTerme":
      return [d.premier];
    case "raison":
      return [e.variante === "geom-extension" || e.variante === "geom-indices" ? valeurQ(e.q) : e.variante === "arith-extension" ? e.r : 0];
    case "somme":
      return [d.somme];
    case "formuleGenerale":
      return [];
  }
}

/** Statut champ par champ. */
export function diagnostiquerChamps(e: ExerciceSommesTermes, phase: PhaseSommesTermes, valeurs: string[]): StatutVerification[] {
  if (phase === "formuleGenerale") {
    if (e.variante !== "arith-extension") return ["parse_error"];
    return [diagnostiquerFormuleGenerale(e.premier, e.r, sansEspacesMilliers(valeurs[0] ?? ""))];
  }
  return valeursAttendues(e, phase).map((cible, i) => diagnostiquerNombre(valeurs[i] ?? "", cible));
}

export function diagnostiquerEcran(e: ExerciceSommesTermes, phase: PhaseSommesTermes, valeurs: string[]): StatutVerification {
  const statuts = diagnostiquerChamps(e, phase, valeurs);
  if (statuts.includes("parse_error")) return "parse_error";
  return statuts.every((s) => s === "correct") ? "correct" : "not_equivalent";
}

export function verifierEcran(e: ExerciceSommesTermes, phase: PhaseSommesTermes, valeurs: string[]): boolean {
  return diagnostiquerEcran(e, phase, valeurs) === "correct";
}

/** Message d'une saisie non lue (aucune tentative décomptée). */
export function messageIllisible(phase: PhaseSommesTermes): string {
  if (phase === "formuleGenerale") {
    return "Expression non reconnue — écris une expression en n, par exemple 5n + 3 ; aucune tentative n'a été comptée.";
  }
  return "Écriture non reconnue — écris un nombre (virgule décimale, fraction comme 3/4) ; aucune tentative n'a été comptée.";
}

// ============================================================================
// Pièges reconnus (jamais la valeur attendue).
// ============================================================================

function lire(texte: string): number | null {
  try {
    const v = evaluerExpressionGenerale(sansEspacesMilliers(texte), 0);
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

function egal(v: number, cible: number): boolean {
  return Math.abs(v - cible) <= 0.01;
}

const PLUS_UN = "Tu as compté les écarts entre le premier et le dernier terme, pas les termes : il y a toujours un terme de plus que d'écarts (comme des piquets et des intervalles).";

function piegeNombreTermes(e: ExerciceSommesTermes, v: number): string | null {
  const d = donneesSomme(e);
  if (egal(v, d.nombre)) return null;
  if (egal(v, d.nombre - 1)) return PLUS_UN;
  if (egal(v, d.nombre + 1)) return "Un terme de trop : compte les termes du premier au dernier, sans en ajouter.";
  switch (e.variante) {
    case "arith-indices":
    case "geom-indices":
      if (egal(v, e.n)) return "Ce nombre est le rang du dernier terme : la somme ne commence pas à u₁, les termes avant uₚ n'en font pas partie.";
      return null;
    case "arith-extension":
      if (e.sousCas === "liste" && egal(v, d.dernier - d.premier)) return "L'écart entre le dernier et le premier terme contient plusieurs fois la raison : divise-le par la raison.";
      if (e.sousCas === "naturels" && egal(v, d.dernier)) return "Ce nombre est la VALEUR du dernier terme, pas son rang : cherche n tel que uₙ vaut ce dernier terme.";
      if (e.sousCas === "multiples") {
        const [, k2] = facteursMultiples(e);
        if (egal(v, k2)) return "Tu as compté les multiples depuis le tout premier : ceux qui sont plus petits que la borne inférieure ne font pas partie de la somme.";
      }
      return null;
    case "geom-extension":
      if (egal(v, d.dernier / d.premier)) return "Ce nombre est une puissance de q : écris-le sous la forme q exposant (N − 1) pour trouver N.";
      return null;
  }
}

function piegeRaison(e: ExerciceSommesTermes, v: number): string | null {
  if (e.variante === "arith-extension") {
    if (egal(v, -e.r)) return "La raison est un terme MOINS le précédent, pas l'inverse : son signe dit si les termes augmentent ou diminuent.";
    return null;
  }
  if (e.variante !== "geom-extension") return null;
  const q = valeurQ(e.q);
  if (egal(v, q)) return null;
  if (egal(v, 1 / q)) return "Tu as divisé à l'envers : q est un terme divisé par le terme PRÉCÉDENT.";
  if (egal(v, termeGeom(e.premier, e.q, 2) - e.premier)) return "Dans une suite géométrique, on passe d'un terme au suivant en MULTIPLIANT : q est un quotient, pas une différence.";
  if (q < 0 && egal(v, -q)) return "Attention au signe : les termes changent de signe à chaque fois, donc q est négatif.";
  return null;
}

function piegeSomme(e: ExerciceSommesTermes, v: number): string | null {
  const d = donneesSomme(e);
  if (egal(v, d.somme)) return null;
  if (e.variante === "arith-indices" || e.variante === "arith-extension") {
    if (egal(v, d.nombre * (d.premier + d.dernier))) return "Tu as oublié de diviser par 2 : la somme vaut N fois la MOYENNE du premier et du dernier terme.";
    if (egal(v, ((d.nombre - 1) * (d.premier + d.dernier)) / 2) || egal(v, ((d.nombre + 1) * (d.premier + d.dernier)) / 2)) {
      return "Vérifie le facteur N : c'est le nombre de termes de la somme, trouvé plus haut.";
    }
    if (e.variante === "arith-indices") {
      const sn = (e.n * (e.u1 + d.dernier)) / 2;
      if (egal(v, sn)) return "Tu as calculé la somme depuis u₁ : ici, elle commence à uₚ, les premiers termes n'en font pas partie.";
      const sp = (e.p * (e.u1 + termeArith(e.u1, e.r, e.p))) / 2;
      if (egal(v, sn - sp)) return "En retirant la somme jusqu'à uₚ, tu as aussi retiré uₚ, qui fait partie de la somme.";
    }
    return null;
  }
  if (egal(v, -d.somme)) return "Erreur de signe : écris le numérateur et le dénominateur dans le même ordre, 1 − qᴺ et 1 − q (ou qᴺ − 1 et q − 1).";
  if (egal(v, sommeGeom(d.premier, e.q, d.nombre - 1)) || egal(v, sommeGeom(d.premier, e.q, d.nombre + 1))) {
    return "L'exposant de q dans la formule est exactement N, le nombre de termes de la somme.";
  }
  if (e.variante === "geom-indices") {
    if (egal(v, sommeGeom(e.u1, e.q, d.nombre))) return "Le facteur devant la fraction est le PREMIER TERME DE LA SOMME (uₚ), pas u₁.";
    if (egal(v, sommeGeom(e.u1, e.q, e.n))) return "Tu as calculé la somme depuis u₁ : ici, elle commence à uₚ, les premiers termes n'en font pas partie.";
  }
  return null;
}

/** Message ciblé sur une erreur classique, `null` si rien de reconnaissable (ou réponse juste). */
export function messagePiege(e: ExerciceSommesTermes, phase: PhaseSommesTermes, valeurs: string[]): string | null {
  if (phase === "formuleGenerale") {
    if (e.variante !== "arith-extension") return null;
    // u₁ + n·r au lieu de u₁ + (n − 1)·r : même suite décalée d'un rang.
    if (diagnostiquerFormuleGenerale(e.premier + e.r, e.r, sansEspacesMilliers(valeurs[0] ?? "")) === "correct") {
      return "Le facteur de la raison est (n − 1), pas n : vérifie ta formule avec n = 1, elle doit redonner le premier terme.";
    }
    return null;
  }
  const lus = valeurs.map(lire);
  if (lus.some((v) => v === null)) return null;
  const nombres = lus as number[];
  const d = donneesSomme(e);
  switch (phase) {
    case "nombreTermes":
      return piegeNombreTermes(e, nombres[0]);
    case "raison":
      return piegeRaison(e, nombres[0]);
    case "somme":
      return piegeSomme(e, nombres[0]);
    case "termesExtremes": {
      if (e.variante !== "arith-indices") return null;
      if ((!egal(nombres[0], d.premier) && egal(nombres[0], termeArith(e.u1, e.r, e.p + 1))) || (!egal(nombres[1], d.dernier) && egal(nombres[1], termeArith(e.u1, e.r, e.n + 1)))) {
        return "Le facteur de r est le rang moins 1 : uₚ = u₁ + (p − 1)r.";
      }
      return null;
    }
    case "premierTerme": {
      if (e.variante !== "geom-indices" || egal(nombres[0], d.premier)) return null;
      if (e.exposant === "n") {
        if (egal(nombres[0], termeGeom(coefficientFormuleGeom(e), e.q, e.p))) return "La formule donnée est en qⁿ : remplace n par le rang tel quel, l'exposant vaut p (et non p − 1).";
        return null;
      }
      if (egal(nombres[0], termeGeom(e.u1, e.q, e.p + 1))) return "L'exposant de q est le rang moins 1 : uₚ = u₁ × qᵖ⁻¹.";
      if (egal(nombres[0], termeGeom(e.u1, e.q, e.p - 1))) return "Tu t'es arrêté un rang trop tôt : uₚ = u₁ × qᵖ⁻¹.";
      return null;
    }
    case "bornesMultiples": {
      if (e.variante !== "arith-extension" || !e.bornes) return null;
      const [A, B] = e.bornes;
      const messages: string[] = [];
      if (!egal(nombres[0], d.premier)) {
        if (egal(nombres[0], d.premier - e.r)) messages.push("Ton premier multiple est plus petit que la borne inférieure : il n'est pas compris dans l'intervalle.");
        else if (egal(nombres[0], A)) messages.push("La borne inférieure n'est pas un multiple : cherche le premier multiple qui la suit.");
      }
      if (!egal(nombres[1], d.dernier)) {
        if (egal(nombres[1], d.dernier + e.r)) messages.push("Ton dernier multiple dépasse la borne supérieure : il n'est pas compris dans l'intervalle.");
        else if (egal(nombres[1], B)) messages.push("La borne supérieure n'est pas un multiple : cherche le dernier multiple qui la précède.");
      }
      return messages.length > 0 ? messages.join(" ") : null;
    }
    default:
      return null;
  }
}
