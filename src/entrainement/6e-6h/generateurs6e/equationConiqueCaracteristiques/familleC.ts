import type { AxeCaracteristique, DonneeConiqueC, ExerciceFamilleC, FractionExacte } from "../../core6e/equationConiqueCaracteristiques.types";
import type { NatureConique } from "../../core6e/identificationConiques.types";
import { reduireFraction, tirerEntier, tirerParmi } from "./aleatoire";

/**
 * Couche A (6e) — génération, famille C de `6gen59` : conique centrée à l'origine depuis 2 données
 * parmi `{2c=|FF'|, e=c/a, distance entre les directrices=2a²/c, 2a=distance entre les sommets}`.
 *
 * `a`,`c` (les 2 valeurs RÉELLEMENT recherchées) sont tirés EN PREMIER (entiers, cohérents avec la
 * `natureCible` choisie) — les 4 quantités `{2a,2c,e,d}` sont ensuite dérivées EXACTEMENT (fractions
 * réduites, `reduireFraction`, jamais de décimal — CLAUDE.md) et 2 d'entre elles sont retenues comme
 * "données de l'énoncé". Aucune résolution de système n'est donc nécessaire côté vérification
 * (`moteur6e/verificationEquationConiqueCaracteristiques.ts`) : `a`/`c` sont déjà connus, la
 * vérification compare juste la saisie élève à ces valeurs — la vraie difficulté est côté ÉLÈVE
 * (combiner les 2 relations affichées), pas côté génération.
 *
 * Combinaison `{deuxC,deuxA}` EXCLUE délibérément (mission, piège central : "combiner les 2
 * relations pour isoler a" n'aurait aucun sens si a et c sont DÉJÀ directement donnés tous les
 * deux) — les 5 combinaisons restantes exigent TOUTES une vraie combinaison algébrique (au moins un
 * passage par `e` ou `d`, jamais une lecture directe des 2 quantités recherchées).
 */

const TOUTES_COMBINAISONS: [DonneeConiqueC, DonneeConiqueC][] = [
  ["deuxC", "excentricite"],
  ["deuxC", "distanceDirectrices"],
  ["deuxA", "excentricite"],
  ["deuxA", "distanceDirectrices"],
  ["excentricite", "distanceDirectrices"],
];

function valeurDonnee(donnee: DonneeConiqueC, a: number, c: number): FractionExacte {
  if (donnee === "deuxA") return { num: 2 * a, den: 1 };
  if (donnee === "deuxC") return { num: 2 * c, den: 1 };
  if (donnee === "excentricite") return reduireFraction(c, a);
  // distance entre les directrices = 2a²/c.
  return reduireFraction(2 * a * a, c);
}

export interface OverridesFamilleC {
  natureCible?: "ellipse" | "hyperbole";
  axeTransverse?: AxeCaracteristique;
  combinaison?: [DonneeConiqueC, DonneeConiqueC];
}

export function construireFamilleC(overrides: OverridesFamilleC = {}): ExerciceFamilleC {
  const natureCible = overrides.natureCible ?? tirerParmi(["ellipse", "hyperbole"] as const);
  const axeTransverse = overrides.axeTransverse ?? tirerParmi(["horizontal", "vertical"] as const);

  let a: number;
  let c: number;
  if (natureCible === "ellipse") {
    a = tirerEntier(4, 9);
    c = tirerEntier(1, a - 1);
  } else {
    a = tirerEntier(2, 6);
    c = tirerEntier(a + 1, a + 5);
  }
  const bCarre = natureCible === "ellipse" ? a * a - c * c : c * c - a * a;
  const nature: NatureConique = { type: natureCible, axe: axeTransverse };

  const [donnee1, donnee2] = overrides.combinaison ?? tirerParmi(TOUTES_COMBINAISONS);
  const valeurDonnee1 = valeurDonnee(donnee1, a, c);
  const valeurDonnee2 = valeurDonnee(donnee2, a, c);

  return { famille: "C", natureCible, axeTransverse, a, c, donnee1, donnee2, valeurDonnee1, valeurDonnee2, bCarre, nature };
}
