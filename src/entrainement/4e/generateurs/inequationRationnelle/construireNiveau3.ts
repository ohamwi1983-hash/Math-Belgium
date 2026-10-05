import type { Symbole } from "../../core/inequation.types";
import type { Exercice } from "../../core/generateur.types";
import type { PolynomeLineaire } from "../../core/simplification.types";
import type { ExerciceInequationRationnelleNiveau3 } from "../../core/inequationRationnelle.types";
import { randomInt } from "../secondDegre/aleatoire";
import { construireFacteurLineaire } from "../signesProduit/construireFacteurLineaire";
import { construireMiseEnEvidence } from "../secondDegre/categories/miseEnEvidence";
import { construireBinomeConjugue } from "../secondDegre/categories/binomeConjugue";
import { construireCasGeneral } from "../secondDegre/categories/casGeneral";
import { classifierSolutionQuotient, extraireSignesZonesQuotient } from "./grilleQuotient";
import { construireGrilleQuotientNiveau3 } from "./construireGrilleQuotientNiveau3";

const SYMBOLES: Symbole[] = ["<", ">", "≤", "≥"];

/**
 * Les 3 techniques éligibles pour P2_1 — jamais produit_remarquable (racine double, incompatible
 * avec la contrainte "toutes les racines distinctes" de la grille à 3 racines, même raison que
 * l'exclusion de produit_remarquable pour un dénominateur dans l'exercice "Simplifier" ou pour le
 * facteur factorisable de l'exercice "tableau de signes à plusieurs facteurs"), jamais
 * mise_en_evidence_generalisee (famille 5, hors périmètre).
 */
const TECHNIQUES = ["mise_en_evidence", "binome_conjugue", "cas_general"] as const;

function construireTechnique(technique: (typeof TECHNIQUES)[number], a: number): Omit<Exercice, "formeAffichage"> {
  switch (technique) {
    case "mise_en_evidence":
      return construireMiseEnEvidence({ aImpose: a });
    case "binome_conjugue":
      return construireBinomeConjugue({ aImpose: a });
    case "cas_general":
      return construireCasGeneral({ aImpose: a });
  }
}

/**
 * Construit P2_1 (section 1, point 3 de la spec) : coefficient dominant imposé `a`, racine tirée
 * en excluant activement celle de P1_2 (jamais tirage-puis-rejet global) — boucle bornée qui
 * retire un autre triplet technique/racines en cas de collision, même principe que
 * construireFacteurFactorisable (signesProduit).
 */
function construireP2_1Impose(a: number, racineExclue: number): Exercice {
  for (let tentative = 0; tentative < 50; tentative++) {
    const technique = TECHNIQUES[randomInt(0, TECHNIQUES.length - 1)];
    const partiel = construireTechnique(technique, a);
    if (!partiel.solution.racines.includes(racineExclue)) {
      return { ...partiel, formeAffichage: "canonique" };
    }
  }
  throw new Error("construireP2_1Impose : aucune combinaison valide trouvée après 50 tentatives");
}

const VALEURS_K_POSITIFS = [1, 2, 3];
const VALEURS_K_NEGATIFS = [-1, -2, -3];

/**
 * Tire k pour P1_3, de signe OPPOSÉ à celui déjà choisi pour P1_2 — garantit
 * a = -(k_P1_3 · k_P1_2) > 0 (section 1, point 2), ce qui évite d'avoir à introduire une ligne de
 * signe séparée pour le coefficient dominant de P2_1 dans la grille (même simplification que
 * construireFacteurFactorisable — signesProduit, où `a` est toujours tiré positif pour la même
 * raison). Sans cette contrainte, `a` pourrait être négatif et les deux lignes N (moniques,
 * x-r) ne suffiraient plus à elles seules à déterminer le signe réel de P2_1.
 */
function tirerKOppose(signeExistant: number): number {
  const pool = signeExistant > 0 ? VALEURS_K_NEGATIFS : VALEURS_K_POSITIFS;
  return pool[randomInt(0, pool.length - 1)];
}

/**
 * P1_1 = P2_1 + P1_3·P1_2 (section 1, point 4) — le terme en x² s'annule exactement par
 * construction (a = -(k3·k2) imposé à P2_1, section 1 point 2), vérifié ici explicitement plutôt
 * que supposé (section 1, point 5) : si jamais il ne s'annulait pas (ne devrait jamais arriver),
 * ou si le coefficient en x s'annule aussi (P1_1 dégénérerait en une constante, pas un vrai
 * polynôme du 1er degré), retourne null pour que l'appelant retire un nouveau triplet.
 */
function construireP1Combine(p2_1: Exercice, p1_3: PolynomeLineaire, p1_2: PolynomeLineaire): PolynomeLineaire | null {
  const { a: a2, b: b2, c: c2 } = p2_1.enonce;
  const { k: k3, p: p3 } = p1_3;
  const { k: k2, p: p2 } = p1_2;

  const coeffX2 = k3 * k2;
  const coeffX1 = -k3 * k2 * p2 - k3 * p3 * k2;
  const coeffX0 = k3 * p3 * k2 * p2;

  const totalA = a2 + coeffX2;
  const totalB = b2 + coeffX1;
  const totalC = c2 + coeffX0;

  if (Math.abs(totalA) > 1e-9) return null;
  if (totalB === 0) return null;

  return { k: totalB, p: -totalC / totalB };
}

/**
 * Construit un exercice de niveau 3 (section 1 de la spec) : P1_1/P1_2 ◇ P1_3(x), P1_3 un
 * polynôme du 1er degré (pas une constante — le niveau 2 couvre déjà ce cas). Construction "à
 * l'envers" comme le reste du projet : P1_2/P1_3 choisis d'abord, `a` imposé à P2_1 en découle,
 * P1_1 déduit par expansion — jamais a,b,c tirés au hasard puis vérifiés après coup.
 */
export function construireNiveau3(): ExerciceInequationRationnelleNiveau3 {
  let numerateurAvantCombinaison: PolynomeLineaire | null = null;
  let p1_2: PolynomeLineaire = { k: 1, p: 0 };
  let p1_3: PolynomeLineaire = { k: 1, p: 0 };
  let p2_1: Exercice = { categorie: "cas_general", enonce: { a: 1, b: 0, c: 0 }, solution: { racines: [0, 0], racinesExactes: true }, formeAffichage: "canonique" };

  while (numerateurAvantCombinaison === null) {
    const { facteur: facteurP1_2 } = construireFacteurLineaire([]);
    p1_2 = facteurP1_2.polynome;
    p1_3 = { k: tirerKOppose(p1_2.k), p: randomInt(-6, 6) };
    const a = -(p1_3.k * p1_2.k);
    p2_1 = construireP2_1Impose(a, p1_2.p);
    numerateurAvantCombinaison = construireP1Combine(p2_1, p1_3, p1_2);
  }

  const symbole = SYMBOLES[randomInt(0, SYMBOLES.length - 1)];
  const { racines, ce, grille } = construireGrilleQuotientNiveau3(p2_1, p1_2);
  const zones = extraireSignesZonesQuotient(grille.ligneQuotient);
  const solution = classifierSolutionQuotient(racines, ce, zones, symbole);

  return {
    niveau: "niveau3",
    numerateur: p2_1,
    denominateur: p1_2,
    numerateurAvantCombinaison,
    p1_3,
    symbole,
    ce,
    racines,
    grille,
    solution,
  };
}
