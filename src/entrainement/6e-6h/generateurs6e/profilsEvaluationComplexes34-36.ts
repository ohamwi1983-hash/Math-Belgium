/**
 * Profils d'instance (tirage équilibré des évaluations, `AdaptateurFeuilleExercices.profilInstance`)
 * de 6gen34 (opérations et puissances de i), 6gen35 (conjugué, affixes, racines carrées) et 6gen36
 * (équations dans ℂ) — méthode `.claude/rules/feuilles-evaluations.md`, section « Tirage équilibré ».
 *
 * Décisions :
 * - Un seul régime de calcul : toutes les réponses sont exactes (entiers ou décimaux courts — 6gen34
 *   C/D/E : dénominateurs 2, 4, 5, 10… —, modules de 6gen35 issus de triplets pythagoriciens,
 *   racines de 6gen36 entières de Gauss) ; aucune instance n'exige la calculatrice. Pas de
 *   `calculatriceIndispensable`.
 * - `calcul` (revue des profils, 24/11/2026 : `exacte` SEULEMENT si la calculatrice des élèves donne
 *   directement la réponse demandée ; en 6e 6h, la Casio Graph Math+, mode complexe a+bi, `Conjg`, √) :
 *   6gen34 TOUTES les variantes `exacte` (l'expression de l'énoncé se tape telle quelle, la réponse a+bi
 *   s'affiche) ; 6gen35 A (z + z̄, z − z̄ : `Conjg`) et C (racines carrées : √ en mode complexe, la seconde
 *   est l'opposée) `exacte` ; 6gen35 B (parallélogramme : relation entre affixes à établir) et D (milieu,
 *   distance : formules à connaître, pas une touche) et 6gen36 (résoudre) : absent. Une variante toujours
 *   `exacte` est grisée et jamais tirée « calculatrice autorisée » (`varianteToujoursExacte`) : l'ancien
 *   problème de graine introuvable au premier palier ne se pose plus.
 * - `forme` = la variante (famille / sous-type) réellement tirée, pour que la série B reproduise la
 *   structure de la série A même en tirage libre ; 6gen34 G distingue aussi l'exposant négatif
 *   (méthode différente) et 6gen36 E les valeurs de u toutes réelles ou non (racines carrées d'un
 *   réel ou d'un complexe, méthode différente).
 * - Est « cas particulier » ce qui RACCOURCIT le calcul : coefficient nul, opérande réel ou imaginaire
 *   pur, conjugués (produit réel), dénominateur réel, équation sans terme en z (resp. en z²), terme
 *   constant nul (factorisation immédiate), solution nulle, segment parallèle à un axe. Aucune de ces
 *   familles ne pose de question de verdict.
 * - Plusieurs caractéristiques à la fois → identifiants joints par « + » (jamais tirés pour la case).
 *
 * Mesures (≥ 5 000 tirages par variante) : voir le rapport du lot R1 (`scratchpad/6c5-R1/`).
 */
import type { ProfilInstance } from "../../export/genererFeuilleExercices";
import type { ExerciceNombresComplexes } from "../core6e/nombresComplexes.types";
import type { ExerciceAffixesRacines } from "../core6e/affixesRacines.types";
import type { ExerciceEquationsComplexes } from "../core6e/equationsComplexes.types";

function cas(liste: (string | false)[]): string | null {
  const presents = liste.filter((c): c is string => !!c);
  return presents.length === 0 ? null : presents.join("+");
}

// ---------------------------------------------------------------------------------------------
// 6gen34 — opérations de base et puissances de i
// ---------------------------------------------------------------------------------------------

export const LIBELLE_CAS_NOMBRES_COMPLEXES =
  "Inclure un cas particulier (un nombre réel ou imaginaire pur, des conjugués, un résultat réel, un dénominateur réel…)";

/** Variante (id du catalogue) d'une instance de 6gen34. */
function varianteNombresComplexes(e: ExerciceNombresComplexes): string {
  return e.famille === "B" ? `B_${e.sousType}` : e.famille;
}

