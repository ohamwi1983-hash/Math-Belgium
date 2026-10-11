import type {
  ExerciceEgaliteExpressions,
  ExerciceEquationTrig,
  ExerciceEquationTrigonometrique,
  ExerciceProduitFacteurs,
  ExercicePythagoricienne,
} from "../core5e/equationsTrigonometriques.types";
import type { EtatSessionEquationTrigonometrique, PhaseEquationTrigonometrique } from "../moteur5e/typesEquationTrig";
import type { EntreeRecapitulatif } from "./recapitulatif";
import {
  OPTIONS_FAMILLE,
  formatAidePrefacteurNiveau2Latex,
  formatAideResoudreEgaliteNiveau2Latex,
  formatAideSepararFacteursNiveau2Latex,
  formatEquationConvertieEgaliteLatex,
  formatPolynomeCibleLatex,
  formatSolutionsTexte,
  formatTermesArgumentDirecteLatex,
  formatTermesArgumentProduitLatex,
  formatTermesRacinesResolutionLatex,
  formatTermesRacinesTLatex,
  formatTermesXDirecteLatex,
  formatTermesXProduitLatex,
  regimeProduit,
  TEXTE_ARGUMENT_AUCUNE_SOLUTION,
} from "./formatEquationTrigonometrique";

/** Mêmes accesseurs de narrowing que les fonctions privées `commeXxx` de `App5gen10.tsx` —
 * dupliqués ici pour la même raison que dans les autres cibles de cette tâche (ex.
 * `recapitulatifProblemesContexte.ts`/5gen5). */
function commeDirecte(exercice: ExerciceEquationTrigonometrique): ExerciceEquationTrig {
  if (exercice.famille !== "directe") throw new Error("commeDirecte : exercice hors famille 'directe'");
  return exercice.exercice;
}
function commeProduit(exercice: ExerciceEquationTrigonometrique): ExerciceProduitFacteurs {
  if (exercice.famille !== "produit") throw new Error("commeProduit : exercice hors famille 'produit'");
  return exercice;
}
function commePythagoricienne(exercice: ExerciceEquationTrigonometrique): ExercicePythagoricienne {
  if (exercice.famille !== "pythagoricienne") throw new Error("commePythagoricienne : exercice hors famille 'pythagoricienne'");
  return exercice;
}
function commeEgalite(exercice: ExerciceEquationTrigonometrique): ExerciceEgaliteExpressions {
  if (exercice.famille !== "egalite") throw new Error("commeEgalite : exercice hors famille 'egalite'");
  return exercice;
}

function labelFamille(famille: ExerciceEquationTrigonometrique["famille"]): string {
  return OPTIONS_FAMILLE.find((o) => o.id === famille)?.label ?? famille;
}

function entreeUnique(libelle: string, valeur: string, estLatex: boolean, revele: boolean): EntreeRecapitulatif {
  return { libelle, estLatex, valeur, revele };
}
function entreeMultiple(libelle: string, valeurs: string[], revele: boolean): EntreeRecapitulatif {
  return { libelle, estLatex: true, valeur: valeurs.join("\\quad"), valeurs, revele };
}

/**
 * Construit le récapitulatif des écrans déjà clos de l'exercice en cours (5gen10). Le moteur ne
 * trackait, à l'origine, que `derniereEtapeRevelee` (générique, pas un booléen par phase) — on
 * retrouve donc le verdict par phase via l'heuristique `scoresPartiels[phase] === 0 ⟺ révélée`
 * (même principe que 5gen12/5gen13). La séquence RÉELLE de phases dépend de la FAMILLE de
 * l'exercice courant (`exercice.famille` — 4 séquences structurellement disjointes au-delà de
 * l'écran commun "reconnaissance", jamais un seul ordre générique, voir
 * `moteur5e/typesEquationTrig.ts`) — chaque branche ci-dessous reprend EXACTEMENT les mêmes
 * valeurs que `reponseAttenduePhase` (fonction privée de `App5gen10.tsx`, qui alimentait l'ancien
 * panneau de révélation), reformatées en entrées string/LaTeX pour `EntreeRecapitulatif` plutôt
 * qu'en `ReactNode`.
 *
 * NOTE D'ARCHITECTURE : les anciens blocs "état actuel" maison (`etat-actuel-box`, dupliqués
 * localement dans chacun des ~10 `Etape*.tsx` de ce générateur) ne sont PAS retirés — hors du
 * périmètre autorisé pour cette tâche (seulement `App5gen10.tsx` + ce nouveau fichier, même
 * principe que `recapitulatifProblemesContexte.ts`/5gen5). `RecapitulatifPanel` est donc ajouté EN
 * PLUS, juste avant l'écran en cours, sans retirer les anciens blocs existants (qui continuent de
 * s'afficher à l'intérieur de chaque écran, inchangés).
 */
