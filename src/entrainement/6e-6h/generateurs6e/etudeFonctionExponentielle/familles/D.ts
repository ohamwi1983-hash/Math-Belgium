import type { CandidatEtudeD, ExerciceEtudeD } from "../../../core6e/etudeFonctionExponentielle.types";
import type { CibleLimite } from "../../../core6e/limitesExponentielles.types";
import { ensembleReel } from "../../ensembleReel";
import { melangerAvecIndexCorrect, tirerParmi } from "../aleatoire";

const A_VALEURS = [-3, -2, -1, 1, 2, 3] as const;

/**
 * Famille D — `f(x) = a·x·e^x`, a∈{-3,-2,-1,1,2,3}. RÉUTILISE DIRECTEMENT les formules déjà
 * établies et cross-vérifiées par `6gen8` famille A
 * (`generateurs6e/graphiquesDeriveeExponentielles/familles/A.ts`) — jamais re-dérivées depuis
 * zéro, seulement étendues avec limites/asymptotes/concavité (nouveaux pour CE générateur) :
 * `f'(x)=a·e^x(1+x)` (zéro en x=−1, c'est l'extremum de f elle-même — min si a>0, max si a<0) ;
 * `f''(x)=a·e^x(2+x)` (zéro en x=−2, c'est le point d'inflexion de f, TOUJOURS présent quel que
 * soit a). Ces 2 formules sont malgré tout cross-vérifiées à nouveau ici, par une méthode
 * INDÉPENDANTE (différences finies numériques, `D.test.ts`) — jamais supposées correctes sans
 * preuve dans CE fichier, même si déjà établies ailleurs sur la plateforme.
 *
 * Domaine ℝ ; limite 0 en −∞ (asymptote horizontale y=0, l'exponentielle l'emporte sur le terme
 * linéaire) ; limite ±∞ en +∞ (signe de a, aucune asymptote de ce côté).
 */
export function construireD(): ExerciceEtudeD {
  const a = tirerParmi(A_VALEURS);

  const limitePlusInfini: CibleLimite = a > 0 ? { type: "plus_infini" } : { type: "moins_infini" };

  const reel: CandidatEtudeD = { type: "reel", a };
  const extremumInverse: CandidatEtudeD = { type: "extremumInverse", a };
  const asymptoteMalPlacee: CandidatEtudeD = { type: "asymptoteMalPlacee", a };
  const branchesEchangees: CandidatEtudeD = { type: "branchesEchangees", a };

  const { candidats, indexCorrect } = melangerAvecIndexCorrect([reel, extremumInverse, asymptoteMalPlacee, branchesEchangees]);

  return {
    famille: "D",
    a,
    domaine: ensembleReel(),
    limitePlusInfini,
    limiteMoinsInfini: { type: "zero" },
    asymptotePlusInfini: { type: "aucune" },
    asymptoteMoinsInfini: { type: "horizontale", valeur: 0 },
    croissance: { type: a > 0 ? "minimum" : "maximum", position: -1 },
    concavite: { type: "inflexion", position: -2 },
    candidats,
    indexCorrect,
  };
}

export { A_VALEURS as D_A_VALEURS };
