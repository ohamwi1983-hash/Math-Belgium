import type { ExerciceDeuxFractionsLineaires } from "../../core/equationRationnelle.types";
import type { PolynomeLineaire } from "../../core/simplification.types";
import { randomInt, randomNonZeroInt } from "../secondDegre/aleatoire";
import { construireExerciceMiseEnEvidenceGeneralisee } from "./construireExerciceClassifie";
import { reduireSiPossible } from "./reductionFraction";

interface Parametres {
  k3: number;
  p3: number;
  mu: number;
  k2: number;
  p2: number;
  k4: number;
  p4: number;
  racineValide: number;
}

/**
 * Tire k3,p3,μ,k2,p2,k4,p4 dans [-plage,plage] (prompt-2-cas3-degre1.md, sous-variante b) et
 * vérifie que la racine valide (μ·k4·p4-k2·p2)/(μ·k4-k2) — solution de μ·P1_4-P1_2=0 — tombe sur
 * un entier différent de p2, p4 (les deux CE) et p3 (sinon racine double, dégénéré).
 */
function tirerParametres(plage: number): Parametres | null {
  const k3 = randomNonZeroInt(-4, 4);
  const mu = randomNonZeroInt(-4, 4);
  const k2 = randomNonZeroInt(-4, 4);
  const k4 = randomNonZeroInt(-4, 4);

  const p3 = randomInt(-plage, plage);
  let p2 = randomInt(-plage, plage);
  while (p2 === p3) p2 = randomInt(-plage, plage);
  let p4 = randomInt(-plage, plage);
  while (p4 === p3 || p4 === p2) p4 = randomInt(-plage, plage);

  const denominateur = mu * k4 - k2;
  if (denominateur === 0) return null;

  const numerateur = mu * k4 * p4 - k2 * p2;
  if (numerateur % denominateur !== 0) return null;

  const racineValide = numerateur / denominateur;
  if (racineValide === p2 || racineValide === p4 || racineValide === p3) return null;

  return { k3, p3, mu, k2, p2, k4, p4, racineValide };
}

const TENTATIVES_PAR_PLAGE = 300;
const PLAGES = [6, 10, 15];

/**
 * Sous-variante (b) : numérateurs proportionnels (prompt-2-cas3-degre1.md). P1_3=k3(x-p3) choisi,
 * μ choisi, P1_1=μ·P1_3. P1_2,P1_4 choisis librement, racines toutes distinctes deux à deux
 * (p2≠p4≠p3≠p2) pour éviter tout chevauchement accidentel avec une CE. La mise en croix se
 * factorise en P1_3·(μ·P1_4-P1_2)=0 : les deux racines (p3 et la racine valide) sont toujours
 * valides par construction (aucune n'est dans {p2,p4}) — contrairement à la sous-variante (a),
 * aucun rejet à l'étape "racines étrangères". `equationIsolee` toujours classée
 * `mise_en_evidence_generalisee`, même raisonnement que la sous-variante (a).
 */
export function construireSousVarianteB(): ExerciceDeuxFractionsLineaires {
  for (const plage of PLAGES) {
    for (let i = 0; i < TENTATIVES_PAR_PLAGE; i++) {
      const resultat = tirerParametres(plage);
      if (!resultat) continue;

      const { k3, p3, mu, k2, p2, k4, p4, racineValide } = resultat;

      const numerateurGauche: PolynomeLineaire = { k: mu * k3, p: p3 };
      const denominateurGauche: PolynomeLineaire = { k: k2, p: p2 };
      const numerateurDroit: PolynomeLineaire = { k: k3, p: p3 };
      const denominateurDroit: PolynomeLineaire = { k: k4, p: p4 };

      // Les deux fractions sont éligibles à réduction (contrairement à la sous-variante a) : ni
      // p1=p3 (racines déjà distinctes de p2/p4, garanti) ni p3=p4 ne les font jamais s'effondrer
      // en constante — seule une réduction numérique (pgcd>1) est possible pour l'une ou l'autre.
      const reductionGauche = reduireSiPossible("gauche", numerateurGauche, denominateurGauche);
      const reductionDroite = reduireSiPossible("droite", numerateurDroit, denominateurDroit);
      const fractionsSimplifiables = [reductionGauche.entree, reductionDroite.entree].filter(
        (entree): entree is NonNullable<typeof entree> => entree !== null,
      );

      // Racines (p3, racineValide) invariantes par réduction (fait algébrique général) : seul le
      // coefficient dominant change d'échelle — recalculé ici à partir des k effectifs des deux
      // côtés (formule générale du produit en croix, k1_eff*k4_eff - k3_eff*k2_eff).
      const a =
        reductionGauche.kNumerateurEffectif * reductionDroite.kDenominateurEffectif -
        reductionDroite.kNumerateurEffectif * reductionGauche.kDenominateurEffectif;
      const equationIsolee = construireExerciceMiseEnEvidenceGeneralisee(a, p3, racineValide);
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

  throw new Error("construireSousVarianteB : aucune combinaison valide trouvée");
}
