/**
 * 5gen24 — saisies refusées SANS tentative (lots B–D, règles communes), partagées par le moteur et
 * l'écran : illisible (nombre, ±∞, expression), ou valeur décimale approchée d'une valeur exacte
 * (point vide, coefficients, coordonnées). Rend le message à afficher, ou null.
 */
import type { ExerciceEtudeComplete } from "../core5e/etudeComplete.types";
import type { PhaseEtudeComplete } from "./typesEtudeComplete";
import { estApprochee } from "./lectureLimitesLotG";
import { expressionIllisible, nombreIllisible } from "./saisieLimites";

const FIN = " Cette saisie ne compte pas comme une tentative.";
const NOMBRE = "Valeur non reconnue : écris un nombre exact (par exemple −3 ou 5/2), +∞ ou −∞ (« +inf », « -inf » sont acceptés)." + FIN;
const LISTE = "Valeur non reconnue : écris chaque valeur exclue comme un nombre, par exemple −2 (une valeur par ligne)." + FIN;
const EXPRESSION = "Expression non reconnue : vérifie les parenthèses, les signes et la place de x." + FIN;
const APPROCHEE = "C'est une valeur approchée : on demande la valeur exacte (entier ou fraction, par exemple 5/2)." + FIN;

const sansPrefixe = (s: string) => s.replace(/^\s*(?:AV|AH|AO)?\s*[:≡]?\s*[xy]\s*=\s*/i, "");

/** Valeurs exactes attendues de l'écran (pour repérer une décimale approchée). */
function cibles(e: ExerciceEtudeComplete, phase: PhaseEtudeComplete): number[] {
  if (e.mode !== "etude") return [];
  const inf = e.infini;
  switch (phase) {
    case "domaine":
    case "av":
      return e.exclusions.map((x) => x.position);
    case "pointVideLimite":
      return e.exclusions.filter((x) => x.type === "pointVide").map((x) => x.valeurPointVide as number);
    case "infini":
      return inf.type === "horizontale" ? [inf.limite] : [];
    case "coefDirecteur":
      return inf.type === "oblique" ? [inf.pente] : [];
    case "coefB":
      return inf.type === "oblique" ? [inf.ordonnee] : [];
    case "casSpecial":
      return e.casSpecial ? [e.casSpecial.x, e.casSpecial.y] : [];
    default:
      return [];
  }
}

export function refusSaisieEtude(e: ExerciceEtudeComplete, phase: PhaseEtudeComplete, valeurs: string[]): string | null {
  const v = valeurs.map(sansPrefixe).filter((s) => s.trim() !== "");
  if (phase === "pointVideSimplification" || phase === "constructionInverse") return v.some((s) => expressionIllisible(s)) ? EXPRESSION : null;
  if (phase === "asymptoteInfini") {
    // Un bloc « oblique » est une expression en x ; un bloc « horizontale » un nombre.
    if (v.some((s) => nombreIllisible(s) && expressionIllisible(s))) return EXPRESSION;
    return null;
  }
  if (v.some((s) => nombreIllisible(s))) return phase === "domaine" || phase === "av" ? LISTE : NOMBRE;
  const c = cibles(e, phase);
  if (v.some((s) => c.some((x) => estApprochee(s, x)))) return APPROCHEE;
  return null;
}
