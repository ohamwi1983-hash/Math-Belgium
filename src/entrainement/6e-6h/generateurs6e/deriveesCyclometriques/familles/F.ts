import type { ExerciceDeriveeF, TrigFamilleF } from "../../../core6e/deriveesCyclometriques.types";
import type { Arcfonction } from "../../../core6e/cyclometrique.types";
import { tirerEntier } from "../aleatoire";
import { MARGE_ARCFONCTION } from "../constantes";
import { chercherPointsValides } from "../pointsEchantillon";

const TENTATIVES_MAX = 300;

/** 4 combinaisons possibles, tirage PONDÉRÉ : les 2 paires "co-fonction" (sin∘arccos, cos∘arcsin
 * → identité √(1-u²)) sont privilégiées, les 2 paires "inverse directe" (cos∘arccos, sin∘arcsin →
 * identité u) restent une variété occasionnelle — spec explicite, aucun poids chiffré fourni. */
const COMBINAISONS: { trig: TrigFamilleF; arcfonction: Extract<Arcfonction, "arcsin" | "arccos">; poids: number }[] = [
  { trig: "sin", arcfonction: "arccos", poids: 35 },
  { trig: "cos", arcfonction: "arcsin", poids: 35 },
  { trig: "cos", arcfonction: "arccos", poids: 15 },
  { trig: "sin", arcfonction: "arcsin", poids: 15 },
];
const POIDS_TOTAL = COMBINAISONS.reduce((s, c) => s + c.poids, 0);

function tirerCombinaison(): { trig: TrigFamilleF; arcfonction: Extract<Arcfonction, "arcsin" | "arccos"> } {
  let tirage = Math.random() * POIDS_TOTAL;
  for (const combinaison of COMBINAISONS) {
    if (tirage < combinaison.poids) return combinaison;
    tirage -= combinaison.poids;
  }
  return COMBINAISONS[COMBINAISONS.length - 1];
}

/** Famille F — f(x) = trig(arcfonction(v(x))), v(x)=a·x. */
export function construireF(): ExerciceDeriveeF {
  for (let tentative = 0; tentative < TENTATIVES_MAX; tentative++) {
    const { trig, arcfonction } = tirerCombinaison();
    const a = tirerEntier(1, 4);

    const pointsEchantillonnage = chercherPointsValides((x) => Math.abs(a * x) < MARGE_ARCFONCTION);
    if (pointsEchantillonnage === null) continue;

    return { famille: "F", trig, arcfonction, a, pointsEchantillonnage };
  }
  throw new Error("construireF : aucune combinaison valide trouvée après retirage");
}
