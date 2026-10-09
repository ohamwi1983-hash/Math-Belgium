import type { AxeTransverse, ExerciceTangenteD } from "../../core6e/tangentesConique.types";
import { reduireFraction, tirerEntier, tirerParmi } from "./aleatoire";

/**
 * Couche A (6e) — génération famille D ("construire une conique depuis un point de passage et une
 * tangente"), `6gen62`.
 *
 * **Construction "vérité d'abord"** (mirroir `ExerciceFamilleB` de 6gen59, point de passage construit
 * à l'envers depuis `p`) : `a`,`b` (entiers) sont choisis EN PREMIER (jamais retrouvés après coup) ;
 * le point de passage P ET la droite tangente `d` sont ensuite DÉRIVÉS de cette conique VRAIE, pour
 * garantir un système {éq. passage, éq. tangence} cohérent et résoluble exactement.
 *
 * **P et le point de tangence Q de `d`, tous deux entiers/rationnels PROPRES** — paramétrisation
 * trigonométrique rationnelle (identité de Pythagore 3-4-5, réutilisée par translation à
 * l'ellipse ET l'hyperbole) :
 * - Ellipse `x²/a²+y²/b²=1` : `(x/a,y/b)=(3/5,4/5)` vérifie `(3/5)²+(4/5)²=1` — `a`,`b` multiples de
 *   5 pour rester entiers. P prend `y=+4b/5`, Q (point de tangence de `d`) prend `y=-4b/5` (même
 *   `x`, signe de `y` opposé) — 2 points distincts garantis (`b≠0`).
 * - Hyperbole `x²/a²-y²/b²=1` (axe transverse horizontal, mêmes formules après échange x↔y pour
 *   l'axe vertical) : `(x/a,y/b)=(5/3,4/3)` vérifie `(5/3)²-(4/3)²=1` (triplet 3-4-5) — `a`,`b`
 *   multiples de 3. Même principe P/Q (signe de `y` opposé).
 *
 * Dédoublement en `Q` donne la droite tangente `d` sous forme `y=mx+k` — formule REDÉRIVÉE
 * localement (pas un import de `algebreTangente.dedoublementCentree`, qui rend une forme implicite
 * `coefX·x+coefY·y=coefC` générale : ici on a besoin directement de la pente/ordonnée pour les
 * écrans 1-2 de l'élève, la conversion immédiate évite un pas de conversion supplémentaire) :
 * ellipse — `m=-3b/(4a)`, `k=5b/4` ; hyperbole (axe horizontal) — `m=5b/(4a)`, `k=-3b/4` (formules
 * vérifiées par test direct sur le point de tangence, voir `familleD.test.ts`).
 */

function construireEllipse(): ExerciceTangenteD {
  const facteurA = tirerEntier(1, 3);
  const facteurB = tirerEntier(1, 3);
  const a = 5 * facteurA;
  const b = 5 * facteurB;
  const P = { x: (3 * a) / 5, y: (4 * b) / 5 };
  const mBrut = -3 * b;
  const mDenBrut = 4 * a;
  const kBrut = 5 * b;
  const kDenBrut = 4;
  const { num: mNum, den: mDen } = reduireFraction(mBrut, mDenBrut);
  const { num: kNum, den: kDen } = reduireFraction(kBrut, kDenBrut);
  return { famille: "D", natureCible: "ellipse", axeTransverse: "horizontal", a, b, P, ligne: { mNum, mDen, kNum, kDen, m: mNum / mDen, k: kNum / kDen } };
}

/**
 * Hyperbole, axe transverse HORIZONTAL (`x²/a²-y²/b²=1`) — triplet `(5/3,4/3)` (`(5/3)²-(4/3)²=1`) :
 * `xQ=5a/3,yQ=4b/3` (point de tangence), `P=(xQ,-yQ)` (signe de y opposé). Dédoublement en Q :
 * `x·xQ/a²-y·yQ/b²=1 ⟹ y=(5b/(4a))·x-3b/4` (vérifié par test direct sur le point de tangence).
 */
function construireHyperboleHorizontale(a: number, b: number): ExerciceTangenteD {
  const xQ = (5 * a) / 3;
  const yQ = (4 * b) / 3;
  const P = { x: xQ, y: -yQ };
  const { num: mNum, den: mDen } = reduireFraction(5 * b, 4 * a);
  const { num: kNum, den: kDen } = reduireFraction(-3 * b, 4);
  return { famille: "D", natureCible: "hyperbole", axeTransverse: "horizontal", a, b, P, ligne: { mNum, mDen, kNum, kDen, m: mNum / mDen, k: kNum / kDen } };
}

/**
 * Hyperbole, axe transverse VERTICAL (`y²/a²-x²/b²=1`) — triplet `(5/3,4/3)` appliqué à `(y/a,x/b)` :
 * `yQ=5a/3,xQ=4b/3`, `P=(-xQ,yQ)` (signe de x opposé). Dédoublement en Q :
 * `y·yQ/a²-x·xQ/b²=1 ⟹ y=(4a/(5b))·x+3a/5` (rédérivé indépendamment du cas horizontal — PAS un
 * simple échange x↔y de la formule horizontale, qui donnerait le mauvais résultat : `a`/`b` jouent
 * ici des rôles ÉCHANGÉS par rapport au cas horizontal, voir `familleD.test.ts` pour la
 * vérification numérique directe).
 */
function construireHyperboleVerticale(a: number, b: number): ExerciceTangenteD {
  const yQ = (5 * a) / 3;
  const xQ = (4 * b) / 3;
  const P = { x: -xQ, y: yQ };
  const { num: mNum, den: mDen } = reduireFraction(4 * a, 5 * b);
  const { num: kNum, den: kDen } = reduireFraction(3 * a, 5);
  return { famille: "D", natureCible: "hyperbole", axeTransverse: "vertical", a, b, P, ligne: { mNum, mDen, kNum, kDen, m: mNum / mDen, k: kNum / kDen } };
}

function construireHyperbole(axeTransverse: AxeTransverse): ExerciceTangenteD {
  const a = 3 * tirerEntier(1, 3);
  const b = 3 * tirerEntier(1, 3);
  return axeTransverse === "horizontal" ? construireHyperboleHorizontale(a, b) : construireHyperboleVerticale(a, b);
}

export interface OverridesFamilleD {
  natureCible?: "ellipse" | "hyperbole";
  axeTransverse?: AxeTransverse;
}

export function construireFamilleD(overrides: OverridesFamilleD = {}): ExerciceTangenteD {
  const natureCible = overrides.natureCible ?? tirerParmi(["ellipse", "hyperbole"] as const);
  if (natureCible === "ellipse") return construireEllipse();
  const axeTransverse = overrides.axeTransverse ?? tirerParmi(["horizontal", "vertical"] as const);
  return construireHyperbole(axeTransverse);
}
