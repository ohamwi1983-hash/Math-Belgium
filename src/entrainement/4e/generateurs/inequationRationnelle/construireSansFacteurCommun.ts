import type { Symbole } from "../../core/inequation.types";
import type { Exercice } from "../../core/generateur.types";
import type { ExerciceInequationRationnelleSansFacteurCommun } from "../../core/inequationRationnelle.types";
import { randomInt, randomNonZeroInt } from "../secondDegre/aleatoire";
import { construireBinomeConjugue } from "../secondDegre/categories/binomeConjugue";
import { construireCasGeneral } from "../secondDegre/categories/casGeneral";
import { construireMiseEnEvidence } from "../secondDegre/categories/miseEnEvidence";
import { classifierSolutionQuotient, extraireSignesZonesQuotient } from "./grilleQuotient";
import { construireGrilleQuotientSansFacteurCommun } from "./construireGrilleQuotientSansFacteurCommun";

const SYMBOLES: Symbole[] = ["<", ">", "≤", "≥"];
const TENTATIVES_MAX = 50;

/**
 * Une des 3 techniques (mise_en_evidence/binome_conjugue/cas_general) — produit_remarquable exclu
 * pour D ET pour le numérateur combiné (l'énoncé littéral de la spec dit "une des 4 techniques",
 * mais une racine double casserait l'hypothèse "4 racines distinctes" sur laquelle repose
 * construireGrilleQuotientSansFacteurCommun — même raison que construireFacteurFactorisable,
 * signesProduit, et l'exclusion pour un dénominateur côté exercice "Simplifier", voir CLAUDE.md).
 * Les 3 techniques restantes tirent toujours un coefficient dominant `a` positif — nécessaire pour
 * que la grille traite chaque paire de racines comme 2 lignes moniques (x-r).
 */
const constructeurs: Array<() => Omit<Exercice, "formeAffichage">> = [
  construireMiseEnEvidence,
  construireBinomeConjugue,
  construireCasGeneral,
];

/** Construit un P2 factorisable (hors produit_remarquable) dont aucune racine ne coïncide avec `racinesExclues` — même principe de recherche par essais que construireFacteurFactorisable (signesProduit). */
function construireQuadratiqueSansRacines(racinesExclues: number[]): Exercice {
  for (let tentative = 0; tentative < TENTATIVES_MAX; tentative++) {
    const brut = constructeurs[randomInt(0, constructeurs.length - 1)]();
    const [r1, r2] = brut.solution.racines;
    if (racinesExclues.includes(r1) || racinesExclues.includes(r2)) continue;
    return { ...brut, formeAffichage: "canonique" };
  }
  throw new Error("construireSansFacteurCommun : aucune combinaison sans collision de racines trouvée");
}

/**
 * Construit un exercice de la variante "sans facteur commun" (item f, exact miroir de
 * `facteurCommun`) : D(x) construit en premier (racines s1,s2), puis le numérateur combiné visé
 * (racines r1,r2, en excluant s1/s2 — aucun facteur commun, contrairement à `facteurCommun`), puis
 * N(x) = numérateur_combiné + k·D(x) pour un k non nul choisi tel que le coefficient dominant de N
 * ne s'annule pas entre les deux membres (rééchantillonné sinon — section 1, point 5 de la spec).
 */
export function construireSansFacteurCommun(): ExerciceInequationRationnelleSansFacteurCommun {
  const denominateur = construireQuadratiqueSansRacines([]);
  const [s1, s2] = denominateur.solution.racines;
  const numerateur = construireQuadratiqueSansRacines([s1, s2]);

  const n = numerateur.enonce;
  const d = denominateur.enonce;

  let k = randomNonZeroInt(-4, 4);
  while (n.a + k * d.a === 0) k = randomNonZeroInt(-4, 4);

  const numerateurAvantCombinaison = { a: n.a + k * d.a, b: n.b + k * d.b, c: n.c + k * d.c };

  const symbole = SYMBOLES[randomInt(0, SYMBOLES.length - 1)];
  const { racines, ce, grille } = construireGrilleQuotientSansFacteurCommun(numerateur, denominateur);
  const zones = extraireSignesZonesQuotient(grille.ligneQuotient);
  const solution = classifierSolutionQuotient(racines, ce, zones, symbole);

  return {
    niveau: "sansFacteurCommun",
    numerateur,
    denominateur,
    numerateurAvantCombinaison,
    k,
    symbole,
    ce,
    racines,
    grille,
    solution,
  };
}
