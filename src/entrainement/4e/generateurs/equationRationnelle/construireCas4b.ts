import type { ExerciceCas4b } from "../../core/equationRationnelle.types";
import type { PolynomeLineaire } from "../../core/simplification.types";
import { randomInt, randomNonZeroInt } from "../secondDegre/aleatoire";
import { construireP2Impose } from "../simplification/construireP2Impose";
import { construireExerciceClassifie } from "./construireExerciceClassifie";
import { chercherParametreEtRacines } from "./chercherEquationSimplifiee";

const TENTATIVES_PAR_PLAGE = 300;
const PLAGES = [6, 10, 15];
const PLAGE_P0 = 30;

/**
 * Cas 4b (prompt-cas4a-4b.md) : P1_1/P2 = P1_2/P0, où P1_1 (numérateur gauche) partage sa racine
 * `p` avec P2 (dénominateur gauche, racines {p, s}). `produit_remarquable` est exclu pour P2 (même
 * raison que partout ailleurs dans le projet quand un P2 sert de dénominateur : une racine double
 * laisserait un facteur (x-p) résiduel après une seule simplification, faisant échouer à tort le
 * contrôle structurel de verifierSimplification).
 *
 * Contrairement au cas 4a, la fraction simplifiée k1/[a(x-s)] (a = P2.enonce.a) n'exige aucune
 * contrainte de divisibilité sur k1 : le coefficient dominant `a` de P2 passe intact dans le
 * dénominateur réduit, seul le facteur (x-p) disparaît entièrement (numérateur et dénominateur en
 * perdent chacun une occurrence). Sans simplifier, la mise en croix P1_1·P0 = P1_2·P2 est un
 * polynôme de degré 3 (coefficient cubique k2·a toujours non nul — voir construireCas4b.test.ts).
 *
 * `p` exclut 0 — même correctif et même raison que construireCas4a.ts (bug confirmé empiriquement :
 * `construireP2Impose(0, ...)` peut produire un `binome_conjugue`/`mise_en_evidence` à racine 0,
 * rejeté par sa propre vérification qui exige une racine non nulle).
 */
export function construireCas4b(): ExerciceCas4b {
  for (const plage of PLAGES) {
    for (let i = 0; i < TENTATIVES_PAR_PLAGE; i++) {
      let p = randomInt(-plage, plage);
      while (p === 0) p = randomInt(-plage, plage);
      const P2 = construireP2Impose(p, { exclureProduitRemarquable: true });
      const s = P2.solution.racines.find((x) => x !== p) as number;

      const k1 = randomNonZeroInt(1, 4);
      const t = randomInt(-plage, plage);
      const k2 = randomInt(1, 4);

      const a = P2.enonce.a;

      // a·(x-t)·k2·(x-s) - k1·P0 = 0, à partir de k1/[a(x-s)] = k2(x-t)/P0
      const resultat = chercherParametreEtRacines(a * k2, -a * k2 * (t + s), a * k2 * t * s, k1, PLAGE_P0);
      if (!resultat) continue;

      const { param: P0, racines } = resultat;
      const equationIsolee = construireExerciceClassifie(a * k2, racines[0], racines[1]);
      const ce = ([p, s] as [number, number]).sort((x, y) => x - y);

      const numerateurGauche: PolynomeLineaire = { k: k1, p };

      return {
        construction: "p1_sur_p2",
        fractionGauche: { type: "P1/P2", racineCommune: p, numerateur: numerateurGauche, denominateur: P2 },
        numerateurDroit: { k: k2, p: t },
        P0,
        ce,
        equationIsolee,
        fractionsSimplifiables: [],
      };
    }
  }

  throw new Error("construireCas4b : aucune combinaison valide trouvée");
}
