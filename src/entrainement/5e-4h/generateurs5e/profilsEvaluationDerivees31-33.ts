/**
 * Profils d'instance (tirage équilibré des évaluations, `AdaptateurFeuilleExercices.profilInstance`,
 * méthode : `.claude/rules/feuilles-evaluations.md`) de 5gen31 (étudier une fonction), 5gen32
 * (optimisation géométrique) et 5gen33 (contexte économique), chapitre 5 de 5e. Mesures : 5 000
 * tirages par variante (scratchpad 5c5-R3/mesure.txt).
 *
 * 5gen31 — `forme` = type de fonction (polynomiale, rationnelle sans/avec valeurs interdites,
 * rationnelle à asymptote oblique), même type d'une série à l'autre. Cas particulier (il RACCOURCIT
 * l'étude) : `sans-extremum` — f′ sans changement de signe (racine double de la polynomiale, ou
 * asymptote oblique sans extremum) : aucun extremum à placer. `calcul` : `'calculatrice'` dès qu'un
 * point remarquable a une abscisse irrationnelle (ordonnées arrondies au centième), `'exacte'` sinon.
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

export const LIBELLE_CAS_ETUDIER_FONCTION = "Inclure un cas particulier (fonction sans extremum)";

export function profilEtudierFonction(e: ExerciceEtudierFonction): ProfilInstance {
  if (e.famille === "rationnelleAO") {
    const irrationnelle = e.racinesFPrime.some((r) => !r.exact);
    return { casParticulier: e.racinesFPrime.length === 0 ? "sans-extremum" : null, calcul: irrationnelle ? "calculatrice" : "exacte", forme: "rationnelleAO" };
  }
  const n = e.noyau;
  const sansExtremum = n.classificationFPrime.every((c) => c === "ni_lun_ni_lautre");
  const irrationnelle = [...n.racinesFPrime, ...n.racinesFSeconde].some((r) => !r.exact);
  return { casParticulier: sansExtremum ? "sans-extremum" : null, calcul: irrationnelle ? "calculatrice" : "exacte", forme: n.type };
}

// ============================================================================
// 5gen32 — optimisation géométrique.
// ============================================================================

const entier = (v: number) => Math.abs(v - Math.round(v)) < 1e-9;

export function profilOptimisation(e: ExerciceOptimisation): ProfilInstance {
  switch (e.famille) {
    case "trapeze":
      return { casParticulier: null, calcul: e.u && e.u.num === 1 && e.u.den === 2 ? "exacte" : "calculatrice", forme: "trapeze" };
    case "cylindre":
      if (e.avecApplicationNumerique) return { casParticulier: null, calcul: "calculatrice", forme: "cylindre-application" };
      return { casParticulier: null, calcul: entier(e.xOpt) ? "exacte" : "calculatrice", forme: "cylindre" };
    case "margesA":
    case "margesB":
      return { casParticulier: null, calcul: entier(e.xOpt) ? "exacte" : "calculatrice", forme: e.famille };
    case "fenetreA":
    case "fenetreB":
      return { casParticulier: null, calcul: entier(e.rOpt) ? "exacte" : "calculatrice", forme: e.famille };
    case "cubique":
      return { casParticulier: null, calcul: "exacte", forme: "cubique" };
  }
}

// ============================================================================
// 5gen33 — contexte économique.
// ============================================================================

export function profilContexteEconomique(e: ExerciceContexteEconomique): ProfilInstance {
  if (e.famille === "A") {
    const ecartJuste = entier(Math.round(e.ecartPourcent * 1e6) / 1e4);
    return { casParticulier: null, calcul: ecartJuste && e.minimum.exact ? "exacte" : "calculatrice", forme: `A-degre${e.coutTotal.degre}` };
  }
  if (e.famille === "B") return { casParticulier: null, calcul: "exacte", forme: "B" };
  return { casParticulier: null, calcul: "calculatrice", forme: "dichotomie" };
}
