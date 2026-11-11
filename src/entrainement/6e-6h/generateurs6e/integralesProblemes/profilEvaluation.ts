/**
 * Profil d'instance de `6gen29` (« Intégrales et primitives : problèmes ») pour le TIRAGE ÉQUILIBRÉ des
 * évaluations (`AdaptateurFeuilleExercices.profilInstance`, `.claude/rules/feuilles-evaluations.md`).
 *
 * Mesures (5 000 tirages par variante, audit 6e ch.4) :
 * - B (cinématique) : a(t) = k·t sans terme constant (p = 0) ≈ 33 %, vitesse initiale nulle ≈ 32 %,
 *   les deux ≈ 11 % — deux raccourcis (une primitive sans terme en t, une constante nulle). Ces
 *   paramètres n'existent QUE dans la famille B : pas de « Paramètres à inclure » (règle : seulement
 *   des paramètres présents dans toutes les variantes), la case unique « cas particulier » suffit.
 * - E (valeur moyenne en contexte) : taux sans terme constant (f(t) = m·t) ≈ 10 %.
 * - F (surplus) : offre passant par l'origine (g(x) = m·x) ≈ 17 %.
 * - G_calotte : hauteur d'eau égale au rayon (demi-sphère, V = 2πr³/3) ≈ 20 %.
 * - A, C, C_variante, D, G_soustraction, G_archimede : aucun cas particulier (le verdict de
 *   C_variante — quel travail est le plus grand — n'en est jamais un).
 *
 * Calculatrice : toutes les variantes sont EXACTES (rationnels, multiples rationnels de π) sauf F
 * (équilibre transcendant : calculatrice indispensable, voir `calculatriceIndispensable` de
 * l'adaptateur) et G_soustraction, dont le régime dépend de f : polynomiale (≈ 27 %) → π·rationnel,
 * exacte ; a·eˣ + b (≈ 34 %) ou a·cos x (≈ 40 %) → forme close transcendante, calculatrice.
 * `calcul` n'est donc renseigné que pour G_soustraction (seule variante à deux régimes).
 *
 * `forme` : le contexte tiré au hasard dans une même variante (A : terrain / mur, qui ajoute la
 * multiplication par la profondeur ; E : stock / action) est imposé identique d'une série à l'autre.
 */
import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceIntegralesProblemes } from "../../core6e/integralesProblemes.types";

export const LIBELLE_CAS_INTEGRALES_PROBLEMES =
  "Inclure un cas particulier (accélération sans terme constant ou vitesse initiale nulle, taux sans terme constant, offre passant par l'origine, demi-sphère)";

function cas(liste: (string | false)[]): string | null {
  const presents = liste.filter((c): c is string => !!c);
  return presents.length === 0 ? null : presents.join("+");
}

export function profilIntegralesProblemes(e: ExerciceIntegralesProblemes): ProfilInstance {
  switch (e.famille) {
    case "A":
      return { casParticulier: null, forme: e.contexte };
    case "B":
      return { casParticulier: cas([e.p === 0 && "acceleration-sans-constante", e.v0 === 0 && "vitesse-initiale-nulle"]) };
    case "C":
    case "D":
      return { casParticulier: null };
    case "E": {
      const termes = e.exerciceMoyenne.primitive.famille === "A" && e.exerciceMoyenne.primitive.sousType === "direct" ? e.exerciceMoyenne.primitive.termes : [];
      return { casParticulier: termes.length === 1 ? "taux-sans-constante" : null, forme: e.contexte };
    }
    case "F":
      return { casParticulier: e.p === 0 ? "offre-par-origine" : null };
    case "G":
      if (e.sousType === "soustraction") return { casParticulier: null, calcul: e.volumeTotal.type === "polynomiale" ? "exacte" : "calculatrice" };
      if (e.sousType === "calotte") return { casParticulier: e.hDemande === e.r ? "demi-sphere" : null };
      return { casParticulier: null };
  }
}