export function profilNombresComplexes(e: ExerciceNombresComplexes): ProfilInstance {
  const forme = varianteNombresComplexes(e);
  switch (e.famille) {
    case "A":
      return {
        casParticulier: cas([[e.a, e.b, e.c, e.d].includes(0) && "operande-reel-ou-imaginaire-pur", e.resultat.im === 0 && "resultat-reel"]),
        forme,
        calcul: "exacte",
      };
    case "B":
      if (e.sousType === "produit") return { casParticulier: cas([e.c === e.a && e.d === -e.b && "conjugues"]), forme, calcul: "exacte" };
      if (e.sousType === "carre") return { casParticulier: cas([Math.abs(e.a) === Math.abs(e.b) && "resultat-imaginaire-pur"]), forme, calcul: "exacte" };
      return { casParticulier: cas([e.a === 0 && "imaginaire-pur"]), forme, calcul: "exacte" };
    case "C":
      return { casParticulier: cas([e.a === 1 && e.b === 0 && "inverse"]), forme, calcul: "exacte" };
    case "D":
      return { casParticulier: cas([(e.a === 0 || e.b === 0) && "numerateur-reel-ou-imaginaire-pur"]), forme, calcul: "exacte" };
    case "E":
      return { casParticulier: cas([e.c1 === e.c2 && e.d1 === -e.d2 && "denominateurs-conjugues"]), forme, calcul: "exacte" };
    case "F":
      return {
        casParticulier: cas([e.d === 0 && "denominateur-reel", (e.quotientSimplifie.re === 0 || e.quotientSimplifie.im === 0) && "quotient-reel-ou-imaginaire-pur"]),
        forme,
        calcul: "exacte",
      };
    case "G":
      return { casParticulier: null, forme: e.n < 0 ? "G-exposant-negatif" : "G-exposant-positif", calcul: "exacte" };
  }
}

// ---------------------------------------------------------------------------------------------
// 6gen35 — conjugué, affixes, racines carrées
// ---------------------------------------------------------------------------------------------

export const LIBELLE_CAS_AFFIXES_RACINES =
  "Inclure un cas particulier (z imaginaire pur, racines carrées d'un imaginaire pur, segment parallèle à un axe)";

export function profilAffixesRacines(e: ExerciceAffixesRacines): ProfilInstance {
  switch (e.famille) {
    case "A":
      return { casParticulier: cas([e.a === 0 && "z-imaginaire-pur"]), forme: "A", calcul: "exacte" };
    case "B":
      return { casParticulier: null, forme: "B" };
    case "C":
      return { casParticulier: cas([e.a === 0 && "imaginaire-pur"]), forme: "C", calcul: "exacte" };
    case "D":
      return { casParticulier: cas([(e.difference.re === 0 || e.difference.im === 0) && "segment-parallele-axe"]), forme: "D" };
  }
}

// ---------------------------------------------------------------------------------------------
// 6gen36 — équations dans ℂ
// ---------------------------------------------------------------------------------------------

export const LIBELLE_CAS_EQUATIONS_COMPLEXES =
  "Inclure un cas particulier (équation sans terme en z ou en z², terme constant nul, solution nulle)";

const nul = (v: { re: number; im: number }) => v.re === 0 && v.im === 0;

/** Famille (et sous-type de A) d'une instance de 6gen36. La famille E n'est pas coupée en « réelle /
 * complexe » : une instance de la variante E_complexe peut avoir, par hasard, des coefficients tous
 * réels ; seule la nature des valeurs de u (réelles ou non) fixe le type de question. */
function typeEquationsComplexes(e: ExerciceEquationsComplexes): string {
  if (e.famille === "A") return e.sousType === "sansBarre" ? "A_sansBarre" : "A_avecBarre";
  return e.famille;
}

export function profilEquationsComplexes(e: ExerciceEquationsComplexes): ProfilInstance {
  const variante = typeEquationsComplexes(e);
  switch (e.famille) {
    case "A":
      if (e.sousType === "sansBarre") return { casParticulier: cas([nul(e.z) && "solution-nulle"]), forme: variante };
      return { casParticulier: null, forme: variante };
    case "B":
      return { casParticulier: null, forme: variante };
    case "C":
      return { casParticulier: cas([e.b === 0 && "sans-terme-en-z"]), forme: variante };
    case "D":
      return { casParticulier: cas([nul(e.c) && "terme-constant-nul"]), forme: variante };
    case "E": {
      const uReels = e.u1.im === 0 && e.u2.im === 0;
      return { casParticulier: cas([nul(e.b) && "sans-terme-en-z2"]), forme: uReels ? "E-u-reels" : "E-u-complexes" };
    }
    case "F":
      return { casParticulier: null, forme: variante };
  }
}
