import type { CandidatE, ExerciceGraphiqueE } from "../../../core6e/graphiquesCyclometriques.types";
import { melangerAvecIndexCorrect, tirerParmi } from "../aleatoire";
import { calculerProprietesE } from "../proprietes";

const ARCFONCTIONS = ["arcsin", "arccos"] as const;
const K_VALEURS = [-3, -2, -1, 1, 2, 3] as const;
const DECALAGES = [-0.6, -0.4, 0.4, 0.6] as const;

/**
 * Famille E — `f(x) = √(k·arcfonction(x)+c)`, arcfonction∈{arcsin,arccos}. `k`,`c` DÉRIVÉS d'un
 * seuil `w0` (dans l'image de l'arcfonction, tiré EN PREMIER) plutôt que tirés indépendamment —
 * garantit par construction une intersection non vide entre `[-1;1]` (domaine propre de
 * l'arcfonction) et `k·arcfonction(x)+c≥0` (contrainte de la racine), aucun retirage nécessaire.
 */
export function construireE(): ExerciceGraphiqueE {
  const arcfonction = tirerParmi(ARCFONCTIONS);
  const w0 = arcfonction === "arcsin" ? -1.4 + Math.random() * 2.8 : 0.3 + Math.random() * 2.5;
  const k = tirerParmi(K_VALEURS);
  const c = -k * w0;
  const reel: CandidatE = { k, c, arcfonction, ignorerContrainteRacine: false, decalageAffichage: 0 };

  const x0 = arcfonction === "arcsin" ? Math.sin(w0) : Math.cos(w0);
  let domaineInf: number;
  let domaineSup: number;
  if (arcfonction === "arcsin") {
    if (k > 0) {
      domaineInf = x0;
      domaineSup = 1;
    } else {
      domaineInf = -1;
      domaineSup = x0;
    }
  } else {
    if (k > 0) {
      domaineInf = -1;
      domaineSup = x0;
    } else {
      domaineInf = x0;
      domaineSup = 1;
    }
  }

  const uneSeuleContrainte: CandidatE = { ...reel, ignorerContrainteRacine: true };
  const sensInverse: CandidatE = { ...reel, k: -k, c: -(-k) * w0 };
  const mauvaiseValeurExtremite: CandidatE = { ...reel, decalageAffichage: tirerParmi(DECALAGES) };

  const { candidats, indexCorrect } = melangerAvecIndexCorrect([reel, uneSeuleContrainte, sensInverse, mauvaiseValeurExtremite]);
  return { famille: "E", reel, proprietes: calculerProprietesE(reel, domaineInf, domaineSup), domaineInf, domaineSup, candidats, indexCorrect };
}

export { K_VALEURS as E_K_VALEURS };
