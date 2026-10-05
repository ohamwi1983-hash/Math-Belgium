/**
 * Couche B (5e) — vérification pour 5gen7. Réutilise DIRECTEMENT `diagnostiquerValeurArcSecteur`/
 * `verifierValeurArcSecteur` (`moteur5e/verificationArcsSecteurs.ts`, module FRÈRE — import
 * moteur→moteur explicitement autorisé par l'architecture, même principe que `verificationEquationCercleDeveloppee.ts`
 * réutilisant `verificationEquationCercle.ts` côté 4e) : même technique de vérification numérique
 * "pi-aware" à tolérance ±0.01, aucune raison d'en écrire une seconde version pour ce générateur
 * voisin. Les petites formules géométriques elles-mêmes (`circonferenceLocal`, etc.) sont en
 * revanche DUPLIQUÉES depuis `generateurs5e/polygonesArcsSecteurs/index.ts` — `src/moteur5e/`
 * n'importe JAMAIS `src/generateurs5e/` (règle non négociable).
 */
import type { ExercicePolygonesArcsSecteurs } from "../core5e/polygonesArcsSecteurs.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerValeurArcSecteur, verifierValeurArcSecteur } from "./verificationArcsSecteurs";
import type { PhasePolygonesArcsSecteurs } from "./typesPolygonesArcsSecteurs";

function circonferenceLocal(r: number): number {
  return 2 * Math.PI * r;
}
function aireCercleLocal(r: number): number {
  return Math.PI * r * r;
}

function combinerStatuts(...statuts: StatutVerification[]): StatutVerification {
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  return statuts.every((s) => s === "correct") ? "correct" : "not_equivalent";
}

export interface ReponseCercleEntier {
  circonference: string;
  aire: string;
}

/** Un champ diagnostiqué INDÉPENDAMMENT (A.2, is-erronee par champ) — `diagnostiquerCercleEntier`
 * les combine pour le score global, jamais l'inverse. */
export function diagnostiquerCirconferenceCercleEntier(exercice: ExercicePolygonesArcsSecteurs, circonference: string): StatutVerification {
  return diagnostiquerValeurArcSecteur(circonference, circonferenceLocal(exercice.r));
}
export function diagnostiquerAireCercleEntier(exercice: ExercicePolygonesArcsSecteurs, aire: string): StatutVerification {
  return diagnostiquerValeurArcSecteur(aire, aireCercleLocal(exercice.r));
}

export function diagnostiquerCercleEntier(exercice: ExercicePolygonesArcsSecteurs, reponse: ReponseCercleEntier): StatutVerification {
  return combinerStatuts(diagnostiquerCirconferenceCercleEntier(exercice, reponse.circonference), diagnostiquerAireCercleEntier(exercice, reponse.aire));
}
export function verifierCercleEntier(exercice: ExercicePolygonesArcsSecteurs, reponse: ReponseCercleEntier): boolean {
  return diagnostiquerCercleEntier(exercice, reponse) === "correct";
}

/** Cible numérique de l'écran courant, pour les 4 écrans à un seul champ (arcElementaire,
 * arcMultiPas, secteurElementaire, secteurMultiPas — jamais "cercleEntier", qui a sa propre
 * vérification à 2 champs ci-dessus). */
export function cibleEcranUnChamp(exercice: ExercicePolygonesArcsSecteurs, phase: Exclude<PhasePolygonesArcsSecteurs, "cercleEntier">): number {
  const { r, n } = exercice;
  if (phase === "arcElementaire") return (2 * Math.PI * r) / n;
  if (phase === "secteurElementaire") return (Math.PI * r * r) / n;
  if (phase === "arcMultiPas") {
    if (exercice.arcMultiPas === null) throw new Error("cibleEcranUnChamp : arcMultiPas absent de cet exercice");
    return (exercice.arcMultiPas.k * 2 * Math.PI * r) / n;
  }
  if (exercice.secteurMultiPas === null) throw new Error("cibleEcranUnChamp : secteurMultiPas absent de cet exercice");
  return (exercice.secteurMultiPas.k * Math.PI * r * r) / n;
}

export function verifierEcranUnChamp(exercice: ExercicePolygonesArcsSecteurs, phase: Exclude<PhasePolygonesArcsSecteurs, "cercleEntier">, texte: string): boolean {
  return verifierValeurArcSecteur(texte, cibleEcranUnChamp(exercice, phase));
}
