/**
 * 5gen23 — saisies refusées SANS tentative (lots B–D, règles communes) : illisible, ou valeur
 * approchée d'une valeur exacte (limites, mois, coefficients). Les évaluations arrondies (club,
 * population) n'ont que le contrôle d'illisibilité. Partagé par le moteur et l'écran.
 */
import type { ExerciceLimitesContexte } from "../core5e/limitesContexte.types";
import type { PhaseLimitesContexte } from "./typesLimitesContexte";
import { expressionIllisible, nombreExactRefuse, nombreIllisible } from "./saisieLimites";
import { retirerMembreGauche } from "./verificationLimitesContexte";

/** Saisie refusée sans tentative (illisible, ou valeur approchée d'une valeur exacte). */
export function saisieContexteRefusee(e: ExerciceLimitesContexte, phase: PhaseLimitesContexte, valeurs: string[]): boolean {
  const v = valeurs.map((s) => retirerMembreGauche(s));
  switch (phase) {
    case "asymptoteHorizontale":
      return e.famille === "prixRevient" && nombreExactRefuse(v[0], e.b);
    case "limiteC":
      return e.famille === "eauSalee" && nombreExactRefuse(v[0], e.c);
    case "inequation":
      return e.famille === "clubLoisirs" && nombreExactRefuse(v[0], e.moisAttendu);
    case "interpreterPente":
      return e.famille === "clubLoisirs" && nombreExactRefuse(v[0], e.a * e.facteur);
    case "identification":
      return e.famille === "population" && (nombreExactRefuse(v[0], e.a) || nombreExactRefuse(v[1], e.b));
    case "construireC":
      // Expression en t : lue comme une expression en x (même substitution que la vérification).
      return expressionIllisible(v[0].replace(/(?<![a-zA-Z])t(?![a-zA-Z])/g, "x"));
    case "asymptoteOblique":
      return expressionIllisible(v[0]);
    case "evaluer":
    case "evaluerSeuil":
      return v.some((s) => nombreIllisible(s));
    default:
      return false;
  }
}

