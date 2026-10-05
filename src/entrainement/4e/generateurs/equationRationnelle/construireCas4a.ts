import type { ExerciceCas4a } from "../../core/equationRationnelle.types";
import type { PolynomeLineaire } from "../../core/simplification.types";
import { randomInt } from "../secondDegre/aleatoire";
import { construireP2Impose } from "../simplification/construireP2Impose";
import { construireExerciceClassifie } from "./construireExerciceClassifie";
import { chercherParametreEtRacines } from "./chercherEquationSimplifiee";

const TENTATIVES_PAR_PLAGE = 300;
const PLAGES = [6, 10, 15];
const PLAGE_P0 = 30;

/** Diviseurs positifs de n (n toujours > 0 ici, coefficient dominant d'un P2). */
function diviseurs(n: number): number[] {
  const resultat: number[] = [];
  for (let d = 1; d <= n; d++) {
    if (n % d === 0) resultat.push(d);
  }
  return resultat;
}

/**
 * Cas 4a (prompt-cas4a-4b.md) : P2/P1_1 = P0/P1_2, où P2 (numérateur gauche) partage sa racine `p`
 * avec P1_1 (dénominateur gauche). Contrairement aux autres constructions de ce générateur, la
 * simplification n'est pas seulement une astuce pour éviter un piège : sans elle, l'équation est
 * un polynôme de degré 3 (voir construireCas4a.test.ts, vérifié par développement indépendant).
 *
 * `k1` (coefficient de P1_1) est choisi comme un diviseur du coefficient dominant `a` de P2, pour
 * que la fraction simplifiée A(x-r) = P2/P1_1 (A = a/k1) ait un coefficient entier — jamais une
 * fraction non nécessaire dans la forme réduite affichée. `produit_remarquable` est autorisé pour
 * P2 ici (il est numérateur, jamais dénominateur) : voir CLAUDE.md, aucun facteur résiduel
 * problématique puisque c'est le dénominateur P1_1 qui est testé par verifierSimplification.
 *
 * Les paramètres P0 sont recherchés par essais successifs (chercherParametreEtRacines) pour que
 * l'équation SIMPLIFIÉE, une fois mise en croix, ait un discriminant carré parfait à racines
 * entières — jamais choisis puis vérifiés a posteriori sans garantie, mais jamais non plus dérivés
 * analytiquement à l'envers (trop de degrés de liberté) : même principe de recherche que
 * construireDeuxDenominateurs.ts/construireSousVarianteC.ts.
 *
 * `p` (racine commune) exclut 0 — même raison et même exclusion que `tirerRacineCommune`
 * (generateurs/simplification/aleatoire.ts) : `construireP2Impose(0, ...)` peut produire un P2
 * structurellement dégénéré (`binome_conjugue`/`produit_remarquable` avec racine 0, rejeté par
 * `verifierBinomeConjugue` qui exige explicitement une racine non nulle) — confirmé empiriquement
 * avant ce correctif (voir l'historique : `construireCas4a`/`construireCas4b` réutilisent la même
 * fonction `construireP2Impose` que l'exercice "Simplifier", qui évite ce cas en excluant 0 à la
 * source plutôt qu'en corrigeant les constructeurs de technique partagés).
 */
export function construireCas4a(): ExerciceCas4a {
  for (const plage of PLAGES) {
    for (let i = 0; i < TENTATIVES_PAR_PLAGE; i++) {
      let p = randomInt(-plage, plage);
      while (p === 0) p = randomInt(-plage, plage);
      const P2 = construireP2Impose(p, {});

      const diviseursDeA = diviseurs(P2.enonce.a);
      const k1 = diviseursDeA[Math.floor(Math.random() * diviseursDeA.length)];
      const A = P2.enonce.a / k1;

      let q = randomInt(-plage, plage);
      while (q === p) q = randomInt(-plage, plage);
      const k2 = randomInt(1, 4);

      const r = P2.solution.racines.find((x) => x !== p) ?? p;

      // A·(x-r) = P0/(k2(x-q)) → A·k2·(x-r)(x-q) - P0 = 0
      const resultat = chercherParametreEtRacines(A * k2, -A * k2 * (r + q), A * k2 * r * q, 1, PLAGE_P0);
      if (!resultat) continue;

      const { param: P0, racines } = resultat;
      const equationIsolee = construireExerciceClassifie(A * k2, racines[0], racines[1]);
      const ce = ([p, q] as [number, number]).sort((x, y) => x - y);

      const denominateurGauche: PolynomeLineaire = { k: k1, p };

      return {
        construction: "p2_sur_p1",
        fractionGauche: { type: "P2/P1", racineCommune: p, numerateur: P2, denominateur: denominateurGauche },
        denominateurDroit: { k: k2, p: q },
        P0,
        ce,
        equationIsolee,
        fractionsSimplifiables: [],
      };
    }
  }

  throw new Error("construireCas4a : aucune combinaison valide trouvée");
}