export function calculerRecapitulatifEquationTrig(etat: EtatSessionEquationTrigonometrique): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const s = etat.scoresPartiels;
  const close = (phase: PhaseEquationTrigonometrique) => s[phase] !== undefined;
  const revele = (phase: PhaseEquationTrigonometrique) => s[phase] === 0;

  const entrees: EntreeRecapitulatif[] = [];

  if (close("reconnaissance")) {
    entrees.push(entreeUnique("Méthode", labelFamille(exercice.famille), false, revele("reconnaissance")));
  }

  if (exercice.famille === "directe") {
    const ex = commeDirecte(exercice);
    if (close("argument")) {
      if (ex.aucuneSolution) {
        entrees.push(entreeUnique("Argument", TEXTE_ARGUMENT_AUCUNE_SOLUTION, false, revele("argument")));
      } else {
        entrees.push(entreeMultiple("Argument", formatTermesArgumentDirecteLatex(ex), revele("argument")));
      }
    }
    if (close("isolerX")) entrees.push(entreeMultiple("x isolé", formatTermesXDirecteLatex(ex), revele("isolerX")));
    if (close("solutions")) entrees.push(entreeUnique("Solutions", formatSolutionsTexte(ex.solutions, ex.regime), false, revele("solutions")));
  } else if (exercice.famille === "produit") {
    const ex = commeProduit(exercice);
    if (close("prefacteur")) entrees.push(entreeUnique("Préfacteur / factorisation", formatAidePrefacteurNiveau2Latex(ex), true, revele("prefacteur")));
    if (close("separerFacteurs")) entrees.push(entreeMultiple("Facteurs séparés", formatAideSepararFacteursNiveau2Latex(ex), revele("separerFacteurs")));
    if (close("argumentProduit")) entrees.push(entreeMultiple("Argument", formatTermesArgumentProduitLatex(ex), revele("argumentProduit")));
    if (close("isolerXProduit")) entrees.push(entreeMultiple("x isolé", formatTermesXProduitLatex(ex), revele("isolerXProduit")));
    if (close("solutionsProduit"))
      entrees.push(entreeUnique("Solutions", formatSolutionsTexte(ex.solutionsUnion, regimeProduit(ex)), false, revele("solutionsProduit")));
  } else if (exercice.famille === "pythagoricienne") {
    const ex = commePythagoricienne(exercice);
    if (close("conversionPythagoricienne")) entrees.push(entreeUnique("Polynôme cible", formatPolynomeCibleLatex(ex), true, revele("conversionPythagoricienne")));
    if (close("racinesPythagoricienne")) entrees.push(entreeMultiple("Racines en t", formatTermesRacinesTLatex(ex), revele("racinesPythagoricienne")));
    if (close("racinesResolution")) entrees.push(entreeMultiple("Résolution", formatTermesRacinesResolutionLatex(ex), revele("racinesResolution")));
    if (close("solutionsPythagoricienne"))
      entrees.push(entreeUnique("Solutions", formatSolutionsTexte(ex.solutionsUnion, "exact"), false, revele("solutionsPythagoricienne")));
  } else {
    const ex = commeEgalite(exercice);
    if (close("conversionEgalite")) entrees.push(entreeUnique("Équation convertie", formatEquationConvertieEgaliteLatex(ex), true, revele("conversionEgalite")));
    if (close("resoudreEgalite")) entrees.push(entreeMultiple("Résolution", formatAideResoudreEgaliteNiveau2Latex(ex), revele("resoudreEgalite")));
    if (close("solutionsEgalite")) entrees.push(entreeUnique("Solutions", formatSolutionsTexte(ex.solutions, "exact"), false, revele("solutionsEgalite")));
  }

  return entrees;
}
