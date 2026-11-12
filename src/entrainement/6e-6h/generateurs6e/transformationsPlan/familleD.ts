import type { AffixeEntiere, ExerciceTransfoD, NatureTransfoD } from "../../core6e/transformationsPlan.types";
import { tirerEntier, tirerParmi } from "../calculPrimitives/aleatoire";
import { calculerArgument } from "../formeTrigonometrique/familleA";
import { multiplierAffixe, tirerAffixeEntiereArbitraire, tirerPermutation } from "./partage";

/**
 * Couche A (6e) — génération, famille D (« z′ = az + b : nature, centre, angle, rapport ») de
 * `6gen40` — audit 6e ch. 5, point 42 (décision I). Couvre les 4 lignes du tableau de
 * classification du cours (§ 7) avec un centre Ω ≠ O, jusque-là jamais travaillé :
 * - translation : a = 1, b ≠ 0 (aucun point fixe) ;
 * - rotation : a ∈ {i ; −i} (|a| = 1, a ≠ 1) ;
 * - homothétie : a ∈ {−3 ; −2 ; 2 ; 3} (réel, ≠ 0 et ≠ 1 ; −1 exclu, voir le type) ;
 * - similitude : a ∈ {±1 ± i ; ±2i ; 2 ± 2i ; −2 ± 2i} (ni réel, ni de module 1).
 *
 * **Construction à rebours** : Ω est tiré ENTIER (≠ O) puis b = Ω(1 − a) — garantit un centre
 * Ω = b/(1 − a) entier exact, sans boucle de rejet ni fraction à l'écran.
 */

export const NATURES_D: NatureTransfoD[] = ["translation", "rotation", "homothetie", "similitude"];

const A_ROTATION: AffixeEntiere[] = [
  { a: 0, b: 1 },
  { a: 0, b: -1 },
];
const A_HOMOTHETIE: AffixeEntiere[] = [-3, -2, 2, 3].map((k) => ({ a: k, b: 0 }));
const A_SIMILITUDE: AffixeEntiere[] = [
  { a: 1, b: 1 },
  { a: 1, b: -1 },
  { a: -1, b: 1 },
  { a: -1, b: -1 },
  { a: 0, b: 2 },
  { a: 0, b: -2 },
  { a: 2, b: 2 },
  { a: 2, b: -2 },
  { a: -2, b: 2 },
  { a: -2, b: -2 },
];

const PORTEE_CENTRE = 3;
const PORTEE_VECTEUR = 5;

/** √n simplifié en LaTeX (n entier ≥ 1) : 2 → \sqrt{2}, 8 → 2\sqrt{2}, 4 → 2. */
function racineLatex(n: number): string {
  let k = 1;
  let m = n;
  for (let d = 2; d * d <= m; d++) {
    while (m % (d * d) === 0) {
      m /= d * d;
      k *= d;
    }
  }
  if (m === 1) return `${k}`;
  return k === 1 ? `\\sqrt{${m}}` : `${k}\\sqrt{${m}}`;
}

export function construireFamilleD(natureForcee?: NatureTransfoD): ExerciceTransfoD {
  const nature = natureForcee ?? tirerParmi(NATURES_D);
  const ordreNatures = tirerPermutation(4);
  if (nature === "translation") {
    const b = tirerAffixeEntiereArbitraire(PORTEE_VECTEUR);
    return { famille: "D", nature, a: { a: 1, b: 0 }, b, centre: null, rapport: 1, rapportLatex: "1", angle: calculerArgument(1, 0), ordreNatures };
  }
  const a = tirerParmi(nature === "rotation" ? A_ROTATION : nature === "homothetie" ? A_HOMOTHETIE : A_SIMILITUDE);
  let centre: AffixeEntiere;
  do {
    centre = { a: tirerEntier(-PORTEE_CENTRE, PORTEE_CENTRE), b: tirerEntier(-PORTEE_CENTRE, PORTEE_CENTRE) };
  } while (centre.a === 0 && centre.b === 0);
  const unMoinsA: AffixeEntiere = { a: 1 - a.a, b: -a.b };
  const b = multiplierAffixe(centre, unMoinsA);
  const module2 = a.a * a.a + a.b * a.b;
  const rapport = nature === "homothetie" ? a.a : Math.sqrt(module2);
  const rapportLatex = nature === "homothetie" ? `${a.a}` : racineLatex(module2);
  return { famille: "D", nature, a, b, centre, rapport, rapportLatex, angle: calculerArgument(a.a, a.b), ordreNatures };
}
