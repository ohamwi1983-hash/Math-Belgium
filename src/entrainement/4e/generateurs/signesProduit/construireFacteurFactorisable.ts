import type { Exercice } from "../../core/generateur.types";
import type { FacteurQuadratiqueFactorisable } from "../../core/signesProduit.types";
import { construireBinomeConjugue } from "../secondDegre/categories/binomeConjugue";
import { construireCasGeneral } from "../secondDegre/categories/casGeneral";
import { construireMiseEnEvidence } from "../secondDegre/categories/miseEnEvidence";
import { randomInt } from "../secondDegre/aleatoire";

const TENTATIVES_MAX = 50;

/**
 * Une des 3 techniques (mise_en_evidence/binome_conjugue/cas_general) — produit_remarquable exclu
 * délibérément : sa racine double violerait la contrainte "toutes les racines distinctes" (section
 * 1 de la spec), une seule valeur ne pouvant occuper 2 lignes distinctes du tableau (même raison
 * que l'exclusion de produit_remarquable pour un dénominateur à l'exercice "Simplifier", voir
 * CLAUDE.md).
 */
const constructeurs: Array<(options?: { aImpose?: number }) => Omit<Exercice, "formeAffichage">> = [
  construireMiseEnEvidence,
  construireBinomeConjugue,
  construireCasGeneral,
];

/**
 * Coefficient dominant `a` — magnitude dans [1,4], signe tiré une chance sur deux
 * (promptgenerateur5signesProduit.md, point 8). Un `a` négatif produit une ligne "p0" dédiée dans
 * le tableau (voir grille.ts::ordreLignesGrille) et apparaît explicitement dans la décomposition
 * complète affichée à l'étape tableau (voir ui/formatSignesProduit.ts) — un `a` positif reste
 * invisible au signe comme avant, jamais sa propre ligne.
 */
function tirerA(): number {
  const magnitude = randomInt(1, 4);
  return randomInt(0, 1) === 0 ? magnitude : -magnitude;
}

/** Retire une chance sur les racines déjà utilisées par un autre facteur, en réessayant si collision (domaine restreint, boucle bornée — même principe que les autres recherches par essais du projet). */
export function construireFacteurFactorisable(
  racinesExclues: number[],
): { facteur: FacteurQuadratiqueFactorisable; racines: [number, number] } {
  for (let tentative = 0; tentative < TENTATIVES_MAX; tentative++) {
    const construire = constructeurs[randomInt(0, constructeurs.length - 1)];
    const brut = construire({ aImpose: tirerA() });
    const [r1, r2] = brut.solution.racines;
    if (racinesExclues.includes(r1) || racinesExclues.includes(r2)) continue;
    const exercice: Exercice = { ...brut, formeAffichage: "canonique" };
    return { facteur: { type: "quadratique_factorisable", exercice }, racines: [r1, r2] };
  }
  throw new Error("construireFacteurFactorisable : aucune combinaison sans collision de racines trouvée");
}
