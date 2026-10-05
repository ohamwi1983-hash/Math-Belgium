import type { Exercice } from "../../core/generateur.types";
import type { ExerciceSimplification, PolynomeLineaire } from "../../core/simplification.types";
import type { GrilleQuotient } from "../../core/inequationRationnelle.types";
import { signeLineaire, signeQuotient, valeurRepresentative } from "./grilleQuotient";

/** `fraction.numerateur`/`.denominateur` sont toujours des P2 pour le type "P2/P2" (seul type utilisé par facteurCommun). */
function commeP2(poly: ExerciceSimplification["numerateur"]): Exercice {
  if ("k" in poly) {
    throw new Error("construireGrilleFacteurCommun : attendu un P2 (fraction.type doit être \"P2/P2\")");
  }
  return poly;
}

/** L'autre racine que p (les deux racines d'un P2 partageant p sont toujours distinctes de p et entre elles — voir construireFacteurCommun.ts). */
function secondeRacineDe(exercice: Exercice, p: number): number {
  const [r1, r2] = exercice.solution.racines;
  return r1 === p ? r2 : r1;
}

/**
 * Construit la grille de signes attendue pour N(x)/D(x) ◇ 0 (variante "facteur commun") à partir de
 * la fraction déjà simplifiée : N(x)/D(x) = a_N(x-p)(x-q) / [a_D(x-p)(x-s)] = (a_N/a_D)(x-q)/(x-s)
 * pour x≠p — puisque a_N et a_D sont toujours positifs par construction (construireP2Impose ne
 * passe jamais aImpose), leur rapport ne change aucun signe : (x-q)/(x-s) monique suffit pour toute
 * l'analyse de signe (même principe que les lignes N moniques du niveau 3, voir
 * core/inequationRationnelle.types.ts).
 *
 * Point clé (spec section 4) : la colonne de p doit apparaître dans l'en-tête (c'est une CE) avec
 * "∄" sur la ligne quotient, même si p n'est la racine d'aucune ligne affichée après simplification
 * (q et s en sont les seules racines). Implémenté en réutilisant la règle générale déjà en place
 * "∄ à toute colonne de CE" (ici généralisée à `ce.includes(racineColonne)`, pas seulement "D vaut
 * 0 à cette colonne") plutôt qu'un nouveau cas spécial — à la colonne de s, les deux formulations
 * coïncident (s est aussi une racine réelle de D simplifié), seule la colonne de p a réellement
 * besoin de cette généralisation.
 */
export function construireGrilleFacteurCommun(fraction: ExerciceSimplification): {
  racines: number[];
  ce: [number, number];
  numerateurSimplifie: PolynomeLineaire;
  denominateurSimplifie: PolynomeLineaire;
  grille: GrilleQuotient;
} {
  const p = fraction.racineCommune;
  const D = commeP2(fraction.denominateur);
  const N = commeP2(fraction.numerateur);
  const s = secondeRacineDe(D, p);
  const q = secondeRacineDe(N, p);

  const numerateurSimplifie: PolynomeLineaire = { k: 1, p: q };
  const denominateurSimplifie: PolynomeLineaire = { k: 1, p: s };

  const racines = [p, q, s].sort((a, b) => a - b);
  const ce = [p, s].sort((a, b) => a - b) as [number, number];

  const nbColonnes = 2 * racines.length + 1;
  const points = Array.from({ length: nbColonnes }, (_, colonne) => valeurRepresentative(racines, colonne));

  const ligneNumerateur = points.map((x) => signeLineaire(numerateurSimplifie, x));
  const ligneDenominateur = points.map((x) => signeLineaire(denominateurSimplifie, x));
  const ligneQuotient = points.map((_, i) => {
    const racineColonne = i % 2 === 1 ? racines[(i - 1) / 2] : null;
    if (racineColonne !== null && ce.includes(racineColonne)) return "∄" as const;
    return signeQuotient(ligneNumerateur[i], ligneDenominateur[i]);
  });

  return { racines, ce, numerateurSimplifie, denominateurSimplifie, grille: { ligneNumerateur, ligneDenominateur, ligneQuotient } };
}
