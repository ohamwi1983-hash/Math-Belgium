/**
 * Couche A (5e) — générateur de 5gen10 ("Équations trigonométriques trig(ax+b)=k", Type A
 * uniquement — voir CLAUDE.md section 5gen10 pour le détail complet). Orchestre `tirageK.ts`
 * (fonction + k + branchesU), `coefficients.ts` (a + b, b cohérent avec le régime de k), et
 * `solveur.ts` (branchesX + solutions distinctes dans [0;2π[) — avec un RETIRAGE BORNÉ de `a` seul
 * si le nombre de solutions dépasse 5 (contrainte de lisibilité de l'écran 3, spec explicite :
 * "4 à 5 points maximum").
 *
 * `tirerFonction`/`construireExerciceEquationTrig` sont exportées (au-delà du seul besoin de ce
 * fichier) pour être réutilisées TELLES QUELLES comme briques par les familles 2/3 de l'extension
 * (`produitFacteurs.ts`/`pythagoricienne.ts`, voir CLAUDE.md "Extension — 4 familles") — jamais un
 * second générateur `trig(ax+b)=k` redéveloppé.
 */
import type {
  CoefficientRationnel,
  ExerciceEquationTrig,
  ExerciceEquationTrigonometrique,
  FonctionTrig,
  ValeurPiOuDecimale,
} from "../../core5e/equationsTrigonometriques.types";
import { tirerA, tirerB } from "./coefficients";
import { construireExerciceEgaliteExpressions } from "./egaliteExpressions";
import { genererExerciceProduitFacteurs } from "./produitFacteurs";
import { construireExercicePythagoricienne } from "./pythagoricienne";
import { construireBranchesX, solutionsDistinctes } from "./solveur";
import { tirerCas } from "./tirageK";
import type { CasGenereEquationTrig } from "./tirageK";

export { construireExerciceEgaliteExpressions } from "./egaliteExpressions";
export { genererExerciceProduitFacteurs } from "./produitFacteurs";
export { construireExercicePythagoricienne } from "./pythagoricienne";

const FONCTIONS: FonctionTrig[] = ["sin", "cos", "tan"];
const MAX_SOLUTIONS = 5;
const TENTATIVES_MAX = 200;

export function tirerFonction(): FonctionTrig {
  return FONCTIONS[Math.floor(Math.random() * FONCTIONS.length)];
}

/**
 * Construit un `ExerciceEquationTrig` complet depuis un `cas` déjà tiré (`tirerCas`) et un `b`
 * déjà tiré (cohérent avec `cas.regime`, voir `coefficients.ts::tirerB`) — reroll BORNÉ de `a` seul
 * (jamais `cas`/`b`) tant que le nombre de solutions dépasse 5 ou tombe à 0 (voir l'en-tête de
 * fichier). `aExact`, si fourni, FIGE `a` (aucun tirage/reroll) — utilisé par la famille 2 quand les
 * 2 facteurs doivent PARTAGER le même `a` (voir `produitFacteurs.ts`, sous-cas "nonFactoree").
 */
export function construireExerciceEquationTrig(fonction: FonctionTrig, cas: CasGenereEquationTrig, b: ValeurPiOuDecimale, aExact?: CoefficientRationnel): ExerciceEquationTrig {
  if (cas.aucuneSolution) {
    return {
      fonction,
      a: aExact ?? tirerA(),
      b,
      k: { valeur: cas.k, latex: cas.kLatex },
      regime: cas.regime,
      aucuneSolution: true,
      casSpecial: false,
      branchesU: [],
      branchesX: [],
      solutions: [],
    };
  }

  let a = aExact ?? tirerA();
  let branchesX = construireBranchesX(cas.branchesU, a, b);
  let solutions = solutionsDistinctes(branchesX);
  if (aExact === undefined) {
    let tentative = 0;
    // Reroll de `a` seul si le nombre de solutions dépasse la borne de lisibilité de l'écran final
    // (>5, spec explicite) OU tombe à 0 — possible pour un `a` FRACTIONNAIRE (period_x=periode_u/a >
    // 2π), qui peut légitimement ne placer aucun point de la suite dans [0;2π[ pour une phase donnée
    // (voir CLAUDE.md section 5gen10) : un cas général/spécial doit toujours avoir AU MOINS une
    // solution affichable, jamais un écran final vide pour un exercice qui n'est pourtant pas
    // "aucune solution". Jamais de reroll si `aExact` est fourni (a imposé par l'appelant).
    while ((solutions.length > MAX_SOLUTIONS || solutions.length === 0) && tentative < TENTATIVES_MAX) {
      a = tirerA();
      branchesX = construireBranchesX(cas.branchesU, a, b);
      solutions = solutionsDistinctes(branchesX);
      tentative++;
    }
  }

  return {
    fonction,
    a,
    b,
    k: { valeur: cas.k, latex: cas.kLatex },
    regime: cas.regime,
    aucuneSolution: false,
    casSpecial: cas.casSpecial,
    branchesU: cas.branchesU,
    branchesX,
    solutions,
  };
}

export function genererExerciceEquationTrig(): ExerciceEquationTrig {
  const fonction = tirerFonction();
  const cas = tirerCas(fonction);
  const b = tirerB(cas.regime);
  return construireExerciceEquationTrig(fonction, cas, b);
}

/**
 * Générateur UNIFIÉ de l'extension (5gen10) — tire l'une des 4 familles à poids ÉGAL (25% chacune),
 * chacune déjà responsable de sa propre construction complète (y compris son propre reroll borné) —
 * voir CLAUDE.md "Extension — 4 familles". Consommé par le moteur (écran 0 "reconnaissance" puis
 * dispatch par famille) et par `App5gen10.tsx`.
 */
export function genererExerciceEquationTrigonometrique(): ExerciceEquationTrigonometrique {
  const tirage = Math.random();
  if (tirage < 0.25) return { famille: "directe", exercice: genererExerciceEquationTrig() };
  if (tirage < 0.5) return genererExerciceProduitFacteurs();
  if (tirage < 0.75) return construireExercicePythagoricienne();
  return construireExerciceEgaliteExpressions();
}
