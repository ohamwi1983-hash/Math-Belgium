import type { Symbole } from "../../core/inequation.types";
import type { PolynomeLineaire } from "../../core/simplification.types";
import type { ExerciceInequationRationnelleNiveau4 } from "../../core/inequationRationnelle.types";
import { randomInt, randomNonZeroInt } from "../secondDegre/aleatoire";
import { construireExerciceClassifie } from "../equationRationnelle/construireExerciceClassifie";
import { classifierSolutionQuotient, extraireSignesZonesQuotient } from "./grilleQuotient";
import { construireGrilleQuotientNiveau4 } from "./construireGrilleQuotientNiveau4";

const SYMBOLES: Symbole[] = ["<", ">", "≤", "≥"];

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
 * Tire k1..k4 (non nuls) et p1..p4 pairwise distincts (section 1, point 1 de la spec — contrairement
 * à équationRationnelle cas3c, qui n'exclut qu'un sous-ensemble des coïncidences p1..p4, ici les 4
 * doivent l'être intégralement), calcule le numérateur combiné a,b,c = P1_1·P1_4 - P1_3·P1_2 (même
 * formule que cas3c, la mise en croix étant identique), rejette si `a≤0` (jamais seulement `a=0` —
 * voir construireGrilleQuotientNiveau4.ts : un `a` négatif casserait le calcul de signe par simple
 * produit des deux facteurs moniques, même contrainte que niveau3/signesProduit), si le discriminant
 * n'est pas un carré parfait, ou si les racines de P2_1 coïncident entre elles ou avec p2/p4 (les
 * seules valeurs qui comptent réellement pour la grille/CE finales — p1/p3 n'apparaissent jamais
 * dans l'exercice final, voir core/inequationRationnelle.types.ts).
 */
function tirerParametres(plage: number): Parametres | null {
  const k1 = randomNonZeroInt(-4, 4);
  const k2 = randomNonZeroInt(-4, 4);
  const k3 = randomNonZeroInt(-4, 4);
  const k4 = randomNonZeroInt(-4, 4);

  const p1 = randomInt(-plage, plage);
  let p2 = randomInt(-plage, plage);
  while (p2 === p1) p2 = randomInt(-plage, plage);
  let p3 = randomInt(-plage, plage);
  while (p3 === p1 || p3 === p2) p3 = randomInt(-plage, plage);
  let p4 = randomInt(-plage, plage);
  while (p4 === p1 || p4 === p2 || p4 === p3) p4 = randomInt(-plage, plage);

  const a = k1 * k4 - k3 * k2;
  if (a <= 0) return null;

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
  if (r1 === r2) return null;
  if (r1 === p2 || r1 === p4 || r2 === p2 || r2 === p4) return null;

  return { k1, p1, k2, p2, k3, p3, k4, p4, r1, r2 };
}

const TENTATIVES_PAR_PLAGE = 500;
const PLAGES = [6, 10, 15, 20];

/**
 * Construit un exercice de niveau 4 (section 1 de la spec) : P1_1/P1_2 ◇ P1_3/P1_4, quatre
 * polynômes du 1er degré. Approche directe (contrairement au reste du générateur, qui construit
 * "à l'envers" à partir d'une technique choisie a priori) : les 4 polynômes sont choisis librement
 * puis P2_1 (numérateur combiné) est calculé et classifié a posteriori — même principe que
 * construireSousVarianteC (équations rationnelles, cas 3c), dont la formule de mise en croix est
 * réutilisée à l'identique.
 */
export function construireNiveau4(): ExerciceInequationRationnelleNiveau4 {
  for (const plage of PLAGES) {
    for (let i = 0; i < TENTATIVES_PAR_PLAGE; i++) {
      const resultat = tirerParametres(plage);
      if (!resultat) continue;

      const { k1, p1, k2, p2, k3, p3, k4, p4, r1, r2 } = resultat;
      const numerateurGaucheAvantCombinaison: PolynomeLineaire = { k: k1, p: p1 };
      const denominateurGauche: PolynomeLineaire = { k: k2, p: p2 };
      const numerateurDroitAvantCombinaison: PolynomeLineaire = { k: k3, p: p3 };
      const denominateurDroit: PolynomeLineaire = { k: k4, p: p4 };

      const a = k1 * k4 - k3 * k2;
      const numerateur = construireExerciceClassifie(a, r1, r2);

      const symbole = SYMBOLES[randomInt(0, SYMBOLES.length - 1)];
      const { racines, ce, grille } = construireGrilleQuotientNiveau4(numerateur, denominateurGauche, denominateurDroit);
      const zones = extraireSignesZonesQuotient(grille.ligneQuotient);
      const solution = classifierSolutionQuotient(racines, ce, zones, symbole);

      return {
        niveau: "niveau4",
        numerateur,
        denominateurGauche,
        denominateurDroit,
        numerateurGaucheAvantCombinaison,
        numerateurDroitAvantCombinaison,
        symbole,
        ce,
        racines,
        grille,
        solution,
      };
    }
  }

  throw new Error("construireNiveau4 : aucune combinaison valide trouvée");
}
