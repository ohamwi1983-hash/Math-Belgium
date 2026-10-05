/**
 * Couche A (5e) — famille 2 de l'extension 5gen10 ("Produit de facteurs = 0", voir CLAUDE.md section
 * 5gen10 "Extension — 4 familles"). Réutilise `construireExerciceEquationTrig`/`tirerFonction`
 * (`index.ts`, famille "directe" — jamais redéveloppé) comme brique pour CHAQUE facteur.
 *
 * 2 sous-cas, pondérés également :
 * - "factoree" (déjà factorisée) — 2 facteurs COMPLÈTEMENT INDÉPENDANTS (fonction/a/b/k chacun),
 *   puisqu'aucune étape de factorisation n'est requise — l'énoncé montre directement le produit.
 * - "nonFactoree" (à factoriser) — les 2 facteurs DOIVENT partager (fonction,a,b) pour que la mise
 *   en évidence par facteur commun ait un sens algébrique (`T²-k₂T=0` ⟹ `T(T-k₂)=0`, T=trig(ax+b)) —
 *   facteur1 est TOUJOURS le facteur trivial `trig(ax+b)=0` (k₁=0, cas général par construction,
 *   jamais spécial/aucune-solution), facteur2 tiré via `tirerCas` (n'importe quel régime/cas).
 */
import type { ExerciceEquationTrig, ExerciceProduitFacteurs, FonctionTrig, RegimeEquationTrig } from "../../core5e/equationsTrigonometriques.types";
import { branchesGeneralesCos, branchesGeneralesSin, brancheTan } from "./identites";
import { construireExerciceEquationTrig, tirerFonction } from "./index";
import { tirerA, tirerB } from "./coefficients";
import { unionSolutions } from "./solveur";
import { tirerCas } from "./tirageK";

const MAX_SOLUTIONS_UNION = 5;
const TENTATIVES_MAX = 200;

/** k=0 est TOUJOURS un cas général (jamais spécial, jamais aucune-solution) quelle que soit la
 * fonction — voir CLAUDE.md section 5gen10 ("k=0 volontairement présent dans les catalogues
 * cos/sin") : même principe ici, réimplémenté directement (B=arccos/arcsin/arctan(0) trivial),
 * respectant le régime IMPOSÉ (celui du facteur partenaire, pour rester cohérent — voir l'en-tête
 * de fichier). */
function casTrigZero(fonction: FonctionTrig, regime: RegimeEquationTrig) {
  const zeroPi = { numerateur: 0, denominateur: 1, degrePi: 1 as const };
  const demiPi = { numerateur: 1, denominateur: 2, degrePi: 1 as const };
  if (fonction === "tan") {
    return { k: 0, kLatex: "0", regime, aucuneSolution: false, casSpecial: false, branchesU: brancheTan(regime === "exact" ? zeroPi : null, 0) };
  }
  if (fonction === "cos") {
    return { k: 0, kLatex: "0", regime, aucuneSolution: false, casSpecial: false, branchesU: branchesGeneralesCos(regime === "exact" ? demiPi : null, Math.PI / 2) };
  }
  return { k: 0, kLatex: "0", regime, aucuneSolution: false, casSpecial: false, branchesU: branchesGeneralesSin(regime === "exact" ? zeroPi : null, 0) };
}

function unionBornee(facteur1: ExerciceEquationTrig, facteur2: ExerciceEquationTrig): number[] {
  return unionSolutions(facteur1.solutions, facteur2.solutions);
}

/** Sous-cas "factoree" — 2 facteurs indépendants (richesse maximale : fonctions différentes
 * possibles). Reroll BORNÉ de l'ensemble (les 2 facteurs redessinés) si l'union dépasse 5 solutions
 * OU tombe à 0 (les 2 facteurs indépendamment tirés `aucuneSolution`, possible pour cos/sin —
 * l'écran final "solutionsProduit" n'a aucune échappatoire "aucune solution", contrairement à
 * l'écran "argument" de la famille "directe" — trouvé par vérification Playwright de bout en bout,
 * même correctif déjà en place pour le sous-cas "nonFactoree" ci-dessous). */
export function construireProduitFactoree(): ExerciceProduitFacteurs {
  let facteur1 = construireFacteurIndependant();
  let facteur2 = construireFacteurIndependant();
  let solutionsUnion = unionBornee(facteur1, facteur2);
  let tentative = 0;
  while ((solutionsUnion.length > MAX_SOLUTIONS_UNION || solutionsUnion.length === 0) && tentative < TENTATIVES_MAX) {
    facteur1 = construireFacteurIndependant();
    facteur2 = construireFacteurIndependant();
    solutionsUnion = unionBornee(facteur1, facteur2);
    tentative++;
  }
  return { famille: "produit", sousCas: "factoree", facteur1, facteur2, solutionsUnion };
}

function construireFacteurIndependant(): ExerciceEquationTrig {
  const fonction = tirerFonction();
  const cas = tirerCas(fonction);
  const b = tirerB(cas.regime);
  return construireExerciceEquationTrig(fonction, cas, b);
}

/** Sous-cas "nonFactoree" — facteur1=trig(ax+b)=0, facteur2=trig(ax+b)=k₂, (fonction,a,b) PARTAGÉS.
 * Reroll BORNÉ de `a` seul (comme la famille "directe") si l'union dépasse 5 solutions. */
export function construireProduitNonFactoree(): ExerciceProduitFacteurs {
  const fonction = tirerFonction();
  const cas2 = tirerCas(fonction);
  const b = tirerB(cas2.regime);
  const cas1 = casTrigZero(fonction, cas2.regime);

  let a = tirerA();
  let facteur1 = construireExerciceEquationTrig(fonction, cas1, b, a);
  let facteur2 = construireExerciceEquationTrig(fonction, cas2, b, a);
  let solutionsUnion = unionBornee(facteur1, facteur2);
  let tentative = 0;
  while ((solutionsUnion.length > MAX_SOLUTIONS_UNION || solutionsUnion.length === 0) && tentative < TENTATIVES_MAX) {
    a = tirerA();
    facteur1 = construireExerciceEquationTrig(fonction, cas1, b, a);
    facteur2 = construireExerciceEquationTrig(fonction, cas2, b, a);
    solutionsUnion = unionBornee(facteur1, facteur2);
    tentative++;
  }

  return { famille: "produit", sousCas: "nonFactoree", facteur1, facteur2, solutionsUnion };
}

/** Tirage uniforme entre les 2 sous-cas (pondération comparable, spec explicite). */
export function genererExerciceProduitFacteurs(): ExerciceProduitFacteurs {
  return Math.random() < 0.5 ? construireProduitFactoree() : construireProduitNonFactoree();
}
