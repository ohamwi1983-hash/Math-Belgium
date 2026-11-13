import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { Axe, ExerciceTransformationsEnsembles, Intervalle } from "../../core/transformationsEnsembles.types";
import { natureDe, transformationsDeLAxe } from "../../moteur/modeleTransformationsEnsembles";

/**
 * Profil d'instance de gen72 pour le TIRAGE ÉQUILIBRÉ des évaluations (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré ») — demande de l'utilisateur : des séries
 * équilibrées avec ce générateur.
 *
 * - La VARIANTE fixe déjà le niveau et le nombre de transformations.
 * - `forme` fixe tout ce qui rend la question plus ou moins longue ou piégeuse, identique d'une
 *   série à l'autre, question par question : pour le domaine puis pour l'ensemble image, combien de
 *   translations (T), de symétries (S — l'échange des bornes et des crochets) et de dilatations (D)
 *   le touchent, et la forme de l'ensemble de départ (B = intervalle borné, I = demi-droite, avec
 *   une borne infinie). Exemple : « dom:B:T1S1D0|im:I:T1S1D1 ». Seuls les nombres changent entre
 *   les séries (l'ordre exact peut aussi changer, à difficulté égale).
 * - Cas particulier = un ensemble INCHANGÉ (toutes les transformations sur le même axe) : une
 *   moitié du travail disparaît. Par défaut, une évaluation n'en tire pas ; la case du panneau en
 *   met un, le même pour toutes les séries.
 * - `calcul` absent : bornes entières, sans calculatrice.
 */
export const LIBELLE_CAS_TRANSFORMATIONS_ENSEMBLES =
  "Inclure un cas particulier (toutes les transformations sur le même axe : domaine ou ensemble image inchangé)";

function formeEnsemble(i: Intervalle): "B" | "I" {
  return Number.isFinite(i.gauche) && Number.isFinite(i.droite) ? "B" : "I";
}

function signatureAxe(e: ExerciceTransformationsEnsembles, axe: Axe): string {
  const natures = transformationsDeLAxe(e, axe).map(({ t }) => natureDe(t));
  const compte = (n: string) => natures.filter((x) => x === n).length;
  return `${formeEnsemble(axe === "H" ? e.domaine : e.image)}:T${compte("T")}S${compte("S")}D${compte("D")}`;
}

export function formeTransformationsEnsembles(e: ExerciceTransformationsEnsembles): string {
  return `dom:${signatureAxe(e, "H")}|im:${signatureAxe(e, "V")}`;
}

export function profilTransformationsEnsembles(e: ExerciceTransformationsEnsembles): ProfilInstance {
  const inchange = transformationsDeLAxe(e, "H").length === 0 || transformationsDeLAxe(e, "V").length === 0;
  return { casParticulier: inchange ? "ensemble-inchange" : null, forme: formeTransformationsEnsembles(e) };
}
