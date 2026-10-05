import type { ExerciceDeuxFractionsLineaires } from "../../core/equationRationnelle.types";
import type { PolynomeLineaire } from "../../core/simplification.types";
import { randomInt, randomNonZeroInt } from "../secondDegre/aleatoire";
import { construireExerciceClassifie } from "./construireExerciceClassifie";
import { reduireSiPossible } from "./reductionFraction";

interface Parametres {
  k1: number;
  p1: number;
  k2: number;
  p2: number;
  k3: number;
  p3: number;
  k4: number;
  p4: number;
  r1: number;
  r2: number;
}

/**
 * Tire k1,p1,k2,p2,k3,p3,k4,p4 dans [-plage,plage] (prompt-2-cas3-degre1.md, sous-variante c) et
 * cherche un discriminant carré parfait donnant deux racines entières — exclut explicitement
 * p3=p4 et p1=p3 (chevauchement accidentel avec les sous-variantes a/b), p1=p2 (correctif
 * prompt-3-simplifier-et-isolement-flexible.md : sinon la fraction gauche s'effondrerait
 * identiquement en une constante, cas dégénéré comme pour la sous-variante a), et exclut toute
 * racine qui coïnciderait avec une CE (p2 ou p4), pour garantir "généralement aucun rejet" à la
 * construction plutôt que par coïncidence.
 */
function tirerParametres(plage: number): Parametres | null {
  const k1 = randomNonZeroInt(-4, 4);
  const k2 = randomNonZeroInt(-4, 4);
  const k3 = randomNonZeroInt(-4, 4);
  const k4 = randomNonZeroInt(-4, 4);

  const p3 = randomInt(-plage, plage);
  let p4 = randomInt(-plage, plage);
  while (p4 === p3) p4 = randomInt(-plage, plage);
  let p1 = randomInt(-plage, plage);
  while (p1 === p3) p1 = randomInt(-plage, plage);
  let p2 = randomInt(-plage, plage);
  while (p2 === p1) p2 = randomInt(-plage, plage);

  const a = k1 * k4 - k3 * k2;
  if (a === 0) return null;

  const b = -k1 * k4 * (p1 + p4) + k3 * k2 * (p3 + p2);
  const c = k1 * k4 * p1 * p4 - k3 * k2 * p3 * p2;

  const delta = b * b - 4 * a * c;
  if (delta < 0) return null;
  const racineDelta = Math.sqrt(delta);
  if (!Number.isInteger(racineDelta)) return null;

  const deuxA = 2 * a;
  if ((-b - racineDelta) % deuxA !== 0 || (-b + racineDelta) % deuxA !== 0) return null;

  const r1 = (-b - racineDelta) / deuxA;
  const r2 = (-b + racineDelta) / deuxA;
  if (r1 === p2 || r1 === p4 || r2 === p2 || r2 === p4) return null;

  return { k1, p1, k2, p2, k3, p3, k4, p4, r1, r2 };
}

const TENTATIVES_PAR_PLAGE = 500;
const PLAGES = [6, 10, 15, 20];

/**
 * Sous-variante (c) : cas générique (prompt-2-cas3-degre1.md). Les 4 polynômes P1_1..P1_4 sont
 * choisis librement (petits entiers), en excluant explicitement toute proportionnalité
 * accidentelle P1_3∝P1_4 (p3=p4, chevaucherait la sous-variante a) ou P1_1∝P1_3 (p1=p3,
 * chevaucherait la sous-variante b). Contrairement aux deux autres sous-variantes, la mise en
 * croix n'a pas de factorisation garantie a priori : on calcule directement le résultat (a,b,c) et
 * on cherche une combinaison à discriminant carré parfait donnant des racines entières — en
 * réessayant avec d'autres petits entiers sinon (plages croissantes). `equationIsolee` est
 * classifiée post-hoc via `construireExerciceClassifie` (une des 4 vraies techniques, jamais
 * `mise_en_evidence_generalisee`) : l'élève passe donc par la reconnaissance complète, contrairement
 * aux sous-variantes (a)/(b).
 */
export function construireSousVarianteC(): ExerciceDeuxFractionsLineaires {
  for (const plage of PLAGES) {
    for (let i = 0; i < TENTATIVES_PAR_PLAGE; i++) {
      const resultat = tirerParametres(plage);
      if (!resultat) continue;

      const { k1, p1, k2, p2, k3, p3, k4, p4, r1, r2 } = resultat;

      const numerateurGauche: PolynomeLineaire = { k: k1, p: p1 };
      const denominateurGauche: PolynomeLineaire = { k: k2, p: p2 };
      const numerateurDroit: PolynomeLineaire = { k: k3, p: p3 };
      const denominateurDroit: PolynomeLineaire = { k: k4, p: p4 };

      // Les deux fractions sont éligibles à réduction : aucune proportionnalité définitionnelle
      // ne les protège comme en (a)/(b), mais p1≠p2 et p3≠p4 (exclusions ci-dessus) garantissent
      // qu'aucune des deux ne peut s'effondrer en constante — seule une réduction numérique
      // (pgcd>1) est possible.
      const reductionGauche = reduireSiPossible("gauche", numerateurGauche, denominateurGauche);
      const reductionDroite = reduireSiPossible("droite", numerateurDroit, denominateurDroit);
      const fractionsSimplifiables = [reductionGauche.entree, reductionDroite.entree].filter(
        (entree): entree is NonNullable<typeof entree> => entree !== null,
      );

      // r1,r2 (déjà calculées ci-dessus à partir des k d'origine) sont invariantes par réduction
      // (fait algébrique général) : seul le coefficient dominant change d'échelle.
      const a =
        reductionGauche.kNumerateurEffectif * reductionDroite.kDenominateurEffectif -
        reductionDroite.kNumerateurEffectif * reductionGauche.kDenominateurEffectif;
      const equationIsolee = construireExerciceClassifie(a, r1, r2);
      const ce = ([p2, p4] as [number, number]).sort((x, y) => x - y);

      return {
        construction: "deux_fractions_lineaires",
        numerateurGauche,
        denominateurGauche,
        numerateurDroit,
        denominateurDroit,
        ce,
        equationIsolee,
        fractionsSimplifiables,
      };
    }
  }

  throw new Error("construireSousVarianteC : aucune combinaison valide trouvée");
}
