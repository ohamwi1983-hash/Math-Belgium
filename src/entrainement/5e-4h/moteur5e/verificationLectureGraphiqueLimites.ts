/**
 * Couche B (5e) — vérification pour 5gen22 ("Limites et asymptotes, lecture graphique"). N'importe
 * jamais rien de `src/generateurs5e/`.
 *
 * Écran 1 : chaque champ peut attendre soit une valeur FINIE, soit ±∞ — AUCUN champ existant sur la
 * plateforme n'acceptait jusqu'ici ±∞ en texte libre (5gen20/6gen6 le sélectionnent par BOUTON,
 * jamais tapé). `normaliserInfini` reconnaît les formes usuelles ("+∞", "∞", "infini", "inf", "oo",
 * et leurs variantes négatives) AVANT toute tentative de parsing numérique ; un texte qui n'est ni
 * une forme infinie reconnue ni un nombre fini valide reste `"parse_error"`, jamais confondu avec
 * une réponse fausse mais lisible.
 */
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerValeurArcSecteur } from "./verificationArcsSecteurs";
import type { CibleAsymptote, CibleComportement } from "./typesLectureGraphiqueLimites";

const FORMES_INFINI_POSITIF = ["+∞", "∞", "+infini", "infini", "+inf", "inf", "+oo", "oo"];
const FORMES_INFINI_NEGATIF = ["-∞", "-infini", "-inf", "-oo"];

function normaliserInfini(texte: string): 1 | -1 | null {
  const t = texte.trim().toLowerCase().replace(/\s+/g, "");
  if (FORMES_INFINI_NEGATIF.includes(t)) return -1;
  if (FORMES_INFINI_POSITIF.includes(t)) return 1;
  return null;
}

/** Écran "completerLimites" — un champ par comportement visible, cible finie OU infinie. */
export function diagnostiquerCibleComportement(texte: string, cible: CibleComportement): StatutVerification {
  const signe = normaliserInfini(texte);
  if (signe !== null) {
    return cible.kind === "infini" && signe === cible.signe ? "correct" : "not_equivalent";
  }
  // Pas une forme infinie reconnue : tenter un nombre fini (cible fictive 0 si la vraie cible est
  // infinie — sa valeur n'importe pas, seul le statut parse_error/non-parse_error compte alors).
  const statut = diagnostiquerValeurArcSecteur(texte, cible.kind === "fini" ? cible.valeur : 0);
  if (statut === "parse_error") return "parse_error";
  if (cible.kind !== "fini") return "not_equivalent"; // nombre fini valide, mais la vraie limite est infinie
  return statut;
}

/** Écran "nommerAsymptotes" — équation d'une AV (valeur de x seule) ou d'une AH (valeur de y
 * seule), champ numérique simple. */
export function diagnostiquerValeurAsymptote(texte: string, cible: number): StatutVerification {
  return diagnostiquerValeurArcSecteur(texte, cible);
}

/** Équation de l'AO (y=pente·x+ordonnee) — équivalence algébrique en x, échantillonnée sur
 * quelques points, même motif que `diagnostiquerQuotient` (5gen21). */
export function diagnostiquerDroiteOblique(texte: string, pente: number, ordonnee: number): StatutVerification {
  try {
    const points = [0, 1, 2, -1, 3, -2];
    for (const x of points) {
      const valeurEntree = evaluerExpressionGenerale(texte, x);
      if (!Number.isFinite(valeurEntree)) return "parse_error";
      if (Math.abs(valeurEntree - (pente * x + ordonnee)) > 1e-4) return "not_equivalent";
    }
    return "correct";
  } catch {
    return "parse_error";
  }
}

export function diagnostiquerCibleAsymptote(texte: string, cible: CibleAsymptote): StatutVerification {
  if (cible.kind === "verticale") return diagnostiquerValeurAsymptote(texte, cible.x);
  if (cible.kind === "horizontale") return diagnostiquerValeurAsymptote(texte, cible.y);
  return diagnostiquerDroiteOblique(texte, cible.pente, cible.ordonnee);
}
