import type { Symbole } from "../../core/inequation.types";
import type { PolynomeLineaire } from "../../core/simplification.types";
import type { ExerciceInequationRationnelleDenominateurCarre } from "../../core/inequationRationnelle.types";
import { randomInt, randomNonZeroInt } from "../secondDegre/aleatoire";
import { construireExerciceClassifie } from "../equationRationnelle/construireExerciceClassifie";
import { classifierSolutionQuotient, extraireSignesZonesQuotient } from "./grilleQuotient";
import { construireGrilleQuotientDenominateurCarre } from "./construireGrilleQuotientDenominateurCarre";

const SYMBOLES: Symbole[] = ["<", ">", "≤", "≥"];

/**
 * Construit un exercice à partir de paramètres imposés (p = racine de P1_2, d = écart entre les
 * racines cibles du numérateur et p, a = coefficient dominant cible) — extraite de
 * construireDenominateurCarre() pour permettre un test de régression déterministe sur l'exemple du
 * PDF (section 4 de la spec), sans dépendre du tirage aléatoire.
 *
 * Identité algébrique (section 1, point 3 de la spec) : A - k·(P1_2(x))² doit égaler le numérateur
 * cible a(x-r1)(x-r2) avec r1=p-d, r2=p+d. P1_2 étant toujours monique (k2=1, voir
 * core/inequationRationnelle.types.ts), (P1_2(x))² = (x-p)² = x²-2px+p², donc
 * A - k·(x²-2px+p²) = -k·x² + 2kp·x + (A-k·p²). Par identification avec a·x²-a(r1+r2)·x+a·r1·r2 :
 * -k = a ⟹ k = -a (toujours entier, non nul puisque a≠0) ; puis A = a·r1·r2 + k·p² =
 * a·r1·r2 - a·p² = a·(r1·r2 - p²) = a·((p-d)(p+d) - p²) = a·(-d²) = -a·d² (toujours entier, non nul
 * puisque a≠0 et d≠0). r1=p-d≠p et r2=p+d≠p sont garantis par d≠0 ; r1≠r2 également (2d≠0) — donc
 * `produit_remarquable` (qui exigerait r1=r2) n'est jamais atteint par construireExerciceClassifie
 * ici, mathématiquement impossible : r1=r2 impliquerait d=0, exclu.
 */
export function construireDenominateurCarreAvecParametres(
  p: number,
  d: number,
  a: number,
  symbole: Symbole,
): ExerciceInequationRationnelleDenominateurCarre {
  const r1 = p - d;
  const r2 = p + d;
  const numerateur = construireExerciceClassifie(a, r1, r2);
  const k = -a;
  const A = -a * d * d;
  const denominateur: PolynomeLineaire = { k: 1, p };

  const { racines, ce, grille } = construireGrilleQuotientDenominateurCarre(numerateur, denominateur);
  const zones = extraireSignesZonesQuotient(grille.ligneQuotient);
  const solution = classifierSolutionQuotient(racines, ce, zones, symbole);

  return {
    niveau: "denominateurCarre",
    numerateur,
    denominateur,
    A,
    k,
    symbole,
    ce,
    racines,
    grille,
    solution,
  };
}

/**
 * Construit un exercice de la variante "dénominateur au carré" (A/(P1_2)² ◇ k) : P1_2 (racine p)
 * choisie librement, puis les racines cibles du numérateur combiné choisies SYMÉTRIQUEMENT autour
 * de p (r1=p-d, r2=p+d, d≠0) — seule façon pour A - k·(P1_2)² d'égaler une vraie quadratique en x
 * (l'identité impose que ses racines soient symétriques autour de p, voir
 * construireDenominateurCarreAvecParametres). A et k s'en déduisent directement (jamais de
 * recherche/rééchantillonnage nécessaire, contrairement aux autres constructions génériques du
 * projet : les racines étant choisies directement comme entiers, aucun discriminant à vérifier).
 */
export function construireDenominateurCarre(): ExerciceInequationRationnelleDenominateurCarre {
  const p = randomInt(-6, 6);
  const d = randomNonZeroInt(-5, 5);
  const a = randomNonZeroInt(-4, 4);
  const symbole = SYMBOLES[randomInt(0, SYMBOLES.length - 1)];
  return construireDenominateurCarreAvecParametres(p, d, a, symbole);
}
