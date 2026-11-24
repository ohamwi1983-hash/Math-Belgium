/**
 * Profils d'instance (tirage équilibré des évaluations, `AdaptateurFeuilleExercices.profilInstance`,
 * méthode : `.claude/rules/feuilles-evaluations.md`) de 5gen31 (étudier une fonction), 5gen32
 * (optimisation géométrique) et 5gen33 (contexte économique), chapitre 5 de 5e. Mesures : 5 000
 * tirages par variante (scratchpad 5c5-R3/mesure.txt).
 *
 * 5gen31 — `forme` = type de fonction (polynomiale, rationnelle sans/avec valeurs interdites,
 * rationnelle à asymptote oblique) + racines irrationnelles visibles (`-irrationnelle`), même type
 * d'une série à l'autre. Lot D : « sans extremum » (racine double de la polynomiale, asymptote oblique
 * sans extremum) est le VERDICT de l'étude — plus un cas particulier, hors de la `forme`, groupes à
 * verdict `groupe_extremums_poly` / `groupe_extremums_ao` (exportEvaluation). Lot C : ordonnées
 * EXACTES (e ± √r compris), `calcul` absent (la calculatrice ne fait pas l'étude).
 *
 * 5gen32 — `forme` = famille (gouttière, boîte, affiche ×2, fenêtre ×2, cubique), avec l'application
 * numérique du cylindre comme structure à part (une question de plus). Aucun cas particulier (chaque
 * famille impose les mêmes étapes). `calcul` : `'exacte'` quand l'optimum est entier (régime exact du
 * générateur ; gouttière : seulement u = cos α = 1/2, α = 60°), `'calculatrice'` sinon ; l'application
 * numérique du cylindre (prix × aire avec π) exige toujours la calculatrice. La variante « cubique »
 * est hors du tirage libre : elle n'entre dans une évaluation que si le professeur la choisit.
 *
 * 5gen33 — `forme` = famille et degré (A degré 2 : coût moyen minimal ; A degré 3 : coût marginal
 * minimal ; B : bénéfice maximal ; dichotomie). Aucun cas particulier. `calcul` : `'exacte'` quand
 * l'écart en pourcentage tombe juste au centième et que le minimum est exact (A), toujours pour B
 * (quantités et bénéfice entiers) ; la dichotomie exige toujours la calculatrice.
 */
import type { ProfilInstance } from "../../export/genererFeuilleExercices";
import type { ExerciceEtudierFonction } from "../core5e/etudierFonction.types";
import type { ExerciceOptimisation } from "../core5e/optimisationGeometrique.types";
import type { ExerciceContexteEconomique } from "../core5e/contexteEconomique.types";

// ============================================================================
// 5gen31 — étudier une fonction.
// ============================================================================

export function profilEtudierFonction(e: ExerciceEtudierFonction): ProfilInstance {
  if (e.famille === "rationnelleAO") {
    const irrationnelle = e.racinesFPrime.some((r) => !r.exact);
    return { casParticulier: null, forme: irrationnelle ? "rationnelleAO-irrationnelle" : "rationnelleAO" };
  }
  const n = e.noyau;
  const irrationnelle = n.type === "polynomiale" && n.racinesFPrime.some((r) => !r.exact);
  return { casParticulier: null, forme: irrationnelle ? `${n.type}-irrationnelle` : n.type };
}

// ============================================================================
// 5gen32 — optimisation géométrique.
// ============================================================================

const entier = (v: number) => Math.abs(v - Math.round(v)) < 1e-9;

export function profilOptimisation(e: ExerciceOptimisation): ProfilInstance {
  switch (e.famille) {
    case "trapeze":
      return { casParticulier: null, calcul: e.u && e.u.num === 1 && e.u.den === 2 ? undefined : "calculatrice", forme: "trapeze" };
    case "cylindre":
      if (e.avecApplicationNumerique) return { casParticulier: null, calcul: "calculatrice", forme: "cylindre-application" };
      return { casParticulier: null, calcul: entier(e.xOpt) ? undefined : "calculatrice", forme: "cylindre" };
    case "margesA":
    case "margesB":
      return { casParticulier: null, calcul: entier(e.xOpt) ? undefined : "calculatrice", forme: e.famille };
    case "fenetreA":
    case "fenetreB":
      return { casParticulier: null, calcul: entier(e.rOpt) ? undefined : "calculatrice", forme: e.famille };
    case "cubique":
      return { casParticulier: null, forme: "cubique" };
  }
}

// ============================================================================
// 5gen33 — contexte économique.
// ============================================================================

export function profilContexteEconomique(e: ExerciceContexteEconomique): ProfilInstance {
  if (e.famille === "A") {
    const ecartJuste = entier(Math.round(e.ecartPourcent * 1e6) / 1e4);
    return { casParticulier: null, calcul: ecartJuste && e.minimum.exact ? undefined : "calculatrice", forme: `A-degre${e.coutTotal.degre}` };
  }
  if (e.famille === "B") return { casParticulier: null, forme: "B" };
  return { casParticulier: null, calcul: "calculatrice", forme: "dichotomie" };
}
