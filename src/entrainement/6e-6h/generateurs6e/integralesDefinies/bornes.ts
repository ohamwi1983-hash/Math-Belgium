import type { ExerciceCalculPrimitives } from "../../core6e/calculPrimitives.types";
import { tirerParmi } from "../calculPrimitives/aleatoire";

/**
 * Couche A (6e) — choix de bornes a<b VALIDES (F(a) et F(b) finis) pour un exercice de calcul de
 * primitive emprunté QUELCONQUE (famille A/B/C/G, tout sous-type) pour `6gen25`, scénarios
 * `simple`/`moyenne`.
 *
 * **Domaine auto-détecté par ESSAI, jamais recalculé à la main par sous-type** — même principe que
 * `moteur6e/verificationCalculPrimitives.ts` (voir son en-tête, "Échantillonnage") : plutôt que de
 * dupliquer ici la connaissance du domaine de chacun des ~12 sous-types empruntables (pôle de
 * `1/x`, domaine de `arcsin`, exposant fractionnaire nécessitant x>0...), on teste un pool de
 * candidats "propres" (petits entiers puis petites fractions) et on ne retient que ceux où
 * `primitiveReference` est réellement fini — le filtre generique fonctionne identiquement quel que
 * soit le sous-type, sans jamais connaître sa formule.
 */

const CANDIDATS_ENTIERS: number[] = [1, 2, 3, -1, -2, -3];
const CANDIDATS_FRACTIONS: number[] = [0.5, -0.5, 0.25, -0.25, 0.75, -0.75, 1.5, -1.5];

function estFini(v: number): boolean {
  return Number.isFinite(v);
}

/** Restriction de magnitude documentée dans `moteur6e/verificationCalculPrimitives.ts`
 * (`pointsBEcran3`) : famille B avec u de type "puissance" (u=x^p+c) combiné à typeG="expU" produit
 * des primitives de magnitude ASTRONOMIQUE (e^(x³)) dès que |x| dépasse 1 — bornes restreintes aux
 * petites fractions dans ce cas précis, jamais les entiers ≥2. */
function primitiveEstAMagnitudeSure(primitive: ExerciceCalculPrimitives): boolean {
  return !(primitive.famille === "B" && primitive.typeU === "puissance");
}

/** Balayage fin de repli — même technique que `moteur6e/verificationCalculPrimitives.ts`
 * (`pointsBEcran3`, cas `invSqrtU`) : certains sous-types (typeG="invSqrtU"→arcsin(u) ou
 * typeG="invU"→ln|u|, combinés à un u affine dont le domaine sûr peut être un intervalle ÉTROIT
 * dépendant des paramètres tirés) ne laissent aucun point du petit pool "propre" ci-dessus dans leur
 * domaine — un balayage fin (pas 0.1) filtré directement sur `primitiveReference` retrouve un
 * intervalle sûr QUELS QUE SOIENT les paramètres tirés, sans jamais dupliquer ici la formule de
 * domaine d'un sous-type précis. */
function balayageFin(primitive: ExerciceCalculPrimitives): number[] {
  const points: number[] = [];
  for (let x = -8; x <= 8; x += 0.1) {
    const arrondi = Math.round(x * 10) / 10;
    if (estFini(primitive.primitiveReference(arrondi))) points.push(arrondi);
  }
  return points;
}

/** Choisit 2 bornes DISTINCTES, valides (F finie aux 2 points), a<b — voir en-tête de fichier. */
export function choisirBornesValides(primitive: ExerciceCalculPrimitives): [number, number] {
  const magnitudeSure = primitiveEstAMagnitudeSure(primitive);
  const pool = magnitudeSure ? [...CANDIDATS_ENTIERS, ...CANDIDATS_FRACTIONS] : [...CANDIDATS_FRACTIONS];
  const valides = pool.filter((x) => estFini(primitive.primitiveReference(x)));
  const entiers = valides.filter((x) => Number.isInteger(x));
  let finalPool = entiers.length >= 2 ? entiers : valides;
  if (finalPool.length < 2) {
    finalPool = balayageFin(primitive);
  }
  if (finalPool.length < 2) {
    throw new Error("choisirBornesValides : impossible de trouver 2 bornes valides pour cet exercice");
  }
  const x = tirerParmi(finalPool);
  let y = tirerParmi(finalPool);
  let tentatives = 0;
  while (y === x && tentatives < 30) {
    y = tirerParmi(finalPool);
    tentatives++;
  }
  if (y === x) {
    // dernier recours : prend un autre élément du pool par index (garanti distinct puisque
    // finalPool.length>=2).
    const autre = finalPool.find((v) => v !== x) as number;
    y = autre;
  }
  return x < y ? [x, y] : [y, x];
}
